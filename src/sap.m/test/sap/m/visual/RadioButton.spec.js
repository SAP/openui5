/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.RadioButton", function() {
	"use strict";

	it('should load test page',function(){
		expect(takeScreenshot(element(by.id('vboxStates')))).toLookAs('initial');
	});

	// check regular state radiobutton
	it('should show regular state buttons', function() {
		element(by.id('regular-vbox-button-notselected')).click();
		expect(takeScreenshot(element(by.id('regular-vbox')))).toLookAs('regular-state-buttons');
	});

	// check read only state radiobutton
	it('should show read only state buttons', function() {
		element(by.id('readonly-vbox-button-notselected')).click();
		expect(takeScreenshot(element(by.id('readonly-vbox')))).toLookAs('readonly-state-buttons');
	});

	// check error state radiobutton
	it('should show error/invalid state buttons', function() {
		element(by.id('error-vbox-button-notselected')).click();
		expect(takeScreenshot(element(by.id('error-vbox')))).toLookAs('error-state-buttons');
	});

	// check warning state radiobutton
	it('should show warning state buttons', function() {
		element(by.id('warning-vbox-button-notselected')).click();
		expect(takeScreenshot(element(by.id('warning-vbox')))).toLookAs('warning-state-buttons');
	});

	// check disabled state radiobutton
	it('should show disabled state buttons', function() {
		browser.executeScript('document.getElementById("disabled-vbox-button-notselected").scrollIntoView()').then(function() {
			element(by.id('disabled-vbox')).click();
			element(by.id('disabled-vbox-button-notselected')).click();
			expect(takeScreenshot(element(by.id("disabled-vbox")))).toLookAs("disabled-state-buttons");
		});
	});

});
