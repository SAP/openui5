/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.Label", function() {
	"use strict";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// standard
	it("should visualize standard label", function () {
		var lbl1 = element(by.id('lbl1'));
		expect(takeScreenshot(lbl1)).toLookAs("1_standard");
	});

	// required
	it("should visualize required label", function () {
		var lbl2 = element(by.id('lbl2'));
		expect(takeScreenshot(lbl2)).toLookAs("2_required");
	});

	// bold
	it("should visualize bold label", function () {
		var lbl3 = element(by.id('lbl3'));
		expect(takeScreenshot(lbl3)).toLookAs("3_bold");
	});

	// direction LTR
	it("should visualize label with text direction LTR", function () {
		var lbl4 = element(by.id('lbl4'));
		expect(takeScreenshot(lbl4)).toLookAs("4_direction_LTR");
	});

	// direction RTL
	it("should visualize label with text direction RTL", function () {
		var lbl5 = element(by.id('lbl5'));
		expect(takeScreenshot(lbl5)).toLookAs("5_direction_RTL");
	});

	// direction Inherit
	it("should visualize label with text direction Inherit", function () {
		var lbl6 = element(by.id('lbl6'));
		expect(takeScreenshot(lbl6)).toLookAs("6_direction_Inherit");
	});

	// text align Begin
	it("should visualize label with text align Begin", function () {
		var lbl7 = element(by.id('lbl7'));
		lbl7.click();
		expect(takeScreenshot(lbl7)).toLookAs("7_align_Begin");
	});

	// text align Center
	it("should visualize label with text align Center", function () {
		var lbl8 = element(by.id('lbl8'));
		lbl8.click();
		expect(takeScreenshot(lbl8)).toLookAs("8_align_Center");
	});

	// text align End
	it("should visualize label with text align End", function () {
		var lbl9 = element(by.id('lbl9'));
		lbl9.click();
		expect(takeScreenshot(lbl9)).toLookAs("9_align_End");
	});

	// text align Left
	it("should visualize label with text align Left", function () {
		var lbl10 = element(by.id('lbl10'));
		lbl10.click();
		expect(takeScreenshot(lbl10)).toLookAs("10_align_Left");
	});

	// text align Right
	it("should visualize label with text align Right", function () {
		var lbl11 = element(by.id('lbl11'));
		lbl11.click();
		expect(takeScreenshot(lbl11)).toLookAs("11_align_Right");
	});

	// width
	it("should visualize label with fixed width", function () {
		var lbl13 = element(by.id('lbl13'));
		lbl13.click();
		expect(takeScreenshot(lbl13)).toLookAs("13_width");
	});

	// required truncated label
	it("should visualize required label Form", function () {
		var lbl14 = element(by.id('truncatedRequiredLabel'));
		browser.executeScript('document.getElementById("truncatedRequiredLabel").scrollIntoView()').then(function() {
			expect(takeScreenshot(lbl14)).toLookAs("14__truncated_required");
		});
	});

	// required truncated label in form
	it("should visualize truncated required label in Form", function () {
		var lbl15 = element(by.id('requiredTruncated'));
		browser.executeScript('document.getElementById("simpleForm").scrollIntoView()').then(function() {
			expect(takeScreenshot(lbl15)).toLookAs("15__truncated_required_form");
		});
	});

	// required  label in form
	it("should visualize truncated label in Form", function () {
		var lbl16 = element(by.id('truncated'));
			expect(takeScreenshot(lbl16)).toLookAs("16__truncated_form");
	});

	// required  label in form
	it("should visualize required label Form", function () {
		var lbl17 = element(by.id('requiredOnly'));
			expect(takeScreenshot(lbl17)).toLookAs("17__required_form");
	});

});