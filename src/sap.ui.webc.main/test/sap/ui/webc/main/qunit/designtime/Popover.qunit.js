sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmPopoverIsRenamedWithNewValue = function (oPopover, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("popover").getHeaderText(),
			"New Popover",
			"then the control has been renamed to the new value (New Popover)");
	};

	var fnConfirmPopoverIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("popover").getHeaderText(),
			"Popover",
			"then the control has been renamed to the old value (Popover)");
	};

	// Remove and reveal actions
	var fnConfirmPopoverIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("popover").getVisible(), false, "then the popover element is invisible");
	};

	var fnConfirmPopoverIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("popover").getVisible(), true, "then the popover element is visible");
	};

	elementActionTest("Checking the remove action for Popover", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Popover id="popover" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "popover"
		},
		afterAction: fnConfirmPopoverIsInvisible,
		afterUndo: fnConfirmPopoverIsVisible,
		afterRedo: fnConfirmPopoverIsInvisible
	});

	elementActionTest("Checking the rename action for a Popover", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Popover id="popover" headerText="Popover" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "popover",
			parameter: function (oView) {
				return {
					newValue: 'New Popover',
					renamedElement: oView.byId("popover")
				};
			}
		},
		afterAction: fnConfirmPopoverIsRenamedWithNewValue,
		afterUndo: fnConfirmPopoverIsRenamedWithOldValue,
		afterRedo: fnConfirmPopoverIsRenamedWithNewValue
	});
});