sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	// Remove and reveal actions
	var fnConfirmRadioButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("radioButton").getVisible(), false, "then the radioButton element is invisible");
	};

	var fnConfirmRadioButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("radioButton").getVisible(), true, "then the radioButton element is visible");
	};

	elementActionTest("Checking the remove action for Radio Button", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:RadioButton id="radioButton" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "radioButton"
		},
		afterAction: fnConfirmRadioButtonIsInvisible,
		afterUndo: fnConfirmRadioButtonIsVisible,
		afterRedo: fnConfirmRadioButtonIsInvisible
	});
});