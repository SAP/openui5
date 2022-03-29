sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
	"use strict";

	// Remove and reveal actions
	var fnConfirmDatePickerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("datePicker").getVisible(), false, "then the datePicker element is invisible");
	};

	var fnConfirmDatePickerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("datePicker").getVisible(), true, "then the datePicker element is visible");
	};

	elementActionTest("Checking the remove action for DatePicker", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
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
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
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