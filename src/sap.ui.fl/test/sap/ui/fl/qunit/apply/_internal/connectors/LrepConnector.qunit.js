/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function(
	sinon,
	LrepConnector,
	ApplyUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function fnReturnData(sData) {
		sandbox.server.respondWith([200, { "Content-Type": "application/json" }, sData]);
	}

	QUnit.module("LrepConnector with a sinon fake server", {
		beforeEach : function () {
			this.xhr = sinon.fakeServer.create();
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no static changes-bundle.json placed for 'reference' resource roots and a mock server, when loading flex data is triggered and an empty response is returned", function (assert) {
			fnReturnData(JSON.stringify({changes: [], loadModules: false}));

			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oServer, oResult) {
				assert.deepEqual(oResult, {changes: [], loadModules: false}, "the default response resolves the request Promise");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data is triggered with a cacheKey", function (assert) {
			var sCacheKey = "abc123";

			fnReturnData(JSON.stringify({changes: [], loadModules: false}));

			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function (oServer) {
				assert.equal(oServer.getRequest(0).url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "the cacheKey is included in the request");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data is triggered with a sideId and appDescriptorId info passed", function (assert) {
			var sCacheKey = "abc123";

			fnReturnData(JSON.stringify({changes: [], loadModules: false}));

			return LrepConnector.loadFlexData({
				url: "/sap/bc/lrep",
				reference: "reference",
				appVersion: "1.0.0",
				cacheKey: sCacheKey,
				siteId: "dummySite",
				appDescriptor: {
					"sap.app": {
						id: "appDescriptorId"
					}
				}
			}).then(function (oServer) {
				assert.equal(oServer.getRequest(0).url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "the cacheKey is included in the request");
				assert.equal(oServer.getRequest(0).requestHeaders["X-LRep-Site-Id"], "dummySite", "the siteId is included in the request");
				assert.equal(oServer.getRequest(0).requestHeaders["X-LRep-AppDescriptor-Id"], "appDescriptorId", "the appDescriptorId is included in the request");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data and returning the flag to also load modules", function (assert) {
			var sCacheKey = "abc123";

			fnReturnData(JSON.stringify({changes: [], loadModules: true}));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function (oServer, oResult) {
				assert.equal(oServer.requestCount, 1, "then there is one request to load data");
				assert.equal(oServer.getRequest(0).url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "and the URL was correct");
				assert.ok(oStubLoadModule.calledOnce, "loadModule triggered");
				assert.deepEqual(oResult, {changes: [], loadModules: true}, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "and the flex_data response resolves the promise");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data the settings value is stored", function (assert) {
			fnReturnData(JSON.stringify({changes: [], settings: {isKeyUser: true}}));
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oServer) {
				assert.equal(oServer.requestCount, 1, "then there is one request to load data");
				assert.deepEqual(LrepConnector.settings, {isKeyUser: true}, "and the settings value is stored");
			}.bind(undefined, sandbox.server));
		});
	});

	QUnit.module("LrepConnector without fake server", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when loadFlexData is called with '<NO CHANGES>' as cache key", function(assert) {
			var oSendRequestStub = sandbox.stub(ApplyUtils, "sendRequest");
			return LrepConnector.loadFlexData({cacheKey: "<NO CHANGES>"}).then(function(oResponse) {
				assert.equal(oSendRequestStub.callCount, 0, "no request was sent");
				assert.equal(oResponse, undefined, "the function returns no data");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
