/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Configuration"
], function(
	Utils,
	sinon,
	Configuration
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oSetRequestHeaderSpy;

	QUnit.module("URLHandling", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when addLanguageInfo is called", function(assert) {
			var mParameters = {};
			var mExpectedValue = {"sap-language": "en"};
			sandbox.stub(Configuration, "getLanguage").returns("en");
			Utils.addLanguageInfo(mParameters);
			assert.deepEqual(mParameters, mExpectedValue, "the sap language property is set");
			assert.throws(function() {Utils.addLanguageInfo();}, "without any param map then an error is thrown");
		});

		QUnit.test("when addSAPLogonLanguageInfo is called", function(assert) {
			var mParameters = {};
			var mExpectedValue = {"sap-language": "EN"};
			sandbox.stub(Configuration, "getSAPLogonLanguage").returns("EN");
			Utils.addSAPLogonLanguageInfo(mParameters);
			assert.deepEqual(mParameters, mExpectedValue, "the sap language property is set");
			assert.throws(function() {Utils.addSAPLogonLanguageInfo();}, "without any param map then an error is thrown");
		});

		QUnit.test("when getURL is called", function(assert) {
			var mParameters = {};
			var mPropertyBag = {};
			var sRoute;
			assert.throws(function() {Utils.getUrl(sRoute, mPropertyBag, mParameters);}, "without all necessary parameters then an error is thrown");
			sRoute = "sRoute";
			mPropertyBag.url = "url";
			var sExpectedUrl = "urlsRoute";
			assert.deepEqual(Utils.getUrl(sRoute, mPropertyBag, mParameters), sExpectedUrl, "the right url is returned");
			mPropertyBag.cacheKey = "cacheKey";
			sExpectedUrl = "urlsRoute~cacheKey~/";
			assert.deepEqual(Utils.getUrl(sRoute, mPropertyBag, mParameters), sExpectedUrl, "with a cacheKey then the right url is returned");
			mPropertyBag.fileName = "fileName";
			sExpectedUrl = "urlsRoute~cacheKey~/fileName";
			assert.deepEqual(Utils.getUrl(sRoute, mPropertyBag, mParameters), sExpectedUrl, "with a fileName then the right url is returned");
			mPropertyBag.reference = "reference";
			sExpectedUrl = "urlsRoute~cacheKey~/reference";
			assert.deepEqual(Utils.getUrl(sRoute, mPropertyBag, mParameters), sExpectedUrl, "with a reference then the right url is returned");

			mParameters = {
				parameter1: "parameter1",
				parameter2: "parameter2"
			};
			sExpectedUrl = "urlsRoute~cacheKey~/reference?parameter1=parameter1&parameter2=parameter2";
			assert.deepEqual(Utils.getUrl(sRoute, mPropertyBag, mParameters), sExpectedUrl, "with parameters then the right url is returned");
		});
	});

	QUnit.module("sendRequest", {
		beforeEach() {
			this.server = sinon.fakeServer.create();
			this.server.autoRespond = true;
			oSetRequestHeaderSpy = sandbox.spy(XMLHttpRequest.prototype, "setRequestHeader");
		},
		afterEach() {
			sandbox.restore();
		}
	},
	function() {
		QUnit.test("when sendRequest is called with no method and an no initial connector, with payload", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var mPropertyBag = {};
			mPropertyBag.payload = "payload";
			var oRequestPayloadSpy = sandbox.spy(XMLHttpRequest.prototype, "send");

			this.server.respondWith("GET", "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE",
				[200, {"Content-Type": "string"}, "GET request successful"]);

			var sExpectedResult = {
				response: "GET request successful",
				status: 200
			};
			return Utils.sendRequest(sUrl, undefined, mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, sExpectedResult, "with undefined sMethod then the GET request is successful");
				assert.ok(oSetRequestHeaderSpy.calledOnce, "");
				assert.equal(oSetRequestHeaderSpy.getCall(0).args[0], "X-CSRF-Token", "");
				assert.equal(oSetRequestHeaderSpy.getCall(0).args[1], "fetch", "");
				assert.equal(oRequestPayloadSpy.getCall(0).args[0], "payload");
			});
		});

		QUnit.test("when sendRequest is called with GET method, with initial conncetor, no payload", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var sMethod = "GET";
			var mPropertyBag = {};
			mPropertyBag.initialConnector = {};
			mPropertyBag.initialConnector.xsrfToken = "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU";
			mPropertyBag.contentType = "Content-Type";
			mPropertyBag.siteId = "X-LRep-Site-Id";
			mPropertyBag.sAppDescriptorId = "X-LRep-AppDescriptor-Id";

			this.server.respondWith("GET", "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE",
				[200, {"Content-Type": "application/json"}, '{ "message": "GET request successful"}']);

			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResponse) {
				assert.equal(oSetRequestHeaderSpy.callCount, 3, "");
				assert.equal(oSetRequestHeaderSpy.getCall(0).args[0], "Content-Type", "");
				assert.equal(oSetRequestHeaderSpy.getCall(0).args[1], "Content-Type", "");
				assert.equal(oSetRequestHeaderSpy.getCall(1).args[0], "X-LRep-Site-Id", "");
				assert.equal(oSetRequestHeaderSpy.getCall(1).args[1], "X-LRep-Site-Id", "");
				assert.equal(oSetRequestHeaderSpy.getCall(2).args[0], "X-LRep-AppDescriptor-Id", "");
				assert.equal(oSetRequestHeaderSpy.getCall(2).args[1], "X-LRep-AppDescriptor-Id", "");
				assert.equal(typeof oResponse.response, "object");
			});
		});

		QUnit.test("when sendRequest is called with POST method, intinial connector with token", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var sMethod = "POST";
			var mPropertyBag = {};
			mPropertyBag.initialConnector = {};
			mPropertyBag.initialConnector.xsrfToken = "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU";

			this.server.respondWith("POST", "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE",
				[200, {"Content-Type": "string"}, "POST request successful"]);

			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).then(function() {
				assert.ok(oSetRequestHeaderSpy.calledOnce, "");
				assert.equal(oSetRequestHeaderSpy.getCall(0).args[0], "X-CSRF-Token", "");
				assert.equal(oSetRequestHeaderSpy.getCall(0).args[1], "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU", "");
			});
		});

		QUnit.test("when sendRequest is called test with empty Response", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var sMethod = "HEAD";
			var mPropertyBag = {};
			mPropertyBag.initialConnector = {};

			this.server.respondWith("HEAD", "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE",
				[204, {"Content-Type": "application/json", "X-CSRF-Token": "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU", Etag: "Etag"},
					'{ "message": "POST request successful", "status": 204 }']);

			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse.xsrfToken, "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU");
				assert.equal(mPropertyBag.initialConnector.xsrfToken, "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU");
				assert.equal(oResponse.etag, "Etag");
				assert.equal(oResponse.reponse, undefined);
				assert.equal(oResponse.status, 204);
			});
		});

		QUnit.test("when sendRequest is called test with cachable request", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/~dummytoken~/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var sMethod = "HEAD";
			var mPropertyBag = {};
			mPropertyBag.initialConnector = {};

			this.server.respondWith("HEAD", sUrl,
				[204, {"Content-Type": "application/json", "X-CSRF-Token": "84343258f9d94804-gaFfTNfclP5uThxHR7StXFwu_GU"},
					'{ "message": "POST request successful", "status": 204 }']);

			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResponse) {
				assert.equal(oResponse.xsrfToken, undefined);
				assert.equal(mPropertyBag.initialConnector.xsrfToken, undefined);
			});
		});

		QUnit.test("when sendRequest is called with Internal Server Error", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var sMethod = "GET";
			var mPropertyBag = {};

			this.server.respondWith("GET", "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE",
				[500, {"Content-Type": "application/json" },
					'{ "messages": [{"severity": "Error", "text": "Internal Server Error" }]}']);
			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function(oError) {
				assert.equal(oError.status, 500, "");
				assert.equal(oError.userMessage, "Internal Server Error\n", "");
			});
		});

		QUnit.test("when sendRequest is called with Bad Request return", function(assert) {
			var sUrl = "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE";
			var sMethod = "GET";
			var mPropertyBag = {};

			this.server.respondWith("GET", "/flexKeyuser/flex/keyuser/v2/data/sap.ui.demoapps.rta.fiorielements.Component?sap-language=de-DE",
				[400, {"Content-Type": "string" }, "Bad Request"]);
			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function(oError) {
				assert.equal(oError.status, 400, "");
				assert.equal(oError.userMessage, "", "");
			});
		});
	});
});
QUnit.done(function() {
	"use strict";
	document.getElementById("qunit-fixture").style.display = "none";
});
