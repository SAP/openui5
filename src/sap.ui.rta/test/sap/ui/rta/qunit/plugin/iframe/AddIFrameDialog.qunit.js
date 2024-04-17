/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Token",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/Utils",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Token,
	Element,
	Lib,
	coreLibrary,
	KeyCodes,
	FlUtils,
	Context,
	JSONModel,
	QUnitUtils,
	nextUIUpdate,
	AddIFrameDialog,
	AddIFrameDialogController,
	sinon
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const { ValueState } = coreLibrary;

	const sandbox = sinon.createSandbox();

	const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
	const aTextInputFields = ["frameUrl"];
	const aNumericInputFields = ["frameWidth", "frameHeight"];
	const aUnitsOfWidthMeasure = [{
		unit: "%",
		descriptionText: oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PERCENT_SECTION")
	}, {
		unit: "px",
		descriptionText: oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PX")
	}, {
		unit: "rem",
		descriptionText: oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_REM")
	}];
	const aUnitsOfHeightMeasure = [{
		unit: "vh",
		descriptionText: oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_VH")
	}, {
		unit: "px",
		descriptionText: oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_PX")
	}, {
		unit: "rem",
		descriptionText: oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_SELECT_ADDITIONAL_TEXT_REM")
	}];

	const oDefaultModelData = {
		Guid: "guid13423412342314",
		Region: "Germany",
		Year: 2020,
		Month: "July",
		ProductCategory: "Ice Cream",
		CampaignName: "Langnese Brand",
		BrandName: "Langnese"
	};
	const oDefaultModel = new JSONModel(oDefaultModelData);
	const oReferenceControl = new Button();
	oReferenceControl.setModel(oDefaultModel);
	oReferenceControl.setBindingContext(new Context(oDefaultModel, "/"));

	const aImportTestData = [{
		input: {
			asContainer: true,
			frameWidth: "16px",
			frameHeight: "9rem",
			frameUrl: "https_url"
		},
		expectedResults: {
			asContainer: true,
			frameWidth: 16,
			frameHeight: 9,
			frameWidthUnit: "px",
			frameHeightUnit: "rem",
			frameUrl: "https_url",
			unitsOfWidthMeasure: aUnitsOfWidthMeasure,
			unitsOfHeightMeasure: aUnitsOfHeightMeasure
		}
	}, {
		input: {
			frameWidth: "50.5%",
			frameHeight: "75.5vh"
		},
		expectedResults: {
			frameWidth: 50.5,
			frameHeight: 75.5,
			frameWidthUnit: "%",
			frameHeightUnit: "vh"
		}
	}];
	const mTestURLBuilderData = {
		asContainer: true,
		frameWidth: "16px",
		frameHeight: "9rem",
		frameUrl: "https_url",
		unitsOfWidthMeasure: aUnitsOfWidthMeasure,
		unitsOfHeightMeasure: aUnitsOfHeightMeasure,
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
			value: "Ice Cream" // Make sure this includes a whitespace to test encoding
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
		return new JSONModel({
			title: {
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
		const oButton = Element.getElementById(sId);
		QUnitUtils.triggerEvent("tap", oButton.getDomRef());
	}

	function clickOnCancel() {
		clickOnButton("sapUiRtaAddIFrameDialogCancelButton");
	}

	function clickOnSave() {
		clickOnButton("sapUiRtaAddIFrameDialogSaveButton");
	}

	async function updateSaveButtonEnablement(bEnabled) {
		Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").setEnabled(bEnabled);
		await nextUIUpdate();
	}

	QUnit.module("Given that a AddIFrameDialog is available...", {
		async before() {
			const mParameters = await AddIFrameDialog.buildUrlBuilderParametersFor(oReferenceControl);
			this.oDialogSettings = {
				parameters: mParameters,
				asContainer: true
			};
		},
		beforeEach() {
			this.oAddIFrameDialog = new AddIFrameDialog();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When AddIFrameDialog gets initialized and open is called,", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.strictEqual(
					this.oAddIFrameDialog._oDialog.getTitle(),
					oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_TITLE"),
					"then the correct title is set"
				);
				assert.strictEqual(this.oAddIFrameDialog._oDialog.getButtons().length, 2, "then 2 buttons are added");
				// eslint-disable-next-line max-nested-callbacks
				this.oDialogSettings.parameters.forEach((oParam) => {
					assert.strictEqual(
						oParam.value,
						oDefaultModelData[oParam.label],
						`Found ${oParam.key}`
					);
				});
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When AddIFrameDialog gets initialized and open is called in Update Mode,", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.strictEqual(
					this.oAddIFrameDialog._oDialog.getTitle(),
					oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_UPDATE_TITLE"),
					"then the correct title is set"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({ updateMode: true }, oReferenceControl);
		});

		QUnit.test("When AddIFrameDialog is opened then there should be no error value state", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
				assert.strictEqual(this.oController._areAllValueStateNones(), true, "Value states are correct");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When there is an error value state in AddIFrameDialog then it can be detected", function(assert) {
			function checkField(sFieldName) {
				this.oAddIFrameDialog._oJSONModel = createJSONModel();
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
				this.oAddIFrameDialog._oJSONModel.getData()[sFieldName].valueState = ValueState.Error;
				assert.strictEqual(this.oController._areAllValueStateNones(), false, `Detected ${sFieldName} field's error value state`);
			}
			this.oAddIFrameDialog.attachOpened(function() {
				aTextInputFields.concat(aNumericInputFields).forEach(checkField.bind(this));
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When AddIFrameDialog is opened then text input fields should be empty", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oData = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel)._oJSONModel.getData();
				assert.strictEqual(oData.frameUrl.value, "", "then the url input is empty");
				assert.strictEqual(oData.title.value, "Embedded Content", "then the default title is set");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When there is no empty text input field then it can be detected", function(assert) {
			const aTextInputFieldsCopy = aTextInputFields.slice();
			const sLastTextInputField = aTextInputFieldsCopy.pop();
			function checkField(sFieldName) {
				this.oAddIFrameDialog._oJSONModel.getData()[sFieldName].value = "Text entered";
				assert.notOk(this.oController._areAllTextFieldsValid(), "Some text input fields are still empty");
			}
			this.oAddIFrameDialog.attachOpened(function() {
				this.oController = new AddIFrameDialogController(this.oAddIFrameDialog._oJSONModel);
				aTextInputFieldsCopy.forEach((checkField.bind(this)));
				this.oAddIFrameDialog._oJSONModel.getData()[sLastTextInputField].value = "Text entered";
				assert.strictEqual(this.oController._areAllTextFieldsValid(), true, "No more empty text input field");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When parameters are passed to the dialog then they should be imported correctly", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oData = this.oAddIFrameDialog._oJSONModel.getData().parameters.value;
				const mParameters = this.oDialogSettings.parameters;
				assert.deepEqual(oData, mParameters, "then all fields are imported");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When URL parameters are added then the frame URL is built correctly", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				oUrlTextArea.setValue("someUrl");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter("{firstParameter}");
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{firstParameter}", "Found firstParameter");

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a parameter is added while there is a text selection in the edit field", function(assert) {
			this.oAddIFrameDialog.attachOpened(() => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oParameterList = Element.getElementById("sapUiRtaAddIFrameDialog_ParameterTable");
				oUrlTextArea.setValue("thisIsSomeUrl");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());

				return new Promise((resolve) => {
					// eslint-disable-next-line max-nested-callbacks
					oParameterList.attachEventOnce("itemPress", () => {
						assert.strictEqual(
							this.oAddIFrameDialog._oController._oJSONModel.getData().frameUrl.value,
							"thisIs{Guid}Url",
							"then the parameter replaces the text selection"
						);
						clickOnCancel();
						resolve();
					});

					oUrlTextArea.selectText(6, 10);
					QUnitUtils.triggerEvent("tap", oParameterList.getItems()[0].getDomRef());
				});
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When URL parameter values contain characters that need to be encoded", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const sUrl = "https://example.com/{ProductCategory}";
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				this.oAddIFrameDialog._oController.onShowPreview();
				const oIFrame = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
				assert.strictEqual(
					oIFrame.getUrl(),
					"https://example.com/Ice%20Cream",
					"then the preview url is encoded properly"
				);
				clickOnCancel();
			}, this);

			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When Show Preview is clicked then preview URL is built correctly", function(assert) {
			let sUrl;
			this.oAddIFrameDialog.attachOpened(async function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				oUrlTextArea.setValue("someUrl");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());
				this.oAddIFrameDialog._oController._oJSONModel.refresh();
				await nextUIUpdate();

				function checkParam(oParam) {
					sUrl = this.oAddIFrameDialog._oController._addURLParameter(oParam.key);
					this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				}
				this.oDialogSettings.parameters.forEach(checkParam.bind(this));
				sUrl = this.oAddIFrameDialog._oController._buildPreviewURL(
					this.oAddIFrameDialog._oJSONModel.getProperty("/frameUrl/value")
				);
				assert.strictEqual(
					sUrl,
					"someUrlguid13423412342314Germany2020JulyIce CreamLangnese BrandLangnese",
					"Preview URL is correct"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When Cancel button is clicked then the promise should return no setting", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				clickOnCancel();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
			assert.strictEqual(oResponse, undefined, "The promise returns no setting");
		});

		QUnit.test("The Save-Button is only enabled when URL is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oData = this.oAddIFrameDialog._oJSONModel.getData();
				const bButtonEnabledFirstUrl = !!oData.frameUrl.value;
				assert.notOk(Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(), "Initial state is disabled");
				assert.strictEqual(
					Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
					bButtonEnabledFirstUrl,
					"Initial state of URL-Textarea is empty"
				);
				oData.frameUrl.value = "https:\\www.sap.com";
				const bButtonEnabledSecondUrl = !!oData.frameUrl.value;
				updateSaveButtonEnablement(!!oData.frameUrl.value);
				assert.strictEqual(
					Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
					bButtonEnabledSecondUrl,
					"Button is enabled wheen URL-Textarea is not empty"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("when an url is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oPreviewButton = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewButton");
				assert.notOk(oPreviewButton.getEnabled(), "then the preview button is disabled before anything is entered");
				oUrlTextArea.setValue("someUrl");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());
				this.oAddIFrameDialog._oController._oJSONModel.refresh();
				await nextUIUpdate();
				assert.ok(oPreviewButton.getEnabled(), "then the preview button is enabled after url was entered");
				assert.strictEqual(
					Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
					true,
					"Then save is enabled after url was entered"
				);
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.notOk(oPreviewButton.getEnabled(), "then the preview button is disabled after refreshing the preview");
				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("when advanced settings switches are toggled", function(assert) {
			this.oAddIFrameDialog.attachOpened(() => {
				const oAllowFormsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowFormsSwitch");
				assert.strictEqual(oAllowFormsSwitch.getState(), true, "then the allow forms switch is enabled by default");
				const oAllowPopupsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowPopupsSwitch");
				assert.strictEqual(oAllowPopupsSwitch.getState(), true, "then the allow popups switch is enabled by default");
				const oAllowScriptsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowScriptsSwitch");
				assert.strictEqual(oAllowScriptsSwitch.getState(), true, "then the allow scripts switch is enabled by default");
				const oAllowModalsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowModalsSwitch");
				assert.strictEqual(oAllowModalsSwitch.getState(), true, "then the allow modals switch is enabled by default");
				const oAllowSameOriginSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowSameOriginSwitch");
				assert.strictEqual(oAllowSameOriginSwitch.getState(), true, "then the allow same origin switch is disabled by default");
				const oAllowTopNavigationSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowTopNavigationSwitch");
				assert.strictEqual(
					oAllowTopNavigationSwitch.getState(),
					false,
					"then the allow top navigation switch is disabled by default"
				);
				const oAllowDownloadsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowDownloadsSwitch");
				assert.strictEqual(oAllowDownloadsSwitch.getState(), false, "then the allow downloads switch is disabled by default");
				const oAllowDownloadsWithoutUserActivationSwitch = Element.getElementById(
					"sapUiRtaAddIFrameDialog_allowDownloadsWithoutUserActivationSwitch"
				);
				assert.strictEqual(
					oAllowDownloadsWithoutUserActivationSwitch.getState(),
					false,
					"then the allow downloads without user activation switch is disabled by default"
				);
				const oAdditionalParametersInput = Element.getElementById("sapUiRtaAddIFrameDialog_AddAdditionalParametersInput");
				assert.strictEqual(oAdditionalParametersInput.getValue(), "", "then the additional parameters input is empty by default");
				assert.strictEqual(
					oAdditionalParametersInput.getTokens().length,
					0,
					"then the additional parameters input has no tokens by default"
				);

				const oAdvancedSettings = this.oAddIFrameDialog._oJSONModel.getProperty("/advancedSettings/value");
				assert.strictEqual(oAdvancedSettings.allowForms, true, "then the model is set correctly");
				oAllowFormsSwitch.setState(false);
				assert.strictEqual(oAdvancedSettings.allowForms, false, "then the model is updated correctly");

				oAdditionalParametersInput.setValue("allow-pointer-lock");
				QUnitUtils.triggerKeydown(oAdditionalParametersInput.getFocusDomRef(), KeyCodes.ENTER);
				const oToken = oAdditionalParametersInput.getTokens()[0];
				assert.strictEqual(oToken.getText(), "allow-pointer-lock", "then the token is added");
				assert.strictEqual(
					oAdvancedSettings.additionalSandboxParameters[0],
					"allow-pointer-lock",
					"then the model is set correctly"
				);
				oToken.fireDelete();
				assert.strictEqual(oAdvancedSettings.additionalSandboxParameters.length, 0, "then model is updated correctly");

				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When the sandbox parameters are updated", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oPreviewButton = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewButton");
				const oAllowFormsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowFormsSwitch");
				const oPreviewIframe = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
				oUrlTextArea.setValue("https://example.com");
				this.oAddIFrameDialog._oController.onShowPreview();
				await nextUIUpdate();
				assert.strictEqual(oPreviewIframe.getDomRef().sandbox.contains("allow-forms"), true, "then the property is set correctly");
				oAllowFormsSwitch.setState(false);
				oAllowFormsSwitch.fireChange();
				await nextUIUpdate();
				assert.ok(oPreviewButton.getEnabled(), "then the preview button is enabled after sandbox parameter was updated");
				this.oAddIFrameDialog._oController.onShowPreview();
				await nextUIUpdate();
				assert.strictEqual(oPreviewIframe.getDomRef().sandbox.contains("allow-forms"), false, "then the property is set correctly");
				assert.notOk(oPreviewButton.getEnabled(), "then the preview button is disabled after refreshing the preview");
				clickOnCancel();
			}.bind(this));
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("when you enter an invalid url", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				oUrlTextArea.attachEventOnce("validateFieldGroup", () => {
					assert.strictEqual(oUrlTextArea.getValueState(), ValueState.Error, "then an error is displayed");
					this.oAddIFrameDialog._oController.onShowPreview();
					assert.strictEqual(
						this.oAddIFrameDialog._oJSONModel.getProperty("/previewUrl/value"),
						"",
						"then the preview is not updated"
					);
					assert.strictEqual(
						Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
						false,
						"then the save button is disabled"
					);
				});
				// eslint-disable-next-line no-script-url
				oUrlTextArea.setValue("javascript:someJs");
				oUrlTextArea.getFocusDomRef().focus();

				setTimeout(() => {
					oSaveButton.getFocusDomRef().focus();
					clickOnSave();
				}, 0);
				clickOnCancel();
			}.bind(this));
			const oResponse = await this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
			assert.strictEqual(oResponse, undefined, "then the dialog can only be closed via cancel");
		});

		QUnit.test("when an empty string is entered as url", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				oUrlTextArea.attachEventOnce("validateFieldGroup", () => {
					assert.strictEqual(oUrlTextArea.getValueState(), ValueState.Error, "then an error is displayed");
					this.oAddIFrameDialog._oController.onShowPreview();
					assert.strictEqual(
						this.oAddIFrameDialog._oJSONModel.getProperty("/previewUrl/value"),
						"",
						"then empty string is trimmed and the preview is not updated"
					);
					assert.strictEqual(
						Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
						false,
						"then the save button is disabled"
					);
				});

				// Set a value beforehand to ensure that the empty string is really refused as input
				oUrlTextArea.setValue("someValue");
				oUrlTextArea.setValue("   ");
				oUrlTextArea.getFocusDomRef().focus();

				setTimeout(() => {
					oSaveButton.getFocusDomRef().focus();
					clickOnSave();
				}, 0);
				clickOnCancel();
			}.bind(this));
			const oResponse = await this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
			assert.strictEqual(oResponse, undefined, "then the dialog can only be closed via cancel");
		});

		QUnit.test("when a url with bindings is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oPreviewButton = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewButton");
				oUrlTextArea.setValue("https://example.com/{ProductCategory}");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());
				await nextUIUpdate();

				assert.strictEqual(oUrlTextArea.getValueState(), ValueState.None, "then it is not showing an error");
				assert.ok(oPreviewButton.getEnabled(), "then the preview button is enabled after url was entered");
				this.oAddIFrameDialog._oController.onShowPreview();
				assert.notOk(oPreviewButton.getEnabled(), "then the preview button is disabled after refreshing the preview");
				clickOnCancel();
			}.bind(this));
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("when a url with a user model binding is entered", function(assert) {
			sandbox.stub(FlUtils, "getUshellContainer").returns({});
			sandbox.stub(FlUtils, "getUShellService").resolves({
				getUser: () => ({
					getEmail: () => "testuser@example.com",
					getFullName: () => "Test User",
					getFirstName: () => "Test",
					getLastName: () => "User"
				})
			});
			this.oAddIFrameDialog.attachOpened(async function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				oUrlTextArea.setValue("{$user>/fullName}");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());
				await nextUIUpdate();

				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oPreviewLink.getText(),
					"Test User",
					"then it is properly resolved"
				);
				clickOnCancel();
			}.bind(this));
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("when a url with an expression binding is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				oUrlTextArea.setValue("{= ${ProductCategory}}");
				QUnitUtils.triggerEvent("input", oUrlTextArea.getFocusDomRef());
				await nextUIUpdate();

				this.oAddIFrameDialog._oController.onShowPreview();
				assert.strictEqual(
					oPreviewLink.getText(),
					"Ice Cream",
					"then it is properly resolved"
				);
				clickOnCancel();
			}.bind(this));
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("When OK button is clicked then the promise should return settings", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				aTextInputFields.forEach(function(sFieldName) {
					this.oAddIFrameDialog._oJSONModel.getData()[sFieldName].value = "Text entered";
				}, this);
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(
				{
					frameUrl: "test_url"
				},
				oReferenceControl
			);
			assert.strictEqual(
				oResponse.frameHeightUnit,
				"vh",
				"then vh is selected as the default frame height unit"
			);
		});

		QUnit.test("When OK button is clicked then the returned settings should be correct", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oData = this.oAddIFrameDialog._oJSONModel.getData();
				oData.frameUrl.value = "https://www.sap.com/\tindex.html\r\n";
				aNumericInputFields.forEach(function(sFieldName) {
					oData[sFieldName].value = 100;
				});
				oData.frameWidthUnit.value = "rem";
				oData.frameHeightUnit.value = "vh";
				updateSaveButtonEnablement(!!oData.frameUrl.value);
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(
				this.oDialogSettings,
				oReferenceControl
			);

			assert.strictEqual(oResponse.frameUrl, "https://www.sap.com/index.html", "Setting for frameUrl is correct");
			aNumericInputFields.forEach(function(sFieldName) {
				assert.strictEqual(oResponse[sFieldName], 100, `Setting for ${sFieldName} is correct`);
			});
			assert.strictEqual(oResponse.frameWidthUnit, "rem", "Setting for frameWidthUnit is correct");
			assert.strictEqual(oResponse.frameHeightUnit, "vh", "Setting for frameHeightUnit is correct");
		});

		aImportTestData.forEach(function(mData, iIndex) {
			QUnit.test(`When existing settings are passed to the dialog then they should be imported correctly, part ${iIndex + 1}`, function(assert) {
				this.oAddIFrameDialog.attachOpened(function() {
					const oData = this.oAddIFrameDialog._oJSONModel.getData();
					function checkField(sFieldName) {
						if (Array.isArray(oData[sFieldName])) {
							assert.deepEqual(oData[sFieldName], mData.expectedResults[sFieldName], `${sFieldName} is imported correctly`);
						} else {
							assert.strictEqual(oData[sFieldName].value, mData.expectedResults[sFieldName], `${sFieldName} is imported correctly`);
						}
					}
					Object.keys(mData.expectedResults).forEach(checkField);
					clickOnCancel();
				}, this);
				return this.oAddIFrameDialog.open(mData.input, oReferenceControl);
			});
		});

		QUnit.test("When existing settings contain % values for the section height", async function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oHeightValueArea = Element.getElementById("sapUiRtaAddIFrameDialog_HeightInput");
				oHeightValueArea.setValue("50");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				await nextUIUpdate();
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open({
				asContainer: true,
				frameWidth: "16px",
				frameHeight: "100%",
				frameUrl: "some_url"
			}, oReferenceControl);

			assert.strictEqual(
				oResponse.frameHeight,
				50,
				"then the frame height value is modified"
			);
			assert.strictEqual(
				oResponse.frameHeightUnit,
				"%",
				"then the frame height unit isn't touched if it wasn't modified"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
