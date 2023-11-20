sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmDialogIsRenamedWithNewValue = function (oDialog, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("dialog").getHeaderText(),
			"New Dialog",
			"then the control has been renamed to the new value (New Dialog)");
	};

	var fnConfirmDialogIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("dialog").getHeaderText(),
			"Dialog",
			"then the control has been renamed to the old value (Dialog)");
	};

	// Remove and reveal actions
	var fnConfirmDialogIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("dialog").getVisible(), false, "then the dialog element is invisible");
	};

	var fnConfirmDialogIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("dialog").getVisible(), true, "then the dialog element is visible");
	};

	elementActionTest("Checking the remove action for Dialog", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Dialog id="dialog" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "dialog"
		},
		afterAction: fnConfirmDialogIsInvisible,
		afterUndo: fnConfirmDialogIsVisible,
		afterRedo: fnConfirmDialogIsInvisible
	});

	elementActionTest("Checking the rename action for a Dialog", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Dialog id="dialog" headerText="Dialog" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "dialog",
			parameter: function (oView) {
				return {
					newValue: 'New Dialog',
					renamedElement: oView.byId("dialog")
				};
			}
		},
		afterAction: fnConfirmDialogIsRenamedWithNewValue,
		afterUndo: fnConfirmDialogIsRenamedWithOldValue,
		afterRedo: fnConfirmDialogIsRenamedWithNewValue
	});
});