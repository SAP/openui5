sap.ui.define([
	"sap/ui/layout/Splitter",
	"sap/m/Button",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	Splitter,
	Button,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.ui.layout.Splitter",
			create: function () {
				return new Splitter({
					contentAreas: [
						new Button(),
						new Button()
					],
					orientation: "Vertical"
				});
			}
		});
	})
	.then(function() {
		// Move action
		var fnConfirmElement1IsOn2ndPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("btn1").getId(),
				oViewAfterAction.byId("splitter").getContentAreas()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("btn1").getId(),
				oViewAfterAction.byId("splitter").getContentAreas()[0].getId(),
				"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for Splitter control", {
			xmlView: '<mvc:View xmlns:l="sap.ui.layout" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<l:Splitter id="splitter" height="500px">' +
					'<l:contentAreas>' +
						'<Button id="btn1" text="Content 1">' +
							'<layoutData><l:SplitterLayoutData size="300px" /></layoutData>' +
						'</Button>' +
						'<Button id="btn2" text="Content 2">' +
							'<layoutData><l:SplitterLayoutData size="300px" /></layoutData>' +
						'</Button>' +
					'</l:contentAreas>' +
				'</l:Splitter>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "splitter",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("btn1"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "contentAreas",
							parent: oView.byId("splitter")
						},
						target: {
							aggregation: "contentAreas",
							parent: oView.byId("splitter")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn2ndPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn2ndPosition
		});

		// Remove and reveal actions
		var fnConfirmSplitterIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("splitter").getVisible(), false, "then the Splitter element is invisible");
		};

		var fnConfirmSplitterIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("splitter").getVisible(), true, "then the Splitter element is visible");
		};

		elementActionTest("Checking the remove action for sap.ui.layout.Splitter", {
			xmlView: '<mvc:View xmlns:l="sap.ui.layout" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<l:Splitter id="splitter" height="500px">' +
					'<l:contentAreas>' +
						'<Button id="btn1" text="Content 1">' +
							'<layoutData><l:SplitterLayoutData size="300px" /></layoutData>' +
						'</Button>' +
						'<Button id="btn2" text="Content 2">' +
							'<layoutData><l:SplitterLayoutData size="300px" /></layoutData>' +
						'</Button>' +
					'</l:contentAreas>' +
				'</l:Splitter>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "splitter"
			},
			afterAction: fnConfirmSplitterIsInvisible,
			afterUndo: fnConfirmSplitterIsVisible,
			afterRedo: fnConfirmSplitterIsInvisible
		});

		elementActionTest("Checking the reveal action for a sap.ui.layoutSplitter", {
			xmlView: '<mvc:View xmlns:l="sap.ui.layout" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<l:Splitter id="splitter" height="500px" visible="false">' +
					'<l:contentAreas>' +
						'<Button id="btn1" text="Content 1">' +
							'<layoutData><l:SplitterLayoutData size="300px" /></layoutData>' +
						'</Button>' +
						'<Button id="btn2" text="Content 2">' +
							'<layoutData><l:SplitterLayoutData size="300px" /></layoutData>' +
						'</Button>' +
					'</l:contentAreas>' +
				'</l:Splitter>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "splitter"
			},
			afterAction: fnConfirmSplitterIsVisible,
			afterUndo: fnConfirmSplitterIsInvisible,
			afterRedo: fnConfirmSplitterIsVisible
		});
	});
});
