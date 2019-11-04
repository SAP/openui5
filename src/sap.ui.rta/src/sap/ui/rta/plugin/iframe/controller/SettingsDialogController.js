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

	var _aTextInputFields = ["sectionName", "frameUrl"];
	var _aNumericInputFields = ["frameWidth", "frameHeigth"];

	return Controller.extend("sap.ui.rta.plugin.iframe.controller.SettingsDialogController", {
		constructor: function (oJSONModel) {
			this._oJSONModel = oJSONModel;
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
		onOKPress: function () {},

		/**
		 * Event handler for cancel button
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onCancelPress: function () {},

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
		}
	});
});