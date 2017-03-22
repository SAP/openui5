describe("sap.m.Toolbar", function() {

	it("Toolbar initial rendering",function() {
		expect(takeScreenshot()).toLookAs("toolbar-initial");
	});

	it("Toolbar open select",function() {
		element(by.id("selH")).click();
		expect(takeScreenshot()).toLookAs("toolbar-open-select");
	});

	it("Click info Toolbar",function() {
		element(by.id("info_bar")).click();
		expect(takeScreenshot()).toLookAs("toolbar-info-bar");
	});

	it("Resize Toolbar",function() {
		element(by.id("size_btn")).click();
		expect(takeScreenshot()).toLookAs("toolbar-resized");
	});

});