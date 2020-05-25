let mongoose = require('mongoose');
let Schema = require('mongoose').Schema;


module.exports = new Schema({
    _id_user: mongoose.Types.ObjectId,
    messages: Array,
    status_stream: Boolean
});