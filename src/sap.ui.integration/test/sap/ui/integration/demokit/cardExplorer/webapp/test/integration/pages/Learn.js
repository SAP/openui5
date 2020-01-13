sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function(Opa5, Properties) {
	"use strict";

	var sViewName = "LearnDetail";

	Opa5.createPageObjects({
		onTheLearnPage: {

			assertions: {
				iShouldSeeSampleTitle: function (sTitle) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Title",

						matchers: new Properties({text: sTitle}),
						success: function () {
							Opa5.assert.ok(true, "The navigation ended on the correct topic: " + sTitle);
						},
						errorMessage: "The navigation isn't ended on the correct topic: " + sTitle
					});
				}
			}
		}
	});
});
