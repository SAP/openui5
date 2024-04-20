/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/date/UI5Date",
	"sap/m/DateTimePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/Panel",
	"sap/m/StandardListItem",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/UpdateMethod",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/type/DateTime",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/Table",
	"sap/ui/table/Column"
], function (each, isEmptyObject, UI5Date, DateTimePicker, Input, Label, List, Panel, ListItem,
		Messaging, Message, MessageType, MockServer, ChangeReason, Filter, Sorter, UpdateMethod,
		ODataModel, DateTime, createAndAppendDiv, nextUIUpdate, Table, Column
) {
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

	function initModel(mParameters, sServiceUriOverride) {
		return new ODataModel(sServiceUriOverride || sServiceUri, mParameters);
	}

	var bChanged = false, bDataRequested = false, bDataReceived = false;

	var fnChange = function(assert, oEvent) {
		bChanged = true;
		assert.ok(bDataRequested && !bDataReceived,"change fired");
	};

	var fnDataRequested = function(assert, oEvent) {
		bDataRequested = true;
		assert.ok(!bDataReceived && !bChanged,"dataRequested fired");
	};

	/**
	 * Removes all shared Metadata
	 */
	function cleanSharedData() {
		ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
	}

	QUnit.module("ODataModelV2 XML", {
		beforeEach : function() {
			initServer();
			oModel = initModel({json: false});
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("read XML", function(assert) {
		var done = assert.async();
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
	});

	QUnit.module("ODataModelV2 JSON", {
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

	QUnit.test("Mockserver initialisation",  function(assert){
		assert.ok(oMockServer,"MockServer created");
		assert.ok(oMockServer.isStarted(), "Mock server is started");
	});

	QUnit.test("test init Model", function(assert) {
		var done = assert.async();
		// Depending on the timing, the metadataLoaded event for oModel might have fired already
		// Therefore create a local model and attach to the event in the same browser task
		var oLocalModel = initModel();
		var fnTest = function() {
			assert.ok(true, "metadataloaded");
			oLocalModel.destroy();
			done();
		};
		oLocalModel.attachMetadataLoaded(fnTest, this);
	});

	QUnit.test("read JSON", function(assert) {
		var done = assert.async();
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
	});

	QUnit.test("test $batch: check accept header", function(assert) {
		var done = assert.async();
		var oSpy = sinon.spy(oModel, "_submitBatchRequest");
		oModel.read("/ProductSet", {
			success : function() {
				assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Flyer", "absolute path without context");
				oModel.createBindingContext("/ProductSet('AD-1000')", null, function(newContext) {
					assert.equal(newContext.getProperty("Name"), "Flyer", "relative path with context");
					assert.strictEqual(oSpy.args[0][0].headers["Accept"], "multipart/mixed", "Accept header set to 'multipart/mixed'");
					oSpy.restore();
					done(); // resume normal testing
				});
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
	});

	QUnit.test("test oDataModel read with URLParams and headers JSON", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet", {
			urlParameters : {
				"$top" : "1",
				"$skip" : "1"
			},
			headers : {
				"myCustomHeader" : "xyz"
			},
			success : function(oData, oResponse) {
				assert.strictEqual(oData.results.length, 1, "length check");
				var oP = oModel
						.getProperty("/ProductSet('HT-1000')");
				assert.ok(oP, "one entry loaded");
				assert.strictEqual(oP.Name, "Notebook Basic 15",
						"one entry loaded");
				done();
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
	});

	QUnit.test("test metadata promise", function(assert) {
		var done = assert.async();
		var oPromise = oModel.metadataLoaded();
		assert.ok(oPromise, "promise exists");
		oPromise.then(function(){
			assert.ok(true, "Promise resolved");
			done();
		}, function(){
			assert.ok(false, "Promise rejected");
		});
	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise and refresh", function(assert) {
		var done = assert.async();

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
	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise rejected refresh", function(assert) {
		var done = assert.async();

		oModel.destroy();
		oModel = initModel(undefined, "/doesnotWork/");

		var oPromise = oModel.metadataLoaded();
		assert.ok(oPromise, "promise exists");
		oPromise.then(function(result){
			assert.ok(false, "Promise resolved which should not happen");
		}, function(){
			assert.ok(false, "Promise rejected which should never happen");
		});

		var oNewP = oModel.refreshMetadata();
		assert.ok(oNewP, "oNewP promise exists");
		oNewP.then(function(result){
			assert.ok(false, "oNewP Promise resolved");
		}, function(){
			assert.ok(true, "oNewP Promise rejected");
			cleanSharedData();
			done();
		});

	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise rejected refresh and resolve", function(assert) {
		var done = assert.async();
		cleanSharedData();

		oModel.destroy();
		oModel = initModel(undefined, "/doesnotWork/");

		var oPromise = oModel.metadataLoaded();
		assert.ok(oPromise, "promise exists");
		oPromise.then(function(result){
			assert.ok(true, "Promise resolved after metadata url is fixed");
			done();
		}, function(){
			assert.ok(false, "Promise rejected which should never happen");
		});

		var oNewP = oModel.refreshMetadata();
		assert.ok(oNewP, "oNewP promise exists");
		oNewP.then(function(result){
			assert.ok(false, "oNewP Promise resolved");
		}, function(){
			assert.ok(true, "oNewP Promise rejected");
			// fix url
			oModel.oMetadata.sUrl = sServiceUri + "$metadata";
			var oNewP2 = oModel.refreshMetadata();
			assert.ok(oNewP2, "oNewP2 promise exists");
			return oNewP2;
		})
		.then(function(result){
			assert.ok(true, "oNewP2 Promise resolved");
			cleanSharedData();
		}, function(){
			assert.ok(false, "oNewP2 Promise rejected");
		});

	});

	//*********************************************************************************************
[true, false].forEach(function (bSuccess) {
	QUnit.test("Metadata promise " + (bSuccess ? "fulfilled" : "rejected"), function(assert) {
		var done = assert.async(),
			oTest = {
				resolved : function () {},
				rejected : function () {}
			},
			oTestMock = this.mock(oTest);

		cleanSharedData();
		oModel.destroy();
		oModel = initModel(undefined, bSuccess ? sServiceUri : "/doesnotWork/");

		if (bSuccess) {
			oTestMock.expects("resolved");
			oTestMock.expects("rejected").never();
		} else {
			oTestMock.expects("resolved").never();
			oTestMock.expects("rejected");
		}

		return oModel.metadataLoaded(true).then(oTest.resolved, oTest.rejected)
			.finally(function () {
				cleanSharedData();
				done();
			});
	});
});

	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise ok then refresh failed", function(assert) {
		var done = assert.async();

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
		})
		.then(function(result){
			assert.ok(false, "oNewP Promise resolved");
		}, function(){
			assert.ok(true, "oNewP Promise rejected");
			cleanSharedData();
			sServiceUri = sTempService;
			done();
		});
	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata promise ok then refresh failed then refresh ok", function(assert) {
		var done = assert.async();

		var oPromise = oModel.metadataLoaded();
		var sTempService = sServiceUri;
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
			// fix url
			oModel.oMetadata.sUrl = sTempService + "$metadata";
			var oNewP2 = oModel.refreshMetadata();
			assert.ok(oNewP2, "oNewP promise exists");
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

	});
	/** @deprecated As of version 1.42.0 */
	QUnit.test("test metadata isMetadataLoadingFailed", function(assert) {
		var done = assert.async();

		assert.ok(!oModel.isMetadataLoadingFailed(), "check metadata loaded");
		var oPromise = oModel.metadataLoaded();
		var sTempService = sServiceUri;
		assert.ok(oPromise, "promise exists");
		oPromise.then(function(result){
			assert.ok(!oModel.isMetadataLoadingFailed(), "check metadata loaded");
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
			assert.ok(oModel.isMetadataLoadingFailed(), "check metadata loaded failed");
			// fix url
			oModel.oMetadata.sUrl = sTempService + "$metadata";
			var oNewP2 = oModel.refreshMetadata();
			assert.ok(oNewP2, "oNewP promise exists");
			return oNewP2;
		})
		.then(function(result){
			assert.ok(!oModel.isMetadataLoadingFailed(), "check metadata loaded");
			cleanSharedData();
			sServiceUri = sTempService;
			done();
		}, function(){
			assert.ok(false, "oNewP2 Promise rejected");
		});

	});

	QUnit.test("test oDataModel read filter test", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet", {
			filters : [ new Filter("ProductID", "EQ",
					"HT-1000") ],
			success : function(oData, oResponse) {
				assert.strictEqual(oData.results.length, 1, "length check");
				var oP = oModel.getProperty("/ProductSet('HT-1000')");
				assert.ok(oP, "one entry loaded");
				assert.strictEqual(oP.Name, "Notebook Basic 15", "one entry loaded");
				done();
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
	});

	QUnit.test("test oDataModel read count request with filter test", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet/$count", {
			filters : [ new Filter("ProductID", "EQ",
					"HT-1000") ],
			success : function(oData, oResponse) {
				assert.strictEqual(oData, "1", "length check");
				done();
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
	});

	QUnit.test("test oDataModel read sort test", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet", {
			sorters : [ new Sorter("ProductID", true) ],
			filters : [ new Filter("ProductID", "EQ", "HT-1000"),
					new Filter("ProductID", "EQ", "AD-1000"),
					new Filter("ProductID", "EQ", "HT-1041") ],
			success : function(oData, oResponse) {
				assert.strictEqual(oData.results.length, 3, "length check");
				assert.strictEqual(oData.results[0].ProductID, "HT-1041", "sort check");
				assert.strictEqual(oData.results[1].ProductID, "HT-1000", "sort check");
				assert.strictEqual(oData.results[2].ProductID, "AD-1000", "sort check");

				done();
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

	});

	QUnit.test("test oDataModel read error test", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet('4711')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.strictEqual(oError.statusCode, "404", "error code");
				assert.ok(true, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel remove error test", function(assert) {
		var done = assert.async();
		oModel.remove("/ProductSet('Error')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.ok(oError, "error succeeded");
				done();
			}
		});
	});

	QUnit.test("test oDataModel remove error test batch off", function(assert) {
		var done = assert.async();
		oModel.setUseBatch(false);
		oModel.remove("/ProductSet('Error')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.ok(oError, "error succeeded");
				done();
			}
		});
	});


	QUnit.test("test oDataModel read with no batchgroup ids", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with no ids should should be combined in a single batch request");
				done();
			}
		});
	});

	QUnit.test("test oDataModel read with different batchgroup ids", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with different ids should be in separate batch requests");
				done();
			}
		});
	});

	QUnit.test("test oDataModel read with same batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

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
		oModel.attachBatchRequestCompleted(
			this,
			function(test) {
				iCount++;
				if (iCount === 1 && bRead1 && bRead2) {
					assert.ok(true, "requests with same id should be combined in a batch request");
					done();
				}
			});
	});

	QUnit.test("test oDataModel read deferred with batchGroupId", function(assert) {
		var done = assert.async();
		oModel.setDeferredGroups([ "myId" ]);
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
	});

	QUnit.test("test oDataModel read deferred with default batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.setDeferredGroups([ undefined ]);
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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with same default id should be combined in a batch request");
				done();
			}
		});
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel read deferred with same batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.setDeferredGroups([ "myId1" ]);
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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 && bRead1 && bRead2) {
				assert.ok(true, "requests with same id should be combined in a batch request");
				done();
			}
		});
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel read deferred with different batchGroupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.setDeferredGroups([ "myId1", "myId2" ]);
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

		oModel.attachBatchRequestCompleted(this, function(test) {
				iCount++;
				if (iCount === 2 && bRead1 && bRead2) {
					assert.ok(true, "requests with different ids should be in separate batch requests");
					done();
				}
			});
		oModel.submitChanges();
	});



	QUnit.test("test oDataModel read deferred with batchGroupId and submitChanges callback handler test", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		oModel.setDeferredGroups([ "myId" ]);
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
	});

	QUnit.test("test oDataModel bind Object", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oTxt = new Input({
			value : "{Category}"
		});
		oTxt.setModel(oModel);
		oTxt.bindObject("/VH_CategorySet('Headsets')");

		var fnCheck = function() {
			iCount++;
			assert.strictEqual(iCount, 1, "request performed");
			assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
			oTxt.destroy();
			oModel.detachBatchRequestCompleted(fnCheck, this);
			done();
		};
		oModel.attachBatchRequestCompleted(fnCheck, this);
	});

	QUnit.test("test oDataModel read and bind Object", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oTxt = new Input({
			value : "{Category}"
		});
		oTxt.setModel(oModel);

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
					fnCheck
				);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
	});

	QUnit.test("test oDataModel listbinding with table", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oTable = new Table();
		oTable.setModel(oModel);

		oTable.bindRows({
			path : "/VH_CategorySet"
		});

		var fnCheck = function() {
			iCount++;
			assert.strictEqual(iCount, 1, "request performed");
			assert.equal(
					oModel
							.getProperty("/VH_CategorySet('Beamers')/Category"),
					"Beamers", "Category loaded check");
			assert.equal(
					oModel
							.getProperty("/VH_CategorySet('Headsets')/Category"),
					"Headsets", "Category loaded check");
			assert.ok(oTable.getBinding('rows').getLength() >= 2,
					"Category size check");
			oTable.destroy();
			oModel.detachBatchRequestCompleted(fnCheck);
			done();

		};
		oModel.attachBatchRequestCompleted(fnCheck);
	});

	QUnit.test("test oDataModel listbinding with aggregation binding and read in default batch group", async function(assert) {
		var done = assert.async();
		var iCallCount = 0;
		var bRead1 = false;
		var oTable = new Table();
		await nextUIUpdate();
		oTable.setModel(oModel);
		oTable.bindRows({
			path : "/VH_CategorySet"
		});
		oModel.read("/VH_CategorySet", {
			success : function() {
				assert.ok(true, "request succeeded");
				bRead1 = true;
				iCallCount++;
			},
			error : function() {
				assert.ok(false, "request failed");
			}
		});

		var fnCheck = function() {
			iCallCount++;

			if (iCallCount === 2 && bRead1) {
				assert.ok(true, "request Completed event 1x (==1 request) and succesHandler from read should be called 1x");
				assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"), "Beamers", "Category loaded check");
				assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oModel.detachBatchRequestCompleted(fnCheck);
				done();
			}
		};
		oModel.attachBatchRequestCompleted(fnCheck);
	});

	QUnit.test("test oDataModel listbinding with aggregation binding and read in different batch groups", function(assert) {
		var done = assert.async();
		var iCallCount = 0;
		var bRead1 = false;
		var oTable = new Table();
		oTable.setModel(oModel);

		oTable.bindRows({
			path : "/VH_CategorySet",
			batchGroupId : "myId1"
		});
		oModel.read("/ProductSet", {
			batchGroupId : "myId2",
			success : function() {
				bRead1 = true;
				assert.ok(true, "request succeeded");
				iCallCount++;
			},
			error : function() {
				assert.ok(false, "request failed");
			}
		});

		var fnCheck = function() {
			iCallCount++;
			if (iCallCount === 3 && bRead1) {
				assert.ok(true, "requestCompleted event 2x (==2 requests) and read succes handler should be called 1x");
				assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"), "Beamers", "Category loaded check");
				assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oModel.detachBatchRequestCompleted(fnCheck);
				done();
			}
		};
		oModel.attachBatchRequestCompleted(fnCheck);
	});

	QUnit.test("test oDataModel listbinding with aggregation binding and read in different deferred batch groups", function(assert) {
		var done = assert.async();
		var iCallCount = 0;
		var bRead1 = false;
		var oTable = new Table();
		oModel.setDeferredGroups([ "myId1", "myId2" ]);
		oTable.setModel(oModel);
		oTable.bindRows({
			path : "/VH_CategorySet",
			batchGroupId : "myId1"
		});
		oModel.read("/ProductSet", {
			batchGroupId : "myId2",
			success : function() {
				bRead1 = true;
				assert.ok(true, "request succeeded");
				iCallCount++;
			},
			error : function() {
				assert.ok(false, "request failed");
			}
		});

		var fnCheck = function(mArguments) {
			iCallCount++;
			if (iCallCount === 3 && bRead1) {
				assert.ok(true, "requestCompleted event 2x (==2 requests) and read succes handler should be called 1x");
				assert.equal(oModel.getProperty("/VH_CategorySet('Beamers')/Category"), "Beamers", "Category loaded check");
				assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
				assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
				oTable.destroy();
				oModel.detachBatchRequestCompleted(fnCheck);
				done();
			}
		};
		oModel.attachBatchRequestCompleted(fnCheck);
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel use batch off option", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;
		oModel.setUseBatch(false);

		oModel.attachRequestCompleted(this,function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with same default id should be in 2 non batch requests");
				done();
			}
		});

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
	});

	QUnit.module("ODataModelV2 write", {
		beforeEach : function() {
			initServer();
			oModel = initModel();
			oModel.setRefreshAfterChange(false);
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
	});

	QUnit.test("test oDataModel update Reagroupbatchgroup", function(assert) {
		var done = assert.async();
		var bUpdate = false;
		var bRead = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			if (bRead && bUpdate) {
				assert.ok(true, "requests with same default id should be in 1 batch requests");
				done();
			}
		});
	});

	QUnit.test("test oDataModel update and read in different batchgroups",function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bUpdate = false;
		var bRead = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead && bUpdate) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
	});

	QUnit.test("test oDataModel update and 2 read in different deferred and non deferred batchgroups", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bUpdate = false;
		var bRead = false;
		var bRead2 = false;
		oModel.setDeferredGroups(["myId1", "myId2"]);

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 3 && bRead && bUpdate && bRead2) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty - hasPendingChanges", function(assert) {
		var done = assert.async();
		oModel.setDefaultBindingMode("TwoWay");
		var oInput = new DateTimePicker({value: {
				path:"/ProductSet('AD-1000')/CreatedAt",
				type: new DateTime(),
				formatOptions: {
					style: 'medium',
					strictParsing: true
			}}});
		oInput.setModel(oModel);
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				var vDate = oModel.getProperty("/ProductSet('AD-1000')/CreatedAt");
				oModel.setProperty("/ProductSet('AD-1000')/CreatedAt", UI5Date.getInstance());
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/CreatedAt", vDate);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				vDate = oInput.getValue();
				oInput.setValue("Mar 12, 2015, 4:21:19 PM");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oInput.setValue(vDate);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oInput.destroy();
				done();
			},
			error: function() {
				assert.ok(false, "request failed");
			}
		});
	});

	QUnit.test("test oDataModel setProperty - Response object", function(assert) {
		var done = assert.async();
		var iCount = 0;
		oModel.setDefaultBindingMode("TwoWay");
		oModel.setRefreshAfterChange(true);
		var oInput = new Input({value: "{Name}"});
		oInput.setModel(oModel);
		oInput.bindElement("/ProductSet('AD-1000')");

		var fnHandler = function() {
			oInput.getElementBinding().detachDataReceived(fnHandler);
			oInput.setValue("test");
			oModel.submitChanges();
			oModel.attachBatchRequestCompleted(function(oInfo) {
				iCount++;
				if (iCount == 2) {
					assert.strictEqual(oInfo.mParameters.requests.length, 2, "MERGE and GET request sent");
					assert.strictEqual(oInfo.mParameters.requests[0].response.statusCode, "204", "MERGE response ok");
					assert.strictEqual(oInfo.mParameters.requests[1].response.statusCode, "200", "GET response ok");
					done();
				}
			});
		};
		oInput.getElementBinding().attachDataReceived(fnHandler);
	});

	QUnit.test("test oDataModel create", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bCreate = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bCreate) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
	});

	QUnit.test("test oDataModel delete", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRemove = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bRemove) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
	});

	QUnit.test("test oDataModel delete $links", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRemove = false;

		oModel.read("/ProductSet('AD-1000')", {
			urlParameters: {$expand: "ToSupplier"},
			success: function() {
				assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Flyer", "property is accessible after read");
				oModel.remove("/ProductSet('AD-1000')/$links/ToSupplier", {
					success : function(oData, oResponse) {
						assert.ok(true, "request succeeded");
						assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "Flyer", "link deletion does not remove entity");
						bRemove = true;
					},
					error : function(oError) {
						assert.ok(false, "request failed");
					},
					eTag: "*"
				});
			}
		});

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 2 && bRemove) {
					assert.ok(true, "after second request the remove should have happened");
					done();
			}
		});
	});

	QUnit.test("test oDataModel READ and delete in different batch groups, DELETE deferred", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRemove = false;
		oModel.setDeferredGroups(["myId2"]);
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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 2 && bRemove && bRead) {
					assert.ok(true, "requests with same default id should be in 1 batch requests");
					done();
			}
		});
	});

	QUnit.test("test oDataModel Two Way", function(assert) {
		var done = assert.async();
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
		oTable.bindRows({path: "/ProductSet"});

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");

			}

			if (iCount === 2 && bSetProp) {
				assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
				oTable.destroy();
				done();
			}
		});
	});

	QUnit.test("test oDataModel Two Way deferred with using changeBatchGroups", function(assert) {
		var done = assert.async();
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
		oTable.bindRows({path: "/ProductSet"});

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
					done();
				}});
			}
		});
	});

	QUnit.test("test oDataModel Two Way 2 changes deferred with using changeBatchGroups and single=true (= 2 changesets)", function(assert) {
		var done = assert.async();
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
		oTable.bindRows({path: "/ProductSet"});

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
					done();
				}});
			}
		});
	});

	QUnit.test("test oDataModel Two Way 2 changes deferred with using changeBatchGroups and single=false (= 1 changeset)", function(assert) {
		var done = assert.async();
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
		oTable.bindRows({path: "/ProductSet"});

		oModel.attachBatchRequestCompleted(this, function() {
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
					done();
				}});
			}
		});
	});

	QUnit.test("test oDataModel read and setProperty deferred and setProperty again with same data", function(assert) {
		var done = assert.async();
		oModel.setDefaultBindingMode("TwoWay");
		oModel.metadataLoaded().then(function(){
			oModel.read("/ProductSet('HT-1000')", {
				urlParameters: {"$select": "Name" },
				success: function() {
					oModel.setProperty("/ProductSet('HT-1000')/Name", "NewName");
					assert.ok(oModel.hasPendingChanges(), "model has pending changes");
					oModel.submitChanges({
						success : function(oData, oResponse) {
							assert.ok(!oModel.hasPendingChanges(), "model has not any pending changes");
							assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "NewName", "property changed successfully");
							oModel.read("/ProductSet('HT-1000')", {
								success: function() {
									assert.ok(!oModel.hasPendingChanges(), "model has not any pending changes");
									assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "NewName", "new prop value");
									assert.equal(oModel.getProperty("/ProductSet('HT-1000')/TypeCode"), "PR", "new prop value");
									var oSpy = sinon.spy(oModel, "_submitBatchRequest");
									oModel.submitChanges({
										success : function(oData, oResponse) {
											// no request should go out
											assert.strictEqual(oSpy.callCount, 0, "No request sent");
											assert.ok(true, "success handler called even no changes were submitted");
											assert.ok(!oResponse, "no response passed");
											assert.strictEqual(typeof oData, 'object', "data is object");
											assert.ok(isEmptyObject(oData), "data is empty object");
										},
										error : function(oError) {
											assert.ok(false, "request failed");
										}
									});
									setTimeout(function() {
										assert.strictEqual(oSpy.callCount, 0, "No request sent");
										oSpy.restore();
										done();
									}, 0);
								},
								error: function() {
									assert.ok(false, "request failed");
								}
							});
							oModel.setProperty("/ProductSet('HT-1000')/TypeCode", "PR");
							assert.ok(oModel.hasPendingChanges(), "model has pending changes");
						},
						error : function(oError) {
							assert.ok(false, "request failed");
						}
					});
				},
				error: function() {
					assert.ok(false, "request failed");
				}
			});
		});
	});

	QUnit.test("test oDataModel setProperty: reset change if property is set back to original value", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				var sName = oModel.getProperty("/ProductSet('AD-1000')/Name");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/Name", sName);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				done();
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty to undefined/null/''/0/false", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				oModel.setProperty("/ProductSet('AD-1000')/Name", undefined);
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), undefined, "property ok");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "test");
				assert.ok(oModel.hasPendingChanges(), "model should have pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), "test", "property ok");

				oModel.setProperty("/ProductSet('AD-1000')/Name", null);
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), null, "property ok");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "test");
				assert.ok(oModel.hasPendingChanges(), "model should have pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), "test", "property ok");

				oModel.setProperty("/ProductSet('AD-1000')/Name", "");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), "", "property ok");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "test");
				assert.ok(oModel.hasPendingChanges(), "model should have pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), "test", "property ok");

				oModel.setProperty("/ProductSet('AD-1000')/Name", 0);
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), 0, "property ok");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "test");
				assert.ok(oModel.hasPendingChanges(), "model should have pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), "test", "property ok");

				oModel.setProperty("/ProductSet('AD-1000')/Name", false);
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), false, "property ok");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "test");
				assert.ok(oModel.hasPendingChanges(), "model should have pending changes");
				assert.strictEqual(oModel.getProperty("/ProductSet('AD-1000')/Name"), "test", "property ok");

				done();
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty: reset change if property is set back to original value 2", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				var sName = oModel.getProperty("/ProductSet('AD-1000')/Name");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.setProperty("/ProductSet('AD-1000')/NameLanguage", "D");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/Name", sName);
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/NameLanguage", "E");
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				done();
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty: reset change if property is set back to original value - request should be aborted", function(assert) {
		var done = assert.async();
		var oSpy;
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				var sName = oModel.getProperty("/ProductSet('AD-1000')/Name");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/Name", sName);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oSpy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.submitChanges();
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 0, "No request sent");
					oSpy.restore();
					done();
				}, 0);
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty: resetChanges - request should be aborted", function(assert) {
		var done = assert.async();
		var oSpy;
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.resetChanges(["/ProductSet('AD-1000')"]);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.resetChanges(["/ProductSet('AD-1000')/Name"]);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.setProperty("/ProductSet('AD-1000')/NameLanguage", "D");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.resetChanges(["/ProductSet('AD-1000')/Name"]);
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.resetChanges(["/ProductSet('AD-1000')"]);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");

				oSpy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.submitChanges();
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 0, "No request sent");
					oSpy.restore();
					done();
				}, 0);
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty: resetChanges - request should be aborted", function(assert) {
		var done = assert.async();
		var oSpy;
		oModel.read("/ProductSet('HT-1000')");
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.setProperty("/ProductSet('HT-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				oModel.resetChanges(["/ProductSet('AD-1000')","/ProductSet('HT-1000')"]);
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oSpy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.submitChanges();
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 0, "No request sent");
					oSpy.restore();
					done();
				}, 0);
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty : resetChanges twice - request should be aborted", function(assert) {
		var done = assert.async();
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				oModel.setDeferredGroups(["myId"]);
				oModel.setChangeGroups({
					"Product": {
						groupId: "myId",
						changeSetId: "Test",
						single: true
					}
				});

				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.metadataLoaded().then(function(){
					assert.ok(oModel.hasPendingChanges(), "model has pending changes");
					assert.ok(oModel.getPendingChanges()["ProductSet('AD-1000')"], "check entity in internal map");
					assert.equal(oModel.getPendingChanges()["ProductSet('AD-1000')"].Name, "NewName", "check internal map");
					assert.equal(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].request.method, "MERGE", "check internal map");
					oModel.resetChanges();
					oModel.metadataLoaded().then(function(){
						assert.ok(!oModel.hasPendingChanges(), "model has pending changes");
						assert.strictEqual(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].parts.length, 1, "one request");
						assert.ok(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].parts[0].request._aborted, "check request should be marked as aborted");
						oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName2");
						oModel.metadataLoaded().then(function(){
							assert.ok(oModel.hasPendingChanges(), "model has pending changes");
							assert.equal(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].request.data.Name, "NewName2", "check internal data map");
							assert.strictEqual(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].parts.length, 1, "one request");
							assert.ok(!oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].parts[0].request._aborted, "check request should not be marked as aborted");
							oModel.resetChanges();
							oModel.metadataLoaded().then(function(){
								assert.ok(!oModel.hasPendingChanges(), "model has pending changes");
								assert.strictEqual(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].parts.length, 1, "one request");
								assert.ok(oModel.mDeferredRequests["myId"].map["ProductSet('AD-1000')"].parts[0].request._aborted, "check request should be marked as aborted");
								done();
							});
						});
					});
				});
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty: resetChanges - messages should be deleted", function(assert) {
		var done = assert.async();
		var oSpy;
		var oMessage = new Message({
			message: "Message1",
			description: "Message1 description",
			type: MessageType.Error,
			target: "/ProductSet('AD-1000')/Name",
			processor: oModel
		});
		var oMessage2 = new Message({
			message: "Message2",
			description: "Message2 description",
			type: MessageType.Error,
			target: "/ProductSet('AD-1000')/",
			processor: oModel
		});
		var oMessage3 = new Message({
			message: "Message3",
			description: "Message3 description",
			type: MessageType.Error,
			target: "/ProductSet('HT-1000')",
			processor: oModel
		});
		oModel.read("/ProductSet('HT-1000')");
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				Messaging.addMessages([oMessage, oMessage2, oMessage3]);
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.setProperty("/ProductSet('HT-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.ok(oModel.getMessagesByEntity("/ProductSet('AD-1000')"), "Messages for 'AD-1000' set");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('AD-1000')").length, 2, "2 Messages for 'AD-1000' set");
				assert.ok(oModel.getMessagesByEntity("/ProductSet('HT-1000')"), "Messages 'HT-1000' set");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('HT-1000')").length, 1, "1 Message for 'HT-1000' set");
				oModel.resetChanges(["/ProductSet('AD-1000')","/ProductSet('HT-1000')"]);
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('HT-1000')").length, 0, "Messages for 'HT-1000' deleted");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('AD-1000')").length, 0, "Messages for 'AD-1000' deleted");
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oSpy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.submitChanges();
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 0, "No request sent");
					oSpy.restore();
					done();
				}, 0);
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	/** @deprecated As of version 1.95.0, reason sap.ui.model.odata.v2.ODataModel#deleteCreatedEntry */
	QUnit.test("test oDataModel deleteCreatedEntry - messages should be deleted", function(assert) {
		var done = assert.async();
		oModel.metadataLoaded().then(function() {
			var oContext = oModel.createEntry("/ProductSet");
			var oContextPath = oContext.getPath();

			var oMessage = new Message({
				message: "Message1",
				description: "Message1 description",
				type: MessageType.Error,
				target: oContextPath,
				processor: oModel
			});
			var oMessage2 = new Message({
				message: "Message2",
				description: "Message2 description",
				type: MessageType.Error,
				target: oContextPath,
				processor: oModel
			});
			Messaging.addMessages([oMessage, oMessage2]);
			assert.ok(oModel.hasPendingChanges(), "model has pending changes");
			assert.ok(oModel.getMessagesByEntity(oContextPath), "Messages set");
			assert.strictEqual(oModel.getMessagesByEntity(oContextPath).length, 2, "2 Messages set");
			oModel.deleteCreatedEntry(oContext);
			assert.strictEqual(oModel.getMessagesByEntity(oContextPath).length, 0, "Messages deleted");
			done();
		});
	});

	QUnit.test("test oDataModel setProperty: resetChanges - messages should be deleted 2", function(assert) {
		var done = assert.async();
		var oSpy;
		var oMessage = new Message({
			message: "Message1",
			description: "Message1 description",
			type: MessageType.Error,
			target: "/ProductSet('AD-1000')/Name",
			processor: oModel
		});
		var oMessage2 = new Message({
			message: "Message2",
			description: "Message2 description",
			type: MessageType.Error,
			target: "/ProductSet('AD-1000')/",
			processor: oModel
		});
		var oMessage3 = new Message({
			message: "Message3",
			description: "Message3 description",
			type: MessageType.Error,
			target: "/ProductSet('HT-1000')",
			processor: oModel
		});
		oModel.read("/ProductSet('HT-1000')");
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				Messaging.addMessages([oMessage, oMessage2, oMessage3]);
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.setProperty("/ProductSet('HT-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.ok(oModel.getMessagesByEntity("/ProductSet('AD-1000')"), "Messages for 'AD-1000' set");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('AD-1000')").length, 2, "2 Messages for 'AD-1000' set");
				assert.ok(oModel.getMessagesByEntity("/ProductSet('HT-1000')"), "Messages 'HT-1000' set");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('HT-1000')").length, 1, "1 Message for 'HT-1000' set");
				oModel.resetChanges(["/ProductSet('AD-1000')"]);
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('AD-1000')").length, 0, "Messages deleted for 'AD-1000'");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('HT-1000')").length, 1, "1 Message for 'HT-1000' still exist");
				oSpy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.submitChanges();
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 1, "Change request sent");
					oSpy.restore();
					done();
				}, 0);
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty: resetChanges - messages should be deleted 3", function(assert) {
		var done = assert.async();
		var oSpy;
		var oMessage = new Message({
			message: "Message1",
			description: "Message1 description",
			type: MessageType.Error,
			target: "/ProductSet('AD-1000')/Name",
			processor: oModel
		});
		var oMessage2 = new Message({
			message: "Message2",
			description: "Message2 description",
			type: MessageType.Error,
			target: "/ProductSet('AD-1000')/",
			processor: oModel
		});
		var oMessage3 = new Message({
			message: "Message3",
			description: "Message3 description",
			type: MessageType.Error,
			target: "/ProductSet('HT-1000')",
			processor: oModel
		});
		oModel.read("/ProductSet('HT-1000')");
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				Messaging.addMessages([oMessage, oMessage2, oMessage3]);
				oModel.setProperty("/ProductSet('AD-1000')/Name", "NewName");
				oModel.setProperty("/ProductSet('HT-1000')/Name", "NewName");
				assert.ok(oModel.hasPendingChanges(), "model has pending changes");
				assert.ok(oModel.getMessagesByEntity("/ProductSet('AD-1000')"), "Messages for 'AD-1000' set");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('AD-1000')").length, 2, "2 Messages for 'AD-1000' set");
				assert.ok(oModel.getMessagesByEntity("/ProductSet('HT-1000')"), "Messages 'HT-1000' set");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('HT-1000')").length, 1, "1 Message for 'HT-1000' set");
				oModel.resetChanges();
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('HT-1000')").length, 0, "Messages for 'HT-1000' deleted");
				assert.strictEqual(oModel.getMessagesByEntity("/ProductSet('AD-1000')").length, 0, "Messages for 'AD-1000' deleted");
				assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
				oSpy = sinon.spy(oModel, "_submitBatchRequest");
				oModel.submitChanges();
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 0, "No request sent");
					oSpy.restore();
					done();
				}, 0);
			},
			error: function() {
				assert.ok(false, "request failed");
				done();
			}
		});
	});

	QUnit.test("test oDataModel list binding", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bMetadataLoaded = false;
		oModel.setDefaultBindingMode("TwoWay");

		var oTable = new Table();
		oTable.setModel(oModel);
		bMetadataLoaded = true;
		oTable.bindRows({path: "/ProductSet"});

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;

			if (iCount === 1 && bMetadataLoaded){ // bind rows should have been loaded
				var oBinding = oTable.getBinding('rows');
				assert.equal(oBinding.sPath, "/ProductSet", "path check");
				assert.equal(oBinding.getLength(), 115, "length check");
				assert.ok(oBinding.getContexts(), "context check");
				assert.ok(oBinding.sCountMode, "Request", "count mode check");
				oTable.destroy();
				done();
			}

		});
	});

	QUnit.test("test oDataModel setProperty with non deferred requests", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;

		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty without batch", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel.setUseBatch(false);

		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});

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

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty deferred", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		var bSuccess = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				done();
			}
		});
	});

	QUnit.test("test oDataModel setProperty aka MERGE and GET in same batch deferred", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "xy", "check changed name");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/TypeCode"), "PR", "check typecode");
				done();
			}
		});
	});

	QUnit.test("test oDataModel two Way MERGE delta change batch on", function(assert) {
		var done = assert.async();
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

	QUnit.test("test oDataModel two Way MERGE delta change batch on with sap:unit modified", function(assert) {
		var done = assert.async();
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
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel.setUseBatch(false);

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
						assert.ok(false, "should not be called if batch off");
						spy.restore();
					},
					error : function(oError) {
						spy.restore();
						assert.ok(false, "should not be called if batch off");
					}
				});
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "processChange call count");
				var oRequest = spy.returnValues[0];
				assert.equal(oRequest.method, "POST", "request method");
				assert.equal(oRequest.headers['x-http-method'], "MERGE", "request method");
				assert.equal(oRequest.requestUri,"/SalesOrderSrv/ProductSet('HT-1000')",
						"request URI");
				assert.equal(oRequest.data.Name, "xy", "request payload name");
				assert.equal(oRequest.data.Price, "4445.8", "request payload price");
				assert.equal(oRequest.data.CurrencyCode, "EUR", "request payload currencyCode." +
				"Should be also here because price is a currency and has sap:unit = currency code");
				var iCount2 = 0;
				each(oRequest.data, function(iIndex, oValue) {
					iCount2++;
				});
				assert.equal(iCount2, 4, "request payload number of properties");
				spy.restore();
				done();
			}
		});

	});

	QUnit.test("test oDataModel two Way submitChanges with PUT option and batch on", function(assert) {
		var done = assert.async();
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
						assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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
					},
					merge : false
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

	QUnit.test("test oDataModel two Way submitChanges with defaultUpdateMethod= PUT option and batch on", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSetProp = false;
		var bSuccess = false;

		oModel = initModel({json: true, defaultUpdateMethod: UpdateMethod.Put});

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
						assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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

	QUnit.test("test oDataModel two Way submitChanges with PUT option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel = initModel();
		oModel.setUseBatch(false);

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
						spy.restore();
						assert.ok(false, "should not be called if batch off");
					},
					merge : false
				});
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "processChange call count");
				var oRequest = spy.returnValues[0];
				assert.equal(oRequest.method, "PUT", "request method");
				assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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
	});

	QUnit.test("test oDataModel two Way submitChanges with defaultUpdateMethod = PUT option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bSetProp = false;
		oModel = initModel({json: true, defaultUpdateMethod: UpdateMethod.Put});
		oModel.setUseBatch(false);

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
						spy.restore();
						assert.ok(false, "should not be called if batch off");
					},
					merge : false
				});
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bSetProp && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "processChange call count");
				var oRequest = spy.returnValues[0];
				assert.equal(oRequest.method, "PUT", "request method");
				assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod= MERGE option and batch on", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSuccess = false;

		oModel = initModel(); // default should be merge

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
						assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Test", "check changed name");
				spy.restore();
				done();
			}
		});
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod= PUT option and batch on", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bRead2 = false;
		var bSuccess = false;

		oModel = initModel({json: true, defaultUpdateMethod: UpdateMethod.Put});

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
						assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead && bRead2 && bSuccess) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "Test", "check changed name");
				spy.restore();
				done();
			}
		});
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod = MERGE option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bUpdate = false;
		oModel = initModel({json: true, defaultUpdateMethod: UpdateMethod.Merge});
		oModel.setUseBatch(false);

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

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bUpdate && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "call count");
				var oRequest = spy.args[0][0].request;
				assert.equal(oRequest.method, "POST", "request method");
				assert.strictEqual(oRequest.headers['x-http-method'], "MERGE", "request method header should not be present");
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
	});

	QUnit.test("test oDataModel update with defaultUpdateMethod = PUT option and batch off", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead = false;
		var bUpdate = false;
		oModel = initModel({json: true, defaultUpdateMethod: UpdateMethod.Put});
		oModel.setUseBatch(false);

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

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bUpdate && bRead) {
				assert.ok(!oModel.hasPendingChanges(), "pending changes should be false now!");
				assert.equal(spy.callCount, 1, "call count");
				var oRequest = spy.args[0][0].request;
				assert.equal(oRequest.method, "PUT", "request method");
				assert.strictEqual(oRequest.headers['x-http-method'], undefined, "request method header should not be present");
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
	});

	QUnit.test("test oDataModel createEntry and setProperty deferred", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bSuccess1 = false;
		var bSuccess2 = false;
		var oContext;

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
		oModel.metadataLoaded().then(fnTest);
	});

	QUnit.test("test oDataModel createEntry", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oContext;

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
		oModel.metadataLoaded().then(fnTest);
	});

	/** @deprecated As of version 1.95.0, reason sap.ui.model.odata.v2.ODataModel#deleteCreatedEntry */
	QUnit.test("test oDataModel createEntry and deleteCreatedEntry", function(assert) {
		var done = assert.async();
		var oContext;

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
					assert.strictEqual(oSpy.callCount, 0, "No request sent");
					assert.ok(true, "success handler called even no changes were submitted");
					assert.ok(!oResponse, "no response passed");
					assert.strictEqual(typeof oData, 'object', "data is object");
					assert.ok(isEmptyObject(oData), "data is empty object");
				},
				error : function(oError) {
					assert.ok(false, "should not land here");
				}
			});
			setTimeout(function() {
				assert.ok(true, 'no request sent');
				done();
			});
		};
		oModel.attachBatchRequestCompleted(this, function(test) {
			assert.ok(false, "should not land here");
		});
		oModel.metadataLoaded().then(fnTest);
	});

	/** @deprecated As of version 1.95.0, reason sap.ui.model.odata.v2.ODataModel#deleteCreatedEntry */
	QUnit.test("test oDataModel 2 times createEntry and one deleteCreatedEntry", function(assert) {
		var done = assert.async();
		var oContext;

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
		oModel.metadataLoaded().then(fnTest);
	});

	QUnit.module("ODataModelV2 refresh after change", {
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

	var changeOperation = function(bGlobalRefreshAfterChange, bLocalRefreshAfterChange, success, assert, done) {
		oModel.setRefreshAfterChange(bGlobalRefreshAfterChange);

		var bBatch = oModel.bUseBatch; // Convenience: fill correct group id param

		oModel.update("/ProductSet('AD-1000')", {
				Name: "Hello2"
			}, {
			success: success,
			error: function(oError) {
				done();
				assert.ok(false, "request failed");
			},
			merge: true,
			eTag: "*",
			batchGroupId: bBatch ? "myId1" : undefined,
			groupId: !bBatch ? "myId1" : undefined,
			refreshAfterChange: bLocalRefreshAfterChange
		});
	};

	/*
		deferred       | global flag   | function flag
		----------------------------------------------------------
		no             | on            | off
		no             | off           | on
		no             | on            | undefined
		no             | off           | undefined

		yes            | on            | off
		yes            | off           | on
		yes            | on            | undefined
		yes            | off           | undefined

		yes (batch)    | on            | off
		yes (batch)    | off           | on
		yes (batch)    | on            | undefined
		yes (batch)    | off           | undefined
	*/

	/* === Not deferred === */
	QUnit.test("test oDataModel overrule bRefreshAfterChange not deferred - global on - local off", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);

		changeOperation(true, false, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			});
		}, assert, done);
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange not deferred - global off - local on", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);

		changeOperation(false, true, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
				done();
			});
		}, assert, done);
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange not deferred - global on - local undefined", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);

		changeOperation(true, undefined, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
				done();
			});
		}, assert, done);
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange not deferred - global off - local undefined", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);

		changeOperation(false, undefined, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			});
		}, assert, done);
	});

	/* === Deferred === */
	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred - global on - local off", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(true, false, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred - global off - local on", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(false, true, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred - global on - local undefined", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(true, undefined, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred - global off - local undefined", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(false, undefined, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	/* === Deferred batch === */
	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred batch - global on - local off", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(true, false, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred batch - global off - local on", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(false, true, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred batch - global on - local undefined", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(true, undefined, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel overrule bRefreshAfterChange deferred batch - global off - local undefined", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(true);
		oModel.setDeferredGroups(["myId1"]);

		changeOperation(false, undefined, function(oData, oResponse) {
			setTimeout(function() { // Because _refresh might get triggered *after*
									// the success-callback is executed
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			});
		}, assert, done);

		oModel.submitChanges();
	});


	QUnit.test("test oDataModel submitChanges remember bRefreshAfterChange flag in batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.setRefreshAfterChange(true);

		oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello2"
			}, {
			success : function(oData, oResponse) {
				assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
				done();
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			merge: true,
			eTag: "*",
			batchGroupId: "myId1",
			refreshAfterChange: false
		});

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel submitChanges remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.setRefreshAfterChange(true);

		oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello2"
			}, {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			merge: true,
			eTag: "*",
			groupId: "myId1",
			refreshAfterChange: false
		});

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel submitChanges remember bRefreshAfterChange flag in non-batch mode after multiple updates", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.setRefreshAfterChange(true);

		oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello2"
			}, {
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			merge: true,
			eTag: "*",
			groupId: "myId1",
			refreshAfterChange: false
		});

		oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello3"
			}, {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			merge: true,
			eTag: "*",
			groupId: "myId1",
			refreshAfterChange: true
		});

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel create remember bRefreshAfterChange flag in batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(true);
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.setRefreshAfterChange(true);

		oModel.create("/ProductSet", {
				"ProductID": "AD-12345"
			}, {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			groupId: "myId1",
			refreshAfterChange: false
		});
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel create remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setRefreshAfterChange(true);

		oModel.create("/ProductSet", {
				"ProductID": "AD-12345"
			}, {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			refreshAfterChange: false
		});
	});

	QUnit.test("test oDataModel createEntry remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setRefreshAfterChange(true);

		oModel.createEntry("/ProductSet", {
			properties: {
				"ProductID": "AD-12345"
			},
			created: function() {
				oModel.submitChanges();
			},
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			refreshAfterChange: false
		});
	});

	QUnit.test("test oDataModel update remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setRefreshAfterChange(true);

		oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello2"
			}, {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			merge: true,
			eTag: "*",
			refreshAfterChange: false
		});
	});

	QUnit.test("test oDataModel update remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setRefreshAfterChange(false);

		oModel.update("/ProductSet('AD-1000')", {
				Name : "Hello2"
			}, {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.callCount, 1, "Refresh should have been called exactly once");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			merge: true,
			eTag: "*",
			refreshAfterChange: true
		});
	});

	QUnit.test("test oDataModel remove remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setRefreshAfterChange(true);

		oModel.remove("/ProductSet('AD-1000')", {
			success : function(oData, oResponse) {
				setTimeout(function() { // Because _refresh might get triggered *after*
										// the success-callback is executed
					assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
					done();
				}, 0);
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				done();
			},
			refreshAfterChange: false
		});
	});

	QUnit.test("test oDataModel remove callFunction bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		var oRefreshSpy = sinon.spy(oModel, "_refresh");
		oModel.setUseBatch(false);
		oModel.setRefreshAfterChange(true);

		oModel.callFunction("/SalesOrder_InvoiceCreated", {
			method: "POST",
			urlParameters: {"SalesOrderID": "test"},
			refreshAfterChange: false
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
			done();
		});
	});

	QUnit.test("test oDataModel setProperty NOT-remembering bRefreshAfterChange flag in batch mode", function(assert) {
		var done = assert.async();
		oModel.setUseBatch(true);

		oModel.read("/ProductSet", {
			success: function() {
				window.setTimeout(function() {	// Because after our success callback
												// the read still calls _refresh
					var oRefreshSpy = sinon.spy(oModel, "_refresh");
					oModel.setRefreshAfterChange(true);
					oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");

					// setProperty does actually remember the refreshAfterChange state, but it shall get overwritten with the latest state in submitChanges()
					oModel.setRefreshAfterChange(false);
					oModel.submitChanges();

					oModel.attachRequestCompleted(function(oEvent) {
						assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
						done();
					});
				}, 0);
			}
		});

	});

	QUnit.test("test oDataModel setProperty remember bRefreshAfterChange flag in non-batch mode", function(assert) {
		var done = assert.async();
		oModel.setUseBatch(false);
		oModel.setChangeGroups({}); // Clear defaults so that setProperty triggers the change synchronously

		oModel.read("/ProductSet", {
			success: function() {
				window.setTimeout(function() {	// Because after our success callback
												// the read still calls _refresh
					var oRefreshSpy = sinon.spy(oModel, "_refresh");
					oModel.setRefreshAfterChange(false);
					oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
					oModel.setRefreshAfterChange(true);

					oModel.attachRequestCompleted(function(oEvent) {
						assert.equal(oRefreshSpy.called, false, "Refresh should not have been called");
						done();
					});
				}, 0);
			}
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
	QUnit.test("Event order (single request): bindElement fails --> refresh", function(assert){
		var done = assert.async();
		assert.expect(5);
		oModel.setUseBatch(false);
		var oLabel = new Label();
		oLabel.setModel(oModel);
		var handler = function(oEvent) {
			assert.ok(true, "DataReceived fired");
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			oLabel.getElementBinding().detachDataReceived(handler);
			oLabel.getElementBinding().attachDataReceived(function() {
				assert.ok(true, "DataReceived fired");
				oLabel.unbindElement();
				bChanged = false;
				bDataRequested = false;
				bDataReceived = false;
				done(); // resume normal testing
			});
			oLabel.getElementBinding().refresh();
		};
		oLabel.bindElement( {path:"/ProductSet('FAIL')", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived: handler}});
	});

	QUnit.test("Event order (single request): bindElement fails", function(assert){
		var done = assert.async();
		assert.expect(3);
		oModel.setUseBatch(false);
		var oLabel = new Label();
		oLabel.setModel(oModel);
		var handler = function(oEvent) {
			assert.ok(true, "DataReceived fired");
			oLabel.unbindElement();
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			done(); // resume normal testing
		};
		oLabel.bindElement( {path:"/ProductSet('FAIL')", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived: handler}});
	});

	QUnit.test("Event order (batch request): bindElement fails --> refresh", function(assert){
		var done = assert.async();
		assert.expect(5);
		var oLabel = new Label();
		oLabel.setModel(oModel);
		var handler = function(oEvent) {
			assert.ok(true, "DataReceived fired");
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			oLabel.getElementBinding().detachDataReceived(handler);
			oLabel.getElementBinding().attachDataReceived(function() {
				assert.ok(true, "DataReceived fired");
				oLabel.unbindElement();
				bChanged = false;
				bDataRequested = false;
				bDataReceived = false;
				done(); // resume normal testing
			});
			oLabel.getElementBinding().refresh();
		};
		oLabel.bindElement( {path:"/ProductSet('FAIL')", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived: handler}});
	});

	QUnit.test("Event order (batch request): bindElement fails", function(assert){
		var done = assert.async();
		assert.expect(3);
		var oLabel = new Label();
		oLabel.setModel(oModel);
		var handler = function(oEvent) {
			assert.ok(true, "DataReceived fired");
			oLabel.unbindElement();
			bChanged = false;
			bDataRequested = false;
			bDataReceived = false;
			done(); // resume normal testing
		};
		oLabel.bindElement( {path:"/ProductSet('FAIL')", events:{change:fnChange.bind(null, assert), dataRequested:fnDataRequested.bind(null, assert), dataReceived: handler}});
	});

	QUnit.test("test eventing when using read with batch on", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;

		oModel.read("/ProductSet", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.attachBatchRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", "Param check: headers");
			assert.ok(oEvent.getParameter('headers')['x-csrf-token'], "Param check: token");
			var aRequests = oEvent.getParameter('requests');
			assert.strictEqual(aRequests.length, 1, "should contain one request");
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
				assert.strictEqual(aRequests.length, 1, "should contain one request");
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
	});

	QUnit.test("test eventing when using read with batch on: 2 equal requests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;

		oModel.read("/ProductSet", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.read("/ProductSet", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachBatchRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "multipart/mixed", "Param check: headers");
			assert.ok(oEvent.getParameter('headers')['x-csrf-token'], "Param check: token");
			var aRequests = oEvent.getParameter('requests');
			assert.strictEqual(aRequests.length, 1, "should contain only one request");
			assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");
			assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
			sReqId = oEvent.getParameter('ID');
			iReqSent++;
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && iSuccess === 2) {
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
				assert.strictEqual(aRequests.length, 1, "should contain one request");
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
	});

	QUnit.test("test eventing when using read and internal error with batch on", function(assert) {
		var done = assert.async();
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel.read("/ProductSet('4711')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.strictEqual(oError.statusCode, "404", "error code");
				assert.ok(true, "request failed");
			}
		});

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
			assert.strictEqual(aRequests.length, 1, "should contain one request");
			assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet('4711')", "internal request, Param Check: url");
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
				assert.strictEqual(aRequests.length, 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet('4711')", "internal request, Param Check: url");
				assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");
				assert.equal(aRequests[0].response.statusCode, "404", "internal response, Param Check: statusCode");
				assert.equal(aRequests[0].response.statusText, "Not Found", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
	});
	QUnit.test("test eventing when using read and internal error with batch on: 2 equal requests", function(assert) {
		var done = assert.async();
		var iError = 0;
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel.read("/ProductSet('4711')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.strictEqual(oError.statusCode, "404", "error code");
				assert.ok(true, "request failed");
				iError++;
			}
		});
		oModel.read("/ProductSet('4711')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.strictEqual(oError.statusCode, "404", "error code");
				assert.ok(true, "request failed");
				iError++;
			}
		});

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
			assert.strictEqual(aRequests.length, 1, "should contain one request");
			assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet('4711')", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");
			sReqId = oEvent.getParameter('ID');
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && iReqFailed == 0 && iError === 2) {
				assert.ok(true, "eventing performed correctly");
				assert.ok(oEvent.getParameter('success'), "should be true for batch request itself!");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 202, "oResponse Param check: statusCode");

				// check internal response
				var aRequests = oEvent.getParameter('requests');
				assert.strictEqual(aRequests.length, 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet('4711')", "internal request, Param Check: url");
				assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");
				assert.equal(aRequests[0].response.statusCode, "404", "internal response, Param Check: statusCode");
				assert.equal(aRequests[0].response.statusText, "Not Found", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
	});

	QUnit.test("test eventing when using read and error with batch on", function(assert) {
		var done = assert.async();
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel.setDeferredGroups([ "myId1" ]);
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
				assert.strictEqual(aRequests.length, 1, "should contain one request");
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
			assert.strictEqual(aRequests.length, 1, "should contain one request");
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
				assert.strictEqual(aRequests.length, 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
				assert.equal(aRequests[0].response, undefined, "internal response not there");

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
			}
		});
	});

	QUnit.test("test eventing when using read and error with batch on: 2 equal requests", function(assert) {
		var done = assert.async();
		var iError = 0;
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.read("/ProductSet", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.ok(true, "request failed");
				iError++;
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.ok(true, "request failed");
				iError++;
			},
			batchGroupId: "myId1"
		});
		// make internal batch request fail
		oModel.sServiceUrl = "/notWorking";
		oModel.submitChanges();

		oModel.attachBatchRequestFailed(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestFailed", "event id check");
			iReqFailed++;
			if (iReqFailed == 1 && iReqComp === 1 && iReqSent === 1 && iError === 2) {
				assert.ok(!oEvent.getParameter('success'), "should be false for batch request itself!");
				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");

				// check internal response
				var aRequests = oEvent.getParameter('requests');
				assert.strictEqual(aRequests.length, 1, "should contain one request");
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
			assert.strictEqual(aRequests.length, 1, "should contain one request");
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
				assert.strictEqual(aRequests.length, 1, "should contain one request");
				assert.equal(aRequests[0].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet", "internal request, Param Check: url");
				assert.equal(aRequests[0].response, undefined, "internal response not there");

				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
			}
		});
	});

	QUnit.test("test eventing when using read with batch off", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;
		oModel.setUseBatch(false);
		oModel.read("/ProductSet", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
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
	});

	QUnit.test("test eventing when using read with batch off: 2 equal requests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var iReqComp = 0;
		var iReqSent = 0;
		oModel.setUseBatch(false);
		oModel.read("/ProductSet", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.read("/ProductSet", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.attachRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "requestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("ProductSet") !== -1, "Param check: url should be non batch");
			assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");
			assert.equal(oEvent.getParameter('headers').Accept, "application/json", true , "Param check: headers");

			assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
			iReqSent++;
		});

		oModel.attachRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 2 && iSuccess === 2) {
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
				done();
			}
		});
	});

	QUnit.test("test eventing when using read and error batch off", function(assert) {
		var done = assert.async();
		var iError = 0;
		var iReqComp = 0;
		var iReqSent = 0;
		var iReqFailed = 0;
		var sReqId = null;

		oModel.setUseBatch(false);

		oModel.read("/ProductSet('4711')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.strictEqual(oError.statusCode, 404, "error code");
				assert.ok(true, "request failed");
				iError++;
			}
		});
		oModel.read("/ProductSet('4711')", {
			success : function(oData, oResponse) {
				assert.ok(false, "request succeeded...error expected");
			},
			error : function(oError) {
				assert.strictEqual(oError.statusCode, 404, "error code");
				assert.ok(true, "request failed");
				iError++;
			}
		});

		oModel.attachRequestFailed(this, function(oEvent) {
			iReqFailed++;
			if (iReqSent === 2 && iReqFailed === 2 && iReqComp === 2 && iError === 2) {
				assert.equal(oEvent.getId(), "requestFailed", "event id check");
				assert.ok(true, "eventing performed correctly");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
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
			assert.ok(oEvent.getParameter('url').indexOf("ProductSet('4711')") !== -1, "Param check: url should be non batch");
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
				assert.ok(oEvent.getParameter('url').indexOf("ProductSet('4711')") !== -1, "Param check: url should be non batch");
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
	});

	QUnit.test("test eventing when using multiple requests with batch on", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;
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
		oModel.attachBatchRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");

			var aRequests = oEvent.getParameter('requests');
			assert.strictEqual(aRequests.length, 3, "should contain 3 requests");
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

				assert.strictEqual(aRequests.length, 3, "should contain 3 requests");

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
	});

	QUnit.test("test eventing when using multiple requests with batch on: equal requests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var iReqComp = 0;
		var iReqSent = 0;
		var sReqId = null;
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				iSuccess++;
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
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			merge: true,
			eTag: "*",
			batchGroupId: "myId1"
		});
		oModel.update("/ProductSet('HT-1000')", {
			Name : "Test"
		    }, {
			success : function(oData, oResponse) {
				iSuccess++;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			merge: true,
			eTag: "*",
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				iSuccess++;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oModel.attachBatchRequestSent(this, function(oEvent) {
			assert.equal(oEvent.getId(), "batchRequestSent", "event id check");
			assert.ok(oEvent.getParameter('url'), "Param check: url");
			assert.ok(oEvent.getParameter('url').indexOf("$batch") !== -1, "Param check: url should be batch");
			assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
			assert.equal(oEvent.getParameter('async'), true , "Param check: async");

			var aRequests = oEvent.getParameter('requests');
			assert.strictEqual(aRequests.length, 4, "should contain 4 requests");
			assert.equal(aRequests[0].method, "MERGE", "internal request, Param Check: method");
			assert.equal(aRequests[0].url, "ProductSet('HT-1000')", "internal request, Param Check: url");
			assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

			assert.equal(aRequests[1].method, "MERGE", "internal request, Param Check: method");
			assert.equal(aRequests[1].url, "ProductSet('HT-1000')", "internal request, Param Check: url");
			assert.equal(aRequests[1].headers.Accept, "application/json", "internal request Param check: headers");

			assert.equal(aRequests[2].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[2].url, "ProductSet('HT-1001')", "internal request, Param Check: url");
			assert.equal(aRequests[2].headers.Accept, "application/json", "internal request Param check: headers");

			assert.equal(aRequests[3].method, "GET", "internal request, Param Check: method");
			assert.equal(aRequests[3].url, "ProductSet('AD-1000')", "internal request, Param Check: url");
			assert.equal(aRequests[3].headers.Accept, "application/json", "internal request Param check: headers");


			assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
			sReqId = oEvent.getParameter('ID');
			iReqSent++;
		});

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iReqComp++;
			if (iReqComp === 1 && iReqSent === 1 && iSuccess === 5) {
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

				assert.strictEqual(aRequests.length, 4, "should contain 4 requests");

				assert.equal(aRequests[0].method, "MERGE", "internal request, Param Check: method");
				assert.equal(aRequests[0].url, "ProductSet('HT-1000')", "internal request, Param Check: url");
				assert.equal(aRequests[0].headers.Accept, "application/json", "internal request Param check: headers");

				assert.equal(aRequests[1].method, "MERGE", "internal request, Param Check: method");
				assert.equal(aRequests[1].url, "ProductSet('HT-1000')", "internal request, Param Check: url");
				assert.equal(aRequests[1].headers.Accept, "application/json", "internal request Param check: headers");

				assert.equal(aRequests[2].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[2].url, "ProductSet('HT-1001')", "internal request, Param Check: url");
				assert.equal(aRequests[2].headers.Accept, "application/json", "internal request Param check: headers");

				assert.equal(aRequests[3].method, "GET", "internal request, Param Check: method");
				assert.equal(aRequests[3].url, "ProductSet('AD-1000')", "internal request, Param Check: url");
				assert.equal(aRequests[3].headers.Accept, "application/json", "internal request Param check: headers");

				//check response
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 202, "oResponse Param check: statusCode");

				// check internal responses
				assert.equal(aRequests[0].response.statusCode, "204", "internal response, Param Check: statusCode");
				assert.equal(aRequests[0].response.statusText, "No Content", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.equal(aRequests[1].response.statusCode, "204", "internal response, Param Check: statusCode");
				assert.equal(aRequests[1].response.statusText, "No Content", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.equal(aRequests[2].response.statusCode, "200", "internal response, Param Check: statusCode");
				assert.equal(aRequests[2].response.statusText, "OK", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?

				assert.equal(aRequests[3].response.statusCode, "200", "internal response, Param Check: statusCode");
				assert.equal(aRequests[3].response.statusText, "OK", "internal response, Param Check: statusText"); // TODO clarify: is reason phrase mandatory in batch response?


				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId, "Check Request ID");
				done();
			}
		});
	});

	QUnit.test("test eventing when using multiple requests with batch off", function(assert) {
		var done = assert.async();
		var sReqId1 = null;
		var sReqId2 = null;
		var sReqId3 = null;
		var iCount1 = 0;
		var iCount2 = 0;
		var oSpy = sinon.spy(oModel, "_request");
		oModel.setUseBatch(false);
		oModel.setTokenHandlingEnabled(false);
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
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
		oModel.attachRequestSent(this, function(oEvent) {
			var oRequest = oSpy.args[iCount1][0];
			iCount1++;
			if (iCount1 == 1) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oRequest.method, "POST" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('HT-1000')") !== -1, "request URL - ok");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId3 = oEvent.getParameter('ID');
			}

			if (iCount1 == 2) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1001") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(oRequest.method, "GET" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('HT-1001')") !== -1, "request URL - ok");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId1 = oEvent.getParameter('ID');
			}

			if (iCount1 == 3) {
				assert.ok(oEvent.getParameter('url').indexOf("AD-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(oRequest.method, "GET" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('AD-1000')") !== -1, "request URL - ok");
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
				oSpy.restore();
			}
		});
	});

	QUnit.test("test eventing when using multiple requests with batch off: equal requests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var sReqId1 = null;
		var sReqId2 = null;
		var sReqId3 = null;
		var sReqId4 = null;
		var iCount1 = 0;
		var iCount2 = 0;
		var oSpy = sinon.spy(oModel, "_request");
		oModel.setUseBatch(false);
		oModel.setTokenHandlingEnabled(false);
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				assert.ok(true, "request succeeded");
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				assert.ok(true, "request succeeded");
				iSuccess++;
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
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			merge: true,
			eTag: "*",
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				assert.ok(true, "request succeeded");
				iSuccess++;
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
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			merge: true,
			eTag: "*",
			batchGroupId: "myId1"
		});
		oModel.attachRequestSent(this, function(oEvent) {
			// For GET /ProductSet('AD-1000') there are 2 "requestSent" events but only one request on the wire as
			// expected.
			// TODO: Why there are 2 "requestSent" events for GET /ProductSet('AD-1000') but only one
			// "requestCompleted" event?
			var oRequest = oSpy.args[iCount1]?.[0];
			iCount1++;
			if (iCount1 == 1) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oRequest.method, "POST" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('HT-1000')") !== -1, "request URL - ok");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId1 = oEvent.getParameter('ID');
			}
			if (iCount1 == 2) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oRequest.method, "POST" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('HT-1000')") !== -1, "request URL - ok");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId2 = oEvent.getParameter('ID');
			}
			if (iCount1 == 3) {
				assert.ok(oEvent.getParameter('url').indexOf("HT-1001") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(oRequest.method, "GET" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('HT-1001')") !== -1, "request URL - ok");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId3 = oEvent.getParameter('ID');
			}
			if (iCount1 == 4) {
				assert.ok(oEvent.getParameter('url').indexOf("AD-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.equal(oRequest.method, "GET" , "request check: method");
				assert.ok(oRequest.requestUri.indexOf("/ProductSet('AD-1000')") !== -1, "request URL - ok");
				assert.equal(typeof (oEvent.getParameter('ID')), "string", "Param check: id");
				sReqId4 = oEvent.getParameter('ID');
			}
			if (iCount1 == 5) {
				assert.ok(oEvent.getParameter('url').indexOf("AD-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				assert.strictEqual(oRequest, undefined); // no request on the wire
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
				assert.equal(oEvent.getParameter('ID'), sReqId3, "Check Request ID");
				iCount2++;
			}

			if (oEvent.getParameter('url').indexOf("AD-1000") !== -1) {
				assert.ok(oEvent.getParameter('url').indexOf("AD-1000") !== -1, "Param check: url should be non batch");
				assert.equal(oEvent.getParameter('method'), "GET" , "Param check: method");
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 200, "oResponse Param check: statusCode");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId4, "Check Request ID");
				iCount2++;
			}

			if (oEvent.getParameter('url').indexOf("HT-1000") !== -1 && oEvent.getParameter('ID') === sReqId1) {
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 204, "oResponse Param check: statusCode");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId1, "Check Request ID");
				iCount2++;
			}
			if (oEvent.getParameter('url').indexOf("HT-1000") !== -1 && oEvent.getParameter('ID') === sReqId2) {
				assert.equal(oEvent.getParameter('method'), "POST" , "Param check: method");
				assert.equal(oEvent.getParameter('headers')['x-http-method'], "MERGE" , "Param check: method");
				var oResponse = oEvent.getParameter('response');
				assert.ok(oResponse.headers !== undefined, "oResponse Param check: headers");
				assert.equal(oResponse.statusCode, 204, "oResponse Param check: statusCode");
				assert.ok(oEvent.getParameter('ID') !== null, "Check Request ID");
				assert.equal(oEvent.getParameter('ID'), sReqId2, "Check Request ID");
				iCount2++;
			}

			if (iCount2 == 4 && iSuccess === 5) {
				done();
				oSpy.restore();
			}
		});
	});

	QUnit.module("ODataModelV2 abort requests", {
		beforeEach : function() {
			initServer();
			MockServer.config({autoRespondAfter:50});
			oModel = initModel();
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			MockServer.config({/*empty config resets to defaults*/});
			stopServer();
		}
	});

	QUnit.test("test abort of batch request before Sending", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var oAbort = {};
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			},
			batchGroupId: "changes"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			},
			batchGroupId: "changes"
		});
		oAbort = oModel.submitChanges();
		oAbort.abort();

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
			assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			assert.ok(!bSuccess, "Success handler should not be called");
			done();
		});
	});

	QUnit.test("test abort of batch request after Sending", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var oAbort = {};
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			},
			batchGroupId: "changes"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			},
			batchGroupId: "changes"
		});
		oAbort = oModel.submitChanges();
		oModel.attachBatchRequestSent(this, function(oEvent){
			oAbort.abort();
		});
		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
			assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			assert.ok(!bSuccess, "Success handler should not be called");
			done();
		});
	});

	QUnit.test("test abort of batch request: equal requests", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var iAbort = 0;
		var oAbort = {};
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
				iAbort++;
			},
			batchGroupId: "changes"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
				iAbort++;
			},
			batchGroupId: "changes"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				bSuccess = true;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				assert.strictEqual(oError.statusCode, 0, "status code 0");
				assert.strictEqual(oError.statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
				iAbort++;
			},
			batchGroupId: "changes"
		});
		oAbort = oModel.submitChanges();
		oAbort.abort();

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
			assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			assert.ok(!bSuccess, "Success handler should not be called");
			assert.equal(iAbort, 3, "3 aborted inner requests");
			done();
		});
	});

	QUnit.test("test abort of request in batch request", function(assert) {
		var done = assert.async();
		var oAbort = {};
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oAbort = oModel.read("/ProductSet('AD-1000')", {
			success : function() {
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
			},
			batchGroupId: "myId1"
		});
		oAbort.abort();

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.equal(oEvent.getParameter('requests').length, 1, "number of requests check");
			assert.equal(oEvent.getParameter('requests')[0].url, "ProductSet('HT-1001')" , "Param check: url");
			done();
		});
	});

	QUnit.test("test abort of all requests in batch request", function(assert) {
		var done = assert.async();
		assert.expect(4);
		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
			assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			done();
		});

		oModel.attachBatchRequestSent(this, function(oEvent) {
			setTimeout(function() {
				oAbort1.abort();
				oAbort2.abort();
			}, 0);
		});

		var oAbort1 = oModel.read("/ProductSet('HT-1001')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort2 = oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});
	});

	QUnit.test("test abort of all requests in batch request of one group", function(assert) {
		var done = assert.async();
		assert.expect(8);
		var iCounterBatch = 0;
		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iCounterBatch++;
			if (iCounterBatch === 1){
				assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
				assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			} else {
				assert.ok(oEvent.getParameter('response').statusCode !== 0, "status code not 0");
				assert.ok(oEvent.getParameter('response').statusText !== 'abort', "status text not 'abort'"); // Note: statusText 'abort' is set by the model itself
				done();
			}
		});
		var iCounter = 0;
		oModel.attachBatchRequestSent(this, function(oEvent) {
			iCounter++;
			if (iCounter === 2){
				setTimeout(function() {
					oAbort1.abort();
				oAbort2.abort();
				}, 0);
			}
		});

		var oAbort1 = oModel.read("/ProductSet('HT-1001')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort2 = oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		oModel.read("/ProductSet('HT-1001')", {
			success: function() {
				assert.ok(true, "Successhandler was called");
			},
			batchGroupId: "myId2",
			error: function(){
				assert.ok(false, "Errorhandler was called");
			}
		});

		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				assert.ok(true, "Successhandler was called");
			},
			batchGroupId: "myId2",
			error: function(){
				assert.ok(false, "Errorhandler was called");
			}
		});
	});

	QUnit.test("test abort of all requests in batch request of all groups", function(assert) {
		var done = assert.async();
		assert.expect(8);
		var iCounterBatch = 0;
		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iCounterBatch++;
			assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
			assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			if (iCounterBatch === 3){
				done();
			}
		});
		var iCounter = 0;
		oModel.attachBatchRequestSent(this, function(oEvent) {
			iCounter++;
			if (iCounter === 2){
				setTimeout(function() {
					oAbort1.abort();
					oAbort2.abort();
					oAbort3.abort();
					oAbort4.abort();
				}, 0);
			}
		});

		var oAbort1 = oModel.read("/ProductSet('HT-1001')", {
			success: function(){
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort2 = oModel.update("/ProductSet('AD-1000')", {
			success: function(){
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort3 = oModel.read("/ProductSet('HT-1001')", {
			success: function(){
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId2",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort4 = oModel.update("/ProductSet('AD-1000')", {
			success: function(){
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId2",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});
	});

	QUnit.test("test abort of requests in batch request with mixed groups and changesets", function(assert) {
		var done = assert.async();
		assert.expect(9);

		var iBatchCompletedCount = 0;
		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			iBatchCompletedCount++;
			if (iBatchCompletedCount === 1) {
				assert.strictEqual(oEvent.getParameter('response').statusCode, 0, "status code 0");
				assert.strictEqual(oEvent.getParameter('response').statusText, 'abort', "status text 'abort'"); // Note: statusText 'abort' is set by the model itself
			} else if (iBatchCompletedCount === 2) {
				assert.ok(oEvent.getParameter('response').statusCode !== 0, "status code not 0");
				assert.ok(oEvent.getParameter('response').statusText !== 'abort', "status text not 'abort'"); // Note: statusText 'abort' is set by the model itself
				done();
			}
		});
		var iBatchSentCount = 0;
		oModel.attachBatchRequestSent(this, function(oEvent) {
			iBatchSentCount++;
			if (iBatchSentCount === 1) {
				oAbort1.abort();
				oAbort2.abort();
				oAbort3.abort();
			} else if (iBatchSentCount === 2) {
				oAbort4.abort();
			}
		});

		var oAbort1 = oModel.read("/ProductSet('HT-1001')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			sChangeSetId: "myId3",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort2 = oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
		  sChangeSetId: "myId3",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort3 = oModel.read("/ProductSet('HT-1003')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId1",
			sChangeSetId: "myId4",
			error: function(){
				assert.ok(true, "Errorhandler was called");
			}
		});

		var oAbort4 = oModel.read("/ProductSet('HT-1000')", {
			success: function() {
				assert.ok(false, "Successhandler was called");
			},
			batchGroupId: "myId2",
			sChangeSetId: "myId5",
			error: function() {
				assert.ok(true, "Errorhandler was called");
			}
		});

		oModel.read("/ProductSet('HT-1001')", {
			success: function() {
				assert.ok(true, "Successhandler was called");
			},
			batchGroupId: "myId2",
			sChangeSetId: "myId4",
			error: function() {
				assert.ok(false, "Errorhandler was called");
			}
		});
	});

	QUnit.test("test abort of request in batch request: equal requests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var iAbort = 0;
		var oAbort = {};
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			},
			batchGroupId: "myId1"
		});
		oAbort = oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				iAbort++;
			},
			batchGroupId: "myId1"
		});
		oAbort.abort();

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.equal(oEvent.getParameter('requests').length, 2, "number of requests check");
			assert.equal(oEvent.getParameter('requests')[0].url, "ProductSet('HT-1001')" , "Param check: url");
			assert.equal(oEvent.getParameter('requests')[1].url, "ProductSet('AD-1000')" , "Param check: url");
			if (iAbort === 1 && iSuccess === 2) {
				done();
			}
		});
	});

	QUnit.test("test abort of deferred batch request", function(assert) {
		var done = assert.async();
		var oAbort = {};
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
			},
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

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.ok(true, "request should be aborted");
			assert.equal(oEvent.getParameter('success'), false, "request completed with success false");
			done();
		});
	});

	QUnit.test("test abort of deferred batch request: equal reqests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var iAbort = 0;
		var iBatchComp = 0;
		var oAbort = {};
		oModel.setDeferredGroups([ "myId1" ]);
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				iAbort++;
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				iAbort++;
			},
			batchGroupId: "myId1"
		});
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				iAbort++;
			},
			batchGroupId: "myId1"
		});
		oAbort = oModel.submitChanges({success: function(oParams){
			assert.ok(false, "SubmitChanges: request should be aborted");
		}, error: function(oEvent){
			assert.ok(true, "SubmitChanges: request should be aborted");
			iBatchComp++;
		}});
		oAbort.abort();

		oModel.attachBatchRequestCompleted(this, function(oEvent) {
			assert.ok(true, "request should be aborted");
			assert.equal(oEvent.getParameter('success'), false, "request completed with success false");
			if (iBatchComp === 1 && iAbort === 3 && iSuccess === 0) {
				done();
			}
		});
	});

	QUnit.test("test abort of request in non batch request", function(assert) {
		var done = assert.async();
		var bSuccess = false;
		var oAbort = {};
		oModel.setUseBatch(false);
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

		oModel.attachRequestCompleted(this, function(oEvent) {
			if (oEvent.getParameter('success')){
				assert.ok(oEvent.getParameter('url').indexOf("ProductSet('HT-1001')") !== -1, "Param check: url");
			} else {
				assert.ok(false, "aborted request should have never been sent");
			}
			if (bSuccess){
				done();
			}
		});
	});

	QUnit.test("test abort of request in non batch request: euqal requests", function(assert) {
		var done = assert.async();
		var iSuccess = 0;
		var iAbort = 0;
		var oAbort = {};
		oModel.setUseBatch(false);
		oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				iAbort++;
			}
		});
		oModel.read("/ProductSet('AD-1000')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(false, "request failed");
				iAbort++;
			}
		});
		oAbort = oModel.read("/ProductSet('HT-1001')", {
			success : function() {
				iSuccess++;
			},
			error : function(oError) {
				assert.ok(true, "error callback of aborted request is called");
				iAbort++;
			}
		});
		oAbort.abort();
		oModel.attachRequestCompleted(this, function(oEvent) {
			if (oEvent.getParameter('success')){
				assert.ok(true, "request sent");
			} else {
				assert.ok(false, "aborted request should have never been sent");
			}
			if (iSuccess === 2 && iAbort === 1){
				done();
			}
		});
	});



	QUnit.test("XMLHttpRequest abort of batch requests with ODataModel internal", function(assert) {
		var done = assert.async();
		assert.expect(3);
		var iEventCounter = 0;
		var bSuccess1 = false,
			bSuccess2 = false,
			bSuccess3 = false;
		var oModel = initModel({
			"useBatch": true
		});
		this.aRequests = [];

		oModel.attachRequestCompleted(this, function(oEvent) {
			iEventCounter++;
			if (iEventCounter === 2) {
				assert.ok(!bSuccess1, "RequestHandle 1 was flagged aborted in the ODataModel");
				assert.ok(!bSuccess2, "RequestHandle 2 was flagged aborted in the ODataModel");
				assert.ok(!bSuccess3, "RequestHandle 3 was flagged aborted in the ODataModel");
		//		assert.strictEqual(that.aRequests[2].status, 0, "XHR was aborted");
				done();
			}
		});

		var bFirstTime = true;
		oModel.attachRequestSent(this, function(oEvent) {
			if (bFirstTime) {
				bFirstTime = false;
				setTimeout(function() {
					oAbort1.abort();
					oAbort2.abort();
					oAbort3.abort();
				}, 0);
			}
		});

		var oAbort1 = oModel.read("/Products", {
			success: function() {
				bSuccess1 = true;
			},
			sChangeSetId: "myId1"
		});

		var oAbort2 = oModel.update("/Products", {
			success: function() {
				bSuccess2 = true;
			},
			sChangeSetId: "myId1"
		});

		var oAbort3 = oModel.read("/Products", {
			success: function() {
				bSuccess3 = true;
			},
			sChangeSetId: "myId1"
		});

	});

	QUnit.test("test oDataModel checkupdate/dataReceived event order", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var iChange = 0;
		var iReceived = 0;
		var oInput1, oInput2;

		oInput1 = new Input();
		oInput1.setModel(oModel);
		oInput2 = new Input();
		oInput2.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.strictEqual(iChange, 2, "checkupdate done");
			iReceived++;
			if (iReceived == 2) {
				assert.ok(true, "dataReceived after checkUpdate");
			}
		};

		oInput1.bindElement({path:"/ProductSet('AD-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
		oInput2.bindElement({path:"/ProductSet('HT-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 ) {
				assert.ok(true, "batch request completed");
				oInput1.destroy();
				oInput2.destroy();
				done();
			}
		});
	});

	QUnit.test("test oDataModel checkupdate/dataReceived event order: equal requests", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var iChange = 0;
		var iReceived = 0;
		var oInput1, oInput2, oInput3;

		oInput1 = new Input();
		oInput1.setModel(oModel);
		oInput2 = new Input();
		oInput2.setModel(oModel);
		oInput3 = new Input();
		oInput3.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.strictEqual(iChange, 3, "checkupdate done");
			iReceived++;
			if (iReceived == 3) {
				assert.ok(true, "dataReceived after checkUpdate");
			}
		};

		oInput1.bindElement({path:"/ProductSet('AD-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
		oInput2.bindElement({path:"/ProductSet('HT-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});
		oInput3.bindElement({path:"/ProductSet('HT-1000')", batchGroupId:1, events:{change: fnChange, dataReceived: fnDataReceived}});

		oModel.attachBatchRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 1 ) {
				assert.ok(true, "batch request completed");
				oInput1.destroy();
				oInput2.destroy();
				oInput3.destroy();
				done();
			}
		});
	});

	QUnit.test("test oDataModel checkupdate/dataReceived event order - data already loaded", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var iChange = 0;
		var oInput1, oInput2;

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
	});

	QUnit.test("test oDataModel dataReceived event count", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oInput1;

		oInput1 = new Input();
		oInput1.setModel(oModel);

		new Input({
			models: oModel,
			objectBindings: {
				undefined: {
					path: "/ProductSet('HT-1000')",
					events: {
						dataReceived: function() {
							assert.strictEqual(iCount, 0, "dataReceived called once");
							iCount++;
							if (iCount === 1) {
								oModel.setProperty("/ProductSet('HT-1000')/Name", "Test");
								oInput1.destroy();
								done();
							}
						}
					}
				}
			},
			value: "{Name}"
		});
	});

	QUnit.test("test oDataModel listbinding with table - event order change/dataReceived", function(assert) {
		var done = assert.async();
		var iChange = 0,
			iReceived = 0;
		var oTable = new Table();
		oTable.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.strictEqual(iChange, 1, "checkupdate done");
			iReceived++;
			if (iReceived == 1) {
				assert.ok(true, "dataReceived after checkUpdate");
			}
		};

		oTable.bindRows({path: "/VH_CategorySet", events:{change: fnChange, dataReceived: fnDataReceived}});
		var fnCheck = function() {
			assert.ok(oTable.getBinding('rows').getLength() >= 2, "Category size check");
			oTable.destroy();
			done();
		};
		oModel.attachBatchRequestCompleted(this, fnCheck);
	});

	QUnit.test("test oDataModel listbinding with table - event order change/dataReceived - data already loaded", function(assert) {
		var done = assert.async();
		var iCount = 0,
			iChange = 0,
			iReceived = 0;
		var oTable = new Table();
		oTable.setModel(oModel);

		var fnChange = function(oEvent) {
			iChange++;
		};
		var fnDataReceived = function(oEvent) {
			assert.strictEqual(iChange, 1, "checkupdate done");
			iReceived++;
			if (iReceived == 1) {
				assert.ok(true, "dataReceived after checkUpdate");
				oTable.destroy();
			}
		};

		oTable.bindRows({path: "/VH_CategorySet", events:{change: fnChange, dataReceived: fnDataReceived}});
		var fnCheck = function() {
			iCount++;
			if (iCount <= 2) {
				assert.ok(true, "request completed");
				done();
			} else {
				assert.ok(false, "too many requests");
			}
		};
		oModel.attachBatchRequestCompleted(this, fnCheck);
	});

	QUnit.test("test oDataModel createEntry, submit fails, change again and submit", function(assert) {
		var done = assert.async();
		var oContext;

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
					assert.strictEqual(oData.__batchResponses.length, 1, "One response found");
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
					assert.strictEqual(oData.__batchResponses.length, 1, "One response found");
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

		oModel.metadataLoaded().then(fnTest);
	});

	QUnit.test("test oDataModel callFunction: Parameter without mode", function(assert) {
		var done = assert.async();
		oModel.callFunction("/SalesOrder_InvoiceCreated", {
			method: "POST",
			urlParameters: {"SalesOrderID": "test"}
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.strictEqual(oEventInfo.getParameter("url"), "SalesOrder_InvoiceCreated?SalesOrderID='test'", "Valid parameter is added to URL");
			done();
		});
	});

	QUnit.test("test oDataModel callFunction: Parameter with mode", function(assert) {
		var done = assert.async();
		oModel.callFunction("/SalesOrder_Confirm",{
			method: "POST",
			urlParameters: {"SalesOrderID": "test"}
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.strictEqual(oEventInfo.getParameter("url"), "SalesOrder_Confirm?SalesOrderID='test'", "Valid parameter is added to URL");
			done();
		});
	});

	QUnit.test("test oDataModel callFunction: empty string Parameter", function(assert) {
		var done = assert.async();
		oModel.callFunction("/SalesOrder_Confirm",{
			method: "POST",
			urlParameters: {"SalesOrderID": ""}
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.strictEqual(oEventInfo.getParameter("url"), "SalesOrder_Confirm?SalesOrderID=''", "Valid parameter is added to URL");
			done();
		});
	});

		QUnit.test("test oDataModel callFunction: null Parameter", function(assert) {
		var done = assert.async();
		oModel.callFunction("/SalesOrder_Confirm",{
			method: "POST",
			urlParameters: {"SalesOrderID": "null"}
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.strictEqual(oEventInfo.getParameter("url"), "SalesOrder_Confirm?SalesOrderID='null'", "Valid parameter is added to URL");
			done();
		});
	});

	QUnit.test("test oDataModel callFunction: parameters are preserved", function(assert) {
		var done = assert.async();
		var mUrlParams = {
			"SalesOrderID": "test"
		};

		oModel.callFunction("/SalesOrder_Confirm",{
			method: "POST",
			urlParameters: mUrlParams
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.strictEqual(oEventInfo.getParameter("url"), "SalesOrder_Confirm?SalesOrderID='test'", "Valid parameter is added to URL");
			assert.equal(mUrlParams["SalesOrderID"], "test", "Parameter still exists after sending function import");
			done();
		});
	});

	QUnit.test("test oDataModel callFunction: additional parameters", function(assert) {
		var done = assert.async();
		var mUrlParams = {
			"SalesOrderID": "test",
			"$expand": "ToBusinessPartner",
			"sap-some": "sapTest"
		};

		oModel.callFunction("/SalesOrder_Confirm",{
			method: "POST",
			urlParameters: mUrlParams
		});

		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.strictEqual(oEventInfo.getParameter("url"), "SalesOrder_Confirm?SalesOrderID='test'&$expand=ToBusinessPartner&sap-some=sapTest", "Valid parameter is added to URL");
			done();
		});
	});

	QUnit.test("test oDataModel binding function import parameters deferred", function(assert) {
		var done = assert.async();
		oModel.setDefaultBindingMode("TwoWay");
		var oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated", {
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
			assert.equal(oContext.getProperty("SalesOrderID"), "test", "Value check in model");
			oInput.setValue("Blubb");
			assert.equal(oInput.getValue(), "Blubb", "Value check");
			assert.equal(oContext.getProperty("SalesOrderID"), "Blubb", "Value check in model");
			oModel.submitChanges();
		}, function() {
			assert.ok(false, "Test failed");
		});
		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_InvoiceCreated?SalesOrderID='Blubb'");
			done();
		});
	});

	QUnit.test("test oDataModel binding function import parameters not deferred", function(assert) {
		var done = assert.async();
		var oHandle;
		var oInput;
		oModel.setDefaultBindingMode("TwoWay");

		oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated", {
			method: "POST",
			urlParameters: {"SalesOrderID": "test"}
		});

		oInput = new Input();
		oInput.bindValue("SalesOrderID");
		oInput.setModel(oModel);

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
	});

	QUnit.test("test oDataModel binding function import parameters result check error", function(assert) {
		var done = assert.async();
		oModel.setDefaultBindingMode("TwoWay");
		var oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated", {
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
			assert.equal(oContext.getProperty("SalesOrderID"), "test", "Value check in model");
			oInput.setValue("Blubb");
			assert.equal(oInput.getValue(), "Blubb", "Value check");
			assert.equal(oContext.getProperty("SalesOrderID"), "Blubb", "Value check in model");
			oModel.submitChanges();
		}, function() {
			assert.ok(false, "Test failed");
		});

		oModel.attachRequestCompleted(this, function(oEventInfo) {
			assert.ok(!oEventInfo.getParameter("success"), "request should have failed!");
			done();
		});

	});

	QUnit.test("test oDataModel binding function import with empty parameter deferred", function(assert) {
		var done = assert.async();
		oModel.setDefaultBindingMode("TwoWay");
		var oHandle = oModel.callFunction("/SalesOrder_InvoiceCreated", {
			groupId: "changes",
			method: "POST",
			urlParameters: {"SalesOrderID": ""}
		});

		var oInput = new Input();
		oInput.bindValue("SalesOrderID");
		oInput.setModel(oModel);

		oHandle.contextCreated().then(function(oContext) {
			oModel.submitChanges();
		}, function() {
			assert.ok(false, "Test failed");
		});
		oModel.attachRequestSent(this, function(oEventInfo) {
			assert.ok(oEventInfo.getParameter("url") === "SalesOrder_InvoiceCreated?SalesOrderID=''");
			done();
		});
	});

	QUnit.test("test getETag", function(assert){
		assert.expect(3);
		var done = assert.async();
		var oInput = new Input();
		oInput.setModel(oModel);
		oInput.bindElement("/ProductSet('AD-1000')");
		var fnHandler = function() {
			var oContext = oInput.getBindingContext();
			//as mockServer does not provide an ETag we fake one
			oContext.getObject().__metadata.etag = "someEtag";
			assert.ok(oContext, "Context exists");
			assert.ok(oModel.getETag(oContext.getObject()), "eTag exists");
			assert.ok(oModel.getETag(oContext.getPath()), "eTag exists");
			oInput.getElementBinding().detachChange(fnHandler);
			oInput.unbindElement();
			oInput.setBindingContext(null);
			done();
		};
		oInput.getElementBinding().attachChange(fnHandler);
	});

	QUnit.module("ODataModelV2 single request with groupId", {
		beforeEach : function() {
			initServer();
			oModel = initModel({json: true, useBatch: false, defaultCountMode: 'None'});
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});

	QUnit.test("test oDataModel read with no group id", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

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

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with no ids should should be combined in a single batch request");
				done();
			}
		});
	});

	QUnit.test("test oDataModel read with different group ids", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.read("/ProductSet", {
			groupId : "myId1",
			success : function(oData, oResponse) {
				bRead1 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.read("/ContactSet", {
			groupId : "myId2",
			success : function(oData, oResponse) {
				bRead2 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with different ids should be in separate batch requests");
				done();
			}
		});
	});

	QUnit.test("test oDataModel read with same groupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.read("/ProductSet", {
			groupId : "myId",
			success : function(oData, oResponse) {
				bRead1 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.read("/ContactSet", {
			groupId : "myId",
			success : function(oData, oResponse) {
				bRead2 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});
		oModel.attachRequestCompleted(
			this,
			function(test) {
				iCount++;
				if (iCount === 2 && bRead1 && bRead2) {
					assert.ok(true, "requests with same id should be combined in a batch request");
					done();
				}
			});
	});

	QUnit.test("test oDataModel read deferred with groupId", function(assert) {
		var done = assert.async();
		oModel.setDeferredGroups([ "myId" ]);
		oModel.read("/ProductSet", {
			groupId : "myId",
			success : function(oData, oResponse) {
				assert.ok(true, "request succeeded");
				done();
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.submitChanges();
	});

	QUnit.test("test oDataModel read deferred with default groupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.setDeferredGroups([ undefined ]);
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

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with same default id should be combined in a batch request");
				done();
			}
		});
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel read deferred with same groupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.setDeferredGroups([ "myId1" ]);
		oModel.read("/ProductSet", {
			groupId : "myId1",
			success : function(oData, oResponse) {
				bRead1 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.read("/ContactSet", {
			groupId : "myId1",
			success : function(oData, oResponse) {
				bRead2 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachRequestCompleted(this, function(test) {
			iCount++;
			if (iCount === 2 && bRead1 && bRead2) {
				assert.ok(true, "requests with same id should be combined in a batch request");
				done();
			}
		});
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel read deferred with different groupIds", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bRead1 = false;
		var bRead2 = false;

		oModel.setDeferredGroups([ "myId1", "myId2" ]);
		oModel.read("/ProductSet", {
			groupId : "myId1",
			success : function(oData, oResponse) {
				bRead1 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.read("/ContactSet", {
			groupId : "myId2",
			success : function(oData, oResponse) {
				bRead2 = true;
				assert.ok(true, "request succeeded");
			},
			error : function(oError) {
				assert.ok(false, "request failed");
			}
		});

		oModel.attachRequestCompleted(this, function(test) {
				iCount++;
				if (iCount === 2 && bRead1 && bRead2) {
					assert.ok(true, "requests with different ids should be in separate batch requests");
					done();
				}
			});
		oModel.submitChanges();
	});

	QUnit.test("test oDataModel Two Way", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var bSetProp = false;
		oModel.setDefaultBindingMode("TwoWay");

		// make request non deferred...
		oModel.setChangeGroups({
			"*" : {groupId : "myId"}

		});

		var oTable = new Table();
		oTable.setModel(oModel);

		oModel.metadataLoaded().then(function() {
			oTable.bindRows({path: "/ProductSet"});
			oModel.attachRequestCompleted(this, function(test) {
				iCount++;

				if (iCount === 1){ // bind rows should have been loaded
					bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");

				}

				if (iCount === 2 && bSetProp) {
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					oTable.destroy();
					done();
				}
			});
		});
	});

	QUnit.test("test oDataModel Two Way deferred with using changeGroups", function(assert) {
		var done = assert.async();
		var iCount = 0;
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

		oModel.metadataLoaded().then(function() {
			oTable.bindRows({path: "/ProductSet"});

			var fnHandler = function(test) {
				iCount++;

				if (iCount === 1){ // bind rows should have been loaded
					bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
					assert.ok(oModel.hasPendingChanges(), "Pending changes test");
					oModel.submitChanges();
				}
				if (iCount === 2) {
					assert.ok(true, "request called");
					assert.ok(bSetProp, "set Property succesful");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					assert.ok(!oModel.hasPendingChanges(), "Pending changes test");
					oModel.detachRequestCompleted(fnHandler);
					oTable.destroy();
					done();
				}
			};
			oModel.attachRequestCompleted(this, fnHandler);
		});
	});

	QUnit.test("test oDataModel Two Way 2 changes deferred with using changeGroups", function(assert) {
		var done = assert.async();
		var iCount = 0;
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

		oModel.metadataLoaded().then(function() {
			oTable.bindRows({path: "/ProductSet"});

			var fnHandler = function(test) {
				iCount++;

				if (iCount === 1) { // bind rows should have been loaded
					bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
					bSetProp2 = oModel.setProperty("/ProductSet('HT-1000')/Name", "NewValue2");
					assert.ok(oModel.hasPendingChanges(), "Pending changes test");
					oModel.submitChanges();
				}
				if (iCount === 3) {
					assert.ok(true, "request called");
					assert.ok(bSetProp, "set property successful");
					assert.ok(bSetProp2, "set property successful");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "NewValue2", "Two Way check");

					assert.ok(!oModel.hasPendingChanges(), "Pending changes test");
					oModel.detachRequestCompleted(fnHandler, this);
					oTable.destroy();
					done();
				}
			};
			oModel.attachRequestCompleted(this, fnHandler);
		});
	});

	QUnit.test("test oDataModel Two Way 2 changes deferred with using changeGroups", function(assert) {
		var done = assert.async();
		var iCount = 0;
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
		oModel.metadataLoaded().then(function() {
			oTable.bindRows({path: "/ProductSet"});

			var fnHandler = function(test) {
				iCount++;

				if (iCount === 1) { // bind rows should have been loaded
					bSetProp = oModel.setProperty("/ProductSet('AD-1000')/Name", "NewValue");
					bSetProp2 = oModel.setProperty("/ProductSet('HT-1000')/Name", "NewValue2");
					assert.ok(oModel.hasPendingChanges(), "Pending changes test");
					oModel.submitChanges();
				}
				if (iCount === 3) {
					assert.ok(true, "request called");
					assert.ok(bSetProp, "set property successful");
					assert.ok(bSetProp2, "set property successful");
					assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"), "NewValue", "Two Way check");
					assert.equal(oModel.getProperty("/ProductSet('HT-1000')/Name"), "NewValue2", "Two Way check");

					assert.ok(!oModel.hasPendingChanges(), "Pending changes test");
					oModel.detachRequestCompleted(fnHandler, this);
					oTable.destroy();
					done();
				}
			};
			oModel.attachRequestCompleted(this, fnHandler);
		});
	});

	QUnit.test("test oDataModel OneTime bindings with bindObject and resolve checks", function(assert) {
		var done = assert.async();
		var iCount = 0;
		var oTxt = new Input();
		oTxt.bindValue({path: "Category", mode: 'OneTime'});
		oModel.setUseBatch(true);
		oTxt.setModel(oModel);

		assert.equal(oTxt.getBinding('value').getBindingMode(), "OneTime", "Binding mode check!");
		assert.ok(!oTxt.getBinding('value').isResolved(), "Binding should not be resolved!");
		assert.strictEqual(oTxt.getValue(), "", "text value should be null");

		var fnCheck = function() {
			iCount++;
			assert.strictEqual(iCount, 1, "request performed");
			assert.equal(oTxt.getBinding('value').getBindingMode(), "OneTime", "Binding mode check!");
			assert.ok(oTxt.getBinding('value').isResolved(), "Binding should be resolved!");
			assert.strictEqual(oTxt.getValue(), "Headsets", "text value should be set");

			assert.equal(oModel.getProperty("/VH_CategorySet('Headsets')/Category"), "Headsets", "Category loaded check");
			oTxt.destroy();
			oModel.detachBatchRequestCompleted(fnCheck);
			done();
		};
		oTxt.bindObject("/VH_CategorySet('Headsets')");
		oModel.attachBatchRequestCompleted(this, fnCheck);
	});

	QUnit.test("test oDataModel setProperty after submitChanges(): request/order", function(assert) {
		var done = assert.async();
		oModel.setUseBatch(true);
		spy = sinon.spy(oModel, "_processChange");
		var oRequest;
		var requestCount = 0;
		oModel.attachRequestCompleted(function(oInfo) {
			requestCount++;
			if (requestCount == 1) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'GET', "GET");
			} else if (requestCount == 2) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'GET', "GET");
			} else if (requestCount == 3) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'MERGE', "MERGE");
				oRequest = spy.returnValues[0];
				assert.strictEqual(oRequest.data.Name, "emil", "data ok");
			} else if (requestCount == 4) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'MERGE', "MERGE");
				oRequest = spy.returnValues[1];
				assert.strictEqual(oRequest.data.Name, "hugo", "data ok");
			}
		});

		var fnSuc = function() {
			oModel.read("/ProductSet('HT-1000')",{groupId:"changes"});
			oModel.submitChanges();
			oModel.setProperty("/ProductSet('AD-1000')/Name", "emil");
			//oModel.setProperty("/Products(1)/Name", oN);
			setTimeout(function() {
				oModel.submitChanges();
				oModel.setProperty("/ProductSet('AD-1000')/Name", "hugo");
				setTimeout(function() {
					oModel.submitChanges({success: function() {
						assert.strictEqual(requestCount, 4, '4 requests sent');
						done();
					}});
				},300);
			},300);
		};
		oModel.read("/ProductSet('AD-1000')",{success: fnSuc});
	});

	QUnit.test("test oDataModel setProperty after submitChanges(): request/order", function(assert) {
		var done = assert.async();
		oModel.setUseBatch(true);
		spy = sinon.spy(oModel, "_processChange");
		var oRequest;
		var requestCount = 0;
		oModel.attachRequestCompleted(function(oInfo) {
			requestCount++;
			if (requestCount == 1) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'GET', "GET");
			} else if (requestCount == 2) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'GET', "GET");
			} else if (requestCount == 3) {
				assert.ok(oInfo.getParameter('success'), "request success");
				assert.strictEqual(oInfo.getParameter('method'), 'MERGE', "MERGE");
				oRequest = spy.returnValues[1];
				assert.strictEqual(oRequest.data.Name, "hugo", "data ok");
			}
		});
		var fnSuc = function() {
			oModel.read("/ProductSet('HT-1000')",{groupId:"changes"});
			oModel.submitChanges();
			var oN = oModel.getProperty("/ProductSet('AD-1000')/Name");
			oModel.setProperty("/ProductSet('AD-1000')/Name", "emil");
			oModel.setProperty("/ProductSet('AD-1000')/Name", oN);
			setTimeout(function() {
				oModel.submitChanges();
				oModel.setProperty("/ProductSet('AD-1000')/Name", "hugo");
				setTimeout(function() {
					oModel.submitChanges({success: function() {
						assert.strictEqual(requestCount, 3, '3 requests sent');
						done();
					}});
				},300);
			},300);
		};
		oModel.read("/ProductSet('AD-1000')",{success: fnSuc});
	});


	QUnit.test("ListBinding gets correct change reason", function(assert) {
		var done = assert.async();

		var oList = new List({
			items: {
				path: "ToProducts",
				template: new ListItem()
			},
			growing: true
		});
		oList.bindElement({path:"/BusinessPartnerSet('0100000000')", parameters: { expand:"ToProducts"} });
		oList.setModel(oModel);


		oModel.metadataLoaded().then(function() {
			var iElementBindingCounter = {};
			var iListBindingCounter = {};


			var fnCount = function(oEvent) {
				var sReason = oEvent.getParameter("reason");
				if (!iElementBindingCounter[sReason]) {
					iElementBindingCounter[sReason] = 0;
				}
				iElementBindingCounter[sReason]++;

				switch (iElementBindingCounter[ChangeReason.Context]) {
					case 1:
						oList.bindElement({path:"/BusinessPartnerSet('0100000044')", events: {change: fnCount}, parameters: { expand:"ToProducts"}});
						break;

					case 2:
						oList.bindElement({path:"/BusinessPartnerSet('0100000000')", events: {change: fnCount}, parameters: { expand:"ToProducts"}});
						break;

					case 3:
						fnSecondTest();
				}
			};


			var fnSecondTest = function() {
				assert.equal(iElementBindingCounter[ChangeReason.Context], 3, "Correct number of context-changes");
				assert.equal(Object.keys(iElementBindingCounter).length, 1, "No other changes were fired");


				var oBinding = oList.getBinding("items");
				oBinding.attachChange(function(oEvent) {
					var sReason = oEvent.getParameter("reason");
					if (!iListBindingCounter[sReason]) {
						iListBindingCounter[sReason] = 0;
					}
					iListBindingCounter[sReason]++;

					switch (iListBindingCounter[ChangeReason.Context]) {
						case 1:
							oBinding.setContext(oModel.createBindingContext("/BusinessPartnerSet('0100000000')"));
							break;

						case 2:
							assert.equal(iListBindingCounter[ChangeReason.Context], 2, "Correct number of context-changes");
							assert.equal(Object.keys(iListBindingCounter).length, 1, "No other changes were fired");
							oList.destroy();
							done();
					}
				});

				oBinding.setContext(oModel.createBindingContext("/BusinessPartnerSet('0100000044')"));
			};

			oList.getElementBinding().attachChange(fnCount);
		});

	});

	QUnit.test("test ODataModel createEntry and persist the transient entry", function(assert) {
		var done = assert.async();
		var oContext;
		var oBinding;
		var bRefresh = false;
		assert.expect(6);

		oModel.metadataLoaded().then(function() {
			oContext = oModel.createEntry("/BusinessPartnerSet", {properties: {}});
			oBinding = oModel.bindList("ToSalesOrders", oContext);
			oBinding.attachRefresh(function(oEvent) {
				assert.ok(oBinding.getContext().isUpdated());
				oBinding.getContexts();
				bRefresh = true;
			});

			oBinding.attachChange(function() {
				assert.ok(Array.isArray(oBinding.getCurrentContexts()));
				assert.equal(oBinding.getCurrentContexts().length, 0);
				assert.ok(bRefresh);
				done();
			});

			assert.ok(oBinding.bInitial);
			oBinding.initialize();
			assert.ok(oBinding.bInitial);
			oModel.submitChanges();
		});
	});

	QUnit.module("ODataContextBinding", {
		beforeEach : function() {
			initServer();
			oModel = initModel({defaultBindingMode: "TwoWay", useBatch: "true"});
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});


	QUnit.test("Fire change when parent context was removed - Entity was deleted", function(assert) {
		var done = assert.async();
		var oSalesOrderData;

		oMockServer.stop();
		var aRequests = oMockServer.getRequests();
		aRequests.forEach(function (oRequest) {
			var sPath = String(oRequest.path);
			if (sPath.indexOf("$") == -1) {

				if (oRequest._fnOrginalResponse){
					oRequest.response = oRequest._fnOrginalResponse;
				}

				oRequest._fnOrginalResponse = oRequest.response;
				oRequest.response = function (oXhr) {
					oXhr._fnOrignalXHRRespond = oXhr.respond;
					oXhr.respond = function (status, headers, content) {
						if (content){
							var oC = JSON.parse(content);
							if (oC.d && oC.d.SalesOrderID){
								// first time
								oSalesOrderData = oC.d;
							} else if (oC.error){ // second time
								oSalesOrderData.ToProduct = null;
								oC = {d: oSalesOrderData};
								status = 200;
							}
						}
						oXhr._fnOrignalXHRRespond.apply(this, [status, headers, JSON.stringify(oC)]);
					};
					oRequest._fnOrginalResponse.apply(this, arguments);
				};
			}
		});
		oMockServer.start();

		oModel.metadataLoaded().then(function(){
			oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", {urlParameters: {$expand: "ToProduct"}, success: function(){

				var oInput = new Input({
					objectBindings: {
						path: "ToProduct"
					},
					value: "{Name}"
				});

				var oPanel = new Panel({
					objectBindings: {
						path: "/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')"
					},
					content: oInput
				});
				oPanel.setModel(oModel);

				assert.equal(oInput.getValue(), "Notebook Basic 15", "Value is set correctly.");

				// Is not supported by mockserver, but response is correct
				oModel.remove("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')/$links/ToProduct", {success: function(){

					assert.equal(oInput.getValue(), "Notebook Basic 15", "Value is still set.");

					oModel.read("/SalesOrderLineItemSet(SalesOrderID='0500000000',ItemPosition='0000000010')", {urlParameters: {$expand: "ToProduct"}, success: function(){
						oInput.getBinding("value").attachChange(function(){
							assert.equal(oInput.getValue(), "", "Value was reset to null");
							done();
						});
					}});
				}});
			}});
		});
	});

	QUnit.module("ODataContextBinding", {
		beforeEach : function() {
			initServer();
			oModel = initModel({preliminaryContext:true});
		},
		afterEach : function() {
			oModel.destroy();
			oModel = undefined;
			cleanSharedData();
			stopServer();
		}
	});
	QUnit.test("Master detail - refresh both (master + detail) and detail binding creates preliminary context", function(assert) {
		var done = assert.async();
		assert.expect(3);

		oModel.metadataLoaded().then(function() {
			function fnSuccess() {
				var oPanel =  new Panel({
					content: [
						new Table({ // create Table UI
							rows: {
								path: "/ProductSet",
								filters: [
									new Filter("ProductID", "EQ", "AD-1000")
								]
							},
							columns : [
								new Column({label: new Label({text: "ProductID"}), template: new Label({text: "{ProductID}"})})
							]
						})
					],
					models: oModel
				}).placeAt("qunit-fixture"); // table needs to be rendered so that RowsUpdated event is fired
				oPanel.getContent()[0].attachRowsUpdated(fnReload);

				var oPanel2 =  new Panel({
					objectBindings: {path: "/ProductSet('AD-1000')"},
					content: [
						new Input({
							value: "{ProductID}"
						})
					],
					models: oModel
				});

				function fnReload() {
					oPanel.getContent()[0].detachRowsUpdated(fnReload);
					var fnOrig = ODataModel.prototype.read;
					ODataModel.prototype.read = function() {
						var that = this;
						var args = arguments;
						setTimeout(function() {
							fnOrig.apply(that,args);
						},10);
					};

					oPanel2.bindElement("/ProductSet('HT-1000')");
					setTimeout(function() {
						ODataModel.prototype.read = fnOrig;
						var oTable = oPanel.getContent()[0];
						oTable.bindAggregation("rows", {
							path:"/ProductSet",
							filters: [
								new Filter("ProductID", "EQ", "HT-1000")
							]
						});
						oTable.attachRowsUpdated(function() {
							assert.ok(!oTable.getRows()[0].getBindingContext().isPreliminary(), "Context must not be preliminary");
							assert.strictEqual(oTable.getRows()[0].getCells()[0].getBindingContext().getPath(), "/ProductSet('HT-1000')", "Context propagated correctly");
							assert.strictEqual(oTable.getRows()[0].getCells()[0].getBinding("text").getContext().getPath(), "/ProductSet('HT-1000')", "Context propagated correctly");
							done();
						});
					}, 1);
				}
			}
			oModel.read("/ProductSet('AD-1000')", {
				success: fnSuccess.bind(this)
			});
		}.bind(this));
	});
});