
module.exports = () => {
    var x = Math.random();
    var y = Math.random();
    return [{
        key: 'pi',
        value: x * x + y * y < 1
    }]
}