import { LocalRoomManager } from './LocalRoomManager';

type Callback = (...args: any[]) => void;

export class LocalSocket {
  public id: string = 'local_player_vip';
  public connected: boolean = true;
  private listeners: Map<string, Callback[]> = new Map();
  private roomManager: LocalRoomManager;

  constructor(roomManager: LocalRoomManager) {
    this.roomManager = roomManager;
    this.roomManager.setSocket(this);

    // Trigger connect event asynchronously so listeners registered in useEffect can receive it
    setTimeout(() => {
      this.trigger('connect');
    }, 20);
  }

  public on(event: string, fn: Callback): this {
    const list = this.listeners.get(event) || [];
    list.push(fn);
    this.listeners.set(event, list);
    return this;
  }

  public off(event: string, fn?: Callback): this {
    if (!fn) {
      this.listeners.delete(event);
    } else {
      const list = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        list.filter(cb => cb !== fn)
      );
    }
    return this;
  }

  public trigger(event: string, ...args: any[]): void {
    const list = this.listeners.get(event) || [];
    list.forEach(cb => {
      try {
        cb(...args);
      } catch (err) {
        console.error(`Error in local socket listener for ${event}:`, err);
      }
    });
  }

  public emit(event: string, ...args: any[]): this {
    const data = args[0] || {};
    switch (event) {
      case 'wallet:sync': {
        const w = this.roomManager.walletManager.getOrCreateWallet(
          data.walletId,
          data.name,
          data.clientCachedBalance,
          false
        );
        this.trigger('wallet:updated', w);
        this.trigger('leaderboard:updated', this.roomManager.walletManager.getLeaderboard(15));
        break;
      }

      case 'joinRoom':
        this.roomManager.joinRoom(this, data);
        break;

      case 'sit':
        this.roomManager.sit(this, data);
        break;

      case 'rebuy':
        this.roomManager.rebuy(this, data);
        break;

      case 'leaveSeat':
        this.roomManager.leaveSeat(this);
        break;

      case 'playerAction':
        this.roomManager.playerAction(this, data);
        break;

      case 'addBot':
        this.roomManager.addBot(this);
        break;

      case 'kickBot':
        this.roomManager.kickBot(this, data);
        break;

      case 'tipPlayer':
        this.roomManager.tipPlayer(this, data);
        break;

      case 'toggleReady':
        this.roomManager.toggleReady(this);
        break;

      case 'sendChat':
        this.roomManager.sendChat(this, data);
        break;

      case 'wallet:claim-relief':
        this.roomManager.claimRelief(this, data);
        break;

      case 'lobby:update-outfit':
        if (data.name) {
          const updated = this.roomManager.walletManager.getOrCreateWallet(data.walletId, data.name);
          this.trigger('wallet:updated', updated);
        }
        break;

      default:
        break;
    }
    return this;
  }

  public to(_room: string): { emit: (event: string, ...args: any[]) => void } {
    return {
      emit: () => {}
    };
  }

  public disconnect(): void {
    this.connected = false;
  }
}

let singletonLocalSocket: LocalSocket | null = null;
let singletonRoomManager: LocalRoomManager | null = null;

export function getLocalRoomManager(): LocalRoomManager {
  if (!singletonRoomManager) {
    singletonRoomManager = new LocalRoomManager();
  }
  return singletonRoomManager;
}

export function getGameSocket(): LocalSocket {
  if (!singletonLocalSocket) {
    singletonLocalSocket = new LocalSocket(getLocalRoomManager());
  }
  return singletonLocalSocket;
}

