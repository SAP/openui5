(function () {
	'use strict';

	sap.ui.require(['sap/ui/rta/test/controlEnablingCheck'], function (rtaControlEnablingCheck) {

		// Rename action
		var fnConfirmCheckBoxRenamedWithNewValue = function (oCheckBox, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("checkBox").getText(),
				"New Option",
				"then the control has been renamed to the new value (New Option)");
		};

		var fnConfirmCheckBoxIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("checkBox").getText(),
				"Option 1",
				"then the control has been renamed to the old value (Option 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a CheckBox", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:CheckBox text="Option 1" id="checkBox" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "checkBox",
				parameter: function (oView) {
					return {
						newValue: 'New Option',
						renamedElement: oView.byId("checkBox")
					};
				}
			},
			afterAction: fnConfirmCheckBoxRenamedWithNewValue,
			afterUndo: fnConfirmCheckBoxIsRenamedWithOldValue,
			afterRedo: fnConfirmCheckBoxRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmCheckBoxIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("checkBox").getVisible(), false, "then the CheckBox element is invisible");
		};

		var fnConfirmCheckBoxIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("checkBox").getVisible(), true, "then the CheckBox element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for CheckBox", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:CheckBox text="Option 1" id="checkBox" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "checkBox",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("checkBox")
					};
				}
			},
			afterAction: fnConfirmCheckBoxIsInvisible,
			afterUndo: fnConfirmCheckBoxIsVisible,
			afterRedo: fnConfirmCheckBoxIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a CheckBox", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:CheckBox text="Option 1" id="checkBox" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "checkBox",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmCheckBoxIsVisible,
			afterUndo: fnConfirmCheckBoxIsInvisible,
			afterRedo: fnConfirmCheckBoxIsVisible
		});
	});
})();