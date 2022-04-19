sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

		var fnConfirmTabIsRenamedWithNewValue = function (oTab, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("tab").getText(),
				"New Tab",
				"then the control has been renamed to the new value (New Tab)");
		};

		var fnConfirmTabIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("tab").getText(),
				"Tab",
				"then the control has been renamed to the old value (Tab)");
		};

		elementActionTest("Checking the rename action for a Tab", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
				'<wc:Tab text="Tab" id="tab" />' +
				'</mvc:View>',
			action: {
				name: "rename",
				controlId: "tab",
				parameter: function (oView) {
					return {
						newValue: 'New Tab',
						renamedElement: oView.byId("tab")
					};
				}
			},
			afterAction: fnConfirmTabIsRenamedWithNewValue,
			afterUndo: fnConfirmTabIsRenamedWithOldValue,
			afterRedo: fnConfirmTabIsRenamedWithNewValue
		});
});