describe("sap.m.ActionSelect", function() {

	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	// verify action list opens and contains the correct items
	it("should open ActionList in header", function() {
		element(by.id("header_left")).click();
		expect(takeScreenshot()).toLookAs("header");
		element(by.id("first_header_left")).click();
	});

	// verify action list opens and contains the correct items
	it("should open left ActionList in content", function() {
		element(by.id("content_left")).click();
		expect(takeScreenshot()).toLookAs("left_content");
		element(by.id("first_content_left")).click();
	});

	// verify action list opens and contains the correct items
	it("should open right ActionList in content", function() {
		element(by.id("content_right")).click();
		expect(takeScreenshot()).toLookAs("right_content");
		element(by.id("first_content_right")).click();
	});

	// verify action list opens and contains the correct items
	it("should open left ActionList in footer", function() {
		element(by.id("footer_left")).click();
		expect(takeScreenshot()).toLookAs("left_footer");
		element(by.id("first_footer_left")).click();
	});

	// verify action list opens and contains the correct items
	it("should open right ActionList in footer", function() {
		element(by.id("footer_right")).click();
		expect(takeScreenshot()).toLookAs("right_footer");
		element(by.id("first_footer_right")).click();
	});
});
