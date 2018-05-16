/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.MultiComboBox', function() {
    "use strict";

    // Initial loading
    it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
    });

    //MultiComboBox - default
    it("should open first MultiComboBox - Default", function() {
        var defaultMultiComboBoxArrow = element(by.id("MultiComboBox2-arrow"));
        defaultMultiComboBoxArrow.click();
        expect(takeScreenshot()).toLookAs("defaultMultiComboBox_fullscreen");
        defaultMultiComboBoxArrow.click();
    });

    //MultiComboBox - selected
    it("should focus on MultiComboBox", function () {
        var selectedMultiComboBox = element(by.id("MultiComboBox2"));
        selectedMultiComboBox.click();
        expect(takeScreenshot(selectedMultiComboBox)).toLookAs("default_multiComboBox_selected");
	});

    //MultiComboBox - 50% width
    it("should show MultiComboBox with 50% width", function(){
        var definedWidthMultiComboBox = element(by.id("MultiComboBox0"));
        definedWidthMultiComboBox.click();
        expect(takeScreenshot(definedWidthMultiComboBox)).toLookAs("multiComboBox_defined_width");
    });

    //MultiComboBox with cropped tokens
    it("should show MultiComboBox with cropped tokens", function(){
        var croppedTokensMultiComboBox = element(by.id("MultiComboBox1"));
        croppedTokensMultiComboBox.click();
        expect(takeScreenshot(croppedTokensMultiComboBox)).toLookAs("cropped_tokens");
    });

    //MultiComboBox with selectable disabled list item
    it("should show selectable option that was disabled", function(){
        var selectableItemMultiComboBoxArrow = element(by.id("MultiComboBoxDisabledListItemSelectable-arrow"));
        selectableItemMultiComboBoxArrow.click();
        expect(takeScreenshot()).toLookAs("multiComboBox_selectable_disabled_item");
    });

    //MultiComboBox - read only
    it("should show a read only MultiComboBox", function(){
        var multiComboBoxReadOnly = element(by.id("MultiComboBoxReadOnly"));
        multiComboBoxReadOnly.click();
        expect(takeScreenshot(multiComboBoxReadOnly)).toLookAs("read_only");
    });

    //MultiComboBox - Disabled
    it("should show MultiComboBox - Disabled", function(){
        var multiComboBoxDisabled = element(by.id("MultiComboBoxDisabled"));
        multiComboBoxDisabled.click();
        expect(takeScreenshot(multiComboBoxDisabled)).toLookAs("disabled");
    });

    //MultiComboBox Compact Mode
    it("should select Compact mode", function(){
        element(by.id("__box1")).click();
        expect(takeScreenshot()).toLookAs("compact_mode");
        element(by.id("__box1")).click();
    });

    //MultiComboBox - Error state
    it("should show MultiComboBox - Error state", function(){
        var multiComboBoxError = element(by.id("MultiComboBoxError"));
        multiComboBoxError.click();
        expect(takeScreenshot(multiComboBoxError)).toLookAs("error_state");
    });

    //MultiComboBox - Warning state
    it("should show MultiComboBox - Warning State", function(){
        var multiComboBoxWarning = element(by.id("MultiComboBoxWarning"));
        multiComboBoxWarning.click();
        expect(takeScreenshot(multiComboBoxWarning)).toLookAs("warning_state");
    });

    //MultiComboBox - Success state
    it("should show on MultiComboBox - Success state", function(){
        var multiComboBoxSuccess = element(by.id("MultiComboBoxSuccess"));
        multiComboBoxSuccess.click();
        expect(takeScreenshot(multiComboBoxSuccess)).toLookAs("multiComboBox_success");
    });

    //MultiComboBox - Binding
    it("should show a MultiComboBox with binding", function(){
        var multiComboBoxBinding = element(by.id("MultiComboBoxBinding"));
        multiComboBoxBinding.click();
        expect(takeScreenshot(multiComboBoxBinding)).toLookAs("multiComboBox_binding");
    });
});