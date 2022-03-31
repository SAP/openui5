sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmBusyIndicatorIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("busyIndicator").getVisible(), false, "then the busyIndicator element is invisible");
	};

	var fnConfirmBusyIndicatorIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("busyIndicator").getVisible(), true, "then the busyIndicator element is visible");
	};

	elementActionTest("Checking the remove action for BusyIndicator", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:BusyIndicator id="busyIndicator" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "busyIndicator"
		},
		afterAction: fnConfirmBusyIndicatorIsInvisible,
		afterUndo: fnConfirmBusyIndicatorIsVisible,
		afterRedo: fnConfirmBusyIndicatorIsInvisible
	});
});