const http = require('http');
const io = require('socket.io');
const MindstormsMailbox = require('./MindstormsMailbox');

// BLUETOOTH
const mailbox = new MindstormsMailbox();
mailbox.debug();
mailbox.connect();

// HTTP
const httpServer = http.createServer();
const httpPort = 8080;
httpServer.listen(httpPort);
console.log('Server listening on ' + httpPort);

// SOCKET.IO
const socket = io.listen(httpServer);

function sendPosition(position) {
    console.log('send position', position);
    mailbox.send('position', position);
}

socket.on('connection', client => {
    console.log('Client connected');

    client.on('position', position => {
        console.log('position', position);
        sendPosition(position);
    });

    client.on('animation', ({start, end, duration}) => {
        console.log('animation', start, end, duration);
        sendPosition(start);
        setTimeout(() => {
            sendPosition(end);
        }, duration);
    });
});
