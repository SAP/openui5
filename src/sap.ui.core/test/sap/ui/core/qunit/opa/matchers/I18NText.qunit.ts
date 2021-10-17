import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import I18NText from "sap/ui/test/matchers/I18NText";
import JSONModel from "sap/ui/model/json/JSONModel";
import opaTest from "sap/ui/test/opaQunit";
import Opa5 from "sap/ui/test/Opa5";
var BUNDLE_FILE = "I18NText.properties";
var BUNDLE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/" + BUNDLE_FILE;
QUnit.module("Sync Resource Model", {
    beforeEach: function () {
        this.oButton = new Button({ id: "button", text: "PressMe" });
        this.oMatcher = new I18NText();
        this.oModel = new ResourceModel({ bundleUrl: BUNDLE_URL });
        this.oButton.setModel(this.oModel, "i18n");
        this.oDebugSpy = sinon.spy(this.oMatcher._oLogger, "debug");
    },
    afterEach: function () {
        this.oModel.destroy();
        this.oButton.destroy();
        this.oMatcher.destroy();
        this.oDebugSpy.restore();
    }
});
QUnit.test("Should match a property with matching value", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonText");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(bResult, "Did match");
});
QUnit.test("Should match when property and value match, and the key is equal to the value", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("PressMe");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(bResult, "Did match");
});
QUnit.test("Should not match when the key is different", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("labelText");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'IAmALabel' does not match the value 'PressMe' of the 'text' property for 'Element sap.m.Button#button'/));
});
QUnit.test("Should not match if there is no value for the key", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("aKeyThatDoesExist");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/No value for the key 'aKeyThatDoesExist' in the model 'i18n' of 'Element sap.m.Button#button'/));
});
QUnit.test("Should not match when the key is null", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey(null);
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/No value for the key 'undefined' in the model 'i18n' of 'Element sap.m.Button#button'/));
});
QUnit.test("Should not match when the property is different", function (assert) {
    this.oMatcher.setPropertyName("type");
    this.oMatcher.setKey("buttonText");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'PressMe' does not match the value 'Default' of the 'type' property for 'Element sap.m.Button#button'/));
});
QUnit.test("Should not match when the property doesn't exist", function (assert) {
    this.oMatcher.setPropertyName("aPropertyThatWillNeverEverExistOnTheButton");
    this.oMatcher.setKey("buttonText");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The 'Element sap.m.Button#button' has no 'aPropertyThatWillNeverEverExistOnTheButton' property/));
});
QUnit.test("Should not match a property with null value", function (assert) {
    this.oButton.setText(null);
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonText");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'PressMe' does not match the value '' of the 'text' property/));
});
QUnit.test("Should not match when the model is different (even when everything else matches)", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonText");
    this.oMatcher.setModelName("someNonExistendModelName");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The 'Element sap.m.Button#button' has no model with name 'someNonExistendModelName'/));
});
QUnit.test("Should match when the custom model matches (and everytihng else matches)", function (assert) {
    this.oButton.setModel(this.oModel, "customModelName");
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonText");
    this.oMatcher.setModelName("customModelName");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(bResult, "Did match");
});
QUnit.test("Should match when the custom model matches and it has no name (and everytihng else matches)", function (assert) {
    this.oButton.setModel(this.oModel);
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonText");
    this.oMatcher.setModelName(null);
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(bResult, "Did match");
});
QUnit.test("Should match when using the use library bundle flag", function (assert) {
    this.oButton.setText("OK");
    this.oMatcher.setUseLibraryBundle(true);
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("VIEWSETTINGS_ACCEPT");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(bResult, "Did match");
});
QUnit.test("Should not match when use library bundle flag is not set", function (assert) {
    this.oButton.setText("OK");
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("VIEWSETTINGS_ACCEPT");
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did match");
});
QUnit.module("Sync Resource Model with Parameters", {
    beforeEach: function () {
        this.oButton = new Button({ id: "button", text: "PressMe123" });
        this.oMatcher = new I18NText();
        this.oModel = new ResourceModel({ bundleUrl: BUNDLE_URL });
        this.oButton.setModel(this.oModel, "i18n");
        this.oDebugSpy = sinon.spy(this.oMatcher._oLogger, "debug");
    },
    afterEach: function () {
        this.oButton.destroy();
        this.oMatcher.destroy();
        this.oDebugSpy.restore();
    }
});
QUnit.test("Should match a matching property with matching parameters", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonTextParams");
    this.oMatcher.setParameters(123);
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(bResult, "Did match");
});
QUnit.test("Should not match  and log debug for a matching key with non matching parameters", function (assert) {
    this.oMatcher.setPropertyName("text");
    this.oMatcher.setKey("buttonTextParams");
    this.oMatcher.setParameters(666);
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'PressMe666' does not match the value 'PressMe123' of the 'text' property for 'Element sap.m.Button#button'/));
});
QUnit.module("Async Resource Model", {
    beforeEach: function () {
        this.oModel = new ResourceModel({ bundleUrl: BUNDLE_URL, async: true });
        this.oButton = new Button({ id: "button", text: "{i18n>buttonText}" }).setModel(this.oModel, "i18n");
        this.oMatcher = new I18NText({ propertyName: "text", key: "buttonText" });
        this.oDebugSpy = sinon.spy(this.oMatcher._oLogger, "debug");
    },
    afterEach: function () {
        this.oModel.destroy();
        this.oButton.destroy();
        this.oMatcher.destroy();
        this.oDebugSpy.restore();
    }
});
QUnit.test("Should not match and log debug if not loaded yet", function (assert) {
    var bResult = this.oMatcher.isMatching(this.oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The model 'i18n' of 'Element sap.m.Button#button' is in async mode and not loaded yet/));
});
QUnit.test("Should match if loaded", function (assert) {
    var that = this;
    var fnDone = assert.async();
    this.oModel.getResourceBundle().then(function () {
        setTimeout(function () {
            var bResult = that.oMatcher.isMatching(that.oButton);
            assert.ok(bResult, "Did match");
            fnDone();
        }, 0);
    });
});
QUnit.module("I18NText - iframe", {
    beforeEach: function () {
        this.oMatcher = new I18NText({ propertyName: "text", key: "buttonText" });
        this.oDebugSpy = sinon.spy(this.oMatcher._oLogger, "debug");
    },
    afterEach: function () {
        this.oMatcher.destroy();
        this.oDebugSpy.restore();
    }
});
opaTest("Async resource model - iframe", function (Given, When, Then) {
    var oButton;
    var bLoaded = false;
    var oModel;
    Given.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/miniUI5Site.html");
    When.waitFor({
        controlType: "sap.m.Page",
        viewName: "myView",
        id: "page1",
        success: function (oPage) {
            oButton = new (Opa5.getWindow().sap.m.Button)({
                id: "newButton",
                text: "{i18n>buttonText}"
            });
            oPage.addContent(oButton);
        }
    });
    When.waitFor({
        success: function () {
            oModel = new (Opa5.getWindow().sap.ui.model.resource.ResourceModel)({
                bundleUrl: "./" + BUNDLE_FILE,
                async: true
            });
            oButton.setModel(oModel, "i18n");
            var bMatch = this.oMatcher.isMatching(oButton);
            Opa5.assert.ok(!bMatch, "Did not match - async model not loaded");
            sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The model 'i18n' of 'Element sap.m.Button#newButton' is in async mode and not loaded yet/));
            oModel.getResourceBundle().then(function () {
                setTimeout(function () {
                    bLoaded = true;
                }, 100);
            });
        }.bind(this)
    });
    When.waitFor({
        check: function () {
            return bLoaded;
        },
        success: function () {
            var bMatch = this.oMatcher.isMatching(oButton);
            Opa5.assert.ok(bMatch, "Did match - async model is loaded");
        }.bind(this)
    });
    Then.iTeardownMyApp();
});
QUnit.module("JSON Model");
QUnit.test("Should not match and log debug", function (assert) {
    var oModel = new JSONModel({ bundleUrl: BUNDLE_URL }), oButton = new Button({ id: "button", text: "{i18n>buttonText}" }).setModel(oModel, "i18n"), oMatcher = new I18NText({ propertyName: "text", key: "buttonText" }), oDebugSpy = sinon.spy(oMatcher._oLogger, "debug");
    var bResult = oMatcher.isMatching(oButton);
    assert.ok(!bResult, "Did not match");
    sinon.assert.calledWith(oDebugSpy, sinon.match(/The model '.*' is not a valid resource model/));
    oButton.destroy();
});
QUnit.module("Resource Model Implementation");
QUnit.test("Check that the resource model has a certain private property and this contains the bundle after loading the properties asynchronously", function (assert) {
    var oModel = new ResourceModel({
        bundleUrl: BUNDLE_URL,
        async: true
    });
    var fnDone = assert.async();
    var oPromise = oModel.getResourceBundle();
    oPromise.then(function () {
        var bBundleIsInVariable = (oModel._oResourceBundle instanceof Object && oModel._oResourceBundle.getText);
        assert.ok(bBundleIsInVariable, "The bundle is in the variable");
        fnDone();
    });
});