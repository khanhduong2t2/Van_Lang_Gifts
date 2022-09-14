const User = require('../models/User');
const Info = require('../models/Info');

const { mongooseToObject } = require('../../util/mongoose');

const AuthController = {
    gotoCensored: async (req, res, next) => {
        res.render('censor/censored', {
            data: req.data,
            data_admin: req.data?.admin,
            data_censor: req.data?.censor,
        });
    },
};

module.exports = AuthController;
