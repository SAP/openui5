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

	// MultiInput - tabular suggestions
	it("should show MultiInput with tabular suggestions", function () {
		element(by.id("tabularSuggestMI-inner")).click();
		browser.actions().sendKeys("t").perform();
		expect(takeScreenshot()).toLookAs("multi-input-with-tabular-suggestions");
		browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
	});

	// MultiInput invalidated
	it("should invalidate the MultiInput, so all MI elements are there", function () {
		browser.executeScript('document.getElementById("dataBoundMultiInput").scrollIntoView()').then(function() {
			browser.executeScript('sap.ui.core.Element.getElementById("dataBoundMultiInput").getTokens()[1].setText("Lorem ipsulum")').then(function() {
				expect(takeScreenshot(element(by.id("dataBoundMultiInput")))).toLookAs("token-update-text");
			});
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

			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	// MultiInput with placeholder and nMore
	it("Should visualize MultiInput placeholder when nMore was previously present", function () {
		var oMultiInput = element(by.id("mi-placeholder"));
		browser.executeScript("arguments[0].scrollIntoView()", oMultiInput).then(function () {
			expect(takeScreenshot()).toLookAs("multiinput_nmore_initial");

			browser.executeScript("sap.ui.core.Element.getElementById('mi-placeholder').setTokens([])");
			expect(takeScreenshot()).toLookAs("multiinput_placeholder");

			oMultiInput.click();
			expect(takeScreenshot()).toLookAs("multiinput_placeholder_focus");

			element(by.id("mi-long-sugg-small-width")).click();
			expect(takeScreenshot()).toLookAs("multiinput_placeholder_blur");
		});
	});

	it("Should visualize MultiInput with long suggestions", function () {
		var oWrappingMultiInput = element(by.id("mi-wrapping"));

		browser.executeScript("document.getElementById('mi-wrapping').scrollIntoView()").then(function () {
			oWrappingMultiInput.click();

			// Should show wrapping suggestions
			browser.actions().sendKeys("I").perform();
			expect(takeScreenshot()).toLookAs("wrapping_suggestions_visible");

			// Should focus the first suggestion
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("wrapping_first_suggestion_focused");

			// Should close the dropdown and clear the value
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		});
	});

	// Suggestions' max-width should be 40rem
	it("should limit the SuggestionsPopover max-width to 40rem", function() {
		var multiInputLongSuggestions = element(by.id("mi-wrapping"));

		multiInputLongSuggestions.click();

		// Should open suggestions
		browser.actions().sendKeys("l").perform();
		expect(takeScreenshot()).toLookAs("mi-wrapping");

		// Should close the dropdown and clear the value
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
	});

	// MultiInput - ENTER on group header
	it("should not close MultiInput dropdown on performing ENTER key on group header", function () {
		var oMultiInput = element(by.id("mIWithSuggestions"));
		browser.executeScript("document.getElementById('mIWithSuggestions').scrollIntoView()").then(function() {
			oMultiInput.click();
			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("mi_dropdown_group");

			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ENTER).perform();
			expect(takeScreenshot()).toLookAs("mi_dropdown_open_group");

			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ENTER).perform();
			expect(takeScreenshot()).toLookAs("mi_dropdown_closed_group");

			// clear token
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		});
	});
});