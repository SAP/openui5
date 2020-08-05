/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.SearchField", function () {
	"use strict";

	it("Should load test page", function() {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("Should visualize SearchField with palceholder", function () {
		expect(takeScreenshot(element(by.id("SF1")))).toLookAs("1_SearchField_placeholder");
	});

	it("Should visualize SearchField with refresh button", function () {
		expect(takeScreenshot(element(by.id("SF2")))).toLookAs("2_SearchField_refresh_button");
	});

	it("Should visualize disabled SearchField", function () {
		expect(takeScreenshot(element(by.id("SF3")))).toLookAs("3_SearchField_disabled");
	});

	it("Should visualize SearchField with 50% size", function () {
		expect(takeScreenshot(element(by.id("SF5")))).toLookAs("4_SearchField_width_percentage");
	});

	it("Should visualize SearchField without search button", function () {
		expect(takeScreenshot(element(by.id("SF7")))).toLookAs("5_SearchField_no_searchbutton");
	});

	it("Should visualize SearchField in dialog", function () {
		element(by.id("openDialog")).click();
		expect(takeScreenshot(element(by.id("Dialog")))).toLookAs("6_SearchField_in_dialog");
		element(by.id("reject")).click();
	});
});