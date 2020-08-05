sap.ui.define([
	"sap/ui/layout/BlockLayout",
	"sap/ui/layout/BlockLayoutRow",
	"sap/ui/layout/BlockLayoutCell",
	"sap/m/Text",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	BlockLayout,
	BlockLayoutRow,
	BlockLayoutCell,
	Text,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.ui.layout.BlockLayoutCell",
			create: function () {
				return new BlockLayout({
					content: [
						new BlockLayoutRow({
							content: [
								new BlockLayoutCell({
									content: [
										new Text({text: "Text"})
									]
								})
							]
						})
					]
				});
			}
		});
	})
	.then(function() {
		// Move action
		var fnConfirmElement1IsOn2rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("cell1").getContent()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("cell1").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for BlockLayoutCell control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:BlockLayout id="blockLayout">' +
				'<l:content>' +
					'<l:BlockLayoutRow id="row1">' +
						'<l:content>' +
							'<l:BlockLayoutCell id="cell1">' +
								'<l:content>' +
									'<m:Text text="Text" id="text1"/>' +
									'<m:Text text="Text" id="text2"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
						'</l:content>' +
					'</l:BlockLayoutRow>' +
				'</l:content>' +
			'</l:BlockLayout>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "text1",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("text1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("cell1")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("cell1")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn2rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn2rdPosition
		});

		// Remove and reveal actions
		var fnConfirmRowInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("cell1").getVisible(), false, "then the BlockLayoutCell element is invisible");
		};

		var fnConfirmRowIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("cell1").getVisible(), true, "then the BlockLayoutCell element is visible");
		};

		elementActionTest("Checking the remove action for BlockLayoutCell", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:BlockLayout id="blockLayout">' +
				'<l:content>' +
					'<l:BlockLayoutRow id="row1">' +
						'<l:content>' +
							'<l:BlockLayoutCell id="cell1">' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
							'<l:BlockLayoutCell id="cell2">' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
						'</l:content>' +
					'</l:BlockLayoutRow>' +
				'</l:content>' +
			'</l:BlockLayout>' +
			'</mvc:View>',
			action: {
				name: "remove",
				controlId: "cell1",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("cell1")
					};
				}
			},
			afterAction: fnConfirmRowInvisible,
			afterUndo: fnConfirmRowIsVisible,
			afterRedo: fnConfirmRowInvisible
		});

		elementActionTest("Checking the reveal action for a BlockLayoutCell", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:BlockLayout id="blockLayout">' +
				'<l:content>' +
					'<l:BlockLayoutRow id="row1">' +
						'<l:content>' +
							'<l:BlockLayoutCell id="cell1" visible="false">' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
							'<l:BlockLayoutCell id="cell2">' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
						'</l:content>' +
					'</l:BlockLayoutRow>' +
				'</l:content>' +
			'</l:BlockLayout>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "cell1",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmRowIsVisible,
			afterUndo: fnConfirmRowInvisible,
			afterRedo: fnConfirmRowIsVisible
		});

		// Rename action
		var fnConfirmCellIsRenamedWithNewValue = function (oLabel, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("cell1").getTitle(),
				"New Cell Title",
				"then the control has been renamed to the new value (New Cell Title)");
		};

		var fnConfirmCellIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("cell1").getTitle(),
				"Cell Title",
				"then the control has been renamed to the old value (Cell Title)");
		};

		elementActionTest("Checking the rename action for a BlockLayoutCell", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:BlockLayout id="blockLayout">' +
				'<l:content>' +
					'<l:BlockLayoutRow id="row1">' +
						'<l:content>' +
							'<l:BlockLayoutCell title="Cell Title" id="cell1">' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
							'<l:BlockLayoutCell id="cell2">' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
						'</l:content>' +
					'</l:BlockLayoutRow>' +
				'</l:content>' +
			'</l:BlockLayout>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "cell1",
				parameter: function (oView) {
					return {
						newValue: 'New Cell Title',
						renamedElement: oView.byId("cell1")
					};
				}
			},
			afterAction: fnConfirmCellIsRenamedWithNewValue,
			afterUndo: fnConfirmCellIsRenamedWithOldValue,
			afterRedo: fnConfirmCellIsRenamedWithNewValue
		});
	});
});
