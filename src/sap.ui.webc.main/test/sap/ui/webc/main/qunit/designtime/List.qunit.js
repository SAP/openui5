sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (
	elementActionTest
) {
	"use strict";

	// Move items action module
	var fnConfirmItemIsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("item1").getId(),
			oViewAfterAction.byId("myList").getItems()[2].getId(),
			"then the control has been moved to the right position");
	};

	var fnConfirmItemIsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("item1").getId(),
			oViewAfterAction.byId("myList").getItems()[0].getId(),
			"then the control has been moved to the previous position");
	};

	elementActionTest("Checking the move action for List items", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List id="myList">' +
				'<StandardListItem id="item1" text="Some text" />' +
				'<StandardListItem text="Some text1" />' +
				'<StandardListItem text="Some text2" />' +
			'</List>' +
		'</mvc:View>'
		,
		action: {
			name: "move",
			controlId: "myList",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("item1"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "items",
						parent: oView.byId("myList"),
						publicAggregation: "items",
						publicParent: oView.byId("myList")
					},
					target: {
						aggregation: "items",
						parent: oView.byId("myList"),
						publicAggregation: "items",
						publicParent: oView.byId("myList")
					}
				};
			}
		},
		afterAction: fnConfirmItemIsOn3rdPosition,
		afterUndo: fnConfirmItemIsOn1rdPosition,
		afterRedo: fnConfirmItemIsOn3rdPosition
	});

	// Remove and reveal actions
	var fnConfirmListIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myList").getVisible(), false, "then the List element is invisible");
	};

	var fnConfirmListIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myList").getVisible(), true, "then the List element is visible");
	};

	elementActionTest("Checking the remove action for List", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List id="myList" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "myList"
		},
		afterAction: fnConfirmListIsInvisible,
		afterUndo: fnConfirmListIsVisible,
		afterRedo: fnConfirmListIsInvisible
	});

	elementActionTest("Checking the reveal action for a List", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List id="myList" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "myList"
		},
		afterAction: fnConfirmListIsVisible,
		afterUndo: fnConfirmListIsInvisible,
		afterRedo: fnConfirmListIsVisible
	});

	// Rename of headerText property
	var fnConfirmListHeaderTextIsRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myList").getHeaderText(),
			"New Option",
			"then the control has been renamed to the new value (New Option)");
	};

	var fnConfirmListHeaderTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myList").getHeaderText(),
			"Option 1",
			"then the control has been renamed to the old value (Option 1)");
	};

	elementActionTest("Checking the rename action for a List's headerText property", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List id="myList" headerText="Option 1"/>' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "myList",
			parameter: function (oView) {
				return {
					newValue: 'New Option',
					renamedElement: oView.byId("myList")
				};
			}
		},
		afterAction: fnConfirmListHeaderTextIsRenamedWithNewValue,
		afterUndo: fnConfirmListHeaderTextIsRenamedWithOldValue,
		afterRedo: fnConfirmListHeaderTextIsRenamedWithNewValue
	});
});