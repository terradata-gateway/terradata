const express = require('express');

const {
    postEventMessages,
    getPeers,
    postTestEventMessages
} = require('../controllers');

const router = express.Router();

router.route('/events')
            .post(postEventMessages);

router.route('/test')
            .post(postTestEventMessages);

router.route('/peers')
            .get(getPeers);

module.exports = router;