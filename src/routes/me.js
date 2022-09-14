const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');
const middlewareController = require('../app/controllers/MiddlewareController');

router.get(
    '/stored/gifts',
    middlewareController.verifyToken,
    middlewareController.checkAdmin,
    meController.storedGifts,
);
router.get(
    '/trash/gifts',
    middlewareController.verifyToken,
    middlewareController.checkAdmin,
    meController.trashGifts,
);

router.get(
    '/stored/users',
    middlewareController.verifyToken,
    middlewareController.checkAdmin,
    meController.storedUsers,
);

module.exports = router;
