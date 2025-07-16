/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/base/Event",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/Utils",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Event,
	Element,
	Lib,
	coreLibrary,
	KeyCodes,
	FlUtils,
	Context,
	JSONModel,
	ODataModel,
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

	function setTextAreaValue(oDialog, sValue) {
		const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
		return new Promise((resolve) => {
			oUrlTextArea.attachEventOnce("validateFieldGroup", resolve);

			// Trigger focusin directly since the FieldGroup only reacts on focusin/focusout
			// which is not always triggered/bubbled in regular .focus() flows
			QUnitUtils.triggerEvent("focusin", oUrlTextArea.getFocusDomRef());
			oUrlTextArea.setValue(sValue);
			// Timeout is explicitly required by the field group before accepting further focus events, otherwise
			// the events are aggregated and the validation is not triggered because it doesn't count as a change
			// This can be removed when the dialog no longer relies on onValidationSuccess/Error
			setTimeout(() => {
				// Simulate focus loss on the input to trigger the validation
				QUnitUtils.triggerEvent("focusin", oDialog.getFocusDomRef());
			});
		});
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
			this.oAddIFrameDialog.attachOpened(async () => {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({key: "{firstParameter}"});
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{firstParameter}", "Found firstParameter");

				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a V4 model Edm.String property URL parameter is added then the frame URL is built like with V2 model", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({key: "{stringParameter}", type: "Edm.String"});
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{stringParameter}", "Found stringParameter");

				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a V4 model Edm.Boolean property URL parameter is added then the frame URL sets its type to 'any'", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({key: "{booleanParameter}", type: "Edm.Boolean"});
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{path:'booleanParameter',targetType:'any'}", "URL parameter is built correctly");

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a parameter is added while there is a text selection in the edit field", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oParameterList = Element.getElementById("sapUiRtaAddIFrameDialog_ParameterTable");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "thisIsSomeUrl");
				QUnitUtils.triggerEvent("tap", Element.getElementById("sapUiRtaAddIFrameDialog_ShowParametersButton").getFocusDomRef());
				await nextUIUpdate();

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
				this.oAddIFrameDialog._oController.onPreviewPress();
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

		QUnit.test("When URL is changed then preview URL is built correctly", function(assert) {
			let sUrl;
			this.oAddIFrameDialog.attachOpened(async function() {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");

				function checkParam(oParam) {
					sUrl = this.oAddIFrameDialog._oController._addURLParameter({key: oParam.key});
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

		QUnit.test("when advanced settings switches are toggled", function(assert) {
			this.oAddIFrameDialog.attachOpened(() => {
				const oAllowFormsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowFormsSwitch");
				assert.strictEqual(oAllowFormsSwitch.getState(), true, "then the allow forms switch is enabled by default");
				const oAllowScriptsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowScriptsSwitch");
				assert.strictEqual(oAllowScriptsSwitch.getState(), true, "then the allow scripts switch is enabled by default");
				const oAllowSameOriginSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowSameOriginSwitch");
				assert.strictEqual(oAllowSameOriginSwitch.getState(), true, "then the allow same origin switch is disabled by default");
				const oAllowPopupsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowPopupsSwitch");
				assert.strictEqual(oAllowPopupsSwitch.getState(), false, "then the allow popups switch is disabled by default");
				const oAllowModalsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowModalsSwitch");
				assert.strictEqual(oAllowModalsSwitch.getState(), false, "then the allow modals switch is disabled by default");
				const oAllowTopNavigationSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowTopNavigationSwitch");
				assert.strictEqual(
					oAllowTopNavigationSwitch.getState(),
					false,
					"then the allow top navigation switch is disabled by default"
				);
				const oAllowDownloadsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowDownloadsSwitch");
				assert.strictEqual(oAllowDownloadsSwitch.getState(), false, "then the allow downloads switch is disabled by default");
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
			this.oAddIFrameDialog.attachOpened(async () => {
				const oAllowFormsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowFormsSwitch");
				const oPreviewIframe = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");
				oAllowFormsSwitch.setState(true);
				this.oAddIFrameDialog._oController.onPreviewPress();
				await nextUIUpdate();
				assert.strictEqual(oPreviewIframe.getDomRef().sandbox.contains("allow-forms"), true, "then the property is set correctly");
				oAllowFormsSwitch.setState(false);
				oAllowFormsSwitch.fireChange();
				this.oAddIFrameDialog._oController.onPreviewPress();
				await nextUIUpdate();
				assert.strictEqual(oPreviewIframe.getDomRef().sandbox.contains("allow-forms"), false, "then the property is set correctly");
				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("when you enter an invalid url", async function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const sPreviousUrlPreview = this.oAddIFrameDialog._oJSONModel.getProperty("/previewUrl/value");

				// eslint-disable-next-line no-script-url
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "javascript:someJs");
				this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(oUrlTextArea.getValueState(), ValueState.Error, "then an error is displayed");
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/previewUrl/value"),
					sPreviousUrlPreview,
					"then the preview is not updated"
				);
				assert.strictEqual(
					oSaveButton.getEnabled(),
					false,
					"then the save button is disabled"
				);

				clickOnCancel();
			});
			const oResponse = await this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
			assert.strictEqual(oResponse, undefined, "then the dialog can only be closed via cancel");
		});

		QUnit.test("when an empty string is entered as url", async function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const sPreviousUrlPreview = this.oAddIFrameDialog._oJSONModel.getProperty("/previewUrl/value");

				// Set a value beforehand to ensure that the empty string is really refused as input
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someValue");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "   ");

				assert.strictEqual(oUrlTextArea.getValueState(), ValueState.Error, "then an error is displayed");
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/previewUrl/value"),
					sPreviousUrlPreview,
					"then the preview is not updated"
				);
				assert.strictEqual(
					Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);
				clickOnCancel();
			});
			const oResponse = await this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
			assert.strictEqual(oResponse, undefined, "then the dialog can only be closed via cancel");
		});

		QUnit.test("when a url with bindings is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");

				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl/{ProductCategory}");

				assert.strictEqual(oUrlTextArea.getValueState(), ValueState.None, "then it is not showing an error");
				clickOnCancel();
			});
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
			this.oAddIFrameDialog.attachOpened(async () => {
				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "https://www.example.com/{$user>/fullName}");
				this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					"https://www.example.com/Test%20User",
					"then it is properly resolved"
				);
				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("when a url with an expression binding is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "https://www.example.com/{= ${ProductCategory}}");
				this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					"https://www.example.com/Ice%20Cream",
					"then it is properly resolved"
				);
				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("when a relative url is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "potato.html");
				this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					`${window.location.href.substring(0, window.location.href.indexOf("qunit/") + "qunit/".length)}potato.html`,
					"then the preview shows the full url"
				);
				clickOnCancel();
			});
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

		QUnit.test("When the dialog is opened in header mode (asContainer = false)", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				assert.notOk(
					Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle").getVisible(),
					"then the title section is not visible"
				);
				clickOnSave();
			}, this);

			const oResponse = await this.oAddIFrameDialog.open(
				{
					frameUrl: "test_url"
				},
				oReferenceControl
			);
			assert.strictEqual(
				oResponse.title,
				null,
				"then no title is set for header iframes (asContainer is false)"
			);
		});

		QUnit.test("When the iframe is opened without advancedSettings", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				aTextInputFields.forEach(function(sFieldName) {
					this.oAddIFrameDialog._oJSONModel.getData()[sFieldName].value = "Text entered";
					const oAllowFormsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowFormsSwitch");
					assert.strictEqual(oAllowFormsSwitch.getState(), true, "then the allow forms switch is enabled by default");
					const oAllowScriptsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowScriptsSwitch");
					assert.strictEqual(oAllowScriptsSwitch.getState(), true, "then the allow scripts switch is enabled by default");
					const oAllowSameOriginSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowSameOriginSwitch");
					assert.strictEqual(oAllowSameOriginSwitch.getState(), true, "then the allow same origin switch is disabled by default");
					const oAllowPopupsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowPopupsSwitch");
					assert.strictEqual(oAllowPopupsSwitch.getState(), false, "then the allow popups switch is disabled by default");
					const oAllowModalsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowModalsSwitch");
					assert.strictEqual(oAllowModalsSwitch.getState(), false, "then the allow modals switch is disabled by default");
					const oAllowTopNavigationSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowTopNavigationSwitch");
					assert.strictEqual(
						oAllowTopNavigationSwitch.getState(),
						false,
						"then the allow top navigation switch is disabled by default"
					);
					const oAllowDownloadsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowDownloadsSwitch");
					assert.strictEqual(oAllowDownloadsSwitch.getState(), false, "then the allow downloads switch is disabled by default");
					const oAdditionalParametersInput = Element.getElementById("sapUiRtaAddIFrameDialog_AddAdditionalParametersInput");
					assert.strictEqual(
						oAdditionalParametersInput.getValue(),
						"",
						"then the additional parameters input is empty by default"
					);
					assert.strictEqual(
						oAdditionalParametersInput.getTokens().length,
						0,
						"then the additional parameters input has no tokens by default"
					);
					const oAdvancedSettings = this.oAddIFrameDialog._oJSONModel.getProperty("/advancedSettings/value");
					assert.strictEqual(oAdvancedSettings.allowForms, true, "then the model is set correctly");
				}, this);
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(
				{
					frameUrl: "test_url"
				},
				oReferenceControl
			);
			assert.deepEqual(
				oResponse.advancedSettings,
				{
					allowForms: true,
					allowScripts: true,
					allowSameOrigin: true,
					additionalSandboxParameters: []
				},
				"then the default parameters should be added to the settings"
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

		QUnit.test("When invalid values are entered in the title/width/height fields", async function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oTitleValueArea = Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle_TitleInput");
				const oWidthValueArea = Element.getElementById("sapUiRtaAddIFrameDialog_WidthInput");
				const oHeightValueArea = Element.getElementById("sapUiRtaAddIFrameDialog_HeightInput");
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");

				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled at first");
				oTitleValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oTitleValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button is disabled for invalid title");
				oTitleValueArea.setValue("Title");
				QUnitUtils.triggerEvent("input", oTitleValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again");

				oWidthValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oWidthValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false,	"then the save button is disabled for invalid width");
				oWidthValueArea.setValue("10");
				QUnitUtils.triggerEvent("input", oWidthValueArea.getFocusDomRef());
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again");

				oHeightValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button is disabled for invalid height");
				oHeightValueArea.setValue("10");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again");

				oHeightValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				await nextUIUpdate();
				oTitleValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oTitleValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button is disabled with invalid title and height");
				oTitleValueArea.setValue("Title");
				QUnitUtils.triggerEvent("input", oTitleValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false,	"then the save button is still disabled after a title was entered");
				oHeightValueArea.setValue("10");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again");
				clickOnSave();
			}, this);
			await this.oAddIFrameDialog.open({
				asContainer: true,
				frameWidth: "16px",
				frameHeight: "100%",
				frameUrl: "some_url"
			}, oReferenceControl);
		});

		QUnit.test("When the size/unit of the iframe is changed", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oWidthValueInput = Element.getElementById("sapUiRtaAddIFrameDialog_WidthInput");
				const oHeightValueInput = Element.getElementById("sapUiRtaAddIFrameDialog_HeightInput");
				const oWidthUnitSelect = Element.getElementById("sapUiRtaAddIFrameDialog_WidthUnit");
				const oHeightUnitSelect = Element.getElementById("sapUiRtaAddIFrameDialog_HeightUnit");
				const oIFramePreview = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");

				// Simulate select - copied from Select.qunit.js
				// move to the second item with ARROW_DOWN (pre-select item) and execute tap.
				oWidthUnitSelect.focus();
				oWidthUnitSelect.open();
				QUnitUtils.triggerKeydown(oWidthUnitSelect.getDomRef(), KeyCodes.ARROW_DOWN);
				QUnitUtils.triggerEvent("tap", oWidthUnitSelect.getItems()[1].getDomRef());
				assert.strictEqual(oIFramePreview.getWidth(), "100px", "then the width of the preview is set to 100px");

				// Simulate user input - copied from StepInput.qunit.js
				const oWidthInnerInput = oWidthValueInput._getInput();
				oWidthInnerInput.focus();
				oWidthInnerInput.getDomRef("inner").value = 200;
				QUnitUtils.triggerKeydown(oWidthInnerInput.getDomRef(), KeyCodes.ENTER);
				assert.strictEqual(oIFramePreview.getWidth(), "200px", "then the width of the preview is set to 200px");

				oHeightUnitSelect.focus();
				oHeightUnitSelect.open();
				QUnitUtils.triggerKeydown(oHeightUnitSelect.getDomRef(), KeyCodes.ARROW_DOWN);
				QUnitUtils.triggerEvent("tap", oHeightUnitSelect.getItems()[2].getDomRef());
				assert.strictEqual(oIFramePreview.getHeight(), "35rem", "then the height of the preview is set to 35rem");

				const oHeightInnerInput = oHeightValueInput._getInput();
				oHeightInnerInput.focus();
				oHeightInnerInput.getDomRef("inner").value = 20;
				QUnitUtils.triggerKeydown(oHeightInnerInput.getDomRef(), KeyCodes.ENTER);
				assert.strictEqual(oIFramePreview.getHeight(), "20rem", "then the height of the preview is set to 20rem");
				clickOnSave();
			}, this);
			await this.oAddIFrameDialog.open({
				asContainer: true,
				frameUrl: "some_url"
			}, oReferenceControl);
		});
	});

	QUnit.module("Given that an IFrameDialog is opened for a control that uses an OData V4 Model...", {
		beforeEach() {
			this.oAddIFrameDialog = new AddIFrameDialog();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When AddIFrameDialog gets initialized and open is called,", async function(assert) {
			const sBindingPath = "/IceCream(0)/name";
			const oModel = new ODataModel({ serviceUrl: "DummyURL/" });
			oModel.getMetaModel = () => {
				return {
					getMetaPath: (sPath) => {
						assert.equal(sPath, sBindingPath, "then the binding path is passed as parameter");
						return "/IceCream";
					},
					requestObject: (sPath) => {
						assert.equal(sPath, "/IceCream/name/$Type", "then the property type is requested");
						return Promise.resolve("Edm.String");
					}
				};
			};
			const oV4Control = new Button();
			oV4Control.setModel(oModel);
			sandbox.stub(oV4Control, "getBindingContext").returns({
				getModel: () => oModel,
				getObject: () => {
					return {
						name: "Twister"
					};
				},
				getPath: () => sBindingPath

			});
			const mParameters = await AddIFrameDialog.buildUrlBuilderParametersFor(oV4Control);
			this.oDialogSettings = {
				parameters: mParameters,
				asContainer: true
			};

			this.oAddIFrameDialog.attachOpened(function() {
				this.oDialogSettings.parameters.forEach((oParam) => {
					assert.strictEqual(
						oParam.value,
						"Twister",
						`Found ${oParam.key}`
					);
					assert.strictEqual(
						oParam.type,
						"Edm.String",
						"and the type is set correctly"
					);
				});
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
