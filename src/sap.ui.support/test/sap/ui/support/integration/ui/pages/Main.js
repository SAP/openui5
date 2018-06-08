sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheMainPage: {

			assertions: {

				iShouldSeeRulesButton: function (iExpectedRulesCount) {
					return this.waitFor({
						id: "analysisBtn",
						viewName: "Main",
						viewNamespace: "sap.ui.support.supportRules.ui.views.",
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name : "text",
							value : "Rules (" + iExpectedRulesCount + ")"}
						),
						success: function (oButton) {
							Opa5.assert.ok(true, "Found the rules button with text: " + oButton.getText());
						},
						errorMessage: "Did not find the button with text equal to 'Rules (" + iExpectedRulesCount + ")'"
					});
				},

				iShouldSeeTheToolbar: function () {
					return this.waitFor({
						id: "supportAssistantHeader",
						viewName: "Main",
						viewNamespace: "sap.ui.support.supportRules.ui.views.",
						success: function () {
							Opa5.assert.ok(true, 'Support Assistant header visible');
						},
						errorMessage: "Support Assistant header is not visible"
					});
				}

			}

		}

	});

});