sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmSideNavigationItemIsRenamedWithNewValue = function (oSidenavigationItem, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sni").getText(),
			"New Side Navigation Item",
			"then the control has been renamed to the new value (New Side Navigation Item)");
	};

	var fnConfirmSideNavigationItemIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sni").getText(),
			"Side Navigation Item",
			"then the control has been renamed to the old value (Side Navigation Item)");
	};

	elementActionTest("Checking the rename action for a Side Navigation Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:SideNavigationItem id="sni" text="Side Navigation Item" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "sni",
			parameter: function (oView) {
				return {
					newValue: 'New Side Navigation Item',
					renamedElement: oView.byId("sni")
				};
			}
		},
		afterAction: fnConfirmSideNavigationItemIsRenamedWithNewValue,
		afterUndo: fnConfirmSideNavigationItemIsRenamedWithOldValue,
		afterRedo: fnConfirmSideNavigationItemIsRenamedWithNewValue
	});
});