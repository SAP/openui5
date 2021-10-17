import Log from "sap/base/Log";
import EventProvider from "sap/ui/base/EventProvider";
import Binding from "sap/ui/model/Binding";
import ChangeReason from "sap/ui/model/ChangeReason";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.Binding", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("setContext", function (assert) {
    var oContext = {}, oBinding = new Binding(null, "some/path", oContext), oDataState = {
        getControlMessages: function () { },
        reset: function () { }
    }, oMessageManager = { removeMessages: function () { } };
    assert.strictEqual(oBinding.getContext(), oContext);
    this.mock(sap.ui.getCore()).expects("getMessageManager").withExactArgs().returns(oMessageManager);
    this.mock(oBinding).expects("getDataState").withExactArgs().twice().returns(oDataState);
    this.mock(oDataState).expects("getControlMessages").withExactArgs().returns("~messages");
    this.mock(oMessageManager).expects("removeMessages").withExactArgs("~messages", true);
    this.mock(oDataState).expects("reset").withExactArgs();
    this.mock(oBinding).expects("checkDataState").withExactArgs();
    this.mock(oBinding).expects("_fireChange").withExactArgs({
        reason: ChangeReason.Context
    });
    oBinding.setContext();
    assert.strictEqual(oBinding.getContext(), undefined);
    oBinding.setContext();
});
[{
        mParameters: undefined,
        mChangeParameters: { reason: ChangeReason.Context }
    }, {
        mParameters: { foo: "bar" },
        mChangeParameters: { reason: ChangeReason.Context }
    }, {
        mParameters: { detailedReason: "sDetailedReason" },
        mChangeParameters: { detailedReason: "sDetailedReason", reason: ChangeReason.Context }
    }].forEach(function (oFixture, i) {
    QUnit.test("setContext: parameter detailedReason, " + i, function (assert) {
        var oBinding = new Binding(null, "some/path"), oContext = {};
        assert.strictEqual(oBinding.getContext(), undefined);
        this.mock(oBinding).expects("_fireChange").withExactArgs(oFixture.mChangeParameters);
        oBinding.setContext(oContext, oFixture.mParameters);
        assert.strictEqual(oBinding.getContext(), oContext);
        oBinding.setContext(oContext);
    });
});
QUnit.test("setIgnoreMessages and constructor", function (assert) {
    var oBinding = new Binding(null, "some/path");
    assert.strictEqual(oBinding.bIgnoreMessages, undefined, "not yet set");
    oBinding.setIgnoreMessages("~boolean");
    assert.strictEqual(oBinding.bIgnoreMessages, "~boolean");
});
[
    { bIgnoreMessages: undefined, bResult: undefined },
    { bIgnoreMessages: false, bResult: false },
    { bIgnoreMessages: true, supportsIgnoreMessages: false, bResult: false },
    { bIgnoreMessages: true, supportsIgnoreMessages: true, bResult: true }
].forEach(function (oFixture, i) {
    QUnit.test("getIgnoreMessages: #" + i, function (assert) {
        var oBinding = new Binding(null, "some/path");
        this.mock(oBinding).expects("supportsIgnoreMessages").withExactArgs().exactly(oFixture.hasOwnProperty("supportsIgnoreMessages") ? 1 : 0).returns(oFixture.supportsIgnoreMessages);
        oBinding.bIgnoreMessages = oFixture.bIgnoreMessages;
        assert.strictEqual(oBinding.getIgnoreMessages(), oFixture.bResult);
    });
});
QUnit.test("supportsIgnoreMessages", function (assert) {
    assert.strictEqual(Binding.prototype.supportsIgnoreMessages(), false);
});
[true, false].forEach(function (bIgnoreMessages) {
    var sTitle = "_checkDataState: call _checkDataStateMessages if messages are not ignored;" + " ignore messages: " + bIgnoreMessages;
    QUnit.test(sTitle, function (assert) {
        var oBinding = {
            _checkDataStateMessages: function () { },
            getDataState: function () { },
            getIgnoreMessages: function () { }
        }, oDataState = {
            changed: function () { }
        };
        this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
        this.mock(oBinding).expects("getIgnoreMessages").withExactArgs().returns(bIgnoreMessages);
        this.mock(oBinding).expects("_checkDataStateMessages").withExactArgs(sinon.match.same(oDataState), "~sResolvedPath").exactly(bIgnoreMessages ? 0 : 1);
        this.mock(oDataState).expects("changed").withExactArgs().returns(false);
        Binding.prototype._checkDataState.call(oBinding, "~sResolvedPath");
    });
});
[
    { dataStateSet: true, dataStateChanged: false },
    { dataStateSet: true, dataStateChanged: true },
    { dataStateSet: false }
].forEach(function (oFixture) {
    var sTitle = "destroy - data state set: " + oFixture.dataStateSet + "; data state changed: " + oFixture.dataStateChanged;
    QUnit.test(sTitle, function (assert) {
        var oBinding = {
            oDataState: null,
            mEventRegistry: oFixture.eventRegistry,
            _checkDataStateMessages: function () { },
            destroy: function () { },
            fireEvent: function () { },
            getDataState: function () { }
        }, oBindingMock = this.mock(oBinding), oDataState = {
            changed: function () { },
            getControlMessages: function () { },
            setModelMessages: function () { }
        }, oDataStateMock = this.mock(oDataState), oMessageManager = sap.ui.getCore().getMessageManager();
        if (oFixture.dataStateSet) {
            oBinding.oDataState = oDataState;
            oDataStateMock.expects("getControlMessages").withExactArgs().returns("~oControlMessages");
            this.mock(oMessageManager).expects("removeMessages").withExactArgs("~oControlMessages", true);
            oDataStateMock.expects("setModelMessages").withExactArgs();
            oDataStateMock.expects("changed").withExactArgs().returns(oFixture.dataStateChanged);
            if (oFixture.dataStateChanged) {
                oBindingMock.expects("fireEvent").withExactArgs("DataStateChange", { dataState: oDataState }).callsFake(function () {
                    Binding.prototype.destroy.call(oBinding);
                });
                oBindingMock.expects("fireEvent").withExactArgs("AggregatedDataStateChange", { dataState: oDataState });
            }
            else {
                oBindingMock.expects("fireEvent").never();
            }
            this.mock(EventProvider.prototype).expects("destroy").on(oBinding).withExactArgs();
        }
        assert.strictEqual(oBinding.bIsBeingDestroyed, undefined);
        Binding.prototype.destroy.call(oBinding);
        assert.strictEqual(oBinding.bIsBeingDestroyed, true);
        assert.strictEqual(oBinding.oDataState, oFixture.dataStateSet ? undefined : null);
    });
});
QUnit.test("getResolvedPath", function (assert) {
    var oModel = { resolve: function () { } };
    this.mock(oModel).expects("resolve").withExactArgs("~sPath", "~oContext").returns("~resolvedPath");
    assert.strictEqual(new Binding(oModel, "~sPath", "~oContext").getResolvedPath(), "~resolvedPath");
    assert.strictEqual(new Binding(undefined, "~sPath", "~oContext").getResolvedPath(), undefined);
});
QUnit.test("checkDataState", function (assert) {
    var oBinding = new Binding("~oModel", "~sPath", "~oContext");
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
    this.mock(oBinding).expects("_checkDataState").withExactArgs("~resolvedPath", "~mPaths");
    oBinding.checkDataState("~mPaths");
});
QUnit.test("_checkDataStateMessages", function (assert) {
    var oModel = {
        getMessagesByPath: function () { }
    }, oBinding = new Binding(oModel, "/n/a"), oDataState = {
        setModelMessages: function () { }
    }, oDataStateMock = this.mock(oDataState);
    this.mock(oModel).expects("getMessagesByPath").withExactArgs("~resolvedPath").returns("~messages");
    oDataStateMock.expects("setModelMessages").withExactArgs("~messages");
    oBinding._checkDataStateMessages(oDataState, "~resolvedPath");
    oDataStateMock.expects("setModelMessages").withExactArgs([]);
    oBinding._checkDataStateMessages(oDataState, undefined);
});