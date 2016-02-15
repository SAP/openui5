describe('sap.m.NotificationListItem', function() {

    it('should load test page', function () {
        expect(takeScreenshot()).toLookAs('initial');
    });

    it('should test compact mode', function () {
        element(by.id('toggleCompactModeButton')).click();
        expect(takeScreenshot()).toLookAs('compact-mode');
        element(by.id('toggleCompactModeButton')).click();
    });

    it('should fire "accept" button pressed event', function () {
        element(by.id('notificationAcceptButton')).click();
        expect(takeScreenshot()).toLookAs('accept-clicked');
    });

    it('should fire "cancel" button pressed event', function () {
        element(by.id('notificationCancelButton')).click();
        expect(takeScreenshot()).toLookAs('cancel-clicked');
    });

    it('should expand the notification', function() {
        element(by.id('firstNotification-expandCollapseButton')).click();
        expect(takeScreenshot()).toLookAs('show-more-clicked');
    });

    it('should collapse the notification', function() {
        element(by.id('firstNotification-expandCollapseButton')).click();
        expect(takeScreenshot()).toLookAs('show-less-clicked');
    });

    it('should close the item', function () {
        element(by.css('#firstNotification .sapMNLI-CloseButton')).click();
        expect(takeScreenshot()).toLookAs('close-clicked');
    });
});