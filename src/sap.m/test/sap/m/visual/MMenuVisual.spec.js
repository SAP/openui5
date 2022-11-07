/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MMenuVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Menu';

	it('Menu with long menu item texts and submenus', function () {
		element(by.id("B1")).click();
		expect(takeScreenshot(element(by.jq(".sapMMenu")))).toLookAs("long_menu_items_submenus");
	});

	it('Menu with long menu item texts without submenus', function () {
		element(by.id("B2")).click();
		expect(takeScreenshot(element(by.jq(".sapMMenu")))).toLookAs("long_menu_items_no_submenus");
	});
});