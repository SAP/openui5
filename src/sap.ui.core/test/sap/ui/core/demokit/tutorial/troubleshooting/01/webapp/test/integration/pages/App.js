sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press"
], function(Opa5, PropertyStrictEquals, Press) {
	"use strict";

	var sViewName = "App";

	Opa5.createPageObjects({
		onTheAppPage : {

			actions : {
				iPressTheDoSomethingButton: function () {
					return this.waitFor({
						id: "myButton",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "The button couldn't be pressed or was not found"
					});
				}
			},

			assertions : {
				iShouldSeeTheDoSomethingButton: function () {
					return this.waitFor({
						id: "myButton",
						viewName: sViewName,
						matchers: [
							new PropertyStrictEquals({name: "text", value: "Do Something"}),
							new PropertyStrictEquals({name: "icon", value: "sap-icon://action"}),
							function () {
								// check full id as well
								return !!document.getElementById("HeapOfShards---app--myButton");
							}
						],
						success: function () {
							Opa5.assert.ok(true, "The button is displayed");
						},
						errorMessage: "The button was not found or has been defined with a wrong property"
					});
				},

				iShouldSeeMessageToast: function() {
					return this.waitFor({
						//increase opa's polling because the message toast is only shown for a brief moment
						pollingInterval: 100,
						check: function() {
							return !!document.getElementsByClassName("sapMMessageToast").length;
						},
						success: function() {
							Opa5.assert.ok( "The message toast was displayed");
						},
						errorMessage: "The message toast was not displayed"
					});
				},

				iShouldSeeTheButtonLabel: function() {
					return this.waitFor({
						id: "LabelWithMissingI18NText",
						viewName: sViewName,
						success: function(oLabel) {
							Opa5.assert.strictEqual(oLabel.getText(), "Label_Missing_I18N_Text", "The label shows the right text");
						},
						errorMessage: "The button label was not found or has a wrong text"
					});
				}
			}
		}

	});

});