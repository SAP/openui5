/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.ViewSettingsDialog", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ViewSettingsDialog';

	it('Open ViewSettingsDialog', function() {
		var oPage = element(by.id("testPage")),
			oDialogButton = element(by.id("open_d"));

		oDialogButton.click();

		expect(takeScreenshot(oPage)).toLookAs('view_settings_dialog_first_page');
	});

	it('Navigate to filter', function() {
		var oPage = element(by.id("testPage")),
			oFilterItem = element(by.id("test_filter-list-item"));

		oFilterItem.click();

		expect(takeScreenshot(oPage)).toLookAs('menubutton_initial_width_disabled_items');
	});

});
