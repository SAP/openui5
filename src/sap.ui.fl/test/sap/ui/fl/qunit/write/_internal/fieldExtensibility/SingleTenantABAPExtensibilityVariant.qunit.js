/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/SingleTenantABAPExtensibilityVariant",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	SingleTenantABAPExtensibilityVariant,
	sinon
) {
	"use strict";

	var mBindingInfo = {
		entitySetName: "BusinessPartner",
		entityTypeName: "BusinessPartnerType"
	};
	var mServiceInfo = {
		serviceName: "C_CFDTSM_BUPA",
		serviceVersion: "0001",
		serviceType: "v2"
	};
	var mExpectedExtensionData = {
		extensionData: [{
			businessContext: "CFD_TSM_BUPA_ADR",
			description: "Description for CFD_TSM_BUPA_ADR"
		}]
	};
	var mExpectedTexts = {
		CustomFields: {
			tooltip: "BTN_CREATE_CUSTOM_FIELD",
			headerText: "BUSINESS_CONTEXT_TITLE",
			buttonText: "BTN_CREATE_CUSTOM_FIELD",
			options: [
				{
					actionKey: "CUSTOM_FIELD",
					text: "BTN_CREATE_CUSTOM_FIELD",
					tooltip: "BTN_CREATE_CUSTOM_FIELD"
				}
			]
		},
		CustomLogic: {
			tooltip: "BTN_CREATE_CUSTOM_LOGIC",
			headerText: "BUSINESS_CONTEXT_TITLE",
			buttonText: "BTN_CREATE_CUSTOM_LOGIC",
			options: [
				{
					actionKey: "CUSTOM_LOGIC",
					text: "BTN_CREATE_CUSTOM_LOGIC",
					tooltip: "BTN_CREATE_CUSTOM_LOGIC"
				}
			]
		},
		CustomFieldsAndLogic: {
			tooltip: "BTN_FREP_CCF",
			headerText: "BUSINESS_CONTEXT_TITLE",
			buttonText: "BTN_CREATE",
			options: [
				{
					actionKey: "CUSTOM_FIELD",
					text: "BTN_MENU_CREATE_CUSTOM_FIELD",
					tooltip: "BTN_MENU_CREATE_CUSTOM_FIELD"
				},
				{
					actionKey: "CUSTOM_LOGIC",
					text: "BTN_MENU_CREATE_CUSTOM_LOGIC",
					tooltip: "BTN_MENU_CREATE_CUSTOM_LOGIC"
				}
			]
		}
	};
	var mExpectedNavigationParams = {
		businessContexts: ["CFD_TSM_BUPA_ADR"],
		serviceVersion: "0001",
		serviceName: "C_CFDTSM_BUPA",
		entityType: "BusinessPartnerType"
	};
	var mExpectedIntentWithParameter = {
		CustomFields: {
			target: {
				semanticObject: "CustomField",
				action: "manage"
			},
			params: mExpectedNavigationParams
		},
		CustomLogic: {
			target: {
				semanticObject: "CustomLogic",
				action: "develop"
			},
			params: mExpectedNavigationParams
		},
		CustomFieldsAndLogic: {
			target: {
				semanticObject: "CustomField",
				action: "develop"
			},
			params: mExpectedNavigationParams
		}
	};
	var mGivenBusinessContextResult = {
		CustomFields: [{
			BusinessContext: "CFD_TSM_BUPA_ADR",
			BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR",
			SupportsLogicEnhancements: false,
			SupportsStructuralEnhancements: true
		}],
		CustomLogic: [{
			BusinessContext: "CFD_TSM_BUPA_ADR",
			BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR",
			SupportsLogicEnhancements: true,
			SupportsStructuralEnhancements: false
		}],
		CustomFieldsAndLogic: [{
			BusinessContext: "CFD_TSM_BUPA_ADR",
			BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR",
			SupportsLogicEnhancements: true,
			SupportsStructuralEnhancements: true
		}]
	};
	var mGivenAuthorizationForIntents = {
		All: [true, true],
		CustomFieldsAndLogic: [true, true],
		CustomFields: [true, false],
		CustomLogic: [false, true],
		NoFields: [false, true],
		NoLogic: [true, false],
		None: [false, false]
	};
	var oSandbox = null;
	var oServer = null;
	var sServiceUri = null;

	QUnit.module("SingleTenantABAPExtensibilityVariant", {
		before() {
			oSandbox = sinon.createSandbox();
		},

		beforeEach() {
			oSandbox.stub(Utils, "getText").callsFake(function(sTextKey) {
				return sTextKey;
			});
			oSandbox.stub(Utils, "getNavigationUriForIntent").callsFake(function(mIntentWithParameter) {
				return JSON.stringify(mIntentWithParameter);
			});

			oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
		},

		afterEach() {
			oSandbox.restore();
			oServer.restore();
		}
	}, function() {
		QUnit.test("Server error", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, [400, { "Content-Type": "application/json" }, JSON.stringify({
				error: {
					code: "005056A509B11EE1B9A8FEC11C21578E",
					message: {
						lang: "en",
						value: "Invalid Function Import Parameter"
					},
					innererror: {
						transactionid: "54E429A74593458DE10000000A420908",
						timestamp: "20150219074515.1395610"
					}
				}
			})]);
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData());
			aPromises.push(oInstance.getNavigationUri());
			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD"));
			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC"));
			aPromises.push(oInstance.getTexts());
			aPromises.push(oInstance.isActive());

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "rejected", "Error raised");
					var oExpectedError = {
						errorOccurred: true,
						errorMessages: [{
							severity: "error",
							text: "Invalid Function Import Parameter"
						}],
						statusCode: 400
					};
					assert.propEqual(oResult.reason, oExpectedError);
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Server error - v4 service", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, [400, { "Content-Type": "application/json" }, JSON.stringify({
				error: {
					code: "005056A509B11EE1B9A8FEC11C21578E",
					message: {
						lang: "en",
						value: "Invalid Function Import Parameter"
					},
					innererror: {
						transactionid: "54E429A74593458DE10000000A420908",
						timestamp: "20150219074515.1395610"
					}
				}
			})]);
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var mServiceInfo = {
				serviceName: "C_CFDTSM_BUPA",
				serviceVersion: "0001",
				serviceType: "v4"
			};
			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Old backend", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}]
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFieldsAndLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - all authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFieldsAndLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.All);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFieldsAndLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - fields and logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFieldsAndLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFieldsAndLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - fields authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFieldsAndLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFields);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - no logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFieldsAndLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFields);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFieldsAndLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - no fields authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFieldsAndLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic business context - no authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}]
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.None);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - all authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.All);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - fields and logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - fields authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFields);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - no logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.NoLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomFields);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - no fields authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.NoFields);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields business context - no authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomFields
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.None);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - all authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.All);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - fields and logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - fields authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFields);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - no logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.NoLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - logic authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - no fields authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.NoFields);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, mExpectedExtensionData, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				var sExpected = JSON.stringify(mExpectedIntentWithParameter.CustomLogic);
				assert.equal(sNavigationUri, sExpected, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic business context - no authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: mGivenBusinessContextResult.CustomLogic
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.None);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("No business context - all authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: []
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.All);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_FIELD").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getNavigationUri("CUSTOM_LOGIC").then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});