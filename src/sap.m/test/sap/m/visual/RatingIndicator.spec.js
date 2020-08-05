/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.RatingIndicator", function() {
	"use strict";

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Should show small inactive RatingIndicator', function() {
		expect(takeScreenshot(element(by.id('smallInactiveRI')))).toLookAs('small-inactive-RI');
	});

	it('Should show small active RatingIndicator', function() {
		expect(takeScreenshot(element(by.id('smallActiveRI')))).toLookAs('small-active-RI');
	});

	it('Should show medium inactive RatingIndicator', function() {
		expect(takeScreenshot(element(by.id('mediumInactiveRI')))).toLookAs('medium-inactive-RI');
	});

	it('Should show medium active RatingIndicator', function() {
		expect(takeScreenshot(element(by.id('mediumActiveRI')))).toLookAs('medium-active-RI');
	});

	it('Should show large inactive RatingIndicator', function() {
		browser.executeScript('document.getElementById("largeInactiveRI").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("largeInactiveRI")))).toLookAs("large-inactive-RI");
		});
	});

	it('Should show large active RatingIndicator', function() {
		browser.executeScript('document.getElementById("largeActiveRI").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("largeActiveRI")))).toLookAs("large-active-RI");
		});
	});

	it('Should show default active RatingIndicator', function() {
		expect(takeScreenshot(element(by.id('defaultActiveRI')))).toLookAs('default-active-RI');
	});

	it('Should show Rating Table', function() {
		browser.executeScript('document.getElementById("items").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id('items')))).toLookAs('rating-table');
		});
	});

	it('Should show Rating List', function() {
		browser.executeScript('document.getElementById("ratingList").scrollIntoView()').then(function() {
			element(by.id('ratingList')).click();
			expect(takeScreenshot(element(by.id('ratingList')))).toLookAs('ratingList');
		});
	});

	it('Should show RatingIndicator with automatically updated label', function() {
		browser.executeScript('document.getElementById("automaticRIwithLabel").scrollIntoView()').then(function() {
			element(by.id('automaticRIwithLabel')).click();
			expect(takeScreenshot(element(by.id('automaticRIwithLabel')))).toLookAs('RI-not-changed');
			element(by.id('automaticRI')).click();
			expect(takeScreenshot(element(by.id('automaticRIwithLabel')))).toLookAs('RI-changed');
		});
	});
});