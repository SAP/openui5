import toHex from "sap/base/strings/toHex";
var rCSS = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xff\u2028\u2029][0-9A-Fa-f]?/g;
var fnCSS = function (sChar) {
    var iChar = sChar.charCodeAt(0);
    if (sChar.length === 1) {
        return "\\" + toHex(iChar);
    }
    else {
        return "\\" + toHex(iChar) + " " + sChar.substr(1);
    }
};
var fnEncodeCSS = function (sString) {
    return sString.replace(rCSS, fnCSS);
};