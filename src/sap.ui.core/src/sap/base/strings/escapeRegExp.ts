var rEscapeRegExp = /[[\]{}()*+?.\\^$|]/g;
var fnEscapeRegExp = function (sString) {
    return sString.replace(rEscapeRegExp, "\\$&");
};