import assert from "sap/base/assert";
var fnUniqueSort = function (aArray) {
    assert(Array.isArray(aArray), "uniqueSort: input parameter must be an Array");
    var iLength = aArray.length;
    if (iLength > 1) {
        aArray.sort();
        var j = 0;
        for (var i = 1; i < iLength; i++) {
            if (aArray.indexOf(aArray[i]) === i) {
                aArray[++j] = aArray[i];
            }
        }
        if (++j < iLength) {
            aArray.splice(j, iLength - j);
        }
    }
    return aArray;
};