/*global document, jQuery, sap, QUnit*/
(function ($) {
    "use strict";

    (function setTitle(sTitle) {
        document.title = sTitle;
        $(function () {
            $("#qunit-header").text(sTitle);
        });
    })("qUnit Page for MiniMenu - sap.ui.dt");

    jQuery.sap.require("sap.ui.qunit.qunit-css");
    if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version <= 8) {
        QUnit.test("", function (assert) {
            assert.ok(false, "IE 8 is not supported");
        });
        return;
    }
    jQuery.sap.require("sap.ui.thirdparty.sinon");
    jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
    jQuery.sap.require("sap.ui.qunit.QUnitUtils");
    jQuery.sap.require("sap.m.OverflowToolbarButton");
    jQuery.sap.require("sap.m.FlexBox");

    jQuery.sap.require("sap.ui.dt.MiniMenuControl");

    QUnit.module("MiniMenu API", {
        beforeEach: function () {
            this.oMiniMenu = new sap.ui.dt.MiniMenuControl({
                maxButtonsDisplayed : 4,
                buttons: [
                    {
                        icon: "sap-icon://add",
                        text: "_Add",
                        handler: function () {
                            sap.m.MessageToast.show("test");
                        }
                    },

                    {
                        icon: "sap-icon://edit",
                        text: "_Edit",
                        handler: function () {
                            sap.m.MessageToast.show("test");
                        }
                    },

                    {
                        icon: "sap-icon://delete",
                        text: "_Delete",
                        handler: function () {
                            sap.m.MessageToast.show("test");
                        }
                    },

                    {
                        icon: "sap-icon://jam",
                        text: "_Jam",
                        handler: function () {
                            sap.m.MessageToast.show("test");
                        }
                    },

                    {
                        icon: "sap-icon://soccor",
                        text: "_Soccor",
                        handler: function () {
                            sap.m.MessageToast.show("test");
                        }
                    }
                ]
            });
        },

        afterEach: function () {
            this.oMiniMenu.destroy();
            this.oMiniMenu = null;
        }
    });

    QUnit.test("default value of maxButtonsDisplayed", function (assert) {

        assert.strictEqual(this.oMiniMenu.getProperty("maxButtonsDisplayed"), 4, "Should return 4.");
    });

    QUnit.test("setting value of maxButtonsDisplayed", function (assert) {

        this.oMiniMenu.setMaxButtonsDisplayed(19);

        assert.strictEqual(this.oMiniMenu.getProperty("maxButtonsDisplayed"), 19, "Should return 19.");
    });

    QUnit.test("setting value of maxButtonsDisplayed to an illegal value", function (assert) {

        assert.throws(function () {this.oMiniMenu.setMaxButtonsDisplayed(1);}, "Should throw an Error.");
    });

    QUnit.test("adding a button", function (assert) {

        var oBtn = { text : "Test", icon : "", handler: function(){}};

        assert.strictEqual(this.oMiniMenu.addButton(oBtn), this.oMiniMenu, "Should return the MiniMenu");

        assert.strictEqual(this.oMiniMenu.getDependents()[0].getContent()[0].getItems()[this.oMiniMenu.getDependents()[0].getContent()[0].getItems().length - 1].getText(), oBtn.text, "should add a button");
    });

    QUnit.test("removing a button", function (assert) {

        var oRemovedButton = this.oMiniMenu.removeButton(0);

        var aItems = this.oMiniMenu.getDependents()[0].getContent()[0].getItems();

        for (var i = 0; i < aItems.length; i++) {
            if (aItems[i] === oRemovedButton) {
                assert.ok(false, "didn't remove the button");
            }
        }

        assert.ok(true, "should remove a button");
    });

    QUnit.test("removing all buttons", function (assert) {

        this.oMiniMenu.removeAllButtons();

        assert.strictEqual(this.oMiniMenu.getDependents()[0].getContent()[0].getItems().length, 0, "should remove all buttons");
    });

    QUnit.test("Showing the MiniMenu", function (assert) {

        var testButton = new sap.m.Button({});

        this.oMiniMenu.show(testButton);
        assert.ok(true, "Should throw no error");

        testButton.destroy();
    });

    QUnit.test("Closing the MiniMenu", function (assert) {

        var testButton = new sap.m.Button({});

        this.oMiniMenu.show(testButton);
        this.oMiniMenu.close();
        assert.ok(true, "Should throw no error");
        testButton.destroy();
    });

    QUnit.test("Hiding then showing the MiniMenu", function (assert) {

        var testButton = new sap.m.Button({});

        this.oMiniMenu.show(testButton);
        this.oMiniMenu.close();
        this.oMiniMenu.show(testButton);

        assert.ok(true, "Should throw no error");
        testButton.destroy();
    });

    QUnit.test("Pressing the overflow button, then re-opening the MiniMenu", function (assert) {

        var testButton = new sap.m.Button({});
        var lastButtonIndex = this.oMiniMenu.getDependents()[0].getContent()[0].getItems().length;

        this.oMiniMenu.show(testButton);
        this.oMiniMenu._onOverflowPress.bind(this.oMiniMenu.getDependents()[0].getContent()[0].getItems()[lastButtonIndex])();
        assert.strictEqual(this.oMiniMenu.getDependents()[0].getContent()[0].getItems()[lastButtonIndex].getVisible(), false, "Overflow button should be invisible");
        this.oMiniMenu.close();
        this.oMiniMenu.show(testButton);

        assert.strictEqual(this.oMiniMenu.getDependents()[0].getContent()[0].getItems()[lastButtonIndex].getVisible(), true, "Overflow button should be visible again");
        testButton.destroy();
        lastButtonIndex = null;
    });


     QUnit.test("getting all buttons", function (assert) {

        var testButton = new sap.m.Button({});

        this.oMiniMenu.show(testButton);
        assert.strictEqual(this.oMiniMenu.getButtons().length, 6, "Should return the number of buttons");
        testButton.destroy();
    });

    QUnit.test("Inserting a button", function (assert) {

        var testButton = new sap.m.Button({});

        this.oMiniMenu.show(testButton);
        assert.strictEqual(this.oMiniMenu.insertButton(new sap.m.Button({text : "abc"}), 1), this.oMiniMenu, "Should return the MiniMenu");
        assert.strictEqual(this.oMiniMenu.getButtons()[1].getText(), "abc", "Should return the text of the inserted button");
        testButton.destroy();
    });



})(jQuery);