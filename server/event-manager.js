const constants = require('../lib/constants');
const MessageBroker = require('./message-broker');
const mb = new MessageBroker(constants.MQ_HOST);
const { v4: uuidv4 } = require('uuid');

class EventManager {
    constructor() {
        this.eventsQueue = constants.EVENTS_QUEUE;
        this.broadcastQueue = constants.BROADCAST_QUEUE;
    }

    createEvent(data) {
        try {
            if (data.toString().length != 0) {
                mb.push(this.dataToJSON(data),  this.eventsQueue);
            }
        } catch(err) {
            console.log(`Event Error: ${err}`);                
            console.log(`Event Data: ${data.toString()}`);
        }
    }

    broadcast(data) {
        try {
            if (data.toString().length != 0) {
                mb.push(this.dataToJSON(data), this.broadcastQueue);
            }
        } catch(err) {
            console.log(`Event Error: ${err}`);                
            console.log(`Event Data: ${data.toString()}`);
        }
    }

    

    validateEventObject(data) {

        // TO DO Validate Event Example: { status: "ok"|"error", event: EVENT_NAME, data: <any arbitrary data> }
    }

    buildEventObject(req, params) {
        let event = {};
        console.log(`Inside build event Object ${JSON.stringify(req.headers)}`);
        try {
            event.header = {};

            // Event ID
            event.header.eventID = uuidv4();

            // Event Correlation ID
            event.header.correlationID = uuidv4();

            // Status
            event.header.status = 'created';

            // Check if event has additional params
            if (params !== undefined) {
                // Overwrite Event ID
                event.header.eventID = (params.eventID !== undefined) ? params.eventID : event.header.eventID;

                // Overwrite Event Correlation ID
                event.header.correlationID = (params.correlationID !== undefined) ? params.correlationID : event.header.correlationID;

                // Event Type
                event.header.type = (params.type !== undefined) ? params.type : '';

                // Status
                event.header.status = (params.status !== undefined) ? status : event.header.status;

                // Include Initial Request Header
                event.reqHeaders = (params.reqHeaders) ? req.headers : '';
            }

            // Redelivered
            event.header.redelivered = false;

            // Timestamp 
            event.header.timestamp = (params.timestamp !== undefined) ? params.timestamp : Date.now();
            
            // Event Data
            event.data = req.body; 

            console.log(`Build event message: ${event}`);
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