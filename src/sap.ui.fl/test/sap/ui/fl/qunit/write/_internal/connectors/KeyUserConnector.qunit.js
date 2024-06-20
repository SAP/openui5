/* global QUnit */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer"
], function(
	MessageBox,
	Lib,
	sinon,
	FlexConfiguration,
	InitialConnector,
	InitialUtils,
	Version,
	KeyUserConnector,
	WriteUtils,
	Storage,
	Layer
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("KeyUserConnector", {
		afterEach() {
			WriteUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when write is triggered for single change", function(assert) {
			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/changes/?sap-language=en";
			var oChange = {
				fileName: "change1"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oChange});
			return KeyUserConnector.write(mPropertyBag).then(function(oResponse) {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/flexKeyuser/flex/keyuser/v2/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: "[]"
				}), "a send request with correct parameters and options is sent");
				assert.ok(Array.isArray(oResponse.response), "response is an array");
				assert.deepEqual(oChange, oResponse.response[0]);
			});
		});

		QUnit.test("given a mock server, when write is triggered for multiple change", function(assert) {
			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/changes/?sap-language=en";
			var oChange1 = {
				fileName: "change1"
			};
			var oChange2 = {
				fileName: "change2"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: [oChange1, oChange2]});
			return KeyUserConnector.write(mPropertyBag).then(function(oResponse) {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					tokenUrl: "/flexKeyuser/flex/keyuser/v2/settings",
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

		QUnit.test("given a mock server, when write is triggered for a draft", function(assert) {
			var mPropertyBag = {url: "/flexKeyuser", flexObjects: [], parentVersion: 1};
			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v2/changes/?parentVersion=1&sap-language=en";
			var oChange = {
				fileName: "change1"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: oChange});
			return KeyUserConnector.write(mPropertyBag).then(function() {
				var aArgs = oStubSendRequest.getCall(0).args;
				var sUrl = aArgs[0];
				assert.equal(sUrl, sExpectedUrl, "a send request with correct url is sent");
			});
		});

		QUnit.test("given a mock server, when update is triggered", function(assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName"
			};
			var mPropertyBag = {url: "/flexKeyuser", flexObject: oFlexObject};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/changes/myFileName?sap-language=en";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.update(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					tokenUrl: "/flexKeyuser/flex/keyuser/v2/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
			});
		});

		QUnit.test("given a mock server, when remove is triggered", function(assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "myNamespace",
				layer: Layer.VENDOR
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				parentVersion: "myParentVersion",
				url: "/flexKeyuser"
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/changes/myFileName?namespace=myNamespace&parentVersion=myParentVersion";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();

			return KeyUserConnector.remove(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/flexKeyuser/flex/keyuser/v2/settings",
					initialConnector: InitialConnector,
					contentType: "application/json; charset=utf-8",
					dataType: "json"
				}), "a send request with correct parameters and options is sent");
			});
		});

		QUnit.test("given a mock server, when reset is triggered", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "flexReference",
				generator: "someGenerator",
				selectorIds: ["selector1", "selector2"],
				changeTypes: ["changeType1", "changeType2"],
				layer: Layer.USER
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/changes/?reference=flexReference&generator=someGenerator&layer=USER&selector=selector1,selector2&changeType=changeType1,changeType2";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			return KeyUserConnector.reset(mPropertyBag).then(function() {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					tokenUrl: "/flexKeyuser/flex/keyuser/v2/settings",
					initialConnector: InitialConnector
				}), "a send request with correct parameters and options is sent");
			});
		});
	});

	QUnit.module("KeyUserConnector.translation", {
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyuser"}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when getSourceLanguage is triggered", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			var aReturnedLanguages = [
				"en-US",
				"de-DE"
			];
			var sUrl = "/flexKeyuser/flex/keyuser/v2/translation/sourcelanguages/reference";
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({
				response: {
					sourceLanguages: aReturnedLanguages
				}
			});

			return Storage.translation.getSourceLanguages(mPropertyBag)
			.then(function(oResponse) {
				assert.deepEqual(oResponse, [
					"en-US",
					"de-DE"
				], "the languages are returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("given a mock server, when getTexts is triggered", function(assert) {
			var mPropertyBag = {
				sourceLanguage: "en-US",
				targetLanguage: "de-DE",
				url: "/flexKeyuser",
				reference: "reference",
				layer: Layer.CUSTOMER
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/translation/texts/reference?sourceLanguage=en-US&targetLanguage=de-DE";
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: {}});
			return Storage.translation.getTexts(mPropertyBag)
			.then(function() {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("JSON: given a mock server, when getTexts is triggered", function(assert) {
			this.xhr = sandbox.useFakeXMLHttpRequest();
			this.xhr.onCreate = function(oRequest) {
				var oHeaders = {"Content-Type": "application/xml"};
				oRequest.addEventListener("loadstart", function(oEvent) {
					oEvent.target.responseType = "";
					this.oXHR = oRequest;
					this.oXHRLoadSpy = sandbox.spy(oRequest, "onload");
					oEvent.target.respond(200, oHeaders, "<xml></xml>");
				}.bind(this));
			}.bind(this);
			var mPropertyBag = {
				sourceLanguage: "en-US",
				targetLanguage: "de-DE",
				url: "/flexKeyuser",
				reference: "reference",
				layer: Layer.CUSTOMER
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/translation/texts/reference?sourceLanguage=en-US&targetLanguage=de-DE";
			return Storage.translation.getTexts(mPropertyBag)
			.then(function(oResponse) {
				assert.equal(this.oXHR.url, sUrl, "the request has the correct url");
				assert.equal(this.oXHR.method, "GET", "the method is correct");
				assert.equal(oResponse, "<xml></xml>", "the response is a string");
			}.bind(this));
		});

		QUnit.test("given a mock server, when postTranslationTexts is triggered", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				payload: {},
				layer: Layer.CUSTOMER
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/translation/texts";
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: {}});
			return Storage.translation.postTranslationTexts(mPropertyBag)
			.then(function() {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("KeyUserConnector.getContexts", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		var aReturnedContexts = {
			lastHitReached: false,
			values: [
				{
					name: "someRoleA",
					description: "Description of someRoleA"
				},
				{
					name: "someRoleB",
					description: "Description of someRoleB"
				}
			]
		};

		QUnit.test("given a mock server, when get is triggered, with pagination", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				type: "role",
				$skip: 100,
				$filter: "SAP"
			};

			var sUrl = "/flexKeyuser/flex/keyuser/v2/contexts/?type=role&%24skip=100&%24filter=SAP";
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: aReturnedContexts});
			return KeyUserConnector.getContexts(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, aReturnedContexts, "the contexts are returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
			});
		});

		QUnit.test("given a mock server, when get is triggered", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser"
			};

			var sUrl = "/flexKeyuser/flex/keyuser/v2/contexts/";
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: aReturnedContexts});
			return KeyUserConnector.getContexts(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, aReturnedContexts, "the contexts are returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl, "the request has the correct url");
			});
		});
	});

	QUnit.module("KeyUserConnector.loadContextDescriptions", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		var aReturnedContexts = {
			role: [
				{id: "ZSOME_ROLE_ONE", description: "Some role one description"},
				{id: "ZSOME_ROLE_TWO", description: "Some role two description"}
			]
		};

		QUnit.test("given a mock server, when loadContextDescriptions is triggered", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				flexObjects: { role: ["ZSOME_ROLE_ONE", "ZSOME_ROLE_TWO"]}
			};
			var sUrl = "/flexKeyuser/flex/keyuser/v2/contexts/?sap-language=en";
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: aReturnedContexts});
			return KeyUserConnector.loadContextDescriptions(mPropertyBag).then(function(oResponse) {
				var call = oStubSendRequest.getCall(0);
				assert.deepEqual(oResponse, aReturnedContexts, "the contexts are returned correctly");
				assert.equal(call.args[0], sUrl, "the request has the correct url");
				assert.equal(call.args[1], "POST", "the request has the correct method");
				assert.deepEqual(call.args[2].payload, JSON.stringify(mPropertyBag.flexObjects), "the request has the correct payload");
				assert.equal(call.args[2].tokenUrl, "/flex/keyuser/v2/settings", "the request has the correct token url");
				assert.equal(call.args[2].xsrfToken, InitialConnector.xsrfToken, "the request has the correct xsrfToken");
			});
		});
	});

	QUnit.module("KeyUserConnector handing xsrf token in combination of the apply connector", {
		afterEach() {
			InitialConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when write is triggered and the apply connectors xsrf token is outdated", function(assert) {
			var newToken = "newToken456";

			InitialConnector.xsrfToken = "oldToken123";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).rejects({status: 403});
			oStubSendRequest.onCall(1).resolves({xsrfToken: newToken});
			oStubSendRequest.onCall(2).resolves({response: "something"});

			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			return KeyUserConnector.write(mPropertyBag).then(function() {
				assert.equal(oStubSendRequest.callCount, 3, "three request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the first request was a POST request");
				assert.equal(oStubSendRequest.getCall(1).args[0], "/flexKeyuser/flex/keyuser/v2/settings", "the second request has the correct url");
				assert.equal(oStubSendRequest.getCall(1).args[1], "HEAD", "the second request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(2).args[1], "POST", "the third request was a POST request");
			});
		});

		QUnit.test("given a mock server, when write is triggered and the apply connectors has no token", function(assert) {
			var newToken = "newToken456";

			InitialConnector.xsrfToken = undefined;

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest");
			oStubSendRequest.onCall(0).resolves({xsrfToken: newToken});
			oStubSendRequest.onCall(1).resolves({response: "something"});

			var mPropertyBag = {url: "/flexKeyuser", flexObjects: []};
			return KeyUserConnector.write(mPropertyBag).then(function() {
				assert.equal(oStubSendRequest.callCount, 2, "two request were sent");
				assert.equal(oStubSendRequest.getCall(0).args[1], "HEAD", "the first request was a HEAD request");
				assert.equal(oStubSendRequest.getCall(1).args[1], "POST", "the second request was a POST request");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.load", {
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyuser"}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("get Versions", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				limit: 10,
				layer: Layer.CUSTOMER
			};
			var mExpectedPropertyBag = Object.assign({
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);
			var aReturnedVersions = [{
				versionNumber: Version.Number.Draft
			}, {
				versionNumber: 1
			}];
			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: {versions: aReturnedVersions}});
			return Storage.versions.load(mPropertyBag)
			.then(function(oResponse) {
				assert.deepEqual(oResponse, [{
					version: Version.Number.Draft
				}, {
					version: "1"
				}], "the versions list is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v2/versions/com.sap.test.app?sap-language=en&limit=10", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.activate", {
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyuser"}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("activate draft", function(assert) {
			var sActivateVersion = Version.Number.Draft;
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new Title",
				version: sActivateVersion,
				layer: Layer.CUSTOMER
			};

			var sExpectedUrl = `/flexKeyuser/flex/keyuser/v2/versions/activate/com.sap.test.app?version=${sActivateVersion}&sap-language=en`;
			var mExpectedPropertyBag = Object.assign({
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
			return Storage.versions.activate(mPropertyBag)
			.then(function(oResponse) {
				assert.deepEqual(oResponse, {
					version: "1"
				}, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate old version", function(assert) {
			var sActivateVersion = "1";
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new reactivate Title",
				version: sActivateVersion,
				layer: Layer.CUSTOMER
			};

			var sExpectedUrl = `/flexKeyuser/flex/keyuser/v2/versions/activate/com.sap.test.app?version=${sActivateVersion}&sap-language=en`;
			var mExpectedPropertyBag = Object.assign({
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
			return Storage.versions.activate(mPropertyBag)
			.then(function(oResponse) {
				assert.deepEqual(oResponse, {
					version: "1"
				}, "the reactivated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("reactivate original app", function(assert) {
			var sActivateVersion = Version.Number.Original;
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				title: "new Title",
				version: sActivateVersion,
				layer: Layer.CUSTOMER
			};

			var sExpectedUrl = `/flexKeyuser/flex/keyuser/v2/versions/activate/com.sap.test.app?version=${sActivateVersion}&sap-language=en`;
			var mExpectedPropertyBag = Object.assign({
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
			return Storage.versions.activate(mPropertyBag)
			.then(function(oResponse) {
				assert.deepEqual(oResponse, {
					version: "1"
				}, "the activated version is returned correctly");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.discardDraft", {
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyuser"}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("discard draft", function(assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "com.sap.test.app",
				layer: Layer.CUSTOMER
			};
			var mExpectedPropertyBag = Object.assign({
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return Storage.versions.discardDraft(mPropertyBag)
			.then(function() {
				assert.equal(oStubSendRequest.getCall(0).args[0], "/flexKeyuser/flex/keyuser/v2/versions/draft/com.sap.test.app", "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "DELETE", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});
	});

	QUnit.module("KeyUserConnector.versions.publish", {
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyuser"}
			]);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling publish successfully", function(assert) {
			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.test.app",
				version: "3",
				url: "/flexKeyuser"
			};
			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v2/versions/publish/com.sap.test.app?version=3";
			var mExpectedPropertyBag = Object.assign({
				initialConnector: InitialConnector,
				tokenUrl: KeyUserConnector.ROUTES.TOKEN
			}, mPropertyBag);

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return Storage.versions.publish(mPropertyBag)
			.then(function(sMessage) {
				assert.equal(sMessage, oResourceBundle.getText("MSG_CF_PUBLISH_SUCCESS"), "the correct message was returned");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "the request has the correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST", "the method is correct");
				assert.deepEqual(oStubSendRequest.getCall(0).args[2], mExpectedPropertyBag, "the propertyBag is passed correct");
			});
		});

		QUnit.test("when calling publish unsuccessfully", function(assert) {
			sandbox.stub(MessageBox, "show");
			sandbox.stub(WriteUtils, "sendRequest").rejects();
			return Storage.versions.publish({
				layer: Layer.CUSTOMER,
				reference: "sampleComponent",
				version: "3",
				url: "/flexKeyuser"
			}).then(function(sResponse) {
				assert.equal(sResponse, "Error", "then Promise.resolve() with error message is returned");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
