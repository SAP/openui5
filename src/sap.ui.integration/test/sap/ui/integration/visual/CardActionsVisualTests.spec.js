/* eslint-env node */
/* global describe, it, by, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardActionsVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";


	it("Navigation Action page", function () {
		var aCardIds = ["listNavService", "tableNavService"];

		utils.navigateTo("Navigation Action");

		aCardIds.forEach(function (sId) {
			var oCard = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NavigationService",
					interaction: "root",
					id: sId
				}
			};

			utils.hoverOn(
				utils.getElement(oCard).element(by.css(".sapMLIB:nth-child(1)"))
			);

			utils.takePictureOfElement(oCard, "Actions_" + sId);
		});
	});
});