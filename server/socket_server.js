
module.exports = function(server){
    let socketio = require('socket.io');
    let Streams = require('./database/Schema').Streams;
    let User = require('./database/Schema').User;
    let io = socketio(server);
    console.log("SOCKET SERVER START");
    
    io.on('connection', function(socket){
        socket.on('join-room', function(data){
            socket['streamer'] = data.streamer;
            socket.join(data.streamer);
            io.in(data.streamer).clients(function(err ,clients){
                col_isers = new Set();
                clients.forEach(element => {
                    let ip = io.sockets.connected[element].handshake.headers['x-real-ip'] || 
                             io.sockets.connected[element].handshake.address;
                    col_isers.add(ip);
                });
                io.to(data.streamer).emit('count_users', col_isers.size)
            });
        });

        socket.on('message', async function(data){
            console.log(socket.request.user);
            if(socket.request.user.name){
                io.sockets.to(data.streamer).emit('user', {user: socket.request.user.name, message: data.message});
                let user = await User.findOne({"name": data.streamer});
                await Streams.updateOne({
                    "_id_user": user._id,
                    "status_stream": true
                },{ $push:{"messages": {user: socket.request.user.name, "message": data.message}}})
            };
        })
        
        socket.on('disconnect', async function(reason){
            if(socket['streamer'] !== undefined){
                io.in(socket['streamer']).clients(function(err ,clients){
                    col_isers = new Set();
                    clients.forEach(element => {
                        col_isers.add(io.sockets.connected[element].handshake.address)
                    });
                    io.to(socket['streamer']).emit('count_users', col_isers.size)
                });
            }
            console.log("dissconnect ", socket['streamer'], socket.handshake.headers['x-real-ip'] || socket.handshake.address);
        })
    })
    
    return io
}