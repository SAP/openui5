/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/rowmodes/InteractiveRowMode",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/plugins/PluginBase",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/Device"
], function(
	TableQUnitUtils, InteractiveRowMode, Table, Column, RowAction, PluginBase, TableUtils, library, JSONModel, JSONListBinding, Device
) {
	"use strict";

	var VisibleRowCountMode = library.VisibleRowCountMode;
	var HeightTestControl = TableQUnitUtils.HeightTestControl;

	QUnit.module("Legacy support", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: VisibleRowCountMode.Interactive,
				visibleRowCount: 5,
				fixedRowCount: 1,
				fixedBottomRowCount: 2,
				minAutoRowCount: 3,
				rowHeight: 9
			});
			this.oMode = this.oTable._getRowMode();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		assert.ok(TableUtils.isA(this.oMode, "sap.ui.table.rowmodes.InteractiveRowMode"),
			"The table creates an instance of sap.ui.table.rowmodes.InteractiveRowMode");
	});

	QUnit.test("Property getters", function(assert) {
		var oTable = this.oTable;
		var oMode = this.oMode;

		assert.strictEqual(oMode.getRowCount(), 5, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 1, "The fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getMinRowCount(), 3, "The minimum row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 9, "The row content height is taken from the table");

		oMode.setRowCount(10);
		oMode.setFixedTopRowCount(10);
		oMode.setFixedBottomRowCount(10);
		oMode.setMinRowCount(10);
		oMode.setRowContentHeight(10);

		assert.strictEqual(oMode.getRowCount(), 5, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 1, "The fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getMinRowCount(), 3, "The minimum row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 9, "The row content height is taken from the table");

		oTable.setVisibleRowCount(10);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(3);
		oTable.setMinAutoRowCount(4);
		oTable.setRowHeight(14);

		assert.strictEqual(oMode.getRowCount(), 10, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 2, "The fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 3, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getMinRowCount(), 4, "The minimum row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 14, "The row content height is taken from the table");
	});

	QUnit.module("Row heights", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new InteractiveRowMode(),
				columns: [
					new Column({template: new HeightTestControl({height: "1px"})}),
					new Column({template: new HeightTestControl({height: "1px"})})
				],
				fixedColumnCount: 1,
				rowActionCount: 1,
				rowActionTemplate: new RowAction(),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Content row height", function(assert) {
		var oTable = this.oTable;
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var pSequence = Promise.resolve();

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		function test(mTestSettings) {
			pSequence = pSequence.then(function() {
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].setTemplate(new HeightTestControl({height: (mTestSettings.templateHeight || 1) + "px"}));
				oBody.classList.remove("sapUiSizeCozy");
				oBody.classList.remove("sapUiSizeCompact");
				oTable.removeStyleClass("sapUiSizeCondensed");

				if (mTestSettings.density != null) {
					if (mTestSettings.density === "sapUiSizeCondensed") {
						oBody.classList.add("sapUiSizeCompact");
						oTable.addStyleClass("sapUiSizeCondensed");
					} else {
						oBody.classList.add(mTestSettings.density);
					}
				}

				sap.ui.getCore().applyChanges();
				return oTable.qunit.whenRenderingFinished();

			}).then(function() {
				var sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
				mTestSettings.title += " (Density=\"" + sDensity + "\")";

				var aRowDomRefs = oTable.getRows()[0].getDomRefs();
				assert.strictEqual(aRowDomRefs.rowSelector.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Selector height is ok");
				assert.strictEqual(aRowDomRefs.rowFixedPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Fixed part height is ok");
				assert.strictEqual(aRowDomRefs.rowScrollPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Scrollable part height is ok");
				assert.strictEqual(aRowDomRefs.rowAction.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Action height is ok");
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Row height should be fixed to default height",
				density: sDensity,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});

			test({
				title: "Row height should be fixed to default height",
				density: sDensity,
				templateHeight: TableUtils.DefaultRowHeight[sDensity] * 2,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 20,
				expectedHeight: 21
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 20,
				templateHeight: 100,
				expectedHeight: 21
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 100,
				expectedHeight: 101
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 100,
				templateHeight: 120,
				expectedHeight: 101
			});
		});

		return pSequence.then(function() {
			oTable.destroy();
			oBody.classList.remove("sapUiSizeCompact");
			oBody.classList.add("sapUiSizeCozy");

			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});
	});

	QUnit.test("Header row height", function(assert) {
		var oTable = this.oTable;
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var pSequence = Promise.resolve();
		var iPadding = 14;

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		function test(mTestSettings) {
			pSequence = pSequence.then(function() {
				oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				oBody.classList.remove("sapUiSizeCozy");
				oBody.classList.remove("sapUiSizeCompact");
				oTable.removeStyleClass("sapUiSizeCondensed");

				if (mTestSettings.density != null) {
					if (mTestSettings.density === "sapUiSizeCondensed") {
						oBody.classList.add("sapUiSizeCompact");
						oTable.addStyleClass("sapUiSizeCondensed");
					} else {
						oBody.classList.add(mTestSettings.density);
					}
				}

				sap.ui.getCore().applyChanges();
				return oTable.qunit.whenRenderingFinished();

			}).then(function() {
				var sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
				mTestSettings.title += " (Density=\"" + sDensity + "\")";

				var aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
				var oColumnHeaderCnt = oTable.getDomRef().querySelector(".sapUiTableColHdrCnt");

				assert.strictEqual(aRowDomRefs[0].getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Fixed part height is ok");
				assert.strictEqual(aRowDomRefs[1].getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Scrollable part height is ok");
				assert.strictEqual(oColumnHeaderCnt.getBoundingClientRect().height, mTestSettings.expectedHeight + 1 /* border */,
					mTestSettings.title + ": Column header container height is ok");
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});

			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				rowContentHeight: 55,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity === "sapUiSizeCondensed" ? "sapUiSizeCompact" : sDensity]
			});

			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				columnHeaderHeight: 55,
				expectedHeight: 55
			});
		});

		return pSequence.then(function() {
			oTable.destroy();
			oBody.classList.remove("sapUiSizeCompact");
			oBody.classList.add("sapUiSizeCozy");

			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});
	});

	QUnit.module("Get contexts", {
		beforeEach: function() {
			this.oGetContextsSpy = sinon.spy(JSONListBinding.prototype, "getContexts");
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new InteractiveRowMode(),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});
		},
		afterEach: function() {
			this.oGetContextsSpy.restore();
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		var oGetContextsSpy = this.oGetContextsSpy;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Binding#getContexts called once"); // render
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100, undefined), "All calls to Binding#getContexts consider the rendered row count");
		});
	});

	QUnit.module("Row count constraints", {
		before: function() {
			this.TestPlugin = PluginBase.extend("sap.ui.table.plugins.test.Plugin");
		},
		beforeEach: function() {
			this.oPlugin = new this.TestPlugin();
			this.oRowMode = new InteractiveRowMode();
			this.oTable = TableQUnitUtils.createTable({
				dependents: [this.oPlugin],
				rowMode: this.oRowMode,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [TableQUnitUtils.createTextColumn()]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Force fixed rows", function(assert) {
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 1, 8, 1);
		}.bind(this));
	});

	QUnit.test("Force fixed rows if row count too low", function(assert) {
		this.oRowMode.setRowCount(1);
		this.oRowMode.setMinRowCount(1);
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 1, 0);
		}.bind(this));
	});

	QUnit.test("Disable fixed rows", function(assert) {
		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oPlugin.setRowCountConstraints({fixedTop: false, fixedBottom: false});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 10, 0);
		}.bind(this));
	});

	QUnit.test("Change constraints", function(assert) {
		var that = this;

		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oPlugin.setRowCountConstraints({fixedTop: false, fixedBottom: false});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.oPlugin.setRowCountConstraints({fixedTop: false});
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertRenderedRows(assert, that.oTable, 0, 8, 2);
		});
	});
});
