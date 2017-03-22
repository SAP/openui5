describe("sap.m.ResponsivePopover", function() {

	it('should load test page',function(){
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Should open ResponsivePopover', function() {
		element(by.id('btnPopoverBottom')).click();
		expect(takeScreenshot(element(by.id('popoverBottom-popover')))).toLookAs('responsive-popover');
	});

	it('Should open ResponsivePopover with detail page', function() {
		element(by.id('btnPopoverWithNavContainer')).click();
		expect(takeScreenshot(element(by.id('popoverWithNavContainer-popover')))).toLookAs('responsive-popover2-first-page');
		element(by.id('listPage')).click();
		expect(takeScreenshot(element(by.id('popoverWithNavContainer-popover')))).toLookAs('responsive-popover2-detail-page');
	});

	it('Should open ResponsivePopover with shared title', function() {
		element(by.id('btnPopoverHeader')).click();
		expect(takeScreenshot(element(by.id('popoverHeader-popover')))).toLookAs('responsive-popover-shared-title1');
		element(by.id('btnNextPage')).click();
		expect(takeScreenshot(element(by.id('popoverHeader-popover')))).toLookAs('responsive-popover-shared-title2');
	});

});