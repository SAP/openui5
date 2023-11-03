/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.tnt.SideNavigationGroups", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.tnt.SideNavigation";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// change the page content
	it("should change the page content", function () {
		element(by.css("#NL .sapTntNLIFirstLevel [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("1_selection");
	});

	// collapse Side Content
	it("should visualize collapsed side content", function () {
		element(by.id("toggleExpanded")).click();
		expect(takeScreenshot()).toLookAs("2_collapsed");
	});

	// click on menu item
	// only for desktop
	it("should click on first item (collapsed)", function () {
		element(by.css("#NList > .sapTntNLOverflow [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("3_click_on_overflow");
	});
});
