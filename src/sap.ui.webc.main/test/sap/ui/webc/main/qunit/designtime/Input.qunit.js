sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmInputIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("input").getVisible(), false, "then the Input element is invisible");
	};

	var fnConfirmInputIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("input").getVisible(), true, "then the Input element is visible");
	};

	elementActionTest("Checking the remove action for Input", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:Input id="input" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "input"
		},
		afterAction: fnConfirmInputIsInvisible,
		afterUndo: fnConfirmInputIsVisible,
		afterRedo: fnConfirmInputIsInvisible
	});

	elementActionTest("Checking the reveal action for an Input", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:Input id="input" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "input"
		},
		afterAction: fnConfirmInputIsVisible,
		afterUndo: fnConfirmInputIsInvisible,
		afterRedo: fnConfirmInputIsVisible
	});

});