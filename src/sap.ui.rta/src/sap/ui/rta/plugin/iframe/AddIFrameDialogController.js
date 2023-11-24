/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/Popover",
	"sap/m/Text",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/rta/util/validateText",
	"sap/ui/rta/Utils",
	"sap/ui/fl/util/IFrame",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/iframe/urlCleaner"
], function(
	Log,
	Popover,
	Text,
	Controller,
	Element,
	Lib,
	coreLibrary,
	validateText,
	Utils,
	IFrame,
	Filter,
	FilterOperator,
	urlCleaner
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var {ValueState} = coreLibrary;

	const _oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	var _aTextInputFields = ["frameUrl", "title"];
	var _aNumericInputFields = ["frameWidth", "frameHeight"];
	var _aOtherInputFields = ["frameWidthUnit", "frameHeightUnit", "useLegacyNavigation"];

	function isValidUrl(sUrl) {
		if (
			typeof sUrl !== "string"
			|| sUrl.trim() === ""
		) {
			return {
				result: false,
				error: IFrame.VALIDATION_ERROR.INVALID_URL
			};
		}
		return IFrame.isValidUrl(encodeURI(sUrl));
	}

	return Controller.extend("sap.ui.rta.plugin.iframe.AddIFrameDialogController", {
		// eslint-disable-next-line object-shorthand
		constructor: function(oJSONModel, mSettings) {
			this._oJSONModel = oJSONModel;
			this._importSettings(mSettings);
			this._mParameterHashMap = this._buildParameterHashMap(mSettings);
		},

		/**
		 * Event handler for validation success
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationSuccess(oEvent) {
			oEvent.getSource().setValueState(ValueState.None);
			this._oJSONModel.setProperty("/areAllFieldsValid",
				this._areAllTextFieldsValid() && this._areAllValueStateNones());
		},

		/**
		 * Event handler for validation error
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationError(oEvent) {
			oEvent.getSource().setValueState(ValueState.Error);
			this._oJSONModel.setProperty("/areAllFieldsValid", false);
			this._setFocusOnInvalidInput();
		},

		/**
		 * Event handler for save button
		 */
		onSavePress() {
			var sUrl = this._buildPreviewURL(this._buildReturnedURL());
			if (isValidUrl(sUrl).result && this._areAllTextFieldsValid() && this._areAllValueStateNones()) {
				this._close(this._buildReturnedSettings());
			} else {
				this._setFocusOnInvalidInput();
			}
		},

		/**
		 * Event handler for Show Preview button
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onShowPreview() {
			const sReturnedURL = this._buildReturnedURL();
			const sURL = this._buildPreviewURL(sReturnedURL);
			if (!isValidUrl(sURL).result) {
				return;
			}
			const oIFrame = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewFrame");
			// enable/disable expanding the Panel
			const oPanel = Element.getElementById("sapUiRtaAddIFrameDialog_PreviewLinkPanel");
			const oPanelButton = oPanel.getDependents()[0];
			if (sURL) {
				oPanelButton.setEnabled(true);
			} else {
				oPanel.setExpanded(false);
				oPanelButton.setEnabled(false);
			}
			try {
				this._oJSONModel.setProperty("/previewUrl/value", sURL);
				this._oJSONModel.setProperty("/previousFrameUrl/value", sReturnedURL);
				this._oJSONModel.setProperty(
					"/previewUseLegacyNavigation/value",
					this._oJSONModel.getProperty("/useLegacyNavigation/value")
				);
				oIFrame.setUrl(sURL);
			} catch (oError) {
				Log.error("Error previewing the URL: ", oError);
			}
		},

		/**
		 * Event handler for pressing a parameter
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onParameterPress(oEvent) {
			var sKey = oEvent.getSource().getBindingContext().getObject().key;
			this._oJSONModel.setProperty("/frameUrl/value", this._addURLParameter(sKey));
			this.onUrlChange();
		},

		/**
		 * Event handler for live change on the parameter search field
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onLiveChange(oEvent) {
			var oFilter = new Filter("label", FilterOperator.Contains, oEvent.getParameter("newValue"));
			var oBinding = Element.getElementById("sapUiRtaAddIFrameDialog_ParameterTable").getBinding("items");
			oBinding.filter([oFilter]);
		},

		onLegacyNavigationInfoPress(oEvent) {
			const oButton = oEvent.getSource();
			if (!this._oPopover) {
				this._oPopover = new Popover(
					`${oButton.getId()}-popover`,
					{
						showHeader: false,
						contentWidth: "400px",
						content: [
							new Text({
								text: "{/text/useLegacyNavigationInfo}"
							}).addStyleClass("sapUiSmallMargin")
						]
					}
				);
				oButton.addDependent(this._oPopover);
			}
			this._oPopover.openBy(oButton);
		},

		/**
		 * Build preview URL
		 *
		 * @param {string} sEditURL - URL with parameters in braces
		 * @returns {string} URL with parameters and values
		 * @private
		 */
		_buildPreviewURL(sEditURL) {
			return sEditURL.replace(/{(.*?)}/g, function(sMatch) {
				return this._mParameterHashMap[sMatch];
			}.bind(this));
		},

		/**
		 * Add URL parameter
		 *
		 * @param {string} sParameter - URL parameter
		 * @returns {string} URL with the added parameter
		 * @private
		 */
		_addURLParameter(sParameter) {
			return this._buildReturnedURL() + sParameter;
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

		onUrlChange() {
			var sUrl = this._buildPreviewURL(this._buildReturnedURL());
			const { result: bResult, error: sError } = isValidUrl(sUrl);
			if (bResult) {
				this._oJSONModel.setProperty("/frameUrlError/value", "");
			} else {
				const sErrorKey = {
					[IFrame.VALIDATION_ERROR.UNSAFE_PROTOCOL]: "IFRAME_ADDIFRAME_ERROR_UNSAFE_PROTOCOL",
					[IFrame.VALIDATION_ERROR.MIXED_CONTENT]: "IFRAME_ADDIFRAME_ERROR_MIXED_CONTENT",
					[IFrame.VALIDATION_ERROR.FORBIDDEN_URL]: "IFRAME_ADDIFRAME_ERROR_FORBIDDEN_URL",
					[IFrame.VALIDATION_ERROR.INVALID_URL]: "IFRAME_ADDIFRAME_ERROR_INVALID_URL"
				}[sError];
				const sErrorText = _oTextResources.getText(sErrorKey);
				this._oJSONModel.setProperty("/frameUrlError/value", sErrorText);
			}
		},

		/**
		 * Build hashmap for parameters
		 *
		 * @param {object} mParameters - URL parameters
		 * @returns {object} Parameter hashmap
		 * @private
		 */
		_buildParameterHashMap(mParameters) {
			if (mParameters && mParameters.parameters) {
				return Utils.buildHashMapFromArray(mParameters.parameters, "key", "value");
			}
			return {};
		},

		/**
		 * Event handler for Cancel button
		 */
		onCancelPress() {
			this._close();
		},

		onContainerTitleChange(oEvent) {
			var oInput = oEvent.getSource();
			var sValueState = "None";
			var bValidationError = false;
			var sValue = oInput.getValue();

			if (sValue.trim() === "") {
				sValueState = "Error";
				oInput.setValueState(sValueState);
				bValidationError = true;
				return bValidationError;
			}

			try {
				validateText(sValue);
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}

			oInput.setValueState(sValueState);

			return bValidationError;
		},

		/**
		 * Close AddIFrame Dialog
		 *
		 * @param {object|undefined} mSettings - IFrame settings to be returned
		 * @private
		 */
		_close(mSettings) {
			var oAddIFrameDialog = Element.getElementById("sapUiRtaAddIFrameDialog");
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
			var oData = this._oJSONModel.getData();
			return _aTextInputFields.concat(_aNumericInputFields).every(function(sFieldName) {
				return oData[sFieldName].valueState === ValueState.None;
			}, this);
		},

		_areAllTextFieldsValid() {
			var oJSONModel = this._oJSONModel;
			var bAsContainer = this._oJSONModel.getProperty("asContainer/value");
			return _aTextInputFields.reduce(function(bAllValid, sFieldName) {
				// The title field is only available on add as Section
				if (sFieldName === "title" && !bAsContainer) {
					return true;
				}
				var sValuePath = `/${sFieldName}/value`;
				var sValueState;
				if (oJSONModel.getProperty(sValuePath).trim() === "") {
					sValueState = ValueState.Error;
				} else {
					sValueState = ValueState.None;
				}
				oJSONModel.setProperty(`${sValuePath}State`, sValueState);
				return bAllValid && sValueState === ValueState.None;
			}, true);
		},

		_buildReturnedSettings() {
			var mSettings = {};
			var oData = this._oJSONModel.getData();
			_aTextInputFields.concat(_aNumericInputFields, _aOtherInputFields).forEach(function(sFieldName) {
				var sValue = oData[sFieldName].value;
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
			if (mSettings) {
				Object.keys(mSettings).forEach(function(sFieldName) {
					if (sFieldName === "frameWidth" || sFieldName === "frameHeight") {
						this._importIFrameSize(sFieldName, mSettings[sFieldName]);
					} else {
						this._oJSONModel.setProperty(`/${sFieldName}/value`, mSettings[sFieldName]);
					}
				}, this);
			}
		},

		/**
		 * Import IFrame size
		 *
		 * @param  {string} sFieldName - Field name
		 * @param  {string} sSize - Size to import
		 */
		_importIFrameSize(sFieldName, sSize) {
			var aResults = sSize.split(/(px|rem|%|vh)/);
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
		 *
		 */
		_setFocusOnInvalidInput() {
			var oData = this._oJSONModel.getData();
			_aNumericInputFields.some(function(sFieldName) {
				if (oData[sFieldName].valueState === ValueState.Error) {
					var oElement = Element.getElementById(oData[sFieldName].id);
					oElement.focus();
					return true;
				}
			}, this);
		}
	});
});