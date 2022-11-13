const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');

const port = 3000;

const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

//Routing of rooms
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId : req.params.room });
});

//sockets
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userPeerId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userPeerId);
        socket.on('message', (chatMessage) => {
            io.to(roomId).emit('broadcastedMessage',chatMessage);
        });
    });
});


server.listen(process.env.PORT || port, () => {
  console.log(`Server started on port ${port}`);
});