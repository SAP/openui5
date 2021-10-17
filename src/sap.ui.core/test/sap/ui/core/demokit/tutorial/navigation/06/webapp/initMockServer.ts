import mockserver from "sap/ui/demo/nav/localService/mockserver";
import MessageBox from "sap/m/MessageBox";
mockserver.init().catch(function (oError) {
    MessageBox.error(oError.message);
}).finally(function () {
    sap.ui.require(["sap/ui/core/ComponentSupport"]);
});