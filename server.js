// Load Modules
const express = require('express');
const Log = require('./lib/logger');
const logger = require('morgan');
const dotenv = require('dotenv');
const app = express();
const ENVIRONMENT = require('./lib/constants/environment');

// Load env vars
dotenv.config({ path: './config/config.env'});
app.use(logger('dev'));

// Body Parser
app.use(express.json());

// P2P Server
const P2pServer = require('./server/p2p/p2p-server');
const p2p = new P2pServer();

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

p2p.listen(ENVIRONMENT.P2P_PORT);

/* ===================================================================================
   Express API
=====================================================================================*/

const server = app.listen(ENVIRONMENT.HTTP_PORT, () => {
    Log.info(`app.server.listen.port ${ENVIRONMENT.HTTP_PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    Log.error(`process.unhandled.rejection ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
});

