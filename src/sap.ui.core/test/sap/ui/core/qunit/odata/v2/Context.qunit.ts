import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import BaseContext from "sap/ui/model/Context";
import Context from "sap/ui/model/odata/v2/Context";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.odata.v2.Context", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("constructor", function (assert) {
    var oContext;
    oContext = new Context("~oModel", "/~sPath");
    assert.ok(oContext instanceof Context);
    assert.ok(oContext instanceof BaseContext);
    assert.strictEqual(oContext.oModel, "~oModel");
    assert.strictEqual(oContext.sPath, "/~sPath");
    assert.strictEqual(oContext.oCreatePromise, undefined);
    assert.strictEqual(oContext.sDeepPath, "/~sPath");
    assert.strictEqual(oContext.bForceRefresh, false);
    assert.strictEqual(oContext.bPreliminary, false);
    oContext = new Context("~oModel", "/~sPath", "/~sDeepPath");
    assert.strictEqual(oContext.sDeepPath, "/~sDeepPath");
    oContext = new Context("~oModel", "/~sPath", undefined, "~oSyncCreatePromise");
    assert.strictEqual(oContext.oCreatePromise, undefined);
    assert.strictEqual(oContext.oSyncCreatePromise, "~oSyncCreatePromise");
});
QUnit.test("setForceRefresh and isRefreshForced", function (assert) {
    var oContext = new Context("~oModel", "~sPath");
    assert.strictEqual(oContext.isRefreshForced(), false);
    oContext.setForceRefresh("~bForceFrefresh");
    assert.strictEqual(oContext.isRefreshForced(), "~bForceFrefresh");
});
QUnit.test("setPreliminary and isPreliminary", function (assert) {
    var oContext = new Context("~oModel", "~sPath");
    assert.strictEqual(oContext.isPreliminary(), false);
    oContext.setPreliminary("~bPreliminary");
    assert.strictEqual(oContext.isPreliminary(), "~bPreliminary");
});
QUnit.test("setUpdated and isUpdated", function (assert) {
    var oContext = new Context("~oModel", "~sPath");
    assert.strictEqual(oContext.isUpdated(), false);
    oContext.setUpdated("~bUpdated");
    assert.strictEqual(oContext.isUpdated(), "~bUpdated");
});
QUnit.test("setDeepPath and getDeepPath", function (assert) {
    var oContext = new Context("~oModel", "~sPath");
    assert.strictEqual(oContext.getDeepPath(), "~sPath");
    oContext.setDeepPath("/~deepPath");
    assert.strictEqual(oContext.getDeepPath(), "/~deepPath");
});
[
    { isUpdated: true, result: true },
    { isUpdated: "true", result: "true" },
    { isUpdated: undefined, isRefreshForced: true, result: true },
    { isUpdated: undefined, isRefreshForced: false, result: false },
    { isUpdated: undefined, isRefreshForced: undefined, result: undefined },
    { isUpdated: false, isRefreshForced: true, result: true },
    { isUpdated: false, isRefreshForced: "true", result: "true" }
].forEach(function (oFixture, i) {
    QUnit.test("hasChanged #" + i, function (assert) {
        var oContext = new Context("~oModel", "~sPath");
        oContext.setUpdated(oFixture.isUpdated);
        oContext.setForceRefresh(oFixture.isRefreshForced);
        assert.strictEqual(oContext.hasChanged(), oFixture.result);
    });
});
QUnit.test("isTransient: without create promise", function (assert) {
    var oContext = new Context("~oModel", "~sPath");
    assert.strictEqual(oContext.isTransient(), undefined);
});
QUnit.test("isTransient: successful creation", function (assert) {
    var fnResolve, oSyncPromise = new SyncPromise(function (resolve, reject) {
        fnResolve = resolve;
    }), oContext = new Context("~oModel", "~sPath", undefined, oSyncPromise);
    assert.strictEqual(oContext.isTransient(), true);
    fnResolve();
    assert.strictEqual(oContext.isTransient(), false);
    return oSyncPromise;
});
QUnit.test("isTransient: failed creation", function (assert) {
    var fnReject, oSyncPromise = new SyncPromise(function (resolve, reject) {
        fnReject = reject;
    }), oContext = new Context("~oModel", "~sPath", undefined, oSyncPromise);
    assert.strictEqual(oContext.isTransient(), true);
    fnReject();
    assert.strictEqual(oContext.isTransient(), false);
    return oSyncPromise.catch(function () { });
});
QUnit.test("created: no create promise", function (assert) {
    var oContext = new Context("~oModel", "~sPath");
    assert.strictEqual(oContext.created(), undefined);
});
QUnit.test("created: resolved create promise", function (assert) {
    var oContext = new Context("~oModel", "~sPath", undefined, SyncPromise.resolve("~oCreateResult")), oPromise;
    oPromise = oContext.created();
    assert.ok(oPromise instanceof Promise);
    assert.strictEqual(oContext.oCreatePromise, oPromise);
    assert.strictEqual(oContext.created(), oPromise);
    return oPromise.then(function (oCreatedResult) {
        assert.strictEqual(oCreatedResult, undefined);
    });
});
QUnit.test("created: rejected create promise", function (assert) {
    var oContext = new Context("~oModel", "~sPath", undefined, SyncPromise.reject("~oError"));
    return oContext.created().then(function () {
        assert.ok(false, "unexpected success");
    }, function (oError) {
        assert.strictEqual(oError, "~oError");
    });
});