let mongoose = require('mongoose');
let Shema = mongoose.Schema; 

module.exports = new Shema({
    _id: mongoose.Types.ObjectId,
    messages: Array
})