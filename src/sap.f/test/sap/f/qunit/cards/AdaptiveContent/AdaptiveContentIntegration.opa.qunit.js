/*global QUnit*/
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit'
], function (Opa5, opaTest) {
	"use strict";

	var oEventType, oData;

	var oActions = new Opa5({
		iLoadTheCard: function () {
			return this.waitFor({
				controlType: "sap.ui.integration.widgets.Card",
				matchers: function (oNode) {
					return oNode.$().hasClass("sapFCard");
				},
				success: function () {
					Opa5.assert.ok("AdaptiveCard", "The AdaptiveCard has been found");
				},
				errorMessage: "The component does not exist or the value could not be changed"
			});
		},
		iClickTheSubmitAction: function () {
			return this.waitFor({
				controlType: "sap.ui.integration.widgets.Card",
				matchers: function (oNode) {
					return oNode.$().hasClass("sapFCard");
				},
				actions: function (oCard) {
					oCard.attachAction(function (oEvent) {
						oEventType = oEvent.getParameter("type");
						oData = oEvent.getParameter("manifestParameters");
					});

					oCard.$().find("ui5-button").eq(0).click();
				},
				success: function () {
					Opa5.assert.strictEqual(oEventType, "Submit", "The action type is Submit");
				}
			});
		},
		iClickTheOpenURLAction: function () {
			return this.waitFor({
				controlType: "sap.ui.integration.widgets.Card",
				matchers: function (oNode) {
					return oNode.$().hasClass("sapFCard");
				},
				actions: function (oCard) {
					oCard.attachAction(function (oEvent) {
						oEventType = oEvent.getParameter("type");
						oData = oEvent.getParameter("manifestParameters");
					});
					oCard.$().find("ui5-button").eq(2).click();
				},
				success: function () {
					Opa5.assert.strictEqual(oEventType, "Navigation", "The action type is Navigation");
				}
			});
		}
	});

	var oAssertions = new Opa5({
		shouldTriggerSubmitAction: function () {
			return this.waitFor({
				controlType: "sap.ui.integration.widgets.Card",
				matchers: function (oNode) {
					return oNode.$().hasClass("sapFCard");
				},
				success: function (oCard) {
					var $oCard = oCard[0].$(),
						aRadioButtons = $oCard.find('[name="SingleSelectVal"]'),
						aCheckBoxes = $oCard.find('[name="MultiSelectVal"]'),
						aChecked = [];

					Opa5.assert.strictEqual($oCard.find("#SimpleVal").val(), oData["SimpleVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#UrlVal").val(), oData["UrlVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#EmailVal").val(), oData["EmailVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#TelVal").val(), oData["TelVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#MultiLineVal").val(), oData["MultiLineVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#NumVal").val(), oData["NumVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#DateVal").val(), oData["DateVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#TimeVal").val(), oData["TimeVal"], "The value is correct");

					for (var i = 0; i < aRadioButtons.length; i++) {
						if (aRadioButtons[i].selected) {
							Opa5.assert.strictEqual(aRadioButtons[i].value, oData["SingleSelectVal"], "The value is correct");
						}
					}

					for (var j = 0; j < aCheckBoxes.length; j++) {
						if (aCheckBoxes[j].checked) {
							aChecked.push(aCheckBoxes[j].value);
						}
					}
					Opa5.assert.strictEqual(aChecked.join(), oData["MultiSelectVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#CompactSelectVal")[0].selectedOption.value, oData["CompactSelectVal"], "The value is correct");
				},
				errorMessage: "The component does not exist or the value could not be changed"
			});
		},

		shouldTriggerOpenURLAction: function () {
			return this.waitFor({
				controlType: "sap.ui.integration.widgets.Card",
				matchers: function (oNode) {
					return oNode.$().hasClass("sapFCard");
				},
				success: function () {
					Opa5.assert.strictEqual(oData, "http://www.company_a.example.com", "The URL is correct");
				},
				errorMessage: "The component does not exist or the value could not be changed"
			});
		}
	});

	Opa5.extendConfig({
		actions: oActions,
		assertions: oAssertions,
		autoWait: true
	});

	QUnit.module("Actions");

	opaTest("Action.Submit", function (Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/f/AdaptiveCardVisualTests.html');

		When
			.iLoadTheCard()
			.and.iClickTheSubmitAction();

		Then.shouldTriggerSubmitAction();
	});

	opaTest("Action.OpenUrl", function (Given, When, Then) {
		When.iLoadTheCard()
			.and.iClickTheOpenURLAction();

		Then.shouldTriggerOpenURLAction();
		Then.iTeardownMyApp();
	});
});