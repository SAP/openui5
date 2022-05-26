sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Rename action
	var fnConfirmCheckBoxRenamedWithNewValue = function (oCheckBox, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("checkBox").getText(),
			"New Option",
			"then the control has been renamed to the new value (New Option)");
	};

	var fnConfirmCheckBoxIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("checkBox").getText(),
			"Option 1",
			"then the control has been renamed to the old value (Option 1)");
	};

	elementActionTest("Checking the rename action for a CheckBox", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:CheckBox text="Option 1" id="checkBox" />' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "checkBox",
			parameter: function (oView) {
				return {
					newValue: 'New Option',
					renamedElement: oView.byId("checkBox")
				};
			}
		},
		afterAction: fnConfirmCheckBoxRenamedWithNewValue,
		afterUndo: fnConfirmCheckBoxIsRenamedWithOldValue,
		afterRedo: fnConfirmCheckBoxRenamedWithNewValue
	});

	// Remove and reveal actions
	var fnConfirmRadioButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("checkBox").getVisible(), false, "then the checkBox element is invisible");
	};

	var fnConfirmRadioButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("checkBox").getVisible(), true, "then the checkBox element is visible");
	};

	elementActionTest("Checking the remove action for Check Box", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:CheckBox id="checkBox" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "checkBox"
		},
		afterAction: fnConfirmRadioButtonIsInvisible,
		afterUndo: fnConfirmRadioButtonIsVisible,
		afterRedo: fnConfirmRadioButtonIsInvisible
	});
});