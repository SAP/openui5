import Log from "./Log";
var fnAssert = function (bResult, vMessage) {
    if (!bResult) {
        var sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
        console.assert(bResult, sMessage);
    }
};