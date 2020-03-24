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

	function mockResponse(sData, sEtag, sResponseType) {
		this.xhr.onCreate = function(oRequest) {
			var oHeaders = { "Content-Type": "application/json" };
			if (sEtag) {
				oHeaders.Etag = sEtag;
			}
			oRequest.addEventListener("loadstart", function(oEvent) {
				oEvent.target.responseType = sResponseType || "";
				this.oXHR = oRequest;
				this.oXHRLoadSpy = sandbox.spy(oRequest, "onload");
				oEvent.target.respond(200, oHeaders, sData);
			}.bind(this));
		}.bind(this);
	}

	QUnit.module("Given LrepConnector with a fake XHR", {
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

		QUnit.test("when loading flex data is triggered end Etag is available in the response header", function (assert) {
			mockResponse.call(this, JSON.stringify({changes: [], loadModules: false}), "cacheKey");

			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(oResult, {changes: [], loadModules: false, cacheKey: "cacheKey"}, "/sap/bc/lrep/flex/data/reference?appVersion=1.0.0", "cacheKey is set in the result");
			});
		});

		QUnit.test("when loading flex data is triggered with a sideId and appDescriptorId info passed", function (assert) {
			var sCacheKey = "abc123";

			mockResponse.call(this, JSON.stringify({changes: [], loadModules: false}));

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
			}).then(function () {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "the cacheKey is included in the request");
				assert.equal(this.oXHR.requestHeaders["X-LRep-Site-Id"], "dummySite", "the siteId is included in the request");
				assert.equal(this.oXHR.requestHeaders["X-LRep-AppDescriptor-Id"], "appDescriptorId", "the appDescriptorId is included in the request");
			}.bind(this));
		});

		QUnit.test("when loading flex data and returning the flag to also load modules", function (assert) {
			var sCacheKey = "abc123";

			mockResponse.call(this, JSON.stringify({changes: [], loadModules: true}));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", cacheKey: sCacheKey}).then(function (oResult) {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/reference?appVersion=1.0.0", "and the URL was correct");
				assert.ok(oStubLoadModule.calledOnce, "loadModule triggered");
				assert.deepEqual(oResult, {changes: [], loadModules: true, cacheKey: "abc123"}, "and the flex_data response resolves the promise");
			}.bind(this));
		});

		QUnit.test("when loading flex data the settings value is stored", function (assert) {
			mockResponse.call(this, JSON.stringify({changes: [], settings: {isKeyUser: true}}));
			return LrepConnector.loadFlexData({url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0"}).then(function () {
				assert.deepEqual(LrepConnector.settings, {isKeyUser: true}, "and the settings value is stored");
			});
		});
	});

	QUnit.module("LrepConnector without fake server", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when loadFlexData is called with <NO CHANGES> as cache key", function(assert) {
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
