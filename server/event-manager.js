const SERVER_NAME = process.env.SERVER_NAME || 'SERVER_1';
const MQ_HOST = process.env.MQ_HOST || 'amqp://localhost';
const INCOMING_QUEUE = (process.env.INCOMING_QUEUE || "TD_EVENTS") + '_' + SERVER_NAME;

const MessageBroker = require('./message-broker');
const mb = new MessageBroker(MQ_HOST);

class EventManager {
    constructor() {
        
    }

    createEvent(data) {
        try {
            if (data.toString().length != 0) {
                mb.push(this.dataToJSON(data), INCOMING_QUEUE);
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