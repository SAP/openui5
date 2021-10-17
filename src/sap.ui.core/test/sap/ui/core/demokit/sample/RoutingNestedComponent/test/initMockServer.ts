import mockserver from "../localService/mockserver";
var aMockservers = [];
aMockservers.push(mockserver.init());
Promise.all(aMockservers).catch(function (oError) {
    var fnShowErrorMessage = function () {
        return new Promise(function (resolve, reject) {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.error(oError.message);
                resolve();
            }, reject);
        });
    };
    return sap.ui.getCore().loadLibrary("sap.m", { async: true }).then(fnShowErrorMessage);
}).finally(function () {
    sap.ui.require(["sap/ui/core/ComponentSupport"]);
});