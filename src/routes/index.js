const siteRouter = require('./site');
const authRouter = require('./auth');
const censorRouter = require('./censor');
const meRouter = require('./me');
const giftsRouter = require('./gifts');
const usersRouter = require('./users');
const messengerRouter = require('./messenger');
const messageRouter = require('./messages');
const conversationRouter = require('./conversations');

function route(app) {
    app.use('/auth', authRouter);
    app.use('/censored', censorRouter);
    app.use('/me', meRouter);
    app.use('/gifts', giftsRouter);
    app.use('/users', usersRouter);
    app.use('/messenger', messengerRouter);
    app.use('/messages', messageRouter);
    app.use('/conversations', conversationRouter);
    app.use('/', siteRouter);
}

module.exports = route;
