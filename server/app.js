const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
    }
});



app.get('/', (req, res) => {
    res.send('Test');
});

io.on('connection', (socket) => {
    console.log('New User Is Here');
    socket.emit('connection', null);
    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
    socket.on('joinBtn', () => {
        console.log('User Just Tried to Join');
    });
});


http.listen(8080, () => {
    console.log('Listening on Port: 8080');
});