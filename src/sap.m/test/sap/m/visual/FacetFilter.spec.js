/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.FacetFilter", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot(element(by.id("listUpdateModelAsync")))).toLookAs("initial");
	});

	// verify facet list opens and contains the correct items
	it("should open listUpdateModelAsync FacetFilter", function() {
		element(by.id("listUpdateModelAsync")).click();
		_takeScreenshot("listUpdateModelAsync_FacetFilter");
	});

	it("should navigate to listUpdateModelAsync FacetFilter second page", function () {
		element(by.css("ul > li")).click();
		_takeScreenshot("listUpdateModelAsync_SecondPage");
	});

	it("should update list in listUpdateModelAsync FacetFilter", function () {
		element(by.tagName('button')).click();
		_takeScreenshot("listUpdateModelAsync_updatedFacetPage");
	});

	function _takeScreenshot(img) {
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			var oFacetDialog = element(by.css('.sapMDialog'));
			expect(takeScreenshot(oFacetDialog)).toLookAs(img);
		} else {
			expect(takeScreenshot()).toLookAs(img);
		}
	}
});
