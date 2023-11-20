sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function(QUnitUtils, createAndAppendDiv, elementActionTest) {
	"use strict";
	createAndAppendDiv("content");


	// Remove and reveal actions
	var fnConfirmDatePickerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("datePicker").getVisible(), false, "then the datePicker element is invisible");
	};

	var fnConfirmDatePickerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("datePicker").getVisible(), true, "then the datePicker element is visible");
	};

	elementActionTest("Checking the remove action for DatePicker", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<DatePicker id="datePicker" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "datePicker"
		},
		afterAction: fnConfirmDatePickerIsInvisible,
		afterUndo: fnConfirmDatePickerIsVisible,
		afterRedo: fnConfirmDatePickerIsInvisible
	});

	elementActionTest("Checking the reveal action for a DatePicker", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<DatePicker id="datePicker" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "datePicker"
		},
		afterAction: fnConfirmDatePickerIsVisible,
		afterUndo: fnConfirmDatePickerIsInvisible,
		afterRedo: fnConfirmDatePickerIsVisible
	});
});