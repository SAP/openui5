(function () {
	'use strict';

	sap.ui.require(["sap/ui/rta/test/controlEnablingCheck"], function (rtaControlEnablingCheck) {

		// Rename action
		var fnConfirmTextIsRenamedWithNewValue = function (oText, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text").getText(),
				"New Text",
				"then the control has been renamed to the new value (New Text)");
		};

		var fnConfirmTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text").getText(),
				"Text 1",
				"then the control has been renamed to the old value (Text 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Text", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Text text="Text 1" id="text" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "text",
				parameter: function (oView) {
					return {
						newValue: 'New Text',
						renamedElement: oView.byId("text")
					};
				}
			},
			afterAction: fnConfirmTextIsRenamedWithNewValue,
			afterUndo: fnConfirmTextIsRenamedWithOldValue,
			afterRedo: fnConfirmTextIsRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmTextIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text").getVisible(), false, "then the Text element is invisible");
		};

		var fnConfirmTextIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text").getVisible(), true, "then the Text element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Text", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Text text="Text 1" id="text" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "text",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("text")
					};
				}
			},
			afterAction: fnConfirmTextIsInvisible,
			afterUndo: fnConfirmTextIsVisible,
			afterRedo: fnConfirmTextIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a Text", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Text text="Text 1" id="text" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "text",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmTextIsVisible,
			afterUndo: fnConfirmTextIsInvisible,
			afterRedo: fnConfirmTextIsVisible
		});
	});
})();