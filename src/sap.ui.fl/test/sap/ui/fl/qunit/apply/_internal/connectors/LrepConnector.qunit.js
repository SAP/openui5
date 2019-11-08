/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector"
], function(
	sinon,
	BaseConnector,
	LrepConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function fnReturnData(sData) {
		sandbox.server.respondWith([200, { "Content-Type": "application/json" }, sData]);
	}

	QUnit.module("Connector", {
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
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
