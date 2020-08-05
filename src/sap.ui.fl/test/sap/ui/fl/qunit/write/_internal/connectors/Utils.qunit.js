/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	InitialUtils,
	WriteUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Send request functions", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sendRequest success at the first time", function (assert) {
			var sUrl = "anUrl";
			var sMethod = "POST";
			var mPropertyBag = {
				initialConnector: {
					xsrfToken: "123"
				}
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response : "something"});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {response : "something"}, "correct response is returned");
				assert.ok(oStubSendRequest.calledWith(sUrl, sMethod, mPropertyBag), "there is one request sent");
			});
		});

		QUnit.test("getRequestOptions", function (assert) {
			var sToken = "token";
			var sTokenUrl = "tokenUrl";
			var oInitialConnector = {
				xsrfToken : sToken
			};
			var oExpectedOptions = {
				xsrfToken : sToken,
				tokenUrl : sTokenUrl,
				initialConnector : oInitialConnector
			};
			assert.deepEqual(WriteUtils.getRequestOptions(oInitialConnector, sTokenUrl), oExpectedOptions);
			oExpectedOptions.payload = "[]";
			oExpectedOptions.contentType = "contentType";
			oExpectedOptions.dataType = "dataType";
			assert.deepEqual(WriteUtils.getRequestOptions(oInitialConnector, sTokenUrl, [], "contentType", "dataType"), oExpectedOptions);
		});

		QUnit.test("sendRequest failed with error code different from 403", function (assert) {
			var sUrl = "anUrl";
			var sMethod = "POST";
			var mPropertyBag = {
				initialConnector: {
					xsrfToken: "123"
				}
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").rejects({status : 500});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function (oError) {
				assert.equal(oError.status, 500, "correct error is returned");
				assert.ok(oStubSendRequest.calledWith(sUrl, sMethod, mPropertyBag), "there is one request sent");
			});
		});

		QUnit.test("sendRequest failed with error code 403, get new token success and new request success", function (assert) {
			var sUrl = "anUrl";
			var sMethod = "POST";
			var sTokenUrl = "tokenUrl";
			var oInitialConnector = {
				xsrfToken: "123"
			};
			var mPropertyBag = {
				tokenUrl : sTokenUrl,
				initialConnector: oInitialConnector,
				xsrfToken : "oldToken"
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status : 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken : "newToken"});
			oStubSendRequest.onCall(2).resolves({response : "something"});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {response : "something"}, "correct response is returned");
				assert.equal(oInitialConnector.xsrfToken, "newToken", "new token is stored in apply connector");
				assert.equal(oStubSendRequest.callCount, 3, "there are 3 requests sent in total");
				assert.ok(oStubSendRequest.getCall(0).calledWith(sUrl, sMethod, mPropertyBag), "first request has correct parameters");
				assert.ok(oStubSendRequest.getCall(1).calledWith(sTokenUrl, "HEAD"), "second request has correct parameters");
				assert.ok(oStubSendRequest.getCall(2).calledWith(sUrl, sMethod, mPropertyBag), "third request has correct parameters");
				assert.equal(oStubSendRequest.getCall(2).args[2].xsrfToken, "newToken", "new token is passed in the mPropertyBag of third sendRequest");
			});
		});

		QUnit.test("sendRequest failed with error code 403, get new token success and new request also failed", function (assert) {
			var sUrl = "anUrl";
			var sMethod = "POST";
			var sTokenUrl = "tokenUrl";
			var oInitialConnector = {
				xsrfToken: "123"
			};
			var mPropertyBag = {
				tokenUrl : sTokenUrl,
				initialConnector: oInitialConnector,
				xsrfToken : "oldToken"
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status : 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken : "newToken"});
			oStubSendRequest.onCall(2).rejects({status : 500});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function (oError) {
				assert.equal(oError.status, 500, "correct error is returned");
				assert.equal(oInitialConnector.xsrfToken, "newToken", "new token is stored in apply connector");
				assert.equal(oStubSendRequest.callCount, 3, "there are 3 requests sent in total");
				assert.ok(oStubSendRequest.getCall(0).calledWith(sUrl, sMethod, mPropertyBag), "first request has correct parameters");
				assert.ok(oStubSendRequest.getCall(1).calledWith(sTokenUrl, "HEAD"), "second request has correct parameters");
				assert.ok(oStubSendRequest.getCall(2).calledWith(sUrl, sMethod, mPropertyBag), "third request has correct parameters");
				assert.equal(oStubSendRequest.getCall(2).args[2].xsrfToken, "newToken", "new token is passed in the mPropertyBag of third sendRequest");
			});
		});

		QUnit.test("sendRequest failed with error code 403, get new token failed", function (assert) {
			var sUrl = "anUrl";
			var sMethod = "POST";
			var sTokenUrl = "tokenUrl";
			var oInitialConnector = {
				xsrfToken: "oldToken"
			};
			var mPropertyBag = {
				tokenUrl : sTokenUrl,
				initialConnector: oInitialConnector
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status : 403});
			oStubSendRequest.onCall(1).rejects({status : 500});
			return WriteUtils.sendRequest(sUrl, sMethod, mPropertyBag).catch(function (oError) {
				assert.equal(oError.status, 500, "correct error is returned");
				assert.equal(mPropertyBag.initialConnector.xsrfToken, "oldToken", "new token is not passed in the second sendRequest");
				assert.equal(oInitialConnector.xsrfToken, "oldToken", "new token is not stored in apply connector");
				assert.equal(oStubSendRequest.callCount, 2, "there are 2 requests sent in total");
				assert.ok(oStubSendRequest.getCall(0).calledWith(sUrl, sMethod, mPropertyBag), "first request has correct parameters");
				assert.ok(oStubSendRequest.getCall(1).calledWith(sTokenUrl, "HEAD"), "second request has correct parameters");
			});
		});
	});
	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
