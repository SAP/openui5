/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe('sap.m.MultiInput', function() {
	"use strict";

	var bPhone = null;

	it("should load test page", function () {
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});

		expect(takeScreenshot()).toLookAs("initial");
	});

	//Initial Compact Mode
	it("should select Compact mode", function () {
		element(by.id("compactMode")).click();
		expect(takeScreenshot(element(by.id("page1")))).toLookAs("compact-mode");
		element(by.id("compactMode")).click();
	});

	//Single Line Mode
	it("should show on SingleLineMode", function () {
		expect(takeScreenshot(element(by.id("multiInputCustomValidator")))).toLookAs("multi-input-custom-validator");
	});

	//Single Line Mode selected
	it("should focus on SingleLineMode", function () {
		element(by.id("multiInputCustomValidator")).click();
		expect(takeScreenshot(element(by.id("multiInputCustomValidator")))).toLookAs("multi-input-custom-validator-selected");
	});

	//MultiInpuit not selected
	it("should show on multiInputCustomAsyncValidator tokens", function () {
		expect(takeScreenshot(element(by.id("multiInputCustomAsyncValidator")))).toLookAs("multi-input-custom-async-validator");
	});

	//MultiInpuit  selected
	it("should focus on multiInputCustomAsyncValidator tokens", function () {
		element(by.id("multiInputCustomAsyncValidator")).click();
		expect(takeScreenshot(element(by.id("multiInputCustomAsyncValidator")))).toLookAs("multi-input-custom-async-validator-slct");
	});

	//Multiple line enabled not  selected
	it("should show on Multi input enabled tokens", function () {
		expect(takeScreenshot(element(by.id("mI5")))).toLookAs("multi-input-line-not-selected");
	});

	//Multiple line enabled  selected
	it("should focus on Multi input enabled tokens", function () {
		element(by.id("mI5")).click();
		expect(takeScreenshot()).toLookAs("multi-input-line-selected");
		if (bPhone) {
			element(by.id("mI5-popup-closeButton")).click();
		}
	});

	//Multiinput warning
	it("should show on multiInput warning", function () {
		browser.executeScript('document.getElementById("mIWarning").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("mIWarning")))).toLookAs("multi-input-warning-not-selected");
		});
	});

	//Multiinput error
	it("should show on multiInput error", function () {
		expect(takeScreenshot(element(by.id("mIError")))).toLookAs("multi-input-error-not-selected");
	});

	//Multiinput success
	it("should show on multiInput success", function () {
		expect(takeScreenshot(element(by.id("mISuccess")))).toLookAs("multi-input-mISuccess-not-selected");
	});

	//Multiinput error selected
	it("should focus on multiInput error selected", function () {
		element(by.id("mIError")).click();
		expect(takeScreenshot(element(by.id("mIError")))).toLookAs("multi-input-error-selected");
	});

	//Multiinput error selected
	it("should show  multiInput multiInputNotEditable", function () {
		expect(takeScreenshot(element(by.id("multiInputNotEditable")))).toLookAs("multi-input-not-editalbe");
	});

	//Show multi input no placeholder
	it("should show   multiInput no placeholder", function () {
		expect(takeScreenshot(element(by.id("multiInputNotEditable")))).toLookAs("multi-input-not-editable");
	});


	//Show multi input with N-more and whole N-more label
	it("should show multiInput with N-more and reduced width", function () {
		browser.executeScript('document.getElementById("minWidthMI").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("minWidthMI")))).toLookAs("multi-input-min-width");
		});
	});

	//Multiinput read-only
	it("should show multiInput in read-only-state", function () {
		browser.executeScript('document.getElementById("multiInputReadOnlyInitial").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("multiInputReadOnlyInitial")))).toLookAs("multi-input-readonly-initial");
		});
	});

	//Show selected multi input no placeholder
	it("should show multiInput no placeholder", function () {
		browser.executeScript('document.getElementById("multiInputNotEditable").scrollIntoView()').then(function() {
			element(by.id("multiInputNotEditable")).click();
			expect(takeScreenshot(element(by.id("multiInputNotEditable")))).toLookAs("multi-input-not-editable-selected");
		});
	});

	it("multiinput should be in condensed mode", function() {
		browser.executeScript('document.getElementById("condensed-table").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("condensed-table")))).toLookAs("table-in-condensed-mode");
		});
	});

	it("should visualize MultiInput with cropped tokens and focus outline", function () {
		var oMultiInputInner = element(by.id("multiInput7-inner"));
		oMultiInputInner.click();
		expect(takeScreenshot(element(by.id("multiInput7")))).toLookAs("cropped_focused_tokens");
	});

	it("should invalidate the MultiInput, so all MI elements are there", function () {
		browser.executeScript('sap.ui.getCore().byId("dataBoundMultiInput").getTokens()[1].setText("Lorem ipsulum")').then(function () {
			expect(takeScreenshot(element(by.id("dataBoundMultiInput")))).toLookAs("token-update-text");
		});
	});

	it("Should visualize input with suggestions", function () {
		var oMultiInput = element(by.id("mIWithSuggestions"));
		browser.executeScript("document.getElementById('mIWithSuggestions').scrollIntoView()").then(function() {
			oMultiInput.click();
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_suggestions_focused");

			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("suggestions_visible");

			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("group_header_focused");

			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("first_suggestion_focused");

			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("input_field_focused");
		});
	});

	it("Should truncate one long token and not show the n-more label", function () {
		var oMultiInput = element(by.id("multiInputWithOneLongToken"));
		browser.executeScript("document.getElementById('multiInputWithOneLongToken').scrollIntoView()").then(function() {
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_one_long_token");

			oMultiInput.click();
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_one_long_token_focused_in");
		});
	});

	it("Should visualize multiInput with sticky header suggestions", function () {
		var oMultiInput = element(by.id("multiInputWithStickySuggestions"));
		browser.executeScript("document.getElementById('multiInputWithStickySuggestions').scrollIntoView()").then(function() {
			oMultiInput.click();
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_sticky_suggestions_focused");

			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_sticky_suggestions_text_inserted");

			for (var index = 0; index < 25; index++) {
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			}

			expect(takeScreenshot()).toLookAs("MI_with_sticky_suggestions_table_visible");
		});
	});
});