const User = require('../models/User');
const jwt = require('jsonwebtoken');

class MiddlewareController {
    // Verify token
    verifyToken(req, res, next) {
        try {
            var accessToken = req.cookies.accessToken;
            var idUser = jwt.verify(accessToken, 'ngay2thang2');
            User.findOne({
                _id: idUser,
            })
                .then((data) => {
                    if (data) {
                        req.data = data;
                        next();
                    } else {
                        res.json('NOT PERMISSION');
                    }
                })
                .catch((err) => {
                    res.status(500).json(err);
                });
        } catch (err) {
            return res.render('auth/login');
        }
    }

    // Get token
    getToken(req, res, next) {
        var accessToken = req.headers;
        req.accessToken = accessToken;
        next();
    }

    // Check Admin
    checkAdmin(req, res, next) {
        var roleAdmin = req.data.admin;
        if (roleAdmin === true) {
            next();
        } else {
            res.json('NOT PERMISSION');
        }
    }

    checkCensor(req, res, next) {
        var roleCensor = req.data.censor;
        if (roleCensor === true) {
            next();
        } else {
            res.json('NOT PERMISSION');
        }
    }
}

module.exports = new MiddlewareController();
