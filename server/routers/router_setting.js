let router = require('express').Router();
let isAuth = require('../auth/auth').isAuth;
let User = require('../database/Schema').User;
let shortId = require('shortid');


router.route('/:name')
    .get(isAuth, async (req, res) => {
        let result = await User.findOne({'name': req.params.name});
        let context = {
            user: req.user,
            key_gen: result.keygen_translation
        }
        res.render('setting/index', context);
    })
    .post(isAuth, async (req, res) => {
        result = await User.updateOne({'name': req.params.name}, {'keygen_translation': shortId.generate()});
        res.redirect('/setting/'+req.params.name);
    })

module.exports = router;