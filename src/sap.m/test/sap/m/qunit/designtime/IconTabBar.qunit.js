sap.ui.define([
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/Button",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	IconTabBar,
	IconTabFilter,
	Button,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.IconTabBar",
			create: function () {
				return new IconTabBar("tabbar", {
					items: [
						new IconTabFilter("first", {
							text: "First Tab"
						})
					],
					content: [
						new Button("first-content", { text: "first content" })
					]
				});
			}
		});
	})
	.then(function() {
		var fnGetTabBarView = function (sId) {
			return 	'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<IconTabBar id="' + sId + '">' +
					'<items>' +
						'<IconTabFilter id="first" />' +
						'<IconTabFilter id="second" />' +
						'<IconTabFilter id="third" />' +
					'</items>' +
					'<content>' +
						'<Button id="first-content" />' +
						'<Button id="second-content" />' +
						'<Button id="third-content" />' +
					'</content>' +
				'</IconTabBar>' +
			'</mvc:View>';
		};

		var fnGetConfirmElementPositionAssert = function (sTabBarId, iPosition, sMovedElementId, sAggregationName) {
			return function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId(sMovedElementId).getId(),
				oViewAfterAction.byId(sTabBarId)["get" + sAggregationName]()[iPosition].getId(),
				"then the control has been moved to the right position");
			};
		};

		var fnGetMoveActionObject = function (sControlId, sMovedElementId, sAggregationName) {
			return {
				name: "move",
				controlId: sControlId,
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId(sMovedElementId),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: sAggregationName,
							parent: oView.byId(sControlId),
							publicAggregation: sAggregationName,
							publicParent: oView.byId(sControlId)
						},
						target: {
							aggregation: sAggregationName,
							parent: oView.byId(sControlId),
							publicAggregation: sAggregationName,
							publicParent: oView.byId(sControlId)
						}
					};
				}
			};
		};

		// Move action for items
		elementActionTest("Checking the move action for IconTabBar control items", {
			xmlView: fnGetTabBarView("tabbar"),
			action: fnGetMoveActionObject("tabbar", "first", "items"),
			afterAction: fnGetConfirmElementPositionAssert("tabbar", 2, "first", "Items"),
			afterUndo: fnGetConfirmElementPositionAssert("tabbar", 0, "first", "Items"),
			afterRedo: fnGetConfirmElementPositionAssert("tabbar", 2, "first", "Items")
		});

		// Move action for content
		elementActionTest("Checking the move action for IconTabBar control content", {
			xmlView: fnGetTabBarView("tabbar2"),
			action: fnGetMoveActionObject("tabbar2", "first-content", "content"),
			afterAction: fnGetConfirmElementPositionAssert("tabbar2", 2, "first-content", "Content"),
			afterUndo: fnGetConfirmElementPositionAssert("tabbar2", 0, "first-content", "Content"),
			afterRedo: fnGetConfirmElementPositionAssert("tabbar2", 2, "first-content", "Content")
		});
	});

});