const amqp = require('amqplib/callback_api');
const Log = require('../lib/logger');

class MessageBroker {

    constructor (host) {
        this.host = host;
    }

    pull (queue) {
        Log.info(`p2p.message.broker.pull ${queue}`);
        amqp.connect(this.host, (error0, connection) => {
            if (error0) {
                Log.error(`p2p.message.broker.pull.connect.error ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.error(`p2p.message.broker.pull.connect.channel.error ${error1}`);
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });

                Log.info(`p2p.message.broker.pull.connect.channel.listen.queue ${queue}`);

                channel.consume(queue, (message) => {
                    Log.info(`p2p.message.broker.pull.connect.channel.consume.queue ${queue}`);
                    Log.info(`p2p.message.broker.pull.connect.channel.consume.queue.message ${message.content.toString()}`);
                }, {
                    noAck: true
                });
            });
        });

    }

    push (message, queue) {
        Log.info(`message.broker.push ${queue}`);
        amqp.connect(this.host, (error0, connection) => {
            if (error0) {
                Log.error(`p2p.message.broker.push.connect.error ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.error(`p2p.message.broker.push.connect.channel.error ${error1}`);
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });
                
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
                Log.info(`p2p.message.broker.push.connect.channel.send.queue ${queue}`);
                Log.info(`p2p.message.broker.push.connect.channel.send.queue.message ${message}`);
            });

            setTimeout(async () => {
                await connection.close();
                // process.exit(0);
            }, 1000);
        });
    }


}

module.exports = MessageBroker;