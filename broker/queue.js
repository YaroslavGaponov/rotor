'use strict';

class Queue {
    constructor() {
        this.locker = false;
        this.messages = [];
        this.handler = null;
    }
    
    addHandler(handler) {
        this.handler = handler;
        this.run();
        return this;
    }
    
    addMessage(message) {
        this.messages.push(message);
        this.run();
        return this;
    }

    run() {
        if (!this.locker) {
            this._run();
        }        
    }

    _run() {
        if (this.messages.length > 0) {
            this.locker = true;
            const message = this.messages.shift();
            this.handler(message, () => {
                this._run();
            });
        } else {
            this.locker = false;
        }
    }
}
    

module.exports = Queue;