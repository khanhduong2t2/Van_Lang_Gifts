const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Info = require('../models/Info');

const {
    mongooseToObject,
    multipleMongooseToObject,
} = require('../../util/mongoose');

const ConversationController = {
    create: async (req, res, next) => {
        try {
            const id = JSON.stringify(req.data._id);
            const id2 = id.slice(0, -1);
            const id3 = id2.replace('"', '');

            const arrayId1 = [id3, req.params.userId];

            const arrayId2 = [req.params.userId, id3];

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
                req.body.getConHaveAuthor = savedConversation;
                req.body.id3 = id3;
            } else {
                (req.body.getConHaveAuthor = getConHaveAuthor),
                    (req.body.id3 = id3);
            }
            next();
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    getCon: async (req, res, next) => {
        try {
            const getConHaveAuthor = await req.body.getConHaveAuthor;

            const getNameAuthor = await User.findOne({
                _id: req.params.userId,
            });
            const nameAuthor = await getNameAuthor.username;
            const getInfoAuthor = await Info.findOne({ username: nameAuthor });

            const getMessage = await Message.find({
                conversationId: getConHaveAuthor[0]._id,
            });

            const idUserCurrent = req.body.id3;
            const getUserCurrent = await User.findOne({ _id: idUserCurrent });
            const getInfoUserCurrent = await Info.findOne({
                username: getUserCurrent.username,
            });

            const idAuthor = req.params.userId;

            var infoArray = [];
            for (var i = 0; i < getMessage.length; i++) {
                if (getMessage[i].sender === idUserCurrent) {
                    var info1 = {};
                    info1.text = getMessage[i].text;
                    info1.createdAt = getMessage[i].createdAt;
                    infoArray.push(info1);
                } else if (getMessage[i].sender === idAuthor) {
                    var info2 = {};
                    info2.id = getMessage[i].sender;
                    info2.text = getMessage[i].text;
                    info2.createdAt = getMessage[i].createdAt;
                    infoArray.push(info2);
                }
            }
            return res.render('messenger/show', {
                idAuthor: req.params.userId,
                idUserCurrent: req.data._id,
                infoAuthor: getInfoAuthor,
                avatarUserCurrent: getInfoUserCurrent.avatar,
                getConHaveAuthor: getConHaveAuthor,
                conversationId: getConHaveAuthor[0]._id,
                getMessage: getMessage,
                infoArray: infoArray,
                data: req.data,
                data_admin: req.data?.admin,
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    createConversation: async (req, res, next) => {
        try {
            // Tạo hoặc lấy ID Room
            var idRoom;
            const id = JSON.stringify(req.data._id);
            const id2 = id.slice(0, -1);
            const id3 = id2.replace('"', '');

            const arrayId1 = [id3, req.params.userId];

            const arrayId2 = [req.params.userId, id3];

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

            // Lấy thông tin Author và Current User
            const userAuthor = await User.findOne({ _id: req.params.userId });
            const infoAuthor = await Info.findOne({
                username: userAuthor.username,
            });
            res.render('messenger/chat', {
                data: req.data,
                data_admin: req.data?.admin,
                avatarAuthor: infoAuthor.avatar,
                usernameAuthor: infoAuthor.username,
                emailAuthor: infoAuthor.email,
                phoneAuthor: infoAuthor.phone,
                facebookAuthor: infoAuthor.facebook,
                instagramAuthor: infoAuthor.instagram,
                idCurrentUser: req.data._id,
                idRoom: idRoom,
            });
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
module.exports = ConversationController;
