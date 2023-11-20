sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmNLIIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("nli").getVisible(), false, "then the Notification List Item element is invisible");
	};

	var fnConfirmNLIIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("nli").getVisible(), true, "then the Notification List Item element is visible");
	};

	elementActionTest("Checking the remove action for Notification List Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:NotificationListItem id="nli" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "nli"
		},
		afterAction: fnConfirmNLIIsInvisible,
		afterUndo: fnConfirmNLIIsVisible,
		afterRedo: fnConfirmNLIIsInvisible
	});
});