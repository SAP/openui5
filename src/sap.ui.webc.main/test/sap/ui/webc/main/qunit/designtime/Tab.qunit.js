sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmTabIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("tab").getVisible(), false, "then the tab element is invisible");
	};

	var fnConfirmTabIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("tab").getVisible(), true, "then the tab element is visible");
	};

	elementActionTest("Checking the remove action for Tab", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Tab id="tab" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "tab"
		},
		afterAction: fnConfirmTabIsInvisible,
		afterUndo: fnConfirmTabIsVisible,
		afterRedo: fnConfirmTabIsInvisible
	});
});