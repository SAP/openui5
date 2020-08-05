/* global describe, it, element, by, takeScreenshot, expect */

describe("sap.f.GridListItem", function() {
	"use strict";

	it("GridListItem with mode 'None'", function() {
		var oGrid = element(by.id("gridList"));
		expect(takeScreenshot(oGrid)).toLookAs("0_mode_none");
	});

	it("GridListItem with mode 'Delete'", function() {
		var oGrid = element(by.id("gridList")),
			oModeSwitchButton = element(by.id("deleteMode-button"));

		oModeSwitchButton.click();
		expect(takeScreenshot(oGrid)).toLookAs("1_mode_delete");
	});

	it("GridListItem with mode 'SingleSelectLeft'", function() {
		var oGrid = element(by.id("gridList")),
			oModeSwitchButton = element(by.id("singleSelectLeftMode-button"));

		oModeSwitchButton.click();
		expect(takeScreenshot(oGrid)).toLookAs("2_mode_singleSelectLeft");
	});

	it("GridListItem with mode 'MultiSelect'", function() {
		var oGrid = element(by.id("gridList")),
			oModeSwitchButton = element(by.id("multiSelectMode-button"));

		oModeSwitchButton.click();
		expect(takeScreenshot(oGrid)).toLookAs("3_mode_multiSelect");
	});

	it("GridListItem with mode 'MultiSelect'", function() {
		var oGrid = element(by.id("gridList")),
			oModeSwitchButton = element(by.id("singleSelectMasterMode-button"));

		oModeSwitchButton.click();
		expect(takeScreenshot(oGrid)).toLookAs("4_mode_singleSelectMaster");
	});
});
