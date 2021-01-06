/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe('sap.m.MultiComboBox', function() {
	"use strict";

	// Initial loading
	it("should load test page",function(){
		//click over a button that hides the caret when a control is on focus
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	//MultiComboBox - Default
	it("should visualize the first MultiComboBox", function () {
		var firstMultiComboBox = element(by.id("MultiComboBox2"));
		firstMultiComboBox.click();
		expect(takeScreenshot(firstMultiComboBox)).toLookAs("first_multiComboBox");
	});

	//MultiComboBox - default in fullscreen
	it("should visualize the first MultiComboBox - Default in fullscreen", function() {
		var defaultMultiComboBoxArrow = element(by.id("MultiComboBox2-arrow"));
		defaultMultiComboBoxArrow.click();
		expect(takeScreenshot()).toLookAs("default_fullscreen");
		defaultMultiComboBoxArrow.click();
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

	//MultiComboBox - 50% width
	it("should visualize  a MultiComboBox with 50% width", function(){
		var definedWidthMultiComboBox = element(by.id("MultiComboBox0"));
		definedWidthMultiComboBox.click();
		expect(takeScreenshot(definedWidthMultiComboBox)).toLookAs("fifty_percent_width");
	});

	//MultiComboBox with cropped tokens
	it("should visualize a MultiComboBox with cropped tokens", function(){
		var croppedTokensMultiComboBox = element(by.id("MultiComboBox1-inner"));
		croppedTokensMultiComboBox.click();
		expect(takeScreenshot( element(by.id("MultiComboBox1")))).toLookAs("cropped_tokens");
	});

	//MultiComboBox with selectable disabled list item
	it("should visualize a MultiComboBox with selectable option that was disabled", function(){
		var selectableItemMultiComboBoxArrow = element(by.id("MultiComboBoxDisabledListItemSelectable-arrow"));
		selectableItemMultiComboBoxArrow.click();
		expect(takeScreenshot()).toLookAs("selectable_disabled_item");
		selectableItemMultiComboBoxArrow.click();
	});

	//MultiComboBox - Read only
	it("should visualize a MultiComboBox - Read only", function(){
		browser.executeScript('sap.ui.getCore().byId("MultiComboBoxReadOnly")._oTokenizer.getTokens()[4].setSelected(true);')
		.then(function() {
			var readOnlyMultiComboBox = element(by.id("MultiComboBoxReadOnly"));
			expect(takeScreenshot(readOnlyMultiComboBox)).toLookAs("read_only");
		});
		browser.executeScript('sap.ui.getCore().byId("MultiComboBoxReadOnly")._oTokenizer.getTokens()[4].setSelected(false);');
	});

	//MultiComboBox - Disabled
	it("should visualize a MultiComboBox - Disabled", function(){
		var disabledMultiComboBox = element(by.id("MultiComboBoxDisabled"));
		//click in order to ensure that there is no visual focus presented
		disabledMultiComboBox.click();
		expect(takeScreenshot(disabledMultiComboBox)).toLookAs("disabled");
	});

	//MultiComboBox - Placeholder
	it("should visualize a MultiComboBox with placeholder and without selected items", function(){
		var multiComboBoxPlaceholder = element(by.id("MultiComboBoxWithoutKey"));
		multiComboBoxPlaceholder.click();
		expect(takeScreenshot(multiComboBoxPlaceholder)).toLookAs("placeholder");
	});

	//MultiComboBox - Error state
	it("should visualize a MultiComboBox - Error state", function(){
		var errorStateMultiComboBox = element(by.id("MultiComboBoxError"));
		errorStateMultiComboBox.click();
		//capture the whole page, in order to see the value state text
		expect(takeScreenshot()).toLookAs("error_state");
	});

	//MultiComboBox - Error value state messaage with link
	it("should visualize a MultiComboBox - Error state", function(){
		var errorStateMultiComboBox = element(by.id("MultiComboBoxErrorWithLink"));
		errorStateMultiComboBox.click();
		//capture the whole page, in order to see the value state text
		expect(takeScreenshot()).toLookAs("error_state_with_link");
	});

	//MultiComboBox - Warning state
	it("should visualize a MultiComboBox - Warning State", function(){
		browser.executeScript('document.getElementById("MultiComboBoxWarning").scrollIntoView()').then(function() {
			var warningStateMultiComboBox = element(by.id("MultiComboBoxWarning"));
			warningStateMultiComboBox.click();
			//capture the whole page, in order to see the value state text
			expect(takeScreenshot()).toLookAs("warning_state_with_long_value_state");
		});
	});

	//MultiComboBox - Warning value state messaage with link
	it("should visualize a MultiComboBox - Warning State", function(){
		browser.executeScript('document.getElementById("MultiComboBoxWarning").scrollIntoView()').then(function() {
			var warningStateMultiComboBox = element(by.id("MultiComboBoxWarningWithLinks"));
			warningStateMultiComboBox.click();
			//capture the whole page, in order to see the value state text
			expect(takeScreenshot()).toLookAs("warning_state_with_link");
		});
	});

	//MultiComboBox - Success state
	it("should visualize a MultiComboBox - Success state", function(){
		browser.executeScript('document.getElementById("MultiComboBoxSuccess").scrollIntoView()').then(function() {
			var successStateMultiComboBox = element(by.id("MultiComboBoxSuccess"));
			successStateMultiComboBox.click();
			expect(takeScreenshot(successStateMultiComboBox)).toLookAs("success_state");
		});
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

	//MultiComboBox Compact Mode
	it("should select Compact mode", function(){
		element(by.id("compactMode")).click();
		expect(takeScreenshot()).toLookAs("compact_mode");
		element(by.id("compactMode")).click();
	});
});
