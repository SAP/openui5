/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MenuButtonMenuPosition", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.MenuButton';

	// verify MenuButton is opened and the menu position is BeginBottom
	it("should open MenuButton in position BeginBottom", function() {
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_BeginBottom_position");
	});

	// verify MenuButton is opened and the menu position is BeginTop
	it("should open MenuButton in position BeginTop", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_BeginTop_position");
	});

	// verify MenuButton is opened and the menu position is BeginCenter
	it("should open MenuButton in position BeginCenter", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_BeginCenter_position");
	});

	// verify MenuButton is opened and the menu position is LeftTop
	it("should open MenuButton in position LeftTop", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_LeftTop_position");
	});

	// verify MenuButton is opened and the menu position is LeftCenter
	it("should open MenuButton in position LeftCenter", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_LeftCenter_position");
	});

	// verify MenuButton is opened and the menu position is LeftBottom
	it("should open MenuButton in position LeftBottom", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_LeftBottom_position");
	});

	// verify MenuButton is opened and the menu position is CenterTop
	it("should open MenuButton in position CenterTop", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_CenterTop_position");
	});

	// verify MenuButton is opened and the menu position is LeftTop
	it("should open MenuButton in position CenterCenter", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_CenterCenter_position");
	});

	// verify MenuButton is opened and the menu position is CenterBottom
	it("should open MenuButton in position CenterBottom", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_CenterBottom_position");
	});

	// verify MenuButton is opened and the menu position is RightTop
	it("should open MenuButton in position RightTop", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_RightTop_position");
	});

	// verify MenuButton is opened and the menu position is RightCenter
	it("should open MenuButton in position RightCenter", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_RightCenter_position");
	});

	// verify MenuButton is opened and the menu position is RightBottom
	it("should open MenuButton in position RightBottom", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_RightBottom_position");
	});

	// verify MenuButton is opened and the menu position is EndTop
	it("should open MenuButton in position EndTop", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_EndTop_position");
	});

	// verify MenuButton is opened and the menu position is EndCenter
	it("should open MenuButton in position EndCenter", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_EndCenter_position");
	});

	// verify MenuButton is opened and the menu position is EndBottom
	it("should open MenuButton in position EndBottom", function() {
		element(by.id("posButtonId")).click();
		element(by.id("posMenuId")).click();
		expect(takeScreenshot()).toLookAs("menu_in_EndBottom_position");
	});
});
