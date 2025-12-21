"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// script/logger.ts
const promises_1 = __importDefault(require("fs/promises")); // Renamed for clarity
const fs_1 = __importDefault(require("fs")); // Add synchronous fs for mkdirSync
const path_1 = __importDefault(require("path"));
const LOG_DIR = path_1.default.join(__dirname, 'logs');
let writeQueue = [];
let isWriting = false;
async function enqueueWrite(fn) {
    return new Promise((resolve, reject) => {
        writeQueue.push({ fn, resolve, reject });
        processQueue();
    });
}
async function processQueue() {
    if (isWriting || writeQueue.length === 0)
        return;
    isWriting = true;
    const item = writeQueue.shift();
    try {
        await item.fn();
        item.resolve();
    }
    catch (error) {
        item.reject(error);
    }
    finally {
        isWriting = false;
        if (writeQueue.length > 0)
            processQueue();
    }
}
function ensureLogDir() {
    fs_1.default.mkdirSync(LOG_DIR, { recursive: true }); // Synchronous to ensure it happens immediately; throws on error (e.g., permissions)
}
function getLogFilePath() {
    const now = new Date();
    const dateStr = now
        .toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
        .replace(/\//g, '-');
    return path_1.default.join(LOG_DIR, `logs-${dateStr}.log`);
}
async function writeToFile(level, message, meta = {}, timestamp) {
    return enqueueWrite(async () => {
        try {
            ensureLogDir();
            const logFile = getLogFilePath();
            const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}\n`;
            await promises_1.default.appendFile(logFile, logEntry, 'utf8');
        }
        catch (error) {
            console._originalError('Logger write error:', error); // Use original to avoid recursion
        }
    });
}
async function writeLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    await writeToFile(level, message, meta, timestamp);
    const consoleMethod = level === 'error'
        ? console._originalError
        : level === 'warn'
            ? console._originalWarn
            : console._originalLog;
    consoleMethod(logEntry, Object.keys(meta).length ? meta : '');
}
class Logger {
    info(message, meta = {}) {
        return writeLog('info', message, meta);
    }
    warn(message, meta = {}) {
        return writeLog('warn', message, meta);
    }
    error(message, error = null, meta = {}) {
        const fullMessage = error ? `${message}: ${error.message}` : message;
        const fullMeta = { ...meta, stack: error ? error.stack : undefined };
        return writeLog('error', fullMessage, fullMeta);
    }
    debug(message, meta = {}) {
        return writeLog('debug', message, meta);
    }
}
const logger = new Logger();
(function patchConsole() {
    console._originalLog = console.log;
    console._originalError = console.error;
    console._originalWarn = console.warn;
    console._originalDebug = console.debug;
    console.log = (...args) => {
        logger.info(args.join(' '));
        console._originalLog(...args);
    };
    console.warn = (...args) => {
        logger.warn(args.join(' '));
        console._originalWarn(...args);
    };
    console.error = (...args) => {
        logger.error(args.join(' '));
        console._originalError(...args);
    };
    console.debug = (...args) => {
        logger.debug(args.join(' '));
        console._originalDebug(...args);
    };
})();
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason);
});
exports.default = logger;
console.log("on logger");
