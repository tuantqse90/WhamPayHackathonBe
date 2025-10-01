import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EncryptionUtil } from '../utils/encryption.util';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly encryptionKey: string;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      username: this.configService.get('redis.username'),
      password: this.configService.get('redis.password'),
    });

    // Get encryption key from config or use a default one
    this.encryptionKey =
      this.configService.get('redis.encryptionKey') ||
      'your-default-encryption-key-32-chars!!';
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  // Get value by key
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  // Set key-value pair with optional expiry (in seconds)
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.redis.set(key, value, 'EX', ttl);
    }
    return await this.redis.set(key, value);
  }

  // Delete key
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  // Check if key exists
  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  // Set expiry on key (in seconds)
  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  // Get the Redis client instance (for advanced operations)
  getClient(): Redis {
    return this.redis;
  }

  // Set encrypted value in cache
  async setEncrypted(key: string, value: string, ttl?: number): Promise<'OK'> {
    const encryptedValue = EncryptionUtil.encrypt(value, this.encryptionKey);
    return await this.set(key, encryptedValue, ttl);
  }

  // Get and decrypt value from cache
  async getEncrypted(key: string): Promise<string | null> {
    const encryptedValue = await this.get(key);
    if (!encryptedValue) return null;
    return EncryptionUtil.decrypt(encryptedValue, this.encryptionKey);
  }
}
