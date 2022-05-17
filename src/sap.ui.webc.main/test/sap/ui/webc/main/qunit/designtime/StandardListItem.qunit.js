sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Rename action
	var fnConfirmStandardListItemRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getText(),
			"New Option",
			"then the control has been renamed to the new value (New Option)");
	};

	var fnConfirmStandardListItemIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getText(),
			"Option 1",
			"then the control has been renamed to the old value (Option 1)");
	};

	elementActionTest("Checking the rename action for the Standard List Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:List >' +
				'<wc:StandardListItem text="Option 1" id="sli" />' +
			'</wc:List >' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "sli",
			parameter: function (oView) {
				return {
					newValue: 'New Option',
					renamedElement: oView.byId("sli")
				};
			}
		},
		afterAction: fnConfirmStandardListItemRenamedWithNewValue,
		afterUndo: fnConfirmStandardListItemIsRenamedWithOldValue,
		afterRedo: fnConfirmStandardListItemRenamedWithNewValue
	});

	// Remove and reveal actions
	var fnConfirmStandardListItemIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getVisible(), false, "then the sli element is invisible");
	};

	var fnConfirmStandardListItemIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getVisible(), true, "then the sli element is visible");
	};

	elementActionTest("Checking the remove action for Standard List Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:List >' +
				'<wc:StandardListItem text="Option 1" id="sli" />' +
			'</wc:List >' +
		'</mvc:View>',
		action: {
			name: "remove",
			controlId: "sli"
		},
		afterAction: fnConfirmStandardListItemIsInvisible,
		afterUndo: fnConfirmStandardListItemIsVisible,
		afterRedo: fnConfirmStandardListItemIsInvisible
	});
});