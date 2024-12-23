/*global describe,it,element,by,takeScreenshot,expect,browser*/
describe('sap.f.AdaptiveCardVisualTests', function() {
	'use strict';

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Error handling - empty required field', function() {
		var submitButton = element(by.css(".ac-pushButton"));
		var captureCard = function() {
			browser.executeScript('document.getElementById("SimpleVal").scrollIntoView()').then(function() {
				expect(takeScreenshot()).toLookAs("error-card");
			});
		};

		browser.executeScript("document.querySelector('.ac-pushButton').scrollIntoView()").then(function() {
			submitButton.click();
			captureCard();
		});
	});

	it('Error handling - valid input field', function() {
		var oInput = element(by.css("#SimpleVal"));

		browser.executeScript('document.getElementById("SimpleVal").scrollIntoView()').then(function() {
			oInput.click();
			browser.actions().sendKeys("A").perform();
			expect(takeScreenshot()).toLookAs("valid-card");
		});
	});

	it('Another Adaptive Card should be visualized', function() {
		var showMoreButton = element(by.css(".ac-pushButton.expandable"));
		var captureCard = function() {
			browser.executeScript('document.getElementById("dueDate").scrollIntoView()').then(function() {
				expect(takeScreenshot()).toLookAs("another_adaptive_card");
			});
		};

		browser.executeScript("document.querySelector('.ac-pushButton.expandable').scrollIntoView()").then(function() {
			showMoreButton.click();
			captureCard();
		});
	});

	it('Changing themes should work', function() {
		browser.executeScript('sap.ui.getCore().applyTheme("sap_horizon_dark")').then(function() {
			expect(takeScreenshot()).toLookAs("cards_with_changed_theme");
		});
	});
});