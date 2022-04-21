/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/library",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button"
], function (
	AddIFrameDialog,
	isEmptyObject,
	coreLibrary,
	AddIFrameDialogController,
	QUnitUtils,
	oCore,
	JSONModel,
	Button
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var oTextResources = oCore.getLibraryResourceBundle("sap.ui.rta");
	var aTextInputFields = ["frameUrl"];
	var aNumericInputFields = ["frameWidth", "frameHeight"];
	var aUnitsOfMeasure = [{
		name: "px"
	}, {
		name: "%"
	}, {
		name: "rem"
	}];

	var oJsonModel = new JSONModel();
	oJsonModel.setData({
		Guid: "guidIOI",
		Region: "Germany",
		Year: "2020",
		Month: "July",
		Product_Category: "Ice Cream",
		Campaign_Name: "Langnese Brand",
		Brand_Name: "Langnese",
		Options: "yes/no",
		Product: "AC/DC Rocky Ice"
	});

	var oDummyReferenceControl = new Button();
	oDummyReferenceControl.setModel(oJsonModel);
	oDummyReferenceControl.setBindingContext(oJsonModel.getContext("/"));

	var mParameters = {
		frameUrl: "http://blabla.company.com?"
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
			frameWidth: "50.5%",
			frameHeight: "75.5%"
		},
		expectedResults: {
			frameWidth: 50.5,
			frameHeight: 75.5,
			frameWidthUnit: "%",
			frameHeightUnit: "%"
		}
	}];
	var mTestUrlBuilderData = {
		asNewSection: true,
		frameWidth: "16px",
		frameHeight: "9rem",
		frameUrl: "https_url",
		unitsOfMeasure: aUnitsOfMeasure
	};

	function createJsonModel() {
		return new JSONModel({
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
		var oDummyReferenceControl = oCore.byId(sId);
		QUnitUtils.triggerEvent("tap", oDummyReferenceControl.getDomRef());
	}

	function clickOnCancel() {
		clickOnButton("sapUiRtaAddIFrameDialogCancelButton");
	}

	function clickOnSave() {
		clickOnButton("sapUiRtaAddIFrameDialogSaveButton");
	}

	function updateSaveButtonEnablement(bEnabled) {
		oCore.byId("sapUiRtaAddIFrameDialogSaveButton").setEnabled(bEnabled);
		oCore.applyChanges();
	}

	function inputUrl(sUrl) {
		var oEditUrlTextArea = oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").$("inner");
		oEditUrlTextArea.focus();
		oEditUrlTextArea.val(sUrl);
		QUnitUtils.triggerEvent("input", oEditUrlTextArea);
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
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When AddIFrameDialog gets initialized and open is called in Update Mode,", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.strictEqual(this.oAddIFrameDialog._oDialog.getTitle(), oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_UPDATE_TITLE"), "then the correct title is set");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl, { updateMode: true });
		});

		QUnit.test("When AddIFrameDialog is opened then there should be no error value state", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJsonModel);
				assert.strictEqual(this.oController._areAllValueStatesNotErrors(), true, "Value states are correct");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When there is an error value state in AddIFrameDialog then it can be detected", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				aTextInputFields.concat(aNumericInputFields).forEach(function (sFieldName) {
					this.oAddIFrameDialog._oJsonModel = createJsonModel();
					this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJsonModel);
					this.oAddIFrameDialog._oJsonModel.getData()[sFieldName]["valueState"] = ValueState.Error;
					assert.strictEqual(this.oController._areAllValueStatesNotErrors(), false, "Detected " + sFieldName + " field's error value state");
				}, this);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When AddIFrameDialog is opened then the text input field should be empty", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJsonModel);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"",
					"then the text input field is empty"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When there is no empty text input field then it can be detected", function (assert) {
			var aTextInputFieldsCopy = aTextInputFields.slice();
			var sLastTextInputField = aTextInputFieldsCopy.pop();
			this.oAddIFrameDialog.attachOpened(function () {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJsonModel);
				aTextInputFieldsCopy.forEach(function (sFieldName) {
					this.oAddIFrameDialog._oJsonModel.getData()[sFieldName]["value"] = "Text entered";
					assert.strictEqual(this.oController._areAllTextFieldsValid(), false, "Some text input fields are still empty");
				}, this);
				this.oAddIFrameDialog._oJsonModel.getData()[sLastTextInputField]["value"] = "Text entered";
				assert.strictEqual(this.oController._areAllTextFieldsValid(), true, "No more empty text input field");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When parameters are passed to the dialog then they should be imported correctly", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var oData = this.oAddIFrameDialog._oJsonModel.getData();
				Object.keys(mParameters).forEach(function (sFieldName) {
					assert.strictEqual(oData[sFieldName].value, mParameters[sFieldName], sFieldName + " is imported correctly");
				});
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl, mParameters);
		});

		QUnit.test("When URL parameters are added then the frame URL is built correctly", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = this.oAddIFrameDialog._oController._addUrlParameter("firstParameter");
				inputUrl(sUrl);
				assert.strictEqual(sUrl.endsWith("firstParameter"), true, "Found firstParameter");

				sUrl = this.oAddIFrameDialog._oController._addUrlParameter("secondParameter");
				inputUrl(sUrl);
				assert.strictEqual(sUrl.endsWith("secondParameter"), true, "Found secondParameter");

				sUrl = this.oAddIFrameDialog._oController._addUrlParameter("secondParameter");
				inputUrl(sUrl);
				assert.strictEqual(sUrl.endsWith("secondParametersecondParameter"), true, "Found duplicate parameters");

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains parameters resolving to values containing special characters", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?{Options}/campaign={Campaign_Name}";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?yes%2Fno/campaign=Langnese%20Brand",
					"then the bindings in the url were resolved properly"
				);

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains only empty spaces", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "       ";
				inputUrl(sUrl);
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), "then the save button is disabled");
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialog_PreviewButton").getEnabled(), "then the preview button is disabled");
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"",
					"then the url is not set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Error",
					"then the error state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_INVALID"),
					"then the error message text is set correctly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains parameters inside JSON structures", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?{Options}/campaign={Campaign_Name}&bctx={'Product':'{Product}'}";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?yes%2Fno/campaign=Langnese%20Brand&bctx={'Product':'{Product}'}",
					"then the bindings in the url were resolved properly"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Warning",
					"then the warning state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_TEXT_JSON_ENCODING"),
					"then the warning message text is set correctly"
				);
				clickOnSave();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl)
				.then(function(mSettings) {
					assert.strictEqual(isEmptyObject(mSettings), false, "then the Dialog is closed and the settings are returned");
				});
		});

		QUnit.test("When URL contains an uneven amount of curly brackets", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?%/{{Test}Test}}}/{Hi}";
				inputUrl(sUrl);
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), "then the save button is disabled");
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialog_PreviewButton").getEnabled(), "then the preview button is disabled");
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"",
					"then the preview url is not set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Error",
					"then the error state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_UNEVEN_BRACKETS"),
					"then the error message text is set correctly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When the URL can't be encoded because of partial and wrong encoding", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				// the not encoded percent sign leads to the error
				var sUrl = "https://example.com?%/{Test}/%20Test";
				inputUrl(sUrl);
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), "then the save button is disabled");
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialog_PreviewButton").getEnabled(), "then the preview button is disabled");
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"",
					"then the preview url is not set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Error",
					"then the error state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_INVALID_ENCODING"),
					"then the error message text is set correctly"
				);
				clickOnSave();
				assert.ok(this.oAddIFrameDialog._oDialog, "then the dialog can't be saved");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL parameter values contain characters that need to be encoded", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com/{Product_Category}";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com/Ice%20Cream",
					"then the binding in the url is resolved properly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains valid parameters inside an expression binding", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com/campaign={=${Region}==='Germany'?'DE':'GL'}";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com/campaign=DE",
					"then the expression binding in the url is resolved properly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains invalid parameters (which can't be resolved)", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?{Potato}";
				inputUrl(sUrl);
				assert.ok(oCore.byId("sapUiRtaAddIFrameDialog_PreviewButton").getEnabled(), "then the preview button not is disabled");
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialog_PreviewButton").getEnabled(), "then the preview button is disabled");
				assert.ok(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), "then the save button is not disabled");
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?undefined",
					"then the binding could not be resolved"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Warning",
					"then the warning state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_TEXT_JSON_ENCODING"),
					"then the warning message text is set correctly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains valid parameters inside properly encoded JSON structures", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				// {Options} resolves to "yes/no" and {Product} resolves to "AC/DC Rocky Ice"
				var sUrl = "https://example.com?{Options}/campaign={Campaign_Name}&params=%7B'Product':'{Product}'%7D";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?yes%2Fno/campaign=Langnese%20Brand&params=%7B'Product':'AC%2FDC%20Rocky%20Ice'%7D",
					"then the bindings in the url were resolved properly"
				);

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains JSON structures without parameters", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?{Potato:'hello'}";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?{Potato:'hello'}",
					"then the JSON object could not be resolved"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Warning",
					"then the warning state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_WARNING_TEXT_JSON_ENCODING"),
					"then the warning message text is set correctly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL contains JSON structures that is encoded correctly", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?%7BPotato:'hello'%7D";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?%7BPotato:'hello'%7D",
					"then the preview url is generated properly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When URL is partially encoded", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var sUrl = "https://example.com?params=%7B'Product':'{Product}'%7D&💩";
				inputUrl(sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_PreviewLink").getText(),
					"https://example.com?params=%7B'Product':'AC%2FDC%20Rocky%20Ice'%7D&%F0%9F%92%A9",
					"then the special characters and bindings are encoded properly"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("When Cancel button is clicked", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl).then(function(mSettings) {
				assert.strictEqual(mSettings, undefined, "The promise returns no setting");
			});
		});

		QUnit.test("The Save-Button is only enabled when URL is entered", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				var oData = this.oAddIFrameDialog._oJsonModel.getData();
				var bEnabled = !!oData.frameUrl.value;
				assert.strictEqual(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), false, "Initial state is disabled");
				assert.strictEqual(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), bEnabled, "Initial state of URL-Textarea is empty");
				oData.frameUrl.value = "https:\\www.sap.com";
				bEnabled = !!oData.frameUrl.value;
				updateSaveButtonEnablement(!!oData.frameUrl.value);
				assert.strictEqual(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), bEnabled, "Button is enabled wheen URL-Textarea is not empty");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl);
		});

		QUnit.test("when a forbidden url is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var oUrlTextArea = oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA");
				// eslint-disable-next-line no-script-url
				oUrlTextArea.setValue("javascript:someJs");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());
				oCore.applyChanges();

				assert.strictEqual(oUrlTextArea.getValueState(), "Error", "then an error is displayed");
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), "then the save button is disabled");
				assert.notOk(oCore.byId("sapUiRtaAddIFrameDialog_PreviewButton").getEnabled(), "then the preview button is disabled");
				clickOnSave();
				assert.strictEqual(this.oAddIFrameDialog._oController.getSettings().frameUrl, "https_url", "then saving is not possible");
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueState(),
					"Error",
					"then the error state is set"
				);
				assert.strictEqual(
					oCore.byId("sapUiRtaAddIFrameDialog_EditUrlTA").getValueStateText(),
					oCore.getLibraryResourceBundle("sap.ui.rta").getText("IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_INVALID"),
					"then the error message text is set correctly"
				);
				clickOnCancel();
			}.bind(this));
			return this.oAddIFrameDialog.open(oDummyReferenceControl, mTestUrlBuilderData)
				.then(function(oResponse) {
					assert.strictEqual(oResponse, undefined, "then the dialog can only be closed via cancel");
				});
		});

		QUnit.test("When the Save button is clicked then the promise should return settings", function (assert) {
			this.oAddIFrameDialog.attachOpened(function () {
				inputUrl(mTestUrlBuilderData.frameUrl);
				aTextInputFields.forEach(function (sFieldName) {
					this.oAddIFrameDialog._oJsonModel.getData()[sFieldName]["value"] = "Text entered";
				}, this);
				clickOnSave();
			}, this);
			return this.oAddIFrameDialog.open(oDummyReferenceControl, mTestUrlBuilderData).then(function(mSettings) {
				assert.strictEqual(isEmptyObject(mSettings), false, "Non empty settings returned");
			});
		});

		QUnit.test("When OK button is clicked then the returned settings should be correct", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				var oData = this.oAddIFrameDialog._oJsonModel.getData();
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
			return this.oAddIFrameDialog.open(oDummyReferenceControl).then(function (mSettings) {
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
					var oData = this.oAddIFrameDialog._oJsonModel.getData();
					Object.keys(mData.expectedResults).forEach(function (sFieldName) {
						assert.strictEqual(oData[sFieldName].value, mData.expectedResults[sFieldName], sFieldName + " is imported correctly");
					});
					clickOnCancel();
				}, this);
				return this.oAddIFrameDialog.open(oDummyReferenceControl, mData.input);
			}, this);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
