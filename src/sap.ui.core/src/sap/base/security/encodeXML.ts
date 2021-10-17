import toHex from "sap/base/strings/toHex";
var rHtml = /[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g, rHtmlReplace = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/, mHtmlLookup = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;"
};
var fnHtml = function (sChar) {
    var sEncoded = mHtmlLookup[sChar];
    if (!sEncoded) {
        if (rHtmlReplace.test(sChar)) {
            sEncoded = "&#xfffd;";
        }
        else {
            sEncoded = "&#x" + toHex(sChar.charCodeAt(0)) + ";";
        }
        mHtmlLookup[sChar] = sEncoded;
    }
    return sEncoded;
};
var fnEncodeXML = function (sString) {
    return sString.replace(rHtml, fnHtml);
};