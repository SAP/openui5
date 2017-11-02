sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheControlsMasterPage: {
			viewName: "ControlsMaster",
			assertions: {
				iShouldSeeTheControlsMasterPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Controls Master page was successfully displayed");
						},
						errorMessage: "The Controls Master page was not displayed"
					});
				}
			}
		}
	});

});
