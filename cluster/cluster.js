'use strict';

const fs = require('fs');
const os = require('os');
const cp  = require('child_process');

class Cluster {
    constructor(fileName) {
        this.fileName = fileName;
    }
    
    add(host, user, pass) {
        let hosts = fs.readFileSync(this.fileName, 'utf8').split(os.EOL);
        if (hosts.indexOf(host) === -1) {
            hosts.push(host);
        }
        fs.writeFileSync(this.fileName,hosts.join(os.EOL));
        return this;
    }
    
    remove(host) {
        return this;
    }
    
    size() {
        return fs.readFileSync(this.fileName, 'utf8').split(os.EOL).length;
    }
    
    deploy(files) {        
        return this;
    }
    
    run(cmd, args) {
        let hosts = fs.readFileSync(this.fileName, 'utf8').split(os.EOL);
        hosts.forEach(host =>{
            cp.spawn(cmd, args);
        });        
        return this;
    }
}


module.exports = Cluster;