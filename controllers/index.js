const EventManager = require('../server/event-manager');
const Event = require('../server/event');
const Log = require('../lib/logger');
const em = new EventManager();

// @desc    Post Messages
// @route   POST api/v1/events
// @access  Public

exports.postEventMessages = async (req, res, next) => {
    try {

        Log.info(`app.server.post.event.messages.request ${req.method} ${req.originalUrl}`);

        const params = {
            type : 'standard',
            reqHeaders: false // include original request headers
        };

        const eventObject = Event.buildEventObject(req, params);

        em.storeEvent(eventObject);
        em.broadcastEvent(eventObject);

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

// @desc    Get Network Peers
// @route   GET api/v1/peers
// @access  Public

// DOES NOT RETURN ADDRESSES PROPERLY - TO BE FIXED
exports.getPeers = async (req, res, next) => {
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