/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.ui.layout.BlockLayoutLightColors', function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.layout.BlockLayout';

	it("initial load", function () {
		var oBlockLayout = element(by.control({
			id: "BlockLayout",
			viewName: "sap.ui.layout.BlockLayoutLightColors"
		}));
		expect(takeScreenshot(oBlockLayout)).toLookAs("block_layout_light");
	});
});