let router = require('express').Router();
let passport = require('../auth/auth');
let axios = require('axios');
let User = require('../database/Schema').User;
let Streams = require('../database/Schema').Streams;
let config = require('../config/server')

router.get('/', async (req, res) => {
    let context = {};
    let promise = [];
    promise[0] = axios.get('/api/streams', {proxy: {port: 8888}});
    promise[1] = User.find();

    let result = await Promise.all(promise);
    context['user'] = req.user;

    if(JSON.stringify(result[0].data) !== "{}"){
        context['streaming'] = true;
    }else{
        context['streaming'] = false;
    }
    
    context['users'] = result[1].filter(element => {
        return element['isStreaming'] == true
    });
    return res.render('streams/index', context);
})

router.get('/:name', async (req, res) => {
    let isUserAuth = req.user ? false : true;
    let user_streamer = await User.findOne({"name": req.params.name});
    let stream = await Streams.findOne({"_id_user": user_streamer._id, "status_stream": true});
    context = {
        host: config.host,
        port: config.rtmp_server.http.port,
        user_streamer: user_streamer,
        messages: stream.messages,
        isUserAuth: isUserAuth,
        user: req.user
    };
    return res.render('streams/detail', context);
})


module.exports = router;