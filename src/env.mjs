import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1).default('fallback-dev-secret-change-in-production'),
    NEXTAUTH_URL: z.string().url().optional(),
    ADMIN_USERNAME: z.string().optional().default('admin'),
    ADMIN_PASSWORD_HASH: z.string().optional(),
    TELEGRAM_BOT_TOKEN_1: z.string().optional(),
    TELEGRAM_BOT_TOKEN_2: z.string().optional(),
    TELEGRAM_BOT_TOKEN_3: z.string().optional(),
    TELEGRAM_CHANNEL_ID: z.string().optional(),
    UPLOADTHING_SECRET: z.string().optional(),
    UPLOADTHING_APP_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_TELEGRAM_CHANNEL_ID: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    TELEGRAM_BOT_TOKEN_1: process.env.TELEGRAM_BOT_TOKEN_1,
    TELEGRAM_BOT_TOKEN_2: process.env.TELEGRAM_BOT_TOKEN_2,
    TELEGRAM_BOT_TOKEN_3: process.env.TELEGRAM_BOT_TOKEN_3,
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    NEXT_PUBLIC_TELEGRAM_CHANNEL_ID: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID,
  },
});
