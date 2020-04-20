module.exports = Object.freeze({
    MQ_HOST : process.env.MQ_HOST || 'amqp://localhost',
    EVENTS_QUEUE : (process.env.EVENTS_QUEUE || "TD.EVENTS") + '.' + (process.env.SERVER_NAME || 'SERVER.1'),
    BROADCAST_QUEUE: (process.env.BROADCAST_QUEUE || "TD_BROADCAST") + '.' + (process.env.SERVER_NAME || 'SERVER.1')
});

