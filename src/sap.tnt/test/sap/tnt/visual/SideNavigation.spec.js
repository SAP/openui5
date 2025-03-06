/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.tnt.SideNavigation", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.tnt.SideNavigation";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should visualize Side Navigation without icons", function () {
		var sideNav = element(by.id("sideNavigationNoIcons"));
		expect(takeScreenshot(sideNav)).toLookAs("1_side_nav_no_icons");
	});

	it("should visualize Side Navigation without icons selection", function () {
		var sideNav = element(by.id("sideNavigationNoIcons"));
		element(by.css("#NL .sapTntNLI")).click();
		expect(takeScreenshot(sideNav)).toLookAs("2_side_nav_no_icons_selection");
	});
});
