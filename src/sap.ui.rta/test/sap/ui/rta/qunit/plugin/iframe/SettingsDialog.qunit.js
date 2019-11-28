/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/iframe/SettingsDialog",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/ValueState",
	"sap/ui/rta/plugin/iframe/controller/SettingsDialogController",
	"sap/ui/qunit/QUnitUtils"
], function (
	SettingsDialog,
	Log,
	sinon,
	ValueState,
	SettingsDialogController,
	QUnitUtils
) {
	"use strict";

	jQuery("#qunit-fixture").hide();

	var sandbox = sinon.sandbox.create();
	var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var aTextInputFields = ["sectionName", "frameUrl"];
	var aNumericInputFields = ["frameWidth", "frameHeight"];

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
			frameHeight: {
				value: "",
				valueState: ValueState.None
			},
			frameUrl: {
				value: "",
				valueState: ValueState.None
			}
		});
	}

	function clickOnCancel() {
		var oCancelButton = sap.ui.getCore().byId("sapUiRtaSettingsDialogCancelButton");
		QUnitUtils.triggerEvent("tap", oCancelButton.getDomRef());
	}

	QUnit.module("Given that a SettingsDialog is available...", {
		beforeEach: function () {
			this.oSettingsDialog = createDialog();
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When SettingsDialog gets initialized and open is called,", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.oSettingsDialog._oDialog.getTitle(), oTextResources.getText("IFRAME_SETTINGS_DIALOG_TITLE"), "then the title is set");
				assert.equal(this.oSettingsDialog._oDialog.getContent().length, 3, "then 3 SimpleForms are added ");
				assert.equal(this.oSettingsDialog._oDialog.getButtons().length, 2, "then 2 buttons are added");
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function () {
				done();
			});
		});

		QUnit.test("When SettingsDialog is opened then there should be no error value state", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				assert.strictEqual(this.oController._areAllValueStateNones(), true, "Value states are correct");
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function () {
				done();
			});
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
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function () {
				done();
			});
		});

		QUnit.test("When SettingsDialog is opened then text input fields should be empty", function (assert) {
			var done = assert.async();
			this.oSettingsDialog.attachOpened(function () {
				this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Text input fields are empty");
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function () {
				done();
			});
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
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function () {
				done();
			});
			this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
		});

		QUnit.test("When Cancel button is clicked then the promise should return no setting", function (assert) {
			var done = assert.async();
			this.oSettingsDialog = createDialog();
			this.oSettingsDialog.attachOpened(function () {
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function (mSettings) {
				assert.strictEqual(mSettings, undefined, "The promise returns no setting");
				done();
			});
		});

		QUnit.test("When OK button is clicked then validation is triggered", function (assert) {
			var done = assert.async();
			this.oSettingsDialog = createDialog();
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFields.forEach(function (sFieldName) {
					assert.strictEqual(this.oSettingsDialog._oJSONModel.getData()[sFieldName]["valueState"], ValueState.None, "Initial value state is none");
				}, this);
				var oOKButton = sap.ui.getCore().byId("sapUiRtaSettingsDialogOKButton");
				QUnitUtils.triggerEvent("tap", oOKButton.getDomRef());
				aTextInputFields.forEach(function (sFieldName) {
					assert.strictEqual(this.oSettingsDialog._oJSONModel.getData()[sFieldName]["valueState"], ValueState.Error, "Value state changed to error");
				}, this);
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open().then(function () {
				done();
			});
		});

		QUnit.test("When OK button is clicked then the promise should return settings", function (assert) {
			var done = assert.async();
			this.oSettingsDialog = createDialog();
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFields.forEach(function (sFieldName) {
					this.oSettingsDialog._oJSONModel.getData()[sFieldName]["value"] = "Text entered";
				}, this);
				var oOKButton = sap.ui.getCore().byId("sapUiRtaSettingsDialogOKButton");
				QUnitUtils.triggerEvent("tap", oOKButton.getDomRef());
			}, this);
			this.oSettingsDialog.open().then(function (mSettings) {
				assert.strictEqual(jQuery.isEmptyObject(mSettings), false, "Non empty settings returned");
				done();
			});
		});

		QUnit.test("When OK button is clicked then the returned settings should be correct", function (assert) {
			var done = assert.async();
			this.oSettingsDialog = createDialog();
			this.oSettingsDialog.attachOpened(function () {
				var oData = this.oSettingsDialog._oJSONModel.getData();
				aTextInputFields.forEach(function (sFieldName) {
					oData[sFieldName]["value"] = "Text entered";
				});
				aNumericInputFields.forEach(function (sFieldName) {
					oData[sFieldName]["value"] = 100;
				});
				oData.asNewSection.value = true;
				oData.frameWidthUnit.value = "rem";
				oData.frameHeightUnit.value = "%";
				var oOKButton = sap.ui.getCore().byId("sapUiRtaSettingsDialogOKButton");
				QUnitUtils.triggerEvent("tap", oOKButton.getDomRef());
			}, this);
			this.oSettingsDialog.open().then(function (mSettings) {
				aTextInputFields.forEach(function (sFieldName) {
					assert.strictEqual(mSettings[sFieldName], "Text entered", "Setting for " + sFieldName + " is correct");
				});
				aNumericInputFields.forEach(function (sFieldName) {
					assert.strictEqual(mSettings[sFieldName], 100, "Setting for " + sFieldName + " is correct");
				});
				assert.strictEqual(mSettings.asNewSection, true, "Setting for asNewSection is correct");
				assert.strictEqual(mSettings.frameWidthUnit, "rem", "Setting for frameWidthUnit is correct");
				assert.strictEqual(mSettings.frameHeightUnit, "%", "Setting for frameHeightUnit is correct");
				done();
			});
		});

		QUnit.test("When existing settings are passed to the dialog then they should be imported correctly", function (assert) {
			var mSettings = {
				asNewSection: true,
				frameWidth: 16,
				frameHeight: 9
			};
			var done = assert.async();
			this.oSettingsDialog = createDialog();
			this.oSettingsDialog.attachOpened(function () {
				var oData = this.oSettingsDialog._oJSONModel.getData();
				Object.keys(mSettings).forEach(function (sFieldName) {
					assert.strictEqual(oData[sFieldName].value, mSettings[sFieldName], sFieldName + " is imported correctly");
				});
				clickOnCancel();
			}, this);
			this.oSettingsDialog.open(mSettings).then(function () {
				done();
			});
		});
	});
});