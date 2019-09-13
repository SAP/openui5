/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	KeyUserConnector,
	ApplyConenctor,
	ApplyUtils,
	WriteUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("KeyUserConnector write", {
		beforeEach : function () {
		},
		afterEach: function() {
			WriteUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when write is triggered", function (assert) {
			var mPropertyBag = {url : "/flex/keyuser", flexObjects : []};
			var sUrl = "/flex/keyuser/v1/changes/";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConenctor.xsrfToken,
					tokenUrl : "/flex/keyuser/v1/settings",
					applyConnector : ApplyConenctor,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					flexObjects : "[]"
				}), "a send request with correct parameters and options is sent");
			});
		});
	});

	QUnit.module("KeyUserConnector reset", {
		beforeEach : function () {
		},
		afterEach: function() {
			WriteUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when reset is triggered", function (assert) {
			var mPropertyBag = {
				url : "/flex/keyuser",
				reference : "flexReference",
				appVersion : "1.0.0",
				generator : "someGenerator",
				selectorIds : ["selector1", "selector2"],
				changeTypes : ["changeType1", "changeType2"]
			};
			var sUrl = "/flex/keyuser/v1/changes/?reference=flexReference&appVersion=1.0.0&generator=someGenerator&selector=selector1,selector2&changeType=changeType1,changeType2";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);
			return KeyUserConnector.reset(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConenctor.xsrfToken,
					tokenUrl : "/flex/keyuser/v1/settings",
					applyConnector : ApplyConenctor
				}), "a send request with correct parameters and options is sent");
			});
		});
	});

	QUnit.module("KeyUserConnector handing xsrf token in combination of the apply connector", {
		beforeEach : function () {
		},
		afterEach: function() {
			ApplyConenctor.xsrfToken = undefined;
			ApplyUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("given a mock server, when write is triggered and the apply connectors xsrf token is outdated", function (assert) {
			var newToken = "newToken456";

			ApplyConenctor.xsrfToken = "oldToken123";

			var oStubSendRequest = sinon.stub(ApplyUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status : 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken : newToken});
			oStubSendRequest.onCall(2).resolves({response : "something"});

			var mPropertyBag = {url : "/flex/keyuser", flexObjects : []};
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 3, "three request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the first request was a POST request");
				assert.equal(oStubSendRequest.getCall(1).args[0], "/flex/keyuser/v1/settings", "the second request has the correct url");
				assert.equal(oStubSendRequest.getCall(1).args[1], "HEAD", "the second request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(2).args[1], "POST", "the third request was a POST request");
				assert.equal(ApplyConenctor.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(2).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});

		QUnit.test("given a mock server, when write is triggered and the apply connectors has no token", function (assert) {
			var newToken = "newToken456";

			ApplyConenctor.xsrfToken = undefined;

			var oStubSendRequest = sinon.stub(ApplyUtils, "sendRequest");
			oStubSendRequest.onCall(0).resolves({xsrfToken : newToken});
			oStubSendRequest.onCall(1).resolves({response : "something"});

			var mPropertyBag = {url : "/flex/keyuser", flexObjects : []};
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 2, "two request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "HEAD", "the first request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
				assert.equal(oStubSendRequest.getCall(1).args[1], "POST", "the second request was a POST request");
				assert.equal(ApplyConenctor.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
