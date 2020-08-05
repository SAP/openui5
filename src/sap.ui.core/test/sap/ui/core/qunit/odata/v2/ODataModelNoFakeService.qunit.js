/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/message/Message",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Model",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataPropertyBinding",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/ODataContextBinding",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v2/ODataTreeBinding",
	"sap/ui/test/TestUtils"
], function (Log, coreLibrary, Message, FilterProcessor, Model, MessageScope, ODataPropertyBinding,
		ODataUtils, ODataContextBinding, ODataListBinding, ODataModel, ODataTreeBinding, TestUtils
) {
	/*global QUnit,sinon*/
	/*eslint camelcase: 0, max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.v2.ODataModel",
		iCount = 1000,
		rTemporaryKey = /\('(id-[^']+)'\)$/;

	// Copied from ExpressionParser.performance.qunit
	function repeatedTest(assert, fnTest) {
		var i, iStart = Date.now(), iDuration;

		for (i = iCount; i; i -= 1) {
			fnTest();
		}
		iDuration = Date.now() - iStart;
		assert.ok(true, iCount + " iterations took " + iDuration + " ms, that is "
			+ iDuration / iCount + " ms per iteration");
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataModel (ODataModelNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
	QUnit.test("read: updateAggregatedMessages passed to _createRequest", function (assert) {
		var bCanonicalRequest = "{boolean} bCanonicalRequest",
			oContext = "{sap.ui.model.Context} oContext",
			sDeepPath = "~deepPath",
			oEntityType = "{object} oEntityType",
			fnError = {/*function*/},
			sETag = "~etag",
			oFilter = "{object} oFilter",
			sFilterParams = "~$filter",
			aFilters = "{sap.ui.model.Filter[]} aFilters",
			mGetHeaders = "{object} mGetHeaders",
			sGroupId = "~groupId",
			mHeaders = "{object} mHeaders",
			bIsCanonicalRequestNeeded = "{boolean} bIsCanonicalRequestNeeded",
			oModel = {
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getHeaders : function () {},
				_getETag : function () {},
				_isCanonicalRequestNeeded : function () {},
				_normalizePath : function () {},
				_pushToRequestQueue : function () {},
				resolveDeep : function () {},
				// members
				mDeferredGroups : {},
				bIncludeInCurrentBatch : true,
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				mRequests : "{object} mRequests",
				bUseBatch : true
			},
			oModelMock = this.mock(oModel),
			sNormalizedPath = "~normalizedPath",
			sNormalizedTempPath = "~normalizedTempPath",
			oODataUtilsMock = this.mock(ODataUtils),
			aSorters = "{sap.ui.model.Sorter[]} aSorters",
			fnSuccess = "{function} fnSuccess",
			bUpdateAggregatedMessages = "{boolean} bUpdateAggregatedMessages",
			mUrlParams = "{object} mUrlParams",
			mParameters = {
				canonicalRequest : bCanonicalRequest,
				context : oContext,
				error : fnError,
				filters : aFilters,
				groupId : sGroupId,
				headers : mHeaders,
				sorters : aSorters,
				success : fnSuccess,
				updateAggregatedMessages : bUpdateAggregatedMessages,
				urlParameters : mUrlParams
			},
			sPath = "~path/$count",
			oRequest = {},
			sSorterParams = "~$orderby",
			sUrl = "~url",
			aUrlParams = [];

		oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(bCanonicalRequest)
			.returns(bIsCanonicalRequestNeeded);
		oODataUtilsMock.expects("_createUrlParamsArray").withExactArgs(mUrlParams)
			.returns(aUrlParams);
		oModelMock.expects("_getHeaders").withExactArgs(mHeaders, true).returns(mGetHeaders);
		oModelMock.expects("_getETag").withExactArgs(sPath, oContext).returns(sETag);
		oModelMock.expects("_normalizePath")
			.withExactArgs("~path", oContext, bIsCanonicalRequestNeeded)
			.returns(sNormalizedTempPath);
		oModelMock.expects("_normalizePath")
			.withExactArgs(sPath, oContext, bIsCanonicalRequestNeeded)
			.returns(sNormalizedPath);
		oModelMock.expects("resolveDeep").withExactArgs(sPath, oContext).returns(sDeepPath);
		// inner function createReadRequest
		oODataUtilsMock.expects("createSortParams").withExactArgs(aSorters).returns(sSorterParams);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs(sNormalizedTempPath)
			.returns(oEntityType);
		this.mock(FilterProcessor).expects("groupFilters").withExactArgs(aFilters)
			.returns(oFilter);
		oODataUtilsMock.expects("createFilterParams")
			.withExactArgs(oFilter, sinon.match.same(oModel.oMetadata), oEntityType)
			.returns(sFilterParams);
		oModelMock.expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs(sNormalizedPath,
				sinon.match.same(aUrlParams).and(sinon.match([sSorterParams, sFilterParams])),
				/*bUseBatch*/true)
			.returns(sUrl);
		oModelMock.expects("_createRequest")
			.withExactArgs(sUrl, sDeepPath, "GET", mGetHeaders, null, sETag, undefined,
				bUpdateAggregatedMessages)
			.returns(oRequest);
		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs(oModel.mRequests, sGroupId, null, sinon.match.same(oRequest),
				fnSuccess, fnError, sinon.match.object, false)
			.returns(oRequest);

		// code under test
		ODataModel.prototype.read.call(oModel, sPath, mParameters);
	});
	//TODO create fixtures to test all paths of ODataModel#read

	//*********************************************************************************************
