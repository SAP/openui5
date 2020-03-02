/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	Layer,
	KeyUserConnector,
	ApplyConnector,
	ApplyUtils,
	WriteUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("KeyUserConnector", {
		beforeEach : function () {
		},
		afterEach: function() {
			WriteUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when write is triggered", function (assert) {
			var mPropertyBag = {url : "/flexKeyuser", flexObjects : []};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/flexKeyuser/flex/keyuser/v1/settings",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : "[]"
				}), "a send request with correct parameters and options is sent");
			});
		});
		QUnit.test("given a mock server, when write is triggered for a draft", function (assert) {
			var mPropertyBag = {url : "/flexKeyuser", flexObjects : [], draft: true};
			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/changes/?draft=true";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.write(mPropertyBag).then(function () {
				var aArgs = oStubSendRequest.getCall(0).args;
				var sUrl = aArgs[0];
				assert.equal(sUrl, sExpectedUrl, "a send request with correct url is sent");
			});
		});

		QUnit.test("given a mock server, when update is triggered", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName"
			};
			var mPropertyBag = {url : "/flexKeyuser", flexObject : oFlexObject};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/myFileName";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/flexKeyuser/flex/keyuser/v1/settings",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
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
				url: "/flexKeyuser"
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/myFileName?namespace=myNamespace";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();

			return KeyUserConnector.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/flexKeyuser/flex/keyuser/v1/settings",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
			});
		});

		QUnit.test("given a mock server, when reset is triggered", function (assert) {
			var mPropertyBag = {
				url : "/flexKeyuser",
				reference : "flexReference",
				appVersion : "1.0.0",
				generator : "someGenerator",
				selectorIds : ["selector1", "selector2"],
				changeTypes : ["changeType1", "changeType2"]
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/?reference=flexReference&appVersion=1.0.0&generator=someGenerator&selector=selector1,selector2&changeType=changeType1,changeType2";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			return KeyUserConnector.reset(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/flexKeyuser/flex/keyuser/v1/settings",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
			});
		});
	});

	QUnit.module("KeyUserConnector handing xsrf token in combination of the apply connector", {
		beforeEach : function () {
		},
		afterEach: function() {
			ApplyConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("given a mock server, when write is triggered and the apply connectors xsrf token is outdated", function (assert) {
			var newToken = "newToken456";

			ApplyConnector.xsrfToken = "oldToken123";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status : 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken : newToken});
			oStubSendRequest.onCall(2).resolves({response : "something"});

			var mPropertyBag = {url : "/flexKeyuser", flexObjects : []};
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 3, "three request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the first request was a POST request");
				assert.equal(oStubSendRequest.getCall(1).args[0], "/flexKeyuser/flex/keyuser/v1/settings", "the second request has the correct url");
				assert.equal(oStubSendRequest.getCall(1).args[1], "HEAD", "the second request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(2).args[1], "POST", "the third request was a POST request");
				assert.equal(ApplyConnector.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(2).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});

		QUnit.test("given a mock server, when write is triggered and the apply connectors has no token", function (assert) {
			var newToken = "newToken456";

			ApplyConnector.xsrfToken = undefined;

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest");
			oStubSendRequest.onCall(0).resolves({xsrfToken : newToken});
			oStubSendRequest.onCall(1).resolves({response : "something"});

			var mPropertyBag = {url : "/flexKeyuser", flexObjects : []};
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 2, "two request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "HEAD", "the first request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
				assert.equal(oStubSendRequest.getCall(1).args[1], "POST", "the second request was a POST request");
				assert.equal(ApplyConnector.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});
	});

	QUnit.module("KeyUserConnector loadFeatures", {
		afterEach: function() {
			ApplyConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("get Response", function (assert) {
			var mPropertyBag = {
				url : "/flexKeyuser"
			};
			sandbox.stub(ApplyUtils, "sendRequest").resolves({response : "something"});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, "something", "the settings object is returned correctly");
			});
		});
		QUnit.test("get Response does not send when the settings already stored in apply connector", function (assert) {
			var mPropertyBag = {
				url : "/flexKeyuser"
			};
			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({response : "something"});
			ApplyConnector.settings = {isKeyUser: true};
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.ok(oStubSendRequest.notCalled, "no request is sent to back end");
				assert.deepEqual(oResponse.response, {isKeyUser: true}, "the settings object is obtain from apply connector correctly");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.load", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("get Versions", function (assert) {
			var mPropertyBag = {
				url : "/flexKeyuser",
				reference: "com.sap.test.app"
			};
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				applyConnector: ApplyConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);
			var aReturnedVersions = [];
			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({response : aReturnedVersions});
			return KeyUserConnector.versions.load(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, aReturnedVersions, "the versions list is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v1/versions/com.sap.test.app", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.activate", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("activate draft", function (assert) {
			var mPropertyBag = {
				url : "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new Title"
			};
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				applyConnector: ApplyConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new Title\"}"
			}, mPropertyBag);
			var oActivatedVersion = {};
			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({response : oActivatedVersion});
			return KeyUserConnector.versions.activate(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, oActivatedVersion, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v1/versions/activate/com.sap.test.app?version=0", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate original app", function (assert) {
			// TODO: enhance this test as soon as the reactivation is implemented; This test only ensures the passing of an empty query parameter
			var mPropertyBag = {
				url : "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new Title"
			};

			var fnGetUrl = ApplyUtils.getUrl;
			sandbox.stub(ApplyUtils, "getUrl").callsFake(function (sRoute, mPropertyBag, mParameters) {
				mParameters.version = "";
				return fnGetUrl(sRoute, mPropertyBag, mParameters);
			});

			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				applyConnector: ApplyConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new Title\"}"
			}, mPropertyBag);
			var oActivatedVersion = {};
			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({response : oActivatedVersion});
			return KeyUserConnector.versions.activate(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, oActivatedVersion, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v1/versions/activate/com.sap.test.app?version=", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.discardDraft", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("discard draft", function (assert) {
			var mPropertyBag = {
				url : "/flexKeyuser",
				reference: "com.sap.test.app"
			};
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				applyConnector: ApplyConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);
			var oActivatedVersion = [];
			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves({response : oActivatedVersion});
			return KeyUserConnector.versions.discardDraft(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v1/versions/draft/com.sap.test.app", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "DELETE", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
