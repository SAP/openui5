/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe('sap.m.MultiInput', function() {
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

	// MultiInput - tabular suggestions
	it("should show MultiInput with tabular suggestions", function () {
		element(by.id("tabularSuggestMI-inner")).click();
		browser.actions().sendKeys("t").perform();
		expect(takeScreenshot()).toLookAs("multi-input-with-tabular-suggestions");
		browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
	});

	// MultiInput - multi-line mode
	it("should show MultiInput in multi-line mode", function () {
		element(by.id("multiLineMI-inner")).click();
		expect(takeScreenshot()).toLookAs("multi-input-multi-line-mode");
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
	it("should show MultiInput with value state error and foormatted value state text", function () {
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
		});
	});

	//  MultiInput with one long token - navigation
	it("Should visualize MultiInput after navigating with arrow key", function () {
		var oMultiInput = element(by.id("multiInputWithOneLongToken"));
		browser.executeScript("document.getElementById('multiInputWithOneLongToken').scrollIntoView()").then(function() {
			oMultiInput.click();
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

	// MultiInput invalidated
	it("should invalidate the MultiInput, so all MI elements are there", function () {
		browser.executeScript('sap.ui.getCore().byId("dataBoundMultiInput").getTokens()[1].setText("Lorem ipsulum")').then(function () {
			expect(takeScreenshot(element(by.id("dataBoundMultiInput")))).toLookAs("token-update-text");
		});
	});

	// MultiInput in a table in condensed mode
	it("should show MultiInput in a table in condensed mode", function() {
		browser.executeScript('document.getElementById("condensed-table").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("condensed-table")))).toLookAs("table-in-condensed-mode");
		});
	});

	// MultiInput with suggestions
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

			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		});
	});

	// MultiInput with sticky header suggestions
	it("Should visualize multiInput with sticky header suggestions", function () {
		var oMultiInput = element(by.id("multiInputWithStickySuggestions-inner"));
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

		// MultiInput with long suggestions and 100% popover width
		it("Should visualize MultiInput with long suggestions and 100% popover width", function () {
			var oMultiInput = element(by.id("mi-long-sugg-small-width"));
			browser.executeScript("document.getElementById('mi-long-sugg-small-width').scrollIntoView()").then(function() {
				oMultiInput.click();
				browser.actions().sendKeys("S").perform();

				expect(takeScreenshot()).toLookAs("suggestions_popover_margins");
			});
		});
});