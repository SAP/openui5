import Log from "sap/base/Log";
import isEmptyObject from "sap/base/util/isEmptyObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import BaseContext from "sap/ui/model/Context";
import Context from "sap/ui/model/odata/v4/Context";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
QUnit.module("sap.ui.model.odata.v4.Context", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("VIRTUAL", function (assert) {
    assert.throws(function () {
        Context.VIRTUAL = 42;
    }, TypeError, "immutable");
    assert.strictEqual(Context.VIRTUAL, -9007199254740991);
});
QUnit.test("create", function (assert) {
    var oBinding = {}, oContext, oCreatedPromise, bCreatedPromisePending = true, oModel = {}, sPath = "/foo", fnResolve;
    oContext = Context.create(oModel, oBinding, sPath, 42);
    assert.ok(oContext instanceof BaseContext);
    assert.strictEqual(oContext.getModel(), oModel);
    assert.strictEqual(oContext.getBinding(), oBinding);
    assert.strictEqual(oContext.getPath(), sPath);
    assert.strictEqual(oContext.getModelIndex(), 42);
    assert.strictEqual(oContext.created(), undefined);
    assert.strictEqual(oContext.isKeepAlive(), false);
    assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);
    oContext = Context.create(oModel, oBinding, sPath, 42, new SyncPromise(function (resolve) {
        fnResolve = resolve;
    }));
    oCreatedPromise = oContext.created();
    assert.ok(oCreatedPromise instanceof Promise, "Instance of Promise");
    oCreatedPromise.then(function (oResult) {
        bCreatedPromisePending = false;
        assert.strictEqual(oResult, undefined, "create promise resolves w/o data ('bar')");
    }, function () {
        bCreatedPromisePending = false;
    });
    assert.ok(bCreatedPromisePending, "Created Promise still pending");
    fnResolve("bar");
    return oCreatedPromise.then(function () {
        assert.strictEqual(bCreatedPromisePending, false, "Created Promise resolved");
    });
});
QUnit.test("getGeneration: after Context.createNewContext", function (assert) {
    var oBinding = {}, oContext1, oContext2, oModel = {}, sPath = "/foo";
    oContext1 = Context.createNewContext(oModel, oBinding, sPath);
    oContext2 = Context.createNewContext(oModel, oBinding, sPath);
    assert.ok(oContext1.getGeneration() > 0);
    assert.strictEqual(oContext1.getGeneration(), oContext1.getGeneration());
    assert.ok(oContext2.getGeneration(), oContext1.getGeneration());
});
QUnit.test("getGeneration: after Context.create", function (assert) {
    var oBinding = {
        getGeneration: function () { }
    }, oContext;
    oContext = Context.create({}, oBinding, "/foo/bar");
    this.mock(oBinding).expects("getGeneration").withExactArgs().returns(23);
    assert.strictEqual(oContext.getGeneration(), 23);
    assert.strictEqual(oContext.getGeneration(true), 0);
});
QUnit.test("getModelIndex() adds number of created contexts", function (assert) {
    var oBinding = {}, oContext;
    oContext = Context.create(null, oBinding, "/foo", 42);
    assert.strictEqual(oContext.getModelIndex(), 42);
    oBinding.iCreatedContexts = 7;
    assert.strictEqual(oContext.getModelIndex(), 49);
    oContext.iIndex = undefined;
    assert.strictEqual(oContext.getModelIndex(), undefined);
});
QUnit.test("getIndex()", function (assert) {
    var oBinding = {}, oContext = Context.create(null, oBinding, "/foo", 42), iResult = {};
    this.mock(oContext).expects("getModelIndex").returns(iResult);
    assert.strictEqual(oContext.getIndex(), iResult);
    oBinding.bCreatedAtEnd = true;
    oBinding.iCreatedContexts = 4;
    assert.strictEqual(Context.create(null, oBinding, "/foo", -1).getIndex(), 0);
    assert.strictEqual(Context.create(null, oBinding, "/foo", -4).getIndex(), 3);
    oBinding.bLengthFinal = true;
    oBinding.iMaxLength = 6;
    assert.strictEqual(Context.create(null, oBinding, "/foo", 0).getIndex(), 0);
    assert.strictEqual(Context.create(null, oBinding, "/foo", 5).getIndex(), 5);
    assert.strictEqual(Context.create(null, oBinding, "/foo", -1).getIndex(), 6);
    assert.strictEqual(Context.create(null, oBinding, "/foo", -4).getIndex(), 9);
    assert.strictEqual(Context.create(null, oBinding, "/foo", undefined).getIndex(), undefined);
});
QUnit.test("path must be absolute", function (assert) {
    assert.throws(function () {
        Context.create(null, null, "foo");
    }, new Error("Not an absolute path: foo"));
    assert.throws(function () {
        Context.createNewContext(null, null, "foo");
    }, new Error("Not an absolute path: foo"));
});
QUnit.test("path must not contain trailing slash", function (assert) {
    assert.throws(function () {
        Context.create(null, null, "/");
    }, new Error("Unsupported trailing slash: /"));
    assert.throws(function () {
        Context.create(null, null, "/foo/");
    }, new Error("Unsupported trailing slash: /foo/"));
    assert.throws(function () {
        Context.createNewContext(null, null, "/");
    }, new Error("Unsupported trailing slash: /"));
    assert.throws(function () {
        Context.createNewContext(null, null, "/foo/");
    }, new Error("Unsupported trailing slash: /foo/"));
});
QUnit.test("toString", function (assert) {
    var oContext, fnResolve;
    assert.strictEqual(Context.create({}, {}, "/Employees").toString(), "/Employees");
    assert.strictEqual(Context.create({}, {}, "/Employees", 5).toString(), "/Employees[5]");
    oContext = Context.create({}, {}, "/Employees", -1, new SyncPromise(function (resolve) {
        fnResolve = resolve;
    }));
    assert.strictEqual(oContext.toString(), "/Employees[-1|transient]");
    fnResolve();
    return oContext.created().then(function () {
        assert.strictEqual(oContext.toString(), "/Employees[-1]");
    });
});
[false, true].forEach(function (bAutoExpandSelect) {
    [undefined, "bar"].forEach(function (sPath) {
        var sTitle = "fetchValue: relative, path=" + sPath + ", autoExpandSelect=" + bAutoExpandSelect;
        QUnit.test(sTitle, function (assert) {
            var bCached = {}, oBinding = {
                fetchValue: function () { },
                getBaseForPathReduction: function () { }
            }, oMetaModel = {
                getReducedPath: function () { }
            }, oModel = {
                bAutoExpandSelect: bAutoExpandSelect,
                getMetaModel: function () { return oMetaModel; }
            }, oContext = Context.create(oModel, oBinding, "/foo", 42), oListener = {}, oResult = {};
            this.mock(_Helper).expects("buildPath").withExactArgs("/foo", sPath).returns("/~");
            if (bAutoExpandSelect) {
                this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("/base");
                this.mock(oMetaModel).expects("getReducedPath").withExactArgs("/~", "/base").returns("/reduced");
            }
            this.mock(oBinding).expects("fetchValue").withExactArgs(bAutoExpandSelect ? "/reduced" : "/~", sinon.match.same(oListener), sinon.match.same(bCached)).returns(oResult);
            assert.strictEqual(oContext.fetchValue(sPath, oListener, bCached), oResult);
        });
    });
});
QUnit.test("fetchValue: /bar", function (assert) {
    var bCached = {}, oBinding = {
        fetchValue: function () { }
    }, oContext = Context.create(null, oBinding, "/foo", 42), oListener = {}, oResult = {}, sPath = "/bar";
    this.mock(oBinding).expects("fetchValue").withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached)).returns(oResult);
    assert.strictEqual(oContext.fetchValue(sPath, oListener, bCached), oResult);
});
QUnit.test("fetchValue for a virtual context", function (assert) {
    var oContext = Context.create(null, {}, "/foo/" + Context.VIRTUAL, Context.VIRTUAL), oResult;
    oResult = oContext.fetchValue("bar");
    assert.strictEqual(oResult.isFulfilled(), true);
    assert.strictEqual(oResult.getResult(), undefined);
});
[
    { aBindingHasPendingChanges: [true], bResult: true },
    { aBindingHasPendingChanges: [false, true], bResult: true },
    {
        aBindingHasPendingChanges: [false, false],
        bUnresolvedBindingHasPendingChanges: true,
        bResult: true
    },
    {
        aBindingHasPendingChanges: [false, false],
        bUnresolvedBindingHasPendingChanges: false,
        bResult: false
    }
].forEach(function (oFixture, i) {
    QUnit.test("hasPendingChanges: " + i, function (assert) {
        var oModel = {
            getDependentBindings: function () { },
            withUnresolvedBindings: function () { }
        }, oBinding0 = {
            hasPendingChanges: function () { }
        }, oBinding1 = {
            hasPendingChanges: function () { }
        }, oParentBinding = {}, sPath = "/EMPLOYEES('42')", oContext = Context.create(oModel, oParentBinding, sPath, 13);
        this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext)).returns([oBinding0, oBinding1]);
        this.mock(oBinding0).expects("hasPendingChanges").withExactArgs().returns(oFixture.aBindingHasPendingChanges[0]);
        this.mock(oBinding1).expects("hasPendingChanges").withExactArgs().exactly(oFixture.aBindingHasPendingChanges[0] ? 0 : 1).returns(oFixture.aBindingHasPendingChanges[1]);
        this.mock(oModel).expects("withUnresolvedBindings").withExactArgs("hasPendingChangesInCaches", "EMPLOYEES('42')").exactly(oFixture.hasOwnProperty("bUnresolvedBindingHasPendingChanges") ? 1 : 0).returns(oFixture.bUnresolvedBindingHasPendingChanges);
        assert.strictEqual(oContext.hasPendingChanges(), oFixture.bResult);
    });
});
[false, true].forEach(function (bTransient) {
    QUnit.test("hasPendingChanges: transient context = " + bTransient, function (assert) {
        var oModel = {
            getDependentBindings: function () { },
            withUnresolvedBindings: function () { }
        }, oContext = Context.create(oModel, {}, "/TEAMS", 0);
        this.stub(oContext, "toString");
        this.mock(oContext).expects("isTransient").withExactArgs().returns(bTransient);
        this.mock(oModel).expects("getDependentBindings").exactly(bTransient ? 0 : 1).withExactArgs(sinon.match.same(oContext)).returns([]);
        this.mock(oModel).expects("withUnresolvedBindings").exactly(bTransient ? 0 : 1).withExactArgs("hasPendingChangesInCaches", "TEAMS").returns(false);
        assert.strictEqual(oContext.hasPendingChanges(), bTransient);
    });
});
QUnit.test("isTransient", function (assert) {
    var oBinding = {}, oContext = Context.create(null, oBinding, "/foo", 42), fnResolve;
    assert.notOk(oContext.isTransient(), "no created Promise -> not transient");
    oContext = Context.create(null, oBinding, "/foo", 42, new SyncPromise(function (resolve) {
        fnResolve = resolve;
    }));
    assert.ok(oContext.isTransient(), "unresolved created Promise -> transient");
    fnResolve();
    return oContext.created().then(function () {
        assert.notOk(oContext.isTransient(), "resolved -> not transient");
    });
});
QUnit.test("requestObject", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oContext = Context.create(null, oBinding, "/foo"), oClone = {}, oData = {}, oPromise, oSyncPromise = SyncPromise.resolve(Promise.resolve(oData));
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar").returns(oSyncPromise);
    this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(oData)).returns(oClone);
    oPromise = oContext.requestObject("bar");
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, oClone);
    });
});
QUnit.test("getObject", function (assert) {
    var oCacheData = {}, oContext = Context.create(null, {}, "/foo"), oResult = {};
    this.mock(oContext).expects("getValue").withExactArgs("bar").returns(oCacheData);
    this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(oCacheData)).returns(oResult);
    assert.strictEqual(oContext.getObject("bar"), oResult);
});
QUnit.test("getValue", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oContext = Context.create(null, oBinding, "/foo"), oData = {};
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(SyncPromise.resolve(oData));
    assert.strictEqual(oContext.getValue("bar"), oData);
});
QUnit.test("getValue: unexpected error", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oError = {}, oModel = {
        reportError: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo");
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(SyncPromise.reject(oError));
    this.mock(oModel).expects("reportError").withExactArgs("Unexpected error", "sap.ui.model.odata.v4.Context", sinon.match.same(oError));
    assert.strictEqual(oContext.getValue("bar"), undefined);
});
QUnit.test("getValue: not found in cache", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oError = new Error("Unexpected request: GET /foo/bar"), oModel = {
        reportError: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo");
    oError.$cached = true;
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(SyncPromise.reject(oError));
    this.mock(oModel).expects("reportError").never();
    assert.strictEqual(oContext.getValue("bar"), undefined);
});
QUnit.test("getValue: unresolved", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oContext = Context.create(null, oBinding, "/foo");
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(SyncPromise.resolve(Promise.resolve(42)));
    assert.strictEqual(oContext.getValue("bar"), undefined);
});
[42, null].forEach(function (vResult) {
    QUnit.test("getProperty: primitive result " + vResult, function (assert) {
        var oBinding = {
            checkSuspended: function () { }
        }, oModel = {
            resolve: function () { }
        }, oContext = Context.create(oModel, oBinding, "/foo"), oSyncPromise = SyncPromise.resolve(vResult);
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(oSyncPromise);
        this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext)).returns("/foo/bar");
        assert.strictEqual(oContext.getProperty("bar"), vResult);
    });
});
QUnit.test("getProperty: structured result", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oModel = {
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo", 1), oSyncPromise = SyncPromise.resolve({});
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(oSyncPromise);
    this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext)).returns("~");
    assert.throws(function () {
        oContext.getProperty("bar");
    }, new Error("Accessed value is not primitive: ~"));
});
QUnit.test("getProperty: unresolved", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oModel = {
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo"), oSyncPromise = SyncPromise.resolve(Promise.resolve(42));
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(oSyncPromise);
    this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext)).returns("/foo/bar");
    assert.strictEqual(oContext.getProperty("bar"), undefined);
});
QUnit.test("getProperty: not found in cache", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oError = new Error("Unexpected request: GET /foo/bar"), oModel = {
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo");
    oError.$cached = true;
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(SyncPromise.reject(oError));
    this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext)).returns("/foo/bar");
    assert.strictEqual(oContext.getProperty("bar"), undefined);
});
QUnit.test("getProperty: rejected", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oModel = {
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo"), sMessage = "read error", oPromise = Promise.reject(new Error(sMessage)), oSyncPromise = SyncPromise.resolve(oPromise);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(oSyncPromise);
    this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext)).returns("/foo/bar");
    this.oLogMock.expects("warning").withExactArgs(sMessage, "bar", "sap.ui.model.odata.v4.Context");
    return oPromise.catch(function () {
        assert.strictEqual(oContext.getProperty("bar"), undefined);
    });
});
[true, false].forEach(function (bTypeIsResolved) {
    QUnit.test("getProperty: external, bTypeIsResolved=" + bTypeIsResolved, function (assert) {
        var oBinding = {
            checkSuspended: function () { }
        }, oMetaModel = {
            fetchUI5Type: function () { }
        }, oModel = {
            getMetaModel: function () {
                return oMetaModel;
            },
            resolve: function () { }
        }, oContext = Context.create(oModel, oBinding, "/foo", 42), oType = {
            formatValue: function () { }
        }, oResolvedType = bTypeIsResolved ? oType : Promise.resolve(oType), oSyncPromiseType = SyncPromise.resolve(oResolvedType), oSyncPromiseValue = SyncPromise.resolve(1234);
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true).returns(oSyncPromiseValue);
        this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext)).returns("~");
        this.mock(oMetaModel).expects("fetchUI5Type").withExactArgs("~").returns(oSyncPromiseType);
        if (bTypeIsResolved) {
            this.mock(oType).expects("formatValue").withExactArgs(1234, "string").returns("1,234");
        }
        assert.strictEqual(oContext.getProperty("bar", true), bTypeIsResolved ? "1,234" : undefined);
    });
});
QUnit.test("requestProperty: primitive result", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        fetchIfChildCanUseCache: function () { }
    }, oBindingMock = this.mock(oBinding), oModel = {
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo"), oContextMock = this.mock(oContext), oModelMock = this.mock(oModel);
    oBindingMock.expects("checkSuspended").withExactArgs();
    oBindingMock.expects("fetchIfChildCanUseCache").withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
        return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
    })).resolves("/resolved/bar");
    oBindingMock.expects("fetchIfChildCanUseCache").withExactArgs(oContext, "baz", sinon.match(function (oPromise) {
        return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
    })).resolves("/resolved/baz");
    oContextMock.expects("fetchValue").withExactArgs("/resolved/bar", null, undefined).resolves(42);
    oModelMock.expects("resolve").withExactArgs("/resolved/bar", sinon.match.same(oContext)).returns("/resolved/bar");
    oContextMock.expects("fetchValue").withExactArgs("/resolved/baz", null, undefined).resolves(null);
    oModelMock.expects("resolve").withExactArgs("/resolved/baz", sinon.match.same(oContext)).returns("/resolved/baz");
    return oContext.requestProperty(["bar", "baz"]).then(function (aActual) {
        assert.deepEqual(aActual, [42, null]);
    });
});
QUnit.test("requestProperty: path cannot be requested", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        fetchIfChildCanUseCache: function () { }
    }, oContext = Context.create(null, oBinding, "/foo");
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oBinding).expects("fetchIfChildCanUseCache").withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
        return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
    })).resolves(undefined);
    this.mock(oContext).expects("fetchValue").never();
    this.oLogMock.expects("error").withExactArgs("Not a valid property path: bar", undefined, "sap.ui.model.odata.v4.Context");
    return oContext.requestProperty("bar").then(function (vActual) {
        assert.strictEqual(vActual, undefined);
    });
});
QUnit.test("requestProperty: structured result", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        fetchIfChildCanUseCache: function () { }
    }, oModel = {
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo", 1);
    this.mock(oBinding).expects("fetchIfChildCanUseCache").withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
        return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
    })).resolves("/resolved/path");
    this.mock(oContext).expects("fetchValue").withExactArgs("/resolved/path", null, undefined).resolves({});
    this.mock(oModel).expects("resolve").withExactArgs("/resolved/path", sinon.match.same(oContext)).returns("/resolved/path");
    return oContext.requestProperty("bar").then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Accessed value is not primitive: /resolved/path");
    });
});
QUnit.test("requestProperty: external", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        fetchIfChildCanUseCache: function () { }
    }, oMetaModel = {
        fetchUI5Type: function () { }
    }, oModel = {
        getMetaModel: function () {
            return oMetaModel;
        },
        resolve: function () { }
    }, oType = {
        formatValue: function () { }
    }, oContext = Context.create(oModel, oBinding, "/foo", 42), oSyncPromiseType = SyncPromise.resolve(Promise.resolve(oType)), oSyncPromiseValue = SyncPromise.resolve(1234);
    this.mock(oBinding).expects("fetchIfChildCanUseCache").withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
        return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
    })).resolves("/resolved/path");
    this.mock(oContext).expects("fetchValue").withExactArgs("/resolved/path", null, undefined).returns(oSyncPromiseValue);
    this.mock(oModel).expects("resolve").withExactArgs("/resolved/path", sinon.match.same(oContext)).returns("/resolved/path");
    this.mock(oMetaModel).expects("fetchUI5Type").withExactArgs("/resolved/path").returns(oSyncPromiseType);
    this.mock(oType).expects("formatValue").withExactArgs(1234, "string").returns("1,234");
    return oContext.requestProperty("bar", true).then(function (oResult) {
        assert.strictEqual(oResult, "1,234");
    });
});
QUnit.test("fetchCanonicalPath", function (assert) {
    var oMetaModel = {
        fetchCanonicalPath: function () { }
    }, oModel = {
        getMetaModel: function () {
            return oMetaModel;
        }
    }, oContext = Context.create(oModel, null, "/EMPLOYEES/42"), oPromise = {};
    this.mock(oMetaModel).expects("fetchCanonicalPath").withExactArgs(sinon.match.same(oContext)).returns(oPromise);
    assert.strictEqual(oContext.fetchCanonicalPath(), oPromise);
});
QUnit.test("requestCanonicalPath", function (assert) {
    var oContext = Context.create(null, null, "/EMPLOYEES/42"), oPromise, oSyncPromise = SyncPromise.resolve(Promise.resolve("/EMPLOYEES('1')"));
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);
    oPromise = oContext.requestCanonicalPath();
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (oResult) {
        assert.deepEqual(oResult, "/EMPLOYEES('1')");
    });
});
QUnit.test("getCanonicalPath: success", function (assert) {
    var oContext = Context.create(null, null, "/EMPLOYEES/42"), oSyncPromise = SyncPromise.resolve("/EMPLOYEES('1')");
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);
    assert.strictEqual(oContext.getCanonicalPath(), "/EMPLOYEES('1')");
});
QUnit.test("getCanonicalPath: unresolved", function (assert) {
    var oContext = Context.create(null, null, "/EMPLOYEES/42"), oSyncPromise = SyncPromise.resolve(Promise.resolve("/EMPLOYEES('1')"));
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);
    assert.throws(function () {
        oContext.getCanonicalPath();
    }, new Error("Result pending"));
});
QUnit.test("getCanonicalPath: failure", function (assert) {
    var oContext = Context.create(null, null, "/EMPLOYEES/42"), oError = new Error("Intentionally failed"), oSyncPromise = SyncPromise.resolve().then(function () { throw oError; });
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);
    assert.throws(function () {
        oContext.getCanonicalPath();
    }, oError);
});
QUnit.test("getQueryOptionsForPath: delegation to parent binding", function (assert) {
    var oBinding = {
        getQueryOptionsForPath: function () { }
    }, oContext = Context.create(null, oBinding, "/EMPLOYEES/42"), sPath = "any/path", mResult = {};
    this.mock(oBinding).expects("getQueryOptionsForPath").withExactArgs(sPath).returns(mResult);
    assert.strictEqual(oContext.getQueryOptionsForPath(sPath), mResult);
});
QUnit.test("getGroupId", function (assert) {
    var oBinding = {
        getGroupId: function () { }
    }, oContext = Context.create(null, oBinding, "/EMPLOYEES/42"), sResult = "myGroup";
    this.mock(oBinding).expects("getGroupId").withExactArgs().returns(sResult);
    assert.strictEqual(oContext.getGroupId(), sResult);
});
QUnit.test("getUpdateGroupId", function (assert) {
    var oBinding = {
        getUpdateGroupId: function () { }
    }, oContext = Context.create(null, oBinding, "/EMPLOYEES/42"), sResult = "myGroup";
    this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns(sResult);
    assert.strictEqual(oContext.getUpdateGroupId(), sResult);
});
[false, true].forEach(function (bTransient) {
    [undefined, "myGroup"].forEach(function (sGroupId) {
        var sTitle = "delete: success, transient = " + bTransient + ", group ID = " + sGroupId;
        QUnit.test(sTitle, function (assert) {
            var oBinding = {
                checkSuspended: function () { },
                lockGroup: function () { }
            }, aBindings = [
                { removeCachesAndMessages: function () { } },
                { removeCachesAndMessages: function () { } },
                { removeCachesAndMessages: function () { } }
            ], oGroupLock = {}, oModel = {
                checkGroupId: function () { },
                getAllBindings: function () { }
            }, oContext = Context.create(oModel, oBinding, "/Foo/Bar('42')", 42), oPromise = Promise.resolve(), that = this;
            this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId);
            this.mock(oBinding).expects("checkSuspended").withExactArgs();
            this.mock(oContext).expects("isTransient").withExactArgs().returns(bTransient);
            this.mock(oContext).expects("hasPendingChanges").exactly(bTransient ? 0 : 1).withExactArgs().returns(false);
            this.mock(oBinding).expects("lockGroup").withExactArgs(!sGroupId && bTransient ? "$direct" : sGroupId, true, true).returns(oGroupLock);
            this.mock(oContext).expects("_delete").withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);
            oPromise.then(function () {
                that.mock(oModel).expects("getAllBindings").withExactArgs().returns(aBindings);
                that.mock(aBindings[0]).expects("removeCachesAndMessages").withExactArgs("Foo/Bar('42')", true);
                that.mock(aBindings[1]).expects("removeCachesAndMessages").withExactArgs("Foo/Bar('42')", true);
                that.mock(aBindings[2]).expects("removeCachesAndMessages").withExactArgs("Foo/Bar('42')", true);
            });
            return oContext.delete(sGroupId).then(function () {
                assert.ok(true);
            }, function () {
                assert.notOk(true);
            });
        });
    });
});
QUnit.test("delete: failure", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        lockGroup: function () { }
    }, oError = new Error(), oGroupLock = { unlock: function () { } }, oModel = {
        checkGroupId: function () { },
        reportError: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);
    this.mock(oModel).expects("checkGroupId").withExactArgs("myGroup");
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("isTransient").withExactArgs().exactly(3).returns(true);
    this.mock(oBinding).expects("lockGroup").withExactArgs("myGroup", true, true).returns(oGroupLock);
    this.mock(oContext).expects("_delete").withExactArgs(sinon.match.same(oGroupLock)).returns(Promise.reject(oError));
    this.mock(oGroupLock).expects("unlock").withExactArgs(true);
    this.mock(oModel).expects("reportError").withExactArgs("Failed to delete " + oContext, "sap.ui.model.odata.v4.Context", oError);
    return oContext.delete("myGroup").then(function () {
        assert.notOk(true);
    }, function (oError0) {
        assert.ok(true);
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("delete: error in checkGroupId and checkSuspended", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oBindingMock = this.mock(oBinding), sGroupId = "$invalid", oModel = {
        checkGroupId: function () { }
    }, oModelMock = this.mock(oModel), oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42), oError0 = new Error("invalid group"), oError1 = new Error("suspended");
    oModelMock.expects("checkGroupId").withExactArgs(sGroupId).throws(oError0);
    oBindingMock.expects("checkSuspended").never();
    assert.throws(function () {
        oContext.delete(sGroupId);
    }, oError0);
    oModelMock.expects("checkGroupId").withExactArgs("$auto");
    oBindingMock.expects("checkSuspended").withExactArgs().throws(oError1);
    assert.throws(function () {
        oContext.delete("$auto");
    }, oError1);
});
QUnit.test("delete: pending changes", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, sGroupId = "$auto", oModel = {
        checkGroupId: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId);
    this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(true);
    assert.throws(function () {
        oContext.delete(sGroupId);
    }, new Error("Cannot delete due to pending changes"));
});
QUnit.test("_delete: success", function (assert) {
    var oBinding = {
        _delete: function () { }
    }, oETagEntity = {}, oGroupLock = {}, oModel = {}, oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(SyncPromise.resolve("/EMPLOYEES('1')"));
    this.mock(oBinding).expects("_delete").withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')", sinon.match.same(oContext), sinon.match.same(oETagEntity)).returns(Promise.resolve());
    return oContext._delete(oGroupLock, oETagEntity).then(function (oResult) {
        assert.strictEqual(oResult, undefined);
        assert.strictEqual(oContext.oBinding, oBinding);
        assert.strictEqual(oContext.oModel, oModel);
    });
});
QUnit.test("_delete: transient", function (assert) {
    var oBinding = {
        _delete: function () { }
    }, oGroupLock = {}, oModel = {}, oContext = Context.create(oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1, new SyncPromise(function () { }));
    this.mock(oBinding).expects("_delete").withExactArgs(sinon.match.same(oGroupLock), "n/a", sinon.match.same(oContext)).returns(Promise.resolve());
    return oContext._delete(oGroupLock, {}).then(function (oResult) {
        assert.strictEqual(oResult, undefined);
        assert.strictEqual(oContext.oBinding, oBinding);
        assert.strictEqual(oContext.oModel, oModel);
    });
});
QUnit.test("_delete: failure", function (assert) {
    var oBinding = {
        _delete: function () { }
    }, oError = new Error(), oGroupLock = {}, oModel = {
        reportError: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(SyncPromise.resolve("/EMPLOYEES('1')"));
    this.mock(oBinding).expects("_delete").withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')", sinon.match.same(oContext), undefined).returns(Promise.reject(oError));
    return oContext._delete(oGroupLock).then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
        assert.strictEqual(oContext.getBinding(), oBinding);
        assert.strictEqual(oContext.getModelIndex(), 42);
        assert.strictEqual(oContext.getModel(), oModel);
        assert.strictEqual(oContext.getPath(), "/EMPLOYEES/42");
    });
});
QUnit.test("_delete: failure in fetchCanonicalPath", function (assert) {
    var oBinding = {}, oError = new Error(), oModel = {
        reportError: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);
    this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(SyncPromise.reject(oError));
    return oContext._delete({}).then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
[false, true].forEach(function (bfnOnBeforeDestroy) {
    var sTitle = "destroy" + (bfnOnBeforeDestroy ? ", with onBeforeDestroy call back" : "");
    QUnit.test(sTitle, function (assert) {
        var oBinding1 = {
            setContext: function () { }
        }, oBinding2 = {
            setContext: function () { }
        }, bCallbackCalled, oGetDependentBindingsCall, oModel = {
            getDependentBindings: function () { }
        }, oParentBinding = {}, oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES/42", 42);
        if (bfnOnBeforeDestroy) {
            oContext.fnOnBeforeDestroy = function () {
                bCallbackCalled = true;
                assert.equal(oGetDependentBindingsCall.getCalls().length, 0);
                assert.ok(oContext.oModel);
                assert.ok(oContext.oBinding);
                assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);
            };
        }
        oGetDependentBindingsCall = this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext)).returns([oBinding1, oBinding2]);
        this.mock(oBinding1).expects("setContext").withExactArgs(undefined);
        this.mock(oBinding2).expects("setContext").withExactArgs(undefined);
        this.mock(BaseContext.prototype).expects("destroy").on(oContext).withExactArgs();
        oContext.destroy();
        assert.strictEqual(oContext.oBinding, undefined);
        assert.strictEqual(oContext.oModel, undefined);
        assert.strictEqual(oContext.sPath, "/EMPLOYEES/42");
        assert.strictEqual(oContext.iIndex, 42);
        if (bfnOnBeforeDestroy) {
            assert.ok(bCallbackCalled);
        }
    });
});
QUnit.test("checkUpdate", function (assert) {
    var oModel = {
        getDependentBindings: function () { }
    }, bBinding1Updated = false, oBinding1 = {
        checkUpdate: function () {
            return new SyncPromise(function (resolve) {
                setTimeout(function () {
                    bBinding1Updated = true;
                    resolve();
                });
            });
        }
    }, bBinding2Updated = false, oBinding2 = {
        checkUpdate: function () {
            return new SyncPromise(function (resolve) {
                setTimeout(function () {
                    bBinding2Updated = true;
                    resolve();
                });
            });
        }
    }, oParentBinding = {}, oPromise, oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES/42", 42);
    this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext)).returns([oBinding1, oBinding2]);
    oPromise = oContext.checkUpdate();
    assert.strictEqual(oPromise.isFulfilled(), false);
    return oPromise.then(function () {
        assert.strictEqual(bBinding1Updated, true);
        assert.strictEqual(bBinding2Updated, true);
    });
});
QUnit.test("refresh: list binding, reject", function () {
    var oModel = {
        getReporter: function () { }
    }, oContext = Context.create(oModel, {}, "/EMPLOYEES/42", 42), oError = new Error(), oPromise = Promise.reject(oError), fnReporter = sinon.spy();
    this.mock(oContext).expects("requestRefresh").withExactArgs("groupId", "bAllowRemoval").returns(oPromise);
    this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);
    oContext.refresh("groupId", "bAllowRemoval");
    return oPromise.catch(function () {
        sinon.assert.calledOnce(fnReporter);
        sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
    });
});
QUnit.test("refresh: context binding, reject", function () {
    var oModel = {
        getReporter: function () { }
    }, oContext = Context.create(oModel, {}, "/EMPLOYEES('42')"), oError = new Error(), oPromise = Promise.reject(oError), fnReporter = sinon.spy();
    this.mock(oContext).expects("requestRefresh").withExactArgs("groupId").returns(oPromise);
    this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);
    oContext.refresh("groupId");
    return oPromise.catch(function () {
        sinon.assert.calledOnce(fnReporter);
        sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
    });
});
QUnit.test("requestRefresh, list binding", function (assert) {
    var bAllowRemoval = {}, oBinding = {
        checkSuspended: function () { },
        getContext: function () { return null; },
        isRelative: function () { return false; },
        lockGroup: function () { },
        refreshSingle: function () { }
    }, oBindingMock = this.mock(oBinding), oGroupLock = {}, oModel = {
        checkGroupId: function () { },
        withUnresolvedBindings: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42), oPromise, bRefreshed = false;
    this.mock(oModel).expects("checkGroupId");
    oBindingMock.expects("lockGroup").withExactArgs("myGroup", true).returns(oGroupLock);
    oBindingMock.expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(false);
    oBindingMock.expects("refreshSingle").withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock), sinon.match.same(bAllowRemoval)).callsFake(function () {
        return new SyncPromise(function (resolve) {
            setTimeout(function () {
                bRefreshed = true;
                resolve("~");
            }, 0);
        });
    });
    this.mock(oModel).expects("withUnresolvedBindings").withExactArgs("removeCachesAndMessages", "EMPLOYEES/42");
    oPromise = oContext.requestRefresh("myGroup", bAllowRemoval);
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, undefined);
        assert.ok(bRefreshed);
    });
});
[false, true].forEach(function (bReturnValueContext) {
    QUnit.test("requestRefresh, context binding, " + bReturnValueContext, function (assert) {
        var oBinding = {
            checkSuspended: function () { },
            getContext: function () { return {}; },
            isRelative: function () { return false; },
            refreshReturnValueContext: function () { },
            requestRefresh: function () { }
        }, oBindingMock = this.mock(oBinding), oModel = {
            checkGroupId: function () { },
            withUnresolvedBindings: function () { }
        }, oModelMock = this.mock(oModel), oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"), oContextMock = this.mock(oContext), oPromise, bRefreshed = false;
        function doRefresh() {
            return new SyncPromise(function (resolve) {
                setTimeout(function () {
                    bRefreshed = true;
                    resolve("~");
                }, 0);
            });
        }
        oModelMock.expects("checkGroupId").withExactArgs("myGroup");
        oBindingMock.expects("checkSuspended").withExactArgs();
        oContextMock.expects("hasPendingChanges").withExactArgs().returns(false);
        if (bReturnValueContext) {
            oBindingMock.expects("refreshReturnValueContext").withExactArgs(sinon.match.same(oContext), "myGroup").callsFake(doRefresh);
            oBindingMock.expects("requestRefresh").never();
        }
        else {
            oBindingMock.expects("refreshReturnValueContext").withExactArgs(sinon.match.same(oContext), "myGroup").returns(null);
            oBindingMock.expects("requestRefresh").withExactArgs("myGroup").callsFake(doRefresh);
        }
        oModelMock.expects("withUnresolvedBindings").withExactArgs("removeCachesAndMessages", "EMPLOYEES('42')");
        oPromise = oContext.requestRefresh("myGroup");
        assert.ok(oPromise instanceof Promise);
        return oPromise.then(function (oResult) {
            assert.strictEqual(oResult, undefined);
            assert.ok(bRefreshed);
        });
    });
});
QUnit.test("requestRefresh: bAllowRemoval on bound context", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oModel = {
        checkGroupId: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");
    this.mock(oModel).expects("checkGroupId").withExactArgs("myGroup");
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(false);
    assert.throws(function () {
        oContext.requestRefresh("myGroup", undefined);
    }, new Error("Unsupported parameter bAllowRemoval: undefined"));
});
QUnit.test("requestRefresh: invalid group", function (assert) {
    var oBinding = {}, oError = new Error(), sGroupId = "$foo", oModel = {
        checkGroupId: function () { }
    };
    this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);
    assert.throws(function () {
        Context.create(oModel, oBinding, "/EMPLOYEES", 42).requestRefresh(sGroupId);
    }, oError);
});
QUnit.test("requestRefresh: has pending changes", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, sGroupId = "myGroup", oModel = {
        checkGroupId: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");
    this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(true);
    assert.throws(function () {
        oContext.requestRefresh(sGroupId);
    }, new Error("Cannot refresh entity due to pending changes: /EMPLOYEES('42')"));
});
QUnit.test("withCache: absolute path", function (assert) {
    var oBinding = {
        withCache: function () { }
    }, fnCallback = {}, oContext = Context.create({}, oBinding, "/EMPLOYEES('42')", 42), oResult = {}, bSync = {}, bWithOrWithoutCache = {};
    this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.same(fnCallback), "/foo", sinon.match.same(bSync), sinon.match.same(bWithOrWithoutCache)).returns(oResult);
    assert.strictEqual(oContext.withCache(fnCallback, "/foo", bSync, bWithOrWithoutCache), oResult);
});
QUnit.test("withCache: relative path", function (assert) {
    var oBinding = {
        withCache: function () { }
    }, fnCallback = {}, oContext = Context.create({}, oBinding, "/EMPLOYEES('42')", 42), oResult = {}, bSync = {}, bWithOrWithoutCache = {};
    this.mock(_Helper).expects("buildPath").withExactArgs("/EMPLOYEES('42')", "foo").returns("~");
    this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.same(fnCallback), "~", sinon.match.same(bSync), sinon.match.same(bWithOrWithoutCache)).returns(oResult);
    assert.strictEqual(oContext.withCache(fnCallback, "foo", bSync, bWithOrWithoutCache), oResult);
});
QUnit.test("withCache: virtual context", function (assert) {
    var oBinding = {}, oContext = Context.create({}, oBinding, "/EMPLOYEES/" + Context.VIRTUAL, Context.VIRTUAL), oResult;
    this.mock(_Helper).expects("buildPath").never();
    oResult = oContext.withCache();
    assert.strictEqual(oResult.isFulfilled(), true);
    assert.strictEqual(oResult.getResult(), undefined);
});
QUnit.test("patch", function () {
    var oCache = {
        patch: function () { }
    }, oContext = Context.create({}, {}, "/EMPLOYEES('42')"), oData = {}, sPath = "path/to/context";
    this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "").callsArgWith(0, oCache, sPath).returns(Promise.resolve());
    this.mock(oCache).expects("patch").withExactArgs(sPath, sinon.match.same(oData));
    return oContext.patch(oData);
});
QUnit.test("requestSideEffects: error cases 1/2", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        isResolved: function () { return true; }
    }, oMetaModel = {
        getObject: function () { assert.ok(false, "use only when mocked"); }
    }, oModel = {
        checkGroupId: function () { },
        getMetaModel: function () { return oMetaModel; }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");
    assert.throws(function () {
        oContext.requestSideEffects();
    }, new Error("Missing edm:(Navigation)PropertyPath expressions"));
    assert.throws(function () {
        oContext.requestSideEffects([]);
    }, new Error("Missing edm:(Navigation)PropertyPath expressions"));
    this.mock(oMetaModel).expects("getObject").withExactArgs("/$EntityContainer").returns(undefined);
    assert.throws(function () {
        oContext.requestSideEffects([""]);
    }, new Error("Missing metadata"));
});
QUnit.test("requestSideEffects: error cases 2/2", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        isResolved: function () { return true; }
    }, oMetaModel = {
        getObject: function (sPath) {
            assert.strictEqual(sPath, "/$EntityContainer");
            return "~container~";
        }
    }, oModel = {
        checkGroupId: function () { },
        getMetaModel: function () { return oMetaModel; }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");
    [
        undefined,
        "fo*o",
        "fo*o/*",
        {},
        { $AnnotationPath: "foo" },
        { $If: [true, { $PropertyPath: "TEAM_ID" }] },
        { $PropertyPath: "" },
        { $PropertyPath: "foo*" },
        { $PropertyPath: "foo*/*" },
        { $NavigationPropertyPath: undefined },
        { $NavigationPropertyPath: "*" },
        { $NavigationPropertyPath: "*foo" },
        { $NavigationPropertyPath: "foo/*" }
    ].forEach(function (oPath) {
        var sJSON = JSON.stringify(oPath);
        assert.throws(function () {
            oContext.requestSideEffects([oPath]);
        }, new Error("Not an edm:(Navigation)PropertyPath expression: " + sJSON), sJSON);
    });
    assert.throws(function () {
        oContext.requestSideEffects(["/~container~wrong~path"]);
    }, new Error("Path must start with '/~container~/': /~container~wrong~path"));
});
[{
        async: true,
        auto: true,
        parked: "$parked.any",
        text: "wait and unpark for auto group (no group ID)"
    }, {
        async: false,
        auto: true,
        parked: "$parked.any",
        text: "unpark for auto group (no group ID)"
    }, {
        auto: false,
        text: "no auto group"
    }, {
        absolute: true,
        auto: false,
        text: "no auto group, absolute paths"
    }, {
        async: true,
        auto: true,
        group: "group",
        parked: "$parked.group",
        text: "wait and unpark for auto group"
    }, {
        absolute: true,
        async: true,
        auto: true,
        group: "group",
        parked: "$parked.group",
        text: "wait and unpark for auto group, absolute paths"
    }, {
        async: false,
        auto: true,
        group: "group",
        parked: "$parked.group",
        text: "unpark for auto group"
    }, {
        auto: false,
        group: "different",
        text: "different group ID"
    }].forEach(function (oFixture) {
    QUnit.test("requestSideEffects: " + oFixture.text, function (assert) {
        var aAbsolutePaths = oFixture.absolute ? ["/foo", "/bar", "/baz"] : [], oRootBinding = {
            getResolvedPath: function () { }
        }, oBinding = {
            oCache: {
                hasChangeListeners: function () { return false; }
            },
            checkSuspended: function () { },
            getRootBinding: function () { return oRootBinding; },
            getPath: function () { return "/EMPLOYEES('42')"; },
            isResolved: function () { return true; }
        }, aFilteredPaths = [], oMetaModel = {
            getAllPathReductions: function () { },
            getObject: function () { }
        }, oMetaModelMock = this.mock(oMetaModel), oModel = {
            checkGroupId: function () { },
            isAutoGroup: function () { },
            getMetaModel: function () { return oMetaModel; },
            oRequestor: {
                relocateAll: function () { },
                waitForRunningChangeRequests: function () { }
            },
            requestSideEffects: function () { }
        }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"), oExpectation, sGroupId = oFixture.group || "any", aPathExpressions = [
            { $PropertyPath: "TEAM_ID" },
            { $NavigationPropertyPath: "EMPLOYEE_2_MANAGER" },
            { $PropertyPath: "Address/*" },
            { $NavigationPropertyPath: "" },
            { $PropertyPath: "*" },
            "",
            "*",
            "EMPLOYEE_2_TEAM/*",
            "MANAGER_ID"
        ], oPromise, oWaitPromise = oFixture.async ? Promise.resolve() : SyncPromise.resolve(), that = this;
        function setExpectation() {
            oExpectation = that.mock(oContext).expects("requestSideEffectsInternal").withExactArgs(sinon.match.same(aFilteredPaths), sGroupId).returns(SyncPromise.resolve({}));
            that.mock(oModel).expects("requestSideEffects").withExactArgs(sGroupId, aAbsolutePaths).returns(SyncPromise.resolve({}));
        }
        if (oFixture.absolute) {
            aPathExpressions = aPathExpressions.concat([
                { $PropertyPath: "/~container~/foo" },
                { $NavigationPropertyPath: "/~container~/bar" },
                "/~container~/baz"
            ]);
        }
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(oModel).expects("checkGroupId").withExactArgs(oFixture.group);
        this.mock(oRootBinding).expects("getResolvedPath").withExactArgs().returns("/base");
        this.mock(oMetaModel).expects("getObject").withExactArgs("/$EntityContainer").returns("~container~");
        oMetaModelMock.expects("getAllPathReductions").withExactArgs("/EMPLOYEES('42')/TEAM_ID", "/base").returns(["/base/TEAM_ID", "/reduced/TEAM_ID"]);
        oMetaModelMock.expects("getAllPathReductions").withExactArgs("/EMPLOYEES('42')/EMPLOYEE_2_MANAGER", "/base").returns(["/base/EMPLOYEE_2_MANAGER"]);
        oMetaModelMock.expects("getAllPathReductions").withExactArgs("/EMPLOYEES('42')/Address/*", "/base").returns(["/base/Address/*"]);
        oMetaModelMock.expects("getAllPathReductions").twice().withExactArgs("/EMPLOYEES('42')", "/base").returns(["/base/"]);
        oMetaModelMock.expects("getAllPathReductions").twice().withExactArgs("/EMPLOYEES('42')/*", "/base").returns(["/base/*"]);
        oMetaModelMock.expects("getAllPathReductions").withExactArgs("/EMPLOYEES('42')/MANAGER_ID", "/base").returns(["/base/MANAGER_ID"]);
        oMetaModelMock.expects("getAllPathReductions").withExactArgs("/EMPLOYEES('42')/EMPLOYEE_2_TEAM/*", "/base").returns(["/base/EMPLOYEE_2_TEAM/*"]);
        this.mock(_Helper).expects("filterPaths").withExactArgs(aAbsolutePaths, [
            "/base/TEAM_ID",
            "/reduced/TEAM_ID",
            "/base/EMPLOYEE_2_MANAGER",
            "/base/Address/*",
            "/base/",
            "/base/*",
            "/base/",
            "/base/*",
            "/base/EMPLOYEE_2_TEAM/*",
            "/base/MANAGER_ID"
        ]).returns(aFilteredPaths);
        this.mock(oContext).expects("getUpdateGroupId").exactly(oFixture.group ? 0 : 1).withExactArgs().returns("any");
        this.mock(oModel).expects("isAutoGroup").withExactArgs(sGroupId).returns(oFixture.auto);
        this.mock(oModel.oRequestor).expects("waitForRunningChangeRequests").exactly(oFixture.auto ? 1 : 0).withExactArgs(sGroupId).returns(SyncPromise.resolve(oWaitPromise));
        if (oFixture.auto) {
            oWaitPromise.then(function () {
                that.mock(oModel.oRequestor).expects("relocateAll").exactly(oFixture.auto ? 1 : 0).withExactArgs(oFixture.parked, sGroupId);
                setExpectation();
            });
        }
        else {
            setExpectation();
        }
        oPromise = oContext.requestSideEffects(aPathExpressions, oFixture.group).then(function (oResult) {
            assert.strictEqual(oResult, undefined);
        });
        assert.ok(oPromise instanceof Promise);
        if (oExpectation) {
            assert.ok(oExpectation.called, "requestSideEffectsInternal called synchronously");
        }
        return oPromise;
    });
});
QUnit.test("requestSideEffects: invalid different group ID", function (assert) {
    var oBinding = {
        oCachePromise: SyncPromise.resolve({}),
        checkSuspended: function () { }
    }, sGroupId = "$invalid", oError = new Error("Invalid group ID: " + sGroupId), oModel = {
        checkGroupId: function () { },
        getMetaModel: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);
    this.mock(oContext).expects("requestSideEffectsInternal").never();
    assert.throws(function () {
        oContext.requestSideEffects([{ $PropertyPath: "TEAM_ID" }], sGroupId);
    }, oError);
});
QUnit.test("requestSideEffects: suspended binding", function (assert) {
    var oBinding = {
        oCachePromise: SyncPromise.resolve({}),
        checkSuspended: function () { }
    }, oModel = {
        getMetaModel: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"), oError = new Error("Must not call...");
    this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);
    this.mock(oContext).expects("requestSideEffectsInternal").never();
    assert.throws(function () {
        oContext.requestSideEffects();
    }, oError);
});
[false, true].forEach(function (bAuto) {
    [false, true].forEach(function (bAbsolute) {
        var sTitle = "requestSideEffects: promise rejected, bAuto = " + bAuto + ", bAbsolute = " + bAbsolute;
        QUnit.test(sTitle, function (assert) {
            var oRootBinding = {
                getResolvedPath: function () { }
            }, oBinding = {
                checkSuspended: function () { },
                getPath: function () { return "/EMPLOYEES('42')"; },
                getRootBinding: function () { return oRootBinding; },
                isResolved: function () { return true; }
            }, oMetaModel = {
                getAllPathReductions: function () { },
                getObject: function () { }
            }, oModel = {
                checkGroupId: function () { },
                getMetaModel: function () { return oMetaModel; },
                isAutoGroup: function () { },
                oRequestor: {
                    relocateAll: function () { },
                    waitForRunningChangeRequests: function () { }
                },
                requestSideEffects: function () { }
            }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"), oError = new Error("Failed intentionally"), oResult;
            this.mock(oBinding).expects("checkSuspended").withExactArgs();
            this.mock(oModel).expects("checkGroupId").withExactArgs(undefined);
            this.mock(oRootBinding).expects("getResolvedPath").withExactArgs().returns("/base");
            this.mock(oMetaModel).expects("getObject").withExactArgs("/$EntityContainer").returns("~container~");
            this.mock(oMetaModel).expects("getAllPathReductions").withExactArgs("/EMPLOYEES('42')/TEAM_ID", "/base").returns(["/base/TEAM_ID"]);
            this.mock(oContext).expects("getUpdateGroupId").withExactArgs().returns("update");
            this.mock(oModel.oRequestor).expects("waitForRunningChangeRequests").exactly(bAuto ? 1 : 0).withExactArgs("update").returns(SyncPromise.resolve());
            this.mock(oModel.oRequestor).expects("relocateAll").exactly(bAuto ? 1 : 0).withExactArgs("$parked.update", "update");
            this.mock(oModel).expects("isAutoGroup").withExactArgs("update").returns(bAuto);
            this.mock(oContext).expects("requestSideEffectsInternal").withExactArgs(["/base/TEAM_ID"], "update").returns(bAbsolute ? SyncPromise.resolve() : SyncPromise.reject(oError));
            this.mock(oModel).expects("requestSideEffects").withExactArgs("update", ["/EMPLOYEES"]).returns(bAbsolute ? SyncPromise.reject(oError) : SyncPromise.resolve());
            oResult = oContext.requestSideEffects([
                { $PropertyPath: "TEAM_ID" },
                { $NavigationPropertyPath: "/~container~/EMPLOYEES" }
            ]);
            assert.ok(oResult instanceof Promise);
            return oResult.then(function () {
                assert.ok(false, "unexpected success");
            }, function (oError0) {
                assert.strictEqual(oError0, oError);
            });
        });
    });
});
QUnit.test("requestSideEffectsInternal: binding with cache", function (assert) {
    var oBinding = {
        oCache: {},
        getContext: function () { },
        getPath: function () { return "/TEAMS"; },
        requestSideEffects: function () { }
    }, oContext = Context.create({}, oBinding, "/TEAMS('42')"), bSideEffectsRequested = false, oPromise = new Promise(function (resolve) {
        window.setTimeout(function () {
            bSideEffectsRequested = true;
            resolve();
        });
    }), oResultPromise;
    assert.strictEqual(oContext.requestSideEffectsInternal([], "groupId"), undefined);
    this.mock(oBinding).expects("requestSideEffects").withExactArgs("groupId", ["Name", "TeamBudget"], sinon.match.same(oContext)).returns(oPromise);
    oResultPromise = oContext.requestSideEffectsInternal([
        "/TEAMS('42')/Name",
        "/TEAMS('42')/TeamBudget"
    ], "groupId");
    assert.strictEqual(oResultPromise.isPending(), true, "a SyncPromise");
    return oResultPromise.then(function () {
        assert.strictEqual(bSideEffectsRequested, true);
    });
});
[function (oBinding, oTargetBinding, oTargetContext) {
        var oParentBinding = {
            oCache: null,
            getBoundContext: function () { },
            getContext: function () { return oTargetContext; },
            getPath: function () { return "TEAM_2_MANAGER"; }
        }, oParentContext = Context.create({}, oParentBinding, "/.../TEAM_2_MANAGER");
        this.mock(oBinding).expects("getContext").returns(oParentContext);
        this.mock(oBinding).expects("getPath").returns("Manager_to_Team");
        this.mock(oTargetBinding).expects("getPath").returns("/...");
        this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
    }, function (oBinding, oTargetBinding, oTargetContext) {
        var oIntermediateBinding = {
            getBoundContext: function () { },
            getContext: function () { },
            getPath: function () { return ""; }
        }, oIntermediateContext = Context.create({}, oIntermediateBinding, "/.../TEAM_2_MANAGER"), oParentBinding = {
            oCache: {
                hasChangeListeners: function () { return true; }
            },
            getBoundContext: function () { },
            getContext: function () { return oTargetContext; },
            getPath: function () { return ""; }
        }, oParentContext = Context.create({}, oParentBinding, "/.../TEAM_2_MANAGER");
        this.mock(oBinding).expects("getContext").returns(oIntermediateContext);
        this.mock(oBinding).expects("getPath").returns("TEAM_2_MANAGER/Manager_to_Team");
        this.mock(oIntermediateBinding).expects("getContext").returns(oParentContext);
        this.mock(oTargetBinding).expects("getPath").returns("/...");
        this.mock(oTargetBinding.oCache).expects("hasChangeListeners").returns(true);
    }, function (oBinding, oTargetBinding, oTargetContext) {
        var oOperationBinding = {
            oCache: {
                hasChangeListeners: function () { return false; }
            },
            getContext: function () { return null; },
            getPath: function () { return "/..."; }
        }, oReturnValueContext = Context.createNewContext({}, oOperationBinding, "/...");
        this.mock(oBinding).expects("getContext").returns(oTargetContext);
        this.mock(oBinding).expects("getPath").returns("TEAM_2_MANAGER/Manager_to_Team");
        this.mock(oTargetBinding).expects("getPath").returns("");
        this.mock(oTargetBinding).expects("getContext").returns(oReturnValueContext);
        this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
    }, function (oBinding, oTargetBinding, oTargetContext) {
        var oDepartmentContext = {}, oListBinding = {
            oCache: null,
            getContext: function () { return oDepartmentContext; },
            getPath: function () { return "..."; }
        }, oListContext = Context.create({}, oListBinding, "/...");
        this.mock(oBinding).expects("getContext").returns(oTargetContext);
        this.mock(oBinding).expects("getPath").returns("TEAM_2_MANAGER/Manager_to_Team");
        this.mock(oTargetBinding).expects("getPath").returns("");
        this.mock(oTargetBinding).expects("getContext").returns(oListContext);
        this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
    }, function (oBinding, oTargetBinding, oTargetContext) {
        var oDepartmentContext = {}, oWrongBinding = {
            oCache: null,
            getContext: function () { return oDepartmentContext; },
            getPath: function () { return "..."; }
        }, oWrongContext = Context.create({}, oWrongBinding, "/...");
        this.mock(oBinding).expects("getContext").returns(oTargetContext);
        this.mock(oBinding).expects("getPath").returns("TEAM_2_MANAGER/Manager_to_Team");
        this.mock(oTargetBinding).expects("getPath").returns("");
        this.mock(oTargetBinding).expects("getContext").returns(oWrongContext);
        this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
    }].forEach(function (fnArrange, i) {
    QUnit.test("requestSideEffectsInternal: no own cache #" + i, function (assert) {
        var oBinding = {
            oCache: null,
            getBoundContext: function () { },
            getContext: function () { },
            getPath: function () { }
        }, oContext = Context.create({}, oBinding, "/.../TEAM_2_MANAGER/Manager_to_Team"), bSideEffectsRequested = false, oPromise = new Promise(function (resolve) {
            window.setTimeout(function () {
                bSideEffectsRequested = true;
                resolve();
            });
        }), oTargetBinding = {
            oCache: {
                hasChangeListeners: function () { }
            },
            getBoundContext: function () { },
            getContext: function () { },
            getPath: function () { },
            requestSideEffects: function () { }
        }, oTargetContext = Context.create({}, oTargetBinding, "/...");
        fnArrange.call(this, oBinding, oTargetBinding, oTargetContext);
        this.mock(oTargetBinding).expects("requestSideEffects").withExactArgs("group", [
            "TEAM_2_MANAGER/Manager_to_Team/TEAM_ID",
            "TEAM_2_MANAGER/Manager_to_Team/NAME",
            "TEAM_2_MANAGER/Manager_to_Team"
        ], oTargetContext).returns(oPromise);
        return oContext.requestSideEffectsInternal([
            "/.../TEAM_2_MANAGER/Manager_to_Team/TEAM_ID",
            "/.../TEAM_2_MANAGER/Manager_to_Team/NAME",
            "/.../TEAM_2_MANAGER/Manager_to_Team"
        ], "group").then(function () {
            assert.strictEqual(bSideEffectsRequested, true);
        });
    });
});
[false, true].forEach(function (bBinding) {
    var sTitle = "requestSideEffectsInternal: delegate up" + (bBinding ? " and request on binding" : "");
    QUnit.test(sTitle, function (assert) {
        var oParentContext = {
            getPath: function () { return "/SalesOrder('42')"; },
            requestSideEffectsInternal: function () { }
        }, oBinding = {
            oCache: {},
            getContext: function () { return oParentContext; },
            getPath: function () { return "SO_2_SOITEM"; },
            requestSideEffects: function () { }
        }, oContext = Context.create({}, oBinding, "/SalesOrder('42')/SO_2_SOITEM('0010')"), oHelperMock = this.mock(_Helper), bSideEffectsRequested = false, oPromise1 = new Promise(function (resolve) {
            window.setTimeout(function () {
                bSideEffectsRequested = true;
                resolve();
            });
        }), oPromise2 = Promise.resolve();
        oHelperMock.expects("getRelativePath").withExactArgs("/SalesOrder('42')/Note", "/SalesOrder('42')/SO_2_SOITEM('0010')").returns(undefined);
        this.mock(oParentContext).expects("requestSideEffectsInternal").withExactArgs(["/SalesOrder('42')/Note"], "groupId").returns(oPromise1);
        oHelperMock.expects("getRelativePath").exactly(bBinding ? 1 : 0).withExactArgs("/SalesOrder('42')/SO_2_SOITEM('0010')/Currency", "/SalesOrder('42')/SO_2_SOITEM('0010')").returns("Currency");
        this.mock(oBinding).expects("requestSideEffects").exactly(bBinding ? 1 : 0).withExactArgs("groupId", ["Currency"], oContext).returns(oPromise2);
        return oContext.requestSideEffectsInternal(bBinding ? ["/SalesOrder('42')/Note", "/SalesOrder('42')/SO_2_SOITEM('0010')/Currency"] : ["/SalesOrder('42')/Note"], "groupId").then(function () {
            assert.strictEqual(bSideEffectsRequested, true);
        });
    });
});
QUnit.test("requestSideEffectsInternal: delegate up refreshes binding", function (assert) {
    var oParentContext = {
        getPath: function () { return "/SalesOrder('42')"; },
        requestSideEffectsInternal: function () { }
    }, oBinding = {
        oCache: {},
        getContext: function () { return oParentContext; },
        getPath: function () { return "SO_2_SOITEM"; },
        requestSideEffects: function () { }
    }, sPath = "/SalesOrder('42')/SO_2_SOITEM('0010')", oContext = Context.create({}, oBinding, sPath), oHelperMock = this.mock(_Helper);
    oHelperMock.expects("getRelativePath").withExactArgs("/SalesOrderList('42')/SO_2_SOITEM('0010')/*", sPath).returns("*");
    oHelperMock.expects("getRelativePath").withExactArgs("/SalesOrderList('42')/SO_2_SOITEM('0010')/SOITEM_2_SO/SO_2_SOITEM", sPath).returns("SOITEM_2_SO/SO_2_SOITEM");
    oHelperMock.expects("getRelativePath").withExactArgs("/SalesOrderList('42')/SO_2_SOITEM", sPath).returns(undefined);
    this.mock(oParentContext).expects("requestSideEffectsInternal").withExactArgs(["/SalesOrderList('42')/SO_2_SOITEM"], "groupId").callsFake(function () {
        oBinding.oCache = undefined;
        return SyncPromise.resolve("~");
    });
    this.mock(oBinding).expects("requestSideEffects").never();
    return oContext.requestSideEffectsInternal([
        "/SalesOrderList('42')/SO_2_SOITEM('0010')/*",
        "/SalesOrderList('42')/SO_2_SOITEM('0010')/SOITEM_2_SO/SO_2_SOITEM",
        "/SalesOrderList('42')/SO_2_SOITEM"
    ], "groupId").then(function (aResult) {
        assert.deepEqual(aResult, ["~"]);
    });
});
QUnit.test("requestSideEffectsInternal without own cache: error case unsupported list binding", function (assert) {
    var oListBinding = {
        oCache: null,
        getContext: function () { return {}; },
        getPath: function () { return "TEAM_2_EMPLOYEES"; },
        toString: function () { return "Foo Bar"; }
    }, oMetaModel = {}, oModel = {
        getMetaModel: function () { return oMetaModel; }
    }, oContext = Context.create(oModel, oListBinding, "/TEAMS('1')/TEAM_2_EMPLOYEES('2')");
    assert.throws(function () {
        oContext.requestSideEffectsInternal(["ID"], "groupId");
    }, new Error("Not a context binding: " + oListBinding));
});
QUnit.test("requestSideEffects: error on transient context", function (assert) {
    var oBinding = {
        checkSuspended: function () { }
    }, oModel = {
        checkGroupId: function () { },
        getMetaModel: function () { }
    }, oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");
    this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
    this.mock(oContext).expects("requestSideEffectsInternal").never();
    assert.throws(function () {
        oContext.requestSideEffects();
    }, new Error("Unsupported context: " + oContext));
});
QUnit.test("requestSideEffects: error on unresolved binding", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        isResolved: function () { return false; }
    }, oModel = {
        checkGroupId: function () { },
        getMetaModel: function () { }
    }, oHeaderContext = Context.create(oModel, oBinding, "/EMPLOYEES");
    this.mock(oHeaderContext).expects("requestSideEffectsInternal").never();
    assert.throws(function () {
        oHeaderContext.requestSideEffects([{ $PropertyPath: "TEAM_ID" }]);
    }, new Error("Cannot request side effects of unresolved binding's context: /EMPLOYEES"));
});
QUnit.test("doSetProperty: fetchUpdataData fails", function (assert) {
    var oBinding = {
        doSetProperty: function () { }
    }, oMetaModel = {
        fetchUpdateData: function () { }
    }, oModel = {
        getMetaModel: function () {
            return oMetaModel;
        }
    }, oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"), oError = new Error("This call intentionally failed"), that = this;
    this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "some/relative/path", false, true).callsFake(function (fnProcessor) {
        that.mock(oBinding).expects("doSetProperty").withExactArgs("some/relative/path", undefined, undefined);
        that.mock(oMetaModel).expects("fetchUpdateData").withExactArgs("some/relative/path", sinon.match.same(oContext), true).returns(SyncPromise.resolve(Promise.reject(oError)));
        return fnProcessor({}, "some/relative/path", oBinding);
    });
    return oContext.doSetProperty("some/relative/path").then(function () {
        assert.ok(false, "Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("doSetProperty: withCache fails", function (assert) {
    var oBinding = {}, oMetaModel = {}, oModel = {
        getMetaModel: function () {
            return oMetaModel;
        }
    }, oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"), oError = new Error("This call intentionally failed");
    this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "some/relative/path", false, true).returns(SyncPromise.reject(oError));
    return oContext.doSetProperty("some/relative/path").then(function () {
        assert.ok(false, "Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
[function (_oModelMock, _oBinding, _oBindingMock, _fnErrorCallback, _fnPatchSent, oError) {
        return Promise.reject(oError);
    }, function (_oModelMock, oBinding, oBindingMock, _fnErrorCallback, fnPatchSent, oError) {
        oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();
        fnPatchSent();
        oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(false);
        return Promise.reject(oError);
    }, function () {
        return Promise.resolve("n/a");
    }, function (oModelMock, oBinding, oBindingMock, fnErrorCallback, fnPatchSent) {
        var oError = new Error("500 Internal Server Error");
        oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();
        fnPatchSent();
        oModelMock.expects("reportError").twice().withExactArgs("Failed to update path /resolved/data/path", "sap.ui.model.odata.v4.Context", sinon.match.same(oError));
        oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(false);
        fnErrorCallback(oError);
        fnErrorCallback(oError);
        oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();
        fnPatchSent();
        oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(true);
        return Promise.resolve("n/a");
    }].forEach(function (fnScenario, i) {
    var sTitle = "doSetProperty: scenario " + i;
    QUnit.test(sTitle, function (assert) {
        var oBinding = {
            oContext: {},
            doSetProperty: function () { },
            firePatchCompleted: function () { },
            firePatchSent: function () { },
            getResolvedPath: function () { },
            getUpdateGroupId: function () { },
            isPatchWithoutSideEffects: function () { },
            sPath: "binding/path"
        }, oBindingMock = this.mock(oBinding), oGroupLock = {}, oMetaModel = {
            fetchUpdateData: function () { },
            getUnitOrCurrencyPath: function () { }
        }, oModel = {
            getMetaModel: function () {
                return oMetaModel;
            },
            reportError: function () { },
            resolve: function () { }
        }, oModelMock = this.mock(oModel), oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"), oError = new Error("This call intentionally failed"), bSkipRetry = i === 1, vWithCacheResult = {}, that = this;
        this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "some/relative/path", false, true).callsFake(function (fnProcessor) {
            var oCache = {
                update: function () { }
            }, bPatchWithoutSideEffects = {}, oUpdatePromise;
            oBindingMock.expects("doSetProperty").withExactArgs("cache/path", "new value", sinon.match.same(oGroupLock));
            that.mock(oMetaModel).expects("fetchUpdateData").withExactArgs("some/relative/path", sinon.match.same(oContext), false).returns(SyncPromise.resolve({
                editUrl: "/edit/url",
                entityPath: "/entity/path",
                propertyPath: "property/path"
            }));
            oBindingMock.expects("firePatchCompleted").never();
            oBindingMock.expects("firePatchSent").never();
            oBindingMock.expects("isPatchWithoutSideEffects").withExactArgs().returns(bPatchWithoutSideEffects);
            oBindingMock.expects("getResolvedPath").atLeast(1).withExactArgs().returns("/resolved/binding/path");
            oModelMock.expects("resolve").atLeast(1).withExactArgs("some/relative/path", sinon.match.same(oContext)).returns("/resolved/data/path");
            that.mock(_Helper).expects("getRelativePath").withExactArgs("/entity/path", "/resolved/binding/path").returns("helper/path");
            that.mock(oMetaModel).expects("getUnitOrCurrencyPath").withExactArgs("/resolved/data/path").returns("unit/or/currency/path");
            that.mock(oCache).expects("update").withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value", bSkipRetry ? undefined : sinon.match.func, "/edit/url", "helper/path", "unit/or/currency/path", sinon.match.same(bPatchWithoutSideEffects), sinon.match.func).callsFake(function () {
                return SyncPromise.resolve(fnScenario(that.mock(oModel), oBinding, oBindingMock, arguments[3], arguments[8], oError));
            });
            oUpdatePromise = fnProcessor(oCache, "cache/path", oBinding);
            assert.strictEqual(oUpdatePromise.isPending(), true);
            return oUpdatePromise.then(function (vResult) {
                if (i > 1) {
                    assert.strictEqual(vResult, undefined);
                }
                else {
                    assert.ok(false, "Unexpected success");
                }
                return vWithCacheResult;
            }, function (oError0) {
                assert.ok(i < 2);
                assert.strictEqual(oError0, oError);
                throw oError;
            });
        });
        return oContext.doSetProperty("some/relative/path", "new value", oGroupLock, bSkipRetry).then(function (vResult) {
            if (i > 1) {
                assert.strictEqual(vResult, vWithCacheResult);
            }
            else {
                assert.ok(false, "Unexpected success");
            }
        }, function (oError0) {
            assert.ok(i < 2);
            assert.strictEqual(oError0, oError);
        });
    });
});
QUnit.test("doSetProperty: return value context", function () {
    var oGroupLock = {}, oMetaModel = {
        fetchUpdateData: function () { },
        getReducedPath: function () { },
        getUnitOrCurrencyPath: function () { }
    }, oModel = {
        getMetaModel: function () {
            return oMetaModel;
        },
        resolve: function () { }
    }, oContext = Context.create(oModel, {}, "/context/path"), oFetchUpdateDataResult = {
        editUrl: "/edit/url",
        entityPath: "/entity/path",
        propertyPath: "property/path"
    }, that = this;
    this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "some/relative/path", false, true).callsFake(function (fnProcessor) {
        var oBinding = {
            oContext: {},
            doSetProperty: function () { },
            isPatchWithoutSideEffects: function () { },
            sPath: "binding/path",
            oReturnValueContext: {
                getPath: function () { }
            }
        }, oCache = {
            update: function () { }
        }, oHelperMock = that.mock(_Helper), oModelMock = that.mock(oModel), bPatchWithoutSideEffects = {};
        that.mock(oBinding).expects("doSetProperty").withExactArgs("some/relative/path", "new value", sinon.match.same(oGroupLock));
        that.mock(oMetaModel).expects("fetchUpdateData").withExactArgs("some/relative/path", sinon.match.same(oContext), false).returns(SyncPromise.resolve(oFetchUpdateDataResult));
        that.mock(oBinding.oReturnValueContext).expects("getPath").withExactArgs().returns("/return/value/context/path");
        oHelperMock.expects("getRelativePath").withExactArgs("/entity/path", "/return/value/context/path").returns("helper/path");
        oModelMock.expects("resolve").withExactArgs("some/relative/path", sinon.match.same(oContext)).returns("/resolved/data/path");
        that.mock(oBinding).expects("isPatchWithoutSideEffects").withExactArgs().returns(bPatchWithoutSideEffects);
        that.mock(oMetaModel).expects("getUnitOrCurrencyPath").withExactArgs("/resolved/data/path").returns("unit/or/currency/path");
        that.mock(oCache).expects("update").withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value", sinon.match.func, "/edit/url", "helper/path", "unit/or/currency/path", sinon.match.same(bPatchWithoutSideEffects), sinon.match.func).resolves();
        return fnProcessor(oCache, "some/relative/path", oBinding);
    });
    return oContext.doSetProperty("some/relative/path", "new value", oGroupLock);
});
QUnit.test("doSetProperty: reduce path", function () {
    var oBinding = {
        oContext: {},
        doSetProperty: function () { },
        getBaseForPathReduction: function () { },
        getResolvedPath: function () { },
        isPatchWithoutSideEffects: function () { },
        sPath: "binding/path"
    }, oGroupLock = {}, oMetaModel = {
        fetchUpdateData: function () { },
        getReducedPath: function () { },
        getUnitOrCurrencyPath: function () { }
    }, oModel = {
        bAutoExpandSelect: true,
        getMetaModel: function () {
            return oMetaModel;
        },
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"), oFetchUpdateDataResult = {
        editUrl: "/edit/url",
        entityPath: "/entity/path",
        propertyPath: "property/path"
    }, that = this;
    this.mock(_Helper).expects("buildPath").withExactArgs("/BusinessPartnerList('0100000000')", "some/relative/path").returns("/~");
    this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("/base/path");
    this.mock(oMetaModel).expects("getReducedPath").withExactArgs("/~", "/base/path").returns("/reduced/path");
    this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "/reduced/path", false, true).callsFake(function (fnProcessor) {
        var oCache = {
            update: function () { }
        }, oModelMock = that.mock(oModel), bPatchWithoutSideEffects = {};
        that.mock(oBinding).expects("doSetProperty").withExactArgs("/reduced/path", "new value", sinon.match.same(oGroupLock));
        that.mock(oMetaModel).expects("fetchUpdateData").withExactArgs("/reduced/path", sinon.match.same(oContext), false).returns(SyncPromise.resolve(oFetchUpdateDataResult));
        that.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/binding/path");
        oModelMock.expects("resolve").withExactArgs("/reduced/path", sinon.match.same(oContext)).returns("/resolved/data/path");
        that.mock(_Helper).expects("getRelativePath").withExactArgs("/entity/path", "/resolved/binding/path").returns("helper/path");
        that.mock(oBinding).expects("isPatchWithoutSideEffects").withExactArgs().returns(bPatchWithoutSideEffects);
        that.mock(oMetaModel).expects("getUnitOrCurrencyPath").withExactArgs("/resolved/data/path").returns("unit/or/currency/path");
        that.mock(oCache).expects("update").withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value", sinon.match.func, "/edit/url", "helper/path", "unit/or/currency/path", sinon.match.same(bPatchWithoutSideEffects), sinon.match.func).resolves();
        return fnProcessor(oCache, "/reduced/path", oBinding);
    });
    return oContext.doSetProperty("some/relative/path", "new value", oGroupLock);
});
QUnit.test("doSetProperty: oGroupLock = null", function () {
    var oBinding = {
        oContext: {},
        doSetProperty: function () { },
        getResolvedPath: function () { },
        sPath: "binding/path"
    }, oFetchUpdateDataResult = {
        editUrl: "/edit/url",
        entityPath: "/entity/path",
        propertyPath: "property/path"
    }, oFetchUpdateDataResultPromise = Promise.resolve(oFetchUpdateDataResult), oMetaModel = {
        fetchUpdateData: function () { }
    }, oModel = {
        bAutoExpandSelect: false,
        getMetaModel: function () {
            return oMetaModel;
        }
    }, oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"), that = this;
    this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "/some/absolute/path", false, true).callsFake(function (fnProcessor) {
        var oCache = {
            setProperty: function () { }
        };
        that.mock(oBinding).expects("doSetProperty").withExactArgs("/cache/path", "new value", undefined);
        that.mock(oMetaModel).expects("fetchUpdateData").withExactArgs("/some/absolute/path", sinon.match.same(oContext), true).returns(SyncPromise.resolve(oFetchUpdateDataResultPromise));
        oFetchUpdateDataResultPromise.then(function () {
            that.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/binding/path");
            that.mock(_Helper).expects("getRelativePath").withExactArgs("/entity/path", "/resolved/binding/path").returns("helper/path");
            that.mock(oCache).expects("setProperty").withExactArgs("property/path", "new value", "helper/path").resolves();
        });
        return fnProcessor(oCache, "/cache/path", oBinding);
    });
    return oContext.doSetProperty("/some/absolute/path", "new value");
});
[SyncPromise.resolve(), undefined].forEach(function (vValue) {
    QUnit.test("doSetProperty: invocation of ODB#doSetProperty", function () {
        var oBinding = {
            oContext: {},
            doSetProperty: function () { },
            getResolvedPath: function () { },
            isPatchWithoutSideEffects: function () { },
            sPath: "binding/path"
        }, oFetchUpdateDataResult = {
            editUrl: "/edit/url",
            entityPath: "/entity/path",
            propertyPath: "property/path"
        }, oGroupLock = {}, oMetaModel = {
            fetchUpdateData: function () { },
            getUnitOrCurrencyPath: function () { }
        }, oModel = {
            bAutoExpandSelect: false,
            getMetaModel: function () {
                return oMetaModel;
            },
            resolve: function () { }
        }, bSkipRetry = {}, oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"), that = this;
        this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "/some/absolute/path", false, true).callsFake(function (fnProcessor) {
            var oCache = {
                update: function () { }
            }, oModelMock = that.mock(oModel), bPatchWithoutSideEffects = {};
            that.mock(oBinding).expects("doSetProperty").withExactArgs("/cache/path", "new value", sinon.match.same(oGroupLock)).returns(vValue);
            that.mock(oMetaModel).expects("fetchUpdateData").withExactArgs("/some/absolute/path", sinon.match.same(oContext), false).exactly(vValue ? 0 : 1).returns(SyncPromise.resolve(oFetchUpdateDataResult));
            if (vValue === undefined) {
                that.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/binding/path");
                oModelMock.expects("resolve").withExactArgs("/some/absolute/path", sinon.match.same(oContext)).returns("/resolved/data/path");
                that.mock(_Helper).expects("getRelativePath").withExactArgs("/entity/path", "/resolved/binding/path").returns("helper/path");
                that.mock(oBinding).expects("isPatchWithoutSideEffects").withExactArgs().returns(bPatchWithoutSideEffects);
                that.mock(oMetaModel).expects("getUnitOrCurrencyPath").withExactArgs("/resolved/data/path").returns("unit/or/currency/path");
                that.mock(oCache).expects("update").withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value", bSkipRetry ? undefined : sinon.match.func, "/edit/url", "helper/path", "unit/or/currency/path", sinon.match.same(bPatchWithoutSideEffects), sinon.match.func).resolves();
            }
            return fnProcessor(oCache, "/cache/path", oBinding);
        });
        return oContext.doSetProperty("/some/absolute/path", "new value", oGroupLock, bSkipRetry);
    });
});
[undefined, true].forEach(function (bRetry) {
    [null, "new value"].forEach(function (vValue) {
        QUnit.test("setProperty: " + vValue + ", retry = " + bRetry, function (assert) {
            var oBinding = {
                checkSuspended: function () { },
                lockGroup: function () { }
            }, oModel = {
                checkGroupId: function () { }
            }, oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"), oGroupLock = {}, vWithCacheResult = {};
            this.mock(oBinding).expects("checkSuspended").withExactArgs();
            this.mock(oModel).expects("checkGroupId").withExactArgs("group");
            this.mock(oBinding).expects("lockGroup").withExactArgs("group", true, true).returns(oGroupLock);
            this.mock(oContext).expects("doSetProperty").withExactArgs("some/relative/path", vValue, sinon.match.same(oGroupLock), !bRetry).returns(SyncPromise.resolve(vWithCacheResult));
            return oContext.setProperty("some/relative/path", vValue, "group", bRetry).then(function (vResult) {
                assert.strictEqual(vResult, vWithCacheResult);
            });
        });
    });
});
[String, {}].forEach(function (vForbiddenValue) {
    QUnit.test("setProperty: Not a primitive value: " + vForbiddenValue, function (assert) {
        var oBinding = {
            checkSuspended: function () { }
        }, oContext = Context.create({}, oBinding, "/ProductList('HT-1000')");
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(oContext).expects("doSetProperty").never();
        assert.throws(function () {
            oContext.setProperty("some/relative/path", vForbiddenValue);
        }, new Error("Not a primitive value"));
    });
});
QUnit.test("setProperty: doSetProperty fails, unlock oGroupLock", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        lockGroup: function () { }
    }, oModel = {
        checkGroupId: function () { },
        reportError: function () { },
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"), oError = new Error("This call intentionally failed"), oGroupLock = {
        unlock: function () { }
    }, oGroupLockMock = this.mock(oGroupLock), oPromise;
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oModel).expects("checkGroupId").withExactArgs("group");
    this.mock(oBinding).expects("lockGroup").withExactArgs("group", true, true).returns(oGroupLock);
    oGroupLockMock.expects("unlock").never();
    this.mock(oContext).expects("doSetProperty").withExactArgs("some/relative/path", "new value", sinon.match.same(oGroupLock), true).returns(SyncPromise.resolve(Promise.reject(oError)));
    this.mock(oModel).expects("resolve").withExactArgs("some/relative/path", sinon.match.same(oContext)).returns("/resolved/path");
    this.mock(oModel).expects("reportError").withExactArgs("Failed to update path /resolved/path", "sap.ui.model.odata.v4.Context", sinon.match.same(oError));
    oPromise = oContext.setProperty("some/relative/path", "new value", "group");
    assert.ok(oPromise instanceof Promise);
    oGroupLockMock.expects("unlock").withExactArgs(true);
    return oPromise.then(function () {
        oPromise.ok(false, "unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("setProperty: null as group ID", function (assert) {
    var oBinding = {
        checkSuspended: function () { },
        lockGroup: function () { }
    }, oModel = {
        reportError: function () { },
        resolve: function () { }
    }, oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"), oError = {};
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oBinding).expects("lockGroup").never();
    this.mock(oContext).expects("doSetProperty").withExactArgs("some/relative/path", "new value", null, true).returns(SyncPromise.reject(oError));
    this.mock(oModel).expects("resolve").withExactArgs("some/relative/path", sinon.match.same(oContext)).returns("/resolved/path");
    this.mock(oModel).expects("reportError").withExactArgs("Failed to update path /resolved/path", "sap.ui.model.odata.v4.Context", sinon.match.same(oError));
    return oContext.setProperty("some/relative/path", "new value", null).then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
[false, true].forEach(function (bCallback) {
    QUnit.test("adjustPredicates: callback=" + bCallback, function (assert) {
        var oBinding = {}, oBinding1 = {
            adjustPredicate: function () { }
        }, oBinding2 = {
            adjustPredicate: function () { }
        }, fnPathChanged = sinon.spy(), oModel = {
            getDependentBindings: function () { }
        }, oContext = Context.create(oModel, oBinding, "/SalesOrderList($uid=1)/SO_2_BP");
        this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext)).returns([oBinding1, oBinding2]);
        this.mock(oBinding1).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')");
        this.mock(oBinding2).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')");
        oContext.adjustPredicate("($uid=1)", "('42')", bCallback ? fnPathChanged : undefined);
        assert.strictEqual(oContext.sPath, "/SalesOrderList('42')/SO_2_BP");
        if (bCallback) {
            sinon.assert.calledWith(fnPathChanged, "/SalesOrderList($uid=1)/SO_2_BP", "/SalesOrderList('42')/SO_2_BP");
        }
    });
});
[false, true].forEach(function (bSuccess) {
    QUnit.test("expand: success=" + bSuccess, function () {
        var oBinding = {
            expand: function () { }
        }, oModel = {
            reportError: function () { }
        }, oContext = Context.create(oModel, oBinding, "/path"), oError = new Error(), oPromise = bSuccess ? Promise.resolve() : Promise.reject(oError);
        this.mock(oContext).expects("isExpanded").withExactArgs().returns(false);
        this.mock(oBinding).expects("expand").withExactArgs(sinon.match.same(oContext)).returns(oPromise);
        if (!bSuccess) {
            this.mock(oModel).expects("reportError").withExactArgs("Failed to expand " + oContext, "sap.ui.model.odata.v4.Context", sinon.match.same(oError));
        }
        oContext.expand();
        return oPromise.catch(function () { });
    });
});
QUnit.test("expand: already expanded", function (assert) {
    var oContext = Context.create({}, {}, "/path");
    this.mock(oContext).expects("isExpanded").withExactArgs().returns(true);
    assert.throws(function () {
        oContext.expand();
    }, new Error("Already expanded: " + oContext));
});
QUnit.test("expand/collapse: not expandable", function (assert) {
    var oContext = Context.create({}, {}, "/path"), oContextMock = this.mock(oContext);
    this.mock(oContext).expects("isExpanded").twice().withExactArgs().returns({});
    assert.throws(function () {
        oContext.expand();
    }, new Error("Not expandable: " + oContext));
    oContextMock.expects("getProperty").withExactArgs("@$ui5.node.level").returns({});
    assert.throws(function () {
        oContext.collapse();
    }, new Error("Not expandable: " + oContext));
    oContextMock.expects("getProperty").withExactArgs("@$ui5.node.level").returns(0);
    assert.throws(function () {
        oContext.collapse();
    }, new Error("Not expandable: " + oContext));
});
QUnit.test("collapse", function () {
    var oBinding = {
        collapse: function () { }
    }, oContext = Context.create({}, oBinding, "/path");
    this.mock(oContext).expects("getProperty").withExactArgs("@$ui5.node.level").returns({});
    this.mock(oContext).expects("isExpanded").withExactArgs().returns(true);
    this.mock(oBinding).expects("collapse").withExactArgs(sinon.match.same(oContext));
    oContext.collapse();
});
QUnit.test("collapse: already collapsed", function (assert) {
    var oContext = Context.create({}, {}, "/path");
    this.mock(oContext).expects("getProperty").withExactArgs("@$ui5.node.level").returns({});
    this.mock(oContext).expects("isExpanded").withExactArgs().returns(false);
    assert.throws(function () {
        oContext.collapse();
    }, new Error("Already collapsed: " + oContext));
});
QUnit.test("isExpanded", function (assert) {
    var oBinding = {}, oContext = Context.create({}, oBinding, "/path"), oContextMock = this.mock(oContext);
    oContextMock.expects("getProperty").withExactArgs("@$ui5.node.isExpanded").returns("~anything~");
    assert.strictEqual(oContext.isExpanded(), "~anything~");
});
QUnit.test("resetKeepAlive", function (assert) {
    var oBinding = {
        checkKeepAlive: function () { }
    }, oContext = Context.create({}, oBinding, "/path");
    oContext.bKeepAlive = "bTrueOrFalse";
    oContext.fnOnBeforeDestroy = "fnOnBeforeDestroy";
    oContext.resetKeepAlive();
    assert.strictEqual(oContext.bKeepAlive, false);
    assert.strictEqual(oContext.fnOnBeforeDestroy, "fnOnBeforeDestroy");
});
QUnit.test("setKeepAlive", function (assert) {
    var done = assert.async(), oBinding = {
        checkKeepAlive: function () { },
        fetchIfChildCanUseCache: function () { }
    }, oError = new Error(), oMetaModel = {
        getObject: function () {
            assert.ok(false);
        }
    }, oModel = {
        bAutoExpandSelect: true,
        getMetaModel: function () { return oMetaModel; },
        getReporter: function () {
            return function (oError0) {
                assert.strictEqual(oError0, oError);
                done();
            };
        }
    }, oContext = Context.create(oModel, oBinding, "/path");
    this.mock(oContext).expects("isTransient").exactly(3).withExactArgs().returns(false);
    this.mock(oContext).expects("getValue").exactly(3).withExactArgs().returns("~value~");
    this.mock(_Helper).expects("getPrivateAnnotation").exactly(3).withExactArgs("~value~", "predicate").returns("('foo')");
    this.mock(oBinding).expects("checkKeepAlive").exactly(3).withExactArgs(sinon.match.same(oContext));
    oContext.setKeepAlive("bTrueOrFalse");
    assert.strictEqual(oContext.isKeepAlive(), "bTrueOrFalse");
    assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);
    this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
    this.mock(oMetaModel).expects("getObject").withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path").returns("path/to/messages");
    this.mock(oBinding).expects("fetchIfChildCanUseCache").withExactArgs(sinon.match.same(oContext), "path/to/messages", {}).resolves("/reduced/path");
    this.mock(oContext).expects("fetchValue").withExactArgs("/reduced/path").rejects(oError);
    oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
    assert.strictEqual(oContext.isKeepAlive(), true);
    assert.strictEqual(oContext.fnOnBeforeDestroy, "fnOnBeforeDestroy");
    oContext.setKeepAlive(false, "fnOnBeforeDestroy", true);
    assert.strictEqual(oContext.isKeepAlive(), false);
    assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);
});
QUnit.test("setKeepAlive: forbidden by the binding", function (assert) {
    var oBinding = {
        checkKeepAlive: function () { }
    }, oContext = Context.create({}, oBinding, "/path"), oError = new Error();
    this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate").returns("('foo')");
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext)).throws(oError);
    assert.throws(function () {
        oContext.setKeepAlive(true);
    }, oError);
    assert.strictEqual(oContext.isKeepAlive(), false);
});
QUnit.test("setKeepAlive: transient", function (assert) {
    var oContext = Context.create({}, {}, "/path");
    this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
    assert.throws(function () {
        oContext.setKeepAlive(true);
    }, new Error("Unsupported transient context " + oContext));
    assert.strictEqual(oContext.isKeepAlive(), false);
});
QUnit.test("setKeepAlive: no predicate", function (assert) {
    var oContext = Context.create({}, {}, "/path");
    this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate").returns(undefined);
    assert.throws(function () {
        oContext.setKeepAlive(true);
    }, new Error("No key predicate known at /path"));
    assert.strictEqual(oContext.isKeepAlive(), false);
});
QUnit.test("setKeepAlive: bRequestMessages w/o autoExpandSelect", function (assert) {
    var oBinding = {
        checkKeepAlive: function () { }
    }, oModel = {
        bAutoExpandSelect: false
    }, oContext = Context.create(oModel, oBinding, "/path");
    this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate").returns("('foo')");
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext));
    this.mock(_Helper).expects("getMetaPath").never();
    assert.throws(function () {
        oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
    }, new Error("Missing parameter autoExpandSelect at model"));
    assert.strictEqual(oContext.isKeepAlive(), false);
});
QUnit.test("setKeepAlive: missing messages annotation", function (assert) {
    var oBinding = {
        checkKeepAlive: function () { }
    }, oMetaModel = {
        getObject: function () { }
    }, oModel = {
        bAutoExpandSelect: true,
        getMetaModel: function () { return oMetaModel; }
    }, oContext = Context.create(oModel, oBinding, "/path");
    this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate").returns("('foo')");
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext));
    this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
    this.mock(oMetaModel).expects("getObject").withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path").returns(undefined);
    assert.throws(function () {
        oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
    }, new Error("Missing @com.sap.vocabularies.Common.v1.Messages"));
    assert.strictEqual(oContext.isKeepAlive(), false);
});
QUnit.test("setKeepAlive: fetchIfChildCanUse fails", function (assert) {
    var done = assert.async(), oBinding = {
        checkKeepAlive: function () { },
        fetchIfChildCanUseCache: function () { }
    }, oError = new Error(), oMetaModel = {
        getObject: function () { }
    }, oModel = {
        bAutoExpandSelect: true,
        getMetaModel: function () { return oMetaModel; },
        getReporter: function () {
            return function (oError0) {
                assert.strictEqual(oError0, oError);
                done();
            };
        }
    }, oContext = Context.create(oModel, oBinding, "/path");
    this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate").returns("('foo')");
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext));
    this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
    this.mock(oMetaModel).expects("getObject").withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path").returns("path/to/messages");
    this.mock(oBinding).expects("fetchIfChildCanUseCache").withExactArgs(sinon.match.same(oContext), "path/to/messages", {}).rejects(oError);
    oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
});
QUnit.test("refreshDependentBindings", function (assert) {
    var oModel = {
        getDependentBindings: function () { }
    }, oContext = Context.create(oModel, {}, "/path"), aDependentBindings = [{
            refreshInternal: function () { }
        }, {
            refreshInternal: function () { }
        }], oDependent0Promise = {}, oDependent1Promise = {}, oResult = {};
    this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext)).returns(aDependentBindings);
    this.mock(aDependentBindings[0]).expects("refreshInternal").withExactArgs("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~").returns(oDependent0Promise);
    this.mock(aDependentBindings[1]).expects("refreshInternal").withExactArgs("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~").returns(oDependent1Promise);
    this.mock(SyncPromise).expects("all").withExactArgs(sinon.match(function (aValues) {
        assert.strictEqual(aValues[0], oDependent0Promise);
        assert.strictEqual(aValues[1], oDependent1Promise);
        return aValues.length === 2;
    })).returns(oResult);
    assert.strictEqual(oContext.refreshDependentBindings("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~"), oResult);
});