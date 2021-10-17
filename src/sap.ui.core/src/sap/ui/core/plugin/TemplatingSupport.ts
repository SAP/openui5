import Log from "sap/base/Log";
var TemplatingSupport = function () {
};
TemplatingSupport.prototype.startPlugin = function (oCore, bOnInit) {
    Log.info("Starting TemplatingSupport plugin.");
    this.oCore = oCore;
    sap.ui.template();
};
TemplatingSupport.prototype.stopPlugin = function () {
    Log.info("Stopping TemplatingSupport plugin.");
    this.oCore = null;
};
sap.ui.getCore().registerPlugin(new TemplatingSupport());