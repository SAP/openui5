sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Rename action
	var fnConfirmNavListItemIsRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("navigationListItem").getText(),
			"New Value",
			"then the control has been renamed to the new value (New Value)");
	};

	var fnConfirmNavListItemIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("navigationListItem").getText(),
			"Item 1",
			"then the control has been renamed to the old value (Item 1)");
	};

	elementActionTest("Checking the rename action for a Navigation List Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:tnt="sap.tnt">"' +
		'<tnt:NavigationList id="navigationList">' +
			'<tnt:NavigationListItem text="Item 1" id="navigationListItem" />' +
			'</tnt:NavigationList>' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "navigationListItem",
			parameter: function (oView) {
				return {
					newValue: 'New Value',
					renamedElement: oView.byId("navigationListItem")
				};
			}
		},
		afterAction: fnConfirmNavListItemIsRenamedWithNewValue,
		afterUndo: fnConfirmNavListItemIsRenamedWithOldValue,
		afterRedo: fnConfirmNavListItemIsRenamedWithNewValue
	});

});