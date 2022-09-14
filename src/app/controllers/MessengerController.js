const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Info = require('../models/Info');
const Message = require('../models/Message');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var path = require('path');

const {
    mongooseToObject,
    multipleMongooseToObject,
} = require('../../util/mongoose');

const MessengerController = {
    show: (req, res, next) => {
        try {
            return res.redirect('/conversations/' + req.data._id);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    showChat: async (req, res, next) => {
        try {
            return res.render('messenger/chat', {
                data: req.data,
                data_admin: req.data?.admin,
                data_censor: req.data?.censor,
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getListFriends: async (req, res, next) => {
        try {
            const id = JSON.stringify(req.data._id);
            const id2 = id.slice(0, -1);
            const id3 = id2.replace('"', '');
            var getConHaveAuthor = await Conversation.find({
                members: { $in: [id3] },
            });
            const infoFriends = [];

            var idMember = [];
            getConHaveAuthor.map((data) => {
                data.members.map((member) => {
                    if (member !== id3) {
                        idMember.push(member);
                    }
                });
            });
            for (var i = 0; i < idMember.length; i++) {
                var getUser = await User.findById(idMember[i]);
                var getInfo = await Info.find({ username: getUser.username });
                infoFriends.push(getInfo[0]);
            }
            return res.json(infoFriends);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getMessages: async (req, res, next) => {
        try {
            const getUserCurrent = await User.findById(req.data._id);
            const getInfoCurrent = await Info.find({
                username: getUserCurrent.username,
            });

            const infoFriend = await Info.find({
                username: req.params.nameAuthor,
            });
            const getIdUser = await User.find({
                username: req.params.nameAuthor,
            });
            const idFriend = String(getIdUser[0]._id);

            const id = JSON.stringify(req.data._id);
            const id2 = id.slice(0, -1);
            const id3 = id2.replace('"', '');

            const arrayId1 = [id3, idFriend];

            const arrayId2 = [idFriend, id3];

            var getConHaveAuthor = await Conversation.find({
                members: arrayId1,
            });

            if (getConHaveAuthor.length === 0) {
                getConHaveAuthor = await Conversation.find({
                    members: arrayId2,
                });
            }
            if (getConHaveAuthor.length === 0) {
                const newConversation = new Conversation({
                    members: [id3, req.params.userId],
                });
                const savedConversation = await newConversation.save();
                idRoom = await savedConversation._id;
            } else {
                idRoom = await getConHaveAuthor[0]._id;
            }
            const messages = await Message.find({
                conversationId: idRoom,
            });

            res.json({
                infoFriend: infoFriend[0],
                idRoom: idRoom,
                messages: messages,
                myId: req.data._id,
                avatarCurrent: getInfoCurrent[0].avatar,
                nameCurrent: getUserCurrent.username,
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },
};
module.exports = MessengerController;
