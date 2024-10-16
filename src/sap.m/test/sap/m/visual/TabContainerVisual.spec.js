/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe('sap.m.TabContainerVisual', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.TabContainer';

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('should be rendered properly', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 350;
		});
		expect(takeScreenshot()).toLookAs('tabContainer_with_no_additional_scroll');
	});

	it('shold open select dialog', function() {
		element(by.css("#three .sapMTSTouchArea .sapMTSOverflowSelect")).click();
		var oDialog = element(by.css(".sapMDialog"));
		expect(takeScreenshot(oDialog)).toLookAs("select_dialog_open");
	});

});