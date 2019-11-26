/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.MultiComboBox', function() {
	"use strict";

	// Initial loading
	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	//MultiComboBox - Default
	it("should visualize the first MultiComboBox", function () {
		var firstMultiComboBox = element(by.id("MultiComboBox2"));
		expect(takeScreenshot(firstMultiComboBox)).toLookAs("first_multiComboBox");
	});

	//MultiComboBox - default in fullscreen
	it("should visualize the first MultiComboBox - Default in fullscreen", function() {
		var defaultMultiComboBoxArrow = element(by.id("MultiComboBox2-arrow"));
		defaultMultiComboBoxArrow.click();
		expect(takeScreenshot()).toLookAs("default_fullscreen");
		defaultMultiComboBoxArrow.click();
	});

	//MultiComboBox - Filtering
	it("should open first ComboBox - Default", function() {
		var defaultArrow = element(by.id("MultiComboBox0-arrow"));
		defaultArrow.click();
		browser.actions().sendKeys("B").perform();
		expect(takeScreenshot()).toLookAs("multicombobox-filtering");

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
		expect(takeScreenshot(disabledMultiComboBox)).toLookAs("disabled");
	});

	//MultiComboBox - Placeholder
	it("should visualize a MultiComboBox with placeholder and without selected items", function(){
		var multiComboBoxPlaceholder = element(by.id("MultiComboBoxWithoutKey"));
		expect(takeScreenshot(multiComboBoxPlaceholder)).toLookAs("placeholder");
	});

	//MultiComboBox Compact Mode
	it("should select Compact mode", function(){
		element(by.id("compactMode")).click();
		expect(takeScreenshot()).toLookAs("compact_mode");
		element(by.id("compactMode")).click();
	});

	//MultiComboBox - Error state
	it("should visualize a MultiComboBox - Error state", function(){
		var errorStateMultiComboBox = element(by.id("MultiComboBoxError"));
		expect(takeScreenshot(errorStateMultiComboBox)).toLookAs("error_state");
	});

	//MultiComboBox - Warning state
	it("should visualize a MultiComboBox - Warning State", function(){
		browser.executeScript('document.getElementById("MultiComboBoxWarning").scrollIntoView()').then(function() {
			var warningStateMultiComboBox = element(by.id("MultiComboBoxWarning"));
			expect(takeScreenshot(warningStateMultiComboBox)).toLookAs("warning_state");
			expect(takeScreenshot()).toLookAs("long_value_state");
		});
	});

	//MultiComboBox - Success state
	it("should visualize a MultiComboBox - Success state", function(){
		browser.executeScript('document.getElementById("MultiComboBoxSuccess").scrollIntoView()').then(function() {
			var successStateMultiComboBox = element(by.id("MultiComboBoxSuccess"));
			expect(takeScreenshot(successStateMultiComboBox)).toLookAs("success_state");
		});
	});

	//MultiComboBox - Binding
	it("should visualize a MultiComboBox with binding", function(){
		browser.executeScript('document.getElementById("MultiComboBoxBinding").scrollIntoView()').then(function() {
			var successStateMultiComboBox = element(by.id("MultiComboBoxBinding"));
			expect(takeScreenshot(successStateMultiComboBox)).toLookAs("multiComboBox_binding");
		});
	});
});