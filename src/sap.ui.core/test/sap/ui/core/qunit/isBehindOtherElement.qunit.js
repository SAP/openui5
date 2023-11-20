/*global QUnit */
sap.ui.define([
    "sap/m/App",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/MessagePopover",
    "sap/m/Page",
	"sap/ui/dom/isBehindOtherElement",
    "sap/ui/thirdparty/jquery",
    "sap/ui/qunit/utils/nextUIUpdate"
], function(App, Button, Input, MessagePopover, Page, isBehindOtherElement, jQuery, nextUIUpdate) {
	"use strict";

	// Test functions

	QUnit.module("API");

	QUnit.test("isBehindOtherElement returns correct value", async function (assert) {
        // Arrange
        var oInput = new Input(),
            oMessagePopover = new MessagePopover({
                afterOpen: function () {
                    // Assert
                    assert.strictEqual(isBehindOtherElement(oInput.getDomRef()), true, "Input is behind the MessagePopover");
                    assert.strictEqual(isBehindOtherElement(oButton.getDomRef()), false, "Button is not behind the MessagePopover");

                    // Clean up
                    jQuery("#qunit-fixture").css("top", "-10000px");
                    jQuery("#qunit-fixture").css("left", "-10000px");
                    fnDone();
                }
            }),
            oButton = new Button({
                press: function () {
                    oButton.addDependent(oMessagePopover);
                    oMessagePopover.openBy(oButton);
                }
            }),
            oPage = new Page({
                content: [ oButton, oInput ]
            }),
            oApp = new App({
                pages: [ oPage ]
            }),
            fnDone = assert.async();

        oInput.addStyleClass("sapUiMediumMargin");

        assert.expect(2);
        oApp.placeAt("qunit-fixture");
        await nextUIUpdate();
        jQuery("#qunit-fixture").css("top", "0");
        jQuery("#qunit-fixture").css("left", "0");

        // Act
        oButton.firePress();
	});

    QUnit.test("isBehindOtherElement returns 'false', if element is outside the visible viewport", async function (assert) {
        // Arrange
        var oButton = new Button({ text: "My Button" });

        // QUnit fixture is usually positioned outside of the visible viewport
        oButton.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(isBehindOtherElement(oButton.getDomRef()), false, "Button is outside the visible viewport");
	});

});
