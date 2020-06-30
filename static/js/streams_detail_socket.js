var socket = io();

let enter = document.querySelector('.stream__enter');
let txt = document.querySelector('.stream__textarea');
let dialog = document.querySelector('.stream__dialog');
let viewers = document.querySelector('.stream__viewers_count');

dialog.scrollTop = dialog.scrollHeight;

enter.addEventListener('click', function(){
    socket.emit('message', {"message": txt.value, "streamer": document.location.pathname.split('/').pop()})
})

txt.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        e.preventDefault();
        socket.emit('message', {"message": txt.value, "streamer": document.location.pathname.split('/').pop()})
        txt.value = "";
    }
});

socket.on('user', function(data){
    let message = document.createElement('li');
    message.innerHTML = "<p>"+data.user+": "+data.message+"</p>";
    message.className = "stream__message";
    dialog.appendChild(message);
    dialog.scrollTop = dialog.scrollHeight;
})

socket.on('connect', function(){
    socket.emit('join-room', {"streamer": document.location.pathname.split('/').pop()})
})

socket.on('count_users', function(count){
    viewers.innerHTML = count;
})