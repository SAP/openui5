/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_GrandTotalHelper"
], function (Log, _AggregationHelper, _GrandTotalHelper) {
	/*eslint camelcase: 0 */
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
	QUnit.test("enhanceCacheWithGrandTotal", function (assert) {
		var oAggregation = {},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCountRow = {
				UI5__count : "26",
				"UI5__count@odata.type" : "#Decimal"
			},
			oDataRow = {},
			// handleResponse must be at the prototype
			oFirstLevelCache = Object.assign(Object.create({handleResponse : sinon.stub()}), {
				sMetaPath : "/meta/path",
				mQueryOptions : {"sap-client" : "123"},
				oRequestor : {
					buildQueryString : function () {}
				},
				sResourcePath : "SalesOrderList"
			}),
			fnGrandTotal = sinon.spy(),
			oGrandTotalRow = {},
			fnHandleResponse = oFirstLevelCache.handleResponse,
			mQueryOptions = oFirstLevelCache.mQueryOptions,
			sQueryOptionsJSON = JSON.stringify(mQueryOptions),
			mQueryOptionsWithApply = {},
			oRequestorMock = this.mock(oFirstLevelCache.oRequestor),
			sResourcePath,
			oResult = {value : [oGrandTotalRow, oCountRow, oDataRow]},
			mTypeForMetaPath = {/*fetchTypes result*/};

		_GrandTotalHelper.enhanceCacheWithGrandTotal(oFirstLevelCache, oAggregation, fnGrandTotal);
		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation),
				{$skip : 42, $top : 57, "sap-client" : "123"}, 1, undefined)
			.returns(mQueryOptionsWithApply);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, sinon.match.same(mQueryOptionsWithApply),
				false, true)
			.returns("?$apply=1st");

		// code under test
		sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=1st");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");

		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation),
				{$skip : 42, $top : 57, "sap-client" : "123"}, 1, true)
			.returns(mQueryOptionsWithApply);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, sinon.match.same(mQueryOptionsWithApply),
				false, true)
			.returns("?$apply=2nd");

		// code under test
		sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=2nd");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");

		// code under test
		oFirstLevelCache.handleResponse(42, 99, oResult, mTypeForMetaPath);

		assert.notOk(oFirstLevelCache.hasOwnProperty("handleResponse"), "reverted to prototype");
		assert.strictEqual(fnGrandTotal.callCount, 1);
		assert.ok(fnGrandTotal.calledWith(sinon.match.same(oGrandTotalRow)));
		assert.strictEqual(fnHandleResponse.callCount, 1);
		assert.ok(fnHandleResponse.calledWith(42, 99, sinon.match.same(oResult),
			sinon.match.same(mTypeForMetaPath)));
		assert.strictEqual(oResult["@odata.count"], "26");
		assert.strictEqual(oResult.value.length, 1, "grand total and count rows removed");
		assert.strictEqual(oResult.value[0], oDataRow);
	});
});