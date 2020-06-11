let mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/stream', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('error', console.error.bind(console, 'DATABASE CONNECTION ERROR'));
mongoose.connection.once('open', function() { console.log("DATABASE CONNECTED"); });

module.exports = mongoose;