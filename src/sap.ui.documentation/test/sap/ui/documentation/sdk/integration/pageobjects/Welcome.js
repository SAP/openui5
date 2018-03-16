sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheWelcomePage: {
			viewName: "Welcome",
			assertions: {
				iShouldSeeTheWelcomePage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Welcome page was successfully displayed");
						},
						errorMessage: "The Welcome page was not displayed"
					});
				}
			}
		}
	});

});
