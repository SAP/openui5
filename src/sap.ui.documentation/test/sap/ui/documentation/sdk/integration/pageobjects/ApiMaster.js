sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheApiMasterPage: {
			viewName: "ApiMaster",
			actions: {

				iLookAtTheScreen : function () {
					return this;
				}

			},

			assertions: {

				iShouldSeeTheApiMasterPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The API Reference page was successfully displayed");
						},
						errorMessage: "The API Reference page was not displayed"
					});
				}
			}
		}
	});

});
