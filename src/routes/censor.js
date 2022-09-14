const express = require('express');
const router = express.Router();

const giftController = require('../app/controllers/GiftController');
const middlewareController = require('../app/controllers/MiddlewareController');
const censorController = require('../app/controllers/CensorController');

router.get(
    '/',
    middlewareController.verifyToken,
    middlewareController.checkCensor,
    censorController.gotoCensored,
);
router.get(
    '/:slug',
    middlewareController.verifyToken,
    giftController.showCensored,
);
router.post(
    '/comment/:id',
    middlewareController.verifyToken,
    giftController.censoredComment,
);
module.exports = router;
