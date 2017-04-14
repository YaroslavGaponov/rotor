
module.exports = (key, values) => {
    return {
        key: key,
        value: values.reduce((a,b) => {return a+b})
    }
}