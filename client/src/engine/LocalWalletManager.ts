import { WalletRecord } from './types';

export const DEFAULT_INITIAL_BALANCE = 1_000_000; // Rp 1.000.000

const MOCK_LEADERBOARD_BOTS: WalletRecord[] = [
  { walletId: 'bot_sultan', name: 'Sultan Andara', balance: 18500000, wins: 42, handsPlayed: 110, isBot: true, updatedAt: Date.now() },
  { walletId: 'bot_ratu', name: 'Ratu Poker ♠', balance: 12200000, wins: 31, handsPlayed: 85, isBot: true, updatedAt: Date.now() },
  { walletId: 'bot_elon', name: 'Lord Elon', balance: 9800000, wins: 24, handsPlayed: 60, isBot: true, updatedAt: Date.now() },
  { walletId: 'bot_choky', name: 'Choky All-In', balance: 7500000, wins: 19, handsPlayed: 55, isBot: true, updatedAt: Date.now() },
  { walletId: 'bot_budi', name: 'Budi VIP', balance: 5400000, wins: 15, handsPlayed: 45, isBot: true, updatedAt: Date.now() },
  { walletId: 'bot_siti', name: 'Siti Pro', balance: 4100000, wins: 12, handsPlayed: 38, isBot: true, updatedAt: Date.now() },
  { walletId: 'bot_dono', name: 'Dono Kasino', balance: 3200000, wins: 9, handsPlayed: 30, isBot: true, updatedAt: Date.now() }
];

export class LocalWalletManager {
  private localRecord: WalletRecord;

  constructor() {
    let balance = DEFAULT_INITIAL_BALANCE;
    let wins = 0;
    let hands = 0;
    let name = 'Pemain VIP';

    try {
      const storedBalance = localStorage.getItem('poker_wallet_balance');
      if (storedBalance !== null) {
        const parsed = Number(storedBalance);
        if (!Number.isNaN(parsed)) balance = parsed;
      }
      const storedWins = localStorage.getItem('poker_wallet_wins');
      if (storedWins !== null) {
        const parsed = Number(storedWins);
        if (!Number.isNaN(parsed)) wins = parsed;
      }
      const storedHands = localStorage.getItem('poker_wallet_hands');
      if (storedHands !== null) {
        const parsed = Number(storedHands);
        if (!Number.isNaN(parsed)) hands = parsed;
      }
      const storedName = localStorage.getItem('poker_player_name');
      if (storedName) name = storedName;
    } catch {}

    this.localRecord = {
      walletId: 'local_wallet',
      name,
      balance,
      wins,
      handsPlayed: hands,
      isBot: false,
      updatedAt: Date.now(),
      tableChips: 0
    };
  }

  public getOrCreateWallet(
    _walletId?: string,
    name?: string,
    clientCachedBalance?: number,
    isBot?: boolean
  ): WalletRecord {
    if (isBot) {
      return {
        walletId: `bot_${Math.random()}`,
        name: name || 'Bot AI',
        balance: 1000000,
        wins: 0,
        handsPlayed: 0,
        isBot: true,
        updatedAt: Date.now(),
        tableChips: 0
      };
    }
    if (name && name.trim()) {
      this.localRecord.name = name.trim();
    }
    if (typeof clientCachedBalance === 'number' && !Number.isNaN(clientCachedBalance) && this.localRecord.balance <= 0 && clientCachedBalance > 0) {
      this.localRecord.balance = clientCachedBalance;
      this.save();
    }
    return { ...this.localRecord };
  }

  public syncTableChips(
    _walletId: string | undefined,
    _name: string,
    tableChips: number,
    isBot?: boolean
  ): WalletRecord {
    if (isBot) {
      return {
        walletId: 'bot',
        name: _name,
        balance: 1000000,
        wins: 0,
        handsPlayed: 0,
        isBot: true,
        updatedAt: Date.now(),
        tableChips
      };
    }
    this.localRecord.tableChips = tableChips;
    this.localRecord.handsPlayed += 1;
    this.save();
    return { ...this.localRecord };
  }

  public recordWin(_walletId: string | undefined, _name: string, isBot?: boolean): void {
    if (!isBot) {
      this.localRecord.wins += 1;
      this.save();
    }
  }

  public cashOutFromTable(
    _walletId: string | undefined,
    _name: string,
    chips: number,
    isBot?: boolean
  ): WalletRecord {
    if (!isBot) {
      this.localRecord.balance += chips;
      this.localRecord.tableChips = 0;
      this.save();
    }
    return { ...this.localRecord };
  }

  public claimRelief(_walletId: string | undefined, _name?: string): WalletRecord {
    this.localRecord.balance = DEFAULT_INITIAL_BALANCE;
    this.localRecord.tableChips = 0;
    this.save();
    return { ...this.localRecord };
  }

  public deductBalance(amount: number): boolean {
    if (this.localRecord.balance < amount) return false;
    this.localRecord.balance -= amount;
    this.save();
    return true;
  }

  public addBalance(amount: number): void {
    this.localRecord.balance += amount;
    this.save();
  }

  public getLeaderboard(limit: number = 10): WalletRecord[] {
    const list = [
      { ...this.localRecord, balance: this.localRecord.balance + (this.localRecord.tableChips || 0) },
      ...MOCK_LEADERBOARD_BOTS
    ];
    list.sort((a, b) => b.balance - a.balance);
    return list.slice(0, limit);
  }

  private save(): void {
    try {
      localStorage.setItem('poker_wallet_balance', String(this.localRecord.balance));
      localStorage.setItem('poker_wallet_wins', String(this.localRecord.wins));
      localStorage.setItem('poker_wallet_hands', String(this.localRecord.handsPlayed));
      localStorage.setItem('poker_player_name', this.localRecord.name);
    } catch {}
  }
}

