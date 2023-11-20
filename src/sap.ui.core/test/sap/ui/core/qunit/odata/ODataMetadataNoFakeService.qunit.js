/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/_ODataMetaModelUtils",
	"sap/ui/model/odata/AnnotationParser",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/thirdparty/datajs"
], function (Log, _ODataMetaModelUtils, AnnotationParser, ODataMetadata, OData) {
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
				return Promise.resolve();
			});
			this.sUrl = "/some/url";
			this.oMetadata = new ODataMetadata(this.sUrl, {});
			oLoadMetadataStub.restore();
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
	QUnit.test("constructor: with predefined metadata", function (assert) {
		const pMetadataLoaded = Promise.resolve();
		this.mock(ODataMetadata.prototype).expects("_loadMetadata").withExactArgs().returns(pMetadataLoaded);

		// code under test
		const oMetadata = new ODataMetadata("~url", {metadata : "~metadata"});

		assert.strictEqual(oMetadata.sMetadata, "~metadata");

		return pMetadataLoaded;
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
		return this.oMetadata._loadMetadata(undefined, /*bSuppressEvents*/true).catch(function (oResult) {
			assert.strictEqual(oResult.message, "Message");
			assert.strictEqual(oResult.request, "Request");
			assert.strictEqual(oResult.response, oError.response);
			assert.strictEqual(oResult.responseText, "Response body");
			assert.strictEqual(oResult.statusCode, 503);
			assert.strictEqual(oResult.statusText, "Status text");
		});
	});

	//*********************************************************************************************
	QUnit.test("_loadMetadata: process metadata from string", function (assert) {
		this.oMetadata.sMetadata = "~XMLmetadata"; // metadata constructed from string
		const oMetadataMock = this.mock(this.oMetadata);
		oMetadataMock.expects("_createRequest").never();
		const oResponse = {
			headers : {"Content-Type" : "application/xml"},
			body : "~XMLmetadata"
		};
		this.mock(OData.metadataHandler).expects("read").withExactArgs(oResponse, {}).callsFake((oResponse) => {
			oResponse.data = {dataServices : {}};
		});
		oMetadataMock.expects("_handleLoaded")
			.withExactArgs({dataServices : {}}, {metadataString : "~XMLmetadata"} ,true).callThrough();

		// code under test
		return this.oMetadata._loadMetadata(undefined, /*bSuppressEvents*/true).then((mParams) => {
			assert.strictEqual(mParams.metadataString, "~XMLmetadata");
			assert.deepEqual(this.oMetadata.oMetadata, {dataServices : {}});
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
			propertyRef : [{name : "property3"}]
		}
	},
	result : "/~entitySetName(datetime'2022-06-16T10%3A30%3A00')", // values are encoded
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
	entitySet : {name : "~entitySetName"},
	entityType : {
		key : {
			propertyRef : [{name : "property0"}, {name : "property3"}]
		}
	},
	// values are encoded
	result : "/~entitySetName(property0='1',property3=datetime'2022-06-16T10%3A30%3A00')",
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
				property2 : "2",
				property3 : "datetime'2022-06-16T10:30:00'"
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
[{
	getEntityTypeByPathParameter : "/SalesOrderSet",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {/*not relevant*/}},
	path : "/SalesOrderSet",
	result : {
		addressable : true,
		lastNavigationProperty : "",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/SalesOrderSet"
	}
}, {
	getEntityTypeByPathParameter : "/SalesOrderSet('1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {/*not relevant*/}},
	path : "/SalesOrderSet('1')",
	result : {
		addressable : true,
		lastNavigationProperty : "",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
	}
}, {
	getEntityTypeByNavPropertyResult : {__navigationPropertiesMap : {/*not relevant*/}},
	getEntityTypeByNavPropertySegment : "ToLineItems",
	getEntityTypeByPathParameter : "/SalesOrderSet('1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {ToLineItems : {/*not relevant*/}}},
	path : "/SalesOrderSet('1')/ToLineItems",
	result : {
		addressable : "~addressable",
		lastNavigationProperty : "/ToLineItems",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
	}
}, {
	getEntityTypeByPathParameter : "/BusinessPartnerSet('BP1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {/*Address is a complex type*/}},
	path : "/BusinessPartnerSet('BP1')/Address",
	result : {
		addressable : true,
		lastNavigationProperty : "",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/BusinessPartnerSet('BP1')/Address"
	}
}, {
	getEntityTypeByPathParameter : "/BusinessPartnerSet('BP1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {/*Address is a complex type*/}},
	path : "/BusinessPartnerSet('BP1')/Address/City",
	result : {
		addressable : true,
		lastNavigationProperty : "",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/BusinessPartnerSet('BP1')/Address/City"
	}
}, {
	getEntityTypeByNavPropertyResult : {__navigationPropertiesMap : {/*not relevant*/}},
	getEntityTypeByNavPropertySegment : "ToLineItems",
	getEntityTypeByPathParameter : "/SalesOrderSet('1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {ToLineItems : {/*not relevant*/}}},
	path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
	result : {
		addressable : "~addressable",
		lastNavigationProperty : "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
	}
}, {
	getEntityTypeByNavPropertyResult : {__navigationPropertiesMap : {/*not relevant*/}},
	getEntityTypeByNavPropertySegment : "ToLineItems",
	getEntityTypeByPathParameter : "/SalesOrderSet('1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {ToLineItems : {/*not relevant*/}}},
	path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
	result : {
		addressable : "~addressable",
		lastNavigationProperty : "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
		pathAfterLastNavigationProperty : "/Note",
		pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
	}
}, {
	getEntityTypeByPathParameter : "/SalesOrderSet('1')",
	getEntityTypeByPathResult : null, // type cannot be resolved, e.g. metadata are not yet loaded
	path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
	result : {
		addressable : true,
		// without metadata we cannot identify the navigation properties properly
		lastNavigationProperty : "",
		pathAfterLastNavigationProperty : "",
		pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
			+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')"
	}
}, {
	getEntityTypeByNavPropertyResult : undefined, // type for navigation property cannot be resolved
	getEntityTypeByNavPropertySegment : "ToLineItems",
	getEntityTypeByPathParameter : "/SalesOrderSet('1')",
	getEntityTypeByPathResult : {__navigationPropertiesMap : {ToLineItems : {/*not relevant*/}}},
	path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
	result : {
		addressable : "~addressable",
		lastNavigationProperty : "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
		pathAfterLastNavigationProperty : "/Note",
		pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
	}
}].forEach(function (oFixture) {
	QUnit.test("_splitByLastNavigationProperty: " + oFixture.path, function (assert) {
		var oMetadataMock = this.mock(this.oMetadata);

		oMetadataMock.expects("_fillElementCaches").withExactArgs();
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs(oFixture.getEntityTypeByPathParameter)
			.returns(oFixture.getEntityTypeByPathResult);
		oMetadataMock.expects("_getEntityTypeByNavProperty")
			.withExactArgs(oFixture.getEntityTypeByPathResult,
				oFixture.getEntityTypeByNavPropertySegment)
			.exactly(oFixture.getEntityTypeByNavPropertySegment ? 1 : 0)
			.returns(oFixture.getEntityTypeByNavPropertyResult);
		oMetadataMock.expects("_isAddressable")
			.withExactArgs(oFixture.getEntityTypeByNavPropertyResult)
			.exactly(oFixture.result.lastNavigationProperty ? 1 : 0)
			.returns("~addressable");

		// code under test
		assert.deepEqual(this.oMetadata._splitByLastNavigationProperty(oFixture.path),
			oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("_splitByLastNavigationProperty: multiple navigations", function (assert) {
		var oBusinessPartnerType = {__navigationPropertiesMap : {}},
			oMetadataMock = this.mock(this.oMetadata),
			sPath = "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct"
				+ "/ToSupplier/Address/City",
			oProductType = {__navigationPropertiesMap : {ToSupplier : {}}},
			oSalesOrderLineItemType = {__navigationPropertiesMap : {ToProduct : {}}},
			oSalesOrderType = {__navigationPropertiesMap : {ToLineItems : {/*not relevant*/}}};

		oMetadataMock.expects("_fillElementCaches").withExactArgs();
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/SalesOrderSet('1')")
			.returns(oSalesOrderType);
		oMetadataMock.expects("_getEntityTypeByNavProperty")
			.withExactArgs(oSalesOrderType, "ToLineItems")
			.returns(oSalesOrderLineItemType);
		oMetadataMock.expects("_getEntityTypeByNavProperty")
			.withExactArgs(oSalesOrderLineItemType, "ToProduct")
			.returns(oProductType);
		oMetadataMock.expects("_getEntityTypeByNavProperty")
			.withExactArgs(oProductType, "ToSupplier")
			.returns(oBusinessPartnerType);
		oMetadataMock.expects("_isAddressable")
			.withExactArgs(oBusinessPartnerType)
			.returns("~addressable");

		// code under test
		assert.deepEqual(this.oMetadata._splitByLastNavigationProperty(sPath), {
			addressable : "~addressable",
			lastNavigationProperty : "/ToSupplier",
			pathAfterLastNavigationProperty : "/Address/City",
			pathBeforeLastNavigationProperty : "/SalesOrderSet('1')"
				+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct"
		});
	});

	//*********************************************************************************************
	QUnit.test("_splitByLastNavigationProperty: stop at first non-navigation property",
			function (assert) {
		var oMetadataMock = this.mock(this.oMetadata),
			// Assume that the complex type ToComplexType has also a property ToBusinessPartner;
			// path computation has to stop at the first non-navigation property
			sPath = "/SalesOrderSet('1')/ToComplexType/ToBusinessPartner",
			oSalesOrderType = {__navigationPropertiesMap : {ToBusinessPartner : {}}};

		oMetadataMock.expects("_fillElementCaches").withExactArgs();
		oMetadataMock.expects("_getEntityTypeByPath")
			.withExactArgs("/SalesOrderSet('1')")
			.returns(oSalesOrderType);
		oMetadataMock.expects("_getEntityTypeByNavProperty").never();

		// code under test
		assert.deepEqual(this.oMetadata._splitByLastNavigationProperty(sPath), {
			addressable : true,
			lastNavigationProperty : "",
			pathAfterLastNavigationProperty : "",
			pathBeforeLastNavigationProperty : "/SalesOrderSet('1')/ToComplexType/ToBusinessPartner"
		});
	});

	//*********************************************************************************************
	QUnit.test("_isAddressable: no type -> true (robustness)", function (assert) {
		// code under test
		assert.strictEqual(this.oMetadata._isAddressable(undefined), true);
	});

	//*********************************************************************************************
	QUnit.test("_isAddressable: no entity set -> true (robustness)", function (assert) {
		var oEntityType = {entityType : "GWSAMPLE_BASIC.SalesOrderLineItem"};

		this.oMetadata._entitySetMap = {};

		// code under test
		assert.strictEqual(this.oMetadata._isAddressable(oEntityType), true);
	});

	//*********************************************************************************************
[{}, {extensions : []}].forEach(function (oEntitySet, i) {
	QUnit.test("_isAddressable: no addressable extension, #" + i, function (assert) {
		var oEntityType = {entityType : "GWSAMPLE_BASIC.SalesOrderLineItem"};

		this.oMetadata._entitySetMap = {
			"GWSAMPLE_BASIC.SalesOrderLineItem" : oEntitySet
		};

		// code under test
		assert.strictEqual(this.oMetadata._isAddressable(oEntityType), true);
	});
});

	//*********************************************************************************************
[
	{value : "false", result : false},
	{value : "true", result : true},
	{value : undefined, result : true}
].forEach(function (oFixture) {
	QUnit.test("_isAddressable: extension found", function (assert) {
		var oEntitySet = {
				extensions : [{
					name : "addressable",
					namespace : "foo",
					value : String(!oFixture.result)
				}, {
					name : "addressable",
					namespace : "http://www.sap.com/Protocols/SAPData",
					value : oFixture.value
				}, {
					name : "addressable",
					namespace : "bar",
					value : String(!oFixture.result)
				}]
			},
			oEntityType = {
				entityType : "GWSAMPLE_BASIC.SalesOrderLineItem"
			};

		this.oMetadata._entitySetMap = {
			"GWSAMPLE_BASIC.SalesOrderLineItem" : oEntitySet
		};

		// code under test
		assert.strictEqual(this.oMetadata._isAddressable(oEntityType), oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("getServiceAnnotations", function (assert) {
		const pMetadataLoaded = Promise.resolve();
		this.mock(ODataMetadata.prototype).expects("_loadMetadata")
			.withExactArgs()
			.callsFake(function () {
				assert.strictEqual(this.sMetadata, "~XMLmetadata");
				this.oMetadata = "~JSONmetadata";
				return pMetadataLoaded;
			});
		this.mock(DOMParser.prototype).expects("parseFromString")
			.withExactArgs("~XMLmetadata", "application/xml")
			.returns("~oXMLDoc");
		this.mock(AnnotationParser).expects("parse")
			.withExactArgs(sinon.match((oMetadata) => oMetadata.oMetadata === "~JSONmetadata"), "~oXMLDoc")
			.returns("~oAnnotations");

		// code under test
		assert.strictEqual(ODataMetadata.getServiceAnnotations("~XMLmetadata"), "~oAnnotations");

		return pMetadataLoaded;
	});
});