import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import Binding from "sap/ui/model/Binding";
import ChangeReason from "sap/ui/model/ChangeReason";
import Context from "sap/ui/model/odata/v4/Context";
import asODataBinding from "sap/ui/model/odata/v4/ODataBinding";
import SubmitMode from "sap/ui/model/odata/v4/SubmitMode";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
var sClassName = "sap.ui.model.odata.v4.ODataBinding";
function ODataBinding(oTemplate) {
    asODataBinding.call(this);
    Object.assign(this, {
        getDependentBindings: function () { },
        getMetadata: function () {
            return {
                getName: function () {
                    return sClassName;
                }
            };
        },
        getResolvedPath: function () { },
        hasPendingChangesInDependents: function () { },
        isMeta: function () { return false; },
        isSuspended: Binding.prototype.isSuspended,
        resetChangesInDependents: function () { }
    }, oTemplate);
}
QUnit.module("sap.ui.model.odata.v4.ODataBinding", {
    before: function () {
        asODataBinding(ODataBinding.prototype);
    },
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("initialize members for mixin", function (assert) {
    var oBinding = new ODataBinding();
    assert.ok(oBinding.hasOwnProperty("mCacheByResourcePath"));
    assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
    assert.strictEqual(oBinding.oCache, null);
    assert.strictEqual(oBinding.oCachePromise.getResult(), null);
    assert.ok(oBinding.hasOwnProperty("mCacheQueryOptions"));
    assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
    assert.ok(oBinding.hasOwnProperty("oFetchCacheCallToken"));
    assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);
    assert.ok(oBinding.hasOwnProperty("mLateQueryOptions"));
    assert.strictEqual(oBinding.mLateQueryOptions, undefined);
    assert.ok(oBinding.hasOwnProperty("sReducedPath"));
    assert.strictEqual(oBinding.sReducedPath, undefined);
    assert.ok(oBinding.hasOwnProperty("sResumeChangeReason"));
    assert.strictEqual(oBinding.sResumeChangeReason, undefined);
});
QUnit.test("destroy", function (assert) {
    var oBinding = new ODataBinding(), oCache = {
        setActive: function () { }
    }, oPromise = Promise.resolve(oCache);
    oBinding.mCacheByResourcePath = {};
    oBinding.oCache = oCache;
    oBinding.oCachePromise = SyncPromise.resolve(oPromise);
    oBinding.mCacheQueryOptions = {};
    oBinding.oContext = {};
    oBinding.oFetchCacheCallToken = {};
    this.mock(oCache).expects("setActive").withExactArgs(false);
    oBinding.destroy();
    assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
    assert.strictEqual(oBinding.oCache, null);
    assert.strictEqual(oBinding.oCachePromise.getResult(), null);
    assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
    assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
    assert.strictEqual(oBinding.oContext, undefined);
    assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);
    return oPromise;
});
QUnit.test("destroy binding w/o cache", function (assert) {
    var oBinding = new ODataBinding();
    oBinding.destroy();
    assert.strictEqual(oBinding.oCachePromise.getResult(), null);
    assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
});
QUnit.test("checkUpdate: success", function () {
    var oBinding = new ODataBinding({
        checkUpdateInternal: function () { },
        oModel: {
            reportError: function () { }
        }
    }), bForceUpdate = {};
    this.mock(oBinding).expects("checkUpdateInternal").withExactArgs(sinon.match.same(bForceUpdate)).resolves();
    this.mock(oBinding.oModel).expects("reportError").never();
    oBinding.checkUpdate(bForceUpdate);
});
QUnit.test("checkUpdate: illegal parameter", function (assert) {
    assert.throws(function () {
        new ODataBinding().checkUpdate({}, {});
    }, new Error("Only the parameter bForceUpdate is supported"));
});
QUnit.test("checkUpdate: checkUpdateInternal rejects", function () {
    var oBinding = new ODataBinding({
        checkUpdateInternal: function () { },
        oModel: {
            reportError: function () { }
        },
        toString: function () { return "~"; }
    }), oError = new Error(), bForceUpdate = {}, oPromise = Promise.reject(oError);
    this.mock(oBinding).expects("checkUpdateInternal").withExactArgs(sinon.match.same(bForceUpdate)).returns(oPromise);
    this.mock(oBinding.oModel).expects("reportError").withExactArgs("Failed to update ~", sClassName, sinon.match.same(oError));
    oBinding.checkUpdate(bForceUpdate);
    return oPromise.catch(function () { });
});
QUnit.test("destroy binding w/ rejected cache promise", function (assert) {
    var oBinding = new ODataBinding();
    oBinding.oCachePromise = SyncPromise.reject(new Error());
    oBinding.destroy();
    assert.strictEqual(oBinding.oCachePromise.getResult(), null);
    assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
});
QUnit.test("getGroupId: own group", function (assert) {
    var oBinding = new ODataBinding({
        sGroupId: "group"
    });
    assert.strictEqual(oBinding.getGroupId(), "group");
});
QUnit.test("getGroupId: relative, inherits group from context", function (assert) {
    var oBinding = new ODataBinding({
        oContext: {
            getGroupId: function () { }
        },
        bRelative: true
    });
    this.mock(oBinding.oContext).expects("getGroupId").withExactArgs().returns("group");
    assert.strictEqual(oBinding.getGroupId(), "group");
});
[
    { bRelative: false },
    { bRelative: true },
    { bRelative: true, oContext: {} }
].forEach(function (oFixture, i) {
    QUnit.test("getGroupId: inherits group from model, " + i, function (assert) {
        var oBinding = new ODataBinding({
            oContext: oFixture.oContext,
            oModel: {
                getGroupId: function () { }
            },
            bRelative: oFixture.bRelative
        });
        this.mock(oBinding.oModel).expects("getGroupId").withExactArgs().returns("group");
        assert.strictEqual(oBinding.getGroupId(), "group");
    });
});
QUnit.test("getUpdateGroupId: own group", function (assert) {
    var oBinding = new ODataBinding({
        sUpdateGroupId: "group"
    });
    assert.strictEqual(oBinding.getUpdateGroupId(), "group");
});
QUnit.test("getUpdateGroupId: relative, inherits group from context", function (assert) {
    var oBinding = new ODataBinding({
        oContext: {
            getUpdateGroupId: function () { }
        },
        bRelative: true
    });
    this.mock(oBinding.oContext).expects("getUpdateGroupId").withExactArgs().returns("group");
    assert.strictEqual(oBinding.getUpdateGroupId(), "group");
});
[
    { bRelative: false },
    { bRelative: true },
    { bRelative: true, oContext: {} }
].forEach(function (oFixture, i) {
    QUnit.test("getUpdateGroupId: inherits group from model, " + i, function (assert) {
        var oBinding = new ODataBinding({
            oContext: oFixture.oContext,
            oModel: {
                getUpdateGroupId: function () { }
            },
            bRelative: oFixture.bRelative
        });
        this.mock(oBinding.oModel).expects("getUpdateGroupId").withExactArgs().returns("group");
        assert.strictEqual(oBinding.getUpdateGroupId(), "group");
    });
});
QUnit.test("forbidden", function (assert) {
    var oBinding = new ODataBinding();
    assert.throws(function () {
        oBinding.isInitial();
    }, new Error("Unsupported operation: isInitial"));
});
QUnit.test("requestRefresh: success", function (assert) {
    var oBinding = new ODataBinding({
        oModel: {
            checkGroupId: function () { }
        },
        refreshInternal: function () { }
    }), oPromise, bRefreshed = false;
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
    this.mock(oBinding).expects("hasPendingChanges").returns(false);
    this.mock(oBinding.oModel).expects("checkGroupId");
    this.mock(oBinding).expects("refreshInternal").withExactArgs("", "groupId", true).callsFake(function () {
        return new SyncPromise(function (resolve) {
            setTimeout(function () {
                bRefreshed = true;
                resolve("~");
            }, 0);
        });
    });
    oPromise = oBinding.requestRefresh("groupId");
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, undefined);
        assert.ok(bRefreshed);
    });
});
QUnit.test("requestRefresh: reject", function (assert) {
    var oBinding = new ODataBinding({
        oModel: {
            checkGroupId: function () { }
        },
        refreshInternal: function () { }
    }), oError = new Error();
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
    this.mock(oBinding).expects("hasPendingChanges").returns(false);
    this.mock(oBinding.oModel).expects("checkGroupId");
    this.mock(oBinding).expects("refreshInternal").withExactArgs("", "groupId", true).rejects(oError);
    return oBinding.requestRefresh("groupId").then(function () {
        assert.ok(false);
    }, function (oResultingError) {
        assert.strictEqual(oResultingError, oError);
    });
});
QUnit.test("refresh: reject", function () {
    var oBinding = new ODataBinding({
        oModel: { getReporter: function () { } }
    }), oError = new Error(), oPromise = Promise.reject(oError), fnReporter = sinon.spy();
    this.mock(oBinding).expects("requestRefresh").withExactArgs("groupId").returns(oPromise);
    this.mock(oBinding.oModel).expects("getReporter").withExactArgs().returns(fnReporter);
    oBinding.refresh("groupId");
    return oPromise.catch(function () {
        sinon.assert.calledOnce(fnReporter);
        sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
    });
});
QUnit.test("refresh: unsupported parameter bForceUpdate", function (assert) {
    var oBinding = new ODataBinding({});
    this.mock(oBinding).expects("requestRefresh").never();
    assert.throws(function () {
        oBinding.refresh(true);
    }, new Error("Unsupported parameter bForceUpdate"));
});
QUnit.test("requestRefresh: not refreshable", function (assert) {
    var oBinding = new ODataBinding({
        oModel: {}
    });
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
    assert.throws(function () {
        oBinding.requestRefresh();
    }, new Error("Refresh on this binding is not supported"));
});
QUnit.test("requestRefresh: pending changes", function (assert) {
    var oBinding = new ODataBinding({
        oModel: {}
    });
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
    this.mock(oBinding).expects("hasPendingChanges").returns(true);
    assert.throws(function () {
        oBinding.requestRefresh();
    }, new Error("Cannot refresh due to pending changes"));
});
QUnit.test("requestRefresh: invalid group ID", function (assert) {
    var oBinding = new ODataBinding({
        oModel: {
            checkGroupId: function () { }
        }
    }), oError = new Error();
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
    this.mock(oBinding).expects("hasPendingChanges").returns(false);
    this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);
    assert.throws(function () {
        oBinding.requestRefresh("$invalid");
    }, oError);
});
[{
        path: "/absolute",
        context: undefined,
        result: true
    }, {
        path: "relative",
        context: undefined,
        result: false
    }, {
        path: "quasiAbsolute",
        context: { getPath: function () { } },
        result: true
    }, {
        path: "relativeToV4Context",
        context: { getPath: function () { }, getBinding: function () { } },
        result: false
    }].forEach(function (oFixture, i) {
    QUnit.test("isRoot, " + i, function (assert) {
        var oBinding = new ODataBinding({
            oContext: oFixture.context,
            sPath: oFixture.path,
            bRelative: !oFixture.path.startsWith("/")
        });
        assert.strictEqual(!!oBinding.isRoot(), oFixture.result);
    });
});
QUnit.test("hasPendingChanges", function (assert) {
    var oBinding = new ODataBinding({
        isResolved: function () { }
    }), oBindingMock = this.mock(oBinding), bResult = {};
    oBindingMock.expects("isResolved").withExactArgs().returns(false);
    oBindingMock.expects("hasPendingChangesForPath").never();
    oBindingMock.expects("hasPendingChangesInDependents").never();
    assert.strictEqual(oBinding.hasPendingChanges(), false);
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oBindingMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);
    oBindingMock.expects("hasPendingChangesInDependents").never();
    assert.strictEqual(oBinding.hasPendingChanges(), true);
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oBindingMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
    oBindingMock.expects("hasPendingChangesInDependents").withExactArgs().returns(bResult);
    assert.strictEqual(oBinding.hasPendingChanges(), bResult);
});
QUnit.test("hasPendingChangesForPath", function (assert) {
    var oBinding = new ODataBinding({}), oCache = {
        hasPendingChangesForPath: function () { }
    }, sCachePath = {}, oExpectation, sPath = "foo", bResult = {}, oResult = {}, oWithCachePromise = { unwrap: function () { } };
    oExpectation = this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func, sPath, true).returns(oWithCachePromise);
    this.mock(oWithCachePromise).expects("unwrap").withExactArgs().returns(oResult);
    assert.strictEqual(oBinding.hasPendingChangesForPath(sPath), oResult);
    this.mock(oCache).expects("hasPendingChangesForPath").withExactArgs(sinon.match.same(sCachePath)).returns(bResult);
    assert.strictEqual(oExpectation.firstCall.args[0](oCache, sCachePath), bResult);
});
QUnit.test("hasPendingChangesInCaches", function (assert) {
    var oBinding = new ODataBinding({
        oModel: {}
    }), oCache0 = {
        $deepResourcePath: "A('42')/A_2_B",
        hasPendingChangesForPath: function () { }
    }, oCache1 = {
        $deepResourcePath: "A('42')/A_2_B/B_2_B",
        hasPendingChangesForPath: function () { }
    }, oCache2 = {
        $deepResourcePath: "A('42')/A_2_B/B_2_C/C_2_B",
        hasPendingChangesForPath: function () { }
    };
    assert.notOk(oBinding.hasPendingChangesInCaches());
    oBinding.mCacheByResourcePath = {
        "A('42')": { $deepResourcePath: "not considered cache" },
        "b": oCache0,
        "c": oCache1,
        "d": oCache2
    };
    this.mock(oCache0).expects("hasPendingChangesForPath").withExactArgs("").returns(false);
    this.mock(oCache1).expects("hasPendingChangesForPath").withExactArgs("").returns(true);
    this.mock(oCache2).expects("hasPendingChangesForPath").never();
    assert.ok(oBinding.hasPendingChangesInCaches("A('42')"));
    assert.notOk(oBinding.hasPendingChangesInCaches("A('77')"));
});
QUnit.test("resetChanges", function (assert) {
    var oBinding = new ODataBinding(), oExpectation, oBindingMock = this.mock(oBinding), oResetChangesForPathPromise = SyncPromise.resolve(new Promise(function (resolve) {
        setTimeout(resolve.bind(null, "foo"), 2);
    })), oResetChangesInDependentsPromise = SyncPromise.resolve(new Promise(function (resolve) {
        setTimeout(resolve.bind(null, "bar"), 3);
    })), oResetChangesPromise;
    oBindingMock.expects("checkSuspended").withExactArgs();
    oExpectation = oBindingMock.expects("resetChangesForPath").withExactArgs("", []).callsFake(function (_sPath, aPromises) {
        aPromises.push(oResetChangesForPathPromise);
    });
    oBindingMock.expects("resetChangesInDependents").withExactArgs([oResetChangesForPathPromise]).callsFake(function (aPromises) {
        assert.strictEqual(aPromises, oExpectation.firstCall.args[1]);
        aPromises.push(oResetChangesInDependentsPromise);
    });
    oBindingMock.expects("resetInvalidDataState").withExactArgs();
    oResetChangesPromise = oBinding.resetChanges();
    assert.ok(oResetChangesPromise instanceof Promise);
    return oResetChangesPromise.then(function (oResult) {
        assert.ok(oResetChangesForPathPromise.isFulfilled());
        assert.ok(oResetChangesInDependentsPromise.isFulfilled());
        assert.strictEqual(oResult, undefined);
    });
});
QUnit.test("resetChangesForPath", function (assert) {
    var oBinding = new ODataBinding(), oCache = {
        resetChangesForPath: function () { }
    }, oExpectation, sPath = {}, oPromise = SyncPromise.resolve(), aPromises = [], oUnwrappedWithCachePromise = {};
    oExpectation = this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func, sinon.match.same(sPath)).returns(oPromise);
    this.mock(oPromise).expects("unwrap").withExactArgs().returns(oUnwrappedWithCachePromise);
    oBinding.resetChangesForPath(sPath, aPromises);
    assert.deepEqual(aPromises, [oUnwrappedWithCachePromise]);
    assert.strictEqual(aPromises[0], oUnwrappedWithCachePromise);
    this.mock(oCache).expects("resetChangesForPath").withExactArgs(sinon.match.same(sPath));
    oExpectation.firstCall.args[0](oCache, sPath);
    return oPromise;
});
[
    {
        oTemplate: { sPath: "/absolute", bRelative: false }
    },
    {
        oContext: { getPath: function () { return "/baseContext"; } },
        oTemplate: { sPath: "quasiAbsolute", bRelative: true }
    },
    {
        oContext: Context.create({}, {}, "/v4Context"),
        oTemplate: {
            mParameters: { "$$groupId": "myGroup" },
            sPath: "relativeWithParameters",
            bRelative: true
        }
    },
    {
        oContext: Context.create({}, {}, "/v4Context"),
        oTemplate: {
            aChildCanUseCachePromises: [],
            oModel: { bAutoExpandSelect: true },
            mParameters: { "$$aggregation": {} },
            sPath: "relativeWithAggregation",
            bRelative: true
        }
    },
    {
        oContext: Context.create({}, {}, "/v4Context"),
        bIgnoreParentCache: true,
        oTemplate: { sPath: "ignoreParentCache", bRelative: true }
    }
].forEach(function (oFixture) {
    QUnit.test("fetchQueryOptionsForOwnCache returns query options:" + oFixture.oTemplate.sPath, function (assert) {
        var oBinding, oBindingMock, mQueryOptions = {}, oResult;
        oBinding = new ODataBinding(oFixture.oTemplate);
        oBinding.oModel = Object.assign({
            resolve: function () { }
        }, oFixture.oTemplate.oModel);
        this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oFixture.oContext)).returns("/resolved/path");
        oBinding.doFetchQueryOptions = function () { };
        oBindingMock = this.mock(oBinding);
        oBindingMock.expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oFixture.oContext)).returns(SyncPromise.resolve(mQueryOptions));
        oResult = oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext, oFixture.bIgnoreParentCache).getResult();
        assert.strictEqual(oResult.sReducedPath, "/resolved/path");
        assert.strictEqual(oResult.mQueryOptions, mQueryOptions);
    });
});
[
    { sPath: "unresolvedRelative", bRelative: true },
    { oOperation: {}, sPath: "operation" },
    { isMeta: function () { return true; }, sPath: "/data##meta" }
].forEach(function (oTemplate) {
    QUnit.test("fetchQueryOptionsForOwnCache returns undefined: " + oTemplate.sPath, function (assert) {
        var oBinding;
        oTemplate.oModel = {
            resolve: function () { }
        };
        oBinding = new ODataBinding(oTemplate);
        this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, undefined).returns("/resolved/path");
        assert.deepEqual(oBinding.fetchQueryOptionsForOwnCache().getResult(), {
            mQueryOptions: undefined,
            sReducedPath: "/resolved/path"
        });
    });
});
[
    {
        oContext: Context.create({}, {}, "/v4Context"),
        oTemplate: {
            oModel: { resolve: function () { } },
            sPath: "relativeWithEmptyParameters",
            mParameters: {},
            bRelative: true
        }
    },
    {
        oContext: Context.create({}, {}, "/v4Context"),
        oTemplate: {
            oModel: { resolve: function () { } },
            sPath: "relativeWithNoParameters",
            bRelative: true
        }
    }
].forEach(function (oFixture) {
    QUnit.test("fetchQueryOptionsForOwnCache returns undefined: " + oFixture.oTemplate.sPath, function (assert) {
        var oBinding = new ODataBinding(oFixture.oTemplate), oBindingMock = this.mock(oBinding), mQueryOptions = { "$filter": "filterValue" };
        this.mock(oBinding.oModel).expects("resolve").twice().withExactArgs(oBinding.sPath, sinon.match.same(oFixture.oContext)).returns("/resolved/path");
        oBinding.doFetchQueryOptions = function () { };
        oBindingMock.expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oFixture.oContext)).returns(SyncPromise.resolve({}));
        assert.deepEqual(oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(), {
            mQueryOptions: undefined,
            sReducedPath: "/resolved/path"
        });
        oBindingMock.expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oFixture.oContext)).returns(SyncPromise.resolve(mQueryOptions));
        assert.deepEqual(oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(), {
            mQueryOptions: mQueryOptions,
            sReducedPath: "/resolved/path"
        });
    });
});
QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: can use parent binding cache", function (assert) {
    var fnFetchMetadata = function () { }, oBinding = new ODataBinding({
        mAggregatedQueryOptions: {},
        aChildCanUseCachePromises: [],
        doFetchQueryOptions: function () { },
        oModel: {
            bAutoExpandSelect: true,
            oInterface: {
                fetchMetadata: fnFetchMetadata
            },
            resolve: function () { }
        },
        sPath: "relative",
        bRelative: true,
        updateAggregatedQueryOptions: function () { }
    }), mCurrentBindingQueryOptions = {}, oExpectation, oParentBinding = {
        fetchIfChildCanUseCache: function () { }
    }, oContext = Context.create({}, oParentBinding, "/v4Context"), oQueryOptionsForOwnCachePromise;
    this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/resolved/path");
    this.mock(oBinding).expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.resolve(mCurrentBindingQueryOptions));
    this.mock(oBinding).expects("updateAggregatedQueryOptions").withExactArgs(sinon.match.same(mCurrentBindingQueryOptions));
    oExpectation = this.mock(oParentBinding).expects("fetchIfChildCanUseCache").withArgs(sinon.match.same(oContext), "relative").returns(SyncPromise.resolve("/reduced/path"));
    oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);
    return oQueryOptionsForOwnCachePromise.then(function (mQueryOptionsForOwnCache) {
        assert.deepEqual(mQueryOptionsForOwnCache, {
            mQueryOptions: undefined,
            sReducedPath: "/reduced/path"
        });
        return oExpectation.firstCall.args[2].then(function (mAggregatedQueryOptions) {
            assert.strictEqual(mAggregatedQueryOptions, oBinding.mAggregatedQueryOptions, "fetchIfChildCanUseCache called with oQueryOptionsPromise");
        });
    });
});
QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: can't use parent binding cache", function (assert) {
    var fnFetchMetadata = function () { }, oBinding = new ODataBinding({
        mAggregatedQueryOptions: {},
        aChildCanUseCachePromises: [],
        doFetchQueryOptions: function () { },
        oModel: {
            bAutoExpandSelect: true,
            oInterface: {
                fetchMetadata: fnFetchMetadata
            },
            resolve: function () { }
        },
        sPath: "relative",
        bRelative: true,
        updateAggregatedQueryOptions: function () { }
    }), mCurrentBindingQueryOptions = {}, aChildCanUseCachePromises, oParentBinding = {
        fetchIfChildCanUseCache: function () { }
    }, oContext = Context.create({}, oParentBinding, "/v4Context"), oQueryOptionsForOwnCachePromise;
    this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/resolved/path");
    this.mock(oBinding).expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.resolve(mCurrentBindingQueryOptions));
    this.mock(oBinding).expects("updateAggregatedQueryOptions").withExactArgs(sinon.match.same(mCurrentBindingQueryOptions));
    this.mock(oParentBinding).expects("fetchIfChildCanUseCache").withArgs(sinon.match.same(oContext), "relative").returns(SyncPromise.resolve(undefined));
    oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);
    oBinding.aChildCanUseCachePromises = aChildCanUseCachePromises = [
        SyncPromise.resolve(Promise.resolve()),
        SyncPromise.resolve(Promise.resolve())
    ];
    return oQueryOptionsForOwnCachePromise.then(function (mQueryOptionsForOwnCache) {
        assert.strictEqual(aChildCanUseCachePromises[0].isFulfilled(), true);
        assert.strictEqual(aChildCanUseCachePromises[1].isFulfilled(), true);
        assert.strictEqual(mQueryOptionsForOwnCache.sReducedPath, "/resolved/path");
        assert.strictEqual(mQueryOptionsForOwnCache.mQueryOptions, oBinding.mAggregatedQueryOptions);
        assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
    });
});
[true, false].forEach(function (bCanUseCache) {
    QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: non-parent binding, " + "can use cache " + bCanUseCache, function (assert) {
        var oBinding = new ODataBinding({
            doFetchQueryOptions: function () { },
            oModel: {
                bAutoExpandSelect: true,
                resolve: function () { }
            },
            sPath: "relative",
            bRelative: true
        }), mLocalQueryOptions = {}, oParentBinding = {
            fetchIfChildCanUseCache: function () { }
        }, oQueryOptionsPromise = SyncPromise.resolve(mLocalQueryOptions), oContext = Context.create({}, oParentBinding, "/v4Context"), oQueryOptionsForOwnCachePromise;
        this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/resolved/path");
        this.mock(oBinding).expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oContext)).returns(oQueryOptionsPromise);
        this.mock(oParentBinding).expects("fetchIfChildCanUseCache").withExactArgs(sinon.match.same(oContext), "relative", sinon.match.same(oQueryOptionsPromise)).returns(SyncPromise.resolve(bCanUseCache ? "/reduced/path" : undefined));
        oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);
        return oQueryOptionsForOwnCachePromise.then(function (oResult) {
            assert.strictEqual(oResult.sReducedPath, bCanUseCache ? "/reduced/path" : "/resolved/path");
            assert.strictEqual(oResult.mQueryOptions, bCanUseCache ? undefined : mLocalQueryOptions);
        });
    });
});
[{ custom: "foo" }, { $$groupId: "foo" }].forEach(function (mParameters) {
    QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: " + "not only system query options", function (assert) {
        var oBinding = new ODataBinding({
            doFetchQueryOptions: function () { },
            oModel: {
                bAutoExpandSelect: true,
                resolve: function () { }
            },
            mParameters: mParameters,
            sPath: "relative",
            bRelative: true
        }), oBindingMock, oContext = Context.create({}, {}, "/v4Context"), mQueryOptions = {}, oResult;
        this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/resolved/path");
        oBindingMock = this.mock(oBinding);
        oBindingMock.expects("doFetchQueryOptions").withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.resolve(mQueryOptions));
        oResult = oBinding.fetchQueryOptionsForOwnCache(oContext).getResult();
        assert.strictEqual(oResult.mQueryOptions, mQueryOptions);
        assert.strictEqual(oResult.sReducedPath, "/resolved/path");
    });
});
QUnit.test("fetchCache: no own cache", function (assert) {
    var mLateQueryOptions = {}, oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        doCreateCache: function () { },
        mLateQueryOptions: mLateQueryOptions,
        oModel: {
            oRequestor: {
                ready: function () { return SyncPromise.resolve(); }
            }
        },
        sPath: "relative",
        bRelative: true
    }), oContext = {}, oBindingMock = this.mock(oBinding);
    oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(sinon.match.same(oContext), undefined).returns(SyncPromise.resolve(Promise.resolve({
        mQueryOptions: undefined,
        sReducedPath: "/resolved/path"
    })));
    oBindingMock.expects("createAndSetCache").never();
    oBinding.fetchCache(oContext);
    assert.strictEqual(oBinding.oCache, undefined);
    assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
    assert.ok(oBinding.oCachePromise.isPending());
    return oBinding.oCachePromise.then(function () {
        assert.strictEqual(oBinding.oCache, null);
        assert.strictEqual(oBinding.oCachePromise.getResult(), null);
        assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
        assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
    });
});
QUnit.test("fetchCache: absolute binding", function (assert) {
    var mLateQueryOptions = {}, oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        doCreateCache: function () { },
        mLateQueryOptions: mLateQueryOptions,
        oModel: {
            oRequestor: {
                ready: function () { return SyncPromise.resolve(); }
            },
            mUriParameters: {}
        },
        sPath: "/absolute",
        bRelative: false
    }), oBindingMock = this.mock(oBinding), oCache = {}, oContext = {}, bIgnoreParentCache = {}, mLocalQueryOptions = {};
    oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined, sinon.match.same(bIgnoreParentCache)).returns(SyncPromise.resolve(Promise.resolve({
        mQueryOptions: mLocalQueryOptions,
        sReducedPath: "/resolved/path"
    })));
    oBindingMock.expects("fetchResourcePath").withExactArgs(undefined).returns(SyncPromise.resolve("absolute"));
    oBindingMock.expects("createAndSetCache").withExactArgs(sinon.match.same(mLocalQueryOptions), "absolute", undefined).returns(oCache);
    oBinding.fetchCache(oContext, bIgnoreParentCache);
    assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
    assert.ok(oBinding.oCachePromise.isPending());
    return oBinding.oCachePromise.then(function () {
        assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
        assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
    });
});
[[false, false], [false, true], [true, false], [true, true]].forEach(function (aFixture) {
    QUnit.test("fetchCache: relative binding with context, " + aFixture, function (assert) {
        var mLateQueryOptions = {}, oBinding = new ODataBinding({
            oCache: null,
            oCachePromise: SyncPromise.resolve(null),
            doCreateCache: function () { },
            mLateQueryOptions: mLateQueryOptions,
            oModel: {
                oRequestor: {
                    ready: function () { return SyncPromise.resolve(); }
                },
                mUriParameters: {}
            },
            sPath: "relative",
            bRelative: true
        }), oBindingMock = this.mock(oBinding), oCache = {}, oContext = {
            getPath: function () { return "/contextPath"; }
        }, mLocalQueryOptions = {}, oQueryOptions = {
            mQueryOptions: mLocalQueryOptions,
            sReducedPath: "/resolved/path"
        }, bQueryOptionsAsync = aFixture[0], oQueryOptionsPromise = SyncPromise.resolve(bQueryOptionsAsync ? Promise.resolve(oQueryOptions) : oQueryOptions), bResourcePathAsync = aFixture[1], oResourcePathPromise = SyncPromise.resolve(bResourcePathAsync ? Promise.resolve("resourcePath") : "resourcePath");
        oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(sinon.match.same(oContext), undefined).returns(oQueryOptionsPromise);
        oBindingMock.expects("fetchResourcePath").withExactArgs(sinon.match.same(oContext)).returns(oResourcePathPromise);
        oBindingMock.expects("createAndSetCache").withExactArgs(sinon.match.same(mLocalQueryOptions), "resourcePath", sinon.match.same(oContext)).callsFake(function () {
            oBinding.oCache = oCache;
            return oCache;
        });
        oBinding.fetchCache(oContext);
        assert.strictEqual(oBinding.oCache, !bQueryOptionsAsync && !bResourcePathAsync ? oCache : undefined);
        assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
        assert.strictEqual(oBinding.oCachePromise.isFulfilled(), !bQueryOptionsAsync && !bResourcePathAsync);
        return oBinding.oCachePromise.then(function (oCache0) {
            assert.strictEqual(oCache0, oCache);
            assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
        });
    });
});
QUnit.test("fetchCache: requestor is not ready", function (assert) {
    var oRequestor = {
        ready: function () { }
    }, oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        doCreateCache: function () { },
        oModel: {
            oRequestor: oRequestor,
            mUriParameters: {}
        },
        sPath: "/absolute",
        bRelative: false
    }), oBindingMock = this.mock(oBinding), oCache = {}, mLocalQueryOptions = {};
    oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined, undefined).returns(SyncPromise.resolve({
        mQueryOptions: mLocalQueryOptions,
        sReducedPath: "/reduced/path"
    }));
    oBindingMock.expects("createAndSetCache").never();
    this.mock(oRequestor).expects("ready").returns(SyncPromise.resolve(Promise.resolve().then(function () {
        oBindingMock.expects("fetchResourcePath").withExactArgs(undefined).returns(SyncPromise.resolve("absolute"));
        oBindingMock.expects("createAndSetCache").withExactArgs(sinon.match.same(mLocalQueryOptions), "absolute", undefined).returns(oCache);
    })));
    oBinding.fetchCache();
    assert.strictEqual(oBinding.oCachePromise.isFulfilled(), false);
    assert.strictEqual(oBinding.oCache, undefined);
    return oBinding.oCachePromise.then(function (oResult) {
        assert.strictEqual(oResult, oCache);
        assert.strictEqual(oBinding.sReducedPath, "/reduced/path");
    });
});
[true, false].forEach(function (bIsParentBinding) {
    QUnit.skip("fetchCache: auto-$expand/$select, parent binding " + bIsParentBinding, function (assert) {
        var oBinding = new ODataBinding({
            oCache: null,
            oCachePromise: SyncPromise.resolve(null),
            doCreateCache: function () { },
            oModel: {
                bAutoExpandSelect: true,
                oRequestor: {
                    ready: function () { return SyncPromise.resolve(); }
                },
                mUriParameters: {}
            },
            sPath: "relative",
            aChildCanUseCachePromises: bIsParentBinding ? [] : undefined,
            bRelative: true
        }), oBindingMock = this.mock(oBinding), oCache = {}, oContext = {}, oDependentCanUseCachePromise, mLocalQueryOptions = {}, oQueryOptionsPromise = SyncPromise.resolve(mLocalQueryOptions), mResultingQueryOptions = {};
        oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(sinon.match.same(oContext), undefined).returns(oQueryOptionsPromise);
        oBindingMock.expects("fetchResourcePath").withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.resolve("resourcePath/relative"));
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters), sinon.match.same(mLocalQueryOptions)).returns(mResultingQueryOptions);
        oBindingMock.expects("doCreateCache").withExactArgs("resourcePath/relative", sinon.match.same(mResultingQueryOptions), sinon.match.same(oContext)).returns(oCache);
        oBinding.fetchCache(oContext);
        assert.strictEqual(oBinding.oCache, !bIsParentBinding ? oCache : undefined);
        assert.strictEqual(oBinding.oCachePromise.isFulfilled(), !bIsParentBinding);
        if (bIsParentBinding) {
            oDependentCanUseCachePromise = SyncPromise.resolve(Promise.resolve().then(function () {
                oBinding.mAggregatedQueryOptions = { $select: ["dependentPath"] };
            }));
            oBinding.aChildCanUseCachePromises.push(oDependentCanUseCachePromise);
        }
        return oBinding.oCachePromise.then(function (oCache0) {
            assert.strictEqual(oCache0, oCache);
            assert.strictEqual(oBinding.oCache, oCache);
            if (bIsParentBinding) {
                assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
                assert.strictEqual(oBinding.mAggregatedQueryOptions.$select[0], "dependentPath");
            }
        });
    });
});
QUnit.test("fetchCache: relative to virtual context", function (assert) {
    var oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        oModel: {
            oRequestor: {
                ready: function () { return SyncPromise.resolve(); }
            }
        },
        bRelative: true
    }), oContext = {
        iIndex: Context.VIRTUAL
    };
    this.mock(oBinding).expects("fetchQueryOptionsForOwnCache").withExactArgs(sinon.match.same(oContext), undefined).returns(SyncPromise.resolve({}));
    oBinding.fetchCache(oContext);
    assert.strictEqual(oBinding.oCache, null);
    assert.strictEqual(oBinding.oCachePromise.getResult(), null);
    assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
});
[
    null,
    { setActive: function () { } }
].forEach(function (oCache, i) {
    QUnit.test("fetchCache: previous cache, " + i, function (assert) {
        var oBinding = new ODataBinding({
            oCache: oCache,
            oCachePromise: SyncPromise.resolve(oCache),
            fetchQueryOptionsForOwnCache: function () {
                return SyncPromise.resolve({});
            },
            oModel: {
                oRequestor: {
                    ready: function () { return SyncPromise.resolve(); }
                }
            }
        });
        if (oCache) {
            this.mock(oCache).expects("setActive").withExactArgs(false);
        }
        oBinding.fetchCache();
        assert.strictEqual(oBinding.oCache, null);
    });
});
QUnit.test("fetchCache: later calls to fetchCache exist => discard cache", function (assert) {
    var oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        doCreateCache: function () { },
        oModel: {
            reportError: function () { },
            oRequestor: {
                ready: function () { return SyncPromise.resolve(); }
            },
            mUriParameters: {}
        },
        sPath: "relative",
        mParameters: { "$$canonicalPath": true },
        bRelative: true,
        toString: function () { return "MyBinding"; }
    }), oBindingMock = this.mock(oBinding), oCache = {}, oContext0 = {
        getPath: function () { return "/n/a"; }
    }, oContext1 = {
        getPath: function () { return "/deep/path"; }
    }, mLocalQueryOptions = {}, oPromise;
    oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(sinon.match.same(oContext0), undefined).returns(SyncPromise.resolve({
        mQueryOptions: {},
        sReducedPath: "/reduced/path/1"
    }));
    oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(sinon.match.same(oContext1), undefined).returns(SyncPromise.resolve({
        mQueryOptions: mLocalQueryOptions,
        sReducedPath: "/reduced/path/2"
    }));
    oBindingMock.expects("fetchResourcePath").withExactArgs(sinon.match.same(oContext0)).returns(SyncPromise.resolve(Promise.resolve("resourcePath0")));
    oBindingMock.expects("fetchResourcePath").withExactArgs(sinon.match.same(oContext1)).returns(SyncPromise.resolve(Promise.resolve("resourcePath1")));
    oBindingMock.expects("createAndSetCache").withExactArgs(sinon.match.same(mLocalQueryOptions), "resourcePath1", sinon.match.same(oContext1)).returns(oCache);
    oBinding.fetchCache(oContext0);
    oPromise = oBinding.oCachePromise;
    this.mock(oBinding.oModel).expects("reportError").withExactArgs("Failed to create cache for binding MyBinding", sClassName, sinon.match.instanceOf(Error));
    oBinding.fetchCache(oContext1);
    return SyncPromise.all([
        oPromise.then(function () {
            assert.ok(false, "Expected a rejected cache-promise");
        }, function (oError) {
            assert.strictEqual(oError.message, "Cache discarded as a new cache has been created");
            assert.strictEqual(oError.canceled, true);
        }),
        oBinding.oCachePromise.then(function (oCache0) {
            assert.strictEqual(oCache0, oCache);
        })
    ]).then(function () {
        assert.strictEqual(oBinding.sReducedPath, "/reduced/path/2");
    });
});
QUnit.test("fetchCache: fetchResourcePath fails", function (assert) {
    var oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        mCacheQueryOptions: {},
        oModel: {
            reportError: function () { },
            oRequestor: {
                ready: function () { return SyncPromise.resolve(); }
            },
            mUriParameters: {}
        },
        bRelative: true,
        toString: function () { return "MyBinding"; }
    }), oBindingMock = this.mock(oBinding), oContext = {}, oError = new Error("canonical path failure");
    oBindingMock.expects("fetchQueryOptionsForOwnCache").returns(SyncPromise.resolve({ mQueryOptions: {} }));
    oBindingMock.expects("fetchResourcePath").withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.reject(oError));
    oBindingMock.expects("createAndSetCache").never();
    this.mock(oBinding.oModel).expects("reportError").withExactArgs("Failed to create cache for binding MyBinding", sClassName, sinon.match.same(oError));
    oBinding.fetchCache(oContext);
    return oBinding.oCachePromise.then(function () {
        assert.ok(false, "unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
        assert.strictEqual(oBinding.mCacheQueryOptions, undefined, "cache query options stored at binding are reset");
        assert.strictEqual(oBinding.oCache, undefined);
    });
});
QUnit.test("fetchCache: bKeepQueryOptions and own cache", function (assert) {
    var oCache = {
        getResourcePath: function () { },
        setActive: function () { }
    }, mCacheQueryOptions = {}, mLateQueryOptions = {}, oBinding = new ODataBinding({
        oCache: oCache,
        oCachePromise: SyncPromise.resolve(oCache),
        mCacheQueryOptions: mCacheQueryOptions,
        oFetchCacheCallToken: {},
        mLateQueryOptions: mLateQueryOptions,
        oModel: {
            reportError: function () { },
            oRequestor: {
                ready: function () { }
            }
        },
        bRelative: true
    }), oContext = {}, oNewCache = {};
    this.mock(oCache).expects("setActive").withExactArgs(false);
    this.mock(oCache).expects("getResourcePath").withExactArgs().returns("~resourcePath~");
    this.mock(oBinding).expects("createAndSetCache").withExactArgs(sinon.match.same(oBinding.mCacheQueryOptions), "~resourcePath~", sinon.match.same(oContext)).returns(oNewCache);
    this.mock(oBinding).expects("fetchQueryOptionsForOwnCache").never();
    this.mock(oBinding.oModel.oRequestor).expects("ready").never();
    this.mock(oBinding.oModel).expects("reportError").never();
    this.mock(oBinding).expects("fetchResourcePath").never();
    oBinding.fetchCache(oContext, undefined, true);
    assert.strictEqual(oBinding.oCache, undefined);
    assert.ok(oBinding.oCachePromise.isPending());
    assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);
    return oBinding.oCachePromise.then(function (oCache0) {
        assert.strictEqual(oCache0, oNewCache);
        assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);
        assert.strictEqual(oBinding.mCacheQueryOptions, mCacheQueryOptions);
        assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
    });
});
QUnit.test("fetchCache: bKeepQueryOptions and no cache", function (assert) {
    var oCachePromise = SyncPromise.resolve(null), mCacheQueryOptions = {}, mLateQueryOptions = {}, oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: oCachePromise,
        mCacheQueryOptions: mCacheQueryOptions,
        oFetchCacheCallToken: {},
        mLateQueryOptions: mLateQueryOptions,
        oModel: {
            reportError: function () { },
            oRequestor: {
                ready: function () { }
            }
        }
    });
    this.mock(oBinding).expects("createAndSetCache").never();
    this.mock(oBinding).expects("fetchQueryOptionsForOwnCache").never();
    this.mock(oBinding.oModel.oRequestor).expects("ready").never();
    this.mock(oBinding.oModel).expects("reportError").never();
    this.mock(oBinding).expects("fetchResourcePath").never();
    oBinding.fetchCache(undefined, undefined, true);
    assert.strictEqual(oBinding.oCache, null);
    assert.strictEqual(oBinding.oCachePromise, oCachePromise);
    assert.strictEqual(oBinding.mCacheQueryOptions, mCacheQueryOptions);
    assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);
    assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
});
QUnit.test("fetchCache: bKeepQueryOptions while oCachePromise is pending", function (assert) {
    var oCachePromise = SyncPromise.resolve(Promise.resolve()), mCacheQueryOptions = {}, oCallToken = {}, mLateQueryOptions = {}, oBinding = new ODataBinding({
        oCache: undefined,
        oCachePromise: oCachePromise,
        mCacheQueryOptions: mCacheQueryOptions,
        oFetchCacheCallToken: oCallToken,
        mLateQueryOptions: mLateQueryOptions,
        oModel: {
            reportError: function () { },
            oRequestor: {
                ready: function () { }
            }
        }
    });
    this.mock(oBinding).expects("createAndSetCache").never();
    this.mock(oBinding).expects("fetchQueryOptionsForOwnCache").never();
    this.mock(oBinding.oModel.oRequestor).expects("ready").never();
    this.mock(oBinding.oModel).expects("reportError").never();
    this.mock(oBinding).expects("fetchResourcePath").never();
    assert.throws(function () {
        oBinding.fetchCache(undefined, undefined, true);
    }, new Error("Unsupported bKeepQueryOptions while oCachePromise is pending"));
    assert.strictEqual(oBinding.oCache, undefined);
    assert.strictEqual(oBinding.oCachePromise, oCachePromise);
    assert.strictEqual(oBinding.mCacheQueryOptions, mCacheQueryOptions);
    assert.strictEqual(oBinding.oFetchCacheCallToken, oCallToken);
    assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
});
[false, true].forEach(function (bHasLateQueryOptions) {
    var sTitle = "createAndSetCache: absolute, bHasLateQueryOptions = " + bHasLateQueryOptions;
    QUnit.test(sTitle, function (assert) {
        var mLateQueryOptions = {}, oBinding = new ODataBinding({
            doCreateCache: function () { },
            mLateQueryOptions: bHasLateQueryOptions ? mLateQueryOptions : undefined,
            oModel: {
                mUriParameters: {}
            },
            bRelative: false
        }), oCache = {
            setLateQueryOptions: function () { }
        }, mMergedQueryOptions = {}, mQueryOptions = {};
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters), sinon.match.same(mQueryOptions)).returns(mMergedQueryOptions);
        this.mock(oBinding).expects("doCreateCache").withExactArgs("/resource/path", sinon.match.same(mMergedQueryOptions)).returns(oCache);
        this.mock(oCache).expects("setLateQueryOptions").exactly(bHasLateQueryOptions ? 1 : 0).withExactArgs(sinon.match.same(mLateQueryOptions));
        assert.strictEqual(oBinding.createAndSetCache(mQueryOptions, "/resource/path", undefined), oCache);
        assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
        assert.strictEqual(oBinding.oCache, oCache);
    });
});
[false, true].forEach(function (bSharedRequest) {
    [false, true].forEach(function (bV4Context) {
        [false, true].forEach(function (bHasCaches) {
            [false, true].forEach(function (bHasLateQueryOptions) {
                var sTitle = "createAndSetCache: relative, create, V4Context=" + bV4Context + ", shared=" + bSharedRequest + ", hasCaches=" + bHasCaches + ", hasLateQueryOptions = " + bHasLateQueryOptions;
                QUnit.test(sTitle, function (assert) {
                    var mLateQueryOptions = {}, oBinding = new ODataBinding({
                        doCreateCache: function () { },
                        mLateQueryOptions: bHasLateQueryOptions ? mLateQueryOptions : undefined,
                        oModel: {
                            mUriParameters: {}
                        },
                        sPath: "relative",
                        bRelative: true
                    }), oCache = {
                        setLateQueryOptions: function () { }
                    }, oContext = {
                        getPath: function () { }
                    }, mMergedQueryOptions = {}, mQueryOptions = {}, iGeneration = {};
                    if (bSharedRequest) {
                        oBinding.mParameters = { $$sharedRequest: true };
                    }
                    if (bV4Context) {
                        oContext.getGeneration = function () { };
                        this.mock(oContext).expects("getGeneration").withExactArgs().returns(iGeneration);
                    }
                    if (bHasCaches) {
                        oBinding.mCacheByResourcePath = { foo: "bar" };
                    }
                    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters), sinon.match.same(mQueryOptions)).returns(mMergedQueryOptions);
                    this.mock(oContext).expects("getPath").withExactArgs().returns("/contextPath");
                    this.mock(_Helper).expects("buildPath").withExactArgs("/contextPath", oBinding.sPath).returns("/deep/resource/path");
                    this.mock(oBinding).expects("doCreateCache").withExactArgs("/resource/path", sinon.match.same(mMergedQueryOptions), sinon.match.same(oContext), "deep/resource/path").returns(oCache);
                    this.mock(oCache).expects("setLateQueryOptions").exactly(bHasLateQueryOptions ? 1 : 0).withExactArgs(sinon.match.same(mLateQueryOptions));
                    assert.strictEqual(oBinding.createAndSetCache(mQueryOptions, "/resource/path", oContext), oCache);
                    assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
                    assert.strictEqual(oBinding.oCache, oCache);
                    if (!bSharedRequest) {
                        assert.strictEqual(oBinding.mCacheByResourcePath["/resource/path"], oCache);
                    }
                    if (bHasCaches) {
                        assert.strictEqual(oBinding.mCacheByResourcePath.foo, "bar");
                    }
                    else if (bSharedRequest) {
                        assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
                    }
                    assert.strictEqual(oCache.$deepResourcePath, "deep/resource/path");
                    assert.strictEqual(oCache.$generation, bV4Context ? iGeneration : 0);
                });
            });
        });
    });
});
QUnit.test("createAndSetCache: relative, transient parent", function (assert) {
    var oBinding = new ODataBinding({
        oCache: undefined,
        oModel: {
            mUriParameters: {}
        },
        bRelative: true
    }), oContext = {
        getProperty: function () { },
        isTransient: function () { }
    }, mMergedQueryOptions = {}, mQueryOptions = {};
    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters), sinon.match.same(mQueryOptions)).returns(mMergedQueryOptions);
    this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
    this.mock(oContext).expects("getProperty").withExactArgs("@$ui5.context.isTransient").returns(true);
    assert.strictEqual(oBinding.createAndSetCache(mQueryOptions, "/resource/path", oContext), null);
    assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
    assert.strictEqual(oBinding.oCache, null);
});
[undefined, false, true].forEach(function (bSameGeneration) {
    [false, true].forEach(function (bHasLateQueryOptions) {
        var sTitle = "createAndSetCache: reuse cache, bSameGeneration=" + bSameGeneration + ", bHasLateQueryOptions=" + bHasLateQueryOptions;
        QUnit.test(sTitle, function (assert) {
            var mLateQueryOptions = {}, oBinding = new ODataBinding({
                mLateQueryOptions: bHasLateQueryOptions ? mLateQueryOptions : undefined,
                oModel: {
                    mUriParameters: {}
                },
                sPath: "relative",
                bRelative: true
            }), oCache = {
                $generation: bSameGeneration ? 23 : 42,
                setActive: function () { },
                setLateQueryOptions: function () { }
            }, oContext = {};
            oBinding.mCacheByResourcePath = {};
            oBinding.mCacheByResourcePath["/resource/path"] = oCache;
            if (bSameGeneration !== undefined) {
                oContext.getGeneration = function () { };
                this.mock(oContext).expects("getGeneration").withExactArgs().returns(23);
            }
            this.mock(oCache).expects("setActive").withExactArgs(true);
            this.mock(oCache).expects("setLateQueryOptions").exactly(bHasLateQueryOptions ? 1 : 0).withExactArgs(sinon.match.same(mLateQueryOptions));
            assert.strictEqual(oBinding.createAndSetCache({}, "/resource/path", oContext), oCache);
            assert.strictEqual(oBinding.oCache, oCache);
        });
    });
});
QUnit.test("createAndSetCache: no reuse due to older generation", function (assert) {
    var oBinding = new ODataBinding({
        doCreateCache: function () { },
        oModel: {
            mUriParameters: {}
        },
        mParameters: {},
        sPath: "relative",
        bRelative: true
    }), oCache0 = {
        $generation: 23
    }, oCache1 = {}, oContext = {
        getPath: function () { },
        getGeneration: function () { }
    }, mMergedQueryOptions = {}, mQueryOptions = {};
    oBinding.mCacheByResourcePath = {};
    oBinding.mCacheByResourcePath["/resource/path"] = oCache0;
    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters), sinon.match.same(mQueryOptions)).returns(mMergedQueryOptions);
    this.mock(oContext).expects("getGeneration").withExactArgs().returns(42);
    this.mock(oContext).expects("getPath").withExactArgs().returns("/contextPath");
    this.mock(_Helper).expects("buildPath").withExactArgs("/contextPath", oBinding.sPath).returns("/deep/resource/path");
    this.mock(oBinding).expects("doCreateCache").withExactArgs("/resource/path", sinon.match.same(mMergedQueryOptions), sinon.match.same(oContext), "deep/resource/path").returns(oCache1);
    assert.strictEqual(oBinding.createAndSetCache(mQueryOptions, "/resource/path", oContext), oCache1);
    assert.strictEqual(oBinding.oCache, oCache1);
    assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
    assert.strictEqual(oBinding.mCacheByResourcePath["/resource/path"], oCache1);
    assert.strictEqual(oCache1.$deepResourcePath, "deep/resource/path");
    assert.strictEqual(oCache1.$generation, 42);
});
QUnit.test("getRelativePath: relative", function (assert) {
    var oBinding = new ODataBinding();
    assert.strictEqual(oBinding.getRelativePath("baz"), "baz");
});
QUnit.test("getRelativePath: relative to resolved path", function (assert) {
    var oBinding = new ODataBinding();
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo/bar");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/foo/bar", "/foo/bar").returns("");
    assert.strictEqual(oBinding.getRelativePath("/foo/bar"), "");
});
QUnit.test("getRelativePath: not relative to resolved path", function (assert) {
    var oBinding = new ODataBinding();
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo/bar");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/foo", "/foo/bar").returns(undefined);
    assert.strictEqual(oBinding.getRelativePath("/foo"), undefined);
});
QUnit.test("getRelativePath: return value context", function (assert) {
    var oBinding = new ODataBinding({
        oReturnValueContext: { getPath: function () { } }
    }), oHelperMock = this.mock(_Helper), sResult = {};
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo/bar");
    oHelperMock.expects("getRelativePath").withExactArgs("/foo/baz", "/foo/bar").returns(undefined);
    this.mock(oBinding.oReturnValueContext).expects("getPath").withExactArgs().returns("/return");
    oHelperMock.expects("getRelativePath").withExactArgs("/foo/baz", "/return").returns(sResult);
    assert.strictEqual(oBinding.getRelativePath("/foo/baz"), sResult);
});
[false, true].forEach(function (bSync) {
    [false, true].forEach(function (bCachePromisePending) {
        var sTitle = "withCache: cache hit; " + (bSync ? "use oCache" : "use cache promise") + "; cache promise " + (bCachePromisePending ? "pending" : "fulfilled");
        QUnit.test(sTitle, function (assert) {
            var oCache = {}, oBinding = new ODataBinding({
                oCache: !bSync && bCachePromisePending ? undefined : oCache,
                oCachePromise: bCachePromisePending ? SyncPromise.resolve(Promise.resolve(oCache)) : SyncPromise.resolve(oCache)
            }), oCallbackResult = {}, sPath = "/foo", oProcessor = {
                fnProcessor: function () { }
            }, oPromise;
            this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("~");
            this.mock(oProcessor).expects("fnProcessor").withExactArgs(sinon.match.same(oCache), "~", sinon.match.same(oBinding)).returns(oCallbackResult);
            oPromise = oBinding.withCache(oProcessor.fnProcessor, sPath, bSync);
            if (bSync || !bCachePromisePending) {
                assert.strictEqual(oPromise.isFulfilled(), true);
                assert.strictEqual(oPromise.getResult(), oCallbackResult);
            }
            return oPromise.then(function (oResult) {
                assert.strictEqual(oResult, oCallbackResult);
            });
        });
    });
});
QUnit.test("withCache: cache hit, no path", function (assert) {
    var oCache = {}, oBinding = new ODataBinding({
        oCache: undefined,
        oCachePromise: SyncPromise.resolve(Promise.resolve(oCache))
    }), oCallbackResult = {}, oProcessor = {
        fnProcessor: function () { }
    };
    this.mock(oBinding).expects("getRelativePath").withExactArgs("").returns("~");
    this.mock(oProcessor).expects("fnProcessor").withExactArgs(sinon.match.same(oCache), "~", sinon.match.same(oBinding)).returns(oCallbackResult);
    return oBinding.withCache(oProcessor.fnProcessor).then(function (oResult) {
        assert.strictEqual(oResult, oCallbackResult);
    });
});
[false, true].forEach(function (bSync) {
    var sTitle = "withCache: bubbling up, called with relative sPath; bSync = " + bSync;
    QUnit.test(sTitle, function (assert) {
        var oContext = {
            withCache: function () { }
        }, oBinding = new ODataBinding({
            oCache: bSync ? null : {},
            oCachePromise: bSync ? {} : SyncPromise.resolve(null),
            oContext: oContext,
            sPath: "binding/path",
            bRelative: true
        }), oContextResult = {}, sPath = "foo", fnProcessor = {}, oPromise, bWithOrWithoutCache = {};
        this.mock(_Helper).expects("buildPath").withExactArgs(oBinding.sPath, sPath).returns("~");
        this.mock(oContext).expects("withCache").withExactArgs(sinon.match.same(fnProcessor), "~", bSync, sinon.match.same(bWithOrWithoutCache)).returns(oContextResult);
        oPromise = oBinding.withCache(fnProcessor, sPath, bSync, bWithOrWithoutCache);
        assert.strictEqual(oPromise.unwrap(), oContextResult);
    });
});
[false, true].forEach(function (bSync) {
    var sTitle = "withCache: bubbling up, called with absolute path; bSync = " + bSync;
    QUnit.test(sTitle, function (assert) {
        var oContext = {
            withCache: function () { }
        }, oBinding = new ODataBinding({
            oCache: bSync ? null : {},
            oCachePromise: bSync ? {} : SyncPromise.resolve(null),
            oContext: oContext,
            bRelative: true
        }), oContextResult = {}, sPath = "/foo", fnProcessor = {}, oPromise, bWithOrWithoutCache = {};
        this.mock(_Helper).expects("buildPath").never();
        this.mock(oContext).expects("withCache").withExactArgs(sinon.match.same(fnProcessor), sPath, bSync, sinon.match.same(bWithOrWithoutCache)).returns(oContextResult);
        oPromise = oBinding.withCache(fnProcessor, sPath, bSync, bWithOrWithoutCache);
        assert.strictEqual(oPromise.unwrap(), oContextResult);
    });
});
[false, true].forEach(function (bSync) {
    var sTitle = "withCache: bubbling up, relative path does not match; bSync = " + bSync;
    QUnit.test(sTitle, function (assert) {
        var oCache = {}, oContext = {
            withCache: function () { }
        }, oBinding = new ODataBinding({
            oCache: bSync ? oCache : {},
            oCachePromise: bSync ? {} : SyncPromise.resolve(oCache),
            oContext: oContext,
            sPath: "binding/path",
            bRelative: true
        }), oContextResult = {}, sPath = "/foo", fnProcessor = {}, oPromise, bWithOrWithoutCache = {};
        this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
        this.mock(oContext).expects("withCache").withExactArgs(sinon.match.same(fnProcessor), sPath, bSync, sinon.match.same(bWithOrWithoutCache)).returns(oContextResult);
        oPromise = oBinding.withCache(fnProcessor, sPath, bSync, bWithOrWithoutCache);
        assert.strictEqual(oPromise.unwrap(), oContextResult);
    });
});
QUnit.test("withCache: absolute, but with V4 context", function (assert) {
    var oCache = {}, oContext = {
        withCache: function () { }
    }, oBinding = new ODataBinding({
        oCache: oCache,
        oCachePromise: SyncPromise.resolve(oCache),
        oContext: oContext,
        sPath: "binding/path",
        bRelative: false
    }), sPath = "/foo", oPromise;
    this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
    this.mock(oContext).expects("withCache").never();
    oPromise = oBinding.withCache({}, sPath);
    assert.strictEqual(oPromise.unwrap(), undefined);
});
QUnit.test("withCache: operation w/o cache", function (assert) {
    var oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        oOperation: {}
    });
    assert.strictEqual(oBinding.withCache().unwrap(), undefined);
});
QUnit.test("withCache: operation w/o cache, processor called", function (assert) {
    var oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        oOperation: {}
    }), oCallbackResult = {}, sPath = "/foo", oProcessor = {
        fnProcessor: function () { }
    }, oPromise;
    this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("~");
    this.mock(oProcessor).expects("fnProcessor").withExactArgs(null, "~", sinon.match.same(oBinding)).returns(oCallbackResult);
    oPromise = oBinding.withCache(oProcessor.fnProcessor, sPath, false, true);
    assert.strictEqual(oPromise.unwrap(), oCallbackResult);
});
QUnit.test("withCache: use oCache, but cache computation is pending", function (assert) {
    var oBinding = new ODataBinding({
        oCache: undefined,
        oCachePromise: SyncPromise.resolve(Promise.resolve(null))
    });
    assert.strictEqual(oBinding.withCache({}, "", true).unwrap(), undefined);
});
QUnit.test("withCache: no cache, not relative", function (assert) {
    var oBinding = new ODataBinding({
        oCache: null,
        oCachePromise: SyncPromise.resolve(null),
        bRelative: false
    });
    assert.strictEqual(oBinding.withCache().unwrap(), undefined);
});
QUnit.test("getRootBinding: absolute binding", function (assert) {
    var oBinding = new ODataBinding({
        sPath: "/Employees",
        bRelative: false
    });
    assert.strictEqual(oBinding.getRootBinding(), oBinding);
});
QUnit.test("getRootBinding: quasi-absolute binding", function (assert) {
    var oBinding = new ODataBinding({
        oContext: {},
        sPath: "SO_2_SCHEDULE",
        bRelative: true
    });
    assert.strictEqual(oBinding.getRootBinding(), oBinding);
});
QUnit.test("getRootBinding: relative, unresolved binding", function (assert) {
    var oBinding = new ODataBinding({
        oContext: undefined,
        sPath: "SO_2_SCHEDULE",
        bRelative: true
    });
    assert.strictEqual(oBinding.getRootBinding(), undefined);
});
QUnit.test("getRootBinding: relative, resolved binding", function (assert) {
    var oParentBinding = {
        getRootBinding: function () { }
    }, oBinding = new ODataBinding({
        oContext: {
            getBinding: function () { return oParentBinding; }
        },
        sPath: "SO_2_SCHEDULE",
        bRelative: true
    });
    this.mock(oParentBinding).expects("getRootBinding").withExactArgs().returns(oParentBinding);
    assert.strictEqual(oBinding.getRootBinding(), oParentBinding);
});
QUnit.test("toString", function (assert) {
    var oBinding = new ODataBinding({
        bRelative: false,
        sPath: "/Employees(ID='1')"
    });
    assert.strictEqual(oBinding.toString(), sClassName + ": /Employees(ID='1')", "absolute");
    oBinding.sPath = "Employee_2_Team";
    oBinding.bRelative = true;
    assert.strictEqual(oBinding.toString(), sClassName + ": undefined|Employee_2_Team", "relative, unresolved");
    oBinding.oContext = { toString: function () { return "/Employees(ID='1')"; } };
    assert.strictEqual(oBinding.toString(), sClassName + ": /Employees(ID='1')|Employee_2_Team", "relative, resolved");
});
QUnit.test("checkSuspended: resumed", function () {
    var oBinding = new ODataBinding(), oRootBinding = new ODataBinding();
    this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").returns(false);
    this.mock(oBinding).expects("isRoot").never();
    this.mock(oBinding).expects("getResumeChangeReason").never();
    oBinding.checkSuspended();
});
QUnit.test("checkSuspended: unresolved", function () {
    var oBinding = new ODataBinding();
    this.mock(oBinding).expects("getRootBinding").returns(undefined);
    this.mock(oBinding).expects("isRoot").never();
    this.mock(oBinding).expects("getResumeChangeReason").never();
    oBinding.checkSuspended();
});
QUnit.test("checkSuspended: suspended", function (assert) {
    var oBinding = new ODataBinding({
        toString: function () { return "/Foo"; }
    }), oRootBinding = new ODataBinding();
    this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").returns(true);
    this.mock(oBinding).expects("isRoot").never();
    this.mock(oBinding).expects("getResumeChangeReason").never();
    assert.throws(function () {
        oBinding.checkSuspended();
    }, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
});
QUnit.test("checkSuspended: suspended, but never mind", function () {
    var oBinding = new ODataBinding({
        toString: function () { return "/Foo"; }
    }), oRootBinding = new ODataBinding();
    this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").returns(true);
    this.mock(oBinding).expects("isRoot").returns(false);
    this.mock(oBinding).expects("getResumeChangeReason").returns(undefined);
    oBinding.checkSuspended(true);
});
QUnit.test("checkSuspended: suspended w/ resume change reason", function (assert) {
    var oBinding = new ODataBinding({
        toString: function () { return "/Foo"; }
    }), oRootBinding = new ODataBinding();
    this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").returns(true);
    this.mock(oBinding).expects("isRoot").returns(false);
    this.mock(oBinding).expects("getResumeChangeReason").returns("bar");
    assert.throws(function () {
        oBinding.checkSuspended(true);
    }, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
});
QUnit.test("checkSuspended: suspended root", function (assert) {
    var oBinding = new ODataBinding({
        toString: function () { return "/Foo"; }
    }), oRootBinding = new ODataBinding();
    this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").returns(true);
    this.mock(oBinding).expects("isRoot").returns(true);
    this.mock(oBinding).expects("getResumeChangeReason").never();
    assert.throws(function () {
        oBinding.checkSuspended(true);
    }, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
});
[undefined, "group"].forEach(function (sGroupId) {
    [false, true].forEach(function (bModifying) {
        var sTitle = "lockGroup: groupId=" + sGroupId + ", bModifying=" + bModifying;
        QUnit.test(sTitle, function (assert) {
            var oBinding = new ODataBinding({
                oModel: { lockGroup: function () { } }
            }), fnCancel = {}, oGroupLock = {}, bLocked = {};
            this.mock(oBinding).expects("getGroupId").exactly(sGroupId || bModifying ? 0 : 1).withExactArgs().returns("group");
            this.mock(oBinding).expects("getUpdateGroupId").exactly(bModifying && !sGroupId ? 1 : 0).withExactArgs().returns("group");
            this.mock(oBinding.oModel).expects("lockGroup").withExactArgs("group", sinon.match.same(oBinding), sinon.match.same(bLocked), sinon.match.same(bModifying), sinon.match.same(fnCancel)).returns(oGroupLock);
            assert.strictEqual(oBinding.lockGroup(sGroupId, bLocked, bModifying, fnCancel), oGroupLock);
        });
    });
});
QUnit.test("checkBindingParameters, $$aggregation", function () {
    new ODataBinding().checkBindingParameters({ $$aggregation: [] }, ["$$aggregation"]);
});
["$$groupId", "$$updateGroupId"].forEach(function (sParameter) {
    QUnit.test("checkBindingParameters, " + sParameter, function (assert) {
        var aAllowedParams = [sParameter], oBinding = new ODataBinding({
            oModel: {
                checkGroupId: function () { }
            }
        }), oBindingParameters = {
            custom: "foo"
        };
        oBindingParameters[sParameter] = "$auto";
        this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$auto", false, "Unsupported value for binding parameter '" + sParameter + "': ");
        oBinding.checkBindingParameters(oBindingParameters, aAllowedParams);
        assert.throws(function () {
            oBinding.checkBindingParameters(oBindingParameters, []);
        }, new Error("Unsupported binding parameter: " + sParameter));
    });
});
QUnit.test("checkBindingParameters, $$ignoreMessages", function (assert) {
    var aAllowedParams = ["$$ignoreMessages"], oBinding = new ODataBinding({});
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$ignoreMessages: undefined }, aAllowedParams);
    }, new Error("Unsupported value for binding parameter '$$ignoreMessages': undefined"));
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$ignoreMessages: "foo" }, aAllowedParams);
    }, new Error("Unsupported value for binding parameter '$$ignoreMessages': foo"));
    oBinding.checkBindingParameters({ $$ignoreMessages: true }, aAllowedParams);
    oBinding.checkBindingParameters({ $$ignoreMessages: false }, aAllowedParams);
});
QUnit.test("checkBindingParameters, $$inheritExpandSelect", function (assert) {
    var aAllowedParams = ["$$inheritExpandSelect"], oBinding = new ODataBinding({
        oOperation: {}
    });
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$inheritExpandSelect: undefined }, aAllowedParams);
    }, new Error("Unsupported value for binding parameter '$$inheritExpandSelect': undefined"));
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$inheritExpandSelect: "foo" }, aAllowedParams);
    }, new Error("Unsupported value for binding parameter '$$inheritExpandSelect': foo"));
    oBinding.checkBindingParameters({ $$inheritExpandSelect: true }, aAllowedParams);
    oBinding.checkBindingParameters({ $$inheritExpandSelect: false }, aAllowedParams);
});
QUnit.test("checkBindingParameters, $$inheritExpandSelect, no operation binding", function (assert) {
    var aAllowedParams = ["$$inheritExpandSelect"], oBinding = new ODataBinding();
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$inheritExpandSelect: true }, aAllowedParams);
    }, new Error("Unsupported binding parameter $$inheritExpandSelect: " + "binding is not an operation binding"));
});
QUnit.test("checkBindingParameters: $$inheritExpandSelect with $expand", function (assert) {
    var aAllowedParams = ["$$inheritExpandSelect"], oBinding = new ODataBinding({
        oOperation: {}
    }), mParameters = Object.assign({
        $$inheritExpandSelect: true
    }, { $expand: { NavProperty: {} } });
    assert.throws(function () {
        oBinding.checkBindingParameters(mParameters, aAllowedParams);
    }, new Error("Must not set parameter $$inheritExpandSelect on a binding which has " + "a $expand binding parameter"));
});
QUnit.test("checkBindingParameters, $$operationMode", function (assert) {
    var aAllowedParams = ["$$operationMode"], oBinding = new ODataBinding();
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$operationMode: "Client" }, aAllowedParams);
    }, new Error("Unsupported operation mode: Client"));
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$operationMode: SubmitMode.Auto }, aAllowedParams);
    }, new Error("Unsupported operation mode: Auto"));
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$operationMode: "any" }, aAllowedParams);
    }, new Error("Unsupported operation mode: any"));
    oBinding.checkBindingParameters({ $$operationMode: "Server" }, aAllowedParams);
});
["$$canonicalPath", "$$noPatch", "$$ownRequest", "$$patchWithoutSideEffects", "$$sharedRequest"].forEach(function (sName) {
    QUnit.test("checkBindingParameters, " + sName, function (assert) {
        var aAllowedParameters = [sName], oBinding = new ODataBinding(), mParameters = {};
        ["foo", false, undefined].forEach(function (sValue) {
            mParameters[sName] = sValue;
            assert.throws(function () {
                oBinding.checkBindingParameters(mParameters, aAllowedParameters);
            }, new Error("Unsupported value for binding parameter '" + sName + "': " + sValue));
        });
        mParameters[sName] = true;
        oBinding.checkBindingParameters(mParameters, aAllowedParameters);
    });
});
QUnit.test("checkBindingParameters, unknown $$-parameter", function (assert) {
    var oBinding = new ODataBinding();
    assert.throws(function () {
        oBinding.checkBindingParameters({ $$someName: "~" }, ["$$someName"]);
    }, new Error("Unknown binding-specific parameter: $$someName"));
});
[true, false, undefined].forEach(function (bCachesOnly) {
    var sTitle = "removeCachesAndMessages: bCachesOnly=" + bCachesOnly;
    QUnit.test(sTitle, function (assert) {
        var oBinding = new ODataBinding({
            oCache: { removeMessages: function () { } }
        }), mCacheByResourcePath = {
            "foo1": {
                $deepResourcePath: "fooDeep1"
            },
            "foo2": {
                $deepResourcePath: "fooDeep2",
                removeMessages: function () { }
            },
            "foo3": {
                $deepResourcePath: "fooDeep3"
            }
        }, oCacheMock = this.mock(oBinding.oCache), oHelperMock = this.mock(_Helper), that = this;
        oBinding.mCacheByResourcePath = undefined;
        oCacheMock.expects("removeMessages").exactly(bCachesOnly !== true ? 1 : 0).withExactArgs();
        oBinding.removeCachesAndMessages("~base~path", bCachesOnly);
        oBinding.mCacheByResourcePath = mCacheByResourcePath;
        oCacheMock.expects("removeMessages").exactly(bCachesOnly !== true ? 1 : 0).withExactArgs();
        oHelperMock.expects("hasPathPrefix").withExactArgs("fooDeep1", "~base~path~").returns(false);
        oHelperMock.expects("hasPathPrefix").withExactArgs("fooDeep2", "~base~path~").returns(true);
        that.mock(mCacheByResourcePath["foo2"]).expects("removeMessages").exactly(bCachesOnly !== true ? 1 : 0).withExactArgs();
        oHelperMock.expects("hasPathPrefix").withExactArgs("fooDeep3", "~base~path~").returns(false);
        oBinding.removeCachesAndMessages("~base~path~", bCachesOnly);
        assert.deepEqual(oBinding.mCacheByResourcePath, {
            "foo1": { $deepResourcePath: "fooDeep1" },
            "foo3": { $deepResourcePath: "fooDeep3" }
        });
    });
});
QUnit.test("removeCachesAndMessages: w/o mCacheByResourcePath", function () {
    var oBinding = new ODataBinding({
        oCache: { removeMessages: function () { } }
    });
    this.mock(oBinding.oCache).expects("removeMessages").withExactArgs();
    oBinding.removeCachesAndMessages("");
    oBinding.removeCachesAndMessages("", true);
    oBinding.oCache = undefined;
    oBinding.removeCachesAndMessages("");
});
QUnit.test("fetchResourcePath for unresolved binding", function (assert) {
    var oBinding = new ODataBinding({
        sPath: "SO_2_SOITEM",
        bRelative: true
    });
    return oBinding.fetchResourcePath().then(function (sResourcePath) {
        assert.strictEqual(sResourcePath, undefined);
    });
});
QUnit.test("fetchResourcePath for absolute binding", function (assert) {
    var oBinding = new ODataBinding({
        sPath: "/SalesOrderList",
        bRelative: false
    });
    return oBinding.fetchResourcePath({}).then(function (sResourcePath) {
        assert.strictEqual(sResourcePath, "SalesOrderList");
    });
});
[false, true].forEach(function (bCallWithContext, i) {
    [undefined, true].forEach(function (bCanonicalPath, j) {
        QUnit.test("fetchResourcePath, base context, " + i + ", " + j, function (assert) {
            var oBinding, oContext = {
                getPath: function () { }
            }, mTemplate = { sPath: "SO_2_SOITEM", bRelative: true };
            if (bCanonicalPath) {
                mTemplate.mParameters = { $$canonicalPath: true };
            }
            if (!bCallWithContext) {
                mTemplate.oContext = oContext;
            }
            oBinding = new ODataBinding(mTemplate);
            this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList('42')");
            this.mock(_Helper).expects("buildPath").withExactArgs("/SalesOrderList('42')", "SO_2_SOITEM").returns("/SalesOrderList('42')/SO_2_SOITEM");
            return oBinding.fetchResourcePath(bCallWithContext ? oContext : undefined).then(function (sResourcePath) {
                assert.strictEqual(sResourcePath, "SalesOrderList('42')/SO_2_SOITEM");
            });
        });
    });
});
QUnit.test("fetchResourcePath, V4 context, no canonical path", function (assert) {
    var oBinding = new ODataBinding({
        sPath: "bindingPath",
        bRelative: true
    }), oContext = {
        fetchCanonicalPath: function () { },
        getPath: function () { }
    };
    this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList('42')/SO_2_BP");
    this.mock(oContext).expects("fetchCanonicalPath").never();
    this.mock(_Helper).expects("buildPath").withExactArgs("/SalesOrderList('42')/SO_2_BP", "bindingPath").returns("/SalesOrderList('42')/SO_2_BP/bindingPath");
    return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
        assert.strictEqual(sResourcePath, "SalesOrderList('42')/SO_2_BP/bindingPath");
    });
});
QUnit.test("fetchResourcePath, V4 context, canonical path", function (assert) {
    var oBinding = new ODataBinding({
        mParameters: { $$canonicalPath: true },
        sPath: "bindingPath",
        bRelative: true
    }), oContext = {
        fetchCanonicalPath: function () { },
        getPath: function () { }
    };
    this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList('42')/SO_2_BP");
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(SyncPromise.resolve("/BusinessPartnerList('77')"));
    this.mock(_Helper).expects("buildPath").withExactArgs("/BusinessPartnerList('77')", "bindingPath").returns("/BusinessPartnerList('77')/bindingPath");
    return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
        assert.strictEqual(sResourcePath, "BusinessPartnerList('77')/bindingPath");
    });
});
[undefined, true].forEach(function (bCanonicalPath) {
    [
        "/A/1",
        "/A/1/SO_2_BP(id=42)",
        "/A($uid=id-1-23)",
        "/A($uid=id-1-23)/A_2_B(id=42)"
    ].forEach(function (sContextPath) {
        var sTitle = "fetchResourcePath, V4 context, $$canonicalPath " + bCanonicalPath + ", path: " + sContextPath;
        QUnit.test(sTitle, function (assert) {
            var mTemplate = bCanonicalPath ? { mParameters: { $$canonicalPath: true }, sPath: "c", bRelative: true } : { sPath: "c", bRelative: true }, oBinding = new ODataBinding(mTemplate), oContext = {
                fetchCanonicalPath: function () { },
                getPath: function () { }
            }, sFetchCanonicalPath = "/canonicalPath";
            this.mock(oContext).expects("getPath").withExactArgs().returns(sContextPath);
            this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(SyncPromise.resolve(sFetchCanonicalPath));
            this.mock(_Helper).expects("buildPath").withExactArgs(sFetchCanonicalPath, "c").returns("/canonicalPath/c");
            return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
                assert.strictEqual(sResourcePath, "canonicalPath/c");
            });
        });
    });
});
QUnit.test("fetchResourcePath, fetchCanonicalPath rejects", function (assert) {
    var oBinding = new ODataBinding({ bRelative: true, mParameters: { $$canonicalPath: true } }), oContext = {
        fetchCanonicalPath: function () { },
        getPath: function () { }
    }, oError = {};
    this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList/1");
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(SyncPromise.reject(oError));
    return oBinding.fetchResourcePath(oContext).then(function () {
        assert.ok(false, "Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("isRootBindingSuspended", function (assert) {
    var oBinding = new ODataBinding(), oBindingMock = this.mock(oBinding), bResult = {}, oRootBinding = new ODataBinding();
    oBindingMock.expects("getRootBinding").withExactArgs().returns(undefined);
    assert.notOk(oBinding.isRootBindingSuspended());
    oBindingMock.expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(bResult);
    assert.strictEqual(oBinding.isRootBindingSuspended(), bResult);
});
QUnit.test("getRootBindingResumePromise", function (assert) {
    var oBinding = new ODataBinding(), oBindingMock = this.mock(oBinding), oResumePromise = {}, oRootBinding = new ODataBinding({ getResumePromise: function () { } });
    oBindingMock.expects("getRootBinding").withExactArgs().returns(undefined);
    assert.strictEqual(oBinding.getRootBindingResumePromise(), SyncPromise.resolve());
    oBindingMock.expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("getResumePromise").withExactArgs().returns(oResumePromise);
    assert.strictEqual(oBinding.getRootBindingResumePromise(), oResumePromise);
});
QUnit.test("setResumeChangeReason", function (assert) {
    var oBinding = new ODataBinding();
    assert.strictEqual(oBinding.sResumeChangeReason, undefined);
    oBinding.setResumeChangeReason("foo");
    assert.strictEqual(oBinding.sResumeChangeReason, undefined);
    oBinding.setResumeChangeReason(ChangeReason.Context);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Context);
    oBinding.setResumeChangeReason(ChangeReason.Change);
    oBinding.setResumeChangeReason(ChangeReason.Context);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
    oBinding.setResumeChangeReason(ChangeReason.Refresh);
    oBinding.setResumeChangeReason(ChangeReason.Change);
    oBinding.setResumeChangeReason(ChangeReason.Context);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Refresh);
    oBinding.setResumeChangeReason(ChangeReason.Sort);
    oBinding.setResumeChangeReason(ChangeReason.Refresh);
    oBinding.setResumeChangeReason(ChangeReason.Change);
    oBinding.setResumeChangeReason(ChangeReason.Context);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Sort);
    oBinding.setResumeChangeReason(ChangeReason.Filter);
    oBinding.setResumeChangeReason(ChangeReason.Sort);
    oBinding.setResumeChangeReason(ChangeReason.Refresh);
    oBinding.setResumeChangeReason(ChangeReason.Change);
    oBinding.setResumeChangeReason(ChangeReason.Context);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Filter);
});
QUnit.test("getResumeChangeReason", function (assert) {
    var oBinding = new ODataBinding(), oBindingMock = this.mock(oBinding), oDependentBinding = {
        getResumeChangeReason: function () { }
    }, oDependentBinding1 = {
        getResumeChangeReason: function () { }
    }, oDependentBinding2 = {
        getResumeChangeReason: function () { }
    }, oDependentBindingMock = this.mock(oDependentBinding);
    oBindingMock.expects("getDependentBindings").returns([]);
    assert.strictEqual(oBinding.getResumeChangeReason(), undefined);
    oBinding.sResumeChangeReason = ChangeReason.Refresh;
    oBindingMock.expects("getDependentBindings").returns([]);
    assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Refresh);
    oBindingMock.expects("getDependentBindings").returns([oDependentBinding]);
    oDependentBindingMock.expects("getResumeChangeReason").withExactArgs().returns(undefined);
    assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Refresh);
    oBindingMock.expects("getDependentBindings").returns([oDependentBinding]);
    oDependentBindingMock.expects("getResumeChangeReason").withExactArgs().returns(ChangeReason.Change);
    assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Refresh);
    oBindingMock.expects("getDependentBindings").returns([oDependentBinding, oDependentBinding1, oDependentBinding2]);
    oDependentBindingMock.expects("getResumeChangeReason").withExactArgs().returns(ChangeReason.Change);
    this.mock(oDependentBinding1).expects("getResumeChangeReason").withExactArgs().returns(ChangeReason.Filter);
    this.mock(oDependentBinding2).expects("getResumeChangeReason").withExactArgs().returns(ChangeReason.Sort);
    assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Filter);
});
QUnit.test("doDeregisterChangeListener", function () {
    var oBinding = new ODataBinding(), oCache = {
        deregisterChange: function () { }
    }, oListener = {}, sPath = "foo";
    oBinding.oCache = oCache;
    this.mock(oCache).expects("deregisterChange").withExactArgs(sPath, sinon.match.same(oListener));
    oBinding.doDeregisterChangeListener(sPath, oListener);
});
QUnit.test("allow for super calls", function (assert) {
    var oBinding = new ODataBinding();
    [
        "adjustPredicate",
        "destroy",
        "doDeregisterChangeListener",
        "fetchCache",
        "hasPendingChangesForPath"
    ].forEach(function (sMethod) {
        assert.strictEqual(asODataBinding.prototype[sMethod], oBinding[sMethod]);
    });
});
QUnit.test("assertSameCache", function (assert) {
    var oBinding = new ODataBinding({
        oCache: {}
    }), oCache = {
        toString: function () { return "~"; }
    };
    oBinding.assertSameCache(oBinding.oCache);
    try {
        oBinding.assertSameCache(oCache);
        assert.ok(false);
    }
    catch (oError) {
        assert.strictEqual(oError.message, oBinding + " is ignoring response from inactive cache: ~");
        assert.strictEqual(oError.canceled, true);
    }
});
QUnit.test("adjustPredicate", function (assert) {
    var oBinding = new ODataBinding({
        sReducedPath: "/A($uid=id-1-23)/A_2_B(id=42)"
    });
    oBinding.adjustPredicate("($uid=id-1-23)", "('foo')");
    assert.strictEqual(oBinding.sReducedPath, "/A('foo')/A_2_B(id=42)");
    oBinding.adjustPredicate("('n/a')", "('bar')");
    assert.strictEqual(oBinding.sReducedPath, "/A('foo')/A_2_B(id=42)");
});
QUnit.test("requestAbsoluteSideEffects: nothing to do", function (assert) {
    var oBinding = new ODataBinding(), oHelperMock = this.mock(_Helper);
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
    oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
    oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta").returns(undefined);
    oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request1").returns(false);
    oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta").returns(undefined);
    oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(false);
    assert.strictEqual(oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2"]), undefined);
});
QUnit.test("requestAbsoluteSideEffects: refresh", function (assert) {
    var oBinding = new ODataBinding({
        requestSideEffects: function () { }
    }), oHelperMock = this.mock(_Helper);
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
    oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
    oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta").returns("~1");
    oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta").returns(undefined);
    oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(true);
    this.mock(oBinding).expects("requestSideEffects").withExactArgs("group", [""]).resolves("~");
    return oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2", "/request3"]).then(function (vResult) {
        assert.strictEqual(vResult, "~");
    });
});
QUnit.test("requestAbsoluteSideEffects: refreshInternal", function (assert) {
    var oBinding = new ODataBinding({
        refreshInternal: function () { }
    }), oHelperMock = this.mock(_Helper);
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
    oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
    oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta").returns("~1");
    oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta").returns(undefined);
    oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(true);
    this.mock(oBinding).expects("refreshInternal").withExactArgs("", "group", true).resolves("~");
    return oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2", "/request3"]).then(function (vResult) {
        assert.strictEqual(vResult, "~");
    });
});
QUnit.test("requestAbsoluteSideEffects: sideEffects", function (assert) {
    var oBinding = new ODataBinding({
        requestSideEffects: function () { }
    }), oHelperMock = this.mock(_Helper);
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
    oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
    oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta").returns("~1");
    oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta").returns(undefined);
    oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(false);
    oHelperMock.expects("getRelativePath").withExactArgs("/request3", "/meta").returns("~3");
    this.mock(oBinding).expects("requestSideEffects").withExactArgs("group", ["~1", "~3"]).resolves("~");
    return oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2", "/request3"]).then(function (vResult) {
        assert.strictEqual(vResult, "~");
    });
});