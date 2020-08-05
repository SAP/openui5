/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/model/analytics/odata4analytics",
	"sap/ui/model/analytics/AnalyticalBinding",
	"sap/ui/model/analytics/AnalyticalTreeBindingAdapter",
	"sap/ui/model/analytics/ODataModelAdapter",
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterProcessor',
	'sap/ui/model/Sorter',
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	'sap/ui/model/TreeAutoExpandMode',
	"sap/ui/core/qunit/analytics/o4aMetadata",
	"sap/ui/core/qunit/analytics/TBA_ServiceDocument",
	"sap/ui/core/qunit/analytics/TBA_NoBatch",
	"sap/ui/core/qunit/analytics/TBA_Batch_Contexts",
	"sap/ui/core/qunit/analytics/TBA_Batch_ExpandCollapseToggle",
	"sap/ui/core/qunit/analytics/TBA_Batch_Filter",
	"sap/ui/core/qunit/analytics/TBA_Batch_Sort"
], function (jQuery, Log, odata4analytics, AnalyticalBinding, AnalyticalTreeBindingAdapter,
		ODataModelAdapter, ChangeReason, Filter, FilterOperator, FilterProcessor, Sorter,
		ODataModelV1, ODataModelV2, TreeAutoExpandMode, o4aFakeService) {
	/*global QUnit, sinon */
	/*eslint camelcase: 0, max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	var iGroupMembersQueryType = AnalyticalBinding._requestType.groupMembersQuery,
		sServiceURL = "http://o4aFakeService:8080/",
		// Analytical info for dimensions
		oCostCenterGrouped = {
			name: "CostCenter",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oControllingArea = {
			name: "ControllingArea",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostCenterUngrouped = {
			name: "CostCenter",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostElementGrouped = {
			name: "CostElement",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostElementUngrouped = {
			name: "CostElement",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCurrencyGrouped = {
			name: "Currency",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCurrencyUngrouped = {
			name: "Currency",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oControllingAreaNoTextGrouped = {
			name: "ControllingAreaNoText",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oControllingAreaNoTextNoLabelGrouped = {
			name: "ControllingAreaNoTextNoLabel",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oControllingAreaNoTextEmptyLabelGrouped = {
			name: "ControllingAreaNoTextEmptyLabel",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oControllingAreaWithTextEmptyLabelGrouped = {
			name: "ControllingAreaWithTextEmptyLabel",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		// Analytical info for measures
		oActualCostsTotal = {
			name: "ActualCosts",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: true,
			visible: true
		},
		oActualPlannedCostsDifferenceTotal = {
			name: "ActualPlannedCostsDifference",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: true,
			visible: true
		},
		oActualPlannedCostsPercentage = {
			name: "ActualPlannedCostsPercentage",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oPlannedCostsTotal = {
			name: "PlannedCosts",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: true,
			visible: true
		},
		// Analytical info for other properties
		oControllingAreaText2 = {
			name: "ControllingAreaText2",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostElementText = {
			name: "CostElementText",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		// Analytical information for properties of "TypeWithHierarchies"
		oCostCenterDrillstate = {
			name: "CostCenter_Drillstate",
			grouped: false,
			inResult: false,
			level : 2,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostCenterNodeID = {
			name: "CostCenter_NodeID",
			grouped: false,
			inResult: false,
			level : 2,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostCenterNodeIDExternalKey = {
			name: "CostCenter_NodeIDExt",
			grouped: false,
			inResult: false,
			level : 2,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostCenterNodeIDGrouped = {
			name: "CostCenter_NodeID",
			grouped: true,
			inResult: false,
			level : 0,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostCenterNodeIDText = {
			name: "CostCenter_NodeText",
			grouped: false,
			inResult: false,
			level : 2,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostCenterNodeIDTextNoLevel = {
			name: "CostCenter_NodeText",
			grouped: true,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		oCostElement = {
			name: "CostElement_NodeID",
			grouped: false,
			inResult: false,
			level : 1,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},

		sPath = "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',"
			+ "P_CostCenterTo='999-9999')/Results",
		sPathHierarchy = "/TypeWithHierarchiesResults";

	/*
	 * If <code>iVersion !== 1 && !fnODataV2Callback</code>, a <code>Promise</code> is returned that
	 * resolves with the new binding as soon as metadata has been loaded.
	 */
	function setupAnalyticalBinding(iVersion, mParameters, fnODataV2Callback, aAnalyticalInfo,
			sBindingPath, bSkipInitialize, aSorters, aFilters) {
		var oBinding,
			oModel;

		mParameters = mParameters || {};
		aAnalyticalInfo = aAnalyticalInfo
			|| [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped, oActualCostsTotal];

		if (iVersion === 1) {
			oModel = new ODataModelV1(sServiceURL, {
				json: true,
				tokenHandling: false
			});

		} else {
			oModel = new ODataModelV2(sServiceURL, {
				tokenHandling: false,
				json: true
			});
		}

		ODataModelAdapter.apply(oModel);
		oBinding = new AnalyticalBinding(oModel, sBindingPath || sPath, null, aSorters || [],
			aFilters || [], /*mParameters*/ {
				analyticalInfo : aAnalyticalInfo,
				autoExpandMode : mParameters.autoExpandMode,
				custom: mParameters.custom || undefined,
				numberOfExpandedLevels: mParameters.numberOfExpandedLevels || 0,
				noPaging: mParameters.noPaging || false,
				provideGrandTotals : "provideGrandTotals" in mParameters
					? mParameters.provideGrandTotals
					: undefined,
				select: mParameters.select,
				useBatchRequests: "useBatchRequests" in mParameters
					? mParameters.useBatchRequests
					: true
			}
		);
		AnalyticalTreeBindingAdapter.apply(oBinding);

		//V1 => synchronous metadata, initialize the binding directly
		if (iVersion === 1) {
			if (!bSkipInitialize) {
				oBinding.initialize();
			}
			return {
				binding : oBinding,
				model : oModel};
		} else if (fnODataV2Callback) {
			oModel.attachMetadataLoaded(function () {
				if (!bSkipInitialize) {
					oBinding.initialize();
				}
				fnODataV2Callback(oBinding, oModel);
			});
		} else {
			return oModel.metadataLoaded().then(function () {
				if (!bSkipInitialize) {
					oBinding.initialize();
				}
				return oBinding;
			});
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.AnalyticalBinding", {
		afterEach : function (assert) {
			// this would ruin AnalyticalTable.qunit.js in testsuite4analytics
//			XMLHttpRequest.restore();
			this._oSandbox.verifyAndRestore();
		},

		beforeEach : function () {
			this._oSandbox = sinon.sandbox.create({
				injectInto : this,
				properties : ["mock", "spy", "stub"]
			});
			this.oLogMock = this.mock(AnalyticalBinding.Logger);
			this.oLogMock.expects("warning").atMost(1)
				.withExactArgs("default count mode is ignored; OData requests will include"
					+ " $inlinecout options");
			this.oLogMock.expects("error").never();

			o4aFakeService.fake({
				baseURI: sServiceURL
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("Eventing - ODataModel V1 - DataRequested and DataReceived", function (assert) {
		var done = assert.async(),
			oBinding,
			oModel,
			oRequestedSpy,
			oReceivedSpy,
			oRequestSentSpy,
			oRequestCompletedSpy,
			oSetupBinding;

		// this.oLogMock.expects("warning")
		// 	.withExactArgs("EventProvider sap.ui.model.odata.ODataModel "
		// 		+ "path /$metadata should be absolute if no Context is set");


		oSetupBinding = setupAnalyticalBinding(1, {});
		oBinding = oSetupBinding.binding;
		oModel = oSetupBinding.model;

		oRequestedSpy = sinon.spy(oBinding, 'fireDataRequested');
		oReceivedSpy = sinon.spy(oBinding, 'fireDataReceived');
		oRequestSentSpy = sinon.spy(oModel, 'fireRequestSent');
		oRequestCompletedSpy = sinon.spy(oModel, 'fireRequestCompleted');

		oBinding.attachChange(fnChangeHandler1);
		oBinding.getContexts(0, 20, 100);

		// trigger timer (AB uses delayedCall to process batch request queue)
		function fnChangeHandler1() {
			oBinding.detachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 100);

			assert.equal(oRequestedSpy.callCount, 1,
				"After Initial Loading: Number of dataRequested Events = 1");
			assert.equal(oReceivedSpy.callCount, 1,
				"After Initial Loading: Number of dataReceived Events = 1");

			assert.equal(oRequestSentSpy.callCount, 1,
				"After Initial Loading: Number of requestSent Events = 1");
			assert.equal(oRequestCompletedSpy.callCount, 1,
				"After Initial Loading: Number of requestCompleted Events = 1");

			oBinding.attachChange(fnChangeHandler2);
			oBinding.expand(0);
		}

		function fnChangeHandler2() {
			oBinding.detachChange(fnChangeHandler2);

			// register for completed event on the model
			// change event will be raised BEFORE the completed event
			oModel.attachRequestCompleted(fnCompletedHandler);

			oBinding.attachChange(fnChangeHandler3);
			oBinding.getContexts(0, 20, 100);
		}

		function fnChangeHandler3() {
			oBinding.detachChange(fnChangeHandler3);
			//oBinding.getContexts(0, 20, 100);

			assert.equal(oRequestedSpy.callCount, 2,
				"After Expand: Number of dataRequested Events = 2");

			assert.equal(oRequestSentSpy.callCount, 2,
				"After Expand: Number of requestSent Events = 2");

		}

		function fnCompletedHandler() {
			oModel.detachRequestCompleted(fnCompletedHandler);
			assert.equal(oReceivedSpy.callCount, 2,
				"After Expand: Number of dataReceived Events = 2");
			assert.equal(oRequestCompletedSpy.callCount, 2,
				"After Expand: Number of requestCompleted Events = 2");
			done();
		}
	});

	//*********************************************************************************************
	QUnit.test("Eventing - ODataModel V2 - DataRequested and DataReceived", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding, oModel) {
			var oRequestedSpy = sinon.spy(oBinding, 'fireDataRequested'),
				oReceivedSpy = sinon.spy(oBinding, 'fireDataReceived'),
				oRequestSentSpy = sinon.spy(oModel, 'fireRequestSent'),
				oRequestCompletedSpy = sinon.spy(oModel, 'fireRequestCompleted');

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 100);

			function fnChangeHandler1() {
				assert.equal(oRequestedSpy.callCount, 1,
					"After Initial Loading: Number of dataRequested Events = 1");
				assert.equal(oReceivedSpy.callCount, 1,
					"After Initial Loading: Number of dataReceived Events = 1");

				assert.equal(oRequestSentSpy.callCount, 3,
					"After Initial Loading: Number of requestSent Events = 3");
				assert.equal(oRequestCompletedSpy.callCount, 3,
					"After Initial Loading: Number of requestCompleted Events = 3");

				oBinding.detachChange(fnChangeHandler1);

				oBinding.getContexts(0, 20, 100);

				oBinding.attachChange(fnExpandChangeHandler);
				oBinding.expand(0);
			}

			function fnExpandChangeHandler() {
				oBinding.detachChange(fnExpandChangeHandler);

				oBinding.attachChange(fnChangeHandler2);
				oBinding.getContexts(0, 20, 100);
			}

			function fnChangeHandler2() {
				oBinding.detachChange(fnChangeHandler2);

				assert.equal(oRequestedSpy.callCount, 2,
					"After Expand: Number of dataRequested Events = 2");
				assert.equal(oReceivedSpy.callCount, 2,
					"After Expand: Number of dataReceived Events = 2");

				assert.equal(oRequestSentSpy.callCount, 4,
					"After Expand: Number of requestSent Events = 4");
				assert.equal(oRequestCompletedSpy.callCount, 4,
					"After Expand: Number of requestCompleted Events = 4");

				done();
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("No $batch used, but percent encoding for spaces", function (assert) {
		var sBindingPath = "/ActualPlannedCosts(P_ControllingArea='US 1'"
				+ ",P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
			sExpectedPath = "/ActualPlannedCosts(P_ControllingArea='US%201'"
				+ ",P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
			done = assert.async();

		setupAnalyticalBinding(2, {useBatchRequests: false}, function (oBinding, oModel) {
			sinon.stub(oModel, "read", function (sPath) {
				assert.strictEqual(sPath, sExpectedPath, "percent encoding of space done");

				oModel.read.restore();
				done();
			});

			oBinding.getContexts();
		}, undefined/*aAnalyticalInfo*/, sBindingPath);
	});

	//*********************************************************************************************
	QUnit.test("No Paging Option - Normal Use Case", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {noPaging: true}, function (oBinding, oModel) {

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 10);

			// simple hook to check if the URLs are correctly created
			oModel.read = function () {
				var vReturn = ODataModelV2.prototype.read.apply(this, arguments),
					sURL = arguments[0];

				// check if $top is contained in the URL, only $top=0 is allowed here!
				assert.equal(sURL.indexOf("$top") == -1 || sURL.indexOf("$top=0") > 0, true,
					"URL was created without $top value");
				// check if $skip is contained in the URL
				assert.equal(sURL.indexOf("$skip") == -1, true,
					"URL was created without $skip value");

				return vReturn;
			};

			function fnChangeHandler1() {
				//retrieve contexts, every thing should be loaded
				var aContexts = oBinding.getContexts(0, 100);

				assert.equal(aContexts.length, 9, "All contexts on top level loaded");

				done();
			}

		});
	});

	//*********************************************************************************************
	QUnit.test("No Paging Option - Auto Expand (NO multi-unit)", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {noPaging: true, numberOfExpandedLevels: 2}, function (oBinding) {

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 10);

			function fnChangeHandler1() {
				//retrieve contexts, every thing should be loaded
				var aContexts = oBinding.getContexts(0, 1000);

				//even though 1000 were requested, we only receive 230,
				//since that's all there is in the backend
				assert.equal(aContexts.length, 230,
					"Access via ATBA: All contexts over every level could be retrieved");

				assert.equal(aContexts[0].getProperty().CostCenter,
					"100-1000", "Cost Center of 1st row is correct");
				assert.equal(aContexts[0].getProperty().ActualCosts,
					"1588416", "Sum Node of 1st row is correctly set");

				assert.equal(aContexts[100].getProperty().CostCenter,
					"200-2000", "Cost Center of 100th row is correct");
				assert.equal(aContexts[100].getProperty().ActualCosts,
					"9254", "Sum Node of 100th row is correctly set");

				assert.equal(aContexts[229].getProperty().CostCenter,
					"300-2000", "1. CostCenter of last row is correct (last subtotal row)");
				assert.equal(aContexts[229].getProperty().ActualCosts,
					"752475", "2. ActualCosts of last row is correct (last subtotal row)");

				done();
			}

		});
	});

	//*********************************************************************************************
	QUnit.test("selectionChanged event with selectAll and collapse", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {noPaging: true, numberOfExpandedLevels: 2}, function (oBinding) {

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 10);

			function fnChangeHandler1 (oEvent) {
				oBinding.detachChange(fnChangeHandler1);
				oBinding.getContexts(0, 1000);
				oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
				oBinding.selectAll();
			}

			function fnSelectionChangeHandler1 (oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
				oBinding.attachSelectionChanged(fnSelectionChangeHandler2);

				assert.equal(oEvent.mParameters.leadIndex, 228,
					"Event 1: leadIndex should be 228");
				assert.equal(oEvent.mParameters.oldIndex, -1,
					"Event 1: oldIndex should be -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 106,
					"Event 1: length of changedIndices should be 106");

				// code under Test
				oBinding.collapse(1);
			}

			function fnSelectionChangeHandler2 (oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler2);

				assert.equal(oEvent.mParameters.leadIndex, 228,
					"Event 2: leadIndex should be 228");
				assert.equal(oEvent.mParameters.oldIndex, 228,
					"Event 2: oldIndex should be 228");
				assert.equal(oEvent.mParameters.rowIndices.length, 1,
					"Event 2: length of changedIndices should be 1");
				assert.deepEqual(oEvent.mParameters.rowIndices, [3],
					"Changed indices after collapse is correct");

				done();
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("selectionChanged event with collapse: deselect lead selection", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {noPaging: true, numberOfExpandedLevels: 2}, function (oBinding) {

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 10);

			function fnChangeHandler1 (oEvent) {
				oBinding.detachChange(fnChangeHandler1);
				oBinding.getContexts(0, 1000);
				oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
				oBinding.setSelectedIndex(14);

			}

			function fnSelectionChangeHandler1 (oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
				oBinding.attachSelectionChanged(fnSelectionChangeHandler2);

				assert.equal(oEvent.mParameters.leadIndex, 14, "Event 1: leadIndex should be 14");
				assert.equal(oEvent.mParameters.oldIndex, -1, "Event 1: oldIndex should be -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 1,
					"Event 1: length of changedIndices should be 1");

				//Code under Test
				oBinding.collapse(0);
			}

			function fnSelectionChangeHandler2 (oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler2);

				assert.equal(oEvent.mParameters.leadIndex, -1, "Event 2: leadIndex should be -1");
				assert.equal(oEvent.mParameters.oldIndex, 15, "Event 2: oldIndex should be 15");
				assert.equal(oEvent.mParameters.rowIndices.length, 1,
					"Event 2: length of changedIndices should be 1");
				assert.deepEqual(oEvent.mParameters.rowIndices, [15],
					"Changed indices after collapse is correct");

				done();
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("Check if custom URL parameters are attached", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {
				custom: {
					"search": "ABTestString"
				}
			}, function (oBinding, oModel) {

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 20, 100);

			assert.equal(oBinding.sCustomParams, "search=ABTestString",
				"Internally the custom parameters are set");

			// simple hook to check if the URLs are correctly created
			oModel.read = function () {
				var vReturn = ODataModelV2.prototype.read.apply(this, arguments),
					mParameters = arguments[1];

				// check if custom parameter is contained in the URL
				assert.equal(mParameters.urlParameters.indexOf("search=ABTestString") >= 0, true,
					"custom parameter 'search' was added to the URL");

				// check if $search is NOT contained in the URL, this should not be allowed
				assert.equal(mParameters.urlParameters.indexOf("$search") == -1, true,
					"No $search was added");

				return vReturn;
			};

			//just start() the test after the URL has been checked
			function fnChangeHandler1() {
				done();
			}

		});
	});

	//*********************************************************************************************
	QUnit.test("getDownloadURL: Check if custom URL parameters are attached", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {
				custom: {
					"search": "ABTestString"
				}
			}, function (oBinding) {

			var sURL = oBinding.getDownloadUrl();

			assert.equal(sURL.indexOf("search=ABTestString"), 191, "URL Parameters are attached");

			//just start() the test after the URL has been checked
			done();

		});
	});

	//*********************************************************************************************
	QUnit.test("getDownloadURL: replace spaces with %20", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {
				custom: {
					"search": "AB Test String"
				}
			}, function (oBinding) {
				var sURL = oBinding.getDownloadUrl();

				assert.ok(sURL.indexOf("search=AB%20Test%20String") > 0,
					"Replaces spaces in custom paramters of URL " + sURL);
				assert.ok(sURL.indexOf("$orderby=CostCenter%20desc") > 0,
					"Replaces spaces in $orderby of URL " + sURL);
				assert.ok(sURL.indexOf("$filter=(CostCenter%20gt%20%271234%27)") > 0,
					"Replaces spaces in $filter of URL " + sURL);

				//just start() the test after the URL has been checked
				done();
			}, /*aAnalyticalInfo*/ null, /*sBindingPath*/ null, /*bSkipInitialize*/ false,
			[new Sorter("CostCenter", true)],
			[new Filter({
				operator : FilterOperator.GT,
				path : "CostCenter",
				value1 : "1234"
			})]);
	});

	//*********************************************************************************************
	[{
		expectedFilter : "((CostCenter%20lt%20%271%27%20or%20CostCenter%20gt%20%274%27))",
		filters: [new Filter({
			operator : FilterOperator.NB, path : "CostCenter", value1 : "1", value2 : "4"
		})]
	}, {
		expectedFilter : "((CostCenter%20ge%20%271%27%20and%20CostCenter%20le%20%274%27))",
		filters: [new Filter({
			operator : FilterOperator.BT, path : "CostCenter", value1 : "1", value2 : "4"
		})]
	}, {
		expectedFilter : "(not%20substringof(%271%27,CostCenter))",
		filters: [new Filter({
			operator : FilterOperator.NotContains, path : "CostCenter", value1 : "1"
		})]
	}, {
		expectedFilter : "(substringof(%271%27,CostCenter))",
		filters: [new Filter({
			operator : FilterOperator.Contains, path : "CostCenter", value1 : "1"
		})]
	}, {
		expectedFilter : "(not%20startswith(CostCenter,%271%27))",
		filters: [new Filter({
			operator : FilterOperator.NotStartsWith, path : "CostCenter", value1 : "1"
		})]
	}, {
		expectedFilter : "(startswith(CostCenter,%271%27))",
		filters: [new Filter({
			operator : FilterOperator.StartsWith, path : "CostCenter", value1 : "1"
		})]
	}, {
		expectedFilter : "(not%20endswith(CostCenter,%271%27))",
		filters: [new Filter({
			operator : FilterOperator.NotEndsWith, path : "CostCenter", value1 : "1"
		})]
	}, {
		expectedFilter : "(endswith(CostCenter,%271%27))",
		filters: [new Filter({
			operator : FilterOperator.EndsWith, path : "CostCenter", value1 : "1"
		})]
	}].forEach(function (oFixture) {
		QUnit.test("filter operators: " + oFixture.filters[0].sOperator, function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {}, function (oBinding) {
					var sURL = oBinding.getDownloadUrl(),
						sFilterPart = sURL.slice(sURL.lastIndexOf("=") + 1);

					assert.strictEqual(sFilterPart, oFixture.expectedFilter, sFilterPart);

					done();
				}, /*aAnalyticalInfo*/ null, /*sBindingPath*/ null, /*bSkipInitialize*/ false,
				[/*aSorters*/],
				oFixture.filters
			);
		});
	});

	//*********************************************************************************************
	QUnit.test("filter operators: combine all", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
				var sExpectedFilterPart = "("
						+ "endswith(CostCenter,%271%27)%20"
						+ "or%20not%20endswith(CostCenter,%271%27)%20"
						+ "or%20startswith(CostCenter,%271%27)%20"
						+ "or%20not%20startswith(CostCenter,%271%27)%20"
						+ "or%20substringof(%271%27,CostCenter)%20"
						+ "or%20not%20substringof(%271%27,CostCenter)%20"
						+ "or%20(CostCenter%20ge%20%271%27%20and%20CostCenter%20le%20%274%27)%20"
						+ "or%20(CostCenter%20lt%20%271%27%20or%20CostCenter%20gt%20%274%27)"
						+ ")",
					sURL = oBinding.getDownloadUrl(),
					sFilterPart = sURL.slice(sURL.lastIndexOf("=") + 1);

				assert.strictEqual(sFilterPart, sExpectedFilterPart, sFilterPart);

				done();
			}, /*aAnalyticalInfo*/ null, /*sBindingPath*/ null, /*bSkipInitialize*/ false,
			[/*aSorters*/],
			[new Filter({
				operator : FilterOperator.EndsWith, path : "CostCenter", value1 : "1"
			}),
			new Filter({
				operator : FilterOperator.NotEndsWith, path : "CostCenter", value1 : "1"
			}),
			new Filter({
				operator : FilterOperator.StartsWith, path : "CostCenter", value1 : "1"
			}),
			new Filter({
				operator : FilterOperator.NotStartsWith, path : "CostCenter", value1 : "1"
			}),
			new Filter({
				operator : FilterOperator.Contains, path : "CostCenter", value1 : "1"
			}),
			new Filter({
				operator : FilterOperator.NotContains, path : "CostCenter", value1 : "1"
			}),
			new Filter({
				operator : FilterOperator.BT, path : "CostCenter", value1 : "1", value2 : "4"
			}),
			new Filter({
				operator : FilterOperator.NB, path : "CostCenter", value1 : "1", value2 : "4"
			})]
		);
	});

	//*********************************************************************************************
	[{
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oActualCostsTotal,
			oCurrencyGrouped, oPlannedCostsTotal, oCurrencyGrouped],
		expectedSelect : "CostCenter,CostElement,ActualCosts,Currency,PlannedCosts,Currency"
	}, {
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oActualCostsTotal,
			oPlannedCostsTotal, oCurrencyGrouped],
		expectedSelect : "CostCenter,CostElement,ActualCosts,Currency,PlannedCosts,Currency"
	}, { // no select binding parameter -> do add dimension for its text property
		analyticalInfo : [oCostCenterGrouped, oCostElementText, oActualCostsTotal,
			oCurrencyGrouped],
		expectedSelect : "CostCenter,CostElementText,ActualCosts,Currency"
	}, {// possible but unrealistic table in ui
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oActualCostsTotal,
			oPlannedCostsTotal, oCostElementText, oCurrencyGrouped],
		expectedSelect : "CostCenter,CostElement,ActualCosts,Currency,PlannedCosts,Currency,"
			+ "CostElementText,Currency"
	}, { // with additional selects
		analyticalInfo : [oCostElementGrouped, oCostCenterGrouped, oActualCostsTotal,
			oPlannedCostsTotal, oCurrencyGrouped],
		select : "ActualCosts,CostCenter,CostCenterText,CostElement,CostElementText,Currency,"
			+ "PlannedCosts",
		expectedSelect : "CostElement,CostCenter,ActualCosts,Currency,PlannedCosts,Currency,"
			+ "CostCenterText,CostElementText"
	}, { // with additional selects: with dimensions text and measures without a unit
		analyticalInfo : [oCostCenterGrouped, oCostElementText, oActualCostsTotal],
		select : "ActualCosts,CostCenter,CostCenterText,CostElement,CostElementText,Currency",
		expectedSelect : "CostCenter,CostElementText,ActualCosts,Currency,CostElement,"
			+ "CostCenterText"
	}].forEach(function (oFixture, i) {
		QUnit.test("getDownloadURL: no duplicate units / select parameter: " + i,
				function (assert) {
			// analytical info represents column order of table and is taken for column order in
			// $select of excel download urls
			var done = assert.async();

			setupAnalyticalBinding(2, {select : oFixture.select}, function (oBinding, oModel) {
				var sURL = oBinding.getDownloadUrl();

				assert.strictEqual(sURL,
					"http://o4aFakeService:8080/ActualPlannedCosts(P_ControllingArea='US01',"
						+ "P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results?"
						+ "$select=" + oFixture.expectedSelect);
				done();
			}, oFixture.analyticalInfo);
		});
	});

	//*********************************************************************************************
	QUnit.test("getGroupName: group by a dimension that is not in UI", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {

			var oContext = {
					getProperty : function () {}
				},
				oContextMock = sinon.mock(oContext),
				sGroupProperty = "ControllingArea",
				sTextProperty = "ControllingAreaText";

			oContextMock.expects("getProperty").withExactArgs(sGroupProperty).returns("foo");
			oContextMock.expects("getProperty").withExactArgs(sTextProperty).returns("bar");

			oBinding.aAggregationLevel[0] = sGroupProperty; // group by a property that is not in UI
			oBinding.oDimensionDetailsSet[sGroupProperty] = {
				textPropertyName : sTextProperty
			};

			// Code under test
			assert.strictEqual(oBinding.getGroupName(oContext, 1), "Controlling Area: foo - bar");

			oContextMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("getGroupName: dimension with text and empty label", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {

			var oContext = {
					getProperty : function () {}
				},
				oContextMock = sinon.mock(oContext),
				sGroupProperty = "ControllingAreaWithTextEmptyLabel",
				sTextProperty = "ControllingAreaText2";

			oContextMock.expects("getProperty").withExactArgs(sGroupProperty).returns("foo");
			oContextMock.expects("getProperty").withExactArgs(sTextProperty).returns("bar");

			// Code under test
			assert.strictEqual(oBinding.getGroupName(oContext, 1), "foo - bar");

			oContextMock.verify();
			done();
		}, [oControllingAreaWithTextEmptyLabelGrouped, oControllingAreaText2, oActualCostsTotal]);
	});

	//*********************************************************************************************
	[{
		oDimension : oControllingAreaNoTextGrouped,
		sGroupName : "Controlling Area: foo"
	}, {
		oDimension : oControllingAreaNoTextNoLabelGrouped,
		sGroupName : "foo"
	}, {
		oDimension : oControllingAreaNoTextEmptyLabelGrouped,
		sGroupName : "foo"
	}].forEach(function (oFixture) {
		var oDimension = oFixture.oDimension,
			sTitle = "getGroupName: dimension without text for dimension: "
				+ oDimension.name;

		QUnit.test(sTitle, function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {}, function (oBinding) {

				var oContext = {
						getProperty : function () {}
					},
					oContextMock = sinon.mock(oContext);

				oContextMock.expects("getProperty")
					.withExactArgs(oDimension.name).returns("foo");

				// Code under test
				assert.strictEqual(oBinding.getGroupName(oContext, 1), oFixture.sGroupName);

				oContextMock.verify();
				done();
			}, [oDimension, oActualCostsTotal]);
		});
	});

	//*********************************************************************************************
	// CostCenterText can be added in select binding parameter because the associated dimension
	// CostCenter is already contained
	[{ // issues with dimensions
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,CostElement,ControllingArea,Currency,ActualCosts,CostCenterText",
		warnings : [
			"it contains the dimension property 'CostElement' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)",
			"it contains the dimension property 'ControllingArea' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped,
			oControllingArea, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,CostCenterText",
		warnings : [
			"it does not contain the property 'CostElement'",
			"it does not contain the property 'ControllingArea'"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal,
			oCostElementText], // CostElementText is text for dimension CostElement which gets
			// automatically selected by the binding
		select : "CostCenter,Currency,ActualCosts,CostCenterText",
		warnings : [
			// only the associated property is contained in analytical info
			"it does not contain the property 'CostElement'",
			"it does not contain the property 'CostElementText'"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,CostElementText,CostCenterText",
		warnings : ["the property 'CostElementText' is associated with the dimension property"
			+ " 'CostElement' which is not contained in the analytical info (see"
			+ " updateAnalyticalInfo)"]
	}, { // issues with measures
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal,
			oPlannedCostsTotal, oActualPlannedCostsDifferenceTotal],
		select : "CostCenter,Currency,ActualCosts,CostCenterText",
		warnings : [
			"it does not contain the property 'PlannedCosts'",
			"it does not contain the property 'ActualPlannedCostsDifference'"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,PlannedCosts,ActualPlannedCostsDifference,"
			+ "CostCenterText",
		warnings : [
			"it contains the measure property 'PlannedCosts' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)",
			"it contains the measure property 'ActualPlannedCostsDifference' which is not contained"
				+ " in the analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,PlannedCostsText,CostCenterText",
		warnings : ["the property 'PlannedCostsText' is associated with the measure property"
			+ " 'PlannedCosts' which is not contained in the analytical info (see"
			+ " updateAnalyticalInfo)"]
	}, { // multiple problem categories
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,CostElement,Currency,ActualCosts,PlannedCosts,CostCenterText",
		warnings : [
			"it contains the dimension property 'CostElement' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)",
			"it contains the measure property 'PlannedCosts' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped,
			oControllingArea, oActualCostsTotal],
		select : "CostCenter,CostElement,Currency,ActualCosts,PlannedCosts,CostCenterText",
		warnings : [
			"it does not contain the property 'ControllingArea'",
			"it contains the measure property 'PlannedCosts' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,CostElementText,Currency,ActualCosts,PlannedCosts,CostCenterText",
		warnings : [
			"the property 'CostElementText' is associated with the dimension property 'CostElement'"
				+ " which is not contained in the analytical info (see updateAnalyticalInfo)",
			"it contains the measure property 'PlannedCosts' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal,
			oPlannedCostsTotal],
		select : "CostCenter,Currency,ActualCosts,CostElement,CostCenterText",
		warnings : [
			"it does not contain the property 'PlannedCosts'",
			"it contains the dimension property 'CostElement' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,PlannedCosts,CostElement,CostCenterText",
		warnings : [
			"it contains the measure property 'PlannedCosts' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)",
			"it contains the dimension property 'CostElement' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,PlannedCostsText,CostElement,CostCenterText",
		warnings : [
			"the property 'PlannedCostsText' is associated with the measure property 'PlannedCosts'"
				+ " which is not contained in the analytical info (see updateAnalyticalInfo)",
			"it contains the dimension property 'CostElement' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oActualCostsTotal],
		select : "CostCenter,ActualCosts,CostCenterText",
		warnings : ["it does not contain the property 'Currency'"]
	}, { // duplicate entries in select binding parameter
		analyticalInfo : [oCostCenterGrouped, oActualCostsTotal, oPlannedCostsTotal],
		select : "CostCenter,ActualCosts,Currency,CostCenterText,PlannedCosts,Currency,"
			+ "CostCenterText,CostElement",
		warnings : [
			"it contains the property 'Currency' multiple times",
			"it contains the property 'CostCenterText' multiple times",
			"it contains the dimension property 'CostElement' which is not contained in the"
				+ " analytical info (see updateAnalyticalInfo)"
		]
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAnalyticalInfo: select causes warnings #" + i, function (assert) {
			var oBinding,
				done = assert.async(),
				oModel = new ODataModelV2(sServiceURL, {
					tokenHandling : false,
					json : true
				}),
				that = this;

			ODataModelAdapter.apply(oModel);
			oBinding = new AnalyticalBinding(oModel, sPath, null, [], [], {
				analyticalInfo : oFixture.analyticalInfo,
				useBatchRequests : true,
				numberOfExpandedLevels : 0,
				noPaging : false,
				select : oFixture.select
			});

			// code under test - constructor initializes aAdditionalSelects
			assert.deepEqual(oBinding.aAdditionalSelects, []);

			AnalyticalTreeBindingAdapter.apply(oBinding);

			oModel.attachMetadataLoaded(function () {
				var oMeasure;

				oFixture.warnings.forEach(function (sText) {
					that.oLogMock.expects("warning")
						.withExactArgs("Ignored the 'select' binding parameter, because " + sText,
							sPath);
				});

				// metadata does not contain associated properties for measures, so simulate it
				if (oFixture.select.indexOf("PlannedCostsText") >= 0) {
					oMeasure = oModel.getAnalyticalExtensions()
						.findQueryResultByName("ActualPlannedCostsResults")
						.findMeasureByPropertyName("PlannedCosts");
					oMeasure._oTextProperty = {
						name : "PlannedCostsText"
					};
				}

				// Code under test
				oBinding.initialize(); // calls oBinding.updateAnalyticalInfo

				// if there are warnings no additional selects are added (e.g. CostCenterText)
				assert.deepEqual(oBinding.aAdditionalSelects, []);

				// cleanup & check
				if (oMeasure) {
					delete oMeasure._oTextProperty;
				}
				done();
			});
		});
	});

	//*********************************************************************************************
	[{
		additionalSelects : ["CostElementText", "CostCenterText"],
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped,
			oActualCostsTotal],
		select : "CostCenter,CostElement,Currency,ActualCosts,CostElementText,CostCenterText"
	},
	// CostElementText is contained in in additionalSelects and it will be part of $select
	// calculated by the analytical binding; we don't want to reimplement the $select computation;
	// we ensured that no additional dimension or measure is contained; redundant entries need to
	// removed in _getQueryODataRequestOptions
	{
		additionalSelects : ["CostCenterText"],
		analyticalInfo : [oCostCenterGrouped, oCostElementText, oCurrencyGrouped,
			oActualCostsTotal],
		select : "CostCenter,CostElement,CostElementText,Currency,ActualCosts,CostCenterText"
	}, { // selects with whitespace characters
		additionalSelects : ["CostCenterText"],
		analyticalInfo : [oCostCenterGrouped, oCostElementText, oCurrencyGrouped,
			oActualCostsTotal],
		select : "CostCenter ,\tCostElement, CostElementText ,Currency,ActualCosts \
				,CostCenterText"
	}, { // trim only whitespace at the beginning and at the end of a property name
		additionalSelects : ["CostCenter Text"], // whitespace is not removed -> server error
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		select : "CostCenter,Currency,ActualCosts,CostCenter Text"
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAnalyticalInfo: additional selects - " + i, function (assert) {
			var oBinding,
				done = assert.async(),
				oModel = new ODataModelV2(sServiceURL, {
					tokenHandling : false,
					json : true
				});

			ODataModelAdapter.apply(oModel);
			oBinding = new AnalyticalBinding(oModel, sPath, null, [], [], {
				analyticalInfo : oFixture.analyticalInfo,
				useBatchRequests : true,
				numberOfExpandedLevels : 0,
				noPaging : false,
				select : oFixture.select
			});
			AnalyticalTreeBindingAdapter.apply(oBinding);

			oModel.attachMetadataLoaded(function () {
				// Code under test
				oBinding.initialize(); //calls oBinding.updateAnalyticalInfo

				assert.deepEqual(oBinding.aAdditionalSelects, oFixture.additionalSelects);

				done();
			});
		});
	});

	//*********************************************************************************************
	[{
		analyticalInfo : [oCostCenterUngrouped, oCostElementUngrouped, oCurrencyUngrouped,
			oActualCostsTotal],
		numberOfExpandedLevels : 0,
		select : "CostCenter,CostElement,Currency,ActualCosts,CostElementText",
		useBatchRequests : true,
		expectedSelects : [
			"ActualCosts,Currency", // sum request
			"CostCenter,CostElement,Currency,ActualCosts,CostElementText" // data request
		]
	}, {
		analyticalInfo : [oCostCenterGrouped, oCostElementUngrouped, oCurrencyUngrouped,
			oActualCostsTotal],
		numberOfExpandedLevels : 1,
		select : "CostCenter,CostElement,Currency,ActualCosts,CostElementText",
		useBatchRequests : true,
		expectedSelects : [
			"ActualCosts,Currency", // sum request,
			"CostCenter,CostElement,Currency", // count
			"CostCenter,ActualCosts,Currency", // top level group request
			"CostCenter,CostElement,Currency,ActualCosts,CostElementText" // data request
		]
	}, {
		analyticalInfo : [oCostCenterUngrouped, oCostElementUngrouped, oCurrencyUngrouped,
			oActualCostsTotal],
		numberOfExpandedLevels : 0,
		select : "CostCenter,CostElement,Currency,ActualCosts,CostElementText",
		useBatchRequests : false,
		expectedSelects : [
			"ActualCosts,Currency", // sum request
			"CostCenter,CostElement,Currency", // count
			"CostCenter,CostElement,Currency,ActualCosts,CostElementText" // data request
		]
	}, { // don't have the unit column in analytical info
		analyticalInfo : [oCostElementUngrouped, oActualCostsTotal, oActualPlannedCostsPercentage],
		numberOfExpandedLevels : 0,
		select : "CostElement,ActualCosts,ActualPlannedCostsPercentage,Currency,CostElementText",
		useBatchRequests : true,
		expectedSelects : [
			"ActualCosts,Currency", // sum request
			// data request
			"CostElement,ActualCosts,Currency,ActualPlannedCostsPercentage,CostElementText"
		]
	}].forEach(function (oFixture, i) {
		QUnit.test("_getQueryODataRequestOptions is called as expected - " + i, function (assert) {
			var oBinding,
				done = assert.async(),
				aExpectedSelects = oFixture.expectedSelects.slice(),
				oModel = new ODataModelV2(sServiceURL, {
					tokenHandling : false,
					json : true
				});

			ODataModelAdapter.apply(oModel);

			// mock read to check whether $select is properly computed
			oModel.read = function () {
				// TODO check why arguments[0] (sPath) contains a different $select
				var sExpectedSelect = aExpectedSelects.shift(),
					sSelect = arguments[1].urlParameters.reduce(
						function (sResult, sCurrentUrlParameter) {
							if (sCurrentUrlParameter.indexOf("$select=") === 0) {
								return sCurrentUrlParameter.slice(8);
							}
							return sResult;
						}, undefined);

				assert.strictEqual(sSelect, sExpectedSelect, "Expected select: " + sExpectedSelect);

				if (aExpectedSelects.length === 0) {
					done();
				}
				return {};
			};

			oBinding = new AnalyticalBinding(oModel, sPath, null, [], [], {
				analyticalInfo : oFixture.analyticalInfo,
				useBatchRequests : oFixture.useBatchRequests,
				numberOfExpandedLevels : oFixture.numberOfExpandedLevels,
				noPaging : false,
				select : oFixture.select
			});
			AnalyticalTreeBindingAdapter.apply(oBinding);

			oModel.attachMetadataLoaded(function () {
				oBinding.initialize();

				// trigger read requests
				oBinding.getContexts(0, 20, 10);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_getQueryODataRequestOptions: filter parameter", function (assert) {
		var oAnalyticalQueryRequest = {
				getFilterExpression : function () {
					return {
						checkValidity : function () {}
					};
				},
				getURIQueryOptionValue : function () {
					return null;
				}
			},
			oBinding = {
				mParameters : {
					filter : "(Country eq 'IN')"
				}
			},
			aParam;

		aParam = AnalyticalBinding.prototype._getQueryODataRequestOptions.call(oBinding,
			oAnalyticalQueryRequest, false);

		assert.deepEqual(aParam, ["$filter=(Country eq 'IN')"]);
	});

	//*********************************************************************************************
	QUnit.test("_getQueryODataRequestOptions: enhance $select", function (assert) {
		var done = assert.async(),
			sSelects = "FiscalPeriod,ControllingArea,CostCenter,CostCenterText,CostElement,"
				+ "ActualCosts,Currency",
			sExpectedSelect = "$select=" + sSelects;

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oAnalyticalQueryRequest = {
					getFilterExpression : function () {
						return {
							checkValidity : function () {}
						};
					},
					getURIQueryOptionValue : function (sParameter) {
						if (sParameter === "$select") {
							return sSelects;
						}
						return null;
					}
				};

			// simulate no additional selects
			oBinding.aAdditionalSelects = [];

			// Code under test
			assert.deepEqual(
				oBinding._getQueryODataRequestOptions(oAnalyticalQueryRequest, true),
				[sExpectedSelect]);

			// Code under test
			assert.deepEqual(
				oBinding._getQueryODataRequestOptions(oAnalyticalQueryRequest, false),
				[sExpectedSelect]);

			// simulate additional selects
			oBinding.aAdditionalSelects = ["CostElementText", "ControllingAreaText"];

			// Code under test
			assert.deepEqual(
				oBinding._getQueryODataRequestOptions(oAnalyticalQueryRequest, true),
				[sExpectedSelect + ",CostElementText,ControllingAreaText"]);

			// Code under test
			assert.deepEqual(
				oBinding._getQueryODataRequestOptions(oAnalyticalQueryRequest, false),
				[sExpectedSelect]);

			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_getNonHierarchyDimensions", function (assert) {
		var aAggregationLevel = [],
			oAnalyticalBinding = {
				oDimensionDetailsSet : {
					"dimension1" : {},
					"dimension2" : {},
					"hierarchyDimension1" : {isHierarchyDimension : true},
					"hierarchyDimension2" : {isHierarchyDimension : true}
				}
			},
			fnGetNonHierarchyDimensions = AnalyticalBinding.prototype._getNonHierarchyDimensions
				.bind(oAnalyticalBinding);

		// code under test
		assert.deepEqual(fnGetNonHierarchyDimensions(aAggregationLevel), aAggregationLevel);

		aAggregationLevel = ["hierarchyDimension1", "dimension1", "hierarchyDimension2",
			"dimension2"];
		// code under test
		assert.deepEqual(fnGetNonHierarchyDimensions(aAggregationLevel), ["dimension1",
			"dimension2"]);
	});

	//*********************************************************************************************
	QUnit.test("_getHierarchyLevelFiltersAndAddRecursiveHierarchy", function (assert) {
		var oAnalyticalBinding = {
				mHierarchyDetailsByName : {}
			},
			oAnalyticalQueryRequest = {
				addRecursiveHierarchy : function () {}
			},
			oAnalyticalQueryRequestMock = sinon.mock(oAnalyticalQueryRequest),
			aHierarchyLevelFilters;

		// code under test
		aHierarchyLevelFilters = AnalyticalBinding.prototype
			._getHierarchyLevelFiltersAndAddRecursiveHierarchy.call(oAnalyticalBinding,
				oAnalyticalQueryRequest, null);

		assert.deepEqual(aHierarchyLevelFilters, [], "sGroupId === null");

		// code under test
		aHierarchyLevelFilters = AnalyticalBinding.prototype
			._getHierarchyLevelFiltersAndAddRecursiveHierarchy.call(oAnalyticalBinding,
				oAnalyticalQueryRequest, "/foo/");

		assert.deepEqual(aHierarchyLevelFilters, [],
			"empty mHierarchyDetailsByName, ignore group ID");

		this.oLogMock.expects("error")
			.withExactArgs("Hierarchy cannot be requested for members of a group", "/foo/");

		oAnalyticalBinding.mHierarchyDetailsByName = {
			property0 : {
				dimensionName : "dimensionName0",
				level : 2,
				nodeExternalKeyName : undefined,
				nodeIDName : "nodeIDPropertyName0",
				nodeLevelName : "nodeLevelPropertyName0",
				nodeTextName : "nodeTextPropertyName0"
			},
			property1 : {
				dimensionName : "dimensionName1",
				level : 42,
				nodeExternalKeyName : "nodeExternalKeyPropertyName1",
				nodeIDName : "nodeIDPropertyName1",
				nodeLevelName : "nodeLevelPropertyName1",
				nodeTextName : undefined
			}

		};

		// code under test
		aHierarchyLevelFilters = AnalyticalBinding.prototype
			._getHierarchyLevelFiltersAndAddRecursiveHierarchy.call(oAnalyticalBinding,
				oAnalyticalQueryRequest, "/foo/");

		assert.deepEqual(aHierarchyLevelFilters, [],
			"filled mHierarchyDetailsByName and given group ID -> log error");

		oAnalyticalQueryRequestMock.expects("addRecursiveHierarchy")
			.withExactArgs("dimensionName0", false, true);
		oAnalyticalQueryRequestMock.expects("addRecursiveHierarchy")
			.withExactArgs("dimensionName1", true, false);

		// code under test
		aHierarchyLevelFilters = AnalyticalBinding.prototype
			._getHierarchyLevelFiltersAndAddRecursiveHierarchy.call(oAnalyticalBinding,
				oAnalyticalQueryRequest, "/");

		// order might be different, so sort before compare
		assert.deepEqual(aHierarchyLevelFilters.sort(function (oHierarchy0, oHierarchy1) {
			return oHierarchy0.propertyName.localeCompare(oHierarchy1.propertyName);
		}),
		[
			{propertyName : "nodeLevelPropertyName0", level : 2},
			{propertyName : "nodeLevelPropertyName1", level : 42}
		], "success case");
		oAnalyticalQueryRequestMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("_addHierarchyLevelFilters", function (assert) {
		var oFilterExpression = new odata4analytics.FilterExpression(),
			oFilterExpressionMock = sinon.mock(oFilterExpression),
			aHierarchyLevelFilters = [
				{propertyName : "foo", level : 1},
				{propertyName : "bar", level : 42}
			];

		oFilterExpressionMock.expects("removeConditions")
			.withExactArgs("foo");
		oFilterExpressionMock.expects("addCondition")
			.withExactArgs("foo", FilterOperator.EQ, 1);
		oFilterExpressionMock.expects("removeConditions")
			.withExactArgs("bar");
		oFilterExpressionMock.expects("addCondition")
			.withExactArgs("bar", FilterOperator.EQ, 42);

		// code under test
		AnalyticalBinding._addHierarchyLevelFilters(aHierarchyLevelFilters, oFilterExpression);

		oFilterExpressionMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("_prepareGroupMembersAutoExpansionQueryRequest-prepareLevelMembersQueryRequest:"
			+ " calls _getHierarchyLevelFiltersAndAddRecursiveHierarchy and"
			+ " _addHierarchyLevelFilters",
		function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {noPaging: true, numberOfExpandedLevels: 2},
				function (oBinding) {
					var oAnalyticalBindingMock = sinon.mock(AnalyticalBinding),
						oBindingMock = sinon.mock(oBinding),
						aHierarchyLevelFilters = [];

					oBindingMock.expects("_getHierarchyLevelFiltersAndAddRecursiveHierarchy")
						.withExactArgs(sinon.match.instanceOf(odata4analytics.QueryResultRequest),
							"/")
						// 3x once for each level, 2x for total size (for group null and /)
						.exactly(5)
						.returns(aHierarchyLevelFilters);

					// 1x for _prepareGroupMembersQueryRequest
					oBindingMock.expects("_getHierarchyLevelFiltersAndAddRecursiveHierarchy")
						.withExactArgs(sinon.match.instanceOf(odata4analytics.QueryResultRequest),
							null)
						.returns(aHierarchyLevelFilters);

					oAnalyticalBindingMock.expects("_addHierarchyLevelFilters")
						.withExactArgs(sinon.match.same(aHierarchyLevelFilters),
							sinon.match.instanceOf(odata4analytics.FilterExpression))
						.exactly(6);

					oBinding.attachChange(fnChangeHandler);
					oBinding.getContexts(0, 20, 10);

					function fnChangeHandler() {
						oAnalyticalBindingMock.verify();
						oBindingMock.verify();
						done();
					}

				}
			);
	});

	//*********************************************************************************************
	QUnit.test("_prepareTotalSizeQueryRequest: hierarchy dimensions tests", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oAnalyticalBindingMock = sinon.mock(AnalyticalBinding),
				oBindingMock = sinon.mock(oBinding),
				oQueryResultRequestMock = sinon.mock(odata4analytics.QueryResultRequest.prototype),
				aHierarchyLevelFilters = [],
				aMaxAggregationLevel = [],
				aNonHierarchyAggregationLevel = [];

			// fake maxAggregationLevel to check same instance in _getNonHierarchyDimensions
			oBinding.aMaxAggregationLevel = aMaxAggregationLevel;
			oBindingMock.expects("_getHierarchyLevelFiltersAndAddRecursiveHierarchy")
				.withExactArgs(sinon.match.instanceOf(odata4analytics.QueryResultRequest), "/")
				.returns(aHierarchyLevelFilters);
			oBindingMock.expects("_getNonHierarchyDimensions")
				.withExactArgs(sinon.match.same(aMaxAggregationLevel))
				.returns(aNonHierarchyAggregationLevel);
			oQueryResultRequestMock.expects("setAggregationLevel")
				.withExactArgs(sinon.match.same(aNonHierarchyAggregationLevel));
			oAnalyticalBindingMock.expects("_addHierarchyLevelFilters")
				.withExactArgs(sinon.match.same(aHierarchyLevelFilters),
					sinon.match.instanceOf(odata4analytics.FilterExpression));

			//code under test
			oBinding._prepareTotalSizeQueryRequest(/*parameters don't care*/);

			oAnalyticalBindingMock.verify();
			oBindingMock.verify();
			oQueryResultRequestMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_prepareGroupMembersQueryRequest: hierarchy dimensions tests", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oAnalyticalBindingMock = sinon.mock(AnalyticalBinding),
				oBindingMock = sinon.mock(oBinding),
				aHierarchyLevelFilters = [];

			oBindingMock.expects("_getHierarchyLevelFiltersAndAddRecursiveHierarchy")
				.withExactArgs(sinon.match.instanceOf(odata4analytics.QueryResultRequest), "/")
				.returns(aHierarchyLevelFilters);
			oBindingMock.expects("_getNonHierarchyDimensions")
				.withExactArgs(["CostCenter"])
				.returns(["CostCenter"]);
			oAnalyticalBindingMock.expects("_addHierarchyLevelFilters")
				.withExactArgs(sinon.match.same(aHierarchyLevelFilters),
					sinon.match.instanceOf(odata4analytics.FilterExpression));

			// code under test
			oBinding._prepareGroupMembersQueryRequest(0, "/");

			oAnalyticalBindingMock.verify();
			oBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	[{
		// input
		analyticalInfo : [oCostCenterNodeID],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterNodeIDGrouped],
		// expected results
		aggregationLevel : ["CostCenter_NodeID"],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : true,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : true,
				level : 0,
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterNodeIDText],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level",
				nodeTextName : "CostCenter_NodeText"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterNodeIDExternalKey],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeExternalKeyName : "CostCenter_NodeIDExt",
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterGrouped], // a dimension, no hierarchy
		// expected results
		aggregationLevel : ["CostCenter"],
		dimensionDetails : {
			"CostCenter" : {
				aAttributeName : [],
				analyticalInfo : oCostCenterGrouped,
				grouped : true,
				keyPropertyName : "CostCenter",
				name : "CostCenter"
			}
		},
		hierarchyDetails : {},
		maxAggregationLevel : ["CostCenter"]
	}, {
		// input
		analyticalInfo : [oActualCostsTotal], // a measure, no hierarchy
		// expected results
		aggregationLevel : [],
		dimensionDetails : {},
		hierarchyDetails : {},
		maxAggregationLevel : []
	}, {
		// input
		analyticalInfo : [oCostCenterNodeIDExternalKey, oCostCenterNodeID],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeExternalKeyName : "CostCenter_NodeIDExt",
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterNodeIDText, oCostCenterNodeIDExternalKey],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeExternalKeyName : "CostCenter_NodeIDExt",
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level",
				nodeTextName : "CostCenter_NodeText"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterNodeIDExternalKey, oCostCenterNodeIDText],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeExternalKeyName : "CostCenter_NodeIDExt",
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level",
				nodeTextName : "CostCenter_NodeText"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterNodeID, oCostCenterNodeIDTextNoLevel],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostCenter_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostCenter_NodeID"
			}
		},
		hierarchyDetails : {
			"CostCenter_NodeID" : {
				dimensionName : "CostCenter",
				grouped : false,
				level : 2,
				nodeIDName : "CostCenter_NodeID",
				nodeLevelName : "CostCenter_Level",
				nodeTextName : "CostCenter_NodeText"
			}
		},
		maxAggregationLevel : ["CostCenter_NodeID"]
	}, {
		// input
		analyticalInfo : [oCostCenterDrillstate], // drill state ignored, no hierarchy
		// expected results
		aggregationLevel : [],
		dimensionDetails : {},
		hierarchyDetails : {},
		maxAggregationLevel : []
	}, {
		// input
		analyticalInfo : [oCostElement],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {
			"CostElement_NodeID" : {
				aAttributeName : [],
				grouped : false,
				isHierarchyDimension : true,
				name : "CostElement_NodeID"
			}
		},
		hierarchyDetails : {
			"CostElement_NodeID" : {
				dimensionName : "CostElement",
				grouped : false,
				level : 1,
				nodeIDName : "CostElement_NodeID",
				nodeLevelName : "CostElement_Level"
			}
		},
		maxAggregationLevel : ["CostElement_NodeID"]
	}, {
		// input
		// if there is no column with a level for a hierarchy, ignore it for compatibility reasons
		analyticalInfo : [oCostCenterNodeIDTextNoLevel],
		// expected results
		aggregationLevel : [],
		dimensionDetails : {},
		hierarchyDetails : {},
		maxAggregationLevel : [],
		message : "No level specified for hierarchy node 'CostCenter_NodeID'; ignoring hierarchy"
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAnalyticalInfo: hierarchy dimensions tests - " + i, function (assert) {
			var done = assert.async(),
				that = this;

			setupAnalyticalBinding(2, {}, function (oBinding) {
				if (oFixture.message) {
					that.oLogMock.expects("isLoggable")
						.withExactArgs(Log.Level.INFO)
						.returns(true);
					that.oLogMock.expects("info").withExactArgs(oFixture.message, "");
				}

				// code under test
				oBinding.updateAnalyticalInfo(oFixture.analyticalInfo);

				assert.deepEqual(oBinding.aAggregationLevel, oFixture.aggregationLevel,
					"aAggregationLevel");
				assert.deepEqual(oBinding.oDimensionDetailsSet, oFixture.dimensionDetails,
					"oDimensionDetailsSet");
				assert.deepEqual(oBinding.mHierarchyDetailsByName, oFixture.hierarchyDetails,
					"mHierarchyDetailsByName");
				assert.deepEqual(oBinding.aMaxAggregationLevel, oFixture.maxAggregationLevel,
					"aMaxAggregationLevel");

				done();
			}, [], sPathHierarchy);
		});
	});

	//*********************************************************************************************
	[{
		// input
		analyticalInfo : [oCostCenterNodeIDGrouped, oCostCenterNodeIDText],
		sErrorMessage : "Multiple different level filter for hierarchy 'CostCenter_NodeID' defined"
	}, {
		// input
		analyticalInfo : [{
			name: "CostCenter_NodeID",
			level : "0"
		}],
		sErrorMessage : "The level of 'CostCenter_NodeID' has to be an integer value"
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAnalyticalInfo: hierarchy dimensions - errors - " + i, function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {}, function (oBinding) {
				assert.throws(function () {
					// code under test
					oBinding.updateAnalyticalInfo(oFixture.analyticalInfo);
				}, new Error(oFixture.sErrorMessage));
				done();
			}, [], sPathHierarchy);
		});
	});

	//*********************************************************************************************
	QUnit.test("updateAnalyticalInfo: not initialized", function (assert) {
		var done = assert.async(),
			aInitialColumns = [];

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var aInitialColumnsAfterUpdate = [];

			assert.strictEqual(oBinding.isInitial(), true);
			assert.strictEqual(oBinding.aInitialAnalyticalInfo, aInitialColumns);

			// code under test - updateAnalyticalInfo does not throw an error and saves aColumns
			oBinding.updateAnalyticalInfo(aInitialColumnsAfterUpdate);

			assert.strictEqual(oBinding.aInitialAnalyticalInfo, aInitialColumnsAfterUpdate);

			done();
		}, aInitialColumns, undefined, true);
	});

	//*********************************************************************************************
	QUnit.test("updateAnalyticalInfo: only formatters changed", function (assert) {
		var aInitialColumns = [{
				formatter : "formatter0",
				grouped : "grouped0",
				inResult : "inResult0",
				level : "level0",
				name : "name0",
				// Note: these appear in test code and real life, but are ignored by our code
//				sorted : "sorted0",
//				sortOrder : "sortOrder0",
				total : "total0",
				visible : "visible0"
			}, {
				formatter : "formatter1",
				grouped : "grouped1",
				inResult : "inResult1",
				level : "level1",
				name : "name1",
//				sorted : "sorted1",
//				sortOrder : "sortOrder1",
				total : "total1",
				visible : "visible1"
			}],
			that = this;

		return setupAnalyticalBinding(2, {}, /*fnODataV2Callback*/null, aInitialColumns)
		.then(function (oBinding) {
			var mAnalyticalInfoByProperty
					= jQuery.extend(true, {}, oBinding.mAnalyticalInfoByProperty),
				iAnalyticalInfoVersionNumber = oBinding.iAnalyticalInfoVersionNumber,
				fnDeepEqualExpectation,
				aInitialColumnsAfterUpdate = [{
					formatter : null,
					grouped : "grouped0",
					inResult : "inResult0",
					level : "level0",
					name : "name0",
					total : "total0",
					visible : "visible0"
				}, {
					formatter : "formatter1 - CHANGED",
					grouped : "grouped1",
					inResult : "inResult1",
					level : "level1",
					name : "name1",
					total : "total1",
					visible : "visible1"
				}],
				fnResolve;

			assert.strictEqual(oBinding.isInitial(), false);
			assert.deepEqual(oBinding._aLastChangedAnalyticalInfo, aInitialColumns);
			oBinding.attachChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
				fnResolve();
			});
			fnDeepEqualExpectation = that.mock(odata4analytics.helper).expects("deepEqual")
				// Note: aInitialColumns has been remembered as a clone!
				.withExactArgs(aInitialColumns, sinon.match.same(aInitialColumnsAfterUpdate),
					sinon.match.func)
				.returns(1);

			// code under test
			oBinding.updateAnalyticalInfo(aInitialColumnsAfterUpdate);

			assert.strictEqual(oBinding.iAnalyticalInfoVersionNumber, iAnalyticalInfoVersionNumber,
				"version number unchanged");
			assert.deepEqual(oBinding._aLastChangedAnalyticalInfo, aInitialColumnsAfterUpdate,
				"columns remembered");
			assert.deepEqual(oBinding.mAnalyticalInfoByProperty, mAnalyticalInfoByProperty,
				"formatters still unchanged");

			// code under test: call back fnFormatterChanged
			fnDeepEqualExpectation.args[0][2](aInitialColumnsAfterUpdate[0]);

			assert.strictEqual(oBinding.mAnalyticalInfoByProperty.name0.formatter, null);

			// code under test: call back fnFormatterChanged
			fnDeepEqualExpectation.args[0][2](aInitialColumnsAfterUpdate[1]);

			assert.strictEqual(oBinding.mAnalyticalInfoByProperty.name1.formatter,
				"formatter1 - CHANGED");

			return new Promise(function (resolve) {
				fnResolve = resolve;
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("bApplySortersToGroups: Constructor and initialization", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var bApplySortersToGroups = {/* true or false */};

			assert.ok(oBinding.bApplySortersToGroups, "constructor sets bApplySortersToGroups");
			assert.ok("sLastAutoExpandMode" in oBinding, "sLastAutoExpandMode defined");
			assert.strictEqual(oBinding.sLastAutoExpandMode, undefined);

			oBinding.bApplySortersToGroups = bApplySortersToGroups;

			// code under test
			oBinding.updateAnalyticalInfo([oCostCenterGrouped, oCurrencyGrouped,
				oActualCostsTotal]);

			assert.strictEqual(oBinding.bApplySortersToGroups, bApplySortersToGroups,
				"initial binding - no reset of bApplySortersToGroups");

			// code under test
			oBinding.initialize(); // calls updateAnalyticalInfo with value of last call

			assert.strictEqual(oBinding.bApplySortersToGroups, true,
				"after initialization bApplySortersToGroups is set to true");

			done();
		}, [], undefined, true);
	});

	//*********************************************************************************************
	QUnit.test("updateAnalyticalInfo: bApplySortersToGroups", function (assert) {
		var done = assert.async();

		// with default columns:
		// [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped, oActualCostsTotal]
		setupAnalyticalBinding(2, {}, function (oBinding) {
			var bApplySortersToGroups = {/* true or false */},
				oColumn;

			assert.ok(oBinding.bApplySortersToGroups, true, "true after initialization");

			oBinding.bApplySortersToGroups = bApplySortersToGroups;

			// code under test - dimension list changed
			oBinding.updateAnalyticalInfo([oCostCenterGrouped, oCurrencyGrouped,
				oActualCostsTotal]);

			assert.strictEqual(oBinding.bApplySortersToGroups, true, "true after dimension change");

			oBinding.bApplySortersToGroups = bApplySortersToGroups;

			// code under test - measure list changed
			oBinding.updateAnalyticalInfo([oCostCenterGrouped, oCurrencyGrouped,
				oActualCostsTotal, oPlannedCostsTotal]);

			assert.strictEqual(oBinding.bApplySortersToGroups, true, "true after measure change");

			oBinding.bApplySortersToGroups = bApplySortersToGroups;
			oColumn = jQuery.extend({}, oPlannedCostsTotal,
				{sorted : true, sortOrder : "Descending"});

			// code under test - measure properties sorted and sortOrder changed
			oBinding.updateAnalyticalInfo([oCostCenterGrouped, oCurrencyGrouped,
				oActualCostsTotal, oColumn]);

			assert.strictEqual(oBinding.bApplySortersToGroups, bApplySortersToGroups,
				"unchanged no measure or dimension added/removed");

			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("filter: resets bApplySortersToGroups", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oBindingMock = sinon.mock(oBinding);

			oBindingMock.expects("_fireRefresh").withExactArgs(sinon.match(function (mParameters) {
				assert.strictEqual(oBinding.bApplySortersToGroups, true,
					"ensure that bApplySortersToGroups is reset before _fireRefresh is called");
				return mParameters.reason === ChangeReason.Filter;
			}));
			oBinding.bApplySortersToGroups = {/* true or false */};

			// code under test
			oBinding.filter();

			oBindingMock.verify();
			done();
		}, [], undefined, true);
	});

	//*********************************************************************************************
	QUnit.test("getFilterInfo", function (assert) {
		var aApplicationFilter = [new Filter({
				operator : FilterOperator.EndsWith, path : "CostCenter", value1 : "1"})],
			oAst = {},
			oCombinedFilter = {
				getAST : function () {}
			},
			aControlFilter = [new Filter({
				operator : FilterOperator.StartsWith, path : "CostCenter", value1 : "5"})],
			done = assert.async(),
			bIncludeOrigin = {/*true or false*/};

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oCombinedFilterMock = sinon.mock(oCombinedFilter),
				oFilterProcessorMock = sinon.mock(FilterProcessor);

			oBinding.filter(aControlFilter);

			oFilterProcessorMock.expects("combineFilters")
				.withExactArgs(sinon.match.same(aControlFilter),
					sinon.match.same(aApplicationFilter))
				.returns(oCombinedFilter);
			oCombinedFilterMock.expects("getAST")
				.withExactArgs(sinon.match.same(bIncludeOrigin))
				.returns(oAst);

			// code under test
			assert.strictEqual(oBinding.getFilterInfo(bIncludeOrigin), oAst);

			oFilterProcessorMock.verify();
			oCombinedFilterMock.verify();
			done();
		}, /*aAnalyticalInfo*/ null, /*sBindingPath*/ null, /*bSkipInitialize*/ false,
			[/*aSorters*/],
			aApplicationFilter
		);
	});

	//*********************************************************************************************
	[{
		applicationFilter : undefined,
		controlFilter : undefined,
		expectedAst : null
	}, {
		applicationFilter : [new Filter({
			operator : FilterOperator.EndsWith, path : "CostCenter", value1 : "1"})],
		controlFilter : undefined,
		expectedAst : {
			"args": [{
				"path": "CostCenter",
				"type": "Reference"
			}, {
				"type": "Literal",
				"value": "1"
			}],
			"name": "endswith",
			"type": "Call"
		}
	}, {
		applicationFilter : undefined,
		controlFilter : [new Filter({
			operator : FilterOperator.StartsWith, path : "CostCenter", value1 : "5"})],
		expectedAst : {
			"args": [
				{"path": "CostCenter", "type": "Reference"},
				{"type": "Literal", "value": "5"}
			],
			"name": "startswith",
			"type": "Call"
		}
	}, {
		applicationFilter : [new Filter({
			operator : FilterOperator.EndsWith, path : "CostCenter", value1 : "1"})],
		controlFilter : [new Filter({
			operator : FilterOperator.StartsWith, path : "CostCenter", value1 : "5"})],
		expectedAst : {
			"left": {
				"args": [
					{"path": "CostCenter", "type": "Reference"},
					{"type": "Literal", "value": "5"}
				],
				"name": "startswith",
				"type": "Call"
			},
			"op": "&&",
			"right": {
				"args": [{
					"path": "CostCenter",
					"type": "Reference"
				}, {
					"type": "Literal",
					"value": "1"
				}],
				"name": "endswith",
				"type": "Call"
			},
			"type": "Logical"
		}
	}].forEach(function (oFixture, i) {
		QUnit.test("getFilterInfo: combine control and application filters: " + i,
				function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {}, function (oBinding) {

				if (oFixture.controlFilter) {
					oBinding.filter(oFixture.controlFilter);
				}

				// code under test
				assert.deepEqual(oBinding.getFilterInfo(), oFixture.expectedAst);

				done();
			}, /*aAnalyticalInfo*/ null, /*sBindingPath*/ null, /*bSkipInitialize*/ false,
				[/*aSorters*/],
				oFixture.applicationFilter
			);
		});
	});

	//*********************************************************************************************
	[{
		// input
		bApplySortersToGroups: false,
		sAutoExpandMode : TreeAutoExpandMode.Sequential,
		// output
		bResult : false
	}, {
		// input
		bApplySortersToGroups: true,
		sAutoExpandMode : undefined,
		// output
		bResult : false,
		bWarning : false // no warning as there are no sorters, sLastAutoExpandMode does not change
	}, {
		// input
		bApplySortersToGroups: true,
		sAutoExpandMode : undefined,
		aSorter : [{}],
		// output
		sLastAutoExpandMode : undefined,
		bResult : false,
		bWarning : true
	}, {
		// input
		bApplySortersToGroups: true,
		sAutoExpandMode : TreeAutoExpandMode.Bundled,
		// output
		bResult : false,
		bWarning : false // no warning as there are no sorters, sLastAutoExpandMode does not change
	}, {
		// input
		bApplySortersToGroups: true,
		sAutoExpandMode : TreeAutoExpandMode.Bundled,
		aSorter : [{}],
		// output
		sLastAutoExpandMode : TreeAutoExpandMode.Bundled,
		bResult : false,
		bWarning : true
	}, {
		// input
		bApplySortersToGroups: true,
		sAutoExpandMode : TreeAutoExpandMode.Sequential,
		// output
		bResult : true // there are no sorters, so do not change sLastAutoExpandMode
	}, {
		// input
		bApplySortersToGroups: true,
		sAutoExpandMode : TreeAutoExpandMode.Sequential,
		aSorter : [{}],
		// output
		sLastAutoExpandMode : TreeAutoExpandMode.Sequential,
		bResult : true
	}].forEach(function (oFixture) {
		QUnit.test("_canApplySortersToGroups: " + JSON.stringify(oFixture), function (assert) {
			var done = assert.async(),
				that = this;

			setupAnalyticalBinding(2, {}, function (oBinding) {
				var sOldLastAutoExpandMode = {/* any string different to the current mode */},
					sExpectedLastAutoExpandMode = "sLastAutoExpandMode" in oFixture
						? oFixture.sLastAutoExpandMode
						: sOldLastAutoExpandMode;

				oBinding.bApplySortersToGroups = oFixture.bApplySortersToGroups;
				oBinding._autoExpandMode = oFixture.sAutoExpandMode;
				oBinding.sLastAutoExpandMode = sOldLastAutoExpandMode;
				oBinding.aSorter = oFixture.aSorter || [];

				if (oFixture.bWarning) {
					that.oLogMock.expects("warning")
						.withExactArgs("Applying sorters to groups is only possible with auto"
								+ " expand mode 'Sequential'; current mode is: "
								+ oFixture.sAutoExpandMode,
							sPath);
				}

				// code under test
				assert.strictEqual(oBinding._canApplySortersToGroups(), oFixture.bResult);

				assert.strictEqual(oBinding.sLastAutoExpandMode, sExpectedLastAutoExpandMode);

				// code under test - no warning if called with the same auto expand mode
				assert.strictEqual(oBinding._canApplySortersToGroups(), oFixture.bResult);

				assert.strictEqual(oBinding.sLastAutoExpandMode, sExpectedLastAutoExpandMode);

				done();
			}, [], undefined, true);
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bApplySortersToGroups) {
		QUnit.test("_addSorters: " + bApplySortersToGroups, function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {}, function (oBinding) {
				var oBindingMock = sinon.mock(oBinding),
				aGroupingSorters = [{
					sPath : "fooGrouping", bDescending : true
				}, {
					sPath : "barGrouping", bDescending : false
				}],
				oSortExpression = { addSorter : function () {} },
				oSortExpressionMock = sinon.mock(oSortExpression),
				oExpectation0 = oSortExpressionMock.expects("addSorter")
					.withExactArgs("fooExternal", odata4analytics.SortOrder.Descending),
				oExpectation1 = oSortExpressionMock.expects("addSorter")
					.withExactArgs("barExternal", odata4analytics.SortOrder.Ascending),
				oExpectation2 = oSortExpressionMock.expects("addSorter")
					.withExactArgs("fooGrouping", odata4analytics.SortOrder.Descending),
				oExpectation3 = oSortExpressionMock.expects("addSorter")
					.withExactArgs("barGrouping", odata4analytics.SortOrder.Ascending);

				oBinding.aSorter = [{
					sPath : "fooExternal", bDescending : true
				}, {
					sPath : "barExternal", bDescending : false
				}];
				oBindingMock.expects("_canApplySortersToGroups")
					.withExactArgs()
					.returns(bApplySortersToGroups);

				// code under test
				oBinding._addSorters(oSortExpression, aGroupingSorters);

				assert.ok(oExpectation0.calledBefore(oExpectation1),
					"fooExternal before barExternal");
				assert.ok(oExpectation2.calledBefore(oExpectation3),
					"fooGrouping before barGrouping");
				if (bApplySortersToGroups) {
					assert.ok(oExpectation1.calledBefore(oExpectation2),
						"barExternal before fooGrouping");
				} else {
					assert.ok(oExpectation3.calledBefore(oExpectation0),
						"barGrouping before fooExternal");
				}

				oBindingMock.verify();
				oSortExpressionMock.verify();
				done();
			}, [], undefined, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("_prepareGroupMembersQueryRequest: calls _addSorters", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oBindingMock = sinon.mock(oBinding),
				oSortExpressionMock = sinon.mock(odata4analytics.SortExpression.prototype);

			oBindingMock.expects("_addSorters")
				.withExactArgs(sinon.match.instanceOf(odata4analytics.SortExpression),
					[{sPath : "CostCenter", bDescending : false}]);
			oBindingMock.expects("_canApplySortersToGroups").never();
			oSortExpressionMock.expects("addSorter").never();

			// code under test
			oBinding._prepareGroupMembersQueryRequest(iGroupMembersQueryType, "/");

			oSortExpressionMock.verify();
			oBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	[{
		bApplySorters : true,
		aSorter : [],
		bExpectGrandTotalRequest : false
	}, {
		bApplySorters : true,
		aSorter : [{}],
		bExpectGrandTotalRequest : true
	}, {
		bApplySorters : false,
		aSorter : [],
		bExpectGrandTotalRequest : false
	}, {
		bApplySorters : false,
		aSorter : [{}],
		bExpectGrandTotalRequest : false
	}].forEach(function (oFixture) {
		var sTitle = "_prepareGroupMembersQueryRequest: grand total request if needed"
				+ JSON.stringify(oFixture);

		QUnit.test(sTitle, function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {provideGrandTotals : false}, function (oBinding) {
				var oBindingMock = sinon.mock(oBinding),
					oQueryResultRequestSpy = sinon.spy(odata4analytics.QueryResultRequest.prototype,
						"setMeasures");

				oBinding.aSorter = oFixture.aSorter;
				oBindingMock.expects("_addSorters").never();
				oBindingMock.expects("_canApplySortersToGroups")
					.withExactArgs()
					.returns(oFixture.bApplySorters);

				// code under test
				oBinding._prepareGroupMembersQueryRequest(iGroupMembersQueryType, null);

				assert.strictEqual(oQueryResultRequestSpy.callCount,
					oFixture.bExpectGrandTotalRequest ? 1 : 0);
				if (oFixture.bExpectGrandTotalRequest) {
					assert.ok(oQueryResultRequestSpy.calledWithExactly(["ActualCosts"]));
				}
				oBindingMock.verify();
				oQueryResultRequestSpy.restore();
				done();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_processGroupMembersQueryResponse: calls refresh in multi-unit case if sorters"
			+ " have been applyed to groups", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var bApplySortersToGroups = {/* true or false*/},
				oBindingMock = sinon.mock(oBinding),
				oData = {
					"__count" : "2",
					"results":[{}, {}]
				},
				oRefreshSpy = sinon.spy(oBinding, "refresh"),
				oRequestDetails = {
					sGroupId : null,
					oKeyIndexMapping : {
						iIndex : 0,
						iServiceKeyIndex : 0
					},
					iRequestType : iGroupMembersQueryType,
					aSelectedUnitPropertyName : ["Currency"]
				};

			oBinding.aSorter = [{}];
			oBinding.bApplySortersToGroups = bApplySortersToGroups;
			oBindingMock.expects("_canApplySortersToGroups").withExactArgs().returns(true);
			oBindingMock.expects("_getServiceKeys").never();
			oBindingMock.expects("_warnNoSortingOfGroups").withExactArgs("binding is refreshed");

			oBinding.attachRefresh(function (oEvent) {
				assert.strictEqual(oRefreshSpy.callCount, 1);
				assert.ok(oRefreshSpy.calledWithExactly());
				assert.ok(oRefreshSpy.calledOn(oBinding));

				oRefreshSpy.restore();
				oBindingMock.verify();
				done();
			});

			// code under test
			oBinding._processGroupMembersQueryResponse(oRequestDetails, oData);
		});
	});

	//*********************************************************************************************
	QUnit.test("_processGroupMembersQueryResponse: no refresh in multi-unit case if sorters"
			+ " have *not* been applyed to groups", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oBindingMock = sinon.mock(oBinding),
				oData = {
					"__count" : "2",
					"results":[{
						ActualCosts : "1234.00",
						Currency : "EUR",
						__metadata : {
							uri : "foo"
						}
					}, {
						ActualCosts : "9875.00",
						Currency : "USD",
						__metadata : {
							uri : "bar"
						}
					}]
				},
				oRequestDetails = {
					aAggregationLevel : 0,
					sGroupId : null,
					oKeyIndexMapping : {
						sGroupId : null,
						iIndex : 0,
						iServiceKeyIndex : 0
					},
					iRequestType : iGroupMembersQueryType,
					aSelectedUnitPropertyName : ["Currency"]
				};

			oBinding.aSorter = [];
			oBindingMock.expects("_canApplySortersToGroups").withExactArgs().returns(true);
			oBindingMock.expects("refresh").withExactArgs().never();
			oBindingMock.expects("_getServiceKeys").withExactArgs(null, -1);
			// once in global check for group null
			oBindingMock.expects("_warnNoSortingOfGroups").withExactArgs(undefined);
			// and once while processing the data
			oBindingMock.expects("_warnNoSortingOfGroups").withExactArgs();

			// code under test
			oBinding._processGroupMembersQueryResponse(oRequestDetails, oData);

			oBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_processGroupMembersQueryResponse: no refresh in non-multi-unit case if sorters"
			+ " have been applyed to groups", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var bApplySortersToGroups = {/* true or false*/},
				oBindingMock = sinon.mock(oBinding),
				oData = {
					"__count" : "1",
					"results":[{
						ActualCosts : "1234.00",
						Currency : "EUR",
						__metadata : {
							uri : "foo"
						}
					}]
				},
				oRequestDetails = {
					aAggregationLevel : 0,
					sGroupId : null,
					oKeyIndexMapping : {
						sGroupId : null,
						iIndex : 0,
						iServiceKeyIndex : 0
					},
					iRequestType : iGroupMembersQueryType,
					aSelectedUnitPropertyName : ["Currency"]
				};

			oBinding.bApplySortersToGroups = bApplySortersToGroups;
			oBindingMock.expects("_canApplySortersToGroups").never();
			oBindingMock.expects("refresh").withExactArgs().never();
			oBindingMock.expects("_getServiceKeys").withExactArgs(null, -1);

			// code under test
			oBinding._processGroupMembersQueryResponse(oRequestDetails, oData);

			assert.strictEqual(oBinding.bApplySortersToGroups, bApplySortersToGroups);

			oBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_processGroupMembersQueryResponse: _canApplySortersToGroups is not called for a"
			+ " group different to null", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var bApplySortersToGroups = {/* true or false*/},
				oBindingMock = sinon.mock(oBinding),
				oData = {
					"__count" : "2",
					"results":[{
						ActualCosts : "1588416",
						CostCenter : "100-1000",
						Currency : "EUR",
						__metadata : {
							uri : "foo"
						}
					}, {
						ActualCosts : "1398408",
						CostCenter : "100-1000",
						Currency : "USD",
						__metadata : {
							uri : "bar"
						}
					}]
				},
				oRequestDetails = {
					aAggregationLevel : ["CostCenter"],
					sGroupId : "/",
					oKeyIndexMapping : {
						sGroupId : "/",
						iIndex : 0,
						iServiceKeyIndex : 0
					},
					iRequestType : iGroupMembersQueryType,
					aSelectedUnitPropertyName : ["Currency"]
				};

			oBinding.bApplySortersToGroups = bApplySortersToGroups;
			oBindingMock.expects("_canApplySortersToGroups").never();
			oBindingMock.expects("refresh").withExactArgs().never();
			oBindingMock.expects("_warnNoSortingOfGroups").withExactArgs();

			// code under test
			oBinding._processGroupMembersQueryResponse(oRequestDetails, oData);

			assert.strictEqual(oBinding.bApplySortersToGroups, bApplySortersToGroups);

			oBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_createMultiUnitRepresentativeEntry: URI encoded multi unit entry key parts",
			function (assert) {
		var done = assert.async();

		setupAnalyticalBinding(2, {}, function (oBinding) {
			var oExpectedMultiUnitEntry = {
					oEntry: {
						"ActualCosts" : null,
						"CostCenter" : "100/1000%2F",
						"Currency" : "EUR",
						"^~volatile" : true,
						"__metadata" : {
							"uri" :
								",,,,,100%2F1000%252F,,EUR,,,,,,-multiple-units-not-dereferencable"
						}
					},
					bIsNewEntry: true,
					aReloadMeasurePropertyName: ["ActualCosts"]
				},
				oMultiUnitEntry,
				oReferenceEntry = {
					ActualCosts : "1588416",
					CostCenter : "100/1000%2F",
					Currency : "EUR",
					__metadata : {
						uri : "foo"
					}
				};

			// code under test
			oMultiUnitEntry = oBinding._createMultiUnitRepresentativeEntry("/", oReferenceEntry,
				[], [], true);

			assert.deepEqual(oMultiUnitEntry, oExpectedMultiUnitEntry);

			done();
		});
	});

	//*********************************************************************************************
	[{
		oContext : {},
		bRelative : false
	}, {
		oContext : {},
		bRelative : true,
		bResolved : false
	}, {
		oContext : {},
		bRelative : true,
		bResolved : true
	}, {
		oContext : undefined,
		bRelative : true,
		bResolved : false
	}].forEach(function (oFixture) {
		QUnit.test("setContext: " + JSON.stringify(oFixture), function (assert) {
			var done = assert.async();

			setupAnalyticalBinding(2, {}, function (oBinding, oModel) {
				var bApplySortersToGroups = {/* true or false*/},
					oBindingMock = sinon.mock(oBinding),
					oDataState = {},
					bInitial = {/*true or false*/},
					oModelMock = sinon.mock(oModel),
					sResolvedPath = "/~";

				oBinding.bApplySortersToGroups = bApplySortersToGroups;
				oBinding.oDataState = oDataState;
				oBinding.iTotalSize = 42;
				oBinding.bInitial = bInitial;
				oBindingMock.expects("isRelative").withExactArgs().returns(oFixture.bRelative);
				oBindingMock.expects("_abortAllPendingRequests").exactly(oFixture.bRelative ? 1 : 0)
					.withExactArgs();
				oModelMock.expects("resolve")
					.withExactArgs("~", sinon.match.same(oFixture.oContext))
					.exactly(oFixture.bRelative ? 1 : 0)
					.returns(oFixture.bResolved ? sResolvedPath : undefined);
				if (oFixture.bResolved) {
					oBindingMock.expects("resetData").withExactArgs();
					oBindingMock.expects("_initialize").withExactArgs();
					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Context});
				}

				assert.strictEqual(oBinding.oContext, null, "no context set");

				// code under test
				oBinding.setContext(oFixture.oContext);

				assert.strictEqual(oBinding.oContext, oFixture.oContext, "new context set");
				assert.strictEqual(oBinding.oDataState, oFixture.bRelative ? null : oDataState);
				assert.strictEqual(oBinding.bApplySortersToGroups,
					oFixture.bRelative ? true : bApplySortersToGroups);
				assert.strictEqual(oBinding.iTotalSize, oFixture.bRelative ? -1 : 42);
				assert.strictEqual(oBinding.bInitial,
					oFixture.bRelative && !oFixture.bResolved ? true : bInitial);

				// ********** set same context again - no changes and no additional function calls
				oBinding.bApplySortersToGroups = bApplySortersToGroups;
				oBinding.oDataState = oDataState;

				// code under test
				oBinding.setContext(oFixture.oContext);

				assert.strictEqual(oBinding.bApplySortersToGroups, bApplySortersToGroups,
					"bApplySortersToGroups not reset if context is the same as already set");
				assert.strictEqual(oBinding.oDataState, oDataState,
					"oDataState not reset if context is the same as already set");
				assert.strictEqual(oBinding.oContext, oFixture.oContext, "context not changed");

				oBindingMock.verify();
				oModelMock.verify();
				done();
			}, [], "~");
		});
	});

	//*********************************************************************************************
	[{
		bApplySortersToGroups : false
	}, {
		bApplySortersToGroups : true,
		sWarning : "Detected a multi-unit case, so sorting is only possible on leaves"
	}, {
		bApplySortersToGroups : false,
		sDetails : "foo"
	}, {
		bApplySortersToGroups : true,
		sDetails : "foo",
		sWarning : "Detected a multi-unit case, so sorting is only possible on leaves; foo"
	}].forEach(function (oFixture) {
		QUnit.test("_warnNoSortingOfGroups: " + JSON.stringify(oFixture), function (assert) {
			var done = assert.async(),
			that = this;

			setupAnalyticalBinding(2, {}, function (oBinding) {
				oBinding.bApplySortersToGroups = oFixture.bApplySortersToGroups;
				that.oLogMock.expects("warning")
					.withExactArgs(oFixture.sWarning, sPath)
					.exactly("sWarning" in oFixture ? 1 : 0);

				// code under test
				oBinding._warnNoSortingOfGroups(oFixture.sDetails);

				assert.strictEqual(oBinding.bApplySortersToGroups, false);

				done();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_calculateRequiredGroupSection: no data", function (assert) {
		var that = this;

		return setupAnalyticalBinding().then(function (oBinding) {

			that.mock(oBinding).expects("_getKeys").atLeast(0).withExactArgs("/")
				.returns();

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 0, 101, 0),
				{startIndex : 0, length : 101});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 50, 101, 50),
				{startIndex : 0, length : 50 + 101 + 50});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 42, 101, 50),
				{startIndex : 0, length : 42 + 101 + 50});
		});
	});

	//*********************************************************************************************
	QUnit.test("_calculateRequiredGroupSection: gap ]118, 148[", function (assert) {
		var that = this;

		return setupAnalyticalBinding().then(function (oBinding) {

			that.mock(oBinding).expects("_getKeys").atLeast(0).withExactArgs("/")
				.returns(function (iIndex) {
					return iIndex <= 118 || iIndex >= 148 && iIndex < 264;
				});
			oBinding.mFinalLength["/"] = true;
			oBinding.mLength["/"] = 264;

			// code under test
			assert.strictEqual(
				oBinding._calculateRequiredGroupSection("/", 0, 101, 0).length,
				0); // length === 0, don't care about startIndex

			// code under test
			assert.strictEqual(
				oBinding._calculateRequiredGroupSection("/", 10, 101, 0).length,
				0); // length === 0, don't care about startIndex

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 119, 29, 0),
				{startIndex : 119, length : 29});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 100, 29, 0),
				{startIndex : 119, length : 10});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 0, 264, 0),
				{startIndex : 119, length : 148 - 119});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 0, 101, 100),
				{startIndex : 119, length : 148 - 119});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 150, 1, 50),
				{startIndex : 119, length : 148 - 119});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 150, 100, 100),
				{startIndex : 119, length : 148 - 119});
		});
	});

	//*********************************************************************************************
	QUnit.test("_calculateRequiredGroupSection: gap ]118, 264[", function (assert) {
		var that = this;

		return setupAnalyticalBinding().then(function (oBinding) {

			that.mock(oBinding).expects("_getKeys").atLeast(0).withExactArgs("/")
				.returns(function (iIndex) {
					return iIndex <= 118;
				});
			oBinding.mFinalLength["/"] = true;
			oBinding.mLength["/"] = 264;

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 245, 19, 100),
				{startIndex : 145, length : 264 - 145});
		});
	});

	//*********************************************************************************************
	QUnit.test("_calculateRequiredGroupSection: gaps [30, 40] and [60, 70]", function (assert) {
		var that = this;

		return setupAnalyticalBinding().then(function (oBinding) {

			that.mock(oBinding).expects("_getKeys").atLeast(0).withExactArgs("/")
				.returns(function (iIndex) {
					return iIndex < 30 || iIndex > 40 && iIndex < 60 || iIndex > 70 && iIndex < 100;
				});
			oBinding.mFinalLength["/"] = true;
			oBinding.mLength["/"] = 100;

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 20, 70, 0),
				{startIndex : 30, length : 71 - 30});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 42, 15, 10),
				{startIndex : 32, length : 42 + 15 + 10 - 32});

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 34, 2, 3),
				{startIndex : 34 - 3, length : 3 + 2 + 3});
		});
	});

	//*********************************************************************************************
	// BCP: 1980533509
	QUnit.test("_prepareGroupMembersAutoExpansionQueryRequest/prepareLevelMembersQueryRequest:"
			+ " Allow expansion of all dimensions", function (assert) {

		return setupAnalyticalBinding(2, {
					autoExpandMode : "Bundled",
					numberOfExpandedLevels : 2,
					useBatchRequests : true,
					sumOnTop : false
				},
				/*fnODataV2Callback*/null,
				[oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal]
			).then(function (oBinding) {
				var oGroupExpansionFirstMissingMember = {
						groupId_Missing : "/",
						startIndex_Missing : 0,
						length_Missing : 35
					},
					oResult;

				// code under test
				oResult = oBinding._prepareGroupMembersAutoExpansionQueryRequest(/*iRequestType*/ 3,
					/*sGroupId*/ "/", oGroupExpansionFirstMissingMember, /*iLength*/ 35,
					/*iNumberOfExpandedLevels*/ 2);

				assert.strictEqual(oResult.iRequestType, 3);
				assert.strictEqual(oResult.aRequestId.length, 3);
				assert.strictEqual(oResult.sGroupId, "/");
				assert.strictEqual(oResult.iLength, 35);
				assert.strictEqual(oResult.aGroupMembersAutoExpansionRequestDetails.length, 3);
				assert.deepEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[0].aAggregationLevel,
					["CostCenter"]);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[0].iLength, 12);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[0].iLevel, 1);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[0].iRequestType, 4);
				assert.deepEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[0].aSelectedUnitPropertyName,
					["Currency"]);

				assert.deepEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[1].aAggregationLevel,
					["CostCenter", "Currency"]);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[1].iLength, 17);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[1].iLevel, 2);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[1].iRequestType, 4);
				assert.deepEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[1].aSelectedUnitPropertyName,
					[]);

				assert.deepEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[2].aAggregationLevel,
					["CostCenter", "Currency"]);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[2].iLength, 32);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[2].iLevel, 3);
				assert.strictEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[2].iRequestType, 4);
				assert.deepEqual(
					oResult.aGroupMembersAutoExpansionRequestDetails[2].aSelectedUnitPropertyName,
					[]);
			});
	});
});
