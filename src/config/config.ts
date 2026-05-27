import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const booleanString = z
  .string()
  .toLowerCase()
  .transform((val) => val === "true" || val === "1")
  .default(false);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8080),

  CORS_ORIGINS: z.string().optional(),

  LOG_DIR: z.string().default("logs"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("warn"),

  DATABASE_URL: z.string(),
  DATABASE_MAX_POOL: z.coerce.number().default(20),

  REDIS_URL: z.string(),

  ENABLE_FAILURE_MODE: booleanString,
  ENABLE_DELAY_MODE: booleanString,
  DELAY_MODE_DELAY: z.coerce.number().default(500),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

const env = parsed.data;

export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },
  cors: {
    origins: env.CORS_ORIGINS
      ? env.CORS_ORIGINS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  },
  logger: {
    logDir: env.LOG_DIR,
    logLevel: env.LOG_LEVEL,
  },
  database: {
    url: env.DATABASE_URL,
    maxPool: env.DATABASE_MAX_POOL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  flags: {
    isFailureModeEnabled: env.ENABLE_FAILURE_MODE,
    isDelayModeEnabled: env.ENABLE_DELAY_MODE,
    delayModeDelay: env.DELAY_MODE_DELAY,
  },
} as const;

export type Config = typeof config;
