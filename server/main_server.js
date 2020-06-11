let express = require('express');
let hbs = require('./config/handlebars').setting;
let path = require('path');
let http = require('http');
let nms = require('./media_server');
let passport = require('./auth/auth').passport;
let DB = require('./config/database'); 
let bodyParser = require('body-parser');
let session = require('./config/session');
let config = require('./config/server');


let app = express();
let server = http.createServer(app);
let io = require('./socket_server')(server);

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

app.use('/scripts', express.static('node_modules'))
app.use('/media', express.static('media'))
app.use('/thumbnails', express.static('media/thumbnails'))
app.use(express.static('static'));

//промежуточная обработка сокета req и res
io.use(function(socket, next){
    session(socket.request, socket.request.res, next)
})
app.use(session);
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
app.use('/media', require('./routers/router_media'));

app.get('/', async (req ,res) => {
    let context = { user: req.user }
    res.render('index', context);
})

server.listen(config.port, () => {
    console.log(`server lister on port: http://localhost:${config.port}`);
    nms.run();
})