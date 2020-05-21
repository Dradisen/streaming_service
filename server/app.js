let express = require('express');
let hbs = require('express-handlebars');
let path = require('path');
let http = require('http');
let nms = require('./media_server');
let passport = require('./auth/auth');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
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

console.log(path.dirname(__dirname) + "/node_modules");
app.engine('hbs', hbsSetting.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));
app.use('/scripts', express.static('node_modules'))
app.use(express.static('static'));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', require('./routers/router_auth'));
app.use('/streams', require('./routers/router_streams'));
app.use('/setting', require('./routers/router_setting'));

app.get('/', async (req ,res) => {
    context = {
        user: req.user
    }
    //console.log(req.session);
    res.render('index', context);
})


server.listen(config.port, () => {
    console.log(`server lister on port: http://localhost:${config.port}`);
    nms.run();
})

