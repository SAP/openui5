/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector"
], function(
	sinon,
	merge,
	BaseConnector,
	LrepConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function mockResponse(sData, sEtag, sResponseType) {
		this.xhr.onCreate = function(oRequest) {
			oRequest.addEventListener("loadstart", function(oEvent) {
				oEvent.target.responseType = sResponseType || "";
				this.oXHR = oRequest;
				this.oXHRLoadSpy = sandbox.spy(oRequest, "onload");
				oEvent.target.respond(200, { "Content-Type": "application/json" }, sData);
			}.bind(this));
		}.bind(this);
	}

	QUnit.module("Connector", {
		beforeEach : function () {
			this.xhr = sandbox.useFakeXMLHttpRequest();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no static changes-bundle.json is placed, loading flex data is triggered and an empty response as default is returned", function (assert) {
			var oResponse = {changes: [], loadModules: false};
			mockResponse.call(this, JSON.stringify(oResponse));
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, oResponse, "the default response resolves the request Promise");
				assert.strictEqual(this.oXHRLoadSpy.firstCall.args[0].target.response, JSON.stringify(oResponse), "then xhr.onLoad was called with the right response");
			}.bind(this));
		});

		QUnit.test("when no static changes-bundle.json is placed, loading flex data is triggered and an empty response as 'json' is returned", function (assert) {
			var oResponse = {changes: [], loadModules: false};
			mockResponse.call(this, JSON.stringify(oResponse), undefined, "json");
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, oResponse, "the default response resolves the request Promise");
				assert.deepEqual(this.oXHRLoadSpy.firstCall.args[0].target.response, oResponse, "then xhr.onLoad was called with the right response");
			}.bind(this));
		});

		QUnit.test("when loading flex data is triggered with a cacheKey", function (assert) {
			var sCacheKey = "abc123";
			mockResponse.call(this, JSON.stringify({changes: [], loadModules: false}));
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function () {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "the cacheKey is included in the request");
			}.bind(this));
		});

		QUnit.test("when loading flex data and returning the flag to also load modules", function (assert) {
			var sCacheKey = "abc123";
			var oResponse = {changes: [], loadModules: true};
			mockResponse.call(this, JSON.stringify(oResponse));
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function (oResult) {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/modules/~abc123~/reference?appVersion=1.0.0", "and the URL was correct");
				assert.deepEqual(oResult, oResponse, "and the flex_data response resolves the promise");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
