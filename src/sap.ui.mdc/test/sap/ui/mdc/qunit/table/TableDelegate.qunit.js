/* global QUnit, sinon */
sap.ui.define([
	"./QUnitUtils",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/enums/TableMultiSelectMode",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/util/FilterUtil",
	"sap/m/Text",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/TitleProvider",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Lib",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/Element",
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
	Column,
	MultiSelectMode,
	SelectionMode,
	TableType,
	ConditionValidated,
	OperatorName,
	FilterUtil,
	Text,
	PluginBase,
	TitleProvider,
	SelectionPlugin,
	nextUIUpdate,
	Library,
	MessageType,
	Element,
	Filter,
	JSONModel,
	Sorter,
	Context,
	deepEqual
) {
	"use strict";

	const fnOriginalUpdateBindingInfo = TableDelegate.updateBindingInfo;
	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		fnOriginalUpdateBindingInfo.apply(this, arguments);
		oBindingInfo.path = oTable.getPayload() ? oTable.getPayload().collectionPath : "/foo";
	};

	const fnOriginalFetchProperties = TableDelegate.fetchProperties;
	TableDelegate.fetchProperties = function(oTable) {
		const oPayload = oTable.getPayload();

		if (oPayload?.propertyInfo) {
			return Promise.resolve(oPayload.propertyInfo);
		} else {
			return fnOriginalFetchProperties.apply(this, arguments);
		}
	};

	TableDelegate.addItem = function(oTable, sPropertyKey) {
		const oProperty = oTable.getPropertyHelper().getProperty(sPropertyKey);
		return new Column(oTable.getId() + "-" + oProperty.key, {
			header: oProperty.label,
			template: new Text({text: "{" + oProperty.path + "}"}),
			propertyKey: sPropertyKey
		});
	};

	QUnit.module("API", {
		beforeEach: async function(assert) {
			this.oTable = new Table({
				delegate: {
					name: "sap/ui/mdc/TableDelegate",
					payload: {
						collectionPath: "/foo",
						propertyInfo: [{
							key: "Name",
							path: "Name_Path",
							label: "Name_Label",
							sortable: true,
							dataType: "String"
						}, {
							key: "FirstName",
							path: "FirstName_Path",
							label: "FirstName_Label",
							sortable: true,
							dataType: "String"
						}, {
							key: "ID",
							path: "ID_Path",
							label: "ID_Label",
							sortable: true,
							text: "FirstName",
							dataType: "String"
						}]
					}
				},
				p13nMode: ["Sort"],
				columns: [
					new Column({
						propertyKey: "Name",
						header: new Text({
							text: "Column A"
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

	QUnit.test("validateP13nState default resolves true", async function(assert) {
		const vResult = this.oTable.getControlDelegate().validateP13nState(this.oTable, {});
		assert.ok(vResult instanceof Promise, "Always returns a Promise");
		assert.strictEqual(await vResult, true, "Default resolves true");
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
			oTable.setSortConditions({sorters: [{key: "Name", descending: true}]});
			oTable.setGroupConditions({groupLevels: [{key: "Name"}]});
			oTable.rebind();
			return TableQUnitUtils.waitForBindingUpdate(oTable);
		}).then(function() {
			const aSorter = [new Sorter("Name_Path", true)];
			aExpectedFilter = [
				FilterUtil.getFilterInfo(oTable.getControlDelegate().getTypeMap(),
				oTable.getConditions(), oTable.getPropertyHelper().getProperties()).filters
			];
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
			oTable.setGroupConditions({groupLevels: [{key: "FirstName"}]});
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

	QUnit.test("updateBindingInfo from external filter", function(assert) {
		const oTable = this.oTable;
		const oMyFilter = { // fake FilterBar
			getId: () => "myFilter",
			getConditions: () => {
				return {
					Name: [
						{
							isEmpty: null,
							operator: OperatorName.EQ,
							validated: ConditionValidated.NotValidated,
							values: ["test"]
						},
						{
							isEmpty: null,
							operator: OperatorName.DefaultValues,
							validated: ConditionValidated.NotValidated,
							values: []
						}
					]
				};
			},
			validate: () => { return Promise.resolve(); },
			isA: (sName) => {
				if (sName === "sap.ui.mdc.IFilter") {
					return true;
				}
				return false;
			},
			attachSearch: () => {},
			getPropertyHelper: () => { return oTable.getPropertyHelper(); },
			getDefaultValues: (sFieldPath) => {
				if (sFieldPath === "Name") {
					return [{
							isEmpty: null,
							operator: OperatorName.NE,
							validated: ConditionValidated.NotValidated,
							values: ["X"]
					}];
				}
				return [];
			}
		};
		sinon.stub(Element, "getElementById").withArgs("myFilter").returns(oMyFilter);
		Element.getElementById.callThrough();
		oTable.setP13nMode(["Filter"]);
		oTable.setFilter("myFilter");
		const oTestConditions = {
			Name: [
				{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				},
				{
					isEmpty: null,
					operator: OperatorName.NE,
					validated: ConditionValidated.NotValidated,
					values: ["X"]
				}
			]
		};

		return TableQUnitUtils.waitForBindingInfo(oTable).then(function() {
			const aExpectedFilter = [
				FilterUtil.getFilterInfo(oTable.getControlDelegate().getTypeMap(),
				oTestConditions, oTable.getPropertyHelper().getProperties()).filters
			];
			const oBindingInfo = {};

			TableDelegate.updateBindingInfo(oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: [], filters: aExpectedFilter, path: "/foo"});
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
			"export": true
		}).then(function() {
			return fnTest(TableType.TreeTable, {
				p13nModes: ["Column", "Sort", "Filter"],
				"export": true
			});
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, {
				p13nModes: ["Column", "Sort", "Filter", "Group"],
				"export": true
			});
		});
	});

	QUnit.test("fetchExpandAndCollapseConfiguration", async function(assert) {
		const fnTest = async (sTableType) => {
			await this.oTable.setType(sTableType).initialized();
			const oExpandCollapseConfig = await this.oTable.getControlDelegate().fetchExpandAndCollapseConfiguration(this.oTable);
			assert.deepEqual(oExpandCollapseConfig, {}, "No expand/collapse configuration returned");
		};

		await fnTest(TableType.Table);
		await fnTest(TableType.TreeTable);
		await fnTest(TableType.ResponsiveTable);
	});

	QUnit.module("Selection", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		initTable: async function(mSettings, fnBeforeInit) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = new Table(Object.assign({
				delegate: {
					name: "sap/ui/mdc/TableDelegate",
					payload: {
						collectionPath: "/",
						propertyInfo: [{
							key: "Name",
							path: "Name_Path",
							label: "Name_Label",
							dataType: "String"
						}]
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
				threshold: 3,
				models: new JSONModel([
					{Name: "Hans"},
					{Name: "Frans"},
					{Name: "Susi"},
					{Name: "Peter"}
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
			assert.deepEqual(
				oDelegate.getSelectedContexts(this.oTable).map((oContext) => oContext.getPath()),
				aContexts.slice(1, 3).map((oContext) => oContext.getPath()),
				sTestTitle + " - Selected contexts"
			);
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");

			oSelectionChangeListener.resetHistory();
			oDelegate.setSelectedContexts(this.oTable, aContexts.slice(2, 4));
			assert.deepEqual(
				oDelegate.getSelectedContexts(this.oTable).map((oContext) => oContext.getPath()),
				aContexts.slice(2, 4).map((oContext) => oContext.getPath()),
				sTestTitle + " - Selected contexts"
			);
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
			assert.deepEqual(
				oDelegate.getSelectedContexts(this.oTable).map((oContext) => oContext.getPath()),
				[aContexts[1]].map((oContext) => oContext.getPath()),
				sTestTitle + " - Selected contexts"
			);
			assert.ok(oSelectionChangeListener.notCalled, "selectionChange event not fired");

			oSelectionChangeListener.resetHistory();
			oDelegate.setSelectedContexts(this.oTable, [aContexts[2]]);
			assert.deepEqual(
				oDelegate.getSelectedContexts(this.oTable).map((oContext) => oContext.getPath()),
				[aContexts[2]].map((oContext) => oContext.getPath()),
				sTestTitle + " - Selected contexts"
			);
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

	QUnit.module("TitleProvider", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		initTable: async function(mSettings) {
			this.oTable = new Table({
				...mSettings,
				delegate: {
					name: "sap/ui/mdc/TableDelegate"
				}
			});

			await this.oTable._fullyInitialized();
		},
		assertTitleProviderSettings: function(assert) {
			const bIsTreeTable = this.oTable._isOfType(TableType.TreeTable);
			const oTitleProvider = PluginBase.getPlugin(this.oTable._oTable, "sap.m.plugins.TitleProvider");
			assert.ok(oTitleProvider, "TitleProvider plugin added to the inner table");
			assert.equal(oTitleProvider.getId(), this.oTable.getId() + "-titleProvider", "TitleProvider id is correct");
			assert.equal(oTitleProvider.getTitle(), this.oTable.getId() + "-tableTitle", "TitleProvider title is correct");

			[
				{headerVisible: true, showRowCount: true, hideToolbar: false, expected: true},
				{headerVisible: false, showRowCount: true, hideToolbar: false, expected: false},
				{headerVisible: true, showRowCount: false, hideToolbar: false, expected: false},
				{headerVisible: true, showRowCount: true, hideToolbar: true, expected: false}
			].forEach((mCase) => {
				this.oTable.setHeaderVisible(mCase.headerVisible);
				this.oTable.setShowRowCount(mCase.showRowCount);
				this.oTable.setHideToolbar(mCase.hideToolbar);
				assert.strictEqual(
					oTitleProvider.getEnabled(), mCase.expected,
					`Enabled case: headerVisible=${mCase.headerVisible}, showRowCount=${mCase.showRowCount}, hideToolbar=${mCase.hideToolbar}`
				);
			});

			Object.values(SelectionMode).forEach((sSelectionMode) => {
				this.oTable.setSelectionMode(sSelectionMode);
				assert.strictEqual(
					oTitleProvider.getManageSelectedCount(),
					bIsTreeTable ? false : sSelectionMode === SelectionMode.Multi,
					`ManageSelectedCount case: selectionMode=${sSelectionMode}`
				);
			});
		}
	});

	QUnit.test("GridTable Type", async function(assert) {
		const oTitleProviderOnActivateSpy = sinon.spy(TitleProvider.prototype, "onActivate");
		const oSelectionPluginOnActivateSpy = sinon.spy(SelectionPlugin.prototype, "onActivate");

		await this.initTable();
		this.assertTitleProviderSettings(assert);
		assert.ok(oTitleProviderOnActivateSpy.calledAfter(oSelectionPluginOnActivateSpy), "TitleProvider is activated after SelectionPlugin");

		oSelectionPluginOnActivateSpy.restore();
		oTitleProviderOnActivateSpy.restore();
	});

	QUnit.test("TreeTable Type", async function(assert) {
		const oTitleProviderOnActivateSpy = sinon.spy(TitleProvider.prototype, "onActivate");
		const oSelectionPluginOnActivateSpy = sinon.spy(SelectionPlugin.prototype, "onActivate");

		await this.initTable({type: TableType.TreeTable});
		this.assertTitleProviderSettings(assert);
		assert.ok(oTitleProviderOnActivateSpy.calledAfter(oSelectionPluginOnActivateSpy), "TitleProvider is activated after SelectionPlugin");

		oSelectionPluginOnActivateSpy.restore();
		oTitleProviderOnActivateSpy.restore();
	});

	QUnit.test("ResponsiveTable Type", async function(assert) {
		await this.initTable({type: TableType.ResponsiveTable});
		this.assertTitleProviderSettings(assert);
	});

	QUnit.module("Dynamic properties", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: async function(mSettings) {
			this.oTable = new Table({
				delegate: {
					name: "sap/ui/mdc/TableDelegate",
					payload: {
						collectionPath: "/foo",
						propertyInfo: [{
							key: "Name",
							path: "Name_Path",
							label: "Name_Label",
							dataType: "String"
						}, {
							key: "Inactive",
							path: "Inactive_Path",
							label: "Inactive_Label",
							dataType: "String",
							isActive: false
						}]
					}
				},
				propertyKeys: ["Name", "Inactive"],
				models: new JSONModel(),
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await this.oTable.initialized();
			await nextUIUpdate();
		}
	});

	QUnit.test("Group header row title updated after property label change", async function(assert) {
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
		await this.createTable({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "FirstName",
						path: "FirstName",
						label: "FirstName_Label",
						dataType: "String",
						isActive: true
					}]
				}
			},
			propertyKeys: ["FirstName"],
			type: new ResponsiveTableType(),
			p13nMode: ["Group"],
			autoBindOnInit: false,
			models: new JSONModel({
				testPath: [
					{FirstName: "Johnson"},
					{FirstName: "Johnson"},
					{FirstName: "Smith"}
				]
			}),
			groupConditions: {groupLevels: [{name: "FirstName"}]}
		});

		await this.oTable.rebind();

		const aItems = this.oTable._oTable.getItems();
		const oGroupHeader = aItems.find((oItem) => oItem.isA("sap.m.GroupHeaderListItem"));
		assert.strictEqual(
			oGroupHeader.getTitle(),
			oResourceBundle.getText("table.ROW_GROUP_TITLE", ["FirstName_Label", "Johnson"]),
			"Group header shows original label"
		);

		this.oTable.data("xConfig", `\\{"propertyInfo":\\{"FirstName":\\{"label":"NewLabel"\\}\\}\\}`);
		await this.oTable.rebind();

		const aUpdatedItems = this.oTable._oTable.getItems();
		const oUpdatedGroupHeader = aUpdatedItems.find((oItem) => oItem.isA("sap.m.GroupHeaderListItem"));
		assert.strictEqual(
			oUpdatedGroupHeader.getTitle(),
			oResourceBundle.getText("table.ROW_GROUP_TITLE", ["NewLabel", "Johnson"]),
			"Group header shows updated label after rebind"
		);
	});

	QUnit.test("Sorters exclude inactive property", async function(assert) {
		await this.createTable({
			p13nMode: ["Sort"],
			sortConditions: {sorters: [{name: "Name", descending: false}, {name: "Inactive", descending: true}]}
		});

		const oBindingInfo = {};
		TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
		assert.equal(oBindingInfo.sorter.length, 1, "Only one sorter in binding info");
		assert.equal(oBindingInfo.sorter[0].sPath, "Name_Path", "Sorter is for the active property");
	});

	QUnit.test("Group sorter excludes inactive property", async function(assert) {
		await this.createTable({
			type: "ResponsiveTable",
			p13nMode: ["Sort", "Group"],
			groupConditions: {groupLevels: [{name: "Inactive"}]}
		});

		const oGroupSorter = TableDelegate.getGroupSorter(this.oTable);
		assert.notOk(oGroupSorter, "No group sorter returned for inactive property");
	});

	QUnit.test("Group sorter carries groupPaths for the grouped property (no text)", async function(assert) {
		await this.createTable({
			type: "ResponsiveTable",
			p13nMode: ["Group"],
			groupConditions: {groupLevels: [{key: "Name"}]}
		});

		const oGroupSorter = TableDelegate.getGroupSorter(this.oTable);
		assert.ok(oGroupSorter, "Group sorter returned");
		assert.strictEqual(oGroupSorter.getPath(), "Name_Path", "Sorter path");
		assert.deepEqual(oGroupSorter.getGroupPaths(), ["Name_Path"],
			"Group paths contain only the grouped property path when no text property is defined");
	});

	QUnit.test("Group sorter groupPaths include the text property path", async function(assert) {
		await this.createTable({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: "/foo",
					propertyInfo: [{
						key: "FirstName",
						path: "FirstName_Path",
						label: "FirstName_Label",
						dataType: "String"
					}, {
						key: "ID",
						path: "ID_Path",
						label: "ID_Label",
						text: "FirstName",
						dataType: "String"
					}]
				}
			},
			propertyKeys: ["ID", "FirstName"],
			type: "ResponsiveTable",
			p13nMode: ["Group"],
			groupConditions: {groupLevels: [{key: "ID"}]}
		});

		const oGroupSorter = TableDelegate.getGroupSorter(this.oTable);
		assert.ok(oGroupSorter, "Group sorter returned");
		assert.strictEqual(oGroupSorter.getPath(), "ID_Path", "Sorter path");
		assert.deepEqual(oGroupSorter.getGroupPaths(), ["ID_Path", "FirstName_Path"],
			"Group paths contain the grouped property path and its text property path");
	});

	QUnit.test("Group sorter reuses the cached formatter across repeated calls for the same property", async function(assert) {
		await this.createTable({
			type: "ResponsiveTable",
			p13nMode: ["Group"],
			groupConditions: {groupLevels: [{key: "Name"}]}
		});

		const oFirstSorter = TableDelegate.getGroupSorter(this.oTable);
		const oSecondSorter = TableDelegate.getGroupSorter(this.oTable);

		assert.ok(oFirstSorter && oSecondSorter, "Two sorter instances returned");
		assert.strictEqual(oFirstSorter.fnGroup, oSecondSorter.fnGroup,
			"The same formatter reference is reused so ODataListBinding#sort does not detect a spurious change");
		assert.strictEqual(oFirstSorter.fnGroup, this.oTable._mFormatGroupHeaderInfo.formatter,
			"The cached formatter reference is the one attached to the returned sorter");
	});

	QUnit.test("Filters exclude inactive property", async function(assert) {
		await this.createTable({p13nMode: ["Sort", "Filter"]});
		const oFilterConditions = {
			Name: [{
				isEmpty: null,
				operator: OperatorName.EQ,
				validated: ConditionValidated.NotValidated,
				values: ["test"]
			}],
			Inactive: [{
				isEmpty: null,
				operator: OperatorName.EQ,
				validated: ConditionValidated.NotValidated,
				values: ["test"]
			}]
		};

		sinon.stub(this.oTable, "getConditions").returns(oFilterConditions);
		const oBindingInfo = {};
		TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
		const aFilters = oBindingInfo.filters;

		assert.equal(aFilters.length, 1, "Only one filter in binding info");
		assert.equal(aFilters[0].sPath, "Name_Path", "Filter is for the active property");
	});

	QUnit.module("Rebind with invalid state", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		createTable: function(mSettings) {
			this.oTable = new Table({
				autoBindOnInit: false,
				delegate: {
					name: "sap/ui/mdc/TableDelegate",
					payload: {
						collectionPath: "/foo",
						propertyInfo: [{
							key: "Name",
							path: "Name_Path",
							label: "Name_Label",
							dataType: "String"
						}]
					}
				},
				sortConditions: {
					sorters: [{key: "DoesNotExist"}]
				},
				filterConditions: {
					DoesNotExist: [{operator: "EQ", values: [30]}]
				},
				groupConditions: {
					groupLevels: [{key: "DoesNotExist"}]
				},
				aggregateConditions: {
					DoesNotExist: {}
				},
				columns: [
					new Column({
						propertyKey: "Name",
						header: new Text({
							text: "Column A"
						}),
						template: new Text({
							text: "Column A"
						})
					})
				],
				models: new JSONModel(),
				...mSettings
			});
		}
	});

	Object.values(TableType).forEach((sTableType) => {
		QUnit.test(sTableType, async function(assert) {
			this.createTable({
				type: sTableType
			});
			await this.oTable.rebind();

			assert.ok(true, "Rebind did not fail");
			assert.ok(this.oTable.getRowBinding(), "Table has a row binding");
		});
	});
});