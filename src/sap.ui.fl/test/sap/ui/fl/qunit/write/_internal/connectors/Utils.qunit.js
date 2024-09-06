/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	InitialUtils,
	WriteUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Send request functions", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sendRequest success at the first time", function(assert) {
			const sUrl = "anUrl";
			const sMethod = "POST";
			const mPropertyBag = {
				initialConnector: {
					xsrfToken: "123"
				}
			};

			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: "something"});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, {response: "something"}, "correct response is returned");
				assert.ok(oStubSendRequest.calledWith(sUrl, sMethod, mPropertyBag), "there is one request sent");
			});
		});

		QUnit.test("getRequestOptions", function(assert) {
			const sTokenUrl = "tokenUrl";
			const oInitialConnector = {
			};
			const oExpectedOptions = {
				tokenUrl: sTokenUrl,
				initialConnector: oInitialConnector
			};
			assert.deepEqual(WriteUtils.getRequestOptions(oInitialConnector, sTokenUrl), oExpectedOptions);
			oExpectedOptions.payload = "[]";
			oExpectedOptions.contentType = "contentType";
			oExpectedOptions.dataType = "dataType";
			assert.deepEqual(WriteUtils.getRequestOptions(oInitialConnector, sTokenUrl, [], "contentType", "dataType"), oExpectedOptions);
		});

		QUnit.test("sendRequest failed with error code different from 403", function(assert) {
			const sUrl = "anUrl";
			const sMethod = "POST";
			const mPropertyBag = {
				initialConnector: {
					xsrfToken: "123"
				}
			};

			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").rejects({status: 500});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function(oError) {
				assert.equal(oError.status, 500, "correct error is returned");
				assert.ok(oStubSendRequest.calledWith(sUrl, sMethod, mPropertyBag), "there is one request sent");
			});
		});

		QUnit.test("sendRequest failed with error code 403, get new token success and new request success", function(assert) {
			const sUrl = "anUrl";
			const sMethod = "POST";
			const sTokenUrl = "tokenUrl";
			const oInitialConnector = {
				xsrfToken: "123"
			};
			const mPropertyBag = {
				tokenUrl: sTokenUrl,
				initialConnector: oInitialConnector,
				xsrfToken: "oldToken"
			};

			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status: 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken: "newToken"});
			oStubSendRequest.onCall(2).resolves({response: "something"});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, {response: "something"}, "correct response is returned");
				assert.equal(oStubSendRequest.callCount, 3, "there are 3 requests sent in total");
				assert.ok(oStubSendRequest.getCall(0).calledWith(sUrl, sMethod, mPropertyBag),
					"first request has correct parameters");
				assert.ok(oStubSendRequest.getCall(1).calledWith(sTokenUrl, "HEAD", {initialConnector: {}}),
					"second request has correct parameters, existing token removed from initial connector");
				assert.ok(oStubSendRequest.getCall(2).calledWith(sUrl, sMethod, mPropertyBag),
					"third request has correct parameters");
			});
		});

		QUnit.test("sendRequest failed with error code 403, get new token success and new request also failed", function(assert) {
			const sUrl = "anUrl";
			const sMethod = "POST";
			const sTokenUrl = "tokenUrl";
			const oInitialConnector = {
				xsrfToken: "123"
			};
			const mPropertyBag = {
				tokenUrl: sTokenUrl,
				initialConnector: oInitialConnector,
				xsrfToken: "oldToken"
			};

			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status: 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken: "newToken"});
			oStubSendRequest.onCall(2).rejects({status: 500});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function(oError) {
				assert.equal(oError.status, 500, "correct error is returned");
				assert.equal(oStubSendRequest.callCount, 3, "there are 3 requests sent in total");
				assert.ok(oStubSendRequest.getCall(0).calledWith(sUrl, sMethod, mPropertyBag),
					"first request has correct parameters");
				assert.ok(oStubSendRequest.getCall(1).calledWith(sTokenUrl, "HEAD", {initialConnector: {}}),
					"second request has correct parameters");
				assert.ok(oStubSendRequest.getCall(2).calledWith(sUrl, sMethod, mPropertyBag),
					"third request has correct parameters");
			});
		});

		QUnit.test("sendRequest failed with error code 403, get new token failed", function(assert) {
			const sUrl = "anUrl";
			const sMethod = "POST";
			const sTokenUrl = "tokenUrl";
			const oInitialConnector = {
				xsrfToken: "oldToken"
			};
			const mPropertyBag = {
				tokenUrl: sTokenUrl,
				initialConnector: oInitialConnector
			};

			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status: 403});
			oStubSendRequest.onCall(1).rejects({status: 500});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function(oError) {
				assert.equal(oError.status, 500, "correct error is returned");
				assert.equal(mPropertyBag.initialConnector.xsrfToken, undefined, "new token is not passed in the second sendRequest");
				assert.equal(oInitialConnector.xsrfToken, undefined, "token is removed from apply connector");
				assert.equal(oStubSendRequest.callCount, 2, "there are 2 requests sent in total");
				assert.ok(oStubSendRequest.getCall(0).calledWith(sUrl, sMethod, mPropertyBag), "first request has correct parameters");
				assert.ok(oStubSendRequest.getCall(1).calledWith(sTokenUrl, "HEAD", {initialConnector: {}}),
					"second request has correct parameters");
			});
		});

		QUnit.test("sendRequest without initial connector information", function(assert) {
			const sUrl = "anUrl";
			const sMethod = "POST";
			const sTokenUrl = "tokenUrl";
			const mPropertyBag = {
				tokenUrl: sTokenUrl,
				initialConnector: {}
			};
			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: "{xsrfToken: 'newToken'}"});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag)
			.then(() => {
				assert.equal(oStubSendRequest.callCount, 2, "there are 2 requests sent in total");
				assert.ok(
					oStubSendRequest.getCall(0).calledWith(
						sTokenUrl,
						"HEAD",
						{initialConnector: {}}
					),
					"first request tries to get a new token"
				);
				assert.ok(
					oStubSendRequest.getCall(1).calledWith(
						sUrl,
						sMethod,
						mPropertyBag
					),
					"second request calls the original request"
				);
			});
		});
	});

	QUnit.module("merge results (responses) function", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("no response available", function(assert) {
			const oResults = WriteUtils.mergeResults([]);
			assert.deepEqual(oResults, {}, "an empty object is returned");
		});

		QUnit.test("just one response available", function(assert) {
			const oResponse = {a: 1};
			const oResults = WriteUtils.mergeResults([oResponse]);
			assert.deepEqual(oResults, oResponse, "the result is returned as is");
		});

		QUnit.test("multiple responses available", function(assert) {
			const oResponses = [
				{a: 1, b: 2, c: ["foo"], e: 3, d: {e: 4}},
				{a: 5, c: ["bar"], d: {e: 6}, f: 7}
			];
			const oExpectedResult = {a: 5, b: 2, c: ["foo", "bar"], d: {e: 6}, e: 3, f: 7};

			const oResults = WriteUtils.mergeResults(oResponses);
			assert.deepEqual(oResults, oExpectedResult, "the responses are merged into the result");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
