
module.exports = (text) => {
    return text
        .split(/[\s]+/gi)
        .map(w => {
            return {
                key: w.toLowerCase(),
                value: 1
            }
        })
}