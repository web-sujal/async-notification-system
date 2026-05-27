import "dotenv/config";

import { connectDb } from "./config/db.js";
import logger from "./config/logger.js";
import { startOutboxRelay } from "./relay/outbox.relay.js";

async function bootstrap() {
  await connectDb();
  await startOutboxRelay();
}

bootstrap().catch((err) => {
  console.error("Failed to start outbox relay:", err);
  logger.error("Failed to start outbox relay:", err);
  process.exit(1);
});
