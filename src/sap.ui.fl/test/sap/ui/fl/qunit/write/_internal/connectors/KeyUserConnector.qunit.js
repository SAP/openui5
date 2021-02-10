/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	Layer,
	KeyUserConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("KeyUserConnector", {
		beforeEach: function () {
		},
		afterEach: function() {
			WriteUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when write is triggered for single change", function (assert) {
			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/?sap-language=en";
			var oChange = {
				fileName: "change1"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oChange});
			return KeyUserConnector.write(mPropertyBag).then(function (oResponse) {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken: InitialConnector.xsrfToken,
					tokenUrl: "/flexKeyuser/flex/keyuser/v1/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: "[]"
				}), "a send request with correct parameters and options is sent");
				assert.ok(Array.isArray(oResponse.response), "response is an array");
				assert.deepEqual(oChange, oResponse.response[0]);
			});
		});
		QUnit.test("given a mock server, when write is triggered for multiple change", function (assert) {
			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/?sap-language=en";
			var oChange1 = {
				fileName: "change1"
			};
			var oChange2 = {
				fileName: "change2"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: [oChange1, oChange2]});
			return KeyUserConnector.write(mPropertyBag).then(function (oResponse) {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken: InitialConnector.xsrfToken,
					tokenUrl: "/flexKeyuser/flex/keyuser/v1/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: "[]"
				}), "a send request with correct parameters and options is sent");
				assert.ok(Array.isArray(oResponse.response), "response is an array");
				assert.deepEqual(oChange1, oResponse.response[0]);
				assert.deepEqual(oChange2, oResponse.response[1]);
			});
		});
		QUnit.test("given a mock server, when write is triggered for a draft", function (assert) {
			var mPropertyBag = {url: "/flexKeyuser", flexObjects: [], parentVersion: 1};
			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/changes/?parentVersion=1&sap-language=en";
			var oChange = {
				fileName: "change1"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oChange});
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
			var mPropertyBag = {url: "/flexKeyuser", flexObject: oFlexObject};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/myFileName?sap-language=en";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken: InitialConnector.xsrfToken,
					tokenUrl: "/flexKeyuser/flex/keyuser/v1/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
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
					xsrfToken: InitialConnector.xsrfToken,
					tokenUrl: "/flexKeyuser/flex/keyuser/v1/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
			});
		});

		QUnit.test("given a mock server, when reset is triggered", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "flexReference",
				generator: "someGenerator",
				selectorIds: ["selector1", "selector2"],
				changeTypes: ["changeType1", "changeType2"]
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v1/changes/?reference=flexReference&generator=someGenerator&selector=selector1,selector2&changeType=changeType1,changeType2";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			return KeyUserConnector.reset(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken: InitialConnector.xsrfToken,
					tokenUrl: "/flexKeyuser/flex/keyuser/v1/settings",
					initialConnector: InitialConnector
				}), "a send request with correct parameters and options is sent");
			});
		});
	});

	QUnit.module("KeyUserConnector handing xsrf token in combination of the apply connector", {
		beforeEach: function () {
		},
		afterEach: function() {
			InitialConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("given a mock server, when write is triggered and the apply connectors xsrf token is outdated", function (assert) {
			var newToken = "newToken456";

			InitialConnector.xsrfToken = "oldToken123";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status: 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken: newToken});
			oStubSendRequest.onCall(2).resolves({response: "something"});

			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 3, "three request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the first request was a POST request");
				assert.equal(oStubSendRequest.getCall(1).args[0], "/flexKeyuser/flex/keyuser/v1/settings", "the second request has the correct url");
				assert.equal(oStubSendRequest.getCall(1).args[1], "HEAD", "the second request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(2).args[1], "POST", "the third request was a POST request");
				assert.equal(InitialConnector.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(2).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});

		QUnit.test("given a mock server, when write is triggered and the apply connectors has no token", function (assert) {
			var newToken = "newToken456";

			InitialConnector.xsrfToken = undefined;

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).resolves({xsrfToken: newToken});
			oStubSendRequest.onCall(1).resolves({response: "something"});

			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			return KeyUserConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.callCount, 2, "two request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "HEAD", "the first request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
				assert.equal(oStubSendRequest.getCall(1).args[1], "POST", "the second request was a POST request");
				assert.equal(InitialConnector.xsrfToken, newToken, "a new token was stored in the apply connector");
				assert.equal(oStubSendRequest.getCall(1).args[2].xsrfToken, newToken, "and the new token was used to resend the request");
			});
		});
	});

	QUnit.module("KeyUserConnector loadFeatures", {
		afterEach: function() {
			InitialConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("get Response", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			sandbox.stub(InitialUtils, "sendRequest").resolves({response: "something"});
			return KeyUserConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, "something", "the settings object is returned correctly");
			});
		});
		QUnit.test("get Response does not send when the settings already stored in apply connector", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: "something"});
			InitialConnector.settings = {isKeyUser: true};
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
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				limit: 10
			};
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);
			var aReturnedVersions = [{
				versionNumber: sap.ui.fl.Versions.Draft
			}, {
				versionNumber: 1
			}];
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: aReturnedVersions});
			return KeyUserConnector.versions.load(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, [{
					version: sap.ui.fl.Versions.Draft
				}, {
					version: 1
				}], "the versions list is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v1/versions/com.sap.test.app?sap-language=en&limit=10", "the request has the correct url");
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
			var sActivateVersion = sap.ui.fl.Versions.Draft.toString();
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new Title",
				version: sActivateVersion
			};

			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/versions/activate/com.sap.test.app?version=" + sActivateVersion + "&sap-language=en";
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new Title\"}"
			}, mPropertyBag);
			var oActivatedVersion = {
				versionNumber: 1
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});
			return KeyUserConnector.versions.activate(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {
					version: 1
				}, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate old version", function (assert) {
			var sActivateVersion = "1";
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new reactivate Title",
				version: sActivateVersion
			};

			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/versions/activate/com.sap.test.app?version=" + sActivateVersion + "&sap-language=en";
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new reactivate Title\"}"
			}, mPropertyBag);
			var oActivatedVersion = {
				versionNumber: 1
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});
			return KeyUserConnector.versions.activate(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {
					version: 1
				}, "the reactivated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate original app", function (assert) {
			var sActivateVersion = sap.ui.fl.Versions.Original.toString();
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new Title",
				version: sActivateVersion
			};

			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/versions/activate/com.sap.test.app?version=" + sActivateVersion + "&sap-language=en";
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: "{\"title\":\"new Title\"}"
			}, mPropertyBag);
			var oActivatedVersion = {
				versionNumber: 1
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});
			return KeyUserConnector.versions.activate(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {
					version: 1
				}, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
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
				url: "/flexKeyuser",
				reference: "com.sap.test.app"
			};
			var mExpectedPropertyBag = Object.assign({
				xsrfToken: undefined,
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
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
