import { createLogger, format, transports } from 'winston'

const loggingFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZ' }),
    format.json(),
)

const logger = createLogger({
    level: 'info',
    format: loggingFormat
})

if (process.env.ENABLE_FILE_LOGS) {
    logger.add(new transports.File({ filename: 'logs/error.log', level: 'error' }))
    logger.add(new transports.File({ filename: 'logs/info.log', level: 'info' }))
    logger.add(new transports.File({ filename: 'logs/debug.log', level: 'debug' }))
}

if (process.env.DISABLE_CONSOLE_LOGS !== 'true') {
    logger.add(new transports.Console({
        format: loggingFormat,
    }))
}

export default logger
