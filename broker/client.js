'use strict';

const net = require('net');
const EventEmitter = require('events');
const common = require('./common');

const TIMEOUT = 1000;

class Client extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.on('error', () => {
            setTimeout(() => {
                this.open();
            }, TIMEOUT);
        })
    }
    
    open() {
        let acc = '';
        this.client = net.createConnection(this.options, () => {
            this.emit('connected');
        })
        .on('data', (chunk) => {
            acc += chunk;
            const pieces = acc.split(common.DELIMITER).filter(Boolean);
            let piece = '';
                done: while (pieces.length > 0) {
                    piece = pieces.shift();
                    try {
                        let message = JSON.parse(piece);
                        this.emit('message', message);
                    } catch (ex) {
                        pieces.shift(piece);
                        break done;
                    }
                }
                acc = pieces.join(common.DELIMITER);
        })
        .on('end', () => {
        })
        .on('error', () => {
            this.emit('error');
        });
        return this;
    }
    
    close() {
        this.client.end();
        return this;
    }
    
    _send(frame) {
        this.client.write(JSON.stringify(frame) + common.DELIMITER);
        return this;
    }

    subscribe(type, name) {
        const frame = {
            cmd: common.CMD.SUBSCRIBE,
            type: type,
            name: name
        };
        this._send(frame);
        return this;
    }

    send(type, name, body) {
        const frame = {
            cmd: common.CMD.SEND,
            type: type,
            name: name,
            body: body
        };
        this._send(frame);
        return this;
    }
}

module.exports = Client;

/*
const client = new Client({port: 9999});
client.open();
client.subscribe(common.TYPE.QUEUE, 'queue1');
client.on('NewMessage', (body) => {
    console.log(body);
});
client.send(common.TYPE.QUEUE, 'queue1', {time: Date()});
*/
//client.close();
