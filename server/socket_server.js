
module.exports = function(server){
    let socketio = require('socket.io');
    let Streams = require('./database/Schema').Streams;
    let User = require('./database/Schema').User;
    let io = socketio(server);
    console.log("SOCKET SERVER START");
    
    io.on('connection', function(socket){
        //console.log("ip is: ",socket.handshake);
        socket.on('join-room', function(data){
            socket.join(data.streamer);
            console.log("join", data);
        });

        socket.on('message', async function(data){
            if(socket.request.user.name){
                io.sockets.to(data.streamer).emit('user', {user: socket.request.user.name, message: data.message});
                let user = await User.findOne({"name": data.streamer});
                await Streams.updateOne({
                    "_id_user": user._id,
                    "status_stream": true
                },{ $push:{"messages": {user: socket.request.user.name, "message": data.message}}})
            };
        })
    })
    
    return io
}