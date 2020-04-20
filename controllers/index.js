const EventManager = require('../server/event-manager');
const events = new EventManager();

// @desc    Post Event Messages to Event Queue
// @route   POST api/v1/events
// @access  Public

exports.postEventMessages = async (req, res, next) => {
    try {
        //events.createEvent(req.body);
        const params = {
            type : 'standard',
            reqHeaders: false // include original request headers
        };

        events.createEvent(events.buildEventObject(req, params));
        events.broadcast(events.buildEventObject(req, params));
        res.status(200).json({success: true});
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
        for (let i=0; i<200; i++) {
            events.createEvent(req.body);
            events.broadcast(req.body);
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