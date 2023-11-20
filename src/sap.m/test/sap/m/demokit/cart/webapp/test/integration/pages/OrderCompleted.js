sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Opa5, Press) {
	"use strict";

	Opa5.createPageObjects({
		onOrderCompleted: {
			viewName: "OrderCompleted",
			actions: {

				iPressOnTheReturnToShopButton: function () {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new Press()
					});
				}
			},
			assertions: {

				iShouldSeeTheOrderCompletedPage: function () {
					return this.waitFor({
						id: "returnToShopButton",
						success: function (oButton) {
							Opa5.assert.ok(oButton, "Found the order completed page");
						}
					});
				}
			}
		}
	});
});
