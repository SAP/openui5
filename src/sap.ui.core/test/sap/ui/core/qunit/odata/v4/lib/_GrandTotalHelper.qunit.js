/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_GrandTotalHelper"
], function (Log, _AggregationHelper, _GrandTotalHelper) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._GrandTotalHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("getResourcePathWithQuery", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : []
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			bCount = "/*false,true*/", // dummy value suitable for deepEqual()
			oFirstLevelCache = {
				sMetaPath : "/meta/path",
				oRequestor : {
					buildQueryString : function () {}
				},
				sResourcePath : "SalesOrderList"
			},
			mQueryOptions = {$count : bCount, "sap-client" : "123"},
			sQueryOptionsJSON = JSON.stringify(mQueryOptions),
			mQueryOptionsWithApply = {},
			oRequestorMock = this.mock(oFirstLevelCache.oRequestor),
			sResourcePath;

		_GrandTotalHelper.enhanceCacheWithGrandTotal(oFirstLevelCache, oAggregation, mQueryOptions);
		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), {
				$count : bCount, $skip : 42, $top : 57, "sap-client" : "123"
			}, 1, undefined)
			.returns(mQueryOptionsWithApply);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, sinon.match.same(mQueryOptionsWithApply),
				false, true)
			.returns("?$apply=1st");

		// code under test
		sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=1st");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON,
			"unmodified");
		assert.strictEqual(oFirstLevelCache.bFollowUp, true, "next request is a follow-up");


		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), {
				$count : bCount, $skip : 42, $top : 57, "sap-client" : "123"
			}, 1, true)
			.returns(mQueryOptionsWithApply);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, sinon.match.same(mQueryOptionsWithApply),
				false, true)
			.returns("?$apply=2nd");

		// code under test
		sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=2nd");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON,
			"unmodified");
		assert.strictEqual(oFirstLevelCache.bFollowUp, true, "next request is still a follow-up");
	});

	//*********************************************************************************************
[false, true].forEach(function (bCount) {
	var sTitle = "handleGrandTotalResponse: without visual grouping; $count : " + bCount;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				aggregate : {
					NoTotals : {},
					SalesAmountSum : {
						grandTotal : true,
						name : "SalesAmount",
						"with" : "sap.unit_sum"
					},
					SalesNumber : {
						grandTotal : true
					}
				},
				group : {
					Country : {},
					Region : {},
					Segment : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oCountRow = {
				UI5__count : "26",
				"UI5__count@odata.type" : "#Decimal"
			},
			oDataRow = {},
			oFirstLevelCache = {
				handleResponse : sinon.stub()
			},
			oGrandTotalRow = {
				"@odata.id" : null,
				UI5grand__SalesAmountSum : "351",
				"UI5grand__SalesAmountSum@odata.type" : "#Decimal",
				UI5grand__SalesNumber : 0,
				"UI5grand__SalesNumber@odata.type" : "#Decimal"
			},
			fnHandleResponse = oFirstLevelCache.handleResponse,
			oResult = bCount
				? {value : [oGrandTotalRow, oCountRow, oDataRow]}
				: {value : [oGrandTotalRow, oDataRow]},
			mTypeForMetaPath = {/*fetchTypes result*/},
			iStart = 0,
			iEnd = 10;

		_GrandTotalHelper.enhanceCacheWithGrandTotal(oFirstLevelCache, oAggregation);
		this.mock(_AggregationHelper).expects("setAnnotations")
			.withExactArgs(oGrandTotalRow, true, true, 0,
				["NoTotals", "SalesAmountSum", "SalesNumber", "Country", "Region", "Segment"]);

		// code under test
		oFirstLevelCache.handleResponse(iStart, iEnd, oResult, mTypeForMetaPath);

		assert.ok("handleResponse" in oFirstLevelCache, "still replaced");
		assert.strictEqual(fnHandleResponse.callCount, 1);
		assert.ok(fnHandleResponse.calledWith(iStart, iEnd, sinon.match.same(oResult),
			sinon.match.same(mTypeForMetaPath)));
		if (bCount) {
			assert.strictEqual(oFirstLevelCache.iLeafCount, 26,
				"leaf $count w/o grand total row");
			// Note: it is OK to transform string into number here
			assert.strictEqual(oResult["@odata.count"], bCount ? 27 : undefined,
				"count includes grand total row");
		} else {
			assert.notOk("iLeafCount" in oFirstLevelCache, "iLeafCount");
			assert.notOk("@odata.count" in oResult, "@odata.count");
		}
		assert.strictEqual(oResult.value.length, 2, "data still includes grand total row");
		assert.deepEqual(oResult.value[0], {
			"@odata.id" : null,
			SalesAmountSum : "351",
			"SalesAmountSum@odata.type" : "#Decimal",
			SalesNumber : 0,
			"SalesNumber@odata.type": "#Decimal"
		});
		assert.strictEqual(oResult.value[1], oDataRow);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bCount) {
	var sTitle = "handleGrandTotalResponse: w/o visual grouping; w/o grand total; $count=" + bCount;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				aggregate : {
					SalesNumber : {grandTotal : true}
				},
				group : {
					Country : {},
					Region : {},
					Segment : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oFirstLevelCache = {
				handleResponse : sinon.stub()
			},
			fnHandleResponse = oFirstLevelCache.handleResponse,
			oResult = { /*GET response*/
				value : [
					bCount
						? {UI5__count : "26", "UI5__count@odata.type" : "#Decimal"}
						: {Country : "Country", Region : "Region", Segment : "Segment"}
				]
			},
			mTypeForMetaPath = {/*fetchTypes result*/},
			iStart = 1,
			iEnd = 10;

		_GrandTotalHelper.enhanceCacheWithGrandTotal(oFirstLevelCache, oAggregation);
		this.mock(_AggregationHelper).expects("setAnnotations").never();

		// code under test
		oFirstLevelCache.handleResponse(iStart, iEnd, oResult, mTypeForMetaPath);

		assert.ok("handleResponse" in oFirstLevelCache, "still replaced");
		assert.strictEqual(fnHandleResponse.callCount, 1);
		assert.ok(fnHandleResponse.calledWith(iStart, iEnd, sinon.match.same(oResult),
			sinon.match.same(mTypeForMetaPath)));
		if (bCount) {
			assert.strictEqual(oFirstLevelCache.iLeafCount, 26,
				"leaf $count w/o grand total row");
			// Note: it is OK to transform string into number here
			assert.strictEqual(oResult["@odata.count"], bCount ? 27 : undefined,
				"count includes grand total row");
			assert.strictEqual(oResult.value.length, 0, "data does not include count row");
		} else {
			assert.notOk("iLeafCount" in oFirstLevelCache, "iLeafCount");
			assert.notOk("@odata.count" in oResult, "@odata.count");
			assert.strictEqual(oResult.value.length, 1, "no data row dropped");
			assert.deepEqual(oResult.value[0],
				{Country : "Country", Region : "Region", Segment : "Segment"});
		}
	});
});

});