/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.tnt.ToolPageRootItemsOnly", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.tnt.ToolPage";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// change the page content
	it("should change the page content", function () {
		element(by.css("#NList li:nth-of-type(4) .sapTntNLIFirstLevel [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("1_changed_page_content");
	});

	// collapse Side Content
	it("should visualize collapsed side content", function () {
			element(by.id("menuToggleButton")).click();
			expect(takeScreenshot()).toLookAs("2_collapsed_side_content");
	});

	// click on menu item
	it("should click on first item (collapsed)", function () {
		element(by.css("#NList > .sapTntNLOverflow [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("3_click_on_menu_item");
	});
});
