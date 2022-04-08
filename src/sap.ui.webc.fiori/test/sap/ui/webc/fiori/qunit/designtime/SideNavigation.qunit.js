sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmSNIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sn").getVisible(), false, "then the Side Navigation element is invisible");
	};

	var fnConfirmSNIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("sn").getVisible(), true, "then the Side Navigation element is visible");
	};

	elementActionTest("Checking the remove action for Side Navigation", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:SideNavigation id="sn" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "sn"
		},
		afterAction: fnConfirmSNIsInvisible,
		afterUndo: fnConfirmSNIsVisible,
		afterRedo: fnConfirmSNIsInvisible
	});
});