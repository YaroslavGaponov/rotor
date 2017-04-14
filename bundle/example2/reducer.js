
module.exports = (key, values) => {
    var length = values.length;
    return {
        key: key,
        value: 4.0 * values.filter(v => {return v}).length / length
    }
}