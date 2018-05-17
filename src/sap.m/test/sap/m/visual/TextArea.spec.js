/*global describe,it,element,by,takeScreenshot,expect,browser*/
describe("sap.m.TextArea", function() {
	"use strict";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	//TextArea with 50% width
	it("should vizualize a text area with 50% width", function(){
		var fiftyPercentTextArea = element(by.id("__area1"));
		expect(takeScreenshot(fiftyPercentTextArea)).toLookAs("fifty_percent_width");
	});

	//TextArea - Default
	it("should vizualize a simple text area", function(){
		var defaultTextArea = element(by.id("__area2"));
		expect(takeScreenshot(defaultTextArea)).toLookAs("default_textarea");
	});

	//TextArea - Disabled growing
	it("should vizualize a text area without growing", function(){
		var notGrowingTextArea = element(by.id("__area4"));
		expect(takeScreenshot(notGrowingTextArea)).toLookAs("not_growing_textarea");
	});

	//TextArea with 2 rows, 20 cols - Warning State
	it("should vizualize a text area with 2 rows and 20 cols in warning state", function(){
		var warningResizedTextArea = element(by.id("__area7"));
		browser.executeScript('document.getElementById("__area7").scrollIntoView()').then(function() {
			expect(takeScreenshot(warningResizedTextArea)).toLookAs("twoRows_twentyCols_warning_state");
		});
	});

	//Textarea with 90% width
	it("should vizualize a text area with 90% width", function(){
		var nintyPercentWidthTextArea = element(by.id("__area8"));
		browser.executeScript('document.getElementById("__area8").scrollIntoView()').then(function() {
			expect(takeScreenshot(nintyPercentWidthTextArea)).toLookAs("ninty_percent_width");
		});
	});

	//Textarea - Disabled
	it("should vizualize a disabled text area", function(){
		var disabledTextArea = element(by.id("__area9"));
		browser.executeScript('document.getElementById("__area9").scrollIntoView()').then(function() {
			disabledTextArea.click();
			expect(takeScreenshot(disabledTextArea)).toLookAs("disabled_state");
		});
	});

	//TextArea - Warning State
	it("should vizualize a text area with warning state", function(){
		var warningStateTextArea = element(by.id("__area10"));
		browser.executeScript('document.getElementById("__area10").scrollIntoView()').then(function() {
			expect(takeScreenshot(warningStateTextArea)).toLookAs("warning_state");
		});
	});

	//TextArea - Error State
	it("should vizualize a text area with error state", function(){
		var errorStateTextArea = element(by.id("__area11"));
		browser.executeScript('document.getElementById("__area11").scrollIntoView()').then(function() {
			expect(takeScreenshot(errorStateTextArea)).toLookAs("error_state");
		});
	});

	//TextArea - Wrapping Off
	it("should vizualize a text area without wrapping ", function(){
		var offWrappingTextArea = element(by.id("__area12"));
		browser.executeScript('document.getElementById("__area12").scrollIntoView()').then(function() {
			expect(takeScreenshot(offWrappingTextArea)).toLookAs("wrapping_off");
		});
	});

	//TextArea - Not Editable
	it("should vizualize a not editable text area ", function(){
		var notEditableTextArea = element(by.id("__area13"));
		browser.executeScript('document.getElementById("__area13").scrollIntoView()').then(function() {
			notEditableTextArea.click();
			expect(takeScreenshot(notEditableTextArea)).toLookAs("not_editable_textarea");
		});
	});

	//TextArea with placeholder
	it("should vizualize a text area with placeholder", function(){
		var textAreaWithPlaceholder = element(by.id("__area14"));
		browser.executeScript('document.getElementById("__area14").scrollIntoView()').then(function() {
			expect(takeScreenshot(textAreaWithPlaceholder)).toLookAs("textarea_with_placeholder");
		});
	});

	//TextArea - Growing
	it("should vizualize a growing text area", function(){
		var growingTextArea = element(by.id("__area15"));
		browser.executeScript('document.getElementById("__area15").scrollIntoView()').then(function() {
			expect(takeScreenshot(growingTextArea)).toLookAs("growing_textarea");
		});
	});
});