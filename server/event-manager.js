const constants = require('../lib/constants');
const MessageBroker = require('./message-broker');
const mb = new MessageBroker(constants.MQ_HOST);

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

    validateEvent(data) {

        // TO DO Validate Event Example: { status: "ok"|"error", event: EVENT_NAME, data: <any arbitrary data> }
    }

    dataToJSON(data) {
        if (Object.keys(data).length === 0 && data.constructor !== Object) {
            return JSON.parse(data);
        } 
        return data;
    }
  
}

module.exports = EventManager;