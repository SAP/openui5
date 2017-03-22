describe("sap.m.MessagePage", function() {

	it("Should test default MessagePage",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should test compact mode", function () {
		element(by.id("SLItem5")).click();
		expect(takeScreenshot()).toLookAs("compact-mode");
		element(by.id("SLItem5")).click();
	});

	it("Should test Page with MessagePage", function () {
		element(by.id("SLItem2")).click();
		expect(takeScreenshot()).toLookAs("page-with-message-page");
	});

	it("Should test NavContainer with MessagePage", function () {
		element(by.id("SLItem4")).click();
		expect(takeScreenshot()).toLookAs("nav-container-with-message-page");
	});
});
