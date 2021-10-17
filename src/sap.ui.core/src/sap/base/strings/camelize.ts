var rCamelCase = /-(.)/ig;
var fnCamelize = function (sString) {
    return sString.replace(rCamelCase, function (sMatch, sChar) {
        return sChar.toUpperCase();
    });
};