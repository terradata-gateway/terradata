const SERVER_NAME = process.env.SERVER_NAME || 'SERVER_1';
const MQ_HOST = process.env.MQ_HOST || 'amqp://localhost';

const MessageBroker = require('./message-broker');
const mb = new MessageBroker(MQ_HOST);

class EventManager {
    constructor() {
        this.EVENTS_QUEUE = (process.env.INCOMING_QUEUE || "TD_EVENTS") + '_' + SERVER_NAME;
        this.BROADCAST_QUEUE = (process.env.INCOMING_QUEUE || "TD_BROADCAST") + '_' + SERVER_NAME;
    }

    createEvent(data) {
        try {
            if (data.toString().length != 0) {
                mb.push(this.dataToJSON(data), this.EVENTS_QUEUE);
            }
        } catch(err) {
            console.log(`Event Error: ${err}`);                
            console.log(`Event Data: ${data.toString()}`);
        }
    }

    broadcast(data) {
        try {
            if (data.toString().length != 0) {
                mb.push(this.dataToJSON(data), this.BROADCAST_QUEUE);
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