sap.ui.define([
	"sap/m/ListBase",
	"sap/m/StandardListItem",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function(
	ListBase,
	ListItem,
	Button,
	Toolbar,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.ListBase",
			create: function () {
				return new ListBase({
					items: new ListItem({title: "List Item"}),
					headerToolbar: new Toolbar(),
					swipeContent: new Button(),
					infoToolbar: new Toolbar()
				});
			}
		});
	})
	.then(function() {
		//Move action
		var fnConfirmListItem1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("listItem1").getId(),
				oViewAfterAction.byId("list").getItems()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmListItem1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("listItem1").getId(),
				oViewAfterAction.byId("list").getItems()[0].getId(),
				"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for a ListBase", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">' +
				'<m:ListBase id="list">' +
					'<m:StandardListItem id="listItem1" title="1st Item"/>' +
					'<m:StandardListItem id="listItem2" title="2nd Item"/>' +
					'<m:StandardListItem id="listItem3" title="3rd Item"/>' +
				'</m:ListBase>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "list",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("listItem1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "items",
							parent: oView.byId("list"),
							publicAggregation: "items",
							publicParent: oView.byId("list")
						},
						target: {
							aggregation: "items",
							parent: oView.byId("list"),
							publicAggregation: "items",
							publicParent: oView.byId("list")
						}
					};
				}
			},
			afterAction: fnConfirmListItem1IsOn3rdPosition,
			afterUndo: fnConfirmListItem1IsOn1stPosition,
			afterRedo: fnConfirmListItem1IsOn3rdPosition
		});

		// Remove and reveal actions
		var fnConfirmListIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("list").getVisible(), false, "then the List control is invisible");
		};

		var fnConfirmListIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("list").getVisible(), true, "then the List control is visible");
		};

		elementActionTest("Checking the remove action for ListBase", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">' +
				'<m:ListBase id="list">' +
					'<m:StandardListItem id="listItem1" title="1st Item"/>' +
					'<m:StandardListItem id="listItem2" title="2nd Item"/>' +
					'<m:StandardListItem id="listItem3" title="3rd Item"/>' +
				'</m:ListBase>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "list"
			},
			afterAction: fnConfirmListIsInvisible,
			afterUndo: fnConfirmListIsVisible,
			afterRedo: fnConfirmListIsInvisible
		});

		elementActionTest("Checking the reveal action for a ListBase", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">' +
				'<m:ListBase id="list" visible="false">' +
					'<m:StandardListItem id="listItem1" title="1st Item"/>' +
					'<m:StandardListItem id="listItem2" title="2nd Item"/>' +
					'<m:StandardListItem id="listItem3" title="3rd Item"/>' +
				'</m:ListBase>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "list"
			},
			afterAction: fnConfirmListIsVisible,
			afterUndo: fnConfirmListIsInvisible,
			afterRedo: fnConfirmListIsVisible
		});
	});

});