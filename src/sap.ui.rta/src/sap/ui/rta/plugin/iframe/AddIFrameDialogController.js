/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library",
	"sap/ui/rta/Utils",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/iframe/urlCleaner"
], function(
	Log,
	Controller,
	coreLibrary,
	Utils,
	Filter,
	FilterOperator,
	urlCleaner
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
			this._importSettings(mSettings);
			this._mParameterHashMap = this._buildParameterHashMap(mSettings);
		},

		/**
		 * Event handler for validation success
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationSuccess: function(oEvent) {
			oEvent.getSource().setValueState(ValueState.None);
			this._oJSONModel.setProperty("/areAllFieldsValid",
				this._areAllTextFieldsValid() && this._areAllValueStateNones());
		},

		/**
		 * Event handler for validation error
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationError: function(oEvent) {
			oEvent.getSource().setValueState(ValueState.Error);
			this._oJSONModel.setProperty("/areAllFieldsValid", false);
			this._setFocusOnInvalidInput();
		},

		/**
		 * Event handler for Change of the Size Unit Selections
		 */
		onSizeUnitChange: function() {
			//set the percent info text visible/hidden
			var oWidthSizeUnit = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_WidthUnit").getSelectedKey();
			var oHeightSizeUnit = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_HeightUnit").getSelectedKey();
			var oInfoText = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PercentText");
			if (oWidthSizeUnit !== "%" && oHeightSizeUnit !== "%") {
				oInfoText.addStyleClass("sapUiRtaAddIFrameDialogPercentText-invisible");
			} else {
				oInfoText.removeStyleClass("sapUiRtaAddIFrameDialogPercentText-invisible");
			}
		},

		/**
		 * Event handler for live change of the URL text area
		 * Clears the Preview when the URL is empty
		 */
		onURLChange: function() {
			var sPreviewUrl = this._oJSONModel.getProperty("/previewUrl/value");
			var sFrameUrl = this._oJSONModel.getProperty("/frameUrl/value");
			var oPreviewButton = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PreviewButton");
			if (sFrameUrl === "" && sPreviewUrl !== "") {
				//Clears the preview frame, collapses the panel, clears the preview URL
				var oIFrame = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PreviewFrame");
				oIFrame.setUrl("about:blank"); // Resets the preview first
				this._oJSONModel.setProperty("/previewUrl/value", sFrameUrl);
				var oPanel = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PreviewLinkPanel");
				var oPanelButton = oPanel.getDependents()[0];
				oPanel.setExpanded(false);
				oPanelButton.setEnabled(false);
				oPreviewButton.setText(this._oJSONModel.getProperty("/text/showPreviewButton"));
				oPreviewButton.setType("Emphasized");
			} else if (sFrameUrl !== "" && sPreviewUrl !== "") {
				// Changes the button text if URLs differ
				if (sFrameUrl === sPreviewUrl) {
					oPreviewButton.setText(this._oJSONModel.getProperty("/text/showPreviewButton"));
					oPreviewButton.setType("Default");
				} else {
					oPreviewButton.setText(this._oJSONModel.getProperty("/text/updatePreviewButton"));
					oPreviewButton.setType("Emphasized");
				}
			}
		},

		/**
		 * Event handler for save button
		 */
		onSavePress: function() {
			if (this._areAllTextFieldsValid() && this._areAllValueStateNones()) {
				this._close(this._buildReturnedSettings());
			} else {
				this._setFocusOnInvalidInput();
			}
		},

		/**
		 * Event handler for Show Preview button
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onShowPreview: function(oEvent) {
			var sURL = encodeURI(this._buildPreviewURL(this._buildReturnedURL()));
			var oIFrame = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PreviewFrame");
			oIFrame.setUrl("about:blank"); // Resets the preview first
			//enable/disable expanding the Panel
			var oPanel = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_PreviewLinkPanel");
			var oPanelButton = oPanel.getDependents()[0];
			if (sURL) {
				oPanelButton.setEnabled(true);
			} else {
				oPanel.setExpanded(false);
				oPanelButton.setEnabled(false);
			}
			try {
				this._oJSONModel.setProperty("/previewUrl/value", sURL);
				oIFrame.setUrl(sURL);
				//Sets the type of the button to default (not emphasized)
				oEvent.getSource().setType("Default");
			} catch (oError) {
				Log.error("Error previewing the URL: ", oError);
			}
		},

		/**
		 * Event handler for pressing a parameter
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onParameterPress: function(oEvent) {
			var sKey = oEvent.getSource().getBindingContext().getObject().key;
			this._oJSONModel.setProperty("/frameUrl/value", this._addURLParameter(sKey));
		},

		/**
		 * Event handler for search
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onSearch: function(oEvent) {
			var oFilter = new Filter("label", FilterOperator.Contains, oEvent.getParameter("query"));
			var oBinding = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog_ParameterTable").getBinding("items");
			oBinding.filter([oFilter]);
		},

		/**
		 * Build preview URL
		 *
		 * @param {string} sEditURL - URL with parameters in braces
		 * @returns {string} URL with parameters and values
		 * @private
		 */
		_buildPreviewURL: function(sEditURL) {
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
		_addURLParameter: function(sParameter) {
			return this._buildReturnedURL() + sParameter;
		},

		/**
		 * Build URL to be returned
		 *
		 * @returns {string} URL to be returned
		 * @private
		 */
		_buildReturnedURL: function() {
			return urlCleaner(this._oJSONModel.getProperty("/frameUrl/value"));
		},

		/**
		 * Build hashmap for parameters
		 *
		 * @param {object} mParameters - URL parameters
		 * @returns {object} Parameter hashmap
		 * @private
		 */
		_buildParameterHashMap: function(mParameters) {
			if (mParameters && mParameters.parameters) {
				return Utils.buildHashMapFromArray(mParameters.parameters, "key", "value");
			}
			return {};
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
			var oAddIFrameDialog = sap.ui.getCore().byId("sapUiRtaAddIFrameDialog");
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

		/**
		 * Verify that there is no error value state
		 *
		 * @private
		 */
		_areAllValueStateNones: function() {
			var oData = this._oJSONModel.getData();
			return _aTextInputFields.concat(_aNumericInputFields).every(function (sFieldName) {
				return oData[sFieldName]["valueState"] === ValueState.None;
			}, this);
		},

		/**
		 * Verify that there is no empty input string
		 *
		 * @private
		 */
		_areAllTextFieldsValid: function() {
			//TODO: Validate URL
			var oJSONModel = this._oJSONModel;
			return _aTextInputFields.reduce(function(bAllValid, sFieldName) {
				var sValuePath = "/" + sFieldName + "/value";
				var sValueState;
				if (oJSONModel.getProperty(sValuePath).trim() === "") {
					sValueState = ValueState.Error;
				} else {
					sValueState = ValueState.None;
				}
				oJSONModel.setProperty(sValuePath + "State", sValueState);
				return bAllValid && sValueState === ValueState.None;
			}, true);
		},

		/**
		 * Build the returned settings
		 *
		 * @private
		 */
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
				this._oJSONModel.setProperty("/" + sFieldName + "/value", parseInt(aResults[0]));
				this._oJSONModel.setProperty("/" + sFieldName + "Unit/value", aResults[1]);
			}
		},

		/**
		 * Sets the focus on an invalid input
		 * Processed on saving the dialog
		 * Only numerical values are checked
		 * An empty URL field disables the Save button and does not need to be checked
		 *
		 */
		_setFocusOnInvalidInput: function() {
			var oData = this._oJSONModel.getData();
			return _aNumericInputFields.some(function(sFieldName) {
				if (oData[sFieldName]["valueState"] === ValueState.Error) {
					var oElement = sap.ui.getCore().byId(oData[sFieldName]["id"]);
					oElement.focus();
					return true;
				}
			}, this);
		}
	});
});