var rHyphen = /([A-Z])/g;
var fnHyphenate = function (sString) {
    return sString.replace(rHyphen, function (sMatch, sChar) {
        return "-" + sChar.toLowerCase();
    });
};