/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Table",
	"sap/ui/table/TableUtils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/library",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(MockServer, Table, TableUtils, ODataModel, tableLibrary, qutils, KeyCodes, MultiSelectionPlugin) {
	"use strict";

	var sServiceURI = "/service/";
	var SelectionMode = tableLibrary.SelectionMode;

	function startMockServer() {
		MockServer.config({
			autoRespond: true
		});

		var oMockServer = new MockServer({
			rootUri: sServiceURI
		});

		var sURLPrefix = sap.ui.require.toUrl("sap/ui/table/qunit");
		oMockServer.simulate(sURLPrefix + "/mockdata/metadata.xml", sURLPrefix + "/mockdata/");
		oMockServer.start();
		return oMockServer;
	}

	QUnit.module("Basics", {
		beforeEach: function() {
			this.oTable = new Table();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		var oMultiSelectionPlugin = new MultiSelectionPlugin();
		assert.strictEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The MultiSelectionPlugin has an delete icon");
		assert.ok(oMultiSelectionPlugin.isA("sap.ui.core.Element"));
	});

	QUnit.test("Add to and remove from table", function(assert) {
		var oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addPlugin(oMultiSelectionPlugin);
		assert.notEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has an internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The MultiSelectionPlugin has an delete icon");

		this.oTable.removePlugin(oMultiSelectionPlugin);
		assert.strictEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The MultiSelectionPlugin has an delete icon");
	});

	QUnit.test("Destruction", function(assert) {
		var oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addPlugin(oMultiSelectionPlugin);

		var oInternalPluginDestroySpy = sinon.spy(oMultiSelectionPlugin.oInnerSelectionPlugin, "destroy");
		var oDeselectAllIconDestroySpy = sinon.spy(oMultiSelectionPlugin.oDeselectAllIcon, "destroy");

		oMultiSelectionPlugin.destroy();
		assert.ok(oInternalPluginDestroySpy.calledOnce, "The internal default selection plugin was destroyed");
		assert.strictEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The reference to the internal default selection plugin was cleared");
		assert.ok(oDeselectAllIconDestroySpy.calledOnce, "The delete icon was destroyed");
		assert.strictEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The reference to the delete icon was cleared");
	});

	QUnit.module("Special multi selection behavior", {
		beforeEach: function() {
			this.oMockServer = startMockServer();
			this.oTable = new Table();
			this.oTable.addPlugin(new MultiSelectionPlugin());
			this.oTable.placeAt("qunit-fixture");

			this.oTable.bindRows({path : "/Products"});
			var oModel = new ODataModel(sServiceURI, {
				json: true
			});
			this.oTable.setModel(oModel);

			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				this.oTable.attachEvent("_rowsUpdated", function(oEvent) {
					if (oEvent.getParameter("reason") === TableUtils.RowsUpdateReason.Change) {
						resolve();
					}
				});
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("Display and accessibility", function(assert) {
		assert.ok(this.oTable._getSelectionPlugin().isA("sap.ui.table.plugins.MultiSelectionPlugin"), "MultiSelectionPlugin is initialised");
		assert.strictEqual(this.oTable.$("selall").find(".sapUiTableSelectAllCheckBox").length, 0, "no Select All checkbox");
		assert.strictEqual(this.oTable.$("selall").find(".sapUiTableSelectClear").length, 1, "Deselect All button exists");
		assert.strictEqual(this.oTable.$("selall").attr("title"), "Deselect All", "Tooltip exists");
		assert.strictEqual((this.oTable.$("selall").attr("aria-labelledby") || "").trim(), this.oTable.getId() + "-ariacolrowheaderlabel", "accessibility info exists");

		this.oTable.setEnableSelectAll(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oTable.$("selall").find(".sapUiTableSelectAllCheckBox").length, 0, "no Select All checkbox");
		assert.strictEqual(this.oTable.$("selall").find(".sapUiTableSelectClear").length, 1, "Deselect All button exists");
		assert.strictEqual(this.oTable.$("selall").attr("title"), "Deselect All", "Tooltip exists");
		assert.strictEqual((this.oTable.$("selall").attr("aria-labelledby") || "").trim(), this.oTable.getId() + "-ariacolrowheaderlabel", "accessibility info exists");

		this.oTable.setEnableSelectAll(true);
		this.oTable._getSelectionPlugin().setLimit(0);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oTable.$("selall").find(".sapUiTableSelectAllCheckBox").length, 1, "When the limit is set to -1 the Select All checkbox is rendered");
		assert.strictEqual(this.oTable.$("selall").find(".sapUiTableSelectClear").length, 0, "When the limit is set to -1 the Deselect All button is not rendered");
		assert.strictEqual(this.oTable.$("selall").attr("title"), "Select All", "Tooltip exists");
		assert.strictEqual((this.oTable.$("selall").attr("aria-labelledby") || "").trim(), this.oTable.getId() + "-ariacolrowheaderlabel", "accessibility info exists");
	});

	QUnit.test("Change SelectionMode", function(assert) {
		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is correctly initialized");

		this.oTable.removeAllPlugins();
		this.oTable.addPlugin(new MultiSelectionPlugin({
			selectionMode: "Single"
		}));
		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.Single, "SelectionMode is correctly initialized");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.Single, "SelectionMode is properly set in the Table");

		this.oTable._getSelectionPlugin().setSelectionMode(SelectionMode.MultiToggle);
		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is properly set");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.MultiToggle, "The SelectionMode is properly set in the Table");
	});

	QUnit.test("Selection: number of items in range below limit", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		oSelectionPlugin.setLimit(5);
		assert.equal(oSelectionPlugin.getSelectedCount(), 0, "no items are selected");

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWithExactly(0, 5), "getContexts is called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Range selection is possible for number of items below limit");
			assert.notOk(oSelectionPlugin.isLimitReached(), "Selection limit is not reached");

			oSelectionPlugin.attachSelectionChange(function(oEvent){
				assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
				assert.ok(!oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "Multiple selections are possible");
				done();
			});

			fnGetContexts.reset();
			oSelectionPlugin.addSelectionInterval(9, 5);
		});

		oSelectionPlugin.addSelectionInterval(0, 4);
	});

	QUnit.test("Selection: number of items in range above limit", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		oSelectionPlugin.setLimit(5);
		assert.equal(oSelectionPlugin.getSelectedCount(), 0, "no items are selected");

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWithExactly(0, 1), "getContexts is called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "First row is selected");

			oSelectionPlugin.attachSelectionChange(function(oEvent){
				assert.ok(fnGetContexts.calledWithExactly(1, 6), "getContexts is called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts called once");
				assert.deepEqual(oEvent.getParameters().rowIndices, [1, 2, 3, 4, 5], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
				done();
			});

			fnGetContexts.reset();
			oSelectionPlugin.addSelectionInterval(0, 10);
		});

		oSelectionPlugin.setSelectedIndex(0);
	});

	QUnit.test("Selection using setSelectionInterval: number of items in range above limit", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		oSelectionPlugin.setLimit(5);
		assert.equal(oSelectionPlugin.getSelectedCount(), 0, "no items are selected");

		oSelectionPlugin.attachEventOnce("selectionChange", function() {
			assert.ok(fnGetContexts.calledWithExactly(0, 6), "getContexts is called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Selection is cut down to the possible limit");

			oSelectionPlugin.attachSelectionChange(function(oEvent) {
				assert.ok(fnGetContexts.calledWithExactly(5, 6), "getContexts is called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts called once");
				assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "Selection is cut down to the possible limit");
				done();
			});

			fnGetContexts.reset();
			oSelectionPlugin.setSelectionInterval(5, 15);
		});

		oSelectionPlugin.setSelectionInterval(0, 10);
	});

	QUnit.test("Mouse interaction", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.equal(oSelectionPlugin.getSelectedIndices().length, 10, "rows properly selected");

			oSelectionPlugin.attachSelectionChange(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0, "selection is removed");
				done();
			});

			oSelectionPlugin.onHeaderSelectorPress(false);
		});

		oSelectionPlugin.addSelectionInterval(0, 9);
	});

	QUnit.test("Keyboard interaction", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.equal(oSelectionPlugin.getSelectedIndices().length, 10, "rows properly selected");

			oSelectionPlugin.attachSelectionChange(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0, "selection is removed");
				done();
			});

			oSelectionPlugin.onKeyboardShortcut("toggle");
		});

		oSelectionPlugin.addSelectionInterval(0, 9);
	});

	QUnit.test("Select All", function(assert) {
		var done = assert.async();
		var that = this;
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnSelectAll = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		assert.equal(oSelectionPlugin.getRenderConfig().headerSelector.type, "clear", "The headerSelector type is clear");

		oSelectionPlugin.selectAll();
		assert.ok(!fnSelectAll.calledOnce, "If the limit is not disabled, the SelectAll function does nothing.");

		oSelectionPlugin.setLimit(0);
		sap.ui.getCore().applyChanges();

		assert.equal(oSelectionPlugin.getRenderConfig().headerSelector.type, "toggle", "The headerSelector type is toggle");

		this.oTable.attachEventOnce("_rowsUpdated", function() {
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "no items are selected");
			fnGetContexts.reset();
			oSelectionPlugin.selectAll();
		});

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWithExactly(0, that.oTable.getBinding("rows").getLength()),
				"getContexts is called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, 16, "The correct indices are selected");

			done();
		});
	});

	QUnit.test("showHeaderSelector is false", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setShowHeaderSelector(false);
		sap.ui.getCore().applyChanges();

		var oCell = this.oTable.getDomRef("selall");

		assert.ok(!oCell.hasAttribute("role"), "role is not set");
		assert.ok(!oCell.hasAttribute("title"), "title is not set");
		assert.ok(!oCell.hasChildNodes(), "No icon");

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			jQuery(oCell).trigger("click");
			assert.equal(oSelectionPlugin.getSelectedCount(), 10, "the selection is not cleared");

			qutils.triggerKeydown(oCell, KeyCodes.A, false, false, true);
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "the selection is cleared");

			done();
		});

		oSelectionPlugin.addSelectionInterval(0, 9);
	});

	QUnit.test("Scroll position", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		var that = this;

		this.oTable.setVisibleRowCountMode(tableLibrary.VisibleRowCountMode.Fixed);
		this.oTable.setVisibleRowCount(3);
		oSelectionPlugin.setLimit(5);
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function() {

				that.oTable.attachEventOnce("_rowsUpdated", function () {
					assert.ok(oSelectionSpy.calledTwice, "The selection was added and then the table was scrolled");
					assert.equal(that.oTable.getFirstVisibleRow(), 4, "Table is scrolled at the correct position");
					done();
				});
				that.oTable.setFirstVisibleRow(7);
				$Cell = that.oTable.$("rowsel1");
				qutils.triggerEvent("click", $Cell, {shiftKey: true});
			});

			var $Cell = that.oTable.$("rowsel0");
			qutils.triggerEvent("click", $Cell);
		}, 100);
	});

	QUnit.test("Scroll position (reverse range selection)", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		var that = this;

		this.oTable.setVisibleRowCountMode(tableLibrary.VisibleRowCountMode.Fixed);
		this.oTable.setVisibleRowCount(3);
		oSelectionPlugin.setLimit(5);
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function() {

				that.oTable.attachEventOnce("_rowsUpdated", function () {
					assert.ok(oSelectionSpy.calledTwice, "The selection was added and then the table was scrolled");
					assert.equal(that.oTable.getFirstVisibleRow(), 3, "Table is scrolled at the correct position");
					done();
				});

				that.oTable.setFirstVisibleRow(0);
				$Cell = that.oTable.$("rowsel0");
				qutils.triggerEvent("click", $Cell, {shiftKey: true});
			});

			that.oTable.setFirstVisibleRow(7);
			var $Cell = that.oTable.$("rowsel2");
			qutils.triggerEvent("click", $Cell);
		}, 100);
	});

	QUnit.test("Selection (selectionMode = Single)", function(assert) {
		var done = assert.async();
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelectionMode(SelectionMode.Single);
		sap.ui.getCore().applyChanges();

		var oCell = this.oTable.getDomRef("selall");
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		assert.ok(!oCell.hasAttribute("role"), "DeselectAll role is not set");
		assert.ok(!oCell.hasAttribute("title"), "DeselectAll title is not set");
		assert.ok(!oCell.hasChildNodes(), "No DeselectAll icon");

		oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWithExactly(9, 1), "getContexts is called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [9], "Only one item is selected (iIndexTo)");

			oSelectionPlugin.attachEventOnce("selectionChange", function(){
				assert.ok(fnGetContexts.calledWithExactly(4, 1), "getContexts is called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4], "Only one item is selected (iIndexTo)");

				jQuery(oCell).trigger("click");
				assert.equal(oSelectionPlugin.getSelectedCount(), 1, "the selection is not cleared");

				done();
			});

			fnGetContexts.reset();
			oSelectionPlugin.setSelectionInterval(0, 4);
		});

		oSelectionPlugin.addSelectionInterval(0, 9);
	});

	QUnit.test("Selection (selectionMode = None)", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		sap.ui.getCore().applyChanges();

		var oCell = this.oTable.getDomRef("selall");
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		assert.ok(!oCell.hasAttribute("role"), "DeselectAll role is not set");
		assert.ok(!oCell.hasAttribute("title"), "DeselectAll title is not set");
		assert.ok(!oCell.hasChildNodes(), "No DeselectAll icon");

		oSelectionPlugin.addSelectionInterval(0, 9);
		oSelectionPlugin.setSelectionInterval(0, 9);
		oSelectionPlugin.setSelectedIndex(0);
		oSelectionPlugin.selectAll();

		assert.ok(fnGetContexts.notCalled, "getContexts is called with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");

		return new Promise(function(resolve) {
			setTimeout(function() {
				assert.ok(fnGetContexts.notCalled, "getContexts is called with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");
				resolve();
			}, 100);
		});
	});
});