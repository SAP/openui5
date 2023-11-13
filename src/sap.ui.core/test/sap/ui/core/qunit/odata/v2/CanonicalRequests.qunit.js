/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/core/Messaging",
	'sap/ui/core/util/MockServer'
], function (ODataModel, MessageScope, Messaging, MockServer) {
	"use strict";


	var resetSharedData = function () {
		ODataModel.mSharedData = {
			server: {},
			service: {},
			meta: {}
		};
	};

	// Set in before Each
	var mResponseParameter = {};

	// Simulate data changed on server
	var changeNavigationTargets = function (oMockServer) {

		oMockServer.stop();

		oMockServer.getRequests().forEach(function (oRequest) {
			var sPath = String(oRequest.path);
			if (sPath.indexOf("$") == -1) {

				if (oRequest._fnOrginalResponse) {
					oRequest.response = oRequest._fnOrginalResponse;
				}

				oRequest._fnOrginalResponse = oRequest.response;
				oRequest.response = function (oXhr) {
					oXhr._fnOrignalXHRRespond = oXhr.respond;
					oXhr.respond = function (status, headers, content) {
						var oC = JSON.parse(content);
						var oMessages;

						if (mResponseParameter.bRemoveProduct) {
							oC.d.ToProduct = null;
						} else if (oC.d.ToLineItems && mResponseParameter.sProductId) {
								oC.d.ToLineItems.results[0].ProductID = mResponseParameter.sProductId;
								oC.d.ToLineItems.results[0].ToProduct.ProductID = mResponseParameter.sProductId;
								oC.d.ToLineItems.results[0].ToProduct.__metadata.uri = "/SalesOrderSrv/ProductSet('" + mResponseParameter.sProductId + "')";
							} else if (oC.d.ToProduct && mResponseParameter.sProductId && mResponseParameter.sBusinessPartnerID) {
								oC.d.ProductID = mResponseParameter.sProductId;
								oC.d.ToProduct.ProductID = mResponseParameter.sProductId;
								oC.d.ToProduct.__metadata.uri = "/SalesOrderSrv/ProductSet('" + mResponseParameter.sProductId + "')";
								oC.d.ToProduct.SupplierID = mResponseParameter.sBusinessPartnerID;
								oC.d.ToProduct.ToSupplier.BusinessPartnerID = mResponseParameter.sBusinessPartnerID;
								oC.d.ToProduct.ToSupplier.__metadata.uri = "/SalesOrderSrv/BusinessPartnerSet('" + mResponseParameter.sBusinessPartnerID + "')";
							}

						if (oXhr.url.indexOf("ContactSet") >= 0) {
							if (mResponseParameter.bCreateRequestFailure) {
								status = 400;
								oC = {
									error: {
										code: "MESSAGE/CODE",
										message: "Operation failed",
										severity: "error"
									}
								};
							} else {
								oMessages = {
									code: "MESSAGE/CODE",
									message: "Operation failed",
									severity: "warning",
									target: ""
								};
								headers["sap-message"] = JSON.stringify(oMessages);
							}
						}

						if (mResponseParameter.mDeepSalesOrderMsg !== "NoMsg" && oXhr.url.indexOf("/BusinessPartnerSet('0100000000')" >= 0)) {
							oMessages = {
								code: "MESSAGE/CODE",
								message: "Operation failed",
								severity: "error",
								target: "ToSalesOrders('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')"
							};
							if (mResponseParameter.mDeepSalesOrderMsg === "MsgWithProperty"){
								oMessages.target += "/CurrencyCode";
							}

							headers["sap-message"] = JSON.stringify(oMessages);
						}

						content = JSON.stringify(oC);
						oXhr._fnOrignalXHRRespond.apply(this, [status, headers, content]);
					};
					oRequest._fnOrginalResponse.apply(this, arguments);
				};
			}
		});
		oMockServer.start();
	};


	QUnit.module("Canonical paths", {
		before: function () {
		},
		after: function () {

		},
		beforeEach: function () {
			mResponseParameter = {
				sProductId: "",
				sBusinessPartnerID: "",
				bRemoveProduct: false,
				bCreateRequestFailure: false,
				mDeepSalesOrderMsg: "NoMsg"
			};
			this.sServiceUri = "/SalesOrderSrv/";
			var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";

			this.oMockServer = new MockServer({
				rootUri: this.sServiceUri
			});
			this.oMockServer.simulate(sDataRootPath + "metadata.xml", sDataRootPath);
			this.oMockServer.start();
			this.oModel = new ODataModel(this.sServiceUri, {canonicalRequests: true});

			this.oModel.setMessageScope(MessageScope.BusinessObject);
			this.oStubGetEntitySetByPath = sinon.spy(this.oModel.oMetadata, "_getEntitySetByPath");

			this.fnOriginalInvalidate = this.oModel._invalidatePathCache;
			this.iInvalidationCounter = 0;
			this.oModel._invalidatePathCache = function () {
				if (Object.keys(this.oModel.mInvalidatedPaths).length > 0) {
					this.iInvalidationCounter++;
				}
				this.fnOriginalInvalidate.call(this.oModel);
			}.bind(this);
			this.oRequestStub = sinon.spy(this.oModel, "_request");

		},
		afterEach: function () {
			this.oMockServer.stop();
			this.oRequestStub.restore();
			this.oStubGetEntitySetByPath.restore();
			this.oModel._invalidatePathCache = this.fnOriginalInvalidate;
			this.oModel.destroy();
			delete this.oModel;
			resetSharedData();
		}
	});


	var oCreateEntryProduct = {
		properties: {
			"ProductID": "AD-1234",
			"TypeCode": "AD",
			"Category": "Computer system accessories",
			"Name": "TestEntry",
			"NameLanguage": "E",
			"Description": "Flyer for our product palette",
			"DescriptionLanguage": "E",
			"SupplierID": "0100000015",
			"SupplierName": "Robert Brown Entertainment",
			"TaxTarifCode": 1,
			"MeasureUnit": "EA",
			"WeightMeasure": "0.01",
			"WeightUnit": "KG",
			"CurrencyCode": "CAD",
			"Price": "0.0",
			"Width": "0.46",
			"Depth": "0.3",
			"Height": "0.03",
			"DimUnit": "M"
		}, batchGroupId: "myId"
	};


	var getLastRequest = function (test) {
		var oLastRequest = test.oRequestStub.args[test.oRequestStub.args.length - 1][0];
		var oRelevantRequest = oLastRequest["data"]["__batchRequests"][0]["__changeRequests"]
			&& oLastRequest["data"]["__batchRequests"][0]["__changeRequests"][0]
			|| oLastRequest["data"]["__batchRequests"][0];
		return oRelevantRequest;
	};



	var checkIfCacheEntriesAreValid = function (oModel, assert) {

		//Cache entries should look like Entity(id=123)/ToNavigationProperty...
		var rCheckPath = /^\/(?:SalesOrderSet|SalesOrderLineItemSet|ProductSet|BusinessPartnerSet)/g;
		//var rCheckKey = new RegExp(/^\([^\/]+?\)\/To/, "g");
		var bMatch;

		Object.keys(oModel.mPathCache).forEach(function (sEntry) {
			if (oModel.mPathCache[sEntry].canonicalPath) {
				bMatch = oModel.mPathCache[sEntry].canonicalPath.match(rCheckPath);
			} else {// undefined path
				bMatch = true;
			}
			assert.ok(bMatch, "Valid canonical cache path (" + sEntry + " : " + oModel.mPathCache[sEntry].canonicalPath + ")");
		});
		return Promise.resolve();
	};

	QUnit.test("ODataModel.canonicalRequestsEnabled", function (assert) {
		var done = assert.async();
		var that = this;
		that.oModel.metadataLoaded()
			.then(function () {
				assert.ok(that.oModel.canonicalRequestsEnabled(), 'canonical request calculation switched on');
				var oModel = new ODataModel(that.sServiceUri, { canonicalRequests: false });
				assert.ok(!oModel.canonicalRequestsEnabled(), 'canonical request calculation switched off');
				oModel = new ODataModel(that.sServiceUri, {});
				assert.ok(!oModel.canonicalRequestsEnabled(), 'canonical request calculation switched off');
			})
			.then(done);
	});

	var aVariants = [{
		Model: true,
		APICallParameter: undefined
	},{
		Model: false,
		APICallParameter: true
	}];
		aVariants.forEach(function (oVariant) {

			/**
			 * @param {string} path API call path
			 * @param {string} expectedURL expected send URL
			 * @param {object} assert QUnit assert
			 * @param {object} test QUnit test
			 * @param {string} testedAPI
			 */

			var testODataAPI = function (path, expectedURL, assert, test, testedAPI, parameters) {
				return function () {
					return new Promise(function (res, rej) {
						parameters = Object.assign({}, parameters, {canonicalRequest: oVariant.APICallParameter});
						if (testedAPI === "update" || testedAPI === "create" ){
							test.oModel[testedAPI](path, {}, parameters);
						} else {
							test.oModel[testedAPI](path, parameters);
						}

						var fnRequestCompleted = function (oEvent) {
							test.oModel.detachRequestCompleted(fnRequestCompleted);
							var oRelevantRequest = getLastRequest(test);
							var sMessageScopeHeader = oRelevantRequest["headers"]["sap-message-scope"];
							assert.equal(sMessageScopeHeader, MessageScope.BusinessObject);
							assert.equal(oRelevantRequest.deepPath, path, "Deep path set correctly.");
							assert.equal(oEvent.getParameters().url.split("?")[0], expectedURL, "ODatamodel." + testedAPI + " - requestedPath:" + path);

							res();
						};

						test.oModel.attachRequestCompleted(fnRequestCompleted);
					});
				};
			};


			QUnit.test("ODataModel.read " + "(Model:" + oVariant.Model + ", APICallParameter:" + oVariant.APICallParameter + ")", function (assert) {
				var done = assert.async();
				var that = this;
				this.oModel.bCanonicalRequests = oVariant.Model;

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
							"SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ProductId", assert, that, "read"))
					.then(function () {
							assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
							return checkIfCacheEntriesAreValid(that.oModel, assert);
						})
					.then(done);
			});

			QUnit.test("ODataModel.update " + "(Model:" + oVariant.Model + ", APICallParameter:" + oVariant.APICallParameter + ")", function (assert) {
				var done = assert.async();
				var that = this;
				this.oModel.bCanonicalRequests = oVariant.Model;

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
							"ProductSet('HT-1000')/ProductId", assert, that, "update")).then(function () {
								assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
								return checkIfCacheEntriesAreValid(that.oModel, assert);
							})
					.then(done);
			});

			QUnit.test("ODataModel.remove " + "(Model:" + oVariant.Model + ", APICallParameter:" + oVariant.APICallParameter + ")", function (assert) {
				var done = assert.async();
				var that = this;
				this.oModel.bCanonicalRequests = oVariant.Model;

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
							"ProductSet('HT-1030')/ProductId", assert, that, "remove")).then(function () {
								assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
								return checkIfCacheEntriesAreValid(that.oModel, assert);
							})
					.then(done);
			});

			QUnit.test("ODataModel.create " + "(Model:" + oVariant.Model + ", APICallParameter:" + oVariant.APICallParameter + ")", function (assert) {
				var done = assert.async();
				var that = this;
				this.oModel.bCanonicalRequests = oVariant.Model;

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
							"ProductSet('HT-1030')/ProductId", assert, that, "create")).then(function () {
								assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
								return checkIfCacheEntriesAreValid(that.oModel, assert);
							})
					.then(done);
			});


			QUnit.test("ODataModel.createEntry " + "(Model:" + oVariant.Model + ", APICallParameter:" + oVariant.APICallParameter + ")", function (assert) {
				var done = assert.async();
				var that = this;
				this.oModel.bCanonicalRequests = oVariant.Model;

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
					.then(function () {
						assert.equal(getLastRequest(that).data.__metadata.deepPath, undefined, "Deep path is not send to back-end.");
						done();
					});
			});


			QUnit.test("ODataModel.submitChanges " + "(Model:" + oVariant.Model + ", APICallParameter:" + oVariant.APICallParameter + ")", function (assert) {
				var done = assert.async();
				var that = this;

				that.oModel.metadataLoaded().then(testODataAPI(
					"/SalesOrderSet('0500000005')", "SalesOrderSet('0500000005')", assert, that, "read", { urlParameters: { "$expand": "ToLineItems" } }))
					.then(function () {
						that.oModel.setProperty("/SalesOrderSet('0500000005')/ToLineItems(SalesOrderID='0500000005',ItemPosition='0000000010')/Note", "First version.");
						that.oModel.setProperty("/SalesOrderSet('0500000005')/ToLineItems(SalesOrderID='0500000005',ItemPosition='0000000010')/Note", "Second version.");
						that.oModel.submitChanges({
							success: function () {
								assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");

								var sLastRequest = getLastRequest(that);
								var sDeepPath = sLastRequest.deepPath;
								var sMessageScopeHeader = sLastRequest.headers["sap-message-scope"];
								var sDeepPathMetadata = sLastRequest.data.__metadata.deepPath;

								assert.strictEqual(sDeepPathMetadata, undefined, "Deep path is not send to back-end.");
								assert.strictEqual(sMessageScopeHeader, MessageScope.BusinessObject, "Message scope set correctly.");
								assert.strictEqual(sDeepPath, "/SalesOrderSet('0500000005')/ToLineItems(SalesOrderID='0500000005',ItemPosition='0000000010')", "Deep path set correctly.");
								return checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
							}
						});
					});
			});
		});


	QUnit.test("ODataModel.resolve", function (assert) {
		var that = this;
		var done = assert.async();
		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')");
			that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')");
			that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

			var fnRequestCompleted = function (oEvent) {
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
					"/ProductSet('HT-1000')/ToSupplier", "Path was resolved correctly.");
				assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
					"/ProductSet('HT-1000')/ToSupplier", "Path was resolved correctly.");
				assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
					"/ProductSet('HT-1000')/ToSupplier", "Path was resolved correctly.");

				that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", {
					success: function () {
						assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
							"/BusinessPartnerSet('0100000000')", "Path was resolved correctly.");
						assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
							"/BusinessPartnerSet('0100000000')", "Path was resolved correctly.");
						assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
							"/BusinessPartnerSet('0100000000')", "Path was resolved correctly.");
						assert.equal(that.oStubGetEntitySetByPath.callCount, 11, "Check number of cache misses.");
						assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
						checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
					}
				});
			};
			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);

		});
	});

	QUnit.test("ODataModel.resolve with expand and changed server data", function (assert) {
		var that = this;
		var done = assert.async();
		changeNavigationTargets(that.oMockServer);

		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')", { urlParameters: { "$expand": "ToLineItems,ToLineItems/ToProduct" } });

			var fnRequestCompleted = function (oEvent) {
				that.oModel.detachBatchRequestCompleted(fnRequestCompleted);

				assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", undefined, true),
					"/ProductSet('HT-1000')", "Already loaded");
				var oSalesOrderSetContext = that.oModel.createBindingContext("/SalesOrderSet('0500000000')");
				assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", oSalesOrderSetContext, true),
					"/ProductSet('HT-1000')", "Already loaded");


				var oSalesOrderLineItemSetContext = that.oModel.createBindingContext("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')");
				assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
					"/ProductSet('HT-1000')/ToSupplier", "Path was resolved correctly.");
				assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
					"/ProductSet('HT-1000')/ToSupplier", "Path was resolved correctly.");
				assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
					"/ProductSet('HT-1000')/ToSupplier", "Path was resolved correctly.");

				mResponseParameter.sProductId = "HT-1004";
				mResponseParameter.sBusinessPartnerID = "0100000099";

				var fnBatchCompleted1 = function () {
					that.oModel.detachBatchRequestCompleted(fnBatchCompleted1);
					//paths still work
					assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')", undefined, true),
						"/SalesOrderSet('0500000000')", "Path was resolved correctly.");
					assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", undefined, true),
						"/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", "Path was resolved correctly.");

					//new paths used
					assert.equal(that.oModel.resolve("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", undefined, true),
						"/ProductSet('HT-1004')", "Path was resolved correctly.");
					assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
						"/ProductSet('HT-1004')/ToSupplier", "Path was resolved correctly.");
					assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
						"/ProductSet('HT-1004')/ToSupplier", "Path was resolved correctly.");
					assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
						"/ProductSet('HT-1004')/ToSupplier", "Path was resolved correctly.");
					var fnBatchCompleted2 = function () {
						that.oModel.detachBatchRequestCompleted(fnBatchCompleted2);
						assert.equal(that.oModel.resolve("/ProductSet('HT-1004')/ToSupplier", undefined, true),
							"/BusinessPartnerSet('0100000099')", "Path was resolved correctly.");
						assert.equal(that.oModel.resolve("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", undefined, true),
							"/BusinessPartnerSet('0100000099')", "Path was resolved correctly.");
						assert.equal(that.oModel.resolve("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSupplier", oSalesOrderSetContext, true),
							"/BusinessPartnerSet('0100000099')", "Path was resolved correctly.");
						assert.equal(that.oModel.resolve("ToProduct/ToSupplier", oSalesOrderLineItemSetContext, true),
							"/BusinessPartnerSet('0100000099')", "Path was resolved correctly.");
						assert.equal(that.oStubGetEntitySetByPath.callCount, 4, "Check number of cache misses.");
						assert.equal(that.iInvalidationCounter, 1, "Check number of cache invalidations necessary.");

						mResponseParameter.sProductId = "HT-1000";
						mResponseParameter.sBusinessPartnerID = "0100000000";

						var fnBatchCompleted3 = function () {
							that.oModel.detachBatchRequestCompleted(fnBatchCompleted3);
							assert.strictEqual(that.oModel.resolveFromCache("/ProductSet('HT-1000')"), undefined, "Product path cache entry is never written.");
							assert.strictEqual(that.oModel.resolveFromCache("/ProductSet('HT-1004')"), "/ProductSet('HT-1004')", "Product path cache entry is correct.");
							checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
						};

						that.oModel.attachBatchRequestCompleted(fnBatchCompleted3);
						that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { "$expand": "ToProduct,ToProduct/ToSupplier" } });
					};
					that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { "$expand": "ToProduct,ToProduct/ToSupplier" } });
					that.oModel.attachBatchRequestCompleted(fnBatchCompleted2);
				};

				that.oModel.read("/SalesOrderSet('0500000000')", { urlParameters: { "$expand": "ToLineItems,ToLineItems/ToProduct" } });
				that.oModel.attachBatchRequestCompleted(fnBatchCompleted1);

			};
			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);

		});
	});


	QUnit.test("ODataModel.createBindingContext - Context chaining", function (assert) {
		var that = this;
		var done = assert.async();
		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')");
			var fnRequestCompleted = function (oEvent) {
				var oSalesOrderCtx = that.oModel.createBindingContext("/SalesOrderSet('0500000000')");
				that.oModel.read("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", {
					context: oSalesOrderCtx,
					success: function () {
						var oSalesOrderLineItemSetCtx = that.oModel.createBindingContext("ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", oSalesOrderCtx);
						assert.equal(oSalesOrderLineItemSetCtx && oSalesOrderLineItemSetCtx.sDeepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", "Deep path is set.");
						that.oModel.createBindingContext("ToProduct", oSalesOrderLineItemSetCtx, undefined, function (oProductCtx) {
							assert.equal(oProductCtx.sDeepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path is set.");
							assert.equal(that.oStubGetEntitySetByPath.callCount, 10, "Check number of cache misses.");
							assert.equal(that.iInvalidationCounter, 0, "Check number of cache invalidations necessary.");
							assert.equal(getLastRequest(that).deepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path is set when request is triggered by createBindingContext.");
							checkIfCacheEntriesAreValid(that.oModel, assert).then(done);
						});
					}
				});
				that.oModel.detachBatchRequestCompleted(fnRequestCompleted);
			};
			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});


	QUnit.test("ODataListBinding - Deep Path Usage", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel.metadataLoaded().then(function () {

			that.oModel.read("/SalesOrderSet('0500000000')");
			that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')");
			that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

			var fnRequestCompleted = function () {
				that.oModel.detachBatchRequestCompleted(fnRequestCompleted);

				var oODataListBinding = that.oModel.bindList("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems");
				oODataListBinding.initialize();
				oODataListBinding.attachDataReceived(function () {
					var aContexts = oODataListBinding.getContexts(1, 2);
					assert.equal(that.oModel.resolveDeep("ToProduct", aContexts[0]), "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ToSalesOrderLineItems(SalesOrderID='0500000007',ItemPosition='0000000070')/ToProduct",
						"Context is enriched with parent context information.");
					done();
				});
				oODataListBinding.loadData(1, 2);
			};
			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.test("ODataPropertyBinding - Deep Path Usage", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel.metadataLoaded().then(function () {
			var oODataPropertyBinding = that.oModel.bindProperty("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/ProductID");
			that.oModel.addBinding(oODataPropertyBinding);

			that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

			var fnRequestCompleted = function () {
				that.oModel.detachBatchRequestCompleted(fnRequestCompleted);
				assert.equal(oODataPropertyBinding.getValue(), "HT-1000", "Model value reached property binding.");
				done();
			};

			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.test("ODataModel._importData - Invalidation of null values", function (assert) {
		var that = this;
		var done = assert.async();
		var oObject;

		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { $expand: "ToProduct" } });
			var fnRequestCompleted = function () {
				that.oModel.detachBatchRequestCompleted(fnRequestCompleted);
				oObject = that.oModel.getObject("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
				assert.strictEqual(oObject["ProductID"], "HT-1000", "Navigation property is set correctly.");
				changeNavigationTargets(that.oMockServer);
				mResponseParameter.bRemoveProduct = true;

				that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { $expand: "ToProduct" } });

				var fnRequestCompleted2 = function () {
					that.oModel.detachBatchRequestCompleted(fnRequestCompleted2);
					oObject = that.oModel.getObject("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
					assert.strictEqual(oObject, null, "Navigation property was reset correctly.");
					done();
				};
				that.oModel.attachBatchRequestCompleted(fnRequestCompleted2);
			};

			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);
		});

	});
	QUnit.test("ODataModel._createRequest - Deep path is preserved even when requests have failed", function (assert) {
		var done = assert.async();
		var that = this;
		var oRequest;
		var oMessageModel = Messaging.getMessageModel();

		var oCreateEntryProduct = {
			properties: {
				"FirstName": "My Name"
			}
		};
		changeNavigationTargets(this.oMockServer);
		mResponseParameter.bCreateRequestFailure = true;

		this.oModel.metadataLoaded().then(function () {

			var fnRequestCompleted = function () {
				that.oModel.detachBatchRequestCompleted(fnRequestCompleted);

				oRequest = getLastRequest(that);
				assert.ok(oRequest.deepPath.startsWith("/ContactSet"), "Deep path is set initially.");
				assert.equal(oMessageModel.oData.length, 1, "Message created.");
				assert.equal(oMessageModel.oData[0].technical, true, "Technical message created.");
				assert.ok(oMessageModel.oData[0].aFullTargets[0].startsWith("/ContactSet"), "Deep Path is set.");

				var fnRequestCompleted2 = function () {
					that.oModel.detachBatchRequestCompleted(fnRequestCompleted2);
					oRequest = getLastRequest(that);

					assert.ok(oRequest.deepPath.startsWith("/ContactSet"), "Deep path is still set.");
					assert.ok(oMessageModel.oData[0].aFullTargets[0].startsWith("/ContactSet"), "Deep Path is set.");
					that.oRequestStub.restore();
					done();
				};

				that.oModel.attachBatchRequestCompleted(fnRequestCompleted2);
				mResponseParameter.bCreateRequestFailure = false;
				that.oModel.submitChanges();
			};

			that.oModel.attachBatchRequestCompleted(fnRequestCompleted);

			that.oModel.createEntry("/ContactSet", oCreateEntryProduct);
			that.oModel.submitChanges();
		});
	});

	QUnit.test("ODataModel._createRequest - Deep path behavior with property changes", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel.metadataLoaded().then(function () {

			var oContext = that.oModel.createEntry("/ContactSet", { properties: { "FirstName": "My Name" } });

			assert.ok(oContext.sDeepPath.startsWith("/ContactSet('id", "Deep path of Context is set to ContactSet plus uid"));
			assert.strictEqual(that.oModel.mChangedEntities[oContext.sPath.substring(1)].__metadata.deepPath, oContext.sDeepPath, "Deep path is set on changed entities.");

			that.oModel.setProperty("Text", "MyText", oContext);
			assert.strictEqual(that.oModel.mChangedEntities[oContext.sPath.substring(1)].__metadata.deepPath, oContext.sDeepPath, "Deep path is still the same.");

			that.oModel.read("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", {
				success: function () {

					that.oModel.setProperty("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/Category", "My category");
					assert.strictEqual(that.oModel.mChangedEntities["ProductSet('HT-1000')"].Category, "My category", "Category was set.");

					that.oModel.setProperty("/ProductSet('HT-1000')/Name", "My name");
					assert.strictEqual(that.oModel.mChangedEntities["ProductSet('HT-1000')"].Name, "My name", "Name was set");

					assert.strictEqual(that.oModel.mChangedEntities["ProductSet('HT-1000')"].__metadata.deepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path was set.");
					done();
				}
			});
		});
	});

	QUnit.test("ODataModel._invalidatePathCache - Ensure correct invalidation", function (assert) {

		this.oModel.mPathCache["/myEntity('1')/toStatus"] = { canonicalPath: "/myStatus('A')" };
		this.oModel.mPathCache["/myEntity('1')/toStatus/LongText"] = { canonicalPath: "/myStatus('A')/LongText" };
		this.oModel.mPathCache["/myEntity('1')/toStatus/Description"] = { canonicalPath: null };

		this.oModel.mInvalidatedPaths["('1')/toStatus"] = "/myStatus('C')";

		this.oModel._invalidatePathCache();

		assert.equal(this.oModel.mPathCache["/myEntity('1')/toStatus"].canonicalPath, "/myStatus('C')", "Correctly updated.");
		assert.equal(this.oModel.mPathCache["/myEntity('1')/toStatus/LongText"].canonicalPath, "/myStatus('C')/LongText", "Correctly updated.");
		assert.equal(this.oModel.mPathCache["/myEntity('1')/toStatus/Description"].canonicalPath, "/myStatus('C')/Description", "Correctly updated.");

	});



	QUnit.test("ODataModel._invalidatePathCache - Handle invalidated data entries correctly", function (assert) {
		var that = this;
		var done = assert.async();
		var oOriginalInvalidateFunction = this.oModel._invalidatePathCache;
		var mInvalidatedPaths;
		this.oModel._invalidatePathCache = function () {
			mInvalidatedPaths = {};
			Object.assign(mInvalidatedPaths, this.mInvalidatedPaths);
			oOriginalInvalidateFunction.apply(that.oModel, arguments);
		};

		this.oModel.metadataLoaded().then(function () {
			// Scenario 1
			that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { $expand: "ToProduct" } });
			var fnBatchCompleted1 = function () {
				that.oModel.detachBatchRequestCompleted(fnBatchCompleted1);
				assert.deepEqual(mInvalidatedPaths, {}, "No path invalidation happend.");
				// Scenario 2
				that.oModel.resolve("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct/Description", undefined, true);
				that.oModel.invalidateEntry("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')");
				changeNavigationTargets(that.oMockServer);
				mResponseParameter.bRemoveProduct = true;
				that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { $expand: "ToProduct" } });
				var fnBatchCompleted2 = function () {
					that.oModel.detachBatchRequestCompleted(fnBatchCompleted2);
					assert.deepEqual(mInvalidatedPaths, { "(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct": null }, "Set nav prop to null - Path invalidation necessary.");
					// Scenario 3
					that.oModel.invalidateEntry("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')");
					mResponseParameter.bRemoveProduct = false;
					that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { $expand: "ToProduct" } });
					var fnBatchCompleted3 = function () {
						that.oModel.detachBatchRequestCompleted(fnBatchCompleted3);
						assert.deepEqual(mInvalidatedPaths, {}, "Set from null to new nav prop - No path invalidation necessary.");
						//restore
						that.oModel._invalidatePathCache = oOriginalInvalidateFunction;
						done();
					};
					that.oModel.attachBatchRequestCompleted(fnBatchCompleted3);
				};
				that.oModel.attachBatchRequestCompleted(fnBatchCompleted2);
			};
			that.oModel.attachBatchRequestCompleted(fnBatchCompleted1);
		});
	});

	QUnit.test("ODataModel.createEntry - Deep path is set correctly", function (assert) {

		var that = this;
		var done = assert.async();

		this.oModel.metadataLoaded().then(function () {

			var oContext = that.oModel.createEntry("/ProductSet", oCreateEntryProduct);
			assert.strictEqual(that.oModel.mChangedEntities[oContext.sPath.substring(1)].__metadata.deepPath, oContext.sPath);
			oContext = that.oModel.createEntry("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", oCreateEntryProduct);
			assert.strictEqual(that.oModel.mChangedEntities[oContext.sPath.substring(1)].__metadata.deepPath, "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
			oContext = that.oModel.createEntry("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", oCreateEntryProduct);
			assert.strictEqual(that.oModel.mChangedEntities[oContext.sPath.substring(1)].__metadata.deepPath, "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");

			done();
		});

	});

	QUnit.test("ODataModel.deepResolve - Empty string binding path", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", { urlParameters: { $expand: "ToProduct" } });
			var fnBatchCompleted1 = function () {
				that.oModel.detachBatchRequestCompleted(fnBatchCompleted1);
				var oContext = that.oModel.createBindingContext("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct");
				assert.strictEqual(that.oModel.resolveDeep("", oContext), "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path is resolved correctly.");
				done();
			};
			that.oModel.attachBatchRequestCompleted(fnBatchCompleted1);
		});
	});

	QUnit.test("ODataModel.submitChanges/resetChanges - Synchronous reset changes call", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel.metadataLoaded().then(function () {
			that.oModel.createEntry("/ProductSet", oCreateEntryProduct);
			that.oModel.submitChanges();
			that.oModel.resetChanges();
			assert.ok("Reset works as expected");
			done();
		});
	});


	QUnit.test("ODataMessageParser: Deep Path with multiple nav props and without property", function (assert) {
		var that = this;
		var done = assert.async();
		changeNavigationTargets(that.oMockServer);

		this.oModel.metadataLoaded().then(function () {
			// fill path cache
			that.oModel.read("/BusinessPartnerSet('0100000000')", {
				urlParameters: { "$expand": "ToSalesOrders" },
				success: function(){
					mResponseParameter.mDeepSalesOrderMsg = "Msg";
					that.oModel.read("/BusinessPartnerSet('0100000000')", {
						success: function(){
							var oMsg = Messaging.getMessageModel().getData()[0];
							assert.equal(oMsg.aTargets[0], "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", "Message target is correctly set.");
							assert.equal(oMsg.aFullTargets[0], "/BusinessPartnerSet('0100000000')/ToSalesOrders('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')", "Message full target is correctly set.");
							done();
						}
					});
				}
			});
		});
	});

	QUnit.test("ODataMessageParser: Deep Path with multiple nav props and property", function (assert) {
		var that = this;
		var done = assert.async();
		changeNavigationTargets(that.oMockServer);

		this.oModel.metadataLoaded().then(function () {
			// fill path cache
			that.oModel.read("/BusinessPartnerSet('0100000000')", {
				urlParameters: { "$expand": "ToSalesOrders" },
				success: function(){
					mResponseParameter.mDeepSalesOrderMsg = "MsgWithProperty";
					that.oModel.read("/BusinessPartnerSet('0100000000')", {
						success: function(){
							var oMsg = Messaging.getMessageModel().getData()[0];
							assert.equal(oMsg.aTargets[0], "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/CurrencyCode", "Message target is correctly set.");
							assert.equal(oMsg.aFullTargets[0], "/BusinessPartnerSet('0100000000')/ToSalesOrders('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/CurrencyCode", "Message full target is correctly set.");
							done();
						}
					});
				}
			});
		});
    });

    QUnit.test("ODataModel.getContext - Synchronous reset changes call", function (assert) {
        var that = this;
        var done = assert.async();

        this.oModel.metadataLoaded().then(function () {
            var oContext = that.oModel.getContext("/ProductSet('HT-1000')");
            assert.equal(oContext.sDeepPath, oContext.sPath, "Deep path defaults to used path.");
            that.oModel.createBindingContext("/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", undefined, undefined, function(oNewContext){
                assert.strictEqual(oNewContext, oContext, "Same context reference");
                assert.equal(oNewContext.sDeepPath,"/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path is still set.");
                oContext = that.oModel.getContext("/ProductSet('HT-1000')");
                assert.equal(oContext.sDeepPath,"/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')/ToProduct", "Deep path is still set");
                done();
            });
        });
	});


	QUnit.test("ODataModel.createBindingContext - Canonical Request withs preliminary contexts", function (assert) {
        var that = this;
        var done = assert.async();

        this.oModel.metadataLoaded().then(function () {
			var sPathCanonicalResolvable = "/SalesOrderSet('0500000000')/ToLineItems(SalesOrderID='0500000000',ItemPosition='0000000010')";
			var sPathNotCanonicalResolvable = "/SalesOrderSet('0500000000')/ToBusinessPartner";

			var oContext = that.oModel.createBindingContext(sPathCanonicalResolvable, undefined, {createPreliminaryContext: true, canonicalRequest: true});
			assert.equal(oContext.getPath(), "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", "Canonical path is set.");
			assert.strictEqual(that.oModel.mContexts["/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')"], oContext, "Context is stored correctly.");

			oContext = that.oModel.createBindingContext(sPathNotCanonicalResolvable, undefined, {createPreliminaryContext: true, canonicalRequest: true});
			assert.equal(oContext.getPath(), "/SalesOrderSet('0500000000')/ToBusinessPartner", "Canonical path is set.");
			assert.strictEqual(that.oModel.mContexts["/SalesOrderSet('0500000000')/ToBusinessPartner"], oContext, "Context is stored correctly.");
			oContext.getPath();

			done();
		});
	});


	QUnit.module("Message Scope supported", {
		beforeEach: function () {
			this.sServiceUri = "/SalesOrderSrv/";
			var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";

			this.oMockServer = new MockServer({
				rootUri: this.sServiceUri
			});
			this.oMockServer.simulate(sDataRootPath + "metadata.xml", sDataRootPath);
			this.oMockServer.start();


		},
		afterEach: function () {
			this.oMockServer.stop();
			delete this.oModel;
			resetSharedData();
		}
	});

	QUnit.test("Message Scope supported by service - scope: RequestedObjects", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel = new ODataModel(this.sServiceUri, { canonicalRequests: true });
		this.oModel.setMessageScope(MessageScope.RequestedObjects);
		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')");

			var fnRequestCompleted = function (oEvent) {
				that.oModel.detachRequestCompleted(fnRequestCompleted);
				var mHeaders = oEvent.getParameter("headers");
				assert.ok(!mHeaders["sap-message-scope"], "Message scope set to 'RequestedObjects': no scope header set");
				done();
			};

			that.oModel.attachRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.test("Message Scope supported by service - scope: BusinessObject", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel = new ODataModel(this.sServiceUri, { canonicalRequests: true });
		this.oModel.setMessageScope(MessageScope.BusinessObject);
		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')");

			var fnRequestCompleted = function (oEvent) {
				that.oModel.detachRequestCompleted(fnRequestCompleted);
				var mHeaders = oEvent.getParameter("headers");
				assert.ok(mHeaders["sap-message-scope"], "Message scope set to 'RequestedObjects': scope header set");
				assert.equal(mHeaders["sap-message-scope"], MessageScope.BusinessObject, "Message scope set to 'BusinessObject': scope header set");
				that.oModel.messageScopeSupported()
					.then(function (bSupported) {
						assert.ok(bSupported);
						done();
					});
			};

			that.oModel.attachRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.module("Message Scope not supported", {
		beforeEach: function () {
			this.sServiceUri = "/SalesOrderSrv/";
			var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";

			this.oMockServer = new MockServer({
				rootUri: this.sServiceUri
			});
			this.oMockServer.simulate(sDataRootPath + "metadataMessageScope.xml", sDataRootPath);
			this.oMockServer.start();


		},
		afterEach: function () {
			this.oMockServer.stop();
			delete this.oModel;
			resetSharedData();
		}
	});

	QUnit.test("scope: BusinessObject", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel = new ODataModel(this.sServiceUri, { canonicalRequests: true });
		this.oModel.setMessageScope(MessageScope.BusinessObject);
		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')");

			var fnRequestCompleted = function (oEvent) {
				that.oModel.detachRequestCompleted(fnRequestCompleted);
				var mHeaders = oEvent.getParameter("headers");
				// if service does not support MessageScope.BusinessObject fall back to the default
				// MessageScope.RequestedObjects
				assert.notOk(mHeaders["sap-message-scope"],
					"Message scope 'BusinessObject' not set");
				that.oModel.messageScopeSupported()
					.then(function (bSupported) {
						assert.ok(!bSupported);
						done();
					});
			};

			that.oModel.attachRequestCompleted(fnRequestCompleted);
		});
	});

	QUnit.test("scope: RequestedObjects", function (assert) {
		var that = this;
		var done = assert.async();

		this.oModel = new ODataModel(this.sServiceUri, { canonicalRequests: true });
		this.oModel.setMessageScope(MessageScope.RequestedObjects);
		this.oModel.metadataLoaded().then(function () {
			that.oModel.read("/SalesOrderSet('0500000000')");

			var fnRequestCompleted = function (oEvent) {
				that.oModel.detachRequestCompleted(fnRequestCompleted);
				var mHeaders = oEvent.getParameter("headers");
				assert.ok(!mHeaders["sap-message-scope"], "Message scope set to 'RequestedObjects': no scope header set");
				done();
			};

			that.oModel.attachRequestCompleted(fnRequestCompleted);
		});
	});




});