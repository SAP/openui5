sap.ui.define([
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function(
	FlexBox,
	Text,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.FlexBox",
			create: function () {
				return new FlexBox({
					items: [
						new Text({text: "Text"}),
						new Text({text: "Text"})
					]
				});
			}
		});
	})
	.then(function() {
		// Move action
		var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("flexBox").getItems()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("flexBox").getItems()[0].getId(),
				"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for FlexBox control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<FlexBox id="flexBox">' +
			'<Text text="Text 1" id="text1" />' +
			'<Text text="Text 2" id="text2" />' +
			'<Text text="Text 3" id="text3" />' +
			'</FlexBox>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "flexBox",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "items",
							parent: oView.byId("flexBox"),
							publicAggregation: "items",
							publicParent: oView.byId("flexBox")
						},
						target: {
							aggregation: "items",
							parent: oView.byId("flexBox"),
							publicAggregation: "items",
							publicParent: oView.byId("flexBox")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});

		// Remove and reveal actions
		var fnConfirmFlexBoxIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("flexBox").getVisible(), false, "then the FlexBox element is invisible");
		};

		var fnConfirmFlexBoxIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("flexBox").getVisible(), true, "then the FlexBox element is visible");
		};

		elementActionTest("Checking the remove action for FlexBox", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<FlexBox id="flexBox">' +
			'<Text text="Text 1" id="text1" />' +
			'</FlexBox>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "flexBox"
			},
			afterAction: fnConfirmFlexBoxIsInvisible,
			afterUndo: fnConfirmFlexBoxIsVisible,
			afterRedo: fnConfirmFlexBoxIsInvisible
		});

		elementActionTest("Checking the reveal action for a FlexBox", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<FlexBox id="flexBox" visible="false">' +
			'<Text text="Text 1" id="text1" />' +
			'</FlexBox>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "flexBox"
			},
			afterAction: fnConfirmFlexBoxIsVisible,
			afterUndo: fnConfirmFlexBoxIsInvisible,
			afterRedo: fnConfirmFlexBoxIsVisible
		});
	});
});