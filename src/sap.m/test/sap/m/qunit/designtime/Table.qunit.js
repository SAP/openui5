sap.ui.define([
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Text",
	"sap/m/ColumnListItem",
	"sap/m/Toolbar",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	// We have to ensure to load fl, so that change handler gets registered
	"sap/ui/fl/library"
], function (
	Table,
	Column,
	Text,
	ColumnListItem,
	Toolbar,
	elementDesigntimeTest,
	elementActionTest,
	JSONModel,
	DelegateMediatorAPI
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
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
	})
	.then(function() {
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

		elementActionTest("Checking the move action for Table control with correct initial order", {
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
		elementActionTest("Checking the move action for Table control with reordered columns", {
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


		var fnAssertFactory = function (iExpectedPosition) {
			return function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(
					oViewAfterAction.byId("column1").getId(),
					oViewAfterAction.byId("myTable").getColumns()[iExpectedPosition].getId(),
					"then the column in header has been moved to the right position"
				);
				assert.strictEqual(
					oViewAfterAction.byId("text1").getId(),
					oViewAfterAction.byId("myTable").getBindingInfo('items').template.getCells()[iExpectedPosition].getId(),
					"then the column in template has been moved to the right position"
				);
				assert.ok(
					oViewAfterAction.byId("myTable").getItems()[0].getCells()[iExpectedPosition].getId().indexOf(oViewAfterAction.byId("text1").getId()) !== -1,
					"then the column in items has been moved to the right position"
				);
			};
		};

		var oJSONModelWithSampleData = new JSONModel({
			"records": [{
				"column1": "test1_1",
				"column2": "test2_1",
				"column3": "test3_1"
			},{
				"column1": "test1_2",
				"column2": "test2_2",
				"column3": "test3_2"
			},{
				"column1": "test1_3",
				"column2": "test2_3",
				"column3": "test3_3"
			}]
		});

		elementActionTest("Checking the move action for Table control with template", {
			xmlView: '\
				<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">\
					<Table id="myTable" items="{path: \'/records\'}">\
						<columns>\
							<Column id="column1"><Text text="column1" /></Column>\
							<Column id="column2"><Text text="column2" /></Column>\
							<Column id="column3"><Text text="column3" /></Column>\
						</columns>\
						<items>\
							<ColumnListItem>\
								<cells>\
									<Text text="{column1}" id="text1" />\
									<Text text="{column2}" id="text2" />\
									<Text text="{column3}" id="text3" />\
								</cells>\
							</ColumnListItem>\
						</items>\
					</Table>\
				</mvc:View>\
			',
			model: oJSONModelWithSampleData,
			action: {
				name: "move",
				controlId: "myTable",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("column1"),
							sourceIndex: 0,
							targetIndex: 1
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
			afterAction: fnAssertFactory(1),
			afterUndo: fnAssertFactory(0),
			afterRedo: fnAssertFactory(1)
		});

		// Add delegate tests

		var TEST_DELEGATE_PATH = "sap/ui/rta/enablement/TestDelegate";
		function buildViewContentForAddDelegate(sDelegate) {
			return '\
				<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:fl="sap.ui.fl">\
					<Table id="myTable" items="{path: \'/records\'}"\
						' + sDelegate + '\
					>\
						<columns>\
							<Column id="column1"><Text text="column1" /></Column>\
							<Column id="column2"><Text text="column2" /></Column>\
						</columns>\
						<items>\
							<ColumnListItem>\
								<cells>\
									<Text text="{column1}" id="text1" />\
									<Text text="{column2}" id="text2" />\
								</cells>\
							</ColumnListItem>\
						</items>\
					</Table>\
				</mvc:View>\
			';
		}
		var ENTITY_TYPE_EXISTS = true;
		var NO_ENTITY_TYPE = false;
		var ENTITY_TYPE_NAME = "SomeEntityName";

		function confirmColumnIsAdded(bEntityTypeExists, oAppComponent, oView, assert) {
			var oTable = oView.byId("myTable");
			var aColumns = oTable.getColumns();
			assert.equal(aColumns.length, 3, "then a new column exists");
			var oNewColumn = oView.byId("my_new_control");
			assert.equal(aColumns.indexOf(oNewColumn), 0, "then the new column is inserted at the correct position");
			var oFirstColumn = oTable.getColumns()[0];
			assert.equal(oFirstColumn.getId().indexOf(oNewColumn.getId()), 0, "then the column was added as at the correct index");

			if (bEntityTypeExists) {
				assert.strictEqual(
					"{" + oNewColumn.getHeader().getBindingInfo('text').binding.getPath() + "}",
					"{/#" + ENTITY_TYPE_NAME + "/" + "binding/path" + "/@sap:label}",
					"label has been created successfully"
				);
			} else {
				assert.equal(oNewColumn.getHeader().getText(), "binding/path", "and the label is added correctly");
			}

			var oNewCell = oTable.getBindingInfo('items').template.getCells()[0];
			assert.strictEqual(
				oView.byId("my_new_control--field").getId(),
				oNewCell.getId(),
				"then the new column in binding template is inserted at the correct position with the right ID"
			);
			assert.strictEqual(
				oNewCell.getBindingInfo("text").parts[0].path,
				"binding/path",
				"then the new column in binding template is bound"
			);
		}

		function confirmColumnIsRemoved(oAppComponent, oView, assert) {
			var oTable = oView.byId("myTable");
			var aColumns = oTable.getColumns();
			assert.equal(aColumns.length, 2, "then only the old columns exists");
			var oNewColumn = oView.byId("my_new_control");
			assert.notOk(oNewColumn, "then the new column was removed");
			var oNewLabel = oView.byId("my_new_control--field-label");
			assert.notOk(oNewLabel, "then the new label was removed");
			var oNewCell = oView.byId("my_new_control--field");
			assert.notOk(oNewCell, "then the new cell was removed");
		}

		elementActionTest("Checking the add action via delegate for a table, where Delegate.createLayout() is not responsible for controls and no entity type is given", {
			xmlView: buildViewContentForAddDelegate(
				"fl:delegate='{" +
					'"name":"' + TEST_DELEGATE_PATH + '"' +
				"}'"
			),
			model: oJSONModelWithSampleData,
			action: {
				name: ["add", "delegate"],
				controlId: "myTable",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId("my_new_control"),
						bindingString: "binding/path",
						parentId: oView.createId("myTable")
					};
				}
			},
			afterAction: confirmColumnIsAdded.bind(null, NO_ENTITY_TYPE),
			afterUndo: confirmColumnIsRemoved,
			afterRedo : confirmColumnIsAdded.bind(null, NO_ENTITY_TYPE)
		});

		elementActionTest("Checking the add action via delegate for a table, where Delegate.createLayout() is not responsible for controls and an entity type is given", {
			xmlView: buildViewContentForAddDelegate(
				"fl:delegate='{" +
					'"name":"' + TEST_DELEGATE_PATH + '"' +
				"}'"
			),
			model: oJSONModelWithSampleData,
			action: {
				name: ["add", "delegate"],
				controlId: "myTable",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId("my_new_control"),
						bindingString: "binding/path",
						parentId: oView.createId("myTable"),
						entityType: ENTITY_TYPE_NAME
					};
				}
			},
			afterAction: confirmColumnIsAdded.bind(null, ENTITY_TYPE_EXISTS),
			afterUndo: confirmColumnIsRemoved,
			afterRedo : confirmColumnIsAdded.bind(null, ENTITY_TYPE_EXISTS)
		});

		elementActionTest("Checking the add action via delegate for a table, where Delegate.createLayout() is possible, but not used for controls", {
			xmlView: buildViewContentForAddDelegate(
				"fl:delegate='{" +
					'"name":"' + TEST_DELEGATE_PATH + '",' +
					'"payload":{' +
						'"useCreateLayout":"true",' + //enforce availability of createLayout in the test delegate
						'"layoutType":"enforce.breaking.to.ensure.it.is.not.called"' +
					'}' +
				"}'"
			),
			model: oJSONModelWithSampleData,
			action: {
				name: ["add", "delegate"],
				controlId: "myTable",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId("my_new_control"),
						bindingString: "binding/path",
						parentId: oView.createId("myTable"),
						entityType: ENTITY_TYPE_NAME
					};
				}
			},
			afterAction: confirmColumnIsAdded.bind(null, ENTITY_TYPE_EXISTS),
			afterUndo: confirmColumnIsRemoved,
			afterRedo : confirmColumnIsAdded.bind(null, ENTITY_TYPE_EXISTS)
		});

		//ensure a default delegate exists for a model not used anywhere else
		var SomeModel = JSONModel.extend("sap.ui.layout.form.qunit.test.Model");
		DelegateMediatorAPI.registerDefaultDelegate({
			modelType: SomeModel.getMetadata().getName(),
			delegate: TEST_DELEGATE_PATH
		});
		elementActionTest("Checking the add action via delegate for a table with default delegate", {
			xmlView: buildViewContentForAddDelegate(""),
			model: oJSONModelWithSampleData,
			action: {
				name: ["add", "delegate"],
				controlId: "myTable",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId("my_new_control"),
						bindingString: "binding/path",
						parentId: oView.createId("myTable"),
						modelType: SomeModel.getMetadata().getName()
					};
				}
			},
			afterAction: confirmColumnIsAdded.bind(null, NO_ENTITY_TYPE),
			afterUndo: confirmColumnIsRemoved,
			afterRedo : confirmColumnIsAdded.bind(null, NO_ENTITY_TYPE)
		});

	});
});
