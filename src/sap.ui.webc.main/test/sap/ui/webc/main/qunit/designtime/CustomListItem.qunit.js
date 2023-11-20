sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (
	elementActionTest
) {
	"use strict";

	// Move items action module
	var fnConfirmItemIsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("item1").getId(),
			oViewAfterAction.byId("myCLI").getContent()[2].getId(),
			"then the control has been moved to the right position");
	};

	var fnConfirmItemIsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("item1").getId(),
			oViewAfterAction.byId("myCLI").getContent()[0].getId(),
			"then the control has been moved to the previous position");
	};

	elementActionTest("Checking the move action for List items", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List>' +
				'<CustomListItem id="myCLI" ><Button id="item1" text="test" /><Button text="test2" /><Button text="test3" /></CustomListItem>' +
			'</List>' +
		'</mvc:View>'
		,
		action: {
			name: "move",
			controlId: "myCLI",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("item1"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "content",
						parent: oView.byId("myCLI"),
						publicAggregation: "content",
						publicParent: oView.byId("myCLI")
					},
					target: {
						aggregation: "content",
						parent: oView.byId("myCLI"),
						publicAggregation: "content",
						publicParent: oView.byId("myCLI")
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
		assert.strictEqual(oViewAfterAction.byId("myCLI").getVisible(), false, "then the Custom List Item element is invisible");
	};

	var fnConfirmListIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myCLI").getVisible(), true, "then the Custom List Item element is visible");
	};

	elementActionTest("Checking the remove action for Custom List Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List>' +
				'<CustomListItem id="myCLI" ><Button text="test" /></CustomListItem>' +
			'</List>' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "myCLI"
		},
		afterAction: fnConfirmListIsInvisible,
		afterUndo: fnConfirmListIsVisible,
		afterRedo: fnConfirmListIsInvisible
	});

	elementActionTest("Checking the reveal action for a Custom List Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<List>' +
				'<CustomListItem id="myCLI" visible="false" ><Button text="test" /></CustomListItem>' +
			'</List>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "myCLI"
		},
		afterAction: fnConfirmListIsVisible,
		afterUndo: fnConfirmListIsInvisible,
		afterRedo: fnConfirmListIsVisible
	});

});