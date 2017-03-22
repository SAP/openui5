describe('sap.ui.layout.BlockLayout', function () {
	"use strict";

	function _switchBackgroundAndTakeScreenshot(sClickId, sScreenshotAreaId) {
		element(by.id(sClickId)).click();
		var blockLayoutRef = element(by.id(sScreenshotAreaId));
		expect(takeScreenshot(blockLayoutRef)).toLookAs(sScreenshotAreaId);
	}

	it('Default Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-default", "layout-default");
	});

	it('Light Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-light", "layout-light");
	});

	it('Mixed Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-mixed", "layout-mixed");
	});

	it('Accent Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-accent", "layout-accent");
	});

	it('Dashboard Background', function () {
		_switchBackgroundAndTakeScreenshot("navigate-to-dashboard", "layout-dashboard");
	});
});