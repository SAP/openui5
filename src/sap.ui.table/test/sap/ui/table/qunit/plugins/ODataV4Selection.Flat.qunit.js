/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/IconPool"
], function(
	TableQUnitUtils,
	TableUtils,
	ODataV4Selection,
	QUnitUtils,
	IconPool
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4Selection({enableNotification: true})],
		rows: {
			path: "/Products",
			parameters: {
				$count: true
			}
		},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true}),
		models: TableQUnitUtils.createModelForListDataService()
	});

	QUnit.module("Basic checks", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Lifecycle", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oIcon = oODataV4Selection.getAggregation("icon");

		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon), "DeselectAll icon is correct");
		assert.ok(!oIcon.getUseIconTooltip(), "DeselectAll icon has no tooltip");
		assert.ok(oIcon.hasStyleClass("sapUiTableSelectClear"), "DeselectAll icon has the correct css class applied");
		assert.ok(!oODataV4Selection._isLimitDisabled(), "limit is not disabled by default");
		oTable.removeDependent(oODataV4Selection);

		var oActivateSpy = sinon.spy(oODataV4Selection, "onActivate");
		oTable.addDependent(oODataV4Selection);
		assert.ok(oActivateSpy.calledOnce, "the selection plugin is activated");
		assert.strictEqual(oTable.getSelectionMode(), "MultiToggle",
			"selectionMode of the table is set to the default selectionMode of the plugin");

		var oClearSelectionSpy = sinon.spy(oODataV4Selection, "clearSelection");
		oODataV4Selection.onDeactivate(oTable);
		assert.strictEqual(oTable.getSelectionMode(), "None", "when plugin is deactivated selectionMode of the table is set to None");
		assert.ok(oClearSelectionSpy.calledOnce, "when plugin is deactivated selection is cleared");

		oODataV4Selection = new ODataV4Selection({selectionMode: "Single", limit: 0});
		oTable.addDependent(oODataV4Selection);
		assert.strictEqual(oTable.getSelectionMode(), "Single", "selectionMode of the table is set correctly");
		assert.ok(oODataV4Selection._isLimitDisabled(), "limit is disabled");
	});

	QUnit.test("Enable/Disable", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oActivateSpy = sinon.spy(oODataV4Selection, "activate");
		var oDeactivateSpy = sinon.spy(oODataV4Selection, "deactivate");

		oODataV4Selection.setEnabled(false);
		assert.ok(oDeactivateSpy.calledOnce);
		assert.ok(!oODataV4Selection.getEnabled());

		oODataV4Selection.setEnabled(true);
		assert.ok(oActivateSpy.calledOnce);
		assert.ok(oODataV4Selection.getEnabled());
	});

	QUnit.test("getRenderConfig", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oHeaderSelector = oODataV4Selection.getRenderConfig().headerSelector;

		assert.strictEqual(oHeaderSelector.type, "clear");
		assert.strictEqual(oHeaderSelector.visible, true);

		oODataV4Selection.setLimit(0);
		oHeaderSelector = oODataV4Selection.getRenderConfig().headerSelector;
		assert.strictEqual(oHeaderSelector.type, "toggle");
		assert.strictEqual(oHeaderSelector.visible, true);

		oODataV4Selection.setSelectionMode("Single");
		oHeaderSelector = oODataV4Selection.getRenderConfig().headerSelector;
		assert.strictEqual(oHeaderSelector.visible, false);
	});

	QUnit.test("setSelectionMode", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];

		assert.strictEqual(oODataV4Selection.getSelectionMode(), "MultiToggle", "default selectionMode");
		assert.strictEqual(oTable.getSelectionMode(), "MultiToggle", "selectionMode of the table");
		oODataV4Selection.setSelectionMode("Single");
		assert.strictEqual(oODataV4Selection.getSelectionMode(), "Single", "selectionMode of the plugin is updated");
		assert.strictEqual(oTable.getSelectionMode(), "Single", "selectionMode of the table is updated");
	});

	QUnit.test("onTableRowsBound", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oModelStub = sinon.stub(oTable.getBinding().getModel(), "isA");

		oModelStub.withArgs("sap.ui.model.odata.v4.ODataModel").returns(false);
		var oDeactivateSpy = sinon.spy(oODataV4Selection, "deactivate");

		oODataV4Selection.onTableRowsBound(oTable.getBinding());
		assert.ok(oDeactivateSpy.calledOnce, "if the model is not sap.ui.model.odata.v4.ODataModel, the plugin is deactivated");
		oModelStub.restore();
		oDeactivateSpy.restore();
	});

	QUnit.module("Selection API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		whenSelectionChange: function(oODataV4Selection) {
			return new Promise(function(resolve) {
				oODataV4Selection.attachEventOnce("selectionChange", resolve);
			});
		},
		triggerRowSelectorClick: function(oTable, iIndex, bShiftKey) {
			QUnitUtils.triggerEvent("tap", oTable.qunit.getRowHeaderCell(iIndex), {shiftKey: bShiftKey});
		}
	});

	QUnit.test("Selection", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		const oSelectionChangeSpy = sinon.spy();

		oODataV4Selection.attachSelectionChange(oSelectionChangeSpy);
		var oRow, aSelectedContexts;

		aSelectedContexts = oODataV4Selection.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 0, 'Count of selected contexts is 0');
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'getSelectedCount returns 0');
		oRow = oTable.getRows()[0];
		assert.strictEqual(oODataV4Selection.isSelected(oRow), false, 'Row 1 is not selected');
		oODataV4Selection.setSelected(oRow, true);
		assert.strictEqual(oSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired once');
		oSelectionChangeSpy.resetHistory();
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 1, 'getSelectedCount returns 1');
		assert.strictEqual(oODataV4Selection.isSelected(oRow), true, 'Row 1 is selected');

		oRow = oTable.getRows()[2];
		oODataV4Selection.setSelected(oRow, true, {range: true});
		return TableQUnitUtils.wait(0).then(function() {
			assert.strictEqual(oSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired once');
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 3, 'getSelectedCount returns 3');
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[1]), true, 'Row 2 selected');
			assert.strictEqual(oODataV4Selection.isSelected(oRow), true, 'Row 3 selected');

			aSelectedContexts = oODataV4Selection.getSelectedContexts();
			assert.strictEqual(aSelectedContexts.length, 3, 'getSelectedContexts returns 3');
			assert.strictEqual(aSelectedContexts[0].sPath, '/Products/0', 'sPath of first element in getSelectedContexts is correct');
			assert.strictEqual(aSelectedContexts[1].sPath, '/Products/1', 'sPath of second element in getSelectedContexts is correct');
			assert.strictEqual(aSelectedContexts[2].sPath, '/Products/2', 'sPath of second element in getSelectedContexts is correct');

			oODataV4Selection.clearSelection();
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'selection cleared');
		});
	});

	QUnit.test("onHeaderSelectorPress", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oRow = oTable.getRows()[0];

		oODataV4Selection.setSelected(oRow, true);
		oRow = oTable.getRows()[1];
		oODataV4Selection.setSelected(oRow, true);
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 2, '2 rows are selected');

		oODataV4Selection.onHeaderSelectorPress();
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'all rows are deselected');

		oODataV4Selection.setLimit(0);
		oODataV4Selection.setSelected(oRow, true);

		oODataV4Selection.onHeaderSelectorPress();
		return this.whenSelectionChange(oODataV4Selection).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 400, 'all rows are selected');
			oODataV4Selection.onHeaderSelectorPress();
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'all rows are deselected');
		});
	});

	QUnit.test("onKeyboardShortcut", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oRow = oTable.getRows()[0];

		oODataV4Selection.setSelected(oRow, true);
		oRow = oTable.getRows()[1];
		oODataV4Selection.setSelected(oRow, true);
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 2, '2 rows are selected');

		oODataV4Selection.onKeyboardShortcut("clear");
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'all rows are deselected');

		oODataV4Selection.setLimit(0);
		oODataV4Selection.setSelected(oRow, true);

		oODataV4Selection.onKeyboardShortcut("toggle");
		return this.whenSelectionChange(oODataV4Selection).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 400, 'all rows are selected');
			oODataV4Selection.onKeyboardShortcut("toggle");
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'all rows are deselected');
		});
	});

	QUnit.test("Range selection (limit not reached)", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];

		assert.equal(oODataV4Selection.getLimit(), 200, "default limit is 200");
		this.triggerRowSelectorClick(oTable, 0, false);
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 1, '1 rows are selected');

		this.triggerRowSelectorClick(oTable, 5, true);
		return this.whenSelectionChange(oODataV4Selection).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 6, 'range selected');
			assert.ok(!oODataV4Selection.isLimitReached(), "limit is not reached");
			oTable.setFirstVisibleRow(95);
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			this.triggerRowSelectorClick(oTable, 5, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 101, "range selection extended");
			assert.ok(!oODataV4Selection.isLimitReached(), "limit is not reached");
		});
	});

	QUnit.test("Reverse range selection (limit not reached)", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];

		oTable.setFirstVisibleRow(95);
		return oTable.qunit.whenRenderingFinished().then(function() {
			this.triggerRowSelectorClick(oTable, 5, false);
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 1, '1 rows are selected');
			oTable.setFirstVisibleRow(50);
			return oTable.qunit.whenRenderingFinished();
		}.bind(this)).then(function() {
			this.triggerRowSelectorClick(oTable, 0, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 51, 'range selected');
			assert.ok(!oODataV4Selection.isLimitReached(), "limit is not reached");
			oTable.setFirstVisibleRow(0);
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			this.triggerRowSelectorClick(oTable, 0, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 101, "range selection extended");
			assert.ok(!oODataV4Selection.isLimitReached(), "limit is not reached");
		});
	});

	QUnit.test("Range selection (limit reached)", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oScrollTableSpy = sinon.spy(TableUtils, "scrollTableToIndex");
		var oNotificationSpy = sinon.spy(TableUtils, "showNotificationPopoverAtIndex");

		oODataV4Selection.setLimit(100);
		this.triggerRowSelectorClick(oTable, 0, false);
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 1, '1 rows are selected');

		oTable.setFirstVisibleRow(200);
		return oTable.qunit.whenRenderingFinished().then(function() {
			this.triggerRowSelectorClick(oTable, 5, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 101, 'range selected');
			assert.ok(oODataV4Selection.isLimitReached(), "limit is reached");
			assert.ok(oScrollTableSpy.calledOnceWithExactly(oTable, 100, false), "table scrolled");
			oScrollTableSpy.reset();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.ok(oNotificationSpy.calledOnceWithExactly(oTable, 100, 100), "notification popover shown");
			oNotificationSpy.reset();
			oTable.setFirstVisibleRow(300);
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			this.triggerRowSelectorClick(oTable, 5, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 201, "range selection extended");
			assert.ok(oODataV4Selection.isLimitReached(), "limit is reached");
			assert.ok(oScrollTableSpy.calledOnceWithExactly(oTable, 200, false), "table scrolled");
			oScrollTableSpy.restore();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.ok(oNotificationSpy.calledOnceWithExactly(oTable, 200, 100), "notification popover shown");
			oNotificationSpy.restore();
		});
	});

	QUnit.test("Reverse range selection (limit reached)", function(assert) {
		var oTable = this.oTable;
		var oODataV4Selection = oTable.getDependents()[0];
		var oScrollTableSpy = sinon.spy(TableUtils, "scrollTableToIndex");
		var oNotificationSpy = sinon.spy(TableUtils, "showNotificationPopoverAtIndex");

		oODataV4Selection.setLimit(100);
		oTable.setFirstVisibleRow(300);
		return oTable.qunit.whenRenderingFinished().then(function() {
			this.triggerRowSelectorClick(oTable, 5, false);
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 1, '1 rows are selected');
			oTable.setFirstVisibleRow(0);
			return oTable.qunit.whenRenderingFinished();
		}.bind(this)).then(function() {
			this.triggerRowSelectorClick(oTable, 0, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 101, 'range selected');
			assert.ok(oODataV4Selection.isLimitReached(), "limit is reached");
			assert.ok(oScrollTableSpy.calledOnceWithExactly(oTable, 205, true), "table scrolled");
			oScrollTableSpy.reset();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.ok(oNotificationSpy.calledOnceWithExactly(oTable, 205, 100), "notification popover shown");
			oNotificationSpy.reset();
			oTable.setFirstVisibleRow(0);
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			this.triggerRowSelectorClick(oTable, 0, true);
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 201, "range selection extended");
			assert.ok(oODataV4Selection.isLimitReached(), "limit is reached");
			assert.ok(oScrollTableSpy.calledOnceWithExactly(oTable, 105, true), "table scrolled");
			oScrollTableSpy.restore();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.ok(oNotificationSpy.calledOnceWithExactly(oTable, 105, 100), "notification popover shown");
			oNotificationSpy.reset();
		});
	});
});