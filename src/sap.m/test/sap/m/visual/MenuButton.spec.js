/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MenuButton", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.MenuButton';

	function openOverflow(){
		var oOverflowList1 = element(by.id("overflowToolbarInListItem3-overflowButton"));

		oOverflowList1.click();
		return element(by.id("overflowToolbarInListItem3-popover"));
	}

	it('All MenuButtons look correct in Cozy', function() {
		var oPage = element(by.id("page0"));

		expect(takeScreenshot(oPage)).toLookAs('menubutton_demo_page_cozy');
	});

	it('MenuButton has adequate initial width', function() {
		var oMenuButton4 = element(by.id("mb4")),
			oPopoverMenu;

		oMenuButton4.click();
		oPopoverMenu = element(by.id("__menu7"));

		expect(takeScreenshot(oPopoverMenu)).toLookAs('menubutton_initial_width_disabled_items');
	});

	it('MenuButton correctly opens and focus a menu with enabled items', function() {
		var oMenuButton = element(by.id("mb-toolbar")),
			oPopoverMenu;

		oMenuButton.click();
		oPopoverMenu = element(by.id("__menu7"));

		expect(takeScreenshot(oPopoverMenu)).toLookAs('menubutton_menu_items_enabled');
	});

	it('ManuButton correctly truncates long text in OverflowToolbar (Cozy)', function() {
		expect(takeScreenshot(openOverflow())).toLookAs('menubutton_toolbar_truncated_cozy');
	});

	it('Change to Compact Mode', function() {
		var oPage = element(by.id("page0")),
			oSelect = element(by.id("density_select")),
			oCompactItem = element(by.id("item_compact"));

		oSelect.click();
		oCompactItem.click();
		expect(takeScreenshot(oPage)).toLookAs('menubutton_compact_initial_width');
	});

	it('ManuButton correctly truncates long text in OverflowToolbar (Compact)', function() {
		expect(takeScreenshot(openOverflow())).toLookAs('menubutton_toolbar_truncated_compact');
	});

});
