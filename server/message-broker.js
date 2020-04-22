const amqp = require('amqplib/callback_api');
const Log = require('../lib/logger');

class MessageBroker {

    constructor (host) {
        this.host = host;
    }

    pull (queue) {
        amqp.connect(this.host, (error0, connection) => {
            if (error0) {
                Log.error(`Failed to connect to message queue: ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.error(`Failed to create channel: ${error1}`);
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });

                Log.info(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

                channel.consume(queue, (message) => {
                    Log.info(`[x] Received %s ${message.content.toString()}`);
                }, {
                    noAck: true
                });
            });
        });

    }

    push (message, queue) {
        amqp.connect(this.host, (error0, connection) => {
            if (error0) {
                Log.error(`Failed to connect to message queue: ${error0}`);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    Log.error(`Failed to create channel: ${error1}`);
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
                Log.info(`[x] Sent ${message}`);
            });

            setTimeout(async () => {
                await connection.close();
                // process.exit(0);
            }, 1000);
        });
    }


}

module.exports = MessageBroker;