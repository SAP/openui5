/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.MultiComboBoxBasic', function() {
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

	//MultiComboBox with cropped tokens
	it("should visualize a MultiComboBox with cropped tokens", function(){
		var croppedTokensMultiComboBox = element(by.id("MultiComboBox1-inner"));
		croppedTokensMultiComboBox.click();
		expect(takeScreenshot( element(by.id("MultiComboBox1")))).toLookAs("cropped_tokens");
	});

	//MultiComboBox with disabled list item
	it("should visualize a MultiComboBox with disabled suggestion", function(){
		var selectableItemMultiComboBoxArrow = element(by.id("MultiComboBoxDisabledListItemDisabled-arrow"));
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

    //MultiComboBox - One long token
	it("should visualize a MultiComboBox - Long token", function(){
		browser.executeScript('document.getElementById("MultiComboBoxOneToken").scrollIntoView()').then(function() {
			var longTokenMultiComboBox = element(by.id("MultiComboBoxOneToken"));
            expect(takeScreenshot(longTokenMultiComboBox)).toLookAs("MCB_with_one_long_token");
			longTokenMultiComboBox.click();
			expect(takeScreenshot(longTokenMultiComboBox)).toLookAs("MCB_with_one_long_token_focused");
		});
	});

	//MultiComboBox Compact Mode
	it("should select Compact mode", function(){
		element(by.id("compactMode")).click();
		expect(takeScreenshot()).toLookAs("compact_mode");
	});

	it("should visualize opened picker in compact mode", function(){
		var defaultMultiComboBoxArrow = element(by.id("MultiComboBox2-arrow"));
		defaultMultiComboBoxArrow.click();
		expect(takeScreenshot()).toLookAs("opened_picker_compact");
		defaultMultiComboBoxArrow.click();
		element(by.id("compactMode")).click();
	});
});
