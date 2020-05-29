let NodeMediaServer = require('node-media-server');
let fs = require('fs');
let path = require('path');
let spawn = require('child_process').spawn;
let ffmpeg = require('./config/server').rtmp_server.trans.ffmpeg;
let config = require('./config/server').rtmp_server;
let User = require('./database/Schema').User;
let Streams = require('./database/Schema').Streams;

let nms = new NodeMediaServer(config);
var thumbnails_interval;

nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    let key = StreamPath.split('/');
    let id_key = key[key.length - 1];
    
    User.findOne({"keygen_translation": id_key}, function(err, user){ 
        if(err){
            console.log(err);
        }else if(user){

            User.findOne({"keygen_translation": id_key}, (err, res) => {
                let stream = new Streams({
                    "_id_user": res._id,
                    "messages": [],
                    "status_stream": true
                })          
                stream.save()
            })

            User.updateOne({"keygen_translation": id_key}, {$set: {"isStreaming": true}}, function(err, up){
    
            });
            
            thumbnails_interval = setInterval(function(){
                fs.access(path.join(path.dirname(__dirname), '/media/thumbnails/'+user.name), (err) => {
                    if(err){
                        fs.mkdir(path.join(path.dirname(__dirname), '/media/thumbnails/'+user.name), (err) => {
                            create_thumbnails(id_key, user.name);
                        })
                    }
                    create_thumbnails(id_key, user.name);
                })
            }, 10000);
        }else{
            console.log('user not find');
            let session = nms.getSession(id);
            session.reject();
        }
    })
    
  });

nms.on('donePublish', (id, StreamPath, args) => {

    let key = StreamPath.split('/');
    let id_key = key[key.length - 1];
    
    User.updateOne({"keygen_translation": id_key}, {$set: {"isStreaming": false}}, function(err, up){
        console.log(err, up);
    });

    User.findOne({"keygen_translation": id_key}, function(err, user){ 
        Streams.updateOne({"_id_user": user._id, "status_stream": true}, {"status_stream": false}, function(){
            
        });
    })

    clearInterval(thumbnails_interval);
})

function create_thumbnails(id_key, name){
    spawn(ffmpeg, 
        ['-y',
        '-i', 'http://127.0.0.1:8888/live/'+id_key+'/index.m3u8',
        '-ss', '00:00:01',
        '-vframes', '1',
        '-vf', 'scale=-2:300',
        path.join(path.dirname(__dirname), '/media/thumbnails/'+name+'/live.png'),
    ])
}
module.exports = nms;