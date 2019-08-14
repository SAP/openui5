/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/LrepConnector"
], function(
	sinon,
	merge,
	BaseConnector,
	LrepConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var _loadModulesResponse = {changes: [], loadModules: true};

	function fnReturnData(oServer, sData) {
		sandbox.server.respondWith(sData);
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
			fnReturnData(this.xhr, "{}");

			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oServer, oResult) {
				assert.deepEqual(oResult, {}, "the default response resolves the request Promise");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data is triggered with a cacheKey", function (assert) {
			var sCacheKey = "abc123";

			fnReturnData(this.xhr, "{}");

			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function (oServer) {
				assert.equal(oServer.getRequest(0).url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "the cacheKey is included in the request");
			}.bind(undefined, sandbox.server));
		});

		QUnit.test("given a mock server, when loading flex data and returning the flag to also load modules", function (assert) {
			var sCacheKey = "abc123";

			fnReturnData(this.xhr, JSON.stringify(_loadModulesResponse));

			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function (oServer, oResult) {
				assert.equal(oServer.requestCount, 2, "then the request for the modules was triggered");
				assert.equal(oServer.getRequest(1).url, "/sap/bc/lrep/flex/modules/~abc123~/reference?appVersion=1.0.0", "and the URL was correct");
				assert.deepEqual(oResult, _loadModulesResponse, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "and the flex_data response resolves the promise");
			}.bind(undefined, sandbox.server));
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
