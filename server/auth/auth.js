let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('../database/Schema').User;

passport.use('LocalRegister', new LocalStrategy(async function(username, password, done){
    try{
        let err, user = await User.findOne({name: username});
        if(err) { console.log(err); return done(err); }
        if(user){ 
            return done(null, false); 
        }else{
            let user = new User();
            user.name = username;
            user.password = user.cryptPassword(password);
            user.keygen_translation = user.generateKey();
            
            let err, usr = await user.save();
            if(err) throw err;
            return done(null, usr);
        }
    }catch(err){ console.log(err) }
}))

passport.use('LocalLogin', new LocalStrategy({ 
        usernameField: 'username',
        passwordField: 'password'
    }, async function(username, password, done){
        let err, user = await User.findOne({name: username});

        if(err) { console.log(err); done(err); }
        if(!user) { return done(null, false); }
        if(user){
            if(user.password === user.validPassword(password)){
                return done(null, user);
            }else{
                return done(null, false);
            }
        }
    }
))

passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });
  
passport.deserializeUser(async function(id, done) {
    let err, user = await User.findById(id);
    return done(err, user);
});

let isAuth = function(req, res, next){
    if(req.isAuthenticated()) { return next(); }
    return res.redirect('/');
}

module.exports = {
    passport: passport,
    isAuth: isAuth
}