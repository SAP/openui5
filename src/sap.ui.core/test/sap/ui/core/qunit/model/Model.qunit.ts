import Log from "sap/base/Log";
import Message from "sap/ui/core/message/Message";
import BindingMode from "sap/ui/model/BindingMode";
import Model from "sap/ui/model/Model";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.Model", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("constructor: members", function (assert) {
    var oModel = new Model();
    assert.deepEqual(oModel.aBindings, []);
    assert.ok(oModel.oBindingsToRemove instanceof Set);
    assert.strictEqual(oModel.oBindingsToRemove.size, 0);
    assert.deepEqual(oModel.mContexts, {});
    assert.deepEqual(oModel.oData, {});
    assert.strictEqual(oModel.sDefaultBindingMode, BindingMode.TwoWay);
    assert.strictEqual(oModel.bDestroyed, false);
    assert.strictEqual(oModel.bLegacySyntax, false);
    assert.deepEqual(oModel.mMessages, {});
    assert.strictEqual(oModel.sRemoveTimer, null);
    assert.strictEqual(oModel.iSizeLimit, 100);
    assert.deepEqual(oModel.mSupportedBindingModes, { "OneWay": true, "TwoWay": true, "OneTime": true });
    assert.deepEqual(oModel.mUnsupportedFilterOperators, {});
    assert.strictEqual(oModel.sUpdateTimer, null);
});
QUnit.test("setMessages", function (assert) {
    var oMessage0 = "sap.ui.core.message.Message instance", oModel = new Model(), oModelMock = this.mock(oModel), mNewMessages = { path: [oMessage0] }, oOldMessages;
    oModelMock.expects("checkMessages").never();
    oOldMessages = oModel.mMessages;
    oModel.setMessages();
    assert.strictEqual(oModel.mMessages, oOldMessages);
    oModel.setMessages({});
    assert.strictEqual(oModel.mMessages, oOldMessages);
    oModelMock.expects("checkMessages").withExactArgs();
    oModel.setMessages(mNewMessages);
    assert.strictEqual(oModel.mMessages, mNewMessages);
    oModelMock.expects("checkMessages").never();
    oModel.setMessages(mNewMessages);
    assert.strictEqual(oModel.mMessages, mNewMessages);
    oOldMessages = oModel.mMessages;
    mNewMessages = { path: [oMessage0] };
    oModel.setMessages(mNewMessages);
    assert.notStrictEqual(oModel.mMessages, mNewMessages);
    assert.strictEqual(oModel.mMessages, oOldMessages);
});
QUnit.test("getMessagesByPath", function (assert) {
    var aMessages = [], oModel = new Model(), oModelMock = this.mock(oModel);
    oModelMock.expects("filterMatchingMessages").never();
    assert.deepEqual(oModel.getMessagesByPath("/foo"), []);
    oModel.mMessages = { "/foo": aMessages, "/baz": [] };
    assert.strictEqual(oModel.getMessagesByPath("/foo"), aMessages);
    assert.deepEqual(oModel.getMessagesByPath("/bar"), []);
    oModelMock.expects("filterMatchingMessages").withExactArgs("/foo", "/bar").returns([]);
    oModelMock.expects("filterMatchingMessages").withExactArgs("/baz", "/bar").returns([]);
    assert.deepEqual(oModel.getMessagesByPath("/bar", true), []);
    oModel.mMessages = {
        "/baz": "aMessages0",
        "/foo": "aMessages1",
        "/foo/bar": "aMessages2",
        "/qux": "aMessages3"
    };
    oModelMock.expects("filterMatchingMessages").withExactArgs("/baz", "/foo").returns([]);
    oModelMock.expects("filterMatchingMessages").withExactArgs("/foo", "/foo").returns(["oMessage3", "oMessage0"]);
    oModelMock.expects("filterMatchingMessages").withExactArgs("/foo/bar", "/foo").returns(["oMessage1", "oMessage2", "oMessage3"]);
    oModelMock.expects("filterMatchingMessages").withExactArgs("/qux", "/foo").returns([]);
    assert.deepEqual(oModel.getMessagesByPath("/foo", true), ["oMessage3", "oMessage0", "oMessage1", "oMessage2"]);
});
QUnit.test("filterMatchingMessages", function (assert) {
    var aMessages0 = "aMessages0", aMessages1 = "aMessages1", oModel = new Model();
    oModel.mMessages = {
        "/foo": aMessages0,
        "/foo/bar": aMessages1
    };
    assert.strictEqual(oModel.filterMatchingMessages("/foo", ""), aMessages0);
    assert.strictEqual(oModel.filterMatchingMessages("/foo", "/"), aMessages0);
    assert.deepEqual(oModel.filterMatchingMessages("/foo", "/f"), []);
    assert.strictEqual(oModel.filterMatchingMessages("/foo", "/foo"), aMessages0);
    assert.deepEqual(oModel.filterMatchingMessages("/foo", "/foo/bar"), []);
    assert.deepEqual(oModel.filterMatchingMessages("/foo", "/baz"), []);
    assert.strictEqual(oModel.filterMatchingMessages("/foo/bar", "/foo"), aMessages1);
});
[false, true].forEach(function (bForceUpdate0, i) {
    [false, true].forEach(function (bForceUpdate1, j) {
        QUnit.test("checkUpdate async (" + i + ", " + j + ")", function (assert) {
            var done = assert.async(), bForceUpdate2 = bForceUpdate0 || bForceUpdate1, oModel = new Model(), oModelMock = this.mock(oModel), sUpdateTimer;
            oModelMock.expects("checkUpdate").withExactArgs(bForceUpdate0, true).callThrough();
            oModelMock.expects("checkUpdate").withExactArgs(bForceUpdate1, true).callThrough();
            oModelMock.expects("checkUpdate").withExactArgs(bForceUpdate2).callsFake(function () {
                done();
            });
            oModel.checkUpdate(bForceUpdate0, true);
            sUpdateTimer = oModel.sUpdateTimer;
            assert.notStrictEqual(sUpdateTimer, null);
            oModel.checkUpdate(bForceUpdate1, true);
            assert.strictEqual(oModel.sUpdateTimer, sUpdateTimer);
        });
    });
});
[false, true].forEach(function (bForceUpdate, i) {
    [null, 42].forEach(function (vUpdateTimer, j) {
        QUnit.test("checkUpdate sync (" + i + ", " + j + ")", function (assert) {
            var oBinding = {
                checkUpdate: function () { }
            }, oModel = new Model();
            if (vUpdateTimer) {
                oModel.bForceUpdate = bForceUpdate;
                this.mock(window).expects("clearTimeout").withExactArgs(42);
            }
            this.mock(oModel).expects("getBindings").returns([oBinding]);
            this.mock(oBinding).expects("checkUpdate").withExactArgs(bForceUpdate);
            oModel.sUpdateTimer = vUpdateTimer;
            oModel.checkUpdate(bForceUpdate);
            assert.strictEqual(oModel.bForceUpdate, undefined);
            assert.strictEqual(oModel.sUpdateTimer, null);
        });
    });
});
QUnit.test("checkUpdate: truthy bForceUpdate of async wins over later sync", function (assert) {
    var oBinding = {
        checkUpdate: function () { }
    }, oBindingMock = this.mock(oBinding), oModel = new Model(), oModelMock = this.mock(oModel), oWindowMock = this.mock(window);
    oWindowMock.expects("clearTimeout").never();
    oModelMock.expects("getBindings").never();
    oBindingMock.expects("checkUpdate").never();
    oModel.checkUpdate(true, true);
    oWindowMock.expects("clearTimeout").withExactArgs(oModel.sUpdateTimer).callThrough();
    oModelMock.expects("getBindings").withExactArgs().returns([oBinding]);
    oBindingMock.expects("checkUpdate").withExactArgs(true);
    oModel.checkUpdate();
    assert.strictEqual(oModel.bForceUpdate, undefined);
    assert.strictEqual(oModel.sUpdateTimer, null);
});