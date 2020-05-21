let mongoose = require('mongoose');

module.exports = {
    User: mongoose.model('User', require('./UserSchema')),
    Streams: mongoose.model('Streams', require('./StreamsShema')),
}