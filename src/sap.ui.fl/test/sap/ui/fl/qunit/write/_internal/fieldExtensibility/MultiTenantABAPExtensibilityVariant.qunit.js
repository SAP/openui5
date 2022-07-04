/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/MultiTenantABAPExtensibilityVariant",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	MultiTenantABAPExtensibilityVariant,
	FlexUtils,
	sinon
) {
	"use strict";

	QUnit.module("MultiTenantABAPExtensibilityVariant", {
		mBindingInfo: {
			entitySetName: "C_CFDTSM_BUPA",
			entityTypeName: "C_CFDTSM_BUPAType"
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
		sServiceUri: "/sap/opu/odata/sap/C_CFDTSM_BUPA/",

		before: function() {
			this. oCrossApp = {
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
			this.oSandbox.stub(FlexUtils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve(this.oCrossApp));
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
			this.oServer.respondWith("GET", /.*GetExtensionDataByResourcePath.*/, JSON.stringify({
				d: {
					GetExtensionDataByResourcePath: {
						BusinessObjectNodeName: "SomeNodeName",
						BusinessObjectNodeDescription: "SomeNodeDescription"
					}
				}
			}));

			var oInstance = new MultiTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "Extension data");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				assert.equal(sNavigationUri, null, "Navigation uri");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				assert.equal(mTexts, null, "Get texts");
			}));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, false, "Is active");
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
			this.oCrossApp.mIntents = {
				PredefinedCustomField: true
			};

			var oInstance = new MultiTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData());
			aPromises.push(oInstance.getNavigationUri());
			aPromises.push(oInstance.getTexts());
			aPromises.push(oInstance.isActive());

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "rejected", "Error raised");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Positive test", function(assert) {
			var aPromises = [];
			var done = assert.async();
			this.oCrossApp.mIntents = {
				PredefinedCustomField: true
			};

			this.oServer.respondWith("GET", /.*GetExtensionDataByResourcePath.*/, JSON.stringify({
				d: {
					GetExtensionDataByResourcePath: {
						BusinessObjectNodeName: "SomeNodeName",
						BusinessObjectNodeDescription: "SomeNodeDescription",
						CdsEntityName: "SomeCdsEntity"
					}
				}
			}));

			var oInstance = new MultiTenantABAPExtensibilityVariant(this.sServiceUri, this.mServiceInfo, this.mBindingInfo);

			aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
				assert.propEqual(mExtensionData, {
					extensionData: [{
						businessContext: "SomeNodeName",
						description: "SomeNodeDescription"
					}]
				}, "Extension data");
			}));

			aPromises.push(oInstance.getNavigationUri().then(function(sNavigationUri) {
				var mIntentWithParameter = {
					target: {
						semanticObject: "PredefinedCustomField",
						action: "configure"
					},
					params: {
						businessObjectNodeName: "SomeNodeName",
						cdsEntityName: "SomeCdsEntity",
						serviceVersion: "0001",
						serviceName: "C_CFDTSM_BUPA"
					}
				};
				assert.equal(sNavigationUri, JSON.stringify(mIntentWithParameter), "Navigation uri");
			}));

			aPromises.push(oInstance.getTexts().then(function(mTexts) {
				var mExpectedTexts = {
					tooltip: "BTN_ADD_FIELD",
					headerText: "BUSINESS_OBJECT_NODE_TITLE"
				};

				assert.equal(this.oGetTextStub.callCount, 2, "two texts were retrieved");
				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
			}.bind(this)));

			aPromises.push(oInstance.isActive().then(function(bIsActive) {
				assert.equal(bIsActive, true, "Is active");
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