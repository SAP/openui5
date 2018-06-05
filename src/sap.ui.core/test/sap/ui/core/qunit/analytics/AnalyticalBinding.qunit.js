/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/analytics/odata4analytics",
	"sap/ui/model/analytics/AnalyticalBinding",
	"sap/ui/model/analytics/AnalyticalTreeBindingAdapter",
	"sap/ui/model/analytics/ODataModelAdapter",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Sorter',
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/qunit/analytics/o4aMetadata",
	"sap/ui/core/qunit/analytics/TBA_ServiceDocument",
	"sap/ui/core/qunit/analytics/TBA_NoBatch",
	"sap/ui/core/qunit/analytics/TBA_Batch_Contexts",
	"sap/ui/core/qunit/analytics/TBA_Batch_ExpandCollapseToggle",
	"sap/ui/core/qunit/analytics/TBA_Batch_Filter",
	"sap/ui/core/qunit/analytics/TBA_Batch_Sort"
], function (jQuery, odata4analytics, AnalyticalBinding, AnalyticalTreeBindingAdapter,
		ODataModelAdapter, Filter, FilterOperator, Sorter, ODataModelV1, ODataModelV2,
		o4aFakeService) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0 */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var sServiceURL = "http://o4aFakeService:8080/",
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
		oCostElementText = {
			name: "CostElementText",
			grouped: false,
			inResult: false,
			sortOrder: "Ascending",
			sorted: false,
			total: false,
			visible: true
		},
		sPath = "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',"
			+ "P_CostCenterTo='999-9999')/Results";

	function setupAnalyticalBinding(iVersion, mParameters, fnODataV2Callback, aAnalyticalInfo,
			sBindingPath, bSkipInitialize, aSorters, aFilters) {
		var oBinding,
			oModel;

		mParameters = mParameters || {};
		aAnalyticalInfo = aAnalyticalInfo
			|| [oCostCenterGrouped, oCostElementGrouped, oCurrencyGrouped, oActualCostsTotal];

		mParameters = mParameters || {};
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
				useBatchRequests: true,
				numberOfExpandedLevels: mParameters.numberOfExpandedLevels || 0,
				noPaging: mParameters.noPaging || false,
				custom: mParameters.custom || undefined,
				select: mParameters.select
			}
		);
		AnalyticalTreeBindingAdapter.apply(oBinding);

		//V1 => synchronous metadata, initialize the binding directly
		if (iVersion === 1) {
			oBinding.initialize();
			return {
				binding : oBinding,
				model : oModel};
		} else {
			oModel.attachMetadataLoaded(function () {
				oBinding.initialize();
				fnODataV2Callback(oBinding, oModel);
			});
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.AnalyticalBinding", {
		afterEach : function (assert) {
			// this would ruin AnalyticalTable.qunit.js in testsuite4analytics
//			XMLHttpRequest.restore();
			this.oLogMock.verify();
		},

		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
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

		this.oLogMock.expects("warning")
			.withExactArgs("EventProvider sap.ui.model.odata.ODataModel "
				+ "path /$metadata should be absolute if no Context is set");


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
		QUnit.test("getDownloadURL: no duplicate units / select parameter: " + i, function(assert) {
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

			done();
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
			"it does not contain the property 'CostElement'", // only the associated property is contained in analytical info
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
		QUnit.test("updateAnalyticalInfo: select causes warnings #" + i, function(assert) {
			var oBinding,
				done = assert.async(),
				oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURL, {
					tokenHandling : false,
					json : true
				}),
				that = this;

			sap.ui.model.analytics.ODataModelAdapter.apply(oModel);
			oBinding = new sap.ui.model.analytics.AnalyticalBinding(oModel, sPath, null, [], [], {
				analyticalInfo : oFixture.analyticalInfo,
				useBatchRequests : true,
				numberOfExpandedLevels : 0,
				noPaging : false,
				select : oFixture.select
			});

			// code under test - constructor initializes aAdditionalSelects
			assert.deepEqual(oBinding.aAdditionalSelects, []);

			sap.ui.model.analytics.AnalyticalTreeBindingAdapter.apply(oBinding);

			oModel.attachMetadataLoaded(function () {
				var oMeasure;

				oFixture.warnings.forEach(function (sText) {
					that.oLogMock.expects("warning")
						.withExactArgs("Ignored the 'select' binding parameter, because " + sText,
							sPath,
							"sap.ui.model.analytics.AnalyticalBinding");
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
		QUnit.test("updateAnalyticalInfo: additional selects - " + i, function(assert) {
			var oBinding,
				done = assert.async(),
				oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURL, {
					tokenHandling : false,
					json : true
				});

			sap.ui.model.analytics.ODataModelAdapter.apply(oModel);
			oBinding = new sap.ui.model.analytics.AnalyticalBinding(oModel, sPath, null, [], [], {
				analyticalInfo : oFixture.analyticalInfo,
				useBatchRequests : true,
				numberOfExpandedLevels : 0,
				noPaging : false,
				select : oFixture.select
			});
			sap.ui.model.analytics.AnalyticalTreeBindingAdapter.apply(oBinding);

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
		QUnit.test("_getQueryODataRequestOptions is called as expected - " + i, function(assert) {
			var oBinding,
				done = assert.async(),
				aExpectedSelects = oFixture.expectedSelects.slice(),
				oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURL, {
					tokenHandling : false,
					json : true
				});

			sap.ui.model.analytics.ODataModelAdapter.apply(oModel);

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

			oBinding = new sap.ui.model.analytics.AnalyticalBinding(oModel, sPath, null, [], [], {
				analyticalInfo : oFixture.analyticalInfo,
				useBatchRequests : oFixture.useBatchRequests,
				numberOfExpandedLevels : oFixture.numberOfExpandedLevels,
				noPaging : false,
				select : oFixture.select
			});
			sap.ui.model.analytics.AnalyticalTreeBindingAdapter.apply(oBinding);

			oModel.attachMetadataLoaded(function () {
				oBinding.initialize();

				// trigger read requests
				oBinding.getContexts(0, 20, 10);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_getQueryODataRequestOptions: enhance $select", function(assert) {
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
});
