/* global QUnit, sinon */
sap.ui.define([
	"./QUnitUtils",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/enums/TableMultiSelectMode",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/util/FilterUtil",
	"sap/m/Text",
	"sap/m/plugins/PluginBase",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Lib",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Context",
	"sap/base/util/deepEqual"
], function(
	TableQUnitUtils,
	TableDelegate,
	Table,
	GridTableType,
	TreeTableType,
	ResponsiveTableType,
	ResponsiveColumnSettings,
	Column,
	MultiSelectMode,
	SelectionMode,
	TableType,
	ConditionValidated,
	OperatorName,
	FilterUtil,
	Text,
	PluginBase,
	nextUIUpdate,
	Library,
	MessageType,
	Filter,
	JSONModel,
	Sorter,
	Context,
	deepEqual
) {
	"use strict";

	const sDelegatePath = "sap/ui/mdc/TableDelegate";

	const fnOriginalUpdateBindingInfo = TableDelegate.updateBindingInfo;
	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		fnOriginalUpdateBindingInfo.apply(this, arguments);
		oBindingInfo.path = oTable.getPayload() ? oTable.getPayload().collectionPath : "/foo";
	};

	QUnit.module("API", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				path: "Name_Path",
				label: "Name_Label",
				sortable: true,
				dataType: "String"
			}, {
				name: "FirstName",
				path: "FirstName_Path",
				label: "FirstName_Label",
				sortable: true,
				dataType: "String"
			}, {
				name: "ID",
				path: "ID_Path",
				label: "ID_Label",
				sortable: true,
				text: "FirstName",
				dataType: "String"
			}]);
		},
		beforeEach: async function(assert) {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/foo"
					}
				},
				p13nMode: ["Sort"],
				columns: [
					new Column({
						propertyKey: "Name",
						header: new Text({
							text: "Column A"
						}),
						hAlign: "Begin",
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						}),
						template: new Text({
							text: "Column A"
						})
					})
				]
			});
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();

			await this.oTable.initialized();
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("validateState", function(assert) {
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
		const oState = {};
		let oValidationState = this.oTable.validateState(oState, "Group");

		assert.equal(oValidationState.validation, MessageType.None, "No message");
		assert.equal(oValidationState.message, undefined, "Message text is not defined");

		this.oTable._oMessageFilter = new Filter("Key1", "EQ", "11");
		oValidationState = this.oTable.validateState(oState, "Filter");
		assert.equal(oValidationState.validation, MessageType.Information, "Information message, Filters are ignored");
		assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP"), "Message text");
	});

	QUnit.test("updateBindingInfo", function(assert) {
		const oTable = this.oTable;
		oTable.setP13nMode(["Sort", "Filter"]);
		const oFilterConditions = {
			Name: [
				{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}
			]
		};

		const oStub = sinon.stub(oTable, "getConditions").returns(oFilterConditions);
		let aExpectedFilter = [];
		return TableQUnitUtils.waitForBindingInfo(oTable).then(function() {
			oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
			oTable.setGroupConditions({groupLevels: [{name: "Name"}]});
			oTable.rebind();
			return TableQUnitUtils.waitForBindingUpdate(oTable);
		}).then(function() {
			const aSorter = [new Sorter("Name_Path", true)];
			aExpectedFilter = [FilterUtil.getFilterInfo(oTable.getControlDelegate().getTypeMap(), oTable.getConditions(), oTable.getPropertyHelper().getProperties()).filters];
			const oBindingInfo = {};

			assert.deepEqual(oTable._oTable.getBindingInfo("rows").sorter, aSorter, "Correct sorter assigned");
			TableDelegate.updateBindingInfo(oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aSorter, filters: aExpectedFilter, path: "/foo"});

			oTable.setType("ResponsiveTable");
			return TableQUnitUtils.waitForBindingUpdate(oTable);
		}).then(function() {
			const oSorter = oTable._oTable.getBindingInfo("items").sorter[0];

			assert.ok(oTable._oTable.getBindingInfo("items").sorter.length, 1, "One sorter assigned");
			assert.ok(oSorter.sPath === "Name_Path" && oSorter.bDescending === true && oSorter.vGroup != null, "Sorter properties");

			oTable.setFilterConditions(oFilterConditions);
			oTable.setGroupConditions({groupLevels: [{name: "FirstName"}]});
			oTable.rebind();
			return TableQUnitUtils.waitForBindingUpdate(oTable);
		}).then(function() {
			const aSorters = oTable._oTable.getBindingInfo("items").sorter;

			assert.ok(aSorters, 2, "Two sorters assigned");
			assert.ok(aSorters[0].sPath === "FirstName_Path" && aSorters[0].bDescending === false && aSorters[0].vGroup != null,
				"First sorter properties");
			assert.ok(aSorters[1].sPath === "Name_Path" && aSorters[1].bDescending === true && aSorters[1].vGroup == null,
				"Second sorter properties");

			const oBindingInfo = {};
			TableDelegate.updateBindingInfo(oTable, oBindingInfo);
			assert.ok(deepEqual(aSorters, oBindingInfo.sorter), "The new sorters are equal to the old sorters if grouping didn't change");

			oTable.setGroupConditions();
			oTable.rebind();
			return TableQUnitUtils.waitForBindingUpdate(oTable);
		}).then(function() {
			const aSorter = [new Sorter("Name_Path", true)];
			const oBindingInfo = {};

			assert.deepEqual(oTable._oTable.getBindingInfo("items").sorter, aSorter, "Correct sorter assigned");
			TableDelegate.updateBindingInfo(oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aSorter, filters: aExpectedFilter, path: "/foo"});
			oStub.restore();
		});
	});

	QUnit.test("formatGroupHeader", function(assert) {
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
		const oContext = new Context();

		sinon.stub(oContext, "getProperty").callsFake(function(sPath) {
			switch (sPath) {
				case "FirstName_Path":
					return "Johnson";
				case "ID_Path":
					return "123";
				default:
					throw new Error("Unexpected path");
			}
		});

		assert.strictEqual(
			TableDelegate.formatGroupHeader(this.oTable, oContext, "FirstName"),
			oResourceBundle.getText("table.ROW_GROUP_TITLE", ["FirstName_Label", "Johnson"]),
			"Format property without text"
		);

		assert.strictEqual(
			TableDelegate.formatGroupHeader(this.oTable, oContext, "ID"),
			oResourceBundle.getText("table.ROW_GROUP_TITLE_FULL", ["ID_Label", "123", "Johnson"]),
			"Format property with text"
		);
	});

	QUnit.test("fetchExportCapabilities", function(assert) {
		return TableDelegate.fetchExportCapabilities(this.oTable).then(function(oExportCapabilities) {
			assert.ok(typeof oExportCapabilities === 'object', 'Function fetchExportCapabilities returns an object');
			assert.ok(oExportCapabilities.hasOwnProperty('XLSX'), 'Default export type XLSX is provided');
			assert.notOk(oExportCapabilities.hasOwnProperty('PDF'), 'Export type PDF is not provided');
		});
	});

	QUnit.test("getSupportedFeatures", function(assert) {
		const fnTest = function(sTableType, oExpectedFeatures) {
			return this.oTable.setType(sTableType).initialized().then(function(oTable) {
				const oFeatures = oTable.getControlDelegate().getSupportedFeatures(oTable);
				assert.deepEqual(oFeatures, oExpectedFeatures, sTableType + ": supported features are correct");
			});
		}.bind(this);

		return fnTest(TableType.Table, {
			p13nModes: ["Column", "Sort", "Filter"],
			"export": true,
			expandAllRows: false,
			collapseAllRows: false
		}).then(function() {
			return fnTest(TableType.TreeTable, {
				p13nModes: ["Column", "Sort", "Filter"],
				"export": true,
				expandAllRows: false,
				collapseAllRows: false
			});
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, {
				p13nModes: ["Column", "Sort", "Filter", "Group"],
				"export": true,
				expandAllRows: false,
				collapseAllRows: false
			});
		});
	});

	QUnit.test("#expandAllRows", function(assert) {
		assert.throws(() => {
			TableDelegate.expandAllRows(this.oTable);
		}, Error("Unsupported operation: TableDelegate.expandAllRows"));
	});

	QUnit.test("#collapseAllRows", function(assert) {
		assert.throws(() => {
			TableDelegate.collapseAllRows(this.oTable);
		}, Error("Unsupported operation: TableDelegate.collapseAllRows"));
	});

	QUnit.module("Selection", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				path: "Name_Path",
				label: "Name_Label",
				dataType: "String"
			}]);
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		},
		initTable: async function(mSettings, fnBeforeInit) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = new Table(Object.assign({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/"
					}
				},
				columns: [
					new Column({
						propertyKey: "Name",
						header: new Text({
							text: "Column A"
						}),
						template: new Text({
							text: "{Name}"
						})
					})
				],
				models: new JSONModel([
					{Name: "Hans"},
					{Name: "Frans"},
					{Name: "Susi"}
				])
			}, mSettings));

			if (fnBeforeInit) {
				fnBeforeInit(this.oTable);
			}

			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oTable.initialized();
		}
	});

	QUnit.test("Initialization with GridTableType", function(assert) {
		const oSelectionChangeStub = sinon.stub();

		return this.initTable({
			selectionMode: SelectionMode.Single,
			selectionChange: oSelectionChangeStub,
			type: new GridTableType({
				selectionLimit: 1337,
				showHeaderSelector: false
			})
		}, function(oTable) {
			assert.deepEqual(oTable.getSelectedContexts(), [], "#getSelectedContexts if not yet initialized");
		}).then(function(oTable) {
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.MultiSelectionPlugin");

			assert.ok(oPlugin, "Applied sap.ui.table.plugins.MultiSelectionPlugin");
			assert.equal(oPlugin.getLimit(), 1337, "Selection limit");
			assert.ok(oPlugin.getEnableNotification(), "Limit notification enabled");
			assert.notOk(oPlugin.getShowHeaderSelector(), "Show header selector");
			assert.equal(oPlugin.getSelectionMode(), "Single", "Selection mode");
			assert.ok(oPlugin.getEnabled(), "Selection plugin enabled");
			oPlugin.fireSelectionChange({selectAll: true});
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the plugin");

			oTable.setSelectionMode(SelectionMode.None);
			assert.notOk(oPlugin.getEnabled(), "Set selection mode to 'None': Selection plugin disabled");

			oTable.setSelectionMode(SelectionMode.SingleMaster);
			assert.equal(oPlugin.getSelectionMode(), "Single", "Set selection mode to 'SingleMaster': Selection mode of plugin set to 'Single'");

			oTable.setSelectionMode(SelectionMode.Multi);
			assert.equal(oPlugin.getSelectionMode(), "MultiToggle", "Set selection mode to 'Multi': Selection mode of plugin set to 'MultiToggle'");

			oTable.getType().setSelectionLimit(123);
			assert.equal(oPlugin.getLimit(), 123, "A 'selectionLimit' change correctly affects the plugin");

			oTable.getType().setShowHeaderSelector(true);
			assert.ok(oPlugin.getShowHeaderSelector(), "A 'showHeaderSelector' change correctly affects the plugin");

			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("rowsUpdated", function() {
					resolve(oTable);
				});
			});
		}).then(function(oTable) {
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.MultiSelectionPlugin");
			return oPlugin.addSelectionInterval(1, 1).then(function() {
				return oTable;
			});
		}).then(function(oTable) {
			assert.deepEqual(oTable.getSelectedContexts(), [oTable._oTable.getRows()[1].getBindingContext()],
				"#getSelectedContexts after initialization");
		});
	});

	QUnit.test("Initialization with TreeTableType", function(assert) {
		const oSelectionChangeStub = sinon.stub();

		return this.initTable({
			selectionMode: SelectionMode.Single,
			selectionChange: oSelectionChangeStub,
			type: new TreeTableType({
				selectionLimit: 1337,
				showHeaderSelector: false
			})
		}, function(oTable) {
			assert.deepEqual(oTable.getSelectedContexts(), [], "#getSelectedContexts if not yet initialized");
		}).then(function(oTable) {
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.MultiSelectionPlugin");

			assert.ok(oPlugin, "Applied sap.ui.table.plugins.MultiSelectionPlugin");
			assert.equal(oPlugin.getLimit(), 1337, "Selection limit");
			assert.ok(oPlugin.getEnableNotification(), "Limit notification enabled");
			assert.notOk(oPlugin.getShowHeaderSelector(), "Show header selector");
			assert.equal(oPlugin.getSelectionMode(), "Single", "Selection mode");
			assert.ok(oPlugin.getEnabled(), "Selection plugin enabled");
			oPlugin.fireSelectionChange({selectAll: true});
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the plugin");

			oTable.setSelectionMode(SelectionMode.None);
			assert.notOk(oPlugin.getEnabled(), "Set selection mode to 'None': Selection plugin disabled");

			oTable.setSelectionMode(SelectionMode.SingleMaster);
			assert.equal(oPlugin.getSelectionMode(), "Single", "Set selection mode to 'SingleMaster': Selection mode of plugin set to 'Single'");

			oTable.setSelectionMode(SelectionMode.Multi);
			assert.equal(oPlugin.getSelectionMode(), "MultiToggle", "Set selection mode to 'Multi': Selection mode of plugin set to 'MultiToggle'");

			oTable.getType().setSelectionLimit(123);
			assert.equal(oPlugin.getLimit(), 123, "A 'selectionLimit' change correctly affects the plugin");

			oTable.getType().setShowHeaderSelector(true);
			assert.ok(oPlugin.getShowHeaderSelector(), "A 'showHeaderSelector' change correctly affects the plugin");

			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("rowsUpdated", function() {
					resolve(oTable);
				});
			});
		}).then(function(oTable) {
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.MultiSelectionPlugin");
			return oPlugin.addSelectionInterval(1, 1).then(function() {
				return oTable;
			});
		}).then(function(oTable) {
			assert.deepEqual(oTable.getSelectedContexts(), [oTable._oTable.getRows()[1].getBindingContext()],
				"#getSelectedContexts after initialization");
		});
	});

	QUnit.test("Initialization with ResponsiveTableType", function(assert) {
		const oSelectionChangeStub = sinon.stub();

		return this.initTable({
			selectionMode: SelectionMode.Single,
			multiSelectMode: MultiSelectMode.ClearAll,
			selectionChange: oSelectionChangeStub,
			type: new ResponsiveTableType()
		}, function(oTable) {
			assert.deepEqual(oTable.getSelectedContexts(), [], "#getSelectedContexts if not yet initialized");
		}).then(function(oTable) {
			const oInnerTable = oTable._oTable;

			assert.equal(oInnerTable.getMode(), "SingleSelectLeft", "Selection mode");
			assert.equal(oInnerTable.getMultiSelectMode(), "ClearAll", "Multi select mode");
			oInnerTable.fireSelectionChange({selectAll: true});
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the inner table");

			oTable.setSelectionMode(SelectionMode.None);
			assert.equal(oInnerTable.getMode(), "None", "Set selection mode to 'None': Inner table selection mode set to 'None'");

			oTable.setSelectionMode(SelectionMode.SingleMaster);
			assert.equal(oInnerTable.getMode(), "SingleSelectMaster",
				"Set selection mode to 'SingleMaster': Inner table selection mode set to 'SingleSelectMaster'");

			oTable.setSelectionMode(SelectionMode.Multi);
			assert.equal(oInnerTable.getMode(), "MultiSelect",
				"Set selection mode to 'Multi': Inner table selection mode set to 'MultiSelect'");

			oTable.setMultiSelectMode(MultiSelectMode.Default);
			assert.equal(oInnerTable.getMultiSelectMode(), "SelectAll",
				"Multi select mode set to 'Default': Inner table multi select mode set to 'SelectAll'");

			return new Promise(function(resolve) {
				oInnerTable.attachEventOnce("updateFinished", function() {
					resolve(oTable);
				});
			});
		}).then(function(oTable) {
			oTable._oTable.getItems()[1].setSelected(true);
			assert.deepEqual(oTable.getSelectedContexts(), [oTable._oTable.getItems()[1].getBindingContext()],
				"#getSelectedContexts after initialization");
		});
	});

	QUnit.test("setSelectedContexts/getSelectedContexts", async function(assert) {
		const oSelectionChangeListener = sinon.spy();

		const testMultiSelection = (oDelegate, aContexts, sTestTitle) => {
			oSelectionChangeListener.resetHistory();
			oDelegate.setSelectedContexts(this.oTable, aContexts.slice(1, 3));
			assert.deepEqual(oDelegate.getSelectedContexts(this.oTable), aContexts.slice(1, 3), sTestTitle + " - Selected contexts");
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");

			oSelectionChangeListener.resetHistory();
			oDelegate.setSelectedContexts(this.oTable, aContexts.slice(2, 4));
			assert.deepEqual(oDelegate.getSelectedContexts(this.oTable), aContexts.slice(2, 4), sTestTitle + " - Selected contexts");
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");
		};

		const testSingleSelection = (oDelegate, aContexts, sTestTitle) => {
			oSelectionChangeListener.resetHistory();
			assert.throws(
				function() {
					oDelegate.setSelectedContexts(this.oTable, aContexts.slice(1, 3));
				},
				new Error("Unsupported operation: Cannot select the given number of contexts in the current selection mode"),
				sTestTitle + " - Throws an error when trying to select multiple contexts"
			);
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");

			oSelectionChangeListener.resetHistory();
			oDelegate.setSelectedContexts(this.oTable, [aContexts[1]]);
			assert.deepEqual(oDelegate.getSelectedContexts(this.oTable), [aContexts[1]], sTestTitle + " - Selected contexts");
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");

			oSelectionChangeListener.resetHistory();
			oDelegate.setSelectedContexts(this.oTable, [aContexts[2]]);
			assert.deepEqual(oDelegate.getSelectedContexts(this.oTable), [aContexts[2]], sTestTitle + " - Selected contexts");
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");
		};

		const testDisabledSelection = (oDelegate, aContexts, sTestTitle) => {
			oSelectionChangeListener.resetHistory();
			assert.throws(
				function() {
					oDelegate.setSelectedContexts(this.oTable, [aContexts[1]]);
				},
				new Error("Unsupported operation: Cannot select the given number of contexts in the current selection mode"),
				sTestTitle + " - Throws an error if selection is disabled"
			);
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");
		};

		const testSelection = () => {
			Object.values(SelectionMode).forEach((sSelectionMode) => {
				const oDelegate = this.oTable.getControlDelegate();
				const aContexts = this.oTable.getRowBinding().getContexts();
				const sTestTitle = `type=${this.oTable.getType() || TableType.Table}; selectionMode=${sSelectionMode}`;

				this.oTable.setSelectionMode(sSelectionMode);

				if (this.oTable._isOfType(TableType.Table, true)) {
					oSelectionChangeListener.resetHistory();
					assert.throws(
						function() {
							oDelegate.setSelectedContexts(this.oTable, [aContexts[0]]);
						},
						new Error("Unsupported operation: Not supported for the current table type"),
						sTestTitle + " - Throws an error"
					);
					assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");
					return;
				}

				switch (sSelectionMode) {
					case SelectionMode.Multi:
						testMultiSelection(oDelegate, aContexts, sTestTitle);
						break;
					case SelectionMode.Single:
					case SelectionMode.SingleMaster:
						testSingleSelection(oDelegate, aContexts, sTestTitle);
						break;
					case SelectionMode.None:
						testDisabledSelection(oDelegate, aContexts, sTestTitle);
						break;
					default:
						throw new Error("Untested selection mode: " + sSelectionMode);
				}
			});
		};

		const nextBindingChange = () => {
			return new Promise((resolve) => {
				this.oTable.attachEventOnce("_bindingChange", resolve);
			});
		};

		await this.initTable({
			selectionChange: oSelectionChangeListener
		});

		for (const sTableType of Object.values(TableType)) {
			this.oTable.setType(sTableType);
			await this.oTable.initialized();
			await nextBindingChange();
			testSelection();
		}
	});
});