[{
	bAsync : true,
	oData : "{object} oData",
	sETag : "~etag",
	mHeaders : {},
	sMessageScope : MessageScope.Request,
	sMethod : "GET",
	sUrl : "~url",
	oExpected : {
		bAsync : true,
		sMethod : "GET",
		bUpdateAggregatedMessages : false,
		bUseOData : true
	}
}, {
	bAsync : undefined,
	mHeaders : {"Content-Type" :  "~contenttype"},
	sMessageScope : MessageScope.BusinessObject,
	sMethod : "MERGE",
	sUrl : "~url",
	bUseBatch : true,
	bWithCredentials : "{boolean} bWithCredentials",
	oExpected : {
		mAdditionalHeaders : {
			"sap-message-scope" : MessageScope.BusinessObject
		},
		bAsync : true,
		sMethod : "MERGE",
		bUpdateAggregatedMessages : true,
		bUseCredentials : true
	}
}, {
	bAsync : undefined,
	mHeaders : {"Foo" :  "bar"},
	bJSON : true,
	sMessageScope : MessageScope.BusinessObject,
	sMethod : "MERGE",
	sUrl : "~url",
	bWithCredentials : "{boolean} bWithCredentials",
	oExpected : {
		mAdditionalHeaders : {
			"Content-Type" : "application/json",
			"sap-message-scope" : MessageScope.BusinessObject,
			"x-http-method" :  "MERGE"
		},
		bAsync : true,
		sMethod : "POST",
		bUpdateAggregatedMessages : true,
		bUseCredentials : true
	}
}, {
	bAsync : false,
	sETag : "~etag",
	mHeaders : {"Foo" :  "bar"},
	sMethod : "~method",
	sUrl : "~url/$count",
	oExpected : {
		mAdditionalHeaders : {
			"Accept" :  "text/plain, */*;q=0.5",
			"Content-Type" : "application/atom+xml",
			"If-Match" : "~etag"
		},
		bAsync : false,
		sMethod : "~method",
		bUpdateAggregatedMessages : false
	}
}, {
	bAsync : false,
	sETag : "~etag",
	mHeaders : {"Foo" :  "bar"},
	sMethod : "DELETE",
	sUrl : "~url",
	oExpected : {
		mAdditionalHeaders : {
			"If-Match" : "~etag"
		},
		bAsync : false,
		sMethod : "DELETE",
		bUpdateAggregatedMessages : false
	}
}].forEach(function (oFixture, i) {
	[true, false].forEach(function (bUpdateAggregatedMessages) {
		[true, false].forEach(function (bIsMessageScopeSupported) {
	var sTitle = "_createRequest: " + i
			+ ", bIsMessageScopeSupported: " + bIsMessageScopeSupported
			+ ", bUpdateAggregatedMessages: " + bUpdateAggregatedMessages;

	QUnit.test(sTitle, function (assert) {
		var mExpectedHeaders = Object.assign({}, oFixture.mHeaders,
				oFixture.oExpected.mAdditionalHeaders),
			oModel = {
				_createRequestID : function () {},
				// members
				bIsMessageScopeSupported : bIsMessageScopeSupported,
				bJSON : oFixture.bJSON,
				sMessageScope : oFixture.sMessageScope,
				sPassword : "~password",
				sServiceUrl : "~serviceUrl",
				bUseBatch : oFixture.bUseBatch,
				sUser : "~user",
				bWithCredentials : oFixture.bWithCredentials
			},
			oRequest,
			sRequestID = "~uid",
			oExpectedResult = {
				async : oFixture.oExpected.bAsync,
				deepPath : "~deepPath",
				headers : mExpectedHeaders,
				method : oFixture.oExpected.sMethod,
				password : "~password",
				requestID : sRequestID,
				requestUri : oFixture.sUrl,
				updateAggregatedMessages : bUpdateAggregatedMessages && bIsMessageScopeSupported
					? oFixture.oExpected.bUpdateAggregatedMessages
					: false,
				user : "~user"
			};

		if (oFixture.sMessageScope === MessageScope.BusinessObject && !bIsMessageScopeSupported) {
			this.oLogMock.expects("error")
				.withExactArgs("Message scope 'sap.ui.model.odata.MessageScope.BusinessObject' is"
					+ " not supported by the service: ~serviceUrl", undefined,
					"sap.ui.model.odata.v2.ODataModel");
		}
		this.mock(oModel).expects("_createRequestID").withExactArgs().returns(sRequestID);
		if (oFixture.oExpected.bUseOData) {
			oExpectedResult.data = oFixture.oData;
		}
		if (oFixture.oExpected.bUseCredentials) {
			oExpectedResult.withCredentials = oFixture.bWithCredentials;
		}

		// code under test
		oRequest = ODataModel.prototype._createRequest.call(oModel, oFixture.sUrl, "~deepPath",
			oFixture.sMethod, oFixture.mHeaders, oFixture.oData, oFixture.sETag, oFixture.bAsync,
			bUpdateAggregatedMessages);

		assert.deepEqual(oRequest, oExpectedResult);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_processChange: ", function (assert) {
		var oData = {},
			sDeepPath = "~deepPath",
			oEntityType/* = undefined*/, //not realistic but simplifies the test
			sETag = "~etag",
			mHeaders = "~headers",
			sKey = "~key",
			oModel = {
				_createRequest : function () {},
				_createRequestUrl : function () {},
				_getEntity : function () {},
				_getHeaders : function () {},
				_getObject : function () {},
				_removeReferences : function () {},
				getETag : function () {},
				mChangedEntities : {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				sServiceUrl : "~serviceUrl",
				bUseBatch : "~useBatch"
			},
			oPayload = "~payload",
			oRequest = {requestUri : "~requestUri"},
			oResult,
			sUpdateMethod,
			sUrl = "~url";

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs(sKey)
			.returns(oEntityType);
		this.mock(oModel).expects("_getObject").withExactArgs("/~key", true)
			.returns({/* content not relevant for this test */});
		this.mock(oModel).expects("_getEntity").withExactArgs(sKey)
			.returns({/* content not relevant for this test */});
		// withExactArgs() for _removeReferences is not relevant for this test
		this.mock(oModel).expects("_removeReferences").returns(oPayload);
		this.mock(oModel).expects("_getHeaders").withExactArgs().returns(mHeaders);
		this.mock(oModel).expects("getETag").withExactArgs(oPayload).returns(sETag);

		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~key", null, undefined, "~useBatch")
			.returns(sUrl);
		this.mock(oModel).expects("_createRequest")
			.withExactArgs(sUrl, sDeepPath, "MERGE", mHeaders, oPayload, sETag, undefined, true)
			.returns(oRequest);

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, sKey, oData, sUpdateMethod,
			sDeepPath);

		assert.strictEqual(oResult, oRequest);
		assert.deepEqual(oResult, {requestUri : "~requestUri"});
	});

	//*********************************************************************************************
	QUnit.test("_writePathCache", function (assert) {
		var oModel = {
				mPathCache : {}
			},
			_writePathCache = ODataModel.prototype._writePathCache;

		// code under test
		_writePathCache.call(oModel, "", "");

		assert.deepEqual(oModel.mPathCache, {});

		// code under test
		_writePathCache.call(oModel, "/Path", "");

		assert.deepEqual(oModel.mPathCache, {});

		// code under test
		_writePathCache.call(oModel, "", "/Canonical");

		assert.deepEqual(oModel.mPathCache, {});

		// code under test
		_writePathCache.call(oModel, "/Deep/Path", "/Canonical");

		assert.deepEqual(oModel.mPathCache, {"/Deep/Path" : {canonicalPath : "/Canonical"}});

		// code under test
		_writePathCache.call(oModel, "/Deep/Path", "/OtherCanonical");

		assert.deepEqual(oModel.mPathCache, {"/Deep/Path" : {canonicalPath : "/OtherCanonical"}});

		// code under test
		_writePathCache.call(oModel, "/Deep/Path2", "/Canonical2");

		assert.deepEqual(oModel.mPathCache, {
			"/Deep/Path" : {canonicalPath : "/OtherCanonical"},
			"/Deep/Path2" : {canonicalPath : "/Canonical2"}
		});

		// code under test
		_writePathCache.call(oModel, "/Canonical1", "/Canonical2");

		assert.deepEqual(oModel.mPathCache, {
			"/Deep/Path" : {canonicalPath : "/OtherCanonical"},
			"/Deep/Path2" : {canonicalPath : "/Canonical2"},
			"/Canonical1" : {canonicalPath : "/Canonical1"}
		});

		// code under test
		_writePathCache.call(oModel, "/FunctionImport", "/Canonical", /*bFunctionImport*/true);

		assert.deepEqual(oModel.mPathCache, {
			"/Deep/Path" : {canonicalPath : "/OtherCanonical"},
			"/Deep/Path2" : {canonicalPath : "/Canonical2"},
			"/Canonical1" : {canonicalPath : "/Canonical1"},
			"/FunctionImport" : {canonicalPath : "/Canonical"}
		});
	});

	//*********************************************************************************************
	QUnit.test("_writePathCache, bUpdateShortenedPaths", function (assert) {
		var oModel = {
				mPathCache : {
					"/Set(42)/toA" : {canonicalPath : "/A(1)"},
					"/Set(42)/toA/toB" : {canonicalPath : "/B(2)"},
					"/A(1)/toB" : {canonicalPath : "/B(2)"} // shortened path with two segments
				}
			};

		// code under test
		ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB", "/B(77)",
			/*bFunctionImport*/undefined, /*bUpdateShortenedPaths*/true);

		assert.deepEqual(oModel.mPathCache, {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			"/Set(42)/toA/toB" : {canonicalPath : "/B(77)"},
			"/A(1)/toB" : {canonicalPath : "/B(77)"}
		});

		// multiple shortened paths for the given deep path
		oModel.mPathCache = {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			"/Set(42)/toA/toB" : {canonicalPath : "/B(2)"},
			"/Set(42)/toA/toB/toC" : {canonicalPath : "/C(3)"},
			"/A(1)/toB/toC" : {canonicalPath : "/C(3)"}, // shortened path with three segments
			"/B(2)/toC" : {canonicalPath : "/C(3)"} // shortened path with two segments
		};

		// code under test
		ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB/toC", "/C(77)",
			/*bFunctionImport*/undefined, /*bUpdateShortenedPaths*/true);

		assert.deepEqual(oModel.mPathCache, {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			"/Set(42)/toA/toB" : {canonicalPath : "/B(2)"},
			"/Set(42)/toA/toB/toC" : {canonicalPath : "/C(77)"},
			"/A(1)/toB/toC" : {canonicalPath : "/C(77)"},
			"/B(2)/toC" : {canonicalPath : "/C(77)"}
		});

		// two shortened paths for the given deep path, but the cache key for one of them does not
		// exist in the path cache => do not write it
		oModel.mPathCache = {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			"/Set(42)/toA/toB" : {canonicalPath : "/B(2)"},
			"/Set(42)/toA/toB/toC" : {canonicalPath : "/C(3)"},
			"/A(1)/toB/toC" : {canonicalPath : "/C(3)"} // shortened path with three segments
			// "/B(2)/toC" : {canonicalPath : "/C(3)"} // shortened path with two segments
		};

		// code under test
		ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB/toC", "/C(77)",
			/*bFunctionImport*/undefined, /*bUpdateShortenedPaths*/true);

		assert.deepEqual(oModel.mPathCache, {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			"/Set(42)/toA/toB" : {canonicalPath : "/B(2)"},
			"/Set(42)/toA/toB/toC" : {canonicalPath : "/C(77)"},
			"/A(1)/toB/toC" : {canonicalPath : "/C(77)"}
		});

		// two shortened paths for the given deep path, but one does not exist in cache
		oModel.mPathCache = {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			// "/Set(42)/toA/toB" : {canonicalPath : "/B(2)"},
			"/Set(42)/toA/toB/toC" : {canonicalPath : "/C(3)"},
			"/A(1)/toB/toC" : {canonicalPath : "/C(3)"} // shortened path with three segments
			// "/B(2)/toC" : {canonicalPath : "/C(3)"} // shortened path with two segments
		};

		// code under test
		ODataModel.prototype._writePathCache.call(oModel, "/Set(42)/toA/toB/toC", "/C(77)",
			/*bFunctionImport*/undefined, /*bUpdateShortenedPaths*/true);

		assert.deepEqual(oModel.mPathCache, {
			"/Set(42)/toA" : {canonicalPath : "/A(1)"},
			"/Set(42)/toA/toB/toC" : {canonicalPath : "/C(77)"},
			"/A(1)/toB/toC" : {canonicalPath : "/C(77)"}
		});
	});

	//*********************************************************************************************
[undefined, "/canonicalParent/toChild"].forEach(function (sPathFromCanonicalParent, i) {
	QUnit.test("_importData for function import, " + i, function (assert) {
		var mChangedEntities = {},
			oData = {},
			oModel = {
				_getEntity : function () {},
				_getKey : function () {},
				hasContext : function () {},
				resolveFromCache : function () {},
				_updateChangedEntities : function () {},
				_writePathCache : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns("entry");
		oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
		oModelMock.expects("_updateChangedEntities").withExactArgs({key : "entry"});
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("/key");
		// test that bFunctionImport is propagated to _writePathCache
		oModelMock.expects("_writePathCache").withExactArgs("/key", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport",
			/*bUpdateShortenedPaths*/true);
		if (sPathFromCanonicalParent) {
			oModelMock.expects("_writePathCache")
				.withExactArgs(sPathFromCanonicalParent, "/key", "bFunctionImport");
		}

		// the parameter oResponse is unused in this test as there is no array or navigation
		// properties in the data nor are there bindable response headers
		// the parameter sKey is unused in this test as it is always unset in non-recursive calls to
		// _importData

		// code under test
		ODataModel.prototype._importData.call(oModel, oData, mChangedEntities,
			/*oResponse*/ undefined, "sPath", "sDeepPath", /*sKey*/ undefined, "bFunctionImport",
			sPathFromCanonicalParent);

		assert.ok(mChangedEntities["key"]);
	});
});

	//*********************************************************************************************
	QUnit.test("_importData for data with 0..1 navigation properties", function (assert) {
		var mChangedEntities = {},
			oData = {
				n0 : {
					__metadata : {
						uri : "uri0"
					}
				}
			},
			oEntry = {},
			oModel = {
				_getEntity : function () {},
				_getKey : function () {},
				hasContext : function () {},
				// add method under test to check correct recursion
				_importData : ODataModel.prototype._importData,
				resolveFromCache : function () {},
				_updateChangedEntities : function () {},
				_writePathCache : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns(oEntry);
		// from code under test
		oModelMock.expects("_importData")
			.withExactArgs(sinon.match.same(oData), sinon.match.same(mChangedEntities), "oResponse",
				"sPath", "sDeepPath", undefined, "bFunctionImport")
			.callThrough();
		// recursive call for importing navigation property data
		oModelMock.expects("_importData")
			.withExactArgs(sinon.match.same(oData.n0), sinon.match.same(mChangedEntities),
				"oResponse", "sPath/n0", "sDeepPath/n0", undefined, false, "/key/n0")
			.returns("oResult");
		oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
		oModelMock.expects("_updateChangedEntities")
			.withExactArgs({key : sinon.match.same(oEntry)});
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("/key");
		// test that bFunctionImport is propagated to _writePathCache
		oModelMock.expects("_writePathCache").withExactArgs("/key", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport",
			/*bUpdateShortenedPaths*/true);

		// code under test
		oModel._importData(oData, mChangedEntities, "oResponse", "sPath", "sDeepPath",
			/*sKey*/ undefined, "bFunctionImport");

		assert.strictEqual(oEntry.n0.__ref, "oResult");

		assert.ok(mChangedEntities["key"]);
	});

	//*********************************************************************************************
["requestKey", undefined].forEach(function (sRequestKey, i) {
	[{isFunction : "isFunction" }, undefined].forEach(function (oEntityType, j) {
	QUnit.test("_processSuccess for function import:" + i + ", " + j, function (assert) {
		var aRequests = [],
			oModel = {
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {},
				_getEntity : function () {},
				_importData : function () {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				_normalizePath : function () {},
				_parseResponse : function () {},
				sServiceUrl : "/service/",
				_updateETag : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {
				data : "requestData",
				deepPath : "deepPath",
				key : sRequestKey,
				requestUri : "/service/path"
			},
			oResponse = {
				data : {
					_metadata : {}
				},
				_imported : false,
				statusCode : 200
			},
			bSuccess;

		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("normalizedPath")
			.returns(oEntityType);
		oModelMock.expects("_normalizePath")
			.withExactArgs("/path", undefined, /*bCanonical*/ !oEntityType)
			.returns("normalizedPath");
		oModelMock.expects("decreaseLaundering").withExactArgs("normalizedPath","requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		// test that bFunctionImport is propagated to _importData
		if (sRequestKey) {
			oModelMock.expects("_importData").withExactArgs(oResponse.data,
			/*mLocalGetEntities*/ {}, oResponse, /*sPath*/ undefined, /*sDeepPath*/ undefined,
			/*sKey*/ undefined, oEntityType && "isFunction");
		} else {
			oModelMock.expects("_importData").withExactArgs(oResponse.data,
			/*mLocalGetEntities*/ {}, oResponse, "normalizedPath", "deepPath",
			/*sKey*/ undefined, oEntityType && "isFunction");
		}
		oModelMock.expects("_getEntity").withExactArgs(sRequestKey). returns({__metadata : {}});
		oModelMock.expects("_parseResponse").withExactArgs(oResponse, oRequest,
			/*mLocalGetEntities*/ {}, /*mLocalChangeEntities*/ {});
		oModelMock.expects("_updateETag").withExactArgs(oRequest, oResponse);
		oModelMock.expects("_createEventInfo").withExactArgs(oRequest, oResponse, aRequests)
			.returns("oEventInfo");
		oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");

		// code under test
		bSuccess = ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse,
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {},
			/*mEntityTypes*/ {}, /*bBatch*/ false, aRequests);

		assert.strictEqual(bSuccess, true);
	});
	});
});
	//TODO refactor ODataModel#mPathCache to a simple map path -> canonical path instead of map
	// path -> object with single property 'canonicalPath'

	//*********************************************************************************************
[{
	functionMetadata : false,
	headers : {location : "/service/new/function/target"},
	result : {
		// no changes: no functionMetadata given
		deepPath : "/deep/path",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : undefined,
	result : {
		// no changes: no headers given
		deepPath : "/deep/path",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : {},
	result : {
		// no changes: no location header given
		deepPath : "/deep/path",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : {location : "/service/new/function/target"},
	result : {
		// functionTarget is updated by the new canonical path sliced out of locationHeader;
		// locationHeader and functionTarget do not match -> no deep path calculation
		deepPath : "/deep/path",
		functionTarget : "/new/function/target"
	}
}, {
	functionMetadata : true,
	headers : {location : "/http/service/new/function/target"},
	result : {
		// functionTarget is updated by the new canonical path sliced out of locationHeader;
		// oModel.sServiceUrl is not a starting position of the locationHeader;
		// locationHeader and functionTarget do not match -> no deep path calculation
		deepPath : "/deep/path",
		functionTarget : "/new/function/target"
	}
}, {
	getDeepPathForCanonicalPath : {
		inputParam : "/function/target",
		result : undefined
	},
	functionMetadata : true,
	headers : {location : "/service/function/target"},
	result : {
		// deepPath cannot be updated until getDeepPathForCanonicalPath returns a value
		deepPath : "/deep/path",
		functionTarget : "/function/target"
	}
}, {
	getDeepPathForCanonicalPath : {
		inputParam : "/function/target",
		result : "/new/deep/path"
	},
	functionMetadata : true,
	headers : {location : "/service/function/target"},
	result : {
		// deepPath and functionTarget are updated
		deepPath : "/new/deep/path",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : {location : "/otherservice/function/target"},
	result : {
		// no changes: locationHeader must contain oModel.sServiceUrl
		deepPath : "/deep/path",
		functionTarget : "/function/target"
	}
}].forEach(function (oFixture, i) {
	var sTitle = "_processSuccess for function import: update deepPath/functionTarget, " + i;

	QUnit.test(sTitle, function (assert) {
		var oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				sServiceUrl : "/service",
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				_getEntity : function () {},
				_normalizePath : function () {},
				_parseResponse : function () {},
				_updateETag : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {},
				getDeepPathForCanonicalPath : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {
				data : "requestData",
				deepPath : "/deep/path",
				functionMetadata : oFixture.functionMetadata,
				functionTarget : "/function/target",
				requestUri : "/service/path"
			},
			oResponse = {
				data : {
					_metadata : {}
				},
				headers : oFixture.headers,
				_imported : true
			};

		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath0");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("normalizedPath0")
			.returns("isFunction");
		oModelMock.expects("_normalizePath").withExactArgs("/path", undefined, true)
			.returns("normalizedPath1");
		oModelMock.expects("decreaseLaundering").withExactArgs("normalizedPath1", "requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		if (oFixture.getDeepPathForCanonicalPath) {
			oModelMock.expects("getDeepPathForCanonicalPath")
				.withExactArgs(oFixture.getDeepPathForCanonicalPath.inputParam)
				.returns(oFixture.getDeepPathForCanonicalPath.result);
		}
		oModelMock.expects("_getEntity").withExactArgs(undefined).returns({__metadata : {}});
		oModelMock.expects("_parseResponse").withExactArgs(oResponse, oRequest, {}, {});
		oModelMock.expects("_updateETag").withExactArgs(oRequest, oResponse);
		oModelMock.expects("_createEventInfo").withExactArgs(oRequest, oResponse, "aRequests")
			.returns("oEventInfo");
		oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");

		// code under test
		ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse,
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {},
			/*mEntityTypes*/ {}, /*bBatch*/ false, "aRequests");

		assert.strictEqual(oRequest.deepPath, oFixture.result.deepPath);
		assert.strictEqual(oRequest.functionTarget, oFixture.result.functionTarget);
	});
});

//*********************************************************************************************
[{
	created : false,
	deepPath : "/entity",
	resultDeepPath : "/entity"
}, {
	created : true,
	deepPath : "/entity",
	resultDeepPath : "/entity"
}, {
	created : false,
	deepPath : "/entity(id-0-0)",
	resultDeepPath : "/entity(id-0-0)"
}, {
	created : true,
	deepPath : "/collection(id-0-0)",
	responseEntityKey : "~responseEntity(~newKey)",
	resultDeepPath : "/collection(~newKey)"
}, {
	created : true,
	deepPath : "/entity(1)/collection(id-0-0)",
	responseEntityKey : "~responseEntity(~newKey)",
	resultDeepPath : "/entity(1)/collection(~newKey)"
}, {
	created : true,
	deepPath : "/collection(id-0-0)",
	responseEntityKey : "~responseEntity('A(0)')",
	resultDeepPath : "/collection('A(0)')"
}].forEach(function (oFixture, i) {
	QUnit.test("_processSuccess for createEntry; " + i, function (assert) {
		var oContext = {
				bCreated : oFixture.created,
				setUpdated : function () {}
			},
			oModel = {
				oData : {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				sServiceUrl : "/service",
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				_getEntity : function () {},
				_getKey : function () {},
				_normalizePath : function () {},
				_parseResponse : function () {},
				_removeEntity : function () {},
				_updateContext : function () {},
				_updateETag : function () {},
				callAfterUpdate : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {},
				getContext : function () {}
			},
			oMetadataMock = this.mock(oModel.oMetadata),
			oModelMock = this.mock(oModel),
			oRequest = {
				created : true,
				data : "requestData",
				deepPath : oFixture.deepPath,
				key : "key('id-0-0')",
				method : "POST",
				requestUri : "/service/path"
			},
			oResponse = {
				data : {},
				_imported : true,
				statusCode : 201
			};

		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("~sNormalizedPath");
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~sNormalizedPath")
			.returns("~oEntityType");
		oModelMock.expects("_normalizePath").withExactArgs("/path", undefined, true)
			.returns("~sPath");
		oModelMock.expects("decreaseLaundering").withExactArgs("~sPath", "requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		oModelMock.expects("_getEntity").withExactArgs("key('id-0-0')").returns({__metadata : {}});
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~sPath")
			.returns("~oEntityMetadata");
		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oResponse.data))
			.returns(oFixture.responseEntityKey);
		oModelMock.expects("getContext").withExactArgs("/key('id-0-0')").returns(oContext);
		oModelMock.expects("_updateContext")
			.withExactArgs(sinon.match.same(oContext), "/" + oFixture.responseEntityKey);
		this.mock(oContext).expects("setUpdated").withExactArgs(true);
		oModelMock.expects("callAfterUpdate").withExactArgs(sinon.match.func);
		oModelMock.expects("_getEntity").withExactArgs(oFixture.responseEntityKey)
			.returns({__metadata : {}});
		oModelMock.expects("_removeEntity").withExactArgs("key('id-0-0')");
		oModelMock.expects("_parseResponse")
			.withExactArgs(sinon.match.same(oResponse), sinon.match.same(oRequest), {}, {});
		oModelMock.expects("_updateETag")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse));
		oModelMock.expects("_createEventInfo")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse), "~aRequests")
			.returns("~oEventInfo");
		oModelMock.expects("fireRequestCompleted").withExactArgs("~oEventInfo");

		// code under test
		ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse,
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {},
			/*mEntityTypes*/ {}, /*bBatch*/ false, "~aRequests");

		assert.strictEqual(oRequest.deepPath, oFixture.resultDeepPath);
	});
});


	//*********************************************************************************************
	QUnit.test("removeInternalMetadata", function (assert) {
		var oEntityData,
			oModel = {},
			oModelPrototypeMock = this.mock(ODataModel.prototype),
			oResult;

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel);

		assert.deepEqual(oResult, {created : undefined, deepPath : undefined});

		oEntityData = {};

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);

		assert.deepEqual(oEntityData, {});
		assert.deepEqual(oResult, {created : undefined, deepPath : undefined});

		oEntityData = {
			p : "p",
			__metadata : {
				uri : "uri",
				created : "created",
				deepPath : "deepPath"
			}
		};

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);

		assert.deepEqual(oEntityData, {p : "p", __metadata : {uri : "uri"}});
		assert.deepEqual(oResult, {created : "created", deepPath : "deepPath"});

		oEntityData = {
			p : "p",
			__metadata : {
				uri : "uri",
				created : "created",
				deepPath : "deepPath"
			},
			n : { // 0..1 navigation property
				p2 : "p2",
				__metadata : {
					uri : "uri2",
					created : "created2",
					deepPath : "deepPath2"
				}
			}
		};

		oModelPrototypeMock.expects("removeInternalMetadata") // the "code under test" call
			.withExactArgs(sinon.match.same(oEntityData))
			.callThrough();
		// recursive calls to removeInternalMetadata are only expected for non-scalar properties
		oModelPrototypeMock.expects("removeInternalMetadata")
			// do not use withExactArgs as this is called with index and array from forEach
			.withArgs(sinon.match.same(oEntityData.__metadata))
			.callThrough();
		oModelPrototypeMock.expects("removeInternalMetadata")
			.withArgs(sinon.match.same(oEntityData.n))
			.callThrough();
		oModelPrototypeMock.expects("removeInternalMetadata")
			.withArgs(sinon.match.same(oEntityData.n.__metadata))
			.callThrough();

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);

		assert.deepEqual(oEntityData, {
			p : "p",
			__metadata : {uri : "uri"},
			n : {
				p2 : "p2",
				__metadata : {uri : "uri2"}
			}
		});
		assert.deepEqual(oResult, {created : "created", deepPath : "deepPath"});

		oEntityData = {
			p : "p",
			__metadata : {
				uri : "uri",
				created : "created",
				deepPath : "deepPath"
			},
			n : [{ // 0..n navigation property
					p2 : "p2",
					__metadata : {
						uri : "uri2",
						created : "created2",
						deepPath : "deepPath2"
					}
			}]
		};

		oModelPrototypeMock.expects("removeInternalMetadata") // the "code under test" call
			.withExactArgs(sinon.match.same(oEntityData))
			.callThrough();
		// recursive calls to removeInternalMetadata are only expected for non-scalar properties
		oModelPrototypeMock.expects("removeInternalMetadata")
			// do not use withExactArgs as this is called with index and array from forEach
			.withArgs(sinon.match.same(oEntityData.__metadata))
			.callThrough();
		oModelPrototypeMock.expects("removeInternalMetadata")
			.withArgs(sinon.match.same(oEntityData.n[0]))
			.callThrough();
		oModelPrototypeMock.expects("removeInternalMetadata")
			.withArgs(sinon.match.same(oEntityData.n[0].__metadata))
			.callThrough();

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);

		assert.deepEqual(oEntityData, {
			p : "p",
			__metadata : {uri : "uri"},
			n : [{
				p2 : "p2",
				__metadata : {uri : "uri2"}
			}]
		});
		assert.deepEqual(oResult, {created : "created", deepPath : "deepPath"});
	});

	//*********************************************************************************************
	QUnit.test("removeInternalMetadata, recursively", function (assert) {
		var oEntityData = {
				p : "p",
				n1 : { // 0..1 navigation property
					p1 : "p1",
					__metadata : {
						uri : "uri1",
						created : "created1",
						deepPath : "deepPath1"
					},
					x : {
						p4 : "p4",
						n3 : [{ // 0..n navigation property
							p3 : "p3",
							__metadata : {
								uri : "uri3",
								created : "created3",
								deepPath : "deepPath3"
							}
						}]
					}
				},
				n2 : [{ // 0..n navigation property
					p2 : "p2",
					__metadata : {
						uri : "uri2",
						created : "created2",
						deepPath : "deepPath2"
					}
				}]
			},
			oResult;

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata(oEntityData);

		assert.deepEqual(oEntityData, {
			p : "p",
			n1 : { // 0..1 navigation property
				p1 : "p1",
				__metadata : {
					uri : "uri1"
				},
				x : {
					p4 : "p4",
					n3 : [{ // 0..n navigation property
						p3 : "p3",
						__metadata : {
							uri : "uri3"
						}
					}]
				}
			},
			n2 : [{ // 0..n navigation property
				p2 : "p2",
				__metadata : {
					uri : "uri2"
				}
			}]
		});
		assert.deepEqual(oResult, {created : undefined, deepPath : undefined});
	});

	//*********************************************************************************************
	QUnit.test("_processRequestQueue: call #removeInternalMetadata, non-$batch", function (assert) {
		var oModel = {
				bUseBatch : false,
				checkDataState : function () {},
				getKey : function () {},
				increaseLaundering : function () {},
				mLaunderingState : "launderingState",
				removeInternalMetadata : function () {},
				_submitSingleRequest : function () {}
			},
			oModelMock = this.mock(oModel),
			mRequests = {
				undefined /*group id*/ : {
					changes : {
						undefined /*change set id*/ : [{
							parts : [{
								request : {}
							}],
							request : {
								data : "payload"
							}
						}]
					}
				}
			};

		oModelMock.expects("getKey").withExactArgs("payload").returns("path");
		oModelMock.expects("increaseLaundering").withExactArgs("/path", "payload").returns("path");
		oModelMock.expects("removeInternalMetadata").withExactArgs("payload");
		oModelMock.expects("_submitSingleRequest")
			.withExactArgs(sinon.match.same(mRequests[undefined].changes[undefined][0]));
		oModelMock.expects("checkDataState").withExactArgs("launderingState");

		// code under test
		ODataModel.prototype._processRequestQueue.call(oModel, mRequests
			/*, sGroupId, fnSuccess, fnError*/);
	});

	//*********************************************************************************************
	QUnit.test("getMessageScope/setMessageScope", function (assert) {
		var oModel = {};

		// code under test
		ODataModel.prototype.setMessageScope.call(oModel, MessageScope.RequestedObjects);

		// code under test
		assert.strictEqual(ODataModel.prototype.getMessageScope.call(oModel),
			MessageScope.RequestedObjects);

		// code under test
		ODataModel.prototype.setMessageScope.call(oModel, MessageScope.BusinessObject);

		// code under test
		assert.strictEqual(ODataModel.prototype.getMessageScope.call(oModel),
			MessageScope.BusinessObject);

		// code under test
		assert.throws(function () {
			ODataModel.prototype.setMessageScope.call(oModel, "Foo");
		}, new Error("Unsupported message scope: Foo"));
	});

	//*********************************************************************************************
