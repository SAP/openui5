/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.ui.unified.Currency", function() {
	"use strict";

	// verify currency is rendered properly
	it("should align properly the currencies", function() {
		expect(takeScreenshot(element(by.id("__layout0")))).toLookAs("currency_in_layout");
	});
});
