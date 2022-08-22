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
		iLoadTheCardContent: function () {
			return this.waitFor({
				controlType: "sap.ui.integration.widgets.Card",
				matchers: function (oNode) {
					return oNode.$().find("ui5-button");
				},
				success: function () {
					Opa5.assert.ok("AdaptiveCard", "The AdaptiveCard has loaded its content");
				},
				errorMessage: "The card content does not exist or the value could not be changed"
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
						oData = oEvent.getParameter("parameters").data;
					});

					oCard.$().find("ui5-input")[0].value = "value";
					oCard.$().find("ui5-button").eq(21).trigger("click");
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
						oData = oEvent.getParameter("parameters");
						oEvent.preventDefault();
					});
					oCard.$().find("ui5-button").eq(23).trigger("click");
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
						aRadioButtonsContainer =  $oCard.find("#SingleSelectVal .sapFCardAdaptiveContentChoiceSetWrapper"),
						aRadioButtons = aRadioButtonsContainer.children();

					Opa5.assert.strictEqual($oCard.find("#SimpleVal ui5-input").val(), oData["SimpleVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#UrlVal ui5-input").val(), oData["UrlVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#EmailVal ui5-input").val(), oData["EmailVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#TelVal ui5-input").val(), oData["TelVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#MultiLineVal ui5-textarea").val(), oData["MultiLineVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#NumVal ui5-step-input").val(), parseInt(oData["NumVal"]), "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#DateVal ui5-date-picker").val(), oData["DateVal"], "The value is correct");
					Opa5.assert.strictEqual($oCard.find("#TimeVal ui5-time-picker").val(), oData["TimeVal"], "The value is correct");

					for (var i = 0; i < aRadioButtons.length; i++) {
						if (aRadioButtons[i].selected) {
							Opa5.assert.strictEqual(aRadioButtons[i].value, oData["SingleSelectVal"], "The value is correct");
						}
					}
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
					Opa5.assert.strictEqual(oData.url, "http://www.company_a.example.com", "The URL is correct");
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
			.and.iLoadTheCardContent()
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