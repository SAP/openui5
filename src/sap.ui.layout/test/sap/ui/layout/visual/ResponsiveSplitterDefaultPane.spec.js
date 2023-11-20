/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.ui.layout.ResponsiveSplitterDefaultPane', function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.layout.ResponsiveSplitter';

	it("Default Pane", function () {
		var oBlockLayout = element(by.control({
			id: "responsiveSplitter",
			viewName: "sap.ui.layout.ResponsiveSplitterDefaultPane"
		}));
		expect(takeScreenshot(oBlockLayout)).toLookAs("responsive_splitter_default_pane");
	});
});