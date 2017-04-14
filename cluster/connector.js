const util = require('util');
const os = require('os');
const Client = require('ssh2').Client;
const Promise = require('bluebird');

const key = require('./key');
const settings = require('./settings');

const EXIT_CODE_OK = 0;

function bind(hostname, user, password) {
    return new Promise((resolve, reject) => {
        if (key.exists(hostname)) {
            return reject(new Error('Host is binded already.'));
        }
        key.create(hostname, settings.type, settings.passphrase);
        var connect = new Client();
        connect.on('ready',() => {
          connect.exec(util.format('echo "%s" >> ~/.ssh/authorized_keys', key.publicKey(hostname)), (err, stream) => {
            if (err) {
                return reject(err);
            }
            stream.on('close',(code, signal) => {
                if (code === EXIT_CODE_OK) {
                    resolve();
                } else {
                    reject();
                }
                connect.end();
            }).on('data', (data) => {}).stderr.on('data', (data) => {});            
          })
        })
        .connect({
          host: hostname,
          port: settings.port,
          username: user,
          password: password
        });
    });
}


function exec(hostname, user, command) {
    return new Promise((resolve, reject) => {        
        if(!key.exists(hostname)) {
            return reject(new Error('Host is not binded.'));
        }
        var connect = new Client();
        connect.on('ready', () => {
          connect.exec(command, (err, stream) => {
            if (err) {
                return reject(err);
            }
            var result = '';
            var error = '';
            stream.on('close', (code, signal) => {
                if (code === EXIT_CODE_OK) {
                    resolve(result);
                } else {
                    reject(error);
                }
                connect.end();
            }).on('data', (data) => { result += data.toString() }).stderr.on('data', (data) => { error += data.toString() });
          })
        })
        .connect({
          host: hostname,
          port: settings.port,
          username: user,
          privateKey: key.privateKey(hostname),
          passphrase: settings.passphrase
        });        
    });
}


function unbind(hostname, user) {
    return new Promise((resolve, reject) => {
        if (!key.exists(hostname)) {
            return reject(new Error('Host is not binded.'));
        }
        exec(hostname, user, util.format('grep -v "%s" ~/.ssh/authorized_keys > temp && mv temp ~/.ssh/authorized_keys', key.publicKey(hostname).split(os.EOL).shift()))
        .then(() => {
            key.remove(hostname);
            resolve();
        })
        .catch(ex => { reject(ex) })
    });
}

module.exports = {
    bind: bind,
    exec: exec,
    unbind: unbind
}