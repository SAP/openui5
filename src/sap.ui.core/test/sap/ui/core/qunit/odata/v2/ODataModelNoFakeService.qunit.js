/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Messaging",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/message/Message",
	"sap/ui/model/_Helper",
	"sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Model",
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataPropertyBinding",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/_CreatedContextsCache",
	"sap/ui/model/odata/v2/Context",
	"sap/ui/model/odata/v2/ODataAnnotations",
	"sap/ui/model/odata/v2/ODataContextBinding",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v2/ODataTreeBinding"
], function (Log, Localization, SyncPromise, Messaging, UI5Date, Message, _Helper, BaseContext,
		FilterProcessor, Model, _ODataMetaModelUtils, CountMode, MessageScope, ODataMessageParser,
		ODataMetaModel, ODataPropertyBinding, ODataUtils, _CreatedContextsCache, Context,
		ODataAnnotations, ODataContextBinding, ODataListBinding, ODataModel, ODataTreeBinding
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
		}
	});

	//*********************************************************************************************
[{
	sExpectedRequestedWithHeader : "XMLHttpRequest",
	sServiceUrl : "/foo/bar"
}, {
	sServiceUrl : "/foo/bar",
	oHeaderParameter : {
		"X-Requested-With" : "~X-Requested-With"
	}
}, {
	sServiceUrl : "https://example.com/foo/bar"
}, {
	oHeaderParameter : {
		"X-Requested-With" : "~X-Requested-With"
	},
	sServiceUrl : "https://example.com/foo/bar"
}].forEach(function (oFixture, i) {
	var sTitle = "constructor: aSideEffectCleanUpFunctions, oCreatedContextsCache,"
		+ " codeListModelParameters and sMetadataUrl stored #" + i + ", sServiceUrl: "
		+ oFixture.sServiceUrl;
	QUnit.test(sTitle, function (assert) {
		var oDataModelMock = this.mock(ODataModel),
			oExpectedHeaders = {
				"Accept" : "application/json",
				"Accept-Language" : "~languageTag",
				"DataServiceVersion" : "2.0",
				"MaxDataServiceVersion" : "2.0",
				"sap-contextid-accept" : "header"
			},
			oMetadata = {
				oMetadata : {
					isLoaded : function () {},
					loaded : function () {}
				}
			},
			mParameters = {
				annotationURI : "~annotationURI",
				headers : oFixture.oHeaderParameter || {},
				serviceUrl : oFixture.sServiceUrl,
				skipMetadataAnnotationParsing : true,
				tokenHandling : false
			},
			oPromise = {
				then : function () {}
			};

		this.mock(ODataModel.prototype).expects("createCodeListModelParameters")
			.withExactArgs(sinon.match.same(mParameters))
			.returns("~codeListModelParameters");
		this.mock(ODataModel.prototype).expects("setDeferredGroups").withExactArgs(["changes"]);
		this.mock(ODataModel.prototype).expects("setChangeGroups")
			.withExactArgs({"*":{groupId: "changes"}});
		this.mock(ODataModel.prototype).expects("_createMetadataUrl")
			.withExactArgs("/$metadata")
			.returns("~metadataUrl");
		this.mock(ODataModel.prototype).expects("_getServerUrl").withExactArgs()
			.returns("~serverUrl");
		oDataModelMock.expects("_getSharedData").withExactArgs("server", "~serverUrl")
			.returns(undefined);
		oDataModelMock.expects("_getSharedData").withExactArgs("service", oFixture.sServiceUrl)
			.returns(undefined);
		oDataModelMock.expects("_getSharedData").withExactArgs("meta", "~metadataUrl")
			.returns(oMetadata);
		this.mock(ODataModel.prototype).expects("_getAnnotationCacheKey")
			.withExactArgs("~metadataUrl")
			.returns(undefined);
		// called in ODataModel#constructor and ODataAnnotations#constructor
		this.mock(oMetadata.oMetadata).expects("loaded").withExactArgs().twice().returns(oPromise);
		this.mock(oMetadata.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(ODataAnnotations.prototype).expects("addSource")
			.withExactArgs(["~annotationURI"]);
		this.mock(Localization).expects("getLanguageTag").withExactArgs().returns("~languageTag");
		if (oFixture.sExpectedRequestedWithHeader) {
			oExpectedHeaders["X-Requested-With"] = oFixture.sExpectedRequestedWithHeader;
		}

		// code under test
		var oModel = new ODataModel(mParameters);

		assert.strictEqual(oModel.mCodeListModelParams, "~codeListModelParameters");
		assert.strictEqual(oModel.sMetadataUrl, "~metadataUrl");
		assert.deepEqual(oModel.oHeaders, oExpectedHeaders);
		assert.deepEqual(oModel.mCustomHeaders, oFixture.oHeaderParameter || {});
		assert.ok(oModel.oCreatedContextsCache instanceof _CreatedContextsCache);
		assert.deepEqual(oModel.aSideEffectCleanUpFunctions, []);
		assert.ok(oModel.oTransitionMessagesOnlyGroups instanceof Set);
		assert.strictEqual(oModel.oTransitionMessagesOnlyGroups.size, 0);
	});
});

	//*********************************************************************************************
[{
	parameter : undefined, member : false
}, {
	parameter : false, member : false
}, {
	parameter : true, member : true
}, {
	parameter : 42, member : true
}].forEach(function (oFixture, i) {
	QUnit.test("constructor: bIgnoreAnnotationsFromMetadata, " + i, function (assert) {
		var oDataModelMock = this.mock(ODataModel),
			oMetadata = {
				oMetadata : {
					isLoaded : function () {},
					loaded : function () {}
				}
			},
			mParameters = {
				annotationURI : "~annotationURI",
				serviceUrl : "~serviceUrl",
				ignoreAnnotationsFromMetadata : oFixture.parameter,
				tokenHandling : false
			},
			oPromise = Promise.resolve("~metadata");

		this.mock(ODataModel.prototype).expects("createCodeListModelParameters")
			.withExactArgs(sinon.match.same(mParameters))
			.returns("~codeListModelParameters");
		this.mock(ODataModel.prototype).expects("setDeferredGroups").withExactArgs(["changes"]);
		this.mock(ODataModel.prototype).expects("setChangeGroups").withExactArgs({"*":{groupId: "changes"}});
		this.mock(ODataModel.prototype).expects("setHeaders").withExactArgs(undefined)
			.callThrough(/*initializes this.mCustomHeaders*/);
		this.mock(ODataModel.prototype).expects("_getServerUrl").withExactArgs().returns("~serverUrl");
		this.mock(ODataModel.prototype).expects("_createMetadataUrl")
			.withExactArgs("/$metadata")
			.returns("~metadataUrl");
		oDataModelMock.expects("_getSharedData").withExactArgs("server", "~serverUrl").returns({});
		oDataModelMock.expects("_getSharedData").withExactArgs("service", "~serviceUrl").returns({});
		oDataModelMock.expects("_getSharedData").withExactArgs("meta", "~metadataUrl").returns(oMetadata);
		this.mock(ODataModel.prototype).expects("_cacheSupported").withExactArgs("~metadataUrl").returns(false);
		this.mock(ODataModel.prototype).expects("_getAnnotationCacheKey")
			.withExactArgs("~metadataUrl")
			.returns(undefined);
		// called in ODataModel#constructor and ODataAnnotations#constructor
		this.mock(oMetadata.oMetadata).expects("loaded")
			.withExactArgs()
			.exactly(oFixture.parameter ? 2 : 3)
			.returns(oPromise);
		this.mock(oMetadata.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(ODataModel.prototype).expects("_initializeMetadata").withExactArgs();
		this.mock(ODataAnnotations.prototype).expects("addSource")
			.withExactArgs(oFixture.parameter
				? "~annotationURI"
				: [{type : "xml", data : sinon.match.instanceOf(Promise)}, "~annotationURI"]);
		this.mock(Localization).expects("getLanguageTag").withExactArgs().returns("~languageTag");

		// code under test
		var oModel = new ODataModel(mParameters);

		assert.strictEqual(oModel.bIgnoreAnnotationsFromMetadata, oFixture.member);

		return oPromise;
	});
});

	//*********************************************************************************************
[{
	parameter : undefined, // value for tokenHandling c'tor parameter
	member : true, // expected value for bTokenHandling member of model instance
	headerIsSet : true // whether the x-csrf-token request header is expected to be set
}, {
	parameter : false,
	member : false,
	headerIsSet : false
}, {
	parameter : "skipServerCache",
	member : true,
	headerIsSet : false
}].forEach((oFixture) => {
	QUnit.test("constructor: tokenHandling=" + oFixture.parameter, function (assert) {
		const mParameters = {
				serviceUrl : "~serviceUrl",
				tokenHandling : oFixture.parameter
			};
		this.mock(ODataModel.prototype).expects("createCodeListModelParameters")
			.withExactArgs(sinon.match.same(mParameters))
			.returns("~codeListModelParameters");
		this.mock(ODataModel.prototype).expects("setDeferredGroups").withExactArgs(["changes"]);
		this.mock(ODataModel.prototype).expects("setChangeGroups").withExactArgs({"*":{groupId: "changes"}});
		this.mock(ODataModel.prototype).expects("setHeaders").withExactArgs(undefined)
			.callThrough(/*initializes this.mCustomHeaders*/);
		this.mock(ODataModel.prototype).expects("_getServerUrl")
		    .exactly(oFixture.parameter === "skipServerCache" ? 0 : 1)
			.withExactArgs()
			.returns("~serverUrl");
		this.mock(ODataModel.prototype).expects("_createMetadataUrl")
			.withExactArgs("/$metadata")
			.returns("~metadataUrl");
		const oDataModelMock = this.mock(ODataModel);
		const oServerCache = {securityToken : "~token"};
		oDataModelMock.expects("_getSharedData")
			.exactly(oFixture.parameter === "skipServerCache" ? 0 : 1)
			.withExactArgs("server", "~serverUrl")
			.returns(oServerCache);
		oDataModelMock.expects("_getSharedData").withExactArgs("service", "~serviceUrl").returns({});
		const oMetadata = {
			oMetadata : {
				isLoaded : function () {},
				loaded : function () {}
			}
		};
		oDataModelMock.expects("_getSharedData").withExactArgs("meta", "~metadataUrl").returns(oMetadata);
		this.mock(ODataModel.prototype).expects("_cacheSupported").withExactArgs("~metadataUrl").returns(false);
		this.mock(ODataModel.prototype).expects("_getAnnotationCacheKey")
			.withExactArgs("~metadataUrl")
			.returns(undefined);
		// called in ODataModel#constructor and ODataAnnotations#constructor
		const oPromise = Promise.resolve("~metadata");
		this.mock(oMetadata.oMetadata).expects("loaded").withExactArgs().exactly(3).returns(oPromise);
		this.mock(oMetadata.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(ODataModel.prototype).expects("_initializeMetadata").withExactArgs();
		this.mock(ODataAnnotations.prototype).expects("addSource")
			.withExactArgs([{type : "xml", data : sinon.match.instanceOf(Promise)}]);
		this.mock(Localization).expects("getLanguageTag").withExactArgs().returns("~languageTag");

		// code under test
		const oModel = new ODataModel(mParameters);

		assert.strictEqual(oModel.bTokenHandling, oFixture.member);
		assert.deepEqual(oModel.oSharedServerData, oFixture.parameter === "skipServerCache" ? undefined : oServerCache);
		assert.strictEqual(oModel.oHeaders["x-csrf-token"], oFixture.headerIsSet ? "~token" : undefined);

		return oPromise;
	});
});

	//*********************************************************************************************
[{
	sUrl : "$metadata",
	mAllParams : {"f oo" : "qux"}
}, {
	sUrl : "$metadata?a%20b=c%20d&e+f=g+h&i j=k l&m?n=o?p&q/r=s/t&u",
	mAllParams : {"a b" : "c d", "e f" : "g h", "f oo": "qux", "i j" : "k l", "m?n" : "o?p", "q/r" : "s/t", "u" : ""}
}, {
	sUrl : "/$metadata?f%20oo=b+ar#bar=baz",
	mAllParams : {"f oo" : "b ar"}
}, {
	sUrl : "https://xyz.com/ServiceUrl/$metadata?foo=b+ar#bar=baz",
	mAllParams : {"foo" : "b ar", "f oo" : "qux"},
	sTargetUrl : "https://xyz.com/ServiceUrl/$metadata"
}].forEach(({sUrl, mAllParams, sTargetUrl}, i) => {
	QUnit.test("_createMetadataUrl: " + i, function (assert) {
		const oModel = {
			mMetadataUrlParams : {"f oo" : "qux"},
			sServiceUrl : "/ServiceUrl",
			_addUrlParams : function () {}
		};

		this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs(mAllParams).returns("~aMetadataUrlParams");
		this.mock(oModel).expects("_addUrlParams")
			.withExactArgs(sTargetUrl || "/ServiceUrl/$metadata", "~aMetadataUrlParams")
			.returns("~sUrl");

		// code under test
		assert.strictEqual(ODataModel.prototype._createMetadataUrl.call(oModel, sUrl), "~sUrl");

		assert.deepEqual(oModel.mMetadataUrlParams, {"f oo" : "qux"});
	});
});

	//*********************************************************************************************
	QUnit.test("_read: updateAggregatedMessages and bSideEffects are passed to _createRequest",
			function (assert) {
		var bCanonicalRequest = "{boolean} bCanonicalRequest",
			oContext = "{sap.ui.model.odata.v2.Context} oContext",
			sDeepPath = "~deepPath",
			oEntityType = "{object} oEntityType",
			fnError = {/*function*/},
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
				_getResourcePath : function () {},
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
			oODataUtilsMock = this.mock(ODataUtils),
			sResourcePath = "~resourcePath/$count",
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
		oModelMock.expects("_getHeaders").withExactArgs(mHeaders, true)
			.returns(mGetHeaders);
		// inner function createReadRequest
		oModelMock.expects("resolveDeep").withExactArgs(sPath, oContext).returns(sDeepPath);
		oModelMock.expects("_getResourcePath")
			.withExactArgs(bIsCanonicalRequestNeeded, sDeepPath, sPath, oContext)
			.returns(sResourcePath);
		oODataUtilsMock.expects("createSortParams").withExactArgs(aSorters)
			.returns(sSorterParams);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs(sResourcePath)
			.returns(oEntityType);
		this.mock(FilterProcessor).expects("groupFilters").withExactArgs(aFilters)
			.returns(oFilter);
		oODataUtilsMock.expects("createFilterParams")
			.withExactArgs(oFilter, sinon.match.same(oModel.oMetadata), oEntityType)
			.returns(sFilterParams);
		oModelMock.expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs(sResourcePath,
				sinon.match.same(aUrlParams).and(sinon.match([sSorterParams, sFilterParams])),
				/*bUseBatch*/true)
				.returns(sUrl);
		oModelMock.expects("_createRequest")
			.withExactArgs(sUrl, sDeepPath, "GET", mGetHeaders, /*oData*/null, /*sETag*/undefined,
				/*bAsync*/undefined, bUpdateAggregatedMessages, "~bSideEffects")
			.returns(oRequest);
		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs(oModel.mRequests, sGroupId, null, sinon.match.same(oRequest),
				fnSuccess, fnError, sinon.match.object, false)
			.returns(oRequest);

		// code under test
		ODataModel.prototype._read.call(oModel, "~path/$count?foo='bar'", mParameters,
			"~bSideEffects");
	});

	//*********************************************************************************************
	QUnit.test("_getResourcePath: do not shorten", function (assert) {
		var oModel = {
				resolve : function () {}
			};

		this.mock(oModel).expects("resolve")
			.withExactArgs("~sPath", "~oContext")
			.returns("/~resourcePath");

		// code under test
		assert.strictEqual(ODataModel.prototype._getResourcePath.call(oModel, false, "~sDeepPath",
			"~sPath", "~oContext"), "/~resourcePath");
	});

	//*********************************************************************************************
[true, false].forEach(function (bCanBeResolved) {
	QUnit.test("_getResourcePath: no navigation property; resolvable path: " + bCanBeResolved,
			function (assert) {
		var oMetadata = {
				_splitByLastNavigationProperty : function () {}
			},
			oModel = {
				oMetadata : oMetadata,
				resolve : function () {}
			};

		this.mock(oMetadata).expects("_splitByLastNavigationProperty")
			.withExactArgs("~sDeepPath")
			.returns({
				pathBeforeLastNavigationProperty : "/~before",
				lastNavigationProperty : "",
				addressable : true,
				pathAfterLastNavigationProperty : ""
			});
		this.mock(oModel).expects("resolve")
			.withExactArgs("/~before", undefined, true)
			.returns(bCanBeResolved ? "/~resourcePath" : undefined);

		// code under test
		assert.strictEqual(
			ODataModel.prototype._getResourcePath.call(oModel, true, "~sDeepPath", "~sPath",
				"~oContext"),
			bCanBeResolved ? "/~resourcePath" : "/~before");
	});
});

	//*********************************************************************************************
	QUnit.test("_getResourcePath: navigation property with key predicate can be resolved",
			function (assert) {
		var oMetadata = {
				_splitByLastNavigationProperty : function () {}
			},
			oModel = {
				oMetadata : oMetadata,
				resolve : function () {}
			};

		this.mock(oMetadata).expects("_splitByLastNavigationProperty")
			.withExactArgs("~sDeepPath")
			.returns({
				pathBeforeLastNavigationProperty : "/~before",
				lastNavigationProperty : "/~navigationProperty(foo='bar')",
				addressable : true,
				pathAfterLastNavigationProperty : "/~after"
			});
		this.mock(oModel).expects("resolve")
			.withExactArgs("/~before/~navigationProperty(foo='bar')",
				undefined, true)
			.returns("/~resourcePath");

		// code under test
		assert.strictEqual(
			ODataModel.prototype._getResourcePath.call(oModel, true, "~sDeepPath", "~sPath",
				"~oContext"),
			"/~resourcePath/~after");
	});

	//*********************************************************************************************
[{
	addressable : true,
	isResolvingWithNavigationPropertyCalled : true,
	navigationProperty : "/~navigationProperty(foo='bar')",
	resolvedBeforePath : "/~resourcePath",
	result : "/~resourcePath/~navigationProperty(foo='bar')/~after"
}, {
	addressable : true,
	isResolvingWithNavigationPropertyCalled : false,
	navigationProperty : "/~navigationProperty",
	resolvedBeforePath : "/~resourcePath",
	result : "/~resourcePath/~navigationProperty/~after"
}, {
	addressable : false,
	isResolvingWithNavigationPropertyCalled : false,
	navigationProperty : "/~navigationProperty(foo='bar')",
	resolvedBeforePath : "/~resourcePath",
	result : "/~resourcePath/~navigationProperty(foo='bar')/~after"
}, {
	addressable : true,
	isResolvingWithNavigationPropertyCalled : true,
	navigationProperty : "/~navigationProperty(foo='bar')",
	resolvedBeforePath : null,
	result : "/~before/~navigationProperty(foo='bar')/~after"
}, {
	addressable : true,
	isResolvingWithNavigationPropertyCalled : false,
	navigationProperty : "/~navigationProperty",
	resolvedBeforePath : null,
	result : "/~before/~navigationProperty/~after"
}, {
	addressable : false,
	isResolvingWithNavigationPropertyCalled : false,
	navigationProperty : "/~navigationProperty(foo='bar')",
	resolvedBeforePath : null,
	result : "/~before/~navigationProperty(foo='bar')/~after"
}].forEach(function (oFixture, i) {
	QUnit.test("_getResourcePath: with navigation property, path before navigation property"
		+ " is resolvable, #" + i, function (assert) {
		var oMetadata = {
				_splitByLastNavigationProperty : function () {}
			},
			oModel = {
				oMetadata : oMetadata,
				resolve : function () {}
			},
			oModelMock = this.mock(oModel);

		this.mock(oMetadata).expects("_splitByLastNavigationProperty")
			.withExactArgs("~sDeepPath")
			.returns({
				pathBeforeLastNavigationProperty : "/~before",
				lastNavigationProperty : oFixture.navigationProperty,
				addressable : oFixture.addressable,
				pathAfterLastNavigationProperty : "/~after"
			});
		oModelMock.expects("resolve")
			.withExactArgs("/~before/~navigationProperty(foo='bar')",
				undefined, true)
			.exactly(oFixture.isResolvingWithNavigationPropertyCalled ? 1 : 0)
			.returns(null);
		oModelMock.expects("resolve")
			.withExactArgs("/~before", undefined, true)
			.returns(oFixture.resolvedBeforePath);

		// code under test
		assert.strictEqual(
			ODataModel.prototype._getResourcePath.call(oModel, true, "~sDeepPath", "~sPath",
				"~oContext"),
			oFixture.result);
	});
});

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
		mHeaders : {},
		sMethod : "GET",
		bUpdateAggregatedMessages : false,
		bUseOData : true
	}
}, {
	bAsync : undefined,
	mHeaders : {"Content-Type" : "~contenttype"},
	sMessageScope : MessageScope.BusinessObject,
	sMethod : "MERGE",
	sUrl : "~url",
	bUseBatch : true,
	bWithCredentials : "{boolean} bWithCredentials",
	oExpected : {
		bAsync : true,
		mHeaders : {
			"Content-Type" : "~contenttype",
			"sap-message-scope" : MessageScope.BusinessObject
		},
		sMethod : "MERGE",
		bUpdateAggregatedMessages : true,
		bUseCredentials : true,
		bUseGeneratedUID : true
	}
}, {
	bAsync : undefined,
	mHeaders : {"Content-Type" : "~contenttype", "sap-messages" : "transientOnly"},
	sMessageScope : MessageScope.BusinessObject,
	sMethod : "MERGE",
	sUrl : "~url",
	bUseBatch : true,
	bWithCredentials : "{boolean} bWithCredentials",
	oExpected : {
		bAsync : true,
		mHeaders : {
			"Content-Type" : "~contenttype",
			"sap-messages" : "transientOnly"
		},
		sMethod : "MERGE",
		bUpdateAggregatedMessages : true,
		bUseCredentials : true,
		bUseGeneratedUID : true
	}
}, {
	bAsync : undefined,
	mHeaders : {"Foo" : "bar"},
	bJSON : true,
	sMessageScope : MessageScope.BusinessObject,
	sMethod : "MERGE",
	sUrl : "~url",
	bWithCredentials : "{boolean} bWithCredentials",
	oExpected : {
		bAsync : true,
		mHeaders : {
			"Content-Type" : "application/json",
			"Foo" : "bar",
			"sap-message-scope" : MessageScope.BusinessObject,
			"x-http-method" : "MERGE"
		},
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
		bAsync : false,
		mHeaders : {
			"Accept" : "text/plain, */*;q=0.5",
			"Content-Type" : "application/atom+xml",
			"Foo" : "bar",
			"If-Match" : "~etag"
		},
		sMethod : "~method",
		bUpdateAggregatedMessages : false
	}
}, {
	bAsync : false,
	sETag : "~etag",
	mHeaders : {"Foo" : "bar"},
	sMethod : "DELETE",
	sUrl : "~url",
	oExpected : {
		bAsync : false,
		mHeaders : {
			"Foo" : "bar",
			"If-Match" : "~etag"
		},
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
		var mExpectedHeaders = oFixture.oExpected.mHeaders,
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

		if (!oFixture.mHeaders["sap-messages"]
				&& oFixture.sMessageScope === MessageScope.BusinessObject
				&& !bIsMessageScopeSupported) {
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

		if (oFixture.oExpected.bUseGeneratedUID) {
			assert.ok(oRequest.headers["Content-ID"].startsWith("id-"));
			delete oRequest.headers["Content-ID"];
		}

		assert.deepEqual(oRequest, oExpectedResult);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_createRequest: truthy bSideEffects sets sideEffects property at request object",
			function (assert) {
		var oModel = {
				bUseBatch : true,
				_createRequestID : function () {}
			};

		this.mock(oModel).expects("_createRequestID").withExactArgs().returns("~uid");

		assert.deepEqual(
			// code under test
			ODataModel.prototype._createRequest.call(oModel, "~sUrl", "~deepPath", "GET",
				/*mHeaders*/{}, /*oData*/undefined, /*sETag*/undefined, /*bAsync*/false,
				/*bUpdateAggregatedMessages*/false, "~bTruthySideEffects"),
			{
				async : false,
				deepPath : "~deepPath",
				headers : {},
				method : "GET",
				password : undefined,
				requestID : "~uid",
				requestUri : "~sUrl",
				sideEffects : true,
				updateAggregatedMessages : false,
				user : undefined
			});
	});

	//*********************************************************************************************
[{
	headers : {},
	method : "DELETE",
	useGeneratedUID : true
}, {
	headers : {},
	method : "MERGE",
	useGeneratedUID : true
}, {
	headers : {},
	method : "POST",
	useGeneratedUID : true
}, {
	headers : {"Content-ID" : "id-1234-123"},
	method : "MERGE",
	useGeneratedUID : false
}, {
	headers : {"Content-ID" : "foo"},
	method : "POST",
	useGeneratedUID : false
}].forEach(function (oFixture) {
	QUnit.test("_createRequest: using ContentID; " + JSON.stringify(oFixture), function (assert) {
		var oModel = {
				bUseBatch : true,
				_createRequestID : function () {}
			},
			oRequest;

		this.mock(oModel).expects("_createRequestID").withExactArgs().returns("~requestID");

		// code under test
		oRequest = ODataModel.prototype._createRequest.call(oModel, "~sUrl", "~sDeepPath",
			oFixture.method, Object.assign({}, oFixture.headers));

		if (oFixture.useGeneratedUID) {
			assert.ok(oRequest.headers["Content-ID"].startsWith("id-"));
		} else {
			assert.strictEqual(oRequest.headers["Content-ID"], oFixture.headers["Content-ID"]);
		}
	});
});

	//*********************************************************************************************
[
	{method : "GET", useBatch : true},
	{method : "HEAD", useBatch : true},
	{method : "DELETE", useBatch : false},
	{method : "HEAD", useBatch : false},
	{method : "GET", useBatch : false},
	{method : "MERGE", useBatch : false},
	{method : "POST", useBatch : false}
].forEach(function (oFixture) {
	QUnit.test("_createRequest: no ContentID; " + JSON.stringify(oFixture), function (assert) {
		var oModel = {
				bUseBatch : oFixture.useBatch,
				_createRequestID : function () {}
			},
			oRequest;

		this.mock(oModel).expects("_createRequestID").withExactArgs().returns("~requestID");

		// code under test
		oRequest = ODataModel.prototype._createRequest.call(oModel, "~sUrl", "~sDeepPath",
			oFixture.method, {/*mHeaders*/});

		assert.notOk("Content-ID" in oRequest.headers);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bBatch) {
	QUnit.test("_processAborted: calls _createAbortedError, batch = " + bBatch, function (assert) {
		var oEventInfo = {},
			oModel = {
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				decreaseLaundering : function () {},
				fireBatchRequestCompleted : function () {},
				fireRequestCompleted : function () {},
				getKey : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {data : "~data"};

		oModelMock.expects("getKey")
			.withExactArgs("~data")
			.exactly(bBatch ? 0 : 1)
			.returns("~sKey");
		oModelMock.expects("decreaseLaundering")
			.withExactArgs("/~sKey", "~data")
			.exactly(bBatch ? 0 : 1);
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest))
			.exactly(bBatch ? 0 : 1);
		this.mock(ODataModel).expects("_createAbortedError").withExactArgs().returns("~oError");
		oModelMock.expects("_createEventInfo")
			.withExactArgs(sinon.match.same(oRequest), "~oError")
			.returns(oEventInfo);
		oModelMock.expects("fireBatchRequestCompleted")
			.withExactArgs(sinon.match.same(oEventInfo).and(sinon.match.has("success", false)))
			.exactly(bBatch ? 1 : 0);
		oModelMock.expects("fireRequestCompleted")
			.withExactArgs(sinon.match.same(oEventInfo).and(sinon.match.has("success", false)))
			.exactly(bBatch ? 0 : 1);

		// code under test
		ODataModel.prototype._processAborted.call(oModel, oRequest, {}, bBatch);
	});
});

	//*********************************************************************************************
	QUnit.test("_processChange", function (assert) {
		var oContext = {hasSubContexts : function () {}},
			oData = {
				__metadata : {
					deepPath : "~deepPath",
					etag : "~changedETag"
				}
			},
			sETag = "~etag",
			mHeaders = {},
			sKey = "~key",
			oModel = {
				_createRequest : function () {},
				_createRequestUrl : function () {},
				_getEntity : function () {},
				_getHeaders : function () {},
				_getObject : function () {},
				_isTransitionMessagesOnly : function () {},
				_removeReferences : function () {},
				getContext : function () {},
				getETag : function () {},
				mChangedEntities : {
					"~key" : {__metadata : {deepPath : "~deepPath"}}
				},
				sDefaultUpdateMethod : "MERGE",
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {}
				},
				sServiceUrl : "~serviceUrl",
				bUseBatch : "~useBatch"
			},
			oPayload = "~payload",
			oRequest = {requestUri : "~requestUri"},
			oResult,
			sUrl = "~url";

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs(sKey)
			.returns("~oEntityType");
		this.mock(oModel).expects("_getObject").withExactArgs("/~key")
			.returns({/* content not relevant for this test */});
		this.mock(oModel).expects("_getEntity").withExactArgs(sKey)
			.returns({__metadata : {etag : "~internalETag"}});
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs("~oEntityType")
			.returns([/* content not relevant for this test */]);
		// withExactArgs() for _removeReferences is not relevant for this test
		this.mock(oModel).expects("_removeReferences")
			.withExactArgs(sinon.match(function (oPayload0) {
				assert.strictEqual(oPayload0.__metadata.etag, "~internalETag");
				return true;
			}))
			.returns(oPayload);
		this.mock(oModel).expects("_getHeaders").withExactArgs().returns(mHeaders);
		this.mock(oModel).expects("_isTransitionMessagesOnly").withExactArgs("~sGroupId").returns(true);
		this.mock(oModel).expects("getETag").withExactArgs(oPayload).returns(sETag);
		this.mock(oModel).expects("getContext").withExactArgs("/" + sKey).returns(oContext);
		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~key", null, undefined, "~useBatch")
			.returns(sUrl);
		this.mock(oContext).expects("hasSubContexts").withExactArgs().returns("~hasSubContexts");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs(sUrl, "~deepPath", "MERGE",
				sinon.match.same(mHeaders).and(sinon.match.has("sap-messages", "transientOnly")),
				oPayload, sETag, undefined, true, "~hasSubContexts")
			.returns(oRequest);

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, sKey, oData, "~sGroupId", undefined);

		assert.strictEqual(oResult, oRequest);
		assert.deepEqual(oResult, {requestUri : "~requestUri"});
	});

	//*********************************************************************************************
	QUnit.test("_processRequest: calls _createAbortedError on abort", function (assert) {
		var fnError = sinon.stub(),
			oModel = {
				oMetadata : {
					loaded : function () {}
				}
			},
			oRequestHandle;

		this.mock(oModel.oMetadata).expects("loaded")
			.withExactArgs()
			.returns({then : function () {/*not relevant*/}});

		// code under test
		oRequestHandle = ODataModel.prototype._processRequest.call(oModel, "~fnProcessRequest",
			fnError, false);

		assert.strictEqual(fnError.called, false);

		this.mock(ODataModel).expects("_createAbortedError").withExactArgs().returns("~oError");

		// code under test
		oRequestHandle.abort();

		assert.ok(fnError.calledOnceWithExactly("~oError"));
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
				_updateChangedEntity : function () {},
				_writePathCache : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns("entry");
		oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
		oModelMock.expects("_updateChangedEntity").withExactArgs("key", "entry");
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
			/*oResponse*/ undefined, {/*oRequest*/}, "sPath", "sDeepPath", /*sKey*/ undefined,
			"bFunctionImport", sPathFromCanonicalParent);

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
				_importData : function () {}, // used by recursion
				_updateChangedEntity : function () {},
				_writePathCache : function () {},
				hasContext : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns(oEntry);
		// recursive call for importing navigation property data
		oModelMock.expects("_importData")
			.withExactArgs(sinon.match.same(oData.n0), sinon.match.same(mChangedEntities),
				"oResponse", /*oRequest*/undefined, "sPath/n0", "sDeepPath/n0", undefined, false,
				"/key/n0", "bSideEffects")
			.returns("oResult");
		oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
		oModelMock.expects("_updateChangedEntity").withExactArgs("key", sinon.match.same(oEntry));
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("/key");
		// test that bFunctionImport is propagated to _writePathCache
		oModelMock.expects("_writePathCache").withExactArgs("/key", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport",
			/*bUpdateShortenedPaths*/true);

		// code under test
		ODataModel.prototype._importData.call(oModel, oData, mChangedEntities, "oResponse",
			{/*oRequest*/}, "sPath", "sDeepPath", /*sKey*/ undefined, "bFunctionImport", undefined,
			 "bSideEffects");

		assert.strictEqual(oEntry.n0.__ref, "oResult");

		assert.ok(mChangedEntities["key"]);
	});

	//*********************************************************************************************
[true, false].forEach(function (bSideEffects) {
	var sTitle = "_importData: data with 0..n navigation property, bSideEffects=" + bSideEffects;

	QUnit.test(sTitle, function (assert) {
		var mChangedEntities = {},
			oData = {
				toN : {
					results : [/*not relevant*/]
				}
			},
			oEntry = {},
			oModel = {
				aSideEffectCleanUpFunctions : [],
				_getEntity : function () {},
				_getKey : function () {},
				_importData : function () {}, // used by recursion
				_updateChangedEntity : function () {},
				_writePathCache : function () {},
				hasContext : function () {},
				resolveFromCache : function () {}
			},
			aNavigationPropertyData = [],
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns(oEntry);
		// recursive call for importing navigation property data
		oModelMock.expects("_importData")
			.withExactArgs(sinon.match.same(oData.toN), sinon.match.same(mChangedEntities),
				"oResponse", /*oRequest*/undefined, "sPath/toN", "sDeepPath/toN", undefined, false,
				"/key/toN", bSideEffects)
			.returns(aNavigationPropertyData);
		oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
		oModelMock.expects("_updateChangedEntity").withExactArgs("key", sinon.match.same(oEntry));
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("/key");
		oModelMock.expects("_writePathCache").withExactArgs("/key", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", "bFunctionImport");
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", "bFunctionImport",
			/*bUpdateShortenedPaths*/true);

		assert.strictEqual(
			// code under test
			ODataModel.prototype._importData.call(oModel, oData, mChangedEntities, "oResponse",
				{/*oRequest*/}, "sPath", "sDeepPath", /*sKey*/undefined, "bFunctionImport",
				undefined, bSideEffects),
			"key");

		assert.strictEqual(oEntry.toN.__list, aNavigationPropertyData);
		if (bSideEffects) {
			assert.strictEqual(aNavigationPropertyData.sideEffects, true);
			assert.deepEqual(oModel.aSideEffectCleanUpFunctions.length, 1);
			assert.strictEqual(typeof oModel.aSideEffectCleanUpFunctions[0], "function");
			oModel.aSideEffectCleanUpFunctions[0]();
			assert.notOk(oEntry.hasOwnProperty("toN"));
		} else {
			assert.strictEqual(aNavigationPropertyData.hasOwnProperty("sideEffects"), false);
			assert.deepEqual(oModel.aSideEffectCleanUpFunctions, []);
		}
		assert.ok(mChangedEntities["key"]);
	});
});

	//*********************************************************************************************
	QUnit.test("_importData: collection; passes bSideEffects", function (assert) {
		var oEntity0 = {},
			oEntity1 = {},
			oData = {
				results : [oEntity0, oEntity1]
			},
			oModel = {
				_getKey : function () {},
				_importData : function () {} // used by recursion
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oEntity0)).returns("key0");
		oModelMock.expects("_importData")
			.withExactArgs(sinon.match.same(oEntity0), "mChangedEntities", "oResponse",
				/*oRequest*/undefined, "/foo", "sDeepPath", "key0", /*bFunctionImport*/undefined,
				/*sPathFromCanonicalParent*/undefined, "bSideEffects")
			.returns("key0");
		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oEntity1)).returns("key1");
		oModelMock.expects("_importData")
			.withExactArgs(sinon.match.same(oEntity1), "mChangedEntities", "oResponse",
				/*oRequest*/undefined, "/foo", "sDeepPath", "key1", /*bFunctionImport*/undefined,
				/*sPathFromCanonicalParent*/undefined, "bSideEffects")
			.returns("key1");

		// code under test
		assert.deepEqual(
			ODataModel.prototype._importData.call(oModel, oData, "mChangedEntities", "oResponse",
				{/*oRequest*/}, "/foo/ToNNavigationProperty", "sDeepPath", "sKey",
				"bFunctionImport", "sPathFromCanonicalParent", "bSideEffects"),
			["key0", "key1"]);
	});

	//*********************************************************************************************
	QUnit.test("_importData: handling of preliminary contexts", function (assert) {
		var fnCallAfterUpdate,
			mChangedEntities = {},
			oContext = {
				isPreliminary : function () {},
				setPreliminary : function () {},
				setUpdated : function () {}
			},
			oContextMock = this.mock(oContext),
			oData = {},
			oModel = {
				_getEntity : function () {},
				_getKey : function () {},
				_updateChangedEntity : function () {},
				_writePathCache : function () {},
				callAfterUpdate : function () {},
				getContext : function () {},
				hasContext : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns("entry");
		oModelMock.expects("hasContext").withExactArgs("/key").returns(true);
		oModelMock.expects("getContext").withExactArgs("/key").returns(oContext);
		oContextMock.expects("isPreliminary").withExactArgs().returns(true);
		oContextMock.expects("setUpdated").withExactArgs(true);
		oModelMock.expects("callAfterUpdate").callsFake(function (fnCallAfterUpdate0) {
			fnCallAfterUpdate = fnCallAfterUpdate0;
		});
		oContextMock.expects("setPreliminary").withExactArgs(false);
		oModelMock.expects("getContext").withExactArgs("/key").returns(oContext);
		oModelMock.expects("_updateChangedEntity").withExactArgs("key", "entry");
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("canonicalPath");
		oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", undefined);
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", undefined, true);

		// code under test
		ODataModel.prototype._importData.call(oModel, oData, mChangedEntities,
			/*oResponse; not relevant*/ undefined, {/*oRequest*/}, "sPath", "sDeepPath");

		assert.strictEqual(mChangedEntities["key"], true);

		oContextMock.expects("setUpdated").withExactArgs(false);

		// code under test: simulate _processAfterUpdate
		fnCallAfterUpdate();
	});

	//*********************************************************************************************
[
	{cleanupAfterCreateCalled : true, request : {created : true, key : "requestKey"}},
	{cleanupAfterCreateCalled : false, request : {key : "requestKey"}},
	{cleanupAfterCreateCalled : false, request : {created : true}}
].forEach(function (oFixture, i) {
	QUnit.test("_importData: cleanup after create, #" + i, function (assert) {
		var mChangedEntities = {},
			oData = {},
			oModel = {
				_addEntity : function () {},
				_cleanupAfterCreate : function () {},
				_getEntity : function () {},
				_getKey : function () {},
				_updateChangedEntity : function () {},
				_writePathCache : function () {},
				hasContext : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = oFixture.request;

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("_getEntity").withExactArgs("key").returns(undefined);
		oModelMock.expects("_addEntity").withExactArgs(sinon.match.same(oData)).returns("key");
		oModelMock.expects("hasContext").withExactArgs("/key").returns(false);
		oModelMock.expects("_cleanupAfterCreate")
			.withExactArgs(sinon.match.same(oRequest), "key")
			.exactly(oFixture.cleanupAfterCreateCalled ? 1 : 0);
		oModelMock.expects("_updateChangedEntity").withExactArgs("key", sinon.match.same(oData));
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath").returns("canonicalPath");
		oModelMock.expects("_writePathCache").withExactArgs("sPath", "/key", undefined);
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath", "/key", undefined, true);

		// code under test
		ODataModel.prototype._importData.call(oModel, oData, mChangedEntities,
			/*oResponse; not relevant*/ undefined, oRequest, "sPath", "sDeepPath");

		assert.strictEqual(mChangedEntities["key"], true);
	});
});

	//*********************************************************************************************
	QUnit.test("_importData: recursive call", function (assert) {
		var mChangedEntities = {},
			oData = {n0 : {}},
			oEntry = {},
			oModel = {
				_getEntity : function () {},
				_getKey : function () {},
				_updateChangedEntity : function () {},
				_writePathCache : function () {},
				hasContext : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_getKey").withExactArgs(sinon.match.same(oData.n0)).returns("n0key");
		oModelMock.expects("_getEntity").withExactArgs("n0key").returns(oEntry);
		oModelMock.expects("hasContext").withExactArgs("/n0key").returns(false);
		oModelMock.expects("_updateChangedEntity").withExactArgs("n0key", sinon.match.same(oEntry));
		oModelMock.expects("resolveFromCache").withExactArgs("sDeepPath/n0").returns("/n0key");
		oModelMock.expects("_writePathCache").withExactArgs("/n0key", "/n0key", false);
		oModelMock.expects("_writePathCache").withExactArgs("sPath/n0", "/n0key", false);
		oModelMock.expects("_writePathCache").withExactArgs("sDeepPath/n0", "/n0key", false, true);
		oModelMock.expects("_writePathCache").withExactArgs("/key/n0", "/n0key", false);

		// code under test
		ODataModel.prototype._importData.call(oModel, oData.n0, mChangedEntities, "oResponse",
			/*oRequest*/undefined, "sPath/n0", "sDeepPath/n0", /*sKey*/ undefined,
			/*bFunctionImport*/false, "/key/n0", "bSideEffects");

		assert.ok(mChangedEntities["n0key"]);
	});

	//*********************************************************************************************
["requestKey", undefined].forEach(function (sRequestKey) {
	[
		{entityType : "entityType", isFunction : "isFunction"},
		undefined
	].forEach(function (oEntityType) {
		["POST", "GET"].forEach(function (sMethod) {
	var sTitle = "_processSuccess for function import: method=" + sMethod + ", key=" + sRequestKey
			+ ", " + (oEntityType ? "with" : "without") + " entity type";

	QUnit.test(sTitle, function (assert) {
		var mEntityTypes = {},
			aRequests = [],
			oModel = {
				mChangedEntities : {},
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {},
				getDeepPathForCanonicalPath : function () {},
				_getEntity : function () {},
				_importData : function () {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				_normalizePath : function () {},
				_parseResponse : function () {},
				_removeEntity : function () {},
				sServiceUrl : "/service/",
				_updateETag : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {
				data : "requestData",
				deepPath : "deepPath",
				functionTarget : "functionTarget",
				functionMetadata : "functionMetadata",
				key : sRequestKey,
				method : sMethod,
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

		if (sRequestKey) {
			oModel.mChangedEntities[sRequestKey] = "~functionParameterObject";
		}
		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("normalizedPath")
			.returns(oEntityType);
		oModelMock.expects("_normalizePath")
			.withExactArgs("/path", undefined, /*bCanonical*/ !oEntityType)
			.returns("normalizedCannonicalPath");
		oModelMock.expects("decreaseLaundering")
			.withExactArgs("normalizedCannonicalPath","requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		oModelMock.expects("getDeepPathForCanonicalPath")
			.withExactArgs("functionTarget")
			.returns(undefined);
		// test that bFunctionImport is propagated to _importData
		if (sRequestKey) {
			oModelMock.expects("_importData").withExactArgs(oResponse.data,
			/*mLocalGetEntities*/ {}, sinon.match.same(oResponse), sinon.match.same(oRequest),
			/*sPath*/ undefined, /*sDeepPath*/ undefined, /*sKey*/ undefined,
			oEntityType && "isFunction", /*sPathFromCanonicalParent*/undefined,
			/*bSideEffects*/undefined);
		} else {
			oModelMock.expects("_importData").withExactArgs(oResponse.data,
			/*mLocalGetEntities*/ {}, sinon.match.same(oResponse), sinon.match.same(oRequest),
			"normalizedCannonicalPath", /*sDeepPath*/"functionTarget", /*sKey*/ undefined,
			oEntityType && "isFunction", /*sPathFromCanonicalParent*/undefined,
			/*bSideEffects*/undefined);
		}
		oModelMock.expects("_getEntity").withExactArgs(sRequestKey).returns({__metadata : {}});
		oModelMock.expects("_removeEntity").withExactArgs(sRequestKey).never();
		oModelMock.expects("_parseResponse")
			.withExactArgs(sinon.match.same(oResponse), sinon.match.same(oRequest),
			/*mLocalGetEntities*/ {}, /*mLocalChangeEntities*/ {});
		oModelMock.expects("_updateETag")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse));
		oModelMock.expects("_createEventInfo")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse),
				sinon.match.same(aRequests))
			.returns("oEventInfo");
		oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");

		// code under test
		bSuccess = ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse,
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {}, mEntityTypes,
			/*bBatch*/ false, aRequests);

		assert.strictEqual(bSuccess, true);
		assert.deepEqual(mEntityTypes, oEntityType ? {entityType : true} : {});
		assert.strictEqual(oModel.mChangedEntities[sRequestKey], undefined);
		assert.strictEqual(oResponse.$reported, true);
	});
		});
	});
});
	//TODO refactor ODataModel#mPathCache to a simple map path -> canonical path instead of map
	// path -> object with single property 'canonicalPath'

	//*********************************************************************************************
[
	{$reported : undefined, callParseResponse : true},
	{$reported : false, callParseResponse : true},
	{$reported : true, callParseResponse : false}
].forEach(function (oFixture, i) {
	var sTitle = "_processSuccess: don't report messages twice if they are already reported; passes"
			+ " sideEffects to _importData, #" + i;

	QUnit.test(sTitle, function (assert) {
		var oEntityType = {},
			mEntityTypes = {},
			oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				sServiceUrl : "/service/",
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				_getEntity : function () {},
				_importData : function () {},
				_normalizePath : function () {},
				_parseResponse : function () {},
				_updateETag : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {
				data : "requestData",
				requestUri : "/service/path",
				sideEffects : "~sideEffects"
			},
			aRequests = [],
			oResponse = {
				$reported : oFixture.$reported,
				data : {},
				statusCode : 200
			};

		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("normalizedPath")
			.returns(oEntityType);
		oModelMock.expects("_normalizePath")
			.withExactArgs("/path", undefined, true)
			.returns("normalizedCanonicalPath");
		oModelMock.expects("decreaseLaundering")
			.withExactArgs("normalizedCanonicalPath","requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		oModelMock.expects("_importData")
			.withExactArgs(oResponse.data, /*mLocalGetEntities*/ {}, sinon.match.same(oResponse),
				sinon.match.same(oRequest), "normalizedCanonicalPath", /*sDeepPath*/undefined,
				/*sKey*/undefined, /*bFunctionImport*/undefined,
				/*sPathFromCanonicalParent*/undefined, "~sideEffects");
		oModelMock.expects("_getEntity").withExactArgs(undefined).returns(undefined);
		oModelMock.expects("_parseResponse")
			.withExactArgs(sinon.match.same(oResponse), sinon.match.same(oRequest),
				/*mLocalGetEntities*/ {}, /*mLocalChangeEntities*/ {})
			.exactly(oFixture.callParseResponse ? 1 : 0);
		oModelMock.expects("_updateETag")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse));
		oModelMock.expects("_createEventInfo")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse),
				sinon.match.same(aRequests))
			.returns("oEventInfo");
		oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");

		// code under test
		ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse,
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {}, mEntityTypes,
			/*bBatch*/ false, aRequests);
	});
});

	//*********************************************************************************************
