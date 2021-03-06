// Load modules
const Websocket = require('ws');
const EventManager = require('./event-manager');
const Log = require('../lib/logger');
const eventManager = new EventManager();
const amqp = require('amqplib/callback_api');

// Load constants
const ENVIRONMENT = require('../lib/constants/environment');
const EVENT = require('../lib/constants/event');

class P2pServer {
	constructor() {
		this.sockets = [];
		this.mqHost = ENVIRONMENT.MQ_HOST;
		this.broadcastQueue = ENVIRONMENT.BROADCAST_QUEUE;
		this.peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
	}

	listen(port) {
		Log.info(`p2p.server.listen.port ${port}`);
		const server = new Websocket.Server({
			port: port,
			clientTracking: true,
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

		// Connect to Peers
		this.connectToPeers(this.peers);

		// Consume messages from the BROADCAST queue
        this.listenBroadcastQueue();
        Log.info(`Server clients: ${server.clients}`);
        console.log(server.clients);
	}

	connectSocket(socket) {
		Log.info(`p2p.server.connect.socket ${socket._socket.remoteAddress} ${socket._socket.remotePort}`);
		this.sockets.push(socket);
		Log.info(`p2p.server.connect.socket.open ${this.sockets.length}`);
		this.messageHandler(socket);
	}

	connectToPeers(peers) {

        console.log(peers.length);

		Log.info(`p2p.server.connect.peers ${peers.length}`);
		peers.forEach((peer) => {
			const socket = new Websocket(peer);
			socket.on('error', (err) => Log.error(`p2p.server.connect.peer.error ${err}`));
			socket.on('open', () => this.connectSocket(socket));
		});
	}

	// Handle messages from peers
	messageHandler(socket) {
		socket.on('message', (message) => {
			Log.info(`p2p.server.socket.message.handler ${message}`);
			eventManager.saveData(message);
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

	broadcast(data) {
		Log.info(`p2p.server.sync.socket.message.broadcast.peers`);
		try {
			this.sockets.forEach((socket) => {
				// Check if socket is open
				Log.info(
					`p2p.server.sync.socket.message.broadcast.peers ${socket._socket.remoteAddress} ${socket._socket.remotePort} ready.state ${socket.readyState}`
				);
				if (socket.readyState === Websocket.OPEN) {
					this.sendData(socket, data);
				}
			});
		} catch (err) {
			Log.error(`p2p.server.sync.socket.message.broadcast.peers.error ${err}`);
		}
	}

	// Listen to messages from the BROADCAST queue
	listenBroadcastQueue() {
		amqp.connect(this.mqHost, (error0, connection) => {
			if (error0) {
				Log.info(`p2p.server.get.broadcast.data.connect.error ${error0}`);
				throw error0;
			}
			connection.createChannel((error1, channel) => {
				if (error1) {
					Log.info(`p2p.server.get.broadcast.data.connect.channel.error ${error1}`);
					throw error1;
				}

				channel.assertQueue(this.broadcastQueue, { durable: false });

				Log.info(`p2p.server.get.broadcast.data.connect.channel.listen.queue ${this.broadcastQueue}`);

				channel.consume(
					this.broadcastQueue,
					(message) => {
						Log.info(`p2p.server.get.broadcast.data.listen.queue ${this.broadcastQueue}`);
						Log.info(`p2p.server.get.broadcast.data.listen.queue.message ${message.content.toString()}`);
						this.route(JSON.parse(message.content.toString()));
					},
					{
						noAck: true,
					}
				);
			});
		});
    }
    
	route(event) {
		Log.info(`p2p.server.synchronize.event`);
		try {
			switch (event.header.type) {
				case EVENT.TYPE.BROADCAST:
					Log.info(`p2p.server.synchronize.event.type ${EVENT.TYPE.BROADCAST}`);
					this.broadcast(JSON.stringify(event));
					break;
				case EVENT.TYPE.SERVER.CONNECT:
                    Log.info(`p2p.server.synchronize.event.type ${EVENT.TYPE.SERVER.CONNECT}`);                    
					this.connectToPeers(event.body.peers);
					break;
				case EVENT.TYPE.UNHANDLED:
					Log.info(`p2p.server.synchronize.event.type.unhandled ${EVENT.TYPE.UNHANDLED}`);
					break;
			}
		} catch (err) {
			Log.error(`p2p.server.synchronize.event.error ${err} ${JSON.stringify(event)}`);
		}
	}
}

module.exports = P2pServer;
