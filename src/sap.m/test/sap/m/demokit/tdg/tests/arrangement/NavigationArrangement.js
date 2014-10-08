jQuery.sap.declare("sap.ui.demo.tdg.test.arrangement.NavigationArrangement");
jQuery.sap.require("sap.ui.demo.tdg.test.arrangement.CommonArrangement");

sap.ui.demo.tdg.test.arrangement.NavigationArrangement = sap.ui.demo.tdg.test.arrangement.CommonArrangement.extend("sap.ui.demo.tdg.test.arrangement.NavigationArrangement", {
	iStartMyAppWithTheThirdProduct : function () {
		return this.iStartMyApp("#/product/2");
	}
});