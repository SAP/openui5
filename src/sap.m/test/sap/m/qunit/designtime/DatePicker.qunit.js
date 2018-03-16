(function () {
	"use strict";

	sap.ui.require(["sap/ui/rta/test/controlEnablingCheck"], function (rtaControlEnablingCheck) {
		// Remove and reveal actions
		var fnConfirmDatePickerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("datePicker").getVisible(), false, "then the datePicker element is invisible");
		};

		var fnConfirmDatePickerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("datePicker").getVisible(), true, "then the datePicker element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for DatePicker", {
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

		rtaControlEnablingCheck("Checking the reveal action for a DatePicker", {
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
})();