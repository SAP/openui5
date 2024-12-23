/* eslint-env node */
/* global element, by, browser, expect, takeScreenshot */

module.exports = {

	navigateTo: function (sTitle) {
		"use strict";
		element(by.control({
			controlType: "sap.m.CustomListItem",
			descendant: {
				controlType: "sap.m.Title",
				properties: { text: sTitle }
			}
		})).click();
	},

	navigateBack: function () {
		"use strict";
		browser.executeScript("window.history.back()");
	},

	getElement: function (oConfig) {
		"use strict";
		var oElement;

		if (oConfig.control) {
			oElement = element(by.control(oConfig.control));
		}

		if (oConfig.id) {
			oElement = element(by.id(oConfig.id));
		}

		if (oConfig.css) {
			oElement = element(by.css(oConfig.css));
		}

		return oElement;
	},

	takePictureOfElement: function (oConfig, sPictureId) {
		"use strict";
		var oElement = this.getElement(oConfig);

		oElement.getWebElement().then(function (webElem) {
			return webElem.getAttribute('id').then(function(id) {
				return browser.executeScript(`document.getElementById('${id}').scrollIntoView()`);
			});
		})
		.then(function() {
			return expect(takeScreenshot(oElement)).toLookAs(sPictureId);
		});
	},

	switchToCompactDensity: function () {
		"use strict";
		var oCompactBtn = element(by.control({
			controlType: "sap.m.SegmentedButton",
			descendant: {
				controlType: "sap.m.SegmentedButtonItem",
				properties: { key: "compact" }
			}
		}));

		browser.executeScript(function (sId) {
			document.getElementById(sId).scrollIntoView();
		}, oCompactBtn.getWebElement().getAttribute("id"));

		oCompactBtn.click();
	},

	hoverOn: function (oElement) {
		"use strict";
		browser.actions().mouseMove(oElement).perform();
	}
};