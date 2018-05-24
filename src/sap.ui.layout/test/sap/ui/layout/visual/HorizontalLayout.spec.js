/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.ui.layout.HorizontalLayout", function() {
	"use strict";

	it("initial load", function () {
		var oLayout = element(by.id("myLayout"));
		expect(takeScreenshot(oLayout)).toLookAs("01_Initial_Load");
	});

	it("should render HorizontalLayout properly in sap.ui.layout.Splitter", function () {
		var oSplitter = element(by.id("splitter"));
		element(by.id("navigate-to-layout-in-splitter")).click();
		expect(takeScreenshot(oSplitter)).toLookAs("02_Load_In_Splitter");
	});

});