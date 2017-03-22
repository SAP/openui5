describe("sap.m.ProgressIndicator", function() {

	it("ProgressIndicator initial rendering", function() {
		expect(takeScreenshot()).toLookAs("initial-rendering");
	});

	it("ProgressIndicator set to 40%", function() {
		element(by.id("change_pi")).click();
		expect(takeScreenshot()).toLookAs("PI-value-changed");
	});

	it("ProgressIndicator set height", function() {
		element(by.id("small_pi")).click();
		expect(takeScreenshot()).toLookAs("PI-small");
	});

	it("ProgressIndicator set disable", function() {
		element(by.id("disable_pi")).click();
		expect(takeScreenshot()).toLookAs("PI-disabled");
	});

	it("ProgressIndicator set State", function() {
		element(by.id("state_pi")).click();
		expect(takeScreenshot()).toLookAs("PI-neutral-state");
	});

});