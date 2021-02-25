/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Core",
	"sap/ui/fl/write/_internal/fieldExtensibility/Access",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	XMLView,
	Core,
	Access,
	Settings,
	Utils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oBusinessExpectedContextRetrievalResult = {
		BusinessContexts: [{ BusinessContext: "CFD_TSM_BUPA_ADR", BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"}, { BusinessContext: "CFD_TSM_BUPA", BusinessContextDescription: "Description for CFD_TSM_BUPA"}],
		ServiceName: "someService",
		ServiceVersion: "0001"
	};
	var oBusinessExpectedContextRetrievalResultWithDescriptions = {
		BusinessContexts: [{ BusinessContext: "CFD_TSM_BUPA_ADR", BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR" }, { BusinessContext: "CFD_TSM_BUPA", BusinessContextDescription: "Description for CFD_TSM_BUPA" }],
		ServiceName: "someService",
		ServiceVersion: "0001"
	};

	var oBusinessExpectedContextRetrievalResultWithoutBusinesscontexts = {
		BusinessContexts: [],
		ServiceName: "someService",
		ServiceVersion: "0001"
	};

	var oHttpErrorResponse = {
		error: {
			code: "005056A509B11EE1B9A8FEC11C21578E",
			message: {
				lang: "en",
				value: "Invalid Function Import Parameter"
			},
			innererror: {
				transactionid: "54E429A74593458DE10000000A420908",
				timestamp: "20150219074515.1395610",
				Error_Resolution: {
					SAP_Transaction: "Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details", SAP_Note: "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)"
				}
			}
		}
	};

	var oExpectedErrorResult = {
		severity: "error",
		text: "{\"error\":{\"code\":\"005056A509B11EE1B9A8FEC11C21578E\",\"message\":{\"lang\":\"en\",\"value\":\"Invalid Function Import Parameter\"},\"innererror\":{\"transactionid\":\"54E429A74593458DE10000000A420908\",\"timestamp\":\"20150219074515.1395610\",\"Error_Resolution\":{\"SAP_Transaction\":\"Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details\",\"SAP_Note\":\"See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)\"}}}}"
	};

	var oServiceUri = {
		sServiceName: "SOME_SRVC_NM",
		sNamespace: "/namespace/",
		sPrefix: "/someService",
		sODataPrefix: "/sap/opu/odata",
		sSapPrefix: "/SAP",
		sVersion: ";v=0007"
	};

	var mockAccessJs = function() {
		var oUnchangedAccess = {};
		for (var propertyName in Access) {
			oUnchangedAccess[propertyName] = Access[propertyName];
		}

		Access._getSystemInfo = function() {
			return {
				getName: function() {
					return "ABC";
				},
				getClient: function() {
					return "123";
				}
			};
		};

		Access._isSystemInfoAvailable = function() {
			return true;
		};

		return oUnchangedAccess;
	};

	var unMockAccessJs = function(oUnchangedAccess) {
		for (var propertyName in oUnchangedAccess) {
			Access[propertyName] = oUnchangedAccess[propertyName];
		}
	};

	var checkService = function(assert, sUri, sExpectedServiceName, sExpectedServiceVersion) {
		var oService = Access._parseServiceUri(sUri);
		assert.equal(oService.serviceName, sExpectedServiceName, "ServiceName correct");
		assert.equal(oService.serviceVersion, sExpectedServiceVersion, "ServiceVersion correct");
	};

	var checkServiceName = function(assert, sUri, sExpectedServiceName) {
		var oService = Access._parseServiceUri(sUri);
		assert.equal(oService.serviceName, sExpectedServiceName);
	};

	var checkServiceVersion = function(assert, sUri, sExpectedServiceVersion) {
		var oService = Access._parseServiceUri(sUri);
		assert.equal(oService.serviceVersion, sExpectedServiceVersion);
	};

	QUnit.module("sap.ui.fl.fieldExt.Access", {}, function() {
		QUnit.test("_parseServiceName can extract a service name from an uri without a namespace", function(assert) {
			var sServiceName = oServiceUri.sServiceName;
			var sDeterminedServiceName = Access._parseServiceUri(sServiceName).serviceName;
			assert.equal(sDeterminedServiceName, sServiceName);
		});

		QUnit.test("_parseServiceName can extract a service name from an 'sap/opu/odata/' uri", function(assert) {
			var sServiceNameWithNamespace = oServiceUri.sNamespace + oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + sServiceNameWithNamespace;
			var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceNameWithNamespace);
		});

		QUnit.test("_parseServiceName can extract a simple service name from an 'sap/opu/odata/' uri with version information", function(assert) {
			var sServiceNameWithNamespace = oServiceUri.sNamespace + oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + sServiceNameWithNamespace + oServiceUri.sVersion;
			var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceNameWithNamespace);
		});

		QUnit.test("_parseServiceName can extract a service name from an 'sap/opu/odata/SAP/' uri", function(assert) {
			var sServiceName = oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + oServiceUri.sSapPrefix + "/" + sServiceName;
			var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceName);
		});

		QUnit.test("_parseServiceName can extract a simple service name from an 'sap/opu/odata/SAP/' uri with version information", function(
			assert) {
			var sServiceName = oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + oServiceUri.sSapPrefix + "/" + sServiceName + oServiceUri.sVersion;
			var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceName);
		});

		QUnit.test("getBusinessContextsByEntityType", function(assert) {
			var sServiceUrl = "/someService";
			var sEntityName = "BusinessPartner";

			var oServer;
			oServer = sinon.fakeServer.create();

			oServer.autoRespond = true;
			try {
				var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityName);

				oPromise.done(function(oBusinessContexts) {
					oServer.restore();
					assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResultWithDescriptions);
				});

				oPromise.fail(function(error) {
					oServer.restore();
					assert.ok(false, "Should not run into fail branch. Error" + error);
				});

				oServer.requests[0].respond(200, {
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				}, '{ "d": {"results":[{"BusinessContext":"CFD_TSM_BUPA_ADR", "BusinessContextDescription": "Description for CFD_TSM_BUPA_ADR"},{"BusinessContext":"CFD_TSM_BUPA" , "BusinessContextDescription": "Description for CFD_TSM_BUPA"}] }}');
			} catch (e) {
				oServer.restore();
				assert.ok(false, e);
			}
		});

		QUnit.test("getBusinessContextsByEntitySet", function(assert) {
			var sServiceUrl = "/someService";
			var sEntitySetName = "BusinessPartnerSet";

			var oServer;
			oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
			try {
				var oPromise = Access.getBusinessContexts(sServiceUrl, null, sEntitySetName);

				oPromise.done(function(oBusinessContexts) {
					oServer.restore();
					assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResult);
				});

				oPromise.fail(function(error) {
					oServer.restore();
					assert.ok(false, "Should not run into fail branch. Error" + error);
				});

				oServer.requests[0].respond(200, {
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				}, '{ "d": {"results":[{"BusinessContext":"CFD_TSM_BUPA_ADR", "BusinessContextDescription": "Description for CFD_TSM_BUPA_ADR"},{"BusinessContext":"CFD_TSM_BUPA", "BusinessContextDescription": "Description for CFD_TSM_BUPA" }] }}');
			} catch (e) {
				oServer.restore();
				assert.ok(false, e);
			}
		});
		QUnit.test("getBusinessContextsByEntitySetWithDescriptions", function(assert) {
			var sServiceUrl = "/someService";
			var sEntitySetName = "BusinessPartnerSet";

			var oServer;
			oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
			try {
				var oPromise = Access.getBusinessContexts(sServiceUrl, null, sEntitySetName);

				oPromise.done(function(oBusinessContexts) {
					oServer.restore();
					assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResultWithDescriptions);
				});

				oPromise.fail(function(error) {
					oServer.restore();
					assert.ok(false, "Should not run into fail branch. Error" + error);
				});

				oServer.requests[0].respond(200, {
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				}, '{ "d": {"results":[{"BusinessContext":"CFD_TSM_BUPA_ADR", "BusinessContextDescription":"Description for CFD_TSM_BUPA_ADR"}, { "BusinessContext":"CFD_TSM_BUPA", "BusinessContextDescription":"Description for CFD_TSM_BUPA" }] }}');
			} catch (e) {
				oServer.restore();
				assert.ok(false, e);
			}
		});

		QUnit.test("getBusinessContextsWhereNoContextsAreReturned", function(assert) {
			var sServiceUrl = "/someService";
			var sEntityTypeName = "BusinessPartner";

			var oServer;
			oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
			try {
				var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityTypeName);

				oPromise.done(function(oBusinessContexts) {
					oServer.restore();
					assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResultWithoutBusinesscontexts);
				});

				oPromise.fail(function(error) {
					oServer.restore();
					assert.ok(false, "Should not run into fail branch. Error" + error);
				});

				oServer.requests[0].respond(200, {
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				}, '{ "results":[] }');
			} catch (e) {
				oServer.restore();
				assert.ok(false, e);
			}
		});

		//In case EntitySetName was not provided at all - at least EntitySetName='' has to be provided -
		// the real get response is used in respond parameter of this test
		QUnit.test("getBusinessContextsWhereRetrievalFails", function(assert) {
			var sServiceUrl = "/someService";
			var sEntityTypeName = "BusinessPartner";

			var oServer;
			oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
			try {
				var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityTypeName);

				oPromise.done(function() {
					oServer.restore();
					assert.ok(false, "Should not run into done branch. ");
				});

				oPromise.fail(function(oError) {
					oServer.restore();
					assert.equal(oError.errorMessages[0].text, "Invalid Function Import Parameter");
					assert.equal(oError.errorMessages[0].severity, oExpectedErrorResult.severity);
				});

				oServer.requests[0].respond(404, {
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				}, JSON.stringify(oHttpErrorResponse));
			} catch (e) {
				oServer.restore();
				assert.ok(false, e);
			}
		});

		QUnit.test("Test set service invalid", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Test expiration date", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			// Mock current time to 5
			Access._getCurrentTime = function() {
				return 5;
			};

			// Clear storage
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			// Check expiration date 5 + 1 week
			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));

			Access._getCurrentTime = function() {
				return 5 + (1 * 7 * 24 * 60 * 60 * 1000) - 1;
			};

			assert.ok(Access.isServiceOutdated(service));

			Access._getCurrentTime = function() {
				return 5 + (1 * 7 * 24 * 60 * 60 * 1000);
			};

			assert.notOk(Access.isServiceOutdated(service));

			// Make sure the service has been deleted from the local storage
			assert.notOk(Access._getServiceItem(Access._createServiceItem(service)));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Test reinvalidate", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			// Clear storage
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			// Mock current time to 5 and invalidate
			Access._getCurrentTime = function() {
				return 5;
			};
			Access.setServiceInvalid(service);

			// Two weeks have been passed
			Access._getCurrentTime = function() {
				return 5 + (2 * 7 * 24 * 60 * 60 * 1000);
			};

			// The service must be valid, but the entry is still there.
			// Let`s invalidate the service again
			Access.setServiceInvalid(service);

			// Service have to be stale
			assert.ok(Access.isServiceOutdated(service));
			assert.ok(Access.isServiceOutdated(service));
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Test logon system not available", function(assert) {
			// The service is always valid
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));
			Access.setServiceInvalid(service);
			assert.notOk(Access.isServiceOutdated(service));
		});

		QUnit.test("Test ushell not available", function(assert) {
			var shell = null;
			if (sap.ushell) {
				shell = sap.ushell;
				delete sap.ushell;
			}

			// The service is always valid
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));
			Access.setServiceInvalid(service);
			assert.notOk(Access.isServiceOutdated(service));

			if (shell) {
				sap.ushell = shell;
			}
		});

		QUnit.test("Test uniqueness", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			var serviceModifiedName = {
				serviceName: "abcd",
				serviceVersion: "0001"
			};

			var serviceModifiedVersion = {
				serviceName: "abc",
				serviceVersion: "0002"
			};

			// Clear storage
			Access.setServiceValid(service);
			Access.setServiceValid(serviceModifiedName);
			Access.setServiceValid(serviceModifiedVersion);
			assert.notOk(Access.isServiceOutdated(service));
			assert.notOk(Access.isServiceOutdated(serviceModifiedName));
			assert.notOk(Access.isServiceOutdated(serviceModifiedVersion));

			// Mock current time to 5 and invalidate
			Access._getCurrentTime = function() {
				return 5;
			};
			Access.setServiceInvalid(service);

			assert.ok(Access.isServiceOutdated(service));
			assert.notOk(Access.isServiceOutdated(serviceModifiedName));
			assert.notOk(Access.isServiceOutdated(serviceModifiedVersion));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Validate local storage is used", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service;
			var storageItem;

			// Run test only if local storage is available
			if (window.localStorage) {
				window.localStorage.setItem("state.key_-sap.ui.fl.fieldExt.Access", "\"{ }\"");

				service = {
					serviceName: "abc",
					serviceVersion: "0001"
				};

				Access.setServiceValid(service);
				assert.notOk(Access.isServiceOutdated(service));
				Access.setServiceInvalid(service);
				assert.ok(Access.isServiceOutdated(service));

				storageItem = window.localStorage.getItem("state.key_-sap.ui.fl.fieldExt.Access");
				assert.ok(storageItem !== "\"{ }\"");
			}
			unMockAccessJs(oUnchangedAccess);
			assert.ok(true);
		});

		QUnit.test("Test no local storage", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			// If no local storage is available => This class does nothing => A service is never outdated
			var service = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			// We simulate a very old browser
			Access._getLocalStorage = function() {
				return null;
			};

			// Execute tests
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			Access.setServiceInvalid(service);
			assert.notOk(Access.isServiceOutdated(service));

			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Test set service invalid with relative uri", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service = "/sap/opu/odata/SAP/someService";
			var serviceAsObject = {
				serviceName: "someService",
				serviceVersion: "0001"
			};

			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			// Different parameters
			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));
			assert.ok(Access.isServiceOutdated(serviceAsObject));
			Access.setServiceValid(serviceAsObject);
			assert.notOk(Access.isServiceOutdated(service));
			assert.notOk(Access.isServiceOutdated(serviceAsObject));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Test set service invalid with relative and version uri", function(assert) {
			var oUnchangedAccess = mockAccessJs();
			var service = "/sap/opu/odata/SAP/someService;v=0002";
			var serviceAsObject = {
				serviceName: "someService",
				serviceVersion: "0002"
			};

			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));
			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));

			// Different parameters
			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));
			assert.ok(Access.isServiceOutdated(serviceAsObject));
			Access.setServiceValid(serviceAsObject);
			assert.notOk(Access.isServiceOutdated(service));
			assert.notOk(Access.isServiceOutdated(serviceAsObject));

			unMockAccessJs(oUnchangedAccess);
		});

		QUnit.test("Parse service version of relative uri", function(assert) {
			checkServiceVersion(assert, "sap/opu/odata/SAP/someServicesomeService;v=0002", "0002");
			checkServiceVersion(assert, "/sap/opu/odata/SAP/someServicesomeService;v=0002/", "0002");
			checkServiceVersion(assert, "sap/opu/odata/ns/someServicesomeService;v=0002", "0002");
			checkServiceVersion(assert, "/sap/opu/odata/ns/someServicesomeService;v=0002/", "0002");
			checkServiceVersion(assert, "/foo/opu/odata/ns/someServicesomeService;v=0002/", "0002");
			checkServiceVersion(assert, "/foo/opu/odata/ns/someServicesomeService;v=0002", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someServicesomeService;v=0002/", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someServicesomeService;v=0002", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someServicesomeService;v=0002;w=foo", "0002");
			checkServiceVersion(assert, "sap/opu/odata/SAP/someServicesomeService", "0001");
			checkServiceVersion(assert, "sap/opu/odata/SAP/someServicesomeService;v=0002;v=0004", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someServicesomeService;v=0002;w=foo?$format=json", "0002");
			checkServiceVersion(assert, "sap/opu/odata/ns/someServicesomeService;v=0002;w=foo?$format=json", "0002");
		});

		QUnit.test("Parse service name (OData v2)", function(assert) {
			// 1.) Case
			checkServiceName(assert, "/sap/opu/odata/SAP/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/SAP/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/SAP/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");

			checkServiceName(assert, "sap/opu/odata/SAP/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/SAP/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/SAP/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");

			checkServiceName(assert, "/sap/opu/odata/sap/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/SaP/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "/sap/opu/oData/SAP/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "/sap/Opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");
			checkServiceName(assert, "/Sap/Opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");
			checkServiceName(assert, "/Sap/Opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");

			checkServiceName(assert, "sap/opu/odata/SAP/someServicesomeService;v=0002;w=foo?$format=xml", "someServicesomeService");

			// 2.) Case
			checkServiceName(assert, "/sap/opu/odata/PAS/someServicesomeService", "/PAS/someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/PAS/someServicesomeService/", "/PAS/someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/PAS/someServicesomeService;v=0002", "/PAS/someServicesomeService");
			checkServiceName(assert, "/sap/opu/odata/PAS/someServicesomeService;v=0002/", "/PAS/someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/PAS/someServicesomeService", "/PAS/someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/PAS/someServicesomeService/", "/PAS/someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/PAS/someServicesomeService;v=0002", "/PAS/someServicesomeService");
			checkServiceName(assert, "sap/opu/odata/PAS/someServicesomeService;v=0002/", "/PAS/someServicesomeService");

			// 3.) Case
			checkServiceName(assert, "/foo/opu/odata/SAP/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "/foo/opu/odata/SAP/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "/foo/opu/odata/SAP/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "/foo/opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");

			checkServiceName(assert, "foo/opu/odata/SAP/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "foo/opu/odata/SAP/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "foo/opu/odata/SAP/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "foo/opu/odata/SAP/someServicesomeService;v=0002/", "someServicesomeService");

			checkServiceName(assert, "/foo/opu/odata/PAS/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "/foo/opu/odata/PAS/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "/foo/opu/odata/PAS/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "/foo/opu/odata/PAS/someServicesomeService;v=0002/", "someServicesomeService");

			checkServiceName(assert, "foo/opu/odata/PAS/someServicesomeService", "someServicesomeService");
			checkServiceName(assert, "foo/opu/odata/PAS/someServicesomeService/", "someServicesomeService");
			checkServiceName(assert, "foo/opu/odata/PAS/someServicesomeService;v=0002", "someServicesomeService");
			checkServiceName(assert, "foo/opu/odata/PAS/someServicesomeService;v=0002/", "someServicesomeService");
		});

		QUnit.test("Parse OData v4 service document (relative, no segment or query parameters)", function(assert) {
			checkService(assert, "sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001", "sadl/sap/i_cfd_tsm_so_core", "0001");
		});

		QUnit.test("Parse OData v4 service document (no segment or query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0002/", "sadl/sap/i_cfd_tsm_so_core", "0002");
		});

		QUnit.test("Parse OData v4 service document (no segment or query parameters) - case sensitive", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/I_CFD_TSM_SO_CORE/0001", "sadl/sap/I_CFD_TSM_SO_CORE", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/I_CFD_TSM_SO_CORE/0002/", "sadl/sap/I_CFD_TSM_SO_CORE", "0002");
		});

		QUnit.test("Parse OData v4 service document (with segment but no query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0002;o=LOCAL_TGW/", "sadl/sap/i_cfd_tsm_so_core", "0002");
		});

		QUnit.test("Parse OData v4 service entity (with segment and query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa/?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
		});

		QUnit.test("Parse OData v4 service entity navigation (with segment and query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa/toAss?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa/toAss/?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
		});

		QUnit.test("Check correct escaping in _buildBusinessContextRetrievalUri", function(assert) {
			var sBusinessContextRetrievalUri = Access._buildBusinessContextRetrievalUri({
				serviceName: "sadl/sap/i_cfd_tsm_so_core",
				serviceVersion: "0001",
				serviceType: "v4"
			}, {
				entityTypeName: "BusinessPartner",
				entitySetName: ""
			});
			var sExpectedBusinessContextRetrievalUri = "/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByResourcePath?ResourcePath=%27sap%2fopu%2fodata4%2fsadl%2fsap%2fi_cfd_tsm_so_core%2f0001%27&EntitySetName=''&EntityTypeName='BusinessPartner'&$format=json";
			assert.equal(sBusinessContextRetrievalUri, sExpectedBusinessContextRetrievalUri);
		});

		QUnit.test("Call getBusinessContexts for V4 service against old backend", function(assert) {
			var sServiceUrl = "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001/";
			var sEntityTypeName = "BusinessPartner";
			var oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
			var oExpectedResult = {
				BusinessContexts: [],
				ServiceName: "sadl/sap/i_cfd_tsm_so_core",
				ServiceVersion: "0001"
			};
			var oMockResponse = {
				error: {
					code: "005056A509B11EE1B9A8FEC11C21D78E",
					message: {
						lang: "en",
						value: "Resource not found for the segment 'GetBusinessContextsByResourcePath'."
					},
					innererror: {
						transactionid: "80E2B6AC2FB801F0E005A26F672AEE62",
						timestamp: "20171206180317.9903950",
						Error_Resolution: {
							SAP_Transaction: "For backend administrators: run transaction /IWFND/ERROR_LOG on SAP Gateway hub system and search for entries with the timestamp above for more details",
							SAP_Note: "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)"
						}
					}
				}
			};

			try {
				var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityTypeName);

				oPromise.done(function(oBusinessContexts) {
					oServer.restore();
					assert.deepEqual(oBusinessContexts, oExpectedResult);
				});

				oPromise.fail(function() {
					oServer.restore();
					assert.ok(false, "Should not run into fail branch");
				});

				oServer.requests[0].respond(404, {
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				}, JSON.stringify(oMockResponse));
			} catch (e) {
				oServer.restore();
				assert.ok(false, e);
			}
		});
	});

	QUnit.module("Interface Functions", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getTexts", function(assert) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.fl");
			var oGetTextStub = sandbox.stub(oResourceBundle, "getText").callsFake(function(sTextKey) {return sTextKey;});

			var mExpectedTexts = {
				tooltip: "BTN_FREP_CCF",
				headerText: "BUSINESS_CONTEXT_TITLE"
			};
			var mTexts = Access.getTexts();

			assert.equal(oGetTextStub.callCount, 2, "two texts were retrieved");
			assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
		});

		QUnit.test("isExtensibilityEnabled with empty string as component class name", function(assert) {
			sandbox.stub(Utils, "getComponentClassName").returns("");

			return Access.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, false, "the return value is false");
			});
		});

		QUnit.test("isExtensibilityEnabled with undefined as component class name", function(assert) {
			sandbox.stub(Utils, "getComponentClassName").returns();

			return Access.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, false, "the return value is false");
			});
		});

		QUnit.test("isExtensibilityEnabled with undefined as component class name", function(assert) {
			sandbox.stub(Utils, "getComponentClassName").returns("name");
			sandbox.stub(Settings, "getInstance").resolves({
				isModelS: function() {
					return true;
				}
			});

			return Access.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, true, "the function returns the value if isModelS");
			});
		});

		QUnit.test("onTriggerCreateExtensionData", function(assert) {
			var oHrefForExternalStub = sandbox.stub().returns("foo");
			sandbox.stub(Utils, "ifUShellContainerThen").callsFake(function(fnCallback) {
				fnCallback([{
					hrefForExternal: oHrefForExternalStub
				}]);
			});
			var oOpenNewWindowStub = sandbox.stub(Access, "openNewWindow");
			var oExtensibilityInfo = {
				extensionData: [
					{
						businessContext: "bar"
					},
					{
						businessContext: "foobar"
					}
				],
				serviceName: "name",
				serviceVersion: 1,
				entityType: "odata"
			};

			var oExpectedParams = {
				target: {
					semanticObject: "CustomField",
					action: "develop"
				},
				params: {
					businessContexts: ["bar", "foobar"],
					serviceName: "name",
					serviceVersion: 1,
					entityType: "odata"
				}
			};

			Access.onTriggerCreateExtensionData(oExtensibilityInfo);
			assert.deepEqual(oExpectedParams, oHrefForExternalStub.lastCall.args[0], "the function was called with the correct parameters");
			assert.equal("foo", oOpenNewWindowStub.lastCall.args[0], "the function was called with the correct parameters");
		});
	});

	QUnit.module("Given a complex test view with oData Model...", {
		before: function () {
			return XMLView.create({
				id: "idMain1",
				viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
			}).then(function(oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
				return this.oView.getController().isDataReady();
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		},
		after: function () {
			this.oView.destroy();
		}
	}, function() {
		QUnit.test("getExtensionData without BusinessContexts", function(assert) {
			var oGetBusinessContextsStub = sandbox.stub(Access, "getBusinessContexts").resolves();
			return Access.getExtensionData(this.oView.byId("EntityType01.Prop1")).then(function(oExtensionData) {
				assert.equal(oExtensionData, false, "the function returns false");
				assert.equal("/destinations/E91/sap/opu/odata/SAP/AdditionalElementsTest", oGetBusinessContextsStub.lastCall.args[0]);
				assert.equal("EntityType01", oGetBusinessContextsStub.lastCall.args[1]);
			});
		});

		QUnit.test("getExtensionData with BusinessContexts", function(assert) {
			var oGetBusinessContextsStub = sandbox.stub(Access, "getBusinessContexts").resolves({
				BusinessContexts: [{
					BusinessContext: "foo",
					BusinessContextDescription: "business-context-description"
				}],
				ServiceName: "name",
				ServiceVersion: "2"
			});
			var oExpectedResult = {
				extensionData: [{
					businessContext: "foo",
					description: "business-context-description"
				}],
				entityType: "EntityType01",
				serviceName: "name",
				serviceVersion: "2"
			};
			return Access.getExtensionData(this.oView.byId("EntityType01.Prop1")).then(function(oExtensionData) {
				assert.deepEqual(oExtensionData, oExpectedResult, "the function returns the Extension data");
				assert.equal(oGetBusinessContextsStub.callCount, 1, "the Business Contexts were retrieved");
			});
		});

		QUnit.test("getExtensionData with empty BusinessContexts", function(assert) {
			var oGetBusinessContextsStub = sandbox.stub(Access, "getBusinessContexts").resolves({
				BusinessContexts: []
			});
			return Access.getExtensionData(this.oView.byId("EntityType01.Prop1")).then(function(oExtensionData) {
				assert.equal(oExtensionData, false, "the function returns false");
				assert.equal(oGetBusinessContextsStub.callCount, 1, "the Business Contexts were retrieved");
			});
		});

		QUnit.test("getExtensionData with getBusinessContexts throwing an error", function(assert) {
			var oLogStub = sandbox.stub(Log, "error");
			var oError = Error("myError");
			oError.errorMessages = [
				{
					text: "a"
				},
				{
					text: "b"
				}
			];
			var oGetBusinessContextsStub = sandbox.stub(Access, "getBusinessContexts").rejects(oError);
			return Access.getExtensionData(this.oView.byId("EntityType01.Prop1")).then(function(oExtensionData) {
				assert.ok(true, "the function resolves");
				assert.equal(oExtensionData, false, "the function returns false");
				assert.equal(oGetBusinessContextsStub.callCount, 1, "the Business Contexts were retrieved");
				assert.equal(oLogStub.callCount, 2, "two errors was logged");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});