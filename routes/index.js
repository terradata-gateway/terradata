const express = require('express');

const { postEventMessages, postConnectToPeers } = require('../controllers');

const router = express.Router();

router.route('/events').post(postEventMessages);

router.route('/connect').post(postConnectToPeers);

module.exports = router;
