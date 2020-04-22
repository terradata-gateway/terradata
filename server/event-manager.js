const constants = require('../lib/constants');
const Event = require('./event');
const MessageBroker = require('./message-broker');
const mb = new MessageBroker(constants.MQ_HOST);


class EventManager {
    constructor() {
        this.eventsQueue = constants.EVENTS_QUEUE;
        this.broadcastQueue = constants.BROADCAST_QUEUE;
    }

    storeEvent(data) {
        this.pushToQueue(data, this.eventsQueue);
    }

    broadcastEvent(data) {
        this.pushToQueue(data, this.broadcastQueue);
    }

    pushToQueue(data, queue) {
        try {
            if(Event.validateEventObject(data)) {
                mb.push(this.dataToJSON(data),  queue);
            } else {
                throw err;
            }
        } catch(err) {
            console.log(`Push event to queue error: ${err}`);                
            console.log(`Push event to queue data: ${JSON.stringify(data)}`);
        }
    }

    dataToJSON(data) {
        if (Object.keys(data).length === 0 && data.constructor !== Object) {
            return JSON.parse(data);
        } 
        return data;
    }
}

module.exports = EventManager;