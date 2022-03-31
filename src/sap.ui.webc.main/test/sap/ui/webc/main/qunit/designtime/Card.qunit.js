sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmCardIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("card").getVisible(), false, "then the card element is invisible");
	};

	var fnConfirmCardIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("card").getVisible(), true, "then the card element is visible");
	};

	elementActionTest("Checking the remove action for Card", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Card id="card" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "card"
		},
		afterAction: fnConfirmCardIsInvisible,
		afterUndo: fnConfirmCardIsVisible,
		afterRedo: fnConfirmCardIsInvisible
	});
});