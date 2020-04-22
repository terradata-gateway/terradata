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
        logger.info(msg);
    } 

    static warn(msg) {
        logger.warn(msg);
    }

    static error(msg) {
        logger.error(msg);
    }

    static log(options) {
        logger.log(options);
    }

}

module.exports = Log;
