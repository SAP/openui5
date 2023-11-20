sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmBadgeIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("badge").getVisible(), false, "then the badge element is invisible");
	};

	var fnConfirmBadgeIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("badge").getVisible(), true, "then the badge element is visible");
	};

	elementActionTest("Checking the remove action for Badge", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Badge id="badge" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "badge"
		},
		afterAction: fnConfirmBadgeIsInvisible,
		afterUndo: fnConfirmBadgeIsVisible,
		afterRedo: fnConfirmBadgeIsInvisible
	});
});