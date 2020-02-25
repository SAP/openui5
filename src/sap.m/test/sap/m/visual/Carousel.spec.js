/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.Carousel", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Carousel';

	// Waiting for CSS transitions to complete is time consuming and not working when tests are run in background tab
	function forceTransitionComplete () {
		browser.executeScript(function() {
			var oCarousel = sap.ui.getCore().byId("myCarousel");
			oCarousel._oMobifyCarousel.onTransitionComplete();
		});
	}

	var myCarousel = element(by.id("myCarousel"));
	var bPhone = null;

	var _moveToCarousel = function () {
		if (bPhone) {
			browser.actions().touchmove(element(by.id('myCarousel'))).perform();
		} else {
			browser.actions().mouseMove(element(by.id('myCarousel'))).perform();
		}
	};

	// initial loading"
	it("should load test page", function () {
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// change height to 50%
	it("should change the height to 50%", function () {
		element(by.id("btnHeight50")).click();
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("2_height_50_percent");
	});

	// change height to 600px
	it("should change the height to 600px", function () {
		element(by.id("btnHeight600px")).click();
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("3_height_600px");

		element(by.id("btnReset")).click();
		forceTransitionComplete();
	});

	// change width to 60%
	it("should change the width to 60%", function () {
		element(by.id("btnWidth60")).click();
		//hover on the carousel to show the arrows
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("4_width_60_percent");
	});

	// change width to 400px
	it("should change the width to 400px", function () {
		element(by.id("btnWidth400px")).click();
		//hover on the carousel to show the arrows
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("5_width_400px");

		element(by.id("btnReset")).click();
		forceTransitionComplete();
	});

	// change arrows position
	it("should change arrows placement", function() {
		element(by.id("RB-Indicator")).click();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("6_arrow_placement");
	});

	// change page indicator position
	it("should change page indicator placement", function() {
		element(by.id("RB-Top")).click();
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("7_page_indicator_visibility");
	});

	// toggle page indicator visibility
	it("should change page indicator placement", function() {
		element(by.id("RB-No")).click();
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("8_page_indicator_placement");
	});

	// change the number of slides
	it("should change number of slides and see the change in the page indicator", function() {
		//click to show the page indicator
		element(by.id("RB-Yes")).click();
		element(by.id('input-slides-number-inner')).clear().sendKeys('9');
		_moveToCarousel();
		forceTransitionComplete();

		expect(takeScreenshot(myCarousel)).toLookAs("9_page_indicator_type");
	});
});
