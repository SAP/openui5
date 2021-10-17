import $ from "sap/ui/thirdparty/jquery";
import Opa5 from "sap/ui/test/Opa5";
import HashChanger from "sap/ui/core/routing/HashChanger";
import sinonUtils from "../utils/sinon";
QUnit.test("Should not execute the test in debug mode", function (assert) {
    assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
});
QUnit.module("Component");
QUnit.test("Should start and teardown a UIComponent", function (assert) {
    var oOpa5 = new Opa5();
    var done = assert.async();
    oOpa5.iStartMyUIComponent({
        componentConfig: {
            name: "samples.components.button"
        },
        hash: ""
    }).done(function () {
        assert.ok($(".sapUiOpaComponent").length, "The UIComponent was started");
    });
    oOpa5.iTeardownMyUIComponent();
    oOpa5.emptyQueue().done(function () {
        assert.ok(!$(".sapUiOpaComponent").length, "The UIComponent was removed");
        done();
    });
});
QUnit.test("Should increase timeout to 40 seconds", function (assert) {
    var oOpa5 = new Opa5();
    var stub = sinonUtils.createStub(oOpa5, "waitFor", function () { });
    oOpa5.iStartMyUIComponent({
        componentConfig: {
            name: "samples.components.button"
        },
        hash: "",
        timeout: 40
    });
    assert.equal(stub.thirdCall.args[0].timeout, 40, "Timeout was increased to 40 seconds");
});
function componentHashTestCase(oOptions) {
    var oOpa5 = new Opa5();
    var done = oOptions.assert.async();
    var oHashChanger = HashChanger.getInstance();
    oHashChanger.setHash("#foo");
    oOpa5.iStartMyUIComponent({
        componentConfig: {
            name: "samples.components.button"
        },
        hash: oOptions.hashValues.newHash
    });
    oOpa5.waitFor({
        controlType: "sap.ui.commons.Button",
        success: function () {
            oOptions.assert.strictEqual(oHashChanger.getHash(), oOptions.hashValues.expectedHash, oOptions.message);
        }
    });
    oOpa5.iTeardownMyUIComponent();
    oOpa5.emptyQueue().done(function () {
        done();
    });
}
QUnit.test("Should set the hash to an empty hash if an empty hash is given", function (assert) {
    componentHashTestCase.call(this, {
        hashValues: {
            expectedHash: "",
            newHash: ""
        },
        assert: assert,
        message: "A empty hash was set to url"
    });
});
QUnit.test("Should set the hash to an empty hash if undefined is given", function (assert) {
    componentHashTestCase.call(this, {
        hashValues: {
            expectedHash: ""
        },
        assert: assert,
        message: "A empty hash was set to url because no one was given"
    });
});
QUnit.test("Should set the hash to 'test' if 'test' is specified", function (assert) {
    componentHashTestCase.call(this, {
        hashValues: {
            expectedHash: "test",
            newHash: "test"
        },
        assert: assert,
        message: "A given hash value was set to url"
    });
});