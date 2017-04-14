'use strict';

const net = require('net');
const common = require('./common');

class Broker {
    constructor(options) {
        this.options = options;

        this.sockets = new Map();

        this.subscribers = new Map();
        for(let type in common.TYPE) {
            this.subscribers.set(type, new Map());
        }

        this.server =  net.createServer(socket => {

            const id = Math.random().toString(26).slice(2);
            this.sockets.set(id, socket);

            let acc = '';
            socket
                .on('data', (chunk) => {
                    acc += chunk.toString();
                    let pieces = acc.split(common.DELIMITER).filter(Boolean);                                        
                        done: while (pieces.length > 0) {
                            var piece = pieces.shift();
                            try {
                                const message = JSON.parse(piece);
                                let ok = this._handler(id, socket, message);
                                if (!ok) {
                                    pieces.unshift(piece);
                                    break done;
                                }
                            } catch (ex) {                                
                                pieces.unshift(piece);
                                break done;
                            }
                        }
                        acc = pieces.join(common.DELIMITER);
                })
                .on('end', () => {                    
                    this.sockets.delete(id);
                    for(let type in common.TYPE) {
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
        const {cmd, type, name, body} = message;
        const subscribers = this.subscribers.get(type).has(name) ? this.subscribers.get(type).get(name) : [];
        switch (cmd) {
            case common.CMD.SEND:
                if (subscribers.length > 0) {
                    const frame = {type, name, body};
                    switch (type) {                        
                        case common.TYPE.QUEUE:
                            const id = subscribers.shift();
                            subscribers.push(id);
                            this.subscribers.get(type).set(name, subscribers);
                            this.sockets.get(id).write(JSON.stringify(frame) + common.DELIMITER);
                            break;

                        case common.TYPE.TOPIC:
                            subscribers.forEach(id => {
                                this.sockets.get(id).write(JSON.stringify(frame) + common.DELIMITER);
                            });
                            break;
                    }
                } else {
                    return false;
                }
                
                break;

            case common.CMD.SUBSCRIBE:
                if (subscribers.indexOf(id) === -1) {
                    subscribers.push(id);
                    this.subscribers.get(type).set(name, subscribers);
                }
                break;

            case common.CMD.UNSUBSCRIBE:
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
/*
const broker = new Broker({port: 9999});
broker.start();
*/