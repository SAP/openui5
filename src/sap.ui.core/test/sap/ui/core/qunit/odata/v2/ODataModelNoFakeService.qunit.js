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
	QUnit.test("read: delegates to _read, no parameters", function (assert) {
		var oModel = {
				_read : function () {}
			},
			sPath = "~path",
			oResult = "{object} oRequestHandle";

		this.mock(oModel).expects("_read")
			.withExactArgs(sPath, {
				batchGroupId : undefined,
				canonicalRequest : undefined,
				context : undefined,
				error : undefined,
				filters : undefined,
				groupId : undefined,
				headers : undefined,
				sorters : undefined,
				success : undefined,
				urlParameters : undefined
			})
			.returns(oResult);

		// code under test
		assert.strictEqual(ODataModel.prototype.read.call(oModel, sPath), oResult);
	});

	//*********************************************************************************************
	QUnit.test("read: delegates to _read, log private parameters", function (assert) {
		var oModel = {
				_read : function () {}
			},
			mParameters = {
				batchGroupId : "batchGroupId",
				canonicalRequest : "canonicalRequest",
				context : "context",
				error : "error",
				filters : "filters",
				groupId : "groupId",
				headers : "headers",
				refresh : "refresh",
				sorters : "sorters",
				success : "success",
				urlParameters : "urlParameters"
			},
			sPath = "~path",
			oResult = "{object} oRequestHandle";

		this.oLogMock.expects("warning")
			.withExactArgs("sap.ui.model.odata.v2.ODataModel#read: Unsupported parameter 'refresh'",
				sinon.match.same(oModel), "sap.ui.model.odata.v2.ODataModel");
		this.mock(oModel).expects("_read")
			.withExactArgs(sPath, {
				batchGroupId : "batchGroupId",
				canonicalRequest : "canonicalRequest",
				context : "context",
				error : "error",
				filters : "filters",
				groupId : "groupId",
				headers : "headers",
				sorters : "sorters",
				success : "success",
				urlParameters : "urlParameters"
			})
			.returns(oResult);

		// code under test
		assert.strictEqual(ODataModel.prototype.read.call(oModel, sPath, mParameters), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_read: refresh passed to _createRequest", function (assert) {
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
				canonicalRequest : bCanonicalRequest,
				context : oContext,
				error : fnError,
				filters : aFilters,
				groupId : sGroupId,
				headers : mHeaders,
				refresh : bRefresh,
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
		ODataModel.prototype._read.call(oModel, sPath, mParameters);
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
});