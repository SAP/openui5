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
			type: "sap.ui.layout.BlockLayout",
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
		var fnConfirmElement1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("row1").getId(),
				oViewAfterAction.byId("blockLayout").getContent()[2].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("row1").getId(),
				oViewAfterAction.byId("blockLayout").getContent()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for BlockLayout control", {
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
					'<l:BlockLayoutRow id="row3">' +
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
				name: "move",
				controlId: "blockLayout",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("row1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "content",
							parent: oView.byId("blockLayout")
						},
						target: {
							aggregation: "content",
							parent: oView.byId("blockLayout")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn3rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn3rdPosition
		});

	});
})();
