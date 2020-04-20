const Websocket = require('ws');
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

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

        console.log(`Listening for peer-to-peer connections on: ${port}`);

        // this.replicate();
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
    
    syncData(data) {
        this.sockets.forEach(socket => {
            // Check if socket is open
            if (socket.readyState === Websocket.OPEN) {
                this.sendData(socket, data);
            }
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

    replicate() {
        // TO DO
        console.log(`Starting replication process`);
    }
}

module.exports = P2pServer;