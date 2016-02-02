describe('sap.m.TableSelectDialog', function() {
    it('should open simple table select dialog', function() {
        element(by.id('tsdWithBindingInput__vhi')).click();
        expect(takeScreenshot()).toLookAs('simple-tableSelectDialog');

        // send escape to close tsd
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    });

    it('should open table select dialog in multiselect mode', function() {
        element(by.id('tsdWithMultiSelectButton')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect');

        element(by.id('TableSelectDialog4-table-sa-CbBg')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect-selection');

        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    });

    it('should open table select dialog in multiselect mode with large data', function() {
        element(by.id('tsdWithLargeDataAndMultiSelectButton')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect-largeData');
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    });

    it('should open table select dialog in multiselect mode with very large data', function() {
        element(by.id('tsdWithVeryLargeDataButton')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect-veryLargeData');
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    });
});