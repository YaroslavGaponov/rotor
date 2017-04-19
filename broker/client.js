'use strict';

const net = require('net');
const EventEmitter = require('events');
const common = require('./common');

const TIMEOUT = 3000;

class Client extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.queue = [];
        this.on('try_again', () => {
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
            acc += chunk.toString();
            const pieces = acc.split(common.DELIMITER);
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
            acc = pieces.join(common.DELIMITER);
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

    __send() {
        if (this.queue.length === 0) {
            return;
        } else {        
            const frame = this.queue.shift();
            this.client.write(JSON.stringify(frame) + common.DELIMITER, 'utf8',() => {
                this.__send();
            })
        }
    }

    _send(frame) {
        this.queue.push(frame);
        this.__send();
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

    unsubscribe(type, name) {
        const frame = {
            cmd: common.CMD.UNSUBSCRIBE,
            type: type,
            name: name
        };
        this._send(frame);
        return this;
    }

    send(type, name, body={}) {
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
