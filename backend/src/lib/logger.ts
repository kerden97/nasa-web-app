import winston from 'winston'

const isTestEnv = process.env.JEST_WORKER_ID !== undefined

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  silent: isTestEnv,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

export default logger
