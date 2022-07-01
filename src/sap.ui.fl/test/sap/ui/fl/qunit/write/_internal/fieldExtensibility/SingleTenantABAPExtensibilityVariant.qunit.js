/*global QUnit*/

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
			tooltip: "BTN_ADD_FIELD",
			headerText: "BUSINESS_CONTEXT_TITLE"
		},
		CustomLogic: {
			tooltip: "BTN_ADD_LOGIC",
			headerText: "BUSINESS_CONTEXT_TITLE"
		},
		CustomFieldsAndLogic: {
			tooltip: "BTN_FREP_CCF",
			headerText: "BUSINESS_CONTEXT_TITLE"
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
				action: "maintain"
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
		All: [true, true, true],
		CustomFields: [false, true, false],
		CustomLogic: [false, false, true],
		CustomFieldsAndLogic: [true, false, false],
		NoFields: [true, false, true],
		NoLogic: [true, true, false],
		None: [false, false, false]
	};
	var oSandbox = null;
	var oServer = null;
	var sServiceUri = null;

	QUnit.module("SingleTenantABAPExtensibilityVariant", {
		before: function() {
			oSandbox = sinon.createSandbox();
		},

		beforeEach: function () {
			oSandbox.stub(Utils, "getText").callsFake(function(sTextKey) {
				return sTextKey;
			});
			oSandbox.stub(Utils, "getNavigationUriForIntent").callsFake(function(mIntentWithParameter) {
				return JSON.stringify(mIntentWithParameter);
			});

			oServer = sinon.fakeServer.create();
			oServer.autoRespond = true;
		},

		afterEach: function() {
			oSandbox.restore();
			oServer.restore();
		}
	}, function() {
		QUnit.test("Missing authorization", function(assert) {
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

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

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
			aPromises.push(oInstance.getTexts());
			aPromises.push(oInstance.isActive());

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
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
				});
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

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("No business contexts", function(assert) {
			var aPromises = [];
			var done = assert.async();

			oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: []
				}
			}));
			oSandbox.stub(Utils, "isNavigationSupportedForIntents").resolves(mGivenAuthorizationForIntents.CustomFieldsAndLogic);

			var oInstance = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "Extension data is correct");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomFieldsAndLogic), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFieldsAndLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomFieldsAndLogic), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFieldsAndLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic - Fields authorization only", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomFields), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields and Logic - Logic authorization only", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomLogic), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields only - all but logic", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomFields), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields only - only fields", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomFields), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFields, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields only - only fields and logic", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomFieldsAndLogic), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomFieldsAndLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Fields only - Logic authorization only", function(assert) {
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

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic only", function(assert) {
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
				assert.equal(sNavigationUri, JSON.stringify(mExpectedIntentWithParameter.CustomLogic), "Navigation Uri is correct");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, mExpectedTexts.CustomLogic, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Logic only - Fields authorization only", function(assert) {
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

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.deepEqual(mTexts, null, "the correct texts were retrieved");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false);
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});