/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.PullToRefresh", function() {
	"use strict";

	// load standard pull to refresh page
	it('should load test page of standard pull to refresh',function(){
		element(by.id('standard_pull_page')).click();
		expect(takeScreenshot()).toLookAs('initial_standard_page');
	});

	// verify loading indicator is displayed after activated
	it('should activate the standard pull to refresh', function() {
		expect(takeScreenshot(element(by.id('standard_pull_control')))).toLookAs('pull_to_refresh_standard_before_click');
		element(by.id('standard_pull_control')).click();
		expect(takeScreenshot(element(by.id('standard_pull_control')))).toLookAs('pull_to_refresh_standard_after_click');
	});

	// load hide immediately pull to refresh page
	it('should load test page of hide immediately pull to refresh', function() {
		element(by.id('standardP2R-navButton')).click();
		element(by.id('hide_pull_page')).click();
		expect(takeScreenshot()).toLookAs('initial_hide_page');
	});

	// verify pull to refresh description is hidden after activated
	it('should activate the hide immediately pull to refresh', function() {
		expect(takeScreenshot(element(by.id('hide_pull_control')))).toLookAs('pull_to_refresh_hide_before_click');
		element(by.id('hide_pull_control')).click();
		expect(takeScreenshot(element(by.id('hide_pull_control')))).toLookAs('pull_to_refresh_hide_after_click');
	});

	// load busy dialog pull to refresh page
	it('should load test page of busy dialog pull to refresh', function() {
		element(by.id('simplePage-navButton')).click();
		element(by.id('busy_dialog_pull_page')).click();
		expect(takeScreenshot()).toLookAs('initial_busy_dialog_page');
	});

	// verify pull to refresh opens busy dialog after activated
	it('should activate the busy dialog pull to refresh', function() {
		expect(takeScreenshot()).toLookAs('pull_to_refresh_busy_dialog_before_click');
		element(by.id('busy_dialog_pull_control')).click();
		expect(takeScreenshot()).toLookAs('pull_to_refresh_busy_dialog_after_click');
	});

});
