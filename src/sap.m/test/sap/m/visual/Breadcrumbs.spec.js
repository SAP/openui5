describe("sap.m.Breadcrumbs", function() {

	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should open picker", function() {
		element(by.css("#breadCrumbWithSelect-select-arrow")).click();

		expect(takeScreenshot()).toLookAs("picker");
	});
});
