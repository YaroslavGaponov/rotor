'use strict';

const Client = require('./client');
const Common = require('./common');

class Request extends Client {
    constructor(options) {
        super(options);
        
        this.callbacks = new Map();

        this.on('message', (message) => {
            if (this.callbacks.has(message.name)) {
                const sessionId = message.name;
                this.unsubscribe(Common.TYPE.QUEUE, sessionId);
                const callback = this.callbacks.get(sessionId);
                this.callbacks.delete(sessionId);
                return callback(message);
            }
        });
    }
    
    query(name, body={}, callback=()=>{}) {
        const sessionId = Math.random().toString(26).slice(2);
        this.subscribe(Common.TYPE.QUEUE, sessionId);
        this.callbacks.set(sessionId, callback);
        const frame = {
            cmd: Common.CMD.SEND,
            type: Common.TYPE.QUEUE,
            name: name,
            sessionId: sessionId,
            body: body
        };
        this._send(frame);
        return this;
    }
    
    response(sessionId, body={}) {
        const frame = {
            cmd: Common.CMD.SEND,
            type: Common.TYPE.QUEUE,
            name: sessionId,
            body: body
        }
        this._send(frame);
    }
}

module.exports = Request;
