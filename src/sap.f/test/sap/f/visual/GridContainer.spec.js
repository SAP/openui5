/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.f.GridContainer", function() {
	"use strict";

	it("Tests focus border around item", function() {
		element(by.id("title")).click();
		expect(takeScreenshot(element(by.id("gridContainer")))).toLookAs("1_item_focus_border");
	});

});
