const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');
const middlewareController = require('../app/controllers/MiddlewareController');

router.get(
    '/:id/edit',
    middlewareController.verifyToken,
    middlewareController.checkAdmin,
    userController.edit,
);
router.put(
    '/:id',
    middlewareController.verifyToken,
    middlewareController.checkAdmin,
    userController.update,
);
router.delete(
    '/:id',
    middlewareController.verifyToken,
    middlewareController.checkAdmin,
    userController.destroy,
);

//Get Detail Info
router.post(
    '/update',
    middlewareController.verifyToken,
    userController.updateDetail,
);
router.get(
    '/detail',
    middlewareController.verifyToken,
    userController.getDetail,
);

router.get('/get-all', middlewareController.verifyToken, userController.getAll);

module.exports = router;
