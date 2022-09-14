const Gift = require('../models/Gift');
const {
    mongooseToObject,
    multipleMongooseToObject,
} = require('../../util/mongoose');
const { uploadFile, getFileStream } = require('../controllers/s3');
const { request } = require('express');
const fs = require('fs');

const PAGE_SIZE = 12;
const PAGE_SIZE_2 = 4;

class GiftController {
    // [GET] /gifts/:slug
    show(req, res, next) {
        Gift.findOne({ slug: req.params.slug })
            .then((gift) =>
                res.render('gifts/showDetailGift', {
                    gift: mongooseToObject(gift),
                    image0: gift.image[0],
                    image1: gift.image[1],
                    image2: gift.image[2],
                    fileImages: gift.fileImages,
                    data: req.data,
                    data_admin: req.data?.admin,
                    data_censor: req.data?.censor,
                    getImage: req.getImage,
                }),
            )
            .catch(next);
    }

    showCensored(req, res, next) {
        Gift.findOne({ slug: req.params.slug })
            .then((gift) =>
                res.render('gifts/showCensoredGift', {
                    gift: mongooseToObject(gift),
                    image0: gift.image[0],
                    image1: gift.image[1],
                    image2: gift.image[2],
                    fileImages: gift.fileImages,
                    data: req.data,
                    data_admin: req.data?.admin,
                    data_censor: req.data?.censor,
                    getImage: req.getImage,
                }),
            )
            .catch(next);
    }

    censoredComment(req, res, next) {
        Gift.updateOne(
            { _id: req.params.id },
            {
                status: req.body.status,
                comment: req.body.comment,
            },
        )
            .then(() =>
                res.render('censor/censored', {
                    data: req.data,
                    data_admin: req.data?.admin,
                    data_censor: req.data?.censor,
                }),
            )
            .catch(next);
    }

    showStoredGifts(req, res, next) {
        res.render('me/stored-gifts', {
            data: req.data,
            data_admin: req.data?.admin,
        });
    }

    showAll(req, res, next) {
        res.render('gifts/showAll', {
            data: req.data,
            data_admin: req.data?.admin,
            data_censor: req.data?.censor,
        });
    }

    search(req, res, next) {
        const searchedField = req.query.name;
        Gift.find({ name: { $regex: searchedField, $options: '$ui' } }).then(
            (data) => {
                res.send(data);
            },
        );
    }

