sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(elementActionTest) {
	'use strict';

	var fnConfirmButtonIsRenamedWithNewValue = function (oButton, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("button").getText(),
			"New Option",
			"then the control has been renamed to the new value (New Option)");
	};

	var fnConfirmButtonIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("button").getText(),
			"Option 1",
			"then the control has been renamed to the old value (Option 1)");
	};

	// Remove and reveal actions
	var fnConfirmButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("button").getVisible(), false, "then the button element is invisible");
	};

	var fnConfirmButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("button").getVisible(), true, "then the button element is visible");
	};

	elementActionTest("Checking the remove action for Button", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:Button id="button" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "button"
		},
		afterAction: fnConfirmButtonIsInvisible,
		afterUndo: fnConfirmButtonIsVisible,
		afterRedo: fnConfirmButtonIsInvisible
	});

	elementActionTest("Checking the rename action for a Button", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.main">"' +
		'<wc:Button text="Option 1" id="button" />' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "button",
			parameter: function (oView) {
				return {
					newValue: 'New Option',
					renamedElement: oView.byId("button")
				};
			}
		},
		afterAction: fnConfirmButtonIsRenamedWithNewValue,
		afterUndo: fnConfirmButtonIsRenamedWithOldValue,
		afterRedo: fnConfirmButtonIsRenamedWithNewValue
	});
});