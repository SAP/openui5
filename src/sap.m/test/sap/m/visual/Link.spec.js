/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Link", function() {
	"use strict";

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify not disabled link has focus outline
	it('should focus on not disabled link', function() {
		expect(takeScreenshot(element(by.id('link_focusable')))).toLookAs('link_focusable_before_click');
		element(by.id('link_focusable')).click();
		expect(takeScreenshot(element(by.id('link_focusable')))).toLookAs('link_focusable_after_click');
	});

	// verify disabled link has no focus outline
	it('should not focus on disabled link', function() {
		expect(takeScreenshot(element(by.id('link_disabled')))).toLookAs('link_disabled_before_click');
		element(by.id('link_disabled')).click();
		expect(takeScreenshot(element(by.id('link_disabled')))).toLookAs('link_disabled_before_click');
	});

	// verify subtle link
	it('should look like subtle link', function() {
		expect(takeScreenshot(element(by.id('link_subtle')))).toLookAs('link_subtle');
	});

	// verify emphasized link
	it('should look like emphasized link', function() {
		expect(takeScreenshot(element(by.id('link_emphasized')))).toLookAs('link_emphasized');
	});

	// verify subtle disabled link
	it('should look like disabled subtle link', function() {
		expect(takeScreenshot(element(by.id('link_disabled_subtle')))).toLookAs('link_disabled_subtle');
	});

	// verify emphasized disabled link
	it('should look like disabled emphasized link', function() {
		expect(takeScreenshot(element(by.id('link_disabled_emphasized')))).toLookAs('link_disabled_emphasized');
	});

});
