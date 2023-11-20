sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheApiDetailPage: {
			viewName: "ApiDetail",
			actions: {

			},

			assertions: {

				iShouldSeeTheApiDetailPage: function() {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Api Detail page was successfully displayed.");
						},
						errorMessage: "The Api Detail page was not displayed."
					});
				}

			}
		}
	});

});
