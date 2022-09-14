const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 1104;

const SortMiddleware = require('./app/middlewares/SortMiddleware');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const nodeMailer = require('nodemailer');
const mongoose = require('mongoose');
const route = require('./routes');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

app.use(cookieParser('secret'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ cookie: { maxAge: null } }));

const db = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI ||
                'mongodb+srv://khanhduong2t2:ngay2thang2@vanlanggiftsteam6.leeac.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
            },
        );
        console.log('Connected successfully');
    } catch (e) {
        console.log(e);
        console.log('connection failed');
    }
};

db();

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        sum: (a, b) => a + b,
        compare: (a, b) => a !== b,
        sortable: (field, sort) => {
            const sortType = field === sort.column ? sort.type : 'default';

            const icons = {
                default: 'oi oi-elevator',
                asc: 'oi oi-sort-ascending',
                desc: 'oi oi-sort-descending',
            };
            const types = {
                default: 'desc',
                asc: 'desc',
                desc: 'asc',
            };
            const icon = icons[sortType];
            const type = types[sortType];

            return `<a href="?_sort&column=${field}&type=${type}">
            <span class="${icon}"></span>
            </a>`;
        },
    },
});
// TEMPLATE ENGINE
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

//HTTP logger
app.use(morgan('combined'));

app.use(methodOverride('_method'));

// Custom Middleware
app.use(SortMiddleware);

const User = require('../src/app/models/User');
const Info = require('../src/app/models/Info');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Routes init
route(app);

server.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});

io.on('connection', function (socket) {
    console.log('Co nguoi ket noi' + socket.id);

    socket.on('tao-phong', function (data) {
        socket.Phong = data;
        socket.join(socket.Phong);
        console.log(socket.adapter.rooms);
    });

    socket.on('user-gui-tin', function (data) {
        io.sockets.in(socket.Phong).emit('server-gui-lai-tin', {
            id: data.id,
            nd: data.nd,
        });
    });

    socket.on('toi-dang-go-chu', function (data) {
        var nd = data.nameCurrent + ' đang soạn tin';
        io.sockets.in(socket.Phong).emit('ai-do-dang-go-chu', {
            nd: nd,
            myId: data.myId,
            idRoom: data.idRoom,
        });
    });

    socket.on('toi-stop-go-chu', function (data) {
        io.sockets.in(socket.Phong).emit('ai-do-stop-go-chu', data);
    });
});
