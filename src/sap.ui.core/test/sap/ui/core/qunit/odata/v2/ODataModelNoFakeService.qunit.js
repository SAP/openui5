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
	/*eslint camelcase: 0, max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.v2.ODataModel";

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
[
	{path : "~path?$filter=very_long_value", pathNoParams : "~path"},
	{path : "~path/$count?$filter=very_long_value", pathNoParams : "~path/$count"},
	{path : "~path/$count", pathNoParams : "~path/$count"}
].forEach(function (oFixture, i) {
	QUnit.test("read: _refresh passed to _createRequest, " + i, function (assert) {
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
			oRequest = {},
			sSorterParams = "~$orderby",
			sUrl = "~url",
			aUrlParams = [];

		oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(bCanonicalRequest)
			.returns(bIsCanonicalRequestNeeded);
		oODataUtilsMock.expects("_createUrlParamsArray").withExactArgs(mUrlParams)
			.returns(aUrlParams);
		oModelMock.expects("_getHeaders").withExactArgs(mHeaders, true).returns(mGetHeaders);
		oModelMock.expects("_getETag").withExactArgs(oFixture.pathNoParams, oContext)
			.returns(sETag);
		oModelMock.expects("_normalizePath")
			.withExactArgs("~path", oContext, bIsCanonicalRequestNeeded)
			.returns(sNormalizedTempPath);
		oModelMock.expects("_normalizePath")
			.withExactArgs(oFixture.pathNoParams, oContext, bIsCanonicalRequestNeeded)
			.returns(sNormalizedPath);
		oModelMock.expects("resolveDeep").withExactArgs(oFixture.pathNoParams, oContext)
			.returns(sDeepPath);
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
		ODataModel.prototype.read.call(oModel, oFixture.path, mParameters);
	});
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
	QUnit.test("removeInternalMetadata", function (assert) {
		var oEntityData,
			oModel = {},
			oModelPrototypeMock = this.mock(ODataModel.prototype),
			oResult;

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel);

		assert.deepEqual(oResult, {created : undefined, deepPath : undefined, invalid : undefined});

		oEntityData = {};

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);

		assert.deepEqual(oEntityData, {});
		assert.deepEqual(oResult, {created : undefined, deepPath : undefined, invalid : undefined});

		oEntityData = {
			p : "p",
			__metadata : {
				uri : "uri",
				created : "created",
				deepPath : "deepPath",
				invalid : "invalid"
			}
		};

		// code under test
		oResult = ODataModel.prototype.removeInternalMetadata.call(oModel, oEntityData);

		assert.deepEqual(oEntityData, {p : "p", __metadata : {uri : "uri"}});
		assert.deepEqual(oResult, {
			created : "created",
			deepPath : "deepPath",
			invalid : "invalid"
		});

		oEntityData = {
			p : "p",
			__metadata : {
				uri : "uri",
				created : "created",
				deepPath : "deepPath",
				invalid : "invalid"
			},
			n : { // 0..1 navigation property
				p2 : "p2",
				__metadata : {
					uri : "uri2",
					created : "created2",
					deepPath : "deepPath2",
					invalid : "invalid2"
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
		assert.deepEqual(oResult, {
			created : "created",
			deepPath : "deepPath",
			invalid : "invalid"
		});

		oEntityData = {
			p : "p",
			__metadata : {
				uri : "uri",
				created : "created",
				deepPath : "deepPath",
				invalid : "invalid"
			},
			n : [{ // 0..n navigation property
					p2 : "p2",
					__metadata : {
						uri : "uri2",
						created : "created2",
						deepPath : "deepPath2",
						invalid : "invalid2"
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
		assert.deepEqual(oResult, {
			created : "created",
			deepPath : "deepPath",
			invalid : "invalid"
		});
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
						deepPath : "deepPath1",
						invalid : "invalid1"
					},
					x : {
						p4 : "p4",
						n3 : [{ // 0..n navigation property
							p3 : "p3",
							__metadata : {
								uri : "uri3",
								created : "created3",
								deepPath : "deepPath3",
								invalid : "invalid3"
							}
						}]
					}
				},
				n2 : [{ // 0..n navigation property
					p2 : "p2",
					__metadata : {
						uri : "uri2",
						created : "created2",
						deepPath : "deepPath2",
						invalid : "invalid2"
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
		assert.deepEqual(oResult, {created : undefined, deepPath : undefined, invalid : undefined});
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
	[{ isFunction : "isFunction" }, undefined].forEach(function (oEntityType, j) {
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
			.withExactArgs("~message (~code ~statusText): ~body", undefined, sClassName);

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
[{
	input : undefined,
	output : {}
}, {
	input : null,
	output : {}
}, {
	input : "foo",
	output : {}
}, {
	input : 42,
	output : {}
}, {
	input : ["a", "b", "c"],
	output : {}
}].forEach(function (oFixture, i) {
	QUnit.test("increaseLaundering: skip laundering if oChangedEntity is not a plain object " + i,
			function (assert) {
		var oModel = {
				mLaunderingState : {}
			};

		// code under test
		ODataModel.prototype.increaseLaundering.call(oModel, "/Test", oFixture.input);

		assert.deepEqual(oModel.mLaunderingState, oFixture.output);
	});
});

	//*********************************************************************************************
[{
	input : {},
	launderingState : {},
	output : {"/Test" : 1}
}, {
	input : {property1 : "foo", property2 : "bar"},
	launderingState : {},
	output : {"/Test" : 1, "/Test/property1" : 1, "/Test/property2" : 1}
}, {
	input : {__metadata : {}, property1 : "foo"},
	launderingState : {},
	output : {"/Test" : 1, "/Test/property1" : 1}
}, {
	increaseLaunderingPath : "/Test/property2",
	input : {property1 : "foo", property2 : {}},
	launderingState : {},
	output : {"/Test" : 1, "/Test/property1" : 1}
}, {
	input : {property1 : "foo", property3 : "baz"},
	launderingState : {"/Test" : 1, "/Test/property1" : 1, "/Test/property2" : 1},
	output : {"/Test" : 2, "/Test/property1" : 2, "/Test/property2" : 1, "/Test/property3" : 1}
}].forEach(function (oFixture, i) {
	QUnit.test("increaseLaundering: oChangedEntity is a plain object " + i, function (assert) {
		var sIncreaseLaunderingPath = oFixture.increaseLaunderingPath || "",
			oModel = {
				increaseLaundering : function () {},
				mLaunderingState : oFixture.launderingState
			};

		this.mock(oModel).expects("increaseLaundering")
			.withExactArgs(sIncreaseLaunderingPath,
				sinon.match.same(oFixture.input[sIncreaseLaunderingPath.slice(6)]))
			.exactly(sIncreaseLaunderingPath ? 1 : 0);

		// code under test
		ODataModel.prototype.increaseLaundering.call(oModel, "/Test", oFixture.input);

		assert.deepEqual(oModel.mLaunderingState, oFixture.output);
	});
});

	//*********************************************************************************************
[{
	input : undefined,
	output : {"/Test" : 1}
}, {
	input : null,
	output : {"/Test" : 1}
}, {
	input : "foo",
	output : {"/Test" : 1}
}, {
	input : 42,
	output : {"/Test" : 1}
}, {
	input : ["a", "b", "c"],
	output : {"/Test" : 1}
}].forEach(function (oFixture, i) {
	QUnit.test("decreaseLaundering: skip laundering if oChangedEntity is not a plain object " + i,
			function (assert) {
		var oModel = {
				mLaunderingState : {"/Test" : 1}
			};

		// code under test
		ODataModel.prototype.decreaseLaundering.call(oModel, "/Test", oFixture.input);

		assert.deepEqual(oModel.mLaunderingState, oFixture.output);
	});
});

	//*********************************************************************************************
[{
	input : {},
	launderingState : {"/Test" : 1},
	output : {}
}, {
	input : {property1 : "foo", property2 : "bar"},
	launderingState : {"/Test" : 1, "/Test/property1" : 1, "/Test/property2" : 1},
	output : {}
}, {
	input : {__metadata : {}, property1 : "foo"},
	launderingState : {"/Test" : 1, "/Test/property1" : 1},
	output : {}
}, {
	decreaseLaunderingPath : "/Test/property2",
	input : {property1 : "foo", property2 : {}},
	launderingState : {"/Test" : 1, "/Test/property1" : 1},
	output : {}
}, {
	input : {property1 : "foo", property3 : "baz"},
	launderingState : {"/Test" : 2, "/Test/property1" : 2, "/Test/property2" : 1,
		"/Test/property3" : 1},
	output : {"/Test" : 1, "/Test/property1" : 1, "/Test/property2" : 1}
}].forEach(function (oFixture, i) {
	QUnit.test("decreaseLaundering: oChangedEntity is a plain object " + i, function (assert) {
		var sDecreaseLaunderingPath = oFixture.decreaseLaunderingPath || "",
			oModel = {
				decreaseLaundering : function () {},
				mLaunderingState : oFixture.launderingState
			};

		this.mock(oModel).expects("decreaseLaundering")
			.withExactArgs(sDecreaseLaunderingPath,
				sinon.match.same(oFixture.input[sDecreaseLaunderingPath.slice(6)]))
			.exactly(sDecreaseLaunderingPath ? 1 : 0);

		// code under test
		ODataModel.prototype.decreaseLaundering.call(oModel, "/Test", oFixture.input);

		assert.deepEqual(oModel.mLaunderingState, oFixture.output);
	});
});

	//*********************************************************************************************
[{
	vChangedValue : {ms : 60000, __edmType : "Edm.Time"},
	bMergeRequired : true,
	vNewValue : {ms : 0, __edmType : "Edm.Time"},
	vNewValueClone : {ms : 0, __edmType : "Edm.Time"},
	vOriginalValue : {ms : 0, __edmType : "Edm.Time"}
}, {
	vChangedValue : new Date(120000),
	bMergeRequired : false,
	vNewValue : new Date(60000),
	vNewValueClone : new Date(60000),
	vOriginalValue : new Date(60000)
}, {
	vChangedValue : 13,
	bMergeRequired : false,
	vNewValue : 42,
	vNewValueClone : 42,
	vOriginalValue : 42
}].forEach(function (oFixture, i) {
	QUnit.test("setProperty: revert pending change; #" + i, function (assert) {
		var oClonedChangedEntry = {
				__metadata : {}
			},
			oMetadataLoadedPromise = Promise.resolve(),
			oModel = {
				mChangedEntities : {
					"~entityKey" : {
						__metadata : "~changedEntityMetadata",
						"~propertyPath" : oFixture.vChangedValue
					}
				},
				sDefaultUpdateMethod : "~sDefaultUpdateMethod",
				mDeferredGroups : {"~groupId" : "~groupId"},
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavPropertyRefInfo : function () {},
					loaded : function () {}
				},
				_getObject : function () {},
				_resolveGroup : function () {},
				abortInternalRequest : function () {},
				checkUpdate : function () {},
				getEntityByPath : function () {},
				isLaundering : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			},
			oModelMock = this.mock(oModel),
			oOriginalEntry = {
				__metadata : {},
				"~propertyPath" : oFixture.vOriginalValue
			};

		oModelMock.expects("resolve")
			.withExactArgs("~sPath", "~oContext")
			.returns("/resolved/~propertyPath");
		oModelMock.expects("resolveDeep")
			.withExactArgs("~sPath", "~oContext")
			.returns("/deepPath/~propertyPath");
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/resolved/~propertyPath", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "~entityKey";
				oEntityInfo.propertyPath = "~propertyPath";

				return oClonedChangedEntry;
			});
		oModelMock.expects("_getObject")
			.withExactArgs("/~entityKey", null, true)
			.returns(oOriginalEntry);
		oModelMock.expects("_getObject")
			.withExactArgs("~sPath", "~oContext", true)
			.returns(oFixture.vOriginalValue);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~entityKey")
			.returns("~oEntityType");
		this.mock(oModel.oMetadata).expects("_getNavPropertyRefInfo")
			.withExactArgs("~oEntityType", "~propertyPath")
			.returns(/*oNavPropRefInfo*/null);
		oModelMock.expects("isLaundering").withExactArgs("/~entityKey").returns(false);
		oModelMock.expects("checkUpdate")
			.withExactArgs(false, "~bAsyncUpdate", {"~entityKey" : true});
		this.mock(oModel.oMetadata).expects("loaded")
			.withExactArgs()
			.returns(oMetadataLoadedPromise);
		oModelMock.expects("_resolveGroup")
			.withExactArgs("~entityKey")
			.returns({changeSetId : "~changeSetId", groupId : "~groupId"});
		oModelMock.expects("abortInternalRequest")
			.withExactArgs("~groupId", {requestKey : "~entityKey"});

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "~sPath", oFixture.vNewValue, "~oContext",
				"~bAsyncUpdate"),
			true);

		assert.deepEqual(oModel.mChangedEntities, {});
		assert.deepEqual(oFixture.vNewValue, oFixture.vNewValueClone, "new value not modified");

		return oMetadataLoadedPromise.then(function () {/*wait for aborted requests*/});
	});
});
});