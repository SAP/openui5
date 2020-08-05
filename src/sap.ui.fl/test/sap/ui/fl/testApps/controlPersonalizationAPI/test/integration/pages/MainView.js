sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Opa5, Press) {
	"use strict";
	Opa5.createPageObjects({
		onTheAppPage: {

			actions: {
				iClickButton: function (sViewName, sId) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						actions: [new Press()],
						errorMessage: "button with id: " + sId + " in view: " + sViewName + " can not be pressed!"
					});
				}
			},

			assertions: {
				iShouldSeeTheApp: function () {
					return this.waitFor({
						id: "app",
						viewName: "MainView",
						success: function () {
							Opa5.assert.ok(true, "The MainView view is displayed");
						},
						errorMessage: "Did not find the MainView view"
					});
				},

				iPersonalizationStatusShouldBeCorrect: function (sViewName, sId, bIsPersonalized) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						matchers: [function (oControl) {
							var bStatus = oControl.getText().indexOf("NOT") === -1;
							return bIsPersonalized === bStatus;
						}],
						success: function () {
							Opa5.assert.ok(true, "View: " + sViewName + " , ContronlId: " + sId + " has correct Personalization status");
						},
						errorMessage: "View: " + sViewName + " , ContronlId: " + sId + " has incorrect Personalization status"
					});
				},

				iChangesAreApplied: function (sViewName, sId, sText) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						matchers: [function (oControl) {
							return oControl.getText().indexOf(sText) !== -1;
						}],
						success: function () {
							Opa5.assert.ok(true, "Changes have been applied correctly for View: " + sViewName + " , ContronlId: " + sId);
						},
						errorMessage: "Changes have not been applied correctly for View: " + sViewName + " , ContronlId: " + sId
					});
				},

				iNoChangeIsApplied: function (sViewName, sId) {
					return this.waitFor({
						id: sId,
						viewName: sViewName,
						matchers: [function (oControl) {
							return oControl.getText().indexOf("X") === -1;
						}],
						success: function () {
							Opa5.assert.ok(true, "No changes has been applied for View: " + sViewName + " , ContronlId: " + sId);
						},
						errorMessage: "Some changes have been applied correctly for View: " + sViewName + " , ContronlId: " + sId
					});
				}
			}
		}
	});
});