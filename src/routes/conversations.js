const express = require('express');
const router = express.Router();

const conversationController = require('../app/controllers/ConversationController');
const middlewareController = require('../app/controllers/MiddlewareController');

router.get(
    '/:userId',
    middlewareController.verifyToken,
    conversationController.createConversation,
);

module.exports = router;
