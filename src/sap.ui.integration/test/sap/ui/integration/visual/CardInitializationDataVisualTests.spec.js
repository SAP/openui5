/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardInitializationDataVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	function focusElement(oConfig) {
		var oElement = utils.getElement(oConfig);
		browser.executeScript("arguments[0].focus()", oElement.getWebElement());
	}

	it("No Content", function () {
		utils.navigateTo("No Header / No Content");

		var aCards = [
			{ id: "i2", focus: true },
			{ id: "i5", focus: true },
			{ id: "i6-error", focus: true }
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

			utils.takePictureOfElement(oElement, "2_NoContent_" + oCard.id);
		});
	});
});
