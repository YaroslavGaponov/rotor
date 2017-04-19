module.exports = {

    DELIMITER: '\n<END>\n',

    TYPE: Object.freeze({
        QUEUE: 'QUEUE',
        TOPIC: 'TOPIC'
    }),

    CMD: Object.freeze({
        SEND: 'SEND',
        SUBSCRIBE: 'SUBSCRIBE',
        UNSUBSCRIBE: 'UNSUBSCRIBE'
    })
}
