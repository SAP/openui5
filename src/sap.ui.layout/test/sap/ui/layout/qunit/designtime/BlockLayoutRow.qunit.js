(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/layout/BlockLayout",
		"sap/ui/layout/BlockLayoutRow",
		"sap/ui/layout/BlockLayoutCell",
		"sap/m/Text",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, BlockLayout, BlockLayoutRow, BlockLayoutCell, Text, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.BlockLayoutRow",
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


		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Move action
		var fnConfirmElement1IsOn2rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("cell1").getId(),
				oViewAfterAction.byId("row1").getContent()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("cell1").getId(),
				oViewAfterAction.byId("row1").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for BlockLayoutRow control", {
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
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "row1",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("cell1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("row1")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("row1")
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
			assert.strictEqual(oViewAfterAction.byId("row1").getVisible(), false, "then the BlockLayoutRow element is invisible");
		};

		var fnConfirmRowIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("row1").getVisible(), true, "then the BlockLayoutRow element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for BlockLayoutRow", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:BlockLayout id="blockLayout">' +
				'<l:content>' +
					'<l:BlockLayoutRow id="row1">' +
						'<l:content>' +
							'<l:BlockLayoutCell>' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
						'</l:content>' +
					'</l:BlockLayoutRow>' +
					'<l:BlockLayoutRow id="row2">' +
						'<l:content>' +
							'<l:BlockLayoutCell>' +
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
				controlId: "row1",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("row1")
					};
				}
			},
			afterAction: fnConfirmRowInvisible,
			afterUndo: fnConfirmRowIsVisible,
			afterRedo: fnConfirmRowInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a BlockLayoutRow", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
			'<l:BlockLayout id="blockLayout">' +
				'<l:content>' +
					'<l:BlockLayoutRow id="row1" visible="false">' +
						'<l:content>' +
							'<l:BlockLayoutCell>' +
								'<l:content>' +
									'<m:Text text="Text"/>' +
								'</l:content>' +
							'</l:BlockLayoutCell>' +
						'</l:content>' +
					'</l:BlockLayoutRow>' +
					'<l:BlockLayoutRow id="row2">' +
						'<l:content>' +
							'<l:BlockLayoutCell>' +
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
				controlId: "row1",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmRowIsVisible,
			afterUndo: fnConfirmRowInvisible,
			afterRedo: fnConfirmRowIsVisible
		});


	});
})();
