/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MenuButton", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.MenuButton';

	it('has adequate initial width', function() {
		var oPage = element(by.id("page0")),
			oMenuButton4 = element(by.id("mb4"));

		oMenuButton4.click();

		expect(takeScreenshot(oPage)).toLookAs('menubutton_initial_width_disabled_items');
	});

	it('MenuButton correctly opens and focus a menu with enabled items', function() {
		var oPage = element(by.id("page0")),
			oMenuButton = element(by.id("mb-toolbar"));

		oMenuButton.click();

		expect(takeScreenshot(oPage)).toLookAs('menubutton_menu_items_enabled');
	});

	it('Menu button parts are visible and aligned', function() {
		var oPage = element(by.id("page0"));

		expect(takeScreenshot(oPage)).toLookAs('menu_buttons_in_page');
	});

	it('Change to Compact Mode', function() {
		var oSelect = element(by.id("density_select")),
			oCompactItem = element(by.id("item_compact")),
			oMenuButton3 = element(by.id("mb3"));

		oSelect.click();
		oCompactItem.click();
		expect(takeScreenshot(oMenuButton3)).toLookAs('menubutton_compact_initial_width');
	});

});
