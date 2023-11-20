/*global describe,it,element,by,takeScreenshot,expect, browser, protractor*/

describe("sap.ui.core.ContextMenuSupport", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.core.ContextMenuSupport';

	var bDesktop = null;

	var aTestElements = [
		{
			name: "Button",
			id: "myButtonSample"
		},
		{
			name: "First List Item",
			id: "firstItem"
		},
		{
			name: "Down Left Button",
			id: "leftDownBtn"
		},
		{
			name: "Down Right Button",
			id: "rightDownBtn"
		},
		{
			name: "Last List Item",
			id: "lastItem"
		}
	];

	it("should load test page",function(){
		browser.executeScript(
			"return sap.ui.Device.system.desktop;")
			.then(function (response) {
				bDesktop = response;
		});

		expect(takeScreenshot()).toLookAs("initial");
	});

	aTestElements.forEach(function (oElement) {
		it("should open content menu for " + oElement.name + ".", function () {
			if (bDesktop) {
			var oElementRef = element(by.id(oElement.id));
				// right-click for desktop
				browser.actions().mouseMove(oElementRef).perform();
				browser.actions().click(protractor.Button.RIGHT).perform();

				expect(takeScreenshot()).toLookAs(oElement.id + "-contextMenu");
			}
		});
	});
});
