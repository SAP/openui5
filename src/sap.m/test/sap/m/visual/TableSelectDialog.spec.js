describe('sap.m.TableSelectDialog', function() {
    it('should open simple table select dialog', function() {
        element(by.id('tsdWithBindingInput__vhi')).click();
        expect(takeScreenshot()).toLookAs('simple-tableSelectDialog');
        element(by.id('TableSelectDialog2-cancel')).click();
    });

    it('should open table select dialog in multiselect mode', function() {
        element(by.id('tsdWithMultiSelectButton')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect');

        element(by.id('TableSelectDialog4-table-sa-CbBg')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect-selection');

        element(by.id('TableSelectDialog4-cancel')).click();
    });

    it('should open table select dialog in multiselect mode with large data', function() {
        element(by.id('tsdWithLargeDataAndMultiSelectButton')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect-largeData');
        element(by.id('TableSelectDialog5-cancel')).click();
    });

    it('should open table select dialog in multiselect mode with very large data', function() {
        element(by.id('tsdWithVeryLargeDataButton')).click();
        expect(takeScreenshot()).toLookAs('tableSelectDialog-multiselect-veryLargeData');
        element(by.id('TableSelectDialog6-cancel')).click();

    });
});