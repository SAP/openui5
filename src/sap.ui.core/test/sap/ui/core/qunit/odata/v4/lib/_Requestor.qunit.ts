import jQuery from "jquery.sap.global";
import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import _Batch from "sap/ui/model/odata/v4/lib/_Batch";
import _GroupLock from "sap/ui/model/odata/v4/lib/_GroupLock";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import _Requestor from "sap/ui/model/odata/v4/lib/_Requestor";
import TestUtils from "sap/ui/test/TestUtils";
var sClassName = "sap.ui.model.odata.v4.lib._Requestor", oModelInterface = {
    fetchMetadata: function () {
        throw new Error("Do not call me!");
    },
    fireSessionTimeout: function () { },
    getGroupProperty: defaultGetGroupProperty,
    onCreateGroup: function () { },
    reportStateMessages: function () { },
    reportTransitionMessages: function () { }
}, sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/", sSampleServiceUrl = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/";
function createMock(assert, oPayload, sTextStatus, mResponseHeaders) {
    var jqXHR = new jQuery.Deferred();
    Promise.resolve().then(function () {
        jqXHR.resolve(oPayload, sTextStatus, {
            getResponseHeader: function (sName) {
                mResponseHeaders = mResponseHeaders || {
                    "OData-Version": "4.0"
                };
                switch (sName) {
                    case "Content-Type": return mResponseHeaders["Content-Type"] || null;
                    case "DataServiceVersion": return mResponseHeaders["DataServiceVersion"] || null;
                    case "ETag": return mResponseHeaders["ETag"] || null;
                    case "OData-Version": return mResponseHeaders["OData-Version"] || null;
                    case "SAP-ContextId": return mResponseHeaders["SAP-ContextId"] || null;
                    case "SAP-Http-Session-Timeout": return mResponseHeaders["SAP-Http-Session-Timeout"] || null;
                    case "sap-messages": return mResponseHeaders["sap-messages"] || null;
                    case "X-CSRF-Token": return mResponseHeaders["X-CSRF-Token"] || null;
                    default: assert.ok(false, "unexpected getResponseHeader(" + sName + ")");
                }
            }
        });
    });
    return jqXHR;
}
function createResponse(oBody, mHeaders) {
    return {
        headers: mHeaders || {},
        responseText: oBody ? JSON.stringify(oBody) : ""
    };
}
function defaultGetGroupProperty(sGroupId, sPropertyName) {
    if (sPropertyName !== "submit") {
        throw new Error("Unsupported property name: " + sPropertyName);
    }
    if (sGroupId === "$direct") {
        return "Direct";
    }
    if (sGroupId === "$auto") {
        return "Auto";
    }
    return "API";
}
QUnit.module("sap.ui.model.odata.v4.lib._Requestor", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.mock(sap.ui).expects("getVersionInfo").atLeast(0);
    },
    createGroupLock: function (sGroupId) {
        var oGroupLock = {
            getGroupId: function () { },
            getSerialNumber: function () { },
            isCanceled: function () { },
            unlock: function () { }
        };
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns(sGroupId || "groupId");
        this.mock(oGroupLock).expects("isCanceled").withExactArgs().returns(false);
        this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(Infinity);
        this.mock(oGroupLock).expects("unlock").withExactArgs();
        return oGroupLock;
    }
});
[false, true].forEach(function (bStatistics) {
    QUnit.test("constructor, 'sap-statistics' present: " + bStatistics, function (assert) {
        var mHeaders = {}, oHelperMock = this.mock(_Helper), mQueryParams = {}, oRequestor, vStatistics = {};
        if (bStatistics) {
            mQueryParams["sap-statistics"] = vStatistics;
        }
        oHelperMock.expects("buildQuery").withExactArgs(sinon.match.same(mQueryParams)).returns("?~");
        oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mHeaders, mQueryParams);
        assert.deepEqual(oRequestor.mBatchQueue, {});
        assert.strictEqual(oRequestor.mHeaders, mHeaders);
        assert.deepEqual(oRequestor.aLockedGroupLocks, []);
        assert.strictEqual(oRequestor.oModelInterface, oModelInterface);
        assert.strictEqual(oRequestor.sQueryParams, "?~");
        assert.deepEqual(oRequestor.mRunningChangeRequests, {});
        assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
        assert.strictEqual(oRequestor.iSessionTimer, 0);
        assert.strictEqual(oRequestor.iSerialNumber, 0);
        assert.strictEqual(oRequestor.sServiceUrl, sServiceUrl);
        assert.strictEqual(oRequestor.vStatistics, bStatistics ? vStatistics : undefined);
        assert.ok("vStatistics" in oRequestor);
        oHelperMock.expects("buildQuery").withExactArgs(undefined).returns("");
        oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
        assert.deepEqual(oRequestor.mHeaders, {});
        assert.strictEqual(oRequestor.vStatistics, undefined);
        assert.ok("vStatistics" in oRequestor);
    });
});
QUnit.test("destroy", function () {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
    oRequestor.destroy();
});
QUnit.test("getServiceUrl", function (assert) {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface, { "foo": "must be ignored" });
    assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl);
});
[{
        groupId: "$direct",
        submitMode: "Direct"
    }, {
        groupId: "$auto",
        submitMode: "Auto"
    }, {
        groupId: "unknown",
        submitMode: "API"
    }].forEach(function (oFixture) {
    QUnit.test("getGroupSubmitMode, success" + oFixture.groupId, function (assert) {
        var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
        this.mock(oModelInterface).expects("getGroupProperty").withExactArgs(oFixture.groupId, "submit").returns(oFixture.submitMode);
        assert.strictEqual(oRequestor.getGroupSubmitMode(oFixture.groupId), oFixture.submitMode);
    });
});
[{
        sODataVersion: "4.0",
        mFinalHeaders: {
            "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
        },
        mPredefinedPartHeaders: {
            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true"
        },
        mPredefinedRequestHeaders: {
            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "X-CSRF-Token": "Fetch"
        }
    }, {
        sODataVersion: "2.0",
        mFinalHeaders: {
            "Content-Type": "application/json;charset=UTF-8"
        },
        mPredefinedPartHeaders: {
            "Accept": "application/json"
        },
        mPredefinedRequestHeaders: {
            "Accept": "application/json",
            "MaxDataServiceVersion": "2.0",
            "DataServiceVersion": "2.0",
            "X-CSRF-Token": "Fetch"
        }
    }].forEach(function (oFixture) {
    var sTest = "factory function: check members for OData version = " + oFixture.sODataVersion;
    QUnit.test(sTest, function (assert) {
        var sBuildQueryResult = "foo", mHeaders = {}, mQueryParams = {}, oRequestor;
        this.mock(_Helper).expects("buildQuery").withExactArgs(mQueryParams).returns(sBuildQueryResult);
        oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mHeaders, mQueryParams, oFixture.sODataVersion);
        assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl, "parameter sServiceUrl");
        assert.strictEqual(oRequestor.mHeaders, mHeaders, "parameter mHeaders");
        assert.strictEqual(oRequestor.sQueryParams, sBuildQueryResult, "parameter mQueryParams");
        assert.strictEqual(oRequestor.oModelInterface, oModelInterface);
        assert.deepEqual(oRequestor.mFinalHeaders, oFixture.mFinalHeaders, "mFinalHeaders");
        assert.deepEqual(oRequestor.mPredefinedPartHeaders, oFixture.mPredefinedPartHeaders, "mPredefinedPartHeaders");
        assert.deepEqual(oRequestor.mPredefinedRequestHeaders, oFixture.mPredefinedRequestHeaders, "mPredefinedRequestHeaders");
    });
});
QUnit.test("factory function: check members; default values", function (assert) {
    var mFinalHeaders = {
        "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
    }, mPredefinedPartHeaders = {
        "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true"
    }, mPredefinedRequestHeaders = {
        "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "X-CSRF-Token": "Fetch"
    }, oRequestor;
    oRequestor = _Requestor.create(sServiceUrl);
    assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl, "parameter sServiceUrl");
    assert.deepEqual(oRequestor.mHeaders, {}, "parameter mHeaders");
    assert.strictEqual(oRequestor.sQueryParams, "", "parameter mQueryParams");
    assert.strictEqual(oRequestor.onCreateGroup, undefined, "parameter onCreateGroup");
    assert.deepEqual(oRequestor.mFinalHeaders, mFinalHeaders, "mFinalHeaders");
    assert.deepEqual(oRequestor.mPredefinedPartHeaders, mPredefinedPartHeaders, "mPredefinedPartHeaders");
    assert.deepEqual(oRequestor.mPredefinedRequestHeaders, mPredefinedRequestHeaders, "mPredefinedRequestHeaders");
});
[{
        iRequests: 1,
        sRequired: null,
        bRequestSucceeds: true,
        sTitle: "success"
    }, {
        iRequests: 1,
        sRequired: null,
        bRequestSucceeds: false,
        sTitle: "failure with 403"
    }, {
        iRequests: 1,
        sRequired: "Required",
        bRequestSucceeds: false,
        iStatus: 500,
        sTitle: "failure with 500"
    }, {
        iRequests: 2,
        sRequired: "Required",
        sTitle: "CSRF token Required"
    }, {
        iRequests: 2,
        sRequired: "required",
        sTitle: "CSRF token required"
    }, {
        iRequests: 1,
        sRequired: "Required",
        bReadFails: true,
        sTitle: "fetch CSRF token fails"
    }, {
        iRequests: 2,
        sRequired: "Required",
        bDoNotDeliverToken: true,
        sTitle: "no CSRF token can be fetched"
    }].forEach(function (o) {
    QUnit.test("sendRequest: " + o.sTitle, function (assert) {
        var oError = {}, oExpectation, mHeaders = {}, oHelperMock = this.mock(_Helper), oReadFailure = {}, oRequestor = _Requestor.create("/Service/", oModelInterface, { "X-CSRF-Token": "Fetch" }), mResolvedHeaders = { "foo": "bar" }, oResponsePayload = {}, bSuccess = o.bRequestSucceeds !== false && !o.bReadFails && !o.bDoNotDeliverToken, oTokenRequiredResponse = {
            getResponseHeader: function (sName) {
                switch (sName) {
                    case "SAP-ContextId": return null;
                    case "SAP-Err-Id": return null;
                    case "SAP-Http-Session-Timeout": return null;
                    case "X-CSRF-Token": return o.sRequired;
                    default: assert.ok(false, "unexpected header " + sName);
                }
            },
            "status": o.iStatus || 403
        };
        oHelperMock.expects("createError").exactly(bSuccess || o.bReadFails ? 0 : 1).withExactArgs(sinon.match.same(oTokenRequiredResponse), "Communication error", "/Service/foo", "original/path").returns(oError);
        oHelperMock.expects("resolveIfMatchHeader").exactly(o.iRequests).withExactArgs(sinon.match.same(mHeaders)).returns(mResolvedHeaders);
        this.mock(jQuery).expects("ajax").exactly(o.iRequests).withExactArgs("/Service/foo", sinon.match({
            data: "payload",
            headers: mResolvedHeaders,
            method: "FOO"
        })).callsFake(function (_sUrl, oSettings) {
            var jqXHR;
            if (o.bRequestSucceeds === true || o.bRequestSucceeds === undefined && oSettings.headers["X-CSRF-Token"] === "abc123") {
                jqXHR = createMock(assert, oResponsePayload, "OK", {
                    "Content-Type": "application/json",
                    "ETag": "Bill",
                    "OData-Version": "4.0",
                    "sap-messages": "[{code : 42}]"
                });
            }
            else {
                jqXHR = new jQuery.Deferred();
                setTimeout(function () {
                    jqXHR.reject(oTokenRequiredResponse);
                }, 0);
            }
            return jqXHR;
        });
        oExpectation = this.mock(oRequestor).expects("refreshSecurityToken").withExactArgs("Fetch");
        if (o.bRequestSucceeds !== undefined) {
            oExpectation.never();
        }
        else {
            oExpectation.callsFake(function () {
                return new Promise(function (fnResolve, fnReject) {
                    setTimeout(function () {
                        if (o.bReadFails) {
                            fnReject(oReadFailure);
                        }
                        else {
                            oRequestor.mHeaders["X-CSRF-Token"] = o.bDoNotDeliverToken ? undefined : "abc123";
                            fnResolve();
                        }
                    }, 0);
                });
            });
        }
        return oRequestor.sendRequest("FOO", "foo", mHeaders, "payload", "original/path").then(function (oPayload) {
            assert.ok(bSuccess, "success possible");
            assert.strictEqual(oPayload.contentType, "application/json");
            assert.strictEqual(oPayload.body, oResponsePayload);
            assert.deepEqual(oPayload.body, { "@odata.etag": "Bill" });
            assert.strictEqual(oPayload.messages, "[{code : 42}]");
            assert.strictEqual(oPayload.resourcePath, "foo");
        }, function (oError0) {
            assert.ok(!bSuccess, "certain failure");
            assert.strictEqual(oError0, o.bReadFails ? oReadFailure : oError);
        });
    });
});
["NOTGET", "GET"].forEach(function (sMethod, i) {
    var sTitle = "sendRequest: wait for CSRF token if method is not GET, " + i;
    QUnit.test(sTitle, function (assert) {
        var oPromise, oRequestor = _Requestor.create(sServiceUrl, oModelInterface), oResult = {}, oSecurityTokenPromise = new Promise(function (resolve) {
            setTimeout(function () {
                oRequestor.mHeaders["X-CSRF-Token"] = "abc123";
                resolve();
            }, 0);
        });
        oRequestor.oSecurityTokenPromise = oSecurityTokenPromise;
        this.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl + "Employees?foo=bar", {
            contentType: undefined,
            data: "payload",
            headers: sinon.match({
                "X-CSRF-Token": sMethod === "GET" ? "Fetch" : "abc123"
            }),
            method: sMethod
        }).returns(createMock(assert, oResult, "OK"));
        oPromise = oRequestor.sendRequest(sMethod, "Employees?foo=bar", {}, "payload");
        return Promise.all([oPromise, oSecurityTokenPromise]);
    });
});
QUnit.test("sendRequest: fail, unsupported OData service version", function (assert) {
    var oError = {}, oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(jQuery).expects("ajax").withArgs("/Employees").returns(createMock(assert, {}, "OK"));
    this.mock(oRequestor).expects("doCheckVersionHeader").withExactArgs(sinon.match.func, "Employees", false).throws(oError);
    this.mock(oRequestor).expects("doConvertResponse").never();
    return oRequestor.sendRequest("GET", "Employees").then(function () {
        assert.notOk("Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("sendRequest(), store CSRF token from server", function (assert) {
    var oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(jQuery).expects("ajax").withExactArgs("/", sinon.match({ headers: { "X-CSRF-Token": "Fetch" } })).returns(createMock(assert, {}, "OK", {
        "OData-Version": "4.0",
        "X-CSRF-Token": "abc123"
    }));
    return oRequestor.sendRequest("GET", "").then(function () {
        assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
    });
});
QUnit.test("sendRequest: ignore unexpected ETag response header in $batch", function (assert) {
    var oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(jQuery).expects("ajax").withExactArgs("/$batch", sinon.match({ headers: { "X-CSRF-Token": "Fetch" } })).returns(createMock(assert, "--batch-id...", "OK", {
        "OData-Version": "4.0",
        "ETag": "unexpected"
    }));
    return oRequestor.sendRequest("POST", "$batch").then(function (oResult) {
        assert.strictEqual(oResult.body, "--batch-id...");
    });
});
QUnit.test("sendRequest(): setSessionContext", function (assert) {
    var oJQueryMock = this.mock(jQuery), oRequestor = _Requestor.create("/", oModelInterface);
    oJQueryMock.expects("ajax").withExactArgs("/", sinon.match.object).returns(createMock(assert, {}, "OK", {
        "OData-Version": "4.0",
        "SAP-ContextId": "abc123",
        "SAP-Http-Session-Timeout": "120"
    }));
    this.mock(oRequestor).expects("setSessionContext").withExactArgs("abc123", "120");
    return oRequestor.sendRequest("GET", "");
});
QUnit.test("sendRequest(): error & session", function (assert) {
    var oJQueryMock = this.mock(jQuery), oRequestor = _Requestor.create("/", oModelInterface), that = this;
    oJQueryMock.expects("ajax").withExactArgs("/", sinon.match.object).returns(createMock(assert, {}, "OK", {
        "OData-Version": "4.0",
        "SAP-ContextId": "abc123"
    }));
    return oRequestor.sendRequest("GET", "").then(function () {
        var oExpectedError = new Error(), jqXHRMock;
        assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "abc123");
        jqXHRMock = new jQuery.Deferred();
        setTimeout(function () {
            jqXHRMock.reject({
                getResponseHeader: function (sName) {
                    switch (sName) {
                        case "SAP-ContextId": return null;
                        case "X-CSRF-Token": return null;
                        default: assert.ok(false, "unexpected header " + sName);
                    }
                },
                "status": 500
            });
        }, 0);
        oJQueryMock.expects("ajax").withExactArgs("/", sinon.match({ headers: { "SAP-ContextId": "abc123" } })).returns(jqXHRMock);
        that.oLogMock.expects("error").withExactArgs("Session not found on server", undefined, sClassName);
        that.mock(oRequestor).expects("clearSessionContext").withExactArgs(true);
        that.mock(_Helper).expects("createError").withExactArgs(sinon.match.object, "Session not found on server", "/", undefined).returns(oExpectedError);
        return oRequestor.sendRequest("GET", "").then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError, oExpectedError);
        });
    });
});
QUnit.test("sendRequest(): error in session", function (assert) {
    var oJQueryMock = this.mock(jQuery), oRequestor = _Requestor.create("/", oModelInterface), that = this;
    oJQueryMock.expects("ajax").withExactArgs("/", sinon.match.object).returns(createMock(assert, {}, "OK", {
        "OData-Version": "4.0",
        "SAP-ContextId": "abc123"
    }));
    return oRequestor.sendRequest("GET", "").then(function () {
        var oExpectedError = new Error(), jqXHRMock = new jQuery.Deferred();
        setTimeout(function () {
            jqXHRMock.reject({
                getResponseHeader: function (sName) {
                    switch (sName) {
                        case "SAP-ContextId": return "abc123";
                        case "SAP-Http-Session-Timeout": return "42";
                        case "X-CSRF-Token": return null;
                        default: assert.ok(false, "unexpected header " + sName);
                    }
                },
                "status": 500
            });
        }, 0);
        oJQueryMock.expects("ajax").withExactArgs("/", sinon.match({ headers: { "SAP-ContextId": "abc123" } })).returns(jqXHRMock);
        that.mock(oRequestor).expects("setSessionContext").withExactArgs("abc123", "42");
        that.mock(_Helper).expects("createError").returns(oExpectedError);
        return oRequestor.sendRequest("GET", "").then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError, oExpectedError);
        });
    });
});
QUnit.test("sendRequest(), keep old CSRF token in case none is sent", function (assert) {
    var oRequestor = _Requestor.create("/", oModelInterface, { "X-CSRF-Token": "abc123" });
    this.mock(jQuery).expects("ajax").withExactArgs("/", sinon.match({ headers: { "X-CSRF-Token": "abc123" } })).returns(createMock(assert, {}, "OK"));
    return oRequestor.sendRequest("GET", "").then(function () {
        assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
    });
});
QUnit.test("sendRequest(), keep fetching CSRF token in case none is sent", function (assert) {
    var oMock = this.mock(jQuery), oRequestor = _Requestor.create("/", oModelInterface);
    oMock.expects("ajax").withExactArgs("/", sinon.match({ headers: { "X-CSRF-Token": "Fetch" } })).returns(createMock(assert, {}, "OK"));
    return oRequestor.sendRequest("GET", "").then(function () {
        oMock.expects("ajax").withExactArgs("/", sinon.match({ headers: { "X-CSRF-Token": "Fetch" } })).returns(createMock(assert, {}, "OK"));
        return oRequestor.sendRequest("GET", "");
    });
});
QUnit.test("sendRequest(): parallel POST requests, fetch HEAD only once", function (assert) {
    var bFirstRequest = true, jqFirstTokenXHR = createMock(assert, {}, "OK", {
        "OData-Version": "4.0",
        "X-CSRF-Token": "abc123"
    }), iHeadRequestCount = 0, oRequestor = _Requestor.create("/Service/", oModelInterface);
    this.mock(jQuery).expects("ajax").atLeast(1).callsFake(function (_sUrl, oSettings) {
        var jqXHR, oTokenRequiredResponse = {
            getResponseHeader: function () {
                return "required";
            },
            "status": 403
        };
        if (oSettings.method === "HEAD") {
            jqXHR = jqFirstTokenXHR;
            iHeadRequestCount += 1;
        }
        else if (oSettings.headers["X-CSRF-Token"] === "abc123") {
            jqXHR = createMock(assert, {}, "OK");
        }
        else {
            jqXHR = new jQuery.Deferred();
            if (bFirstRequest) {
                jqXHR.reject(oTokenRequiredResponse);
                bFirstRequest = false;
            }
            else {
                jqFirstTokenXHR.then(setTimeout(function () {
                    jqXHR.reject(oTokenRequiredResponse);
                }, 0));
            }
        }
        return jqXHR;
    });
    return Promise.all([
        oRequestor.sendRequest("POST"),
        oRequestor.sendRequest("POST")
    ]).then(function () {
        assert.strictEqual(iHeadRequestCount, 1, "fetch HEAD only once");
    });
});
[undefined, "false"].forEach(function (vStatistics) {
    [undefined, "$direct"].forEach(function (sGroupId) {
        var sTitle = "request: sGroupId=" + sGroupId + ", sap-statistics=" + vStatistics;
        QUnit.test(sTitle, function (assert) {
            var fnCancel = this.spy(), oConvertedResponse = {}, oGroupLock, oPayload = { "foo": 42 }, oPromise, oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, {
                "foo": "URL params are ignored for normal requests"
            }), oResponse = { body: {}, messages: {}, resourcePath: "Employees?custom=value" }, fnSubmit = this.spy();
            oRequestor.vStatistics = vStatistics;
            if (sGroupId) {
                oGroupLock = this.createGroupLock(sGroupId);
            }
            this.mock(oRequestor).expects("convertResourcePath").withExactArgs("Employees?custom=value").returns("~Employees~?custom=value");
            this.mock(JSON).expects("stringify").withExactArgs(sinon.match.same(oPayload)).returns("~payload~");
            this.mock(oRequestor).expects("sendRequest").withExactArgs("METHOD", vStatistics ? "~Employees~?custom=value&sap-statistics=false" : "~Employees~?custom=value", {
                "header": "value",
                "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
            }, "~payload~", "~Employees~?custom=value").resolves(oResponse);
            this.mock(oRequestor).expects("reportHeaderMessages").withExactArgs(oResponse.resourcePath, sinon.match.same(oResponse.messages));
            this.mock(oRequestor).expects("doConvertResponse").withExactArgs(sinon.match.same(oResponse.body), "meta/path").returns(oConvertedResponse);
            oPromise = oRequestor.request("METHOD", "Employees?custom=value", oGroupLock, {
                "header": "value",
                "Content-Type": "wrong"
            }, oPayload, fnSubmit, fnCancel, "meta/path");
            return oPromise.then(function (oResult) {
                assert.strictEqual(oResult, oConvertedResponse);
                sinon.assert.calledOnce(fnSubmit);
                sinon.assert.notCalled(fnCancel);
            });
        });
    });
});
[{
        defaultHeaders: { "Accept": "application/json;odata.metadata=full;IEEE754Compatible=true" },
        requestHeaders: { "OData-MaxVersion": "5.0", "OData-Version": "4.1" },
        result: {
            "Accept": "application/json;odata.metadata=full;IEEE754Compatible=true",
            "OData-MaxVersion": "5.0",
            "OData-Version": "4.1"
        }
    }, {
        defaultHeaders: undefined,
        requestHeaders: undefined,
        result: {}
    }, {
        defaultHeaders: { "Accept-Language": "ab-CD" },
        requestHeaders: undefined,
        result: { "Accept-Language": "ab-CD" }
    }, {
        defaultHeaders: undefined,
        requestHeaders: { "Accept-Language": "ab-CD" },
        result: { "Accept-Language": "ab-CD" }
    }, {
        defaultHeaders: { "Accept-Language": "ab-CD" },
        requestHeaders: { "foo": "bar" },
        result: { "Accept-Language": "ab-CD", "foo": "bar" }
    }].forEach(function (mHeaders) {
    QUnit.test("request, headers: " + JSON.stringify(mHeaders), function (assert) {
        var mDefaultHeaders = clone(mHeaders.defaultHeaders), oPromise, mRequestHeaders = clone(mHeaders.requestHeaders), oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mDefaultHeaders), oResult = {}, mResultHeaders = Object.assign({}, {
            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
            "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "X-CSRF-Token": "Fetch"
        }, mHeaders.result);
        function clone(o) {
            return o && JSON.parse(JSON.stringify(o));
        }
        this.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl + "Employees", {
            contentType: "application/json;charset=UTF-8;IEEE754Compatible=true",
            data: undefined,
            headers: mResultHeaders,
            method: "GET"
        }).returns(createMock(assert, oResult, "OK"));
        oPromise = oRequestor.request("GET", "Employees", undefined, mRequestHeaders);
        assert.deepEqual(mDefaultHeaders, mHeaders.defaultHeaders, "caller's map is unchanged");
        assert.deepEqual(mRequestHeaders, mHeaders.requestHeaders, "caller's map is unchanged");
        assert.ok(oPromise instanceof Promise);
        return oPromise.then(function (result) {
            assert.strictEqual(result, oResult);
        });
    });
});
QUnit.test("request, onCreateGroup", function () {
    var oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oModelInterface).expects("onCreateGroup").withExactArgs("groupId");
    oRequestor.request("GET", "SalesOrders", this.createGroupLock());
    oRequestor.request("GET", "SalesOrders", this.createGroupLock());
});
QUnit.test("request, getGroupProperty", function () {
    var oGroupLock = this.createGroupLock(), oModelInterface = {
        getGroupProperty: defaultGetGroupProperty,
        onCreateGroup: null
    }, oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oModelInterface).expects("getGroupProperty").withExactArgs("groupId", "submit").returns("API");
    oRequestor.request("GET", "SalesOrders", oGroupLock);
});
QUnit.test("request, getOrCreateBatchQueue", function (assert) {
    var oRequestor = _Requestor.create("/", oModelInterface), aRequests = [];
    this.mock(oRequestor).expects("getOrCreateBatchQueue").withExactArgs("groupId").returns(aRequests);
    oRequestor.request("GET", "SalesOrders", this.createGroupLock());
    assert.strictEqual(aRequests.length, 1);
    assert.strictEqual(aRequests[0].method, "GET");
});
[{
        sODataVersion: "2.0",
        mExpectedRequestHeaders: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            "DataServiceVersion": "2.0",
            "MaxDataServiceVersion": "2.0",
            "X-CSRF-Token": "Fetch"
        }
    }, {
        sODataVersion: "4.0",
        mExpectedRequestHeaders: {
            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
            "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "X-CSRF-Token": "Fetch"
        }
    }].forEach(function (oFixture) {
    var sTitle = "request: OData version specific headers for $direct; sODataVersion = " + oFixture.sODataVersion;
    QUnit.test(sTitle, function (assert) {
        var oConvertedResponse = {}, sMetaPath = "~", oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, undefined, oFixture.sODataVersion), oResponsePayload = {};
        this.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl + "Employees", {
            contentType: oFixture.mExpectedRequestHeaders["Content-Type"],
            data: undefined,
            headers: sinon.match(oFixture.mExpectedRequestHeaders),
            method: "GET"
        }).returns(createMock(assert, oResponsePayload, "OK"));
        this.mock(oRequestor).expects("doCheckVersionHeader").withExactArgs(sinon.match.func, "Employees", false);
        this.mock(oRequestor).expects("doConvertResponse").withExactArgs(oResponsePayload, sMetaPath).returns(oConvertedResponse);
        return oRequestor.request("GET", "Employees", undefined, undefined, undefined, undefined, undefined, sMetaPath).then(function (result) {
            assert.strictEqual(result, oConvertedResponse);
        });
    });
});
QUnit.test("sendRequest: optional OData-Version header for empty response", function (assert) {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl + "SalesOrderList('0500000676')", sinon.match.object).returns(createMock(assert, undefined, "No Content", {}));
    this.mock(oRequestor).expects("doCheckVersionHeader").withExactArgs(sinon.match.func, "SalesOrderList('0500000676')", true);
    return oRequestor.request("DELETE", "SalesOrderList('0500000676')").then(function (oResult) {
        assert.deepEqual(oResult, {});
    });
});
QUnit.test("sendRequest: GET returns '204 No Content'", function (assert) {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl + "SalesOrderList('0500000676')", sinon.match.object).returns(createMock(assert, undefined, "No Content", {}));
    this.mock(oRequestor).expects("doCheckVersionHeader").withExactArgs(sinon.match.func, "SalesOrderList('0500000676')", true);
    return oRequestor.request("GET", "SalesOrderList('0500000676')").then(function (oResult) {
        assert.deepEqual(oResult, null);
    });
});
QUnit.test("request: fail to convert payload, $direct", function (assert) {
    var oError = {}, oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, undefined, "2.0"), oResponsePayload = {};
    this.mock(jQuery).expects("ajax").withArgs(sServiceUrl + "Employees").returns(createMock(assert, oResponsePayload, "OK", { "DataServiceVersion": "2.0" }));
    this.mock(oRequestor).expects("doConvertResponse").withExactArgs(oResponsePayload, undefined).throws(oError);
    return oRequestor.request("GET", "Employees").then(function () {
        assert.notOk("Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("request: sOriginalPath, $direct", function () {
    var sOriginalPath = "TEAM('0')/TEAM_2_EMPLOYEES", oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oRequestor).expects("sendRequest").withExactArgs("POST", "EMPLOYEES", sinon.match.object, sinon.match.string, sOriginalPath).returns(Promise.resolve({}));
    return oRequestor.request("POST", "EMPLOYEES", this.createGroupLock("$direct"), {}, {}, undefined, undefined, undefined, sOriginalPath);
});
QUnit.test("request: sOriginalPath, $batch", function () {
    var sOriginalPath = "TEAM('0')/TEAM_2_EMPLOYEES", oRequestor = _Requestor.create("/", oModelInterface), oResponse = {
        status: 500
    };
    this.mock(oRequestor).expects("sendBatch").returns(Promise.resolve([oResponse]));
    this.mock(_Helper).expects("createError").withExactArgs(sinon.match.same(oResponse), "Communication error", "/EMPLOYEES", sOriginalPath).returns(new Error());
    return Promise.all([
        oRequestor.request("POST", "EMPLOYEES", this.createGroupLock(), {}, {}, undefined, undefined, undefined, sOriginalPath).catch(function () { }),
        oRequestor.processBatch("groupId")
    ]);
});
QUnit.test("request(...): batch group id and change sets", function () {
    var oGroupLock, oRequestor = _Requestor.create("/", oModelInterface);
    oRequestor.request("PATCH", "EntitySet1", oRequestor.lockGroup("groupId", {}), { "foo": "bar" }, { "a": "b" });
    oRequestor.request("PATCH", "EntitySet2", oRequestor.lockGroup("groupId", {}), { "bar": "baz" }, { "c": "d" });
    oRequestor.request("PATCH", "EntitySet3", oRequestor.lockGroup("$auto", {}), { "header": "value" }, { "e": "f" });
    oRequestor.request("PATCH", "EntitySet4", oRequestor.lockGroup("$auto", {}), { "header": "beAtFront" }, { "g": "h" }, undefined, undefined, undefined, undefined, true);
    oRequestor.request("GET", "EntitySet5", oRequestor.lockGroup("$auto", {}));
    oRequestor.request("GET", "EntitySet6", oRequestor.lockGroup("$auto", {}), undefined, undefined, undefined, undefined, undefined, undefined, true);
    oGroupLock = oRequestor.lockGroup("groupId", {});
    oRequestor.addChangeSet("groupId");
    oRequestor.request("PATCH", "EntitySet7", oRequestor.lockGroup("groupId", {}), { "serialNumber": "after change set 1" }, { "i": "j" });
    oRequestor.request("PATCH", "EntitySet8", oGroupLock, { "serialNumber": "before change set 1" }, { "k": "l" });
    oRequestor.request("PATCH", "EntitySet9", oRequestor.lockGroup("groupId", {}), { "serialNumber": "not set -> last change set" }, { "m": "n" });
    TestUtils.deepContains(oRequestor.mBatchQueue, {
        "groupId": [
            [{
                    method: "PATCH",
                    url: "EntitySet1",
                    headers: {
                        "foo": "bar"
                    },
                    body: { "a": "b" }
                }, {
                    method: "PATCH",
                    url: "EntitySet2",
                    headers: {
                        "bar": "baz"
                    },
                    body: { "c": "d" }
                }, {
                    method: "PATCH",
                    url: "EntitySet8",
                    headers: {
                        "serialNumber": "before change set 1"
                    },
                    body: { "k": "l" }
                }],
            [{
                    method: "PATCH",
                    url: "EntitySet7",
                    headers: {
                        "serialNumber": "after change set 1"
                    },
                    body: { "i": "j" }
                }, {
                    method: "PATCH",
                    url: "EntitySet9",
                    headers: {
                        "serialNumber": "not set -> last change set"
                    },
                    body: { "m": "n" }
                }]
        ],
        "$auto": [
            [{
                    method: "PATCH",
                    url: "EntitySet4",
                    headers: {
                        "header": "beAtFront"
                    },
                    body: { "g": "h" }
                }, {
                    method: "PATCH",
                    url: "EntitySet3",
                    headers: {
                        "header": "value"
                    },
                    body: { "e": "f" }
                }],
            {
                method: "GET",
                url: "EntitySet5"
            },
            {
                method: "GET",
                url: "EntitySet6"
            }
        ]
    });
});
QUnit.test("request(...): mQueryOptions, $batch", function () {
    var mQueryOptions = { $select: ["foo"] }, oRequestor = _Requestor.create("/", oModelInterface);
    oRequestor.request("GET", "EntitySet", this.createGroupLock("groupId"), undefined, undefined, undefined, undefined, undefined, undefined, false, mQueryOptions);
    TestUtils.deepContains(oRequestor.mBatchQueue, {
        "groupId": [
            [],
            {
                method: "GET",
                url: "EntitySet",
                $queryOptions: mQueryOptions
            }
        ]
    });
});
QUnit.test("request(...): mQueryOptions, $direct", function () {
    var mQueryOptions = {}, oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oRequestor).expects("addQueryString").withExactArgs("EntitySet('42')?foo=bar", "/EntitySet", sinon.match.same(mQueryOptions)).returns("EntitySet('42')?foo=bar&~");
    this.mock(oRequestor).expects("sendRequest").withArgs("GET", "EntitySet('42')?foo=bar&~").resolves({});
    return oRequestor.request("GET", "EntitySet('42')?foo=bar", this.createGroupLock("$direct"), undefined, undefined, undefined, undefined, "/EntitySet", undefined, false, mQueryOptions);
});
QUnit.test("processBatch: fail, unsupported OData service version", function (assert) {
    var oError = {}, oGetProductsPromise, oRequestor = _Requestor.create("/Service/", oModelInterface), oResponse = {
        headers: {
            "Content-Length": "42",
            "OData-Version": "foo"
        },
        responseText: JSON.stringify({ d: { foo: "bar" } })
    };
    this.mock(oRequestor).expects("doConvertResponse").never();
    this.mock(oRequestor).expects("reportHeaderMessages").never();
    oGetProductsPromise = oRequestor.request("GET", "Products", this.createGroupLock()).then(function () {
        assert.notOk("Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
    this.mock(oRequestor).expects("sendBatch").resolves([oResponse]);
    this.mock(oRequestor).expects("doCheckVersionHeader").withExactArgs(sinon.match(function (fnGetResponseHeader) {
        assert.strictEqual(typeof fnGetResponseHeader, "function");
        assert.strictEqual(fnGetResponseHeader("OData-Version"), "foo", "getResponseHeader has to be called on mResponse");
        return true;
    }), "Products", true).throws(oError);
    return Promise.all([oGetProductsPromise, oRequestor.processBatch("groupId")]);
});
[false, true].forEach(function (bSuccess) {
    QUnit.test("refreshSecurityToken: success = " + bSuccess, function (assert) {
        var oError = {}, oPromise, mHeaders = {}, mRequestHeaders = {}, oRequestor = _Requestor.create("/Service/", oModelInterface, mHeaders, { "sap-client": "123" }), oTokenRequiredResponse = {};
        this.mock(Object).expects("assign").twice().withExactArgs({}, sinon.match.same(mHeaders), { "X-CSRF-Token": "Fetch" }).returns(mRequestHeaders);
        this.mock(_Helper).expects("createError").exactly(bSuccess ? 0 : 2).withExactArgs(sinon.match.same(oTokenRequiredResponse), "Could not refresh security token").returns(oError);
        this.mock(jQuery).expects("ajax").twice().withExactArgs("/Service/?sap-client=123", sinon.match({
            headers: sinon.match.same(mRequestHeaders),
            method: "HEAD"
        })).callsFake(function () {
            var jqXHR;
            if (bSuccess) {
                jqXHR = createMock(assert, undefined, "nocontent", {
                    "OData-Version": "4.0",
                    "X-CSRF-Token": "abc123"
                });
            }
            else {
                jqXHR = new jQuery.Deferred();
                setTimeout(function () {
                    jqXHR.reject(oTokenRequiredResponse);
                }, 0);
            }
            return jqXHR;
        });
        assert.strictEqual("X-CSRF-Token" in oRequestor.mHeaders, false);
        oPromise = oRequestor.refreshSecurityToken(undefined);
        assert.strictEqual(oRequestor.refreshSecurityToken(undefined), oPromise, "promise reused");
        assert.strictEqual(oRequestor.oSecurityTokenPromise, oPromise, "promise stored at requestor instance so that request method can use it");
        return oPromise.then(function () {
            assert.ok(bSuccess, "success possible");
            assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
        }, function (oError0) {
            assert.ok(!bSuccess, "certain failure");
            assert.strictEqual(oError0, oError);
            assert.strictEqual("X-CSRF-Token" in oRequestor.mHeaders, false);
        }).then(function () {
            return oRequestor.refreshSecurityToken("some_old_token").then(function () {
                var oNewPromise;
                oNewPromise = oRequestor.refreshSecurityToken(oRequestor.mHeaders["X-CSRF-Token"]);
                assert.notStrictEqual(oNewPromise, oPromise, "new promise");
                return oNewPromise.catch(function () {
                    assert.ok(!bSuccess, "certain failure");
                });
            });
        });
    });
});
QUnit.test("refreshSecurityToken: keep fetching even if none is sent", function (assert) {
    var mHeaders = { "X-CSRF-Token": "old" }, mRequestHeaders = {}, oRequestor = _Requestor.create("/Service/", oModelInterface, mHeaders, { "sap-client": "123" });
    this.mock(Object).expects("assign").twice().withExactArgs({}, sinon.match.same(mHeaders), { "X-CSRF-Token": "Fetch" }).returns(mRequestHeaders);
    this.mock(jQuery).expects("ajax").twice().withExactArgs("/Service/?sap-client=123", sinon.match({
        headers: sinon.match.same(mRequestHeaders),
        method: "HEAD"
    })).returns(createMock(assert, undefined, "nocontent", { "OData-Version": "4.0" }));
    return oRequestor.refreshSecurityToken("old").then(function () {
        return oRequestor.refreshSecurityToken();
    });
});
[{
        headers: {
            securityToken0: "foo",
            securityToken1: "bar"
        },
        expectedHeaders: {
            "Accept-Language": "en",
            "X-CSRF-Token": undefined,
            securityToken0: "foo",
            securityToken1: "bar"
        }
    }, {
        headers: undefined,
        expectedHeaders: {
            "Accept-Language": "en",
            "X-CSRF-Token": undefined
        }
    }, {
        headers: {
            "X-CSRF-Token": "X-CSRF-Token from handler"
        },
        expectedHeaders: {
            "Accept-Language": "en",
            "X-CSRF-Token": "X-CSRF-Token from handler"
        }
    }, {
        headers: {
            "x-csRf-toKen": "x-csRf-toKen from handler"
        },
        expectedHeaders: {
            "Accept-Language": "en",
            "X-CSRF-Token": undefined,
            "x-csRf-toKen": "x-csRf-toKen from handler"
        }
    }].forEach(function (oFixture) {
    QUnit.test("processSecurityTokenHandlers: ", function (assert) {
        var oRequestor;
        function securityTokenHandler0() {
            return undefined;
        }
        function securityTokenHandler1() {
            return Promise.resolve(oFixture.headers);
        }
        function securityTokenHandler2() {
            return Promise.resolve({ "This should change": "nothing!" });
        }
        this.mock(sap.ui.getCore().getConfiguration()).expects("getSecurityTokenHandlers").withExactArgs().returns([securityTokenHandler0, securityTokenHandler1, securityTokenHandler2]);
        this.mock(_Requestor.prototype).expects("checkHeaderNames").withExactArgs(sinon.match.same(oFixture.headers));
        oRequestor = _Requestor.create("/Service/", oModelInterface, { "Accept-Language": "en" });
        assert.notStrictEqual(oRequestor.oSecurityTokenPromise, null);
        return oRequestor.oSecurityTokenPromise.then(function (oResult) {
            assert.deepEqual(oRequestor.mHeaders, oFixture.expectedHeaders);
            assert.strictEqual(oResult, undefined);
            assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
        });
    });
});
QUnit.test("processSecurityTokenHandler: handler rejects", function (assert) {
    var oRequestor;
    function securityTokenHandler() {
        return Promise.reject("foo");
    }
    this.mock(sap.ui.getCore().getConfiguration()).expects("getSecurityTokenHandlers").withExactArgs().returns([securityTokenHandler]);
    this.oLogMock.expects("error").withExactArgs("An error occurred within security token handler: " + securityTokenHandler, "foo", sClassName);
    oRequestor = _Requestor.create();
    return oRequestor.oSecurityTokenPromise.then(function () {
        assert.notOk(true);
        assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
    }, function (oError0) {
        assert.strictEqual(oError0, "foo");
    });
});
QUnit.test("processSecurityTokenHandler: checkHeaderNames throws", function (assert) {
    var oError = new Error("checkHeaderNames fails"), oRequestor, mNotAllowedHeaders = {};
    function securityTokenHandler() {
        return Promise.resolve(mNotAllowedHeaders);
    }
    this.mock(sap.ui.getCore().getConfiguration()).expects("getSecurityTokenHandlers").withExactArgs().returns([securityTokenHandler]);
    this.mock(_Requestor.prototype).expects("checkHeaderNames").withExactArgs(sinon.match.same(mNotAllowedHeaders)).throws(oError);
    this.oLogMock.expects("error").withExactArgs("An error occurred within security token handler: " + securityTokenHandler, oError, sClassName);
    oRequestor = _Requestor.create();
    return oRequestor.oSecurityTokenPromise.then(function () {
        assert.notOk(true);
        assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("processBatch(...): with empty group", function (assert) {
    var oRequestor = _Requestor.create("/Service/", oModelInterface), that = this;
    this.mock(oRequestor).expects("mergeGetRequests").never();
    this.mock(oRequestor).expects("sendBatch").never();
    this.mock(oRequestor).expects("batchRequestSent").never();
    this.mock(oRequestor).expects("batchResponseReceived").never();
    return oRequestor.processBatch("groupId").then(function (oResult) {
        var oBody = {}, oEntity = {}, oPromise;
        assert.deepEqual(oResult, undefined);
        _Helper.setPrivateAnnotation(oEntity, "postBody", oBody);
        oPromise = oRequestor.request("POST", "Customers", that.createGroupLock(), {}, oBody, undefined, function () { });
        oRequestor.removePost("groupId", oEntity);
        oRequestor.addChangeSet("groupId");
        return Promise.all([
            oPromise.catch(function (oError) {
                assert.ok(oError.canceled);
            }),
            oRequestor.processBatch("groupId")
        ]).then(function () {
            assert.strictEqual(oRequestor.mBatchQueue["groupId"], undefined);
        });
    });
});
QUnit.test("processBatch(...): success", function (assert) {
    var oBatchRequestSentExpectation, oBatchResponseReceivedExpectation, oCleanUpChangeSetsExpection, aExpectedRequests = [[{
                method: "POST",
                url: "~Customers",
                headers: {
                    "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                    "Accept-Language": "ab-CD",
                    "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true",
                    "Foo": "baz"
                },
                body: { "ID": 1 },
                $cancel: undefined,
                $metaPath: undefined,
                $promise: sinon.match.defined,
                $queryOptions: undefined,
                $reject: sinon.match.func,
                $resolve: sinon.match.func,
                $resourcePath: "~Customers",
                $submit: undefined
            }, {
                method: "DELETE",
                url: "~SalesOrders('42')",
                headers: {
                    "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                    "Accept-Language": "ab-CD",
                    "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
                },
                body: undefined,
                $cancel: undefined,
                $metaPath: undefined,
                $promise: sinon.match.defined,
                $queryOptions: undefined,
                $reject: sinon.match.func,
                $resolve: sinon.match.func,
                $resourcePath: "~SalesOrders('42')",
                $submit: undefined
            }], {
            method: "GET",
            url: "~Products('23')",
            headers: {
                "Accept": "application/json;odata.metadata=full",
                "Accept-Language": "ab-CD",
                "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true",
                "Foo": "bar"
            },
            body: undefined,
            $cancel: undefined,
            $metaPath: undefined,
            $promise: sinon.match.defined,
            $queryOptions: undefined,
            $reject: sinon.match.func,
            $resolve: sinon.match.func,
            $resourcePath: "~Products('23')",
            $submit: undefined
        }, {
            method: "GET",
            url: "~Products('4711')",
            headers: {
                "Accept": "application/json;odata.metadata=full",
                "Accept-Language": "ab-CD",
                "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
            },
            body: undefined,
            $cancel: undefined,
            $metaPath: undefined,
            $promise: sinon.match.defined,
            $queryOptions: undefined,
            $reject: sinon.match.func,
            $resolve: sinon.match.func,
            $resourcePath: "~Products('4711')",
            $submit: undefined
        }], sGroupId = "group1", aMergedRequests, aPromises = [], aResults = [{ "foo1": "bar1" }, { "foo2": "bar2" }, {}], aBatchResults = [
        [createResponse(aResults[1]), createResponse()],
        createResponse(aResults[0], { "etAG": "ETag value" }),
        createResponse()
    ], oRequestor = _Requestor.create("/Service/", oModelInterface, { "Accept-Language": "ab-CD" }), oRequestorMock = this.mock(oRequestor), oSendBatchExpectation, bWaitingIsOver;
    oRequestorMock.expects("convertResourcePath").withExactArgs("Products('23')").returns("~Products('23')");
    aPromises.push(oRequestor.request("GET", "Products('23')", this.createGroupLock(sGroupId), { Foo: "bar", Accept: "application/json;odata.metadata=full" }).then(function (oResult) {
        assert.deepEqual(oResult, {
            "@odata.etag": "ETag value",
            "foo1": "bar1"
        });
        aResults[0] = null;
        assert.notOk(bWaitingIsOver);
    }));
    oRequestorMock.expects("convertResourcePath").withExactArgs("Products('4711')").returns("~Products('4711')");
    aPromises.push(oRequestor.request("GET", "Products('4711')", this.createGroupLock(sGroupId), { Accept: "application/json;odata.metadata=full" }).then(function (oResult) {
        assert.deepEqual(oResult, null);
        aResults[0] = null;
        assert.notOk(bWaitingIsOver);
    }));
    oRequestorMock.expects("convertResourcePath").withExactArgs("Customers").returns("~Customers");
    aPromises.push(oRequestor.request("POST", "Customers", this.createGroupLock(sGroupId), {
        Foo: "baz"
    }, {
        "ID": 1
    }).then(function (oResult) {
        assert.deepEqual(oResult, aResults[1]);
        aResults[1] = null;
        assert.notOk(bWaitingIsOver);
    }));
    oRequestorMock.expects("convertResourcePath").withExactArgs("SalesOrders('42')").returns("~SalesOrders('42')");
    aPromises.push(oRequestor.request("DELETE", "SalesOrders('42')", this.createGroupLock(sGroupId)).then(function (oResult) {
        assert.deepEqual(oResult, aResults[2]);
        aResults[2] = null;
        assert.notOk(bWaitingIsOver);
    }));
    oRequestorMock.expects("convertResourcePath").withExactArgs("SalesOrders").returns("~SalesOrders");
    oRequestor.request("GET", "SalesOrders", this.createGroupLock("group2"));
    aExpectedRequests.iChangeSet = 0;
    aExpectedRequests[0].iSerialNumber = 0;
    oCleanUpChangeSetsExpection = oRequestorMock.expects("cleanUpChangeSets").withExactArgs(aExpectedRequests).returns("~bHasChanges~");
    oRequestorMock.expects("mergeGetRequests").withExactArgs(aExpectedRequests).callsFake(function (aRequests) {
        aMergedRequests = aRequests.slice();
        return aMergedRequests;
    });
    oBatchRequestSentExpectation = oRequestorMock.expects("batchRequestSent").withExactArgs(sGroupId, sinon.match(function (aRequests) {
        return aRequests === aMergedRequests;
    }), "~bHasChanges~").callThrough();
    oSendBatchExpectation = oRequestorMock.expects("sendBatch").withExactArgs(sinon.match(function (aRequests) {
        return aRequests === aMergedRequests;
    }), sGroupId).resolves(aBatchResults);
    oBatchResponseReceivedExpectation = oRequestorMock.expects("batchResponseReceived").withExactArgs(sGroupId, sinon.match(function (aRequests) {
        return aRequests === aMergedRequests;
    }), "~bHasChanges~").callThrough();
    aPromises.push(oRequestor.processBatch("group1").then(function (oResult) {
        assert.strictEqual(oResult, undefined);
        assert.deepEqual(aResults, [null, null, null], "all batch requests already resolved");
        assert.ok(oBatchResponseReceivedExpectation.calledAfter(oSendBatchExpectation));
    }));
    assert.ok(oBatchRequestSentExpectation.calledImmediatelyBefore(oSendBatchExpectation));
    assert.ok(oBatchResponseReceivedExpectation.notCalled);
    oCleanUpChangeSetsExpection.verify();
    oRequestorMock.expects("cleanUpChangeSets").withExactArgs([]).returns(false);
    aPromises.push(oRequestor.processBatch("group1"));
    assert.strictEqual(oRequestor.mBatchQueue.group1, undefined);
    TestUtils.deepContains(oRequestor.mBatchQueue.group2, [[], {
            method: "GET",
            url: "~SalesOrders"
        }]);
    aPromises.push(oRequestor.waitForRunningChangeRequests("group1").then(function () {
        bWaitingIsOver = true;
    }));
    return Promise.all(aPromises);
});
QUnit.test("processBatch(...): single GET", function () {
    var aExpectedRequests = [
        sinon.match({ method: "GET", url: "Products" })
    ], oRequestor = _Requestor.create("/", oModelInterface);
    oRequestor.request("GET", "Products", this.createGroupLock());
    aExpectedRequests.iChangeSet = 0;
    this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([
        createResponse({})
    ]);
    return oRequestor.processBatch("groupId");
});
QUnit.test("processBatch(...): merge PATCH requests", function (assert) {
    var oBusinessPartners42 = {}, oEntityProduct0 = {}, oEntityProduct0OtherCache = {}, oEntityProduct1 = {}, aExpectedRequests = [[
            sinon.match({
                body: { Name: "bar2", Note: "hello, world" },
                method: "PATCH",
                url: "Products('0')"
            }),
            sinon.match({
                body: { Name: "p1" },
                method: "PATCH",
                url: "Products('1')"
            }),
            sinon.match({
                body: { Note: "no merge!" },
                method: "PATCH",
                url: "Products('0')"
            }),
            sinon.match({
                body: { Name: "baz" },
                method: "POST",
                url: "Products"
            }),
            sinon.match({
                body: {},
                method: "POST",
                url: "Products('0')/GetCurrentStock"
            }),
            sinon.match({
                body: { Address: { City: "Walldorf", PostalCode: "69190" } },
                method: "PATCH",
                url: "BusinessPartners('42')"
            })
        ], sinon.match({
            method: "GET",
            url: "Products"
        })], aPromises = [], oRequestor = _Requestor.create("/", oModelInterface), fnSubmit0 = this.spy(), fnSubmit1 = this.spy(), fnSubmit2 = this.spy(), fnSubmit3 = this.spy(), fnSubmit4 = this.spy();
    aPromises.push(oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct0 }, { Name: null }));
    oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("otherGroupId", {}), { "If-Match": oEntityProduct0OtherCache }, { Price: "5.0" });
    aPromises.push(oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct0 }, { Name: "bar" }));
    aPromises.push(oRequestor.request("GET", "Products", oRequestor.lockGroup("groupId", {}), undefined, undefined, fnSubmit0));
    aPromises.push(oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct0 }, { Note: "hello, world" }));
    aPromises.push(oRequestor.request("PATCH", "Products('1')", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct1 }, { Name: "p1" }));
    aPromises.push(oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct0 }, { Name: "bar2" }));
    aPromises.push(oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct0OtherCache }, { Note: "no merge!" }));
    aPromises.push(oRequestor.request("POST", "Products", oRequestor.lockGroup("groupId", {}), null, { Name: "baz" }, fnSubmit1));
    aPromises.push(oRequestor.request("POST", "Products('0')/GetCurrentStock", oRequestor.lockGroup("groupId", {}), { "If-Match": oEntityProduct0 }, {}, fnSubmit2));
    aPromises.push(oRequestor.request("PATCH", "BusinessPartners('42')", oRequestor.lockGroup("groupId", {}), { "If-Match": oBusinessPartners42 }, { Address: null }));
    aPromises.push(oRequestor.request("PATCH", "BusinessPartners('42')", oRequestor.lockGroup("groupId", {}), { "If-Match": oBusinessPartners42 }, { Address: { City: "Walldorf" } }, fnSubmit3));
    aPromises.push(oRequestor.request("PATCH", "BusinessPartners('42')", oRequestor.lockGroup("groupId", {}), { "If-Match": oBusinessPartners42 }, { Address: { PostalCode: "69190" } }, fnSubmit4));
    aExpectedRequests.iChangeSet = 0;
    this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([
        [
            createResponse({ Name: "bar2", Note: "hello, world" }),
            createResponse({ Name: "p1" }),
            createResponse({ Note: "no merge!" }),
            createResponse({ Name: "baz" }),
            createResponse({ value: "123 EA" }),
            createResponse({ Address: { City: "Walldorf", PostalCode: "69190" } })
        ],
        createResponse({ Name: "Name", Note: "Note" })
    ]);
    aPromises.push(oRequestor.processBatch("groupId"));
    sinon.assert.calledOnce(fnSubmit0);
    sinon.assert.calledWithExactly(fnSubmit0);
    sinon.assert.calledOnce(fnSubmit1);
    sinon.assert.calledWithExactly(fnSubmit1);
    sinon.assert.calledOnce(fnSubmit2);
    sinon.assert.calledWithExactly(fnSubmit2);
    sinon.assert.calledOnce(fnSubmit3);
    sinon.assert.calledWithExactly(fnSubmit3);
    sinon.assert.calledOnce(fnSubmit4);
    sinon.assert.calledWithExactly(fnSubmit4);
    return Promise.all(aPromises).then(function (aResults) {
        assert.deepEqual(aResults, [
            { Name: "bar2", Note: "hello, world" },
            { Name: "bar2", Note: "hello, world" },
            { Name: "Name", Note: "Note" },
            { Name: "bar2", Note: "hello, world" },
            { Name: "p1" },
            { Name: "bar2", Note: "hello, world" },
            { Note: "no merge!" },
            { Name: "baz" },
            { value: "123 EA" },
            { Address: { City: "Walldorf", PostalCode: "69190" } },
            { Address: { City: "Walldorf", PostalCode: "69190" } },
            { Address: { City: "Walldorf", PostalCode: "69190" } },
            undefined
        ]);
    });
});
[{
        sODataVersion: "2.0",
        mExpectedRequestHeaders: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8"
        },
        mProductsResponse: { d: { results: [{ foo: "bar" }] } }
    }, {
        sODataVersion: "4.0",
        mExpectedRequestHeaders: {
            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
            "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
        },
        mProductsResponse: { value: [{ foo: "bar" }] }
    }].forEach(function (oFixture) {
    var sTitle = "processBatch(...): OData version specific headers; sODataVersion=" + oFixture.sODataVersion;
    QUnit.test(sTitle, function (assert) {
        var oConvertedPayload = {}, sMetaPath = "~", aExpectedRequests = [{
                method: "GET",
                url: "Products",
                headers: oFixture.mExpectedRequestHeaders,
                body: undefined,
                $cancel: undefined,
                $metaPath: sMetaPath,
                $promise: sinon.match.defined,
                $queryOptions: undefined,
                $reject: sinon.match.func,
                $resolve: sinon.match.func,
                $resourcePath: "Products",
                $submit: undefined
            }], oGetProductsPromise, oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, undefined, oFixture.sODataVersion);
        this.mock(oRequestor).expects("doConvertResponse").withExactArgs(oFixture.mProductsResponse, sMetaPath).returns(oConvertedPayload);
        oGetProductsPromise = oRequestor.request("GET", "Products", this.createGroupLock(), undefined, undefined, undefined, undefined, sMetaPath).then(function (oResponse) {
            assert.strictEqual(oResponse, oConvertedPayload);
        });
        aExpectedRequests.iChangeSet = 0;
        this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([createResponse(oFixture.mProductsResponse)]);
        return Promise.all([oGetProductsPromise, oRequestor.processBatch("groupId")]);
    });
});
QUnit.test("processBatch: fail to convert payload", function (assert) {
    var oError = {}, oGetProductsPromise, oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, undefined, "2.0"), oResponse = { d: { foo: "bar" } };
    this.mock(oRequestor).expects("doConvertResponse").withExactArgs(oResponse, undefined).throws(oError);
    oGetProductsPromise = oRequestor.request("GET", "Products", this.createGroupLock()).then(function () {
        assert.notOk("Unexpected success");
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
    this.mock(oRequestor).expects("sendBatch").resolves([createResponse(oResponse)]);
    return Promise.all([oGetProductsPromise, oRequestor.processBatch("groupId")]);
});
QUnit.test("processBatch: report unbound messages", function () {
    var mHeaders = { "SAP-Messages": {} }, oRequestor = _Requestor.create("/Service/", oModelInterface), oRequestPromise = oRequestor.request("GET", "Products(42)", this.createGroupLock());
    this.mock(oRequestor).expects("sendBatch").resolves([createResponse({ id: 42 }, mHeaders)]);
    this.mock(oRequestor).expects("reportHeaderMessages").withExactArgs("Products(42)", sinon.match.same(mHeaders["SAP-Messages"]));
    return Promise.all([oRequestPromise, oRequestor.processBatch("groupId")]);
});
QUnit.test("processBatch: support ETag header", function (assert) {
    var mHeaders = { "SAP-Messages": {}, ETag: "ETag" }, oRequestor = _Requestor.create("/Service/", oModelInterface), oRequestPromise = oRequestor.request("PATCH", "Products(42)", this.createGroupLock());
    this.mock(oRequestor).expects("sendBatch").resolves([createResponse(undefined, mHeaders)]);
    this.mock(oRequestor).expects("reportHeaderMessages").withExactArgs("Products(42)", sinon.match.same(mHeaders["SAP-Messages"]));
    return Promise.all([oRequestPromise, oRequestor.processBatch("groupId")]).then(function (aResults) {
        assert.deepEqual(aResults[0], { "@odata.etag": "ETag" });
    });
});
QUnit.test("processBatch: missing ETag header", function (assert) {
    var mHeaders = { "SAP-Messages": {} }, oRequestor = _Requestor.create("/Service/", oModelInterface), oRequestPromise = oRequestor.request("DELETE", "Products(42)", this.createGroupLock());
    this.mock(oRequestor).expects("sendBatch").resolves([createResponse(undefined, mHeaders)]);
    this.mock(oRequestor).expects("reportHeaderMessages").withExactArgs("Products(42)", sinon.match.same(mHeaders["SAP-Messages"]));
    return Promise.all([oRequestPromise, oRequestor.processBatch("groupId")]).then(function (aResults) {
        assert.deepEqual(aResults[0], {});
    });
});
QUnit.test("processBatch(...): $batch failure", function (assert) {
    var oBatchError = new Error("$batch request failed"), aPromises = [], oRequestor = _Requestor.create("/", oModelInterface), aRequests, bWaitingIsOver;
    function unexpected() {
        assert.ok(false);
    }
    function assertError(oError) {
        assert.ok(oError instanceof Error);
        assert.strictEqual(oError.message, "HTTP request was not processed because $batch failed");
        assert.strictEqual(oError.cause, oBatchError);
        assert.notOk(bWaitingIsOver);
    }
    function isRequests(aRequests0) {
        return aRequests0 === aRequests;
    }
    aPromises.push(oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" }).then(unexpected, assertError));
    aPromises.push(oRequestor.request("PATCH", "Products('1')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" }).then(unexpected, assertError));
    aPromises.push(oRequestor.request("GET", "Products", this.createGroupLock()).then(unexpected, assertError));
    aPromises.push(oRequestor.request("GET", "Customers", this.createGroupLock()).then(unexpected, assertError));
    this.mock(oRequestor).expects("cleanUpChangeSets").withExactArgs(sinon.match.array).callsFake(function (aRequests0) {
        aRequests = aRequests0;
        return "~bHasChanges~";
    });
    this.mock(oRequestor).expects("mergeGetRequests").withExactArgs(sinon.match(isRequests)).callsFake(function () {
        aRequests = aRequests.slice();
        return aRequests;
    });
    this.mock(oRequestor).expects("batchRequestSent").withExactArgs("groupId", sinon.match(isRequests), "~bHasChanges~").callThrough();
    this.mock(oRequestor).expects("sendBatch").rejects(oBatchError);
    this.mock(_Helper).expects("decomposeError").never();
    this.mock(oRequestor).expects("batchResponseReceived").withExactArgs("groupId", sinon.match(isRequests), "~bHasChanges~").callThrough();
    aPromises.push(oRequestor.processBatch("groupId").then(unexpected, function (oError) {
        assert.strictEqual(oError, oBatchError);
    }));
    aPromises.push(oRequestor.waitForRunningChangeRequests("groupId").then(function () {
        bWaitingIsOver = true;
    }));
    return Promise.all(aPromises);
});
QUnit.test("processBatch(...): failure followed by another request", function (assert) {
    var oError = { error: { message: "404 Not found" } }, aBatchResult = [{
            headers: {},
            responseText: "{}",
            status: 200
        }, {
            getResponseHeader: function () {
                return "application/json";
            },
            headers: { "Content-Type": "application/json" },
            responseText: JSON.stringify(oError),
            status: 404,
            statusText: "Not found"
        }], aPromises = [], oRequestor = _Requestor.create("/", oModelInterface);
    function unexpected() {
        assert.ok(false);
    }
    function assertError(oResultError) {
        assert.ok(oResultError instanceof Error);
        assert.deepEqual(oResultError.error, oError.error);
        assert.strictEqual(oResultError.message, oError.error.message);
        assert.strictEqual(oResultError.status, 404);
        assert.strictEqual(oResultError.statusText, "Not found");
    }
    aPromises.push(oRequestor.request("GET", "ok", this.createGroupLock()).then(function (oResult) {
        assert.deepEqual(oResult, {});
    }).catch(unexpected));
    aPromises.push(oRequestor.request("GET", "fail", this.createGroupLock()).then(unexpected, function (oResultError) {
        assertError(oResultError, oError.error.message);
    }));
    aPromises.push(oRequestor.request("GET", "ok", this.createGroupLock()).then(unexpected, function (oResultError) {
        assert.ok(oResultError instanceof Error);
        assert.strictEqual(oResultError.message, "HTTP request was not processed because the previous request failed");
        assert.strictEqual(oResultError.$reported, true);
        assertError(oResultError.cause);
    }));
    this.mock(oRequestor).expects("sendBatch").resolves(aBatchResult);
    aPromises.push(oRequestor.processBatch("groupId").then(function (oResult) {
        assert.deepEqual(oResult, undefined);
    }));
    return Promise.all(aPromises);
});
QUnit.test("processBatch(...): error in change set", function (assert) {
    var oCause = new Error(), aBatchResult = [{
            getResponseHeader: function () {
                return "application/json";
            },
            headers: { "Content-Type": "application/json" },
            responseText: JSON.stringify({ error: { message: "400 Bad Request" } }),
            status: 400,
            statusText: "Bad Request"
        }], oError0 = new Error("0"), oError1 = new Error("1"), oProduct = {}, aPromises = [], oRequestor = _Requestor.create("/", oModelInterface), aRequests;
    aPromises.push(oRequestor.request("PATCH", "ProductList('HT-1001')", this.createGroupLock(), { "If-Match": oProduct }, { Name: "foo" }).catch(function (oError) {
        assert.strictEqual(oError, oError0);
    }));
    aPromises.push(oRequestor.request("POST", "Unknown", this.createGroupLock(), undefined, {}).catch(function (oError) {
        assert.strictEqual(oError, oError1);
    }));
    aPromises.push(oRequestor.request("PATCH", "ProductList('HT-1001')", this.createGroupLock(), { "If-Match": oProduct }, { Name: "bar" }).catch(function (oError) {
        assert.strictEqual(oError, oError0);
    }));
    aPromises.push(oRequestor.request("GET", "ok", this.createGroupLock()).catch(function (oResultError) {
        assert.ok(oResultError instanceof Error);
        assert.strictEqual(oResultError.message, "HTTP request was not processed because the previous request failed");
        assert.strictEqual(oResultError.$reported, true);
        assert.strictEqual(oResultError.cause, oCause);
    }));
    this.mock(oRequestor).expects("mergeGetRequests").withExactArgs(sinon.match.array).callsFake(function (aRequests0) {
        aRequests = aRequests0;
        return aRequests;
    });
    this.mock(oRequestor).expects("batchRequestSent").withExactArgs("groupId", sinon.match(function (aRequests0) {
        return aRequests0 === aRequests;
    }), true);
    this.mock(oRequestor).expects("sendBatch").resolves(aBatchResult);
    this.mock(_Helper).expects("createError").withExactArgs(aBatchResult[0], "Communication error", undefined, undefined).returns(oCause);
    this.mock(_Helper).expects("decomposeError").withExactArgs(sinon.match.same(oCause), sinon.match(function (aChangeSetRequests) {
        return aChangeSetRequests === aRequests[0];
    }), oRequestor.sServiceUrl).returns([oError0, oError1]);
    this.mock(oRequestor).expects("batchResponseReceived").withExactArgs("groupId", sinon.match(function (aRequests0) {
        return aRequests0 === aRequests;
    }), true);
    aPromises.push(oRequestor.processBatch("groupId").then(function (oResult) {
        assert.deepEqual(oResult, undefined);
    }));
    return Promise.all(aPromises);
});
[true, false].forEach(function (bSubmitModeIsAuto) {
    [null, "[{code : 42}]"].forEach(function (sMessage) {
        QUnit.test("sendBatch(...), message=" + sMessage, function (assert) {
            var oBatchRequest = {
                body: "abcd",
                headers: {
                    "Content-Type": "multipart/mixed; boundary=batch_id-0123456789012-345",
                    "MIME-Version": "1.0"
                }
            }, aBatchRequests = [{}], sEpilogue = bSubmitModeIsAuto ? "Group ID: groupId" : "Group ID (API): groupId", aExpectedResponses = [], sGroupId = "groupId", oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, { "sap-client": "123" }), oResult = "abc", sResponseContentType = "multipart/mixed; boundary=foo";
            this.mock(oRequestor).expects("getGroupSubmitMode").withExactArgs(sGroupId).returns(bSubmitModeIsAuto ? "Auto" : "API");
            this.mock(_Batch).expects("serializeBatchRequest").withExactArgs(sinon.match.same(aBatchRequests), sEpilogue).returns(oBatchRequest);
            this.mock(oRequestor).expects("sendRequest").withExactArgs("POST", "$batch?sap-client=123", sinon.match({
                "Content-Type": oBatchRequest.headers["Content-Type"],
                "MIME-Version": oBatchRequest.headers["MIME-Version"]
            }), sinon.match.same(oBatchRequest.body)).resolves({ contentType: sResponseContentType, body: oResult, messages: sMessage });
            this.mock(_Batch).expects("deserializeBatchResponse").exactly(sMessage === null ? 1 : 0).withExactArgs(sResponseContentType, oResult).returns(aExpectedResponses);
            return oRequestor.sendBatch(aBatchRequests, sGroupId).then(function (oPayload) {
                assert.ok(sMessage === null, "unexpected success");
                assert.strictEqual(oPayload, aExpectedResponses);
            }, function (oError) {
                assert.ok(sMessage !== null, "unexpected error");
                assert.ok(oError instanceof Error);
                assert.strictEqual(oError.message, "Unexpected 'sap-messages' response header for batch request");
            });
        });
    });
});
QUnit.test("hasPendingChanges, cancelChanges, waitForRunningChangeRequests", function (assert) {
    var oBatchMock = this.mock(_Batch), oBatchRequest1, oBatchRequest2, oBatchRequest3, oJQueryMock = this.mock(jQuery), aPromises = [], sServiceUrl = "/Service/", oRequestor = _Requestor.create(sServiceUrl, oModelInterface), bWaitingIsOver;
    function expectBatch() {
        var jqXHR = new jQuery.Deferred();
        oJQueryMock.expects("ajax").withArgs(sServiceUrl + "$batch").returns(jqXHR);
        return jqXHR;
    }
    function resolveBatch(jqXHR) {
        Promise.resolve().then(function () {
            oBatchMock.expects("deserializeBatchResponse").withExactArgs(null, "body").returns([createResponse()]);
            jqXHR.resolve("body", "OK", {
                getResponseHeader: function (sHeader) {
                    if (sHeader === "OData-Version") {
                        return "4.0";
                    }
                    return null;
                }
            });
        });
    }
    assert.notOk(oRequestor.hasPendingChanges());
    assert.notOk(oRequestor.hasPendingChanges("groupId"));
    assert.notOk(oRequestor.hasPendingChanges("anotherGroupId"));
    oRequestor.checkForOpenRequests();
    oRequestor.request("GET", "Products", this.createGroupLock());
    oBatchRequest1 = expectBatch();
    aPromises.push(oRequestor.processBatch("groupId"));
    assert.notOk(oRequestor.hasPendingChanges(), "running GET request is not a pending change");
    oRequestor.checkForOpenRequests();
    oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" }).then(function () {
        assert.notOk(bWaitingIsOver);
    });
    oBatchRequest2 = expectBatch();
    aPromises.push(oRequestor.processBatch("groupId"));
    assert.ok(oRequestor.hasPendingChanges());
    assert.ok(oRequestor.hasPendingChanges("groupId"), "one for groupId");
    assert.notOk(oRequestor.hasPendingChanges("anotherGroupId"), "nothing in anotherGroupId");
    assert.throws(function () {
        oRequestor.checkForOpenRequests();
    }, new Error("Unexpected open requests"));
    assert.throws(function () {
        oRequestor.cancelChanges("groupId");
    }, new Error("Cannot cancel the changes for group 'groupId', " + "the batch request is running"));
    this.mock(oRequestor).expects("cancelGroupLocks").withExactArgs("anotherGroupId");
    oRequestor.cancelChanges("anotherGroupId");
    oRequestor.request("PATCH", "Products('1')", this.createGroupLock(), { "If-Match": {} }, { Name: "bar" }).then(function () {
        assert.notOk(bWaitingIsOver);
    });
    oBatchRequest3 = expectBatch();
    aPromises.push(oRequestor.processBatch("groupId"));
    aPromises.push(oRequestor.waitForRunningChangeRequests("groupId").then(function () {
        bWaitingIsOver = true;
        assert.notOk(oRequestor.hasPendingChanges());
        assert.notOk(oRequestor.hasPendingChanges("groupId"));
        oRequestor.checkForOpenRequests();
    }));
    resolveBatch(oBatchRequest1);
    resolveBatch(oBatchRequest2);
    resolveBatch(oBatchRequest3);
    return Promise.all(aPromises);
});
QUnit.test("batchRequestSent/-ResponseReceived, waitFor... #1", function (assert) {
    var oRequestor = _Requestor.create("/Service/");
    assert.deepEqual(oRequestor.mRunningChangeRequests, {});
    oRequestor.batchRequestSent("group", [], false);
    assert.deepEqual(oRequestor.mRunningChangeRequests, {});
    oRequestor.batchResponseReceived("group", [], false);
    assert.deepEqual(oRequestor.mRunningChangeRequests, {});
    assert.strictEqual(oRequestor.waitForRunningChangeRequests("group"), SyncPromise.resolve());
});
QUnit.test("batchRequestSent/-ResponseReceived, waitFor... #2", function (assert) {
    var oRequestor = _Requestor.create("/Service/"), aRequests = [], oSyncPromise, bWaitingIsOver;
    oRequestor.batchRequestSent("group", aRequests, true);
    assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
    assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 1);
    oSyncPromise = oRequestor.mRunningChangeRequests["group"][0];
    assert.strictEqual(oSyncPromise.isPending(), true);
    oSyncPromise.then(function () {
        bWaitingIsOver = true;
    });
    assert.strictEqual(oRequestor.waitForRunningChangeRequests("group"), oSyncPromise);
    oRequestor.batchResponseReceived("group", aRequests, true);
    assert.deepEqual(oRequestor.mRunningChangeRequests, {});
    assert.strictEqual(oSyncPromise.isPending(), false);
    assert.strictEqual(oSyncPromise.getResult(), undefined);
    assert.notOk(bWaitingIsOver, "no handler can run synchronously");
});
QUnit.test("batchRequestSent/-ResponseReceived, waitFor... #3", function (assert) {
    var oFinalPromise, oRequestor = _Requestor.create("/Service/"), aRequests0 = [], aRequests1 = [], oSyncPromise0, oSyncPromise1, bWaitingIsOver;
    oRequestor.batchRequestSent("group", aRequests0, true);
    assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
    assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 1);
    oSyncPromise0 = oRequestor.mRunningChangeRequests["group"][0];
    assert.strictEqual(oSyncPromise0.isPending(), true);
    oSyncPromise0.then(function () {
        assert.notOk(bWaitingIsOver);
    });
    assert.strictEqual(oRequestor.waitForRunningChangeRequests("group"), oSyncPromise0);
    oRequestor.batchRequestSent("group", aRequests1, true);
    assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
    assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 2);
    assert.strictEqual(oRequestor.mRunningChangeRequests["group"][0], oSyncPromise0);
    oSyncPromise1 = oRequestor.mRunningChangeRequests["group"][1];
    assert.strictEqual(oSyncPromise1.isPending(), true);
    oSyncPromise1.then(function () {
        assert.notOk(bWaitingIsOver);
    });
    oFinalPromise = oRequestor.waitForRunningChangeRequests("group").then(function () {
        bWaitingIsOver = true;
    });
    oRequestor.batchResponseReceived("group", aRequests0, true);
    assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
    assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 1);
    assert.strictEqual(oRequestor.mRunningChangeRequests["group"][0], oSyncPromise1);
    assert.strictEqual(oSyncPromise0.isPending(), false);
    assert.strictEqual(oSyncPromise0.getResult(), undefined);
    assert.strictEqual(oSyncPromise1.isPending(), true);
    oRequestor.batchResponseReceived("group", aRequests1, true);
    assert.deepEqual(oRequestor.mRunningChangeRequests, {});
    assert.strictEqual(oSyncPromise1.isPending(), false);
    assert.strictEqual(oSyncPromise1.getResult(), undefined);
    return oFinalPromise;
});
[
    { bLocked: false, sGroupId: "simpleRead", bModifying: false, bPendingChanges: false },
    { bLocked: false, sGroupId: "modifyingUnlocked", bModifying: true, bPendingChanges: false },
    { bLocked: true, sGroupId: "lockedRead", bModifying: false, bPendingChanges: false },
    { bLocked: true, sGroupId: "modifyingLocked", bModifying: true, bPendingChanges: true }
].forEach(function (oFixture, i) {
    QUnit.test("hasPendingChanges: locked modifying group:" + oFixture.sGroupId, function (assert) {
        var j, oGroupLockForFixture = {
            getGroupId: function () { },
            isLocked: function () { },
            isModifying: function () { }
        }, oRequestor = _Requestor.create("/Service/"), that = this;
        function addDummyGoupLock(bIsModifying) {
            var oGroupLock = {
                getGroupId: function () { },
                isLocked: function () { },
                isModifying: function () { }
            };
            that.mock(oGroupLock).expects("getGroupId").withExactArgs().twice().returns("foo");
            that.mock(oGroupLock).expects("isModifying").withExactArgs().returns(bIsModifying);
            that.mock(oGroupLock).expects("isLocked").withExactArgs().exactly(bIsModifying ? 1 : 0).returns(false);
            oRequestor.aLockedGroupLocks.push(oGroupLock);
        }
        oRequestor.aLockedGroupLocks = [];
        for (j = 0; j < i + 2; j += 1) {
            addDummyGoupLock(j % 2 === 0);
        }
        this.mock(oGroupLockForFixture).expects("getGroupId").withExactArgs().twice().returns(oFixture.sGroupId);
        this.mock(oGroupLockForFixture).expects("isModifying").withExactArgs().twice().returns(oFixture.bModifying);
        this.mock(oGroupLockForFixture).expects("isLocked").withExactArgs().exactly(oFixture.bModifying ? 2 : 0).returns(oFixture.bLocked);
        oRequestor.aLockedGroupLocks.push(oGroupLockForFixture);
        assert.strictEqual(oRequestor.hasPendingChanges(), oFixture.bPendingChanges);
        assert.strictEqual(oRequestor.hasPendingChanges(oFixture.sGroupId), oFixture.bPendingChanges);
        assert.strictEqual(oRequestor.hasPendingChanges("otherGroup"), false);
    });
});
QUnit.test("cancelChanges: various requests", function (assert) {
    var fnCancel1 = this.spy(), fnCancel2 = this.spy(), fnCancel3 = this.spy(), fnCancelPost = this.spy(), iCount = 1, aExpectedRequests = [
        sinon.match({
            method: "POST",
            url: "ActionImport('42')"
        }),
        sinon.match({
            method: "GET",
            url: "Employees"
        })
    ], oPostData = {}, oProduct0 = {}, oPromise, oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, { "sap-client": "123" });
    function unexpected() {
        assert.ok(false);
    }
    function rejected(iOrder, oError) {
        assert.strictEqual(oError.canceled, true);
        assert.strictEqual(iCount, iOrder);
        iCount += 1;
    }
    assert.strictEqual(oRequestor.hasPendingChanges(), false);
    oPromise = Promise.all([
        oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oProduct0 }, { Name: "foo" }, undefined, fnCancel1).then(unexpected, rejected.bind(null, 3)),
        oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oProduct0 }, { Name: "bar" }, undefined, fnCancel2).then(unexpected, rejected.bind(null, 2)),
        oRequestor.request("GET", "Employees", this.createGroupLock()),
        oRequestor.request("POST", "ActionImport('42')", this.createGroupLock(), undefined, { foo: "bar" }),
        oRequestor.addChangeSet("groupId"),
        oRequestor.request("POST", "LeaveRequests('42')/name.space.Submit", this.createGroupLock(), { "If-Match": {} }, oPostData, undefined, fnCancelPost).then(unexpected, function (oError) {
            assert.strictEqual(oError.canceled, true);
            assert.strictEqual(oError.message, "Request canceled: " + "POST LeaveRequests('42')/name.space.Submit; group: groupId");
        }),
        oRequestor.request("PATCH", "Products('1')", this.createGroupLock(), { "If-Match": {} }, { Name: "baz" }, undefined, fnCancel3).then(unexpected, rejected.bind(null, 1))
    ]);
    assert.strictEqual(oRequestor.hasPendingChanges(), true);
    this.mock(oRequestor).expects("cancelChangesByFilter").withExactArgs(sinon.match.func, "groupId").callThrough();
    oRequestor.cancelChanges("groupId");
    sinon.assert.calledOnce(fnCancel1);
    sinon.assert.calledWithExactly(fnCancel1);
    sinon.assert.calledOnce(fnCancel2);
    sinon.assert.calledOnce(fnCancel3);
    sinon.assert.calledOnce(fnCancelPost);
    assert.strictEqual(oRequestor.hasPendingChanges(), false);
    aExpectedRequests.iChangeSet = 1;
    this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([createResponse(), createResponse()]);
    oRequestor.processBatch("groupId");
    return oPromise;
});
QUnit.test("cancelChanges: only PATCH", function (assert) {
    var fnCancel = function () { }, oProduct0 = {}, oPromise, oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, { "sap-client": "123" });
    function unexpected() {
        assert.ok(false);
    }
    function rejected(oError) {
        assert.strictEqual(oError.canceled, true);
    }
    oPromise = Promise.all([
        oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oProduct0 }, { Name: "foo" }, undefined, fnCancel).then(unexpected, rejected),
        oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oProduct0 }, { Name: "bar" }, undefined, fnCancel).then(unexpected, rejected),
        oRequestor.request("PATCH", "Products('1')", this.createGroupLock(), { "If-Match": {} }, { Name: "baz" }, undefined, fnCancel).then(unexpected, rejected)
    ]);
    this.mock(oRequestor).expects("request").never();
    oRequestor.cancelChanges("groupId");
    oRequestor.processBatch("groupId");
    return oPromise;
});
QUnit.test("cancelChanges: unused group", function () {
    _Requestor.create("/Service/", oModelInterface).cancelChanges("unusedGroupId");
});
QUnit.test("cancelGroupLocks", function () {
    var oRequestor = _Requestor.create("/Service/", oModelInterface), oGroupLock0 = oRequestor.lockGroup("group0", {}, true), oGroupLock1 = oRequestor.lockGroup("group1", {}, true, true), oGroupLock2 = oRequestor.lockGroup("group2", {}, true, true);
    oGroupLock2.unlock();
    this.mock(oGroupLock0).expects("cancel").never();
    this.mock(oGroupLock1).expects("cancel").withExactArgs();
    this.mock(oGroupLock2).expects("cancel").never();
    oRequestor.cancelGroupLocks();
});
QUnit.test("cancelGroupLocks with group ID", function () {
    var oRequestor = _Requestor.create("/Service/", oModelInterface), oGroupLock0 = oRequestor.lockGroup("group0", {}, true, true), oGroupLock1 = oRequestor.lockGroup("group1", {}, true, true), oGroupLock2 = oRequestor.lockGroup("group1", {}, true), oGroupLock3 = oRequestor.lockGroup("group1", {}, true, true);
    oGroupLock3.unlock();
    this.mock(oGroupLock0).expects("cancel").never();
    this.mock(oGroupLock1).expects("cancel").withExactArgs();
    this.mock(oGroupLock2).expects("cancel").never();
    this.mock(oGroupLock3).expects("cancel").never();
    oRequestor.cancelGroupLocks("group1");
});
QUnit.test("hasChanges: correct for multiple change sets in one group", function (assert) {
    var oEntity = {}, oRequestor = _Requestor.create("/Service/", oModelInterface);
    oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" });
    oRequestor.addChangeSet("groupId");
    oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oEntity }, { Name: "bar" });
    assert.strictEqual(oRequestor.hasChanges("groupId", oEntity), true);
});
QUnit.test("hasChanges: correct for multiple change sets in one group w/o a match", function (assert) {
    var oEntity = {}, oRequestor = _Requestor.create("/Service/", oModelInterface);
    oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" });
    oRequestor.addChangeSet("groupId");
    oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "bar" });
    oRequestor.request("GET", "Employees", this.createGroupLock());
    assert.strictEqual(oRequestor.hasChanges("groupId", oEntity), false);
});
QUnit.test("hasPendingChanges: correct for multiple change sets in one group", function (assert) {
    var fnCancel = this.spy(), oRequestor = _Requestor.create("/Service/", oModelInterface);
    oRequestor.request("DELETE", "Products('42')", this.createGroupLock());
    oRequestor.addChangeSet("groupId");
    oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" }, undefined, fnCancel);
    oRequestor.addChangeSet("groupId");
    oRequestor.request("DELETE", "Products('4711')", this.createGroupLock());
    assert.strictEqual(oRequestor.hasPendingChanges(), true);
});
QUnit.test("removePatch", function (assert) {
    var fnCancel = this.spy(), oPromise, oRequestor = _Requestor.create("/Service/", oModelInterface), oTestPromise;
    oPromise = oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "foo" }, undefined, fnCancel);
    oTestPromise = oPromise.then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.canceled, true);
    });
    oRequestor.removePatch(oPromise);
    sinon.assert.calledOnce(fnCancel);
    this.mock(oRequestor).expects("request").never();
    oRequestor.processBatch("groupId");
    return oTestPromise;
});
QUnit.test("removePatch: various requests", function (assert) {
    var fnCancel = this.spy(), aExpectedRequests = [
        sinon.match({
            method: "PATCH",
            url: "Products('0')",
            body: { Name: "bar" }
        }),
        sinon.match({
            method: "GET",
            url: "Employees"
        })
    ], oProduct0 = {}, oPromise, aPromises, oRequestor = _Requestor.create("/Service/", oModelInterface);
    function unexpected() {
        assert.ok(false);
    }
    function rejected(oError) {
        assert.strictEqual(oError.canceled, true);
        assert.strictEqual(oError.message, "Request canceled: PATCH Products('0'); group: groupId");
    }
    oPromise = oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oProduct0 }, { Name: "foo" }, undefined, fnCancel);
    aPromises = [
        oPromise.then(unexpected, rejected),
        oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": oProduct0 }, { Name: "bar" }),
        oRequestor.request("GET", "Employees", this.createGroupLock())
    ];
    aExpectedRequests.iChangeSet = 0;
    this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([createResponse({}), createResponse({})]);
    oRequestor.removePatch(oPromise);
    oRequestor.processBatch("groupId");
    sinon.assert.calledOnce(fnCancel);
    return Promise.all(aPromises);
});
QUnit.test("removePatch after processBatch", function (assert) {
    var oPromise, oRequestor = _Requestor.create("/Service/", oModelInterface);
    oPromise = oRequestor.request("PATCH", "Products('0')", this.createGroupLock(), { "If-Match": {} }, { Name: "bar" });
    this.mock(oRequestor).expects("sendBatch").resolves([createResponse({})]);
    oRequestor.processBatch("groupId");
    assert.throws(function () {
        oRequestor.removePatch(oPromise);
    }, new Error("Cannot reset the changes, the batch request is running"));
});
QUnit.test("removePost", function (assert) {
    var oBody = {}, fnCancel1 = this.spy(), fnCancel2 = this.spy(), oEntity = {}, aExpectedRequests = [
        sinon.match({
            method: "POST",
            url: "Products",
            body: { Name: "bar" }
        })
    ], oRequestor = _Requestor.create("/Service/", oModelInterface), oTestPromise;
    this.spy(oRequestor, "cancelChangesByFilter");
    oTestPromise = Promise.all([
        oRequestor.request("POST", "Products", this.createGroupLock(), {}, oBody, undefined, fnCancel1).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(oError.canceled, true);
        }),
        oRequestor.request("POST", "Products", this.createGroupLock(), {}, { Name: "bar" }, undefined, fnCancel2)
    ]);
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oEntity), "postBody").returns(oBody);
    oRequestor.removePost("groupId", oEntity);
    assert.ok(oRequestor.cancelChangesByFilter.calledWithExactly(sinon.match.func, "groupId"));
    aExpectedRequests.iChangeSet = 0;
    this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([createResponse()]);
    oRequestor.processBatch("groupId");
    sinon.assert.calledOnce(fnCancel1);
    sinon.assert.notCalled(fnCancel2);
    return oTestPromise;
});
QUnit.test("removePost with only one POST", function (assert) {
    var oBody = {}, fnCancel = this.spy(), oEntity = {}, oRequestor = _Requestor.create("/Service/", oModelInterface), oTestPromise;
    oTestPromise = oRequestor.request("POST", "Products", this.createGroupLock(), {}, oBody, undefined, fnCancel).then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.canceled, true);
    });
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oEntity), "postBody").returns(oBody);
    oRequestor.removePost("groupId", oEntity);
    sinon.assert.calledOnce(fnCancel);
    this.mock(oRequestor).expects("request").never();
    oRequestor.processBatch("groupId");
    return oTestPromise;
});
QUnit.test("removePost after processBatch", function (assert) {
    var oPayload = {}, oRequestor = _Requestor.create("/Service/", oModelInterface);
    oRequestor.request("POST", "Products", this.createGroupLock(), {}, oPayload);
    this.mock(oRequestor).expects("sendBatch").resolves([createResponse({})]);
    oRequestor.processBatch("groupId");
    assert.throws(function () {
        oRequestor.removePost("groupId", oPayload);
    }, new Error("Cannot reset the changes, the batch request is running"));
});
QUnit.test("isChangeSetOptional", function (assert) {
    var oRequestor = _Requestor.create("/");
    assert.strictEqual(oRequestor.isChangeSetOptional(), true);
});
QUnit.test("processBatch: unwrap single change", function () {
    var aExpectedRequests = [
        sinon.match({
            method: "POST",
            url: "Products",
            body: { Name: "bar" }
        })
    ], oRequestor = _Requestor.create("/Service/", oModelInterface);
    oRequestor.request("POST", "Products", this.createGroupLock(), {}, { Name: "bar" });
    this.mock(oRequestor).expects("isChangeSetOptional").withExactArgs().returns(true);
    aExpectedRequests.iChangeSet = 0;
    this.mock(oRequestor).expects("sendBatch").withExactArgs(aExpectedRequests, "groupId").resolves([createResponse()]);
    return oRequestor.processBatch("groupId");
});
QUnit.test("relocate", function (assert) {
    var oBody1 = {}, oBody2 = {}, mHeaders = {}, oRequestor = _Requestor.create("/Service/", oModelInterface), oRequestorMock = this.mock(oRequestor);
    oRequestor.request("POST", "Employees", this.createGroupLock("$parked.$auto"), mHeaders, oBody1);
    oRequestor.request("POST", "Employees", this.createGroupLock("$parked.$auto"), mHeaders, oBody2);
    assert.throws(function () {
        oRequestor.relocate("$foo", oBody1, "$auto");
    }, new Error("Request not found in group '$foo'"));
    assert.throws(function () {
        oRequestor.relocate("$parked.$auto", { foo: "bar" }, "$auto");
    }, new Error("Request not found in group '$parked.$auto'"));
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "POST",
        url: "Employees",
        body: sinon.match.same(oBody2)
    }), "$auto");
    oRequestor.relocate("$parked.$auto", oBody2, "$auto");
    assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"][0].length, 1, "one left");
    assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"][0][0].body, oBody1);
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "POST",
        url: "Employees",
        body: sinon.match.same(oBody1)
    }), "$auto");
    oRequestor.relocate("$parked.$auto", oBody1, "$auto");
    assert.deepEqual(oRequestor.mBatchQueue["$parked.$auto"], [[]]);
});
QUnit.test("relocateAll: with entity", function (assert) {
    var oBody1 = { key: "value 1" }, oBody2 = { key: "value 2" }, oEntity = {}, oRequestor = _Requestor.create("/Service/", oModelInterface), oRequestorMock = this.mock(oRequestor), oYetAnotherEntity = {};
    oRequestor.request("PATCH", "Employees('1')", this.createGroupLock("$parked.$auto"), { "If-Match": oEntity }, oBody1);
    oRequestor.request("DELETE", "Employees('2')", this.createGroupLock("$parked.$auto"), { "If-Match": oYetAnotherEntity });
    oRequestor.request("PATCH", "Employees('1')", this.createGroupLock("$parked.$auto"), { "If-Match": oEntity }, oBody2);
    oRequestorMock.expects("addChangeToGroup").never();
    oRequestor.relocateAll("$parked.unused", "$auto", oEntity);
    oRequestor.relocateAll("$parked.$auto", "unexpected", {});
    assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oEntity), true);
    assert.strictEqual(oRequestor.hasChanges("$parked.unused", oEntity), false);
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "PATCH",
        url: "Employees('1')",
        body: sinon.match.same(oBody1)
    }), "$auto");
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "PATCH",
        url: "Employees('1')",
        body: sinon.match.same(oBody2)
    }), "$auto");
    oRequestor.relocateAll("$parked.$auto", "$auto", oEntity);
    assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oEntity), false);
    oRequestor.relocateAll("$parked.$auto", "unexpected", oEntity);
    assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oYetAnotherEntity), true);
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "DELETE",
        url: "Employees('2')"
    }), "$auto");
    oRequestor.relocateAll("$parked.$auto", "$auto", oYetAnotherEntity);
    assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oYetAnotherEntity), false);
});
QUnit.test("relocateAll: without entity", function (assert) {
    var oBody1 = { key: "value 1" }, oBody2 = { key: "value 2" }, oEntity = {}, oRequestor = _Requestor.create("/Service/", oModelInterface), oRequestorMock = this.mock(oRequestor), oYetAnotherEntity = {};
    oRequestor.request("PATCH", "Employees('1')", this.createGroupLock("$parked.$auto"), { "If-Match": oEntity }, oBody1);
    oRequestor.request("DELETE", "Employees('2')", this.createGroupLock("$parked.$auto"), { "If-Match": oYetAnotherEntity });
    oRequestor.request("PATCH", "Employees('1')", this.createGroupLock("$parked.$auto"), { "If-Match": oEntity }, oBody2);
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "PATCH",
        url: "Employees('1')",
        body: sinon.match.same(oBody1)
    }), "$auto");
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "PATCH",
        url: "Employees('1')",
        body: sinon.match.same(oBody2)
    }), "$auto");
    oRequestorMock.expects("addChangeToGroup").withExactArgs(sinon.match({
        method: "DELETE",
        url: "Employees('2')"
    }), "$auto");
    oRequestor.relocateAll("$parked.$auto", "$auto");
    assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oEntity), false);
    assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oYetAnotherEntity), false);
});
QUnit.test("request: $cached as groupId fails synchronously", function (assert) {
    var oGroupLock = { getGroupId: function () { } }, oRequestor = _Requestor.create("/");
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("$cached");
    assert.throws(function () {
        oRequestor.request("GET", "/FOO", oGroupLock);
    }, function (oError) {
        assert.strictEqual(oError.message, "Unexpected request: GET /FOO");
        assert.strictEqual(oError.$cached, true);
        return oError instanceof Error;
    });
});
[false, true].forEach(function (bHasCancelFunction) {
    QUnit.test("request: GroupLock is canceled, " + bHasCancelFunction, function (assert) {
        var fnCancel = sinon.spy(), oGroupLock = {
            getGroupId: function () { },
            isCanceled: function () { }
        }, oRequestor = _Requestor.create("/");
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("$auto");
        this.mock(oGroupLock).expects("isCanceled").withExactArgs().returns(true);
        return oRequestor.request("GET", "/FOO", oGroupLock, undefined, undefined, undefined, bHasCancelFunction ? fnCancel : undefined).then(function () {
            assert.ok(false);
        }, function (oError) {
            assert.strictEqual(fnCancel.callCount, bHasCancelFunction ? 1 : 0);
            assert.strictEqual(oError.message, "Request already canceled");
            assert.strictEqual(oError.canceled, true);
            assert.ok(oError instanceof Error);
        });
    });
});
QUnit.test("doConvertResponse (V4)", function (assert) {
    var oPayload = {}, oRequestor = _Requestor.create("/");
    assert.strictEqual(oRequestor.doConvertResponse(oPayload), oPayload);
});
QUnit.test("convertResourcePath (V4)", function (assert) {
    var sResourcePath = {}, oRequestor = _Requestor.create("/");
    assert.strictEqual(oRequestor.convertResourcePath(sResourcePath), sResourcePath);
});
QUnit.test("convertQueryOptions", function (assert) {
    var oExpand = {}, oRequestor = _Requestor.create("/");
    this.mock(oRequestor).expects("convertExpand").withExactArgs(sinon.match.same(oExpand), undefined).returns("expand");
    assert.deepEqual(oRequestor.convertQueryOptions("/Foo", {
        foo: "bar",
        $apply: "filter(Price gt 100)",
        $count: "true",
        $expand: oExpand,
        $filter: "SO_2_BP/CompanyName eq 'SAP'",
        $foo: "bar",
        $levels: "5",
        $orderby: "GrossAmount asc",
        $search: "EUR",
        $select: ["select1", "select2"]
    }), {
        foo: "bar",
        $apply: "filter(Price gt 100)",
        $count: "true",
        $expand: "expand",
        $filter: "SO_2_BP/CompanyName eq 'SAP'",
        $foo: "bar",
        $levels: "5",
        $orderby: "GrossAmount asc",
        $search: "EUR",
        $select: "select1,select2"
    });
    assert.deepEqual(oRequestor.convertQueryOptions("/Foo", {
        foo: "bar",
        "sap-client": "111",
        $apply: "filter(Price gt 100)",
        $count: true,
        $expand: oExpand,
        $filter: "SO_2_BP/CompanyName eq 'SAP'",
        $orderby: "GrossAmount asc",
        $search: "EUR",
        $select: ["select1", "select2"]
    }, true), {
        foo: "bar",
        "sap-client": "111"
    });
    assert.deepEqual(oRequestor.convertQueryOptions("/Foo", {
        $select: "singleSelect"
    }), {
        $select: "singleSelect"
    });
    assert.strictEqual(oRequestor.convertQueryOptions("/Foo", undefined), undefined);
    assert.deepEqual(oRequestor.convertQueryOptions("/Foo", { $expand: "~" }), { $expand: "~" });
});
QUnit.test("convertExpandOptions", function (assert) {
    var oExpand = {}, oRequestor = _Requestor.create("/~/");
    this.mock(oRequestor).expects("convertExpand").withExactArgs(sinon.match.same(oExpand), undefined).returns("expand");
    assert.strictEqual(oRequestor.convertExpandOptions("foo", {
        $expand: oExpand,
        $select: ["select1", "select2"]
    }), "foo($expand=expand;$select=select1,select2)");
    assert.strictEqual(oRequestor.convertExpandOptions("foo", {}), "foo");
});
QUnit.test("convertExpand", function (assert) {
    var oOptions = {}, oRequestor = _Requestor.create("/~/");
    ["Address", null].forEach(function (vValue) {
        assert.throws(function () {
            oRequestor.convertExpand(vValue);
        }, new Error("$expand must be a valid object"));
    });
    this.mock(oRequestor).expects("convertExpandOptions").withExactArgs("baz", sinon.match.same(oOptions), false).returns("baz(options)");
    assert.strictEqual(oRequestor.convertExpand({
        foo: true,
        bar: null,
        baz: oOptions
    }, false), "foo,bar,baz(options)");
});
[true, false].forEach(function (bSortExpandSelect, i) {
    QUnit.test("buildQueryString, " + i, function (assert) {
        var oConvertedQueryParams = {}, sMetaPath = "/Foo", oQueryParams = {}, oRequestor = _Requestor.create("/~/"), oRequestorMock = this.mock(oRequestor);
        oRequestorMock.expects("convertQueryOptions").withExactArgs(sMetaPath, undefined, undefined, undefined).returns(undefined);
        assert.strictEqual(oRequestor.buildQueryString(sMetaPath), "");
        oRequestorMock.expects("convertQueryOptions").withExactArgs(sMetaPath, sinon.match.same(oQueryParams), true, bSortExpandSelect).returns(oConvertedQueryParams);
        this.mock(_Helper).expects("buildQuery").withExactArgs(sinon.match.same(oConvertedQueryParams)).returns("?query");
        assert.strictEqual(oRequestor.buildQueryString(sMetaPath, oQueryParams, true, bSortExpandSelect), "?query");
    });
});
QUnit.test("buildQueryString examples", function (assert) {
    [{
            o: { foo: ["bar", "\u20AC"], $select: "ID\u00D6" },
            s: "foo=bar&foo=%E2%82%AC&$select=ID%C3%96"
        }, {
            o: { $select: ["ID"] },
            s: "$select=ID"
        }, {
            o: { $select: ["Name", "ID"] },
            s: "$select=ID,Name"
        }, {
            o: { $expand: { SO_2_SOITEM: true, SO_2_BP: true } },
            s: "$expand=SO_2_BP,SO_2_SOITEM"
        }, {
            o: { $expand: { SO_2_BP: true, SO_2_SOITEM: { $select: "CurrencyCode" } } },
            s: "$expand=SO_2_BP,SO_2_SOITEM($select=CurrencyCode)"
        }, {
            o: {
                $expand: {
                    SO_2_BP: true,
                    SO_2_SOITEM: {
                        $select: ["Note", "ItemPosition"]
                    }
                }
            },
            s: "$expand=SO_2_BP,SO_2_SOITEM($select=ItemPosition,Note)"
        }, {
            o: {
                $expand: {
                    SO_2_SOITEM: {
                        $expand: {
                            SOITEM_2_SO: true,
                            SOITEM_2_PRODUCT: {
                                $expand: {
                                    PRODUCT_2_BP: true
                                },
                                $filter: "CurrencyCode eq 'EUR'",
                                $select: "CurrencyCode"
                            }
                        }
                    },
                    SO_2_BP: true
                },
                "sap-client": "003"
            },
            s: "$expand=SO_2_BP,SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;" + "$filter=CurrencyCode%20eq%20'EUR';$select=CurrencyCode),SOITEM_2_SO)" + "&sap-client=003"
        }].forEach(function (oFixture) {
        var oRequestor = _Requestor.create("/~/");
        assert.strictEqual(oRequestor.buildQueryString("/Foo", oFixture.o, undefined, true), "?" + oFixture.s, oFixture.s);
    });
});
QUnit.test("formatPropertyAsLiteral", function (assert) {
    var sKeyPredicate = "(~)", oProperty = {
        $Type: "Edm.Foo"
    }, oRequestor = _Requestor.create("/"), sResult, vValue = {};
    this.mock(_Helper).expects("formatLiteral").withExactArgs(sinon.match.same(vValue), oProperty.$Type).returns(sKeyPredicate);
    sResult = oRequestor.formatPropertyAsLiteral(vValue, oProperty);
    assert.strictEqual(sResult, sKeyPredicate);
});
QUnit.test("ready()", function (assert) {
    var oRequestor = _Requestor.create("/");
    assert.strictEqual(oRequestor.ready().getResult(), undefined);
});
QUnit.test("fetchTypeForPath", function (assert) {
    var oPromise = {}, oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oRequestor.oModelInterface).expects("fetchMetadata").withExactArgs("/EMPLOYEES/EMPLOYEE_2_TEAM/").returns(oPromise);
    assert.strictEqual(oRequestor.fetchTypeForPath("/EMPLOYEES/EMPLOYEE_2_TEAM"), oPromise);
});
QUnit.test("fetchTypeForPath, bAsName=true", function (assert) {
    var oPromise = {}, oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oRequestor.oModelInterface).expects("fetchMetadata").withExactArgs("/EMPLOYEES/EMPLOYEE_2_TEAM/$Type").returns(oPromise);
    assert.strictEqual(oRequestor.fetchTypeForPath("/EMPLOYEES/EMPLOYEE_2_TEAM", true), oPromise);
});
[{
        iCallCount: 1,
        mHeaders: { "OData-Version": "4.0" }
    }, {
        iCallCount: 2,
        mHeaders: {}
    }].forEach(function (oFixture, i) {
    QUnit.test("doCheckVersionHeader, success cases - " + i, function (assert) {
        var oRequestor = _Requestor.create("/"), fnGetHeader = this.spy(function (sHeaderKey) {
            return oFixture.mHeaders[sHeaderKey];
        });
        oRequestor.doCheckVersionHeader(fnGetHeader, "Foo('42')/Bar", true);
        assert.strictEqual(fnGetHeader.calledWithExactly("OData-Version"), true);
        if (oFixture.iCallCount === 2) {
            assert.strictEqual(fnGetHeader.calledWithExactly("DataServiceVersion"), true);
        }
        assert.strictEqual(fnGetHeader.callCount, oFixture.iCallCount);
    });
});
[{
        iCallCount: 1,
        sError: "value 'foo' in response for /Foo('42')/Bar",
        mHeaders: { "OData-Version": "foo" }
    }, {
        iCallCount: 2,
        sError: "value 'undefined' in response for /Foo('42')/Bar",
        mHeaders: {}
    }, {
        iCallCount: 2,
        sError: "'DataServiceVersion' header with value 'baz' in response for /Foo('42')/Bar",
        mHeaders: { "DataServiceVersion": "baz" }
    }].forEach(function (oFixture, i) {
    QUnit.test("doCheckVersionHeader, error cases - " + i, function (assert) {
        var oRequestor = _Requestor.create("/"), fnGetHeader = this.spy(function (sHeaderKey) {
            return oFixture.mHeaders[sHeaderKey];
        });
        assert.throws(function () {
            oRequestor.doCheckVersionHeader(fnGetHeader, "Foo('42')/Bar");
        }, new Error("Expected 'OData-Version' header with value '4.0' but received " + oFixture.sError));
        assert.strictEqual(fnGetHeader.calledWithExactly("OData-Version"), true);
        if (oFixture.iCallCount === 2) {
            assert.strictEqual(fnGetHeader.calledWithExactly("DataServiceVersion"), true);
        }
        assert.strictEqual(fnGetHeader.callCount, oFixture.iCallCount);
    });
});
if (TestUtils.isRealOData()) {
    QUnit.test("request(...)/processBatch (realOData) success", function (assert) {
        var oRequestor = _Requestor.create(sServiceUrl, oModelInterface), sResourcePath = "TEAMS('TEAM_01')", that = this;
        function assertResult(oPayload) {
            delete oPayload["@odata.metadataEtag"];
            assert.deepEqual(oPayload, {
                "@odata.context": "$metadata#TEAMS/$entity",
                "Team_Id": "TEAM_01",
                Name: "Business Suite",
                MEMBER_COUNT: 2,
                MANAGER_ID: "3",
                BudgetCurrency: "USD",
                Budget: "555.55"
            });
        }
        return oRequestor.request("GET", sResourcePath).then(assertResult).then(function () {
            return Promise.all([
                oRequestor.request("GET", sResourcePath, that.createGroupLock()).then(assertResult),
                oRequestor.request("GET", sResourcePath, that.createGroupLock()).then(assertResult),
                oRequestor.processBatch("groupId")
            ]);
        });
    });
    QUnit.test("request(...)/processBatch (realOData) fail", function (assert) {
        var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
        oRequestor.request("GET", "TEAMS('TEAM_01')", this.createGroupLock()).then(function (oResult) {
            delete oResult["@odata.metadataEtag"];
            assert.deepEqual(oResult, {
                "@odata.context": "$metadata#TEAMS/$entity",
                "Team_Id": "TEAM_01",
                Name: "Business Suite",
                MEMBER_COUNT: 2,
                MANAGER_ID: "3",
                BudgetCurrency: "USD",
                Budget: "555.55"
            });
        }, function (oError) {
            assert.ok(false, oError);
        });
        oRequestor.request("GET", "fail", this.createGroupLock()).then(function (oResult) {
            assert.ok(false, oResult);
        }, function (oError) {
            assert.ok(oError instanceof Error);
            assert.strictEqual(typeof oError.error, "object");
            assert.strictEqual(typeof oError.message, "string");
            assert.strictEqual(oError.status, 404);
        });
        return oRequestor.processBatch("groupId").then(function (oResult) {
            assert.strictEqual(oResult, undefined);
        });
    });
    QUnit.test("request(ProductList)/processBatch (realOData) patch", function () {
        var oBody = { Name: "modified by QUnit test" }, oRequestor = _Requestor.create(sSampleServiceUrl, oModelInterface), sResourcePath = "ProductList('HT-1001')";
        return Promise.all([
            oRequestor.request("PATCH", sResourcePath, this.createGroupLock(), {
                "If-Match": { "@odata.etag": "*" }
            }, oBody).then(function (oResult) {
                TestUtils.deepContains(oResult, oBody);
            }),
            oRequestor.processBatch("groupId")
        ]);
    });
    QUnit.test("processBatch (real OData): error in change set", function (assert) {
        var sCommonMessage, oEntity = {
            "@odata.etag": "*"
        }, oRequestor = _Requestor.create(sSampleServiceUrl, oModelInterface);
        function onError(sRequestUrl, oError) {
            if (sCommonMessage) {
                assert.strictEqual(oError.message, sCommonMessage);
            }
            else {
                sCommonMessage = oError.message;
            }
            assert.strictEqual(oError.requestUrl, sRequestUrl);
        }
        return Promise.all([
            oRequestor.request("PATCH", "ProductList('HT-1001')", this.createGroupLock(), { "If-Match": oEntity }, { Name: "foo" }).then(undefined, onError.bind(null, sSampleServiceUrl + "ProductList('HT-1001')")),
            oRequestor.request("POST", "Unknown", this.createGroupLock(), undefined, {}).then(undefined, onError.bind(null, sSampleServiceUrl + "Unknown")),
            oRequestor.request("PATCH", "ProductList('HT-1001')", this.createGroupLock(), { "If-Match": oEntity }, { Name: "bar" }).then(undefined, onError.bind(null, sSampleServiceUrl + "ProductList('HT-1001')")),
            oRequestor.request("GET", "SalesOrderList?$skip=0&$top=10", this.createGroupLock()).then(undefined, function (oError) {
                assert.strictEqual(oError.message, "HTTP request was not processed because the previous request failed");
                assert.strictEqual(oError.$reported, true);
            }),
            oRequestor.processBatch("groupId")
        ]);
    });
}
QUnit.test("getPathAndAddQueryOptions: Action", function (assert) {
    var oOperationMetadata = {
        $kind: "Action",
        "$Parameter": [{
                "$Name": "Foo"
            }, {
                "$Name": "ID"
            }]
    }, mParameters = { "ID": "1", "Foo": 42, "n/a": NaN }, oRequestor = _Requestor.create("/");
    assert.strictEqual(oRequestor.getPathAndAddQueryOptions("/OperationImport(...)", oOperationMetadata, mParameters), "OperationImport");
    assert.deepEqual(mParameters, { "ID": "1", "Foo": 42 }, "n/a is removed");
    assert.strictEqual(oRequestor.getPathAndAddQueryOptions("/Entity('0815')/bound.Operation(...)", { $kind: "Action" }, mParameters), "Entity('0815')/bound.Operation");
    assert.deepEqual(mParameters, {}, "no parameters accepted");
});
QUnit.test("getPathAndAddQueryOptions: Function", function (assert) {
    var oOperationMetadata = {
        $kind: "Function",
        $Parameter: [{
                $Name: "f\u00F8\u00F8",
                $Type: "Edm.String"
            }, {
                $Name: "p2",
                $Type: "Edm.Int16"
            }, {
                $Name: "p3",
                $isCollection: true
            }]
    }, oRequestor = _Requestor.create("/"), oRequestorMock = this.mock(oRequestor);
    oRequestorMock.expects("formatPropertyAsLiteral").withExactArgs("b\u00E3r'1", oOperationMetadata.$Parameter[0]).returns("'b\u00E3r''1'");
    oRequestorMock.expects("formatPropertyAsLiteral").withExactArgs(42, oOperationMetadata.$Parameter[1]).returns("42");
    assert.strictEqual(oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata, { "f\u00F8\u00F8": "b\u00E3r'1", "p2": 42, "n/a": NaN }), "some.Function(f%C3%B8%C3%B8='b%C3%A3r''1',p2=42)");
});
QUnit.test("getPathAndAddQueryOptions: Function w/o parameters", function (assert) {
    var oOperationMetadata = { $kind: "Function" }, oRequestor = _Requestor.create("/");
    this.mock(oRequestor).expects("formatPropertyAsLiteral").never();
    assert.strictEqual(oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata, {}), "some.Function()");
});
QUnit.test("getPathAndAddQueryOptions: Function w/ collection parameter", function (assert) {
    var oOperationMetadata = {
        $kind: "Function",
        $Parameter: [{ $Name: "foo", $isCollection: true }]
    }, oRequestor = _Requestor.create("/");
    this.mock(oRequestor).expects("formatPropertyAsLiteral").never();
    assert.throws(function () {
        oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata, { "foo": [42] });
    }, new Error("Unsupported collection-valued parameter: foo"));
});
QUnit.test("isActionBodyOptional", function (assert) {
    var oRequestor = _Requestor.create("/");
    assert.strictEqual(oRequestor.isActionBodyOptional(), false);
});
QUnit.test("reportHeaderMessages", function () {
    var aMessages = [{ code: "42", message: "Test" }, { code: "43", type: "Warning" }], sMessages = JSON.stringify(aMessages), oRequestor = _Requestor.create("/", oModelInterface), sResourcePath = "Procduct(42)/to_bar";
    this.mock(oModelInterface).expects("reportTransitionMessages").withExactArgs([{
            code: "42",
            message: "Test"
        }, {
            code: "43",
            type: "Warning"
        }], sResourcePath);
    oRequestor.reportHeaderMessages(sResourcePath, sMessages);
});
QUnit.test("reportHeaderMessages without messages", function () {
    var oRequestor = _Requestor.create("/", oModelInterface);
    this.mock(oModelInterface).expects("reportTransitionMessages").never();
    oRequestor.reportHeaderMessages("foo(42)/to_bar");
});
QUnit.test("getModelInterface", function (assert) {
    var oRequestor = _Requestor.create("/", oModelInterface);
    assert.strictEqual(oRequestor.getModelInterface(), oModelInterface);
});
QUnit.test("getOrCreateBatchQueue", function (assert) {
    var aBatchQueue, oInterface = {}, oRequestor = _Requestor.create("/", oInterface);
    function checkBatchQueue(oBatchQueue0, sGroupId) {
        assert.strictEqual(oRequestor.mBatchQueue[sGroupId], oBatchQueue0);
        assert.strictEqual(oBatchQueue0.length, 1);
        assert.strictEqual(oBatchQueue0.iChangeSet, 0);
        assert.strictEqual(oBatchQueue0[0].length, 0);
        assert.strictEqual(oBatchQueue0[0].iSerialNumber, 0);
    }
    aBatchQueue = oRequestor.getOrCreateBatchQueue("group");
    checkBatchQueue(aBatchQueue, "group");
    assert.strictEqual(oRequestor.getOrCreateBatchQueue("group"), aBatchQueue);
    oInterface.onCreateGroup = function () { };
    this.mock(oInterface).expects("onCreateGroup").withExactArgs("group2");
    checkBatchQueue(oRequestor.getOrCreateBatchQueue("group2"), "group2");
});
QUnit.test("getSerialNumber", function (assert) {
    var oRequestor = _Requestor.create("/", oModelInterface);
    assert.strictEqual(oRequestor.getSerialNumber(), 1);
    assert.strictEqual(oRequestor.getSerialNumber(), 2);
});
QUnit.test("addChangeSet", function (assert) {
    var aChangeSet0 = [], oGetRequest = {}, oRequestor = _Requestor.create("/", oModelInterface), aRequests = [aChangeSet0, oGetRequest];
    aRequests.iChangeSet = 0;
    this.mock(oRequestor).expects("getOrCreateBatchQueue").withExactArgs("group").returns(aRequests);
    this.mock(oRequestor).expects("getSerialNumber").withExactArgs().returns(42);
    oRequestor.addChangeSet("group");
    assert.strictEqual(aRequests.length, 3);
    assert.strictEqual(aRequests.iChangeSet, 1);
    assert.strictEqual(aRequests[1].length, 0);
    assert.strictEqual(aRequests[0], aChangeSet0);
    assert.strictEqual(aRequests[0].iSerialNumber, undefined);
    assert.strictEqual(aRequests[1].iSerialNumber, 42);
    assert.strictEqual(aRequests[2], oGetRequest);
});
[{
        changes: false,
        requests: [],
        result: [],
        title: "no requests"
    }, {
        changes: false,
        requests: [[], { method: "GET", url: "Products" }],
        result: [{ method: "GET", url: "Products" }],
        title: "delete empty change set"
    }, {
        changes: true,
        requests: [[{ method: "PATCH", url: "Products('0')", body: { Name: "p1" } }]],
        result: [{ method: "PATCH", url: "Products('0')", body: { Name: "p1" } }],
        title: "unwrap change set"
    }, {
        changes: true,
        requests: [[
                { method: "PATCH", url: "Products('0')", body: { Name: null }, headers: { "If-Match": "ETag0" }, $promise: {} },
                { method: "PATCH", url: "Products('0')", body: { Name: "bar" }, headers: { "If-Match": "ETag0" }, $resolve: function () { }, _mergeInto: 0 },
                { method: "PATCH", url: "Products('0')", body: { Note: "hello, world" }, headers: { "If-Match": "ETag0" }, $resolve: function () { }, _mergeInto: 0 },
                { method: "PATCH", url: "Products('1')", body: { Name: "p1" }, headers: { "If-Match": "ETag1" }, $promise: {} },
                { method: "PATCH", url: "Products('0')", body: { Name: "bar2" }, headers: { "If-Match": "ETag0" }, $resolve: function () { }, _mergeInto: 0 },
                { method: "PATCH", url: "Products('0')", body: { Name: "no merge!" }, headers: { "If-Match": "ETag2" } },
                { method: "POST", url: "Products", body: { Name: "baz" } },
                { method: "POST", url: "Products('0')/GetCurrentStock", body: { Name: "baz" }, headers: { "If-Match": "ETag0" } },
                { method: "PATCH", url: "BusinessPartners('42')", body: { Address: null }, headers: { "If-Match": "ETag3" }, $promise: {} },
                { method: "PATCH", url: "BusinessPartners('42')", body: { Address: { City: "Walldorf" } }, headers: { "If-Match": "ETag3" }, $resolve: function () { }, _mergeInto: 8 },
                { method: "PATCH", url: "BusinessPartners('42')", body: { Address: { PostalCode: "69190" } }, headers: { "If-Match": "ETag3" }, $resolve: function () { }, _mergeInto: 8 }
            ], {
                method: "GET",
                url: "Products"
            }],
        result: [[
                { method: "PATCH", url: "Products('0')", body: { Name: "bar2", Note: "hello, world" }, headers: { "If-Match": "ETag0" } },
                { method: "PATCH", url: "Products('1')", body: { Name: "p1" }, headers: { "If-Match": "ETag1" } },
                { method: "PATCH", url: "Products('0')", body: { Name: "no merge!" }, headers: { "If-Match": "ETag2" } },
                { method: "POST", url: "Products", body: { Name: "baz" } },
                { method: "POST", url: "Products('0')/GetCurrentStock", body: { Name: "baz" }, headers: { "If-Match": "ETag0" } },
                { method: "PATCH", url: "BusinessPartners('42')", body: { Address: { City: "Walldorf", PostalCode: "69190" } }, headers: { "If-Match": "ETag3" } }
            ], {
                method: "GET",
                url: "Products"
            }],
        title: "merge PATCHes"
    }, {
        changes: true,
        requests: [
            [],
            [{ method: "PATCH", url: "Products('0')", body: { Name: "p1" } }],
            [
                { method: "PATCH", url: "Products('0')", body: { Name: null }, headers: { "If-Match": "ETag0" }, $promise: {} },
                { method: "PATCH", url: "Products('0')", body: { Name: "bar" }, headers: { "If-Match": "ETag0" }, $resolve: function () { }, _mergeInto: 0 }
            ],
            [
                { method: "POST", url: "Products('0')/GetCurrentStock", body: { Name: "baz" }, headers: { "If-Match": "ETag0" } },
                { method: "PATCH", url: "BusinessPartners('42')", body: { Address: { City: "Walldorf" } }, headers: { "If-Match": "ETag3" } }
            ],
            [],
            { method: "GET", url: "Products" }
        ],
        result: [
            { method: "PATCH", url: "Products('0')", body: { Name: "p1" } },
            { method: "PATCH", url: "Products('0')", body: { Name: "bar" }, headers: { "If-Match": "ETag0" } },
            [
                { method: "POST", url: "Products('0')/GetCurrentStock", body: { Name: "baz" }, headers: { "If-Match": "ETag0" } },
                { method: "PATCH", url: "BusinessPartners('42')", body: { Address: { City: "Walldorf" } }, headers: { "If-Match": "ETag3" } }
            ],
            { method: "GET", url: "Products" }
        ],
        title: "multiple change sets"
    }].forEach(function (oFixture) {
    QUnit.test("cleanUpChangeSets, " + oFixture.title, function (assert) {
        var oRequestor = _Requestor.create("/", oModelInterface), that = this;
        function checkRequests(aActualRequests, aExpectedRequests) {
            assert.strictEqual(aActualRequests.length, aExpectedRequests.length);
            aActualRequests.forEach(function (vActualRequest, i) {
                if (Array.isArray(vActualRequest)) {
                    checkRequests(vActualRequest, aExpectedRequests[i]);
                    return;
                }
                assert.strictEqual(vActualRequest.method, aExpectedRequests[i].method);
                assert.deepEqual(vActualRequest.body, aExpectedRequests[i].body);
                assert.deepEqual(vActualRequest.headers, aExpectedRequests[i].headers);
            });
        }
        oFixture.requests.forEach(function (vActualRequest, i) {
            if (Array.isArray(vActualRequest)) {
                oFixture.requests.iChangeSet = i;
                vActualRequest.forEach(function (oRequest) {
                    if (oRequest.$resolve) {
                        that.mock(oRequest).expects("$resolve").withExactArgs(vActualRequest[oRequest._mergeInto].$promise);
                    }
                });
            }
        });
        assert.strictEqual(oRequestor.cleanUpChangeSets(oFixture.requests), oFixture.changes);
        checkRequests(oFixture.requests, oFixture.result);
    });
});
[false, true].forEach(function (bTimeout) {
    QUnit.test("clearSessionContext: bTimeout=" + bTimeout, function (assert) {
        var oRequestor = _Requestor.create(sServiceUrl, oModelInterface), iSessionTimer = {};
        oRequestor.mHeaders["SAP-ContextId"] = "context";
        oRequestor.iSessionTimer = iSessionTimer;
        this.mock(window).expects("clearInterval").withExactArgs(sinon.match.same(iSessionTimer));
        this.mock(oRequestor.oModelInterface).expects("fireSessionTimeout").exactly(bTimeout ? 1 : 0).withExactArgs();
        oRequestor.clearSessionContext(bTimeout);
        assert.strictEqual(oRequestor.iSessionTimer, 0);
        assert.notOk("SAP-ContextId" in oRequestor.mHeaders);
        oRequestor.clearSessionContext();
    });
});
QUnit.test("setSessionContext: SAP-Http-Session-Timeout=null", function (assert) {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
    oRequestor.setSessionContext("context", null);
    assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "context");
    assert.strictEqual(oRequestor.iSessionTimer, 0);
});
QUnit.test("setSessionContext: SAP-Http-Session-Timeout=60", function (assert) {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface), iSessionTimer = {};
    this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
    this.mock(window).expects("setInterval").withExactArgs(sinon.match.func, 55000).returns(iSessionTimer);
    oRequestor.setSessionContext("context", "60");
    assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "context");
    assert.strictEqual(oRequestor.iSessionTimer, iSessionTimer);
});
["59", "0", "-100", "", "FooBar42", "60.0", " "].forEach(function (sTimeout) {
    QUnit.test("setSessionContext: unsupported header: " + sTimeout, function (assert) {
        var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
        this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
        this.oLogMock.expects("warning").withExactArgs("Unsupported SAP-Http-Session-Timeout header", sTimeout, sClassName);
        oRequestor.setSessionContext("context", sTimeout);
        assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "context");
        assert.strictEqual(oRequestor.iSessionTimer, 0);
    });
});
QUnit.test("setSessionContext: no SAP-ContextId", function () {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(window).expects("setInterval").never();
    this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
    oRequestor.setSessionContext(null, "120");
});
QUnit.test("setSessionContext: succesful ping", function (assert) {
    var oExpectation, oRequestor = _Requestor.create(sServiceUrl, oModelInterface, {}, {
        "sap-client": "120"
    });
    oExpectation = this.mock(window).expects("setInterval").withExactArgs(sinon.match.func, 115000);
    oRequestor.setSessionContext("context", "120");
    this.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl + "?sap-client=120", {
        headers: sinon.match({
            "SAP-ContextId": "context"
        }),
        method: "HEAD"
    }).returns(createMock(assert, undefined, "OK", {}));
    oExpectation.callArg(0);
});
[false, true].forEach(function (bErrorId) {
    QUnit.test("setSessionContext: error in ping, " + bErrorId, function (assert) {
        var that = this;
        return new Promise(function (resolve) {
            var oExpectation, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
            oExpectation = that.mock(window).expects("setInterval").withExactArgs(sinon.match.func, 115000);
            oRequestor.setSessionContext("context", "120");
            that.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl, {
                headers: sinon.match({
                    "SAP-ContextId": "context"
                }),
                method: "HEAD"
            }).callsFake(function () {
                var jqXHR = new jQuery.Deferred();
                setTimeout(function () {
                    jqXHR.reject({
                        getResponseHeader: function (sName) {
                            assert.strictEqual(sName, "SAP-Err-Id");
                            return bErrorId ? "ICMENOSESSION" : null;
                        },
                        "status": 500
                    });
                    resolve();
                }, 0);
                return jqXHR;
            });
            that.oLogMock.expects("error").exactly(bErrorId ? 1 : 0).withExactArgs("Session not found on server", undefined, sClassName);
            that.mock(oRequestor).expects("clearSessionContext").exactly(bErrorId ? 1 : 0).withExactArgs(true);
            oExpectation.callArg(0);
        });
    });
});
QUnit.test("setSessionContext: session termination", function () {
    var oClock, oExpectation, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    oClock = sinon.useFakeTimers();
    try {
        oExpectation = this.mock(window).expects("setInterval").withExactArgs(sinon.match.func, 115000);
        oRequestor.setSessionContext("context", "120");
        oClock.tick(30 * 60 * 1000);
        this.mock(jQuery).expects("ajax").never();
        this.mock(oRequestor).expects("clearSessionContext").withExactArgs(true);
        oExpectation.callArg(0);
    }
    finally {
        oClock.restore();
    }
});
QUnit.test("keep the session alive", function (assert) {
    var oClock, oJQueryMock = this.mock(jQuery), oRequestor = _Requestor.create(sServiceUrl, oModelInterface), sResourcePath = "Employees('1')/namespace.Prepare";
    oClock = sinon.useFakeTimers();
    return new Promise(function (resolve) {
        oJQueryMock.expects("ajax").withExactArgs(sServiceUrl + sResourcePath, {
            contentType: undefined,
            data: undefined,
            headers: sinon.match.object,
            method: "POST"
        }).returns(createMock(assert, {}, "OK", {
            "OData-Version": "4.0",
            "SAP-ContextId": "context",
            "SAP-Http-Session-Timeout": "960"
        }));
        oRequestor.sendRequest("POST", sResourcePath).then(function () {
            oJQueryMock.expects("ajax").withExactArgs(sServiceUrl, {
                headers: sinon.match({
                    "SAP-ContextId": "context"
                }),
                method: "HEAD"
            }).returns(createMock(assert, undefined, "OK", {}));
            oClock.tick(955000);
            oClock.tick(955000);
            assert.notOk("SAP-ContextId" in oRequestor.mHeaders);
            resolve();
        });
    }).finally(function () {
        oRequestor.destroy();
        oClock.restore();
    });
});
QUnit.test("waitForRunningChangeRequests", function (assert) {
    var oPromise, oRequestor = _Requestor.create(sServiceUrl, oModelInterface), aRequests = [];
    assert.strictEqual(oRequestor.waitForRunningChangeRequests("groupId"), SyncPromise.resolve());
    oRequestor.batchRequestSent("groupId", aRequests, true);
    oPromise = oRequestor.waitForRunningChangeRequests("groupId");
    assert.strictEqual(oPromise.isPending(), true);
    oRequestor.batchResponseReceived("groupId", aRequests, true);
    assert.strictEqual(oPromise.isFulfilled(), true);
    assert.strictEqual(oPromise.getResult(), undefined);
});
QUnit.test("addChangeToGroup: $direct", function () {
    var oChange = {
        $cancel: {},
        $resolve: function () { },
        $submit: {},
        body: {},
        method: {},
        headers: {},
        url: {}
    }, oGroupLock = {}, oPromise = {}, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(oRequestor).expects("getGroupSubmitMode").withExactArgs("direct").returns("Direct");
    this.mock(oRequestor).expects("lockGroup").withExactArgs("direct", sinon.match.same(oRequestor), true, true).returns(oGroupLock);
    this.mock(oRequestor).expects("request").withExactArgs(sinon.match.same(oChange.method), sinon.match.same(oChange.url), sinon.match.same(oGroupLock), sinon.match.same(oChange.headers), sinon.match.same(oChange.body), sinon.match.same(oChange.$submit), sinon.match.same(oChange.$cancel)).returns(oPromise);
    this.mock(oChange).expects("$resolve").withExactArgs(sinon.match.same(oPromise));
    oRequestor.addChangeToGroup(oChange, "direct");
});
QUnit.test("addChangeToGroup: $batch", function (assert) {
    var oChange = {}, oRequestor = _Requestor.create(sServiceUrl, oModelInterface), aRequests = [[], [{}]];
    aRequests.iChangeSet = 1;
    this.mock(oRequestor).expects("getGroupSubmitMode").withExactArgs("group").returns("API");
    this.mock(oRequestor).expects("request").never();
    this.mock(oRequestor).expects("getOrCreateBatchQueue").withExactArgs("group").returns(aRequests);
    oRequestor.addChangeToGroup(oChange, "group");
    assert.strictEqual(aRequests.length, 2);
    assert.deepEqual(aRequests[0], []);
    assert.strictEqual(aRequests[1].length, 2);
    assert.strictEqual(aRequests[1][1], oChange);
});
QUnit.test("lockGroup: non-blocking", function (assert) {
    var oGroupLock, aLockedGroupLocks = [], oOwner = {}, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    oRequestor.aLockedGroupLocks = aLockedGroupLocks;
    this.mock(oRequestor).expects("getSerialNumber").returns(42);
    oGroupLock = oRequestor.lockGroup("foo", oOwner);
    assert.ok(oGroupLock instanceof _GroupLock);
    assert.strictEqual(oGroupLock.getGroupId(), "foo");
    assert.strictEqual(oGroupLock.oOwner, oOwner);
    assert.strictEqual(oGroupLock.isLocked(), false);
    assert.strictEqual(oGroupLock.getSerialNumber(), 42);
    assert.strictEqual(oRequestor.aLockedGroupLocks, aLockedGroupLocks);
    assert.strictEqual(oRequestor.aLockedGroupLocks.length, 0);
});
[false, true].forEach(function (bModifying) {
    QUnit.test("lockGroup: blocking, modifying: " + bModifying, function (assert) {
        var fnCancel = {}, oGroupLock, aLockedGroupLocks = [{}, {}], oRequestor = _Requestor.create(sServiceUrl, oModelInterface), oOwner = {};
        oRequestor.aLockedGroupLocks = aLockedGroupLocks;
        this.mock(oRequestor).expects("getSerialNumber").returns(42);
        oGroupLock = oRequestor.lockGroup("foo", oOwner, true, bModifying, fnCancel);
        assert.ok(oGroupLock instanceof _GroupLock);
        assert.strictEqual(oGroupLock.getGroupId(), "foo");
        assert.strictEqual(oGroupLock.isCanceled(), false);
        assert.strictEqual(oGroupLock.isLocked(), true);
        assert.strictEqual(oGroupLock.oOwner, oOwner);
        assert.strictEqual(oGroupLock.fnCancel, fnCancel);
        assert.strictEqual(oGroupLock.getSerialNumber(), 42);
        assert.strictEqual(oGroupLock.isModifying(), bModifying);
        assert.strictEqual(oRequestor.aLockedGroupLocks, aLockedGroupLocks);
        assert.deepEqual(oRequestor.aLockedGroupLocks, [{}, {}, oGroupLock]);
    });
});
QUnit.test("submitBatch: group locks", function (assert) {
    var oBarGroupLock, oBarPromise, oBazPromise, oFooGroupLock, oFooPromise, oRequestor = _Requestor.create(sServiceUrl, oModelInterface), oRequestorMock = this.mock(oRequestor), that = this;
    oRequestorMock.expects("processBatch").never();
    oFooGroupLock = oRequestor.lockGroup("foo", {}, true);
    oBarGroupLock = oRequestor.lockGroup("bar", {}, true);
    this.oLogMock.expects("info").withExactArgs("submitBatch('foo') is waiting for locks", null, sClassName);
    oFooPromise = oRequestor.submitBatch("foo");
    assert.ok(oFooPromise instanceof SyncPromise);
    this.oLogMock.expects("info").withExactArgs("submitBatch('bar') is waiting for locks", null, sClassName);
    oBarPromise = oRequestor.submitBatch("bar");
    oRequestorMock.expects("processBatch").withExactArgs("baz").returns(Promise.resolve());
    oBazPromise = oRequestor.submitBatch("baz");
    this.oLogMock.expects("info").withExactArgs("submitBatch('foo') continues", null, sClassName);
    oRequestorMock.expects("processBatch").withExactArgs("foo").returns(Promise.resolve());
    oFooGroupLock.unlock();
    return Promise.all([
        oFooPromise.then(function () {
            assert.deepEqual(oRequestor.aLockedGroupLocks, [oBarGroupLock]);
            that.oLogMock.expects("info").withExactArgs("submitBatch('bar') continues", null, sClassName);
            oRequestorMock.expects("processBatch").withExactArgs("bar").returns(Promise.resolve());
            oBarGroupLock.unlock();
        }),
        oBarPromise.then(function () {
            assert.deepEqual(oRequestor.aLockedGroupLocks, []);
        }),
        oBazPromise
    ]);
});
QUnit.test("checkHeaderNames", function (assert) {
    var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    oRequestor.checkHeaderNames({ allowed: "123" });
    oRequestor.checkHeaderNames({ "X-Http-Method": "123" });
    ["Accept", "Accept-Charset", "Content-Encoding", "Content-ID", "Content-Language", "Content-Length", "Content-Transfer-Encoding", "Content-Type", "If-Match", "If-None-Match", "Isolation", "OData-Isolation", "OData-MaxVersion", "OData-Version", "Prefer", "SAP-ContextId"].forEach(function (sHeaderName) {
        var mHeaders = {};
        mHeaders[sHeaderName] = "123";
        assert.throws(function () {
            oRequestor.checkHeaderNames(mHeaders);
        }, new Error("Unsupported header: " + sHeaderName));
    });
});
QUnit.test("checkForOpenRequests", function (assert) {
    var sErrorMessage = "Unexpected open requests", oGroupLockMock0, oGroupLockMock1, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    oRequestor.mBatchQueue["groupId"] = [];
    oRequestor.checkForOpenRequests();
    oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    oRequestor.mBatchQueue["groupId"] = [[]];
    oRequestor.checkForOpenRequests();
    oRequestor.mBatchQueue["groupId"] = [[{}]];
    assert.throws(function () {
        oRequestor.checkForOpenRequests();
    }, new Error(sErrorMessage));
    oRequestor.mBatchQueue["groupId"] = [[], {}];
    assert.throws(function () {
        oRequestor.checkForOpenRequests();
    }, new Error(sErrorMessage));
    oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    oRequestor.aLockedGroupLocks = [{ isLocked: function () { } }, { isLocked: function () { } }];
    oGroupLockMock0 = this.mock(oRequestor.aLockedGroupLocks[0]);
    oGroupLockMock0.expects("isLocked").withExactArgs().returns(false);
    oGroupLockMock1 = this.mock(oRequestor.aLockedGroupLocks[1]);
    oGroupLockMock1.expects("isLocked").withExactArgs().returns(false);
    oRequestor.checkForOpenRequests();
    oGroupLockMock0.expects("isLocked").withExactArgs().returns(false);
    oGroupLockMock1.expects("isLocked").withExactArgs().returns(true);
    assert.throws(function () {
        oRequestor.checkForOpenRequests();
    }, new Error(sErrorMessage));
});
QUnit.test("mergeGetRequests", function (assert) {
    var oHelperMock = this.mock(_Helper), oMergedQueryOptions = {}, aMergedRequests, oRequestor = _Requestor.create(sServiceUrl, oModelInterface), oRequestorMock = this.mock(oRequestor), aRequests = [[], {
            url: "EntitySet1('42')?foo=bar",
            $metaPath: "/EntitySet1",
            $promise: {},
            $queryOptions: {}
        }, {
            url: "EntitySet1('42')?foo=bar",
            $promise: {}
        }, {
            url: "EntitySet1('42')?foo=bar",
            $queryOptions: {},
            $resolve: function () { }
        }, {
            url: "EntitySet1('42')?foo=bar"
        }, {
            url: "EntitySet3('42')",
            $metaPath: "/EntitySet3",
            $queryOptions: {}
        }, {
            url: "EntitySet2('42')",
            $metaPath: "/EntitySet2",
            $promise: {},
            $queryOptions: {}
        }, {
            url: "EntitySet2('42')",
            $queryOptions: {},
            $resolve: function () { }
        }];
    aRequests.iChangeSet = 1;
    oHelperMock.expects("aggregateExpandSelect").withExactArgs(sinon.match.same(aRequests[1].$queryOptions), sinon.match.same(aRequests[3].$queryOptions)).returns(oMergedQueryOptions);
    this.mock(aRequests[3]).expects("$resolve").withExactArgs(sinon.match.same(aRequests[1].$promise));
    oHelperMock.expects("aggregateExpandSelect").withExactArgs(sinon.match.same(aRequests[6].$queryOptions), sinon.match.same(aRequests[7].$queryOptions)).returns(oMergedQueryOptions);
    this.mock(aRequests[7]).expects("$resolve").withExactArgs(sinon.match.same(aRequests[6].$promise));
    oRequestorMock.expects("addQueryString").withExactArgs(aRequests[1].url, aRequests[1].$metaPath, sinon.match.same(aRequests[1].$queryOptions)).returns("EntitySet1('42')?$select=name");
    oRequestorMock.expects("addQueryString").withExactArgs(aRequests[5].url, aRequests[5].$metaPath, sinon.match.same(aRequests[5].$queryOptions)).returns("EntitySet3('42')?$select=foo");
    oRequestorMock.expects("addQueryString").withExactArgs(aRequests[6].url, aRequests[6].$metaPath, sinon.match.same(aRequests[6].$queryOptions)).returns("EntitySet2('42')?$select=birthdate");
    aMergedRequests = oRequestor.mergeGetRequests(aRequests);
    assert.strictEqual(aMergedRequests.length, 6);
    assert.strictEqual(aMergedRequests.iChangeSet, aRequests.iChangeSet);
    assert.strictEqual(aMergedRequests[0], aRequests[0]);
    assert.strictEqual(aMergedRequests[1], aRequests[1]);
    assert.strictEqual(aMergedRequests[2], aRequests[2]);
    assert.strictEqual(aMergedRequests[3], aRequests[4]);
    assert.strictEqual(aMergedRequests[4], aRequests[5]);
    assert.strictEqual(aMergedRequests[5], aRequests[6]);
    assert.strictEqual(aMergedRequests[1].url, "EntitySet1('42')?$select=name");
    assert.strictEqual(aMergedRequests[4].url, "EntitySet3('42')?$select=foo");
    assert.strictEqual(aMergedRequests[5].url, "EntitySet2('42')?$select=birthdate");
});
QUnit.test("addQueryString", function (assert) {
    var mConvertedQueryOptions = {}, mQueryOptions = {}, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(oRequestor).expects("convertQueryOptions").twice().withExactArgs("/meta/path", sinon.match.same(mQueryOptions), false, true).returns(mConvertedQueryOptions);
    this.mock(_Helper).expects("buildQuery").twice().withExactArgs(sinon.match.same(mConvertedQueryOptions)).returns("?~");
    assert.strictEqual(oRequestor.addQueryString("EntitySet", "/meta/path", mQueryOptions), "EntitySet?~");
    assert.strictEqual(oRequestor.addQueryString("EntitySet?foo=bar", "/meta/path", mQueryOptions), "EntitySet?foo=bar&~");
});
QUnit.test("addQueryString with placeholders, partial", function (assert) {
    var mConvertedQueryOptions = { $bar: "bar~c", $foo: "foo~c" }, mQueryOptions = { $bar: "bar", $foo: "foo" }, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(oRequestor).expects("convertQueryOptions").withExactArgs("/meta/path", sinon.match.same(mQueryOptions), false, true).returns(mConvertedQueryOptions);
    this.mock(_Helper).expects("encodePair").withExactArgs("$foo", "foo~c").returns("$foo=foo");
    this.mock(_Helper).expects("buildQuery").withExactArgs({ $bar: "bar~c" }).returns("?$bar=bar");
    assert.strictEqual(oRequestor.addQueryString("EntitySet?$foo=~", "/meta/path", mQueryOptions), "EntitySet?$foo=foo&$bar=bar");
});
QUnit.test("addQueryString with placeholders, complete", function (assert) {
    var mConvertedQueryOptions = { $bar: "bar~c", $foo: "foo~c" }, oHelperMock = this.mock(_Helper), mQueryOptions = { $bar: "bar", $foo: "foo" }, oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
    this.mock(oRequestor).expects("convertQueryOptions").withExactArgs("/meta/path", sinon.match.same(mQueryOptions), false, true).returns(mConvertedQueryOptions);
    oHelperMock.expects("encodePair").withExactArgs("$foo", "foo~c").returns("$foo=foo");
    oHelperMock.expects("encodePair").withExactArgs("$bar", "bar~c").returns("$bar=bar");
    oHelperMock.expects("buildQuery").withExactArgs({}).returns("");
    assert.strictEqual(oRequestor.addQueryString("EntitySet?$foo=~&$bar=~", "/meta/path", mQueryOptions), "EntitySet?$foo=foo&$bar=bar");
});
QUnit.test("checkConflictingStrictRequest", function (assert) {
    var oRequestor = _Requestor.create("/~/"), oRequest = {
        headers: { foo: "bar" }
    }, oStrictRequest = {
        headers: { Prefer: "handling=strict" }
    };
    function success(aRequests, iChangeSetNo) {
        aRequests.iChangeSet = aRequests.length - 1;
        aRequests.push({});
        oRequestor.checkConflictingStrictRequest(oRequest, aRequests, iChangeSetNo);
        oRequestor.checkConflictingStrictRequest(oStrictRequest, aRequests, iChangeSetNo);
    }
    function fail(aRequests, iChangeSetNo) {
        aRequests.iChangeSet = aRequests.length - 1;
        aRequests.push({});
        oRequestor.checkConflictingStrictRequest(oRequest, aRequests, iChangeSetNo);
        assert.throws(function () {
            oRequestor.checkConflictingStrictRequest(oStrictRequest, aRequests, iChangeSetNo);
        }, new Error("All requests with strict handling must belong to the same change set"));
    }
    success([[]], 0);
    success([[oRequest], [oRequest]], 1);
    success([[oRequest], [oRequest]], 0);
    success([[oStrictRequest], [oRequest]], 0);
    success([[oRequest], [oStrictRequest]], 1);
    success([[oRequest], [oRequest, oStrictRequest]], 1);
    success([[oRequest], [oRequest, oStrictRequest], [oRequest]], 1);
    fail([[oStrictRequest], [oRequest]], 1);
    fail([[oRequest], [oStrictRequest], []], 2);
    fail([[oRequest], [oRequest, oStrictRequest], []], 2);
    fail([[oRequest], [oRequest, oStrictRequest], [oRequest]], 2);
    fail([[oRequest], [], [oStrictRequest]], 1);
});
QUnit.test("request: checkConflictingStrictRequests", function (assert) {
    var oConflictError = {}, oExpectedRequest = {
        method: "POST",
        url: "some/url",
        headers: {
            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
            "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
        },
        body: undefined,
        $cancel: undefined,
        $metaPath: undefined,
        $queryOptions: undefined,
        $reject: sinon.match.func,
        $resolve: sinon.match.func,
        $resourcePath: "some/url",
        $submit: undefined
    }, aRequests = [[]], oRequestor = _Requestor.create("/~/"), oGroupLock = oRequestor.lockGroup("groupId", {}), oRequestorMock = this.mock(oRequestor);
    aRequests.iChangeSet = 0;
    aRequests[0].iSerialNumber = 0;
    oRequestorMock.expects("getGroupSubmitMode").withExactArgs("groupId").returns("~");
    oRequestorMock.expects("getOrCreateBatchQueue").withExactArgs("groupId").returns(aRequests);
    oRequestorMock.expects("checkConflictingStrictRequest").withExactArgs(sinon.match(oExpectedRequest), sinon.match.same(aRequests), 0);
    oRequestor.request("POST", "some/url", oGroupLock);
    assert.strictEqual(aRequests[0][0].url, "some/url");
    oRequestorMock.expects("getGroupSubmitMode").withExactArgs("groupId").returns("~");
    oRequestorMock.expects("getOrCreateBatchQueue").withExactArgs("groupId").returns(aRequests);
    oRequestorMock.expects("checkConflictingStrictRequest").withExactArgs(sinon.match(oExpectedRequest), sinon.match.same(aRequests), 0).throws(oConflictError);
    return oRequestor.request("POST", "some/url", oGroupLock.getUnlockedCopy()).then(function () {
        assert.notOk(true);
    }, function (oError) {
        assert.strictEqual(oConflictError, oError);
        assert.strictEqual(aRequests[0][0].url, "some/url");
        assert.strictEqual(aRequests[0].length, 1);
    });
});