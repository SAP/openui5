/*global describe,it,element,by,browser, takeScreenshot,expect, protractor*/

describe("sap.m.MessageToast", function () {
	"use strict";

	it("should focus MessageToast to display it permanently and close", function () {
		element(by.id("show-button-2")).click();

		browser.actions().sendKeys([protractor.Key.CONTROL, protractor.Key.SHIFT, "m"]).perform();
		expect(takeScreenshot()).toLookAs("message_toast_focused");
	});

	it("should close MessageToast ", function () {
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform(); // Avoid opening of the contextual browser menu on MacOS in the next tests
		expect(takeScreenshot()).toLookAs("message_toast_closed");
	});

	var sPosition,
		fnScreenshotToast = function (sPosition) {
			element(by.id("select-list")).click();
			element(by.id(sPosition)).click();
			element(by.id("show-button")).click();
			expect(takeScreenshot()).toLookAs(sPosition);
		};

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	["begin", "center", "end", "left", "right"].forEach(function (sFirstPosition) {
		["bottom", "center", "top"].forEach(function (sSecondPosition) {
			sPosition = sFirstPosition + "-" + sSecondPosition;
			it("should open MessageToast with position " + sPosition, fnScreenshotToast.bind(this, sPosition));
		});
	});
});
