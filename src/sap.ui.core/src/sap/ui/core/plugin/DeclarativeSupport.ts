import Log from "sap/base/Log";
import DeclarativeSupport from "sap/ui/core/DeclarativeSupport";
var DeclarativeSupportPlugin = function () {
};
DeclarativeSupportPlugin.prototype.startPlugin = function (oCore, bOnInit) {
    Log.info("Starting DeclarativeSupport plugin.");
    this.oCore = oCore;
    this.oWindow = window;
    DeclarativeSupport.compile(document.body);
};
DeclarativeSupportPlugin.prototype.stopPlugin = function () {
    Log.info("Stopping DeclarativeSupport plugin.");
    this.oCore = null;
};
sap.ui.getCore().registerPlugin(new DeclarativeSupportPlugin());