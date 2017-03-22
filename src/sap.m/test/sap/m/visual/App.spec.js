describe("sap.m.App", function () {

	var fnClickThenCompare = function (sId, sImageName, sTestMessage) {
		it(sTestMessage, function () {
			element(by.id(sId)).click();
			expect(takeScreenshot()).toLookAs(sImageName);
		});
	}

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	fnClickThenCompare("hide-footer-btn", "app-without-footer", "should show a footer");
	fnClickThenCompare("show-footer-btn", "app-with-footer", "should not show a footer");
	fnClickThenCompare("set-bgnd-solid-btn", "app-solid-bgnd", "should change the background to solid");
	fnClickThenCompare("set-bgnd-transparent-btn", "app-transparent-bgnd", "should change the background to transparent");
	fnClickThenCompare("show-nav-btn", "app-with-navbtn", "should show navigation button in the header");
	fnClickThenCompare("hide-nav-btn", "app-without-navbtn", "should not show navigation button in the header");
});
