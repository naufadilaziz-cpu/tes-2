import { PokerTable } from './PokerTable';
import { ChatMessage, PlayerPrivate, RoomInfo } from './types';
import { LocalWalletManager, DEFAULT_INITIAL_BALANCE } from './LocalWalletManager';
import { LocalSocket } from './LocalSocket';

export class LocalRoomManager {
  private tables: Map<string, PokerTable> = new Map();
  public walletManager: LocalWalletManager;
  private currentSocket: LocalSocket | null = null;
  private activeRoomId: string = 'meja-1';

  constructor() {
    this.walletManager = new LocalWalletManager();
    this.getOrCreateTable('meja-1', 'Meja Santai #1', { smallBlind: 1000, bigBlind: 2000, startingChips: 1000000 });
    this.getOrCreateTable('meja-2', 'Meja Reguler #2', { smallBlind: 2500, bigBlind: 5000, startingChips: 1000000 });
    this.getOrCreateTable('meja-vip', 'Meja VIP High Roller', { smallBlind: 10000, bigBlind: 20000, startingChips: 1000000 });
    this.getOrCreateTable('meja-turnamen', 'Meja Turnamen Royale', { smallBlind: 25000, bigBlind: 50000, startingChips: 1000000 });
  }

  public setSocket(socket: LocalSocket): void {
    this.currentSocket = socket;
  }

  public getOrCreateTable(
    roomId: string,
    roomName?: string,
    options?: { smallBlind?: number; bigBlind?: number; startingChips?: number }
  ): PokerTable {
    const cleanId = roomId.trim().toLowerCase();
    let table = this.tables.get(cleanId);
    if (!table) {
      table = new PokerTable({
        roomId: cleanId,
        roomName: roomName || `Meja ${cleanId.toUpperCase()}`,
        startingChips: options?.startingChips || DEFAULT_INITIAL_BALANCE,
        smallBlind: options?.smallBlind || 1000,
        bigBlind: options?.bigBlind || 2000,
        onStateChange: () => this.broadcastTableState(cleanId),
        onChatMessage: (msg: ChatMessage) => this.broadcastChatMessage(cleanId, msg),
        onWalletSync: (player: PlayerPrivate, didWin?: boolean) => this.handlePlayerWalletSync(player, didWin),
        onPlayerLeaveSeat: (player: PlayerPrivate) => this.handlePlayerLeaveSeat(player)
      });
      this.tables.set(cleanId, table);
    }
    return table;
  }

  private broadcastTableState(roomId: string): void {
    if (this.currentSocket && this.activeRoomId === roomId) {
      const table = this.tables.get(roomId);
      if (table) {
        this.currentSocket.trigger('tableState', table.getPublicState());
        this.currentSocket.trigger('myCards', table.getPlayerCards(this.currentSocket.id));
      }
    }
  }

  private broadcastChatMessage(roomId: string, msg: ChatMessage): void {
    if (this.currentSocket && this.activeRoomId === roomId) {
      this.currentSocket.trigger('chatMessage', msg);
    }
  }

  private handlePlayerWalletSync(player: PlayerPrivate, didWin?: boolean): void {
    const record = this.walletManager.syncTableChips(
      player.walletId,
      player.name,
      player.chips,
      player.isBot
    );
    if (didWin) {
      this.walletManager.recordWin(player.walletId, player.name, player.isBot);
    }
    if (!player.isBot && this.currentSocket) {
      this.currentSocket.trigger('wallet:updated', record);
      this.currentSocket.trigger('leaderboard:updated', this.walletManager.getLeaderboard(15));
    }
  }

  private handlePlayerLeaveSeat(player: PlayerPrivate): void {
    const record = this.walletManager.cashOutFromTable(
      player.walletId,
      player.name,
      player.chips,
      player.isBot
    );
    if (!player.isBot && this.currentSocket) {
      this.currentSocket.trigger('wallet:updated', record);
      this.currentSocket.trigger('wallet:cashed-out', {
        cashedOutChips: player.chips,
        newWalletBalance: record.balance
      });
      this.currentSocket.trigger('leaderboard:updated', this.walletManager.getLeaderboard(15));
    }
  }

  public joinRoom(socket: LocalSocket, { roomId, playerName, walletId, clientCachedBalance }: any): void {
    const cleanId = (roomId || 'meja-1').trim().toLowerCase();
    this.activeRoomId = cleanId;
    const table = this.getOrCreateTable(cleanId);

    const walletRecord = this.walletManager.getOrCreateWallet(
      walletId,
      playerName || 'Pemain',
      clientCachedBalance,
      false
    );

    // Auto-seed 3 bots if table is empty so player has opponents right away!
    const activeSeats = table.getPublicState().seats.filter(Boolean);
    if (activeSeats.length === 0) {
      table.addBot();
      table.addBot();
      table.addBot();
    }

    socket.trigger('tableState', table.getPublicState());
    socket.trigger('myCards', table.getPlayerCards(socket.id));
    socket.trigger('wallet:updated', walletRecord);
    socket.trigger('leaderboard:updated', this.walletManager.getLeaderboard(15));
  }

