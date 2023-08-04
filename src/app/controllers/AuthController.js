const User = require('../models/User');
const Info = require('../models/Info');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var path = require('path');

const { mongooseToObject } = require('../../util/mongoose');

//Verify Email
var nodeMailer = require('nodemailer');
require('dotenv/config');

const AuthController = {
    // [GET] /auth/register
    register: async (req, res) => {
        res.render('auth/register');
    },

    // [POST] /auth/register
    registerCon: async (req, res) => {
        try {
            var validRegex =
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            var format = [
                '`',
                '!',
                '@',
                '#',
                '$',
                '%',
                '^',
                '&',
                '*',
                '(',
                ')',
                '-',
                '_',
                '+',
                '=',
                ':',
                ';',
                '"',
                "'",
                '<',
                ',',
                '>',
                '.',
                '?',
                '/',
                '|',
                '\\',
            ];

            if (req.body.email === '') {
                return res.json({
                    message: 'Vui lòng điền đầy đủ thông tin đăng kí',
                });
            }
            if (
                !req.body.email.match(validRegex) ||
                !req.body.email.includes('@gmail.com')
            ) {
                return res.json({
                    message: 'Email của bạn không hợp lệ',
                });
            }
            if (req.body.username === '') {
                return res.json({
                    message: 'Vui lòng điền đầy đủ thông tin đăng kí',
                });
            }

            if (req.body.username.includes(' ')) {
                return res.json({
                    message: 'Tên đăng nhập không được chứa khoảng trắng',
                });
            }

            if (req.body.username.length < 6) {
                return res.json({
                    message: 'Tên đăng nhập ít nhất 6 kí tự',
                });
            }
            for (var i = 0; i < format.length; i++) {
                if (req.body.username.includes(format[i])) {
                    return res.json({
                        message: 'Tên đăng nhập không được chứa kí tự đặc biệt',
                    });
                }
            }

            if (req.body.password === '') {
                return res.json({
                    message: 'Vui lòng điền đầy đủ thông tin đăng kí',
                });
            }

            if (req.body.password.includes(' ')) {
                return res.json({
                    message: 'Mật khẩu không được chứa khoảng trắng',
                });
            }

            if (req.body.password.length < 6) {
                return res.json({
                    message: 'Mật khẩu phải dài hơn 6 kí tự',
                });
            }

            if (req.body.confirmPassword === '') {
                return res.json({
                    message: 'Vui lòng điền đầy đủ thông tin đăng kí',
                });
            }

            const data = await User.findOne({
                username: req.body.username,
            });
            const data2 = await User.findOne({
                email: req.body.email,
            });

            if (data2) {
                return res.json({
                    message:
                        'Email đã được sử dụng. Vui lòng sử dụng email khác',
                });
            } else if (data) {
                return res.json({
                    message:
                        'Tên đăng nhập đã được sử dụng. Vui lòng sử dụng tên khác',
                });
            } else if (req.body.password != req.body.confirmPassword) {
                return res.json({
                    message: 'Mật khẩu xác nhận không giống. Vui lòng nhập lại',
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.password, salt);
                User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashed,
                });

                //Verify Email
                let transporter = nodeMailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'vanlang9ifts@gmail.com',
                        pass: 'tzpchelypepgteew',
                    },
                });
                const email = req.body.email;
                const link = process.env.APP_URL;
                // const link = 'https://vanlanggifts.herokuapp.com';
                await transporter.sendMail({
                    from: 'vanlang9ifts@gmail.com',
                    to: email,
                    subject: 'Welcom to VanLangGift',
                    text: 'Hello world ?',
                    html: `<b>Cảm ơn bạn đã đăng kí. Hãy xác nhận để đi đến đăng nhập <a href="${link}/auth/verify?email=${email}">Verify</a></b>`,
                });

                Info.create({
                    username: req.body.username,
                    email: req.body.email,
                });
                return res.json({
                    message: '',
                });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    verify: async (req, res, next) => {
        try {
            const user = await User.updateOne(
                { email: req.query.email },
                { email_verify: true },
            );
            res.redirect('/auth/login');
        } catch (err) {
            res.status(500).json(err);
        }
    },

    forgot: async (req, res, next) => {
        try {
            res.render('auth/sendForgot');
        } catch (err) {
            res.status(500).json(err);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            res.render('auth/changePassword', {
                email: req.query.email,
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    sendPassword: async (req, res, next) => {
        try {
            var validRegex =
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (req.body.email === '') {
                return res.json({
                    message: 'Vui lòng điền Email',
                });
            } else if (
                !req.body.email.match(validRegex) ||
                !req.body.email.includes('@gmail.com')
            ) {
                return res.json({
                    message: 'Email của bạn không hợp lệ',
                });
            } else {
                let transporter = nodeMailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'vanlang9ifts@gmail.com',
                        pass: 'tzpchelypepgteew',
                    },
                });
                // const link = process.env.APP_URL;
                const link = 'https://vanlanggifts.herokuapp.com';
                const email = req.body.email;
                await transporter.sendMail({
                    from: 'vanlang9ifts@gmail.com',
                    to: email,
                    subject: 'Welcom to VanLangGift',
                    text: 'Hello world ?',
                    html: `<b><a href="${link}/auth/get-password?email=${email}">Lấy lại mật khẩu</a></b>`,
                });
                return res.json({
                    message: '',
                });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getPassword: async (req, res, next) => {
        try {
            res.render('auth/formGetPassword', {
                email: req.query.email,
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    setPassword: async (req, res, next) => {
        try {
            if (req.body.password === '') {
                return res.json({
                    message: 'Vui lòng điền mật khẩu',
                });
            }
            if (req.body.password.length < 6) {
                return res.json({
                    message: 'Mật khẩu phải dài hơn 6 kí tự',
                });
            }
            if (req.body.confirmPassword === '') {
                return res.json({
                    message: 'Vui lòng điền xác thực mật khẩu',
                });
            }
            if (req.body.password != req.body.confirmPassword) {
                return res.json({
                    message: 'Mật khẩu xác nhận không giống. Vui lòng nhập lại',
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.password, salt);
                const user = await User.updateOne(
                    { email: req.query.email },
                    { password: hashed },
                );
                return res.json({
                    message: '',
                });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const getUser = await User.find({ email: req.query.email });

            const passHash = await bcrypt.compareSync(
                req.body.oldPassword,
                getUser[0].password,
            );

            if (req.body.oldPassword === '') {
                return res.json({
                    message: 'Vui lòng điền mật khẩu cũ',
                });
            }

            if (req.body.password === '') {
                return res.json({
                    message: 'Vui lòng điền mật khẩu mới',
                });
            }

            if (req.body.password.includes(' ')) {
                return res.json({
                    message: 'Mật khẩu không được chứa khoảng trắng',
                });
            }

            if (req.body.password.length < 6) {
                return res.json({
                    message: 'Mật khẩu phải dài hơn 6 kí tự',
                });
            }
            if (req.body.confirmPassword === '') {
                return res.json({
                    message: 'Vui lòng điền xác thực mật khẩu',
                });
            }
            if (req.body.password != req.body.confirmPassword) {
                return res.json({
                    message: 'Mật khẩu xác nhận không giống. Vui lòng nhập lại',
                });
            }

            if (req.body.oldPassword === req.body.password) {
                return res.json({
                    message: 'Mật khẩu mới không được giống mật khẩu cũ !',
                });
            }

            if (!passHash) {
                return res.json({
                    message: 'Mật khẩu cũ không chính xác !',
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.password, salt);
                const user = await User.updateOne(
                    { email: req.query.email },
                    { password: hashed },
                );
                return res.json({
                    message: 'Đổi mật khẩu thành công',
                });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    notification: async (req, res, next) => {
        res.render('auth/notification');
    },

    notification2: async (req, res, next) => {
        res.render('auth/notification2');
    },

    notification3: async (req, res, next) => {
        res.render('auth/notification3');
    },

    // [GET] /auth/login
    login: async (req, res, next) => {
        res.render('auth/login');
    },
    // [POST] /auth/login
    loginCon: async (req, res, next) => {
        try {
            if (req.body.username === '') {
                return res.json({
                    message: 'Vui lòng điền Tên đăng nhập',
                });
            }
            if (req.body.password === '') {
                return res.json({
                    message: 'Vui lòng điền Mật khẩu',
                });
            }
            const data = await User.findOne({
                username: req.body.username,
            });

            if (!data) {
                return res.json({
                    message:
                        'Tài khoản hoặc mật khẩu đã sai. Vui lòng nhập lại',
                });
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                data.password,
            );
            if (!validPassword) {
                return res.json({
                    message:
                        'Tài khoản hoặc mật khẩu đã sai ! Vui lòng nhập lại',
                });
            }

            if (data && validPassword) {
                if (data.email_verify === true) {
                    var accessToken = await jwt.sign(
                        {
                            _id: data._id,
                        },
                        'ngay2thang2',
                    );
                    var refreshToken = await jwt.sign(
                        {
                            _id: data._id,
                        },
                        'ngay11thang4',
                    );
                    return res.json({
                        message: 'Đăng nhập thành công',
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    });
                } else {
                    return res.json({
                        message:
                            'Tài khoản hoặc mật khẩu đã sai ! Vui lòng nhập lại',
                    });
                }
            } else {
                return res.json('that bai');
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    userLogout: async (req, res, next) => {
        try {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.render('auth/login');
        } catch (err) {
            res.status(500).json(err);
        }
    },
};

module.exports = AuthController;
