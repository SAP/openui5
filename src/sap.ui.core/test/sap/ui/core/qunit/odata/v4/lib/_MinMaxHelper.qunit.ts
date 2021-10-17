import Log from "sap/base/Log";
import _Cache from "sap/ui/model/odata/v4/lib/_Cache";
import _ConcatHelper from "sap/ui/model/odata/v4/lib/_ConcatHelper";
import _MinMaxHelper from "sap/ui/model/odata/v4/lib/_MinMaxHelper";
QUnit.module("sap.ui.model.odata.v4.lib._MinMaxHelper", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("createCache: success", function (assert) {
    var mAlias2MeasureAndMethod, oCache = {}, oEnhanceCacheExpectation, fnHandleMinMaxElement;
    this.mock(_Cache).expects("create").withExactArgs("~oRequestor~", "resource/path", "~mQueryOptions~", true).returns(oCache);
    oEnhanceCacheExpectation = this.mock(_ConcatHelper).expects("enhanceCache").withExactArgs(sinon.match.same(oCache), "~oAggregation~", [sinon.match.func], {});
    assert.strictEqual(_MinMaxHelper.createCache("~oRequestor~", "resource/path", "~oAggregation~", "~mQueryOptions~"), oCache);
    mAlias2MeasureAndMethod = oEnhanceCacheExpectation.args[0][3];
    Object.assign(mAlias2MeasureAndMethod, {
        UI5min__MinAndMax: {
            measure: "MinAndMax",
            method: "min"
        },
        UI5max__MinAndMax: {
            measure: "MinAndMax",
            method: "max"
        },
        UI5min__OnlyMin: {
            measure: "OnlyMin",
            method: "min"
        },
        UI5max__OnlyMax: {
            measure: "OnlyMax",
            method: "max"
        }
    });
    fnHandleMinMaxElement = oEnhanceCacheExpectation.args[0][2][0];
    fnHandleMinMaxElement({
        "@odata.id": null,
        UI5min__MinAndMax: 3,
        UI5max__MinAndMax: 99,
        UI5min__OnlyMin: 7,
        UI5max__OnlyMax: 10,
        "n/a": "ignore me"
    });
    return oCache.getMeasureRangePromise().then(function (mMeasureRange) {
        assert.deepEqual(mMeasureRange, {
            MinAndMax: {
                min: 3,
                max: 99
            },
            OnlyMin: {
                min: 7
            },
            OnlyMax: {
                max: 10
            }
        }, "mMeasureRange");
    });
});