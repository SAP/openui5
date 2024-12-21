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

		TestDelegate.fetchProperties = function(oTable) {
			const oPayload = oTable.getPayload();

			if (oPayload?.propertyInfo) {
				return Promise.resolve(oPayload.propertyInfo);
			} else {
				return TableDelegate.fetchProperties.apply(this, arguments);
			}
		};

		TestDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
			TableDelegate.updateBindingInfo.apply(this, arguments);

			const oPayload = oTable.getPayload();

			if (oPayload) {
				if (oPayload.collectionPath) {
					oBindingInfo.path = oPayload.collectionPath;
				}
				if (oPayload.bindingParameters) {
					oBindingInfo.parameters = oPayload.bindingParameters;
				}
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

	QUnit.module("Initialization", {
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

	QUnit.test("GridTable", function(assert) {
		return this.initTable().then(function(oTable) {
			assert.ok(PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin in inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.test("TreeTable", function(assert) {
		return this.initTable({
			type: TableType.TreeTable
		}).then(function(oTable) {
			assert.notOk(PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin in inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.test("ResponsiveTable", function(assert) {
		return this.initTable({
			type: TableType.ResponsiveTable
		}).then(function(oTable) {
			assert.notOk(PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin in inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.module("Column header menu", {
		beforeEach: async function() {
			await this.createTestObjects();
			await this.oTable.getEngine().getModificationHandler().waitForChanges({
				element: this.oTable
			});
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		tableViewString:
		`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
			<Table id="myTable" p13nMode="Group,Aggregate" delegate='${JSON.stringify({
				name: "odata.v4.TestDelegate",
				payload: {
					collectionPath: "/Products",
					propertyInfo: [{
						key: "Name",
						label: "Name",
						path: "Name",
						dataType: "String",
						groupable: true,
						aggregatable: true
					}, {
						key: "Country",
						label: "Country",
						path: "Country",
						dataType: "String",
						groupable: true,
						aggregatable: true
					}, {
						key: "name_country",
						label: "Complex Title and Description",
						propertyInfos: ["Name", "Country"]
					}, {
						key: "Value",
						label: "Value",
						path: "Value",
						dataType: "String",
						sortable: false,
						filterable: false
					}]
				}
			})}'>
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
		</mvc:View>`,
		createTestObjects: async function() {
			const mCreatedApp = await createAppEnvironment(this.tableViewString, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oUiComponentContainer.placeAt("qunit-fixture");
			this.oTable = mCreatedApp.view.byId("myTable");
			this.oTable.setModel(new ODataModel({
				serviceUrl: "serviceUrl/",
				operationMode: "Server"
			}));
			await this.oTable.initialized();
			await nextUIUpdate();
		},
		destroyTestObjects: function() {
			ControlPersonalizationWriteAPI.restore({
				selector: this.oTable
			});
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Menu items", async function(assert) {
		let oQuickAction;

		await TableQUnitUtils.openColumnMenu(this.oTable, 0);
		oQuickAction = getQuickAction(this.oTable._oColumnHeaderMenu, "QuickGroup");
		assert.ok(oQuickAction, "The first column has a quick group");
		assert.equal(oQuickAction.getItems().length, 1, "The quick group has one item");
		oQuickAction = getQuickAction(this.oTable._oColumnHeaderMenu, "QuickTotal");
		assert.ok(oQuickAction, "The first column has a quick total");

		this.oTable.addColumn(new Column({
			header: "Value",
			propertyKey: "Value",
			template: new Text({text: "Value"})
		}));
		await nextUIUpdate();
		await TableQUnitUtils.openColumnMenu(this.oTable, 2);
		oQuickAction = getQuickAction(this.oTable._oColumnHeaderMenu, "QuickGroup");
		assert.strictEqual(oQuickAction.getItems().length, 2, "The last column has complex property with list of two items");
	});

	QUnit.test("Grouping on a column", async function(assert) {
		await TableQUnitUtils.openColumnMenu(this.oTable, 0);
		await new Promise((resolve) => {
			sinon.stub(this.oTable.getControlDelegate(), "updateBinding").callsFake(function(oTable) {
				const oSetAggregation = sinon.spy(oTable.getRowBinding(), "setAggregation");
				this.updateBinding.wrappedMethod.apply(this, arguments);
				assert.equal(oSetAggregation.callCount, 1, "Binding#setAggregation call");
				sinon.assert.calledWithExactly(oSetAggregation, {
					aggregate: {},
					grandTotalAtBottomOnly: true,
					subtotalsAtBottomOnly: true,
					group: {Country: {}, Name: {}},
					groupLevels: ["Name"]
				});
				this.updateBinding.restore();
				resolve();
			});
			getQuickAction(this.oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
		});
	});

	QUnit.test("Totals on a column", async function(assert) {
		await TableQUnitUtils.openColumnMenu(this.oTable, 1);
		await new Promise((resolve) => {
			sinon.stub(this.oTable.getControlDelegate(), "updateBinding").callsFake(function(oTable) {
				const oSetAggregation = sinon.spy(oTable.getRowBinding(), "setAggregation");
				this.updateBinding.wrappedMethod.apply(this, arguments);
				assert.equal(oSetAggregation.callCount, 1, "Binding#setAggregation call");
				sinon.assert.calledWithExactly(oSetAggregation, {
					aggregate: {Country: {grandTotal: true, subtotals: true}},
					grandTotalAtBottomOnly: true,
					subtotalsAtBottomOnly: true,
					group: {Name: {}},
					groupLevels: []
				});
				this.updateBinding.restore();
				resolve();
			});
			getQuickAction(this.oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
		});
	});

	QUnit.test("Grouping and totals on different columns", async function(assert) {
		await TableQUnitUtils.openColumnMenu(this.oTable, 0);
		await new Promise((resolve) => {
			sinon.stub(this.oTable.getControlDelegate(), "updateBinding").callsFake(function(oTable) {
				const oSetAggregation = sinon.spy(oTable.getRowBinding(), "setAggregation");
				this.updateBinding.wrappedMethod.apply(this, arguments);
				assert.equal(oSetAggregation.callCount, 1, "Binding#setAggregation call");
				sinon.assert.calledWithExactly(oSetAggregation, {
					aggregate: {},
					grandTotalAtBottomOnly: true,
					subtotalsAtBottomOnly: true,
					group: {Country: {}, Name: {}},
					groupLevels: ["Name"]
				});
				this.updateBinding.restore();
				resolve();
			});
			getQuickAction(this.oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
		});

		this.oTable.getRowBinding().setAggregation.resetHistory();
		await TableQUnitUtils.openColumnMenu(this.oTable, 1);
		await new Promise((resolve) => {
			sinon.stub(this.oTable.getControlDelegate(), "updateBinding").callsFake(function(oTable) {
				this.updateBinding.wrappedMethod.apply(this, arguments);
				assert.equal(oTable.getRowBinding().setAggregation.callCount, 1, "Binding#setAggregation call");
				sinon.assert.calledWithExactly(oTable.getRowBinding().setAggregation, {
					aggregate: {Country: {grandTotal: true, subtotals: true}},
					grandTotalAtBottomOnly: true,
					subtotalsAtBottomOnly: true,
					group: {Name: {}},
					groupLevels: ["Name"]
				});
				this.updateBinding.restore();
				resolve();
			});
			getQuickAction(this.oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
		});
	});

	QUnit.test("Grouping and totals on the same column", async function(assert) {
		await TableQUnitUtils.openColumnMenu(this.oTable, 0);
		await new Promise((resolve) => {
			sinon.stub(this.oTable.getControlDelegate(), "updateBinding").callsFake(function(oTable) {
				const oSetAggregation = sinon.spy(oTable.getRowBinding(), "setAggregation");
				this.updateBinding.wrappedMethod.apply(this, arguments);
				assert.equal(oSetAggregation.callCount, 1, "Binding#setAggregation call");
				sinon.assert.calledWithExactly(oSetAggregation, {
					aggregate: {Name: {grandTotal: true, subtotals: true}},
					grandTotalAtBottomOnly: true,
					subtotalsAtBottomOnly: true,
					group: {Country: {}},
					groupLevels: []
				});
				this.updateBinding.restore();
				resolve();
			});
			getQuickAction(this.oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
		});

		this.oTable.getRowBinding().setAggregation.resetHistory();
		await TableQUnitUtils.openColumnMenu(this.oTable, 0);
		await new Promise((resolve) => {
			sinon.stub(this.oTable.getControlDelegate(), "updateBinding").callsFake(function(oTable) {
				this.updateBinding.wrappedMethod.apply(this, arguments);
				assert.equal(oTable.getRowBinding().setAggregation.callCount, 1, "Binding#setAggregation call");
				sinon.assert.calledWithExactly(oTable.getRowBinding().setAggregation, {
					aggregate: {Name: {grandTotal: true, subtotals: true}},
					grandTotalAtBottomOnly: true,
					subtotalsAtBottomOnly: true,
					group: {Country: {}},
					groupLevels: ["Name"]
				});
				this.updateBinding.restore();
				resolve();
			});
			getQuickAction(this.oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
		});
	});

	QUnit.module("Analytical features", {
		defaultPropertyInfos: [{
			key: "Country",
			path: "CountryPath",
			label: "Country",
			dataType: "String",
			text: "CountryText",
			extension: {
				technicallyGroupable: true
			}
		}, {
			key: "CountryText",
			path: "CountryTextPath",
			label: "CountryText",
			dataType: "String",
			extension: {
				technicallyGroupable: true
			}
		}, {
			key: "Region",
			path: "RegionPath",
			label: "Region",
			dataType: "String",
			text: "RegionText",
			extension: {
				technicallyGroupable: true
			}
		}, {
			key: "RegionText",
			path: "RegionTextPath",
			label: "RegionText",
			dataType: "String",
			extension: {
				technicallyGroupable: true,
				additionalProperties: ["Region"]
			}
		}, {
			key: "SalesAmount",
			path: "SalesAmountPath",
			label: "SalesAmount",
			dataType: "String",
			unit: "Currency",
			extension: {
				technicallyAggregatable: true
			}
		}, {
			key: "Currency",
			path: "CurrencyPath",
			label: "Currency",
			dataType: "String"
		}, {
			key: "SalesAmountInLocalCurrency",
			path: "SalesAmountInLocalCurrencyPath",
			label: "SalesAmountInLocalCurrency",
			dataType: "String",
			unit: "Currency",
			extension: {
				technicallyAggregatable: true,
				additionalProperties: ["Country", "Region"]
			}
		}],
		afterEach: function() {
			this.oTable?.destroy();
		},
		initTable: async function(
			mSettings,
			aVisibleProperties = ["Country", "Region", "SalesAmount"],
			oDelegatePayload = {}
		) {
			const oPayload = {
				collectionPath: "/Products",
				propertyInfo: this.defaultPropertyInfos,
				...oDelegatePayload
			};
			this.oTable = new Table({
				delegate: {
					name: "odata.v4.TestDelegate",
					payload: oPayload
				},
				autoBindOnInit: false,
				p13nMode: ["Group", "Aggregate"],
				models: new ODataModel({
					serviceUrl: "serviceUrl/",
					operationMode: "Server"
				}),
				columns: aVisibleProperties.map((sPropertyKey) => {
					const oProperty = oPayload.propertyInfo.find((oPropertyInfo) => oPropertyInfo.key === sPropertyKey);
					return new Column({
						header: oProperty.label,
						propertyKey: sPropertyKey,
						template: new Text({text: `{${oProperty.path}}`})
					});
				}),
				...mSettings
			});
			await this.oTable.initialized();
			this.observe$$aggregation();
		},
		addColumns: function(aPropertyKeys) {
			for (const sPropertyKey of aPropertyKeys) {
				const oProperty = this.oTable.getPropertyHelper().getProperty(sPropertyKey);
				this.oTable.addColumn(new Column({
					header: oProperty.label,
					propertyKey: sPropertyKey,
					template: new Text({text: `{${oProperty.path}}`})
				}));
			}
		},
		removeColumns: function(aPropertyKeys) {
			for (const sPropertyKey of aPropertyKeys) {
				this.oTable.getColumns().find((oColumn) => oColumn.getPropertyKey() === sPropertyKey).destroy();
			}
		},
		observe$$aggregation: function() {
			const that = this;

			this.aCollected$$Aggregation = [];
			sinon.stub(this.oTable._getType(), "bindRows").callsFake(function(oBindingInfo) {
				that.aCollected$$Aggregation.push({...oBindingInfo.parameters.$$aggregation});
				this.bindRows.wrappedMethod.apply(this, arguments);
				sinon.stub(this.getRowBinding(), "setAggregation").callsFake((mAggregation) => {
					that.aCollected$$Aggregation.push(mAggregation);
				});
			});
		},
		verify$$aggregation: function(mExpectedAggregation) {
			QUnit.assert.equal(this.aCollected$$Aggregation.length, 1, "Number of $$aggregation changes");
			if (this.aCollected$$Aggregation.length === 1) {
				QUnit.assert.deepEqual(this.aCollected$$Aggregation[0], mExpectedAggregation, "$$aggregation");
			}
			this.aCollected$$Aggregation = [];
		}
	});

	QUnit.test("Leaf-level aggregation disabled", async function(assert) {
		await this.initTable(undefined, undefined, {
			propertyInfo: this.defaultPropertyInfos.concat([{
				key: "ID",
				path: "IDPath",
				label: "ID",
				dataType: "String",
				isKey: true,
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "CustomerID",
				path: "CustomerIDPath",
				label: "CustomerID",
				dataType: "String",
				isKey: true,
				text: "CustomerText",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "CustomerText",
				path: "CustomerTextPath",
				label: "CustomerText",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}
			])
		});
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				IDPath: {},
				CustomerIDPath: {},
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
	});

	QUnit.test("Leaf-level aggregation enabled", async function(assert) {
		await this.initTable(undefined, undefined, {
			aggregationConfiguration: {
				leafLevel: true
			},
			propertyInfo: this.defaultPropertyInfos.concat([{
				key: "ID",
				path: "IDPath",
				label: "ID",
				dataType: "String",
				isKey: true,
				extension: {
					technicallyGroupable: true
				}
			}])
		});
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
	});

	QUnit.test("Add and remove group levels", async function(assert) {
		await this.initTable({
			groupConditions: {
				groupLevels: [{
					name: "Country"
				}]
			}
		});
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: ["CountryPath"]
		});

		this.oTable.setGroupConditions();
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
	});

	QUnit.test("Add and remove totals", async function(assert) {
		await this.initTable({
			aggregateConditions: {
				SalesAmount: {}
			}
		}, ["Country", "Region", "SalesAmount", "Currency"]);
		const oV4AggregationPlugin = PluginBase.getPlugin(this.oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		sinon.spy(oV4AggregationPlugin, "declareColumnsHavingTotals");

		assert.equal(this.oTable._oTable.getRowMode().getFixedBottomRowCount(), 0, "Fixed bottom row count");
		assert.equal(oV4AggregationPlugin.declareColumnsHavingTotals.callCount, 0, "V4AggregationPlugin#declareColumnsHavingTotals call");

		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath", grandTotal: true, subtotals: true}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
		assert.equal(this.oTable._oTable.getRowMode().getFixedBottomRowCount(), 1, "Fixed bottom row count");
		assert.ok(oV4AggregationPlugin.declareColumnsHavingTotals.calledOnceWithExactly([
			this.oTable.getColumns()[2].getInnerColumn(),
			this.oTable.getColumns()[3].getInnerColumn()
		]), "V4AggregationPlugin#declareColumnsHavingTotals call");

		oV4AggregationPlugin.declareColumnsHavingTotals.resetHistory();
		this.oTable.setAggregateConditions();
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
		assert.equal(this.oTable._oTable.getRowMode().getFixedBottomRowCount(), 0, "Fixed bottom row count");
		assert.ok(oV4AggregationPlugin.declareColumnsHavingTotals.calledOnceWithExactly([]), "V4AggregationPlugin#declareColumnsHavingTotals call");
	});

	QUnit.test("Group levels and totals", async function(assert) {
		await this.initTable({
			aggregateConditions: {
				SalesAmount: {}
			},
			groupConditions: {
				groupLevels: [{
					name: "Country"
				}]
			}
		});
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath", grandTotal: true, subtotals: true}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: ["CountryPath"]
		});
	});

	QUnit.test("$search binding parameter", async function(assert) {
		await this.initTable();
		sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo").callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters["$search"] = "SomeSearchText";
		});
		await this.oTable.rebind();

		assert.notOk("$search" in this.oTable._oTable.getBindingInfo("rows").parameters, "$search in the binding info");
		this.verify$$aggregation({
			aggregate: {
				SalesAmountPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: [],
			search: "SomeSearchText"
		});

		this.oTable.getControlDelegate().updateBindingInfo.restore();
	});

	QUnit.test("#getInResultPropertyKeys", async function(assert) {
		await this.initTable(undefined, ["Country"], {
			propertyInfo: this.defaultPropertyInfos.concat([{
				key: "NewSalesAmount",
				path: "NewSalesAmountPath",
				label: "NewSalesAmount",
				dataType: "String",
				extension: {
					technicallyAggregatable: true,
					additionalProperties: ["City"]
				}
			}, {
				key: "City",
				path: "CityPath",
				label: "City",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "NotGroupableAndNotAggregatable",
				path: "NotGroupableAndNotAggregatablePath",
				label: "NotGroupableAndNotAggregatable",
				dataType: "String"
			}])
		});
		sinon.stub(this.oTable.getControlDelegate(), "getInResultPropertyKeys").returns([
			"Region", "SalesAmountInLocalCurrency", "NewSalesAmount", "NotGroupableAndNotAggregatable"
		]);
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountInLocalCurrencyPath: {},
				NewSalesAmountPath: {}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {}
			},
			groupLevels: []
		});
		this.oTable.getControlDelegate().getInResultPropertyKeys.restore();
	});

	QUnit.test("ID+Text; Both properties visible", async function(assert) {
		await this.initTable(undefined, ["Country", "CountryText", "Region", "RegionText"]);
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
	});

	QUnit.test("ID+Text; Only ID is visible", async function(assert) {
		await this.initTable(undefined, ["Country", "Region"]);
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {additionally: ["CountryTextPath"]},
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
	});

	QUnit.test("ID+Text; Only Text is visible", async function(assert) {
		await this.initTable(undefined, ["CountryText", "RegionText"]);
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryTextPath: {}, // The Text property has no dependency to the ID property
				RegionPath: {additionally: ["RegionTextPath"]}
			},
			groupLevels: []
		});
	});

	QUnit.test("Aggregatable property with additional properties", async function(assert) {
		await this.initTable(undefined, ["SalesAmountInLocalCurrency"]);
		await this.oTable.rebind();
		this.verify$$aggregation({
			aggregate: {
				SalesAmountInLocalCurrencyPath: {unit: "CurrencyPath"}
			},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {
				CountryPath: {},
				RegionPath: {}
			},
			groupLevels: []
		});
	});

	QUnit.module("#updateBindingInfo", {
		afterEach: function() {
			this.destroyTable();
		},
		initTable: function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				autoBindOnInit: false,
				delegate: {
					name: "odata.v4.TestDelegate",
					payload: {
						propertyInfo: [{
							key: "Name",
							path: "Name_Path",
							label: "Name_Label",
							dataType: "String"
						}, {
							key: "FirstName",
							path: "FirstName_Path",
							label: "FirstName_Label",
							dataType: "String"
						}, {
							key: "ID",
							path: "ID_Path",
							label: "ID_Label",
							dataType: "String"
						}]
					}
				},
				...mSettings
			});
			return this.oTable._fullyInitialized();
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	// BCP: 2380131026
	QUnit.test("Sort invisible property if analytical features are enabled", async function(assert) {
		await this.initTable({
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
		});

		const oBindingInfo = {};
		const aExpectedSorter = [new Sorter("Name_Path", true)];
		const aExpectedFilter = [
			FilterUtil.getFilterInfo(this.oTable.getControlDelegate().getTypeMap(),
				this.oTable.getConditions(),
				this.oTable.getPropertyHelper().getProperties()).filters
		];

		TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
		assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aExpectedSorter, filters: aExpectedFilter}, TableType.Table);

		this.oTable.setType(TableType.ResponsiveTable);
		aExpectedSorter.push(new Sorter("FirstName_Path", true));
		TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
		assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aExpectedSorter, filters: aExpectedFilter}, TableType.ResponsiveTable);
	});

	QUnit.test("$$aggregation.expandTo binding parameter", async function(assert) {
		await this.initTable();

		const oBindingInfo = {};

		sinon.stub(this.oTable, "getRowBinding").returns({
			getAggregation: () => {return {expandTo: 3};}
		});

		TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
		assert.deepEqual(oBindingInfo.parameters, {
			$$aggregation: {
				expandTo: 3
			}
		});

		this.oTable.getRowBinding.returns({
			getAggregation: () => undefined
		});
		TableDelegate.updateBindingInfo(this.oTable, oBindingInfo);
		assert.deepEqual(oBindingInfo.parameters, {});
	});

	QUnit.test("#getInResultPropertyKeys", async function(assert) {
		await this.initTable({
			type: TableType.ResponsiveTable
		});

		sinon.stub(this.oTable.getControlDelegate(), "getInResultPropertyKeys").returns(["Name"]);
		this.oTable.setP13nMode(["Column"]);

		const oBindingInfo = {};
		this.oTable.getControlDelegate().updateBindingInfo(this.oTable, oBindingInfo);
		assert.deepEqual(oBindingInfo, {parameters: {$select: ["Name_Path"]}, sorter: [], filters: []});

		this.oTable.getControlDelegate().getInResultPropertyKeys.restore();
	});

	QUnit.module("#updateBinding", {
		beforeEach: async function() {
			this.oTable = new Table({
				autoBindOnInit: false,
				p13nMode: ["Column", "Sort", "Filter", "Group", "Aggregate"],
				delegate: {
					name: "odata.v4.TestDelegate",
					payload: {
						collectionPath: "/Products",
						propertyInfo: [{
							key: "Name",
							path: "Name",
							label: "Name",
							sortable: true,
							groupable: true,
							filterable: true,
							dataType: "String"
						}, {
							key: "Country",
							label: "Country",
							path: "Country",
							sortable: true,
							groupable: true,
							filterable: true,
							dataType: "String"
						}]
					}
				},
				models: new ODataModel({
					serviceUrl: "serviceUrl/",
					operationMode: "Server",
					autoExpandSelect: true
				}),
				columns: new Column({
					header: "Name",
					propertyKey: "Name",
					dataType: "String",
					template: new Text({text: "Name"})
				})
			});

			await this.oTable.initialized();
			await this.oTable.rebind();
			this.oInnerTable = this.oTable._oTable;
			this.oRowBinding = this.oTable.getRowBinding();
			this.oRebindSpy = this.spy(this.oTable.getControlDelegate(), "rebind");
			this.oChangeParametersSpy = this.spy(this.oRowBinding, "changeParameters");
			this.oFilterSpy = this.spy(this.oRowBinding, "filter");
			this.oSortSpy = this.spy(this.oRowBinding, "sort");
			this.oSuspendSpy = this.spy(this.oRowBinding, "suspend");
			this.oResumeSpy = this.spy(this.oRowBinding, "resume");
			this.oRefreshSpy = this.spy(this.oRowBinding, "refresh");
			this.oSetAggregationSpy = this.spy(this.oRowBinding, "setAggregation");
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Update binding within suspend and resume", async function(assert) {
		this.oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
		this.oTable.setFilterConditions({Name: [{operator: OperatorName.EQ, values: ["Test"], validated: ConditionValidated.NotValidated}]});
		this.oTable.setGroupConditions({groupLevels: [{name: "Name"}]});
		this.oTable.setAggregateConditions({Name: {}});
		await this.oTable.rebind();

		const aTableProperties = this.oTable.getPropertyHelper().getProperties();
		assert.equal(this.oSortSpy.callCount, 1, "Binding#sort call");
		sinon.assert.calledWithExactly(this.oSortSpy, [new Sorter("Name", true)]);
		assert.equal(this.oFilterSpy.callCount, 1, "Binding#filter call");
		sinon.assert.calledWithExactly(this.oFilterSpy, [FilterUtil.getFilterInfo(this.oTable.getControlDelegate().getTypeMap(), this.oTable.getConditions(), aTableProperties).filters], "Application");
		assert.equal(this.oChangeParametersSpy.callCount, 1, "Binding#changeParameters call");
		sinon.assert.calledWithExactly(this.oChangeParametersSpy, {});
		assert.equal(this.oSetAggregationSpy.callCount, 1, "Binding#setAggregation call");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, {
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {Name: {}},
			groupLevels: ["Name"]
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
		this.oTable.setType(TableType.ResponsiveTable);
		await this.oTable.initialized();
		this.oTable.setGroupConditions({groupLevels: [{name: "Country"}]});
		await this.oTable.rebind();
		assert.deepEqual(this.oTable._oTable.getBindingInfo("items").sorter, [], "Column Country is not visible. No sorter applied");
	});

	QUnit.test("Parameters", async function(assert) {
		const oUpdateBindingInfoStub = this.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

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

		assert.equal(this.oChangeParametersSpy.callCount, 0, "Binding#changeParameter call");
		assert.equal(this.oFilterSpy.callCount, 0, "Binding#filter call");
		assert.equal(this.oSortSpy.callCount, 0, "Binding#sort call");
		assert.equal(this.oSetAggregationSpy.callCount, 0, "Binding#setAggregation call");
		assert.equal(this.oRebindSpy.callCount, 1, "Delegate#rebind call");
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

	QUnit.test("$search binding parameter", async function(assert) {
		const oUpdateBindingInfo = this.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$search = "Name";
		});
		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		await this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1, "changeParameters call if $search is set");
		sinon.assert.calledWithExactly(this.oChangeParametersSpy, {$search: "Name"});

		oUpdateBindingInfo.restore();
		this.oChangeParametersSpy.resetHistory();
		await this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1, "changeParameters call if $search is not set");
		sinon.assert.calledWithExactly(this.oChangeParametersSpy, {});

		assert.equal(this.oRebindSpy.callCount, 0, "No rebind was performed");
	});

	QUnit.test("$search binding parameter if analytical features are enabled", async function(assert) {
		const oUpdateBindingInfo = this.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$search = "Name";
		});
		await this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1, "changeParameters call if $search is set");
		sinon.assert.calledWithExactly(this.oChangeParametersSpy, {});

		oUpdateBindingInfo.callThrough();
		this.oChangeParametersSpy.resetHistory();
		await this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1, "changeParameters call if $search is not set");
		sinon.assert.calledWithExactly(this.oChangeParametersSpy, {});

		assert.equal(this.oRebindSpy.callCount, 0, "No rebind was performed");

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$search = "Name";
			oTable._oBindingInfo = oBindingInfo;
		});
		this.oChangeParametersSpy.restore();
		this.oChangeParametersSpy = this.stub(this.oRowBinding, "changeParameters").throws();
		await this.oTable.rebind();
		assert.equal(this.oRebindSpy.callCount, 1, "Rebind call if changeParameters throws an error and $search is set");
		assert.equal(this.oRebindSpy.firstCall.args[1].parameters.$search, undefined, "$search parameter");
	});

	QUnit.test("$$aggregation binding parameter", async function(assert) {
		const oUpdateBindingInfo = this.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$$aggregation = {
				hierarchyQualifier: "Hierarchy",
				expandTo: 3
			};
		});
		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		this.oSetAggregationSpy.resetHistory();
		await this.oTable.rebind();
		assert.equal(this.oSetAggregationSpy.callCount, 1, "setAggregation call if $$aggregation is set");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, {
			hierarchyQualifier: "Hierarchy",
			expandTo: 3
		});

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$$aggregation.hierarchyQualifier = "Hierarchy";
		});
		this.oSetAggregationSpy.resetHistory();
		await this.oTable.rebind();
		assert.equal(this.oSetAggregationSpy.callCount, 1, "setAggregation call if $$aggregation is set without expandTo");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, {
			hierarchyQualifier: "Hierarchy",
			expandTo: 3
		});

		this.oRowBinding.setAggregation({...this.oRowBinding.getAggregation(), ...{expandTo: 4}});
		this.oSetAggregationSpy.resetHistory();
		await this.oTable.rebind();
		assert.equal(this.oSetAggregationSpy.callCount, 1, "setAggregation call if expandTo was changed via binding API");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, {
			hierarchyQualifier: "Hierarchy",
			expandTo: 4
		});

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			delete oBindingInfo.parameters.$$aggregation;
		});
		this.oSetAggregationSpy.resetHistory();
		await this.oTable.rebind();
		assert.equal(this.oSetAggregationSpy.callCount, 1, "setAggregation call if $$aggregation is not set");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, undefined);

		assert.equal(this.oRebindSpy.callCount, 0, "No rebind was performed");

		oUpdateBindingInfo.callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$$aggregation = {
				hierarchyQualifier: "Hierarchy",
				expandTo: 3
			};
		});
		this.oChangeParametersSpy.restore();
		this.oChangeParametersSpy = this.stub(this.oRowBinding, "changeParameters").throws();
		await this.oTable.rebind();
		assert.equal(this.oRebindSpy.callCount, 1, "Rebind call if changeParameters throws an error and $$aggregation is set");
		assert.deepEqual(this.oRebindSpy.firstCall.args[1].parameters.$$aggregation, {
			hierarchyQualifier: "Hierarchy",
			expandTo: 3
		}, "$$aggregation parameter");
	});

	QUnit.test("$$aggregation binding parameter if analytical features are enabled", async function(assert) {
		this.stub(this.oTable.getControlDelegate(), "updateBindingInfo").callsFake(function(oTable, oBindingInfo) {
			this.updateBindingInfo.wrappedMethod.apply(this, arguments);
			oBindingInfo.parameters.$$aggregation = {
				hierarchyQualifier: "Hierarchy",
				expandTo: 3
			};
		});

		await this.oTable.rebind();
		assert.equal(this.oSetAggregationSpy.callCount, 1, "setAggregation call");
		sinon.assert.calledWithExactly(this.oSetAggregationSpy, {
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {Name: {}},
			groupLevels: []
		});

		assert.equal(this.oRebindSpy.callCount, 0, "No rebind was performed");

		this.oChangeParametersSpy.restore();
		this.oChangeParametersSpy = this.stub(this.oRowBinding, "changeParameters").throws();
		await this.oTable.rebind();
		assert.equal(this.oRebindSpy.callCount, 1, "Rebind call if changeParameters throws an error");
		assert.deepEqual(this.oRebindSpy.firstCall.args[1].parameters.$$aggregation, {
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true,
			group: {Name: {}},
			groupLevels: []
		}, "$$aggregation parameter");
	});

	QUnit.module("#validateState", {
		beforeEach: function() {
			this.oTable = new Table({
				p13nMode: ["Group", "Aggregate"],
				delegate: {
					name: "odata.v4.TestDelegate",
					payload: {
						propertyInfo: [{
							key: "Name",
							label: "Name",
							path: "Name",
							dataType: "String",
							groupable: true,
							aggregatable: true
						}, {
							key: "Country",
							label: "Country",
							path: "Country",
							dataType: "String",
							groupable: true,
							aggregatable: true
						}, {
							key: "name_country",
							label: "Complex Title and Description",
							propertyInfos: ["Name", "Country"]
						}]
					}
				}
			});
			return this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
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
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS", ["Name"])
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

	QUnit.test("#fetchExpandAndCollapseConfiguration", async function(assert) {
		const fnTest = async (sTableType, bHasMethods) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			await pInit;

			const oConfig = await this.oTable.getControlDelegate().fetchExpandAndCollapseConfiguration(this.oTable);
			assert.equal(oConfig.expandAll !== undefined, bHasMethods, `${sTableType}#expandAll - exists -> ${bHasMethods}`);
			assert.equal(oConfig.collapseAll !== undefined, bHasMethods, `${sTableType}#collapseAll - exists -> ${bHasMethods}`);
			assert.equal(oConfig.expandAll !== undefined, bHasMethods, `${sTableType}#expandAll - exists -> ${bHasMethods}`);
		};

		await fnTest(TableType.Table, false);
		await fnTest(TableType.ResponsiveTable, false);
		await fnTest(TableType.TreeTable, true);
	});

	QUnit.test("ExpandAndCollapseConfiguration#expandAll", function(assert) {
		const fnTest = async (sTableType, bSupportsExpandAll) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			const oTable = await pInit;
			const oConfig = await this.oTable.getControlDelegate().fetchExpandAndCollapseConfiguration(this.oTable);
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

				oConfig.expandAll(oTable);
				assert.ok(oBinding.setAggregation.calledOnce, sTableType + ": Binding#setAggregation called once if expandTo changes");
				assert.ok(oBinding.refresh.notCalled, sTableType + ": Binding#refresh not called if expandTo changes");

				oBinding.setAggregation.resetHistory();
				oBinding.refresh.resetHistory();
				oConfig.expandAll(oTable);
				assert.ok(oBinding.setAggregation.notCalled, sTableType + ": Binding#setAggregation not called if expandTo doesn't change");
				assert.ok(oBinding.refresh.calledOnceWithExactly(), sTableType + ": Binding#refresh called once if expandTo doesn't change");
			} else {
				assert.deepEqual(oConfig, {}, "Config object is empty");
			}

			oTable.getRowBinding.restore();
		};

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.test("ExpandAndCollapseConfiguration#expandAllFromNode", function(assert) {
		const fnTest = async (sTableType, bSupportsExpandAll) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			const oTable = await pInit;
			const oConfig = await this.oTable.getControlDelegate().fetchExpandAndCollapseConfiguration(this.oTable);

			const oMockBindingContext = {
				expand: function(iToLevel) {
					assert.ok(true, "BindingContext#expand called");
					assert.equal(iToLevel, Number.MAX_SAFE_INTEGER, "BindingContext#expand called with Number.MAX_SAFE_INTEGER");
				}
			};

			if (bSupportsExpandAll) {
				oConfig.expandAllFromNode(oTable, oMockBindingContext);
			} else {
				assert.deepEqual(oConfig, {}, "Config object is empty");
			}
		};

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.test("ExpandAndCollapseconfiguration#collapseAll", function(assert) {
		const fnTest = async (sTableType, bSupportsCollapseAll) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			const oTable = await pInit;
			const oConfig = await this.oTable.getControlDelegate().fetchExpandAndCollapseConfiguration(this.oTable);
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

				oConfig.collapseAll(oTable);
				assert.ok(oBinding.setAggregation.calledOnce, sTableType + ": Binding#setAggregation called once if expandTo changes");
				assert.ok(oBinding.refresh.notCalled, sTableType + ": Binding#refresh not called if expandTo changes");

				oBinding.setAggregation.resetHistory();
				oBinding.refresh.resetHistory();
				oConfig.collapseAll(oTable);
				assert.ok(oBinding.setAggregation.notCalled, sTableType + ": Binding#setAggregation not called if expandTo doesn't change");
				assert.ok(oBinding.refresh.calledOnceWithExactly(), sTableType + ": Binding#refresh called once if expandTo doesn't change");
			} else {
				assert.deepEqual(oConfig, {}, "Config object is empty");
			}

			oTable.getRowBinding.restore();
		};

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.test("ExpandAndCollapseConfiguration#collapseAllFromNode", function(assert) {
		const fnTest = async (sTableType, bSupportsExpandAll) => {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			const oTable = await pInit;
			const oConfig = await this.oTable.getControlDelegate().fetchExpandAndCollapseConfiguration(this.oTable);

			const oMockBindingContext = {
				collapse: function(bCollapseAll) {
					assert.ok(true, "BindingContext#expand called");
					assert.ok(bCollapseAll, "BindingContext#expand called with true");
				}
			};

			if (bSupportsExpandAll) {
				oConfig.collapseAllFromNode(oTable, oMockBindingContext);
			} else {
				assert.deepEqual(oConfig, {}, "Config object is empty");
			}
		};

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.module("Selection", {
		afterEach: function() {
			this.oTable?.destroy();
		},
		initTable: async function(mSettings, oDelegatePayload, fnBeforeInit) {
			this.oTable = new Table(Object.assign({
				delegate: {
					name: "odata.v4.TestDelegate",
					payload: {
						collectionPath: "/Products",
						propertyInfo: [{
							key: "ProductName",
							path: "Name",
							label: "Product Name",
							dataType: "String"
						}],
						...oDelegatePayload
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
		}, undefined, function(oTable) {
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
		}, undefined, function(oTable) {
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
			p13nMode: ["Filter"]
		}, {
			bindingParameters: {
				$$clearSelectionOnFilter: true
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
