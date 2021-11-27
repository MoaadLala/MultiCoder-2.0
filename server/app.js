const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://127.0.0.1:3000',
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
        console.log(`${socket.id} has created a room, the room code is ${roomCode}`);
        socket.join(roomCode);
        rooms[roomCode] = [socket.id];
        socket.emit('friendsAndFamilyGameCreated', roomCode);
    });

    socket.on('joinARoom', (data) => {
        if (data in rooms) {
            socket.join(data);
            console.log(`${socket.id} joined a room, the room code is ${data}`);
            console.log(`room object: ${rooms.toString()}`);
            socket.emit('joinARoom', true);
        } else {
            socket.emit('joinARoom', false);
        }
    })

    socket.on('globalMessage', (data) => {
        io.in(data[0]).emit('globalMessage', {name: data[1], image: data[2], message: data[3]});
    });
});


http.listen(8080, () => {
    console.log('Listening on Port: 8080');
});