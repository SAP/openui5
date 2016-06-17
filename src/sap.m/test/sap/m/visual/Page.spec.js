describe("sap.m.Page", function () {

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	//check if the background changes correctly
	["List", "Solid", "Transparent", "Standard"].forEach(function (sBackgroundStyle) {
		it("Background should be " + sBackgroundStyle, function () {
			element(by.id("background-change-button")).click();
			expect(takeScreenshot()).toLookAs("page-background-is-" + sBackgroundStyle);
		});
	});

	//check page without header
	it("Should show page without header", function () {
		element(by.id("hide-show-header")).click();
		expect(takeScreenshot()).toLookAs("page-without-header");
		element(by.id("hide-show-header")).click();
	});

	//check page without footer
	it("Should show page without footer", function () {
		element(by.id("hide-show-footer")).click();
		expect(takeScreenshot()).toLookAs("page-without-footer");
		element(by.id("hide-show-footer")).click();
	});
});
