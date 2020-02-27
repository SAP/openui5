/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/write/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	Layer,
	ApplyPersonalizationConnector,
	WritePersonalizationConnector,
	ApplyUtils,
	WriteUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Connector", {
		beforeEach : function () {
			ApplyPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			ApplyPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given write is called", function (assert) {
			var mPropertyBag = {
				url: "/flexPersonalization",
				flexObjects: {}
			};
			var sExpectedUrl = "/flexPersonalization/flex/personalization/v1/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return WritePersonalizationConnector.write(mPropertyBag).then(function() {
				assert.equal(oSpyGetUrl.getCall(0).args[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oSpyGetUrl.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], sExpectedMethod, "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2].payload, "{}", "with correct payload");
				assert.equal(oStubSendRequest.getCall(0).args[2].xsrfToken, "123", "with correct token");
				assert.equal(oStubSendRequest.getCall(0).args[2].contentType, "application/json; charset=utf-8", "with correct contentType");
				assert.equal(oStubSendRequest.getCall(0).args[2].dataType, "json", "with correct dataType");
			});
		});

		QUnit.test("given a mock server, when update is triggered", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName"
			};
			var mPropertyBag = {url: "/flexPersonalization", flexObject: oFlexObject};
			var sUrl = "/flexPersonalization/flex/personalization/v1/changes/myFileName";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();
			return WritePersonalizationConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken: ApplyPersonalizationConnector.xsrfToken,
					tokenUrl: "/flexPersonalization/flex/personalization/v1/actions/getcsrftoken",
					applyConnector: ApplyPersonalizationConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove is triggered", function (assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "myNamespace",
				layer: Layer.VENDOR
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/flexPersonalization"
			};
			var sUrl = "/flexPersonalization/flex/personalization/v1/changes/myFileName?namespace=myNamespace";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return WritePersonalizationConnector.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken: ApplyPersonalizationConnector.xsrfToken,
					tokenUrl: "/flexPersonalization/flex/personalization/v1/actions/getcsrftoken",
					applyConnector: ApplyPersonalizationConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given reset is called", function (assert) {
			var mPropertyBag = {
				url: "/flexPersonalization",
				reference: "reference",
				generator: "generator",
				selectorIds: ["id1", "id2"],
				appVersion: "1.0.1",
				changeTypes: "rename"
			};
			var sExpectedUrl = "/flexPersonalization/flex/personalization/v1/changes/?reference=reference&appVersion=1.0.1&generator=generator&selector=id1,id2&changeType=rename";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return WritePersonalizationConnector.reset(mPropertyBag).then(function() {
				assert.equal(oSpyGetUrl.getCall(0).args[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oSpyGetUrl.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("given reset is called with optional parameters", function (assert) {
			var mPropertyBag = {
				url: "/flexPersonalization",
				reference: "reference",
				generator: undefined,
				selectorIds: undefined,
				appVersion: "1.0.1",
				changeTypes: undefined,
				somethingNotNecessary: "somethingNotNecessary"
			};
			var sExpectedUrl = "/flexPersonalization/flex/personalization/v1/changes/?reference=reference&appVersion=1.0.1";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return WritePersonalizationConnector.reset(mPropertyBag).then(function() {
				assert.equal(oSpyGetUrl.getCall(0).args[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.equal(oSpyGetUrl.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("given load features is called", function (assert) {
			var mExpectedFeatures = {
				isProductiveSystem: true
			};

			return WritePersonalizationConnector.loadFeatures().then(function(oResponse) {
				assert.deepEqual(oResponse, mExpectedFeatures, "the settings object is returned correctly");
			});
		});
	});



	QUnit.module("PersonalizationConnector handing xsrf token in combination of the apply connector", {
		beforeEach : function () {
		},
		afterEach: function() {
			ApplyUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("given a mock server, when write is triggered and the apply connectors xsrf token is outdated", function (assert) {
			var newToken = "newToken456";

			ApplyPersonalizationConnector.xsrfToken = "oldToken123";

			var oStubSendRequest = sinon.stub(ApplyUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status: 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken: newToken});
			oStubSendRequest.onCall(2).resolves({response: "something"});

			var mPropertyBag = {url: "/flexPersonalization", flexObjects: []};
			return WritePersonalizationConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 3, "three request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the first request was a POST request");
				assert.equal(oStubSendRequest.getCall(1).args[1], "HEAD", "the second request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(2).args[1], "POST", "the third request was a POST request");
				assert.equal(ApplyPersonalizationConnector.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(2).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});

		QUnit.test("given a mock server, when write is triggered and the apply connectors has no token", function (assert) {
			var newToken = "newToken456";

			ApplyPersonalizationConnector.xsrfToken = undefined;

			var oStubSendRequest = sinon.stub(ApplyUtils, "sendRequest");
			oStubSendRequest.onCall(0).resolves({xsrfToken: newToken});
			oStubSendRequest.onCall(1).resolves({response: "something"});

			var mPropertyBag = {url: "/flexPersonalization", flexObjects: []};
			return WritePersonalizationConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 2, "two request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "HEAD", "the first request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
				assert.equal(oStubSendRequest.getCall(1).args[1], "POST", "the second request was a POST request");
				assert.equal(ApplyPersonalizationConnector.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
