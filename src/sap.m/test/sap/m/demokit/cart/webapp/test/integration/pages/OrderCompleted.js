sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onOrderCompleted: {
			viewName: "OrderCompleted",
			actions: {

				iPressOnTheReturnToShopButton: function () {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new sap.ui.test.actions.Press()
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
