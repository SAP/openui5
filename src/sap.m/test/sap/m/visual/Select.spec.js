/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Select", function() {
	"use strict";

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify regular select
	it('should click on regular select', function() {
		expect(takeScreenshot(element(by.id('select_regular')))).toLookAs('select_regular_before_click');
		element(by.id('select_regular')).click();
		expect(takeScreenshot(element(by.id('select_regular')))).toLookAs('select_regular_after_click');
		element(by.id('select_page')).click();
	});

	// verify disabled select
	it('should click on disabled select', function() {
		expect(takeScreenshot(element(by.id('select_disabled')))).toLookAs('select_disabled_before_click');
		element(by.id('select_disabled')).click();
		expect(takeScreenshot(element(by.id('select_disabled')))).toLookAs('select_disabled_before_click');
		element(by.id('select_page')).click();
	});

	// verify icon-only select
	it('should click on icon-only select', function() {
		expect(takeScreenshot(element(by.id('select_icon')))).toLookAs('select_icon_before_click');
		element(by.id('select_icon')).click();
		expect(takeScreenshot(element(by.id('select_icon')))).toLookAs('select_icon_after_click');
		element(by.id('select_page')).click();
	});

	// verify select in footer
	it('should click on select in footer', function() {
		expect(takeScreenshot(element(by.id('select_footer')))).toLookAs('select_footer_before_click');
		element(by.id('select_footer')).click();
		expect(takeScreenshot(element(by.id('select_footer')))).toLookAs('select_footers_after_click');
		element(by.id('select_page')).click();
	});

});
