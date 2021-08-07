
function successObj(message, result) {
    if (isObject(result)) {
        return {
            flag: true,
            message: message,
            result: result
        };
    }
    else {
        return {
            flag: true,
            message: message,
            result: { data: result }
        };
    }
}

function errorObj(message, error, code = 000000) {
    return {
        flag: false,
        message: message,
        error: error,
        code: code
    };
}

function isObject(obj) {
    return (typeof obj === "object" && !Array.isArray(obj) && obj !== null);
}
function generateUUID() {
    var currentTime = new Date().getTime();

    var randNumber = Math.random();

    var shuffledString = str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

    return MD5(currentTime + randNumber + shuffledString);
}
function getTimeSeconds() {
    return Math.floor(new Date() / 1000);
}

function prepareSocketResponse(data, eventName) {
    return {
        "evt": eventName,
        "data": data
    };
}
function objectLength(object) {
    if (!object)
        return 0;
    return Object.keys(object).length;
}
module.exports = {
    successObj: successObj,
    errorObj: errorObj,
    generateUUID: generateUUID,
    getTimeSeconds: getTimeSeconds,
    prepareSocketResponse: prepareSocketResponse,
    objectLength: objectLength
}