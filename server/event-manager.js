const constants = require('../lib/constants');
const Log = require('../lib/logger');
const Event = require('./event');
const MessageBroker = require('./message-broker');
const mb = new MessageBroker(constants.MQ_HOST);

class EventManager {
    constructor() {
        this.eventsQueue = constants.EVENTS_QUEUE;
        this.broadcastQueue = constants.BROADCAST_QUEUE;
    }

    storeEvent(data) {
        
        Log.info(`event.manager.store ${this.eventsQueue}`);
        /* Log.info(`event.manager.store.event.id ${JSON.parse(data).header.eventID}`);
        Log.info(`event.manager.store.event.correlation.id ${JSON.parse(data).header.correlationID}`); */
        
        this.pushToQueue(data, this.eventsQueue);
    }

    broadcastEvent(data) {
        
        Log.info(`event.manager.broadcast ${this.broadcastQueue}`);
        /* Log.info(`event.manager.broadcast.event.id ${data.header.eventID}`);
        Log.info(`event.manager.broadcast.event.correlation.id ${data.header.correlationID}`);*/

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