/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library",
	"sap/ui/fl/util/IFrame",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/iframe/urlCleaner",
	"sap/ui/core/Core"
], function(
	Log,
	Controller,
	coreLibrary,
	IFrame,
	Filter,
	FilterOperator,
	urlCleaner,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var _aTextInputFields = ["frameUrl"];
	var _aNumericInputFields = ["frameWidth", "frameHeight"];
	var _aSelectInputFields = ["asNewSection", "frameWidthUnit", "frameHeightUnit"];

	return Controller.extend("sap.ui.rta.plugin.iframe.AddIFrameDialogController", {
		constructor: function(oJSONModel, mSettings) {
			this._oJSONModel = oJSONModel;
			this._mSettings = mSettings;
			this._importSettings(mSettings);
		},

		/**
		 * Event handler for validation success
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationSuccess: function(oEvent) {
			oEvent.getSource().setValueState(ValueState.None);
			this._oJSONModel.setProperty("/areAllFieldsValid",
				this._areAllTextFieldsValid() && this._areAllValueStatesNotErrors());
		},

		/**
		 * Event handler for validation error
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationError: function(oEvent) {
			oEvent.getSource().setValueState(ValueState.Error);
			this._oJSONModel.setProperty("/areAllFieldsValid", false);
			this._setNumericValueState();
		},

		/**
		 * Event handler for Change of the Size Unit Selections
		 */
		onSizeUnitChange: function() {
			//set the percent info text visible/hidden
			var oWidthSizeUnit = oCore.byId("sapUiRtaAddIFrameDialog_WidthUnit").getSelectedKey();
			var oHeightSizeUnit = oCore.byId("sapUiRtaAddIFrameDialog_HeightUnit").getSelectedKey();
			var oInfoText = oCore.byId("sapUiRtaAddIFrameDialog_PercentText");
			if (oWidthSizeUnit !== "%" && oHeightSizeUnit !== "%") {
				oInfoText.addStyleClass("sapUiRtaAddIFrameDialogPercentText-invisible");
			} else {
				oInfoText.removeStyleClass("sapUiRtaAddIFrameDialogPercentText-invisible");
			}
		},

		/**
		 * Event handler for save button
		 */
		onSavePress: function() {
			var oIFrame = oCore.byId("sapUiRtaAddIFrameDialog_PreviewFrame");
			var sUrlParameters = oIFrame.encodeUrl(this._buildReturnedUrl(), oIFrame);
			if (
				(sUrlParameters.statusCode === IFrame.statusCodes.NONE
				|| sUrlParameters.statusCode === IFrame.statusCodes.UNRESOLVED_JSON)
				&& this._areAllTextFieldsValid()
				&& this._areAllValueStatesNotErrors()
			) {
				this._close(this._buildReturnedSettings());
			}
		},

		/**
		 * Event handler for Show Preview button
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onShowPreview: function() {
			var oIFrame = oCore.byId("sapUiRtaAddIFrameDialog_PreviewFrame");
			oIFrame.setUrl(""); // Resets the preview first
			//enable/disable expanding the Panel
			var sResolvedUrl = this._oJSONModel.getProperty("/resolvedUrl/url");
			this._oJSONModel.setProperty("/previewUrl/value", sResolvedUrl);
		},

		/**
		 * Event handler for pressing a parameter
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onParameterPress: function(oEvent) {
			var sKey = oEvent.getSource().getBindingContext("dialogModel").getObject().key;
			this._oJSONModel.setProperty("/frameUrl/value", this._addUrlParameter(sKey));
			this.onUrlChange();
		},

		/**
		 * Event handler for search
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onSearch: function(oEvent) {
			var oFilter = new Filter("label", FilterOperator.Contains, oEvent.getParameter("query"));
			var oBinding = oCore.byId("sapUiRtaAddIFrameDialog_ParameterTable").getBinding("items");
			oBinding.filter([oFilter]);
		},

		/**
		 * Add URL parameter
		 *
		 * @param {string} sParameter - URL parameter
		 * @returns {string} URL with the added parameter
		 * @private
		 */
		_addUrlParameter: function(sParameter) {
			return this._buildReturnedUrl() + sParameter;
		},

		/**
		 * Build URL to be returned
		 *
		 * @returns {string} URL to be returned
		 * @private
		 */
		_buildReturnedUrl: function() {
			return urlCleaner(this._oJSONModel.getProperty("/frameUrl/value"));
		},

		onUrlChange: function() {
			var oIFrame = oCore.byId("sapUiRtaAddIFrameDialog_PreviewFrame");
			var sUrlParameters = oIFrame.encodeUrl(this._buildReturnedUrl(), oIFrame);
			this._setUrlFieldStatusMessage(sUrlParameters.statusCode);
			this._oJSONModel.setProperty("/resolvedUrl/url", sUrlParameters.encodedUrl);
			this._oJSONModel.setProperty("/resolvedUrl/errorCode", sUrlParameters.statusCode);
		},


		/**
		 * Event handler for Cancel button
		 */
		onCancelPress: function() {
			this._close();
		},

		/**
		 * Close AddIFrame Dialog
		 *
		 * @param {object|undefined} mSettings - IFrame settings to be returned
		 * @private
		 */
		_close: function(mSettings) {
			var oAddIFrameDialog = oCore.byId("sapUiRtaAddIFrameDialog");
			this._mSettings = mSettings;
			oAddIFrameDialog.close();
		},

		/**
		 * Get IFrame settings
		 *
		 * @returns {object|undefined} IFrame settings
		 * @public
		 */
		getSettings: function() {
			return this._mSettings;
		},

		_areAllValueStatesNotErrors: function() {
			var oData = this._oJSONModel.getData();
			return _aTextInputFields.concat(_aNumericInputFields).every(function(sFieldName) {
				return oData[sFieldName]["valueState"] !== ValueState.Error;
			}, this);
		},

		_areAllTextFieldsValid: function() {
			var oJSONModel = this._oJSONModel;
			return _aTextInputFields.every(function(sFieldName) {
				var sValuePath = "/" + sFieldName + "/value";
				var sValueState = oJSONModel.getProperty(sValuePath + "State");
				if (sValueState === "Error") {
					return false;
				}

				return true;
			});
		},

		_buildReturnedSettings: function() {
			var mSettings = {};
			var oData = this._oJSONModel.getData();
			_aTextInputFields.concat(_aNumericInputFields, _aSelectInputFields).forEach(function(sFieldName) {
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
		_importSettings: function(mSettings) {
			if (mSettings) {
				Object.keys(mSettings).forEach(function(sFieldName) {
					if (sFieldName === "frameWidth" || sFieldName === "frameHeight") {
						this._importIFrameSize(sFieldName, mSettings[sFieldName]);
					} else {
						this._oJSONModel.setProperty("/" + sFieldName + "/value", mSettings[sFieldName]);
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
		_importIFrameSize: function(sFieldName, sSize) {
			var aResults = sSize.split(/(px|rem|%)/);
			if (aResults.length >= 2) {
				this._oJSONModel.setProperty("/" + sFieldName + "/value", parseFloat(aResults[0]));
				this._oJSONModel.setProperty("/" + sFieldName + "Unit/value", aResults[1]);
			}
		},

		/**
		 * Sets the focus on an invalid input
		 * Processed on saving the dialog
		 * Only numeric values are checked
		 * An empty URL field disables the Save button and does not need to be checked
		 *
		 */
		_setNumericValueState: function() {
			var oData = this._oJSONModel.getData();
			_aNumericInputFields.forEach(function(sFieldName) {
				if (oData[sFieldName]["valueState"] === ValueState.Error) {
					this._setFieldState(sFieldName, "Error");
				} else {
					this._setFieldState(sFieldName, "None");
				}
			}, this);
		},

		/**
		 *Sets a message on a dialog field and
		 *saves the state type in the JSON model.
		 *
		 *@param {string} sFieldName - Field name
		 *@param {string} sState - State of the message (e.g Error, Warning and None)
		 *@param {string} sMessageText - Messagebundle text reference
		 */
		_setFieldState: function(sFieldName, sState, sMessageText) {
			var oData = this._oJSONModel.getData();
			var oElement = oCore.byId(oData[sFieldName]["id"]);
			var oJSONModel = this._oJSONModel;
			var sValuePath = "/" + sFieldName + "/valueState";
			oJSONModel.setProperty(sValuePath, sState);
			var sValueStateText = sMessageText && oCore.getLibraryResourceBundle("sap.ui.rta").getText(sMessageText);
			oElement.setValueState(sState);
			oElement.setValueStateText(sValueStateText);
			if (sState !== "None") {
				oElement.focus();
			}
		},

		_setUrlFieldStatusMessage: function(nErrorCode) {
			var sUrlInputField = _aTextInputFields[0];
			switch (nErrorCode) {
				case IFrame.statusCodes.INVALID:
					this._setFieldState(sUrlInputField, "Error", "IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_INVALID");
					break;
				case IFrame.statusCodes.DECODING_ERROR:
					this._setFieldState(sUrlInputField, "Error", "IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_INVALID_ENCODING");
					break;
				case IFrame.statusCodes.UNEVEN_BRACKETS:
					this._setFieldState(sUrlInputField, "Error", "IFRAME_ADDIFRAME_DIALOG_URL_ERROR_TEXT_UNEVEN_BRACKETS");
					break;
				case IFrame.statusCodes.UNRESOLVED_JSON:
					this._setFieldState(sUrlInputField, "Warning", "IFRAME_ADDIFRAME_DIALOG_URL_WARNING_TEXT_JSON_ENCODING");
					break;
				default:
					this._setFieldState(sUrlInputField, "None");
					break;
			}
		}
	});
});