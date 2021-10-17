import assert from "sap/base/assert";
var rMessageFormat = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;
var fnFormatMessage = function (sPattern, aValues) {
    assert(typeof sPattern === "string" || sPattern instanceof String, "pattern must be string");
    if (arguments.length > 2 || (aValues != null && !Array.isArray(aValues))) {
        aValues = Array.prototype.slice.call(arguments, 1);
    }
    aValues = aValues || [];
    return sPattern.replace(rMessageFormat, function ($0, $1, $2, $3, offset) {
        if ($1) {
            return "'";
        }
        else if ($2) {
            return $2.replace(/''/g, "'");
        }
        else if ($3) {
            return String(aValues[parseInt($3)]);
        }
        throw new Error("formatMessage: pattern syntax error at pos. " + offset);
    });
};