
module.exports = (data) => {
    var indx = 0;
    var result = [];
    while ((indx = data.value.indexOf(data.argument, indx)) !== -1) {        
        result.push({
            key: data.line,
            value: indx
        });
        indx += data.argument.length;
    }
    return result;
}