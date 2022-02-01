sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmInputIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("MI").getVisible(), false, "then the MultiInput element is invisible");
	};

	var fnConfirmInputIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("MI").getVisible(), true, "then the MultiInput element is visible");
	};

	elementActionTest("Checking the remove action for MultiInput", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:MultiInput id="MI"/>' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "MI"
		},
		afterAction: fnConfirmInputIsInvisible,
		afterUndo: fnConfirmInputIsVisible,
		afterRedo: fnConfirmInputIsInvisible
	});

	elementActionTest("Checking the reveal action for an MultiInput", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:MultiInput id="MI" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "MI"
		},
		afterAction: fnConfirmInputIsVisible,
		afterUndo: fnConfirmInputIsInvisible,
		afterRedo: fnConfirmInputIsVisible
	});
});