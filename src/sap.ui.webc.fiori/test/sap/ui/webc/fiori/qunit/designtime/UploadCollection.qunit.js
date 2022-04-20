sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmUCIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("uc").getVisible(), false, "then the Upload Collection element is invisible");
	};

	var fnConfirmUCIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("uc").getVisible(), true, "then the Upload Collection Item element is visible");
	};

	elementActionTest("Checking the remove action for Upload Collection", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:UploadCollection id="uc" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "uc"
		},
		afterAction: fnConfirmUCIsInvisible,
		afterUndo: fnConfirmUCIsVisible,
		afterRedo: fnConfirmUCIsInvisible
	});
});