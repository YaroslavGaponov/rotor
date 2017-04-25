
module.exports = (data) => {
    return String(data.value)
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