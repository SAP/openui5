/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariantFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	ABAPExtensibilityVariantFactory,
	sinon
) {
	"use strict";

	QUnit.module("ABAPExtensibilityVariantFactory", {
		oSandbox: sinon.createSandbox(),
		oServer: null,
		oControl: {
			getBindingContext: function() {
				return {
					getPath: function() {
						return "/someService/someEntity";
					}
				};
			},
			getModel: function() {
				return {
					sServiceUrl: "/someService",
					oMetadata: {
						_getEntitySetByPath: function() {
							return {
								name: "someEntity"
							};
						},
						_getEntityTypeByPath: function() {
							return {
								name: "someEntityType"
							};
						}
					},
					metadataLoaded: function() {
						return Promise.resolve();
					},
					isA: function() {
						return true;
					}
				};
			}
		},
		oCrossApp: {
			mIntents: {},
			isNavigationSupported: function(aIntents) {
				var aResults = aIntents.map(function(oIntent) {
					return {
						supported: this.mIntents[oIntent.semanticObject] || false
					};
				}.bind(this));
				return Promise.resolve(aResults);
			}
		},
		beforeEach: function () {
			this.oSandbox.stub(Utils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve(this.oCrossApp));
			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
		},
		afterEach: function() {
			this.oSandbox.restore();
			this.oServer.restore();
			ABAPExtensibilityVariantFactory.reset();
		}
	}, function() {
		QUnit.test("No Control", function(assert) {
			var aPromises = [];
			var done = assert.async();

			var oControl = null;

			aPromises.push(ABAPExtensibilityVariantFactory.getInstance(oControl).then(function(oInstance) {
				assert.ok(oInstance.getMetadata().isA("sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariant"));

				aPromises.push(oInstance.getExtensionData().then(function(mExtensionData) {
					assert.equal(mExtensionData, null, "No data expected");
				}));

				aPromises.push(ABAPExtensibilityVariantFactory.getInstance().then(function(oInstance2) {
					assert.equal(oInstance2, oInstance, "Same instance expected");
				}));

				aPromises.push(ABAPExtensibilityVariantFactory.getInstance(oControl).then(function(oInstance3) {
					assert.equal(oInstance3, oInstance, "Same instance expected");
				}));
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Custom Fields", function(assert) {
			var aPromises = [];
			var done = assert.async();

			this.oCrossApp.mIntents = {
				CustomField: true
			};

			this.oServer.respondWith("GET", "", JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}]
				}
			}));

			aPromises.push(ABAPExtensibilityVariantFactory.getInstance(this.oControl).then(function(oInstance) {
				assert.ok(oInstance.getMetadata().isA("sap.ui.fl.write._internal.fieldExtensibility.SingleTenantABAPExtensibilityVariant"));

				aPromises.push(ABAPExtensibilityVariantFactory.getInstance(this.oControl).then(function(oInstance2) {
					assert.equal(oInstance2, oInstance, "Same instance expected");
				}));
			}.bind(this)));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Predefined Fields", function(assert) {
			var aPromises = [];
			var done = assert.async();

			this.oCrossApp.mIntents = {
				PredefinedCustomField: true
			};

			this.oServer.respondWith("GET", "", JSON.stringify({
				d: {
					GetExtensionDataByResourcePath: {
						BusinessObjectNodeName: "SomeNodeName",
						BusinessObjectNodeDescription: "SomeNodeDescription",
						CdsEntityName: "SomeCdsEntity"
					}
				}
			}));

			aPromises.push(ABAPExtensibilityVariantFactory.getInstance(this.oControl).then(function(oInstance) {
				assert.ok(oInstance.getMetadata().isA("sap.ui.fl.write._internal.fieldExtensibility.MultiTenantABAPExtensibilityVariant"));
			}));

			this.oCrossApp.aIntents = {
				PredefinedCustomField: true,
				CustomField: true
			};

			aPromises.push(ABAPExtensibilityVariantFactory.getInstance(this.oControl).then(function(oInstance) {
				assert.ok(oInstance.getMetadata().isA("sap.ui.fl.write._internal.fieldExtensibility.MultiTenantABAPExtensibilityVariant"));


				aPromises.push(ABAPExtensibilityVariantFactory.getInstance(this.oControl).then(function(oInstance2) {
					assert.equal(oInstance2, oInstance, "Same instance expected");
				}));
			}.bind(this)));

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