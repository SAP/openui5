describe('sap.m.Dialog', function() {

    it('should open simple dialog', function() {
        element(by.id('simpleDialogButton')).click();
        var simpleDialog = element(by.id('simpleDialog'));
        expect(takeScreenshot(simpleDialog)).toLookAs('simple-dialog');
        element(by.id('simpleDialogCancelButton')).click();
    });

    it('should open dialog without header', function() {
        element(by.id('dialogNoHeaderButton')).click();
        var noHeaderDialog = element(by.id('noHeaderDialog'));
        expect(takeScreenshot(noHeaderDialog)).toLookAs('dialog-no-header');
        element(by.id('dialogNoHeaderCancelButton')).click();
    });

    it('should open dialog with subheader', function() {
        element(by.id('dialogWithSubheaderButton')).click();
        element(by.id('triggerSubheaderButton')).click();
        var subheaderDialog = element(by.id('subheaderDialog'));
        expect(takeScreenshot(subheaderDialog)).toLookAs('dialog-with-subheader');
        element(by.id('dialogWithSubheaderCancelButton')).click();
    });

    it('should open stretched dialog', function() {
        element(by.id('stretchedDialogButton')).click();
        var stretchedDialog = element(by.id('stretchedDialog'));
        expect(takeScreenshot(stretchedDialog)).toLookAs('dialog-stretched');
        element(by.id('stretchedDialogCloseButton')).click();
    });

    it('should open dialog with textarea', function() {
        element(by.id('textareaDialogButton')).click();
        var textAreaDialog = element(by.id('textAreaDialog'));
        expect(takeScreenshot(textAreaDialog)).toLookAs('dialog-with-textarea');
        element(by.id('textareaDialogCloseButton')).click();
    });

    it('should open resizable dialog', function() {
        element(by.id('resizeDialogButton')).click();
        var resizableDialog = element(by.id('resizableDialog'))
        expect(takeScreenshot(resizableDialog)).toLookAs('dialog-with-resize');
        element(by.id('resizeDialogCloseButton')).click();
    })
});