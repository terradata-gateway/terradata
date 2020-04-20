var amqp = require('amqplib/callback_api');

class MessageBroker {

    constructor (host) {
        this.host = host;
    }

    pull (queue) {
        // TO DO  - Rewrite to async/await style
        amqp.connect(this.host, function(error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

                channel.consume(queue, function(message) {
                    console.log(" [x] Received %s", message.content.toString());
                }, {
                    noAck: true
                });
        });
    });

    }

    push (message, queue) {
        // TO DO  - Rewrite to async/await style
        amqp.connect(this.host, (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

                console.log(" [x] Sent %s", message);
            });

            setTimeout(async () => {
                await connection.close();
                // process.exit(0);
            }, 1000);
        });
    }


}

module.exports = MessageBroker;