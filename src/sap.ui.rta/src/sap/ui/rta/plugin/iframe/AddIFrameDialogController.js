/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/Deferred",
	"sap/base/Log",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/m/Switch",
	"sap/m/Token",
	"sap/m/VBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/fl/util/FocusPolicy",
	"sap/ui/fl/util/IFrame",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/iframe/urlCleaner",
	"sap/ui/rta/util/validateText"
], function(
	Deferred,
	Log,
	HBox,
	Label,
	MultiInput,
	Switch,
	Token,
	VBox,
	Controller,
	Element,
	Lib,
	coreLibrary,
	FocusPolicy,
	IFrame,
	Filter,
	FilterOperator,
	urlCleaner,
	validateText
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const { ValueState } = coreLibrary;

	const _oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	const _aTextInputFields = ["frameUrl", "title"];
	const _aNumericInputFields = ["frameWidth", "frameHeight"];
	const _aUnitInputFields = ["frameWidthUnit", "frameHeightUnit"];
	const _aAllConfigFields = _aTextInputFields.concat(
		_aNumericInputFields, _aUnitInputFields, ["advancedSettings", "allowFocusWithoutUserActivation"]
	);

	function multiInputValidator(oValue) {
		const sText = oValue.text;
		return new Token({ key: sText, text: sText });
	}

	function setURLErrorMessage(sError) {
		const sErrorKey = {
			[IFrame.VALIDATION_ERROR.UNSAFE_PROTOCOL]: "IFRAME_ADDIFRAME_ERROR_UNSAFE_PROTOCOL",
			[IFrame.VALIDATION_ERROR.MIXED_CONTENT]: "IFRAME_ADDIFRAME_ERROR_MIXED_CONTENT",
			[IFrame.VALIDATION_ERROR.FORBIDDEN_URL]: "IFRAME_ADDIFRAME_ERROR_FORBIDDEN_URL",
			[IFrame.VALIDATION_ERROR.INVALID_URL]: "IFRAME_ADDIFRAME_ERROR_INVALID_URL"
		}[sError];
		const sErrorText = _oTextResources.getText(sErrorKey);
		this._oJSONModel.setProperty("/frameUrlError/value", sErrorText);
	}

	return Controller.extend("sap.ui.rta.plugin.iframe.AddIFrameDialogController", {
		constructor: function(oJSONModel, mSettings, oAction) {
			this._oJSONModel = oJSONModel;
			this._importSettings(mSettings);
			this._oAction = oAction;
		},

		onBeforeOpen() {
			this._oJSONModel.setProperty("/initialFrameUrl/value", this._oJSONModel.getProperty("/frameUrl/value"));
			this._storeInitialConfiguration();
			// Configure the MultiInput field
			// This syntax is the suggested way by the UI5 documentation to trigger a submit on the input field on focus loss
			const oMultiInput = Element.getElementById("sapUiRtaAddIFrameDialog_AddAdditionalParametersInput");
			oMultiInput.addValidator(multiInputValidator);
		},

		/**
		 * Factory function to create controls for advanced settings Grid content
		 * @param {string} sId - Generated ID for the control
		 * @param {sap.ui.model.Context} oContext - Binding context
		 * @returns {sap.ui.core.Control} Control (HBox with Switch or VBox with MultiInput)
		 */
		createAdvancedSettingsControl(sId, oContext) {
			const oSetting = oContext.getObject();

			// MultiInput for additional sandbox parameters
			if (oSetting.isMultiInput) {
				const oLabel = new Label("sapUiRtaAddIFrameDialog_AddAdditionalParametersLabel", {
					text: "{i18n>IFRAME_ADDIFRAME_ADD_ADDITIONAL_SANDBOX_PARAMETERS_LABEL}",
					labelFor: "sapUiRtaAddIFrameDialog_AddAdditionalParametersInput"
				});

				const oMultiInput = new MultiInput("sapUiRtaAddIFrameDialog_AddAdditionalParametersInput", {
					placeholder: "{i18n>IFRAME_ADDIFRAME_ADD_ADDITIONAL_SANDBOX_PARAMETERS_PLACEHOLDER}",
					showValueHelp: false,
					tokenUpdate: this.onTokenUpdate.bind(this)
				});

				// Set up token binding programmatically
				oMultiInput.bindAggregation("tokens", {
					path: "dialogInfo>/advancedSettings/value/additionalSandboxParameters",
					template: new Token({
						text: "{dialogInfo>}",
						key: "{dialogInfo>}"
					}),
					templateShareable: false
				});

				return new VBox(sId, {
					items: [oLabel, oMultiInput]
				});
			}

			// Switch for boolean settings
			const oSwitch = new Switch(`sapUiRtaAddIFrameDialog_${oSetting.key}Switch`, {
				state: `{dialogInfo>/advancedSettings/value/${oSetting.key}}`,
				customTextOn: " ",
				customTextOff: " ",
				change: this.onSwitchChange.bind(this)
			});

			const oLabel = new Label({
				text: oSetting.label
			});

			return new HBox(sId, {
				alignItems: "Center",
				items: [oSwitch, oLabel]
			});
		},

		onSwitchChange() {
			this._checkIfSaveIsEnabled(true);
			this._oJSONModel.setProperty("/settingsUpdate/value", true);
		},

		onAllowFocusChange() {
			this._checkIfSaveIsEnabled(true);
		},

		/**
		 * Event handler for URL live change
		 * Enables the Save button immediately when content is typed
		 */
		onUrlLiveChange() {
			// Clear any previous URL error to make typing user friendly
			this._oJSONModel.setProperty("/frameUrlError/value", "");
			// Check if save should be enabled based on changes (without full URL validation)
			this._checkIfSaveIsEnabled(true);
		},

		/**
		 * Event handler for token update
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onTokenUpdate(oEvent) {
			let aSandboxParameters = this._oJSONModel.getProperty("/advancedSettings/value/additionalSandboxParameters");

			if (oEvent.getParameter("type") === "added") {
				oEvent.getParameter("addedTokens").forEach((oToken) => {
					aSandboxParameters = [...aSandboxParameters, oToken.getText()];
				});
			} else if (oEvent.getParameter("type") === "removed") {
				oEvent.getParameter("removedTokens").forEach((oToken) => {
					aSandboxParameters = aSandboxParameters.filter((sText) => sText !== oToken.getText());
				});
			}

			this._oJSONModel.setProperty("/advancedSettings/value/additionalSandboxParameters", aSandboxParameters);
			this._oJSONModel.setProperty("/settingsUpdate/value", true);
			this._checkIfSaveIsEnabled(true);
		},

		/**
		 * Event handler for validation success
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationSuccess(oEvent) {
			oEvent.getSource().setValueState(ValueState.None);
			this._checkIfSaveIsEnabled(true);
		},

		/**
		 * Event handler for validation error
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationError(oEvent) {
			oEvent.getSource().setValueState(ValueState.Error);
			this._checkIfSaveIsEnabled(false);
			this._setFocusOnInvalidInput();
		},

		/**
		 * Event handler for save button
		 * Validates the URL before saving - if invalid, shows error and disables Save button
		 */
		async onSavePress() {
			const sUrl = await this._buildPreviewURL();
			const { result: bResult, error: sError } = IFrame.isValidUrl(sUrl);

			if (!bResult) {
				setURLErrorMessage.call(this, sError);
				this._checkIfSaveIsEnabled(false);
				return;
			}

			if (this._areAllTextFieldsValid() && this._areAllValueStateNones()) {
				this._close(this._buildReturnedSettings());
			} else {
				this._setFocusOnInvalidInput();
			}
		},

		/**
		 * Event handler for Show Preview button
		 */
		async onPreviewPress() {
			const sReturnedURL = this._buildReturnedURL();
			const sURL = await this._buildPreviewURL();

			if (!IFrame.isValidUrl(sURL).result) {
				return;
			}
			const oIFrame = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
			try {
				this._oJSONModel.setProperty("/previousFrameUrl/value", sReturnedURL);
				this._oJSONModel.setProperty("/settingsUpdate/value", false);

				oIFrame.applySettings({ url: sURL, advancedSettings: { ...this._oJSONModel.getProperty("/advancedSettings/value") } });
				// Use the URL from the IFrame to ensure that the complete path is shown
				this._oJSONModel.setProperty("/previewUrl/value", oIFrame.getUrl());
				// Prevent the URL preview link (next element in the DOM) from getting the focus because it looks bad
				setTimeout(() => {
					Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLink").getFocusDomRef().blur();
				}, 0);
			} catch (oError) {
				Log.error("Error previewing the URL: ", oError);
			}
		},

		/**
		 * Event handler for the parameters info button
		 * Opens a popover explaining what the parameters are and how to use them
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onParameterInfoPress(oEvent) {
			const oPopover = Element.getElementById("sapUiRtaAddIFrameDialog_ParametersInfoPopover");
			oPopover.openBy(oEvent.getSource());
		},

		/**
		 * Event handler for pressing a parameter
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onParameterPress(oEvent) {
			const oObject = oEvent.getSource().getBindingContext("dialogInfo").getObject();
			this._oJSONModel.setProperty("/frameUrl/value", this._addURLParameter(oObject));
			this.onValidateUrl();
		},

		/**
		 * Event handler for live change on the parameter search field
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onLiveChange(oEvent) {
			const oFilter = new Filter("label", FilterOperator.Contains, oEvent.getParameter("newValue"));
			const oBinding = Element.getElementById("sapUiRtaAddIFrameDialog_ParameterTable").getBinding("items");
			oBinding.filter([oFilter]);
		},

		/**
		 * Event handler for size change - can be the width/height value or unit
		 */
		onSizeChange() {
			this._checkIfSaveIsEnabled(true);
		},

		/**
		 * Build preview URL
		 * @returns {string} URL with resolved bindings
		 * @private
		 */
		_buildPreviewURL() {
			const oValidationPromise = new Deferred();
			const sUrl = this._buildReturnedURL();
			const oResolver = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLinkResolver");
			try {
				// Whenever a URL contains a binding string, all old bindings are cleaned up
				// and a new binding is created for the text property
				// However this doesn't happen if there was a binding previously and the new url
				// value is a plain string, which can then lead to problems with two-way bindings
				// where the new plain value would leak back into the model
				// In this case the old binding has to be cleaned up explicitly
				oResolver.unbindProperty("text");

				oResolver.applySettings({
					text: sUrl
				});
				const oBinding = oResolver.getBinding("text");
				if (oBinding?.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
					// V4 bindings are asynchronous, so we need to wait for the change event
					oBinding.attachEventOnce("change", () => {
						oValidationPromise.resolve(oResolver.getText());
					});
				} else {
					oValidationPromise.resolve(oResolver.getText());
				}
			} catch (err) {
				return undefined;
			}
			return oValidationPromise.promise;
		},

		/**
		 * Add URL parameter
		 *
		 * @param {object} oObject - Parameter object
		 * @returns {string} URL with the added parameter
		 * @private
		 */
		_addURLParameter(oObject) {
			const sParameterKey = oObject.key;
			let sParameterString;
			const [, sParameter] = sParameterKey.match(/\{(.+?)\}/);
			if (oObject.type && oObject.type !== "Edm.String") {
				// If the type is available, this is an OData V4 Model and the target type must be set to 'any' when adding the parameter
				// to the URL to prevent it from being resolved to a localized value.
				// E.g. boolean is resolved to "yes/no" in a system with English locale - but we need to add "true/false" to the URL
				// The only type that does not require this special handling is Edm.String
				sParameterString = `{path:'${sParameter}',targetType:'any'}`;
			} else if (sParameter.startsWith("@")) {
				// Parameters starting with "@" (e.g. @odata.context) need special handling
				// to avoid issues with the binding syntax
				sParameterString = `{=%{${sParameter}}}`;
			} else {
				sParameterString = sParameterKey;
			}
			const oTextField = Element.getElementById("sapUiRtaAddIFrameDialog_EditUrlTA");
			const iCurrentSelectionStart = oTextField.getFocusDomRef().selectionStart;
			const iCurrentSelectionEnd = oTextField.getFocusDomRef().selectionEnd;
			const sCurrentUrl = this._buildReturnedURL();
			return `${sCurrentUrl.substring(0, iCurrentSelectionStart)}${sParameterString}${sCurrentUrl.substring(iCurrentSelectionEnd)}`;
		},

		/**
		 * Build URL to be returned
		 *
		 * @returns {string} URL to be returned
		 * @private
		 */
		_buildReturnedURL() {
			return urlCleaner(this._oJSONModel.getProperty("/frameUrl/value"));
		},

		/**
		 * Stores the initial configuration values when the dialog opens.
		 * This is used to detect if any changes were made.
		 *
		 * @private
		 */
		_storeInitialConfiguration() {
			this._mInitialConfiguration = {};
			const aAdvancedSettingsConfig = this._oJSONModel.getProperty("/advancedSettingsConfig");
			_aAllConfigFields.forEach((sFieldName) => {
				const vValue = this._oJSONModel.getProperty(`/${sFieldName}/value`);
				// For advancedSettings, store each property individually to avoid reference issues
				if (sFieldName === "advancedSettings") {
					const mStoredSettings = {};
					// Use explicit false for undefined boolean values since switches default to false
					aAdvancedSettingsConfig.forEach((oSetting) => {
						mStoredSettings[oSetting.key] = vValue[oSetting.key] ?? false;
					});
					mStoredSettings.additionalSandboxParameters = vValue.additionalSandboxParameters
						? [...vValue.additionalSandboxParameters]
						: [];
					this._mInitialConfiguration.advancedSettings = mStoredSettings;
				} else if (vValue !== null && typeof vValue === "object") {
					// Deep copy for other objects using JSON parse/stringify
					this._mInitialConfiguration[sFieldName] = JSON.parse(JSON.stringify(vValue));
				} else {
					this._mInitialConfiguration[sFieldName] = vValue;
				}
			});
		},

		/**
		 * Checks if any configuration field has been modified compared to the initial state.
		 *
		 * @returns {boolean} True if any configuration was modified
		 * @private
		 */
		_hasConfigurationChanged() {
			if (!this._mInitialConfiguration) {
				return true; // No initial config stored (e.g. new iframe)
			}

			const aAdvancedSettingsConfig = this._oJSONModel.getProperty("/advancedSettingsConfig");
			return _aAllConfigFields.some((sFieldName) => {
				const vCurrentValue = this._oJSONModel.getProperty(`/${sFieldName}/value`);
				const vInitialValue = this._mInitialConfiguration[sFieldName];

				// Handle advancedSettings by comparing each property individually
				if (sFieldName === "advancedSettings") {
					// Compare boolean switches using nullish coalescing to handle undefined values
					const bSwitchChanged = aAdvancedSettingsConfig.some((oSetting) => {
						if (oSetting.key === "additionalSandboxParameters") {
							return false; // Array comparison is handled below
						}
						return (vCurrentValue[oSetting.key] ?? false) !== vInitialValue[oSetting.key];
					});
					if (bSwitchChanged) {
						return true;
					}
					// Compare additionalSandboxParameters array
					const aCurrentParams = vCurrentValue.additionalSandboxParameters || [];
					const aInitialParams = vInitialValue.additionalSandboxParameters || [];
					if (aCurrentParams.length !== aInitialParams.length) {
						return true;
					}
					return aCurrentParams.some((vParam, iCounter) => vParam !== aInitialParams[iCounter]);
				}

				// Handle other objects by comparing JSON strings
				if (vCurrentValue !== null && typeof vCurrentValue === "object") {
					return JSON.stringify(vCurrentValue) !== JSON.stringify(vInitialValue);
				}

				return vCurrentValue !== vInitialValue;
			});
		},

		/**
		 * Triggers the validation of all fields and updates the "saveEnabled" property in the model
		 * This property is used to enable/disable the Save button
		 * The Save button is only enabled if:
		 * 1. All validation checks pass
		 * 2. At least one configuration field was modified
		 *
		 * @param {boolean} bExternalValidationSuccess - Whether external validation was successful
		 */
		_checkIfSaveIsEnabled(bExternalValidationSuccess) {
			const bAllValidationsPass = (
				bExternalValidationSuccess
				&& !this._oJSONModel.getProperty("/frameUrlError/value")
				&& this._areAllTextFieldsValid()
				&& this._areAllValueStateNones()
			);
			const bHasChanges = this._hasConfigurationChanged();
			const bSaveEnabled = bAllValidationsPass && bHasChanges;
			this._oJSONModel.setProperty("/saveEnabled", bSaveEnabled);
		},

		async onValidateUrl() {
			const sUrl = await this._buildPreviewURL();
			const { result: bResult, error: sError } = IFrame.isValidUrl(sUrl);
			if (bResult) {
				this._oJSONModel.setProperty("/frameUrlError/value", "");
			} else {
				setURLErrorMessage.call(this, sError);
			}
			this._checkIfSaveIsEnabled(bResult);
		},

		/**
		 * Event handler for Cancel button
		 */
		onCancelPress() {
			this._close();
		},

		onContainerTitleChange(oEvent) {
			const oInput = oEvent.getSource();
			const sInputValue = oInput.getValue().trim();
			const sNewText = sInputValue.length ? sInputValue : "\xa0";
			const sOldText = this._oJSONModel.getProperty("/title/originalValue");
			let sValueState = ValueState.None;

			let bSaveEnabled = true;
			try {
				validateText(sNewText, sOldText, this._oAction);
			} catch (oException) {
				// unchanged title blocks save silently, without marking the field as invalid
				if (oException.message !== "sameTextError") {
					sValueState = ValueState.Error;
				}
				bSaveEnabled = false;
			}

			oInput.setValueState(sValueState);
			this._checkIfSaveIsEnabled(bSaveEnabled);
			return sValueState === ValueState.Error;
		},

		/**
		 * Close AddIFrame Dialog
		 *
		 * @param {object|undefined} mSettings - IFrame settings to be returned
		 * @private
		 */
		_close(mSettings) {
			const oAddIFrameDialog = Element.getElementById("sapUiRtaAddIFrameDialog");
			this._mSettings = mSettings;
			oAddIFrameDialog.close();
		},

		/**
		 * Get IFrame settings
		 *
		 * @returns {object|undefined} IFrame settings
		 * @public
		 */
		getSettings() {
			return this._mSettings;
		},

		_areAllValueStateNones() {
			const oData = this._oJSONModel.getData();
			return _aTextInputFields.concat(_aNumericInputFields).every((sFieldName) => {
				return oData[sFieldName].valueState === ValueState.None;
			});
		},

		_areAllTextFieldsValid() {
			const bShowTitle = this._oJSONModel.getProperty("/showTitle/value");
			return _aTextInputFields.every((sFieldName) => {
				if (sFieldName === "title" && !bShowTitle) {
					return true;
				}
				const sValuePath = `/${sFieldName}/value`;
				const sValueState = this._oJSONModel.getProperty(sValuePath).trim() === ""
					? ValueState.Error
					: ValueState.None;
				this._oJSONModel.setProperty(`${sValuePath}State`, sValueState);
				return sValueState === ValueState.None;
			});
		},

		_buildReturnedSettings() {
			const mSettings = {};
			const oData = this._oJSONModel.getData();
			// Don't persist allowFocusWithoutUserActivation when the browser does not support
			// the Permissions Policy: the dialog panel was hidden, the user never made a choice,
			// and persisting a value here would silently activate focus blocking once the browser
			// gains support.
			const bSkipAllowFocus = !FocusPolicy.isFocusPolicySupported();
			_aAllConfigFields.forEach((sFieldName) => {
				if (sFieldName === "allowFocusWithoutUserActivation" && bSkipAllowFocus) {
					return;
				}
				let sValue = oData[sFieldName].value;
				if (sFieldName === "frameUrl") {
					sValue = urlCleaner(sValue);
				}
				mSettings[sFieldName] = sValue;
			});
			return mSettings;
		},

		/**
		 * Import settings
		 *
		 * @param {object|undefined} mSettings - Existing IFrame settings
		 * @private
		 */
		_importSettings(mSettings) {
			if (!mSettings) {
				return;
			}
			Object.keys(mSettings).forEach((sFieldName) => {
				if (sFieldName === "frameWidth" || sFieldName === "frameHeight") {
					this._importIFrameSize(sFieldName, mSettings[sFieldName]);
				// Legacy iframes do not have advancedSettings properties so we need to skip the setProperty
				// on the json model to not overwrite the default values with undefined
				} else if (sFieldName === "advancedSettings" && !mSettings[sFieldName]) {
					return;
				} else {
					this._oJSONModel.setProperty(`/${sFieldName}/value`, mSettings[sFieldName]);
					if (sFieldName === "title") {
						this._oJSONModel.setProperty("/title/originalValue", mSettings[sFieldName]);
					}
				}
			});
		},

		/**
		 * Import IFrame size
		 *
		 * @param {string} sFieldName - Field name
		 * @param {string} sSize - Size to import
		 */
		_importIFrameSize(sFieldName, sSize) {
			const aResults = sSize.split(/(px|rem|%|vh)/);
			if (aResults.length >= 2) {
				this._oJSONModel.setProperty(`/${sFieldName}/value`, parseFloat(aResults[0]));
				this._oJSONModel.setProperty(`/${sFieldName}Unit/value`, aResults[1]);
			}
		},

		/**
		 * Sets the focus on an invalid input
		 * Processed on saving the dialog
		 * Only numerical values are checked
		 * An empty URL field disables the Save button and does not need to be checked
		 */
		_setFocusOnInvalidInput() {
			const oData = this._oJSONModel.getData();
			_aNumericInputFields.some((sFieldName) => {
				if (oData[sFieldName].valueState === ValueState.Error) {
					const oElement = Element.getElementById(oData[sFieldName].id);
					oElement.focus();
					return true;
				}
				return false;
			});
		}
	});
});