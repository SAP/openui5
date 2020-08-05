sap.ui.define([
	'dt/Toolbar',
	'sap/ui/dt/enablement/elementDesigntimeTest',
	'sap/ui/rta/enablement/elementActionTest'
], function (
	Toolbar,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Toolbar",
			create: Toolbar.create,
			timeout: Toolbar.timeout
		});
	})
	.then(function() {
		// Move action
		var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button1").getId(),
					oViewAfterAction.byId("toolbar").getContent()[2].getId(),
					"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("button1").getId(),
					oViewAfterAction.byId("toolbar").getContent()[0].getId(),
					"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for a Toolbar control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Toolbar id="toolbar">' +
			'<Button text="Button 1" id="button1" />' +
			'<Button text="Button 2" id="button2" />' +
			'<Button text="Button 3" id="button3" />' +
			'</Toolbar>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "toolbar",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("button1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("toolbar"),
							publicAggregation: "content",
							publicParent: oView.byId("toolbar")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("toolbar"),
							publicAggregation: "content",
							publicParent: oView.byId("toolbar")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});
	});
});