[204, "204", 205, "205"].forEach(function (vStatusCode, i){
	QUnit.test("_processSuccess: _updateChangedEntity is called correctly, #" + i, function (assert) {
		var mEntityTypes = {},
			oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				sServiceUrl : "/service/",
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				_getEntity : function () {},
				_normalizePath : function () {},
				_parseResponse : function () {},
				_updateChangedEntity : function () {},
				_updateETag : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {
				data : "requestData",
				key : "key",
				requestUri : "/service/path"
			},
			oResponse = {statusCode : vStatusCode};

		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("normalizedPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("normalizedPath")
			.returns({/*oEntityType*/});
		oModelMock.expects("_normalizePath")
			.withExactArgs("/path", undefined, true)
			.returns("/normalizedCanonicalPath");
		oModelMock.expects("decreaseLaundering")
			.withExactArgs("/normalizedCanonicalPath","requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		oModelMock.expects("_getEntity").withExactArgs("key").returns({__metadata : {}});
		oModelMock.expects("_updateChangedEntity")
			.withExactArgs("normalizedCanonicalPath", "requestData");
		oModelMock.expects("_parseResponse")
			.withExactArgs(sinon.match.same(oResponse), sinon.match.same(oRequest),
				/*mLocalGetEntities*/ {}, {normalizedCanonicalPath : sinon.match.same(oRequest)});
		oModelMock.expects("_updateETag")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse));
		oModelMock.expects("_createEventInfo")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.same(oResponse), "aRequests")
			.returns("oEventInfo");
		oModelMock.expects("fireRequestCompleted").withExactArgs("oEventInfo");

		// code under test
		ODataModel.prototype._processSuccess.call(oModel, oRequest, oResponse,
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {}, mEntityTypes,
			/*bBatch*/ false, "aRequests");
	});
});

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
		// no headers given; no deepPath calculation; deepPath is set to initial functionTarget
		deepPath : "/function/target",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : {},
	result : {
		// no headers given; no deepPath calculation; deepPath is set to initial functionTarget
		deepPath : "/function/target",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : {location : "/service/new/function/target"},
	normalizeKey : {
		input : "/new/function/target",
		output : "/normalized/function/target"
	},
	result : {
		// functionTarget is updated by the new canonical path sliced out of locationHeader;
		// locationHeader and functionTarget do not match -> no deep path calculation; deepPath is
		// set to updated functionTarget
		deepPath : "/normalized/function/target",
		functionTarget : "/normalized/function/target"
	}
}, {
	functionMetadata : true,
	headers : {location : "/http/service/new/function/target"},
	normalizeKey : {
		input : "/new/function/target",
		output : "/normalized/function/target"
	},
	result : {
		// functionTarget is updated by the new canonical path sliced out of locationHeader;
		// oModel.sServiceUrl is not a starting position of the locationHeader;
		// locationHeader and functionTarget do not match -> no deep path calculation; deepPath is
		// set to updated functionTarget
		deepPath : "/normalized/function/target",
		functionTarget : "/normalized/function/target"
	}
}, {
	getDeepPathForCanonicalPath : {
		inputParam : "/function/target",
		result : undefined
	},
	functionMetadata : true,
	headers : {location : "/service/function/target"},
	normalizeKey : {
		input : "/function/target",
		output : "/function/target"
	},
	result : {
		// deepPath cannot be updated until getDeepPathForCanonicalPath returns a value; deepPath is
		// set to functionTarget which is updated by the calculated canonical path
		deepPath : "/function/target",
		functionTarget : "/function/target"
	}
}, {
	getDeepPathForCanonicalPath : {
		inputParam : "/function/target",
		result : "/new/deep/path"
	},
	functionMetadata : true,
	headers : {location : "/service/function/target"},
	normalizeKey : {
		input : "/function/target",
		output : "/function/target"
	},
	result : {
		// deepPath and functionTarget are updated
		deepPath : "/new/deep/path",
		functionTarget : "/function/target"
	}
}, {
	functionMetadata : true,
	headers : {location : "/otherservice/function/target"},
	result : {
		// locationHeader does not contain oModel.sServiceUrl; no canonical path and no deepPath can
		// be calculated; deepPath is set to initial functionTarget
		deepPath : "/function/target",
		functionTarget : "/function/target"
	}
}, {
	adjustDeepPath : {
		inputDeepPath : "/function/target",
		mock : function () {}
	},
	functionMetadata : true,
	headers : undefined,
	result : {
		// deepPath is updated by calling adjustDeepPath; parameter mParameters.deepPath is taken
		// from oRequest.functionTarget; no prior calculation since headers are not given
		deepPath : "/correct/deep/path",
		functionTarget : "/function/target"
	}
}, {
	adjustDeepPath : {
		inputDeepPath : "/different/function/target",
		mock : function () {}
	},
	contentID2KeyAndDeepPath : {},
	functionMetadata : true,
	headers : {location : "/service/different/function/target"},
	normalizeKey : {
		input : "/different/function/target",
		output : "/different/function/target"
	},
	result : {
		// deepPath is updated by calling adjustDeepPath; parameter mParameters.deepPath is taken
		// from sCanonicalPath (oRequest.functionTarget) which is sliced out of the headers location
		deepPath : "/correct/deep/path",
		functionTarget : "/different/function/target"
	}
}, {
	adjustDeepPath : {
		inputDeepPath : "/new/deep/path",
		mock : function () {}
	},
	contentID : "~contentID",
	contentID2KeyAndDeepPath : {
		"~contentID" : {
			deepPath : "~oldDeepPath",
			key : "~key"
		}
	},
	getDeepPathForCanonicalPath : {
		inputParam : "/function/target",
		result : "/new/deep/path"
	},
	functionMetadata : true,
	headers : {location : "/service/function/target"},
	normalizeKey : {
		input : "/function/target",
		output : "/function/target"
	},
	result : {
		// deepPath is updated by calling adjustDeepPath; parameter mParameters.deepPath is taken
		// from sDeepPath which is calculated using getDeepPathForCanonicalPath
		deepPath : "/correct/deep/path",
		functionTarget : "/function/target"
	}
}, {
	getDeepPathForCanonicalPath : {
		inputParam : "/function/target",
		result : "/new/deep/path"
	},
	functionMetadata : true,
	headers : {},
	result : {
		// In case no location header is provided, the deepPath has to be calculated based on the
		// function target
		deepPath : "/new/deep/path",
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
			mParameters,
			oRequest = {
				adjustDeepPath : oFixture.adjustDeepPath && oFixture.adjustDeepPath.mock,
				contentID : oFixture.contentID,
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
		if (oFixture.normalizeKey) {
			this.mock(ODataUtils).expects("_normalizeKey")
				.withExactArgs(oFixture.normalizeKey.input)
				.returns(oFixture.normalizeKey.output);
		} else {
			this.mock(ODataUtils).expects("_normalizeKey").never();
		}
		if (oFixture.getDeepPathForCanonicalPath) {
			oModelMock.expects("getDeepPathForCanonicalPath")
				.withExactArgs(oFixture.getDeepPathForCanonicalPath.inputParam)
				.returns(oFixture.getDeepPathForCanonicalPath.result);
		}
		if (oFixture.adjustDeepPath) {
			this.mock(oRequest).expects("adjustDeepPath")
				.withExactArgs(sinon.match(function (mParameters0) {
					mParameters = mParameters0;
					return true;
				}))
				.returns("/correct/deep/path");
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
			/*mEntityTypes*/ {}, /*bBatch*/ false, "aRequests", oFixture.contentID2KeyAndDeepPath);

		assert.strictEqual(oRequest.deepPath, oFixture.result.deepPath);
		assert.strictEqual(oRequest.functionTarget, oFixture.result.functionTarget);
		assert.strictEqual(oResponse.$reported, true);
		if (oFixture.adjustDeepPath) {
			assert.strictEqual(mParameters.deepPath, oFixture.adjustDeepPath.inputDeepPath);
			// $reported has been added after cloning the response
			assert.strictEqual(mParameters.response.$reported, undefined);
			mParameters.response.$reported = true;
			assert.deepEqual(mParameters.response, oResponse);
			assert.notStrictEqual(mParameters.response, oResponse);
			// mParameters.response is a deep copy
			mParameters.response.data.foo = "bar";
			assert.notDeepEqual(mParameters.response, oResponse);
		}
		if (oFixture.contentID) {
			assert.deepEqual(oFixture.contentID2KeyAndDeepPath, {
				"~contentID" : {
					deepPath : oFixture.result.deepPath,
					key : "~key"
				}
			});
		}
	});
});

	//*********************************************************************************************
	QUnit.test("_processSuccess: for createEntry", function (assert) {
		var mEntityTypes = {},
			oModel = {
				oData : {},
				oMetadata : {
					_getEntityTypeByPath : function () {}
				},
				sServiceUrl : "/service",
				_createEventInfo : function () {},
				_decreaseDeferredRequestCount : function () {},
				_getEntity : function () {},
				_importData : function () {},
				_normalizePath : function () {},
				_parseResponse : function () {},
				_removeEntity : function () {},
				_updateETag : function () {},
				decreaseLaundering : function () {},
				fireRequestCompleted : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {
				created : true,
				data : "requestData",
				deepPath : "/entity(id-0-0)",
				key : "key('id-0-0')",
				method : "POST",
				requestUri : "/service/path",
				sideEffects : "~sideEffects"
			},
			oResponse = {
				data : {},
				statusCode : 201
			};

		oModelMock.expects("_normalizePath").withExactArgs("/path").returns("~sNormalizedPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~sNormalizedPath")
			.returns({entityType : "FOO"});
		oModelMock.expects("_normalizePath").withExactArgs("/path", undefined, true)
			.returns("~sPath");
		oModelMock.expects("decreaseLaundering").withExactArgs("~sPath", "requestData");
		oModelMock.expects("_decreaseDeferredRequestCount")
			.withExactArgs(sinon.match.same(oRequest));
		oModelMock.expects("_importData")
			.withExactArgs({/*copy of oResponse.data*/},  {/*mLocalGetEntities*/},
				sinon.match.same(oResponse), sinon.match.same(oRequest), /*sPath*/undefined,
				/*sDeepPath*/undefined, /*sKey*/undefined, /*bIsFunction*/undefined,
				/*sPathFromCanonicalParent*/undefined, "~sideEffects");
		oModelMock.expects("_getEntity").withExactArgs("key('id-0-0')").returns({__metadata : {}});
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
			/*fnSuccess*/ undefined, /*mGetEntities*/ {}, /*mChangeEntities*/ {}, mEntityTypes,
			/*bBatch*/ false, "~aRequests");

		assert.strictEqual(oRequest.deepPath, "/entity(id-0-0)");
		assert.strictEqual(oResponse._imported, true);
		assert.strictEqual(oResponse.$reported, true);
		assert.strictEqual(mEntityTypes.FOO, true);
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
	QUnit.test("createBindingContext calls #read with updateAggregatedMessages and calls"
			+ " callback with a V2 context", function (assert) {
		var fnCallBack = sinon.stub(),
			oModel = {
				createCustomParams : function () {},
				_getKey : function () {},
				_isCanonicalRequestNeeded : function () {},
				_isReloadNeeded : function () {},
				getContext : function () {},
				read : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			},
			oModelMock = this.mock(oModel),
			oReadExpectation;

		oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined)
			.returns("~bCanonical");
		oModelMock.expects("resolve").withExactArgs("~path/ToZ", "~context", "~bCanonical")
			.returns("~sResolvedPath");
		oModelMock.expects("resolveDeep").withExactArgs("~path/ToZ", "~context")
			.returns("~sDeepPath");
		oModelMock.expects("createCustomParams").withExactArgs(undefined).returns(undefined);
		oReadExpectation = oModelMock.expects("read").withExactArgs("~path/ToZ", {
			canonicalRequest : "~bCanonical",
			context : "~context",
			error : sinon.match.func,
			groupId : undefined,
			success : sinon.match.func,
			updateAggregatedMessages : true,
			urlParameters : []
		});

		// code under test - updateAggregatedMessages set to true
		ODataModel.prototype.createBindingContext.call(oModel, "~path/ToZ", "~context",
			/*mParameters*/undefined, fnCallBack, /*bReload*/true);

		oModelMock.expects("_getKey").withExactArgs("~oData").returns("~sKey");
		oModelMock.expects("getContext").withExactArgs("/~sKey", "~sDeepPath")
			.returns("~v2.Context");

		// code under test - call success handler with key data
		oReadExpectation.args[0][1].success("~oData");

		assert.ok(fnCallBack.calledOnceWithExactly("~v2.Context"));
		fnCallBack.resetHistory();

		oModelMock.expects("_getKey").withExactArgs("~oData").returns(undefined);
		oModelMock.expects("getContext").never();

		// code under test - call success handler without key data
		oReadExpectation.args[0][1].success("~oData");

		assert.ok(fnCallBack.calledOnceWithExactly(null));
		fnCallBack.resetHistory();

		// code under test - call error handler
		oReadExpectation.args[0][1].error({/*oError*/});

		assert.ok(fnCallBack.calledOnceWithExactly(null));
	});

	//*********************************************************************************************
	QUnit.test("createBindingContext: unresolved -> return null", function (assert) {
		var fnCallBack = sinon.stub(),
			oModel = {
				_isCanonicalRequestNeeded: function() {},
				resolve: function() {},
				resolveDeep: function() {}
			};

		this.mock(oModel).expects("_isCanonicalRequestNeeded").withExactArgs(undefined)
			.returns(false);
		this.mock(oModel).expects("resolve").withExactArgs("~sPath", undefined, false)
			.returns(undefined);
		this.mock(oModel).expects("resolveDeep").withExactArgs("~sPath", undefined)
			.returns("~sDeepPath");

		// code under test - path cannot be resolved
		assert.strictEqual(
			ODataModel.prototype.createBindingContext.call(oModel, "~sPath", /*oContext*/undefined,
				/*mParameters*/undefined, fnCallBack, /*bReload*/true),
			null);

		assert.ok(fnCallBack.calledOnceWithExactly(null));
	});

	//*********************************************************************************************
	QUnit.test("createBindingContext: resolved with createPreliminaryContext", function (assert) {
		var oModel = {
				_isCanonicalRequestNeeded: function() {},
				resolve: function() {},
				resolveDeep: function() {},
				getContext: function() {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined)
			.returns(false);
		oModelMock.expects("resolve").exactly(2).withExactArgs("~sPath", undefined, false)
			.returns("/~sResolvedPath");
		oModelMock.expects("resolveDeep").withExactArgs("~sPath", undefined)
			.returns("~sDeepPath");
		oModelMock.expects("getContext").withExactArgs("/~sResolvedPath", "~sDeepPath")
			.returns("~v2.Context");

		// code under test - resolved with createPreliminaryContext set
		assert.strictEqual(
			ODataModel.prototype.createBindingContext.call(oModel, "~sPath", /*oContext*/undefined,
				/*mParameters*/{
					createPreliminaryContext: true
				}, /*fnCallBack*/undefined, /*bReload*/true),
				"~v2.Context");
	});

	//*********************************************************************************************
["/~sCanonicalPath", undefined].forEach(function (sCanonicalPath) {
	var sTitle = "createBindingContext: resolved without reload; returns V2 Context with"
			+ " canonicalPath=" + sCanonicalPath;

	QUnit.test(sTitle, function (assert) {
		var fnCallBack = sinon.stub(),
			oExpectedContext = sCanonicalPath ? "~v2.Context" : null,
			oModel = {
				_isCanonicalRequestNeeded: function() {},
				resolve: function() {},
				resolveDeep: function() {},
				getContext: function() {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined)
			.returns(/*bCanonical*/false);
		oModelMock.expects("resolve").withExactArgs("/~sPath", undefined, false)
			.returns("/~sResolvedPath");
		oModelMock.expects("resolveDeep").withExactArgs("/~sPath", undefined)
			.returns("~sDeepPath");
		oModelMock.expects("resolve").withExactArgs("/~sPath", undefined, true)
			.returns(sCanonicalPath);
		oModelMock.expects("getContext").withExactArgs("/~sCanonicalPath", "~sDeepPath")
			.exactly(sCanonicalPath ? 1 : 0)
			.returns("~v2.Context");

		// code under test - path cannot be resolved
		assert.strictEqual(
			ODataModel.prototype.createBindingContext.call(oModel, "/~sPath", /*oContext*/undefined,
				/*mParameters*/undefined, fnCallBack, /*bReload*/false),
			oExpectedContext);

		assert.ok(fnCallBack.calledOnceWithExactly(oExpectedContext));
	});
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
			mChangedEntities = "changedEntities",
			oModel = {
				checkUpdate : function () {},
				getBindings : function () {},
				_processAfterUpdate : function () {},
				// test data
				sUpdateTimer : "updateTimer",
				bForceUpdate : bForceUpdate,
				mChangedEntities4checkUpdate : "cumulatedChangedEntities"
			};

		this.mock(window).expects("clearTimeout").withExactArgs("updateTimer");
		this.mock(oModel).expects("getBindings").returns([oBinding]);
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
	// BCP: 2180036790
	QUnit.test("checkUpdate: truthy bForceUpdate of async wins over later sync", function (assert) {
		var oBinding = {
				checkUpdate : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oModel = {
				_processAfterUpdate : function () {},
				getBindings : function () {},
				mChangedEntities4checkUpdate : {},
				sUpdateTimer : "updateTimer"
			},
			oModelMock = this.mock(oModel),
			oWindowMock = this.mock(window);

		oWindowMock.expects("clearTimeout").never();
		oModelMock.expects("getBindings").never();
		oBindingMock.expects("checkUpdate").never();
		oModelMock.expects("_processAfterUpdate").never();

		// code under test
		ODataModel.prototype.checkUpdate.call(oModel, true, true);

		oWindowMock.expects("clearTimeout").withExactArgs(oModel.sUpdateTimer).callThrough();
		oModelMock.expects("getBindings").withExactArgs().returns([oBinding]);
		oBindingMock.expects("checkUpdate").withExactArgs(true, undefined);
		oModelMock.expects("_processAfterUpdate").withExactArgs();

		// code under test
		ODataModel.prototype.checkUpdate.call(oModel);

		assert.strictEqual(oModel.bForceUpdate, undefined);
		assert.strictEqual(oModel.sUpdateTimer, null);
	});

	//*********************************************************************************************
["expandAfterCreateFailed", "expandAfterFunctionCallFailed"].forEach(function (sExpandAfter) {
	QUnit.test("_createEventInfo: " + sExpandAfter, function (assert) {
		var oEventInfo,
			oResponseHeaders = {},
			oExpectedEventInfo = {
				ID : "~requestID",
				async : "~async",
				headers : "~requestHeader",
				method : "~method",
				response : {
					headers : oResponseHeaders,
					responseText : "~body",
					statusCode : 201,
					statusText : "~statusText"
				},
				success : true,
				url : "~requestUri"
			},
			oModel = {},
			oRequest = {
				async : "~async",
				headers : "~requestHeader",
				method : "~method",
				requestID : "~requestID",
				requestUri : "~requestUri"
			},
			oResponse = {
				response : {
					body : "~body",
					headers : oResponseHeaders,
					statusCode : 201,
					statusText : "~statusText"
				}
			};

		oResponse.response[sExpandAfter] = true;
		oExpectedEventInfo.response[sExpandAfter] = true;

		// code under test
		oEventInfo = ODataModel.prototype._createEventInfo.call(oModel, oRequest, oResponse);

		assert.deepEqual(oEventInfo, oExpectedEventInfo);
		assert.strictEqual(oEventInfo.response.headers, oResponseHeaders);
	});
});

	//*********************************************************************************************
	QUnit.test("_processChange: restore expandRequest", function (assert) {
		var oContext = {hasSubContexts : function () {}},
			oData = {
				__metadata : {
					created : {
						contentID : "~contentID",
						expandRequest : "~expandRequest",
						key : "~createdKey"
					},
					deepPath : "~deepPath"
				}
			},
			oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {}
				},
				_addSubEntitiesToPayload : function () {},
				_createRequest : function () {},
				_createRequestUrl : function () {},
				_getHeaders : function () {},
				_getObject : function () {},
				_isTransitionMessagesOnly : function () {},
				_removeReferences : function () {},
				getContext : function () {},
				getETag : function () {}
			},
			oRequest = {},
			oResult;

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~sKey")
			.returns("~oEntityType");
		this.mock(oModel).expects("_getObject").withExactArgs("/~sKey").returns({});
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs("~oEntityType")
			.returns([]);
		this.mock(oModel).expects("_removeReferences")
			.withExactArgs({__metadata : {}})
			.returns("~oPayload");
		this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
		this.mock(oModel).expects("_isTransitionMessagesOnly").withExactArgs("~sGroupId").returns(false);
		this.mock(oModel).expects("getETag").withExactArgs("~oPayload").returns("~sETag");
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~createdKey", null, undefined, undefined)
			.returns("~sUrl");
		this.mock(oContext).expects("hasSubContexts").withExactArgs().returns("~hasSubContexts");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~oPayload", "~sETag",
				undefined, true, "~hasSubContexts")
			.returns(oRequest);
		this.mock(oModel).expects("_addSubEntitiesToPayload")
			.withExactArgs(sinon.match.same(oContext), "~oPayload");

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "~sGroupId", "POST");

		assert.deepEqual(oResult, {
			contentID : "~contentID",
			created : true,
			expandRequest : "~expandRequest"
		});
		assert.strictEqual(oResult, oRequest);
	});

	//*********************************************************************************************
	QUnit.test("_processChange: restore functionTarget for function imports", function (assert) {
		var oContext = {hasSubContexts : function () {}},
			oData = {
				__metadata : {
					created : {
						functionImport : true,
						functionMetadata : "~functionMetadata",
						key : "~createdKey"
					},
					deepPath : "~deepPath"
				}
			},
			oModel = {
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
				getContext : function () {},
				getETag : function () {}
			},
			oRequest = {},
			oResult;

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~sKey")
			.returns("~oEntityType");
		this.mock(oModel).expects("_getObject").withExactArgs("/~sKey").returns({});
		this.mock(oModel).expects("_createFunctionImportParameters")
			.withExactArgs("~createdKey", "POST", oData).returns("~urlParameters");
		this.mock(oModel).expects("_removeReferences").withExactArgs(undefined).returns("~payload");
		this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs("~urlParameters")
			.returns("~aUrlParams");
		this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
		this.mock(oModel).expects("getETag").withExactArgs("~payload").returns("~sETag");
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oContext).expects("hasSubContexts").withExactArgs().returns("~hasSubContexts");
		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~createdKey", null, "~aUrlParams", undefined).returns("~sUrl");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~payload", "~sETag",
				undefined, true, "~hasSubContexts")
			.returns(oRequest);
		this.mock(oModel.oMetadata).expects("_getCanonicalPathOfFunctionImport")
			.withExactArgs("~functionMetadata", "~urlParameters")
			.returns("~functionTarget");

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "~sGroupId", "POST");

		assert.deepEqual(oResult, {
				functionMetadata : "~functionMetadata",
				functionTarget : "~functionTarget"
			});
		assert.strictEqual(oResult, oRequest);
	});

	//*********************************************************************************************
	QUnit.test("_processChange: create, enhance payload for deep create", function (assert) {
		var oContext = {hasSubContexts : function () {}},
			oData = {
				__metadata : {
					created : {
						key : "~createdKey"
					},
					deepPath : "~deepPath"
				}
			},
			oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {}
				},
				_addSubEntitiesToPayload : function () {},
				_createRequest : function () {},
				_createRequestUrl : function () {},
				_getHeaders : function () {},
				_getObject : function () {},
				_isTransitionMessagesOnly : function () {},
				_removeReferences : function () {},
				getContext : function () {},
				getETag : function () {}
			},
			oRequest = {},
			oResult;

		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~sKey")
			.returns("~oEntityType");
		this.mock(oModel).expects("_getObject").withExactArgs("/~sKey").returns({foo : 7});
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs("~oEntityType")
			.returns([]);
		this.mock(oModel).expects("_removeReferences")
			.withExactArgs({__metadata : {}, foo : 7})
			.returns("~payload");
		this.mock(oModel).expects("_getHeaders").withExactArgs(undefined).returns("~mHeaders");
		this.mock(oModel).expects("_isTransitionMessagesOnly").withExactArgs("~sGroupId").returns(false);
		this.mock(oModel).expects("getETag").withExactArgs("~payload").returns("~sETag");
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oModel).expects("_createRequestUrl")
			.withExactArgs("/~createdKey", null, undefined, undefined).returns("~sUrl");
		this.mock(oContext).expects("hasSubContexts").withExactArgs().returns("~hasSubContexts");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~deepPath", "POST", "~mHeaders", "~payload", "~sETag",
				undefined, true, "~hasSubContexts")
			.returns(oRequest);
		this.mock(oModel).expects("_addSubEntitiesToPayload")
			.withExactArgs(sinon.match.same(oContext), "~payload");

		// code under test
		oResult = ODataModel.prototype._processChange.call(oModel, "~sKey", oData, "~sGroupId", "POST");

		assert.deepEqual(oRequest, {created : true});
		assert.strictEqual(oResult, oRequest);
	});

	//*********************************************************************************************
