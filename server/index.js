const http = require('http');
const io = require('socket.io');
const GoPro = require('goproh4');
const MindstormsMailbox = require('./MindstormsMailbox');

(async () => {
    // GoPro
    const camera = new GoPro.Camera({
        ip: '10.5.5.9',
        broadcastip: '10.5.5.255',
        mac: 'xx:xx:xx:xx:xx:xx'
    })
    try {
        await camera.ready()
        console.log('Camera ok')
        await camera.mode(GoPro.Settings.Modes.Video, GoPro.Settings.Submodes.Video.Video)
        await camera.set(GoPro.Settings.VIDEO_RESOLUTION, GoPro.Settings.VideoResolution.R1080S)
        await camera.set(GoPro.Settings.VIDEO_FPS, GoPro.Settings.VideoFPS.F60)
        console.log('Camera settings ok')

    } catch (e) {
        console.log('[GoProg Error]', e)
    }

    // BLUETOOTH
    const mailbox = new MindstormsMailbox();
    mailbox.debug();
    mailbox.connect(() => console.log('Bluetooth ok'));

    // HTTP
    const httpServer = http.createServer();
    const httpPort = 8080;
    httpServer.listen(httpPort);
    console.log(`HTTP :${httpPort} ok`);

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

        client.on('animation', ({ start, end, duration }) => {
            console.log('animation', start, end, duration);
            sendPosition(start);
            setTimeout(() => {
                sendPosition(end);
            }, duration);
        });

        client.on('start', async () => {
            await camera.start()
            console.log('Video started')
        })
        client.on('stop', async () => {
            await camera.stop()
            console.log('Video stopped')
        })
    });
})()