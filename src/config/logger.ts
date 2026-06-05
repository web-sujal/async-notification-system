import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createLogger, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { config } from "../config/config.js";

const logsDir = path.join(process.cwd(), "logs");
const loggerFile = fileURLToPath(import.meta.url);

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevel =
  config.server.nodeEnv === "development" ? "debug" : config.logger.logLevel;

function toSourcePath(filePath: string): string {
  let sourcePath = filePath.replace(/^file:\/\//, "");

  if (sourcePath.includes(`${path.sep}dist${path.sep}`)) {
    sourcePath = sourcePath.replace(
      `${path.sep}dist${path.sep}`,
      `${path.sep}src${path.sep}`,
    );
  }

  if (sourcePath.endsWith(".js") || sourcePath.endsWith(".mjs")) {
    sourcePath = sourcePath.replace(/\.(js|mjs)$/, ".ts");
  }

  const relative = path.relative(process.cwd(), sourcePath);
  return relative.startsWith("..") ? sourcePath : relative;
}

function shouldSkipStackFrame(file: string): boolean {
  const resolved = path.resolve(file.replace(/^file:\/\//, ""));

  return (
    file.includes("node_modules") ||
    file.includes("node:") ||
    file.startsWith("[") ||
    file === "evalmachine.<anonymous>" ||
    resolved === loggerFile
  );
}

function getLogPath(): string {
  const originalStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 20;

  const error = {} as Error;
  Error.captureStackTrace(error, getLogPath);

  Error.stackTraceLimit = originalStackTraceLimit;

  for (const line of error.stack?.split("\n").slice(1) ?? []) {
    const match =
      line.match(/\(([^)]+):(\d+):\d+\)/) ??
      line.match(/at (?:async )?(?:file:\/\/\/)?([^:]+):(\d+):\d+/);

    if (!match) continue;

    const file = match[1];
    const lineNumber = match[2];

    if (shouldSkipStackFrame(file)) continue;

    return `${toSourcePath(file)}:${lineNumber}`;
  }

  return "unknown:0";
}

const fileLineFormat = format((info) => {
  info.logpath = getLogPath();
  info.service = config.logger.serviceName;
  return info;
});

const lineFormat = format.printf((info) => {
  const timestamp =
    info.level === "debug"
      ? Date.now().toString()
      : (info.timestamp as string);

  const message =
    info.stack ??
    (typeof info.message === "string"
      ? info.message
      : JSON.stringify(info.message));

  return `${timestamp} [${info.service}] [${info.logpath}] ${info.level.toUpperCase()}:\t${message}`;
});

const logFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp(),
  fileLineFormat(),
  lineFormat,
);

function createRotatingTransport(
  filename: string,
  level: string,
): DailyRotateFile {
  return new DailyRotateFile({
    level,
    filename: path.join(logsDir, filename),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
    createSymlink: true,
    symlinkName: filename,
    format: logFormat,
  });
}

const combinedTransport = createRotatingTransport("combined.log", logLevel);
const infoTransport = createRotatingTransport("info.log", "info");
const errorTransport = createRotatingTransport("error.log", "error");

const logger = createLogger({
  level: logLevel,
  transports: [combinedTransport, infoTransport, errorTransport],
  exceptionHandlers: [errorTransport, combinedTransport],
  rejectionHandlers: [errorTransport, combinedTransport],
  exitOnError: false,
});

export default logger;
