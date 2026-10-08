/* global QUnit, sinon */

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/m/library",
	"sap/m/IllustratedMessage",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Menu",
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Boolean",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/mdc/table/utils/Personalization",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Table,
	Column,
	GridTableType,
	RowSettings,
	RowActionItem,
	RowCountMode,
	MLibrary,
	IllustratedMessage,
	Label,
	Text,
	Menu,
	Element,
	Control,
	JSONModel,
	BooleanType,
	VariantManagement,
	PersonalizationUtils,
	TestModificationHandler
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("Inner table", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new GridTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", async function(assert) {
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "Inner table type is sap.ui.table.Table");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getEnableColumnReordering(), false, "enableColumnReordering");
		assert.equal(oInnerTable.getSelectionMode(), "None", "selectionMode");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowSelector", "selectionBehavior");
		assert.equal(oInnerTable.getThreshold(), 100, "threshold");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTableTitle.getId()],
			"ariaLabelledBy references the composite table title (including item count)");
		assert.deepEqual(oInnerTable.getExtension(), [this.oTable._oToolbar], "extension");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), true, "rowMode");
		assert.equal(oInnerTable.getRowMode().getMinRowCount(), 10, "rowMode.minRowCount");
		assert.equal(oInnerTable.getFixedColumnCount(), 0, "fixedColumnCount");
	});

	QUnit.test("Initial settings", async function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: new GridTableType({
				rowCountMode: RowCountMode.Fixed,
				rowCount: 12,
				fixedColumnCount: 1
			}),
			threshold: 30,
			selectionMode: "SingleMaster"
		});
		await this.oTable.initialized();

		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getEnableColumnReordering(), false, "enableColumnReordering");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowOnly", "selectionBehavior");
		assert.equal(oInnerTable.getThreshold(), 30, "threshold");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTableTitle.getId()],
			"ariaLabelledBy references the composite table title (including item count)");
		assert.deepEqual(oInnerTable.getExtension(), [this.oTable._oToolbar], "extension");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "rowMode");
		assert.equal(oInnerTable.getRowMode().getRowCount(), 12, "rowMode.minRowCount");
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "fixedColumnCount");
	});

	QUnit.test("Change settings", function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = this.oTable._oTable;

		const oCreationRowStub = sinon.stub(this.oTable, "getCreationRow").returns({
			getVisible: function() {
				return true;
			}
		});

		this.oTable.setThreshold(30);
		assert.equal(oInnerTable.getThreshold(), 30, "Table.threshold=30: threshold");

		oType.setRowCountMode(RowCountMode.Fixed);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "Type.rowCountMode=Fixed: rowMode");
		assert.equal(oInnerTable.getRowMode().getHideEmptyRows(), true, `Type.rowCountMode=Fixed.hideEmptyRows: ${true}`);

		oType.setRowCount(12);
		assert.equal(oInnerTable.getRowMode().getRowCount(), 12, "Type.rowCount=12: rowMode.rowCount");

		oType.setFixedColumnCount(1);
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Type.fixedColumnCount=1: fixedColumnCount");

		this.oTable.setSelectionMode("SingleMaster");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowOnly", "Table.selectionMode=SingleMaster: selectionBehavior");

		this.oTable.setSelectionMode("Multi");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowSelector", "Table.selectionMode=MultiToggle: selectionBehavior");

		oType.setRowCountMode(RowCountMode.Interactive);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Interactive"), true, "Type.rowCountMode=Interactive: rowMode");

		oType.setRowCount(15);
		assert.equal(oInnerTable.getRowMode().getRowCount(), 15, "Type.rowCount=15: rowMode.rowCount");

		oType.setRowCountMode(RowCountMode.Fixed);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "Type.rowCountMode=Fixed: rowMode");
		assert.equal(oInnerTable.getRowMode().getHideEmptyRows(), true, `Type.rowCountMode=Fixed.hideEmptyRows: ${true}`);

		oCreationRowStub.restore();
	});

	QUnit.module("Inner column", {
		beforeEach: async function() {
			this.oColumn = new Column({
				template: new Text({text: "MyTemplate", wrapping: true}),
				creationTemplate: new Text({text: "MyCreationTemplate", wrapping: true})
			});
			this.oTable = new Table({
				type: new GridTableType(),
				columns: [this.oColumn]
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		assert.ok(oInnerColumn.isA("sap.ui.table.Column"), "Inner column type is sap.ui.table.Column");
		assert.equal(oInnerColumn.getLabel(), this.oColumn.getHeaderLabel(), "Inner column label is the columns header label instance");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		assert.equal(oInnerColumn.getId(), this.oTable.getColumns()[0].getId() + "-innerColumn", "Id");
		assert.equal(oInnerColumn.getTooltip(), null, "tooltip");
		assert.equal(oInnerColumn.getResizable(), true, "resizable");
		assert.equal(oInnerColumn.getAutoResizable(), true, "autoResizable");
		assert.equal(oInnerColumn.getWidth(), "", "width");
		assert.equal(oInnerColumn.getMinWidth(), 8 * parseFloat(MLibrary.BaseFontSize), "minWidth");
		assert.equal(oInnerColumn.getHeaderMenu(), this.oTable.getId() + "-columnHeaderMenu", "headerMenu");
		assert.equal(oInnerColumn.getHAlign(), "Begin", "hAlign");
		assert.equal(oInnerColumn.getLabel().getLabel().getWrapping(), false, "label: wrapping");
	});

	QUnit.test("Template", function(assert) {
		const oInnerTable = this.oTable._oTable;
		let oInnerColumn = oInnerTable.getColumns()[0];
		let oInnerTemplate = oInnerColumn.getTemplate();
		let oInnerCreationTemplate = oInnerColumn.getCreationTemplate();

		assert.ok(oInnerTemplate.isA("sap.m.Text"), "template: type");
		assert.ok(oInnerTemplate !== this.oColumn.getTemplate(), "template: different instance than column template");
		assert.equal(oInnerTemplate.getText(), "MyTemplate", "template: text");
		assert.equal(oInnerTemplate.getWrapping(), false, "template: wrapping");
		assert.ok(oInnerCreationTemplate.isA("sap.m.Text"), "creationTemplate: type");
		assert.ok(oInnerCreationTemplate !== this.oColumn.getCreationTemplate(), "creationTemplate: different instance than column creationTemplate");
		assert.equal(oInnerCreationTemplate.getText(), "MyCreationTemplate", "creationTemplate: text");
		assert.equal(oInnerCreationTemplate.getWrapping(), false, "creationTemplate: wrapping");

		// Template without wrapping property
		const MyControl = Control.extend("sap.ui.mdc.test.MyControl", {
			renderer: null
		});
		this.oTable.addColumn(new Column({
			template: new MyControl({text: "NoWrappingProperty"}),
			creationTemplate: new MyControl({text: "NoWrappingProperty"})
		}));
		oInnerColumn = oInnerTable.getColumns()[1];
		oInnerTemplate = oInnerColumn.getTemplate();
		oInnerCreationTemplate = oInnerColumn.getCreationTemplate();

		assert.ok(oInnerTemplate.isA("sap.ui.mdc.test.MyControl"), "template without wrapping: type");
		assert.ok(oInnerTemplate !== this.oTable.getColumns()[1].getTemplate(), "template without wrapping: different instance than column template");
		assert.ok(oInnerCreationTemplate.isA("sap.ui.mdc.test.MyControl"), "creationTemplate without wrapping: type");
		assert.ok(oInnerCreationTemplate !== this.oTable.getColumns()[1].getCreationTemplate(),
			"creationTemplate without wrapping: different instance than column creationTemplate");

		// No template
		this.oTable.addColumn(new Column());
		oInnerColumn = oInnerTable.getColumns()[2];
		oInnerTemplate = oInnerColumn.getTemplate();
		oInnerCreationTemplate = oInnerColumn.getCreationTemplate();

		assert.equal(oInnerTemplate, null, "no template: template is null");
		assert.equal(oInnerCreationTemplate, null, "no creationTemplate: creationTemplate is null");
	});

	QUnit.test("Initial settings", function(assert) {
		this.oTable.setEnableColumnResize(false);
		this.oTable.insertColumn(new Column({
			tooltip: "MyColumnTooltip",
			width: "200px",
			minWidth: 10,
			hAlign: "Center"
		}), 0);

		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		assert.equal(oInnerColumn.getId(), this.oTable.getColumns()[0].getId() + "-innerColumn", "Id");
		assert.equal(oInnerColumn.getTooltip(), "MyColumnTooltip", "tooltip");
		assert.equal(oInnerColumn.getResizable(), false, "resizable");
		assert.equal(oInnerColumn.getAutoResizable(), false, "autoResizable");
		assert.equal(oInnerColumn.getWidth(), "200px", "width");
		assert.equal(oInnerColumn.getMinWidth(), 10 * parseFloat(MLibrary.BaseFontSize), "minWidth");
		assert.equal(oInnerColumn.getHAlign(), "Center", "hAlign");
	});

	QUnit.test("Change width", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];
		this.oColumn.setWidth("100px");
		assert.equal(oInnerColumn.getWidth(), "100px", "Set 'width': Inner column 'width'");

		this.oColumn.setWidth();
		assert.equal(oInnerColumn.getWidth(), "", "Remove 'width': Inner column 'width'");
	});

	QUnit.test("Change minWidth", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];
		this.oColumn.setMinWidth(10);
		assert.equal(oInnerColumn.getMinWidth(), 10 * parseFloat(MLibrary.BaseFontSize),
			"Set 'minWidth': Inner column 'minWidth'");

		this.oColumn.setMinWidth();
		assert.equal(oInnerColumn.getMinWidth(), 8 * parseFloat(MLibrary.BaseFontSize),
			"Remove 'minWidth': Inner column 'minWidth'");
	});

	QUnit.test("Change hAlign", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];
		this.oColumn.setHAlign("End");
		assert.equal(oInnerColumn.getHAlign(), "End", "Set 'hAlign': Inner column 'hAlign'");

		this.oColumn.setHAlign();
		assert.equal(oInnerColumn.getHAlign(), "Begin", "Remove 'hAlign': Inner column 'hAlign'");
	});

	QUnit.test("Change tooltip", function(assert) {
		const oInnerColumn = this.oTable._oTable.getColumns()[0];

		this.oColumn.setTooltip("MyTooltip");
		assert.equal(oInnerColumn.getTooltip(), "MyTooltip", "Set 'tooltip': Inner column 'tooltip'");

		this.oColumn.setTooltip();
		assert.equal(oInnerColumn.getTooltip(), null, "Remove 'tooltip': Inner column 'tooltip'");

		this.oColumn.setHeader("MyHeaderText");
		this.oTable.setUseColumnLabelsAsTooltips(true);
		assert.equal(oInnerColumn.getTooltip(), "MyHeaderText", "Set table's 'useColumnLabelsAsTooltips' to true: Inner column 'tooltip'");

		this.oTable.setUseColumnLabelsAsTooltips(false);
		assert.equal(oInnerColumn.getTooltip(), null, "Set table's 'useColumnLabelsAsTooltips' to false: Inner column 'tooltip'");

		this.oColumn.setTooltip("MyTooltip");
		this.oTable.setUseColumnLabelsAsTooltips(true);
		assert.equal(oInnerColumn.getTooltip(), "MyTooltip", "'tooltip' takes precedence over 'header'");

		this.oColumn.setHeaderVisible(false);
		assert.equal(oInnerColumn.getTooltip(), "MyTooltip",
			"tooltip is set, headerVisible=false, useColumnLabelsAsTooltips=true: Inner column 'tooltip'");

		this.oColumn.setTooltip();
		assert.equal(oInnerColumn.getTooltip(), null,
			"tooltip not set, headerVisible=false, useColumnLabelsAsTooltips=true: Inner column 'tooltip'");
	});

	QUnit.test("Remove column cleans up inner column", async function(assert) {
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oInnerColumnDomRef = oInnerColumn.getDomRef();

		this.oTable.removeColumn(this.oColumn);
		assert.notOk(this.oTable._oTable.getColumns().includes(oInnerColumn),
			"Inner column is no longer in the inner table's 'columns' aggregation");
		await new Promise((resolve) => { setTimeout(resolve, 0); });
		await nextUIUpdate();
		assert.notOk(document.body.contains(oInnerColumnDomRef), "Inner column DOM is gone from the document after rerender");

		this.oColumn.destroy();
	});

	QUnit.module("API", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings) {
			this.oTable = new Table({
				type: new GridTableType(),
				...mSettings
			});
			return this.oTable;
		}
	});

	QUnit.test("createTable returns null when there is no parent", function(assert) {
		const oType = new GridTableType();
		assert.strictEqual(oType.createTable("myId"), null);
		oType.destroy();
	});

	QUnit.test("loadModules resolves immediately on subsequent calls", async function(assert) {
		const oType = new GridTableType();

		// First call ensures the inner table modules are loaded.
		await oType.loadModules();

		// Spy on sap.ui.require to ensure it is not called again.
		const oRequireSpy = this.spy(sap.ui, "require");

		await oType.loadModules();

		const bRequiredAgain = oRequireSpy.getCalls().some((oCall) => {
			return Array.isArray(oCall.args[0]) && oCall.args[0].length > 0;
		});
		assert.notOk(bRequiredAgain, "sap.ui.require was not called again on the second loadModules call");

		oType.destroy();
	});

	QUnit.test("scrollThreshold property", async function(assert) {
		const oTable = this.createTable({
			type: new GridTableType({scrollThreshold: 200})
		});

		await oTable.initialized();

		const oInnerTable = oTable._oTable;
		const oTableType = oTable.getType();
		const setThresholdSpy = sinon.spy(oTableType, "setScrollThreshold");
		const invalidateSpy = sinon.spy(oTable, "invalidate");

		oTableType.setScrollThreshold(25);

		assert.ok(invalidateSpy.notCalled, "Invalidation not called");
		assert.ok(setThresholdSpy.returned(oTableType), "Correct return value");
		assert.equal(oInnerTable.getScrollThreshold(), oTableType.getScrollThreshold(), "Inner table has correct scrollThreshold");

		oTableType.setScrollThreshold(-1);
		assert.equal(oInnerTable.getScrollThreshold(), oInnerTable.getMetadata().getProperty("scrollThreshold").defaultValue,
			"scrollThreshold is reset to default");

		oTableType.setScrollThreshold(50);
		assert.equal(oInnerTable.getScrollThreshold(), 50, "scrollThreshold is set correctly");

		oTableType.setScrollThreshold(undefined);
		assert.equal(oInnerTable.getScrollThreshold(), oInnerTable.getMetadata().getProperty("scrollThreshold").defaultValue,
			"scrollThreshold is reset to default");
		assert.ok(invalidateSpy.notCalled, "Invalidation not called");
	});

	QUnit.test("#getTableStyleClasses", function(assert) {
		const oTable = this.createTable();

		assert.deepEqual(oTable.getType().getTableStyleClasses(), ["sapUiMdcTableFitContainer"], "RowCountMode Auto");

		oTable.getType().setRowCountMode(RowCountMode.Fixed);
		assert.deepEqual(oTable.getType().getTableStyleClasses(), [], "RowCountMode Fixed");
	});

	QUnit.test("#updateSortIndicators", async function(assert) {
		const oTable = this.createTable({
			columns: [
				new Column()
			]
		});

		await oTable.initialized();

		const oType = oTable.getType();
		const oColumn = oTable.getColumns()[0];
		const oInnerColumn = oTable._oTable.getColumns()[0];

		oType.updateSortIndicator(oColumn, "Ascending");
		assert.strictEqual(oInnerColumn.getSortOrder(), "Ascending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "Descending");
		assert.strictEqual(oInnerColumn.getSortOrder(), "Descending", "Inner table column sort order");

		oType.updateSortIndicator(oColumn, "None");
		assert.strictEqual(oInnerColumn.getSortOrder(), "None", "Inner table column sort order");
	});

	QUnit.module("Column Freeze", {
		beforeEach: async function() {
			this.createTable();
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		createTable: function() {
			this.oTable?.destroy();

			const oModel = new JSONModel();
			oModel.setData({
				testPath: [
					{test: "Test1"}, {test: "Test2"}, {test: "Test3"}, {test: "Test4"}, {test: "Test5"}
				]
			});

			this.oTable = new Table("table_test", {
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				type: new GridTableType({
					enableColumnFreeze: true,
					fixedColumnCount: 1
				}),
				columns: [
					new Column({
						label: new Label({text: "Column A"}),
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						label: new Label({text: "Column B"}),
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						label: new Label({text: "Column C"}),
						template: new Text({
							text: "{test}"
						})
					})
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
		}
	});

	QUnit.test("The controller is registered and deregistered properly", function(assert) {
		assert.ok(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ColumnFreeze"), "ColumnFreeze controller is registered");
		this.oTable.getType().setEnableColumnFreeze(false);
		assert.notOk(this.oTable.getEngine().getRegisteredControllers(this.oTable).includes("ColumnFreeze"),
			"ColumnFreeze controller is deregistered");
	});

	QUnit.test("fixedColumnCount property", function(assert) {
		const oInnerTable = this.oTable._oTable;
		assert.equal(this.oTable.getType().getFixedColumnCount(), 1, "fixedColumnCount for type is set to 1");
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Inner table has a fixed column count of 1");

		this.oTable.getType().setFixedColumnCount(2);

		assert.equal(this.oTable.getType().getFixedColumnCount(), 2, "fixedColumnCount for type is set to 2");
		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Inner table has a fixed column count of 2");

		this.oTable.getType().setFixedColumnCount(0);

		assert.equal(this.oTable.getType().getFixedColumnCount(), 0, "fixedColumnCount for type is set to 0");
		assert.equal(oInnerTable.getFixedColumnCount(), 0, "Inner table has a fixed column count of 0");
	});

	QUnit.test("State is persisted", async function(assert) {
		const done = assert.async();
		const oInnerTable = this.oTable._oTable;
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.processChanges = function(aChanges) {
			assert.strictEqual(aChanges.length, 1, "One change is created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "setFixedColumnCount", "Change type is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.value, 2, "Change content value is correct");
			assert.strictEqual(aChanges[0].changeSpecificData.content.key, "GridTable", "Key is correct");

			done();
		};

		this.oTable.getEngine()._setModificationHandler(this.oTable, oModificationHandler);

		await TableQUnitUtils.waitForBinding(this.oTable);
		await nextUIUpdate();

		oInnerTable.setFixedColumnCount(2);
		oInnerTable.fireColumnFreeze();
	});

	QUnit.test("Switch variant (emulation)", async function(assert) {
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		const oType = this.oTable.getType();
		const oInnerTable = oType.getInnerTable();

		// Initial state
		await TableQUnitUtils.waitForBinding(this.oTable);
		await nextUIUpdate();
		assert.equal(oType.getFixedColumnCount(), 1, "Fixed column count is initially 1");

		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		});
		oType.onModifications(); // Emulate change with ColumnFreeze
		await nextUIUpdate();

		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Fixed column count is now 2");
		assert.equal(oType.getFixedColumnCount(), 1, "The value of the fixedColumnCount property is still 1");

		// State (none)
		fnGetCurrentStateStub.returns({});
		oType.onModifications(); // Emulate change with ColumnFreeze
		await nextUIUpdate();

		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Fixed column count is equal to the configured fixedColumnCount");

		fnGetCurrentStateStub.restore();
	});

	QUnit.test("State is applied (emulation)", async function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = oType.getInnerTable();
		const oVariant = new VariantManagement("mdc_test_vm", {
			"for": ["table_test"]
		});
		this.oTable.setVariant(oVariant);

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		});

		const fnOnModificationsSpy = sinon.spy(oType, "onModifications");
		const fnSetShowDetailsState = sinon.spy(oInnerTable, "setFixedColumnCount");

		await TableQUnitUtils.waitForBinding(this.oTable);
		await nextUIUpdate();
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Fixed column count is initially 1");

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledOnce, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledOnce, "setFixedColumnCount is called");
		assert.ok(fnSetShowDetailsState.calledWith(2), "setFixedColumnCount is called with 2");
		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Fixed column count is now 2");

		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 0
					}
				}
			}
		});

		this.oTable._onModifications();
		await nextUIUpdate();

		assert.ok(fnOnModificationsSpy.calledTwice, "onModifications is called");
		assert.ok(fnSetShowDetailsState.calledTwice, "setFixedColumnCount is called");
		assert.ok(fnSetShowDetailsState.calledWith(0), "setFixedColumnCount is called with 0");
		assert.equal(oType.getInnerTable().getFixedColumnCount(), 0, "Fixed column count is now 0");
	});

	QUnit.test("State is applied before the table is initialized", async function(assert) {
		this.oTable.destroy();
		this.createTable();

		const fnGetCurrentStateStub = sinon.stub(this.oTable, "_getXConfig");
		fnGetCurrentStateStub.returns({
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		});

		assert.notOk(this.oTable.getType().getInnerTable(), "Inner table is not created yet");

		this.oTable._onModifications();
		await this.oTable.initialized();
		const oType = this.oTable.getType();
		const oInnerTable = oType.getInnerTable();

		assert.equal(oInnerTable.getFixedColumnCount(), 2, "Fixed column count is 2");
	});

	QUnit.module("Row settings", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
		},
		destroyTable: function() {
			this.oTable?.destroy();
		},
		assertRowActionValues: function(oItem, sType, sText, sIcon, bVisible) {
			QUnit.assert.strictEqual(oItem.getType(), sType, "Row action 'type' property");
			QUnit.assert.notOk(oItem.isBound("type"), "'type' binding");
			QUnit.assert.strictEqual(oItem.getText(), sText, "Row action 'text' property");
			QUnit.assert.notOk(oItem.isBound("text"), "'text' binding");
			QUnit.assert.strictEqual(oItem.getIcon(), sIcon, "Row action 'icon' property");
			QUnit.assert.notOk(oItem.isBound("icon"), "'icon' binding");
			QUnit.assert.strictEqual(oItem.getVisible(), bVisible, "Row action 'visible' property");
			QUnit.assert.notOk(oItem.isBound("visible"), "'visible' binding");
		},
		assertRowActionBindingInfos: function(oItem) {
			["type", "text", "icon", "visible"].forEach(function(sProperty) {
				QUnit.assert.deepEqual({
					model: oItem.getBindingInfo(sProperty).parts[0].model,
					path: oItem.getBindingInfo(sProperty).parts[0].path
				}, {
					model: "namedModel",
					path: sProperty
				}, sProperty + " binding");
			});
		}
	});

	QUnit.test("Row actions with default settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem()
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 1, "Inner row action item count");
		this.assertRowActionValues(oInnerRowAction.getItems()[0], "Custom", "", "", true);
	});

	QUnit.test("Row actions with static settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: false
					}),
					new RowActionItem({
						text: "My other custom action",
						icon: "sap-icon://decline"
					})
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 2, "Inner row action item count");
		this.assertRowActionValues(oInnerRowAction.getItems()[0], "Navigation", "My custom action", "sap-icon://accept", false);
		this.assertRowActionValues(oInnerRowAction.getItems()[1], "Custom", "My other custom action", "sap-icon://decline", true);
	});

	QUnit.test("Row actions with bound settings", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 1, "Inner row action item count");
		this.assertRowActionBindingInfos(oInnerRowAction.getItems()[0]);
	});

	QUnit.test("Bound row actions", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					}),
					templateShareable: false
				}
			})
		});

		const oInnerTable = this.oTable._oTable;
		const oInnerRowAction = oInnerTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 0, "Inner row action item count");
		assert.deepEqual({
			model: oInnerTable.getRowActionTemplate().getBindingInfo("items").model,
			path: oInnerTable.getRowActionTemplate().getBindingInfo("items").path
		}, {
			model: "namedModel",
			path: "/testPath"
		}, "'items' binding");
		this.assertRowActionBindingInfos(oInnerRowAction.getBindingInfo("items").template);
	});

	QUnit.test("press' event", async function(assert) {
		const oPress = sinon.spy();

		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						id: "myRowActionitem",
						type: "Delete",
						press: (oEvent) => {
							oPress(oEvent);
						}
					}),
					new RowActionItem({
						id: "myOtherRowActionitem",
						type: "Navigation",
						press: (oEvent) => {
							oPress(oEvent);
						}
					})
				]
			})
		});

		const oInnerTable = this.oTable._oTable;

		await new Promise((resolve) => {
			oInnerTable.attachEventOnce("rowsUpdated", resolve);
		});

		let oRowAction = oInnerTable.getRows()[1].getRowAction();
		let oIcon = Element.closestTo(oRowAction.getDomRef().children[0]);

		oIcon.firePress();
		let oEvent = oPress.getCall(0)?.args[0];
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oInnerTable.getRows()[1].getBindingContext("namedModel")
		}, "'press' event handler called with the correct parameters");

		oPress.resetHistory();

		oRowAction = oInnerTable.getRows()[2].getRowAction();
		oIcon = Element.closestTo(oRowAction.getDomRef().children[1]);
		oIcon.firePress();

		oEvent = oPress.getCall(0)?.args[0];
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oInnerTable.getRows()[2].getBindingContext("namedModel")
		}, "'press' event handler called with the correct parameters");
	});

	QUnit.test("Row action clone is not destroyed when inner RowActionItem is destroyed", async function(assert) {
		const oRowActionItemPress = sinon.spy();

		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						press: function(oEvent) {
							oRowActionItemPress(oEvent);
						}
					})
				]
			})
		});

		const oInnerTable = this.oTable._oTable;

		await new Promise((resolve) => {
			oInnerTable.attachEventOnce("rowsUpdated", resolve);
		});

		const oType = this.oTable.getType();
		const oRow = oInnerTable.getRows()[0];
		const oRowAction = oRow.getRowAction();
		const oIcon = Element.closestTo(oRowAction.getDomRef().children[0]);

		// Trigger press via DOM to create and cache the RowActionItem clone
		oIcon.firePress();

		assert.ok(oRowActionItemPress.calledOnce, "Press event fired on first navigation");

		// Verify clone is cached and not a dependent of the inner RowActionItem
		const oCloneMap = oType._mRowActionItemClones;
		assert.strictEqual(oCloneMap.size, 1, "One clone is cached");
		const oCachedClone = oCloneMap.values().next().value;
		assert.notOk(oCachedClone.isDestroyed(), "Clone is not destroyed after first press");
		assert.notOk(oCachedClone.getParent(), "Clone has no parent after press (was removed as dependent)");

		// Destroy the inner RowActionItem (simulates what happens during rebinding)
		oRowAction.getItems()[0].destroy();

		// Verify the cached clone survived
		assert.notOk(oCachedClone.isDestroyed(), "Clone survives inner RowActionItem destruction");
		assert.strictEqual(oCloneMap.size, 1, "Clone is still in cache");
	});

	QUnit.test("rowPress with non-Navigation row actions fires cellClick correctly", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent);
			},
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oInnerTable = this.oTable._oTable;

		await new Promise((resolve) => {
			oInnerTable.attachEventOnce("rowsUpdated", resolve);
		});

		assert.ok(oInnerTable.hasListeners("cellClick"), "cellClick listener is attached when rowPress is set");
		assert.ok(oInnerTable.getRowActionTemplate(), "Row action template exists");
		assert.strictEqual(oInnerTable.getRowActionTemplate().getItems().length, 2, "Two row action items exist");

		oInnerTable.getRows()[1].getCells()[0].$().trigger("tap");

		const oEvent = oRowPress.getCall(0)?.args[0];
		assert.deepEqual(oEvent?.getParameters(), {
			id: oEvent.getSource().getId(),
			bindingContext: oInnerTable.getRows()[1].getBindingContext("namedModel")
		}, "'rowPress' event handler called with the correct parameters");
	});

	QUnit.test("rowActionCount controls row action column visibility", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActionCount: 1,
				rowActions: [
					new RowActionItem({type: "Navigation"}),
					new RowActionItem({type: "Delete"}),
					new RowActionItem({type: "Custom", text: "Custom", icon: "sap-icon://action"})
				]
			})
		});

		const oInnerTable = this.oTable._oTable;

		await new Promise((resolve) => {
			oInnerTable.attachEventOnce("rowsUpdated", resolve);
		});

		// rowActionCount = 1: row action column is visible with small size
		assert.strictEqual(oInnerTable.getRowActionCount(), 1, "rowActionCount is 1");
		assert.ok(oInnerTable.getDomRef().classList.contains("sapUiTableRAct"), "Row action column is rendered");
		assert.ok(oInnerTable.getDomRef().classList.contains("sapUiTableRActS"), "Row action column has small size class (1 action)");

		// rowActionCount = 0: row action column is not rendered
		this.oTable.getRowSettings().setRowActionCount(0);
		this.oTable.getType().updateRowActions();
		await nextUIUpdate();
		await new Promise((resolve) => {
			oInnerTable.attachEventOnce("rowsUpdated", resolve);
		});

		assert.strictEqual(oInnerTable.getRowActionCount(), 0, "rowActionCount is 0");
		assert.notOk(oInnerTable.getDomRef().classList.contains("sapUiTableRAct"),
			"Row action column is not rendered when rowActionCount is 0");
	});

	QUnit.test("navigated and highlight - static values", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				navigated: true,
				highlight: "Error"
			})
		});
		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
		});

		const oInnerRow = this.oTable._oTable.getRows()[0];
		const oSettings = oInnerRow.getAggregation("_settings");
		assert.strictEqual(oSettings.getNavigated(), true, "Static value for navigated is applied");
		assert.strictEqual(oSettings.getHighlight(), "Error", "Static value for highlight is applied");
	});

	QUnit.test("navigated and highlight - bound values with formatters", async function(assert) {
		this.oTable?.destroy();
		this.oTable = new Table({
			type: new GridTableType(),
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "namedModel>/testPath"
				}
			},
			columns: new Column({
				id: "foo0",
				header: "Test0",
				template: new Text({text: "template0"})
			}),
			models: {
				namedModel: new JSONModel({
					testPath: [
						{description: "item 1"},
						{description: "item 2"}
					]
				})
			},
			rowSettings: new RowSettings({
				navigated: {
					path: "namedModel>description",
					type: BooleanType,
					formatter: (sDescription) => sDescription === "item 1"
				},
				highlight: {
					path: "namedModel>description",
					formatter: (sDescription) => (sDescription === "item 1" ? "Warning" : "Information")
				}
			})
		});
		this.oTable.placeAt("qunit-fixture");
		await TableQUnitUtils.waitForBinding(this.oTable);
		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
		});

		const aRows = this.oTable._oTable.getRows();
		assert.strictEqual(aRows[0].getAggregation("_settings").getNavigated(), true, "Formatted value for navigated (item 1)");
		assert.strictEqual(aRows[0].getAggregation("_settings").getHighlight(), "Warning", "Formatted value for highlight (item 1)");
		assert.strictEqual(aRows[1].getAggregation("_settings").getNavigated(), false, "Formatted value for navigated (item 2)");
		assert.strictEqual(aRows[1].getAggregation("_settings").getHighlight(), "Information", "Formatted value for highlight (item 2)");
	});

	QUnit.module("Events", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
			});
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Table 'rowPress' event listener attached on init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent.getParameters());
			}
		});

		const oInnerTable = this.oTable._oTable;

		oInnerTable.getRows()[1].getCells()[0].$().trigger("tap");
		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: oInnerTable.getRows()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.test("Table 'rowPress' event listener attached after init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", (oEvent) => {
				oRowPress(oEvent.getParameters());
				resolve();
			});
			this.oTable._oTable.getRows()[1].getCells()[0].$().trigger("tap");
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.module("Context menu", {
		beforeEach: async function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					template: new Text()
				}),
				contextMenu: new Menu(),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				}
			});
			this.oTable.placeAt("qunit-fixture");
			await this.oTable.initialized();
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Standard context menu", function(assert) {
		const oInnerTable = this.oTable._oTable;
		const oContextMenu = this.oTable.getContextMenu();
		let oInnerTableEvent;

		this.spy(this.oTable, "_onBeforeOpenContextMenu");
		oInnerTable.attachBeforeOpenContextMenu((oEvent) => {
			oInnerTableEvent = oEvent;
		});

		oInnerTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: oInnerTable.getRows()[0].getBindingContext("namedModel"),
			column: this.oTable.getColumns()[0],
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});

		this.oTable._onBeforeOpenContextMenu.resetHistory();
		oInnerTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: undefined,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: oInnerTable.getRows()[0].getBindingContext("namedModel"),
			column: undefined,
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: undefined
		});
	});

	QUnit.test("Group header row context menu", function(assert) {
		const oInnerTable = this.oTable._oTable;
		const oContextMenu = this.oTable._oTable.getAggregation("groupHeaderRowContextMenu");
		let oInnerTableEvent;

		assert.ok(oContextMenu.isA("sap.ui.mdc.table.menus.GroupHeaderRowContextMenu"), "GroupHeaderRowContextMenu is set");

		this.spy(this.oTable, "_onBeforeOpenContextMenu");
		oInnerTable.attachBeforeOpenContextMenu((oEvent) => {
			oInnerTableEvent = oEvent;
		});

		oInnerTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: 0,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: oInnerTable.getRows()[0].getBindingContext("namedModel"),
			column: this.oTable.getColumns()[0],
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: 1
		});

		this.oTable._onBeforeOpenContextMenu.resetHistory();
		oInnerTable.fireBeforeOpenContextMenu({
			rowIndex: 0,
			columnIndex: undefined,
			contextMenu: oContextMenu
		});
		assert.equal(this.oTable._onBeforeOpenContextMenu.callCount, 1, "Table#_onBeforeOpenContextMenu call");
		sinon.assert.calledWithExactly(this.oTable._onBeforeOpenContextMenu, {
			bindingContext: oInnerTable.getRows()[0].getBindingContext("namedModel"),
			column: undefined,
			contextMenu: oContextMenu,
			event: oInnerTableEvent,
			groupLevel: 1
		});
	});

	QUnit.module("setContextMenu", {
		beforeEach: async function() {
			this.oType = new GridTableType();
			this.oTable = new Table({type: this.oType});
			await this.oTable.initialized();
			this.oInnerTable = this.oTable._oTable;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Context menu appears on the inner table", function(assert) {
		const oMenu = new Menu();

		this.oType.setContextMenu(oMenu);
		assert.strictEqual(this.oInnerTable.getContextMenu(), oMenu);
		oMenu.destroy();
	});

	QUnit.test("Context menu can be cleared", function(assert) {
		const oMenu = new Menu();

		this.oType.setContextMenu(oMenu);
		this.oType.setContextMenu();
		assert.strictEqual(this.oInnerTable.getContextMenu(), null);
		oMenu.destroy();
	});

	QUnit.test("setContextMenu is safe to call before the inner table is created", function(assert) {
		assert.expect(0);
		const oType = new GridTableType();

		oType.setContextMenu(new Menu());
		oType.destroy();
	});

	QUnit.module("setFooter", {
		beforeEach: async function() {
			this.oType = new GridTableType();
			this.oTable = new Table({type: this.oType});
			await this.oTable.initialized();
			this.oInnerTable = this.oTable._oTable;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Footer appears on the inner table", function(assert) {
		const oFooter = new Control();

		this.oType.setFooter(oFooter);
		assert.strictEqual(this.oInnerTable.getFooter(), oFooter);
		oFooter.destroy();
	});

	QUnit.test("Footer can be cleared", function(assert) {
		const oFooter = new Control();

		this.oType.setFooter(oFooter);
		this.oType.setFooter();
		assert.strictEqual(this.oInnerTable.getFooter(), null);
		oFooter.destroy();
	});

	QUnit.test("setFooter is safe to call before the inner table is created", function(assert) {
		assert.expect(0);
		const oType = new GridTableType();

		oType.setFooter(new Control());
		oType.destroy();
	});

	QUnit.module("setNoData", {
		beforeEach: async function() {
			this.oType = new GridTableType();
			this.oTable = new Table({type: this.oType});
			await this.oTable.initialized();
			this.oInnerTable = this.oTable._oTable;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("String noData appears on the inner table", function(assert) {
		this.oType.setNoData("No data");
		assert.strictEqual(this.oInnerTable.getNoData(), "No data");
	});

	QUnit.test("IllustratedMessage appears on the inner table with correct settings", function(assert) {
		const fnOpenSettingsDialog = sinon.stub(PersonalizationUtils, "openSettingsDialog");
		const oNoData = new IllustratedMessage();

		this.oType.setNoData(oNoData);

		assert.strictEqual(this.oInnerTable.getNoData(), oNoData, "inner table has the IllustratedMessage");
		assert.ok(oNoData.getEnableVerticalResponsiveness(), "enableVerticalResponsiveness is true for GridTable");

		const oNoColumnsMessage = this.oInnerTable.getAggregation("_noColumnsMessage");
		assert.ok(oNoColumnsMessage, "a no-columns message is added");
		const oButton = oNoColumnsMessage.getAdditionalContent()[0];
		assert.ok(oButton.isA("sap.m.Button"), "the no-columns message has a settings button");
		assert.strictEqual(oButton.getIcon(), "sap-icon://action-settings", "button uses the settings icon");
		oButton.firePress();
		assert.ok(fnOpenSettingsDialog.calledOnceWith(this.oTable), "pressing the button opens the settings dialog");

		fnOpenSettingsDialog.restore();
	});

	QUnit.test("No-columns message is only created once even when the IllustratedMessage is replaced", function(assert) {
		this.oType.setNoData(new IllustratedMessage());
		this.oType.setNoData(new IllustratedMessage());
		assert.ok(this.oInnerTable.getAggregation("_noColumnsMessage"), "no-columns message still exists after replacement");
	});

	QUnit.test("setNoData is safe to call before the inner table is created", function(assert) {
		assert.expect(0);
		const oType = new GridTableType();

		oType.setNoData("No data");
		oType.destroy();
	});

	QUnit.test("Default no data text is set on the inner table when setNoData is never called", function(assert) {
		assert.strictEqual(this.oInnerTable.getNoData(), this.oTable._getDefaultNoDataText(), "inner table has the default no data text");
	});
});