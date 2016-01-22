describe("sap.uxap.ObjectPageActions", function() {
	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should open actions menu", function() {
		element(by.id("__xmlview0--headerForTest-overflow")).click();

		expect(takeScreenshot()).toLookAs("actionsmenu");
	});
});
