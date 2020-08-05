/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.ui.layout.HorizontalLayout", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.layout.HorizontalLayout';

	it("initial load", function () {
		var oLayout = element(by.id("myLayout"));
		expect(takeScreenshot(oLayout)).toLookAs("01_horizontal_layout_default");
		oLayout = element(by.id("splitter"));
		expect(takeScreenshot(oLayout)).toLookAs("02_horizontal_layout_in_splitter");
	});

});