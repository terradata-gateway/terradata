// Load Modules
const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const constants = require('./lib/constants');
const app = express();

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

/* ===================================================================================
    Terradata Gateway API 
=====================================================================================*/

// Route files 
const routes = require('./routes');

// Mount routers
app.use('/api/v1', routes);


/* ===================================================================================
    Terradata P2P Event Manager
=====================================================================================*/

p2p.listen(constants.P2P_PORT);

/* ===================================================================================
   Express API
=====================================================================================*/

const server = app.listen(constants.HTTP_PORT, () => {
    console.log(`App listening on port ${constants.HTTP_PORT}!`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
});

