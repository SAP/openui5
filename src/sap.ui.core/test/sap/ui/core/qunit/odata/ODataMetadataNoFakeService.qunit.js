/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/datajs"
], function (Log, ODataMetadata, TestUtils, OData) {
	/*global QUnit, sinon*/
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.ODataMetadata";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMetadata (ODataMetadataNoFakeService)", {
		beforeEach : function () {
			var oLoadMetadataStub = this.stub(ODataMetadata.prototype, "_loadMetadata");

			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// Stub ODataMetadata so that the constructor can be called w/o cachekey
			// With cachekey also the CacheManager needs to be stubbed.
			oLoadMetadataStub.callsFake(function () {
				return new Promise(function () {});
			});
			this.sUrl = "/some/url";
			this.oMetadata = new ODataMetadata(this.sUrl, {});
			oLoadMetadataStub.restore();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
[true, false].forEach(function (bResolve) {
	var sTitle = "pLoadedWithReject: metadata loading " + ( bResolve ? "successful" : "failed" );

	QUnit.test(sTitle, function (assert) {
		var oHandlers = {
				resolved : function () {},
				rejected : function () {}
			},
			oHandlersMock = this.mock(oHandlers);

		// test the behavior of the pLoadedWithReject promise created in the constructor
		assert.ok(this.oMetadata.pLoadedWithReject, "pLoadedWithReject promise exists");
		// check that the pLoaded promise has the correct behavior
		if (bResolve) {
			oHandlersMock.expects("resolved");
			oHandlersMock.expects("rejected").never();
			this.oMetadata.fnResolve();
		} else {
			oHandlersMock.expects("resolved").never();
			oHandlersMock.expects("rejected");
			this.oMetadata.fnReject();
		}
		return this.oMetadata.pLoadedWithReject.then(oHandlers.resolved, oHandlers.rejected);
	});
});

	//*********************************************************************************************
	QUnit.test("pLoaded resolves successfully", function (assert) {
		var oHandlers = {
				resolved : function () {},
				rejected : function () {}
			},
			oHandlersMock = this.mock(oHandlers);

		// test the behavior of the pLoaded promise created in the constructor
		assert.ok(this.oMetadata.pLoaded, "pLoaded promise exists");
		oHandlersMock.expects("resolved");
		oHandlersMock.expects("rejected").never();
		this.oMetadata.fnResolve();
		return this.oMetadata.pLoaded.then(oHandlers.resolved, oHandlers.rejected);
	});

	//*********************************************************************************************
	QUnit.test("pLoaded resolves successfully after reject", function (assert) {
		var that = this;

		// test the behavior of the pLoaded promise created in the constructor
		assert.ok(this.oMetadata.pLoaded, "pLoaded promise exists");
		this.oMetadata.fnReject();
		return this.oMetadata.pLoadedWithReject.catch(function () {
			that.oMetadata.fnResolve();
			return that.oMetadata.pLoaded;
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bReject) {
	var sTitle = "loaded returns " + ( bReject ? "pLoadedWithReject" : "pLoaded" );

	QUnit.test(sTitle, function (assert) {
		// code under test
		assert.strictEqual(this.oMetadata.loaded(bReject),
			bReject ? this.oMetadata.pLoadedWithReject : this.oMetadata.pLoaded);
	});
});

	//*********************************************************************************************
	QUnit.test("_handleLoaded calls fnResolve", function (assert) {
		var mResolvedParams = {entitySets : []};

		this.mock(this.oMetadata).expects("fnResolve").withExactArgs(mResolvedParams);

		// code under test
		this.oMetadata._handleLoaded({}, {}, /*bSuppressEvents*/true);
	});

	//*********************************************************************************************
	QUnit.test("_loadMetadata _handleError calls fnReject", function (assert) {
		var oError = {
				message : "Message",
				request : "Request",
				response : {
					statusCode : 503,
					statusText : "Status text",
					body : "Response body"
				}
			},
			oMetadataMock,
			oODataMock = this.mock(OData),
			oRequest = {};

		oError.statusCode = oError.response.statusCode;
		oError.statusText = oError.response.statusText;
		oError.responseText = oError.response.body;
		oMetadataMock = this.mock(this.oMetadata);
		oMetadataMock.expects("fnReject").withExactArgs(oError);
		oMetadataMock.expects("_createRequest").withExactArgs(this.sUrl).returns(oRequest);
		oODataMock.expects("request").callsFake(function (oRequest, fnHandleSuccess, fnHandleError, fnMetadata) {
			fnHandleError(oError);
			return {};
		});

		// code under test
		return this.oMetadata._loadMetadata(undefined, /*bSuppressEvents*/true).catch(function () {
			oODataMock.restore();
		});
	});

	//*********************************************************************************************
[{
	entitySet : {name : "~entitySetName"},
	entityType : {entityType : "namespace.entityType"},
	expectedLog : "Cannot determine keys of the entity type 'namespace.entityType' for the function"
		+ " import '~functionName'",
	result : "",
	resultCollection : ""
}, {
	entitySet : {name : "~entitySetName"},
	entityType : {key : {}, entityType : "namespace.entityType"},
	expectedLog : "Cannot determine keys of the entity type 'namespace.entityType' for the function"
		+ " import '~functionName'",
	result : "",
	resultCollection : ""
}, {
	entitySet : {name : "~entitySetName"},
	entityType : {
		key : {
			propertyRef : [{name : "property0"}]
		}
	},
	result : "/~entitySetName('1')",
	resultCollection : "/~entitySetName"
}, {
	entitySet : {name : "~entitySetName"},
	entityType : {
		key : {
			propertyRef : [{name : "property1"}]
		}
	},
	result : "/~entitySetName()", //TODO: is this a real use case?
	resultCollection : "/~entitySetName"
}, {
	entitySet : {name : "~entitySetName"},
	entityType : {
		key : {
			propertyRef : [{name : "property0"}, {name : "property1"}]
		}
	},
	result : "/~entitySetName(property0='1')",
	resultCollection : "/~entitySetName"
}, {
	entitySet : {name : "~entitySetName"},
	entityType : {
		key : {
			propertyRef : [{name : "property0"}, {name : "property2"}]
		}
	},
	result : "/~entitySetName(property0='1',property2=2)",
	resultCollection : "/~entitySetName"
}, {
	entitySet : undefined,
	entityType : {
		key : {
			propertyRef : [{name : "property0"}]
		}
	},
	expectedLog : "Cannot determine path of the entity set for the function import '~functionName'",
	result : "",
	resultCollection : ""
}, {
	entitySet : undefined,
	entityType : undefined,
	result : "",
	resultCollection : ""
}].forEach(function (oFixture, i) {
	[{ // action-for wins over entitySet and returnType
		entityTypeByName : "~entityTypeName",
		functionInfo : {
			entitySet : "~entitySet",
			extensions : [
				{name : "label", value : "foo"},
				{name : "action-for", value : "~entityTypeName"},
				{name : "bar", value : "baz"}
			],
			name : "~functionName",
			returnType : "~returnType"
		}
	}, { // entitySet wins over returnType
		entityTypeByPath : "~entitySet",
		functionInfo : {
			entitySet : "~entitySet",
			name : "~functionName",
			returnType : "~returnType"
		}
	}, { // use returnType
		entityTypeByName : "~returnType",
		functionInfo : {
			name : "~functionName",
			returnType : "~returnType"
		}
	}, { // use returnType with collection
		collection : true,
		entityTypeByName : "~returnType",
		functionInfo : {
			name : "~functionName",
			returnType : "Collection(~returnType)"
		}
	}].forEach(function (oFunctionInfoFixture, j) {
	QUnit.test("_getCanonicalPathOfFunctionImport: #" + i + "/" + j, function (assert) {
		var mFunctionParameters = {
				property0 : "'1'",
				property2 : "2"
			},
			oMetaDataMock = this.mock(this.oMetadata);

		oMetaDataMock.expects("_getEntityTypeByName")
			.withExactArgs(oFunctionInfoFixture.entityTypeByName)
			.exactly(oFunctionInfoFixture.entityTypeByName ? 1 : 0)
			.returns(oFixture.entityType);
		oMetaDataMock.expects("_getEntityTypeByPath")
			.withExactArgs(oFunctionInfoFixture.entityTypeByPath)
			.exactly(oFunctionInfoFixture.entityTypeByPath ? 1 : 0)
			.returns(oFixture.entityType);
		oMetaDataMock.expects("_getEntitySetByType")
			.withExactArgs(sinon.match.same(oFixture.entityType))
			.exactly(oFixture.entityType ? 1 : 0)
			.returns(oFixture.entitySet);
		this.oLogMock.expects("error")
			.withExactArgs(oFixture.expectedLog, sinon.match.same(this.oMetadata), sClassName)
			.exactly(oFixture.expectedLog ? 1 : 0);

		// code under test
		assert.strictEqual(
			this.oMetadata._getCanonicalPathOfFunctionImport(oFunctionInfoFixture.functionInfo,
				mFunctionParameters),
			oFunctionInfoFixture.collection ? oFixture.resultCollection : oFixture.result);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_getCanonicalPathOfFunctionImport: sFunctionReturnType = undefined",
		function (assert) {
			var mFunctionInfo = {name : "Foo"};

			// code under test
			assert.strictEqual(
				this.oMetadata._getCanonicalPathOfFunctionImport(mFunctionInfo, undefined), "");
	});

	//*********************************************************************************************
[
	{
		mFunctionInfo : undefined,
		expectedResult : false
	}, {
		mFunctionInfo : {},
		expectedResult : false
	}, {
		mFunctionInfo : {
			returnType : "~returnType"
		},
		expectedResult : false
	}, {
		mFunctionInfo : {
			returnType : "collection(~returnType)"
		},
		expectedResult : false
	}, {
		mFunctionInfo : {
			returnType : "Collection(~returnType)"
		},
		expectedResult : true
	}
].forEach(function (oFixture, i) {
	QUnit.test("_returnsCollection: #" + i, function (assert) {
		// code under test
		assert.strictEqual(ODataMetadata._returnsCollection(oFixture.mFunctionInfo),
			oFixture.expectedResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: no entity type given", function (assert) {
		// code under test
		assert.strictEqual(ODataMetadata.prototype._getPropertyMetadata.call(/*not relevant*/null), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: unknown type property", function (assert) {
		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(/*not relevant*/null, /*oEntityType*/{}, "~property"),
			undefined);
	});

	//*********************************************************************************************
["/~property" , "~property", "~property/", "/~property/"].forEach(function (sPath) {
	QUnit.test("_getPropertyMetadata: known type property, sPath=" + sPath, function (assert) {
		var oPropertyMetadata = {name: "~property", type: "Edm.String"},
			oEntityType = {
				property: [{name: "foo", type: "bar"}, oPropertyMetadata]
			},
			oResult;

		// code under test
		oResult = ODataMetadata.prototype._getPropertyMetadata.call(/*not relevant*/null, oEntityType, sPath);

		assert.strictEqual(oResult, oPropertyMetadata);
		assert.deepEqual(oResult, {name: "~property", type: "Edm.String"});
	});
});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: entity type property addressed via navigation properties", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {},
				_getPropertyMetadata: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns("~entityType0");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType0", "~nav1")
			.returns("~entityType1");
		oMetadataMock.expects("_getPropertyMetadata").withExactArgs("~entityType1", "~property")
			.returns("~oPropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~nav1/~property"),
			"~oPropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: first part is not a complex type, nav. property or property", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns(undefined);

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~property"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: path segment may be a complex type", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {},
				_getPropertyMetadata: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns("~entityType0");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType0", "~maybeComplex")
			.returns(undefined);
		oMetadataMock.expects("_getPropertyMetadata").withExactArgs("~entityType0", "~maybeComplex/~property")
			.returns("~recursiveCallResult");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~maybeComplex/~property"),
			"~recursiveCallResult");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: complex type property", function (assert) {
		var oMetadata = {
				_getObjectMetadata: function () {},
				_getPropertyMetadata: function () {},
				_splitName: function () {}
			},
			oEntityType = {property: [{name: "~complex", type: "~complexType"}]};

		this.mock(oMetadata).expects("_splitName").withExactArgs("~complexType")
			.returns({name: "~complexTypeName", namespace: "~namespace"});
		this.mock(oMetadata).expects("_getObjectMetadata")
			.withExactArgs("complexType", "~complexTypeName", "~namespace")
			.returns("~oComplexEntityType");
		this.mock(oMetadata).expects("_getPropertyMetadata").withExactArgs("~oComplexEntityType", "~property")
			.returns("~oComplexTypePropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~complex/~property"),
			"~oComplexTypePropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: nested complex type property", function (assert) {
		var oMetadata = {
				_getObjectMetadata: function () {},
				_getPropertyMetadata: function () {},
				_splitName: function () {}
			},
			oEntityType = {property: [{name: "~complex0", type: "~complexType0"}]};

		this.mock(oMetadata).expects("_splitName")
			.withExactArgs("~complexType0")
			.returns({name: "~complexType0Name", namespace: "~namespace"});
		this.mock(oMetadata).expects("_getObjectMetadata")
			.withExactArgs("complexType", "~complexType0Name", "~namespace")
			.returns("~oComplexType0");
		this.mock(oMetadata).expects("_getPropertyMetadata")
			.withExactArgs("~oComplexType0", "~complex1/~property")
			.returns("~oComplexTypePropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~complex0/~complex1/~property"),
			"~oComplexTypePropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: complex type property addressed via navigation properties", function (assert) {
		var oMetadata = {
				_getEntityTypeByNavProperty: function () {},
				_getPropertyMetadata: function () {}
			},
			oMetadataMock = this.mock(oMetadata),
			oEntityType = {property: []};

		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(sinon.match.same(oEntityType), "~nav0")
			.returns("~entityType0");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType0", "~nav1")
			.returns("~entityType1");
		oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs("~entityType1", "~complex")
			.returns(undefined);
		oMetadataMock.expects("_getPropertyMetadata").withExactArgs("~entityType1", "~complex/~property")
			.returns("~oComplexTypePropertyMetadata");

		// code under test
		assert.strictEqual(
			ODataMetadata.prototype._getPropertyMetadata.call(oMetadata, oEntityType, "~nav0/~nav1/~complex/~property"),
			"~oComplexTypePropertyMetadata");
	});

	//*********************************************************************************************
	QUnit.test("_getPropertyMetadata: with metadata path", function (assert) {
		var oPropertyMetadata = {name: "~property", type: "Edm.String"},
			oEntityType = {
				property: [oPropertyMetadata]
			},
			oResult;

		// code under test
		oResult = ODataMetadata.prototype._getPropertyMetadata.call({}, oEntityType, "~property/@sap:label");

		assert.strictEqual(oResult, oPropertyMetadata);
		assert.deepEqual(oResult, {name: "~property", type: "Edm.String"});
	});
});