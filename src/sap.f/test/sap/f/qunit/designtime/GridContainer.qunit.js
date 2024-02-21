sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (
	elementActionTest
) {
	"use strict";

	// Move items action module
	var fnConfirmItemIsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("item1").getId(),
			oViewAfterAction.byId("myGC").getItems()[2].getId(),
			"then the control has been moved to the right position");
	};

	var fnConfirmItemIsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("item1").getId(),
			oViewAfterAction.byId("myGC").getItems()[0].getId(),
			"then the control has been moved to the previous position");
	};

	elementActionTest("Checking the move action for GrdContainer items", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.f"	xmlns="sap.m">"' +
			'<f:GridContainer id="myGC">' +
				'<Text id="item1" text="Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod" />' +
				'<Text text="Some text1" />' +
				'<Text text="Some text2" />' +
			'</f:GridContainer>' +
		'</mvc:View>'
		,
		action: {
			name: "move",
			controlId: "myGC",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("item1"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "items",
						parent: oView.byId("myGC"),
						publicAggregation: "items",
						publicParent: oView.byId("myGC")
					},
					target: {
						aggregation: "items",
						parent: oView.byId("myGC"),
						publicAggregation: "items",
						publicParent: oView.byId("myGC")
					}
				};
			}
		},
		afterAction: fnConfirmItemIsOn3rdPosition,
		afterUndo: fnConfirmItemIsOn1rdPosition,
		afterRedo: fnConfirmItemIsOn3rdPosition
	});

	// Remove and reveal actions
	var fnConfirmGCIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myGC").getVisible(), false, "then the Grid Container element is invisible");
	};

	var fnConfirmGCIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myGC").getVisible(), true, "then the Grid Container element is visible");
	};

	elementActionTest("Checking the remove action for Grid Container", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.f"	xmlns="sap.m">"' +
			'<f:GridContainer id="myGC" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "myGC"
		},
		afterAction: fnConfirmGCIsInvisible,
		afterUndo: fnConfirmGCIsVisible,
		afterRedo: fnConfirmGCIsInvisible
	});

	elementActionTest("Checking the reveal action for a Grid Container", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.f"	xmlns="sap.m">"' +
			'<f:GridContainer id="myGC" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "myGC"
		},
		afterAction: fnConfirmGCIsVisible,
		afterUndo: fnConfirmGCIsInvisible,
		afterRedo: fnConfirmGCIsVisible
	});

});