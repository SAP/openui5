/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.tnt.SideNavigation", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.tnt.SideNavigation";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should visualize Side Navigation without icons", function () {
		browser.executeScript('document.getElementById("sideNavigationNoIcons").scrollIntoView()').then(function () {
			expect(takeScreenshot()).toLookAs("1_side_nav_no_icons");
			element(by.css("#sideNavigationNoIcons .sapTntNLI")).click();
			expect(takeScreenshot()).toLookAs("2_side_nav_no_icons_selection");
		});
	});
});
