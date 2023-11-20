sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmTabContainerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("tabContainer").getVisible(), false, "then the tabContainer element is invisible");
	};

	var fnConfirmTabContainerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("tabContainer").getVisible(), true, "then the tabContainer element is visible");
	};

	elementActionTest("Checking the remove action for TabContainer", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:TabContainer id="tabContainer" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "tabContainer"
		},
		afterAction: fnConfirmTabContainerIsInvisible,
		afterUndo: fnConfirmTabContainerIsVisible,
		afterRedo: fnConfirmTabContainerIsInvisible
	});
});