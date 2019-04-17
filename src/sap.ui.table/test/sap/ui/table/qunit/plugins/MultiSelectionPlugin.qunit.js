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
		assert.ok(oMultiSelectionPlugin.isA("sap.ui.core.Element"));
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

		oTable._oSelectionPlugin.attachEventOnce("selectionChange", function(){
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4, 5], "rows properly selected");
			assert.equal(oTable._oSelectionPlugin.getLimit(), 200, "Default selection limit is 200");
			assert.notOk(oTable._oSelectionPlugin.isLimitReached(), "Selection limit is not reached");

			$Table.find(".sapUiTableSelectClear").first().click();
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [], "select all function doesn't exist, the selection will be cleared");
			done();
		});
		oTable.addSelectionInterval(0, 5);
	});

	QUnit.test("Selection: number of items in range below limit", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable._oSelectionPlugin.setLimit(5);
		assert.equal(oTable._oSelectionPlugin.getLimit(), 5, "Selection limit is properly set");
		assert.equal(oTable._getSelectedIndicesCount(), 0, "no items are selected");
		var fnGetContexts = sinon.spy(oTable.getBinding("rows"), "getContexts");

		oTable._oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWith(0, 5), "getContexts is called with the correct parameters");
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4], "Range selection is possible for number of items below limit");

			oTable._oSelectionPlugin.attachSelectionChange(function(oEvent){
				assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
				assert.ok(!oEvent.getParameters().limitReached, "limitReached parameter is correct");
				aSelectedIndices = oTable.getSelectedIndices();
				assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "Multiple selections are possible");
				done();
			});

			oTable.addSelectionInterval(5, 9);
		});
		oTable.addSelectionInterval(0, 4);
	});

	QUnit.test("Selection: number of items in range above limit", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable._oSelectionPlugin.setLimit(5);
		assert.equal(oTable._getSelectedIndicesCount(), 0, "no items are selected");
		var fnGetContexts = sinon.spy(oTable.getBinding("rows"), "getContexts");

		oTable._oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWith(0, 1), "getContexts is called with the correct parameters");
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0], "First row is selected");

			oTable._oSelectionPlugin.attachSelectionChange(function(oEvent){
				assert.ok(fnGetContexts.calledWith(1, 5), "getContexts is called with the correct parameters");
				assert.deepEqual(oEvent.getParameters().rowIndices, [1, 2, 3, 4, 5], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				aSelectedIndices = oTable.getSelectedIndices();
				assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4, 5], "Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
				done();
			});

			oTable.addSelectionInterval(0, 10);
		});
		oTable.setSelectedIndex(0);
	});

	QUnit.test("Selection using setSelectionInterval: number of items in range above limit", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable.setVisibleRowCount(3);
		oTable._oSelectionPlugin.setLimit(5);
		assert.equal(oTable._getSelectedIndicesCount(), 0, "no items are selected");
		var fnGetContexts = sinon.spy(oTable.getBinding("rows"), "getContexts");

		oTable._oSelectionPlugin.attachEventOnce("selectionChange", function(){
			assert.ok(fnGetContexts.calledWith(16, 5), "getContexts is called with the correct parameters");
			aSelectedIndices = oTable.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [16, 17, 18, 19, 20], "The correct indices are selected");

			oTable._oSelectionPlugin.attachSelectionChange(function(oEvent){
				assert.ok(fnGetContexts.calledWith(16, 5), "getContexts is called with the correct parameters");
				assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 16, 17, 18, 19, 20], "rowIndices parameter is correct (indices that are being selected and deselected)");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				aSelectedIndices = oTable.getSelectedIndices();
				assert.deepEqual(aSelectedIndices, [0, 1, 2, 3, 4], "Selection is cut down to the possible limit. The previously selected indices are removed");
				done();
			});

			oTable.setSelectionInterval(0, 10);
		});
		oTable.setSelectionInterval(16, 20);
	});

	QUnit.test("Mouse interaction", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable._oSelectionPlugin.attachEventOnce("selectionChange", function(){
			aSelectedIndices = oTable.getSelectedIndices();
			assert.equal(aSelectedIndices.length, 10, "rows properly selected");

			oTable._oSelectionPlugin.attachSelectionChange(function() {
				aSelectedIndices = oTable.getSelectedIndices();
				assert.equal(aSelectedIndices.length, 0, "selection is removed");
				done();
			});
			oTable._oSelectionPlugin.onHeaderSelectorPress();
		});
		oTable.addSelectionInterval(0, 9);
	});

	QUnit.test("Keyboard interaction", function(assert) {
		var done = assert.async();
		var aSelectedIndices = [];

		oTable._oSelectionPlugin.attachEventOnce("selectionChange", function(){
			aSelectedIndices = oTable.getSelectedIndices();
			assert.equal(aSelectedIndices.length, 10, "rows properly selected");

			oTable._oSelectionPlugin.attachSelectionChange(function() {
				aSelectedIndices = oTable.getSelectedIndices();
				assert.equal(aSelectedIndices.length, 0, "selection is removed");
				done();
			});
			oTable._oSelectionPlugin.onKeyboardShortcut("toggle");
		});
		oTable.addSelectionInterval(0, 9);
	});
});