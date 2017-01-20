(function () {
	'use strict';

	sap.ui.require(["sap/ui/rta/test/controlEnablingCheck"], function (rtaControlEnablingCheck) {

		// Remove and reveal actions
		var fnConfirmInputIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("input").getVisible(), false, "then the InputBase element is invisible");
		};

		var fnConfirmInputIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("input").getVisible(), true, "then the InputBase element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for InputBase", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:InputBase id="input" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "input"
			},
			afterAction: fnConfirmInputIsInvisible,
			afterUndo: fnConfirmInputIsVisible,
			afterRedo: fnConfirmInputIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for an InputBase", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:InputBase id="input" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "input"
			},
			afterAction: fnConfirmInputIsVisible,
			afterUndo: fnConfirmInputIsInvisible,
			afterRedo: fnConfirmInputIsVisible
		});
	});
})();