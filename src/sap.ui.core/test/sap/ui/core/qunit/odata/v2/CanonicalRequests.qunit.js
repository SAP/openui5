/*global QUnit, sinon */
sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/core/util/MockServer',
    "sap/ui/model/odata/v2/ODataListBinding"
], function (ODataModel, MockServer, ODataListBinding) {
    "use strict";


    QUnit.module("Canonical paths", {
        before: function(){
        },
        after: function () {

        },
        beforeEach: function () {
            this.sServiceUri = "/SalesOrderSrv/";
			var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";

			this.oMockServer = new MockServer({
				rootUri: this.sServiceUri
			});
            this.oMockServer.simulate(sDataRootPath + "metadata.xml", sDataRootPath);
            this.oMockServer.start();
            this.oModel = new ODataModel(this.sServiceUri, { canonicalRequests: true });
            this.oStubGetEntitySetByPath = sinon.spy(this.oModel.oMetadata, "_getEntitySetByPath");

            this.fnOriginalInvalidate = this.oModel._invalidatePathCache;
            this.iInvalidationCounter = 0;
            this.oModel._invalidatePathCache = function(){
                if (Object.keys(this.oModel.mInvalidatedPaths).length > 0){
                    this.iInvalidationCounter++;
                }
                this.fnOriginalInvalidate.call(this.oModel);
            }.bind(this);
            this.oRequestStub = sinon.spy(this.oModel, "_request");

        },
        afterEach: function(){
            this.oMockServer.stop();
            this.oRequestStub.restore();
            this.oStubGetEntitySetByPath.restore();
            this.oModel._invalidatePathCache = this.fnOriginalInvalidate;
            this.oModel.destroy();
            delete this.oModel;
        }
    });


    var oCreateEntryProduct = {
        properties: {
            "ProductID":"AD-1234",
            "TypeCode":"AD",
            "Category":"Computer system accessories",
            "Name":"TestEntry",
            "NameLanguage":"E",
            "Description":"Flyer for our product palette",
            "DescriptionLanguage":"E",
            "SupplierID":"0100000015",
            "SupplierName":"Robert Brown Entertainment",
            "TaxTarifCode":1,
            "MeasureUnit":"EA",
            "WeightMeasure":"0.01",
            "WeightUnit":"KG",
            "CurrencyCode":"CAD",
            "Price":"0.0",
            "Width":"0.46",
            "Depth":"0.3",
            "Height":"0.03",
            "DimUnit":"M"
    }, batchGroupId: "myId"};

    /**
     * @param {string} path API call path
     * @param {string} expectedURL expected send URL
     * @param {object} assert QUnit assert
     * @param {object} test QUnit test
     * @param {string} testedAPI
     */

    var testODataAPI = function(path, expectedURL, assert, test, testedAPI, parameters){
        return function(){
            return new Promise(function(res, rej){
                test.oModel[testedAPI](path, parameters);
                var fnRequestCompleted = function(oEvent){
                    test.oModel.detachRequestCompleted(fnRequestCompleted);
                    var sLastRequest = test.oRequestStub.args[test.oRequestStub.args.length - 1][0];
                    var sDeepPath = sLastRequest["data"]["__batchRequests"][0].deepPath || sLastRequest["data"]["__batchRequests"][0].__changeRequests[0].deepPath;

                    assert.equal(sDeepPath, path, "Deep path set correctly.");
                    assert.equal(oEvent.getParameters().url, expectedURL, "ODatamodel." +  testedAPI + " - requestedPath:" + path);
                    res();
                };

                test.oModel.attachRequestCompleted(fnRequestCompleted);
            });
        };
    };

    var checkIfCacheEntriesAreValid = function(oModel, assert){

        //Cache entries should look like Entity(id=123)/ToNavigationProperty...
        var rCheckPath = new RegExp(/^\/(?:SalesOrderSet|SalesOrderLineItemSet|ProductSet|BusinessPartnerSet)/, "g");
        //var rCheckKey = new RegExp(/^\([^\/]+?\)\/To/, "g");
        var bMatch;

        Object.keys(oModel.mPathCache).forEach(function(sEntry){
            if (oModel.mPathCache[sEntry].canonicalPath){
                bMatch = oModel.mPathCache[sEntry].canonicalPath.match(rCheckPath);
            } else {// undefined path
                bMatch = true;
            }
            assert.ok(bMatch, "Valid canonical cache path (" + sEntry + " : " + oModel.mPathCache[sEntry].canonicalPath +  ")");
        });
        return Promise.resolve();
    };

    QUnit.test("ODataModel.read", function (assert) {
        var done = assert.async();
        var that = this;
        that.oModel.metadataLoaded()
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems",
                "SalesOrderSet('0500000000')/ToLineItems", assert, that, "read"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')",
                "SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", assert, that, "read"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct",
                "SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", assert, that, "read"))
            .then(// SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product - Property - ProductId
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ProductId",
                "ProductSet('HT-1000')/ProductId", assert, that, "read")).then(function(){
                    assert.equal(that.oStubGetEntitySetByPath.callCount, 10, "Check number of cache misses.");
                    assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                    return checkIfCacheEntriesAreValid(that.oModel, assert);
                })
            .then(done);
    });

    QUnit.test("ODataModel.update", function (assert) {
        var done = assert.async();
        var that = this;
        that.oModel.metadataLoaded()
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems",
                "SalesOrderSet('0500000000')/ToLineItems", assert, that, "update"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')",
                "SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", assert, that, "update"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct",
                "SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", assert, that, "read"))
            .then(// SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product - Property - ProductId
                testODataAPI("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ProductId",
                "ProductSet('HT-1000')/ProductId", assert, that, "update")).then(function(){
                    assert.equal(that.oStubGetEntitySetByPath.callCount, 11, "Check number of cache misses.");
                    assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                    return checkIfCacheEntriesAreValid(that.oModel, assert);
                })
            .then(done);
    });

    QUnit.test("ODataModel.remove", function (assert) {
        var done = assert.async();
        var that = this;
        that.oModel.metadataLoaded()
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000005')/ToLineItems",
                "SalesOrderSet('0500000005')/ToLineItems", assert, that, "remove"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000002')/ToLineItems(SalesOrderID='0500000002',ItemPosition='0000000010')",
                "SalesOrderLineItemSet(SalesOrderID='0500000002',ItemPosition='0000000010')", assert, that, "remove"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct",
                "SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct", assert, that, "read"))
            .then(// SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product - Property - ProductId
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ProductId",
                "ProductSet('HT-1030')/ProductId", assert, that, "remove")).then(function(){
                    assert.equal(that.oStubGetEntitySetByPath.callCount, 13, "Check number of cache misses.");
                    assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                    return checkIfCacheEntriesAreValid(that.oModel, assert);
                })
            .then(done);
    });

    QUnit.test("ODataModel.create", function (assert) {
        var done = assert.async();
        var that = this;
        that.oModel.metadataLoaded()
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000005')/ToLineItems",
                "SalesOrderSet('0500000005')/ToLineItems", assert, that, "create"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000002')/ToLineItems(SalesOrderID='0500000002',ItemPosition='0000000010')",
                "SalesOrderLineItemSet(SalesOrderID='0500000002',ItemPosition='0000000010')", assert, that, "create"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct",
                "SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct", assert, that, "read"))
            .then(// SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product - Property - ProductId
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/ProductId",
                "ProductSet('HT-1030')/ProductId", assert, that, "create")).then(function(){
                    assert.equal(that.oStubGetEntitySetByPath.callCount, 9, "Check number of cache misses.");
                    assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                    return checkIfCacheEntriesAreValid(that.oModel, assert);
                })
            .then(done);
    });


    QUnit.test("ODataModel.createEntry", function (assert) {
        var done = assert.async();
        var that = this;

        that.oModel.metadataLoaded()
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet
                testODataAPI("/SalesOrderSet('0500000005')/ToLineItems",
                "SalesOrderSet('0500000005')/ToLineItems", assert, that, "read"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct",
                "SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct", assert, that, "read"))
            .then( // SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct",
                "ProductSet('HT-1030')", assert, that, "createEntry", oCreateEntryProduct))
            .then(// SalesOrderSet - 1 to n - SalesOrderLineItemSet - 1 to 0 - Product - Property - ProductId
                testODataAPI("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct/SecondName",
                "ProductSet('AD-1234')/SecondName", assert, that, "read")).then(function(){
                    assert.equal(that.oStubGetEntitySetByPath.callCount, 12, "Check number of cache misses.");
                    assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                    return checkIfCacheEntriesAreValid(that.oModel, assert);
                })
            .then(done);
    });


    QUnit.test("ODataModel.resolve", function(assert){
        var that = this;
        var done = assert.async();
        this.oModel.metadataLoaded().then(function(){
            that.oModel.read("/SalesOrderSet('0500000000')");
            that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')");
            that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

            var fnRequestCompleted = function(oEvent){
                that.oModel.detachBatchRequestCompleted(fnRequestCompleted);

                // SalesOrderSet('0500000000') loaded already
                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", undefined, true),
                "/ProductSet('HT-1000')", "Already loaded");
                var oSalesOrderSetContext = that.oModel.createBindingContext("/SalesOrderSet('0500000000')");
                assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", oSalesOrderSetContext, true),
                "/ProductSet('HT-1000')", "Already loaded");

                // SalesOrderSet('0500000001') not loaded yet
                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')", undefined, true),
                "/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')", "Not loaded yet");
                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000001')/ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct", undefined, true),
                "/SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')/ToProduct", "Not loaded yet");

                // SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000020') not loaded yet
                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000020')/ToProduct", undefined, true),
                "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000020')/ToProduct", "Not loaded yet");
                assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000020')/ToProduct", oSalesOrderSetContext, true),
                "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000020')/ToProduct", "Not loaded yet");


                var oSalesOrderLineItemSetContext = that.oModel.createBindingContext("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')");
                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
                "/ProductSet('HT-1000')/ToSupplier", "Do some useful message");
                assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
                "/ProductSet('HT-1000')/ToSupplier", "Do some useful message");
                assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
                "/ProductSet('HT-1000')/ToSupplier", "Do some useful message");

                that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", {
                    success: function() {
                        assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
                        "/BusinessPartnerSet('0100000000')", "Do some useful message");
                        assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
                        "/BusinessPartnerSet('0100000000')", "Do some useful message");
                        assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
                        "/BusinessPartnerSet('0100000000')", "Do some useful message");
                        assert.equal(that.oStubGetEntitySetByPath.callCount, 11, "Check number of cache misses.");
                        assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                        checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
                    }
                });
            };
            that.oModel.attachBatchRequestCompleted(fnRequestCompleted);

        });
    });

    QUnit.test("ODataModel.resolve with expand and changed server data", function(assert){
        var that = this;
        var done = assert.async();

        this.oModel.metadataLoaded().then(function(){
            that.oModel.read("/SalesOrderSet('0500000000')", {urlParameters: {"$expand": "ToLineItems,ToLineItems/ToProduct"}});

            var fnRequestCompleted = function(oEvent){
                that.oModel.detachBatchRequestCompleted(fnRequestCompleted);

                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", undefined, true),
                "/ProductSet('HT-1000')", "Already loaded");
                var oSalesOrderSetContext = that.oModel.createBindingContext("/SalesOrderSet('0500000000')");
                assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", oSalesOrderSetContext, true),
                "/ProductSet('HT-1000')", "Already loaded");


                var oSalesOrderLineItemSetContext = that.oModel.createBindingContext("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')");
                assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
                "/ProductSet('HT-1000')/ToSupplier", "Do some useful message");
                assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
                "/ProductSet('HT-1000')/ToSupplier", "Do some useful message");
                assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
                "/ProductSet('HT-1000')/ToSupplier", "Do some useful message");


                // Simulate data changed on server
                that.oMockServer.stop();
                var aRequests = that.oMockServer.getRequests();
                aRequests.forEach(function (oRequest) {
                    var sPath = String(oRequest.path);
                    if (sPath.indexOf("$") == -1) {

                        oRequest._fnOrginalResponse = oRequest.response;
                        oRequest.response = function (oXhr) {
                            oXhr._fnOrignalXHRRespond = oXhr.respond;
                            oXhr.respond = function (status, headers, content) {
                                var oC = JSON.parse(content);
                                if (oC.d.ToLineItems){
                                    oC.d.ToLineItems.results[0].ProductID = "HT-1004";
                                    oC.d.ToLineItems.results[0].ToProduct.ProductID = "HT-1004";
                                    oC.d.ToLineItems.results[0].ToProduct.__metadata.uri = "/SalesOrderSrv/ProductSet('HT-1004')";
                                    arguments[2] = JSON.stringify(oC);
                                } else if (oC.d.ToProduct){
                                    oC.d.ProductID = "HT-1004";
                                    oC.d.ToProduct.ProductID = "HT-1004";
                                    oC.d.ToProduct.__metadata.uri = "/SalesOrderSrv/ProductSet('HT-1004')";
                                    oC.d.ToProduct.SupplierID = "0100000099";
                                    oC.d.ToProduct.ToSupplier.BusinessPartnerID = "0100000099";
                                    oC.d.ToProduct.ToSupplier.__metadata.uri = "/SalesOrderSrv/BusinessPartnerSet('0100000099')";
                                    arguments[2] = JSON.stringify(oC);
                                }
                                oXhr._fnOrignalXHRRespond.apply(this, arguments);
                            };
                            oRequest._fnOrginalResponse.apply(this, arguments);
                        };
                    }
                });
                that.oMockServer.start();

                var fnBatchCompleted1 = function() {
                    that.oModel.detachBatchRequestCompleted(fnBatchCompleted1);
                    //paths still work
                    assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')", undefined, true),
                    "/SalesOrderSet('0500000000')", "Do some useful message");
                    assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", undefined, true),
                    "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", "Do some useful message");

                    //new paths used
                    assert.equal(that.oModel.resolve("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", undefined, true),
                    "/ProductSet('HT-1004')", "Do some useful message");
                    assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
                    "/ProductSet('HT-1004')/ToSupplier", "Do some useful message");
                    assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
                    "/ProductSet('HT-1004')/ToSupplier", "Do some useful message");
                    assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
                    "/ProductSet('HT-1004')/ToSupplier", "Do some useful message");
                    var fnBatchCompleted2 = function() {
                        that.oModel.detachBatchRequestCompleted(fnBatchCompleted2);
                        assert.equal(that.oModel.resolve( "/ProductSet('HT-1004')/ToSupplier", undefined, true),
                        "/BusinessPartnerSet('0100000099')", "Do some useful message");
                        assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
                        "/BusinessPartnerSet('0100000099')", "Do some useful message");
                        assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
                        "/BusinessPartnerSet('0100000099')", "Do some useful message");
                        assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
                        "/BusinessPartnerSet('0100000099')", "Do some useful message");
                        assert.equal(that.oStubGetEntitySetByPath.callCount, 4, "Check number of cache misses.");
                        assert.equal(that.iInvalidationCounter, 1, "Check number of cache invalidations necessary.");
                        checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
                    };
                    that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", {urlParameters: {"$expand": "ToProduct,ToProduct/ToSupplier"}});
                    that.oModel.attachBatchRequestCompleted(fnBatchCompleted2);
                };

                that.oModel.read("/SalesOrderSet('0500000000')", {urlParameters: {"$expand": "ToLineItems,ToLineItems/ToProduct"}});
                that.oModel.attachBatchRequestCompleted(fnBatchCompleted1);

            };
            that.oModel.attachBatchRequestCompleted(fnRequestCompleted);

        });
    });


   QUnit.test("ODataModel.createBindingContext - Context chaining", function(assert){
    var that = this;
    var done = assert.async();
    this.oModel.metadataLoaded().then(function(){
        that.oModel.read("/SalesOrderSet('0500000000')");
        var fnRequestCompleted = function(oEvent){
            var oSalesOrderCtx = that.oModel.createBindingContext("/SalesOrderSet('0500000000')");
            that.oModel.read("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", {
                context:  oSalesOrderCtx,
                success: function(){
                    var oSalesOrderLineItemSetCtx = that.oModel.createBindingContext("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", oSalesOrderCtx);
                    assert.equal(oSalesOrderLineItemSetCtx && oSalesOrderLineItemSetCtx.sDeepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')","Deep path is set.");
                    that.oModel.read("ToProduct", {
                        context: oSalesOrderLineItemSetCtx,
                        success: function(){
                            var oProduct = that.oModel.createBindingContext("ToProduct", oSalesOrderLineItemSetCtx);
                            assert.equal(oProduct && oProduct.sDeepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path is set.");
                            assert.equal(that.oStubGetEntitySetByPath.callCount, 11, "Check number of cache misses.");
                            assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
                            checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
                        }
                    });
                }
            });
            that.oModel.detachBatchRequestCompleted(fnRequestCompleted);
        };
        that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
        });
    });


    QUnit.test("ODataListBinding - Deep Path Usage", function(assert){
        var that = this;
        var done = assert.async();

        this.oModel.metadataLoaded().then(function(){

            that.oModel.read("/SalesOrderSet('0500000000')");
            that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')");
            that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

            var fnRequestCompleted = function(){
                that.oModel.detachBatchRequestCompleted(fnRequestCompleted);

                var oODataListBinding = that.oModel.bindList("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems");
                oODataListBinding.initialize();
                oODataListBinding.attachDataReceived(function(){
                    var aContexts = oODataListBinding.getContexts(1, 2);
                    assert.equal(that.oModel.resolveDeep("ToProduct", aContexts[0]), "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems/ToProduct",
                    "Context is enriched with parent context information.");
                    done();
                });
                oODataListBinding.loadData(1, 2);
            };
            that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
        });
    });

    QUnit.test("ODataPropertyBinding - Deep Path Usage", function(assert){
        var that = this;
        var done = assert.async();

        this.oModel.metadataLoaded().then(function(){
            var oODataPropertyBinding = that.oModel.bindProperty("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ProductID");
            that.oModel.addBinding(oODataPropertyBinding);

            that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

            var fnRequestCompleted = function(){
                that.oModel.detachBatchRequestCompleted(fnRequestCompleted);
                assert.equal(oODataPropertyBinding.getValue(), "HT-1000", "Model value reached property binding.");
                done();
            };

            that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
        });
    });

});