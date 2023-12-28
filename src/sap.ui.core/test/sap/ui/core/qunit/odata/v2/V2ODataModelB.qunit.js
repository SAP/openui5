/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/m/Input",
	"sap/m/Label",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/UpdateMethod",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(each, isEmptyObject, Input, Label, MockServer, Filter, Sorter, UpdateMethod, ODataModel,
	Table, Column, nextUIUpdate) {

	"use strict";

	var sServiceUri = "/SalesOrderSrv/";
	var sDataRootPath =  "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";
	var oModel, spy;

	var oMockServer = new MockServer({
		rootUri: sServiceUri
	});

	function initServer() {
		oMockServer.simulate("test-resources/sap/ui/core/qunit/testdata/SalesOrder/metadata.xml", sDataRootPath);
		oMockServer.start();
	}

	function stopServer() {
		oMockServer.stop();
	}

	function initModel(bJSON, sUpdateMethod) {
		bJSON = bJSON !== false;
		return new ODataModel(sServiceUri, {json: bJSON, defaultUpdateMethod : sUpdateMethod});
	}

	function cleanSharedData() {
		ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
	}

	QUnit.module("ODataModelV2 XML", {
		beforeEach : function() {
			initServer();
		},
		afterEach : function() {
			cleanSharedData();
			oModel.destroy();
			oModel = undefined;
			stopServer();
		}
	});

	QUnit.test("read XML", function(assert) {
		var done = assert.async();
		oModel = initModel(false);
		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function() {
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Flyer", "absolute path without context");
					oModel.createBindingContext("/ProductSet('AD-1000')", null, function(newContext) {
						assert.equal(newContext.getProperty("Name"), "Flyer", "relative path with context");
						done(); // resume normal testing
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.module("ODataModelV2 JSON", {
		beforeEach : function() {
			initServer();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("Mockserver initialisation",  function(assert){
		oModel = initModel();
		assert.ok(oMockServer,"MockServer created");
		assert.ok(oMockServer.isStarted(), "Mock server is started");
	});

	QUnit.test("test init Model", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			assert.ok(true, "metadataloaded");
			done();
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("read JSON", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function() {
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Flyer", "absolute path without context");
					oModel.createBindingContext("/ProductSet('AD-1000')", null, function(newContext) {
						assert.equal(newContext.getProperty("Name"), "Flyer", "relative path with context");
						done(); // resume normal testing
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read with URLParams and headers JSON", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				urlParameters : {
					"$top" : "1",
					"$skip" : "1"
				},
				headers : {
					"myCustomHeader" : "xyz"
				},
				success : function(oData, oResponse) {
					assert.ok(oData.results.length === 1, "length check");
					var oP = oModel
							.getProperty("/ProductSet('HT-1000')");
					assert.ok(oP, "one entry loaded");
					assert.ok(oP.Name === "Notebook Basic 15",
							"one entry loaded");
					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test metadata promise", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			var oPromise = oModel.metadataLoaded();
			assert.ok(oPromise, "promise exists");
			oPromise.then(function(result){
				assert.ok(true, "Promise resolved");
				done();
			}, function(){
				assert.ok(false, "Promise rejected");
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise and refresh", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.detachMetadataLoaded(fnTest);
			var oPromise = oModel.metadataLoaded();
			assert.ok(oPromise, "promise exists");
			oPromise.then(function(result){
				assert.ok(true, "Promise resolved");
				var oNewP = oModel.refreshMetadata();
				assert.ok(oNewP, "oNewP promise exists");
				return oNewP;
			}, function(){
				assert.ok(false, "Promise rejected");
			})
			.then(function(result){
				assert.ok(true, "oNewP Promise resolved");
				var oNewP2 = oModel.refreshMetadata();
				assert.ok(oNewP2, "oNewP2 promise exists");
				return oNewP2;
			}, function(){
				assert.ok(false, "oNewP Promise rejected");
			})
			.then(function(result){
				assert.ok(true, "oNewP2 Promise resolved");
				done();
			}, function(){
				assert.ok(false, "oNewP2 Promise rejected");
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise ok then refresh failed", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			var sTempService = sServiceUri;
			oModel.detachMetadataLoaded(fnTest);
			var oPromise = oModel.metadataLoaded();
			assert.ok(oPromise, "promise exists");
			oPromise.then(function(result){
				assert.ok(true, "Promise resolved");
				sServiceUri = "/doesnotWork/";
				oModel.oMetadata.sUrl = sServiceUri + "$metadata";
				var oNewP = oModel.refreshMetadata();
				assert.ok(oNewP, "oNewP promise exists");
				return oNewP;
			}, function(){
				assert.ok(false, "Promise rejected which should never happen");
			})
			.then(function(result){
				assert.ok(false, "oNewP Promise resolved");
			}, function(){
				assert.ok(true, "oNewP Promise rejected");
				cleanSharedData();
				sServiceUri = sTempService;
				done();
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise ok then refresh failed then refresh ok", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.detachMetadataLoaded(fnTest);
			var sTempService = sServiceUri;
			var oPromise = oModel.metadataLoaded();
			assert.ok(oPromise, "promise exists");
			oPromise.then(function(result){
				assert.ok(true, "Promise resolved");
				sServiceUri = "/doesnotWork/";
				oModel.oMetadata.sUrl = sServiceUri + "$metadata";
				var oNewP = oModel.refreshMetadata();
				assert.ok(oNewP, "oNewP promise exists");
				return oNewP;
			}, function(){
				assert.ok(false, "Promise rejected which should never happen");
			}).then(function(result){
				assert.ok(false, "oNewP Promise resolved");
			}, function(){
				assert.ok(true, "oNewP Promise rejected");
				// fix url
				oModel.oMetadata.sUrl = sTempService + "$metadata";
				var oNewP2 = oModel.refreshMetadata();
				assert.ok(oNewP2, "oNewP2 promise exists");
				return oNewP2;
			})
			.then(function(result){
				assert.ok(true, "oNewP2 Promise resolved");
				cleanSharedData();
				sServiceUri = sTempService;
				done();
			}, function(){
				assert.ok(false, "oNewP2 Promise rejected");
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read filter test", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				filters : [ new Filter("ProductID", "EQ",
						"HT-1000") ],
				success : function(oData, oResponse) {
					assert.ok(oData.results.length === 1, "length check");
					var oP = oModel.getProperty("/ProductSet('HT-1000')");
					assert.ok(oP, "one entry loaded");
					assert.ok(oP.Name === "Notebook Basic 15", "one entry loaded");
					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read count request with filter test", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet/$count", {
				filters : [ new Filter("ProductID", "EQ",
						"HT-1000") ],
				success : function(oData, oResponse) {
					assert.ok(oData === "1", "length check");
					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read sort test", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				sorters : [ new Sorter("ProductID", true) ],
				filters : [ new Filter("ProductID", "EQ", "HT-1000"),
						new Filter("ProductID", "EQ", "AD-1000"),
						new Filter("ProductID", "EQ", "HT-1041") ],
				success : function(oData, oResponse) {
					assert.ok(oData.results.length === 3, "length check");
					assert.ok(oData.results[0].ProductID === "HT-1041", "sort check");
					assert.ok(oData.results[1].ProductID === "HT-1000", "sort check");
					assert.ok(oData.results[2].ProductID === "AD-1000", "sort check");

					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read error test", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductXYSet", {
				success : function(oData, oResponse) {
					assert.ok(false, "request succeeded...error expected");
				},
				error : function(oError) {
					assert.ok(oError.statusCode === "404", "error code");
					assert.ok(true, "request failed");
					done();
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel remove error test", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.remove("/ProductSet('Error')", {
				success : function(oData, oResponse) {
					assert.ok(false, "request succeeded...error expected");
				},
				error : function(oError) {
					assert.ok(oError, "error succeeded");
					done();
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel remove error test batch off", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setUseBatch(false);
		var fnTest = function() {
			oModel.remove("/ProductSet('Error')", {
				success : function(oData, oResponse) {
					assert.ok(false, "request succeeded...error expected");
				},
				error : function(oError) {
					assert.ok(oError, "error succeeded");
					done();
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});


	QUnit.test("test oDataModel read with no batchgroup ids", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.read("/ContactSet", {
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with no ids should should be combined in a single batch request");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read with different batchgroup ids", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				batchGroupId : "myId1",
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.read("/ContactSet", {
				batchGroupId : "myId2",
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with different ids should be in separate batch requests");
				done();
			}
		});

		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read with same batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				batchGroupId : "myId",
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.read("/ContactSet", {
				batchGroupId : "myId",
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with same id should be combined in a batch request");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read deferred with batchGroupId", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setDeferredGroups([ "myId" ]);
		var fnTest = function() {
			oModel.read("/ProductSet", {
				batchGroupId : "myId",
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});

			oModel.submitChanges();
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read deferred with default batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		oModel.setDeferredGroups([ undefined ]);
		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});

			oModel.read("/ContactSet", {
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.submitChanges();
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with same default id should be combined in a batch request");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read deferred with same batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		oModel.setDeferredGroups([ "myId1" ]);
		var fnTest = function() {
			oModel.read("/ProductSet", {
				batchGroupId : "myId1",
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});

			oModel.read("/ContactSet", {
				batchGroupId : "myId1",
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.submitChanges();
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with same id should be combined in a batch request");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read deferred with different batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		oModel.setDeferredGroups([ "myId1", "myId2" ]);
		var fnTest = function() {
			oModel.read("/ProductSet", {
				batchGroupId : "myId1",
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});

			oModel.read("/ContactSet", {
				batchGroupId : "myId2",
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.submitChanges();
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with different ids should be in separate batch requests");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read deferred with batchGroupId and submitChanges callback handler test", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		oModel = initModel();
		oModel.setDeferredGroups([ "myId" ]);
		var fnTest = function() {
			oModel.read("/ProductSet", {
				batchGroupId : "myId",
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});

			oModel.submitChanges({
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.ok(bSuccess, "callback handler of internal request should have been called");
					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel bind Object", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTxt = new Input({
			value : "{Category}"
		});
		oTxt.setModel(oModel);
		var fnTest = function() {
			oTxt.bindObject("/VH_CategorySet('Headsets')");
		};
		var fnCheck = function() {
			iCount++;
			assert.ok(iCount === 1, "request performed");
			assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
			oTxt.destroy();
			oModel.detachBatchRequestCompleted(fnCheck);
			done();
		};

		oModel.attachBatchRequestCompleted(this, fnCheck);
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel read and bind Object", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTxt = new Input({
			value : "{Category}"
		});
		oTxt.setModel(oModel);
		var fnTest = function() {
			oModel.read("/VH_CategorySet", {
				batchGroupId : "myId",
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");

					assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
					// should not fire a request as data is already loaded by read above
					oTxt.bindObject("/VH_CategorySet('Headsets')");

					var fnCheck = function(oEvent) {
						iCount++;
						if (iCount === 2) {
							assert.ok(false, "request performed but should not go out as data already loaded by read request before");
						}
						oTxt.destroy();
						oModel.detachBatchRequestCompleted(fnCheck);
						done();
					};
					oModel.attachBatchRequestCompleted(
						this, fnCheck
					);
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel listbinding with table", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var fnTest = function() {
			oTable.bindRows({
				path : "/VH_CategorySet"
			});
		};

		var fnCheck = function() {
			iCount++;
			assert.ok(iCount === 1, "request performed");
			assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"),
					"Beamers", "Category loaded check");
			assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"),
					"Headsets", "Category loaded check");
			assert.ok(oTable.getBinding('rows').getLength() >= 2,
					"Category size check");
			oTable.destroy();
			oTable = null;
			oModel.detachBatchRequestCompleted(fnCheck);
			done();
		};

		oModel.attachBatchRequestCompleted(this, fnCheck);
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel listbinding with aggregation binding and read in default batch group", function(assert) {
		var done = assert.async();
		var iCallCount = 0;
		var bRead1 = false;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var fnTest = function() {
			oTable.bindRows({
				path : "/VH_CategorySet"
			});
			oModel.read("/VH_CategorySet", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead1 = true;
					iCallCount++;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		var fnCheck = function() {
			iCallCount++;

			if (iCallCount === 2 && bRead1) {
				assert.ok(true, "request Completed event 1x (==1 request) and succesHandler from read should be called 1x");
				assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"), "Beamers", "Category loaded check");
				assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oTable = null;
				oModel.detachBatchRequestCompleted(fnCheck);
				done();
			}
		};
		oModel.attachBatchRequestCompleted(this, fnCheck);
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel listbinding with aggregation binding and read in different batch groups", function(assert) {
		var done = assert.async();
		var iCallCount = 0;
		var bRead1 = false;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var fnTest = function() {
			oTable.bindRows({
				path : "/VH_CategorySet",
				batchGroupId : "myId1"
			});
			oModel.read("/ProductSet", {
				batchGroupId : "myId2",
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
					iCallCount++;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		var fnCheck = function() {
			iCallCount++;
			if (iCallCount === 3 && bRead1) {
				assert.ok(true, "requestCompleted event 2x (==2 requests) and read succes handler should be called 1x");
				assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"), "Beamers", "Category loaded check");
				assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oTable = null;
				oModel.detachBatchRequestCompleted(fnCheck);
				done();
			}
		};
		oModel.attachBatchRequestCompleted(this, fnCheck);
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel listbinding with aggregation binding and read in different deferred batch groups", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var iCallCount = 0;
		var bRead1 = false;
		var oTable = new Table();
		oModel.setDeferredGroups([ "myId1", "myId2" ]);
		oTable.setModel(oModel);
		var fnTest = function() {
			oTable.bindRows({
				path : "/VH_CategorySet",
				batchGroupId : "myId1"
			});
			oModel.read("/ProductSet", {
				batchGroupId : "myId2",
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
					iCallCount++;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.submitChanges();
		};
		var fnCheck = function(mArguments) {
			iCallCount++;
			if (iCallCount === 3 && bRead1) {
				assert.ok(true, "requestCompleted event 2x (==2 requests) and read succes handler should be called 1x");
				assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"), "Beamers", "Category loaded check");
				assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oTable = null;
				oModel.detachBatchRequestCompleted(fnCheck);
				done();
			}
		};
		oModel.attachBatchRequestCompleted(this, fnCheck);
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel use batch off option", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel = initModel();
		oModel.setUseBatch(false);

		oModel.attachRequestCompleted(this,function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with same default id should be in 2 non batch requests");
				done();
			}
		});
		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function(oData, oResponse) {
					bRead1 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});

			oModel.read("/VH_CategorySet", {
				success : function(oData, oResponse) {
					bRead2 = true;
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.module("ODataModelV2 write", {
		beforeEach : function() {
			initServer();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("test oDataModel update", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var fnTest = function() {
			oModel.update("/ProductSet('AD-1000')", {
				Name : "Test"
			}, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					done();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
					done();
				},
				merge : true,
				eTag : "*"
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel update Read default batchgroup", function(assert) {
		var done = assert.async();
		var bUpdate = false;
		var bRead = false;
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var fnTest = function() {
			oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello"
			}, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bUpdate = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
					done();
				},
				merge : true,
				eTag : "*"
			});

			oModel.read("/ProductSet('AD-1000')", {
				success : function(oData, oResponse) {
					assert.ok(bUpdate, "update should have been called first");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Hello", "check read change");
					bRead = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
					done();
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			if (bRead && bUpdate) {
				assert.ok(true, "requests with same default id should be in 1 batch requests");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel update and read in different batchgroups",function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bUpdate = false;
		var bRead = false;
		var fnTest = function() {
			oModel.update("/ProductSet('AD-1000')", {
					Name : "Hello2"
			    }, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bUpdate = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				merge: true,
				eTag: "*",
				batchGroupId: "myId1"
			});

			oModel.read("/ProductSet('AD-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId2"
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead && bUpdate) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel update and 2 read in different deferred and non deferred batchgroups", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bUpdate = false;
		var bRead = false;
		var bRead2 = false;
		oModel.setDeferredGroups(["myId1", "myId2"]);
		var fnTest = function() {
			oModel.update("/ProductSet('AD-1000')", {
					Name : "Hello2"
			    }, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bUpdate = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				merge: true,
				eTag: "*",
				batchGroupId: "myId1"
			});

			oModel.read("/ProductSet('AD-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId2"
			});

			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead2 = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}

			});
			oModel.submitChanges();
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 3 && bRead && bUpdate && bRead2) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel create", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bCreate = false;
		var fnTest = function() {
			oModel.create("/ProductSet", {
				"ProductID":"AD-1111",
				"TypeCode":"AD",
				"Category":"Computer system accessories",
				"Name":"Test",
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
				"DimUnit":"M",
				"CreatedAt":"\/Date(1413795983000)\/",
				"ChangedAt":"\/Date(1413795983000)\/"
			    }, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oData.Name, "Test", "response check");
					assert.equal(oModel.getProperty("/ProductSet('AD-1111')/Name"), "Test", "new data should already be imorpted into model");
					bCreate = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bCreate) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel delete", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRemove = false;
		var fnTest = function() {
			oModel.remove("/ProductSet('AD-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), undefined, "new data should already be imorpted into model");
					bRemove = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				eTag: "*"
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bRemove) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel READ and delete in different batch groups, DELETE deferred", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bRemove = false;
		oModel.setDeferredGroups(["myId2"]);
		var fnTest = function() {
			oModel.read("/ProductSet('AD-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Flyer", "data read check");
					bRead = true;
					oModel.submitChanges();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId1"
			});


			oModel.remove("/ProductSet('AD-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), undefined, "data should also have been removed from the model");
					bRemove = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				eTag: "*",
				batchGroupId: "myId2"
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 2 && bRemove && bRead) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel Two Way", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bMetadataLoaded = false;
		var bSetProp = false;
		oModel.setDefaultBindingMode("TwoWay");

		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});

		var oTable = new Table();
		oTable.setModel(oModel);
		bMetadataLoaded = true;

		var fnTest = function() {
			oTable.bindRows({path: "/ProductSet"});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");

			}

			if (iCount === 2 && bSetProp) {
				assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
				oTable.destroy();
				oTable = null;
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel Two Way deferred with using changeBatchGroups", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bMetadataLoaded = false;
		var bSetProp = false;
		oModel.setDefaultBindingMode("TwoWay");
		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: true
			}
		});
		var oTable = new Table();
		oTable.setModel(oModel);
		bMetadataLoaded = true;
		var fnTest = function() {
			oTable.bindRows({path: "/ProductSet"});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
				assert.ok(oModel.hasPendingChanges(), "Pending changes test");
				oModel.submitChanges({success: function(oParams){
					assert.ok(true, "request called");
					assert.ok(bSetProp, "set Property succesful");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					assert.ok(!oModel.hasPendingChanges(), "Pending changes test");
					oTable.destroy();
					oTable = null;
					done();
				}});
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel Two Way 2 changes deferred with using changeBatchGroups and single=true (= 2 changesets)", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bMetadataLoaded = false;
		var bSetProp = false;
		var bSetProp2 = false;
		oModel.setDefaultBindingMode("TwoWay");
		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: true
			}
		});
		var oTable = new Table();
		oTable.setModel(oModel);
		bMetadataLoaded = true;

		var fnTest = function() {
			oTable.bindRows({path: "/ProductSet"});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
				bSetProp2 = oModel.setProperty("/ProductSet('HT-1000')/Name", "NewValue2");
				assert.ok(oModel.hasPendingChanges(), "Pending changes test");
				oModel.submitChanges({success: function(oParams){
					assert.ok(true, "request called");
					assert.ok(bSetProp, "set property successful");
					assert.ok(bSetProp2, "set property successful");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "NewValue2", "Two Way check");

					assert.equal(oParams.__batchResponses.length,2, "should be 2 changesets");
					assert.equal(oParams.__batchResponses[0].__changeResponses.length,1, "should be 1 response");
					assert.equal(oParams.__batchResponses[0].__changeResponses[0].statusCode,"204", "statuscode OK");
					assert.equal(oParams.__batchResponses[1].__changeResponses.length,1, "should be 1 response");
					assert.equal(oParams.__batchResponses[1].__changeResponses[0].statusCode,"204", "statuscode OK");

					assert.ok(!oModel.hasPendingChanges(), "Pending changes test");
					oTable.destroy();
					oTable = null;
					done();
				}});
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel Two Way 2 changes deferred with using changeBatchGroups and single=false (= 1 changeset)", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bMetadataLoaded = false;
		var bSetProp = false;
		var bSetProp2 = false;
		oModel.setDefaultBindingMode("TwoWay");
		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: false
			}
		});
		var oTable = new Table();
		oTable.setModel(oModel);
		bMetadataLoaded = true;

		var fnTest = function() {
			oTable.bindRows({path: "/ProductSet"});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
				bSetProp2 = oModel.setProperty("/ProductSet('HT-1000')/Name", "NewValue2");
				assert.ok(oModel.hasPendingChanges(), "Pending changes test");
				oModel.submitChanges({success: function(oParams){
					assert.ok(true, "request called");
					assert.ok(bSetProp, "set property successful");
					assert.ok(bSetProp2, "set property successful");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "NewValue2", "Two Way check");

					assert.equal(oParams.__batchResponses.length,1, "should be 1 changesets");
					assert.equal(oParams.__batchResponses[0].__changeResponses.length,2, "should be 2 responses");
					assert.equal(oParams.__batchResponses[0].__changeResponses[0].statusCode,"204", "statuscode OK");
					assert.equal(oParams.__batchResponses[0].__changeResponses[1].statusCode,"204", "statuscode OK");

					assert.ok(!oModel.hasPendingChanges(), "Pending changes test");
					oTable.destroy();
					oTable = null;
					done();
				}});
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel list binding", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bMetadataLoaded = false;
		oModel.setDefaultBindingMode("TwoWay");

		var oTable = new Table();
		oTable.setModel(oModel);
		bMetadataLoaded = true;

		var fnTest = function() {
			oTable.bindRows({path: "/ProductSet"});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				var oBinding = oTable.getBinding('rows');
				assert.equal(oBinding.sPath, "/ProductSet", "path check");
				assert.equal(oBinding.getLength(), 115, "length check");
				assert.ok(oBinding.getContexts(), "context check");
				assert.ok(oBinding.sCountMode, "Request", "count mode check");
				oTable.destroy();
				oTable = null;
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel setProperty with non deferred requests", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;

		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});

		var fnTest = function() {
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead = true;
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel setProperty without batch", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel.setUseBatch(false);

		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});
		var fnTest = function() {
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead = true;
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel setProperty deferred", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		var bSuccess = false;

		var fnTest = function() {
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product": {
							groupId: "myId",
							changeSetId: "Test",
							single: true
						}
					});
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							bSuccess = true;
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel setProperty aka MERGE and GET in same batch deferred", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

		var fnTest = function() {
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/TypeCode"), "PR", "check typecode");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product": {
							groupId: "myId",
							changeSetId: "Test",
							single: true
						}
					});
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					oModel.read("/ProductSet('HT-1000')", {
						batchGroupId : "myId",
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bRead2 = true;

						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
					oModel.submitChanges({
						success : function(oData, oResponse) {
							bSuccess = true;
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/TypeCode"), "PR", "check typecode");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel two Way MERGE delta change batch on", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product": {
							groupId: "myId",
							changeSetId: "Test",
							single: true
						}
					});
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.6");
					oModel.read("/ProductSet('HT-1000')", {
						batchGroupId : "myId",
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bRead2 = true;

						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
					spy = sinon.spy(oModel, "_processChange");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.equal(spy.callCount, 1, "processChange call count");
							var oRequest = spy.returnValues[0];
							assert.equal(oRequest.method, "MERGE", "request method");
							assert.equal(oRequest.requestUri, "ProductSet('HT-1000')", "request URI");
							assert.equal(oRequest.data.Name, "xy", "request payload name");
							assert.equal(oRequest.data.Price, "4445.6", "request payload price");
							assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currencyCode." +
							"Should be also here because price is a currency and has sap:unit = currency code");
							var iCount = 0;
							each(oRequest.data, function(iIndex, oValue){
								iCount++;
							});
							assert.equal(iCount, 4, "request payload number of properties");
							spy.restore();
							bSuccess = true;
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "4445.6", "check price");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel two Way MERGE delta change batch on with sap:unit modified", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

		oModel.read("/ProductSet('HT-1000')", {
			success : function(oData, oResponse) {
				assert.ok(true, "request succeeded");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
				bRead = true;
				oModel.setDeferredGroups(["myId"]);
				oModel.setChangeGroups({
					"Product" : {
						groupId : "myId",
						changeSetId : "Test",
						single : true
					}
				});
				bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
				bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.6");
				bSetProp = oModel.setProperty("/ProductSet('HT-1000')/CurrencyCode", "USD");
				oModel.read("/ProductSet('HT-1000')", {
					batchGroupId : "myId",
					success : function(oData, oResponse) {
						assert.ok(true, "request succeeded");
						bRead2 = true;

					},
					error : function(oError) {
						assert.ok(false, "request failed");
					}
				});
				spy = sinon.spy(oModel, "_processChange");
				oModel.submitChanges({
					success : function(oData, oResponse) {
						assert.equal(spy.callCount, 1, "processChange call count");
						var oRequest = spy.returnValues[0];
						assert.equal(oRequest.method, "MERGE", "request method");
						assert.equal(oRequest.requestUri, "ProductSet('HT-1000')", "request URI");
						assert.equal(oRequest.data.Name, "xy", "request payload name");
						assert.equal(oRequest.data.Price, "4445.6", "request payload price");
						assert.equal(oRequest.data.CurrencyCode, "USD", "request payload currencyCode." +
								"Should be also here because price is a currency and has sap:unit = currency code");
						var iCount = 0;
						each(oRequest.data, function(iIndex, oValue) {
							iCount++;
						});
						assert.equal(iCount, 4, "request payload number of properties");
						spy.restore();
						bSuccess = true;
					},
					error : function(oError) {
						spy.restore();
						assert.ok(false, "request failed");
					}
				});
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "4445.6", "check price");
				spy.restore();
				done();
			}
		});

	});

	QUnit.test("test oDataModel two Way MERGE delta change batch off", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel.setUseBatch(false);

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					bRead = true;

					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.8");
					spy = sinon.spy(oModel, "_processChange");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.ok(false,"should not be called if batch off");
							spy.restore();
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false,"should not be called if batch off");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "processChange call count");
				var oRequest = spy.returnValues[0];
				assert.equal(oRequest.method, "POST", "request method");
				assert.equal(oRequest.headers['x-http-method'], "MERGE", "request method");
				assert.equal(oRequest.requestUri, "/SalesOrderSrv/ProductSet('HT-1000')", "request URI");
				assert.equal(oRequest.data.Name, "xy", "request payload name");
				assert.equal(oRequest.data.Price, "4445.8", "request payload price");
				assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currencyCode." +
				"Should be also here because price is a currency and has sap:unit = currency code");
				var iCount2 = 0;
				each(oRequest.data, function(iIndex, oValue){
					iCount2++;
				});
				assert.equal(iCount2, 4, "request payload number of properties");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel two Way submitChanges with PUT option and batch on", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product": {
							groupId: "myId",
							changeSetId: "Test",
							single: true
						}
					});
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.6");
					oModel.read("/ProductSet('HT-1000')", {
						batchGroupId : "myId",
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bRead2 = true;

						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
					spy = sinon.spy(oModel, "_processChange");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.equal(spy.callCount, 1, "processChange call count");
							var oRequest = spy.returnValues[0];
							assert.equal(oRequest.method, "PUT", "request method");
							assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
							assert.equal(oRequest.requestUri, "ProductSet('HT-1000')", "request URI");
							assert.equal(oRequest.data.Name, "xy", "request payload name");
							assert.equal(oRequest.data.Price, "4445.6", "request payload price");
							assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currency code should be there and not changed!!!");
							var iCount = 0;
							each(oRequest.data, function(iIndex, oValue){
								iCount++;
							});
							assert.equal(iCount, 22, "request payload number of properties");
							spy.restore();
							bSuccess = true;
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false, "request failed");
						},
						merge : false
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "4445.6", "check price");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel two Way submitChanges with defaultUpdateMethod= PUT option and batch on", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

		oModel = initModel(true, UpdateMethod.Put);
		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product" : {
							groupId : "myId",
							changeSetId : "Test",
							single : true
						}
					});
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.6");
					oModel.read("/ProductSet('HT-1000')", {
						batchGroupId : "myId",
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bRead2 = true;

						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
					spy = sinon.spy(oModel, "_processChange");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.equal(spy.callCount, 1, "processChange call count");
							var oRequest = spy.returnValues[0];
							assert.equal(oRequest.method, "PUT", "request method");
							assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
							assert.equal(oRequest.requestUri, "ProductSet('HT-1000')", "request URI");
							assert.equal(oRequest.data.Name, "xy", "request payload name");
							assert.equal(oRequest.data.Price, "4445.6", "request payload price");
							assert.equal(oRequest.data.CurrencyCode, "EUR",
									"request payload currency code should be there and not changed!!!");
							var iCount = 0;
							each(oRequest.data, function(iIndex, oValue) {
								iCount++;
							});
							assert.equal(iCount, 22, "request payload number of properties");
							spy.restore();
							bSuccess = true;
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "4445.6", "check price");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel two Way submitChanges with PUT option and batch off", function(assert) {
		var done = assert.async();
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel.setUseBatch(false);

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;

					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.8");
					spy = sinon.spy(oModel, "_processChange");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.ok(false,"should not be called if batch off");
							spy.restore();
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false,"should not be called if batch off");
						},
						merge: false
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "processChange call count");
				var oRequest = spy.returnValues[0];
				assert.equal(oRequest.method, "PUT", "request method");
				assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
				assert.equal(oRequest.requestUri, "/SalesOrderSrv/ProductSet('HT-1000')", "request URI");
				assert.equal(oRequest.data.Name, "xy", "request payload name");
				assert.equal(oRequest.data.Price, "4445.8", "request payload price");
				assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currency code should be there and not changed!!!");
				var iCount2 = 0;
				each(oRequest.data, function(iIndex, oValue){
					iCount2++;
				});
				assert.equal(iCount2, 22, "request payload number of properties ");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel two Way submitChanges with defaultUpdateMethod = PUT option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel = initModel(true, UpdateMethod.PUT);
		oModel.setUseBatch(false);

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;

					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Name", "xy");
					bSetProp = oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.8");
					spy = sinon.spy(oModel, "_processChange");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.ok(false, "should not be called if batch off");
							spy.restore();
						},
						error : function(oError) {
							assert.ok(false, "should not be called if batch off");
							spy.restore();
						},
						merge : false
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "processChange call count");
				var oRequest = spy.returnValues[0];
				assert.equal(oRequest.method, "PUT", "request method");
				assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
				assert.equal(oRequest.requestUri,"/SalesOrderSrv/ProductSet('HT-1000')", "request URI");
				assert.equal(oRequest.data.Name, "xy", "request payload name");
				assert.equal(oRequest.data.Price, "4445.8", "request payload price");
				assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currency code should be there and not changed!!!");
				var iCount2 = 0;
				each(oRequest.data, function(iIndex, oValue) {
					iCount2++;
				});
				assert.equal(iCount2, 22, "request payload number of properties ");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel setProperty defaultUpdateMethod = PUT option", function(assert) {
		var done = assert.async();
		oModel = initModel(true, UpdateMethod.Put);
		oModel.setUseBatch(false);
		spy = sinon.spy(oModel, "_processChange");

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					oModel.setProperty("/ProductSet('HT-1000')/Price", "4445.8");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			assert.equal(spy.callCount, 1, "processChange call count");
			var oRequest = spy.returnValues[0];
			assert.equal(oRequest.method, "PUT", "request method");
			assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
			assert.equal(oRequest.requestUri,"/SalesOrderSrv/ProductSet('HT-1000')", "request URI");
			assert.equal(oRequest.data.Name, "Notebook Basic 15", "request payload name");
			assert.equal(oRequest.data.Price, "4445.8", "request payload price");
			assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currency code should be there and not changed!!!");
			spy.restore();
			done();
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod= MERGE option and batch on", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSuccess = false;

		oModel = initModel(true); // default should be merge

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product" : {
							groupId : "myId",
							changeSetId : "Test",
							single : true
						}
					});
					oModel.update("/ProductSet('HT-1000')", {
						Name : "Test"
					    }, {
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						},
						eTag: "*",
						batchGroupId: "myId"
					});
					oModel.read("/ProductSet('HT-1000')", {
						batchGroupId : "myId",
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bRead2 = true;

						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
					spy = sinon.spy(oModel, "_submitBatchRequest");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.equal(spy.callCount, 1, "processChange call count");
							var oRequest = spy.args[0][1][0][0].request;
							assert.equal(oRequest.method, "MERGE", "request method");
							assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
							assert.equal(oRequest.requestUri, "ProductSet('HT-1000')", "request URI");
							assert.equal(oRequest.data.Name, "Test", "request payload name");
							var iCount = 0;
							each(oRequest.data, function(iIndex, oValue) {
								iCount++;
							});
							assert.equal(iCount, 1, "request payload number of properties");
							spy.restore();
							bSuccess = true;
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Test", "check changed name");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod= PUT option and batch on", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSuccess = false;

		oModel = initModel(true, UpdateMethod.Put);

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;
					oModel.setDeferredGroups(["myId"]);
					oModel.setChangeGroups({
						"Product" : {
							groupId : "myId",
							changeSetId : "Test",
							single : true
						}
					});
					oModel.update("/ProductSet('HT-1000')", {
						Name : "Test"
					    }, {
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						},
						eTag: "*",
						batchGroupId: "myId"
					});
					oModel.read("/ProductSet('HT-1000')", {
						batchGroupId : "myId",
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bRead2 = true;

						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
					spy = sinon.spy(oModel, "_submitBatchRequest");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.equal(spy.callCount, 1, "processChange call count");
							var oRequest = spy.args[0][1][0][0].request;
							assert.equal(oRequest.method, "PUT", "request method");
							assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
							assert.equal(oRequest.requestUri, "ProductSet('HT-1000')", "request URI");
							assert.equal(oRequest.data.Name, "Test", "request payload name");
							var iCount = 0;
							each(oRequest.data, function(iIndex, oValue) {
								iCount++;
							});
							assert.equal(iCount, 1, "request payload number of properties");
							spy.restore();
							bSuccess = true;
						},
						error : function(oError) {
							spy.restore();
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Test", "check changed name");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod = MERGE option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bUpdate = false;
		oModel = initModel(true, UpdateMethod.Merge);
		oModel.setUseBatch(false);

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;

					spy = sinon.spy(oModel, "_submitSingleRequest");
					oModel.update("/ProductSet('HT-1000')", {
						Name : "Test3"
					    }, {
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bUpdate = true;
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						},
						eTag: "*",
						batchGroupId: "myId"
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bUpdate && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "call count");
				var oRequest = spy.args[0][0].request;
				assert.equal(oRequest.method, "POST", "request method");
				assert.ok(oRequest.headers['x-http-method'] === "MERGE", "request method header should not be present");
				assert.equal(oRequest.requestUri,"/SalesOrderSrv/ProductSet('HT-1000')", "request URI");
				assert.equal(oRequest.data.Name, "Test3", "request payload name");
				var iCount2 = 0;
				each(oRequest.data, function(iIndex, oValue) {
					iCount2++;
				});
				assert.equal(iCount2, 1, "request payload number of properties ");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod = PUT option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bUpdate = false;
		oModel = initModel(true, UpdateMethod.Put);
		oModel.setUseBatch(false);

		var fnTest = function(){
			oModel.read("/ProductSet('HT-1000')", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Notebook Basic 15", "check name");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Price"), "956.0", "check price");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/CurrencyCode"), "EUR", "check price");
					bRead = true;

					spy = sinon.spy(oModel, "_submitSingleRequest");
					oModel.update("/ProductSet('HT-1000')", {
						Name : "Test2"
					    }, {
						success : function(oData, oResponse) {
							assert.ok(true, "request succeeded");
							bUpdate = true;
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						},
						eTag: "*",
						batchGroupId: "myId"
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bUpdate && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "call count");
				var oRequest = spy.args[0][0].request;
				assert.equal(oRequest.method, "PUT", "request method");
				assert.ok(oRequest.headers['x-http-method'] === undefined, "request method header should not be present");
				assert.equal(oRequest.requestUri,"/SalesOrderSrv/ProductSet('HT-1000')", "request URI");
				assert.equal(oRequest.data.Name, "Test2", "request payload name");
				var iCount2 = 0;
				each(oRequest.data, function(iIndex, oValue) {
					iCount2++;
				});
				assert.equal(iCount2, 1, "request payload number of properties ");
				spy.restore();
				done();
			}
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel createEntry and setProperty deferred", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bSuccess1 = false;
		var bSuccess2 = false;
		var oContext;
		oModel = initModel();
		oModel.setRefreshAfterChange(false);

		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: true
			}
		});
		var fnTest = function(){
			oContext = oModel.createEntry("/ProductSet", {properties: {
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
			}, batchGroupId: "myId"});

			assert.equal(oModel.getProperty("Name",oContext), "TestEntry", "check virtual entry name");
			assert.ok(oModel.setProperty("Name","newName1", oContext), "modify entry...should not lead to a second request");
			assert.equal(oModel.getProperty("Name",oContext), "newName1", "check virtual entry name");

			oModel.submitChanges({
				success : function(oData, oResponse) {
					bSuccess1 = true;
					assert.equal(oModel.getProperty("Name",oContext), "newName1", "check virtual entry name");
					assert.ok(oModel.setProperty("Name","newName2", oContext), "modify entry");
					assert.equal(oModel.getProperty("Name",oContext), "newName2", "check virtual entry name");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							bSuccess2 = true;
							assert.equal(oModel.getProperty("Name",oContext), "newName2", "check virtual entry name");
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSuccess1 && bSuccess2) {
				done();
			}
		});
		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel createEntry", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oContext;
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});

		var fnTest = function(){
			assert.ok(true, "metadata loaded");
			oContext = oModel.createEntry("/ProductSet", {properties: {
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
					"DimUnit":"M",
					"CreatedAt":"\/Date(1413795983000)\/",
					"ChangedAt":"\/Date(1413795983000)\/"
			}});
			assert.equal(oModel.getProperty("Name",oContext), "TestEntry", "check virtual entry name");
			assert.ok(oModel.setProperty("Name","newName", oContext), "modify entry");
			assert.equal(oModel.getProperty("Name",oContext), "newName", "check virtual entry name");
			oModel.submitChanges();
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1) {
				done();
			}
		});
		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	/** @deprecated As of version 1.95.0, reason sap.ui.model.odata.v2.ODataModel#deleteCreatedEntry */
	QUnit.test("test oDataModel createEntry and deleteCreatedEntry", function(assert) {
		var done = assert.async();
		var oContext;
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: true
			}
		});

		var fnTest = function(){
			oContext = oModel.createEntry("/ProductSet", {properties: {
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
			}, batchGroupId: "myId"});

			oModel.deleteCreatedEntry(oContext);
			var oSpy = sinon.spy(oModel, "_submitBatchRequest");
			oModel.submitChanges({
				success : function(oData, oResponse) {
					assert.ok(oSpy.callCount == 0, "No request sent");
					assert.ok(true, "success handler called even no changes were submitted");
					assert.ok(!oResponse, "no response passed");
					assert.ok(typeof oData == 'object', "data is object");
					assert.ok(isEmptyObject(oData), "data is empty object");
				},
				error : function(oError) {
					assert.ok(false, "should not land here");
				}
			});
			setTimeout(function() {
				assert.ok(true, 'no request sent');
				done();
			}, 0);
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			assert.ok(false, "should not land here");
		});
		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	/** @deprecated As of version 1.95.0, reason sap.ui.model.odata.v2.ODataModel#deleteCreatedEntry */
	QUnit.test("test oDataModel 2 times createEntry and one deleteCreatedEntry", function(assert) {
		var done = assert.async();
		var oContext;
		oModel = initModel();
		oModel.setRefreshAfterChange(false);
		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: true
			}
		});

		var fnTest = function(){
			oContext = oModel.createEntry("/ProductSet", {properties: {
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
			}, batchGroupId: "myId"});

			oModel.deleteCreatedEntry(oContext);

			oModel.createEntry("/ProductSet", {properties: {
				"ProductID":"AD-1235",
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
		}, batchGroupId: "myId"});

			oModel.submitChanges({
				success : function(oData, oResponse) {
					assert.ok(true, "should land here");
				},
				error : function(oError) {
					assert.ok(false, "should not land here");
				}
			});
		};
		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.ok(true, "should land here");
			var aRequests = oEvent.getParameter('requests');
			assert.equal(aRequests.length, 1, "should contain one request");
			assert.equal(aRequests[0].success, true, "request successful");
			assert.equal(aRequests[0].url, "ProductSet", "request successful");
			assert.equal(aRequests[0].response.statusCode, "201", "response code");
			done();
		});
		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.module("ODataModelV2 Eventing", {
		beforeEach : function() {
			initServer();
			oModel = initModel();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("test eventing when using read with batch on", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function() {
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachBatchRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", "Param check: headers");
			assert.ok(oEvent.getParameter('headers')['x-csrf-token'], "Param check: token");
			var aRequests = oEvent.getParameter('requests');
			assert.ok(aRequests.length == 1, "should contain one request");
			assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

			assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
			sReqId = oEvent.getParameter('ID');
			iReqSent++;
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && bSuccess) {
				assert.ok(true, "eventing performed correctly");

				assert.equal(oEvent.getId(), "batchRequestCompleted", "event id check");
				assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
				assert.ok(oEvent.getParameter('url'), "Param check: url");
				assert.ok(oEvent.getParameter('success'), "Param check: success");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oEvent.getParameter('async'), true , "Param check: async");
				assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", true , "Param check: headers");
				assert.ok(oEvent.getParameter('headers')['x-csrf-token'], "Param check: token");
				var aRequests = oEvent.getParameter('requests');
				assert.ok(aRequests.length == 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
				assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 202, "oResponse Param check: statusCode");

				// check internal response
				var aRequests = oEvent.getParameter('requests');
				assert.equal(aRequests[0].response.statusCode, "200", "internal response, Param Check: statusCode");
				assert.equal(aRequests[0].response.statusText, "OK", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test eventing when using read and internal error with batch on", function(assert) {
		var done = assert.async();
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductXYSet", {
				success : function(oData, oResponse) {
					assert.ok(false, "request succeeded...error expected");
				},
				error : function(oError) {
					assert.ok(oError.statusCode === "404", "error code");
					assert.ok(true, "request failed");
				}
			});
		};

		oModel.attachBatchRequestFailed(this, function(oEvent) {
			iReqFailed++;
			assert.ok(false, "batch request itself should have no errors");
		});

		oModel.attachBatchRequestSent(this, function(oEvent) {
			iReqSent++;

			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", "Param check: headers");
			assert.ok(oEvent.getParameter('headers')['x-csrf-token'], "Param check: token");
			var aRequests = oEvent.getParameter('requests');
			assert.ok(aRequests.length == 1, "should contain one request");
			assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductXYSet", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

			sReqId = oEvent.getParameter('ID');
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && iReqFailed == 0) {
				assert.ok(true, "eventing performed correctly");
				assert.ok(oEvent.getParameter('success'), "should be true for batch request itself!");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 202, "oResponse Param check: statusCode");

				// check internal response
				var aRequests = oEvent.getParameter('requests');
				assert.ok(aRequests.length == 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductXYSet", "internal request, Param Check: url");
				assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");
				assert.equal(aRequests[0].response.statusCode, "404", "internal response, Param Check: statusCode");
				assert.equal(aRequests[0].response.statusText, "Not Found", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test eventing when using read and error with batch on", function(assert) {
		var done = assert.async();
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel = initModel();
		oModel.setDeferredGroups([ "myId1" ]);

		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function(oData, oResponse) {
					assert.ok(false, "request succeeded...error expected");
				},
				error : function(oError) {
					assert.ok(true, "request failed");
				},
				batchGroupId: "myId1"
			});
			// make internal batch request fail
			oModel.sServiceUrl = "/notWorking";
			oModel.submitChanges();
		};

		oModel.attachBatchRequestFailed(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestFailed", "event id check");
			iReqFailed++;
			if (iReqFailed == 1 && iReqComp === 1 && iReqSent === 1 ) {
				assert.ok(!oEvent.getParameter('success'), "should be false for batch request itself!");
				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");

				// check internal response
				var aRequests = oEvent.getParameter('requests');
				assert.ok(aRequests.length == 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
				assert.equal(aRequests[0].response, undefined, "internal response not there");

				done();
			}
		});

		oModel.attachBatchRequestSent(this, function(oEvent) {
			iReqSent++;

			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", "Param check: headers");
			var aRequests = oEvent.getParameter('requests');
			assert.ok(aRequests.length == 1, "should contain one request");
			assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

			sReqId = oEvent.getParameter('ID');
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && iReqFailed == 0) {
				assert.ok(true, "eventing performed correctly");
				assert.ok(!oEvent.getParameter('success'), "should be false for batch request itself!");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");

				// check internal response
				var aRequests = oEvent.getParameter('requests');
				assert.ok(aRequests.length == 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
				assert.equal(aRequests[0].response, undefined, "internal response not there");

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test eventing when using read with batch off", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;
		oModel = initModel();
		oModel.setUseBatch(false);

		var fnTest = function() {
			oModel.read("/ProductSet", {
				success : function() {
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};
		oModel.attachRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "requestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("ProductSet") !== -1, "Param check: url should be non batch");
			assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "application/json", true , "Param check: headers");

			assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
			sReqId = oEvent.getParameter('ID');
			iReqSent++;
		});

		oModel.attachRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && bSuccess) {
				assert.ok(true, "eventing performed correctly");

				assert.equal(oEvent.getId(), "requestCompleted", "event id check");
				assert.ok(oEvent.getParameter('url'), "Param check: url");
				assert.ok(oEvent.getParameter('url').indexOf("ProductSet") !== -1, "Param check: url should be non batch");
				assert.ok(oEvent.getParameter('success'), "Param check: success");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(oEvent.getParameter('async'), true , "Param check: async");
				assert.equal(oEvent.getParameter('headers').Accept, "application/json", true , "Param check: headers");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 200, "oResponse Param check: statusCode");

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test eventing when using read and error batch off", function(assert) {
		var done = assert.async();
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel = initModel();
		oModel.setUseBatch(false);

		oModel.attachRequestFailed(this, function(oEvent) {
			iReqFailed++;
			if (iReqSent === 1 && iReqFailed === 1 && iReqComp === 1) {
				assert.equal(oEvent.getId(), "requestFailed", "event id check");
				assert.ok(true, "eventing performed correctly");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 404, "oResponse Param check: statusCode");

				done();
			}
		});

		oModel.attachRequestSent(this, function(oEvent) {
			iReqSent++;
			assert.equal(oEvent.getId(), "requestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("ProductXYSet") !== -1, "Param check: url should be non batch");
			assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "application/json", true , "Param check: headers");

			assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
			sReqId = oEvent.getParameter('ID');
		});

		oModel.attachRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && iReqFailed === 0) {
				assert.ok(true, "eventing performed correctly");
				assert.ok(!oEvent.getParameter('success'), " should be false!");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(oEvent.getId(), "requestCompleted", "event id check");
				assert.ok(oEvent.getParameter('url'), "Param check: url");
				assert.ok(oEvent.getParameter('url').indexOf("ProductXYSet") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('async'), true , "Param check: async");
				assert.equal(oEvent.getParameter('headers').Accept, "application/json", true , "Param check: headers");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 404, "oResponse Param check: statusCode");

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
			}
		});

		var fnTest = function() {
			oModel.read("/ProductXYSet", {
				success : function(oData, oResponse) {
					assert.ok(false, "request succeeded...error expected");
				},
				error : function(oError) {
					assert.ok(oError.statusCode === 404, "error code");
					assert.ok(true, "request failed");
				}
			});
		};
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test eventing when using multiple requests with batch on", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet('HT-1001')", {
				success : function() {
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId1"
			});
			oModel.read("/ProductSet('AD-1000')", {
				success : function() {
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId1"
			});
			oModel.update("/ProductSet('HT-1000')", {
				Name : "Test"
			    }, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				merge: true,
				eTag: "*",
				batchGroupId: "myId1"
			});
		};

		oModel.attachBatchRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");

			var aRequests = oEvent.getParameter('requests');
			assert.ok(aRequests.length == 3, "should contain 3 requests");
			assert.equal(aRequests[0].method, "MERGE", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet('HT-1000')", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

			assert.equal(aRequests[1].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[1].url, "ProductSet('HT-1001')", "internal request, Param Check: url");
			assert.equal(aRequests[1].headers.Accept, "application/json", "internal request Param check: headers");

			assert.equal(aRequests[2].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[2].url, "ProductSet('AD-1000')", "internal request, Param Check: url");
			assert.equal(aRequests[2].headers.Accept, "application/json", "internal request Param check: headers");


			assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
			sReqId = oEvent.getParameter('ID');
			iReqSent++;
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && bSuccess) {
				assert.ok(true, "eventing performed correctly");

				assert.equal(oEvent.getId(), "batchRequestCompleted", "event id check");
				assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
				assert.ok(oEvent.getParameter('url'), "Param check: url");
				assert.ok(oEvent.getParameter('success'), "Param check: success");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oEvent.getParameter('async'), true , "Param check: async");
				assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", true , "Param check: headers");
				assert.ok(oEvent.getParameter('headers')['x-csrf-token'], "Param check: token");
				var aRequests = oEvent.getParameter('requests');

				assert.ok(aRequests.length == 3, "should contain 3 requests");

				assert.equal(aRequests[0].method, "MERGE", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet('HT-1000')", "internal request, Param Check: url");
				assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

				assert.equal(aRequests[1].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[1].url, "ProductSet('HT-1001')", "internal request, Param Check: url");
				assert.equal(aRequests[1].headers.Accept, "application/json", "internal request Param check: headers");

				assert.equal(aRequests[2].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[2].url, "ProductSet('AD-1000')", "internal request, Param Check: url");
				assert.equal(aRequests[2].headers.Accept, "application/json", "internal request Param check: headers");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 202, "oResponse Param check: statusCode");

				// check internal responses
				assert.equal(aRequests[0].response.statusCode, "204", "internal response, Param Check: statusCode");
				assert.equal(aRequests[0].response.statusText, "No Content", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.equal(aRequests[1].response.statusCode, "200", "internal response, Param Check: statusCode");
				assert.equal(aRequests[1].response.statusText, "OK", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.equal(aRequests[2].response.statusCode, "200", "internal response, Param Check: statusCode");
				assert.equal(aRequests[2].response.statusText, "OK", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?


				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test eventing when using multiple requests with batch off", function(assert) {
		var done = assert.async();
		var sReqId1 = null;
		var sReqId2 = null;
		var sReqId3 = null;
		var iCount1 = 0;
		var iCount2 = 0;
		oModel = initModel();
		oModel.setUseBatch(false);
		var fnTest = function() {
			oModel.read("/ProductSet('HT-1001')", {
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId1"
			});
			oModel.read("/ProductSet('AD-1000')", {
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId1"
			});
			oModel.update("/ProductSet('HT-1000')", {
				Name : "Test"
			    }, {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				merge: true,
				eTag: "*",
				batchGroupId: "myId1"
			});
		};

		oModel.attachRequestSent(this, function(oEvent) {
			iCount1++;
			if (iCount1 == 1) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId3 = oEvent.getParameter('ID');
			}

			if (iCount1 == 2) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1001") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId1 = oEvent.getParameter('ID');
			}

			if (iCount1 == 3) {
				assert.ok(oEvent.getParameter('url').indexOf("AD-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId2 = oEvent.getParameter('ID');
			}


		});

		oModel.attachRequestCompleted(this, function(oEvent) {

			assert.equal(oEvent.getId(), "requestCompleted", "event id check");

			assert.ok(oEvent.getParameter('success'), "Param check: success");

			if (oEvent.getParameter('url').indexOf("HT-1001") !== -1) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1001") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 200, "oResponse Param check: statusCode");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId1, "Check Request ID");
				iCount2++;
			}

			if (oEvent.getParameter('url').indexOf("AD-1000") !== -1) {
				assert.ok(oEvent.getParameter('url').indexOf("AD-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 200, "oResponse Param check: statusCode");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId2, "Check Request ID");
				iCount2++;
			}

			if (oEvent.getParameter('url').indexOf("HT-1000") !== -1) {
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 204, "oResponse Param check: statusCode");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId3, "Check Request ID");
				iCount2++;
			}


			if (iCount2 == 3) {
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.module("ODataModelV2 abort requests", {
		beforeEach : function() {
			initServer();
			oModel = initModel();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("test abort of request in batch request", function(assert) {
		var done = assert.async();
		var oAbort = {};
		oModel = initModel();
		var fnTest = function() {
			oModel.read("/ProductSet('HT-1001')", {
				error : function(oError) {
					assert.ok(false, "request failed");
				},
				batchGroupId: "myId1"
			});
			oAbort = oModel.read("/ProductSet('AD-1000')", {
				error : function(oError) {
					assert.ok(true, "error callback of aborted request is called");
				},
				batchGroupId: "myId1"
			});
			oAbort.abort();
		};

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.equal(oEvent.getParameter('requests').length, 1, "number of requests check");
			assert.equal(oEvent.getParameter('requests')[0].url, "ProductSet('HT-1001')" , "Param check: url");
			done();
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test abort of deferred batch request", function(assert) {
		var done = assert.async();
		var oAbort = {};
		oModel = initModel();
		oModel.setDeferredGroups([ "myId1" ]);

		var fnTest = function() {
			oModel.read("/ProductSet('HT-1001')", {
				error : function(oError) {
					assert.ok(true, "error callback of aborted request is called");
				},
				batchGroupId: "myId1"
			});
			oModel.read("/ProductSet('AD-1000')", {
				error : function(oError) {
					assert.ok(true, "error callback of aborted request is called");
				},
				batchGroupId: "myId1"
			});
			oAbort = oModel.submitChanges({success: function(oParams){
				assert.ok(false, "request should be aborted");
			}, error: function(oEvent){
				assert.ok(true, "request should be aborted");
			}});
			oAbort.abort();
		};

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.ok(true, "request should be aborted");
			assert.equal(oEvent.getParameter('success'), false, "request completed with success false");
			done();
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test abort of request in non batch request", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var oAbort = {};
		oModel = initModel();
		oModel.setUseBatch(false);

		var fnTest = function() {
			oModel.read("/ProductSet('HT-1001')", {
				success : function() {
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oAbort = oModel.read("/ProductSet('AD-1000')", {
				success : function() {
					bSuccess = true;
				},
				error : function(oError) {
					assert.ok(true, "error callback of aborted request is called");
				}
			});
			oAbort.abort();
		};

		oModel.attachRequestCompleted(this, function(oEvent) {
			if (oEvent.getParameter('success')){
				assert.ok(oEvent.getParameter('url').indexOf("ProductSet('HT-1001')") !== -1, "Param check: url");
			} else {
				assert.ok(false, "aborted request should have been sent!");
			}
			if (bSuccess){
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel checkupdate/dataReceived event order", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var iChange = 0;
		var iReceived = 0;
		var oInput1, oInput2;
		oModel = initModel();
		oInput1 = new Input();
		oInput1.setModel(oModel);
		oInput2 = new Input();
		oInput2.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.ok(iChange == 2, "checkupdate done");
			iReceived++;
			if (iReceived == 2) {
				assert.ok(true, "dataReceived after checkUpdate");
			}
		};
		var fnTest = function() {
			oInput1.bindElement({path:"/ProductSet('AD-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
			oInput2.bindElement({path:"/ProductSet('HT-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 ) {
				assert.ok(true, "batch request completed");
				oInput1.destroy();
				oInput2.destroy();
				done();
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel checkupdate/dataReceived event order - data already loaded", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var iChange = 0;
		var oInput1, oInput2;
		oModel = initModel();
		oInput1 = new Input();
		oInput1.setModel(oModel);
		oInput2 = new Input();
		oInput2.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
			if (iChange == 2) {
				assert.ok(true, "checkupdate done");
				oInput1.destroy();
				oInput2.destroy();
				done();
			}
		};
		var fnDataReceived = function(oEvent) {
			assert.ok(false, "no data retrieval necessary");
		};
		var fnTest = function() {
			oModel.read("/ProductSet('AD-1000')", {
				batchGroupId : "myId1",
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
			oModel.read("/ProductSet('HT-1000')", {
				batchGroupId : "myId1",
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		var fnBind = function() {
			oInput1.bindElement({path:"/ProductSet('AD-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
			oInput2.bindElement({path:"/ProductSet('HT-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
		};

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 ) {
				assert.ok(true, "read batch request completed");
				fnBind();
			}
			if (iCount > 1 ) {
				assert.ok(false, "data already loaded: No further request necessary");
			}
		});
		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel listbinding with table - event order change/dataReceived", function(assert) {
		var done = assert.async();
		var iChange = 0,
			iReceived = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.ok(iChange == 1, "checkupdate done");
			iReceived++;
			if (iReceived == 1) {
				assert.ok(true, "dataReceived after checkUpdate");
			}
		};

		var fnTest = function(){
			oTable.bindRows({path: "/VH_CategorySet", events:{change: fnChange, dataReceived: fnDataReceived}});
			var fnCheck = function() {
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oTable = null;
				done();
			};
			oModel.attachBatchRequestCompleted(this, fnCheck);
		};
		oModel.attachMetadataLoaded(this, fnTest);

	});

	QUnit.test("test oDataModel listbinding with table - event order change/dataReceived - data already loaded", function(assert) {
		var done = assert.async();
		var iCount = 0,
			iChange = 0,
			iReceived = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.ok(iChange == 1, "checkupdate done");
			iReceived++;
			if (iReceived == 1) {
				assert.ok(true, "dataReceived after checkUpdate");
				oTable.destroy();
				oTable = null;
			}
		};

		var fnTest = function(){
			oTable.bindRows({path: "/VH_CategorySet", events:{change: fnChange, dataReceived: fnDataReceived}});
			var fnCheck = function() {
				iCount++;
				if (iCount <= 2) {
					assert.ok(true, "request completed");
					if (iCount === 2) {
						done();
					}
				} else {
					assert.ok(false, "too many requests");
				}
			};
			oModel.attachBatchRequestCompleted(this, fnCheck);
		};

		var fnLoad = function() {
			oModel.read("/VH_CategorySet", {
				success : function(oData, oResponse) {
					assert.ok(true, "request succeeded");
					fnTest();
				},
				error : function(oError) {
					assert.ok(false, "request failed");
				}
			});
		};

		oModel.attachMetadataLoaded(this, fnLoad);
	});
	QUnit.test("test oDataModel createEntry, submit fails, change again and submit", function(assert) {
		var done = assert.async();
		var oContext;
		oModel = initModel();
		oModel.setDeferredGroups(["myId"]);
		oModel.setChangeGroups({
			"Product": {
				groupId: "myId",
				changeSetId: "Test",
				single: false
			}
		});

		var fnChange = function() {
			oModel.setProperty("TypeCode","AD", oContext);
			oModel.setProperty("Category","Computer system accessories", oContext);
			oModel.setProperty("Name","TestEntry", oContext);
			oModel.setProperty("NameLanguage","E", oContext);
			oModel.setProperty("Description","Flyer for our product palette", oContext);
			oModel.setProperty("DescriptionLanguage","E", oContext);
			oModel.setProperty("SupplierID","0100000015", oContext);
			oModel.setProperty("SupplierName","Robert Brown Entertainment", oContext);
			oModel.setProperty("TaxTarifCode",1, oContext);
			oModel.setProperty("MeasureUnit","EA", oContext);
			oModel.setProperty("WeightMeasure","0.01", oContext);
			oModel.setProperty("WeightUnit","KG", oContext);
			oModel.setProperty("CurrencyCode","CAD", oContext);
			oModel.setProperty("Price","0.0", oContext);
			oModel.setProperty("Width","0.46", oContext);
			oModel.setProperty("Depth","0.3", oContext);
			oModel.setProperty("Height","0.03", oContext);
			oModel.setProperty("DimUnit","M", oContext);
			oModel.submitChanges({
				success : function(oData, oResponse) {
					assert.ok(true, "$batch successful");
					assert.ok(oData.__batchResponses.length === 1, "One response found");
					if (!oData.__batchResponses[0].message) {
						assert.ok(true, "creation successful");
						done();
					}
				},
				error : function(oError) {
					assert.ok(false, "creation failed");
				}
			});
		};

		var fnTest = function(){
			oContext = oModel.createEntry("/ProductSet", {properties: {
				"ProductID":"AD-12345"
			}, batchGroupId: "myId"});

			oModel.submitChanges({
				success : function(oData, oResponse) {
					assert.ok(true, "$batch successful");
					assert.ok(oData.__batchResponses.length === 1, "One response found");
					assert.ok(oData.__batchResponses.length === 1, "One response found");
					//MockServer does not really fail so we create a message
					oData.__batchResponses[0].message = "error";
					if (oData.__batchResponses[0].message) {
						assert.ok(true, "creation failed");
						fnChange();
					}
				},
				error : function(oError) {
					assert.ok(false, "should not land here");
				}
			});
		};

		oModel.attachMetadataLoaded(this, fnTest);
	});

	QUnit.test("test oDataModel callFunction: Parameter without mode", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function(){
			oModel.callFunction("/SalesOrder_InvoiceCreated",{
				method: "POST",
				urlParameters: {"SalesOrderID": "test"}
			});
		};

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_InvoiceCreated?SalesOrderID='test'", "Valid parameter is added to URL");
			done();
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel callFunction: Parameter with mode", function(assert) {
		var done = assert.async();
		oModel = initModel();
		var fnTest = function() {
			oModel.callFunction("/SalesOrder_Confirm",{
				method: "POST",
				urlParameters: {"SalesOrderID": "test"}
			});
		};

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_Confirm?SalesOrderID='test'", "Valid parameter is added to URL");
			done();
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel callFunction: parameters are preserved", function(assert) {
		var done = assert.async();
		var mUrlParams = {
			"SalesOrderID": "test"
		};

		oModel = initModel();
		var fnTest = function() {
			oModel.callFunction("/SalesOrder_Confirm",{
				method: "POST",
				urlParameters: mUrlParams
			});
		};

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_Confirm?SalesOrderID='test'", "Valid parameter is added to URL");
			assert.equal(mUrlParams["SalesOrderID"], "test", "Parameter still exists after sending function import");
			done();
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel callFunction: additional parameters", function(assert) {
		var done = assert.async();
		var mUrlParams = {
			"SalesOrderID": "test",
			"$expand": "ToBusinessPartner",
			"sap-some": "sapTest"
		};

		oModel = initModel();
		var fnTest = function() {
			oModel.callFunction("/SalesOrder_Confirm",{
				method: "POST",
				urlParameters: mUrlParams
			});
		};

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_Confirm?SalesOrderID='test'&$expand=ToBusinessPartner&sap-some=sapTest", "Valid parameter is added to URL");
			done();
		});

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel binding function import parameters deferred", function(assert) {
		var done = assert.async();
		oModel = initModel();

		oModel.setDefaultBindingMode("TwoWay");

		var fnTest = function(){
			var oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated",{
				groupId: "changes",
				method: "POST",
				urlParameters: {"SalesOrderID": "test"}
			});

			var oInput = new Input();
			oInput.bindValue("SalesOrderID");
			oInput.setModel(oModel);

			oHandle.contextCreated().then(function(oContext) {
				oInput.setBindingContext(oContext);
				assert.equal(oInput.getValue(), "test", "Value check");
				assert.equal(oModel.getProperty("SalesOrderID", oContext), "test", "Value check in model");
				oInput.setValue("Blubb");
				assert.equal(oInput.getValue(), "Blubb", "Value check");
				assert.equal(oModel.getProperty("SalesOrderID", oContext), "Blubb", "Value check in model");
				oModel.submitChanges();
			}, function() {
				assert.ok(false, "Test failed");
			});
		};
		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_InvoiceCreated?SalesOrderID='Blubb'");
			done();
		});
		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel binding function import parameters not deferred", function(assert) {
		var done = assert.async();
		var oHandle;
		var oInput;
		oModel = initModel();

		oModel.setDefaultBindingMode("TwoWay");

		var fnTest = function(){
			oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated",{
				method: "POST",
				urlParameters: {"SalesOrderID": "test"}
			});

			oInput = new Input();
			oInput.bindValue("SalesOrderID");
			oInput.setModel(oModel);
		};
		var handler1 = function(oEventInfo) {
			oModel.detachRequestSent(handler1);
			oModel.attachRequestSent(handler2);
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_InvoiceCreated?SalesOrderID='test'");
			oHandle.contextCreated().then(function(oContext) {
				oInput.setBindingContext(oContext);
				assert.equal(oInput.getValue(), "test", "Value check");
				assert.equal(oContext.getProperty("SalesOrderID"), "test", "Value check in model");
				oInput.setValue("Blubb");
				assert.equal(oInput.getValue(), "Blubb", "Value check");
				assert.equal(oContext.getProperty("SalesOrderID"), "Blubb", "Value check in model");
			}, function() {
				assert.ok(false, "Test failed");
			});
		};
		var handler2 = function(oEventInfo) {
			oModel.detachRequestSent(handler2);
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_InvoiceCreated?SalesOrderID='Blubb'");
			done();
		};
		oModel.attachRequestSent(this, handler1);
		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel binding function import parameters result check error", function(assert) {
		var done = assert.async();
		oModel.setDefaultBindingMode("TwoWay");

		var fnTest = function(){
			var oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated",{
				groupId: "changes",
				method: "POST",
				urlParameters: {"SalesOrderID": "test"}
			});

			var oInput = new Input();
			oInput.bindValue("SalesOrderID");
			oInput.setModel(oModel);

			oHandle.contextCreated().then(function(oContext) {
				oInput.setBindingContext(oContext);
				assert.equal(oInput.getValue(), "test", "Value check");
				assert.equal(oModel.getProperty("SalesOrderID", oContext), "test", "Value check in model");
				oInput.setValue("Blubb");
				assert.equal(oInput.getValue(), "Blubb", "Value check");
				assert.equal(oModel.getProperty("SalesOrderID", oContext), "Blubb", "Value check in model");
				oModel.submitChanges();
			}, function() {
				assert.ok(false, "Test failed");
			});
		};

		oModel.attachRequestCompleted(this, function(oEventInfo) {
			assert.ok(!oEventInfo.getParameter("success"), "request should have failed!");
			done();
		});

		oModel.metadataLoaded().then(fnTest);

	});

	QUnit.module("ODataModelV2 refresh", {
		beforeEach : function() {
			initServer();
			oModel = initModel();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("test oDataModel refresh default batchGroup", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var oTable2 = new Table();
		oTable2.setModel(oModel);

		var fnTest = function(){
			spy = sinon.spy(oModel, "_submitBatchRequest");
			oTable.bindRows({
				path : "/VH_CategorySet",
				parameters: {
					batchGroupId: "group1"
				}
			});
			oTable2.bindRows({
				path : "/ProductSet",
				parameters: {
					batchGroupId: "group2"
				}
			});
		};

		var test1 = function(oEventinfo) {
			iCount++;
			if (iCount === 2 && spy.callCount === 2) {
				assert.ok(true,"2 batch requests sent");
				iCount = 0;
				spy.restore();
				oModel.detachBatchRequestCompleted(test1);
				spy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.refresh();
				oModel.attachBatchRequestCompleted(this, function(oEventInfo) {
					iCount++;
					if (iCount === 2 && spy.callCount === 2) {
						assert.ok(true,"2 for refresh batch requests sent");
						oTable.destroy();
						oTable2.destroy();
						oTable = null;
						oTable2 = null;
						done();
					}
				});
			}
		};
		oModel.attachBatchRequestCompleted(this, test1);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel refresh in one batchGroup", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var oTable2 = new Table();
		oTable2.setModel(oModel);

		var fnTest = function(){
			spy = sinon.spy(oModel, "_submitBatchRequest");
			oTable.bindRows({
				path : "/VH_CategorySet",
				parameters: {
					batchGroupId: "group1"
				}
			});
			oTable2.bindRows({
				path : "/ProductSet",
				parameters: {
					batchGroupId: "group2"
				}
			});
		};

		var test1 = function(oEventinfo) {
			iCount++;
			if (iCount === 2 && spy.callCount === 2) {
				assert.ok(true,"2 batch requests sent");
				spy.restore();
				oModel.detachBatchRequestCompleted(test1);
				spy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.refresh(true,true,"refreshGroup");
				oModel.attachBatchRequestCompleted(this, function(oEventInfo) {
					if (spy.callCount === 1) {
						assert.ok(true,"1 for refresh batch requests sent");
						oTable.destroy();
						oTable2.destroy();
						oTable = null;
						oTable2 = null;
						done();
					}
				});
			}
		};
		oModel.attachBatchRequestCompleted(this, test1);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test ListBindingRefresh with batchGroup of binding info", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();

		var oTable = new Table();
		oTable.setModel(oModel);
		var oTable2 = new Table();
		oTable2.setModel(oModel);

		var fnTest = function(){
			spy = sinon.spy(oModel, "_submitBatchRequest");
			oTable.bindRows({
				path : "/VH_CategorySet",
				parameters: {
					batchGroupId: "group1"
				}
			});
			oTable2.bindRows({
				path : "/ProductSet",
				parameters: {
					batchGroupId: "group2"
				}
			});
		};

		var test1 = function(oEventinfo) {
			iCount++;
			if (iCount === 2 && spy.callCount === 2) {
				assert.ok(true,"2 batch requests sent");
				spy.restore();
				oModel.detachBatchRequestCompleted(test1);
				iCount = 0;
				spy = sinon.spy(oModel, "_submitBatchRequest");
				oTable.getBinding("rows").refresh();
				oTable2.getBinding("rows").refresh();
				oModel.attachBatchRequestCompleted(this, function(oEventInfo) {
					iCount++;
					if (iCount === 2 && spy.callCount === 2) {
						assert.ok(true,"1 for refresh batch requests sent");
						oTable.destroy();
						oTable2.destroy();
						oTable = null;
						oTable2 = null;
						done();
					}
				});
			}
		};
		oModel.attachBatchRequestCompleted(this, test1);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});
	QUnit.test("test ListBindingRefresh passing a batchGroup", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var oTable2 = new Table();
		oTable2.setModel(oModel);

		var fnTest = function(){
			spy = sinon.spy(oModel, "_submitBatchRequest");
			oTable.bindRows({
				path : "/VH_CategorySet",
				parameters: {
					batchGroupId: "group1"
				}
			});
			oTable2.bindRows({
				path : "/ProductSet",
				parameters: {
					batchGroupId: "group2"
				}
			});
		};

		var test1 = function(oEventinfo) {
			iCount++;
			if (iCount === 2 && spy.callCount === 2) {
				assert.ok(true,"2 batch requests sent");
				spy.restore();
				oModel.detachBatchRequestCompleted(test1);
				spy = sinon.spy(oModel, "_submitBatchRequest");
				oTable.getBinding("rows").refresh("test");
				oTable2.getBinding("rows").refresh("test");
				oModel.attachBatchRequestCompleted(this, function(oEventInfo) {
					if (spy.callCount === 1) {
						assert.ok(true,"1 for refresh batch requests sent");
						oTable.destroy();
						oTable2.destroy();
						oTable = null;
						oTable2 = null;
						done();
					}
				});
			}
		};
		oModel.attachBatchRequestCompleted(this, test1);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test refresh ContextBinding", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var oTable2 = new Table();
		oTable2.setModel(oModel);

		var fnTest = function(){
			spy = sinon.spy(oModel, "_submitBatchRequest");
			oTable.bindRows({
				path : "ToContacts",
				parameters: {
					batchGroupId: "group1"
				}
			});
			oTable.bindElement("/BusinessPartnerSet('0100000000')");
			oTable2.bindRows({
				path : "ToLineItems",
				parameters: {
					batchGroupId: "group2"
				}
			});
			oTable2.bindElement("/SalesOrderSet('0500000000')");
		};

		var test1 = function(oEventinfo) {
			iCount++;
			if (iCount === 3 && spy.callCount === 3) {
				assert.ok(true,"3 batch requests sent");
				spy.restore();
				oModel.detachBatchRequestCompleted(test1);
				spy = sinon.spy(oModel, "_submitBatchRequest");
				oTable.getElementBinding().refresh();
				oTable2.getElementBinding().refresh();
				oModel.attachBatchRequestCompleted(this, function(oEventInfo) {
					if (spy.callCount === 1) {
						assert.ok(true,"1 for refresh batch requests sent");
						oTable.destroy();
						oTable2.destroy();
						oTable = null;
						oTable2 = null;
						done();
					}
				});
			}
		};
		oModel.attachBatchRequestCompleted(this, test1);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test refresh ContextBinding", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTable = new Table();
		oTable.setModel(oModel);
		var oTable2 = new Table();
		oTable2.setModel(oModel);

		var fnTest = function(){
			spy = sinon.spy(oModel, "_submitBatchRequest");
			oTable.bindRows({
				path : "ToContacts",
				parameters: {
					batchGroupId: "group1"
				}
			});
			oTable.bindElement("/BusinessPartnerSet('0100000000')");
			oTable2.bindRows({
				path : "ToLineItems",
				parameters: {
					batchGroupId: "group2"
				}
			});
			oTable2.bindElement("/SalesOrderSet('0500000000')");
		};

		var test1 = function(oEventinfo) {
			iCount++;
			if (iCount === 3 && spy.callCount === 3) {
				assert.ok(true,"3 batch requests sent");
				spy.restore();
				oModel.detachBatchRequestCompleted(test1);
				spy = sinon.spy(oModel, "_submitBatchRequest");
				oTable.getElementBinding().refresh("1");
				oTable2.getElementBinding().refresh("2");
				iCount = 0;
				oModel.attachBatchRequestCompleted(this, function(oEventInfo) {
					iCount++;
					if (iCount === 2 && spy.callCount === 2) {
						assert.ok(true,"2 refresh batch requests sent");
					oTable.destroy();
						oTable2.destroy();
						oTable = null;
						oTable2 = null;
						done();
					}
				});
			}
		};
		oModel.attachBatchRequestCompleted(this, test1);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});

	QUnit.test("test oDataModel OneTime bindings with bindObject and resolve checks", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel = initModel();
		var oTxt = new Input();
		oTxt.bindValue({path: "Category", mode: 'OneTime'});
		oModel.setUseBatch(true);
		oTxt.setModel(oModel);

		assert.equal(oTxt.getBinding('value').getBindingMode(), "OneTime", "Binding mode check!");
		assert.ok(!oTxt.getBinding('value').isResolved(), "Binding should not be resolved!");
		assert.ok(oTxt.getValue() === "", "text value should be null");

		var fnCheck = function() {
			iCount++;
			assert.ok(iCount === 1, "request performed");
			assert.equal(oTxt.getBinding('value').getBindingMode(), "OneTime", "Binding mode check!");
			assert.ok(oTxt.getBinding('value').isResolved(), "Binding should be resolved!");
			assert.ok(oTxt.getValue() === "Headsets", "text value should be set");

			assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
			oTxt.destroy();
			oModel.detachBatchRequestCompleted(fnCheck);
			done();
		};

		var fnTest = function() {
			oTxt.bindObject("/VH_CategorySet('Headsets')");
		};
		oModel.attachBatchRequestCompleted(this, fnCheck);

		oModel.attachMetadataLoaded(this, function() {
			fnTest();
		});
	});
});