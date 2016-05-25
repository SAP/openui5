describe("sap.m.ActionSheet", function () {

    it("should load test page", function () {
        expect(takeScreenshot()).toLookAs("initial");
    });

    // verify actionsheet opens and contains the correct items
    it("should open ActionSheet with no title and no cancel", function () {
        element(by.id("noTitleNoCancel")).click();
        expect(takeScreenshot(element(by.id("actionSheet1")))).toLookAs("actionsheet-no-title-no-cancel");
        element(by.id("actionSheetButton")).click();
    });

    // verify actionsheet opens and contains the correct items
    it("should open ActionSheet with no title with cancel", function () {
        element(by.id("noTitleWithCancel")).click();
        expect(takeScreenshot(element(by.id("actionSheet1")))).toLookAs("actionsheet-no-title-with-cancel");
        element(by.id("actionSheetButton")).click();
    });

    // verify actionsheet opens and contains the correct items
    it("should open ActionSheet with title and cancel", function () {
        element(by.id("withTitleAndCancel")).click();
        expect(takeScreenshot(element(by.id("actionSheet1")))).toLookAs("actionsheet-with-title-and-cancel");
        element(by.id("actionSheetButton")).click();
    });

    // verify actionsheet opens and contains the correct items
    it("should open ActionSheet with many buttons", function () {
        element(by.id("withManyButtons")).click();
        expect(takeScreenshot(element(by.id("actionSheet2")))).toLookAs("actionsheet-with-many-buttons");
        element(by.id("actionSheetWithManyButtonsButton")).click();
    });

    // verify actionsheet opens and contains the correct items
    it("should open ActionSheet with no title and no cancel", function () {
        element(by.id("withoutIcons")).click();
        expect(takeScreenshot(element(by.id("actionSheet3")))).toLookAs("actionsheet-without-buttons");
        element(by.id("actionSheetWithoutIconsButton")).click();
    });


});
