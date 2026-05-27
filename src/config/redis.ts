import { config } from "./config.js";

export const redisConnection = {
  url: config.redis.url,
  maxRetriesPerRequest: null,
};
