let express = require('express');
let hbs = require('express-handlebars');
let path = require('path');
let http = require('http');
let nms = require('./media_server');
let passport = require('./auth/auth');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let axios = require('axios');
let config = require('./config/default');
let socketio = require('socket.io');

mongoose.connect('mongodb://127.0.0.1/stream', {useNewUrlParser: true});

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log("we're connected!");
});

let app = express();
let server = http.createServer(app);
let io = socketio(server);

let hbsSetting = hbs.create({
    layoutsDir: 'server/views/layouts',
    defaultLayout: 'default',
    extname: '.hbs'
});

hbsSetting._renderTemplate = function(template, context, options){
    options.allowProtoMethodsByDefault = true;
    options.allowProtoPropertiesByDefault = true;

    return template(context, options);
}

app.engine('hbs', hbsSetting.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));
app.use('/scripts', express.static('node_modules'))
app.use(express.static('static'));
let sessionMiddle = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url: 'mongodb://localhost/sessions',
        autoRemove: 'enabled'
    })
})

//промежуточная обработка сокета req и res
io.use(function(socket, next){
    sessionMiddle(socket.request, socket.request.res, next)
})
app.use(sessionMiddle);
//----------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let sessionPassportInit = passport.initialize();
let sessionPassport = passport.session();
io.use(function(socket, next){
    sessionPassportInit(socket.request, socket.request.res, next)
})
io.use(function(socket, next){
    sessionPassport(socket.request, socket.request.res, next);
});
app.use(sessionPassportInit);
app.use(sessionPassport);


app.use('/auth', require('./routers/router_auth'));
app.use('/streams', require('./routers/router_streams'));
app.use('/setting', require('./routers/router_setting'));

app.get('/', async (req ,res) => {
    context = {
        user: req.user
    }
    res.render('index', context);
})


server.listen(config.port, () => {
    console.log(`server lister on port: http://localhost:${config.port}`);
    nms.run();
})


let Streams = require('./database/Schema').Streams;
let User = require('./database/Schema').User;

io.on('connection', function(socket){
    socket.on('join-room', function(data){
        socket.join(data.streamer);
        console.log("join", data);
    });

    socket.on('message', async function(data){
        if(socket.request.user.name){
            io.sockets.to(data.streamer).emit('user', {user: socket.request.user.name, message: data.message});
            let user = await User.findOne({"name": data.streamer});
            await Streams.updateOne({
                "_id_user": user._id,
                "status_stream": true
            },{ $push:{"messages": {user: socket.request.user.name, "message": data.message}}})
        };
    })
})

