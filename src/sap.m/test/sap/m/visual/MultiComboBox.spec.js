/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe('sap.m.MultiComboBox', function() {
	"use strict";

	// Initial loading
	it("should load test page",function(){
		//click over a button that hides the caret when a control is on focus
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	//MultiComboBox - After backspace
	it("should visualize MultiComboBox after deleting text with backspace", function(){
		var defaultMultiComboBox = element(by.id("MultiComboBox2")),
			defaultMultiComboBoxArrow = element(by.id("MultiComboBox2-arrow"));
		defaultMultiComboBox.click();
		browser.actions().sendKeys("B").perform();
		browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		expect(takeScreenshot()).toLookAs("multicombobox-after-backspace");
		defaultMultiComboBoxArrow.click();
	});

	//MultiComboBox - After arrow navigation
	it("should visualize MultiComboBox after navigating between tokens with arrow key.", function(){
		var defaultMultiComboBox = element(by.id("MultiComboBox1-inner"));

		defaultMultiComboBox.click();
		browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		expect(takeScreenshot()).toLookAs("multicombobox-left-arrow-navigation");
	});

	//MultiComboBox - Filtering
	it("should open first MultiComboBox - Default", function() {
		var defaultMultiComboBox = element(by.id("MultiComboBox0")),
			defaultMultiComboBoxArrow = element(by.id("MultiComboBox0-arrow"));
		defaultMultiComboBox.click();
		browser.actions().sendKeys("B").perform();
		expect(takeScreenshot()).toLookAs("multicombobox-filtering");
		defaultMultiComboBoxArrow.click();
	});
	//MultiComboBox - Binding
	it("should visualize a MultiComboBox with binding", function(){
		browser.executeScript('document.getElementById("MultiComboBoxBinding").scrollIntoView()').then(function() {
			var bindingMultiComboBox = element(by.id("MultiComboBoxBinding")),
				bindingMultiComboBoxArrow = element(by.id("MultiComboBoxBinding-arrow"));
			bindingMultiComboBoxArrow.click();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			bindingMultiComboBoxArrow.click();
			expect(takeScreenshot(bindingMultiComboBox)).toLookAs("multiComboBox_binding_initially_selected");
		});

		browser.executeScript('document.getElementById("page1-navButton").scrollIntoView()').then(function() {
			element(by.id("page1-navButton")).click();
			element(by.id("page2-navButton")).click();
		});

		browser.executeScript('document.getElementById("MultiComboBoxBinding").scrollIntoView()').then(function() {
			var bindingMultiComboBox = element(by.id("MultiComboBoxBinding"));
			bindingMultiComboBox.click();
			expect(takeScreenshot(bindingMultiComboBox)).toLookAs("multiComboBox_binding_after_navigation");
		});
	});

	//MultiComboBox - Last selected item
	it("should visualize a MultiComboBox and select the last item to check if the popover have unnecessary scroll", function(){
		browser.executeScript('document.getElementById("MultiComboBoxFourItems").scrollIntoView()').then(function() {
			element(by.id("MultiComboBoxFourItems-arrow")).click();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			expect(takeScreenshot()).toLookAs("multiComboBox_with_selected_last_item");
		});
	});

	//MultiComboBox - SelectAll
	it("should visualize a MultiComboBox with select all functionality", function(){
		browser.executeScript('document.getElementById("MultiComboBoxSelectAll").scrollIntoView()').then(function() {
			element(by.id("MultiComboBoxSelectAll-arrow")).click();
			expect(takeScreenshot()).toLookAs("multiComboBox_with_selectAll_initial");
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			expect(takeScreenshot()).toLookAs("multiComboBox_with_selectAll_selected");
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			expect(takeScreenshot()).toLookAs("multiComboBox_with_selectAll_deselected");
		});
	});

	// MultiComboBox - dropwdown selection
	it("should visualize a MultiComboBox dropdown with correct selection", function() {
		browser.executeScript('document.getElementById("MultiComboBoxBinding").scrollIntoView()').then(function() {
			var oMultiComboBox = element(by.id("MultiComboBoxBinding"));
			var oMultiComboBoxArrow = element(by.id("MultiComboBoxBinding-arrow"));
			oMultiComboBox.click();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			// simulate dropdown icon click
			oMultiComboBoxArrow.click();
			expect(takeScreenshot()).toLookAs("multiComboBox_dropdown_selection");
		});
	});

	// MultiComboBox - dropwdown selection
	it("should visualize a MultiComboBox dropdown with correct focus (arrow keys)", function() {
		browser.executeScript('document.getElementById("MultiComboBoxWithGrouping").scrollIntoView()').then(function() {
			var oMultiComboBoxArrow = element(by.id("MultiComboBoxWithGrouping-arrow"));
			oMultiComboBoxArrow.click();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_arrowdown_focus_vsh");
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_arrowdown_focus_group");
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_arrowdown_focus_item");
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_arrowup_focus_group");
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_arrowup_focus_vsh");
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_arrowup_focus_input");
			oMultiComboBoxArrow.click();
		});
	});

	// MultiComboBox - dropwdown selection
	it("should visualize a MultiComboBox dropdown with correct focus (HOME, END)", function() {
		browser.executeScript('document.getElementById("MultiComboBoxWithGrouping").scrollIntoView()').then(function() {
			var oMultiComboBoxArrow = element(by.id("MultiComboBoxWithGrouping-arrow"));
			oMultiComboBoxArrow.click();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.END).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_end_focus_lastitem");
			browser.actions().sendKeys(protractor.Key.HOME).perform();
			expect(takeScreenshot()).toLookAs("mcb_dropdown_home_focus_firstitem");
			oMultiComboBoxArrow.click();
		});
	});

	// MultiComboBox - Suggestions wrapping
	it("Should visualize MultiComboBox with long suggestions", function() {
		browser.executeScript('document.getElementById("multiComboBoxWrapping").scrollIntoView()').then(function() {
			var oMultiComboBoxArrow = element(by.id("multiComboBoxWrapping-arrow"));

			// Should show wrapping suggestions
			oMultiComboBoxArrow.click();
			expect(takeScreenshot()).toLookAs("wrapping_suggestions_visible");

			// Should focus the first suggestion
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			expect(takeScreenshot()).toLookAs("wrapping_first_suggestion_focused");

			oMultiComboBoxArrow.click();
		});
	});

	// Suggestions' max-width should be 40rem
	it("should limit the nMore popover max-width to 40rem", function() {
		var mMultiComboLongSuggestions = element(by.id("multiComboBoxWrapping"));
		var oMultiComboBoxArrow = element(by.id("multiComboBoxWrapping-arrow"));

		mMultiComboLongSuggestions.click();

		// Should open suggestions
		browser.actions().sendKeys("l").perform();
		expect(takeScreenshot()).toLookAs("multi-combobox-with-long-suggestions");

		// Should close suggestions
		oMultiComboBoxArrow.click();
	});

	//MultiComboBox Compact Mode
	it("should select Compact mode", function(){
		element(by.id("compactMode")).click();
		expect(takeScreenshot()).toLookAs("compact_mode");
	});

	//MultiComboBox - Order of Tokens
	it("Should visualize the tokens in the same order when picker is reopened", function(){
		browser.executeScript('document.getElementById("multiComboBoxStrangeKeys").scrollIntoView()').then(function() {
			var oMCArrow = element(by.id("multiComboBoxStrangeKeys-arrow"));
			oMCArrow.click();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
			browser.actions().sendKeys(protractor.Key.SPACE).perform();
			expect(takeScreenshot()).toLookAs("multiComboBox_tokens_order_initial");
			oMCArrow.click();
			expect(takeScreenshot()).toLookAs("multiComboBox_tokens_order_after_closed");
			oMCArrow.click();
			expect(takeScreenshot()).toLookAs("multiComboBox_tokens_order_after_reopen");
		});
	});
});
