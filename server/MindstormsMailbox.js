const EventEmitter = require('events');
const BluetoothSerialPort = require('bluetooth-serial-port');

function flatten(arr) {
    const flat = [].concat(...arr);
    return flat.some(Array.isArray) ? flatten(flat) : flat;
}

class MindstormsMailbox extends EventEmitter {
    constructor() {
        super();

        this.serial = null;
        this.debugEnabled = false;
    }

    /**
     * Switch debug mode on or off
     * @param debug
     */
    debug(debug = true) {
        this.debugEnabled = debug;
    }

    /**
     * Sends a message to console.log if debug is enabled
     * @param args
     */
    debugMessage(...args) {
        if (this.debugEnabled) {
            console.log(...args);
        }
    }

    connect() {
        this.serial = new BluetoothSerialPort.BluetoothSerialPort();

        this.serial.on('found', (address, name) => {
            this.serial.findSerialPortChannel(address, channel => {
                this.serial.connect(address, channel, () => {
                    this.debugMessage('connected');

                    this.serial.on('data', this.handleIncomingData.bind(this));
                }, () => {
                    this.debugMessage('cannot connect');
                });

                this.serial.close();
            }, () => {
                this.debugMessage('found nothing');
            });
        });

        this.serial.inquire();
    }

    /**
     * @param {Buffer} buffer
     */
    handleIncomingData(buffer) {
        this.debugMessage('receive', buffer);

        const messageBytes = buffer.readUIntLE(0, 2);
        const messageCounter = buffer.readUIntLE(2, 2);
        const tt = buffer.readUIntLE(4, 1);
        const ss = buffer.readUIntLE(5, 1);
        const mailBoxNameLength = buffer.readUIntLE(6, 1);
        const mailBoxName = buffer.toString('ascii', 7, 6 + mailBoxNameLength); // without null byte
        const payloadLength = buffer.readUIntLE(7 + mailBoxNameLength, 2);

        const payloadIndexStart = 9 + mailBoxNameLength;
        let payload = null;

        if (payloadLength === 1) {
            // type boolean is a single byte, 1=true, 0=false
            payload = !!buffer.readUIntLE(payloadIndexStart, 1);
        } else if (payloadLength === 4 && buffer.toString()) {
            // type number is a float on 4 bytes
            payload = buffer.readFloatLE(payloadIndexStart);
        } else {
            // default type is string
            payload = buffer.toString('ascii', payloadIndexStart, payloadIndexStart + payloadLength);

            // remove ending null byte
            if (payload.chatCodeAt(payload.length - 1) === 0) {
                payload = payload.substr(0, payload.length - 1);
            }
        }

        const data = {
            messageBytes,
            messageCounter,
            tt,
            ss,
            mailBoxName,
            payload,
        };

        this.debugMessage('receive', data);

        this.emit(mailBoxName, data);
    }

    send(mailboxName, payload) {
        this.debugMessage('send', mailboxName, payload);

        // add null bytes if necessary
        if (mailboxName.charCodeAt(mailboxName.length - 1) !== 0) {
            mailboxName += '\0';
        }

        const mailboxLength = mailboxName.length;

        let payloadLength = 0;
        switch (typeof payload) {
            case 'string':
                if (payload.charCodeAt(payload.length - 1) !== 0) {
                    payload += '\0';
                }

                payloadLength = payload.length;
                break;
            case 'number':
                payloadLength = 4;
                break;
            case 'boolean':
                payloadLength = 1;
                break;
            default:
                throw 'Unhandled payload type ' + (typeof payload);
        }

        const bufferLength = 9 + mailboxLength + payloadLength;

        const buffer = Buffer.alloc(bufferLength);

        // length
        buffer.writeUIntLE(bufferLength - 2, 0, 2); // Do not count the two length bytes
        // counter
        buffer.writeUIntLE(1, 2, 2);
        // tt
        buffer.writeUIntLE(0x81, 4, 1);
        // ss
        buffer.writeUIntLE(0x9E, 5, 1);
        // mailbox length
        buffer.writeUIntLE(mailboxLength, 6, 1);
        // mailbox
        buffer.write(mailboxName, 7, mailboxLength);
        // payload length
        buffer.writeUIntLE(payloadLength, 7 + mailboxLength, 2);
        // payload
        const payloadIndexStart = 9 + mailboxLength;
        switch (typeof payload) {
            case 'string':
                buffer.write(payload, payloadIndexStart, payloadLength);
                break;
            case 'number':
                buffer.writeFloatLE(payload, payloadIndexStart);
                break;
            case 'boolean':
                buffer.writeUIntLE(payload ? 1 : 0, payloadIndexStart, 1);
                break;
        }

        this.debugMessage('send', buffer);

        if (!this.serial.isOpen()) {
            console.error('Serial is closed');
            return;
        }

        this.serial.write(buffer, (err, bytesWritten) => {
            if (err) {
                console.error('Write error', err);
            }

            if (bytesWritten) {
                this.debugMessage('Written ' + bytesWritten + ' bytes');
            }
        });
    }
}

module.exports = MindstormsMailbox;
