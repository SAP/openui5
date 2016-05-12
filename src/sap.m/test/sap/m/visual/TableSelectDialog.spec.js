describe('sap.m.TableSelectDialog', function() {
    it('should open simple table select dialog', function() {
        element(by.id('tsdWithBindingInput__vhi')).click();
        var tableSelectDialog = element(by.id('TableSelectDialog2-dialog'));
        expect(takeScreenshot(tableSelectDialog)).toLookAs('simple-tableSelectDialog');
        element(by.id('TableSelectDialog2-cancel')).click();
    });

    it('should open table select dialog in multiselect mode', function() {
        element(by.id('tsdWithMultiSelectButton')).click();
        var tableSelectDialog = element(by.id('TableSelectDialog4-dialog'));
        expect(takeScreenshot(tableSelectDialog)).toLookAs('tableSelectDialog-multiselect');

        element(by.id('TableSelectDialog4-table-sa-CbBg')).click();
        expect(takeScreenshot(tableSelectDialog)).toLookAs('tableSelectDialog-multiselect-selection');

        element(by.id('TableSelectDialog4-cancel')).click();
    });

    it('should open table select dialog in multiselect mode with large data', function() {
        element(by.id('tsdWithLargeDataAndMultiSelectButton')).click();
        var tableSelectDialog = element(by.id('TableSelectDialog5-dialog'));
        expect(takeScreenshot(tableSelectDialog)).toLookAs('tableSelectDialog-multiselect-largeData');
        element(by.id('TableSelectDialog5-cancel')).click();
    });

    it('should open table select dialog in multiselect mode with very large data', function() {
        element(by.id('tsdWithVeryLargeDataButton')).click();
        var tableSelectDialog = element(by.id('TableSelectDialog6-dialog'));
        expect(takeScreenshot(tableSelectDialog)).toLookAs('tableSelectD-multiselect-veryLargeData');
        element(by.id('TableSelectDialog6-cancel')).click();

    });
});