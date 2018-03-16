sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheDemoAppsPage: {
			viewName: "DemoApps",
			assertions: {
				iShouldSeeTheDemoAppsPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Demo Apps page was successfully displayed");
						},
						errorMessage: "The Demo Apps page was not displayed"
					});
				}
			}
		}
	});

});
