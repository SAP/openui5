import Log from "sap/base/Log";
import Context from "sap/ui/model/Context";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.Context", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("getMessages", function (assert) {
    var oModel = {
        getMessages: function () { }
    }, oContext = new Context(oModel, "path");
    this.mock(oModel).expects("getMessages").withExactArgs(sinon.match.same(oContext)).returns("messages");
    assert.strictEqual(oContext.getMessages(), "messages");
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
        this.mock(oContext).expects("isUpdated").withExactArgs().returns(oFixture.isUpdated);
        this.mock(oContext).expects("isRefreshForced").withExactArgs().exactly("isRefreshForced" in oFixture ? 1 : 0).returns(oFixture.isRefreshForced);
        assert.strictEqual(oContext.hasChanged(), oFixture.result);
    });
});
[
    { oOldContext: null, oNewContext: undefined },
    { oOldContext: undefined, oNewContext: null },
    { oOldContext: new Context("~oModel", "/~sPath0"), oNewContext: undefined },
    {
        oOldContext: new Context("~oModel", "/~sPath0"),
        oNewContext: new Context("~oModel", "/~sPath1")
    }
].forEach(function (oFixture, i) {
    QUnit.test("Context.hasChanged: different contexts, #" + i, function (assert) {
        assert.strictEqual(Context.hasChanged(oFixture.oOldContext, oFixture.oNewContext), true);
    });
});
QUnit.test("Context.hasChanged: same contexts", function (assert) {
    var oContext = new Context("~oModel", "/~sPath"), oContextMock = this.mock(oContext);
    assert.strictEqual(Context.hasChanged(undefined, undefined), false);
    assert.strictEqual(Context.hasChanged(null, null), false);
    oContextMock.expects("hasChanged").withExactArgs().returns("~truthy");
    assert.strictEqual(Context.hasChanged(oContext, oContext), true);
    oContextMock.expects("hasChanged").withExactArgs().returns(undefined);
    assert.strictEqual(Context.hasChanged(oContext, oContext), false);
});