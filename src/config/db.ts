import postgres from "postgres";

import { config } from "./config.js";
import logger from "./logger.js";

export const sql = postgres(config.database.url, {
  max: config.database.maxPool,
});

export async function connectDb(): Promise<void> {
  try {
    const [{ current_database }] = await sql`SELECT current_database()`;

    console.log("Connected to database: ", current_database);
    logger.info(`Connected to database: ${current_database}`);
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    await sql.end({ timeout: 5 });
    throw error;
  }
}
