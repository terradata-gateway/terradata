const EventManager = require('../server/events/event-manager');
const Event = require('../server/events/event');
const Log = require('../lib/logger');

const em = new EventManager();
const EVENTS = require('../lib/constants/events');

// @desc    Post Messages
// @route   POST api/v1/events
// @access  Public

exports.postEventMessages = async (req, res, next) => {
    try {

        Log.info(`app.server.post.event.messages.request ${req.method} ${req.originalUrl}`);

        const params = {
            type : EVENTS.EVENT_TYPE.BROADCAST, // broadcast event
            reqHeaders: false // include original request headers
        };

        const event = Event.buildEventObject(req, params);

        em.distribute(event);

        Log.info(`app.server.post.event.messages.response ${req.method} ${req.originalUrl} 200`);

        res.status(200).json({success: true});
    } catch (err) {
        Log.error(`app.server.post.event.messages.response ${req.method} ${req.originalUrl} 400 ${err}`);
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
}


// @desc    Connect to Network Peers
// @route   POST api/v1/peers
// @access  Public

exports.postConnectToPeers = async (req, res, next) => {
    try {
        Log.info(`app.server.post.connect.to.peers.request ${req.method} ${req.originalUrl}`);
        const params = {
            type : EVENTS.EVENT_TYPE.SERVER, // server event
            reqHeaders: false // include original request headers
        };

        const event = Event.buildEventObject(req, params);

        em.distribute(event);

        Log.info(`app.server.post.connect.to.peers.response ${req.method} ${req.originalUrl} 200`);
        res.status(200).json({
            success: true,
            // peers: p2p.getConnectedPeers()
        });
    } catch (err) {
        Log.error(`app.server.post.connect.to.peers.response ${req.method} ${req.originalUrl} 400 ${err}`);
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
}

// @desc    Get Network Peers
// @route   GET api/v1/peers
// @access  Public

// DOES NOT RETURN ADDRESSES PROPERLY - TO BE FIXED
exports.getConnectedPeers = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            // peers: p2p.getConnectedPeers()
        });
    } catch (err) {
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
}

// @desc    Load Test Event Manager
// @route   POST api/v1/test
// @access  Public

exports.postTestEventMessages = async (req, res, next) => {

    try {

        Log.info(`app.server.post.test.event.messages.request ${req.method} ${req.originalUrl}`);
        
        const messageNo = 10;

        const params = {
            type : 'standard',
            reqHeaders: false // include original request headers
        };

        const eventObject = Event.buildEventObject(req, params);

        for (let i=0; i<messageNo; i++) {
            em.storeEvent(eventObject);
            em.broadcastEvent(eventObject);
        }

        Log.info(`app.server.post.test.event.messages.response ${req.method} ${req.originalUrl} 200`);

        res.status(200).json({success: true});
    } catch (err) {
        Log.error(`app.server.post.test.event.messages.response ${req.method} ${req.originalUrl} 400 ${err}`);
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
}
