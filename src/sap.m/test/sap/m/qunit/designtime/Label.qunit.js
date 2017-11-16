(function () {
	'use strict';

	sap.ui.require(["sap/ui/rta/test/controlEnablingCheck"], function (rtaControlEnablingCheck) {

		// Rename action
		var fnConfirmLabelIsRenamedWithNewValue = function (oLabel, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("label").getText(),
				"New Value",
				"then the control has been renamed to the new value (New Value)");
		};

		var fnConfirmLabelIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("label").getText(),
				"Label 1",
				"then the control has been renamed to the old value (Label 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Label", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Label text="Label 1" id="label" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "label",
				parameter: function (oView) {
					return {
						newValue: 'New Value',
						renamedElement: oView.byId("label")
					};
				}
			},
			afterAction: fnConfirmLabelIsRenamedWithNewValue,
			afterUndo: fnConfirmLabelIsRenamedWithOldValue,
			afterRedo: fnConfirmLabelIsRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmLabelIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("label").getVisible(), false, "then the Label element is invisible");
		};

		var fnConfirmLabelIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("label").getVisible(), true, "then the Label element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Label", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Label text="Label 1" id="label" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "label",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("label")
					};
				}
			},
			afterAction: fnConfirmLabelIsInvisible,
			afterUndo: fnConfirmLabelIsVisible,
			afterRedo: fnConfirmLabelIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a Label", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Label text="Label 1" id="label" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "label",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmLabelIsVisible,
			afterUndo: fnConfirmLabelIsInvisible,
			afterRedo: fnConfirmLabelIsVisible
		});
	});
})();