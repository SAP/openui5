/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MenuButton", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.MenuButton';

	it('has adequate initial width', function() {
		var oMenuButton3 = element(by.id("mb3")),
			oMenuButton4 = element(by.id("mb4"));
		oMenuButton4.click();
		expect(takeScreenshot(oMenuButton3)).toLookAs('menubutton_initial_width');
	});

	it('Menu button parts are visible and aligned', function() {
		var oPage = element(by.id("page0"));

		expect(takeScreenshot(oPage)).toLookAs('menu_buttons_in_page');
	});
});
