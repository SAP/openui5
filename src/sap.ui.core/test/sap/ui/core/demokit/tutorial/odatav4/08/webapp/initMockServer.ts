import mockserver from "sap/ui/core/tutorial/odatav4/localService/mockserver";
import Log from "sap/base/Log";
import MessageBox from "sap/m/MessageBox";
mockserver.init().catch(function (oError) {
    MessageBox.error(oError.message);
}).finally(function () {
    sap.ui.require(["sap/ui/core/ComponentSupport"]);
});