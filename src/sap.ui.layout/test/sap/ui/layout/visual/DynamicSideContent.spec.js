/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.ui.layout.DynamicSideContent', function () {
	"use strict";

	it("should render the whole page", function() {
		expect(takeScreenshot(element(by.id("__content0")))).toLookAs("dsc_initial");
	});

	it("should hide the main content", function() {
		element(by.id("btnHideMC")).click();
		expect(takeScreenshot(element(by.id("__content0")))).toLookAs("main_content_hidden");
	});
});