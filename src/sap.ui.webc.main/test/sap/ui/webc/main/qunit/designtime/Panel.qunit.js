sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (
	elementActionTest
) {
	"use strict";

	// Move content action module
	var fnConfirmTitleIsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("title1").getId(),
			oViewAfterAction.byId("myPanelId").getContent()[2].getId(),
			"then the control has been moved to the right position");
	};

	var fnConfirmTitleIsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("title1").getId(),
			oViewAfterAction.byId("myPanelId").getContent()[0].getId(),
			"then the control has been moved to the previous position");
	};

	elementActionTest("Checking the move action for Panel content", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<Panel id="myPanelId">' +
				'<content>' +
					'<Title id="title1" text="Some text" />' +
					'<Button id="button1" icon="sap-icon://settings" />' +
					'<Button id="button2" icon="sap-icon://drop-down-list"/>' +
				'</content>' +
			'</Panel>' +
		'</mvc:View>'
		,
		action: {
			name: "move",
			controlId: "myPanelId",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("title1"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "content",
						parent: oView.byId("myPanelId"),
						publicAggregation: "content",
						publicParent: oView.byId("myPanelId")
					},
					target: {
						aggregation: "content",
						parent: oView.byId("myPanelId"),
						publicAggregation: "content",
						publicParent: oView.byId("myPanelId")
					}
				};
			}
		},
		afterAction: fnConfirmTitleIsOn3rdPosition,
		afterUndo: fnConfirmTitleIsOn1rdPosition,
		afterRedo: fnConfirmTitleIsOn3rdPosition
	});

	// Remove and reveal actions
	var fnConfirmPanelIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myPanelId").getVisible(), false, "then the Panel element is invisible");
	};

	var fnConfirmPanelIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myPanelId").getVisible(), true, "then the Panel element is visible");
	};

	elementActionTest("Checking the remove action for Panel", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<Panel headerText="Simple Text" id="myPanelId" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "myPanelId"
		},
		afterAction: fnConfirmPanelIsInvisible,
		afterUndo: fnConfirmPanelIsVisible,
		afterRedo: fnConfirmPanelIsInvisible
	});

	elementActionTest("Checking the reveal action for a Panel", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<Panel headerText="Simple Text" id="myPanelId" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "myPanelId"
		},
		afterAction: fnConfirmPanelIsVisible,
		afterUndo: fnConfirmPanelIsInvisible,
		afterRedo: fnConfirmPanelIsVisible
	});


	var fnConfirmPanelHeaderTextRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myPanelId").getHeaderText(),
			"New Header Text",
			"then the panel header text has been renamed to the new value (New Header Text)");
	};

	var fnConfirmPanelHeaderTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myPanelId").getHeaderText(),
			"Old Header Text",
			"then the panel header text has been renamed to the old value (Old Header Text)");
	};

	elementActionTest("Checking the rename action for a Panel header text", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Panel headerText="Old Header Text" id="myPanelId" />' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "myPanelId",
			parameter: function (oView) {
				return {
					newValue: "New Header Text",
					renamedElement: oView.byId("myPanelId")
				};
			}
		},
		afterAction: fnConfirmPanelHeaderTextRenamedWithNewValue,
		afterUndo: fnConfirmPanelHeaderTextIsRenamedWithOldValue,
		afterRedo: fnConfirmPanelHeaderTextRenamedWithNewValue
	});
});