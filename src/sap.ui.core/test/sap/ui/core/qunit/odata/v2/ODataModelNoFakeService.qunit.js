/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils"
], function (Log, FilterProcessor, MessageScope, ODataUtils, ODataModel, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

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
	QUnit.test("read: _refresh passed to _createRequest", function (assert) {
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
			bRefresh = "{boolean} bRefresh",
			aSorters = "{sap.ui.model.Sorter[]} aSorters",
			fnSuccess = "{function} fnSuccess",
			mUrlParams = "{object} mUrlParams",
			mParameters = {
				_refresh : bRefresh,
				canonicalRequest : bCanonicalRequest,
				context : oContext,
				error : fnError,
				filters : aFilters,
				groupId : sGroupId,
				headers : mHeaders,
				sorters : aSorters,
				success : fnSuccess,
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
			.withExactArgs(sUrl, sDeepPath, "GET", mGetHeaders, null, sETag, undefined, bRefresh)
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
		sMethod : "~method"
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
		sMethod : "DELETE"
	}
}].forEach(function (oFixture, i) {
	QUnit.test("_createRequest: " + i, function (assert) {
		var mExpectedHeaders = Object.assign({}, oFixture.mHeaders,
				oFixture.oExpected.mAdditionalHeaders),
			oModel = {
				_createRequestID : function () {},
				// members
				bJSON : oFixture.bJSON,
				sMessageScope : oFixture.sMessageScope,
				sPassword : "~password",
				bUseBatch : oFixture.bUseBatch,
				sUser : "~user",
				bWithCredentials : oFixture.bWithCredentials
			},
			bRefresh = "{boolean} bRefresh",
			oRequest,
			sRequestID = "~uid",
			oExpectedResult = {
				async : oFixture.oExpected.bAsync,
				deepPath : "~deepPath",
				headers : mExpectedHeaders,
				method : oFixture.oExpected.sMethod,
				password : "~password",
				refresh : bRefresh,
				requestID : sRequestID,
				requestUri : oFixture.sUrl,
				user : "~user"
			};

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
			bRefresh);

		assert.deepEqual(oRequest, oExpectedResult);
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
		assert.strictEqual(
			ODataModel.prototype._processChange.call(oModel, sKey, oData, sUpdateMethod, sDeepPath),
			oRequest);
	});

	//*********************************************************************************************
	QUnit.test("_writePathCache: ", function (assert) {
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
	QUnit.test("_importData for function import", function (assert) {
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
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport");

		// the parameter oResponse is unused in this test as there is no array or navigation
		// properties in the data nor are there bindable response headers
		// the parameter sKey is unused in this test as it is always unset in non-recursive calls to
		// _importData

		// code under test
		ODataModel.prototype._importData.call(oModel, oData, mChangedEntities,
			/*oResponse*/ undefined, "sPath", "sDeepPath", /*sKey*/ undefined, "bFunctionImport");

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
});