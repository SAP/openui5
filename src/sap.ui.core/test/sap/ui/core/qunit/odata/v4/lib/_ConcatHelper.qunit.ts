import Log from "sap/base/Log";
import _AggregationHelper from "sap/ui/model/odata/v4/lib/_AggregationHelper";
import _ConcatHelper from "sap/ui/model/odata/v4/lib/_ConcatHelper";
QUnit.module("sap.ui.model.odata.v4.lib._ConcatHelper", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
[undefined, sinon.spy()].forEach(function (fnGrandTotal) {
    [undefined, sinon.spy()].forEach(function (fnLeaves) {
        var sTitle = "enhanceCache, fnGrandTotal: " + fnGrandTotal + ", fnLeaves: " + fnLeaves;
        QUnit.test(sTitle, function (assert) {
            var oAggregationHelperMock = this.mock(_AggregationHelper), fnCount = sinon.spy(), oCountRow = {
                UI5__count: "26",
                "UI5__count@odata.type": "#Decimal"
            }, oDataRow = {}, oFirstLevelCache = Object.assign(Object.create({ handleResponse: sinon.stub() }), {
                sMetaPath: "/meta/path",
                mQueryOptions: { "sap-client": "123" },
                oRequestor: {
                    buildQueryString: function () { }
                },
                sResourcePath: "SalesOrderList"
            }), oGrandTotalRow = {}, fnHandleResponse = oFirstLevelCache.handleResponse, oLeavesRow = {}, mQueryOptions = oFirstLevelCache.mQueryOptions, sQueryOptionsJSON = JSON.stringify(mQueryOptions), oRequestorMock = this.mock(oFirstLevelCache.oRequestor), sResourcePath, oResult = { value: [oCountRow, oDataRow] };
            _ConcatHelper.enhanceCache(oFirstLevelCache, "~oAggregation~", [fnLeaves, fnCount, fnGrandTotal], "~mAlias2MeasureAndMethod~");
            oAggregationHelperMock.expects("buildApply").withExactArgs("~oAggregation~", { $skip: 42, $top: 57, "sap-client": "123" }, 1, undefined, "~mAlias2MeasureAndMethod~").returns("~mQueryOptionsWithApply1~");
            oRequestorMock.expects("buildQueryString").withExactArgs(oFirstLevelCache.sMetaPath, "~mQueryOptionsWithApply1~", false, true).returns("?$apply=1st");
            sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42, 99);
            assert.strictEqual(sResourcePath, "SalesOrderList?$apply=1st");
            assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");
            oAggregationHelperMock.expects("buildApply").withExactArgs("~oAggregation~", { $skip: 42, $top: 57, "sap-client": "123" }, 1, true, "~mAlias2MeasureAndMethod~").returns("~mQueryOptionsWithApply2~");
            oRequestorMock.expects("buildQueryString").withExactArgs(oFirstLevelCache.sMetaPath, "~mQueryOptionsWithApply2~", false, true).returns("?$apply=2nd");
            sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42, 99);
            assert.strictEqual(sResourcePath, "SalesOrderList?$apply=2nd");
            assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");
            if (fnGrandTotal) {
                oResult.value.splice(1, 0, oGrandTotalRow);
            }
            if (fnLeaves) {
                oResult.value.unshift(oLeavesRow);
            }
            oFirstLevelCache.handleResponse(42, 99, oResult, "~mTypeForMetaPath~");
            assert.notOk(oFirstLevelCache.hasOwnProperty("handleResponse"), "reverted to prototype");
            if (fnLeaves) {
                assert.strictEqual(fnLeaves.callCount, 1);
                assert.ok(fnLeaves.calledWith(sinon.match.same(oLeavesRow)));
            }
            if (fnGrandTotal) {
                assert.strictEqual(fnGrandTotal.callCount, 1);
                assert.ok(fnGrandTotal.calledWith(sinon.match.same(oGrandTotalRow)));
                fnGrandTotal.resetHistory();
            }
            assert.strictEqual(fnHandleResponse.callCount, 1);
            assert.ok(fnHandleResponse.calledWith(42, 99, sinon.match.same(oResult), "~mTypeForMetaPath~"));
            assert.strictEqual(oResult["@odata.count"], "26");
            assert.strictEqual(oResult.value.length, 1, "extra rows removed");
            assert.strictEqual(oResult.value[0], oDataRow);
        });
    });
});