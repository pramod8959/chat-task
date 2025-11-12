// File: backend/src/services/socket.service.ts
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { config } from '../config';
import logger from '../config/logger';

/**
 * Configure Redis adapter for Socket.IO
 * This enables horizontal scaling with multiple server instances
 * 
 * SCALING NOTES:
 * - Use Redis adapter to sync events across multiple Socket.IO instances
 * - Enable sticky sessions in load balancer (same user always hits same instance)
 * - Or use Redis adapter without sticky sessions (recommended)
 */
export const setupRedisAdapter = (io: SocketIOServer): void => {
  try {
    const pubClient = new Redis(config.redisUrl);
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));

    logger.info('Redis adapter configured for Socket.IO');
  } catch (error) {
    logger.error('Failed to setup Redis adapter:', error);
    // Continue without Redis adapter in development
    if (config.nodeEnv === 'production') {
      throw error;
    }
  }
};

/**
 * User presence management using Redis
 * Tracks online/offline status across multiple server instances
 */
export class PresenceService {
  private redis: Redis;
  private readonly PRESENCE_KEY = 'presence:';
  private readonly PRESENCE_TTL = 60; // seconds

  constructor() {
    this.redis = new Redis(config.redisUrl);
  }

  /**
   * Mark user as online
   */
  async setOnline(userId: string, socketId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    await this.redis.setex(key, this.PRESENCE_TTL, socketId);
  }

  /**
   * Mark user as offline
   */
  async setOffline(userId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    await this.redis.del(key);
  }

  /**
   * Check if user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    const socketId = await this.redis.get(key);
    return socketId !== null;
  }

  /**
   * Refresh user presence (extend TTL)
   */
  async refreshPresence(userId: string): Promise<void> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    await this.redis.expire(key, this.PRESENCE_TTL);
  }

  /**
   * Get socket ID for user
   */
  async getSocketId(userId: string): Promise<string | null> {
    const key = `${this.PRESENCE_KEY}${userId}`;
    return await this.redis.get(key);
  }
}

export const presenceService = new PresenceService();
