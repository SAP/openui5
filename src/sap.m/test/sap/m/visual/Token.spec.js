/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.Token', function() {
	"use strict";

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	//Token not selected, editable
	it('should show editable, not selected token', function () {
		expect(takeScreenshot( element(by.id('tokenNotSelected1')))).toLookAs('token-not-selected-editable');
	});

	//Token not selected, not editable
	it('should show token not editable', function () {
		expect(takeScreenshot( element(by.id('tokenNotSelected3')))).toLookAs('token-not-selected-not-editable');
	});

	//Token selected, editable
	it('should show editable, selected token', function () {
		expect(takeScreenshot( element(by.id('tokenSelected4')))).toLookAs('token-selected-editable');
	});

	//Token selected, not editable
	it('should show not editable, selected token', function () {
		expect(takeScreenshot( element(by.id('tokenSelected6')))).toLookAs('token-selected-not-editable');
	});

	//Token with textDirection: sap.ui.core.TextDirection.RTL
	it('should show editable, selected token in RTL mode', function () {
		expect(takeScreenshot( element(by.id("tokenRTL")))).toLookAs('token-in-rtl-mode');
	});
});