const constants = require('../lib/constants');
const MessageBroker = require('./message-broker');
const mb = new MessageBroker(constants.MQ_HOST);
const { v4: uuidv4 } = require('uuid');
const Joi = require('@hapi/joi');

class EventManager {
    constructor() {
        this.eventsQueue = constants.EVENTS_QUEUE;
        this.broadcastQueue = constants.BROADCAST_QUEUE;
    }

    createEvent(data) {
        this.pushToQueue(data, this.eventsQueue);
    }

    broadcast(data) {
        this.pushToQueue(data, this.broadcastQueue);
    }

    pushToQueue(data, queue) {
        try {
            if(this.validateEventObject(data)) {
                mb.push(this.dataToJSON(data),  queue);
            } else {
                throw err;
            }
        } catch(err) {
            console.log(`Push event to queue error: ${err}`);                
            console.log(`Push event to queue data: ${JSON.stringify(data)}`);
        }
    }

    validateEventObject(event) {
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
                console.log('Parsing event...');
                console.log(`Event: ${event}`);
                const eventObj = JSON.parse(JSON.parse(event));
                console.log(`Event obj: ${eventObj}`);
                console.log(`Type of event obj: ${typeof eventObj}`);
                console.log(schema.validate(eventObj));
            }

            const eventObj = (typeof event === 'string' || event instanceof String) ? JSON.parse(event) : event;
            const { error, value } = schema.validate(eventObj);

            if (error !== undefined) {
                console.log(`Validate event object error: ${error}`);
                return false;             
            }

            return true;

        }
        catch (err) {
            console.log(`Failed to validate event object: ${err}`);
            return false;   
        }
    }

    buildEventObject(req, params) {
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
            console.log(`Failed to build event message: ${err}`);
        }
        return event;
    }

    dataToJSON(data) {
        if (Object.keys(data).length === 0 && data.constructor !== Object) {
            return JSON.parse(data);
        } 
        return data;
    }
}

module.exports = EventManager;