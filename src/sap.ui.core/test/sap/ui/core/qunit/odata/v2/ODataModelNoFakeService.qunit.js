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
	QUnit.test("cleanUpMetadata", function (assert) {
		var oEntity = {
				__metadata : {
					"content_type" : "content_type",
					created : "created",
					"edit_media" : "edit_media",
					etag : "etag",
					id : "id",
					"media_etag" : "media_etag",
					"media_src" : "media_src",
					nonStandard : "foo",
					type : "type",
					uri : "uri"
				},
				p : "p"
			};

		// code under test
		assert.strictEqual(ODataModel.cleanUpMetadata(oEntity), oEntity);

		assert.deepEqual(oEntity, {
			__metadata : {
				"content_type" : "content_type",
				created : "created",
				"edit_media" : "edit_media",
				etag : "etag",
				id : "id",
				"media_etag" : "media_etag",
				"media_src" : "media_src",
				type : "type",
				uri : "uri"
			},
			p : "p"
		});

		// code under test
		assert.strictEqual(ODataModel.cleanUpMetadata(), undefined);

		// code under test: object w/o __metadata
		assert.deepEqual(ODataModel.cleanUpMetadata({p : "p"}), {p : "p"});
	});

	//*********************************************************************************************
	QUnit.test("getObject cleans up __metadata", function (assert) {
		var oCleanUpMetadataCall,
			oEntity = {
				__metadata : {
					uri : "uri" // required, as getObject otherwise returns the object directly
				},
				p : "p"
			},
			oModel = {
				_getObject : function () {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				resolve : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("resolve").withExactArgs("path", "context").returns("resolvedPath");
		oModelMock.expects("_getObject").withExactArgs("resolvedPath").returns(oEntity);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("resolvedPath")
			.returns("entityType");
		oCleanUpMetadataCall = this.mock(ODataModel).expects("cleanUpMetadata")
			.withExactArgs({
				__metadata : {
					uri : "uri"
				},
				p : "p"
			})
			.returns("result");

		// code under test
		assert.strictEqual(ODataModel.prototype.getObject.call(oModel, "path", "context"),
			"result");

		assert.notStrictEqual(oCleanUpMetadataCall.firstCall.args[0], oEntity, "called with copy");
	});

	//*********************************************************************************************
	QUnit.test("getObject with $expand, $select cleans up __metadata", function (assert) {
		var oEntity = {
				__metadata : {
					uri : "uri" // required, as getObject otherwise returns the object directly
				},
				p0 : "p0",
				p1 : "p1"
			},
			oEntityType = {
				property : "property"
			},
			oModel = {
				_filterOwnExpand : function () {},
				_filterOwnSelect : function () {},
				_getObject : function () {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				resolve : function () {},
				_splitEntries : function () {}
			},
			oModelMock = this.mock(oModel),
			oResultEntity;

		oModelMock.expects("resolve").withExactArgs("path", "context").returns("resolvedPath");
		oModelMock.expects("_getObject").withExactArgs("resolvedPath").returns(oEntity);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("resolvedPath")
			.returns(oEntityType);
		oModelMock.expects("_splitEntries").withExactArgs("p0").returns("aSelect");
		oModelMock.expects("_filterOwnSelect").withExactArgs("aSelect", "property").returns(["p0"]);
		this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oEntity.__metadata))
			.returns({uri : "uri"});
		this.mock(ODataModel).expects("cleanUpMetadata")
			.withExactArgs({
				__metadata : {
					uri : "uri"
				},
				p0 : "p0"
			});
		oModelMock.expects("_filterOwnExpand").withExactArgs([], "aSelect")
			.returns([]);
		oModelMock.expects("_filterOwnSelect").withExactArgs("aSelect", undefined /*no nav props*/)
			.returns([]);

		// code under test
		oResultEntity = ODataModel.prototype.getObject.call(oModel, "path", "context",
				{select : "p0"});

		assert.deepEqual(oResultEntity, {
				__metadata : {
					uri : "uri"
				},
				p0 : "p0"
			});
		assert.notStrictEqual(oResultEntity.__metadata, oEntity.__metadata);
	});
});