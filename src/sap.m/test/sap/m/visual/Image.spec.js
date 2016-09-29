describe("sap.m.Image", function() {

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify not decorative image has no focus outline
	it('should click on the not decorative image', function() {
		expect(takeScreenshot(element(by.id('image_not_decorative')))).toLookAs('image_not_decorative_before_click');
		element(by.id('image_not_decorative')).click();
		expect(takeScreenshot(element(by.id('image_not_decorative')))).toLookAs('image_not_decorative_before_click');
	});

	// verify button image has a focus outline
	it('should click on the button image', function() {
		expect(takeScreenshot(element(by.id('image_button')))).toLookAs('image_button_before_click');
		element(by.id('image_button')).click();
		expect(takeScreenshot(element(by.id('image_button')))).toLookAs('image_button_after_click');
	});

});
