import Log from "sap/base/Log";
import isEmptyObject from "sap/base/util/isEmptyObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import ODataUtils from "sap/ui/model/odata/ODataUtils";
import _Cache from "sap/ui/model/odata/v4/lib/_Cache";
import _GroupLock from "sap/ui/model/odata/v4/lib/_GroupLock";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import _Parser from "sap/ui/model/odata/v4/lib/_Parser";
import _Requestor from "sap/ui/model/odata/v4/lib/_Requestor";
import TestUtils from "sap/ui/test/TestUtils";
var sClassName = "sap.ui.model.odata.v4.lib._Cache", aTestData = "abcdefghijklmnopqrstuvwxyz".split("");
function createResult(iIndex, iLength, vCount, bPredicates) {
    var oResult = {
        "@odata.context": "$metadata#TEAMS",
        value: aTestData.slice(iIndex, iIndex + iLength).map(function (s) {
            return bPredicates ? { key: s, "@$ui5._": { predicate: "('" + s + "')" } } : { key: s };
        })
    };
    if (vCount !== undefined) {
        oResult["@odata.count"] = String(vCount);
    }
    return oResult;
}
function defaultGetGroupProperty(sGroupId) {
    if (sGroupId === "$direct") {
        return "Direct";
    }
    if (sGroupId === "$auto") {
        return "Auto";
    }
    return "API";
}
QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
    beforeEach: function () {
        var oModelInterface = {
            fetchMetadata: function () {
                return SyncPromise.resolve(null);
            },
            reportStateMessages: function () { }
        };
        this.oModelInterfaceMock = this.mock(oModelInterface);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.oRequestor = {
            buildQueryString: function () { return ""; },
            fetchTypeForPath: function () {
                return SyncPromise.resolve({
                    "$Key": ["key"],
                    "key": { "$Type": "Edm.String" }
                });
            },
            getGroupSubmitMode: function (sGroupId) {
                return defaultGetGroupProperty(sGroupId);
            },
            getModelInterface: function () {
                return oModelInterface;
            },
            getServiceUrl: function () { return "/~/"; },
            hasChanges: function () { },
            isActionBodyOptional: function () { },
            lockGroup: function () { throw new Error("lockGroup mock missing"); },
            relocate: function () { },
            relocateAll: function () { },
            removePatch: function () { },
            removePost: function () { },
            reportTransitionMessages: function () { },
            request: function () { }
        };
        this.oRequestorMock = this.mock(this.oRequestor);
    },
    createCache: function (sResourcePath, mQueryOptions, bWithKeyPredicates, sDeepResourcePath) {
        if (bWithKeyPredicates) {
            this.oRequestor.fetchTypeForPath = function () {
                return SyncPromise.resolve({
                    $Key: ["key"],
                    key: {
                        $Type: "Edm.String"
                    }
                });
            };
        }
        return _Cache.create(this.oRequestor, sResourcePath, mQueryOptions, false, sDeepResourcePath);
    },
    mockRequestAndRead: function (oCache, iStartOffset, sUrl, iStart, iLength, iResponseLength, fnSubmit, vCount) {
        var oReadGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oPromise = Promise.resolve(createResult(iStart, iResponseLength !== undefined ? iResponseLength : iLength, vCount)), oUnlockedCopy = {};
        this.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
        this.mock(oReadGroupLock).expects("unlock").withExactArgs();
        this.oRequestorMock.expects("request").withExactArgs("GET", sUrl + "?$skip=" + iStart + "&$top=" + iLength, sinon.match.same(oUnlockedCopy), undefined, undefined, fnSubmit).returns(oPromise);
        return oCache.read(iStartOffset + iStart, iLength, 0, oReadGroupLock);
    },
    createSingle: function (sResourcePath, mQueryOptions, bPost) {
        return _Cache.createSingle(this.oRequestor, sResourcePath, mQueryOptions, false, false, undefined, bPost);
    }
});
QUnit.test("_Cache basics", function (assert) {
    var fnGetOriginalResourcePath = {}, mQueryOptions = {}, sResourcePath = "TEAMS('42')", oCache;
    this.mock(_Cache.prototype).expects("setQueryOptions").withExactArgs(sinon.match.same(mQueryOptions)).callsFake(function () {
        assert.strictEqual(this.bSortExpandSelect, "bSortExpandSelect");
        assert.notOk(this.bSharedRequest);
    });
    this.mock(_Cache.prototype).expects("setResourcePath").withExactArgs(sResourcePath).callsFake(function () {
        assert.notOk(this.bSharedRequest);
    });
    oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions, "bSortExpandSelect", fnGetOriginalResourcePath, "bSharedRequest");
    assert.strictEqual(oCache.iActiveUsages, 1);
    assert.deepEqual(oCache.mChangeListeners, {});
    assert.strictEqual(oCache.fnGetOriginalResourcePath, fnGetOriginalResourcePath);
    assert.strictEqual(oCache.iInactiveSince, Infinity);
    assert.deepEqual(oCache.mPatchRequests, {});
    assert.deepEqual(oCache.mPostRequests, {});
    assert.strictEqual(oCache.oPendingRequestsPromise, null);
    assert.strictEqual(oCache.oRequestor, this.oRequestor);
    assert.strictEqual(oCache.bSortExpandSelect, "bSortExpandSelect");
    assert.strictEqual(oCache.bSentRequest, false);
    assert.strictEqual(oCache.bSharedRequest, "bSharedRequest");
    assert.strictEqual(oCache.sReportedMessagesPath, undefined);
    assert.ok(oCache.hasOwnProperty("sReportedMessagesPath"));
    assert.throws(function () {
        oCache.getValue();
    }, new Error("Unsupported operation"));
});
QUnit.test("_Cache#setResourcePath", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')/name.space.Operation");
    oCache.mLateQueryOptions = {};
    oCache.mPropertyRequestByPath = {};
    oCache.oTypePromise = {};
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.mock(_Helper).expects("getMetaPath").withExactArgs("/TEAMS('23')").returns("/TEAMS");
    oCache.setResourcePath("TEAMS('23')");
    assert.strictEqual(oCache.sResourcePath, "TEAMS('23')");
    assert.strictEqual(oCache.sMetaPath, "/TEAMS");
    assert.strictEqual(oCache.oTypePromise, undefined);
    assert.ok(oCache.hasOwnProperty("oTypePromise"));
    assert.strictEqual(oCache.mLateQueryOptions, null);
    assert.deepEqual(oCache.mPropertyRequestByPath, {});
});
QUnit.test("_Cache#setProperty", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oEntity = {}, oEntityPromise = Promise.resolve(oEntity), oUpdateData = {}, that = this;
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity", null, null, true).returns(SyncPromise.resolve(oEntityPromise));
    oEntityPromise.then(function () {
        that.mock(_Cache).expects("makeUpdateData").withExactArgs(["Address", "City"], "Walldorf").returns(oUpdateData);
        that.mock(_Helper).expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity", sinon.match.same(oEntity), sinon.match.same(oUpdateData));
    });
    return oCache.setProperty("Address/City", "Walldorf", "path/to/entity");
});
QUnit.test("_Cache#get-/setQueryOptions", function (assert) {
    var sMetaPath = "/TEAMS", mNewQueryOptions = {}, mQueryOptions = {}, oCache;
    this.oRequestorMock.expects("buildQueryString").withExactArgs(sMetaPath, sinon.match.same(mQueryOptions), false, "bSortExpandSelect").returns("?foo=bar");
    oCache = new _Cache(this.oRequestor, "TEAMS('42')", mQueryOptions, "bSortExpandSelect");
    assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
    assert.strictEqual(oCache.sQueryString, "?foo=bar");
    assert.strictEqual(oCache.getQueryOptions(), mQueryOptions);
    this.mock(oCache).expects("checkSharedRequest").thrice().withExactArgs();
    this.oRequestorMock.expects("buildQueryString").withExactArgs(sMetaPath, sinon.match.same(mNewQueryOptions), false, "bSortExpandSelect").returns("?baz=boo");
    oCache.setQueryOptions(mNewQueryOptions);
    assert.strictEqual(oCache.mQueryOptions, mNewQueryOptions);
    assert.strictEqual(oCache.sQueryString, "?baz=boo");
    assert.strictEqual(oCache.getQueryOptions(), mNewQueryOptions);
    oCache.bSentRequest = true;
    assert.throws(function () {
        oCache.setQueryOptions(mQueryOptions);
    }, new Error("Cannot set query options: Cache has already sent a request"));
    this.oRequestorMock.expects("buildQueryString").withExactArgs(sMetaPath, sinon.match.same(mQueryOptions), false, "bSortExpandSelect").returns("?foo=bar");
    oCache.setQueryOptions(mQueryOptions, true);
    assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
    assert.strictEqual(oCache.sQueryString, "?foo=bar");
    assert.strictEqual(oCache.getQueryOptions(), mQueryOptions);
});
QUnit.test("_Cache hierarchy", function (assert) {
    assert.ok(_Cache.create(this.oRequestor, "TEAMS") instanceof _Cache);
    assert.ok(_Cache.createSingle(this.oRequestor, "TEAMS('42')") instanceof _Cache);
    assert.ok(_Cache.createProperty(this.oRequestor, "TEAMS('42')/Team_Id") instanceof _Cache);
});
QUnit.test("_Cache: single cache with optional meta path", function (assert) {
    var sMetaPath = "/com.sap.gateway.default.iwbep.tea_busi.v0001.TEAM", oSingleCache = _Cache.createSingle(this.oRequestor, "TEAMS('42')", {}, false, false, undefined, false, sMetaPath);
    assert.strictEqual(oSingleCache.sMetaPath, sMetaPath);
    assert.strictEqual(oSingleCache.oPromise, null);
    this.mock(oSingleCache).expects("fetchType").withExactArgs(sinon.match.object, sMetaPath).returns(SyncPromise.resolve());
    oSingleCache.fetchTypes();
});
[{
        oEntity: undefined,
        iStatus: 200
    }, {
        oEntity: undefined,
        iStatus: 404
    }, {
        oEntity: undefined,
        iStatus: 500
    }, {
        oEntity: { "@odata.etag": "AnotherETag" },
        iStatus: 200
    }].forEach(function (oFixture) {
    QUnit.test("_Cache#_delete: from collection, status: " + oFixture.iStatus + (oFixture.oEntity ? " (ETagEntity)" : ""), function (assert) {
        var that = this, mQueryOptions = { foo: "bar" }, oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')", mQueryOptions), sEtag = "W/\"19770724000000.0000000\"", aCacheData = [{}, {
                "@$ui5._": { "predicate": "('1')" },
                "@odata.etag": sEtag
            }, {}], fnCallback = this.spy(), oError = new Error(""), oGroupLock = new _GroupLock("group", "owner", true), oGroupLockCopy = {}, oPromise, oRequestPromise = oFixture.iStatus === 200 ? Promise.resolve().then(function () {
            that.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, [], ["EMPLOYEE_2_EQUIPMENTS('1')"]);
        }) : Promise.reject(oError);
        this.mock(oCache).expects("checkSharedRequest").withExactArgs();
        this.mock(oCache).expects("addPendingRequest").withExactArgs();
        oRequestPromise = oRequestPromise.finally(function () {
            that.mock(oCache).expects("removePendingRequest").withExactArgs();
        });
        oCache.fetchValue = function () { };
        this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS").returns(SyncPromise.resolve(aCacheData));
        this.mock(oCache).expects("getOriginalResourcePath").withExactArgs(sinon.match.same(aCacheData[1])).returns("~");
        this.mock(_Cache).expects("from$skip").withExactArgs("1", sinon.match.same(aCacheData)).returns(1);
        oError.status = oFixture.iStatus;
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/EMPLOYEES", sinon.match.same(mQueryOptions), true).returns("?foo=bar");
        this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
        this.oRequestorMock.expects("request").withExactArgs("DELETE", "Equipments('1')?foo=bar", sinon.match.same(oGroupLockCopy), { "If-Match": sinon.match.same(oFixture.oEntity || aCacheData[1]) }, undefined, undefined, undefined, undefined, "~/EMPLOYEE_2_EQUIPMENTS('1')").callsFake(function () {
            assert.ok(oGroupLock.isLocked(), "still locked");
            return oRequestPromise;
        });
        this.mock(oCache).expects("removeElement").exactly(oFixture.iStatus === 500 ? 0 : 1).withExactArgs(sinon.match.same(aCacheData), 1, "('1')", "EMPLOYEE_2_EQUIPMENTS").returns(1);
        oPromise = oCache._delete(oGroupLock, "Equipments('1')", "EMPLOYEE_2_EQUIPMENTS/1", oFixture.oEntity, fnCallback).then(function (oResult) {
            assert.notStrictEqual(oFixture.iStatus, 500, "unexpected success");
            assert.deepEqual(oResult, [undefined, false, undefined]);
            sinon.assert.calledOnce(fnCallback);
            sinon.assert.calledWithExactly(fnCallback, 1, sinon.match.same(aCacheData));
        }, function (oError0) {
            assert.strictEqual(oFixture.iStatus, 500, JSON.stringify(oError0));
            assert.strictEqual(oError0, oError);
            assert.notOk("$ui5.deleting" in aCacheData[1]);
            sinon.assert.notCalled(fnCallback);
        });
        assert.notOk(oGroupLock.isLocked(), "unlocked synchronously");
        assert.strictEqual(aCacheData[1]["$ui5.deleting"], true);
        return oPromise;
    });
});
QUnit.test("_Cache#_delete: from collection, must not delete twice", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EMPLOYEES"), aCacheData = [{ "$ui5.deleting": true }];
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "1/EMPLOYEE_2_EQUIPMENTS").returns(SyncPromise.resolve(aCacheData));
    this.mock(_Cache).expects("from$skip").withExactArgs("0", sinon.match.same(aCacheData)).returns(0);
    oCache._delete({}, "Equipments('0')", "1/EMPLOYEE_2_EQUIPMENTS/0").then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Must not delete twice: Equipments('0')");
    });
});
QUnit.test("_Cache#_delete: nested entity", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Equipments(Category='foo',ID='0815')", { $expand: { EQUIPMENT_2_EMPLOYEE: { EMPLOYEE_2_TEAM: true } } }), sEtag = "W/\"19770724000000.0000000\"", oCacheData = {
        "EMPLOYEE_2_TEAM": {
            "@$ui5._": {
                "predicate": "('23')"
            },
            "@odata.etag": sEtag
        }
    }, fnCallback = this.spy(), oGroupLock = new _GroupLock("group", "owner", true), oGroupLockCopy = {}, oUpdateData = {}, that = this;
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "EQUIPMENT_2_EMPLOYEE").returns(SyncPromise.resolve(oCacheData));
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
    this.oRequestorMock.expects("request").withExactArgs("DELETE", "TEAMS('23')", sinon.match.same(oGroupLockCopy), {
        "If-Match": sinon.match.same(oCacheData["EMPLOYEE_2_TEAM"])
    }, undefined, undefined, undefined, undefined, "Equipments(Category='foo',ID='0815')/EQUIPMENT_2_EMPLOYEE/EMPLOYEE_2_TEAM").returns(Promise.resolve().then(function () {
        that.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, [], ["EQUIPMENT_2_EMPLOYEE/EMPLOYEE_2_TEAM"]);
    }));
    this.mock(oCache).expects("requestCount").withExactArgs(sinon.match.same(oGroupLock));
    this.mock(_Cache).expects("makeUpdateData").withExactArgs(["EMPLOYEE_2_TEAM"], null).returns(oUpdateData);
    this.mock(_Helper).expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), "EQUIPMENT_2_EMPLOYEE", sinon.match.same(oCacheData), sinon.match.same(oUpdateData));
    return oCache._delete(oGroupLock, "TEAMS('23')", "EQUIPMENT_2_EMPLOYEE/EMPLOYEE_2_TEAM", undefined, fnCallback).then(function (oResult) {
        assert.deepEqual(oResult, [undefined, undefined, undefined]);
        sinon.assert.calledOnce(fnCallback);
        sinon.assert.calledWithExactly(fnCallback);
    });
});
QUnit.test("_Cache#_delete: kept-alive context not in collection", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EMPLOYEES"), aCacheData = [], fnCallback = this.spy(), bDeleted = false, oGroupLock = new _GroupLock("group", "owner", true), oGroupLockCopy = {}, that = this;
    aCacheData.$byPredicate = {
        "('1')": {
            "@$ui5._": { "predicate": "('1')" },
            "@odata.etag": "etag"
        }
    };
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "").returns(SyncPromise.resolve(aCacheData));
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
    this.oRequestorMock.expects("request").withExactArgs("DELETE", "EMPLOYEES('1')", sinon.match.same(oGroupLockCopy), {
        "If-Match": "etag"
    }, undefined, undefined, undefined, undefined, "EMPLOYEES('1')").returns(Promise.resolve().then(function () {
        that.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, [], ["('1')"]);
        bDeleted = true;
    }));
    this.mock(oCache).expects("requestCount").withExactArgs(sinon.match.same(oGroupLock)).resolves("~count~done~");
    this.mock(oCache).expects("removeElement").withExactArgs(aCacheData, undefined, "('1')", "").returns("iIndex");
    return oCache._delete(oGroupLock, "EMPLOYEES('1')", "('1')", "etag", fnCallback).then(function (oResult) {
        assert.strictEqual(bDeleted, true);
        assert.deepEqual(oResult, [undefined, "~count~done~", undefined]);
        sinon.assert.calledOnce(fnCallback);
        sinon.assert.calledWithExactly(fnCallback, "iIndex", aCacheData);
    });
});
[false, true].forEach(function (bCreated) {
    ["", "EMPLOYEE_2_EQUIPMENTS"].forEach(function (sParentPath) {
        [false, true].forEach(function (bCount) {
            var sTitle = "_Cache#removeElement, bCreated = " + bCreated + ", bCount = " + bCount + ", sParentPath = " + sParentPath;
            QUnit.test(sTitle, function (assert) {
                var oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')"), aCacheData = [{
                        "@odata.etag": "before"
                    }, {
                        "@$ui5._": { "predicate": "('1')" },
                        "@odata.etag": "etag"
                    }, {
                        "@odata.etag": "after"
                    }], iIndex, iLimit = bCreated ? 1 : 3;
                oCache.adjustReadRequests = function () { };
                if (sParentPath === "") {
                    oCache.iLimit = iLimit;
                }
                aCacheData.$byPredicate = { "('1')": aCacheData[1] };
                aCacheData.$count = bCount ? 3 : undefined;
                if (bCreated) {
                    aCacheData[1]["@$ui5._"].transientPredicate = "$uid=1-23";
                    aCacheData.$byPredicate["$uid=1-23"] = aCacheData[1];
                }
                this.mock(_Cache).expects("getElementIndex").withExactArgs(sinon.match.same(aCacheData), "('1')", 2).returns(1);
                this.mock(_Helper).expects("updateExisting").exactly(bCount ? 1 : 0).withExactArgs(sinon.match.same(oCache.mChangeListeners), sParentPath, sinon.match.same(aCacheData), { $count: 2 }).callThrough();
                this.mock(oCache).expects("adjustReadRequests").exactly(sParentPath || bCreated ? 0 : 1).withExactArgs(1, -1);
                iIndex = oCache.removeElement(aCacheData, 2, "('1')", sParentPath);
                assert.strictEqual(iIndex, 1);
                assert.strictEqual(aCacheData.$count, bCount ? 2 : undefined);
                assert.deepEqual(aCacheData, [{
                        "@odata.etag": "before"
                    }, {
                        "@odata.etag": "after"
                    }]);
                assert.deepEqual(aCacheData.$byPredicate, {});
                if (sParentPath === "") {
                    assert.strictEqual(oCache.iLimit, bCreated ? 1 : 2);
                }
                else {
                    assert.notOk("iLimit" in oCache);
                }
            });
        });
    });
});
QUnit.test("_Cache#removeElement for a kept-alive context", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EMPLOYEES"), aCacheData = [{
            "@$ui5._": { "predicate": "('2')" },
            "@odata.etag": "etag"
        }], iIndex;
    aCacheData.$byPredicate = {
        "('1')": {
            "@$ui5._": { "predicate": "('1')" },
            "@odata.etag": "etag"
        },
        "('2')": aCacheData[0]
    };
    aCacheData.$count = 42;
    oCache.iLimit = 42;
    this.mock(_Cache).expects("getElementIndex").never();
    this.mock(_Helper).expects("updateExisting").never();
    iIndex = oCache.removeElement(aCacheData, undefined, "('1')", "");
    assert.strictEqual(iIndex, undefined);
    assert.strictEqual(aCacheData.$count, 42);
    assert.strictEqual(oCache.iLimit, 42);
    assert.deepEqual(aCacheData, [{
            "@$ui5._": { "predicate": "('2')" },
            "@odata.etag": "etag"
        }]);
    assert.deepEqual(aCacheData.$byPredicate, { "('2')": aCacheData[0] });
});
QUnit.test("_Cache#registerChange", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS");
    this.mock(_Helper).expects("addByPath").withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");
    oCache.registerChange("path", "listener");
});
QUnit.test("_Cache#registerChange: $$sharedRequst", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS", undefined, false, undefined, true);
    this.mock(_Helper).expects("addByPath").never();
    oCache.registerChange("path", "listener");
});
QUnit.test("_Cache#deregisterChange", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS");
    this.mock(_Helper).expects("removeByPath").withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");
    oCache.deregisterChange("path", "listener");
});
QUnit.test("_Cache#deregisterChange: $$sharedRequst", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS", undefined, false, undefined, true);
    this.mock(_Helper).expects("removeByPath").never();
    oCache.deregisterChange("path", "listener");
});
QUnit.test("_Cache#hasChangeListeners", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS");
    assert.strictEqual(oCache.hasChangeListeners(), false);
    oCache.registerChange("path", "listener");
    assert.strictEqual(oCache.hasChangeListeners(), true);
    oCache.deregisterChange("path", "listener");
    assert.strictEqual(oCache.hasChangeListeners(), false);
});
[true, false].forEach(function (bPatch) {
    QUnit.test("_Cache#hasPendingChangesForPath: bPatch = " + bPatch, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS");
        oCache[bPatch ? "mPatchRequests" : "mPostRequests"]["foo/bar/baz"] = [{}];
        assert.strictEqual(oCache.hasPendingChangesForPath("bar"), false);
        assert.strictEqual(oCache.hasPendingChangesForPath(""), true);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo"), true);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/ba"), false);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar"), true);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/bars"), false);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/ba"), false);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/baz"), true);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/baze"), false);
        assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/baz/qux"), false);
    });
});
QUnit.test("_Cache#resetChangesForPath: PATCHes", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS"), oCall1, oCall2;
    oCache.mPatchRequests = {
        "foo/ba": ["foo/ba"],
        "foo/bar": ["foo/bar/1", "foo/bar/2"],
        "foo/bars": ["foo/bars"],
        "foo/bar/baz": ["foo/bar/baz"]
    };
    oCall1 = this.oRequestorMock.expects("removePatch").withExactArgs("foo/bar/2");
    oCall2 = this.oRequestorMock.expects("removePatch").withExactArgs("foo/bar/1");
    this.oRequestorMock.expects("removePatch").withExactArgs("foo/bar/baz");
    oCache.resetChangesForPath("foo/bar");
    sinon.assert.callOrder(oCall1, oCall2);
    assert.deepEqual(oCache.mPatchRequests, {
        "foo/ba": ["foo/ba"],
        "foo/bars": ["foo/bars"]
    });
    this.oRequestorMock.expects("removePatch").withExactArgs("foo/ba");
    this.oRequestorMock.expects("removePatch").withExactArgs("foo/bars");
    oCache.resetChangesForPath("");
    assert.deepEqual(oCache.mPatchRequests, {});
});
QUnit.test("_Cache#resetChangesForPath: POSTs", function (assert) {
    var oBody0 = { "@$ui5._": { "transient": "update" } }, oBody1 = { "@$ui5._": { "transient": "update2" } }, oBody2 = { "@$ui5._": { "transient": "update" } }, oBody3 = { "@$ui5._": { "transient": "update" } }, oBody4 = { "@$ui5._": { "transient": "update" } }, oCache = new _Cache(this.oRequestor, "TEAMS"), oCall1, oCall2;
    oCache.mPostRequests = {
        "foo/ba": [oBody0],
        "foo/bar": [oBody1, oBody2],
        "foo/bars": [oBody3],
        "foo/bar/baz": [oBody4]
    };
    oCall1 = this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody2));
    oCall2 = this.oRequestorMock.expects("removePost").withExactArgs("update2", sinon.match.same(oBody1));
    this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody4));
    oCache.resetChangesForPath("foo/bar");
    sinon.assert.callOrder(oCall1, oCall2);
    assert.deepEqual(oCache.mPostRequests, {
        "foo/ba": [oBody0],
        "foo/bars": [oBody3]
    });
    this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody0));
    this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody3));
    oCache.resetChangesForPath("");
    assert.deepEqual(oCache.mPostRequests, {});
});
QUnit.test("_Cache#setActive", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS");
    oCache.iActiveUsages = 99;
    oCache.mPatchRequests = { "path": {} };
    oCache.setActive(true);
    assert.strictEqual(oCache.iActiveUsages, 100);
    assert.strictEqual(oCache.hasPendingChangesForPath("path"), true);
    assert.strictEqual(oCache.iInactiveSince, Infinity);
    oCache.setActive(false);
    assert.strictEqual(oCache.iActiveUsages, 99);
    assert.strictEqual(oCache.hasPendingChangesForPath(), false);
    assert.strictEqual(oCache.iInactiveSince, Infinity);
    oCache.iActiveUsages = 1;
    this.mock(Date).expects("now").withExactArgs().returns(42);
    oCache.setActive(false);
    assert.strictEqual(oCache.iActiveUsages, 0);
    assert.strictEqual(oCache.iInactiveSince, 42);
    oCache.setActive(true);
    assert.strictEqual(oCache.iActiveUsages, 1);
    assert.strictEqual(oCache.iInactiveSince, Infinity);
});
QUnit.test("_Cache#checkSharedRequest: not shared", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS");
    oCache.checkSharedRequest();
});
QUnit.test("_Cache#checkSharedRequest: shared", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS", undefined, false, undefined, true);
    assert.throws(function () {
        oCache.checkSharedRequest();
    }, new Error(oCache + " is read-only"));
});
QUnit.test("_Cache#drillDown", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products('42')"), oCacheMock = this.mock(_Cache), oData = [{
            foo: {
                bar: 42,
                empty: "",
                emptyList: [],
                list: [{}, {}, {}, {}],
                "null": null,
                zero: 0
            }
        }], that = this;
    function drillDown(sPath, bCreateOnDemand) {
        return oCache.drillDown(oData, sPath, null, bCreateOnDemand).getResult();
    }
    oCache.sResourcePath = "Employees?$select=foo";
    oData.$byPredicate = { "('a')": oData[0] };
    oData.$created = 0;
    oData[0].foo.list.$byPredicate = {
        "('0')": oData[0].foo.list[2],
        "('1')": oData[0].foo.list[3]
    };
    oData[0].foo.list.$count = 10;
    oData[0].foo.list.$tail = {};
    assert.strictEqual(drillDown(""), oData, "empty path");
    assert.strictEqual(drillDown("0"), oData[0], "0");
    assert.strictEqual(drillDown("('a')"), oData[0], "('a')");
    assert.strictEqual(drillDown("0/foo"), oData[0].foo, "0/foo");
    assert.strictEqual(drillDown("0/foo/bar"), oData[0].foo.bar, "0/foo/bar");
    assert.strictEqual(drillDown("0/foo/null/invalid"), undefined, "0/foo/null/invalid");
    assert.strictEqual(drillDown("0/foo/list/$count"), oData[0].foo.list.$count, "0/foo/list/$count");
    assert.strictEqual(drillDown("('a')/foo/list('1')"), oData[0].foo.list[3], "('a')/foo/list('1')");
    assert.strictEqual(drillDown("$count"), undefined, "$count");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/@$ui5._, invalid segment: @$ui5._", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/@$ui5._"), undefined, "@$ui5._");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/bar/invalid, invalid segment: invalid", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/bar/invalid"), undefined, "0/foo/bar/invalid");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/baz, invalid segment: baz", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/baz"), undefined, "0/foo/baz");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/$count, invalid segment: $count", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/$count"), undefined, "0/foo/$count");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/$count/bar, invalid segment: $count", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/$count/bar"), undefined, "0/foo/$count/bar");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/bar('2'), invalid segment: bar('2')", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/bar('2')"), undefined, "0/bar('2')");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/null/$count, invalid segment: $count", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/null/$count"), undefined, "0/bar('2')");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/bar/toString, invalid segment: toString", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/bar/toString"), undefined, "0/foo/bar/toString");
    assert.strictEqual(oCache.drillDown({}, "#com.sap.foo.AcFoo").getResult(), undefined, "no error if advertised action is not found");
    assert.strictEqual(oCache.drillDown({}, "@$ui5.context.isTransient").getResult(), undefined, "no error if annotation is not found");
    assert.strictEqual(oCache.drillDown({}, "property@foo.bar").getResult(), undefined, "no error if annotation is not found");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/list/bar, invalid segment: bar", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/list/bar"), undefined, "0/foo/list/bar");
    ["$byPredicate", "$created", "$tail", "length"].forEach(function (sProperty) {
        that.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/list/" + sProperty + ", invalid segment: " + sProperty, oCache.toString(), sClassName);
        assert.strictEqual(drillDown("0/foo/list/" + sProperty), undefined, "0/foo/list/" + sProperty);
    });
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/emptyList('0'), invalid segment: emptyList('0')", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/emptyList('0')"), undefined, "0/foo/emptyList('0')");
    this.oLogMock.expects("info").withExactArgs("Failed to drill-down into 0/foo/emptyList/0/bar, invalid segment: 0", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("0/foo/emptyList/0/bar"), undefined, "0/foo/emptyList/0/bar");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into ('a')/0, invalid segment: 0", oCache.toString(), sClassName);
    assert.strictEqual(drillDown("('a')/0"), undefined, "('a')/0");
    oCacheMock.expects("from$skip").withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
    oCacheMock.expects("from$skip").withExactArgs("list", sinon.match.same(oData[0].foo)).returns("list");
    oCacheMock.expects("from$skip").withExactArgs("1", sinon.match.same(oData[0].foo.list)).returns(3);
    assert.strictEqual(drillDown("('a')/foo/list/1"), oData[0].foo.list[3], "('a')/foo/list/1");
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into ('a')/foo/list/5, invalid segment: 5", oCache.toString(), sClassName);
    this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").never();
    oCacheMock.expects("from$skip").withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
    oCacheMock.expects("from$skip").withExactArgs("list", sinon.match.same(oData[0].foo)).returns("list");
    oCacheMock.expects("from$skip").withExactArgs("5", sinon.match.same(oData[0].foo.list)).returns(7);
    assert.strictEqual(drillDown("('a')/foo/list/5", true), undefined, "('a')/foo/list/5: index 7 out of range in ('a')/foo/list");
    oCacheMock.expects("from$skip").withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
    oCacheMock.expects("from$skip").withExactArgs("empty", sinon.match.same(oData[0].foo)).returns("empty");
    assert.strictEqual(drillDown("('a')/foo/empty", true), "");
    oCacheMock.expects("from$skip").withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
    oCacheMock.expects("from$skip").withExactArgs("zero", sinon.match.same(oData[0].foo)).returns("zero");
    assert.strictEqual(drillDown("('a')/foo/zero", true), 0);
});
QUnit.test("_SingleCache#drillDown: missing property, no key predicate", function (assert) {
    var oCache = this.createSingle("Products('42')"), oData = {}, oGroupLock = {};
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/foo").returns(SyncPromise.resolve({
        $kind: "Property",
        $Type: "some.ComplexType"
    }));
    this.mock(_Helper).expects("getAnnotationKey").withExactArgs(sinon.match.same(oData), ".Permissions", "foo").returns(undefined);
    this.mock(oCache).expects("fetchLateProperty").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData), "", "foo/bar", "foo").callsFake(function () {
        oData.foo = { bar: "baz" };
        return SyncPromise.resolve(Promise.resolve(oData.foo));
    });
    return oCache.drillDown(oData, "foo/bar", oGroupLock).then(function (vValue) {
        assert.strictEqual(vValue, "baz");
    });
});
QUnit.test("_CollectionCache#drillDown: missing property, no key predicate", function (assert) {
    var oCache = _Cache.create(this.oRequestor, "Products"), aData = [{}], oGroupLock = {};
    aData.$created = 0;
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/foo").returns(SyncPromise.resolve({
        $kind: "Property",
        $Type: "some.ComplexType"
    }));
    this.mock(_Helper).expects("getAnnotationKey").withExactArgs(sinon.match.same(aData[0]), ".Permissions", "foo").returns(undefined);
    this.mock(oCache).expects("fetchLateProperty").never();
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/bar, invalid segment: foo", oCache.toString(), sClassName);
    return oCache.drillDown(aData, "0/foo/bar", oGroupLock).then(function (vValue) {
        assert.strictEqual(vValue, undefined);
    });
});
QUnit.test("_Cache#drillDown: fetch missing property", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products"), oData = [{
            entity: {
                "@$ui5._": { "predicate": "(23)" },
                foo: {}
            }
        }], oGroupLock = {}, oValueOfBar = { baz: "qux" };
    oData.$byPredicate = { "('42')": oData[0] };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/entity/foo/bar").returns("entity/foo/bar");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/entity/foo/bar").returns(SyncPromise.resolve({
        $kind: "Property",
        $Type: "some.ComplexType"
    }));
    this.mock(_Helper).expects("getAnnotationKey").withExactArgs(sinon.match.same(oData[0].entity.foo), ".Permissions", "bar").returns(undefined);
    this.mock(oCache).expects("fetchLateProperty").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData[0].entity), "('42')/entity", "foo/bar/baz", "foo/bar").callsFake(function () {
        oData[0].entity.foo.bar = oValueOfBar;
        return SyncPromise.resolve(Promise.resolve(oValueOfBar));
    });
    return oCache.drillDown(oData, "('42')/entity/foo/bar/baz", oGroupLock).then(function (vValue) {
        assert.strictEqual(vValue, "qux");
    });
});
QUnit.test("_Cache#drillDown: unexpected missing property", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products"), oData = [{
            entity: {
                "@$ui5._": { predicate: "(23)" },
                foo: {}
            }
        }], oGroupLock = {};
    oData.$byPredicate = { "('42')": oData[0] };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/entity/foo/bar").returns("entity/foo/bar");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/entity/foo/bar").returns(SyncPromise.resolve({
        $kind: "Property",
        $Type: "some.ComplexType"
    }));
    this.mock(_Helper).expects("getAnnotationKey").withExactArgs({}, ".Permissions", "bar").returns(undefined);
    this.mock(oCache).expects("fetchLateProperty").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData[0].entity), "('42')/entity", "foo/bar/baz", "foo/bar").returns(undefined);
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into ('42')/entity/foo/bar/baz, invalid segment: bar", "/~/Products", sClassName);
    return oCache.drillDown(oData, "('42')/entity/foo/bar/baz", oGroupLock).then(function (vValue) {
        assert.strictEqual(vValue, undefined);
    });
});
[0, "None"].forEach(function (vPermissions) {
    QUnit.test("_Cache#drillDown: @Core.Permissions: " + vPermissions, function (assert) {
        var oCache = new _Cache(this.oRequestor, "Products"), oData = [{
                entity: {
                    foo: { "bar@Core.Permissions": vPermissions }
                }
            }];
        oData.$byPredicate = { "('42')": oData[0] };
        this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/entity/foo/bar").returns("entity/foo/bar");
        this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/entity/foo/bar").returns(SyncPromise.resolve({
            $kind: "Property",
            $Type: "some.ComplexType"
        }));
        this.mock(_Helper).expects("getAnnotationKey").withExactArgs(sinon.match.same(oData[0].entity.foo), ".Permissions", "bar").returns("bar@Core.Permissions");
        this.mock(oCache).expects("fetchLateProperty").never();
        return oCache.drillDown(oData, "('42')/entity/foo/bar/baz", {}).then(function (vValue) {
            assert.strictEqual(vValue, undefined);
        });
    });
});
QUnit.test("_Cache#drillDown: unread navigation property", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products"), oData = [{ "@$ui5._": { predicate: ("('42')") } }], oGroupLock = {};
    oData.$byPredicate = { "('42')": oData[0] };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/PRODUCT_2_BP").returns("PRODUCT_2_BP");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/PRODUCT_2_BP").returns(SyncPromise.resolve({
        $kind: "NavigationProperty",
        $Type: "name.space.BusinessPartner"
    }));
    this.mock(_Helper).expects("getAnnotationKey").withExactArgs(sinon.match.same(oData[0]), ".Permissions", "PRODUCT_2_BP").returns(undefined);
    this.mock(oCache).expects("fetchLateProperty").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData[0]), "('42')", "PRODUCT_2_BP", "PRODUCT_2_BP").returns(undefined);
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into ('42')/PRODUCT_2_BP, invalid segment: PRODUCT_2_BP", oCache.toString(), sClassName);
    return oCache.drillDown(oData, "('42')/PRODUCT_2_BP", oGroupLock).then(function (sResult) {
        assert.strictEqual(sResult, undefined);
    });
});
[
    [{ "@$ui5._": { predicate: ("('42')") } }],
    [{ "@$ui5._": { predicate: ("('42')") }, PRODUCT_2_BP: null }]
].forEach(function (oData, i) {
    QUnit.test("_Cache#drillDown: bCreateOnDemand, " + i, function (assert) {
        var oCache = new _Cache(this.oRequestor, "Products"), oGroupLock = {};
        oData.$byPredicate = { "('42')": oData[0] };
        this.oModelInterfaceMock.expects("fetchMetadata").never();
        this.mock(oCache).expects("fetchLateProperty").never();
        return oCache.drillDown(oData, "('42')/PRODUCT_2_BP", oGroupLock, true).then(function (oResult) {
            assert.strictEqual(oResult, oData[0].PRODUCT_2_BP);
            assert.deepEqual(oData, [{
                    "@$ui5._": { predicate: ("('42')") },
                    PRODUCT_2_BP: {}
                }]);
        });
    });
});
QUnit.test("_Cache#drillDown: stream property", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products"), oData = [{ productPicture: {} }];
    oData.$byPredicate = { "('42')": oData[0] };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/productPicture/picture").returns("productPicture/picture");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/productPicture/picture").returns(SyncPromise.resolve({ $Type: "Edm.Stream" }));
    this.mock(_Helper).expects("buildPath").withExactArgs("/~/Products", "('42')/productPicture/picture").returns("/~/Products('42')/productPicture/picture");
    return oCache.drillDown(oData, "('42')/productPicture/picture").then(function (sResult) {
        assert.strictEqual(sResult, "/~/Products('42')/productPicture/picture");
    });
});
QUnit.test("_Cache#drillDown: stream property, missing parent", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products"), oData = [{}];
    oData.$byPredicate = { "('42')": oData[0] };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/productPicture").returns("productPicture");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/productPicture").returns(SyncPromise.resolve({ $Type: "some.ComplexType" }));
    this.mock(_Helper).expects("getAnnotationKey").withExactArgs(sinon.match.same(oData[0]), ".Permissions", "productPicture").returns(undefined);
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into ('42')/productPicture/picture, " + "invalid segment: productPicture", oCache.toString(), sClassName);
    assert.strictEqual(oCache.drillDown(oData, "('42')/productPicture/picture").getResult(), undefined);
});
["@mediaReadLink", "@odata.mediaReadLink"].forEach(function (sMediaReadLink) {
    QUnit.test("_Cache#drillDown: stream property w/ " + sMediaReadLink, function (assert) {
        var oCache = new _Cache(this.oRequestor, "Products"), oData = [{
                productPicture: {}
            }];
        oData[0].productPicture["picture" + sMediaReadLink] = "/~/my/Picture";
        oData.$byPredicate = { "('42')": oData[0] };
        this.mock(_Helper).expects("getMetaPath").withExactArgs("('42')/productPicture/picture").returns("productPicture/picture");
        this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/productPicture/picture").returns(SyncPromise.resolve({ $Type: "Edm.Stream" }));
        assert.strictEqual(oCache.drillDown(oData, "('42')/productPicture/picture").getResult(), "/~/my/Picture");
    });
});
QUnit.test("_Cache#drillDown: transient entity, missing simple properties", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Products"), oData = [{
            "@$ui5.context.isTransient": true
        }], oHelperMock = this.mock(_Helper);
    oData.$byPredicate = { "($uid=id-1-23)": oData[0] };
    oHelperMock.expects("getMetaPath").withExactArgs("($uid=id-1-23)/Name").returns("Name");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/Name").returns(SyncPromise.resolve(Promise.resolve({
        $Type: "Edm.String"
    })));
    oHelperMock.expects("getMetaPath").withExactArgs("($uid=id-1-23)/Currency").returns("Currency");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/Currency").returns(SyncPromise.resolve(Promise.resolve({
        $DefaultValue: "EUR",
        $Type: "Edm.String"
    })));
    oHelperMock.expects("getMetaPath").withExactArgs("($uid=id-1-23)/Price").returns("Price");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/Price").returns(SyncPromise.resolve(Promise.resolve({
        $DefaultValue: "0.0",
        $Type: "Edm.Double"
    })));
    oHelperMock.expects("parseLiteral").withExactArgs("0.0", "Edm.Double", "($uid=id-1-23)/Price").returns(0);
    oHelperMock.expects("getMetaPath").withExactArgs("($uid=id-1-23)/ProductID").returns("ProductID");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/Products/ProductID").returns(SyncPromise.resolve(Promise.resolve({
        $DefaultValue: "",
        $Type: "Edm.String"
    })));
    return Promise.all([
        oCache.drillDown(oData, "($uid=id-1-23)/Name").then(function (sValue) {
            assert.strictEqual(sValue, null);
        }),
        oCache.drillDown(oData, "($uid=id-1-23)/Currency").then(function (sValue) {
            assert.strictEqual(sValue, "EUR");
        }),
        oCache.drillDown(oData, "($uid=id-1-23)/Price").then(function (sValue) {
            assert.strictEqual(sValue, 0);
        }),
        oCache.drillDown(oData, "($uid=id-1-23)/ProductID").then(function (sValue) {
            assert.strictEqual(sValue, "");
        })
    ]).then(function () {
        assert.deepEqual(oData[0], { "@$ui5.context.isTransient": true }, "cache unchanged");
    });
});
QUnit.test("_Cache#drillDown: transient entity, missing complex properties", function (assert) {
    var oCache = new _Cache(this.oRequestor, "BusinessPartners"), oData = [{
            "@$ui5.context.isTransient": true
        }];
    oData.$byPredicate = { "($uid=id-1-23)": oData[0] };
    this.oModelInterfaceMock.expects("fetchMetadata").thrice().withExactArgs("/BusinessPartners/Address").returns(SyncPromise.resolve(Promise.resolve({
        $Type: "name.space.Address"
    })));
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/BusinessPartners/Address/City").returns(SyncPromise.resolve({
        $Type: "Edm.String"
    }));
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/BusinessPartners/Address/unknown").returns(SyncPromise.resolve(undefined));
    this.oLogMock.expects("error").withExactArgs("Failed to drill-down into ($uid=id-1-23)/Address/unknown," + " invalid segment: unknown", "/~/BusinessPartners", sClassName);
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/BusinessPartners/Address/GeoLocation").returns(SyncPromise.resolve({
        $Type: "name.space.GeoLocation"
    }));
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/BusinessPartners/Address/GeoLocation/Longitude").returns(SyncPromise.resolve({
        $DefaultValue: "0.0",
        $Type: "Edm.Decimal"
    }));
    return Promise.all([
        oCache.drillDown(oData, "($uid=id-1-23)/Address/City").then(function (sValue) {
            assert.strictEqual(sValue, null);
        }),
        oCache.drillDown(oData, "($uid=id-1-23)/Address/unknown").then(function (sValue) {
            assert.strictEqual(sValue, undefined);
        }),
        oCache.drillDown(oData, "($uid=id-1-23)/Address/GeoLocation/Longitude").then(function (sValue) {
            assert.strictEqual(sValue, "0.0");
        })
    ]).then(function () {
        assert.deepEqual(oData[0], { "@$ui5.context.isTransient": true }, "cache unchanged");
    });
});
QUnit.test("_Cache#drillDown: transient entity, navigation property", function (assert) {
    var oCache = new _Cache(this.oRequestor, "SalesOrders"), oData = [{
            "@$ui5.context.isTransient": true
        }];
    oData.$byPredicate = { "($uid=id-1-23)": oData[0] };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("($uid=id-1-23)/SO_2_BP").returns("SO_2_BP");
    this.oModelInterfaceMock.expects("fetchMetadata").withExactArgs("/SalesOrders/SO_2_BP").returns(SyncPromise.resolve(Promise.resolve({
        $kind: "NavigationProperty",
        $Type: "name.space.BusinessPartner"
    })));
    return oCache.drillDown(oData, "($uid=id-1-23)/SO_2_BP/Name").then(function (sValue) {
        assert.strictEqual(sValue, undefined);
    }).then(function () {
        assert.deepEqual(oData[0], { "@$ui5.context.isTransient": true }, "cache unchanged");
    });
});
[{
        bCanceled: false,
        sEntityPath: "patch/without/side/effects",
        $$patchWithoutSideEffects: true
    }, {
        bCanceled: false,
        sEntityPath: "('42')/path/to/entity"
    }, {
        bCanceled: false,
        sEntityPath: ""
    }, {
        bCanceled: true,
        sEntityPath: "path/to/entity"
    }, {
        bCanceled: true,
        sEntityPath: ""
    }, {
        bCanceled: false,
        sEntityPath: "('42')/path/to/unread/entity",
        $cached: true
    }].forEach(function (oFixture) {
    var bCanceled = oFixture.bCanceled, sEntityPath = oFixture.sEntityPath, sTitle = "_Cache#update: " + (bCanceled ? "canceled" : "success") + ", entity path: " + sEntityPath;
    QUnit.test(sTitle, function (assert) {
        var mQueryOptions = {}, oCache = new _Cache(this.oRequestor, "BusinessPartnerList", mQueryOptions, true), oCacheMock = this.mock(oCache), oCacheUpdatePromise, oEntity = {
            "@odata.etag": "W/\"19700101000000.0000000\"",
            "Address": {
                "City": "Heidelberg"
            }
        }, oEntityMatcher = sinon.match.same(oEntity), fnError = this.spy(), oError = new Error(), iExpectedCalls = oFixture.$$patchWithoutSideEffects ? 0 : 1, oFetchCachedError = new Error("Unexpected request: GET ..."), oFetchValueExpectation, sFullPath = "path/to/entity/Address/City", oGroupLock = { getGroupId: function () { } }, oHelperMock = this.mock(_Helper), oOldData = {}, oPatchResult = {
            "@odata.etag": "W/\"20010101000000.0000000\"",
            "foo": "bar",
            "ignore": "me",
            "me": "too"
        }, oPatchPromise = bCanceled ? Promise.reject(oError) : Promise.resolve(oPatchResult), fnPatchSent = this.spy(), oRequestCall, oRequestLock = { unlock: function () { } }, oStaticCacheMock = this.mock(_Cache), mTypeForMetaPath = {}, oUnlockCall, oUpdateData = {}, oUpdateExistingCall, that = this;
        oError.canceled = bCanceled;
        oCache.fetchValue = function () { };
        oFetchValueExpectation = oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), sEntityPath);
        if (oFixture.$cached) {
            oCache.oPromise = null;
            oFetchCachedError.$cached = true;
            oFetchValueExpectation.throws(oFetchCachedError);
            oEntityMatcher = { "@odata.etag": "*" };
        }
        else {
            oFetchValueExpectation.returns(SyncPromise.resolve(oEntity));
        }
        oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        oHelperMock.expects("buildPath").withExactArgs(sEntityPath, "Address/City").returns(sFullPath);
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/BusinessPartnerList", sinon.match.same(mQueryOptions), true).returns("?foo=bar");
        oCacheMock.expects("getOriginalResourcePath").withExactArgs(oEntityMatcher).returns("~original~");
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
        oStaticCacheMock.expects("makeUpdateData").withExactArgs(["Address", "City"], "Walldorf").returns(oUpdateData);
        oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath, oEntityMatcher, sinon.match.same(oUpdateData));
        this.oRequestorMock.expects("relocateAll").withExactArgs("$parked.group", "group", oEntityMatcher);
        oHelperMock.expects("buildPath").withExactArgs("~original~", oFixture.sEntityPath).returns("~");
        oRequestCall = this.oRequestorMock.expects("request").withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar", sinon.match.same(oGroupLock), Object.assign({ "If-Match": oEntityMatcher }, oFixture.$$patchWithoutSideEffects && { Prefer: "return=minimal" }), sinon.match.same(oUpdateData), sinon.match.func, sinon.match.func, undefined, "~", undefined).returns(oPatchPromise);
        oHelperMock.expects("addByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise));
        oPatchPromise.then(function () {
            var sMetaPath = {}, sPath = {};
            oHelperMock.expects("removeByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise));
            oHelperMock.expects("buildPath").exactly(iExpectedCalls).withExactArgs("/BusinessPartnerList", sEntityPath).returns(sPath);
            oHelperMock.expects("getMetaPath").exactly(iExpectedCalls).withExactArgs(sinon.match.same(sPath)).returns(sMetaPath);
            oCacheMock.expects("visitResponse").exactly(iExpectedCalls).withExactArgs(sinon.match.same(oPatchResult), sinon.match.same(mTypeForMetaPath), sinon.match.same(sMetaPath), sEntityPath);
            oUpdateExistingCall = oHelperMock.expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath, oEntityMatcher, oFixture.$$patchWithoutSideEffects ? { "@odata.etag": oPatchResult["@odata.etag"] } : sinon.match.same(oPatchResult));
            oUnlockCall = that.mock(oRequestLock).expects("unlock").withExactArgs();
        }, function () {
            oCacheMock.expects("visitResponse").never();
            oHelperMock.expects("removeByPath").twice().withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise));
            oStaticCacheMock.expects("makeUpdateData").withExactArgs(["Address", "City"], "Heidelberg").returns(oOldData);
            oHelperMock.expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath, oEntityMatcher, sinon.match.same(oOldData));
            oRequestCall.args[0][6]();
        });
        oCacheUpdatePromise = oCache.update(oGroupLock, "Address/City", "Walldorf", fnError, "/~/BusinessPartnerList('0')", sEntityPath, undefined, oFixture.$$patchWithoutSideEffects, fnPatchSent).then(function (oResult) {
            sinon.assert.notCalled(fnError);
            assert.strictEqual(bCanceled, false);
            assert.strictEqual(oResult, undefined, "no result");
            if (oUpdateExistingCall.called) {
                assert.ok(oUpdateExistingCall.calledBefore(oUnlockCall), "cache update happens before unlock");
            }
        }, function (oResult) {
            sinon.assert.notCalled(fnError);
            assert.strictEqual(bCanceled, true);
            assert.strictEqual(oResult, oError);
        });
        if (oFixture.$cached) {
            assert.deepEqual(oCache.oPromise.getResult(), { "@odata.etag": "*" });
        }
        this.mock(this.oRequestor).expects("lockGroup").withExactArgs("group", sinon.match.same(oCache), true).returns(oRequestLock);
        assert.ok(fnPatchSent.notCalled, "patchSent handler not yet called");
        oRequestCall.args[0][5]();
        assert.ok(fnPatchSent.calledOnceWithExactly(), "patchSent handler called once");
        return oCacheUpdatePromise;
    });
});
[undefined, SyncPromise.resolve()].forEach(function (oPromise) {
    var sTitle = "_Cache#update: oError.$cached but this.oPromise === " + oPromise;
    QUnit.test(sTitle, function (assert) {
        var oCache = new _Cache(this.oRequestor, "BusinessPartnerList"), oError = new Error();
        oError.$cached = true;
        oCache.oPromise = oPromise;
        oCache.fetchValue = function () { };
        this.mock(oCache).expects("checkSharedRequest").withExactArgs();
        this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity").throws(oError);
        assert.throws(function () {
            oCache.update({}, "Address/City", "Walldorf", null, "/~/BusinessPartnerList('0')", "path/to/entity");
        }, oError);
        assert.strictEqual(oCache.oPromise, oPromise);
    });
});
[false, true].forEach(function (bTransient) {
    ["EUR", "", undefined].forEach(function (sUnitOrCurrencyValue, i) {
        QUnit.test("_Cache#update: updates unit, " + bTransient + ", " + i, function (assert) {
            var mQueryOptions = {}, oCache = new _Cache(this.oRequestor, "ProductList", mQueryOptions, true), oCacheMock = this.mock(oCache), oEntity = {
                "@odata.etag": "W/\"19700101000000.0000000\"",
                "ProductInfo": {
                    "Amount": "123"
                }
            }, fnError = this.spy(), oGroupLock = {
                getGroupId: function () { },
                unlock: function () { }
            }, oHelperMock = this.mock(_Helper), oPatchResult = {}, oPatchPromise = Promise.resolve(oPatchResult), oPostBody = {}, oStaticCacheMock = this.mock(_Cache), oUnitUpdateData = {}, oUpdateData = {};
            if (bTransient) {
                _Helper.setPrivateAnnotation(oEntity, "postBody", oPostBody);
                _Helper.setPrivateAnnotation(oEntity, "transient", "group");
            }
            oCache.fetchValue = function () { };
            oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity").returns(SyncPromise.resolve(oEntity));
            this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
            oStaticCacheMock.expects("makeUpdateData").withExactArgs(["ProductInfo", "Amount"], "123").returns(oUpdateData);
            oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity", sinon.match.same(oEntity), sinon.match.same(oUpdateData));
            if (bTransient) {
                oHelperMock.expects("updateAll").withExactArgs({}, "path/to/entity", sinon.match.same(oPostBody), sinon.match.same(oUpdateData));
            }
            oCacheMock.expects("getValue").withExactArgs("path/to/entity/Pricing/Currency").returns(sUnitOrCurrencyValue);
            if (sUnitOrCurrencyValue === undefined) {
                this.oLogMock.expects("debug").withExactArgs("Missing value for unit of measure path/to/entity/Pricing/Currency " + "when updating path/to/entity/ProductInfo/Amount", oCache.toString(), sClassName);
            }
            else {
                oStaticCacheMock.expects("makeUpdateData").withExactArgs(["Pricing", "Currency"], sUnitOrCurrencyValue).returns(oUnitUpdateData);
                this.mock(_Helper).expects("merge").withExactArgs(sinon.match.same(bTransient ? oPostBody : oUpdateData), sinon.match.same(oUnitUpdateData));
            }
            if (bTransient) {
                this.mock(oGroupLock).expects("unlock").withExactArgs();
            }
            else {
                this.oRequestorMock.expects("buildQueryString").withExactArgs("/ProductList", sinon.match.same(mQueryOptions), true).returns("");
                this.oRequestorMock.expects("request").withExactArgs("PATCH", "ProductList('0')", sinon.match.same(oGroupLock), { "If-Match": sinon.match.same(oEntity) }, sinon.match.same(oUpdateData), sinon.match.func, sinon.match.func, undefined, oCache.sResourcePath + "/path/to/entity", undefined).returns(oPatchPromise);
                oPatchPromise.then(function () {
                    oHelperMock.expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity", sinon.match.same(oEntity), sinon.match.same(oPatchResult));
                });
            }
            return oCache.update(oGroupLock, "ProductInfo/Amount", "123", fnError, "ProductList('0')", "path/to/entity", "Pricing/Currency").then(function (oResult) {
                sinon.assert.notCalled(fnError);
                assert.strictEqual(oResult, undefined, "no result");
            });
        });
    });
});
[{
        bCanceled: false,
        sGroupSubmitMode: "API"
    }, {
        bCanceled: true,
        sGroupSubmitMode: "API"
    }, {
        bCanceled: false,
        sGroupSubmitMode: "Auto"
    }, {
        bCanceled: true,
        sGroupSubmitMode: "Auto"
    }, {
        bCanceled: false,
        sGroupSubmitMode: "Auto",
        bHasChanges: true
    }].forEach(function (oFixture) {
    var bCanceled = oFixture.bCanceled, sGroupSubmitMode = oFixture.sGroupSubmitMode, sTitle = "_Cache#update: failure for group submit mode " + sGroupSubmitMode + ", then " + (bCanceled ? "cancel" : "success") + ", has changes: " + oFixture.bHasChanges;
    QUnit.test(sTitle, function (assert) {
        var mQueryOptions = {}, oCache = new _Cache(this.oRequestor, "BusinessPartnerList", mQueryOptions), oCacheMock = this.mock(oCache), oCacheUpdatePromise, oEntity = {
            "@odata.etag": "W/\"19700101000000.0000000\"",
            "Address": {
                "City": "Heidelberg"
            }
        }, sEntityPath = "path/to/entity", fnError = this.spy(), oError1 = new Error(), oError2 = new Error(), mTypeForMetaPath = {}, oFetchTypesPromise = SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)), sFullPath = "path/to/entity/Address/City", oGroupLock = {
            getGroupId: function () { }
        }, oHelperMock = this.mock(_Helper), oOldData = {}, oPatchResult = {}, oPatchPromise = Promise.reject(oError1), oPatchPromise2 = bCanceled ? Promise.reject(oError2) : Promise.resolve(oPatchResult), fnPatchSent = function () { }, bPatchWithoutSideEffects, oRequestCall, oRequestLock = { unlock: function () { } }, oStaticCacheMock = this.mock(_Cache), sUnitOrCurrencyPath, oUnlockCall, oUpdateData = {}, that = this;
        oError2.canceled = true;
        oCache.fetchValue = function () { };
        oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), sEntityPath).returns(SyncPromise.resolve(oEntity));
        oCacheMock.expects("fetchTypes").exactly(2).withExactArgs().returns(oFetchTypesPromise);
        oHelperMock.expects("buildPath").withExactArgs(sEntityPath, "Address/City").returns(sFullPath);
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/BusinessPartnerList", sinon.match.same(mQueryOptions), true).returns("?foo=bar");
        oStaticCacheMock.expects("makeUpdateData").withExactArgs(["Address", "City"], "Walldorf").returns(oUpdateData);
        oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath, sinon.match.same(oEntity), sinon.match.same(oUpdateData));
        oHelperMock.expects("buildPath").twice().withExactArgs(oCache.sResourcePath, sEntityPath).returns("~");
        oRequestCall = this.oRequestorMock.expects("request").withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar", sinon.match.same(oGroupLock), { "If-Match": sinon.match.same(oEntity) }, sinon.match.same(oUpdateData), sinon.match.func, sinon.match.func, undefined, "~", undefined).returns(oPatchPromise);
        oHelperMock.expects("addByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise));
        SyncPromise.all([
            oPatchPromise,
            oFetchTypesPromise
        ]).catch(function () {
            var oRequestGroupLock = {};
            oHelperMock.expects("removeByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise));
            that.oRequestorMock.expects("getGroupSubmitMode").withExactArgs("group").returns(sGroupSubmitMode);
            that.oRequestorMock.expects("hasChanges").exactly(sGroupSubmitMode === "Auto" ? 1 : 0).withExactArgs("group", sinon.match.same(oEntity)).returns(oFixture.bHasChanges);
            oUnlockCall = that.mock(oRequestLock).expects("unlock").withExactArgs();
            that.oRequestorMock.expects("lockGroup").withExactArgs(sGroupSubmitMode === "API" || oFixture.bHasChanges ? "group" : "$parked.group", sinon.match.same(oCache), true, true).returns(oRequestGroupLock);
            oRequestCall = that.oRequestorMock.expects("request").withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar", sinon.match.same(oRequestGroupLock), { "If-Match": sinon.match.same(oEntity) }, sinon.match.same(oUpdateData), sinon.match.func, sinon.match.func, undefined, "~", true).returns(oPatchPromise2);
            oHelperMock.expects("addByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise2));
            SyncPromise.all([
                oPatchPromise2,
                oFetchTypesPromise
            ]).then(function () {
                var sMetaPath = {}, sPath = {};
                oHelperMock.expects("removeByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise2));
                oHelperMock.expects("buildPath").withExactArgs("/BusinessPartnerList", sEntityPath).returns(sPath);
                oHelperMock.expects("getMetaPath").withExactArgs(sinon.match.same(sPath)).returns(sMetaPath);
                oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oPatchResult), sinon.match.same(mTypeForMetaPath), sinon.match.same(sMetaPath), sEntityPath);
                oHelperMock.expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath, sinon.match.same(oEntity), sinon.match.same(oPatchResult));
            }, function () {
                oHelperMock.expects("removeByPath").twice().withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath, sinon.match.same(oPatchPromise2));
                oStaticCacheMock.expects("makeUpdateData").withExactArgs(["Address", "City"], "Heidelberg").returns(oOldData);
                oHelperMock.expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath, sinon.match.same(oEntity), sinon.match.same(oOldData));
                oRequestCall.args[0][6]();
            });
        });
        oCacheUpdatePromise = oCache.update(oGroupLock, "Address/City", "Walldorf", fnError, "/~/BusinessPartnerList('0')", "path/to/entity", sUnitOrCurrencyPath, bPatchWithoutSideEffects, fnPatchSent).then(function (oResult) {
            assert.notOk(bCanceled);
            sinon.assert.calledOnce(fnError);
            sinon.assert.calledWithExactly(fnError, oError1);
            assert.strictEqual(oResult, undefined, "no result");
            assert.ok(oUnlockCall.calledBefore(oRequestCall), "unlock called before second PATCH request");
        }, function (oResult) {
            assert.ok(bCanceled);
            sinon.assert.calledOnce(fnError);
            sinon.assert.calledWithExactly(fnError, oError1);
            assert.strictEqual(oResult, oError2);
        });
        this.oRequestorMock.expects("lockGroup").withExactArgs("group", sinon.match.same(oCache), true).returns(oRequestLock);
        oRequestCall.args[0][5]();
        return oCacheUpdatePromise;
    });
});
QUnit.test("_Cache#update: failure, group submit mode Direct", function (assert) {
    var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}), oCacheMock = this.mock(oCache), oCacheUpdatePromise, oEntity = {
        "@odata.etag": "W/\"19700101000000.0000000\"",
        "Address": {
            "City": "Heidelberg"
        }
    }, fnError = this.spy(), oError = new Error(), oGroupLock = { getGroupId: function () { } }, oPatchPromise = Promise.reject(oError), oRequestCall, oRequestLock = { unlock: function () { } }, oUpdateData = {
        "Address": {
            "City": "Walldorf"
        }
    }, that = this;
    oCache.fetchValue = function () { };
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "('0')/path/to/entity").returns(SyncPromise.resolve(oEntity));
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
    oRequestCall = this.oRequestorMock.expects("request").withExactArgs("PATCH", "/~/BusinessPartnerList('0')", sinon.match.same(oGroupLock), { "If-Match": sinon.match.same(oEntity) }, oUpdateData, sinon.match.func, sinon.match.func, undefined, oCache.sResourcePath + "('0')/path/to/entity", undefined).returns(oPatchPromise);
    this.mock(_Helper).expects("addByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), "('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));
    this.oRequestorMock.expects("getGroupSubmitMode").withExactArgs("group").returns("Direct");
    this.mock(_Helper).expects("removeByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), "('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));
    oPatchPromise.catch(function () {
        that.mock(oRequestLock).expects("unlock").withExactArgs();
    });
    oCacheUpdatePromise = oCache.update(oGroupLock, "Address/City", "Walldorf", fnError, "/~/BusinessPartnerList('0')", "('0')/path/to/entity", undefined, undefined, function fnPatchSent() { }).then(function () {
        assert.ok(false);
    }, function (oResult) {
        sinon.assert.calledOnce(fnError);
        sinon.assert.calledWithExactly(fnError, oError);
        assert.strictEqual(oResult, oError);
    });
    this.mock(this.oRequestor).expects("lockGroup").withExactArgs("group", sinon.match.same(oCache), true).returns(oRequestLock);
    oRequestCall.args[0][5]();
    return oCacheUpdatePromise;
});
QUnit.test("_Cache#update: failure w/o fnErrorCallback", function (assert) {
    var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}), oEntity = {
        "@odata.etag": "W/\"19700101000000.0000000\"",
        "Address": {
            "City": "Heidelberg"
        }
    }, oError = new Error(), oGroupLock = { getGroupId: function () { } }, oPatchPromise = Promise.reject(oError), oUpdateData = {
        "Address": {
            "City": "Walldorf"
        }
    };
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "('0')/path/to/entity").returns(SyncPromise.resolve(oEntity));
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
    this.oRequestorMock.expects("request").withExactArgs("PATCH", "/~/BusinessPartnerList('0')", sinon.match.same(oGroupLock), { "If-Match": sinon.match.same(oEntity) }, oUpdateData, sinon.match.func, sinon.match.func, undefined, oCache.sResourcePath + "('0')/path/to/entity", undefined).returns(oPatchPromise);
    this.mock(_Helper).expects("addByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), "('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));
    this.oRequestorMock.expects("getGroupSubmitMode").never();
    this.mock(_Helper).expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), "('0')/path/to/entity", sinon.match.same(oEntity), { Address: { City: "Heidelberg" } });
    this.mock(_Helper).expects("removeByPath").withExactArgs(sinon.match.same(oCache.mPatchRequests), "('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));
    return oCache.update(oGroupLock, "Address/City", "Walldorf", undefined, "/~/BusinessPartnerList('0')", "('0')/path/to/entity", undefined, undefined, function () { }).then(function () {
        assert.ok(false);
    }, function (oResult) {
        assert.strictEqual(oResult, oError);
    });
});
QUnit.test("_Cache#update: invalid entity path", function (assert) {
    var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}), oGroupLock = { getGroupId: function () { } };
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity").returns(SyncPromise.resolve(undefined));
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
    return oCache.update(oGroupLock, "foo", "bar", this.mock().never(), "/~/BusinessPartnerList('0')", "path/to/entity").then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Cannot update 'foo': 'path/to/entity' does not exist");
    });
});
QUnit.test("_Cache#update: unexpected error", function (assert) {
    var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}), oError = new Error("This call intentionally failed");
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity").throws(oError);
    assert.throws(function () {
        oCache.update(null, "foo", "bar", this.mock().never(), "/n/a", "path/to/entity");
    }, oError);
});
QUnit.test("Cache#fetchType", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), mTypeForMetaPath = {}, oType = {};
    this.oRequestorMock.expects("fetchTypeForPath").withExactArgs("/TEAMS").returns(SyncPromise.resolve(Promise.resolve(oType)));
    this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").withExactArgs("/TEAMS/@com.sap.vocabularies.Common.v1.Messages").returns(SyncPromise.resolve(undefined));
    return oCache.fetchType(mTypeForMetaPath, "/TEAMS").then(function (oResult) {
        assert.strictEqual(oResult, oType);
        assert.strictEqual(mTypeForMetaPath["/TEAMS"], oType);
    });
});
QUnit.test("Cache#fetchType: no type", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), mTypeForMetaPath = {};
    this.oRequestorMock.expects("fetchTypeForPath").withExactArgs("/TEAMS/Unknown").returns(SyncPromise.resolve(undefined));
    this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").never();
    return oCache.fetchType(mTypeForMetaPath, "/TEAMS/Unknown").then(function (oResult) {
        assert.strictEqual(oResult, undefined);
        assert.notOk("/TEAMS/Unknown" in mTypeForMetaPath);
    });
});
QUnit.test("Cache#fetchType: message annotation", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oMessageAnnotation = {}, mTypeForMetaPath = {}, oType = {};
    this.oRequestorMock.expects("fetchTypeForPath").withExactArgs("/TEAMS").returns(SyncPromise.resolve(Promise.resolve(oType)));
    this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").withExactArgs("/TEAMS/@com.sap.vocabularies.Common.v1.Messages").returns(SyncPromise.resolve(oMessageAnnotation));
    return oCache.fetchType(mTypeForMetaPath, "/TEAMS").then(function (oResult) {
        assert.strictEqual(mTypeForMetaPath["/TEAMS"], oResult);
        assert.ok(oType.isPrototypeOf(oResult));
        assert.strictEqual(oResult["@com.sap.vocabularies.Common.v1.Messages"], oMessageAnnotation);
    });
});
QUnit.test("Cache#fetchType: complex key", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oCacheMock = this.mock(oCache), bKey1Done = false, bKey2Done = false, mTypeForMetaPath = {}, oType = { $Key: [{ key1: "a/b/id" }, "key2", { key3: "c/id" }] }, oTypeKey1Promise = new SyncPromise(function (resolve) {
        setTimeout(function () {
            bKey1Done = true;
            resolve({});
        });
    }), oTypeKey2Promise = new SyncPromise(function (resolve) {
        setTimeout(function () {
            bKey2Done = true;
            resolve({});
        });
    });
    oCacheMock.expects("fetchType").withExactArgs(sinon.match.same(mTypeForMetaPath), "/TEAMS").callThrough();
    this.oRequestorMock.expects("fetchTypeForPath").withExactArgs("/TEAMS").returns(SyncPromise.resolve(Promise.resolve(oType)));
    this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").withExactArgs("/TEAMS/@com.sap.vocabularies.Common.v1.Messages").returns(SyncPromise.resolve(undefined));
    oCacheMock.expects("fetchType").withExactArgs(sinon.match.same(mTypeForMetaPath), "/TEAMS/a/b").returns(oTypeKey1Promise);
    oCacheMock.expects("fetchType").withExactArgs(sinon.match.same(mTypeForMetaPath), "/TEAMS/c").returns(oTypeKey2Promise);
    return oCache.fetchType(mTypeForMetaPath, "/TEAMS").then(function (oResult) {
        assert.strictEqual(oResult, oType);
        assert.strictEqual(mTypeForMetaPath["/TEAMS"], oType);
        assert.ok(bKey1Done);
        assert.ok(bKey2Done);
    });
});
[{
        options: undefined,
        types: ["/TEAMS"]
    }, {
        options: { $select: ["foo"] },
        types: ["/TEAMS"]
    }, {
        options: {
            $expand: {
                "MANAGER": null,
                "TEAM_2_EMPLOYEES": {
                    $expand: {
                        "EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT": null,
                        "Address/Country": null
                    }
                }
            }
        },
        types: [
            "/TEAMS",
            "/TEAMS/MANAGER",
            "/TEAMS/TEAM_2_EMPLOYEES",
            "/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT",
            "/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT",
            "/TEAMS/TEAM_2_EMPLOYEES/Address",
            "/TEAMS/TEAM_2_EMPLOYEES/Address/Country"
        ]
    }].forEach(function (oFixture, i) {
    QUnit.test("Cache#fetchTypes #" + i, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS('42')", oFixture.options), oCacheMock = this.mock(oCache), iCount = 0, aExpectations = oFixture.types.map(function (sPath) {
            return oCacheMock.expects("fetchType").withExactArgs(sinon.match.object, sPath).returns(new Promise(function (resolve) {
                setTimeout(function () {
                    iCount += 1;
                    resolve();
                });
            }));
        }), oPromise;
        oPromise = oCache.fetchTypes();
        assert.strictEqual(oCache.fetchTypes(), oPromise, "second call returns same promise");
        return oPromise.then(function (mTypeForMetaPath) {
            aExpectations.forEach(function (oExpectation) {
                assert.strictEqual(oExpectation.args[0][0], mTypeForMetaPath);
            });
            assert.strictEqual(iCount, aExpectations.length);
        });
    });
});
QUnit.test("Cache#visitResponse: key predicates: ignore simple values", function () {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')/Foo"), oCacheMock = this.mock(oCache), oInstance = { results: ["Business Suite"] }, mTypeForMetaPath = {};
    oCacheMock.expects("calculateKeyPredicate").never();
    oCache.visitResponse("Business Suite", mTypeForMetaPath);
    oCache.visitResponse({ value: ["Business Suite"] }, mTypeForMetaPath, undefined, undefined, undefined, 0);
    oCache.visitResponse(undefined, mTypeForMetaPath);
    oCache.visitResponse(null, mTypeForMetaPath);
    oCache.visitResponse("", mTypeForMetaPath);
    oCache.visitResponse(true, mTypeForMetaPath);
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oInstance), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo").twice();
    oCache.visitResponse(oInstance, mTypeForMetaPath);
    oCache.visitResponse({ value: [oInstance] }, mTypeForMetaPath, undefined, undefined, undefined, 0);
});
QUnit.test("Cache#visitResponse: key predicates: simple entity", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oEntity = {}, sPredicate = "('4711')", mTypeForMetaPath = { "/TEAMS": { $Key: [] } };
    this.mock(_Helper).expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity), "/TEAMS", sinon.match.same(mTypeForMetaPath)).returns(sPredicate);
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse(oEntity, mTypeForMetaPath);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate);
});
QUnit.test("Cache#visitResponse: key predicates: with root entity meta path", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oEntity = {}, sPredicate = "('4711')", mTypeForMetaPath = { "/~/$Type": { $Key: [] } };
    this.mock(_Helper).expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity), "/~/$Type", sinon.match.same(mTypeForMetaPath)).returns(sPredicate);
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse(oEntity, mTypeForMetaPath, "/~/$Type");
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate);
});
QUnit.test("Cache#visitResponse: key predicates: nested", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oEntity = {
        bar: {
            baz: {}
        },
        property: {
            navigation: {}
        },
        no: 4,
        noType: {},
        qux: null
    }, oHelperMock = this.mock(_Helper), sPredicate1 = "(foo='4711')", sPredicate2 = "(bar='42')", sPredicate3 = "(baz='67')", sPredicate4 = "(entity='23')", mTypeForMetaPath = {
        "/TEAMS": { $Key: [] },
        "/TEAMS/bar": { $Key: [] },
        "/TEAMS/bar/baz": { $Key: [] },
        "/TEAMS/property": {},
        "/TEAMS/property/navigation": { $Key: [] },
        "/TEAMS/qux": { $Key: [] }
    };
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity), "/TEAMS", sinon.match.same(mTypeForMetaPath)).returns(sPredicate1);
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity.bar), "/TEAMS/bar", sinon.match.same(mTypeForMetaPath)).returns(sPredicate2);
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity.bar.baz), "/TEAMS/bar/baz", sinon.match.same(mTypeForMetaPath)).returns(sPredicate3);
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity.property.navigation), "/TEAMS/property/navigation", sinon.match.same(mTypeForMetaPath)).returns(sPredicate4);
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse(oEntity, mTypeForMetaPath);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate1);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar, "predicate"), sPredicate2);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar.baz, "predicate"), sPredicate3);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.property, "predicate"), undefined);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.property.navigation, "predicate"), sPredicate4);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.noType, "predicate"), undefined);
});
QUnit.test("Cache#visitResponse: key predicates: entity collection", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oEntity = {
        bar: [{}, {}]
    }, oHelperMock = this.mock(_Helper), sPredicate1 = "(foo='4711')", sPredicate2 = "(bar='42')", mTypeForMetaPath = {
        "/TEAMS": { $Key: [] },
        "/TEAMS/bar": { $Key: [] }
    };
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity), "/TEAMS", sinon.match.same(mTypeForMetaPath)).returns(sPredicate1);
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity.bar[0]), "/TEAMS/bar", sinon.match.same(mTypeForMetaPath)).returns(sPredicate2);
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity.bar[1]), "/TEAMS/bar", sinon.match.same(mTypeForMetaPath)).returns(undefined);
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse(oEntity, mTypeForMetaPath);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate1);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar[0], "predicate"), sPredicate2);
    assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar[1], "predicate"), undefined);
    assert.strictEqual(oEntity.bar.$byPredicate[sPredicate2], oEntity.bar[0]);
    assert.notOk(undefined in oEntity.bar.$byPredicate);
});
QUnit.test("Cache#visitResponse: reportStateMessages; single entity", function () {
    var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')"), aMessagesInBusinessPartner = [{}], aMessagesSalesOrder = [{}], aMessagesSalesOrderSchedules0 = [{}], aMessagesSalesOrderSchedules1 = [{}], aMessagesEmpty = [], oData = {
        messagesInSalesOrder: aMessagesSalesOrder,
        SO_2_BP: {
            messagesInBusinessPartner: aMessagesInBusinessPartner
        },
        SO_2_SCHDL: [{
                messagesInSalesOrderSchedule: aMessagesSalesOrderSchedules0,
                ScheduleKey: "42"
            }, {
                ScheduleKey: "43"
            }, {
                messagesInSalesOrderSchedule: aMessagesSalesOrderSchedules1,
                ScheduleKey: "44"
            }, {
                messagesInSalesOrderSchedule: null,
                ScheduleKey: "45"
            }, {
                messagesInSalesOrderSchedule: aMessagesEmpty,
                ScheduleKey: "46"
            }]
    }, mExpectedMessages = {
        "": aMessagesSalesOrder,
        "SO_2_BP": aMessagesInBusinessPartner,
        "SO_2_SCHDL('42')": aMessagesSalesOrderSchedules0,
        "SO_2_SCHDL('44')": aMessagesSalesOrderSchedules1
    }, mTypeForMetaPath = {
        "/SalesOrderList": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messagesInSalesOrder" }
        },
        "/SalesOrderList/SO_2_BP": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messagesInBusinessPartner" }
        },
        "/SalesOrderList/SO_2_SCHDL": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messagesInSalesOrderSchedule" },
            $Key: ["ScheduleKey"],
            ScheduleKey: {
                $Type: "Edm.String"
            }
        }
    };
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, undefined);
    oCache.visitResponse(oData, mTypeForMetaPath);
});
QUnit.test("Cache#visitResponse: reportStateMessages; nested; to 1 navigation property", function () {
    var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')"), aMessagesInBusinessPartner = [{}], oData = {
        messagesInBusinessPartner: aMessagesInBusinessPartner
    }, mExpectedMessages = {
        "SO_2_BP": aMessagesInBusinessPartner
    }, mTypeForMetaPath = {
        "/SalesOrderList/SO_2_BP": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messagesInBusinessPartner" }
        }
    };
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, ["SO_2_BP"]);
    oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList/SO_2_BP", "SO_2_BP");
});
QUnit.test("Cache#visitResponse: reportStateMessages; nested; collection entity", function () {
    var oCache = new _Cache(this.oRequestor, "SalesOrderList"), aMessagesInBusinessPartner = [{}], oData = {
        messagesInBusinessPartner: aMessagesInBusinessPartner
    }, mExpectedMessages = {
        "('0500000001')/SO_2_BP": aMessagesInBusinessPartner
    }, mTypeForMetaPath = {
        "/SalesOrderList/SO_2_BP": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messagesInBusinessPartner" }
        }
    };
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, ["('0500000001')/SO_2_BP"]);
    oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList/SO_2_BP", "('0500000001')/SO_2_BP");
});
[undefined, false, true].forEach(function (bKeepTransientPath) {
    var sTitle = "Cache#visitResponse: reportStateMessages for new entity" + ", keep transient path: " + bKeepTransientPath;
    QUnit.test(sTitle, function () {
        var oCache = new _Cache(this.oRequestor, "SalesOrderList"), aMessages = [{}], oData = {
            Messages: aMessages,
            SalesOrderID: "0500000001"
        }, mExpectedMessages = {}, sTransientPredicate = "($uid=id-1-23)", sMessagePath = bKeepTransientPath !== false ? sTransientPredicate : "('0500000001')", mTypeForMetaPath = {
            "/SalesOrderList": {
                "@com.sap.vocabularies.Common.v1.Messages": { $Path: "Messages" },
                $Key: ["SalesOrderID"],
                SalesOrderID: {
                    $Type: "Edm.String"
                }
            }
        };
        if (bKeepTransientPath === undefined) {
            delete oData.SalesOrderID;
        }
        mExpectedMessages[sMessagePath] = aMessages;
        this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, [sMessagePath]);
        oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList", sTransientPredicate, bKeepTransientPath);
    });
});
QUnit.test("Cache#visitResponse: reportStateMessages for new nested entity", function () {
    var oCache = new _Cache(this.oRequestor, "SalesOrderList"), aMessages = [{}], oData = {
        ItemPosition: "42",
        Messages: aMessages,
        SalesOrderID: "0500000001"
    }, mExpectedMessages = {
        "('0500000001')/SO_2_SOITEM(SalesOrderID='0500000001',ItemPosition='42')": aMessages
    }, sTransientPredicate = "($uid=id-1-23)", mTypeForMetaPath = {
        "/SalesOrderList/SO_2_SOITEM": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "Messages" },
            $Key: ["SalesOrderID", "ItemPosition"],
            ItemPosition: {
                $Type: "Edm.String"
            },
            SalesOrderID: {
                $Type: "Edm.String"
            }
        }
    };
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, ["('0500000001')/SO_2_SOITEM(SalesOrderID='0500000001',ItemPosition='42')"]);
    oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList/SO_2_SOITEM", "('0500000001')/SO_2_SOITEM" + sTransientPredicate);
});
QUnit.test("Cache#visitResponse: no reportStateMessages if message property is not selected", function () {
    var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')");
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse({}, {
        "/SalesOrderList": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messagesInSalesOrder" }
        }
    });
});
QUnit.test("Cache#visitResponse: no reportStateMessages; message in complex type", function () {
    var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')"), oData = {};
    this.mock(_Helper).expects("drillDown").withExactArgs(oData, ["foo", "bar", "messages"]).returns();
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse(oData, {
        "/SalesOrderList": {
            "@com.sap.vocabularies.Common.v1.Messages": { $Path: "foo/bar/messages" }
        }
    });
});
[
    { iStart: 0, bPredicate: false },
    { iStart: 13, bPredicate: false },
    { iStart: 23, bPredicate: true }
].forEach(function (oFixture) {
    var sTitle = "visitResponse: reportStateMessages; collection with" + (oFixture.bPredicate ? "" : "out") + " key properties, iStart=" + oFixture.iStart;
    QUnit.test(sTitle, function () {
        var oCache = new _Cache(this.oRequestor, "SalesOrderList"), sFirst, oHelperMock = this.mock(_Helper), aKeySegments = ["SalesOrderID"], aMessagePathSegments = ["messagesInSalesOrder"], aMessagesSalesOrder0 = [{}], aMessagesSalesOrder1 = [{}], oData = {
            value: [{
                    messagesInSalesOrder: aMessagesSalesOrder0
                }, {
                    messagesInSalesOrder: aMessagesSalesOrder1
                }, {
                    messagesInSalesOrder: []
                }]
        }, mExpectedMessages = {}, sSecond, sThird, mTypeForMetaPath = {
            "/SalesOrderList": {
                "@com.sap.vocabularies.Common.v1.Messages": {
                    $Path: "messagesInSalesOrder"
                },
                $Key: ["SalesOrderID"],
                SalesOrderID: {
                    $Type: "Edm.String"
                }
            }
        };
        if (oFixture.bPredicate) {
            oData.value[0].SalesOrderID = "42";
            oData.value[1].SalesOrderID = "43";
            oData.value[2].SalesOrderID = "44";
            sFirst = "('42')";
            sSecond = "('43')";
            sThird = "('44')";
        }
        else {
            sFirst = oFixture.iStart.toString();
            sSecond = (oFixture.iStart + 1).toString();
            sThird = (oFixture.iStart + 2).toString();
        }
        mExpectedMessages[sFirst] = aMessagesSalesOrder0;
        mExpectedMessages[sSecond] = aMessagesSalesOrder1;
        mExpectedMessages[sFirst].$count = 1;
        mExpectedMessages[sFirst].$byPredicate = {};
        mExpectedMessages[sSecond].$count = 0;
        mExpectedMessages[sSecond].$byPredicate = {};
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0], aKeySegments).returns(oData.value[0].SalesOrderID);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[1], aKeySegments).returns(oData.value[1].SalesOrderID);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[2], aKeySegments).returns(oData.value[2].SalesOrderID);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0], aMessagePathSegments).returns(aMessagesSalesOrder0);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[1], aMessagePathSegments).returns(aMessagesSalesOrder1);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[2], aMessagePathSegments).returns([]);
        this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, [sFirst, sSecond, sThird]);
        oCache.visitResponse(oData, mTypeForMetaPath, undefined, undefined, undefined, oFixture.iStart);
    });
});
[true, false].forEach(function (bPredicate) {
    var sTitle = "visitResponse: reportStateMessages; nested collection, key properties: " + bPredicate;
    QUnit.test(sTitle, function () {
        var oCache = new _Cache(this.oRequestor, "SalesOrderList"), oHelperMock = this.mock(_Helper), aMessages = [{}], oData = {
            value: [{
                    SO_2_SOITEM: [{
                            messages: []
                        }, {
                            messages: aMessages
                        }]
                }]
        }, mExpectedMessages = {}, mTypeForMetaPath = {
            "/SalesOrderList": {
                $Key: ["SalesOrderID"],
                SalesOrderID: {
                    $Type: "Edm.String"
                }
            },
            "/SalesOrderList/SO_2_SOITEM": {
                "@com.sap.vocabularies.Common.v1.Messages": {
                    $Path: "messages"
                },
                $Key: ["SalesOrderItemID"],
                SalesOrderItemID: {
                    $Type: "Edm.String"
                }
            }
        };
        if (bPredicate) {
            oData.value[0].SalesOrderID = "42";
            oData.value[0].SO_2_SOITEM[0].SalesOrderItemID = "42.0";
            oData.value[0].SO_2_SOITEM[1].SalesOrderItemID = "42.1";
        }
        mExpectedMessages[bPredicate ? "('42')/SO_2_SOITEM('42.1')" : "5/SO_2_SOITEM/1"] = aMessages;
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0], ["SalesOrderID"]).returns(oData.value[0].SalesOrderID);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0].SO_2_SOITEM[0], ["SalesOrderItemID"]).returns(oData.value[0].SO_2_SOITEM[0].SalesOrderItemID);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0].SO_2_SOITEM[1], ["SalesOrderItemID"]).returns(oData.value[0].SO_2_SOITEM[1].SalesOrderItemID);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0].SO_2_SOITEM[0], ["messages"]).returns([]);
        oHelperMock.expects("drillDown").withExactArgs(oData.value[0].SO_2_SOITEM[1], ["messages"]).returns(aMessages);
        this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, [bPredicate ? "('42')" : "5"]);
        oCache.visitResponse(oData, mTypeForMetaPath, undefined, undefined, undefined, 5);
    });
});
QUnit.test("_Cache#visitResponse: longtextUrl/media link, no context", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation"), oData = {
        "id": "1",
        "picture1@odata.mediaReadLink": "img_1.jpg",
        "picture2@mediaReadLink": "img_2.jpg",
        "messages": [{
                "longtextUrl": "Longtext(1)"
            }]
    }, mExpectedMessages = {
        "": [{ longtextUrl: "/~/EntitySet('42')/Longtext(1)" }]
    }, oType = {
        "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messages" },
        $Key: ["id"],
        id: {
            $Type: "Edm.Int32"
        }
    }, mTypeForMetaPath = {
        "/EntitySet/Navigation": oType
    };
    mExpectedMessages[""].$count = 1;
    mExpectedMessages[""].$created = 0;
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, undefined);
    oCache.visitResponse(oData, mTypeForMetaPath);
    assert.strictEqual(oData["picture1@odata.mediaReadLink"], "/~/EntitySet('42')/img_1.jpg");
    assert.strictEqual(oData["picture2@mediaReadLink"], "/~/EntitySet('42')/img_2.jpg");
});
QUnit.test("_Cache#visitResponse: longtextUrl/media link, single response", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation"), oData = {
        "@odata.context": "../$metadata#foo",
        "id": "1",
        "picture@odata.mediaReadLink": "img_42.jpg",
        "messages": [{
                "longtextUrl": "Longtext(1)"
            }],
        foo: {
            "@odata.context": "/foo/context",
            "id": "2",
            "picture@odata.mediaReadLink": "img_43.jpg",
            "messages": [{
                    "longtextUrl": "Longtext(2)"
                }],
            bar: {
                id: "3",
                "picture@odata.mediaReadLink": "img_44.jpg",
                "messages": [{
                        "longtextUrl": "Longtext(3)"
                    }]
            },
            baz: {
                "@odata.context": "baz/context",
                id: "4",
                "picture@odata.mediaReadLink": "img_45.jpg",
                "messages": [{
                        "longtextUrl": "Longtext(4)"
                    }]
            }
        }
    }, mExpectedMessages = {
        "": [{ longtextUrl: "/~/Longtext(1)" }],
        "foo": [{ longtextUrl: "/foo/Longtext(2)" }],
        "foo/bar": [{ longtextUrl: "/foo/Longtext(3)" }],
        "foo/baz": [{ longtextUrl: "/foo/baz/Longtext(4)" }]
    }, oType = {
        "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messages" },
        $Key: ["id"],
        id: {
            $Type: "Edm.Int32"
        }
    }, mTypeForMetaPath = {
        "/EntitySet/Navigation": oType,
        "/EntitySet/Navigation/foo": oType,
        "/EntitySet/Navigation/foo/bar": oType,
        "/EntitySet/Navigation/foo/baz": oType
    };
    mExpectedMessages[""].$count = 1;
    mExpectedMessages[""].$created = 0;
    mExpectedMessages["foo"].$count = 1;
    mExpectedMessages["foo"].$created = 0;
    mExpectedMessages["foo/bar"].$count = 1;
    mExpectedMessages["foo/bar"].$created = 0;
    mExpectedMessages["foo/baz"].$count = 1;
    mExpectedMessages["foo/baz"].$created = 0;
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, undefined);
    oCache.visitResponse(oData, mTypeForMetaPath);
    assert.strictEqual(oData["picture@odata.mediaReadLink"], "/~/img_42.jpg");
    assert.strictEqual(oData.messages[0].longtextUrl, "/~/Longtext(1)");
    assert.strictEqual(oData.foo["picture@odata.mediaReadLink"], "/foo/img_43.jpg");
    assert.strictEqual(oData.foo.messages[0].longtextUrl, "/foo/Longtext(2)");
    assert.strictEqual(oData.foo.bar["picture@odata.mediaReadLink"], "/foo/img_44.jpg");
    assert.strictEqual(oData.foo.bar.messages[0].longtextUrl, "/foo/Longtext(3)");
    assert.strictEqual(oData.foo.baz["picture@odata.mediaReadLink"], "/foo/baz/img_45.jpg");
    assert.strictEqual(oData.foo.baz.messages[0].longtextUrl, "/foo/baz/Longtext(4)");
});
QUnit.test("_Cache#visitResponse: longtextUrl/media, collection response", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation"), oData = {
        "@odata.context": "../$metadata#foo",
        value: [{
                "id": "1",
                "picture@odata.mediaReadLink": "img_1.jpg",
                "messages": [{
                        "longtextUrl": "Longtext(1)"
                    }],
                "foo@odata.context": "/foo/context",
                "foo": [{
                        "id": "2",
                        "picture@odata.mediaReadLink": "img_2.jpg",
                        "messages": [{
                                "longtextUrl": "Longtext(2)"
                            }],
                        "bar@odata.context": "bar/context",
                        "bar": [{
                                "id": "3",
                                "picture@odata.mediaReadLink": "img_3.jpg",
                                "messages": [{
                                        "longtextUrl": "Longtext(3)"
                                    }]
                            }]
                    }]
            }]
    }, mExpectedMessages = {
        "(1)": [{ longtextUrl: "/~/Longtext(1)" }],
        "(1)/foo(2)": [{ longtextUrl: "/foo/Longtext(2)" }],
        "(1)/foo(2)/bar(3)": [{ longtextUrl: "/foo/bar/Longtext(3)" }]
    }, oType = {
        "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messages" },
        $Key: ["id"],
        id: {
            $Type: "Edm.Int32"
        }
    }, mTypeForMetaPath = {
        "/EntitySet/Navigation": oType,
        "/EntitySet/Navigation/foo": oType,
        "/EntitySet/Navigation/foo/bar": oType
    };
    mExpectedMessages["(1)"].$count = 1;
    mExpectedMessages["(1)"].$created = 0;
    mExpectedMessages["(1)/foo(2)"].$count = 1;
    mExpectedMessages["(1)/foo(2)"].$created = 0;
    mExpectedMessages["(1)/foo(2)/bar(3)"].$count = 1;
    mExpectedMessages["(1)/foo(2)/bar(3)"].$created = 0;
    this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, mExpectedMessages, ["(1)"]);
    oCache.visitResponse(oData, mTypeForMetaPath, undefined, undefined, undefined, 0);
    assert.strictEqual(oData.value[0]["picture@odata.mediaReadLink"], "/~/img_1.jpg");
    assert.strictEqual(oData.value[0].messages[0].longtextUrl, "/~/Longtext(1)");
    assert.strictEqual(oData.value[0].foo[0]["picture@odata.mediaReadLink"], "/foo/img_2.jpg");
    assert.strictEqual(oData.value[0].foo[0].messages[0].longtextUrl, "/foo/Longtext(2)");
    assert.strictEqual(oData.value[0].foo[0].bar[0]["picture@odata.mediaReadLink"], "/foo/bar/img_3.jpg");
    assert.strictEqual(oData.value[0].foo[0].bar[0].messages[0].longtextUrl, "/foo/bar/Longtext(3)");
});
[false, true].forEach(function (bReturnsOriginalResourcePath) {
    var sTitle = "_Cache#visitResponse: operation message; bReturnsOriginalResourcePath = " + bReturnsOriginalResourcePath;
    QUnit.test(sTitle, function (assert) {
        var sOriginalResourcePath = "OperationImport(...)", sResourcePath = "OperationImport", oCache = _Cache.createSingle(this.oRequestor, sResourcePath, {}, false, false, getOriginalResourcePath), oData = {
            messages: [{
                    message: "text"
                }]
        }, mExpectedMessages = {
            "": [{
                    message: "text"
                }]
        }, mTypeForMetaPath = {
            "/OperationImport": {
                "@com.sap.vocabularies.Common.v1.Messages": { $Path: "messages" },
                $Key: ["id"],
                id: { $Type: "Edm.Int32" }
            }
        };
        function getOriginalResourcePath(oValue) {
            assert.strictEqual(oValue, oData);
            return bReturnsOriginalResourcePath ? sOriginalResourcePath : undefined;
        }
        mExpectedMessages[""].$count = 1;
        mExpectedMessages[""].$created = 0;
        this.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(bReturnsOriginalResourcePath ? sOriginalResourcePath : sResourcePath, mExpectedMessages, undefined);
        oCache.visitResponse(oData, mTypeForMetaPath);
        assert.strictEqual(oCache.sReportedMessagesPath, bReturnsOriginalResourcePath ? sOriginalResourcePath : sResourcePath);
    });
});
QUnit.test("_Cache#patch", function (assert) {
    var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation"), oCacheValue = {}, oData = {}, sPath = "path/to/Entity";
    oCache.fetchValue = function () { };
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), sPath).returns(SyncPromise.resolve(oCacheValue));
    this.mock(_Helper).expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), sPath, sinon.match.same(oCacheValue), sinon.match.same(oData));
    return oCache.patch(sPath, oData).then(function (vResult) {
        assert.strictEqual(vResult, oCacheValue);
    });
});
[undefined, "~"].forEach(function (sReportedMessagesPath) {
    var sTitle = "_Cache#removeMessages, sReportedMessagesPath = " + sReportedMessagesPath;
    QUnit.test(sTitle, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS('42')");
        oCache.sReportedMessagesPath = sReportedMessagesPath;
        this.oModelInterfaceMock.expects("reportStateMessages").exactly(sReportedMessagesPath ? 1 : 0).withExactArgs(sReportedMessagesPath, {});
        oCache.removeMessages();
        assert.strictEqual(oCache.sReportedMessagesPath, undefined);
        assert.ok(oCache.hasOwnProperty("sReportedMessagesPath"));
    });
});
QUnit.test("_Cache#addPendingRequest, _Cache#removePendingRequest", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')"), oPendingRequestsPromise;
    assert.strictEqual(oCache.oPendingRequestsPromise, null);
    oCache.addPendingRequest();
    oPendingRequestsPromise = oCache.oPendingRequestsPromise;
    assert.ok(oPendingRequestsPromise instanceof SyncPromise);
    assert.strictEqual(oPendingRequestsPromise.$count, 1);
    oCache.addPendingRequest();
    assert.strictEqual(oCache.oPendingRequestsPromise, oPendingRequestsPromise);
    assert.strictEqual(oPendingRequestsPromise.$count, 2);
    oCache.removePendingRequest();
    assert.strictEqual(oCache.oPendingRequestsPromise, oPendingRequestsPromise);
    assert.strictEqual(oPendingRequestsPromise.isPending(), true);
    assert.strictEqual(oPendingRequestsPromise.$count, 1);
    oCache.removePendingRequest();
    assert.strictEqual(oCache.oPendingRequestsPromise, null);
    assert.strictEqual(oPendingRequestsPromise.isPending(), false);
    assert.strictEqual(oPendingRequestsPromise.getResult(), undefined);
    assert.strictEqual(oPendingRequestsPromise.$count, 0);
    oCache.removePendingRequest();
    assert.strictEqual(oCache.oPendingRequestsPromise, null);
    return oPendingRequestsPromise;
});
[false, true].forEach(function (bTransient) {
    QUnit.test("_Cache#replaceElement, bTransient= " + bTransient, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS('0')"), oElement = {}, aElements = [], oOldElement = {}, sTransientPredicate = "($uid=id-1-23)", mTypeForMetaPath = {};
        aElements[3] = oOldElement;
        aElements.$byPredicate = { "('42')": oOldElement };
        if (bTransient) {
            aElements.$byPredicate[sTransientPredicate] = oOldElement;
        }
        this.mock(_Cache).expects("getElementIndex").withExactArgs(sinon.match.same(aElements), "('42')", 4).returns(3);
        this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oOldElement), "transientPredicate").returns(bTransient ? sTransientPredicate : undefined);
        this.mock(_Helper).expects("setPrivateAnnotation").exactly(bTransient ? 1 : 0).withExactArgs(sinon.match.same(oElement), "transientPredicate", sTransientPredicate);
        this.mock(_Helper).expects("buildPath").withExactArgs("/TEAMS", "TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS").returns("/TEAMS/TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS");
        this.mock(_Helper).expects("getMetaPath").withExactArgs("/TEAMS/TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS").returns("/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENTS");
        this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oElement), sinon.match.same(mTypeForMetaPath), "/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENTS", "TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS('42')");
        oCache.replaceElement(aElements, 4, "('42')", oElement, mTypeForMetaPath, "TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS");
        assert.strictEqual(aElements[3], oElement);
        assert.strictEqual(aElements.$byPredicate["('42')"], oElement);
        assert.strictEqual(aElements.$byPredicate[sTransientPredicate], bTransient ? oElement : undefined);
        assert.strictEqual(aElements[3]["@$ui5.context.isTransient"], bTransient ? false : undefined);
    });
});
QUnit.test("Cache#replaceElement for an element that has no index", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS"), aElements = [{ a: "doNotTouch" }], oNewElement = { a: "4711", b: "0815" }, oOldElement = { a: "0815" }, mTypeForMetaPath = {};
    aElements.$byPredicate = { doNotTouch: aElements[0], "('42')": oOldElement };
    this.mock(_Cache).expects("getElementIndex").never();
    this.mock(_Helper).expects("buildPath").withExactArgs("/TEAMS", "~").returns("~path~");
    this.mock(_Helper).expects("getMetaPath").withExactArgs("~path~").returns("~meta~path~");
    this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oNewElement), sinon.match.same(mTypeForMetaPath), "~meta~path~", "~('42')");
    oCache.replaceElement(aElements, undefined, "('42')", oNewElement, mTypeForMetaPath, "~");
    assert.deepEqual(aElements, [{ a: "doNotTouch" }]);
    assert.deepEqual(aElements.$byPredicate, { doNotTouch: aElements[0], "('42')": oNewElement });
});
[
    { index: undefined, keepAlive: true, lateQueryOptions: false },
    { index: undefined, keepAlive: true, lateQueryOptions: true },
    { index: 1, keepAlive: false, lateQueryOptions: false },
    { index: 1, keepAlive: false, lateQueryOptions: true },
    { index: 1, keepAlive: true, lateQueryOptions: false },
    { index: 1, keepAlive: true, lateQueryOptions: true }
].forEach(function (oFixture) {
    var mLateQueryOptions = oFixture.lateQueryOptions ? {} : null, sTitle = "_Cache#refreshSingle: iIndex = " + oFixture.index + ", bKeepAlive = " + oFixture.keepAlive + ", mLateQueryOptions = " + mLateQueryOptions;
    QUnit.test(sTitle, function (assert) {
        var oCache = new _Cache(this.oRequestor, "Employees('31')", {}, {}), oCacheMock = this.mock(oCache), mCacheQueryOptions = {}, fnDataRequested = this.spy(), sKeyPredicate = "('13')", oElement = { "@$ui5._": { "predicate": sKeyPredicate } }, aElements = oFixture.index !== undefined ? [{}, oElement, {}] : [{}, {}], oFetchValuePromise = Promise.resolve(aElements), oGroupLock = {}, oPromise, mQueryOptionsCopy = {
            $apply: "A.P.P.L.E.",
            $count: true,
            $expand: { "EMPLOYEE_2_TEAM": null },
            $filter: "age gt 40",
            $orderby: "TEAM_ID desc",
            $search: "OR",
            $select: ["Name"],
            foo: "bar",
            "sap-client": "123"
        }, mQueryOptionsForPath = {}, oResponse = {}, mTypeForMetaPath = {};
        oCache.mLateQueryOptions = mLateQueryOptions;
        aElements.$byPredicate = {};
        aElements.$byPredicate[sKeyPredicate] = oElement;
        oCache.fetchValue = function () { };
        oCacheMock.expects("checkSharedRequest").withExactArgs();
        oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS").returns(SyncPromise.resolve(oFetchValuePromise));
        this.mock(_Helper).expects("aggregateExpandSelect").exactly(oFixture.keepAlive && oFixture.lateQueryOptions ? 1 : 0).withExactArgs(sinon.match.same(mQueryOptionsCopy), sinon.match.same(mLateQueryOptions));
        oPromise = oCache.refreshSingle(oGroupLock, "EMPLOYEE_2_EQUIPMENTS", oFixture.index, sKeyPredicate, oFixture.keepAlive, fnDataRequested);
        assert.ok(oPromise.isFulfilled, "returned a SyncPromise");
        assert.strictEqual(oCache.bSentRequest, false);
        oCache.mQueryOptions = mCacheQueryOptions;
        this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(mCacheQueryOptions), "EMPLOYEE_2_EQUIPMENTS").returns(mQueryOptionsForPath);
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(mQueryOptionsForPath)).returns(mQueryOptionsCopy);
        this.mock(_Helper).expects("buildPath").withExactArgs("Employees('31')", "EMPLOYEE_2_EQUIPMENTS", sKeyPredicate).returns("~");
        this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, {
            $expand: { "EMPLOYEE_2_TEAM": null },
            $select: ["Name"],
            foo: "bar",
            "sap-client": "123"
        }, false, sinon.match.same(oCache.bSortExpandSelect)).returns("?$select=Name");
        this.oRequestorMock.expects("request").withExactArgs("GET", "~?$select=Name", sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).resolves(oResponse);
        oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        return oFetchValuePromise.then(function () {
            assert.strictEqual(oCache.bSentRequest, true);
            assert.strictEqual(aElements.$byPredicate[sKeyPredicate], oElement, "not replaced yet");
            oCacheMock.expects("replaceElement").withExactArgs(sinon.match.same(aElements), oFixture.index, sKeyPredicate, sinon.match.same(oResponse), sinon.match.same(mTypeForMetaPath), "EMPLOYEE_2_EQUIPMENTS");
            return oPromise;
        });
    });
});
[{
        mBindingQueryOptions: {
            $apply: "A.P.P.L.E.",
            $count: true,
            $expand: { "EMPLOYEE_2_TEAM": null },
            $filter: "age gt 40",
            $orderby: "TEAM_ID desc",
            $search: "OR",
            $select: ["Name"],
            foo: "bar",
            "sap-client": "123"
        },
        mQueryOptionsForRequest: {
            $apply: "A.P.P.L.E.",
            $expand: { "EMPLOYEE_2_TEAM": null },
            $filter: "(age gt 40) and ~key filter~",
            $search: "OR",
            $select: ["Name"],
            foo: "bar",
            "sap-client": "123"
        }
    }, {
        mBindingQueryOptions: { $filter: "age gt 40 or age lt 20" },
        mQueryOptionsForRequest: { $filter: "(age gt 40 or age lt 20) and ~key filter~" }
    }, {
        mBindingQueryOptions: {},
        mQueryOptionsForRequest: { $filter: "~key filter~" },
        bWithTransientPredicate: true
    }].forEach(function (oFixture, i) {
    [false, true].forEach(function (bRemoved) {
        var sTitle = "_Cache#refreshSingleWithRemove: removed=" + bRemoved + ", " + i;
        QUnit.test(sTitle, function (assert) {
            var oCache = new _Cache(this.oRequestor, "Employees('31')", {}, {}), oCacheMock = this.mock(oCache), mCacheQueryOptions = {}, oClonedQueryOptions = Object.assign({}, oFixture.mBindingQueryOptions), fnDataRequested = this.spy(), sKeyPredicate = "('13')", oElement = { "@$ui5._": { "predicate": sKeyPredicate } }, aElements = [{}, oElement, {}], oFetchValuePromise = Promise.resolve(aElements), oGroupLock = {}, fnOnRemove = this.spy(), oPromise, mQueryOptionsForPath = {}, oResponse = bRemoved ? { value: [] } : { value: [{ Foo: "Bar" }] }, sTransientPredicate = "($uid=id-1-23)", mTypeForMetaPath = {}, that = this;
            aElements.$byPredicate = {};
            aElements.$byPredicate[sKeyPredicate] = oElement;
            if (oFixture.bWithTransientPredicate) {
                aElements.$byPredicate[sTransientPredicate] = oElement;
                _Helper.setPrivateAnnotation(oElement, "transientPredicate", sTransientPredicate);
            }
            oCache.fetchValue = function () { };
            oCacheMock.expects("checkSharedRequest").withExactArgs();
            oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS").returns(SyncPromise.resolve(oFetchValuePromise));
            oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
            oPromise = oCache.refreshSingleWithRemove(oGroupLock, "EMPLOYEE_2_EQUIPMENTS", 1, "~", false, fnDataRequested, fnOnRemove);
            assert.ok(oPromise.isFulfilled, "returned a SyncPromise");
            assert.strictEqual(oCache.bSentRequest, false);
            oCache.mQueryOptions = mCacheQueryOptions;
            this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(mCacheQueryOptions), "EMPLOYEE_2_EQUIPMENTS").returns(mQueryOptionsForPath);
            this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(mQueryOptionsForPath)).returns(oClonedQueryOptions);
            this.mock(_Helper).expects("buildPath").withExactArgs("Employees('31')", "EMPLOYEE_2_EQUIPMENTS").returns("~");
            this.mock(_Helper).expects("getKeyFilter").withExactArgs(sinon.match.same(oElement), "/Employees", sinon.match.same(mTypeForMetaPath)).returns("~key filter~");
            this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, oFixture.mQueryOptionsForRequest, false, sinon.match.same(oCache.bSortExpandSelect)).returns("?$filter=...");
            this.oRequestorMock.expects("request").withExactArgs("GET", "~?$filter=...", sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).callsFake(function () {
                assert.strictEqual(oCache.bSentRequest, true);
                oCacheMock.expects("removeElement").exactly(bRemoved ? 1 : 0).withExactArgs(sinon.match.same(aElements), 1, sKeyPredicate, "EMPLOYEE_2_EQUIPMENTS");
                that.oModelInterfaceMock.expects("reportStateMessages").exactly(bRemoved ? 1 : 0).withExactArgs(oCache.sResourcePath, [], ["EMPLOYEE_2_EQUIPMENTS('13')"]);
                oCacheMock.expects("replaceElement").exactly(bRemoved ? 0 : 1).withExactArgs(sinon.match.same(aElements), 1, sKeyPredicate, sinon.match.same(oResponse.value[0]), sinon.match.same(mTypeForMetaPath), "EMPLOYEE_2_EQUIPMENTS");
                return Promise.resolve(oResponse);
            });
            return oPromise.then(function () {
                assert.deepEqual(arguments, { "0": undefined });
                if (bRemoved) {
                    sinon.assert.calledOnce(fnOnRemove);
                    sinon.assert.calledWithExactly(fnOnRemove, false);
                }
            });
        });
    });
});
[
    { hasFilter: false, hasSearch: false, inCollection: true, secondQuery: false },
    { hasFilter: true, hasSearch: false, inCollection: true, secondQuery: true },
    { hasFilter: false, hasSearch: true, inCollection: false, secondQuery: true }
].forEach(function (oFixture) {
    var sTitle = "refreshSingleWithRemove: for (still existing) kept-alive element (in collection)" + (oFixture.hasFilter ? ", binding has own filter" : "") + (oFixture.hasSearch ? ", implicit filter via $search" : "") + "; after refresh the entity exists and the context is" + (oFixture.inCollection ? " in the collection" : " not in the collection");
    QUnit.test(sTitle, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS", {}), oCacheMock = this.mock(oCache), fnDataRequested = this.spy(), oElement = { "@$ui5._": { predicate: "('13')" } }, aElements = [oElement], oFetchValuePromise = Promise.resolve(aElements), oGroupLock = {
            getUnlockedCopy: function () { }
        }, oGroupLockCopy = {}, oInCollectionResponse = {
            "@odata.count": oFixture.inCollection ? "1" : "0",
            value: []
        }, oObjectMock = this.mock(Object), fnOnRemove = this.spy(), mQueryOptionsForInCollection = {
            $apply: "apply",
            $expand: "expand",
            $select: "select"
        }, mQueryOptionsForPath = {}, mQueryOptionsForPathCopy = {
            $apply: "apply",
            $expand: "expand",
            $select: "select"
        }, oReadResponse = { value: [{}] }, oRemoveExpectation, oReplaceExpectation, mTypeForMetaPath = {};
        aElements.$byPredicate = { "('13')": oElement };
        if (oFixture.hasFilter) {
            mQueryOptionsForPathCopy.$filter = mQueryOptionsForInCollection.$filter = "filter";
        }
        if (oFixture.hasSearch) {
            mQueryOptionsForPathCopy.$search = mQueryOptionsForInCollection.$search = "search";
        }
        oCache.fetchValue = function () { };
        oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "~").returns(SyncPromise.resolve(oFetchValuePromise));
        oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mQueryOptions), "~").returns(mQueryOptionsForPath);
        oObjectMock.expects("assign").withExactArgs({}, sinon.match.same(mQueryOptionsForPath)).returns(mQueryOptionsForPathCopy);
        this.mock(_Helper).expects("buildPath").withExactArgs("TEAMS", "~").returns("~");
        this.mock(_Helper).expects("getKeyFilter").withExactArgs(sinon.match.same(oElement), "/TEAMS", sinon.match.same(mTypeForMetaPath)).returns("~key filter~");
        this.mock(_Helper).expects("aggregateExpandSelect").never();
        oObjectMock.expects("assign").withExactArgs({}, mQueryOptionsForPathCopy).returns(mQueryOptionsForInCollection);
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/TEAMS", mQueryOptionsForPathCopy, false, sinon.match.same(oCache.bSortExpandSelect)).returns("?readDataQuery");
        this.oRequestorMock.expects("request").withExactArgs("GET", "~?readDataQuery", sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).callsFake(function () {
            assert.strictEqual(oCache.bSentRequest, true);
            return Promise.resolve(oReadResponse);
        });
        this.oRequestorMock.expects("buildQueryString").exactly(oFixture.secondQuery ? 1 : 0).withExactArgs("/TEAMS", mQueryOptionsForInCollection).returns("?inCollectionQuery");
        this.mock(oGroupLock).expects("getUnlockedCopy").exactly(oFixture.secondQuery ? 1 : 0).returns(oGroupLockCopy);
        this.oRequestorMock.expects("request").exactly(oFixture.secondQuery ? 1 : 0).withExactArgs("GET", "~?inCollectionQuery", sinon.match.same(oGroupLockCopy)).callsFake(function () {
            assert.strictEqual(oCache.bSentRequest, true);
            return Promise.resolve(oInCollectionResponse);
        });
        oReplaceExpectation = oCacheMock.expects("replaceElement").withExactArgs(sinon.match.same(aElements), oFixture.inCollection ? 0 : undefined, "('13')", sinon.match.same(oReadResponse.value[0]), sinon.match.same(mTypeForMetaPath), "~");
        oRemoveExpectation = oCacheMock.expects("removeElement").exactly(oFixture.inCollection ? 0 : 1).withExactArgs(sinon.match.same(aElements), 0, "('13')", "~");
        return oCache.refreshSingleWithRemove(oGroupLock, "~", 0, "('13')", true, fnDataRequested, fnOnRemove).then(function () {
            if (oFixture.secondQuery) {
                assert.strictEqual(mQueryOptionsForInCollection.$expand, undefined);
                assert.strictEqual(mQueryOptionsForInCollection.$select, undefined);
                assert.strictEqual(mQueryOptionsForInCollection.$count, true);
                assert.strictEqual(mQueryOptionsForInCollection.$top, 0);
            }
            assert.strictEqual(mQueryOptionsForPathCopy.$apply, "apply");
            assert.strictEqual(mQueryOptionsForPathCopy.$search, undefined);
            if (!oFixture.inCollection) {
                oReplaceExpectation.calledAfter(oRemoveExpectation);
                sinon.assert.calledOnce(fnOnRemove);
                sinon.assert.calledWithExactly(fnOnRemove, true);
            }
        });
    });
});
QUnit.test("refreshSingleWithRemove: for kept-alive element (not in list)", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS", {}), oCacheMock = this.mock(oCache), fnDataRequested = this.spy(), oElement = { "@$ui5._": { "predicate": "('13')" } }, aElements = [{ a: "42" }], oExistenceResponse = { value: [{}] }, oFetchValuePromise = Promise.resolve(aElements), oGroupLock = {}, oObjectMock = this.mock(Object), fnOnRemove = this.spy(), mQueryOptionsForPath = {}, mQueryOptionsForPathCopy = { $filter: "does~not~matter" }, mTypeForMetaPath = {};
    aElements.$byPredicate = { "('13')": oElement };
    oCache.fetchValue = function () { };
    oCache.mLateQueryOptions = {};
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "~").returns(SyncPromise.resolve(oFetchValuePromise));
    oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mQueryOptions), "~").returns(mQueryOptionsForPath);
    oObjectMock.expects("assign").withExactArgs({}, sinon.match.same(mQueryOptionsForPath)).returns(mQueryOptionsForPathCopy);
    this.mock(_Helper).expects("aggregateExpandSelect").withExactArgs(sinon.match.same(mQueryOptionsForPathCopy), sinon.match.same(oCache.mLateQueryOptions));
    this.mock(_Helper).expects("buildPath").withExactArgs("TEAMS", "~").returns("~");
    this.mock(_Helper).expects("getKeyFilter").withExactArgs(sinon.match.same(oElement), "/TEAMS", sinon.match.same(mTypeForMetaPath)).returns("~key filter~");
    oObjectMock.expects("assign").withExactArgs({}, mQueryOptionsForPathCopy).returns({});
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/TEAMS", { $filter: "~key filter~" }, false, sinon.match.same(oCache.bSortExpandSelect)).returns("?readDataQuery");
    this.oRequestorMock.expects("request").withExactArgs("GET", "~?readDataQuery", sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).resolves(oExistenceResponse);
    oCacheMock.expects("replaceElement").withExactArgs(sinon.match.same(aElements), undefined, "('13')", sinon.match.same(oExistenceResponse.value[0]), sinon.match.same(mTypeForMetaPath), "~");
    return oCache.refreshSingleWithRemove(oGroupLock, "~", undefined, "('13')", true, fnDataRequested, fnOnRemove).then(function () {
        assert.deepEqual(aElements, [{ a: "42" }]);
    });
});
QUnit.test("refreshSingleWithRemove: server returns more than one entity", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees('31')", {}, {}), oCacheMock = this.mock(oCache), fnDataRequested = this.spy(), oElement = { "@$ui5._": { "predicate": "('13')" } }, aElements = [{}, {}, {}, oElement], oFetchValuePromise = Promise.resolve(aElements), oGroupLock = {}, mQueryOptionsForPath = {}, oResult = { "ID": "13" }, mTypeForMetaPath = {};
    aElements.$byPredicate = { "('13')": oElement };
    oCache.fetchValue = function () { };
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS").returns(SyncPromise.resolve(oFetchValuePromise));
    oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mQueryOptions), "EMPLOYEE_2_EQUIPMENTS").returns(mQueryOptionsForPath);
    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(mQueryOptionsForPath)).returns({ "$filter": "age gt 40" });
    this.mock(_Helper).expects("buildPath").withExactArgs("Employees('31')", "EMPLOYEE_2_EQUIPMENTS").returns("~");
    this.mock(_Helper).expects("getKeyFilter").withExactArgs(sinon.match.same(oElement), "/Employees", sinon.match.same(mTypeForMetaPath)).returns("~key filter~");
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", { $filter: "(age gt 40) and ~key filter~" }, false, sinon.match.same(oCache.bSortExpandSelect)).returns("?$filter=...");
    this.oRequestorMock.expects("request").withExactArgs("GET", "~?$filter=...", sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).resolves({ value: [oResult, oResult] });
    return oCache.refreshSingleWithRemove(oGroupLock, "EMPLOYEE_2_EQUIPMENTS", 3, "~", false, fnDataRequested).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Unexpected server response, more than one entity returned.");
    });
});
QUnit.test("Cache#[gs]etLateQueryOptions", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees('31')", {});
    assert.strictEqual(oCache.getLateQueryOptions(), null);
    oCache.setLateQueryOptions({
        foo: "bar",
        $expand: { n: { $select: "p3" } },
        $filter: "filter",
        $select: ["p1", "p2"],
        $$ownRequest: true
    });
    assert.deepEqual(oCache.mLateQueryOptions, {
        $expand: { n: { $select: "p3" } },
        $select: ["p1", "p2"]
    });
    oCache.setLateQueryOptions({ $expand: { n: { $select: "p3" } } });
    assert.deepEqual(oCache.mLateQueryOptions, {
        $expand: { n: { $select: "p3" } },
        $select: undefined
    });
    oCache.setLateQueryOptions({ $select: ["p1", "p2"] });
    assert.deepEqual(oCache.mLateQueryOptions, {
        $expand: undefined,
        $select: ["p1", "p2"]
    });
    assert.strictEqual(oCache.getLateQueryOptions(), oCache.mLateQueryOptions);
    oCache.setLateQueryOptions(null);
    assert.strictEqual(oCache.getLateQueryOptions(), null);
});
QUnit.test("Cache#fetchLateProperty: $select", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees('31')", {}), oData = {
        foo: {
            bar: "baz"
        }
    }, oEntity = { foo: {} }, oGroupLock = {
        getUnlockedCopy: function () { }
    }, oHelperMock = this.mock(_Helper), sMissingPropertyPath = "foo/bar", oPromise, sRequestedPropertyPath = "foo/bar/baz", oRequestGroupLock = {}, mQueryOptions = {
        $select: [sRequestedPropertyPath]
    }, mQueryOptionsForPath = {}, mTypeForMetaPath = {
        "~2~": {}
    };
    oCache.mLateQueryOptions = {};
    oHelperMock.expects("getMetaPath").withExactArgs("").returns("~resMetaPath~");
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath, "~resMetaPath~").returns("~metaPath~");
    oHelperMock.expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "").returns(mQueryOptionsForPath);
    oHelperMock.expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), [sRequestedPropertyPath], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "~metaPath~", {}).returns(mQueryOptions);
    oHelperMock.expects("buildPath").withExactArgs("~metaPath~", undefined).returns("~2~");
    this.mock(oCache).expects("fetchType").never();
    oHelperMock.expects("buildPath").withExactArgs(oCache.sResourcePath, "").returns("~/");
    this.oRequestorMock.expects("buildQueryString").withExactArgs("~metaPath~", sinon.match.same(mQueryOptions), false, true).returns("?$select=~metaPath~");
    this.oRequestorMock.expects("buildQueryString").withExactArgs("~metaPath~", sinon.match.same(oCache.mQueryOptions), true).returns("?~");
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
    this.oRequestorMock.expects("request").withExactArgs("GET", "~/?~", sinon.match.same(oRequestGroupLock), undefined, undefined, undefined, undefined, "~metaPath~", undefined, false, sinon.match.same(mQueryOptions)).resolves(oData);
    this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath), "~metaPath~", "");
    oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oEntity), sinon.match.same(oData), [sRequestedPropertyPath]);
    oHelperMock.expects("drillDown").withExactArgs(sinon.match.same(oEntity), ["foo", "bar"]).returns("baz");
    oPromise = oCache.fetchLateProperty(oGroupLock, oEntity, "", sRequestedPropertyPath, sMissingPropertyPath);
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, "baz");
    });
});
QUnit.test("Cache#fetchLateProperty: $select, nested entity", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees", {}), oData = {
        foo: {
            bar: "baz"
        }
    }, oEntity = { foo: {} }, oGroupLock = {
        getUnlockedCopy: function () { }
    }, oHelperMock = this.mock(_Helper), sMissingPropertyPath = "foo/bar", oPromise, sRequestedPropertyPath = "foo/bar/baz", oRequestGroupLock = {}, mQueryOptions = {
        $select: [sRequestedPropertyPath]
    }, mQueryOptionsForPath = {}, mTypeForMetaPath = {
        "/entity/meta/path": {}
    };
    oCache.mLateQueryOptions = {};
    oHelperMock.expects("getMetaPath").withExactArgs("('31')/entity/path").returns("entity/path");
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    oHelperMock.expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "('31')/entity/path").returns(mQueryOptionsForPath);
    oHelperMock.expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), [sRequestedPropertyPath], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees/entity/path", {}).returns(mQueryOptions);
    oHelperMock.expects("buildPath").withExactArgs("/Employees", "entity/path").returns("/Employees/entity/path");
    oHelperMock.expects("buildPath").withExactArgs("/Employees/entity/path", undefined).returns("/entity/meta/path");
    this.mock(oCache).expects("fetchType").never();
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees/entity/path", sinon.match.same(mQueryOptions), false, true).returns("?$select=~1");
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees/entity/path", sinon.match.same(oCache.mQueryOptions), true).returns("?~");
    oHelperMock.expects("buildPath").withExactArgs(oCache.sResourcePath, "('31')/entity/path").returns("~/");
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
    this.oRequestorMock.expects("request").withExactArgs("GET", "~/?~", sinon.match.same(oRequestGroupLock), undefined, undefined, undefined, undefined, "/Employees/entity/path", undefined, false, sinon.match.same(mQueryOptions)).resolves(oData);
    this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath), oCache.sMetaPath + "/entity/path", "('31')/entity/path");
    oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), "('31')/entity/path", sinon.match.same(oEntity), sinon.match.same(oData), [sRequestedPropertyPath]);
    oHelperMock.expects("drillDown").withExactArgs(sinon.match.same(oEntity), ["foo", "bar"]).returns("baz");
    oPromise = oCache.fetchLateProperty(oGroupLock, oEntity, "('31')/entity/path", sRequestedPropertyPath, sMissingPropertyPath);
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, "baz");
    });
});
QUnit.test("Cache#fetchLateProperty: $expand", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees", {}), oCacheMock = this.mock(oCache), oData = {
        foo: {
            bar: "baz"
        }
    }, oEntity = {}, oGroupLock = {
        getUnlockedCopy: function () { }
    }, oHelperMock = this.mock(_Helper), oPromise, mQueryOptions = {
        $expand: {
            foo: {
                $expand: {
                    bar: {
                        $expand: {
                            baz: { $select: ["qux", "baz1"] }
                        },
                        $select: ["baz"]
                    }
                },
                $select: ["foo1", "t/foo2"]
            }
        },
        $select: ["key"]
    }, mQueryOptionsForPath = {}, oRequestGroupLock = {}, mRequestQueryOptions = {
        $expand: {
            foo: {
                $expand: {
                    bar: {
                        $expand: {
                            baz: {
                                $select: ["qux", "baz1"]
                            }
                        },
                        $select: ["baz"]
                    }
                },
                $select: ["foo1", "t/foo2"]
            }
        },
        $select: ["key"]
    }, oTypeBar = {}, oTypeBaz = {
        $Key: ["baz1"]
    }, oTypeFoo = {
        $Key: ["foo1", { foo2: "t/foo2" }]
    }, mTypeForMetaPath = {
        "~": {}
    }, oUpdateSelectedCall, oVisitResponseCall;
    oCache.mLateQueryOptions = {};
    oHelperMock.expects("getMetaPath").withExactArgs("('1')/entity/path").returns("entity/path");
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath, "entity/path").returns(oCache.sMetaPath + "/entity/path");
    oHelperMock.expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "('1')/entity/path").returns(mQueryOptionsForPath);
    oHelperMock.expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), ["foo/bar/baz/qux"], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), oCache.sMetaPath + "/entity/path", {}).returns(mQueryOptions);
    oCacheMock.expects("fetchType").never();
    oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", undefined).returns("~");
    oHelperMock.expects("buildPath").withExactArgs(undefined, "foo").returns("foo");
    oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", "foo").returns(oCache.sMetaPath + "/entity/path/foo");
    oCacheMock.expects("fetchType").withExactArgs(sinon.match.same(mTypeForMetaPath), oCache.sMetaPath + "/entity/path/foo").returns(SyncPromise.resolve(oTypeFoo));
    oHelperMock.expects("buildPath").withExactArgs("foo", "foo1").returns("foo/foo1");
    oHelperMock.expects("buildPath").withExactArgs("foo", "t/foo2").returns("foo/t/foo2");
    oHelperMock.expects("buildPath").withExactArgs("foo", "bar").returns("foo/bar");
    oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", "foo/bar").returns(oCache.sMetaPath + "/entity/path/foo/bar");
    oCacheMock.expects("fetchType").withExactArgs(sinon.match.same(mTypeForMetaPath), oCache.sMetaPath + "/entity/path/foo/bar").returns(SyncPromise.resolve(oTypeBar));
    oHelperMock.expects("buildPath").withExactArgs("foo/bar", "baz").returns("foo/bar/baz");
    oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", "foo/bar/baz").returns(oCache.sMetaPath + "/entity/path/foo/bar/baz");
    oCacheMock.expects("fetchType").withExactArgs(sinon.match.same(mTypeForMetaPath), oCache.sMetaPath + "/entity/path/foo/bar/baz").returns(SyncPromise.resolve(oTypeBaz));
    oHelperMock.expects("buildPath").withExactArgs("foo/bar/baz", "baz1").returns("foo/bar/baz/baz1");
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath + "/entity/path", mRequestQueryOptions, false, true).returns("?$expand=~1");
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath + "/entity/path", sinon.match.same(oCache.mQueryOptions), true).returns("?~");
    oHelperMock.expects("buildPath").withExactArgs(oCache.sResourcePath, "('1')/entity/path").returns("~/");
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
    this.oRequestorMock.expects("request").withExactArgs("GET", "~/?~", sinon.match.same(oRequestGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath + "/entity/path", undefined, false, mRequestQueryOptions).resolves(oData);
    oVisitResponseCall = this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath), oCache.sMetaPath + "/entity/path", "('1')/entity/path");
    oUpdateSelectedCall = oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), "('1')/entity/path", sinon.match.same(oEntity), sinon.match.same(oData), [
        "foo/bar/baz/qux",
        "foo/foo1",
        "foo/t/foo2",
        "foo/@odata.etag",
        "foo/@$ui5._/predicate",
        "foo/bar/@odata.etag",
        "foo/bar/@$ui5._/predicate",
        "foo/bar/baz/baz1",
        "foo/bar/baz/@odata.etag",
        "foo/bar/baz/@$ui5._/predicate"
    ]);
    oHelperMock.expects("drillDown").withExactArgs(sinon.match.same(oEntity), ["foo"]).returns(oData.foo);
    oPromise = oCache.fetchLateProperty(oGroupLock, oEntity, "('1')/entity/path", "foo/bar/baz/qux", "foo");
    return oPromise.then(function (oResult) {
        assert.deepEqual(oResult, oData.foo);
        assert.ok((oUpdateSelectedCall.calledAfter(oVisitResponseCall)));
    });
});
QUnit.test("Cache#fetchLateProperty: parallel calls", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees('31')", {}), oData = { property: { foo: "foo", bar: "bar" } }, oEntity = {}, oGroupLock = {
        getUnlockedCopy: function () { }
    }, oHelperMock = this.mock(_Helper), oPromise1, oPromise2, mQueryOptionsFoo = { $select: [] }, mQueryOptionsBar = { $select: [] }, mQueryOptionsForPath = {}, mTypeForMetaPath = {
        "/Employees": {}
    };
    oCache.mLateQueryOptions = {};
    this.mock(oCache).expects("fetchTypes").twice().withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    oHelperMock.expects("getQueryOptionsForPath").twice().withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "").returns(mQueryOptionsForPath);
    oHelperMock.expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property/foo"], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), oCache.sMetaPath, {}).returns(mQueryOptionsFoo);
    oHelperMock.expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property/bar"], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), oCache.sMetaPath, {}).returns(mQueryOptionsBar);
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptionsFoo), false, true).returns("?$select=property");
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptionsBar), false, true).returns("?$select=property");
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions), true).returns("?~");
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns("~groupLock~");
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees('31')?~", sinon.match.same("~groupLock~"), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mQueryOptionsFoo)).resolves(oData);
    this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath), oCache.sMetaPath, "");
    oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oEntity), sinon.match.same(oData), ["property/foo"]).callsFake(function () {
        assert.ok("Employees('31')?$select=property" in oCache.mPropertyRequestByPath, "still cached");
    });
    oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oEntity), sinon.match.same(oData), ["property/bar"]);
    oPromise1 = oCache.fetchLateProperty(oGroupLock, oEntity, "", "property/foo", "property");
    oPromise2 = oCache.fetchLateProperty(oGroupLock, oEntity, "", "property/bar", "property");
    return Promise.all([oPromise1, oPromise2]).then(function () {
        assert.deepEqual(oCache.mPropertyRequestByPath, {});
    });
});
QUnit.test("Cache#fetchLateProperty: request failed", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees('31')", {}), oEntity = {}, oError = new Error(), oGroupLock = {
        getUnlockedCopy: function () { }
    }, mQueryOptions = { $select: [] }, mQueryOptionsForPath = {};
    oCache.fetchValue = function () { };
    oCache.mLateQueryOptions = {};
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve({}));
    this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "").returns(mQueryOptionsForPath);
    this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property"], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), oCache.sMetaPath, {}).returns(mQueryOptions);
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptions), false, true).returns("?~1");
    this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions), true).returns("?~2");
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns("~groupLock~");
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees('31')?~2", sinon.match.same("~groupLock~"), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mQueryOptions)).rejects(oError);
    this.mock(_Helper).expects("updateSelected").never();
    return oCache.fetchLateProperty(oGroupLock, oEntity, "", "property", "property").then(function () {
        assert.ok(false);
    }, function (oResult) {
        assert.strictEqual(oResult, oError);
        assert.deepEqual(oCache.mPropertyRequestByPath, {});
    });
});
[{
        error: "ETag changed",
        etag: "new",
        predicate: "('TEAM_01')"
    }, {
        error: "Key predicate changed from ('TEAM_01') to ('TEAM_02')",
        etag: "old",
        predicate: "('TEAM_02')"
    }].forEach(function (oFixture) {
    QUnit.test("Cache#fetchLateProperty: " + oFixture.error, function (assert) {
        var oCache = new _Cache(this.oRequestor, "Employees('31')/EMPLOYEE_2_TEAM", {}), oCacheData = {
            "@$ui5._": { predicate: "('TEAM_01')" },
            "@odata.etag": "old"
        }, oData = {
            "@$ui5._": { predicate: oFixture.predicate },
            "@odata.etag": oFixture.etag
        }, oEntityType = {
            $Key: ["key"]
        }, oGroupLock = {
            getUnlockedCopy: function () { }
        }, mQueryOptions = { $select: [] }, mQueryOptionsForPath = {}, oRequestGroupLock = {}, mTypeForMetaPath = {
            "/Employees/EMPLOYEE_2_TEAM": oEntityType
        };
        oCache.mLateQueryOptions = {
            $expand: { expand: {} },
            $select: ["select"]
        };
        this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "").returns(mQueryOptionsForPath);
        this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property"], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), oCache.sMetaPath, {}).returns(mQueryOptions);
        this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptions), false, true).returns("?~1");
        this.oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions), true).returns("?~2");
        this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
        this.oRequestorMock.expects("request").withExactArgs("GET", "Employees('31')/EMPLOYEE_2_TEAM?~2", sinon.match.same(oRequestGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mQueryOptions)).resolves(oData);
        this.mock(_Helper).expects("updateSelected").never();
        return oCache.fetchLateProperty(oGroupLock, oCacheData, "", "property", "property").then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, "GET " + "Employees('31')/EMPLOYEE_2_TEAM?~1: " + oFixture.error);
            assert.deepEqual(oCache.mPropertyRequestByPath, {});
        });
    });
});
QUnit.test("Cache#fetchLateProperty: no late properties", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees");
    this.mock(_Helper).expects("intersectQueryOptions").never();
    this.oRequestorMock.expects("request").never();
    this.mock(_Helper).expects("updateSelected").never();
    assert.strictEqual(oCache.fetchLateProperty({}, {}, "('1')", "property", "property"), undefined);
});
QUnit.test("Cache#fetchLateProperty: not a late property", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees"), mQueryOptionsForPath = {};
    oCache.mLateQueryOptions = {};
    this.mock(_Helper).expects("getMetaPath").withExactArgs("('1')").returns("");
    this.mock(_Helper).expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "('1')").returns(mQueryOptionsForPath);
    this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property"], sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), oCache.sMetaPath, {}).returns(undefined);
    this.oRequestorMock.expects("request").never();
    this.mock(_Helper).expects("updateSelected").never();
    assert.strictEqual(oCache.fetchLateProperty({}, {}, "('1')", "property", "property"), undefined);
});
QUnit.test("Cache#getDownloadQueryOptions", function (assert) {
    var mQueryOptions = {}, oCache = new _Cache(this.oRequestor, "Employees", mQueryOptions, false);
    assert.strictEqual(oCache.getDownloadQueryOptions(mQueryOptions), mQueryOptions);
});
QUnit.test("Cache#getDownloadUrl: empty path", function (assert) {
    var mDownloadQueryOptions = {}, mQueryOptions = {}, oCache = new _Cache(this.oRequestor, "Employees", mQueryOptions, false), oHelperMock = this.mock(_Helper);
    oCache.sMetaPath = "/cache/meta/path";
    oHelperMock.expects("buildPath").withExactArgs("Employees", "").returns("resource/path");
    oHelperMock.expects("getMetaPath").withExactArgs("").returns("meta/path");
    oHelperMock.expects("buildPath").withExactArgs("/cache/meta/path", "meta/path").returns("~");
    this.mock(oCache).expects("getDownloadQueryOptions").withExactArgs(sinon.match.same(mQueryOptions)).returns(mDownloadQueryOptions);
    this.mock(this.oRequestor).expects("buildQueryString").withExactArgs("~", sinon.match.same(mDownloadQueryOptions)).returns("?~query~");
    assert.strictEqual(oCache.getDownloadUrl(""), "/~/resource/path?~query~");
});
QUnit.test("Cache#getDownloadUrl: non-empty path", function (assert) {
    var mCustomQueryOptions = {}, mDownloadQueryOptions = {}, mQueryOptions = {}, oCache = new _Cache(this.oRequestor, "Employees", mQueryOptions, false), oHelperMock = this.mock(_Helper), mQueryOptionsForPath = {}, mResultingQueryOptions = {};
    oCache.sMetaPath = "/cache/meta/path";
    oHelperMock.expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(mQueryOptions), "cache/path").returns(mQueryOptionsForPath);
    oHelperMock.expects("merge").withExactArgs({}, sinon.match.same(mCustomQueryOptions), sinon.match.same(mQueryOptionsForPath)).returns(mResultingQueryOptions);
    oHelperMock.expects("buildPath").withExactArgs("Employees", "cache/path").returns("resource/path");
    oHelperMock.expects("getMetaPath").withExactArgs("cache/path").returns("meta/path");
    oHelperMock.expects("buildPath").withExactArgs("/cache/meta/path", "meta/path").returns("~");
    this.mock(oCache).expects("getDownloadQueryOptions").withExactArgs(sinon.match.same(mResultingQueryOptions)).returns(mDownloadQueryOptions);
    this.mock(this.oRequestor).expects("buildQueryString").withExactArgs("~", sinon.match.same(mDownloadQueryOptions)).returns("?~query~");
    assert.strictEqual(oCache.getDownloadUrl("cache/path", mCustomQueryOptions), "/~/resource/path?~query~");
});
QUnit.test("Cache#getResourcePath", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees");
    assert.strictEqual(oCache.getResourcePath(), "Employees");
});
QUnit.test("Cache#hasSentRequest", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees");
    oCache.bSentRequest = "bSentRequest";
    assert.strictEqual(oCache.hasSentRequest(), "bSentRequest");
});
[{
        bindingFilter: "filter",
        count: 42,
        created: false,
        queryFilter: "filter"
    }, {
        bindingFilter: undefined,
        count: 43,
        created: true,
        queryFilter: "~filter~"
    }, {
        bindingFilter: "filter",
        count: 43,
        created: true,
        queryFilter: "(filter) and ~filter~"
    }].forEach(function (oFixture) {
    QUnit.test("Cache#requestCount: " + JSON.stringify(oFixture), function (assert) {
        var oCache = this.createCache("Employees", {
            "sap-client": "123",
            $apply: "apply",
            $count: true,
            $expand: "expand",
            $filter: oFixture.bindingFilter,
            $orderby: "orderby",
            $search: "search",
            $select: "select"
        }), oGroupLock = { getUnlockedCopy: function () { } }, oGroupLockCopy = {}, sQueryOptions = JSON.stringify(oCache.mQueryOptions);
        oCache.aElements.$created = oFixture.created ? 1 : 0;
        this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns(oFixture.created ? "~filter~" : undefined);
        this.mock(this.oRequestor).expects("buildQueryString").withExactArgs(oCache.sMetaPath, {
            "sap-client": "123",
            $apply: "apply",
            $count: true,
            $filter: oFixture.queryFilter,
            $search: "search",
            $top: 0
        }).returns("?~");
        this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
        this.mock(this.oRequestor).expects("request").withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy)).resolves({ "@odata.count": "42" });
        this.mock(_Helper).expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oCache.aElements), { $count: oFixture.count });
        return oCache.requestCount(oGroupLock).then(function () {
            assert.strictEqual(JSON.stringify(oCache.mQueryOptions), sQueryOptions, "unchanged");
            assert.strictEqual(oCache.iLimit, oFixture.count);
        });
    });
});
QUnit.test("Cache#requestCount: exclusive $filter before $top", function (assert) {
    var oCache = this.createCache("Employees", { $count: true }), oGroupLock = { getUnlockedCopy: function () { } }, oGroupLockCopy = {};
    oCache.aElements.$created = 1;
    this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns("~filter~");
    this.mock(this.oRequestor).expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.object).callsFake(function (_sMetaPath, mQueryOptions) {
        assert.deepEqual(Object.keys(mQueryOptions), ["$count", "$filter", "$top"]);
        return "?~";
    });
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
    this.mock(this.oRequestor).expects("request").withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy)).resolves({ "@odata.count": "42" });
    return oCache.requestCount(oGroupLock);
});
[false, true].forEach(function (bRetryFailed) {
    var sTitle = "Cache#requestCount: failed with 404 for DELETE in same $batch, retry failed " + "also: " + bRetryFailed;
    QUnit.test(sTitle, function (assert) {
        var oCache = this.createCache("Employees", { $count: true }), oError = new Error("HTTP request failed because the previous request failed"), oGroupLock = { getUnlockedCopy: function () { } }, oGroupLockCopy1 = {}, oGroupLockCopy2 = {}, oGroupLockMock = this.mock(oGroupLock), oRequestorMock = this.mock(this.oRequestor), oRetryError = new Error("Count failed");
        oError.cause = { status: 404 };
        this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns(undefined);
        oRequestorMock.expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.object).returns("?~");
        oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy1);
        oRequestorMock.expects("request").withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy1)).rejects(oError);
        oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy2);
        oRequestorMock.expects("request").withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy2)).returns(bRetryFailed ? Promise.reject(oRetryError) : Promise.resolve({ "@odata.count": "42" }));
        return oCache.requestCount(oGroupLock).then(function () {
            assert.notOk(bRetryFailed);
            assert.strictEqual(oCache.iLimit, 42);
        }, function (oError) {
            assert.ok(bRetryFailed);
            assert.strictEqual(oError, oRetryError);
        });
    });
});
QUnit.test("Cache#requestCount: fails with another error", function (assert) {
    var oCache = this.createCache("Employees", { $count: true }), oError = new Error("Another Error"), oGroupLock = { getUnlockedCopy: function () { } }, oGroupLockCopy = {};
    this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns(undefined);
    this.mock(this.oRequestor).expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match.object).returns("?~");
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
    this.mock(this.oRequestor).expects("request").withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy)).rejects(oError);
    return oCache.requestCount(oGroupLock).then(function () {
        assert.ok(false, "unexpected");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("Cache#requestCount: nothing to do", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Employees");
    this.mock(this.oRequestor).expects("request").never();
    assert.strictEqual(oCache.requestCount({}, "", undefined), undefined);
    oCache = new _Cache(this.oRequestor, "Employees", {});
    assert.strictEqual(oCache.requestCount({}, "", undefined), undefined);
});
[false, true].forEach(function (bSharedRequest) {
    QUnit.test("CollectionCache: bSharedRequest = " + bSharedRequest, function (assert) {
        var oCache, mQueryOptions = {};
        this.mock(_Cache.prototype).expects("setQueryOptions").withExactArgs(sinon.match.same(mQueryOptions));
        this.mock(_Cache.prototype).expects("setResourcePath").withExactArgs("resource/path").callsFake(function () {
            assert.notOk(this.bSharedRequest, "must not have been set yet");
        });
        oCache = _Cache.create(this.oRequestor, "resource/path", mQueryOptions, "bSortExpandSelect", "deep/resource/path", bSharedRequest);
        assert.strictEqual(oCache.oRequestor, this.oRequestor);
        assert.strictEqual(oCache.bSortExpandSelect, "bSortExpandSelect");
        assert.ok(typeof oCache.fnGetOriginalResourcePath, "function");
        assert.strictEqual(oCache.fnGetOriginalResourcePath(), "deep/resource/path");
        assert.strictEqual(oCache.bSharedRequest, bSharedRequest ? true : undefined);
    });
});
[
    { index: 1, length: 1, result: [{ key: "b" }], types: true },
    { index: 0, length: 2, result: [{ key: "a" }, { key: "b" }], types: true },
    { index: 4, length: 5, result: [] },
    { index: 5, length: 6, serverCount: "2", result: [], count: 2 },
    { index: 1, length: 5, result: [{ key: "b" }, { key: "c" }], count: 3, types: false }
].forEach(function (oFixture) {
    QUnit.test("CollectionCache#read(" + oFixture.index + ", " + oFixture.length + ")", function (assert) {
        var oCache, oCacheMock, aData = [{ key: "a" }, { key: "b" }, { key: "c" }], oMockResult = {
            "@odata.context": "$metadata#TEAMS",
            value: aData.slice(oFixture.index, oFixture.index + oFixture.length)
        }, oPromise, mQueryOptions = {}, oReadGroupLock0 = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oReadGroupLock1 = { unlock: function () { } }, oRequestGroupLock = {}, sResourcePath = "Employees", mTypeForMetaPath = oFixture.types ? {
            "/Employees": {
                $Key: ["key"],
                key: { $Type: "Edm.String" }
            }
        } : {}, that = this;
        if (oFixture.serverCount) {
            oMockResult["@odata.count"] = oFixture.serverCount;
        }
        this.mock(oReadGroupLock0).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
        this.mock(oReadGroupLock0).expects("unlock").withExactArgs();
        this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + "?$skip=" + oFixture.index + "&$top=" + oFixture.length, sinon.match.same(oRequestGroupLock), undefined, undefined, undefined).resolves(oMockResult);
        this.spy(_Helper, "updateExisting");
        oCache = this.createCache(sResourcePath, mQueryOptions);
        oCacheMock = this.mock(oCache);
        oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)));
        this.spy(oCache, "fill");
        oPromise = oCache.read(oFixture.index, oFixture.length, 0, oReadGroupLock0);
        assert.ok(!oPromise.isFulfilled());
        assert.ok(!oPromise.isRejected());
        assert.ok(oCache.bSentRequest);
        sinon.assert.calledWithExactly(oCache.fill, sinon.match.instanceOf(SyncPromise), oFixture.index, oFixture.index + oFixture.length);
        return oPromise.then(function (oResult) {
            var oExpectedResult = {
                "@odata.context": "$metadata#TEAMS",
                value: oFixture.result
            }, oPromise2;
            if (oFixture.types) {
                oFixture.result.forEach(function (oItem) {
                    _Helper.setPrivateAnnotation(oItem, "predicate", "('" + oItem.key + "')");
                });
            }
            if (oFixture.count) {
                sinon.assert.calledWithExactly(_Helper.updateExisting, sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oCache.aElements), { $count: oFixture.count });
            }
            assert.deepEqual(oResult, oExpectedResult);
            assert.strictEqual(oResult.value.$count, oFixture.count);
            if (oFixture.types) {
                oFixture.result.forEach(function (oItem, i) {
                    assert.strictEqual(oCache.aElements.$byPredicate[_Helper.getPrivateAnnotation(oItem, "predicate")], oCache.aElements[oFixture.index + i]);
                });
            }
            else {
                assert.notOk(undefined in oCache.aElements.$byPredicate);
            }
            that.mock(oReadGroupLock1).expects("unlock").withExactArgs();
            oPromise2 = oCache.read(oFixture.index, oFixture.length, 0, oReadGroupLock1);
            return oPromise2.then(function (oResult) {
                assert.deepEqual(oResult, oExpectedResult);
                assert.strictEqual(oResult.value.$count, oFixture.count);
            });
        });
    });
});
QUnit.test("CollectionCache#read w/ created element", function (assert) {
    var oCache = this.createCache("Employees"), fnDataRequested = function () { }, aElements = [{
            "@$ui5._": {
                "transientPredicate": "($uid=id-17-4)"
            }
        }, {
            "@$ui5._": {
                "transientPredicate": "($uid=id-1-23)"
            }
        }, {
            "@$ui5._": {
                "predicate": "('42')"
            }
        }], oGroupLock = { unlock: function () { } }, oSyncPromise;
    oCache.aElements = aElements;
    oCache.aElements.$count = 1;
    oCache.aElements.$created = 2;
    oCache.iLimit = 1;
    this.mock(ODataUtils).expects("_getReadIntervals").withExactArgs(sinon.match.same(oCache.aElements), 0, 100, 0, 2 + 1).returns([]);
    this.mock(oCache).expects("requestElements").never();
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    oSyncPromise = oCache.read(0, 100, 0, oGroupLock, fnDataRequested);
    assert.deepEqual(oSyncPromise.getResult(), {
        "@odata.context": undefined,
        "value": aElements
    });
});
QUnit.test("CollectionCache#read: wait for oPendingRequestsPromise", function (assert) {
    var oCache = this.createCache("Employees"), fnDataRequested = function () { }, oGroupLock = {}, fnResolve, oPromise;
    oCache.oPendingRequestsPromise = new SyncPromise(function (resolve) {
        fnResolve = resolve;
    });
    oCache.aElements.$tail = new Promise(function () { });
    this.mock(ODataUtils).expects("_getReadIntervals").never();
    this.mock(oCache).expects("requestElements").never();
    oPromise = oCache.read(10, 20, 30, oGroupLock, fnDataRequested);
    assert.strictEqual(oPromise.isPending(), true);
    this.mock(oCache).expects("read").withExactArgs(10, 20, 30, sinon.match.same(oGroupLock), sinon.match.same(fnDataRequested)).returns(42);
    fnResolve();
    return oPromise.then(function (vResult) {
        assert.strictEqual(vResult, 42);
    });
});
QUnit.test("CollectionCache#read: create & pending read", function (assert) {
    var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), oCreateGroupLock = { getGroupId: function () { } }, oCreatePromise, oReadPromise;
    oCacheMock.expects("checkSharedRequest").withExactArgs();
    oCacheMock.expects("addPendingRequest").never();
    oCacheMock.expects("removePendingRequest").never();
    this.mock(oCreateGroupLock).expects("getGroupId").withExactArgs().returns("group");
    this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees($uid=id-1-23)").callsFake(function () {
        var fnSubmit = arguments[5];
        return Promise.resolve().then(function () {
            var oAddPendingRequestSpy = oCacheMock.expects("addPendingRequest").withExactArgs();
            fnSubmit();
            assert.ok(oAddPendingRequestSpy.called);
        }).then(function () {
            oCacheMock.expects("removePendingRequest").withExactArgs();
            return {};
        });
    });
    oReadPromise = this.mockRequestAndRead(oCache, 0, "Employees", 0, 3);
    oCreatePromise = oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)", {}, null, function fnSubmitCallback() { });
    return Promise.all([oReadPromise, oCreatePromise]).then(function () {
        assert.deepEqual(oCache.aElements, [
            {
                "@$ui5._": {
                    "transientPredicate": "($uid=id-1-23)"
                },
                "@$ui5.context.isTransient": false
            },
            { key: "a", "@$ui5._": { "predicate": "('a')" } },
            { key: "b", "@$ui5._": { "predicate": "('b')" } },
            { key: "c", "@$ui5._": { "predicate": "('c')" } }
        ]);
    });
});
QUnit.test("CollectionCache#read: cancel create & pending read", function (assert) {
    var oCache = this.createCache("Employees"), oError = new Error(), oExpectation, aPromises, oUpdateGroupLock = {
        cancel: function () { },
        getGroupId: function () { }
    };
    oError.canceled = true;
    this.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs().returns("update");
    this.mock(oUpdateGroupLock).expects("cancel").withExactArgs();
    oExpectation = this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oUpdateGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees($uid=id-1-23)").rejects(oError);
    this.mock(oCache).expects("addPendingRequest").never();
    this.mock(oCache).expects("removePendingRequest").never();
    aPromises = [
        oCache.create(oUpdateGroupLock, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)", {}).catch(function () { }),
        this.mockRequestAndRead(oCache, 1, "Employees", 0, 3)
    ];
    oExpectation.args[0][6]();
    return Promise.all(aPromises).then(function () {
        assert.deepEqual(oCache.aElements, [
            { key: "a", "@$ui5._": { "predicate": "('a')" } },
            { key: "b", "@$ui5._": { "predicate": "('b')" } },
            { key: "c", "@$ui5._": { "predicate": "('c')" } }
        ]);
    });
});
QUnit.test("CollectionCache#read: removeElement & pending read (failing)", function (assert) {
    var oCache = this.createCache("Employees"), that = this;
    return this.mockRequestAndRead(oCache, 0, "Employees", 0, 3).then(function () {
        var oReadPromise, oReadGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oUnlockedCopy = {};
        that.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
        that.mock(oReadGroupLock).expects("unlock").withExactArgs();
        that.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=3&$top=3", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).returns(Promise.reject(new Error()));
        oReadPromise = oCache.read(3, 3, 0, oReadGroupLock);
        oCache.removeElement(oCache.aElements, 1, "('b')", "");
        return oReadPromise;
    }).then(function () {
        assert.ok(false);
    }, function () {
        assert.deepEqual(oCache.aElements, [
            { key: "a", "@$ui5._": { "predicate": "('a')" } },
            { key: "c", "@$ui5._": { "predicate": "('c')" } },
            undefined,
            undefined,
            undefined
        ]);
        assert.deepEqual(oCache.aReadRequests, [], "cleaned up properly");
    });
});
QUnit.test("CollectionCache#read: removeElement & pending reads", function (assert) {
    var oCache = this.createCache("Employees"), oReadPromise1, fnResolve, that = this;
    return this.mockRequestAndRead(oCache, 0, "Employees", 3, 3).then(function () {
        var oPromise = new Promise(function (resolve) {
            fnResolve = resolve;
        }), oReadGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oReadPromise2, oUnlockedCopy = {};
        that.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
        that.mock(oReadGroupLock).expects("unlock").withExactArgs();
        that.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=6&$top=3", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).returns(oPromise);
        oReadPromise1 = oCache.read(6, 3, 0, oReadGroupLock);
        oReadPromise2 = that.mockRequestAndRead(oCache, 0, "Employees", 1, 2);
        oCache.removeElement(oCache.aElements, 4, "('e')", "");
        return oReadPromise2;
    }).then(function () {
        oCache.removeElement(oCache.aElements, 4, "('f')", "");
        fnResolve(createResult(6, 3));
        return oReadPromise1;
    }).then(function () {
        assert.deepEqual(oCache.aElements, [
            undefined,
            { key: "b", "@$ui5._": { "predicate": "('b')" } },
            { key: "c", "@$ui5._": { "predicate": "('c')" } },
            { key: "d", "@$ui5._": { "predicate": "('d')" } },
            { key: "g", "@$ui5._": { "predicate": "('g')" } },
            { key: "h", "@$ui5._": { "predicate": "('h')" } },
            { key: "i", "@$ui5._": { "predicate": "('i')" } }
        ]);
        assert.deepEqual(oCache.aReadRequests, [], "cleaned up properly");
    });
});
QUnit.test("CollectionCache#read: pending deletes", function () {
    var oCache = this.createCache("Employees"), that = this;
    return this.mockRequestAndRead(oCache, 0, "Employees", 0, 6).then(function () {
        var oDeleteGroupLock0 = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oDeleteGroupLockCopy0 = {}, oDeleteGroupLock1 = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oDeleteGroupLockCopy1 = {}, oDeleteGroupLock2 = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oDeleteGroupLockCopy2 = {}, oGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oUnlockedCopy = {};
        that.mock(oDeleteGroupLock0).expects("getUnlockedCopy").withExactArgs().returns(oDeleteGroupLockCopy0);
        that.oRequestorMock.expects("request").withArgs("DELETE", "Employees('b')", sinon.match.same(oDeleteGroupLockCopy0)).resolves();
        that.mock(oDeleteGroupLock1).expects("getUnlockedCopy").withExactArgs().returns(oDeleteGroupLockCopy1);
        that.oRequestorMock.expects("request").withArgs("DELETE", "Employees('c')", sinon.match.same(oDeleteGroupLockCopy1)).callsFake(function () {
            return new Promise(function (resolve) {
                setTimeout(resolve);
            });
        });
        that.mock(oDeleteGroupLock2).expects("getUnlockedCopy").withExactArgs().returns(oDeleteGroupLockCopy2);
        that.oRequestorMock.expects("request").withArgs("DELETE", "Employees('d')", sinon.match.same(oDeleteGroupLockCopy2)).rejects(new Error());
        that.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
        that.oRequestorMock.expects("request").withArgs("GET", "Employees?$skip=4&$top=5", sinon.match.same(oUnlockedCopy)).resolves(createResult(4, 5));
        return Promise.all([
            oCache._delete(oDeleteGroupLock0, "Employees('b')", "1", undefined, function () { }),
            oCache._delete(oDeleteGroupLock1, "Employees('c')", "2", undefined, function () { }),
            oCache._delete(oDeleteGroupLock2, "Employees('d')", "3", undefined, function () { }).catch(function () { }),
            oCache.read(3, 6, 0, oGroupLock)
        ]);
    });
});
[false, true].forEach(function (bServerDrivenPaging) {
    QUnit.test("CollectionCache#read: prefetch, SDP = " + bServerDrivenPaging, function (assert) {
        var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), oReadGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oUnlockedCopy = {};
        oCache.bServerDrivenPaging = bServerDrivenPaging;
        this.mock(ODataUtils).expects("_getReadIntervals").withExactArgs(sinon.match.same(oCache.aElements), 20, 6, bServerDrivenPaging ? 0 : 10, oCache.aElements.$created + oCache.iLimit).returns([{ start: 15, end: 31 }]);
        this.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
        this.mock(oReadGroupLock).expects("unlock").withExactArgs();
        this.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=15&$top=16", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).returns(Promise.resolve(createResult(15, 16)));
        return oCache.read(20, 6, 10, oReadGroupLock).then(function (oResult) {
            assert.deepEqual(oResult, createResult(20, 6, undefined, true));
        });
    });
});
QUnit.test("CollectionCache#fill", function (assert) {
    var oCache = this.createCache("Employees"), aExpected, oPromise = {};
    assert.deepEqual(oCache.aElements, []);
    oCache.fill(oPromise, 0, 3);
    assert.deepEqual(oCache.aElements, [oPromise, oPromise, oPromise]);
    oCache.fill(oPromise, 5, 7);
    aExpected = [oPromise, oPromise, oPromise, undefined, undefined, oPromise, oPromise];
    assert.deepEqual(oCache.aElements, aExpected);
    oCache.fill(oPromise, 10, Infinity);
    assert.deepEqual(oCache.aElements, aExpected);
    assert.strictEqual(oCache.aElements.$tail, oPromise);
    assert.throws(function () {
        oCache.fill({}, 0, Infinity);
    }, new Error("Cannot fill from 0 to Infinity, $tail already in use, # of elements is 7"));
    assert.deepEqual(oCache.aElements, aExpected);
    assert.strictEqual(oCache.aElements.$tail, oPromise);
    oCache.fill(undefined, 0, Infinity);
    aExpected.fill(undefined, 0);
    assert.deepEqual(oCache.aElements, aExpected);
    assert.strictEqual(oCache.aElements.$tail, undefined);
});
QUnit.test("CollectionCache#fill, iEnd = 1024", function (assert) {
    var oCache = this.createCache("Employees"), oPromise = {};
    assert.deepEqual(oCache.aElements, []);
    oCache.fill(oPromise, 0, 1024);
    assert.deepEqual(oCache.aElements, new Array(1024).fill(oPromise, 0));
    assert.strictEqual(oCache.aElements.$tail, undefined);
});
QUnit.test("CollectionCache#fill, iEnd = 1025, []", function (assert) {
    var oCache = this.createCache("Employees"), oPromise = {};
    assert.deepEqual(oCache.aElements, []);
    oCache.fill(oPromise, 0, 1025);
    assert.deepEqual(oCache.aElements, []);
    assert.strictEqual(oCache.aElements.$tail, oPromise);
});
QUnit.test("CollectionCache#fill, iEnd = 1025, [many rows] & $tail", function (assert) {
    var oCache = this.createCache("Employees"), aExpected, oPromiseNew = {}, oPromiseOld = {};
    oCache.aElements.length = 4096;
    oCache.aElements.fill(oPromiseOld, 2048);
    oCache.aElements.$tail = oPromiseOld;
    oCache.fill(oPromiseNew, 0, 1025);
    aExpected = new Array(4096);
    aExpected.fill(oPromiseNew, 0, 1025);
    aExpected.fill(oPromiseOld, 2048, 4096);
    assert.deepEqual(oCache.aElements, aExpected);
    assert.strictEqual(oCache.aElements.$tail, oPromiseOld);
});
QUnit.test("CollectionCache#fill, iEnd = Infinity, [many rows]", function (assert) {
    var oCache = this.createCache("Employees"), aExpected, oPromiseNew = {}, oPromiseOld = {};
    oCache.aElements.length = 4096;
    oCache.aElements.fill(oPromiseOld, 2048);
    oCache.fill(oPromiseNew, 0, Infinity);
    aExpected = new Array(4096);
    aExpected.fill(oPromiseNew, 0, 4096);
    assert.deepEqual(oCache.aElements, aExpected);
    assert.strictEqual(oCache.aElements.$tail, oPromiseNew);
});
[{
        oPromise: SyncPromise.resolve("c"),
        vValue: "c"
    }, {
        oPromise: new SyncPromise(function () { }),
        vValue: undefined
    }].forEach(function (oFixture, i) {
    QUnit.test("CollectionCache#getValue " + i, function (assert) {
        var oCache = this.createCache("Employees");
        this.mock(oCache).expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), "('c')/key", sinon.match.same(_GroupLock.$cached)).returns(SyncPromise.resolve(oFixture.oPromise));
        assert.strictEqual(oCache.getValue("('c')/key"), oFixture.vValue);
    });
});
QUnit.test("CollectionCache#requestElements: clean up $tail again", function (assert) {
    var oCache = this.createCache("Employees"), oReadGroupLock0 = {}, oReadGroupLock1 = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, fnResolve;
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees", sinon.match.same(oReadGroupLock0), undefined, undefined, undefined).returns(new Promise(function (resolve) {
        fnResolve = resolve;
    }));
    oCache.requestElements(0, Infinity, oReadGroupLock0);
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=0&$top=1", sinon.match.same(oReadGroupLock1), undefined, undefined, undefined).returns(Promise.resolve(createResult(0, 1)));
    oCache.requestElements(0, 1, oReadGroupLock1);
    return oCache.aElements[0].then(function () {
        fnResolve(createResult(0, 1));
        return oCache.aElements.$tail.then(function () {
            assert.strictEqual(oCache.aElements.$tail, undefined);
        });
    });
});
QUnit.test("CollectionCache#getFilterExcludingCreated: no created entities", function (assert) {
    var oCache = this.createCache("Employees");
    assert.strictEqual(oCache.getFilterExcludingCreated(), undefined);
});
[false, true].forEach(function (bMultiple) {
    var sTitle = "CollectionCache#getFilterExcludingCreated: one created entity, " + "multiple persisted entities: " + bMultiple;
    QUnit.test(sTitle, function (assert) {
        var oCache = this.createCache("Employees", {}), oElement0 = {}, oElement1 = { "@$ui5.context.isTransient": true }, oElement2 = {}, oElement3 = {}, sExclusiveFilter = bMultiple ? "not (EmployeeId eq '43' or EmployeeId eq '42')" : "not (EmployeeId eq '42')", oHelperMock = this.mock(_Helper), mTypeForMetaPath = {};
        oCache.aElements.$created = bMultiple ? 4 : 1;
        oCache.aElements.unshift(oElement0);
        if (bMultiple) {
            oCache.aElements.unshift(oElement1);
            oCache.aElements.unshift(oElement2);
            oCache.aElements.unshift(oElement3);
            oHelperMock.expects("getKeyFilter").withExactArgs(sinon.match.same(oElement2), oCache.sMetaPath, sinon.match.same(mTypeForMetaPath)).returns("EmployeeId eq '43'");
            oHelperMock.expects("getKeyFilter").withExactArgs(sinon.match.same(oElement3), oCache.sMetaPath, sinon.match.same(mTypeForMetaPath)).returns(undefined);
        }
        this.mock(oCache).expects("fetchTypes").returns(SyncPromise.resolve(mTypeForMetaPath));
        oHelperMock.expects("getKeyFilter").withExactArgs(sinon.match.same(oElement0), oCache.sMetaPath, sinon.match.same(mTypeForMetaPath)).returns("EmployeeId eq '42'");
        assert.strictEqual(oCache.getFilterExcludingCreated(), sExclusiveFilter);
    });
});
QUnit.test("CollectionCache#getQueryString: no exclusive filter", function (assert) {
    var oCache = this.createCache("Employees");
    oCache.sQueryString = "?foo=bar";
    this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns(undefined);
    assert.strictEqual(oCache.getQueryString(), oCache.sQueryString);
    assert.strictEqual(oCache.sQueryString, "?foo=bar");
});
["?foo=bar", ""].forEach(function (sQuery) {
    QUnit.test("CollectionCache#getQueryString: no own filter, query=" + sQuery, function (assert) {
        var oCache = this.createCache("Employees");
        oCache.sQueryString = sQuery;
        this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns("~exclusive~");
        this.mock(_Helper).expects("encode").withExactArgs("~exclusive~", false).returns("~encoded~");
        assert.strictEqual(oCache.getQueryString(), sQuery ? sQuery + "&$filter=~encoded~" : "?$filter=~encoded~");
        assert.strictEqual(oCache.sQueryString, sQuery);
    });
});
QUnit.test("CollectionCache#getQueryString: own and exclusive filter", function (assert) {
    var oCache = this.createCache("Employees", {
        foo: "bar",
        $filter: "~own~"
    });
    oCache.bSortExpandSelect = "bSortExpandSelect";
    this.mock(oCache).expects("getFilterExcludingCreated").withExactArgs().returns("~exclusive~");
    this.mock(this.oRequestor).expects("buildQueryString").withExactArgs(oCache.sMetaPath, {
        foo: "bar",
        $filter: "(~own~) and ~exclusive~"
    }, false, "bSortExpandSelect").returns("?~");
    assert.strictEqual(oCache.getQueryString(), "?~");
    assert.strictEqual(oCache.mQueryOptions.$filter, "~own~");
});
[{
        iEnd: Infinity,
        sQueryString: "",
        iStart: 42,
        sResourcePath: "Employees?$skip=42"
    }, {
        iEnd: Infinity,
        sQueryString: "?foo",
        iStart: 42,
        sResourcePath: "Employees?foo&$skip=42"
    }, {
        iEnd: 55,
        sQueryString: "?foo",
        iStart: 42,
        sResourcePath: "Employees?foo&$skip=42&$top=13"
    }, {
        iEnd: 10,
        sQueryString: "?foo",
        iStart: 0,
        sResourcePath: "Employees?foo&$skip=0&$top=10"
    }, {
        iEnd: Infinity,
        sQueryString: "?foo",
        iStart: 0,
        sResourcePath: "Employees?foo"
    }, {
        iEnd: undefined,
        sQueryString: "",
        iStart: 42,
        sResourcePath: "Employees?$skip=42"
    }].forEach(function (oFixture, i) {
    QUnit.test("CollectionCache#getResourcePathWithQuery: " + i, function (assert) {
        var oCache = this.createCache("Employees");
        oCache.sQueryString = oFixture.sQueryString;
        assert.strictEqual(oCache.getResourcePathWithQuery(oFixture.iStart, oFixture.iEnd), oFixture.sResourcePath);
    });
});
[{
        iEnd: Infinity,
        sQueryString: "",
        iStart: 43,
        sResourcePath: "Employees?$skip=41"
    }, {
        iEnd: Infinity,
        sQueryString: "?foo",
        iStart: 43,
        sResourcePath: "Employees?foo&$skip=41"
    }, {
        iEnd: 56,
        sQueryString: "?foo",
        iStart: 43,
        sResourcePath: "Employees?foo&$skip=41&$top=13"
    }, {
        iEnd: 11,
        sQueryString: "?foo",
        iStart: 2,
        sResourcePath: "Employees?foo&$skip=0&$top=9"
    }, {
        iEnd: Infinity,
        sQueryString: "?foo",
        iStart: 2,
        sResourcePath: "Employees?foo"
    }, {
        iEnd: undefined,
        sQueryString: "",
        iStart: 43,
        sResourcePath: "Employees?$skip=41"
    }].forEach(function (oFixture, i) {
    var sTitle = "CollectionCache#getResourcePathWithQuery: with create #" + i;
    QUnit.test(sTitle, function (assert) {
        var oCache = this.createCache("Employees"), oCreateGroupLock0 = { getGroupId: function () { } }, oCreateGroupLock1 = { getGroupId: function () { } };
        this.mock(oCache).expects("getQueryString").returns(oFixture.sQueryString);
        this.mock(oCreateGroupLock0).expects("getGroupId").withExactArgs().returns("create");
        this.oRequestorMock.expects("request").withArgs("POST", "Employees", sinon.match.same(oCreateGroupLock0)).callsArg(5).resolves({});
        oCache.create(oCreateGroupLock0, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)", {}, null, function fnSubmitCallback() { });
        this.mock(oCreateGroupLock1).expects("getGroupId").withExactArgs().returns("create");
        this.oRequestorMock.expects("request").withArgs("POST", "Employees", sinon.match.same(oCreateGroupLock1)).callsArg(5).resolves({});
        oCache.create(oCreateGroupLock1, SyncPromise.resolve("Employees"), "", "($uid=id-1-24)", {}, null, function fnSubmitCallback() { });
        assert.strictEqual(oCache.getResourcePathWithQuery(oFixture.iStart, oFixture.iEnd), oFixture.sResourcePath);
    });
});
QUnit.test("CollectionCache#getResourcePathWithQuery: not for created!", function (assert) {
    var oCache = this.createCache("Employees"), oCreateGroupLock0 = { getGroupId: function () { } }, oCreateGroupLock1 = { getGroupId: function () { } };
    this.mock(oCreateGroupLock0).expects("getGroupId").withExactArgs().returns("create");
    this.oRequestorMock.expects("request").withArgs("POST", "Employees", sinon.match.same(oCreateGroupLock0)).callsArg(5).resolves({});
    oCache.create(oCreateGroupLock0, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)", {}, null, function fnSubmitCallback() { });
    this.mock(oCreateGroupLock1).expects("getGroupId").withExactArgs().returns("create");
    this.oRequestorMock.expects("request").withArgs("POST", "Employees", sinon.match.same(oCreateGroupLock1)).callsArg(5).resolves({});
    oCache.create(oCreateGroupLock1, SyncPromise.resolve("Employees"), "", "($uid=id-1-24)", {}, null, function fnSubmitCallback() { });
    assert.throws(function () {
        oCache.getResourcePathWithQuery(0, 2);
    }, new Error("Must not request created element"));
    assert.throws(function () {
        oCache.getResourcePathWithQuery(1, 2);
    }, new Error("Must not request created element"));
});
[true, false].forEach(function (bWithCount) {
    QUnit.test("CollectionCache#handleResponse: " + bWithCount, function (assert) {
        var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), mChangeListeners = {}, sDataContext = {}, oElement0 = {}, oElement1 = {}, aElements = [], oFetchTypesResult = {}, iLimit = {}, oResult = {
            "@odata.context": sDataContext,
            "value": [oElement0, oElement1]
        };
        oCache.mChangeListeners = mChangeListeners;
        aElements.$byPredicate = {};
        aElements.$created = 2;
        oCache.aElements = aElements;
        oCache.iLimit = iLimit;
        if (bWithCount) {
            oResult["@odata.count"] = "4";
        }
        oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult), undefined, undefined, undefined, 2).callsFake(function () {
            _Helper.setPrivateAnnotation(oElement0, "predicate", "foo");
        });
        this.mock(_Helper).expects("updateExisting").withExactArgs(sinon.match.same(mChangeListeners), "", sinon.match.same(aElements), { $count: 6 }).exactly(bWithCount ? 1 : 0);
        oCache.handleResponse(2, 4, oResult, oFetchTypesResult);
        assert.strictEqual(oCache.sContext, sDataContext);
        assert.strictEqual(oCache.iLimit, bWithCount ? 4 : iLimit);
        assert.strictEqual(oCache.aElements[2], oElement0);
        assert.strictEqual(oCache.aElements[3], oElement1);
        assert.strictEqual(oCache.aElements.$byPredicate["foo"], oElement0);
        assert.strictEqual(Object.keys(oCache.aElements.$byPredicate).length, 1);
    });
});
[{
        sTitle: "empty read after @odata.count returned from server",
        iCount: 42,
        iStart: 100,
        iExpectedCount: 42,
        iExpectedLength: 42,
        iExpectedLimit: 42
    }, {
        sTitle: "short read without server length",
        iStart: 100,
        vValue: [{}],
        iExpectedCount: 101,
        iExpectedLength: 101,
        iExpectedLimit: 101
    }, {
        sTitle: "empty read without knowing length",
        iStart: 100,
        iExpectedCount: undefined,
        iExpectedLength: 100,
        iExpectedLimit: 100
    }, {
        sTitle: "empty read starting at 0",
        iStart: 0,
        iExpectedCount: 0,
        iExpectedLength: 0,
        iExpectedLimit: 0
    }, {
        sTitle: "empty read before @odata.count returned from server",
        iCount: 42,
        iStart: 30,
        iExpectedCount: 30,
        iExpectedLength: 30,
        iExpectedLimit: 30
    }, {
        iCount: 3,
        iCreated: 3,
        iExpectedCount: 6,
        iExpectedLength: 6,
        iExpectedLimit: 3,
        iStart: 5,
        sTitle: "short read while created elements are present, @odata.count OK",
        vValue: [{}]
    }, {
        iCount: 4,
        iCreated: 3,
        iExpectedCount: 6,
        iExpectedLength: 6,
        iExpectedLimit: 3,
        iStart: 5,
        sTitle: "short read while created elements are present, @odata.count wrong",
        vValue: [{}]
    }].forEach(function (oFixture) {
    QUnit.test("CollectionCache#handleResponse: " + oFixture.sTitle, function (assert) {
        var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), aElements = [], oFetchTypesResult = {}, oHelperMock = this.mock(_Helper), oResult = {
            "@odata.context": "foo",
            "value": oFixture.vValue || []
        };
        oCache.mChangeListeners = {};
        oCache.aElements = aElements;
        oCache.aElements.$count = undefined;
        oCache.aElements.$created = oFixture.iCreated || 0;
        if (oFixture.iCount) {
            oResult["@odata.count"] = "" + oFixture.iCount;
        }
        oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult), undefined, undefined, undefined, oFixture.iStart);
        oHelperMock.expects("updateExisting").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oCache.aElements), { $count: oFixture.iExpectedCount });
        oCache.handleResponse(oFixture.iStart, oFixture.iStart + 10, oResult, oFetchTypesResult);
        assert.strictEqual(oCache.aElements.length, oFixture.iExpectedLength, "length");
        assert.strictEqual(oCache.iLimit, oFixture.iExpectedLimit, "iLimit");
    });
});
QUnit.test("CollectionCache#handleResponse: server-driven paging at end", function (assert) {
    var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), oElement5 = {}, oFetchTypesResult = {}, oHelperMock = this.mock(_Helper), i, oReadPromise = {}, oResult = {
        "@odata.context": "foo",
        "@odata.nextLink": "~nextLink",
        "value": [oElement5]
    };
    oCache.mChangeListeners = {};
    oCache.aElements = new Array(10);
    oCache.aElements.fill(oReadPromise, 5, 10);
    oCache.aElements.$count = undefined;
    oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult), undefined, undefined, undefined, 5);
    oHelperMock.expects("updateExisting").never();
    oCache.handleResponse(5, 10, oResult, oFetchTypesResult);
    assert.strictEqual(oCache.aElements.length, 6, "length");
    assert.strictEqual(oCache.iLimit, Infinity, "iLimit");
    assert.strictEqual(oCache.aElements[5], oElement5);
    assert.strictEqual(oCache.bServerDrivenPaging, true);
    for (i = 6; i < 10; i += 1) {
        assert.strictEqual(oCache.aElements[i], undefined);
        assert.notOk(oCache.aElements.hasOwnProperty(i));
    }
});
QUnit.test("CollectionCache#handleResponse: server-driven paging for gap", function (assert) {
    var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), oElement10 = {}, oElement5 = {}, oFetchTypesResult = {}, oHelperMock = this.mock(_Helper), i, oReadPromise = {}, oResult = {
        "@odata.context": "foo",
        "@odata.nextLink": "~nextLink",
        "value": [oElement5]
    };
    oCache.mChangeListeners = {};
    oCache.aElements = [];
    oCache.aElements[10] = oElement10;
    oCache.aElements.fill(oReadPromise, 5, 10);
    oCache.aElements.$count = undefined;
    oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult), undefined, undefined, undefined, 5);
    oHelperMock.expects("updateExisting").never();
    oCache.handleResponse(5, 10, oResult, oFetchTypesResult);
    assert.strictEqual(oCache.aElements.length, 11, "length");
    assert.strictEqual(oCache.iLimit, Infinity, "iLimit");
    assert.strictEqual(oCache.aElements[5], oElement5);
    assert.strictEqual(oCache.bServerDrivenPaging, true);
    for (i = 6; i < 10; i += 1) {
        assert.strictEqual(oCache.aElements[i], undefined);
        assert.notOk(oCache.aElements.hasOwnProperty(i));
    }
    assert.strictEqual(oCache.aElements[10], oElement10);
});
["old", "new"].forEach(function (sResultETag) {
    var sTitle = "CollectionCache#handleResponse: kept-alive element, eTag=" + sResultETag;
    QUnit.test(sTitle, function (assert) {
        var oCache = this.createCache("Employees"), oElement0 = {}, oElement1 = {
            "@odata.etag": sResultETag
        }, aElements = [], oFetchTypesResult = {}, oKeptElement = {
            "@odata.etag": "old"
        }, oResult = {
            value: [oElement0, oElement1]
        };
        aElements.$byPredicate = {
            bar: oKeptElement
        };
        oCache.aElements = aElements;
        this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult), undefined, undefined, undefined, 2).callsFake(function () {
            _Helper.setPrivateAnnotation(oElement0, "predicate", "foo");
            _Helper.setPrivateAnnotation(oElement1, "predicate", "bar");
        });
        this.mock(_Helper).expects("merge").exactly(sResultETag === "old" ? 1 : 0).withExactArgs(sinon.match.same(oElement1), sinon.match.same(oKeptElement));
        this.mock(oCache).expects("hasPendingChangesForPath").exactly(sResultETag === "old" ? 0 : 1).withExactArgs("bar").returns(false);
        oCache.handleResponse(2, 4, oResult, oFetchTypesResult);
        assert.strictEqual(oCache.aElements[2], oElement0);
        assert.strictEqual(oCache.aElements[3], oElement1);
        assert.strictEqual(oCache.aElements.$byPredicate["foo"], oElement0);
        assert.strictEqual(oCache.aElements.$byPredicate["bar"], oElement1);
        assert.strictEqual(Object.keys(oCache.aElements.$byPredicate).length, 2);
    });
});
QUnit.test("CollectionCache#handleResponse: kept-alive, update conflict", function (assert) {
    var oCache = this.createCache("Employees"), oElement = {
        "@odata.etag": "new"
    }, aElements = [], oFetchTypesResult = {}, oKeptElement = {
        "@odata.etag": "old"
    }, oResult = {
        value: [oElement]
    };
    aElements.$byPredicate = {
        "('foo')": oKeptElement
    };
    oCache.aElements = aElements;
    this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult), undefined, undefined, undefined, 2).callsFake(function () {
        _Helper.setPrivateAnnotation(oElement, "predicate", "('foo')");
    });
    this.mock(oCache).expects("hasPendingChangesForPath").withExactArgs("('foo')").returns(true);
    assert.throws(function () {
        oCache.handleResponse(2, 4, oResult, oFetchTypesResult);
    }, new Error("Modified on client and on server: Employees('foo')"));
});
[true, false].forEach(function (bTail) {
    QUnit.test("CollectionCache#requestElements: bTail = " + bTail, function (assert) {
        var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), iEnd = 10, oGroupLock = {}, fnDataRequested = {}, sResourcePath = {}, oResult = {}, iStart = 0, mTypeForMetaPath = {}, oFetchPromise = Promise.resolve(mTypeForMetaPath), oPromise, oRequestPromise = Promise.resolve(oResult);
        oCache.bSentRequest = false;
        oCache.aElements.$tail = undefined;
        oCacheMock.expects("getResourcePathWithQuery").withExactArgs(iStart, iEnd).returns(sResourcePath);
        this.oRequestorMock.expects("request").withExactArgs("GET", sinon.match.same(sResourcePath), sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).returns(oRequestPromise);
        oCacheMock.expects("fetchTypes").withExactArgs().returns(oFetchPromise);
        oCacheMock.expects("handleResponse").withExactArgs(iStart, iEnd, sinon.match.same(oResult), sinon.match.same(mTypeForMetaPath));
        oCacheMock.expects("fill").withExactArgs(sinon.match(function (oSyncPromise) {
            oPromise = oSyncPromise;
            if (bTail) {
                oCache.aElements.$tail = oPromise;
            }
            return oPromise instanceof SyncPromise;
        }), iStart, iEnd);
        oCache.requestElements(iStart, iEnd, oGroupLock, fnDataRequested);
        assert.strictEqual(oCache.bSentRequest, true);
        assert.strictEqual(oCache.aElements.$tail, bTail ? oPromise : undefined);
        return Promise.all([oFetchPromise, oRequestPromise, oPromise]).then(function () {
            assert.strictEqual(oCache.aElements.$tail, undefined);
        });
    });
});
QUnit.test("CollectionCache#requestElements: Error", function (assert) {
    var oCache = this.createCache("Employees"), oCacheMock = this.mock(oCache), iEnd = 10, oError = new Error(), oExpectation, oGroupLock = {}, fnDataRequested = {}, sResourcePath = {}, iStart = 0, mTypes = {}, oFetchPromise = Promise.resolve(mTypes), oRequestPromise = Promise.reject(oError);
    oCache.bSentRequest = false;
    oCacheMock.expects("getResourcePathWithQuery").withExactArgs(iStart, iEnd).returns(sResourcePath);
    this.oRequestorMock.expects("request").withExactArgs("GET", sinon.match.same(sResourcePath), sinon.match.same(oGroupLock), undefined, undefined, sinon.match.same(fnDataRequested)).returns(oRequestPromise);
    oCacheMock.expects("fetchTypes").withExactArgs().returns(oFetchPromise);
    oCacheMock.expects("handleResponse").never();
    oExpectation = oCacheMock.expects("fill").withExactArgs(sinon.match.instanceOf(SyncPromise), iStart, iEnd);
    oCacheMock.expects("fill").withExactArgs(undefined, iStart, iEnd);
    oCache.requestElements(iStart, iEnd, oGroupLock, fnDataRequested);
    assert.strictEqual(oCache.bSentRequest, true);
    return Promise.all([oFetchPromise, oRequestPromise]).catch(function () {
        var oPromise = oExpectation.args[0][0];
        return oPromise.then(function () {
            assert.ok(false, "Promise needs to be rejected");
        }, function (oRequestError) {
            assert.strictEqual(oRequestError, oError);
        });
    });
});
QUnit.test("CollectionCache#read: infinite prefetch, $skip=0", function (assert) {
    var oCache = this.createCache("Employees", undefined, undefined, "deep/resource/path"), oGroupLock = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, oUnlockedCopy = {};
    assert.ok(oCache instanceof _Cache);
    assert.ok("sContext" in oCache);
    assert.strictEqual(oCache.fnGetOriginalResourcePath(), "deep/resource/path");
    assert.deepEqual(oCache.aElements, []);
    assert.deepEqual(oCache.aElements.$byPredicate, {});
    assert.ok("$count" in oCache.aElements);
    assert.strictEqual(oCache.aElements.$count, undefined);
    assert.strictEqual(oCache.aElements.$created, 0);
    assert.ok("$tail" in oCache.aElements);
    assert.strictEqual(oCache.iLimit, Infinity);
    assert.ok("oSyncPromiseAll" in oCache);
    assert.strictEqual(oCache.bServerDrivenPaging, false);
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).resolves(createResult(0, 7));
    return oCache.read(1, 0, Infinity, oGroupLock).then(function (oResult) {
        assert.deepEqual(oResult, createResult(1, 0, undefined, true));
    });
});
QUnit.test("CollectionCache#read: infinite prefetch, no existing data", function (assert) {
    var oCache = this.createCache("Employees"), oGroupLock = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, oUnlockedCopy = {};
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=10", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).resolves(createResult(10, 7));
    this.mock(oCache).expects("fill").withExactArgs(sinon.match.instanceOf(SyncPromise), 10, Infinity).callsFake(function (oPromise) {
        oCache.aElements.$tail = oPromise;
    });
    return oCache.read(10, Infinity, 0, oGroupLock).then(function (oResult) {
        assert.deepEqual(oResult, createResult(10, 7, undefined, true));
    });
});
QUnit.test("CollectionCache#read: infinite prefetch, existing data", function (assert) {
    var oCache = this.createCache("Employees"), that = this;
    return this.mockRequestAndRead(oCache, 0, "Employees", 0, 10).then(function (oResult) {
        var oReadGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oUnlockedCopy = {};
        assert.deepEqual(oResult, createResult(0, 10, undefined, true));
        that.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
        that.mock(oReadGroupLock).expects("unlock").withExactArgs();
        that.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=10", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).resolves(createResult(10, 7));
        assert.deepEqual(oCache.read(7, 3, Infinity, oReadGroupLock).getResult(), createResult(7, 3, undefined, true));
    });
});
QUnit.test("CollectionCache#read: wait for $tail", function (assert) {
    var oCache = this.createCache("Employees"), fnDataRequested = {}, oNewPromise = {}, oPromise, fnResolve;
    oCache.aElements.$tail = new Promise(function (resolve) {
        fnResolve = resolve;
    });
    this.mock(ODataUtils).expects("_getReadIntervals").never();
    this.mock(oCache).expects("requestElements").never();
    oPromise = oCache.read(0, 10, 42, "group", fnDataRequested);
    this.mock(oCache).expects("read").withExactArgs(0, 10, 42, "group", sinon.match.same(fnDataRequested)).returns(oNewPromise);
    fnResolve();
    return oPromise.then(function (oPromise0) {
        assert.strictEqual(oPromise0, oNewPromise);
    });
});
QUnit.test("CollectionCache#fetchValue", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), oCacheMock = this.mock(oCache), bCreateOnDemand = "bCreateOnDemand", oGroupLock0 = {
        unlock: function () { }
    }, oListener = {}, oReadPromise = this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26"), that = this;
    that.mock(oGroupLock0).expects("unlock").withExactArgs();
    oCacheMock.expects("registerChange").withExactArgs("('c')/key", sinon.match.same(oListener));
    oCacheMock.expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), "('c')/key", sinon.match.same(oGroupLock0), bCreateOnDemand).returns(SyncPromise.resolve("c"));
    return Promise.all([
        oReadPromise,
        oCache.fetchValue(oGroupLock0, "('c')/key", {}, oListener, bCreateOnDemand).then(function (sResult) {
            var oGroupLock1 = {
                unlock: function () { }
            };
            assert.strictEqual(sResult, "c");
            that.mock(oGroupLock1).expects("unlock").withExactArgs();
            oCacheMock.expects("registerChange").withExactArgs("('c')/key", null);
            oCacheMock.expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), "('c')/key", sinon.match.same(oGroupLock1), false).returns(SyncPromise.resolve("c"));
            assert.strictEqual(oCache.fetchValue(oGroupLock1, "('c')/key", null, null, false).getResult(), "c");
        })
    ]);
});
QUnit.test("CollectionCache#fetchValue includes $tail", function (assert) {
    var oCache = this.createCache("Employees"), bCreateOnDemand = "bCreateOnDemand", oGroupLock = { unlock: function () { } }, oResult, oSyncPromiseAll = SyncPromise.resolve(Promise.resolve()), that = this;
    assert.strictEqual(oCache.oSyncPromiseAll, undefined);
    oCache.aElements.push("0");
    oCache.aElements.push("1");
    oCache.aElements.push("2");
    oCache.aElements.$tail = "$";
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.mock(SyncPromise).expects("all").withExactArgs(["0", "1", "2", "$"]).returns(oSyncPromiseAll);
    oSyncPromiseAll.then(function () {
        that.mock(oCache).expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), "('c')/key", sinon.match.same(oGroupLock), bCreateOnDemand).returns(SyncPromise.resolve("c"));
    });
    oResult = oCache.fetchValue(oGroupLock, "('c')/key", null, null, bCreateOnDemand).then(function (sResult) {
        assert.strictEqual(sResult, "c");
    });
    assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);
    assert.strictEqual(oResult.isPending(), true);
    oCache.fill(undefined, 0, 3);
    assert.strictEqual(oCache.oSyncPromiseAll, undefined);
    return oResult;
});
QUnit.test("CollectionCache#fetchValue without $tail, undefined element", function (assert) {
    var oCache = this.createCache("Employees"), bCreateOnDemand = "bCreateOnDemand", oGroupLock = { unlock: function () { } }, oResult, oSyncPromiseAll = SyncPromise.resolve(Promise.resolve()), that = this;
    assert.strictEqual(oCache.oSyncPromiseAll, undefined);
    oCache.aElements.push(undefined);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.mock(SyncPromise).expects("all").withExactArgs(sinon.match.same(oCache.aElements)).returns(oSyncPromiseAll);
    oSyncPromiseAll.then(function () {
        that.mock(oCache).expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), "0/key", sinon.match.same(oGroupLock), bCreateOnDemand).returns(SyncPromise.resolve("c"));
    });
    oResult = oCache.fetchValue(oGroupLock, "0/key", null, null, bCreateOnDemand).then(function (sResult) {
        assert.strictEqual(sResult, "c");
    });
    assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);
    assert.strictEqual(oResult.isPending(), true);
    return oResult;
});
QUnit.test("CollectionCache#fetchValue without $tail, oSyncPromiseAll", function (assert) {
    var oCache = this.createCache("Employees"), bCreateOnDemand = "bCreateOnDemand", oGroupLock = { unlock: function () { } }, oResult, oSyncPromiseAll = SyncPromise.resolve(Promise.resolve()), that = this;
    oCache.oSyncPromiseAll = oSyncPromiseAll;
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.mock(SyncPromise).expects("all").never();
    oSyncPromiseAll.then(function () {
        that.mock(oCache).expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), "('c')/key", sinon.match.same(oGroupLock), bCreateOnDemand).returns(SyncPromise.resolve("c"));
    });
    oResult = oCache.fetchValue(oGroupLock, "('c')/key", null, null, bCreateOnDemand).then(function (sResult) {
        assert.strictEqual(sResult, "c");
    });
    assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);
    assert.strictEqual(oResult.isPending(), true);
    return oResult;
});
[{
        fnArrange: function (oCache) {
            oCache.aElements.$byPredicate["('c')"] = {};
        },
        oGroupLock: { unlock: function () { } },
        sPath: "('c')/note",
        sTitle: "CollectionCache#fetchValue sync via key predicate"
    }, {
        fnArrange: function (oCache) {
            oCache.aElements.push({});
        },
        oGroupLock: { unlock: function () { } },
        sPath: "0/note",
        sTitle: "CollectionCache#fetchValue sync via index"
    }, {
        fnArrange: function (oCache) {
            oCache.aElements.$count = 0;
        },
        oGroupLock: _GroupLock.$cached,
        sPath: "$count",
        sTitle: "CollectionCache#fetchValue sync via $count"
    }].forEach(function (oFixture) {
    QUnit.test(oFixture.sTitle, function (assert) {
        var oCache = this.createCache("Employees"), bCreateOnDemand = "bCreateOnDemand", fnDataRequested = null, oGroupLock = oFixture.oGroupLock, oListener = {}, sPath = oFixture.sPath;
        oFixture.fnArrange(oCache);
        this.mock(oGroupLock).expects("unlock").withExactArgs();
        this.mock(oCache).expects("registerChange").withExactArgs(sPath, sinon.match.same(oListener));
        this.mock(oCache).expects("drillDown").withExactArgs(sinon.match.same(oCache.aElements), sPath, sinon.match.same(oGroupLock), bCreateOnDemand).returns(SyncPromise.resolve("Note 1"));
        this.mock(SyncPromise).expects("all").never();
        assert.strictEqual(oCache.fetchValue(oGroupLock, sPath, fnDataRequested, oListener, bCreateOnDemand).getResult(), "Note 1");
    });
});
QUnit.test("CollectionCache#read(-1, 1)", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath);
    this.oRequestorMock.expects("request").never();
    assert.throws(function () {
        oCache.read(-1, 1, 0);
    }, new Error("Illegal index -1, must be >= 0"));
});
QUnit.test("CollectionCache#read(1, -1)", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath);
    this.oRequestorMock.expects("request").never();
    assert.throws(function () {
        oCache.read(1, -1, 0);
    }, new Error("Illegal length -1, must be >= 0"));
});
[{
        title: "second range completely before",
        reads: [
            { index: 10, length: 2, requests: [{ skip: 10, top: 2 }] },
            { index: 5, length: 2, requests: [{ skip: 5, top: 2 }] }
        ]
    }, {
        title: "second range overlaps before",
        reads: [
            { index: 5, length: 4, requests: [{ skip: 5, top: 4 }] },
            { index: 3, length: 4, requests: [{ skip: 3, top: 2 }] }
        ]
    }, {
        title: "same range",
        reads: [
            { index: 1, length: 2, requests: [{ skip: 1, top: 2 }] },
            { index: 1, length: 2, requests: [] }
        ]
    }, {
        title: "second range overlaps after",
        reads: [
            { index: 3, length: 4, requests: [{ skip: 3, top: 4 }] },
            { index: 5, length: 4, requests: [{ skip: 7, top: 2 }] }
        ]
    }, {
        title: "second range completely behind",
        reads: [
            { index: 5, length: 2, requests: [{ skip: 5, top: 2 }] },
            { index: 10, length: 2, requests: [{ skip: 10, top: 2 }] }
        ]
    }, {
        title: "second range part of first range",
        reads: [
            { index: 5, length: 8, requests: [{ skip: 5, top: 8 }] },
            { index: 7, length: 2, requests: [] }
        ]
    }, {
        title: "first range part of second range",
        reads: [
            { index: 7, length: 2, requests: [{ skip: 7, top: 2 }] },
            { index: 5, length: 6, requests: [{ skip: 5, top: 2 }, { skip: 9, top: 2 }] }
        ]
    }, {
        title: "read more than available",
        reads: [
            { index: 10, length: 90, requests: [{ skip: 10, top: 90 }] },
            { index: 0, length: 100, requests: [{ skip: 0, top: 10 }] }
        ],
        expectedMaxElements: 26
    }, {
        title: "read exactly max available",
        reads: [
            { index: 0, length: 26, requests: [{ skip: 0, top: 26 }] },
            { index: 26, length: 26, requests: [{ skip: 26, top: 26 }] },
            { index: 26, length: 26, requests: [] }
        ],
        expectedMaxElements: 26
    }, {
        title: "different ranges",
        reads: [
            { index: 2, length: 5, requests: [{ skip: 2, top: 5 }] },
            { index: 0, length: 2, requests: [{ skip: 0, top: 2 }] },
            { index: 1, length: 2, requests: [] }
        ]
    }].forEach(function (oFixture) {
    function mockRequestsAndCallRead(oRead, oCache, fnDataRequested) {
        var oGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oGroupLockMock = this.mock(oGroupLock), that = this;
        oRead.requests.forEach(function (oRequest, i) {
            var iSkip = oRequest.skip, iTop = oRequest.top, oUnlockedCopy = {};
            oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
            that.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=" + iSkip + "&$top=" + iTop, sinon.match.same(oUnlockedCopy), undefined, undefined, i < 1 ? sinon.match.same(fnDataRequested) : undefined).resolves(createResult(iSkip, iTop));
        });
        oGroupLockMock.expects("unlock").withExactArgs();
        return oCache.read(oRead.index, oRead.length, 0, oGroupLock, fnDataRequested);
    }
    QUnit.test("CollectionCache: multiple read, " + oFixture.title + " (sequentially)", function (assert) {
        var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), fnDataRequested = this.spy(), oPromise = Promise.resolve(), that = this;
        oFixture.reads.forEach(function (oRead) {
            oPromise = oPromise.then(function () {
                var oReadPromise = mockRequestsAndCallRead.call(that, oRead, oCache, fnDataRequested);
                return oReadPromise.then(function (oResult) {
                    assert.deepEqual(oResult.value, createResult(oRead.index, oRead.length, undefined, true).value);
                });
            });
        });
        return oPromise.then(function () {
            sinon.assert.notCalled(fnDataRequested);
            assert.strictEqual(oCache.aElements.$count, oFixture.expectedMaxElements);
        });
    });
    QUnit.test("CollectionCache: multiple read, " + oFixture.title + " (parallel)", function (assert) {
        var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), fnDataRequested = this.spy(), aPromises = [], that = this;
        oFixture.reads.forEach(function (oRead) {
            aPromises.push(mockRequestsAndCallRead.call(that, oRead, oCache, fnDataRequested).then(function (oResult) {
                assert.deepEqual(oResult.value, createResult(oRead.index, oRead.length, undefined, true).value);
            }));
        });
        return Promise.all(aPromises).then(function () {
            sinon.assert.notCalled(fnDataRequested);
            assert.strictEqual(oCache.aElements.$count, oFixture.expectedMaxElements);
        });
    });
});
QUnit.test("CollectionCache: parallel reads beyond length", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath);
    return Promise.all([
        this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 30).then(function (oResult) {
            var oExpectedResult = createResult(0, 26, undefined, true);
            oExpectedResult.value.$count = 26;
            assert.deepEqual(oResult, oExpectedResult);
            assert.strictEqual(oCache.aElements.$count, 26);
        }),
        this.mockRequestAndRead(oCache, 0, sResourcePath, 30, 1).then(function (oResult) {
            var oExpectedResult = createResult(0, 0);
            oExpectedResult.value.$count = 26;
            assert.deepEqual(oResult, oExpectedResult);
            assert.strictEqual(oCache.aElements.$count, 26);
        })
    ]);
});
[false, true].forEach(function (bCount) {
    var sTitle = "CollectionCache#read: collection cleared after successful read, $count =" + bCount;
    QUnit.test(sTitle, function (assert) {
        var oCache = this.createCache("Employees"), that = this;
        return this.mockRequestAndRead(oCache, 0, "Employees", 10, bCount ? 30 : 10).then(function (oResult) {
            var oExpectedResult = createResult(10, bCount ? 16 : 10, undefined, true);
            assert.deepEqual(oResult, oExpectedResult);
            assert.strictEqual(oCache.aElements.$count, bCount ? 26 : undefined);
            return that.mockRequestAndRead(oCache, 0, "Employees", 5, 3, 0).then(function (oResult) {
                var oExpectedResult = createResult(5, 0);
                assert.deepEqual(oResult, oExpectedResult);
                assert.strictEqual(oCache.aElements.$count, undefined);
            });
        });
    });
});
QUnit.test("CollectionCache#read: $count & create", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), sTransientPredicate = "($uid=id-1-23)", that = this;
    return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26").then(function (oResult) {
        var oGroupLock = {
            getGroupId: function () { },
            unlock: function () { }
        };
        assert.strictEqual(oCache.aElements.$count, 26);
        assert.strictEqual(oResult.value.$count, 26);
        assert.strictEqual(oCache.iLimit, 26);
        that.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("$direct");
        that.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, sResourcePath + sTransientPredicate).callsArg(5).resolves({});
        return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, {}, null, function fnSubmitCallback() { }).then(function () {
            var oReadGroupLock = { unlock: function () { } };
            that.mock(oReadGroupLock).expects("unlock").withExactArgs();
            assert.strictEqual(oCache.read(0, 10, 0, oReadGroupLock).getResult().value.$count, 27, "now including the created element");
            assert.strictEqual(oCache.iLimit, 26, "created element cannot be reached via paging");
        });
    });
});
QUnit.test("CollectionCache#read: $count & delete, top level", function (assert) {
    var oCache = this.createCache("Employees"), that = this;
    return this.mockRequestAndRead(oCache, 0, "Employees", 0, 5, 5, undefined, 26).then(function () {
        var oDeleteGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oDeleteGroupLockCopy;
        that.mock(oDeleteGroupLock).expects("getUnlockedCopy").returns(oDeleteGroupLockCopy);
        that.oRequestorMock.expects("request").withArgs("DELETE", "Employees('42')", sinon.match.same(oDeleteGroupLockCopy)).resolves();
        that.spy(_Helper, "updateExisting");
        return oCache._delete(oDeleteGroupLock, "Employees('42')", "3", undefined, function () { }).then(function () {
            var oReadGroupLock = { unlock: function () { } };
            that.mock(oReadGroupLock).expects("unlock").withExactArgs();
            assert.strictEqual(oCache.read(0, 4, 0, oReadGroupLock).getResult().value.$count, 25);
            sinon.assert.calledWithExactly(_Helper.updateExisting, sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oCache.aElements), { $count: 25 });
        });
    });
});
QUnit.test("CollectionCache#read: $count & delete, nested", function (assert) {
    var oCache = this.createCache("Employees"), oGroupLock = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, aList = createResult(0, 3, undefined, true).value, oUnlockedCopy = {}, that = this;
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.oRequestorMock.expects("request").withArgs("GET", "Employees?$skip=0&$top=5", sinon.match.same(oUnlockedCopy)).resolves({
        "value": [{
                "list": aList,
                "list@odata.count": "26"
            }]
    });
    return oCache.read(0, 5, 0, oGroupLock).then(function () {
        var oDeleteGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oDeleteGroupLockCopy;
        that.mock(oDeleteGroupLock).expects("getUnlockedCopy").returns(oDeleteGroupLockCopy);
        that.oRequestorMock.expects("request").withArgs("DELETE", "Employees('b')", sinon.match.same(oDeleteGroupLockCopy)).resolves();
        that.spy(_Helper, "updateExisting");
        return oCache._delete(oDeleteGroupLock, "Employees('b')", "0/list/1", undefined, function () { }).then(function () {
            var oFetchValueGroupLock = { unlock: function () { } };
            that.mock(oFetchValueGroupLock).expects("unlock").withExactArgs();
            assert.strictEqual(oCache.fetchValue(oFetchValueGroupLock, "0/list").getResult().$count, 25);
            sinon.assert.calledWithExactly(_Helper.updateExisting, sinon.match.same(oCache.mChangeListeners), "0/list", sinon.match.same(aList), { $count: 25 });
        });
    });
});
QUnit.test("CollectionCache: fetch $count before read is finished", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), oGroupLock0 = { unlock: function () { } }, oListener = {
        onChange: function () {
            assert.ok(false);
        }
    }, that = this;
    this.mock(oGroupLock0).expects("unlock").withExactArgs();
    return Promise.all([
        this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26"),
        oCache.fetchValue(oGroupLock0, "$count", undefined, oListener).then(function (iCount) {
            var oGroupLock1 = { unlock: function () { } };
            assert.strictEqual(iCount, 26);
            that.mock(oGroupLock1).expects("unlock").withExactArgs();
            assert.strictEqual(oCache.fetchValue(oGroupLock1, "$count").getResult(), 26);
        })
    ]);
});
[undefined, false, true].forEach(function (bKeepTransientPath) {
    QUnit.test("_Cache#create: bKeepTransientPath: " + bKeepTransientPath, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS", {}), oCacheMock = this.mock(oCache), aCollection = [], oCountChangeListener = { onChange: function () { } }, oCreatePromise, oGroupLock = { getGroupId: function () { } }, oHelperMock = this.mock(_Helper), oInitialData = {
            ID: "",
            Name: "John Doe",
            "@$ui5.foo": "bar",
            "@$ui5.keepTransientPath": bKeepTransientPath
        }, oEntityDataCleaned = { ID: "", Name: "John Doe" }, sPathInCache = "('0')/TEAM_2_EMPLOYEES", oPostBody = {}, sPostPath = "TEAMS('0')/TEAM_2_EMPLOYEES", oPostResult = {
            ID: "7",
            Name: "John Doe"
        }, aSelectForPath = ["ID", "Name"], sPredicate = "('7')", sTransientPredicate = "($uid=id-1-23)", mTypeForMetaPath = {};
        oCache.fetchValue = function () { };
        aCollection.$count = 0;
        aCollection.$created = 0;
        oHelperMock.expects("publicClone").withExactArgs(sinon.match.same(oInitialData), true).returns(oEntityDataCleaned);
        oHelperMock.expects("merge").withExactArgs({}, sinon.match.same(oEntityDataCleaned)).returns(oPostBody);
        oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(oEntityDataCleaned), "postBody", sinon.match.same(oPostBody)).callThrough();
        oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(oEntityDataCleaned), "transientPredicate", sTransientPredicate).callThrough();
        oCacheMock.expects("getValue").withExactArgs(sPathInCache).returns(aCollection);
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
        oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(oEntityDataCleaned), "transient", "updateGroup").callThrough();
        oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(oEntityDataCleaned), "transient", true).callThrough();
        this.spy(_Helper, "addByPath");
        this.oRequestorMock.expects("request").withExactArgs("POST", "TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock), null, sinon.match.same(oPostBody), sinon.match.func, sinon.match.func, undefined, sPostPath + sTransientPredicate).callsArg(5).resolves(oPostResult);
        this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        this.mock(oCountChangeListener).expects("onChange");
        this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oPostResult), sinon.match.same(mTypeForMetaPath), "/TEAMS/TEAM_2_EMPLOYEES", sPathInCache + sTransientPredicate, bKeepTransientPath);
        oHelperMock.expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oPostResult), "predicate").returns(bKeepTransientPath === undefined ? undefined : sPredicate);
        if (bKeepTransientPath !== undefined) {
            oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(oEntityDataCleaned), "predicate", sPredicate);
        }
        if (bKeepTransientPath === false) {
            oHelperMock.expects("updateTransientPaths").withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate, sPredicate).callThrough();
        }
        oHelperMock.expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mQueryOptions), sPathInCache).returns({ $select: aSelectForPath });
        oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), sPathInCache + (bKeepTransientPath === false ? sPredicate : sTransientPredicate), sinon.match.same(oEntityDataCleaned), sinon.match.same(oPostResult), ["ID", "Name", "@odata.etag"]).callsFake(function () {
            if (bKeepTransientPath === false) {
                oEntityDataCleaned["@$ui5._"].predicate = sPredicate;
            }
            oEntityDataCleaned.ID = oPostResult.ID;
        });
        oCache.registerChange(sPathInCache + "/$count", oCountChangeListener);
        oCreatePromise = oCache.create(oGroupLock, SyncPromise.resolve(sPostPath), sPathInCache, sTransientPredicate, oInitialData, null, function fnSubmitCallback() { });
        assert.strictEqual(aCollection[0], oEntityDataCleaned);
        assert.strictEqual(aCollection.$byPredicate[sTransientPredicate], oEntityDataCleaned);
        assert.strictEqual(aCollection.$count, 1);
        assert.strictEqual(aCollection.$created, 1);
        sinon.assert.calledWithExactly(_Helper.addByPath, sinon.match.same(oCache.mPostRequests), sPathInCache, sinon.match.same(oEntityDataCleaned));
        oCache.registerChange(sPathInCache + sTransientPredicate + "/Name", {
            onChange: function () {
                assert.ok(false, "No change event for Name");
            }
        });
        this.spy(_Helper, "removeByPath");
        return oCreatePromise.then(function (oEntityData) {
            var oExpectedPrivateAnnotation = {};
            if (bKeepTransientPath === false) {
                oExpectedPrivateAnnotation.predicate = sPredicate;
            }
            oExpectedPrivateAnnotation.transientPredicate = sTransientPredicate;
            assert.deepEqual(oEntityData, {
                "@$ui5._": oExpectedPrivateAnnotation,
                "@$ui5.context.isTransient": false,
                ID: "7",
                Name: "John Doe"
            });
            assert.strictEqual(aCollection[0].ID, "7", "from Server");
            assert.strictEqual(aCollection.$count, 1);
            assert.deepEqual(aSelectForPath, ["ID", "Name"], "$select unchanged");
            if (bKeepTransientPath === false) {
                assert.strictEqual(aCollection.$byPredicate[sPredicate], oEntityDataCleaned);
            }
            assert.strictEqual(aCollection.$byPredicate[sTransientPredicate], oEntityDataCleaned, "still need access via transient predicate");
            sinon.assert.calledWithExactly(_Helper.removeByPath, sinon.match.same(oCache.mPostRequests), sPathInCache, sinon.match.same(oEntityDataCleaned));
        });
    });
});
QUnit.test("_Cache#create: with given sPath and delete before submit", function (assert) {
    var oRequestor = _Requestor.create("/~/", { getGroupProperty: defaultGetGroupProperty }), oCache = new _Cache(oRequestor, "TEAMS"), oCacheMock = this.mock(oCache), aCollection = [], oCreatePromise, fnDeleteCallback = this.spy(), oDeleteGroupLock = { unlock: function () { } }, oEntity0 = {}, oEntity1 = {}, oEntityData, oGroupLock = {
        cancel: function () { },
        getGroupId: function () { },
        getSerialNumber: function () { },
        isCanceled: function () { return false; },
        unlock: function () { }
    }, sPathInCache = "('0')/TEAM_2_EMPLOYEES", oPostPathPromise = SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES"), sTransientPredicate = "($uid=id-1-23)";
    aCollection.$byPredicate = {};
    aCollection.$created = 0;
    oCache.fetchValue = function () { };
    oCacheMock.expects("addPendingRequest").withExactArgs();
    oCacheMock.expects("removePendingRequest").withExactArgs();
    oCacheMock.expects("getValue").withExactArgs(sPathInCache).returns(aCollection);
    oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve({}));
    this.mock(oGroupLock).expects("getGroupId").twice().withExactArgs().returns("updateGroup");
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(42);
    this.spy(_Helper, "addByPath");
    this.spy(oRequestor, "request");
    oCreatePromise = oCache.create(oGroupLock, oPostPathPromise, sPathInCache, sTransientPredicate, oEntity0);
    assert.strictEqual(aCollection.$created, 1);
    sinon.assert.calledWithExactly(oRequestor.request, "POST", "TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "TEAMS('0')/TEAM_2_EMPLOYEES" + sTransientPredicate);
    oEntityData = aCollection[0];
    sinon.assert.calledWithExactly(_Helper.addByPath, sinon.match.same(oCache.mPostRequests), sPathInCache, sinon.match.same(oEntityData));
    aCollection.unshift(oEntity1);
    aCollection.$created += 1;
    this.spy(_Helper, "removeByPath");
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), sPathInCache).returns(SyncPromise.resolve(aCollection));
    this.mock(oGroupLock).expects("cancel").withExactArgs();
    this.mock(oDeleteGroupLock).expects("unlock").withExactArgs();
    aCollection.$count = 42;
    oCache._delete(oDeleteGroupLock, "TEAMS('0')/TEAM_2_EMPLOYEES", sPathInCache + "/-1", undefined, fnDeleteCallback);
    assert.strictEqual(aCollection.$count, 41);
    assert.strictEqual(aCollection.$created, 1);
    assert.strictEqual(aCollection[0], oEntity1);
    sinon.assert.calledWithExactly(_Helper.removeByPath, sinon.match.same(oCache.mPostRequests), sPathInCache, sinon.match.same(oEntityData));
    return oCreatePromise.then(function () {
        assert.ok(false, "unexpected success");
    }, function (oError) {
        assert.strictEqual(oError.canceled, true);
    });
});
QUnit.test("_Cache#create: $metadata fails", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS"), aCollection = [], oCreatePromise, oEntityData = {}, oError = new Error("This call intentionally failed"), fnErrorCallback = this.spy(), oGroupLock = {
        getGroupId: function () { return "updateGroup"; }
    }, oPostPathPromise = SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES");
    aCollection.$created = 0;
    this.mock(oCache).expects("getValue").withExactArgs("('0')/TEAM_2_EMPLOYEES").returns(aCollection);
    this.mock(oCache).expects("fetchTypes").twice().withExactArgs().returns(SyncPromise.reject(oError));
    this.mock(this.oRequestor).expects("request").withExactArgs("POST", "TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "TEAMS('0')/TEAM_2_EMPLOYEES($uid=id-1-23)");
    this.mock(oCache).expects("removePendingRequest").withExactArgs();
    oCreatePromise = oCache.create(oGroupLock, oPostPathPromise, "('0')/TEAM_2_EMPLOYEES", "($uid=id-1-23)", oEntityData, fnErrorCallback);
    assert.deepEqual(aCollection, [{
            "@$ui5._": {
                postBody: {},
                "transient": "updateGroup",
                transientPredicate: "($uid=id-1-23)"
            },
            "@$ui5.context.isTransient": true
        }]);
    assert.strictEqual(aCollection.$created, 1);
    sinon.assert.calledWithExactly(fnErrorCallback, sinon.match.same(oError));
    return oCreatePromise.then(function () {
        assert.ok(false, "unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
[undefined, {}].forEach(function (oCacheData, i) {
    QUnit.test("_Cache#create: allowed for collections only - " + i, function (assert) {
        var oCache = new _Cache(this.oRequestor, "TEAMS"), sPathInCache = "0/TEAM_2_MANAGER", sTransientPredicate = "($uid=id-1-23)";
        this.mock(oCache).expects("getValue").withExactArgs("0/TEAM_2_MANAGER").returns(oCacheData);
        assert.throws(function () {
            oCache.create({}, "TEAMS('01')/TEAM_2_MANAGER", sPathInCache, sTransientPredicate, {});
        }, new Error("Create is only supported for collections; '" + sPathInCache + "' does not reference a collection"));
    });
});
QUnit.test("CollectionCache: query params", function () {
    var oCache, oGroupLock = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, mQueryOptions = {}, sQueryParams = "?query", sResourcePath = "Employees", oUnlockedCopy = {};
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, false).returns(sQueryParams);
    oCache = this.createCache(sResourcePath, mQueryOptions, false);
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + sQueryParams + "&$skip=0&$top=5", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).resolves({ value: [] });
    mQueryOptions.$select = "foo";
    return oCache.read(0, 5, 0, oGroupLock);
});
QUnit.test("CollectionCache: error handling", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), oError = {}, oGroupLock0 = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, oSuccess = createResult(0, 5), oUnlockedCopy0 = {}, that = this;
    this.mock(oGroupLock0).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy0);
    this.mock(oGroupLock0).expects("unlock").withExactArgs();
    this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", sinon.match.same(oUnlockedCopy0), undefined, undefined, undefined).rejects(oError);
    this.spy(oCache, "fill");
    return oCache.read(0, 5, 0, oGroupLock0).catch(function (oResult1) {
        var oGroupLock1 = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oUnlockedCopy1 = {};
        assert.strictEqual(oResult1, oError);
        sinon.assert.calledWithExactly(oCache.fill, sinon.match.instanceOf(SyncPromise), 0, 5);
        sinon.assert.calledWithExactly(oCache.fill, undefined, 0, 5);
        that.mock(oGroupLock1).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy1);
        that.mock(oGroupLock1).expects("unlock").withExactArgs();
        that.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", sinon.match.same(oUnlockedCopy1), undefined, undefined, undefined).resolves(oSuccess);
        return oCache.read(0, 5, 0, oGroupLock1).then(function (oResult2) {
            assert.deepEqual(oResult2, oSuccess);
        });
    });
});
QUnit.test("CollectionCache: create entity and has pending changes", function (assert) {
    var mQueryOptions = {}, oCache = this.createCache("Employees", mQueryOptions), oCacheMock = this.mock(oCache), oEntityData = { name: "John Doe", "@$ui5.keepTransientPath": true }, oGroupLock = { getGroupId: function () { } }, oHelperMock = this.mock(_Helper), oPatchPromise1, oPatchPromise2, oPostResult = {}, oPostPromise, oReadGroupLock = { unlock: function () { } }, oReadPromise, sTransientPredicate = "($uid=id-1-23)", mTypeForMetaPath = {}, oUpdateGroupLock0 = {
        getGroupId: function () { },
        unlock: function () { }
    }, oUpdateGroupLock1 = { getGroupId: function () { } };
    function isPostBody(oCandidate) {
        return _Helper.getPrivateAnnotation(oCache.aElements[0], "postBody") === oCandidate;
    }
    oCacheMock.expects("addPendingRequest").never();
    oCacheMock.expects("removePendingRequest").never();
    oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mQueryOptions), true).returns("?foo=bar");
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
    this.oRequestorMock.expects("request").withExactArgs("POST", "Employees?foo=bar", sinon.match.same(oGroupLock), null, sinon.match(isPostBody), sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).callsFake(function () {
        var fnSubmit = arguments[5];
        return Promise.resolve().then(function () {
            var oAddPendingRequestSpy = oCacheMock.expects("addPendingRequest").withExactArgs();
            fnSubmit();
            assert.ok(oAddPendingRequestSpy.called);
        }).then(function () {
            oCacheMock.expects("removePendingRequest").withExactArgs();
            return oPostResult;
        });
    });
    oPostPromise = oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, oEntityData, null, function fnSubmitCallback() {
    });
    assert.strictEqual(oCache.hasPendingChangesForPath(""), true, "pending changes for root");
    assert.strictEqual(oCache.hasPendingChangesForPath("foo"), false, "pending changes for non-root");
    assert.notStrictEqual(oCache.aElements[0], oEntityData, "'create' copies initial data");
    assert.deepEqual(oCache.aElements[0], {
        name: "John Doe",
        "@$ui5._": {
            postBody: { name: "John Doe" },
            "transient": "updateGroup",
            transientPredicate: sTransientPredicate
        },
        "@$ui5.context.isTransient": true
    });
    oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate, sinon.match.same(oCache.aElements[0]), { bar: "baz" });
    oHelperMock.expects("updateAll").withExactArgs({}, sTransientPredicate, sinon.match(isPostBody), { bar: "baz" });
    oHelperMock.expects("getQueryOptionsForPath").withExactArgs(sinon.match.same(oCache.mQueryOptions), "").returns({});
    oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oPostResult), sinon.match.same(mTypeForMetaPath), "/Employees", sTransientPredicate, true);
    oHelperMock.expects("updateSelected").withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate, sinon.match.same(oCache.aElements[0]), sinon.match.same(oPostResult), undefined);
    this.mock(oUpdateGroupLock0).expects("unlock").withExactArgs();
    this.mock(oUpdateGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
    oPatchPromise1 = oCache.update(oUpdateGroupLock0, "bar", "baz", this.spy(), "n/a", sTransientPredicate);
    this.mock(oUpdateGroupLock1).expects("getGroupId").withExactArgs().returns("anotherGroup");
    oPatchPromise2 = oCache.update(oUpdateGroupLock1, "bar", "qux", this.spy(), "n/a", sTransientPredicate);
    this.mock(oReadGroupLock).expects("unlock").withExactArgs();
    oReadPromise = oCache.read(0, 1, 0, oReadGroupLock);
    return Promise.all([
        oPatchPromise1.then(),
        oPatchPromise2.then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, "The entity will be created via group " + "'updateGroup'. Cannot patch via group 'anotherGroup'");
        }),
        oPostPromise.then(function () {
            assert.notOk(_Helper.hasPrivateAnnotation(oCache.aElements[0], "transient"));
            assert.strictEqual(oCache.hasPendingChangesForPath(""), false, "no more pending changes");
        }),
        oReadPromise.then(function (oResult) {
            assert.notOk("@odata.count" in oResult);
        })
    ]);
});
QUnit.test("CollectionCache: pending create forces update/_delete to fail", function (assert) {
    var mQueryOptions = {}, oCache = this.createCache("Employees", mQueryOptions), oCallbacks = {
        fnError: function () { },
        fnSubmit: function () { }
    }, oCallbacksMock = this.mock(oCallbacks), oCreateGroupLock0 = { getGroupId: function () { } }, oCreatePromise, oError = new Error(), oFailedPostPromise, oFetchTypesPromise = SyncPromise.resolve(Promise.resolve({
        "/Employees": {
            $Key: ["ID"],
            ID: {
                $Type: "Edm.String"
            }
        }
    })), fnRejectPost, oRequestExpectation1, oRequestExpectation2, fnResolvePost, sTransientPredicate = "($uid=id-1-23)", that = this;
    function checkUpdateAndDeleteFailure() {
        var oDeleteGroupLock = {}, oUpdateGroupLock = { getGroupId: function () { } };
        that.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
        oCache.update(oUpdateGroupLock, "foo", "baz", that.spy(), "n/a", sTransientPredicate).then(function () {
            assert.ok(false, "unexpected success - update");
        }, function (oError) {
            assert.strictEqual(oError.message, "No 'update' allowed while waiting for server response", oError.message);
        });
        oCache._delete(oDeleteGroupLock, "n/a", "-1").then(function () {
            assert.ok(false, "unexpected success - _delete");
        }, function (oError) {
            assert.strictEqual(oError.message, "No 'delete' allowed while waiting for server response", oError.message);
        });
    }
    function checkUpdateSuccess(sWhen) {
        var oUpdateGroupLock = {
            getGroupId: function () { },
            unlock: function () { }
        };
        that.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
        that.mock(oUpdateGroupLock).expects("unlock").withExactArgs();
        return oCache.update(oUpdateGroupLock, "foo", sWhen, that.spy(), "Employees", sTransientPredicate).then(function () {
            assert.ok(true, "Update works " + sWhen);
            assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[0], "transient"), "updateGroup");
        });
    }
    oCallbacksMock.expects("fnError").never();
    oCallbacksMock.expects("fnSubmit").never();
    this.mock(this.oRequestor).expects("buildQueryString").twice().withExactArgs("/Employees", sinon.match.same(mQueryOptions), true).returns("?sap-client=111");
    this.mock(oCreateGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
    oRequestExpectation1 = this.oRequestorMock.expects("request");
    oRequestExpectation1.withExactArgs("POST", "Employees?sap-client=111", sinon.match.same(oCreateGroupLock0), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).returns(oFailedPostPromise = new Promise(function (_resolve, reject) {
        fnRejectPost = reject;
    }));
    this.mock(oCache).expects("fetchTypes").exactly(2 + 1 + 1).withExactArgs().returns(oFetchTypesPromise);
    oCreatePromise = oCache.create(oCreateGroupLock0, SyncPromise.resolve("Employees"), "", sTransientPredicate, {}, oCallbacks.fnError, oCallbacks.fnSubmit);
    checkUpdateSuccess("before submitBatch").then(function () {
        var oCreateGroupLock1 = { getGroupId: function () { } };
        that.oRequestorMock.expects("lockGroup").withExactArgs("updateGroup", sinon.match.same(oCache), true, true).returns(oCreateGroupLock1);
        that.mock(oCreateGroupLock1).expects("getGroupId").withExactArgs().returns("updateGroup");
        oRequestExpectation2 = that.oRequestorMock.expects("request");
        oRequestExpectation2.withExactArgs("POST", "Employees?sap-client=111", sinon.match.same(oCreateGroupLock1), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).returns(new Promise(function (resolve) {
            fnResolvePost = resolve;
        }));
        oCallbacksMock.expects("fnSubmit").withExactArgs();
        oRequestExpectation1.args[0][5]();
        checkUpdateAndDeleteFailure();
        oCallbacksMock.expects("fnError").withExactArgs(sinon.match.same(oError));
        fnRejectPost(oError);
        SyncPromise.all([
            oFailedPostPromise,
            oFetchTypesPromise
        ]).then(undefined, function () {
            checkUpdateSuccess("with restarted POST").then(function () {
                oCallbacksMock.expects("fnSubmit").withExactArgs();
                oRequestExpectation2.args[0][5]();
                checkUpdateAndDeleteFailure();
                fnResolvePost({ ID: "42" });
            });
        });
    });
    return oCreatePromise.then(function () {
        var oEntity = oCache.fetchValue(_GroupLock.$cached, sTransientPredicate).getResult(), oGroupLock = { getGroupId: function () { } };
        that.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
        that.oRequestorMock.expects("request").withExactArgs("PATCH", "Employees('42')?sap-client=111", sinon.match.same(oGroupLock), { "If-Match": sinon.match.same(oEntity) }, { foo: "baz2" }, sinon.match.func, sinon.match.func, undefined, "Employees('42')", undefined).resolves({});
        return oCache.update(oGroupLock, "foo", "baz2", that.spy(), "Employees('42')", "('42')");
    });
});
["$direct", "$auto", "myAuto", "myDirect"].forEach(function (sUpdateGroupId) {
    QUnit.test("CollectionCache#create: relocate on failed POST for " + sUpdateGroupId, function (assert) {
        var oCache = this.createCache("Employees"), oCreateGroupLock = { getGroupId: function () { } }, oFailedPostPromise = SyncPromise.reject(new Error()), oFetchTypesPromise = SyncPromise.resolve({}), oParkedGroupLock = { getGroupId: function () { } }, mGroups = {
            "$direct": "Direct",
            "$auto": "Auto",
            "myAuto": "Auto",
            "myDirect": "Direct"
        }, sTransientPredicate = "($uid=id-1-23)", that = this;
        this.mock(oCreateGroupLock).expects("getGroupId").withExactArgs().returns(sUpdateGroupId);
        this.mock(oCache).expects("fetchTypes").exactly(2 + 1).returns(oFetchTypesPromise);
        this.oRequestorMock.expects("getGroupSubmitMode").withExactArgs(sUpdateGroupId).returns(mGroups[sUpdateGroupId]);
        this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).callsArg(5).returns(oFailedPostPromise);
        this.oRequestorMock.expects("lockGroup").withExactArgs("$parked." + sUpdateGroupId, sinon.match.same(oCache), true, true).returns(oParkedGroupLock);
        this.mock(oParkedGroupLock).expects("getGroupId").withExactArgs().returns("$parked." + sUpdateGroupId);
        this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oParkedGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).callsFake(function () {
            var fnSubmit = arguments[5];
            return Promise.resolve().then(function () {
                fnSubmit();
            }).then(function () {
                return { Name: "John Doe", Age: 47 };
            });
        });
        oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, { Name: null }, function fnErrorCallback() { }, function fnSubmitCallback() { });
        return oFailedPostPromise.then(undefined, function () {
            var oGroupLock0 = { getGroupId: function () { } }, oGroupLock1 = {
                getGroupId: function () { },
                unlock: function () { }
            }, oGroupLock2 = {
                getGroupId: function () { },
                unlock: function () { }
            }, oPostBody = _Helper.getPrivateAnnotation(oCache.aElements[0], "postBody"), aPromises = [], sWrongGroupId = sUpdateGroupId === "$direct" ? "$auto" : "$direct";
            that.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns(sWrongGroupId);
            aPromises.push(oCache.update(oGroupLock0, "Name", "John Doe", that.spy(), "n/a", sTransientPredicate).then(undefined, function (oError) {
                assert.strictEqual(oError.message, "The entity will be created via group '" + sUpdateGroupId + "'. Cannot patch via group '" + sWrongGroupId + "'");
            }));
            that.mock(oGroupLock1).expects("getGroupId").withExactArgs().returns(sUpdateGroupId);
            that.mock(oGroupLock1).expects("unlock").withExactArgs();
            that.oRequestorMock.expects("relocate").withExactArgs("$parked." + sUpdateGroupId, sinon.match.same(oPostBody), sUpdateGroupId);
            aPromises.push(oCache.update(oGroupLock1, "Name", "John Doe", that.spy(), "n/a", sTransientPredicate));
            that.mock(oGroupLock2).expects("getGroupId").withExactArgs().returns(sUpdateGroupId);
            that.mock(oGroupLock2).expects("unlock").withExactArgs();
            aPromises.push(oCache.update(oGroupLock2, "Name", "John Doe1", that.spy(), "n/a", sTransientPredicate));
            return Promise.all(aPromises);
        });
    });
});
QUnit.test("CollectionCache: create entity without initial data", function (assert) {
    var oCache = _Cache.create(this.oRequestor, "Employees"), oCreateGroupLock = { getGroupId: function () { } }, oPromise, sTransientPredicate = "($uid=id-1-23)", oUpdateGroupLock = {
        getGroupId: function () { },
        unlock: function () { }
    };
    this.mock(oCreateGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
    this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).callsFake(function () {
        var fnSubmit = arguments[5];
        return Promise.resolve().then(function () {
            fnSubmit();
        }).then(function () {
            return {};
        });
    });
    oPromise = oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, undefined, null, function fnSubmitCallback() { });
    assert.deepEqual(oCache.aElements[0], {
        "@$ui5._": {
            postBody: {},
            "transient": "updateGroup",
            transientPredicate: sTransientPredicate
        },
        "@$ui5.context.isTransient": true
    });
    this.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
    this.mock(oUpdateGroupLock).expects("unlock").withExactArgs();
    oCache.update(oUpdateGroupLock, "Name", "foo", this.spy(), undefined, sTransientPredicate);
    assert.strictEqual(oCache.aElements[0].Name, "foo");
    return oPromise;
});
QUnit.test("CollectionCache: create entity, canceled", function (assert) {
    var oCache = this.createCache("Employees"), oCanceledError = new Error(), oGroupLock = {
        cancel: function () { },
        getGroupId: function () { }
    }, sTransientPredicate = "($uid=id-1-23)";
    oCanceledError.canceled = true;
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
    this.mock(oGroupLock).expects("cancel").withExactArgs();
    this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).callsArg(6).rejects(oCanceledError);
    return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, undefined).then(function () {
        assert.ok(false, "Unexpected success");
    }, function (oError) {
        assert.strictEqual(oError, oCanceledError);
        assert.strictEqual(oCache.aElements.length, 0);
    });
});
[false, true].forEach(function (bHasEntityData) {
    var sTitle = "CollectionCache: creation fails, removePendingRequest called, " + bHasEntityData;
    QUnit.test(sTitle, function (assert) {
        var mQueryOptions = {}, oCache = this.createCache("Employees", mQueryOptions), oCallbacks = {
            errorCallback: function () { },
            submitCallback: function () { }
        }, oCallbacksMock = this.mock(oCallbacks), oCanceledError = new Error(), aCollection = [], oEntityData = bHasEntityData ? {} : undefined, oEntityDataCleaned = bHasEntityData ? {} : undefined, oGroupLock = { getGroupId: function () { } }, oHelperMock = this.mock(_Helper), oPostBody = {}, oPostError = new Error(), oRetryGroupLock = { getGroupId: function () { } }, sTransientPredicate = "($uid=id-1-23)", that = this;
        function entityDataCleaned(oParam) {
            if (oEntityDataCleaned) {
                return oParam === oEntityDataCleaned;
            }
            oEntityDataCleaned = oParam;
            return isEmptyObject(oParam);
        }
        oCallbacksMock.expects("errorCallback").never();
        oCallbacksMock.expects("submitCallback").never();
        oCanceledError.canceled = true;
        this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(oEntityData), true).returns(oEntityData ? oEntityDataCleaned : undefined);
        oHelperMock.expects("merge").withExactArgs({}, sinon.match(entityDataCleaned)).returns(oPostBody);
        oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match(entityDataCleaned), "postBody", sinon.match.same(oPostBody)).callThrough();
        oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match(entityDataCleaned), "transientPredicate", sTransientPredicate).callThrough();
        this.mock(oCache).expects("getValue").withExactArgs("").returns(aCollection);
        this.mock(oCache).expects("adjustReadRequests").withExactArgs(0, 1);
        this.mock(this.oRequestor).expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mQueryOptions), true).returns("?sap-client=111");
        oHelperMock.expects("setPrivateAnnotation").twice().withExactArgs(sinon.match(entityDataCleaned), "transient", "updateGroup").callThrough();
        oHelperMock.expects("addByPath").twice().withExactArgs(sinon.match.same(oCache.mPostRequests), "", sinon.match(entityDataCleaned));
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
        this.oRequestorMock.expects("request").withExactArgs("POST", "Employees?sap-client=111", sinon.match.same(oGroupLock), null, sinon.match.same(oPostBody), sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).callsFake(function () {
            var fnSubmit = arguments[5];
            return Promise.resolve().then(function () {
                var oAddPendingRequestSpy = that.mock(oCache).expects("addPendingRequest").withExactArgs(), oSubmitCallbackSpy = oCallbacksMock.expects("submitCallback").withExactArgs();
                oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(oEntityDataCleaned), "transient", true).callThrough();
                fnSubmit();
                assert.ok(oAddPendingRequestSpy.called);
                assert.ok(oSubmitCallbackSpy.called);
            }).then(function () {
                var oRemovePendingRequestExpectation = that.mock(oCache).expects("removePendingRequest").withExactArgs();
                oCallbacksMock.expects("errorCallback").withExactArgs(sinon.match.same(oPostError)).callsFake(function () {
                    assert.ok(oRemovePendingRequestExpectation.called);
                });
                throw oPostError;
            });
        });
        this.oRequestorMock.expects("lockGroup").withExactArgs("updateGroup", sinon.match.same(oCache), true, true).returns(oRetryGroupLock);
        this.mock(oRetryGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
        this.oRequestorMock.expects("request").withExactArgs("POST", "Employees?sap-client=111", sinon.match.same(oRetryGroupLock), null, sinon.match.same(oPostBody), sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).rejects(oCanceledError);
        this.mock(oCache).expects("fetchTypes").thrice().withExactArgs().returns(SyncPromise.resolve({}));
        return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, oEntityData, oCallbacks.errorCallback, oCallbacks.submitCallback).then(function () {
            assert.ok(false, "Unexpected success");
        }, function (oError) {
            assert.strictEqual(oError, oCanceledError);
        });
    });
});
QUnit.test("CollectionCache: read w/ transient context; wait for prefetch", function (assert) {
    var oCache = this.createCache("Employees"), oEntityData = { name: "John Doe" }, oGroupLock = { getGroupId: function () { } }, oReadGroupLock = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, oReadResult = { value: [{}, {}] }, sTransientPredicate = "($uid=id-1-23)", oUnlockedCopy = {}, that = this;
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
    this.oRequestorMock.expects("request").withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate).returns(new Promise(function () { }));
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees?$skip=0&$top=2", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).resolves(oReadResult);
    oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, oEntityData);
    this.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
    this.mock(oReadGroupLock).expects("unlock").withExactArgs();
    return oCache.read(0, 1, 2, oReadGroupLock).then(function (oResult) {
        var oGroupLock0 = { unlock: function () { } }, oGroupLock1 = { unlock: function () { } };
        assert.strictEqual(oResult.value.length, 1);
        assert.ok(_Helper.getPrivateAnnotation(oResult.value[0], "transient"));
        assert.strictEqual(oResult.value[0].name, "John Doe");
        that.mock(oGroupLock0).expects("unlock").withExactArgs();
        oResult = oCache.read(0, 3, 0, oGroupLock0).getResult();
        assert.strictEqual(oResult.value.length, 3);
        assert.ok(_Helper.getPrivateAnnotation(oResult.value[0], "transient"));
        assert.strictEqual(oResult.value[0].name, "John Doe");
        assert.strictEqual(oResult.value[1], oReadResult.value[0]);
        assert.strictEqual(oResult.value[2], oReadResult.value[1]);
        that.mock(oGroupLock1).expects("unlock").withExactArgs();
        assert.strictEqual(oCache.fetchValue(oGroupLock1, sTransientPredicate + "/name").getResult(), "John Doe");
    });
});
QUnit.test("CollectionCache: create and delete transient entry", function (assert) {
    var oRequestor = _Requestor.create("/~/", { getGroupProperty: defaultGetGroupProperty }), oCache = _Cache.create(oRequestor, "Employees"), oCreatePromise, oDeleteGroupLock = { unlock: function () { } }, oDeletePromise, oGroupLock = {
        cancel: function () { },
        getGroupId: function () { },
        getSerialNumber: function () { },
        isCanceled: function () { return false; },
        unlock: function () { }
    }, oTransientElement, sTransientPredicate = "($uid=id-1-23)";
    this.spy(oRequestor, "request");
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve({}));
    this.mock(oGroupLock).expects("getGroupId").twice().withExactArgs().returns("updateGroup");
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(42);
    oCreatePromise = oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, {}).catch(function (oError) {
        assert.ok(oError.canceled);
    });
    assert.strictEqual(oCache.aElements.length, 1);
    oTransientElement = oCache.aElements[0];
    sinon.assert.calledWithExactly(oRequestor.request, "POST", "Employees", sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate);
    this.spy(oRequestor, "removePost");
    this.spy(_Helper, "updateExisting");
    this.mock(oGroupLock).expects("cancel").withExactArgs();
    this.mock(oDeleteGroupLock).expects("unlock").withExactArgs();
    oDeletePromise = oCache._delete(oDeleteGroupLock, "n/a", "-1", function () {
        throw new Error();
    });
    sinon.assert.calledWithExactly(oRequestor.removePost, "updateGroup", sinon.match(function (oParameter) {
        return oParameter === oTransientElement;
    }));
    assert.strictEqual(oCache.aElements.length, 0);
    assert.notOk(sTransientPredicate in oCache.aElements.$byPredicate);
    return Promise.all([oCreatePromise, oDeletePromise]);
});
QUnit.test("CollectionCache: delete created entity", function (assert) {
    var oRequestor = _Requestor.create("/~/", {
        getGroupProperty: defaultGetGroupProperty,
        reportStateMessages: function () { }
    }), oCache = _Cache.create(oRequestor, "Employees"), fnCallback = this.spy(), oCreatedPromise, oEntity = { EmployeeId: "4711", "@odata.etag": "anyEtag" }, sGroupId = "updateGroup", oGroupLock = {
        getGroupId: function () { },
        getSerialNumber: function () { },
        isCanceled: function () { return false; },
        unlock: function () { }
    }, sTransientPredicate = "($uid=id-1-23)", mTypeForMetaPath = {
        "/Employees": {
            $Key: ["EmployeeId"],
            EmployeeId: {
                $Type: "Edm.String"
            }
        }
    }, that = this;
    this.mock(oGroupLock).expects("getGroupId").twice().withExactArgs().returns(sGroupId);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(42);
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
    oCreatedPromise = oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate, {}, null, function fnSubmitCallback() { });
    assert.strictEqual(oCache.aElements.$created, 1);
    oRequestor.mBatchQueue[sGroupId][0][0].$submit();
    oRequestor.mBatchQueue[sGroupId][0][0].$resolve(oEntity);
    return oCreatedPromise.then(function () {
        var sEditUrl = "/~/Employees('4711')", oCacheData = oCache.fetchValue(_GroupLock.$cached, sTransientPredicate).getResult(), oDeleteGroupLock = {
            getUnlockedCopy: function () { },
            unlock: function () { }
        }, oDeleteGroupLockCopy;
        that.mock(oDeleteGroupLock).expects("getUnlockedCopy").returns(oDeleteGroupLockCopy);
        that.mock(oRequestor).expects("request").withExactArgs("DELETE", sEditUrl, sinon.match.same(oDeleteGroupLockCopy), { "If-Match": sinon.match.same(oCacheData) }, undefined, undefined, undefined, undefined, "Employees('4711')").returns(Promise.resolve().then(function () {
            that.mock(oRequestor.oModelInterface).expects("reportStateMessages").withExactArgs(oCache.sResourcePath, [], ["('4711')"]);
        }));
        return oCache._delete(oDeleteGroupLock, sEditUrl, "-1", undefined, fnCallback).then(function () {
            sinon.assert.calledOnce(fnCallback);
            assert.strictEqual(oCache.aElements.length, 0);
            assert.strictEqual(oCache.aElements.$created, 0);
            assert.notOk("('4711')" in oCache.aElements.$byPredicate, "predicate gone");
            assert.notOk(sTransientPredicate in oCache.aElements.$byPredicate, "transient predicate gone");
        });
    });
});
[{
        sExpectedKeys: "@",
        iExpectedLength: 1,
        sFilter: "key eq 'a-1'",
        iLength: 0,
        iStart: 4,
        bTransientElement: false,
        aValues: [{ key: "@" }]
    }, {
        sExpectedKeys: "@",
        iExpectedLength: 1,
        iLength: 0,
        iStart: 4,
        bTransientElement: true,
        aValues: []
    }, {
        sExpectedKeys: "@",
        iExpectedLength: 1,
        iLength: 1,
        iStart: 0,
        bTransientElement: true,
        aValues: []
    }, {
        sExpectedKeys: "@a",
        iExpectedLength: 2,
        sFilter: "key eq 'a-1' or key eq 'a0'",
        iLength: 1,
        iStart: 1,
        bTransientElement: false,
        aValues: [{ key: "a" }, { key: "@" }]
    }, {
        sExpectedKeys: "@a",
        iExpectedLength: 2,
        sFilter: "key eq 'a0'",
        iLength: 1,
        iStart: 1,
        bTransientElement: true,
        aValues: [{ key: "a" }]
    }, {
        sExpectedKeys: "...d",
        iExpectedLength: 4,
        sFilter: "key eq 'a3'",
        iLength: 1,
        iStart: 3,
        aValues: [{ key: "d" }]
    }, {
        sExpectedKeys: "@a",
        iExpectedLength: 2,
        sFilter: "key eq 'a-1' or key eq 'a0'",
        iLength: 2,
        iStart: 0,
        bTransientElement: false,
        aValues: [{ key: "@" }, { key: "a" }]
    }, {
        sExpectedKeys: "@a",
        iExpectedLength: 2,
        sFilter: "key eq 'a0'",
        iLength: 2,
        iStart: 0,
        bTransientElement: true,
        aValues: [{ key: "a" }]
    }, {
        sExpectedKeys: "ab",
        iExpectedLength: 2,
        sFilter: "key eq 'a0' or key eq 'a1'",
        iLength: 2,
        iStart: 0,
        aValues: [{ key: "a" }, { key: "b" }]
    }, {
        sExpectedKeys: "...de",
        iExpectedLength: 5,
        sFilter: "key eq 'a3' or key eq 'a4'",
        iLength: 2,
        iStart: 3,
        aValues: [{ key: "e" }, { key: "d" }]
    }, {
        sExpectedKeys: "........................yz",
        iExpectedLength: 26,
        sFilter: "key eq 'a24' or key eq 'a25' or key eq 'a6' or key eq 'a7'",
        aKeptAliveKeys: ["g", "h"],
        iLength: 40,
        iStart: 24,
        aValues: [{ key: "y" }, { key: "z" }, { key: "g" }, { key: "h" }]
    }, {
        sExpectedKeys: "abcdefghij",
        iExpectedLength: 10,
        sFilter: "key eq 'a1'",
        iLength: undefined,
        iStart: 1,
        aValues: [{ key: "b" }]
    }, {
        sExpectedKeys: "@abcdefghij",
        iExpectedLength: 11,
        sFilter: "key eq 'a-1'",
        iLength: undefined,
        iStart: 0,
        bTransientElement: false,
        aValues: [{ key: "@" }]
    }, {
        sExpectedKeys: "@abcdefghij",
        iExpectedLength: 11,
        sFilter: "key eq 'a1'",
        iLength: undefined,
        iStart: 2,
        bTransientElement: false,
        aValues: [{ key: "b" }]
    }].forEach(function (oFixture, iFixtureIndex) {
    QUnit.test("CollectionCache#requestSideEffects, " + iFixtureIndex, function (assert) {
        var oCreatedElement, iLength = oFixture.iLength, iStart = oFixture.iStart, iFillLength = Math.min(Math.max(iLength || 0, 10), 26), iFillStart = iStart < 10 ? 0 : iStart, iReceivedLength = oFixture.aValues.length, sResourcePath = "TEAMS('42')/Foo", oCache = this.createCache(sResourcePath, {}, true), that = this, i;
        return this.mockRequestAndRead(oCache, 0, sResourcePath, iFillStart, iFillLength, iFillLength, undefined, "26").then(function () {
            var iExpectedByPredicateLength, oGroupLock = {}, oHelperMock = that.mock(_Helper), mMergedQueryOptions = {
                $apply: "A.P.P.L.E.",
                $count: true,
                $expand: { expand: null },
                $filter: "filter",
                $orderby: "orderby",
                $search: "search",
                $select: ["Name"],
                foo: "bar",
                "sap-client": "123"
            }, mNavigationPropertyPaths = {}, aPaths = ["ROOM_ID"], sPredicate, aPredicates, mQueryOptions = {}, mQueryOptions0 = {
                $apply: "A.P.P.L.E.",
                $expand: { expand: null },
                $filter: oFixture.sFilter,
                $select: ["Name"],
                foo: "bar",
                "sap-client": "123"
            }, mQueryOptions1 = {
                $apply: "A.P.P.L.E.",
                $expand: "~",
                $filter: oFixture.sFilter,
                $select: "~",
                foo: "bar",
                "sap-client": "123"
            }, sTransientPredicate = "($uid=id-1-23)", oPersisted = {
                "@$ui5._": {
                    "predicate": "('@')",
                    "transientPredicate": sTransientPredicate
                },
                "key": "@"
            }, oResult = { value: oFixture.aValues }, bSingle = iLength === undefined, oTransient = {
                "@$ui5._": {
                    "transient": true,
                    "transientPredicate": sTransientPredicate
                },
                "key": "@"
            }, mTypeForMetaPath = {
                "/TEAMS/Foo": {}
            };
            function getKeyFilter(oInstance) {
                return "key eq 'a" + aTestData.indexOf(oInstance.key) + "'";
            }
            aTestData[-1] = "@";
            aPredicates = aTestData.map(function (sKey) { return "('" + sKey + "')"; });
            if ("bTransientElement" in oFixture) {
                oCreatedElement = oFixture.bTransientElement ? oTransient : oPersisted;
                aPredicates.unshift("('@')");
                oCache.aElements.unshift(oCreatedElement);
                oCache.aElements.$created = 1;
                if (!oFixture.bTransientElement) {
                    oCache.aElements.$byPredicate["('@')"] = oCreatedElement;
                }
                oCache.aElements.$byPredicate[sTransientPredicate] = oCreatedElement;
            }
            else {
                oCache.aElements.$created = 0;
            }
            aPredicates = aPredicates.slice(iStart, iStart + (bSingle ? 1 : iLength));
            if (oFixture.bTransientElement && iStart === 0) {
                aPredicates.shift();
            }
            (oFixture.aKeptAliveKeys || []).forEach(function (sKey) {
                var sPredicate = "('" + sKey + "')";
                oCache.aElements.$byPredicate[sPredicate] = { key: sKey };
                aPredicates.push(sPredicate);
            });
            iExpectedByPredicateLength = iLength === undefined ? Object.keys(oCache.aElements.$byPredicate).length : iReceivedLength + (oCreatedElement ? 1 : 0);
            that.mock(oCache).expects("checkSharedRequest").withExactArgs();
            that.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
            that.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(that.oRequestor.getModelInterface().fetchMetadata), "/TEAMS/Foo", sinon.match.same(mNavigationPropertyPaths), "", true).returns(mMergedQueryOptions);
            that.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
            for (i = 0; i < iReceivedLength; i += 1) {
                sPredicate = "('" + oFixture.aValues[i].key + "')";
                oHelperMock.expects("getKeyFilter").withExactArgs(sinon.match.same(oCache.aElements.$byPredicate[sPredicate]), "/TEAMS/Foo", sinon.match.same(mTypeForMetaPath)).callsFake(getKeyFilter);
                oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), sPredicate, sinon.match.same(oCache.aElements.$byPredicate[sPredicate]), sinon.match.same(oFixture.aValues[i]), sinon.match.func);
            }
            if (iReceivedLength > 0) {
                if (oFixture.aValues.length > 1) {
                    mQueryOptions0.$top = mQueryOptions1.$top = oFixture.aValues.length;
                }
                that.mock(_Helper).expects("extractMergeableQueryOptions").withExactArgs(mQueryOptions0).callThrough();
                that.mock(that.oRequestor).expects("buildQueryString").withExactArgs("/TEAMS/Foo", mQueryOptions1, false, true).returns("?bar");
                that.oRequestorMock.expects("request").withExactArgs("GET", "TEAMS('42')/Foo?bar", sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, {
                    $expand: { expand: null },
                    $select: ["Name"]
                }).resolves(oResult);
                that.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oResult), sinon.match.same(mTypeForMetaPath), undefined, "", false, NaN).callsFake(function () {
                    for (i = 0; i < iReceivedLength; i += 1) {
                        _Helper.setPrivateAnnotation(oFixture.aValues[i], "predicate", "('" + oFixture.aValues[i].key + "')");
                    }
                });
            }
            return oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, aPredicates, bSingle).then(function () {
                var oElement, sKeys = "", i;
                if (oCreatedElement) {
                    assert.strictEqual(oCache.aElements.$created, 1);
                    assert.strictEqual(oCache.aElements[0], oCreatedElement);
                    assert.strictEqual(oCache.aElements.$byPredicate[sTransientPredicate], oCreatedElement);
                    assert.strictEqual(oCache.aElements.$byPredicate["('@')"], !oFixture.bTransientElement ? oCreatedElement : undefined);
                }
                else {
                    assert.strictEqual(oCache.aElements.$created, 0);
                }
                for (i = 0; i < oCache.aElements.length; i += 1) {
                    sKeys += oCache.aElements[i] && oCache.aElements[i].key || ".";
                }
                assert.strictEqual(sKeys, oFixture.sExpectedKeys);
                assert.strictEqual(oCache.aElements.length, oFixture.iExpectedLength, "length");
                assert.strictEqual(oCache.aElements.$count, 26, "$count is preserved");
                assert.strictEqual(Object.keys(oCache.aElements.$byPredicate).length, iExpectedByPredicateLength, "$byPredicate up-to-date");
                for (i = 0; i < oCache.aElements.length; i += 1) {
                    oElement = oCache.aElements[i];
                    if (oElement && oElement !== oTransient) {
                        assert.strictEqual(oCache.aElements.$byPredicate[_Helper.getPrivateAnnotation(oElement, "predicate")], oElement);
                    }
                }
            });
        });
    });
});
[null, {}].forEach(function (mLateQueryOptions, i) {
    QUnit.test("CollectionCache#requestSideEffects: nothing to do #" + i, function (assert) {
        var mByPredicate = {
            "($uid=id-1-23)": -1,
            "('@')": -1,
            "('a')": 0,
            "('b')": 1
        }, sByPredicateJSON = JSON.stringify(mByPredicate), aElements = [{
                "@$ui5._": {
                    "predicate": "('@')",
                    "transientPredicate": "($uid=id-1-23)"
                },
                "key": "@"
            }, {
                "@$ui5._": {
                    "predicate": "('a')"
                },
                "key": "a"
            }, {
                "@$ui5._": {
                    "predicate": "('b')"
                },
                "key": "b"
            }], sElementsJSON = JSON.stringify(aElements), mNavigationPropertyPaths = {}, aPaths = [], oPromise, mQueryOptions = {}, sResourcePath = "TEAMS('42')/Foo", mTypeForMetaPath = {}, oCache = this.createCache(sResourcePath, {}, true);
        oCache.aElements = aElements;
        oCache.aElements.$created = 1;
        oCache.aElements.$byPredicate = mByPredicate;
        oCache.mLateQueryOptions = mLateQueryOptions;
        this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
        this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/TEAMS/Foo", sinon.match.same(mNavigationPropertyPaths), "", true).returns(null);
        this.mock(_Helper).expects("getKeyFilter").never();
        this.mock(_Helper).expects("selectKeyProperties").never();
        this.oRequestorMock.expects("buildQueryString").never();
        this.oRequestorMock.expects("request").never();
        oPromise = oCache.requestSideEffects(null, aPaths, mNavigationPropertyPaths, 0, 1);
        assert.ok(oPromise instanceof SyncPromise);
        assert.strictEqual(oPromise.getResult(), undefined);
        assert.strictEqual(JSON.stringify(oCache.aElements), sElementsJSON);
        assert.strictEqual(oCache.aElements.$created, 1);
        assert.strictEqual(JSON.stringify(oCache.aElements.$byPredicate), sByPredicateJSON);
    });
});
QUnit.test("CollectionCache#requestSideEffects: no data to update", function (assert) {
    var sResourcePath = "TEAMS('42')/Foo", oCache = this.createCache(sResourcePath, null, true), that = this;
    return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 4, 4, undefined, "26").then(function () {
        var mTypeForMetaPath = {};
        that.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        that.mock(_Helper).expects("intersectQueryOptions").returns({});
        that.mock(_Helper).expects("getKeyFilter").never();
        that.mock(_Helper).expects("selectKeyProperties").never();
        that.oRequestorMock.expects("buildQueryString").never();
        that.oRequestorMock.expects("request").never();
        assert.strictEqual(oCache.requestSideEffects(null, null, {}, [], false), SyncPromise.resolve());
        assert.deepEqual(oCache.aElements, [], "all elements discarded");
        assert.deepEqual(oCache.aElements.$byPredicate, {}, "$byPredicate up-to-date");
        assert.strictEqual(oCache.aElements.$count, 26, "$count is preserved");
    });
});
[
    { error: false, path: "EMPLOYEE_2_TEAM" },
    { error: false, path: "EMPLOYEE_2_TEAM/TEAM_2_MANAGER" },
    { error: true, path: "EMPLOYEE_2_EQUIPMENT" }
].forEach(function (oFixture, i) {
    QUnit.test("CollectionCache#requestSideEffects: key property change #" + i, function (assert) {
        var oError = new Error(), oGroupLock = {}, oHelperMock = this.mock(_Helper), mMergeableQueryOptions = {}, mMergedQueryOptions = {}, mNavigationPropertyPaths = {}, oNewValue = {
            "@$ui5._": { predicate: "('c')" },
            Bar: {
                "@$ui5._": { predicate: "(3)" }
            }
        }, aPaths = ["n/a", "EMPLOYEE_2_TEAM", "EMPLOYEE"], mQueryOptions = {}, sResourcePath = "TEAMS('42')/Foo", oCache = this.createCache(sResourcePath, {}, true), that = this;
        return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 4, 4, undefined, "26").then(function () {
            var mTypeForMetaPath = {};
            oCache.aElements[2].Bar = {
                "@$ui5._": { predicate: "(2)" }
            };
            that.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
            that.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
            oHelperMock.expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(that.oRequestor.getModelInterface().fetchMetadata), "/TEAMS/Foo", sinon.match.same(mNavigationPropertyPaths), "", true).returns(mMergedQueryOptions);
            oHelperMock.expects("getKeyFilter").withExactArgs(sinon.match.same(oCache.aElements[2]), "/TEAMS/Foo", sinon.match.same(mTypeForMetaPath)).returns("~key_filter~");
            that.mock(_Helper).expects("extractMergeableQueryOptions").withExactArgs({ $filter: "~key_filter~" }).returns(mMergeableQueryOptions);
            that.mock(that.oRequestor).expects("buildQueryString").withExactArgs("/TEAMS/Foo", { $filter: "~key_filter~" }, false, true).returns("?bar");
            that.oRequestorMock.expects("request").withExactArgs("GET", "TEAMS('42')/Foo?bar", sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mMergeableQueryOptions)).resolves({ value: [oNewValue] });
            oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), "('c')", sinon.match.same(oCache.aElements[2]), sinon.match.same(oNewValue), sinon.match.func).callsFake(function (_mChangeListeners, _sPath, _oTarget, _oSource, fnCheckKeyPredicate) {
                if (fnCheckKeyPredicate("('c')/" + oFixture.path)) {
                    throw oError;
                }
            });
            return oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, ["('c')"]).then(function () {
                assert.notOk(oFixture.error);
            }, function (oResult) {
                assert.ok(oFixture.error);
                assert.strictEqual(oResult, oError);
            });
        });
    });
});
[[], [{}, {}]].forEach(function (aData, i) {
    var sTitle = "CollectionCache#requestSideEffects: unexpected response " + i;
    QUnit.test(sTitle, function (assert) {
        var oGroupLock = {}, mMergeableQueryOptions = {}, mMergedQueryOptions = {}, mNavigationPropertyPaths = {}, aPaths = [], mQueryOptions = {}, sResourcePath = "TEAMS('42')/Foo", oCache = this.createCache(sResourcePath, {}, true), that = this;
        return this.mockRequestAndRead(oCache, 0, sResourcePath, 1, 4, 4, undefined, "26").then(function () {
            var mTypeForMetaPath = {};
            oCache.aElements[0] = undefined;
            that.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
            that.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
            that.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(that.oRequestor.getModelInterface().fetchMetadata), "/TEAMS/Foo", sinon.match.same(mNavigationPropertyPaths), "", true).returns(mMergedQueryOptions);
            that.mock(_Helper).expects("getKeyFilter").withExactArgs(sinon.match.same(oCache.aElements[2]), "/TEAMS/Foo", sinon.match.same(mTypeForMetaPath)).returns("~key_filter~");
            that.mock(_Helper).expects("extractMergeableQueryOptions").withExactArgs({ $filter: "~key_filter~" }).returns(mMergeableQueryOptions);
            that.mock(that.oRequestor).expects("buildQueryString").withExactArgs("/TEAMS/Foo", { $filter: "~key_filter~" }, false, true).returns("?bar");
            that.oRequestorMock.expects("request").withExactArgs("GET", "TEAMS('42')/Foo?bar", sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mMergeableQueryOptions)).resolves({ value: aData });
            that.mock(oCache).expects("visitResponse").never();
            return oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, ["('c')"]).then(function () {
                assert.ok(false);
            }, function (oError) {
                TestUtils.checkError(assert, oError, Error, "Expected 1 row(s), but instead saw " + aData.length);
            });
        });
    });
});
QUnit.test("CollectionCache#requestSideEffects: wait for oPendingRequestsPromise", function (assert) {
    var oCache = this.createCache("Employees"), oGroupLock = {}, mNavigationPropertyPaths = {}, aPaths = [], fnResolve, oPromise;
    oCache.oPendingRequestsPromise = new SyncPromise(function (resolve) {
        fnResolve = resolve;
    });
    this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve({}));
    this.mock(_Helper).expects("intersectQueryOptions").never();
    this.mock(_Helper).expects("hasPrivateAnnotation").never();
    this.mock(_Helper).expects("getPrivateAnnotation").never();
    this.mock(_Helper).expects("getKeyFilter").never();
    this.mock(_Helper).expects("selectKeyProperties").never();
    this.mock(this.oRequestor).expects("buildQueryString").never();
    this.mock(this.oRequestor).expects("request").never();
    this.mock(oCache).expects("visitResponse").never();
    this.mock(_Helper).expects("updateExisting").never();
    oPromise = oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, 2, 1);
    assert.strictEqual(oPromise.isPending(), true);
    this.mock(oCache).expects("requestSideEffects").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), sinon.match.same(mNavigationPropertyPaths), 2, 1).returns(42);
    fnResolve();
    return oPromise.then(function (vResult) {
        assert.strictEqual(vResult, 42);
    });
});
QUnit.test("SingleCache", function (assert) {
    var oCache, fnGetOriginalResourcePath = {}, mQueryOptions = {};
    this.mock(_Cache.prototype).expects("setQueryOptions").withExactArgs(sinon.match.same(mQueryOptions));
    this.mock(_Cache.prototype).expects("setResourcePath").withExactArgs("resource/path").callsFake(function () {
        assert.notOk(this.bSharedRequest, "must not have been set yet");
    });
    oCache = _Cache.createSingle(this.oRequestor, "resource/path", mQueryOptions, "bSortExpandSelect", "bSharedRequest", fnGetOriginalResourcePath, "bPost", "/meta/path");
    assert.strictEqual(oCache.oRequestor, this.oRequestor);
    assert.strictEqual(oCache.bSortExpandSelect, "bSortExpandSelect");
    assert.strictEqual(oCache.bSharedRequest, "bSharedRequest");
    assert.strictEqual(oCache.fnGetOriginalResourcePath, fnGetOriginalResourcePath);
    assert.strictEqual(oCache.sMetaPath, "/meta/path");
    assert.strictEqual(oCache.bPost, "bPost");
    assert.strictEqual(oCache.bPosting, false);
    assert.strictEqual(oCache.oPromise, null);
});
[{}, null].forEach(function (oExpectedResult) {
    QUnit.test("SingleCache#fetchValue, oExpectedResult = " + oExpectedResult, function (assert) {
        var oCache, oCacheMock, bCreateOnDemand = "bCreateOnDemand", fnDataRequested1 = {}, fnDataRequested2 = {}, oGroupLock1 = {
            unlock: function () { }
        }, oGroupLock2 = {
            unlock: function () { }
        }, oListener1 = {}, oListener2 = {}, sMetaPath = "~", oOldPromise, aPromises, mQueryOptions = {}, sResourcePath = "Employees('1')", mTypeForMetaPath = {};
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, true).returns("?~");
        this.mock(_Cache.prototype).expects("fetchTypes").returns(SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)));
        oCache = _Cache.createSingle(this.oRequestor, sResourcePath, mQueryOptions, true, false, undefined, false, sMetaPath);
        oCacheMock = this.mock(oCache);
        assert.strictEqual(oCache.oPromise, null);
        oCacheMock.expects("registerChange").never();
        this.mock(oGroupLock1).expects("unlock").never();
        this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + "?~", sinon.match.same(oGroupLock1), undefined, undefined, sinon.match.same(fnDataRequested1), undefined, sMetaPath).returns(Promise.resolve(oExpectedResult).then(function () {
            oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oExpectedResult), sinon.match.same(mTypeForMetaPath));
            oCacheMock.expects("registerChange").withExactArgs(undefined, sinon.match.same(oListener1));
            oCacheMock.expects("drillDown").withExactArgs(sinon.match.same(oExpectedResult), undefined, sinon.match.same(oGroupLock1), bCreateOnDemand).returns(SyncPromise.resolve(oExpectedResult));
            oCacheMock.expects("drillDown").withExactArgs(sinon.match.same(oExpectedResult), "foo", sinon.match.same(oGroupLock2), bCreateOnDemand).returns(SyncPromise.resolve("bar"));
            oCacheMock.expects("drillDown").withExactArgs(sinon.match.same(oExpectedResult), "foo", sinon.match.same(_GroupLock.$cached)).returns(SyncPromise.resolve("bar"));
            return oExpectedResult;
        }));
        assert.strictEqual(oCache.getValue("foo"), undefined, "before fetchValue");
        aPromises = [
            oCache.fetchValue(oGroupLock1, undefined, fnDataRequested1, oListener1, bCreateOnDemand).then(function (oResult) {
                assert.strictEqual(oResult, oExpectedResult);
            })
        ];
        oOldPromise = oCache.oPromise;
        assert.notStrictEqual(oOldPromise, null);
        assert.ok(oCache.bSentRequest);
        oCacheMock.expects("registerChange").withExactArgs("foo", sinon.match.same(oListener2));
        this.mock(oGroupLock2).expects("unlock").withExactArgs();
        aPromises.push(oCache.fetchValue(oGroupLock2, "foo", fnDataRequested2, oListener2, bCreateOnDemand).then(function (oResult) {
            assert.strictEqual(oResult, "bar");
            assert.strictEqual(oCache.getValue("foo"), "bar", "data available");
        }));
        assert.strictEqual(oCache.oPromise, oOldPromise);
        assert.strictEqual(oCache.getValue("foo"), undefined, "data not yet available");
        aPromises.push(oOldPromise.then(function (oResult) {
            assert.strictEqual(oResult, oExpectedResult, "resolves with complete data from GET");
        }));
        return Promise.all(aPromises);
    });
});
QUnit.test("_SingleCache#fetchValue: GET fails due to $cached", function (assert) {
    var oCache = this.createSingle("Employees('1')"), oError = new Error();
    this.oRequestorMock.expects("request").withArgs("GET", "Employees('1')", sinon.match.same(_GroupLock.$cached)).throws(oError);
    assert.throws(function () {
        oCache.fetchValue(_GroupLock.$cached, "");
    }, oError);
    assert.strictEqual(oCache.bSentRequest, false);
});
QUnit.test("_SingleCache#getValue: drillDown asynchronous", function (assert) {
    var oCache = this.createSingle("Employees('1')"), oData = {};
    oCache.oPromise = SyncPromise.resolve(oData);
    this.mock(oCache).expects("drillDown").withExactArgs(sinon.match.same(oData), "foo", sinon.match.same(_GroupLock.$cached)).returns(SyncPromise.resolve(Promise.resolve()));
    assert.strictEqual(oCache.getValue("foo"), undefined);
});
QUnit.test("SingleCache#post: misc. errors", function (assert) {
    var sResourcePath = "LeaveRequest('1')/Submit", oCache = this.createSingle(sResourcePath, undefined, true), oEntity = {}, oGroupLock0 = { getGroupId: function () { } }, oPostData = {}, oPromise, oResult1 = {}, oResult2 = {}, that = this;
    assert.throws(function () {
        this.createSingle(sResourcePath).post({});
    }, new Error("POST request not allowed"));
    assert.throws(function () {
        oCache.fetchValue({});
    }, new Error("Cannot fetch a value before the POST request"));
    assert.notOk(oCache.bSentRequest);
    this.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
    this.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock0), { "If-Match": sinon.match.same(oEntity) }, sinon.match.same(oPostData)).resolves(oResult1);
    assert.strictEqual(oCache.oPromise, null);
    oPromise = oCache.post(oGroupLock0, oPostData, oEntity);
    assert.ok(!oPromise.isFulfilled());
    assert.ok(!oPromise.isRejected());
    assert.strictEqual(oCache.oPromise, oPromise);
    assert.throws(function () {
        oCache.post({}, oPostData);
    }, new Error("Parallel POST requests not allowed"));
    return oPromise.then(function (oPostResult1) {
        var fnDataRequested = that.spy(), oGroupLock1 = {}, oGroupLock2 = { unlock: function () { } }, oPromise, aPromises = [];
        assert.strictEqual(oPostResult1, oResult1);
        that.mock(oGroupLock2).expects("unlock").withExactArgs();
        oPromise = oCache.fetchValue(oGroupLock2, "", fnDataRequested);
        aPromises.push(oPromise.then(function (oReadResult) {
            assert.strictEqual(oReadResult, oResult1);
            assert.strictEqual(fnDataRequested.callCount, 0);
        }));
        that.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock1), {}, sinon.match.same(oPostData)).resolves(oResult2);
        oPromise = oCache.post(oGroupLock1, oPostData);
        assert.strictEqual(oCache.oPromise, oPromise);
        aPromises.push(oPromise.then(function (oPostResult2) {
            assert.strictEqual(oPostResult2, oResult2);
        }));
        return Promise.all(aPromises);
    });
});
[false, true].forEach(function (bOptional) {
    var sTitle = "SingleCache: Invoke Parameterless Actions with Empty Request Body: " + bOptional;
    QUnit.test(sTitle, function (assert) {
        var oData = { "X-HTTP-Method": "PUT" }, oEntity = {}, oGroupLock = { getGroupId: function () { } }, oPromise, sResourcePath = "LeaveRequest('1')/Submit", oCache = this.createSingle(sResourcePath, undefined, true);
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
        this.oRequestorMock.expects("relocateAll").withExactArgs("$parked.group", "group", sinon.match.same(oEntity));
        this.oRequestorMock.expects("isActionBodyOptional").withExactArgs().returns(bOptional);
        this.oRequestorMock.expects("request").withExactArgs("PUT", sResourcePath, sinon.match.same(oGroupLock), { "If-Match": sinon.match.same(oEntity) }, bOptional ? undefined : sinon.match.same(oData)).resolves();
        oPromise = oCache.post(oGroupLock, oData, oEntity);
        assert.strictEqual(oCache.oPromise, oPromise);
        assert.strictEqual(oCache.bSentRequest, true);
        return oPromise.then(function () {
            assert.deepEqual(oData, {});
        });
    });
});
QUnit.test("SingleCache: post w/o arguments", function (assert) {
    var sResourcePath = "LeaveRequest('1')/Submit", oCache = this.createSingle(sResourcePath, undefined, true), oGroupLock = {};
    assert.strictEqual(oCache.bSharedRequest, false);
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.oRequestorMock.expects("relocateAll").never();
    this.oRequestorMock.expects("isActionBodyOptional").never();
    this.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), {}, undefined).resolves();
    return oCache.post(oGroupLock);
});
QUnit.test("SingleCache: bIgnoreETag w/o oEntity", function () {
    var oCache = this.createSingle("Foo", undefined, true), oGroupLock = {};
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.oRequestorMock.expects("relocateAll").never();
    this.oRequestorMock.expects("isActionBodyOptional").never();
    this.oRequestorMock.expects("request").withExactArgs("POST", "Foo", sinon.match.same(oGroupLock), {}, undefined).resolves();
    return oCache.post(oGroupLock, undefined, undefined, true);
});
[false, true].forEach(function (bHasETag) {
    QUnit.test("SingleCache: post for bound operation, has ETag: " + bHasETag, function () {
        var oGroupLock = { getGroupId: function () { } }, sMetaPath = "/TEAMS/name.space.EditAction/@$ui5.overload/0/$ReturnType/$Type", sResourcePath = "TEAMS(TeamId='42',IsActiveEntity=true)/name.space.EditAction", oCache = _Cache.createSingle(this.oRequestor, sResourcePath, {}, true, false, undefined, true, sMetaPath), oEntity = bHasETag ? { "@odata.etag": "W/\"19700101000000.0000000\"" } : {}, oReturnValue = {}, mTypes = {};
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
        this.oRequestorMock.expects("relocateAll").withExactArgs("$parked.group", "group", sinon.match.same(oEntity));
        this.oRequestorMock.expects("isActionBodyOptional").never();
        this.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), { "If-Match": bHasETag ? "*" : {} }, null).resolves(oReturnValue);
        this.mock(oCache).expects("fetchTypes").withExactArgs().resolves(mTypes);
        this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oReturnValue), sinon.match.same(mTypes));
        return oCache.post(oGroupLock, null, oEntity, true);
    });
});
QUnit.test("SingleCache: post failure", function (assert) {
    var sResourcePath = "LeaveRequest('1')/Submit", oCache = this.createSingle(sResourcePath, undefined, true), oGroupLock = {}, sMessage = "deliberate failure", oPostData = {}, oPromise, that = this;
    this.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), {}, sinon.match.same(oPostData)).rejects(new Error(sMessage));
    oPromise = oCache.post(oGroupLock, oPostData).then(function () {
        assert.ok(false);
    }, function (oError) {
        var oGroupLock1 = {};
        assert.strictEqual(oError.message, sMessage);
        that.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock1), {}, sinon.match.same(oPostData)).rejects(new Error(sMessage));
        return oCache.post(oGroupLock1, oPostData).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.message, sMessage);
        });
    });
    assert.throws(function () {
        oCache.post({}, oPostData);
    }, /Parallel POST requests not allowed/);
    return oPromise.catch(function () { });
});
[false, true].forEach(function (bBound) {
    [false, true].forEach(function (bConfirm) {
        var sTitle = "SingleCache: post failure: strict handling, bound=" + bBound + ", confirm=" + bConfirm;
        QUnit.test(sTitle, function (assert) {
            var that = this, sResourcePath = "LeaveRequest('1')/Submit", oCache = this.createSingle(sResourcePath, undefined, true), oError = new Error("strict handling failed"), oEntity = {}, mExpectedHeaders0 = {
                Prefer: "handling=strict"
            }, mExpectedHeaders1 = {}, oGroupLock = {
                getGroupId: function () { },
                getUnlockedCopy: function () { }
            }, oPostData = {}, oResponse = {}, fnOnStrictHandlingFailed = sinon.spy(function (oError0) {
                assert.strictEqual(oError0, oError);
                assert.strictEqual(oCache.bPosting, false);
                return Promise.resolve().then(function () {
                    if (!bConfirm) {
                        return false;
                    }
                    assert.strictEqual(oCache.bPosting, false);
                    that.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns("~GroupLockCopy~");
                    that.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, "~GroupLockCopy~", mExpectedHeaders1, sinon.match.same(oPostData)).callsFake(function () {
                        assert.strictEqual(oCache.bPosting, true);
                        return Promise.resolve(oResponse);
                    });
                    that.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oResponse), "~types~");
                    return true;
                });
            });
            if (bBound) {
                mExpectedHeaders0["If-Match"] = mExpectedHeaders1["If-Match"] = oEntity;
            }
            oError.strictHandlingFailed = true;
            this.mock(oGroupLock).expects("getGroupId").exactly(bBound ? 1 : 0).withExactArgs().returns("groupId");
            this.mock(this.oRequestor).expects("relocateAll").exactly(bBound ? 1 : 0).withExactArgs("$parked.groupId", "groupId", sinon.match.same(oEntity));
            this.oRequestorMock.expects("request").withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), mExpectedHeaders0, sinon.match.same(oPostData)).rejects(oError);
            this.mock(oCache).expects("fetchTypes").exactly(bConfirm ? 2 : 1).withExactArgs().resolves("~types~");
            return oCache.post(oGroupLock, oPostData, bBound ? oEntity : undefined, undefined, fnOnStrictHandlingFailed).then(function (oResult) {
                assert.ok(bConfirm);
                assert.strictEqual(oCache.bPosting, false);
                assert.strictEqual(oResult, oResponse);
            }, function (oCanceledError) {
                assert.notOk(bConfirm);
                assert.strictEqual(oCache.bPosting, false);
                assert.strictEqual(oCanceledError.message, "Action canceled due to strict handling");
                assert.strictEqual(oCanceledError.canceled, true);
            });
        });
    });
});
QUnit.test("_Cache#toString", function (assert) {
    var oCache, mQueryOptions = { "foo": "bar" }, sResourcePath = "Employees";
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, undefined).returns("?foo=bar");
    oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions);
    assert.strictEqual(oCache.toString(), "/~/" + sResourcePath + "?foo=bar");
});
QUnit.test("SingleCache: mPatchRequests", function (assert) {
    var sResourcePath = "SOLineItemList(SalesOrderID='0',ItemPosition='0')", oCache = this.createSingle(sResourcePath), oError = new Error(), oGroupLock = {}, oPatchPromise1 = Promise.resolve({
        "@odata.etag": "W/\"19700101000000.9999999\"",
        Note: "Some Note"
    }), oPatchPromise2 = Promise.reject(oError), oPromise = Promise.resolve({
        "@odata.etag": "W/\"19700101000000.0000000\"",
        Note: "Some Note"
    }), that = this;
    this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath, sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, "/SOLineItemList").returns(oPromise);
    return oCache.fetchValue(oGroupLock).then(function (oEntity) {
        var oGroupLock0 = { getGroupId: function () { } }, oGroupLock1 = { getGroupId: function () { } }, oUpdatePromise;
        that.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
        that.oRequestorMock.expects("request").withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock0), { "If-Match": sinon.match.same(oEntity) }, { Note: "foo" }, sinon.match.func, sinon.match.func, undefined, oCache.sResourcePath, undefined).returns(oPatchPromise1);
        that.mock(oGroupLock1).expects("getGroupId").withExactArgs().returns("$direct");
        that.oRequestorMock.expects("request").withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock1), { "If-Match": sinon.match.same(oEntity) }, { Note: "bar" }, sinon.match.func, sinon.match.func, undefined, oCache.sResourcePath, undefined).returns(oPatchPromise2);
        oUpdatePromise = Promise.all([
            oCache.update(oGroupLock0, "Note", "foo", that.spy(), sResourcePath),
            oCache.update(oGroupLock1, "Note", "bar", that.spy(), sResourcePath).then(function () {
                assert.ok(false);
            }, function (oError0) {
                assert.strictEqual(oError0, oError);
            })
        ]).then(function () {
            assert.deepEqual(oCache.mPatchRequests, {}, "mPatchRequests empty when both patch requests are finished");
        });
        assert.deepEqual(oCache.mPatchRequests, {
            "Note": [oPatchPromise1, oPatchPromise2]
        }, "mPatchRequests remembers both pending requests");
        return oUpdatePromise;
    });
});
QUnit.test("SingleCache: update, hasPendingChanges and resetChanges", function (assert) {
    var sResourcePath = "SOLineItemList(SalesOrderID='0',ItemPosition='0')", oCache = this.createSingle(sResourcePath), oEntity = {
        "@odata.etag": "W/\"19700101000000.0000000\"",
        Note: "Some Note",
        Foo: "Bar"
    }, oError = new Error(), oGroupLock = {}, oPatchPromise1 = Promise.reject(oError), oPatchPromise2 = Promise.reject(oError), oPromise = Promise.resolve(oEntity), that = this;
    function unexpected() {
        assert.ok(false);
    }
    function rejected(oError) {
        assert.strictEqual(oError.canceled, true);
    }
    oError.canceled = true;
    this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath, sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, "/SOLineItemList").returns(oPromise);
    return oCache.fetchValue(oGroupLock, "Note").then(function () {
        var oGroupLock0 = { getGroupId: function () { } }, oGroupLock1 = { getGroupId: function () { } }, aUpdatePromises;
        assert.strictEqual(oCache.hasPendingChangesForPath(""), false);
        that.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
        that.oRequestorMock.expects("request").withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock0), { "If-Match": sinon.match.same(oEntity) }, { Note: "foo" }, sinon.match.func, sinon.match.func, undefined, sResourcePath, undefined).returns(oPatchPromise1);
        that.mock(oGroupLock1).expects("getGroupId").withExactArgs().returns("updateGroup");
        that.oRequestorMock.expects("request").withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock1), { "If-Match": sinon.match.same(oEntity) }, { Foo: "baz" }, sinon.match.func, sinon.match.func, undefined, sResourcePath, undefined).returns(oPatchPromise2);
        that.oRequestorMock.expects("removePatch").withExactArgs(sinon.match.same(oPatchPromise1));
        that.oRequestorMock.expects("removePatch").withExactArgs(sinon.match.same(oPatchPromise2));
        aUpdatePromises = [
            oCache.update(oGroupLock0, "Note", "foo", that.spy(), sResourcePath).then(unexpected, rejected),
            oCache.update(oGroupLock1, "Foo", "baz", that.spy(), sResourcePath).then(unexpected, rejected)
        ];
        assert.strictEqual(oCache.hasPendingChangesForPath(""), true);
        assert.strictEqual(oCache.hasPendingChangesForPath("Note"), true);
        assert.strictEqual(oCache.hasPendingChangesForPath("bar"), false);
        oCache.resetChangesForPath("");
        return Promise.all(aUpdatePromises).then(function () {
            assert.deepEqual(oCache.mPatchRequests, {});
        });
    });
});
QUnit.test("SingleCache#_delete, followed by _fetchValue: root entity", function (assert) {
    var oCache = this.createSingle("Employees('42')"), oData = { "@odata.etag": "W/\"19770724000000.0000000\"" }, oFetchGroupLock = {}, that = this;
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees('42')", sinon.match.same(oFetchGroupLock), undefined, undefined, undefined, undefined, "/Employees").resolves(oData);
    return oCache.fetchValue(oFetchGroupLock).then(function (oEntity) {
        var fnCallback = that.spy(), oDeleteGroupLock = new _GroupLock("group", "owner", true), oDeleteGroupLockCopy = {};
        that.mock(oDeleteGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oDeleteGroupLockCopy);
        that.oRequestorMock.expects("request").withExactArgs("DELETE", "Employees('42')", sinon.match.same(oDeleteGroupLockCopy), { "If-Match": sinon.match.same(oEntity) }, undefined, undefined, undefined, undefined, "Employees('42')").returns(Promise.resolve().then(function () {
            that.oModelInterfaceMock.expects("reportStateMessages").withExactArgs(oCache.sResourcePath, [], [""]);
        }));
        that.mock(oCache).expects("requestCount").withExactArgs(sinon.match.same(oDeleteGroupLock));
        return oCache._delete(oDeleteGroupLock, "Employees('42')", "", undefined, fnCallback).then(function (oResult) {
            var oGroupLock = { unlock: function () { } };
            assert.deepEqual(oResult, [undefined, undefined, undefined]);
            sinon.assert.calledOnce(fnCallback);
            sinon.assert.calledWithExactly(fnCallback);
            that.mock(oGroupLock).expects("unlock").withExactArgs();
            oCache.fetchValue(oGroupLock).then(function () {
                assert.ok(false);
            }, function (oError) {
                assert.strictEqual(oError.message, "Cannot read a deleted entity");
            });
        });
    });
});
[null, {}].forEach(function (mLateQueryOptions) {
    [undefined, "Me"].forEach(function (sReadPath) {
        var sTitle = "SingleCache#requestSideEffects, sResourcePath = " + sReadPath;
        QUnit.test(sTitle, function (assert) {
            var sResourcePath = "Employees('42')", oCache = this.createSingle(sResourcePath, {}), oCacheMock = this.mock(oCache), oGroupLock = {}, mMergedQueryOptions = {
                "sap-client": "123",
                $expand: { expand: null },
                $select: ["ROOM_ID"]
            }, mNavigationPropertyPaths = {}, oNewValue = {}, oOldValue = { "@$ui5._": { predicate: "(~)" } }, aPaths = ["ROOM_ID"], oPromise, mQueryOptions = {}, mTypeForMetaPath = {}, oUpdateAllExpectation, oVisitResponseExpectation;
            oCache.oPromise = SyncPromise.resolve(oOldValue);
            oCache.mLateQueryOptions = mLateQueryOptions;
            this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
            this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees", sinon.match.same(mNavigationPropertyPaths)).returns(mMergedQueryOptions);
            this.mock(_Helper).expects("extractMergeableQueryOptions").withExactArgs(sinon.match.same(mMergedQueryOptions)).callThrough();
            this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", {
                "sap-client": "123",
                $expand: "~",
                $select: "~"
            }, false, true).returns("?~");
            this.oRequestorMock.expects("request").withExactArgs("GET", (sReadPath || sResourcePath) + "?~", sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, {
                $expand: { expand: null },
                $select: ["ROOM_ID"]
            }).resolves(oNewValue);
            oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
            oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "").returns(SyncPromise.resolve(oOldValue));
            oVisitResponseExpectation = oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oNewValue).and(sinon.match({ "@$ui5._": { predicate: "(~)" } })), sinon.match.same(mTypeForMetaPath));
            oUpdateAllExpectation = this.mock(_Helper).expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oOldValue), sinon.match.same(oNewValue), sinon.match.func).returns(SyncPromise.resolve(oOldValue));
            oPromise = oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, sReadPath).then(function () {
                assert.ok(oVisitResponseExpectation.calledBefore(oUpdateAllExpectation));
            });
            assert.ok(!oPromise.isFulfilled());
            assert.ok(!oPromise.isRejected());
            oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "").callThrough();
            assert.strictEqual(oCache.fetchValue(_GroupLock.$cached, "").getResult(), oOldValue);
            return oPromise;
        });
    });
});
[
    { error: false, path: "EMPLOYEE_2_TEAM" },
    { error: false, path: "EMPLOYEE_2_TEAM/TEAM_2_MANAGER" },
    { error: true, path: "EMPLOYEE_2_EQUIPMENT" }
].forEach(function (oFixture, i) {
    QUnit.test("SingleCache#requestSideEffects: key property change #" + i, function (assert) {
        var sResourcePath = "Employees('42')", oCache = this.createSingle(sResourcePath, {
            "sap-client": "123",
            $select: ["ROOM_ID"]
        }), oError = new Error(), oGroupLock = {}, mMergeableQueryOptions = {}, mMergedQueryOptions = {}, mNavigationPropertyPaths = {}, oNewValue = {
            Bar: {
                "@$ui5._": { predicate: "('new')" }
            }
        }, oOldValue = {
            Bar: {
                "@$ui5._": { predicate: "('old')" }
            }
        }, aPaths = ["n/a", "EMPLOYEE_2_TEAM", "EMPLOYEE"], mQueryOptions = {}, mTypeForMetaPath = {};
        oCache.oPromise = {};
        this.mock(oCache).expects("checkSharedRequest").withExactArgs();
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
        this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees", sinon.match.same(mNavigationPropertyPaths)).returns(mMergedQueryOptions);
        this.mock(_Helper).expects("extractMergeableQueryOptions").withExactArgs(sinon.match.same(mMergedQueryOptions)).returns(mMergeableQueryOptions);
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mMergedQueryOptions), false, true).returns("?~");
        this.oRequestorMock.expects("request").withExactArgs("GET", "~path~?~", sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mMergeableQueryOptions)).resolves(oNewValue);
        this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve(mTypeForMetaPath));
        this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "").returns(SyncPromise.resolve(oOldValue));
        this.mock(oCache).expects("visitResponse").withExactArgs(sinon.match.same(oNewValue), sinon.match.same(mTypeForMetaPath));
        this.mock(_Helper).expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), "", sinon.match.same(oOldValue), sinon.match.same(oNewValue), sinon.match.func).callsFake(function (_mChangeListeners, _sPath, _oTarget, _oSource, fnCheckKeyPredicate) {
            if (fnCheckKeyPredicate(oFixture.path)) {
                throw oError;
            }
        });
        return oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, "~path~").then(function () {
            assert.notOk(oFixture.error);
        }, function (oResult) {
            assert.ok(oFixture.error);
            assert.strictEqual(oResult, oError);
        });
    });
});
QUnit.test("SingleCache#requestSideEffects: no data read before", function (assert) {
    var oCache = this.createSingle("Employees('42')");
    assert.strictEqual(oCache.oPromise, null);
    this.mock(oCache).expects("checkSharedRequest").withExactArgs();
    this.mock(_Helper).expects("intersectQueryOptions").never();
    this.mock(oCache).expects("fetchValue").never();
    this.oRequestorMock.expects("buildQueryString").never();
    this.oRequestorMock.expects("request").never();
    this.mock(oCache).expects("fetchTypes").never();
    this.mock(_Helper).expects("updateExisting").never();
    assert.strictEqual(oCache.requestSideEffects(), SyncPromise.resolve());
});
QUnit.test("SingleCache#requestSideEffects: no need to GET anything", function (assert) {
    var oCache = this.createSingle("Employees('42')"), mNavigationPropertyPaths = {}, aPaths = ["ROOM_ID"], mQueryOptions = {};
    oCache.oPromise = {};
    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
    this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees", sinon.match.same(mNavigationPropertyPaths)).returns(null);
    this.mock(oCache).expects("fetchValue").never();
    this.oRequestorMock.expects("buildQueryString").never();
    this.oRequestorMock.expects("request").never();
    this.mock(oCache).expects("fetchTypes").never();
    this.mock(_Helper).expects("updateExisting").never();
    assert.strictEqual(oCache.requestSideEffects({}, aPaths, mNavigationPropertyPaths), SyncPromise.resolve());
});
QUnit.test("SingleCache#requestSideEffects: request fails", function (assert) {
    var oCache = this.createSingle("Employees('42')"), oCacheMock = this.mock(oCache), oError = new Error(), oGroupLock = {}, mMergeableQueryOptions = {}, mMergedQueryOptions = {}, mNavigationPropertyPaths = {}, oOldValue = {}, aPaths = ["ROOM_ID"], oPromise, mQueryOptions = {};
    oCache.oPromise = SyncPromise.resolve(oOldValue);
    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
    this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees", sinon.match.same(mNavigationPropertyPaths)).returns(mMergedQueryOptions);
    this.mock(_Helper).expects("extractMergeableQueryOptions").withExactArgs(sinon.match.same(mMergedQueryOptions)).returns(mMergeableQueryOptions);
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mMergedQueryOptions), false, true).returns("?~");
    this.oRequestorMock.expects("request").withExactArgs("GET", "Employees('42')?~", sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mMergeableQueryOptions)).rejects(oError);
    oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve());
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "").returns(SyncPromise.resolve("ignored"));
    this.mock(_Helper).expects("updateExisting").never();
    oPromise = oCache.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths).then(function () {
        assert.ok(false, "unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
    oCacheMock.expects("fetchValue").twice().withExactArgs(sinon.match.same(_GroupLock.$cached), "").callThrough();
    assert.strictEqual(oCache.fetchValue(_GroupLock.$cached, "").getResult(), oOldValue);
    return oPromise.then(function () {
        return oCache.fetchValue(_GroupLock.$cached, "").then(function (vResult) {
            assert.strictEqual(vResult, oOldValue);
        });
    });
});
QUnit.test("SingleCache#requestSideEffects: $expand in intersection", function (assert) {
    var oCache = this.createSingle("Me"), oError = new Error("Unsupported collection-valued navigation property /Me/B/C"), mNavigationPropertyPaths = {}, aPaths = ["B/C"], mQueryOptions = {};
    oCache.oPromise = {};
    this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCache.mQueryOptions), sinon.match.same(oCache.mLateQueryOptions)).returns(mQueryOptions);
    this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths), sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Me", sinon.match.same(mNavigationPropertyPaths)).throws(oError);
    this.mock(oCache).expects("fetchValue").never();
    assert.throws(function () {
        oCache.requestSideEffects({}, aPaths, mNavigationPropertyPaths);
    }, oError);
});
QUnit.test("PropertyCache#fetchValue: unsupported bCreateOnDemand", function (assert) {
    var oCache = _Cache.createProperty(this.oRequestor, "Employees('1')");
    assert.throws(function () {
        oCache.fetchValue(null, "", null, null, true);
    }, new Error("Unsupported argument: bCreateOnDemand"));
});
[{
        "in": { value: "some value" },
        out: "some value"
    }, {
        "in": null,
        out: null
    }, {
        "in": 42,
        out: 42
    }].forEach(function (oFixture) {
    QUnit.test("PropertyCache#fetchValue, value = " + oFixture.out, function (assert) {
        var oCache, oCacheMock, fnDataRequested1 = {}, fnDataRequested2 = {}, aFetchValuePromises, oGroupLock1 = { unlock: function () { } }, oGroupLock2 = { unlock: function () { } }, oListener1 = {}, oListener2 = {}, mQueryOptions = {}, sResourcePath = "Employees('1')", that = this;
        this.oRequestorMock.expects("buildQueryString").withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, undefined).returns("?~");
        oCache = _Cache.createProperty(this.oRequestor, sResourcePath, mQueryOptions);
        oCacheMock = this.mock(oCache);
        this.mock(oGroupLock1).expects("unlock").never();
        oCacheMock.expects("registerChange").never();
        this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + "?~", sinon.match.same(oGroupLock1), undefined, undefined, sinon.match.same(fnDataRequested1), undefined, "/Employees").returns(Promise.resolve().then(function () {
            oCacheMock.expects("registerChange").withExactArgs("", sinon.match.same(oListener1));
            oCacheMock.expects("registerChange").withExactArgs("", undefined);
            return oFixture.in;
        }));
        aFetchValuePromises = [
            oCache.fetchValue(oGroupLock1, "", fnDataRequested1, oListener1).then(function (oResult) {
                var oGroupLock3 = { unlock: function () { } };
                assert.strictEqual(oResult, oFixture.out);
                that.mock(oGroupLock3).expects("unlock").withExactArgs();
                assert.strictEqual(oCache.fetchValue(oGroupLock3, "").getResult(), oFixture.out);
            })
        ];
        assert.ok(oCache.bSentRequest);
        oCacheMock.expects("registerChange").withExactArgs("", sinon.match.same(oListener2));
        this.mock(oGroupLock2).expects("unlock").withExactArgs();
        aFetchValuePromises.push(oCache.fetchValue(oGroupLock2, "", fnDataRequested2, oListener2).then(function (oResult) {
            assert.strictEqual(oResult, oFixture.out);
        }));
        return Promise.all(aFetchValuePromises);
    });
});
QUnit.test("PropertyCache#_delete", function (assert) {
    var oCache = _Cache.createProperty(this.oRequestor, "foo");
    assert.throws(function () {
        oCache._delete();
    }, new Error("Unsupported"));
});
QUnit.test("PropertyCache#create", function (assert) {
    var oCache = _Cache.createProperty(this.oRequestor, "foo");
    assert.throws(function () {
        oCache.create();
    }, new Error("Unsupported"));
});
QUnit.test("PropertyCache#update", function (assert) {
    var oCache = _Cache.createProperty(this.oRequestor, "foo");
    assert.throws(function () {
        oCache.update();
    }, new Error("Unsupported"));
});
[{}, { "Bar/Baz": {} }].forEach(function (mTypeForMetaPath) {
    var sTitle = "_Cache#calculateKeyPredicate: no key; " + JSON.stringify(mTypeForMetaPath);
    QUnit.test(sTitle, function (assert) {
        var oCache = new _Cache(this.oRequestor, "Foo"), oHelperMock = this.mock(_Helper), vInstance = {}, sMetaPath = "Bar/Baz";
        oHelperMock.expects("getKeyPredicate").never();
        oHelperMock.expects("setPrivateAnnotation").never();
        assert.strictEqual(oCache.calculateKeyPredicate(vInstance, mTypeForMetaPath, sMetaPath), undefined);
    });
});
QUnit.test("_Cache#calculateKeyPredicate: with key", function (assert) {
    var oCache = new _Cache(this.oRequestor, "Foo"), oHelperMock = this.mock(_Helper), vInstance = {}, sKeyPredicate = "(42)", sMetaPath = "Bar/Baz", mTypeForMetaPath = { "Bar/Baz": { "$Key": ["key"] } };
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(vInstance), sMetaPath, sinon.match.same(mTypeForMetaPath)).returns(sKeyPredicate);
    oHelperMock.expects("setPrivateAnnotation").withExactArgs(sinon.match.same(vInstance), "predicate", sinon.match.same(sKeyPredicate));
    assert.strictEqual(oCache.calculateKeyPredicate(vInstance, mTypeForMetaPath, sMetaPath), sKeyPredicate);
});
QUnit.test("_Cache#calculateKeyPredicate: with key but no data for key", function () {
    var oCache = new _Cache(this.oRequestor, "Foo"), oHelperMock = this.mock(_Helper), vInstance = {}, sMetaPath = "Bar/Baz", mTypeForMetaPath = { "Bar/Baz": { "$Key": ["key"] } };
    oHelperMock.expects("getKeyPredicate").withExactArgs(sinon.match.same(vInstance), sMetaPath, sinon.match.same(mTypeForMetaPath)).returns(undefined);
    oHelperMock.expects("setPrivateAnnotation").never();
    oCache.calculateKeyPredicate(vInstance, mTypeForMetaPath, sMetaPath);
});
QUnit.test("_Cache#visitResponse: compute count and calculate key predicates for single object", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS('42')/Foo"), oCacheMock = this.mock(oCache), oResult = {
        "@instance.annotation": {},
        "foo": "bar",
        "list": [{}, {}, {
                "nestedList": [{}]
            }],
        "property": {
            "nestedList": [{}]
        },
        "property@instance.annotation": {},
        "list2": [{}, {}, {}],
        "list2@odata.count": "12",
        "list2@odata.nextLink": "List2?skip=3",
        "list3": [{}, {}, {}],
        "list3@odata.nextLink": "List3?skip=3",
        "collectionValuedProperty": ["test1", "test2"],
        "null": null,
        "collectionWithNullValue": [null]
    }, mTypeForMetaPath = {};
    this.spy(_Helper, "updateExisting");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list[0]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list[1]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list[2]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list[2].nestedList[0]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list/nestedList");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.property), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/property");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.property.nestedList[0]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/property/nestedList");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list2[0]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list2");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list2[1]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list2");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list2[2]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list2");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list3[0]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list3");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list3[1]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list3");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(oResult.list3[2]), sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list3");
    oCache.visitResponse(oResult, mTypeForMetaPath);
    sinon.assert.calledWithExactly(_Helper.updateExisting, {}, "", oResult.list, { $count: 3 });
    assert.strictEqual(oResult.list.$count, 3);
    assert.strictEqual(oResult.list.$created, 0);
    sinon.assert.calledWithExactly(_Helper.updateExisting, {}, "", oResult.list2, { $count: 12 });
    assert.strictEqual(oResult.list2.$count, 12);
    assert.strictEqual(oResult.list2.$created, 0);
    assert.ok("$count" in oResult.list3);
    assert.strictEqual(oResult.list3.$count, undefined);
    assert.strictEqual(oResult.list3.$created, 0);
    assert.strictEqual(oResult.list[2].nestedList.$count, 1);
    assert.strictEqual(oResult.list[2].nestedList.$created, 0);
    assert.strictEqual(oResult.property.nestedList.$count, 1);
    assert.strictEqual(oResult.property.nestedList.$created, 0);
    assert.strictEqual(oResult.collectionValuedProperty.$count, 2);
    assert.strictEqual(oResult.collectionValuedProperty.$created, 0);
    assert.strictEqual(oResult.collectionWithNullValue.$count, 1);
    assert.strictEqual(oResult.collectionWithNullValue.$created, 0);
});
QUnit.test("_Cache#visitResponse: compute count and calculate key predicates for an array", function (assert) {
    var oCache = new _Cache(this.oRequestor, "TEAMS"), oCacheMock = this.mock(oCache), oHelperMock = this.mock(_Helper), sPredicate0 = "(13)", sPredicate1 = "(42)", aResult = [{
            "foo0": "bar0",
            "list0": [{}]
        }, {
            "foo": "bar",
            "list": [{}, {}, {
                    "nestedList": [{}]
                }],
            "property": {
                "nestedList": [{}]
            },
            "property@instance.annotation": {},
            "list2": [{}, {}, {}],
            "list2@odata.count": "12",
            "list2@odata.nextLink": "List2?skip=3",
            "list3": [{}, {}, {}],
            "list3@odata.nextLink": "List3?skip=3",
            "collectionValuedProperty": ["test1", "test2"],
            "null": null,
            "collectionWithNullValue": [null]
        }], mTypeForMetaPath = {};
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[0].list0), { $count: 1 }).callThrough();
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[1].list), { $count: 3 }).callThrough();
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[1].list[2].nestedList), { $count: 1 }).callThrough();
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[1].property.nestedList), { $count: 1 }).callThrough();
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[1].list2), { $count: 12 }).callThrough();
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[1].collectionValuedProperty), { $count: 2 }).callThrough();
    oHelperMock.expects("updateExisting").withExactArgs({}, "", sinon.match.same(aResult[1].collectionWithNullValue), { $count: 1 }).callThrough();
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[0]), sinon.match.same(mTypeForMetaPath), "/FOO").callsFake(function () {
        _Helper.setPrivateAnnotation(aResult[0], "predicate", sPredicate0);
    });
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[0].list0[0]), sinon.match.same(mTypeForMetaPath), "/FOO/list0").callsFake(function () {
        _Helper.setPrivateAnnotation(aResult[0].list0[0], "predicate", "('nested')");
    });
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1]), sinon.match.same(mTypeForMetaPath), "/FOO").callsFake(function () {
        _Helper.setPrivateAnnotation(aResult[1], "predicate", sPredicate1);
    });
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list[0]), sinon.match.same(mTypeForMetaPath), "/FOO/list");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list[1]), sinon.match.same(mTypeForMetaPath), "/FOO/list");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list[2]), sinon.match.same(mTypeForMetaPath), "/FOO/list");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list[2].nestedList[0]), sinon.match.same(mTypeForMetaPath), "/FOO/list/nestedList");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].property), sinon.match.same(mTypeForMetaPath), "/FOO/property");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].property.nestedList[0]), sinon.match.same(mTypeForMetaPath), "/FOO/property/nestedList");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list2[0]), sinon.match.same(mTypeForMetaPath), "/FOO/list2");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list2[1]), sinon.match.same(mTypeForMetaPath), "/FOO/list2");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list2[2]), sinon.match.same(mTypeForMetaPath), "/FOO/list2");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list3[0]), sinon.match.same(mTypeForMetaPath), "/FOO/list3");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list3[1]), sinon.match.same(mTypeForMetaPath), "/FOO/list3");
    oCacheMock.expects("calculateKeyPredicate").withExactArgs(sinon.match.same(aResult[1].list3[2]), sinon.match.same(mTypeForMetaPath), "/FOO/list3");
    this.oModelInterfaceMock.expects("reportStateMessages").never();
    oCache.visitResponse({ value: aResult }, mTypeForMetaPath, "/FOO", undefined, undefined, 0);
    assert.strictEqual(aResult[1].list.$count, 3);
    assert.strictEqual(aResult[1].list.$created, 0);
    assert.strictEqual(aResult[1].list2.$count, 12);
    assert.strictEqual(aResult[1].list2.$created, 0);
    assert.ok("$count" in aResult[1].list3);
    assert.strictEqual(aResult[1].list3.$count, undefined);
    assert.strictEqual(aResult[1].list3.$created, 0);
    assert.strictEqual(aResult[1].list[2].nestedList.$count, 1);
    assert.strictEqual(aResult[1].list[2].nestedList.$created, 0);
    assert.strictEqual(aResult[1].property.nestedList.$count, 1);
    assert.strictEqual(aResult[1].property.nestedList.$created, 0);
    assert.strictEqual(aResult[1].collectionValuedProperty.$count, 2);
    assert.strictEqual(aResult[1].collectionValuedProperty.$created, 0);
    assert.strictEqual(aResult[1].collectionWithNullValue.$count, 1);
    assert.strictEqual(aResult[1].collectionWithNullValue.$created, 0);
});
QUnit.test("CollectionCache#read uses visitResponse", function (assert) {
    var sResourcePath = "Employees", oCache = this.createCache(sResourcePath), oCacheMock = this.mock(oCache), oGroupLock = {
        getUnlockedCopy: function () { },
        unlock: function () { }
    }, oUnlockedCopy = {}, oValue0 = {}, oValue1 = {}, oData = {
        value: [oValue0, oValue1]
    };
    this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
    this.mock(oGroupLock).expects("unlock").withExactArgs();
    this.oRequestorMock.expects("request").withExactArgs("GET", sResourcePath + "?$skip=0&$top=3", sinon.match.same(oUnlockedCopy), undefined, undefined, undefined).resolves(oData);
    oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oData), sinon.match.object, undefined, undefined, undefined, 0);
    return oCache.read(0, 3, 0, oGroupLock).then(function () {
        assert.strictEqual(oCache.aElements[0], oValue0);
        assert.strictEqual(oCache.aElements[1], oValue1);
    });
});
QUnit.test("CollectionCache#addKeptElement", function (assert) {
    var oCache = this.createCache("Employees"), oElement = {};
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oElement), "predicate").returns("('foo')");
    oCache.addKeptElement(oElement);
    assert.strictEqual(oCache.aElements.$byPredicate["('foo')"], oElement);
    assert.ok(oCache.aElements.indexOf(oElement) < 0);
});
QUnit.test("from$skip", function (assert) {
    var aCollection = [];
    assert.strictEqual(_Cache.from$skip("1", aCollection), 1);
    aCollection.$created = 3;
    assert.strictEqual(_Cache.from$skip("1", aCollection), 4);
    assert.strictEqual(_Cache.from$skip("1a"), "1a");
});
QUnit.test("getElementIndex", function (assert) {
    var sKeyPredicate = "(~)", oElement = { "@$ui5._": { "predicate": sKeyPredicate } }, aElements = [{}, oElement];
    aElements.$byPredicate = {};
    aElements.$byPredicate[sKeyPredicate] = oElement;
    assert.strictEqual(_Cache.getElementIndex(aElements, sKeyPredicate, 0), 1);
    assert.strictEqual(_Cache.getElementIndex(aElements, sKeyPredicate, 1), 1);
    assert.strictEqual(_Cache.getElementIndex(aElements, sKeyPredicate, 2), 1);
});
QUnit.test("makeUpdateData", function (assert) {
    assert.deepEqual(_Cache.makeUpdateData(["Age"], 42), { "Age": 42 });
    assert.deepEqual(_Cache.makeUpdateData(["Address", "City"], "Walldorf"), { "Address": { "City": "Walldorf" } });
});
QUnit.test("getOriginalResourcePath", function (assert) {
    var oCache = new _Cache(this.oRequestor, "MANAGERS('42')"), oCallback = {
        fnGetOriginalResourcePath: function () { }
    }, oEntity = {};
    assert.strictEqual(oCache.getOriginalResourcePath(oEntity), "MANAGERS('42')");
    this.mock(oCallback).expects("fnGetOriginalResourcePath").withExactArgs(sinon.match.same(oEntity)).returns("TEAMS('77')/TEAM_2_MANAGER");
    oCache = new _Cache(this.oRequestor, "MANAGERS('42')", undefined, undefined, oCallback.fnGetOriginalResourcePath);
    assert.strictEqual(oCache.getOriginalResourcePath(oEntity), "TEAMS('77')/TEAM_2_MANAGER");
});
[false, true].forEach(function (bExists) {
    QUnit.test("create: bSharedRequest, created, bExists=" + bExists, function (assert) {
        var oCache;
        if (bExists) {
            this.oRequestor.$mSharedCollectionCacheByPath = { foo: "anotherCache" };
        }
        this.mock(_Helper).expects("getMetaPath").twice().withExactArgs("/resource/path").returns("/resource/metapath");
        this.oRequestorMock.expects("buildQueryString").twice().withExactArgs("/resource/metapath", "mQueryOptions", false, "bSortExpandSelect").returns("?~");
        oCache = _Cache.create(this.oRequestor, "resource/path", "mQueryOptions", "bSortExpandSelect", "deep/resource/path", true);
        assert.ok(oCache instanceof _Cache);
        assert.strictEqual(oCache.iActiveUsages, 1);
        assert.strictEqual(oCache.bSharedRequest, true);
        assert.strictEqual(this.oRequestor.$mSharedCollectionCacheByPath["resource/path?~"], oCache);
        if (bExists) {
            assert.strictEqual(this.oRequestor.$mSharedCollectionCacheByPath.foo, "anotherCache");
        }
    });
});
QUnit.test("create: bSharedRequest, shared", function (assert) {
    var oCache = {
        setActive: function () { }
    };
    this.oRequestor.$mSharedCollectionCacheByPath = {
        "resource/path?~": oCache
    };
    this.mock(_Helper).expects("getMetaPath").withExactArgs("/resource/path").returns("/resource/metapath");
    this.oRequestorMock.expects("buildQueryString").withExactArgs("/resource/metapath", "mQueryOptions", false, "bSortExpandSelect").returns("?~");
    this.mock(oCache).expects("setActive").withExactArgs(true);
    assert.strictEqual(_Cache.create(this.oRequestor, "resource/path", "mQueryOptions", "bSortExpandSelect", "deep/resource/path", true), oCache);
});
QUnit.test("create: bSharedRequest, cache size", function (assert) {
    var i, iTimerValue = 0, mSharedCollectionCacheByPath;
    this.stub(Date, "now").callsFake(function () {
        iTimerValue += 1;
        return iTimerValue;
    });
    _Cache.create(this.oRequestor, "/0", {}, false, undefined, true).setActive(false);
    for (i = 1; i <= 100; i += 1) {
        _Cache.create(this.oRequestor, "/" + i, {}, false, undefined, true);
    }
    mSharedCollectionCacheByPath = this.oRequestor.$mSharedCollectionCacheByPath;
    assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101);
    assert.ok("/0" in this.oRequestor.$mSharedCollectionCacheByPath);
    _Cache.create(this.oRequestor, "/42", {}, false, undefined, true);
    assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101, "no change when reusing a cache");
    _Cache.create(this.oRequestor, "/102", {}, false, undefined, true);
    assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101, "one added, one removed");
    assert.notOk("/0" in mSharedCollectionCacheByPath);
    _Cache.create(this.oRequestor, "/0", {}, false, undefined, true);
    assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 102, "all caches active, nothing removed");
    mSharedCollectionCacheByPath["/10"].setActive(false);
    mSharedCollectionCacheByPath["/20"].setActive(false);
    mSharedCollectionCacheByPath["/30"].setActive(false);
    mSharedCollectionCacheByPath["/0"].setActive(false);
    _Cache.create(this.oRequestor, "/103", {}, false, undefined, true);
    assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101);
    assert.ok("/0" in this.oRequestor.$mSharedCollectionCacheByPath);
    assert.notOk("/10" in this.oRequestor.$mSharedCollectionCacheByPath);
    assert.notOk("/20" in this.oRequestor.$mSharedCollectionCacheByPath);
    assert.ok("/30" in this.oRequestor.$mSharedCollectionCacheByPath);
    _Cache.create(this.oRequestor, "/104", {}, false, undefined, true);
    assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101);
    assert.notOk("/30" in mSharedCollectionCacheByPath);
});
[{
        sTitle: "refreshKeptElements with one kept context",
        mKeptAliveElementsByPredicate: {
            "('Foo')": { key: "Foo" }
        },
        sFilter: "~Foo~"
    }, {
        sTitle: "refreshKeptElements with two kept contexts",
        mKeptAliveElementsByPredicate: {
            "('Foo')": { key: "Foo" },
            "('Bar')": { key: "Bar" }
        },
        sFilter: "~Bar~ or ~Foo~",
        iTop: 2
    }, {
        sTitle: "refreshKeptElements with one kept context; after refresh kept element is deleted",
        mKeptAliveElementsByPredicate: {
            "('Foo')": { bDeleted: true, key: "Foo" }
        },
        sFilter: "~Foo~"
    }, {
        sTitle: "refreshKeptElements with two kept contexts;" + " after refresh one kept element is deleted",
        mKeptAliveElementsByPredicate: {
            "('Foo')": { bDeleted: true, key: "Foo" },
            "('Bar')": { key: "Bar" }
        },
        sFilter: "~Bar~ or ~Foo~",
        iTop: 2
    }, {
        sTitle: "refreshKeptElements with two kept contexts;" + " after refresh all kept elements are deleted",
        mKeptAliveElementsByPredicate: {
            "('Foo')": { bDeleted: true, key: "Foo" },
            "('Bar')": { bDeleted: true, key: "Bar" }
        },
        sFilter: "~Bar~ or ~Foo~",
        iTop: 2
    }].forEach(function (oFixture) {
    QUnit.test(oFixture.sTitle, function (assert) {
        var mByPredicate = {}, oCache = _Cache.create(this.oRequestor, "Employees", {}), oCacheMock = this.mock(oCache), oGroupLock = {}, oHelperMock = this.mock(_Helper), mLateQueryOptions = {}, mQueryOptionsCopy = {
            $count: true,
            $orderby: "~orderby~",
            $search: "~search~"
        }, fnOnRemove = sinon.spy(), oResponse = {
            value: []
        }, mTypes = {};
        oCache.mLateQueryOptions = mLateQueryOptions;
        Object.keys(oFixture.mKeptAliveElementsByPredicate).forEach(function (sPredicate) {
            var oElement = oFixture.mKeptAliveElementsByPredicate[sPredicate];
            oCache.aElements.$byPredicate[sPredicate] = oElement;
            oHelperMock.expects("getKeyFilter").withExactArgs(sinon.match.same(oElement), oCache.sMetaPath, sinon.match.same(mTypes)).returns("~" + oElement.key + "~");
            if (!oElement.bDeleted) {
                oResponse.value.push(oElement);
                mByPredicate[sPredicate] = oElement;
                oHelperMock.expects("updateAll").withExactArgs(sinon.match.same(oCache.mChangeListeners), sPredicate, sinon.match.same(oElement), sinon.match.same(oElement));
            }
        });
        oHelperMock.expects("merge").withExactArgs({}, sinon.match.same(oCache.mQueryOptions)).returns(mQueryOptionsCopy);
        oHelperMock.expects("aggregateExpandSelect").withExactArgs(sinon.match.same(mQueryOptionsCopy), sinon.match.same(oCache.mLateQueryOptions));
        this.mock(oCache.oRequestor).expects("buildQueryString").withExactArgs(oCache.sMetaPath, sinon.match(function (oValue) {
            return oValue === mQueryOptionsCopy && oValue.$filter === oFixture.sFilter && "$top" in oValue === "iTop" in oFixture && oValue.$top === oFixture.iTop && !("$count" in oValue) && !("$orderby" in oValue) && !("$search" in oValue);
        }), false, true).returns("?$filter=" + oFixture.sFilter);
        oCacheMock.expects("fetchTypes").returns(SyncPromise.resolve(mTypes));
        this.mock(this.oRequestor).expects("request").withExactArgs("GET", "Employees?$filter=" + oFixture.sFilter, sinon.match.same(oGroupLock)).returns(Promise.resolve(oResponse));
        oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oResponse), sinon.match.same(mTypes), undefined, undefined, undefined, 0).callsFake(function () {
            if (Object.keys(mByPredicate).length > 0) {
                oResponse.value.$byPredicate = mByPredicate;
            }
        });
        return oCache.refreshKeptElements(oGroupLock, fnOnRemove).then(function (oResult) {
            var mByPredicateAfterRefresh = {}, iCallCount = 0;
            assert.deepEqual(oResult, undefined);
            Object.keys(oFixture.mKeptAliveElementsByPredicate).forEach(function (sPredicate) {
                if (!oFixture.mKeptAliveElementsByPredicate[sPredicate].bDeleted) {
                    mByPredicateAfterRefresh[sPredicate] = oFixture.mKeptAliveElementsByPredicate[sPredicate];
                }
                else {
                    iCallCount += 1;
                    sinon.assert.calledWithExactly(fnOnRemove, sPredicate);
                }
            });
            sinon.assert.callCount(fnOnRemove, iCallCount);
            assert.deepEqual(oCache.aElements.$byPredicate, mByPredicateAfterRefresh);
        });
    });
});
QUnit.test("refreshKeptElements w/o kept-alive element", function (assert) {
    var oCache = _Cache.create(this.oRequestor, "Employees", {});
    this.mock(oCache.oRequestor).expects("request").never();
    assert.deepEqual(oCache.refreshKeptElements({}), undefined);
});