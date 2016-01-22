describe("sap.uxap.ObjectPageChild", function() {
	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should open anchor menu", function() {
		element(by.id("__button9")).click();

		expect(takeScreenshot()).toLookAs("anchormenu");
	});

	it("Should collapse header", function() {
		element(by.id("__button11")).click();

		expect(takeScreenshot()).toLookAs("snapheader");
	});
});
