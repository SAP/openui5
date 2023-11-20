/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.Text", function() {
	"use strict";
	// initial loading
	// there is one invisible text with ID "text8". If it gets visible this will be seen in this screenshot

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// standard
	it("should visualize the whole text", function () {
		var txt1 = element(by.id('text1'));
		expect(takeScreenshot(txt1)).toLookAs("1_standard");
	});

	// no wrapping
	it("should visualize text with no wrapping", function () {
		var txt2 = element(by.id('text2'));
		expect(takeScreenshot(txt2)).toLookAs("2_no_wrapping");
	});

	// fixed width in em
	it("should visualize text with fixed width in em", function () {
		var txt3 = element(by.id('text3'));
		browser.executeScript('document.getElementById("text3").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt3)).toLookAs("3_fixed_width_in_em");
		});
	});

	// fixed width in %
	it("should visualize text with fixed width in %", function () {
		var txt3a = element(by.id('text3a'));
		browser.executeScript('document.getElementById("text3a").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt3a)).toLookAs("3a_fixed_width_in_percentage");
		});
	});

	// fixed width in px
	it("should visualize text with fixed width in px", function () {
		var txt3b = element(by.id('text3b'));
		browser.executeScript('document.getElementById("text3b").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt3b)).toLookAs("3b_fixed_width_in_px");
		});
	});

	// styled
	it("should visualize styled text", function () {
		var txt4 = element(by.id('text4'));
		browser.executeScript('document.getElementById("text4").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt4)).toLookAs("4_styled");
		});
	});

	// align right
	it("should visualize right aligned text", function () {
		var txt5 = element(by.id('text5'));
		browser.executeScript('document.getElementById("text5").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt5)).toLookAs("5_align_right");
		});
	});

	// align left
	it("should visualize left aligned text", function () {
		var txt5a = element(by.id('text5a'));
		browser.executeScript('document.getElementById("text5a").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt5a)).toLookAs("5a_align_left");
		});
	});

	// align end
	it("should visualize end aligned text", function () {
		var txt5b = element(by.id('text5b'));
		browser.executeScript('document.getElementById("text5b").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt5b)).toLookAs("5b_align_end");
		});
	});

	// align begin
	it("should visualize begin aligned text", function () {
		var txt5c = element(by.id('text5c'));
		browser.executeScript('document.getElementById("text5c").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt5c)).toLookAs("5c_align_begin");
		});
	});

	// align center
	it("should visualize center aligned text", function () {
		var txt5d = element(by.id('text5d'));
		browser.executeScript('document.getElementById("text5d").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt5d)).toLookAs("5d_align_center");
		});
	});

	// RTL (Right-to-left)
	it("should visualize text with RTL direction", function () {
		var txt6 = element(by.id('text6'));
		browser.executeScript('document.getElementById("text6").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt6)).toLookAs("6_RTL");
		});

	});

	// LTR (Left-to-right)
	it("should visualize text with LTR direction", function () {
		var txt6a = element(by.id('text6a'));
		browser.executeScript('document.getElementById("text6a").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt6a)).toLookAs("6a_LTR");
		});

	});

	// Direction Inherit
	it("should visualize text with direction inherit", function () {
		var txt6b = element(by.id('text6b'));
		browser.executeScript('document.getElementById("text6b").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt6b)).toLookAs("6b_Direction_Inherit");
		});
	});

	// line breaks
	it("should visualize text with line breaks", function () {
		var txt7 = element(by.id('text7'));
		browser.executeScript('document.getElementById("text7").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt7)).toLookAs("7_line_breaks");
		});

	});

	// max lines 3
	it("should visualize text in 3 lines", function () {
		var txt9 = element(by.id('text9'));
		browser.executeScript('document.getElementById("text9").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt9)).toLookAs("9_max_lines");
		});
	});

	// RTL + max lines 2
	it("should visualize text in RTL and in 2 lines", function () {
		var txt10 = element(by.id('text10'));
		browser.executeScript('document.getElementById("text10").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt10)).toLookAs("10_RTL_max_lines");
		});
	});

	// Text with different line breaks
	it("should visualize text with different line breaks", function () {
		var txt11 = element(by.id('text11'));
		browser.executeScript('document.getElementById("text11").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt11)).toLookAs("11_different_line_breaks");
		});
	});

	// Text with rendered white spaces
	it("should visualize text with preserved white spaces and tabs", function () {
		var txt12 = element(by.id('text12'));
		browser.executeScript('document.getElementById("text12").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt12)).toLookAs("12_preserve_white_spaces_and_tabs");
		});
	});

	// Text with escaped characters
	it("should visualize text with escaped characters", function () {
		var txt13 = element(by.id('text13'));
		browser.executeScript('document.getElementById("text13").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt13)).toLookAs("13_escaped_characters");
		});
	});

	// wrappingType (hyphenation)
	it("should visualize text with hyphenation", function () {
		var txt14 = element(by.id('text14'));
		browser.executeScript('document.getElementById("text14").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt14)).toLookAs("14_hyphenation");
		});
	});

	it("should respect the textDirection setting", function() {
		var txt15 = element(by.id('text15'));
		browser.executeScript('document.getElementById("text15").scrollIntoView()').then(function() {
			expect(takeScreenshot(txt15)).toLookAs("15_rtl_support");
		});
	});
});