  public sit(socket: LocalSocket, { seatIndex, playerName, walletId, buyInAmount }: any): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;

    const record = this.walletManager.getOrCreateWallet(walletId, playerName);
    const amount = Number(buyInAmount) || table.startingChips;

    if (record.balance < amount) {
      socket.trigger('errorAlert', `Saldo dompet tidak cukup! Butuh Rp ${amount.toLocaleString('id-ID')}, saldo Anda Rp ${record.balance.toLocaleString('id-ID')}`);
      return;
    }

    this.walletManager.deductBalance(amount);
    socket.trigger('wallet:updated', this.walletManager.getOrCreateWallet());

    const result = table.sit(seatIndex, {
      id: socket.id,
      name: playerName || record.name,
      chips: amount,
      walletId: record.walletId,
      isBot: false
    });

    if (!result.success) {
      this.walletManager.addBalance(amount);
      socket.trigger('wallet:updated', this.walletManager.getOrCreateWallet());
      socket.trigger('errorAlert', result.error || 'Gagal duduk di kursi meja');
    }
  }

  public rebuy(socket: LocalSocket, { buyInAmount }: any): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;

    const amount = Number(buyInAmount) || table.startingChips;
    const record = this.walletManager.getOrCreateWallet();

    if (record.balance < amount) {
      socket.trigger('errorAlert', `Saldo dompet tidak cukup untuk Rebuy Rp ${amount.toLocaleString('id-ID')}! Silakan ambil bantuan gratis di loket kasir.`);
      return;
    }

    this.walletManager.deductBalance(amount);
    socket.trigger('wallet:updated', this.walletManager.getOrCreateWallet());

    const result = table.rebuy(socket.id, amount);
    if (!result.success) {
      this.walletManager.addBalance(amount);
      socket.trigger('wallet:updated', this.walletManager.getOrCreateWallet());
      socket.trigger('errorAlert', result.error || 'Gagal melakukan rebuy');
    }
  }

  public leaveSeat(socket: LocalSocket): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    table.leave(socket.id);
  }

  public playerAction(socket: LocalSocket, { action, amount }: any): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    table.handlePlayerAction(socket.id, action, amount);
  }

  public addBot(socket: LocalSocket): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    const res = table.addBot();
    if (!res.success) {
      socket.trigger('errorAlert', res.error || 'Tidak dapat menambah bot');
    }
  }

  public kickBot(socket: LocalSocket, { seatIndex }: any): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    const res = table.kickBot(seatIndex);
    if (!res.success) {
      socket.trigger('errorAlert', res.error || 'Gagal mengeluarkan bot');
    }
  }

  public tipPlayer(socket: LocalSocket, { targetSeatIndex, amount }: any): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    table.tipPlayer(socket.id, targetSeatIndex, amount);
  }

  public toggleReady(socket: LocalSocket): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    table.toggleReady(socket.id);
  }

  public sendChat(socket: LocalSocket, { message, senderName }: any): void {
    const table = this.tables.get(this.activeRoomId);
    if (!table) return;
    table.sendChat(senderName, message);
  }

  public claimRelief(socket: LocalSocket, { walletId, name }: any): void {
    const record = this.walletManager.getOrCreateWallet(walletId, name);
    const totalWealth = record.balance + (record.tableChips || 0);
    if (totalWealth > 0) {
      socket.trigger('errorAlert', 'Isi ulang bantuan kasir hanya bisa dilakukan jika saldo Anda Rp 0!');
      return;
    }
    const updated = this.walletManager.claimRelief(walletId, name);
    socket.trigger('wallet:updated', updated);
    socket.trigger('chatMessage', {
      id: `relief_${Date.now()}`,
      senderName: 'Kasir VIP',
      message: `Selamat, ${record.name}! Bantuan chip gratis Rp ${DEFAULT_INITIAL_BALANCE.toLocaleString('id-ID')} telah masuk ke dompet Anda.`,
      timestamp: Date.now(),
      isSystem: true
    });
  }

  public listRooms(): RoomInfo[] {
    const list: RoomInfo[] = [];
    for (const [id, table] of this.tables.entries()) {
      const state = table.getPublicState();
      list.push({
        roomId: id,
        name: state.roomName,
        playerCount: state.seats.filter(Boolean).length,
        maxSeats: 8,
        stage: state.stage,
        smallBlind: state.smallBlind,
        bigBlind: state.bigBlind,
        startingChips: state.startingChips
      });
    }
    return list;
  }
}

