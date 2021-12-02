const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: 'https://localhost:3000',
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


const fs = require('firebase-admin');
const serviceAccount = require('./multicoder-900aa-firebase-adminsdk-9ihxu-a75886fcc6.json');

fs.initializeApp({
    credential: fs.credential.cert(serviceAccount),
});

const db = fs.firestore();

function randomQuestionIndex(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
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

    socket.on('login', (data) => {
        socket.name = data.name;
        socket.photo = data.photo;
    });

    socket.on('initFriendsAndFamilyGame', async() => {
        let roomCode = randomRoomCode();
        console.log(`${socket.id} has created a room, the room code is ${roomCode}`);
        socket.join(roomCode);
        rooms[roomCode] = {
            players: {
                [socket.id]: {
                    name: socket.name,
                    photo: socket.photo,
                    admin: true,
                },
            },
            spectators: {},
            closed: false,
        };
        socket.emit('friendsAndFamilyGameCreated', [roomCode, JSON.stringify(rooms[roomCode])]);
        console.log(`rooms object: ${JSON.stringify(rooms)}`);
    });

    socket.on('getPlayersObj', (data) => {
        //data: roomCode
        //This call is used to get the current players object, and could be comming from:
        // 1. Lobby Component
        socket.emit('getPlayersObj', JSON.stringify(rooms[data]));
    })

    socket.on('joinARoom', (data) => {
        //data: roomCode
        if (data in rooms) {
            socket.join(data);
            // rooms[data] = {...rooms[data], [socket.id]: {
            //     name: socket.name,
            //     photo: socket.photo,
            //     admin: false,
            // }};
            if (rooms[data].closed) {
                rooms[data]['spectators'] = {
                    ...rooms[data]['spectators'],
                    [socket.id]: {
                        name: socket.name,
                        photo: socket.photo,
                        admin: false,
                    }
                }
            } else {
                rooms[data]['players'] = {
                    ...rooms[data]['players'],
                    [socket.id]: {
                        name: socket.name,
                        photo: socket.photo,
                        admin: false,
                    }
                }
            }
            console.log(`${socket.id} joined a room, the room code is ${data}`);
            console.log(`room object: ${JSON.stringify(rooms)}`);
            io.in(data).emit('joinARoom', [true, JSON.stringify(rooms[data])]);
        } else {
            socket.emit('joinARoom', [false, {}]);
        }
    });

    socket.on('leaveRoom', (data) => {
        // data: the room code
        // this could be sent from:
        // 1. Lobby Component, when a user is kicked
        socket.leave(data);
    });

    socket.on('globalMessage', (data) => {
        io.in(data[0]).emit('globalMessage', {name: data[1], image: data[2], message: data[3]});
    });

    socket.on('kickUser', (data) => {
        // data[0]: userId
        // data[1]: roomCode
        io.to(data[0]).emit('kicked', data[1]);
        io.to(data[1]).except(data[0]).emit('kickMove', [data[0], JSON.stringify(rooms[data[1]])]);
        delete rooms[data[1]]['players'][data[0]];
        console.log(`rooms object: ${JSON.stringify(rooms)}`);
    });

    socket.on('startFriendsAndFamily', async(data) => {
        //data: roomCode
        const questions = await db.collection('questions').get();
        io.to(data).emit('startFriendsAndFamily', JSON.stringify(questions.docs[randomQuestionIndex(0, questions.size)]));
        rooms[data].closed = true;
    });
});


http.listen(8080, () => {
    console.log('Listening on Port: 8080');
});