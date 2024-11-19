/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/qunit/rowmodes/shared/FixedRowHeight",
	"sap/ui/table/qunit/rowmodes/shared/RowCountConstraints",
	"sap/ui/table/qunit/rowmodes/shared/RowsUpdated",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/CreationRow",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	FixedRowHeightTest,
	RowCountConstraintsTest,
	RowsUpdatedTest,
	AutoRowMode,
	Table,
	Column,
	CreationRow,
	TableUtils,
	Device
) {
	"use strict";

	const HeightTestControl = TableQUnitUtils.HeightTestControl;
	const aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];

	TableQUnitUtils.setDefaultSettings({
		rowMode: new AutoRowMode(),
		rows: {path: "/"}
	});

	function waitForResizeHandler() {
		// Give the table time to react. Default interval of IntervalTrigger singleton that is used by the ResizeHandler is 200ms.
		return TableQUnitUtils.wait(250);
	}

	/**
	 * @deprecated As of version 1.119
	 */
	QUnit.module("Legacy support", {
		before: function() {
			this.mDefaultSettings = TableQUnitUtils.getDefaultSettings();
			TableQUnitUtils.setDefaultSettings();
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: "Auto",
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			TableQUnitUtils.setDefaultSettings(this.mDefaultSettings);
		},
		getDefaultRowMode: function(oTable) {
			return oTable.getAggregation("_hiddenDependents").filter((oObject) => oObject.isA("sap.ui.table.rowmodes.Auto"))[0];
		}
	});

	QUnit.test("Instance", function(assert) {
		assert.ok(TableUtils.isA(this.getDefaultRowMode(this.oTable), "sap.ui.table.rowmodes.Auto"),
			"The table creates an instance of sap.ui.table.rowmodes.Auto");
	});

	QUnit.test("Property getters", function(assert) {
		const oTable = TableQUnitUtils.createTable({
			visibleRowCountMode: "Auto",
			fixedRowCount: 1,
			fixedBottomRowCount: 2,
			minAutoRowCount: 8,
			rowHeight: 9
		});
		const oMode = this.getDefaultRowMode(oTable);

		oTable.setProperty("visibleRowCount", 5);

		assert.strictEqual(oMode.getFixedTopRowCount(), 1, "The fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getMinRowCount(), 8, "The minimum row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 9, "The row content height is taken from the table");

		oMode.setFixedTopRowCount(10);
		oMode.setFixedBottomRowCount(10);
		oMode.setMinRowCount(10);
		oMode.setRowContentHeight(10);

		assert.strictEqual(oMode.getFixedTopRowCount(), 1,
			"After setting the property on the mode, the fixed row count is still taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2,
			"After setting the property on the mode, the fixed bottom row count is still taken from the table");
		assert.strictEqual(oMode.getMinRowCount(), 8,
			"After setting the property on the mode, the minimum row count is still taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 9,
			"After setting the property on the mode, the row content height is still taken from the table");

		oTable.setProperty("visibleRowCount", 10);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(3);
		oTable.setMinAutoRowCount(13);
		oTable.setRowHeight(14);

		assert.strictEqual(oMode.getFixedTopRowCount(), 2,
			"After setting the property on the table, the new fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 3,
			"After setting the property on the table, the new fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getMinRowCount(), 13,
			"After setting the property on the table, the new minimum row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 14,
			"After setting the property on the table, the new row content height is taken from the table");

		oTable.destroy();
	});

	QUnit.test("After rendering", function(assert) {
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(this.oTable.getRows().length, 19, "Row count");
			assert.equal(this.oTable.getVisibleRowCount(), 19, "'visibleRowCount' property value");
		}.bind(this));
	});

	QUnit.test("Row height", function(assert) {
		const oTable = this.oTable;
		let sequence = Promise.resolve();

		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));

		function test(mTestSettings) {
			sequence = sequence.then(async function() {
				oTable.setRowHeight(mTestSettings.rowHeight || 0);
				oTable.getColumns()[1].setTemplate(new HeightTestControl({height: (mTestSettings.templateHeight || 1) + "px"}));
				await oTable.qunit.setDensity(mTestSettings.density);
				TableQUnitUtils.assertRowHeights(assert, oTable, mTestSettings);
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Default height",
				density: sDensity,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Default height; With large content",
				density: sDensity,
				templateHeight: TableUtils.DefaultRowHeight[sDensity] * 2,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity] * 2 + 1
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Less than default",
				density: sDensity,
				rowHeight: 20,
				expectedHeight: 21
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Less than default; With large content",
				density: sDensity,
				rowHeight: 20,
				templateHeight: 100,
				expectedHeight: 21
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Greater than default",
				density: sDensity,
				rowHeight: 100,
				expectedHeight: 101
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Greater than default; With large content",
				density: sDensity,
				rowHeight: 100,
				templateHeight: 120,
				expectedHeight: 101
			});
		});

		return sequence.then(function() {
			oTable.qunit.resetDensity();
		});
	});

	QUnit.module("Automatic row count adjustment", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				extension: [
					new HeightTestControl({height: "100px"})
				],
				footer: new HeightTestControl({height: "100px"}),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				creationRow: new CreationRow()
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("After rendering", function(assert) {
		assert.equal(this.oTable.getRows().length, 13, "Row count");
	});

	QUnit.test("Resize", function(assert) {
		const that = this;

		return this.oTable.qunit.resize({height: "765px"}).then(function() {
			assert.equal(that.oTable.getRows().length, 9, "Row count after decreasing height");
		}).then(this.oTable.qunit.resetSize).then(function() {
			assert.equal(that.oTable.getRows().length, 13, "Row count after increasing height");
		});
	});

	QUnit.test("Changing visibility of an extension", function(assert) {
		const that = this;

		this.oTable.getExtension()[0].setVisible(false);

		return waitForResizeHandler().then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable.getRows().length, 15, "Row count after hiding an extension");
			that.oTable.getExtension()[0].setVisible(true);
		}).then(waitForResizeHandler).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable.getRows().length, 13, "Row count after showing an extension");
		});
	});

	QUnit.test("Changing visibility of the footer", function(assert) {
		const that = this;

		this.oTable.getFooter().setVisible(false);

		return waitForResizeHandler().then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable.getRows().length, 15, "Row count after hiding the footer");
			that.oTable.getFooter().setVisible(true);
		}).then(waitForResizeHandler).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable.getRows().length, 13, "Row count after showing the footer");
		});
	});

	QUnit.test("Changing visibility of the creation row", function(assert) {
		const that = this;

		this.oTable.getCreationRow().setVisible(false);

		return waitForResizeHandler().then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable.getRows().length, 14, "Row count after hiding the creation row");
			that.oTable.getCreationRow().setVisible(true);
		}).then(waitForResizeHandler).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable.getRows().length, 13, "Row count after showing the creation row");
		});
	});

	QUnit.test("Elements with margins", async function(assert) {
		this.oTable.getExtension()[0].addStyleClass("sapUiLargeMargin");
		this.oTable.addExtension(this.oTable.getExtension()[0].clone());
		this.oTable.getFooter().addStyleClass("sapUiLargeMargin");
		this.oTable.destroyAggregation("creationRow");
		await this.oTable.qunit.whenRenderingFinished();

		const oTableContainer = this.oTable.getDomRef().parentNode;

		assert.equal(oTableContainer.clientHeight, oTableContainer.scrollHeight, "The table container has no vertical overflow");
	});

	QUnit.module("Hide empty rows", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [
					new Column({template: new HeightTestControl({height: "1px"})}),
					new Column({template: new HeightTestControl({height: "1px"})})
				],
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialize with hideEmptyRows=false", function(assert) {
		const oDisableNoDataSpy = sinon.spy(AutoRowMode.prototype, "disableNoData");
		const oEnableNoDataSpy = sinon.spy(AutoRowMode.prototype, "enableNoData");
		const oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setAggregation("rowMode", new AutoRowMode().setHideEmptyRows(false));

		assert.ok(oDisableNoDataSpy.notCalled, "#disableNoData was not called");
		assert.ok(oEnableNoDataSpy.calledOnce, "#enableNoData was called once");
		assert.notOk(this.oTable.getRowMode().isNoDataDisabled(), "NoData is enabled");
		assert.ok(oTableInvalidateSpy.calledOnce, "Table is invalidated");

		oDisableNoDataSpy.restore();
		oEnableNoDataSpy.restore();
		oTableInvalidateSpy.restore();
	});

	QUnit.test("Initialize with hideEmptyRows=true", function(assert) {
		const oDisableNoDataSpy = sinon.spy(AutoRowMode.prototype, "disableNoData");
		const oEnableNoDataSpy = sinon.spy(AutoRowMode.prototype, "enableNoData");
		const oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setAggregation("rowMode", new AutoRowMode().setHideEmptyRows(true));

		assert.ok(oDisableNoDataSpy.calledOnce, "#disableNoData was called once");
		assert.ok(oEnableNoDataSpy.notCalled, "#enableNoData was not called");
		assert.ok(this.oTable.getRowMode().isNoDataDisabled(), "NoData is disabled");
		assert.ok(oTableInvalidateSpy.calledOnce, "Table is invalidated");

		oDisableNoDataSpy.restore();
		oEnableNoDataSpy.restore();
		oTableInvalidateSpy.restore();
	});

	QUnit.test("Change 'hideEmptyRows' property", function(assert) {
		const oRowMode = new AutoRowMode();
		const oDisableNoData = sinon.spy(oRowMode, "disableNoData");
		const oEnableNoData = sinon.spy(oRowMode, "enableNoData");

		oRowMode.setHideEmptyRows(false);
		assert.ok(oDisableNoData.notCalled, "Change from true to false: #disableNoData was not called");
		assert.equal(oEnableNoData.callCount, 1, "Change from true to false: #enableNoData was called once");

		oDisableNoData.resetHistory();
		oEnableNoData.resetHistory();
		oRowMode.setHideEmptyRows(true);
		assert.equal(oDisableNoData.callCount, 1, "Change from false to true: #disableNoData was called once");
		assert.ok(oEnableNoData.notCalled, "Change from false to true: #enableNoData was not called");
	});

	QUnit.module("Get contexts", {
		before: function() {
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = 500;
		},
		beforeEach: function() {
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
			this.oGetContextsSpy.restore();
		},
		after: function() {
			Device.resize.height = this.iOriginalDeviceHeight;
		},
		createTable: function(bVariableRowHeightEnabled) {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				_bVariableRowHeightEnabled: bVariableRowHeightEnabled
			});

			return this.oTable;
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oTable = this.createTable();

		return oTable.qunit.whenRenderingFinished().then(() => {
			assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once"); // auto rerender
			assert.ok(this.oGetContextsSpy.getCall(0).calledWithExactly(0, this.oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");
		});
	});

	QUnit.test("Initialization; Variable row heights", function(assert) {
		const oTable = this.createTable(true);

		return oTable.qunit.whenRenderingFinished().then(() => {
			assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once"); // auto render
			assert.ok(this.oGetContextsSpy.getCall(0).calledWithExactly(0, this.oTable.getRowMode().getComputedRowCounts().count + 1, 100),
				"The call considers the row count");
		});
	});

	QUnit.test("Resize", function(assert) {
		const oGetContextsSpy = this.oGetContextsSpy;
		const oTable = this.createTable();
		let iFirstVisibleRow;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
		}).then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Height decreased when scroll to top: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");

			oGetContextsSpy.resetHistory();
		}).then(oTable.qunit.resetSize).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Height increased when scroll to top: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");

			oTable.setFirstVisibleRow(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
		}).then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Height decreased when scrolled in middle: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(10, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");

			oTable.setFirstVisibleRow(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
		}).then(oTable.qunit.resetSize).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Height increased when scrolled in middle: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(10, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");

			oTable.setFirstVisibleRow(100);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
			iFirstVisibleRow = oTable.getFirstVisibleRow();
		}).then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Height decreased when scrolled to bottom: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(iFirstVisibleRow, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call considers the row count");

			oTable.setFirstVisibleRow(100);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
		}).then(oTable.qunit.resetSize).then(function() {
			const iRowCount = oTable.getRowMode().getComputedRowCounts().count;
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Height increased when scrolled to bottom: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(100 - iRowCount, iRowCount, 100),
				"The call considers the row count");
		});
	});

	FixedRowHeightTest.registerTo(QUnit);

	RowCountConstraintsTest.test("Force fixed rows if row count too low", function(assert) {
		this.oRowMode.setMaxRowCount(1);
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 1, 0);
		}.bind(this));
	});

	RowCountConstraintsTest.registerTo(QUnit, function(assert, fnOriginalTest) {
		this.oTable.getRowMode().setMinRowCount(10).setMaxRowCount(10);
		return fnOriginalTest();
	});

	RowsUpdatedTest.test("Resize", function(assert) {
		this.createTable();
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
		}).then(this.oTable.qunit.$resize({height: "500px"})).then(() => {
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Resize
			]);
		}).finally(this.oTable.qunit.resetSize);
	});

	RowsUpdatedTest.test("Animation", function(assert) {
		this.createTable();
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRowMode().setProperty("rowContentHeight", 30, true); // Simulate that the row count changes after animation.
			document.body.dispatchEvent(new Event("transitionend"));
		}).then(TableQUnitUtils.wait).then(() => {
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Animation
			]);
		});
	});

	RowsUpdatedTest.test("Render when theme not applied", function(assert) {
		const oIsThemeApplied = sinon.stub(TableUtils, "isThemeApplied").returns(false);
		this.createTable();
		return this.checkRowsUpdated(assert, []).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.invalidate();
			return this.checkRowsUpdated(assert, []);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			oIsThemeApplied.returns(true);
			this.oTable.onThemeChanged();
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).finally(() => {
			oIsThemeApplied.restore();
		});
	});

	RowsUpdatedTest.registerTo(QUnit, function(assert, fnOriginalTest) {
		switch (QUnit.config.current.testName) {
			case "Initial rendering without binding":
			case "Initial rendering without binding in invisible container":
			case "Initial rendering with binding":
				return testWithStableRowCount(fnOriginalTest);
			case "Initial rendering with binding in invisible container":
				return RowsUpdatedTestInvisibleInitialRendering.apply(this, arguments);
			case "Re-render without binding":
				return RowsUpdatedTestRerenderWithoutBinding.apply(this, arguments);
			case "Re-render without binding in invisible container":
				return RowsUpdatedTestInvisibleRerenderWithoutBinding.apply(this, arguments);
			case "Re-render with binding":
				return RowsUpdatedTestRerenderWithBinding.apply(this, arguments);
			case "Re-render with binding in invisible container":
				return RowsUpdatedTestInvisibleRerenderWithBinding.apply(this, arguments);
			default:
				return fnOriginalTest();
		}
	});

	// To add a test case where the table does not need to adjust the row count to the avialable space after rendering.
	function testWithStableRowCount(fnTest) {
		return fnTest().then(() => {
			const oRowMode = TableQUnitUtils.getDefaultSettings().rowMode;

			oRowMode.minRowCount = 10;
			oRowMode.maxRowCount = 10;

			return fnTest().then(() => {
				delete oRowMode.minRowCount;
				delete oRowMode.maxRowCount;
			});
		});
	}

	function RowsUpdatedTestInvisibleInitialRendering(assert, fnOriginalTest) {
		return testWithStableRowCount(() => {
			return TableQUnitUtils.hideTestContainer().then(() => {
				this.createTable();
				return this.checkRowsUpdated(assert, []);
			}).then(() => {
				this.resetRowsUpdatedSpy();
				return TableQUnitUtils.showTestContainer();
			}).then(() => {
				return this.checkRowsUpdated(assert, [
					TableUtils.RowsUpdateReason.Render
				]);
			});
		});
	}

	function RowsUpdatedTestRerenderWithoutBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, []);
		});
	}

	function RowsUpdatedTestInvisibleRerenderWithoutBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.hideTestContainer();
		}).then(() => {
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, []);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return this.checkRowsUpdated(assert, []);
		});
	}

	function RowsUpdatedTestRerenderWithBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	}

	function RowsUpdatedTestInvisibleRerenderWithBinding(assert, fnOriginalTest) {
		this.createTable();
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.hideTestContainer();
		}).then(() => {
			this.oTable.invalidate();
			return this.checkRowsUpdated(assert, []);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return new Promise((resolve) => {
				this.oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(() => {
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.hideTestContainer();
		}).then(() => {
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, []);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return new Promise((resolve) => {
				this.oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(() => {
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	}
});