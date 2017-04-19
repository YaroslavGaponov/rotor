
module.exports = (text) => {
    return String(text)
        .split(/[\s\.\,\?\!\:\"\'\`\{\}\(\)\;\[\]\|\\\/]+/)
        .filter(Boolean)
        .filter(isNaN)
        .map(w => {
            return {
                key: w.toLowerCase(),
                value: 1
            }
        })
}