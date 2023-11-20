/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/qunit/analytics/o4aMetadata",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/model/Filter",
	"sap/ui/model/type/Float",
	"sap/ui/table/Row",
	"sap/ui/table/library",
	"sap/ui/core/TooltipBase",
	"sap/ui/core/Core",
	"sap/m/table/columnmenu/Menu",
	// provides mock data
	"sap/ui/core/qunit/analytics/TBA_ServiceDocument",
	// provides mock data
	"sap/ui/core/qunit/analytics/ATBA_Batch_Contexts"
], function(
	Element,
	TableQUnitUtils,
	AnalyticalTable,
	FixedRowMode,
	TableUtils,
	ODataModel,
	ODataModelV2,
	o4aFakeService,
	TreeAutoExpandMode,
	AnalyticalColumn,
	Filter,
	FloatType,
	Row,
	library,
	TooltipBase,
	Core,
	ColumnMenu
) {
	"use strict";

	// ************** Preparation Code **************

	//start the fake service
	var sServiceURI = "http://o4aFakeService:8080/";
	o4aFakeService.fake({
		baseURI: sServiceURI
	});

	sinon.config.useFakeTimers = false;

	function createResponseData(iSkip, iTop, iCount) {
		var sRecordTemplate = "{\"__metadata\":{\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults('{index}')\","
							  + "\"type\":\"tmp.u012345.cca.CCA.ActualPlannedCostsResultsType\"},"
							  + "\"CostCenter\":\"CostCenter-{index}\""
							  + ",\"PlannedCosts\":\"499.99\""
							  + ",\"Currency\":\"EUR\""
							  + "}";
		var aRecords = [];
		var sCount = iCount != null ? ",\"__count\":\"" + iCount + "\"" : "";

		for (var i = iSkip, iLastIndex = iSkip + iTop; i < iLastIndex; i++) {
			aRecords.push(sRecordTemplate.replace(/({index})/g, i));
		}

		return "{\"d\":{\"results\":[" + aRecords.join(",") + "]" + sCount + "}}";
	}

	function createResponse(iSkip, iTop, iCount, bGrandTotal, bGrandTotalEmpty) {
		var sGrandTotal = "{\"__metadata\":{\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544452006589331\')\","
						  + "\"type\":\"tmp.u012345.cca.CCA.ActualPlannedCostsResultsType\"},"
						  + "\"Currency\":\"USD\",\"PlannedCosts\":\"9848641.68\"}";
		var sGrandTotalResponse =
			bGrandTotal
				? "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
				  "Content-Type: application/http\r\n" +
				  "Content-Length: 356\r\n" +
				  "content-transfer-encoding: binary\r\n" +
				  "\r\n" +
				  "HTTP/1.1 200 OK\r\n" +
				  "Content-Type: application/json\r\n" +
				  "content-language: en-US\r\n" +
				  "Content-Length: 259\r\n" +
				  "\r\n" +
				  "{\"d\":{\"results\":[" + (bGrandTotalEmpty ? "" : sGrandTotal) + "],"
				  + "\"__count\":\"" + (bGrandTotalEmpty ? "0" : "1") + "\"}}\r\n"
				: "";

		var sCountResponse =
			iCount != null
				? "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
				  "Content-Type: application/http\r\n" +
				  "Content-Length: 131\r\n" +
				  "content-transfer-encoding: binary\r\n" +
				  "\r\n" +
				  "HTTP/1.1 200 OK\r\n" +
				  "Content-Type: application/json\r\n" +
				  "content-language: en-US\r\n" +
				  "Content-Length: 35\r\n" +
				  "\r\n" +
				  "{\"d\":{\"results\":[],\"__count\":\"" + iCount + "\"}}\r\n"
				: "";

		return sGrandTotalResponse +
			   sCountResponse +
			   "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			   "Content-Type: application/http\r\n" +
			   "Content-Length: 3113\r\n" +
			   "content-transfer-encoding: binary\r\n" +
			   "\r\n" +
			   "HTTP/1.1 200 OK\r\n" +
			   "Content-Type: application/json\r\n" +
			   "content-language: en-US\r\n" +
			   "Content-Length: 3015\r\n" +
			   "\r\n" +
			   createResponseData(iSkip, iTop, iCount) + "\r\n" +
			   "--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			   "";
	}

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExist%27)"
			+ "&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExist%27)"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=110&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostElement,Currency"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExist%27)"
			+ "&$top=0&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 0, 0, true, true)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExistButReturnsGrandTotal%27)"
			+ "&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExistButReturnsGrandTotal%27)"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=110&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostElement,Currency"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExistButReturnsGrandTotal%27)"
			+ "&$top=0&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 0, 0, true)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency"
			+ "&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency,PlannedCosts"
			+ "&$top=120&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 120, 120)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=120&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 10)
	});

	function attachEventHandler(oControl, iSkipCalls, fnHandler, that) {
		var iCalled = 0;
		var fnEventHandler = function() {
			var fnTest = function() {
				iCalled++;
				if (iSkipCalls === iCalled) {
					oControl.detachRowsUpdated(fnEventHandler);
					oControl.attachEventOnce("rowsUpdated", fnHandler, that);
				}
			};
			Promise.resolve().then(fnTest.bind(this));
		};

		if (iSkipCalls === 0) {
			oControl.attachEventOnce("rowsUpdated", fnHandler, that);
		} else {
			oControl.attachRowsUpdated(fnEventHandler);
		}
	}

	function performTestAfterTableIsUpdated(doTest, done) {
		this.oModel.metadataLoaded().then(function() {
			attachEventHandler(this.oTable, 0, function() {
				doTest(this.oTable);
				if (done) {
					done();
				}
			}, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");
		}.bind(this));
	}

	function createColumn(mSettings) {
		return new AnalyticalColumn({
			grouped: mSettings.grouped || false,
			summed: mSettings.summed || false,
			visible: true,
			template: new TableQUnitUtils.TestControl({
				text: {
					path: mSettings.name
				}
			}),
			sortProperty: mSettings.name,
			filterProperty: mSettings.name,
			filterType: mSettings.summed ? new FloatType() : undefined,
			groupHeaderFormatter: function(value, value2) {
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
			rowMode: new FixedRowMode({
				rowCount: 20
			}),
			enableColumnReordering: true,
			/**
			 * @deprecated As of Version 1.117
			 */
			showColumnVisibilityMenu: true,
			enableColumnFreeze: true,
			enableCellFilter: true,
			selectionMode: library.SelectionMode.MultiToggle
		};

		//maybe override some initial settings
		for (var sKey in mSettings) {
			mParams[sKey] = mSettings[sKey];
		}

		var oTable = new AnalyticalTable("analytical_table0", mParams);
		oTable.setModel(this.oModel);
		oTable.placeAt("qunit-fixture");

		return oTable;
	}

	//************** Test Code **************

	QUnit.module("Properties & Functions", {
		beforeEach: function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
			this.oTable = createTable.call(this);
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Hierarchy mode", function(assert) {
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group, "Table is in mode 'Group'");
	});

	QUnit.test("Selection Plugin", function(assert) {
		assert.ok(this.oTable._getSelectionPlugin().isA("sap.ui.table.plugins.BindingSelection"), "BindingSelection plugin is initialized");
	});

	QUnit.test("SelectionBehavior", function(assert) {
		assert.equal(this.oTable.getSelectionBehavior(), library.SelectionBehavior.RowSelector, "SelectionBehavior.RowSelector");
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		assert.equal(this.oTable.getSelectionBehavior(), library.SelectionBehavior.Row, "SelectionBehavior.Row");
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		assert.equal(this.oTable.getSelectionBehavior(), library.SelectionBehavior.RowOnly, "SelectionBehavior.RowOnly");
	});

	/**
	 * @deprecated As of version 1.21.2
	 */
	QUnit.test("Dirty", function(assert) {
		assert.equal(this.oTable.getDirty(), false, "Default dirty");
		assert.equal(this.oTable.getShowOverlay(), false, "Default showOverlay");
		this.oTable.setDirty(true);
		assert.equal(this.oTable.getDirty(), true, "Dirty set");
		assert.equal(this.oTable.getShowOverlay(), true, "ShowOverlay set");
	});

	/**
	 * @deprecated As of version 1.21.2
	 */
	QUnit.test("FixedRowCount", function(assert) {
		assert.equal(this.oTable.getFixedRowCount(), 0, "Default fixedRowCount");
		this.oTable.setFixedRowCount(5);
		assert.equal(this.oTable.getFixedRowCount(), 0, "FixedRowCount cannot be changed");
	});

	/**
	 * @deprecated As of version 1.21.2
	 */
	QUnit.test("FixedBottomRowCount", function(assert) {
		var done = assert.async();

		function doTest(oTable) {
			assert.equal(oTable.getFixedBottomRowCount(), 0, "Default fixedBottomRowCount");
			oTable.setFixedBottomRowCount(5);
			assert.equal(oTable.getFixedBottomRowCount(), 0, "FixedBottomRowCount cannot be changed");
			TableQUnitUtils.assertRenderedRows(assert, oTable, 0, 19, 1);
		}

		performTestAfterTableIsUpdated.call(this, doTest, done);
	});

	QUnit.test("EnableGrouping", function(assert) {
		assert.equal(this.oTable.getEnableGrouping(), false, "Default enableGrouping");
		this.oTable.setEnableGrouping(true);
		assert.equal(this.oTable.getEnableGrouping(), false, "EnableGrouping cannot be changed");
	});

	QUnit.test("getTotalSize", function(assert) {
		assert.expect(3);
		var done = assert.async();

		function doTest(oTable) {
			var oBinding = oTable.getBinding();
			oBinding.getTotalSize = function() {
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

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("CollapseRecursive property", function(assert) {
		assert.expect(7);
		var done = assert.async();

		function doTest(oTable) {
			var oBinding = oTable.getBinding();
			var bCollapseRecursive = false;
			oBinding.setCollapseRecursive = function(bParam) {
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

	QUnit.test("collapseAll", function(assert) {
		assert.expect(6);
		var done = assert.async();

		function doTest(oTable) {
			oTable.setFirstVisibleRow(2);
			var oBinding = oTable.getBinding();
			oBinding.collapseToLevel = function(iLevel) {
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

	QUnit.test("expandAll", function(assert) {
		assert.expect(5);
		var done = assert.async();

		function doTest(oTable) {
			var oBinding = oTable.getBinding();
			var oExpandLevelSpy = sinon.spy(oBinding, "expandToLevel");
			var oClearSelectionSpy = sinon.spy(oTable._getSelectionPlugin(), "clearSelection");

			oTable.setFirstVisibleRow(2);
			assert.ok(oTable.expandAll() === oTable, "ExpandAll returns a reference to the table");
			assert.ok(oExpandLevelSpy.calledOnce, "expandToLevel on Binding called once");
			assert.ok(oExpandLevelSpy.calledWith(3), "called with the correct parameter value");
			assert.ok(oClearSelectionSpy.calledOnce, "clearSelection called once");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row");
			oTable.unbindRows();
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("BindRows", function(assert) {
		var oInnerBindRows = this.spy(AnalyticalTable.prototype, "_bindRows");
		var oTable = new AnalyticalTable({
			rows: {path: "/modelData"},
			columns: [new AnalyticalColumn()]
		});

		assert.ok(oInnerBindRows.calledOnce, "bindRows was called");
		assert.ok(!!oTable.getBindingInfo("rows"), "BindingInfo available");

		oInnerBindRows.restore();
	});

	QUnit.test("BindRows - Update columns", function(assert) {
		var oBindingInfo = {path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"};

		function testRun(mTestSettings) {
			return new Promise(function(resolve) {
				var oTable = new AnalyticalTable({
					columns: [new AnalyticalColumn()]
				});

				if (mTestSettings.renderTable) {
					oTable.placeAt("qunit-fixture");
					Core.applyChanges();
				}

				var oUpdateColumnsSpy = sinon.spy(oTable, "_updateColumns");
				var oInvalidateSpy = sinon.spy(oTable, "invalidate");

				oTable.setModel(mTestSettings.model);
				if (mTestSettings.bindingInfo != null) {
					oTable.bindRows(mTestSettings.bindingInfo);
				}

				TableUtils.Binding.metadataLoaded(oTable).then(function() {
					mTestSettings.metadataLoaded(oUpdateColumnsSpy, oInvalidateSpy, mTestSettings.renderTable);
					oTable.destroy();
					resolve();
				}).catch(function() {
					mTestSettings.metadataLoaded(oUpdateColumnsSpy, oInvalidateSpy, mTestSettings.renderTable);
					oTable.destroy();
					resolve();
				});
			});
		}

		function test(mTestSettings) {
			return new Promise(function(resolve) {
				mTestSettings.renderTable = true;
				testRun(mTestSettings).then(function() {
					mTestSettings.renderTable = false;
					return testRun(mTestSettings);
				}).then(resolve);
			});
		}

		return test({
			bindingInfo: oBindingInfo,
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.notCalled, "No Model -> Columns not updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.notCalled, "Table is rendered -> Not invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		}).then(function() {
			return test({
				model: new ODataModelV2(sServiceURI),
				metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
					assert.ok(oUpdateColumnsSpy.notCalled, "No BindingInfo -> Columns not updated");
					if (bTableIsRendered) {
						assert.ok(oInvalidateSpy.notCalled, "Table is rendered -> Not invalidated");
					} else {
						assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
					}
				}
			});
		}).then(function() {
			return test({
				bindingInfo: oBindingInfo,
				model: new ODataModelV2(sServiceURI),
				metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
					assert.ok(oUpdateColumnsSpy.calledOnce, "V2 model -> Columns updated");
					if (bTableIsRendered) {
						assert.ok(oInvalidateSpy.calledOnce, "Table is rendered -> Invalidated");
					} else {
						assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
					}
				}
			});
		});
	});

	/** @deprecated As of version 1.48 */
	QUnit.test("BindRows - Update columns with ODataModel V1 (legacy)", function(assert) {
		var oBindingInfo = {path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"};

		function testRun(mTestSettings) {
			return new Promise(function(resolve) {
				var oTable = new AnalyticalTable({
					columns: [new AnalyticalColumn()]
				});

				if (mTestSettings.renderTable) {
					oTable.placeAt("qunit-fixture");
					Core.applyChanges();
				}

				var oUpdateColumnsSpy = sinon.spy(oTable, "_updateColumns");
				var oInvalidateSpy = sinon.spy(oTable, "invalidate");

				oTable.setModel(mTestSettings.model);
				if (mTestSettings.bindingInfo != null) {
					oTable.bindRows(mTestSettings.bindingInfo);
				}

				TableUtils.Binding.metadataLoaded(oTable).then(function() {
					mTestSettings.metadataLoaded(oUpdateColumnsSpy, oInvalidateSpy, mTestSettings.renderTable);
					oTable.destroy();
					resolve();
				}).catch(function() {
					mTestSettings.metadataLoaded(oUpdateColumnsSpy, oInvalidateSpy, mTestSettings.renderTable);
					oTable.destroy();
					resolve();
				});
			});
		}

		function test(mTestSettings) {
			return new Promise(function(resolve) {
				mTestSettings.renderTable = true;
				testRun(mTestSettings).then(function() {
					mTestSettings.renderTable = false;
					return testRun(mTestSettings);
				}).then(resolve);
			});
		}

		return test({
			bindingInfo: oBindingInfo,
			model: new ODataModel(sServiceURI, {loadMetadataAsync: false}),
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.calledOnce, "V1 model; Load metadata synchronously -> Columns updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.calledOnce, "Table is rendered -> Invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		}).then(function() {
			return test({
				bindingInfo: oBindingInfo,
				model: new ODataModel(sServiceURI, {loadMetadataAsync: true}),
				metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
					assert.ok(oUpdateColumnsSpy.calledOnce, "V1 model; Load metadata asynchronously -> Columns updated");
					if (bTableIsRendered) {
						assert.ok(oInvalidateSpy.calledOnce, "Table is rendered -> Invalidated");
					} else {
						assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
					}
				}
			});
		});
	});

	QUnit.test("Binding events", function(assert) {
		var oChangeSpy = this.spy();
		var oDataRequestedSpy = this.spy();
		var oDataReceivedSpy = this.spy();
		var oSelectionChangedSpy = this.spy();

		this.oTable.bindRows({
			path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
			events: {
				change: oChangeSpy,
				dataRequested: oDataRequestedSpy,
				dataReceived: oDataReceivedSpy,
				selectionChanged: oSelectionChangedSpy
			}
		});

		var oBinding = this.oTable.getBinding();
		oBinding.fireEvent("change");
		oDataRequestedSpy.resetHistory(); // The AnalyticalBinding tends to send multiple requests initially.
		oBinding.fireEvent("dataRequested");
		oBinding.fireEvent("dataReceived");
		oBinding.fireEvent("selectionChanged");

		assert.ok(oChangeSpy.calledOnce, "The original change event listener was called once");
		assert.ok(oDataRequestedSpy.calledOnce, "The original dataRequested event listener was called once");
		assert.ok(oDataReceivedSpy.calledOnce, "The original dataReceived event listener was called once");
		assert.ok(oSelectionChangedSpy.calledOnce, "The original selectionChanged event listener was called once");
	});

	QUnit.module("GroupHeaderMenu", {
		beforeEach: function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
			this.oTable = createTable.call(this);
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Mobile", function(assert) {
		var done = assert.async();

		var oShowGroupMenuButton = sinon.stub(TableUtils.Grouping, "showGroupMenuButton");
		oShowGroupMenuButton.returns(true);
		this.oTable.invalidate();
		Core.applyChanges();

		function doTest(oTable) {
			oTable.$().find(".sapUiTableGroupMenuButton").trigger("tap");
			assert.ok(oTable._oCellContextMenu.bOpen, "Menu is open");
			oShowGroupMenuButton.restore();
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("Localization", function(assert) {
		var done = assert.async();

		function doTest(oTable) {
			assert.strictEqual(oTable._mGroupHeaderMenuItems, null, "Group header menu items do not exist");

			TableUtils.Menu.openContextMenu(oTable, {
				target: oTable.getRows()[0].getCells()[4].getDomRef(),
				preventDefault: () => {}
			});
			assert.notEqual(oTable._mGroupHeaderMenuItems, null, "Group header menu items exist");

			oTable._adaptLocalization(true, false).then(function() {
				assert.notEqual(oTable._mGroupHeaderMenuItems, null, "Group header menu items exist");
			}).then(function() {
				return oTable._adaptLocalization(false, true);
			}).then(function() {
				assert.strictEqual(oTable._mGroupHeaderMenuItems, null, "Group header menu items do not exist");
				done();
			});
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.module("AnalyticalTable with ODataModel v2", {
		beforeEach: function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	/**
	 * @deprecated As of Version 1.117
	 */
	QUnit.test("Grouping and focus handling - legacy menu", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			var mSettings = {
				columns: [
					createColumn({name: "CostCenter"}),
					createColumn({name: "PlannedCosts"}),
					createColumn({name: "Currency"})
				]
			};
			this.oTable = createTable.call(this, mSettings);

			var fnHandler1 = function() {
				var oColumn = this.oTable.getColumns()[0];
				oColumn.attachEventOnce("columnMenuOpen", () => {
					TableQUnitUtils.wait(0).then(() => {
						this.oTable.getBinding().attachChange(() => {
							this.oTable.attachEventOnce("rowsUpdated", () => {
								assert.deepEqual(document.activeElement, this.oTable.getDomRef("rowsel0"));
								done();
							});
						});

						oColumn.getMenu().getItems()[3].fireSelect();
					});
				});

				oColumn._openHeaderMenu(oColumn.getDomRef());
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}.bind(this));
	});

	QUnit.test("Grouping and focus handling", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			var mSettings = {
				columns: [
					createColumn({name: "CostCenter"}),
					createColumn({name: "PlannedCosts"}),
					createColumn({name: "Currency"})
				]
			};
			this.oTable = createTable.call(this, mSettings);

			var fnHandler1 = function() {
				var oColumn = this.oTable.getColumns()[0];
				var oColumnMenu = new ColumnMenu();
				oColumn.setHeaderMenu(oColumnMenu);

				oColumnMenu.attachEventOnce("beforeOpen", () => {
					TableQUnitUtils.wait(0).then(() => {
						var oGroupButton = oColumnMenu._getAllEffectiveQuickActions()[2].getContent()[0];
						oGroupButton.$().trigger("tap");

						this.oTable.getBinding().attachChange(() => {
							this.oTable.attachEventOnce("rowsUpdated", () => {
								assert.deepEqual(document.activeElement, this.oTable.getDomRef("rowsel0"));
								done();
							});
						});
					});
				});

				oColumn._openHeaderMenu(oColumn.getDomRef());
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}.bind(this));
	});

	QUnit.test("getAnalyticalInfoOfRow", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			this.oTable = createTable.call(this);

			var fnHandler1 = function() {
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

				oInfo = this.oTable.getAnalyticalInfoOfRow(new Row());
				assert.ok(!oInfo, "Row does not belong to the table");

				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			var fnHandler2 = function() {
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

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}.bind(this));
	});

	/**
	 * @deprecated As of version 1.44
	 */
	QUnit.test("TreeAutoExpandMode property", function(assert) {
		var done = assert.async();
		var oExpandMode = TreeAutoExpandMode;

		function checkMode(mode, text) {
			assert.equal(mode.Bundled, "Bundled", text + " - Mode Bundled");
			assert.equal(mode.Sequential, "Sequential", text + " - Mode Sequential");
		}

		sap.ui.require(["sap/ui/table/TreeAutoExpandMode"], function(oMode) {
			checkMode(oMode, "Module sap/ui/table/TreeAutoExpandMode");
			assert.ok(sap.ui.table.TreeAutoExpandMode === oMode, "Namespace sap.ui.table.TreeAutoExpandMode");
			assert.ok(sap.ui.table.TreeAutoExpandMode === oExpandMode, "sap.ui.table.TreeAutoExpandMode === sap.ui.model.TreeAutoExpandMode");
			done();
		});

		this.oTable = new AnalyticalTable();
		var oBindingInfo = {};
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Default");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode(oExpandMode.Sequential);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Sequential, "Property AutoExpandMode - Sequential");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode(oExpandMode.Bundled);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Bundled");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode("DOES_NOT_EXIST");
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Wrong");
	});

	/**
	 * @deprecated As of version 1.44
	 */
	QUnit.test("SumOnTop property", function(assert) {
		this.oTable = new AnalyticalTable();
		var oBindingInfo = {};
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, false, "Property SumOnTop - Default");

		oBindingInfo = {};
		this.oTable.setSumOnTop(true);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, true, "Property SumOnTop - Custom");
	});

	/**
	 * @deprecated As of version 1.44
	 */
	QUnit.test("NumberOfExpandedLevels property", function(assert) {
		this.oTable = new AnalyticalTable();
		var oBindingInfo = {};
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 0, "Property NumberOfExpandedLevels - Default");

		this.oTable._aGroupedColumns = new Array(4);
		oBindingInfo = {};
		this.oTable.setNumberOfExpandedLevels(4);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 4, "Property NumberOfExpandedLevels - Custom");

		this.oTable._aGroupedColumns = [];
		oBindingInfo = {};
		this.oTable.setNumberOfExpandedLevels(4);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 0, "Property NumberOfExpandedLevels (no grouped columns) - Custom");
	});

	QUnit.test("Simple expand/collapse", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			this.oTable = createTable.call(this);

			var fnHandler1 = function() {
				var oBinding = this.oTable.getBinding();

				/** @deprecated As of Version 1.44 */
				assert.equal(oBinding.mParameters.numberOfExpandedLevels, 0, "NumberOfExpandedLevels is 0");

				var oContext = this.oTable.getContextByIndex(0);
				assert.equal(oContext.getProperty("ActualCosts"), "1588416", "First row data is correct");

				oContext = this.oTable.getContextByIndex(8);
				assert.equal(oContext.getProperty("CostCenterText"), "Marketing Canada", "Last data row is correct");

				oContext = this.oTable._getFixedBottomRowContexts()[0].context;
				assert.equal(oContext.getProperty("ActualCosts"), "11775332", "Sum Row is correct");

				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			var fnHandler2 = function() {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");
				var oContext = this.oTable.getContextByIndex(0);
				var oSumContext = this.oTable.getContextByIndex(13);
				assert.deepEqual(oContext, oSumContext, "Subtotal-Row context is correct");

				this.oTable.collapse(0);
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}.bind(this));
	});

	QUnit.test("Row#expand & Row#collapse", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			this.oTable = createTable.call(this);

			var fnHandler1 = function() {
				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.getRows()[0].expand();
			};

			var fnHandler2 = function() {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");
				var oContext = this.oTable.getContextByIndex(0);
				var oSumContext = this.oTable.getContextByIndex(13);
				assert.deepEqual(oContext, oSumContext, "Subtotal-Row context is correct");
				assert.equal(this.oTable._getTotalRowCount(), 23, "Total row count");

				attachEventHandler(this.oTable, 0, fnHandler3, this);
				this.oTable.getRows()[0].collapse();
			};

			var fnHandler3 = function() {
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				assert.equal(this.oTable._getTotalRowCount(), 10, "Total row count");
				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}.bind(this));
	});

	QUnit.test("ProvideGrandTotals = false: No Sum row available", function(assert) {
		var done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			this.oTable = createTable.call(this);

			var fnHandler1 = function() {
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

			var fnHandler2 = function() {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");

				var oContext = this.oTable.getContextByIndex(0);
				var oSumContext = this.oTable.getContextByIndex(13);

				assert.notEqual(oContext.getPath(), oSumContext.getPath(), "No Subtotal Row Context inserted");

				this.oTable.collapse(0);
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows({
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					provideGrandTotals: false
				}
			});

		}.bind(this));
	});

	QUnit.test("Row state", function(assert) {
		var done = assert.async();

		this.oModel.metadataLoaded().then(function() {
			this.oTable = createTable.call(this);

			var fnHandler1 = function() {
				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.getRows()[0].expand();
			};

			var fnHandler2 = function() {
				var oExpandedGroupRow = this.oTable.getRows()[0];
				assert.strictEqual(oExpandedGroupRow.isGroupHeader(), true, "Group row (expanded): Is group header");
				assert.strictEqual(oExpandedGroupRow.getLevel(), 1, "Group row (expanded): Level");
				assert.strictEqual(oExpandedGroupRow.isExpandable(), true, "Group row (expanded): Expandable");
				assert.strictEqual(oExpandedGroupRow.isExpanded(), true, "Group row (expanded): Expanded");
				assert.strictEqual(
					oExpandedGroupRow.getTitle(),
					this.oTable.getBinding().getGroupName(oExpandedGroupRow.getBindingContext(), oExpandedGroupRow.getLevel()),
					"Group row (expanded): Title"
				);

				var oCollapsedGroupRow = this.oTable.getRows()[1];
				assert.strictEqual(oCollapsedGroupRow.isGroupHeader(), true, "Group row (collapsed): Is group header");
				assert.strictEqual(oCollapsedGroupRow.getLevel(), 2, "Group row (collapsed): Level");
				assert.strictEqual(oCollapsedGroupRow.isExpandable(), true, "Group row (collapsed): Expandable");
				assert.strictEqual(oCollapsedGroupRow.isExpanded(), false, "Group row (collapsed): Expanded");
				assert.strictEqual(
					oCollapsedGroupRow.getTitle(),
					this.oTable.getBinding().getGroupName(oCollapsedGroupRow.getBindingContext(), oCollapsedGroupRow.getLevel()),
					"Group row (collapsed): Title"
				);

				var oGroupSummaryRow = this.oTable.getRows()[13];
				assert.strictEqual(oGroupSummaryRow.isGroupSummary(), true, "Group summary row: Is group summary");
				assert.strictEqual(oGroupSummaryRow.getLevel(), 2, "Group summary row: Level");

				var oTotalSummaryRow = this.oTable.getRows()[19];
				assert.strictEqual(oTotalSummaryRow.isTotalSummary(), true, "Total summary row: Is total summary");
				assert.strictEqual(oTotalSummaryRow.getLevel(), 1, "Total summary row: Level");

				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");
		}.bind(this));
	});

	QUnit.module("AnalyticalColumn", {
		beforeEach: function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("_setGrouped", function(assert) {
		var done = assert.async();
		this.oTable = createTable.call(this);
		var oColumn = this.oTable.getColumns()[1];

		assert.ok(!oColumn.getGrouped(), "The column is not grouped initially");
		this.oTable.attachGroup(function(oEvent) {
			assert.ok(oEvent.getParameter("column") === oColumn &&
					  oEvent.getParameter("groupedColumns") === this.oTable._aGroupedColumns &&
					  oEvent.getParameter("type") === "group", "The group event is fired with the correct parameters");
			done();
		}.bind(this));
		oColumn._setGrouped(true);
		assert.ok(oColumn.getGrouped(), "The column is grouped");
	});

	QUnit.test("Cell content visibility settings", function(assert) {
		this.oTable = createTable.call(this);
		var oColumn = this.oTable.getColumns()[1];

		oColumn._setCellContentVisibilitySettings({
			standard: false,
			groupHeader: {nonExpandable: false, expanded: false, collapsed: false},
			summary: {group: false, total: false}
		});

		assert.deepEqual(oColumn._getCellContentVisibilitySettings(), {
			standard: true,
			groupHeader: {nonExpandable: true, expanded: true, collapsed: true},
			summary: {group: true, total: true}
		}, "Settings cannot be changed from outside");
	});

	QUnit.module("AnalyticalColumn - Column Menu", {
		beforeEach: function() {
			this._oTable = new AnalyticalTable();
			this._oTable.addColumn(createColumn({name: "CostCenter"}));

			this._oTable.removeColumn = function(oColumn) {
				return this.removeAggregation('columns', oColumn);
			};

			// no real binding is required here. Instead mock a binding object
			sinon.stub(this._oTable, "getBinding").callsFake(function() {
				var oBinding = {};
				var aProperties = [
					{name: "m1", type: "measure", filterable: false},
					{name: "m2_filterable", type: "measure", filterable: true},
					{name: "d1", type: "dimension", filterable: false},
					{name: "d2_filterable", type: "dimension", filterable: true}
				];

				oBinding.isMeasure = function(sPropertyName) {
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].name === sPropertyName && aProperties[i].type === "measure") {
							return true;
						}
					}
					return false;
				};

				oBinding.getProperty = function(sPropertyName) {
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].name === sPropertyName) {
							return aProperties[i];
						}
					}
				};

				oBinding.getFilterablePropertyNames = function() {
					var aPropertyNames = [];
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].filterable === true) {
							aPropertyNames.push(aProperties[i].name);
						}
					}
					return aPropertyNames;
				};

				oBinding.getAnalyticalQueryResult = function() {
					return {
						findMeasureByPropertyName: function(arg1) {
							return {value: true, argument: arg1};
						}
					};
				};

				return oBinding;
			});
			this._oColumn = new AnalyticalColumn();
		},
		afterEach: function() {
			this._oTable.getBinding.restore();
			this._oColumn.destroy();
			this._oTable.destroy();
		}
	});

	QUnit.test("_isAggregatableByMenu", function(assert) {
		var oColumn = this._oTable.getColumns()[0];

		var oReturnValue = oColumn._isAggregatableByMenu();
		assert.ok(oReturnValue.value, "", "findMeasureByPropertyName is called");
		assert.equal(oReturnValue.argument, "CostCenter", "findMeasureByPropertyName is called with the correct parameter");
	});

	QUnit.test("Pre-Check Menu Item Creation without Parent", function(assert) {

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

	QUnit.test("Pre-Check Menu Item Creation with Parent", function(assert) {

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
		assert.ok(this._oColumn.isFilterableByMenu(), "Measure fields marked as filterable --> still filterable by menu: " +
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

	QUnit.module("BusyIndicator", {
		before: function() {
			this.oDataModel = new ODataModelV2(sServiceURI);

			TableQUnitUtils.setDefaultSettings({
				id: "table",
				models: this.oDataModel,
				columns: [
					createColumn({grouped: true, name: "CostCenter"}),
					createColumn({name: "CostCenterText"}),
					createColumn({grouped: true, name: "CostElement"}),
					createColumn({name: "CostElementText"}),
					createColumn({grouped: true, name: "Currency"}),
					createColumn({summed: true, name: "ActualCosts"}),
					createColumn({summed: true, name: "PlannedCosts"})
				]
			});

			return this.oDataModel.metadataLoaded();
		},
		afterEach: function() {
			this.getTable().destroy();
		},
		after: function() {
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertState: function(assert, sMessage, mExpectation) {
			var oTable = this.getTable();

			assert.deepEqual({
				pendingRequests: oTable._hasPendingRequests(),
				busy: oTable.getBusy()
			}, mExpectation, sMessage);
		},
		getTable: function() {
			return Element.getElementById("table");
		}
	});

	QUnit.test("Initial request; Automatic BusyIndicator disabled; Batch requests disabled", function(assert) {
		var done = assert.async();
		var that = this;
		var iCurrentRequest = 0;
		var iExpectedRequestCount = 2;

		assert.expect(7);

		TableQUnitUtils.createTable(AnalyticalTable, {
			busyStateChanged: function() {
				assert.ok(false, "The 'busyStateChanged' event should not be fired");
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: false});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: false});
						iCurrentRequest++;

						if (iCurrentRequest === iExpectedRequestCount) {
							setTimeout(function() {
								that.assertState(assert, "200ms after last 'dataReceived'", {pendingRequests: false, busy: false});
								done();
							}, 200);
						}
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: false});
	});

	QUnit.test("Initial request; Automatic BusyIndicator enabled; Batch requests disabled", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(8);

		TableQUnitUtils.createTable(AnalyticalTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: true});
	});

	QUnit.test("Initial request; Automatic BusyIndicator enabled; Batch requests enabled", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(5);

		TableQUnitUtils.createTable(AnalyticalTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				},
				parameters: {
					useBatchRequests: true
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: false, busy: false});
	});

	QUnit.test("Rebind after 'dataRequested'", function(assert) {
		var done = assert.async();
		var that = this;
		var bRebound = false;

		assert.expect(5);

		TableQUnitUtils.createTable(AnalyticalTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});

						if (!bRebound) {
							var oBindingInfo = that.getTable().getBindingInfo("rows");

							oBindingInfo.parameters = {useBatchRequests: true};
							bRebound = true;
							that.getTable().bindRows(oBindingInfo);
						}
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});
	});

	QUnit.module("NoData", {
		before: function() {
			this.oDataModel = new ODataModelV2(sServiceURI);

			TableQUnitUtils.setDefaultSettings({
				models: this.oDataModel,
				columns: [
					createColumn({grouped: true, name: "CostCenter"}),
					createColumn({name: "CostCenterText"}),
					createColumn({grouped: true, name: "CostElement"}),
					createColumn({name: "CostElementText"}),
					createColumn({grouped: true, name: "Currency"}),
					createColumn({summed: true, name: "ActualCosts"}),
					createColumn({summed: true, name: "PlannedCosts"})
				]
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				rows: {
					path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
					parameters: {
						useBatchRequests: true
					}
				}
			});
			this.iNoDataVisibilityChanges = 0;

			return this.oTable.qunit.whenRenderingFinished().then(function() {
				this.oObserver = new MutationObserver(function(aRecords) {
					var oRecord = aRecords[0];
					var bNoDataWasVisible = oRecord.oldValue.includes("sapUiTableEmpty");
					var bNoDataIsVisible = oRecord.target.classList.contains("sapUiTableEmpty");

					if (bNoDataWasVisible !== bNoDataIsVisible) {
						this.iNoDataVisibilityChanges++;
					}
				}.bind(this));

				this.oObserver.observe(this.oTable.getDomRef(), {attributes: true, attributeOldValue: true, attributeFilter: ["class"]});
			}.bind(this));
		},
		afterEach: function() {
			if (this.oObserver) {
				this.oObserver.disconnect();
			}
			this.oTable.destroy();
		},
		after: function() {
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertNoDataVisibilityChangeCount: function(assert, iCount) {
			assert.equal(this.iNoDataVisibilityChanges, iCount, "Number of NoData visibility changes");
			this.resetNoDataVisibilityChangeCount();
		},
		resetNoDataVisibilityChangeCount: function() {
			this.iNoDataVisibilityChanges = 0;
		}
	});

	QUnit.test("After rendering with data", function(assert) {
		var pDone;

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					useBatchRequests: true
				}
			}
		}, function(oTable) {
			pDone = new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, false);
			});
		});

		return pDone;
	});

	QUnit.test("After rendering without data", function(assert) {
		var pDone;

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					useBatchRequests: true
				},
				filters: [new Filter({path: "CostCenter", operator: "eq", value1: "DoesNotExist"})]
			}
		}, function(oTable) {
			pDone = new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
			});
		});

		return pDone;
	});

	QUnit.test("After rendering without data but with the grand total", function(assert) {
		var pDone;

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					useBatchRequests: true
				},
				filters: [new Filter({path: "CostCenter", operator: "eq", value1: "DoesNotExistButReturnsGrandTotal"})]
			}
		}, function(oTable) {
			pDone = new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
			});
		});

		return pDone;
	});

	QUnit.test("Bind/Unbind", function(assert) {
		var oBindingInfo = this.oTable.getBindingInfo("rows");
		var that = this;

		this.oTable.unbindRows();
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.bindRows(oBindingInfo);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
		});
	});

	QUnit.test("Rerender while binding/unbinding", function(assert) {
		var oBindingInfo = this.oTable.getBindingInfo("rows");
		var that = this;

		this.oTable.unbindRows();
		this.oTable.invalidate();
		Core.applyChanges();
		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.invalidate();
			Core.applyChanges();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Rerender");
			that.assertNoDataVisibilityChangeCount(assert, 0);
			that.oTable.bindRows(oBindingInfo);
			that.oTable.invalidate();
			Core.applyChanges();
		}).then(this.oTable.qunit.whenBindingChange).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.invalidate();
			Core.applyChanges();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Rerender");
			that.assertNoDataVisibilityChangeCount(assert, 0);
		});
	});

	QUnit.module("TreeBindingProxy", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
			this.oProxy = this.oTable._oProxy;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Proxy Initialisation", function(assert) {
		var oTable = new AnalyticalTable();
		assert.ok(oTable._oProxy, "TreeTable has a proxy object");
		assert.equal(oTable._oProxy._sAggregation, "rows", "Proxy has correct aggregation");
		assert.equal(oTable._oProxy._oControl, oTable, "Proxy has correct control associated");
		oTable.destroy();
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("Correct Proxy Calls - collapseRecursive property", function(assert) {
		// Initialise spies
		var fnSetCollapseRecursiveSpy = sinon.spy(this.oProxy, "setCollapseRecursive");

		// Stub oTable.getBinding
		var fnGetBinding = sinon.stub(this.oTable, "getBinding");
		fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return undefined;
					}
				};
			},
			getNodes: function() {
				return [];
			}
		});

		// setCollapseRecursive
		this.oTable.setCollapseRecursive(true);
		assert.ok(fnSetCollapseRecursiveSpy.called, "proxy#setCollapseRecursive was called");

		// Restore spies and stubs
		fnSetCollapseRecursiveSpy.restore();

		fnGetBinding.restore();
	});

	QUnit.test("Correct Proxy Calls", function(assert) {
		// Initialise spies
		var fnGetContextsSpy = sinon.spy(this.oProxy, "getContexts");
		var fnExpandSpy = sinon.spy(this.oProxy, "expand");
		var fnCollapseSpy = sinon.spy(this.oProxy, "collapse");
		var fnExpandToLevelSpy = sinon.spy(this.oProxy, "expandToLevel");
		var fnCollapseAllSpy = sinon.spy(this.oProxy, "collapseAll");
		var fnIsExpandedSpy = sinon.spy(this.oProxy, "isExpanded");
		var fnGetContextByIndexSpy = sinon.spy(this.oProxy, "getContextByIndex");
		var fnGetNodeByIndexSpy = sinon.spy(this.oProxy, "getNodeByIndex");

		// Stub oTable.getBinding
		var fnGetBinding = sinon.stub(this.oTable, "getBinding");
		fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return undefined;
					}
				};
			},
			getNodes: function() {
				return [];
			}
		});

		// _getContexts
		assert.equal(this.oTable._getContexts(0).length, 0, "TreeTable has no contexts");
		assert.notOk(fnGetContextsSpy.called, "proxy#getContexts was not called");

		// expand
		this.oTable.expand(0);
		assert.ok(fnExpandSpy.called, "proxy#expand was called");

		// collapse
		this.oTable.collapse(0);
		assert.ok(fnCollapseSpy.called, "proxy#collapse was called");

		// getContextByIndex
		this.oTable.getContextByIndex(0);
		assert.ok(fnGetContextByIndexSpy.called, "proxy#getContextByIndex was called");

		// getContextInfoByIndex
		this.oTable.getContextInfoByIndex(0);
		assert.ok(fnGetNodeByIndexSpy.called, "proxy#getNodeByIndex was called");

		// expandToLevel
		this.oTable.expandAll(0);
		assert.ok(fnExpandToLevelSpy.called, "proxy#expandToLevel was called");

		// collapseAll
		this.oTable.collapseAll();
		assert.ok(fnCollapseAllSpy.called, "proxy#collapseAll was called");

		// isExpanded
		this.oTable.isExpanded(0);
		assert.ok(fnIsExpandedSpy.called, "proxy#isExpanded was called");

		// Restore spies and stubs
		fnGetContextsSpy.restore();
		fnExpandSpy.restore();
		fnCollapseSpy.restore();
		fnExpandToLevelSpy.restore();
		fnCollapseAllSpy.restore();
		fnIsExpandedSpy.restore();
		fnGetContextByIndexSpy.restore();
		fnGetNodeByIndexSpy.restore();

		fnGetBinding.restore();
	});
});