sap.ui.define(['sap/ui/test/Opa5', 'sap/ui/test/actions/Press'], function (Opa5, Press) {
	"use strict";

	var Arrangement = Opa5.extend("myApp.test.arrangement.Arrangement", {
		// in OPA config, an instance of Arrangement will be passed only to the arrangements section (see OpaPageObject)
		// this means that any method defined here will be used as an arrangement in the test
		iAmOnTheOverviewPage: function () {
			return this.waitFor({
				viewName: "Main",
				id: "navToOverview",
				actions: new Press()
			});
		}

	});

	return Arrangement;

});
