/*global describe,it,element,by,takeScreenshot,expect,browser*/
describe('sap.f.AdaptiveCardVisualTests', function() {
	'use strict';

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Another Adaptive Card should be visualized', function() {
		var showMoreButton = element(by.css(".ac-pushButton.expandable"));
		var captureCard = function() {
			browser.executeScript('document.getElementById("dueDate").scrollIntoView()').then(function() {
				expect(takeScreenshot()).toLookAs("another_adaptive_card");
			});
		};

		browser.executeScript("arguments[0].scrollIntoView()", showMoreButton).then(function() {
			showMoreButton.click();
			captureCard();
		});
	});

	it('Changing themes should work', function() {
		browser.executeScript('sap.ui.getCore().applyTheme("sap_fiori_3_dark")').then(function() {
			expect(takeScreenshot()).toLookAs("cards_with_changed_theme");
		});
	});
});