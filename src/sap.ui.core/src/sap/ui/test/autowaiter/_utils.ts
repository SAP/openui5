import URI from "sap/ui/thirdparty/URI";
import isPlainObject from "sap/base/util/isPlainObject";
function resolveStackTrace() {
    var oError = new Error();
    var sStack = "No stack trace available";
    var oUriParams = new URI().search(true);
    var bForceResolveStackTrace = ["false", undefined].indexOf(oUriParams.opaFrameIEStackTrace) < 0;
    if (oError.stack) {
        sStack = oError.stack;
    }
    else if (bForceResolveStackTrace) {
        try {
            throw oError;
        }
        catch (err) {
            sStack = err.stack;
        }
    }
    return sStack.replace(/^Error\s/, "");
}
function functionToString(fn) {
    return "'" + fn.toString().replace(/\"/g, "'") + "'";
}
function argumentsToString(oArgs) {
    try {
        return Array.prototype.map.call(oArgs, argToString).join("; ");
    }
    catch (e) {
        return "'" + oArgs + "'";
    }
    function argToString(arg) {
        if (typeof arg === "function") {
            return functionToString(arg);
        }
        if (Array.isArray(arg)) {
            var aValues = Array.prototype.map.call(arg, argToString);
            return "[" + aValues.join(", ") + "]";
        }
        if (isPlainObject(arg)) {
            return JSON.stringify(arg);
        }
        return "'" + arg.toString() + "'";
    }
}