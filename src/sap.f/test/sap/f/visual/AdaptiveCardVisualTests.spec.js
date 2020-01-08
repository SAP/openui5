/*global describe,it,takeScreenshot,expect, browser*/
describe('sap.f.AdaptiveCardVisualTests', function() {
	'use strict';

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Another Adaptive Card should be visualized', function() {
		browser.executeScript('document.getElementsByClassName("ac-pushButton")[1].click()');

		browser.executeScript('document.getElementById("dueDate").scrollIntoView()').then(function() {
			expect(takeScreenshot()).toLookAs("another_adaptive_card");
		});
	});
});