/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardErrorsMessagesVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	function focusElement(oConfig) {
		var oElement = utils.getElement(oConfig);
		browser.executeScript("arguments[0].focus()", oElement.getWebElement());
	}

	it("Error Messages", function () {
		utils.navigateTo("No Header / No Content");
		var aCards = [
			{ id: "i7-error", focus: true },
			{ id: "ListNodata-error", focus: true },
			{ id: "TableNodata-error", focus: true },
			{ id: "Custom-error", focus: true },
			{ id: "BadUrl-error", focus: true }
		];

		aCards.forEach(function (oCard) {
			var oElement = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NoHeaderNoContent",
					interaction: "root",
					id: oCard.id
				}
			};

			if (oCard.focus) {
				focusElement(oElement);
			}

			utils.takePictureOfElement(oElement, "3_ErrorMessage_" + oCard.id);
		});

		utils.navigateBack();
	});
});