[false, true].forEach(function (bExpandRequest, i) {
	var sTitle = "_processRequestQueue: push expandRequest to queue, " + i + ", consider change headers";

	QUnit.test(sTitle, function (assert) {
		var oRequest = {
				data : "~data",
				expandRequest : bExpandRequest ? "~expandRequest" : undefined,
				headers : "~headers"
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
		this.mock(_Helper).expects("extend").withExactArgs("~headers", "~changeHeaders");
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
			"~fnError", "~changeHeaders");
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
	QUnit.test("createEntry: no created callback, before metadata is available", function (assert) {
		var oModel = {
				oMetadata : {
					isLoaded : function () {}
				}
			};

		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(false);
		this.oLogMock.expects("error")
			.withExactArgs("Tried to use createEntry without created-callback, before metadata is"
				+ " available!");

		// code under test
		assert.strictEqual(
			ODataModel.prototype.createEntry.call(oModel, "/~path"),
			undefined);
	});

	//*********************************************************************************************
[undefined, "~expand"].forEach(function (sExpand) {
	[true, false].forEach(function (bWithCallbackHandlers) {
		(!sExpand
		? [ // successful creation without expand
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
				assert.ok(pCreate.isPending());

				fnExpectResetCreatePromise();
				oEventHandlersMock.expects("fnSuccess")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs("~oData", "~oCreateResponse");

				// code under test
				fnSuccess("~oData", "~oCreateResponse");

				assert.ok(pCreate.isFulfilled());

				return pCreate.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
				});
			},
			// aborted creation without expand
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
				assert.ok(pCreate.isPending());

				// resetting the create promise is done only in success cases; do not call
				// fnExpectResetCreatePromise

				// code under test
				fnAbort("~oError");

				assert.ok(pCreate.isRejected());
				assert.strictEqual(pCreate.getResult(), "~oError");
				// don't catch to test avoiding "Uncaught (in promise)"
			}
		]
		: [
			// POST and GET succeed
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
				var oDataGET = {GET : true},
					oDataPOST = {POST : true},
					oResponseGET = "~oResponseGET",
					oResponsePOST = "~oResponsePOST";

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				assert.ok(pCreate.isPending());

				fnExpectResetCreatePromise();
				oEventHandlersMock.expects("fnSuccess")
					.exactly(bWithCallbackHandlers ? 1 : 0)
					.withExactArgs({GET : true, POST : true}, oResponsePOST);

				// code under test - GET request succeeds
				fnSuccess(oDataGET, oResponseGET);

				assert.ok(pCreate.isFulfilled());

				return pCreate.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
				});
			},
			// POST and GET fail; after retrying the creation both requests succeed
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
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

				assert.ok(pCreate.isPending());

				fnExpectResetCreatePromise();

				// code under test - GET request succeeds
				fnSuccess(oDataGET, oResponseGET);

				assert.ok(pCreate.isFulfilled());

				return pCreate.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
				});
			},
			// POST succeeds and GET fails
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
				var oDataPOST = "~oDataPOST",
					oErrorGET = {},
					oResponsePOST = {};

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				assert.ok(pCreate.isPending());

				fnExpectResetCreatePromise();
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
				assert.ok(pCreate.isFulfilled());

				return pCreate.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
				});
			},
			// POST and GET fail; after retrying the creation both requests fail again
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
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

				// resetting the create promise is done only in success cases; do not call
				// fnExpectResetCreatePromise

				// code under test - POST request fails again
				fnError(oErrorPOST1);

				assert.strictEqual(oErrorPOST1.expandAfterCreateFailed, undefined);

				// code under test - GET request succeeds
				fnError(oErrorGET1);

				assert.strictEqual(oErrorGET1.expandAfterCreateFailed, true);
				assert.ok(pCreate.isPending());
			},
			// POST and GET fail; after retrying the creation POST succeeds and GET fails
			function (assert, oEventHandlersMock, fnAbort, fnError, fnSuccess, pCreate,
					fnExpectResetCreatePromise) {
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
				assert.ok(pCreate.isPending());

				// retry after failed POST

				// code under test - POST request succeeds
				fnSuccess(oDataPOST, oResponsePOST);

				fnExpectResetCreatePromise();
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
				assert.ok(pCreate.isFulfilled());

				return pCreate.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
				});
			}
		]).forEach(function (fnTestEventHandlers, i) {
			[true, false].forEach(function (bFromODLBcreate) {
				[undefined, "~bInactive"].forEach(function (bInactive) {
		var sTitle = "createEntry: called with initial properties and considering referential constraints "
			+ (bFromODLBcreate ? "from ODataListBinding#create" : "directly")
			+ "; expand = " + sExpand + ", "
			+ (bWithCallbackHandlers ? "with" : "without") + " callback handlers, inactive = "
			+ bInactive + ", i = " + i;

	QUnit.test(sTitle, function (assert) {
		var fnAbort, fnAfterContextActivated, pCreate, oEntity, fnError, mHeaders, fnMetadataLoaded,
			oRequestHandle, oResult, fnSuccess, sUid,
			oCreatedContext = {
				fetchActivated : function () {},
				hasSubContexts : function () {},
				resetCreatedPromise : function () {}
			},
			oCreatedContextCache = {getCacheInfo : function () {}},
			oCreatedContextCacheMock = this.mock(oCreatedContextCache),
			oEntityMetadata = {entityType : "~entityType"},
			oEventHandlers = {
				fnError : function () {},
				fnSuccess : function () {}
			},
			oEventHandlersMock = this.mock(oEventHandlers),
			oExpandRequest = {},
			mHeadersInput = {input : true},
			oModel = {
				mChangedEntities : {},
				oCreatedContextsCache : oCreatedContextCache,
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
				_isTransitionMessagesOnly : function () {},
				_normalizePath : function () {},
				_processRequestQueueAsync : function () {},
				_pushToRequestQueue : function () {},
				_resolveGroup : function () {},
				getContext : function () {},
				getForeignKeysFromReferentialConstraints() {},
				resolveDeep : function () {}
			},
			oMetadataMock = this.mock(oModel.oMetadata),
			oModelMock = this.mock(oModel),
			oRequest = {},
			that = this;

		oEventHandlersMock.expects("fnError").never();
		oEventHandlersMock.expects("fnSuccess").never();
		oCreatedContextCacheMock.expects("getCacheInfo").never();
		oModelMock.expects("_isCanonicalRequestNeeded")
			.withExactArgs("~canonicalRequest")
			.returns("~bCanonical");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs("~urlParameters")
			.returns("~aUrlParams");
		oModelMock.expects("_normalizePath")
			.withExactArgs("~path", "~context", "~bCanonical")
			.returns("/~sNormalizedPath");
		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("~sDeepPath");
		oMetadataMock.expects("_isCollection").withExactArgs("~sDeepPath").returns(true);
		oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
		// function create()
		oModelMock.expects("_resolveGroup")
			.withExactArgs("/~sNormalizedPath")
			.returns({/*unused*/});
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs("~refreshAfterChange", "~groupId")
			.returns("~bRefreshAfterChange");
		oModelMock.expects("_isTransitionMessagesOnly").withExactArgs("~groupId").returns(false);
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/~sNormalizedPath")
			.returns(oEntityMetadata);
		oModelMock.expects("getForeignKeysFromReferentialConstraints")
			.withExactArgs("/~sNormalizedPath")
			.returns({Foo : "Baz", Qux: 42});
		oMetadataMock.expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oEntityMetadata))
			.returns({name : "~entitySetName"});
		oModelMock.expects("_addEntity")
			.withExactArgs(sinon.match(function (oEntity0) {
				sUid = rTemporaryKey.exec(oEntity0.__metadata.deepPath)[1];
				fnAbort = oEntity0.__metadata.created.abort;
				fnError = oEntity0.__metadata.created.error;
				mHeaders = oEntity0.__metadata.created.headers;
				fnSuccess = oEntity0.__metadata.created.success;
				oEntity = {
					__metadata : {
						created : {
							abort : fnAbort,
							changeSetId : "~changeSetId",
							error : fnError,
							groupId : "~groupId",
							headers : mHeaders,
							key : "~sNormalizedPath",
							refreshAfterChange : "~bRefreshAfterChange",
							success : fnSuccess,
							urlParameters : "~urlParameters"
						},
						deepPath : "~sDeepPath('" + sUid + "')",
						type : "~entityType",
						uri : "~sServiceUrl/~entitySetName('" + sUid + "')"
					},
					Foo : "Bar",
					Qux : 42
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
				assert.ok(fnAbort instanceof Function);
				assert.ok(fnSuccess instanceof Function);

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
				}))
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
			.withExactArgs("/~sKey",
				sinon.match(function (sDeepPath0) {
					return sDeepPath0 === "~sDeepPath('" + sUid + "')";
				}),
				sinon.match(function (pCreateParameter) {
					pCreate = pCreateParameter;
					assert.ok(pCreate instanceof SyncPromise);

					return true;
				}), bInactive, undefined)
			.returns(oCreatedContext);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs()
			.returns({then : function (fnFunc) {
				fnMetadataLoaded = fnFunc;
			}});

		// code under test
		oResult = ODataModel.prototype.createEntry.call(oModel, "~path", {
			canonicalRequest : "~canonicalRequest",
			changeSetId : "~changeSetId",
			context : "~context",
			error : bWithCallbackHandlers ? oEventHandlers.fnError : undefined,
			expand : sExpand,
			groupId : "~groupId",
			headers : mHeadersInput,
			inactive : bInactive,
			properties : {Foo : "Bar"},
			refreshAfterChange : "~refreshAfterChange",
			success : bWithCallbackHandlers ? oEventHandlers.fnSuccess : undefined,
			urlParameters : "~urlParameters"
		});

		if (sExpand) {
			oEntity.__metadata.created.expandRequest = oExpandRequest;
			oEntity.__metadata.created.contentID = sUid;
			assert.deepEqual(oExpandRequest, {contentID : sUid});
		}
		assert.deepEqual(oModel.mChangedEntities["~sKey"], bInactive ? undefined : oEntity);
		assert.strictEqual(oResult, oCreatedContext);
		assert.deepEqual(oRequest, sExpand
			? {
				contentID : sUid,
				created : true,
				expandRequest : oExpandRequest,
				key : "~sKey"
			}
			: {created : true, key : "~sKey"});

		// async functionality

		this.mock(oCreatedContext).expects("fetchActivated").withExactArgs()
			.returns({then : function (fnFunc) {
				fnAfterContextActivated = fnFunc;
			}});

		// code under test
		fnMetadataLoaded();

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
		fnAfterContextActivated();

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

		function fnExpectResetCreatePromise() {
			oCreatedContextCacheMock.expects("getCacheInfo")
				.withExactArgs(oCreatedContext)
				.returns(bFromODLBcreate ? {/*cache info*/} : undefined);
			that.mock(oCreatedContext).expects("resetCreatedPromise")
				.withExactArgs()
				.exactly(bFromODLBcreate ? 0 : 1);
			that.mock(oCreatedContext).expects("hasSubContexts").withExactArgs().returns(false);
		}
		return fnTestEventHandlers.call(this, assert, oEventHandlersMock, fnAbort, fnError,
			fnSuccess, pCreate, fnExpectResetCreatePromise);
	});
				});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("createEntry: fallback to default groupId and changeSetId", function (assert) {
		var fnAfterContextActivated,
			oCreatedContext = {fetchActivated : function () {}},
			oEntityMetadata = {entityType : "~entityType"},
			fnMetadataLoaded,
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
				mRequests : "~mRequests",
				_addEntity : function () {},
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getRefreshAfterChange : function () {},
				_isCanonicalRequestNeeded : function () {},
				_isTransitionMessagesOnly : function () {},
				_normalizePath : function () {},
				_processRequestQueueAsync : function () {},
				_pushToRequestQueue : function () {},
				_resolveGroup : function () {},
				getContext : function () {},
				getForeignKeysFromReferentialConstraints() {},
				resolveDeep : function () {}
			},
			oRequest = {};

		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs(undefined)
			.returns("~bCanonical");
		this.mock(oModel).expects("_normalizePath")
			.withExactArgs("/~path", undefined, "~bCanonical")
			.returns("/~sNormalizedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("/~path", undefined)
			.returns("~sDeepPath");
		this.mock(oModel.oMetadata).expects("_isCollection")
			.withExactArgs("~sDeepPath")
			.returns(false);
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs(undefined)
			.returns("~aUrlParams");
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		// function create()
		this.mock(oModel).expects("_resolveGroup")
			.withExactArgs("/~sNormalizedPath")
			.returns({changeSetId : "~defaultChangeSetId", groupId : "~defaultGroupId"});
		this.mock(oModel).expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~defaultGroupId")
			.returns("~bRefreshAfterChange");
		this.mock(oModel).expects("_isTransitionMessagesOnly").withExactArgs("~defaultGroupId").returns(false);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~sNormalizedPath")
			.returns(oEntityMetadata);
		this.mock(oModel).expects("getForeignKeysFromReferentialConstraints")
			.withExactArgs("/~sNormalizedPath")
			.returns({});
		this.mock(oModel.oMetadata).expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oEntityMetadata))
			.returns({name : "~entitySetName"});
		this.mock(oModel).expects("_addEntity").callsFake(function (oEntity0) {
				assert.strictEqual(oEntity0.__metadata.created.changeSetId, "~defaultChangeSetId");
				assert.strictEqual(oEntity0.__metadata.created.groupId, "~defaultGroupId");

				return "~sKey";
			});
		this.mock(oModel).expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("/~sNormalizedPath", "~aUrlParams", undefined)
			.returns("~sUrl");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~sDeepPath", "POST", {}, sinon.match(function (oEntity0) {
				assert.strictEqual(oEntity0.__metadata.created.changeSetId, "~defaultChangeSetId");
				assert.strictEqual(oEntity0.__metadata.created.groupId, "~defaultGroupId");

				return true;
			}))
			.returns(oRequest);
		this.mock(oModel).expects("getContext")
			.withExactArgs("/~sKey", "~sDeepPath", sinon.match.object, undefined, undefined)
			.returns(oCreatedContext);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs()
			.returns({then : function (fnFunc) {
				fnMetadataLoaded = fnFunc;
			}});

		// code under test
		ODataModel.prototype.createEntry.call(oModel, "/~path", {properties : {}});

		this.mock(oCreatedContext).expects("fetchActivated").withExactArgs()
			.returns({then : function (fnFunc) {
				fnAfterContextActivated = fnFunc;
			}});

		// code under test
		fnMetadataLoaded();

		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~defaultGroupId", "~defaultChangeSetId",
				sinon.match.same(oRequest), sinon.match.func, undefined, sinon.match.object,
				"~bRefreshAfterChange");
		this.mock(oModel).expects("_processRequestQueueAsync").withExactArgs("~mRequests");

		// code under test
		fnAfterContextActivated();
	});

	//*********************************************************************************************
