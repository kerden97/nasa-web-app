import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const isTestEnv = process.env.JEST_WORKER_ID !== undefined

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  silent: isTestEnv,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new DailyRotateFile({
      dirname: path.join(__dirname, '..', '..', 'logs'),
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '7d',
    }),
  ],
})

export default logger
