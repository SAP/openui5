(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit", "sap/ui/dt/test/ElementEnablementTest", "sap/m/Table", "sap/m/Column", "sap/m/Text",
		"sap/m/ColumnListItem", "sap/m/Toolbar", "sap/m/changeHandler/MoveTableColumns", "sap/ui/rta/test/controlEnablingCheck",
		"sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/core/mvc/XMLView", "sap/ui/rta/command/CommandFactory", "sap/ui/dt/ElementUtil",
		"sap/ui/dt/ElementDesignTimeMetadata",
		"sap/ui/fl/library" // We have to ensure to load fl, so that change handler gets registered
	], function (QUnitReport, ElementEnablementTest, Table, Column, Text, ColumnListItem, Toolbar, MoveTableColumns, rtaControlEnablingCheck,
				 UIComponent, ComponentContainer, XMLView, CommandFactory, ElementUtil, ElementDesignTimeMetadata) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Table",
			create: function () {
				return new Table({
					columns: [
						new Column({
							header: new Text({text: "Header 1"})
						})
					],
					items: [
						new ColumnListItem({
							cells: [
								new Text({text: "text"})
							]
						})
					],
					headerToolbar: new Toolbar(),
					swipeContent: new Text(),
					infoToolbar: new Toolbar()
				});
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			var oReport = new QUnitReport({
				data: oData
			});
		});

		// Move columns
		var fnConfirmColumn1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("column1").getId(),
				oViewAfterAction.byId("myTable").getColumns()[2].getId(),
				"then the column in header has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myTable").getItems()[0].getCells()[2].getId(),
				"then the column in items has been moved to the right position");
		};
		var fnConfirmColumn1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("column1").getId(),
				oViewAfterAction.byId("myTable").getColumns()[0].getId(),
				"then the column in header has been moved to the previous position");
			assert.strictEqual(oViewAfterAction.byId("text1").getId(),
				oViewAfterAction.byId("myTable").getItems()[0].getCells()[0].getId(),
				"then the column in items has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Table control with correct initial order", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Table id="myTable">' +
					'<columns>' +
						'<Column id="column1"><Text text="Text" /></Column>' +
						'<Column id="column2"><Text text="Text" /></Column>' +
						'<Column id="column3"><Text text="Text" /></Column>' +
					'</columns>' +
					'<items>' +
						'<ColumnListItem>' +
							'<cells>' +
								'<Text text="Text 1" id="text1" />' +
								'<Text text="Text 2" id="text2" />' +
								'<Text text="Text 3" id="text3" />' +
							'</cells>' +
						'</ColumnListItem>' +
					'</items>' +
				'</Table>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myTable",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("column1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "columns",
							parent: oView.byId("myTable"),
							publicAggregation: "columns",
							publicParent: oView.byId("myTable")
						},
						target: {
							aggregation: "columns",
							parent: oView.byId("myTable"),
							publicAggregation: "columns",
							publicParent: oView.byId("myTable")
						}
					};
				}
			},
			afterAction: fnConfirmColumn1IsOn3rdPosition,
			afterUndo: fnConfirmColumn1IsOn1stPosition,
			afterRedo: fnConfirmColumn1IsOn3rdPosition
		});

		// Test move when the sourceIndex is not the actual one. We have this use case when a column has already been moved and the view is already modified.
		rtaControlEnablingCheck("Checking the move action for Table control with reordered columns", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Table id="myTable">' +
					'<columns>' +
						'<Column id="column2"><Text text="Text" /></Column>' +
						'<Column id="column1"><Text text="Text" /></Column>' +
						'<Column id="column3"><Text text="Text" /></Column>' +
					'</columns>' +
					'<items>' +
						'<ColumnListItem>' +
							'<cells>' +
								'<Text text="Text 2" id="text2" />' +
								'<Text text="Text 1" id="text1" />' +
								'<Text text="Text 3" id="text3" />' +
							'</cells>' +
						'</ColumnListItem>' +
					'</items>' +
				'</Table>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "myTable",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("column1"),
							sourceIndex: 0,
							targetIndex: 2
						}],
						source: {
							aggregation: "columns",
							parent: oView.byId("myTable"),
							publicAggregation: "columns",
							publicParent: oView.byId("myTable")
						},
						target: {
							aggregation: "columns",
							parent: oView.byId("myTable"),
							publicAggregation: "columns",
							publicParent: oView.byId("myTable")
						}
					};
				}
			},
			afterAction: function (oUiComponent, oViewAfterAction, assert) {
				// After the change is applied it is expected that column1 and text1 are moved, no matter the fact that the sourceIndex is pointing at column2.
				var expectedTargetIndex = 2;
				assert.strictEqual(oViewAfterAction.byId("column1").getId(), oViewAfterAction.byId("myTable").getColumns()[expectedTargetIndex].getId(), "then the column in header has been moved to the right position");
				assert.strictEqual(oViewAfterAction.byId("text1").getId(), oViewAfterAction.byId("myTable").getItems()[0].getCells()[expectedTargetIndex].getId(), "then the column in items has been moved to the right position");

			},
			// We need to skip the verification for undo and redo, because in this test we want to verify that the right column will be moved, even if the sourceIndex is not correct.
			// Therefore the sourceIndex is wrong on purpose and we cannot test undo and redo.
			afterUndo: function () {},
			afterRedo: function () {}
		});
	});
})();