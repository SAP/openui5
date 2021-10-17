import toHex from "sap/base/strings/toHex";
var rURL = /[\ud800-\udbff][\udc00-\udfff]|[\x00-\x2c\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\uffff]/g, mURLLookup = {};
var fnURL = function (sChar) {
    var sEncoded = mURLLookup[sChar];
    if (!sEncoded) {
        var iChar = sChar.codePointAt(0);
        if (iChar < 128) {
            sEncoded = "%" + toHex(iChar, 2);
        }
        else if (iChar < 2048) {
            sEncoded = "%" + toHex((iChar >> 6) | 192, 2) + "%" + toHex((iChar & 63) | 128, 2);
        }
        else if (iChar < 65536) {
            sEncoded = "%" + toHex((iChar >> 12) | 224, 2) + "%" + toHex(((iChar >> 6) & 63) | 128, 2) + "%" + toHex((iChar & 63) | 128, 2);
        }
        else {
            sEncoded = "%" + toHex((iChar >> 18) | 240, 2) + "%" + toHex(((iChar >> 12) & 63) | 128, 2) + "%" + toHex(((iChar >> 6) & 63) | 128, 2) + "%" + toHex((iChar & 63) | 128, 2);
        }
        mURLLookup[sChar] = sEncoded;
    }
    return sEncoded;
};
var fnEncodeURL = function (sString) {
    return sString.replace(rURL, fnURL);
};