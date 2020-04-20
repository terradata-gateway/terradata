// @desc    Post Event Messages
// @route   POST api/v1/events
// @access  Public

exports.postEventMessages = async (req, res, next) => {
    try {
        events.createEvent(req.body);
        p2p.syncData(req.body);
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
            p2p.syncData(req.body);
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
            peers: p2p.getConnectedPeers()
        });
    } catch (err) {
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
}