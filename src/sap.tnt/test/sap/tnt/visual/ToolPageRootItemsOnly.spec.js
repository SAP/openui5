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

		element(by.css('#NList > li:first-of-type > .sapTntNavLIGroupItems > li:nth-of-type(3)')).click();
		expect(takeScreenshot()).toLookAs('1_changed_page_content');
	});

	var sideNav = element(by.id('SNav'));

	// collapse NavigationListItem
	it('should visualize collapse NavigationListItem', function () {
		element(by.css('#NList > li:first-of-type .sapUiIcon[aria-label=Collapse]')).click();
		expect(takeScreenshot(sideNav)).toLookAs('2_collapsedNavigation_List_Item');
	});

	// long list of items
	it('should visualize long list of items', function () {
		element(by.css('#NList > li:nth-of-type(3) .sapUiIcon[aria-label=Expand]')).click();
		expect(takeScreenshot(sideNav)).toLookAs('3_long_list_of_items');
	});

	// collapse Side Content
	it('should visualize collapsed side content', function () {
			element(by.id('menuToggleButton')).click();
			expect(takeScreenshot()).toLookAs('4_collapsed_side_content');
	});

	// click on menu item
	// only for desktop
	it('should click on first item (collapsed)', function () {
		if (!bPhone) {
			element(by.css('#NList > .sapTnTNavLIOverflow')).click();
			expect(takeScreenshot()).toLookAs('5_click_on_menu_item');
		}
	});

	// change the page content
	// only for desktop
	it('should change the page content (collapsed)', function () {
		if (!bPhone) {
			element(by.css('.sapTntNavLIPopup ul.sapTntNavLIGroupItems > li:first-child')).click();
			expect(takeScreenshot()).toLookAs('6_change_page_content');
		}
	});

	// no side navigation
	it('should NOT display side navigation', function () {
		element(by.id('menuToggleButton')).click();
		element(by.css('#NList > li:first-of-type .sapUiIcon[aria-label=Expand]')).click();
		element(by.css('#NList > li:first-of-type > .sapTntNavLIGroupItems > li:nth-of-type(4)')).click();
		expect(takeScreenshot(element(by.id('page3')))).toLookAs('7_no_side_navigation');
	});
});
