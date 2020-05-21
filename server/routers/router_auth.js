let router = require('express').Router();
let passport = require('../auth/auth');
let isAuth = require('../auth/auth').isAuth;

router.route('/register')
    .get((req, res) => {
        res.render('auth/register');
    })
    .post(passport.authenticate('LocalRegister', {
        successRedirect: '/auth/login',
        failureRedirect: '/auth/register'
    }))

router.route('/login')
    .get((req, res) => {
        res.render('auth/login');
    })
    .post(passport.authenticate('LocalLogin', {
        successRedirect: '/',
        failureRedirect: '/auth/login'
    }))

router.get('/logout', isAuth, (req, res) => {
    req.logOut();
    res.redirect('/');
})

module.exports = router