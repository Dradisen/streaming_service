let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('../database/Schema').User;

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use('LocalRegister', new LocalStrategy(function(username, password, done){
    
    User.findOne({name: username}, function(err, user){
        if(err) { 
            console.log(err);
            return done(err); 
        }
        if(user){ 
            return done(null, false); 
        }else{
            let us = new User();
            us.name = username;
            us.password = us.cryptPassword(password);
            us.keygen_translation = us.generateKey();

            us.save((err) => {
                if(err){
                    throw err;
                }
                return done(null, us);
            })
        }
    })
}))

passport.use('LocalLogin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, function(username, password, done){
    User.findOne({name: username}, function(err ,user){
        if(err) { 
            console.log(err);
            return done(err); 
        }
        if(!user) { return done(null, false); }
        if(user){
            if(user.password === user.validPassword(password)){
                return done(null, user);
            }else{
                return done(null, false);
            }
        }
    })
}))

module.exports = passport;
module.exports.isAuth = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/');

}