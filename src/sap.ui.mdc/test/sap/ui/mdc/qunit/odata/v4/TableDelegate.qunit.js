/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/library",
	"../../QUnitUtils",
	"../../util/createAppEnvironment",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Filter"
], function(
	Table,
	Column,
	Library,
	MDCQUnitUtils,
	createAppEnvironment,
	ControlPersonalizationWriteAPI,
	Core,
	coreLibrary,
	ODataModel,
	Filter
) {
	"use strict";

	var TableType = Library.TableType;

	sap.ui.define("odata.v4.TestDelegate", [
		"sap/ui/mdc/odata/v4/TableDelegate"
	], function(TableDelegate) {
		var TestDelegate = Object.assign({}, TableDelegate);

		TestDelegate.updateBindingInfo = function(oMDCTable, oMetadataInfo, oBindingInfo) {
			oBindingInfo.path = "ProductList";
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

	QUnit.module("Initialization");

	QUnit.test("GridTable", function(assert) {
		var oTable = new Table({
			delegate: {
				name: "odata.v4.TestDelegate"
			}
		});

		return oTable._fullyInitialized().then(function() {
			var oPlugin = oTable._oTable.getDependents()[0];
			assert.ok(oPlugin.isA("sap.ui.table.plugins.V4Aggregation"), "V4Aggregation plugin is added to the inner table");

			var oGroupHeaderFormatter = sinon.spy(oTable.getControlDelegate(), "formatGroupHeader");
			oPlugin.getGroupHeaderFormatter()("MyContext", "MyProperty");
			assert.ok(oGroupHeaderFormatter.calledOnceWithExactly(oTable, "MyContext", "MyProperty"), "Call Delegate.formatGroupHeader");

			oTable.destroy();
		});
	});

	QUnit.test("ResponsiveTable", function(assert) {
		var oTable = new Table({
			type: TableType.ResponsiveTable,
			delegate: {
				name: "odata.v4.TestDelegate"
			}
		});

		return oTable.initialized().then(function() {
			assert.ok(true, "Initialization successful for ResponsiveTable");
		});
	});

	QUnit.module("Basic functionality with JsControlTreeModifier", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				groupable: true
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				groupable: true
			}, {
				name: "name_country",
				label: "Complex Title & Description",
				propertyInfos: ["Name", "Country"]
			}]);
			MDCQUnitUtils.stubPropertyExtension(Table.prototype, {
				Name: {
					defaultAggregate: {}
				},
				Country: {
					defaultAggregate: {}
				}
			});
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
			MDCQUnitUtils.restorePropertyExtension(Table.prototype);
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
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var oTable = this.oTable;
		var oPlugin;
		var fSetAggregationSpy;

		return oTable._fullyInitialized().then(function() {
			var oFirstInnerColumn = oTable._oTable.getColumns()[0];

			oPlugin = oTable._oTable.getDependents()[0];
			fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");

			oTable.setAggregateConditions({
				Country: {}
			});
			oTable.rebind();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: ["Name", "Country"],
				groupLevels: [],
				grandTotal: ["Country"],
				subtotals: ["Country"],
				columnState: createColumnStateIdMap(oTable, [
					{subtotals: false, grandTotal: false},
					{subtotals: true, grandTotal: true},
					{subtotals: true, grandTotal: true}
				])
			}), "Plugin#setAggregationInfo call");

			oTable._oTable.fireEvent("columnSelect", {
				column: oFirstInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");
			return oTable._fullyInitialized();
		}).then(function() {
			var oThirdInnerColumn = oTable._oTable.getColumns()[2];

			assert.strictEqual(oTable._oPopover.getItems()[0].getLabel(), oResourceBundle.getText("table.SETTINGS_GROUP"),
				"The first column has group menu item");
			assert.strictEqual(oTable._oPopover.getItems()[1].getLabel(), oResourceBundle.getText("table.SETTINGS_TOTALS"),
				"The first column has aggregate menu item");

			oTable._oTable.fireEvent("columnSelect", {
				column: oThirdInnerColumn
			});
			return oTable._fullyInitialized();
		}).then(function() {
			assert.strictEqual(fColumnPressSpy.callCount, 2, "Third Column pressed");
			assert.strictEqual(oTable._oPopover.getItems()[0].getItems().length,2, "The last column has complex property with list of two items");

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
				visible: ["Name", "Country"],
				groupLevels: ["Name"],
				grandTotal: ["Country"],
				subtotals: ["Country"],
				columnState: createColumnStateIdMap(oTable, [
					{subtotals: false, grandTotal: false},
					{subtotals: true, grandTotal: true},
					{subtotals: true, grandTotal: true}
				])
			}), "Plugin#setAggregationInfo call");

			var oNewCol = new sap.ui.mdc.table.Column({
				id: "cl"
			});
			fSetAggregationSpy.reset();
			oTable.insertColumn(oNewCol, 2);
			oTable.rebind();
			assert.ok(fSetAggregationSpy.calledOnceWithExactly({
				visible: ["Name", "Country"],
				groupLevels: ["Name"],
				grandTotal: ["Country"],
				subtotals: ["Country"],
				columnState: createColumnStateIdMap(oTable, [
					{subtotals: false, grandTotal: false},
					{subtotals: true, grandTotal: true},
					{subtotals: false, grandTotal: false},
					{subtotals: true, grandTotal: true}
				])
			}), "Plugin#setAggregationInfo call");

			fSetAggregationSpy.restore();
		});
	});

	QUnit.test("Grouping enabled on column press", function(assert) {
		var oTable = this.oTable;
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

		 oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First column pressed");
			fColumnPressSpy.restore();

			 oTable._fullyInitialized().then(function() {
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var oDelegate = oTable.getControlDelegate();
				var fnRebindTable = oDelegate.rebindTable;

				oDelegate.rebindTable = function () {
					fnRebindTable.apply(this, arguments);
					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: ["Name"],
						grandTotal: [],
						subtotals: [],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false}
						])
					}), "Plugin#setAggregationInfo call");
					fSetAggregationSpy.restore();
					oDelegate.rebindTable = fnRebindTable;
					done();
				};
				oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Aggregation enabled on column press", function(assert) {
		var oTable = this.oTable;
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");
		var done = assert.async();

		 oTable._fullyInitialized().then(function() {
			var oInnerSecondColumn = oTable._oTable.getColumns()[1];
			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerSecondColumn
			});

			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");
			fColumnPressSpy.restore();

			oTable._fullyInitialized().then(function() {
				var oDelegate = oTable.getControlDelegate();
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var fnRebindTable = oDelegate.rebindTable;

				oDelegate.rebindTable = function () {
					fnRebindTable.apply(this, arguments);
					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: [],
						grandTotal: ["Country"],
						subtotals: ["Country"],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: true, grandTotal: true},
							{subtotals: true, grandTotal: true}
						])
					}), "Plugin#setAggregationInfo call");
					fSetAggregationSpy.restore();
					oDelegate.rebindTable = fnRebindTable;
					done();
				};
				oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[1].firePress();
			});
		});
	});

	QUnit.test("Grouping and Aggregation on two columns", function(assert) {
		var oTable = this.oTable;
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");
		var done = assert.async();

		oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			oTable._fullyInitialized().then(function() {
				var oDelegate = oTable.getControlDelegate();
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var fnRebindTable = oDelegate.rebindTable;
				var oInnerSecondColumn = oTable._oTable.getColumns()[1];

				oDelegate.rebindTable = function () {
					fnRebindTable.apply(this, arguments);
					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: ["Name"],
						grandTotal: [],
						subtotals: [],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false}
						])
					}), "Plugin#setAggregationInfo call");

					fColumnPressSpy.restore();
					fSetAggregationSpy.restore();
					oDelegate.rebindTable = fnRebindTable;
					oTable._oTable.fireEvent("columnSelect", {
						column: oInnerSecondColumn
					});

					oTable._fullyInitialized().then(function() {
						var oDelegate = oTable.getControlDelegate();
						var oPlugin = oTable._oTable.getDependents()[0];
						var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
						var fnRebindTable = oDelegate.rebindTable;

						oDelegate.rebindTable = function () {
							fnRebindTable.apply(this, arguments);
							assert.ok(fSetAggregationSpy.calledOnceWithExactly({
								visible: ["Name", "Country"],
								groupLevels: ["Name"],
								grandTotal: ["Country"],
								subtotals: ["Country"],
								columnState: createColumnStateIdMap(oTable, [
									{subtotals: false, grandTotal: false},
									{subtotals: true, grandTotal: true},
									{subtotals: true, grandTotal: true}
								])
							}), "Plugin#setAggregationInfo call");

							fColumnPressSpy.restore();
							fSetAggregationSpy.restore();
							oDelegate.rebindTable = fnRebindTable;
							done();
						};
						oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[1].firePress();
					});
				};
				oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			});
		});
	});

	QUnit.test("Grouping and forced aggregation", function(assert) {
		var oTable = this.oTable;
		var oDelegate;
		var oPlugin;
		var fSetAggregationSpy;
		var fnRebindTable;

		function openColumnMenu(oColumn) {
			oTable._oTable.fireEvent("columnSelect", {
				column: oColumn
			});

			// The popover is created async.
			return oTable._fullyInitialized();
		}

		return oTable._fullyInitialized().then(function() {
			oDelegate = oTable.getControlDelegate();
			oPlugin = oTable._oTable.getDependents()[0];
			fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
			fnRebindTable = oDelegate.rebindTable;

			return openColumnMenu(oTable._oTable.getColumns()[0]);
		}).then(function() {
			return new Promise(function(resolve) {
				oDelegate.rebindTable = function() {
					fnRebindTable.apply(this, arguments);

					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: ["Name"],
						grandTotal: [],
						subtotals: [],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false},
							{subtotals: false, grandTotal: false}
						])
					}), "Plugin#setAggregationInfo call");

					fSetAggregationSpy.reset();
					oDelegate.rebindTable = fnRebindTable;
					resolve();
				};
				oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
			});
		}).then(function() {
			return openColumnMenu(oTable._oTable.getColumns()[0]);
		}).then(function() {
			return new Promise(function(resolve) {
				oDelegate.rebindTable = function() {
					fnRebindTable.apply(this, arguments);

					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country"],
						groupLevels: [],
						grandTotal: ["Name"],
						subtotals: ["Name"],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: true, grandTotal: true},
							{subtotals: false, grandTotal: false},
							{subtotals: true, grandTotal: true}
						])
					}), "Plugin#setAggregationInfo call");

					fSetAggregationSpy.reset();
					oDelegate.rebindTable = fnRebindTable;
					resolve();
				};
				oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[1].firePress();
				Core.byId(oTable.getId() + "-messageBox").getButtons()[0].firePress();
			});
		});
	});

	QUnit.test("Sorting restriction", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oState, oValidationState;

			oState = {
				items: [{name: "Name"}, {name: "name_country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None,
				"No message because oState.sorters is undefined");
			assert.equal(oValidationState.message, undefined, "Message text is undefined");

			oState = {
				sorters: [{name: "Name"}, {name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Warning message, oState.items is undefined");
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION"),
				"Message text is correct");

			oState = {
				items: [{name: "Name"}, {name: "Country"}, {name: "name_country"}],
				sorters: [{name: "Name"}, {name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None, "No message");
			assert.equal(oValidationState.message, undefined, "Message text is undefined");

			oState = {
				items: [{name: "Name"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Warning message, sorted a not visible property");
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION"),
				"Message text is correct");

			oState = {
				items: [{name: "Name"}, {name: "name_country"}],
				sorters: [{name: "Country"}]
			};
			oValidationState = oTable.validateState(oState, "Sort");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None,
				"No message, the sorted property is not visible but part of a visible complex property");
			assert.equal(oValidationState.message, undefined, "Message text is undefined");
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
			assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION", "Name"),
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

	QUnit.module("Tests with specific propertyInfos and extensions for binding", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				groupable: true
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				groupable: true
			}, {
				name: "Value",
				label: "Value",
				path: "Value"
			}, {
				name: "name_country",
				label: "Complex Title & Description",
				propertyInfos: ["Name"]
			}]);
			MDCQUnitUtils.stubPropertyInfosForBinding(Table.prototype, [{
				name: "Name",
				label: "Name",
				path: "Name",
				groupable: true
			}, {
				name: "Country",
				label: "Country",
				path: "Country",
				groupable: true
			}, {
				name: "Value",
				label: "Value",
				path: "Value"
			}, {
				name: "name_country",
				label: "Complex Title & Description",
				propertyInfos: ["Name", "Country", "Value"]
			}]);
			MDCQUnitUtils.stubPropertyExtensionsForBinding(Table.prototype, {
				Value: {
					defaultAggregate: {}
				}
			});
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
			MDCQUnitUtils.restorePropertyInfosForBinding(Table.prototype);
			MDCQUnitUtils.restorePropertyExtensionsForBinding(Table.prototype);
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
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oFirstInnerColumn = oTable._oTable.getColumns()[0];

			oTable._oTable.fireEvent("columnSelect", {
				column: oFirstInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First Column pressed");

			return oTable._fullyInitialized();
		}).then(function() {
			assert.strictEqual(oTable._oPopover.getItems()[0].getLabel(), oResourceBundle.getText("table.SETTINGS_GROUP"),
				"The first column has group menu item");
			assert.equal(oTable._oPopover.getItems().length, 1, "The first column doesn't have an aggregate menu item");
		});
	});

	QUnit.test("Apply group on column header", function(assert) {
		var oTable = this.oTable;
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(oTable, "_onColumnPress");

		 oTable._fullyInitialized().then(function() {
			var oInnerColumn = oTable._oTable.getColumns()[0];
			oTable._oTable.fireEvent("columnSelect", {
				column: oInnerColumn
			});
			assert.ok(fColumnPressSpy.calledOnce, "First column pressed");
			fColumnPressSpy.restore();

			oTable._fullyInitialized().then(function() {
				var oPlugin = oTable._oTable.getDependents()[0];
				var fSetAggregationSpy = sinon.spy(oPlugin, "setAggregationInfo");
				var oDelegate = oTable.getControlDelegate();
				var fnRebindTable = oDelegate.rebindTable;

				oDelegate.rebindTable = function () {
					fnRebindTable.apply(this, arguments);
					assert.ok(fSetAggregationSpy.calledOnceWithExactly({
						visible: ["Name", "Country","Value"],
						groupLevels: ["Name"],
						grandTotal: [],
						subtotals: [],
						columnState: createColumnStateIdMap(oTable, [
							{subtotals: false, grandTotal: false},
							{subtotals: true, grandTotal: true}
						])
					}), "Plugin#setAggregationInfo call");
					fSetAggregationSpy.restore();
					oDelegate.rebindTable = fnRebindTable;
					done();
				};
				var fTableGroupSpy = sinon.spy(oTable, "_onCustomGroup");
				oTable._oPopover.getAggregation("_popover").getContent()[0].getContent()[0].firePress();
				assert.ok(fTableGroupSpy.calledOnce, "Column group triggered");
				if (!fTableGroupSpy.calledOnce) {
					done();	// rebindTable won't be called in this case, so we need to end the test here
				}
			});
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
			MDCQUnitUtils.stubPropertyExtension(Table.prototype, {
				SalesAmount: {defaultAggregate: {}},
				Currency: {defaultAggregate: {}}
			});
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
			MDCQUnitUtils.restorePropertyExtension(Table.prototype);
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
				])
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
				])
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
				])
			}), "Plugin#setAggregationInfo call");
		});
	});

	QUnit.module("v4.TableDelegate#updateBinding", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				path: "Name",
				label: "Name",
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
					name: "odata.v4.TestDelegate",
					payload: {
						collectionPath: "ProductList"
					}
				}
			}).setModel(new ODataModel({
				synchronizationMode: "None",
				serviceUrl: "serviceUrl/",
				operationMode: "Server"
			}));

			return this.oTable._fullyInitialized().then(function() {
				this.oTable.bindRows();
				this.oInnerTable = this.oTable._oTable;
				this.oRowBinding = this.oTable.getRowBinding();
				this.oSetAggregationSpy = sinon.spy(this.oInnerTable.getDependents()[0], "setAggregationInfo");
				this.oRebindTableSpy = sinon.spy(this.oTable.getControlDelegate(), "rebindTable");
				this.oChangeParametersSpy = sinon.spy(this.oRowBinding, "changeParameters");
				this.oFilterSpy = sinon.spy(this.oRowBinding, "filter");
				this.oSortSpy = sinon.spy(this.oRowBinding, "sort");
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oSetAggregationSpy.restore();
			this.oRebindTableSpy.restore();
			this.oChangeParametersSpy.restore();
			this.oFilterSpy.restore();
			this.oSortSpy.restore();
		},
		after: function() {
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("Sort", function(assert) {
		this.oTable.setSortConditions({ sorters: [{ name: "Name", descending: false }] }).rebind();
		assert.ok(this.oSortSpy.firstCall.calledWithExactly(this.oTable._getSorters()));

		this.oTable.setSortConditions({ sorters: [{ name: "Name", descending: true }] }).rebind();
		assert.ok(this.oSortSpy.secondCall.calledWithExactly(this.oTable._getSorters()));

		this.oTable.setSortConditions().rebind();
		assert.equal(this.oSortSpy.callCount, 3);
		assert.equal(this.oRebindTableSpy.callCount, 0);
	});

	QUnit.test("Filter", function(assert) {
		var aFilters = [new Filter("Name", "EQ", "a")];
		var oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");
        oUpdateBindingInfoStub.callsFake(function (oMDCTable, oMetadataInfo, oBindingInfo) {
			oBindingInfo.path = oMetadataInfo.collectionPath;
			oBindingInfo.filters = aFilters;
        });

		this.oTable.rebind();
		assert.ok(this.oFilterSpy.firstCall.calledWithExactly(aFilters, "Application"));

		oUpdateBindingInfoStub.restore();
		this.oTable.rebind();
		assert.ok(this.oFilterSpy.secondCall.calledWithExactly([], "Application"));
		assert.equal(this.oRebindTableSpy.callCount, 0);
	});

	QUnit.test("Group", function(assert) {
		this.oTable.setGroupConditions({ groupLevels: [{ name: "Name" }] }).rebind();
		assert.ok(this.oSetAggregationSpy.firstCall.calledWithMatch({ groupLevels: [ "Name" ] }));

		this.oTable.setGroupConditions().rebind();
		assert.ok(this.oSetAggregationSpy.secondCall.calledWithMatch( { groupLevels: [] }));
		assert.equal(this.oRebindTableSpy.callCount, 0);
	});

	QUnit.test("Aggregates", function(assert) {
		this.oTable.setAggregateConditions({ Name: {} }).rebind();
		assert.ok(this.oSetAggregationSpy.firstCall.calledWithMatch({
		    grandTotal: [ "Name" ],
		    subtotals: [ "Name" ]
		}));

		this.oTable.setAggregateConditions().rebind();
		assert.ok(this.oSetAggregationSpy.secondCall.calledWithMatch( { grandTotal: [], subtotals: [] }));
		assert.equal(this.oRebindTableSpy.callCount, 0);
	});

	QUnit.test("Paramaters", function(assert) {
		var oUpdateBindingInfoStub = sinon.stub(this.oTable.getControlDelegate(), "updateBindingInfo");
        oUpdateBindingInfoStub.onCall(0).callsFake(function (oMDCTable, oMetadataInfo, oBindingInfo) {
			oBindingInfo.path = oMetadataInfo.collectionPath;
            oBindingInfo.parameters.$search = "x";
        });
		oUpdateBindingInfoStub.onCall(1).callsFake(function (oMDCTable, oMetadataInfo, oBindingInfo) {
			oBindingInfo.path = oMetadataInfo.collectionPath;
            oBindingInfo.parameters.$search = undefined;
        });
		oUpdateBindingInfoStub.onCall(2).callsFake(function (oMDCTable, oMetadataInfo, oBindingInfo) {
			oBindingInfo.path = oMetadataInfo.collectionPath;
            oBindingInfo.parameters.$$canonicalPath = true;
        });

		this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 1);
		this.oTable.rebind();
		assert.equal(this.oChangeParametersSpy.callCount, 2);
		assert.equal(this.oRebindTableSpy.callCount, 0);

		this.oTable.rebind();
		assert.equal(this.oRebindTableSpy.callCount, 1);

		oUpdateBindingInfoStub.restore();
	});

	QUnit.test("Add Column", function(assert) {
		this.oTable.insertColumn(new Column());
		this.oTable.rebind();

		assert.equal(this.oChangeParametersSpy.callCount, 0);
		assert.equal(this.oFilterSpy.callCount, 0);
		assert.equal(this.oSortSpy.callCount, 0);
		assert.equal(this.oSetAggregationSpy.callCount, 1);
		assert.equal(this.oRebindTableSpy.callCount, 1);
	});

});
