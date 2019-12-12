/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/iframe/SettingsDialog",
	"sap/base/Log",
	"sap/ui/core/ValueState",
	"sap/ui/rta/plugin/iframe/SettingsDialogController",
	"sap/ui/rta/plugin/iframe/URLBuilderDialog",
	"sap/ui/qunit/QUnitUtils"
], function (
	SettingsDialog,
	Log,
	ValueState,
	SettingsDialogController,
	URLBuilderDialog,
	QUnitUtils
) {
	"use strict";

	var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	var aTextInputFields = ["frameUrl"];
	var aNumericInputFields = ["frameWidth", "frameHeight"];
	var aUnitsOfMeasure = [{
		name: "px"
	}, {
		name: "%"
	}, {
		name: "rem"
	}];
	var aImportTestData = [{
		input: {
			asNewSection: true,
			frameWidth: "16px",
			frameHeight: "9rem",
			frameUrl: "https_url",
			unitsOfMeasure: aUnitsOfMeasure
		},
		expectedResults: {
			asNewSection: true,
			frameWidth: 16,
			frameHeight: 9,
			frameWidthUnit: "px",
			frameHeightUnit: "rem",
			frameUrl: "https_url",
			unitsOfMeasure: aUnitsOfMeasure
		}
	}, {
		input: {
			frameWidth: "50%",
			frameHeight: "75%"
		},
		expectedResults: {
			frameWidth: 50,
			frameHeight: 75,
			frameWidthUnit: "%",
			frameHeightUnit: "%"
		}
	}];
	var mTestURLBuilderData = {
		asNewSection: true,
		frameWidth: "16px",
		frameHeight: "9rem",
		frameUrl: "https_url",
		unitsOfMeasure: aUnitsOfMeasure,
		urlBuilderParameters: [{
			label: "Guid",
			key: "{Guid}",
			value: "guid13423412342314"
		}, {
			label: "Region",
			key: "{Region}",
			value: "Germany"
		}, {
			label: "Year",
			key: "{Year}",
			value: "2020"
		}, {
			label: "Month",
			key: "{Month}",
			value: "July"
		}, {
			label: "Product_Category",
			key: "{Product_Category}",
			value: "Ice Cream"
		}, {
			label: "Campaign_Name",
			key: "{Campaign_Name}",
			value: "Langnese Brand"
		}, {
			label: "Brand_Name",
			key: "{Brand_Name}",
			value: "Langnese"
		}]
	};

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

	function clickOnButton(sId) {
		var oCancelButton = sap.ui.getCore().byId(sId);
		QUnitUtils.triggerEvent("tap", oCancelButton.getDomRef());
	}

	function clickOnCancel() {
		clickOnButton("sapUiRtaSettingsDialogCancelButton");
	}

	function clickOnSave() {
		clickOnButton("sapUiRtaSettingsDialogSaveButton");
	}

	QUnit.module("Given that a SettingsDialog is available...", {
		beforeEach: function () {
			this.oSettingsDialog = new SettingsDialog();
		}
	}, function () {
		QUnit.test("When SettingsDialog gets initialized and open is called,", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.oSettingsDialog._oDialog.getTitle(), oTextResources.getText("IFRAME_SETTINGS_DIALOG_TITLE"), "then the title is set");
				assert.equal(this.oSettingsDialog._oDialog.getContent().length, 3, "then 3 SimpleForms are added ");
				assert.equal(this.oSettingsDialog._oDialog.getButtons().length, 3, "then 3 buttons are added");
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open();
		});

		QUnit.test("When SettingsDialog is opened then there should be no error value state", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllValueStateNones(), true, "Value states are correct");
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open();
		});

		QUnit.test("When there is an error value state in SettingsDialog then it can be detected", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFields.concat(aNumericInputFields).forEach(function (sFieldName) {
					this.oSettingsDialog._oJSONModel = createJSONModel();
					this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
					this.oSettingsDialog._oJSONModel.getData()[sFieldName]["valueState"] = ValueState.Error;
					assert.strictEqual(this.oController._areAllValueStateNones(), false, "Detected " + sFieldName + " field's error value state");
				}, this);
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open();
		});

		QUnit.test("When SettingsDialog is opened then text input fields should be empty", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Text input fields are empty");
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open();
		});

		QUnit.test("When there is no empty text input field then it can be detected", function (assert) {
			var aTextInputFieldsCopy = aTextInputFields.slice();
			var sLastTextInputField = aTextInputFieldsCopy.pop();
			this.oSettingsDialog.attachOpened(function () {
				this.oController = new SettingsDialogController(this.oSettingsDialog._oJSONModel);
				aTextInputFieldsCopy.forEach(function (sFieldName) {
					this.oSettingsDialog._oJSONModel.getData()[sFieldName]["value"] = "Text entered";
					assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Some text input fields are still empty");
				}, this);
				this.oSettingsDialog._oJSONModel.getData()[sLastTextInputField]["value"] = "Text entered";
				assert.strictEqual(this.oController._areAllTextFieldsValid(), true, "No more empty text input field");
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open();
		});

		QUnit.test("When Cancel button is clicked then the promise should return no setting", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open().then(function (mSettings) {
				assert.strictEqual(mSettings, undefined, "The promise returns no setting");
			});
		});

		QUnit.test("When OK button is clicked then validation is triggered", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFields.forEach(function (sFieldName) {
					assert.strictEqual(this.oSettingsDialog._oJSONModel.getData()[sFieldName]["valueState"], ValueState.None, "Initial value state is none");
				}, this);
				clickOnSave();
				aTextInputFields.forEach(function (sFieldName) {
					assert.strictEqual(this.oSettingsDialog._oJSONModel.getData()[sFieldName]["valueState"], ValueState.Error, "Value state changed to error");
				}, this);
				clickOnCancel();
			}, this);
			return this.oSettingsDialog.open();
		});

		QUnit.test("When OK button is clicked then the promise should return settings", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				aTextInputFields.forEach(function (sFieldName) {
					this.oSettingsDialog._oJSONModel.getData()[sFieldName]["value"] = "Text entered";
				}, this);
				clickOnSave();
			}, this);
			return this.oSettingsDialog.open(mTestURLBuilderData).then(function (mSettings) {
				assert.strictEqual(jQuery.isEmptyObject(mSettings), false, "Non empty settings returned");
			});
		});

		QUnit.test("When OK button is clicked then the returned settings should be correct", function (assert) {
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
				clickOnSave();
			}, this);
			return this.oSettingsDialog.open().then(function (mSettings) {
				aTextInputFields.forEach(function (sFieldName) {
					assert.strictEqual(mSettings[sFieldName], "Text entered", "Setting for " + sFieldName + " is correct");
				});
				aNumericInputFields.forEach(function (sFieldName) {
					assert.strictEqual(mSettings[sFieldName], 100, "Setting for " + sFieldName + " is correct");
				});
				assert.strictEqual(mSettings.asNewSection, true, "Setting for asNewSection is correct");
				assert.strictEqual(mSettings.frameWidthUnit, "rem", "Setting for frameWidthUnit is correct");
				assert.strictEqual(mSettings.frameHeightUnit, "%", "Setting for frameHeightUnit is correct");
			});
		});

		aImportTestData.forEach(function (mData, iIndex) {
			QUnit.test("When existing settings are passed to the dialog then they should be imported correctly, part " + (iIndex + 1), function (assert) {
				this.oSettingsDialog.attachOpened(function () {
					var oData = this.oSettingsDialog._oJSONModel.getData();
					Object.keys(mData.expectedResults).forEach(function (sFieldName) {
						assert.strictEqual(oData[sFieldName].value, mData.expectedResults[sFieldName], sFieldName + " is imported correctly");
					});
					clickOnCancel();
				}, this);
				return this.oSettingsDialog.open(mData.input);
			}, this);
		});


		QUnit.test("When URL Builder button is clicked then URL Builder Dialog is opened", function (assert) {
			this.oSettingsDialog.attachOpened(function () {
				var oURLBuilderDialog = new URLBuilderDialog();
				this.oSettingsDialog._oController._createURLBuilderDialog = function () {
					return oURLBuilderDialog;
				};
				clickOnButton("sapUiRtaSettingsDialogURLBuilderButton");
				oURLBuilderDialog.attachOpened(function () {
					var oDialog = sap.ui.getCore().byId("sapUiRtaURLBuilderDialog");
					assert.ok(oDialog.isOpen(), "URL Builder Dialog is opened");
					assert.ok(oDialog.getVisible(), "URL Builder Dialog is visible");
					clickOnButton("sapUiRtaURLBuilderDialogSaveButton");
				});
				oURLBuilderDialog.attachClosed(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("url"), "https_url", "Built URL is returned");
					clickOnCancel();
				});
			}, this);
			return this.oSettingsDialog.open(mTestURLBuilderData);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});