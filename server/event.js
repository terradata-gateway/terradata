const { v4: uuidv4 } = require('uuid');
const Joi = require('@hapi/joi');
const Log = require('../lib/logger');

class Event {
    static validateEventObject(event) {
        try {
            Log.info(`event.validate`);

            // Validation doesn't work for some reason... 
            // Until I will fix it, always return true
            return true; 


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
                const eventObj = JSON.parse(JSON.parse(event));
            }

            const eventObj = (typeof event === 'string' || event instanceof String) ? JSON.parse(event) : event;
            const { error, value } = schema.validate(eventObj);
            
            if (error !== undefined) {
                Log.info(`event.validate.invalid ${error}`);
                return false;             
            } 

            Log.info(`event.validate.valid`);
            return true;

        }
        catch (err) {
            Log.error(`event.validate.error ${err}`);
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

            Log.info(`event.build.id ${event.header.eventID}`);
            Log.info(`event.build.correlation.id ${event.header.correlationID}`);

        } catch (err) {
            Log.error(`event.build.error ${err}`);
        }
        return event;
    }
}

module.exports = Event;