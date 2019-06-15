sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/Opa5",
	"samples/components/button/Component"
], function(Log, StepDefinitions, Opa5) {
	"use strict";

	var oOpa5 = new Opa5();

	var Steps = StepDefinitions.extend("GherkinWithUIComponent.Steps", {
		init: function() {

			this.register(/^I start my UIComponent$/i, function() {
				oOpa5.iStartMyUIComponent({
					componentConfig: {
						name: "samples.components.button"
					},
					hash: ""
				});
			});

			this.register(/^the UIComponent loads successfully$/i, function() {
				oOpa5.waitFor({
					id: /mybutn$/,
					success: function(controls) {
						Opa5.assert.strictEqual(controls.length, 1, "Verified one control was found with correct ID");
					}
				});
			});

			this.register(/^I rename the button to "(.*?)"$/i, function(sText) {
				oOpa5.waitFor({
					id: /mybutn$/,
					success: function(controls) {
						controls[0].setText(sText);
					}
				});
			});

			this.register(/^the button is named "(.*?)"$/i, function(sText) {
				oOpa5.waitFor({
					id: /mybutn$/,
					success: function(controls) {
						Opa5.assert.strictEqual(controls[0].getText(), sText, "Verified button text is '" + sText + "'");
					}
				});
			});
		},

		closeApplication: function() {
			Log.info("Closing application");
		}
	});

	return Steps;

});