[undefined, "~expand"].forEach(function (sExpand) {
	var sTitle = "createEntry: transientOnly header required for group" + (sExpand ? "; with expand" : "");

	QUnit.test(sTitle, function (assert) {
		var oCreatedContext = {fetchActivated: function () {}},
			oEntityMetadata = {entityType: "~entityType"},
			oModel = {
				mChangedEntities: {},
				mDeferredGroups: {},
				oMetadata: {
					_getEntitySetByType: function () {},
					_getEntityTypeByPath: function () {},
					_isCollection: function () {},
					isLoaded: function () {},
					loaded: function () {}
				},
				mRequests: "~mRequests",
				bUseBatch: "~bUseBatch",
				_addEntity: function () {},
				_createRequest: function () {},
				_createRequestUrlWithNormalizedPath: function () {},
				_getHeaders: function () {},
				_getRefreshAfterChange: function () {},
				_isCanonicalRequestNeeded: function () {},
				_isTransitionMessagesOnly: function () {},
				_normalizePath: function () {},
				_processRequestQueueAsync: function () {},
				_pushToRequestQueue: function () {},
				_resolveGroup: function () {},
				getContext: function () {},
				getForeignKeysFromReferentialConstraints() {},
				resolveDeep: function () {}
			},
			oModelMock = this.mock(oModel),
			mOriginalHeaders = {},
			oRequest = {},
			sUID;

		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		// function create()
		oModelMock.expects("_isCanonicalRequestNeeded").withExactArgs(undefined).returns("~bCanonical");
		this.mock(ODataUtils).expects("_createUrlParamsArray").withExactArgs(undefined).returns("~aUrlParams");
		oModelMock.expects("_normalizePath")
			.withExactArgs("/~path", undefined, "~bCanonical")
			.returns("/~sNormalizedPath");
		oModelMock.expects("resolveDeep").withExactArgs("/~path", undefined).returns("~sDeepPath");
		this.mock(oModel.oMetadata).expects("_isCollection").withExactArgs("~sDeepPath").returns(false);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~sNormalizedPath")
			.returns(oEntityMetadata);
		oModelMock.expects("getForeignKeysFromReferentialConstraints").withExactArgs("/~sNormalizedPath").returns({});
		this.mock(oModel.oMetadata).expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oEntityMetadata))
			.returns({name: "~entitySetName"});
		oModelMock.expects("_resolveGroup")
			.withExactArgs("/~sNormalizedPath")
			.returns({changeSetId: "~defaultChangeSetId", groupId: "~defaultGroupId"});
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~defaultGroupId")
			.returns("~bRefreshAfterChange");
		oModelMock.expects("_isTransitionMessagesOnly").withExactArgs("~defaultGroupId").returns(true);
		oModelMock.expects("_addEntity").callsFake(function (oEntity0) {
				assert.strictEqual(oEntity0.__metadata.created.headers["sap-messages"], "transientOnly");

				return "~sKey";
			});
		oModelMock.expects("getContext")
			.withExactArgs("/~sKey", "~sDeepPath", sinon.match.object, undefined, undefined)
			.returns(oCreatedContext);
		oModelMock.expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("/~sNormalizedPath", "~aUrlParams", "~bUseBatch")
			.returns("~sUrl");
		oModelMock.expects("_createRequest")
			.callsFake(function (sUrl, sDeepPath, sMethod, mHeaders, oData, sETag) {
				sUID = mHeaders["Content-ID"];

				assert.strictEqual(sUrl, "~sUrl");
				assert.strictEqual(sDeepPath, "~sDeepPath");
				assert.strictEqual(sMethod, "POST");
				assert.strictEqual(mHeaders["sap-messages"], "transientOnly");
				assert.strictEqual(oData.__metadata.created.headers["sap-messages"], "transientOnly");
				assert.strictEqual(sETag, undefined);

				return oRequest;
			});
		if (sExpand) {
			oModelMock.expects("_getHeaders").withExactArgs(undefined, true).returns({});
			this.mock(ODataUtils).expects("_encodeURLParameters")
				.withExactArgs({$expand: "~expand", $select: "~expand"})
				.returns("~encodedUrlParams");
			oModelMock.expects("_createRequest")
				.callsFake(function (sUrl, sDeepPath, sMethod, mHeaders, oData, sETag, bAsync,
						bUpdateAggregatedMessages) {
					assert.strictEqual(sUrl, "$" + sUID + "?~encodedUrlParams");
					assert.strictEqual(sDeepPath, "/$" + sUID);
					assert.strictEqual(sMethod, "GET");
					assert.strictEqual(mHeaders["sap-messages"], "transientOnly");
					assert.strictEqual(oData, null);
					assert.strictEqual(sETag, undefined);
					assert.strictEqual(bAsync, undefined);
					assert.strictEqual(bUpdateAggregatedMessages, true);

					return {};
				});
		}
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns({then: function () {}});
		// handling of oMetadata.loaded() promise not relevant

		// code under test
		ODataModel.prototype.createEntry.call(oModel, "/~path", {
			expand: sExpand,
			headers: mOriginalHeaders,
			properties: {}
		});

		assert.deepEqual(mOriginalHeaders, {});
	});
});

	//*********************************************************************************************
	QUnit.test("createEntry: deep create", function (assert) {
		var oChangedEntity,
			oContext = {
				addSubContext : function () {},
				getPath : function () {},
				isInactive : function () {},
				isTransient : function () {}
			},
			oContextMock = this.mock(oContext),
			oCreatedContext = {},
			oEntityMetadata = {entityType : "~entityType"},
			oModel = {
				mChangedEntities : {},
				oMetadata : {
					_getEntitySetByType : function () {},
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {},
					_isCollection : function () {},
					isLoaded : function () {}
				},
				sServiceUrl : "~sServiceUrl",
				_addEntity : function () {},
				_getObject : function () {},
				_isCanonicalRequestNeeded : function () {},
				_normalizePath : function () {},
				getContext : function () {},
				// getForeignKeysFromReferentialConstraints() {}, // never called in deep create scenarios
				resolveDeep : function () {}
			},
			oMetadataMock = this.mock(oModel.oMetadata);

		oContextMock.expects("isTransient").returns(true);
		oContextMock.expects("isInactive").returns(false);
		oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
		// function create()
		oContextMock.expects("getPath").withExactArgs().returns("/~sContextPath");
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/~sContextPath")
			.returns("~oSourceEntityMetadata");
		oMetadataMock.expects("_getNavigationPropertyNames")
			.withExactArgs("~oSourceEntityMetadata")
			.returns(["~path"]);
		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs(undefined)
			.returns("~bCanonical");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs(undefined)
			.returns("~aUrlParams");
		this.mock(oModel).expects("_normalizePath")
			.withExactArgs("~path", sinon.match.same(oContext), "~bCanonical")
			.returns("/~sNormalizedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~path", sinon.match.same(oContext))
			.returns("~sDeepPath");
		oMetadataMock.expects("_isCollection")
			.withExactArgs("~sDeepPath")
			.returns("~bIsCollection");
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/~sNormalizedPath")
			.returns(oEntityMetadata);
		oMetadataMock.expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oEntityMetadata))
			.returns({name : "~entitySetName"});
		oContextMock.expects("getPath").withExactArgs().returns("/~sContextPath");
		this.mock(oModel).expects("_getObject").withExactArgs("/~sContextPath").returns({
				__metadata : {
					created : {
						changeSetId : "~changeSetIdFromRoot",
						groupId : "~groupIdFromRoot"
					}
				}
			});
		this.mock(oModel).expects("_addEntity").callsFake(function (oEntity0) {
				assert.strictEqual(oEntity0.__metadata.created.changeSetId, "~changeSetIdFromRoot");
				assert.strictEqual(oEntity0.__metadata.created.groupId, "~groupIdFromRoot");

				return "~sKey";
			});
		this.mock(oModel).expects("getContext")
			.withExactArgs("/~sKey", sinon.match.string /*deep path not relevant for deep create*/,
				undefined, undefined, sinon.match.same(oContext))
			.returns(oCreatedContext);
		this.mock(oContext).expects("addSubContext")
			.withExactArgs("~path", oCreatedContext, "~bIsCollection");

		// code under test
		assert.strictEqual(ODataModel.prototype.createEntry.call(oModel, "~path",
			{context : oContext, properties : {foo : "bar"}}), oCreatedContext);

		assert.strictEqual(Object.keys(oModel.mChangedEntities).length, 1);
		oChangedEntity = oModel.mChangedEntities[Object.keys(oModel.mChangedEntities)[0]];
		assert.strictEqual(oChangedEntity.foo, "bar");
		assert.strictEqual(oChangedEntity.__metadata.type, "~entityType");
		assert.ok(oChangedEntity.__metadata.uri.startsWith("~sServiceUrl/~entitySetName('"));
		assert.strictEqual(oChangedEntity.__metadata.created.changeSetId, "~changeSetIdFromRoot");
		assert.strictEqual(oChangedEntity.__metadata.created.groupId, "~groupIdFromRoot");
		assert.strictEqual(oChangedEntity.__metadata.created.error, undefined);
		assert.strictEqual(oChangedEntity.__metadata.created.headers, undefined);
		assert.strictEqual(oChangedEntity.__metadata.created.key, undefined);
		assert.strictEqual(oChangedEntity.__metadata.created.refreshAfterChange, undefined);
		assert.strictEqual(oChangedEntity.__metadata.created.success, undefined);
		assert.strictEqual(oChangedEntity.__metadata.created.urlParameters, undefined);
	});

	//*********************************************************************************************
	QUnit.test("createEntry: reset changes on sub contexts after deep create", function (assert) {
		var fnAfterContextActivated,
			oCreatedContext = {
				fetchActivated : function () {},
				getSubContextsAsPath : function () {},
				hasSubContexts : function () {}
			},
			oEntityMetadata = {entityType : "~entityType"},
			oModel = {
				mChangedEntities : {},
				oCreatedContextsCache : {
					getCacheInfo : function () {}
				},
				mDeferredGroups : {},
				oMetadata : {
					_getEntitySetByType : function () {},
					_getEntityTypeByPath : function () {},
					_isCollection : function () {},
					isLoaded : function () {},
					loaded : function () {}
				},
				mRequests : "~mRequests",
				sServiceUrl : "~sServiceUrl",
				_addEntity : function () {},
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getRefreshAfterChange : function () {},
				_isCanonicalRequestNeeded : function () {},
				_isTransitionMessagesOnly : function () {},
				_normalizePath : function () {},
				_pushToRequestQueue : function () {},
				_processRequestQueueAsync : function () {},
				_resolveGroup : function () {},
				getContext : function () {},
				getForeignKeysFromReferentialConstraints() {},
				resetChanges : function () {},
				resolveDeep : function () {}
			},
			fnMetadataLoaded,
			oMetadataMock = this.mock(oModel.oMetadata),
			oRequest = {},
			fnSuccess;

		oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
		// function create()
		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs(undefined)
			.returns("~bCanonical");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs(undefined)
			.returns("~aUrlParams");
		this.mock(oModel).expects("_normalizePath")
			.withExactArgs("/~path", undefined, "~bCanonical")
			.returns("/~sNormalizedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("/~path", undefined)
			.returns("~sDeepPath");
		oMetadataMock.expects("_isCollection").withExactArgs("~sDeepPath").returns(false);
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/~sNormalizedPath")
			.returns(oEntityMetadata);
		this.mock(oModel).expects("getForeignKeysFromReferentialConstraints")
			.withExactArgs("/~sNormalizedPath")
			.returns({});
		oMetadataMock.expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oEntityMetadata))
			.returns({name : "~entitySetName"});
		this.mock(oModel).expects("_resolveGroup")
			.withExactArgs("/~sNormalizedPath")
			.returns({groupId : "~groupId", changeSetId : "~changeSetId"});
		this.mock(oModel).expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~groupId")
			.returns("~bRefreshAfterChange");
		this.mock(oModel).expects("_isTransitionMessagesOnly").withExactArgs("~groupId").returns(false);
		this.mock(oModel).expects("_addEntity")
			.withExactArgs(sinon.match.object/*aspect already tested*/)
			.returns("~sKey");
		this.mock(oModel).expects("getContext")
			.withExactArgs("/~sKey", sinon.match.string /*deep path not relevant for deep create*/,
				sinon.match.object/*aspect already tested*/, undefined, undefined)
			.returns(oCreatedContext);
		this.mock(oModel).expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("/~sNormalizedPath", "~aUrlParams", undefined)
			.returns("~sUrl");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "~sDeepPath", "POST", {}, sinon.match.object/*aspect already tested*/)
			.returns(oRequest);
		oMetadataMock.expects("loaded").withExactArgs()
			.returns({then : function (fnFunc) {
				fnMetadataLoaded = fnFunc;
			}});

		// code under test
		assert.strictEqual(ODataModel.prototype.createEntry.call(oModel, "/~path",
			{properties : {foo : "bar"}}), oCreatedContext);

		this.mock(oCreatedContext).expects("fetchActivated").withExactArgs()
			.returns({then : function (fnFunc) {
				fnAfterContextActivated = fnFunc;
			}});

		// code under test
		fnMetadataLoaded();

		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~groupId", "~changeSetId", sinon.match.same(oRequest),
				sinon.match(function (fnSuccess0) {
					fnSuccess = fnSuccess0;

					return true;
				}), undefined, sinon.match.object, "~bRefreshAfterChange");
		this.mock(oModel).expects("_processRequestQueueAsync").withExactArgs("~mRequests");

		// code under test
		fnAfterContextActivated();

		this.mock(oModel.oCreatedContextsCache).expects("getCacheInfo")
			.withExactArgs(sinon.match.same(oCreatedContext))
			.returns(true);
		this.mock(oCreatedContext).expects("hasSubContexts").withExactArgs().returns(true);
		this.mock(oCreatedContext).expects("getSubContextsAsPath")
			.withExactArgs()
			.returns("~subContextPaths");
		this.mock(oModel).expects("resetChanges")
			.withExactArgs("~subContextPaths", undefined, true);

		// code under test
		fnSuccess();
	});

	//*********************************************************************************************
	QUnit.test("createEntry: deep create, :1 nav property is not supported", function (assert) {
		var oContext = {
				getPath : function () {},
				isInactive : function () {},
				isTransient : function () {}
			},
			oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {},
					_isCollection : function () {},
					isLoaded : function () {}
				},
				_isCanonicalRequestNeeded : function () {},
				_normalizePath : function () {},
				resolveDeep : function () {}
			};

		this.mock(oContext).expects("isTransient").returns(true);
		this.mock(oContext).expects("isInactive").returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		// create()
		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs(undefined)
			.returns("~bCanonical");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs(undefined)
			.returns("~aUrlParams");
		this.mock(oModel).expects("_normalizePath")
			.withExactArgs("~path", sinon.match.same(oContext), "~bCanonical")
			.returns("~sNormalizedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~path", sinon.match.same(oContext))
			.returns("~sDeepPath");
		this.mock(oModel.oMetadata).expects("_isCollection")
			.withExactArgs("~sDeepPath")
			.returns(false);
		// checkDeepCreatePreconditions()
		this.mock(oContext).expects("getPath").withExactArgs().returns("/~sContextPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~sContextPath")
			.returns("~oSourceEntityMetadata");
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs(sinon.match.same("~oSourceEntityMetadata"))
			.returns(["~path"]);

		// code under test
		assert.throws(function () {
			ODataModel.prototype.createEntry.call(oModel, "~path", {context : oContext});
		}, new Error("Cannot create entity; deep create on navigation property '~path' with "
			+ "single cardinality is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("createEntry: deep create, path is not a navigation property", function (assert) {
		var oContext = {
				getPath : function () {},
				isInactive : function () {},
				isTransient : function () {}
			},
			oModel = {
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {},
					_isCollection : function () {},
					isLoaded : function () {}
				},
				_isCanonicalRequestNeeded : function () {},
				_normalizePath : function () {},
				resolveDeep : function () {}
			},
			oSourceEntityMetadata = {name : "~sourceTypeName"};

		this.mock(oContext).expects("isTransient").returns(true);
		this.mock(oContext).expects("isInactive").returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		// create()
		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs(undefined)
			.returns("~bCanonical");
		this.mock(ODataUtils).expects("_createUrlParamsArray")
			.withExactArgs(undefined)
			.returns("~aUrlParams");
		this.mock(oModel).expects("_normalizePath")
			.withExactArgs("~invalid", sinon.match.same(oContext), "~bCanonical")
			.returns("~sNormalizedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~invalid", sinon.match.same(oContext))
			.returns("~sDeepPath");
		this.mock(oModel.oMetadata).expects("_isCollection")
			.withExactArgs("~sDeepPath")
			.returns("~bIsCollection");
		// checkDeepCreatePreconditions()
		this.mock(oContext).expects("getPath").withExactArgs().returns("/~sContextPath");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~sContextPath")
			.returns(oSourceEntityMetadata);
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs(sinon.match.same(oSourceEntityMetadata))
			.returns(["~path"]);

		// code under test
		assert.throws(function () {
			ODataModel.prototype.createEntry.call(oModel, "~invalid", {context : oContext});
		}, new Error("Cannot create entity; path '~invalid' is not a navigation property of "
			+ "'~sourceTypeName'"));
	});

	//*********************************************************************************************
["batchGroupId", "changeSetId", "created", "error", "expand", "groupId", "headers", "inactive",
 "refreshAfterChange", "success", "urlParameters", "invalid"].forEach(function (sParameter) {
	QUnit.test("createEntry: deep create, unsupported parameter " + sParameter, function (assert) {
		var oContext = {isTransient : function () {}},
			oModel = {bUseBatch : true},
			mParameters = {context : oContext};

		this.mock(oContext).expects("isTransient").returns(true);

		mParameters[sParameter] = "foo";

		// code under test
		assert.throws(function () {
			ODataModel.prototype.createEntry.call(oModel, "~path", mParameters);
		}, new Error("deep create, unsupported parameter: " + sParameter));
	});
});

	//*********************************************************************************************
	QUnit.test("createEntry: deep create, error on inactive context", function (assert) {
		var oContext = {
				isInactive : function () {},
				isTransient : function () {}
			},
			oModel = {bUseBatch : true},
			mParameters = {context : oContext};

		this.mock(oContext).expects("isTransient").returns(true);
		this.mock(oContext).expects("isInactive").returns(true);

		// code under test
		assert.throws(function () {
			ODataModel.prototype.createEntry.call(oModel, "~path", mParameters);
		}, new Error("deep create, context must not be inactive"));
	});

	//*********************************************************************************************
