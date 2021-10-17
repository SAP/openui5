var fnHash = function (sString) {
    var i = sString.length, iHash = 0;
    while (i--) {
        iHash = (iHash << 5) - iHash + sString.charCodeAt(i);
        iHash = iHash & iHash;
    }
    return iHash;
};