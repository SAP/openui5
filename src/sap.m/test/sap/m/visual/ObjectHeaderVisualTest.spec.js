describe("sap.m.ObjectHeaderVisualTest", function() {

	it("OH with 2 states and property fullScreenOptimized set to true",function() {
		expect(takeScreenshot()).toLookAs("2states-next-to-Title");
	});

	it("OH with 2 states and property fullScreenOptimized set to false",function() {
		element(by.id("change_fullscreen")).click();
		expect(takeScreenshot()).toLookAs("2states-below-Title");
	});

	it("OH with 5 states and property fullScreenOptimized set to false",function() {
		element(by.id("add_states")).click();
		expect(takeScreenshot()).toLookAs("5states-3columns-below-Title");
	});

	it("OH with 5 states and property fullScreenOptimized set to true",function() {
		element(by.id("add_states")).click();
		element(by.id("change_fullscreen")).click();
		expect(takeScreenshot()).toLookAs("5states-4columns-below-Title");
	});

	it("Title is clicked",function() {
		element(by.id("oh1-txt")).click();
		expect(takeScreenshot()).toLookAs("title-clicked");
	});

	it("Intro is clicked",function() {
		element(by.id("oh1-intro")).click();
		expect(takeScreenshot()).toLookAs("intro-clicked");
	});

	it("Set none responsive",function() {
		element(by.id("change_OH_type")).click();
		expect(takeScreenshot()).toLookAs("old-OH");
	});

	it("Set condensed",function() {
		element(by.id("change_to_condensed")).click();
		expect(takeScreenshot()).toLookAs("condensed-OH");
	});
});