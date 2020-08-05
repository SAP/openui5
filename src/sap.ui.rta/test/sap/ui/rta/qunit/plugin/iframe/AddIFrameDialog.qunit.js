/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/qunit/QUnitUtils"
], function (
	AddIFrameDialog,
	Log,
	coreLibrary,
	AddIFrameDialogController,
	QUnitUtils
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

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
	var mParameters = {
		frameUrl: "http://blabla.company.com",
		parameters: [{
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
			label: "Product Category",
			key: "{Product_Category}",
			value: "Ice Cream"
		}, {
			label: "Campaign Name",
			key: "{Campaign_Name}",
			value: "Langnese Brand"
		}, {
			label: "Brand Name",
			key: "{Brand_Name}",
			value: "Langnese"
		}]
	};

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
		var oButton = sap.ui.getCore().byId(sId);
		QUnitUtils.triggerEvent("tap", oButton.getDomRef());
	}

	function clickOnCancel() {
		clickOnButton("sapUiRtaAddIFrameDialogCancelButton");
	}

	function clickOnSave() {
		clickOnButton("sapUiRtaAddIFrameDialogSaveButton");
	}

	function updateSaveButtonEnablement(bEnabled) {
		sap.ui.getCore().byId("sapUiRtaAddIFrameDialogSaveButton").setEnabled(bEnabled);
		sap.ui.getCore().applyChanges();
	}

	QUnit.module("Given that a AddIFrameDialog is available...", {
		beforeEach: function () {
			this.oAddIFrameDialog = new AddIFrameDialog();
		}
	}, function () {
		QUnit.test("When AddIFrameDialog gets initialized and open is called,", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.strictEqual(this.oAddIFrameDialog._oDialog.getTitle(), oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"), "then the correct title is set");
				assert.strictEqual(this.oAddIFrameDialog._oDialog.getButtons().length, 2, "then 2 buttons are added");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When AddIFrameDialog gets initialized and open is called in Update Mode,", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.strictEqual(this.oAddIFrameDialog._oDialog.getTitle(), oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_UPDATE_TITLE"), "then the correct title is set");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({updateMode: true});
		});

		QUnit.test("When AddIFrameDialog is opened then there should be no error value state", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllValueStateNones(), true, "Value states are correct");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When the dialog is opened then hash map is built correctly", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var mHashmap = AddIFrameDialogController.prototype._buildParameterHashMap(mParameters);
				mParameters.parameters.forEach(function (oParam) {
					assert.strictEqual(oParam.value, mHashmap[oParam.key], "Found " + oParam.key);
				});
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When there is an error value state in AddIFrameDialog then it can be detected", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				aTextInputFields.concat(aNumericInputFields).forEach(function (sFieldName) {
					this.oAddIFrameDialog._oJSONModel = createJSONModel();
					this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
					this.oAddIFrameDialog._oJSONModel.getData()[sFieldName]["valueState"] = ValueState.Error;
					assert.strictEqual(this.oController._areAllValueStateNones(), false, "Detected " + sFieldName + " field's error value state");
				}, this);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When AddIFrameDialog is opened then text input fields should be empty", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Text input fields are empty");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When there is no empty text input field then it can be detected", function (assert) {
			var aTextInputFieldsCopy = aTextInputFields.slice();
			var sLastTextInputField = aTextInputFieldsCopy.pop();
			this.oAddIFrameDialog.attachOpened(function () {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
				aTextInputFieldsCopy.forEach(function (sFieldName) {
					this.oAddIFrameDialog._oJSONModel.getData()[sFieldName]["value"] = "Text entered";
					assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Some text input fields are still empty");
				}, this);
				this.oAddIFrameDialog._oJSONModel.getData()[sLastTextInputField]["value"] = "Text entered";
				assert.strictEqual(this.oController._areAllTextFieldsValid(), true, "No more empty text input field");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When parameters are passed to the dialog then they should be imported correctly", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var oData = this.oAddIFrameDialog._oJSONModel.getData();
				Object.keys(mParameters).forEach(function (sFieldName) {
					assert.strictEqual(oData[sFieldName].value, mParameters[sFieldName], sFieldName + " is imported correctly");
				});
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mParameters);
		});

		QUnit.test("When URL parameters are added then the frame URL is built correctly", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var sUrl = this.oAddIFrameDialog._oController._addURLParameter("firstParameter");
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl.endsWith("firstParameter"), true, "Found firstParameter");

				sUrl = this.oAddIFrameDialog._oController._addURLParameter("secondParameter");
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl.endsWith("secondParameter"), true, "Found secondParameter");

				sUrl = this.oAddIFrameDialog._oController._addURLParameter("secondParameter");
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl.endsWith("secondParametersecondParameter"), true, "Found duplicate parameters");

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mParameters);
		});

		QUnit.test("When Show Preview is clicked then preview URL is built correctly", function (assert) {
			var sUrl;
			this.oAddIFrameDialog.attachOpened(function () {
				mParameters.parameters.forEach(function (oParam) {
					sUrl = this.oAddIFrameDialog._oController._addURLParameter(oParam.key);
					this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				}, this);
				sUrl = this.oAddIFrameDialog._oController._buildPreviewURL(this.oAddIFrameDialog._oJSONModel.getProperty("/frameUrl/value"));
				assert.strictEqual(sUrl, "http://blabla.company.comguid13423412342314Germany2020JulyIce CreamLangnese BrandLangnese", "Preview URL is correct");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mParameters);
		});

		QUnit.test("When Cancel button is clicked then the promise should return no setting", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open().then(function (mSettings) {
				assert.strictEqual(mSettings, undefined, "The promise returns no setting");
			});
		});

		QUnit.test("The Save-Button is only enabled when URL is entered", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var oData = this.oAddIFrameDialog._oJSONModel.getData();
				var bEnabled = !!oData.frameUrl.value;
				assert.strictEqual(sap.ui.getCore().byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), false, "Initial state is disabled");
				assert.strictEqual(sap.ui.getCore().byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), bEnabled, "Initial state of URL-Textarea is empty");
				oData.frameUrl.value = "https:\\www.sap.com";
				bEnabled = !!oData.frameUrl.value;
				updateSaveButtonEnablement(!!oData.frameUrl.value);
				assert.strictEqual(sap.ui.getCore().byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), bEnabled, "Button is enabled wheen URL-Textarea is not empty");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open();
		});

		QUnit.test("When OK button is clicked then the promise should return settings", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				aTextInputFields.forEach(function (sFieldName) {
					this.oAddIFrameDialog._oJSONModel.getData()[sFieldName]["value"] = "Text entered";
				}, this);
				clickOnSave();
			}, this);
			return this.oAddIFrameDialog.open(mTestURLBuilderData).then(function (mSettings) {
				assert.strictEqual(jQuery.isEmptyObject(mSettings), false, "Non empty settings returned");
			});
		});

		QUnit.test("When OK button is clicked then the returned settings should be correct", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var oData = this.oAddIFrameDialog._oJSONModel.getData();
				oData.frameUrl.value = "https://www.sap.com/\tindex.html\r\n";
				aNumericInputFields.forEach(function (sFieldName) {
					oData[sFieldName].value = 100;
				});
				oData.asNewSection.value = true;
				oData.frameWidthUnit.value = "rem";
				oData.frameHeightUnit.value = "%";
				updateSaveButtonEnablement(!!oData.frameUrl.value);
				clickOnSave();
			}, this);
			return this.oAddIFrameDialog.open().then(function (mSettings) {
				assert.strictEqual(mSettings.frameUrl, "https://www.sap.com/index.html", "Setting for frameUrl is correct");
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
				this.oAddIFrameDialog.attachOpened(function () {
					var oData = this.oAddIFrameDialog._oJSONModel.getData();
					Object.keys(mData.expectedResults).forEach(function (sFieldName) {
						assert.strictEqual(oData[sFieldName].value, mData.expectedResults[sFieldName], sFieldName + " is imported correctly");
					});
					clickOnCancel();
				}, this);
				return this.oAddIFrameDialog.open(mData.input);
			}, this);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
