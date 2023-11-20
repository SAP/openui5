sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmResponsivePopoverIsRenamedWithNewValue = function (oResponsivePopover, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("responsivePopover").getHeaderText(),
			"New ResponsivePopover",
			"then the control has been renamed to the new value (New ResponsivePopover)");
	};

	var fnConfirmResponsivePopoverIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("responsivePopover").getHeaderText(),
			"ResponsivePopover",
			"then the control has been renamed to the old value (ResponsivePopover)");
	};

	// Remove and reveal actions
	var fnConfirmResponsivePopoverIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("responsivePopover").getVisible(), false, "then the responsivePopover element is invisible");
	};

	var fnConfirmResponsivePopoverIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("responsivePopover").getVisible(), true, "then the responsivePopover element is visible");
	};

	elementActionTest("Checking the remove action for ResponsivePopover", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:ResponsivePopover id="responsivePopover" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "responsivePopover"
		},
		afterAction: fnConfirmResponsivePopoverIsInvisible,
		afterUndo: fnConfirmResponsivePopoverIsVisible,
		afterRedo: fnConfirmResponsivePopoverIsInvisible
	});

	elementActionTest("Checking the rename action for a ResponsivePopover", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:ResponsivePopover id="responsivePopover" headerText="ResponsivePopover" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "responsivePopover",
			parameter: function (oView) {
				return {
					newValue: 'New ResponsivePopover',
					renamedElement: oView.byId("responsivePopover")
				};
			}
		},
		afterAction: fnConfirmResponsivePopoverIsRenamedWithNewValue,
		afterUndo: fnConfirmResponsivePopoverIsRenamedWithOldValue,
		afterRedo: fnConfirmResponsivePopoverIsRenamedWithNewValue
	});
});