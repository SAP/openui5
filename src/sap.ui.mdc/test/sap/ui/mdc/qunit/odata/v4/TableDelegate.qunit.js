/* global QUnit, sinon */
sap.ui.define([
	"../../table/QUnitUtils",
	"../../util/createAppEnvironment",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/odata/v4/TableDelegate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/m/plugins/PluginBase",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/core/Core",
	"sap/ui/core/library",
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
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/core/Lib"
], function(
	TableQUnitUtils,
	createAppEnvironment,
	BaseTableDelegate,
	TableDelegate,
	Table,
	GridTableType,
	TreeTableType,
	ResponsiveTableType,
	Column,
	Text,
	PluginBase,
	ControlPersonalizationWriteAPI,
	Core,
	coreLibrary,
	ODataModel,
	Sorter,
	Filter,
	ManagedObjectObserver,
	TestUtils,
	TableMultiSelectMode,
	TableSelectionMode,
	TableType,
	ConditionValidated,
	OperatorName,
	FilterUtil,
	Lib
) {
	"use strict";

	const iDataCount = 400;

	sap.ui.define("odata.v4.TestDelegate", [
		"sap/ui/mdc/odata/v4/TableDelegate"
	], function(TableDelegate) {
		const TestDelegate = Object.assign({}, TableDelegate);

		TestDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
			TableDelegate.updateBindingInfo.apply(this, arguments);
			oBindingInfo.path = oTable.getPayload() ? oTable.getPayload().collectionPath : "/ProductList";
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
	}]);

	Core.loadLibrary("sap.ui.fl");

	const sTableView1 =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">' +
		'<Table p13nMode="Group,Aggregate" id="myTable" delegate=\'\{ name : "odata.v4.TestDelegate" \}\'>' +
		'<columns><mdcTable:Column id="myTable--column0" header="column 0" propertyKey="Name">' +
		'<m:Text text="{Name}" id="myTable--text0" /></mdcTable:Column>' +
		'<mdcTable:Column id="myTable--column1" header="column 1" propertyKey="Country">' +
		'<m:Text text="{Country}" id="myTable--text1" /></mdcTable:Column>' +
		'<mdcTable:Column header="column 2" propertyKey="name_country"> ' +
		'<m:Text text="{Name}" id="myTable--text2" /></mdcTable:Column></columns> ' +
		'</Table></mvc:View>';

	const sTableView2 =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">' +
		'<Table p13nMode="Group,Aggregate" id="myTable" delegate=\'\{ name : "odata.v4.TestDelegate" \}\'>' +
		'<columns>' +
		'<mdcTable:Column header="column 2" propertyKey="name_country"> ' +
		'<m:Text text="{Name}" id="myTable--text2" /></mdcTable:Column></columns> ' +
		'</Table></mvc:View>';

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

	QUnit.module("Initialization of selection", {
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
		initTable: function(mSettings, fnBeforeInit) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = new Table(Object.assign({
				delegate: {
					name: "odata.v4.TestDelegate",
					payload: {
						collectionPath: "/Products"
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
					serviceUrl: "/MyService/"
				})
			}, mSettings));

			if (fnBeforeInit) {
				fnBeforeInit(this.oTable);
			}

			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			return this.oTable.initialized();
		}
	});

	QUnit.test("GridTableType", function(assert) {
		let mSelectionChangeParameters;
		const oSelectionChangeStub = sinon.stub();

		oSelectionChangeStub.callsFake(function(oEvent) {
			mSelectionChangeParameters = oEvent.getParameters();
			delete mSelectionChangeParameters.id;
		});

		return this.initTable({
			selectionMode: TableSelectionMode.Single,
			selectionChange: oSelectionChangeStub,
			type: new GridTableType({
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
			oPlugin.fireSelectionChange({selectAll: true});
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the plugin");
			assert.deepEqual(mSelectionChangeParameters, {selectAll: true}, "Selection change event parameters");

			oTable.setSelectionMode(TableSelectionMode.None);
			assert.notOk(oPlugin.getEnabled(), "Set selection mode to 'None': Selection plugin disabled");

			oTable.setSelectionMode(TableSelectionMode.SingleMaster);
			assert.equal(oPlugin.getSelectionMode(), "Single", "Set selection mode to 'SingleMaster': Selection mode of plugin set to 'Single'");

			oTable.setSelectionMode(TableSelectionMode.Multi);
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

	QUnit.test("TreeTableType", function(assert) {
		let mSelectionChangeParameters;
		const oSelectionChangeStub = sinon.stub();

		oSelectionChangeStub.callsFake(function(oEvent) {
			mSelectionChangeParameters = oEvent.getParameters();
			delete mSelectionChangeParameters.id;
		});

		return this.initTable({
			selectionMode: TableSelectionMode.Single,
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
			oPlugin.fireSelectionChange({selectAll: true});
			assert.equal(oSelectionChangeStub.callCount, 1, "Selection change event of table called once if called once by the plugin");
			assert.deepEqual(mSelectionChangeParameters, {selectAll: true}, "Selection change event parameters");

			oTable.setSelectionMode(TableSelectionMode.None);
			assert.notOk(oPlugin.getEnabled(), "Set selection mode to 'None': Selection plugin disabled");

			oTable.setSelectionMode(TableSelectionMode.SingleMaster);
			assert.equal(oPlugin.getSelectionMode(), "Single", "Set selection mode to 'SingleMaster': Selection mode of plugin set to 'Single'");

			oTable.setSelectionMode(TableSelectionMode.Multi);
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

	QUnit.test("ResponsiveTableType", function(assert) {
		let mSelectionChangeParameters;
		const oSelectionChangeStub = sinon.stub();

		oSelectionChangeStub.callsFake(function(oEvent) {
			mSelectionChangeParameters = oEvent.getParameters();
			delete mSelectionChangeParameters.id;
		});

		return this.initTable({
			selectionMode: TableSelectionMode.Single,
			multiSelectMode: TableMultiSelectMode.ClearAll,
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
			assert.deepEqual(mSelectionChangeParameters, {selectAll: true}, "Selection change event parameters");

			oTable.setSelectionMode(TableSelectionMode.None);
			assert.equal(oInnerTable.getMode(), "None", "Set selection mode to 'None': Inner table selection mode set to 'None'");

			oTable.setSelectionMode(TableSelectionMode.SingleMaster);
			assert.equal(oInnerTable.getMode(), "SingleSelectMaster",
				"Set selection mode to 'SingleMaster': Inner table selection mode set to 'SingleSelectMaster'");

			oTable.setSelectionMode(TableSelectionMode.Multi);
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
		}).then(function(oTable) {
			oTable._oTable.getItems()[1].setSelected(true);
			assert.deepEqual(oTable.getSelectedContexts(), [oTable._oTable.getItems()[1].getBindingContext()],
				"#getSelectedContexts after initialization");
		});
	});

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
			assert.notOk(oTable._oTable.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.ui.table.plugins.V4Aggregation");
			}), "V4Aggregation plugin is not added to the inner table");
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
			const oPlugin = oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
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
			assert.notOk(oTable._oTable.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.ui.table.plugins.V4Aggregation");
			}), "V4Aggregation plugin is not added to the inner table");
			this.assertFetchPropertyCalls(assert, 1);
		}.bind(this));
	});

	QUnit.test("ResponsiveTable; Grouping and aggregation enabled", function(assert) {
		return this.initTable({
			type: TableType.ResponsiveTable,
			p13nMode: ["Group", "Aggregate"]
		}).then(function(oTable) {
			assert.notOk(oTable._oTable.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.ui.table.plugins.V4Aggregation");
			}), "V4Aggregation plugin is not added to the inner table");
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
		const oOldPlugin = that.oTable._oTable.getDependents()[0];

		this.resetFetchPropertyCalls();
		this.oTable.setType(TableType.ResponsiveTable);

		return this.oTable._fullyInitialized().then(function() {
			assert.notOk(that.oTable._oTable.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.ui.table.plugins.V4Aggregation");
			}), "V4Aggregation plugin is not added to the inner table");
			that.assertFetchPropertyCalls(assert, 0);

			that.resetFetchPropertyCalls();
			that.oTable.setType(TableType.Table);
			return that.oTable._fullyInitialized();
		}).then(function() {
			const oPlugin = that.oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
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
		const oPlugin = this.oTable._oTable.getDependents()[0];

		this.resetFetchPropertyCalls();
		this.oTable.setP13nMode();

		assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
		assert.notOk(oPlugin.isActive(), "V4Aggregation plugin is not active");
		assert.equal(oPlugin, this.oTable._oTable.getDependents()[0], "V4Aggregation plugin is the same instance");
		this.assertFetchPropertyCalls(assert, 0);

		this.oTable.setP13nMode(["Group"]);
		assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
		assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");
		assert.equal(oPlugin, this.oTable._oTable.getDependents()[0], "V4Aggregation plugin is the same instance");
		this.assertFetchPropertyCalls(assert, 0);
	});

	QUnit.test("GridTable; Initial activation of analytical p13n modes", function(assert) {
		const that = this;

		return this.initTable({
			p13nMode: []
		}).then(function() {
			that.resetFetchPropertyCalls();
			that.oTable.setP13nMode(["Group"]);

			assert.notOk(that.oTable._oTable.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.ui.table.plugins.V4Aggregation");
			}), "V4Aggregation plugin is not yet added to the inner table");

			return new Promise(function(resolve) {
				new ManagedObjectObserver(function() {
					resolve();
				}).observe(that.oTable._oTable, {
					aggregations: ["dependents"]
				});
			});
		}).then(function() {
			const oPlugin = that.oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
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
		createTestObjects: function() {
			return createAppEnvironment(sTableView1, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				Core.applyChanges();

				this.oTable = this.oView.byId('myTable');

				ControlPersonalizationWriteAPI.restore({
					selector: this.oTable
				});
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Allowed analytics on column header and tableDelegate API's", function(assert) {
		const oTable = this.oTable;
		let oPlugin, oQuickAction, fSetAggregationSpy;

		this.oTable.addColumn(new Column({
			header: "Value",
			propertyKey: "Value",
			template: new Text({text: "Value"})
		}));

		return oTable._fullyInitialized().then(function() {
			oPlugin = oTable._oTable.getDependents()[0];
			fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");

			oTable.setAggregateConditions({
				Country: {}
			});
			oTable.rebind();
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

			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup");
			assert.ok(oQuickAction, "The first column has a quick group");
			assert.equal(oQuickAction.getItems().length, 1, "The quick group has one item");
			oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal");
			assert.ok(oQuickAction, "The first column has a quick total");

			return TableQUnitUtils.openColumnMenu(oTable, 2);
		}).then(function() {
			oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup");
			assert.strictEqual(oQuickAction.getItems().length, 2, "The last column has complex property with list of two items");

			fSetAggregationSpy.reset();
			oTable.setGroupConditions({
				groupLevels: [
					{
						"name": "Name"
					}
				]
			});
			oTable.rebind();
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
			oTable.rebind();
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
	});

	QUnit.test("Grouping enabled on column menu open", function(assert) {
		const oTable = this.oTable;
		const done = assert.async();

		oTable._fullyInitialized().then(function() {
			return TableQUnitUtils.openColumnMenu(oTable, 0);
		}).then(function() {
			 oTable._fullyInitialized().then(function() {
				const oPlugin = oTable._oTable.getDependents()[0];
				const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				const oDelegate = oTable.getControlDelegate();
				const fnRebind = oDelegate.rebind;

				oDelegate.rebind = function () {
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
					oTable.getEngine().reset(oTable, ["Group"])
					.then(function(){
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
				const oPlugin = oTable._oTable.getDependents()[0];
				const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				const fnRebind = oDelegate.rebind;

				oDelegate.rebind = function () {
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
					oTable.getEngine().reset(oTable, ["Aggregate"])
					.then(function(){
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
			const oPlugin = oTable._oTable.getDependents()[0];
			const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
			const fnRebind = oDelegate.rebind;

			oDelegate.rebind = function () {
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
					const oPlugin = oTable._oTable.getDependents()[0];
					const fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
					const fnRebind = oDelegate.rebind;

					oDelegate.rebind = function () {
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
						oTable.getEngine().reset(oTable, ["Group", "Aggregate"])
						.then(function(){
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
			oPlugin = oTable._oTable.getDependents()[0];
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
		createTestObjects: function() {
			return createAppEnvironment(sTableView2, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				Core.applyChanges();

				this.oTable = this.oView.byId('myTable');

				ControlPersonalizationWriteAPI.restore({
					selector: this.oTable
				});
			}.bind(this));
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
		createTestObjects: function() {
			return createAppEnvironment(sTableView2, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				Core.applyChanges();

				this.oTable = this.oView.byId('myTable');

				ControlPersonalizationWriteAPI.restore({
					selector: this.oTable
				});
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Aggregate", function(assert) {
		const oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			const oPlugin = oTable._oTable.getDependents()[0];
			const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

			oTable.setAggregateConditions({
				SalesAmount: {}
			});
			oTable.rebind();

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
	});

	QUnit.test("Group", function(assert) {
		const oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			const oPlugin = oTable._oTable.getDependents()[0];
			const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

			oTable.setGroupConditions({
				groupLevels: [{
					name: "CountryKey"
				}]
			});
			oTable.rebind();

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
	});

	QUnit.test("Group and aggregate", function(assert) {
		const oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			const oPlugin = oTable._oTable.getDependents()[0];
			const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

			oTable.setGroupConditions({
				groupLevels: [{
					name: "CountryKey"
				}]
			});
			oTable.setAggregateConditions({
				SalesAmount: {}
			});
			oTable.rebind();

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
	});

	QUnit.test("Transformation Search", function(assert) {
		const done = assert.async();
		const oTable = this.oTable;
		let fnOriginalUpdateBindingInfo;

		return oTable._fullyInitialized().then(function() {
			fnOriginalUpdateBindingInfo = oTable.getControlDelegate().updateBindingInfo;
			oTable.getControlDelegate().updateBindingInfo = function(oTable, oBindingInfo) {
				fnOriginalUpdateBindingInfo.apply(this, arguments);
				oBindingInfo.parameters["$search"] = "Name";
			};
			return TableQUnitUtils.waitForBindingInfo(oTable);
		}).then(function() {
			const oPlugin = oTable._oTable.getDependents()[0];
			const oBindRowsSpy = sinon.spy(oTable._oTable, "bindRows");
			const oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");
			oTable.setGroupConditions({ groupLevels: [{ name: "CountryKey" }] }).rebind();
			const oBinding = oTable._oTable.getBindingInfo("rows");

			assert.notOk(oBinding.parameters["$search"], "$search has been removed from oBinding");
			assert.ok(oBindRowsSpy.calledWithExactly(oBinding), "BindRows of inner table called with oBindingInfo without $search parameter");
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
			oTable.getControlDelegate().updateBindingInfo = fnOriginalUpdateBindingInfo;
			done();
		});
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
			},{
				name: "Country",
				label: "Country",
				path: "Country",
				sortable: true,
				groupable: true,
				filterable: true,
				dataType: "String"
			}]);
		},
		beforeEach: function() {
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

			return this.oTable._fullyInitialized().then(function() {
                this.oTable._rebind();
				this.oInnerTable = this.oTable._oTable;
				this.oRowBinding = this.oTable.getRowBinding();
				this.oSetAggregationSpy = sinon.spy(this.oInnerTable.getDependents()[0], "setAggregationInfo");
				this.oRebindSpy = sinon.spy(this.oTable.getControlDelegate(), "rebind");
				this.oChangeParametersSpy = sinon.spy(this.oRowBinding, "changeParameters");
				this.oFilterSpy = sinon.spy(this.oRowBinding, "filter");
				this.oSortSpy = sinon.spy(this.oRowBinding, "sort");
				this.oSuspendSpy = sinon.spy(this.oRowBinding, "suspend");
				this.oResumeSpy = sinon.spy(this.oRowBinding, "resume");
				this.oRefreshSpy = sinon.spy(this.oRowBinding, "refresh");
			}.bind(this));
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

	QUnit.test("Update binding within suspend and resume", function(assert) {
		this.oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
		this.oTable.setFilterConditions({Name: [{operator: OperatorName.EQ, values: ["Test"], validated: ConditionValidated.NotValidated}]});
		this.oTable.setGroupConditions({groupLevels: [{name: "Name"}]});
		this.oTable.setAggregateConditions({Name: {}});
		this.oTable._rebind();
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

	QUnit.test("Update suspended binding", function(assert) {
		this.oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
		this.oTable.getRowBinding().suspend();
		this.oSuspendSpy.resetHistory();
		this.oTable._rebind();

		assert.equal(this.oSortSpy.callCount, 1, "Binding#sort called once");
		sinon.assert.calledWithExactly(this.oSortSpy, [new Sorter("Name", true)]);
		assert.ok(this.oSuspendSpy.notCalled, "Binding#suspend not called");
		assert.ok(this.oResumeSpy.notCalled, "Binding#resume not called");
		assert.ok(this.oRebindSpy.notCalled, "Aggregation binding was not replaced");
	});

	QUnit.test("Sort", function(assert) {
		this.oTable.setSortConditions({ sorters: [{ name: "Name", descending: false }] })._rebind();
		assert.ok(this.oSortSpy.firstCall.calledWithExactly(this.oTable.getControlDelegate().getSorters(this.oTable)));

		this.oTable.setSortConditions({ sorters: [{ name: "Name", descending: true }] })._rebind();
		assert.ok(this.oSortSpy.secondCall.calledWithExactly(this.oTable.getControlDelegate().getSorters(this.oTable)));

		this.oTable.setSortConditions()._rebind();
		assert.equal(this.oSortSpy.callCount, 3);
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Filter", function(assert) {
		const aFilters = [new Filter("Name", "EQ", "a")];
		const oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");
        oUpdateBindingInfoStub.callsFake(function (oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/ProductList";
			oBindingInfo.filters = aFilters;
        });

		this.oTable._rebind();
		assert.ok(this.oFilterSpy.firstCall.calledWithExactly(aFilters, "Application"));

		oUpdateBindingInfoStub.restore();
		this.oTable._rebind();
		assert.ok(this.oFilterSpy.secondCall.calledWithExactly([], "Application"));
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Group", function(assert) {
		this.oTable.setGroupConditions({ groupLevels: [{ name: "Name" }] })._rebind();
		assert.ok(this.oSetAggregationSpy.firstCall.calledWithMatch({ groupLevels: [ "Name" ] }));

		this.oTable.setGroupConditions()._rebind();
		assert.ok(this.oSetAggregationSpy.secondCall.calledWithMatch( { groupLevels: [] }));
		assert.equal(this.oRebindSpy.callCount, 0);

		// Test grouping on non visible column in ResponsiveTable
		this.oTable.setType(TableType.ResponsiveTable);
		return this.oTable._fullyInitialized().then(function() {
			this.oTable.setGroupConditions({ groupLevels: [{ name: "Country" }] })._rebind();
			assert.deepEqual(this.oTable._oTable.getBindingInfo("items").sorter, [], "Column Country is not visible. No sorter applied");
		}.bind(this));
	});

	QUnit.test("Aggregates", function(assert) {
		this.oTable.setAggregateConditions({ Name: {} })._rebind();
		assert.ok(this.oSetAggregationSpy.firstCall.calledWithMatch({
		    grandTotal: [ "Name" ],
		    subtotals: [ "Name" ]
		}));

		this.oTable.setAggregateConditions()._rebind();
		assert.ok(this.oSetAggregationSpy.secondCall.calledWithMatch( { grandTotal: [], subtotals: [] }));
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Parameters", function(assert) {
		const oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

        oUpdateBindingInfoStub.onCall(0).callsFake(function (oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/ProductList";
            oBindingInfo.parameters.$search = "x";
        });
		oUpdateBindingInfoStub.onCall(1).callsFake(function (oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/ProductList";
            oBindingInfo.parameters.$search = undefined;
        });
		oUpdateBindingInfoStub.onCall(2).callsFake(function (oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = "/ProductList";
            oBindingInfo.parameters.$$canonicalPath = true;
        });

		this.oTable._rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1);
		this.oTable._rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 2);
		assert.equal(this.oRebindSpy.callCount, 0);

		oUpdateBindingInfoStub.restore();
	});

	QUnit.test("Add Column", function(assert) {
		this.oTable.insertColumn(new Column());
		this.oTable._rebind();

		assert.equal(this.oChangeParametersSpy.callCount, 0);
		assert.equal(this.oFilterSpy.callCount, 0);
		assert.equal(this.oSortSpy.callCount, 0);
		assert.equal(this.oSetAggregationSpy.callCount, 1);
		assert.equal(this.oRebindSpy.callCount, 1);
	});

	QUnit.test("Change path", function(assert) {
		const oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

		oUpdateBindingInfoStub.onCall(1).callsFake(function (oMDCTable, oBindingInfo) {
			oUpdateBindingInfoStub.wrappedMethod.apply(this, arguments);
			oBindingInfo.path = oBindingInfo.path + "something_else";
		});

		this.oTable._rebind();
		this.oRebindSpy.resetHistory();
		this.oTable._rebind();

		assert.equal(this.oRebindSpy.callCount, 1, "Changing the path forces a rebind");
		oUpdateBindingInfoStub.restore();
	});

	QUnit.test("Refresh binding", function(assert) {
		const bForceRefresh = true;

		this.oTable._rebind(bForceRefresh);
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
		const sMessage = Lib.getResourceBundleFor("sap.ui.mdc").getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "name_country"}]
		}, "Sort"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "No sorted properties");

		assert.deepEqual(this.oTable.validateState({
			sorters: [{name: "Name"}, {name: "Country"}]
		}, "Sort"), {
			validation: coreLibrary.MessageType.Information,
			message: sMessage
		}, "Sorted properties and no visible columns");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}],
			sorters: [{name: "Name"}, {name: "Country"}]
		}, "Sort"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "All sorted properties visible");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}]
		}, "Sort"), {
			validation: coreLibrary.MessageType.Information,
			message: sMessage
		}, "Sorted property invisible");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "name_country"}],
			sorters: [{name: "Country"}]
		}, "Sort"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "Sorted property is part of a visible complex property");

		this.oTable.setP13nMode();
		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}]
		}, "Sort"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "Sorted property invisible and analytical features not enabled");
	});

	QUnit.test("Group restrictions", function(assert) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}]
		}, "Group"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "No grouped properties");

		assert.deepEqual(this.oTable.validateState({
			groupLevels: [{name: "Country"}]
		}, "Group"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "Grouped properties and no visible columns");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			aggregations: { Name : {}}
		}, "Group"), {
			validation: coreLibrary.MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS", "Name")
		}, "Grouping and aggreagtion can't be used simulatneously");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "name_country"}],
			groupLevels: [{name: "Country"}]
		}, "Group"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "The grouped property is part of a visible complex property");

		this.oTable.setType(TableType.ResponsiveTable);
		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			groupLevels: [{name: "Country"}]
		}, "Group"), {
			validation: coreLibrary.MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")
		}, "Grouped property invisible with ResponsiveTable type");
	});

	QUnit.test("Column restrictions", function(assert) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}]
		}, "Column"), {
			validation: coreLibrary.MessageType.None,
			message: undefined
		}, "Valid state");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}]
		}, "Column"), {
			validation: coreLibrary.MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
		}, "Removing the column that contains a sorted property");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			aggregations: {Country : {}}
		}, "Column"), {
			validation: coreLibrary.MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION")
		}, "Removing the column that contains an aggregated property");

		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			sorters: [{name: "Country"}],
			aggregations: {Country : {}}
		}, "Column"), {
			validation: coreLibrary.MessageType.Information,
			message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION")
					 + "\n" + oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
		}, "Removing the column that contains a sorted and an aggregated property");

		this.oTable.setType(TableType.ResponsiveTable);
		assert.deepEqual(this.oTable.validateState({
			items: [{name: "Name"}],
			groupLevels: [{name: "Country"}]
		}, "Column"), {
			validation: coreLibrary.MessageType.Information,
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
			const aExpectedFilter = [FilterUtil.getFilterInfo(this.oTable.getControlDelegate().getTypeMap(),
													this.oTable.getConditions(),
													this.oTable.getPropertyHelper().getProperties()).filters];

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
			"export": true,
			"expandAll": false,
			"collapseAll": false
		}).then(function() {
			return fnTest(TableType.TreeTable, {
				"export": true,
				"expandAll": true,
				"collapseAll": true
			});
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, {
				"export": true,
				"expandAll": false,
				"collapseAll": false
			});
		});
	});

	QUnit.test("#expandAll", function(assert) {
		const fnTest = function (sTableType, bExpandsAll) {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			return pInit.then(function(oTable) {
				sinon.stub(oTable, "getRowBinding").returns({
					setAggregation: function(oObject) {
						assert.equal(oObject.expandTo, 999, sTableType + ": setAggregation called with expandTo: 999");
						assert.equal(oObject.test, "Test", sTableType + ": test property not changed");
					},
					getAggregation: function(oObject) {
						return {expandTo: 1, test: "Test"};
					}
				});
				const oSetAggregationSpy = sinon.spy(oTable.getRowBinding(), "setAggregation");

				oTable.getControlDelegate().expandAll(oTable);
				if (bExpandsAll) {
					assert.ok(oSetAggregationSpy.calledOnce, sTableType + ": setAggregation was called");
				} else {
					assert.notOk(oSetAggregationSpy.calledOnce, sTableType + ": setAggregation was not called");
				}

				oTable.getRowBinding.restore();
				oSetAggregationSpy.restore();
			});
		}.bind(this);

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.test("#collapseAll", function(assert) {
		const fnTest = function (sTableType, bExpandsAll) {
			const pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable({type: sTableType});
			return pInit.then(function(oTable) {
				sinon.stub(oTable, "getRowBinding").returns({
					setAggregation: function(oObject) {
						assert.equal(oObject.expandTo, 1, "setAggregation called with expandTo: 999");
						assert.equal(oObject.test, "Test", "test property not changed");
					},
					getAggregation: function(oObject) {
						return {expandTo: 12, test: "Test"};
					}
				});
				const oSetAggregationSpy = sinon.spy(oTable.getRowBinding(), "setAggregation");

				oTable.getControlDelegate().collapseAll(oTable);
				if (bExpandsAll) {
					assert.ok(oSetAggregationSpy.calledOnce, sTableType + ": setAggregation was called");
				} else {
					assert.notOk(oSetAggregationSpy.calledOnce, sTableType + ": setAggregation was not called");
				}

				oTable.getRowBinding.restore();
				oSetAggregationSpy.restore();
			});
		}.bind(this);

		return fnTest(TableType.TreeTable, true).then(function() {
			return fnTest(TableType.Table, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, false);
		});
	});

	QUnit.test("setSelectedContexts", function (assert) {
		const testSelection = (oTable) => {
			const oRowBinding = oTable.getRowBinding();
			const oNextSelectedContext = oRowBinding.getAllCurrentContexts()[1];
			const aNextSelectedContexts = [oNextSelectedContext];

			assert.ok(!oTable.getSelectedContexts().length, "No contexts are selected");
			assert.ok(oNextSelectedContext, "A context is available for selection");
			oTable._setSelectedContexts(aNextSelectedContexts);

			return new Promise((resolve) => { setTimeout(resolve, 0); }).then(() => {
				assert.ok(oTable.getSelectedContexts().indexOf(oNextSelectedContext) >= 0, "getSelectedContexts() changed successfully.");
			});
		};

		return this.initTable({
			delegate: {
				name: "odata.v4.TestDelegate",
				payload: {
					collectionPath: "/Products"
				}
			},
			models: new ODataModel({
				serviceUrl: "/MyService/"
			}),
			autoBindOnInit: true
		}).then(() => {
			return new Promise((resolve) => {
				this.oTable.attachEventOnce("_bindingChange", resolve);
			});
		}).then(() => {
			assert.ok(this.oTable._oTable.getPlugins().find((oPlugin) => oPlugin.isA("sap.ui.table.plugins.ODataV4Selection")),
				"sap.ui.table.plugins.ODataV4Selection configuration found.");
			return testSelection(this.oTable);
		}).then(() => {
			this.oTable._enableV4LegacySelection();
			return new Promise((resolve) => { setTimeout(resolve, 50); }).then(() => {
				assert.ok(this.oTable._oTable.getPlugins().find((oPlugin) => oPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin")),
				"sap.ui.table.plugins.MultiSelectionPlugin configuration found.");
				return testSelection(this.oTable);
			});
		}).then(() => {
			sinon.stub(this.oTable._oTable, "getPlugins").returns([]);
			assert.throws(
				() => this.oTable._setSelectedContexts([]),
				new Error("Unsupported operation: TableDelegate does not support #setSelectedContexts for the given Table configuration"),
				"_setSelectedContexts throws expected error on unsupported table configuration."
			);
			this.oTable._oTable.getPlugins.restore();
		}).then(() => {
			sinon.stub(this.oTable, "_isOfType").returns(false);
			assert.throws(
				() => this.oTable._setSelectedContexts([]),
				new Error("Unsupported operation: TableDelegate does not support #setSelectedContexts for the given TableType"),
				"_setSelectedContexts throws expected error on unsupported table types."
			);
			this.oTable._isOfType.restore();
		});
	});
});
