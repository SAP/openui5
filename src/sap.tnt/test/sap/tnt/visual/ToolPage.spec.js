/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.tnt.ToolPage", function() {
	"use strict";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// change the page content
	it("should change the page content", function () {
		element(by.css("#NList li:first-of-type .sapTntNLIItemsContainer li:nth-of-type(3) [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("1_changed_page_content");
	});

	var sideNav = element(by.id("SNav"));

	// collapse NavigationListItem
	it("should visualize collapse NavigationListItem", function () {
		element(by.css("#NList li:first-of-type .sapUiIcon[aria-label=Collapse]")).click();
		expect(takeScreenshot(sideNav)).toLookAs("2_collapsedNavigation_List_Item");
	});

	// long list of items
	it("should visualize long list of items", function () {
		element(by.css("#NList li:nth-of-type(3) .sapUiIcon[aria-label=Expand]")).click();
		expect(takeScreenshot(sideNav)).toLookAs("3_long_list_of_items");
	});

	// collapse Side Content
	it("should visualize collapsed side content", function () {
		element(by.id("menuToggleButton")).click();
		expect(takeScreenshot()).toLookAs("4_collapsed_side_content");
	});

	// click on first item
	it("should click on first item (collapsed)", function () {
		element(by.css("#NList li:first-of-type [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("5_click_on_first_item");
	});

	// change the page content
	it("should change the page content (collapsed)", function () {
		element(by.css(".sapTntNLPopup ul.sapTntNLIItemsContainer > li:first-child [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("6_change_page_content");
	});

	// long list of items
	it("should visualize long list of items (collapsed)", function () {
		element(by.css("#NList li:nth-of-type(3) [tabindex]")).click();
		expect(takeScreenshot()).toLookAs("7_long_list_of_items");
	});

	it("should display tool header", function () {
		var toolHeader = element(by.id("tHeader"));
		toolHeader.click();
		expect(takeScreenshot(toolHeader)).toLookAs("8_tool_header");
	});

	// no side navigation
	it("should NOT display side navigation", function () {
		element(by.id("menuToggleButton")).click();
		element(by.css("#NList li:first-of-type .sapUiIcon[aria-label=Expand]")).click();
		element(by.css("#NList li:first-of-type .sapTntNLIItemsContainer li:nth-of-type(4) [tabindex]")).click();
		expect(takeScreenshot(element(by.id("page3")))).toLookAs("9_no_side_navigation");
	});
});
