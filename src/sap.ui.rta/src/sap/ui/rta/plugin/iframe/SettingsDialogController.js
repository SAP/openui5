/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState",
	"sap/ui/rta/plugin/iframe/URLBuilderDialog"
], function (
	Log,
	Controller,
	ValueState,
	URLBuilderDialog
) {
	"use strict";

	var _aTextInputFields = ["frameUrl"];
	var _aNumericInputFields = ["frameWidth", "frameHeight"];
	var _aSelectInputFields = ["asNewSection", "frameWidthUnit", "frameHeightUnit"];

	return Controller.extend("sap.ui.rta.plugin.iframe.SettingsDialogController", {
		constructor: function (oJSONModel, mSettings) {
			this._oJSONModel = oJSONModel;
			this._importSettings(mSettings);
		},

		/**
		 * Event handler for validation success
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationSuccess: function (oEvent) {
			oEvent.getSource().setValueState(ValueState.None);
			this._oJSONModel.setProperty("/areAllFieldsValid",
				this._areAllTextFieldsValid() && this._areAllValueStateNones());
		},

		/**
		 * Event handler for validation error
		 * @param {sap.ui.base.Event} oEvent - Event
		 */
		onValidationError: function (oEvent) {
			oEvent.getSource().setValueState(ValueState.Error);
			this._oJSONModel.setProperty("/areAllFieldsValid", false);
		},

		/**
		 * Event handler for save button
		 */
		onSavePress: function () {
			if (this._areAllTextFieldsValid() && this._areAllValueStateNones()) {
				this._close(this._buildReturnedSettings());
			}
		},

		/**
		 * Event handler for URL Builder button
		 */
		onURLBuilderPress: function () {
			var oURLBuilderDialog = this._createURLBuilderDialog();
			oURLBuilderDialog.open({
				editURL: this._oJSONModel.getProperty("/frameUrl/value"),
				parameters: this._oJSONModel.getProperty("/urlBuilderParameters/value")
			}).then(function (sUrl) {
				if (sUrl) {
					this._oJSONModel.setProperty("/frameUrl/value", sUrl);
				}
			}.bind(this)).catch(function (oError) {
				Log.error("Error closing URLBuilderDialog: ", oError);
			});
		},

		/**
		 * Create URL Builder Dialog
		 *
		 * @returns {object} URL Builder Dialog
		 * @private
		 */
		_createURLBuilderDialog: function () {
			return new URLBuilderDialog();
		},

		/**
		 * Event handler for Cancel button
		 */
		onCancelPress: function () {
			this._close();
		},

		/**
		 * Close Settings Dialog
		 *
		 * @param {object|undefined} mSettings - iframe settings to be returned
		 * @private
		 */
		_close: function (mSettings) {
			var oSettingsDialog = sap.ui.getCore().byId("sapUiRtaSettingsDialog");
			this._mSettings = mSettings;
			oSettingsDialog.close();
		},

		/**
		 * Get iframe settings
		 *
		 * @returns {object|undefined} Iframe settings
		 * @public
		 */
		getSettings: function () {
			return this._mSettings;
		},

		/**
		 * Verify that there is no error value state
		 *
		 * @private
		 */
		_areAllValueStateNones: function () {
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
		_areAllTextFieldsValid: function () {
			var bValid = true;
			var oData = this._oJSONModel.getData();
			_aTextInputFields.forEach(function (sFieldName) {
				if (oData[sFieldName]["value"].trim() === "") {
					bValid = false;
					this._oJSONModel.setProperty("/" + sFieldName + "/valueState", ValueState.Error);
				}
			}, this);
			return bValid;
		},

		/**
		 * Build the returned settings
		 *
		 * @private
		 */
		_buildReturnedSettings: function () {
			var mSettings = {};
			var oData = this._oJSONModel.getData();
			_aTextInputFields.concat(_aNumericInputFields, _aSelectInputFields).forEach(function (sFieldName) {
				mSettings[sFieldName] = oData[sFieldName].value;
			});
			return mSettings;
		},

		/**
		 * Import settings
		 *
		 * @param {object|undefined} mSettings - Existing iframe settings
		 * @private
		 */
		_importSettings: function (mSettings) {
			if (mSettings) {
				Object.keys(mSettings).forEach(function (sFieldName) {
					if (sFieldName === "frameWidth" || sFieldName === "frameHeight") {
						this._importIframeSize(sFieldName, mSettings[sFieldName]);
					} else {
						this._oJSONModel.setProperty("/" + sFieldName + "/value", mSettings[sFieldName]);
					}
				}, this);
			}
		},

		/**
		 * Import iframe size
		 *
		 * @param  {string} sFieldName - Field name
		 * @param  {string} sSize - Size to import
		 */
		_importIframeSize: function (sFieldName, sSize) {
			var aResults = sSize.split(/(px|rem|%)/);
			if (aResults.length >= 2) {
				this._oJSONModel.setProperty("/" + sFieldName + "/value", parseInt(aResults[0]));
				this._oJSONModel.setProperty("/" + sFieldName + "Unit/value", aResults[1]);
			}
		}
	});
});