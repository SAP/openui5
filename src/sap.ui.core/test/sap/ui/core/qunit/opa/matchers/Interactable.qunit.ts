import Interactable from "sap/ui/test/matchers/Interactable";
import $ from "sap/ui/thirdparty/jquery";
import Button from "sap/m/Button";
import NavContainer from "sap/m/NavContainer";
import App from "sap/m/App";
import Page from "sap/m/Page";
import Dialog from "sap/m/Dialog";
import opaTest from "sap/ui/test/opaQunit";
import Opa5 from "sap/ui/test/Opa5";
import _LogCollector from "sap/ui/test/_LogCollector";
[NavContainer, App].forEach(function (FnConstructor) {
    QUnit.module("Matching in a :" + FnConstructor.getMetadata().getName(), {
        beforeEach: function () {
            this.oInitialPageButton = new Button();
            this.oSecondPageButton = new Button();
            var oInitialPage = new Page({
                content: this.oInitialPageButton
            });
            this.oSecondPage = new Page({
                content: this.oSecondPageButton
            });
            this.oNavContainer = new FnConstructor({
                pages: [oInitialPage, this.oSecondPage]
            }).placeAt("qunit-fixture");
            this.oInteractable = new Interactable();
            this.oSpy = sinon.spy(this.oInteractable._oLogger, "debug");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            this.oSpy.restore();
            this.oNavContainer.destroy();
        }
    });
    QUnit.test("Should match an interactable Button", function (assert) {
        var bResult = this.oInteractable.isMatching(this.oInitialPageButton);
        assert.ok(bResult, "Control is matching");
        sinon.assert.notCalled(this.oSpy);
    });
    QUnit.test("Should not match a Button that is invisible", function (assert) {
        var bResult = this.oInteractable.isMatching(this.oSecondPageButton);
        assert.ok(!bResult, "Control isn't matching");
    });
    QUnit.test("Should not match a Button while it is busy", function (assert) {
        this.oInitialPageButton.setBusy(true);
        var bResult = this.oInteractable.isMatching(this.oInitialPageButton);
        assert.ok(!bResult, "Control isn't matching");
    });
    QUnit.test("Should not match a Button while one of its parents is busy", function (assert) {
        this.oNavContainer.setBusy(true);
        var bResult = this.oInteractable.isMatching(this.oInitialPageButton);
        assert.ok(!bResult, "Control isn't matching");
    });
});
QUnit.module("Dialogs", {
    beforeEach: function () {
        this.oInteractable = new Interactable();
        this.oButtonInPage = new Button();
        this.oButtonInDialog = new Button();
        this.oDialog = new Dialog({
            content: this.oButtonInDialog
        });
        this.oButtonInPage.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        this.oSpy = sinon.spy(this.oInteractable._oLogger, "debug");
    },
    afterEach: function () {
        this.oButtonInPage.destroy();
        this.oDialog.destroy();
        this.oSpy.restore();
    }
});
QUnit.test("Should not match a Button when a dialog is opened in front of it", function (assert) {
    var fnStart = assert.async();
    var bResultBeforeOpening = this.oInteractable.isMatching(this.oButtonInPage);
    this.oDialog.attachAfterOpen(function () {
        var bResultAfterOpening = this.oInteractable.isMatching(this.oButtonInPage);
        assert.ok(bResultBeforeOpening, "Control is matching");
        assert.ok(!bResultAfterOpening, "Control isn't matching after a dialog is opened");
        sinon.assert.calledWith(this.oSpy, sinon.match(/hidden behind a blocking popup layer/));
        fnStart();
    }, this);
    this.oDialog.open();
});
opaTest("Should not match a Button when a dialog is opened in front of it - iframe", function (Given, When, Then) {
    var oButtonInPage;
    var oDialog;
    Given.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/miniUI5Site.html");
    When.waitFor({
        controlType: "sap.m.Button",
        viewName: "myView",
        id: "myButton",
        success: function (oButton) {
            oButtonInPage = oButton;
            oDialog = new (Opa5.getWindow().sap.m.Dialog)();
            oDialog.open();
        }
    });
    When.waitFor({
        interactable: false,
        success: function () {
            var bResultAfterOpening = this.oInteractable.isMatching(oButtonInPage);
            Opa5.assert.ok(!bResultAfterOpening, "Control isn't matching after a dialog is opened");
            sinon.assert.calledWith(this.oSpy, sinon.match(/hidden behind a blocking popup layer/));
            oDialog.destroy();
        }.bind(this)
    });
    Then.iTeardownMyApp();
});
QUnit.test("Should not match a Button when a dialog is opened in front of it even if the dialog is still opening", function (assert) {
    var fnStart = assert.async();
    var bResultAfterOpenEvent;
    var bResultAfterClosingImmediately;
    var bResultBeforeOpening = this.oInteractable.isMatching(this.oButtonInPage);
    this.oDialog.attachAfterOpen(function () {
        bResultAfterOpenEvent = this.oInteractable.isMatching(this.oButtonInPage);
    }, this);
    this.oDialog.open();
    var bResultAfterOpenFunctionCall = this.oInteractable.isMatching(this.oButtonInPage);
    this.oDialog.attachAfterClose(function () {
        assert.ok(bResultBeforeOpening, "Control is matching");
        assert.ok(!bResultAfterOpenFunctionCall, "Control isn't matching after a dialog open function is called");
        assert.ok(!bResultAfterOpenEvent, "Control isn't matching after a dialog is opened - Event afterOpen has fired");
        assert.ok(!bResultAfterClosingImmediately, "Control isn't matching after a dialog is opened and closed immediately");
        sinon.assert.calledWith(this.oSpy, sinon.match(/hidden behind a blocking popup layer/));
        assert.ok(this.oInteractable.isMatching(this.oButtonInPage), "Control is matching");
        fnStart();
    }, this);
    this.oDialog.close();
    bResultAfterClosingImmediately = this.oInteractable.isMatching(this.oButtonInPage);
});
QUnit.test("Should match a Button in an open dialog", function (assert) {
    var fnStart = assert.async();
    var bResultBeforeOpening = this.oInteractable.isMatching(this.oButtonInDialog);
    this.oDialog.attachAfterOpen(function () {
        var bResultAfterOpening = this.oInteractable.isMatching(this.oButtonInDialog);
        assert.ok(!bResultBeforeOpening, "Control isn't matching");
        assert.ok(bResultAfterOpening, "Control is matching after a dialog is opened");
        fnStart();
    }, this);
    this.oDialog.open();
});
QUnit.module("Invalidation", {
    beforeEach: function () {
        this.oInteractable = new Interactable();
        this.oButton = new Button();
        this.oButton.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        this.oSpy = sinon.spy(this.oInteractable._oLogger, "debug");
    },
    afterEach: function () {
        this.oSpy.restore();
        this.oButton.destroy();
        sap.ui.getCore().applyChanges();
    }
});
QUnit.test("Should not match an invalidated Button", function (assert) {
    var fnTimeoutDone = assert.async(), fnAfterRenderingDone = assert.async(), oButton = this.oButton;
    setTimeout(function () {
        var oLogCollector = _LogCollector.getInstance();
        oLogCollector.getAndClearLog();
        assert.ok(!this.oInteractable.isMatching(oButton), "No match because the button was invalidated");
        var sLog = oLogCollector.getAndClearLog();
        QUnit.assert.contains(sLog, "Control 'Element sap.m.Button#" + oButton.getId() + "' is currently in a UIArea that needs a new rendering");
        fnTimeoutDone();
    }.bind(this), 0);
    this.oButton.setText("foo");
    this.oButton.addEventDelegate({
        onAfterRendering: function () {
            setTimeout(function () {
                assert.ok(this.oInteractable.isMatching(oButton), "Match because the button was rendered again");
                fnAfterRenderingDone();
            }.bind(this), 0);
        }.bind(this)
    });
});
$(function () {
    new Dialog().open().destroy();
    QUnit.start();
});