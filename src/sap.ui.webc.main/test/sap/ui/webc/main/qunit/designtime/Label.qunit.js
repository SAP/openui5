sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmLabelIsRenamedWithNewValue = function (oLabel, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getText(),
			"New Label",
			"then the control has been renamed to the new value (New Label)");
	};

	var fnConfirmLabelIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getText(),
			"Label",
			"then the control has been renamed to the old value (Label)");
	};

	// Remove and reveal actions
	var fnConfirmLabelIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getVisible(), false, "then the label element is invisible");
	};

	var fnConfirmLabelIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label").getVisible(), true, "then the label element is visible");
	};

	elementActionTest("Checking the remove action for Label", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Label id="label" />' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "label"
		},
		afterAction: fnConfirmLabelIsInvisible,
		afterUndo: fnConfirmLabelIsVisible,
		afterRedo: fnConfirmLabelIsInvisible
	});

	elementActionTest("Checking the rename action for a Label", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
			'<wc:Label text="Label" id="label" />' +
			'</mvc:View>',
		action: {
			name: "rename",
			controlId: "label",
			parameter: function (oView) {
				return {
					newValue: 'New Label',
					renamedElement: oView.byId("label")
				};
			}
		},
		afterAction: fnConfirmLabelIsRenamedWithNewValue,
		afterUndo: fnConfirmLabelIsRenamedWithOldValue,
		afterRedo: fnConfirmLabelIsRenamedWithNewValue
	});
});