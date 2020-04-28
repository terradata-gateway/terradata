const Log = require('../../lib/logger');
const Event = require('./event');
const MessageBroker = require('../../lib/message-broker');

const ENVIRONMENT = require('../../lib/constants/environment');
const EVENTS = require('../../lib/constants/events');
const mb = new MessageBroker(ENVIRONMENT.MQ_HOST);


class EventManager {
    constructor() {
        this.eventsQueue = ENVIRONMENT.EVENTS_QUEUE;
        this.broadcastQueue = ENVIRONMENT.BROADCAST_QUEUE;
    }
    
    distribute(data) {
        // Broadcast events are stored and broadcasted to all peers 
        if (data.header.type == EVENTS.EVENT_TYPE.BROADCAST) {
            this.saveEventToQueue(data);
            this.broadcastEventToQueue(data);
        }

        // Server events
        if (data.header.type == EVENTS.EVENT_TYPE.SERVER) {
            this.broadcastEventToQueue(data);
        }
    }


    saveEventToQueue(event) {
        Log.info(`event.manager.save.queue ${this.eventsQueue}`);
        
        this.pushToQueue(event, this.eventsQueue);
    }

    broadcastEventToQueue(event) {
        
        Log.info(`event.manager.broadcast.queue ${this.broadcastQueue}`);

        this.pushToQueue(event, this.broadcastQueue);
    }

    pushToQueue(data, queue) {
        try {
            if(Event.validateEventObject(data)) {
                mb.push(this.dataToJSON(data),  queue);
            } else {
                throw err;
            }
        } catch(err) {
            Log.error(`event.manager.push.queue.error ${queue} ${err}`);   
            Log.error(`event.manager.push.queue.error.data ${queue} ${JSON.stringify(data)}`); 
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