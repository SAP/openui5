/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Button",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function(Button, ResourceModel, I18NText, JSONModel, opaTest, Opa5) {

	"use strict";

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

	QUnit.test("Shall match a matching property", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonText");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(bResult, "Did match");
	});

	QUnit.test("Shall not match and log debug for a key for a different value", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("labelText");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'IAmALabel' does not match the value 'PressMe' of the 'text' property for 'Element sap.m.Button#button'/));
	});

	QUnit.test("Shall not match and log debug for a non matching property", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("type");
		this.oMatcher.setKey("buttonText");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'PressMe' does not match the value 'Default' of the 'type' property for 'Element sap.m.Button#button'/));
	});

	QUnit.test("Shall not match and log debug if there is no value for the key (even though the resource bundle return the key which is also shown in the UI)", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("aKeyThatDoesExist");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/No value for the key 'aKeyThatDoesExist' in the model 'i18n' of 'Element sap.m.Button#button'/));
	});

	QUnit.test("Shall not match and log debug for nonexistent property", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("aPropertyThatWillNeverEverExistOnTheButton");
		this.oMatcher.setKey("buttonText");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The 'Element sap.m.Button#button' has no 'aPropertyThatWillNeverEverExistOnTheButton' property/));
	});

	QUnit.test("Shall not match and log debug for a null key", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey(null);
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/No value for the key 'undefined' in the model 'i18n' of 'Element sap.m.Button#button'/));
	});

	QUnit.test("Shall not match and log debug a null property", function (assert) {
		// Arrange
		this.oButton.setText(null);
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonText");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The text 'PressMe' does not match the value '' of the 'text' property/));
	});

	QUnit.test("Shall not match and log debug for a matching property with non matching custom model", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonText");
		this.oMatcher.setModelName("someNonExistendModelName");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The 'Element sap.m.Button#button' has no model with name 'someNonExistendModelName'/));
	});

	QUnit.test("Shall match a matching property for a custom model", function (assert) {
		// Arrange
		this.oButton.setModel(this.oModel, "customModelName");
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonText");
		this.oMatcher.setModelName("customModelName");
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(bResult, "Did match");
	});

	QUnit.test("Shall match a matching property for a custom model without name", function (assert) {
		// Arrange
		this.oButton.setModel(this.oModel);
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonText");
		this.oMatcher.setModelName(null);
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(bResult, "Did match");
	});


	/**
	 *
	 */
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

	QUnit.test("Shall match a matching property with matching parameters", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonTextParams");
		this.oMatcher.setParameters(123);
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(bResult, "Did match");
	});

	QUnit.test("Shall not match  and log debug for a matching key with non matching parameters", function (assert) {
		// Arrange
		this.oMatcher.setPropertyName("text");
		this.oMatcher.setKey("buttonTextParams");
		this.oMatcher.setParameters(666);
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
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

	QUnit.test("Shall not match and log debug if not loaded yet", function (assert) {
		// Act
		var bResult = this.oMatcher.isMatching(this.oButton);
		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The model 'i18n' of 'Element sap.m.Button#button' is in async mode and not loaded yet/));
	});

	QUnit.test("Shall match if loaded", function (assert) {
		var that = this;
		var fnDone = assert.async();
		this.oModel.getResourceBundle().then(function () {
			// in firefox the property of the control is set a bit later but the bundle is already ready
			setTimeout(function () {
				// Act
				var bResult = that.oMatcher.isMatching(that.oButton);
				// Assert
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
				// mind the fixture page's resourceRoots when setting URLs
				// laod the module and check its state in the same waitFor, otherwise it might be awaited and loaded before expected
				oModel = new (Opa5.getWindow().sap.ui.model.resource.ResourceModel)({
					bundleUrl: "./" + BUNDLE_FILE,
					async: true
				});
				oButton.setModel(oModel, "i18n");
				var bMatch = this.oMatcher.isMatching(oButton);
				Opa5.assert.ok(!bMatch, "Did not match - async model not loaded");
				sinon.assert.calledWith(this.oDebugSpy, sinon.match(/The model 'i18n' of 'Element sap.m.Button#newButton' is in async mode and not loaded yet/));

				oModel.getResourceBundle().then(function () {
					// wait for button value to update
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

	QUnit.test("Shall not match and log debug", function (assert) {

		// Arrange
		var oModel = new JSONModel({ bundleUrl: BUNDLE_URL }),
			oButton = new Button({ id: "button", text: "{i18n>buttonText}" }).setModel(oModel, "i18n"),
			oMatcher = new I18NText({ propertyName: "text",	key: "buttonText" }),
			oDebugSpy = sinon.spy(oMatcher._oLogger, "debug");

		// Act
		var bResult = oMatcher.isMatching(oButton);

		// Assert
		assert.ok(!bResult, "Did not match");
		sinon.assert.calledWith(oDebugSpy, sinon.match(/The model '.*' is not a valid resource model/));

		// Cleanup
		oButton.destroy();
	});


	QUnit.module("Resource Model Implementation");

	QUnit.test("Check that the resource model has a certain private property and this contains the bundle after loading the properties asynchronously", function (assert) {

		// Why this test?
		// The implementation of I18NText relies on the internal implementation of the ResourceModel!

		// Act
		var oModel = new ResourceModel({
			bundleUrl: BUNDLE_URL,
			async : true
		});

		// Assert
		var fnDone = assert.async();
		var oPromise = oModel.getResourceBundle();
		oPromise.then(function () {
			var bBundleIsInVariable = (oModel._oResourceBundle instanceof Object && oModel._oResourceBundle.getText);
			assert.ok(bBundleIsInVariable, "The bundle is in the variable");
			fnDone();
		});
	});

});
