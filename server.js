// Load Modules
const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const app = express();

// Listener Ports
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 5001;

// Load env vars
dotenv.config({ path: './config/config.env'});
app.use(logger('dev'));

// Body Parser
app.use(express.json());

// P2P Server & Event Manager
const P2pServer = require('./server/p2p-server');
const EventManager = require('./server/event-manager');

const events = new EventManager();
const p2p = new P2pServer(events);

// Helper
const Helper = require('./helper');
const hp = new Helper();

/* ===================================================================================
    Event Manager API 
=====================================================================================*/

/* TO DO - Refactor to routes with P2pServer and EventManager middleware
   TO DO - Fix loss of sockets connection bug 
// Route files 
const api = require('./routes');

console.log(api);

// Mount routers
app.use('/api/v1', api);
*/

// @desc    Post Event Messages
// @route   POST api/v1/events
// @access  Public

app.post('/api/v1/events', (req, res) => {
    try {
        events.createEvent(hp.reqToEvent(req));
        p2p.syncData(hp.reqToEvent(req));
        res.status(200).json({success: true});
    } catch (err) {
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
});

// @desc    Load Test Event Manager
// @route   POST api/v1/test
// @access  Public

app.post('/api/v1/test', (req, res) => {
    try {
        for (let i=0; i<200; i++) {
            events.createEvent(hp.reqToEvent(req));
            p2p.syncData(hp.reqToEvent(req));
        }
        res.status(200).json({success: true});
    } catch (err) {
        res.status(400).json({
            success: false, 
            error: err
        }); 
    }
});

// @desc    Get Network Peers
// @route   GET api/v1/peers
// @access  Public

// DOES NOT RETURN ADDRESSES PROPERLY - TO BE FIXED
app.get('/api/v1/peers', (req, res) => {
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
}); 

/* ===================================================================================
    P2P Event Manager
=====================================================================================*/

p2p.listen(P2P_PORT);

/* ===================================================================================
   Express API
=====================================================================================*/

const server = app.listen(HTTP_PORT, () => {
    console.log(`App listening on port ${HTTP_PORT}!`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
});

