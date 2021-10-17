import URI from "sap/ui/thirdparty/URI";
import _OpaUriParameterParser from "sap/ui/test/_OpaUriParameterParser";
import sinonUtils from "./utils/sinon";
function stubUri(mParams) {
    var fnOrig = URI.prototype.search;
    return sinonUtils.createStub(URI.prototype, "search", function (query) {
        if (query === true) {
            return mParams;
        }
        return fnOrig.apply(this, arguments);
    });
}
QUnit.module("_OpaUriParameterParser");
QUnit.test("Should recognize OPA params", function (assert) {
    var oUriStub = stubUri({
        "opaKey": "value",
        "opakeylow": "value",
        "another": "value",
        "notopaKey": "value"
    });
    var mOpaParams = _OpaUriParameterParser._getOpaParams();
    assert.strictEqual(mOpaParams.key, "value", "opaKey=value");
    assert.strictEqual(mOpaParams.keylow, "value", "opakeylow=value");
    assert.strictEqual(mOpaParams.another, undefined, "another=value");
    assert.strictEqual(mOpaParams.notopaKey, undefined, "notopakey=value");
    oUriStub.restore();
});
QUnit.test("Should parse OPA params", function (assert) {
    var oUriStub = stubUri({
        "opaString": "value",
        "opaTrue1": "True",
        "opaTrue2": "true",
        "opaFalse": "false",
        "opaInt": "5test",
        "opaFloat": "62.2t"
    });
    var mOpaParams = _OpaUriParameterParser._getOpaParams();
    assert.strictEqual(mOpaParams.string, "value", "opaString=value");
    assert.strictEqual(mOpaParams.true1, true, "opaTrue1=True");
    assert.strictEqual(mOpaParams.true2, true, "opaTrue2=true");
    assert.strictEqual(mOpaParams.false, false, "opaFalse=false");
    assert.strictEqual(mOpaParams.int, 5, "opaInt=5test");
    assert.strictEqual(mOpaParams.float, 62.2, "opaFloat=62.2t");
    oUriStub.restore();
});
QUnit.test("Should get app params", function (assert) {
    var oUriStub = stubUri({
        "opaKey": "value",
        "opaKeyFrameKey": "value",
        "opaFrameKey": "value",
        "notopaFrameKey": "value",
        "another": "value",
        "notopaKey": "value"
    });
    var mOpaParams = _OpaUriParameterParser._getAppParams();
    assert.strictEqual(mOpaParams.opaKey, undefined, "opaKey=value");
    assert.strictEqual(mOpaParams.opaKeyFrameKey, undefined, "opaKeyFrameKey=value");
    assert.strictEqual(mOpaParams.opaFrameKey, "value", "opaFrameKey=value");
    assert.strictEqual(mOpaParams.notopaFrameKey, "value", "notopaFrameKey=value");
    assert.strictEqual(mOpaParams.another, "value", "another=value");
    assert.strictEqual(mOpaParams.notopaKey, "value", "notopaKey=value");
    oUriStub.restore();
});
QUnit.test("Should not parse app params", function (assert) {
    var oUriStub = stubUri({
        "appTrue": "true",
        "appInt": "56",
        "appFloat": "62.2"
    });
    var mOpaParams = _OpaUriParameterParser._getAppParams();
    assert.strictEqual(mOpaParams.appTrue, "true", "appTrue=true");
    assert.strictEqual(mOpaParams.appInt, "56", "appInt=56");
    assert.strictEqual(mOpaParams.appFloat, "62.2", "appFloat=62.2");
    oUriStub.restore();
});