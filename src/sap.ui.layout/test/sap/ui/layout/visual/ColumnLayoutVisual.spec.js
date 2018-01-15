/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.ui.layout.ColumnLayoutVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.layout.form.ColumnLayout';
	var sFormId = "SF1";
	var oForm = element(by.id(sFormId));

	// edit mode
	it("should show Form in edit mode", function () {
		expect(takeScreenshot(oForm)).toLookAs("001_Form_Edit");
	});

	// display mode
	it("should show Form in display mode", function () {
		element(by.id("B2-button")).click();
		oForm = element(by.id(sFormId));
		expect(takeScreenshot(oForm)).toLookAs("002_Form_Display");
	});

	// more columns
	it("should show Form with more columns", function () {
		element(by.id("B3-button")).click();
		oForm = element(by.id(sFormId));
		expect(takeScreenshot(oForm)).toLookAs("003_Form_MoreColumns");
	});

	// one container
	it("should show Form with only one container", function () {
		element(by.id("B4-button")).click();
		oForm = element(by.id(sFormId));
		expect(takeScreenshot(oForm)).toLookAs("004_Form_OneContainer");
	});

});