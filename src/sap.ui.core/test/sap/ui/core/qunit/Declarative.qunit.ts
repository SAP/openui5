import jQuery from "sap/ui/thirdparty/jquery";
import oCore from "sap/ui/core/Core";
import DeclarativeSupport from "sap/ui/core/DeclarativeSupport";
import JSONModel from "sap/ui/model/json/JSONModel";
QUnit.module("Basic");
QUnit.test("Id", function (assert) {
    assert.expect(2);
    var $element = jQuery("#basic-id");
    var sId = DeclarativeSupport._getId($element.find("#basicId"));
    assert.equal(sId, "basicId", "Id is retrieved right");
    assert.equal($element.find("#basicId").length, 0, "Id is removed");
});
QUnit.module("Compile");
QUnit.test("Simple Button", function (assert) {
    assert.expect(3);
    var oButton = oCore.byId("simpleButton");
    assert.equal(!!oButton, false, "No control with id \"simpleButton\" found.");
    DeclarativeSupport.compile(jQuery("#simple-button"));
    var oButton = oCore.byId("simpleButton");
    assert.ok(!!oButton, "Control with id \"simpleButton\" found.");
    assert.equal(oButton.getText(), "My Button", "Text is set right");
});
QUnit.test("Test special attribute handling", function (assert) {
    assert.expect(3);
    var backup = null;
    try {
        backup = DeclarativeSupport.attributes["data-tooltip"];
        DeclarativeSupport.attributes["data-tooltip"] = function () {
            assert.ok(true, "Called special attribute handling");
        };
        var oButton = oCore.byId("buttonWithTooltip");
        assert.equal(!!oButton, false, "No control with id \"buttonWithTooltip\" found.");
        DeclarativeSupport.compile(jQuery("#button-with-tooltip"));
        var oButton = oCore.byId("buttonWithTooltip");
        assert.ok(!!oButton, "Control with id \"buttonWithTooltip\" found.");
    }
    finally {
        if (backup) {
            DeclarativeSupport.attributes["data-tooltip"] = backup;
        }
    }
});
QUnit.test("Button with style and class", function (assert) {
    assert.expect(3);
    var oButton = oCore.byId("buttonStyleClass");
    assert.equal(!!oButton, false, "No control with id \"buttonStyleClass\" found.");
    DeclarativeSupport.compile(jQuery("#button-with-style-and-class"));
    var oButton = oCore.byId("buttonStyleClass");
    assert.ok(!!oButton, "Control with id \"buttonStyleClass\" found.");
    assert.ok(!!oButton.hasStyleClass("mybutton"), "Control has right classes.");
});
QUnit.test("HTML Content", function (assert) {
    assert.expect(7);
    var oButton = oCore.byId("htmlContentButton");
    assert.equal(!!oButton, false, "No control with id \"htmlContentButton\" found.");
    DeclarativeSupport.compile(jQuery("#html-content"));
    var oButton = oCore.byId("htmlContentButton");
    assert.ok(!!oButton, "Control with id \"htmlContentButton\" found.");
    var oPanel = oCore.byId("htmlContentPanel");
    assert.ok(!!oPanel, "Control with id \"htmlContentPanel\" found.");
    assert.ok(oPanel.getHeaderToolbar(), "Toolbar is set right");
    assert.equal(oPanel.getHeaderToolbar().getContent().length, 1, "Toolbar content is set right");
    assert.equal(oPanel.getHeaderToolbar().getContent()[0].getText(), "SAPUI5 Content in HTML Table in SAPUI5 Panel", "Text is set right");
    assert.equal(oPanel.getContent().length, 1, "Number of child controls is right");
});
QUnit.test("Panel aggregation", function (assert) {
    assert.expect(6);
    var oPanel = oCore.byId("panelAggregation");
    assert.equal(!!oPanel, false, "No control with id \"panelAggregation\" found.");
    DeclarativeSupport.compile(jQuery("#panel-aggregation"));
    var oPanel = oCore.byId("panelAggregation");
    assert.ok(!!oPanel, "Control with id \"panelAggregation\" found.");
    assert.ok(oPanel.getHeaderToolbar(), "Toolbar is set right");
    assert.equal(oPanel.getHeaderToolbar().getContent().length, 1, "Toolbar content is set right");
    assert.equal(oPanel.getHeaderToolbar().getContent()[0].getText(), "Panel Aggregation", "Text is set right");
    assert.equal(oPanel.getContent().length, 6, "Number of child controls is right");
});
QUnit.test("Panel with default aggregation", function (assert) {
    assert.expect(6);
    var oPanel = oCore.byId("panelWithDefaultAggregation");
    assert.equal(!!oPanel, false, "No control with id \"panelWithDefaultAggregation\" found.");
    DeclarativeSupport.compile(jQuery("#panel-with-default-aggregation"));
    var oPanel = oCore.byId("panelWithDefaultAggregation");
    assert.ok(!!oPanel, "Control with id \"panelWithDefaultAggregation\" found.");
    assert.ok(oPanel.getHeaderToolbar(), "Toolbar is set right");
    assert.equal(oPanel.getHeaderToolbar().getContent().length, 1, "Toolbar content is set right");
    assert.equal(oPanel.getHeaderToolbar().getContent()[0].getText(), "Panel Aggregation", "Text is set right");
    assert.equal(oPanel.getContent().length, 6, "Number of child controls is right");
});
QUnit.test("Panel with association", function (assert) {
    assert.expect(6);
    var oPanel = oCore.byId("panelWithAssociation");
    assert.equal(!!oPanel, false, "No control with id \"panelWithAssociation\" found.");
    DeclarativeSupport.compile(jQuery("#panel-with-association"));
    var oPanel = oCore.byId("panelWithAssociation");
    assert.ok(!!oPanel, "Control with id \"panelWithAssociation\" found.");
    assert.equal(oPanel.getContent().length, 3, "Number of child controls is right");
    var oLabel = oPanel.getContent()[0];
    assert.equal(oLabel.getLabelFor(), "message", "Assocation id is set right");
    var oCombo = oPanel.getContent()[2];
    assert.equal(oCombo.getSelectedItems().length, 3, "Number of associated controls is right");
    assert.deepEqual(oCombo.getAssociation("selectedItems"), ["item1", "item2", "item3"], "Number of associated controls is right", "Assocation IDs are set right");
});
QUnit.test("UIArea", function (assert) {
    assert.expect(7);
    var oUIArea = oCore.getUIArea("uiAreaSimple");
    assert.equal(!!oUIArea, false, "No control with id \"uiAreaSimple\" found.");
    var oButton1 = oCore.byId("uiAreaSimpleButton2");
    assert.equal(!!oButton1, false, "No control with id \"uiAreaSimpleButton2\" found.");
    var oButton2 = oCore.byId("uiAreaSimpleButton2");
    assert.equal(!!oButton2, false, "No control with id \"uiAreaSimpleButton2\" found.");
    DeclarativeSupport.compile(jQuery("#ui-area-simple"));
    var oUIArea = oCore.getUIArea("uiAreaSimple");
    assert.ok(!!oUIArea, "UIArea with id \"uiAreaSimple\" found.");
    var oButton1 = oCore.byId("uiAreaSimpleButton2");
    assert.ok(!!oButton1, "Control with id \"uiAreaSimpleButton2\" found.");
    var oButton2 = oCore.byId("uiAreaSimpleButton2");
    assert.ok(!!oButton2, "Control with id \"uiAreaSimpleButton2\" found.");
    assert.equal(oButton2.getUIArea().getId(), "uiAreaSimple", "UI Areas are the same");
});
QUnit.test("Complex Declaration", function (assert) {
    assert.expect(8);
    var oUIArea = oCore.getUIArea("complexDeclarationUIArea");
    assert.equal(!!oUIArea, false, "No control with id \"complexDeclarationUIArea\" found.");
    var oPanel1 = oCore.byId("complexDeclarationPanel1");
    assert.equal(!!oPanel1, false, "No control with id \"complexDeclarationPanel1\" found.");
    var oPanel2 = oCore.byId("complexDeclarationPanel2");
    assert.equal(!!oPanel2, false, "No control with id \"complexDeclarationPanel2\" found.");
    var oPanel3 = oCore.byId("complexDeclarationPanel3");
    assert.equal(!!oPanel2, false, "No control with id \"complexDeclarationPanel3\" found.");
    window.handlePress = function (evt) {
        assert.ok(true, "Handler is called");
    };
    DeclarativeSupport.compile(jQuery("#complex-declaration"));
    var oUIArea = oCore.getUIArea("complexDeclarationUIArea");
    assert.ok(!!oUIArea, "Control with id \"complexDeclarationUIArea\" found.");
    var oPanel1 = oCore.byId("complexDeclarationPanel1");
    assert.ok(!!oPanel1, "Control with id \"complexDeclarationPanel1\" found.");
    var oPanel2 = oCore.byId("complexDeclarationPanel2");
    assert.ok(!!oPanel2, "Control with id \"complexDeclarationPanel2\" found.");
    var oPanel3 = oCore.byId("complexDeclarationPanel3");
    assert.ok(!!oPanel3, "Control with id \"complexDeclarationPanel3\" found.");
    delete window.handlePress;
});
QUnit.test("Events", function (assert) {
    assert.expect(3);
    var oButton1 = oCore.byId("buttonWithEvent");
    assert.equal(!!oButton1, false, "No control with id \"buttonWithEvent\" found.");
    window.handlePress = function (evt) {
        assert.ok(true, "Handler is called");
    };
    DeclarativeSupport.compile(jQuery("#events"));
    var oButton1 = oCore.byId("buttonWithEvent");
    assert.ok(!!oButton1, "Control with id \"buttonWithEvent\" found.");
    oButton1.firePress();
    delete window.handlePress;
});
QUnit.test("AltType", function (assert) {
    assert.expect(3);
    var oForm = oCore.byId("form");
    assert.equal(!!oForm, false, "No control with id \"form\" found.");
    DeclarativeSupport.compile(jQuery("#altType"));
    var oForm = oCore.byId("form");
    assert.ok(!!oForm, "Control with id \"form\" found.");
    assert.equal(oForm.getTitle(), "Alt type works", "Title is set right");
});
QUnit.test("Events Undefined Error", function (assert) {
    assert.expect(1);
    var bThrown = false;
    try {
        DeclarativeSupport.compile(jQuery("#events-error"));
    }
    catch (exc) {
        bThrown = true;
    }
    assert.ok(bThrown, "Undefined event handler throws error");
    jQuery("#events-error").remove();
});
QUnit.test("DataBinding", function (assert) {
    assert.expect(8);
    var oButton1 = oCore.byId("buttonDataBinding");
    assert.equal(!!oButton1, false, "No control with id \"buttonDataBinding\" found.");
    var oCarousel = oCore.byId("aggregationDataBinding");
    assert.equal(!!oCarousel, false, "No control with id \"aggregationDataBinding\" found.");
    var oModel1 = new JSONModel({
        booleanValue: true,
        stringValue: "Text1"
    });
    var oModel2 = new JSONModel({
        booleanValue: true,
        stringValue: "Text1",
        buttons: [{
                title: "button1"
            }, {
                title: "button2"
            }]
    });
    DeclarativeSupport.compile(jQuery("#databinding"));
    var oButton1 = oCore.byId("buttonDataBinding");
    assert.ok(!!oButton1, "Control with id \"buttonWithEvent\" found.");
    oButton1.setModel(oModel1);
    oButton1.setModel(oModel2, "model2");
    assert.equal(oButton1.getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'buttonDataBinding'");
    assert.equal(oButton1.getText(), oModel1.getData().stringValue, "Check 'text' property of button 'buttonDataBinding'");
    var oCarousel = oCore.byId("aggregationDataBinding");
    var oCarousel = oCore.byId("aggregationDataBinding");
    assert.ok(!!oCarousel, "Control with id \"aggregationDataBinding\" found.");
    oCarousel.setModel(oModel2);
    assert.equal(oCarousel.getPages().length, 2, "Two controls found in content");
    assert.equal(oCarousel.getPages()[0].getText(), "button1", "Title is set right");
});
QUnit.test("No Polution", function (assert) {
    assert.expect(3);
    assert.equal(document.querySelectorAll("[data-sap-ui-type]").length, 0, "No elements with attribute \"data-sap-ui-type\" found\"");
    assert.equal(document.querySelectorAll("[data-sap-ui-aggregation]").length, 0, "No elements with attribute \"data-sap-ui-aggregation\" found\"");
    assert.equal(document.querySelectorAll("[data-sap-ui-default-aggregation]").length, 0, "No elements with attribute \"data-sap-ui-default-aggregation\" found\"");
});
QUnit.test("Custom Data", function (assert) {
    assert.expect(2);
    var oButton = oCore.byId("simpleButton");
    assert.equal(oButton.data("customData1"), "customvalue", "Custom Data not applied!");
    assert.equal(oButton.data("CustomData2"), "customvalue", "Custom Data not applied!");
});