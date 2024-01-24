sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheResourcesPage: {
			viewName: "Resources",
			assertions: {
				iShouldSeeTheResourcesPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Resources page was successfully displayed");
						},
						errorMessage: "The Resources page was not displayed"
					});
				}
			}
		}
	});

});
