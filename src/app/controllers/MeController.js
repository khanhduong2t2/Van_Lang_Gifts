const Gift = require('../models/Gift');
const User = require('../models/User');
const { multipleMongooseToObject } = require('../../util/mongoose');
const PAGE_SIZE = 12;

class MeController {
    // [GET] /me/stored/gifts
    storedGifts(req, res, next) {
        let giftQuery = Gift.find({});

        if (req.query.hasOwnProperty('_sort')) {
            giftQuery = giftQuery.sort({
                [req.query.column]: req.query.type,
            });
        }

        Promise.all([giftQuery, Gift.countDocumentsDeleted()])
            .then(([gifts, deletedCount]) =>
                res.render('me/stored-gifts', {
                    deletedCount,
                    gifts: multipleMongooseToObject(gifts),
                    data: req.data,
                    data_admin: req.data?.admin,
                }),
            )
            .catch(next);
    }

    trashGifts(req, res, next) {
        Gift.findDeleted({})
            .then((gifts) =>
                res.render('me/trash-gifts', {
                    gifts: multipleMongooseToObject(gifts),
                    data: req.data,
                    data_admin: req.data?.admin,
                }),
            )
            .catch(next);
    }

    storedUsers(req, res, next) {
        User.find({})
            .then((users) =>
                res.render('me/stored-users', {
                    users: multipleMongooseToObject(users),
                    data: req.data,
                    data_admin: req.data?.admin,
                }),
            )
            .catch(next);
    }
}

module.exports = new MeController();
