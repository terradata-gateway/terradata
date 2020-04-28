const Websocket = require('ws');
const EventManager = require('../events/event-manager');
const Log = require('../../lib/logger');
const em = new EventManager();
const amqp = require('amqplib/callback_api');
const ENVIRONMENT = require('../../lib/constants/environment');
const EVENTS = require('../../lib/constants/events');

class P2pServer {
    constructor () {
        this.sockets = [];
        this.mqHost = ENVIRONMENT.MQ_HOST;
        this.broadcastQueue = ENVIRONMENT.BROADCAST_QUEUE;
        this.peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
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
        this.connectToPeers(this.peers);

        // Consume messages from the BROADCAST queue
        this.consumeBroadcastQueueMessages();

        // Log.info(`Listening for peer-to-peer connections on: ${port}`);

    }

    connectSocket(socket) {
        Log.info(`p2p.server.connect.socket ${socket._socket.remoteAddress} ${socket._socket.remotePort}`);
        this.sockets.push(socket);
        this.messageHandler(socket);
    }

    connectToPeers(peers) {
        Log.info(`p2p.server.connect.peers ${peers.length}`);
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            socket.on('error', (err) => Log.error(`p2p.server.connect.peer.error ${err}`));
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    // Handle messages from peers
    messageHandler(socket) {
        socket.on('message', message => {
            Log.info(`p2p.server.socket.message.handler ${message}`);
            em.saveEventToQueue(message);
        });
    }

    sendData(socket, data) {
        Log.info(`p2p.server.socket.message.send ${socket._socket.remoteAddress} ${socket._socket.remotePort}`);
        socket.send(data);
        socket.on('error', (err) => {
            // TO DO - Better error handling 
            Log.info(`p2p.server.socket.message.send.error ${err}`);
        });    
    }

    broadcastDataToPeers(data) {
        try {
            this.sockets.forEach(socket => {
                // Check if socket is open
                Log.info(`p2p.server.sync.socket.message.broadcast.peers ${socket._socket.remoteAddress} ${socket._socket.remotePort} ready.state ${socket.readyState}`);
                if (socket.readyState === Websocket.OPEN) {
                    this.sendData(socket, data);
                }
            });
        } catch (err) {
            Log.error(`p2p.server.sync.socket.message.broadcast.peers.error ${err}`);
        }

    }

    // Listen to messages from the BROADCAST queue
    consumeBroadcastQueueMessages() {
        amqp.connect(this.mqHost, (error0, connection) => {
            if (error0) {
                Log.info(`p2p.server.consume.broadcast.messages.connect.error ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.info(`p2p.server.consume.broadcast.messages.connect.channel.error ${error1}`);
                    throw error1;
                } 

                channel.assertQueue(this.broadcastQueue, {
                    durable: false
                });

                Log.info(`p2p.server.consume.broadcast.messages.connect.channel.listen.queue ${this.broadcastQueue}`);

                channel.consume(this.broadcastQueue, (message) => {
                    Log.info(`p2p.server.consume.broadcast.messages.listen.queue ${this.broadcastQueue}`);
                    Log.info(`p2p.server.consume.broadcast.messages.listen.queue.message ${message.content.toString()}`);
                    this.synchronize(JSON.parse(message.content.toString()));

                }, {
                    noAck: true
                });
            });
        });
    }
    
    synchronize(event) {
        Log.info(`p2p.server.synchronize.event`);
        try {
            if (event.header.type == EVENTS.EVENT_TYPE.SERVER) {
                Log.info(`p2p.server.synchronize.event.type ${EVENTS.EVENT_TYPE.SERVER}`);
                this.connectToPeers(event.data.peers)
            }

            if (event.header.type == EVENTS.EVENT_TYPE.BROADCAST) {
                Log.info(`p2p.server.synchronize.event.type ${EVENTS.EVENT_TYPE.BROADCAST}`);
                this.broadcastDataToPeers(JSON.stringify(event));
            }
        } catch (err) {
            Log.error(`p2p.server.synchronize.event.error ${err} ${JSON.stringify(event)}`);
        }
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