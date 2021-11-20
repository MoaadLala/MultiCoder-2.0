const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
    }
});

function randomRoomCode() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



app.get('/', (req, res) => {
    res.send('Test');
});

let rooms = {};

io.on('connection', (socket) => {
    console.log(`New User Is Here, id = ${socket.id}`);
    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });

    socket.on('initFriendsAndFamilyGame', () => {
        let roomCode = randomRoomCode();
        console.log(`${socket.id} is joining a room, the room code is ${roomCode}`);
        socket.join(roomCode);
        rooms[roomCode] = [socket.id];
        socket.emit('friendsAndFamilyGameCreated', roomCode);
    });
});


http.listen(8080, () => {
    console.log('Listening on Port: 8080');
});