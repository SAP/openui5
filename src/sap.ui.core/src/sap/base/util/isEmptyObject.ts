var fnIsEmptyObject = function isEmptyObject(obj) {
    for (var sName in obj) {
        return false;
    }
    return true;
};