[{
	sFullTarget : "/foo", sPathPrefix : "", bResult : true
}, {
	sFullTarget : "/foo", sPathPrefix : "/", bResult : true
}, {
	sFullTarget : "/foo", sPathPrefix : "/f", bResult : false
}, {
	sFullTarget : "/foo", sPathPrefix : "/foo", bResult : true
}, {
	sFullTarget : "/foo(42)", sPathPrefix : "/foo", bResult : true
}, {
	sFullTarget : "/foo/bar", sPathPrefix : "/foo", bResult : true
}, {
	sFullTarget : "/foo", sPathPrefix : "/foo/bar", bResult : false
}, {
	sFullTarget : "/foo", sPathPrefix : "/baz", bResult : false
}].forEach(function (oFixture, i) {
	[false, true].forEach(function (bMulti) {
	QUnit.test("isMessageMatching, " + i + ", multi-target=" + bMulti, function (assert) {
		var vFullTarget = bMulti ? ["/xyz"].concat([oFixture.sFullTarget]) : oFixture.sFullTarget;

		// code under test
		assert.strictEqual(ODataModel.prototype.isMessageMatching
				.call({}, new Message({fullTarget : vFullTarget}), oFixture.sPathPrefix),
			 oFixture.bResult);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("filterMatchingMessages", function (assert) {
		var oMessage0 = "sap.ui.core.message.Message0",
			oMessage1 = "sap.ui.core.message.Message1",
			oMessage2 = "sap.ui.core.message.Message2",
			oModel = {
				mMessages : {
					"/foo" : []
				},
				isMessageMatching : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("isMessageMatching").never();

		// code under test
		assert.deepEqual(ODataModel.prototype.filterMatchingMessages.call(oModel, "/foo", "/foo"),
			[]);

		oModel.mMessages = {
			"/foo" : [oMessage0, oMessage1, oMessage2]
		};
		oModelMock.expects("isMessageMatching").withExactArgs(oMessage0, "/").returns(true);
		oModelMock.expects("isMessageMatching").withExactArgs(oMessage1, "/").returns(false);
		oModelMock.expects("isMessageMatching").withExactArgs(oMessage2, "/").returns(true);

		// code under test
		assert.deepEqual(ODataModel.prototype.filterMatchingMessages.call(oModel, "/foo", "/"),
			[oMessage0, oMessage2]);

		oModelMock.expects("isMessageMatching").withExactArgs(oMessage0, "/baz").returns(false);
		oModelMock.expects("isMessageMatching").withExactArgs(oMessage1, "/baz").returns(false);
		oModelMock.expects("isMessageMatching").withExactArgs(oMessage2, "/baz").returns(false);

		// code under test
		assert.deepEqual(ODataModel.prototype.filterMatchingMessages.call(oModel, "/foo", "/baz"),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("getMessages", function (assert) {
		var oContext = {sDeepPath : "deepPath"},
			aMessages = [],
			oModel = {
				getMessagesByPath : function () {}
			};

		this.mock(oModel).expects("getMessagesByPath").withExactArgs("deepPath", true)
			.returns(aMessages);
		this.mock(aMessages).expects("sort").withExactArgs(Message.compare).returns(aMessages);

		// code under test
		assert.strictEqual(ODataModel.prototype.getMessages.call(oModel, oContext), aMessages);
	});

	//*********************************************************************************************
[
	{iMessageCount : 200, iRowCount : 100},
	{iMessageCount : 20, iRowCount : 30},
	{iMessageCount : 5, iRowCount : 20}
].forEach(function (oFixture) {
	var sTitle = "getMessages: Performance Test - simulate " + oFixture.iMessageCount
			+ " messages for " + oFixture.iRowCount + " table rows";
	QUnit.skip(sTitle, function (assert) {
		var oContext = {
				sDeepPath : "deep(1)/path"
			},
			i,
			oModel = {
				filterMatchingMessages : ODataModel.prototype.filterMatchingMessages,
				getMessagesByPath : Model.prototype.getMessagesByPath,
				isMessageMatching : ODataModel.prototype.isMessageMatching,
				mMessages : {}
			},
			sPath;

		// prepare messages
		for (i = 0; i < oFixture.iMessageCount; i += 1) {
			sPath = "deep(" + i + ")/path";
			oModel.mMessages[sPath] = [{
				fullTarget : sPath
			}];
		}

		// code under test
		repeatedTest(assert, function () {
			for (i = 0; i < oFixture.iRowCount; i += 1) {
				ODataModel.prototype.getMessages.call(oModel, oContext);
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("createBindingContext calls #read with updateAggregatedMessages", function (assert) {
		var fnCallBack = function () {},
			oModel = {
				createCustomParams : function () {},
				_isCanonicalRequestNeeded : function () {},
				_isReloadNeeded : function () {},
				read : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("_isCanonicalRequestNeeded").withExactArgs(undefined)
			.returns("bCanonical");
		this.mock(oModel).expects("resolve").withExactArgs("path", "context", "bCanonical")
			.returns("sResolvedPath");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context")
			.returns("sDeepPath");
		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined)
			.returns(undefined);
		this.mock(oModel).expects("read").withExactArgs("path", {
			canonicalRequest : "bCanonical",
			context : "context",
			error : sinon.match.func,
			groupId : undefined,
			success : sinon.match.func,
			updateAggregatedMessages : true,
			urlParameters : []
		});

		// code under test
		ODataModel.prototype.createBindingContext.call(oModel, "path", "context",
			/*mParameters*/undefined, fnCallBack, /*bReload*/true);
	});

	//*********************************************************************************************
	// BCP: 1970052240
[false, true].forEach(function (bForceUpdate0, i) {
	[false, true].forEach(function (bForceUpdate1, j) {
		[{
			call0 : {"/path/A" : false, "/path/B" : true},
			call1 : {"/path/A" : true, "/path/C" : false},
			result : {"/path/A" : true, "/path/B" : true, "/path/C" : false}
		}, {
			call0 : {"/path/A" : false, "/path/B" : true},
			call1 : undefined,
			result : {"/path/A" : false, "/path/B" : true}
		}, {
			call0 : {"/path/A" : false, "/path/B" : true},
			call1 : {},
			result : {"/path/A" : false, "/path/B" : true}
		}].forEach(function (oChangedEntities, k) {
	QUnit.test("checkUpdate async (" + i + ", " + j + ", " + k + ")", function (assert) {
		var done = assert.async(),
			bForceUpdate2 = bForceUpdate0 || bForceUpdate1,
			oModel = {
				checkUpdate : function () {},
				mChangedEntities4checkUpdate : {},
				sUpdateTimer : null
			},
			sUpdateTimer;

		this.mock(oModel).expects("checkUpdate")
			.withExactArgs(bForceUpdate2, /*bAsync*/false, oChangedEntities.result)
			.callsFake(function () {
				done();
			});

		// code under test
		ODataModel.prototype.checkUpdate.call(oModel, bForceUpdate0, true, oChangedEntities.call0);

		sUpdateTimer = oModel.sUpdateTimer;
		assert.notStrictEqual(sUpdateTimer, null);

		// code under test
		ODataModel.prototype.checkUpdate.call(oModel, bForceUpdate1, true, oChangedEntities.call1);

		assert.strictEqual(oModel.sUpdateTimer, sUpdateTimer);
	});
		});
	});
});

	//*********************************************************************************************
	// BCP: 1970052240
[false, true].forEach(function (bForceUpdate, i) {
	QUnit.test("checkUpdate sync (" + i + ")", function (assert) {
		var oBinding = {
				checkUpdate : function () {}
			},
			aBindings = [oBinding],
			mChangedEntities = "changedEntities",
			oModel = {
				checkUpdate : function () {},
				getBindings : function () {},
				_processAfterUpdate : function () {},
				// test data
				sUpdateTimer : "updateTimer",
				bForceUpdate : "forceUpdate",
				mChangedEntities4checkUpdate : "commulatedChangedEntities"
			};

		this.mock(window).expects("clearTimeout").withExactArgs("updateTimer");
		this.mock(oModel).expects("getBindings").returns(aBindings);
		this.mock(oBinding).expects("checkUpdate").withExactArgs(bForceUpdate, mChangedEntities);
		this.mock(oModel).expects("_processAfterUpdate").withExactArgs();

		// code under test
		ODataModel.prototype.checkUpdate.call(oModel, bForceUpdate, false, mChangedEntities);

		assert.deepEqual(oModel.mChangedEntities4checkUpdate, {});
		assert.strictEqual(oModel.bForceUpdate, undefined);
		assert.strictEqual(oModel.sUpdateTimer, null);
	});
});

	//*********************************************************************************************
	QUnit.test("_createEventInfo: expandAfterCreateFailed", function (assert) {
		var oEventInfo,
			oModel = {},
			oRequest = {
				async : "~async",
				headers : "~requestHeader",
				method : "~method",
				requestID : "~requestID",
				requestUri : "~requestUri"
			},
			oResponseHeaders = {},
			oResponse = {
				response : {
					body : "~body",
					expandAfterCreateFailed : "~expandAfterCreateFailed",
					headers : oResponseHeaders,
					statusCode : 201,
					statusText : "~statusText"
				}
			};

		// code under test
		oEventInfo = ODataModel.prototype._createEventInfo.call(oModel, oRequest, oResponse);

		assert.deepEqual(oEventInfo, {
			ID : "~requestID",
			async : "~async",
			headers : "~requestHeader",
			method : "~method",
			response : {
				expandAfterCreateFailed : "~expandAfterCreateFailed",
				headers : oResponseHeaders,
				responseText : "~body",
				statusCode : 201,
				statusText : "~statusText"
			},
			success : true,
			url : "~requestUri"
		});
		assert.strictEqual(oEventInfo.response.headers, oResponseHeaders);
	});

	//*********************************************************************************************
	QUnit.test("_processChange: restore expandRequest", function (assert) {
		var oData = {
				__metadata : {
					created : {
						key : "~createdKey",
						expandRequest : "~expandRequest",
						withContentID : "~withContentID"
					}
				}
			},
			oModel = {
				mChangedEntities : {
					"~sKey" : {__metadata : {deepPath : "~deepPath"}}
				},
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {}
				},
				_createRequest : function () {},
				_createRequestUrl : function () {},
				_getHeaders : function () {},
				_getObject : function () {},
				_removeReferences : function () {},
				getETag : function () {}
			},
			oRequest = {},
			oResult;

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~sKey")
			.returns("~oEntityType");
		this.mock(oModel).expects("_getObject")
			.withExactArgs("/~sKey", true)
			.returns({});
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs("~oEntityType")
			.returns([]);
		this.mock(oModel).expects("_removeReferences")
			.withExactArgs({__metadata : {}})
			.returns("~oPayload");
		this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
		this.mock(oModel).expects("getETag").withExactArgs("~oPayload").returns("~sETag");
		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~createdKey", null, undefined, undefined)
			.returns("~sUrl");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~oPayload", "~sETag",
				undefined, true)
			.returns(oRequest);

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "POST");

		assert.deepEqual(oResult, {
			created : true,
			expandRequest : "~expandRequest",
			withContentID : "~withContentID"
		});
		assert.strictEqual(oResult, oRequest);
	});

	//*********************************************************************************************
[undefined, "~functionMetadata"].forEach(function (sFunctionMetadata, i) {
	var sTitle = "_processChange: restore functionTarget for function imports; " + i;

	QUnit.test(sTitle, function (assert) {
		var oData = {
				__metadata : {
					created : {
						functionImport : true,
						functionMetadata : sFunctionMetadata,
						key : "~createdKey"
					}
				}
			},
			oModel = {
				mChangedEntities : {
					"~sKey" : {__metadata : {deepPath : "~deepPath"}}
				},
				oMetadata : {
					_getCanonicalPathOfFunctionImport : function () {},
					_getEntityTypeByPath : function () {}
				},
				_createFunctionImportParameters : function () {},
				_createRequest : function () {},
				_createRequestUrl : function () {},
				_getHeaders : function () {},
				_getObject : function () {},
				_removeReferences : function () {},
				getETag : function () {}
			},
			oRequest = {},
			oResult;

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~sKey")
			.returns("~oEntityType");
		this.mock(oModel).expects("_getObject").withExactArgs("/~sKey", true).returns({});
		this.mock(oModel).expects("_createFunctionImportParameters")
			.withExactArgs("~createdKey", "POST", oData).returns("~urlParameters");
		this.mock(oModel).expects("_removeReferences").withExactArgs(undefined).returns("~payload");
		this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs("~urlParameters")
			.returns("~aUrlParams");
		this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
		this.mock(oModel).expects("getETag").withExactArgs("~payload").returns("~sETag");
		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~createdKey", null, "~aUrlParams", undefined).returns("~sUrl");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~payload", "~sETag",
				undefined, true)
			.returns(oRequest);
		this.mock(oModel.oMetadata).expects("_getCanonicalPathOfFunctionImport")
			.withExactArgs(sFunctionMetadata, "~urlParameters").exactly(sFunctionMetadata ? 1 : 0)
			.returns("~functionTarget");

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "POST");

		assert.deepEqual(oResult, sFunctionMetadata
			? {
				created : true,
				functionTarget : "~functionTarget"
			}
			: {
				created : true
			});
		assert.strictEqual(oResult, oRequest);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bExpandRequest, i) {
	QUnit.test("_processRequestQueue: push expandRequest to queue, " + i, function (assert) {
		var oRequest = {
				data : "~data",
				expandRequest : bExpandRequest ? "~expandRequest" : undefined
			},
			oChange = {
				parts : [{
					fnError : "~fnChangeError",
					request : {},
					requestHandle : "~changeRequestHandle",
					fnSuccess : "~fnChangeSuccess"
				}],
				request : oRequest
			},
			oModel = {
				mLaunderingState : "~mLaunderingState",
				bUseBatch : true,
				_collectChangedEntities : function () {},
				_createBatchRequest : function () {},
				_pushToRequestQueue : function () {},
				_submitBatchRequest : function () {},
				checkDataState : function () {},
				getKey : function () {},
				increaseLaundering : function () {},
				removeInternalMetadata : function () {}
			},
			oRequestGroup = {
				changes : {"~sChangeSetId" : [oChange]}
			},
			mRequests = {"~sGroupId" : oRequestGroup};

		this.mock(oModel).expects("_collectChangedEntities")
			.withExactArgs(sinon.match.same(oRequestGroup), {}, {});
		this.mock(oModel).expects("getKey").withExactArgs("~data").returns("~key");
		this.mock(oModel).expects("increaseLaundering").withExactArgs("/~key", "~data");
		this.mock(oModel).expects("removeInternalMetadata").withExactArgs("~data");
		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs(sinon.match.same(mRequests), "~sGroupId", undefined, "~expandRequest",
				"~fnChangeSuccess", "~fnChangeError", "~changeRequestHandle", false)
			.exactly(bExpandRequest ? 1 : 0);
		this.mock(oModel).expects("_createBatchRequest")
			.withExactArgs([{__changeRequests : [sinon.match.same(oRequest)]}])
			.returns("~oBatchRequest");
		this.mock(oModel).expects("_submitBatchRequest")
			.withExactArgs("~oBatchRequest", [[sinon.match.same(oChange)]], "~fnSuccess",
				"~fnError");
		this.mock(oModel).expects("checkDataState").withExactArgs("~mLaunderingState");

		// code under test
		ODataModel.prototype._processRequestQueue.call(oModel, mRequests, "~sGroupId", "~fnSuccess",
			"~fnError");
	});
});

	//*********************************************************************************************
	QUnit.test("createEntry: expand without bUseBatch leads to an error", function (assert) {
		var oModel = {bUseBatch : false};

		// code under test
		assert.throws(function () {
			ODataModel.prototype.createEntry.call(oModel, "~path", {expand : "ToNavigation"});
		}, new Error("The 'expand' parameter is only supported if batch mode is used"));
	});

	//*********************************************************************************************
[undefined, "~expand"].forEach(function (sExpand) {
	[true, false].forEach(function (bWithCallbackHandlers) {
		(!sExpand
		? [function () {/*no further tests*/}]
		: [
			// POST and GET succeed
			function (assert, oEventHandlersMock, fnError, fnSuccess) {
				var oDataGET = {GET : true},
					oDataPOST = {POST : true},
					oResponseGET = "~oResponseGET",
					oResponsePOST = "~oResponsePOST";

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				oEventHandlersMock.expects("fnSuccess")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs({GET : true, POST : true}, oResponsePOST);

				// code under test - GET request succeeds
				fnSuccess(oDataGET, oResponseGET);
			},
			// POST and GET fail; after retrying the creation both requests succeed
			function (assert, oEventHandlersMock, fnError, fnSuccess) {
				var oDataGET = {GET : true},
					oDataPOST = {POST : true},
					oErrorGET = {},
					oErrorPOST = {},
					oResponseGET = "~oResponseGET",
					oResponsePOST = "~oResponsePOST";

				oEventHandlersMock.expects("fnError")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs(sinon.match.same(oErrorPOST));

				// code under test - POST request fails
				fnError(oErrorPOST);

				// code under test - GET request fails
				fnError(oErrorGET);

				assert.strictEqual(oErrorGET.expandAfterCreateFailed, true);

				// retry creation

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				oEventHandlersMock.expects("fnSuccess")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs({GET : true, POST : true}, oResponsePOST);

				// code under test - GET request succeeds
				fnSuccess(oDataGET, oResponseGET);
			},
			// POST succeeds and GET fails
			function (assert, oEventHandlersMock, fnError, fnSuccess) {
				var oDataPOST = "~oDataPOST",
					oErrorGET = {},
					oResponsePOST = {};

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				this.oLogMock.expects("error")
					.withExactArgs("Entity creation was successful but expansion of navigation"
						+ " properties failed",
						sinon.match.same(oErrorGET),
						sClassName);
				oEventHandlersMock.expects("fnSuccess")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs(oDataPOST,
						sinon.match.same(oResponsePOST)
							.and(sinon.match({expandAfterCreateFailed : true})));

				// code under test - GET request fails
				fnError(oErrorGET);

				assert.strictEqual(oErrorGET.expandAfterCreateFailed, true);
			},
			// POST and GET fail; after retrying the creation both requests fail again
			function (assert, oEventHandlersMock, fnError, fnSuccess) {
				var oErrorGET0 = {},
					oErrorGET1 = {},
					oErrorPOST0 = {},
					oErrorPOST1 = {};

				oEventHandlersMock.expects("fnError")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs(sinon.match.same(oErrorPOST0));

				// code under test - POST request fails
				fnError(oErrorPOST0);

				// code under test - GET request fails
				fnError(oErrorGET0);

				assert.strictEqual(oErrorGET0.expandAfterCreateFailed, true);

				// retry creation

				oEventHandlersMock.expects("fnError")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs(sinon.match.same(oErrorPOST1));

				// code under test - POST request fails again
				fnError(oErrorPOST1);

				assert.strictEqual(oErrorPOST1.expandAfterCreateFailed, undefined);

				// code under test - GET request succeeds
				fnError(oErrorGET1);

				assert.strictEqual(oErrorGET1.expandAfterCreateFailed, true);
			},
			// POST and GET fail; after retrying the creation POST succeeds and GET fails
			function (assert, oEventHandlersMock, fnError, fnSuccess) {
				var oDataPOST = "~oDataPOST",
					oErrorGET0 = {},
					oErrorGET1 = {},
					oErrorPOST = {},
					oResponsePOST = {};

				oEventHandlersMock.expects("fnError")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs(sinon.match.same(oErrorPOST));

				// code under test - POST request fails
				fnError(oErrorPOST);

				// code under test - GET request fails
				fnError(oErrorGET0);

				assert.strictEqual(oErrorGET0.expandAfterCreateFailed, true);

				// retry after failed POST

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				this.oLogMock.expects("error")
					.withExactArgs("Entity creation was successful but expansion of navigation"
						+ " properties failed",
						sinon.match.same(oErrorGET1),
						sClassName);
				oEventHandlersMock.expects("fnSuccess")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs(oDataPOST,
						sinon.match.same(oResponsePOST)
							.and(sinon.match({expandAfterCreateFailed : true})));

				// code under test - GET request succeeds
				fnError(oErrorGET1);

				assert.strictEqual(oErrorGET1.expandAfterCreateFailed, true);
			}
		]).forEach(function (fnTestEventHandlers, i) {
	var sTitle = "createEntry: expand = " + sExpand + ", "
			+ (bWithCallbackHandlers ? "with" : "without") + " callback handlers, i = " + i;

	QUnit.test(sTitle, function (assert) {
		var fnAfterMetadataLoaded,
			oCreatedContext = {},
			oEntity,
			oEntityMetadata = {entityType : "~entityType"},
			fnError,
			oEventHandlers = {
				fnError : function () {},
				fnSuccess : function () {}
			},
			oEventHandlersMock = this.mock(oEventHandlers),
			oExpandRequest = {},
			mHeaders,
			mHeadersInput = {input : true},
			oModel = {
				mChangedEntities : {},
				mDeferredGroups : {},
				oMetadata : {
					_getEntitySetByType : function () {},
					_getEntityTypeByPath : function () {},
					_isCollection : function () {},
					isLoaded : function () {},
					loaded : function () {}
				},
				bRefreshAfterChange : false,
				mRequests : "~mRequests",
				sServiceUrl : "~sServiceUrl",
				bUseBatch : true,
				_addEntity : function () {},
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getHeaders : function () {},
				_getRefreshAfterChange : function () {},
				_isCanonicalRequestNeeded : function () {},
				_normalizePath : function () {},
				_processRequestQueueAsync : function () {},
				_pushToRequestQueue : function () {},
				getContext : function () {},
				resolveDeep : function () {}
			},
			oMetadataMock = this.mock(oModel.oMetadata),
			oModelMock = this.mock(oModel),
			oRequest = {},
			oRequestHandle,
			oResult,
			fnSuccess,
			sUid;

		oEventHandlersMock.expects("fnError").never();
		oEventHandlersMock.expects("fnSuccess").never();
		oModelMock.expects("_isCanonicalRequestNeeded")
			.withExactArgs("~canonicalRequest")
			.returns("~bCanonical");
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs("~refreshAfterChange", "~groupId")
			.returns("~bRefreshAfterChange");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs("~urlParameters")
			.returns("~aUrlParams");
		oModelMock.expects("_normalizePath")
			.withExactArgs("~path", "~context", "~bCanonical")
			.returns("/~sNormalizedPath");
		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("~sDeepPath");
		oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
		// function create()
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/~sNormalizedPath")
			.returns(oEntityMetadata);
		oMetadataMock.expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oEntityMetadata))
			.returns({name : "~entitySetName"});
		oMetadataMock.expects("_isCollection").withExactArgs("~sDeepPath").returns(true);
		oModelMock.expects("_addEntity")
			.withExactArgs(sinon.match(function (oEntity0) {
				sUid = rTemporaryKey.exec(oEntity0.__metadata.deepPath)[1];
				fnError = oEntity0.__metadata.created.error;
				mHeaders = oEntity0.__metadata.created.headers;
				fnSuccess = oEntity0.__metadata.created.success;
				oEntity = {
					__metadata : {
						created : {
							changeSetId : "~changeSetId",
							error : fnError,
							eTag : "~eTag",
							groupId : "~groupId",
							headers : mHeaders,
							key : "~sNormalizedPath",
							success : fnSuccess,
							urlParameters : "~urlParameters"
						},
						deepPath : "~sDeepPath('" + sUid + "')",
						type : "~entityType",
						uri : "~sServiceUrl/~entitySetName('" + sUid + "')"
					}
				};
				assert.deepEqual(oEntity0, oEntity);
				assert.deepEqual(mHeaders,
					sExpand
						? Object.assign({}, mHeadersInput, {
							"Content-ID" : sUid,
							"sap-messages" : "transientOnly"
						})
						: mHeadersInput);
				assert.strictEqual(
					fnError === (bWithCallbackHandlers ? oEventHandlers.fnError : undefined),
					!sExpand);
				assert.strictEqual(
					fnSuccess === (bWithCallbackHandlers ? oEventHandlers.fnSuccess : undefined),
					!sExpand);
				return true;
			}))
			.returns("~sKey");
		oModelMock.expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("/~sNormalizedPath", "~aUrlParams", true)
			.returns("~sUrl");
		oModelMock.expects("_createRequest")
			.withExactArgs("~sUrl",
				sinon.match(function (sDeepPath0) {
					return sDeepPath0 === "~sDeepPath('" + sUid + "')";
				}),
				"POST",
				sinon.match(function (mHeaders0) {
					// not strict equal, as it is a clone of oEntity
					assert.deepEqual(mHeaders0, mHeaders);
					return true;
				}),
				sinon.match(function (oEntity0) {
					// not strict equal, as it is a clone of oEntity
					assert.deepEqual(oEntity0, oEntity);
					return true;
				}),
				"~eTag")
			.returns(oRequest);

		if (sExpand) {
			this.mock(ODataUtils).expects("_encodeURLParameters")
				.withExactArgs({$expand : sExpand, $select : sExpand})
				.returns("~expandselect");
			oModelMock.expects("_getHeaders").withExactArgs(undefined, true).returns("~GETheaders");
			oModelMock.expects("_createRequest")
				.withExactArgs(sinon.match(function (sUri) {
						return sUri === "$" + sUid + "?~expandselect";
					}), sinon.match(function (sDeepPath0) {
						return sDeepPath0 === "/$" + sUid;
					}), "GET", "~GETheaders", null, undefined, undefined, true)
				.returns(oExpandRequest);
		}

		oModelMock.expects("getContext")
			.withExactArgs("/~sKey", sinon.match(function (sDeepPath0) {
				return sDeepPath0 === "~sDeepPath('" + sUid + "')";
			}))
			.returns(oCreatedContext);
		oMetadataMock.expects("loaded").withExactArgs().returns({then : function (fnFunc) {
			fnAfterMetadataLoaded = fnFunc;
		}});

		// code under test
		oResult = ODataModel.prototype.createEntry.call(oModel, "~path", {
			canonicalRequest : "~canonicalRequest",
			changeSetId : "~changeSetId",
			context : "~context",
			error : bWithCallbackHandlers ? oEventHandlers.fnError : undefined,
			eTag : "~eTag",
			expand : sExpand,
			groupId : "~groupId",
			headers : mHeadersInput,
			properties : {},
			refreshAfterChange : "~refreshAfterChange",
			success : bWithCallbackHandlers ? oEventHandlers.fnSuccess : undefined,
			urlParameters : "~urlParameters"
		});

		if (sExpand) {
			oEntity.__metadata.created.expandRequest = oExpandRequest;
			oEntity.__metadata.created.withContentID = sUid;
			assert.deepEqual(oExpandRequest, {withContentID : sUid});
		}
		assert.deepEqual(oModel.mChangedEntities["~sKey"], oEntity);
		assert.strictEqual(oResult, oCreatedContext);
		assert.deepEqual(oResult, {
			bCreated : true
		});
		assert.deepEqual(oRequest, sExpand
			? {created : true, key : "~sKey", expandRequest : oExpandRequest, withContentID : sUid}
			: {created : true, key : "~sKey"});

		// async functionality
		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~groupId", "~changeSetId", sinon.match.same(oRequest),
				sinon.match(function (fnSuccess0) {
					return fnSuccess0 === fnSuccess;
				}),
				sinon.match(function (fnError0) {
					return fnError0 === fnError;
				}),
				sinon.match(function (oRequestHandle0) {
					oRequestHandle = oRequestHandle0;
					return true;
				}),
				"~bRefreshAfterChange");
		oModelMock.expects("_processRequestQueueAsync").withExactArgs("~mRequests");

		// code under test
		fnAfterMetadataLoaded();

		// test abort handler
		assert.strictEqual(oRequest._aborted, undefined);
		if (sExpand) {
			assert.strictEqual(oRequest.expandRequest._aborted, undefined);
		}

		// code under test
		oRequestHandle.abort();

		assert.strictEqual(oRequest._aborted, true);
		if (sExpand) {
			assert.strictEqual(oRequest.expandRequest._aborted, true);
		}

		fnTestEventHandlers.call(this, assert, oEventHandlersMock, fnError, fnSuccess);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_submitBatchRequest: with content-IDs", function (assert) {
		var oBatchRequest = {},
			oBatchResponse = {
				headers : "~batchResponseHeaders"
			},
			oRequestPOST = {},
			oRequest0 = {
				parts : [{
					request : oRequestPOST,
					fnSuccess : "~fnSuccess0"
				}],
				request : {
					created : true,
					deepPath : "~deepPath('~contentID')",
					requestUri : "~serviceUri/Foo?bar",
					withContentID : "~contentID"
				}
			},
			oRequestGET = {},
			oRequest1 = {
				parts : [{
					request : oRequestGET,
					fnSuccess : "~fnSuccess1"
				}],
				request : {
					deepPath : "/$~contentID",
					requestUri : "~serviceUri/$~contentID?bar",
					withContentID : "~contentID"
				}
			},
			oResponseGET = {headers : "~getHeaders"},
			oResponsePOST = {data : "~postData", headers : "~postHeaders"},
			oData = {
				__batchResponses : [oResponsePOST, oResponseGET]
			},
			aRequests = [oRequest0, oRequest1],
			oEventInfo = {requests : sinon.match.same(aRequests), batch : true},
			fnHandleSuccess,
			oModel = {
				_getHeader : function () {},
				_getKey : function () {},
				_invalidatePathCache : function () {},
				_processSuccess : function () {},
				_setSessionContextIdHeader : function () {},
				_submitRequest : function () {},
				checkUpdate : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_submitRequest")
			.withExactArgs(sinon.match.same(oBatchRequest)
					.and(sinon.match({eventInfo : oEventInfo})),
				sinon.match.func.and(sinon.match(function (fnSuccess) {
					fnHandleSuccess = fnSuccess;
					return true;
				})),
				sinon.match.func);

		// code under test
		ODataModel.prototype._submitBatchRequest.call(oModel, oBatchRequest, aRequests,
			"~fnSuccess");

		oModelMock.expects("_getKey").withExactArgs("~postData")
			.returns("Foo('~key')");
		oModelMock.expects("_processSuccess")
			.withExactArgs(sinon.match.same(oRequestPOST), sinon.match.same(oResponsePOST),
				"~fnSuccess0", sinon.match.object, sinon.match.object, sinon.match.object);
		oModelMock.expects("_processSuccess")
			.withExactArgs(sinon.match.same(oRequestGET), sinon.match.same(oResponseGET),
				"~fnSuccess1", sinon.match.object, sinon.match.object, sinon.match.object);
		oModelMock.expects("_invalidatePathCache").withExactArgs();
		oModelMock.expects("checkUpdate").withExactArgs(false, false, sinon.match.object);
		oModelMock.expects("_processSuccess")
			.withExactArgs(sinon.match.same(oBatchRequest), sinon.match.same(oBatchResponse),
				"~fnSuccess", sinon.match.object, sinon.match.object, sinon.match.object, true,
				sinon.match.same(aRequests));
		oModelMock.expects("_getHeader")
			.withExactArgs("sap-contextid", "~batchResponseHeaders")
			.returns("~sap-contextid");
		oModelMock.expects("_setSessionContextIdHeader").withExactArgs("~sap-contextid");

		// code under test
		fnHandleSuccess(oData, oBatchResponse);

		assert.strictEqual(oRequest1.request.requestUri, "~serviceUri/Foo('~key')?bar");
		assert.strictEqual(oRequest1.request.deepPath, "~deepPath('~key')");
	});

	//*********************************************************************************************
[true, false].forEach(function (bReject) {
	QUnit.test("metadataLoaded calls oMetadata.loaded (" + bReject + ")", function (assert) {
		var oModel = {
				oMetadata : {
					loaded : function () {}
				}
			},
			oPromise = {};

		this.mock(oModel.oMetadata).expects("loaded").withExactArgs(bReject).returns(oPromise);

		//code under test
		assert.strictEqual(ODataModel.prototype.metadataLoaded.call(oModel, bReject),
			oPromise);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bReject) {
	[true, false].forEach(function (bAnnotations) {
		[true, false].forEach(function (bMetadata) {
	var sTitle = "metadataLoaded with annotations: " + "bRejectOnFailure=" + bReject + " (" +
		bAnnotations + ", " + bMetadata + ")";

	QUnit.test(sTitle, function (assert) {
		var fnAnnotationsPromise,
			oMetadataPromise,
			fnMetadataPromise,
			oModel = {
				bLoadAnnotationsJoined : true,
				oMetadata : {
					loaded : function () {}
				}
			},
			oTest = {
				resolved : function () {},
				rejected : function () {}
			},
			oTestMock = this.mock(oTest);

		oModel.pAnnotationsLoaded = new Promise(function(resolve, reject) {
			fnAnnotationsPromise = bAnnotations ? resolve : reject;
		});
		oMetadataPromise = new Promise(function(resolve, reject) {
			// The metadata promise is not rejected if !bReject (existing behavior).
			fnMetadataPromise = (bMetadata || !bReject) ? resolve : reject;
		});
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs(bReject)
			.returns(oMetadataPromise);
		// The resulting promise is never rejected if !bReject.
		if (!bReject || (bAnnotations && bMetadata)) {
			oTestMock.expects("resolved");
			oTestMock.expects("rejected").never();
		} else {
			oTestMock.expects("resolved").never();
			oTestMock.expects("rejected");
		}
		fnAnnotationsPromise();
		fnMetadataPromise();

		// code under test
		return ODataModel.prototype.metadataLoaded.call(oModel, bReject)
			.then(oTest.resolved, oTest.rejected);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_submitBatchRequest: with error responses", function (assert) {
		var oBatchRequest = {},
			oBatchRequestHandle = {abort : function () {/*not relevant for this test*/}},
			oBatchResponse = {headers : "~headers", statusCode : 200},
			oChangesetError = {message : "complete changeset failed"},
			oData = {__batchResponses : [
				oChangesetError
				// don't care about successful requests in the changeset in this test
			]},
			oError = {message : "an error message"},
			fnHandleError,
			oHandlers = {
				fnError : function () {},
				fnSuccess : function () {}
			},
			fnHandleSuccess,
			oModel = {
				_getHeader : function () {},
				_invalidatePathCache : function () {},
				_processAfterUpdate : function () {},
				_processError : function () {},
				_processSuccess : function () {},
				_setSessionContextIdHeader : function () {},
				_submitRequest : function () {},
				checkUpdate : function () {}
			},
			oModelMock = this.mock(oModel),
			oPart0_0 = {fnError : "~fnErrorPart0_0", request : {}},
			oPart1_0 = {fnError : "~fnErrorPart1_0", request : {}},
			oPart1_1 = {fnError : "~fnErrorPart1_1", request : {}},
			oPart2_0 = {fnError : "~fnErrorPart2_0", request : {}},
			oRequest0 = {parts : [oPart0_0]},
			oRequest1 = {parts : [oPart1_0, oPart1_1]},
			oRequest2 = {parts : [oPart2_0]},
			aRequests = [
				// changeset
				[oRequest1, oRequest2],
				// single request
				oRequest0
			],
			oEventInfo = {
				batch : true,
				requests : aRequests
			};

		oModelMock.expects("_submitRequest")
			.withExactArgs(sinon.match.same(oBatchRequest), sinon.match.func, sinon.match.func)
			.callsFake(function (oBatchRequest0, fnHandleSuccess0, fnHandleError0) {
				fnHandleError = fnHandleError0;
				fnHandleSuccess = fnHandleSuccess0;
				return oBatchRequestHandle;
			});

		// code under test
		ODataModel.prototype._submitBatchRequest.call(oModel, oBatchRequest, aRequests,
			oHandlers.fnSuccess, oHandlers.fnError);

		assert.deepEqual(oBatchRequest.eventInfo, oEventInfo);

		// complete $batch fails

		oModelMock.expects("_processError") // for oRequest1 - part 0
			.withExactArgs(sinon.match.same(oPart1_0.request),
				sinon.match.same(oError).and(sinon.match({$reported : true})),
				"~fnErrorPart1_0");
		oModelMock.expects("_processError") // for oRequest1 - part 1
			.withExactArgs(sinon.match.same(oPart1_1.request),
				sinon.match.same(oError).and(sinon.match({$reported : true})),
				"~fnErrorPart1_1");
		oModelMock.expects("_processError") // for oRequest2
			.withExactArgs(sinon.match.same(oPart2_0.request),
				sinon.match.same(oError).and(sinon.match({$reported : true})),
				"~fnErrorPart2_0");
		oModelMock.expects("_processError") // for oRequest0
			.withExactArgs(sinon.match.same(oPart0_0.request),
				sinon.match.same(oError).and(sinon.match({$reported : true})),
				"~fnErrorPart0_0");
		oModelMock.expects("_processAfterUpdate").withExactArgs();
		oModelMock.expects("_processError")
			.withExactArgs(sinon.match.same(oBatchRequest),
				sinon.match.same(oError).and(sinon.match({$reported : false})),
				sinon.match.same(oHandlers.fnError), true, sinon.match.same(aRequests));

		// code under test
		fnHandleError(oError);

		// $batch succeeds but single request in the batch fail

		oModelMock.expects("_processError") // for oRequest1 - part 0
			.withExactArgs(sinon.match.same(oPart1_0.request),
				sinon.match.same(oChangesetError).and(sinon.match({$reported : false})),
				"~fnErrorPart1_0")
			.callsFake(function (oRequest, oResponse, fnError0) {
				oResponse.$reported = true;
			});
		oModelMock.expects("_processError") // for oRequest1 - part 1
			.withExactArgs(sinon.match.same(oPart1_1.request),
				sinon.match.same(oChangesetError).and(sinon.match({$reported : true})),
				"~fnErrorPart1_1");
		oModelMock.expects("_processError") // for oRequest2
			.withExactArgs(sinon.match.same(oPart2_0.request),
				sinon.match.same(oChangesetError).and(sinon.match({$reported : false})),
				"~fnErrorPart2_0");
		oModelMock.expects("_invalidatePathCache").withExactArgs();
		oModelMock.expects("checkUpdate").withExactArgs(false, false, {/*mGetEntities*/});
		oModelMock.expects("_processSuccess")
			.withExactArgs(sinon.match.same(oBatchRequest), sinon.match.same(oBatchResponse),
				sinon.match.same(oHandlers.fnSuccess), {/*mGetEntities*/}, {/*mChangeEntities*/},
				{/*mEntityTypes*/}, true, sinon.match.same(aRequests));
		oModelMock.expects("_getHeader").withExactArgs("sap-contextid", "~headers")
			.returns("~contextid");
		oModelMock.expects("_setSessionContextIdHeader").withExactArgs("~contextid");

		// code under test
		fnHandleSuccess(oData, oBatchResponse);
	});

	//*********************************************************************************************
[false, true].forEach(function (bReported) {
	QUnit.test("_handleError: $reported = " + bReported, function (assert) {
		var oError = {
				$reported : bReported,
				message : "~message",
				response : {
					body : "~body",
					headers : "~headers",
					statusCode : "~code",
					statusText : "~statusText"
				}
			},
			oModel = {
				_parseResponse : function () {}
			},
			oRequest = "~oRequest",
			oResult;

		this.mock(oModel).expects("_parseResponse").exactly(bReported ? 0 : 1)
			.withExactArgs(sinon.match.same(oError.response), "~oRequest");
		this.oLogMock.expects("error").exactly(bReported ? 0 : 1)
			.withExactArgs("~message (~code ~statusText): ~body",
				undefined, sClassName);

		// code under test
		oResult = ODataModel.prototype._handleError.call(oModel, oError, oRequest);

		assert.deepEqual(oResult, {
			headers : "~headers",
			message : "~message",
			responseText : "~body",
			statusCode : "~code",
			statusText : "~statusText"
		});
		assert.strictEqual(oError.$reported, true);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bReported) {
	QUnit.test("_handleError: no response given, $reported = " + bReported, function (assert) {
		var oError = {
				$reported : bReported,
				message : "~message"
			},
			oModel = {
				_parseResponse : function () {}
			},
			oResult;

		this.mock(oModel).expects("_parseResponse").never();
		this.oLogMock.expects("error").exactly(bReported ? 0 : 1)
			.withExactArgs("The following problem occurred: ~message", undefined, sClassName);

		// code under test
		oResult = ODataModel.prototype._handleError.call(oModel, oError, "~oRequest");

		assert.deepEqual(oResult, {message : "~message"});
		assert.strictEqual(oError.$reported, true);
	});
});

	//*********************************************************************************************
	QUnit.test("_updateChangedEntities: skip __metadata", function (assert) {
		var mChangedEntitiesNew = {
				"~key" : {
					__metadata : {
						etag : "~etag_new",
						uri : "~uri"
					},
					foo : "bar"
				}
			},
			mChangedEntitiesOld = {
				"~key" : {
					__metadata : {
						etag : "~etag_old",
						uri : "~uri"
					},
					foo : "bar"
				}
			},
			mChangedEntities4oChangedEntry = Object.assign({}, mChangedEntitiesOld["~key"]),
			mChangedEntities4oEntry = Object.assign({}, mChangedEntitiesNew["~key"]),
			oModel = {
				mChangedEntities : mChangedEntitiesOld,
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavPropertyRefInfo : function () {}
				},
				_getObject : function () {},
				_resolveGroup : function () {},
				abortInternalRequest : function () {},
				isLaundering : function () {},
				removeInternalMetadata : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getObject")
			.withExactArgs("/~key", null, true)
			.returns(mChangedEntities4oEntry);
		oModelMock.expects("_getObject")
			.withExactArgs("/~key")
			.returns(mChangedEntities4oChangedEntry);
		oModelMock.expects("removeInternalMetadata")
			.withExactArgs(sinon.match.same(mChangedEntities4oChangedEntry))
			.returns("~removedMetadata");
		oModelMock.expects("isLaundering").withExactArgs("/~key/foo");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~key")
			.returns("~oEntityType");
		this.mock(oModel.oMetadata).expects("_getNavPropertyRefInfo")
			.withExactArgs("~oEntityType", "foo")
			.returns(null);
		oModelMock.expects("_resolveGroup").withExactArgs("~key").returns({groupId : "~group"});
		oModelMock.expects("abortInternalRequest").withExactArgs("~group", {requestKey : "~key"});

		// code under test
		ODataModel.prototype._updateChangedEntities.call(oModel, mChangedEntitiesNew);

		assert.deepEqual(oModel.mChangedEntities, {});
	});

	//*********************************************************************************************
	QUnit.test("remove: create request with bUpdateAggregatedMessages=true", function (assert) {
		var fnHandleProcessSuccess,
			oModel = {
				mDeferredGroups : {},
				mRequests : "~mRequests",
				bUseBatch : "~bUseBatch",
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getHeaders : function () {},
				_getRefreshAfterChange : function () {},
				_isCanonicalRequestNeeded : function () {},
				_normalizePath : function () {},
				_processRequest : function () {},
				_pushToRequestQueue : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs("~bCanonical0")
			.returns("~bCanonical1");
		this.mock(oModel).expects("_getRefreshAfterChange")
			.withExactArgs("~bRefreshAfterChange0", "~sGroupId")
			.returns("~bRefreshAfterChange1");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs("~mUrlParams")
			.returns("~aUrlParams");
		this.mock(oModel).expects("_getHeaders")
			.withExactArgs("~mHeaders0")
			.returns("~mHeaders1");
		this.mock(oModel).expects("_normalizePath")
			.withExactArgs("~sPath", "~oContext", "~bCanonical1")
			.returns("~sNormalizedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", "~oContext")
			.returns("~sDeepPath");
		this.mock(oModel).expects("_processRequest")
			.withExactArgs(sinon.match.func, "~fnError", false)
			.callsFake(function (fnHandleProcessSuccess0, fnError, bDeferred) {
				fnHandleProcessSuccess = fnHandleProcessSuccess0;
			});

		// code under test
		ODataModel.prototype.remove.call(oModel, "~sPath", {
			canonicalRequest : "~bCanonical0",
			changeSetId : "~sChangeSetId",
			context : "~oContext",
			error : "~fnError",
			eTag : "~sETag",
			groupId : "~sGroupId",
			headers : "~mHeaders0",
			refreshAfterChange : "~bRefreshAfterChange0",
			urlParameters : "~mUrlParams"
		});

		this.mock(oModel).expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("~sNormalizedPath", "~aUrlParams", "~bUseBatch")
			.returns("~sUrl");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~sDeepPath", "DELETE", "~mHeaders1", undefined, "~sETag",
				undefined, true)
			.returns("~oRequest");
		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~sGroupId", "~sChangeSetId", "~oRequest",
				sinon.match.func, "~fnError", "~requestHandle", "~bRefreshAfterChange1");

		// code under test
		fnHandleProcessSuccess("~requestHandle");
	});

	//*********************************************************************************************
[{groupId : "~groupId"}, {batchGroupId : "~groupId"}].forEach(function (oGroupFixture, i) {
	[{
		oFunctionMetadata : {
			parameter : [{name : "~name0", type : "~type0"}, {name : "~name1", type : "~type1"}]
		}
	}, {
		oFunctionMetadata : {
			entitySetPath : "~entitySetPath",
			parameter : null
		},
		$result : {__list : []}
	}, {
		oFunctionMetadata : {
			entitySet : "~entitySet",
			parameter : null
		},
		$result : {__list : []}
	}, {
		oFunctionMetadata : {
			entitySet : "~entitySet",
			parameter : null,
			returnType : "~returnType"
		},
		$result : {__ref : {}} // single entity
	}, {
		oFunctionMetadata : {
			entitySet : "~entitySet",
			parameter : null,
			returnType : "Collection(~returnType)"
		},
		$result : {__list : []}
	}].forEach(function (oFunctionMetadataFixture, j) {
		[true, false].forEach(function (bInDeferredGroups) {
	var sTitle = "callFunction: oGroupFixture#" + i + ", oFunctionMetadataFixture#" + j
			+ ", group in deferred Groups: " + bInDeferredGroups;

	QUnit.test(sTitle, function (assert) {
		var oContextCreatedPromise,
			oData,
			bFunctionHasParameter = oFunctionMetadataFixture.oFunctionMetadata.parameter !== null,
			mHeaders = {foo : "bar"},
			oExpectedOData = Object.assign({
					__metadata : {
						created : {
							changeSetId : "~changeSetId",
							error : "~error",
							eTag : "~eTag",
							functionImport : true,
							groupId : "~groupId",
							headers : mHeaders,
							key : "~sFunctionName",
							method : "~method",
							success : "~success"
						},
						uri : sinon.match(function (sUri) {
							return sUri.startsWith("/service/url/~sFunctionName")
								&& sUri.match(rTemporaryKey);
						})
					}
				},
				bFunctionHasParameter
					? {"~name0" : "~defaultValue0", "~name1" : "foo"}
					: undefined),
			oMetadata = {
				_getCanonicalPathOfFunctionImport : function () {},
				_getFunctionImportMetadata : function () {}
			},
			oModel = {
				mDeferredGroups : bInDeferredGroups ? {"~groupId" : "bar"} : {},
				mDeferredRequests : "~mDeferredRequests",
				oMetadata : oMetadata,
				mRequests : "~mRequests",
				bUseBatch : "~bUseBatch",
				sServiceUrl : "/service/url",
				_addEntity : function () {},
				_createPropertyValue : function () {},
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getHeaders : function () {},
				_getRefreshAfterChange : function () {},
				_processRequest : function () {},
				_pushToRequestQueue : function () {},
				_writePathCache : function () {},
				getContext : function () {}
			},
			oModelMock = this.mock(oModel),
			fnProcessRequest,
			oRequest = {},
			oRequestHandle = {},
			oResult,
			oResultingRequest;

		if (oFunctionMetadataFixture.$result) {
			oExpectedOData.$result = oFunctionMetadataFixture.$result;
		}
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs("~refreshAfterChange", "~groupId")
			.returns("~bRefreshAfterChange");
		oModelMock.expects("_getHeaders")
			.withExactArgs(sinon.match.same(mHeaders))
			.returns("~mHeaders");
		oModelMock.expects("_processRequest")
			.withExactArgs(sinon.match.func, "~error")
			.callsFake(function (fnProcessRequest0) {
				fnProcessRequest = fnProcessRequest0;
				return oRequestHandle;
			});

		// code under test
		oResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
			batchGroupId : oGroupFixture.batchGroupId,
			changeSetId : "~changeSetId",
			error : "~error",
			eTag : "~eTag",
			groupId : oGroupFixture.groupId,
			headers : mHeaders,
			method : "~method",
			refreshAfterChange : "~refreshAfterChange",
			success : "~success",
			urlParameters : {"~name1" : "foo"}
		});

		assert.strictEqual(oResult, oRequestHandle);
		oContextCreatedPromise = oResult.contextCreated();
		assert.ok(oContextCreatedPromise instanceof Promise);

		this.mock(oMetadata).expects("_getFunctionImportMetadata")
			.withExactArgs("/~sFunctionName", "~method")
			.returns(oFunctionMetadataFixture.oFunctionMetadata);

		if (bFunctionHasParameter) {
			oModelMock.expects("_createPropertyValue")
				.withExactArgs("~type0")
				.returns("~defaultValue0");
			oModelMock.expects("_createPropertyValue")
				.withExactArgs("~type1")
				.returns("~defaultValue1");
			this.oLogMock.expects("warning")
				.withExactArgs("No value given for parameter '~name0' of function import"
					+ " '/~sFunctionName'", sinon.match.same(oModel), sClassName);
			this.mock(ODataUtils).expects("formatValue")
				.withExactArgs("foo", "~type1")
				.returns("~value1");
		} else {
			oModelMock.expects("_createPropertyValue").never();
		}

		oModelMock.expects("_addEntity").withExactArgs(oExpectedOData)
			.callsFake(function (oData0) {
				oData = oData0;
				assert.notStrictEqual(oData.__metadata.created.headers, mHeaders);

				return "~sKey";
			});
		oModelMock.expects("getContext").withExactArgs("/~sKey").returns("~oContext");
		oModelMock.expects("_writePathCache").withExactArgs("/~sKey", "/~sKey");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs({"~name1" : bFunctionHasParameter ? "~value1" : "foo"})
			.returns("~aUrlParams");
		oModelMock.expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("/~sFunctionName", "~aUrlParams", "~bUseBatch")
			.returns("~sUrl");
		oModelMock.expects("_createRequest")
			.withExactArgs("~sUrl", "/~sFunctionName", "~method", "~mHeaders", undefined, "~eTag",
				undefined, true)
			.returns(oRequest);
		this.mock(oMetadata).expects("_getCanonicalPathOfFunctionImport")
			.withExactArgs(sinon.match.same(oFunctionMetadataFixture.oFunctionMetadata),
				{"~name1" : bFunctionHasParameter ? "~value1" : "foo"})
			.returns("~functionTarget");
		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs(bInDeferredGroups ? "~mDeferredRequests" : "~mRequests", "~groupId",
				"~changeSetId", sinon.match.same(oRequest), "~success", "~error", "~requestHandle",
				"~bRefreshAfterChange");

		// code under test
		oResultingRequest = fnProcessRequest("~requestHandle");

		assert.strictEqual(oResultingRequest, oRequest);
		assert.deepEqual(oResultingRequest, {
			functionMetadata : oFunctionMetadataFixture.oFunctionMetadata,
			functionTarget : "~functionTarget",
			key : "~sKey"
		});
		assert.strictEqual(oData.__metadata.created.functionMetadata,
			oFunctionMetadataFixture.oFunctionMetadata);

		return oContextCreatedPromise.then(function (oContext) {
			assert.strictEqual(oContext, "~oContext");
		});
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("callFunction: function name starts not with /", function (assert) {
		var oModel = {};

		this.oLogMock.expects("fatal")
			.withExactArgs("callFunction: sFunctionName has to be absolute, but the given"
				+ " '~sFunctionName' is not absolute", sinon.match.same(oModel), sClassName);

		// code under test
		assert.strictEqual(ODataModel.prototype.callFunction.call(oModel, "~sFunctionName"),
			undefined);

	});

	//*********************************************************************************************
	QUnit.test("callFunction: no function metadata; no parameters", function (assert) {
		var oContextCreatedPromise,
			oMetadata = {
				_getFunctionImportMetadata : function () {}
			},
			oModel = {
				oMetadata : oMetadata,
				_getHeaders : function () {},
				_getRefreshAfterChange : function () {},
				_processRequest : function () {}
			},
			oModelMock = this.mock(oModel),
			fnProcessRequest,
			oRequestHandle = {},
			oResult;

		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs(undefined, undefined)
			.returns("~bRefreshAfterChange");
		oModelMock.expects("_processRequest")
			.withExactArgs(sinon.match.func, undefined)
			.callsFake(function (fnProcessRequest0) {
				fnProcessRequest = fnProcessRequest0;
				return oRequestHandle;
			});
		oModelMock.expects("_getHeaders").never();

		// code under test
		oResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName");

		assert.strictEqual(oResult, oRequestHandle);
		oContextCreatedPromise = oResult.contextCreated();
		assert.ok(oContextCreatedPromise instanceof Promise);

		this.mock(oMetadata).expects("_getFunctionImportMetadata")
			.withExactArgs("/~sFunctionName", "GET")
			.returns(undefined);
		this.oLogMock.expects("error")
			.withExactArgs("Function '/~sFunctionName' not found in the metadata",
				sinon.match.same(oModel), sClassName);

		// code under test
		assert.strictEqual(fnProcessRequest("~requestHandle"), undefined);

		return oContextCreatedPromise.then(function () {
			assert.ok(false, "created Promise has to be rejected");
		}, function () {
			assert.ok(true, "created Promise is rejected");
		});
	});

	//*********************************************************************************************
	QUnit.test("getDeepPathForCanonicalPath", function (assert) {
		var oModel = {
				// used by ODataListBinding and ODataTreeBinding
				checkFilterOperation : function () {},
				createCustomParams : function () { return {}; }, // used by ODataListBinding
				resolveDeep : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel),
			oContextBinding = new ODataContextBinding(oModel, "path/to/entity", "~oContext0"),
			oListBinding,
			oPropertyBinding,
			oTreeBinding = new ODataTreeBinding(oModel, "path4tree", "~oContext3"),
			oUnresolvedBinding = new ODataContextBinding(oModel, "path/unbound");

		oModelMock.expects("resolveDeep").withExactArgs("path/to/collection", "~oContext1")
			.returns("/deep/path/to/collection");
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(false);
		oListBinding = new ODataListBinding(oModel, "path/to/collection", "~oContext1");

		this.mock(ODataPropertyBinding.prototype).expects("_getValue").withExactArgs()
			.returns("foo");
		this.mock(ODataPropertyBinding.prototype).expects("getDataState").withExactArgs()
			.returns({setValue : function () {/*not relevant*/}});
		oPropertyBinding = new ODataPropertyBinding(oModel, "path/to/property", "~oContext2");

		oModel.aBindings = [oTreeBinding, oPropertyBinding, oContextBinding, oListBinding,
			oUnresolvedBinding];

		oModelMock.expects("resolveDeep").withExactArgs("path/to/entity", "~oContext0")
			.returns("/deep/path/to/entity");
		oModelMock.expects("resolveFromCache").withExactArgs("/deep/path/to/entity")
			.returns("/~sCanonicalPath(42)");
		oModelMock.expects("resolveDeep").withExactArgs("path/to/collection(42)", "~oContext1")
			.returns("/deep/path/to/collection(42)");
		oModelMock.expects("resolveFromCache").withExactArgs("/deep/path/to/collection(42)")
			.returns("/~sCanonicalPath0(42)");

		// code under test
		assert.strictEqual(
			ODataModel.prototype.getDeepPathForCanonicalPath.call(oModel, "/~sCanonicalPath(42)"),
			"/deep/path/to/entity");
	});

	//*********************************************************************************************
	QUnit.test("getDeepPathForCanonicalPath: different deep paths", function (assert) {
		var oModel = {
				resolveDeep : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel),
			oContextBinding0 = new ODataContextBinding(oModel, "path2entity", "~oContext0"),
			oContextBinding1 = new ODataContextBinding(oModel, "another/path2entity", "~oContext1");

		oModel.aBindings = [oContextBinding0, oContextBinding1];

		oModelMock.expects("resolveDeep").withExactArgs("path2entity", "~oContext0")
			.returns("/deep/path2entity");
		oModelMock.expects("resolveFromCache").withExactArgs("/deep/path2entity")
			.returns("/~sCanonicalPath(42)");
		oModelMock.expects("resolveDeep").withExactArgs("another/path2entity", "~oContext1")
			.returns("/deep/another/path2entity");
		oModelMock.expects("resolveFromCache").withExactArgs("/deep/another/path2entity")
			.returns("/~sCanonicalPath(42)");

		// code under test
		assert.strictEqual(
			ODataModel.prototype.getDeepPathForCanonicalPath.call(oModel, "/~sCanonicalPath(42)"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("getDeepPathForCanonicalPath: same deep path", function (assert) {
		var oModel = {
				resolveDeep : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel),
			oContextBinding0 = new ODataContextBinding(oModel, "path2entity", "~oContext0"),
			oContextBinding1 = new ODataContextBinding(oModel, "another/path2entity", "~oContext1");

		oModel.aBindings = [oContextBinding0, oContextBinding1];

		oModelMock.expects("resolveDeep").withExactArgs("path2entity", "~oContext0")
			.returns("/same/deep/path2entity");
		oModelMock.expects("resolveFromCache").withExactArgs("/same/deep/path2entity")
			.returns("/~sCanonicalPath(42)");
		oModelMock.expects("resolveDeep").withExactArgs("another/path2entity", "~oContext1")
			.returns("/same/deep/path2entity");
		oModelMock.expects("resolveFromCache").withExactArgs("/same/deep/path2entity")
			.returns("/~sCanonicalPath(42)");

		// code under test
		assert.strictEqual(
			ODataModel.prototype.getDeepPathForCanonicalPath.call(oModel, "/~sCanonicalPath(42)"),
			"/same/deep/path2entity");
	});

	//*********************************************************************************************
[undefined, "~functionTarget"].forEach(function (sFunctionTarget, i) {
	QUnit.test("_pushToRequestQueue: restore functionTarget; " + i, function (assert) {
		var oModel = {},
			oRequest = {
				functionTarget : sFunctionTarget,
				key : "~key"
			},
			mRequests = {
				"~sGroupId" : {
					map : {
						"~key" : {request : {}}
					}
				}
			};

		// code under test
		ODataModel.prototype._pushToRequestQueue.call(oModel, mRequests, "~sGroupId", undefined,
			oRequest);

		assert.deepEqual(mRequests["~sGroupId"].map["~key"].request, sFunctionTarget
			? {
				data : undefined,
				functionTarget : "~functionTarget",
				headers : undefined,
				method : undefined,
				requestUri : undefined
			}
			: {
				data : undefined,
				headers : undefined,
				method : undefined,
				requestUri : undefined
			});
	});
});
});