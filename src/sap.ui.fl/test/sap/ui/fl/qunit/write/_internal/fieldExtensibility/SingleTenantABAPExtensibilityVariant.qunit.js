/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/SingleTenantABAPExtensibilityVariant",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	SingleTenantABAPExtensibilityVariant,
	jQuery,
	sinon
) {
	"use strict";

	QUnit.module("SingleTenantABAPExtensibilityVariant", {
		mBindingInfo: {
			entitySetName: "BusinessPartner",
			entityTypeName: "BusinessPartnerType"
		},
		mServiceInfo: {
			serviceName: "C_CFDTSM_BUPA",
			serviceVersion: "0001",
			serviceType: "v2"
		},
		oCrossApp: null,
		oGetTextStub: null,
		oSandbox: null,
		oServer: null,

		before: function() {
			this.oCrossApp = {
				mIntents: {},
				hrefForExternal: function(mIntentWithParameter) {
					return JSON.stringify(mIntentWithParameter);
				},
				isNavigationSupported: function(aIntents) {
					var aResults = aIntents.map(function(oIntent) {
						return {
							supported: this.mIntents[oIntent.semanticObject] || false
						};
					}.bind(this));
					return Promise.resolve(aResults);
				}
			};
			this.oSandbox = sinon.createSandbox();
		},

		beforeEach: function () {
			this.oGetTextStub = this.oSandbox.stub(Utils, "getText").callsFake(function(sTextKey) {
				return sTextKey;
			});
			this.oSandbox.stub(Utils, "getCrossAppNavigationService").returns(Promise.resolve(this.oCrossApp));

			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
		},

		afterEach: function() {
			this.oSandbox.restore();
			this.oServer.restore();
		}
	}, function() {
		QUnit.test("Missing authorization", function(assert) {
			var aPromises = [];
			var done = assert.async();

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}]
				}
			}));

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null);
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null);
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null);
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

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, [400, { "Content-Type": "application/json" }, JSON.stringify({
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

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

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

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, [400, { "Content-Type": "application/json" }, JSON.stringify({
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

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			var mServiceInfo = {
				serviceName: "C_CFDTSM_BUPA",
				serviceVersion: "0001",
				serviceType: "v4"
			};
			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null);
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null);
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null);
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

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: []
				}
			}));

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null);
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null);
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null);
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

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}]
				}
			}));

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, {
					extensionData: [{
						businessContext: "CFD_TSM_BUPA_ADR",
						description: "Description for CFD_TSM_BUPA_ADR"
					}]
				});
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var mIntentWithParameter = {
					target: {
						semanticObject: "CustomField",
						action: "develop"
					},
					params: {
						businessContexts: ["CFD_TSM_BUPA_ADR"],
						serviceVersion: "0001",
						serviceName: "C_CFDTSM_BUPA",
						entityType: "BusinessPartnerType"
					}
				};
				assert.equal(sNavigationUri, JSON.stringify(mIntentWithParameter));
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				var mExpectedTexts = {
					tooltip: "BTN_FREP_CCF",
					headerText: "BUSINESS_CONTEXT_TITLE"
				};

				assert.equal(this.oGetTextStub.callCount, 2, "two texts were retrieved");
				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
			}.bind(this)));

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

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR",
						SupportsLogicEnhancements: true,
						SupportsStructuralEnhancements: true
					}]
				}
			}));

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, {
					extensionData: [{
						businessContext: "CFD_TSM_BUPA_ADR",
						description: "Description for CFD_TSM_BUPA_ADR"
					}]
				});
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var mIntentWithParameter = {
					target: {
						semanticObject: "CustomField",
						action: "develop"
					},
					params: {
						businessContexts: ["CFD_TSM_BUPA_ADR"],
						serviceVersion: "0001",
						serviceName: "C_CFDTSM_BUPA",
						entityType: "BusinessPartnerType"
					}
				};
				assert.equal(sNavigationUri, JSON.stringify(mIntentWithParameter));
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				var mExpectedTexts = {
					tooltip: "BTN_FREP_CCF",
					headerText: "BUSINESS_CONTEXT_TITLE"
				};

				assert.equal(this.oGetTextStub.callCount, 2, "two texts were retrieved");
				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
			}.bind(this)));

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

		QUnit.test("Fields only", function(assert) {
			var aPromises = [];
			var done = assert.async();

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR",
						SupportsLogicEnhancements: false,
						SupportsStructuralEnhancements: true
					}]
				}
			}));

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, {
					extensionData: [{
						businessContext: "CFD_TSM_BUPA_ADR",
						description: "Description for CFD_TSM_BUPA_ADR"
					}]
				});
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var mIntentWithParameter = {
					target: {
						semanticObject: "CustomField",
						action: "manage"
					},
					params: {
						businessContexts: ["CFD_TSM_BUPA_ADR"],
						serviceVersion: "0001",
						serviceName: "C_CFDTSM_BUPA",
						entityType: "BusinessPartnerType"
					}
				};
				assert.equal(sNavigationUri, JSON.stringify(mIntentWithParameter));
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				var mExpectedTexts = {
					tooltip: "BTN_ADD_FIELD",
					headerText: "BUSINESS_CONTEXT_TITLE"
				};

				assert.equal(this.oGetTextStub.callCount, 2, "two texts were retrieved");
				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
			}.bind(this)));

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

		QUnit.test("Logic only", function(assert) {
			var aPromises = [];
			var done = assert.async();

			this.oCrossApp.mIntents = {
				CustomLogic: true
			};

			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR",
						SupportsLogicEnhancements: true,
						SupportsStructuralEnhancements: false
					}]
				}
			}));

			var oInstance = new SingleTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, {
					extensionData: [{
						businessContext: "CFD_TSM_BUPA_ADR",
						description: "Description for CFD_TSM_BUPA_ADR"
					}]
				});
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var mIntentWithParameter = {
					target: {
						semanticObject: "CustomLogic",
						action: "maintain"
					},
					params: {
						businessContexts: ["CFD_TSM_BUPA_ADR"],
						serviceVersion: "0001",
						serviceName: "C_CFDTSM_BUPA",
						entityType: "BusinessPartnerType"
					}
				};
				assert.equal(sNavigationUri, JSON.stringify(mIntentWithParameter));
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				var mExpectedTexts = {
					tooltip: "BTN_ADD_LOGIC",
					headerText: "BUSINESS_CONTEXT_TITLE"
				};

				assert.equal(this.oGetTextStub.callCount, 2, "two texts were retrieved");
				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
			}.bind(this)));

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
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});