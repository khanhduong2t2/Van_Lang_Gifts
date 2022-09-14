const express = require('express');
const router = express.Router();

const authController = require('../app/controllers/AuthController');
const middlewareController = require('../app/controllers/MiddlewareController');

router.get('/login', authController.login);
router.post('/login', authController.loginCon);

router.get('/register', authController.register);
router.post('/register', authController.registerCon);

router.post(
    '/logout',
    middlewareController.verifyToken,
    authController.userLogout,
);

router.get('/notification', authController.notification);
router.get('/notification2', authController.notification2);
router.get('/notification3', authController.notification3);
router.get('/verify', authController.verify);
router.get('/forgot', authController.forgot);
router.get('/change-password', authController.changePassword);
router.post('/send-password', authController.sendPassword);
router.get('/get-password', authController.getPassword);
router.post('/set-password', authController.setPassword);
router.post('/change-password', authController.changePassword);

module.exports = router;
