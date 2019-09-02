/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/write/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function(
	sinon,
	ApplyPersonalizationConnector,
	WritePersonalizationConnector,
	ApplyUtils
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
				url: "/sap/bc/lrep",
				flexObjects: {}
			};
			var sExpectedUrl = "/sap/bc/lrep/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return WritePersonalizationConnector.write(mPropertyBag).then(function() {
				assert.equal(oSpyGetUrl.getCall(0).args[0], "/changes/", "with correct route path");
				assert.equal(oSpyGetUrl.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], sExpectedMethod, "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2], mPropertyBag, "with correct flexObjects");
			});
		});

		QUnit.test("given reset is called", function (assert) {
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "reference",
				generator: "generator",
				selectorIds: ["id1", "id2"],
				appVersion: "1.0.1",
				changeTypes: "rename"
			};
			var sExpectedUrl = "/sap/bc/lrep/changes/?reference=reference&appVersion=1.0.1&generator=generator&selector=id1,id2&changeType=rename";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({});
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return WritePersonalizationConnector.reset(mPropertyBag).then(function() {
				assert.equal(oSpyGetUrl.getCall(0).args[0], "/changes/", "with correct route path");
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



	QUnit.module("PersonalizationrConnector handing xsrf token in combination of the apply connector", {
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
			oStubSendRequest.onCall(0).rejects({status : 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken : newToken});
			oStubSendRequest.onCall(2).resolves({response : "something"});

			var mPropertyBag = {url : "/flex/keyuser", flexObjects : []};
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
			oStubSendRequest.onCall(0).resolves({xsrfToken : newToken});
			oStubSendRequest.onCall(1).resolves({response : "something"});

			var mPropertyBag = {url : "/flex/keyuser", flexObjects : []};
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
