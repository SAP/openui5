sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (
	Opa5,
	Press
) {
	"use strict";
	Opa5.createPageObjects({
		onTheDemoPage: {
			actions: {
				iClickOnOpenAppContextDialogButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							text: "Open AppContext Dialog"
						},
						errorMessage: "Did not find the open dialog button",
						actions: new Press()
					});
				}
			},
			assertions: {
				iShouldSeeTheOpenAppContextDialogButton: function () {
					this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							text: "Open AppContext Dialog"
						},
						success: function () {
							Opa5.assert.ok(true, "I see open app context dialog button");
						},
						errorMessage: "I should see the open app context dialog button."
					});
				}
			}
		}
	});
});
