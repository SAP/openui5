/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/odata/v4/TableDelegate",
	"sap/ui/mdc/library",
	"../../QUnitUtils",
	"../../util/createAppEnvironment",
	"sap/m/Text",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/base/ManagedObjectObserver"
], function(
	Table,
	Column,
	TableDelegate,
	Library,
	MDCQUnitUtils,
	createAppEnvironment,
	Text,
	ControlPersonalizationWriteAPI,
	Core,
	coreLibrary,
	ODataModel,
	Filter,
	ManagedObjectObserver
) {
	"use strict";

	var TableType = Library.TableType;

	sap.ui.define("odata.v4.TestDelegate", [
		"sap/ui/mdc/odata/v4/TableDelegate"
	], function(TableDelegate) {
		var TestDelegate = Object.assign({}, TableDelegate);

		TestDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
			TableDelegate.updateBindingInfo.apply(this, arguments);
			oBindingInfo.path = "/ProductList";
		};

		return TestDelegate;
	});

	Core.loadLibrary("sap.ui.fl");

	var sTableView1 =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">' +
		'<Table p13nMode="Group,Aggregate" id="myTable" delegate=\'\{ name : "odata.v4.TestDelegate" \}\'>' +
		'<columns><mdcTable:Column id="myTable--column0" header="column 0" dataProperty="Name">' +
		'<m:Text text="{Name}" id="myTable--text0" /></mdcTable:Column>' +
		'<mdcTable:Column id="myTable--column1" header="column 1" dataProperty="Country">' +
		'<m:Text text="{Country}" id="myTable--text1" /></mdcTable:Column>' +
		'<mdcTable:Column header="column 2" dataProperty="name_country"> ' +
		'<m:Text text="{Name}" id="myTable--text2" /></mdcTable:Column></columns> ' +
		'</Table></mvc:View>';

	var sTableView2 =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">' +
		'<Table p13nMode="Group,Aggregate" id="myTable" delegate=\'\{ name : "odata.v4.TestDelegate" \}\'>' +
		'<columns>' +
		'<mdcTable:Column header="column 2" dataProperty="name_country"> ' +
		'<m:Text text="{Name}" id="myTable--text2" /></mdcTable:Column></columns> ' +
		'</Table></mvc:View>';

	function createColumnStateIdMap(oTable, aStates) {
		var mState = {};

		oTable.getColumns().forEach(function(oColumn, iIndex) {
			mState[oColumn.getId() + "-innerColumn"] = aStates[iIndex];
		});

		return mState;
	}

	function poll(fnCheck, iTimeout) {
		return new Promise(function(resolve, reject) {
			if (fnCheck()) {
				resolve();
				return;
			}

			var iRejectionTimeout = setTimeout(function() {
				clearInterval(iCheckInterval);
				reject("Polling timeout");
			}, iTimeout == null ? 100 : iTimeout);

			var iCheckInterval = setInterval(function() {
				if (fnCheck()) {
					clearTimeout(iRejectionTimeout);
					clearInterval(iCheckInterval);
					resolve();
				}
			}, 10);
		});
	}

	function waitForBindingInfo(oTable, iTimeout) {
		return poll(function() {
			var oInnerTable = oTable._oTable;
			return oInnerTable && oInnerTable.getBindingInfo(oTable._isOfType(TableType.Table, true) ? "rows" : "items");
		}, iTimeout);
	}

	function getQuickAction(oMenu, sType) {
		var oQuickActionContainer = oMenu.getAggregation("_quickActions")[0];
		if (!oQuickActionContainer) {
			return null;
		}
		var aQuickActions = oQuickActionContainer.getQuickActions().filter(function(oQuickAction) {
			return oQuickAction.isA("sap.m.table.columnmenu." + sType);
		});

		return sType === "QuickAction" ? aQuickActions : aQuickActions[0];
	}

	function openColumnMenu(oTable, iColumnIndex) {
		oTable._oTable.fireEvent("columnSelect", {
			column: oTable._oTable.getColumns()[iColumnIndex]
		});
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
			p13nMode: ["Group", "Aggregate"]
		}).then(function(oTable) {
			var oPlugin = oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
			assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");

			var oGroupHeaderFormatter = sinon.stub(oTable.getControlDelegate(), "formatGroupHeader");
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
		var that = this;
		var oOldPlugin = that.oTable._oTable.getDependents()[0];

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
			var oPlugin = that.oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
			assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");
			assert.notEqual(oPlugin, oOldPlugin, "V4Aggregation plugin is not the same instance");
			assert.ok(oOldPlugin.bIsDestroyed, "Old V4Aggregation plugin is destroyed");

			var oGroupHeaderFormatter = sinon.stub(that.oTable.getControlDelegate(), "formatGroupHeader");
			oPlugin.getGroupHeaderFormatter()("MyContext", "MyProperty");
			assert.ok(oGroupHeaderFormatter.calledOnceWithExactly(that.oTable, "MyContext", "MyProperty"), "Call Delegate.formatGroupHeader");
			oGroupHeaderFormatter.restore();

			that.assertFetchPropertyCalls(assert, 0);
		});
	});

	QUnit.test("GridTable; p13nMode", function(assert) {
		var oPlugin = this.oTable._oTable.getDependents()[0];

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
		var that = this;

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
			var oPlugin = that.oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");
			assert.ok(oPlugin.isActive(), "V4Aggregation plugin is active");

			var oGroupHeaderFormatter = sinon.stub(that.oTable.getControlDelegate(), "formatGroupHeader");
			oPlugin.getGroupHeaderFormatter()("MyContext", "MyProperty");
			assert.ok(oGroupHeaderFormatter.calledOnceWithExactly(that.oTable, "MyContext", "MyProperty"), "Call Delegate.formatGroupHeader");
			oGroupHeaderFormatter.restore();

			that.assertFetchPropertyCalls(assert, 0);
		});
	});

	QUnit.module("Basic functionality with JsControlTreeModifier", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				groupable: true,
				aggregatable: true,
				extension: {
					customAggregate: {}
				}
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
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
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
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
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");
		var oTable = this.oTable;
		var oPlugin, oQuickAction, fSetAggregationSpy;

		this.oTable.addColumn(new Column({
			header: "Value",
			dataProperty: "Value",
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

			openColumnMenu(oTable, 0);

			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");
			return oTable._fullyInitialized();
		}).then(function() {
			oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup");
			assert.ok(oQuickAction, "The first column has a quick group");
			assert.equal(oQuickAction.getItems().length, 1, "The quick group has one item");
			oQuickAction = getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal");
			assert.ok(oQuickAction, "The first column has a quick total");

			openColumnMenu(oTable, 2);

			assert.strictEqual(fColumnPressSpy.callCount, 2, "Third Column pressed");
			return oTable._fullyInitialized();
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

	QUnit.test("Grouping enabled on column press", function(assert) {
		var oTable = this.oTable;
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

		 oTable._fullyInitialized().then(function() {
			openColumnMenu(oTable, 0);

			assert.ok(fColumnPressSpy.calledOnce, "First column pressed");
			fColumnPressSpy.restore();

			 oTable._fullyInitialized().then(function() {
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var oDelegate = oTable.getControlDelegate();
				var fnRebind = oDelegate.rebind;

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
					done();
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Aggregation enabled on column press", function(assert) {
		var oTable = this.oTable;
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");
		var done = assert.async();

		 oTable._fullyInitialized().then(function() {
			openColumnMenu(oTable, 1);

			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");
			fColumnPressSpy.restore();

			oTable._fullyInitialized().then(function() {
				var oDelegate = oTable.getControlDelegate();
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var fnRebind = oDelegate.rebind;

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
					done();
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Grouping and Aggregation on two columns", function(assert) {
		var oTable = this.oTable;
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");
		var done = assert.async();

		oTable._fullyInitialized().then(function() {
			openColumnMenu(oTable, 0);

			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			oTable._fullyInitialized().then(function() {
				var oDelegate = oTable.getControlDelegate();
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var fnRebind = oDelegate.rebind;

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

					fColumnPressSpy.restore();
					fSetAggregationSpy.restore();
					oDelegate.rebind = fnRebind;

					openColumnMenu(oTable, 1);

					assert.ok(fColumnPressSpy.calledOnce, "Second Column pressed");

					return oTable._fullyInitialized().then(function() {
						var oDelegate = oTable.getControlDelegate();
						var oPlugin = oTable._oTable.getDependents()[0];
						var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
						var fnRebind = oDelegate.rebind;

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

							fColumnPressSpy.restore();
							fSetAggregationSpy.restore();
							oDelegate.rebind = fnRebind;
							done();
						};
						getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal").getContent()[0].firePress();
					});
				};
				getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup").getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Grouping and aggregation on the same column", function(assert) {
		var oTable = this.oTable;
		var oDelegate, oPlugin, fSetAggregationSpy, fnRebind;

		return oTable._fullyInitialized().then(function() {
			openColumnMenu(oTable, 0);
			return oTable._fullyInitialized();
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
			openColumnMenu(oTable, 0);
			return oTable._fullyInitialized();
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

	QUnit.test("Sorting restriction", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var sMessage = Core.getLibraryResourceBundle("sap.ui.mdc").getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION");
			var oState;
			var oValidationState;

			oState = {items: [{name: "Name"}, {name: "name_country"}]};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.strictEqual(oValidationState.validation, coreLibrary.MessageType.None, "No sorted properties: Validation result");
			assert.strictEqual(oValidationState.message, undefined, "No sorted properties: Message text");

			oState = {sorters: [{name: "Name"}, {name: "Country"}]};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.strictEqual(oValidationState.validation, coreLibrary.MessageType.Information,
				"Sorted properties and no visible columns: Validation result");
			assert.strictEqual(oValidationState.message, sMessage,
				"Sorted properties and no visible columns: Message text");

			oState = {
				items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}],
				sorters: [{name: "Name"}, {name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.strictEqual(oValidationState.validation, coreLibrary.MessageType.None, "All sorted properties visible: Validation result");
			assert.strictEqual(oValidationState.message, undefined, "All sorted properties visible: Message text");

			oState = {
				items: [{name: "Name"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.strictEqual(oValidationState.validation, coreLibrary.MessageType.Information, "Sorted property invisible: Validation result");
			assert.strictEqual(oValidationState.message, sMessage, "Sorted property invisible: Message text");

			oState = {
				items: [{name: "Name"}, {name: "name_country"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.strictEqual(oValidationState.validation, coreLibrary.MessageType.None,
				"Sorted property is part of a visible complex property: Validation result");
			assert.strictEqual(oValidationState.message, undefined,
				"Sorted property is part of a visible complex property: Message text");

			oTable.setP13nMode();
			oState = {
				items: [{name: "Name"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.strictEqual(oValidationState.validation, coreLibrary.MessageType.None,
				"Sorted property invisible and analytical features not enabled: Validation result");
			assert.strictEqual(oValidationState.message, undefined,
				"Sorted property invisible and analytical features not enabled: Message text");
		});
	});

	QUnit.test("Group restriction", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oDelegate = oTable.getControlDelegate();
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oState, oValidationState;

			oState = {
				items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}]
			};
			oValidationState = oTable.validateState(oState, "Group");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None, "No message");
			assert.equal(oValidationState.message, undefined, "Message text is not defined");

			oState = {
				items: [{name: "Name"}],
				aggregations: { Name : {}}
			};
			oValidationState = oTable.validateState(oState, "Group");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Information message, Grouping and aggreagtion can't be used simulatneously");
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS", "Name"),
				"Message text is correct");

			oState = {
				items: [{name: "Name"}, {name: "name_country"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oDelegate.validateState(oTable, oState);
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None,
				"No message, the sorted property is not visible but part of a visible complex property");
			assert.equal(oValidationState.message, undefined, "Message text is undefined");

			oState = {};
			oValidationState = oDelegate.validateState(oTable, oState);
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None,
				"No message because oState.items is undefined");
			assert.equal(oValidationState.message, undefined, "Message text is undefined");


			// Test grouping on non visible column in ResponsiveTable
			oTable.setType(TableType.ResponsiveTable);
			return oTable._fullyInitialized().then(function() {
				oState = {
					items: [{name: "Name"}],
					groupLevels: [{name: "Country"}]
				};
				oValidationState = oTable.validateState(oState, "Group");
				assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
					"Information message, Grouping can't be used on non visible column.");
				assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE", "Country"),
					"Message text is correct");
			});
		});
	});

	QUnit.test("Column restriction", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oState, oValidationState;

			oState = {
				items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}]
			};
			oValidationState = oTable.validateState(oState, "Column");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None, "No message");
			assert.equal(oValidationState.message, undefined, "Message text is not defined");

			oState = {
				items: [{name: "Country"}],
				aggregations: { Name : {}}
			};
			oValidationState = oTable.validateState(oState, "Column");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Information message, Cannot remove column when the total is showed for the column");
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION"),
				"Message text is correct");

			oState = {
				items: [{name: "Name"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Column");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Information message, Cannot remove column when the sorters is applied for the column");
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION", "Name"),
				"Message text is correct");

			oState = {
				items: [{name: "Country"}],
				sorters: [{name: "Name"}],
				aggregations: { Name : {}}
			};
			oValidationState = oTable.validateState(oState, "Column");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Information message, Cannot remove column when the sorters and totals is shown for the column");
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION") + "\n" +
				oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION", "Name"),
				"Message text is correct");

			oState = {};
			oValidationState = oTable.validateState(oState, "Column");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None,
				"No message because oState.items is undefined");
			assert.equal(oValidationState.message, undefined, "Message text is undefined");
		});
	});

	QUnit.module("Tests with specific propertyInfos", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				groupable: true
			}, {
				name: "Country",
				label: "Country",
				path: "Country"
			}, {
				name: "Value",
				label: "Value",
				path: "Value"
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
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
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
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			openColumnMenu(oTable, 0);

			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			return oTable._fullyInitialized();
		}).then(function() {
			assert.ok(getQuickAction(oTable._oColumnHeaderMenu, "QuickGroup"), "The first column has group menu item");
			assert.notOk(getQuickAction(oTable._oColumnHeaderMenu, "QuickTotal"), "The first column doesn't have an aggregate menu item");
		});
	});

	QUnit.module("Column state to plugin", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [
				{name: "CountryKey", path: "Country", label: "CountryKey", groupable: true, text: "CountryText"},
				{name: "CountryText", path: "CountryText", label: "CountryText", groupable: true},
				{name: "CountryKeyAndText", label: "CountryKey+CountryText", propertyInfos: ["CountryKey", "CountryText"]},
				{name: "SalesAmount", path: "SalesAmount", label: "SalesAmount", unit: "Currency"},
				{name: "Currency", path: "Currency", label: "Currency", groupable: true},
				{name: "SalesAmountAndCurrency", label: "SalesAmount+Currency", propertyInfos: ["SalesAmount", "Currency"]},
				{name: "SalesAmountAndRegion", label: "SalesAmount+Region", propertyInfos: ["SalesAmount", "Region"]},
				{name: "CurrencyAndRegion", label: "Currency+Region", propertyInfos: ["Currency", "Region"]},
				{name: "Region", path: "Region", label: "Region", groupable: true},
				{name: "RegionText", path: "RegionText", label: "RegionText", groupable: true},
				{name: "SalesAmountInLocalCurrency", path: "SalesAmountInLocalCurrency", label: "SalesAmountInLocalCurrency"},
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
					dataProperty: "CountryKey",
					template: new Text({text: "CountryKey"})
				}));
				this.oTable.addColumn(new Column({
					header: "CountryText",
					dataProperty: "CountryText",
					template: new Text({text: "CountryText"})
				}));
				this.oTable.addColumn(new Column({
					header: "CountryKey+CountryText",
					dataProperty: "CountryKeyAndText",
					template: new Text({text: "CountryKey CountryText"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount",
					dataProperty: "SalesAmount",
					template: new Text({text: "SalesAmount"})
				}));
				this.oTable.addColumn(new Column({
					header: "Currency",
					dataProperty: "Currency",
					template: new Text({text: "Currency"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount+Currency",
					dataProperty: "SalesAmountAndCurrency",
					template: new Text({text: "SalesAmount Currency"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount+Region",
					dataProperty: "SalesAmountAndRegion",
					template: new Text({text: "SalesAmount Region"})
				}));
				this.oTable.addColumn(new Column({
					header: "Currency+Region",
					dataProperty: "CurrencyAndRegion",
					template: new Text({text: "Currency Region"})
				}));
				this.oTable.addColumn(new Column({
					header: "SalesAmount+SalesAmountInLocalCurrency",
					dataProperty: "SalesAmountAndSalesAmountInLocalCurrency",
					template: new Text({text: "SalesAmount SalesAmountInLocalCurrency"})
				}));
				this.oTable.addColumn(new Column({
					header: "Region+RegionText",
					dataProperty: "RegionAndRegionText",
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
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
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
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oPlugin = oTable._oTable.getDependents()[0];
			var oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

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
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oPlugin = oTable._oTable.getDependents()[0];
			var oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

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
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oPlugin = oTable._oTable.getDependents()[0];
			var oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");

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
		var done = assert.async();
		var oTable = this.oTable;
		var fnOriginalUpdateBindingInfo;

		return oTable._fullyInitialized().then(function() {
			fnOriginalUpdateBindingInfo = oTable.getControlDelegate().updateBindingInfo;
			oTable.getControlDelegate().updateBindingInfo = function(oTable, oBindingInfo) {
				fnOriginalUpdateBindingInfo(oTable, oBindingInfo);
				oBindingInfo.parameters["$search"] = "Name";
			};
			return waitForBindingInfo(oTable);
		}).then(function() {
			var oPlugin = oTable._oTable.getDependents()[0];
			var oBindRowsSpy = sinon.spy(oTable._oTable, "bindRows");
			var oSetAggregation = sinon.spy(oPlugin, "setAggregationInfo");
			oTable.setGroupConditions({ groupLevels: [{ name: "CountryKey" }] }).rebind();
			var oBinding = oTable._oTable.getBindingInfo("rows");

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
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				path: "Name",
				label: "Name",
				sortable: true,
				groupable: true,
				filterable: true
			},{
				name: "Country",
				label: "Country",
				path: "Country",
				sortable: true,
				groupable: true,
				filterable: true
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
				dataProperty: "Name",
				template: new Text({text: "Name"})
			})).setModel(new ODataModel({
				synchronizationMode: "None",
				serviceUrl: "serviceUrl/",
				operationMode: "Server"
			}));

			return this.oTable._fullyInitialized().then(function() {
				this.oTable.bindRows();
				this.oInnerTable = this.oTable._oTable;
				this.oRowBinding = this.oTable.getRowBinding();
				this.oSetAggregationSpy = sinon.spy(this.oInnerTable.getDependents()[0], "setAggregationInfo");
				this.oRebindSpy = sinon.spy(this.oTable.getControlDelegate(), "rebind");
				this.oChangeParametersSpy = sinon.spy(this.oRowBinding, "changeParameters");
				this.oFilterSpy = sinon.spy(this.oRowBinding, "filter");
				this.oSortSpy = sinon.spy(this.oRowBinding, "sort");
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oSetAggregationSpy.restore();
			this.oRebindSpy.restore();
			this.oChangeParametersSpy.restore();
			this.oFilterSpy.restore();
			this.oSortSpy.restore();
		},
		after: function() {
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("Sort", function(assert) {
		this.oTable.setSortConditions({ sorters: [{ name: "Name", descending: false }] })._rebind();
		assert.ok(this.oSortSpy.firstCall.calledWithExactly(this.oTable._getSorters()));

		this.oTable.setSortConditions({ sorters: [{ name: "Name", descending: true }] })._rebind();
		assert.ok(this.oSortSpy.secondCall.calledWithExactly(this.oTable._getSorters()));

		this.oTable.setSortConditions()._rebind();
		assert.equal(this.oSortSpy.callCount, 3);
		assert.equal(this.oRebindSpy.callCount, 0);
	});

	QUnit.test("Filter", function(assert) {
		var aFilters = [new Filter("Name", "EQ", "a")];
		var oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");
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
		var oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

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

		this.oTable._rebind();
		assert.equal(this.oRebindSpy.callCount, 1);

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
		var oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");

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

	QUnit.module("API", {
		afterEach: function() {
			this.destroyTable();
		},
		initTable: function(sTableType) {
			this.destroyTable();
			this.oTable = new Table({
				type: sTableType,
				autoBindOnInit: false,
				delegate: {
					name: "sap/ui/mdc/odata/v4/TableDelegate"
				}
			});
			return this.oTable.initialized();
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("#isExportSupported", function(assert) {
		var fnTest = function(sTableType, bExpectedSupport) {
			var pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable(sTableType);
			return pInit.then(function(oTable) {
				assert.strictEqual(oTable.getControlDelegate().isExportSupported(oTable), bExpectedSupport, "Table type: " + sTableType);
			});
		}.bind(this);

		return fnTest(TableType.Table, true).then(function() {
			return fnTest(TableType.TreeTable, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, true);
		});
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		var fnTest = function(sTableType, bExpectedSupport) {
			var pInit = this.oTable ? this.oTable.setType(sTableType).initialized() : this.initTable(sTableType);
			return pInit.then(function(oTable) {
				assert.strictEqual(oTable.getControlDelegate().isSelectionSupported(oTable), bExpectedSupport, "Table type: " + sTableType);
			});
		}.bind(this);

		return fnTest(TableType.Table, true).then(function() {
			return fnTest(TableType.TreeTable, false);
		}).then(function() {
			return fnTest(TableType.ResponsiveTable, true);
		});
	});
});
