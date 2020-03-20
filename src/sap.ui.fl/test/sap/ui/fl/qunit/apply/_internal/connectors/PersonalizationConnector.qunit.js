/* global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function(
	sinon,
	PersonalizationConnector,
	ApplyUtils
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	var newToken = "newToken";

	function mockResponse(sData, sResponseType) {
		this.xhr.onCreate = function(oRequest) {
			oRequest.addEventListener("loadstart", function(oEvent) {
				oEvent.target.responseType = sResponseType || "";
				this.oXHR = oRequest;
				this.oXHRLoadSpy = sandbox.spy(oRequest, "onload");
				oEvent.target.respond(200, { "X-CSRF-Token": newToken, "Content-Type": "application/json" }, sData);
			}.bind(this));
		}.bind(this);
	}

	QUnit.module("Given Personalization connector with a fake XHR", {
		beforeEach : function () {
			this.xhr = sandbox.useFakeXMLHttpRequest();
			mockResponse.call(this, '{"changes":[]}');
		},
		afterEach: function() {
			PersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no static changes-bundle.json is placed, loading flex data is triggered and an empty response as 'json' is returned", function (assert) {
			var oMockResponse = {changes:[]};
			mockResponse.call(this, JSON.stringify(oMockResponse), "json");
			return PersonalizationConnector.loadFlexData({url: "/flexPersonalization", reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.deepEqual(this.oXHRLoadSpy.firstCall.args[0].target.response, oMockResponse, "then xhr.onLoad was called with the right response");
				assert.deepEqual(oResult, oMockResponse, "then the default response is returned");
			}.bind(this));
		});

		QUnit.test("when no static changes-bundle.json is placed, loading flex data is triggered and an empty response as default is returned", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/flexPersonalization", reference: "reference", appVersion: "1.0.0"}).then(function (oResult) {
				assert.strictEqual(this.oXHRLoadSpy.firstCall.args[0].target.response, JSON.stringify(oResult), "then xhr.onLoad was called with the right response");
				assert.deepEqual(oResult, {changes: []}, "then the default response is returned");
			}.bind(this));
		});

		QUnit.test("given a mock server, when loading flex data is triggered with the correct url", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/flexPersonalization", reference: "reference", appVersion: "1.0.0"}).then(function () {
				assert.equal(this.oXHR.url, "/flexPersonalization/flex/personalization/v1/data/reference?appVersion=1.0.0", "url is correct");
			}.bind(this));
		});

		QUnit.test("loadFlexData also requests and stores an xsrf token", function (assert) {
			return PersonalizationConnector.loadFlexData({url: "/flexPersonalization", reference: "reference", appVersion: "1.0.0"}).then(function () {
				assert.equal(PersonalizationConnector.xsrfToken, newToken, "the token was stored correct");
			});
		});

		QUnit.test("loadFlexData trigger the correct request to back end", function (assert) {
			var mPropertyBag = {
				url: "/flexPersonalization",
				reference: "reference",
				appVersion: "1.0.0"
			};
			var mParameter = {
				appVersion: "1.0.0"
			};
			var sExpectedUrl = "/flexPersonalization/flex/personalization/v1/data/reference?appVersion=1.0.0";
			var oStubGetUrlWithQueryParameters = sandbox.stub(ApplyUtils, "getUrl").returns(sExpectedUrl);
			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({
				response : {
					changes: [1],
					compVariants: [2]
				},
				xsrfToken : "newToken",
				status: "200"
			});
			return PersonalizationConnector.loadFlexData(mPropertyBag).then(function (oFlexData) {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/personalization/v1/data/", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[2], mParameter, "with correct parameters input");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2].xsrfToken, undefined, "with correct token");
				assert.equal(PersonalizationConnector.xsrfToken, "newToken", "new token is set");
				assert.equal(oFlexData.changes.length, 2, "two entries are in the change section");
				assert.equal(oFlexData.changes[0], 1, "the change entry is contained");
				assert.equal(oFlexData.changes[1], 2, "the compVariant entry is contained");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});