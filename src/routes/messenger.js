const express = require('express');
const router = express.Router();

const messengerController = require('../app/controllers/MessengerController');
const middlewareController = require('../app/controllers/MiddlewareController');


router.get('/', middlewareController.verifyToken, messengerController.show);
router.get('/chat', middlewareController.verifyToken, messengerController.showChat);
router.get('/chat-room', middlewareController.verifyToken, messengerController.getListFriends);
router.get('/chat-room/:nameAuthor', middlewareController.verifyToken, messengerController.getMessages);

module.exports = router;