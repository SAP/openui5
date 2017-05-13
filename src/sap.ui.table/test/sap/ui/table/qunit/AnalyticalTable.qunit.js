/*global QUnit,sinon*/

(function () {
	"use strict";

	// mapping of global function calls
	var o4aFakeService = window.o4aFakeService;

	// ************** Preparation Code **************

	jQuery.sap.require("sap.ui.model.odata.ODataModel");
	jQuery.sap.require("sap.ui.model.odata.v2.ODataModel");
	jQuery.sap.require("sap.ui.model.analytics.ODataModelAdapter");
	jQuery.sap.require("sap.ui.model.analytics.AnalyticalTreeBindingAdapter");

	//start the fake service
	var sServiceURI = "http://o4aFakeService:8080/";
	o4aFakeService.fake({
		baseURI: sServiceURI
	});

	sinon.config.useFakeTimers = false;

	// create a dummy AMD fdefine to check if shim works for datajs
	window.define = function () {
		throw Error("define should not be called");
	};
	window.define.amd = {vendor: "SAPUI5 QUnit Test"};


	function attachEventHandler(oControl, iSkipCalls, fnHandler, that) {
		var iCalled = 0;
		var fnEventHandler = function () {
			var fnTest = function () {
				iCalled++;
				if (iSkipCalls === iCalled) {
					oControl.detachEvent("_rowsUpdated", fnEventHandler);
					oControl.attachEventOnce("_rowsUpdated", fnHandler, that);
				}
			};
			Promise.resolve().then(fnTest.bind(this));
		};

		oControl.attachEvent("_rowsUpdated", fnEventHandler);
	}

	function performTestAfterTableIsUpdated(doTest, done) {
		this.oModel.attachMetadataLoaded(function () {
			attachEventHandler(this.oTable, 1, function () {
				doTest(this.oTable);
				done();
			}, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");
		}, this);
	}


	function createColumn(mSettings) {
		return new sap.ui.table.AnalyticalColumn({
			grouped: mSettings.grouped || false,
			summed: mSettings.summed || false,
			visible: true,
			template: new sap.m.Label({
				text: {
					path: mSettings.name
				},
				textAlign: "End"
			}),
			sortProperty: mSettings.name,
			filterProperty: mSettings.name,
			filterType: mSettings.summed ? new sap.ui.model.type.Float() : undefined,
			groupHeaderFormatter: function (value, value2) {
				return "|" + value + "-" + value2 + "|";
			},
			leadingProperty: mSettings.name,
			autoResizable: true
		});
	}


	function createTable(mSettings) {

		var mParams = {
			title: "AnalyticalTable",

			columns: [
				//dimensions + description texts
				createColumn({grouped: true, name: "CostCenter"}),
				createColumn({name: "CostCenterText"}),
				createColumn({grouped: true, name: "CostElement"}),
				createColumn({name: "CostElementText"}),
				createColumn({grouped: true, name: "Currency"}),

				//measures
				createColumn({summed: true, name: "ActualCosts"}),
				createColumn({summed: true, name: "PlannedCosts"})
			],

			visibleRowCount: 20,
			enableColumnReordering: true,
			showColumnVisibilityMenu: true,
			enableColumnFreeze: true,
			enableCellFilter: true,
			selectionMode: sap.ui.table.SelectionMode.MultiToggle
		};

		//maybe override some initial settings
		for (var sKey in mSettings) {
			mParams[sKey] = mSettings[sKey];
		}

		var oTable = new sap.ui.table.AnalyticalTable("analytical_table0", mParams);
		oTable.setModel(this.oModel);
		oTable.placeAt("content");

		return oTable;
	}


	//************** Test Code **************

	QUnit.module("Properties & Functions", {
		beforeEach: function () {
			this.oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, {useBatch: true});
			this.oTable = createTable.call(this);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTable.destroy();
		}
	});

	QUnit.test("SelectionMode", function (assert) {
		assert.equal(this.oTable.getSelectionMode(), sap.ui.table.SelectionMode.MultiToggle, "SelectionMode.MultiToggle");
		this.oTable.setSelectionMode(sap.ui.table.SelectionMode.Single);
		assert.equal(this.oTable.getSelectionMode(), sap.ui.table.SelectionMode.Single, "SelectionMode.Single");
		this.oTable.setSelectionMode(sap.ui.table.SelectionMode.Multi);
		assert.equal(this.oTable.getSelectionMode(), sap.ui.table.SelectionMode.MultiToggle, "SelectionMode.Multi defaulted to MultiToggle");
		this.oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
		assert.equal(this.oTable.getSelectionMode(), sap.ui.table.SelectionMode.MultiToggle, "SelectionMode.None not supported");
	});

	QUnit.test("SelectionBehavior", function (assert) {
		assert.equal(this.oTable.getSelectionBehavior(), sap.ui.table.SelectionBehavior.RowSelector, "SelectionBehavior.RowSelector");
		this.oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
		assert.equal(this.oTable.getSelectionBehavior(), sap.ui.table.SelectionBehavior.Row, "SelectionBehavior.Row");
		this.oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
		assert.equal(this.oTable.getSelectionBehavior(), sap.ui.table.SelectionBehavior.Row, "SelectionBehavior.RowOnly not supported");
	});

	QUnit.test("Dirty", function (assert) {
		assert.equal(this.oTable.getDirty(), false, "Default dirty");
		assert.equal(this.oTable.getShowOverlay(), false, "Default showOverlay");
		this.oTable.setDirty(true);
		assert.equal(this.oTable.getDirty(), true, "Dirty set");
		assert.equal(this.oTable.getShowOverlay(), true, "ShowOverlay set");
	});

	QUnit.test("FixedRowCount", function (assert) {
		assert.equal(this.oTable.getFixedRowCount(), 0, "Default fixedRowCount");
		this.oTable.setFixedRowCount(5);
		assert.equal(this.oTable.getFixedRowCount(), 0, "FixedRowCount cannot be changed");
	});

	QUnit.test("FixedBottomRowCount", function (assert) {
		var done = assert.async();

		function doTest(oTable) {
			assert.equal(oTable.getFixedBottomRowCount(), 1, "Default fixedBottomRowCount");
			oTable.setFixedBottomRowCount(5);
			assert.equal(oTable.getFixedBottomRowCount(), 1, "FixedBottomRowCount cannot be changed");
		}

		performTestAfterTableIsUpdated.call(this, doTest, done);
	});

	QUnit.test("EnableGrouping", function (assert) {
		assert.equal(this.oTable.getEnableGrouping(), false, "Default enableGrouping");
		this.oTable.setEnableGrouping(true);
		assert.equal(this.oTable.getEnableGrouping(), false, "EnableGrouping cannot be changed");
	});

	QUnit.test("getTotalSize", function (assert) {
		assert.expect(3);
		var done = assert.async();

		function doTest(oTable) {
			var oBinding = oTable.getBinding("rows");
			oBinding.getTotalSize = function () {
				assert.ok(true, "getTotalSize on Binding called");
				return 5;
			};
			assert.equal(oTable.getTotalSize(), 5, "Result of Binding");
			oTable.unbindRows();
			assert.equal(oTable.getTotalSize(), 0, "No Binding");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("CollapseRecursive", function (assert) {
		assert.expect(7);
		var done = assert.async();

		function doTest(oTable) {
			var oBinding = oTable.getBinding("rows");
			var bCollapseRecursive = false;
			oBinding.setCollapseRecursive = function (bParam) {
				assert.equal(bParam, bCollapseRecursive, "setCollapseRecursive on Binding called");
			};

			assert.ok(oTable.setCollapseRecursive(bCollapseRecursive) === oTable, "Call on Binding");
			assert.equal(oTable.getCollapseRecursive(), bCollapseRecursive, "Property");
			bCollapseRecursive = true;
			assert.ok(oTable.setCollapseRecursive(bCollapseRecursive) === oTable, "Call of Binding");
			assert.equal(oTable.getCollapseRecursive(), bCollapseRecursive, "Property");
			oTable.unbindRows();
			bCollapseRecursive = false;
			oTable.setCollapseRecursive(bCollapseRecursive);
			assert.equal(oTable.getCollapseRecursive(), bCollapseRecursive, "Property");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("_isRowSelectable", function (assert) {
		assert.expect(5);
		var done = assert.async();

		function doTest(oTable) {
			var oBinding = oTable.getBinding("rows");
			oBinding.isIndexSelectable = function (iRowIndex) {
				assert.ok(true, "isIndexSelectable on Binding called");
				return iRowIndex === 5;
			};
			assert.equal(oTable._isRowSelectable(5), true, "Result of Binding");
			assert.equal(oTable._isRowSelectable(4), false, "Result of Binding");
			oTable.unbindRows();
			assert.equal(oTable._isRowSelectable(5), false, "No Binding");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("collapseAll", function (assert) {
		assert.expect(6);
		var done = assert.async();

		function doTest(oTable) {
			oTable.setFirstVisibleRow(2);
			var oBinding = oTable.getBinding("rows");
			oBinding.collapseToLevel = function (iLevel) {
				assert.ok(true, "collapseToLevel on Binding called ...");
				assert.equal(iLevel, 0, "... with level 0");
			};
			assert.ok(oTable.collapseAll() === oTable, "Call on Binding");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row");
			oTable.unbindRows();
			oTable.setFirstVisibleRow(2);
			assert.ok(oTable.collapseAll() === oTable, "No Binding");
			assert.equal(oTable.getFirstVisibleRow(), 2, "First visible row");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("BindRows", function (assert) {
		var spy = this.spy(sap.ui.table.AnalyticalTable.prototype, "bindRows");
		new sap.ui.table.AnalyticalTable({
			rows: {path: "/modelData"},
			columns: [new sap.ui.table.AnalyticalColumn()]
		});

		assert.ok(spy.calledOnce, "bindRows was called");
	});


	QUnit.module("GroupHeaderMenu", {
		beforeEach: function () {
			this.oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, {useBatch: true});
			this.oTable = createTable.call(this);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oTable.destroy();
		}
	});

	QUnit.test("Menu", function (assert) {
		var done = assert.async();

		function doTest(oTable) {
			/*eslint-disable new-cap */
			var oEvent = jQuery.Event({type: "contextmenu"});
			/*eslint-enable new-cap */
			oEvent.target = oTable.getDomRef("rows-row0-col3");
			oTable._onContextMenu(oEvent);
			assert.ok(oTable._getGroupHeaderMenu().bOpen, "Menu is open");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("Localization", function (assert) {
		var done = assert.async();

		function doTest(oTable) {
			assert.ok(!oTable._oGroupHeaderMenu, "Group header menu does not exist");
			assert.ok(!oTable._oGroupHeaderMenuVisibilityItem, "Group header menu visibility item does not exist");
			assert.ok(!oTable._oGroupHeaderMoveUpItem, "Group header menu up item does not exist");
			assert.ok(!oTable._oGroupHeaderMoveDownItem, "Group header menu down item does not exist");
			oTable._getGroupHeaderMenu();
			assert.ok(!!oTable._oGroupHeaderMenu, "Group header menu exists");
			assert.ok(!!oTable._oGroupHeaderMenuVisibilityItem, "Group header menu visibility item exists");
			assert.ok(!!oTable._oGroupHeaderMoveUpItem, "Group header menu up item exists");
			assert.ok(!!oTable._oGroupHeaderMoveDownItem, "Group header menu down item exists");
			oTable._adaptLocalization(true, false);
			assert.ok(!!oTable._oGroupHeaderMenu, "Group header menu exists");
			assert.ok(!!oTable._oGroupHeaderMenuVisibilityItem, "Group header menu visibility item exists");
			assert.ok(!!oTable._oGroupHeaderMoveUpItem, "Group header menu up item exists");
			assert.ok(!!oTable._oGroupHeaderMoveDownItem, "Group header menu down item exists");
			oTable._adaptLocalization(false, true);
			assert.ok(!oTable._oGroupHeaderMenu, "Group header menu does not exist");
			assert.ok(!oTable._oGroupHeaderMenuVisibilityItem, "Group header menu visibility item does not exist");
			assert.ok(!oTable._oGroupHeaderMoveUpItem, "Group header menu up item does not exist");
			assert.ok(!oTable._oGroupHeaderMoveDownItem, "Group header menu down item does not exist");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});


	QUnit.module("AnalyticalTable with ODataModel v2", {
		beforeEach: function () {
			this.oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, {useBatch: true});
		},
		afterEach: function () {
			this.oTable.destroy();
		}
	});

	QUnit.test("getAnalyticalInfoOfRow", function (assert) {
		var done = assert.async();
		this.oModel.attachMetadataLoaded(function () {
			this.oTable = createTable.call(this);

			var fnHandler1 = function () {
				var oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[0]);
				assert.equal(oInfo.grandTotal, false, "Group: grandTotal flag");
				assert.equal(oInfo.group, true, "Group: group flag");
				assert.equal(oInfo.groupTotal, false, "Group: groupTotal flag");
				assert.equal(oInfo.level, 1, "Group: level");
				assert.ok(oInfo.context === this.oTable.getRows()[0].getBindingContext(), "Group: context");
				assert.equal(oInfo.groupedColumns.length, 1, "Group: groupedColumns");
				assert.equal(oInfo.groupedColumns[0], this.oTable.getGroupedColumns()[0], "Group: groupedColumn");

				oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[9]);
				assert.equal(oInfo.grandTotal, true, "GrandTotal: grandTotal flag");
				assert.equal(oInfo.group, false, "GrandTotal: group flag");
				assert.equal(oInfo.groupTotal, false, "GrandTotal: groupTotal flag");
				assert.equal(oInfo.level, 0, "GrandTotal: level");
				assert.ok(oInfo.context === this.oTable.getRows()[9].getBindingContext(), "GrandTotal: context");
				assert.equal(oInfo.groupedColumns.length, 0, "GrandTotal: groupedColumns");

				oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[10]);
				assert.ok(!oInfo, "Row has no context");

				oInfo = this.oTable.getAnalyticalInfoOfRow(new sap.ui.table.Row());
				assert.ok(!oInfo, "Row does not belong to the table");

				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			var fnHandler2 = function () {
				var oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[13]);
				assert.equal(oInfo.grandTotal, false, "GroupTotal: grandTotal flag");
				assert.equal(oInfo.group, false, "GroupTotal: group flag");
				assert.equal(oInfo.groupTotal, true, "GroupTotal: groupTotal flag");
				assert.equal(oInfo.level, 1, "GroupTotal: level");
				assert.ok(oInfo.context === this.oTable.getRows()[0].getBindingContext(), "GroupTotal: context");
				assert.equal(oInfo.groupedColumns.length, 1, "GroupTotal: groupedColumns");
				assert.equal(oInfo.groupedColumns[0], this.oTable.getGroupedColumns()[0], "Group: groupedColumn");

				this.oTable.unbindRows();
				oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[0]);
				assert.ok(!oInfo, "Table has no binding");

				done();
			};

			attachEventHandler(this.oTable, 1, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}, this);
	});

	QUnit.test("TreeAutoExpandMode", function (assert) {
		var done = assert.async();
		jQuery.sap.require("sap.ui.model.TreeAutoExpandMode");
		var oExpandMode = sap.ui.model.TreeAutoExpandMode;

		function checkMode(mode, text) {
			assert.equal(mode.Bundled, "Bundled", text + " - Mode Bundled");
			assert.equal(mode.Sequential, "Sequential", text + " - Mode Sequential");
		}

		sap.ui.require(["sap/ui/table/TreeAutoExpandMode"], function (oMode) {
			checkMode(oMode, "Module sap/ui/table/TreeAutoExpandMode");
			assert.ok(sap.ui.table.TreeAutoExpandMode === oMode, "Namespace sap.ui.table.TreeAutoExpandMode");
			assert.ok(sap.ui.table.TreeAutoExpandMode === oExpandMode, "sap.ui.table.TreeAutoExpandMode === sap.ui.model.TreeAutoExpandMode");
			done();
		});

		this.oTable = new sap.ui.table.AnalyticalTable();
		var oBindingInfo = {};
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Default");

		oBindingInfo = {parameters: {autoExpandMode: "Sequential"}};
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Sequential, "Property AutoExpandMode - From BindingInfo");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode(oExpandMode.Sequential);
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Sequential, "Property AutoExpandMode - Sequential");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode(oExpandMode.Bundled);
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Bundled");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode("DOES_NOT_EXIST");
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Wrong");
	});

	QUnit.test("SumOnTop", function (assert) {
		this.oTable = new sap.ui.table.AnalyticalTable();
		var oBindingInfo = {};
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, false, "Property SumOnTop - Default");

		oBindingInfo = {parameters: {sumOnTop: true}};
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, true, "Property SumOnTop - From BindingInfo");

		oBindingInfo = {};
		this.oTable.setSumOnTop(true);
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, true, "Property SumOnTop - Custom");
	});

	QUnit.test("NumberOfExpandedLevels", function (assert) {
		this.oTable = new sap.ui.table.AnalyticalTable();
		var oBindingInfo = {};
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 0, "Property NumberOfExpandedLevels - Default");

		oBindingInfo = {parameters: {numberOfExpandedLevels: 5}};
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 5, "Property NumberOfExpandedLevels - From BindingInfo");

		oBindingInfo = {};
		this.oTable.setNumberOfExpandedLevels(4);
		this.oTable._applyBindingInfoToModel(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 4, "Property SumOnTop - Custom");
	});

	QUnit.test("Simple expand/collapse", function (assert) {
		var done = assert.async();
		this.oModel.attachMetadataLoaded(function () {
			this.oTable = createTable.call(this);

			var fnHandler1 = function () {
				var oBinding = this.oTable.getBinding("rows");

				assert.equal(oBinding.mParameters.numberOfExpandedLevels, 0, "Number of expanded levels should be disabled (=0)");

				var oContext = this.oTable.getContextByIndex(0);
				assert.equal(oContext.getProperty("ActualCosts"), "1588416", "First row data is correct");

				oContext = this.oTable.getContextByIndex(8);
				assert.equal(oContext.getProperty("CostCenterText"), "Marketing Canada", "Last data row is correct");

				oContext = this.oTable._getFixedBottomRowContexts()[0].context;
				assert.equal(oContext.getProperty("ActualCosts"), "11775332", "Sum Row is correct");

				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			var fnHandler2 = function () {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");
				var oContext = this.oTable.getContextByIndex(0);
				var oSumContext = this.oTable.getContextByIndex(13);
				assert.deepEqual(oContext, oSumContext, "Subtotal-Row context is correct");

				this.oTable.collapse(0);
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				done();
			};

			attachEventHandler(this.oTable, 1, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}, this);
	});

	QUnit.test("ProvideGrandTotals = false: No Sum row available", function (assert) {
		var done = assert.async();
		this.oModel.attachMetadataLoaded(function () {
			this.oTable = createTable.call(this);

			var fnHandler1 = function () {
				var oContext = this.oTable.getContextByIndex(0);
				assert.equal(oContext.getProperty("ActualCosts"), "1588416", "First row data is correct");

				oContext = this.oTable.getContextByIndex(8);
				assert.equal(oContext.getProperty("CostCenterText"), "Marketing Canada", "Last data row is correct");

				oContext = this.oTable._getFixedBottomRowContexts()[0].context;
				assert.equal(oContext.getPath(), "/artificialRootContext", "No Grand Totals: Root Context is artificial!");

				// initial expand
				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			var fnHandler2 = function () {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");

				var oContext = this.oTable.getContextByIndex(0);
				var oSumContext = this.oTable.getContextByIndex(13);

				assert.notEqual(oContext.getPath(), oSumContext.getPath(), "No Subtotal Row Context inserted");

				this.oTable.collapse(0);
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				done();
			};

			attachEventHandler(this.oTable, 1, fnHandler1, this);
			this.oTable.bindRows({
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					provideGrandTotals: false
				}
			});

		}, this);
	});


	QUnit.module("AnalyticalColumn", {
		beforeEach: function () {
			this.oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, {useBatch: true});
		},
		afterEach: function () {
			this.oTable.destroy();
		}
	});

	QUnit.test("getTooltip_AsString", function (assert) {
		var done = assert.async();
		this.oModel.attachMetadataLoaded(function () {
			this.oTable = createTable.call(this);

			var fnHandler = function () {
				var oColumn = this.oTable.getColumns()[1];
				assert.equal(oColumn.getTooltip_AsString(), "Cost Center", "Default Tooltip");
				oColumn.setTooltip("Some other tooltip");
				assert.equal(oColumn.getTooltip_AsString(), "Some other tooltip", "Custom Tooltip");
				done();
			};

			attachEventHandler(this.oTable, 1, fnHandler, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}, this);
	});


	QUnit.module("AnalyticalColumn - Column Menu", {
		beforeEach: function () {
			this._oTable = new sap.ui.table.AnalyticalTable();

			this._oTable.removeColumn = function (oColumn) {
				return this.removeAggregation('columns', oColumn);
			};

			// no real binding is required here. Instead mock a binding object
			this._oTable.getBinding = function () {
				var oBinding = {};
				var aProperties = [
					{name: "m1", type: "measure", filterable: false},
					{name: "m2_filterable", type: "measure", filterable: true},
					{name: "d1", type: "dimension", filterable: false},
					{name: "d2_filterable", type: "dimension", filterable: true}
				];

				oBinding.isMeasure = function (sPropertyName) {
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].name === sPropertyName && aProperties[i].type === "measure") {
							return true;
						}
					}
					return false;
				};

				oBinding.getProperty = function (sPropertyName) {
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].name === sPropertyName) {
							return aProperties[i];
						}
					}
				};

				oBinding.getFilterablePropertyNames = function () {
					var aPropertyNames = [];
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].filterable === true) {
							aPropertyNames.push(aProperties[i].name);
						}
					}
					return aPropertyNames;
				};

				return oBinding;
			};
			this._oColumn = new sap.ui.table.AnalyticalColumn();
		},
		afterEach: function () {
			this._oColumn.destroy();
			this._oTable.destroy();
		}
	});

	QUnit.test("Pre-Check Menu Item Creation without Parent", function (assert) {

		//######################################################################################################
		// Filter menu item
		//######################################################################################################
		this._oColumn.setFilterProperty("");
		this._oColumn.setShowFilterMenuEntry(true);

		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());
	});


	QUnit.test("Pre-Check Menu Item Creation with Parent", function (assert) {

		//######################################################################################################
		// Filter menu item
		//######################################################################################################
		// add the column to analytical table
		this._oTable.addAggregation("columns", this._oColumn);

		this._oColumn.setFilterProperty("");
		this._oColumn.setShowFilterMenuEntry(true);

		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(this._oColumn.isFilterableByMenu(), "Filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());
	});

	QUnit.test("Menu Creation", function (assert) {
		var oMenu = this._oColumn._createMenu();
		assert.ok(oMenu instanceof sap.ui.table.AnalyticalColumnMenu, "Menu available");
		assert.equal(oMenu.getId(), this._oColumn.getId() + "-menu", "Menu Id");
	});

}());