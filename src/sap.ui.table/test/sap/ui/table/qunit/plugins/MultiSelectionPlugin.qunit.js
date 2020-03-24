/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/library",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(MockServer, Table, TableUtils, ODataModel, tableLibrary, qutils, TableQUnitUtils, KeyCodes, MultiSelectionPlugin) {
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

	QUnit.module("Deselect All button", {
		beforeEach: function() {
			this.oMockServer = startMockServer();
			this.oTable = TableQUnitUtils.createTable({
				plugins: [
					new MultiSelectionPlugin()
				]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("Enable/Disable", function(assert) {
		var oTable = this.oTable;
		var $SelectAll = oTable.$("selall");
		var oSelectionPlugin = oTable._getSelectionPlugin();

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			assert.ok($SelectAll.attr("aria-disabled"), "Before bindRows: aria-disabled is set to true");
			assert.ok($SelectAll.hasClass("sapUiTableSelAllDisabled"), "Before bindRows: Deselect All is disabled");

			oTable.bindRows({path: "/Products"});
			oTable.setModel(new ODataModel(sServiceURI, {
				json: true
			}));
		}).then(oTable.qunit.whenBindingChange).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.ok(oTable.getBinding("rows").getLength() > 0, "After bindRows: Table has data");
			assert.strictEqual($SelectAll.attr("role"), "button", "role attribute is set to button");
			assert.ok($SelectAll.attr("aria-disabled"), "After bindRows: aria-disabled is set to true");
			assert.ok($SelectAll.hasClass("sapUiTableSelAllDisabled"), "After bindRows: Deselect All is disabled");
		}).then(function() {
			return new Promise(function(resolve) {
				oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
					assert.notOk($SelectAll.attr("aria-disabled"), "After rows are selected: aria-disabled is removed");
					assert.notOk($SelectAll.hasClass("sapUiTableSelAllDisabled"), "After rows are selected: Deselect All is enabled");
					oTable.unbindRows();
					resolve();
				});
				oSelectionPlugin.setSelectedIndex(0);
			});
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.ok($SelectAll.attr("aria-disabled"), "After unbindRows: aria-disabled is set to true");
			assert.ok($SelectAll.hasClass("sapUiTableSelAllDisabled"), "After unbindRows: Deselect All is disabled");
		});
	});

	QUnit.module("Multi selection behavior", {
		beforeEach: function() {
			this.oMockServer = startMockServer();
			this.oTable = TableQUnitUtils.createTable({
				plugins: [
					new MultiSelectionPlugin()
				],
				rows: {
					path: "/Products"
				},
				models: new ODataModel(sServiceURI, {
					json: true
				})
			});

			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("Display and accessibility", function(assert) {
		var done = assert.async();
		var that = this;
		var $SelectAll = this.oTable.$("selall");
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		assert.ok(oSelectionPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin"), "MultiSelectionPlugin is initialised");
		assert.strictEqual($SelectAll.find(".sapUiTableSelectAllCheckBox").length, 0, "no Select All checkbox");
		assert.strictEqual($SelectAll.find(".sapUiTableSelectClear").length, 1, "Deselect All button exists");
		assert.strictEqual($SelectAll.attr("title"), "Deselect All", "Tooltip exists");
		assert.strictEqual($SelectAll.attr("role"), "button", "role attribute is set to button");
		assert.ok($SelectAll.attr("aria-disabled"), "aria-disabled is set to true");
		this.oTable.setEnableSelectAll(false);
		assert.strictEqual($SelectAll.attr("title"), "Deselect All", "Tooltip exists");
		assert.ok($SelectAll.attr("aria-disabled"), "aria-disabled is set to true");
		assert.ok($SelectAll.hasClass("sapUiTableSelAllDisabled"), "Deselect All is disabled");

		oSelectionPlugin.attachSelectionChange(function(){
			assert.strictEqual($SelectAll.attr("title"), "Deselect All", "Tooltip exists");
			assert.notOk($SelectAll.attr("aria-disabled"), "aria-disabled is removed");
			assert.notOk($SelectAll.hasClass("sapUiTableSelAllDisabled"), "Deselect All is enabled");
			assert.strictEqual(($SelectAll.attr("aria-labelledby") || "").trim(), that.oTable.getId() + "-ariacolrowheaderlabel", "accessibility info exists");
			that.oTable.setEnableSelectAll(true);

			var oSetPropertySpy = sinon.spy(oSelectionPlugin, "setProperty");
			oSelectionPlugin.setLimit(5);
			sap.ui.getCore().applyChanges();
			assert.ok(oSetPropertySpy.calledOnce, "setProperty is called once");
			assert.ok(oSetPropertySpy.calledWithExactly("limit", 5, true), "setProperty called with the correct parameters");
			oSetPropertySpy.reset();

			oSelectionPlugin.setLimit(0);
			sap.ui.getCore().applyChanges();
			assert.ok(oSetPropertySpy.calledOnce, "setProperty is called once");
			assert.ok(oSetPropertySpy.calledWithExactly("limit", 0, false), "setProperty called with the correct parameters");

			assert.strictEqual($SelectAll.find(".sapUiTableSelectAllCheckBox").length, 1,
				"When the limit is set to -1 the Select All checkbox is rendered");
			assert.strictEqual($SelectAll.find(".sapUiTableSelectClear").length, 0,
				"When the limit is set to -1 the Deselect All button is not rendered");
			assert.strictEqual($SelectAll.attr("title"), "Select All", "Tooltip exists");
			assert.strictEqual(($SelectAll.attr("aria-labelledby") || "").trim(), that.oTable.getId() + "-ariacolrowheaderlabel",
				"accessibility info exists");
			done();
		});
		oSelectionPlugin.setSelectedIndex(0);
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

	QUnit.test("Selection using addSelectionInterval: Selection not possible", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		return oSelectionPlugin.addSelectionInterval(-1, -2).then(function() {
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		}).catch(function(oError) {
			assert.deepEqual(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");

		}).then(function() {
			sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(-1);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.addSelectionInterval(0, 0).then(function() {
				assert.ok(false, "The promise should have been rejected because the indices are out of range");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
				oSelectionPlugin._getHighestSelectableIndex.restore();
			});

		}).then(function() {
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.addSelectionInterval(iHighestSelectableIndex + 1, iHighestSelectableIndex + 1).then(function() {
				assert.ok(false, "The promise should have been rejected because the indices are out of range");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});

		}).then(function() {
			oSelectionPlugin.setSelectionMode(SelectionMode.None);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oSelectionPlugin.addSelectionInterval(6, 7).then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError){
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Selection using addSelectionInterval: Number of items in range below limit", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var iSelectableCount = oSelectionPlugin.getSelectableCount();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		return oSelectionPlugin.addSelectionInterval(0, 4).then(function() {
			assert.ok(fnGetContexts.calledWithExactly(0, 5), "getContexts was called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4],
				"Range selection is possible for number of items below limit");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [5], "selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.addSelectionInterval(-1, 5).then(function() {
				assert.ok(fnGetContexts.calledWithExactly(1, 5), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Multiple selections are possible. When indexFrom is already selected, the selection starts from the next index");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
			});

		}).then(function() {
			return new Promise(function(resolve) {
				fnGetContexts.reset();
				oSelectionChangeSpy.reset();
				oSelectionPlugin.addSelectionInterval(5, 5);
				setTimeout(function () {
					assert.ok(fnGetContexts.calledWithExactly(5, 1), "getContexts was called with the correct parameters");
					assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
					assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
						"The selection is not changed because the index was already selected");
					assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
					resolve();
				}, 100);
			});

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [iSelectableCount - 1],
					"selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.addSelectionInterval(iSelectableCount - 1, iSelectableCount + 100).then(function() {
				assert.ok(fnGetContexts.calledWithExactly(iSelectableCount - 1, 1), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, iSelectableCount - 1],
					"Range selection is possible for number of items below limit");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
			});

		}).then(function() {
			return oSelectionPlugin.addSelectionInterval(-1, -1).catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, iSelectableCount - 1], "The selection did not change");
			});
		});
	});

	QUnit.test("Reverse selection using addSelectionInterval: Number of items in range below limit", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");

		oSelectionPlugin.setLimit(5);

		return new Promise(function(resolve) {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.ok(fnGetContexts.calledWithExactly(5, 5), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9],
					"Reverse range selection is possible for number of items below limit");
				resolve();
			});
			oSelectionPlugin.addSelectionInterval(9, 5);

		}).then(function() {
			return new Promise(function(resolve) {
				oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
					assert.ok(fnGetContexts.calledWithExactly(4, 5), "getContexts was called with the correct parameters");
					assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
					assert.deepEqual(oEvent.getParameters().rowIndices, [4], "rowIndices parameter is correct");
					assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
					assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4, 5, 6, 7, 8, 9],
						"Multiple selections are possible. When indexFrom is already selected, the selection starts from the previous index");
					resolve();
				});

				fnGetContexts.reset();
				oSelectionPlugin.addSelectionInterval(9, 4);
			});
		});
	});

	QUnit.test("Selection using addSelectionInterval: Number of items in range above limit", function(assert) {
		var oTable = this.oTable;
		var oSelectionPlugin = oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var oFirstVisibleRowChangedSpy = sinon.spy();
		var oRowsUpdatedSpy = sinon.spy();

		oTable.setVisibleRowCount(3);
		oSelectionPlugin.setLimit(5);
		sap.ui.getCore().applyChanges();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		oTable.attachFirstVisibleRowChanged(oFirstVisibleRowChangedSpy);
		oTable.attachEvent("_rowsUpdated", oRowsUpdatedSpy);

		return new Promise(function(resolve) {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.ok(fnGetContexts.calledWithExactly(0, 1), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "First row is selected");
				assert.deepEqual(oEvent.getParameters().rowIndices, [0], "rowIndices parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				resolve();
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oFirstVisibleRowChangedSpy.reset();
			oRowsUpdatedSpy.reset();
			oSelectionPlugin.addSelectionInterval(0, 0);

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [1, 2, 3, 4, 5], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.ok(fnGetContexts.calledWithExactly(1, 6), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oFirstVisibleRowChangedSpy.reset();
			oRowsUpdatedSpy.reset();
			return oSelectionPlugin.addSelectionInterval(0, 10).then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
				assert.equal(oTable.getFirstVisibleRow(), 4, "The firstVisibleRow is correct");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
				assert.ok(oFirstVisibleRowChangedSpy.calledOnce, "The \"firstVisibleRowChanged\" event was fired");
				assert.ok(oRowsUpdatedSpy.calledOnce, "The \"_rowsUpdated\" event was fired");
			});

		}).then(function() {
			oSelectionPlugin.setEnableNotification(true);
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [6, 7, 8, 9, 10], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.ok(fnGetContexts.calledWithExactly(6, 6), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oFirstVisibleRowChangedSpy.reset();
			oRowsUpdatedSpy.reset();
			return oSelectionPlugin.addSelectionInterval(6, 15).then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
					"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
				assert.equal(oTable.getFirstVisibleRow(), 9, "The firstVisibleRow is correct");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
				assert.ok(oFirstVisibleRowChangedSpy.calledOnce, "The \"firstVisibleRowChanged\" event was fired");
				assert.ok(oRowsUpdatedSpy.calledOnce, "The \"_rowsUpdated\" event was fired");
			});
		});
	});

	QUnit.test("Selection using setSelectionInterval: Selection not possible", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		return oSelectionPlugin.setSelectionInterval(-1, -2).then(function() {
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		}).catch(function(oError) {
			assert.deepEqual(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");

		}).then(function() {
			sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(-1);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectionInterval(0, 0).then(function() {
				assert.ok(false, "The promise should have been rejected because the indices are out of range");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
				oSelectionPlugin._getHighestSelectableIndex.restore();
			});

		}).then(function() {
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectionInterval(iHighestSelectableIndex + 1, iHighestSelectableIndex + 1).then(function() {
				assert.ok(false, "The promise should have been rejected because the indices are out of range");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});

		}).then(function() {
			oSelectionPlugin.setSelectionMode(SelectionMode.None);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oSelectionPlugin.setSelectionInterval(6, 7).then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError){
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Selection using setSelectionInterval", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var iSelectableCount = oSelectionPlugin.getSelectableCount();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.ok(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.reset();
		oSelectionChangeSpy.reset();
		return oSelectionPlugin.setSelectionInterval(-1, 10).then(function() {
			assert.ok(fnGetContexts.calledWithExactly(0, 6), "getContexts was called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Selection is cut down to the possible limit");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
					"selectionChange event: \"rowIndices\" parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectionInterval(5, 15).then(function() {
				assert.ok(fnGetContexts.calledWithExactly(5, 6), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "Selection is cut down to the possible limit");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
			});

		}).then(function() {
			return new Promise(function(resolve) {
				fnGetContexts.reset();
				oSelectionChangeSpy.reset();
				oSelectionPlugin.setSelectionInterval(5, 10); // Limit reached
				setTimeout(function () {
					assert.ok(fnGetContexts.calledWithExactly(5, 6), "getContexts was called with the correct parameters");
					assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
					assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "The selection did not change");
					assert.ok(oSelectionChangeSpy.notCalled, "The selectionChange event was not fired");
					resolve();
				}, 100);
			});

		}).then(function() {
			return new Promise(function(resolve) {
				fnGetContexts.reset();
				oSelectionChangeSpy.reset();
				oSelectionPlugin.setSelectionInterval(5, 9); // Limit not reached
				setTimeout(function () {
					assert.ok(fnGetContexts.calledWithExactly(5, 5), "getContexts was called with the correct parameters");
					assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
					assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "The selection did not change");
					assert.ok(oSelectionChangeSpy.notCalled, "The selectionChange event was not fired");
					resolve();
				}, 100);
			});

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9, iSelectableCount - 1],
					"selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectionInterval(iSelectableCount - 1, iSelectableCount + 100).then(function() {
				assert.ok(fnGetContexts.calledWithExactly(iSelectableCount - 1, 1), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [iSelectableCount - 1], "The correct index is selected");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
			});

		}).then(function() {
			return oSelectionPlugin.setSelectionInterval(-1, -1).catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [iSelectableCount - 1], "The selection did not change");
			});
		});
	});

	QUnit.test("Selection using setSelectedIndex: Selection not possible", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		return oSelectionPlugin.setSelectedIndex(-1).then(function() {
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		}).catch(function(oError) {
			assert.deepEqual(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");

		}).then(function() {
			sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(-1);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectedIndex(0).then(function() {
				assert.ok(false, "The promise should have been rejected because the indices are out of range");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
				oSelectionPlugin._getHighestSelectableIndex.restore();
			});

		}).then(function() {
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectedIndex(iHighestSelectableIndex + 1).then(function() {
				assert.ok(false, "The promise should have been rejected because the indices are out of range");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});

		}).then(function() {
			oSelectionPlugin.setSelectionMode(SelectionMode.None);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oSelectionPlugin.setSelectedIndex(1).then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError){
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Selection using setSelectedIndex", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [3], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		return oSelectionPlugin.setSelectedIndex(3).then(function() {
			assert.ok(fnGetContexts.calledWithExactly(3, 1), "getContexts was called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [3], "The selection is correct");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [3, 5], "selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.setSelectedIndex(5).then(function() {
				assert.ok(fnGetContexts.calledWithExactly(5, 1), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5], "The selection is correct");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");
			});

		}).then(function() {
			return oSelectionPlugin.setSelectedIndex(-1).catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5], "The selection did not change");
			});
		});
	});

	QUnit.test("selectionChange event: custom payload", function(assert) {
		var oTable = this.oTable;
		var oSelectionPlugin = oTable._getSelectionPlugin();

		oSelectionPlugin.setLimit(0);

		return oSelectionPlugin.setSelectionInterval(0, 1).then(function() {
			var aPromises = [];

			oSelectionPlugin.attachSelectionChange(function(oEvent) {
				var oCustomPayload = oEvent.getParameter("customPayload");
				assert.step(oCustomPayload ? oCustomPayload.d : "" + oCustomPayload);
			});

			aPromises.push(oSelectionPlugin.addSelectionInterval(0, 0, {d: "addSelectionInterval"}));
			oSelectionPlugin.removeSelectionInterval(0, 0, {d: "removeSelectionInterval"});
			aPromises.push(oSelectionPlugin.setSelectionInterval(0, 2, {d: "setSelectionInterval"}));
			aPromises.push(oSelectionPlugin.setSelectionInterval(3, 3, "not an object"));
			oSelectionPlugin.clearSelection({d: "clearSelection"});
			aPromises.push(oSelectionPlugin.setSelectedIndex(4, {d: "setSelectedIndex"}));
			aPromises.push(oSelectionPlugin.selectAll({d: "selectAll"}));

			return Promise.all(aPromises).then(function() {
				assert.verifySteps([
					"removeSelectionInterval",
					"clearSelection",
					"addSelectionInterval",
					"setSelectionInterval",
					"null", // not an object
					"setSelectedIndex",
					"selectAll"
				], "The custom event payload is correctly transported to the event listener");
			});
		});
	});

	QUnit.test("Mouse interaction", function(assert) {
		var oTable = this.oTable;
		var oSelectionPlugin = oTable._getSelectionPlugin();

		function doSelection(fnSelect) {
			return Promise.race([
				new Promise(function(resolve) {
					oSelectionPlugin.attachEventOnce("selectionChange", resolve);
					fnSelect();
				}),
				new Promise(function(resolve) {
					// Maximum wait time required if, for example, fnSelect does not trigger a selectionChange event.
					setTimeout(resolve, 10);
				})
			]);
		}

		function pressHeaderSelector() {
			return doSelection(function() {
				oSelectionPlugin.onHeaderSelectorPress();
			});
		}

		return pressHeaderSelector().then(function() {
			assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
				"Limit enabled: Pressing the header selector does not change the selection if nothing is selected");
		}).then(function() {
			return doSelection(function() {
				oSelectionPlugin.addSelectionInterval(0, 5);
			}).then(pressHeaderSelector).then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
					"Limit enabled: Pressing the header selector deselects everything if something is selected");
			});
		}).then(function() {
			oSelectionPlugin.setLimit(0);

			return pressHeaderSelector().then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, oTable.getBinding("rows").getLength(),
					"Limit disabled: Pressing the header selector selects everything if not everything is selected");
			}).then(pressHeaderSelector).then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
					"Limit disabled: Pressing the header selector deselects everything if everything is selected");
			});
		}).then(function() {
			oSelectionPlugin.setShowHeaderSelector(false);

			return doSelection(function() {
				oSelectionPlugin.addSelectionInterval(0, 5);
			}).then(pressHeaderSelector).then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Limit disabled, header selector hidden: Pressing the header selector does not change the selection");
			});
		}).then(function() {
			oSelectionPlugin.setLimit(200);

			return pressHeaderSelector().then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Limit enabled, header selector hidden: Pressing the header selector does not change the selection");
			});
		});
	});

	QUnit.test("Keyboard interaction", function(assert) {
		var oTable = this.oTable;
		var oSelectionPlugin = oTable._getSelectionPlugin();

		function doSelection(fnSelect) {
			return Promise.race([
				new Promise(function(resolve) {
					oSelectionPlugin.attachEventOnce("selectionChange", resolve);
					fnSelect();
				}),
				new Promise(function(resolve) {
					// Maximum wait time required if, for example, fnSelect does not trigger a selectionChange event.
					setTimeout(resolve, 10);
				})
			]);
		}

		function pressKeyboardShortcut(sType) {
			return doSelection(function() {
				oSelectionPlugin.onKeyboardShortcut(sType);
			});
		}

		return doSelection(function() {
			oSelectionPlugin.addSelectionInterval(0, 5);
		}).then(function() {
			return pressKeyboardShortcut("toggle").then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Limit enabled: The \"toggle\" shortcut does not change the selection if the limit is enabled");
			});
		}).then(function() {
			return pressKeyboardShortcut("clear").then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
					"Limit enabled: The \"clear\" shortcut deselects everything");
			}).then(function() {
				return pressKeyboardShortcut("clear").then(function() {
					assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
						"Limit enabled: The \"clear\" shortcut does not change the selection if nothing is selected");
				});
			});
		}).then(function() {
			oSelectionPlugin.setLimit(0);

			return pressKeyboardShortcut("toggle").then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, oTable.getBinding("rows").getLength(),
					"Limit disabled: The \"toggle\" shortcut selects everything if not everything is selected");
			}).then(function() {
				return pressKeyboardShortcut("toggle");
			}).then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
					"Limit disabled: The \"toggle\" shortcut deselects everything if everything is selected");
			});
		}).then(function() {
			return doSelection(function() {
				oSelectionPlugin.addSelectionInterval(0, 5);
			}).then(function() {
				return pressKeyboardShortcut("clear");
			}).then(function() {
				assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
					"Limit disabled: The \"clear\" shortcut deselects everything");
			}).then(function() {
				return pressKeyboardShortcut("clear").then(function() {
					assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
						"Limit disabled: The \"clear\" shortcut does not change the selection if nothing is selected");
				});
			});
		});
	});

	QUnit.test("Selection using SelectAll: Selection not possible", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(this.oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		sinon.stub(oSelectionPlugin, "getSelectableCount").returns(0);

		return oSelectionPlugin.selectAll().then(function() {
			assert.ok(false, "The promise should have been rejected because the limit is enabled");
		}).catch(function(oError) {
			assert.deepEqual(oError.toString(), "Error: Not possible if the limit is enabled",
				"Promise rejected with Error: Not possible if the limit is enabled");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");

		}).then(function() {
			oSelectionPlugin.setLimit(0);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			return oSelectionPlugin.selectAll().then(function() {
				assert.ok(false, "The promise should have been rejected because there is nothing to select");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: Nothing to select", "Promise rejected with Error: Nothing to select");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
				oSelectionPlugin.getSelectableCount.restore();
			});

		}).then(function() {
			oSelectionPlugin.setSelectionMode(SelectionMode.None);
			fnGetContexts.reset();
			oSelectionChangeSpy.reset();
			oSelectionPlugin.selectAll().then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError){
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Select All", function(assert) {
		var oTable = this.oTable;
		var oSelectionPlugin = oTable._getSelectionPlugin();
		var fnGetContexts = sinon.spy(oTable.getBinding("rows"), "getContexts");
		var oSelectionChangeSpy = sinon.spy();
		var iSelectableCount = oSelectionPlugin.getSelectableCount();

		assert.equal(oSelectionPlugin.getRenderConfig().headerSelector.type, "clear", "The headerSelector type is clear");

		oSelectionPlugin.setLimit(0);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		sap.ui.getCore().applyChanges();

		assert.equal(oSelectionPlugin.getRenderConfig().headerSelector.type, "toggle", "The headerSelector type is toggle");

		fnGetContexts.reset();
		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
				"selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		return oSelectionPlugin.selectAll().then(function() {
			assert.ok(fnGetContexts.calledWithExactly(0, iSelectableCount), "getContexts was called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, iSelectableCount, "The correct indices are selected");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired");

		}).then(function() {
			oSelectionPlugin.setLimit(5);
			return oSelectionPlugin.selectAll().catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, iSelectableCount, "The selection did not change");
			});
		});
	});

	QUnit.test("Scroll position", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		var $Cell;
		var that = this;

		this.oTable.setVisibleRowCountMode(tableLibrary.VisibleRowCountMode.Fixed);
		this.oTable.setVisibleRowCount(3);
		oSelectionPlugin.setLimit(5);
		sap.ui.getCore().applyChanges();

		return new Promise(function(resolve) {
			setTimeout(function() {
				oSelectionPlugin.attachEventOnce("selectionChange", function() {
					resolve();
				});
				$Cell = that.oTable.$("rowsel0");
				qutils.triggerEvent("click", $Cell);
			}, 100);
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable.attachEventOnce("_rowsUpdated", function() {
					assert.ok(oSelectionSpy.calledTwice, "The selection was added and then the table was scrolled");
					assert.equal(that.oTable.getFirstVisibleRow(), 4, "Table is scrolled at the correct position");
					resolve();
				});
				that.oTable.setFirstVisibleRow(7);
				$Cell = that.oTable.$("rowsel1");
				qutils.triggerEvent("click", $Cell, {shiftKey: true});
			});
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable.setVisibleRowCount(10);
				var oScrollSpy = sinon.spy(that.oTable, "setFirstVisibleRow");
				oSelectionPlugin.setSelectionInterval(5, 10);
				setTimeout(function() {
					assert.ok(oScrollSpy.notCalled, "The table is not scrolled because the last selected row is already visible");
					resolve();
				}, 100);
			});
		});
	});

	QUnit.test("Scroll position (reverse range selection)", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		var oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		var $Cell;
		var that = this;

		this.oTable.setVisibleRowCountMode(tableLibrary.VisibleRowCountMode.Fixed);
		this.oTable.setVisibleRowCount(3);
		oSelectionPlugin.setLimit(5);
		sap.ui.getCore().applyChanges();

		return new Promise(function(resolve) {
			setTimeout(function() {
				oSelectionPlugin.attachEventOnce("selectionChange", function() {
					resolve();
				});

				that.oTable.setFirstVisibleRow(7);
				var $Cell = that.oTable.$("rowsel2");
				qutils.triggerEvent("click", $Cell);
			}, 100);
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable.attachEventOnce("_rowsUpdated", function() {
					assert.ok(oSelectionSpy.calledTwice, "The selection was added and then the table was scrolled");
					assert.equal(that.oTable.getFirstVisibleRow(), 3, "Table is scrolled at the correct position");
					resolve();
				});
				that.oTable.setFirstVisibleRow(0);
				$Cell = that.oTable.$("rowsel0");
				qutils.triggerEvent("click", $Cell, {shiftKey: true});
			});
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable.setVisibleRowCount(10);
				var oScrollSpy = sinon.spy(that.oTable, "setFirstVisibleRow");
				oSelectionPlugin.setSelectionInterval(10, 5);
				setTimeout(function() {
					assert.ok(oScrollSpy.notCalled, "The table is not scrolled because the last selected row is already visible");
					resolve();
				}, 100);
			});
		});
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

		oSelectionPlugin.attachEventOnce("selectionChange", function() {
			assert.ok(fnGetContexts.calledWithExactly(9, 1), "getContexts was called with the correct parameters");
			assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [9], "Only one item is selected (iIndexTo)");

			oSelectionPlugin.attachEventOnce("selectionChange", function() {
				assert.ok(fnGetContexts.calledWithExactly(4, 1), "getContexts was called with the correct parameters");
				assert.ok(fnGetContexts.calledOnce, "getContexts was called once");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4], "Only one item is selected (iIndexTo)");

				qutils.triggerEvent("click", oCell);
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

		assert.ok(fnGetContexts.notCalled, "getContexts is not called");
		assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");

		return new Promise(function(resolve) {
			setTimeout(function() {
				assert.ok(fnGetContexts.notCalled, "getContexts is not called");
				assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");
				resolve();
			}, 100);
		});
	});

	QUnit.test("Limit notification", function(assert) {
		var done = assert.async(),
			iLimit = 5,
			oTable = this.oTable,
			oSelectionPlugin = this.oTable._oSelectionPlugin;

		assert.notOk(oSelectionPlugin._oNotificationPopover, "Notification popover does not exist");

		oSelectionPlugin.setEnableNotification(true);

		// Ensures that the Popover control is loaded and initialized
		this.oTable._oSelectionPlugin._showNotificationPopoverAtIndex(0).then(function() {
			var oPopover = oSelectionPlugin._oNotificationPopover;

			assert.ok(oPopover, "Notification popover was created");
			oPopover.close();

			var oPopoverOpenBySpy = sinon.spy(oPopover, "openBy");
			var oPopoverCloseSpy = sinon.spy(oPopover, "close");

			oSelectionPlugin.setLimit(iLimit);
			oSelectionPlugin.setEnableNotification(false);
			oSelectionPlugin.setSelectionInterval(0, iLimit);

			setTimeout(function() {
				assert.ok(oPopoverOpenBySpy.notCalled, "Popover.openBy is not called because enableNotification is false");

				oSelectionPlugin.setEnableNotification(true);
				oSelectionPlugin.setSelectionInterval(0, iLimit - 1);
				setTimeout(function() {
					assert.ok(oPopoverOpenBySpy.notCalled, "Popover.openBy is not called because the limit is not reached");

					oSelectionPlugin.setSelectionInterval(0, iLimit);

					oPopover.attachEventOnce("afterOpen", function () {
						assert.ok(oPopoverOpenBySpy.calledOnce, "Popover.openBy is called");
						assert.ok(oPopoverOpenBySpy.calledWithExactly(oTable.getRows()[iLimit - 1].getDomRefs().rowSelector),
							"Popover.openBy is called with the correct parameters");

						oTable.setFirstVisibleRow(oTable.getFirstVisibleRow() + 1);
						assert.ok(oPopoverCloseSpy.calledOnce, "Notification closes");

						done();
					});
				}, 100);
			}, 100);
		});
	});
});