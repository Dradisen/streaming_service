let NodeMediaServer = require('node-media-server');
let fs = require('fs');
let path = require('path');
let spawn = require('child_process').spawn;
let ffmpeg = require('./config/server').rtmp_server.trans.ffmpeg;
let config = require('./config/server').rtmp_server;
let host = require('./config/server').host;
let User = require('./database/Schema').User;
let Streams = require('./database/Schema').Streams;

let nms = new NodeMediaServer(config);
var thumbnails_interval;

nms.on('prePublish', async function(id, StreamPath, args) {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    let key = StreamPath.split('/');
    let id_key = key[key.length - 1];
    setTimeout(async function(){
        let err, user = await User.findOne({"keygen_translation": id_key});
        if(err){ 
            console.log(err);
        }else if(user){

            let err, usr = await User.findOne({"keygen_translation": id_key});
            let stream = new Streams({
                "_id_user": usr._id,
                "messages": [],
                "status_stream": true
            })          
            stream.save()
            err, update = await User.updateOne({"keygen_translation": id_key}, {$set: {"isStreaming": true}});
            try{
                
            }catch(err){
                
            }
            setTimeout(checkExistsProfile(id_key, user), 0);
            thumbnails_interval = setInterval(checkExistsProfile(id_key, user), 10000);
        }else{
            console.log('user not find');
            let session = nms.getSession(id);
            session.reject();
        }
    }, 12000)
    

});

nms.on('donePublish', async function(id, StreamPath, args){
    let key = StreamPath.split('/');
    let id_key = key[key.length - 1];
    let err, user, update;
    await User.updateOne({"keygen_translation": id_key}, {$set: {"isStreaming": false}});

    err, user = await User.findOne({"keygen_translation": id_key});
    err, update = await Streams.updateOne({"_id_user": user._id, "status_stream": true}, {"status_stream": false});
    console.log(err, update);

    clearInterval(thumbnails_interval);
})

function create_thumbnails(id_key, name){
    spawn(ffmpeg, 
        ['-y',
        '-i', 'http://'+host+':'+config.http.port+'/live/'+id_key+'/index.m3u8',
        '-ss', '00:00:01',
        '-vframes', '1',
        '-vf', 'scale=-2:300',
        path.join(path.dirname(__dirname), '/media/thumbnails/'+name+'/live.png'),
    ])
}

function checkExistsProfile(id_key, user){
    fs.access(path.join(path.dirname(__dirname), '/media/thumnails'), (err)=>{
        fs.mkdir(path.join(path.dirname(__dirname), '/media/thumbnails'), (err)=>{
            fs.access(path.join(path.dirname(__dirname), '/media/thumbnails/'+user.name), (err) => {
                if(err){
                    fs.mkdir(path.join(path.dirname(__dirname), '/media/thumbnails/'+user.name), (err) => {
                        create_thumbnails(id_key, user.name);
                    })
                }
                create_thumbnails(id_key, user.name);
            })
        });
    });
}

module.exports = nms;