/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Utils",
	"sap/ui/fl/context/ContextManager",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
], function(
	LrepConnector,
	Utils,
	ContextManager,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("LrepConnector", {
		beforeEach: function() {
			LrepConnector._bServiceAvailability = undefined;
			this.oLrepConnector = LrepConnector.createConnector();
			sandbox.stub(ContextManager, "getActiveContexts").callsFake(function () {
				return [];
			});
		},
		afterEach: function() {
			sandbox.restore();
			if (this.server) {
				this.server.restore();
			}

			LrepConnector.prototype._aSentRequestListeners = [];
			LrepConnector.prototype._sRequestUrlPrefix = "";
		}
	}, function() {
		QUnit.test("isFlexServiceAvailable returns the value of availability flag if it was defined", function (assert) {
			LrepConnector._bServiceAvailability = true;
			return LrepConnector.isFlexServiceAvailable().then(function (bStatus) {
				assert.equal(bStatus, true);
			});
		});

		QUnit.test("isFlexServiceAvailable send flex settings request if availability flag is undefined", function (assert) {
			var oLoadSettingsStub = sandbox.stub(LrepConnector.prototype, "loadSettings").returns(Promise.resolve().then(function () {
				LrepConnector._bServiceAvailability = true;
			}));
			return LrepConnector.isFlexServiceAvailable().then(function (bStatus) {
				assert.ok(oLoadSettingsStub.calledOnce);
				assert.equal(bStatus, true);
			});
		});

		QUnit.test("The XSRF Token can be injected in the constructor", function(assert) {
			var oConnector, mParams;
			mParams = {XsrfToken: "jingabuhr"};
			oConnector = new LrepConnector(mParams);

			assert.equal(oConnector._sXsrfToken, "jingabuhr");
		});

		QUnit.test("_resolveUrl", function(assert) {
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

		QUnit.test("_resolveUrl with request url prefix", function(assert) {
			LrepConnector.prototype.setRequestUrlPrefix("/newprefix");

			//Arrange
			assert.ok(this.oLrepConnector);

			//Act & Assert
			assert.equal(this.oLrepConnector._resolveUrl("/content/subfolder"), "/newprefix/content/subfolder");
			assert.equal(this.oLrepConnector._resolveUrl("content/subfolder"), "/newprefix/content/subfolder");
			assert.equal(this.oLrepConnector._resolveUrl("//content/subfolder"), "/newprefix//content/subfolder");
			assert.equal(this.oLrepConnector._resolveUrl("/content//subfolder/"), "/newprefix/content//subfolder/");
			assert.equal(this.oLrepConnector._resolveUrl(""), "/newprefix/");
			assert.equal(this.oLrepConnector._resolveUrl("index.html"), "/newprefix/index.html");
			assert.equal(this.oLrepConnector._resolveUrl("index.html?anyParam=value"), "/newprefix/index.html?anyParam=value");
		});

		QUnit.test("_getDefaultHeader", function(assert) {
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

		QUnit.test("_getDefaultOptions", function(assert) {
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

		QUnit.test("send - check basic calls", function(assert) {
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

		QUnit.test("send - check internals", function(assert) {
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

		QUnit.test("_sendAjaxRequest - resolve", function(assert) {
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
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function(result) {
				//Assert
				assert.equal(result.status, "success");
				assert.equal(result.response, "{ test: 123 }");
				assert.equal(result.etag, sEtag);
				assert.equal(this.oLrepConnector._sXsrfToken, "0987654321");
			}.bind(this));
		});

		QUnit.test("_sendAjaxRequest - reject", function(assert) {
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
				});
		});

		QUnit.test("attachSentRequest adds a function listening to all connectors", function (assert) {
			var fFunction = function () {};

			LrepConnector.attachSentRequest(fFunction);

			assert.equal(this.oLrepConnector._aSentRequestListeners.length, 1, "one listener should be attached");
			assert.equal(this.oLrepConnector._aSentRequestListeners[0], fFunction, "the function passed to attachSentRequest shoud be the attached one");
		});

		QUnit.test("attachSentRequest adds nothing if a non-function was passed", function (assert) {
			var iNoFunction = 123;

			LrepConnector.attachSentRequest(iNoFunction);

			assert.equal(this.oLrepConnector._aSentRequestListeners.length, 0, "nothing should be attached");
		});

		QUnit.test("detachSentRequest removes a function listening to all connectors", function (assert) {
			var fFunction = function () {};

			//simulates an registered call
			LrepConnector.prototype._aSentRequestListeners = [fFunction];

			LrepConnector.detachSentRequest(fFunction);

			assert.equal(this.oLrepConnector._aSentRequestListeners.length, 0, "the listener should be detached");
		});

		QUnit.test("detachSentRequest removes nothing if a function is passed not in the list of listeners", function (assert) {
			var fAnotherFunction = function () {};

			//simulates an registered call
			LrepConnector.prototype._aSentRequestListeners = [fAnotherFunction];

			var fFunction = function () {};

			LrepConnector.detachSentRequest(fFunction);

			assert.equal(this.oLrepConnector._aSentRequestListeners.length, 1, "the listener should not be detached");
			assert.equal(this.oLrepConnector._aSentRequestListeners[0], fAnotherFunction, "the inital attached function should still be attached");
		});

		QUnit.test("detachSentRequest removes only the function passed", function (assert) {
			var fFunction1 = function () {};
			var fFunction2 = function () {};
			var fFunction3 = function () {};

			//simulates an registered call
			LrepConnector.prototype._aSentRequestListeners = [fFunction1, fFunction2, fFunction3];

			LrepConnector.detachSentRequest(fFunction2);

			assert.equal(this.oLrepConnector._aSentRequestListeners.length, 2, "two functions should remain");
			assert.equal(this.oLrepConnector._aSentRequestListeners[0], fFunction1, "the first function should be still in the list of attached functions");
			assert.equal(this.oLrepConnector._aSentRequestListeners[1], fFunction3, "the third function should be still in the list of attached functions");
		});

		QUnit.test("loadSettings succeed", function(assert) {
			this.oLrepConnector._sClient = "123";
			var sExpectedCallUrl = "/sap/bc/lrep/flex/settings" + "?sap-client=" + this.oLrepConnector._sClient;

			var oFakeResponse = {
				response: {}
			};
			LrepConnector._oLoadSettingsPromise = undefined;
			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oFakeResponse));

			return this.oLrepConnector.loadSettings().then(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly built");
				assert.equal(LrepConnector._bServiceAvailability, true, "service availability flag is set to true");
			});
		});

		QUnit.test("loadSettings failed with 404 error code", function(assert) {
			var oError = {
				code: 404
			};
			LrepConnector._oLoadSettingsPromise = undefined;
			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.reject(oError));

			return this.oLrepConnector.loadSettings().then(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				assert.equal(LrepConnector._bServiceAvailability, false, "service availability flag is set to false");
			});
		});

		QUnit.test("loadSettings failed with error code differs from 404", function(assert) {
			var oError = {
				code: 403
			};
			LrepConnector._oLoadSettingsPromise = undefined;
			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.reject(oError));

			return this.oLrepConnector.loadSettings().then(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				assert.equal(LrepConnector._bServiceAvailability, undefined, "service availability flag is undefined");
			});
		});

		QUnit.test("loadChanges failed with 404 error code", function(assert) {
			var oError = {
				code : 404
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.reject(oError));

			return this.oLrepConnector.loadChanges({name: 'something'}, {}).catch(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				assert.equal(LrepConnector._bServiceAvailability, false, "service availability flag is set to false");
			});
		});

		QUnit.test("loadSettings request is cached", function(assert) {
			var oSetting = {
				isKeyUser : "true"
			};
			var oResponse = {
				response : oSetting
			};
			LrepConnector._oLoadSettingsPromise = undefined;
			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oResponse));

			return Promise.all([this.oLrepConnector.loadSettings(), this.oLrepConnector.loadSettings(), this.oLrepConnector.loadSettings()]).then(function(oSettings) {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered only one");
				assert.notEqual(LrepConnector._oLoadSettingsPromise, undefined, "loadSettings promise was saved");
				assert.deepEqual(oSettings[0], oSetting, "settings content is correct in the first request");
				assert.deepEqual(oSettings[1], oSetting, "settings content is correct in the second request");
				assert.deepEqual(oSettings[2], oSetting, "settings content is correct in the third request");
			});
		});

		QUnit.test("loadChanges failed with 404 error code", function(assert) {
			var oError = {
				code: 404
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.reject(oError));

			return this.oLrepConnector.loadChanges({name: 'something'}, {}).catch(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				assert.equal(LrepConnector._bServiceAvailability, false, "service availability flag is set to false");
			});
		});

		QUnit.test("loadChanges failed with error code differs from 404", function(assert) {
			var oError = {
				code: 403
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.reject(oError));

			return this.oLrepConnector.loadChanges({name: 'something'}, {}).catch(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");
				assert.equal(LrepConnector._bServiceAvailability, undefined, "service availability flag is undefined");
			});
		});

		QUnit.test("loadChanges", function(assert) {
			var sComponentClassName;
			this.server = sinon.fakeServer.create();
			var sEtag = "abc123";
			this.server.respondWith([200,
				{"Content-Type": "application/json", "Content-Length": 13, "X-CSRF-Token": "0987654321", etag: sEtag},
				'{ "changes": [ ], "settings": { "isKeyUser": true, "isAtoAvailable": false, "isAtoEnabled": false, "isProductiveSystem": false }, "messagebundle": {"i_123": "translatedKey"} }'
			]);
			this.server.autoRespond = true;
			var oEnableTrialStub = sandbox.stub(this.oLrepConnector, "enableFakeConnectorForTrial");

			sComponentClassName = "smartFilterBar.Component";
			return this.oLrepConnector.loadChanges({name: sComponentClassName}, {}).then(function(oResult) {
				assert.equal(oResult.changes.changes.length, 0);
				assert.equal(oResult.changes.settings.isKeyUser, true);
				assert.equal(oResult.changes.componentClassName, this.sComponentClassName);
				assert.equal(oResult.etag, sEtag);
				assert.deepEqual(oResult.changes.messagebundle, {i_123: "translatedKey"}, "returns the responded messagebundle within the result");
				assert.equal(oEnableTrialStub.callCount, 0, "the fakeLrep was not enabled because isTrial was not set");
			}.bind(this));
		});

		QUnit.test("loadChanges with 'isTrial' set to true", function(assert) {
			var sComponentClassName;
			var oReturn = {
				changes: [{fileType: "change"}, {fileType: "change"}],
				messagebundle: {
					i_123: "translatedKey"
				}
			};

			var oEnableTrialStub = sandbox.stub(this.oLrepConnector, "enableFakeConnectorForTrial");

			this.server = sinon.fakeServer.create();
			var sEtag = "abc123";
			this.server.respondWith([200,
				{"Content-Type": "application/json", "Content-Length": 13, "X-CSRF-Token": "0987654321", etag: sEtag},
				JSON.stringify(oReturn)
			]);
			this.server.autoRespond = true;

			sComponentClassName = "smartFilterBar.Component";
			return this.oLrepConnector.loadChanges({name: sComponentClassName}, {isTrial: true})
			.then(function() {
				assert.equal(oEnableTrialStub.callCount, 1, "the enableFakeLrep function was called");
			});
		});

		QUnit.test("loadChanges can handle a undefined mPropertyBag", function(assert) {
			this.server = sinon.fakeServer.create();
			this.server.respondWith([200,
				{"Content-Type": "application/json", "Content-Length": 13, "X-CSRF-Token": "0987654321"},
				'{ "changes": [ ], "settings": {}, "messagebundle": {} }'
			]);
			this.server.autoRespond = true;

			var sComponentClassName = "smartFilterBar.Component";

			return this.oLrepConnector.loadChanges({name: sComponentClassName}).then(function() {
				assert.equal(this.server.requests.length, 1, "Only one HTTP request shall be send for fetching changes via getChanges request)");
				assert.ok(this.server.requests[0].requestHeaders, "Request for getChanges shall contain a request header");
			}.bind(this));
		});

		QUnit.test("loadChanges shall enrich ajax call (header properties) with X-LRep-AppDescriptor-Id", function(assert) {
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
			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function() {
				assert.equal(this.server.requests.length, 1, "Only one HTTP request shall be send for fetching changes via getChanges request)");
				assert.ok(this.server.requests[0].requestHeaders, "Request for getChanges shall contain a request header");
				assert.equal(this.server.requests[0].requestHeaders["X-LRep-AppDescriptor-Id"], "sap.ui.smartFormOData", "Request header shall contain appDescriptorId");
			}.bind(this));
		});

		QUnit.test("loadChanges shall enrich ajax call (header properties) with X-LRep-Site-Id", function(assert) {
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

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function() {
				assert.equal(this.server.requests.length, 1, "Only one HTTP request shall be send for fetching changes via getChanges request)");
				assert.ok(this.server.requests[0].requestHeaders, "Request for getChanges shall contain a request header");
				assert.equal(this.server.requests[0].requestHeaders["X-LRep-Site-Id"], mPropertyBag.siteId, "Request header shall contain siteId");
			}.bind(this));
		});

		QUnit.test("loadChanges adds upToLayerType parameter to request when requested", function(assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {
				layer: "CUSTOMER"
			};

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName + "?upToLayerType=CUSTOMER";

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oFakeResponse));

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly build with the upToLayerType parameter");
			});
		});

		QUnit.test("loadChanges adds a cache key to the request if present and allows caching within the request", function(assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {
				cacheKey: "ABC123thisISaHASH"
			};

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/~" + mPropertyBag.cacheKey + "~/" + sComponentClassName;

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oFakeResponse));

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly build with the cache key");
				assert.ok(aCallArguments[3].cache, "caching is enabled for the call");
			});
		});

		QUnit.test("loadChanges adds a cache key to the request if present and allows caching within the request", function(assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var mPropertyBag = {};

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName;

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oFakeResponse));

			return this.oLrepConnector.loadChanges({name: sComponentClassName}, mPropertyBag).then(function() {
				assert.equal(oSendStub.callCount, 1, "the backend request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the call url was correctly build without any cache key");
				assert.equal(aCallArguments[3].cache, undefined, "caching is disabled for the call");
			});
		});

		QUnit.test("when requested, loadChanges adds appVersion parameter to the request URL", function(assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var sAppVersion = "1.2.3";

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName + "?appVersion=1.2.3";

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oFakeResponse));

			return this.oLrepConnector.loadChanges({name: sComponentClassName, appVersion : sAppVersion}, {}).then(function() {
				assert.equal(oSendStub.callCount, 1, "the back-end request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the request URL was correctly built and the appVersion parameter was included");
			});
		});

		QUnit.test("loadChanges ignores appVersion parameter to the request URL in case of default app version", function(assert) {
			var sComponentClassName = "smartFilterBar.Component";
			var sAppVersion = Utils.DEFAULT_APP_VERSION;

			var sExpectedCallUrl = "/sap/bc/lrep/flex/data/" + sComponentClassName;

			var oFakeResponse = {
				response: {}
			};

			var oSendStub = sandbox.stub(this.oLrepConnector, "send").returns(Promise.resolve(oFakeResponse));

			return this.oLrepConnector.loadChanges({name: sComponentClassName, appVersion : sAppVersion}, {}).then(function() {
				assert.equal(oSendStub.callCount, 1, "the back-end request was triggered");

				var oCall = oSendStub.getCall(0);
				var aCallArguments = oCall.args;
				assert.equal(aCallArguments[0], sExpectedCallUrl, "the request URL was correctly built and the appVersion parameter was not included");
			});
		});

		QUnit.test("enableFakeConnectorForTrial", function(assert) {
			assert.expect(8);
			var oSettingsInstance = {
				_oSettings: {
					fakeSettings: "true"
				}
			};
			var oFakeLrepConnectorLocalStorageStub = {
				enableFakeConnector: function(oSettings, sName, oAppVersion, bSuppressCacheInvalidation) {
					assert.equal(oSettings, oSettingsInstance._oSettings);
					assert.equal(sName, "name");
					assert.equal(oAppVersion, "appVersion");
					assert.equal(bSuppressCacheInvalidation, true);
				}
			};
			var oSettingsStub = {
				getInstanceOrUndef: function() {
					return oSettingsInstance;
				}
			};
			sandbox.stub(LrepConnector, "createConnector").returns({
				loadChanges: function(sName, mPropertyBag, oChanges) {
					assert.ok(true, "loadChanges in FakeConnector was called");
					assert.equal(sName, "name");
					assert.equal(oChanges, "changes");
					return "foo";
				}
			});
			sandbox.stub(sap.ui, "require")
				.callThrough()
				.withArgs(["sap/ui/fl/FakeLrepConnectorLocalStorage", "sap/ui/fl/registry/Settings"])
				.callsArgWithAsync(1, oFakeLrepConnectorLocalStorageStub, oSettingsStub);

			var mFlexData = {
				changes: {
					changes: "changes"
				}
			};
			return this.oLrepConnector.enableFakeConnectorForTrial({name: "name", appVersion: "appVersion"}, mFlexData)
			.then(function(oReturn) {
				assert.equal(oReturn, "foo", "the function returns the result of loadChanges");
			});
		});

		QUnit.test("_buildParams - empty", function(assert) {
			//Arrange
			var aParams = [];

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "");
		});

		QUnit.test("_buildParams - empty (explicit client)", function(assert) {
			//Arrange
			var aParams = [];
			this.oLrepConnector._sClient = "123";

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "?sap-client=123");
		});

		QUnit.test("_buildParams - one parameter", function(assert) {
			//Arrange
			var aParams = [
				{name: "p1", value: 512}
			];

			//Act
			var result = this.oLrepConnector._buildParams(aParams);

			//Assert
			assert.equal(result, "?p1=512");
		});

		QUnit.test("_buildParams - one parameter (explicit client)", function(assert) {
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

		QUnit.test("_buildParams - multiple parameter", function(assert) {
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

		QUnit.test("_buildParams - multiple parameter (explicit client)", function(assert) {
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

		QUnit.test("create - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var payload = {testVariant: "Foo"};
			var expectedUrl = "/sap/bc/lrep/changes/?changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.create(payload, "myChangelist").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "POST", {testVariant: "Foo"}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("create - optional param (changelist only)", function(assert) {
			//Arrange
			var payload = {testVariant: "Foo"};
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/?changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.create(payload, "myChangelist").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "POST", {testVariant: "Foo"}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("create - optional params (none)", function(assert) {
			//Arrange
			var payload = {testVariant: "Foo"};
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.create(payload).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "POST", {testVariant: "Foo"}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("update - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/myChangeName?changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.update({}, "myChangeName", "myChangelist").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "PUT", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("update - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/myChangeName";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.update({}, "myChangeName").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "PUT", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("update - required and optional (changelist only)", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/myChangeName?changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.update({}, "myChangeName", "myChangelist").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "PUT", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("deleteChange - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/variants/myChangeName?layer=myLayer&namespace=myNamespace&changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			var mParameter = {
				sChangeName: "myChangeName",
				sLayer: "myLayer",
				sNamespace: "myNamespace",
				sChangelist: "myChangelist"
			};
			return this.oLrepConnector.deleteChange(mParameter, true).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "DELETE", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("deleteChange - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/myChangeName";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			var mParameter = {sChangeName: "myChangeName"};
			return this.oLrepConnector.deleteChange(mParameter).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "DELETE", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("deleteChange - required and optional (layer)", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/myChangeName?layer=myLayer";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			var mParameter = {sChangeName: "myChangeName", sLayer: "myLayer"};
			return this.oLrepConnector.deleteChange(mParameter).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "DELETE", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("deleteChange - required and optional (namespace, changelist)", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/changes/myChangeName?namespace=myNamespace&changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			var mParameter = {
				sChangeName: "myChangeName",
				sLayer: null,
				sNamespace: "myNamespace",
				sChangelist: "myChangelist"
			};
			return this.oLrepConnector.deleteChange(mParameter).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "DELETE", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("getStaticResource - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.getStaticResource("myNamespace/mySubNamespace", "myName", "myType", true).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("getStaticResource - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?dt=true";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.getStaticResource("myNamespace/mySubNamespace", "myName", "myType").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("getStaticResource - optional set to false", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?dt=true";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.getStaticResource("myNamespace/mySubNamespace", "myName", "myType", false).then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("getFileAttributes - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace/myName.myType?metadata=true&layer=myLayer";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

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
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.getFileAttributes("myNamespace/mySubNamespace", "myName", "myType").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("upsert - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve(expectedResult));

			//Act
			return this.oLrepConnector.upsert("myNamespace/mySubNamespace/", "myName", "myType", "myLayer", "testcontent", "text/plain", "myChangelist").then(function(result) {
				//Assert
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("upsert - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve(expectedResult));

			//Act
			return this.oLrepConnector.upsert("myNamespace/mySubNamespace/", "myName", "myType", "myLayer", "{}").then(function(result) {
				//Assert
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("deleteFile - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.deleteFile("myNamespace/mySubNamespace", "myName", "myType", "myLayer", "myChangelist").then(function(result) {
				//Assert
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("deleteFile - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.deleteFile("myNamespace/mySubNamespace", "myName", "myType", "myLayer").then(function(result) {
				//Assert
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("publish - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/actions/publish/myNamespace/mySubNamespace/myName.myType?layer=myLayer&target-layer=myTargetLayer&target-namespace=myTargetNamespace&changelist=myChangelist";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.publish("myNamespace/mySubNamespace", "myName", "myType", "myLayer", "myTargetLayer", "myTargetNamespace", "myChangelist").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "POST", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("publish - required only", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/actions/publish/myNamespace/mySubNamespace/myName.myType?layer=myLayer&target-layer=myTargetLayer";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.publish("myNamespace/mySubNamespace", "myName", "myType", "myLayer", "myTargetLayer").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "POST", {}, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("listContent - all params", function(assert) {
			//Arrange
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace?layer=myLayer";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			//Act
			return this.oLrepConnector.listContent("myNamespace/mySubNamespace", "myLayer").then(function(result) {
				//Assert
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("listContent - required only", function(assert) {
			var expectedResult = {abc: 123};
			var expectedUrl = "/sap/bc/lrep/content/myNamespace/mySubNamespace";
			var sendStub = sinon.stub(this.oLrepConnector, "send").returns(Promise.resolve({abc: 123}));

			return this.oLrepConnector.listContent("myNamespace/mySubNamespace").then(function(result) {
				assert.ok(sendStub.calledWith(expectedUrl, "GET", null, null));
				assert.deepEqual(result, expectedResult);
			});
		});

		QUnit.test("_getUrlPrefix shall return the path to the variant REST API for variants", function(assert) {
			//Call CUT
			var sPrefix = this.oLrepConnector._getUrlPrefix(true);
			assert.equal(sPrefix, "/sap/bc/lrep/variants/");
		});

		QUnit.test("_getUrlPrefix shall return the path to the variant REST API for changes", function(assert) {
			//Call CUT
			var sPrefix = this.oLrepConnector._getUrlPrefix(false);
			assert.equal(sPrefix, "/sap/bc/lrep/changes/");
		});

		QUnit.test("_getUrlPrefix shall default to the path for changes", function(assert) {
			//Call CUT
			var sPrefix = this.oLrepConnector._getUrlPrefix();
			assert.equal(sPrefix, "/sap/bc/lrep/changes/");
		});


		QUnit.test("_getUrlPrefix shall embody the core configuration '' to the path for changes", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns("/something/else");

			var sPrefix = this.oLrepConnector._getUrlPrefix();
			assert.equal(sPrefix, "/something/else/changes/");
		});

		QUnit.test("_sendAjaxRequest - refetch XSRF Token in case of http 403 (not authorised) and reuse of previous XSRF token", function(assert) {
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
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function() {
				assert.equal(requestCount, 3, "There shall be 3 roundtrips: 1) Failed due to missing XSFR token. 2) Fetch XSRF Token. 3) Repeat first roundtrip.");
				assert.ok(bValidRequestReceived, "The XSRF Token shall be fetched and the origin request shall be resent");
				assert.ok(bValidFetchXSRFReceived, "The XSRF Token shall be fetched with a dedicated GET request");
				mSampleOptions.type = "POST";
				bValidRequestReceived = false;
				return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function() {
					assert.equal(requestCount, 4, "Next POST request will re use previous valid XSRF Token");
					assert.ok(bValidRequestReceived, "and send the correct request");
					mSampleOptions.type = "PUT";
					bValidRequestReceived = false;
					return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function() {
						assert.equal(requestCount, 5, "Next PUT request will re use previous valid XSRF Token");
						assert.ok(bValidRequestReceived, "and send the correct request");
						mSampleOptions.type = "DELETE";
						bValidRequestReceived = false;
						return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).then(function() {
							assert.equal(requestCount, 6, "Next DELETE request will re use previous valid XSRF Token");
							assert.ok(bValidRequestReceived, "and send the correct request");
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("_sendAjaxRequest - refetch XSRF Token in case of http 403 (not authorised) and reuse of previous XSRF token;" +
					"If the subsequence request fails, the promise is rejected but no error throws", function(assert) {
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
			return this.oLrepConnector._sendAjaxRequest(sSampleUri, mSampleOptions).
			then(undefined,
				//Promise is rejected
				function () {
					assert.equal(requestCount, 3, "There shall be 3 roundtrips: 1) Failed due to missing XSFR token. 2) Fetch XSRF Token. 3) Repeat first roundtrip.");
					assert.ok(oStubGetMessage.calledOnce, "the LRepConnector context is bind probably and there is no exception throw!!");
					assert.ok(bValidRequestReceived, "The XSRF Token shall be fetched and the origin request shall be resent");
					assert.ok(bValidFetchXSRFReceived, "The XSRF Token shall be fetched with a dedicated GET request");
				});
		});

		QUnit.test("_sendAjaxRequest - shall reject Promise when backend returns error", function(assert) {
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
				});
		});

		QUnit.test("_sendAjaxRequest - shall reject Promise when no flexibility services url prefix is returned", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns("");
			var sSampleUri = "http://www.abc.de/files/";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri).then(function() {
				assert.ok(false, "The Promise has not rejected");
			}, function(oError) {
				assert.ok(true, "The Promise has rejected");
				assert.equal("warning", oError.status);
				assert.equal(1, oError.messages.length);
				assert.equal("Flexibility Services requests were not sent. The UI5 bootstrap is configured to not send any requests.", oError.messages[0].text);
			});
		});

		QUnit.test("_sendAjaxRequest - shall reject Promise when fetching the XSRF Token has failed", function(assert) {
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
				.catch(function() {
					assert.equal(requestCount, 1, "There shall be 2 roundtrips: 1) Failed due to missing XSFR token. 2) Failing XSRF Token Fetch");
				});
		});

		QUnit.test("_getDefaultOptions shall delete the request body for http DELETE", function(assert) {
			var mOptions;

			//Call CUT
			mOptions = this.oLrepConnector._getDefaultOptions("DELETE", null, {});

			assert.strictEqual(mOptions.data, undefined);
		});

		QUnit.test("_sendAjaxRequest - shall read error messages from backend and reject Promise", function(assert) {
			//Arrange
			this.server = sinon.fakeServer.create();
			this.server.respondWith([500, {}, JSON.stringify({
				messages: [
					{
						severity: "Error",
						text: "content id must be non-initial"
					}
				]
			})]);
			this.server.autoRespond = true;

			var sSampleUri = "http://www.abc.de/files/";
			this.oLrepConnector._sXsrfToken = "abc";

			//Act
			return this.oLrepConnector._sendAjaxRequest(sSampleUri)["catch"](function(error) {
				assert.ok(error, "The promise shall reject");
				assert.ok(error.messages);
				assert.equal(error.messages.length, 1);
				assert.equal(error.messages[0].text, "content id must be non-initial");
				assert.equal(error.messages[0].severity, "Error");
			});
		});
	});

	QUnit.module("Load With CodeExt & XML", {
		beforeEach: function () {
			this.server = sinon.fakeServer.create();
			LrepConnector._bServiceAvailability = undefined;
			this.oLrepConnector = LrepConnector.createConnector();
			sandbox.stub(ContextManager, "getActiveContexts").callsFake(function () {
				return [];
			});

			this.oLoadModulesStub = sandbox.stub(this.oLrepConnector, "_loadModules").returns(Promise.resolve());
		},
		afterEach: function () {
			this.server.restore();
			sandbox.restore();

			LrepConnector.prototype._aSentRequestListeners = [];
			LrepConnector.prototype._sRequestUrlPrefix = "";
		}
	}, function() {
		QUnit.test("no additional request is sent in case the '/flex/data' has the flag 'loadModules' set to false", function (assert) {
			var sComponentName = "test.component";
			var sAppVersion = "1.2.3";
			var sFlexDataRequestUrl = "/sap/bc/lrep/flex/data/" + sComponentName + "?appVersion=" + sAppVersion;

			this.server.respondWith("GET", sFlexDataRequestUrl,
				[
					200,
					{"Content-Type" : "application/json"},
					"{\"loadModules\": false, \"changes\": []}"
				]);

			this.server.autoRespond = true;

			return this.oLrepConnector.loadChanges(
				{
					name : sComponentName,
					appVersion : sAppVersion
				}, {}
			).then(function () {
				assert.equal(this.server.requests.length, 1, "only one request was sent");
				assert.equal(this.server.requests[0].url, sFlexDataRequestUrl, "the request is the flex data request");
				assert.equal(this.oLoadModulesStub.callCount, 0, "no modules request was sent");
			}.bind(this)
			);
		});

		QUnit.test("no additional request is sent in case the '/flex/data' has not the flag 'loadModules'", function (assert) {
			var sComponentName = "test.component";
			var sAppVersion = "1.2.3";
			var sFlexDataRequestUrl = "/sap/bc/lrep/flex/data/" + sComponentName + "?appVersion=" + sAppVersion;

			this.server.respondWith("GET", sFlexDataRequestUrl,
				[
					200,
					{"Content-Type" : "application/json"},
					"{\"changes\": []}"
				]);

			this.server.autoRespond = true;

			return this.oLrepConnector.loadChanges(
				{
					name : sComponentName,
					appVersion : sAppVersion
				}, {}
			).then(function () {
				assert.equal(this.server.requests.length, 1, "only one request was sent");
				assert.equal(this.server.requests[0].url, sFlexDataRequestUrl, "the request is the flex data request");
				assert.equal(this.oLoadModulesStub.callCount, 0, "no modules request was sent");
			}.bind(this)
			);
		});

		QUnit.test("A modules request is sent in case the '/flex/data' has the flag 'loadModules' set to true", function (assert) {
			var sComponentName = "oneJsModule";
			var sAppVersion = "1.2.0";
			var sFlexDataRequestUrl = "/sap/bc/lrep/flex/data/" + sComponentName + "?appVersion=" + sAppVersion;
			var sFlexModulesRequestUrl = "/sap/bc/lrep/flex/modules/" + sComponentName + "?appVersion=" + sAppVersion;

			var aPredefinedModules = [];

			sandbox.stub(sap.ui, "predefine").callsFake(function (sModuleName) {
				aPredefinedModules.push(sModuleName);
			});

			this.server.respondWith("GET", "/sap/bc/lrep/flex/data/" + sComponentName + "?appVersion=" + sAppVersion,
				[
					200,
					{"Content-Type" : "application/json"},
					"{\"loadModules\": true, \"changes\": []}"
				]);

			this.server.autoRespond = true;

			return this.oLrepConnector.loadChanges(
				{
					name : sComponentName,
					appVersion : sAppVersion
				}, {}
			).then(function () {
				assert.equal(this.server.requests.length, 1, "one /flex/data requests was sent");
				assert.equal(this.server.requests[0].url, sFlexDataRequestUrl, "the request is the flex data request");
				assert.equal(this.oLoadModulesStub.callCount, 1, "a /flex/modules request was sent");
				assert.equal(this.oLoadModulesStub.getCall(0).args[0], sFlexModulesRequestUrl, "the request is the flex modules request");
			}.bind(this)
			);
		});
	});

	QUnit.module("the connector reacts on the core configuration 'flexibilityServices'", function () {
		QUnit.test("does send a request in case no 'sap-data-ui-flexibilityServices' was set", function (assert) {
			this.server = sinon.fakeServer.create();
			this.server.respondWith([200, {
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			}, "{}"]);
			this.server.autoRespond = true;

			var done = assert.async();
			assert.expect(0);

			new LrepConnector()._sendAjaxRequest("/sap/bc/lrep/flex/data/test", {type: "GET"}).then(function () {
				done();
			});
		});

		QUnit.test("does not send a request in case 'sap-data-ui-flexibilityServices' was set to an empty string", function (assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns("");

			var done = assert.async();
			assert.expect(0);

			new LrepConnector()._sendAjaxRequest("/sap/bc/lrep/flex/data/test", {type: "GET"}).then(function () {
				assert.ok(false, "if you see this, then no rejection took place. This should not happen.");
				done();
			}, function () {
				done();
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
