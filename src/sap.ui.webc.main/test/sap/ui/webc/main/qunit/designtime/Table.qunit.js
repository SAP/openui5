sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmTableIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("Table1").getVisible(), false, "then the Table element is invisible");
	};

	var fnConfirmTableIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("Table1").getVisible(), true, "then the Table element is visible");
	};

	elementActionTest("Checking the remove action for Table", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:Table id="Table1"/>' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "Table1",
			parameter: function (oView) {
				return {
					removedElement: oView.byId("Table1")
				};
			}
		},
		afterAction: fnConfirmTableIsInvisible,
		afterUndo: fnConfirmTableIsVisible,
		afterRedo: fnConfirmTableIsInvisible
	});

	elementActionTest("Checking the reveal action for an Table", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:Table id="Table1" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "Table1"
		},
		afterAction: fnConfirmTableIsVisible,
		afterUndo: fnConfirmTableIsInvisible,
		afterRedo: fnConfirmTableIsVisible
	});
});