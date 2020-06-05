let router = require('express').Router();

router.route('/live/*/index.m3u8')
    .get(function(req, res, next){
        console.log("MEDIA URL");

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", true);
        res.sendStatus(200) 
    })

module.exports = router