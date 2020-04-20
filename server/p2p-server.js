const Websocket = require('ws');
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var amqp = require('amqplib/callback_api');

const SERVER_NAME = process.env.SERVER_NAME || 'SERVER_1';
const MQ_HOST = process.env.MQ_HOST || 'amqp://localhost';
const BROADCAST_QUEUE = (process.env.INCOMING_QUEUE || "TD_BROADCAST") + '_' + SERVER_NAME;

class P2pServer {
    constructor (eventManager) {
        this.eventManager = eventManager;
        this.sockets = [];
    }

    listen(port) {
        const server = new Websocket.Server({ 
            port: port,
            clientTracking: true            
        });

        server.on('connection', (socket, req) => {
            this.connectSocket(socket);
        });

        server.on('error', (err) => {
            console.log(`P2P server error: ${err}`);
            // Exit process
            process.exit(1);
        });

        // WebSocket Authentication - TO DO
        /* server.handleUpgrade(request, socket, head, (socket) => {
            // server.emit('connection', ws, request, ...args);

          }); */

        // Connect to Peers
        this.connectToPeers();

        // Sync Data
        this.syncData();

        console.log(`Listening for peer-to-peer connections on: ${port}`);

    }

    connectSocket(socket) {
        this.sockets.push(socket);
        this.messageHandler(socket);
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            socket.on('error', (err) => console.log(err));
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = message;
            this.eventManager.createEvent(data);
        });
    }

    sendData(socket, data) {
        socket.send(JSON.stringify(data));
        socket.on('error', (err) => {
            // TO DO - Better error handling 
            console.log(`Failed to send data to peer: ${err}`);
        });    
    }
    
    syncData() {
        amqp.connect(MQ_HOST, (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue(BROADCAST_QUEUE, {
                    durable: false
                });

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", BROADCAST_QUEUE);

                channel.consume(BROADCAST_QUEUE, (message) => {
                    console.log(" [x] Received %s", message.content.toString());
                    this.sockets.forEach(socket => {
                        // Check if socket is open
                        if (socket.readyState === Websocket.OPEN) {
                            this.sendData(socket, message.content.toString());
                        }
                    });
                }, {
                    noAck: true
                });
            });
        });
    }

    getConnectedPeers() {
        let peers = [];
        this.sockets.forEach(socket => {  
           // Check if socket is open
           if (socket.readyState === Websocket.OPEN) {
                peers.push(socket._socket.address());  
           }
        }); 

        return peers;
    }

    requestToEvent(req) {
        let event = {};
        event.headers = req.headers;
        event.body = req.body;
        return event;
    }
}

module.exports = P2pServer;