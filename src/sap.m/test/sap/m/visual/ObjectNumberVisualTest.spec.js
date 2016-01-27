describe("sap.m.ObjectNumberVisualTest", function() {

	it("ObjectNumber",function() {
		expect(takeScreenshot()).toLookAs("initial-rendering");
	});

	it("Number set to emphasized",function(){
		element(by.id("emphasized")).click();
		expect(takeScreenshot()).toLookAs("number-emphasized");
	});

	it("Change number",function(){
		element(by.id("num")).click();
		expect(takeScreenshot()).toLookAs("number-change-value");
	});

	it("Change unit",function(){
		element(by.id("unit")).click();
		expect(takeScreenshot()).toLookAs("number-change-unit");
	});

	it("Number change state to success",function(){
		element(by.id("change_stateS")).click();
		expect(takeScreenshot()).toLookAs("number-state-success");
	});

	it("Number change state to error",function(){
		element(by.id("change_stateE")).click();
		expect(takeScreenshot()).toLookAs("number-state-error");
	});

	it("Number change state to warning",function(){
		element(by.id("change_stateW")).click();
		expect(takeScreenshot()).toLookAs("number-state-warning");
	});

});