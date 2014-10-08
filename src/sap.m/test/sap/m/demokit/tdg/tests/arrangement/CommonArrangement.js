jQuery.sap.declare("sap.ui.demo.tdg.test.arrangement.CommonArrangement");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.tdg.test.arrangement.CommonArrangement = Opa5.extend("sap.ui.demo.tdg.test.arrangement.CommonArrangement", {
	iStartMyApp : function (sHash) {
		sHash = sHash || "";
		return this.iStartMyAppInAFrame("../index.html?responderOn=true" + sHash);
	}
});