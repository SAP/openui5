/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Table",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/library",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(MockServer, Table, ODataModel, tableLibrary, MultiSelectionPlugin) {
	"use strict";

	var oTable;
	var oMockServer;
	var sServiceURI = "/service/";
	var iResponseTime = 0;

	function createODataModel(sURL) {
		sURL = sURL || sServiceURI;
		return new ODataModel(sURL, {
			json: true
		});
	}

	function startMockServer() {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iResponseTime
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
		assert.strictEqual(oMultiSelectionPlugin.oSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The MultiSelectionPlugin has an delete icon");
	});

	QUnit.test("Add to and remove from table", function(assert) {
		var oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addPlugin(oMultiSelectionPlugin);
		assert.notEqual(oMultiSelectionPlugin.oSelectionPlugin, null, "The MultiSelectionPlugin has an internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The MultiSelectionPlugin has an delete icon");

		this.oTable.removePlugin(oMultiSelectionPlugin);
		assert.strictEqual(oMultiSelectionPlugin.oSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The MultiSelectionPlugin has an delete icon");
	});

	QUnit.test("Destruction", function(assert) {
		var oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addPlugin(oMultiSelectionPlugin);

		var oInternalPluginDestroySpy = sinon.spy(oMultiSelectionPlugin.oSelectionPlugin, "destroy");
		var oDeselectAllIconDestroySpy = sinon.spy(oMultiSelectionPlugin.oDeselectAllIcon, "destroy");

		oMultiSelectionPlugin.destroy();
		assert.ok(oInternalPluginDestroySpy.calledOnce, "The internal default selection plugin was destroyed");
		assert.strictEqual(oMultiSelectionPlugin.oSelectionPlugin, null, "The reference to the internal default selection plugin was cleared");
		assert.ok(oDeselectAllIconDestroySpy.calledOnce, "The delete icon was destroyed");
		assert.strictEqual(oMultiSelectionPlugin.oDeselectAllIcon, null, "The reference to the delete icon was cleared");
	});

	QUnit.module("Special multi selection behavior", {
		beforeEach: function() {
			oMockServer = startMockServer();
			oTable = new Table();
			oTable.addPlugin(new MultiSelectionPlugin());
			oTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oTable.bindRows({path : "/Products"});
			var oModel = createODataModel(sServiceURI);
			oTable.setModel(oModel);
		},
		afterEach: function() {
			oTable.destroy();
			oMockServer.stop();
		}
	});

	QUnit.test("Display and accessibility", function(assert) {
		assert.ok(oTable._oSelectionPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin"), "MultiSelectionPlugin is initialised");
		assert.strictEqual(oTable.$("selall").find(".sapUiTableColRowHdrIco").length, 0, "no Select All checkbox");
		assert.strictEqual(oTable.$("selall").find(".sapUiTableSelectClear").length, 1, "Deselect All button exists");
		assert.strictEqual(oTable.$("selall").attr("title"), "Deselect All", "Tooltip exists");
		assert.strictEqual((oTable.$("selall").attr("aria-labelledby") || "").trim(), oTable.getId() + "-ariacolrowheaderlabel", "accessibility info exists");
	});

	QUnit.test("Selection", function(assert) {
		var done = assert.async();
		var $Table = oTable.$();
		var aSelectedIndices = [];

		oTable.addSelectionInterval(0,5);
		setTimeout(function() {
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4, 5], "rows properly selected");
			assert.equal(oTable._oSelectionPlugin.getLimit(), 200, "Default selection limit is 200");
			assert.notOk(oTable._oSelectionPlugin.isLimitReached(), "Selection limit is not reached");

			$Table.find(".sapUiTableSelectClear").first().click();
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [], "select all function doesn't exist, the selection will be cleared");
			done();
		}, 10);
	});

	QUnit.test("Selection: number of items in range below limit", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable._oSelectionPlugin.setLimit(5);
		assert.equal(oTable._oSelectionPlugin.getLimit(), 5, "Selection limit is properly set");
		assert.equal(oTable._getSelectedIndicesCount(), 0, "no items are selected");
		oTable.addSelectionInterval(0,4);
		setTimeout(function() {
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4], "Range selection is possible for number of items below limit");

			oTable._oSelectionPlugin.attachEvent("selectionChange", function(oEvent){
				assert.deepEqual(oEvent.mParameters.rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
				assert.ok(!oEvent.mParameters.limitReached, "limitReached parameter is correct");
			});

			oTable.addSelectionInterval(5,9);
			setTimeout(function() {
				aSelectedIndices = oTable.getSelectedIndices();
				assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "Multiple selections are possible");
				done();
			}, 10);
		}, 10);
	});

	QUnit.test("Selection: number of items in range above limit", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable._oSelectionPlugin.setLimit(5);
		assert.equal(oTable._getSelectedIndicesCount(), 0, "no items are selected");
		oTable.addSelectionInterval(0,0);
		setTimeout(function() {
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0], "First row is selected");

			oTable._oSelectionPlugin.attachEvent("selectionChange", function(oEvent){
				assert.deepEqual(oEvent.mParameters.rowIndices, [1, 2, 3, 4, 5, 6], "rowIndices parameter is correct");
				assert.ok(oEvent.mParameters.limitReached, "limitReached parameter is correct");
			});

			oTable.addSelectionInterval(1,10);
			setTimeout(function() {
				aSelectedIndices = oTable.getSelectedIndices();
				assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4, 5, 6], "Selection is cut down to the possible limit");
				assert.equal(Math.max(0, 5 - oTable.getVisibleRowCount() + 2), oTable.getFirstVisibleRow(), "table scrolls back to the last selected item");
				done();
			}, 10);
		}, 10);
	});

	QUnit.test("Mouse interaction", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable.addSelectionInterval(0,9);
		setTimeout(function() {
			aSelectedIndices = oTable.getSelectedIndices();
			assert.equal(aSelectedIndices.length, 10, "rows properly selected");
			oTable._oSelectionPlugin.onHeaderSelectorPress();
			setTimeout(function() {
				aSelectedIndices = oTable.getSelectedIndices();
				assert.equal(aSelectedIndices.length, 0, "selection is removed");
				done();
			}, 10);
		}, 10);
	});

	QUnit.test("Keyboard interaction", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable.addSelectionInterval(0,9);
		setTimeout(function() {
			aSelectedIndices = oTable.getSelectedIndices();
			assert.equal(aSelectedIndices.length, 10, "rows properly selected");
			oTable._oSelectionPlugin.onKeyboardShortcut("toggle");
			setTimeout(function() {
				aSelectedIndices = oTable.getSelectedIndices();
				assert.equal(aSelectedIndices.length, 0, "selection is removed");
				done();
			}, 10);
		}, 10);
	});
});