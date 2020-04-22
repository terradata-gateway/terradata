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
        Log.info(`p2p.server.listen.port ${port}`);
        const server = new Websocket.Server({ 
            port: port,
            clientTracking: true            
        });

        server.on('connection', (socket, req) => {
            Log.info(`p2p.server.listen.connection`);
            this.connectSocket(socket);
        });

        server.on('error', (err) => {
            Log.info(`p2p.server.listen.error ${err}`);
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

        // Log.info(`Listening for peer-to-peer connections on: ${port}`);

    }

    connectSocket(socket) {
        Log.info(`p2p.server.connect.socket ${socket._socket.remoteAddress} ${socket._socket.remotePort}`);
        this.sockets.push(socket);
        this.messageHandler(socket);
    }

    connectToPeers() {
        Log.info(`p2p.server.connect.peers ${peers.length}`);
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            socket.on('error', (err) => Log.error(`p2p.server.connect.peer.error ${err}`));
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    messageHandler(socket) {
        socket.on('message', message => {
            Log.info(`p2p.server.socket.message.handler ${message}`);
            em.storeEvent(message);
        });
    }

    sendData(socket, data) {
        Log.info(`p2p.server.socket.message.send ${socket._socket.remoteAddress} ${socket._socket.remotePort}`);
        socket.send(data);
        socket.on('error', (err) => {
            // TO DO - Better error handling 
            Log.info(`p2p.server.socket.message.sende.error ${err}`);
        });    
    }
    
    syncData() {
        amqp.connect(this.mqHost, (error0, connection) => {
            if (error0) {
                Log.info(`p2p.server.sync.connect.error ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.info(`p2p.server.sync.connect.channel.error ${error1}`);
                    throw error1;
                }

                channel.assertQueue(this.broadcastQueue, {
                    durable: false
                });

                Log.info(`p2p.server.sync.connect.channel.listen.queue ${this.broadcastQueue}`);

                channel.consume(this.broadcastQueue, (message) => {
                    Log.info(`p2p.server.sync.connect.channel.consume.queue ${this.broadcastQueue}`);
                    Log.info(`p2p.server.sync.connect.channel.consume.queue.message ${message.content.toString()}`);
                    this.sockets.forEach(socket => {
                        // Check if socket is open
                        Log.info(`p2p.server.sync.socket.message.send ${socket._socket.remoteAddress} ${socket._socket.remotePort} ready.state ${socket.readyState}`);
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