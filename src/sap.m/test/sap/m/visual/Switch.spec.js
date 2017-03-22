describe("sap.m.Switch", function() {

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify regular switch
	it('should click on regular switch', function() {
		expect(takeScreenshot(element(by.id('switch_regular')))).toLookAs('switch_regular_before_click');
		element(by.id('switch_regular')).click();
		expect(takeScreenshot(element(by.id('switch_regular')))).toLookAs('switch_regular_after_click');
	});

	// verify disabled switch
	it('should click on disabled switch', function() {
		expect(takeScreenshot(element(by.id('switch_disabled')))).toLookAs('switch_disabled_before_click');
		element(by.id('switch_disabled')).click();
		expect(takeScreenshot(element(by.id('switch_disabled')))).toLookAs('switch_disabled_before_click');
	});

	// verify switch with no text
	it('should click on no-text switch', function() {
		expect(takeScreenshot(element(by.id('switch_notext')))).toLookAs('switch_notext_before_click');
		element(by.id('switch_notext')).click();
		expect(takeScreenshot(element(by.id('switch_notext')))).toLookAs('switch_notext_after_click');
	});

	// verify semantic switch
	it('should click on semantic switch', function() {
		expect(takeScreenshot(element(by.id('switch_semantic')))).toLookAs('switch_semantic_before_click');
		element(by.id('switch_semantic')).click();
		expect(takeScreenshot(element(by.id('switch_semantic')))).toLookAs('switch_semantic_after_click');
	});

});
