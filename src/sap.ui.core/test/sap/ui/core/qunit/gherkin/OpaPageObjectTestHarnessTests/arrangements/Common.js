sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
	"use strict";

	var Common = Opa5.extend("myApp.test.arrangement.Common", {

		iStartMyApp : function () {
			return this.iStartMyAppInAFrame("applicationUnderTest/index.html", 5);
		}

	});

	return Common;

});
