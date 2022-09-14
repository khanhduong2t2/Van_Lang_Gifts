const Gift = require('../models/Gift');
const { multipleMongooseToObject } = require('../../util/mongoose');
class SiteController {
    // [GET] /
    index(req, res, next) {
        Gift.find({ status: 'Đã được duyệt', sent: false })
            .skip(0)
            .limit(9)
            .then((gifts) => {
                res.render('home', {
                    gifts: multipleMongooseToObject(gifts),
                    data: req.data,
                    data_admin: req.data?.admin,
                    data_censor: req.data?.censor,
                });
            })
            .catch(next);
    }

    intro(req, res, next) {
        res.render('news/introduce', {
            data: req.data,
            data_admin: req.data?.admin,
        });
    }
}

module.exports = new SiteController();
