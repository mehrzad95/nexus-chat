import * as dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  messageHistoryLimit: 50,
} as const;