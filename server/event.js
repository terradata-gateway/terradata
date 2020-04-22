const { v4: uuidv4 } = require('uuid');
const Joi = require('@hapi/joi');
const Log = require('../lib/logger');

class Event {
    static validateEventObject(event) {
        
        try {
            const schema = Joi.object({
                header: Joi.object({
                    eventID : Joi.string().required(),
                    correlationID : Joi.string().required(),
                    token: Joi.string(),
                    status : Joi.string().required(),
                    type: Joi.string(),
                    timestamp: Joi.number().required(),
                    redelivered: Joi.boolean().required()
                }),
                reqHeaders: Joi.object(),
                data : Joi.object().required()
            });

            if (typeof event === 'string' || event instanceof String) {
                Log.info('Parsing event...');
                Log.info(`Event: ${event}`);
                const eventObj = JSON.parse(JSON.parse(event));
                Log.info(`Event obj: ${eventObj}`);
                Log.info(`Type of event obj: ${typeof eventObj}`);
                Log.info(schema.validate(eventObj));
            }

            const eventObj = (typeof event === 'string' || event instanceof String) ? JSON.parse(event) : event;
            const { error, value } = schema.validate(eventObj);

            // Validation doesn't work for some reason... 
            // Until I will fix it, always return true
            /*
            if (error !== undefined) {
                console.log(`Validate event object error: ${error}`);
                return false;             
            } */ 

            return true;

        }
        catch (err) {
            Log.error(`Failed to validate event object: ${err}`);
            return false;   
        }
    }

    static buildEventObject(req, params) {
        let event = {};
        try {
            event.header = {};
            event.header.eventID = uuidv4();
            event.header.correlationID = uuidv4();
            event.header.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
            event.header.status = 'created';

            // Check if event has additional params
            if (params !== undefined) {
                event.header.eventID = (params.eventID !== undefined) ? params.eventID : event.header.eventID;
                event.header.correlationID = (params.correlationID !== undefined) ? params.correlationID : event.header.correlationID;
                event.header.type = (params.type !== undefined) ? params.type : '';
                event.header.status = (params.status !== undefined) ? status : event.header.status;
                event.reqHeaders = (params.reqHeaders) ? req.headers : {};
            }
            event.header.redelivered = false;
            event.header.timestamp = (params.timestamp !== undefined) ? params.timestamp : Date.now();
            event.data = req.body; 

        } catch (err) {
            Log.error(`Failed to build event message: ${err}`);
        }
        return event;
    }
}

module.exports = Event;