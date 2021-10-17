var fnEach = function (oObject, fnCallback) {
    var isArray = Array.isArray(oObject), length, i;
    if (isArray) {
        for (i = 0, length = oObject.length; i < length; i++) {
            if (fnCallback.call(oObject[i], i, oObject[i]) === false) {
                break;
            }
        }
    }
    else {
        for (i in oObject) {
            if (fnCallback.call(oObject[i], i, oObject[i]) === false) {
                break;
            }
        }
    }
    return oObject;
};