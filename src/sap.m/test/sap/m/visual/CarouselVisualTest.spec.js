describe("sap.m.CarouselVisualTest", function() {
	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Carousel';

	var myCarousel = element(by.id("myCarousel"));

	// initial loading"
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// click right arrow
	it("should scroll right", function () {
		element(by.id("myCarousel-arrowScrollRight")).click();

		expect(takeScreenshot(myCarousel)).toLookAs("1_click_right_arrow");
	});

	// change height to 50%
	it("should change the height to 50%", function () {
		element(by.id("btnHeight50")).click();
		expect(takeScreenshot(myCarousel)).toLookAs("2_height_50_percent");
	});

	// change height to 600px
	it("should change the height to 600px", function () {
		element(by.id("btnHeight600px")).click();
		expect(takeScreenshot(myCarousel)).toLookAs("3_height_600px");
	});

	// change width to 60%
	it("should change the width to 60%", function () {
		element(by.id("btnWidth60")).click();
		expect(takeScreenshot(myCarousel)).toLookAs("4_width_60_percent");
	});

	// change width to 400px
	it("should change the width to 400px", function () {
		element(by.id("btnWidth400px")).click();
		expect(takeScreenshot(myCarousel)).toLookAs("5_width_400px");

		element(by.id("buttonResetCarousel")).click();
	});

	// change arrows position
	it("should change arrows placement", function() {
		element(by.id("arrowsPlacementSelect")).click();
		element(by.id("arrowPlacementIndicatorItem")).click();

		expect(takeScreenshot(myCarousel)).toLookAs("6_arrow_placement");
	});

	// change page indicator position
	it("should change page indicator placement", function() {
		element(by.id("showPageIndicatorSelect")).click();
		element(by.id("hidePI")).click();

		expect(takeScreenshot(myCarousel)).toLookAs("7_page_indicator_visibility");
	});

	// toggle page indicator visibility
	it("should change page indicator placement", function() {
		element(by.id("pageIndicatorPlacementSelect")).click();
		element(by.id("pageIndicatorTopItem")).click();

		expect(takeScreenshot(myCarousel)).toLookAs("8_page_indicator_placement");
	});
});
