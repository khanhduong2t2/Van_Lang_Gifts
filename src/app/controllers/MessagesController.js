const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var path = require('path');

const { mongooseToObject } = require('../../util/mongoose');

const MessageController = {
    // [POST] /messages
    addMess: async (req, res, next) => {
        const newMessage = new Message({
            text: req.body.text,
            conversationId: req.body.conversationId,
            sender: req.body.sender,
        });
        try {
            const savedMessage = await newMessage.save();
            return res.redirect('back');
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    getMess: async (req, res, next) => {
        try {
            const messages = await Message.find({
                conversationId: req.params.conversationId,
            });
            return res.json(messages);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
};
module.exports = MessageController;
