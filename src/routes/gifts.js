const express = require('express');
const router = express.Router();

const giftController = require('../app/controllers/GiftController');
const middlewareController = require('../app/controllers/MiddlewareController');
const store = require('../app/controllers/Multer');

const Gift = require('../app/models/Gift');
const Info = require('../app/models/Info');
const User = require('../app/models/User');

const { uploadFile, getFileStream } = require('../app/controllers/s3');

//show my gifts
router.get(
    '/my-gifts',
    middlewareController.verifyToken,
    giftController.MyGifts,
);
router.get(
    '/get-my-gifts',
    middlewareController.verifyToken,
    giftController.getMyGifts,
);

router.post(
    '/update-sent-gifts',
    middlewareController.verifyToken,
    giftController.checkSentGifts,
);

router.get(
    '/show-stored-gifts',
    middlewareController.verifyToken,
    giftController.showStoredGifts,
);

router.get('/get-all', middlewareController.verifyToken, giftController.getAll);
router.get(
    '/get-all-stored',
    middlewareController.verifyToken,
    giftController.getAllStored,
);
router.get(
    '/censored/get-all',
    middlewareController.verifyToken,
    giftController.getAllCensored,
);
router.get(
    '/show-all',
    middlewareController.verifyToken,
    giftController.showAll,
);
router.post('/search', middlewareController.verifyToken, giftController.search);

// Create Gift
router.get('/create', middlewareController.verifyToken, giftController.create);

router.get('/images/:key', (req, res) => {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
});

router.post(
    '/store',
    middlewareController.verifyToken,
    store.array('images', 3),
    async (req, res) => {
        try {
            const userAuthor = await User.findById(req.data._id);
            const infoAuthor = await Info.findOne({
                username: userAuthor.username,
            });

            const files = req.files;
            const results = await uploadFile(files);
            const arrayKey = [];
            results.map((res) => arrayKey.push(res.Key));

            const idAuthor = req.data._id;
            const image = [req.body.image, req.body.image1, req.body.image2];

            const name = req.body.name.split(' ');
            var realName = '';
            for (let i = 0; i < name.length; i++) {
                if (name[i] !== '') {
                    realName = realName + name[i] + ' ';
                }
            }
            req.body.name = realName;

            const gift = await new Gift({
                name: req.body.name,
                description: req.body.description,
                quality: req.body.quality,
                image: image,
                fileImages: arrayKey,
                type: req.body.type,
                author: infoAuthor.name,
                idAuthor: idAuthor,
            });
            gift.save().then(() => res.redirect('/homepage'));
        } catch (err) {
            res.status(500).json(err);
        }
    },
);

router.get('/:id/edit', middlewareController.verifyToken, giftController.edit);
router.post('/handle-form-actions', giftController.handleFormActions);
router.post(
    '/handle-form-trash-actions',
    giftController.handleFormTrashActions,
);

router.put(
    '/:id',
    middlewareController.verifyToken,
    store.array('images', 3),
    async (req, res) => {
        try {
            const files = req.files;
            const results = await uploadFile(files);

            const arrayKey = [];
            results.map((res) => arrayKey.push(res.Key));

            const idAuthor = req.data._id;

            const image = [];
            if (req.body.image0 !== undefined) {
                image.push(req.body.image0);
            }
            if (req.body.image1 !== undefined) {
                image.push(req.body.image1);
            }
            if (req.body.image2 !== undefined) {
                image.push(req.body.image2);
            }
            Gift.updateOne(
                { _id: req.params.id },
                {
                    name: req.body.name,
                    description: req.body.description,
                    image: image,
                    fileImages: arrayKey,
                    //  author: req.body.author,
                    type: req.body.type,
                    quality: req.body.quality,
                    idAuthor: idAuthor,
                    status: 'Chờ xét duyệt',
                },
            )
            .then(() => res.redirect('back'));
        } catch (err) {
            res.status(500).json(err);
        }
    },
);

router.patch('/:id/restore', giftController.restore);
router.delete('/:id', giftController.destroy);
router.delete('/:id/force', giftController.forceDestroy);

// Show detail gift
router.get('/:slug', middlewareController.verifyToken, giftController.show);

module.exports = router;