    getAll(req, res, next) {
        var column = req.query.column;
        var type = req.query.type;
        var page = req.query.page;
        const searchedField = req.query.name;
        const typeField = req.query.typeGift;

        console.log('Typeee', req.query.typeGift);

        if (!searchedField && !typeField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;

                Gift.find({ status: 'Đã được duyệt', sent: false })
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({ status: 'Đã được duyệt', sent: false })
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
        // Co du lieu type, nhưng ko có dữ liệu search
        else if (!searchedField && typeField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;
                Gift.find({
                    type: { $regex: typeField, $options: '$ui' },
                    status: 'Đã được duyệt',
                    sent: false,
                })
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({
                            type: { $regex: typeField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({
                    type: { $regex: typeField, $options: '$ui' },
                    status: 'Đã được duyệt',
                    sent: false,
                })
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({
                            type: { $regex: typeField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }

        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;
                Gift.find({
                    name: { $regex: searchedField, $options: '$ui' },
                    status: 'Đã được duyệt',
                    sent: false,
                })
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({
                    name: { $regex: searchedField, $options: '$ui' },
                    status: 'Đã được duyệt',
                    sent: false,
                })
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
    }

    getAllStored(req, res, next) {
        var column = req.query.column;
        var type = req.query.type;
        var page = req.query.page;
        const searchedField = req.query.name;
        if (!searchedField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;

                Gift.find()
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find()
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                console.log('Co du lieu ', searchedField);
                var soLuongBoQua = (page - 1) * PAGE_SIZE;
                Gift.find({ name: { $regex: searchedField, $options: '$ui' } })
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({ name: { $regex: searchedField, $options: '$ui' } })
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
    }

    getAllCensored(req, res, next) {
        var column = req.query.column;
        var type = req.query.type;
        var page = req.query.page;
        const searchedField = req.query.name;
        if (!searchedField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;

                Gift.find({})
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({})
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({}).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE;

                Gift.find({ name: { $regex: searchedField, $options: '$ui' } })
                    .sort({ [column]: type })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE)
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({ name: { $regex: searchedField, $options: '$ui' } })
                    .sort({ [column]: type })
                    .then((data) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: data,
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
    }

    // [GET] /gifts/create
    create(req, res, next) {
        res.render('gifts/createDetailGift', {
            data: req.data,
            data_admin: req.data?.admin,
            data_censor: req.data?.censor,
        });
    }

    // [GET] /gifts/:id/edit
    edit(req, res, next) {
        Gift.findById(req.params.id)
            .then((gift) =>
                res.render('gifts/editGifts', {
                    gift: mongooseToObject(gift),
                    data: req.data,
                    data_admin: req.data?.admin,
                }),
            )
            .catch(next);
    }

    // [PUT] /gifts/:id
    update(req, res, next) {
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
                author: req.body.author,
                idAuthor: idAuthor,
            },
        )
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [DELETE] /gifts/:id
    destroy(req, res, next) {
        Gift.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [DELETE] /gifts/:id/force
    forceDestroy(req, res, next) {
        Gift.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [PATCH] /gifts/:id/restore
    restore(req, res, next) {
        Gift.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // [POST] /gifts/handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Gift.delete({ _id: { $in: req.body.giftIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid' });
        }
    }

    handleFormTrashActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Gift.deleteMany({ _id: { $in: req.body.giftIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);

                break;
            case 'restore':
                Gift.restore({ _id: { $in: req.body.giftIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid' });
        }
    }

    // [GET] /gifts/my-gifts
    MyGifts(req, res, next) {
        Gift.find({ idAuthor: req.data._id })
            .then((gifts) =>
                res.render('gifts/myGifts', {
                    data: req.data,
                    data_admin: req.data?.admin,
                    data_censor: req.data?.censor,
                    gifts: multipleMongooseToObject(gifts),
                }),
            )
            .catch((err) => res.json(err));
    }

    checkSentGifts(req, res, next) {
        Gift.updateOne(
            { _id: req.query.id },
            {
                sent: req.query.sent,
            },
        )
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getMyGifts(req, res, next) {
        var page = req.query.page;
        const searchedField = req.query.name;
        if (!searchedField) {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE_2;

                Gift.find({ idAuthor: req.data._id })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE_2)
                    .then((gifts) => {
                        Gift.countDocuments({ idAuthor: req.data._id }).then(
                            (total) => {
                                var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                                res.json({
                                    total: total,
                                    tongSoPage: tongSoPage,
                                    data: req.data,
                                    data_admin: req.data?.admin,
                                    gifts: multipleMongooseToObject(gifts),
                                });
                            },
                        );
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({ idAuthor: req.data._id })
                    .then((gifts) => {
                        Gift.countDocuments({ idAuthor: req.data._id }).then(
                            (total) => {
                                var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                                res.json({
                                    total: total,
                                    tongSoPage: tongSoPage,
                                    data: req.data,
                                    data_admin: req.data?.admin,
                                    gifts: multipleMongooseToObject(gifts),
                                });
                            },
                        );
                    })
                    .catch((err) => res.json(err));
            }
        }
        // Co du lieu search
        else {
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1;
                }
                var soLuongBoQua = (page - 1) * PAGE_SIZE_2;

                Gift.find({
                    name: { $regex: searchedField, $options: '$ui' },
                    idAuthor: req.data._id,
                })
                    .skip(soLuongBoQua)
                    .limit(PAGE_SIZE_2)
                    .then((gifts) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                            idAuthor: req.data._id,
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: req.data,
                                data_admin: req.data?.admin,
                                gifts: multipleMongooseToObject(gifts),
                            });
                        });
                    })
                    .catch((err) => res.status(500).json('Loi Server'));
            } else {
                Gift.find({
                    username: { $regex: searchedField, $options: '$ui' },
                    idAuthor: req.data._id,
                })
                    .then((gifts) => {
                        Gift.countDocuments({
                            name: { $regex: searchedField, $options: '$ui' },
                            idAuthor: req.data._id,
                        }).then((total) => {
                            var tongSoPage = Math.ceil(total / PAGE_SIZE_2);
                            res.json({
                                total: total,
                                tongSoPage: tongSoPage,
                                data: req.data,
                                data_admin: req.data?.admin,
                                gifts: multipleMongooseToObject(gifts),
                            });
                        });
                    })
                    .catch((err) => res.json(err));
            }
        }
    }
}

module.exports = new GiftController();
