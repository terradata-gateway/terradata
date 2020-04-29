const EventManager = require('../server/event-manager');
const Event = require('../server/event');
const Log = require('../lib/logger');

const eventManager = new EventManager();
const EVENT = require('../lib/constants/event');

// @desc    Post Messages
// @route   POST api/v1/events
// @access  Public

exports.postEventMessages = async (req, res, next) => {
	try {
		Log.info(`app.server.post.event.messages.request ${req.method} ${req.originalUrl}`);

		const event = Event.buildEventObject(req, {
			type: EVENT.TYPE.BROADCAST, // broadcast event
		});

		eventManager.distribute(event);

		res.status(200).json({ success: true });
		Log.info(`app.server.post.event.messages.response ${req.method} ${req.originalUrl} 200`);
	} catch (err) {
		Log.error(`app.server.post.event.messages.response ${req.method} ${req.originalUrl} 400 ${err}`);
		res.status(400).json({
			success: false,
			error: err,
		});
	}
};

// @desc    Connect to Network Peers
// @route   POST api/v1/connect
// @access  Public

exports.postConnectToPeers = async (req, res, next) => {
	try {
		Log.info(`app.server.post.connect.to.peers.request ${req.method} ${req.originalUrl}`);

		const event = Event.buildEventObject(req, {
			type: EVENT.TYPE.SERVER.CONNECT, // connect to peers server event
		});

		eventManager.distribute(event);

		res.status(200).json({ success: true });
		Log.info(`app.server.post.connect.to.peers.response ${req.method} ${req.originalUrl} 200`);
	} catch (err) {
		Log.error(`app.server.post.connect.to.peers.response ${req.method} ${req.originalUrl} 400 ${err}`);
		res.status(400).json({
			success: false,
			error: err,
		});
	}
};
