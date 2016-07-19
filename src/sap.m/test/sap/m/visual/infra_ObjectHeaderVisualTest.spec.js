describe("sap.m.infra_ObjectHeaderVisualTest", function() {

	var body = element(by.css("body"));

	it("OH with 2 states and property fullScreenOptimized set to true",function() {
		expect(takeScreenshot()).toLookAs("2states-next-to-Title");
	});

	it("OH with 2 states and property fullScreenOptimized set to false",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("change_fullscreen"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("change_fullscreen")).click();
			expect(takeScreenshot()).toLookAs("2states-below-Title");
		}
	});

	it("OH with 5 states and property fullScreenOptimized set to false",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("add_states"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("add_states")).click();
			expect(takeScreenshot()).toLookAs("5states-3columns-below-Title");
		}
	});

	it("OH with 5 states and property fullScreenOptimized set to true",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("add_states"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("add_states")).click();
			browser.actions().mouseMove(element(by.id("change_fullscreen"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("change_fullscreen")).click();
			expect(takeScreenshot()).toLookAs("5states-4columns-below-Title");
		}
	});

	it("Title is clicked",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("oh1-txt"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("oh1-txt")).click();
			expect(takeScreenshot()).toLookAs("title-clicked");
		}
	});

	it("Intro is clicked",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("oh1-intro"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("oh1-intro")).click();
			expect(takeScreenshot()).toLookAs("intro-clicked");
		}
	});

	it("Set none responsive",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("change_OH_type"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("change_OH_type")).click();
			expect(takeScreenshot()).toLookAs("old-OH");
		}
	});

	it("Set condensed",function() {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("change_to_condensed"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("change_to_condensed")).click();
			expect(takeScreenshot()).toLookAs("condensed-OH");
		}
	});
});