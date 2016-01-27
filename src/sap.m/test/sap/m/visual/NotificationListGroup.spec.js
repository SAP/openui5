describe('sap.m.NotificationListGroup', function () {

    it('should load test page', function () {
        expect(takeScreenshot()).toLookAs('initial');
    });

    it('should test compact mode', function () {
        element(by.id('toggleCompactModeButton')).click();
        expect(takeScreenshot()).toLookAs('compact-mode');
        element(by.id('toggleCompactModeButton')).click();
    });

    it('should collapse and expand the group', function () {
        var expandCollapseLink = element(by.css('#notificationGroup .sapMNLG-Footer > .sapMBtn'));
        expandCollapseLink.click();
        expect(takeScreenshot()).toLookAs('collapsed');

        expandCollapseLink.click();
        expect(takeScreenshot()).toLookAs('expanded');
    });

    it('should collapse the first notification', function() {
        element(by.id('firstNotification-expandCollapseButton')).click();
        expect(takeScreenshot()).toLookAs('collapsedNotification');
    });

    it('should expand the first notification', function() {
        element(by.id('firstNotification-expandCollapseButton')).click();
        expect(takeScreenshot()).toLookAs('expandedNotification');
    });

    it('should fire "accept all" button pressed event', function () {
        element(by.css('#notificationGroup .sapMNLG-Footer .sapMTB button:nth-of-type(1)')).click();
        expect(takeScreenshot()).toLookAs('accept-all-clicked');
    });

    it('should fire "cancel all" button pressed event', function () {
        element(by.css('#notificationGroup .sapMNLG-Footer .sapMTB button:nth-of-type(2)')).click();
        expect(takeScreenshot()).toLookAs('cancel-all-clicked');
    });

    it('should close the notification list group', function () {
        element(by.css('#notificationGroup .sapMNLG-CloseButton')).click();
        expect(takeScreenshot()).toLookAs('close-clicked');
    });
});