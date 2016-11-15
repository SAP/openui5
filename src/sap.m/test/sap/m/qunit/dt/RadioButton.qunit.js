(function () {
	'use strict';

	sap.ui.require(["sap/ui/rta/test/controlEnablingCheck"], function (rtaControlEnablingCheck) {

		// Rename action
		var fnConfirmRadioButtonRenamedWithNewValue = function (oRadioButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("radioButton").getText(),
				"New Option",
				"then the control has been renamed to the new value (New Option)");
		};

		var fnConfirmRadioButtonIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("radioButton").getText(),
				"Option 1",
				"then the control has been renamed to the old value (Option 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a RadioButton", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:RadioButton text="Option 1" id="radioButton" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "radioButton",
				parameter: function (oView) {
					return {
						newValue: 'New Option',
						renamedElement: oView.byId("radioButton")
					};
				}
			},
			afterAction: fnConfirmRadioButtonRenamedWithNewValue,
			afterUndo: fnConfirmRadioButtonIsRenamedWithOldValue,
			afterRedo: fnConfirmRadioButtonRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmRadioButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("radioButton").getVisible(), false, "then the RadioButton element is invisible");
		};

		var fnConfirmRadioButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("radioButton").getVisible(), true, "then the RadioButton element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for RadioButton", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:RadioButton text="Option 1" id="radioButton" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "radioButton",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("radioButton")
					};
				}
			},
			afterAction: fnConfirmRadioButtonIsInvisible,
			afterUndo: fnConfirmRadioButtonIsVisible,
			afterRedo: fnConfirmRadioButtonIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a RadioButton", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:RadioButton text="Option 1" id="radioButton" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "radioButton",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmRadioButtonIsVisible,
			afterUndo: fnConfirmRadioButtonIsInvisible,
			afterRedo: fnConfirmRadioButtonIsVisible
		});
	});
})();