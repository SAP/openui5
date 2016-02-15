describe('sap.m.Dialog', function() {

    it('should open simple dialog', function() {
        element(by.id('simpleDialogButton')).click();
        expect(takeScreenshot()).toLookAs('simple-dialog');
        element(by.id('simpleDialogCancelButton')).click();
    });

    it('should open dialog without header', function() {
        element(by.id('dialogNoHeaderButton')).click();
        expect(takeScreenshot()).toLookAs('dialog-no-header');
        element(by.id('dialogNoHeaderCancelButton')).click();
    });

    it('should open dialog with subheader', function() {
        element(by.id('dialogWithSubheaderButton')).click();
        element(by.id('triggerSubheaderButton')).click();
        expect(takeScreenshot()).toLookAs('dialog-with-subheader');
        element(by.id('dialogWithSubheaderCancelButton')).click();
    });

    it('should open stretched dialog', function() {
        element(by.id('stretchedDialogButton')).click();
        expect(takeScreenshot()).toLookAs('dialog-stretched');
        element(by.id('stretchedDialogCloseButton')).click();
    });

    it('should open dialog with textarea', function() {
        element(by.id('textareaDialogButton')).click();
        expect(takeScreenshot()).toLookAs('dialog-with-textarea');
        element(by.id('textareaDialogCloseButton')).click();
    });

    it('should open resizable dialog', function() {
        element(by.id('resizeDialogButton')).click();
        expect(takeScreenshot()).toLookAs('dialog-with-resize');
        element(by.id('resizeDialogCloseButton')).click();
    })
});