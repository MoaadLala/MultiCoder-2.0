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
        socket.email = data.email;
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
                    email: socket.email,
                    admin: true,
                },
            },
            spectators: {},
            winners: {},
            kicked: {},
            closed: false,
        };
        socket.emit('friendsAndFamilyGameCreated', [roomCode, JSON.stringify(rooms[roomCode])]);
        console.log(`rooms object: ${JSON.stringify(rooms)}`);
    });

    socket.on('joinARoom', (data) => {
        //data[0]: roomCode
        //data[1]: email
        if (data[0] in rooms) {
            let kicked = false;
            Object.keys(rooms[data[0]]['kicked']).forEach(key => {
                if (rooms[data[0]]['kicked'][key].email === data[1]) {
                    kicked = true;
                }
            });
            if (kicked) {
                socket.emit('joinARoom', [false, 'Kicked']);
            } else {
                socket.join(data[0]);
                if (rooms[data[0]].closed) {
                    rooms[data[0]]['spectators'] = {
                        ...rooms[data[0]]['spectators'],
                        [socket.id]: {
                            name: socket.name,
                            photo: socket.photo,
                            email: socket.email,
                            admin: false,
                        }
                    }
                } else {
                    rooms[data[0]]['players'] = {
                        ...rooms[data[0]]['players'],
                        [socket.id]: {
                            name: socket.name,
                            photo: socket.photo,
                            email: socket.email,
                            admin: false,
                        }
                    }
                }
                console.log(`${socket.id} joined a room, the room code is ${data[0]}`);
                console.log(`room object: ${JSON.stringify(rooms)}`);
                io.in(data[0]).emit('joinARoom', [true, JSON.stringify(rooms[data[0]])]);
            }
        } else {
            socket.emit('joinARoom', [false, 'NoRoom']);
        }
    });

    socket.on('leaveRoom', (data) => {
        // data[0]: the room code
        // data[1]: Whether the user was kicked or he just left
        // this could be sent from:
        // 1. Lobby Component, when a user is kicked or when a user leaves
        console.log('leaveRoom was triggered');
        console.log(socket.id);
        if (data[1] === false) {
            if (rooms[data[0]]['players'][socket.id]) {
                if (rooms[data[0]]['players'][socket.id].admin) {
                    rooms[data[0]]['players'][Object.keys(rooms[data[0]]['players'])[1]].admin = true;
                    io.to(data[0]).except(socket.id).emit('leaveMove', [socket.id, JSON.stringify(rooms[data[0]])]);
                    delete rooms[data[0]]['players'][socket.id];
                    io.to(Object.keys(rooms[data[0]]['players'])[0]).emit('newAdmin');
                } else {
                    delete rooms[data[0]]['players'][socket.id];
                }
            } else if (rooms[data[0]]['spectators'][socket.id]) {
                if (rooms[data[0]]['spectators'][socket.id].admin) {
                    rooms[data[0]]['spectators'][Object.keys(rooms[data[0]]['spectators'])[1]].admin = true;
                    io.to(data[0]).except(socket.id).emit('leaveMove', [socket.id, JSON.stringify(rooms[data[0]])]);
                    delete rooms[data[0]]['spectators'][socket.id];
                    console.log(JSON.stringify(rooms));
                } else {
                    delete rooms[data[0]]['spectators'][socket.id];
                }
            } else {
                if (rooms[data[0]]['winners'][socket.id].admin) {
                    rooms[data[0]]['winners'][Object.keys(rooms[data[0]]['winners'])[1]].admin = true;
                    io.to(data[0]).except(socket.id).emit('leaveMove', [socket.id, JSON.stringify(rooms[data[0]])]);
                    delete rooms[data[0]]['winners'][socket.id];
                    console.log(JSON.stringify(rooms));
                } else {
                    delete rooms[data[0]]['winners'][socket.id];
                }
            }
        }

        socket.leave(data[0]);
    });

    socket.on('globalMessage', (data) => {
        io.in(data[0]).emit('globalMessage', {name: data[1], image: data[2], message: data[3]});
    });

    socket.on('kickUser', (data) => {
        // data[0]: userId
        // data[1]: roomCode
        io.to(data[0]).emit('kicked', data[1]);
        rooms[data[1]]['kicked'][data[0]] = rooms[data[1]]['players'][data[0]];
        io.to(data[1]).except(data[0]).emit('kickMove', [data[0], JSON.stringify(rooms[data[1]])]);
        delete rooms[data[1]]['players'][data[0]];
        console.log(`rooms object: ${JSON.stringify(rooms)}`);
    });

    socket.on('startFriendsAndFamily', async(data) => {
        //data: roomCode
        const questions = await db.collection('questions').get();
        io.to(data).emit('startFriendsAndFamily', JSON.stringify(questions.docs[randomQuestionIndex(0, questions.size)].data()));
        rooms[data].closed = true;
    });

    socket.on('friendsAndFamilyWinner', (data) => {
        //data[0]: timer
        //data[1]: gameCode
        rooms[data[1]]['winners'][socket.id] = rooms[data[1]]['players'][socket.id];
        rooms[data[1]]['winners'][socket.id].timeScore = data[0];
        delete rooms[data[1]]['players'][socket.id];
        socket.to(data[1]).emit('friendsAndFamilyWinnerNotify', [rooms[data[1]]['winners'][socket.id].name, data[0], JSON.stringify(rooms[data[1]])]);
        socket.emit('youWonFriendsAndFamily', JSON.stringify(rooms[data[1]]));
    });

    socket.on('friendsAndFamilyLoser', (data) => {
        //data: gameCode
        socket.to(data).emit('friendsAndFamilyLoserNotify', rooms[data]['players'][socket.id].name);
        socket.emit('youLostFriendsAndFamily');
    });

    socket.on('restartFriendsAndFamilyGame', (data) => {
        //data: roomCode
        rooms[data] = {
            players: {...rooms[data]['winners'], ...rooms[data]['spectators']},
            spectators: {},
            winners: {},
            kicked: rooms[data]['kicked'],
            closed: false,
        }
        rooms[data].closed = false;
        io.to(data).emit('friendsAndFamilyGameRestarted', JSON.stringify(rooms[data]));
    });

    socket.on('unban', data => {
        // data[0] = UserId
        // data[1] = roomCode
        delete rooms[data[1]]['kicked'][data[0]];
        socket.emit('unban', JSON.stringify(rooms[data[1]]));
    });
});


http.listen(8080, () => {
    console.log('Listening on Port: 8080');
});