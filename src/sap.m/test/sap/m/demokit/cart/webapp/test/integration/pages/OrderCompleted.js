sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], (Opa5, Press) => {
	"use strict";

	Opa5.createPageObjects({
		onOrderCompleted: {
			viewName: "OrderCompleted",
			actions: {
				iPressOnTheReturnToShopButton() {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new Press()
					});
				}
			},
			assertions: {
				iShouldSeeTheOrderCompletedPage() {
					return this.waitFor({
						id: "returnToShopButton",
						success(oButton) {
							Opa5.assert.ok(oButton, "Found the order completed page");
						}
					});
				}
			}
		}
	});
});
