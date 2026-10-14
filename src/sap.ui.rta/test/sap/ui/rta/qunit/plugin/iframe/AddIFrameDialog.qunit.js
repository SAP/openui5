/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/util/FocusPolicy",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Context",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/rta/plugin/iframe/AddIFrameDialogController",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Element,
	Lib,
	coreLibrary,
	KeyCodes,
	FlexRuntimeInfoAPI,
	FocusPolicy,
	FlUtils,
	JSONModel,
	ODataModel,
	Context,
	nextUIUpdate,
	QUnitUtils,
	AddIFrameDialog,
	AddIFrameDialogController,
	Utils,
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
		BrandName: "Langnese",
		"@odata.context": "metadataIceCream"
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
				assert.notOk(
					Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle").getVisible(),
					"then the title field is not visible in update mode"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({ updateMode: true }, oReferenceControl);
		});

		QUnit.test("When AddIFrameDialog is opened in Update Mode for a container/subsection with a title,", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				assert.notOk(
					Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle").getVisible(),
					"then the title field is not visible even though the iFrame has a title (rename via standard rename)"
				);
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/showTitle/value"),
					false,
					"then the showTitle flag is false in update mode"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({
				updateMode: true,
				asContainer: true,
				title: "My Section",
				frameUrl: "https://myhappyurl"
			}, oReferenceControl);
		});

		QUnit.test("When AddIFrameDialog is opened in add mode for a subsection (asContainer=true),", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oTitleVBox = Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle");
				const oTitleInput = Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle_TitleInput");
				assert.ok(oTitleVBox.getVisible(), "then the title field is visible");
				assert.ok(oTitleInput.getEnabled(), "then the title field is enabled/editable");
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/showTitle/value"),
					true,
					"then the showTitle flag is true when adding as a section/subsection"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({ asContainer: true }, oReferenceControl);
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

		QUnit.test("When the dialog opens in add mode (asContainer=true), originalValue is set to the default title", function(assert) {
			const sDefaultTitle = oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_CONTAINER_TITLE_DEFAULT_VALUE_TEXT");
			this.oAddIFrameDialog.attachOpened(function() {
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/title/originalValue"),
					sDefaultTitle,
					"then originalValue matches the default container title"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When existing settings with a title are imported, originalValue is set to the existing title", function(assert) {
			const sExistingTitle = "My Existing Title";
			this.oAddIFrameDialog.attachOpened(function() {
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/title/originalValue"),
					sExistingTitle,
					"then originalValue is set to the imported title value"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({
				asContainer: true,
				title: sExistingTitle,
				frameUrl: "https://myhappyurl"
			}, oReferenceControl);
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
				assert.strictEqual(this.oAddIFrameDialog._oJSONModel.iSizeLimit, 1000, "then the JSON model size limit is 1000");
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

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({ key: "{firstParameter}" });
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{firstParameter}", "Found firstParameter");

				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a V4 model Edm.String property URL parameter is added then the frame URL is built like with V2 model", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({ key: "{stringParameter}", type: "Edm.String" });
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{stringParameter}", "Found stringParameter");

				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a V4 model Edm.Boolean property URL parameter is added then the frame URL sets its type to 'any'", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "someUrl");

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({ key: "{booleanParameter}", type: "Edm.Boolean" });
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "someUrl{path:'booleanParameter',targetType:'any'}", "URL parameter is built correctly");

				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a parameter starting with '@' is added then the frame URL uses expression binding syntax", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "https://myhappyurl/");

				const sUrl = this.oAddIFrameDialog._oController._addURLParameter({ key: "{@odata.context}" });
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				assert.strictEqual(sUrl, "https://myhappyurl/{=%{@odata.context}}", "URL parameter uses expression binding syntax");

				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				await this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					"https://myhappyurl/metadataIceCream",
					"Resolved URL contains @odata.context value"
				);

				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When a parameter is added while there is a text selection in the edit field", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
				const oParameterList = Element.getElementById("sapUiRtaAddIFrameDialog_ParameterTable");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "thisIsSomeUrl");
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

		QUnit.test("When the parameters info button is pressed then an explanation popover is shown", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oInfoButton = Element.getElementById("sapUiRtaAddIFrameDialog_ParametersInfoButton");
				assert.ok(oInfoButton, "then the info button is available");
				assert.strictEqual(
					oInfoButton.getIcon(), "sap-icon://message-information",
					"then it uses the information icon"
				);
				assert.strictEqual(
					oInfoButton.getTooltip(), oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PARAMETERS_INFO_TOOLTIP"),
					"then it has the correct tooltip"
				);
				const oPopover = Element.getElementById("sapUiRtaAddIFrameDialog_ParametersInfoPopover");
				assert.ok(oPopover, "then the info popover exists as a dependent of the dialog");
				assert.notOk(oPopover.isOpen(), "then the popover is initially closed");
				oPopover.attachEventOnce("afterOpen", function() {
					assert.ok(oPopover.isOpen(), "then the popover opens when the info button is pressed");
					assert.strictEqual(
						oPopover.getContent()[0].getText(),
						oTextResources.getText("IFRAME_ADDIFRAME_DIALOG_PARAMETERS_INFO_TEXT"),
						"then the popover shows the parameters explanation text"
					);
					oPopover.close();
					clickOnCancel();
				});
				clickOnButton("sapUiRtaAddIFrameDialog_ParametersInfoButton");
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});

		QUnit.test("When URL parameter values contain characters that need to be encoded", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const sUrl = "https://myhappyurl/{ProductCategory}";
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				await this.oAddIFrameDialog._oController.onPreviewPress();
				const oIFrame = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
				assert.strictEqual(
					oIFrame.getUrl(),
					"https://myhappyurl/Ice%20Cream",
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
					sUrl = this.oAddIFrameDialog._oController._addURLParameter({ key: oParam.key });
					this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				}
				this.oDialogSettings.parameters.forEach(checkParam.bind(this));
				sUrl = await this.oAddIFrameDialog._oController._buildPreviewURL(
					this.oAddIFrameDialog._oJSONModel.getProperty("/frameUrl/value")
				);
				assert.strictEqual(
					sUrl,
					"someUrlguid13423412342314Germany2020JulyIce CreamLangnese BrandLangnesemetadataIceCream",
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

		QUnit.test("The Save button is only enabled when URL is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oData = this.oAddIFrameDialog._oJSONModel.getData();
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const bButtonEnabledFirstUrl = !!oData.frameUrl.value;
				assert.notOk(oSaveButton.getEnabled(), "Initial state is disabled");
				assert.strictEqual(
					oSaveButton.getEnabled(),
					bButtonEnabledFirstUrl,
					"Initial state of URL-Textarea is empty"
				);
				oData.frameUrl.value = "https://myhappyurl";
				const bButtonEnabledSecondUrl = !!oData.frameUrl.value;
				updateSaveButtonEnablement(!!oData.frameUrl.value);
				assert.strictEqual(
					oSaveButton.getEnabled(),
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
				await this.oAddIFrameDialog._oController.onPreviewPress();
				await nextUIUpdate();
				assert.ok(
					oPreviewIframe.getIFrameDomRef().sandbox.contains("allow-forms"),
					"then the property is set correctly"
				);
				oAllowFormsSwitch.setState(false);
				oAllowFormsSwitch.fireChange();
				await this.oAddIFrameDialog._oController.onPreviewPress();
				await nextUIUpdate();
				assert.notOk(
					oPreviewIframe.getIFrameDomRef().sandbox.contains("allow-forms"),
					"then the property is set correctly"
				);
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
				await this.oAddIFrameDialog._oController.onPreviewPress();
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

		QUnit.test("when an empty string is entered as title", async function(assert) {
			this.oAddIFrameDialog.attachOpened(() => {
				const oInput = Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle_TitleInput");
				oInput.setValue("   ");

				this.oAddIFrameDialog._oController.onContainerTitleChange({
					getSource: () => oInput
				});
				assert.strictEqual(oInput.getValueState(), ValueState.Error, "then an error is displayed");
				assert.strictEqual(this.oAddIFrameDialog._oJSONModel.getProperty("/saveEnabled"), false, "the save button is disabled");
				assert.strictEqual(
					Element.getElementById("sapUiRtaAddIFrameDialogSaveButton").getEnabled(),
					false, "then the save button is disabled"
				);
				clickOnCancel();
			});
			const oResponse = await this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl, {
				validators: ["noEmptyText"]
			});
			assert.strictEqual(oResponse, undefined, "then the dialog can only be closed via cancel");
		});

		QUnit.test("when the title is unchanged (sameTextError), save is blocked but no error state is shown", async function(assert) {
			const sExistingTitle = "My Section";
			this.oAddIFrameDialog.attachOpened(() => {
				const oInput = Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle_TitleInput");

				// Type the same text as the original title — triggers sameTextError
				oInput.setValue(sExistingTitle);
				this.oAddIFrameDialog._oController.onContainerTitleChange({
					getSource: () => oInput
				});
				assert.strictEqual(
					oInput.getValueState(),
					ValueState.None,
					"then the input field shows no error (sameTextError is silent)"
				);
				assert.strictEqual(
					this.oAddIFrameDialog._oJSONModel.getProperty("/saveEnabled"),
					false,
					"then the save button is disabled"
				);
				clickOnCancel();
			});
			await this.oAddIFrameDialog.open({
				asContainer: true,
				title: sExistingTitle,
				frameUrl: "https://myhappyurl"
			}, oReferenceControl);
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

		QUnit.test("when a url containing a binding is updated", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oUrlTextArea = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");

				// Updating from binding to binding should automatically remove the old binding so no data
				// leaks from the new binding into the old property
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "{ProductCategory}");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "{BrandName}");
				assert.strictEqual(
					oUrlTextArea.getModel().getData().ProductCategory,
					"Ice Cream",
					"then no incorrect data leaks into the model"
				);

				// Updating from binding to plain text should lead to manual removal of the old binding
				// in the controller, so the new plain text doesn't leak into the old binding property
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "{ProductCategory}");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "Plain text now");
				assert.strictEqual(
					oUrlTextArea.getModel().getData().ProductCategory,
					"Ice Cream",
					"then no incorrect data leaks into the model"
				);

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
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "https://myhappyurl/{$user>/fullName}");
				await this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					"https://myhappyurl/Test%20User",
					"then it is properly resolved"
				);
				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("when a url with an expression binding is entered", function(assert) {
			this.oAddIFrameDialog.attachOpened(async () => {
				const oPreviewLink = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "https://myhappyurl/{= ${ProductCategory}}");
				await this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					"https://myhappyurl/Ice%20Cream",
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
				await this.oAddIFrameDialog._oController.onPreviewPress();
				assert.strictEqual(
					oPreviewLink.getText(),
					`${window.location.href.substring(0, window.location.href.indexOf("qunit/") + "qunit/".length)}potato.html`,
					"then the preview shows the full url"
				);
				clickOnCancel();
			});
			return this.oAddIFrameDialog.open(mTestURLBuilderData, oReferenceControl);
		});

		QUnit.test("When Save button is clicked then the promise should return settings", async function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				// Make a change to enable the Save button
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "new_url");
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
			this.oAddIFrameDialog.attachOpened(async function() {
				assert.notOk(
					Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle").getVisible(),
					"then the title section is not visible"
				);
				// Make a change to enable the Save button
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "new_url");
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
			this.oAddIFrameDialog.attachOpened(async function() {
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

				// Make a change to enable the Save button
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "new_url");
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
			this.oAddIFrameDialog.attachOpened(async function() {
				const oData = this.oAddIFrameDialog._oJSONModel.getData();
				oData.frameUrl.value = "https://myhappyurl/\tindex.html\r\n";
				aNumericInputFields.forEach(function(sFieldName) {
					oData[sFieldName].value = 100;
				});
				oData.frameWidthUnit.value = "rem";
				oData.frameHeightUnit.value = "vh";
				// Make a change to enable the Save button
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "new_url");
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(
				this.oDialogSettings,
				oReferenceControl
			);

			assert.strictEqual(oResponse.frameUrl, "new_url", "Setting for frameUrl is correct");
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

				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button is disabled when the dialog is opened");

				oTitleValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oTitleValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button is disabled for invalid title");
				oTitleValueArea.setValue("Title");
				QUnitUtils.triggerEvent("input", oTitleValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again for valid title");

				oWidthValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oWidthValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false,	"then the save button is disabled for invalid width");
				oWidthValueArea.setValue("10");
				QUnitUtils.triggerEvent("input", oWidthValueArea.getFocusDomRef());
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again for valid width");

				oHeightValueArea.setValue("");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button is disabled for invalid height");
				oHeightValueArea.setValue("10");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again for valid height");

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
				assert.strictEqual(oSaveButton.getEnabled(), false,	"then the save button is still disabled after valid title was entered");
				oHeightValueArea.setValue("10");
				QUnitUtils.triggerEvent("input", oHeightValueArea.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled again for valid height");
				clickOnSave();
			}, this);
			await this.oAddIFrameDialog.open({
				asContainer: true,
				frameWidth: "16px",
				frameHeight: "100%",
				frameUrl: "some_url"
			},
			oReferenceControl,
			{
				validators: ["noEmptyText"]
			});
		});

		QUnit.test("When the size/unit of the iframe is changed", async function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oWidthValueInput = Element.getElementById("sapUiRtaAddIFrameDialog_WidthInput");
				const oHeightValueInput = Element.getElementById("sapUiRtaAddIFrameDialog_HeightInput");
				const oWidthUnitSelect = Element.getElementById("sapUiRtaAddIFrameDialog_WidthUnit");
				const oHeightUnitSelect = Element.getElementById("sapUiRtaAddIFrameDialog_HeightUnit");
				const oModel = this.oAddIFrameDialog._oJSONModel;
				const oIFramePreview = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");

				// Simulate select - copied from Select.qunit.js
				// move to the second item with ARROW_DOWN (pre-select item) and execute tap.
				oWidthUnitSelect.focus();
				oWidthUnitSelect.open();
				QUnitUtils.triggerKeydown(oWidthUnitSelect.getDomRef(), KeyCodes.ARROW_DOWN);
				QUnitUtils.triggerEvent("tap", oWidthUnitSelect.getItems()[1].getDomRef());
				assert.strictEqual(oModel.getProperty("/frameWidthUnit/value"), "px", "then the width unit of the model is set to px");
				assert.strictEqual(oIFramePreview.getWidth(), "100px", "then the width of the preview is set to 100px");

				// Simulate user input - copied from StepInput.qunit.js
				const oWidthInnerInput = oWidthValueInput._getNumericInput()._getInput();
				oWidthInnerInput.focus();
				oWidthInnerInput.getDomRef("inner").value = 200;
				QUnitUtils.triggerKeydown(oWidthInnerInput.getDomRef(), KeyCodes.ENTER);
				assert.strictEqual(oModel.getProperty("/frameWidth/value"), 200, "then the width value of the model is set to 200");
				assert.strictEqual(oIFramePreview.getWidth(), "200px", "then the width of the preview is set to 200px");

				oHeightUnitSelect.focus();
				oHeightUnitSelect.open();
				QUnitUtils.triggerKeydown(oHeightUnitSelect.getDomRef(), KeyCodes.ARROW_DOWN);
				QUnitUtils.triggerEvent("tap", oHeightUnitSelect.getItems()[2].getDomRef());
				assert.strictEqual(oModel.getProperty("/frameHeightUnit/value"), "rem", "then the height unit of the model is set to rem");
				assert.strictEqual(oIFramePreview.getHeight(), "35rem", "then the height of the preview is set to 35rem");

				const oHeightInnerInput = oHeightValueInput._getNumericInput()._getInput();
				oHeightInnerInput.focus();
				oHeightInnerInput.getDomRef("inner").value = 20;
				QUnitUtils.triggerKeydown(oHeightInnerInput.getDomRef(), KeyCodes.ENTER);
				assert.strictEqual(oModel.getProperty("/frameHeight/value"), 20, "then the height value of the model is set to 20");
				assert.strictEqual(oIFramePreview.getHeight(), "20rem", "then the height of the preview is set to 20rem");
				clickOnSave();
			}, this);
			await this.oAddIFrameDialog.open({
				asContainer: true,
				frameUrl: "some_url"
			}, oReferenceControl);
		});

		QUnit.test("when opened on a S/4HANA Cloud system", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getSystem").returns("S4HANA_CLOUD");
			sandbox.stub(Utils, "isS4HanaCloud").returns(true);

			const oDialog = new AddIFrameDialog();
			oDialog.attachOpened(function() {
				const oDocumentationLink = Element.getElementById("sapUiRtaAddIFrameDialog_UrlInfoMessageStrip").getLink();
				assert.strictEqual(
					oDocumentationLink.getHref(),
					"https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/8db25610e91342919fcf63d4e5868ae9.html",
					"then the system-specific help link is displayed"
				);
				clickOnCancel();
			}, this);
			await oDialog.open(this.oDialogSettings, oReferenceControl);
			oDialog.destroy();
		});
	});

	QUnit.module("Given that an IFrameDialog is opened for a control that uses an OData V4 Model...", {
		beforeEach() {
			this.oAddIFrameDialog = new AddIFrameDialog();
			this.sBindingPath = "/IceCream(0)/name";
			this.oModel = new ODataModel({ serviceUrl: "DummyURL/" });
			const oOriginalMetaModel = this.oModel.getMetaModel();
			this.oModel.getMetaModel = () => {
				oOriginalMetaModel.getMetaPath = () => {
					return "/IceCream";
				};
				oOriginalMetaModel.requestObject = () => {
					return Promise.resolve("Edm.String");
				};
				return oOriginalMetaModel;
			};
			this.oV4Control = new Button();
			this.oV4Control.setModel(this.oModel);
			sandbox.stub(this.oV4Control, "getBindingContext").returns({
				getModel: () => this.oModel,
				getObject: () => {
					return {
						name: "Twister"
					};
				},
				getPath: () => this.sBindingPath

			});
		},
		afterEach() {
			this.oAddIFrameDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When AddIFrameDialog gets initialized and open is called,", async function(assert) {
			const oOriginalMetaModel = this.oModel.getMetaModel();
			this.oModel.getMetaModel = () => {
				oOriginalMetaModel.getMetaPath = (sPath) => {
					assert.equal(sPath, this.sBindingPath, "then the binding path is passed as parameter");
					return "/IceCream";
				};
				oOriginalMetaModel.requestObject = (sPath) => {
					assert.equal(sPath, "/IceCream/name/$Type", "then the property type is requested");
					return Promise.resolve("Edm.String");
				};
				return oOriginalMetaModel;
			};
			const mParameters = await AddIFrameDialog.buildUrlBuilderParametersFor(this.oV4Control);
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

			await this.oAddIFrameDialog.open(this.oDialogSettings, this.oV4Control);
		});

		QUnit.test("When the URL is built with an OData V4 parameter", function(assert) {
			function checkEvent(sEventName, fnHandler, oListener) {
				if (sEventName === "change") {
					assert.ok(true, "then the change event is attached to the resolver");
					fnHandler.call(oListener);
				} else {
					this.attachEventOnce(sEventName, fnHandler, oListener);
				}
			}

			this.oAddIFrameDialog.attachOpened(async function() {
				const oResolver = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLinkResolver");
				const oGetBindingStub = sandbox.stub(oResolver, "getBinding").callsFake((...aArgs) => {
					const oBinding = oGetBindingStub.wrappedMethod.apply(oResolver, aArgs);
					sandbox.stub(oBinding, "attachEventOnce").callsFake(checkEvent.bind(oBinding));
					return oBinding;
				});
				const sUrl = "{IceCreamName}";
				this.oAddIFrameDialog._oJSONModel.setProperty("/frameUrl/value", sUrl);
				await this.oAddIFrameDialog._oController.onPreviewPress();
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, this.oV4Control);
		});
	});

	QUnit.module("Given that an AddIFrameDialog is opened to test configuration change detection...", {
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
		const mDefaultSettings = {
			asContainer: true,
			frameUrl: "https://myhappyurl",
			frameWidth: "100%",
			frameHeight: "50vh"
		};

		QUnit.test("When no changes are made, the Save button should be disabled", function(assert) {
			this.oAddIFrameDialog.attachOpened(function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled when no changes are made");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When the URL is changed and reverted", function(assert) {
			const sOriginalUrl = "https://myhappyurl";
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");

				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "myNewUrl");
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after URL change");

				await setTextAreaValue(this.oAddIFrameDialog._oDialog, sOriginalUrl);
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled when URL is reverted");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({ ...mDefaultSettings, frameUrl: sOriginalUrl }, oReferenceControl);
		});

		QUnit.test("When the frame width is changed and reverted", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const oWidthInput = Element.getElementById("sapUiRtaAddIFrameDialog_WidthInput");
				const oInnerInput = oWidthInput._getNumericInput()._getInput();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");

				oInnerInput.focus();
				oInnerInput.getDomRef("inner").value = 50;
				QUnitUtils.triggerKeydown(oInnerInput.getDomRef(), KeyCodes.ENTER);
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after width change");

				oInnerInput.getDomRef("inner").value = 100;
				QUnitUtils.triggerKeydown(oInnerInput.getDomRef(), KeyCodes.ENTER);
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled when width is reverted");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When the frame height unit is changed and reverted", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const oHeightUnitSelect = Element.getElementById("sapUiRtaAddIFrameDialog_HeightUnit");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");

				oHeightUnitSelect.focus();
				oHeightUnitSelect.open();
				QUnitUtils.triggerKeydown(oHeightUnitSelect.getDomRef(), KeyCodes.ARROW_DOWN);
				QUnitUtils.triggerEvent("tap", oHeightUnitSelect.getItems()[1].getDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after height unit change");

				oHeightUnitSelect.focus();
				oHeightUnitSelect.open();
				QUnitUtils.triggerKeydown(oHeightUnitSelect.getDomRef(), KeyCodes.ARROW_UP);
				QUnitUtils.triggerEvent("tap", oHeightUnitSelect.getItems()[0].getDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled when height unit is reverted");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When an advanced setting switch is toggled and reverted", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const oAllowPopupsSwitch = Element.getElementById("sapUiRtaAddIFrameDialog_allowPopupsSwitch");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");

				oAllowPopupsSwitch.setState(true);
				oAllowPopupsSwitch.fireChange();
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after toggling switch on");

				oAllowPopupsSwitch.setState(false);
				oAllowPopupsSwitch.fireChange();
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled after reverting switch");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When a sandbox parameter token is added and removed", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const oParametersInput = Element.getElementById("sapUiRtaAddIFrameDialog_AddAdditionalParametersInput");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");

				oParametersInput.setValue("allow-pointer-lock");
				QUnitUtils.triggerKeydown(oParametersInput.getFocusDomRef(), KeyCodes.ENTER);
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after adding parameter");

				oParametersInput.getTokens()[0].fireDelete();
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled after removing parameter");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When the allow focus checkbox is toggled and reverted", function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(true);
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const oCheckBox = Element.getElementById("sapUiRtaAddIFrameDialog_AllowFocusCheckBox");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");
				assert.strictEqual(oCheckBox.getSelected(), false, "Checkbox is unchecked by default for new iframes");

				oCheckBox.setSelected(true);
				oCheckBox.fireSelect({ selected: true });
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after checking the checkbox");

				oCheckBox.setSelected(false);
				oCheckBox.fireSelect({ selected: false });
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled after unchecking the checkbox");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When the allow focus checkbox is checked and saved, the returned settings carry the value", async function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(true);
			this.oAddIFrameDialog.attachOpened(async function() {
				const oCheckBox = Element.getElementById("sapUiRtaAddIFrameDialog_AllowFocusCheckBox");
				oCheckBox.setSelected(true);
				oCheckBox.fireSelect({ selected: true });
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "new_url");
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
			assert.strictEqual(
				oResponse.allowFocusWithoutUserActivation,
				true,
				"then the resolved settings include allowFocusWithoutUserActivation=true"
			);
		});

		QUnit.test("When dialog is opened in update mode for a legacy iframe (allowFocusWithoutUserActivation defaults to true)", function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(true);
			this.oAddIFrameDialog.attachOpened(function() {
				const oCheckBox = Element.getElementById("sapUiRtaAddIFrameDialog_AllowFocusCheckBox");
				assert.strictEqual(
					oCheckBox.getSelected(),
					true,
					"Checkbox is checked because legacy iframes (no persisted value) resolve to true in update mode"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(
				{ ...mDefaultSettings, updateMode: true },
				oReferenceControl
			);
		});

		QUnit.test("When dialog is opened in update mode for an iframe with focus blocking enabled", function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(true);
			this.oAddIFrameDialog.attachOpened(function() {
				const oCheckBox = Element.getElementById("sapUiRtaAddIFrameDialog_AllowFocusCheckBox");
				assert.strictEqual(
					oCheckBox.getSelected(),
					false,
					"Checkbox is unchecked because the iframe was persisted with allowFocusWithoutUserActivation=false"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(
				{ ...mDefaultSettings, updateMode: true, allowFocusWithoutUserActivation: false },
				oReferenceControl
			);
		});

		QUnit.test("When the policy is supported, the Focus Control sub-panel is visible", function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(true);
			this.oAddIFrameDialog.attachOpened(function() {
				const oFocusPanel = Element.getElementById("sapUiRtaAddIFrameDialog_FocusControlPanel");
				const oSandboxPanel = Element.getElementById("sapUiRtaAddIFrameDialog_SandboxParametersPanel");
				const oAdvancedPanel = Element.getElementById("sapUiRtaAddIFrameDialog_AdvancedSettingsPanel");
				const oAdvancedTitle = Element.getElementById("sapUiRtaAddIFrameDialog_AdvancedSettingsTitle");
				assert.ok(oAdvancedPanel, "Advanced Settings panel exists");
				assert.ok(oSandboxPanel, "Sandbox Parameters sub-panel exists");
				assert.strictEqual(oFocusPanel.getVisible(), true, "Focus Control sub-panel is visible");
				assert.strictEqual(
					oAdvancedTitle.getText(),
					oTextResources.getText("IFRAME_ADDIFRAME_ADVANCED_SETTINGS"),
					"Outer panel title is 'Advanced Settings'"
				);
				assert.strictEqual(
					oSandboxPanel.getHeaderText(),
					oTextResources.getText("IFRAME_ADDIFRAME_SANDBOX_PARAMETERS"),
					"Sandbox Parameters sub-panel renders its own header"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When the policy is not supported, the Focus Control sub-panel is hidden", function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(false);
			this.oAddIFrameDialog.attachOpened(function() {
				const oFocusPanel = Element.getElementById("sapUiRtaAddIFrameDialog_FocusControlPanel");
				const oSandboxPanel = Element.getElementById("sapUiRtaAddIFrameDialog_SandboxParametersPanel");
				const oAdvancedTitle = Element.getElementById("sapUiRtaAddIFrameDialog_AdvancedSettingsTitle");
				assert.strictEqual(oFocusPanel.getVisible(), false, "Focus Control sub-panel is hidden");
				assert.strictEqual(
					oAdvancedTitle.getText(),
					oTextResources.getText("IFRAME_ADDIFRAME_SANDBOX_PARAMETERS"),
					"Outer panel title falls back to 'Sandbox Parameters' when the focus policy is unsupported"
				);
				assert.strictEqual(
					oSandboxPanel.getHeaderText(),
					"",
					"Sandbox Parameters sub-panel renders no header to avoid a redundant nested heading"
				);
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When the policy is not supported and the dialog is saved, the returned settings omit allowFocusWithoutUserActivation", async function(assert) {
			sandbox.stub(FocusPolicy, "isFocusPolicySupported").returns(false);
			this.oAddIFrameDialog.attachOpened(async function() {
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "new_url");
				clickOnSave();
			}, this);
			const oResponse = await this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
			assert.notOk(
				"allowFocusWithoutUserActivation" in oResponse,
				"then the resolved settings do not include allowFocusWithoutUserActivation"
			);
		});

		QUnit.test("When the title is changed and reverted", function(assert) {
			const sOriginalTitle = "Original Title";
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				const oTitleInput = Element.getElementById("sapUiRtaAddIFrameDialog_ContainerTitle_TitleInput");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is initially disabled");

				oTitleInput.setValue("New Title");
				QUnitUtils.triggerEvent("input", oTitleInput.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after title change");

				oTitleInput.setValue(sOriginalTitle);
				QUnitUtils.triggerEvent("input", oTitleInput.getFocusDomRef());
				await nextUIUpdate();
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled when title is reverted");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open({ ...mDefaultSettings, title: sOriginalTitle }, oReferenceControl);
		});

		QUnit.test("When validation fails with changes made, the Save button should be disabled", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "myNewUrl");
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after valid URL change");

				await setTextAreaValue(this.oAddIFrameDialog._oDialog, " ");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled when validation fails");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(mDefaultSettings, oReferenceControl);
		});

		QUnit.test("When dialog is opened for a new iFrame", function(assert) {
			this.oAddIFrameDialog.attachOpened(async function() {
				const oSaveButton = Element.getElementById("sapUiRtaAddIFrameDialogSaveButton");
				assert.strictEqual(oSaveButton.getEnabled(), false, "Save button is disabled for empty URL");

				await setTextAreaValue(this.oAddIFrameDialog._oDialog, "https://myhappyurl");
				assert.strictEqual(oSaveButton.getEnabled(), true, "Save button is enabled after entering a URL");
				clickOnCancel();
			}, this);
			return this.oAddIFrameDialog.open(this.oDialogSettings, oReferenceControl);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
