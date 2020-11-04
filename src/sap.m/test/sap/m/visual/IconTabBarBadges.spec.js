/* global protractor, describe, it, element, by, takeScreenshot, expect, browser */

describe("sap.m.IconTabBarBadges", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.IconTabBar";

	function runAllCases (sContentDensity) {
		it("should show badges aligned in text only IconTabBar", function() {
			var oItb = element(by.control({
				id: "iconTabBarTextOnly",
				viewName: "sap.m.iconTabBarBadges.view.V"
			}));
			expect(takeScreenshot(oItb)).toLookAs(sContentDensity + "_1_textOnly");
		});

		it("should show badges aligned in select list menu", function() {
			var oMore = element(by.control({
				controlType: "sap.m.IconTabFilter",
				viewName: "sap.m.iconTabBarBadges.view.V",
				properties: {
					text: "More"
				},
				ancestor: {
					id: "iconTabBarTextOnly",
					viewName: "sap.m.iconTabBarBadges.view.V"
				},
				interaction: {
					idSuffix: "text"
				}
			}));

			oMore.click();

			var oSelectList = element(by.control({
				controlType: "sap.m.IconTabBarSelectList",
				properties: {
					visible: true
				}
			}));

			expect(takeScreenshot(oSelectList)).toLookAs(sContentDensity + "_2_selectListMenu");

			oMore.sendKeys(protractor.Key.ESCAPE);
		});

		it("should show badges aligned in text and count IconTabBar", function() {
			var oItb = element(by.control({
				id: "iconTabBarTextAndCount",
				viewName: "sap.m.iconTabBarBadges.view.V"
			}));
			expect(takeScreenshot(oItb)).toLookAs(sContentDensity + "_3_textAndCount");
		});

		it("should show badges aligned in icon only IconTabBar", function() {
			var oItb = element(by.control({
				id: "iconTabBarIconOnly",
				viewName: "sap.m.iconTabBarBadges.view.V"
			}));
			expect(takeScreenshot(oItb)).toLookAs(sContentDensity + "_4_iconOnly");
		});

		it("should show badges aligned in icon and text IconTabBar", function() {
			var oItb = element(by.control({
				id: "iconTabBarIconAndText",
				viewName: "sap.m.iconTabBarBadges.view.V"
			}));
			expect(takeScreenshot(oItb)).toLookAs(sContentDensity + "_5_iconAndText");
		});

		it("should show badges aligned in horizontal design IconTabBar", function() {
			var oItb = element(by.control({
				id: "iconTabBarHorizontal",
				viewName: "sap.m.iconTabBarBadges.view.V"
			}));
			expect(takeScreenshot(oItb)).toLookAs(sContentDensity + "_6_horizontal");
		});

	}

	// sapUiSizeCozy
	runAllCases("Coz");

	it("should switch content density to compact", function () {
		element(by.control({
			id: "densityModeBox",
			viewName: "sap.m.iconTabBarBadges.view.V"
		})).click();
	});

	// sapUiSizeCompact
	runAllCases("Comp");
});
