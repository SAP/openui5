sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmSideNavigationSubItemIsRenamedWithNewValue = function (oSideNavigationSubItem, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("snsi").getText(),
			"New Side Navigation Sub Item",
			"then the control has been renamed to the new value (New Side Navigation Sub Item)");
	};

	var fnConfirmSideNavigationSubItemIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("snsi").getText(),
			"Side Navigation Sub Item",
			"then the control has been renamed to the old value (Side Navigation Sub Item)");
	};

	elementActionTest("Checking the rename action for a Side Navigation Sub Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:SideNavigationSubItem id="snsi" text="Side Navigation Sub Item" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "snsi",
			parameter: function (oView) {
				return {
					newValue: 'New Side Navigation Sub Item',
					renamedElement: oView.byId("snsi")
				};
			}
		},
		afterAction: fnConfirmSideNavigationSubItemIsRenamedWithNewValue,
		afterUndo: fnConfirmSideNavigationSubItemIsRenamedWithOldValue,
		afterRedo: fnConfirmSideNavigationSubItemIsRenamedWithNewValue
	});
});