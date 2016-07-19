sap.ui.define(["sap/ui/test/Opa5"],
	function(Opa5) {
	"use strict";

	var Common = Opa5.extend("myApp.test.arrangements.Common", {

		iStartMyApp : function () {
			return this.iStartMyAppInAFrame("applicationUnderTest/index.html");
		}

	});

	return Common;

});
