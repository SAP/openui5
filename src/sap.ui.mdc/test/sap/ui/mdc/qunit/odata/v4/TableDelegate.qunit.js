/* global QUnit, sinon */
sap.ui.define([
	"../../table/QUnitUtils",
	"../../util/createAppEnvironment",
	"sap/ui/core/Lib",
	"sap/ui/mdc/odata/v4/TableDelegate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/m/plugins/PluginBase",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/test/TestUtils",
	"sap/ui/mdc/enums/TableMultiSelectMode",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/util/FilterUtil"
], function(
	TableQUnitUtils,
	createAppEnvironment,
	Library,
	TableDelegate,
	Table,
	GridTableType,
	TreeTableType,
	ResponsiveTableType,
	Column,
	Text,
	PluginBase,
	ControlPersonalizationWriteAPI,
	nextUIUpdate,
	MessageType,
	ODataModel,
	Sorter,
	Filter,
	ManagedObjectObserver,
	TestUtils,
	TableMultiSelectMode,
	SelectionMode,
	TableType,
	ConditionValidated,
	OperatorName,
	FilterUtil
) {
	"use strict";

	const iDataCount = 400;

	sap.ui.define("odata.v4.TestDelegate", [
		"sap/ui/mdc/odata/v4/TableDelegate"
	], function(TableDelegate) {
		const TestDelegate = Object.assign({}, TableDelegate);

		TestDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
			const oPayload = oTable.getPayload();

			TableDelegate.updateBindingInfo.apply(this, arguments);
			oBindingInfo.path = oPayload?.collectionPath ?? "/Products";

			if (oPayload?.bindingParameters) {
				oBindingInfo.parameters = oPayload.bindingParameters;
			}
		};

		return TestDelegate;
	});

	function createData(iStartIndex, iLength) {
		const aData = [];

		if (iStartIndex + iLength > iDataCount) {
			iLength = iDataCount - iStartIndex;
		}

		for (let i = iStartIndex; i < iStartIndex + iLength; i++) {
			aData.push({
				ID: i,
				Name: "Test Product (" + i + ")"
			});
		}

		return aData;
	}

	TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/qunit/odata/v4/data", null, [{
		regExp: /^GET \/MyService\/\$metadata$/,
		response: {
			source: "metadata_tea_busi_product.xml"
		}
	}, {
		regExp: /^GET \/MyService\/Products\?(\$count=true&)?\$skip=(\d+)\&\$top=(\d+)$/,
		response: {
			buildResponse: function(aMatches, oResponse) {
				const bWithCount = !!aMatches[1];
				const iSkip = parseInt(aMatches[2]);
				const iTop = parseInt(aMatches[3]);
				const mResponse = {value: createData(iSkip, iTop)};

				if (bWithCount) {
					mResponse["@odata.count"] = iDataCount;
				}

				oResponse.message = JSON.stringify(mResponse);
			}
		}
	}, {
		regExp: /^GET \/MyService?\/Products\?(\$count=true&)?\$filter=Name%20eq%20'Test%20Product%20\(0\)'/,
		response: {
			buildResponse: function(aMatches, oResponse) {
				const bWithCount = !!aMatches[1];
				const mResponse = {value: createData(0, 1)};

				if (bWithCount) {
					mResponse["@odata.count"] = 1;
				}

				oResponse.message = JSON.stringify(mResponse);
			}
		}
	}]);

	const sTableView1 =
	`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
		<Table p13nMode="Group,Aggregate" id="myTable" delegate='\{name: "odata.v4.TestDelegate"\}'>
			<columns>
				<mdcTable:Column id="myTable--column0" header="column 0" propertyKey="Name">
					<m:Text text="{Name}" id="myTable--text0"/>
				</mdcTable:Column>
				<mdcTable:Column id="myTable--column1" header="column 1" propertyKey="Country">
					<m:Text text="{Country}" id="myTable--text1"/>
				</mdcTable:Column>
				<mdcTable:Column header="column 2" propertyKey="name_country">
					<m:Text text="{Name}" id="myTable--text2"/>
				</mdcTable:Column>
			</columns>
		</Table>
	</mvc:View>`;

	const sTableView2 =
	`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
		<Table p13nMode="Group,Aggregate" id="myTable" delegate='\{name: "odata.v4.TestDelegate"\}'>
			<columns>
				<mdcTable:Column header="column 2" propertyKey="name_country">
					<m:Text text="{Name}" id="myTable--text2"/>
				</mdcTable:Column>
			</columns>
		</Table>
	</mvc:View>`;

	function createColumnStateIdMap(oTable, aStates) {
		const mState = {};

		oTable.getColumns().forEach(function(oColumn, iIndex) {
			mState[oColumn.getId() + "-innerColumn"] = aStates[iIndex];
		});

		return mState;
	}

	function getQuickAction(oMenu, sType) {
		const oQuickActionContainer = oMenu.getAggregation("_quickActions")[0];
		if (!oQuickActionContainer) {
			return null;
		}
		const aQuickActions = oQuickActionContainer.getQuickActions().filter(function(oQuickAction) {
			return oQuickAction.isA("sap.m.table.columnmenu." + sType);
		});

		return sType === "QuickAction" ? aQuickActions : aQuickActions[0];
	}

	QUnit.module("Initialization of analytics", {
		afterEach: function() {
			if (this.oTable) {
				this.oFetchProperties.restore();
				this.oTable.destroy();
			}
		},
		initTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = new Table(Object.assign({
				delegate: {
					name: "odata.v4.TestDelegate"
				}
			}, mSettings));

			return this.oTable.awaitControlDelegate().then(function(oDelegate) {
				this.oFetchProperties = sinon.spy(oDelegate, "fetchProperties");
				return this.oTable._fullyInitialized();
			}.bind(this)).then(function() {
				return this.oTable;
			}.bind(this));
		},
		assertFetchPropertyCalls: function(assert, iCallCount) {
			assert.equal(this.oFetchProperties.callCount, iCallCount, "Delegate.fetchProperties calls");
		}
	});

	QUnit.test("GridTable; Grouping and aggregation disabled", function(assert) {
		return this.initTable().then(function(oTable) {
			assert.notOk(PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
				"V4Aggregation plugin is not added to the inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.test("GridTable; Grouping and aggregation enabled", function(assert) {
		return this.initTable({
			p13nMode: ["Group", "Aggregate"],
			groupConditions: {
				groupLevels: [{
					name: "Name"
				}]
			},
			aggregateConditions: {
				SalesAmount: {}
			}
		}).then(function(oTable) {
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
			assert.ok(oPlugin, "V4Aggregation plugin is added to the inner table");
			assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");

			const oGroupHeaderFormatter = sinon.stub(oTable.getControlDelegate(), "formatGroupHeader");
			oPlugin.getGroupHeaderFormatter()("MyContext", "MyProperty");
			assert.ok(oGroupHeaderFormatter.calledOnceWithExactly(oTable, "MyContext", "MyProperty"), "Call Delegate.formatGroupHeader");
			oGroupHeaderFormatter.restore();

			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.test("ResponsiveTable; Grouping and aggregation disabled", function(assert) {
		return this.initTable({
			type: TableType.ResponsiveTable
		}).then(function(oTable) {
			assert.notOk(PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
				"V4Aggregation plugin is not added to the inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.test("ResponsiveTable; Grouping and aggregation enabled", function(assert) {
		return this.initTable({
			type: TableType.ResponsiveTable,
			p13nMode: ["Group", "Aggregate"]
		}).then(function(oTable) {
			assert.notOk(PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
				"V4Aggregation plugin is not added to the inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.module("Change table settings", {
		beforeEach: function() {
			return this.initTable();
		},
		afterEach: function() {
			this.restoreFetchPropertyMethods();

			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		initTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.restoreFetchPropertyMethods();
			this.oTable = new Table(Object.assign({
				delegate: {
					name: "odata.v4.TestDelegate"
				},
				p13nMode: ["Group", "Aggregate"]
			}, mSettings));

			return this.oTable.awaitControlDelegate().then(function(oDelegate) {
				this.oFetchProperties = sinon.spy(oDelegate, "fetchProperties");
				return this.oTable._fullyInitialized();
			}.bind(this)).then(function() {
				return this.oTable;
			}.bind(this));
		},
		assertFetchPropertyCalls: function(assert, iCallCount) {
			assert.equal(this.oFetchProperties.callCount, iCallCount, "Delegate.fetchProperties calls");
		},
		resetFetchPropertyCalls: function() {
			this.oFetchProperties.reset();
		},
		restoreFetchPropertyMethods: function() {
			if (this.oFetchProperties) {
				this.oFetchProperties.restore();
			}
		}
	});

	QUnit.test("Type", function(assert) {
		const that = this;
		const oOldPlugin = PluginBase.getPlugin(that.oTable._oTable, "sap.ui.table.plugins.V4Aggregation");

		this.resetFetchPropertyCalls();
		this.oTable.setType(TableType.ResponsiveTable);

		return this.oTable._fullyInitialized().then(function() {
			assert.notOk(PluginBase.getPlugin(that.oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
				"V4Aggregation plugin is not added to the inner table");
			that.assertFetchPropertyCalls(assert, 0);

			that.resetFetchPropertyCalls();
			that.oTable.setType(TableType.Table);
			return that.oTable._fullyInitialized();
		}).then(function() {
			const oPlugin = PluginBase.getPlugin(that.oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
			assert.ok(oPlugin, "V4Aggregation plugin is added to the inner table");
			assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");
			assert.notEqual(oPlugin, oOldPlugin, "V4Aggregation plugin is not the same instance");
			assert.ok(oOldPlugin.bIsDestroyed, "Old V4Aggregation plugin is destroyed");

			const oGroupHeaderFormatter = sinon.stub(that.oTable.getControlDelegate(), "formatGroupHeader");
			oPlugin.getGroupHeaderFormatter()("MyContext", "MyProperty");
			assert.ok(oGroupHeaderFormatter.calledOnceWithExactly(that.oTable, "MyContext", "MyProperty"), "Call Delegate.formatGroupHeader");
			oGroupHeaderFormatter.restore();

			that.assertFetchPropertyCalls(assert, 0);
		});
	});

	QUnit.test("GridTable; p13nMode", function(assert) {
		const oPlugin = PluginBase.getPlugin(this.oTable._oTable, "sap.ui.table.plugins.V4Aggregation");

		this.resetFetchPropertyCalls();
		this.oTable.setP13nMode();

		assert.ok(oPlugin, "V4Aggregation plugin is added to the inner table");
		assert.notOk(oPlugin.isActive(), "V4Aggregation plugin is not active");
		assert.equal(oPlugin, PluginBase.getPlugin(this.oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
			"V4Aggregation plugin is the same instance");
		this.assertFetchPropertyCalls(assert, 0);

		this.oTable.setP13nMode(["Group"]);
		assert.ok(oPlugin, "V4Aggregation plugin is added to the inner table");
		assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");
		assert.equal(oPlugin, PluginBase.getPlugin(this.oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
			"V4Aggregation plugin is the same instance");
		this.assertFetchPropertyCalls(assert, 0);
	});

	QUnit.test("GridTable; Initial activation of analytical p13n modes", function(assert) {
		const that = this;

		return this.initTable({
			p13nMode: []
		}).then(function() {
			that.resetFetchPropertyCalls();
			that.oTable.setP13nMode(["Group"]);

			assert.notOk(PluginBase.getPlugin(that.oTable._oTable, "sap.ui.table.plugins.V4Aggregation"),
				"V4Aggregation plugin is not yet added to the inner table");

			return new Promise(function(resolve) {
				new ManagedObjectObserver(function() {
					resolve();
				}).observe(that.oTable._oTable, {
					aggregations: ["dependents"]
				});
			});
		}).then(function() {
			const oPlugin = PluginBase.getPlugin(that.oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
			assert.ok(oPlugin, "V4Aggregation plugin is added to the inner table");
			assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");

			const oGroupHeaderFormatter = sinon.stub(that.oTable.getControlDelegate(), "formatGroupHeader");
			oPlugin.getGroupHeaderFormatter()("MyContext", "MyProperty");
			assert.ok(oGroupHeaderFormatter.calledOnceWithExactly(that.oTable, "MyContext", "MyProperty"), "Call Delegate.formatGroupHeader");
			oGroupHeaderFormatter.restore();

			that.assertFetchPropertyCalls(assert, 0);
		});
	});

	QUnit.module("Basic functionality with JsControlTreeModifier", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				dataType: "String",
				groupable: true,
				aggregatable: true,
				extension: {
					customAggregate: {}
				}
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				dataType: "String",
				groupable: true,
				aggregatable: true,
				extension: {
					customAggregate: {}
				}
			}, {
				name: "name_country",
				label: "Complex Title & Description",
				propertyInfos: ["Name", "Country"]
			}, {
				name: "Value",
				label: "Value",
				path: "Value",
				dataType: "String",
				sortable: false,
				filterable: false
			}]);
		},
		beforeEach: function() {
			return this.createTestObjects().then(function() {
				return this.oTable.getEngine().getModificationHandler().waitForChanges({
					element: this.oTable
				});
			}.bind(this));
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		},
		createTestObjects: async function() {
			const mCreatedApp = await createAppEnvironment(sTableView1, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oUiComponentContainer.placeAt("qunit-fixture");
			this.oTable = mCreatedApp.view.byId("myTable");
			ControlPersonalizationWriteAPI.restore({
				selector: this.oTable
			});
			await this.oTable.initialized();
			await nextUIUpdate();
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Allowed analytics on column header and tableDelegate API's", async function(assert) {
		const oTable = this.oTable;
		const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
		let oQuickAction;

		this.oTable.addColumn(new Column({
			header: "Value",
			propertyKey: "Value",
			template: new Text({text: "Value"})
		}));

		oTable.setAggregateConditions({
			Country: {}
		});
		await oTable.rebind();
		assert.ok(fSetAggregationSpy.calledOnceWithExactly({
			visible: ["Name", "Country", "Value"],
			groupLevels: [],
			grandTotal: ["Country"],
			subtotals: ["Country"],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo call");

		await TableQUnitUtils.openColumnMenu(oTable, 0);
		oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup");
		assert.ok(oQuickAction, "The first column has a quick group");
		assert.equal(oQuickAction.getItems().length, 1, "The quick group has one item");
		oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal");
		assert.ok(oQuickAction, "The first column has a quick total");

		await TableQUnitUtils.openColumnMenu(oTable, 2);
		oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup");
		assert.strictEqual(oQuickAction.getItems().length, 2, "The last column has complex property with list of two items");

		fSetAggregationSpy.reset();
		oTable.setGroupConditions({
			groupLevels: [{
				name: "Name"
			}]
		});
		await oTable.rebind();
		assert.ok(fSetAggregationSpy.calledOnceWithExactly({
			visible: ["Name", "Country", "Value"],
			groupLevels: ["Name"],
			grandTotal: ["Country"],
			subtotals: ["Country"],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo call");

		fSetAggregationSpy.reset();
		oTable.insertColumn(new Column({
			id: "cl"
		}), 2);
		await oTable.rebind();
		assert.ok(fSetAggregationSpy.calledOnceWithExactly({
			visible: ["Name", "Country", "Value"],
			groupLevels: ["Name"],
			grandTotal: ["Country"],
			subtotals: ["Country"],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo call");

		fSetAggregationSpy.restore();
	});

	QUnit.test("Grouping enabled on column menu open", function(assert) {
		const oTable = this.oTable;
		const done = assert.async();

		oTable._fullyInitialized().then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			oTable._fullyInitialized().then(function() {
				const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
				const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				const oDelegate = oTable.getControlDelegate();
				const fnRebind = oDelegate.rebind;

				oDelegate.rebind = function() {
					fnRebind.apply(this, arguments);
					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: ["Name"],
						grandTotal: [],
						subtotals: [],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false}
						]),
						search: undefined
					}), "Plugin#setAggregationInfo call");
					fSetAggregationSpy.restore();
					oDelegate.rebind = fnRebind;
					oTable.getEngine().reset(oTable, ["Group"]).then(function() {
						done();
					});
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Aggregation enabled on column menu open", function(assert) {
		const oTable = this.oTable;
		const done = assert.async();

		oTable._fullyInitialized().then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 1);
		}).then(function() {
			oTable._fullyInitialized().then(function() {
				const oDelegate = oTable.getControlDelegate();
				const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
				const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				const fnRebind = oDelegate.rebind;

				oDelegate.rebind = function() {
					fnRebind.apply(this, arguments);
					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: [],
						grandTotal: ["Country"],
						subtotals: ["Country"],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: true, grandTotal: true},
							{subtotals: true, grandTotal: true}
						]),
						search: undefined
					}), "Plugin#setAggregationInfo call");
					fSetAggregationSpy.restore();
					oDelegate.rebind = fnRebind;
					oTable.getEngine().reset(oTable, ["Aggregate"]).then(function() {
						done();
					});
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Grouping and Aggregation on two columns", function(assert) {
		const oTable = this.oTable;
		const done = assert.async();

		oTable._fullyInitialized().then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			const oDelegate = oTable.getControlDelegate();
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
			const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
			const fnRebind = oDelegate.rebind;

			oDelegate.rebind = function() {
				fnRebind.apply(this, arguments);
				assert.ok(fSetAggregationSpy.calledOnceWithExactly({
					visible: ["Name", "Country"],
					groupLevels: ["Name"],
					grandTotal: [],
					subtotals: [],
					columnState: createColumnStateIdMap(oTable, [
						{subtotals: false, grandTotal: false},
						{subtotals: false, grandTotal: false},
						{subtotals: false, grandTotal: false}
					]),
					search: undefined
				}), "Plugin#setAggregationInfo call");

				fSetAggregationSpy.restore();
				oDelegate.rebind = fnRebind;

				TableQUnitUtils.openColumnMenu(oTable, 1).then(function() {
					const oDelegate = oTable.getControlDelegate();
					const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
					const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
					const fnRebind = oDelegate.rebind;

					oDelegate.rebind = function() {
						fnRebind.apply(this, arguments);
						assert.ok(fSetAggregationSpy.calledOnceWithExactly({
							visible: ["Name", "Country"],
							groupLevels: ["Name"],
							grandTotal: ["Country"],
							subtotals: ["Country"],
							columnState: createColumnStateIdMap(oTable, [
								{subtotals: false, grandTotal: false},
								{subtotals: true, grandTotal: true},
								{subtotals: true, grandTotal: true}
							]),
							search: undefined
						}), "Plugin#setAggregationInfo call");

						fSetAggregationSpy.restore();
						oDelegate.rebind = fnRebind;
						oTable.getEngine().reset(oTable, ["Group", "Aggregate"]).then(function() {
							done();
						});
					};

					getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
				});
			};

			getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
		});
	});

	QUnit.test("Grouping and aggregation on the same column", function(assert) {
		const oTable = this.oTable;
		let oDelegate, oPlugin, fSetAggregationSpy, fnRebind;

		return oTable._fullyInitialized().then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			oDelegate = oTable.getControlDelegate();
			oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
			fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
			fnRebind = oDelegate.rebind;

			return new Promise(function(resolve) {
				oDelegate.rebind = function() {
					fnRebind.apply(this, arguments);

					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: [],
						grandTotal: ["Name"],
						subtotals: ["Name"],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: true, grandTotal: true},
							{subtotals: false, grandTotal: false},
							{subtotals: true, grandTotal: true}
						]),
						search: undefined
					}), "Plugin#setAggregationInfo call");

					fSetAggregationSpy.reset();
					oDelegate.rebind = fnRebind;
					resolve();
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
			});

		}).then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			fSetAggregationSpy.reset();

			return new Promise(function(resolve) {
				oDelegate.rebind = function() {
					fnRebind.apply(this, arguments);

					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: ["Name"],
						grandTotal: ["Name"],
						subtotals: ["Name"],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: true, grandTotal: true},
							{subtotals: false, grandTotal: false},
							{subtotals: true, grandTotal: true}
						]),
						search: undefined
					}), "Plugin#setAggregationInfo call");

					oDelegate.rebind = fnRebind;
					resolve();
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
			});
		});
	});

	QUnit.test("getInResultPropertyKeys", async function(assert) {
		const oTable = this.oTable;

		await oTable.initialized();
		const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

		oTable.getControlDelegate().getInResultPropertyKeys = function() {
			return ["Value"];
		};

		oTable.setAggregateConditions({
			SalesAmount: {}
		});

		await oTable.rebind();

		assert.ok(oSetAggregation.calledOnceWithExactly({
			visible: ["Name", "Country", "Value"],
			groupLevels: [],
			grandTotal: ["SalesAmount"],
			subtotals: ["SalesAmount"],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo called with the right getInResultPropertyKeys");

		oTable.setP13nMode(["Column"]);

		const oBindingInfo = {};
		oTable.getControlDelegate().updateBindingInfo(oTable, oBindingInfo);
		assert.deepEqual(oBindingInfo, {parameters: {$select: ["Value"]}, sorter: [], filters: [], path: "/Products"},
			"Correct $select parameter in bindingInfo from aInResultPropertyKeys");
	});

	QUnit.module("Tests with specific propertyInfos", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				dataType: "String",
				groupable: true
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				dataType: "String"
			}, {
				name: "Value",
				label: "Value",
				path: "Value",
				dataType: "String"
			}, {
				name: "name_country",
				label: "Complex Title & Description",
				propertyInfos: ["Name", "Country"]
			}]);
		},
		beforeEach: function() {
			return this.createTestObjects().then(function() {
				return this.oTable.getEngine().getModificationHandler().waitForChanges({
					element: this.oTable
				});
			}.bind(this));
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		},
		createTestObjects: async function() {
			const mCreatedApp = await createAppEnvironment(sTableView2, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oUiComponentContainer.placeAt("qunit-fixture");
			this.oTable = mCreatedApp.view.byId('myTable');
			ControlPersonalizationWriteAPI.restore({
				selector: this.oTable
			});
			await this.oTable.initialized();
			await nextUIUpdate();
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Check column header for analytics buttons", function(assert) {
		const oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			assert.ok(getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup"), "The first column has group menu item");
			assert.notOk(getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal"), "The first column doesn't have an aggregate menu item");
		});
	});

	QUnit.module("Column state to plugin", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [
				{name: "CountryKey", path: "Country", label: "CountryKey", groupable: true, text: "CountryText", dataType: "String"},
				{name: "CountryText", path: "CountryText", label: "CountryText", groupable: true, dataType: "String"},
				{name: "CountryKeyAndText", label: "CountryKey+CountryText", propertyInfos: ["CountryKey", "CountryText"]},
				{name: "SalesAmount", path: "SalesAmount", label: "SalesAmount", unit: "Currency", dataType: "String"},
				{name: "Currency", path: "Currency", label: "Currency", groupable: true, dataType: "String"},
				{name: "SalesAmountAndCurrency", label: "SalesAmount+Currency", propertyInfos: ["SalesAmount", "Currency"]},
				{name: "SalesAmountAndRegion", label: "SalesAmount+Region", propertyInfos: ["SalesAmount", "Region"]},
				{name: "CurrencyAndRegion", label: "Currency+Region", propertyInfos: ["Currency", "Region"]},
				{name: "Region", path: "Region", label: "Region", groupable: true, dataType: "String"},
				{name: "RegionText", path: "RegionText", label: "RegionText", groupable: true, dataType: "String"},
				{name: "SalesAmountInLocalCurrency", path: "SalesAmountInLocalCurrency", label: "SalesAmountInLocalCurrency", dataType: "String"},
				{
					name: "SalesAmountAndSalesAmountInLocalCurrency",
					label: "SalesAmountAndSalesAmountInLocalCurrency",
					propertyInfos: ["SalesAmount", "SalesAmountInLocalCurrency"]
				},
				{name: "RegionAndRegionText", label: "Region+RegionText", propertyInfos: ["Region", "RegionText"]}
			]);
		},
		beforeEach: function() {
			return this.createTestObjects().then(function() {
				this.oTable.destroyColumns();
				this.oTable.addColumn(new Column({
					header: "CountryKey",
					propertyKey: "CountryKey",
					template: new Text({text: "CountryKey"})
				}));
				this.oTable.addColumn(new Column({
					header: "CountryText",
					propertyKey: "CountryText",
					template: new Text({text: "CountryText"})
				}));
				this.oTable.addColumn(new Column({
					header: "CountryKey+CountryText",
					propertyKey: "CountryKeyAndText",
					template: new Text({text: "CountryKey CountryText"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount",
					propertyKey: "SalesAmount",
					template: new Text({text: "SalesAmount"})
				}));
				this.oTable.addColumn(new Column({
					header: "Currency",
					propertyKey: "Currency",
					template: new Text({text: "Currency"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount+Currency",
					propertyKey: "SalesAmountAndCurrency",
					template: new Text({text: "SalesAmount Currency"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount+Region",
					propertyKey: "SalesAmountAndRegion",
					template: new Text({text: "SalesAmount Region"})
				}));
				this.oTable.addColumn(new Column({
					header: "Currency+Region",
					propertyKey: "CurrencyAndRegion",
					template: new Text({text: "Currency Region"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount+SalesAmountInLocalCurrency",
					propertyKey: "SalesAmountAndSalesAmountInLocalCurrency",
					template: new Text({text: "SalesAmount SalesAmountInLocalCurrency"})
				}));
				this.oTable.addColumn(new Column({
					header: "Region+RegionText",
					propertyKey: "RegionAndRegionText",
					template: new Text({text: "Region RegionText"})
				}));
				return this.oTable.getEngine().getModificationHandler().waitForChanges({
					element: this.oTable
				});
			}.bind(this));
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		},
		createTestObjects: async function() {
			const mCreatedApp = await createAppEnvironment(sTableView2, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oUiComponentContainer.placeAt("qunit-fixture");
			this.oTable = mCreatedApp.view.byId('myTable');
			ControlPersonalizationWriteAPI.restore({
				selector: this.oTable
			});
			await this.oTable.initialized();
			await nextUIUpdate();
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Aggregate", async function(assert) {
		const oTable = this.oTable;
		const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

		oTable.setAggregateConditions({
			SalesAmount: {}
		});
		await oTable.rebind();

		assert.ok(oSetAggregation.calledOnceWithExactly({
			visible: ["CountryKey", "CountryText", "SalesAmount", "Currency", "Region", "SalesAmountInLocalCurrency", "RegionText"],
			groupLevels: [],
			grandTotal: ["SalesAmount"],
			subtotals: ["SalesAmount"],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo call");
	});

	QUnit.test("Group", async function(assert) {
		const oTable = this.oTable;
		const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

		oTable.setGroupConditions({
			groupLevels: [{
				name: "CountryKey"
			}]
		});
		await oTable.rebind();

		assert.ok(oSetAggregation.calledOnceWithExactly({
			visible: ["CountryKey", "CountryText", "SalesAmount", "Currency", "Region", "SalesAmountInLocalCurrency", "RegionText"],
			groupLevels: ["CountryKey"],
			grandTotal: [],
			subtotals: [],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo call");
	});

	QUnit.test("Group and aggregate", async function(assert) {
		const oTable = this.oTable;
		const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

		oTable.setGroupConditions({
			groupLevels: [{
				name: "CountryKey"
			}]
		});
		oTable.setAggregateConditions({
			SalesAmount: {}
		});
		await oTable.rebind();

		assert.ok(oSetAggregation.calledOnceWithExactly({
			visible: ["CountryKey", "CountryText", "SalesAmount", "Currency", "Region", "SalesAmountInLocalCurrency", "RegionText"],
			groupLevels: ["CountryKey"],
			grandTotal: ["SalesAmount"],
			subtotals: ["SalesAmount"],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: true, grandTotal: true},
				{subtotals: false, grandTotal: false}
			]),
			search: undefined
		}), "Plugin#setAggregationInfo call");
	});

	QUnit.test("$search", async function(assert) {
		const oTable = this.oTable;

		sinon.stub(oTable.getControlDelegate(), "updateBindingInfo").callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters["$search"] = "Name";
		});

		await TableQUnitUtils.waitForBindingInfo(oTable);
		const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		const oBindRowsSpy = sinon.spy(oTable._oTable, "bindRows");
		const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");
		oTable.setGroupConditions({groupLevels: [{name: "CountryKey"}]});
		await oTable.rebind();
		const oBindingInfo = oTable._oTable.getBindingInfo("rows");

		assert.notOk(oBindingInfo.parameters["$search"], "$search has been removed from the binding info");
		assert.ok(oBindRowsSpy.calledWithExactly(oBindingInfo), "BindRows of inner table called with oBindingInfo without $search parameter");
		assert.ok(oSetAggregation.calledOnceWithExactly({
			visible: ["CountryKey", "CountryText", "SalesAmount", "Currency", "Region", "SalesAmountInLocalCurrency", "RegionText"],
			groupLevels: ["CountryKey"],
			grandTotal: [],
			subtotals: [],
			columnState: createColumnStateIdMap(oTable, [
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false},
				{subtotals: false, grandTotal: false}
			]),
			search: "Name"
		}), "Plugin#setAggregationInfo call");

		oTable.getControlDelegate().updateBindingInfo.restore();
	});

	QUnit.module("#updateBinding", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				path: "Name",
				label: "Name",
				sortable: true,
				groupable: true,
				filterable: true,
				dataType: "String"
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				sortable: true,
				groupable: true,
				filterable: true,
				dataType: "String"
			}]);
		},
		beforeEach: async function() {
			this.oTable = new Table({
				autoBindOnInit: false,
				p13nMode: ["Column", "Sort", "Filter", "Group", "Aggregate"],
				delegate: {
					name: "odata.v4.TestDelegate"
				}
			}).addColumn(new Column({
				header: "Name",
				propertyKey: "Name",
				dataType: "String",
				template: new Text({text: "Name"})
			})).setModel(new ODataModel({
				serviceUrl: "serviceUrl/",
				operationMode: "Server"
			}));

			await this.oTable.initialized();
			await this.oTable.rebind();
			this.oInnerTable = this.oTable._oTable;
			this.oRowBinding = this.oTable.getRowBinding();
			this.oSetAggregationSpy = sinon.spy(PluginBase.getPlugin(this.oInnerTable, "sap.ui.table.plugins.V4Aggregation"),
				"setAggregationInfo");
			this.oRebindSpy = sinon.spy(this.oTable.getControlDelegate(), "rebind");
			this.oChangeParametersSpy = sinon.spy(this.oRowBinding, "changeParameters");
			this.oFilterSpy = sinon.spy(this.oRowBinding, "filter");
			this.oSortSpy = sinon.spy(this.oRowBinding, "sort");
			this.oSuspendSpy = sinon.spy(this.oRowBinding, "suspend");
			this.oResumeSpy = sinon.spy(this.oRowBinding, "resume");
			this.oRefreshSpy = sinon.spy(this.oRowBinding, "refresh");
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oSetAggregationSpy.restore();
			this.oRebindSpy.restore();
			this.oChangeParametersSpy.restore();
			this.oFilterSpy.restore();
			this.oSortSpy.restore();
			this.oSuspendSpy.restore();
			this.oResumeSpy.restore();
			this.oRefreshSpy.restore();
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("Update binding within suspend and resume", async function(assert) {
		this.oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
		this.oTable.setFilterConditions({Name: [{operator: OperatorName.EQ, values: ["Test"], validated: ConditionValidated.NotValidated}]});
		this.oTable.setGroupConditions({groupLevels: [{name: "Name"}]});
		this.oTable.setAggregateConditions({Name: {}});
		await this.oTable.rebind();

		const aTableProperties = this.oTable.getPropertyHelper().getProperties();
		assert.equal(this.oSortSpy.callCount, 1, "Binding#sort called once");
		sinon.assert.calledWithExactly(this.oSortSpy, [new Sorter("Name", true)]);
		assert.equal(this.oFilterSpy.callCount, 1, "Binding#filter called once");
		sinon.assert.calledWithExactly(this.oFilterSpy, [FilterUtil.getFilterInfo(this.oTable.getControlDelegate().getTypeMap(), this.oTable.getConditions(), aTableProperties).filters], "Application");
		assert.equal(this.oChangeParametersSpy.callCount, 1, "Binding#changeParameters called once");
		sinon.assert.calledWithExactly(this.oChangeParametersSpy, {});
		assert.equal(this.oSetAggregationSpy.callCount, 1, "Binding#setAggregation called once");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, {
			columnState: createColumnStateIdMap(this.oTable, [{grandTotal: true, subtotals: true}]),
			grandTotal: ["Name"],
			groupLevels: ["Name"],
			search: undefined,
			subtotals: ["Name"],
			visible: ["Name"]
		});
		sinon.assert.callOrder(
			this.oSuspendSpy,
			this.oSetAggregationSpy,
			this.oChangeParametersSpy,
			this.oFilterSpy,
			this.oSortSpy,
			this.oResumeSpy
		);
		assert.ok(this.oRebindSpy.notCalled, "Aggregation binding was not replaced");
	});

	QUnit.test("Update suspended binding", async function(assert) {
		this.oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
		this.oTable.getRowBinding().suspend();
		this.oSuspendSpy.resetHistory();
		await this.oTable.rebind();

		assert.equal(this.oSortSpy.callCount, 1, "Binding#sort called once");
		sinon.assert.calledWithExactly(this.oSortSpy, [new Sorter("Name", true)]);
		assert.ok(this.oSuspendSpy.notCalled, "Binding#suspend not called");
		assert.ok(this.oResumeSpy.notCalled, "Binding#resume not called");
		assert.ok(this.oRebindSpy.notCalled, "Aggregation binding was not replaced");
	});

	QUnit.test("Sort", async function(assert) {
		this.oTable.setSortConditions({sorters: [{name: "Name", descending: false}]});
		await this.oTable.rebind();
		assert.ok(this.oSortSpy.firstCall.calledWithExactly(this.oTable.getControlDelegate().getSorters(this.oTable)));

		this.oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
		await this.oTable.rebind();
		assert.ok(this.oSortSpy.secondCall.calledWithExactly(this.oTable.getControlDelegate().getSorters(this.oTable)));

		this.oTable.setSortConditions();
		await this.oTable.rebind();
		assert.equal(this.oSortSpy.callCount, 3);
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Filter", async function(assert) {
		const aFilters = [new Filter("Name", "EQ", "a")];
		const oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");
		oUpdateBindingInfoStub.callsFake(function(oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/Products";
			oBindingInfo.filters = aFilters;
		});

		await this.oTable.rebind();
		assert.ok(this.oFilterSpy.firstCall.calledWithExactly(aFilters, "Application"));

		oUpdateBindingInfoStub.restore();
		await this.oTable.rebind();
		assert.ok(this.oFilterSpy.secondCall.calledWithExactly([], "Application"));
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Group", async function(assert) {
		this.oTable.setGroupConditions({groupLevels: [{name: "Name"}]});
		await this.oTable.rebind();
		assert.ok(this.oSetAggregationSpy.firstCall.calledWithMatch({groupLevels: ["Name"]}));

		this.oTable.setGroupConditions();
		await this.oTable.rebind();
		assert.ok(this.oSetAggregationSpy.secondCall.calledWithMatch({groupLevels: []}));
		assert.equal(this.oRebindSpy.callCount, 0);

		// Test grouping on non visible column in ResponsiveTable
		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();
		this.oTable.setGroupConditions({groupLevels: [{name: "Country"}]});
		await this.oTable.rebind();
		assert.deepEqual(this.oTable._oTable.getBindingInfo("items").sorter, [], "Column Country is not visible. No sorter applied");
	});

	QUnit.test("Aggregates", async function(assert) {
		this.oTable.setAggregateConditions({Name: {}});
		await this.oTable.rebind();
		assert.ok(this.oSetAggregationSpy.firstCall.calledWithMatch({
			grandTotal: ["Name"],
			subtotals: ["Name"]
		}));

		this.oTable.setAggregateConditions();
		await this.oTable.rebind();
		assert.ok(this.oSetAggregationSpy.secondCall.calledWithMatch({grandTotal: [], subtotals: []}));
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Parameters", async function(assert) {
		const oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

		oUpdateBindingInfoStub.onCall(0).callsFake(function(oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/Products";
			oBindingInfo.parameters.$search = "x";
		});
		oUpdateBindingInfoStub.onCall(1).callsFake(function(oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/Products";
			oBindingInfo.parameters.$search = undefined;
		});
		oUpdateBindingInfoStub.onCall(2).callsFake(function(oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/Products";
			oBindingInfo.parameters.$$canonicalPath = true;
		});

		await this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1);
		await this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 2);
		assert.equal(this.oRebindSpy.callCount, 0);

		oUpdateBindingInfoStub.restore();
	});

	QUnit.test("Add Column", async function(assert) {
		this.oTable.insertColumn(new Column());
		await this.oTable.rebind();

		assert.equal(this.oChangeParametersSpy.callCount, 0);
		assert.equal(this.oFilterSpy.callCount, 0);
		assert.equal(this.oSortSpy.callCount, 0);
		assert.equal(this.oSetAggregationSpy.callCount, 1);
		assert.equal(this.oRebindSpy.callCount, 1);
	});

	QUnit.test("Change path", async function(assert) {
		const oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

		oUpdateBindingInfoStub.callThrough().onCall(1).callsFake(function(oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = oBindingInfo.path + "something_else";
		});

		await this.oTable.rebind();
		this.oRebindSpy.resetHistory();
		await this.oTable.rebind();

		assert.equal(this.oRebindSpy.callCount, 1, "Changing the path forces a rebind");
		oUpdateBindingInfoStub.restore();
	});

	QUnit.test("Refresh binding", async function(assert) {
		await this.oTable._rebind(true);
		assert.equal(this.oRebindSpy.callCount, 0, "No rebind was performed");
		assert.equal(this.oRefreshSpy.callCount, 1, "Binding#refresh has been called");
	});

	QUnit.module("#validateState", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				dataType: "String",
				groupable: true,
				aggregatable: true,
				extension: {
					customAggregate: {}
				}
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				dataType: "String",
				groupable: true,
				aggregatable: true,
				extension: {
					customAggregate: {}
				}
			}, {
				name: "name_country",
				label: "Complex Title & Description",
				propertyInfos: ["Name", "Country"]
			}, {
				name: "Value",
				label: "Value",
				path: "Value",
				dataType: "String",
				sortable: false,
				filterable: false
			}]);
		},
		beforeEach: function() {
			this.oTable = new Table({
				p13nMode: ["Group", "Aggregate"],
				delegate: {
					name: "sap/ui/mdc/odata/v4/TableDelegate"
				}
			});
			return this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("Sort restrictions", function(assert) {
		const sMessage = Library.getResourceBundleFor("sap.ui.mdc").getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "name_country"}]
		}, "Sort"), {
			validation: MessageType.None,
			message: undefined
		}, "No sorted properties");

		assert.deepEqual(this.oTable.validateState({
			sorters: [{name: "Name"}, {name: "Country"}]
		}, "Sort"), {
			validation: MessageType.Information,
			message: sMessage
		}, "Sorted properties and no visible columns");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}],
			sorters: [{name: "Name"}, {name: "Country"}]
		}, "Sort"), {
			validation: MessageType.None,
			message: undefined
		}, "All sorted properties visible");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}]
		}, "Sort"), {
			validation: MessageType.Information,
			message: sMessage
		}, "Sorted property invisible");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "name_country"}],
			sorters: [{name: "Country"}]
		}, "Sort"), {
			validation: MessageType.None,
			message: undefined
		}, "Sorted property is part of a visible complex property");

		this.oTable.setP13nMode();
		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}]
		}, "Sort"), {
			validation: MessageType.None,
			message: undefined
		}, "Sorted property invisible and analytical features not enabled");
	});

	QUnit.test("Group restrictions", function(assert) {
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}]
		}, "Group"), {
			validation: MessageType.None,
			message: undefined
		}, "No grouped properties");

		assert.deepEqual(this.oTable.validateState({
			groupLevels: [{name: "Country"}]
		}, "Group"), {
			validation: MessageType.None,
			message: undefined
		}, "Grouped properties and no visible columns");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			aggregations: {Name: {}}
		}, "Group"), {
			validation: MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS", "Name")
		}, "Grouping and aggreagtion can't be used simulatneously");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "name_country"}],
			groupLevels: [{name: "Country"}]
		}, "Group"), {
			validation: MessageType.None,
			message: undefined
		}, "The grouped property is part of a visible complex property");

		this.oTable.setType(TableType.ResponsiveTable);
		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			groupLevels: [{name: "Country"}]
		}, "Group"), {
			validation: MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")
		}, "Grouped property invisible with ResponsiveTable type");
	});

	QUnit.test("Column restrictions", function(assert) {
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}]
		}, "Column"), {
			validation: MessageType.None,
			message: undefined
		}, "Valid state");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}]
		}, "Column"), {
			validation: MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
		}, "Removing the column that contains a sorted property");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			aggregations: {Country: {}}
		}, "Column"), {
			validation: MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION")
		}, "Removing the column that contains an aggregated property");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}],
			aggregations: {Country: {}}
		}, "Column"), {
			validation: MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION")
				+ "\n" + oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
		}, "Removing the column that contains a sorted and an aggregated property");

		this.oTable.setType(TableType.ResponsiveTable);
		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			groupLevels: [{name: "Country"}]
		}, "Column"), {
			validation: MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")
		}, "Removing the column that contains a grouped property with ResponsiveTable type");
	});

	QUnit.module("API", {
		afterEach: function() {
			this.destroyTable();
		},
		initTable: function(mSettings) {
			this.destroyTable();
			this.oTable = new Table(Object.assign({
				autoBindOnInit: false,
				delegate: {
					name: "sap/ui/mdc/odata/v4/TableDelegate"
				}
			}, mSettings));
			return this.oTable.initialized();
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	// BCP: 2380131026
	QUnit.test("#updateBindingInfo - Sort invisible property if analytics is enabled", function(assert) {
		TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
			name: "Name",
			path: "Name_Path",
			label: "Name_Label",
			dataType: "String"
		}, {
			name: "FirstName",
			path: "FirstName_Path",
			label: "FirstName_Label",
			dataType: "String"
		}, {
			name: "ID",
			path: "ID_Path",
			label: "ID_Label",
			dataType: "String"
		}]);

		return this.initTable({
			p13nMode: ["Sort", "Filter", "Group", "Aggregate"],
			columns: [
				new Column({
					propertyKey: "Name",
					header: new Text({
						text: "Name_Label"
					}),
					template: new Text({
						text: "{Name_Path}"
					})
				})
			],
			sortConditions: {
				sorters: [
					{name: "Name", descending: true},
					{name: "FirstName", descending: true}
				]
			},
			filterConditions: {
				ID: [{
					isEmpty: null,
					operator: OperatorName.EQ,
					validated: ConditionValidated.NotValidated,
					values: ["test"]
				}]
			}
		}).then(() => {
			return this.oTable._fullyInitialized();
		}).then(() => {
			const aExpectedSorter = [new Sorter("Name_Path", true)];
			const aExpectedFilter = [
				FilterUtil.getFilterInfo(this.oTable.getControlDelegate().getTypeMap(),
					this.oTable.getConditions(),
					this.oTable.getPropertyHelper().getProperties()).filters
			];

			const oBindingInfo = {};
			TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aExpectedSorter, filters: aExpectedFilter}, "Table");

			this.oTable.setType("ResponsiveTable");
			aExpectedSorter.push(new Sorter("FirstName_Path", true));
			TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aExpectedSorter, filters: aExpectedFilter}, "ResponsiveTable");
		}).finally(() => {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		});
	});

	QUnit.test("#getSupportedFeatures", function(assert) {
		const fnTest = function(sTableType, oExpectedFeatures) {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			return pInit.then(function(oTable) {
				const oFeatures = oTable.getControlDelegate().getSupportedFeatures(oTable);
				assert.deepEqual(oFeatures, oExpectedFeatures, sTableType + ": supported features are correct");
			});
		}.bind(this);

		return fnTest(TableType.Table, {
			p13nModes: ["Column", "Sort", "Filter", "Group", "Aggregate"],
			"export": true,
			expandAllRows: false,
			collapseAllRows: false
		}).then(function() {
			return fnTest(TableType.TreeTable, {
				p13nModes: ["Column", "Sort", "Filter"],
				"export": true,
				expandAllRows: true,
				collapseAllRows: true
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
		const fnTest = async (sTableType, bSupportsExpandAll) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			const oTable = await pInit;
			let iExpandTo = 1;

			sinon.stub(oTable, "getRowBinding").returns({
				setAggregation: sinon.stub().callsFake((oObject) => {
					assert.equal(oObject.expandTo, Number.MAX_SAFE_INTEGER,
						sTableType + ": Binding#setAggregation called with expandTo: Number.MAX_SAFE_INTEGER");
					assert.equal(oObject.test, "Test", sTableType + ": test property not changed");
					iExpandTo = Number.MAX_SAFE_INTEGER;
				}),
				getAggregation: sinon.stub().callsFake(() => {
					return {expandTo: iExpandTo, test: "Test"};
				}),
				refresh: sinon.stub()
			});

			if (bSupportsExpandAll) {
				const oBinding = oTable.getRowBinding();

				oTable.getControlDelegate().expandAllRows(oTable);
				assert.ok(oBinding.setAggregation.calledOnce, sTableType + ": Binding#setAggregation called once if expandTo changes");
				assert.ok(oBinding.refresh.notCalled, sTableType + ": Binding#refresh not called if expandTo changes");

				oBinding.setAggregation.resetHistory();
				oBinding.refresh.resetHistory();
				oTable.getControlDelegate().expandAllRows(oTable);
				assert.ok(oBinding.setAggregation.notCalled, sTableType + ": Binding#setAggregation not called if expandTo doesn't change");
				assert.ok(oBinding.refresh.calledOnceWithExactly(), sTableType + ": Binding#refresh called once if expandTo doesn't change");
			} else {
				assert.throws(() => {
					oTable.getControlDelegate().expandAllRows(oTable);
				}, Error("Unsupported operation: Not supported for the current table type"), sTableType + ": Throws an error");
			}

			oTable.getRowBinding.restore();
		};

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.test("#collapseAllRows", function(assert) {
		const fnTest = async (sTableType, bSupportsCollapseAll) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			const oTable = await pInit;
			let iExpandTo = 2;

			sinon.stub(oTable, "getRowBinding").returns({
				setAggregation: sinon.stub().callsFake((oObject) => {
					assert.equal(oObject.expandTo, 1, "setAggregation called with expandTo: 1");
					assert.equal(oObject.test, "Test", "test property not changed");
					iExpandTo = 1;
				}),
				getAggregation: sinon.stub().callsFake(() => {
					return {expandTo: iExpandTo, test: "Test"};
				}),
				refresh: sinon.stub()
			});

			if (bSupportsCollapseAll) {
				const oBinding = oTable.getRowBinding();

				oTable.getControlDelegate().collapseAllRows(oTable);
				assert.ok(oBinding.setAggregation.calledOnce, sTableType + ": Binding#setAggregation called once if expandTo changes");
				assert.ok(oBinding.refresh.notCalled, sTableType + ": Binding#refresh not called if expandTo changes");

				oBinding.setAggregation.resetHistory();
				oBinding.refresh.resetHistory();
				oTable.getControlDelegate().collapseAllRows(oTable);
				assert.ok(oBinding.setAggregation.notCalled, sTableType + ": Binding#setAggregation not called if expandTo doesn't change");
				assert.ok(oBinding.refresh.calledOnceWithExactly(), sTableType + ": Binding#refresh called once if expandTo doesn't change");
			} else {
				assert.throws(() => {
					oTable.getControlDelegate().collapseAllRows(oTable);
				}, Error("Unsupported operation: Not supported for the current table type"), sTableType + ": Throws an error");
			}

			oTable.getRowBinding.restore();
		};

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.module("Selection", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "ProductName",
				path: "Name",
				label: "Product Name",
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
					name: "odata.v4.TestDelegate"
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
				models: new ODataModel({
					serviceUrl: "/MyService/",
					operationMode: "Server"
				})
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
		}).then(function(oTable) {
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.ODataV4Selection");

			assert.ok(oPlugin, "Applied sap.ui.table.plugins.ODataV4Selection");
			assert.equal(oPlugin.getLimit(), 1337, "Selection limit");
			assert.ok(oPlugin.getEnableNotification(), "Limit notification enabled");
			assert.ok(oPlugin.getHideHeaderSelector(), "Hide header selector");
			assert.equal(oPlugin.getSelectionMode(), "Single", "Selection mode");
			assert.ok(oPlugin.getEnabled(), "Selection plugin enabled");
			oPlugin.fireSelectionChange();
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the plugin");

			oTable.setSelectionMode(SelectionMode.None);
			assert.notOk(oPlugin.getEnabled(), "Set selection mode to 'None': Selection plugin disabled");

			oTable.setSelectionMode(SelectionMode.SingleMaster);
			assert.ok(oPlugin.getEnabled(), "Set selection mode to 'SingleMaster': Selection plugin enabled");
			assert.equal(oPlugin.getSelectionMode(), "Single", "Set selection mode to 'SingleMaster': Selection mode of plugin set to 'Single'");

			oTable.setSelectionMode(SelectionMode.Multi);
			assert.equal(oPlugin.getSelectionMode(), "MultiToggle", "Set selection mode to 'Multi': Selection mode of plugin set to 'MultiToggle'");

			oTable.getType().setSelectionLimit(123);
			assert.equal(oPlugin.getLimit(), 123, "A 'selectionLimit' change correctly affects the plugin");

			oTable.getType().setShowHeaderSelector(true);
			assert.notOk(oPlugin.getHideHeaderSelector(), "A 'showHeaderSelector' change correctly affects the plugin");

			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("rowsUpdated", function() {
					resolve(oTable);
				});
			});
		}).then(function(oTable) {
			oTable._oTable.getRows()[1].getBindingContext().setSelected(true);
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
			const oPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.ODataV4Selection");

			assert.ok(oPlugin, "Applied sap.ui.table.plugins.ODataV4Selection");
			assert.equal(oPlugin.getLimit(), 1337, "Selection limit");
			assert.ok(oPlugin.getEnableNotification(), "Limit notification enabled");
			assert.ok(oPlugin.getHideHeaderSelector(), "Hide header selector");
			assert.equal(oPlugin.getSelectionMode(), "Single", "Selection mode");
			assert.ok(oPlugin.getEnabled(), "Selection plugin enabled");
			oPlugin.fireSelectionChange();
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
			assert.notOk(oPlugin.getHideHeaderSelector(), "A 'showHeaderSelector' change correctly affects the plugin");

			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("rowsUpdated", function() {
					resolve(oTable);
				});
			});
		}).then(function(oTable) {
			oTable._oTable.getRows()[1].getBindingContext().setSelected(true);
			assert.deepEqual(oTable.getSelectedContexts(), [oTable._oTable.getRows()[1].getBindingContext()],
				"#getSelectedContexts after initialization");
		});
	});

	QUnit.test("Initialization with ResponsiveTableType", function(assert) {
		const oSelectionChangeStub = sinon.stub();

		return this.initTable({
			selectionMode: SelectionMode.Single,
			multiSelectMode: TableMultiSelectMode.ClearAll,
			selectionChange: oSelectionChangeStub,
			type: new ResponsiveTableType()
		}, function(oTable) {
			assert.deepEqual(oTable.getSelectedContexts(), [], "#getSelectedContexts if not yet initialized");
		}).then(function(oTable) {
			const oInnerTable = oTable._oTable;

			assert.equal(oInnerTable.getMode(), "SingleSelectLeft", "Selection mode");
			assert.equal(oInnerTable.getMultiSelectMode(), "ClearAll", "Multi select mode");
			oInnerTable.fireSelectionChange();
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the inner table");

			oTable.setSelectionMode(SelectionMode.None);
			assert.equal(oInnerTable.getMode(), "None", "Set selection mode to 'None': Inner table selection mode set to 'None'");

			oTable.setSelectionMode(SelectionMode.SingleMaster);
			assert.equal(oInnerTable.getMode(), "SingleSelectMaster",
				"Set selection mode to 'SingleMaster': Inner table selection mode set to 'SingleSelectMaster'");

			oTable.setSelectionMode(SelectionMode.Multi);
			assert.equal(oInnerTable.getMode(), "MultiSelect",
				"Set selection mode to 'Multi': Inner table selection mode set to 'MultiSelect'");

			oTable.setMultiSelectMode(TableMultiSelectMode.Default);
			assert.equal(oInnerTable.getMultiSelectMode(), "SelectAll",
				"Multi select mode set to 'Default': Inner table multi select mode set to 'SelectAll'");

			return new Promise(function(resolve) {
				oInnerTable.attachEventOnce("updateFinished", function() {
					resolve(oTable);
				});
			});
		}).then((oTable) => {
			this.spy(oTable._oTable, "getSelectedContexts");
			oTable._oTable.getItems()[1].setSelected(true);
			assert.deepEqual(oTable.getSelectedContexts(), [oTable._oTable.getItems()[1].getBindingContext()],
				"#getSelectedContexts after initialization");
			assert.ok(oTable._oTable.getSelectedContexts.calledOnceWithExactly(true), "sap.m.Table#getSelectedContexts called once with 'true'");
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
			oDelegate.setSelectedContexts(this.oTable, aContexts.slice(2, 4).concat(aContexts.slice(-1)));
			assert.deepEqual(
				oDelegate.getSelectedContexts(this.oTable).map((oContext) => oContext.getPath()),
				aContexts.slice(2, 4).concat(aContexts.slice(-1)).map((oContext) => oContext.getPath()),
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
				const aContexts = this.oTable.getRowBinding().getAllCurrentContexts();
				const sTestTitle = `type=${this.oTable.getType() || TableType.Table}; selectionMode=${sSelectionMode}`;

				this.oTable.setSelectionMode(sSelectionMode);

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

	QUnit.test("Filter with ResponsiveTableType and $$clearSelectionOnFilter=true", async function(assert) {
		await this.initTable({
			selectionMode: SelectionMode.Multi,
			type: new ResponsiveTableType(),
			p13nMode: ["Filter"],
			delegate: {
				name: "odata.v4.TestDelegate",
				payload: {
					bindingParameters: {
						$$clearSelectionOnFilter: true
					}
				}
			}
		});
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("_bindingChange", resolve);
		});

		const oBinding = this.oTable.getRowBinding();

		this.oTable.getControlDelegate().setSelectedContexts(this.oTable, [oBinding.getAllCurrentContexts()[0]]);
		assert.deepEqual(
			this.oTable.getSelectedContexts().map((oContext) => oContext.getPath()),
			[oBinding.getAllCurrentContexts()[0]].map((oContext) => oContext.getPath()),
			"Selected contexts"
		);

		this.oTable.setFilterConditions({
			Name: [{operator: OperatorName.EQ, values: ["Test Product (0)"]}]
		});
		await this.oTable.rebind();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("_bindingChange", resolve);
		});
		assert.deepEqual(this.oTable.getSelectedContexts().map((oContext) => oContext.getPath()), [], "Selected contexts");
	});
});
