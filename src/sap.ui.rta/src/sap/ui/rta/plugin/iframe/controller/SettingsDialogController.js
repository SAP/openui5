/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState"
], function (
	Controller,
	ValueState
) {
	"use strict";

	var _aTextInputFields = ["frameUrl"];
	var _aNumericInputFields = ["frameWidth", "frameHeight"];
	var _aSelectInputFields = ["asNewSection", "frameWidthUnit", "frameHeightUnit"];

	return Controller.extend("sap.ui.rta.plugin.iframe.controller.SettingsDialogController", {
		constructor: function (oJSONModel, mSettings) {
			this._oJSONModel = oJSONModel;
			this._importSettings(mSettings);
		},

		/**
		 * Event handler for validation success
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onValidationSuccess: function (oEvent) {
			oEvent.getSource().setValueState(ValueState.None);
			this._oJSONModel.setProperty("/areAllFieldsValid",
				this._areAllTextFieldsValid() && this._areAllValueStateNones());
		},

		/**
		 * Event handler for validation error
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onValidationError: function (oEvent) {
			oEvent.getSource().setValueState(ValueState.Error);
			this._oJSONModel.setProperty("/areAllFieldsValid", false);
		},

		/**
		 * Event handler for OK button
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onOKPress: function () {
			if (this._areAllTextFieldsValid() && this._areAllValueStateNones()) {
				this._close(this._buildReturnedSettings());
			}
		},

		/**
		 * Event handler for cancel button
		 * @param {sap.ui.base.Event} oEvent the event
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
		 * @returns {object|undefined} mSettings - iframe settings
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
		 * @param {object|undefined} mSettings - existing iframe settings
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
		 * @param  {string} sFieldName - field name
		 * @param  {string} sSize - size to import
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