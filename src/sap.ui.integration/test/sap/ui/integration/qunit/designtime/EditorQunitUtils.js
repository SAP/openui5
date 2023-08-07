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

	EditorQunitUtils.isReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.openColumnMenu = function(oColumn, assert) {
		return new Promise(function(resolve) {
			var oMenu = oColumn.getHeaderMenuInstance();
			assert.ok(oMenu, "EditorQunitUtils openColumnMenu: header menu instance ok");
			// init popover since it may be not initialized
			oMenu._initPopover();
			assert.ok(true, "EditorQunitUtils openColumnMenu: initPopover of menu ok");
			var oPopover = oMenu._oPopover;
			assert.ok(oPopover, "EditorQunitUtils openColumnMenu: popover of menu ok");
			// attach to event afterOpen
			oPopover.attachEventOnce("afterOpen", function() {
				assert.ok(true, "EditorQunitUtils openColumnMenu: afterOpen event of popover ok");
				resolve();
			});
			var oElement = oColumn.getDomRef();
			assert.ok(oElement, "EditorQunitUtils openColumnMenu: column domref ok");
			QUnitUtils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
			QUnitUtils.triggerMouseEvent(oElement, "click");
		});
	};

	EditorQunitUtils.tableUpdated = function(oField) {
		return new Promise(function(resolve) {
			oField.attachEventOnce("tableUpdated", function() {
				resolve();
			});
		});
	};

	return EditorQunitUtils;
});
