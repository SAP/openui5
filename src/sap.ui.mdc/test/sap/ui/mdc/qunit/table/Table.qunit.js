/* global QUnit, sinon */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/format/ListFormat",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/TableTypeBase",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/table/menus/GroupHeaderRowContextMenu",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/mdc/FilterBar",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Boolean",
	"sap/ui/base/Event",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/mdc/ActionToolbar",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/m/plugins/CopyProvider",
	"sap/m/plugins/CellSelector",
	"../util/createAppEnvironment",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/ColumnResizer",
	"sap/m/plugins/ColumnAIAction",
	"sap/ui/core/message/Message",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/Deferred",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/performance/trace/FESRHelper",
	"sap/m/table/Util",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/Menu",
	"sap/ui/fl/variants/VariantManagement"
], function(
	TableQUnitUtils,
	Element,
	Library,
	QUtils,
	nextUIUpdate,
	KeyCodes,
	ListFormat,
	Table,
	Column,
	TableTypeBase,
	GridTableType,
	ResponsiveTableType,
	ResponsiveColumnSettings,
	GroupHeaderRowContextMenu,
	PersonalizationUtils,
	FilterBar,
	Text,
	Button,
	MessageBox,
	ODataListBinding,
	JSONModel,
	BooleanType,
	UI5Event,
	IllustratedMessage,
	IllustratedMessageType,
	Control,
	CoreLibrary,
	MLibrary,
	ActionToolbar,
	ActionToolbarAction,
	CopyProvider,
	CellSelector,
	createAppEnvironment,
	ControlPersonalizationWriteAPI,
	PluginBase,
	ColumnResizer,
	ColumnAIAction,
	Message,
	Theming,
	ThemeParameters,
	RowActionItem,
	RowSettings,
	jQuery,
	Deferred,
	ManagedObjectObserver,
	FESRHelper,
	MTableUtil,
	TableP13nMode,
	TableType,
	ConditionValidated,
	OperatorName,
	Menu,
	VariantManagement
) {
	"use strict";

	const HasPopup = CoreLibrary.aria.HasPopup;
	const aTestedTypes = [TableType.Table, TableType.ResponsiveTable];
	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";
	const ButtonType = MLibrary.ButtonType;
	const ToolbarDesign = MLibrary.ToolbarDesign;
	const TitleLevel = CoreLibrary.TitleLevel;

	const CustomFilterControl = Control.extend("sap.ui.mdc.table.qunit.CustomFilterControl", {
		metadata: {
			interfaces: ["sap.ui.mdc.IFilter"],
			properties: {
				customConditions: {type: "object"},
				customSearch: {type: "string", defaultValue: ""}
			},
			events: {
				search: {},
				filtersChanged: {}
			}
		},

		// no rendering required for the tests in this module
		renderer: null,

		getConditions: function() { return this.getCustomConditions(); },
		validate: function() { return Promise.resolve(); },
		getSearch: function() { return this.getCustomSearch(); }
	});

	function wait(iMilliseconds) {
		return new Promise(function(resolve) {
			setTimeout(resolve, iMilliseconds);
		});
	}

	function triggerDragEvent(sDragEventType, oControl) {
		const oJQueryDragEvent = jQuery.Event(sDragEventType);
		let oNativeDragEvent;

		if (typeof Event === "function") {
			oNativeDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE
			oNativeDragEvent = document.createEvent("Event");
			oNativeDragEvent.initEvent(sDragEventType, true, true);
		}

		// Fake the DataTransfer object. This is the only cross-browser solution.
		oNativeDragEvent.dataTransfer = {
			dropEffect: "none",
			effectAllowed: "none",
			files: [],
			items: [],
			types: [],
			setDragImage: function() {
			},
			setData: function() {
			},
			getData: function() {
			}
		};

		oJQueryDragEvent.originalEvent = oNativeDragEvent;

		const oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			jQuery(oDomRef).trigger(oJQueryDragEvent);
		}
	}

	function getInnerColumnLabel(oColumn) {
		if (oColumn.isA("sap.ui.table.Column")) {
			return oColumn.getLabel().getLabel();
		} else if (oColumn.isA("sap.m.Column")) {
			return oColumn.getHeader().getLabel();
		} else {
			return oColumn._oColumnHeaderLabel.getLabel();
		}
	}

	const aToolbarEndOrderSuffix = ["copy", "paste", "showHideDetails", "collapseAll", "expandAll", "settings", "export"];
	const fnActionToolbarValidateAggregation = ActionToolbar.prototype.validateAggregation;

	ActionToolbar.prototype.validateAggregation = function(sAggregationName, oAggregation) {
		if (sAggregationName === "end" && !aToolbarEndOrderSuffix.some((sSuffix) => oAggregation.getId().endsWith("-" + sSuffix))) {
			throw new Error("The order is not defined for the toolbar item " + oAggregation.getId());
		}
		return fnActionToolbarValidateAggregation.apply(this, arguments);
	};

	QUnit.module("Type initialization", {
		beforeEach: function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Default type", async function(assert) {
		assert.ok(!this.oTable._oTable, "Before initialization: Inner table does not exist");

		await this.oTable.initialized();
		assert.ok(this.oTable._getType().isA("sap.ui.mdc.table.GridTableType"), "Default type instance is a sap.ui.mdc.table.GridTableType");
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "Inner table is a sap.ui.table.Table");
	});

	QUnit.test("Shorthand type='Table'", async function(assert) {
		const oTable = new Table({type: TableType.Table});

		await oTable.initialized();
		assert.ok(oTable._getType().isA("sap.ui.mdc.table.GridTableType"), "Type instance is a sap.ui.mdc.table.GridTableType");
		assert.ok(oTable._oTable.isA("sap.ui.table.Table"), "Inner table is a sap.ui.table.Table");
		oTable.destroy();
	});

	QUnit.test("Shorthand type='TreeTable'", async function(assert) {
		const oTable = new Table({type: TableType.TreeTable});

		await oTable.initialized();
		assert.ok(oTable._getType().isA("sap.ui.mdc.table.TreeTableType"), "Type instance is a sap.ui.mdc.table.TreeTableType");
		assert.ok(oTable._oTable.isA("sap.ui.table.TreeTable"), "Inner table is a sap.ui.table.TreeTable");
		oTable.destroy();
	});

	QUnit.test("Shorthand type='ResponsiveTable'", async function(assert) {
		const oTable = new Table({type: TableType.ResponsiveTable});

		await oTable.initialized();
		assert.ok(oTable._getType().isA("sap.ui.mdc.table.ResponsiveTableType"), "Type instance is a sap.ui.mdc.table.ResponsiveTableType");
		assert.ok(oTable._oTable.isA("sap.m.Table"), "Inner table is a sap.m.Table");
		oTable.destroy();
	});

	QUnit.test("Change type from instance to shorthand setting", async function(assert) {
		const test = async (oFromType, sToType) => {
			this.oTable.setType(oFromType);
			await this.oTable.initialized();
			const oOldInnerTable = this.oTable._oTable;
			const oToolbar = this.oTable._oToolbar;
			this.spy(oOldInnerTable, "destroy");
			this.oTable.setType(sToType);

			assert.ok(oOldInnerTable.destroy.called, "Inner table is destroyed");
			assert.notOk(this.oTable._oTable, "Reference to destroyed inner table is removed");
			assert.ok(!oFromType.isDestroyed(), "Old type is not destroyed");
			assert.ok(!oToolbar.isDestroyed(), "Toolbar is not destroyed");

			oFromType.destroy();
		};

		await test(new GridTableType(), TableType.ResponsiveTable);
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "New inner table is a sap.m.Table");

		await test(new ResponsiveTableType(), TableType.Table);
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "New inner table is a sap.ui.table.Table");
	});

	QUnit.test("Change type from shorthand setting to instance", async function(assert) {
		const test = async (sFromType, oToType) => {
			this.oTable.destroyType();
			this.oTable.setType(sFromType);
			await this.oTable.initialized();
			const oFromType = this.oTable._getType();
			const oOldInnerTable = this.oTable._oTable;
			const oToolbar = this.oTable._oToolbar;
			this.spy(oOldInnerTable, "destroy");
			this.oTable.setType(oToType);

			assert.ok(oOldInnerTable.destroy.called, "Inner table is destroyed");
			assert.notOk(this.oTable._oTable, "Reference to destroyed inner table is removed");
			assert.ok(oFromType.isDestroyed(), "Old default type is destroyed");
			assert.ok(!oToolbar.isDestroyed(), "Toolbar is not destroyed");
		};

		await test(TableType.Table, new ResponsiveTableType());
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "New inner table is a sap.m.Table");

		await test(TableType.ResponsiveTable, new GridTableType());
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "New inner table is a sap.ui.table.Table");
	});

	QUnit.test("Change type from instance to instance", async function(assert) {
		const test = async (oFromType, oToType) => {
			this.oTable.destroyType();
			this.oTable.setType(oFromType);
			await this.oTable.initialized();
			const oOldInnerTable = this.oTable._oTable;
			const oToolbar = this.oTable._oToolbar;
			this.spy(oOldInnerTable, "destroy");
			this.oTable.setType(oToType);

			assert.ok(oOldInnerTable.destroy.called, "Inner table is destroyed");
			assert.notOk(this.oTable._oTable, "Reference to destroyed inner table is removed");
			assert.ok(!oFromType.isDestroyed(), "Old type is not destroyed");
			assert.ok(!oToolbar.isDestroyed(), "Toolbar is not destroyed");

			oFromType.destroy();
		};

		await test(new GridTableType(), new ResponsiveTableType());
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "New inner table is a sap.m.Table");

		await test(new ResponsiveTableType(), new GridTableType());
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "New inner table is a sap.ui.table.Table");
	});

	QUnit.test("Change type during initialization", async function(assert) {
		this.oTable.setType(TableType.TreeTable);
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.TreeTable"), "Inner table is a sap.ui.table.TreeTable");
	});

	QUnit.test("Set same type", async function(assert) {
		this.oTable.setType(TableType.Table);
		await this.oTable.initialized();
		const oOldDefaultType = this.oTable._getType();
		const oOldInnerTable = this.oTable._oTable;
		this.spy(oOldInnerTable, "destroy");
		this.oTable.setType(TableType.Table);
		assert.ok(oOldInnerTable.destroy.called, "Old inner table destroyed");
		assert.notOk(this.oTable._oTable, "Reference to old inner table removed");
		assert.ok(oOldDefaultType.isDestroyed(), "Old default type is destroyed");

		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "Inner table is a sap.ui.table.Table");
	});

	QUnit.test("Change type during initialization to instance with bindings", async function(assert) {
		const oModel = new JSONModel({growingMode: "Scroll", popinLayout: "GridLarge"});
		this.oTable.setModel(oModel, "settings");
		this.oTable.setType(new ResponsiveTableType({growingMode: "{settings>/growingMode}", popinLayout: "{settings>/popinLayout}"}));

		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "New inner table is a sap.m.Table");
		assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), true, "Inner table has growing scroll to load set to true");
		assert.equal(this.oTable._oTable.getPopinLayout(), "GridLarge", "Inner table has popin layout 'GridLarge'");
	});

	QUnit.test("Change type from shorthand to instance with bindings", async function(assert) {
		const test = async (sFromType, oToType) => {
			this.oTable.destroyType();
			this.oTable.setType(sFromType);
			await this.oTable.initialized();
			const oFromType = this.oTable._getType();
			const oOldInnerTable = this.oTable._oTable;
			const oToolbar = this.oTable._oToolbar;
			this.spy(oOldInnerTable, "destroy");
			this.oTable.setType(oToType);

			assert.ok(oOldInnerTable.destroy.called, "Inner table is destroyed");
			assert.notOk(this.oTable._oTable, "Reference to destroyed inner table is removed");
			assert.ok(oFromType.isDestroyed(), "Old default type is destroyed");
			assert.ok(!oToolbar.isDestroyed(), "Toolbar is not destroyed");
		};
		const oModel = new JSONModel({
			resp: {growingMode: "Scroll", popinLayout: "GridLarge"},
			grid: {scrollThreshold: 5, selectionLimit: 100}
		});
		this.oTable.setModel(oModel, "settings");

		await test(TableType.Table, new ResponsiveTableType({
			growingMode: "{settings>/resp/growingMode}",
			popinLayout: "{settings>/resp/popinLayout}"
		}));
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "New inner table is a sap.m.Table");
		assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), true, "Inner table has growing scroll to load set to true");
		assert.equal(this.oTable._oTable.getPopinLayout(), "GridLarge", "Inner table has popin layout 'GridLarge'");

		await test(TableType.ResponsiveTable, new GridTableType({
			scrollThreshold: "{settings>/grid/scrollThreshold}",
			selectionLimit: "{settings>/grid/selectionLimit}"
		}));
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "New inner table is a sap.ui.table.Table");
		assert.equal(this.oTable._oTable.getScrollThreshold(), 5, "Inner table has scrollThreshold of 5");
		assert.equal(this.oTable._oTable.getDependents().find((oDependent) => oDependent.isA("sap.ui.table.plugins.SelectionPlugin")).getLimit(), 100,
			"Inner table has selection limit 100");
	});

	QUnit.test("Change type from instance to instance with bindings", async function(assert) {
		const test = async (oFromType, oToType) => {
			this.oTable.destroyType();
			this.oTable.setType(oFromType);
			await this.oTable.initialized();
			const oOldInnerTable = this.oTable._oTable;
			const oToolbar = this.oTable._oToolbar;
			this.spy(oOldInnerTable, "destroy");
			this.oTable.setType(oToType);

			assert.ok(oOldInnerTable.destroy.called, "Inner table is destroyed");
			assert.notOk(this.oTable._oTable, "Reference to destroyed inner table is removed");
			assert.ok(!oFromType.isDestroyed(), "Old type is not destroyed");
			assert.ok(!oToolbar.isDestroyed(), "Toolbar is not destroyed");
		};
		const oModel = new JSONModel({
			resp: {growingMode: "Scroll", popinLayout: "GridLarge"},
			grid: {scrollThreshold: 5, selectionLimit: 100}
		});
		this.oTable.setModel(oModel, "settings");

		await test(new GridTableType(), new ResponsiveTableType({
			growingMode: "{settings>/resp/growingMode}",
			popinLayout: "{settings>/resp/popinLayout}"
		}));
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.m.Table"), "New inner table is a sap.m.Table");
		assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), true, "Inner table has growing scroll to load set to true");
		assert.equal(this.oTable._oTable.getPopinLayout(), "GridLarge", "Inner table has popin layout 'GridLarge'");

		await test(new ResponsiveTableType(), new GridTableType({
			scrollThreshold: "{settings>/grid/scrollThreshold}",
			selectionLimit: "{settings>/grid/selectionLimit}"
		}));
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "New inner table is a sap.ui.table.Table");
		assert.equal(this.oTable._oTable.getScrollThreshold(), 5, "Inner table has scrollThreshold of 5");
		assert.equal(this.oTable._oTable.getDependents().find((oDependent) => oDependent.isA("sap.ui.table.plugins.SelectionPlugin")).getLimit(), 100,
			"Inner table has selection limit 100");
	});

	QUnit.test("Destroy type", async function(assert) {
		let oInnerTable;

		await this.oTable.initialized();
		const oToolbar = this.oTable._oToolbar;
		oInnerTable = this.oTable._oTable;
		this.oTable.destroyType();
		assert.ok(!oInnerTable.isDestroyed(), "Table#destroyType does not destroy the inner table if it is a default type");
		assert.ok(this.oTable._oTable, "Table#destroyType does not remove the reference to the inner table if it is a default type");
		assert.ok(!oToolbar.isDestroyed(), "Table#destroyType does not destroy the toolbar if it is a default type");
		assert.ok(this.oTable._oToolbar === oToolbar, "Table#destroyType does not replace the toolbar if it is a default type");

		this.oTable.setType(new GridTableType());
		await this.oTable.initialized();
		oInnerTable = this.oTable._oTable;
		this.oTable.destroyType();
		assert.ok(oInnerTable.isDestroyed(), "Table#destroyType destroys the inner table if it is a custom type");
		assert.ok(!this.oTable._oTable, "Table#destroyType removes the reference to the inner table if it is a custom type");
		assert.ok(!oToolbar.isDestroyed(), "Table#destroyType does not destroy the toolbar if it is a custom type");
		assert.ok(this.oTable._oToolbar === oToolbar, "Table#destroyType does not replace the toolbar if it is a custom type");

		await this.oTable.initialized();
		assert.ok(this.oTable._getType().isA("sap.ui.mdc.table.GridTableType"), "Default type is set after Table#destroyType");
		assert.ok(this.oTable._oTable, "Inner table is recreated after Table#destroyType");

		this.oTable.setType(new GridTableType());
		await this.oTable.initialized();
		oInnerTable = this.oTable._oTable;
		this.oTable.getType().destroy();
		assert.ok(oInnerTable.isDestroyed(), "TableType#destroy destroys the inner table if it is a custom type");
		assert.ok(!this.oTable._oTable, "TableType#destroy removes the reference to the inner table if it is a custom type");
		assert.ok(!oToolbar.isDestroyed(), "TableType#destroy does not destroy the toolbar if it is a custom type");
		assert.ok(this.oTable._oToolbar === oToolbar, "TableType#destroy does not replace the toolbar if it is a custom type");

		await this.oTable.initialized();
		assert.ok(this.oTable._getType().isA("sap.ui.mdc.table.GridTableType"), "Default type is set after TableType#destroy");
		assert.ok(this.oTable._oTable, "Inner table is recreated after TableType#destroy");

		this.oTable.setType(new ResponsiveTableType());
		await this.oTable.initialized();
		oInnerTable = this.oTable._oTable;
		this.oTable.getType().destroy();
		assert.ok(true, "Destroying a type that is not an instance of the default type should not throw an error");
	});

	QUnit.test("Destroy table", async function(assert) {
		await this.oTable.initialized();
		this.oTable.destroy();
		await wait(100);
		assert.notOk(this.oTable.getDependents().some((oDependent) => {
			return oDependent.isA("sap.ui.mdc.table.TableTypeBase");
		}, "Default type instance"));
	});

	QUnit.module("sap.ui.mdc.Table", {
		beforeEach: function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Interfaces", function(assert) {
		assert.ok(this.oTable.isA("sap.ui.mdc.IxState"));
	});

	QUnit.test("Rendering", async function(assert) {
		this.oTable.placeAt("qunit-fixture");
		await this.oTable.initialized();
		await nextUIUpdate();

		const oDomRef = this.oTable.getDomRef();

		assert.ok(!!oDomRef, "Table is rendered.");
		assert.ok(oDomRef.classList.contains("sapUiMdcTable"), "Table has class sapUiMdcTable");
		assert.ok(!oDomRef.style.width, "Table has a no default width");

		this.oTable.setWidth("200px");
		await nextUIUpdate();
		assert.equal(oDomRef.style.width, "200px", "Table has a custom width");

		const TestTableType = TableTypeBase.extend("sap.ui.mdc.test.TestTableType", {
			loadModules: function() {
				return Promise.resolve();
			},
			getTableStyleClasses: function() {
				return ["MyTestClassA", "MyTestClassB"];
			}
		});
		this.oTable.setType(new TestTableType());

		await this.oTable.initialized();
		await nextUIUpdate();
		assert.ok(oDomRef.classList.contains("sapUiMdcTable"), "Table has class sapUiMdcTable if the type provides additional classes");
		assert.ok(oDomRef.classList.contains("MyTestClassA"), "Table has class MyTestClassA provided by the type");
		assert.ok(oDomRef.classList.contains("MyTestClassB"), "Table has class MyTestClassB provided by the type");
	});

	QUnit.test("The sort order defined for the end aggregation of the toolbar", function(assert) {
		return this.oTable.initialized().then(() => {
			const aEndOrder = aToolbarEndOrderSuffix.map((sSuffix) => this.oTable.getId() + "-" + sSuffix);
			assert.deepEqual(this.oTable._oToolbar.getProperty("_endOrder"), aEndOrder);
		});
	});

	QUnit.test("Columns added to inner table", function(assert) {
		this.oTable.addColumn(new Column({
			minWidth: 8.4,
			header: "Test1",
			template: new Text({
				text: "Test1"
			}),
			creationTemplate: new Text({
				text: "Test1"
			}),
			required: true
		}));
		this.oTable.insertColumn(new Column({
			minWidth: 8.5,
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}), 0);
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 2);

		return this.oTable.initialized().then(function() {
			const aMDCColumns = this.oTable.getColumns();
			const aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test", "column0: label is correct");
			assert.equal(aInnerColumns[0].getMinWidth(), 136, "column0: minWidth is correct");

			assert.equal(aInnerColumns[1].getLabel().getText(), "Test1", "column1: label is correct");
			assert.equal(aInnerColumns[1].getMinWidth(), 134, "column1: minWidth is correct");

			assert.ok(aInnerColumns[1].getLabel().getLabel().isRequired(), "column1: is required");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test2", "column1: label is correct");
			assert.equal(aInnerColumns[2].getMinWidth(), 128, "column2: minWidth is correct (default value)");

			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test1", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test1", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false,
				"column1: creationTemplate renderWhitespace is disabled");
		}.bind(this));
	});

	QUnit.test("Columns added to inner table - one by one E.g. pers", function(assert) {
		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		return this.oTable.initialized().then(function() {
			let aMDCColumns = this.oTable.getColumns();
			let aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal("Test2", aInnerColumns[0].getLabel().getText());
		}.bind(this));

	});

	QUnit.test("Destroy", async function(assert) {
		await this.oTable.initialized();

		const oToolbar = this.oTable._oToolbar;
		const oInnerTable = this.oTable._oTable;

		this.oTable.destroy();
		assert.ok(oInnerTable.isDestroyed(), "Inner table is destroyed");
		assert.ok(!this.oTable.oTable, "Reference to destroyed inner table is removed");
		assert.ok(oToolbar.isDestroyed(), "Toolbar is destroyed");
		assert.ok(!this.oTable._oToolbar, "Reference to destroyed toolbar is removed");
	});

	QUnit.test("Destroy directly after creation", async function(assert) {
		this.spy(this.oTable, "_resetContent");
		this.spy(this.oTable, "_createContent");
		this.oTable.destroy();

		await wait(100);
		assert.equal(this.oTable._resetContent.callCount, 0, "_resetContent call");
		assert.equal(this.oTable._createContent.callCount, 0, "_createContent call");
	});

	QUnit.test("Invalidate", function(assert) {
		return this.oTable.initialized().then(function() {
			const oInnerTableInvalidate = sinon.spy(this.oTable._oTable, "invalidate");

			this.oTable.invalidate();

			assert.equal(oInnerTableInvalidate.callCount, 0, "Inner table is not invalidated if the MDC Table is invalidated");
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable", async function(assert) {
		const done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: TableType.ResponsiveTable
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oTable.addColumn(
			new Column({
				header: "Test",
				template: new Text({
					text: "Test"
				}),
				required: true,
				extendedSettings: new ResponsiveColumnSettings({
					importance: "High"
				})
			})
		);

		this.oTable.addColumn(
			new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				}),
				extendedSettings: new ResponsiveColumnSettings({
					importance: "Low"
				})
			})
		);

		this.oTable.insertColumn(new Column({
			header: "Test2",
			minWidth: 8.5,
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			const aMDCColumns = this.oTable.getColumns();
			const aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.ok(aInnerColumns[0].getHeader().getLabel().getRequired(), "First column is required");
			assert.equal(getInnerColumnLabel(aInnerColumns[0]).getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[0].getImportance(), "High");
			assert.equal(aInnerColumns[0].getAutoPopinWidth(), 8, "minWidth is not set, default value is 8");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getImportance(), "None", "importance is not set, default value is None");
			assert.equal(aInnerColumns[1].getAutoPopinWidth(), 8.5, "autoPopinWidth is set properly");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.equal(aInnerColumns[2].getImportance(), "Low");
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable - one by one E.g. pers", async function(assert) {
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: TableType.ResponsiveTable
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		return this.oTable.initialized().then(function() {
			let aMDCColumns = this.oTable.getColumns();
			let aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal("Test2", aInnerColumns[0].getHeader().getText());
			assert.equal(aMDCColumns[2].getHeader(), aInnerColumns[2].getHeader().getText());
			assert.equal("Test3", aInnerColumns[2].getHeader().getText());
		}.bind(this));
	});

	QUnit.test("insertAggregation('cell') should be skiped for sap.m.GroupHeaderListItem", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: TableType.ResponsiveTable,
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "column1",
						path: "column1",
						label: "column1",
						dataType: "String"
					}, {
						key: "column2",
						path: "column2",
						label: "column2",
						dataType: "String"
					}, {
						key: "column3",
						path: "column3",
						label: "column3",
						dataType: "String"
					}]
				}
			},
			columns: [
				new Column({
					header: "Column1",
					template: new Text({
						text: "{cell1}"
					}),
					propertyKey: "column1"
				}), new Column({
					header: "Column2",
					template: new Text({
						text: "{cell2}"
					}),
					propertyKey: "column2"
				})
			],
			models: new JSONModel({
				testPath: new Array(10).fill({
					column1: "cell1",
					column2: "cell2",
					column3: "cell3"
				})
			})
		});

		return this.oTable._fullyInitialized().then(function() {
			this.oTable.setGroupConditions({
				groupLevels: [
					{name: "column1"}
				]
			});
			return TableQUnitUtils.waitForBindingInfo(this.oTable);
		}.bind(this)).then(function() {
			const aItems = this.oTable._oTable.getItems();
			assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "Grouping applied as expected");
			assert.strictEqual(aItems.length, 11, "1 group header item + 10 list items");

			const fnIsASpy = sinon.spy(aItems[0], "isA");

			// add a column
			this.oTable.insertColumn(new Column({
				header: "Column3",
				template: new Text({
					text: "{cell3}"
				}),
				propertyKey: "column3"
			}), 1);

			assert.ok(fnIsASpy.calledWith("sap.m.GroupHeaderListItem"), 10, "insertAggregation('cells') skipped for sap.m.GroupHeaderListItem");
		}.bind(this));
	});

	QUnit.test("bindRows with rowCount without wrapping dataReceived", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: TableType.ResponsiveTable,
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oBindingInfo = this.oTable._oTable.getBindingInfo("items");
			const fDataReceived = oBindingInfo.events["dataReceived"];

			sinon.stub(this.oTable._oTable, "getBinding");

			const iCurrentLength = 10;
			const bIsLengthFinal = true;
			const oRowBinding = {
				getLength: function() {
					return iCurrentLength;
				},
				getCount: function() {
					return iCurrentLength;
				},
				isLengthFinal: function() {
					return bIsLengthFinal;
				},
				isA: function() {
					// Is not a TreeBinding
					return false;
				}
			};
			this.oTable._oTable.getBinding.returns(oRowBinding);

			assert.equal(this.oTable._oTitle.getText(), "Test");

			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");
		}.bind(this));
	});

	QUnit.test("bindRows with rowCount with wrapping dataReceived", function(assert) {
		const fCustomDataReceived = sinon.spy();
		let fnOriginalUpdateBindingInfo;

		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: TableType.Table,
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		return this.oTable.initialized().then(function() {
			fnOriginalUpdateBindingInfo = this.oTable.getControlDelegate().updateBindingInfo;
			this.oTable.getControlDelegate().updateBindingInfo = function(oTable, oBindingInfo) {
				fnOriginalUpdateBindingInfo.apply(this, arguments);
				oBindingInfo.events = {
					dataReceived: fCustomDataReceived
				};
			};
			return TableQUnitUtils.waitForBindingInfo(this.oTable);
		}.bind(this)).then(function() {
			const oRowBinding = sinon.createStubInstance(ODataListBinding);

			oRowBinding.isLengthFinal.returns(true);
			oRowBinding.getContexts.returns([]);

			sinon.stub(this.oTable._oTable, "getBinding");
			this.oTable._oTable.getBinding.returns(oRowBinding);

			const oBindingInfo = this.oTable._oTable.getBindingInfo("rows");
			const fDataReceived = oBindingInfo.events["dataReceived"];
			assert.equal(this.oTable._oTitle.getText(), "Test");

			assert.equal(this.oTable._oTitle.getText(), "Test");
			assert.ok(fCustomDataReceived.notCalled);

			oRowBinding.getCount.returns(undefined);
			fDataReceived(new UI5Event("dataReceived", oRowBinding));
			assert.equal(this.oTable._oTitle.getText(), "Test");

			oRowBinding.getCount.returns(10);
			fDataReceived(new UI5Event("dataReceived", oRowBinding));
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");
			assert.ok(fCustomDataReceived.calledTwice);

			this.oTable.getControlDelegate().updateBindingInfo = fnOriginalUpdateBindingInfo;
		}.bind(this));
	});

	QUnit.test("check for initial column index", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: TableType.ResponsiveTable,
			columns: [
				new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				new Column({
					id: "foo1",
					header: "Test1",
					template: new Text({
						text: "template1"
					})
				})

			],
			models: new JSONModel({
				testPath: new Array(10).fill({})
			})
		});

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			let aMDCColumns = this.oTable.getColumns();
			let aInnerColumns = this.oTable._oTable.getColumns();
			const oInnerColumnListItem = this.oTable._oRowTemplate;
			const oFirstInnerItem = this.oTable._oTable.getItems()[0];

			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "template2"
				})
			}), 1);
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test1");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[2].getText(), "template1");
			assert.equal(oFirstInnerItem.getCells().length, 3, "Inner items have 3 cells");
			assert.ok(oFirstInnerItem.getCells()[1].isA("sap.ui.core.InvisibleText"),
				"A placeholder cell is added to the inner items for the inserted column");

			this.oTable.removeColumn("foo0");
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			const oColumnDestroy = sinon.spy(this.oTable._oTable.getColumns()[1], "destroy");
			this.oTable.removeColumn("foo1");
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");
			assert.ok(oColumnDestroy.calledOnce, "Inner column destroyed");
		}.bind(this));
	});

	QUnit.test("bindAggregation for columns uses default behaviour", function(assert) {
		return this.oTable.initialized().then(function() {
			const sPath = "/columnPath";
			const oTemplate = new Column({
				header: '{name}'
			});
			this.oTable.bindAggregation("columns", {
				path: sPath,
				template: oTemplate
			});

			const oBindingInfo = this.oTable.getBindingInfo("columns");
			assert.equal(oBindingInfo.path, sPath);
			assert.equal(oBindingInfo.template, oTemplate);
		}.bind(this));
	});

	QUnit.test("setThreshold", async function(assert) {
		const oTable = this.oTable;
		const setThresholdSpy = sinon.spy(oTable, "setThreshold");
		const invalidateSpy = sinon.spy(oTable, "invalidate");

		oTable.setThreshold(10);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setThresholdSpy.returned(oTable));

		await oTable.initialized();

		invalidateSpy.reset();
		assert.equal(oTable._oTable.getThreshold(), oTable.getThreshold());

		oTable.setThreshold(-1);
		assert.equal(oTable._oTable.getThreshold(), oTable._oTable.getMetadata().getProperty("threshold").defaultValue);

		oTable.setThreshold(20);
		assert.equal(oTable._oTable.getThreshold(), 20);

		oTable.setThreshold(undefined);
		assert.equal(oTable._oTable.getThreshold(), oTable._oTable.getMetadata().getProperty("threshold").defaultValue);
		assert.equal(invalidateSpy.callCount, 0);

		oTable.setThreshold(30);
		oTable.setType(TableType.ResponsiveTable);

		await oTable.initialized();

		invalidateSpy.reset();
		assert.equal(oTable._oTable.getGrowingThreshold(), 30);

		oTable.setThreshold(-1);
		assert.equal(oTable._oTable.getGrowingThreshold(), oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);

		oTable.setThreshold(20);
		assert.equal(oTable._oTable.getGrowingThreshold(), 20);

		oTable.setThreshold(null);
		assert.equal(oTable._oTable.getGrowingThreshold(), oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);
		assert.equal(invalidateSpy.callCount, 0);
	});

	QUnit.test("noDataAggregation", function(assert) {
		const done = assert.async();
		const setNoDataSpy = sinon.spy(this.oTable, "setNoData");
		const invalidateSpy = sinon.spy(this.oTable, "invalidate");
		const sNoDataText = "Some No Data text";
		this.oTable.setNoData(sNoDataText);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setNoDataSpy.returned(this.oTable));

		this.oTable.initialized().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoData());
			assert.equal(this.oTable._oTable.getNoData(), sNoDataText);

			this.oTable.setNoData();
			assert.equal(this.oTable.getNoData(), null);

			this.oTable.setNoData("foo");
			assert.equal(this.oTable._oTable.getNoData(), "foo");

			this.oTable.setNoData(undefined);
			assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setNoData("test");
			this.oTable.setType(TableType.ResponsiveTable);

			this.oTable.initialized().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getNoData(), "test");

				this.oTable.setNoData();
				assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());

				this.oTable.setNoData("another text");
				assert.equal(this.oTable._oTable.getNoData(), "another text");

				this.oTable.setNoData(null);
				assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());
				assert.equal(invalidateSpy.callCount, 0);

				invalidateSpy.resetHistory();

				const oNoData = new IllustratedMessage();
				const fnOpenSettingsDialogStub = sinon.stub(PersonalizationUtils, "openSettingsDialog");
				this.oTable.setNoData(oNoData);

				assert.ok(setNoDataSpy.returned(this.oTable));
				assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoData());
				assert.notOk(this.oTable._oTable.getNoData().getEnableVerticalResponsiveness());
				assert.ok(this.oTable._oTable.getAggregation("_noColumnsMessage"), "No columns illustration message is added");
				assert.ok(this.oTable._oTable.getAggregation("_noColumnsMessage").getAdditionalContent()[0].isA("sap.m.Button"));
				assert.equal(this.oTable._oTable.getAggregation("_noColumnsMessage").getAdditionalContent()[0].getIcon(),
					"sap-icon://action-settings");
				assert.notOk(this.oTable._oTable.getAggregation("_noColumnsMessage").getEnableVerticalResponsiveness());

				this.oTable._oTable.getAggregation("_noColumnsMessage").getAdditionalContent()[0].firePress();
				assert.ok(fnOpenSettingsDialogStub.calledOnce);
				assert.ok(fnOpenSettingsDialogStub.calledWith(this.oTable));
				fnOpenSettingsDialogStub.restore();

				oNoData.setTitle("Title");
				oNoData.setDescription("Description");

				assert.equal(this.oTable._oTable.getNoData().getTitle(), this.oTable.getNoData().getTitle());
				assert.equal(this.oTable._oTable.getNoData().getDescription(), this.oTable.getNoData().getDescription());

				this.oTable.setNoData("CustomText");
				assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoData());
				assert.equal(this.oTable._oTable.getNoData(), "CustomText");

				this.oTable.setNoData(oNoData).setType(TableType.Table);
				this.oTable.initialized().then(function() {
					assert.ok(this.oTable._oTable.getNoData().getEnableVerticalResponsiveness());
					assert.ok(this.oTable._oTable.getAggregation("_noColumnsMessage").getEnableVerticalResponsiveness());

					oNoData.destroy();
					assert.notOk(this.oTable.getNoData());
					assert.notOk(this.oTable._oTable.getNoData());

					this.oTable.setNoData("foo");
					assert.equal(this.oTable._oTable.getNoData(), "foo");
					this.oTable._oTable = null;
					this.oTable.destroyNoData();
					assert.equal(this.oTable.getNoData(), null);

					const oNodata = new Text("foo");
					this.oTable.setNoData(oNodata);
					assert.equal(this.oTable.getNoData(), oNodata);
					this.oTable._oTable = null;
					const oDestroyNodataSpy = sinon.spy(this.oTable._vNoData, "destroy");
					this.oTable.destroyNoData();
					assert.ok(oDestroyNodataSpy.calledOnce);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Header Visibility and Labelling", function(assert) {
		const done = assert.async();
		this.oTable.initialized().then(function() {
			const oTitle = this.oTable._oTitle;
			assert.ok(oTitle, "Title is available");
			assert.ok(!oTitle.getWidth(), "Title is shown");
			assert.equal(this.oTable._oTitle.getTitleStyle(), "H5", "Title style Property added");
			this.oTable.setHeaderVisible(false);
			assert.equal(oTitle.getWidth(), "0px", "Title is hidden due to width");

			assert.equal(this.oTable._oTable.getAriaLabelledBy().length, 1, "ARIA labelling available for inner table");
			assert.equal(this.oTable._oTable.getAriaLabelledBy()[0], oTitle.getId(), "ARIA labelling for inner table points to title");

			done();
		}.bind(this));
	});

	QUnit.test("Header count display", function(assert) {
		const done = assert.async();
		this.oTable.setShowRowCount(false);

		let iCount = 5;
		const oRowBinding = {
			getCount: function() {
				return iCount;
			}
		};
		const fnGetRowBindingStub = sinon.stub(this.oTable, "getRowBinding");
		fnGetRowBindingStub.returns(oRowBinding);

		this.oTable.initialized().then(function() {
			const oTitle = this.oTable._oTitle;
			const sHeaderText = "myTestHeader";
			this.oTable.setHeader(sHeaderText);
			assert.equal(oTitle.getText(), sHeaderText, "Header text is correct.");

			this.oTable.setShowRowCount(true);

			assert.equal(this.oTable.getHeader(), sHeaderText, "Header Property has not changed");
			assert.equal(oTitle.getText(), sHeaderText + " (5)", "Header has to contain row count");

			iCount = 0;
			this.oTable._updateHeaderText();
			assert.equal(oTitle.getText(), sHeaderText, "Header text does not contain row count when it is 0");

			fnGetRowBindingStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Update RowCount on 'activateCreate' Event from Binding", function(assert) {
		const done = assert.async();
		const sHeaderText = "myTestHeader";

		let iCount = 5;
		const oRowBinding = {
			getCount: function() {
				return iCount;
			}
		};

		const fnGetRowBindingStub = sinon.stub(this.oTable, "getRowBinding");
		fnGetRowBindingStub.returns(oRowBinding);

		this.oTable.initialized().then(function() {
			this.oTable.setHeader(sHeaderText);
			this.oTable.setShowRowCount(true);
			this.oTable._updateHeaderText();

			const oTitle = this.oTable._oTitle;
			assert.equal(oTitle.getText(), sHeaderText + " (5)", "Header shows the right row count");

			const oBindingInfo = {};
			this.oTable._finalizeBindingInfo(oBindingInfo);
			assert.ok(oBindingInfo.events.createActivate, "createActivate event is registered");
			oBindingInfo.events.createActivate();
			iCount = 6;
			assert.equal(oTitle.getText(), sHeaderText + " (5)", "Header shows the right row count");

			Promise.resolve().then(() => {
				assert.equal(oTitle.getText(), sHeaderText + " (6)", "Header shows the right row count");
				fnGetRowBindingStub.restore();
				done();
			});

		}.bind(this));
	});

	const fnRearrangeTest = async function(oTable, iColumnIndexFrom, iColumnIndexTo, bKeyboardHandling) {
		oTable.addColumn(new Column({
			propertyKey: "col0",
			header: "col0",
			template: new Text({
				text: "{col0}"
			})
		}));
		oTable.addColumn(new Column({
			propertyKey: "col1",
			header: "col1",
			template: new Text({
				text: "{col1}"
			})
		}));
		oTable.setP13nMode([
			"Column"
		]);

		await oTable.initialized();
		await nextUIUpdate();

		await new Promise((resolve) => {
			sap.ui.require([
				sDelegatePath
			], (TableDelegate) => {
				const aColumns = oTable.getColumns();
				const aInnerColumns = oTable._oTable.getColumns();

				sinon.stub(oTable, "getCurrentState").returns({
					items: [{
						"name": aColumns[0].getPropertyKey(),
						"id": aColumns[0].getId(),
						"label": aColumns[0].getHeader()
					}, {
						"name": aColumns[1].getPropertyKey(),
						"id": aColumns[1].getId(),
						"label": aColumns[1].getHeader()
					}],
					sorters: []
				});

				if (bKeyboardHandling && iColumnIndexFrom + 1 === iColumnIndexTo) {
					aInnerColumns[iColumnIndexFrom].focus();
					QUtils.triggerEvent("keydown", document.activeElement, {code: "ArrowRight", ctrlKey: true});
				} else {
					triggerDragEvent("dragstart", aInnerColumns[iColumnIndexFrom]);
					triggerDragEvent("dragenter", aInnerColumns[iColumnIndexTo]);
					triggerDragEvent("drop", aInnerColumns[iColumnIndexTo]);
				}

				oTable.getCurrentState.restore();
				resolve();
			});
		});
	};

	QUnit.test("rearrange columns", async function(assert) {
		const oCreateColumnReordeChangeSpy = sinon.spy(PersonalizationUtils, "createColumnReorderChange");

		this.oTable.placeAt("qunit-fixture");
		await fnRearrangeTest(this.oTable, 0, 1); // move from 0 --> 1
		assert.ok(oCreateColumnReordeChangeSpy.calledOnce);
		assert.ok(oCreateColumnReordeChangeSpy.calledWithExactly(this.oTable, {
			column: this.oTable.getColumns()[0],
			index: 1
		}));
		oCreateColumnReordeChangeSpy.restore();
	});

	QUnit.test("rearrange columns via keyboard handling", async function(assert) {
		const oCreateColumnReordeChangeSpy = sinon.spy(PersonalizationUtils, "createColumnReorderChange");

		this.oTable.placeAt("qunit-fixture");
		await fnRearrangeTest(this.oTable, 0, 1, true); // move from 0 --> 1
		assert.ok(oCreateColumnReordeChangeSpy.calledOnce);
		assert.ok(oCreateColumnReordeChangeSpy.calledWithExactly(this.oTable, {
			column: this.oTable.getColumns()[0],
			index: 1
		}));
		oCreateColumnReordeChangeSpy.restore();
	});

	QUnit.test("rearrange columns (similar index) - no change should be created", async function(assert) {
		const fCreateChanges = sinon.spy(this.oTable.getEngine(), "createChanges");

		this.oTable.placeAt("qunit-fixture");
		await fnRearrangeTest(this.oTable, 0, 0); // move from 0 --> 0
		assert.ok(fCreateChanges.notCalled);
		fCreateChanges.restore();
	});

	QUnit.test("rearrange columns - ResponsiveTable", async function(assert) {
		const oTable = new Table({
			type: TableType.ResponsiveTable
		});

		oTable.addColumn(new Column("test1", {
			header: "Test1",
			template: new Text({
				text: "Test1"
			})
		}));

		oTable.addColumn(new Column("test2", {
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}));

		oTable.addColumn(new Column("test3", {
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		// place the table at the dom
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		return oTable.initialized().then(function() {
			const oTest3MDCColumn = oTable.getColumns()[2];
			const oTest3InnerColumn = oTest3MDCColumn.getInnerColumn();
			const oTest3Cell = oTable._oRowTemplate.getCells()[oTable._oTable.indexOfColumn(oTest3InnerColumn)];
			assert.strictEqual(oTest3MDCColumn.getHeader(), "Test3");
			assert.strictEqual(oTable.indexOfColumn(oTest3MDCColumn), 2, "Column index is 2");
			assert.strictEqual(oTest3InnerColumn.getOrder(), 2, "inner column has the correct order");
			assert.strictEqual(oTest3Cell.getText(), "Test3", "correct cell template found");

			// trigger moveColumn - Test3 column is moved to index 0
			oTable.moveColumn(oTest3MDCColumn, 0);
			assert.strictEqual(oTable.indexOfColumn(oTest3MDCColumn), 0, "Test3 column is moved to index 0");
			assert.strictEqual(oTable._oTable.indexOfColumn(oTest3InnerColumn), 0, "Inner table column aggregation also updated");
			assert.strictEqual(oTest3InnerColumn.getOrder(), 0, "Test3 inner column is updated with the correct column order");

			oTable.destroy();
		});
	});

	QUnit.test("Selection - GridTable", async function(assert) {
		const oModel = new JSONModel({
			testPath: [
				{}, {}, {}, {}, {}
			]
		});
		const oSelectionChange = this.spy();
		let bRowPressFired = false;
		let oSelectionPlugin = null;

		function selectRow(oRow, bUser, bNoRowSelector) {
			return new Promise(function(resolve) {
				oSelectionPlugin.attachEventOnce("selectionChange", resolve);

				if (bUser) {
					if (bNoRowSelector) {
						jQuery(oRow.getCells()[0].getDomRef()).trigger("tap");
					} else {
						jQuery(oRow.getDomRefs().rowSelector).trigger("tap");
					}
					return;
				}

				oSelectionPlugin.setSelectedIndex(oRow.getIndex(), true);
			});
		}

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: new GridTableType(),
			models: oModel,
			columns: new Column({
				header: "test",
				template: new Text()
			}),
			selectionChange: oSelectionChange,
			rowPress: () => {
				bRowPressFired = true;
			}
		});
		this.oTable.placeAt("qunit-fixture");

		await this.oTable.initialized();
		await TableQUnitUtils.nextEvent("rowsUpdated", this.oTable._oTable);

		oSelectionPlugin = PluginBase.getPlugin(this.oTable._oTable, "sap.ui.table.plugins.SelectionPlugin");

		assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None");
		assert.ok(oSelectionPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin"), "Plugin is a MultiSelectionPlugin");
		assert.ok(!oSelectionPlugin.getEnabled(), "MultiSelectionPlugin disabled");

		this.oTable.setSelectionMode("Single");
		assert.equal(this.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
		assert.ok(oSelectionPlugin.getEnabled(), "MultiSelectionPlugin enabled");
		assert.equal(oSelectionPlugin.getSelectionMode(), "Single", "Selection Mode Single - MultiSelectionPlugin");
		assert.equal(this.oTable._oTable.getSelectionBehavior(), "RowSelector", "Selection Behavior RowSelector");
		await nextUIUpdate();

		await selectRow(this.oTable._oTable.getRows()[0], true);
		assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		await selectRow(this.oTable._oTable.getRows()[1], true);
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		this.oTable.clearSelection();
		assert.equal(this.oTable.getSelectedContexts().length, 0, "No rows selected");
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		this.oTable.setSelectionMode("SingleMaster");
		assert.equal(this.oTable.getSelectionMode(), "SingleMaster", "Selection Mode Single - MDCTable");
		assert.equal(oSelectionPlugin.getSelectionMode(), "Single", "Selection Mode Single - MultiSelectionPlugin");
		assert.equal(this.oTable._oTable.getSelectionBehavior(), "RowOnly", "Selection Behavior RowOnly");
		await nextUIUpdate();

		oSelectionChange.resetHistory();
		await selectRow(this.oTable._oTable.getRows()[0], true, true);
		assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		await selectRow(this.oTable._oTable.getRows()[1], true, true);
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");
		assert.ok(!bRowPressFired, "rowPress event not fired");

		oSelectionChange.resetHistory();
		this.oTable.clearSelection();
		assert.equal(this.oTable.getSelectedContexts().length, 0, "No rows selected");
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		this.oTable.setSelectionMode("Multi");
		assert.equal(this.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
		assert.equal(oSelectionPlugin.getSelectionMode(), "MultiToggle", "Selection Mode MultiToggle - MultiSelectionPlugin");
		assert.equal(this.oTable._oTable.getSelectionBehavior(), "RowSelector", "Selection Behavior RowSelector");
		await nextUIUpdate();

		oSelectionChange.resetHistory();
		await selectRow(this.oTable._oTable.getRows()[0], true);
		assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		await selectRow(this.oTable._oTable.getRows()[1], true);
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		await selectRow(this.oTable._oTable.getRows()[2], true);
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		oSelectionChange.resetHistory();
		this.oTable.clearSelection();
		assert.equal(this.oTable.getSelectedContexts().length, 0, "No rows selected");
		assert.equal(oSelectionChange.callCount, 1, "Selection change event");

		// Simulate enable notification scenario via selection over limit
		oSelectionChange.resetHistory();
		this.oTable.setSelectionMode("Multi");
		this.oTable.getType().setSelectionLimit(3);
		assert.ok(oSelectionPlugin.getEnableNotification(), true);

		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", () => {
				assert.equal(this.oTable.getSelectedContexts().length, 3, "Rows selected");
				assert.equal(oSelectionChange.callCount, 1, "Selection change event");
				resolve();
			});
			// select all existing rows
			oSelectionPlugin.setSelectionInterval(0, 4);
		});
	});

	QUnit.test("Selection - ResponsiveTable", function(assert) {
		function checkSelectionMethods(oTable) {
			const fInnerTablegetSelectedContextsSpy = sinon.spy(oTable._oTable, "getSelectedContexts");
			const fInnerTableclearSelectionSpy = sinon.spy(oTable._oTable, "removeSelections");

			assert.ok(fInnerTablegetSelectedContextsSpy.notCalled);
			oTable.getSelectedContexts();
			assert.ok(fInnerTablegetSelectedContextsSpy.calledOnce);
			assert.ok(fInnerTableclearSelectionSpy.notCalled);
			oTable.clearSelection();
			assert.ok(fInnerTableclearSelectionSpy.calledOnce);

			fInnerTablegetSelectedContextsSpy.restore();
			fInnerTableclearSelectionSpy.restore();
		}

		function selectItem(oItem, bUser) {
			if (bUser) {
				oItem.setSelected(true);
				oItem.informList("Select", true);
				return;
			}
			oItem.getParent().setSelectedItem(oItem, true);
		}

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: TableType.ResponsiveTable,
			models: new JSONModel({
				testPath: Array(40).fill({})
			}),
			columns: new Column({
				header: "test",
				template: new Text()
			})
		});

		return TableQUnitUtils.waitForBinding(this.oTable).then(async function() {
			assert.equal(this.oTable._oTable.getItems().length, 20, "Items available");

			let iSelectionCount = -1;
			this.oTable.attachSelectionChange(function() {
				iSelectionCount = this.oTable.getSelectedContexts().length;
			}.bind(this));

			assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "None", "Selection Mode None - Inner Table");

			this.oTable.setSelectionMode("Multi");
			assert.equal(this.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "MultiSelect", "Selection Mode Multi - Inner Table");
			await nextUIUpdate();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 2, "Selection change event");
			selectItem(this.oTable._oTable.getItems()[2], true);
			assert.equal(iSelectionCount, 3, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			this.oTable.setSelectionMode("Single");
			assert.equal(this.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "SingleSelectLeft", "Selection Mode Single - Inner Table");
			await nextUIUpdate();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 1, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			this.oTable.setSelectionMode("SingleMaster");
			assert.equal(this.oTable.getSelectionMode(), "SingleMaster", "Selection Mode SingleMaster - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "SingleSelectMaster", "Selection Mode SingleSelectMaster - Inner Table");
			await nextUIUpdate();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 1, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			return new Promise(function(resolve) {
				let bRowPressFired = false;
				this.oTable.attachRowPress(function() {
					bRowPressFired = true;
				});

				this.oTable._oTable.attachItemPress(function() {
					assert.ok(!bRowPressFired, "rowPress event not fired");
					return resolve();
				});

				this.oTable._oTable.getItems()[1].setType("Active");
				jQuery(this.oTable._oTable.getItems()[1]).trigger("tap");
			}.bind(this)).then(function() {
				return new Promise(function(resolve) {
					// Simulate message scenario via SelectAll
					sap.ui.require([
						"sap/m/MessageToast"
					], function(MessageToast) {
						const fMessageSpy = sinon.stub(MessageToast, "show");
						assert.ok(fMessageSpy.notCalled);

						this.oTable.setSelectionMode("Multi");
						this.oTable._oTable.selectAll(true);

						assert.equal(iSelectionCount, 20, "Selection change event");
						assert.equal(this.oTable.getSelectedContexts().length, 20, "Items selected");
						// message is shown delayed due to a require
						fMessageSpy.callsFake(function() {
							assert.ok(fMessageSpy.calledOnce);
							fMessageSpy.restore();
						});
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Multiple Tables with different type - Columns added simultaneously to inner tables", function(assert) {
		const oTable2 = new Table({
			type: TableType.ResponsiveTable
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		oTable2.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		oTable2.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		return Promise.all([
			this.oTable.initialized(), oTable2.initialized()
		]).then(function() {
			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			oTable2.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			let aMDCColumns = this.oTable.getColumns();
			let aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[1].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[2].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3", "column1: label is correct");
			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test2", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false,
				"column1: creationTemplate renderWhitespace is disabled");

			aMDCColumns = oTable2.getColumns();
			aInnerColumns = oTable2._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2", "column0: label is correct");
			assert.equal(getInnerColumnLabel(aInnerColumns[0]).getWrapping(), false);
			assert.equal(getInnerColumnLabel(aInnerColumns[0]).getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[1].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test", "column1: label is correct");
			assert.equal(getInnerColumnLabel(aInnerColumns[1]).getWrapping(), false);
			assert.equal(getInnerColumnLabel(aInnerColumns[1]).getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[2].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3", "column1: label is correct");
			assert.equal(getInnerColumnLabel(aInnerColumns[2]).getWrapping(), false);
			assert.equal(getInnerColumnLabel(aInnerColumns[2]).getWrappingType(), "Hyphenated");
		}.bind(this));
	});

	QUnit.test("RowPress event test", async function(assert) {
		function checkRowPress(bIsMTable, oTable, oRow, bExpected) {
			const fRowPressSpy = sinon.spy(oTable, "fireRowPress");
			bExpected = bExpected ?? true;

			if (bIsMTable) {
				oTable._oTable.fireItemPress({
					listItem: oRow
				});
			} else {
				oTable._oTable.fireCellClick({
					rowBindingContext: oRow.getBindingContext()
				});
			}

			assert.equal(fRowPressSpy.calledOnce, bExpected);
			fRowPressSpy.restore();
		}

		function checkRowActionPress(oTable, oRow) {
			const oRowAction = oTable._oTable.getRowActionTemplate();
			if (!oRowAction) {
				return false;
			}
			const oRowActionItem = oRowAction.getItems()[0];
			if (!oRowActionItem) {
				return false;
			}

			const fRowPressSpy = sinon.spy(oRowActionItem, "firePress");

			oRowActionItem.firePress({
				item: oRowActionItem,
				row: oRow
			});
			assert.ok(fRowPressSpy.calledOnce);

			fRowPressSpy.restore();
			return true;
		}

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});
		this.oTable.setType(TableType.ResponsiveTable);
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		this.oTable.setModel(new JSONModel({
			testPath: [
				{visible: false}, {visible: true}, {visible: false}, {visible: false}, {visible: false}
			]
		}));

		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oTable = this.oTable;
		const fnEvent = function() {};

		return this.oTable.initialized().then(function() {
			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		}).then(async function() {
			// RowPress Event
			oTable.attachRowPress(fnEvent);
			checkRowPress(true, oTable, oTable._oTable.getItems()[0], true);
			oTable.detachRowPress(fnEvent);

			// RowAction -> visible with property
			let oRowSettings = new RowSettings();
			oRowSettings.addRowAction(new RowActionItem({
				type: "Navigation",
				visible: true,
				press: fnEvent
			}));
			oTable.setRowSettings(oRowSettings);

			await nextUIUpdate();

			// row action triggers same rowPress event
			checkRowPress(true, oTable, oTable._oTable.getItems()[0], true);
			checkRowPress(true, oTable, oTable._oTable.getItems()[1], true);

			// RowAction -> not visible with property
			oRowSettings = new RowSettings();
			oRowSettings.addRowAction(new RowActionItem({
				type: "Navigation",
				visible: false,
				press: fnEvent
			}));
			oTable.setRowSettings(oRowSettings);

			await nextUIUpdate();

			checkRowPress(true, oTable, oTable._oTable.getItems()[0], false);

			// Row Action not visible BUT rowPress event attached
			oTable.attachRowPress(fnEvent);
			checkRowPress(true, oTable, oTable._oTable.getItems()[0], true);
			oTable.detachRowPress(fnEvent);

			// RowAction -> visible with bound property
			oRowSettings = new RowSettings();
			oRowSettings.addRowAction(new RowActionItem({
				type: "Navigation",
				visible: "{visible}",
				press: fnEvent
			}));
			oTable.setRowSettings(oRowSettings);

			await nextUIUpdate();

			assert.equal(oTable._oTable.getItems()[0].getType(), "Inactive");
			checkRowPress(true, oTable, oTable._oTable.getItems()[1], true);

			oTable.setRowSettings();
			await nextUIUpdate();

			oTable.setType(TableType.Table);
			return oTable.initialized();
		}).then(function() {
			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			oTable.attachRowPress(fnEvent);
			checkRowPress(false, oTable, oTable._oTable.getRows()[0]);
			// no row action present
			assert.ok(!checkRowActionPress(oTable));

			const oRowSettings = new RowSettings();
			oRowSettings.addRowAction(new RowActionItem({
				type: "Navigation",
				text: "Navigation",
				visible: true
			}));
			oTable.setRowSettings(oRowSettings);

			// row action triggers same rowPress event
			assert.ok(checkRowActionPress(oTable, oTable._oTable.getRows()[1]));

			// remove row press event. event should not be fired anymore
			oTable.detachRowPress(fnEvent);
			checkRowPress(false, oTable, oTable._oTable.getRows()[0], false);
		});
	});

	QUnit.test("Table with FilterBar", function(assert) {
		const oTable = this.oTable;
		let fBindRowsStub;

		this.oTable.setAutoBindOnInit(false);

		return this.oTable._fullyInitialized().then(function() {
			// simulate table is bound already
			const fStub = sinon.stub(oTable._oTable, "isBound");
			const oFilter = new FilterBar();

			fBindRowsStub = sinon.stub(oTable._oTable, "bindRows");
			fStub.withArgs("rows").returns(true);
			oTable.setFilter(oFilter);

			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.notCalled);

			// simulate filtersChanged event
			oFilter.fireFiltersChanged();

			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.notCalled);

			// simulate filtersChanged event
			oFilter.fireFiltersChanged({conditionsBased: false});

			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.notCalled);

			// simulate filtersChanged event
			oFilter.fireFiltersChanged({conditionsBased: true});

			assert.strictEqual(oTable._oTable.getShowOverlay(), true);
			assert.ok(fBindRowsStub.notCalled);

			// simulate search event
			oFilter.fireSearch();
		}).then(function() {
			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.calledOnce);

			// Test with empty
			oTable.setFilter();
			assert.ok(!oTable.getFilter());

			// Test with invalid control
			assert.throws(function() {
				oTable.setFilter(new Control());
			}, function(oError) {
				return oError instanceof Error && oError.message.indexOf("sap.ui.mdc.IFilter") > 0;
			});
			assert.ok(!oTable.getFilter());
		});
	});

	QUnit.test("noDataText - Table with FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);

		return this.oTable.initialized().then(function() {
			this.oTable.setFilter(new FilterBar());
			return wait(0);
		}.bind(this)).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA_WITH_FILTERBAR"),
				"'To start, set the relevant filters.' is displayed");
		}.bind(this));
	});

	QUnit.test("noData aggregation - Table with FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);
		this.oTable.setNoData(new IllustratedMessage());

		return this.oTable.initialized().then(function() {
			this.oTable.setFilter(new FilterBar());
			return wait(0);
		}.bind(this)).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA_WITH_FILTERBAR"),
				"'To start, set the relevant filters.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.BeforeSearch);
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);

		return this.oTable.initialized().then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table without FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);
		this.oTable.setNoData(new IllustratedMessage());

		return this.oTable.initialized().then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.NoEntries);
		}.bind(this));
	});

	QUnit.test("noDataText - Table with FilterBar without any filters and the table is bound", function(assert) {
		this.oTable.setFilter(new FilterBar());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with FilterBar without any filters and the table is bound", function(assert) {
		this.oTable.setNoData(new IllustratedMessage());
		this.oTable.setFilter(new FilterBar());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.NoEntries);
		}.bind(this));
	});

	QUnit.test("noDataText - Table with FilterBar with filters and the table is bound", function(assert) {
		const oFilterBar = new FilterBar("FB1");

		sinon.stub(oFilterBar, "getConditions").returns({key: [{operator: OperatorName.EQ, values: ["Pr"]}]});
		this.oTable.setFilter(oFilterBar);

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_RESULTS"),
				"'No data available. Try adjusting the filter settings.' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with FilterBar with filters and the table is bound", function(assert) {
		const oFilterBar = new FilterBar("FB2");

		sinon.stub(oFilterBar, "getConditions").returns({key: [{operator: OperatorName.EQ, values: ["Pr"]}]});
		this.oTable.setFilter(oFilterBar);
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_RESULTS_TITLE"),
				"'No data available.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getDescription(), oRb.getText("table.NO_RESULTS_DESCRIPTION"),
				"'Try adjusting the filter settings.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.NoFilterResults);
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar but with internal filters and the table is bound", function(assert) {
		this.oTable.setFilterConditions({key: [{operator: OperatorName.EQ, values: ["Pr"]}]});

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available'");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table without FilterBar but with internal filters and the table is bound", function(assert) {
		this.oTable.setNoData(new IllustratedMessage());
		this.oTable.setFilterConditions({key: [{operator: OperatorName.EQ, values: ["Pr"]}]});

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"), "'No data available'");
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar and internal filters and the table is bound", function(assert) {
		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table without FilterBar and internal filters and the table is bound", function(assert) {
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataText - Table with custom external filter control without filters, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with custom external filter control without filters, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl());
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataText - Table with custom external filter control with search string, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl({customSearch: "found something?"}));

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_RESULTS"),
				"'No data available. Try adjusting the filter settings.' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with custom external filter control with search string, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl({customSearch: "found something?"}));
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_RESULTS_TITLE"),
				"'No data available.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getDescription(), oRb.getText("table.NO_RESULTS_DESCRIPTION"),
				"'Try adjusting the filter settings.' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation CustomText - Table with custom external filter control with search string, the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl({customSearch: "found something?"}));
		this.oTable.setNoData(new IllustratedMessage({title: "NoData Title", description: "NoData Description"}));

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), "NoData Title");
			assert.strictEqual(this.oTable._oTable.getNoData().getDescription(), "NoData Description");
		}.bind(this));
	});

	QUnit.test("Table with VariantManagement and QuickFilter", function(assert) {
		const done = assert.async();

		this.oTable.initialized().then(function() {
			sap.ui.require([
				"sap/m/SegmentedButton", "sap/ui/core/Control"
			], function(SegmentedButton, Control) {
				// Test with VariantManagement
				const oVariant = new VariantManagement();
					const oVariant2 = new VariantManagement();
					const oQuickFilter = new SegmentedButton();
					const oQuickFilter2 = new SegmentedButton();

				// Test Variant exists on toolbar
				this.oTable.setVariant(oVariant);
				assert.strictEqual(this.oTable.getVariant(), oVariant);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test with setting same Variant on toolbar
				this.oTable.setVariant(oVariant);
				assert.strictEqual(this.oTable.getVariant(), oVariant);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test Variant has been changed on toolbar
				this.oTable.setVariant(oVariant2);
				assert.strictEqual(this.oTable.getVariant(), oVariant2);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant2]);

				// Test with empty Variant
				this.oTable.setVariant(oVariant2);
				this.oTable.setVariant();
				assert.ok(!this.oTable.getVariant());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with VariantManagement and QuickFilter
				this.oTable.setVariant(oVariant);
				this.oTable.setQuickFilter(oQuickFilter);
				assert.strictEqual(this.oTable.getQuickFilter(), oQuickFilter);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant, oQuickFilter]);

				// Test with only QuickFilter
				this.oTable.setVariant();
				assert.ok(!this.oTable.getVariant());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oQuickFilter]);

				// Test with empty
				this.oTable.setQuickFilter();
				assert.ok(!this.oTable.getQuickFilter());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with different QuickFilters
				this.oTable.setVariant(oVariant);
				this.oTable.setQuickFilter(oQuickFilter);
				this.oTable.setQuickFilter(oQuickFilter2);
				assert.strictEqual(this.oTable.getQuickFilter(), oQuickFilter2);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant, oQuickFilter2]);

				// Test destroying QuickFilter
				this.oTable.setQuickFilter(oQuickFilter);
				this.oTable.destroyQuickFilter();
				assert.ok(!this.oTable.getQuickFilter());
				assert.ok(oQuickFilter.bIsDestroyed);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test destroying Variant
				this.oTable.destroyVariant();
				assert.ok(!this.oTable.getVariant());
				assert.ok(oVariant.bIsDestroyed);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with invalid control for Variant
				assert.throws(function() {
					this.oTable.setVariant(new Control());
				}.bind(this), function(oError) {
					return oError instanceof Error && oError.message.indexOf("variant") > 0;
				});
				assert.ok(!this.oTable.getVariant());

				// Cleanup
				oVariant2.destroy();
				oQuickFilter2.destroy();

				// Finish
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Table with VariantManagement - Title Settings", async function(assert) {
		this.oTable.setHeader("Test Header");
		this.oTable.setHeaderLevel("H6");
		this.oTable.setHeaderStyle("H3");

		const oVariantManagement = new VariantManagement();
		this.oTable.setVariant(oVariantManagement);

		await this.oTable.initialized();

		assert.equal(this.oTable._oTitle.getTitleStyle(), "H3", "Title style is set to 'H3'");
		assert.equal(this.oTable._oTitle.getLevel(), "H6", "Title level is set to 'H6'");
		assert.ok(oVariantManagement.getShowAsText(), "VariantManagement is shown as text");
		assert.equal(this.oTable._oTable.getAriaLabelledBy()[0], this.oTable._oTitle.getId(), "Table is labelled by title");

		this.oTable.setHeaderVisible(false);
		assert.equal(oVariantManagement.getTitleStyle(), "H3", "VariantManagement title is set to 'H3'");
		assert.equal(oVariantManagement.getHeaderLevel(), "H6", "VariantManagement title is set to 'H6'");
		assert.notOk(oVariantManagement.getShowAsText(), "VariantManagement is not shown as text");

		this.oTable.setHeaderLevel("Auto");
		this.oTable.setHeaderStyle("H2");
		assert.equal(oVariantManagement.getHeaderLevel(), "Auto", "VariantManagement title level is set to 'Auto'");
		assert.equal(oVariantManagement.getTitleStyle(), "H2", "VariantManagement title style is set to 'H2'");
	});

	QUnit.test("Table busy state", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.notOk(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is false");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state is false");

			this.oTable.setBusy(true);
			assert.ok(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is true");
			assert.ok(this.oTable._oTable.getBusy(), "Inner table busy state is true");

			this.oTable._oTable.setBusy(false);
			assert.ok(this.oTable.getBusy(), "sap.ui.mdc.Table busy state remains true");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state changed independently");

			this.oTable.setBusy(false);
			assert.notOk(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is false");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state is false");

			assert.strictEqual(this.oTable.getBusyIndicatorDelay(), 100, "sap.ui.mdc.Table - Default Busy Indicator Delay");
			assert.strictEqual(this.oTable._oTable.getBusyIndicatorDelay(), 100, "Inner table - Default Busy Indicator Delay");
			this.oTable.setBusyIndicatorDelay(200);
			assert.strictEqual(this.oTable.getBusyIndicatorDelay(), 200, "sap.ui.mdc.Table - Custom Busy Indicator Delay");
			assert.strictEqual(this.oTable._oTable.getBusyIndicatorDelay(), 200, "Inner table - Custom Busy Indicator Delay");
		}.bind(this));
	});

	QUnit.test("copyProvider", function(assert) {
		const oClipboardStub = sinon.stub(window, "navigator").value({clipboard: {}});
		const oSecureContextStub = sinon.stub(window, "isSecureContext").value(true);
		this.oTable.setCopyProvider(new CopyProvider());

		return this.oTable._fullyInitialized().then(function() {
			assert.equal(this.oTable.getCopyProviderPluginOwner(), this.oTable._oTable, "The inner table is set as plugin owner for CopyProvider");

			const oColumn = new Column();
			const fnGetColumnClipboardSettingsSpy = sinon.spy(this.oTable.getPropertyHelper(), "getColumnClipboardSettings");
			this.oTable.getColumnClipboardSettings(oColumn);
			assert.ok(fnGetColumnClipboardSettingsSpy.calledWith(oColumn),
				"Table#getColumnClipboardSettings uses PropertyHelper#getColumnClipboardSettings");
			fnGetColumnClipboardSettingsSpy.restore();

			const oCopyButton = Element.getElementById(this.oTable.getId() + "-copy");
			assert.ok(oCopyButton, "Copy button is created");
			assert.equal(this.oTable._oToolbar.indexOfEnd(oCopyButton), 0,
				"Copy button is added to the toolbar, as a first element of the end aggreagtion");

			oClipboardStub.restore();
			oSecureContextStub.restore();
		}.bind(this));
	});

	QUnit.test("copyProvider in unsecure context", function(assert) {
		const oClipboardStub = sinon.stub(window, "navigator").value({clipboard: undefined});
		const oSecureContextStub = sinon.stub(window, "isSecureContext").value(false);
		const oCopyProvider = new CopyProvider();
		this.oTable.setCopyProvider(oCopyProvider);

		return this.oTable._fullyInitialized().then(function() {
			assert.strictEqual(this.oTable.getCopyProvider(), oCopyProvider, "CopyProvider aggregation is set");
			assert.notOk(Element.getElementById(this.oTable.getId() + "-copy"), "Copy button is not created");

			oClipboardStub.restore();
			oSecureContextStub.restore();
		}.bind(this));
	});

	QUnit.test("CellSelector - Table fully initialized", function(assert) {
		const oCellSelector = new CellSelector();
		this.oTable.addDependent(oCellSelector);

		return this.oTable._fullyInitialized().then(() => {
			assert.equal(this.oTable.getCellSelectorPluginOwner(), this.oTable._oTable,
				"The inner table is set as plugin owner for the CellSelector");
			assert.ok(oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
			assert.ok(oCellSelector.isActive(), "CellSelector is active");
			assert.ok(oCellSelector.getConfig("isSupported", this.oTable._oTable, oCellSelector), "CellSelector is supported for grid table");

			this.oTable.removeDependent(oCellSelector);
			this.oTable.setType(TableType.ResponsiveTable);
			this.oTable.addDependent(oCellSelector);

			return this.oTable._fullyInitialized().then(() => {
				assert.equal(this.oTable.getCellSelectorPluginOwner(), this.oTable._oTable,
					"The inner table is set as plugin owner for the CellSelector");
				assert.ok(oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
				assert.ok(oCellSelector.isActive(), "CellSelector is active");
				assert.ok(oCellSelector.getConfig("isSupported", this.oTable._oTable, oCellSelector),
					"CellSelector is supported for responsive table");

				this.oTable.removeDependent(oCellSelector);
			});
		});
	});

	QUnit.test("CellSelector - owner returns promise", function(assert) {
		const oCellSelector = new CellSelector();
		this.oTable.addDependent(oCellSelector);

		return this.oTable.getCellSelectorPluginOwner().then((oTable) => {
			assert.equal(oTable, this.oTable, "Correct table instance returned from promise");
			assert.equal(oTable.getCellSelectorPluginOwner(), this.oTable._oTable, "The inner table is set as plugin owner for the CellSelector");
			assert.ok(oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
			assert.ok(oCellSelector.isActive(), "CellSelector is active");
			assert.ok(oCellSelector.getConfig("isSupported", this.oTable._oTable, oCellSelector), "CellSelector is supported for grid table");

			oTable.removeDependent(oCellSelector);
			oTable.setType(TableType.ResponsiveTable);
			oTable.addDependent(oCellSelector);

			return oTable.getCellSelectorPluginOwner().then((oTable) => {
				assert.equal(oTable.getCellSelectorPluginOwner(), this.oTable._oTable, "The inner table is set as plugin owner for the CellSelector");
				assert.ok(oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
				assert.ok(oCellSelector.isActive(), "CellSelector is active");
				assert.ok(oCellSelector.getConfig("isSupported", this.oTable._oTable, oCellSelector),
					"CellSelector is supported for responsive table");

				this.oTable.removeDependent(oCellSelector);
			});
		});
	});

	QUnit.test("CellSelector - rowPress event", async function(assert) {
		const oCellSelector = new CellSelector();

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: new GridTableType(),
			models: new JSONModel({
				testPath: [
					{}, {}, {}, {}, {}
				]
			}),
			columns: new Column({
				header: "test",
				template: new Text()
			}),
			dependents: oCellSelector
		});
		this.oTable.placeAt("qunit-fixture");

		await this.oTable.initialized();
		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
		});

		assert.equal(this.oTable.getCellSelectorPluginOwner(), this.oTable._oTable, "The inner table is set as plugin owner for the CellSelector");
		assert.notOk(this.oTable.hasListeners("rowPress"), "Table has no rowPress listener");
		assert.ok(oCellSelector.getEnabled(), "CellSelector Plugin is enabled");
		assert.ok(oCellSelector.isActive(), "CellSelector is active");

		oCellSelector._bSelecting = true;
		const oCell = this.oTable._oTable.getRows()[0].getCells()[0].$().parents("td")[0];

		const oRemoveSelectionStub = sinon.spy(oCellSelector, "removeSelection");
		QUtils.triggerKeydown(oCell, KeyCodes.A, true, false, true);
		assert.ok(oRemoveSelectionStub.calledOnce, "Cells are removed.");
		assert.deepEqual(oCellSelector.getSelectionRange(), null);

		this.oTable.attachRowPress(function() {});

		assert.ok(this.oTable.hasListeners("rowPress"), "Table has rowPress listener");
		assert.ok(oCellSelector.isActive(), "CellSelector is active");

		QUtils.triggerKeydown(oCell, KeyCodes.A, true, false, true);
		assert.ok(oRemoveSelectionStub.calledOnce, "removeSelection is not called again");
		assert.deepEqual(oCellSelector.getSelectionRange(), null);

		this.oTable.removeDependent(oCellSelector);
		oRemoveSelectionStub.reset();
	});

	QUnit.test("showPasteButton", async function(assert) {
		assert.notOk(this.oTable.getShowPasteButton(), "default value of showPasteButton=false");

		this.oTable.setShowPasteButton(true);
		assert.ok(this.oTable.getShowPasteButton(), "showPasteButton=true");

		await this.oTable.initialized();
		assert.ok(this.oTable._oPasteButton, "Paste button created");
		assert.equal(FESRHelper.getSemanticStepname(this.oTable._oPasteButton, "press"), "mdc:tbl:paste", "Correct FESR StepName");

		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.ok(this.oTable._oPasteButton.getDomRef(), "Paste button is visible");
		await wait(100);
		assert.ok(this.oTable._oPasteButton.getDependents()[0].isA("sap.m.plugins.PasteProvider"),
			"PasteProvider plugin is added to the paste button");
		assert.equal(this.oTable._oPasteButton.getDependents()[0].getPasteFor(), this.oTable.getId() + "-innerTable",
			"PasteProvider plugin 'pasteFor'");

		this.oTable.setShowPasteButton();
		assert.notOk(this.oTable._oPasteButton.getVisible(), "Paste button is not visible");

		this.oTable.setShowPasteButton(true);
		assert.ok(this.oTable._oPasteButton.getVisible(), "Paste button is now visible");
});

	QUnit.test("enablePaste with ShowPasteButton set to true", function(assert) {
		this.oTable.setShowPasteButton(true);
		const fPasteHandler = function(oEvent) {
			assert.ok(this.getEnablePaste(), "Paste event fired");
		};

		this.oTable.attachPaste(fPasteHandler);

		assert.ok(this.oTable.getEnablePaste(), "default value of enablePaste=true");
		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oPasteButton.getVisible(), "pasteButton is visible");
			this.oTable._oTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
			this.oTable.setEnablePaste(false);
			assert.notOk(this.oTable.getEnablePaste(), "enablePaste=false");
			assert.notOk(this.oTable._oPasteButton.getEnabled(), "Paste button disabled");
			this.oTable._oTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});

			this.oTable.setEnablePaste(true);
			assert.ok(this.oTable.getEnablePaste(), "enablePaste=true");
			assert.ok(this.oTable._oPasteButton.getEnabled(), "pasteButton enabled");
		}.bind(this));
	});

	QUnit.test("enablePaste with ShowPasteButton set to false", function(assert) {
		this.oTable.setShowPasteButton(false);
		assert.ok(this.oTable.getEnablePaste(), "default value of enablePaste=true");
		return this.oTable.initialized().then(function() {

			this.oTable.setEnablePaste(false);
			assert.notOk(this.oTable.getEnablePaste(), "enablePaste=false");
			assert.notOk(this.oTable._oPasteButton, "Paste button not created");

			this.oTable.setShowPasteButton(true);
			assert.notOk(this.oTable.getEnablePaste(), "enablePaste=false");
			assert.notOk(this.oTable._oPasteButton.getEnabled(), "Paste button disabled");

			this.oTable.setEnablePaste(true);
			assert.ok(this.oTable.getEnablePaste(), "enablePaste=true");
			assert.ok(this.oTable._oPasteButton.getEnabled(), "Paste button enabled");
		}.bind(this));
	});

	QUnit.test("Open the p13n dialog via button and shortcut", async function(assert) {
		this.oTable.setP13nMode(["Column", "Sort"]);
		this.oTable.placeAt("qunit-fixture");
		await this.oTable.initialized();
		await nextUIUpdate();

		const oOpenSettingsDialogStub = sinon.stub(PersonalizationUtils, "openSettingsDialog");

		this.oTable._oP13nButton.firePress();
		assert.ok(oOpenSettingsDialogStub.calledOnceWithExactly(this.oTable), "utils.Personalization.openSettingsDialog called");
		oOpenSettingsDialogStub.reset();

		QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.COMMA, false, false, true);
		assert.ok(oOpenSettingsDialogStub.calledOnceWithExactly(this.oTable), "utils.Personalization.openSettingsDialog called");
		oOpenSettingsDialogStub.reset();

		this.oTable._setShowP13nButton(false);
		await nextUIUpdate();

		QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.COMMA, false, false, true);
		assert.ok(oOpenSettingsDialogStub.notCalled, "utils.Personalization.openSettingsDialog not called");
		oOpenSettingsDialogStub.reset();

		this.oTable.setP13nMode([]);
		this.oTable._setShowP13nButton(true);
		await nextUIUpdate();

		QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.COMMA, false, false, true);
		assert.ok(oOpenSettingsDialogStub.notCalled, "utils.Personalization.openSettingsDialog not called");

		oOpenSettingsDialogStub.restore();
	});

	QUnit.test("Focus Function", async function(assert) {
		const oButton = new Button();
		const oFocusInfo = {
					targetInfo: new Message({
						message: "Error thrown",
						type: "Error"
					})
		};

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));
		this.oTable.addAction(new ActionToolbarAction({
			action: oButton
		}));

		this.oTable.placeAt("qunit-fixture");
		await this.oTable.initialized();
		await nextUIUpdate();

		const fnFocusSpy = sinon.spy(this.oTable._oTable, "focus");

		oButton.focus();
		assert.ok(oButton.getFocusDomRef() === document.activeElement, "Correct DOM element focused");

		this.oTable.focus();
		assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
		assert.ok(this.oTable._oTable.getFocusDomRef() === document.activeElement, "Correct DOM element focused");

		this.oTable.focus(oFocusInfo);
		assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
		assert.ok(this.oTable._oTable.getFocusDomRef() === document.activeElement, "Correct DOM element focused");
	});

	QUnit.test("test scrollToIndex", function(assert) {
		let oScrollStub;
		const oTable = this.oTable;

		function testScroll(iIndex) {
			return oTable.scrollToIndex(iIndex).then(function() {
				if (oTable._isOfType(TableType.Table, true) && iIndex === -1) {
					iIndex = 0;
				}

				assert.ok(oScrollStub.calledOnceWithExactly(iIndex), "Call to " + oScrollStub.propName + " with index " + iIndex);
				oScrollStub.resetHistory();
			});
		}

		return oTable.initialized().then(function() {
			oScrollStub = sinon.stub(oTable._oTable, "_setFirstVisibleRowIndex");
		}).then(function() {
			return testScroll(0);
		}).then(function() {
			return testScroll(5);
		}).then(function() {
			return testScroll(-1);
		}).then(function() {
			return testScroll(10000);
		}).then(function() {
			oTable.setType(TableType.ResponsiveTable);
			return oTable.initialized();
		}).then(function() {
			oScrollStub = sinon.stub(oTable._oTable, "scrollToIndex");
			oScrollStub.resolves();
		}).then(function() {
			return testScroll(0);
		}).then(function() {
			return testScroll(5);
		}).then(function() {
			return testScroll(-1);
		}).then(function() {
			return testScroll(10000);
		});
	});

	QUnit.test("test focusRow", function(assert) {
		const done = assert.async(); const
oTable = this.oTable;
		let oScrollStub; let oFocusStub; let
n = 0;

		function testFocusRow(iIndex, bFirstInteractiveElement) {
			return new Promise(function(resolve) {
				oTable.focusRow(iIndex, bFirstInteractiveElement).then(function() {
					n++;
					assert.ok(oFocusStub.called, oFocusStub.propName + " was called");
					assert.equal(oFocusStub.callCount, n, oFocusStub.propName + " was called only once");
					assert.ok(oFocusStub.calledWith(iIndex, bFirstInteractiveElement),
						oFocusStub.propName + " was called with the correct parameter");
					resolve();
				});
			});
		}

		oTable.initialized().then(function() {
			oFocusStub = sinon.stub(oTable._oTable, "_setFocus");
			oFocusStub.resolves();

			return new Promise(function(resolve) {
				resolve();
			}).then(function() {
				return testFocusRow(0, true);
			}).then(function() {
				return testFocusRow(5, true);
			}).then(function() {
				return testFocusRow(-1, false);
			}).then(function() {
				return testFocusRow(10000, false);
			}).then(function() {
				oFocusStub.restore();
				return Promise.resolve();
			});
		}).then(function() {
			oTable.setType(TableType.ResponsiveTable).initialized().then(function() {
				oFocusStub = sinon.stub(oTable._oTable, "_setFocus");
				oFocusStub.resolves();
				oScrollStub = sinon.stub(oTable._oTable, "scrollToIndex");
				oScrollStub.resolves();
				n = 0;

				return new Promise(function(resolve) {
					resolve();
				}).then(function() {
					return testFocusRow(0, false);
				}).then(function() {
					return testFocusRow(5, false);
				}).then(function() {
					return testFocusRow(-1, true);
				}).then(function() {
					return testFocusRow(10000, true);
				}).then(function() {
					oFocusStub.restore();
					oScrollStub.restore();
					done();
				});
			});
		});
	});

	QUnit.test("Paste with a grid table", function(assert) {
		const done = assert.async();

		const fPasteHandler = function(oEvent) {
			const aData = oEvent.getParameter("data");
			assert.ok(Array.isArray(aData));
			assert.ok(aData.length === 2);

			assert.ok(Array.isArray(aData[0]));
			assert.ok(aData[0].length === 3);
			assert.ok(aData[0][0] === "111");
			assert.ok(aData[0][1] === "222");
			assert.ok(aData[0][2] === "333");

			assert.ok(Array.isArray(aData[1]));
			assert.ok(aData[1].length === 3);
			assert.ok(aData[1][0] === "aaa");
			assert.ok(aData[1][1] === "bbb");
			assert.ok(aData[1][2] === "ccc");

			done();
		};

		this.oTable.attachPaste(fPasteHandler);
		this.oTable.initialized().then(function() {
			const oInnerTable = this.oTable._oTable;
			oInnerTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
		}.bind(this));
	});

	QUnit.test("Paste with a responsive table", async function(assert) {
		const done = assert.async();

		this.oTable.destroy();
		this.oTable = new Table({
			type: TableType.ResponsiveTable
		});
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const fPasteHandler = function(oEvent) {
			const aData = oEvent.getParameter("data");
			assert.ok(Array.isArray(aData));
			assert.ok(aData.length === 2);

			assert.ok(Array.isArray(aData[0]));
			assert.ok(aData[0].length === 3);
			assert.ok(aData[0][0] === "111");
			assert.ok(aData[0][1] === "222");
			assert.ok(aData[0][2] === "333");

			assert.ok(Array.isArray(aData[1]));
			assert.ok(aData[1].length === 3);
			assert.ok(aData[1][0] === "aaa");
			assert.ok(aData[1][1] === "bbb");
			assert.ok(aData[1][2] === "ccc");

			done();
		};

		this.oTable.attachPaste(fPasteHandler);
		this.oTable.initialized().then(function() {
			const oInnerTable = this.oTable._oTable;
			oInnerTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
		}.bind(this));
	});

	QUnit.test("ResponsiveTableType should have 'Inactive' row template when no rowPress event is attached", function(assert) {
		const done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			type: TableType.ResponsiveTable
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oRowTemplate.getType(), "Inactive", "row template is Inactive since no rowPress event is attached");
			done();
		}.bind(this));
	});

	QUnit.test("ResponsiveTableType should have 'Active' row template type when rowPress event is attached", function(assert) {
		const done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			type: TableType.ResponsiveTable,
			rowPress: function() {
				return true;
			}
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oRowTemplate.getType(), "Active", "row template type is Active since rowPress event is attached");
			done();
		}.bind(this));
	});

	QUnit.test("Destroy immediately after create - destroys toolbar", function(assert) {
		// Destroy the old/default table, as this is not used for this test
		this.oTable.destroy();

		//Create a table (say grid table) and destroy it immediately
		const oTable = new Table();

		oTable.getActions(); //Leads to immediate creation of toolbar
		const oToolbar = oTable._oToolbar;
		oTable.destroy();

		assert.ok(!oTable._oTable);
		assert.ok(!oTable._oRowTemplate);
		assert.ok(!oTable._oToolbar);
		// Toolbar is destroyed
		assert.strictEqual(oToolbar.bIsDestroyed, true);
	});

	QUnit.test("No new toolbar created when the table is destroyed", function(assert) {
		const oText = new Text({
			text: "Sample Text"
		});

		this.oTable.addAction(oText);
		this.oTable.destroy();
		this.oTable.getActions();

		assert.notOk(this.oTable._oToolbar, "Toolbar not created by the getter of the action aggregation");
	});

	QUnit.test("Toolbar is hidden when the table's property hideToolbar is true", function(assert) {

		return this.oTable.initialized().then(() => {
			assert.ok(this.oTable._oToolbar.getVisible(), "Toolbar is visible.");
			assert.notOk(this.oTable.getHideToolbar(), "Property hideToolbar is false.");
			assert.notOk(this.oTable._oTable.getAriaLabelledBy().includes(this.oTable.getId() + "-invisibleTitle"),
				"Header is not referenced by ariaLabelledBy.");
			assert.ok(this.oTable._oToolbar.getVisible(), "Toolbar is visible.");

			this.oTable.setHideToolbar(true);
			this.oTable.setHeaderVisible(false);
			assert.ok(this.oTable.getHideToolbar(), "Property hideToolbar is true.");
			assert.notOk(this.oTable.getHeaderVisible(), "Property headerVisible is false.");
			assert.ok(this.oTable._oTable.getAriaLabelledBy().includes(this.oTable.getId() + "-invisibleTitle"),
				"Header is referenced by ariaLabelledBy.");
			assert.notOk(this.oTable._oToolbar.getVisible(), "Toolbar is not visible.");

			this.oTable.setHeaderVisible(true);
			assert.ok(this.oTable.getHideToolbar(), "Property hideToolbar is true.");
			assert.ok(this.oTable.getHeaderVisible(), "Property headerVisible is true.");
			assert.ok(this.oTable._oTable.getAriaLabelledBy().includes(this.oTable.getId() + "-invisibleTitle"),
				"Header is referenced by ariaLabelledBy.");
			assert.notOk(this.oTable._oToolbar.getVisible(), "Toolbar is not visible.");

			this.oTable.setHideToolbar(false);
			this.oTable.setHeaderVisible(false);
			assert.notOk(this.oTable.getHideToolbar(), "Property hideToolbar is false.");
			assert.notOk(this.oTable.getHeaderVisible(), "Property headerVisible is false.");
			assert.notOk(this.oTable._oTable.getAriaLabelledBy().includes(this.oTable.getId() + "-invisibleTitle"),
				"Header is not referenced by ariaLabelledBy.");
			assert.ok(this.oTable._oToolbar.getVisible(), "Toolbar is visible.");

			this.oTable.setHideToolbar(true);
			assert.equal(this.oTable.getType(), null, "Table type is null");

			return this.oTable.setType(TableType.ResponsiveTable).initialized().then(() => {
				assert.equal(this.oTable.getType(), TableType.ResponsiveTable, "Table type is ResponsiveTable");
				assert.ok(this.oTable.getHideToolbar(), "Property hideToolbar is true.");
				assert.notOk(this.oTable.getHeaderVisible(), "Property headerVisible is false.");
				assert.ok(this.oTable._oTable.getAriaLabelledBy().includes(this.oTable.getId() + "-invisibleTitle"),
					"Header is referenced by ariaLabelledBy.");
				assert.notOk(this.oTable._oToolbar.getVisible(), "Toolbar is not visible.");
			});
		});
	});

	QUnit.test("Toolbar style", async function(assert) {
		await this.oTable.initialized();
		assert.strictEqual(this.oTable._oToolbar.getStyle(), "Clear", "Correct style applied to the toolbar according to the table type");

		this.oTable.setType(new ResponsiveTableType());
		await this.oTable.initialized();
		assert.strictEqual(this.oTable._oToolbar.getStyle(), "Standard", "Toolbar style updated after table type is changed to Responsive table");
	});

	QUnit.test("Export button state should be checked for bindingChange, if a row is added to the table", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			enableExport: true,
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			columns: [
				new Column({
					propertyKey: "name",
					template: new Text({
						text: "{name}"
					})
				})
			],
			models: new JSONModel({
				testPath: []
			})
		});

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			assert.notOk(this.oTable._oExportButton.getEnabled(), "Export button is disabled since there are no rows");
			assert.equal(this.oTable._oExportButton.getEnabled(), MTableUtil.isExportable(this.oTable.getRowBinding()),
				"Export button enabled state is in sync with sap/m/table/Util#isExportable");

			const oUpdateExportButtonSpy = sinon.spy(this.oTable, "_updateExportButton");
			const oIsExportableSpy = sinon.spy(MTableUtil, "isExportable");
			const fGetLengthStub = sinon.stub(this.oTable.getRowBinding(), "getLength");

			fGetLengthStub.returns(1);

			// Update export button state based on binding length
			this.oTable.getRowBinding().fireEvent("change");
			assert.ok(oUpdateExportButtonSpy.calledOnce);
			assert.ok(oIsExportableSpy.calledOnce, "sap/m/table/Util#isExportable has been invoked");
			assert.ok(oIsExportableSpy.calledWith(this.oTable.getRowBinding()), "Called with binding");
			assert.ok(this.oTable._oExportButton.getEnabled(), "Export button enabled, since binding change added a row to the table");
			assert.equal(this.oTable._oExportButton.getEnabled(), MTableUtil.isExportable(this.oTable.getRowBinding()),
				"Export button enabled state is in sync with sap/m/table/Util#isExportable");

			oIsExportableSpy.restore();

			const fIsExportableStub = sinon.stub(MTableUtil, "isExportable");

			fIsExportableStub.returns(false);

			// Update export button state based on isExportable
			this.oTable.getRowBinding().fireEvent("change");
			assert.notOk(this.oTable._oExportButton.getEnabled(), "Export button disabled, since sap/m/table/Util#isExportable returns false");

			fIsExportableStub.returns(true);

			this.oTable.getRowBinding().fireEvent("change");
			assert.ok(this.oTable._oExportButton.getEnabled(), "Export button enabled, since sap/m/table/Util#isExportable returns true");

			oUpdateExportButtonSpy.restore();
			fIsExportableStub.restore();
			fGetLengthStub.restore();
		}.bind(this));
	});

	QUnit.test("_setSelectedContexts", function(assert) {
		return this.oTable.initialized().then(() => {
			const oDelegate = this.oTable.getControlDelegate();
			const aContexts = [];

			sinon.stub(oDelegate, "setSelectedContexts");
			this.oTable._setSelectedContexts(aContexts);
			assert.ok(oDelegate.setSelectedContexts.calledOnceWithExactly(this.oTable, aContexts),
				"Delegate.setSelectedContexts called once with the correct arguments");
			oDelegate.setSelectedContexts.restore();
		});
	});

	QUnit.test("_bindingChange", function(assert) {
		sinon.spy(this.oTable, "fireEvent");
		return this.oTable._fullyInitialized().then(() => {
			this.oTable._onBindingChange();
			assert.ok(this.oTable.fireEvent.calledWith("_bindingChange"), "Table fires expected event '_bindingChange'");
			this.oTable.fireEvent.restore();
		});
	});

	QUnit.module("Bind/Rebind", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings, aPropertyInfos) {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath",
						propertyInfo: aPropertyInfos
					}
				},
				...mSettings
			});

			return this.oTable;
		}
	});

	QUnit.test("GridTable", async function(assert) {
		this.createTable();
		await this.oTable.initialized();
		assert.ok(!this.oTable._oTable.isBound("rows"), "Table is not bound when the 'initialized' promise resolves");

		sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo").callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.template = new Text();
		});

		await TableQUnitUtils.waitForBindingInfo(this.oTable);
		assert.ok(this.oTable._oTable.isBound("rows"), "Table is bound after initialization");

		const oBindingInfo = this.oTable._oTable.getBindingInfo("rows");
		assert.strictEqual(oBindingInfo.path, "/testPath", "BindingInfo.path");
		assert.ok(!("template" in oBindingInfo), "BindingInfo.template does not exist");

		this.oTable.getControlDelegate().updateBindingInfo.restore();
	});

	QUnit.test("ResponsiveTable", async function(assert) {
		this.createTable({
			type: TableType.ResponsiveTable,
			columns: [
				new Column({
					template: new Text({
						text: "Test"
					})
				}),
				new Column({
					template: new Text({
						text: "Test2"
					})
				})
			]
		});
		await this.oTable.initialized();
		assert.ok(!this.oTable._oTable.isBound("rows"), "Table is not bound when the 'initialized' promise resolves");

		sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo").callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.template = new Text();
			oBindingInfo.templateShareable = false;
		});

		await TableQUnitUtils.waitForBindingInfo(this.oTable);
		assert.ok(this.oTable._oTable.isBound("items"), "Table is bound after initialization");

		const oBindingInfo = this.oTable._oTable.getBindingInfo("items");
		assert.strictEqual(oBindingInfo.path, "/testPath", "BindingInfo.path");
		assert.ok(oBindingInfo.template, "BindingInfo.template");
		assert.strictEqual(oBindingInfo.templateShareable, true, "BindingInfo.templateShareable");
		assert.deepEqual(oBindingInfo.template.getCells().map((oCell) => oCell.getText()), [
			"Test", "Test2"
		], "Cells in the template");

		this.oTable.getControlDelegate().updateBindingInfo.restore();
	});

	QUnit.test("autoBindOnInit=true", async function(assert) {
		this.createTable();
		await this.oTable.initialized();
		await TableQUnitUtils.waitForBindingInfo(this.oTable);
		assert.ok(this.oTable.isTableBound(), "Table is bound");
	});

	QUnit.test("autoBindOnInit=false", async function(assert) {
		this.createTable({
			autoBindOnInit: false
		});
		await this.oTable.initialized();
		await wait(100);
		assert.ok(!this.oTable.isTableBound(), "Table is not bound automatically");

		this.oTable.rebind();
		await TableQUnitUtils.waitForBindingInfo(this.oTable);
		assert.ok(this.oTable.isTableBound(), "Table is bound after calling Table#rebind");
	});

	QUnit.test("Modifications supported", async function(assert) {
		this.createTable();

		const oRebindSpy = sinon.spy(this.oTable, "rebind");
		const oWaitForChanges = new Deferred();
		const oWaitForChangesStub = sinon.stub(this.oTable.getEngine(), "waitForChanges");
		const oIsModificationSupportedStub = sinon.stub(this.oTable.getEngine(), "isModificationSupported");

		oIsModificationSupportedStub.withArgs(this.oTable).returns(Promise.resolve(true));
		oWaitForChangesStub.withArgs(this.oTable).returns(oWaitForChanges.promise);

		await this.oTable.initialized();
		await wait(100);
		assert.ok(oRebindSpy.notCalled, "Table#rebind not called after initialization");
		oWaitForChanges.resolve();
		await oWaitForChanges.promise;
		assert.equal(oRebindSpy.callCount, 1, "Table#rebind called once after changes have been applied");
		await TableQUnitUtils.waitForBindingInfo(this.oTable);
		assert.ok(this.oTable.isTableBound(), "Table is bound");

		oWaitForChangesStub.restore();
		oIsModificationSupportedStub.restore();
	});

	QUnit.test("Modifications not supported", async function(assert) {
		this.createTable();

		const oRebindSpy = sinon.spy(this.oTable, "rebind");
		const oIsModificationSupported = new Deferred();
		const oIsModificationSupportedStub = sinon.stub(this.oTable.getEngine(), "isModificationSupported");

		oIsModificationSupportedStub.withArgs(this.oTable).returns(oIsModificationSupported.promise);

		await this.oTable._fullyInitialized();
		assert.ok(oRebindSpy.notCalled, "Table#rebind not called during initialization");
		oIsModificationSupported.resolve(false);
		await oIsModificationSupported.promise;
		assert.equal(oRebindSpy.callCount, 1, "Table#rebind called once after initialization");
		await TableQUnitUtils.waitForBindingInfo(this.oTable);
		assert.ok(this.oTable.isTableBound(), "Table is bound");

		oIsModificationSupportedStub.restore();
	});

	QUnit.test("_rebind", async function(assert) {
		this.createTable({
			autoBindOnInit: false
		});

		const oDelegate = await this.oTable.awaitControlDelegate();

		sinon.stub(oDelegate, "updateBindingInfo")
			.callThrough()
			.onCall(0).callsFake(function(oTable, oBindingInfo) {
				oDelegate.updateBindingInfo.wrappedMethod.apply(this, arguments);
				assert.ok(oTable._oTable, "The table is initialized when TableDelegate.updateBindingInfo is called");
			});
		sinon.stub(oDelegate, "updateBinding").callThrough();

		// Initial binding
		assert.ok(!this.oTable._oTable, "The table is not yet initialized when #_rebind is called");
		await this.oTable._rebind().then((oResult) => {
			assert.strictEqual(oResult, undefined, "No binding exists: #_rebind resolved without value");
		}).catch(() => {
			assert.ok(false, "No binding exists: #_rebind resolved");
		});
		assert.ok(oDelegate.updateBindingInfo.calledOnceWith(this.oTable), "No binding exists: TableDelegate.updateBindingInfo call");
		assert.ok(oDelegate.updateBinding.calledOnceWithExactly(this.oTable, oDelegate.updateBindingInfo.getCall(0).args[1], null,
			{forceRefresh: false}), "No binding exists: TableDelegate.updateBinding call");
		sinon.assert.callOrder(oDelegate.updateBindingInfo, oDelegate.updateBinding);
		assert.ok(this.oTable.isTableBound(), "Table is bound");

		oDelegate.updateBindingInfo.reset();
		oDelegate.updateBinding.reset();

		// Rebind
		await this.oTable._rebind().then((oResult) => {
			assert.strictEqual(oResult, undefined, "Binding exists: #_rebind resolved without value");
		}).catch(() => {
			assert.ok(false, "Binding exists: #_rebind resolved");
		});
		assert.ok(oDelegate.updateBindingInfo.calledOnceWith(this.oTable), "Binding exists: TableDelegate.updateBindingInfo call");
		assert.ok(oDelegate.updateBinding.calledOnceWithExactly(this.oTable, oDelegate.updateBindingInfo.getCall(0).args[1],
			this.oTable.getRowBinding(), {forceRefresh: false}), "Binding exists: TableDelegate.updateBinding call");

		// Force rebind
		oDelegate.updateBindingInfo.resetHistory();
		oDelegate.updateBinding.resetHistory();
		this.oTable._bForceRebind = true;
		await this.oTable._rebind().then((oResult) => {
			assert.strictEqual(oResult, undefined, "Force rebind: #_rebind resolved without value");
		}).catch(() => {
			assert.ok(false, "Force rebind: #_rebind resolved");
		});
		assert.ok(oDelegate.updateBindingInfo.calledOnceWith(this.oTable), "Force rebind: TableDelegate.updateBindingInfo call");
		assert.ok(oDelegate.updateBinding.calledOnceWithExactly(this.oTable, oDelegate.updateBindingInfo.getCall(0).args[1], null,
			{forceRefresh: false}), "Force rebind: TableDelegate.updateBinding call");

		// Force refresh
		oDelegate.updateBindingInfo.resetHistory();
		oDelegate.updateBinding.resetHistory();
		await this.oTable._rebind(true).then((oResult) => {
			assert.strictEqual(oResult, undefined, "Force refresh: #_rebind resolved without value");
		}).catch(() => {
			assert.ok(false, "Force refresh: #_rebind resolved");
		});
		assert.ok(oDelegate.updateBindingInfo.calledOnceWith(this.oTable), "Force refresh: TableDelegate.updateBindingInfo call");
		assert.ok(oDelegate.updateBinding.calledOnceWithExactly(this.oTable, oDelegate.updateBindingInfo.getCall(0).args[1],
			this.oTable.getRowBinding(), {forceRefresh: true}), "Force refresh: TableDelegate.updateBinding call");

		// Rebind fails with an error
		oDelegate.updateBindingInfo.throws(new Error("Some fake error"));
		oDelegate.updateBindingInfo.resetHistory();
		oDelegate.updateBinding.resetHistory();
		await this.oTable._rebind(true).then((oResult) => {
			assert.ok(false, "TableDelegate.updateBindingInfo throws: #_rebind rejected");
		}).catch((oError) => {
			assert.deepEqual(oError, new Error("Some fake error"), "TableDelegate.updateBindingInfo throws: #_rebind rejected");
		});
		assert.ok(oDelegate.updateBinding.notCalled, "TableDelegate.updateBindingInfo throws: TableDelegate.updateBinding not called");

		oDelegate.updateBindingInfo.restore();
		oDelegate.updateBinding.restore();
	});

	QUnit.test("_onModifications", async function(assert) {
		this.createTable({
			autoBindOnInit: false
		});

		await this.oTable.finalizePropertyHelper();

		sinon.stub(this.oTable, "finalizePropertyHelper").resolves();
		sinon.stub(this.oTable, "rebind").resolves();
		sinon.stub(this.oTable, "isTableBound").returns(false);

		await this.oTable._onModifications(["Sort"]);
		assert.ok(this.oTable.finalizePropertyHelper.notCalled, "Table not bound: Table#finalizePropertyHelper not called");
		assert.ok(this.oTable.rebind.notCalled, "Table not bound: Table#rebind not called");

		this.oTable.isTableBound.returns(true);

		for (const sP13nController of ["Sort", "Filter", "Column", "Group", "Aggregate"]) {
			this.oTable.finalizePropertyHelper.resetHistory();
			this.oTable.rebind.resetHistory();
			await this.oTable._onModifications([sP13nController]);
			assert.ok(this.oTable.finalizePropertyHelper.calledOnce, sP13nController + ": Table#finalizePropertyHelper called once");
			assert.ok(this.oTable.rebind.calledOnce, sP13nController + ": Table#rebind called once");
		}

		for (const sP13nController of ["ColumnWidth", "Dummy"]) {
			this.oTable.finalizePropertyHelper.resetHistory();
			this.oTable.rebind.resetHistory();
			await this.oTable._onModifications([sP13nController]);
			assert.ok(this.oTable.finalizePropertyHelper.notCalled, sP13nController + ": Table#finalizePropertyHelper not called");
			assert.ok(this.oTable.rebind.notCalled, sP13nController + ": Table#rebind not called");
		}
	});

	QUnit.test("Sort indicators", async function(assert) {
		this.createTable({
			columns: [
				new Column({
					propertyKey: "name"
				}),
				new Column({
					propertyKey: "firstName"
				}),
				new Column({
					propertyKey: "age"
				})
			],
			sortConditions: {
				sorters: [
					{name: "name", descending: true}
				]
			},
			autoBindOnInit: false
		}, [{
			key: "name",
			path: "name",
			label: "name",
			dataType: "String"
		}, {
			key: "firstName",
			path: "firstName",
			label: "firstName",
			dataType: "String"
		}, {
			key: "age",
			path: "age",
			label: "age",
			dataType: "String"
		}]);

		const oUpdateSortIndicator = this.spy(this.oTable._getType(), "updateSortIndicator");

		assert.ok(oUpdateSortIndicator.notCalled, "Sort indicators not updated before binding");

		await this.oTable.rebind();
		assert.equal(oUpdateSortIndicator.callCount, 3, "Sort indicators of every column updated after binding");
		sinon.assert.calledWithExactly(oUpdateSortIndicator.getCall(0), this.oTable.getColumns()[0], "Descending");
		sinon.assert.calledWithExactly(oUpdateSortIndicator.getCall(1), this.oTable.getColumns()[1], "None");
		sinon.assert.calledWithExactly(oUpdateSortIndicator.getCall(2), this.oTable.getColumns()[2], "None");

		oUpdateSortIndicator.resetHistory();
		this.oTable.setSortConditions({
			sorters: [
				{name: "firstName", descending: false},
				{name: "age", descending: true}
			]
		});
		await this.oTable.rebind();
		assert.equal(oUpdateSortIndicator.callCount, 3, "Sort indicators of every column updated after binding");
		sinon.assert.calledWithExactly(oUpdateSortIndicator.getCall(0), this.oTable.getColumns()[0], "None");
		sinon.assert.calledWithExactly(oUpdateSortIndicator.getCall(1), this.oTable.getColumns()[1], "Ascending");
		sinon.assert.calledWithExactly(oUpdateSortIndicator.getCall(2), this.oTable.getColumns()[2], "Descending");
	});

	QUnit.module("Inbuilt filter initialization", {
		createTable: async function(mSettings) {
			this.oTable = new Table(mSettings);
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	const fnCheckInbuiltInitialization = function(oTable, bInbuiltShouldBeActivated, assert) {
		if (bInbuiltShouldBeActivated) {
			assert.ok(oTable.getInbuiltFilter().isA("sap.ui.mdc.filterbar.FilterBarBase"),
				"Inbuilt filtering initialized with a sap.ui.mdc.filterbar.FilterBarBase");
		} else {
			assert.ok(!oTable.getInbuiltFilter(), "Inbuilt filtering not initialized");
		}
	};

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'true'", async function(assert) {
		await this.createTable({
			autoBindOnInit: true,
			p13nMode: ["Filter"],
			delegate: {
				name: sDelegatePath
			}
		});
		fnCheckInbuiltInitialization(this.oTable, true, assert);
	});

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'false'", async function(assert) {
		await this.createTable({
			autoBindOnInit: false,
			p13nMode: ["Filter"],
			delegate: {
				name: sDelegatePath
			}
		});
		fnCheckInbuiltInitialization(this.oTable, true, assert);
	});

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'true' and inbuilt filtering disabled", async function(assert) {
		await this.createTable({
			autoBindOnInit: true
		});
		fnCheckInbuiltInitialization(this.oTable, false, assert);
	});

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'false' and inbuilt filtering enabled", async function(assert) {
		await this.createTable({
			autoBindOnInit: false
		});
		fnCheckInbuiltInitialization(this.oTable, false, assert);
	});

	QUnit.module("Filter info bar", {
		afterEach: function() {
			this.oTable.destroy();
		},
		createTable: async function(mSettings) {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath",
						propertyInfo: [{
							key: "name",
							label: "NameLabel",
							dataType: "String"
						}, {
							key: "age",
							label: "AgeLabel",
							dataType: "String"
						}, {
							key: "gender",
							label: "GenderLabel",
							dataType: "String"
						}]
					}
				},
				...mSettings
			});
			await this.oTable.initialized();
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		getFilterInfoBar: function() {
			let oFilterInfoBar;

			if (this.oTable._isOfType(TableType.ResponsiveTable)) {
				oFilterInfoBar = this.oTable._oTable.getInfoToolbar();
			} else {
				oFilterInfoBar = this.oTable._oTable.getExtension()[1];
			}

			if (oFilterInfoBar && oFilterInfoBar.isA("sap.m.OverflowToolbar")) {
				return oFilterInfoBar;
			} else {
				return null;
			}
		},
		getFilterInfoText: function() {
			const oFilterInfoBar = this.getFilterInfoBar();
			return oFilterInfoBar ? oFilterInfoBar.getContent()[0] : null;
		},
		hasFilterInfoBar: function() {
			return this.getFilterInfoBar() !== null;
		},
		filterInfoBarRendered: async function() {
			await new Promise((resolve) => {
				const oFilterInfoBar = this.getFilterInfoBar();

				if (!oFilterInfoBar.getDomRef()) {
					oFilterInfoBar.addEventDelegate({
						onAfterRendering: function() {
							oFilterInfoBar.removeEventDelegate(this);
							resolve();
						}
					});
				} else {
					resolve();
				}
			});
		}
	});

	QUnit.test("Filtering disabled", async function(assert) {
		await this.createTable({
			filterConditions: {
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			}
		});

		assert.ok(!this.hasFilterInfoBar(), "Filter info bar does not exist");

		this.oTable.setFilterConditions({
			age: [{
				isEmpty: null,
				operator: OperatorName.EQ,
				validated: ConditionValidated.NotValidated,
				values: ["test"]
			}]
		});

		await wait(50);
		assert.ok(!this.hasFilterInfoBar(), "Change filter conditions: Filter info bar does not exist");

		this.oTable.setP13nMode(["Filter"]);
		assert.ok(this.hasFilterInfoBar(), "Filtering enabled: Filter info bar exists");
		assert.ok(!this.getFilterInfoBar().getVisible(), "Filtering enabled: Filter info bar is invisible");
	});

	aTestedTypes.forEach(function(sTableType) {
		QUnit.test("Filtering enabled; Table type = " + sTableType, async function(assert) {
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
			const oListFormat = ListFormat.getInstance();
			let oFilterInfoBar;

			await this.createTable({
				type: sTableType,
				p13nMode: ["Filter"]
			});

			assert.ok(this.hasFilterInfoBar(), "No initial filter conditions: Filter info bar exists");
			assert.ok(!this.getFilterInfoBar().getVisible(), "No initial filter conditions: Filter info bar is invisible");
			assert.equal(this.oTable._oTable.getAriaLabelledBy().filter((sId) => sId === this.oTable._oFilterInfoBarInvisibleText.getId()).length, 1,
				"ariaLabelledBy of the inner table contains a reference to the invisible text");
			assert.equal(this.oTable._oFilterInfoBarInvisibleText.getText(), "", "The associated invisible text is empty");

			this.oTable.destroy();
			await this.createTable({
				type: sTableType,
				p13nMode: ["Filter"],
				filterConditions: {
					name: [{
						isEmpty: null,
						operator: OperatorName.EQ,
						validated: ConditionValidated.NotValidated,
						values: ["test"]
					}]
				},
				columns: [
					new Column({
						template: new Text(),
						propertyKey: "name",
						header: "NameLabelColumnHeader"
					}),
					new Column({
						template: new Text(),
						propertyKey: "age",
						header: "AgeLabelColumnHeader"
					})
				]
			});

			assert.ok(this.hasFilterInfoBar(), "Initial filter conditions: Filter info bar exists");
			assert.ok(this.getFilterInfoBar().getVisible(), "Initial filter conditions: Filter info bar is visible");
			assert.strictEqual(this.getFilterInfoText().getText(),
				oResourceBundle.getText("table.ONE_FILTER_ACTIVE", [oListFormat.format(["NameLabel"])]),
				"Initial filter conditions: The filter info bar text is correct (1 filter)");
			assert.equal(
				this.oTable._oFilterInfoBarInvisibleText.getText(), oResourceBundle.getText("table.ONE_FILTER_ACTIVE",
				[oListFormat.format(["NameLabel"])]),
				"The associated invisible text is correct"
			);
			assert.strictEqual(this.getFilterInfoBar().getAriaLabelledBy()[0], this.getFilterInfoText().getId(),
				"Filter info bar is labelled with the contained text.");

			this.oTable.setFilterConditions({
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}],
				age: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			});

			await this.filterInfoBarRendered();
			oFilterInfoBar = this.getFilterInfoBar();

			assert.strictEqual(this.getFilterInfoText().getText(),
				oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [2, oListFormat.format(["NameLabel", "AgeLabel"])]),
				"Change filter conditions: The filter info bar text is correct (2 filters)");

			oFilterInfoBar.focus();
			assert.strictEqual(document.activeElement, oFilterInfoBar.getFocusDomRef(), "The filter info bar is focused");

			this.oTable.setFilterConditions({
				name: []
			});
			assert.ok(this.hasFilterInfoBar(), "Filter conditions removed: Filter info bar exists");
			assert.ok(!this.getFilterInfoBar().getVisible(), "Filter conditions removed: Filter info bar is invisible");
			assert.equal(this.oTable._oFilterInfoBarInvisibleText.getText(), "", "The associated invisible text is empty");
			assert.ok(this.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

			this.oTable.setFilterConditions({
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}],
				age: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}],
				gender: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			});

			await wait(0);
			assert.ok(this.getFilterInfoBar().getVisible(), "Set filter conditions: Filter info bar is visible");
			assert.strictEqual(this.getFilterInfoText().getText(),
				oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [3, oListFormat.format(["NameLabel", "AgeLabel", "GenderLabel"])]),
				"Set filter conditions: The filter info bar text is correct (3 filters)");
			assert.equal(this.oTable._oFilterInfoBarInvisibleText.getText(),
				oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [3, oListFormat.format(["NameLabel", "AgeLabel", "GenderLabel"])]),
				"The associated invisible text is correct");

			await this.filterInfoBarRendered();
			oFilterInfoBar = this.getFilterInfoBar();

			this.oTable.setP13nMode();

			oFilterInfoBar.focus();
			assert.strictEqual(document.activeElement, oFilterInfoBar.getFocusDomRef(), "The filter info bar is focused");

			this.oTable.setP13nMode(["Column", "Sort"]);
			assert.ok(this.hasFilterInfoBar(), "Filter disabled: Filter info bar exists");
			assert.ok(!oFilterInfoBar.getVisible(), "Filter disabled: Filter info bar is invisible");
			assert.equal(this.oTable._oFilterInfoBarInvisibleText.getText(), "", "The associated invisible text is empty");
			await nextUIUpdate();
			assert.ok(this.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

			this.oTable.destroy();
			assert.ok(oFilterInfoBar.bIsDestroyed, "Filter info bar is destroyed when the table is destroyed");
			assert.equal(this.oTable._oFilterInfoBarInvisibleText, null, "The invisible text is set to null");
		});
	});

	QUnit.test("Changing table type", async function(assert) {
		await this.createTable({
			p13nMode: ["Filter"],
			filterConditions: {
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			}
		});

		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();
		assert.ok(this.hasFilterInfoBar(), "Changed from \"Table\" to \"ResponsiveTable\": Filter info bar exists");
		assert.equal(this.oTable._oTable.getAriaLabelledBy().filter((sId) => sId === this.oTable._oFilterInfoBarInvisibleText.getId()).length, 1,
			"Changed from \"Table\" to \"ResponsiveTable\": The filter info bar text is in the \"ariaLabelledBy\" association of the table");

		this.oTable.setType(TableType.Table);
		await this.oTable.initialized();
		assert.ok(this.hasFilterInfoBar(), "Changed from \"ResponsiveTable\" to \"Table\": Filter info bar exists");
		assert.equal(this.oTable._oTable.getAriaLabelledBy().filter((sId) => sId === this.oTable._oFilterInfoBarInvisibleText.getId()).length, 1,
			"Changed from \"ResponsiveTable\" to \"Table\": The filter info bar text is in the \"ariaLabelledBy\" association of the table");
	});

	QUnit.test("Open filter dialog", async function(assert) {
		await this.createTable({
			p13nMode: ["Filter"],
			filterConditions: {
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			},
			columns: new Column({
				template: new Text(),
				propertyKey: "name"
			})
		});
		await this.filterInfoBarRendered();

		this.stub(PersonalizationUtils, "openFilterDialog").resolves();
		this.getFilterInfoBar().firePress();
		assert.ok(PersonalizationUtils.openFilterDialog.calledOnceWith(this.oTable),
			"Pressing the filter info bar calls utils.Personalization.openFilterDialog with the correct arguments");

		PersonalizationUtils.openFilterDialog.restore();
	});

	QUnit.test("Open filter dialog; Focus handling (TODO: SHOULD BE AN OPA TEST!)", async function(assert) {
		await this.createTable({
			p13nMode: ["Filter"],
			filterConditions: {
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			},
			columns: new Column({
				template: new Text(),
				propertyKey: "name"
			})
		});
		await this.filterInfoBarRendered();

		const oFilterInfoBar = this.getFilterInfoBar();

		// Simulate setting the focus when the filter dialog is closed and all filters have been removed.
		// The filter info bar will be hidden in this case. The focus should still be somewhere in the table and not on the document body.
		oFilterInfoBar.focus();
		oFilterInfoBar.firePress(); // Opens the filter dialog
		await TableQUnitUtils.waitForP13nPopup(this.oTable);
		await TableQUnitUtils.closeP13nPopup(this.oTable);
		this.oTable.setFilterConditions({name: []}); // Hides the filter info bar
		await nextUIUpdate();
		assert.ok(this.oTable.getDomRef().contains(document.activeElement),
			"After removing all filters in the dialog and closing it, the focus is in the table");
	});

	QUnit.test("Clear filters button", async function(assert) {
		await this.createTable({
			p13nMode: ["Filter"],
			filterConditions: {
				name: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			},
			columns: new Column({
				template: new Text(),
				propertyKey: "name"
			})
		});
		await this.filterInfoBarRendered();

		const oFilterInfoBarContent = this.getFilterInfoBar().getContent();
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

		assert.ok(oFilterInfoBarContent[1].isA("sap.m.ToolbarSpacer"), "The second content element is a toolbar spacer");
		assert.ok(oFilterInfoBarContent[2].isA("sap.m.Button"), "The third content element is a (Clear Filters) button");
		assert.equal(oFilterInfoBarContent[2].getTooltip(), oResourceBundle.getText("infobar.REMOVEALLFILTERS"), "Clear Filters button tooltip");
		assert.equal(oFilterInfoBarContent[2].getIcon(), "sap-icon://decline", "Clear Filters button icon");
		assert.equal(oFilterInfoBarContent[2].getType(), "Transparent", "Clear Filters button type");

		this.spy(PersonalizationUtils, "createClearFiltersChange");
		oFilterInfoBarContent[2].firePress();
		assert.ok(PersonalizationUtils.createClearFiltersChange.calledOnceWithExactly(this.oTable),
			"Pressing the Clear Filters button calls utils.Personalization.createClearFiltersChange with the correct arguments");

		await nextUIUpdate();
		assert.ok(this.oTable.getDomRef().contains(document.activeElement), "The focus is in the table");

		PersonalizationUtils.createClearFiltersChange.restore();
	});

	aTestedTypes.forEach(function(sTableType) {
		QUnit.module("Row actions - " + sTableType, {
			beforeEach: async function() {
				this.oTable = new Table({
					type: sTableType
				});
				this.oTable.placeAt("qunit-fixture");
				await nextUIUpdate();
				return this.oTable.initialized();
			},
			afterEach: function() {
				this.oTable.destroy();
			},
			assertInnerTableAction: function(assert, oMDCTable, bIsBound) {
				const oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case TableType.ResponsiveTable:
						assert.equal(oTable._oRowTemplate.getType(), "Navigation", "Type of the list item template");
						break;
					default:
						assert.ok(oTable._oTable.getRowActionTemplate(), "Row action template exists");
						if (bIsBound) {
							const oBindingInfo = oTable._oTable.getRowActionTemplate().getBindingInfo("items");
							assert.ok(oBindingInfo, "BindingInfo for items exist");
							assert.ok(oBindingInfo.template.getVisible(), "RowAction is visible");
							assert.ok(oBindingInfo.template.isBound("type"), "Type property is bound");
						} else {
							assert.equal(oTable._oTable.getRowActionTemplate().getItems().length, 1, "With one item");
							assert.equal(oTable._oTable.getRowActionTemplate().getItems()[0].getType(), "Navigation", "Of type 'Navigation'");
							assert.equal(oTable._oTable.getRowActionCount(), 1, "Row action count");
						}
				}
			},
			assertNoInnerTableAction: function(assert, oMDCTable) {
				const oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case TableType.ResponsiveTable:
						assert.equal(oTable._oRowTemplate.getType(), "Inactive", "Type of the list item template");
						break;
					default:
						assert.notOk(oTable._oTable.getRowActionTemplate(), "Row action template does not exist");
						assert.equal(oTable._oTable.getRowActionCount(), 0, "Row action count");
				}
			},
			assertInnerTableActionFormatted: function(assert, oMDCTable, bIsBound) {
				const oTable = oMDCTable || this.oTable;
				let sType;

				switch (sTableType) {
					case TableType.ResponsiveTable:
						assert.equal(oTable._oRowTemplate.getType(), "Navigation", "Type of the list item template");
						assert.ok(oTable._oRowTemplate.getBindingInfo("type").formatter, "Type has formatter");
						sType = oTable._oRowTemplate.getBindingInfo("type").formatter("Test");
						assert.equal(sType, "Navigation", "Type is Navigation when boolean is true");
						sType = oTable._oRowTemplate.getBindingInfo("type").formatter("False");
						assert.equal(sType, "Inactive", "Type is Navigation when boolean is false");
						break;
					default:
						assert.ok(oTable._oTable.getRowActionTemplate(), "Row action template exists");
						if (bIsBound) {
							const oBindingInfo = oTable._oTable.getRowActionTemplate().getBindingInfo("items");
							assert.ok(oBindingInfo, "BindingInfo for items exist");
							assert.ok(oBindingInfo.template.getVisible(), "RowAction is visible");
							assert.ok(oBindingInfo.template.isBound("type"), "Type property is bound");
						} else {
							assert.equal(oTable._oTable.getRowActionTemplate().getItems().length, 1, "With one item");
							assert.equal(oTable._oTable.getRowActionTemplate().getItems()[0].getType(), "Navigation", "Of type 'Navigation'");
							assert.equal(oTable._oTable.getRowActionCount(), 1, "Row action count");
						}
				}
			}
		});

		QUnit.test("Initialize without actions", function(assert) {
			this.assertNoInnerTableAction(assert);
		});

		QUnit.test("Initialize with actions", function(assert) {
			const oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"})
				]
			});

			const oTable = new Table({
				type: sTableType,
				rowSettings: oRowSettings
			});

			return oTable.initialized().then(function() {
				this.assertInnerTableAction(assert, oTable);
			}.bind(this));
		});

		QUnit.test("Row Actions initialization different scenarios", function(assert) {
			// Scenario 1: Static RowAction + Static Visibility. Expected: All Rows have navigation.
			let oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"})
				]
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableAction(assert);
			oRowSettings.removeAllRowActions();

			// Scenario 2: Static RowAction + Bound Visibility. Expected: Only rows with stock String "Test" should have Navigation.
			oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						visible: {
							path: "stock",
							type: new BooleanType(),
							formatter: function(sString) {
								return sString === "Test";
							}
						}
					})
				]
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableActionFormatted(assert);
			oRowSettings.removeAllRowActions();

			this.oTable.setModel(new JSONModel({
				data: [{
					type: "Navigation"
				}]
			}));

			// Scenario 3: Bound RowAction + Static Visibility. Expected: All rows have navigation.
			oRowSettings = new RowSettings({
				rowActions: {
					path: "/data",
					template: new RowActionItem({
						type: "{type}",
						visible: true
					}),
					templateShareable: false
				}
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableAction(assert, null, true);
			oRowSettings.removeAllRowActions();

			// Scenario 4: Bound RowAction Type + Bound Visibility. Expected: Only rows with stock String "Test" have Navigation.
			oRowSettings = new RowSettings({
				rowActions: {
					path: "/data",
					template: new RowActionItem({
						type: "{type}",
						visible: {
							path: "stock",
							type: new BooleanType(),
							formatter: function(sString) {
								return sString === "Test";
							}
						}
					}),
					templateShareable: false
				}
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableActionFormatted(assert, null, true);
			oRowSettings.removeAllRowActions();
		});

		QUnit.test("Add and remove actions", function(assert) {
			const oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
			let oRowActionTemplateDestroySpy;
			const oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"})
				]
			});

			this.oTable.setRowSettings(oRowSettings);
			assert.equal(oTableInvalidationSpy.callCount, 0, "MDCTable was not invalidated");
			this.assertInnerTableAction(assert);
			oTableInvalidationSpy.reset();

			if (sTableType === "GridTable") {
				oRowActionTemplateDestroySpy = sinon.spy(this.oTable._oTable.getRowActionTemplate(), "destroy");
			}

			oRowSettings.removeAllRowActions();
			this.oTable.setRowSettings(oRowSettings);
			this.assertNoInnerTableAction(assert);

			if (sTableType === "GridTable") {
				assert.equal(oRowActionTemplateDestroySpy.callCount, 1, "Row action template was destroyed");
			}
		});
	});

	QUnit.module("p13nMode", {
		beforeEach: function() {
			this.oTable = new Table();
			this.oTable.setEnableColumnResize(false);
			return this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertToolbarButtons: function(assert, oMDCTable, sTitle) {
			if (typeof oMDCTable === "string") {
				sTitle = oMDCTable;
				oMDCTable = undefined;
			}

			const oTable = oMDCTable || this.oTable;
			const aModes = oTable.getP13nMode();
			const sTitlePrefix = sTitle ? sTitle + ": " : "";

			assert.ok(oTable._oP13nButton, sTitlePrefix + " - Table settings button exists");
			assert.equal(oTable._oP13nButton.getAriaHasPopup(), HasPopup.Dialog, "button has correct ariaHasPopup value");
			assert.ok(oTable._oToolbar.indexOfEnd(oTable._oP13nButton) >= 0, sTitlePrefix + " - Table settings button is contained in the toolbar");
			assert.equal(oTable._oP13nButton.getVisible(), aModes.length > 0 && !oTable._bHideP13nButton,
				sTitlePrefix + " - Table settings button is visible");
			assert.equal(FESRHelper.getSemanticStepname(oTable._oP13nButton, "press"), "mdc:tbl:p13n", "Correct FESR StepName");
		},
		assertAPI: function(assert, oMDCTable) {
			const oTable = oMDCTable || this.oTable;
			const aModes = oTable.getP13nMode();

			assert.strictEqual(oTable.isSortingEnabled(), aModes.includes(TableP13nMode.Sort), "#isSortingEnabled");
			assert.strictEqual(oTable.isFilteringEnabled(), aModes.includes(TableP13nMode.Filter), "#isFilteringEnabled");
		},
		assertColumnDnD: function(assert, oMDCTable) {
			const oTable = oMDCTable || this.oTable;
			const bEnabled = oTable.getP13nMode().indexOf("Column") > -1;

			assert.equal(oTable._oTable.getDragDropConfig()[0].getEnabled(), bEnabled, "DragDropConfig for column reordering");
			assert.ok(oTable._oTable.getDragDropConfig()[0].getKeyboardHandling(), "Keyboard handling for column reordering");
		}
	});

	QUnit.test("Initialize without active modes", function(assert) {
		this.assertToolbarButtons(assert);
		this.assertAPI(assert);
		this.assertColumnDnD(assert);
	});

	QUnit.test("Initialize with active modes", function(assert) {
		const oTable = new Table({
			p13nMode: ["Sort", "Column"]
		});

		return oTable.initialized().then(function() {
			this.assertToolbarButtons(assert, oTable);
			this.assertAPI(assert, oTable);
			this.assertColumnDnD(assert, oTable);
		}.bind(this));
	});

	QUnit.test("Activate and deactivate", function(assert) {
		this.oTable.setP13nMode(["Sort"]);
		this.assertToolbarButtons(assert, "Activate 'Sort'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Column"]);
		this.assertToolbarButtons(assert, "Activate 'Column'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Column", "Filter"]);
		this.assertToolbarButtons(assert, "Activate 'Filter'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Filter"]);
		this.assertToolbarButtons(assert, "Deactivate 'Column'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode();
		this.assertToolbarButtons(assert, "Deactivate 'Sort' and 'Filter'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode();
		this.oTable._setShowP13nButton(false);
		this.assertToolbarButtons(assert, "_setShowP13nButton = false + No P13n");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort"]);
		this.oTable._setShowP13nButton(false);
		this.assertToolbarButtons(assert, "_setShowP13nButton = false + P13n");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort"]);
		this.oTable._setShowP13nButton(true);
		this.assertToolbarButtons(assert, "_setShowP13nButton = true + P13n");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);
	});

	QUnit.test("Avoid unnecessary update", function(assert) {
		const oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
		const oInnerTableInvalidationSpy = sinon.spy(this.oTable._oTable, "invalidate");

		this.oTable.setP13nMode();
		assert.equal(oTableInvalidationSpy.callCount, 0, "Deactivate modes if no modes are active: MDCTable was not invalidated");
		assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Deactivate modes if no modes are active: The inner table was not invalidated");

		this.oTable.setP13nMode(["Sort", "Column", "Filter"]);
		oTableInvalidationSpy.reset();
		oInnerTableInvalidationSpy.reset();

		const oToolbar = this.oTable._oToolbar;
		const aP13nButtons = oToolbar.getEnd();

		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		assert.equal(oTableInvalidationSpy.callCount, 0, "Activate modes that are already active: MDCTable was not invalidated");
		assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Activate modes that are already active: The inner table was not invalidated");

		assert.ok(aP13nButtons.every(function(oButton) {
			return oButton.bIsDestroyed !== true;
		}), "The p13n buttons were not destroyed");

		assert.ok(aP13nButtons.every(function(oButton) {
			return oToolbar.indexOfEnd(oButton) > -1;
		}), "The p13n buttons are still in the toolbar");
	});

	QUnit.test("Current state", function(assert) {
		const aSortConditions = [{
			name: "test",
			descending: true
		}];
		const oFilterConditions = {
			name: [{
				isEmpty: null,
				operator: OperatorName.EQ,
				validated: ConditionValidated.NotValidated,
				values: ["test"]
			}]
		};

		assert.deepEqual(this.oTable.getCurrentState(), {}, "No modes active");

		this.oTable.setP13nMode(["Column"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: []
		}, "Activate 'Column'");

		this.oTable.addColumn(new Column({
			propertyKey: "test"
		}));
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{key: "test", name: "test"}]
		}, "Add a column");

		this.oTable.setP13nMode(["Column", "Sort"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{key: "test", name: "test"}],
			sorters: []
		}, "Activate 'Sort'");

		this.oTable.setSortConditions({
			sorters: aSortConditions
		});
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{key: "test", name: "test"}],
			sorters: aSortConditions
		}, "Set sort conditions");

		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{key: "test", name: "test"}],
			sorters: aSortConditions,
			filter: {}
		}, "Activate 'Filter'");

		this.oTable.setFilterConditions(oFilterConditions);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{key: "test", name: "test"}],
			sorters: aSortConditions,
			filter: oFilterConditions
		}, "Set filter conditions");

		this.oTable.setP13nMode(["Column", "Filter"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{
				key: "test", name: "test"
			}],
			filter: oFilterConditions
		}, "Deactivate 'Sort'");

		this.oTable.setP13nMode();
		assert.deepEqual(this.oTable.getCurrentState(), {}, "Deactivate 'Column' and 'Filter'");

		sinon.stub(this.oTable, "getEnableColumnResize").returns(false);
		sinon.stub(this.oTable._getType(), "showXConfigState").returns(true);
		sinon.stub(this.oTable, "_getXConfig").returns({
			aggregations: {
				ResponsiveTableType: {
					table: {
						hideDetails: false
					}
				}
			}
		});

		assert.deepEqual(this.oTable.getCurrentState(), {
			xConfig: {
				aggregations: {
					ResponsiveTableType: {
						table: {
							hideDetails: false
						}
					}
				}
			}
		}, "xConfig is returned, despite column resize being deactivated.");

		this.oTable.getEnableColumnResize.restore();
		this.oTable._getXConfig.restore();
		this.oTable._getType().showXConfigState.restore();
	});

	QUnit.module("Column resize", {
		beforeEach: function() {
			return this.createTestObjects();
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		createTestObjects: function(mSettings) {
			mSettings = Object.assign({
				enableColumnResize: true
			}, mSettings);

			const sTableView =
			`<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
				<Table id="table" enableColumnResize="${mSettings.enableColumnResize}" delegate='${JSON.stringify({
					name: sDelegatePath,
					payload: {
						propertyInfo: [{
							key: "Name",
							label: "Name",
							path: "Name",
							dataType: "String"
						}, {
							key: "Country",
							label: "Country",
							path: "Country",
							dataType: "String"
						}, {
							key: "name_country",
							label: "Complex Title + Description",
							propertyInfos: ["Name", "Country"]
						}, {
							key: "Name_2",
							label: "Name 2",
							propertyInfos: ["Name"]
						}, {
							key: "Name_3",
							label: "Name 3",
							propertyInfos: ["Name"]
						}]
					}
				})}'>
					<columns>
						<mdcTable:Column id="myTable--column0" header="column 0" propertyKey="Name" />
						<mdcTable:Column id="myTable--column1" header="column 1" propertyKey="Country" />
						<mdcTable:Column id="myTable--column2" header="column 2" propertyKey="name_country" />
					</columns>
					<customData>
						<core:CustomData key="xConfig" value=\'\\{
							\"aggregations\":\\{
								\"columns\":\\{
									\"name_country\":\\{\"width\":\"199px\"\\},
									\"Name_2\":\\{\"width\":\"159px\"\\},
									\"Name_3\":\\{\"width\":\"149px\"\\}
								\\}
							\\}
						\\}\'/>
					</customData>
				</Table>
			</mvc:View>`;

			return createAppEnvironment(sTableView, "Table").then(async function(mCreatedApp) {
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				this.oTable = this.oView.byId("table");
				await nextUIUpdate();
				ControlPersonalizationWriteAPI.restore({
					selector: this.oTable
				});
			}.bind(this)).then(function() {
				return this.oTable.getEngine().getModificationHandler().waitForChanges({
					element: this.oTable
				});
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Enable/Disable column resize with ResponsiveTable (TODO: SHOULD BE AN OPA TEST!)", function(assert) {
		const oTable = this.oTable;

		sinon.stub(ColumnResizer, "_isInTouchMode").returns(true);
		oTable.setType(TableType.ResponsiveTable);

		return oTable.initialized().then(function() {
			assert.ok(oTable._oTable.getDependents()[0].isA("sap.m.plugins.ColumnResizer"),
				"ColumnResizer plugin is added to the ResponsiveTable by default");

			oTable.setEnableColumnResize(false);
			assert.notOk(oTable._oTable.getDependents()[0].getEnabled(), "Disabling column resize disables the ColumnResizer plugin");
			assert.strictEqual(getInnerColumnLabel(oTable.getColumns()[0]).getWrapping(), true, "Wrapping enabled on column label control");

			oTable.setEnableColumnResize(true);
			assert.ok(oTable._oTable.getDependents()[0].getEnabled(), "Enabling column resize enables the ColumnResizer plugin");
			assert.strictEqual(getInnerColumnLabel(oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");

			oTable._oColumnHeaderMenu.openBy(oTable._oTable.getColumns()[0]);
			return oTable._fullyInitialized().then(function() {
				return oTable.finalizePropertyHelper();
			});
		}).then(function() {
			const oMenu = oTable._oColumnHeaderMenu;
			const oColumnResizerButton = oMenu._getAllEffectiveQuickActions().find(function(oQuickAction) {
				return oQuickAction.getContent()[0].getText() === Library.getResourceBundleFor("sap.m").getText("table.COLUMNMENU_RESIZE");
			});
			assert.ok(oColumnResizerButton, "Column resize button found in column menu");
		}).finally(function() {
			ColumnResizer._isInTouchMode.restore();
		});
	});

	QUnit.test("Enable/Disable column resize with GridTable with enableColumnResize=true initially", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to true");
			assert.ok(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to true");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");

			this.oTable.setEnableColumnResize(false);
			assert.notOk(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to false");
			assert.notOk(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to false");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");
		}.bind(this));
	});

	QUnit.test("Enable/Disable column resize with GridTable with enableColumnResize=false initially", function(assert) {
		this.destroyTestObjects();

		return this.createTestObjects({enableColumnResize: false}).then(function() {
			return this.oTable.initialized();
		}.bind(this)).then(function() {
			assert.notOk(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to false");
			assert.notOk(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to false");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");

			this.oTable.setEnableColumnResize(true);
			assert.ok(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to true");
			assert.ok(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to true");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");
		}.bind(this));
	});

	QUnit.test("Apply initial column width changes", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getColumns()[2].getWidth(), "199px", "Initial column");

			this.oTable.addColumn(new Column({
				propertyKey: "Name_2",
				header: "Name_2"
			}));
			assert.strictEqual(this.oTable._oTable.getColumns()[3].getWidth(), "159px", "Added column");

			this.oTable.insertColumn(new Column({
				propertyKey: "Name_3",
				header: "Name_3"
			}), 0);
			assert.strictEqual(this.oTable._oTable.getColumns()[0].getWidth(), "149px", "Inserted column");
		}.bind(this));
	});

	QUnit.skip("Resize GridTable column", function(assert) {
		const oTable = this.oTable;

		return oTable.initialized().then(function() {
			const fOnModificationSpy = sinon.spy(oTable, "_onModifications");
			const oColumn = oTable._oTable.getColumns()[0];

			assert.ok(oTable.getEngine().getController(oTable, "ColumnWidth"), "ColumnWidth controller registered");
			assert.notOk(oTable.getCurrentState().xConfig.aggregations && oTable.getCurrentState().xConfig.aggregations.length, "xConfig is empty");

			oTable._oTable.fireColumnResize({
				column: oColumn,
				width: "200px"
			});

			return wait(0).then(function() {
				assert.strictEqual(oTable.getCurrentState().xConfig.aggregations.columns["Name"].width, "200px",
					"xConfig contains column width information");
				assert.strictEqual(fOnModificationSpy.callCount, 1, "Table#_onModifications called");
				assert.strictEqual(oTable._oTable.getColumns()[0].getWidth(), "200px", "Width of inner column");
				fOnModificationSpy.restore();
			});
		});
	});

	QUnit.skip("Resize ResponsiveTable column", function(assert) {
		const oTable = this.oTable;

		oTable.setType(TableType.ResponsiveTable);

		return oTable.initialized().then(function() {
			const fOnModificationSpy = sinon.spy(oTable, "_onModifications");
			const oColumn = oTable._oTable.getColumns()[0];
			const oColumnResizer = oTable._oTable.getDependents()[0];

			assert.ok(oTable.getEngine().getController(oTable, "ColumnWidth"), "ColumnWidth controller registered");
			assert.notOk(oTable.getCurrentState().xConfig.aggregations && oTable.getCurrentState().xConfig.aggregations.length, "xConfig is empty");

			oColumnResizer.fireColumnResize({
				column: oColumn,
				width: "200px"
			});

			return wait(0).then(function() {
				assert.strictEqual(oTable.getCurrentState().xConfig.aggregations.columns["Name"].width, "200px",
					"xConfig contains column width information");
				assert.strictEqual(fOnModificationSpy.callCount, 1, "Table#_onModifications called");
				assert.strictEqual(oTable._oTable.getColumns()[0].getWidth(), "200px", "Width of inner column");
				fOnModificationSpy.restore();
			});
		});
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oTable = new Table();
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Header Level Property added", function(assert) {
		const done = assert.async();
		this.oTable.setType(TableType.ResponsiveTable);
		assert.strictEqual(this.oTable.getHeaderLevel(), "Auto", "Header level set to the header");
		this.oTable.setHeaderLevel("H2");
		this.oTable.setHeader("Test Table");

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getLevel(), "H2", "Header level changed");
			done();
		}.bind(this));
	});

	QUnit.test("Header Style Property added", function(assert) {
		const done = assert.async();
		this.oTable.setType(TableType.ResponsiveTable);

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getTitleStyle(), "H5", "Header style set to the header");
			this.oTable.setHeaderStyle("H2");
			this.oTable.setHeader("Test Table");
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getTitleStyle(), "H2", "Header style changed");
			this.oTable.setHeaderStyle(null);
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getTitleStyle(), "H5", "Header style set to the header");
			done();
		}.bind(this));
	});

	QUnit.test("ACC Announcement of table after a FilterBar search", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "name",
						label: "Name",
						dataType: "String"
					}]
				}
			},
			p13nMode: ["Filter"],
			columns: [
				new Column({
					propertyKey: "name",
					template: new Text({
						text: "{name}"
					})
				})
			],
			models: new JSONModel({
				testPath: [
					{"name": "A"},
					{"name": "B"},
					{"name": "C"},
					{"name": "D"},
					{"name": "A"}
				]
			})
		});
		const oFilter = new FilterBar();
		const fnAnnounceTableUpdate = sinon.spy(MTableUtil, "announceTableUpdate");

		this.oTable.setFilter(oFilter);

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			oFilter.fireSearch();
			assert.ok(true, "Search is triggered.");
			assert.equal(this.oTable._bAnnounceTableUpdate, true, "Table internal flag _bAnnounceTableUpdate is set to true");

			this.oTable.getRowBinding().fireDataReceived(); // invoke event handler manually since we have a JSONModel
			assert.ok(fnAnnounceTableUpdate.calledOnce, "MTableUtil.announceTableUpdate is called once.");

			this.oTable.getRowBinding().fireDataReceived();
			assert.ok(fnAnnounceTableUpdate.calledOnce,
				"MTableUtil.announceTableUpdate is not called if the dataReceived is not caused by a filterbar search.");

			oFilter.fireSearch();
			assert.ok(true, "Search is triggered.");
			assert.equal(this.oTable._bAnnounceTableUpdate, true, "Table internal flag _bAnnounceTableUpdate is set to true");
			this.oTable.getRowBinding()._fireChange();
			// in some cases OData V4 doesn't trigger a data request, but the binding context changes and the item count has to be announced
			assert.ok(fnAnnounceTableUpdate.calledTwice,
				"MTableUtil.announceTableUpdate is called on binding change even if no data request is sent.");
			fnAnnounceTableUpdate.restore();
		}.bind(this));
	});

	QUnit.test("Avoid ACC Announcement of table if dataReceived is not fired by the FilterBar", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "name",
						label: "Name",
						dataType: "String"
					}]
				}
			},
			p13nMode: ["Filter"],
			columns: [
				new Column({
					propertyKey: "name",
					template: new Text({
						text: "{name}"
					})
				})
			],
			models: new JSONModel({
				testPath: [
					{"name": "A"},
					{"name": "B"},
					{"name": "C"},
					{"name": "D"},
					{"name": "A"}
				]
			})
		});
		const oFilter = new FilterBar();
		const fnOnDataReceived = sinon.spy(this.oTable, "_onDataReceived");
		const fnAnnounceTableUpdate = sinon.spy(MTableUtil, "announceTableUpdate");

		this.oTable.setFilter(oFilter);

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			this.oTable.getRowBinding().fireDataReceived(); // invoke event handler manually since we have a JSONModel
			assert.ok(fnOnDataReceived.called, "Event dataReceived is fired.");
			assert.equal(this.oTable._bAnnounceTableUpdate, undefined, "Table internal flag _bAnnounceTableUpdate is undefined");
			assert.notOk(fnAnnounceTableUpdate.called, "Function announceTableUpdate is never called.");
			fnAnnounceTableUpdate.restore();
		}.bind(this));
	});

	QUnit.module("PropertyInfo handling", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
				this.oFinalizePropertyHelperSpy.restore();
			}
			if (this.oFetchPropertiesSpy) {
				this.oFetchPropertiesSpy.restore();
			}
		},
		createTable: function(mSettings) {
			this.oTable = new Table(Object.assign({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath",
						propertyInfo: [{
							key: "firstname",
							path: "firstname",
							label: "First Name",
							dataType: "String",
							visualSettings: {
								widthCalculation: {
									minWidth: 22
								}
							}
						}, {
							key: "lastname",
							path: "lastname",
							label: "Last Name",
							dataType: "String",
							exportSettings: {
								property: "lastname",
								textAlign: "Center"
							}
						}, {
							key: "age",
							path: "age",
							dataType: "String",
							label: "Age"
						}]
					}
				},
				columns: [
					new Column({
						id: "lastnamecol",
						template: new Text(),
						propertyKey: "lastname"
					}),
					new Column({
						id: "agecol",
						template: new Text(),
						propertyKey: "age"
					})
				],
				propertyInfo: [{
					key: "lastname",
					label: "Last Name",
					path: "lastname",
					dataType: "String",
					exportSettings: {
						property: "lastname",
						textAlign: "Center"
					}
				}, {
					key: "age",
					path: "age",
					label: "Age",
					dataType: "String"
				}]
			}, mSettings));
			this.oFinalizePropertyHelperSpy = sinon.spy(this.oTable, "finalizePropertyHelper");

			return this.oTable.awaitControlDelegate().then(function(oDelegate) {
				this.oFetchPropertiesSpy = sinon.spy(oDelegate, "fetchProperties");
				return this.oTable._fullyInitialized();
			}.bind(this));
		}
	});

	QUnit.test("Initialization without initial property infos", function(assert) {
		return this.createTable({propertyInfo: undefined}).then(function(oTable) {
			assert.equal(this.oFetchPropertiesSpy.callCount, 1, "Delegate.fetchProperties called");
			assert.ok(oTable.getPropertyHelper(), "PropertyHelper exists");
			assert.ok(oTable.isPropertyHelperFinal(), "PropertyHelper is final");
		}.bind(this));
	});

	QUnit.test("Initialization with initial property infos", function(assert) {
		return this.createTable().then(function(oTable) {
			assert.equal(this.oFetchPropertiesSpy.callCount, 0, "Delegate.fetchProperties not called");
			assert.ok(oTable.getPropertyHelper(), "PropertyHelper exists");
			assert.notOk(oTable.isPropertyHelperFinal(), "PropertyHelper is not final");
			assert.equal(oTable.getPropertyHelper().getProperties().length, 2, "PropertyHelper has initial properties");
		}.bind(this));
	});

	QUnit.test("Property finalization when triggering the export", function(assert) {
		return this.createTable({enableExport: true}).then(function(oTable) {
			return oTable._createExportColumnConfiguration();
		}).then(function(oExportConfig) {
			assert.equal(this.oFinalizePropertyHelperSpy.callCount, 1, "Table#finalizePropertyHelper called");
			assert.deepEqual(oExportConfig, [{
				columnId: "lastnamecol",
				label: "Last Name",
				property: "lastname",
				textAlign: "Center",
				type: "String",
				width: ""
			}, {
				columnId: "agecol",
				label: "Age",
				property: ["age"],
				textAlign: "Begin",
				type: "String",
				width: ""
			}], "Export config");
		}.bind(this));
	});

	QUnit.test("Property finalization when adding a column with width calculation", function(assert) {
		return this.createTable({enableAutoColumnWidth: true}).then(function(oTable) {
			oTable.addColumn(new Column({
				template: new Text(),
				propertyKey: "firstname"
			}));
			return new Promise(function(resolve) {
				new ManagedObjectObserver(function() {
					resolve();
				}).observe(oTable.getColumns()[2].getInnerColumn(), {
					properties: ["width"]
				});
			});
		}).then(function() {
			assert.equal(this.oFinalizePropertyHelperSpy.callCount, 1, "Table#finalizePropertyHelper called");
			assert.equal(this.oTable.getColumns()[2].getInnerColumn().getWidth(), "23.0625rem", "Inner column width");
		}.bind(this));
	});

	QUnit.module("expand/collapse all", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
				this.oFetchExpandAndCollapseConfiguration.restore();
			}
		},
		createTable: async function(mSettings, bExpandCollapseSupported, bExpandFromNodeSupported, bCollapseFromNodeSupported,
									bIsNodeExpandedSupported) {
			this.oTable = new Table(Object.assign({
				type: "TreeTable",
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/catalog/clothing"
					}
				},
				columns: [
					new Column({
						id: "lastnamecol",
						template: new Text(),
						propertyKey: "name"
					}),
					new Column({
						id: "agecol",
						template: new Text(),
						propertyKey: "amount"
					}),
					new Column({
						id: "currency",
						template: new Text(),
						propertyKey: "currency"
					})
				],
				models: new JSONModel({
					"catalog": {
						"clothing": {
							"categories": [
								{
									"name": "Women", "categories": [
										{
											"name": "Clothing", "categories": [
												{
													"name": "Dresses", "categories": [
														{"name": "Casual Red Dress", "amount": 16.99, "currency": "EUR", "size": "S"},
														{"name": "Short Black Dress", "amount": 47.99, "currency": "EUR", "size": "M"},
														{"name": "Long Blue Dinner Dress", "amount": 103.99, "currency": "USD", "size": "L"}
													]
												},
												{
													"name": "Tops", "categories": [
														{"name": "Printed Shirt", "amount": 24.99, "currency": "USD", "size": "M"},
														{"name": "Tank Top", "amount": 14.99, "currency": "USD", "size": "S"}
													]
												}
											]
										}
									]
								},
								{
									"name": "Men", "categories": [
										{
											"name": "Clothing", "categories": [
												{
													"name": "Shirts", "categories": [
														{"name": "Black T-shirt", "amount": 9.99, "currency": "USD", "size": "XL"},
														{"name": "Polo T-shirt", "amount": 47.99, "currency": "USD", "size": "M"},
														{"name": "White Shirt", "amount": 103.99, "currency": "USD", "size": "L"}
													]
												},
												{
													"name": "Pants", "categories": [
														{"name": "Blue Jeans", "amount": 78.99, "currency": "USD", "size": "M"},
														{"name": "Stretch Pant", "amount": 54.99, "currency": "USD", "size": "S"}
													]
												},
												{
													"name": "Shorts", "categories": [
														{"name": "Trouser Short", "amount": 62.99, "currency": "USD", "size": "M"},
														{"name": "Slim Short", "amount": 44.99, "currency": "USD", "size": "S"}
													]
												}
											]
										}
									]
								}
							]
						}
					}
				})
			}, mSettings));
			this.oTable.placeAt("qunit-fixture");

			const oDelegate = await this.oTable.awaitControlDelegate();

			const oSupport = {};
			if (bExpandCollapseSupported) {
				oSupport.expandAll = function() {};
				oSupport.collapseAll = function() {};
			}

			if (bExpandFromNodeSupported) {
				oSupport.expandAllFromNode = function() {};
			}

			if (bCollapseFromNodeSupported) {
				oSupport.collapseAllFromNode = function() {};
			}

			if (bIsNodeExpandedSupported) {
				oSupport.isNodeExpanded = (oTable, oContext) => {
					return this.bIsNodeExpanded;
				};
			}

			this.oFetchExpandAndCollapseConfiguration = sinon.stub(oDelegate, "fetchExpandAndCollapseConfiguration")
															 .returns(Promise.resolve(oSupport));

			await TableQUnitUtils.waitForBinding(this.oTable);
			await nextUIUpdate();
		}
	});

	QUnit.test("Delegate supports expand/collapse all (Button)", async function(assert) {
		await this.createTable({}, true);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		FESRHelper.setSemanticStepname(this.oTable._oExpandAllButton, "press", "mdc:tbl:expandAll");
		assert.ok(this.oTable._oExpandAllButton.getVisible(), "Expand All Button is visible");
		assert.ok(this.oTable._oExpandAllButton.getEnabled(), "Expand All Button is enabled");
		assert.ok(this.oTable._oExpandAllButton.getDomRef(), "Expand All button DOM ref exists");

		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		FESRHelper.setSemanticStepname(this.oTable._oCollapseAllButton, "press", "mdc:tbl:collapseAll");
		assert.ok(this.oTable._oCollapseAllButton.getVisible(), "Collapse All Button is visible");
		assert.ok(this.oTable._oCollapseAllButton.getEnabled(), "Collapse All Button is enabled");
		assert.ok(this.oTable._oCollapseAllButton.getDomRef(), "Collapse All button DOM ref exists");
	});

	QUnit.test("Delegate supports expand/collapse all, but no data (Button)", async function(assert) {
		await this.createTable({
			models: new JSONModel({})
		}, true);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.getVisible(), "Expand All Button is visible");
		assert.notOk(this.oTable._oExpandAllButton.getEnabled(), "Expand All Button is not enabled");
		assert.ok(this.oTable._oExpandAllButton.getDomRef(), "Expand All button DOM ref exists");

		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.getVisible(), "Collapse All Button is visible");
		assert.notOk(this.oTable._oCollapseAllButton.getEnabled(), "Collapse All Button is not enabled");
		assert.ok(this.oTable._oCollapseAllButton.getDomRef(), "Collapse All button DOM ref exists");
	});

	QUnit.test("Delegate does not support expand/collapse all (Button)", async function(assert) {
		await this.createTable({}, false);

		assert.notOk(this.oTable._oExpandAllButton, "Expand All Button was not created");
		assert.notOk(this.oTable._oCollapseAllButton, "Collapse All Button was not created");
	});

	QUnit.test("Expand/Collapse with different selection modes", async function(assert) {
		function checkButtonStates(bShouldBeMenuButton) {
			const sClass = bShouldBeMenuButton ? "sap.m.OverflowToolbarMenuButton" : "sap.m.Button";

			assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
			assert.ok(this.oTable._oExpandAllButton.getVisible(), "Expand All Button is visible");
			assert.ok(this.oTable._oExpandAllButton.getEnabled(), "Expand All Button is enabled");
			assert.ok(this.oTable._oExpandAllButton.getDomRef(), "Expand All button DOM ref exists");
			assert.ok(this.oTable._oExpandAllButton.isA(sClass), "Expand All Button is a MenuButton");

			assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
			assert.ok(this.oTable._oCollapseAllButton.getVisible(), "Collapse All Button is visible");
			assert.ok(this.oTable._oCollapseAllButton.getEnabled(), "Collapse All Button is enabled");
			assert.ok(this.oTable._oCollapseAllButton.getDomRef(), "Collapse All button DOM ref exists");
			assert.ok(this.oTable._oCollapseAllButton.isA(sClass), "Collapse All Button is a MenuButton");
		}

		await this.createTable({}, true, true, true, true);
		checkButtonStates.call(this, false);

		this.oTable.setSelectionMode("Multi");
		await nextUIUpdate();
		await wait(100); // as the Table.prototype._updateExpandAllButton is async there is no other way than to wait

		checkButtonStates.call(this, true);

		this.oTable.setSelectionMode("Single");
		await nextUIUpdate();
		checkButtonStates.call(this, true);

		this.oTable.setSelectionMode("SingleMaster");
		await nextUIUpdate();
		checkButtonStates.call(this, true);

		this.oTable.setSelectionMode("None");
		await nextUIUpdate();
		checkButtonStates.call(this, false);
	});

	// With MenuButton (selection)
	QUnit.test("Delegate supports expand/collapse all (MenuButton)", async function(assert) {
		await this.createTable({
			selectionMode: "Multi"
		}, true, true, true, true);

		const oSelectionPlugin = this.oTable._oTable.getDependents().find((oDependent) => oDependent.isA("sap.ui.table.plugins.SelectionPlugin"));

		// No Row Selected => Node option should be not enabled
		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		this.oTable._oExpandAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.ok(this.oTable._oExpandAllButton.getMenu().getItems()[0].getEnabled(), "Expand All option is enabled");
		assert.notOk(this.oTable._oExpandAllButton.getMenu().getItems()[1].getEnabled(), "Expand Node option is disabled");

		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		this.oTable._oCollapseAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.ok(this.oTable._oCollapseAllButton.getMenu().getItems()[0].getEnabled(), "Collapse All option is enabled");
		assert.notOk(this.oTable._oCollapseAllButton.getMenu().getItems()[1].getEnabled(), "Collapse Node option is disabled");

		// One Row Selected => Node option should be enabled
		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", resolve);
			oSelectionPlugin.setSelectedIndex(0, true);
		});

		this.bIsNodeExpanded = false;
		this.oTable._oExpandAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.ok(this.oTable._oExpandAllButton.getMenu().getItems()[1].getEnabled(), "Expand Node option is enabled");

		this.bIsNodeExpanded = true;
		this.oTable._oCollapseAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.ok(this.oTable._oCollapseAllButton.getMenu().getItems()[1].getEnabled(), "Collapse Node option is enabled");

		// One Row Selected, but node is not correct expansion state => Node option should be disabled
		this.bIsNodeExpanded = true;
		this.oTable._oExpandAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.notOk(this.oTable._oExpandAllButton.getMenu().getItems()[1].getEnabled(), "Expand Node option is not enabled");

		this.bIsNodeExpanded = false;
		this.oTable._oCollapseAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.notOk(this.oTable._oCollapseAllButton.getMenu().getItems()[1].getEnabled(), "Collapse Node option is not enabled");

		// One Row Selected, but node is a leaf
		this.bIsNodeExpanded = undefined;
		this.oTable._oExpandAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.notOk(this.oTable._oExpandAllButton.getMenu().getItems()[1].getEnabled(), "Expand Node option is not enabled");
		this.oTable._oCollapseAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.notOk(this.oTable._oCollapseAllButton.getMenu().getItems()[1].getEnabled(), "Collapse Node option is not enabled");

		// Multiple Rows Selected => Node option should be disabled
		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", resolve);
			oSelectionPlugin.setSelectionInterval(0, 1);
		});

		this.bIsNodeExpanded = false;
		this.oTable._oExpandAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.notOk(this.oTable._oExpandAllButton.getMenu().getItems()[1].getEnabled(), "Expand Node option is not enabled");

		this.bIsNodeExpanded = true;
		this.oTable._oCollapseAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.notOk(this.oTable._oCollapseAllButton.getMenu().getItems()[1].getEnabled(), "Collapse Node option is not enabled");
	});

	QUnit.test("Delegate supports expand/collapse all, but misses methods for expand/collapseFromNode (MenuButton)", async function(assert) {
		// Delegate does not implement expand/collapseFromNode and isNodeExpanded => should render button
		await this.createTable({
			selectionMode: "Multi"
		}, true, false, false, false);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.isA("sap.m.Button"), "Expand All Button is a sap.m.Button");
		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.isA("sap.m.Button"), "Collapse All Button is a sap.m.Button");

		// Delegate does not implement collapseFromnode and isNodeExpanded => should render button
		this.oTable.destroy();
		this.oFetchExpandAndCollapseConfiguration.restore();
		await this.createTable({
			selectionMode: "Multi"
		}, true, true, false, false);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.isA("sap.m.Button"), "Expand All Button is a sap.m.Button");
		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.isA("sap.m.Button"), "Collapse All Button is a sap.m.Button");

		// Delegate does not implement collapseFromnode => should render button for collapse, but menu button for expand
		this.oTable.destroy();
		this.oFetchExpandAndCollapseConfiguration.restore();
		await this.createTable({
			selectionMode: "Multi"
		}, true, true, false, true);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.isA("sap.m.MenuButton"), "Expand All Button is a sap.m.MenuButton");
		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.isA("sap.m.Button"), "Collapse All Button is a sap.m.Button");

		// Delegate does not implement expandFromNode and isNodeExpanded => should render button
		this.oTable.destroy();
		this.oFetchExpandAndCollapseConfiguration.restore();
		await this.createTable({
			selectionMode: "Multi"
		}, true, false, true, false);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.isA("sap.m.Button"), "Expand All Button is a sap.m.Button");
		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.isA("sap.m.Button"), "Collapse All Button is a sap.m.Button");

		// Delegate does not implement expandFromNode => should render button for expand, menu button for collapse
		this.oTable.destroy();
		this.oFetchExpandAndCollapseConfiguration.restore();
		await this.createTable({
			selectionMode: "Multi"
		}, true, false, true, true);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.isA("sap.m.Button"), "Expand All Button is a sap.m.Button");
		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.isA("sap.m.MenuButton"), "Collapse All Button is a sap.m.MenuButton");
	});

	QUnit.test("Delegate supports expand/collapseFromNode, but misses method for expand/collapseAll (MenuButton)", async function(assert) {
		await this.createTable({
			selectionMode: "Multi"
		}, false, true, true, true);

		assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
		assert.ok(this.oTable._oExpandAllButton.isA("sap.m.MenuButton"), "Expand All Button is a sap.m.MenuButton");
		assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
		assert.ok(this.oTable._oCollapseAllButton.isA("sap.m.MenuButton"), "Collapse All Button is a sap.m.MenuButton");

		this.oTable._oExpandAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.equal(this.oTable._oExpandAllButton.getMenu().getItems().length, 2, "Expand All Button has 2 items");
		assert.notOk(this.oTable._oExpandAllButton.getMenu().getItems()[0].getEnabled(), "Expand Entire Tree option is disabled");

		this.oTable._oCollapseAllButton.fireBeforeMenuOpen(); // simulate beforeMenuOpen event
		assert.equal(this.oTable._oCollapseAllButton.getMenu().getItems().length, 2, "Collapse All Button has 2 items");
		assert.notOk(this.oTable._oCollapseAllButton.getMenu().getItems()[0].getEnabled(), "Collapse Entire Tree option is disabled");
	});

	QUnit.module("Initialized promise", {
		createInitPromise: function(assert, oTable, vExpectedError) {
			return oTable.initialized().then((_oTable) => {
				if (vExpectedError) {
					assert.ok(false, "The 'initialized' promise resolved when it should have rejected");
				} else {
					assert.equal(oTable, _oTable, "The 'initialized' promise resolved with the table instance");
				}
			}).catch((vError) => {
				if (!vExpectedError) {
					assert.ok(false, "The 'initialized' promise rejected when it should have resolved");
				} else {
					assert.equal(vError, vExpectedError, "The 'initialized promise rejected with the expected error");
				}
			}).finally(() => {
				oTable.destroy();
			});
		}
	});

	QUnit.test("Default settings", function(assert) {
		const oTable = new Table();
		return this.createInitPromise(assert, oTable);
	});

	QUnit.test("Type change during initialization", function(assert) {
		const oTable = new Table();
		const pInitPromise = this.createInitPromise(assert, oTable, "Type changed");

		oTable.setType(TableType.ResponsiveTable);

		return pInitPromise;
	});

	QUnit.test("Destroy during initialization", function(assert) {
		const oTable = new Table();
		const pInitPromise = this.createInitPromise(assert, oTable, "Destroyed");

		return oTable.awaitControlDelegate().then(() => {
			oTable.destroy();
			return pInitPromise;
		});
	});

	QUnit.test("Uncaught errors", function(assert) {
		const aErrors = [];
		const fnOnRejectedPromiseError = (oEvent) => {
			aErrors.push(oEvent.reason);
		};

		window.addEventListener("unhandledrejection", fnOnRejectedPromiseError);

		const oTable = new Table();
		oTable.initialized().catch(() => {});

		return oTable.awaitControlDelegate().then(() => {
			oTable.destroy();
			return wait(3000);
		}).then(() => {
			window.removeEventListener("unhandledrejection", fnOnRejectedPromiseError);
			assert.deepEqual(aErrors, [], "No uncaught errors detected");
		});
	});

	QUnit.module("Context menu", {
		beforeEach: function() {
			this.oContextMenu = new Menu();
			this.oBeforeOpenContextMenu = this.spy();
			this.oBeforeOpenContextMenuParameters = null;
			this.oTable = new Table({
				contextMenu: this.oContextMenu,
				beforeOpenContextMenu: (oEvent) => {
					this.oBeforeOpenContextMenuParameters = oEvent.getParameters();
					this.oBeforeOpenContextMenu();
				}
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertBeforeOpenContextMenu: function(mExpectedParameters) {
			QUnit.assert.equal(this.oBeforeOpenContextMenu.callCount, 1, "beforeOpenContextMenu event");
			QUnit.assert.deepEqual(this.oBeforeOpenContextMenuParameters, {
				...mExpectedParameters,
				id: this.oTable.getId()
			}, "beforeOpenContextMenu event parameters");
			this.oBeforeOpenContextMenuParameters = null;
			this.oBeforeOpenContextMenu.resetHistory();
		}
	});

	QUnit.test("Aggregation API before initialization of inner table", function(assert) {
		assert.equal(this.oTable.getContextMenu(), this.oContextMenu, "#getContextMenu");

		this.oTable.destroyContextMenu();
		assert.strictEqual(this.oTable.getContextMenu(), null, "#getContextMenu after #destroyContextMenu");
		assert.ok(this.oContextMenu.isDestroyed(), "The context menu is destroyed");

		this.oContextMenu = new Menu();
		this.oTable.setContextMenu(this.oContextMenu);
		assert.equal(this.oTable.getContextMenu(), this.oContextMenu, "#getContextMenu after #setContextMenu");

		this.oTable.setContextMenu(null);
		assert.strictEqual(this.oTable.getContextMenu(), null, "#getContextMenu after #setContextMenu(null)");
	});

	QUnit.test("Aggregation API after initialization of inner table", async function(assert) {
		await this.oTable.initialized();
		assert.equal(this.oTable.getContextMenu(), this.oContextMenu, "#getContextMenu");

		this.oTable.destroyContextMenu();
		assert.strictEqual(this.oTable.getContextMenu(), null, "#getContextMenu after #destroyContextMenu");
		assert.ok(this.oContextMenu.isDestroyed(), "The context menu is destroyed");

		this.oContextMenu = new Menu();
		this.oTable.setContextMenu(this.oContextMenu);
		assert.equal(this.oTable.getContextMenu(), this.oContextMenu, "#getContextMenu after #setContextMenu");

		this.oTable.setContextMenu(null);
		assert.strictEqual(this.oTable.getContextMenu(), null, "#getContextMenu after #setContextMenu(null)");

		this.oContextMenu = new Menu();
		this.oTable.setContextMenu(this.oContextMenu);
		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();
		assert.equal(this.oTable.getContextMenu(), this.oContextMenu, "#getContextMenu after #setType");
		assert.ok(!this.oContextMenu.isDestroyed(), "The context menu should not be destroyed");
	});

	QUnit.test("#_onBeforeOpenContextMenu - Context menu", function(assert) {
		const oContextMenu = this.oTable.getContextMenu();
		const oEvent = {preventDefault: this.spy()};

		this.oTable._onBeforeOpenContextMenu({
			contextMenu: oContextMenu
		});
		this.assertBeforeOpenContextMenu({
			bindingContext: undefined,
			column: undefined
		});

		this.oTable._onBeforeOpenContextMenu({
			contextMenu: oContextMenu,
			bindingContext: {myBindingContext: "test"},
			column: {myColumn: "test"},
			event: oEvent
		});
		this.assertBeforeOpenContextMenu({
			bindingContext: {myBindingContext: "test"},
			column: {myColumn: "test"}
		});
		assert.notOk(oEvent.preventDefault.calledOnce, "preventDefault on the given event object");

		oEvent.preventDefault.resetHistory();
		this.oTable.attachEventOnce("beforeOpenContextMenu", (oEvent) => oEvent.preventDefault());
		this.oTable._onBeforeOpenContextMenu({
			contextMenu: oContextMenu,
			event: oEvent
		});
		assert.ok(oEvent.preventDefault.calledOnce, "preventDefault on the given event object");
	});

	QUnit.test("#_onBeforeOpenContextMenu - Group header row context menu", function(assert) {
		const oGroupHeaderRowContextMenu = new GroupHeaderRowContextMenu();
		const oEvent = {preventDefault: this.spy()};

		this.spy(oGroupHeaderRowContextMenu, "initContent");
		this.stub(oGroupHeaderRowContextMenu, "isEmpty").returns(false);

		this.oTable._onBeforeOpenContextMenu({
			contextMenu: oGroupHeaderRowContextMenu
		});
		assert.ok(oGroupHeaderRowContextMenu.initContent.calledOnceWithExactly(this.oTable, {
			groupLevel: undefined
		}), "ContextMenu#initContent call");

		oGroupHeaderRowContextMenu.initContent.resetHistory();
		this.oTable._onBeforeOpenContextMenu({
			contextMenu: oGroupHeaderRowContextMenu,
			groupLevel: 1,
			event: oEvent
		});
		assert.ok(oGroupHeaderRowContextMenu.initContent.calledOnceWithExactly(this.oTable, {
			groupLevel: 1
		}), "ContextMenu#initContent call");
		assert.notOk(oEvent.preventDefault.calledOnce, "preventDefault on the given event object");

		oEvent.preventDefault.resetHistory();
		oGroupHeaderRowContextMenu.isEmpty.returns(true);
		this.oTable._onBeforeOpenContextMenu({
			contextMenu: oGroupHeaderRowContextMenu,
			event: oEvent
		});
		assert.ok(oEvent.preventDefault.calledOnce, "preventDefault on the given event object");

		assert.notOk(this.oBeforeOpenContextMenu.called, "beforeOpenContextMenu event");
	});

	QUnit.test("ContextMenuSetting plugin owner", function(assert) {
		return this.oTable.initialized(this.oTable).then(() => {
			assert.equal(this.oTable.getContextMenuSettingPluginOwner(), this.oTable._oTable,
				"The inner table is set as plugin owner for ContextMenuSetting");
		});
	});

	QUnit.module("Automatic column width calculation", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings, aPropertyInfos) {
			this.oTable = new Table({
				delegate: {
					name: "test-resources/sap/ui/mdc/delegates/odata/v4/TableDelegate",
					payload: {
						collectionPath: "/testPath",
						propertyInfo: aPropertyInfos
					}
				},
				enableAutoColumnWidth: true,
				...mSettings
			});

			return this.oTable;
		}
	});

	QUnit.test("Column widths", async function(assert) {
		const oCanvasContext = document.createElement("canvas").getContext("2d");
		oCanvasContext.font = [
			parseFloat(ThemeParameters.get({name: "sapMFontMediumSize"}) || "0.875rem") * parseFloat(MLibrary.BaseFontSize) + "px",
			ThemeParameters.get({name: "sapUiFontFamily"}) || "Arial"
		].join(" ");

		const fPadding = 1.0625;
		const measureText = function(sRefText) {
			return oCanvasContext.measureText(sRefText).width / 16;
		};
		const check = function(sRefText, fOrigWidth, fRange) {
			// length of 5 chars  ~ 3.159rem
			// length of 10 chars ~ 6.318rem
			const fRefTextWidth = measureText(sRefText);
			return Math.abs(fRefTextWidth - fOrigWidth) <= (fRange || 0.5);
		};

		this.createTable({
			columns: [
				new Column({
					id: "firstName",
					width: "10rem",
					header: "First name",
					propertyKey: "firstName"
				}),
				new Column({
					id: "lastName",
					header: "Last name",
					propertyKey: "lastName"
				}),
				new Column({
					id: "fullName",
					header: "Full name",
					propertyKey: "fullName"
				}),
				new Column({
					id: "numberValue",
					header: "Number value",
					propertyKey: "numberValue"
				}),
				new Column({
					id: "booleanValue",
					header: "Boolean value",
					propertyKey: "booleanValue"
				}),
				new Column({
					id: "columnGap1",
					header: "Test gap",
					propertyKey: "columnGap1"
				}),
				new Column({
					id: "columnGap2",
					header: "Test gap",
					propertyKey: "columnGap2"
				}),
				new Column({
					id: "noWidthCalculation",
					header: "No Width Calculation",
					propertyKey: "noWidthCalculation"
				}),
				new Column({
					id: "complexNoWidthCalculation",
					header: "Complex No Width Calculation",
					propertyKey: "complexNoWidthCalculation"
				}),
				new Column({
					id: "stringValue_nomaxlength",
					header: "stringValue_nomaxlength",
					propertyKey: "stringValue_nomaxlength"
				}),
				new Column({
					id: "stringValue_bigmaxlength",
					header: "stringValue_bigmaxlength",
					propertyKey: "stringValue_bigmaxlength"
				}),
				new Column({
					id: "stringValue_nolabeltruncate",
					header: "stringValue_nolabeltruncate",
					propertyKey: "stringValue_nolabeltruncate"
				}),
				new Column({
					id: "column_required",
					header: "a",
					propertyKey: "a",
					required: true
				}),
				new Column({
					id: "column_withoutAIAction",
					header: "AIColumn",
					propertyKey: "columnAIAction"
				}),
				new Column({
					id: "column_withAIAction",
					header: "AIColumn",
					propertyKey: "columnAIAction",
					dependents: new ColumnAIAction()
				})
			]
		}, [{
			key: "firstName",
			path: "firstName",
			label: "First name",
			dataType: "Edm.String",
			constraints: {maxLength: 30},
			visualSettings: {
				widthCalculation: {
					minWidth: 4,
					maxWidth: 10
				}
			}
		}, {
			key: "lastName",
			path: "lastName",
			label: "Last name",
			dataType: "Edm.String",
			constraints: {maxLength: 30},
			visualSettings: {
				widthCalculation: {
					minWidth: 6,
					maxWidth: 8
				}
			}
		}, {
			key: "fullName",
			label: "Full name",
			propertyInfos: ["firstName", "lastName"],
			visualSettings: {
				widthCalculation: {
					verticalArrangement: true
				}
			}
		}, {
			key: "numberValue",
			label: "Number value",
			dataType: "Edm.Byte",
			visualSettings: {
				widthCalculation: {
					includeLabel: false
				}
			}
		}, {
			key: "booleanValue",
			label: "Boolean value",
			dataType: "Edm.Boolean",
			visualSettings: {
				widthCalculation: {
					includeLabel: false,
					minWidth: 1
				}
			}
		}, {
			key: "columnGap1",
			label: "Test gap",
			dataType: "Edm.String",
			constraints: {maxLength: 32},
			visualSettings: {
				widthCalculation: {
					gap: 2
				}
			}
		}, {
			key: "columnGap2",
			label: "Test gap",
			dataType: "Edm.String",
			constraints: {maxLength: 32}
		}, {
			key: "noWidthCalculation",
			label: "No Width Calculation",
			dataType: "Edm.String",
			visualSettings: {
				widthCalculation: null
			}
		}, {
			key: "complexNoWidthCalculation",
			label: "Complex with no width calculation",
			propertyInfos: ["lastName", "noWidthCalculation"],
			visualSettings: {
				widthCalculation: {
					includeLabel: false
				}
			}
		}, {
			key: "stringValue_nomaxlength",
			label: "String",
			dataType: "Edm.String"
		}, {
			key: "stringValue_bigmaxlength",
			label: "String",
			dataType: "Edm.String",
			constraints: {maxLength: 255}
		}, {
			key: "stringValue_nolabeltruncate",
			label: "stringValue_nolabeltruncate",
			dataType: "Edm.String",
			constraints: {maxLength: 5},
			visualSettings: {
				widthCalculation: {
					truncateLabel: false
				}
			}
		}, {
			key: "a",
			label: "a",
			dataType: "Edm.Boolean",
			visualSettings: {
				widthCalculation: {
					minWidth: 1
				}
			}
		}, {
			key: "columnAIAction",
			label: "AI Action",
			dataType: "Edm.String",
			constraints: {maxLength: 5}
		}]);
		await this.oTable.initialized();
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		await this.oTable._fullyInitialized();
		await this.oTable.propertiesFinalized();
		await wait(100);

		const oPropertyHelper = this.oTable.getPropertyHelper();
		const aColumns = this.oTable.getColumns();
		const getInnerColumnWidth = function(oMDCColumn) {
			return oMDCColumn.getInnerColumn().getWidth();
		};

		// 1st column must have a width of 10rem due of its predefined
		assert.equal(parseFloat(getInnerColumnWidth(aColumns[0])) + "rem", "10rem", "Table inner column firstName width is 10rem");

		// 2nd column maxLength of 30 exceeds a maxWidth of 8
		assert.notOk(check("A".repeat(30), parseFloat(getInnerColumnWidth(aColumns[1]))), "Column lastName would exceed maxWidth of 8rem");
		assert.equal((parseFloat(getInnerColumnWidth(aColumns[1])) - fPadding) + "rem", "8rem", "Table inner column lastName width is 8rem");

		// 3th column is complex with vertical alignment and exceed maxWidth of 10rem of column firstName
		assert.notOk(check("A".repeat(30), parseFloat(getInnerColumnWidth(aColumns[2]))), "Column fullName would exceed maxWidth of 10rem");
		assert.equal((parseFloat(getInnerColumnWidth(aColumns[2])) - fPadding) + "rem", "10rem",
			"Table inner column fullName calculated width is 10rem");

		// 4th column width is 2rem, the default minWidth, due Edm.Byte has a limit of 3 chars ~ 1.459rem
		let sPropertyName = aColumns[3].getPropertyKey();
		let oProperty = oPropertyHelper.getProperty(sPropertyName);

		const sWidth = oPropertyHelper._calcColumnWidth(oProperty, aColumns[3]);
		assert.equal(sWidth, aColumns[3]._oSettingsModel.getProperty("/calculatedWidth"), "calculatedWidth for numberValue width is " + sWidth);
		assert.equal(sWidth, getInnerColumnWidth(aColumns[3]), "Column numberValue width is " + sWidth);

		// 5th column is in correct range due of type boolean
		assert.ok(check("Yes", parseFloat(getInnerColumnWidth(aColumns[4])) - fPadding),
			"Column booleanValue width calculated correctly");

		// by side of the gap, columnGap1 and columnGap2 are identical
		sPropertyName = aColumns[5].getPropertyKey();
		oProperty = oPropertyHelper.getProperty(sPropertyName);
		assert.equal(getInnerColumnWidth(aColumns[5]),
			parseFloat(getInnerColumnWidth(aColumns[6])) + oProperty.visualSettings.widthCalculation.gap + "rem",
			"Additional gap of " + oProperty.visualSettings.widthCalculation.gap + "rem for Column columnGap1 is calculated correctly");

		// visualSettings.widthCalculation=null
		assert.notOk(getInnerColumnWidth(aColumns[7]), "There is no width set since visualSettings.widthCalculation=null");

		// complex property with visualSettings.widthCalculation=null
		assert.equal(getInnerColumnWidth(aColumns[8]), getInnerColumnWidth(aColumns[1]),
			"Width calculation in complex property with visualSettings.widthCalculation=null is ignored");

		assert.equal(getInnerColumnWidth(aColumns[9]), 19 + fPadding + "rem", "String type without maxLength gets maxWidth");
		assert.equal(getInnerColumnWidth(aColumns[10]), 19 + fPadding + "rem", "String type with big maxLength gets maxWidth");

		assert.ok(measureText(aColumns[11].getHeader()) <= parseFloat(getInnerColumnWidth(aColumns[11])) - fPadding,
			"The header is not truncated and the column width is as wide as the header");

		// 12th column. required "*" is added to column
		assert.ok(check("Yes*", parseFloat(getInnerColumnWidth(aColumns[12])) - fPadding - 0.125 /* subtract padding from marker */),
			"Heaeder has correct width when using 'required' property");

		// ai action columns
		assert.ok(parseFloat(getInnerColumnWidth(aColumns[13])) < parseFloat(getInnerColumnWidth(aColumns[14])),
			"AIAction column is wider than no AIAction column");
	});

	QUnit.test("Column widths; TreeTableType", async function(assert) {
		const aPropertyInfos = [{
			key: "firstName",
			path: "firstName",
			label: "First name",
			dataType: "Edm.String",
			constraints: {maxLength: 30}
		}, {
			key: "lastName",
			path: "lastName",
			label: "Last name",
			dataType: "Edm.String",
			constraints: {maxLength: 30}
		}];
		const createTableConfig = function() {
			return {
				enableAutoColumnWidth: true,
				columns: [
					new Column({
						header: "First name",
						propertyKey: "firstName"
					}),
					new Column({
						header: "Last name",
						propertyKey: "lastName"
					})
				]
			};
		};

		const oTable = this.createTable({
			...createTableConfig()
		}, aPropertyInfos);
		const oTreeTable = this.createTable({
			type: TableType.TreeTable,
			...createTableConfig()
		}, aPropertyInfos);

		await Promise.all([
			oTable.propertiesFinalized(),
			oTreeTable.propertiesFinalized()
		]);
		await wait(0); // PropertyBinding needs time to update the width property

		const aTableColumns = oTable.getColumns().map((oColumn) => oColumn.getInnerColumn());
		const aTreeTableColumns = oTreeTable.getColumns().map((oColumn) => oColumn.getInnerColumn());
		const [oFirstColumn, oSecondColumn] = aTableColumns;
		const [oFirstTreeTableColumn, oSecondTreeTableColumn] = aTreeTableColumns;

		assert.ok(parseFloat(oFirstTreeTableColumn.getWidth()) > parseFloat(oFirstColumn.getWidth()), "The first TreeTable column has larger width");
		assert.equal(oSecondTreeTableColumn.getWidth(), oSecondColumn.getWidth(), "The column width is not changed for the the second column");

		oTable.destroy();
		oTreeTable.destroy();
	});

	QUnit.module("Export", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings, aPropertyInfos) {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath",
						propertyInfo: aPropertyInfos
					}
				},
				...mSettings
			});
		}
	});

	QUnit.test("Export button handling on initialization when export is disabled", async function(assert) {
		this.createTable();

		assert.notOk(this.oTable._oExportButton, "Export button does not exist before initialization");

		await this.oTable.initialized();
		assert.notOk(this.oTable._oExportButton, "Export button does not exist after initialization");
	});

	QUnit.test("Export button handling on initialization when export is enabled", async function(assert) {
		this.createTable({
			enableExport: true
		});

		assert.notOk(this.oTable._oExportButton, "Export button does not exist before table initialization");

		await this.oTable.initialized();
		assert.ok(this.oTable._oExportButton, "Export button exists after initialization");
		assert.ok(this.oTable._oExportButton.isA("sap.m.MenuButton"), "Is a sap.m.MenuButton");
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Is child of the toolbar");
		assert.ok(this.oTable._oExportButton.getVisible(), "Is visible");

		assert.equal(FESRHelper.getSemanticStepname(this.oTable._oExportButton, "defaultAction"), "OI:QE", "Correct FESR StepName");
		const oMenu = this.oTable._oExportButton.getMenu();
		assert.equal(oMenu.getItems().length, 2, "Export MenuButton has 2 actions");
		assert.equal(FESRHelper.getSemanticStepname(oMenu.getItems()[0], "press"), "OI:QE", "Correct FESR StepName - Menu Item 1");
		assert.equal(FESRHelper.getSemanticStepname(oMenu.getItems()[1], "press"), "OI:EXP:SETTINGS", "Correct FESR StepName - Menu Item 2");
	});

	QUnit.test("Export button handling on initialization when export is enabled but not supported by the delegate", async function(assert) {
		this.createTable({
			enableExport: true
		});

		const oDelegate = await this.oTable.awaitControlDelegate();
		sinon.stub(oDelegate, "getSupportedFeatures").returns({p13nModes: [], "export": false});

		await this.oTable.initialized();
		assert.notOk(this.oTable._oExportButton, "Export button does not exist after table initialization");

		this.oTable.getControlDelegate().getSupportedFeatures.restore();
	});

	QUnit.test("Export button handling when enabling/disabling export after initialization", async function(assert) {
		this.createTable();

		await this.oTable.initialized();
		this.oTable.setEnableExport(true);
		assert.ok(this.oTable._oExportButton, "Enabled: Export button exists");
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Enabled: Is child of the toolbar");
		assert.ok(this.oTable._oExportButton.getVisible(), "Enabled: Is visible");

		this.oTable.setEnableExport(false);
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Disabled: Is child of the toolbar");
		assert.notOk(this.oTable._oExportButton.getVisible(), "Disabled: Is invisible");

		this.oTable.setEnableExport(true);
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Enabled: Is child of the toolbar");
		assert.ok(this.oTable._oExportButton.getVisible(), "Enabled: Is visible");
	});

	QUnit.test("Export button handling when enabling export after initialization but not supported by the delegate", async function(assert) {
		this.createTable();

		const oDelegate = await this.oTable.awaitControlDelegate();
		sinon.stub(oDelegate, "getSupportedFeatures").returns({p13nModes: [], "export": false});

		await this.oTable.initialized();
		this.oTable.setEnableExport(true);
		assert.notOk(this.oTable._oExportButton, "Export button does not exist");

		this.oTable.getControlDelegate().getSupportedFeatures.restore();
	});

	QUnit.test("Export button handling when changing the table type", async function(assert) {
		this.createTable({
			enableExport: true
		});

		const oDelegate = await this.oTable.awaitControlDelegate();
		sinon.stub(oDelegate, "getSupportedFeatures").returns({p13nModes: [], "export": false});

		await this.oTable.initialized();
		assert.notOk(this.oTable._oExportButton, "Export button does not exist");

		this.oTable.getControlDelegate().getSupportedFeatures.returns({p13nModes: [], "export": true});
		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();
		const oExportButton = this.oTable._oExportButton;
		assert.ok(this.oTable._oExportButton,
			"Export button exists after changing to a type for which the delegate does support export");
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Export button is a child of the toolbar");
		assert.ok(this.oTable._oExportButton.getVisible(), "Export button is visible");

		this.oTable.getControlDelegate().getSupportedFeatures.returns({p13nModes: [], "export": false});
		this.oTable.setType(TableType.Table);
		await this.oTable.initialized();
		assert.notOk(this.oTable._oExportButton.getVisible(),
			"Export button is invisible after changing to a type for which the delegate does not support export");
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Export button is a child of the toolbar");
		assert.equal(oExportButton, this.oTable._oExportButton, "Same button instance is used");

		this.oTable.getControlDelegate().getSupportedFeatures.returns({p13nModes: [], "export": true});
		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();
		assert.ok(this.oTable._oExportButton.getVisible(),
			"Export button is visible after changing to a type for which the delegate supports export");
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Export button is a child of the toolbar");
		assert.equal(oExportButton, this.oTable._oExportButton, "Same button instance is used");

		this.oTable.getControlDelegate().getSupportedFeatures.restore();
	});

	QUnit.test("Export button initialization with toolbar actions", async function(assert) {
		this.createTable({
			action: new Text(),
			enableExport: true
		});

		// Aggregation forwarding will cause the creation of the ActionToolbar. The export button will not be added at this point, because
		// the delegate is not yet loaded. The button has to be added to the toolbar when the rest of the content is created.

		const oDelegate = await this.oTable.awaitControlDelegate();
		sinon.stub(oDelegate, "getSupportedFeatures").returns({p13nModes: [], "export": true});

		await this.oTable.initialized();
		assert.ok(this.oTable._oExportButton, "Export button exists after initialization with toolbar actions");
		assert.strictEqual(this.oTable._oExportButton.getParent(), this.oTable._oToolbar, "Export button is a child of the toolbar");
		assert.ok(this.oTable._oExportButton.isA("sap.m.OverflowToolbarMenuButton"), "Export button is an OverflowToolbarMenuButton");
		assert.ok(this.oTable._oExportButton.getVisible(), "Export button is visible");

		this.oTable.getControlDelegate().getSupportedFeatures.restore();
	});

	QUnit.skip("Trigger export; No visible columns (TODO: SHOULD BE AN OPA TEST!)", async function(assert) {
		this.createTable({
			enableExport: true
		});
		this.spy(this.oTable, "_onExport");

		await TableQUnitUtils.waitForBinding(this.oTable);

		await new Promise((resolve) => {
			sap.ui.require([
				"sap/m/MessageBox"
			], (MessageBox) => {
				this.stub(MessageBox, "error").callsFake(function() {
					assert.ok(this.oTable._onExport.calledOnce, "_onExport called");
					assert.ok(MessageBox.error.calledOnce);
					MessageBox.error.restore();
					resolve();
				});
				this.oTable._oExportButton.fireDefaultAction();
			});
		});
	});

	QUnit.test("Trigger 'Export' via API", async function(assert) {
		this.createTable({
			enableExport: false
		});
		this.oTable.placeAt("qunit-fixture");
		await this.oTable.initialized();
		await nextUIUpdate();

		const oOnExportSpy = this.spy(this.oTable, "_onExport");

		assert.expect(3);

		const oPromise = this.oTable.triggerExport();
		try {
			await oPromise;
			assert.ok(false, "Promise should be rejected");
		} catch (oError) {
			assert.ok(true, "Promise rejected");
		}

		assert.ok(oOnExportSpy.notCalled, "_onExport not called");

		this.oTable.setEnableExport(true);
		this.oTable.triggerExport();

		await new Promise((resolve) => {
			sap.ui.require([
				"sap/m/MessageBox"
			], (MessageBox) => {
				this.stub(MessageBox, "error").callsFake(function() {
					assert.ok(oOnExportSpy.calledOnce, "_onExport called");
					MessageBox.error.restore();
					resolve();
				});
			});
		});
	});

	QUnit.test("Trigger 'Export as' via keyboard shortcut", async function(assert) {
		this.createTable({
			enableExport: true
		});
		this.oTable.placeAt("qunit-fixture");
		await this.oTable.initialized();
		await nextUIUpdate();

		sinon.stub(this.oTable, "_onExport");

		assert.ok(!this.oTable._oExportButton.getEnabled(), "Binding length is 0: Button disabled");

		// trigger CTRL + SHIFT + E keyboard shortcut
		QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
		assert.ok(this.oTable._onExport.notCalled, "Export button is disabled: Export not triggered");

		this.oTable._oExportButton.setEnabled(true);

		// trigger CTRL + SHIFT + E keyboard shortcut
		QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
		assert.ok(this.oTable._onExport.calledWith(true), "Export settings dialog opened");

		sinon.stub(this.oTable.getControlDelegate(), "getSupportedFeatures").returns({p13nModes: [], "export": false});
		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();

		this.oTable._onExport.resetHistory();
		QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
		assert.ok(this.oTable._onExport.notCalled, "Export is not supported by delegate: Export not triggered");

		this.oTable.getControlDelegate().getSupportedFeatures.restore();
	});

	QUnit.test("beforeExport event", async function(assert) {
		const fnSetLabel = this.stub();
		const fnSetType = this.stub();
		const oFakeExportHandlerEvent = sinon.createStubInstance(UI5Event);

		oFakeExportHandlerEvent.getParameter.withArgs("exportSettings").returns({});
		oFakeExportHandlerEvent.getParameter.withArgs("userExportSettings").returns({
			splitCells: false,
			includeFilterSettings: true
		});
		oFakeExportHandlerEvent.getParameter.withArgs("filterSettings").returns([{
			getProperty: this.stub().returns("SampleField"),
			setLabel: fnSetLabel,
			setType: fnSetType
		}]);

		this.createTable({
			beforeExport: (oEvent) => {
				const mExportSettings = oEvent.getParameter("exportSettings");
				const mUserSettings = oEvent.getParameter("userExportSettings");
				const aFilterSettings = oEvent.getParameter("filterSettings");

				assert.ok(mExportSettings, "Export settings defined");
				assert.ok(mUserSettings, "User settings defined");
				assert.ok(aFilterSettings, "Filter settings defined");
				assert.ok(Array.isArray(aFilterSettings), "Filter settings defined");

				assert.ok(fnSetLabel.called, "Filter#setLabel was called");
				assert.ok(fnSetLabel.calledWith("SampleLabel"), "Filter#setLabel was called with correct value");
				assert.ok(fnSetType.called, "Filter#setType was called");
				assert.ok(fnSetType.calledWith(this.oTable.getPropertyHelper().getProperty("SampleField").typeConfig.typeInstance),
					"Filter#setType was called with the expected type instance");

				oEvent.preventDefault();
			}
		}, [{
			key: "SampleField",
			path: "SampleField",
			label: "SampleLabel",
			dataType: "String"
		}]);
		await this.oTable._fullyInitialized();

		this.oTable._onBeforeExport(oFakeExportHandlerEvent);
		assert.ok(oFakeExportHandlerEvent.preventDefault.calledOnce, "Prevent default has been forwarded to the ExportHandler event");
	});

	QUnit.test("#_getExportHandler", async function(assert) {
		this.createTable();
		await this.oTable.initialized();

		const oFetchExportCapabilities = this.spy(this.oTable.getControlDelegate(), "fetchExportCapabilities");

		/* Create fake ExportHandler class because dependency to sapui5.runtime is not possible */
		const FakeExportHandler = function() {};
		FakeExportHandler.prototype.isA = function(sClass) { return sClass === "sap.ui.export.ExportHandler"; };
		FakeExportHandler.prototype.attachBeforeExport = this.stub();

		this.stub(Library, "load").withArgs({name: "sap.ui.export"}).resolves();
		this.stub(sap.ui, "require").withArgs(["sap/ui/export/ExportHandler"]).callsFake(function(aDependencies, fnCallback) {
			fnCallback(FakeExportHandler);
		});

		assert.ok(Library.load.notCalled, "Not called yet");
		assert.ok(oFetchExportCapabilities.notCalled, "Not called yet");
		assert.notOk(this.oTable._oExportHandler, "No cached instance");

		let oHandler = await this.oTable._getExportHandler();

		assert.equal(Library.load.callCount, 1, "Library.load has been called once");
		assert.equal(oFetchExportCapabilities.callCount, 1, "fetchExportCapabilities has been called once");
		assert.ok(oHandler, "Variable is defined");
		assert.ok(this.oTable._oExportHandler, "Cached instance available");
		assert.ok(oHandler.attachBeforeExport.calledOnce, "ExportHandler#attachBeforeExport has been called once");
		assert.ok(oHandler.attachBeforeExport.calledWith(this.oTable._onBeforeExport, this.oTable),
			"Table._onBeforeExport has been attached as event handler");

		/* Reset spies */
		Library.load.reset();
		oFetchExportCapabilities.reset();
		assert.ok(Library.load.notCalled, "Not called yet");
		assert.ok(oFetchExportCapabilities.notCalled, "Not called yet");

		oHandler = await this.oTable._getExportHandler();

		assert.ok(Library.load.notCalled, "Not called again");
		assert.ok(oFetchExportCapabilities.notCalled, "Not called again");
		assert.ok(oHandler, "Variable is defined");
		assert.ok(oHandler.isA("sap.ui.export.ExportHandler"), "Parameter is a sap.ui.export.ExportHandler");
		assert.equal(oHandler, this.oTable._oExportHandler, "Cached instance has been returned");

		const oPromise = this.oTable._getExportHandler();
		assert.ok(oPromise instanceof Promise, "Promise was returned");

		await oPromise.then(function() {
			assert.ok(true, "Promise resolved");
		}).catch(function() {
			assert.ok(false, "Promise rejected");
		});

		Library.load.restore();
		oFetchExportCapabilities.restore();
		sap.ui.require.restore();
	});

	QUnit.test("#_getExportHandler when sap.ui.export is missing", async function(assert) {
		this.createTable();

		assert.expect(5);

		sinon.stub(Library, "load").returns(Promise.reject("test"));
		sinon.stub(MessageBox, "error");

		await this.oTable.initialized();
		await this.oTable._getExportHandler().catch((e) => {
			assert.ok(MessageBox.error.calledOnce, "MessageBox was called");

			assert.ok(MessageBox.error.calledWith(Library.getResourceBundleFor("sap.ui.mdc").getText("ERROR_MISSING_EXPORT_LIBRARY")),
				"Called with proper error message");
			assert.ok(e === "test", "Error thrown correctly");
		});

		const oPromise = this.oTable._getExportHandler();
		assert.ok(oPromise instanceof Promise, "Promise was returned");

		await oPromise.then(function() {
			assert.ok(false, "Promise resolved");
		}).catch(function() {
			assert.ok(true, "Promise rejected");
		});

		Library.load.restore();
		MessageBox.error.restore();
	});

	QUnit.test("#_createExportColumnConfiguration", async function(assert) {
		this.createTable({
			enableExport: true,
			columns: [
				new Column({
					id: "firstNameColumn",
					header: "First name",
					width: "10rem",
					propertyKey: "firstName",
					template: new Text({
						text: "{firstName}"
					})
				}),
				new Column({
					id: "lastNameColumn",
					header: "Last name",
					width: "10rem",
					propertyKey: "lastName",
					template: new Text({
						text: "{lastName}"
					})
				}),
				new Column({
					id: "fullName",
					header: "Full name",
					width: "15rem",
					propertyKey: "fullName",
					template: new Text({
						text: "{lastName}, {firstName}"
					})
				}),
				new Column({
					id: "fullNameExportSettings",
					header: "Full name 2",
					width: "15rem",
					propertyKey: "fullName2",
					template: new Text({
						text: "{lastName}, {firstName}"
					})
				}),
				new Column({
					id: "ageColumn",
					header: "Age",
					hAlign: "Right",
					width: "8rem",
					propertyKey: "age",
					template: new Text({
						text: "{age}"
					})
				}),
				new Column({
					id: "dobColumn",
					header: "Date of Birth",
					hAlign: "Right",
					width: "12rem",
					propertyKey: "dob",
					template: new Text({
						text: "{dob}"
					})
				}),
				new Column({
					id: "salaryColumn",
					header: "Salary",
					hAlign: "Right",
					width: "12rem",
					propertyKey: "salary",
					template: new Text({
						text: "{salary}"
					})
				}),
				new Column({
					id: "noDataColumn1",
					header: "NoDataColumn1",
					hAlign: "Begin",
					propertyKey: "noDataColumn1",
					template: new Button({
						text: "<"
					})
				}),
				new Column({
					id: "noDataColumn2",
					header: "NoDataColumn2",
					hAlign: "Begin",
					propertyKey: "noDataColumn2",
					template: new Button({
						text: ">"
					})
				}),
				new Column({
					id: "ignoreColumn",
					header: "IgnoreColumn",
					hAlign: "Begin",
					propertyKey: "ignoreColumn",
					template: new Text({
						text: "This text will not appear in the export"
					})
				})
			]
		}, [{
				key: "firstName",
				path: "firstName",
				label: "First name",
				dataType: "String",
				exportSettings: {
					width: 19,
					type: "String",
					label: "First_Name"
				}
			}, {
				key: "lastName",
				path: "lastName",
				label: "Last name",
				dataType: "String"
			}, {
				key: "fullName", // complex PropertyInfo without exportSettings => 2 spreadsheet column configs will be created
				label: "Full name",
				propertyInfos: ["firstName", "lastName"]
			}, {
				key: "fullName2", // complex PropertyInfo with exportSettings => 1 spreadsheet column config will be created
				label: "Name",
				propertyInfos: ["firstName", "lastName"],
				exportSettings: {
					template: "{0}, {1}"
				}
			}, {
				key: "age",
				path: "age",
				label: "Age",
				dataType: "String",
				exportSettings: {
					type: "Number"
				}
			}, {
				key: "dob",
				path: "dob",
				label: "dob",
				dataType: "String",
				exportSettings: {
					label: "Date of Birth",
					type: "Date",
					inputFormat: "YYYYMMDD",
					width: 15,
					template: "{0}"
				}
			}, {
				key: "salary",
				path: "salary",
				label: "Salary",
				dataType: "String",
				exportSettings: {
					displayUnit: true,
					unitProperty: "currency",
					template: "{0} {1}",
					width: 10,
					type: "Currency"
				}
			}, {
				key: "currency",
				path: "currency",
				label: "Currency code",
				dataType: "String",
				exportSettings: {
					width: 5
				}
			}, {
				key: "noDataColumn1",
				label: "NoDataColumn1",
				sortable: false,
				filterable: false,
				dataType: "String",
				exportSettings: {
					width: 5
				}
			}, {
				key: "noDataColumn2",
				label: "NoDataColumn2",
				sortable: false,
				filterable: false,
				dataType: "String"
			}, {
				key: "ignoreColumn",
				label: "IgnoreColumn",
				exportSettings: null,
				dataType: "String"
			}
		]);

		await nextUIUpdate();

		const aExpectedOutput = [{
			columnId: "firstNameColumn",
			property: ["firstName"],
			type: "String",
			label: "First_Name",
			width: 19,
			textAlign: "Begin"
		}, {
			columnId: "lastNameColumn",
			property: ["lastName"],
			type: "String",
			label: "Last name",
			width: 10,
			textAlign: "Begin"
		}, {
			columnId: "fullName",
			label: "First_Name",
			property: ["firstName"],
			textAlign: "Begin",
			type: "String",
			width: 19
		}, {
			columnId: "fullName-additionalProperty1",
			label: "Last name",
			property: ["lastName"],
			textAlign: "Begin",
			type: "String",
			width: 15
		}, {
			columnId: "fullNameExportSettings",
			label: "Name",
			property: ["firstName", "lastName"],
			template: "{0}, {1}",
			textAlign: "Begin",
			type: "String",
			width: 15
		}, {
			columnId: "ageColumn",
			property: ["age"],
			type: "Number",
			label: "Age",
			width: 8,
			textAlign: "Right"
		}, {
			columnId: "dobColumn",
			property: ["dob"],
			type: "Date",
			label: "Date of Birth",
			width: 15,
			textAlign: "Right",
			template: "{0}",
			inputFormat: "YYYYMMDD"
		}, {
			columnId: "salaryColumn",
			displayUnit: true,
			label: "Salary",
			property: ["salary"],
			template: "{0} {1}",
			textAlign: "Right",
			unitProperty: "currency",
			width: 10,
			type: "Currency"
		}, {
			columnId: "noDataColumn1",
			label: "NoDataColumn1",
			property: [""],
			textAlign: "Begin",
			type: "String",
			width: 5
		}, {
			columnId: "noDataColumn2",
			label: "NoDataColumn2",
			property: [""],
			textAlign: "Begin",
			type: "String",
			width: ""
		}];

		await this.oTable.initialized();
		const aActualOutput = await this.oTable._createExportColumnConfiguration({fileName: 'Table header'});
		assert.deepEqual(aActualOutput, aExpectedOutput, "The export configuration was created as expected");
	});

	QUnit.module("Theming", {
		before: function() {
			this.sDefaultTheme = Theming.getTheme();
		},
		beforeEach: async function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				enableExport: true
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: async function() {
			await this.applyTheme(this.sDefaultTheme);
		},
		applyTheme: async function(sTheme) {
			const oThemeApplied = new Deferred();
			const fnThemeApplied = function() {
				Theming.detachApplied(fnThemeApplied);
				oThemeApplied.resolve();
			};

			Theming.setTheme(sTheme);
			Theming.attachApplied(fnThemeApplied);

			await oThemeApplied.promise;
		}
	});

	for (const sTheme of [
		"sap_horizon",
		"sap_horizon_dark",
		"sap_horizon_hcb",
		"sap_horizon_hcw",
		"sap_fiori_3"
	]) {
		QUnit.test(sTheme + "; Export button", async function(assert) {
			let sExpectedButtontype;

			switch (sTheme) {
				case "sap_horizon":
				case "sap_horizon_dark":
				case "sap_horizon_hcw":
				case "sap_horizon_hcb":
					sExpectedButtontype = ButtonType.Transparent;
					break;
				default:
					sExpectedButtontype = ButtonType.Ghost;
			}

			await this.applyTheme(sTheme);
			assert.deepEqual(this.oTable._oExportButton.getType(), sExpectedButtontype, "buttonType property");
		});

		QUnit.test(sTheme + "; Toolbar", async function(assert) {
			let sExpectedDesigntype;

			switch (sTheme) {
				case "sap_horizon":
				case "sap_horizon_dark":
				case "sap_horizon_hcw":
				case "sap_horizon_hcb":
					sExpectedDesigntype = ToolbarDesign.Solid;
					break;
				default:
					sExpectedDesigntype = ToolbarDesign.Transparent;
			}

			await this.applyTheme(sTheme);
			assert.deepEqual(this.oTable._oToolbar.getDesign(), sExpectedDesigntype, "design property");
		});

		QUnit.test(sTheme + "; Title", async function(assert) {
			const oVariantManagement = new VariantManagement();
			this.oTable.setVariant(oVariantManagement);

			let sExpectedTitleLevel;

			switch (sTheme) {
				case "sap_horizon":
				case "sap_horizon_dark":
				case "sap_horizon_hcw":
				case "sap_horizon_hcb":
					sExpectedTitleLevel = TitleLevel.H5;
					break;
				default:
					sExpectedTitleLevel = TitleLevel.H4;
			}
			await this.applyTheme(sTheme);
			assert.deepEqual(this.oTable._oTitle.getTitleStyle(), sExpectedTitleLevel, "titleStyle property");
			assert.deepEqual(this.oTable.getVariant().getTitleStyle(), sExpectedTitleLevel, "variant titleStyle property");
		});
	}
});