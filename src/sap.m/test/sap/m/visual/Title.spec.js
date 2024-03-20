/*global describe,it,element,by,takeScreenshot,expect,protractor,browser*/

describe("sap.m.Title", function() {
	"use strict";

	function setSelectedKey(sId, sKey) {
		browser.executeScript(function (sId, sKey) {
			var Element = sap.ui.require("sap/ui/core/Element");
			Element.getElementById(sId).setSelectedKey(sKey);
		}, sId, sKey);
	}

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// wrappingType (hyphenation)
	it("should visualize hyphenation", function () {
		var t1 = element(by.id("title0"));
		element(by.id("setting2_width-inner")).sendKeys("310px");
		element(by.id("setting6_wrapping")).click();

		// delete "Normal" to type "Hyphenated"
		for (var index = 0; index < 6; index++) {
			element(by.id("setting7_wrappingType-inner")).sendKeys(protractor.Key.BACK_SPACE);
		}
		element(by.id("setting7_wrappingType-inner")).sendKeys("Hyphenated");
		element(by.id("setting7_wrappingType-inner")).sendKeys(protractor.Key.ENTER);

		expect(takeScreenshot(t1)).toLookAs("1_hyphenation");
	});

	// different types of align
	it("should visualize title with text-align: begin", function () {
		var	title = element(by.id("title1"));
		setSelectedKey("setting4_align", "Begin");

		expect(takeScreenshot(title)).toLookAs("2_align_begin");
	});

	it("should visualize title with text-align: end", function () {
		var	title = element(by.id("title1"));
		setSelectedKey("setting4_align", "End");

		expect(takeScreenshot(title)).toLookAs("3_align_end");
	});

	it("should visualize title with text-align: left", function () {
		var	title = element(by.id("title1"));
		setSelectedKey("setting4_align", "Left");

		expect(takeScreenshot(title)).toLookAs("4_align_left");
	});

	it("should visualize title with text-align: right", function () {
		var	title = element(by.id("title1"));
		setSelectedKey("setting4_align", "Right");

		expect(takeScreenshot(title)).toLookAs("5_align_right");
	});

	it("should visualize title with text-align: center", function () {
		var	title = element(by.id("title1"));
		setSelectedKey("setting4_align", "Center");

		expect(takeScreenshot(title)).toLookAs("6_align_center");
	});

	it("should visualize title with text-align: initial", function () {
		var	title = element(by.id("title1"));
		setSelectedKey("setting4_align", "Initial");

		expect(takeScreenshot(title)).toLookAs("7_align_initial");
	});

	// title with bar context
	it("should visualize title with bar context", function () {
		element(by.id("setting9_barContext")).click();
		expect(takeScreenshot(element(by.id("title1")))).toLookAs("8_with_bar_context");
		element(by.id("setting9_barContext")).click(); // remove bar context
	});

	// title with toolbar context
	it("should visualize title with toolbar context", function () {
		element(by.id("setting10_toolbarContext")).click();
		expect(takeScreenshot(element(by.id("title1")))).toLookAs("9_with_toolbar_context");
		element(by.id("setting10_toolbarContext")).click(); // remove toolbar context
	});

	// title without wrapping
	it("should visualize title without wrapping", function () {
		element(by.id("setting6_wrapping")).click();
		expect(takeScreenshot(element(by.id("title1")))).toLookAs("10_no_wrapping");
	});

	it("text direction: default (auto)", function () {
		var oContent = element(by.id("content-mixed-texts"));
		// delete "310px"
		for (var index = 0; index < 6; index++) {
			element(by.id("setting2_width-inner")).sendKeys(protractor.Key.BACK_SPACE);
		}
		element(by.id("setting2_width-inner")).sendKeys("800px");
		element(by.id("setting2_width-inner")).sendKeys(protractor.Key.ENTER);
		setSelectedKey("setting_dir", "Inherit");

		expect(takeScreenshot(oContent)).toLookAs("11_dir_auto");
	});

	// different text directions
	it("text direction: ltr", function () {
		var	oContent = element(by.id("content-mixed-texts"));
		setSelectedKey("setting_dir", "LTR");

		expect(takeScreenshot(oContent)).toLookAs("12_dir_ltr");
	});

	it("text direction: rtl", function () {
		var oContent = element(by.id("content-mixed-texts"));
		setSelectedKey("setting_dir", "RTL");

		expect(takeScreenshot(oContent)).toLookAs("13_dir_rtl");
	});

	it("text direction and text align: default", function () {
		var oContent = element(by.id("content-mixed-texts"));

		expect(takeScreenshot(oContent)).toLookAs("14_dir_and_align_default");
	});

	it("text direction 'RTL' and text align 'begin'", function () {
		var oContent = element(by.id("content-mixed-texts"));
		setSelectedKey("setting_dir", "RTL");
		setSelectedKey("setting4_align", "Begin");

		expect(takeScreenshot(oContent)).toLookAs("15_dir_and_align_rtl_begin");
	});

	it("text direction 'RTL' and text align 'End'", function () {
		var oContent = element(by.id("content-mixed-texts"));
		setSelectedKey("setting_dir", "RTL");
		setSelectedKey("setting4_align", "End");

		expect(takeScreenshot(oContent)).toLookAs("16_dir_and_align_rtl_end");
	});
});