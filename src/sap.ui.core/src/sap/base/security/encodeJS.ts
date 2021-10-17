import toHex from "sap/base/strings/toHex";
var rJS = /[\x00-\x2b\x2d\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g, mJSLookup = {};
var fnJS = function (sChar) {
    var sEncoded = mJSLookup[sChar];
    if (!sEncoded) {
        var iChar = sChar.charCodeAt(0);
        if (iChar < 256) {
            sEncoded = "\\x" + toHex(iChar, 2);
        }
        else {
            sEncoded = "\\u" + toHex(iChar, 4);
        }
        mJSLookup[sChar] = sEncoded;
    }
    return sEncoded;
};
var fnEncodeJS = function (sString) {
    return sString.replace(rJS, fnJS);
};