const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');
const middlewareController = require('../app/controllers/MiddlewareController');

// Show homepage
router.get('/homepage', middlewareController.verifyToken, siteController.index);
router.get(
    '/introduce',
    middlewareController.verifyToken,
    siteController.intro,
);
router.get('/', siteController.index);

module.exports = router;
