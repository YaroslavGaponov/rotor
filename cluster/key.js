const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const KEY_PATH = path.join(process.env.HOME, '.keys');

function create(name, type, passphrase) {
    if (!fs.existsSync(KEY_PATH)) {
        fs.mkdirSync(KEY_PATH);
    }
    const fileName = path.join(KEY_PATH, name);
    cp.execSync(util.format('ssh-keygen -q -t %s -f %s -N %s', type, fileName, passphrase));
}

function publicKey(name) {
    const fileNamePublic = path.join(KEY_PATH, name) + '.pub';
    return fs.readFileSync(fileNamePublic).toString();
}

function privateKey (name) {
    const fileName = path.join(KEY_PATH, name);
    return fs.readFileSync(fileName).toString();    
}

function remove(name) {
    const fileName = path.join(KEY_PATH, name);
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
    const fileNamePublic = fileName + '.pub';
    if (fs.existsSync(fileNamePublic)) {
        fs.unlinkSync(fileNamePublic);
    }        
}

function exists(name) {
    const fileName = path.join(KEY_PATH, name);
    const fileNamePublic = fileName + '.pub';
    return fs.existsSync(fileName) && fs.existsSync(fileNamePublic);
}

module.exports = {
    exists: exists,
    create: create,
    privateKey: privateKey,
    publicKey: publicKey,
    remove: remove
}
