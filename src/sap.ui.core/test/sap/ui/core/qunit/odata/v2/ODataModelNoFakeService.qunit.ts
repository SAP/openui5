import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import coreLibrary from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import BaseContext from "sap/ui/model/Context";
import FilterProcessor from "sap/ui/model/FilterProcessor";
import Model from "sap/ui/model/Model";
import _ODataMetaModelUtils from "sap/ui/model/odata/_ODataMetaModelUtils";
import CountMode from "sap/ui/model/odata/CountMode";
import MessageScope from "sap/ui/model/odata/MessageScope";
import ODataMessageParser from "sap/ui/model/odata/ODataMessageParser";
import ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";
import ODataPropertyBinding from "sap/ui/model/odata/ODataPropertyBinding";
import ODataUtils from "sap/ui/model/odata/ODataUtils";
import _CreatedContextsCache from "sap/ui/model/odata/v2/_CreatedContextsCache";
import Context from "sap/ui/model/odata/v2/Context";
import ODataAnnotations from "sap/ui/model/odata/v2/ODataAnnotations";
import ODataContextBinding from "sap/ui/model/odata/v2/ODataContextBinding";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ODataTreeBinding from "sap/ui/model/odata/v2/ODataTreeBinding";
import TestUtils from "sap/ui/test/TestUtils";
var sClassName = "sap.ui.model.odata.v2.ODataModel", iCount = 1000, rTemporaryKey = /\('(id-[^']+)'\)$/;
function repeatedTest(assert, fnTest) {
    var i, iStart = Date.now(), iDuration;
    for (i = iCount; i; i -= 1) {
        fnTest();
    }
    iDuration = Date.now() - iStart;
    assert.ok(true, iCount + " iterations took " + iDuration + " ms, that is " + iDuration / iCount + " ms per iteration");
}
QUnit.module("sap.ui.model.odata.v2.ODataModel (ODataModelNoFakeService)", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
[{
        sExpectedRequestedWithHeader: "XMLHttpRequest",
        sServiceUrl: "/foo/bar"
    }, {
        sServiceUrl: "/foo/bar",
        oHeaderParameter: {
            "X-Requested-With": "~X-Requested-With"
        }
    }, {
        sServiceUrl: "https://example.com/foo/bar"
    }, {
        oHeaderParameter: {
            "X-Requested-With": "~X-Requested-With"
        },
        sServiceUrl: "https://example.com/foo/bar"
    }].forEach(function (oFixture, i) {
    var sTitle = "constructor: oCreatedContextsCache, codeListModelParameters and sMetadataUrl" + " stored #" + i + ", sServiceUrl: " + oFixture.sServiceUrl;
    QUnit.test(sTitle, function (assert) {
        var oDataModelMock = this.mock(ODataModel), oExpectedHeaders = {
            "Accept": "application/json",
            "Accept-Language": "~languageTag",
            "DataServiceVersion": "2.0",
            "MaxDataServiceVersion": "2.0",
            "sap-contextid-accept": "header"
        }, oMetadata = {
            oMetadata: {
                isLoaded: function () { },
                loaded: function () { }
            }
        }, mParameters = {
            annotationURI: "~annotationURI",
            headers: oFixture.oHeaderParameter || {},
            serviceUrl: oFixture.sServiceUrl,
            skipMetadataAnnotationParsing: true,
            tokenHandling: false
        }, oPromise = {
            then: function () { }
        };
        this.mock(ODataModel.prototype).expects("createCodeListModelParameters").withExactArgs(sinon.match.same(mParameters)).returns("~codeListModelParameters");
        this.mock(ODataModel.prototype).expects("_createMetadataUrl").withExactArgs("/$metadata").returns("~metadataUrl");
        this.mock(ODataModel.prototype).expects("_getServerUrl").withExactArgs().returns("~serverUrl");
        oDataModelMock.expects("_getSharedData").withExactArgs("server", "~serverUrl").returns(undefined);
        oDataModelMock.expects("_getSharedData").withExactArgs("service", oFixture.sServiceUrl).returns(undefined);
        oDataModelMock.expects("_getSharedData").withExactArgs("meta", "~metadataUrl").returns(oMetadata);
        this.mock(ODataModel.prototype).expects("_getAnnotationCacheKey").withExactArgs("~metadataUrl").returns(undefined);
        this.mock(oMetadata.oMetadata).expects("loaded").withExactArgs().twice().returns(oPromise);
        this.mock(oMetadata.oMetadata).expects("isLoaded").withExactArgs().returns(true);
        this.mock(ODataAnnotations.prototype).expects("addSource").withExactArgs(["~annotationURI"]);
        this.mock(sap.ui.getCore().getConfiguration()).expects("getLanguageTag").withExactArgs().returns("~languageTag");
        if (oFixture.sExpectedRequestedWithHeader) {
            oExpectedHeaders["X-Requested-With"] = oFixture.sExpectedRequestedWithHeader;
        }
        var oModel = new ODataModel(mParameters);
        assert.strictEqual(oModel.mCodeListModelParams, "~codeListModelParameters");
        assert.strictEqual(oModel.sMetadataUrl, "~metadataUrl");
        assert.deepEqual(oModel.oHeaders, oExpectedHeaders);
        assert.deepEqual(oModel.mCustomHeaders, oFixture.oHeaderParameter || {});
        assert.ok(oModel.oCreatedContextsCache instanceof _CreatedContextsCache);
    });
});
QUnit.test("read: updateAggregatedMessages passed to _createRequest", function (assert) {
    var bCanonicalRequest = "{boolean} bCanonicalRequest", oContext = "{sap.ui.model.odata.v2.Context} oContext", sDeepPath = "~deepPath", oEntityType = "{object} oEntityType", fnError = {}, sETag = "~etag", oFilter = "{object} oFilter", sFilterParams = "~$filter", aFilters = "{sap.ui.model.Filter[]} aFilters", mGetHeaders = "{object} mGetHeaders", sGroupId = "~groupId", mHeaders = "{object} mHeaders", bIsCanonicalRequestNeeded = "{boolean} bIsCanonicalRequestNeeded", oModel = {
        _createRequest: function () { },
        _createRequestUrlWithNormalizedPath: function () { },
        _getHeaders: function () { },
        _getETag: function () { },
        _getResourcePath: function () { },
        _isCanonicalRequestNeeded: function () { },
        _normalizePath: function () { },
        _pushToRequestQueue: function () { },
        resolveDeep: function () { },
        mDeferredGroups: {},
        bIncludeInCurrentBatch: true,
        oMetadata: {
            _getEntityTypeByPath: function () { }
        },
        mRequests: "{object} mRequests",
        bUseBatch: true
    }, oModelMock = this.mock(oModel), oODataUtilsMock = this.mock(ODataUtils), sResourcePath = "~resourcePath/$count", aSorters = "{sap.ui.model.Sorter[]} aSorters", fnSuccess = "{function} fnSuccess", bUpdateAggregatedMessages = "{boolean} bUpdateAggregatedMessages", mUrlParams = "{object} mUrlParams", mParameters = {
        canonicalRequest: bCanonicalRequest,
        context: oContext,
        error: fnError,
        filters: aFilters,
        groupId: sGroupId,
        headers: mHeaders,
        sorters: aSorters,
        success: fnSuccess,
        updateAggregatedMessages: bUpdateAggregatedMessages,
        urlParameters: mUrlParams
    }, sPath = "~path/$count", oRequest = {}, sSorterParams = "~$orderby", sUrl = "~url", aUrlParams = [];
    oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(bCanonicalRequest).returns(bIsCanonicalRequestNeeded);
    oODataUtilsMock.expects("_createUrlParamsArray").withExactArgs(mUrlParams).returns(aUrlParams);
    oModelMock.expects("_getHeaders").withExactArgs(mHeaders, true).returns(mGetHeaders);
    oModelMock.expects("_getETag").withExactArgs(sPath, oContext).returns(sETag);
    oModelMock.expects("resolveDeep").withExactArgs(sPath, oContext).returns(sDeepPath);
    oModelMock.expects("_getResourcePath").withExactArgs(bIsCanonicalRequestNeeded, sDeepPath, sPath, oContext).returns(sResourcePath);
    oODataUtilsMock.expects("createSortParams").withExactArgs(aSorters).returns(sSorterParams);
    this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs(sResourcePath).returns(oEntityType);
    this.mock(FilterProcessor).expects("groupFilters").withExactArgs(aFilters).returns(oFilter);
    oODataUtilsMock.expects("createFilterParams").withExactArgs(oFilter, sinon.match.same(oModel.oMetadata), oEntityType).returns(sFilterParams);
    oModelMock.expects("_createRequestUrlWithNormalizedPath").withExactArgs(sResourcePath, sinon.match.same(aUrlParams).and(sinon.match([sSorterParams, sFilterParams])), true).returns(sUrl);
    oModelMock.expects("_createRequest").withExactArgs(sUrl, sDeepPath, "GET", mGetHeaders, null, sETag, undefined, bUpdateAggregatedMessages).returns(oRequest);
    oModelMock.expects("_pushToRequestQueue").withExactArgs(oModel.mRequests, sGroupId, null, sinon.match.same(oRequest), fnSuccess, fnError, sinon.match.object, false).returns(oRequest);
    ODataModel.prototype.read.call(oModel, "~path/$count?foo='bar'", mParameters);
});
QUnit.test("_getResourcePath: do not shorten", function (assert) {
    var oModel = {
        resolve: function () { }
    };
    this.mock(oModel).expects("resolve").withExactArgs("~sPath", "~oContext").returns("/~resourcePath");
    assert.strictEqual(ODataModel.prototype._getResourcePath.call(oModel, false, "~sDeepPath", "~sPath", "~oContext"), "/~resourcePath");
});
[true, false].forEach(function (bCanBeResolved) {
    QUnit.test("_getResourcePath: no navigation property; resolvable path: " + bCanBeResolved, function (assert) {
        var oMetadata = {
            _splitByLastNavigationProperty: function () { }
        }, oModel = {
            oMetadata: oMetadata,
            resolve: function () { }
        };
        this.mock(oMetadata).expects("_splitByLastNavigationProperty").withExactArgs("~sDeepPath").returns({
            pathBeforeLastNavigationProperty: "/~before",
            lastNavigationProperty: "",
            addressable: true,
            pathAfterLastNavigationProperty: ""
        });
        this.mock(oModel).expects("resolve").withExactArgs("/~before", undefined, true).returns(bCanBeResolved ? "/~resourcePath" : undefined);
        assert.strictEqual(ODataModel.prototype._getResourcePath.call(oModel, true, "~sDeepPath", "~sPath", "~oContext"), bCanBeResolved ? "/~resourcePath" : "/~before");
    });
});
QUnit.test("_getResourcePath: navigation property with key predicate can be resolved", function (assert) {
    var oMetadata = {
        _splitByLastNavigationProperty: function () { }
    }, oModel = {
        oMetadata: oMetadata,
        resolve: function () { }
    };
    this.mock(oMetadata).expects("_splitByLastNavigationProperty").withExactArgs("~sDeepPath").returns({
        pathBeforeLastNavigationProperty: "/~before",
        lastNavigationProperty: "/~navigationProperty(foo='bar')",
        addressable: true,
        pathAfterLastNavigationProperty: "/~after"
    });
    this.mock(oModel).expects("resolve").withExactArgs("/~before/~navigationProperty(foo='bar')", undefined, true).returns("/~resourcePath");
    assert.strictEqual(ODataModel.prototype._getResourcePath.call(oModel, true, "~sDeepPath", "~sPath", "~oContext"), "/~resourcePath/~after");
});
[{
        addressable: true,
        isResolvingWithNavigationPropertyCalled: true,
        navigationProperty: "/~navigationProperty(foo='bar')",
        resolvedBeforePath: "/~resourcePath",
        result: "/~resourcePath/~navigationProperty(foo='bar')/~after"
    }, {
        addressable: true,
        isResolvingWithNavigationPropertyCalled: false,
        navigationProperty: "/~navigationProperty",
        resolvedBeforePath: "/~resourcePath",
        result: "/~resourcePath/~navigationProperty/~after"
    }, {
        addressable: false,
        isResolvingWithNavigationPropertyCalled: false,
        navigationProperty: "/~navigationProperty(foo='bar')",
        resolvedBeforePath: "/~resourcePath",
        result: "/~resourcePath/~navigationProperty(foo='bar')/~after"
    }, {
        addressable: true,
        isResolvingWithNavigationPropertyCalled: true,
        navigationProperty: "/~navigationProperty(foo='bar')",
        resolvedBeforePath: null,
        result: "/~before/~navigationProperty(foo='bar')/~after"
    }, {
        addressable: true,
        isResolvingWithNavigationPropertyCalled: false,
        navigationProperty: "/~navigationProperty",
        resolvedBeforePath: null,
        result: "/~before/~navigationProperty/~after"
    }, {
        addressable: false,
        isResolvingWithNavigationPropertyCalled: false,
        navigationProperty: "/~navigationProperty(foo='bar')",
        resolvedBeforePath: null,
        result: "/~before/~navigationProperty(foo='bar')/~after"
    }].forEach(function (oFixture, i) {
    QUnit.test("_getResourcePath: with navigation property, path before navigation property" + " is resolvable, #" + i, function (assert) {
        var oMetadata = {
            _splitByLastNavigationProperty: function () { }
        }, oModel = {
            oMetadata: oMetadata,
            resolve: function () { }
        }, oModelMock = this.mock(oModel);
        this.mock(oMetadata).expects("_splitByLastNavigationProperty").withExactArgs("~sDeepPath").returns({
            pathBeforeLastNavigationProperty: "/~before",
            lastNavigationProperty: oFixture.navigationProperty,
            addressable: oFixture.addressable,
            pathAfterLastNavigationProperty: "/~after"
        });
        oModelMock.expects("resolve").withExactArgs("/~before/~navigationProperty(foo='bar')", undefined, true).exactly(oFixture.isResolvingWithNavigationPropertyCalled ? 1 : 0).returns(null);
        oModelMock.expects("resolve").withExactArgs("/~before", undefined, true).returns(oFixture.resolvedBeforePath);
        assert.strictEqual(ODataModel.prototype._getResourcePath.call(oModel, true, "~sDeepPath", "~sPath", "~oContext"), oFixture.result);
    });
});
[{
        bAsync: true,
        oData: "{object} oData",
        sETag: "~etag",
        mHeaders: {},
        sMessageScope: MessageScope.Request,
        sMethod: "GET",
        sUrl: "~url",
        oExpected: {
            bAsync: true,
            sMethod: "GET",
            bUpdateAggregatedMessages: false,
            bUseOData: true
        }
    }, {
        bAsync: undefined,
        mHeaders: { "Content-Type": "~contenttype" },
        sMessageScope: MessageScope.BusinessObject,
        sMethod: "MERGE",
        sUrl: "~url",
        bUseBatch: true,
        bWithCredentials: "{boolean} bWithCredentials",
        oExpected: {
            mAdditionalHeaders: {
                "sap-message-scope": MessageScope.BusinessObject
            },
            bAsync: true,
            sMethod: "MERGE",
            bUpdateAggregatedMessages: true,
            bUseCredentials: true,
            bUseGeneratedUID: true
        }
    }, {
        bAsync: undefined,
        mHeaders: { "Foo": "bar" },
        bJSON: true,
        sMessageScope: MessageScope.BusinessObject,
        sMethod: "MERGE",
        sUrl: "~url",
        bWithCredentials: "{boolean} bWithCredentials",
        oExpected: {
            mAdditionalHeaders: {
                "Content-Type": "application/json",
                "sap-message-scope": MessageScope.BusinessObject,
                "x-http-method": "MERGE"
            },
            bAsync: true,
            sMethod: "POST",
            bUpdateAggregatedMessages: true,
            bUseCredentials: true
        }
    }, {
        bAsync: false,
        sETag: "~etag",
        mHeaders: { "Foo": "bar" },
        sMethod: "~method",
        sUrl: "~url/$count",
        oExpected: {
            mAdditionalHeaders: {
                "Accept": "text/plain, */*;q=0.5",
                "Content-Type": "application/atom+xml",
                "If-Match": "~etag"
            },
            bAsync: false,
            sMethod: "~method",
            bUpdateAggregatedMessages: false
        }
    }, {
        bAsync: false,
        sETag: "~etag",
        mHeaders: { "Foo": "bar" },
        sMethod: "DELETE",
        sUrl: "~url",
        oExpected: {
            mAdditionalHeaders: {
                "If-Match": "~etag"
            },
            bAsync: false,
            sMethod: "DELETE",
            bUpdateAggregatedMessages: false
        }
    }].forEach(function (oFixture, i) {
    [true, false].forEach(function (bUpdateAggregatedMessages) {
        [true, false].forEach(function (bIsMessageScopeSupported) {
            var sTitle = "_createRequest: " + i + ", bIsMessageScopeSupported: " + bIsMessageScopeSupported + ", bUpdateAggregatedMessages: " + bUpdateAggregatedMessages;
            QUnit.test(sTitle, function (assert) {
                var mExpectedHeaders = Object.assign({}, oFixture.mHeaders, oFixture.oExpected.mAdditionalHeaders), oModel = {
                    _createRequestID: function () { },
                    bIsMessageScopeSupported: bIsMessageScopeSupported,
                    bJSON: oFixture.bJSON,
                    sMessageScope: oFixture.sMessageScope,
                    sPassword: "~password",
                    sServiceUrl: "~serviceUrl",
                    bUseBatch: oFixture.bUseBatch,
                    sUser: "~user",
                    bWithCredentials: oFixture.bWithCredentials
                }, oRequest, sRequestID = "~uid", oExpectedResult = {
                    async: oFixture.oExpected.bAsync,
                    deepPath: "~deepPath",
                    headers: mExpectedHeaders,
                    method: oFixture.oExpected.sMethod,
                    password: "~password",
                    requestID: sRequestID,
                    requestUri: oFixture.sUrl,
                    updateAggregatedMessages: bUpdateAggregatedMessages && bIsMessageScopeSupported ? oFixture.oExpected.bUpdateAggregatedMessages : false,
                    user: "~user"
                };
                if (oFixture.sMessageScope === MessageScope.BusinessObject && !bIsMessageScopeSupported) {
                    this.oLogMock.expects("error").withExactArgs("Message scope 'sap.ui.model.odata.MessageScope.BusinessObject' is" + " not supported by the service: ~serviceUrl", undefined, "sap.ui.model.odata.v2.ODataModel");
                }
                this.mock(oModel).expects("_createRequestID").withExactArgs().returns(sRequestID);
                if (oFixture.oExpected.bUseOData) {
                    oExpectedResult.data = oFixture.oData;
                }
                if (oFixture.oExpected.bUseCredentials) {
                    oExpectedResult.withCredentials = oFixture.bWithCredentials;
                }
                oRequest = ODataModel.prototype._createRequest.call(oModel, oFixture.sUrl, "~deepPath", oFixture.sMethod, oFixture.mHeaders, oFixture.oData, oFixture.sETag, oFixture.bAsync, bUpdateAggregatedMessages);
                if (oFixture.oExpected.bUseGeneratedUID) {
                    assert.ok(oRequest.headers["Content-ID"].startsWith("id-"));
                    delete oRequest.headers["Content-ID"];
                }
                assert.deepEqual(oRequest, oExpectedResult);
            });
        });
    });
});
[{
        headers: {},
        method: "DELETE",
        useGeneratedUID: true
    }, {
        headers: {},
        method: "MERGE",
        useGeneratedUID: true
    }, {
        headers: {},
        method: "POST",
        useGeneratedUID: true
    }, {
        headers: { "Content-ID": "id-1234-123" },
        method: "MERGE",
        useGeneratedUID: false
    }, {
        headers: { "Content-ID": "foo" },
        method: "POST",
        useGeneratedUID: false
    }].forEach(function (oFixture) {
    QUnit.test("_createRequest: using ContentID; " + JSON.stringify(oFixture), function (assert) {
        var oModel = {
            bUseBatch: true,
            _createRequestID: function () { }
        }, oRequest;
        this.mock(oModel).expects("_createRequestID").withExactArgs().returns("~requestID");
        oRequest = ODataModel.prototype._createRequest.call(oModel, "~sUrl", "~sDeepPath", oFixture.method, Object.assign({}, oFixture.headers));
        if (oFixture.useGeneratedUID) {
            assert.ok(oRequest.headers["Content-ID"].startsWith("id-"));
        }
        else {
            assert.strictEqual(oRequest.headers["Content-ID"], oFixture.headers["Content-ID"]);
        }
    });
});
[
    { method: "GET", useBatch: true },
    { method: "HEAD", useBatch: true },
    { method: "DELETE", useBatch: false },
    { method: "HEAD", useBatch: false },
    { method: "GET", useBatch: false },
    { method: "MERGE", useBatch: false },
    { method: "POST", useBatch: false }
].forEach(function (oFixture) {
    QUnit.test("_createRequest: no ContentID; " + JSON.stringify(oFixture), function (assert) {
        var oModel = {
            bUseBatch: oFixture.useBatch,
            _createRequestID: function () { }
        }, oRequest;
        this.mock(oModel).expects("_createRequestID").withExactArgs().returns("~requestID");
        oRequest = ODataModel.prototype._createRequest.call(oModel, "~sUrl", "~sDeepPath", oFixture.method, {});
        assert.notOk("Content-ID" in oRequest.headers);
    });
});
[true, false].forEach(function (bBatch) {
    QUnit.test("_processAborted: calls _createAbortedError, batch = " + bBatch, function (assert) {
        var oEventInfo = {}, oModel = {
            _createEventInfo: function () { },
            _decreaseDeferredRequestCount: function () { },
            decreaseLaundering: function () { },
            fireBatchRequestCompleted: function () { },
            fireRequestCompleted: function () { },
            getKey: function () { }
        }, oModelMock = this.mock(oModel), oRequest = { data: "~data" };
        oModelMock.expects("getKey").withExactArgs("~data").exactly(bBatch ? 0 : 1).returns("~sKey");
        oModelMock.expects("decreaseLaundering").withExactArgs("/~sKey", "~data").exactly(bBatch ? 0 : 1);
        oModelMock.expects("_decreaseDeferredRequestCount").withExactArgs(sinon.match.same(oRequest)).exactly(bBatch ? 0 : 1);
        this.mock(ODataModel).expects("_createAbortedError").withExactArgs().returns("~oError");
        oModelMock.expects("_createEventInfo").withExactArgs(sinon.match.same(oRequest), "~oError").returns(oEventInfo);
        oModelMock.expects("fireBatchRequestCompleted").withExactArgs(sinon.match.same(oEventInfo).and(sinon.match.has("success", false))).exactly(bBatch ? 1 : 0);
        oModelMock.expects("fireRequestCompleted").withExactArgs(sinon.match.same(oEventInfo).and(sinon.match.has("success", false))).exactly(bBatch ? 0 : 1);
        ODataModel.prototype._processAborted.call(oModel, oRequest, {}, bBatch);
    });
});
QUnit.test("_processChange: ", function (assert) {
    var oData = { __metadata: { etag: "~changedETag" } }, sDeepPath = "~deepPath", sETag = "~etag", mHeaders = "~headers", sKey = "~key", oModel = {
        _createRequest: function () { },
        _createRequestUrl: function () { },
        _getEntity: function () { },
        _getHeaders: function () { },
        _getObject: function () { },
        _removeReferences: function () { },
        getETag: function () { },
        mChangedEntities: {},
        oMetadata: {
            _getEntityTypeByPath: function () { },
            _getNavigationPropertyNames: function () { }
        },
        sServiceUrl: "~serviceUrl",
        bUseBatch: "~useBatch"
    }, oPayload = "~payload", oRequest = { requestUri: "~requestUri" }, oResult, sUpdateMethod, sUrl = "~url";
    this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs(sKey).returns("~oEntityType");
    this.mock(oModel).expects("_getObject").withExactArgs("/~key", true).returns({});
    this.mock(oModel).expects("_getEntity").withExactArgs(sKey).returns({ __metadata: { etag: "~internalETag" } });
    this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames").withExactArgs("~oEntityType").returns([]);
    this.mock(oModel).expects("_removeReferences").withExactArgs(sinon.match(function (oPayload0) {
        assert.strictEqual(oPayload0.__metadata.etag, "~internalETag");
        return true;
    })).returns(oPayload);
    this.mock(oModel).expects("_getHeaders").withExactArgs().returns(mHeaders);
    this.mock(oModel).expects("getETag").withExactArgs(oPayload).returns(sETag);
    this.mock(oModel).expects("_createRequestUrl").withExactArgs("/~key", null, undefined, "~useBatch").returns(sUrl);
    this.mock(oModel).expects("_createRequest").withExactArgs(sUrl, sDeepPath, "MERGE", mHeaders, oPayload, sETag, undefined, true).returns(oRequest);
    oResult = ODataModel.prototype._processChange.call(oModel, sKey, oData, sUpdateMethod, sDeepPath);
    assert.strictEqual(oResult, oRequest);
    assert.deepEqual(oResult, { requestUri: "~requestUri" });
});
QUnit.test("_processRequest: calls _createAbortedError on abort", function (assert) {
    var fnError = sinon.stub(), oModel = {
        oMetadata: {
            loaded: function () { }
        }
    }, oRequestHandle;
    this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns({ then: function () { } });
    oRequestHandle = ODataModel.prototype._processRequest.call(oModel, "~fnProcessRequest", fnError, false);
    assert.strictEqual(fnError.called, false);
    this.mock(ODataModel).expects("_createAbortedError").withExactArgs().returns("~oError");
    oRequestHandle.abort();
    assert.ok(fnError.calledOnceWithExactly("~oError"));
});
QUnit.test("_writePathCache", function (assert) {
    var oModel = {
        mPathCache: {}
    }, _writePathCache = ODataModel.prototype._writePathCache;
    _writePathCache.call(oModel, "", "");
    assert.deepEqual(oModel.mPathCache, {});
    _writePathCache.call(oModel, "/Path", "");
    assert.deepEqual(oModel.mPathCache, {});
    _writePathCache.call(oModel, "", "/Canonical");
    assert.deepEqual(oModel.mPathCache, {});
    _writePathCache.call(oModel, "/Deep/Path", "/Canonical");
    assert.deepEqual(oModel.mPathCache, { "/Deep/Path": { canonicalPath: "/Canonical" } });
    _writePathCache.call(oModel, "/Deep/Path", "/OtherCanonical");
    assert.deepEqual(oModel.mPathCache, { "/Deep/Path": { canonicalPath: "/OtherCanonical" } });
    _writePathCache.call(oModel, "/Deep/Path2", "/Canonical2");
    assert.deepEqual(oModel.mPathCache, {
        "/Deep/Path": { canonicalPath: "/OtherCanonical" },
        "/Deep/Path2": { canonicalPath: "/Canonical2" }
    });
    _writePathCache.call(oModel, "/Canonical1", "/Canonical2");
    assert.deepEqual(oModel.mPathCache, {
        "/Deep/Path": { canonicalPath: "/OtherCanonical" },
        "/Deep/Path2": { canonicalPath: "/Canonical2" },
        "/Canonical1": { canonicalPath: "/Canonical1" }
    });
    _writePathCache.call(oModel, "/FunctionImport", "/Canonical", true);
    assert.deepEqual(oModel.mPathCache, {
        "/Deep/Path": { canonicalPath: "/OtherCanonical" },
        "/Deep/Path2": { canonicalPath: "/Canonical2" },
        "/Canonical1": { canonicalPath: "/Canonical1" },
        "/FunctionImport": { canonicalPath: "/Canonical" }
    });
});
QUnit.test("_writePathCache, bUpdateShortenedPaths", function (assert) {
    var oModel = {
        mPathCache: {
            "/Set(42)/toA": { canonicalPath: "/A(1)" },
            "/Set(42)/toA/toB": { canonicalPath: "/B(2)" },
            "/A(1)/toB": { canonicalPath: "/B(2)" }
        }
    };
    ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB", "/B(77)", undefined, true);
    assert.deepEqual(oModel.mPathCache, {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB": { canonicalPath: "/B(77)" },
        "/A(1)/toB": { canonicalPath: "/B(77)" }
    });
    oModel.mPathCache = {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB": { canonicalPath: "/B(2)" },
        "/Set(42)/toA/toB/toC": { canonicalPath: "/C(3)" },
        "/A(1)/toB/toC": { canonicalPath: "/C(3)" },
        "/B(2)/toC": { canonicalPath: "/C(3)" }
    };
    ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB/toC", "/C(77)", undefined, true);
    assert.deepEqual(oModel.mPathCache, {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB": { canonicalPath: "/B(2)" },
        "/Set(42)/toA/toB/toC": { canonicalPath: "/C(77)" },
        "/A(1)/toB/toC": { canonicalPath: "/C(77)" },
        "/B(2)/toC": { canonicalPath: "/C(77)" }
    });
    oModel.mPathCache = {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB": { canonicalPath: "/B(2)" },
        "/Set(42)/toA/toB/toC": { canonicalPath: "/C(3)" },
        "/A(1)/toB/toC": { canonicalPath: "/C(3)" }
    };
    ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB/toC", "/C(77)", undefined, true);
    assert.deepEqual(oModel.mPathCache, {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB": { canonicalPath: "/B(2)" },
        "/Set(42)/toA/toB/toC": { canonicalPath: "/C(77)" },
        "/A(1)/toB/toC": { canonicalPath: "/C(77)" }
    });
    oModel.mPathCache = {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB/toC": { canonicalPath: "/C(3)" },
        "/A(1)/toB/toC": { canonicalPath: "/C(3)" }
    };
    ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB/toC", "/C(77)", undefined, true);
    assert.deepEqual(oModel.mPathCache, {
        "/Set(42)/toA": { canonicalPath: "/A(1)" },
        "/Set(42)/toA/toB/toC": { canonicalPath: "/C(77)" },
        "/A(1)/toB/toC": { canonicalPath: "/C(77)" }
    });
});
[undefined, "/canonicalParent/toChild"].forEach(function (sPathFromCanonicalParent, i) {
    QUnit.test("_importData for function import, " + i, function (assert) {
        var mChangedEntities = {}, oData = {}, oModel = {
            _getEntity: function () { },
            _getKey: function () { },
            hasContext: function () { },
            resolveFromCache: function () { },
            _updateChangedEntities: function () { },
            _writePathCache: function () { }
        }, oModelMock = this.mock(oModel);
        oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
        oModelMock.expects("_getEntity").withExactArgs("key").returns("entry");
        oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
        oModelMock.expects("_updateChangedEntities").withExactArgs({ key: "entry" });
        oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("/key");
        oModelMock.expects("_writePathCache").withExactArgs("/key", "/key", "bFunctionImport");
        oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", "bFunctionImport");
        oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport", true);
        if (sPathFromCanonicalParent) {
            oModelMock.expects("_writePathCache").withExactArgs(sPathFromCanonicalParent, "/key", "bFunctionImport");
        }
        ODataModel.prototype._importData.call(oModel, oData, mChangedEntities, undefined, "sPath", "sDeepPath", undefined, "bFunctionImport", sPathFromCanonicalParent);
        assert.ok(mChangedEntities["key"]);
    });
});
QUnit.test("_importData for data with 0..1 navigation properties", function (assert) {
    var mChangedEntities = {}, oData = {
        n0: {
            __metadata: {
                uri: "uri0"
            }
        }
    }, oEntry = {}, oModel = {
        _getEntity: function () { },
        _getKey: function () { },
        hasContext: function () { },
        _importData: ODataModel.prototype._importData,
        resolveFromCache: function () { },
        _updateChangedEntities: function () { },
        _writePathCache: function () { }
    }, oModelMock = this.mock(oModel);
    oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
    oModelMock.expects("_getEntity").withExactArgs("key").returns(oEntry);
    oModelMock.expects("_importData").withExactArgs(sinon.match.same(oData), sinon.match.same(mChangedEntities), "oResponse", "sPath", "sDeepPath", undefined, "bFunctionImport").callThrough();
    oModelMock.expects("_importData").withExactArgs(sinon.match.same(oData.n0), sinon.match.same(mChangedEntities), "oResponse", "sPath/n0", "sDeepPath/n0", undefined, false, "/key/n0").returns("oResult");
    oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
    oModelMock.expects("_updateChangedEntities").withExactArgs({ key: sinon.match.same(oEntry) });
    oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("/key");
    oModelMock.expects("_writePathCache").withExactArgs("/key", "/key", "bFunctionImport");
    oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", "bFunctionImport");
    oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport", true);
    oModel._importData(oData, mChangedEntities, "oResponse", "sPath", "sDeepPath", undefined, "bFunctionImport");
    assert.strictEqual(oEntry.n0.__ref, "oResult");
    assert.ok(mChangedEntities["key"]);
});
["requestKey", undefined].forEach(function (sRequestKey) {
    [
        { entityType: "entityType", isFunction: "isFunction" },
        undefined
    ].forEach(function (oEntityType) {
        ["POST", "GET"].forEach(function (sMethod) {
            var sTitle = "_processSuccess for function import: method=" + sMethod + ", key=" + sRequestKey + ", " + (oEntityType ? "with" : "without") + " entity type";
            QUnit.test(sTitle, function (assert) {
                var mEntityTypes = {}, aRequests = [], oModel = {
                    mChangedEntities: {},
                    _createEventInfo: function () { },
                    _decreaseDeferredRequestCount: function () { },
                    decreaseLaundering: function () { },
                    fireRequestCompleted: function () { },
                    _getEntity: function () { },
                    _importData: function () { },
                    oMetadata: {
                        _getEntityTypeByPath: function () { }
                    },
                    _normalizePath: function () { },
                    _parseResponse: function () { },
                    _removeEntity: function () { },
                    sServiceUrl: "/service/",
                    _updateETag: function () { }
                }, oModelMock = this.mock(oModel), oRequest = {
                    data: "requestData",
                    deepPath: "deepPath",
                    functionTarget: "functionTarget",
                    functionMetadata: "functionMetadata",
                    key: sRequestKey,
                    method: sMethod,
                    requestUri: "/service/path"
                }, oResponse = {
                    data: {
                        _metadata: {}
                    },
                    _imported: false,
                    statusCode: 200
                }, bSuccess;
                if (sRequestKey) {
                    oModel.mChangedEntities[sRequestKey] = "~functionParameterObject";
                }
                oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath");
                this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("normalizedPath").returns(oEntityType);
                oModelMock.expects("_normalizePath").withExactArgs("/path", undefined, !oEntityType).returns("normalizedCannonicalPath");
                oModelMock.expects("decreaseLaundering").withExactArgs("normalizedCannonicalPath", "requestData");
                oModelMock.expects("_decreaseDeferredRequestCount").withExactArgs(sinon.match.same(oRequest));
                if (sRequestKey) {
                    oModelMock.expects("_importData").withExactArgs(oResponse.data, {}, oResponse, undefined, undefined, undefined, oEntityType && "isFunction");
                }
                else {
                    oModelMock.expects("_importData").withExactArgs(oResponse.data, {}, oResponse, "normalizedCannonicalPath", "functionTarget", undefined, oEntityType && "isFunction");
                }
                oModelMock.expects("_getEntity").withExactArgs(sRequestKey).returns({ __metadata: {} });
                oModelMock.expects("_removeEntity").withExactArgs(sRequestKey).never();
                oModelMock.expects("_parseResponse").withExactArgs(oResponse, oRequest, {}, {});
                oModelMock.expects("_updateETag").withExactArgs(oRequest, oResponse);
                oModelMock.expects("_createEventInfo").withExactArgs(oRequest, oResponse, aRequests).returns("oEventInfo");
                oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");
                bSuccess = ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse, undefined, {}, {}, mEntityTypes, false, aRequests);
                assert.strictEqual(bSuccess, true);
                assert.deepEqual(mEntityTypes, oEntityType ? { entityType: true } : {});
                assert.strictEqual(oModel.mChangedEntities[sRequestKey], undefined);
            });
        });
    });
});
[{
        functionMetadata: false,
        headers: { location: "/service/new/function/target" },
        result: {
            deepPath: "/deep/path",
            functionTarget: "/function/target"
        }
    }, {
        functionMetadata: true,
        headers: undefined,
        result: {
            deepPath: "/function/target",
            functionTarget: "/function/target"
        }
    }, {
        functionMetadata: true,
        headers: {},
        result: {
            deepPath: "/function/target",
            functionTarget: "/function/target"
        }
    }, {
        functionMetadata: true,
        headers: { location: "/service/new/function/target" },
        result: {
            deepPath: "/new/function/target",
            functionTarget: "/new/function/target"
        }
    }, {
        functionMetadata: true,
        headers: { location: "/http/service/new/function/target" },
        result: {
            deepPath: "/new/function/target",
            functionTarget: "/new/function/target"
        }
    }, {
        getDeepPathForCanonicalPath: {
            inputParam: "/function/target",
            result: undefined
        },
        functionMetadata: true,
        headers: { location: "/service/function/target" },
        result: {
            deepPath: "/function/target",
            functionTarget: "/function/target"
        }
    }, {
        getDeepPathForCanonicalPath: {
            inputParam: "/function/target",
            result: "/new/deep/path"
        },
        functionMetadata: true,
        headers: { location: "/service/function/target" },
        result: {
            deepPath: "/new/deep/path",
            functionTarget: "/function/target"
        }
    }, {
        functionMetadata: true,
        headers: { location: "/otherservice/function/target" },
        result: {
            deepPath: "/function/target",
            functionTarget: "/function/target"
        }
    }, {
        adjustDeepPath: {
            inputDeepPath: "/function/target",
            mock: function () { }
        },
        functionMetadata: true,
        headers: undefined,
        result: {
            deepPath: "/correct/deep/path",
            functionTarget: "/function/target"
        }
    }, {
        adjustDeepPath: {
            inputDeepPath: "/different/function/target",
            mock: function () { }
        },
        contentID2KeyAndDeepPath: {},
        functionMetadata: true,
        headers: { location: "/service/different/function/target" },
        result: {
            deepPath: "/correct/deep/path",
            functionTarget: "/different/function/target"
        }
    }, {
        adjustDeepPath: {
            inputDeepPath: "/new/deep/path",
            mock: function () { }
        },
        contentID: "~contentID",
        contentID2KeyAndDeepPath: {
            "~contentID": {
                deepPath: "~oldDeepPath",
                key: "~key"
            }
        },
        getDeepPathForCanonicalPath: {
            inputParam: "/function/target",
            result: "/new/deep/path"
        },
        functionMetadata: true,
        headers: { location: "/service/function/target" },
        result: {
            deepPath: "/correct/deep/path",
            functionTarget: "/function/target"
        }
    }].forEach(function (oFixture, i) {
    var sTitle = "_processSuccess for function import: update deepPath/functionTarget, " + i;
    QUnit.test(sTitle, function (assert) {
        var oModel = {
            oMetadata: {
                _getEntityTypeByPath: function () { }
            },
            sServiceUrl: "/service",
            _createEventInfo: function () { },
            _decreaseDeferredRequestCount: function () { },
            _getEntity: function () { },
            _normalizePath: function () { },
            _parseResponse: function () { },
            _updateETag: function () { },
            decreaseLaundering: function () { },
            fireRequestCompleted: function () { },
            getDeepPathForCanonicalPath: function () { }
        }, oModelMock = this.mock(oModel), mParameters, oRequest = {
            adjustDeepPath: oFixture.adjustDeepPath && oFixture.adjustDeepPath.mock,
            contentID: oFixture.contentID,
            data: "requestData",
            deepPath: "/deep/path",
            functionMetadata: oFixture.functionMetadata,
            functionTarget: "/function/target",
            requestUri: "/service/path"
        }, oResponse = {
            data: {
                _metadata: {}
            },
            headers: oFixture.headers,
            _imported: true
        };
        oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath0");
        this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("normalizedPath0").returns("isFunction");
        oModelMock.expects("_normalizePath").withExactArgs("/path", undefined, true).returns("normalizedPath1");
        oModelMock.expects("decreaseLaundering").withExactArgs("normalizedPath1", "requestData");
        oModelMock.expects("_decreaseDeferredRequestCount").withExactArgs(sinon.match.same(oRequest));
        if (oFixture.getDeepPathForCanonicalPath) {
            oModelMock.expects("getDeepPathForCanonicalPath").withExactArgs(oFixture.getDeepPathForCanonicalPath.inputParam).returns(oFixture.getDeepPathForCanonicalPath.result);
        }
        if (oFixture.adjustDeepPath) {
            this.mock(oRequest).expects("adjustDeepPath").withExactArgs(sinon.match(function (mParameters0) {
                mParameters = mParameters0;
                return true;
            })).returns("/correct/deep/path");
        }
        oModelMock.expects("_getEntity").withExactArgs(undefined).returns({ __metadata: {} });
        oModelMock.expects("_parseResponse").withExactArgs(oResponse, oRequest, {}, {});
        oModelMock.expects("_updateETag").withExactArgs(oRequest, oResponse);
        oModelMock.expects("_createEventInfo").withExactArgs(oRequest, oResponse, "aRequests").returns("oEventInfo");
        oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");
        ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse, undefined, {}, {}, {}, false, "aRequests", oFixture.contentID2KeyAndDeepPath);
        assert.strictEqual(oRequest.deepPath, oFixture.result.deepPath);
        assert.strictEqual(oRequest.functionTarget, oFixture.result.functionTarget);
        if (oFixture.adjustDeepPath) {
            assert.strictEqual(mParameters.deepPath, oFixture.adjustDeepPath.inputDeepPath);
            assert.deepEqual(mParameters.response, oResponse);
            assert.notStrictEqual(mParameters.response, oResponse);
            mParameters.response.data.foo = "bar";
            assert.notDeepEqual(mParameters.response, oResponse);
        }
        if (oFixture.contentID) {
            assert.deepEqual(oFixture.contentID2KeyAndDeepPath, {
                "~contentID": {
                    deepPath: oFixture.result.deepPath,
                    key: "~key"
                }
            });
        }
    });
});
[{
        created: false,
        deepPath: "/entity",
        resultDeepPath: "/entity"
    }, {
        created: true,
        deepPath: "/entity",
        resultDeepPath: "/entity"
    }, {
        created: false,
        deepPath: "/entity(id-0-0)",
        resultDeepPath: "/entity(id-0-0)"
    }, {
        created: true,
        deepPath: "/collection(id-0-0)",
        responseEntityKey: "~responseEntity(~newKey)",
        resultDeepPath: "/collection(~newKey)"
    }, {
        created: true,
        deepPath: "/entity(1)/collection(id-0-0)",
        responseEntityKey: "~responseEntity(~newKey)",
        resultDeepPath: "/entity(1)/collection(~newKey)"
    }, {
        created: true,
        deepPath: "/collection(id-0-0)",
        responseEntityKey: "~responseEntity('A(0)')",
        resultDeepPath: "/collection('A(0)')"
    }].forEach(function (oFixture, i) {
    QUnit.test("_processSuccess for createEntry; " + i, function (assert) {
        var oContext = {
            isTransient: function () { },
            setUpdated: function () { }
        }, oModel = {
            oData: {},
            oMetadata: {
                _getEntityTypeByPath: function () { }
            },
            sServiceUrl: "/service",
            _createEventInfo: function () { },
            _decreaseDeferredRequestCount: function () { },
            _getEntity: function () { },
            _getKey: function () { },
            _normalizePath: function () { },
            _parseResponse: function () { },
            _removeEntity: function () { },
            _updateContext: function () { },
            _updateETag: function () { },
            callAfterUpdate: function () { },
            decreaseLaundering: function () { },
            fireRequestCompleted: function () { },
            getContext: function () { }
        }, oMetadataMock = this.mock(oModel.oMetadata), oModelMock = this.mock(oModel), oRequest = {
            created: true,
            data: "requestData",
            deepPath: oFixture.deepPath,
            key: "key('id-0-0')",
            method: "POST",
            requestUri: "/service/path"
        }, oResponse = {
            data: {},
            _imported: true,
            statusCode: 201
        };
        oModelMock.expects("_normalizePath").withExactArgs("/path").returns("~sNormalizedPath");
        oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~sNormalizedPath").returns("~oEntityType");
        oModelMock.expects("_normalizePath").withExactArgs("/path", undefined, true).returns("~sPath");
        oModelMock.expects("decreaseLaundering").withExactArgs("~sPath", "requestData");
        oModelMock.expects("_decreaseDeferredRequestCount").withExactArgs(sinon.match.same(oRequest));
        oModelMock.expects("_getEntity").withExactArgs("key('id-0-0')").returns({ __metadata: {} });
        oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oResponse.data)).returns(oFixture.responseEntityKey);
        oModelMock.expects("getContext").withExactArgs("/key('id-0-0')").returns(oContext);
        this.mock(oContext).expects("isTransient").withExactArgs().returns(oFixture.created);
        oModelMock.expects("_updateContext").withExactArgs(sinon.match.same(oContext), "/" + oFixture.responseEntityKey, oFixture.resultDeepPath);
        this.mock(oContext).expects("setUpdated").withExactArgs(true);
        oModelMock.expects("callAfterUpdate").withExactArgs(sinon.match.func);
        oModelMock.expects("_getEntity").withExactArgs(oFixture.responseEntityKey).returns({ __metadata: {} });
        oModelMock.expects("_removeEntity").withExactArgs("key('id-0-0')");
        oModelMock.expects("_parseResponse").withExactArgs(sinon.match.same(oResponse), sinon.match.same(oRequest), {}, {});
        oModelMock.expects("_updateETag").withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse));
        oModelMock.expects("_createEventInfo").withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse), "~aRequests").returns("~oEventInfo");
        oModelMock.expects("fireRequestCompleted").withExactArgs("~oEventInfo");
        ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse, undefined, {}, {}, {}, false, "~aRequests");
        assert.strictEqual(oRequest.deepPath, oFixture.resultDeepPath);
    });
});
QUnit.test("removeInternalMetadata", function (assert) {
    var oEntityData, oModel = {}, oModelPrototypeMock = this.mock(ODataModel.prototype), oResult;
    oResult = ODataModel.prototype.removeInternalMetadata.call(oModel);
    assert.deepEqual(oResult, { created: undefined, deepPath: undefined, invalid: undefined });
    oEntityData = {};
    oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);
    assert.deepEqual(oEntityData, {});
    assert.deepEqual(oResult, { created: undefined, deepPath: undefined, invalid: undefined });
    oEntityData = {
        p: "p",
        __metadata: {
            uri: "uri",
            created: "created",
            deepPath: "deepPath",
            invalid: "invalid"
        }
    };
    oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);
    assert.deepEqual(oEntityData, { p: "p", __metadata: { uri: "uri" } });
    assert.deepEqual(oResult, {
        created: "created",
        deepPath: "deepPath",
        invalid: "invalid"
    });
    oEntityData = {
        p: "p",
        __metadata: {
            uri: "uri",
            created: "created",
            deepPath: "deepPath",
            invalid: "invalid"
        },
        n: {
            p2: "p2",
            __metadata: {
                uri: "uri2",
                created: "created2",
                deepPath: "deepPath2",
                invalid: "invalid2"
            }
        }
    };
    oModelPrototypeMock.expects("removeInternalMetadata").withExactArgs(sinon.match.same(oEntityData)).callThrough();
    oModelPrototypeMock.expects("removeInternalMetadata").withArgs(sinon.match.same(oEntityData.__metadata)).callThrough();
    oModelPrototypeMock.expects("removeInternalMetadata").withArgs(sinon.match.same(oEntityData.n)).callThrough();
    oModelPrototypeMock.expects("removeInternalMetadata").withArgs(sinon.match.same(oEntityData.n.__metadata)).callThrough();
    oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);
    assert.deepEqual(oEntityData, {
        p: "p",
        __metadata: { uri: "uri" },
        n: {
            p2: "p2",
            __metadata: { uri: "uri2" }
        }
    });
    assert.deepEqual(oResult, {
        created: "created",
        deepPath: "deepPath",
        invalid: "invalid"
    });
    oEntityData = {
        p: "p",
        __metadata: {
            uri: "uri",
            created: "created",
            deepPath: "deepPath",
            invalid: "invalid"
        },
        n: [{
                p2: "p2",
                __metadata: {
                    uri: "uri2",
                    created: "created2",
                    deepPath: "deepPath2",
                    invalid: "invalid2"
                }
            }]
    };
    oModelPrototypeMock.expects("removeInternalMetadata").withExactArgs(sinon.match.same(oEntityData)).callThrough();
    oModelPrototypeMock.expects("removeInternalMetadata").withArgs(sinon.match.same(oEntityData.__metadata)).callThrough();
    oModelPrototypeMock.expects("removeInternalMetadata").withArgs(sinon.match.same(oEntityData.n[0])).callThrough();
    oModelPrototypeMock.expects("removeInternalMetadata").withArgs(sinon.match.same(oEntityData.n[0].__metadata)).callThrough();
    oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);
    assert.deepEqual(oEntityData, {
        p: "p",
        __metadata: { uri: "uri" },
        n: [{
                p2: "p2",
                __metadata: { uri: "uri2" }
            }]
    });
    assert.deepEqual(oResult, {
        created: "created",
        deepPath: "deepPath",
        invalid: "invalid"
    });
});
QUnit.test("removeInternalMetadata, recursively", function (assert) {
    var oEntityData = {
        p: "p",
        n1: {
            p1: "p1",
            __metadata: {
                uri: "uri1",
                created: "created1",
                deepPath: "deepPath1",
                invalid: "invalid1"
            },
            x: {
                p4: "p4",
                n3: [{
                        p3: "p3",
                        __metadata: {
                            uri: "uri3",
                            created: "created3",
                            deepPath: "deepPath3",
                            invalid: "invalid3"
                        }
                    }]
            }
        },
        n2: [{
                p2: "p2",
                __metadata: {
                    uri: "uri2",
                    created: "created2",
                    deepPath: "deepPath2",
                    invalid: "invalid2"
                }
            }]
    }, oResult;
    oResult = ODataModel.prototype.removeInternalMetadata(oEntityData);
    assert.deepEqual(oEntityData, {
        p: "p",
        n1: {
            p1: "p1",
            __metadata: {
                uri: "uri1"
            },
            x: {
                p4: "p4",
                n3: [{
                        p3: "p3",
                        __metadata: {
                            uri: "uri3"
                        }
                    }]
            }
        },
        n2: [{
                p2: "p2",
                __metadata: {
                    uri: "uri2"
                }
            }]
    });
    assert.deepEqual(oResult, { created: undefined, deepPath: undefined, invalid: undefined });
});
QUnit.test("_processRequestQueue: call #removeInternalMetadata, non-$batch", function (assert) {
    var oModel = {
        bUseBatch: false,
        checkDataState: function () { },
        getKey: function () { },
        increaseLaundering: function () { },
        mLaunderingState: "launderingState",
        removeInternalMetadata: function () { },
        _submitSingleRequest: function () { }
    }, oModelMock = this.mock(oModel), mRequests = {
        undefined: {
            changes: {
                undefined: [{
                        parts: [{
                                request: {}
                            }],
                        request: {
                            data: "payload"
                        }
                    }]
            }
        }
    };
    oModelMock.expects("getKey").withExactArgs("payload").returns("path");
    oModelMock.expects("increaseLaundering").withExactArgs("/path", "payload").returns("path");
    oModelMock.expects("removeInternalMetadata").withExactArgs("payload");
    oModelMock.expects("_submitSingleRequest").withExactArgs(sinon.match.same(mRequests[undefined].changes[undefined][0]));
    oModelMock.expects("checkDataState").withExactArgs("launderingState");
    ODataModel.prototype._processRequestQueue.call(oModel, mRequests);
});
QUnit.test("getMessageScope/setMessageScope", function (assert) {
    var oModel = {};
    ODataModel.prototype.setMessageScope.call(oModel, MessageScope.RequestedObjects);
    assert.strictEqual(ODataModel.prototype.getMessageScope.call(oModel), MessageScope.RequestedObjects);
    ODataModel.prototype.setMessageScope.call(oModel, MessageScope.BusinessObject);
    assert.strictEqual(ODataModel.prototype.getMessageScope.call(oModel), MessageScope.BusinessObject);
    assert.throws(function () {
        ODataModel.prototype.setMessageScope.call(oModel, "Foo");
    }, new Error("Unsupported message scope: Foo"));
});
[{
        sFullTarget: "/foo",
        sPathPrefix: "",
        bResult: true
    }, {
        sFullTarget: "/foo",
        sPathPrefix: "/",
        bResult: true
    }, {
        sFullTarget: "/foo",
        sPathPrefix: "/f",
        bResult: false
    }, {
        sFullTarget: "/foo",
        sPathPrefix: "/foo",
        bResult: true
    }, {
        sFullTarget: "/foo(42)",
        sPathPrefix: "/foo",
        bResult: true
    }, {
        sFullTarget: "/foo/bar",
        sPathPrefix: "/foo",
        bResult: true
    }, {
        sFullTarget: "/foo",
        sPathPrefix: "/foo/bar",
        bResult: false
    }, {
        sFullTarget: "/foo",
        sPathPrefix: "/baz",
        bResult: false
    }].forEach(function (oFixture, i) {
    [false, true].forEach(function (bMulti) {
        QUnit.test("isMessageMatching, " + i + ", multi-target=" + bMulti, function (assert) {
            var vFullTarget = bMulti ? ["/xyz"].concat([oFixture.sFullTarget]) : oFixture.sFullTarget;
            assert.strictEqual(ODataModel.prototype.isMessageMatching.call({}, new Message({ fullTarget: vFullTarget }), oFixture.sPathPrefix), oFixture.bResult);
        });
    });
});
QUnit.test("filterMatchingMessages", function (assert) {
    var oMessage0 = "sap.ui.core.message.Message0", oMessage1 = "sap.ui.core.message.Message1", oMessage2 = "sap.ui.core.message.Message2", oModel = {
        mMessages: {
            "/foo": []
        },
        isMessageMatching: function () { }
    }, oModelMock = this.mock(oModel);
    oModelMock.expects("isMessageMatching").never();
    assert.deepEqual(ODataModel.prototype.filterMatchingMessages.call(oModel, "/foo", "/foo"), []);
    oModel.mMessages = {
        "/foo": [oMessage0, oMessage1, oMessage2]
    };
    oModelMock.expects("isMessageMatching").withExactArgs(oMessage0, "/").returns(true);
    oModelMock.expects("isMessageMatching").withExactArgs(oMessage1, "/").returns(false);
    oModelMock.expects("isMessageMatching").withExactArgs(oMessage2, "/").returns(true);
    assert.deepEqual(ODataModel.prototype.filterMatchingMessages.call(oModel, "/foo", "/"), [oMessage0, oMessage2]);
    oModelMock.expects("isMessageMatching").withExactArgs(oMessage0, "/baz").returns(false);
    oModelMock.expects("isMessageMatching").withExactArgs(oMessage1, "/baz").returns(false);
    oModelMock.expects("isMessageMatching").withExactArgs(oMessage2, "/baz").returns(false);
    assert.deepEqual(ODataModel.prototype.filterMatchingMessages.call(oModel, "/foo", "/baz"), []);
});
QUnit.test("getMessages", function (assert) {
    var oContext = { sDeepPath: "deepPath" }, aMessages = [], oModel = {
        getMessagesByPath: function () { }
    };
    this.mock(oModel).expects("getMessagesByPath").withExactArgs("deepPath", true).returns(aMessages);
    this.mock(aMessages).expects("sort").withExactArgs(Message.compare).returns(aMessages);
    assert.strictEqual(ODataModel.prototype.getMessages.call(oModel, oContext), aMessages);
});
[
    { iMessageCount: 200, iRowCount: 100 },
    { iMessageCount: 20, iRowCount: 30 },
    { iMessageCount: 5, iRowCount: 20 }
].forEach(function (oFixture) {
    var sTitle = "getMessages: Performance Test - simulate " + oFixture.iMessageCount + " messages for " + oFixture.iRowCount + " table rows";
    QUnit.skip(sTitle, function (assert) {
        var oContext = {
            sDeepPath: "deep(1)/path"
        }, i, oModel = {
            filterMatchingMessages: ODataModel.prototype.filterMatchingMessages,
            getMessagesByPath: Model.prototype.getMessagesByPath,
            isMessageMatching: ODataModel.prototype.isMessageMatching,
            mMessages: {}
        }, sPath;
        for (i = 0; i < oFixture.iMessageCount; i += 1) {
            sPath = "deep(" + i + ")/path";
            oModel.mMessages[sPath] = [{
                    fullTarget: sPath
                }];
        }
        repeatedTest(assert, function () {
            for (i = 0; i < oFixture.iRowCount; i += 1) {
                ODataModel.prototype.getMessages.call(oModel, oContext);
            }
        });
    });
});
QUnit.test("createBindingContext calls #read with updateAggregatedMessages and calls" + " callback with a V2 context", function (assert) {
    var fnCallBack = sinon.stub(), oModel = {
        createCustomParams: function () { },
        _getKey: function () { },
        _isCanonicalRequestNeeded: function () { },
        _isReloadNeeded: function () { },
        getContext: function () { },
        read: function () { },
        resolve: function () { },
        resolveDeep: function () { }
    }, oModelMock = this.mock(oModel), oReadExpectation;
    oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined).returns("~bCanonical");
    oModelMock.expects("resolve").withExactArgs("~path/ToZ", "~context", "~bCanonical").returns("~sResolvedPath");
    oModelMock.expects("resolveDeep").withExactArgs("~path/ToZ", "~context").returns("~sDeepPath");
    oModelMock.expects("createCustomParams").withExactArgs(undefined).returns(undefined);
    oReadExpectation = oModelMock.expects("read").withExactArgs("~path/ToZ", {
        canonicalRequest: "~bCanonical",
        context: "~context",
        error: sinon.match.func,
        groupId: undefined,
        success: sinon.match.func,
        updateAggregatedMessages: true,
        urlParameters: []
    });
    ODataModel.prototype.createBindingContext.call(oModel, "~path/ToZ", "~context", undefined, fnCallBack, true);
    oModelMock.expects("_getKey").withExactArgs("~oData").returns("~sKey");
    oModelMock.expects("getContext").withExactArgs("/~sKey", "~sDeepPath").returns("~v2.Context");
    oReadExpectation.args[0][1].success("~oData");
    assert.ok(fnCallBack.calledOnceWithExactly("~v2.Context"));
    fnCallBack.resetHistory();
    oModelMock.expects("_getKey").withExactArgs("~oData").returns(undefined);
    oModelMock.expects("getContext").never();
    oReadExpectation.args[0][1].success("~oData");
    assert.ok(fnCallBack.calledOnceWithExactly(null));
    fnCallBack.resetHistory();
    oReadExpectation.args[0][1].error({});
    assert.ok(fnCallBack.calledOnceWithExactly(null));
});
QUnit.test("createBindingContext: unresolved -> return null", function (assert) {
    var fnCallBack = sinon.stub(), oModel = {
        _isCanonicalRequestNeeded: function () { },
        resolve: function () { },
        resolveDeep: function () { }
    };
    this.mock(oModel).expects("_isCanonicalRequestNeeded").withExactArgs(undefined).returns(false);
    this.mock(oModel).expects("resolve").withExactArgs("~sPath", undefined, false).returns(undefined);
    this.mock(oModel).expects("resolveDeep").withExactArgs("~sPath", undefined).returns("~sDeepPath");
    assert.strictEqual(ODataModel.prototype.createBindingContext.call(oModel, "~sPath", undefined, undefined, fnCallBack, true), null);
    assert.ok(fnCallBack.calledOnceWithExactly(null));
});
QUnit.test("createBindingContext: resolved with createPreliminaryContext", function (assert) {
    var oModel = {
        _isCanonicalRequestNeeded: function () { },
        resolve: function () { },
        resolveDeep: function () { },
        getContext: function () { }
    }, oModelMock = this.mock(oModel);
    oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined).returns(false);
    oModelMock.expects("resolve").exactly(2).withExactArgs("~sPath", undefined, false).returns("/~sResolvedPath");
    oModelMock.expects("resolveDeep").withExactArgs("~sPath", undefined).returns("~sDeepPath");
    oModelMock.expects("getContext").withExactArgs("/~sResolvedPath", "~sDeepPath").returns("~v2.Context");
    assert.strictEqual(ODataModel.prototype.createBindingContext.call(oModel, "~sPath", undefined, {
        createPreliminaryContext: true
    }, undefined, true), "~v2.Context");
});
["/~sCanonicalPath", undefined].forEach(function (sCanonicalPath) {
    var sTitle = "createBindingContext: resolved without reload; returns V2 Context with" + " canonicalPath=" + sCanonicalPath;
    QUnit.test(sTitle, function (assert) {
        var fnCallBack = sinon.stub(), oExpectedContext = sCanonicalPath ? "~v2.Context" : null, oModel = {
            _isCanonicalRequestNeeded: function () { },
            resolve: function () { },
            resolveDeep: function () { },
            getContext: function () { }
        }, oModelMock = this.mock(oModel);
        oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined).returns(false);
        oModelMock.expects("resolve").withExactArgs("/~sPath", undefined, false).returns("/~sResolvedPath");
        oModelMock.expects("resolveDeep").withExactArgs("/~sPath", undefined).returns("~sDeepPath");
        oModelMock.expects("resolve").withExactArgs("/~sPath", undefined, true).returns(sCanonicalPath);
        oModelMock.expects("getContext").withExactArgs("/~sCanonicalPath", "~sDeepPath").exactly(sCanonicalPath ? 1 : 0).returns("~v2.Context");
        assert.strictEqual(ODataModel.prototype.createBindingContext.call(oModel, "/~sPath", undefined, undefined, fnCallBack, false), oExpectedContext);
        assert.ok(fnCallBack.calledOnceWithExactly(oExpectedContext));
    });
});
[false, true].forEach(function (bForceUpdate0, i) {
    [false, true].forEach(function (bForceUpdate1, j) {
        [{
                call0: { "/path/A": false, "/path/B": true },
                call1: { "/path/A": true, "/path/C": false },
                result: { "/path/A": true, "/path/B": true, "/path/C": false }
            }, {
                call0: { "/path/A": false, "/path/B": true },
                call1: undefined,
                result: { "/path/A": false, "/path/B": true }
            }, {
                call0: { "/path/A": false, "/path/B": true },
                call1: {},
                result: { "/path/A": false, "/path/B": true }
            }].forEach(function (oChangedEntities, k) {
            QUnit.test("checkUpdate async (" + i + ", " + j + ", " + k + ")", function (assert) {
                var done = assert.async(), bForceUpdate2 = bForceUpdate0 || bForceUpdate1, oModel = {
                    checkUpdate: function () { },
                    mChangedEntities4checkUpdate: {},
                    sUpdateTimer: null
                }, sUpdateTimer;
                this.mock(oModel).expects("checkUpdate").withExactArgs(bForceUpdate2, false, oChangedEntities.result).callsFake(function () {
                    done();
                });
                ODataModel.prototype.checkUpdate.call(oModel, bForceUpdate0, true, oChangedEntities.call0);
                sUpdateTimer = oModel.sUpdateTimer;
                assert.notStrictEqual(sUpdateTimer, null);
                ODataModel.prototype.checkUpdate.call(oModel, bForceUpdate1, true, oChangedEntities.call1);
                assert.strictEqual(oModel.sUpdateTimer, sUpdateTimer);
            });
        });
    });
});
[false, true].forEach(function (bForceUpdate, i) {
    QUnit.test("checkUpdate sync (" + i + ")", function (assert) {
        var oBinding = {
            checkUpdate: function () { }
        }, mChangedEntities = "changedEntities", oModel = {
            checkUpdate: function () { },
            getBindings: function () { },
            _processAfterUpdate: function () { },
            sUpdateTimer: "updateTimer",
            bForceUpdate: bForceUpdate,
            mChangedEntities4checkUpdate: "commulatedChangedEntities"
        };
        this.mock(window).expects("clearTimeout").withExactArgs("updateTimer");
        this.mock(oModel).expects("getBindings").returns([oBinding]);
        this.mock(oBinding).expects("checkUpdate").withExactArgs(bForceUpdate, mChangedEntities);
        this.mock(oModel).expects("_processAfterUpdate").withExactArgs();
        ODataModel.prototype.checkUpdate.call(oModel, bForceUpdate, false, mChangedEntities);
        assert.deepEqual(oModel.mChangedEntities4checkUpdate, {});
        assert.strictEqual(oModel.bForceUpdate, undefined);
        assert.strictEqual(oModel.sUpdateTimer, null);
    });
});
QUnit.test("checkUpdate: truthy bForceUpdate of async wins over later sync", function (assert) {
    var oBinding = {
        checkUpdate: function () { }
    }, oBindingMock = this.mock(oBinding), oModel = {
        _processAfterUpdate: function () { },
        getBindings: function () { },
        mChangedEntities4checkUpdate: {},
        sUpdateTimer: "updateTimer"
    }, oModelMock = this.mock(oModel), oWindowMock = this.mock(window);
    oWindowMock.expects("clearTimeout").never();
    oModelMock.expects("getBindings").never();
    oBindingMock.expects("checkUpdate").never();
    oModelMock.expects("_processAfterUpdate").never();
    ODataModel.prototype.checkUpdate.call(oModel, true, true);
    oWindowMock.expects("clearTimeout").withExactArgs(oModel.sUpdateTimer).callThrough();
    oModelMock.expects("getBindings").withExactArgs().returns([oBinding]);
    oBindingMock.expects("checkUpdate").withExactArgs(true, undefined);
    oModelMock.expects("_processAfterUpdate").withExactArgs();
    ODataModel.prototype.checkUpdate.call(oModel);
    assert.strictEqual(oModel.bForceUpdate, undefined);
    assert.strictEqual(oModel.sUpdateTimer, null);
});
["expandAfterCreateFailed", "expandAfterFunctionCallFailed"].forEach(function (sExpandAfter) {
    QUnit.test("_createEventInfo: " + sExpandAfter, function (assert) {
        var oEventInfo, oResponseHeaders = {}, oExpectedEventInfo = {
            ID: "~requestID",
            async: "~async",
            headers: "~requestHeader",
            method: "~method",
            response: {
                headers: oResponseHeaders,
                responseText: "~body",
                statusCode: 201,
                statusText: "~statusText"
            },
            success: true,
            url: "~requestUri"
        }, oModel = {}, oRequest = {
            async: "~async",
            headers: "~requestHeader",
            method: "~method",
            requestID: "~requestID",
            requestUri: "~requestUri"
        }, oResponse = {
            response: {
                body: "~body",
                headers: oResponseHeaders,
                statusCode: 201,
                statusText: "~statusText"
            }
        };
        oResponse.response[sExpandAfter] = true;
        oExpectedEventInfo.response[sExpandAfter] = true;
        oEventInfo = ODataModel.prototype._createEventInfo.call(oModel, oRequest, oResponse);
        assert.deepEqual(oEventInfo, oExpectedEventInfo);
        assert.strictEqual(oEventInfo.response.headers, oResponseHeaders);
    });
});
QUnit.test("_processChange: restore expandRequest", function (assert) {
    var oData = {
        __metadata: {
            created: {
                contentID: "~contentID",
                expandRequest: "~expandRequest",
                key: "~createdKey"
            }
        }
    }, oModel = {
        mChangedEntities: {
            "~sKey": { __metadata: { deepPath: "~deepPath" } }
        },
        oMetadata: {
            _getEntityTypeByPath: function () { },
            _getNavigationPropertyNames: function () { }
        },
        _createRequest: function () { },
        _createRequestUrl: function () { },
        _getHeaders: function () { },
        _getObject: function () { },
        _removeReferences: function () { },
        getETag: function () { }
    }, oRequest = {}, oResult;
    this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~sKey").returns("~oEntityType");
    this.mock(oModel).expects("_getObject").withExactArgs("/~sKey", true).returns({});
    this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames").withExactArgs("~oEntityType").returns([]);
    this.mock(oModel).expects("_removeReferences").withExactArgs({ __metadata: {} }).returns("~oPayload");
    this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
    this.mock(oModel).expects("getETag").withExactArgs("~oPayload").returns("~sETag");
    this.mock(oModel).expects("_createRequestUrl").withExactArgs("/~createdKey", null, undefined, undefined).returns("~sUrl");
    this.mock(oModel).expects("_createRequest").withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~oPayload", "~sETag", undefined, true).returns(oRequest);
    oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "POST");
    assert.deepEqual(oResult, {
        contentID: "~contentID",
        created: true,
        expandRequest: "~expandRequest"
    });
    assert.strictEqual(oResult, oRequest);
});
[undefined, "~functionMetadata"].forEach(function (sFunctionMetadata, i) {
    var sTitle = "_processChange: restore functionTarget for function imports; " + i;
    QUnit.test(sTitle, function (assert) {
        var oData = {
            __metadata: {
                created: {
                    functionImport: true,
                    functionMetadata: sFunctionMetadata,
                    key: "~createdKey"
                }
            }
        }, oModel = {
            mChangedEntities: {
                "~sKey": { __metadata: { deepPath: "~deepPath" } }
            },
            oMetadata: {
                _getCanonicalPathOfFunctionImport: function () { },
                _getEntityTypeByPath: function () { }
            },
            _createFunctionImportParameters: function () { },
            _createRequest: function () { },
            _createRequestUrl: function () { },
            _getHeaders: function () { },
            _getObject: function () { },
            _removeReferences: function () { },
            getETag: function () { }
        }, oRequest = {}, oResult;
        this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~sKey").returns("~oEntityType");
        this.mock(oModel).expects("_getObject").withExactArgs("/~sKey", true).returns({});
        this.mock(oModel).expects("_createFunctionImportParameters").withExactArgs("~createdKey", "POST", oData).returns("~urlParameters");
        this.mock(oModel).expects("_removeReferences").withExactArgs(undefined).returns("~payload");
        this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs("~urlParameters").returns("~aUrlParams");
        this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
        this.mock(oModel).expects("getETag").withExactArgs("~payload").returns("~sETag");
        this.mock(oModel).expects("_createRequestUrl").withExactArgs("/~createdKey", null, "~aUrlParams", undefined).returns("~sUrl");
        this.mock(oModel).expects("_createRequest").withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~payload", "~sETag", undefined, true).returns(oRequest);
        this.mock(oModel.oMetadata).expects("_getCanonicalPathOfFunctionImport").withExactArgs(sFunctionMetadata, "~urlParameters").exactly(sFunctionMetadata ? 1 : 0).returns("~functionTarget");
        oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "POST");
        assert.deepEqual(oResult, sFunctionMetadata ? {
            created: true,
            functionTarget: "~functionTarget"
        } : {
            created: true
        });
        assert.strictEqual(oResult, oRequest);
    });
});
[false, true].forEach(function (bExpandRequest, i) {
    QUnit.test("_processRequestQueue: push expandRequest to queue, " + i, function (assert) {
        var oRequest = {
            data: "~data",
            expandRequest: bExpandRequest ? "~expandRequest" : undefined
        }, oChange = {
            parts: [{
                    fnError: "~fnChangeError",
                    request: {},
                    requestHandle: "~changeRequestHandle",
                    fnSuccess: "~fnChangeSuccess"
                }],
            request: oRequest
        }, oModel = {
            mLaunderingState: "~mLaunderingState",
            bUseBatch: true,
            _collectChangedEntities: function () { },
            _createBatchRequest: function () { },
            _pushToRequestQueue: function () { },
            _submitBatchRequest: function () { },
            checkDataState: function () { },
            getKey: function () { },
            increaseLaundering: function () { },
            removeInternalMetadata: function () { }
        }, oRequestGroup = {
            changes: { "~sChangeSetId": [oChange] }
        }, mRequests = { "~sGroupId": oRequestGroup };
        this.mock(oModel).expects("_collectChangedEntities").withExactArgs(sinon.match.same(oRequestGroup), {}, {});
        this.mock(oModel).expects("getKey").withExactArgs("~data").returns("~key");
        this.mock(oModel).expects("increaseLaundering").withExactArgs("/~key", "~data");
        this.mock(oModel).expects("removeInternalMetadata").withExactArgs("~data");
        this.mock(oModel).expects("_pushToRequestQueue").withExactArgs(sinon.match.same(mRequests), "~sGroupId", undefined, "~expandRequest", "~fnChangeSuccess", "~fnChangeError", "~changeRequestHandle", false).exactly(bExpandRequest ? 1 : 0);
        this.mock(oModel).expects("_createBatchRequest").withExactArgs([{ __changeRequests: [sinon.match.same(oRequest)] }]).returns("~oBatchRequest");
        this.mock(oModel).expects("_submitBatchRequest").withExactArgs("~oBatchRequest", [[sinon.match.same(oChange)]], "~fnSuccess", "~fnError");
        this.mock(oModel).expects("checkDataState").withExactArgs("~mLaunderingState");
        ODataModel.prototype._processRequestQueue.call(oModel, mRequests, "~sGroupId", "~fnSuccess", "~fnError");
    });
});
QUnit.test("createEntry: expand without bUseBatch leads to an error", function (assert) {
    var oModel = { bUseBatch: false };
    assert.throws(function () {
        ODataModel.prototype.createEntry.call(oModel, "~path", { expand: "ToNavigation" });
    }, new Error("The 'expand' parameter is only supported if batch mode is used"));
});
QUnit.test("createEntry: no created callback, before metadata is available", function (assert) {
    var oModel = {
        sDefaultChangeGroup: "~sDefaultChangeGroup",
        oMetadata: {
            isLoaded: function () { }
        },
        _getRefreshAfterChange: function () { },
        _isCanonicalRequestNeeded: function () { },
        _normalizePath: function () { },
        resolveDeep: function () { }
    };
    this.mock(oModel).expects("_isCanonicalRequestNeeded").withExactArgs(undefined).returns(false);
    this.mock(oModel).expects("_getRefreshAfterChange").withExactArgs(undefined, undefined).returns(false);
    this.mock(oModel).expects("_normalizePath").withExactArgs("/~path", undefined, false).returns("sNormalizedPath");
    this.mock(oModel).expects("resolveDeep").withExactArgs("/~path", undefined).returns("~sDeepPath");
    this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(false);
    this.oLogMock.expects("error").withExactArgs("Tried to use createEntry without created-callback, before metadata is" + " available!");
    assert.strictEqual(ODataModel.prototype.createEntry.call(oModel, "/~path"), undefined);
});
[undefined, "~expand"].forEach(function (sExpand) {
    [true, false].forEach(function (bWithCallbackHandlers) {
        (!sExpand ? [
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                assert.ok(pCreate.isPending());
                oEventHandlersMock.expects("fnSuccess").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs("~oData", "~oCreateResponse");
                fnSuccess("~oData", "~oCreateResponse");
                assert.ok(pCreate.isFulfilled());
                return pCreate.then(function (oResult) {
                    assert.strictEqual(oResult, undefined);
                });
            },
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                assert.ok(pCreate.isPending());
                fnAbort("~oError");
                assert.ok(pCreate.isRejected());
                assert.strictEqual(pCreate.getResult(), "~oError");
            }
        ] : [
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                var oDataGET = { GET: true }, oDataPOST = { POST: true }, oResponseGET = "~oResponseGET", oResponsePOST = "~oResponsePOST";
                fnSuccess(oDataPOST, oResponsePOST);
                assert.ok(pCreate.isPending());
                oEventHandlersMock.expects("fnSuccess").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs({ GET: true, POST: true }, oResponsePOST);
                fnSuccess(oDataGET, oResponseGET);
                assert.ok(pCreate.isFulfilled());
                return pCreate.then(function (oResult) {
                    assert.strictEqual(oResult, undefined);
                });
            },
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                var oDataGET = { GET: true }, oDataPOST = { POST: true }, oErrorGET = {}, oErrorPOST = {}, oResponseGET = "~oResponseGET", oResponsePOST = "~oResponsePOST";
                oEventHandlersMock.expects("fnError").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs(sinon.match.same(oErrorPOST));
                fnError(oErrorPOST);
                fnError(oErrorGET);
                assert.strictEqual(oErrorGET.expandAfterCreateFailed, true);
                fnSuccess(oDataPOST, oResponsePOST);
                oEventHandlersMock.expects("fnSuccess").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs({ GET: true, POST: true }, oResponsePOST);
                assert.ok(pCreate.isPending());
                fnSuccess(oDataGET, oResponseGET);
                assert.ok(pCreate.isFulfilled());
                return pCreate.then(function (oResult) {
                    assert.strictEqual(oResult, undefined);
                });
            },
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                var oDataPOST = "~oDataPOST", oErrorGET = {}, oResponsePOST = {};
                fnSuccess(oDataPOST, oResponsePOST);
                assert.ok(pCreate.isPending());
                this.oLogMock.expects("error").withExactArgs("Entity creation was successful but expansion of navigation" + " properties failed", sinon.match.same(oErrorGET), sClassName);
                oEventHandlersMock.expects("fnSuccess").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs(oDataPOST, sinon.match.same(oResponsePOST).and(sinon.match({ expandAfterCreateFailed: true })));
                fnError(oErrorGET);
                assert.strictEqual(oErrorGET.expandAfterCreateFailed, true);
                assert.ok(pCreate.isFulfilled());
                return pCreate.then(function (oResult) {
                    assert.strictEqual(oResult, undefined);
                });
            },
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                var oErrorGET0 = {}, oErrorGET1 = {}, oErrorPOST0 = {}, oErrorPOST1 = {};
                oEventHandlersMock.expects("fnError").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs(sinon.match.same(oErrorPOST0));
                fnError(oErrorPOST0);
                fnError(oErrorGET0);
                assert.strictEqual(oErrorGET0.expandAfterCreateFailed, true);
                oEventHandlersMock.expects("fnError").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs(sinon.match.same(oErrorPOST1));
                fnError(oErrorPOST1);
                assert.strictEqual(oErrorPOST1.expandAfterCreateFailed, undefined);
                fnError(oErrorGET1);
                assert.strictEqual(oErrorGET1.expandAfterCreateFailed, true);
                assert.ok(pCreate.isPending());
            },
            function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate) {
                var oDataPOST = "~oDataPOST", oErrorGET0 = {}, oErrorGET1 = {}, oErrorPOST = {}, oResponsePOST = {};
                oEventHandlersMock.expects("fnError").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs(sinon.match.same(oErrorPOST));
                fnError(oErrorPOST);
                fnError(oErrorGET0);
                assert.strictEqual(oErrorGET0.expandAfterCreateFailed, true);
                assert.ok(pCreate.isPending());
                fnSuccess(oDataPOST, oResponsePOST);
                this.oLogMock.expects("error").withExactArgs("Entity creation was successful but expansion of navigation" + " properties failed", sinon.match.same(oErrorGET1), sClassName);
                oEventHandlersMock.expects("fnSuccess").exactly(bWithCallbackHandlers ? 1 : 0).withExactArgs(oDataPOST, sinon.match.same(oResponsePOST).and(sinon.match({ expandAfterCreateFailed: true })));
                fnError(oErrorGET1);
                assert.strictEqual(oErrorGET1.expandAfterCreateFailed, true);
                assert.ok(pCreate.isFulfilled());
                return pCreate.then(function (oResult) {
                    assert.strictEqual(oResult, undefined);
                });
            }
        ]).forEach(function (fnTestEventHandlers, i) {
            var sTitle = "createEntry: expand = " + sExpand + ", " + (bWithCallbackHandlers ? "with" : "without") + " callback handlers, i = " + i;
            QUnit.test(sTitle, function (assert) {
                var fnAbort, fnAfterMetadataLoaded, pCreate, oEntity, fnError, mHeaders, oRequestHandle, oResult, fnSuccess, sUid, oCreatedContext = {}, oEntityMetadata = { entityType: "~entityType" }, oEventHandlers = {
                    fnError: function () { },
                    fnSuccess: function () { }
                }, oEventHandlersMock = this.mock(oEventHandlers), oExpandRequest = {}, mHeadersInput = { input: true }, oModel = {
                    mChangedEntities: {},
                    mDeferredGroups: {},
                    oMetadata: {
                        _getEntitySetByType: function () { },
                        _getEntityTypeByPath: function () { },
                        _isCollection: function () { },
                        isLoaded: function () { },
                        loaded: function () { }
                    },
                    bRefreshAfterChange: false,
                    mRequests: "~mRequests",
                    sServiceUrl: "~sServiceUrl",
                    bUseBatch: true,
                    _addEntity: function () { },
                    _createRequest: function () { },
                    _createRequestUrlWithNormalizedPath: function () { },
                    _getHeaders: function () { },
                    _getRefreshAfterChange: function () { },
                    _isCanonicalRequestNeeded: function () { },
                    _normalizePath: function () { },
                    _processRequestQueueAsync: function () { },
                    _pushToRequestQueue: function () { },
                    getContext: function () { },
                    resolveDeep: function () { }
                }, oMetadataMock = this.mock(oModel.oMetadata), oModelMock = this.mock(oModel), oRequest = {};
                oEventHandlersMock.expects("fnError").never();
                oEventHandlersMock.expects("fnSuccess").never();
                oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs("~canonicalRequest").returns("~bCanonical");
                oModelMock.expects("_getRefreshAfterChange").withExactArgs("~refreshAfterChange", "~groupId").returns("~bRefreshAfterChange");
                this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs("~urlParameters").returns("~aUrlParams");
                oModelMock.expects("_normalizePath").withExactArgs("~path", "~context", "~bCanonical").returns("/~sNormalizedPath");
                oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("~sDeepPath");
                oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
                oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("/~sNormalizedPath").returns(oEntityMetadata);
                oMetadataMock.expects("_getEntitySetByType").withExactArgs(sinon.match.same(oEntityMetadata)).returns({ name: "~entitySetName" });
                oMetadataMock.expects("_isCollection").withExactArgs("~sDeepPath").returns(true);
                oModelMock.expects("_addEntity").withExactArgs(sinon.match(function (oEntity0) {
                    sUid = rTemporaryKey.exec(oEntity0.__metadata.deepPath)[1];
                    fnAbort = oEntity0.__metadata.created.abort;
                    fnError = oEntity0.__metadata.created.error;
                    mHeaders = oEntity0.__metadata.created.headers;
                    fnSuccess = oEntity0.__metadata.created.success;
                    oEntity = {
                        __metadata: {
                            created: {
                                abort: fnAbort,
                                changeSetId: "~changeSetId",
                                error: fnError,
                                eTag: "~eTag",
                                groupId: "~groupId",
                                headers: mHeaders,
                                key: "~sNormalizedPath",
                                success: fnSuccess,
                                urlParameters: "~urlParameters"
                            },
                            deepPath: "~sDeepPath('" + sUid + "')",
                            type: "~entityType",
                            uri: "~sServiceUrl/~entitySetName('" + sUid + "')"
                        }
                    };
                    assert.deepEqual(oEntity0, oEntity);
                    assert.deepEqual(mHeaders, sExpand ? Object.assign({}, mHeadersInput, {
                        "Content-ID": sUid,
                        "sap-messages": "transientOnly"
                    }) : mHeadersInput);
                    assert.strictEqual(fnError === (bWithCallbackHandlers ? oEventHandlers.fnError : undefined), !sExpand);
                    assert.ok(fnAbort instanceof Function);
                    assert.ok(fnSuccess instanceof Function);
                    return true;
                })).returns("~sKey");
                oModelMock.expects("_createRequestUrlWithNormalizedPath").withExactArgs("/~sNormalizedPath", "~aUrlParams", true).returns("~sUrl");
                oModelMock.expects("_createRequest").withExactArgs("~sUrl", sinon.match(function (sDeepPath0) {
                    return sDeepPath0 === "~sDeepPath('" + sUid + "')";
                }), "POST", sinon.match(function (mHeaders0) {
                    assert.deepEqual(mHeaders0, mHeaders);
                    return true;
                }), sinon.match(function (oEntity0) {
                    assert.deepEqual(oEntity0, oEntity);
                    return true;
                }), "~eTag").returns(oRequest);
                if (sExpand) {
                    this.mock(ODataUtils).expects("_encodeURLParameters").withExactArgs({ $expand: sExpand, $select: sExpand }).returns("~expandselect");
                    oModelMock.expects("_getHeaders").withExactArgs(undefined, true).returns("~GETheaders");
                    oModelMock.expects("_createRequest").withExactArgs(sinon.match(function (sUri) {
                        return sUri === "$" + sUid + "?~expandselect";
                    }), sinon.match(function (sDeepPath0) {
                        return sDeepPath0 === "/$" + sUid;
                    }), "GET", "~GETheaders", null, undefined, undefined, true).returns(oExpandRequest);
                }
                oModelMock.expects("getContext").withExactArgs("/~sKey", sinon.match(function (sDeepPath0) {
                    return sDeepPath0 === "~sDeepPath('" + sUid + "')";
                }), sinon.match(function (pCreateParameter) {
                    pCreate = pCreateParameter;
                    assert.ok(pCreate instanceof SyncPromise);
                    return true;
                })).returns(oCreatedContext);
                oMetadataMock.expects("loaded").withExactArgs().returns({ then: function (fnFunc) {
                        fnAfterMetadataLoaded = fnFunc;
                    } });
                oResult = ODataModel.prototype.createEntry.call(oModel, "~path", {
                    canonicalRequest: "~canonicalRequest",
                    changeSetId: "~changeSetId",
                    context: "~context",
                    error: bWithCallbackHandlers ? oEventHandlers.fnError : undefined,
                    eTag: "~eTag",
                    expand: sExpand,
                    groupId: "~groupId",
                    headers: mHeadersInput,
                    properties: {},
                    refreshAfterChange: "~refreshAfterChange",
                    success: bWithCallbackHandlers ? oEventHandlers.fnSuccess : undefined,
                    urlParameters: "~urlParameters"
                });
                if (sExpand) {
                    oEntity.__metadata.created.expandRequest = oExpandRequest;
                    oEntity.__metadata.created.contentID = sUid;
                    assert.deepEqual(oExpandRequest, { contentID: sUid });
                }
                assert.deepEqual(oModel.mChangedEntities["~sKey"], oEntity);
                assert.strictEqual(oResult, oCreatedContext);
                assert.deepEqual(oRequest, sExpand ? {
                    contentID: sUid,
                    created: true,
                    expandRequest: oExpandRequest,
                    key: "~sKey"
                } : { created: true, key: "~sKey" });
                oModelMock.expects("_pushToRequestQueue").withExactArgs("~mRequests", "~groupId", "~changeSetId", sinon.match.same(oRequest), sinon.match(function (fnSuccess0) {
                    return fnSuccess0 === fnSuccess;
                }), sinon.match(function (fnError0) {
                    return fnError0 === fnError;
                }), sinon.match(function (oRequestHandle0) {
                    oRequestHandle = oRequestHandle0;
                    return true;
                }), "~bRefreshAfterChange");
                oModelMock.expects("_processRequestQueueAsync").withExactArgs("~mRequests");
                fnAfterMetadataLoaded();
                assert.strictEqual(oRequest._aborted, undefined);
                if (sExpand) {
                    assert.strictEqual(oRequest.expandRequest._aborted, undefined);
                }
                oRequestHandle.abort();
                assert.strictEqual(oRequest._aborted, true);
                if (sExpand) {
                    assert.strictEqual(oRequest.expandRequest._aborted, true);
                }
                return fnTestEventHandlers.call(this, assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate);
            });
        });
    });
});
[{
        contentID2KeyAndDeepPath: {
            "~contentID": {
                deepPath: "~deepPath('~key')",
                key: "Foo('~key')"
            }
        },
        request0Info: {
            contentID: "~contentID",
            created: true,
            deepPath: "~deepPath('~contentID')",
            requestUri: "~serviceUri/Foo?bar"
        },
        resultingDeepPath: "~deepPath('~key')"
    }, {
        contentID2KeyAndDeepPath: {
            "~contentID": {
                deepPath: "~/FunctionName",
                key: "Foo('~key')"
            }
        },
        request0Info: {
            contentID: "~contentID",
            deepPath: "~/FunctionName",
            functionMetadata: "~functionMetadata",
            requestUri: "~FunctionName?bar"
        },
        resultingDeepPath: "~/FunctionName"
    }].forEach(function (oFixture, i) {
    QUnit.test("_submitBatchRequest: with content-IDs, #" + i, function (assert) {
        var oBatchRequest = {}, oBatchResponse = {
            headers: "~batchResponseHeaders"
        }, oRequestPOST = {}, oRequest0 = {
            parts: [{
                    request: oRequestPOST,
                    fnSuccess: "~fnSuccess0"
                }],
            request: oFixture.request0Info
        }, oRequestGET = {}, oRequest1 = {
            parts: [{
                    request: oRequestGET,
                    fnSuccess: "~fnSuccess1"
                }],
            request: {
                contentID: "~contentID",
                deepPath: "/$~contentID",
                requestUri: "~serviceUri/$~contentID?bar"
            }
        }, oResponseGET = { headers: "~getHeaders" }, oResponsePOST = { data: "~postData", headers: "~postHeaders" }, oData = {
            __batchResponses: [oResponsePOST, oResponseGET]
        }, aRequests = [oRequest0, oRequest1], oEventInfo = { requests: sinon.match.same(aRequests), batch: true }, fnHandleSuccess, oModel = {
            _getHeader: function () { },
            _getKey: function () { },
            _invalidatePathCache: function () { },
            _processSuccess: function () { },
            _setSessionContextIdHeader: function () { },
            _submitRequest: function () { },
            checkUpdate: function () { }
        }, oModelMock = this.mock(oModel);
        oModelMock.expects("_submitRequest").withExactArgs(sinon.match.same(oBatchRequest).and(sinon.match({ eventInfo: oEventInfo })), sinon.match.func.and(sinon.match(function (fnSuccess) {
            fnHandleSuccess = fnSuccess;
            return true;
        })), sinon.match.func);
        ODataModel.prototype._submitBatchRequest.call(oModel, oBatchRequest, aRequests, "~fnSuccess");
        oModelMock.expects("_getKey").withExactArgs("~postData").returns("Foo('~key')");
        oModelMock.expects("_processSuccess").withExactArgs(sinon.match.same(oRequestPOST), sinon.match.same(oResponsePOST), "~fnSuccess0", sinon.match.object, sinon.match.object, sinon.match.object, false, undefined, oFixture.contentID2KeyAndDeepPath);
        oModelMock.expects("_processSuccess").withExactArgs(sinon.match.same(oRequestGET), sinon.match.same(oResponseGET), "~fnSuccess1", sinon.match.object, sinon.match.object, sinon.match.object, false, undefined, oFixture.contentID2KeyAndDeepPath);
        oModelMock.expects("_invalidatePathCache").withExactArgs();
        oModelMock.expects("checkUpdate").withExactArgs(false, false, sinon.match.object);
        oModelMock.expects("_processSuccess").withExactArgs(sinon.match.same(oBatchRequest), sinon.match.same(oBatchResponse), "~fnSuccess", sinon.match.object, sinon.match.object, sinon.match.object, true, sinon.match.same(aRequests));
        oModelMock.expects("_getHeader").withExactArgs("sap-contextid", "~batchResponseHeaders").returns("~sap-contextid");
        oModelMock.expects("_setSessionContextIdHeader").withExactArgs("~sap-contextid");
        fnHandleSuccess(oData, oBatchResponse);
        assert.strictEqual(oRequest1.request.requestUri, "~serviceUri/Foo('~key')?bar");
        assert.strictEqual(oRequest1.request.deepPath, oFixture.resultingDeepPath);
    });
});
[true, false].forEach(function (bReject) {
    QUnit.test("metadataLoaded calls oMetadata.loaded (" + bReject + ")", function (assert) {
        var oModel = {
            oMetadata: {
                loaded: function () { }
            }
        }, oPromise = {};
        this.mock(oModel.oMetadata).expects("loaded").withExactArgs(bReject).returns(oPromise);
        assert.strictEqual(ODataModel.prototype.metadataLoaded.call(oModel, bReject), oPromise);
    });
});
[true, false].forEach(function (bReject) {
    [true, false].forEach(function (bAnnotations) {
        [true, false].forEach(function (bMetadata) {
            var sTitle = "metadataLoaded with annotations: " + "bRejectOnFailure=" + bReject + " (" + bAnnotations + ", " + bMetadata + ")";
            QUnit.test(sTitle, function (assert) {
                var fnAnnotationsPromise, oMetadataPromise, fnMetadataPromise, oModel = {
                    bLoadAnnotationsJoined: true,
                    oMetadata: {
                        loaded: function () { }
                    }
                }, oTest = {
                    resolved: function () { },
                    rejected: function () { }
                }, oTestMock = this.mock(oTest);
                oModel.pAnnotationsLoaded = new Promise(function (resolve, reject) {
                    fnAnnotationsPromise = bAnnotations ? resolve : reject;
                });
                oMetadataPromise = new Promise(function (resolve, reject) {
                    fnMetadataPromise = (bMetadata || !bReject) ? resolve : reject;
                });
                this.mock(oModel.oMetadata).expects("loaded").withExactArgs(bReject).returns(oMetadataPromise);
                if (!bReject || (bAnnotations && bMetadata)) {
                    oTestMock.expects("resolved");
                    oTestMock.expects("rejected").never();
                }
                else {
                    oTestMock.expects("resolved").never();
                    oTestMock.expects("rejected");
                }
                fnAnnotationsPromise();
                fnMetadataPromise();
                return ODataModel.prototype.metadataLoaded.call(oModel, bReject).then(oTest.resolved, oTest.rejected);
            });
        });
    });
});
QUnit.test("_submitBatchRequest: with error responses", function (assert) {
    var oBatchRequest = {}, oBatchRequestHandle = { abort: function () { } }, oBatchResponse = { headers: "~headers", statusCode: 200 }, oChangesetError = { message: "complete changeset failed" }, oData = { __batchResponses: [
            oChangesetError
        ] }, oError = { message: "an error message" }, fnHandleError, oHandlers = {
        fnError: function () { },
        fnSuccess: function () { }
    }, fnHandleSuccess, oModel = {
        _getHeader: function () { },
        _invalidatePathCache: function () { },
        _processAfterUpdate: function () { },
        _processError: function () { },
        _processSuccess: function () { },
        _setSessionContextIdHeader: function () { },
        _submitRequest: function () { },
        checkUpdate: function () { }
    }, oModelMock = this.mock(oModel), oPart0_0 = { fnError: "~fnErrorPart0_0", request: {} }, oPart1_0 = { fnError: "~fnErrorPart1_0", request: {} }, oPart1_1 = { fnError: "~fnErrorPart1_1", request: {} }, oPart2_0 = { fnError: "~fnErrorPart2_0", request: {} }, oRequest0 = { parts: [oPart0_0] }, oRequest1 = { parts: [oPart1_0, oPart1_1] }, oRequest2 = { parts: [oPart2_0] }, aRequests = [
        [oRequest1, oRequest2],
        oRequest0
    ], oEventInfo = {
        batch: true,
        requests: aRequests
    };
    oModelMock.expects("_submitRequest").withExactArgs(sinon.match.same(oBatchRequest), sinon.match.func, sinon.match.func).callsFake(function (oBatchRequest0, fnHandleSuccess0, fnHandleError0) {
        fnHandleError = fnHandleError0;
        fnHandleSuccess = fnHandleSuccess0;
        return oBatchRequestHandle;
    });
    ODataModel.prototype._submitBatchRequest.call(oModel, oBatchRequest, aRequests, oHandlers.fnSuccess, oHandlers.fnError);
    assert.deepEqual(oBatchRequest.eventInfo, oEventInfo);
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart1_0.request), sinon.match.same(oError).and(sinon.match({ $reported: true })), "~fnErrorPart1_0");
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart1_1.request), sinon.match.same(oError).and(sinon.match({ $reported: true })), "~fnErrorPart1_1");
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart2_0.request), sinon.match.same(oError).and(sinon.match({ $reported: true })), "~fnErrorPart2_0");
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart0_0.request), sinon.match.same(oError).and(sinon.match({ $reported: true })), "~fnErrorPart0_0");
    oModelMock.expects("_processAfterUpdate").withExactArgs();
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oBatchRequest), sinon.match.same(oError).and(sinon.match({ $reported: false })), sinon.match.same(oHandlers.fnError), true, sinon.match.same(aRequests));
    fnHandleError(oError);
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart1_0.request), sinon.match.same(oChangesetError).and(sinon.match({ $reported: false })), "~fnErrorPart1_0").callsFake(function (oRequest, oResponse, fnError0) {
        oResponse.$reported = true;
    });
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart1_1.request), sinon.match.same(oChangesetError).and(sinon.match({ $reported: true })), "~fnErrorPart1_1");
    oModelMock.expects("_processError").withExactArgs(sinon.match.same(oPart2_0.request), sinon.match.same(oChangesetError).and(sinon.match({ $reported: false })), "~fnErrorPart2_0");
    oModelMock.expects("_invalidatePathCache").withExactArgs();
    oModelMock.expects("checkUpdate").withExactArgs(false, false, {});
    oModelMock.expects("_processSuccess").withExactArgs(sinon.match.same(oBatchRequest), sinon.match.same(oBatchResponse), sinon.match.same(oHandlers.fnSuccess), {}, {}, {}, true, sinon.match.same(aRequests));
    oModelMock.expects("_getHeader").withExactArgs("sap-contextid", "~headers").returns("~contextid");
    oModelMock.expects("_setSessionContextIdHeader").withExactArgs("~contextid");
    fnHandleSuccess(oData, oBatchResponse);
});
[false, true].forEach(function (bSuppressErrorHandlerCall) {
    var sTitle = "_submitBatchRequest: calls _createAbortedError on abort;" + " bSuppressErrorHandlerCall=" + bSuppressErrorHandlerCall;
    QUnit.test(sTitle, function (assert) {
        var oBatchRequest = {}, oBatchRequestHandle = {
            abort: function () { }
        }, fnError = sinon.stub(), i = -1, oPart0_AlreadyAborted = { request: { _aborted: true } }, oPart0_NoErrorHandler = { request: {} }, oPart0_WithErrorHandler = {
            fnError: function () { },
            request: {}
        }, oPart1_NoErrorHandler = { request: {} }, oPart1_WithErrorHandler = {
            fnError: function () { },
            request: {}
        }, oPart2_AlreadyAborted = { request: { _aborted: true } }, oPart2_WithErrorHandler = {
            fnError: function () { },
            request: {}
        }, oRequest0 = {
            parts: [oPart0_NoErrorHandler, oPart0_AlreadyAborted, oPart0_WithErrorHandler]
        }, oRequest1 = { parts: [oPart1_NoErrorHandler, oPart1_WithErrorHandler] }, oRequest2 = { parts: [oPart2_WithErrorHandler, oPart2_AlreadyAborted] }, aRequests = [
            [oRequest1, oRequest2],
            oRequest0
        ], oEventInfo = {
            batch: true,
            requests: aRequests
        }, oModel = {
            _submitRequest: function () { }
        }, oRequestHandle;
        this.mock(oModel).expects("_submitRequest").withExactArgs(sinon.match.same(oBatchRequest).and(sinon.match.has("eventInfo", oEventInfo)), sinon.match.func, sinon.match.func).returns(oBatchRequestHandle);
        oRequestHandle = ODataModel.prototype._submitBatchRequest.call(oModel, oBatchRequest, aRequests, "~fnSuccess", fnError);
        assert.strictEqual(fnError.called, false);
        this.mock(ODataModel).expects("_createAbortedError").withExactArgs().exactly(bSuppressErrorHandlerCall ? 3 : 4).callsFake(function () {
            i += 1;
            return "~oError" + i;
        });
        this.mock(oPart0_WithErrorHandler).expects("fnError").withExactArgs("~oError2");
        this.mock(oPart1_WithErrorHandler).expects("fnError").withExactArgs("~oError0");
        this.mock(oPart2_WithErrorHandler).expects("fnError").withExactArgs("~oError1");
        this.mock(oBatchRequestHandle).expects("abort").withExactArgs();
        oRequestHandle.abort(bSuppressErrorHandlerCall);
        if (bSuppressErrorHandlerCall) {
            assert.strictEqual(fnError.called, false);
        }
        else {
            assert.ok(fnError.calledOnceWithExactly("~oError3"));
        }
    });
});
[false, true].forEach(function (bReported) {
    QUnit.test("_handleError: $reported = " + bReported, function (assert) {
        var oError = {
            $reported: bReported,
            message: "~message",
            response: {
                body: "~body",
                headers: "~headers",
                statusCode: "~code",
                statusText: "~statusText"
            }
        }, oModel = {
            _parseResponse: function () { }
        }, oRequest = { method: "~method", requestUri: "~uri" }, oResult;
        this.mock(oModel).expects("_parseResponse").withExactArgs(sinon.match.same(oError.response), sinon.match.same(oRequest)).exactly(bReported ? 0 : 1);
        oResult = ODataModel.prototype._handleError.call(oModel, oError, oRequest);
        assert.deepEqual(oResult, {
            headers: "~headers",
            message: "~message",
            responseText: "~body",
            statusCode: "~code",
            statusText: "~statusText"
        });
        assert.strictEqual(oError.$reported, true);
    });
});
[false, true].forEach(function (bReported) {
    QUnit.test("_handleError: no response given, $reported = " + bReported, function (assert) {
        var oError = {
            $reported: bReported,
            message: "~message"
        }, oModel = {
            _parseResponse: function () { }
        }, oResult;
        this.mock(oModel).expects("_parseResponse").never();
        this.oLogMock.expects("error").exactly(bReported ? 0 : 1).withExactArgs("The following problem occurred: ~message", undefined, sClassName);
        oResult = ODataModel.prototype._handleError.call(oModel, oError, "~oRequest");
        assert.deepEqual(oResult, { message: "~message" });
        assert.strictEqual(oError.$reported, true);
    });
});
QUnit.test("_updateChangedEntities: skip __metadata", function (assert) {
    var mChangedEntitiesNew = {
        "~key": {
            __metadata: {
                etag: "~etag_new",
                uri: "~uri"
            },
            foo: "bar"
        }
    }, mChangedEntitiesOld = {
        "~key": {
            __metadata: {
                etag: "~etag_old",
                uri: "~uri"
            },
            foo: "bar"
        }
    }, mChangedEntities4oChangedEntry = Object.assign({}, mChangedEntitiesOld["~key"]), mChangedEntities4oEntry = Object.assign({}, mChangedEntitiesNew["~key"]), oModel = {
        mChangedEntities: mChangedEntitiesOld,
        oMetadata: {
            _getEntityTypeByPath: function () { },
            _getNavPropertyRefInfo: function () { }
        },
        _getObject: function () { },
        _resolveGroup: function () { },
        abortInternalRequest: function () { },
        isLaundering: function () { },
        removeInternalMetadata: function () { }
    }, oModelMock = this.mock(oModel);
    oModelMock.expects("_getObject").withExactArgs("/~key", null, true).returns(mChangedEntities4oEntry);
    oModelMock.expects("_getObject").withExactArgs("/~key").returns(mChangedEntities4oChangedEntry);
    oModelMock.expects("removeInternalMetadata").withExactArgs(sinon.match.same(mChangedEntities4oChangedEntry)).returns("~removedMetadata");
    oModelMock.expects("isLaundering").withExactArgs("/~key/foo");
    this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("/~key").returns("~oEntityType");
    this.mock(oModel.oMetadata).expects("_getNavPropertyRefInfo").withExactArgs("~oEntityType", "foo").returns(null);
    oModelMock.expects("_resolveGroup").withExactArgs("~key").returns({ groupId: "~group" });
    oModelMock.expects("abortInternalRequest").withExactArgs("~group", { requestKey: "~key" });
    ODataModel.prototype._updateChangedEntities.call(oModel, mChangedEntitiesNew);
    assert.deepEqual(oModel.mChangedEntities, {});
});
QUnit.test("remove: create request with bUpdateAggregatedMessages=true", function (assert) {
    var fnHandleProcessSuccess, oModel = {
        mDeferredGroups: {},
        mRequests: "~mRequests",
        bUseBatch: "~bUseBatch",
        _createRequest: function () { },
        _createRequestUrlWithNormalizedPath: function () { },
        _getHeaders: function () { },
        _getRefreshAfterChange: function () { },
        _isCanonicalRequestNeeded: function () { },
        _normalizePath: function () { },
        _processRequest: function () { },
        _pushToRequestQueue: function () { },
        resolveDeep: function () { }
    };
    this.mock(oModel).expects("_isCanonicalRequestNeeded").withExactArgs("~bCanonical0").returns("~bCanonical1");
    this.mock(oModel).expects("_getRefreshAfterChange").withExactArgs("~bRefreshAfterChange0", "~sGroupId").returns("~bRefreshAfterChange1");
    this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs("~mUrlParams").returns("~aUrlParams");
    this.mock(oModel).expects("_getHeaders").withExactArgs("~mHeaders0").returns("~mHeaders1");
    this.mock(oModel).expects("_normalizePath").withExactArgs("~sPath", "~oContext", "~bCanonical1").returns("~sNormalizedPath");
    this.mock(oModel).expects("resolveDeep").withExactArgs("~sPath", "~oContext").returns("~sDeepPath");
    this.mock(oModel).expects("_processRequest").withExactArgs(sinon.match.func, "~fnError", false).callsFake(function (fnHandleProcessSuccess0, fnError, bDeferred) {
        fnHandleProcessSuccess = fnHandleProcessSuccess0;
    });
    ODataModel.prototype.remove.call(oModel, "~sPath", {
        canonicalRequest: "~bCanonical0",
        changeSetId: "~sChangeSetId",
        context: "~oContext",
        error: "~fnError",
        eTag: "~sETag",
        groupId: "~sGroupId",
        headers: "~mHeaders0",
        refreshAfterChange: "~bRefreshAfterChange0",
        urlParameters: "~mUrlParams"
    });
    this.mock(oModel).expects("_createRequestUrlWithNormalizedPath").withExactArgs("~sNormalizedPath", "~aUrlParams", "~bUseBatch").returns("~sUrl");
    this.mock(oModel).expects("_createRequest").withExactArgs("~sUrl", "~sDeepPath", "DELETE", "~mHeaders1", undefined, "~sETag", undefined, true).returns("~oRequest");
    this.mock(oModel).expects("_pushToRequestQueue").withExactArgs("~mRequests", "~sGroupId", "~sChangeSetId", "~oRequest", sinon.match.func, "~fnError", "~requestHandle", "~bRefreshAfterChange1");
    fnHandleProcessSuccess("~requestHandle");
});
[{ groupId: "~groupId" }, { batchGroupId: "~groupId" }].forEach(function (oGroupFixture, i) {
    [{
            oFunctionMetadata: {
                parameter: [{ name: "~name0", type: "~type0" }, { name: "~name1", type: "~type1" }]
            }
        }, {
            oFunctionMetadata: {
                entitySetPath: "~entitySetPath",
                parameter: null
            },
            $result: { __list: [] }
        }, {
            oFunctionMetadata: {
                entitySet: "~entitySet",
                parameter: null
            },
            $result: { __list: [] }
        }, {
            oFunctionMetadata: {
                entitySet: "~entitySet",
                parameter: null,
                returnType: "~returnType"
            },
            $result: { __ref: {} }
        }, {
            oFunctionMetadata: {
                entitySet: "~entitySet",
                parameter: null,
                returnType: "Collection(~returnType)"
            },
            $result: { __list: [] }
        }].forEach(function (oFunctionMetadataFixture, j) {
        [true, false].forEach(function (bInDeferredGroups) {
            var sTitle = "callFunction: oGroupFixture#" + i + ", oFunctionMetadataFixture#" + j + ", group in deferred Groups: " + bInDeferredGroups;
            QUnit.test(sTitle, function (assert) {
                var oContextCreatedPromise, oData, bFunctionHasParameter = oFunctionMetadataFixture.oFunctionMetadata.parameter !== null, mHeaders = { foo: "bar" }, oExpectedOData = Object.assign({
                    __metadata: {
                        created: {
                            changeSetId: "~changeSetId",
                            error: "~error",
                            eTag: "~eTag",
                            functionImport: true,
                            groupId: "~groupId",
                            headers: mHeaders,
                            key: "~sFunctionName",
                            method: "~method",
                            success: "~success"
                        },
                        uri: sinon.match(function (sUri) {
                            return sUri.startsWith("/service/url/~sFunctionName") && sUri.match(rTemporaryKey);
                        })
                    }
                }, bFunctionHasParameter ? { "~name0": "~defaultValue0", "~name1": "foo" } : undefined), oMetadata = {
                    _getCanonicalPathOfFunctionImport: function () { },
                    _getFunctionImportMetadata: function () { }
                }, oModel = {
                    mDeferredGroups: bInDeferredGroups ? { "~groupId": "bar" } : {},
                    mDeferredRequests: "~mDeferredRequests",
                    oMetadata: oMetadata,
                    mRequests: "~mRequests",
                    bUseBatch: "~bUseBatch",
                    sServiceUrl: "/service/url",
                    _addEntity: function () { },
                    _createPropertyValue: function () { },
                    _createRequest: function () { },
                    _createRequestUrlWithNormalizedPath: function () { },
                    _getHeaders: function () { },
                    _getRefreshAfterChange: function () { },
                    _processRequest: function () { },
                    _pushToRequestQueue: function () { },
                    _writePathCache: function () { },
                    getContext: function () { }
                }, oModelMock = this.mock(oModel), fnProcessRequest, oRequest = {}, oRequestHandle = {}, oResult, oResultingRequest;
                if (oFunctionMetadataFixture.$result) {
                    oExpectedOData.$result = oFunctionMetadataFixture.$result;
                }
                oModelMock.expects("_getRefreshAfterChange").withExactArgs("~refreshAfterChange", "~groupId").returns("~bRefreshAfterChange");
                oModelMock.expects("_getHeaders").withExactArgs(sinon.match.same(mHeaders)).returns("~mHeaders");
                oModelMock.expects("_processRequest").withExactArgs(sinon.match.func, "~error").callsFake(function (fnProcessRequest0) {
                    fnProcessRequest = fnProcessRequest0;
                    return oRequestHandle;
                });
                oResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
                    adjustDeepPath: "~adjustDeepPath",
                    batchGroupId: oGroupFixture.batchGroupId,
                    changeSetId: "~changeSetId",
                    error: "~error",
                    eTag: "~eTag",
                    groupId: oGroupFixture.groupId,
                    headers: mHeaders,
                    method: "~method",
                    refreshAfterChange: "~refreshAfterChange",
                    success: "~success",
                    urlParameters: { "~name1": "foo" }
                });
                assert.strictEqual(oResult, oRequestHandle);
                oContextCreatedPromise = oResult.contextCreated();
                assert.ok(oContextCreatedPromise instanceof Promise);
                this.mock(oMetadata).expects("_getFunctionImportMetadata").withExactArgs("/~sFunctionName", "~method").returns(oFunctionMetadataFixture.oFunctionMetadata);
                if (bFunctionHasParameter) {
                    oModelMock.expects("_createPropertyValue").withExactArgs("~type0").returns("~defaultValue0");
                    oModelMock.expects("_createPropertyValue").withExactArgs("~type1").returns("~defaultValue1");
                    this.oLogMock.expects("warning").withExactArgs("No value given for parameter '~name0' of function import" + " '/~sFunctionName'", sinon.match.same(oModel), sClassName);
                    this.mock(ODataUtils).expects("formatValue").withExactArgs("foo", "~type1").returns("~value1");
                }
                else {
                    oModelMock.expects("_createPropertyValue").never();
                }
                oModelMock.expects("_addEntity").withExactArgs(oExpectedOData).callsFake(function (oData0) {
                    oData = oData0;
                    assert.notStrictEqual(oData.__metadata.created.headers, mHeaders);
                    return "~sKey";
                });
                oModelMock.expects("getContext").withExactArgs("/~sKey").returns("~oContext");
                oModelMock.expects("_writePathCache").withExactArgs("/~sKey", "/~sKey");
                this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs({ "~name1": bFunctionHasParameter ? "~value1" : "foo" }).returns("~aUrlParams");
                oModelMock.expects("_createRequestUrlWithNormalizedPath").withExactArgs("/~sFunctionName", "~aUrlParams", "~bUseBatch").returns("~sUrl");
                oModelMock.expects("_createRequest").withExactArgs("~sUrl", "/~sFunctionName", "~method", "~mHeaders", undefined, "~eTag", undefined, true).returns(oRequest);
                this.mock(oMetadata).expects("_getCanonicalPathOfFunctionImport").withExactArgs(sinon.match.same(oFunctionMetadataFixture.oFunctionMetadata), { "~name1": bFunctionHasParameter ? "~value1" : "foo" }).returns("~functionTarget");
                oModelMock.expects("_pushToRequestQueue").withExactArgs(bInDeferredGroups ? "~mDeferredRequests" : "~mRequests", "~groupId", "~changeSetId", sinon.match.same(oRequest), "~success", "~error", "~requestHandle", "~bRefreshAfterChange");
                oResultingRequest = fnProcessRequest("~requestHandle");
                assert.strictEqual(oResultingRequest, oRequest);
                assert.deepEqual(oResultingRequest, {
                    adjustDeepPath: "~adjustDeepPath",
                    functionMetadata: oFunctionMetadataFixture.oFunctionMetadata,
                    functionTarget: "~functionTarget",
                    key: "~sKey"
                });
                assert.strictEqual(oData.__metadata.created.functionMetadata, oFunctionMetadataFixture.oFunctionMetadata);
                return oContextCreatedPromise.then(function (oContext) {
                    assert.strictEqual(oContext, "~oContext");
                });
            });
        });
    });
});
QUnit.test("callFunction: function name starts not with /", function (assert) {
    var oModel = {};
    this.oLogMock.expects("fatal").withExactArgs("callFunction: sFunctionName has to be absolute, but the given" + " '~sFunctionName' is not absolute", sinon.match.same(oModel), sClassName);
    assert.strictEqual(ODataModel.prototype.callFunction.call(oModel, "~sFunctionName"), undefined);
});
QUnit.test("callFunction: no function metadata; no parameters", function (assert) {
    var oContextCreatedPromise, oMetadata = {
        _getFunctionImportMetadata: function () { }
    }, oModel = {
        oMetadata: oMetadata,
        _getHeaders: function () { },
        _getRefreshAfterChange: function () { },
        _processRequest: function () { }
    }, oModelMock = this.mock(oModel), fnProcessRequest, oRequestHandle = {}, oResult;
    oModelMock.expects("_getRefreshAfterChange").withExactArgs(undefined, undefined).returns("~bRefreshAfterChange");
    oModelMock.expects("_processRequest").withExactArgs(sinon.match.func, undefined).callsFake(function (fnProcessRequest0) {
        fnProcessRequest = fnProcessRequest0;
        return oRequestHandle;
    });
    oModelMock.expects("_getHeaders").never();
    oResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName");
    assert.strictEqual(oResult, oRequestHandle);
    oContextCreatedPromise = oResult.contextCreated();
    assert.ok(oContextCreatedPromise instanceof Promise);
    this.mock(oMetadata).expects("_getFunctionImportMetadata").withExactArgs("/~sFunctionName", "GET").returns(undefined);
    this.oLogMock.expects("error").withExactArgs("Function '/~sFunctionName' not found in the metadata", sinon.match.same(oModel), sClassName);
    assert.strictEqual(fnProcessRequest("~requestHandle"), undefined);
    return oContextCreatedPromise.then(function () {
        assert.ok(false, "created Promise has to be rejected");
    }, function () {
        assert.ok(true, "created Promise is rejected");
    });
});
QUnit.test("callFunction: with expand; not a POST", function (assert) {
    var oModel = {
        bUseBatch: true
    };
    assert.throws(function () {
        ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
            expand: "ToFoo"
        });
    }, new Error("Use 'expand' parameter only with HTTP method 'POST'"));
});
QUnit.test("callFunction: with expand; not in batch mode", function (assert) {
    var oModel = {
        bUseBatch: false
    };
    assert.throws(function () {
        ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
            expand: "ToFoo"
        });
    }, new Error("Use 'expand' parameter only with 'useBatch' set to 'true'"));
});
[
    {},
    { entitySet: "~FooSet" },
    { entitySetPath: "~FooSetPath" },
    { entitySet: "~FooSet", returnType: "Collection(~FooType)" },
    { entitySetPath: "~FooSetPath", returnType: "Collection(~FooType)" }
].forEach(function (oFunctionMetadata) {
    QUnit.test("callFunction: with expand; retuns a collection", function (assert) {
        var callFunctionResult, oMetadata = {
            _getFunctionImportMetadata: function () { }
        }, oModel = {
            bUseBatch: true,
            oMetadata: oMetadata,
            _processRequest: function () { },
            _getRefreshAfterChange: function () { }
        };
        this.mock(oModel).expects("_getRefreshAfterChange").returns(false);
        this.mock(oModel).expects("_processRequest").callsFake(function (fnProcessRequest, fnError, bDeferred) {
            fnProcessRequest();
            return {};
        });
        this.mock(oMetadata).expects("_getFunctionImportMetadata").withExactArgs("/~sFunctionName", "POST").returns(oFunctionMetadata);
        callFunctionResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
            expand: "ToBar",
            method: "POST"
        });
        return callFunctionResult.contextCreated().then(function () {
            assert.ok(false, "unexpected success");
        }, function (oError) {
            assert.ok(oError instanceof Error);
            assert.strictEqual(oError.message, "Use 'expand' parameter only for functions returning a single entity");
        });
    });
});
[true, false].forEach(function (bWithCallbacks) {
    [
        function (assert, fnSuccess, fnError, oCallbacksMock) {
            fnSuccess("~oDataPOST", "~oResponsePOST");
            this.mock(Object).expects("assign").withExactArgs({}, "~oDataPOST", "~oDataGET").exactly(bWithCallbacks ? 1 : 0).returns("~mergedData");
            oCallbacksMock.expects("success").withExactArgs("~mergedData", "~oResponsePOST").exactly(bWithCallbacks ? 1 : 0);
            fnSuccess("~oDataGET", "~oResponseGET");
        },
        function (assert, fnSuccess, fnError, oCallbacksMock) {
            var oErrorGET = {}, oResponsePOST = {};
            fnSuccess("~oDataPOST", oResponsePOST);
            this.oLogMock.expects("error").withExactArgs("Function '/~sFunctionName' was called successfully, but expansion" + " of navigation properties (~expand) failed", sinon.match.same(oErrorGET), sClassName);
            oCallbacksMock.expects("success").withExactArgs("~oDataPOST", sinon.match.same(oResponsePOST).and(sinon.match.hasOwn("expandAfterFunctionCallFailed", true))).exactly(bWithCallbacks ? 1 : 0);
            fnError(oErrorGET);
            assert.strictEqual(oErrorGET.expandAfterFunctionCallFailed, true);
        },
        function (assert, fnSuccess, fnError, oCallbacksMock) {
            var oErrorGET = {};
            oCallbacksMock.expects("error").withExactArgs("~oErrorPOST").exactly(bWithCallbacks ? 1 : 0);
            fnError("~oErrorPOST");
            fnError(oErrorGET);
            assert.strictEqual(oErrorGET.expandAfterFunctionCallFailed, true);
        }
    ].forEach(function (fnCallbackHandling, i) {
        var sTitle = "callFunction: with expand; with callback handlers: " + bWithCallbacks + ", #" + i;
        QUnit.test(sTitle, function (assert) {
            var fnError, fnProcessRequest, oResult, oResultingRequest, fnSuccess, sUid, oCallbacks = {
                error: function () { },
                success: function () { }
            }, oCallbacksMock = this.mock(oCallbacks), oExpandRequest = {}, oFunctionCallRequest = {}, oFunctionMetadata = {
                entitySet: "~entitySet",
                parameter: null,
                returnType: "~returnType"
            }, mInputHeaders = { foo: "bar" }, oMetadata = {
                _getCanonicalPathOfFunctionImport: function () { },
                _getFunctionImportMetadata: function () { }
            }, oModel = {
                mDeferredGroups: {},
                oMetadata: oMetadata,
                mRequests: "~mRequests",
                bUseBatch: true,
                sServiceUrl: "/service/url",
                _addEntity: function () { },
                _createRequest: function () { },
                _createRequestUrlWithNormalizedPath: function () { },
                _getHeaders: function () { },
                _getRefreshAfterChange: function () { },
                _processRequest: function () { },
                _pushToRequestQueue: function () { },
                _writePathCache: function () { },
                getContext: function () { }
            }, oModelMock = this.mock(oModel);
            oCallbacksMock.expects("error").never();
            oCallbacksMock.expects("success").never();
            oModelMock.expects("_getRefreshAfterChange").returns("~bRefreshAfterChange");
            oModelMock.expects("_processRequest").withExactArgs(sinon.match.func, bWithCallbacks ? sinon.match.same(oCallbacks.error) : undefined).callsFake(function (fnProcessRequest0) {
                fnProcessRequest = fnProcessRequest0;
                return {};
            });
            oResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
                error: bWithCallbacks ? oCallbacks.error : undefined,
                eTag: "~eTag",
                expand: "~expand",
                headers: mInputHeaders,
                method: "POST",
                success: bWithCallbacks ? oCallbacks.success : undefined
            });
            this.mock(oMetadata).expects("_getFunctionImportMetadata").withExactArgs("/~sFunctionName", "POST").returns(oFunctionMetadata);
            oModelMock.expects("_addEntity").callsFake(function (oData) {
                sUid = rTemporaryKey.exec(oData.__metadata.uri)[1];
                fnError = oData.__metadata.created.error;
                fnSuccess = oData.__metadata.created.success;
                assert.ok(typeof fnError === "function");
                assert.notStrictEqual(fnError, oCallbacks.error, "wrapped error handler");
                assert.ok(typeof fnSuccess === "function");
                assert.notStrictEqual(fnSuccess, oCallbacks.success, "wrapped success handler");
                assert.notStrictEqual(oData.__metadata.created.headers, mInputHeaders);
                assert.deepEqual(oData.__metadata.created.headers, {
                    "Content-ID": sUid,
                    foo: "bar",
                    "sap-messages": "transientOnly"
                });
                return "~sKey";
            });
            oModelMock.expects("getContext").withExactArgs("/~sKey").returns("~oContext");
            oModelMock.expects("_writePathCache").withExactArgs("/~sKey", "/~sKey");
            this.mock(ODataUtils).expects("_createUrlParamsArray").returns("~aUrlParams");
            oModelMock.expects("_createRequestUrlWithNormalizedPath").returns("~sUrl");
            oModelMock.expects("_getHeaders").withExactArgs(sinon.match(function (mHeaders0) {
                assert.notStrictEqual(mHeaders0, mInputHeaders);
                assert.deepEqual(mHeaders0, {
                    "Content-ID": sUid,
                    foo: "bar",
                    "sap-messages": "transientOnly"
                });
                return true;
            })).returns("~mHeadersPOST");
            oModelMock.expects("_createRequest").withExactArgs("~sUrl", "/~sFunctionName", "POST", "~mHeadersPOST", undefined, "~eTag", undefined, true).returns(oFunctionCallRequest);
            this.mock(oMetadata).expects("_getCanonicalPathOfFunctionImport").returns("~functionTarget");
            this.mock(ODataUtils).expects("_encodeURLParameters").withExactArgs({ $expand: "~expand", $select: "~expand" }).returns("~expandselect");
            oModelMock.expects("_getHeaders").withExactArgs(undefined, true).returns("~mHeadersGET");
            oModelMock.expects("_createRequest").withExactArgs(sinon.match.string, sinon.match.string, "GET", "~mHeadersGET", undefined, undefined, undefined, true).callsFake(function (sUrl, sDeepPath) {
                assert.strictEqual(sUrl, "$" + sUid + "?~expandselect");
                assert.strictEqual(sDeepPath, "/$" + sUid);
                return oExpandRequest;
            });
            oModelMock.expects("_pushToRequestQueue").withExactArgs("~mRequests", undefined, undefined, sinon.match.same(oFunctionCallRequest), sinon.match(function (fnSuccess0) { return fnSuccess0 === fnSuccess; }), sinon.match(function (fnError0) { return fnError0 === fnError; }), "~requestHandle", "~bRefreshAfterChange");
            oResultingRequest = fnProcessRequest("~requestHandle");
            assert.strictEqual(oResultingRequest, oFunctionCallRequest);
            assert.strictEqual(oResultingRequest.contentID, sUid);
            assert.strictEqual(oResultingRequest.expandRequest, oExpandRequest);
            assert.strictEqual(oResultingRequest.expandRequest.contentID, sUid);
            fnCallbackHandling.call(this, assert, fnSuccess, fnError, oCallbacksMock);
            return oResult.contextCreated();
        });
    });
});
QUnit.test("getDeepPathForCanonicalPath", function (assert) {
    var oModel = {
        checkFilterOperation: function () { },
        createCustomParams: function () { return {}; },
        resolveDeep: function () { },
        resolveFromCache: function () { }
    }, oModelMock = this.mock(oModel), oContextBinding = new ODataContextBinding(oModel, "path/to/entity", "~oContext0"), oListBinding, oPropertyBinding, oTreeBinding = new ODataTreeBinding(oModel, "path4tree", "~oContext3"), oUnresolvedBinding = new ODataContextBinding(oModel, "path/unbound");
    oModelMock.expects("resolveDeep").withExactArgs("path/to/collection", "~oContext1").returns("/deep/path/to/collection");
    this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs().returns(false);
    oListBinding = new ODataListBinding(oModel, "path/to/collection", "~oContext1");
    this.mock(ODataPropertyBinding.prototype).expects("_getValue").withExactArgs().returns("foo");
    this.mock(ODataPropertyBinding.prototype).expects("getDataState").withExactArgs().returns({ setValue: function () { } });
    oPropertyBinding = new ODataPropertyBinding(oModel, "path/to/property", "~oContext2");
    oModel.aBindings = [oTreeBinding, oPropertyBinding, oContextBinding, oListBinding, oUnresolvedBinding];
    oModelMock.expects("resolveDeep").withExactArgs("path/to/entity", "~oContext0").returns("/deep/path/to/entity");
    oModelMock.expects("resolveFromCache").withExactArgs("/deep/path/to/entity").returns("/~sCanonicalPath(42)");
    oModelMock.expects("resolveDeep").withExactArgs("path/to/collection(42)", "~oContext1").returns("/deep/path/to/collection(42)");
    oModelMock.expects("resolveFromCache").withExactArgs("/deep/path/to/collection(42)").returns("/~sCanonicalPath0(42)");
    assert.strictEqual(ODataModel.prototype.getDeepPathForCanonicalPath.call(oModel, "/~sCanonicalPath(42)"), "/deep/path/to/entity");
});
QUnit.test("getDeepPathForCanonicalPath: different deep paths", function (assert) {
    var oModel = {
        resolveDeep: function () { },
        resolveFromCache: function () { }
    }, oModelMock = this.mock(oModel), oContextBinding0 = new ODataContextBinding(oModel, "path2entity", "~oContext0"), oContextBinding1 = new ODataContextBinding(oModel, "another/path2entity", "~oContext1");
    oModel.aBindings = [oContextBinding0, oContextBinding1];
    oModelMock.expects("resolveDeep").withExactArgs("path2entity", "~oContext0").returns("/deep/path2entity");
    oModelMock.expects("resolveFromCache").withExactArgs("/deep/path2entity").returns("/~sCanonicalPath(42)");
    oModelMock.expects("resolveDeep").withExactArgs("another/path2entity", "~oContext1").returns("/deep/another/path2entity");
    oModelMock.expects("resolveFromCache").withExactArgs("/deep/another/path2entity").returns("/~sCanonicalPath(42)");
    assert.strictEqual(ODataModel.prototype.getDeepPathForCanonicalPath.call(oModel, "/~sCanonicalPath(42)"), undefined);
});
QUnit.test("getDeepPathForCanonicalPath: same deep path", function (assert) {
    var oModel = {
        resolveDeep: function () { },
        resolveFromCache: function () { }
    }, oModelMock = this.mock(oModel), oContextBinding0 = new ODataContextBinding(oModel, "path2entity", "~oContext0"), oContextBinding1 = new ODataContextBinding(oModel, "another/path2entity", "~oContext1");
    oModel.aBindings = [oContextBinding0, oContextBinding1];
    oModelMock.expects("resolveDeep").withExactArgs("path2entity", "~oContext0").returns("/same/deep/path2entity");
    oModelMock.expects("resolveFromCache").withExactArgs("/same/deep/path2entity").returns("/~sCanonicalPath(42)");
    oModelMock.expects("resolveDeep").withExactArgs("another/path2entity", "~oContext1").returns("/same/deep/path2entity");
    oModelMock.expects("resolveFromCache").withExactArgs("/same/deep/path2entity").returns("/~sCanonicalPath(42)");
    assert.strictEqual(ODataModel.prototype.getDeepPathForCanonicalPath.call(oModel, "/~sCanonicalPath(42)"), "/same/deep/path2entity");
});
[{
        functionMetadata: undefined,
        functionTarget: "~functionTarget",
        method: "GET",
        expectedRequest: {
            functionMetadata: undefined
        }
    }, {
        functionMetadata: "~functionMetadata",
        functionTarget: "~functionTarget",
        method: "GET",
        expectedRequest: {
            functionMetadata: "~functionMetadata",
            functionTarget: "~functionTarget",
            requestUri: "~requestUri"
        }
    }, {
        functionMetadata: "~functionMetadata",
        functionTarget: "~functionTarget",
        method: "POST",
        expectedRequest: {
            data: "~data",
            functionMetadata: "~functionMetadata",
            functionTarget: "~functionTarget",
            headers: "~headers",
            method: "POST",
            requestUri: "~requestUri"
        }
    }].forEach(function (oFixture, i) {
    var sTitle = "_pushToRequestQueue: restore functionTarget and requestUri for function imports; " + i;
    QUnit.test(sTitle, function (assert) {
        var oModel = {}, oRequest = {
            data: "~data",
            functionTarget: oFixture.functionTarget,
            headers: "~headers",
            key: "~key",
            method: oFixture.method,
            requestUri: "~requestUri"
        }, mRequests = {
            "~sGroupId": {
                map: {
                    "~key": {
                        request: { functionMetadata: oFixture.functionMetadata }
                    }
                }
            }
        };
        ODataModel.prototype._pushToRequestQueue.call(oModel, mRequests, "~sGroupId", undefined, oRequest);
        assert.deepEqual(mRequests["~sGroupId"].map["~key"].request, oFixture.expectedRequest);
    });
});
QUnit.test("_parseResponse, message parser exists", function (assert) {
    var oModel = {
        bIsMessageScopeSupported: "~bIsMessageScopeSupported",
        oMessageParser: {
            parse: function () { }
        }
    };
    this.mock(oModel.oMessageParser).expects("parse").withExactArgs("~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities", "~bIsMessageScopeSupported");
    ODataModel.prototype._parseResponse.call(oModel, "~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities");
});
[
    { bPersist: true, bExpected: true },
    { bPersist: undefined, bExpected: false },
    { bPersist: false, bExpected: false }
].forEach(function (oFixture) {
    QUnit.test("_parseResponse, message parser does not exist", function (assert) {
        var oModel = {
            bIsMessageScopeSupported: "~bIsMessageScopeSupported",
            bPersistTechnicalMessages: oFixture.bPersist,
            oMetadata: "~oMetadata",
            sServiceUrl: "/service/"
        };
        this.mock(ODataMessageParser.prototype).expects("parse").withExactArgs("~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities", "~bIsMessageScopeSupported");
        this.mock(ODataMessageParser.prototype).expects("setProcessor").withExactArgs(sinon.match.same(oModel));
        ODataModel.prototype._parseResponse.call(oModel, "~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities");
        assert.strictEqual(oModel.oMessageParser._serviceUrl, "/service/");
        assert.strictEqual(oModel.oMessageParser._metadata, "~oMetadata");
        assert.strictEqual(oModel.oMessageParser._bPersistTechnicalMessages, oFixture.bExpected);
    });
});
QUnit.test("_parseResponse, parse function throws error", function (assert) {
    var sError = "error", oModel = {
        bIsMessageScopeSupported: "~bIsMessageScopeSupported",
        oMessageParser: {
            parse: function () { }
        }
    };
    this.mock(oModel.oMessageParser).expects("parse").withExactArgs("~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities", "~bIsMessageScopeSupported").throws(sError);
    this.oLogMock.expects("error").withExactArgs("Error parsing OData messages: " + sError);
    ODataModel.prototype._parseResponse.call(oModel, "~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities");
});
[
    { _setPersistTechnicalMessages: function () { } },
    undefined
].forEach(function (oODataMessageParser, i) {
    [
        { persist: true, result: true },
        { persist: "foo", result: true },
        { persist: false, result: false },
        { persist: undefined, result: false },
        { persist: null, result: false }
    ].forEach(function (oFixture) {
        var sTitle = "setPersistTechnicalMessages: " + oFixture.persist + "; #" + i;
        QUnit.test(sTitle, function (assert) {
            var oODataModel = {
                oMessageParser: oODataMessageParser
            }, oODataMessageParserMock = oODataMessageParser ? this.mock(oODataMessageParser) : undefined;
            if (oODataMessageParserMock) {
                oODataMessageParserMock.expects("_setPersistTechnicalMessages").withExactArgs(oFixture.result);
            }
            ODataModel.prototype.setPersistTechnicalMessages.call(oODataModel, oFixture.persist);
            assert.strictEqual(oODataModel.bPersistTechnicalMessages, oFixture.result);
            if (oODataMessageParserMock) {
                oODataMessageParserMock.expects("_setPersistTechnicalMessages").exactly(0);
            }
            ODataModel.prototype.setPersistTechnicalMessages.call(oODataModel, oFixture.persist);
            assert.strictEqual(oODataModel.bPersistTechnicalMessages, oFixture.result);
            this.oLogMock.expects("warning").withExactArgs("The flag whether technical messages should always be treated as" + " persistent has been overwritten to " + !oFixture.result, undefined, sClassName);
            if (oODataMessageParserMock) {
                oODataMessageParserMock.expects("_setPersistTechnicalMessages").withExactArgs(!oFixture.result);
            }
            ODataModel.prototype.setPersistTechnicalMessages.call(oODataModel, !oFixture.persist);
            assert.strictEqual(oODataModel.bPersistTechnicalMessages, !oFixture.result);
        });
    });
});
[true, false, undefined].forEach(function (bPersist) {
    QUnit.test("getPersistTechnicalMessages: " + bPersist, function (assert) {
        var oODataModel = {
            bPersistTechnicalMessages: bPersist
        };
        assert.strictEqual(ODataModel.prototype.getPersistTechnicalMessages.call(oODataModel), bPersist);
    });
});
[{
        oEntry: undefined,
        sETag: undefined,
        oExpectedEntry: undefined
    }, {
        oEntry: {},
        sETag: "~etag",
        oExpectedEntry: {}
    }, {
        oEntry: { __metadata: {} },
        sETag: undefined,
        oExpectedEntry: { __metadata: {} }
    }, {
        oEntry: { __metadata: {} },
        sETag: "~etag",
        oExpectedEntry: { __metadata: { etag: "~etag" } }
    }].forEach(function (oFixture, i) {
    QUnit.test("_updateETag: " + i, function (assert) {
        var oModel = {
            _getHeader: function () { },
            _getObject: function () { },
            sServiceUrl: "/service_url"
        }, oRequest = {
            requestUri: "/service_url/~requestedEntity?filter"
        }, oResponse = {
            headers: "~headers"
        };
        this.mock(oModel).expects("_getObject").withExactArgs("/~requestedEntity", undefined, true).returns(oFixture.oEntry);
        this.mock(oModel).expects("_getHeader").withExactArgs("etag", "~headers").returns(oFixture.sETag);
        ODataModel.prototype._updateETag.call(oModel, oRequest, oResponse);
        assert.deepEqual(oFixture.oEntry, oFixture.oExpectedEntry);
    });
});
[{
        input: undefined,
        output: {}
    }, {
        input: null,
        output: {}
    }, {
        input: "foo",
        output: {}
    }, {
        input: 42,
        output: {}
    }, {
        input: ["a", "b", "c"],
        output: {}
    }].forEach(function (oFixture, i) {
    QUnit.test("increaseLaundering: skip laundering if oChangedEntity is not a plain object " + i, function (assert) {
        var oModel = {
            mLaunderingState: {}
        };
        ODataModel.prototype.increaseLaundering.call(oModel, "/Test", oFixture.input);
        assert.deepEqual(oModel.mLaunderingState, oFixture.output);
    });
});
[{
        input: {},
        launderingState: {},
        output: { "/Test": 1 }
    }, {
        input: { property1: "foo", property2: "bar" },
        launderingState: {},
        output: { "/Test": 1, "/Test/property1": 1, "/Test/property2": 1 }
    }, {
        input: { __metadata: {}, property1: "foo" },
        launderingState: {},
        output: { "/Test": 1, "/Test/property1": 1 }
    }, {
        increaseLaunderingPath: "/Test/property2",
        input: { property1: "foo", property2: {} },
        launderingState: {},
        output: { "/Test": 1, "/Test/property1": 1 }
    }, {
        input: { property1: "foo", property3: "baz" },
        launderingState: { "/Test": 1, "/Test/property1": 1, "/Test/property2": 1 },
        output: { "/Test": 2, "/Test/property1": 2, "/Test/property2": 1, "/Test/property3": 1 }
    }].forEach(function (oFixture, i) {
    QUnit.test("increaseLaundering: oChangedEntity is a plain object " + i, function (assert) {
        var sIncreaseLaunderingPath = oFixture.increaseLaunderingPath || "", oModel = {
            increaseLaundering: function () { },
            mLaunderingState: oFixture.launderingState
        };
        this.mock(oModel).expects("increaseLaundering").withExactArgs(sIncreaseLaunderingPath, sinon.match.same(oFixture.input[sIncreaseLaunderingPath.slice(6)])).exactly(sIncreaseLaunderingPath ? 1 : 0);
        ODataModel.prototype.increaseLaundering.call(oModel, "/Test", oFixture.input);
        assert.deepEqual(oModel.mLaunderingState, oFixture.output);
    });
});
[{
        input: undefined,
        output: { "/Test": 1 }
    }, {
        input: null,
        output: { "/Test": 1 }
    }, {
        input: "foo",
        output: { "/Test": 1 }
    }, {
        input: 42,
        output: { "/Test": 1 }
    }, {
        input: ["a", "b", "c"],
        output: { "/Test": 1 }
    }].forEach(function (oFixture, i) {
    QUnit.test("decreaseLaundering: skip laundering if oChangedEntity is not a plain object " + i, function (assert) {
        var oModel = {
            mLaunderingState: { "/Test": 1 }
        };
        ODataModel.prototype.decreaseLaundering.call(oModel, "/Test", oFixture.input);
        assert.deepEqual(oModel.mLaunderingState, oFixture.output);
    });
});
[{
        input: {},
        launderingState: { "/Test": 1 },
        output: {}
    }, {
        input: { property1: "foo", property2: "bar" },
        launderingState: { "/Test": 1, "/Test/property1": 1, "/Test/property2": 1 },
        output: {}
    }, {
        input: { __metadata: {}, property1: "foo" },
        launderingState: { "/Test": 1, "/Test/property1": 1 },
        output: {}
    }, {
        decreaseLaunderingPath: "/Test/property2",
        input: { property1: "foo", property2: {} },
        launderingState: { "/Test": 1, "/Test/property1": 1 },
        output: {}
    }, {
        input: { property1: "foo", property3: "baz" },
        launderingState: { "/Test": 2, "/Test/property1": 2, "/Test/property2": 1, "/Test/property3": 1 },
        output: { "/Test": 1, "/Test/property1": 1, "/Test/property2": 1 }
    }].forEach(function (oFixture, i) {
    QUnit.test("decreaseLaundering: oChangedEntity is a plain object " + i, function (assert) {
        var sDecreaseLaunderingPath = oFixture.decreaseLaunderingPath || "", oModel = {
            decreaseLaundering: function () { },
            mLaunderingState: oFixture.launderingState
        };
        this.mock(oModel).expects("decreaseLaundering").withExactArgs(sDecreaseLaunderingPath, sinon.match.same(oFixture.input[sDecreaseLaunderingPath.slice(6)])).exactly(sDecreaseLaunderingPath ? 1 : 0);
        ODataModel.prototype.decreaseLaundering.call(oModel, "/Test", oFixture.input);
        assert.deepEqual(oModel.mLaunderingState, oFixture.output);
    });
});
QUnit.test("_processError: update deep path for function imports", function (assert) {
    var oModel = {
        _createEventInfo: function () { },
        _handleError: function () { },
        fireBatchRequestCompleted: function () { },
        fireBatchRequestFailed: function () { }
    }, oRequest = {
        deepPath: "~deepPath",
        functionMetadata: "~functionMetadata",
        functionTarget: "~functionTarget"
    };
    this.mock(oModel).expects("_handleError").withExactArgs("~oResponse", sinon.match.same(oRequest).and(sinon.match.has("deepPath", "~functionTarget"))).returns("~oError");
    this.mock(oModel).expects("_createEventInfo").withExactArgs(sinon.match.same(oRequest), "~oError", "~aRequests").returns("~oEventInfo");
    this.mock(oModel).expects("fireBatchRequestCompleted").withExactArgs("~oEventInfo");
    this.mock(oModel).expects("fireBatchRequestFailed").withExactArgs("~oEventInfo");
    ODataModel.prototype._processError.call(oModel, oRequest, "~oResponse", undefined, "~bBatch", "~aRequests");
    assert.strictEqual(oRequest.deepPath, "~functionTarget");
    assert.strictEqual(oRequest.deepPath, oRequest.functionTarget);
});
QUnit.test("_submitRequest: avoid TypeError if request is aborted", function (assert) {
    var done = assert.async(), oModel = {
        pReadyForRequest: Promise.resolve(),
        _getODataHandler: function () { },
        _request: function () { },
        getServiceMetadata: function () { }
    }, oRequest = { requestUri: "~uri" };
    this.mock(oModel).expects("_getODataHandler").withExactArgs("~uri").returns("~oHandler");
    ODataModel.prototype._submitRequest.call(oModel, oRequest).abort();
    this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns("~metadata");
    this.mock(oModel).expects("_request").withExactArgs(sinon.match.same(oRequest), sinon.match.func, sinon.match.func, "~oHandler", undefined, "~metadata").callsFake(function () {
        Promise.resolve().then(done);
        return undefined;
    });
});
["fulfilled", "pending", "rejected"].forEach(function (sCase) {
    [false, true].forEach(function (bMetaModelLoaded) {
        var sTitle = "_getObject: code list path, " + sCase + "; bMetaModelLoaded=" + bMetaModelLoaded;
        QUnit.test(sTitle, function (assert) {
            var oFetchCodeListPromise, oMetaModel = {
                fetchCodeList: function () { }
            }, oModel = {
                oMetadata: { isLoaded: function () { } },
                bMetaModelLoaded: bMetaModelLoaded,
                _isMetadataPath: function () { },
                getMetaModel: function () { },
                isLegacySyntax: function () { },
                isMetaModelPath: function () { },
                resolve: function () { }
            };
            if (sCase === "fulfilled") {
                oFetchCodeListPromise = SyncPromise.resolve("~mCodeList");
            }
            else {
                oFetchCodeListPromise = sCase === "pending" ? SyncPromise.resolve(Promise.resolve("~mCodeList")) : SyncPromise.reject("~error");
            }
            this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
            this.mock(oModel).expects("resolve").withExactArgs("~path", undefined, undefined).returns("~resolvedPath");
            this.mock(oModel).expects("_isMetadataPath").withExactArgs("~resolvedPath").returns(true);
            this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
            this.mock(oModel).expects("isMetaModelPath").withExactArgs("~resolvedPath").returns(true);
            this.mock(oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
            this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~resolvedPath").returns("~term");
            this.mock(oMetaModel).expects("fetchCodeList").withExactArgs("~term").returns(oFetchCodeListPromise);
            assert.strictEqual(ODataModel.prototype._getObject.call(oModel, "~path"), sCase === "fulfilled" ? "~mCodeList" : undefined);
            return oFetchCodeListPromise.isPending() ? oFetchCodeListPromise : undefined;
        });
    });
});
QUnit.test("_getObject: code list path, oMetadata.isLoaded=false", function (assert) {
    var oModel = {
        oMetadata: { isLoaded: function () { } },
        _isMetadataPath: function () { },
        isLegacySyntax: function () { },
        resolve: function () { }
    };
    this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
    this.mock(oModel).expects("resolve").withExactArgs("~path", undefined, undefined).returns("~resolvedPath");
    this.mock(oModel).expects("_isMetadataPath").withExactArgs("~resolvedPath").returns(true);
    this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(false);
    this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~resolvedPath").returns("~term");
    assert.strictEqual(ODataModel.prototype._getObject.call(oModel, "~path"), undefined);
});
QUnit.test("annotationsLoaded", function (assert) {
    var oModel = { pAnnotationsLoaded: "~pAnnotationsLoaded" };
    assert.strictEqual(ODataModel.prototype.annotationsLoaded.call(oModel), "~pAnnotationsLoaded");
});
QUnit.test("getMetaModel: new meta model - successfully loaded", function (assert) {
    var oData = { foo: "bar" }, oMetaModel, oModel = {
        oAnnotations: undefined,
        oMetadata: {
            getServiceMetadata: function () { },
            isLoaded: function () { }
        },
        oMetaModel: undefined,
        bMetaModelLoaded: "~bMetaModelLoaded",
        annotationsLoaded: function () { },
        checkUpdate: function () { }
    };
    this.mock(oModel).expects("annotationsLoaded").withExactArgs().returns(Promise.resolve());
    this.mock(oModel.oMetadata).expects("getServiceMetadata").withExactArgs().returns(oData);
    oMetaModel = ODataModel.prototype.getMetaModel.call(oModel);
    assert.ok(oMetaModel instanceof ODataMetaModel);
    assert.strictEqual(oModel.oMetaModel, oMetaModel);
    assert.strictEqual(oModel.bMetaModelLoaded, "~bMetaModelLoaded", "bMetaModelLoaded is unchanged until the meta model is loaded");
    this.mock(_ODataMetaModelUtils).expects("merge").withExactArgs({}, oData, sinon.match.same(oMetaModel));
    this.mock(oModel).expects("checkUpdate").withExactArgs(false, false, null, true).callsFake(function () {
        assert.strictEqual(oModel.bMetaModelLoaded, true, "checkUpdate called after the meta model is loaded");
    });
    return oMetaModel.loaded().then(function () {
        assert.strictEqual(oModel.bMetaModelLoaded, true);
    });
});
QUnit.test("getMetaModel: meta model already available", function (assert) {
    var oModel = { oMetaModel: "~oMetaModel" };
    assert.strictEqual(ODataModel.prototype.getMetaModel.call(oModel), "~oMetaModel");
});
QUnit.test("createCodeListModelParameters: mParameters=undefined and defaulting", function (assert) {
    var mExpectedResult = {
        defaultCountMode: CountMode.None,
        disableSoftStateHeader: true,
        headers: undefined,
        json: undefined,
        metadataUrlParams: undefined,
        persistTechnicalMessages: undefined,
        serviceUrl: "~serviceUrl",
        serviceUrlParams: undefined,
        tokenHandling: false,
        useBatch: false,
        warmupUrl: undefined
    }, oModel = { sServiceUrl: "~serviceUrl" };
    assert.deepEqual(ODataModel.prototype.createCodeListModelParameters.call(oModel), mExpectedResult);
});
QUnit.test("createCodeListModelParameters: w/ mParameters and defaulting", function (assert) {
    var mExpectedResult = {
        defaultCountMode: CountMode.None,
        disableSoftStateHeader: true,
        headers: { foo: "bar" },
        json: "~json",
        metadataUrlParams: { meta: "data" },
        persistTechnicalMessages: "~persist",
        serviceUrl: "~serviceUrl",
        serviceUrlParams: { service: "url" },
        tokenHandling: false,
        useBatch: false,
        warmupUrl: "~warmupUrl"
    }, oModel = { sServiceUrl: "~serviceUrl" }, mParameters = {
        defaultCountMode: "~countMode",
        disableSoftStateHeader: false,
        headers: { foo: "bar" },
        json: "~json",
        metadataUrlParams: { meta: "data" },
        persistTechnicalMessages: "~persist",
        serviceUrl: "~serviceUrl",
        serviceUrlParams: { service: "url" },
        tokenHandling: true,
        useBatch: true,
        warmupUrl: "~warmupUrl"
    }, mResults;
    mResults = ODataModel.prototype.createCodeListModelParameters.call(oModel, mParameters);
    assert.deepEqual(mResults, mExpectedResult);
    assert.notStrictEqual(mResults.headers, mParameters.headers);
    assert.notStrictEqual(mResults.metadataUrlParams, mParameters.metadataUrlParams);
    assert.notStrictEqual(mResults.serviceUrlParams, mParameters.serviceUrlParams);
});
QUnit.test("getCodeListModelParameters", function (assert) {
    var oModel = { mCodeListModelParams: "~mCodeListModelParams" };
    assert.strictEqual(ODataModel.prototype.getCodeListModelParameters.call(oModel), "~mCodeListModelParams");
});
QUnit.test("getMetadataUrl", function (assert) {
    var oModel = { sMetadataUrl: "~metadataUrl" };
    assert.strictEqual(ODataModel.prototype.getMetadataUrl.call(oModel), "~metadataUrl");
});
QUnit.test("_updateContext", function (assert) {
    var oModel = { mContexts: {} }, oContext = new BaseContext(oModel, "/path");
    oModel.mContexts["/path"] = oContext;
    assert.strictEqual(oContext.getPath(), "/path");
    assert.strictEqual(oContext.sDeepPath, "");
    ODataModel.prototype._updateContext.call(oModel, oContext, "/newPath");
    assert.strictEqual(oContext.getPath(), "/newPath");
    assert.strictEqual(oContext.sDeepPath, "", "deep path is not changed");
    assert.deepEqual(oModel.mContexts, {
        "/path": oContext,
        "/newPath": oContext
    });
    ODataModel.prototype._updateContext.call(oModel, oContext, "/newPath2", "/deep/newPath2");
    assert.strictEqual(oContext.getPath(), "/newPath2");
    assert.strictEqual(oContext.sDeepPath, "/deep/newPath2");
    assert.deepEqual(oModel.mContexts, {
        "/path": oContext,
        "/newPath": oContext,
        "/newPath2": oContext
    });
});
QUnit.test("refreshSecurityToken: call _handleError with oRequest", function (assert) {
    var fnError, oResult, oModel = {
        bDisableHeadRequestForToken: true,
        _createRequest: function () { },
        _createRequestUrlWithNormalizedPath: function () { },
        _getHeaders: function () { },
        _handleError: function () { },
        _request: function () { },
        getServiceMetadata: function () { },
        resetSecurityToken: function () { }
    }, oRequest = { headers: {} };
    this.mock(oModel).expects("_createRequestUrlWithNormalizedPath").withExactArgs("/").returns("~sUrl");
    this.mock(oModel).expects("_getHeaders").withExactArgs(undefined, true).returns("~headers");
    this.mock(oModel).expects("_createRequest").withExactArgs("~sUrl", "", "GET", "~headers", null, null, false).returns(oRequest);
    this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns("~serviceMetadata");
    this.mock(oModel).expects("_request").withExactArgs(sinon.match.same(oRequest), sinon.match.func, sinon.match(function (fnError0) {
        fnError = fnError0;
        return true;
    }), undefined, undefined, "~serviceMetadata").returns("~requestHandle");
    oResult = ODataModel.prototype.refreshSecurityToken.call(oModel);
    assert.strictEqual(oResult.request, "~requestHandle");
    this.mock(oModel).expects("resetSecurityToken").withExactArgs();
    this.mock(oModel).expects("_handleError").withExactArgs("~error", sinon.match.same(oRequest));
    fnError("~error");
    assert.strictEqual(oModel.bTokenHandling, false);
});
QUnit.test("getContext", function (assert) {
    var oContext, oContext1, oContextPrototypeMock = this.mock(Context.prototype), oModel = { mContexts: {} };
    oContextPrototypeMock.expects("setDeepPath").never();
    oContext = ODataModel.prototype.getContext.call(oModel, "/~sPath");
    assert.ok(oContext instanceof Context);
    assert.strictEqual(oContext.getModel(), oModel);
    assert.strictEqual(oContext.getPath(), "/~sPath");
    assert.strictEqual(oContext.getDeepPath(), "/~sPath");
    oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath1", "/~sDeepPath1");
    assert.notStrictEqual(oContext1, oContext);
    assert.strictEqual(oContext1.getPath(), "/~sPath1");
    assert.strictEqual(oContext1.getDeepPath(), "/~sDeepPath1");
    oContextPrototypeMock.expects("getDeepPath").never();
    oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sDeepPath");
    oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath", "/~sDeepPath");
    assert.strictEqual(oContext1, oContext);
    oContextPrototypeMock.expects("getDeepPath").on(oContext).withArgs().returns("/~sDeepPathFromGetter");
    oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sDeepPathFromGetter");
    oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath");
    oContextPrototypeMock.expects("getDeepPath").never();
    oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sDeepPath2");
    oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath", "/~sDeepPath2");
    oContextPrototypeMock.expects("getDeepPath").on(oContext).withArgs().returns("");
    oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sPath");
    oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath", "");
});
[false, true].forEach(function (bAll) {
    QUnit.test("resetChanges: no paths; bAll=" + bAll, function (assert) {
        var oModel = {
            mChangedEntities: {
                "key('Bar')": { __metadata: "~oBarMetadata" },
                "key('Foo')": { __metadata: "~oFooMetadata" }
            },
            mDeferredGroups: {
                deferred0: {},
                deferred1: {}
            },
            oMetadata: {
                loaded: function () { }
            },
            _discardEntityChanges: function () { },
            abortInternalRequest: function () { },
            checkUpdate: function () { }
        }, oModelMock = this.mock(oModel), fnResolve, oPromise = new Promise(function (resolve) {
            fnResolve = resolve;
        });
        this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oPromise);
        oModelMock.expects("_discardEntityChanges").withExactArgs("key('Bar')", "~bDeleteCreatedEntities", "~oBarMetadata").callsFake(function (sKey) {
            delete this.mChangedEntities[sKey];
        });
        oModelMock.expects("_discardEntityChanges").withExactArgs("key('Foo')", "~bDeleteCreatedEntities", "~oFooMetadata").callsFake(function (sKey) {
            delete this.mChangedEntities[sKey];
        });
        oModelMock.expects("checkUpdate").withExactArgs(true);
        assert.strictEqual(ODataModel.prototype.resetChanges.call(oModel, undefined, bAll, "~bDeleteCreatedEntities"), oPromise);
        assert.deepEqual(oModel.mChangedEntities, {});
        oModelMock.expects("abortInternalRequest").withExactArgs("deferred0").exactly(bAll ? 1 : 0);
        oModelMock.expects("abortInternalRequest").withExactArgs("deferred1").exactly(bAll ? 1 : 0);
        fnResolve();
        return oPromise;
    });
});
[false, true].forEach(function (bAll) {
    QUnit.test("resetChanges: with paths; bAll=" + bAll, function (assert) {
        var oBarMetadata = {}, oQuxMetadata = {}, oModel = {
            mChangedEntities: {
                "key('Bar')": { __metadata: oBarMetadata, P: "prop0", Q: "prop1" },
                "key('Foo')": {},
                "key('Qux')": { __metadata: oQuxMetadata, R: "prop2" }
            },
            mDeferredGroups: {
                deferred0: {},
                deferred1: {}
            },
            oMetadata: {
                loaded: function () { }
            },
            _discardEntityChanges: function () { },
            abortInternalRequest: function () { },
            checkUpdate: function () { },
            getEntityByPath: function () { }
        }, oModelMock = this.mock(oModel), fnResolve, oPromise = new Promise(function (resolve) {
            fnResolve = resolve;
        });
        this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oPromise);
        oModelMock.expects("getEntityByPath").withExactArgs("/Z", null, {}).callsFake(function (sPath, oContext, oEntityInfo) {
            oEntityInfo.key = "key('Z')";
            oEntityInfo.propertyPath = "";
            return "~oZEntity";
        });
        oModelMock.expects("getEntityByPath").withExactArgs("/Z/Y/X", null, {}).callsFake(function (sPath, oContext, oEntityInfo) {
            oEntityInfo.key = "key('Z')";
            oEntityInfo.propertyPath = "Y/X";
            return "~oZEntity";
        });
        oModelMock.expects("getEntityByPath").withExactArgs("/Bar/P", null, {}).callsFake(function (sPath, oContext, oEntityInfo) {
            oEntityInfo.key = "key('Bar')";
            oEntityInfo.propertyPath = "P";
            return "~oBarEntity";
        });
        oModelMock.expects("getEntityByPath").withExactArgs("/Baz", null, {}).callsFake(function () {
            return null;
        });
        oModelMock.expects("getEntityByPath").withExactArgs("/Bar/Q/X", null, {}).callsFake(function (sPath, oContext, oEntityInfo) {
            oEntityInfo.key = "key('Bar')";
            oEntityInfo.propertyPath = "Q/X";
            return "~oBarEntity";
        });
        oModelMock.expects("getEntityByPath").withExactArgs("/Qux", null, {}).callsFake(function (sPath, oContext, oEntityInfo) {
            oEntityInfo.key = "key('Qux')";
            oEntityInfo.propertyPath = "";
            return "~oQuxEntity";
        });
        oModelMock.expects("_discardEntityChanges").withExactArgs("key('Qux')", "~bDeleteCreatedEntities", sinon.match.same(oQuxMetadata)).callsFake(function (sKey) {
            delete this.mChangedEntities[sKey];
        });
        oModelMock.expects("checkUpdate").withExactArgs(true);
        assert.strictEqual(ODataModel.prototype.resetChanges.call(oModel, ["/Z", "/Z/Y/X", "/Bar/P", "/Baz", "/Bar/Q/X", "/Qux"], bAll, "~bDeleteCreatedEntities"), oPromise);
        assert.deepEqual(oModel.mChangedEntities, {
            "key('Bar')": { __metadata: oBarMetadata, Q: "prop1" },
            "key('Foo')": {}
        });
        assert.strictEqual(oModel.mChangedEntities["key('Bar')"].__metadata, oBarMetadata);
        if (bAll) {
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", { path: "Z" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", { path: "Z" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", { path: "Z/Y/X" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", { path: "Z/Y/X" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", { path: "Bar/P" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", { path: "Bar/P" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", { path: "Baz" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", { path: "Baz" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", { path: "Bar/Q/X" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", { path: "Bar/Q/X" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", { path: "Qux" });
            oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", { path: "Qux" });
        }
        else {
            oModelMock.expects("abortInternalRequest").never();
        }
        fnResolve();
        return oPromise;
    });
});
[true, false].forEach(function (bDeleteCreatedEntities) {
    [
        { oEntityMetadata: undefined, bCallRemove: false },
        { oEntityMetadata: {}, bCallRemove: false },
        { oEntityMetadata: { created: undefined }, bCallRemove: false },
        { oEntityMetadata: { created: {} }, bCallRemove: bDeleteCreatedEntities },
        {
            oEntityMetadata: { created: { abort: function () { } } },
            bCallAbort: bDeleteCreatedEntities,
            bCallRemove: bDeleteCreatedEntities,
            bMockAbort: true
        }
    ].forEach(function (oFixture, i) {
        var sTitle = "_discardEntityChanges: bDeleteCreatedEntities=" + bDeleteCreatedEntities + ", oEntityMetadata=" + JSON.stringify(oFixture.oEntityMetadata);
        QUnit.test(sTitle, function (assert) {
            var oMessageManagerMock = this.mock(sap.ui.getCore().getMessageManager()), oMetadata = {
                loaded: function () { }
            }, oModel = {
                mChangedEntities: {
                    foo: "bar",
                    "~sKey": "~changes"
                },
                oMetadata: oMetadata,
                _createAbortedError: function () { },
                _removeEntity: function () { },
                _resolveGroup: function () { },
                abortInternalRequest: function () { },
                getMessagesByEntity: function () { }
            }, oModelMock = this.mock(oModel), fnResolve, oPromise = new Promise(function (resolve) {
                fnResolve = resolve;
            });
            oModelMock.expects("_resolveGroup").withExactArgs("~sKey").returns({ groupId: "~groupId" });
            this.mock(oMetadata).expects("loaded").withExactArgs().returns(oPromise);
            oModelMock.expects("_removeEntity").withExactArgs("~sKey").exactly(oFixture.bCallRemove ? 1 : 0).callsFake(function (sKey) {
                delete this.mChangedEntities[sKey];
            });
            this.mock(ODataModel).expects("_createAbortedError").withExactArgs().exactly(oFixture.bCallAbort ? 1 : 0).returns("~oAbortedError");
            if (oFixture.bMockAbort) {
                this.mock(oFixture.oEntityMetadata.created).expects("abort").withExactArgs("~oAbortedError").exactly(oFixture.bCallAbort ? 1 : 0);
            }
            oModelMock.expects("getMessagesByEntity").withExactArgs("~sKey", !oFixture.bCallRemove).returns("~aMessages");
            oMessageManagerMock.expects("removeMessages").withExactArgs("~aMessages");
            assert.strictEqual(ODataModel.prototype._discardEntityChanges.call(oModel, "~sKey", bDeleteCreatedEntities, oFixture.oEntityMetadata), oPromise);
            assert.deepEqual(oModel.mChangedEntities, { foo: "bar" });
            oModelMock.expects("abortInternalRequest").withExactArgs("~groupId", { requestKey: "~sKey" });
            fnResolve();
            return oPromise;
        });
    });
});
QUnit.test("_createAbortedError", function (assert) {
    var oError0, oError1, oAbortedError = {
        aborted: true,
        headers: {},
        message: "Request aborted",
        responseText: "",
        statusCode: 0,
        statusText: "abort"
    };
    oError0 = ODataModel._createAbortedError();
    assert.deepEqual(oError0, oAbortedError);
    oError1 = ODataModel._createAbortedError();
    assert.deepEqual(oError1, oAbortedError);
    assert.notStrictEqual(oError1, oError0);
    assert.notStrictEqual(oError1.headers, oError0.headers);
});
QUnit.test("getContext with create promise", function (assert) {
    var oContext, oModel = { mContexts: {} };
    oContext = ODataModel.prototype.getContext.call(oModel, "/~sPath", undefined, "~oSyncCreatePromise");
    assert.strictEqual(oModel.mContexts["/~sPath"], oContext);
    assert.strictEqual(oContext.oSyncCreatePromise, "~oSyncCreatePromise");
    return oContext.created().then(function (oSyncPromise) {
        assert.strictEqual(oSyncPromise, undefined);
    });
});
QUnit.test("_getCreatedContextsCache", function (assert) {
    var oModel = { oCreatedContextsCache: "~oCreatedContextsCache" };
    assert.strictEqual(ODataModel.prototype._getCreatedContextsCache.call(oModel), "~oCreatedContextsCache");
});