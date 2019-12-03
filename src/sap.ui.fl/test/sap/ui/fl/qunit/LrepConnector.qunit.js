/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/fl/context/ContextManager",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	LrepConnector,
	Change,
	Utils,
	ContextManager,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("LrepConnector", {
		beforeEach: function () {
			this.oLrepConnector = LrepConnector.createConnector();
			sandbox.stub(ContextManager, "getActiveContexts").callsFake(function () {
				return [];
			});
		},
		afterEach: function () {
			sandbox.restore();
			if (this.server) {
				this.server.restore();
			}

			LrepConnector.prototype._aSentRequestListeners = [];
			LrepConnector.prototype._sRequestUrlPrefix = "";
		}
	}, function () {
		QUnit.test("The XSRF Token can be injected in the constructor", function (assert) {
			var oConnector;
			var mParams;
			mParams = {XsrfToken: "jingabuhr"};
			oConnector = new LrepConnector(mParams);

			assert.equal(oConnector._sXsrfToken, "jingabuhr");
		});

		QUnit.test("_resolveUrl", function (assert) {
			//Arrange
			assert.ok(this.oLrepConnector);

			//Act & Assert
			assert.equal(this.oLrepConnector._resolveUrl("/content/subfolder"), "/content/subfolder");
			assert.equal(this.oLrepConnector._resolveUrl("content/subfolder"), "/content/subfolder");
			assert.equal(this.oLrepConnector._resolveUrl("//content/subfolder"), "//content/subfolder");
			assert.equal(this.oLrepConnector._resolveUrl("/content//subfolder/"), "/content//subfolder/");
			assert.equal(this.oLrepConnector._resolveUrl(""), "/");
			assert.equal(this.oLrepConnector._resolveUrl("index.html"), "/index.html");
			assert.equal(this.oLrepConnector._resolveUrl("index.html?anyParam=value"), "/index.html?anyParam=value");
		});

		QUnit.test("_getDefaultHeader", function (assert) {
			//Arrange
			var sSampleXsrfToken = "ABCDEFGHIJKLMN123456789";
			var headerWithoutExistingXsrfToken = {
				headers: {
					"X-CSRF-Token": "fetch"
				}
			};

			var headerWithExistingXsrfToken = {
				headers: {
					"X-CSRF-Token": sSampleXsrfToken
				}
			};

			//Act & Assert
			var fetchToken = this.oLrepConnector._getDefaultHeader();
			assert.deepEqual(fetchToken, headerWithoutExistingXsrfToken);

			this.oLrepConnector._sXsrfToken = sSampleXsrfToken;

			var newToken = this.oLrepConnector._getDefaultHeader();
			assert.deepEqual(newToken, headerWithExistingXsrfToken);
		});

		QUnit.test("_getDefaultOptions", function (assert) {
			//Arrange
			sandbox.stub(this.oLrepConnector, "_getDefaultHeader").returns({
				headers: {
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				}
			});

			var firstTry = {
				async: true,
				type: "GET",
				contentType: "text/html; charset=ascii",
				headers: {
					"Content-Type": "text/html; charset=ascii",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				},
				processData: false
				//xhrFields: {
				//	withCredentials: true
				//}
			};

			var secondTry = {
				async: true,
				type: "POST",
				contentType: "text/plain; charset=utf-8",
				headers: {
					"Content-Type": "text/plain; charset=utf-8",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				},
				processData: false
				//xhrFields: {
				//	withCredentials: true
				//}
			};

			var thirdTry = {
				async: true,
				type: "PUT",
				contentType: "application/json; charset=utf-8",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				},
				processData: false
				//xhrFields: {
				//	withCredentials: true
				//}
			};

			//Act & Assert
			assert.deepEqual(this.oLrepConnector._getDefaultOptions("GET", "text/html; charset=ascii", null), firstTry);
			assert.deepEqual(this.oLrepConnector._getDefaultOptions("POST", "text/plain"), secondTry);
			assert.deepEqual(this.oLrepConnector._getDefaultOptions("PUT"), thirdTry);
		});

		QUnit.test("send - check basic calls", function (assert) {
			//Arrange
			var sSampleUri = "http://www.abc.de/index.html?request=Value";
			var mSampleOptions = {};
			var oSampleData = {};

			var sendAjaxRequestStub = sandbox.stub(this.oLrepConnector, "_sendAjaxRequest");
			var getDefaultOptionsStub = sandbox.stub(this.oLrepConnector, "_getDefaultOptions").returns({});
			var resolveUrlStub = sandbox.stub(this.oLrepConnector, "_resolveUrl").returns(sSampleUri);

			//Act
			this.oLrepConnector.send(sSampleUri, "GET", mSampleOptions, oSampleData, null);

			//Assert
			assert.ok(resolveUrlStub.calledOnce);
			assert.ok(getDefaultOptionsStub.calledOnce);
			assert.ok(sendAjaxRequestStub.calledOnce);
		});

		QUnit.test("send - check internals", function (assert) {
			//Arrange
			var sSampleUri = "http://www.abc.de/index.html?request=Value";
			var mSampleOptions = {
				cache: false,
				dataType: "text"
			};
			var mSampleDefaultHeader = {
				type: "GET",
				contentType: "application/json",
				data: {},
				headers: {
					"Content-Type": "text/html",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				}
			};

			var mSampleMergedHeader = {
				type: "GET",
				contentType: "application/json",
				data: {},
				headers: {
					"Content-Type": "text/html",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				},
				cache: false,
				dataType: "text"
			};
			var oSampleData = {};

			var sendAjaxRequestStub = sandbox.stub(this.oLrepConnector, "_sendAjaxRequest");
			var getDefaultOptionsStub = sandbox.stub(this.oLrepConnector, "_getDefaultOptions").returns(mSampleDefaultHeader);
			var resolveUrlStub = sandbox.stub(this.oLrepConnector, "_resolveUrl").returns(sSampleUri);

			//Act
			this.oLrepConnector.send(sSampleUri, "post", oSampleData, mSampleOptions);

			//Assert
			assert.ok(resolveUrlStub.calledOnce);
			assert.ok(getDefaultOptionsStub.calledOnce);
			assert.ok(sendAjaxRequestStub.calledOnce);
			assert.ok(sendAjaxRequestStub.calledWith(sSampleUri, mSampleMergedHeader));
		});

		QUnit.test("_sendAjaxRequest - resolve", function (assert) {
			//Arrange
			this.server = sinon.fakeServer.create();
			var sEtag = "abc123";
			this.server.respondWith([200, {
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321",
				etag: sEtag
			}, "{ test: 123 }"]);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/index.html?request=Value";
			var mSampleOptions = {
				type: "GET",
				contentType: "application/json",
				data: {},
				headers: {
					"Content-Type": "text/html",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				},
				cache: false,
				dataType: "text"
			};

			this.oLrepConnector._sXsrfToken = "SomeBlablub81919";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function (result) {
				//Assert
				assert.equal(result.status, "success");
				assert.equal(result.response, "{ test: 123 }");
				assert.equal(result.etag, sEtag);
				assert.equal(this.oLrepConnector._sXsrfToken, "0987654321");
			}.bind(this));
		});

		QUnit.test("_sendAjaxRequest - reject", function (assert) {
			//Arrange
			var iCode = 404;
			this.server = sinon.fakeServer.create();
			this.server.respondWith([iCode, {"X-CSRF-Token": "0987654321"}, ""]);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/index.html?request=Value";
			var mSampleOptions = {
				type: "GET",
				contentType: "application/json",
				data: {},
				headers: {
					"Content-Type": "text/html",
					"X-CSRF-Token": "ABCDEFGHIJKLMN123456789"
				},
				cache: false,
				dataType: "text"
			};

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions)
				.catch(function (oError) {
					assert.equal(oError.messages.length, 0, "then the error's messages property has no error objects");
					assert.equal(oError.code, iCode, "then the correct error code was returned");
					assert.equal(oError.status, "error", "then the correct error status was returned");
					assert.ok(oError.message && typeof oError.message === "string", "then error's message property is a non-empty string");
					assert.ok(oError.stack && typeof oError.stack === "string", "then error's stack property is a non-empty string");
				});
		});

		QUnit.test("_buildParams - empty", function (assert) {
			//Arrange
			var aParams = [];

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "");
		});

		QUnit.test("_buildParams - empty (explicit client)", function (assert) {
			//Arrange
			var aParams = [];
			this.oLrepConnector._sClient = "123";

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "?sap-client=123");
		});

		QUnit.test("_buildParams - one parameter", function (assert) {
			//Arrange
			var aParams = [
				{name: "p1", value: 512}
			];

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "?p1=512");
		});

		QUnit.test("_buildParams - one parameter (explicit client)", function (assert) {
			//Arrange
			var aParams = [
				{name: "p1", value: 512}
			];
			this.oLrepConnector._sClient = "234";

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "?p1=512&sap-client=234");
		});

		QUnit.test("_buildParams - multiple parameter", function (assert) {
			//Arrange
			var aParams = [
				{name: "p1", value: 512},
				{name: "p2", value: 1024}
			];
			var aParams2 = [
				{name: "p1", value: 512},
				{name: "p2", value: "test"},
				{name: "p3", value: "3"}
			];
			//Act
			var result = this.oLrepConnector._buildParams(aParams);
			var result2 = this.oLrepConnector._buildParams(aParams2);

			//Assert
			assert.equal(result, "?p1=512&p2=1024");
			assert.equal(result2, "?p1=512&p2=test&p3=3");
		});

		QUnit.test("_buildParams - multiple parameter (explicit client)", function (assert) {
			//Arrange
			var aParams = [
				{name: "p1", value: 512},
				{name: "p2", value: 1024}
			];
			var aParams2 = [
				{name: "p1", value: 512},
				{name: "p2", value: "test"},
				{name: "p3", value: "3"}
			];
			this.oLrepConnector._sClient = "345";

			//Act
			var result = this.oLrepConnector._buildParams(aParams);
			var result2 = this.oLrepConnector._buildParams(aParams2);

			//Assert
			assert.equal(result, "?p1=512&p2=1024&sap-client=345");
			assert.equal(result2, "?p1=512&p2=test&p3=3&sap-client=345");
		});

		QUnit.test("_sendAjaxRequest - refetch XSRF Token in case of http 403 (not authorised) and reuse of previous XSRF token", function (assert) {
			var requestCount = 0;
			var bValidRequestReceived = false;
			var bValidFetchXSRFReceived = false;
			//Arrange
			this.server = sinon.fakeServer.create();
			//Invalid token
			this.oLrepConnector._sXsrfToken = "789";

			function responder(request) {
				requestCount++;
				if (request.method === "HEAD" && request.requestHeaders["X-CSRF-Token"] === "fetch") {  //fetch XSRF Token
					if ((request.method === "HEAD") && (request.url === "/sap/bc/lrep/actions/getcsrftoken/")) {
						bValidFetchXSRFReceived = true;
					}
					request.respond(200, {"X-CSRF-Token": "123"}); // valid token
				} else if (request.requestHeaders["X-CSRF-Token"] === "123") {  //valid request
					if (request.method === "DELETE") {
						request.respond(204);
					} else {
						request.respond(200);
					}
					bValidRequestReceived = true;
				} else { //XSRF Token is invalid --> 403 (not authorised)
					request.respond(403);
				}
			}

			this.server.respondWith(responder);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/files/";
			var mSampleOptions = {
				type: "GET"
			};

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function () {
				assert.equal(requestCount, 3, "There shall be 3 roundtrips: 1) Failed due to missing XSFR token. 2) Fetch XSRF Token. 3) Repeat first roundtrip.");
				assert.ok(bValidRequestReceived, "The XSRF Token shall be fetched and the origin request shall be resent");
				assert.ok(bValidFetchXSRFReceived, "The XSRF Token shall be fetched with a dedicated GET request");
				mSampleOptions.type = "POST";
				bValidRequestReceived = false;
				return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function () {
					assert.equal(requestCount, 4, "Next POST request will re use previous valid XSRF Token");
					assert.ok(bValidRequestReceived, "and send the correct request");
					mSampleOptions.type = "PUT";
					bValidRequestReceived = false;
					return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function () {
						assert.equal(requestCount, 5, "Next PUT request will re use previous valid XSRF Token");
						assert.ok(bValidRequestReceived, "and send the correct request");
						mSampleOptions.type = "DELETE";
						bValidRequestReceived = false;
						return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function () {
							assert.equal(requestCount, 6, "Next DELETE request will re use previous valid XSRF Token");
							assert.ok(bValidRequestReceived, "and send the correct request");
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("_sendAjaxRequest - refetch XSRF Token in case of http 403 (not authorised) and reuse of previous XSRF token;" +
			"If the subsequence request fails, the promise is rejected but no error throws", function (assert) {
			var requestCount = 0;
			var bValidRequestReceived = false;
			var bValidFetchXSRFReceived = false;
			//Arrange
			this.server = sinon.fakeServer.create();
			//Invalid token
			this.oLrepConnector._sXsrfToken = "789";

			function responder(request) {
				requestCount++;
				if (request.method === "HEAD" && request.requestHeaders["X-CSRF-Token"] === "fetch") {  //fetch XSRF Token
					if ((request.method === "HEAD") && (request.url === "/sap/bc/lrep/actions/getcsrftoken/")) {
						bValidFetchXSRFReceived = true;
					}
					request.respond(200, {"X-CSRF-Token": "123"}); // valid token
				} else {
					if (request.requestHeaders["X-CSRF-Token"] === "123") {
						bValidRequestReceived = true;
					}
					request.respond(403);
				}
			}

			this.server.respondWith(responder);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/files/";
			var mSampleOptions = {
				type: "GET"
			};
			var oStubGetMessage = sandbox.stub(this.oLrepConnector, "_getMessagesFromXHR");
			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(undefined,
				//Promise is rejected
				function () {
					assert.equal(requestCount, 3, "There shall be 3 roundtrips: 1) Failed due to missing XSFR token. 2) Fetch XSRF Token. 3) Repeat first roundtrip.");
					assert.ok(oStubGetMessage.calledOnce, "the LRepConnector context is bind probably and there is no exception throw!!");
					assert.ok(bValidRequestReceived, "The XSRF Token shall be fetched and the origin request shall be resent");
					assert.ok(bValidFetchXSRFReceived, "The XSRF Token shall be fetched with a dedicated GET request");
				});
		});

		QUnit.test("_sendAjaxRequest - shall reject Promise when backend returns error", function (assert) {
			//Arrange
			var iCode = 500;
			this.server = sinon.fakeServer.create();
			this.server.respondWith([iCode, {}, ""]);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/files/";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri)
				.catch(function (oError) {
					assert.equal(oError.messages.length, 0, "then the error's messages property has no error objects");
					assert.equal(oError.code, iCode, "then the correct error code was returned");
					assert.equal(oError.status, "error", "then the correct error status was returned");
					assert.ok(oError.message && typeof oError.message === "string", "then error's message property is a non-empty string");
					assert.ok(oError.stack && typeof oError.stack === "string", "then error's stack property is a non-empty string");
				});
		});

		QUnit.test("_sendAjaxRequest - shall reject Promise when no flexibility services url prefix is returned", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([]);
			var sSampleUri = "http://www.abc.de/files/";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri).then(function () {
				assert.ok(false, "The Promise has not rejected");
			}, function (oError) {
				assert.ok(true, "The Promise has rejected");
				assert.equal("warning", oError.status);
				assert.equal(1, oError.messages.length);
				assert.equal("Flexibility Services requests were not sent. The UI5 bootstrap is configured to not send any requests.", oError.messages[0].text);
			});
		});

		QUnit.test("_sendAjaxRequest - shall reject Promise when fetching the XSRF Token has failed", function (assert) {
			var requestCount = 0;
			//Arrange
			this.server = sinon.fakeServer.create();

			function responder(request) {
				requestCount++;
				if (request.method === "HEAD" && request.requestHeaders["X-CSRF-Token"] === "fetch") {  //fetch XSRF Token
					request.respond(500);
				} else { //XSRF Token is invalid --> 403 (not authorised)
					request.respond(403);
				}
			}

			this.server.respondWith(responder);
			this.server.autoRespond = true;
			var sSampleUri = "http://www.abc.de/files/";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri)
				.catch(function () {
					assert.equal(requestCount, 1, "There shall be 2 roundtrips: 1) Failed due to missing XSFR token. 2) Failing XSRF Token Fetch");
				});
		});

		QUnit.test("_getDefaultOptions shall delete the request body for http DELETE", function (assert) {
			var mOptions;

			//Call CUT
			mOptions = this.oLrepConnector._getDefaultOptions("DELETE", null, {});

			assert.strictEqual(mOptions.data, undefined);
		});

		QUnit.test("_sendAjaxRequest - shall read error messages from backend and reject Promise", function (assert) {
			//Arrange
			var iCode = 500;
			this.server = sinon.fakeServer.create();
			this.server.respondWith([
				iCode, {}, JSON.stringify({
					messages: [
						{
							severity: "Error",
							text: "content id must be non-initial"
						}
					]
				})
			]);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/files/";
			this.oLrepConnector._sXsrfToken = "abc";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri)
				.catch(function (oError) {
					assert.ok(oError, "The promise shall reject");
					assert.ok(oError.messages);
					assert.equal(oError.messages.length, 1);
					assert.equal(oError.messages[0].text, "content id must be non-initial");
					assert.equal(oError.messages[0].severity, "Error");
					assert.equal(oError.code, iCode, "then the correct error code was returned");
					assert.equal(oError.status, "error", "then the correct error status was returned");
					assert.ok(oError.message && typeof oError.message === "string", "then error's message property is a non-empty string");
					assert.ok(oError.stack && typeof oError.stack === "string", "then error's stack property is a non-empty string");
				});
		});
	});

	QUnit.module("loadChanges", {
		beforeEach: function () {
			this.oLrepConnector = LrepConnector.createConnector();
			sandbox.stub(ContextManager, "getActiveContexts").returns([]);
		},
		afterEach: function () {
			sandbox.restore();
			if (this.server) {
				this.server.restore();
			}

			LrepConnector.prototype._aSentRequestListeners = [];
			LrepConnector.prototype._sRequestUrlPrefix = "";
		}
	}, function () {
		QUnit.test("loadChanges failed with 404 error code", function (assert) {
			var oError = {
				code: 404
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").rejects(oError);

			return this.oLrepConnector.loadChanges({name: 'something'}, {})
				.catch(function () {
					assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				});
		});

		QUnit.test("loadChanges failed with 404 error code", function (assert) {
			var oError = {
				code: 404
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").rejects(oError);

			return this.oLrepConnector.loadChanges({name: 'something'}, {})
				.catch(function () {
					assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				});
		});

		QUnit.test("loadChanges failed with error code differs from 404", function (assert) {
			var oError = {
				code: 403
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").rejects(oError);

			return this.oLrepConnector.loadChanges({name: 'something'}, {})
				.catch(function () {
					assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				});
		});

		QUnit.test("loadChanges", function (assert) {
			var sComponentClassName;
			this.server = sinon.fakeServer.create();
			var sEtag = "abc123";
			this.server.respondWith([200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321",
					etag: sEtag
				},
				'{ "changes": [ ], "settings": { "isKeyUser": true, "isAtoAvailable": false, "isAtoEnabled": false, "isProductiveSystem": false }, "messagebundle": {"i_123": "translatedKey"} }'
			]);
			this.server.autoRespond = true;

			sComponentClassName = "smartFilterBar.Component";
			return this.oLrepConnector.loadChanges({name: sComponentClassName}, {})
				.then(function (oResult) {
					assert.equal(oResult.changes.changes.length, 0);
					assert.equal(oResult.changes.settings.isKeyUser, true);
					assert.equal(oResult.changes.componentClassName, this.sComponentClassName);
					assert.equal(oResult.etag, sEtag);
					assert.deepEqual(oResult.changes.messagebundle, {i_123: "translatedKey"}, "returns the responded messagebundle within the result");
				}.bind(this));
		});

		QUnit.test("loadChanges can handle a undefined mPropertyBag", function (assert) {
			this.server = sinon.fakeServer.create();
			this.server.respondWith([200,
				{"Content-Type": "application/json", "Content-Length": 13, "X-CSRF-Token": "0987654321"},
				'{ "changes": [ ], "settings": {}, "messagebundle": {} }'
			]);
			this.server.autoRespond = true;

			var sComponentClassName = "smartFilterBar.Component";

			return this.oLrepConnector.loadChanges({name: sComponentClassName}).then(function () {
				assert.equal(this.server.requests.length, 1, "Only one HTTP request shall be send for fetching changes via getChanges request)");
				assert.ok(this.server.requests[0].requestHeaders, "Request for getChanges shall contain a request header");
			}.bind(this));
		});

		QUnit.test("loadChanges shall enrich ajax call (header properties) with X-LRep-AppDescriptor-Id", function (assert) {
			var sComponentClassName;
			this.server = sinon.fakeServer.create();
			this.server.respondWith([200,
				{"Content-Type": "application/json", "Content-Length": 13, "X-CSRF-Token": "0987654321"},
				'{ "changes": [ ], "settings": {}, "messagebundle": {} }'
			]);
			this.server.autoRespond = true;

			sComponentClassName = "smartFilterBar.Component";
			var oAppDescriptor = {
				"sap.app": {
					id: "sap.ui.smartFormOData"
				}
			};

			var mPropertyBag = {
				appDescriptor: oAppDescriptor
			};
			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function () {
				assert.equal(this.server.requests.length, 1, "Only one HTTP request shall be send for fetching changes via getChanges request)");
				assert.ok(this.server.requests[0].requestHeaders, "Request for getChanges shall contain a request header");
				assert.equal(this.server.requests[0].requestHeaders["X-LRep-AppDescriptor-Id"], "sap.ui.smartFormOData", "Request header shall contain appDescriptorId");
			}.bind(this));
		});

		QUnit.test("loadChanges shall enrich ajax call (header properties) with X-LRep-Site-Id", function (assert) {
			this.server = sinon.fakeServer.create();
			this.server.respondWith([200,
				{"Content-Type": "application/json", "Content-Length": 13, "X-CSRF-Token": "0987654321"},
				'{ "changes": [ ], "settings": {}, "messagebundle": {} }'
			]);
			this.server.autoRespond = true;

			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {
				siteId: "dummyId4711"
			};

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function () {
				assert.equal(this.server.requests.length, 1, "Only one HTTP request shall be send for fetching changes via getChanges request)");
				assert.ok(this.server.requests[0].requestHeaders, "Request for getChanges shall contain a request header");
				assert.equal(this.server.requests[0].requestHeaders["X-LRep-Site-Id"], mPropertyBag.siteId, "Request header shall contain siteId");
			}.bind(this));
		});

		QUnit.test("loadChanges adds upToLayerType parameter to request when requested", function (assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {
				layer: "CUSTOMER"
			};

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName + "?upToLayerType=CUSTOMER";

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").resolves(oFakeResponse);

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function () {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly build with the upToLayerType parameter");
			});
		});

		QUnit.test("loadChanges adds a cache key to the request if present and allows caching within the request", function (assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {
				cacheKey: "ABC123thisISaHASH"
			};

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/~" + mPropertyBag.cacheKey + "~/" + sComponentClassName;

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").resolves(oFakeResponse);

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function () {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly build with the cache key");
				assert.ok(aCallArguments[3].cache, "caching is enabled for the call");
			});
		});

		QUnit.test("loadChanges adds a cache key to the request if present and allows caching within the request", function (assert) {
			var sComponentName = "sap.ui.demoapps.rta.fiorielements.Component";
			var sFlexModulesUri = "/sap/bc/lrep/flex/modules/~BQjKGDJlASfuh7tvYU5BclaHKD4=~/sap.ui.demoapps.rta.fiorielements.Component?sap-client=120&appVersion=1.0";
			var sCacheKey = "BQjKGDJlASfuh7tvYU5BclaHKD4";
			var oResponse = {
				etag: null,
				response: {
					loadModules: false,
					changes: Array(20),
					contexts: Array(0),
					variantSection: {},
					ui2personalization: {}
				},
				status: "success"
			};
			var mFlexData = this.oLrepConnector._onChangeResponseReceived(sComponentName, sFlexModulesUri, sCacheKey, oResponse);

			assert.equal(mFlexData.etag, sCacheKey);
		});

		QUnit.test("loadChanges adds a cache key to the request if present and allows caching within the request", function (assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {};

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName;

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").resolves(oFakeResponse);

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function () {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly build without any cache key");
				assert.equal(aCallArguments[3].cache, undefined, "caching is disabled for the call");
			});
		});

		QUnit.test("when requested, loadChanges adds appVersion parameter to the request URL", function (assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var sAppVersion = "1.2.3";

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName + "?appVersion=1.2.3";

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").resolves(oFakeResponse);

			return this.oLrepConnector.loadChanges({
				name: sComponentClassName,
				appVersion: sAppVersion
			}, {}).then(function () {
				assert.equal(oSendStub.callCount, 1, "the back-end request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the request URL was correctly built and the appVersion parameter was included");
			});
		});

		QUnit.test("loadChanges ignores appVersion parameter to the request URL in case of default app version", function (assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var sAppVersion = Utils.DEFAULT_APP_VERSION;

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName;

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").resolves(oFakeResponse);

			return this.oLrepConnector.loadChanges({
				name: sComponentClassName,
				appVersion: sAppVersion
			}, {}).then(function () {
				assert.equal(oSendStub.callCount, 1, "the back-end request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the request URL was correctly built and the appVersion parameter was not included");
			});
		});
	});

	QUnit.module("loadChanges", {
		beforeEach: function () {
			this.oLrepConnector = LrepConnector.createConnector();
			sandbox.stub(ContextManager, "getActiveContexts").returns([]);
		},
		afterEach: function () {
			sandbox.restore();
			if (this.server) {
				this.server.restore();
			}

			LrepConnector.prototype._aSentRequestListeners = [];
			LrepConnector.prototype._sRequestUrlPrefix = "";
		}
	}, function () {
		QUnit.test("loadSettings succeed", function (assert) {
			this.oLrepConnector._sClient = "123";
			var sExpectedCallUrl = "/sap/bc/lrep/flex/settings" + "?sap-client=" + this.oLrepConnector._sClient;

			var oFakeResponse = {
				response: {}
			};
			LrepConnector._oLoadSettingsPromise = undefined;
			var oSendStub = sandbox.stub(this.oLrepConnector, "send").resolves(oFakeResponse);

			return this.oLrepConnector.loadSettings().then(function () {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly built");
				assert.equal(LrepConnector._bServiceAvailability, true, "service availability flag is set to true");
			});
		});

		QUnit.test("loadSettings failed with 404 error code", function (assert) {
			var oError = {
				code: 404
			};
			LrepConnector._oLoadSettingsPromise = undefined;
			var oSendStub = sandbox.stub(this.oLrepConnector, "send").rejects(oError);

			return this.oLrepConnector.loadSettings().then(function () {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				assert.equal(LrepConnector._bServiceAvailability, false, "service availability flag is set to false");
			});
		});
	});

	QUnit.module("getStaticResource", {
		beforeEach: function () {
			this.oLrepConnector = new LrepConnector();
		}
	}, function () {
		QUnit.test("all params", function (assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType";
			var sendStub = sinon.stub(this.oLrepConnector, "send").resolves({abc: 123});

			//Act
			return this.oLrepConnector.getStaticResource("myNamespace/mySubNamespace", "myName", "myType", true).then(function (result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("required only", function (assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?dt=true";
			var sendStub = sinon.stub(this.oLrepConnector, "send").resolves({abc: 123});

			//Act
			return this.oLrepConnector.getStaticResource("myNamespace/mySubNamespace", "myName", "myType").then(function (result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("optional set to false", function (assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?dt=true";
			var sendStub = sinon.stub(this.oLrepConnector, "send").resolves({abc: 123});

			//Act
			return this.oLrepConnector.getStaticResource("myNamespace/mySubNamespace", "myName", "myType", false).then(function (result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("getFileAttributes - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?metadata=true&layer=myLayer";
			var sendStub = sinon.stub(this.oLrepConnector, "send").resolves({abc: 123});

			//Act
			return this.oLrepConnector.getFileAttributes("myNamespace/mySubNamespace", "myName", "myType", "myLayer").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("getFileAttributes - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?metadata=true";
			var sendStub = sinon.stub(this.oLrepConnector, "send").resolves({abc: 123});

			//Act
			return this.oLrepConnector.getFileAttributes("myNamespace/mySubNamespace", "myName", "myType").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});
	});


	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
