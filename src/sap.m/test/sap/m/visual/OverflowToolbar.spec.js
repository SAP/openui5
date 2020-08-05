/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.OverflowToolbar", function() {
	"use strict";

	it("OverflowToolar initial rendering",function() {
		expect(takeScreenshot()).toLookAs("overflowToolbar-rendering");
	});

	it("OverflowToolar click overflow button with CheckBox in Popover Menu", function() {
		element(by.id("otb6-overflowButton")).click();
		expect(takeScreenshot()).toLookAs("popover-menu-with-checkbox");
	});

	it("OverflowToolar click overflow button",function() {
		element(by.id("otb0-overflowButton")).click();
		expect(takeScreenshot()).toLookAs("overflow-button-clicked");
	});

	it("Resize OverflowToolar to 700px",function() {
		element(by.id("size_btn2")).click();
		expect(takeScreenshot()).toLookAs("overflowToolbar-resized-700");
	});

	it("Resize OverflowToolar to 480px",function() {
		element(by.id("size_btn")).click();
		expect(takeScreenshot()).toLookAs("overflowToolbar-resized-480");
	});

});