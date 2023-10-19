/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.tnt.ToolPageRootItemsOnly', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.tnt.ToolPage';

	var bPhone = null;

	// initial loading
	it('should load test page', function () {
		browser.executeScript("return sap.ui.Device.system.phone;")
			.then(function (response) {
				bPhone = response;
			});
		expect(takeScreenshot()).toLookAs('0_initial');
	});

	// change the page content
	it('should change the page content', function () {
		if (bPhone) {
			element(by.id('menuToggleButton')).click();
		}

		element(by.css('#NList > li:nth-of-type(4) .sapTntNavLIGroup')).click();
		expect(takeScreenshot()).toLookAs('1_changed_page_content');
	});

	// collapse Side Content
	it('should visualize collapsed side content', function () {
			element(by.id('menuToggleButton')).click();
			expect(takeScreenshot()).toLookAs('2_collapsed_side_content');
	});

	// click on menu item
	// only for desktop
	it('should click on first item (collapsed)', function () {
		if (!bPhone) {
			element(by.css('#NList > .sapTnTNavLIOverflow')).click();
			expect(takeScreenshot()).toLookAs('3_click_on_menu_item');
		}
	});
});
