/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/base/util/extend",
	"sap/ui/model/analytics/odata4analytics",
	"sap/ui/model/analytics/AnalyticalBinding",
	"sap/ui/model/analytics/AnalyticalTreeBindingAdapter",
	"sap/ui/model/analytics/BatchResponseCollector",
	"sap/ui/model/analytics/ODataModelAdapter",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Sorter",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/qunit/analytics/o4aMetadata",
	// following resources add responses to the fake server
	"sap/ui/core/qunit/analytics/CONTRACTPERFResults_Batch_MeasureWithTextAnnotation",
	"sap/ui/core/qunit/analytics/TBA_ServiceDocument",
	"sap/ui/core/qunit/analytics/TBA_NoBatch",
	"sap/ui/core/qunit/analytics/TBA_Batch_Contexts",
	"sap/ui/core/qunit/analytics/TBA_Batch_ExpandCollapseToggle",
	"sap/ui/core/qunit/analytics/TBA_Batch_Filter",
	"sap/ui/core/qunit/analytics/TBA_Batch_Sort"
], function (Log, deepExtend, extend, odata4analytics, AnalyticalBinding, AnalyticalTreeBindingAdapter,
		BatchResponseCollector, ODataModelAdapter, ChangeReason, Filter, FilterOperator, FilterProcessor, Sorter,
		TreeAutoExpandMode, CountMode, ODataUtils, ODataModelV2, o4aFakeService) {
	/*global QUnit, sinon */
	/*eslint camelcase: 0, max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	var iGroupMembersQueryType = AnalyticalBinding._requestType.groupMembersQuery,
		sServiceURL = "http://o4aFakeService:8080/",
		// column templates
		oGroupedColumn = {
			grouped : true,
			inResult : false,
			sortOrder : "Ascending",
			sorted : false,
			total : false,
			visible : true
		},
		oVisibleColumn = {
			grouped : false,
			inResult : false,
			sortOrder : "Ascending",
			sorted : false,
			total : false,
			visible : true
		},
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
		// a grouped text property of a dimension
		oCostElementTextGrouped = {
			name: "CostElementText",
			grouped: true,
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

	/**
	 * Applies the ODataModelAdapter to the given OData model and creates a new AnalyticalBinding
	 * with the given parameters, analytical info, binding path, sorters and filters.
	 *
	 * @param {sap.ui.model.Model} oModel
	 *   The OData model
	 * @param {object} [mParameters={}]
	 *   The Analytical binding parameters
	 * @param {object[]} [aAnalyticalInfo]
	 *   The array of the analytical columns to be used; by default CostCenter (grouped), CostElement (grouped),
	 *   Currency (grouped) and ActualCosts (with total)
	 * @param {string} [sBindingPath="/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"]
	 *   The binding path
	 * @param {sap.ui.model.Sorter[]} [aSorters=[]]
	 *   The array of sorters
	 * @param {sap.ui.model.Filter[]} [aFilters=[]]
	 *   The array of filters
	 * @returns {sap.ui.model.analytics.AnalyticalBinding}
	 *   The analytical binding
	 */
	function applyAdapterAndCreateBinding(oModel, mParameters, aAnalyticalInfo, sBindingPath, aSorters, aFilters) {
		mParameters = mParameters || {};
		aAnalyticalInfo = aAnalyticalInfo
			|| [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped, oActualCostsTotal];

		ODataModelAdapter.apply(oModel);
		const oBinding = new AnalyticalBinding(oModel, sBindingPath || sPath, null, aSorters || [],
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

		return oBinding;
	}

	/**
	 * Creates an OData V2 model and an analytical binding instance.
	 * If a callback function is given, it is called when the metadata are loaded and the binding is
	 * initialized. If no callback function is given, a Promise is returned that resolves with the
	 * new binding as soon as metadata has been loaded.
	 *
	 * @param {object} [mParameters={}]
	 *   The Analytical binding parameters
	 * @param {function} [fnODataV2Callback]
	 *   The function which is called when the metadata is loaded and the binding is initialized
	 * @param {object[]} [aAnalyticalInfo]
	 *   The array of the analytical columns to be used; by default CostCenter (grouped), CostElement (grouped),
	 *   Currency (grouped) and ActualCosts (with total)
	 * @param {string} [sBindingPath="/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"]
	 *   The binding path
	 * @param {boolean} [bSkipInitialize=false]
	 *   Whether to skip the binding intialization
	 * @param {sap.ui.model.Sorter[]} [aSorters=[]]
	 *   The array of sorters
	 * @param {sap.ui.model.Filter[]} [aFilters=[]]
	 *   The array of filters
	 * @returns {undefined|Promise}
	 *   <code>undefined</code> if a callback function is given; otherwise a Promise which resolves
	 *   with the new analytial binding instance
	 */
	function setupAnalyticalBinding(mParameters, fnODataV2Callback, aAnalyticalInfo,
			sBindingPath, bSkipInitialize, aSorters, aFilters) {
		const oModel = new ODataModelV2(sServiceURL, {
			defaultCountMode : CountMode.Inline,
			tokenHandling: false,
			json: true
		});
		const oBinding = applyAdapterAndCreateBinding(oModel, mParameters, aAnalyticalInfo, sBindingPath,
			aSorters, aFilters);
		if (fnODataV2Callback) {
			oModel.attachMetadataLoaded(function () {
				if (!bSkipInitialize) {
					oBinding.initialize();
				}
				fnODataV2Callback(oBinding, oModel);
			});
			return undefined;
		} else {
			return oModel.metadataLoaded().then(function () {
				if (!bSkipInitialize) {
					oBinding.initialize();
				}
				return oBinding;
			});
		}
	}

	/**
	 * Creates an OData V1 model and an analytical binding instance.
	 *
	 * @returns {object}
	 *   An object with the properties <code>binding</code> containing the analytical binding instance
	 *   and <code>model</code> containing the OData V1 model.
	 * @deprecated As of version 1.48.0
	 */
	function setupAnalyticalBindingV1() {
		const ODataModelV1Class = sap.ui.require("sap/ui/model/odata/ODataModel") ||
				sap.ui.requireSync("sap/ui/model/odata/ODataModel"); // legacy-relevant: fallback for missing dependency
		const oModel = new ODataModelV1Class(sServiceURL, {
			defaultCountMode : CountMode.Inline,
			json: true,
			tokenHandling: false
		});
		const oBinding = applyAdapterAndCreateBinding(oModel);
		// V1 => synchronous metadata, initialize the binding directly
		oBinding.initialize();
		return {
			binding : oBinding,
			model : oModel
		};
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
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			o4aFakeService.fake({
				baseURI: sServiceURL
			});
		}
	});

	/** @deprecated As of version 1.48.0 */
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

		oSetupBinding = setupAnalyticalBindingV1();
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

		setupAnalyticalBinding({}, function (oBinding, oModel) {
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
	// BCP: 002075129500000644142021
[
	{analyticalInfoByProperty: {}, measure : "foo", result : false},
	{analyticalInfoByProperty: {foo : {}}, measure : "foo", result : false},
	{analyticalInfoByProperty: {foo : {total : true}}, measure : "foo", result : false},
	{analyticalInfoByProperty: {foo : {total : "truthy"}}, measure : "foo", result : false},
	{analyticalInfoByProperty: {foo : {total : false}}, measure : "foo", result : true},
	// not sure whether this may happen; keep it for compatibility
	{analyticalInfoByProperty: {foo : {total : ""}}, measure : "foo", result : true}
].forEach(function (oFixture, i) {
	QUnit.test("_isSkippingTotalForMeasure: #" + i, function (assert) {
		var oBinding = {
				mAnalyticalInfoByProperty : oFixture.analyticalInfoByProperty
			};

		// code under test
		assert.strictEqual(
			AnalyticalBinding.prototype._isSkippingTotalForMeasure.call(oBinding, oFixture.measure),
			oFixture.result);
	});
});

	//*********************************************************************************************
	// If a measure property has a sap:text annotation and in the analytical info only that text
	// property is contained and not the measure itself, the analytical binding has to request data
	// and must not fail. It should request the data as it would do if the measure property would be
	// requested with total=true. In this test a multi-unit case is contained, which leads to a
	// second $batch resolving the multi-unit case.
	// Tests _prepareGroupMembersQueryRequest, _createMultiUnitRepresentativeEntry and
	// _prepareReloadMeasurePropertiesQueryRequest.
	// BCP: 002075129500000644142021
	QUnit.test("Measure with sap:text annotation; multi unit case", function (assert) {
		var aAnalyticalInfo = [
				Object.assign({}, oGroupedColumn, {name : "SalesDocument"}),
				Object.assign({}, oVisibleColumn, {name : "CostOvrWithhold_F"}),
				Object.assign({}, oVisibleColumn, {name : "CostInGlobalCurrency_F"})
			],
			iCount = 0,
			done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding, oModel) {
			oModel.attachBatchRequestCompleted(function () {
				iCount += 1;
				if (iCount === 1) {
					return; // wait for the second batch which resolves the multi-unit case
				}
				done();
			});
			that.oLogMock.expects("warning")
				.withExactArgs("Detected a multi-unit case, so sorting is only possible on leaves",
					"/CONTRACTPERFResults");

			oBinding.getContexts(0, 20, 0);
		}, aAnalyticalInfo, "/CONTRACTPERFResults");
	});

	//*********************************************************************************************
	// If a measure property has a sap:text annotation and in the analytical info only that text
	// property is contained and not the measure itself, the analytical binding has to request data
	// and must not fail. It should request the data as it would do if the measure property would be
	// requested with total=true. In this test auto expansion is done.
	// Tests _prepareGroupMembersAutoExpansionQueryRequest/prepareLevelMembersQueryRequest.
	// BCP: 002075129500000644142021
	QUnit.test("Measure with sap:text annotation; auto expand", function (assert) {
		var aAnalyticalInfo = [
				Object.assign({}, oGroupedColumn, {name : "SalesDocument"}),
				Object.assign({}, oGroupedColumn, {name : "SalesOrganization"}),
				Object.assign({}, oVisibleColumn, {name : "CostOvrWithhold_F"})
			],
			done = assert.async();

		setupAnalyticalBinding({noPaging: true, numberOfExpandedLevels: 2},
			function (oBinding, oModel) {
				oModel.attachBatchRequestCompleted(function () {
					done();
				});

				oBinding.getContexts(0, 20, 0);
			},
			aAnalyticalInfo, "/CONTRACTPERFResults");
	});

	//*********************************************************************************************
	QUnit.test("No $batch used, but percent encoding for spaces", function (assert) {
		var sBindingPath = "/ActualPlannedCosts(P_ControllingArea='US 1'"
				+ ",P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
			sExpectedPath = "/ActualPlannedCosts(P_ControllingArea='US%201'"
				+ ",P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
			done = assert.async();

		setupAnalyticalBinding({useBatchRequests: false}, function (oBinding, oModel) {
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

		setupAnalyticalBinding({noPaging: true}, function (oBinding, oModel) {

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

		setupAnalyticalBinding({noPaging: true, numberOfExpandedLevels: 2}, function (oBinding) {

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

		setupAnalyticalBinding({noPaging: true, numberOfExpandedLevels: 2}, function (oBinding) {

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

		setupAnalyticalBinding({noPaging: true, numberOfExpandedLevels: 2}, function (oBinding) {

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

		setupAnalyticalBinding({
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

		setupAnalyticalBinding({
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

		setupAnalyticalBinding({
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

			setupAnalyticalBinding({}, function (oBinding) {
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

		setupAnalyticalBinding({}, function (oBinding) {
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
			+ "CostElementText,CostCenterText"
	}, { // with additional selects: with dimensions text and measures without a unit
		analyticalInfo : [oCostCenterGrouped, oCostElementText, oActualCostsTotal],
		select : "ActualCosts,CostCenter,CostCenterText,CostElement,CostElementText,Currency",
		expectedSelect : "CostCenter,CostElementText,ActualCosts,Currency,CostCenterText,"
			+ "CostElement"
	}].forEach(function (oFixture, i) {
		QUnit.test("getDownloadURL: no duplicate units / select parameter: " + i,
				function (assert) {
			// analytical info represents column order of table and is taken for column order in
			// $select of excel download urls
			var done = assert.async();

			setupAnalyticalBinding({select : oFixture.select}, function (oBinding, oModel) {
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

		setupAnalyticalBinding({}, function (oBinding) {

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

		setupAnalyticalBinding({}, function (oBinding) {

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

			setupAnalyticalBinding({}, function (oBinding) {

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
		// CostElementText is the text for the dimension CostElement which gets automatically
		// selected by the binding; CostElement does not need to be in the select, but
		// CostElementText has to be
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal,
			oCostElementText],
		select : "CostCenter,Currency,ActualCosts,CostCenterText",
		warnings : ["it does not contain the property 'CostElementText'"]
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
			this.oLogMock.expects("warning")
				.withExactArgs("default count mode is ignored; OData requests will include"
					+ " $inlinecount options");

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
		additionalSelects : [],
		analyticalInfo : [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped,
			oActualCostsTotal],
		dimensionToTextProperty : {
			"CostElement" : "CostElementText",
			"CostCenter" : "CostCenterText"
		},
		select : "CostCenter,CostElement,Currency,ActualCosts,CostElementText,CostCenterText"
	},
	// CostElementText is contained in additionalSelects, and it will be part of $select
	// calculated by the analytical binding; we don't want to reimplement the $select computation;
	// we ensured that no additional dimension or measure is contained; redundant entries need to
	// removed in _getQueryODataRequestOptions
	{
		additionalSelects : [],
		analyticalInfo : [oCostCenterGrouped, oCostElementText, oCurrencyGrouped,
			oActualCostsTotal],
		dimensionToTextProperty : {
			"CostElement" : "CostElementText",
			"CostCenter" : "CostCenterText"
		},
		select : "CostCenter,CostElement,CostElementText,Currency,ActualCosts,CostCenterText"
	}, { // selects with whitespace characters
		additionalSelects : [],
			analyticalInfo : [oCostCenterGrouped, oCostElementText, oCurrencyGrouped,
			oActualCostsTotal],
		dimensionToTextProperty : {
			"CostElement" : "CostElementText",
			"CostCenter" : "CostCenterText"
		},
		select : "CostCenter ,\tCostElement, CostElementText ,Currency,ActualCosts \
				,CostCenterText"
	}, { // trim only whitespace at the beginning and at the end of a property name
		additionalSelects : ["CostCenter Text"], // whitespace is not removed -> server error
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal],
		dimensionToTextProperty : {},
		select : "CostCenter,Currency,ActualCosts,CostCenter Text"
	}, {
		additionalSelects : [],
		// CostElementText is text for dimension CostElement which gets automatically selected by
		// the binding; CostElement does not need to be part of the select parameter
		analyticalInfo : [oCostCenterGrouped, oCurrencyGrouped, oActualCostsTotal,
			oCostElementText],
		dimensionToTextProperty : {
			"CostElement" : "CostElementText"
		},
		select : "CostCenter,Currency,ActualCosts,CostElementText"
	}, {
		additionalSelects : [],
		// the oActualCostsTotal has the associated unit Currency which gets automatically selected
		// by the binding; Currency does not need to be part of the select parameter
		analyticalInfo : [oCostCenterGrouped, oActualCostsTotal],
		dimensionToTextProperty : {
			"CostCenter" : "CostCenterText"
		},
		select : "CostCenter,ActualCosts,CostCenterText"
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAnalyticalInfo: additional selects - " + i, function (assert) {
			var oBinding,
				done = assert.async(),
				oModel = new ODataModelV2(sServiceURL, {
					defaultCountMode : CountMode.Inline,
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

			oModel.attachMetadataLoaded(() => {
				// code under test
				oBinding.initialize(); //calls oBinding.updateAnalyticalInfo

				assert.deepEqual(oBinding.aAdditionalSelects, oFixture.additionalSelects);

				for (const [sName, oDetails] of Object.entries(oBinding.oDimensionDetailsSet)) {
					const sTextProperty = oDetails.textPropertyName;
					if (sName in oFixture.dimensionToTextProperty) {
						assert.strictEqual(sTextProperty, oFixture.dimensionToTextProperty[sName]);
						delete oFixture.dimensionToTextProperty[sName];
					} else {
						assert.strictEqual(sTextProperty, undefined);
					}
				}
				assert.strictEqual(Object.keys(oFixture.dimensionToTextProperty).length, 0,
					"all text properties found");
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
			"CostCenter,CostElement,CostElementText,Currency,ActualCosts" // data request
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
			"CostCenter,CostElement,CostElementText,Currency,ActualCosts" // data request
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
			"CostCenter,CostElement,CostElementText,Currency,ActualCosts" // data request
		]
	}, { // don't have the unit column in analytical info
		analyticalInfo : [oCostElementUngrouped, oActualCostsTotal, oActualPlannedCostsPercentage],
		numberOfExpandedLevels : 0,
		select : "CostElement,ActualCosts,ActualPlannedCostsPercentage,Currency,CostElementText",
		useBatchRequests : true,
		expectedSelects : [
			"ActualCosts,Currency", // sum request
			// data request
			"CostElement,CostElementText,ActualCosts,Currency,ActualPlannedCostsPercentage"
		]
	}].forEach(function (oFixture, i) {
		QUnit.test("_getQueryODataRequestOptions is called as expected - " + i, function (assert) {
			var oBinding,
				done = assert.async(),
				aExpectedSelects = oFixture.expectedSelects.slice(),
				oModel = new ODataModelV2(sServiceURL, {
					defaultCountMode : CountMode.Inline,
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

		setupAnalyticalBinding({}, function (oBinding) {
			var oAnalyticalQueryRequest = {
					getFilterExpression : function () {
						return {
							checkValidity : function () {}
						};
					},
					getSortExpression() {
						return {
							getURIOrderByOptionValue: () => ""
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
[{
	getURIOrderByOptionValue: "~additionalOrderby",
	orderby: null,
	resultingOrderby: "$orderby=~additionalOrderby"
}, {
	getURIOrderByOptionValue: "~additionalOrderby",
	orderby: "~orderby",
	resultingOrderby: "$orderby=~orderby,~additionalOrderby"
}, {
	getURIOrderByOptionValue: "", // no sorter for additional properties
	orderby: null
}, {
	getURIOrderByOptionValue: "", // no sorter for additional properties
	orderby: "~orderby",
	resultingOrderby: "$orderby=~orderby"
}].forEach((oFixture, i) => {
	QUnit.test("_getQueryODataRequestOptions: $orderby considers additional selects, #" + i, function (assert) {
		return setupAnalyticalBinding({}).then((oBinding) => {
			const oAnalyticalQueryRequest = {
					getFilterExpression() {},
					getSortExpression() {},
					getURIQueryOptionValue() {}
				};
			const oAnalyticalQueryRequestMock = this.mock(oAnalyticalQueryRequest);
			const oFilterExpression = {checkValidity() {}};
			oAnalyticalQueryRequestMock.expects("getFilterExpression").withExactArgs().returns(oFilterExpression);
			this.mock(oFilterExpression).expects("checkValidity").withExactArgs();
			oAnalyticalQueryRequestMock.expects("getURIQueryOptionValue").withExactArgs("$select").returns(null);
			oAnalyticalQueryRequestMock.expects("getURIQueryOptionValue").withExactArgs("$filter").returns(null);
			oAnalyticalQueryRequestMock.expects("getURIQueryOptionValue")
				.withExactArgs("$orderby")
				.returns(oFixture.orderby);
			oAnalyticalQueryRequestMock.expects("getURIQueryOptionValue").withExactArgs("$skip").returns(null);
			oAnalyticalQueryRequestMock.expects("getURIQueryOptionValue").withExactArgs("$top").returns(null);
			oAnalyticalQueryRequestMock.expects("getURIQueryOptionValue").withExactArgs("$inlinecount").returns(null);
			const oSortExpression = {getURIOrderByOptionValue() {}};
			oAnalyticalQueryRequestMock.expects("getSortExpression").withExactArgs().returns(oSortExpression);
			this.mock(oSortExpression).expects("getURIOrderByOptionValue")
				.withExactArgs({Property0: true, Property1: true})
				.returns(oFixture.getURIOrderByOptionValue);
			// simulate additional selects of ordinary properties
			oBinding.aAdditionalSelects = ["Property0", "Property1"];
			const aResult = ["$select=Property0,Property1"];
			if (oFixture.resultingOrderby) {
				aResult.push(oFixture.resultingOrderby);
			}

			// code under test
			assert.deepEqual(oBinding._getQueryODataRequestOptions(oAnalyticalQueryRequest, true), aResult);
		});
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
[
	{sName: "sap.ui.model.odata.v2.ODataModel", iVersion: 2},
	{sName: "~other~", iVersion: null}
].forEach((oFixture) => {
	QUnit.test(`_getModelVersion(${oFixture.sName}): ${oFixture.iVersion}`, function (assert) {
		const oModel = {getMetadata() {}};
		const oMetadata = {getName() {}};
		this.mock(oModel).expects("getMetadata").returns(oMetadata);
		this.mock(oMetadata).expects("getName").returns(oFixture.sName);

		// code under test
		assert.strictEqual(AnalyticalBinding._getModelVersion(oModel), oFixture.iVersion);
	});
});
	/** @deprecated As of version 1.48.0 */
	QUnit.test("_getModelVersion(sap.ui.model.odata.ODataModel): 1", function (assert) {
		const oModel = {getMetadata() {}};
		const oMetadata = {getName() {}};
		this.mock(oModel).expects("getMetadata").returns(oMetadata);
		this.mock(oMetadata).expects("getName").returns("sap.ui.model.odata.ODataModel");

		// code under test
		assert.strictEqual(AnalyticalBinding._getModelVersion(oModel), 1);
	});

	//*********************************************************************************************
	QUnit.test("_prepareGroupMembersAutoExpansionQueryRequest-prepareLevelMembersQueryRequest:"
			+ " calls _getHierarchyLevelFiltersAndAddRecursiveHierarchy and"
			+ " _addHierarchyLevelFilters",
		function (assert) {
			var done = assert.async();

			setupAnalyticalBinding({noPaging: true, numberOfExpandedLevels: 2},
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
	QUnit.test("prepareLevelMembersQueryRequest: calls _mergeAndAddSorters", (assert) => {
		const done = assert.async();
		setupAnalyticalBinding({noPaging: true, numberOfExpandedLevels: 2}, (oBinding) => {
			const oMergeAndAddSortersSpy = sinon.spy(oBinding, "_mergeAndAddSorters");
			function fnChangeHandler() {
				oBinding.detachChange(fnChangeHandler);
				// 3x, once for each level
				assert.strictEqual(oMergeAndAddSortersSpy.callCount, 3);
				const aCall1Args = oMergeAndAddSortersSpy.firstCall.args;
				const oCostCenterSorter = new Sorter("CostCenter");
				assert.deepEqual(aCall1Args[0], [oCostCenterSorter]);
				assert.ok(aCall1Args[1] instanceof odata4analytics.SortExpression);

				const aCall2Args = oMergeAndAddSortersSpy.secondCall.args;
				const oCostElementSorter = new Sorter("CostElement");
				assert.deepEqual(aCall2Args[0], [oCostCenterSorter, oCostElementSorter]);
				assert.ok(aCall2Args[1] instanceof odata4analytics.SortExpression);

				const aCall3Args = oMergeAndAddSortersSpy.thirdCall.args;
				const oCurrencySorter = new Sorter("Currency");
				assert.deepEqual(aCall3Args[0], [oCostCenterSorter, oCostElementSorter, oCurrencySorter]);
				assert.ok(aCall3Args[1] instanceof odata4analytics.SortExpression);

				oMergeAndAddSortersSpy.restore();
				done();
			}
			oBinding.attachChange(fnChangeHandler);

			// code under test
			oBinding.getContexts(0, 20, 10);
		});
	});

	//*********************************************************************************************
	QUnit.test("_prepareTotalSizeQueryRequest: hierarchy dimensions tests", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding({}, function (oBinding) {
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

		setupAnalyticalBinding({}, function (oBinding) {
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

			setupAnalyticalBinding({}, function (oBinding) {
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

			setupAnalyticalBinding({}, function (oBinding) {
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

		setupAnalyticalBinding({}, function (oBinding) {
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

		return setupAnalyticalBinding({}, /*fnODataV2Callback*/null, aInitialColumns)
		.then(function (oBinding) {
			var mAnalyticalInfoByProperty = deepExtend({}, oBinding.mAnalyticalInfoByProperty),
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

		setupAnalyticalBinding({}, function (oBinding) {
			var bApplySortersToGroups = {/* true or false */};

			assert.ok(oBinding.bApplySortersToGroups, "constructor sets bApplySortersToGroups");
			assert.ok("sLastAutoExpandMode" in oBinding, "sLastAutoExpandMode defined");
			assert.deepEqual(oBinding.aSorter, []);
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
	QUnit.test("constructor: different IDs", function (assert) {
		var done = assert.async();

		// code under test
		setupAnalyticalBinding({}, function (oBinding0) {
			// code under test
			setupAnalyticalBinding({}, function (oBinding1) {
				assert.notStrictEqual(oBinding0._iId, oBinding1._iId, "Different IDs");
				assert.ok(oBinding0._iId < oBinding1._iId, "ID increases with new instances");

				done();
			}, [], undefined, true);
		}, [], undefined, true);
	});

	//*********************************************************************************************
	QUnit.test("constructor: calls AnalyticalBinding._getModelVersion", function (assert) {
		const done = assert.async();
		const oGetModelVersionSpy = this.spy(AnalyticalBinding, "_getModelVersion");

		// code under test
		setupAnalyticalBinding({}, (_oBinding, oModel) => {
			// once applying the adapter and once in constructor
			assert.strictEqual(oGetModelVersionSpy.callCount, 2);
			assert.ok(oGetModelVersionSpy.firstCall.calledWithExactly(sinon.match.same(oModel)));
			assert.ok(oGetModelVersionSpy.secondCall.calledWithExactly(sinon.match.same(oModel)));
			done();
		}, [], undefined, true);
	});

	//*********************************************************************************************
	QUnit.test("constructor: unsupported model", function (assert) {
		/** @deprecated As of version 1.120, because sap.ui.model.odata.Filter is deprecated since 1.22 */
		this.mock(AnalyticalBinding.prototype).expects("_convertDeprecatedFilterObjects").withExactArgs(undefined);
		const oModel = {createCustomParams() {}};
		this.mock(oModel).expects("createCustomParams").withExactArgs({custom: undefined});
		this.mock(AnalyticalBinding).expects("_getModelVersion").withExactArgs(sinon.match.same(oModel)).returns(null);
		this.oLogMock.expects("error").withExactArgs("The AnalyticalBinding does not support the given model");

		// code under test
		const oBinding = new AnalyticalBinding(oModel, "path",/*oContext*/undefined, /*aSorter*/undefined,
			/*aFilters*/undefined, /*mParameters*/{});

		assert.strictEqual(oBinding.aAllDimensionSortedByName, undefined);
		assert.strictEqual(oBinding.aInitialAnalyticalInfo, undefined);
		assert.strictEqual(oBinding.aAllDimensionSortedByName, undefined);
	});

	//*********************************************************************************************
	QUnit.test("constructor, this.aSorter: sorter parameter is no array", function (assert) {
		var done = assert.async(),
			oSorter = {};

		// code under test
		setupAnalyticalBinding({}, function (oBinding) {
			assert.strictEqual(oBinding.aSorter.length, 1);
			assert.strictEqual(oBinding.aSorter[0], oSorter);

			done();
		}, [], undefined, true, oSorter);
	});

	//*********************************************************************************************
	QUnit.test("constructor, this.aSorter: sorter parameter is array", function (assert) {
		var done = assert.async(),
			aSorter = [];

		// code under test
		setupAnalyticalBinding({}, function (oBinding) {
			assert.strictEqual(oBinding.aSorter, aSorter);

			done();
		}, [], undefined, true, aSorter);
	});

	//*********************************************************************************************
	QUnit.test("updateAnalyticalInfo: bApplySortersToGroups", function (assert) {
		var done = assert.async();

		// with default columns:
		// [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped, oActualCostsTotal]
		setupAnalyticalBinding({}, function (oBinding) {
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
			oColumn = extend({}, oPlannedCostsTotal,
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
	QUnit.test("updateAnalyticalInfo: calls _updateDimensionDetailsTextProperty", function (assert) {
		const oAnalyticalBindingMock = this.mock(AnalyticalBinding);
		oAnalyticalBindingMock.expects("_updateDimensionDetailsTextProperty")
			.withExactArgs(
				sinon.match((oDimension) => (oDimension.getName() === "CostElement")),
				"CostElement",
				sinon.match((oDimensionDetails) => (oDimensionDetails.name === "CostElement"))
			);
		oAnalyticalBindingMock.expects("_updateDimensionDetailsTextProperty")
			.withExactArgs(
				sinon.match((oDimension) => (oDimension.getName() === "CostElement")),
				"CostElementText",
				sinon.match((oDimensionDetails) => (oDimensionDetails.name === "CostElement"))
			);

		return setupAnalyticalBinding({}, undefined, [oCostElementGrouped, oCostElementText]);
	});

	//*********************************************************************************************
	QUnit.test("filter: resets bApplySortersToGroups", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding({}, function (oBinding) {
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

		setupAnalyticalBinding({}, function (oBinding) {
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

			setupAnalyticalBinding({}, function (oBinding) {

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

			setupAnalyticalBinding({}, function (oBinding) {
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
	QUnit.test("_prepareGroupMembersQueryRequest: calls _addSorters", function (assert) {
		var done = assert.async();

		setupAnalyticalBinding({}, function (oBinding) {
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

			setupAnalyticalBinding({provideGrandTotals : false}, function (oBinding) {
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

		setupAnalyticalBinding({}, function (oBinding) {
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
		var done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding) {
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
			that.mock(AnalyticalBinding).expects("_getDeviatingUnitPropertyNames")
				.withExactArgs(sinon.match.same(oRequestDetails.aSelectedUnitPropertyName), oData.results)
				.returns("~aDeviatingUnitPropertyName");
			oBindingMock.expects("_createMultiUnitRepresentativeEntry")
				.withExactArgs(null, sinon.match.same(oData.results[0]),
					sinon.match.same(oRequestDetails.aSelectedUnitPropertyName), "~aDeviatingUnitPropertyName",
					undefined)
				.returns({
					oEntry: {
						__metadata: {uri: ",,,,,,,,*,,,,,,-multiple-units-not-dereferencable|1"},
						ActualCosts: null,
						Currency: "*",
						"^~volatile": true
					},
					bIsNewEntry: true,
					aReloadMeasurePropertyName: []
				});

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

		setupAnalyticalBinding({}, function (oBinding) {
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

		setupAnalyticalBinding({}, function (oBinding) {
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
					bIsFlatListRequest : true,
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
			assert.strictEqual(oBinding.iTotalSize, 2);

			oBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_processGroupMembersQueryResponse calls _getDimensionValue", function (assert) {
		var done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding) {
			var oAnalyticalBindingMock = that.mock(AnalyticalBinding),
				bApplySortersToGroups = {/* true or false*/},
				oBindingMock = that.mock(oBinding),
				oData = {
					"__count" : "1",
					"results":[{
						__metadata : {uri : "foo"},
						CreationTime : {ms : 41635000, __edmType : "Edm.Time"}
					}]
				},
				oEntityA = {CreationTime : {ms : 41634000, __edmType : "Edm.Time"}},
				oModel = oBinding.getModel(),
				oRequestDetails = {
					aAggregationLevel : ["CreationTime"],
					sGroupId : "/",
					bIsFlatListRequest : true,
					oKeyIndexMapping : {sGroupId : "/", iIndex : 0, iServiceKeyIndex : 0 },
					iRequestType : iGroupMembersQueryType,
					aSelectedUnitPropertyName : ["Currency"]
				};

			oBinding.bApplySortersToGroups = bApplySortersToGroups;
			oBindingMock.expects("_canApplySortersToGroups").never();
			oBindingMock.expects("refresh").withExactArgs().never();
			oBindingMock.expects("_getServiceKeys").withExactArgs("/", -1).returns(["a"]);
			that.mock(oModel).expects("getObject").withExactArgs("/a").returns(oEntityA);
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(sinon.match.same(oEntityA.CreationTime))
				.returns("41634000");
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(sinon.match.same(oData.results[0].CreationTime))
				.returns("41635000");

			// code under test
			oBinding._processGroupMembersQueryResponse(oRequestDetails, oData);

			assert.strictEqual(oBinding.bApplySortersToGroups, bApplySortersToGroups);
			assert.strictEqual(oBinding.iTotalSize, 1);

			oBindingMock.verify();
			oAnalyticalBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_mergeLoadedKeyIndexWithSubsequentIndexes case 1-c-II", function (assert) {
		var done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding) {
			var oAnalyticalBindingMock = that.mock(AnalyticalBinding),
				oBindingMock = that.mock(oBinding),
				oEntity0 = {CreationTime : {ms : 41634000, __edmType : "Edm.Time"}},
				oEntity1 = {CreationTime : {ms : 41634000, __edmType : "Edm.Time"}},
				oKeyIndexMapping = {sGroupId : "/", iIndex : 0, iServiceKeyIndex : 1},
				oModel = oBinding.getModel(),
				oModelMock = that.mock(oModel);

			oBinding.mKeyIndex = {"/" : [0, 1, 2, 3]};
			oBinding.mServiceKey = {"/" : ["item('0')", "item('1')", "item('2')", "item('3')"]};
			oBinding.mMultiUnitKey = {"/" : [/*can be ignored*/]};

			oModelMock.expects("getObject").withExactArgs("/item('0')").returns(oEntity0);
			oModelMock.expects("getObject").withExactArgs("/item('1')").returns(oEntity1);
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(sinon.match.same(oEntity0.CreationTime))
				.returns("41634000");
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(sinon.match.same(oEntity1.CreationTime))
				.returns("41634000");
			oAnalyticalBindingMock.expects("_getDeviatingUnitPropertyNames")
				.withExactArgs("~aSelectedUnitPropertyName", [sinon.match.same(oEntity0), sinon.match.same(oEntity1)])
				.returns("~aDeviatingUnitPropertyNames");
			oBindingMock.expects("_createMultiUnitRepresentativeEntry")
				.withExactArgs("/", sinon.match.same(oEntity0), "~aSelectedUnitPropertyName",
					"~aDeviatingUnitPropertyNames", "~bIsFlatListRequest")
				.returns({oEntry : "~entry", bIsNewEntry : true});

			// code under test
			assert.strictEqual(
				oBinding._mergeLoadedKeyIndexWithSubsequentIndexes(oKeyIndexMapping,
					/*aAggregationLevel*/["CreationTime"], "~aSelectedUnitPropertyName", "~bIsFlatListRequest"),
				1, "one discarded entity");

			oBindingMock.verify();
			oAnalyticalBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_mergeLoadedKeyIndexWithSubsequentIndexes case 1-b-I", function (assert) {
		var done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding) {
			var oAnalyticalBindingMock = that.mock(AnalyticalBinding),
				oBindingMock = that.mock(oBinding),
				oEntity0 = {CreationTime : {ms : 41634000, __edmType : "Edm.Time"}},
				oEntity1 = {CreationTime : {ms : 41634000, __edmType : "Edm.Time"}},
				oKeyIndexMapping = {sGroupId : "/", iIndex : 0, iServiceKeyIndex : 2},
				oModel = oBinding.getModel(),
				oModelMock = that.mock(oModel);

			oBinding.mKeyIndex = {"/" : [0, 1, 1, 3]};
			oBinding.mServiceKey = {"/" : ["item('0')", "item('1')", "item('2')", "item('3')"]};
			oBinding.mMultiUnitKey = {"/" : [/*can be ignored*/]};

			oModelMock.expects("getObject").withExactArgs("/item('1')").returns(oEntity0);
			oModelMock.expects("getObject").withExactArgs("/item('2')").returns(oEntity1);
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(sinon.match.same(oEntity0.CreationTime))
				.returns("41634000");
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(sinon.match.same(oEntity1.CreationTime))
				.returns("41634000");
			oAnalyticalBindingMock.expects("_getDeviatingUnitPropertyNames")
				.withExactArgs("~aSelectedUnitPropertyName", [sinon.match.same(oEntity0), sinon.match.same(oEntity1)])
				.returns("~aDeviatingUnitPropertyNames");
			oBindingMock.expects("_createMultiUnitRepresentativeEntry")
				.withExactArgs("/", sinon.match.same(oEntity0), "~aSelectedUnitPropertyName",
					"~aDeviatingUnitPropertyNames", "~bIsFlatListRequest")
				.returns({oEntry : "~entry", bIsNewEntry : true});

			// code under test
			assert.strictEqual(
				oBinding._mergeLoadedKeyIndexWithSubsequentIndexes(oKeyIndexMapping,
					/*aAggregationLevel*/["CreationTime"], "~aSelectedUnitPropertyName", "~bIsFlatListRequest"),
				1, "one discarded entity");

			oBindingMock.verify();
			oAnalyticalBindingMock.verify();
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("_createMultiUnitRepresentativeEntry: URI encoded multi unit entry key parts,"
			+ "handle 'Edm.Time' properties correctly", function (assert) {
		var done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding) {
			var oAnalyticalBindingMock = that.mock(AnalyticalBinding),
				oExpectedMultiUnitEntry = {
					oEntry: {
						"ActualCosts" : null,
						"CostCenter" : "100/1000%2F",
						"CreationTime" : {"__edmType": "Edm.Time", "ms": 60000},
						"Currency" : "EUR",
						"^~volatile" : true,
						"__metadata" : {
							"uri" :
								",,,,,100%2F1000%252F,,~CreationTimeMS,EUR,,,,,,-multiple-units-not-dereferencable|"
									+ oBinding._iId
						}
					},
					bIsNewEntry: true,
					aReloadMeasurePropertyName: ["ActualCosts"]
				},
				oMultiUnitEntry,
				oReferenceEntry = {
					ActualCosts : "1588416",
					CostCenter : "100/1000%2F",
					CreationTime : {ms : 60000, __edmType : "Edm.Time"},
					Currency : "EUR",
					__metadata : {
						uri : "foo"
					}
				};

			oAnalyticalBindingMock.expects("_getDimensionValue").withExactArgs(undefined)
				// for "ControllingArea", "ControllingAreaNoText", "ControllingAreaNoTextEmptyLabel",
				// "ControllingAreaNoTextNoLabel", "ControllingAreaWithTextEmptyLabel", "CostElement", "CurrencyType",
				// "FiscalPeriod", "FiscalVariant", "FiscalYear", "ValueType"
				.exactly(11).returns(undefined);
			// "CostCenter"
			oAnalyticalBindingMock.expects("_getDimensionValue").withExactArgs("100/1000%2F").returns("100/1000%2F");
			oAnalyticalBindingMock.expects("_getDimensionValue")
				.withExactArgs(/*deep copy*/oReferenceEntry.CreationTime)
				.returns("~CreationTimeMS");
			oAnalyticalBindingMock.expects("_getDimensionValue").withExactArgs("EUR").returns("EUR"); // "Currency"

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

			setupAnalyticalBinding({}, function (oBinding, oModel) {
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
				oBindingMock.expects("getResolvedPath")
					.withExactArgs()
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

			setupAnalyticalBinding({}, function (oBinding) {
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
	QUnit.test("_calculateRequiredGroupSection: no data (integrative)", function (assert) {
		return setupAnalyticalBinding().then(function (oBinding) {
			oBinding.mKeyIndex = {"/" : []};

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
	QUnit.test("_calculateRequiredGroupSection: gap ]118, 148[ (integrative)", function (assert) {
		return setupAnalyticalBinding().then(function (oBinding) {
			oBinding.mKeyIndex = {"/" : []};
			for (var i = 0; i < 264; i += 1) {
				if (i <= 118 || i >= 148 && i < 264) {
					oBinding.mKeyIndex["/"][i] = i;
				}
			}
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
	QUnit.test("_calculateRequiredGroupSection: gap ]118, 264[ (integrative)", function (assert) {
		return setupAnalyticalBinding().then(function (oBinding) {
			oBinding.mKeyIndex = {"/" : []};
			for (var i = 0; i < 264; i += 1) {
				if (i <= 118) {
					oBinding.mKeyIndex["/"][i] = i;
				}
			}
			oBinding.mFinalLength["/"] = true;
			oBinding.mLength["/"] = 264;

			// code under test
			assert.deepEqual(
				oBinding._calculateRequiredGroupSection("/", 245, 19, 100),
				{startIndex : 145, length : 264 - 145});
		});
	});

	//*********************************************************************************************
	QUnit.test("_calculateRequiredGroupSection: gaps [30, 40] and [60, 70] (integrative)",
			function (assert) {
		return setupAnalyticalBinding().then(function (oBinding) {
			oBinding.mKeyIndex = {"/" : []};
			for (var i = 0; i < 100; i += 1) {
				if (i < 30 || i > 40 && i < 60 || i > 70 && i < 100) {
					oBinding.mKeyIndex["/"][i] = i;
				}
			}
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
["~aElements", undefined].forEach(function (aElements, i) {
	[
		{vFinalLength : true, iLimit : 100},
		{vFinalLength : false, iLimit : undefined},
		{vFinalLength : undefined, iLimit : undefined}
	].forEach(function (oFixture, j) {
	QUnit.test("_calculateRequiredGroupSection: use ODataUtils " + i + ", " + j, function (assert) {
		var oBinding = {
				mFinalLength : {"/" : oFixture.vFinalLength},
				mKeyIndex : {"/" : aElements},
				mLength : {"/" : 100}
			},
			aIntervals = [{start : 30, end : 71}];

		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(aElements ? "~aElements" : [], 20, 70, 0, oFixture.iLimit)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns({start : 30, end : 71});

		// code under test
		assert.deepEqual(
			AnalyticalBinding.prototype._calculateRequiredGroupSection.call(oBinding,
				"/", 20, 70, 0),
			{startIndex : 30, length : 71 - 30});
	});
	});
});

	//*********************************************************************************************
[
	[{start : 30, end : 71}],
	[{start : 30, end : 41}, {start : 51, end : 71}],
	[{start : 30, end : 41}, {start : 51, end : 61}, {start : 65, end : 71}]
].forEach(function (aIntervals, i) {
	var sTitle = "_calculateRequiredGroupSection: use ODataUtils, multiple intervals #" + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				mFinalLength : {"/" : true},
				mKeyIndex : {"/" : "~aElements"},
				mLength : {"/" : 100}
			};

		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs("~aElements", 20, 70, 0, 100)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns({start : 30, end : 71});

		// code under test
		assert.deepEqual(
			AnalyticalBinding.prototype._calculateRequiredGroupSection.call(oBinding,
				"/", 20, 70, 0),
			{startIndex : 30, length : 71 - 30});
	});
});

	//*********************************************************************************************
[
	{length : 70, expected : 0},
	{length : -1, expected : -1}
].forEach(function (oFixture, i) {
	var sTitle = "_calculateRequiredGroupSection: use ODataUtils, no intervals #" + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				mFinalLength : {"/" : true},
				mKeyIndex : {"/" : "~aElements"},
				mLength : {"/" : 100}
			},
			aIntervals = [];

		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs("~aElements", 20, oFixture.length, 0, 100)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns(undefined);

		// code under test
		assert.deepEqual(
			AnalyticalBinding.prototype._calculateRequiredGroupSection.call(oBinding,
				"/", 20, oFixture.length, 0),
			{startIndex : 0, length : oFixture.expected});
	});
});

	//*********************************************************************************************
	// BCP: 1980533509
	QUnit.test("_prepareGroupMembersAutoExpansionQueryRequest/prepareLevelMembersQueryRequest:"
			+ " Allow expansion of all dimensions", function (assert) {

		return setupAnalyticalBinding({
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

	//*********************************************************************************************
	// BCP: 2080317936
[{
	inputKey : [",,*,,A,,-multiple-units", ",,*,,B,,-multiple-units"],
	keyIndex : ["ZERO", -2],
	resultKeyIndex : [0, 1],
	serviceKey : ["item('A_0')", "item('A_1')", "item('B_0')", "item('B_1')"],
	title : "first multi-unit key, second multi-unit key"
}, {
	inputKey : [",,*,,A,,-multiple-units", "item('B')"],
	keyIndex : ["ZERO", 2],
	resultKeyIndex : [0, 1],
	serviceKey : ["item('A_0')", "item('A_1')", "item('B')"],
	title : "first multi-unit key, second normal key"
}, {
	inputKey : ["item('A')", ",,*,,B,,-multiple-units"],
	keyIndex : [0, -1],
	resultKeyIndex : [0, 1],
	serviceKey : ["item('A')", "item('B_0')", "item('B_1')"],
	title : "first normal key, second multi-unit key"
}, {
	inputKey : [",,*,,C,,-multiple-units", "item('C')"],
	keyIndex : ["ZERO", -2],
	resultKeyIndex : [-1, -1],
	serviceKey : ["item('A_0')", "item('A_1')", "item('B_0')", "item('B_1')"],
	title : "keys do not match"
}].forEach(function (oFixture, i) {
	QUnit.test("_findKeyIndex: " + oFixture.title, function (assert) {
		var oBinding = {
				mKeyIndex : {"/" : oFixture.keyIndex},
				mLength : {"/" : 2},
				mMultiUnitKey : {"/" : [",,*,,A,,-multiple-units", ",,*,,B,,-multiple-units"]},
				mServiceKey : {"/" : oFixture.serviceKey}
			},
			n;

		// code under test
		for (n = 0; n < oFixture.inputKey.length; n += 1) {
			assert.strictEqual(
				AnalyticalBinding.prototype._findKeyIndex.call(oBinding, "/", oFixture.inputKey[n]),
				oFixture.resultKeyIndex[n]);
		}
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bSuppressResetData) {
	[
		{iLevels : undefined, numberOfExpandedLevels : 0},
		{
			iLevels : -1,
			log : "Number of expanded levels was set to 0. Negative values are prohibited",
			numberOfExpandedLevels : 0
		},
		{iLevels : 0, numberOfExpandedLevels : 0},
		{iLevels : 1, numberOfExpandedLevels : 1},
		{iLevels : 2, numberOfExpandedLevels : 2},
		// simulate expand all from analytical table
		{
			iLevels : 3,
			log : "Number of expanded levels was reduced from 3 to 2 which is the number of grouped"
				+ " dimensions",
			numberOfExpandedLevels : 2
		}
	].forEach(function (oFixture) {
	var sTitle = "setNumberOfExpandedLevels: iLevels = " + oFixture.iLevels
			+ ", bSuppressResetData = " + bSuppressResetData;

	QUnit.test(sTitle, function (assert) {
		var done = assert.async(),
			that = this;

		setupAnalyticalBinding({}, function (oBinding) {
			// that.oLogMock cannot be used as it mocks AnalyticalBinding.Logger which is not used
			// in sap.ui.model.analytics.AnalyticalTreeBindingAdapter
			that.mock(Log).expects("warning")
				.withExactArgs(oFixture.log, sinon.match.same(oBinding),
					"sap.ui.model.analytics.AnalyticalTreeBindingAdapter")
				.exactly(oFixture.log ? 1 : 0);
			that.mock(oBinding).expects("resetData")
				.withExactArgs()
				.exactly(bSuppressResetData ? 0 : 1);

			// code under test
			oBinding.setNumberOfExpandedLevels(oFixture.iLevels, bSuppressResetData);

			assert.strictEqual(oBinding.mParameters.numberOfExpandedLevels,
				oFixture.numberOfExpandedLevels);

			done();
		}, [oCostCenterGrouped, oCostElementGrouped, oCostElementTextGrouped, oActualCostsTotal]);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_resetData: without group ID", function (assert) {
		var oAnalyticalBinding = {
				aBatchRequestQueue: "~aBatchRequestQueue",
				mEntityKey: "~mEntityKey",
				mFinalLength: "~mFinalLength",
				mKeyIndex: "~mKeyIndex",
				mLength: "~mLength",
				mMultiUnitKey: "~mMultiUnitKey",
				mServiceFinalLength: "~mServiceFinalLength",
				mServiceKey: "~mServiceKey",
				mServiceLength: "~mServiceLength"
			};

		// code under test
		AnalyticalBinding.prototype._resetData.call(oAnalyticalBinding);

		assert.deepEqual(oAnalyticalBinding.aBatchRequestQueue, []);
		assert.deepEqual(oAnalyticalBinding.mEntityKey, {});
		assert.deepEqual(oAnalyticalBinding.mFinalLength, {});
		assert.deepEqual(oAnalyticalBinding.mKeyIndex, {});
		assert.deepEqual(oAnalyticalBinding.mLength, {});
		assert.deepEqual(oAnalyticalBinding.mMultiUnitKey, {});
		assert.strictEqual(oAnalyticalBinding.mServiceFinalLength, oAnalyticalBinding.mFinalLength);
		assert.deepEqual(oAnalyticalBinding.mServiceKey, {});
		assert.deepEqual(oAnalyticalBinding.mServiceLength, {});
	});

	//*********************************************************************************************
	QUnit.test("_resetData: with group ID", function (assert) {
		var oAnalyticalBinding = {
				aBatchRequestQueue: "~aBatchRequestQueue",
				mEntityKey: {bar: "~bar", foo: "~foo"},
				mFinalLength: "~mFinalLength",
				mKeyIndex: {bar: "~bar", foo: "~foo"},
				mLength: {bar: "~bar", foo: "~foo"},
				mMultiUnitKey: {bar: "~bar", foo: "~foo"},
				mServiceFinalLength: {bar: "~bar", foo: "~foo"},
				mServiceKey: {bar: "~bar", foo: "~foo"},
				mServiceLength: {bar: "~bar", foo: "~foo"}
			};

		// code under test
		AnalyticalBinding.prototype._resetData.call(oAnalyticalBinding, "foo");

		assert.deepEqual(oAnalyticalBinding.aBatchRequestQueue, "~aBatchRequestQueue", "unchanged");
		assert.deepEqual(oAnalyticalBinding.mEntityKey, {bar: "~bar"});
		assert.deepEqual(oAnalyticalBinding.mFinalLength, "~mFinalLength", "unchanged");
		assert.deepEqual(oAnalyticalBinding.mKeyIndex, {bar: "~bar"});
		assert.deepEqual(oAnalyticalBinding.mLength, {bar: "~bar"});
		assert.deepEqual(oAnalyticalBinding.mMultiUnitKey, {bar: "~bar"});
		assert.deepEqual(oAnalyticalBinding.mServiceFinalLength, {bar: "~bar"});
		assert.deepEqual(oAnalyticalBinding.mServiceKey, {bar: "~bar"});
		assert.deepEqual(oAnalyticalBinding.mServiceLength, {bar: "~bar"});
	});

	//*********************************************************************************************
[{
	aKeyIndex : undefined,
	aServiceKeyIndex : undefined,
	iStartIndex : "~iStartIndex",
	iExpectedServiceKeyIndex : "~iStartIndex"
}, {
	aKeyIndex : ["ZERO", 2],
	aServiceKeyIndex : ["key0.0", "key0.1", "key1"],
	iStartIndex : 3,
	iExpectedServiceKeyIndex : 4
}, {
	aKeyIndex : [0, -1],
	aServiceKeyIndex : ["key0", "key1.0", "key1.1"],
	iStartIndex : 2,
	iExpectedServiceKeyIndex : 3
}, {
	aKeyIndex : [0, 1, -2, 4],
	aServiceKeyIndex : ["key0", "key1", "key2", "key2.1", "key3"],
	iStartIndex : 2,
	iExpectedServiceKeyIndex : 2
}, {
	aKeyIndex : ["ZERO", 2, 3],
	aServiceKeyIndex : ["key0.0", "key0.1", "key1.0", "key2"],
	iStartIndex : 2,
	iExpectedServiceKeyIndex : 3
}, {
	aKeyIndex : [0],
	aServiceKeyIndex : ["key0"],
	iStartIndex : 0,
	iExpectedServiceKeyIndex : 0
}, {
	aKeyIndex : ["ZERO"],
	aServiceKeyIndex : ["key0"],
	iStartIndex : 0,
	iExpectedServiceKeyIndex : 0
}, { // BCP: 2070284104
	aKeyIndex : ["ZERO", 2],
	aServiceKeyIndex : ["key0.0", "key0.1", "key1"],
	iStartIndex : 1,
	iExpectedServiceKeyIndex : 2
}, {
	aKeyIndex : [0, 1, -2, 4, -5, 9],
	iStartIndex : 4,
	iExpectedServiceKeyIndex : 5
}, { // BCP: 2070284104
	aKeyIndex : [0, 1, -2, 4, -5, 9],
	iStartIndex : 5,
	iExpectedServiceKeyIndex : 9
}].forEach(function (oFixture, i) {
	QUnit.test("_getKeyIndexMapping: " + i, function (assert) {
		var oBinding = {
				mKeyIndex : {
					"~sGroupId" : oFixture.aKeyIndex
				},
				mServiceKey : {
					"~sGroupId" : oFixture.aServiceKeyIndex
				}
			},
			oKeyIndexMapping;

		// code under test
		oKeyIndexMapping = AnalyticalBinding.prototype._getKeyIndexMapping.call(oBinding,
			"~sGroupId", oFixture.iStartIndex);

		assert.deepEqual(oKeyIndexMapping, {
			sGroupId : "~sGroupId",
			iIndex : oFixture.iStartIndex,
			iServiceKeyIndex : oFixture.iExpectedServiceKeyIndex
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_getResourcePath: calls getResolvedPath", function (assert) {
		var oBinding = {
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");

		// code under test
		assert.strictEqual(AnalyticalBinding.prototype._getResourcePath.call(oBinding),
			"~resolvedPath");
	});

	//*********************************************************************************************
	QUnit.test("_refresh: calls getResolvedPath", function (assert) {
		var oBinding = {
				oModel : {
					oMetadata : {_getEntityTypeByPath : function () {}}
				},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~resolvedPath")
			.returns(undefined);

		// code under test
		AnalyticalBinding.prototype._refresh.call(oBinding,
			/*bForceUpdate*/ undefined, /*mChangedEntities*/ undefined, "~mEntityTypes");
	});

	//*********************************************************************************************
[
	[{
		length : "~iLength",
		numberOfExpandedLevels : 42,
		startIndex : "~iStartIndex",
		threshold : "~iThreshold"
	}],
	["~iStartIndex", "~iLength", 42, "~iThreshold"]
].forEach(function (aArguments, i) {
	QUnit.test("getRootContexts: parameters map behaves the same as using optional parameters " + i,
			function (assert) {
		var oBinding = {
				oModel : {getContext : function () {}},
				_considerRequestGrouping : function () {},
				_getContextsForParentContext : function () {},
				_getRequestId : function () {},
				_prepareGroupMembersAutoExpansionRequestIds : function () {},
				getModel : function () {},
				getNodeContexts : function () {},
				isInitial : function () {}
			},
			aRootContext = ["foo", "bar"];

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getRequestId")
			.withExactArgs(/*AnalyticalBinding._requestType*/1, {groupId : null})
			.returns("~sRootContextGroupMembersRequestId");
		this.mock(oBinding).expects("_getContextsForParentContext").withExactArgs(null)
			.returns(aRootContext);
		this.mock(oBinding).expects("_prepareGroupMembersAutoExpansionRequestIds")
			.withExactArgs("/", /*numberOfExpandedLevels*/42)
			.returns(["~requestId"]);
		this.mock(oBinding).expects("_considerRequestGrouping")
			.withExactArgs(["~requestId", "~sRootContextGroupMembersRequestId"]);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oBinding.oModel);
		this.mock(oBinding.oModel).expects("getContext").withExactArgs("/").returns("~context");
		this.mock(oBinding).expects("getNodeContexts").withExactArgs("~context", {
				startIndex : "~iStartIndex",
				level : 0,
				length : "~iLength",
				threshold : "~iThreshold",
				numberOfExpandedLevels : 42
			});

		// code under test
		assert.strictEqual(AnalyticalBinding.prototype.getRootContexts.apply(oBinding, aArguments),
			aRootContext);
	});
});

	//*********************************************************************************************
[
	{mParameters : {level : 0}, bResult : true},
	{mParameters : {level : 1}, bResult : false},
	{mParameters : undefined, bResult : false}
].forEach(function (oFixture, i) {
	QUnit.test("hasChildren: mParameters is optional; " + i, function (assert) {
		var oBinding = {
				aAggregationLevel : []
			};

		// code under test
		assert.strictEqual(AnalyticalBinding.prototype.hasChildren.call(oBinding, "~oContext",
			oFixture.mParameters), oFixture.bResult);
	});
});

	//*********************************************************************************************
	QUnit.test("getCount", function (assert) {
		var oBinding = {iTotalSize : 5};

		// code under test
		assert.strictEqual(AnalyticalBinding.prototype.getCount.call(oBinding), 5);

		oBinding.iTotalSize = -1;

		// code under test
		assert.strictEqual(AnalyticalBinding.prototype.getCount.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_processTotalSizeQueryResponse: __count is parsed as int", function (assert) {
		var oBinding = {};

		// code under test
		AnalyticalBinding.prototype._processTotalSizeQueryResponse.call(oBinding, undefined,
			{__count : "5"});

		assert.strictEqual(oBinding.iTotalSize, 5);
	});

	//*********************************************************************************************
	// Binding triggers change event also if there are no group members so that the AnalyticalTable
	// displays its "No Data" text.
	// BCP: 2170218821
	QUnit.test("_processLevelMembersQueryResponse: update on empty data", function (assert) {
		var oBinding = {bNeedsUpdate : false};

		// code under test
		AnalyticalBinding.prototype._processLevelMembersQueryResponse
			.call(oBinding, /*oRequestDetails, not needed*/ undefined, /*oData*/{results : []});

		assert.strictEqual(oBinding.bNeedsUpdate, true);
	});

	//*********************************************************************************************
	// Avoid empty rows, if received data does not belong to the watermark node.
	// BCP: 2280169612
	QUnit.test("_processLevelMembersQueryResponse: adjust start index if data belongs to a"
			+ " different node than the watermark node", function (assert) {
		var oModel = {
				_getKey : function () {},
				getContext : function () {}
			},
			oModelMock = this.mock(oModel),
			oBinding = {
				mEntityKey : {"~group0" : "~entitykey0"},
				mFinalLength : {"~groupMissing" : false},
				oModel : oModel,
				_findKeyIndex : function () {},
				_getKeyIndexMapping : function () {},
				_getGroupIdFromContext : function () {},
				_getParentGroupId : function () {},
				_getRequestId : function () {},
				_processGroupMembersQueryResponse : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oRequestDetails = {
				aAggregationLevel : "~aAggregationLevel",
				bAvoidLengthUpdate : "~bAvoidLengthUpdate",
				oAnalyticalQueryRequest : "~oAnalyticalQueryRequest",
				sGroupId_Missing_AtLevel : "~groupMissing",
				bIsFlatListRequest : "~bIsFlatListRequest",
				bIsLeafGroupsRequest : "~bIsLeafGroupsRequest",
				iLength : 10,
				iLevel : 3,
				aSelectedUnitPropertyName : "~aSelectedUnitPropertyName",
				iStartIndex : 2
			},
			oResponseData = {
				results : ["~oEntry0", "~oEntry1"]
			};

		oModelMock.expects("_getKey").withExactArgs("~oEntry0").twice().returns("~key0");
		oModelMock.expects("getContext").withExactArgs("/~key0").twice().returns("~oContext0");
		oBindingMock.expects("_getGroupIdFromContext")
			.withExactArgs("~oContext0", 2)
			.twice()
			.returns("~group0");
		oModelMock.expects("_getKey").withExactArgs("~oEntry1").returns("~key1");
		oModelMock.expects("getContext").withExactArgs("/~key1").returns("~oContext1");
		oBindingMock.expects("_getGroupIdFromContext")
			.withExactArgs("~oContext1", 2)
			.returns("~group1");
		// data for the first group which belongs to a different node than the watermark node
		oBindingMock.expects("_getRequestId")
			.withExactArgs(/*groupMembersQuery*/ 1, {groupId : "~group0"})
			.returns("~requestId0");
		oBindingMock.expects("_getParentGroupId").withExactArgs("~group0").returns("~group0parent");
		oBindingMock.expects("_findKeyIndex")
			.withExactArgs("~group0parent", "~entitykey0")
			// the first entity in the response is the first node of a parent node next to the
			// watermark node
			.returns(0);
		oBindingMock.expects("_getKeyIndexMapping")
			.withExactArgs("~group0", 0)
			.returns("~keyIndexMapping0");
		oBindingMock.expects("_processGroupMembersQueryResponse")
			.withExactArgs({
				aAggregationLevel : "~aAggregationLevel",
				oAnalyticalQueryRequest : "~oAnalyticalQueryRequest",
				bAvoidLengthUpdate : "~bAvoidLengthUpdate",
				sGroupId : "~group0",
				bIsFlatListRequest : "~bIsFlatListRequest",
				bIsLeafGroupsRequest : "~bIsLeafGroupsRequest",
				oKeyIndexMapping : "~keyIndexMapping0",
				iLength : 10,
				sRequestId : "~requestId0",
				iRequestType : /*groupMembersQuery*/ 1,
				aSelectedUnitPropertyName : "~aSelectedUnitPropertyName",
				iStartIndex : 0
			}, {results : ["~oEntry0"]});
		// data for further groups
		oBindingMock.expects("_getRequestId")
			.withExactArgs(/*groupMembersQuery*/1, {groupId : "~group1"})
			.returns("~requestId1");
		oBindingMock.expects("_getKeyIndexMapping")
			.withExactArgs("~group1", 0)
			.returns("~keyIndexMapping1");
		oBindingMock.expects("_processGroupMembersQueryResponse")
			.withExactArgs({
				aAggregationLevel : "~aAggregationLevel",
				oAnalyticalQueryRequest : "~oAnalyticalQueryRequest",
				bAvoidLengthUpdate : "~bAvoidLengthUpdate",
				sGroupId : "~group1",
				bIsFlatListRequest : "~bIsFlatListRequest",
				bIsLeafGroupsRequest : "~bIsLeafGroupsRequest",
				oKeyIndexMapping : "~keyIndexMapping1",
				iLength : 10,
				sRequestId : "~requestId1",
				iRequestType : /*groupMembersQuery*/ 1,
				aSelectedUnitPropertyName : "~aSelectedUnitPropertyName",
				iStartIndex : 0
			}, {results : ["~oEntry1"]});

		// code under test
		AnalyticalBinding.prototype._processLevelMembersQueryResponse.call(oBinding,
			oRequestDetails, oResponseData);

		assert.strictEqual(oBinding.mFinalLength["~groupMissing"], true, "final length updated");
	});
	//TODO: _processLevelMembersQueryResponse: if the last data record belongs to a new group, then
	// processSingleGroupFromLevelSubset is called with bIncompleteGroupMembersSet = true for the
	// group of the second last entry which sets oGroupMembersRequestDetails.iLength to the
	// number of entries for that group which causes in _processGroupMembersQueryResponse that the
	// final length is not set for that group. So the watermark is set wrongly and data is requested
	// twice.

	//*********************************************************************************************
	// BCP: 2380036006 fire data received also in error case and updated analytical info
	QUnit.test("_executeBatchRequest: error cases", function (assert) {
		const oAnalyticalQueryRequest = {
				getURIQueryOptionValue: function () {},
				getURIToQueryResultEntries: function () {}
			},
			oError = {statusText: "abort"},
			oModel = {
				fireRequestCompleted() {},
				read: function () {}
			},
			oModelMock = this.mock(oModel),
			oBinding = {
				iAnalyticalInfoVersionNumber: 1,
				oModel: oModel,
				iModelVersion: 2,
				_getIdForNewRequestHandle: function () {},
				_getQueryODataRequestOptions: function () {},
				_isRequestPending: function () {},
				_registerNewRequest: function () {},
				_registerNewRequestHandle: function () {},
				fireDataReceived: function () {},
				fireDataRequested: function () {}
			},
			oBindingMock = this.mock(oBinding),
			aRequestDetails = [{
				oAnalyticalQueryRequest: oAnalyticalQueryRequest,
				bIsLeafGroupsRequest: "~isLeafGroupsRequest",
				sRequestId: "~requestId"
			}];

		this.mock(oAnalyticalQueryRequest).expects("getURIQueryOptionValue")
			.withExactArgs("$select")
			.returns("~select");
		this.mock(oAnalyticalQueryRequest).expects("getURIToQueryResultEntries")
			.withExactArgs()
			.returns("~path");
		oBindingMock.expects("_isRequestPending").withExactArgs("~requestId").returns(false);
		oBindingMock.expects("_registerNewRequest").withExactArgs("~requestId");
		oBindingMock.expects("_getQueryODataRequestOptions")
			.withExactArgs(sinon.match.same(oAnalyticalQueryRequest), "~isLeafGroupsRequest", {encode: true})
			.returns("~urlParameters");
		this.mock(oModel).expects("read").withExactArgs("/~path", {
				success: sinon.match.func,
				error: sinon.match.func,
				context: undefined,
				urlParameters: "~urlParameters"
			})
			.returns("~requestHandle");
		oBindingMock.expects("_getIdForNewRequestHandle").withExactArgs().returns("~newHandle");
		oBindingMock.expects("fireDataRequested").withExactArgs();
		const oSetupExpectation = this.mock(BatchResponseCollector.prototype).expects("setup")
			.withExactArgs({
				executedRequests: [sinon.match.same(aRequestDetails[0])],
				binding: sinon.match.same(oBinding),
				success: sinon.match.func,
				error: sinon.match.func
			});
		this.mock(oBinding).expects("_registerNewRequestHandle").withExactArgs("~newHandle", sinon.match.object);

		// code under test
		AnalyticalBinding.prototype._executeBatchRequest.call(oBinding, aRequestDetails);

		oBinding.iAnalyticalInfoVersionNumber = 2; // new analytical info causes abort of pending requests
		oBindingMock.expects("fireDataReceived").withExactArgs();

		// code under test - simulate abort; different iAnalyticalInfoVersionNumber
		oSetupExpectation.args[0][0].error(oError);

		oBinding.iAnalyticalInfoVersionNumber = 1; // same iAnalyticalInfoVersionNumber
		oModelMock.expects("fireRequestCompleted").withExactArgs({
			async : true,
			errorobject: sinon.match.same(oError),
			info: "",
			infoObject : {},
			success: false,
			type : "POST",
			url : ""
		});
		oBindingMock.expects("fireDataReceived").withExactArgs();

		// code under test - simulate abort error in V2 case; same iAnalyticalInfoVersionNumber
		oSetupExpectation.args[0][0].error(oError);
		/** @deprecated As of version 1.48.0 */
		((() => {
			oModelMock.restore();
			oModel._handleError = () => {};
			oModel.fireRequestFailed = () => {};
			oBinding.iModelVersion = 1;
			const oV1ModelMock = this.mock(oModel);
			oV1ModelMock.expects("_handleError").withExactArgs(sinon.match.same(oError)).returns("~oError0");
			oV1ModelMock.expects("fireRequestCompleted").withExactArgs({
				async : true,
				errorobject: "~oError0",
				info: "",
				infoObject : {},
				success: false,
				type : "POST",
				url : ""
			});
			oV1ModelMock.expects("fireRequestFailed").withExactArgs("~oError0");
			oBindingMock.expects("fireDataReceived").withExactArgs();

			// code under test - simulate abort error in V1 case; same iAnalyticalInfoVersionNumber
			oSetupExpectation.args[0][0].error(oError);
		})());
	});

	//*********************************************************************************************
[undefined, {name : "~differentPropertyName"}].forEach(function (oTextProperty, i) {
	QUnit.test("_updateDimensionDetailsTextProperty: property is not the text property, " + i, function (assert) {
		const oDimension = {getTextProperty() {}};
		this.mock(oDimension).expects("getTextProperty").withExactArgs().returns(oTextProperty);
		const oDimensionDetails = {textPropertyName : "unchanged"};

		// code under test
		AnalyticalBinding._updateDimensionDetailsTextProperty(oDimension, "~propertyName", oDimensionDetails);

		assert.strictEqual(oDimensionDetails.textPropertyName, "unchanged");
	});
});

	//*********************************************************************************************
	QUnit.test("_updateDimensionDetailsTextProperty: property is the text property", function (assert) {
		const oDimension = {getTextProperty() {}};
		this.mock(oDimension).expects("getTextProperty").withExactArgs().returns({name : "~propertyName"});
		const oDimensionDetails = {};

		// code under test
		AnalyticalBinding._updateDimensionDetailsTextProperty(oDimension, "~propertyName", oDimensionDetails);

		assert.strictEqual(oDimensionDetails.textPropertyName, "~propertyName");
	});

	//*********************************************************************************************
[
	{descending : true, sortOrder : odata4analytics.SortOrder.Descending},
	{descending : false, sortOrder : odata4analytics.SortOrder.Ascending}
].forEach((oFixture) => {
	QUnit.test("_addSorter", function (assert) {
		const oSortExpression = {addSorter() {}};
		this.mock(oSortExpression).expects("addSorter")
			.withExactArgs("~path", sinon.match.same(oFixture.sortOrder), "~bIgnoreIfAlreadySorted");
		const oSorter = {bDescending : oFixture.descending, sPath : "~path"};

		// code under test
		AnalyticalBinding._addSorter(oSorter, oSortExpression, "~bIgnoreIfAlreadySorted");
	});
});

	//*********************************************************************************************
	QUnit.test("_mergeAndAddSorters", function (assert) {
		const oAnalyticalBindingMock = this.mock(AnalyticalBinding);
		// add oApplicationSorter0 and oGroupingSorter0 due to same path
		const oApplicationSorter0 = {sPath : "~path0"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oApplicationSorter0), "~oSortExpression");
		const oGroupingSorter0 = {sPath : "~path0"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oGroupingSorter0), "~oSortExpression", true);

		// add oApplicationSorter1 and oGroupingSorter1 due to textPropertyName
		const oApplicationSorter1 = {sPath : "~path1"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oApplicationSorter1), "~oSortExpression");
		const oGroupingSorter1 = {sPath : "~dimensionPath1"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oGroupingSorter1), "~oSortExpression", true);

		// only add oGroupingSorter2
		const oGroupingSorter2 = {sPath : "~dimensionPath2"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oGroupingSorter2), "~oSortExpression", true);

		// add the rest of application sorters at the end
		const oApplicationSorter2 = {sPath : "~path2"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oApplicationSorter2), "~oSortExpression", true);
		const oApplicationSorter3 = {sPath : "~path3"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oApplicationSorter3), "~oSortExpression", true);
		const oBinding = {
			oDimensionDetailsSet : {
				"~dimensionPath1" : {textPropertyName : "~path1"},
				"~dimensionPath2" : {textPropertyName : "~foo"}
			},
			aSorter : [oApplicationSorter0, oApplicationSorter1, oApplicationSorter2, oApplicationSorter3]
		};

		// code under test
		AnalyticalBinding.prototype._mergeAndAddSorters.call(oBinding,
			[oGroupingSorter0, oGroupingSorter1, oGroupingSorter2], "~oSortExpression");

		assert.deepEqual(oBinding.aSorter,
			[oApplicationSorter0, oApplicationSorter1, oApplicationSorter2, oApplicationSorter3]);
	});

	//*********************************************************************************************
	QUnit.test("_addSorters: cannot apply sorters to groups", function (assert) {
		const oBinding = {
			_canApplySortersToGroups() {},
			_mergeAndAddSorters() {}
		};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_canApplySortersToGroups").withExactArgs().returns(false);
		oBindingMock.expects("_mergeAndAddSorters").withExactArgs("~aGroupingSorters", "~oSortExpression");

		// code under test
		AnalyticalBinding.prototype._addSorters.call(oBinding, "~oSortExpression", "~aGroupingSorters");
	});

	//*********************************************************************************************
	QUnit.test("_addSorters: can apply sorters to groups", function (assert) {
		const oApplicationSorter0 = {sPath : "~path0"};
		const oApplicationSorter1 = {sPath : "~path1"};
		const oBinding = {
			aSorter : [oApplicationSorter0, oApplicationSorter1],
			_canApplySortersToGroups() {},
			_mergeAndAddSorters() {}
		};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_canApplySortersToGroups").withExactArgs().returns(true);
		const oAnalyticalBindingMock = this.mock(AnalyticalBinding);
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oApplicationSorter0), "~oSortExpression");
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oApplicationSorter1), "~oSortExpression");
		const oGroupingSorter0 = {sPath : "~path0"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oGroupingSorter0), "~oSortExpression", true);
		const oGroupingSorter1 = {sPath : "~path1"};
		oAnalyticalBindingMock.expects("_addSorter")
			.withExactArgs(sinon.match.same(oGroupingSorter1), "~oSortExpression", true);
		oBindingMock.expects("_mergeAndAddSorters").never();

		// code under test
		AnalyticalBinding.prototype._addSorters.call(oBinding, "~oSortExpression",
			[oGroupingSorter0, oGroupingSorter1]);
	});

	//*********************************************************************************************
	QUnit.test("_getDimensionValue", function (assert) {
		// code under test
		assert.strictEqual(AnalyticalBinding._getDimensionValue(undefined), undefined);

		// code under test
		assert.strictEqual(AnalyticalBinding._getDimensionValue(null), null);

		// code under test
		assert.strictEqual(AnalyticalBinding._getDimensionValue({ms: "~ms", __edmType: "Edm.Time"}), "~ms");

		// code under test
		assert.strictEqual(AnalyticalBinding._getDimensionValue("foo"), "foo");

		var oDate = new Date(1395705600000);
		// code under test
		assert.strictEqual(AnalyticalBinding._getDimensionValue(oDate), oDate);
	});

	//*********************************************************************************************
	QUnit.test("_getDeviatingUnitPropertyNames", function (assert) {
		var aSelectedUnitPropertyNames = ["~Property0", "~Property1", "~Property2"],
			aMultiUnitEntries = [
				{"~Property0": "~a0", "~Property1": "b", "~Property2": "~c0"},
				{"~Property0": "~a0", "~Property1": "b", "~Property2": "~c0"},
				{"~Property0": "~a1", "~Property1": "b", "~Property2": "~c1"}
			];

		// code under test
		assert.deepEqual(
			AnalyticalBinding._getDeviatingUnitPropertyNames(aSelectedUnitPropertyNames, aMultiUnitEntries),
			["~Property0", "~Property2"]);
	});
});