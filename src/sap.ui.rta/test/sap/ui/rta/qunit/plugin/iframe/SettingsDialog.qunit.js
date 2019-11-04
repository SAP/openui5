/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/iframe/SettingsDialog",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/ValueState",
	"sap/ui/rta/plugin/iframe/controller/SettingsDialogController"
], function (
	SettingsDialog,
	Log,
	sinon,
	ValueState,
	SettingsDialogController
) {
	"use strict";

	jQuery("#qunit-fixture").hide();

	var sandbox = sinon.sandbox.create();
	var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var aTextInputFields = ["sectionName", "frameUrl"];
	var aNumericInputFields = ["frameWidth", "frameHeigth"];

	function createDialog() {
		var oSettingsDialog = new SettingsDialog();
		return oSettingsDialog;
	}

	function createJSONModel() {
		return new sap.ui.model.json.JSONModel({
			sectionName: {
				value: "",
				valueState: ValueState.None
			},
			frameWidth: {
				value: "",
				valueState: ValueState.None
			},
			frameHeigth: {
				value: "",
				valueState: ValueState.None
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
			}
		});
	}

	QUnit.module("Given that a SettingsDialog is available...", {
		beforeEach: function () {
			this.oSettingsDialog = createDialog();
		},
		afterEach: function () {
			this.oSettingsDialog.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When SettingsDialog gets initialized and open is called,", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this._oDialog.getTitle(), oTextResources.getText("IFRAME_SETTINGS_DIALOG_TITLE"), "then the title is set");
				assert.equal(this._oDialog.getContent().length, 3, "then 3 SimpleForms are added ");
				assert.equal(this._oDialog.getButtons().length, 2, "then 2 buttons are added");
				done();
			});
			this.oSettingsDialog.open();
		});

		QUnit.test("When SettingsDialog is opened then there should be no error value state", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				assert.strictEqual(this.oController._areAllValueStateNones(), true, "Value states are correct");
				done();
			}, this);
			this.oSettingsDialog.open();
			this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
		});

		QUnit.test("When there is an error value state in SettingsDialog then it can be detected", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFields.concat(aNumericInputFields).forEach(function (sFieldName) {
					this.oSettingsDialog._oJSONModel = createJSONModel();
					this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
					this.oSettingsDialog._oJSONModel.getData()[sFieldName]["valueState"] = ValueState.Error;
					assert.strictEqual(this.oController._areAllValueStateNones(), false, "Detected " + sFieldName + " field's error value state");
				}, this);
				done();
			}, this);
			this.oSettingsDialog.open();
		});

		QUnit.test("When SettingsDialog is opened then text input fields should be empty", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Text input fields are empty");
				done();
			}, this);
			this.oSettingsDialog.open();
		});

		QUnit.test("When there is no empty text input field then it can be detected", function (assert) {
			var done = assert.async();
			var aTextInputFieldsCopy = aTextInputFields.slice();
			var sLastTextInputField = aTextInputFieldsCopy.pop();
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFieldsCopy.forEach(function (sFieldName) {
					this.oSettingsDialog._oJSONModel.getData()[sFieldName]["value"] = "Text entered";
					assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Some text input fields are still empty");
				}, this);
				this.oSettingsDialog._oJSONModel.getData()[sLastTextInputField]["value"] = "Text entered";
				assert.strictEqual(this.oController._areAllTextFieldsValid(), true, "No more empty text input field");
				done();
			}, this);
			this.oSettingsDialog.open();
			this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
		});
	});
});