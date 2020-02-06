//https://stackoverflow.com/questions/11742067/is-there-a-way-to-add-try-catch-to-every-function-in-javascript
const tcWrapper = (callback) => {
    return (req, res, next) => {
        callback(req, res, next).catch(e => next(e));
    }
}

const loopAndWrapTryCatch = (NS) => {

    const tempObj = {};

    Object.keys(NS).forEach(function(key) {
        tempObj[key] = tcWrapper(NS[key]);
    });

    return tempObj;
}

module.exports = loopAndWrapTryCatch;