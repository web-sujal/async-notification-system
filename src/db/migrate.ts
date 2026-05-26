import fs from "fs";
import path from "path";

import { sql } from "../config/db.js";
import logger from "../config/logger.js";

const runMigration = async (): Promise<void> => {
  logger.info("🚀 Starting database migrations...");

  try {
    // 1. Create tracking table if not exists
    await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT NOT NULL PRIMARY KEY,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`;

    // 2. Read and sort migration files from migrations directory
    const migrationsDir = path.join(process.cwd(), "migrations");
    const files = fs.readdirSync(migrationsDir);
    const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

    // 3. Execute each migration file that hasn't been applied
    for (const file of sqlFiles) {
      const version = file.replace(".sql", "");

      const [alreadyExecuted] = await sql`
        SELECT version FROM schema_migrations WHERE version = ${version}
        `;

      if (alreadyExecuted) {
        logger.info(`⏩ Skipping ${version} (already executed)...`);
        continue;
      }

      logger.info(`⚙️ Executing ${version}...`);

      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf8");

      // Execute the raw sql inside a transaction
      await sql.begin(async (tx) => {
        await tx.unsafe(`${sqlContent}`);
        await tx`INSERT INTO schema_migrations (version) VALUES (${version});`;
      });

      logger.info(`✅ Successfully executed ${version}...`);
    }

    logger.info("✨ All migrations completed successfully!");
  } catch (err) {
    logger.error("❌ Failed to run migrations:", err);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
};

runMigration();
