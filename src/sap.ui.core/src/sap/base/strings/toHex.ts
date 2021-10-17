var fnToHex = function (iChar, iLength) {
    var sHex = iChar.toString(16);
    if (iLength) {
        sHex = sHex.padStart(iLength, "0");
    }
    return sHex;
};