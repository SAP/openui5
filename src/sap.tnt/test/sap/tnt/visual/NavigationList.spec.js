/* global describe, it, element, by, takeScreenshot, expect */

describe("sap.tnt.NavigationList", function () {
	"use strict";

	it("should visualize NavigationList with icons", function () {
		var oNavigationList = element(by.id("navLiWithIcons"));
		expect(takeScreenshot(oNavigationList)).toLookAs("0_navigation_list_with_icons");
	});

	it("should visualize NavigationList without icons", function () {
		element(by.id("toPage2")).click();
		var oNavigationList = element(by.id("navLiWithoutIcons"));
		expect(takeScreenshot(oNavigationList)).toLookAs("1_navigation_list_without_icons");
	});
});