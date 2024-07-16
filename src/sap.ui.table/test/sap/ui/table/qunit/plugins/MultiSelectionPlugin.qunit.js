/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/IconPool"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin,
	SelectionPlugin,
	FixedRowMode,
	TableUtils,
	library,
	ODataModel,
	qutils,
	MockServer,
	IconPool
) {
	"use strict";

	const sServiceURI = "/service/";
	const SelectionMode = library.SelectionMode;

	function startMockServer() {
		MockServer.config({
			autoRespond: true
		});

		const oMockServer = new MockServer({
			rootUri: sServiceURI
		});

		const sURLPrefix = sap.ui.require.toUrl("sap/ui/table/qunit");
		oMockServer.simulate(sURLPrefix + "/mockdata/metadata.xml", sURLPrefix + "/mockdata/");
		oMockServer.start();
		return oMockServer;
	}

	QUnit.module("Basics", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertRenderConfig: function(assert, mActualConfig, mExpectedConfig, sTitle) {
			let oActualIcon;
			let sExpectedIconUri;

			if (mActualConfig.headerSelector) {
				oActualIcon = mActualConfig.headerSelector.icon ? mActualConfig.headerSelector.icon : undefined;
				delete mActualConfig.headerSelector.icon;
			}

			if (mExpectedConfig.headerSelector) {
				sExpectedIconUri = mExpectedConfig.headerSelector.icon != null ? "sap-icon://" + mExpectedConfig.headerSelector.icon : undefined;
				delete mExpectedConfig.headerSelector.icon;
			}

			assert.deepEqual(mActualConfig, mExpectedConfig, sTitle);

			if (sExpectedIconUri == null && oActualIcon) {
				assert.ok(false, sTitle + "; Should not contain an icon");
			} else if (sExpectedIconUri != null && !oActualIcon) {
				assert.ok(false, sTitle + "; Should contain an icon");
			} else if (sExpectedIconUri == null && !oActualIcon) {
				assert.ok(true, sTitle + "; Does not contain an icon");
			} else {
				assert.equal(oActualIcon.getSrc(), sExpectedIconUri, sTitle + "; Contains the correct icon");
			}
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		assert.strictEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
		assert.equal(oMultiSelectionPlugin.getAggregation("icon"), null, "The MultiSelectionPlugin has no icon");

	});

	QUnit.test("Add to and remove from table", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addDependent(oMultiSelectionPlugin);
		assert.notEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has an internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.getAggregation("icon"), null, "The MultiSelectionPlugin has an icon");

		this.oTable.removeDependent(oMultiSelectionPlugin);
		assert.strictEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
		assert.notEqual(oMultiSelectionPlugin.getAggregation("icon"), null, "The MultiSelectionPlugin has an icon");
	});

	QUnit.test("Destruction", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addDependent(oMultiSelectionPlugin);

		const oInternalPluginDestroySpy = sinon.spy(oMultiSelectionPlugin.oInnerSelectionPlugin, "destroy");

		oMultiSelectionPlugin.destroy();
		assert.ok(oInternalPluginDestroySpy.calledOnce, "The internal default selection plugin was destroyed");
		assert.strictEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The reference to the internal default selection plugin was cleared");

		this.oTable.addDependent(new MultiSelectionPlugin());
		this.oTable.destroyDependents();
		assert.ok(this.oTable._getSelectionPlugin().isA("sap.ui.table.plugins.SelectionModelSelection"), "The table has a legacy selection plugin");
	});

	QUnit.test("#getRenderConfig", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		const sDeselectAll = TableUtils.getResourceText("TBL_DESELECT_ALL");
		const sSelectAll = TableUtils.getResourceText("TBL_SELECT_ALL");
		const that = this;

		this.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "none"
			}
		}, "Not assigned to a table");

		this.oTable.addDependent(oMultiSelectionPlugin);

		this.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "custom",
				icon: TableUtils.ThemeParameters.checkboxIcon,
				visible: true,
				enabled: true,
				selected: false,
				tooltip: sSelectAll
			}
		}, "MultiToggle");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.Single);
		this.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "custom",
				icon: null,
				visible: false,
				enabled: true,
				selected: false,
				tooltip: sSelectAll
			}
		}, "Single");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.MultiToggle);
		oMultiSelectionPlugin.setShowHeaderSelector(false);
		this.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "custom",
				icon: TableUtils.ThemeParameters.checkboxIcon,
				visible: false,
				enabled: true,
				selected: false,
				tooltip: sSelectAll
			}
		}, "MultiToggle; Header selector hidden");

		oMultiSelectionPlugin.setShowHeaderSelector(true);
		oMultiSelectionPlugin.setLimit(0);
		this.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "toggle",
				icon: null,
				visible: true,
				enabled: true,
				selected: false,
				tooltip: sSelectAll
			}
		}, "MultiToggle; Limit disabled");

		return oMultiSelectionPlugin.selectAll().then(function() {
			that.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
				headerSelector: {
					type: "toggle",
					icon: null,
					visible: true,
					enabled: true,
					selected: true,
					tooltip: sDeselectAll
				}
			}, "MultiToggle; Limit disabled; All rows selected");

			oMultiSelectionPlugin.setLimit(1);
			return oMultiSelectionPlugin.setSelectionInterval(1, 1);
		}).then(function() {
			that.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
				headerSelector: {
					type: "custom",
					icon: TableUtils.ThemeParameters.clearSelectionIcon,
					visible: true,
					enabled: true,
					selected: false,
					tooltip: sDeselectAll
				}
			}, "MultiToggle; One row selected");

			oMultiSelectionPlugin.setSelectionMode(SelectionMode.Single);
			return oMultiSelectionPlugin.setSelectionInterval(1, 1);
		}).then(function() {
			that.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
				headerSelector: {
					type: "custom",
					icon: null,
					visible: false,
					enabled: true,
					selected: false,
					tooltip: sDeselectAll
				}
			}, "Single; One row selected");

			oMultiSelectionPlugin.setSelectionMode(SelectionMode.MultiToggle);
			oMultiSelectionPlugin.setEnabled(false);
			that.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
				headerSelector: {
					type: "none"
				}
			}, "MultiToggle; Plugin disabled");

			oMultiSelectionPlugin.setEnabled(true);
			oMultiSelectionPlugin.setSelectionMode(SelectionMode.None);
			that.assertRenderConfig(assert, oMultiSelectionPlugin.getRenderConfig(), {
				headerSelector: {
					type: "custom",
					icon: null,
					visible: false,
					enabled: true,
					selected: false,
					tooltip: sSelectAll
				}
			}, "None");
		});
	});

	QUnit.test("#setSelected", async function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		const that = this;

		oMultiSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [], "Select a row when not assigned to a table");

		that.oTable.addDependent(oMultiSelectionPlugin);
		oMultiSelectionPlugin.setSelected(that.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", oMultiSelectionPlugin);

		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [0], "Select a row");
		oMultiSelectionPlugin.setSelected(that.oTable.getRows()[2], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", oMultiSelectionPlugin);

		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [0, 1, 2], "Select a range");
		oMultiSelectionPlugin.setSelected(that.oTable.getRows()[1], false);
		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [0, 2], "Deselect a row");

		oMultiSelectionPlugin.clearSelection();
		that.oTable.getModel().setData();
		await this.oTable.qunit.whenRenderingFinished();

		oMultiSelectionPlugin.setSelected(that.oTable.getRows()[0], true);
		await TableQUnitUtils.wait(100);

		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [], "Select a row that is not selectable");
	});

	QUnit.test("findOn", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		this.oTable.addDependent(oMultiSelectionPlugin);

		assert.ok(SelectionPlugin.findOn(this.oTable) === oMultiSelectionPlugin,
			"Plugin found on dependents aggregation via SelectionPlugin.findOn");
		assert.ok(MultiSelectionPlugin.findOn(this.oTable) === oMultiSelectionPlugin,
			"Plugin found on dependents aggregation via MultiSelectionPlugin.findOn");
	});

	QUnit.module("Deselect All button", {
		beforeEach: async function() {
			this.oMockServer = startMockServer();
			this.oTable = await TableQUnitUtils.createTable({
				dependents: [
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
		const oTable = this.oTable;
		const $SelectAll = oTable.$("selall");
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const oIcon = oSelectionPlugin.getAggregation("icon");
		const oOnBindingChangeSpy = sinon.spy(oSelectionPlugin, "_onBindingChange");

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.ok($SelectAll.attr("aria-disabled"), "Before bindRows: aria-disabled is set to true");
			assert.ok($SelectAll.hasClass("sapUiTableSelAllDisabled"), "Before bindRows: Deselect All is disabled");

			assert.ok(!oIcon.getUseIconTooltip(), "DeselectAll icon has no tooltip");
			assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon), "allSelectedIcon icon is correct");
			assert.strictEqual($SelectAll.attr("title"), TableUtils.getResourceText("TBL_SELECT_ALL"), "AllSelected tooltip is correct");
			assert.strictEqual($SelectAll.attr("aria-disabled"), "true", "Aria-Disabled set to true");
			assert.ok(oIcon.hasStyleClass("sapUiTableSelectClear"), "DeselectAll icon has the correct css class applied");

			oTable.bindRows({path: "/Products"});
			oTable.setModel(new ODataModel(sServiceURI, {
				json: true
			}));
		}).then(oTable.qunit.whenBindingChange).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.ok(oTable.getBinding().getLength() > 0, "After bindRows: Table has data");
			assert.strictEqual($SelectAll.attr("role"), "button", "role attribute is set to button");
			assert.notOk($SelectAll.attr("aria-disabled"), "After bindRows: aria-disabled is undefined");
			assert.notOk($SelectAll.hasClass("sapUiTableSelAllDisabled"), "After bindRows: Select All is enabled");
			assert.ok($SelectAll.hasClass("sapUiTableSelAllVisible"), "After bindRows: Select All is visible");

			assert.ok(!oIcon.getUseIconTooltip(), "SelectAll icon has no tooltip");
			assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon), "checkboxIcon icon is correct");
			assert.ok(oOnBindingChangeSpy.called, "_onBindingChange has been called");
			assert.strictEqual($SelectAll.attr("title"), TableUtils.getResourceText("TBL_SELECT_ALL"), "AllSelected tooltip is correct");
			assert.strictEqual($SelectAll.attr("aria-disabled"), undefined, "Aria-Disabled is undefined");
			assert.ok(oIcon.hasStyleClass("sapUiTableSelectClear"), "AllSelected icon has the correct css class applied");
		}).then(function() {
			return new Promise(function(resolve) {
				oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
					assert.notOk($SelectAll.attr("aria-disabled"), "After rows are selected: aria-disabled is undefined");
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

	QUnit.test("Event parameters of internal default selection plugin", async function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.destroy();
		this.oTable = await TableQUnitUtils.createTable({
			rows: {path: "/"},
			dependents: [
				oMultiSelectionPlugin
			],
			models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
		});
		assert.expect(2);
		oMultiSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameter("_internalTrigger"), undefined,
				"SelectionChange _internalTrigger parameter is undefined");

			oMultiSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("_internalTrigger"), true,
					"SelectionChange _internalTrigger parameter is true after growing table and changing binding length");
			});
		});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			return oMultiSelectionPlugin.addSelectionInterval(0, 4).then(function() {
				this.oTable.getBinding().getModel().getData().push({});
				this.oTable.getBinding().refresh();
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("Multi selection behavior", {
		beforeEach: async function() {
			this.oMockServer = startMockServer();
			this.oTable = await TableQUnitUtils.createTable({
				dependents: [
					new MultiSelectionPlugin()
				],
				rows: {
					path: "/Products"
				},
				models: new ODataModel(sServiceURI, {
					json: true
				}),
				rowMode: new FixedRowMode()
			});

			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("Display and accessibility", async function(assert) {
		const oTable = this.oTable;
		const $SelectAll = oTable.$("selall");
		const oSelectionPlugin = oTable._getSelectionPlugin();

		assert.ok(oSelectionPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin"), "MultiSelectionPlugin is initialised");
		assert.strictEqual($SelectAll.find(".sapUiTableSelectAllCheckBox").length, 0, "no Select All checkbox");
		assert.strictEqual($SelectAll.find(".sapUiTableSelectClear").length, 1, "Deselect All button exists");
		assert.strictEqual($SelectAll.attr("title"), "Select All", "Tooltip exists");
		assert.strictEqual($SelectAll.attr("role"), "button", "role attribute is set to button");
		assert.notOk($SelectAll.attr("aria-disabled"), "aria-disabled is undefined");
		oTable.setEnableSelectAll(false);
		assert.strictEqual($SelectAll.attr("title"), "Select All", "Tooltip exists");
		assert.notOk($SelectAll.attr("aria-disabled"), "aria-disabled is undefined");
		assert.notOk($SelectAll.hasClass("sapUiTableSelAllDisabled"), "Deselect All is enabled");

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		oSelectionPlugin.setSelectedIndex(0);
		await nextSelectionChange;

		assert.strictEqual($SelectAll.attr("title"), "Deselect All", "Tooltip exists");
		assert.notOk($SelectAll.attr("aria-disabled"), "aria-disabled is removed");
		assert.notOk($SelectAll.hasClass("sapUiTableSelAllDisabled"), "Deselect All is enabled");
		oTable.setEnableSelectAll(true);

		const oSetPropertySpy = sinon.spy(oSelectionPlugin, "setProperty");
		oSelectionPlugin.setLimit(5);
		await oTable.qunit.whenRenderingFinished();

		assert.ok(oSetPropertySpy.calledOnceWithExactly("limit", 5, true), "setProperty called once with the correct parameters");
		oSetPropertySpy.resetHistory();

		oSelectionPlugin.setLimit(0);
		await oTable.qunit.whenRenderingFinished();

		assert.ok(oSetPropertySpy.calledOnceWithExactly("limit", 0, false), "setProperty called once with the correct parameters");

		assert.strictEqual($SelectAll.find(".sapUiTableSelectAllCheckBox").length, 1,
			"When the limit is set to -1 the Select All checkbox is rendered");
		assert.strictEqual($SelectAll.find(".sapUiTableSelectClear").length, 0,
			"When the limit is set to -1 the Deselect All button is not rendered");
		assert.strictEqual($SelectAll.attr("title"), "Select All", "Tooltip exists");
	});

	QUnit.test("Change SelectionMode", function(assert) {
		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is correctly initialized");

		this.oTable.removeAllDependents();
		this.oTable.addDependent(new MultiSelectionPlugin({
			selectionMode: "Single"
		}));
		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.Single, "SelectionMode is correctly initialized");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.Single, "SelectionMode is properly set in the Table");

		this.oTable._getSelectionPlugin().setSelectionMode(SelectionMode.MultiToggle);
		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is properly set");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.MultiToggle, "The SelectionMode is properly set in the Table");
	});

	QUnit.test("Selection using addSelectionInterval: Selection not possible", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.addSelectionInterval(6, 7).then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Selection using addSelectionInterval: Number of items in range below limit", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iSelectableCount = oSelectionPlugin.getSelectableCount();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		return oSelectionPlugin.addSelectionInterval(0, 4).then(function() {
			assert.ok(fnGetContexts.calledOnceWithExactly(0, 5, 0, true), "getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4],
				"Range selection is possible for number of items below limit");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [5], "selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			return oSelectionPlugin.addSelectionInterval(-1, 5).then(function() {
				assert.ok(fnGetContexts.calledOnceWithExactly(1, 5, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Multiple selections are possible. When indexFrom is already selected, the selection starts from the next index");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
			});

		}).then(async function() {
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.addSelectionInterval(5, 5);
			await TableQUnitUtils.wait(100);

			assert.ok(fnGetContexts.calledOnceWithExactly(5, 1, 0, true), "getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
				"The selection is not changed because the index was already selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [iSelectableCount - 1],
					"selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			return oSelectionPlugin.addSelectionInterval(iSelectableCount - 1, iSelectableCount + 100).then(function() {
				assert.ok(fnGetContexts.calledOnceWithExactly(iSelectableCount - 1, 1, 0, true),
					"getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, iSelectableCount - 1],
					"Range selection is possible for number of items below limit");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
			});

		}).then(function() {
			return oSelectionPlugin.addSelectionInterval(-1, -1).catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, iSelectableCount - 1], "The selection did not change");
			});
		});
	});

	QUnit.test("Reverse selection using addSelectionInterval: Number of items in range below limit", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		oSelectionPlugin.setLimit(5);

		return new Promise(function(resolve) {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.ok(fnGetContexts.calledOnceWithExactly(5, 5, 0, true), "getContexts was called once with the correct parameters");
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
					assert.ok(fnGetContexts.calledOnceWithExactly(4, 5, 0, true), "getContexts was called once with the correct parameters");
					assert.deepEqual(oEvent.getParameters().rowIndices, [4], "rowIndices parameter is correct");
					assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
					assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4, 5, 6, 7, 8, 9],
						"Multiple selections are possible. When indexFrom is already selected, the selection starts from the previous index");
					resolve();
				});

				fnGetContexts.resetHistory();
				oSelectionPlugin.addSelectionInterval(9, 4);
			});
		});
	});

	QUnit.test("Selection using addSelectionInterval: Number of items in range above limit", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const oFirstVisibleRowChangedSpy = sinon.spy();
		const oRowsUpdatedSpy = sinon.spy();

		oTable.getRowMode().setRowCount(3);
		oSelectionPlugin.setLimit(5);
		await oTable.qunit.whenRenderingFinished();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		oTable.attachFirstVisibleRowChanged(oFirstVisibleRowChangedSpy);
		oTable.attachRowsUpdated(oRowsUpdatedSpy);

		return new Promise(function(resolve) {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.ok(fnGetContexts.calledOnceWithExactly(0, 1, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "First row is selected");
				assert.deepEqual(oEvent.getParameters().rowIndices, [0], "rowIndices parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				resolve();
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oFirstVisibleRowChangedSpy.resetHistory();
			oRowsUpdatedSpy.resetHistory();
			oSelectionPlugin.addSelectionInterval(0, 0);

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [1, 2, 3, 4, 5], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.ok(fnGetContexts.calledOnceWithExactly(1, 6, 0, true), "getContexts was called once with the correct parameters");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oFirstVisibleRowChangedSpy.resetHistory();
			oRowsUpdatedSpy.resetHistory();
			return oSelectionPlugin.addSelectionInterval(0, 10).then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
					"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
				assert.equal(oTable.getFirstVisibleRow(), 4, "The firstVisibleRow is correct");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
				assert.ok(oFirstVisibleRowChangedSpy.calledOnce, "The \"firstVisibleRowChanged\" event was fired");
				assert.ok(oRowsUpdatedSpy.calledOnce, "The \"rowsUpdated\" event was fired");
			});

		}).then(function() {
			oSelectionPlugin.setEnableNotification(true);
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [6, 7, 8, 9, 10], "rowIndices parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.ok(fnGetContexts.calledOnceWithExactly(6, 6, 0, true), "getContexts was called once with the correct parameters");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oFirstVisibleRowChangedSpy.resetHistory();
			oRowsUpdatedSpy.resetHistory();
			return oSelectionPlugin.addSelectionInterval(6, 15).then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
					"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
				assert.equal(oTable.getFirstVisibleRow(), 9, "The firstVisibleRow is correct");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
				assert.ok(oFirstVisibleRowChangedSpy.calledOnce, "The \"firstVisibleRowChanged\" event was fired");
				assert.ok(oRowsUpdatedSpy.calledOnce, "The \"rowsUpdated\" event was fired");
			});
		});
	});

	QUnit.test("Reverse selection using addSelectionInterval: Number of items in range above limit", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		oSelectionPlugin.setLimit(5);

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(9, 0);
		const oEvent = await nextSelectionChange;

		assert.ok(fnGetContexts.calledOnceWithExactly(4, 6, 0, true),
			"getContexts was called once with the correct parameters"); // the table will scroll one extra row
		assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
		assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9],
			"Selection is cut down to the possible limit.");
	});

	QUnit.test("Selection using setSelectionInterval: Selection not possible", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.setSelectionInterval(6, 7).then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Selection using setSelectionInterval", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iSelectableCount = oSelectionPlugin.getSelectableCount();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.ok(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();

		return oSelectionPlugin.setSelectionInterval(-1, 10).then(function() {
			assert.ok(fnGetContexts.calledOnceWithExactly(0, 6, 0, true), "getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Selection is cut down to the possible limit");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
					"selectionChange event: \"rowIndices\" parameter is correct");
				assert.ok(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			return oSelectionPlugin.setSelectionInterval(5, 15).then(function() {
				assert.ok(fnGetContexts.calledOnceWithExactly(5, 6, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "Selection is cut down to the possible limit");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
			});

		}).then(async function() {
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.setSelectionInterval(5, 10); // Limit reached
			await TableQUnitUtils.wait(100);

			assert.ok(fnGetContexts.calledOnceWithExactly(5, 6, 0, true), "getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "The selection did not change");
			assert.ok(oSelectionChangeSpy.notCalled, "The selectionChange event was not fired");
		}).then(async function() {
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.setSelectionInterval(5, 9); // Limit not reached
			await TableQUnitUtils.wait(100);

			assert.ok(fnGetContexts.calledOnceWithExactly(5, 5, 0, true), "getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "The selection did not change");
			assert.ok(oSelectionChangeSpy.notCalled, "The selectionChange event was not fired");
		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9, iSelectableCount - 1],
					"selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			return oSelectionPlugin.setSelectionInterval(iSelectableCount - 1, iSelectableCount + 100).then(function() {
				assert.ok(fnGetContexts.calledOnceWithExactly(iSelectableCount - 1, 1, 0, true),
					"getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [iSelectableCount - 1], "The correct index is selected");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
			});

		}).then(function() {
			return oSelectionPlugin.setSelectionInterval(-1, -1).catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [iSelectableCount - 1], "The selection did not change");
			});
		});
	});

	QUnit.test("Selection using setSelectedIndex: Selection not possible", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.setSelectedIndex(1).then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Selection using setSelectedIndex", function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [3], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		return oSelectionPlugin.setSelectedIndex(3).then(function() {
			assert.ok(fnGetContexts.calledOnceWithExactly(3, 1, 0, true), "getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [3], "The selection is correct");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		}).then(function() {
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameters().rowIndices, [3, 5], "selectionChange event: \"rowIndices\" parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			return oSelectionPlugin.setSelectedIndex(5).then(function() {
				assert.ok(fnGetContexts.calledOnceWithExactly(5, 1, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5], "The selection is correct");
				assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
			});

		}).then(function() {
			return oSelectionPlugin.setSelectedIndex(-1).catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5], "The selection did not change");
			});
		});
	});

	QUnit.test("selectionChange event: custom payload", function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();

		oSelectionPlugin.setLimit(0);

		return oSelectionPlugin.setSelectionInterval(0, 1).then(function() {
			const aPromises = [];

			oSelectionPlugin.attachSelectionChange(function(oEvent) {
				const oCustomPayload = oEvent.getParameter("customPayload");
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
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();

		function doSelection(fnSelect) {
			return Promise.race([
				new Promise(function(resolve) {
					oSelectionPlugin.attachEventOnce("selectionChange", resolve);
					fnSelect();
				}),
				// Maximum wait time required if, for example, fnSelect does not trigger a selectionChange event.
				TableQUnitUtils.wait(10)
			]);
		}

		function pressHeaderSelector() {
			return doSelection(function() {
				oSelectionPlugin.onHeaderSelectorPress();
			});
		}

		return pressHeaderSelector().then(function() {
			assert.equal(oSelectionPlugin.getSelectedIndices().length, 16,
				"Limit enabled: Pressing the header selector triggers select all and selects until its limit is reached");
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
				assert.equal(oSelectionPlugin.getSelectedIndices().length, oTable.getBinding().getLength(),
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
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();

		function doSelection(fnSelect) {
			return Promise.race([
				new Promise(function(resolve) {
					oSelectionPlugin.attachEventOnce("selectionChange", resolve);
					fnSelect();
				}),
				// Maximum wait time required if, for example, fnSelect does not trigger a selectionChange event.
				TableQUnitUtils.wait(10)
			]);
		}

		function pressKeyboardShortcut(sType) {
			return doSelection(function() {
				oSelectionPlugin.onKeyboardShortcut(sType);
			});
		}

		return doSelection(function() {
			oSelectionPlugin.addSelectionInterval(0, 5);
			oSelectionPlugin.setLimit(7);
		}).then(function() {
			return pressKeyboardShortcut("toggle").then(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7],
					"Limit enabled: The \"toggle\" shortcut selects untill the limit is reached");
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
				assert.equal(oSelectionPlugin.getSelectedIndices().length, oTable.getBinding().getLength(),
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
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();

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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
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
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oSelectionPlugin.selectAll().then(function() {
				assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
			}).catch(function(oError) {
				assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
				assert.ok(fnGetContexts.notCalled, "getContexts was not called");
				assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
				assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			});
		});
	});

	QUnit.test("Select All", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		assert.equal(oSelectionPlugin.getRenderConfig().headerSelector.type, "custom", "The headerSelector type is clear");

		oSelectionPlugin.setLimit(0);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		await oTable.qunit.whenRenderingFinished();

		assert.equal(oSelectionPlugin.getRenderConfig().headerSelector.type, "toggle", "The headerSelector type is toggle");

		fnGetContexts.resetHistory();
		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
				"selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		return oSelectionPlugin.selectAll().then(function() {
			assert.ok(fnGetContexts.calledOnceWithExactly(0, iHighestSelectableIndex + 1, 0, true),
				"getContexts was called once with the correct parameters");
			assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, iHighestSelectableIndex + 1, "The correct indices are selected");
			assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		}).then(function() {
			const oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");

			sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(15);
			sinon.stub(oSelectionPlugin, "getSelectableCount").returns(10);

			oSelectionPlugin.clearSelection();
			return oSelectionPlugin.selectAll().then(function() {
				assert.ok(oSelectionSpy.calledOnceWithExactly(0, iHighestSelectableIndex, undefined),
					"addSelectionInterval was called once with the correct parameters");
			});
		}).then(function() {
			oSelectionPlugin.setLimit(5);
			return oSelectionPlugin.selectAll().catch(function() {
				assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, iHighestSelectableIndex + 1, "The selection did not change");
			});
		});
	});

	QUnit.test("Scroll position", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		let $Cell;
		const that = this;

		this.oTable.getRowMode().setRowCount(3);
		oSelectionPlugin.setLimit(5);
		await this.oTable.qunit.whenRenderingFinished();
		await TableQUnitUtils.wait(100);

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		$Cell = that.oTable.$("rowsel0");
		qutils.triggerEvent("tap", $Cell);
		await nextSelectionChange;

		const nextRowsUpdated = TableQUnitUtils.nextEvent("rowsUpdated", that.oTable);

		that.oTable.setFirstVisibleRow(7);
		$Cell = that.oTable.$("rowsel1");
		qutils.triggerEvent("tap", $Cell, {shiftKey: true});
		await nextRowsUpdated;

		assert.equal(oSelectionSpy.callCount, 2, "The selection was added and then the table was scrolled");
		assert.equal(that.oTable.getFirstVisibleRow(), 4, "Table is scrolled at the correct position");

		that.oTable.getRowMode().setRowCount(10);
		const oScrollSpy = sinon.spy(that.oTable, "setFirstVisibleRow");
		oSelectionPlugin.setSelectionInterval(5, 10);
		await TableQUnitUtils.wait(100);

		assert.ok(oScrollSpy.notCalled, "The table is not scrolled because the last selected row is already visible");
	});

	QUnit.test("Scroll position (reverse range selection)", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		let $Cell;
		const that = this;

		this.oTable.getRowMode().setRowCount(3);
		oSelectionPlugin.setLimit(5);
		await this.oTable.qunit.whenRenderingFinished();
		await TableQUnitUtils.wait(100);

		that.oTable.setFirstVisibleRow(7);

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		$Cell = that.oTable.$("rowsel2");
		qutils.triggerEvent("tap", $Cell);
		await nextSelectionChange;

		const nextRowsUpdated = TableQUnitUtils.nextEvent("rowsUpdated", that.oTable);

		that.oTable.setFirstVisibleRow(0);
		$Cell = that.oTable.$("rowsel0");
		qutils.triggerEvent("tap", $Cell, {shiftKey: true});
		await nextRowsUpdated;

		assert.ok(oSelectionSpy.calledTwice, "The selection was added and then the table was scrolled");
		assert.equal(that.oTable.getFirstVisibleRow(), 3, "Table is scrolled at the correct position");

		that.oTable.getRowMode().setRowCount(10);
		const oScrollSpy = sinon.spy(that.oTable, "setFirstVisibleRow");
		oSelectionPlugin.setSelectionInterval(10, 5);
		await TableQUnitUtils.wait(100);

		assert.ok(oScrollSpy.notCalled, "The table is not scrolled because the last selected row is already visible");
	});

	QUnit.test("Selection (selectionMode = Single)", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelectionMode(SelectionMode.Single);
		await this.oTable.qunit.whenRenderingFinished();

		const oCell = this.oTable.getDomRef("selall");
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		assert.ok(!oCell.hasAttribute("role"), "DeselectAll role is not set");
		assert.ok(!oCell.hasAttribute("title"), "DeselectAll title is not set");
		assert.ok(!oCell.hasChildNodes(), "No DeselectAll icon");

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 9);
		await nextSelectionChange;

		assert.ok(fnGetContexts.calledOnceWithExactly(9, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [9], "Only one item is selected (iIndexTo)");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		fnGetContexts.resetHistory();
		oSelectionPlugin.setSelectionInterval(0, 4);
		await nextSelectionChange;

		assert.ok(fnGetContexts.calledOnceWithExactly(4, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4], "Only one item is selected (iIndexTo)");

		qutils.triggerEvent("click", oCell);
		assert.equal(oSelectionPlugin.getSelectedCount(), 1, "the selection is not cleared");
	});

	QUnit.test("Selection (selectionMode = None)", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

		const oCell = this.oTable.getDomRef("selall");
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		assert.ok(!oCell.hasAttribute("role"), "DeselectAll role is not set");
		assert.ok(!oCell.hasAttribute("title"), "DeselectAll title is not set");
		assert.ok(!oCell.hasChildNodes(), "No DeselectAll icon");

		oSelectionPlugin.addSelectionInterval(0, 9);
		oSelectionPlugin.setSelectionInterval(0, 9);
		oSelectionPlugin.setSelectedIndex(0);
		oSelectionPlugin.selectAll();

		assert.ok(fnGetContexts.notCalled, "getContexts is not called");
		assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");
		await TableQUnitUtils.wait(100);

		assert.ok(fnGetContexts.notCalled, "getContexts is not called");
		assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");
	});

	QUnit.test("Limit notification", function(assert) {
		const iLimit = 5;
		const oTable = this.oTable;
		const oSelectionPlugin = this.oTable._oSelectionPlugin;
		let oPopoverOpenBySpy;
		let oPopoverCloseSpy;

		function resetSpies() {
			oPopoverOpenBySpy.resetHistory();
			oPopoverCloseSpy.resetHistory();
		}

		assert.notOk(oTable._oNotificationPopover, "Notification popover does not exist");

		oSelectionPlugin.setEnableNotification(true);

		// Ensures that the Popover control is loaded and initialized
		return TableUtils.showNotificationPopoverAtIndex(oTable, 0, oSelectionPlugin.getLimit()).then(function() {
			assert.ok(oTable._oNotificationPopover, "Notification popover was created");
		}).then(function() {
			return new Promise(function(resolve) {
				oTable._oNotificationPopover.attachEventOnce("afterClose", function() {
					resolve();
				});
				oTable._oNotificationPopover.close();
			});
		}).then(function() {
			oPopoverOpenBySpy = sinon.spy(oTable._oNotificationPopover, "openBy");
			oPopoverCloseSpy = sinon.spy(oTable._oNotificationPopover, "close");

		}).then(function() {
			oSelectionPlugin.setLimit(iLimit);
			oSelectionPlugin.setEnableNotification(false);
			return oSelectionPlugin.setSelectionInterval(0, iLimit).then(TableQUnitUtils.$wait(200)).then(function() {
				assert.ok(oPopoverOpenBySpy.notCalled, "Popover.openBy is not called because enableNotification is false");
				resetSpies();
			});

		}).then(function() {
			oSelectionPlugin.setEnableNotification(true);
			return oSelectionPlugin.setSelectionInterval(0, iLimit - 1).then(TableQUnitUtils.$wait(200)).then(function() {
				assert.ok(oPopoverOpenBySpy.notCalled, "Popover.openBy is not called because the limit is not reached");
				resetSpies();
			});

		}).then(function() {
			return new Promise(function(resolve) {
				oTable._oNotificationPopover.attachEventOnce("afterOpen", resolve);
				oSelectionPlugin.setSelectionInterval(0, iLimit);
			}).then(function() {
				return new Promise(function(resolve) {
					oTable._oNotificationPopover.attachEventOnce("afterClose", resolve);
					oTable.setFirstVisibleRow(oTable.getFirstVisibleRow() + 1);
				});
			}).then(function() {
				assert.equal(oPopoverOpenBySpy.callCount, 1, "Popover.openBy is called once");
				assert.ok(oPopoverOpenBySpy.calledOnceWithExactly(oTable.getRows()[iLimit - 1].getDomRefs().rowSelector),
					"Popover.openBy is called once with the correct parameters");
				assert.ok(oPopoverCloseSpy.calledOnce, "Popover.close is called once");
				resetSpies();
			});
		});
	});

	QUnit.test("Header selection icon - limit 5", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oIcon = oSelectionPlugin.getAggregation("icon");

		oSelectionPlugin.setLimit(5);

		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			"DeselectAll icon is correct - checkboxIcon");

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 4);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Row index [0, 1, 2, 3, 4] selected");
		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"DeselectAll icon is correct - clearSelectionIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(5, 9);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			"Row index [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] selected");
		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"DeselectAll icon is correct - allSelectedIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(10, 12);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			"Row index [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] selected");
		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"DeselectAll icon is correct - allSelectedIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(13, 15);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
			"Row index [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] - all indexes selected");
		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon),
			"DeselectAll icon is correct - allSelectedIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(1, 15);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "Row index 0 selected");
		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"DeselectAll icon is correct - clearSelectionIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(0, 15);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [], "Nothing selected");
		assert.strictEqual(oIcon.getSrc(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			"DeselectAll icon is correct - checkboxIcon");
	});

	QUnit.test("Header selection icon - limit deactivated", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 2);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2], "Row index [0, 1, 2] selected");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(9, 4);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 4, 5, 6, 7, 8, 9],
			"Row index [0, 1, 2, 4, 5, 6, 7, 8, 9] selected");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(1, 9);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "Row index [0] selected");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(0, 9);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [], "Nothing selected");
	});

	QUnit.test("#onKeyboardShortcut - Event Marking", async function(assert) {
		const sEventMarker = "sapUiTableClearAll";
		const oEvent = {
			setMarked: function() {}
		};
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oClearSelectionSpy = sinon.spy(oSelectionPlugin, "clearSelection");
		const oSelectAllSpy = sinon.spy(oSelectionPlugin, "selectAll");
		const oSetMarkedSpy = sinon.spy(oEvent, "setMarked");

		oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await nextSelectionChange;

		assert.ok(oSelectAllSpy.calledOnce, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, `Event has not been marked with ${sEventMarker}`);

		oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		assert.ok(oClearSelectionSpy.calledOnce, "clear all called");
		assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		assert.ok(oClearSelectionSpy.calledTwice, "Selection is cleared");
		assert.ok(oSetMarkedSpy.calledTwice, `Event marked twice`);
		assert.ok(oSetMarkedSpy.calledWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oSelectionPlugin.onKeyboardShortcut("toggle");
		await TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		assert.ok(oSelectAllSpy.callCount, 2, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, "Event has not been marked");

		oSelectionPlugin.onKeyboardShortcut("toggle");
		assert.ok(oClearSelectionSpy.calledThrice, "clear all called");
		assert.ok(oSetMarkedSpy.notCalled, `Event has not been marked, as there was no event passed`);

		oSetMarkedSpy.reset();
		oClearSelectionSpy.reset();

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 2);
		await nextSelectionChange;

		oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		assert.ok(oClearSelectionSpy.calledOnce, "Selection is cleared");
		assert.ok(oSetMarkedSpy.calledOnce, `Event marked once`);
		assert.ok(oSetMarkedSpy.calledWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oClearSelectionSpy.reset();
		oSelectAllSpy.reset();
	});
});