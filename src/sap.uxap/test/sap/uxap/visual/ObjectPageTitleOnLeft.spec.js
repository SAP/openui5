describe("sap.uxap.ObjectPageTitleOnLeft", function() {
	browser.testrunner.currentSuite.meta.controlName = 'sap.uxap.ObjectPageLayout';
	
	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});
});
