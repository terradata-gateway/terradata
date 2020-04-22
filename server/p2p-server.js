const Websocket = require('ws');
const EventManager = require('./event-manager');
const Log = require('../lib/logger');
const em = new EventManager();
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const constants = require('../lib/constants');
const amqp = require('amqplib/callback_api');

class P2pServer {
    constructor () {
        this.sockets = [];
        this.mqHost = constants.MQ_HOST;
        this.broadcastQueue = constants.BROADCAST_QUEUE;
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
            Log.error(`P2P server error: ${err}`);
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

        Log.info(`Listening for peer-to-peer connections on: ${port}`);

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
            em.storeEvent(message);
        });
    }

    sendData(socket, data) {
        // socket.send(JSON.stringify(data));
        socket.send(data);
        socket.on('error', (err) => {
            // TO DO - Better error handling 
            Log.error(`Failed to send data to peer: ${err}`);
        });    
    }
    
    syncData() {
        amqp.connect(this.mqHost, (error0, connection) => {
            if (error0) {
                Log.error(`Failed to connect to message queue: ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.error(`Failed to create channel: ${error1}`);
                    throw error1;
                }

                channel.assertQueue(this.broadcastQueue, {
                    durable: false
                });

                Log.info(`[*] Waiting for messages in ${this.broadcastQueue}. To exit press CTRL+C`);

                channel.consume(this.broadcastQueue, (message) => {
                    Log.info(`[x] Received ${message.content.toString()}`);
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

}

module.exports = P2pServer;