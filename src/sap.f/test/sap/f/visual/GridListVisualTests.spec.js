/* global describe, it, element, by, takeScreenshot, browser, expect */

describe("sap.f.GridListVisualTests", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.f.GridList";

	function goToIconTabFilter (sId) {
		element(by.control({
			id: sId,
			viewName: "Main",
			viewNamespace: "sap.f.gridlist.view.",
			controlType: "sap.m.IconTabFilter"
		})).click();
	}

	function takePictureOfContent (sPictureTitle) {
		var oContent = element(by.css(".sapMITBContainerContent"));
		expect(takeScreenshot(oContent)).toLookAs(sPictureTitle);
	}

	it("should visualize GridList with basic layout", function () {
		takePictureOfContent("0_general");
	});

	it("should visualize GridList with breakpoints", function () {
		goToIconTabFilter("GridList2");
		takePictureOfContent("1_breakpoints");
	});

	it("should visualize GridList with BoxContainer layout", function () {
		goToIconTabFilter("GridList3");
		takePictureOfContent("2_boxcontainer");
	});

	it("should visualize growing GridList", function () {
		goToIconTabFilter("GridList4");
		takePictureOfContent("3_growing");

		element(by.css(".sapMGrowingListTrigger")).click();
		takePictureOfContent("4_growing_more");
	});

	it("should visualize GridList grouping with auto row height", function () {
		element(by.css(".sapMITBArrowScrollRightInLine")).click();
		goToIconTabFilter("GridList5");
		takePictureOfContent("5_grouping1");
	});

	it("should visualize GridList grouping with auto row height and align-items start", function () {
		goToIconTabFilter("GridList6");
		takePictureOfContent("6_grouping2");
	});

	it("should visualize GridList grouping with equal rows", function () {
		goToIconTabFilter("GridList7");
		takePictureOfContent("7_grouping3");
	});

	it("should visualize GridList grouping with equal rows and gridTemplateRows 3rem", function () {
		goToIconTabFilter("GridList8");
		takePictureOfContent("8_grouping4");
	});

	it("should visualize GridList grouping with default layout", function () {
		goToIconTabFilter("GridList9");
		takePictureOfContent("9_grouping5");
	});
});