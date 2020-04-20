// Load Modules
const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const app = express();

const HTTP_PORT = process.env.HTTP_PORT || 3001;

// Load env vars
dotenv.config({ path: '../config/config.env'});

app.use(logger('dev'));
// Body Parser
app.use(express.json());

// P2P Server 
const P2pServer = require('../server/p2p-server');
const EventManager = require('../server/event-manager');

const events = new EventManager();
const p2p = new P2pServer(events);

// Test Execute Query 
setInterval(() => {
    try {
        const request = {
            query: "CREATE (a:Person {name: $name}) RETURN a",
            params: { 
                name: "personName" 
            }
        } 

        for (let i=0; i<10; i++) {
            events.createEvent(request);
            p2p.syncData(request);
        }
        // res.status(200).json({success: true});
    } catch (err) {
       console.log(`Error: ${err}`);
    }
}, 1000);


// Listeners
p2p.listen();

const server = app.listen(HTTP_PORT, () => {
    console.log(`App listening on port ${HTTP_PORT}!`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
});

