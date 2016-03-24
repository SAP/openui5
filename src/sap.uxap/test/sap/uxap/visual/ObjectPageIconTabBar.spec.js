describe("sap.uxap.ObjectPageIconTabBar", function() {
	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should collapse header", function() {
		if (browser.testrunner.runtime.platformName == "android" || browser.testrunner.runtime.platformName == "ios") {
			element(by.css(".sapMSltArrow")).click();
			element(by.css(".sapUxAPHierarchicalSelectFirstLevel:nth-child(2)")).click();
		} else {
			element(by.css(".sapUxAPAnchorBarButton:nth-child(2)")).click();
		}

		expect(takeScreenshot()).toLookAs("switchtab");
	});
});
