describe("sap.uxap.ObjectPageIconTabBar", function() {
	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should collapse header", function() {
		element(by.css(".sapUxAPAnchorBarButton:nth-child(2)")).click();

		expect(takeScreenshot()).toLookAs("switchtab");
	});
});