[{
	contentID2KeyAndDeepPath : {
		"~contentID" : {
			deepPath : "~deepPath('~key')",
			functionImport : false,
			key : "Foo('~key')"
		}
	},
	request0Info : {
		contentID : "~contentID",
		created : true,
		deepPath : "~deepPath('~contentID')",
		requestUri : "~serviceUri/Foo?bar"
	},
	resultingDeepPath : "~deepPath('~key')",
	resultingUri : "~serviceUri/Foo('~key')?bar"
}, {
	contentID2KeyAndDeepPath : {
		"~contentID" : {
			deepPath : "~/FunctionName",
			functionImport : true,
			key : "Foo('~key')"
		}
	},
	request0Info : {
		contentID : "~contentID",
		deepPath : "~/FunctionName",
		functionMetadata : "~functionMetadata",
		requestUri : "~FunctionName?bar"
	},
	resultingDeepPath : "/$~contentID",
	resultingUri : "~serviceUri/$~contentID?bar"
}].forEach(function (oFixture, i) {
	QUnit.test("_submitBatchRequest: with content-IDs, #" + i, function (assert) {
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
				request : oFixture.request0Info
			},
			oRequestGET = {},
			oRequest1 = {
				parts : [{
					request : oRequestGET,
					fnSuccess : "~fnSuccess1"
				}],
				request : {
					contentID : "~contentID",
					deepPath : "/$~contentID",
					requestUri : "~serviceUri/$~contentID?bar"
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
				"~fnSuccess0", sinon.match.object, sinon.match.object, sinon.match.object,
				false, undefined, oFixture.contentID2KeyAndDeepPath);
		oModelMock.expects("_processSuccess")
			.withExactArgs(sinon.match.same(oRequestGET), sinon.match.same(oResponseGET),
				"~fnSuccess1", sinon.match.object, sinon.match.object, sinon.match.object,
				false, undefined, oFixture.contentID2KeyAndDeepPath);
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

		assert.strictEqual(oRequest1.request.requestUri, oFixture.resultingUri);
		assert.strictEqual(oRequest1.request.deepPath, oFixture.resultingDeepPath);
	});
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
[false, true].forEach(function (bSuppressErrorHandlerCall) {
	var sTitle = "_submitBatchRequest: calls _createAbortedError on abort;"
			+ " bSuppressErrorHandlerCall=" + bSuppressErrorHandlerCall;

	QUnit.test(sTitle, function (assert) {
		var oBatchRequest = {},
			oBatchRequestHandle = {
				abort : function () {}
			},
			fnError = sinon.stub(),
			i = -1,
			oPart0_AlreadyAborted = {request : {_aborted : true}},
			oPart0_NoErrorHandler = {request : {}},
			oPart0_WithErrorHandler = {
				fnError : function () {},
				request : {}
			},
			oPart1_NoErrorHandler = {request : {}},
			oPart1_WithErrorHandler = {
				fnError : function () {},
				request : {}
			},
			oPart2_AlreadyAborted = {request : {_aborted : true}},
			oPart2_WithErrorHandler = {
				fnError : function () {},
				request : {}
			},
			oRequest0 = {
				parts : [oPart0_NoErrorHandler, oPart0_AlreadyAborted, oPart0_WithErrorHandler]
			},
			oRequest1 = {parts : [oPart1_NoErrorHandler, oPart1_WithErrorHandler]},
			oRequest2 = {parts : [oPart2_WithErrorHandler, oPart2_AlreadyAborted]},
			aRequests = [
				// changeset
				[oRequest1, oRequest2],
				// single request
				oRequest0
			],
			oEventInfo = {
				batch : true,
				requests : aRequests
			},
			oModel = {
				_submitRequest : function () {}
			},
			oRequestHandle;

		this.mock(oModel).expects("_submitRequest")
			.withExactArgs(
				sinon.match.same(oBatchRequest).and(sinon.match.has("eventInfo", oEventInfo)),
				sinon.match.func, sinon.match.func)
			.returns(oBatchRequestHandle);

		// code under test
		oRequestHandle = ODataModel.prototype._submitBatchRequest.call(oModel, oBatchRequest,
			aRequests, "~fnSuccess", fnError);

		assert.strictEqual(fnError.called, false);

		this.mock(ODataModel).expects("_createAbortedError")
			.withExactArgs()
			.exactly(bSuppressErrorHandlerCall ? 3 : 4)
			.callsFake(function () {
				i += 1;
				return "~oError" + i;
			});
		this.mock(oPart0_WithErrorHandler).expects("fnError").withExactArgs("~oError2");
		this.mock(oPart1_WithErrorHandler).expects("fnError").withExactArgs("~oError0");
		this.mock(oPart2_WithErrorHandler).expects("fnError").withExactArgs("~oError1");
		this.mock(oBatchRequestHandle).expects("abort").withExactArgs();

		// code under test
		oRequestHandle.abort(bSuppressErrorHandlerCall);

		if (bSuppressErrorHandlerCall) {
			assert.strictEqual(fnError.called, false);
		} else {
			assert.ok(fnError.calledOnceWithExactly("~oError3"));
		}
	});
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
			oRequest = {method : "~method", requestUri : "~uri"},
			oResult;

		this.mock(oModel).expects("_parseResponse")
			.withExactArgs(sinon.match.same(oError.response), sinon.match.same(oRequest))
			.exactly(bReported ? 0 : 1);

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
	reportingClassName : undefined,
	expectedClassName : sClassName
}, {
	reportingClassName : "foo.bar.Baz",
	expectedClassName : "foo.bar.Baz"
}].forEach(function (oFixture) {
	QUnit.test("_handleError: sReportingClassName = " + oFixture.reportingClassName, function (assert) {
		var oError = {
				$reported : false,
				message : "~message",
				stack : "~stack"
			},
			oModel = {
				_parseResponse : function () {}
			};

		this.mock(oModel).expects("_parseResponse").never();
		this.oLogMock.expects("error")
			.withExactArgs("The following problem occurred: ~message", "~stack", oFixture.expectedClassName);

		// code under test
		ODataModel.prototype._handleError.call(oModel, oError, undefined /*oRequest*/, oFixture.reportingClassName);
	});
});

	//*********************************************************************************************
	QUnit.test("_updateChangedEntity: skip __metadata", function (assert) {
		var mChangedEntities = {
				"~key" : {
					__metadata : {
						etag : "~etag_old",
						uri : "~uri"
					},
					foo : "bar"
				}
			},
			oChangedEntry = Object.assign({}, mChangedEntities["~key"]),
			oModel = {
				mChangedEntities : mChangedEntities,
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
			.returns({
				__metadata : {etag : "~etag_old", uri : "~uri"},
				foo : "original value"
			});
		oModelMock.expects("_getObject").withExactArgs("/~key").returns(oChangedEntry);
		oModelMock.expects("removeInternalMetadata")
			.withExactArgs(sinon.match.same(oChangedEntry))
			.returns({deepPath : "~deepPath"});
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
		ODataModel.prototype._updateChangedEntity.call(oModel, "~key", {
			__metadata : {etag : "~etag_new", uri : "~uri"},
			foo : "bar"
		});

		assert.deepEqual(oModel.mChangedEntities, {});
	});

	//*********************************************************************************************
[
	null,
	{isTransient : function () { return true; }},
	{isTransient : function () { return false; }}
].forEach(function (oContext, i) {
	["/path/~entityKey?query&string", "/path/~entityKey"].forEach(function (sUrl) {
	var sTitle = "remove: create request with bUpdateAggregatedMessages=true;"
			+ (oContext ? " context created=" + oContext.isTransient() : " no context")
			+ "; sUrl=" + sUrl;

	QUnit.test(sTitle, function (assert) {
		var fnHandleSuccess, fnProcessRequest,
			oModel = {
				mContexts : oContext ? {"/~entityKey" : oContext} : {},
				oCreatedContextsCache : {findAndRemoveContext : function () {}},
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
				_removeEntity : function () {},
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
			.callsFake(function (fnProcessRequest0) {
				fnProcessRequest = fnProcessRequest0;
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
			.returns(sUrl);
		this.mock(oModel).expects("_createRequest")
			.withExactArgs(sUrl, "~sDeepPath", "DELETE", "~mHeaders1", undefined, "~sETag",
				undefined, true)
			.returns("~oRequest");
		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~sGroupId", "~sChangeSetId", "~oRequest",
				sinon.match.func, "~fnError", "~requestHandle", "~bRefreshAfterChange1")
			.callsFake(function () {
				fnHandleSuccess = arguments[4];
			});

		// code under test
		fnProcessRequest("~requestHandle");

		this.mock(oModel).expects("_removeEntity").withExactArgs("~entityKey");
		this.mock(oModel.oCreatedContextsCache).expects("findAndRemoveContext")
			.withExactArgs(sinon.match.same(oContext))
			.exactly(i === 2 ? 1 : 0);

		// code under test
		fnHandleSuccess();
	});
	});
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
						deepPath: "/~sFunctionName",
						uri : sinon.match(function (sUri) {
							return sUri.startsWith("/service/url/~sFunctionName")
								&& sUri.match(rTemporaryKey);
						})
					}
				},
				bFunctionHasParameter
					? {"~name0" : undefined, "~name1" : "foo"}
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
			adjustDeepPath : "~adjustDeepPath",
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
			this.oLogMock.expects("warning")
				.withExactArgs("No value given for parameter '~name0' of function import"
					+ " '/~sFunctionName'", sinon.match.same(oModel), sClassName);
			this.mock(ODataUtils).expects("formatValue")
				.withExactArgs("foo", "~type1")
				.returns("~value1");
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
			adjustDeepPath : "~adjustDeepPath",
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
	QUnit.test("callFunction: with expand; not a POST", function (assert) {
		var oModel = {
				bUseBatch : true
			};

		assert.throws(function () {
			// code under test
			ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
				expand : "ToFoo"
			});
		}, new Error("Use 'expand' parameter only with HTTP method 'POST'"));
	});

	//*********************************************************************************************
	QUnit.test("callFunction: with expand; not in batch mode", function (assert) {
		var oModel = {
				bUseBatch : false
			};

		assert.throws(function () {
			// code under test
			ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
				expand : "ToFoo"
			});
		}, new Error("Use 'expand' parameter only with 'useBatch' set to 'true'"));
	});

	//*********************************************************************************************
[
	{},
	{entitySet : "~FooSet"},
	{entitySetPath : "~FooSetPath"},
	{entitySet : "~FooSet", returnType : "Collection(~FooType)"},
	{entitySetPath : "~FooSetPath", returnType : "Collection(~FooType)"}
].forEach(function (oFunctionMetadata, i) {
	QUnit.test("callFunction: with expand; returns a collection, #" + i, function (assert) {
		var callFunctionResult,
			oMetadata = {
				_getFunctionImportMetadata : function () {}
			},
			oModel = {
				bUseBatch : true,
				oMetadata : oMetadata,
				_processRequest : function () {},
				_getRefreshAfterChange : function () {}
			};

		this.mock(oModel).expects("_getRefreshAfterChange") // don't care about parameters
			.returns(false);
		this.mock(oModel).expects("_processRequest") // don't care about parameters
			.callsFake(function (fnProcessRequest, fnError, bDeferred) {
				fnProcessRequest();

				return {};
			});
		this.mock(oMetadata).expects("_getFunctionImportMetadata")
			.withExactArgs("/~sFunctionName", "POST")
			.returns(oFunctionMetadata);

		// code under test
		callFunctionResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
			expand : "ToBar",
			method : "POST"
		});

		return callFunctionResult.contextCreated().then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message,
				"Use 'expand' parameter only for functions returning a single entity");
		});
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bWithCallbacks) {
	[
		// successful POST and successful GET
		function (assert, fnSuccess, fnError, oCallbacksMock) {
			var oObjectMock = this.mock(Object);
			// code under test
			fnSuccess("~oDataPOST", "~oResponsePOST");

			oObjectMock.expects("assign")
				.withExactArgs({}, "~oDataPOST", "~oDataGET")
				.exactly(bWithCallbacks ? 1 : 0)
				.returns("~mergedData");
			oCallbacksMock.expects("success")
				.withExactArgs("~mergedData", "~oResponsePOST")
				.exactly(bWithCallbacks ? 1 : 0);

			// code under test
			fnSuccess("~oDataGET", "~oResponseGET");

			oObjectMock.restore();
		},
		// successful POST and failed GET
		function (assert, fnSuccess, fnError, oCallbacksMock) {
			var oErrorGET = {},
				oResponsePOST = {};

			// code under test
			fnSuccess("~oDataPOST", oResponsePOST);

			this.oLogMock.expects("error")
				.withExactArgs("Function '/~sFunctionName' was called successfully, but expansion"
					+ " of navigation properties (~expand) failed",
					sinon.match.same(oErrorGET), sClassName);
			oCallbacksMock.expects("success")
				.withExactArgs("~oDataPOST", sinon.match.same(oResponsePOST)
					.and(sinon.match.hasOwn("expandAfterFunctionCallFailed", true)))
				.exactly(bWithCallbacks ? 1 : 0);

			// code under test
			fnError(oErrorGET);

			assert.strictEqual(oErrorGET.expandAfterFunctionCallFailed, true);
		},
		// failed POST and failed GET
		function (assert, fnSuccess, fnError, oCallbacksMock) {
			var oErrorGET = {};

			oCallbacksMock.expects("error")
				.withExactArgs("~oErrorPOST")
				.exactly(bWithCallbacks ? 1 : 0);

			// code under test
			fnError("~oErrorPOST");

			// code under test
			fnError(oErrorGET);

			assert.strictEqual(oErrorGET.expandAfterFunctionCallFailed, true);
		}
	].forEach(function (fnCallbackHandling, i) {
	var sTitle = "callFunction: with expand; with callback handlers: " + bWithCallbacks + ", #" + i;

	QUnit.test(sTitle, function (assert) {
		var fnError, fnProcessRequest, oResult, oResultingRequest, fnSuccess, sUid, oCachedData,
			oCallbacks = {
				error : function () {},
				success : function () {}
			},
			oCallbacksMock = this.mock(oCallbacks),
			oExpandRequest = {},
			oFunctionCallRequest = {},
			oFunctionMetadata = {
				entitySet : "~entitySet",
				parameter : null, // parameters are not relevant for this test
				returnType : "~returnType"
			},
			mInputHeaders = {foo : "bar"},
			oMetadata = {
				_getCanonicalPathOfFunctionImport : function () {},
				_getFunctionImportMetadata : function () {}
			},
			oModel = {
				mDeferredGroups : {},
				oMetadata : oMetadata,
				mRequests : "~mRequests",
				bUseBatch : true,
				sServiceUrl : "/service/url",
				_addEntity : function () {},
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getHeaders : function () {},
				_getRefreshAfterChange : function () {},
				_processRequest : function () {},
				_pushToRequestQueue : function () {},
				_writePathCache : function () {},
				getContext : function () {}
			},
			oModelMock = this.mock(oModel);

		oCallbacksMock.expects("error").never();
		oCallbacksMock.expects("success").never();
		oModelMock.expects("_getRefreshAfterChange") // don't care about parameters
			.returns("~bRefreshAfterChange");
		oModelMock.expects("_processRequest")
			.withExactArgs(sinon.match.func,
				bWithCallbacks ? sinon.match.same(oCallbacks.error) : undefined)
			.callsFake(function (fnProcessRequest0) {
				fnProcessRequest = fnProcessRequest0;
				return /*oRequestHandle*/ {};
			});

		// code under test
		oResult = ODataModel.prototype.callFunction.call(oModel, "/~sFunctionName", {
			error : bWithCallbacks ? oCallbacks.error : undefined,
			eTag : "~eTag",
			expand : "~expand",
			headers : mInputHeaders,
			method : "POST",
			success : bWithCallbacks ? oCallbacks.success : undefined
		});

		this.mock(oMetadata).expects("_getFunctionImportMetadata")
			.withExactArgs("/~sFunctionName", "POST")
			.returns(oFunctionMetadata);
		oModelMock.expects("_addEntity") // don't care about parameters
			.callsFake(function (oData) {
				oCachedData = oData;
				sUid = rTemporaryKey.exec(oData.__metadata.uri)[1];
				fnError = oData.__metadata.created.error;
				fnSuccess = oData.__metadata.created.success;

				assert.ok(typeof fnError === "function");
				assert.notStrictEqual(fnError, oCallbacks.error, "wrapped error handler");
				assert.ok(typeof fnSuccess === "function");
				assert.notStrictEqual(fnSuccess, oCallbacks.success, "wrapped success handler");
				assert.notStrictEqual(oData.__metadata.created.headers, mInputHeaders);
				assert.deepEqual(oData.__metadata.created.headers, {
					"Content-ID" : sUid,
					foo : "bar",
					"sap-messages" : "transientOnly"
				});

				return "~sKey";
			});
		oModelMock.expects("getContext").withExactArgs("/~sKey").returns("~oContext");
		oModelMock.expects("_writePathCache").withExactArgs("/~sKey", "/~sKey");
		this.mock(ODataUtils).expects("_createUrlParamsArray") // don't care about parameters
			.returns("~aUrlParams");
		oModelMock.expects("_createRequestUrlWithNormalizedPath") // don't care about parameters
			.returns("~sUrl");
		oModelMock.expects("_getHeaders")
			.withExactArgs(sinon.match(function (mHeaders0) {
				assert.notStrictEqual(mHeaders0, mInputHeaders);
				assert.deepEqual(mHeaders0, {
					"Content-ID" : sUid,
					foo : "bar",
					"sap-messages" : "transientOnly"
				});

				return true;
			}))
			.returns("~mHeadersPOST");
		oModelMock.expects("_createRequest")
			.withExactArgs("~sUrl", "/~sFunctionName", "POST", "~mHeadersPOST", undefined, "~eTag",
				undefined, true)
			.returns(oFunctionCallRequest);
		this.mock(oMetadata).expects("_getCanonicalPathOfFunctionImport")
			// don't care about parameters
			.returns("~functionTarget");
		this.mock(ODataUtils).expects("_encodeURLParameters")
			.withExactArgs({$expand : "~expand", $select : "~expand"})
			.returns("~expandselect");
		oModelMock.expects("_getHeaders").withExactArgs(undefined, true).returns("~mHeadersGET");
		oModelMock.expects("_createRequest")
			.withExactArgs(sinon.match.string, sinon.match.string, "GET", "~mHeadersGET", undefined,
				undefined, undefined, true)
			.callsFake(function (sUrl, sDeepPath) {
				assert.strictEqual(sUrl, "$" + sUid + "?~expandselect");
				assert.strictEqual(sDeepPath, "/$" + sUid);

				return oExpandRequest;
			});
		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", /*sGroupId*/ undefined, /*sChangeSetId*/ undefined,
				sinon.match.same(oFunctionCallRequest),
				sinon.match(function (fnSuccess0) { return fnSuccess0 === fnSuccess; }),
				sinon.match(function (fnError0) { return fnError0 === fnError; }),
				"~requestHandle", "~bRefreshAfterChange");

		// code under test
		oResultingRequest = fnProcessRequest("~requestHandle");

		assert.strictEqual(oResultingRequest, oFunctionCallRequest);
		assert.strictEqual(oResultingRequest.contentID, sUid);
		assert.strictEqual(oResultingRequest.expandRequest, oExpandRequest);
		assert.strictEqual(oResultingRequest.expandRequest.contentID, sUid);
		assert.strictEqual(oCachedData.__metadata.created.expandRequest, oExpandRequest);
		assert.strictEqual(oCachedData.__metadata.created.contentID, sUid);

		// code under test
		fnCallbackHandling.call(this, assert, fnSuccess, fnError, oCallbacksMock);
		// repeat it again to simulate a function call retrigger through a parameter value change
		fnCallbackHandling.call(this, assert, fnSuccess, fnError, oCallbacksMock);

		return oResult.contextCreated();
	});
	});
});

	//*********************************************************************************************
	QUnit.test("getDeepPathForCanonicalPath", function (assert) {
		var oCreatedContextsCache = {removePersistedContexts : function () {}},
			oModel = {
				// used by ODataListBinding and ODataTreeBinding
				_getCreatedContextsCache : function () {},
				checkFilter : function () {},
				createCustomParams : function () { return {}; }, // used by ODataListBinding
				resolveDeep : function () {},
				resolveFromCache : function () {}
			},
			oModelMock = this.mock(oModel),
			// use real objects since instanceof checks are performed
			oContextBinding = new ODataContextBinding(oModel, "path/to/entity", "~oContext0"),
			oListBinding,
			oPropertyBinding,
			oTreeBinding = new ODataTreeBinding(oModel, "path4tree", "~oContext3"),
			oUnresolvedBinding = new ODataContextBinding(oModel, "path/unbound");

		oModelMock.expects("resolveDeep").withExactArgs("path/to/collection", "~oContext1")
			.returns("/deep/path/to/collection");
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(false);
		this.mock(ODataListBinding.prototype).expects("getResolvedPath")
			.withExactArgs()
			.returns("~resolvedPath");
		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextsCache);
		this.mock(oCreatedContextsCache).expects("removePersistedContexts")
			.withExactArgs("~resolvedPath", "");
		this.mock(ODataListBinding.prototype).expects("_reassignCreateActivate").withExactArgs();
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
	// BCP: 2070289685
	// BCP: 002075129400008585322020
[{
	functionMetadata : undefined,
	functionTarget : "~functionTarget",
	method : "GET",
	expectedRequest : {
		functionMetadata : undefined
	}
}, {
	functionMetadata : "~functionMetadata",
	functionTarget : "~functionTarget",
	method : "GET",
	expectedRequest : {
		functionMetadata : "~functionMetadata",
		functionTarget : "~functionTarget",
		requestUri : "~requestUri"
	}
}, {
	functionMetadata : "~functionMetadata",
	functionTarget : "~functionTarget",
	method : "POST",
	expectedRequest : {
		data : "~data",
		functionMetadata : "~functionMetadata",
		functionTarget : "~functionTarget",
		headers : "~headers",
		method : "POST",
		requestUri : "~requestUri",
		sideEffects : undefined
	}
}].forEach(function (oFixture, i) {
	var sTitle = "_pushToRequestQueue: restore functionTarget and requestUri for function imports; "
			+ i;

	QUnit.test(sTitle, function (assert) {
		var oModel = {},
			oRequest = {
				data : "~data",
				functionTarget : oFixture.functionTarget,
				headers : "~headers",
				key : "~key",
				method : oFixture.method,
				requestUri : "~requestUri"
			},
			mRequests = {
				"~sGroupId" : {
					map : {
						"~key" : {
							request : {functionMetadata : oFixture.functionMetadata}
						}
					}
				}
			};

		// code under test
		ODataModel.prototype._pushToRequestQueue.call(oModel, mRequests, "~sGroupId", undefined,
			oRequest);

		assert.deepEqual(mRequests["~sGroupId"].map["~key"].request, oFixture.expectedRequest);
	});
});

	//*********************************************************************************************
	QUnit.test("_pushToRequestQueue: restore POST request properties", function (assert) {
		var oModel = {},
			oNewRequest = {
				data : "~newData",
				headers : "~newHeaders",
				key : "~key",
				method : "POST",
				sideEffects : "~sideEffects"
			},
			oStoredRequest = {},
			mRequests = {
				"~sGroupId" : {
					map : {
						"~key" : {request : oStoredRequest}
					}
				}
			};

		// code under test
		ODataModel.prototype._pushToRequestQueue.call(oModel, mRequests, "~sGroupId", undefined,
			oNewRequest);

		assert.deepEqual(oStoredRequest, {
			data : "~newData",
			headers : "~newHeaders",
			method : "POST",
			sideEffects : "~sideEffects"
		});
	});

	//*********************************************************************************************
	QUnit.test("_parseResponse, message parser exists", function (assert) {
		var oModel = {
				bIsMessageScopeSupported : "~bIsMessageScopeSupported",
				oMessageParser : {
					parse : function () {}
				}
			};

		this.mock(oModel.oMessageParser).expects("parse")
			.withExactArgs("~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities",
				"~bIsMessageScopeSupported");

		// code under test
		ODataModel.prototype._parseResponse.call(oModel, "~oResponse", "~oRequest", "~mGetEntities",
			"~mChangeEntities");
	});

	//*********************************************************************************************
[
	{bPersist : true, bExpected : true},
	{bPersist : undefined, bExpected : false},
	{bPersist : false, bExpected : false}
].forEach(function (oFixture, i) {
	QUnit.test("_parseResponse, message parser does not exist, #" + i, function (assert) {
		var oModel = {
				bIsMessageScopeSupported : "~bIsMessageScopeSupported",
				bPersistTechnicalMessages : oFixture.bPersist,
				oMetadata : "~oMetadata",
				sServiceUrl : "/service/"
			};

		this.mock(ODataMessageParser.prototype).expects("parse")
			.withExactArgs("~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities",
				"~bIsMessageScopeSupported");
		this.mock(ODataMessageParser.prototype).expects("setProcessor")
			.withExactArgs(sinon.match.same(oModel));

		// code under test
		ODataModel.prototype._parseResponse.call(oModel, "~oResponse", "~oRequest", "~mGetEntities",
			"~mChangeEntities");

		assert.strictEqual(oModel.oMessageParser._serviceUrl, "/service/");
		assert.strictEqual(oModel.oMessageParser._metadata, "~oMetadata");
		assert.strictEqual(oModel.oMessageParser._bPersistTechnicalMessages, oFixture.bExpected);
	});
});

	//*********************************************************************************************
	QUnit.test("_parseResponse, parse function throws error", function (assert) {
		var sError = "error",
			oModel = {
				bIsMessageScopeSupported : "~bIsMessageScopeSupported",
				oMessageParser : {
					parse : function () {}
				}
			};

		this.mock(oModel.oMessageParser).expects("parse")
			.withExactArgs("~oResponse", "~oRequest", "~mGetEntities", "~mChangeEntities",
				"~bIsMessageScopeSupported")
			.throws(sError);

		this.oLogMock.expects("error").withExactArgs("Error parsing OData messages: " + sError);

		// code under test
		ODataModel.prototype._parseResponse.call(oModel, "~oResponse", "~oRequest", "~mGetEntities",
			"~mChangeEntities");
	});

	//*********************************************************************************************
[
	{_setPersistTechnicalMessages : function () {}},
	undefined
].forEach(function (oODataMessageParser, i) {
	[
		{persist : true, result : true},
		{persist : "foo", result : true},
		{persist : false, result : false},
		{persist : undefined, result : false},
		{persist : null, result : false}
	].forEach(function (oFixture) {
	var sTitle = "setPersistTechnicalMessages: " + oFixture.persist + "; #" + i;

	QUnit.test(sTitle, function (assert) {
		var oODataModel = {
				oMessageParser : oODataMessageParser
			},
			oODataMessageParserMock = oODataMessageParser
				? this.mock(oODataMessageParser) : undefined;

		if (oODataMessageParserMock) {
			oODataMessageParserMock.expects("_setPersistTechnicalMessages")
				.withExactArgs(oFixture.result);
		}

		// code under test
		ODataModel.prototype.setPersistTechnicalMessages.call(oODataModel, oFixture.persist);

		assert.strictEqual(oODataModel.bPersistTechnicalMessages, oFixture.result);

		if (oODataMessageParserMock) {
			oODataMessageParserMock.expects("_setPersistTechnicalMessages").exactly(0);
		}

		// code under test - setting the same value again does nothing
		ODataModel.prototype.setPersistTechnicalMessages.call(oODataModel, oFixture.persist);

		assert.strictEqual(oODataModel.bPersistTechnicalMessages, oFixture.result);

		this.oLogMock.expects("warning")
			.withExactArgs("The flag whether technical messages should always be treated as"
				+ " persistent has been overwritten to " + !oFixture.result, undefined, sClassName);
		if (oODataMessageParserMock) {
			oODataMessageParserMock.expects("_setPersistTechnicalMessages")
				.withExactArgs(!oFixture.result);
		}

		// code under test - setting a different value !== undefined logs a warning
		ODataModel.prototype.setPersistTechnicalMessages.call(oODataModel, !oFixture.persist);

		assert.strictEqual(oODataModel.bPersistTechnicalMessages, !oFixture.result);
	});
	});
});

	//*********************************************************************************************
[true, false, undefined].forEach(function (bPersist) {
	QUnit.test("getPersistTechnicalMessages: " + bPersist, function (assert) {
		var oODataModel = {
				bPersistTechnicalMessages : bPersist
			};

		assert.strictEqual(ODataModel.prototype.getPersistTechnicalMessages.call(oODataModel),
			bPersist);
	});
});

	//*********************************************************************************************
[{
	oEntry : undefined,
	sETag : undefined,
	oExpectedEntry : undefined
}, {
	oEntry : {},
	sETag : "~etag",
	oExpectedEntry : {}
}, {
	oEntry : {__metadata : {}},
	sETag : undefined,
	oExpectedEntry : {__metadata : {}}
}, {
	oEntry : {__metadata : {}},
	sETag : "~etag",
	oExpectedEntry : {__metadata : {etag : "~etag"}}
}].forEach(function (oFixture, i) {
	QUnit.test("_updateETag: " + i, function (assert) {
		var oModel = {
				_getHeader : function () {},
				_getObject : function () {},
				sServiceUrl : "/service_url"
			},
			oRequest = {
				requestUri : "/service_url/~requestedEntity?filter"
			},
			oResponse = {
				headers : "~headers"
			};

		this.mock(oModel).expects("_getObject")
			.withExactArgs("/~requestedEntity", undefined, true).returns(oFixture.oEntry);
		this.mock(oModel).expects("_getHeader").withExactArgs("etag", "~headers")
			.returns(oFixture.sETag);

		// code under test
		ODataModel.prototype._updateETag.call(oModel, oRequest, oResponse);

		assert.deepEqual(oFixture.oEntry, oFixture.oExpectedEntry);
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
	QUnit.test("_processError: update deep path for function imports", function (assert) {
		var oModel = {
				_createEventInfo : function () {},
				_handleError : function () {},
				fireBatchRequestCompleted : function () {},
				fireBatchRequestFailed : function () {}
			},
			oRequest = {
				deepPath : "~deepPath",
				functionMetadata : "~functionMetadata",
				functionTarget : "~functionTarget"
			};

		this.mock(oModel).expects("_handleError")
			.withExactArgs("~oResponse", sinon.match.same(oRequest)
				.and(sinon.match.has("deepPath", "~functionTarget")))
			.returns("~oError");
		this.mock(oModel).expects("_createEventInfo")
			.withExactArgs(sinon.match.same(oRequest), "~oError", "~aRequests")
			.returns("~oEventInfo");
		this.mock(oModel).expects("fireBatchRequestCompleted").withExactArgs("~oEventInfo");
		this.mock(oModel).expects("fireBatchRequestFailed").withExactArgs("~oEventInfo");

		// code under test
		ODataModel.prototype._processError.call(oModel, oRequest, "~oResponse",
			/*fnError*/undefined, "~bBatch", "~aRequests");

		assert.strictEqual(oRequest.deepPath, "~functionTarget");
		assert.strictEqual(oRequest.deepPath, oRequest.functionTarget);
	});

	//*********************************************************************************************
	// BCP: 2080258237
	QUnit.test("_submitRequest: avoid TypeError if request is aborted", function (assert) {
		var done = assert.async(),
			oModel = {
				pReadyForRequest : Promise.resolve(),
				_getODataHandler : function () {},
				_request : function () {},
				getServiceMetadata : function () {}
			},
			oRequest = {requestUri : "~uri"};

		this.mock(oModel).expects("_getODataHandler").withExactArgs("~uri").returns("~oHandler");

		// code under test
		ODataModel.prototype._submitRequest.call(oModel, oRequest).abort();

		// internal function submit is called async
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns("~metadata");
		this.mock(oModel).expects("_request")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.func, sinon.match.func,
				"~oHandler", undefined, "~metadata")
			.callsFake(function () {
				Promise.resolve().then(done);
				// for any reason the request handle is undefined which must not lead to a TypeError
				return undefined;
			});
	});

	//*********************************************************************************************
	QUnit.test("_submitRequest: clean up side effect expands in success case", function (assert) {
		var fnResolve, fnHandleSuccessInternal,
			oHandlers = {
				fnSuccessParameter : function () {}
			},
			oHandlersMock = this.mock(oHandlers),
			oModel = {
				pReadyForRequest : Promise.resolve(),
				_getODataHandler : function () {},
				_request : function () {},
				getServiceMetadata : function () {}
			},
			oPromise = new Promise(function (resolve, reject) {
				fnResolve = resolve;
			}),
			oRequest = {requestUri : "~uri"};

		this.mock(oModel).expects("_getODataHandler").withExactArgs("~uri").returns("~oHandler");
		oHandlersMock.expects("fnSuccessParameter").never();

		// code under test
		ODataModel.prototype._submitRequest.call(oModel, oRequest, oHandlers.fnSuccessParameter);

		// internal function submit is called async
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns("~metadata");
		this.mock(oModel).expects("_request")
			.withExactArgs(sinon.match.same(oRequest),
				sinon.match(function (handleSuccess) {
					fnHandleSuccessInternal = handleSuccess;

					return true;
				}), sinon.match.func, "~oHandler", undefined, "~metadata")
			.callsFake(function () {
				fnResolve();
			});

		return oPromise.then(function () {
			var aSideEffectCleanUpFunctions = [sinon.spy(), sinon.spy()];

			oHandlersMock.expects("fnSuccessParameter") // parameters not relevant
				.callsFake(function () {
					// simulate collection of side effect cleanup functions
					oModel.aSideEffectCleanUpFunctions = aSideEffectCleanUpFunctions;
				});

			// code under test
			fnHandleSuccessInternal();

			assert.notStrictEqual(oModel.aSideEffectCleanUpFunctions, aSideEffectCleanUpFunctions);
			assert.deepEqual(oModel.aSideEffectCleanUpFunctions, []);
			assert.ok(aSideEffectCleanUpFunctions[0].calledOnceWithExactly());
			assert.ok(aSideEffectCleanUpFunctions[1].calledOnceWithExactly());
		});
	});

	//*********************************************************************************************
["fulfilled", "pending", "rejected"].forEach(function (sCase) {
	[false, true].forEach(function (bMetaModelLoaded) {
	var sTitle = "_getObject: code list path, " + sCase + "; bMetaModelLoaded=" + bMetaModelLoaded;

	QUnit.test(sTitle, function (assert) {
		var oFetchCodeListPromise,
			oMetaModel = {
				fetchCodeList : function () {}
			},
			oModel = {
				oMetadata : {isLoaded : function () {}},
				bMetaModelLoaded : bMetaModelLoaded,
				_isMetadataPath : function () {},
				getMetaModel : function () {},
				isMetaModelPath : function () {},
				resolve : function () {}
			};

		// We use SyncPromise instead of a mock to ensure #caught needs to be called in case of a
		// rejected SyncPromise.
		// SyncPromise.resolve(Promise.resolve()) in fixtures leads to a fulfilled promise in the
		// QUnit test -> cannot be used in fixture.
		if (sCase === "fulfilled") {
			oFetchCodeListPromise = SyncPromise.resolve("~mCodeList");
		} else {
			oFetchCodeListPromise = sCase === "pending"
				? SyncPromise.resolve(Promise.resolve("~mCodeList"))
				: SyncPromise.reject("~error");
		}
		/**
		 * @deprecated As of version 1.88.0
		 */
		(function () {
			oModel.isLegacySyntax = function () {};
			this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
		}.bind(this)());
		this.mock(oModel).expects("resolve").withExactArgs("~path", undefined, undefined)
			.returns("~resolvedPath");
		this.mock(oModel).expects("_isMetadataPath").withExactArgs("~resolvedPath").returns(true);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oModel).expects("isMetaModelPath").withExactArgs("~resolvedPath").returns(true);
		this.mock(oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
		this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~resolvedPath")
			.returns("~term");
		this.mock(oMetaModel).expects("fetchCodeList").withExactArgs("~term")
			.returns(oFetchCodeListPromise);

		// code under test
		assert.strictEqual(ODataModel.prototype._getObject.call(oModel, "~path"),
			sCase === "fulfilled" ? "~mCodeList" : undefined);

		return oFetchCodeListPromise.isPending() ? oFetchCodeListPromise : undefined;
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_getObject: code list path, oMetadata.isLoaded=false", function (assert) {
		var oModel = {
				oMetadata : {isLoaded : function () {}},
				_isMetadataPath : function () {},
				resolve : function () {}
			};

		/**
		 * @deprecated As of version 1.88.0
		 */
		(function () {
			oModel.isLegacySyntax = function () {};
			this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
		}.bind(this)());
		this.mock(oModel).expects("resolve").withExactArgs("~path", undefined, undefined)
			.returns("~resolvedPath");
		this.mock(oModel).expects("_isMetadataPath").withExactArgs("~resolvedPath").returns(true);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(false);
		this.mock(ODataMetaModel).expects("getCodeListTerm").withExactArgs("~resolvedPath")
			.returns("~term");

		// code under test
		assert.strictEqual(ODataModel.prototype._getObject.call(oModel, "~path"), undefined);
	});

	//*********************************************************************************************
[{
	bUseUndefinedIfUnresolved : true,
	vResult : undefined
}, {
	bUseUndefinedIfUnresolved : undefined,
	vResult : null
}].forEach(function (oFixture) {
	var sTitle = "_getObject: use undefined if unresolved: " + oFixture.bUseUndefinedIfUnresolved;

	QUnit.test(sTitle, function (assert) {
		var oModel = {
				resolve : function () {}
			};

		/**
		 * @deprecated As of version 1.88.0
		 */
		(function () {
			oModel.isLegacySyntax = function () {};
			this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
		}.bind(this)());
		this.mock(oModel).expects("resolve")
			.withExactArgs("~path", undefined, undefined)
			.returns(undefined);

		// code under test
		assert.strictEqual(ODataModel.prototype._getObject.call(oModel, "~path", undefined,
			undefined, oFixture.bUseUndefinedIfUnresolved), oFixture.vResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_getObject: call _getInstanceAnnotationValue", function (assert) {
		var oModel = {
				resolve : function () {},
				_getInstanceAnnotationValue : function () {}
			},
			sPath = "@$ui5.~annotation";

		/**
		 * @deprecated As of version 1.88.0
		 */
		(function () {
			oModel.isLegacySyntax = function () {};
			this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
		}.bind(this)());
		this.mock(oModel).expects("resolve")
			.withExactArgs(sPath, "~oContext", undefined)
			.returns("~resolvedPath");
		this.mock(oModel).expects("_getInstanceAnnotationValue")
			.withExactArgs(sPath, "~oContext")
			.returns("~value");

		// code under test
		assert.strictEqual(ODataModel.prototype._getObject.call(oModel, sPath, "~oContext"),
			"~value");
	});

	//*********************************************************************************************
[undefined, "~sPath"].forEach(function (sPath) {
	var sTitle = "_getObject: Don't call _getInstanceAnnotationValue for sPath: " + sPath;

	QUnit.test(sTitle, function (assert) {
		var oModel = {
				mChangedEntities : {},
				_getEntity : function () {},
				_isMetadataPath : function () {},
				resolve : function () {}
			};

		/**
		 * @deprecated As of version 1.88.0
		 */
		(function () {
			oModel.isLegacySyntax = function () {};
			this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
		}.bind(this)());
		this.mock(oModel).expects("resolve")
			.withExactArgs(sPath, "~oContext", undefined)
			.returns("/~resolvedPath");
		this.mock(oModel).expects("_isMetadataPath").withExactArgs("/~resolvedPath").returns(false);
		this.mock(oModel).expects("_getEntity").withExactArgs("~resolvedPath").returns("~Data");

		// code under test
		assert.strictEqual(ODataModel.prototype._getObject.call(oModel, sPath, "~oContext"),
			"~Data");
	});
});

	//*********************************************************************************************
	QUnit.test("_getObject: propagate _getInstanceAnnotationValue error", function (assert) {
		var oError = new Error("~Error"),
			oModel = {
				_getInstanceAnnotationValue : function () {},
				resolve : function () {}
			};

		/**
		 * @deprecated As of version 1.88.0
		 */
		(function () {
			oModel.isLegacySyntax = function () {};
			this.mock(oModel).expects("isLegacySyntax").withExactArgs().returns(false);
		}.bind(this)());
		this.mock(oModel).expects("resolve")
			.withExactArgs("@$ui5.~annotation", "~oContext", undefined)
			.returns("/~resolvedPath");
		this.mock(oModel).expects("_getInstanceAnnotationValue")
			.withExactArgs("@$ui5.~annotation", "~oContext")
			.throws(oError);

		// code under test
		assert.throws(function () {
				ODataModel.prototype._getObject.call(oModel,"@$ui5.~annotation", "~oContext");
			}, oError);
	});

	//*********************************************************************************************
[
	{sPath : "@$ui5.context.isInactive", sFunctionName : "isInactive"},
	{sPath : "@$ui5.context.isTransient", sFunctionName : "isTransient"}
].forEach(function (oFixture) {
	QUnit.test("_getInstanceAnnotationValue: " + oFixture.sPath, function (assert) {
		var oContext = {};

		oContext[oFixture.sFunctionName] = function () {};
		this.mock(oContext).expects(oFixture.sFunctionName)
			.withExactArgs()
			.returns("~annotationValue");

		// code under test
		assert.strictEqual(ODataModel.prototype._getInstanceAnnotationValue(oFixture.sPath,
			oContext), "~annotationValue");
	});
});

	//*********************************************************************************************
	QUnit.test("_getInstanceAnnotationValue: unsupported instance annotation", function (assert) {
		// code under test
		assert.throws(function () {
			ODataModel.prototype._getInstanceAnnotationValue("@$ui5.~annotation", "~oContext");
		}, new Error("Unsupported instance annotation: @$ui5.~annotation"));
	});

	//*********************************************************************************************
	QUnit.test("annotationsLoaded", function (assert) {
		var oModel = {pAnnotationsLoaded : "~pAnnotationsLoaded"};

		// code under test
		assert.strictEqual(ODataModel.prototype.annotationsLoaded.call(oModel),
			"~pAnnotationsLoaded");
	});

	//*********************************************************************************************
	QUnit.test("getMetaModel: new meta model - successfully loaded", function (assert) {
		var oData = {foo : 'bar'},
			oMetaModel,
			oModel = {
				oAnnotations : undefined,
				oMetadata : {
					getServiceMetadata : function () {},
					isLoaded : function () {}
				},
				oMetaModel : undefined,
				bMetaModelLoaded : "~bMetaModelLoaded",
				annotationsLoaded : function () {},
				checkUpdate : function () {}
			};

		// called in ODataMetaModel constructor
		this.mock(oModel).expects("annotationsLoaded").withExactArgs().returns(Promise.resolve());
		// called in ODataMetaModel constructor; result is used to create a JSONModel
		this.mock(oModel.oMetadata).expects("getServiceMetadata").withExactArgs().returns(oData);

		// code under test
		oMetaModel = ODataModel.prototype.getMetaModel.call(oModel);

		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(oModel.oMetaModel, oMetaModel);
		assert.strictEqual(oModel.bMetaModelLoaded, "~bMetaModelLoaded",
			"bMetaModelLoaded is unchanged until the meta model is loaded");

		// called in ODataMetaModel constructor
		this.mock(_ODataMetaModelUtils).expects("merge")
			.withExactArgs({}, oData, sinon.match.same(oMetaModel), /*bIgnoreAnnotationsFromMetadata*/undefined);

		this.mock(oModel).expects("checkUpdate").withExactArgs(false, false, null, true)
			.callsFake(function () {
				assert.strictEqual(oModel.bMetaModelLoaded, true,
					"checkUpdate called after the meta model is loaded");
			});

		return oMetaModel.loaded().then(function () {
			assert.strictEqual(oModel.bMetaModelLoaded, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaModel: meta model already available", function (assert) {
		var oModel = {oMetaModel : "~oMetaModel"};

		// code under test
		assert.strictEqual(ODataModel.prototype.getMetaModel.call(oModel), "~oMetaModel");
	});

	//*********************************************************************************************
	QUnit.test("createCodeListModelParameters: mParameters=undefined and defaulting",
			function (assert) {
		var mExpectedResult = {
				defaultCountMode : CountMode.None,
				disableSoftStateHeader : true,
				headers : undefined,
				json : undefined,
				metadataUrlParams : undefined,
				persistTechnicalMessages : undefined,
				serviceUrl : "~serviceUrl",
				serviceUrlParams : undefined,
				tokenHandling : false,
				useBatch : false,
				warmupUrl : undefined
			},
			oModel = {sServiceUrl : "~serviceUrl"};

		// code under test
		assert.deepEqual(ODataModel.prototype.createCodeListModelParameters.call(oModel),
			mExpectedResult);
	});

	//*********************************************************************************************
	QUnit.test("createCodeListModelParameters: w/ mParameters and defaulting", function (assert) {
		var mExpectedResult = {
				defaultCountMode : CountMode.None,
				disableSoftStateHeader : true,
				headers : {foo : "bar"},
				json : "~json",
				metadataUrlParams : {meta : "data"},
				persistTechnicalMessages : "~persist",
				serviceUrl : "~serviceUrl",
				serviceUrlParams : {service : "url"},
				tokenHandling : false,
				useBatch : false,
				warmupUrl : "~warmupUrl"
			},
			oModel = {sServiceUrl : "~serviceUrl"},
			mParameters = {
				defaultCountMode : "~countMode",
				disableSoftStateHeader : false,
				headers : {foo : "bar"},
				json : "~json",
				metadataUrlParams : {meta : "data"},
				persistTechnicalMessages : "~persist",
				serviceUrl : "~serviceUrl",
				serviceUrlParams : {service : "url"},
				tokenHandling : true,
				useBatch : true,
				warmupUrl : "~warmupUrl"
			},
			mResults;

		// code under test
		mResults = ODataModel.prototype.createCodeListModelParameters.call(oModel, mParameters);

		assert.deepEqual(mResults, mExpectedResult);
		assert.notStrictEqual(mResults.headers, mParameters.headers);
		assert.notStrictEqual(mResults.metadataUrlParams, mParameters.metadataUrlParams);
		assert.notStrictEqual(mResults.serviceUrlParams, mParameters.serviceUrlParams);
	});

	//*********************************************************************************************
	QUnit.test("getCodeListModelParameters", function (assert) {
		var oModel = {mCodeListModelParams : "~mCodeListModelParams"};

		// code under test
		assert.strictEqual(ODataModel.prototype.getCodeListModelParameters.call(oModel),
			"~mCodeListModelParams");
	});

	//*********************************************************************************************
	QUnit.test("getMetadataUrl", function (assert) {
		var oModel = {sMetadataUrl : "~metadataUrl"};

		// code under test
		assert.strictEqual(ODataModel.prototype.getMetadataUrl.call(oModel), "~metadataUrl");
	});

	//*********************************************************************************************
	QUnit.test("_updateContext", function (assert) {
		var oModel = {mContexts : {}},
			oContext = new BaseContext(oModel, "/path");

		oModel.mContexts["/path"] = oContext;

		assert.strictEqual(oContext.getPath(), "/path");
		assert.strictEqual(oContext.sDeepPath, "");

		// code under test
		ODataModel.prototype._updateContext.call(oModel, oContext, "/newPath");

		assert.strictEqual(oContext.getPath(), "/newPath");
		assert.strictEqual(oContext.sDeepPath, "", "deep path is not changed");
		assert.deepEqual(oModel.mContexts, {
			//TODO is it necessary the context remains stored with its previous path as key?
			"/path"  : oContext,
			"/newPath" : oContext
		});

		// code under test
		ODataModel.prototype._updateContext.call(oModel, oContext, "/newPath2", "/deep/newPath2");

		assert.strictEqual(oContext.getPath(), "/newPath2");
		assert.strictEqual(oContext.sDeepPath, "/deep/newPath2");
		assert.deepEqual(oModel.mContexts, {
			"/path"  : oContext,
			"/newPath" : oContext,
			"/newPath2" : oContext
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSecurityToken: call _handleError with oRequest", function (assert) {
		var fnError, oResult,
			oModel = {
				bDisableHeadRequestForToken : true,
				_createRequest : function () {},
				_createRequestUrlWithNormalizedPath : function () {},
				_getHeaders : function () {},
				_handleError : function () {},
				_request : function () {},
				getServiceMetadata : function () {},
				resetSecurityToken : function () {}
			},
			oRequest = {headers : {}};

		this.mock(oModel).expects("_createRequestUrlWithNormalizedPath")
			.withExactArgs("/")
			.returns("~sUrl");
		this.mock(oModel).expects("_getHeaders").withExactArgs(undefined, true).returns("~headers");
		this.mock(oModel).expects("_createRequest")
			.withExactArgs("~sUrl", "", "GET", "~headers", null, null, false)
			.returns(oRequest);
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns("~serviceMetadata");
		this.mock(oModel).expects("_request")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.func,
				sinon.match(function (fnError0) {
					fnError = fnError0;
					return true;
				}), undefined, undefined, "~serviceMetadata")
			.returns("~requestHandle");

		// code under test - parameters fnSuccess, fnError and bAsync are not relevant for this test
		oResult = ODataModel.prototype.refreshSecurityToken.call(oModel);

		assert.strictEqual(oResult.request, "~requestHandle");

		this.mock(oModel).expects("resetSecurityToken").withExactArgs();
		this.mock(oModel).expects("_handleError")
			.withExactArgs("~error", sinon.match.same(oRequest));

		// code under test - call error handler
		fnError("~error");

		assert.strictEqual(oModel.bTokenHandling, false);
	});

	//*********************************************************************************************
	QUnit.test("refreshSecurityToken: no server cache for tokenHandling='skipServerCache'", function (assert) {
		const oModel = {
				bDisableHeadRequestForToken : true,
				_createRequest() {},
				_createRequestUrlWithNormalizedPath() {},
				_getHeader() {},
				_getHeaders() {},
				_request() {},
				_setSessionContextIdHeader() {},
				getServiceMetadata() {},
				oHeaders : {},
				oSharedServiceData : {}
			};
		const oModelMock = this.mock(oModel);
		const oRequest = {headers : {}};
		const oResponse = {headers : "~responseHdrs"};

		oModelMock.expects("_createRequestUrlWithNormalizedPath").withExactArgs("/").returns("~sUrl");
		oModelMock.expects("_getHeaders").withExactArgs(undefined, true).returns("~headers");
		oModelMock.expects("_createRequest")
			.withExactArgs("~sUrl", "", "GET", "~headers", null, null, false)
			.returns(oRequest);
		oModelMock.expects("getServiceMetadata").withExactArgs().returns("~serviceMetadata");
		const oRequestCall = oModelMock.expects("_request")
			.withExactArgs(sinon.match.same(oRequest), sinon.match.func, sinon.match.func, undefined, undefined,
				"~serviceMetadata")
			.returns("~requestHandle");

		// code under test - parameters fnSuccess, fnError and bAsync are not relevant for this test
		const oResult = ODataModel.prototype.refreshSecurityToken.call(oModel);

		assert.strictEqual(oResult.request, "~requestHandle");

		oModelMock.expects("_getHeader").withExactArgs("x-csrf-token", "~responseHdrs").returns("~token");
		oModelMock.expects("_getHeader").withExactArgs("sap-contextid", "~responseHdrs").returns("~contextId");
		oModelMock.expects("_setSessionContextIdHeader").withExactArgs("~contextId");

		// code under test - call success handler handleSuccess
		oRequestCall.args[0][1]("~oData", oResponse);

		assert.strictEqual(oModel.oSharedServiceData.securityToken, "~token");
		assert.strictEqual(oModel.oHeaders["x-csrf-token"], "~token");
		return oModel.pSecurityToken.then((sToken) => {
			assert.strictEqual(sToken, "~token");
		});
	});

	//*********************************************************************************************
	QUnit.test("getContext", function (assert) {
		var oContext, oContext1,
			oContextPrototypeMock = this.mock(Context.prototype),
			oModel = {mContexts : {}};

		// oContextPrototypeMock.expects("getDeepPath").never();
		oContextPrototypeMock.expects("setDeepPath").never();

		// code under test
		oContext = ODataModel.prototype.getContext.call(oModel, "/~sPath");

		assert.ok(oContext instanceof Context);
		assert.strictEqual(oContext.getModel(), oModel);
		assert.strictEqual(oContext.getPath(), "/~sPath");
		assert.strictEqual(oContext.getDeepPath(), "/~sPath");

		// code under test
		oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath1", "/~sDeepPath1");

		assert.notStrictEqual(oContext1, oContext);
		assert.strictEqual(oContext1.getPath(), "/~sPath1");
		assert.strictEqual(oContext1.getDeepPath(), "/~sDeepPath1");

		oContextPrototypeMock.expects("getDeepPath").never();
		oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sDeepPath");

		// code under test - cached instance
		oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath", "/~sDeepPath");

		assert.strictEqual(oContext1, oContext);

		oContextPrototypeMock.expects("getDeepPath").on(oContext).withArgs()
			.returns("/~sDeepPathFromGetter");
		oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sDeepPathFromGetter");

		// code under test - existing deep path must not be overwritten by path
		oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath");

		oContextPrototypeMock.expects("getDeepPath").never();
		oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sDeepPath2");

		// code under test - existing deep path overwrite
		oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath", "/~sDeepPath2");

		oContextPrototypeMock.expects("getDeepPath").on(oContext).withArgs().returns("");
		oContextPrototypeMock.expects("setDeepPath").on(oContext).withArgs("/~sPath");

		// code under test - empty deep path
		oContext1 = ODataModel.prototype.getContext.call(oModel, "/~sPath", "");
	});

	//*********************************************************************************************
	QUnit.test("getContext: inactive context", function (assert) {
		var oContext,
			oModel = {mContexts : {}};

		// code under test
		oContext = ODataModel.prototype.getContext.call(oModel, "/~sPath", "/~sDeepPath",
			"~createPromise", "~inactive");

		assert.strictEqual(oModel.mContexts["/~sPath"], oContext);
		// constructor cannot be mocked so check internal member
		assert.strictEqual(oContext.bInactive, true);
	});

	//*********************************************************************************************
	QUnit.test("getContext: transient parent", function (assert) {
		var oContext,
			oModel = {mContexts : {}};

		// code under test
		oContext = ODataModel.prototype.getContext.call(oModel, "/~sPath", "/~sDeepPath",
			"~createPromise", "~inactive", "~transientParent");

		assert.strictEqual(oModel.mContexts["/~sPath"], oContext);
		// constructor cannot be mocked so check internal member
		assert.strictEqual(oContext.oTransientParent, "~transientParent");
	});

	//*********************************************************************************************
[false, true].forEach(function (bAll) {
	[false, true].forEach(function (bDeleteCreatedEntities) {
	var sTitle = "resetChanges: no paths; bAll=" + bAll + ", bDeleteCreatedEntities="
		+ bDeleteCreatedEntities;

	QUnit.test(sTitle, function (assert) {
		var oContextBar = {isInactive : function () {}},
			oContextBaz = {isInactive : function () {}},
			oContextFoo = {isInactive : function () {}},
			oModel = {
				mChangedEntities : {
					"key('Bar')" : {__metadata : {}},
					"key('Foo')" : {__metadata : {created : {}}},
					"key('Baz')" : {__metadata : {created : {}}}
				},
				mDeferredGroups : {
					deferred0 : {},
					deferred1 : {}
				},
				oMetadata : {
					loaded : function () {}
				},
				_discardEntityChanges : function () {},
				abortInternalRequest : function () {},
				checkUpdate : function () {},
				getBindings : function () {},
				getContext : function () {}
			},
			oModelMock = this.mock(oModel),
			fnResolve,
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			});

		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oPromise);
		oModelMock.expects("getContext").withExactArgs("/key('Bar')").returns(oContextBar);
		this.mock(oContextBar).expects("isInactive").withExactArgs().returns(false);
		oModelMock.expects("_discardEntityChanges")
			.withExactArgs("key('Bar')", undefined);
		oModelMock.expects("getContext").withExactArgs("/key('Foo')").returns(oContextFoo);
		this.mock(oContextFoo).expects("isInactive").withExactArgs().returns(false);
		oModelMock.expects("_discardEntityChanges")
			.withExactArgs("key('Foo')", bDeleteCreatedEntities);
		oModelMock.expects("getContext").withExactArgs("/key('Baz')").returns(oContextBaz);
		this.mock(oContextBaz).expects("isInactive").withExactArgs().returns(true);
		oModelMock.expects("_discardEntityChanges")
			.withExactArgs("key('Baz')", false);
		oModelMock.expects("getBindings").withExactArgs().returns([]);
		oModelMock.expects("checkUpdate").withExactArgs(true);

		// code under test
		assert.strictEqual(
			ODataModel.prototype.resetChanges.call(oModel, undefined, bAll, bDeleteCreatedEntities),
			oPromise);

		oModelMock.expects("abortInternalRequest").withExactArgs("deferred0").exactly(bAll ? 1 : 0);
		oModelMock.expects("abortInternalRequest").withExactArgs("deferred1").exactly(bAll ? 1 : 0);

		// test code that depends on metadata promise
		fnResolve();

		return oPromise;
	});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAll) {
	[false, true].forEach(function (bDeleteCreatedEntities) {
		[
			{bDeleteEntity : undefined, oQuxMetadata : {}},
			{bDeleteEntity : bDeleteCreatedEntities, oQuxMetadata : {created : {}}}
		].forEach(function (oFixture) {
	var sTitle = "resetChanges: with paths; bAll=" + bAll + ", bDeleteCreatedEntities="
		+ bDeleteCreatedEntities + ", oMetadata=" + JSON.stringify(oFixture.oQuxMetadata);

	QUnit.test(sTitle, function (assert) {
		var oBarMetadata = {},
			oBarEntity = {__metadata : oBarMetadata, P : "prop0", Q : "prop1"},
			oContext0 = {getSubContextsAsKey : function () {}},
			oContext1 = {getSubContextsAsKey : function () {}},
			oFooEntity = {__metadata : {}, S : "prop3"},
			oODataModelMock = this.mock(ODataModel),
			oQuxEntity = {__metadata : oFixture.oQuxMetadata, R : "prop2"},
			oXyzEntity = {__metadata : {created : {}}, X : "prop4"},
			oModel = {
				mChangedEntities : {
					"key('Bar')" : oBarEntity,
					"key('Foo')" : oFooEntity,
					"key('Qux')" : oQuxEntity,
					"key('Xyz')" : oXyzEntity
				},
				mDeferredGroups : {
					deferred0 : {},
					deferred1 : {}
				},
				oMetadata : {
					loaded : function () {}
				},
				_discardEntityChanges : function () {},
				abortInternalRequest : function () {},
				checkUpdate : function () {},
				getBindings : function () {},
				getContext : function () {},
				getEntityByPath : function () {}
			},
			oModelMock = this.mock(oModel),
			fnResolve,
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			});

		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oPromise);
		oODataModelMock.expects("_isChangedEntityEmpty").never();
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Z", null, {})
			.callsFake(function (sPath, oContext, oEntityInfo) {
				oEntityInfo.key = "key('Z')";
				oEntityInfo.propertyPath = "";
				return "~oZEntity";
			});
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Z/Y/X", null, {})
			.callsFake(function (sPath, oContext, oEntityInfo) {
				oEntityInfo.key = "key('Z')";
				oEntityInfo.propertyPath = "Y/X";
				return "~oZEntity";
			});
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Bar/P", null, {})
			.callsFake(function (sPath, oContext, oEntityInfo) {
				oEntityInfo.key = "key('Bar')";
				oEntityInfo.propertyPath = "P";
				return "~oBarEntity";
			});
		oODataModelMock.expects("_isChangedEntityEmpty")
			.withExactArgs(sinon.match.same(oBarEntity))
			.returns(false);
		oModelMock.expects("getEntityByPath").withExactArgs("/Baz", null, {}).returns(null);
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Bar/Q/X", null, {})
			.callsFake(function (sPath, oContext, oEntityInfo) {
				oEntityInfo.key = "key('Bar')";
				oEntityInfo.propertyPath = "Q/X";
				return "~oBarEntity";
			});
		oODataModelMock.expects("_isChangedEntityEmpty")
			.withExactArgs(sinon.match.same(oBarEntity))
			.returns(false);
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Qux", null, {})
			.callsFake(function (sPath, oContext, oEntityInfo) {
				oEntityInfo.key = "key('Qux')";
				oEntityInfo.propertyPath = "";
				return "~oQuxEntity";
			});
		oODataModelMock.expects("_isChangedEntityEmpty")
			.withExactArgs(sinon.match.same(oQuxEntity))
			.returns(false);
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Foo/S", null, {})
			.callsFake(function (sPath, oContext, oEntityInfo) {
				oEntityInfo.key = "key('Foo')";
				oEntityInfo.propertyPath = "S";
				return "~oFooEntity";
			});
		oODataModelMock.expects("_isChangedEntityEmpty")
			.withExactArgs(sinon.match.same(oFooEntity))
			.returns(true);
		oModelMock.expects("getContext").withExactArgs("/key('Qux')").returns(oContext0);
		this.mock(oContext0).expects("getSubContextsAsKey")
			.withExactArgs(true)
			.returns(["key('Foo')", "key('Xyz')"]);
		oModelMock.expects("getContext").withExactArgs("/key('Foo')").returns(oContext1);
		this.mock(oContext1).expects("getSubContextsAsKey")
			.withExactArgs(true)
			.returns(["key('Xyz')"]);
		oModelMock.expects("_discardEntityChanges")
			.withExactArgs("key('Qux')", oFixture.bDeleteEntity);
		oModelMock.expects("_discardEntityChanges")
			.withExactArgs("key('Foo')", undefined);
		oModelMock.expects("_discardEntityChanges")
			.withExactArgs("key('Xyz')", bDeleteCreatedEntities);
		oModelMock.expects("getBindings").withExactArgs().returns([]);
		oModelMock.expects("checkUpdate").withExactArgs(true);

		// code under test
		assert.strictEqual(
			ODataModel.prototype.resetChanges.call(oModel,
				["/Z", "/Z/Y/X", "/Bar/P", "/Baz", "/Bar/Q/X", "/Qux", "/Foo/S"],
				bAll, bDeleteCreatedEntities),
			oPromise);

		assert.deepEqual(oModel.mChangedEntities["key('Bar')"],
			{__metadata : oBarMetadata, Q : "prop1"});
		assert.strictEqual(oModel.mChangedEntities["key('Bar')"].__metadata, oBarMetadata);

		if (bAll) {
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", {path : "Z"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", {path : "Z"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", {path : "Z/Y/X"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", {path : "Z/Y/X"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", {path : "Bar/P"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", {path : "Bar/P"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", {path : "Baz"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", {path : "Baz"});
			oModelMock.expects("abortInternalRequest")
				.withExactArgs("deferred0", {path : "Bar/Q/X"});
			oModelMock.expects("abortInternalRequest")
				.withExactArgs("deferred1", {path : "Bar/Q/X"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", {path : "Qux"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", {path : "Qux"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred0", {path : "Foo/S"});
			oModelMock.expects("abortInternalRequest").withExactArgs("deferred1", {path : "Foo/S"});
		} else {
			oModelMock.expects("abortInternalRequest").never(); // called in _discardEntityChanges
		}

		// test code that depends on metadata promise
		fnResolve();

		return oPromise;
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("resetChanges: calls oBinding._resetChanges", function (assert) {
		var oBinding1 = {_resetChanges : function () {}},
			oBinding2 = {_resetChanges : function () {}},
			oModel = {
				oMetadata : {loaded : function () {}},
				checkUpdate : function () {},
				getBindings : function () {}
			},
			aPath = [];

		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns("~pMetaDataLoaded");
		this.mock(oModel).expects("getBindings")
			.withExactArgs()
			.returns([{/*oBinding0*/}, oBinding1, oBinding2]);
		this.mock(oBinding1).expects("_resetChanges").withExactArgs(sinon.match.same(aPath));
		this.mock(oBinding2).expects("_resetChanges").withExactArgs(sinon.match.same(aPath));
		this.mock(oModel).expects("checkUpdate").withExactArgs(true);

		// code under test
		assert.strictEqual(ODataModel.prototype.resetChanges.call(oModel, aPath),
			"~pMetaDataLoaded");
	});

	//*********************************************************************************************
[true, false].forEach(function (bDeleteEntity) {
	[
		{oEntityMetadata : {}},
		{oEntityMetadata : {created : undefined}},
		{oEntityMetadata : {created : {}}},
		{
			oEntityMetadata : {created : {abort : function () {}}},
			bCallAbort : bDeleteEntity
		}
	].forEach(function (oFixture, i) {
	var sTitle = "_discardEntityChanges: bDeleteEntity=" + bDeleteEntity + ", #" + i;

	QUnit.test(sTitle, function (assert) {
		var oFindAndRemoveContext, oRemoveEntity, fnResolve,
			oContext = {removeFromTransientParent : function () {}},
			oMessagingMock = this.mock(Messaging),
			oMetadata = {
				loaded : function () {}
			},
			oModel = {
				mChangedEntities : {
					foo : "bar",
					"~sKey" : {__metadata : oFixture.oEntityMetadata}
				},
				oCreatedContextsCache : {
					findAndRemoveContext : function () {}
				},
				oMetadata : oMetadata,
				_createAbortedError : function () {},
				_removeEntity : function () {},
				_resolveGroup : function () {},
				abortInternalRequest : function () {},
				getContext : function () {},
				getMessagesByEntity : function () {}
			},
			oModelMock = this.mock(oModel),
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			});

		oModelMock.expects("_resolveGroup").withExactArgs("~sKey").returns({groupId : "~groupId"});
		this.mock(oMetadata).expects("loaded").withExactArgs().returns(oPromise);
		this.mock(oModel).expects("getContext")
			.withExactArgs("/~sKey")
			.exactly(bDeleteEntity ? 1 : 0)
			.returns(oContext);
		this.mock(oContext).expects("removeFromTransientParent")
			.withExactArgs()
			.exactly(bDeleteEntity ? 1 : 0);
		oFindAndRemoveContext = this.mock(oModel.oCreatedContextsCache)
			.expects("findAndRemoveContext")
			.withExactArgs(sinon.match.same(oContext))
			.exactly(bDeleteEntity ? 1 : 0);
		oRemoveEntity = oModelMock.expects("_removeEntity")
			.withExactArgs("~sKey")
			.exactly(bDeleteEntity ? 1 : 0)
			.callsFake(function (sKey) {
				delete this.mChangedEntities[sKey];
			});
		this.mock(ODataModel).expects("_createAbortedError")
			.withExactArgs()
			.exactly(oFixture.bCallAbort ? 1 : 0)
			.returns("~oAbortedError");
		if (oFixture.bCallAbort) {
			this.mock(oFixture.oEntityMetadata.created).expects("abort")
				.withExactArgs("~oAbortedError");
		}
		oModelMock.expects("getMessagesByEntity")
			.withExactArgs("~sKey", true)
			.returns("~aMessages");
		oMessagingMock.expects("removeMessages").withExactArgs("~aMessages");

		// code under test
		assert.strictEqual(
			ODataModel.prototype._discardEntityChanges.call(oModel, "~sKey", bDeleteEntity),
			oPromise);

		if (bDeleteEntity) {
			assert.ok(oRemoveEntity.calledImmediatelyAfter(oFindAndRemoveContext));
		}
		assert.deepEqual(oModel.mChangedEntities, {foo : "bar"});

		oModelMock.expects("abortInternalRequest")
			.withExactArgs("~groupId", {requestKey : "~sKey"});

		// test code that depends on metadata promise
		fnResolve();

		return oPromise;
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_discardEntityChanges: no changes for key", function (assert) {
		var oContext = {removeFromTransientParent : function () {}},
			fnResolve,
			oModel = {
				mChangedEntities : {},
				oCreatedContextsCache : {
					findAndRemoveContext : function () {}
				},
				oMetadata : {loaded : function () {}},
				_removeEntity : function () {},
				_resolveGroup : function () {},
				abortInternalRequest : function () {},
				getContext : function () {},
				getMessagesByEntity : function () {}
			},
			oModelMock = this.mock(oModel),
			oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			});

		this.mock(oModel).expects("_resolveGroup")
			.withExactArgs("~sKey")
			.returns({groupId : "~groupId"});
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oPromise);
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oContext).expects("removeFromTransientParent").withExactArgs();
		this.mock(oModel.oCreatedContextsCache)
			.expects("findAndRemoveContext")
			.withExactArgs(sinon.match.same(oContext));
		this.mock(oModel).expects("_removeEntity").withExactArgs("~sKey");
		this.mock(oModel).expects("getMessagesByEntity")
			.withExactArgs("~sKey", true)
			.returns("~aMessages");
		this.mock(Messaging).expects("removeMessages")
			.withExactArgs("~aMessages");

		// code under test
		assert.strictEqual(
			ODataModel.prototype._discardEntityChanges.call(oModel, "~sKey", true),
			oPromise);

		oModelMock.expects("abortInternalRequest")
			.withExactArgs("~groupId", {requestKey : "~sKey"});

		// test code that depends on metadata promise
		fnResolve();

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("_createAbortedError", function (assert) {
		var oError0, oError1,
			oAbortedError = {
				aborted : true,
				headers : {},
				message : "Request aborted",
				responseText : "",
				statusCode : 0,
				statusText : "abort"
			};

		// code under test
		oError0 = ODataModel._createAbortedError();

		assert.deepEqual(oError0, oAbortedError);

		// code under test
		oError1 = ODataModel._createAbortedError();

		assert.deepEqual(oError1, oAbortedError);
		assert.notStrictEqual(oError1, oError0);
		assert.notStrictEqual(oError1.headers, oError0.headers);
	});

	//*********************************************************************************************
	QUnit.test("getContext with create promise", function (assert) {
		var oContext,
			oModel = {mContexts : {}};

		// code under test
		oContext = ODataModel.prototype.getContext.call(oModel, "/~sPath", undefined,
			"~oSyncCreatePromise");

		assert.strictEqual(oModel.mContexts["/~sPath"], oContext);
		// constructor cannot be mocked so check internal member
		assert.strictEqual(oContext.oSyncCreatePromise, "~oSyncCreatePromise");

		return oContext.created().then(function (oSyncPromise) {
			assert.strictEqual(oSyncPromise, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedContextsCache", function (assert) {
		var oModel = {oCreatedContextsCache : "~oCreatedContextsCache"};

		// code under test
		assert.strictEqual(ODataModel.prototype._getCreatedContextsCache.call(oModel),
			"~oCreatedContextsCache");
	});

	//*********************************************************************************************
[{
	oData : {
		__metadata : {
			created : {
				error : "~fnError",
				refreshAfterChange : "~refreshAfterChange",
				success : "~fnSuccess"
			}
		}
	},
	expectedError : "~fnError",
	expectedRefreshAfterChange : "~refreshAfterChange",
	expectedSuccess : "~fnSuccess"
}, {
	oData : {
		__metadata : {
			created : {
				error : "~fnError",
				success : "~fnSuccess"
			}
		}
	},
	expectedError : "~fnError",
	expectedRefreshAfterChange : "~bRefreshAfterChangeFromModel",
	expectedSuccess : "~fnSuccess"
}, {
	oData : {
		__metadata : {}
	},
	expectedError : undefined,
	expectedRefreshAfterChange : "~bRefreshAfterChangeFromModel",
	expectedSuccess : undefined
}, {
	oData : {},
	expectedError : undefined,
	expectedRefreshAfterChange : "~bRefreshAfterChangeFromModel",
	expectedSuccess : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("submitChanges: restore parameters for created entities; #" + i, function (assert) {
		var oContext = {
				hasTransientParent : function () {},
				isInactive : function () {}
			},
			oGroupInfo = {changeSetId : "~changeSetId", groupId : "~groupId"},
			oMetadataPromise = Promise.resolve(),
			oModel = {
				mChangedEntities : {
					"~sKey" : oFixture.oData
				},
				mDeferredGroups : {"~groupId" : "~groupId"},
				mDeferredRequests : {},
				oMetadata : {
					loaded : function () {}
				},
				bRefreshAfterChange : "~bRefreshAfterChangeFromModel",
				getBindings : function () {},
				getContext : function () {},
				_processChange : function () {},
				_processRequestQueue : function () {},
				_pushToRequestQueue : function () {},
				_resolveGroup : function () {}
			},
			oRequest = {};

		this.mock(oModel).expects("getBindings").withExactArgs().returns([]);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataPromise);

		// code under test
		ODataModel.prototype.submitChangesWithChangeHeaders.call(oModel);

		// async, after metadata loaded promise is resolved
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oModel).expects("_resolveGroup").withExactArgs("~sKey").returns(oGroupInfo);
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(false);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(false);
		this.mock(oModel).expects("_processChange")
			.withExactArgs("~sKey", /*copy of*/oFixture.oData, "~groupId", undefined)
			.returns(oRequest);
		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), "~groupId", "~changeSetId",
				sinon.match.same(oRequest), oFixture.expectedSuccess, oFixture.expectedError,
				/*oRequestHandle*/sinon.match.object, oFixture.expectedRefreshAfterChange);
		this.mock(oModel).expects("_processRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), undefined, undefined,
				undefined, undefined);

		return oMetadataPromise.then(function () {
			assert.strictEqual(oRequest.key, "~sKey");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("submitChanges: calls _submitChanges on ODataTreeBindingFlat; w/o given parameters",
			function (assert) {
		var aBindings = [{_submitChanges : function () {}}, {}, {_submitChanges : function () {}}],
			oContext = {
				hasTransientParent : function () {},
				isInactive : function () {}
			},
			oMetadataPromise = Promise.resolve(),
			oModel = {
				mChangedEntities : {"~sKey" : {}},
				mDeferredGroups : {"~groupId" : "~groupId"},
				mDeferredRequests : {},
				oMetadata : {
					loaded : function () {}
				},
				bRefreshAfterChange : "~bRefreshAfterChangeFromModel",
				getBindings : function () {},
				getContext : function () {},
				_processChange : function () {},
				_processRequestQueue : function () {},
				_pushToRequestQueue : function () {},
				_resolveGroup : function () {}
			},
			aOrderedSuccessHandlerCalls = [],
			oRequest = {},
			fnSuccess;

		this.mock(oModel).expects("getBindings")
			.withExactArgs()
			.returns(aBindings);
		this.mock(aBindings[0]).expects("_submitChanges")
			.withExactArgs({groupId : undefined})
			.callsFake(function (mParameters) {
				mParameters.success = function (vParam0, vParam1) {
					assert.strictEqual(vParam0, "~foo");
					assert.strictEqual(vParam1, "~bar");
					aOrderedSuccessHandlerCalls.push("~success0");
				};
			});
		this.mock(aBindings[2]).expects("_submitChanges")
			.withExactArgs({groupId : undefined})
			.callsFake(function (mParameters) {
				mParameters.success = function (vParam0, vParam1) {
					assert.strictEqual(vParam0, "~foo");
					assert.strictEqual(vParam1, "~bar");
					aOrderedSuccessHandlerCalls.push("~success1");
				};
			});
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataPromise);

		// code under test
		ODataModel.prototype.submitChangesWithChangeHeaders.call(oModel, /*mParameters*/undefined);

		// async, after metadata loaded promise is resolved
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oModel).expects("_resolveGroup")
			.withExactArgs("~sKey")
			.returns({changeSetId : "~changeSetId", groupId : "~groupId"});
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(false);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(false);
		this.mock(oModel).expects("_processChange")
			.withExactArgs("~sKey", {}, "~groupId", undefined)
			.returns(oRequest);
		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), "~groupId", "~changeSetId",
				sinon.match.same(oRequest), /*fnSuccess*/undefined, /*fnError*/undefined,
				/*oRequestHandle*/sinon.match.object, "~bRefreshAfterChangeFromModel");
		this.mock(oModel).expects("_processRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), undefined,
				sinon.match.func, undefined, undefined)
			.callsFake(function (mDeferredRequests, sGroupId, fnSuccess0, fnError) {
				fnSuccess = fnSuccess0;
			});

		return oMetadataPromise.then(function () {
			assert.strictEqual(oRequest.key, "~sKey");

			// code under test: call success handler for this request queue
			fnSuccess("~foo", "~bar");

			assert.deepEqual(aOrderedSuccessHandlerCalls, ["~success0", "~success1"]);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitChanges: calls _submitChanges on ODataTreeBindingFlat; w/ given parameters",
			function (assert) {
		var aBindings = [{_submitChanges : function () {}}, {_submitChanges : function () {}}],
			oContext = {
				hasTransientParent : function () {},
				isInactive : function () {}
			},
			oMetadataPromise = Promise.resolve(),
			oModel = {
				mChangedEntities : {"~sKey" : {}},
				mDeferredGroups : {"~groupId" : "~groupId"},
				mDeferredRequests : {},
				oMetadata : {
					loaded : function () {}
				},
				bRefreshAfterChange : "~bRefreshAfterChangeFromModel",
				getBindings : function () {},
				getContext : function () {},
				_processChange : function () {},
				_processRequestQueue : function () {},
				_pushToRequestQueue : function () {},
				_resolveGroup : function () {}
			},
			aOrderedSuccessHandlerCalls = [],
			fnOriginalSuccess = function (vParam0, vParam1) {
				assert.strictEqual(vParam0, "~foo");
				assert.strictEqual(vParam1, "~bar");
				aOrderedSuccessHandlerCalls.push("~successFromParams");
			},
			mParameters = {
				groupId : "~groupId",
				success : fnOriginalSuccess
			},
			oRequest = {},
			fnSuccess;

		this.mock(oModel).expects("getBindings")
			.withExactArgs()
			.returns(aBindings);
		this.mock(aBindings[0]).expects("_submitChanges")
			.withExactArgs({groupId : "~groupId"})
			.callsFake(function (mParameters) {
				mParameters.success = function (vParam0, vParam1) {
					assert.strictEqual(vParam0, "~foo");
					assert.strictEqual(vParam1, "~bar");
					aOrderedSuccessHandlerCalls.push("~success0");
				};
			});
		// second binding does nothing; e.g. unresolved
		this.mock(aBindings[1]).expects("_submitChanges").withExactArgs({groupId : "~groupId"});
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataPromise);

		// code under test
		ODataModel.prototype.submitChangesWithChangeHeaders.call(oModel, mParameters);

		// async, after metadata loaded promise is resolved
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oModel).expects("_resolveGroup")
			.withExactArgs("~sKey")
			.returns({changeSetId : "~changeSetId", groupId : "~groupId"});
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(false);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(false);
		this.mock(oModel).expects("_processChange")
			.withExactArgs("~sKey", {}, "~groupId", undefined)
			.returns(oRequest);
		this.mock(oModel).expects("_pushToRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), "~groupId", "~changeSetId",
				sinon.match.same(oRequest), /*fnSuccess*/undefined, /*fnError*/undefined,
				/*oRequestHandle*/sinon.match.object, "~bRefreshAfterChangeFromModel");
		this.mock(oModel).expects("_processRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), "~groupId",
				sinon.match.func, undefined, undefined)
			.callsFake(function (mDeferredRequests, sGroupId, fnSuccess0, fnError) {
				fnSuccess = fnSuccess0;
			});

		return oMetadataPromise.then(function () {
			assert.strictEqual(oRequest.key, "~sKey");

			// code under test: call success handler for this request queue
			fnSuccess("~foo", "~bar");

			assert.strictEqual(fnOriginalSuccess, mParameters.success);
			assert.notStrictEqual(fnSuccess, mParameters.success);
			assert.deepEqual(aOrderedSuccessHandlerCalls, ["~successFromParams", "~success0"]);
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bHasTransientParent, i) {
	QUnit.test("submitChanges: skip changed entities, " + i, function (assert) {
		var oContext = {
				hasTransientParent : function () {},
				isInactive : function () {}
			},
			oMetadataPromise = Promise.resolve(),
			oModel = {
				mChangedEntities : {"~sKey" : {}},
				mDeferredRequests : {},
				oMetadata : {loaded : function () {}},
				_processRequestQueue : function () {},
				_resolveGroup : function () {},
				getBindings : function () {},
				getContext : function () {}
			};

		this.mock(oModel).expects("getBindings").withExactArgs().returns([]);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataPromise);

		// code under test
		ODataModel.prototype.submitChangesWithChangeHeaders.call(oModel);

		// async, after metadata loaded promise is resolved
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey").returns(oContext);
		this.mock(oModel).expects("_resolveGroup").withExactArgs("~sKey").returns(/*not relevant*/);
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(bHasTransientParent);
		this.mock(oContext).expects("isInactive").withExactArgs().exactly(bHasTransientParent ? 0 : 1).returns(true);
		this.mock(oModel).expects("_processRequestQueue")
			.withExactArgs(sinon.match(function (mDeferredRequests) {
				assert.deepEqual(mDeferredRequests, {});

				return oModel.mDeferredRequests === mDeferredRequests;
			}), undefined, undefined, undefined, undefined);

		return oMetadataPromise;
	});
});

	//*********************************************************************************************
	QUnit.test("submitChanges: delegate to submitChangesWithHeaders", function (assert) {
		var oModel = {
				submitChangesWithChangeHeaders : function () {}
			},
			oModelMock = this.mock(oModel),
			mParameters = {
				batchGroupId : "~batchGroupId",
				changeHeaders : "~changeHeaders",  // only considered in direct call to submitChangesWithChangeHeaders
				error : "~error",
				groupId : "~groupId",
				merge : "~merge",
				success : "~success",
				unknown : "~unknown"
			},
			mPassedParameters = {
				batchGroupId : "~batchGroupId",
				error : "~error",
				groupId : "~groupId",
				merge : "~merge",
				success : "~success"
			};

		oModelMock.expects("submitChangesWithChangeHeaders").withExactArgs(undefined).returns("~requestHandle");

		// code under test
		assert.strictEqual(ODataModel.prototype.submitChanges.call(oModel), "~requestHandle");

		oModelMock.expects("submitChangesWithChangeHeaders").withExactArgs(mPassedParameters).returns("~requestHandle");

		// code under test
		assert.strictEqual(ODataModel.prototype.submitChanges.call(oModel, mParameters), "~requestHandle");
	});

	//*********************************************************************************************
	QUnit.test("submitChangesWithHeaders: propagates change headers", function (assert) {
		var mChangeHeaders = {header : "headerValue"},
			oMetadataPromise = Promise.resolve(),
			oModel = {
				mChangedEntities : {},
				mDeferredRequests : {},
				oMetadata : {
					loaded : function () {}
				},
				_isHeaderPrivate : function () {},
				_processRequestQueue : function () {},
				getBindings : function () {}
			};

		this.mock(oModel).expects("_isHeaderPrivate").withExactArgs("header").returns(false);
		this.mock(oModel).expects("getBindings").withExactArgs().returns([]);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataPromise);
		this.mock(oModel).expects("_processRequestQueue")
			.withExactArgs(sinon.match.same(oModel.mDeferredRequests), undefined, undefined, undefined,
				sinon.match.same(mChangeHeaders));

		// code under test
		ODataModel.prototype.submitChangesWithChangeHeaders.call(oModel, {changeHeaders : mChangeHeaders});

		return oMetadataPromise;
	});

	//*********************************************************************************************
	QUnit.test("submitChangesWithHeaders: disallow private headers as change headers", function (assert) {
		var mChangeHeaders = {
				notPrivate0 : "n0",
				private0 : "p0",
				notPrivate1 : "n1"
			},
			oModel = {
				_isHeaderPrivate : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("_isHeaderPrivate").withExactArgs("notPrivate0").returns(false);
		oModelMock.expects("_isHeaderPrivate").withExactArgs("private0").returns(true);

		// code under test
		assert.throws(function () {
			ODataModel.prototype.submitChangesWithChangeHeaders.call(oModel, {changeHeaders : mChangeHeaders});
		}, new Error("Must not use private header: private0"));
	});

	//*********************************************************************************************
	QUnit.test("setProperty: deferred request", function (assert) {
		var oRequestQueuedPromise,
			oEntry = {__metadata: {deepPath: "/any/deep/path", foo: "bar"}},
			oMetadataLoadedPromise = Promise.resolve(),
			oModel = {
				mChangedEntities: {},
				mDeferredGroups: {"~groupId": "~groupId"},
				mDeferredRequests: "~mDeferredRequests",
				oMetadata: {
					_getEntityTypeByPath: function () {},
					loaded: function () {}
				},
				mRequests: "~mRequests",
				checkUpdate: function () {},
				getEntityByPath: function () {},
				_getObject: function () {},
				_getRefreshAfterChange: function () {},
				_processChange: function () {},
				_processRequestQueueAsync: function () {},
				_pushToRequestQueue: function () {},
				resolve: function () {},
				resolveDeep: function () {},
				_resolveGroup: function () {}
			},
			oModelMock = this.mock(oModel),
			oOriginalEntry = {__metadata: {}};

		oModelMock.expects("resolve").withExactArgs("~sPath", "~oContext").returns("/resolved/~path");
		oModelMock.expects("resolveDeep").withExactArgs("~sPath", "~oContext").returns("/deep/path/~propertyPath");
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/resolved/~path", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "~key";
				oEntityInfo.propertyPath = "~propertyPath";

				return oEntry;
			});
		oModelMock.expects("_getObject").withExactArgs("/~key", null, true).returns(oOriginalEntry);
		oModelMock.expects("_getObject").withExactArgs("~sPath", "~oContext", true).returns("~oOriginalValue");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~key").returns(/*oEntityType*/);
		oModelMock.expects("_resolveGroup")
			.withExactArgs("~key")
			.returns({changeSetId: "~changeSetId", groupId: "~groupId"});
		oModelMock.expects("_getObject").withExactArgs("/~key").returns("~oData");
		oModelMock.expects("_processChange")
			.withExactArgs("~key", "~oData", "~groupId")
			.returns(/*oRequest*/{});
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~groupId")
			.returns("~bRefreshAfterChange");
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataLoadedPromise);
		oModelMock.expects("checkUpdate").withExactArgs(false, "~bAsyncUpdate", {"~key": true});
		oRequestQueuedPromise = oMetadataLoadedPromise.then(function () {
			oModelMock.expects("_pushToRequestQueue")
				.withExactArgs("~mDeferredRequests", "~groupId", "~changeSetId", {key: "~key"}, /*success*/ undefined,
					/*error*/ undefined, /*oRequestHandle*/sinon.match.object, "~bRefreshAfterChange");
			oModelMock.expects("_processRequestQueueAsync").withExactArgs("~mRequests");
		});

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "~sPath", "~oValue", "~oContext", "~bAsyncUpdate"),
			true);

		assert.deepEqual(
			oModel.mChangedEntities["~key"],
			{
				__metadata: {
					deepPath: "/deep/path",
					foo: "bar"
				},
				"~path": "~oValue"
			});

		return oRequestQueuedPromise;
	});

	//*********************************************************************************************
	QUnit.test("setProperty: deferred request - function import", function (assert) {
		var oRequestQueuedPromise,
			oMetadataLoadedPromise = Promise.resolve(),
			oModel = {
				mChangedEntities: {},
				mDeferredGroups: {"~groupId": "~groupId"},
				mDeferredRequests: "~mDeferredRequests",
				oMetadata: {
					_getEntityTypeByPath: function () {},
					loaded: function () {}
				},
				mRequests: "~mRequests",
				checkUpdate: function () {},
				getEntityByPath: function () {},
				_getObject: function () {},
				_getRefreshAfterChange: function () {},
				_processChange: function () {},
				_processRequestQueueAsync: function () {},
				_pushToRequestQueue: function () {},
				resolve: function () {},
				resolveDeep: function () {},
				_resolveGroup: function () {}
			},
			oModelMock = this.mock(oModel),
			oOriginalEntry = {
				__metadata: {
					created: {
						functionImport: true
					},
					deepPath: "/functionName",
					foo: "bar"
				}
			};

		oModelMock.expects("resolve").withExactArgs("~sPath", "~oContext")
			.returns("/resolve_functionName('$id123')/~propertyPath");
		oModelMock.expects("resolveDeep").withExactArgs("~sPath", "~oContext")
			.returns("/deep_functionName('$id123')/~propertyPath");
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/resolve_functionName('$id123')/~propertyPath", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "~key";
				oEntityInfo.propertyPath = "~propertyPath";

				return oOriginalEntry;
			});
		oModelMock.expects("_getObject").withExactArgs("/~key", null, true).returns(oOriginalEntry);
		oModelMock.expects("_getObject").withExactArgs("~sPath", "~oContext", true).returns("~oOriginalValue");
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath").withExactArgs("~key").returns(/*oEntityType*/);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oMetadataLoadedPromise);
		oModelMock.expects("_resolveGroup")
			.withExactArgs("~key")
			.returns({changeSetId: "~changeSetId", groupId: "~groupId"});
		oModelMock.expects("_getObject").withExactArgs("/~key").returns("~oData");
		oModelMock.expects("_processChange")
			.withExactArgs("~key", "~oData", "~groupId")
			.returns(/*oRequest*/{});
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~groupId")
			.returns("~bRefreshAfterChange");
		oModelMock.expects("checkUpdate").withExactArgs(false, "~bAsyncUpdate", {"~key": true});
		oRequestQueuedPromise = oMetadataLoadedPromise.then(function () {
			oModelMock.expects("_pushToRequestQueue")
				.withExactArgs("~mDeferredRequests", "~groupId", "~changeSetId", {key: "~key"}, /*success*/ undefined,
					/*error*/ undefined, /*oRequestHandle*/sinon.match.object, "~bRefreshAfterChange");
			oModelMock.expects("_processRequestQueueAsync").withExactArgs("~mRequests");
		});

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "~sPath", "~oValue", "~oContext", "~bAsyncUpdate"),
			true);

		assert.deepEqual(oModel.mChangedEntities["~key"],
			{
				__metadata: {
					created: {
						functionImport: true
					},
					// deep path is not overwritten as original value is needed to repeat the request
					deepPath: "/functionName",
					foo: "bar"
				},
				"~propertyPath": "~oValue"
			});

		return oRequestQueuedPromise;
	});

	//*********************************************************************************************
[{
	createdContextFound : false,
	entryMetadata : {},
	expectFindCreatedContext : false
}, {
	createdContextFound : false,
	entryMetadata : {created : {}},
	expectFindCreatedContext : true
}, {
	createdContextFound : true,
	entryMetadata : {created : {}},
	expectFindCreatedContext : true
}, {
	createdContextFound : false,
	entryMetadata : {created : {functionImport : true}},
	expectFindCreatedContext : false
}].forEach(function (oFixture, i) {
	QUnit.test("setProperty: created context is already activated; " + i, function (assert) {
		var oContext = {hasTransientParent : function () {}},
			oEntry = {
				__metadata : oFixture.entryMetadata
			},
			oMetadataLoadedPromise = Promise.resolve(),
			oModel = {
				oCreatedContextsCache : {
					findCreatedContext : function () {}
				},
				mChangedEntities : {
					"key" : {}
				},
				mDeferredGroups : {},
				oMetadata : {
					_getEntityTypeByPath : function () {},
					loaded : function () {}
				},
				mRequests : "~mRequests",
				checkUpdate : function () {},
				getEntityByPath : function () {},
				_getObject : function () {},
				_getRefreshAfterChange : function () {},
				_processChange : function () {},
				_processRequestQueueAsync : function () {},
				_pushToRequestQueue : function () {},
				resolve : function () {},
				resolveDeep : function () {},
				_resolveGroup : function () {}
			},
			oCreatedContext = new Context(oModel, "~sContextPath"),
			oModelMock = this.mock(oModel),
			oOriginalEntry = {
				__metadata : oFixture.entryMetadata
			},
			oOriginalValue = {};

		oModelMock.expects("resolve")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("/resolved/path");
		oModelMock.expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("deepPath");
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(false);
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/resolved/path", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "key";
				oEntityInfo.propertyPath = "";

				return oEntry;
			});
		oModelMock.expects("_getObject")
			.withExactArgs("/key", null, true)
			.returns(oOriginalEntry);
		oModelMock.expects("_getObject")
			.withExactArgs("~sPath", sinon.match.same(oContext), true)
			.returns(oOriginalValue);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("key")
			.returns(/*oEntityType*/);
		oModelMock.expects("_resolveGroup")
			.withExactArgs("key")
			.returns({changeSetId : "~changeSetId", groupId : "~groupId"});
		oModelMock.expects("_getObject")
			.withExactArgs("/key")
			.returns("~oData");
		oModelMock.expects("_processChange")
			.withExactArgs("key", "~oData", "~groupId")
			.returns(/*oRequest*/{});
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~groupId")
			.returns("~bRefreshAfterChange");
		this.mock(oModel.oMetadata).expects("loaded")
			.withExactArgs()
			.returns(oMetadataLoadedPromise);
		this.mock(oModel.oCreatedContextsCache).expects("findCreatedContext")
			.withExactArgs("/resolved/path")
			.exactly(oFixture.expectFindCreatedContext ? 1 : 0)
			.returns(oFixture.createdContextFound ? oCreatedContext : undefined);
		this.mock(oCreatedContext).expects("isInactive")
			.withExactArgs()
			.exactly(oFixture.createdContextFound ? 1 : 0)
			.returns(false);
		oModelMock.expects("checkUpdate")
			.withExactArgs(false, "~bAsyncUpdate", {"key" : true});

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "~sPath", "~oValue", oContext,
				"~bAsyncUpdate"),
			true);

		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~groupId", "~changeSetId", {key : "key"},
				/*success*/ undefined, /*error*/ undefined,
				/*oRequestHandle*/sinon.match.object, "~bRefreshAfterChange");
		oModelMock.expects("_processRequestQueueAsync").withExactArgs("~mRequests");

		return oMetadataLoadedPromise;
	});
});

	//*********************************************************************************************
	QUnit.test("setProperty: activate inactive context", function (assert) {
		var oActivatedPromise, fnResolveActivatedPromise,
			bActivatedPromiseResolved = false,
			oContext = {hasTransientParent : function () {}},
			oEntry = {
				__metadata : {created : {}}
			},
			oMetadataLoadedPromise = Promise.resolve(),
			oModel = {
				oCreatedContextsCache : {
					findCreatedContext : function () {}
				},
				mChangedEntities : {
					"key" : {}
				},
				mDeferredGroups : {},
				oMetadata : {
					_getEntityTypeByPath : function () {},
					loaded : function () {}
				},
				mRequests : "~mRequests",
				checkUpdate : function () {},
				getEntityByPath : function () {},
				_getObject : function () {},
				_getRefreshAfterChange : function () {},
				_processChange : function () {},
				_processRequestQueueAsync : function () {},
				_pushToRequestQueue : function () {},
				resolve : function () {},
				resolveDeep : function () {},
				_resolveGroup : function () {}
			},
			oCreatedContext = new Context(oModel, "~sContextPath"),
			oModelMock = this.mock(oModel),
			oOriginalEntry = {
				__metadata : {}
			},
			oOriginalValue = {};

		oModelMock.expects("resolve")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("/resolved/path");
		oModelMock.expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("deepPath");
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(false);
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/resolved/path", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "key";
				oEntityInfo.propertyPath = "";

				return oEntry;
			});
		oModelMock.expects("_getObject")
			.withExactArgs("/key", null, true)
			.returns(oOriginalEntry);
		oModelMock.expects("_getObject")
			.withExactArgs("~sPath", sinon.match.same(oContext), true)
			.returns(oOriginalValue);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("key")
			.returns(/*oEntityType*/);
		oModelMock.expects("_resolveGroup")
			.withExactArgs("key")
			.returns({changeSetId : "~changeSetId", groupId : "~groupId"});
		oModelMock.expects("_getObject")
			.withExactArgs("/key")
			.returns("~oData");
		oModelMock.expects("_processChange")
			.withExactArgs("key", "~oData", "~groupId")
			.returns(/*oRequest*/{});
		oModelMock.expects("_getRefreshAfterChange")
			.withExactArgs(undefined, "~groupId")
			.returns("~bRefreshAfterChange");
		this.mock(oModel.oMetadata).expects("loaded")
			.withExactArgs()
			.returns(oMetadataLoadedPromise);
		this.mock(oModel.oCreatedContextsCache).expects("findCreatedContext")
			.withExactArgs("/resolved/path")
			.returns(oCreatedContext);
		this.mock(oCreatedContext).expects("isInactive")
			.withExactArgs()
			.returns(true);
		this.mock(oCreatedContext).expects("startActivation")
			.withExactArgs();
		oActivatedPromise = new SyncPromise(function(resolve) {
			fnResolveActivatedPromise = resolve;
		});
		this.mock(oCreatedContext).expects("fetchActivated")
			.withExactArgs()
			.returns(oActivatedPromise);
		oModelMock.expects("checkUpdate")
			.withExactArgs(false, "~bAsyncUpdate", {"key" : true});
		oActivatedPromise.then(function () {
			bActivatedPromiseResolved = true;
		});

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "~sPath", "~oValue", oContext,
				"~bAsyncUpdate"),
			true);

		oModelMock.expects("_pushToRequestQueue")
			.withExactArgs("~mRequests", "~groupId", "~changeSetId", {key : "key"},
				/*success*/ undefined, /*error*/ undefined,
				/*oRequestHandle*/sinon.match.object, "~bRefreshAfterChange")
			.callsFake(function () {
				assert.ok(bActivatedPromiseResolved, "only called after activated promise is resolved");
			});
		oModelMock.expects("_processRequestQueueAsync")
			.withExactArgs("~mRequests")
			.callsFake(function () {
				assert.ok(bActivatedPromiseResolved, "only called after activated promise is resolved");
			});

		// code under test
		fnResolveActivatedPromise();

		return Promise.all([oMetadataLoadedPromise, oActivatedPromise]);
	});

	//*********************************************************************************************
[{
	vChangedValue : {ms : 60000, __edmType : "Edm.Time"},
	bMergeRequired : true,
	vNewValue : {ms : 0, __edmType : "Edm.Time"},
	vNewValueClone : {ms : 0, __edmType : "Edm.Time"},
	vOriginalValue : {ms : 0, __edmType : "Edm.Time"},
	oContext : {hasTransientParent : function () {}}
}, {
	vChangedValue : UI5Date.getInstance(120000),
	bMergeRequired : false,
	vNewValue : UI5Date.getInstance(60000),
	vNewValueClone : UI5Date.getInstance(60000),
	vOriginalValue : UI5Date.getInstance(60000),
	oContext : {hasTransientParent : function () {}}
}, {
	vChangedValue : 13,
	bMergeRequired : false,
	vNewValue : 42,
	vNewValueClone : 42,
	vOriginalValue : 42,
	oContext : undefined
}, {
	vChangedValue : 13,
	bMergeRequired : false,
	vNewValue : 42,
	vNewValueClone : 42,
	vOriginalValue : 42,
	oContext : {} // standard model context having no hasTransientParent method, BCP 2270157004
}].forEach(function (oFixture, i) {
	QUnit.test("setProperty: revert pending change; #" + i, function (assert) {
		var oClonedChangedEntry = {
				__metadata : {}
			},
			oHelperMock = this.mock(_Helper),
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
			.withExactArgs("~sPath", sinon.match.same(oFixture.oContext))
			.returns("/resolved/~propertyPath");
		oModelMock.expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oFixture.oContext))
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
			.withExactArgs("~sPath", sinon.match.same(oFixture.oContext), true)
			.returns(oFixture.vOriginalValue);
		oHelperMock.expects("isPlainObject")
			.withExactArgs(sinon.match.same(oFixture.vNewValue))
			.callThrough();
		oHelperMock.expects("merge")
			.withExactArgs({}, sinon.match.same(oFixture.vNewValue))
			.exactly(oFixture.bMergeRequired ? 1 : 0)
			.callThrough();
		if (oFixture.oContext && oFixture.oContext.hasTransientParent) {
			this.mock(oFixture.oContext).expects("hasTransientParent")
				.withExactArgs()
				.returns(false);
		}
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
			ODataModel.prototype.setProperty.call(oModel, "~sPath", oFixture.vNewValue,
				oFixture.oContext, "~bAsyncUpdate"),
			true);

		assert.deepEqual(oModel.mChangedEntities, {});
		assert.deepEqual(oFixture.vNewValue, oFixture.vNewValueClone, "new value not modified");

		return oMetadataLoadedPromise.then(function () {/*wait for aborted requests*/});
	});
});

	//*********************************************************************************************
	QUnit.test("setProperty: setting a value for an instance annotation is not allowed",
			function (assert) {
		var oModel = {
				resolve : function () {},
				resolveDeep : function () {},
				getEntityByPath : function () {}
			};

		this.mock(oModel).expects("resolve")
			.withExactArgs("@$ui5.~annotation", "~oContext")
			.returns("/resolved/@$ui5.~annotation");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("@$ui5.~annotation", "~oContext")
			.returns("/resolved/deep/path/@$ui5.~annotation");
		this.mock(oModel).expects("getEntityByPath")
			.withExactArgs("/resolved/@$ui5.~annotation", null, /*by ref oEntityInfo*/{})
			.returns("~oEntry");

		// code under test
		assert.throws(function () {
			ODataModel.prototype.setProperty.call(oModel, "@$ui5.~annotation", "~oValue",
				"~oContext", "~bAsyncUpdate");
		}, new Error(
			"Setting a value for an instance annotation starting with '@$ui5' is not allowed: "
				+ "@$ui5.~annotation"));
	});

	//*********************************************************************************************
	QUnit.test("setProperty: skip request creation for deep create", function (assert) {
		var oContext = {hasTransientParent : function () {}},
			oEntry = {__metadata : {}},
			oModel = {
				mChangedEntities : {"~key" : {}},
				checkUpdate : function () {},
				getEntityByPath : function () {},
				_getObject : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			},
			oModelMock = this.mock(oModel),
			oOriginalEntry = {__metadata : {}},
			oOriginalValue = {};

		oModelMock.expects("resolve")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("/~SalesOrderSet(42)/Note");
		oModelMock.expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("~deepPath");
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/~SalesOrderSet(42)/Note", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "~key";
				oEntityInfo.propertyPath = "~propertyPath";

				return oEntry;
			});
		oModelMock.expects("_getObject")
			.withExactArgs("/~key", null, true)
			.returns(oOriginalEntry);
		oModelMock.expects("_getObject")
			.withExactArgs("~sPath", oContext, true)
			.returns(oOriginalValue);
		this.mock(oContext).expects("hasTransientParent").withExactArgs().returns(true);
		oModelMock.expects("checkUpdate")
			.withExactArgs(false, "~bAsyncUpdate", {"~key" : true});

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "~sPath", "~oValue", oContext,
				"~bAsyncUpdate"),
			true);

		assert.deepEqual(oModel.mChangedEntities, {"~key" : {"Note" : "~oValue"}});
	});

	//*********************************************************************************************
	QUnit.test("setProperty: with same value for referential constraint", function (assert) {
		var oContext = {},
			oEntry = {__metadata: {}},
			oLoadedPromise = Promise.resolve(),
			oMetadata = {
				_getEntityTypeByPath: function () {},
				_getNavPropertyRefInfo: function () {},
				loaded: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oModel = {
				mChangedEntities: {},
				oMetadata: oMetadata,
				_getObject: function () {},
				_resolveGroup: function () {},
				abortInternalRequest: function () {},
				checkUpdate: function () {},
				createKey: function () {},
				getEntityByPath: function () {},
				isLaundering: function () {},
				resolve: function () {},
				resolveDeep: function () {}
			},
			oModelMock = this.mock(oModel),
			oNavPropRefInfo = {
				entitySet: "~otherEntity",
				keys: ["property"],
				name: "navigagtionProperty"
			},
			oOriginalEntry = {
				__metadata: {},
				navigagtionProperty: {
					__ref: "~navigationTarget"
				},
				property: "foo"
			};

		oModelMock.expects("resolve")
			.withExactArgs("property", sinon.match.same(oContext))
			.returns("/Entity(42)/property");
		oModelMock.expects("resolveDeep")
			.withExactArgs("property", sinon.match.same(oContext))
			.returns("~deepPath");
		oModelMock.expects("getEntityByPath")
			.withExactArgs("/Entity(42)/property", null, /*by ref oEntityInfo*/{})
			.callsFake(function (sResolvedPath, oContext, oEntityInfo) { // fill reference parameter
				oEntityInfo.key = "~key";
				oEntityInfo.propertyPath = "~propertyPath";

				return oEntry;
			});
		oModelMock.expects("_getObject").withExactArgs("/~key", null, true).returns(oOriginalEntry);
		oModelMock.expects("_getObject")
			.withExactArgs("property", sinon.match.same(oContext), true)
			.returns("foo");
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("~key")
			.returns("~oEntityType");
		oMetadataMock.expects("_getNavPropertyRefInfo")
			.withExactArgs("~oEntityType", "property")
			.returns(oNavPropRefInfo);
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("~otherEntity")
			.returns({
				key: {
					propertyRef: ["key1", "key2"]
				}
			});
		oModelMock.expects("createKey").never();
		oModelMock.expects("isLaundering").withExactArgs("/~key").returns(false);
		oModelMock.expects("checkUpdate").withExactArgs(false, undefined, {"~key": true});
		oMetadataMock.expects("loaded").withExactArgs().returns(oLoadedPromise);

		// code under test
		assert.strictEqual(
			ODataModel.prototype.setProperty.call(oModel, "property", "foo", oContext),
			true);

		oModelMock.expects("_resolveGroup").withExactArgs("~key").returns({groupId: "group"});
		oModelMock.expects("abortInternalRequest").withExactArgs("group", {requestKey: "~key"});

		return oLoadedPromise.then(function () {});
	});

	//*********************************************************************************************
	QUnit.test("getObject: missing selected property for a created entity", function (assert) {
		var oEntity = {
				__metadata : {
					created : {},
					uri : "~uri"
				}
			},
			oEntityType = {
				navigationProperty : "~navigationProperties",
				property : "~properties"
			},
			oModel = {
				oMetadata : {_getEntityTypeByPath : function () {}},
				_filterOwnExpand : function () {},
				_filterOwnSelect : function () {},
				_getObject : function () {},
				_splitEntries : function () {},
				resolve : function () {}
			},
			oModelMock = this.mock(oModel),
			mParameters = {
				select : "~select"
			};

		oModelMock.expects("resolve").withArgs("~path", "~context").returns("~resolvedPath");
		oModelMock.expects("_getObject").withArgs("~resolvedPath").returns(oEntity);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withArgs("~resolvedPath")
			.returns(oEntityType);
		oModelMock.expects("_splitEntries").withArgs("~select").returns("~selects");
		oModelMock.expects("_filterOwnSelect")
			.withArgs("~selects", "~properties")
			.returns(["selectedProperty"]);
		oModelMock.expects("_filterOwnExpand")
			.withArgs([], "~selects")
			.returns([/*selected expanded navigation properties*/]);
		oModelMock.expects("_filterOwnSelect")
			.withArgs("~selects", "~navigationProperties")
			.returns([/*deferred expanded navigation properties*/]);

		// code under test
		assert.deepEqual(
			ODataModel.prototype.getObject.call(oModel, "~path", "~context", mParameters),
			{
				__metadata : {
					created : {},
					uri : "~uri"
				},
				selectedProperty : undefined
			});
	});

	//*********************************************************************************************
[true, false].forEach(function (bSuccess) {
	QUnit.test("requestSideEffects: bSuccess=" + bSuccess, function (assert) {
		var fnError, oResult, fnSuccess,
			aBindings = [
				{isA : function () {}},
				{_refreshForSideEffects : function () {}, isA : function () {}}
			],
			oModel = {
				oMetadata : {_getEntityTypeByPath : function () {}},
				_read : function () {},
				getBindings : function () {},
				resolve : function () {}
			},
			oMetadataMock = this.mock(oModel.oMetadata),
			oModelMock = this.mock(oModel),
			mParameters = {
				groupId : "~groupId",
				urlParameters : {
					$expand : "To0,To0/To1,To2",
					$select : "~select"
				}
			};

		oModelMock.expects("_read")
			.withExactArgs("", {
				context : "~oContext",
				error : sinon.match.func.and(sinon.match(function (fnError0) {
					fnError = fnError0;

					return true;
				})),
				groupId : "~groupId",
				success : sinon.match.func.and(sinon.match(function (fnSuccess0) {
					fnSuccess = fnSuccess0;

					return true;
				})),
				updateAggregatedMessages : true,
				urlParameters : sinon.match.same(mParameters.urlParameters)
			}, /*bSideEffect*/true);
		oModelMock.expects("resolve").withExactArgs("To0", "~oContext").returns("~resolved0");
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~resolved0").returns("~type0");
		oModelMock.expects("resolve").withExactArgs("To0/To1", "~oContext").returns("~resolved1");
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~resolved1").returns("~type1");
		oModelMock.expects("resolve").withExactArgs("To2", "~oContext").returns("~resolved2");
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("~resolved2")
			.returns(undefined);
		oModelMock.expects("getBindings").withExactArgs().returns(aBindings);
		this.mock(aBindings[0]).expects("isA")
			.withExactArgs("sap.ui.model.odata.v2.ODataListBinding")
			.returns(false);
		this.mock(aBindings[1]).expects("isA")
			.withExactArgs("sap.ui.model.odata.v2.ODataListBinding")
			.returns(true);
		this.mock(aBindings[1]).expects("_refreshForSideEffects")
			.withExactArgs(sinon.match.set.deepEquals(new Set(["~type0", "~type1", undefined])), "~groupId")
			.returns(false);

		// code under test
		oResult = ODataModel.prototype.requestSideEffects.call(oModel, "~oContext", mParameters);

		assert.ok(oResult instanceof Promise);

		if (bSuccess) {
			fnSuccess("~oData", "~oResponse");
		} else {
			fnError("~oError");
		}

		return oResult.then(function (oResult) {
				assert.ok(bSuccess);
				assert.deepEqual(oResult, []);
			}, function (oError) {
				assert.ok(!bSuccess);
				assert.strictEqual(oError, "~oError");
			});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: resolves with affected bindings", function (assert) {
		var oResult, fnSuccess,
			aBindings = [
				{isA : function () {}},
				{_refreshForSideEffects : function () {}, isA : function () {}}
			],
			oModel = {
				oMetadata : {_getEntityTypeByPath : function () {}},
				_read : function () {},
				getBindings : function () {},
				resolve : function () {}
			},
			oMetadataMock = this.mock(oModel.oMetadata),
			oModelMock = this.mock(oModel),
			mParameters = {
				groupId : "~groupId",
				urlParameters : {
					$expand : "To0,To0/To1,To2",
					$select : "~select"
				}
			};

		oModelMock.expects("_read")
			.withExactArgs("", {
				context : "~oContext",
				error : sinon.match.func,
				groupId : "~groupId",
				success : sinon.match.func.and(sinon.match(function (fnSuccess0) {
					fnSuccess = fnSuccess0;

					return true;
				})),
				updateAggregatedMessages : true,
				urlParameters : sinon.match.same(mParameters.urlParameters)
			}, /*bSideEffect*/true);
		oModelMock.expects("resolve").withExactArgs("To0", "~oContext").returns("~resolved0");
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~resolved0").returns("~type0");
		oModelMock.expects("resolve").withExactArgs("To0/To1", "~oContext").returns("~resolved1");
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~resolved1").returns("~type1");
		oModelMock.expects("resolve").withExactArgs("To2", "~oContext").returns("~resolved2");
		oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("~resolved2").returns(undefined);
		oModelMock.expects("getBindings").withExactArgs().returns(aBindings);
		this.mock(aBindings[0]).expects("isA").withExactArgs("sap.ui.model.odata.v2.ODataListBinding").returns(false);
		this.mock(aBindings[1]).expects("isA").withExactArgs("sap.ui.model.odata.v2.ODataListBinding").returns(true);
		this.mock(aBindings[1]).expects("_refreshForSideEffects")
			.withExactArgs(sinon.match.set.deepEquals(new Set(["~type0", "~type1", undefined])), "~groupId")
			.returns(true);

		// code under test
		oResult = ODataModel.prototype.requestSideEffects.call(oModel, "~oContext", mParameters);

		assert.ok(oResult instanceof Promise);

		fnSuccess("~oData", "~oResponse");

		return oResult.then(function (oResult) {assert.deepEqual(oResult, [aBindings[1]]);});
	});

	//*********************************************************************************************
[{
	mParameters : undefined
}, {
	mParameters : {}
}, {
	mParameters : {
		urlParameters : {$select : "~select"}
	},
	mExpectsUrlParams : {$select : "~select"}
}, {
	mParameters : {
		urlParameters : {$expand : ""}
	},
	mExpectsUrlParams : {$expand : ""}
}].forEach(function (oFixture, i) {
	QUnit.test("requestSideEffects: parameters checked and passed #" + i, function (assert) {
		var oModel = {_read : function () {}};

		this.mock(oModel).expects("_read")
			.withExactArgs("", {
				context : "~oContext",
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : true,
				urlParameters : oFixture.mExpectsUrlParams
			}, /*bSideEffect*/true);

		// code under test
		ODataModel.prototype.requestSideEffects.call(oModel, "~oContext", oFixture.mParameters);
	});
});

	//*********************************************************************************************
[
	"batchGroupId", "changeSetId", "context", "error", "filters", "foo", "sorters", "success",
	"updateAggregatedMessages"
].forEach(function (sParameter) {
	[sParameter, undefined, null, 42, function () {}].forEach(function (vParameterValue) {
	var sTitle = "requestSideEffects: unsupported parameters: " + sParameter + "="
			+ vParameterValue;

	QUnit.test(sTitle, function (assert) {
		var mParameters = {};

		mParameters[sParameter] = vParameterValue;

		assert.throws(function () {
			// code under test
			ODataModel.prototype.requestSideEffects.call({/*oModel*/}, "~oContext", mParameters);
		}, new Error("Parameter '" + sParameter + "' is not supported"));
	});
	});
});

	//*********************************************************************************************
	QUnit.test("read delegates to _read", function (assert) {
		var oModel = {_read : function () {}};

		this.mock(oModel).expects("_read")
			.withExactArgs("~sPath", "~mParameters")
			.returns("~oResult");

		// code under test
		assert.strictEqual(ODataModel.prototype.read.call(oModel, "~sPath", "~mParameters", "foo"),
			"~oResult");
	});

	//*********************************************************************************************
	QUnit.test("getProperty: propagate _getObject error", function (assert) {
		var oError = new Error("~Error"),
			oModel = {_getObject : function () {}};

		this.mock(oModel).expects("_getObject")
			.withExactArgs("@$ui5.~annotation", "~oContext")
			.throws(oError);

		// code under test
		assert.throws(function() {
				ODataModel.prototype.getProperty.call(oModel, "@$ui5.~annotation", "~oContext");
			}, oError);
	});

	//*********************************************************************************************
[
	{entity : {}, result : true},
	{entity : {__metadata : "foo"}, result : true},
	{entity : {prop : "bar"}, result : false},
	{entity : {__metadata : "foo", prop : "bar"}, result : false}
].forEach(function (oFixture, i) {
	QUnit.test("_isChangedEntityEmpty: #" + i, function (assert) {
		// code under test
		assert.strictEqual(ODataModel._isChangedEntityEmpty(oFixture.entity), oFixture.result);
	});
});

	//*********************************************************************************************
[{
	created : false,
	deepPath : "/Bar(42)/To1",
	newEntityKey : "Foo(0)",
	resultDeepPath : "/Bar(42)/To1"
}, {
	created : true,
	deepPath : "/Bar(42)/To1",
	newEntityKey : "Foo(0)",
	resultDeepPath : "/Bar(42)/To1"
}, {
	created : false,
	deepPath : "/Foo(id-0-0)",
	newEntityKey : "Foo(0)",
	resultDeepPath : "/Foo(id-0-0)"
}, {
	created : true,
	deepPath : "/Foo(id-0-0)",
	newEntityKey : "Foo(0)",
	resultDeepPath : "/Foo(0)"
}, {
	created : true,
	deepPath : "/Bar(42)/ToN(id-0-0)",
	newEntityKey : "Foo(0)",
	resultDeepPath : "/Bar(42)/ToN(0)"
}, {
	created : true,
	deepPath : "/Bar(42)/ToN(id-0-0)",
	newEntityKey : "Foo('A(0)')",
	resultDeepPath : "/Bar(42)/ToN('A(0)')"
}].forEach(function (oFixture, i) {
	QUnit.test("_cleanupAfterCreate: " + i, function (assert) {
		var fnCallAfterUpdate, mExpectedChangedEntities,
			oContext = {
				isTransient : function () {},
				setUpdated : function () {}
			},
			oContextMock = this.mock(oContext),
			oEntity = {__metadata : {deepPath : "deepPath"}},
			oHelperMock = this.mock(_Helper),
			oModel = {
				mChangedEntities : {
					key0 : {prop0 : "A", prop1 : "B"},
					key1 : {prop0 : "A", prop1 : "B", prop2 : {k0 : "p0"}, toNav : "nav"}
				},
				oMetadata : {
					_getEntityTypeByPath : function () {},
					_getNavigationPropertyNames : function () {}
				},
				_getEntity : function () {},
				_resolveGroup : function () {},
				_updateContext : function () {},
				abortInternalRequest : function () {},
				callAfterUpdate : function () {},
				getContext : function () {}

			},
			oModelMock = this.mock(oModel),
			oRequest = {
				data : {prop0 : "A", prop1 : "_B", prop2 : {k0 : "p0"}, toNav : "_nav"},
				deepPath : oFixture.deepPath,
				key : "key1"
			};

		oModelMock.expects("getContext").withExactArgs("/key1").returns(oContext);
		oModelMock.expects("_getEntity").withExactArgs(oFixture.newEntityKey).returns(oEntity);
		oContextMock.expects("isTransient").withExactArgs().returns(oFixture.created);
		oModelMock.expects("_updateContext")
			.withExactArgs(sinon.match.same(oContext), "/" + oFixture.newEntityKey,
				oFixture.resultDeepPath);
		oContextMock.expects("setUpdated").withExactArgs(true);
		oModelMock.expects("callAfterUpdate").withExactArgs(sinon.match.func)
			.callsFake(function (fn) {fnCallAfterUpdate = fn;});
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs(oFixture.newEntityKey)
			.returns("~entityType");
		this.mock(oModel.oMetadata).expects("_getNavigationPropertyNames")
			.withExactArgs("~entityType")
			.returns(["toNav"]);
		oHelperMock.expects("merge")
			.withExactArgs({}, sinon.match.same(oModel.mChangedEntities.key1))
			.returns({prop0 : "A", prop1 : "B", prop2 : {k0 : "p0"}, toNav : "nav"});
		oHelperMock.expects("merge")
			.withExactArgs({}, sinon.match.same(oEntity.__metadata))
			.returns({deepPath : "~deepPath"});
		oHelperMock.expects("deepEqual").withExactArgs("A", "A").returns(true);
		oHelperMock.expects("deepEqual").withExactArgs("_B", "B").returns(false);
		oHelperMock.expects("deepEqual").withExactArgs({k0 : "p0"}, {k0 : "p0"}).returns(true);
		oHelperMock.expects("deepEqual").withExactArgs("_nav", "nav").returns(false);
		oModelMock.expects("_resolveGroup").withExactArgs("key1").returns({groupId : "~groupId"});
		oModelMock.expects("abortInternalRequest").withExactArgs("~groupId", {requestKey : "key1"});

		// code under test
		ODataModel.prototype._cleanupAfterCreate.call(oModel, oRequest, oFixture.newEntityKey);

		mExpectedChangedEntities = {
			key0 : {prop0 : "A", prop1 : "B"},
			key1 : {prop0 : "A", prop1 : "B", prop2 : {k0 : "p0"}, toNav : "nav"}
		};
		mExpectedChangedEntities[oFixture.newEntityKey] = {
			__metadata : {deepPath : oFixture.resultDeepPath},
			prop1 : "B"
		};
		assert.deepEqual(oModel.mChangedEntities, mExpectedChangedEntities);
		assert.notStrictEqual(oModel.mChangedEntities[oFixture.newEntityKey].__metadata,
			oEntity.__metadata);
		assert.strictEqual(oRequest.deepPath, oFixture.resultDeepPath);

		oContextMock.expects("setUpdated").withExactArgs(false);

		// code under test
		fnCallAfterUpdate();
	});
});

	//*********************************************************************************************
	QUnit.test("_cleanupAfterCreate: no matching changed entity", function (assert) {
		var oContext = {
				isTransient : function () {},
				setUpdated : function () {}
			},
			oEntity = {__metadata : {created : {}}},
			oModel = {
				mChangedEntities : {
					key0 : {prop0 : "A"}
				},
				_getEntity : function () {},
				_updateContext : function () {},
				callAfterUpdate : function () {},
				getContext : function () {}
			},
			oModelMock = this.mock(oModel),
			oRequest = {deepPath : "newDeepPath", key : "key1"};

		oModelMock.expects("getContext").withExactArgs("/key1").returns(oContext);
		oModelMock.expects("_getEntity").withExactArgs("newKey").returns(oEntity);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
		oModelMock.expects("_updateContext")
			.withExactArgs(sinon.match.same(oContext), "/newKey", "newDeepPath");
		this.mock(oContext).expects("setUpdated").withExactArgs(true);
		oModelMock.expects("callAfterUpdate").withExactArgs(sinon.match.func);

		// code under test
		ODataModel.prototype._cleanupAfterCreate.call(oModel, oRequest, "newKey");

		assert.deepEqual(oModel.mChangedEntities, {key0 : {prop0 : "A"}});
		assert.deepEqual(oEntity, {__metadata : {}});
	});

	//*********************************************************************************************
[undefined, {}, {__metadata : undefined}, {__metadata : {}}].forEach(function (oData, i) {
	QUnit.test("_resolveGroup: no group found #" + i, function (assert) {
		var oModel = {
				mChangeGroups : {/*no default group set*/},
				oMetadata : {_getEntityTypeByPath : function () {}},
				_getObject : function () {}
			};

		this.mock(oModel).expects("_getObject").withExactArgs("/~key").returns(oData);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~key")
			.returns({name : "foo"});

		// code under test
		assert.deepEqual(
			ODataModel.prototype._resolveGroup.call(oModel, "/~key"),
			{groupId: undefined, changeSetId: undefined});
	});
});

	//*********************************************************************************************
["/~key", "~key"].forEach(function (sKeyOrPath) {
	QUnit.test("_resolveGroup: sKeyOrPath defaulting (" + sKeyOrPath + ")", function (assert) {
		var oModel = {
				mChangeGroups : {/*no default group set*/},
				oMetadata : {_getEntityTypeByPath : function () {}},
				_getObject : function () {}
			};

		this.mock(oModel).expects("_getObject").withExactArgs("/~key").returns(undefined);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~key")
			.returns({name : "foo"});

		// code under test
		assert.deepEqual(
			ODataModel.prototype._resolveGroup.call(oModel, sKeyOrPath),
			// groupId not relevant for test scenario
			{groupId: undefined, changeSetId: undefined});
	});
});

	//*********************************************************************************************
	QUnit.test("_resolveGroup: resolved from created entry", function (assert) {
		var oModel = {_getObject : function () {}};

		this.mock(oModel).expects("_getObject")
			.withExactArgs("/~key")
			.returns({__metadata : {created : {groupId: "~groupId", changeSetId: "~changeSetId"}}});

		// code under test
		assert.deepEqual(
			ODataModel.prototype._resolveGroup.call(oModel, "/~key"),
			{groupId: "~groupId", changeSetId: "~changeSetId"});
	});

	//*********************************************************************************************
[{
	entityTypeName : "~anyType",
	result : {changeSetId : "changeSet0", groupId : "group0"}
}, {
	entityTypeName : "~type",
	result : {changeSetId : "changeSet1", groupId : "group1"}
}].forEach(function (oFixture) {
	[false, true].forEach(function (bSingleMode) {
	var sTitle = "_resolveGroup: resolved from mChangeGroups; entity type = "
			+ oFixture.entityTypeName + "; single mode = " + bSingleMode;

	QUnit.test(sTitle, function (assert) {
		var oModel = {
				mChangeGroups : {
					"*" : {changeSetId : "changeSet0", groupId : "group0", single : bSingleMode},
					"~type" : {changeSetId : "changeSet1", groupId : "group1", single : bSingleMode}
				},
				oMetadata : {_getEntityTypeByPath : function () {}},
				_getObject : function () {}
			},
			oResult;

		this.mock(oModel).expects("_getObject").withExactArgs("/~key").returns(undefined);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("/~key")
			.returns({name : oFixture.entityTypeName});

		// code under test
		oResult = ODataModel.prototype._resolveGroup.call(oModel, "/~key");

		if (bSingleMode) {
			assert.strictEqual(oResult.groupId, oFixture.result.groupId);
			assert.ok(oResult.changeSetId.startsWith("id-"));
		} else {
			assert.deepEqual(oResult, oFixture.result);
		}
	});
	});
});

	//*********************************************************************************************
[{
	bAll : false,
	mChangedEntities : {},
	iPendingDeferredRequests : 42,
	bResult : false
}, {
	bAll : false,
	mChangedEntities : {foo : "bar"},
	iPendingDeferredRequests : undefined, // not relevant
	bResult : true
}, {
	bAll : true,
	mChangedEntities : {},
	iPendingDeferredRequests : 0,
	bResult : false
}, {
	bAll : true,
	mChangedEntities : {},
	iPendingDeferredRequests : 1,
	bResult : true
}, {
	bAll : true,
	mChangedEntities : {foo : "bar"},
	iPendingDeferredRequests : 0,
	bResult : true
}].forEach(function (oFixture, i) {
	QUnit.test("hasPendingChanges: #" + i, function (assert) {
		var oModel = {
				mChangedEntities : oFixture.mChangedEntities,
				iPendingDeferredRequests : oFixture.iPendingDeferredRequests,
				getBindings : function () {}
			};

		this.mock(oModel).expects("getBindings").withExactArgs().returns([]);

		// code under test
		assert.deepEqual(
			ODataModel.prototype.hasPendingChanges.call(oModel, oFixture.bAll),
			oFixture.bResult);
	});
});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges: oBinding._hasPendingChanges returns true", function (assert) {
		var oBinding1 = {_hasPendingChanges : function () {}},
			oBinding2 = {_hasPendingChanges : function () {}},
			aBindings = [{/*oBinding0*/}, oBinding1, oBinding2],
			oModel = {
				mChangedEntities : {},
				getBindings : function () {}
			};

		this.mock(oModel).expects("getBindings").withExactArgs().returns(aBindings);
		this.mock(oBinding1).expects("_hasPendingChanges").withExactArgs([]).returns(true);
		this.mock(oBinding2).expects("_hasPendingChanges").never();

		// code under test
		assert.deepEqual(ODataModel.prototype.hasPendingChanges.call(oModel), true);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges: oBinding._hasPendingChanges returns false", function (assert) {
		var oBinding = {_hasPendingChanges : function () {}},
			oModel = {
				mChangedEntities : {foo : {}},
				getBindings : function () {}
			};

		this.mock(oModel).expects("getBindings").withExactArgs().returns([oBinding]);
		this.mock(oBinding).expects("_hasPendingChanges")
			.withExactArgs(["foo"])
			.callsFake(function (aChangedEntityKeys) {
				aChangedEntityKeys.pop();

				return false;
			});

		// code under test
		assert.deepEqual(ODataModel.prototype.hasPendingChanges.call(oModel), false);
	});

	//*********************************************************************************************
	QUnit.test("getPendingChanges", function (assert) {
		var oBinding1 = {_getPendingChanges : function () {}},
			mChangedEntitiesCopy = {},
			oHelperMock = this.mock(_Helper),
			oModel = {
				mChangedEntities : "~changedEntities",
				getBindings : function () {}
			};

		oHelperMock.expects("merge")
			.withExactArgs({}, "~changedEntities")
			.returns(mChangedEntitiesCopy);
		this.mock(oModel).expects("getBindings")
			.withExactArgs()
			.returns([{/*oBinding0*/}, oBinding1]);
		this.mock(oBinding1).expects("_getPendingChanges")
			.withExactArgs()
			.returns("~changedTreeEntities");
		oHelperMock.expects("merge")
			.withExactArgs(sinon.match.same(mChangedEntitiesCopy), "~changedTreeEntities")
			.callsFake(function (mChangedEntitiesCopy0) {
				mChangedEntitiesCopy0.foo = "bar";
				mChangedEntitiesCopy0.baz = null;
			});

		// code under test
		assert.deepEqual(ODataModel.prototype.getPendingChanges.call(oModel), {foo : "bar"});
	});

	//*********************************************************************************************
	QUnit.test("_addSubEntitiesToPayload", function (assert) {
		var oContextBusinessPartner = createContext(),
			oContextContact0 = createContext(),
			oContextContact1 = createContext(),
			oContextLineItem0 = createContext(),
			oContextLineItem1 = createContext(),
			oContextProduct = createContext(),
			oContextSalesOrder = createContext(),
			oHelperMock = this.mock(_Helper),
			oModel = {
				_getObject : function () {},
				// allow recursive calls within _addSubEntitiesToPayload
				_addSubEntitiesToPayload : ODataModel.prototype._addSubEntitiesToPayload
			},
			oModelMock = this.mock(oModel),
			oPayload = {__metadata : "~metadata-SalesOrder", key : "SalesOrder"},
			that = this;

		function createContext() {
			return {getPath : function () {}, getSubContexts : function () {}};
		}

		function expectContextAccess(oContext, sEntityKey) {
			var oEntity = {__metadata : "~metadata-" + sEntityKey, key : sEntityKey},
				sPath = "/~" + sEntityKey;

			that.mock(oContext).expects("getPath").withExactArgs().returns(sPath);
			oModelMock.expects("_getObject").withExactArgs(sPath).returns(oEntity);
			oHelperMock.expects("merge").withExactArgs({}, sinon.match.same(oEntity)).callThrough();
		}

		this.mock(oContextSalesOrder).expects("getSubContexts")
			.withExactArgs()
			.returns({
				toBusinessPartner : oContextBusinessPartner,
				toLineItems : [oContextLineItem0, oContextLineItem1]
			});
		expectContextAccess(oContextBusinessPartner, "BusinessPartner");
		this.mock(oContextBusinessPartner).expects("getSubContexts")
			.withExactArgs()
			.returns({toContacts : [oContextContact0, oContextContact1]});
		expectContextAccess(oContextContact0, "Contact0");
		this.mock(oContextContact0).expects("getSubContexts").withExactArgs().returns();
		expectContextAccess(oContextContact1, "Contact1");
		this.mock(oContextContact1).expects("getSubContexts").withExactArgs().returns();
		expectContextAccess(oContextLineItem0, "LineItem0");
		this.mock(oContextLineItem0).expects("getSubContexts")
			.withExactArgs()
			.returns({toProduct : oContextProduct});
		expectContextAccess(oContextProduct, "Product");
		this.mock(oContextProduct).expects("getSubContexts").withExactArgs().returns();
		expectContextAccess(oContextLineItem1, "LineItem1");
		this.mock(oContextLineItem1).expects("getSubContexts").withExactArgs().returns();

		// code under test
		ODataModel.prototype._addSubEntitiesToPayload.call(oModel, oContextSalesOrder, oPayload);

		assert.deepEqual(oPayload, {
			__metadata : "~metadata-SalesOrder",
			key : "SalesOrder",
			toBusinessPartner : {
				key : "BusinessPartner",
				toContacts : [
					{key : "Contact0"},
					{key : "Contact1"}
				]
			},
			toLineItems : [
				{
					key : "LineItem0",
					toProduct : {key : "Product"}
				},
				{key : "LineItem1"}
			]
		});
	});

	//*********************************************************************************************
	QUnit.test("_isTransitionMessagesOnly", function (assert) {
		var oModel = {oTransitionMessagesOnlyGroups: new Set(["~group"])};

		// code under test
		assert.strictEqual(ODataModel.prototype._isTransitionMessagesOnly.call(oModel, "~group"), true);
		assert.strictEqual(ODataModel.prototype._isTransitionMessagesOnly.call(oModel, "~group2"), false);
	});

	//*********************************************************************************************
	QUnit.test("setTransitionMessagesOnlyForGroup", function (assert) {
		var oModel = {oTransitionMessagesOnlyGroups: new Set()};

		// code under test
		ODataModel.prototype.setTransitionMessagesOnlyForGroup.call(oModel, "~group", true);

		assert.ok(oModel.oTransitionMessagesOnlyGroups.has("~group"));
		assert.strictEqual(oModel.oTransitionMessagesOnlyGroups.size, 1);

		// code under test
		ODataModel.prototype.setTransitionMessagesOnlyForGroup.call(oModel, "~group", false);

		assert.notOk(oModel.oTransitionMessagesOnlyGroups.has("~group"));
		assert.strictEqual(oModel.oTransitionMessagesOnlyGroups.size, 0);
	});

	//*********************************************************************************************
[{
	annotationURI : undefined,
	cacheKey : "~metadataUrl#annotations",
	ignoreAnnotationsFromMetadata : false
}, {
	annotationURI : "~annotationURI",
	cacheKey : "~metadataUrl#annotations_~annotationURI#annotations",
	ignoreAnnotationsFromMetadata : false
}, {
	annotationURI : undefined,
	cacheKey : undefined,
	ignoreAnnotationsFromMetadata : true
}, {
	annotationURI : "~annotationURI",
	cacheKey : "~annotationURI#annotations",
	ignoreAnnotationsFromMetadata : true
}].forEach(function (oFixture, i) {
	QUnit.test("_getAnnotationCacheKey, with ignoreAnnotationsFromMetadata, " + i, function (assert) {
		var oModel = {
				sAnnotationURI : oFixture.annotationURI,
				bIgnoreAnnotationsFromMetadata : oFixture.ignoreAnnotationsFromMetadata,
				bSkipMetadataAnnotationParsing : false,
				bUseCache : true
			};

		// code under test
		assert.strictEqual(ODataModel.prototype._getAnnotationCacheKey.call(oModel, "~metadataUrl"),
			oFixture.cacheKey);
	});
});

	//*********************************************************************************************
	QUnit.test("getReporter", function (assert) {
		var fnCatchHandler,
			oModel = {
				_handleError : function () {}
			};

		// code under test
		fnCatchHandler = ODataModel.prototype.getReporter.call(oModel, "~reporter");

		this.mock(oModel).expects("_handleError").withExactArgs("~oError", undefined, "~reporter");

		// code under test
		fnCatchHandler("~oError");
	});

	//*********************************************************************************************
[{
	parameters: undefined,
	expectedIsCanonicalRequestNeededParam: undefined,
	expectedPath: "~path"
}, {
	parameters: null,
	expectedIsCanonicalRequestNeededParam: undefined,
	expectedPath: "~path"
}, {
	parameters: {},
	expectedIsCanonicalRequestNeededParam: undefined,
	expectedPath: "~path"
}, {
	parameters: {canonicalRequest: false},
	expectedIsCanonicalRequestNeededParam: false,
	expectedPath: "~path"
}, {
	parameters: {canonicalRequest: true},
	expectedIsCanonicalRequestNeededParam: true,
	resolvedPath: undefined,
	expectedPath: "~path"
}, {
	parameters: {canonicalRequest: true},
	expectedIsCanonicalRequestNeededParam: true,
	resolvedPath: "~canonicalPath",
	expectedPath: "~canonicalPath"
}].forEach(function (oFixture, i) {
	QUnit.test("_isReloadNeeded: canonicalRequest can affect sPath #" + i, function (assert) {
		var oModel = {
				oMetadata: {
					_getEntityTypeByPath: function () {},
					isLoaded: function () {}
				},
				_isCanonicalRequestNeeded: function () {},
				_isCreatedEntity: function () {},
				_getObject: function () {},
				resolve: function () {}
			};

		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oModel).expects("_isCanonicalRequestNeeded")
			.withExactArgs(oFixture.expectedIsCanonicalRequestNeededParam)
			.returns(!!oFixture.resolvedPath);
		this.mock(oModel).expects("resolve")
			.withExactArgs("~path", undefined, true)
			.exactly(oFixture.resolvedPath ? 1 : 0)
			.returns(oFixture.resolvedPath);
		this.mock(oModel).expects("_getObject").withExactArgs(oFixture.expectedPath).returns(/*not relevant*/undefined);
		this.mock(oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs(oFixture.expectedPath)
			.returns(/*not relevant*/undefined);
		this.mock(oModel).expects("_isCreatedEntity").withExactArgs(undefined).returns(false);

		// code under test
		ODataModel.prototype._isReloadNeeded.call(oModel, "~path", oFixture.parameters);
	});
});

	//*********************************************************************************************
	QUnit.test("getForeignKeysFromReferentialConstraints: no navigation property", function (assert) {
		const oMetadata = {_splitByLastNavigationProperty() {}};
		const oModel = {oMetadata: oMetadata};
		this.mock(oMetadata).expects("_splitByLastNavigationProperty")
			.withExactArgs("~sNormalizedPath")
			.returns({lastNavigationProperty: ""});

		// code under test
		assert.deepEqual(
			ODataModel.prototype.getForeignKeysFromReferentialConstraints.call(oModel, "~sNormalizedPath"),
			{});
	});

	//*********************************************************************************************
[
	{oData: undefined, oResult: {}},
	{oData: {a: 42, c: "foo", y: 13, z: "bar"}, oResult: {x: 42, z: "foo"}}
].forEach((oFixture, i) => {
	QUnit.test("getForeignKeysFromReferentialConstraints: with navigation property, #" + i, function (assert) {
		const oMetadata = {
			_getEntityTypeByName() {},
			_getReferentialConstraintsMapping() {},
			_splitByLastNavigationProperty() {}
		};
		const oModel = {
			oMetadata: oMetadata,
			_getObject() {}
		};
		this.mock(oMetadata).expects("_splitByLastNavigationProperty")
			.withExactArgs("~sNormalizedPath")
			.returns({
				lastNavigationProperty: "/~lastNavigationProperty",
				pathBeforeLastNavigationProperty: "~pathBeforeLastNavigationProperty"
			});
		this.mock(oMetadata).expects("_getEntityTypeByName")
			.withExactArgs("~pathBeforeLastNavigationProperty")
			.returns("~oSourceEntityType");
		this.mock(oMetadata).expects("_getReferentialConstraintsMapping")
			.withExactArgs("~oSourceEntityType", "~lastNavigationProperty")
			.returns({a: "x", b: "y", c: "z"});
		this.mock(oModel).expects("_getObject").withExactArgs("~pathBeforeLastNavigationProperty")
			.returns(oFixture.oData);

		// code under test
		assert.deepEqual(
			ODataModel.prototype.getForeignKeysFromReferentialConstraints.call(oModel, "~sNormalizedPath"),
			oFixture.oResult);
	});
});
	/** @deprecated As of version 1.32.0 */
	//*********************************************************************************************
	QUnit.test("setDeferredBatchGroups", function (assert) {
		const oModel = {setDeferredGroups() {}};

		this.mock(oModel).expects("setDeferredGroups").withExactArgs("~mParameters");

		// code under test
		ODataModel.prototype.setDeferredBatchGroups.call(oModel, "~mParameters");
	});
	/** @deprecated As of version 1.32.0 */
	//*********************************************************************************************
	QUnit.test("setChangeBatchGroups", function (assert) {
		const oModel = {setChangeGroups() {}};

		this.mock(oModel).expects("setChangeGroups")
			.withExactArgs({"*" : {batchGroupId : "~groupId", groupId: "~groupId"}});

		// code under test
		ODataModel.prototype.setChangeBatchGroups.call(oModel, {"*" : {batchGroupId : "~groupId"}});
	});
});