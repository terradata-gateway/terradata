const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/server.log' }),
        new winston.transports.Console()
    ]
});

class Log {
    constructor() {
    }

    static info(msg) {
        logger.info(`${Date()} ${msg}`);
    } 

    static warn(msg) {
        logger.warn(`${Date()} ${msg}`);
    }

    static error(msg) {
        logger.error(`${Date()} ${msg}`);
    }

    static log(options) {
        logger.log(options);
    }

}

module.exports = Log;
