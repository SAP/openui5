/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.tnt.ToolPage', function() {
	"use strict";

	// initial loading
	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('0_initial');
	});

	// change the page content
	it('should change the page content', function () {
		element(by.css('#NList > li:first-of-type > .sapTntNavLIGroupItems > li:nth-of-type(3)')).click();
		expect(takeScreenshot()).toLookAs('1_changed_page_content');
	});

	var sideNav = element(by.id('SNav'));

	// collapse NavigationListItem
	it('should visualize collapse NavigationListItem', function () {
		element(by.id('__icon1')).click();
		expect(takeScreenshot(sideNav)).toLookAs('2_collapsedNavigation_List_Item');
	});

	// long list of items
	it('should visualize long list of items', function () {
		element(by.id('__icon3')).click();
		expect(takeScreenshot(sideNav)).toLookAs('3_long_list_of_items');
	});

	// collapse Side Content
	it('should visualize collapsed side content', function () {
		element(by.id('menuToggleButton')).click();
		expect(takeScreenshot()).toLookAs('4_collapsed_side_content');
	});

	// click on first item
	it('should click on first item (collapsed)', function () {
		element(by.css('#NList > li:first-of-type')).click();
		expect(takeScreenshot()).toLookAs('5_click_on_first_item');
	});

	// change the page content
	it('should change the page content (collapsed)', function () {
		element(by.css('.sapTntNavLIPopup ul.sapTntNavLIGroupItems > li:first-child')).click();
		expect(takeScreenshot()).toLookAs('6_change_page_content');
	});

	// long list of items
	it('should visualize long list of items (collapsed)', function () {
		element(by.css('#NList > li:nth-of-type(3)')).click();
		expect(takeScreenshot()).toLookAs('7_long_list_of_items');
	});

	var toolHeader = element(by.id('__header0'));
	it('should display tool header', function () {
		expect(takeScreenshot(toolHeader)).toLookAs('tool_header');
	});
});
