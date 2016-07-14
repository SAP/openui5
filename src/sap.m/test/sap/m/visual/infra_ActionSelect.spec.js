describe("sap.m.infra_ActionSelect", function() {

	var body = element(by.css("body"));

	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	// verify action list opens and contains the correct items
	it("should open ActionList in header", function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("header_left"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("header_left")).click();
			expect(takeScreenshot()).toLookAs("header");
			browser.actions().mouseMove(element(by.id("first_header_left"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("first_header_left")).click();
		}
	});

	// verify action list opens and contains the correct items
	it("should open left ActionList in content", function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("content_left"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("content_left")).click();
			expect(takeScreenshot()).toLookAs("left_content");
			browser.actions().mouseMove(element(by.id("first_content_left"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("first_content_left")).click();
		}
	});

	// verify action list opens and contains the correct items
	it("should open right ActionList in content", function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("content_right"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("content_right")).click();
			expect(takeScreenshot()).toLookAs("right_content");
			browser.actions().mouseMove(element(by.id("first_content_right"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("first_content_right")).click();
		}
	});

	// verify action list opens and contains the correct items
	it("should open left ActionList in footer", function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("footer_left"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("footer_left")).click();
			expect(takeScreenshot()).toLookAs("left_footer");
			browser.actions().mouseMove(element(by.id("first_footer_left"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("first_footer_left")).click();
		}
	});

	// verify action list opens and contains the correct items
	it("should open right ActionList in footer", function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("footer_right"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("footer_right")).click();
			expect(takeScreenshot()).toLookAs("right_footer");
			browser.actions().mouseMove(element(by.id("first_footer_right"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("first_footer_right")).click();
		}
	});
});
