/*global describe,it,element,by,takeScreenshot,expect,browser, protractor*/

describe("sap.m.ComboBox", function() {
	"use strict";

	// check initial
	it("should load test page",function(){
		//click over a button that hides the caret when a control is on focus
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	// check ComboBox - default
	it("should open first ComboBox - Default", function() {
		var defaultArrow = element(by.id("box_default-arrow"));
		defaultArrow.click();
		element.all(by.css('.sapMComboBoxBasePicker[style*="display: block"] li.sapMLIB')).get(2).click();
		defaultArrow.click();
		expect(takeScreenshot()).toLookAs("default_fullscreen");
		defaultArrow.click();
	});

	// check ComboBox - Filtering
	it("should open ComboBox - Default", function() {
		var defaultArrow = element(by.id("box_default-arrow"));
		defaultArrow.click();
		browser.actions().sendKeys("B").perform();
		expect(takeScreenshot()).toLookAs("combobox-filtering");
		defaultArrow.click();
	});

	// check ComboBox - Two column layout
	it("should open ComboBox - Two column layout", function() {
		var twoColumnArrow = element(by.id("box_two_column-arrow"));
		twoColumnArrow.click();
		expect(takeScreenshot()).toLookAs("two_column_fullscreen");
		browser.actions().sendKeys("A").perform();
		expect(takeScreenshot()).toLookAs("two_column_filtered");
		twoColumnArrow.click();
	});

	// check ComboBox - Placeholder
	it("should open ComboBox - Placeholder", function() {
		var comboBoxPlaceholder = element(by.id("box_placeholder"));
		browser.executeScript('document.getElementById("box_placeholder").scrollIntoView()').then(function() {
			comboBoxPlaceholder.click();
			expect(takeScreenshot(comboBoxPlaceholder)).toLookAs("placeholder");
		});
	});

	// check ComboBox - Label and placeholder
	it("should open ComboBox - Label and placeholder", function() {
		browser.executeScript('document.getElementById("box_label_placeholder").scrollIntoView()').then(function() {
			element(by.id("box_label_placeholder")).click();
			expect(takeScreenshot(element(by.id("layout_label_placeholder")))).toLookAs("label_placeholder");
		});
	});

	// check ComboBox - Disabled
	it("should open ComboBox - Disabled", function() {
		var comboBoxDisabled = element(by.id("box_disabled"));
		browser.executeScript('document.getElementById("box_disabled").scrollIntoView()').then(function() {
			comboBoxDisabled.click();
			expect(takeScreenshot(comboBoxDisabled)).toLookAs("disabled");
		});
	});

	// check ComboBox - Read only
	it("should open ComboBox - Read only", function() {
		var comboBoxReadOnly = element(by.id("box_read_only"));
		browser.executeScript('document.getElementById("box_read_only").scrollIntoView()').then(function() {
			comboBoxReadOnly.click();
			expect(takeScreenshot(comboBoxReadOnly)).toLookAs("read_only");
		});
	});

	// check ComboBox - Warning state
	it("should open ComboBox - Warning state", function() {
		browser.executeScript('document.getElementById("box_warning").scrollIntoView()').then(function() {
			element(by.id("box_warning")).click();
			expect(takeScreenshot(element(by.id("layout_warning")))).toLookAs("warning");
		});
	});

	// check ComboBox - MultiLine Value state
	it("should open ComboBox - Long value state", function() {
		browser.executeScript('document.getElementById("box_longValueState").scrollIntoView()').then(function() {
			element(by.id("box_longValueState")).click();
			expect(takeScreenshot()).toLookAs("multiline-value-state");
		});
	});

	// check ComboBox - Success state
	it("should open ComboBox - Success state", function() {
		var comboBoxSuccess = element(by.id("box_success"));
		browser.executeScript('document.getElementById("box_success").scrollIntoView()').then(function() {
			comboBoxSuccess.click();
			expect(takeScreenshot(comboBoxSuccess)).toLookAs("success");
		});
	});

	// check ComboBox - Error state
	it("should open ComboBox - Error state", function() {
		var comboBoxError = element(by.id("box_error"));
		browser.executeScript('document.getElementById("box_error").scrollIntoView()').then(function() {
			comboBoxError.click();
			expect(takeScreenshot(comboBoxError)).toLookAs("error");
		});
	});

	// check ComboBox - Suggestions wrapping
	it("should open ComboBox - Suggestions wrapping", function() {
		var comboBoxWrapping = element(by.id("comboBoxWrapping"));
		browser.executeScript('document.getElementById("comboBoxWrapping").scrollIntoView()').then(function() {
			comboBoxWrapping.click();

			// Should show wrapping suggestions - first focused
			browser.actions().sendKeys(protractor.Key.F4).perform();
			expect(takeScreenshot()).toLookAs("wrapping_suggestions_visible");

			// Should focus the second suggestion
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("wrapping_second_suggestion_focused");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	// Suggestions' max-width should be 40rem
	it("should limit the SuggestionsPopover max-width to 40rem", function() {
		var comboLongSuggestions = element(by.id("combo-long-sugg"));
		browser.executeScript('document.getElementById("combo-long-sugg").scrollIntoView()').then(function() {
			comboLongSuggestions.click();

			// Should open suggestions
			browser.actions().sendKeys("l").perform();
			expect(takeScreenshot()).toLookAs("combobox-with-long-suggestions");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});
});
