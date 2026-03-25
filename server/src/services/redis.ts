import { createClient } from 'redis';
import { config } from '../config/env';
import { Message } from '../types';

type RedisClient = ReturnType<typeof createClient>;

class RedisService {
  private publisher: RedisClient;
  private subscriber: RedisClient;
  private readonly ROOM_PREFIX = 'room:messages:';

  constructor() {
    this.publisher = createClient({ url: config.redisUrl });
    this.subscriber = this.publisher.duplicate();
  }

  async connect(): Promise<void> {
    await Promise.all([
      this.publisher.connect(),
      this.subscriber.connect(),
    ]);
    console.log('[Redis] Connected — publisher and subscriber ready');
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }

  async publishMessage(roomId: string, message: Message): Promise<void> {
    await this.publisher.publish(roomId, JSON.stringify(message));
  }

  async subscribeToRoom(
    roomId: string,
    handler: (message: Message) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(roomId, (raw) => {
      try {
        const message = JSON.parse(raw) as Message;
        handler(message);
      } catch {
        console.error('[Redis] Failed to parse message from channel:', roomId);
      }
    });
  }

  async unsubscribeFromRoom(roomId: string): Promise<void> {
    await this.subscriber.unsubscribe(roomId);
  }

  async saveMessage(message: Message): Promise<void> {
    const key = `${this.ROOM_PREFIX}${message.roomId}`;
    await this.publisher.rPush(key, JSON.stringify(message));
    await this.publisher.lTrim(key, -config.messageHistoryLimit, -1);
  }

  async getMessageHistory(roomId: string): Promise<Message[]> {
    const key = `${this.ROOM_PREFIX}${roomId}`;
    const raw = await this.publisher.lRange(key, 0, -1);
    return raw.map((item) => JSON.parse(item) as Message);
  }

  async setUserOnline(roomId: string, userId: string, username: string): Promise<void> {
    await this.publisher.hSet(`room:members:${roomId}`, userId, username);
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    await this.publisher.hDel(`room:members:${roomId}`, userId);
  }

  async getRoomMembers(roomId: string): Promise<{ id: string; username: string }[]> {
    const members = await this.publisher.hGetAll(`room:members:${roomId}`);
    return Object.entries(members).map(([id, username]) => ({ id, username }));
  }
}

export const redisService = new RedisService();