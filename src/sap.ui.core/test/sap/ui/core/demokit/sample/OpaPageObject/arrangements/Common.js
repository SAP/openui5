sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	var Common = Opa5.extend("myApp.test.arrangement.Common", {
		// in OPA config, an instance of Common will be passed only to the arrangements section (see OpaPageObject)
		// this means that any method defined here will be used as an arrangement in the test
		iSetupMyApp: function () {
			return this.iStartMyAppInAFrame("applicationUnderTest/index.html");
		}

	});

	return Common;

});
