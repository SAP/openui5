sap.ui.define([
	"sap/m/CustomListItem",
	"sap/m/Button",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function(
	CustomListItem,
	Button,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.CustomListItem",
			create: function () {
				return new CustomListItem({
					content: [
						new Button({text:"Button"})
					]
				});
			}
		});
	})
	.then(function () {
		// Move action
		var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myCustomListItem").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myCustomListItem").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for CustomListItem control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<ListBase id="myList">' +
			'<CustomListItem id="myCustomListItem">' +
			'<Text id="text1" />' +
			'<Text id="text2" />' +
			'<Text id="text3" />' +
			'</CustomListItem>' +
			'</ListBase>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myCustomListItem",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("myCustomListItem"),
							publicAggregation: "content",
							publicParent: oView.byId("myCustomListItem")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("myCustomListItem"),
							publicAggregation: "content",
							publicParent: oView.byId("myCustomListItem")
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