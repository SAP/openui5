/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.f.GridContainer", function() {
	"use strict";

	it("Tests focus border around item", function() {
		element(by.id("title")).click();
		expect(takeScreenshot(element(by.id("gridContainer")))).toLookAs("1_item_focus_border");
	});

	it("Tests focus border around nested cards", function() {
		var card = element(by.id("cardWithNestedCards"));

		card.click();
		expect(takeScreenshot(card)).toLookAs("2_card_focus_border");
	});

});
