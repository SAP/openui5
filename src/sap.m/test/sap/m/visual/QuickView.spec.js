describe('sap.m.QuickView', function() {

	// initial loading
	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('0_initial');
	});

	// standard
	it('should visualize standard QuickView', function () {
		element(by.id('QVButton')).click();
		var qv1 = element(by.id('QV1-quickView-popover'));
		expect(takeScreenshot(qv1)).toLookAs('1_standard_QuickView');
		expect(takeScreenshot()).toLookAs('1_standard_entire_page');
	});

	// go to page 2
	it('should go to page 2', function () {
		element(by.id('__link2')).click();
		var qv1 = element(by.id('QV1-quickView-popover'));
		expect(takeScreenshot(qv1)).toLookAs('2_go_to_page_2');
	});

	// return to page 1
	it('should return to page 1', function () {
	 element(by.id('__button3-iconBtn')).click();
	 var qv1 = element(by.id('QV1-quickView-popover'));
	 expect(takeScreenshot(qv1)).toLookAs('3_return_to_page_1');
	 });

	// empty QuickView
	it('should open empty QuickView', function () {
		element(by.id('EmptyQVButton')).click();
		expect(takeScreenshot()).toLookAs('4_empty');
	});

	// single page
	it('should visualize QuickView with single page', function () {
		element(by.id('SinglePageQVButton')).click();
		var qv2 = element(by.id('QV2-quickView-popover'));
		expect(takeScreenshot(qv2)).toLookAs('5_single_page_QuickView');
		expect(takeScreenshot()).toLookAs('5_single_page_entire_page');
	});

});