'use strict';

const net = require('net');
const EventEmitter = require('events');
const Common = require('./common');
const Queue = require('./queue');
const TIMEOUT = 3000;

class Client extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.queue = new Queue();
        this.on('try_again', () => {
            setTimeout(() => {
                this.open();
            }, TIMEOUT);
        })
    }
        
    open() {
        let acc = '';

        this.client = net.createConnection(this.options, () => {            
            this.queue.addHandler((frame, done) => {
                this.client.write(JSON.stringify(frame) + Common.DELIMITER, 'utf8', done);
            });
            this.emit('connected');
        })
        .on('data', (chunk) => {
            acc += chunk.toString();
            const pieces = acc.split(Common.DELIMITER);
            let piece;
            while (pieces.length > 0) {                
                try {
                    piece = pieces.shift();
                    this.emit('message', JSON.parse(piece));
                } catch (ex) {
                    pieces.unshift(piece);
                    break;
                }
            }
            acc = pieces.join(Common.DELIMITER);
        })
        .on('end', () => {
        })
        .on('error', () => {
            this.emit('try_again');
        })
        .setEncoding('utf8');
        return this;
    }
    
    close() {
        this.client.end();
        return this;
    }

    _send(frame) {
        this.queue.addMessage(frame);
    }


    subscribe(type, name) {
        const frame = {
            cmd: Common.CMD.SUBSCRIBE,
            type: type,
            name: name
        };
        this._send(frame);
        return this;
    }

    unsubscribe(type, name) {
        const frame = {
            cmd: Common.CMD.UNSUBSCRIBE,
            type: type,
            name: name
        };
        this._send(frame);
        return this;
    }

    send(type, name, body={}) {
        const frame = {
            cmd: Common.CMD.SEND,
            type: type,
            name: name,
            body: body
        };
        this._send(frame);
        return this;
    }
}

module.exports = Client;
