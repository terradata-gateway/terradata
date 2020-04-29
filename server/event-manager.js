// Load modules
const Log = require('../lib/logger');
const Event = require('./event');
const MessageBroker = require('../lib/message-broker');

// Load constants
const ENVIRONMENT = require('../lib/constants/environment');
const EVENT = require('../lib/constants/event');
const broker = new MessageBroker(ENVIRONMENT.MQ_HOST);

class EventManager {
	constructor() {
		this.eventsQueue = ENVIRONMENT.EVENTS_QUEUE;
		this.broadcastQueue = ENVIRONMENT.BROADCAST_QUEUE;
	}

	distribute(event) {
		// Broadcast events are saved locally and sent to all peers
		Log.info(`event.manager.distribute ${event}`);

		if (event.header.type == EVENT.TYPE.BROADCAST) {
			this.saveData(event);
			this.saveBroadcastData(event);
		}

		// Server - Connect to Peers
		if (event.header.type == EVENT.TYPE.SERVER.CONNECT) {
			this.saveBroadcastData(event);
		}
	}

	saveData(data) {
		Log.info(`event.manager.save.queue ${this.eventsQueue}`);

		this.pushToQueue(data, this.eventsQueue);
	}

	saveBroadcastData(data) {
		Log.info(`event.manager.broadcast.queue ${this.broadcastQueue}`);

		this.pushToQueue(data, this.broadcastQueue);
	}

	pushToQueue(data, queue) {
		try {
			if (Event.validateEventObject(data)) {
				broker.push(this.dataToJSON(data), queue);
			} else {
				throw err;
			}
		} catch (err) {
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
