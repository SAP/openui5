describe('sap.m.NotificationListGroup', function () {
    var group = element(by.id('notificationGroup'));

    it('should load test page', function () {
        expect(takeScreenshot(group)).toLookAs('initial');
    });

    it('should test compact mode', function () {
        element(by.id('toggleCompactModeButton')).click();
        expect(takeScreenshot(group)).toLookAs('compact-mode');
        element(by.id('toggleCompactModeButton')).click();
    });

    it('should collapse and expand the group', function () {
        var expandCollapseLink = element(by.css('#notificationGroup .sapMNLG-Footer > .sapMBtn'));
        expandCollapseLink.click();
        expect(takeScreenshot(group)).toLookAs('collapsed');
        expandCollapseLink.click();
    });

    it('should collapse the first notification and expand them after that', function() {
        var expandCollapseButton = element(by.id('firstNotification-expandCollapseButton'));
        expandCollapseButton.click();
        expect(takeScreenshot(group)).toLookAs('collapsedNotification');
        expandCollapseButton.click();
    });
});