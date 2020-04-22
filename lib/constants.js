module.exports = Object.freeze({
    SERVER_NAME : process.env.SERVER_NAME || 'SERVER.1',
    HTTP_PORT : process.env.HTTP_PORT || 3001,
    P2P_PORT : process.env.P2P_PORT || 5001,
    MQ_HOST : process.env.MQ_HOST || 'amqp://localhost',
    EVENTS_QUEUE : (process.env.EVENTS_QUEUE || "TD.EVENTSTORE") + '.' + (process.env.SERVER_NAME || 'SERVER.1'),
    BROADCAST_QUEUE: (process.env.BROADCAST_QUEUE || "TD.BROADCAST") + '.' + (process.env.SERVER_NAME || 'SERVER.1')
});
