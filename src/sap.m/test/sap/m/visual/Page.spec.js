describe("sap.m.Page", function () {

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	["List", "Solid", "Transparent", "Standard"].forEach(function (sBackgroundStyle) {
		it("Only content area shoudld be busy", function () {
			element(by.id("background-change-button")).click();
			expect(takeScreenshot()).toLookAs("page-background-is-" + sBackgroundStyle);
		});
	});
});
