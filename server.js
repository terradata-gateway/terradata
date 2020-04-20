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

/* ===================================================================================
    Event Manager API 
=====================================================================================*/

// Route files 
const routes = require('./routes');

// Mount routers
app.use('/api/v1', routes);


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

