/*** List Report Actions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/actions/Press",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/Properties",
		"sap/ui/test/actions/EnterText",
		"sap/m/Token"],

	function (PropertyStrictEquals, AggregationFilled, Press, AggregationLengthEquals, Properties, EnterText, Token) {
		"use strict";

		return function () {

			return {
				iClickOnButton: function (sButton) {
					var oButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function (aButtons) {
							for (var i = 0; i < aButtons.length; i++) {
								var sText = aButtons[i].getText();
								if (sText === sButton) {
									oButton = aButtons[i];
									return true;
								}
							}
							return false;
						},
						success: function () {
							oButton.$().trigger("tap");
						},
						errorMessage: "Did not find the " + sButton + " Button."
					});
				},
				// TODO: try to make a generic function for button
				iClickOnButtonWithIcon: function (sButton, icon) {
					var oButton = null;
					return this.waitFor({
						controlType: "sap.m.Button",
						check: function (aButtons) {
							for (var i = 0; i < aButtons.length; i++) {
								if (aButtons[i].getText() === sButton && aButtons[i].getIcon() === icon) {
									oButton = aButtons[i];
									return true;
								}
							}
							return false;
						},
						success: function () {
							oButton.$().trigger("tap");
						},
						errorMessage: "Did not find the " + sButton + " Button."
					});
				}
			};
		};
	});
