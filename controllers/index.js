const EventManager = require('../server/event-manager');
const Event = require('../server/event');
const Log = require('../lib/logger');
const em = new EventManager();

// @desc    Post Event Messages to Event Queue
// @route   POST api/v1/events
// @access  Public

exports.postEventMessages = async (req, res, next) => {
    try {

        console.log(`${req.toString()}`);

        const params = {
            type : 'standard',
            reqHeaders: false // include original request headers
        };

        const eventObject = Event.buildEventObject(req, params);

        em.storeEvent(eventObject);
        em.broadcastEvent(eventObject);
        res.status(200).json({success: true});
    } catch (err) {
        console.log(err);
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
        const eventObject = Event.buildEventObject(req, params);
        for (let i=0; i<200; i++) {
            em.storeEvent(eventObject);
            em.broadcastEvent(eventObject);
        }
        res.status(200).json({success: true});
    } catch (err) {
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