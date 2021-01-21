/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.Tokenizer', function() {
	"use strict";

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	// Editable tokenizer
	it("should shows editable Tokenzier", function () {
		expect(takeScreenshot(element(by.id("editableTokenizer")))).toLookAs("tokenizer-editable-not-selected");
		element(by.id("tokenToSelect0")).click();
		expect(takeScreenshot(element(by.id("editableTokenizer")))).toLookAs("tokenizer-editable-selected");
	});

	// Not editable tokenizer
	it("should show not editable Tokenzier", function () {
		expect(takeScreenshot(element(by.id("notEditableTokenizer")))).toLookAs("tokenizer-not-editable-not-selected");
		element(by.id("tokenToSelect1")).click();
		expect(takeScreenshot(element(by.id("notEditableTokenizer")))).toLookAs("tokenizer-not-editable-selected");
	});

	// Tokenizer with editable and not editable tokens
	it("should select not editable Tokenzier", function () {
		expect(takeScreenshot(element(by.id("editableAndNotEditable")))).toLookAs("editable-and-not-editable-tokens");
		element(by.id("tokenToSelect2")).click();
		expect(takeScreenshot(element(by.id("editableAndNotEditable")))).toLookAs("editable-and-not-editable-selected");
	});

	// Tokenizer with defined width
	it("should show set width Tokenzier", function () {
		expect(takeScreenshot(element(by.id("setWidth")))).toLookAs("tokenizer-set-width-not-selected");
		element(by.id("tokenToSelect3")).click();
		expect(takeScreenshot(element(by.id("setWidth")))).toLookAs("tokenizer-set-width-selected");
	});

	// Editable tokenizer with one long token
	it("should show editable Tokenzier with single long token", function () {
		element(by.id("longToken")).click();
		expect(takeScreenshot(element(by.id("tokenizerLongToken")))).toLookAs("tokenizer-long-token");
		element(by.id("longToken")).click();
	});

	// Not editable tokenizer with one long token
	it("should show non-editable Tokenzier with single long token", function () {
		element(by.id("longTokenNotEditable")).click();
		expect(takeScreenshot(element(by.id("tokenizerReadOnlyLongToken")))).toLookAs("tokenizer-long-token-read-only");
		element(by.id("longTokenNotEditable")).click();
	});
});