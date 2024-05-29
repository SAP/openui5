/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.Carousel", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Carousel';

	var myCarousel = element(by.id("myCarousel"));
	var bPhone = null;

	var _moveToCarousel = function () {
		if (bPhone) {
			browser.actions().touchmove(element(by.id('myCarousel'))).perform();
		} else {
			browser.actions().mouseMove(element(by.id('myCarousel'))).perform();
		}

		browser.executeScript("document.getElementById('myCarousel').scrollIntoView()");
	};

	// initial loading"
	it("should load test page", function () {
		browser.executeScript(function() {
			var Device = sap.ui.require("sap/ui/Device");
			return Device.system.phone;
		})
		.then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// change height to 50%
	it("should change the height to 50%", function () {
		element(by.id("btnHeight50")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("2_height_50_percent");
	});

	// change height to 600px
	it("should change the height to 600px", function () {
		element(by.id("btnHeight600px")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("3_height_600px");

		element(by.id("btnReset")).click();
	});

	// change width to 60%
	it("should change the width to 60%", function () {
		element(by.id("btnWidth60")).click();
		//hover on the carousel to show the arrows
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("4_width_60_percent");
	});

	// change width to 400px
	it("should change the width to 400px", function () {
		element(by.id("btnWidth400px")).click();
		//hover on the carousel to show the arrows
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("5_width_400px");

		element(by.id("btnReset")).click();
	});

	it("should check arrows visibility over content", function() {
		_moveToCarousel();
		// go to last page
		element(by.id("myCarousel-arrow-next")).click();
		element(by.id("myCarousel-arrow-next")).click();
		// set loop to false
		element(by.id("RB-No-Loop")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("5_1_arrow_visibility_content");

		// go back to third page
		element(by.id("myCarousel-arrow-previous")).click();
		element(by.id("myCarousel-arrow-previous")).click();
	});

	// change arrows position
	it("should change arrows placement", function() {
		element(by.id("RB-Indicator")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("6_arrow_placement");
	});

	it("should check arrows visibility in the page indicator area", function() {
		// go to last page
		element(by.id("myCarousel-arrow-next")).click();
		element(by.id("myCarousel-arrow-next")).click();

		expect(takeScreenshot(myCarousel)).toLookAs("6_1_arrow_visibility_page_ind");

		// go back to third page
		element(by.id("myCarousel-arrow-previous")).click();
		element(by.id("myCarousel-arrow-previous")).click();
	});

	// change page indicator position
	it("should change page indicator placement", function() {
		element(by.id("RB-Top")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("7_page_indicator_visibility");
	});

	// change page indicator position
	it("should change page indicator placement to OverContentTop", function() {
		element(by.id("RB-Over-Top")).click();
		_moveToCarousel();

		// go back to third page
		element(by.id("myCarousel-arrow-previous")).click();
		element(by.id("myCarousel-arrow-previous")).click();

		expect(takeScreenshot(myCarousel)).toLookAs("7_2_page_indicator_over_top");

		// move the arrows to the content
		element(by.id("RB-Content")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("7_3_page_indicator_over_top_no_arrow");

		// move the arrows back to the page indicator area
		element(by.id("RB-Indicator")).click();
	});

	it("should change page indicator placement to OverContentBottom", function() {
		element(by.id("RB-Over-Bottom")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("7_4_page_indicator_over_bottom");

		// move the arrows to the content
		element(by.id("RB-Content")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("7_5_page_indicator_over_bottom_no_arrow");

		// move the arrows back to the page indicator area
		element(by.id("RB-Indicator")).click();
		// move the page indicator on top of the carousel's content
		element(by.id("RB-Top")).click();
		// go back to third page
		element(by.id("myCarousel-arrow-next")).click();
		element(by.id("myCarousel-arrow-next")).click();
	});

	it("should show focus border all around the carousel", function() {
		myCarousel.click();
		element(by.control({
			id: "myCarousel",
			interaction: "focus"
		}));
		expect(takeScreenshot(myCarousel)).toLookAs("7_1_focus");
	});

	// toggle page indicator visibility
	it("should change page indicator placement", function() {
		element(by.id("RB-No")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("8_page_indicator_placement");
	});

	// change the number of slides
	it("should change number of slides and see the change in the page indicator", function() {
		//click to show the page indicator
		element(by.id("RB-Yes")).click();
		element(by.id('input-slides-number-inner')).clear().sendKeys('9');
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("9_page_indicator_type");
	});

	// change carousel background design - solid
	it("should change carousel's background design to solid", function() {
		element(by.id("RB-Solid")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("10_background_solid");
	});

	// change carousel background design - transparent
	it("should change carousel's background design to transparent", function() {
		element(by.id("RB-Transparent")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("11_background_transparent");
	});

	// change page indicator background design - translucent
	it("should change page indicator background design to translucent", function() {
		// Shows the page indicator of the carousel
		element(by.id("RB-Yes")).click();
		element(by.id("RB-PI-Translucent")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("12_pi_background_translucent");
	});

	// change page indicator background design - transparent
	it("should change page indicator background design to transparent", function() {
		element(by.id("RB-PI-Transparent")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("13_pi_background_transparent");
	});

	// change page indicator border design - none
	it("should change page indicator border design to none", function() {
		element(by.id("RB-PI-B-None")).click();
		_moveToCarousel();

		expect(takeScreenshot(myCarousel)).toLookAs("14_pi_border_none");
	});
});
