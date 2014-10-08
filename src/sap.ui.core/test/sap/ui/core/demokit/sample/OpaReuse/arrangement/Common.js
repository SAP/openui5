jQuery.sap.declare("myApp.test.arrangement.Common");
jQuery.sap.require("sap.ui.test.Opa5");

myApp.test.arrangement.Common = sap.ui.test.Opa5.extend("myApp.test.arrangement.Common", {

	iStartMyApp : function () {
		return this.iStartMyAppInAFrame("applicationUnderTest/index.html");
	}

});