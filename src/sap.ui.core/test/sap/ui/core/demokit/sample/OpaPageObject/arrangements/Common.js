sap.ui.define(['jquery.sap.global', 'sap/ui/test/Opa5'],
	function(jQuery, Opa5) {
	"use strict";

	
	var Common = Opa5.extend("myApp.test.arrangement.Common", {

		iStartMyApp : function () {
			return this.iStartMyAppInAFrame("applicationUnderTest/index.html");
		}

	});

	return Common;

});
