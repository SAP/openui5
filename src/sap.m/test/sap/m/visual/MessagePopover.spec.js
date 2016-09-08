describe("sap.m.MessagePopover", function () {

    it("should load test page", function () {
        expect(takeScreenshot()).toLookAs("initial");
    });

    it("should open MessagePopover", function () {
        element(by.id("mPopoverButton")).click();
        expect(takeScreenshot(element(by.id("mPopover-messagePopover-popover")))).toLookAs("mpopover");
    });

    ["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
        it("should open " + sMessageType + " messages.", function () {
            element(by.id("mPopover-" + sMessageType)).click();
            expect(takeScreenshot(element(by.id("mPopover-messagePopover-popover")))).toLookAs("mpopover-" + sMessageType);
        });
    });

    it("should open MessagePopover in compact mode", function () {
        element(by.id("compactMode")).click();
        expect(takeScreenshot(element(by.id("mPopover-messagePopover-popover")))).toLookAs("mpopover-compact");
    });

    ["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
        it("should open " + sMessageType + " messages in MessagePopover in compact mode.", function () {
            element(by.id("mPopover-" + sMessageType)).click();
            expect(takeScreenshot(element(by.id("mPopover-messagePopover-popover")))).toLookAs("mpopover-compact-" + sMessageType);
        });
    });

});