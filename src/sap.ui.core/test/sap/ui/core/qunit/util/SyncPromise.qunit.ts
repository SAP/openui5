import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
function assertFulfilled(assert, oSyncPromise, vExpectedResult) {
    function checkEqual(vResult) {
        if (Array.isArray(vExpectedResult)) {
            assert.deepEqual(vResult, vExpectedResult);
        }
        else {
            assert.strictEqual(vResult, vExpectedResult);
        }
    }
    assert.strictEqual(oSyncPromise.isFulfilled(), true);
    assert.strictEqual(oSyncPromise.isPending(), false);
    assert.strictEqual(oSyncPromise.isRejected(), false);
    checkEqual(oSyncPromise.getResult(), vExpectedResult);
    oSyncPromise.then(function (vResult) {
        checkEqual(vResult, vExpectedResult);
    }, function (vReason) {
        assert.ok(false, "unexpected failure: " + vReason);
    });
}
function assertPending(assert, oSyncPromise) {
    assert.strictEqual(oSyncPromise.isFulfilled(), false);
    assert.strictEqual(oSyncPromise.isPending(), true);
    assert.strictEqual(oSyncPromise.isRejected(), false);
    assert.strictEqual(typeof oSyncPromise.getResult().then, "function", "pending on a thenable: " + oSyncPromise.getResult());
}
function assertRejected(assert, oSyncPromise, vExpectedReason) {
    assert.strictEqual(oSyncPromise.isFulfilled(), false);
    assert.strictEqual(oSyncPromise.isPending(), false);
    assert.strictEqual(oSyncPromise.isRejected(), true);
    if (arguments.length > 2) {
        assert.strictEqual(oSyncPromise.getResult(), vExpectedReason);
        oSyncPromise.catch(function (vReason) {
            assert.strictEqual(vReason, vExpectedReason);
        });
        oSyncPromise.then(function () {
            assert.ok(false, "unexpected success");
        }, function (vReason) {
            assert.strictEqual(vReason, vExpectedReason);
        });
    }
}
QUnit.module("sap.ui.base.SyncPromise", {
    before: function () {
        this.listener = SyncPromise.listener;
    },
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    },
    after: function () {
        SyncPromise.listener = this.listener;
    }
});
[42, undefined, { then: 42 }, [SyncPromise.resolve()]].forEach(function (vResult) {
    QUnit.test("SyncPromise.resolve with non-Promise value: " + vResult, function (assert) {
        assertFulfilled(assert, SyncPromise.resolve(vResult), vResult);
    });
});
QUnit.test("access to state and result: fulfills", function (assert) {
    var oNewPromise, oPromise = Promise.resolve(42), oSyncPromise;
    oSyncPromise = SyncPromise.resolve(oPromise);
    assertPending(assert, oSyncPromise);
    assert.strictEqual(SyncPromise.resolve(oSyncPromise), oSyncPromise, "resolve() does not wrap a SyncPromise again");
    oNewPromise = oSyncPromise.then(function (iResult) {
        assertFulfilled(assert, oSyncPromise, iResult);
    });
    assertPending(assert, oNewPromise);
    return oPromise.then(function (iResult) {
        assertFulfilled(assert, oSyncPromise, iResult);
        return oNewPromise;
    });
});
QUnit.test("'then' on a fulfilled SyncPromise", function (assert) {
    var bCalled = false, oNewSyncPromise, oSyncPromise = SyncPromise.resolve(42);
    oNewSyncPromise = oSyncPromise.then().then("If onFulfilled is not a function, it must be ignored").then(undefined, function () {
        assert.ok(false, "unexpected call to reject callback");
    }).then(function (iResult) {
        assertFulfilled(assert, oSyncPromise, iResult);
        assert.strictEqual(bCalled, false, "then called exactly once");
        bCalled = true;
        return "*" + iResult + "*";
    });
    assertFulfilled(assert, oNewSyncPromise, "*42*");
    assert.strictEqual(bCalled, true, "called synchronously");
    oNewSyncPromise.then(function (sResult) {
        assert.strictEqual(sResult, oNewSyncPromise.getResult(), "*42*");
    });
});
[
    { wrap: false, reject: false },
    { wrap: true, reject: false },
    { wrap: false, reject: true },
    { wrap: true, reject: true }
].forEach(function (oFixture) {
    QUnit.test("sync -> async: " + JSON.stringify(oFixture), function (assert) {
        var oPromise = oFixture.reject ? Promise.reject() : Promise.resolve(), oSyncPromise = SyncPromise.resolve(oPromise);
        return oPromise[oFixture.reject ? "catch" : "then"](function () {
            var oFulfillment = {}, oNewSyncPromise, oResult = new Promise(function (resolve) {
                setTimeout(function () {
                    assertPending(assert, oNewSyncPromise);
                }, 0);
                setTimeout(function () {
                    resolve(oFulfillment);
                }, 10);
            });
            function callback() {
                return oResult;
            }
            function fail() {
                assert.ok(false, "unexpected call");
            }
            if (oFixture.wrap) {
                oResult = SyncPromise.resolve(oResult);
            }
            oNewSyncPromise = oFixture.reject ? oSyncPromise.then(fail, callback) : oSyncPromise.then(callback, fail);
            assertPending(assert, oNewSyncPromise);
            assert.notStrictEqual(oNewSyncPromise, oResult, "'then' returns a new promise");
            return oNewSyncPromise.then(function (vResult) {
                assertFulfilled(assert, oNewSyncPromise, oFulfillment);
                assert.strictEqual(vResult, oFulfillment);
            });
        });
    });
});
[
    { initialReject: false, thenReject: false },
    { initialReject: false, thenReject: true },
    { initialReject: true, thenReject: false },
    { initialReject: true, thenReject: true }
].forEach(function (oFixture) {
    QUnit.test("sync -> sync: " + JSON.stringify(oFixture), function (assert) {
        var oResult = {}, oInitialPromise = oFixture.initialReject ? Promise.reject() : Promise.resolve(), oInitialSyncPromise = SyncPromise.resolve(oInitialPromise), sMethod = oFixture.initialReject || oFixture.thenReject ? "catch" : "then", oThenPromise = oFixture.thenReject ? Promise.reject(oResult) : Promise.resolve(oResult), oThenSyncPromise = SyncPromise.resolve(oThenPromise);
        return Promise.all([oInitialPromise, oThenPromise])[sMethod](function () {
            var oNewSyncPromise = oFixture.initialReject ? oInitialSyncPromise.then(fail, callback) : oInitialSyncPromise.then(callback, fail);
            function callback() {
                return oThenSyncPromise;
            }
            function fail() {
                assert.ok(false, "unexpected call");
            }
            if (oFixture.thenReject) {
                assertRejected(assert, oNewSyncPromise, oResult);
                assertRejected(assert, oThenSyncPromise, oResult);
            }
            else {
                assertFulfilled(assert, oNewSyncPromise, oResult);
            }
        });
    });
});
QUnit.test("sync -> sync: throws", function (assert) {
    var oError = new Error(), oInitialSyncPromise = SyncPromise.resolve(), oNewSyncPromise = oInitialSyncPromise.then(callback, fail);
    function callback() {
        throw oError;
    }
    function fail() {
        assert.ok(false, "unexpected call");
    }
    assertRejected(assert, oNewSyncPromise, oError);
});
QUnit.test("access to state and result: rejects", function (assert) {
    var oNewPromise, oReason = {}, oPromise = Promise.reject(oReason), oSyncPromise;
    oSyncPromise = SyncPromise.resolve(oPromise);
    assertPending(assert, oSyncPromise);
    oNewPromise = oSyncPromise.then(function () {
        assert.ok(false);
    }, function (vReason) {
        assert.strictEqual(vReason, oReason);
    });
    assertPending(assert, oNewPromise);
    return oPromise.catch(function () {
        assertRejected(assert, oSyncPromise, oReason);
        return oNewPromise;
    });
});
QUnit.test("'then' on a rejected SyncPromise", function (assert) {
    var oReason = {}, oPromise = Promise.reject(oReason), oSyncPromise = SyncPromise.resolve(oPromise);
    return oPromise.catch(function () {
        var bCalled = false, oNewSyncPromise;
        oNewSyncPromise = oSyncPromise.then().then(null, "If onRejected is not a function, it must be ignored").then(function () {
            assert.ok(false);
        }, function (vReason) {
            assertRejected(assert, oSyncPromise, oReason);
            assert.strictEqual(vReason, oReason);
            assert.strictEqual(bCalled, false, "then called exactly once");
            bCalled = true;
            return "OK";
        });
        assertFulfilled(assert, oNewSyncPromise, "OK");
        assert.strictEqual(bCalled, true, "called synchronously");
        oNewSyncPromise.then(function (sResult) {
            assert.strictEqual(sResult, oNewSyncPromise.getResult(), "OK");
        });
    });
});
QUnit.test("SyncPromise.all: simple values", function (assert) {
    assertFulfilled(assert, SyncPromise.all([]), []);
    assertFulfilled(assert, SyncPromise.all([null]), [null]);
    assertFulfilled(assert, SyncPromise.all([42]), [42]);
    assertFulfilled(assert, SyncPromise.all([SyncPromise.resolve(42)]), [42]);
    assertFulfilled(assert, SyncPromise.all({}), []);
    (function () {
        assertFulfilled(assert, SyncPromise.all(arguments), [42]);
    })(42);
    assertFulfilled(assert, SyncPromise.all("42"), ["4", "2"]);
    return SyncPromise.all([42]).then(function (aAnswers) {
        assert.deepEqual(aAnswers, [42]);
    });
});
QUnit.test("SyncPromise.all: performance", function (assert) {
    this.mock(SyncPromise).expects("resolve").never();
    assertFulfilled(assert, SyncPromise.all("42"), ["4", "2"]);
});
QUnit.test("SyncPromise.all: sparse array", function (assert) {
    var aValues = ["4", , "2"];
    assertFulfilled(assert, SyncPromise.all(aValues), ["4", , "2"]);
});
QUnit.test("SyncPromise.all: take advantage of runs of the same thenable", function (assert) {
    var oPromise = Promise.resolve(42), aValues = [oPromise, oPromise, 23, oPromise, oPromise, , oPromise, Promise.resolve("42"), oPromise];
    this.spy(oPromise, "then");
    return SyncPromise.all(aValues).then(function (aAnswers) {
        assert.strictEqual(oPromise.then.callCount, 6 - 2);
        assert.deepEqual(aAnswers, [42, 42, 23, 42, 42, , 42, "42", 42]);
    });
});
QUnit.test("SyncPromise.all: missing array", function (assert) {
    var oSyncPromise = SyncPromise.all();
    assertRejected(assert, oSyncPromise);
    oSyncPromise.catch(function (vReason) {
        assert.ok(vReason instanceof TypeError);
    });
});
QUnit.test("SyncPromise.all: then", function (assert) {
    var oPromiseAll = SyncPromise.all([Promise.resolve(42)]), oThenResult, done = assert.async();
    assertPending(assert, oPromiseAll);
    oThenResult = oPromiseAll.then(function (aAnswers) {
        assert.strictEqual(aAnswers[0], 42);
        assertFulfilled(assert, oPromiseAll, [42]);
        done();
    });
    assertPending(assert, oThenResult);
});
QUnit.test("SyncPromise.all: catch", function (assert) {
    var oCatchResult, oReason = {}, oPromiseAll = SyncPromise.all([Promise.reject(oReason)]), done = assert.async();
    assertPending(assert, oPromiseAll);
    oCatchResult = oPromiseAll.catch(function (oReason0) {
        assert.strictEqual(oReason0, oReason);
        assertRejected(assert, oPromiseAll, oReason);
        done();
    });
    assertPending(assert, oCatchResult);
});
[true, false].forEach(function (bWrap) {
    QUnit.test("SyncPromise.all: one Promise resolves, wrap = " + bWrap, function (assert) {
        var oPromise = Promise.resolve(42), oPromiseAll;
        if (bWrap) {
            oPromise = SyncPromise.resolve(oPromise);
        }
        oPromiseAll = SyncPromise.all([oPromise]);
        assertPending(assert, oPromiseAll);
        return oPromise.then(function () {
            assertFulfilled(assert, oPromiseAll, [42]);
        });
    });
});
QUnit.test("SyncPromise.all: two Promises resolve", function (assert) {
    var oPromiseAll, oPromise0 = Promise.resolve(42), oPromise1 = new Promise(function (resolve) {
        setTimeout(function () {
            assertPending(assert, oPromiseAll);
        }, 5);
        setTimeout(function () {
            resolve("OK");
        }, 10);
    }), aPromises = [oPromise0, oPromise1];
    oPromiseAll = SyncPromise.all(aPromises);
    assertPending(assert, oPromiseAll);
    return Promise.all(aPromises).then(function () {
        assertFulfilled(assert, oPromiseAll, [42, "OK"]);
        assert.deepEqual(aPromises, [oPromise0, oPromise1], "caller's array unchanged");
    });
});
QUnit.test("SyncPromise.all: one Promise rejects", function (assert) {
    var oReason = {}, oPromise = Promise.reject(oReason), oPromiseAll;
    oPromiseAll = SyncPromise.all([oPromise]);
    assertPending(assert, oPromiseAll);
    return oPromise.catch(function () {
        assertRejected(assert, oPromiseAll, oReason);
    });
});
QUnit.test("SyncPromise.all: two Promises reject", function (assert) {
    var oReason = {}, oPromiseAll, oPromise0 = Promise.reject(oReason), oPromise1 = new Promise(function (_resolve, reject) {
        setTimeout(function () {
            assertRejected(assert, oPromiseAll, oReason);
        }, 5);
        setTimeout(function () {
            reject("Unexpected");
        }, 10);
    }), aPromises = [oPromise0, oPromise1];
    oPromiseAll = SyncPromise.all(aPromises);
    assertPending(assert, oPromiseAll);
    return oPromise1.catch(function () {
        assertRejected(assert, oPromiseAll, oReason);
        assert.deepEqual(aPromises, [oPromise0, oPromise1], "caller's array unchanged");
    });
});
QUnit.test("'catch' delegates to 'then'", function (assert) {
    var oNewPromise = {}, fnOnRejected = function () { }, oSyncPromise = SyncPromise.resolve();
    this.mock(oSyncPromise).expects("then").withExactArgs(undefined, sinon.match.same(fnOnRejected)).returns(oNewPromise);
    assert.strictEqual(oSyncPromise.catch(fnOnRejected), oNewPromise);
});
QUnit.test("Promise.resolve on SyncPromise", function (assert) {
    return Promise.resolve(SyncPromise.resolve(42)).then(function (iResult) {
        assert.strictEqual(iResult, 42);
    });
});
QUnit.test("toString", function (assert) {
    var oError = new Error("rejected"), oPromise;
    assert.strictEqual(SyncPromise.resolve("/EMPLOYEES").toString(), "/EMPLOYEES");
    assert.strictEqual(SyncPromise.resolve().toString(), "undefined");
    assert.strictEqual(SyncPromise.resolve(null).toString(), "null");
    assert.strictEqual(SyncPromise.resolve(42).toString(), "42");
    assert.strictEqual(SyncPromise.all([
        SyncPromise.resolve(42),
        "Foo",
        true
    ]).toString(), "42,Foo,true");
    oPromise = SyncPromise.reject(oError);
    assert.strictEqual(oPromise.toString(), "Error: rejected");
    assertRejected(assert, oPromise, oError);
    oPromise = SyncPromise.resolve(Promise.reject(oError));
    assert.strictEqual(oPromise.toString(), "SyncPromise: pending");
    return oPromise.catch(function () {
        assert.strictEqual(oPromise.toString(), "Error: rejected");
    });
});
[undefined, new Error()].forEach(function (vReason) {
    QUnit.test("SyncPromise.reject", function (assert) {
        assertRejected(assert, SyncPromise.reject(vReason), vReason);
    });
});
QUnit.test("'then' on a SyncPromise.reject()", function (assert) {
    var bCalled = false, oNewSyncPromise, oReason = {}, oSyncPromise = SyncPromise.reject(oReason);
    oNewSyncPromise = oSyncPromise.then().then(null, "If onRejected is not a function, it must be ignored").then(function () {
        assert.ok(false);
    }, function (vReason) {
        assertRejected(assert, oSyncPromise, oReason);
        assert.strictEqual(vReason, oReason);
        assert.strictEqual(bCalled, false, "then called exactly once");
        bCalled = true;
        return "OK";
    });
    assertFulfilled(assert, oNewSyncPromise, "OK");
    assert.strictEqual(bCalled, true, "called synchronously");
});
QUnit.test("new SyncPromise", function (assert) {
    var oFulfilledPromise, oPendingPromise, oPromise = Promise.resolve(42), vReason = {};
    assertPending(assert, new SyncPromise(function () {
        return "ignored";
    }));
    oFulfilledPromise = new SyncPromise(function (resolve, reject) {
        resolve("OK");
        resolve("Unexpected");
        reject("Unexpected");
        return "ignored";
    });
    assertFulfilled(assert, oFulfilledPromise, "OK");
    assertFulfilled(assert, new SyncPromise(function (resolve) {
        resolve(oFulfilledPromise);
        throw new Error("ignored");
    }), "OK");
    assertRejected(assert, new SyncPromise(function (resolve, reject) {
        reject(vReason);
        resolve("Unexpected");
        reject("Unexpected");
        return "ignored";
    }), vReason);
    assertRejected(assert, new SyncPromise(function () {
        throw vReason;
    }), vReason);
    oPendingPromise = new SyncPromise(function (resolve) {
        resolve(oPromise);
        return "ignored";
    });
    assertPending(assert, oPendingPromise);
    return oPromise.then(function (vResult) {
        assertFulfilled(assert, oPendingPromise, vResult);
    });
});
QUnit.test("A promise cannot be resolved with itself.", function (assert) {
    var fnResolve, oSyncPromise = new SyncPromise(function (resolve) {
        fnResolve = resolve;
    });
    assertPending(assert, oSyncPromise);
    fnResolve(oSyncPromise);
    assertRejected(assert, oSyncPromise);
    return oSyncPromise.catch(function (vReason) {
        assert.ok(vReason instanceof TypeError);
        assert.strictEqual(vReason.message, "A promise cannot be resolved with itself.");
    });
});
QUnit.test("Pending on native Promise", function (assert) {
    var oEverPendingPromise = new Promise(function () { }), oSyncPromise = new SyncPromise(function (resolve) {
        resolve(SyncPromise.resolve(oEverPendingPromise));
    });
    assertPending(assert, oSyncPromise);
});
QUnit.test("Resolved, but not yet settled", function (assert) {
    var oSyncPromise = new SyncPromise(function (resolve, reject) {
        resolve(Promise.resolve(42));
        resolve("Unexpected");
        reject("Unexpected");
    });
    assertPending(assert, oSyncPromise);
    return oSyncPromise.then(function (vResult) {
        assert.strictEqual(vResult, 42);
    });
});
QUnit.test("thenables: fulfilled", function (assert) {
    var oThenable = {
        then: function (resolve) {
            resolve(42);
        }
    }, oSyncPromise = new SyncPromise(function (resolve, reject) {
        resolve(oThenable);
        resolve("Unexpected");
        reject("Unexpected");
    });
    assertFulfilled(assert, oSyncPromise, 42);
    assertFulfilled(assert, SyncPromise.all([oThenable]), [42]);
    assert.strictEqual(SyncPromise.isThenable(oThenable), true);
});
QUnit.test("thenables: rejected", function (assert) {
    var oThenable = {
        then: function (_resolve, reject) {
            reject(42);
        }
    }, oSyncPromise = new SyncPromise(function (resolve, reject) {
        resolve(oThenable);
        resolve("Unexpected");
        reject("Unexpected");
    });
    assertRejected(assert, oSyncPromise, 42);
    assertRejected(assert, SyncPromise.all([oThenable]), 42);
    assert.strictEqual(SyncPromise.isThenable(oThenable), true);
});
QUnit.test("thenables: cannot get 'then'", function (assert) {
    var oError = new Error("This call intentionally failed"), oThenable = Object.defineProperty({}, "then", {
        get: function () {
            throw oError;
        }
    }), oSyncPromise = new SyncPromise(function (resolve, reject) {
        resolve(oThenable);
        resolve("Unexpected");
        reject("Unexpected");
    });
    assertRejected(assert, oSyncPromise, oError);
    assertRejected(assert, SyncPromise.all([oThenable]), oError);
    assert.strictEqual(SyncPromise.isThenable(oThenable), false);
});
QUnit.test("thenables: function", function (assert) {
    var oSyncPromise, fnThenable = function () { };
    fnThenable.then = function (resolve) {
        resolve(42);
    };
    oSyncPromise = new SyncPromise(function (resolve, reject) {
        resolve(fnThenable);
        resolve("Unexpected");
        reject("Unexpected");
    });
    assertFulfilled(assert, oSyncPromise, 42);
    assertFulfilled(assert, SyncPromise.all([fnThenable]), [42]);
    assert.strictEqual(SyncPromise.isThenable(fnThenable), true);
});
QUnit.test("Pending on a thenable", function (assert) {
    var oEverPendingThenable = {
        then: function () { }
    }, oSyncPromise = new SyncPromise(function (resolve) {
        resolve(SyncPromise.resolve(oEverPendingThenable));
    });
    assertPending(assert, oSyncPromise);
    assertPending(assert, SyncPromise.all([oEverPendingThenable]));
    assert.strictEqual(SyncPromise.isThenable(oEverPendingThenable), true);
});
QUnit.test("Uncaught (in promise): listener", function () {
    var oMock = this.mock(SyncPromise), fnReject, oSyncPromise = new SyncPromise(function (_resolve, reject) {
        fnReject = reject;
    });
    SyncPromise.listener = function () { };
    oMock.expects("listener").withExactArgs(oSyncPromise, false);
    fnReject(0);
    oMock.expects("listener").withExactArgs(oSyncPromise, true);
    oSyncPromise.catch(function () { });
    oSyncPromise.catch(function () { });
});
QUnit.test("Uncaught (in promise): listen on rejected promises only", function () {
    var oSyncPromise = new SyncPromise(function () { });
    SyncPromise.listener = function () { };
    this.mock(SyncPromise).expects("listener").never();
    oSyncPromise.catch(function () { });
    SyncPromise.resolve().then(function () { });
});
QUnit.test("caught: a posteriori", function () {
    var oSyncPromise;
    SyncPromise.listener = function () { };
    oSyncPromise = SyncPromise.reject();
    this.mock(SyncPromise).expects("listener").withExactArgs(oSyncPromise, true);
    oSyncPromise.caught();
});
QUnit.test("caught: a priori", function () {
    var fnReject, oSyncPromise = new SyncPromise(function (_resolve, reject) {
        fnReject = reject;
    });
    SyncPromise.listener = function () { };
    this.mock(SyncPromise).expects("listener").never();
    oSyncPromise.caught();
    fnReject();
});
QUnit.test("Uncaught (in promise): no listener", function () {
    delete SyncPromise.listener;
    return SyncPromise.reject(0).catch(function () { });
});
QUnit.test("Uncaught (in promise)", function () {
    return SyncPromise.all([
        SyncPromise.reject(0).catch(function () { }),
        SyncPromise.resolve(Promise.reject(1)).catch(function () { }),
        SyncPromise.resolve(Promise.reject(2)).then().catch(function () { }),
        new SyncPromise(function (resolve) {
            resolve(SyncPromise.resolve(Promise.reject(3)));
        }).catch(function () { }),
        new SyncPromise(function (resolve) {
            resolve(SyncPromise.reject(4));
        }).catch(function () { })
    ]);
});
QUnit.test("unwrap", function (assert) {
    var oError = new Error(), oPromise = Promise.resolve(42);
    assert.strictEqual(SyncPromise.resolve(42).unwrap(), 42);
    assert.strictEqual(SyncPromise.resolve(oPromise).unwrap(), oPromise);
    assert.throws(function () {
        SyncPromise.reject(oError).unwrap();
    }, function (oError0) {
        return oError0 === oError;
    });
});
QUnit.test("unwrap: Uncaught (in promise) - BCP: 2080194122", function (assert) {
    return SyncPromise.resolve(Promise.reject(2080194122)).unwrap().catch(function (vReason) {
        assert.strictEqual(vReason, 2080194122);
    });
});
QUnit.test("finally", function (assert) {
    var oNewReason = new Error("new"), oOldReason = new Error("old");
    function returnFulfilled() {
        assert.strictEqual(arguments.length, 0);
        return SyncPromise.resolve(oNewReason);
    }
    function returnNewReason() {
        assert.strictEqual(arguments.length, 0);
        return oNewReason;
    }
    function returnRejected() {
        assert.strictEqual(arguments.length, 0);
        return SyncPromise.reject(oNewReason);
    }
    function throwNewReason() {
        assert.strictEqual(arguments.length, 0);
        throw oNewReason;
    }
    assertFulfilled(assert, SyncPromise.resolve(42).finally(), 42);
    assertRejected(assert, SyncPromise.reject(oOldReason).finally(), oOldReason);
    assertFulfilled(assert, SyncPromise.resolve(42).finally(returnNewReason), 42);
    assertRejected(assert, SyncPromise.reject(oOldReason).finally(returnNewReason), oOldReason);
    assertFulfilled(assert, SyncPromise.resolve(42).finally(returnFulfilled), 42);
    assertRejected(assert, SyncPromise.reject(oOldReason).finally(returnFulfilled), oOldReason);
    assertRejected(assert, SyncPromise.resolve(42).finally(throwNewReason), oNewReason);
    assertRejected(assert, SyncPromise.reject(oOldReason).finally(throwNewReason), oNewReason);
    assertRejected(assert, SyncPromise.resolve(42).finally(returnRejected), oNewReason);
    assertRejected(assert, SyncPromise.reject(oOldReason).finally(returnRejected), oNewReason);
});
QUnit.test("finally: return Promise.resolve() after resolve", function (assert) {
    var oFinallyPromise = SyncPromise.resolve(42).finally(function () {
        assert.strictEqual(arguments.length, 0);
        return Promise.resolve(new Error("new"));
    });
    assertPending(assert, oFinallyPromise);
    return oFinallyPromise.then(function (vResult) {
        assert.strictEqual(vResult, 42);
    });
});
QUnit.test("finally: return Promise.resolve() after reject", function (assert) {
    var oFinallyPromise, oOldReason = new Error("old");
    oFinallyPromise = SyncPromise.reject(oOldReason).finally(function () {
        assert.strictEqual(arguments.length, 0);
        return Promise.resolve(new Error("new"));
    });
    assertPending(assert, oFinallyPromise);
    return oFinallyPromise.then(function () {
        assert.ok(false);
    }, function (vReason) {
        assert.strictEqual(vReason, oOldReason);
    });
});
[
    SyncPromise.resolve(42),
    SyncPromise.reject(new Error("old"))
].forEach(function (oInitialPromise, i) {
    QUnit.test("finally: return Promise.reject() after resolve, #" + i, function (assert) {
        var oFinallyPromise, oNewReason = new Error("new");
        oFinallyPromise = oInitialPromise.finally(function () {
            assert.strictEqual(arguments.length, 0);
            return Promise.reject(oNewReason);
        });
        assertPending(assert, oFinallyPromise);
        return oFinallyPromise.then(function () {
            assert.ok(false);
        }, function (vReason) {
            assert.strictEqual(vReason, oNewReason);
        });
    });
});
[undefined, true, 1, "hello", {}].forEach(function (fnOnFinally) {
    QUnit.test("finally: fnOnFinally is not callable: " + fnOnFinally, function (assert) {
        var oResult = {}, oSyncPromise = SyncPromise.resolve();
        this.mock(oSyncPromise).expects("then").withExactArgs(sinon.match.same(fnOnFinally), sinon.match.same(fnOnFinally)).returns(oResult);
        assert.strictEqual(oSyncPromise.finally(fnOnFinally), oResult);
    });
});
QUnit.test("finally: resolve as fast as then", function (assert) {
    var oPromise1, oPromise2, fnResolve1, fnResolve2, aResults = [];
    function done(vResult) {
        aResults.push(vResult);
    }
    oPromise1 = new SyncPromise(function (fnResolve) {
        fnResolve1 = fnResolve;
    }).finally(function () {
        return SyncPromise.resolve();
    }).then(done);
    oPromise1 = new SyncPromise(function (fnResolve) {
        fnResolve2 = fnResolve;
    }).then(function (o) { return o; }).then(done);
    fnResolve1("1");
    fnResolve2("2");
    return SyncPromise.all([oPromise1, oPromise2]).then(function () {
        assert.deepEqual(aResults, ["1", "2"]);
    });
});
QUnit.test("finally: reject as fast as catch", function (assert) {
    var oPromise1, oPromise2, fnReject1, fnReject2, aResults = [];
    function done(vResult) {
        aResults.push(vResult);
    }
    oPromise1 = new SyncPromise(function (_fnResolve, fnReject) {
        fnReject1 = fnReject;
    }).finally(function () {
        return SyncPromise.resolve();
    }).catch(done);
    oPromise2 = new SyncPromise(function (_fnResolve, fnReject) {
        fnReject2 = fnReject;
    }).catch(function (o) { throw o; }).catch(done);
    fnReject1("1");
    fnReject2("2");
    return SyncPromise.all([oPromise1, oPromise2]).then(function () {
        assert.deepEqual(aResults, ["1", "2"]);
    });
});
[
    function (oPromise, fnDone) {
        SyncPromise.resolve(oPromise).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.resolve(oPromise).then(function (o) { return o; }).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.resolve(oPromise).catch(function () { }).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.resolve(oPromise).finally(function () { }).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.all([oPromise]).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.all([oPromise]).then(function (o) { return o; }).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.all([oPromise]).catch(function () { }).then(fnDone);
    },
    function (oPromise, fnDone) {
        SyncPromise.all([oPromise]).finally(function () { }).then(fnDone);
    }
].forEach(function (fnAct, i) {
    QUnit.test("finally: timing, " + i, function (assert) {
        var fnResolve1, oPromise1 = new Promise(function (fnResolve) {
            fnResolve1 = fnResolve;
        }), fnResolve2, oPromise2 = new Promise(function (fnResolve) {
            fnResolve2 = fnResolve;
        }), aResults = [];
        function done(vResult) {
            if (Array.isArray(vResult)) {
                aResults.push.apply(aResults, vResult);
            }
            else {
                aResults.push(vResult);
            }
        }
        fnAct(oPromise1, done);
        SyncPromise.resolve(oPromise2).then(function (o) { return o; }).then(function (o) { return o; }).then(done);
        fnResolve1("1");
        fnResolve2("2");
        return new Promise(function (resolve) {
            setTimeout(function () {
                assert.deepEqual(aResults, ["1", "2"]);
                resolve();
            }, 0);
        });
    });
});
[
    function (oPromise, fnDone) {
        Promise.resolve(oPromise).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.resolve(oPromise).then(function (o) { return o; }).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.resolve(oPromise).catch(function () { }).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.resolve(oPromise).finally(function () { }).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.all([oPromise]).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.all([oPromise]).then(function (o) { return o; }).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.all([oPromise]).catch(function () { }).then(fnDone);
    },
    function (oPromise, fnDone) {
        Promise.all([oPromise]).finally(function () { }).then(fnDone);
    }
].forEach(function (fnAct, i) {
    QUnit.test("finally: native timing, " + i, function (assert) {
        var fnResolve1, oPromise1 = new Promise(function (fnResolve) {
            fnResolve1 = fnResolve;
        }), fnResolve2, oPromise2 = new Promise(function (fnResolve) {
            fnResolve2 = fnResolve;
        }), aResults = [];
        function done(vResult) {
            if (Array.isArray(vResult)) {
                aResults.push.apply(aResults, vResult);
            }
            else {
                aResults.push(vResult);
            }
        }
        fnAct(oPromise1, done);
        Promise.resolve(oPromise2).then(function (o) { return o; }).then(function (o) { return o; }).then(function (o) { return o; }).then(function (o) { return o; }).then(function (o) { return o; }).then(done);
        fnResolve1("1");
        fnResolve2("2");
        return new Promise(function (resolve) {
            setTimeout(function () {
                assert.deepEqual(aResults, ["1", "2"]);
                resolve();
            }, 0);
        });
    });
});
QUnit.test("resolve() re-uses the same instance", function (assert) {
    assert.strictEqual(SyncPromise.resolve(), SyncPromise.resolve(undefined));
});
[undefined, null, 0, 1, false, true, "", " ", {}, Function, { then: {} }].forEach(function (vValue) {
    QUnit.test("isThenable: " + vValue, function (assert) {
        assert.strictEqual(SyncPromise.isThenable(vValue), false);
    });
});