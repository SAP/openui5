/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.tnt.ToolPageWithSubHeaders', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.tnt.ToolPage';

	it("initial load", function () {
		var oToolPage = element(by.control({
			id: "toolPage",
			viewName: "sap.tnt.ToolPageWithSubHeader"
		}));
		expect(takeScreenshot(oToolPage)).toLookAs("toolPage_initial");
	});
});
