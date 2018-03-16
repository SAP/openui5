sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheToolsPage: {
			viewName: "Tools",
			assertions: {
				iShouldSeeTheToolsPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Tools page was successfully displayed");
						},
						errorMessage: "The Tools page was not displayed"
					});
				}
			}
		}
	});

});
