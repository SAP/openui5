sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
	"use strict";

	// Remove and reveal actions
	var fnConfirmDatePickerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("dateTimePicker").getVisible(), false, "then the dateTimePicker element is invisible");
	};

	var fnConfirmDatePickerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("dateTimePicker").getVisible(), true, "then the dateTimePicker element is visible");
	};

	elementActionTest("Checking the remove action for DateTimePicker", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<DateTimePicker id="dateTimePicker" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "dateTimePicker"
		},
		afterAction: fnConfirmDatePickerIsInvisible,
		afterUndo: fnConfirmDatePickerIsVisible,
		afterRedo: fnConfirmDatePickerIsInvisible
	});

	elementActionTest("Checking the reveal action for a DateTimePicker", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<DateTimePicker id="dateTimePicker" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "dateTimePicker"
		},
		afterAction: fnConfirmDatePickerIsVisible,
		afterUndo: fnConfirmDatePickerIsInvisible,
		afterRedo: fnConfirmDatePickerIsVisible
	});
});