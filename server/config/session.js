let session = require('express-session');
let MongoStore = require('connect-mongo')(session);

module.exports = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url: 'mongodb://localhost/sessions',
        autoRemove: 'enabled'
    })
})