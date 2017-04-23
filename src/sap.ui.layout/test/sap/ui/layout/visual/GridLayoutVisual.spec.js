/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.ui.layout.GridLayoutVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.layout.form.GridLayout';
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

	// using Toolbars
	it("should show Form with Toolbars", function () {
		element(by.id("B3-button")).click();
		oForm = element(by.id(sFormId));
		expect(takeScreenshot(oForm)).toLookAs("003_Form_Toolbar");
	});

	// one container
	it("should show Form with only one container", function () {
		element(by.id("B4-button")).click();
		oForm = element(by.id(sFormId));
		expect(takeScreenshot(oForm)).toLookAs("004_Form_OneContainer");
	});

});