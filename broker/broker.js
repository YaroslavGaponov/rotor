'use strict';

const net = require('net');
const Common = require('./common');
const Queue = require('./queue');

class Broker {
    constructor(options) {
        this.options = options;

        this.sockets = new Map();

        this.subscribers = new Map();
        for(let type in Common.TYPE) {
            this.subscribers.set(type, new Map());
        }

        this.server =  net.createServer({allowHalfOpen: true,pauseOnConnect: false},socket => {
            socket.setEncoding('utf8');
            socket.setKeepAlive(true);            

            const id = Math.random().toString(26).slice(2);

            const queue = new Queue();            
            queue.addHandler((frame, done) => {
                socket.write(JSON.stringify(frame) + Common.DELIMITER, 'utf8', done);
            });

            this.sockets.set(id, queue);

            let acc = '';            
            socket
                .on('data', (chunk) => {
                    acc += chunk.toString();
                    const pieces = acc.split(Common.DELIMITER);
                    let piece;
                    while (pieces.length > 0) {                        
                        try {
                            piece = pieces.shift();
                            this._handler(id, socket, JSON.parse(piece));
                        } catch (ex) {
                            pieces.unshift(piece);
                            break;
                        }                        
                    }
                    acc = pieces.join(Common.DELIMITER);
                })
                .on('end', () => {                    
                    this.sockets.delete(id);
                    for(let type in Common.TYPE) {
                        for (let [name, subscribers] of this.subscribers.get(type)) {
                            let indx = subscribers.indexOf(id);
                            if (indx !== -1) {
                                subscribers.splice(indx, 1);
                                this.subscribers.get(type).set(name, subscribers);
                            }
                        }
                    }
                })
                .on('error', (err) => {
                    console.log(err);
                })
        });        
    }
    
    _handler(id, socket, message) {
        const {cmd, type, name, body, sessionId} = message;
        const subscribers = this.subscribers.get(type).has(name) ? this.subscribers.get(type).get(name) : [];
        switch (cmd) {
            case Common.CMD.SEND:
                if (subscribers.length > 0) {
                    const frame = {type, name, body, sessionId};
                    switch (type) {                        
                        case Common.TYPE.QUEUE:
                            const id = subscribers.shift();
                            subscribers.push(id);
                            this.subscribers.get(type).set(name, subscribers);
                            this.sockets.get(id).addMessage(frame);
                            break;

                        case Common.TYPE.TOPIC:
                            subscribers.forEach(id => {
                                this.sockets.get(id).addMessage(frame);
                            });
                            break;
                    }
                } else {
                    return false;
                }
                
                break;

            case Common.CMD.SUBSCRIBE:
                if (subscribers.indexOf(id) === -1) {
                    subscribers.push(id);
                    this.subscribers.get(type).set(name, subscribers);
                }
                break;

            case Common.CMD.UNSUBSCRIBE:
                const indx = subscribers.indexOf(id);
                if (indx !== -1) {
                    subscribers.splice(indx, 1);
                    this.subscribers.get(type).set(name, subscribers);
                }
                break;
        }
        return true;
    }

    start() {
        this.server.listen(this.options);
    }
    
    stop() {
        this.server.close();
    }
}

module.exports = Broker;
