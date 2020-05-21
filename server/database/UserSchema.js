let mongoose = require('mongoose');
let Schema = require('mongoose').Schema;
let md5 = require('js-md5');
let shortId = require('shortid');

let User = new Schema({
    name: String,
    password: String,
    keygen_translation: String,
    isStreaming: Boolean
});

User.methods.cryptPassword = (password) => {
    return md5(password);
}

User.methods.validPassword = (chekedPassword) => {
    return md5(chekedPassword);
}

User.methods.generateKey = () => {
    return shortId.generate();
}


module.exports = User;