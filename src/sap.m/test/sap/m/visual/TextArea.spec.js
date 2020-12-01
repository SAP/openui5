/*global describe,it,element,by,takeScreenshot,expect,browser*/
describe("sap.m.TextArea", function() {
	"use strict";

	// initial loading
	it("should load test page", function () {
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	//TextArea with 50% width
	it("should vizualize a text area with 50% width", function(){
		var fiftyPercentTextArea = element(by.id("textAreaFiftyPercentWidth"));
		fiftyPercentTextArea.click();
		expect(takeScreenshot(fiftyPercentTextArea)).toLookAs("fifty_percent_width");
	});

	//TextArea - Default
	it("should vizualize a simple text area", function(){
		var defaultTextArea = element(by.id("textAreaOverLimit"));
		defaultTextArea.click();
		expect(takeScreenshot(defaultTextArea)).toLookAs("default_textarea");
	});

	//TextArea - Growing
	it("should vizualize a growing text area", function(){
		var growingTextArea = element(by.id("textAreaGrowing"));
		growingTextArea.click();
		expect(takeScreenshot(growingTextArea)).toLookAs("growing_textarea");
	});

	//TextArea - Without growing
	it("should vizualize a text area without growing", function(){
		var notGrowingTextArea = element(by.id("textAreaWithoutGrowing"));
		notGrowingTextArea.click();
		expect(takeScreenshot(notGrowingTextArea)).toLookAs("not_growing_textarea");
	});

	//TextArea with 2 rows, 20 cols - Warning State
	it("should vizualize a text area with 2 rows and 20 cols in warning state", function(){
		var warningResizedTextArea = element(by.id("textAreaWarningState"));
		browser.executeScript('document.getElementById("textAreaWarningState").scrollIntoView()').then(function() {
			warningResizedTextArea.click();
			expect(takeScreenshot()).toLookAs("twoRows_twentyCols_warning_state");
		});
	});

	//TextArea - Error State
	it("should vizualize a text area with error state", function(){
		var errorStateTextArea = element(by.id("textAreaErrorState"));
		browser.executeScript('document.getElementById("textAreaErrorState").scrollIntoView()').then(function() {
			errorStateTextArea.click();
			expect(takeScreenshot()).toLookAs("error_state");
		});
	});

	//TextArea - Success State
	it("should vizualize a text area with success state", function(){
		var successStateTextArea = element(by.id("textAreaSuccessState"));
		browser.executeScript('document.getElementById("textAreaSuccessState").scrollIntoView()').then(function() {
			successStateTextArea.click();
			expect(takeScreenshot(successStateTextArea)).toLookAs("success_state");
		});
	});

	//TextArea - Information State
	it("should vizualize a text area with information state", function(){
		var informationStateTextArea = element(by.id("textAreaInformationState"));
		browser.executeScript('document.getElementById("textAreaInformationState").scrollIntoView()').then(function() {
			informationStateTextArea.click();
			expect(takeScreenshot()).toLookAs("information_state");
		});
	});

	//TextArea - Not Editable
	it("should vizualize a not editable text area", function(){
		var notEditableTextArea = element(by.id("textAreaReadOnly"));
		browser.executeScript('document.getElementById("textAreaReadOnly").scrollIntoView()').then(function() {
			notEditableTextArea.click();
			expect(takeScreenshot(notEditableTextArea)).toLookAs("not_editable_textarea");
		});
	});

	//Textarea - Disabled
	it("should vizualize a disabled text area", function(){
		var disabledTextArea = element(by.id("textAreaDisabled"));
		browser.executeScript('document.getElementById("textAreaDisabled").scrollIntoView()').then(function() {
			disabledTextArea.click();
			expect(takeScreenshot(disabledTextArea)).toLookAs("disabled_state");
		});
	});

	//TextArea - Wrapping Off
	it("should vizualize a text area without wrapping ", function(){
		var offWrappingTextArea = element(by.id("textAreaWithoutWrapping"));
		browser.executeScript('document.getElementById("textAreaWithoutWrapping").scrollIntoView()').then(function() {
			offWrappingTextArea.click();
			expect(takeScreenshot(offWrappingTextArea)).toLookAs("wrapping_off");
		});
	});

	//TextArea - Set height and showExceededText=true
	it("TextArea and Label total height should be the set height", function(){
		browser.executeScript('document.getElementById("showExceededTextWithHeight").scrollIntoView()').then(function() {
			var textAreaWithHeight = element(by.id("showExceededTextWithHeight"));
			textAreaWithHeight.click();
			expect(takeScreenshot(textAreaWithHeight)).toLookAs("showExceededText_with_height");
		});
	});
});