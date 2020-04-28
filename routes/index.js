const express = require('express');

const {
    postEventMessages,
    postConnectToPeers,
    getConnectedPeers,
    postTestEventMessages
} = require('../controllers');

const router = express.Router();

router.route('/events')
            .post(postEventMessages);

router.route('/peers')
            .post(postConnectToPeers)
            .get(getConnectedPeers);

router.route('/test')
            .post(postTestEventMessages);

module.exports = router;