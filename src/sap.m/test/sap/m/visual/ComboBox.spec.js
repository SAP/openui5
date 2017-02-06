describe("sap.m.ComboBox", function() {

    // check initial
    it("should load test page",function(){
        expect(takeScreenshot()).toLookAs("initial");
    });

    // check ComboBox - default
    it("should open first ComboBox - Default", function() {
        element(by.id("box_default-arrow")).click();
        expect(takeScreenshot()).toLookAs("default_fullscreen");
        element.all(by.css('li.sapMSelectListItemBase[id*="box_default"]')).get(2).click();
    });

   // check ComboBox - Two column layout
    it("should open second ComboBox - Two column layout", function() {
        element(by.id("box_two_column-arrow")).click();
        expect(takeScreenshot()).toLookAs("two_column_fullscreen");
        element.all(by.css('li.sapMSelectListItemBase[id*="box_two_column"]')).get(8).click();
    });

    // check ComboBox - Placeholder
    it("should open third ComboBox - Placeholder", function() {
        var comboBoxPlaceholder = element(by.id("box_placeholder"));
        comboBoxPlaceholder.click();
        expect(takeScreenshot(comboBoxPlaceholder)).toLookAs("placeholder");
    });

    // check ComboBox - Label and placeholder
    it("should open fourth ComboBox - Label and placeholder", function() {
        element(by.id("box_label_placeholder")).click();
        expect(takeScreenshot(element(by.id("layout_label_placeholder")))).toLookAs("label_placeholder");
    });

    // check ComboBox - Disabled
    it("should open fifth ComboBox - Disabled", function() {
        var comboBoxDisabled = element(by.id("box_disabled"));
        comboBoxDisabled.click();
        expect(takeScreenshot(comboBoxDisabled)).toLookAs("disabled");
    });

    // check ComboBox - Read only
    it("should open sixth ComboBox - Read only", function() {
        var comboBoxReadOnly = element(by.id("box_read_only"));
        comboBoxReadOnly.click();
        comboBoxReadOnly.click();
        expect(takeScreenshot(comboBoxReadOnly)).toLookAs("read_only");
    });

    // check ComboBox - Warning state
    it("should open seventh ComboBox - Warning state", function() {
        element(by.id("box_warning")).click();
        expect(takeScreenshot(element(by.id("layout_warning")))).toLookAs("warning");
    });

    // check ComboBox - Success state
    it("should open eighth ComboBox - Success state", function() {
        var comboBoxSuccess = element(by.id("box_success"));
        comboBoxSuccess.click();
        expect(takeScreenshot(comboBoxSuccess)).toLookAs("success");
    });

    // check ComboBox - Error state
    it("should open ninth ComboBox - Error state", function() {
        var comboBoxError = element(by.id("box_error"));
        comboBoxError.click();
        expect(takeScreenshot(comboBoxError)).toLookAs("error");
    });
});
