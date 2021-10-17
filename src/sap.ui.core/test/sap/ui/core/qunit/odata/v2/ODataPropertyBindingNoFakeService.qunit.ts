import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import Binding from "sap/ui/model/Binding";
import ChangeReason from "sap/ui/model/ChangeReason";
import Context from "sap/ui/model/Context";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";
import ODataPropertyBinding from "sap/ui/model/odata/ODataPropertyBinding";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.odata.ODataPropertyBinding (ODataPropertyBindingNoFakeService)", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
[
    { mParameters: undefined, bIgnoreMessages: undefined },
    { mParameters: {}, bIgnoreMessages: undefined },
    { mParameters: { ignoreMessages: "~ignoreMessages" }, bIgnoreMessages: "~ignoreMessages" }
].forEach(function (oFixture, i) {
    QUnit.test("basics: #" + i, function (assert) {
        var oBinding, oDataState = {
            setValue: function () { }
        };
        this.mock(ODataPropertyBinding.prototype).expects("_getValue").withExactArgs().returns("~value");
        this.mock(ODataPropertyBinding.prototype).expects("getDataState").withExactArgs().returns(oDataState);
        this.mock(oDataState).expects("setValue").withExactArgs("~value");
        this.mock(ODataPropertyBinding.prototype).expects("setIgnoreMessages").withExactArgs(oFixture.bIgnoreMessages);
        oBinding = ODataModel.prototype.bindProperty.call("~oModel", "~sPath", "~oContext", oFixture.mParameters);
        assert.strictEqual(oBinding.bInitial, true);
        assert.strictEqual(oBinding.oValue, "~value");
    });
});
QUnit.test("supportsIgnoreMessages", function (assert) {
    assert.strictEqual(ODataPropertyBinding.prototype.getIgnoreMessages, Binding.prototype.getIgnoreMessages, "unchanged");
    assert.strictEqual(ODataPropertyBinding.prototype.setIgnoreMessages, Binding.prototype.setIgnoreMessages, "unchanged");
    assert.notStrictEqual(ODataPropertyBinding.prototype.supportsIgnoreMessages, Binding.prototype.supportsIgnoreMessages, "overridden");
    assert.strictEqual(ODataPropertyBinding.prototype.supportsIgnoreMessages(), true);
});
QUnit.test("setContext: preliminary context", function (assert) {
    var oBinding = "ODataPropertyBinding", oContext = {
        isPreliminary: function () { }
    };
    this.mock(oContext).expects("isPreliminary").withExactArgs().returns(true);
    ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
});
[null, undefined].forEach(function (oContext) {
    QUnit.test("setContext: unchanged context: " + oContext, function (assert) {
        var oBinding = { oContext: "Binding's Context" };
        this.mock(Context).expects("hasChanged").withExactArgs(oBinding.oContext, sinon.match.same(oContext)).returns(false);
        ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
    });
});
QUnit.test("setContext: unchanged context: V2 context", function (assert) {
    var oContext = { isPreliminary: function () { } }, oBinding = {
        oContext: oContext
    };
    this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
    this.mock(Context).expects("hasChanged").withExactArgs(sinon.match.same(oContext), sinon.match.same(oContext)).returns(false);
    ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
});
[
    { aControlMessages: [], bForceUpdate: false, bSameContext: true },
    { aControlMessages: [], bForceUpdate: false, bSameContext: false },
    { aControlMessages: [{}], bForceUpdate: true, bSameContext: false }
].forEach(function (oFixture) {
    var sTitle = "setContext: changed context (relative binding)" + "; same context = " + oFixture.bSameContext + "; number of control messages = " + oFixture.aControlMessages.length;
    QUnit.test(sTitle, function (assert) {
        var oContext = {
            isPreliminary: function () { }
        }, oBinding = {
            oContext: oFixture.bSameContext ? oContext : "Binding's Context",
            checkUpdate: function () { },
            getDataState: function () { },
            isRelative: function () { }
        }, oDataState = {
            getControlMessages: function () { }
        };
        this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
        this.mock(Context).expects("hasChanged").withExactArgs(oBinding.oContext, sinon.match.same(oContext)).returns(true);
        this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
        if (!oFixture.bSameContext) {
            this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
            this.mock(oDataState).expects("getControlMessages").withExactArgs().returns(oFixture.aControlMessages);
        }
        this.mock(oBinding).expects("checkUpdate").withExactArgs(oFixture.bForceUpdate);
        ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
        assert.strictEqual(oBinding.oContext, oContext);
    });
});
QUnit.test("checkUpdate for suspended binding without force update", function (assert) {
    var oBinding = {
        bSuspended: true
    };
    this.mock(ODataMetaModel).expects("getCodeListTerm").never();
    assert.strictEqual(ODataPropertyBinding.prototype.checkUpdate.call(oBinding), undefined);
});
[
    { bForceUpdate: true, bSuspended: true },
    { bForceUpdate: true, bSuspended: false },
    { bForceUpdate: false, bSuspended: false }
].forEach(function (oFixture, i) {
    QUnit.test("checkUpdate for code list; " + i, function (assert) {
        var oBinding = {
            bInitial: true,
            oModel: { getMetaModel: function () { } },
            sPath: "~path",
            bSuspended: oFixture.bSuspended,
            _fireChange: function () { }
        }, oFetchCodeListPromise = SyncPromise.resolve(Promise.resolve("~mCodeList")), oMetaModel = {
            fetchCodeList: function () { }
        };
        this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~path").returns("~term");
        this.mock(oBinding.oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
        this.mock(oMetaModel).expects("fetchCodeList").withExactArgs("~term").returns(oFetchCodeListPromise);
        this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Change }).callsFake(function () {
            assert.strictEqual(oBinding.oValue, "~mCodeList");
        });
        assert.strictEqual(ODataPropertyBinding.prototype.checkUpdate.call(oBinding, oFixture.bForceUpdate), undefined);
        return oFetchCodeListPromise;
    });
});
QUnit.test("checkUpdate for code list, code list loading fails", function (assert) {
    var oBinding = {
        bInitial: true,
        oModel: { getMetaModel: function () { } },
        sPath: "~path",
        _fireChange: function () { }
    }, oFetchCodeListPromise = SyncPromise.resolve(Promise.reject("~error")), oMetaModel = {
        fetchCodeList: function () { }
    };
    this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~path").returns("~term");
    this.mock(oBinding.oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
    this.mock(oMetaModel).expects("fetchCodeList").withExactArgs("~term").returns(oFetchCodeListPromise);
    this.mock(oBinding).expects("_fireChange").never();
    assert.strictEqual(ODataPropertyBinding.prototype.checkUpdate.call(oBinding), undefined);
    return oFetchCodeListPromise.catch(function () { });
});
QUnit.test("checkUpdate for code list, binding is not initial", function (assert) {
    var oBinding = {
        bInitial: false,
        sPath: "~path"
    };
    this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~path").returns("~term");
    assert.strictEqual(ODataPropertyBinding.prototype.checkUpdate.call(oBinding), undefined);
});
QUnit.test("checkDataState: getResolvedPath is called", function (assert) {
    var oBinding = {
        oContext: "~context",
        oModel: { resolve: function () { } },
        sPath: "~path",
        getDataState: function () { },
        getResolvedPath: function () { }
    }, oDataState = {
        setLaundering: function () { }
    };
    this.mock(oBinding.oModel).expects("resolve").withExactArgs("~path", "~context", true).returns(undefined);
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
    this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
    this.mock(oDataState).expects("setLaundering").withExactArgs(false);
    this.mock(PropertyBinding.prototype).expects("_checkDataState").on(oBinding).withExactArgs("~resolvedPath", undefined);
    ODataPropertyBinding.prototype.checkDataState.call(oBinding);
});