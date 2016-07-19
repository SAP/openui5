describe("sap.m.infra_Page", function () {

	var body = element(by.css("body"));

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	//check if the background changes correctly
	["List", "Solid", "Transparent", "Standard"].forEach(function (sBackgroundStyle) {
		it("Background should be " + sBackgroundStyle, function () {
			if (browser.testrunner.runtime.browserName != "safari") {
				browser.actions().mouseMove(element(by.id("background-change-button"))).click().mouseMove(body,{x:0,y:0}).perform();
				//element(by.id("background-change-button")).click();
				expect(takeScreenshot()).toLookAs("page-background-is-" + sBackgroundStyle);
			}
		});
	});

	//check page without header
	it("Should show page without header", function () {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("hide-show-header"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("hide-show-header")).click();
			expect(takeScreenshot()).toLookAs("page-without-header");
			browser.actions().mouseMove(element(by.id("hide-show-header"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("hide-show-header")).click();
		}
	});

	//check page without footer
	it("Should show page without footer", function () {
		if (browser.testrunner.runtime.browserName != "safari") {
			browser.actions().mouseMove(element(by.id("hide-show-footer"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("hide-show-footer")).click();
			expect(takeScreenshot()).toLookAs("page-without-footer");
			browser.actions().mouseMove(element(by.id("hide-show-footer"))).click().mouseMove(body,{x:0,y:0}).perform();
			//element(by.id("hide-show-footer")).click();
		}
	});
});
