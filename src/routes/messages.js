const express = require('express');
const router = express.Router();

const messagesController = require('../app/controllers/MessagesController');
const middlewareController = require('../app/controllers/MiddlewareController');

//add
router.post("/", middlewareController.verifyToken ,messagesController.addMess);

//get
router.get("/:conversationId", messagesController.getMess);

module.exports = router;