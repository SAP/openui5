/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.InputVisualTests", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Input';

	// Initial loading
	it("should load test page",function(){
		//click over a button that hides the caret when a control is on focus
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should visualize test page in Compact mode",function(){
		element(by.id("compactMode")).click();
		expect(takeScreenshot()).toLookAs("compact_mode");

		element(by.id("compactMode")).click();
	});

	it("should visualize input with value state Error",function(){
		element(by.id("inputError")).click();
		expect(takeScreenshot()).toLookAs("input_value_state_error");
	});

	it("should visualize input with value state Warning",function(){
		element(by.id("inputWarning")).click();
		expect(takeScreenshot()).toLookAs("input_value_state_warning");
	});

	it("should visualize input with value state Information",function(){
		element(by.id("inputInformation")).click();
		expect(takeScreenshot()).toLookAs("input_value_state_information");
	});

	it("should visualize input with value state Success",function(){
		element(by.id("inputSuccess")).click();
		expect(takeScreenshot()).toLookAs("input_value_state_success");
	});

	it("should visualize Input used in Simple Form", function () {
		var sf1 = element(by.id("sf"));
		browser.executeScript("document.getElementById('sf').scrollIntoView()").then(function() {
			expect(takeScreenshot(sf1)).toLookAs("15_Input_in_SimpleForm");
		});
	});

	it("Should visualize input value after closing the suggestions popover", function () {
		var oInput = element(by.id("inputWithSuggestions"));

		browser.executeScript("document.getElementById('inputWithSuggestions').scrollIntoView()").then(function() {
			oInput.click();

			browser.actions().sendKeys("A").perform();
			//wait until popover opens
			browser.sleep(1000);
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

			expect(takeScreenshot()).toLookAs("input-value-after-arrow-up");

			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		});
	});

	it("Should visualize input with suggestions", function () {
		var oInput = element(by.id("inputWithSuggestions"));
		browser.executeScript("document.getElementById('inputWithSuggestions').scrollIntoView()").then(function() {
			oInput.click();

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

	it("Should be able to properly select an item", function () {
		var oInput = element(by.id("inputWithSuggestions"));
		browser.executeScript("document.getElementById('inputWithSuggestions').scrollIntoView()").then(function() {
			var index;
			oInput.click();

			for (index = 0; index < 10; index++) {
				browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			}
			browser.actions().sendKeys("A").perform();
			element(by.css("#inputWithSuggestions-popup-list li:nth-child(5)")).click();

			expect(takeScreenshot()).toLookAs("proper_item_selection");

			// Cleanup
			oInput.click();
			for (index = 0; index < 10; index++) {
				browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			}
		});
	});

	it("Should visualize input with sticky header suggestions", function () {
		var oInput = element(by.id("inputWithStickySuggestions"));
		browser.executeScript("document.getElementById('inputWithStickySuggestions').scrollIntoView()").then(function() {
			oInput.click();
			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("sticky_suggestions_text_inserted");

			for (var index = 0; index < 25; index++) {
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			}

			expect(takeScreenshot()).toLookAs("sticky_suggestions_visible");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	it("Should visualize input with tabular suggestions with popin mode enabled", function () {
		var oInput = element(by.id("inputWithTabularSuggestions"));
		browser.executeScript("document.getElementById('inputWithTabularSuggestions').scrollIntoView()").then(function() {
			oInput.click();

			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("tabular_suggestions_text_inserted");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	it("Should visualize input with tabular suggestions with popin mode enabled", function () {
		var oInput = element(by.id("inputWithTabularSuggestions2"));
		browser.executeScript("document.getElementById('inputWithTabularSuggestions').scrollIntoView()").then(function() {
			oInput.click();

			browser.actions().sendKeys("h").perform();
			expect(takeScreenshot()).toLookAs("tabular_suggestions_with_text");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	it("Should visualize input with startSuggestions = 2", function () {
		var oInput = element(by.id("inputStartSuggestions"));
		browser.executeScript("document.getElementById('inputStartSuggestions').scrollIntoView()").then(function() {
			oInput.click();

			// Should show suggestions
			browser.actions().sendKeys("Pr").perform();
			expect(takeScreenshot()).toLookAs("suggestions_are_visible");

			// Should hide suggestions
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			expect(takeScreenshot()).toLookAs("suggestions_are_not_visible");

			// Should show the updated suggestions
			browser.actions().sendKeys("C").perform();
			expect(takeScreenshot()).toLookAs("suggestions_updated_visible");
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		});
	});

	it("Should visualize input with suggestion separators", function () {
		var oInput = element(by.id("inputWithTabularSuggestionSeparators"));

		browser.executeScript("document.getElementById('inputWithTabularSuggestionSeparators').scrollIntoView()").then(function () {
			oInput.click();

			// Should show suggestion separators
			browser.actions().sendKeys("H").perform();
			expect(takeScreenshot()).toLookAs("suggestion_separators_are_visible");
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();

			// Disabling tabular suggestion separators
			browser.executeScript('sap.ui.core.Element.getElementById("inputWithTabularSuggestionSeparators")._setSeparateSuggestions(false)');

			// Should not show suggestion separators
			browser.actions().sendKeys("H").perform();
			expect(takeScreenshot()).toLookAs("suggestion_separators_are_not_visible");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	it("Should visualize Input with long suggestions", function () {
		var oInput = element(by.id("inputWrapping"));

		browser.executeScript("document.getElementById('inputWrapping').scrollIntoView()").then(function () {
			oInput.click();

			// Should show wrapping suggestions
			browser.actions().sendKeys("I").perform();
			expect(takeScreenshot()).toLookAs("wrapping_suggestions_visible");

			// Should focus the first suggestion
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("wrapping_first_suggestion_focused");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	it("Should visualize Input with two colums layout", function () {
		var oInput = element(by.id("inputSecondaryValue"));

		browser.executeScript("document.getElementById('inputSecondaryValue').scrollIntoView()").then(function () {
			oInput.click();

			// Should show two columns suggestions
			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("two_columns_filtered");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	it("Should visualize Input with clear button", function () {
		var oInput = element(by.id("inputClearIcon"));

		browser.executeScript("document.getElementById('inputClearIcon').scrollIntoView()").then(function () {
			oInput.click();

			expect(takeScreenshot()).toLookAs("clear_icon_visualized");

			var oInputClearIcon = element(by.css("#inputClearIcon-content > div > span:nth-child(1)"));

			oInputClearIcon.click();

			expect(takeScreenshot()).toLookAs("no_value_clear_icon_hidden");
		});
	});

	// Suggestions' max-width should be 40rem
	it("should limit the SuggestionsPopover max-width to 40rem", function() {
		var inputLongSuggestions = element(by.id("inputLongSugg"));
		browser.executeScript('document.getElementById("inputLongSugg").scrollIntoView()').then(function() {
			inputLongSuggestions.click();

			// Should open the suggestions
			browser.actions().sendKeys("l").perform();
			expect(takeScreenshot()).toLookAs("input-with-long-suggestions");

			// Should close the dropdown
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		});
	});

	// Input - ENTER on group header
	it("should not close Input dropdown on performing ENTER key on group header", function () {
		var inputGrouping = element(by.id("inputWithSuggestions"));
		browser.executeScript("document.getElementById('inputWithSuggestions').scrollIntoView()").then(function() {
			inputGrouping.click();
			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("input_dropdown_group");

			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ENTER).perform();
			expect(takeScreenshot()).toLookAs("input_dropdown_open_group");

			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ENTER).perform();
			expect(takeScreenshot()).toLookAs("input_dropdown_closed_group");
		});
	});

	// Input - showItems() on focusin
	it("should not reinitalize value after CTRL+A & Backspace", function () {
		var inputShowItems = element(by.id("inputWithShowItems"));
		var inputClearIcon = element(by.id("inputClearIcon"));

		browser.executeScript("document.getElementById('inputWithShowItems').scrollIntoView()").then(function() {
			inputShowItems.click();

			browser.actions().sendKeys("A").perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ENTER).perform();

			inputClearIcon.click(); // trigger focusout
			browser.actions().doubleClick(inputShowItems).perform(); // select the value of the input
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();

			expect(takeScreenshot()).toLookAs("input_show_items_value");
		});
	});
});
