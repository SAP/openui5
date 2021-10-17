import Log from "sap/base/Log";
import _ODataMetaModelUtils from "sap/ui/model/odata/_ODataMetaModelUtils";
import ODataMetadata from "sap/ui/model/odata/ODataMetadata";
import TestUtils from "sap/ui/test/TestUtils";
import OData from "sap/ui/thirdparty/datajs";
var sClassName = "sap.ui.model.odata.ODataMetadata";
QUnit.module("sap.ui.model.odata.ODataMetadata (ODataMetadataNoFakeService)", {
    beforeEach: function () {
        var oLoadMetadataStub = this.stub(ODataMetadata.prototype, "_loadMetadata");
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
        oLoadMetadataStub.callsFake(function () {
            return new Promise(function () { });
        });
        this.sUrl = "/some/url";
        this.oMetadata = new ODataMetadata(this.sUrl, {});
        oLoadMetadataStub.restore();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
[true, false].forEach(function (bResolve) {
    var sTitle = "pLoadedWithReject: metadata loading " + (bResolve ? "successful" : "failed");
    QUnit.test(sTitle, function (assert) {
        var oHandlers = {
            resolved: function () { },
            rejected: function () { }
        }, oHandlersMock = this.mock(oHandlers);
        assert.ok(this.oMetadata.pLoadedWithReject, "pLoadedWithReject promise exists");
        if (bResolve) {
            oHandlersMock.expects("resolved");
            oHandlersMock.expects("rejected").never();
            this.oMetadata.fnResolve();
        }
        else {
            oHandlersMock.expects("resolved").never();
            oHandlersMock.expects("rejected");
            this.oMetadata.fnReject();
        }
        return this.oMetadata.pLoadedWithReject.then(oHandlers.resolved, oHandlers.rejected);
    });
});
QUnit.test("pLoaded resolves successfully", function (assert) {
    var oHandlers = {
        resolved: function () { },
        rejected: function () { }
    }, oHandlersMock = this.mock(oHandlers);
    assert.ok(this.oMetadata.pLoaded, "pLoaded promise exists");
    oHandlersMock.expects("resolved");
    oHandlersMock.expects("rejected").never();
    this.oMetadata.fnResolve();
    return this.oMetadata.pLoaded.then(oHandlers.resolved, oHandlers.rejected);
});
QUnit.test("pLoaded resolves successfully after reject", function (assert) {
    var that = this;
    assert.ok(this.oMetadata.pLoaded, "pLoaded promise exists");
    this.oMetadata.fnReject();
    return this.oMetadata.pLoadedWithReject.catch(function () {
        that.oMetadata.fnResolve();
        return that.oMetadata.pLoaded;
    });
});
[true, false].forEach(function (bReject) {
    var sTitle = "loaded returns " + (bReject ? "pLoadedWithReject" : "pLoaded");
    QUnit.test(sTitle, function (assert) {
        assert.strictEqual(this.oMetadata.loaded(bReject), bReject ? this.oMetadata.pLoadedWithReject : this.oMetadata.pLoaded);
    });
});
QUnit.test("_handleLoaded calls fnResolve", function (assert) {
    var mResolvedParams = { entitySets: [] };
    this.mock(this.oMetadata).expects("fnResolve").withExactArgs(mResolvedParams);
    this.oMetadata._handleLoaded({}, {}, true);
});
QUnit.test("_loadMetadata _handleError calls fnReject", function (assert) {
    var oError = {
        message: "Message",
        request: "Request",
        response: {
            statusCode: 503,
            statusText: "Status text",
            body: "Response body"
        }
    }, oMetadataMock, oODataMock = this.mock(OData), oRequest = {};
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
    return this.oMetadata._loadMetadata(undefined, true).catch(function () {
        oODataMock.restore();
    });
});
[{
        entitySet: { name: "~entitySetName" },
        entityType: { entityType: "namespace.entityType" },
        expectedLog: "Cannot determine keys of the entity type 'namespace.entityType' for the function" + " import '~functionName'",
        result: "",
        resultCollection: ""
    }, {
        entitySet: { name: "~entitySetName" },
        entityType: { key: {}, entityType: "namespace.entityType" },
        expectedLog: "Cannot determine keys of the entity type 'namespace.entityType' for the function" + " import '~functionName'",
        result: "",
        resultCollection: ""
    }, {
        entitySet: { name: "~entitySetName" },
        entityType: {
            key: {
                propertyRef: [{ name: "property0" }]
            }
        },
        result: "/~entitySetName('1')",
        resultCollection: "/~entitySetName"
    }, {
        entitySet: { name: "~entitySetName" },
        entityType: {
            key: {
                propertyRef: [{ name: "property1" }]
            }
        },
        result: "/~entitySetName()",
        resultCollection: "/~entitySetName"
    }, {
        entitySet: { name: "~entitySetName" },
        entityType: {
            key: {
                propertyRef: [{ name: "property0" }, { name: "property1" }]
            }
        },
        result: "/~entitySetName(property0='1')",
        resultCollection: "/~entitySetName"
    }, {
        entitySet: { name: "~entitySetName" },
        entityType: {
            key: {
                propertyRef: [{ name: "property0" }, { name: "property2" }]
            }
        },
        result: "/~entitySetName(property0='1',property2=2)",
        resultCollection: "/~entitySetName"
    }, {
        entitySet: undefined,
        entityType: {
            key: {
                propertyRef: [{ name: "property0" }]
            }
        },
        expectedLog: "Cannot determine path of the entity set for the function import '~functionName'",
        result: "",
        resultCollection: ""
    }, {
        entitySet: undefined,
        entityType: undefined,
        result: "",
        resultCollection: ""
    }].forEach(function (oFixture, i) {
    [{
            entityTypeByName: "~entityTypeName",
            functionInfo: {
                entitySet: "~entitySet",
                extensions: [
                    { name: "label", value: "foo" },
                    { name: "action-for", value: "~entityTypeName" },
                    { name: "bar", value: "baz" }
                ],
                name: "~functionName",
                returnType: "~returnType"
            }
        }, {
            entityTypeByPath: "~entitySet",
            functionInfo: {
                entitySet: "~entitySet",
                name: "~functionName",
                returnType: "~returnType"
            }
        }, {
            entityTypeByName: "~returnType",
            functionInfo: {
                name: "~functionName",
                returnType: "~returnType"
            }
        }, {
            collection: true,
            entityTypeByName: "~returnType",
            functionInfo: {
                name: "~functionName",
                returnType: "Collection(~returnType)"
            }
        }].forEach(function (oFunctionInfoFixture, j) {
        QUnit.test("_getCanonicalPathOfFunctionImport: #" + i + "/" + j, function (assert) {
            var mFunctionParameters = {
                property0: "'1'",
                property2: "2"
            }, oMetaDataMock = this.mock(this.oMetadata);
            oMetaDataMock.expects("_getEntityTypeByName").withExactArgs(oFunctionInfoFixture.entityTypeByName).exactly(oFunctionInfoFixture.entityTypeByName ? 1 : 0).returns(oFixture.entityType);
            oMetaDataMock.expects("_getEntityTypeByPath").withExactArgs(oFunctionInfoFixture.entityTypeByPath).exactly(oFunctionInfoFixture.entityTypeByPath ? 1 : 0).returns(oFixture.entityType);
            oMetaDataMock.expects("_getEntitySetByType").withExactArgs(sinon.match.same(oFixture.entityType)).exactly(oFixture.entityType ? 1 : 0).returns(oFixture.entitySet);
            this.oLogMock.expects("error").withExactArgs(oFixture.expectedLog, sinon.match.same(this.oMetadata), sClassName).exactly(oFixture.expectedLog ? 1 : 0);
            assert.strictEqual(this.oMetadata._getCanonicalPathOfFunctionImport(oFunctionInfoFixture.functionInfo, mFunctionParameters), oFunctionInfoFixture.collection ? oFixture.resultCollection : oFixture.result);
        });
    });
});
QUnit.test("_getCanonicalPathOfFunctionImport: sFunctionReturnType = undefined", function (assert) {
    var mFunctionInfo = { name: "Foo" };
    assert.strictEqual(this.oMetadata._getCanonicalPathOfFunctionImport(mFunctionInfo, undefined), "");
});
[
    {
        mFunctionInfo: undefined,
        expectedResult: false
    },
    {
        mFunctionInfo: {},
        expectedResult: false
    },
    {
        mFunctionInfo: {
            returnType: "~returnType"
        },
        expectedResult: false
    },
    {
        mFunctionInfo: {
            returnType: "collection(~returnType)"
        },
        expectedResult: false
    },
    {
        mFunctionInfo: {
            returnType: "Collection(~returnType)"
        },
        expectedResult: true
    }
].forEach(function (oFixture, i) {
    QUnit.test("_returnsCollection: #" + i, function (assert) {
        assert.strictEqual(ODataMetadata._returnsCollection(oFixture.mFunctionInfo), oFixture.expectedResult);
    });
});
[{
        getEntityTypeByPathParameter: "/SalesOrderSet",
        getEntityTypeByPathResult: { __navigationPropertiesMap: {} },
        path: "/SalesOrderSet",
        result: {
            addressable: true,
            lastNavigationProperty: "",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/SalesOrderSet"
        }
    }, {
        getEntityTypeByPathParameter: "/SalesOrderSet('1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: {} },
        path: "/SalesOrderSet('1')",
        result: {
            addressable: true,
            lastNavigationProperty: "",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/SalesOrderSet('1')"
        }
    }, {
        getEntityTypeByNavPropertyResult: { __navigationPropertiesMap: {} },
        getEntityTypeByNavPropertySegment: "ToLineItems",
        getEntityTypeByPathParameter: "/SalesOrderSet('1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: { ToLineItems: {} } },
        path: "/SalesOrderSet('1')/ToLineItems",
        result: {
            addressable: "~addressable",
            lastNavigationProperty: "/ToLineItems",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/SalesOrderSet('1')"
        }
    }, {
        getEntityTypeByPathParameter: "/BusinessPartnerSet('BP1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: {} },
        path: "/BusinessPartnerSet('BP1')/Address",
        result: {
            addressable: true,
            lastNavigationProperty: "",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/BusinessPartnerSet('BP1')/Address"
        }
    }, {
        getEntityTypeByPathParameter: "/BusinessPartnerSet('BP1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: {} },
        path: "/BusinessPartnerSet('BP1')/Address/City",
        result: {
            addressable: true,
            lastNavigationProperty: "",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/BusinessPartnerSet('BP1')/Address/City"
        }
    }, {
        getEntityTypeByNavPropertyResult: { __navigationPropertiesMap: {} },
        getEntityTypeByNavPropertySegment: "ToLineItems",
        getEntityTypeByPathParameter: "/SalesOrderSet('1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: { ToLineItems: {} } },
        path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
        result: {
            addressable: "~addressable",
            lastNavigationProperty: "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/SalesOrderSet('1')"
        }
    }, {
        getEntityTypeByNavPropertyResult: { __navigationPropertiesMap: {} },
        getEntityTypeByNavPropertySegment: "ToLineItems",
        getEntityTypeByPathParameter: "/SalesOrderSet('1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: { ToLineItems: {} } },
        path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
        result: {
            addressable: "~addressable",
            lastNavigationProperty: "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
            pathAfterLastNavigationProperty: "/Note",
            pathBeforeLastNavigationProperty: "/SalesOrderSet('1')"
        }
    }, {
        getEntityTypeByPathParameter: "/SalesOrderSet('1')",
        getEntityTypeByPathResult: null,
        path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
        result: {
            addressable: true,
            lastNavigationProperty: "",
            pathAfterLastNavigationProperty: "",
            pathBeforeLastNavigationProperty: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')"
        }
    }, {
        getEntityTypeByNavPropertyResult: undefined,
        getEntityTypeByNavPropertySegment: "ToLineItems",
        getEntityTypeByPathParameter: "/SalesOrderSet('1')",
        getEntityTypeByPathResult: { __navigationPropertiesMap: { ToLineItems: {} } },
        path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
        result: {
            addressable: "~addressable",
            lastNavigationProperty: "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
            pathAfterLastNavigationProperty: "/Note",
            pathBeforeLastNavigationProperty: "/SalesOrderSet('1')"
        }
    }].forEach(function (oFixture) {
    QUnit.test("_splitByLastNavigationProperty: " + oFixture.path, function (assert) {
        var oMetadataMock = this.mock(this.oMetadata);
        oMetadataMock.expects("_fillElementCaches").withExactArgs();
        oMetadataMock.expects("_getEntityTypeByPath").withExactArgs(oFixture.getEntityTypeByPathParameter).returns(oFixture.getEntityTypeByPathResult);
        oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(oFixture.getEntityTypeByPathResult, oFixture.getEntityTypeByNavPropertySegment).exactly(oFixture.getEntityTypeByNavPropertySegment ? 1 : 0).returns(oFixture.getEntityTypeByNavPropertyResult);
        oMetadataMock.expects("_isAddressable").withExactArgs(oFixture.getEntityTypeByNavPropertyResult).exactly(oFixture.result.lastNavigationProperty ? 1 : 0).returns("~addressable");
        assert.deepEqual(this.oMetadata._splitByLastNavigationProperty(oFixture.path), oFixture.result);
    });
});
QUnit.test("_splitByLastNavigationProperty: multiple navigations", function (assert) {
    var oBusinessPartnerType = { __navigationPropertiesMap: {} }, oMetadataMock = this.mock(this.oMetadata), sPath = "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct" + "/ToSupplier/Address/City", oProductType = { __navigationPropertiesMap: { ToSupplier: {} } }, oSalesOrderLineItemType = { __navigationPropertiesMap: { ToProduct: {} } }, oSalesOrderType = { __navigationPropertiesMap: { ToLineItems: {} } };
    oMetadataMock.expects("_fillElementCaches").withExactArgs();
    oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("/SalesOrderSet('1')").returns(oSalesOrderType);
    oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(oSalesOrderType, "ToLineItems").returns(oSalesOrderLineItemType);
    oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(oSalesOrderLineItemType, "ToProduct").returns(oProductType);
    oMetadataMock.expects("_getEntityTypeByNavProperty").withExactArgs(oProductType, "ToSupplier").returns(oBusinessPartnerType);
    oMetadataMock.expects("_isAddressable").withExactArgs(oBusinessPartnerType).returns("~addressable");
    assert.deepEqual(this.oMetadata._splitByLastNavigationProperty(sPath), {
        addressable: "~addressable",
        lastNavigationProperty: "/ToSupplier",
        pathAfterLastNavigationProperty: "/Address/City",
        pathBeforeLastNavigationProperty: "/SalesOrderSet('1')" + "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct"
    });
});
QUnit.test("_splitByLastNavigationProperty: stop at first non-navigation property", function (assert) {
    var oMetadataMock = this.mock(this.oMetadata), sPath = "/SalesOrderSet('1')/ToComplexType/ToBusinessPartner", oSalesOrderType = { __navigationPropertiesMap: { ToBusinessPartner: {} } };
    oMetadataMock.expects("_fillElementCaches").withExactArgs();
    oMetadataMock.expects("_getEntityTypeByPath").withExactArgs("/SalesOrderSet('1')").returns(oSalesOrderType);
    oMetadataMock.expects("_getEntityTypeByNavProperty").never();
    assert.deepEqual(this.oMetadata._splitByLastNavigationProperty(sPath), {
        addressable: true,
        lastNavigationProperty: "",
        pathAfterLastNavigationProperty: "",
        pathBeforeLastNavigationProperty: "/SalesOrderSet('1')/ToComplexType/ToBusinessPartner"
    });
});
QUnit.test("_isAddressable: no type -> true (robustness)", function (assert) {
    assert.strictEqual(this.oMetadata._isAddressable(undefined), true);
});
QUnit.test("_isAddressable: no entity set -> true (robustness)", function (assert) {
    var oEntityType = { entityType: "GWSAMPLE_BASIC.SalesOrderLineItem" };
    this.oMetadata._entitySetMap = {};
    assert.strictEqual(this.oMetadata._isAddressable(oEntityType), true);
});
[{}, { extensions: [] }].forEach(function (oEntitySet, i) {
    QUnit.test("_isAddressable: no addressable extension, #" + i, function (assert) {
        var oEntityType = { entityType: "GWSAMPLE_BASIC.SalesOrderLineItem" };
        this.oMetadata._entitySetMap = {
            "GWSAMPLE_BASIC.SalesOrderLineItem": oEntitySet
        };
        assert.strictEqual(this.oMetadata._isAddressable(oEntityType), true);
    });
});
[
    { value: "false", result: false },
    { value: "true", result: true },
    { value: undefined, result: true }
].forEach(function (oFixture) {
    QUnit.test("_isAddressable: extension found", function (assert) {
        var oEntitySet = {
            extensions: [{
                    name: "addressable",
                    namespace: "foo",
                    value: String(!oFixture.result)
                }, {
                    name: "addressable",
                    namespace: "http://www.sap.com/Protocols/SAPData",
                    value: oFixture.value
                }, {
                    name: "addressable",
                    namespace: "bar",
                    value: String(!oFixture.result)
                }]
        }, oEntityType = {
            entityType: "GWSAMPLE_BASIC.SalesOrderLineItem"
        };
        this.oMetadata._entitySetMap = {
            "GWSAMPLE_BASIC.SalesOrderLineItem": oEntitySet
        };
        assert.strictEqual(this.oMetadata._isAddressable(oEntityType), oFixture.result);
    });
});