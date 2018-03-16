/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.ui.layout.BlockLayout', function () {
	"use strict";

	function _switchBackgroundAndTakeScreenshot(sClickId, sScreenshotAreaId) {
		element(by.id(sClickId)).click();
		element(by.id("__page0-intHeader")).click(); // Remove focus from the input field

		var blockLayoutRef = element(by.id(sScreenshotAreaId));
		expect(takeScreenshot(blockLayoutRef)).toLookAs(sScreenshotAreaId);
	}

	it('Default Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-default", "layout-default");
	});

	it('Light Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-light", "layout-light");
	});

	it('Accent Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-accent", "layout-accent");
	});

	it('Dashboard Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-dashboard", "layout-dashboard");
	});
});