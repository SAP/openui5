describe("sap.m.CarouselVisualTest", function() {
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
	});

	// hide page indicatior
	it("should hide page indicator", function () {
		element(by.id("btnHideIndicator")).click();
		expect(takeScreenshot(myCarousel)).toLookAs("6_hide_page_indicatior");
	});

	// move page indicatior to top
	it("should move page idicator to top", function () {
		element(by.id("btnMoveIndicatorTop")).click();
		expect(takeScreenshot(myCarousel)).toLookAs("7_move_page_indicatior_top");
	});
});
