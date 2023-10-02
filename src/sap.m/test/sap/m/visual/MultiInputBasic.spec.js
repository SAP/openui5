/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe('sap.m.MultiInputBasic', function() {
	"use strict";

	it("should load test page", function () {
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	//Initial Compact Mode
	it("should select Compact mode", function () {
		element(by.id("compactMode")).click();
		expect(takeScreenshot()).toLookAs("compact-mode");
		element(by.id("compactMode")).click();
	});

	//MultiInpuit with custom validatior
	it("should focus on MultiInpuit with custom validatior", function () {
		element(by.id("multiInputCustomValidator-inner")).click();
		expect(takeScreenshot(element(by.id("multiInputCustomValidator")))).toLookAs("multi-input-custom-validator-selected");
	});

	//MultiInpuit with tokens validated asynchronously
	it("should show MultiInpuit with tokens validated asynchronously", function () {
		element(by.id("multiInputCustomAsyncValidator-inner")).click();
		expect(takeScreenshot(element(by.id("multiInputCustomAsyncValidator")))).toLookAs("multi-input-custom-async-validator-slct");
	});

	//Multiinput - warning value state
	it("should show MultiInput with warning value state", function () {
		browser.executeScript('document.getElementById("mIWarning").scrollIntoView()').then(function() {
			element(by.id("mIWarning-inner")).click();
			expect(takeScreenshot()).toLookAs("multi-input-warning-value-state");
		});
	});

	// Multiinput - error value state
	it("should show MultiInput with error value state", function () {
		element(by.id("mIError-inner")).click();
		expect(takeScreenshot()).toLookAs("multi-input-error-value-state");
	});

	// Multiinput - success value state
	it("should show MultiInput with success value state", function () {
		element(by.id("mISuccess-inner")).click();
		expect(takeScreenshot(element(by.id("mISuccess")))).toLookAs("multi-input-success-value-state");
	});

	// MultiInput warning value state with formatted value state text
	it("should show MultiInput with value state warning and foormatted value state text", function () {
		element(by.id("mIFVSWarning")).click();
		expect(takeScreenshot()).toLookAs("multi-input-warning-formatted-text");
	});

	// MultiInput error value state with formatted value state text
	it("should show MultiInput with value state error and formatted value state text", function () {
		element(by.id("mIFVSError")).click();
		expect(takeScreenshot()).toLookAs("multi-input-error-formatted-text");
	});

	// MultiInput - not editable with editable and not editable tokens
	it("should show not editable MultiInput", function () {
		element(by.id("multiInputNotEditable-inner")).click();
		expect(takeScreenshot(element(by.id("multiInputNotEditable")))).toLookAs("multi-input-not-editable");
	});

	// MultiInput in a table
	it("should show MultiInput in a table", function () {
		expect(takeScreenshot(element(by.id("tableTamplate")))).toLookAs("multi-input-in-table");
	});

	//Show multi input with N-more and whole N-more label
	it("should show MultiInput with editable and not editable tokens", function () {
		browser.executeScript('document.getElementById("multiInputReadOnlyTokens").scrollIntoView()').then(function() {
			element(by.id("multiInputReadOnlyTokens-inner")).click();
			expect(takeScreenshot(element(by.id("multiInputReadOnlyTokens")))).toLookAs("multi-input-editable-not-editable-tokens");
		});
	});

	// MultiInput with one very long token
	it("Should truncate one long token and not show the n-more label", function () {
		var oMultiInput = element(by.id("multiInputWithOneLongToken"));
		browser.executeScript("document.getElementById('multiInputWithOneLongToken').scrollIntoView()").then(function() {
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_one_long_token");

			element(by.id("multiInputWithOneLongToken-inner")).click();
			expect(takeScreenshot(oMultiInput)).toLookAs("MI_with_one_long_token_focused_in");

            browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
			expect(takeScreenshot()).toLookAs("MI_left_arrow_navigation");
		});
	});

	// Multiinput read-only
	it("should show MultiInput in read-only state", function () {
		browser.executeScript('document.getElementById("multiInputReadOnlyInitial").scrollIntoView()').then(function() {
			element(by.id("multiInputReadOnlyInitial-inner")).click();
			expect(takeScreenshot(element(by.id("multiInputReadOnlyInitial")))).toLookAs("multi-input-read-only-state");
		});
	});

	// MultiInput with minimum width
	it("should show MultiInput with minimum width", function () {
		browser.executeScript('document.getElementById("minWidthMI").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("minWidthMI")))).toLookAs("multi-input-min-width");
			element(by.id("minWidthMI-inner")).click();
			expect(takeScreenshot()).toLookAs("multi-input-minimum-width-focused");
		});
	});

	// MultiInput in a table in condensed mode
	it("should show MultiInput in a table in condensed mode", function() {
		browser.executeScript('document.getElementById("condensed-table").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("condensed-table")))).toLookAs("table-in-condensed-mode");
		});
	});
});