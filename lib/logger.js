const winston = require('winston');
const moment = require('moment');
const constants = require('../lib/constants');

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
        // logger.info(`${moment().format("YYYY-MM-DD HH:mm:ss.SSS")} ${constants.SERVER_NAME} ${msg}`);
        logger.info(Log.formatMsg(msg));
    } 

    static warn(msg) {
        logger.warn(Log.formatMsg(msg));
    }

    static error(msg) {
        logger.error(Log.formatMsg(msg));
    }

    static formatMsg(msg) {
        return `${moment().format("YYYY-MM-DD HH:mm:ss.SSS")} ${constants.SERVER_NAME} ${msg}`;
    }

    static log(options) {
        logger.log(options);
    }

}

module.exports = Log;
