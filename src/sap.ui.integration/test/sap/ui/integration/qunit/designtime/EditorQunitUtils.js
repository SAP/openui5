sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function(
	QUnitUtils,
	KeyCodes
) {
	"use strict";

	var EditorQunitUtils = {};

	/**
	 * @param {sap.m.Input} oControl - Control to set the value on
	 * @param {string} sValue - Value to set
	*/
	EditorQunitUtils.setInputValue = function(oControl, sValue) {
		var oInputControl = oControl.$("inner");
		oInputControl.focus();
		oInputControl.val(sValue);
		QUnitUtils.triggerEvent("input", oInputControl);
	};

	/**
	 * @param {sap.m.SearchField} oControl - Control to set the value on
	 * @param {string} sValue - Value to set
	*/
	EditorQunitUtils.setSearchFieldValue = function(oControl, sValue) {
		var oInputControl = oControl.$("I");
		oInputControl.focus();
		oInputControl.val(sValue);
		QUnitUtils.triggerEvent("input", oInputControl);
	};

	/**
	 * @param {sap.m.ComboBox} oControl - Control to set the value on
	 * @param {string} sKey - Value to select from the available options
	*/
	EditorQunitUtils.selectComboBoxValue = function(oControl, sKey) {
		var sValue = oControl.getItemByKey(sKey).getText();
		this.setInputValueAndConfirm(oControl, sValue);
	};

	/**
	 * @param {sap.m.InputBase} oControl - Control to set the value on
	 * @param {string} sValue - Custom value to set
	*/
	EditorQunitUtils.setInputValueAndConfirm = function(oControl, sValue) {
		this.setInputValue(oControl, sValue);
		var oControlDomRef = oControl.getDomRef();
		QUnitUtils.triggerKeydown(oControlDomRef, KeyCodes.ENTER);
	};

	/**
	 * @param {sap.m.MultiInput} oControl - Control to add the value to
	 * @param {string} sValue - Value to add
	*/
	EditorQunitUtils.addToMultiInput = function(oControl, sValue) {
		this.setInputValue(oControl, sValue);
		QUnitUtils.triggerKeydown(oControl.getDomRef(), KeyCodes.ENTER);
	};

	return EditorQunitUtils;
});
