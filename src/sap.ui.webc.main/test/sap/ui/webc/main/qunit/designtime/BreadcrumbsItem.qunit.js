sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Rename action
	var fnConfirmBreadcrumbsItemRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getText(),
			"New Option",
			"then the control has been renamed to the new value (New Option)");
	};

	var fnConfirmBreadcrumbsItemIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getText(),
			"Option 1",
			"then the control has been renamed to the old value (Option 1)");
	};

	elementActionTest("Checking the rename action for the Breadcrumbs Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Breadcrumbs>' +
				'<wc:BreadcrumbsItem text="Option 1" id="sli" />' +
			'</wc:Breadcrumbs >' +
		'</mvc:View>',
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
		afterAction: fnConfirmBreadcrumbsItemRenamedWithNewValue,
		afterUndo: fnConfirmBreadcrumbsItemIsRenamedWithOldValue,
		afterRedo: fnConfirmBreadcrumbsItemRenamedWithNewValue
	});

	// Remove and reveal actions
	var fnConfirmBreadcrumbsItemIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getVisible(), false, "then the sli element is invisible");
	};

	var fnConfirmBreadcrumbsItemIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sli").getVisible(), true, "then the sli element is visible");
	};

	elementActionTest("Checking the remove action for Breadcrumbs Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Breadcrumbs>' +
				'<wc:BreadcrumbsItem text="Option 1" id="sli" />' +
			'</wc:Breadcrumbs >' +
		'</mvc:View>',
		action: {
			name: "remove",
			controlId: "sli"
		},
		afterAction: fnConfirmBreadcrumbsItemIsInvisible,
		afterUndo: fnConfirmBreadcrumbsItemIsVisible,
		afterRedo: fnConfirmBreadcrumbsItemIsInvisible
	});
});