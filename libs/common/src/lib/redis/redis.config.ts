import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  uri: process.env.REDIS_URI,
  encryptionKey:
    process.env.REDIS_ENCRYPTION_KEY ||
    'your-default-encryption-key-32-chars!!',
}));
