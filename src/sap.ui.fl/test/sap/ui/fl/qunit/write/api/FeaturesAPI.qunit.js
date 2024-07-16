/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	FeaturesAPI,
	Settings,
	Storage,
	Layer,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given FeaturesAPI", {
		afterEach() {
			Settings._instance = undefined;
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach(function(bValueToBeSet) {
			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system with transports and no publish available info`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem() {
						return bValueToBeSet;
					},
					isSystemWithTransports() {
						return true;
					},
					isPublishAvailable() {
						return false;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, !bValueToBeSet, `then ${!bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system without transports and no publish available info`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem() {
						return bValueToBeSet;
					},
					isSystemWithTransports() {
						return false;
					},
					isPublishAvailable() {
						return false;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function(bReturnValue) {
					assert.notOk(bReturnValue, "then false is returned");
				});
			});

			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system with transports and publish available info`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem() {
						return bValueToBeSet;
					},
					isSystemWithTransports() {
						return true;
					},
					isPublishAvailable() {
						return true;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function(bReturnValue) {
					assert.ok(bReturnValue, "then true is returned");
				});
			});

			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system without transports and publish available info`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem() {
						return bValueToBeSet;
					},
					isSystemWithTransports() {
						return false;
					},
					isPublishAvailable() {
						return true;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function(bReturnValue) {
					assert.ok(bReturnValue, "then true is returned");
				});
			});

			QUnit.test(`when isSaveAsAvailable() is called for ${bValueToBeSet ? "not a" : "a"} steampunk system`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isAppVariantSaveAsEnabled() {
						return bValueToBeSet;
					}
				});

				sandbox.stub(Utils, "getUShellService").withArgs("Navigation").returns(Promise.resolve("DummyService"));

				return FeaturesAPI.isSaveAsAvailable(Layer.CUSTOMER).then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isSaveAsAvailable() is called for ${bValueToBeSet ? "not a" : "a"} steampunk system and standalone app without Navigation service`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isAppVariantSaveAsEnabled() {
						return bValueToBeSet;
					}
				});

				sandbox.stub(Utils, "getUShellService").withArgs("Navigation").returns(Promise.reject("DummyService"));

				return FeaturesAPI.isSaveAsAvailable(Layer.CUSTOMER).then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, false, "then false is returned");
				});
			});

			QUnit.test(`when isKeyUser() is called for ${bValueToBeSet ? "a" : "not a"} key user`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isKeyUser() {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isKeyUser()
				.then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isKeyUserTranslationEnabled() is called for ${bValueToBeSet ? "a" : "not a"} admin key user`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isKeyUserTranslationEnabled() {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isKeyUserTranslationEnabled(Layer.CUSTOMER)
				.then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isVersioningEnabled(sLayer) is called in a ${
				bValueToBeSet ? "draft enabled" : "non draft enabled"} layer`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isVersioningEnabled() {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isVersioningEnabled(Layer.CUSTOMER)
				.then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when getSeenFeatureIds is called with the feature ${bValueToBeSet ? "enabled" : "disabled"}`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isSeenFeaturesAvailable() {
						return bValueToBeSet;
					}
				});
				const oStorageStub = sandbox.stub(Storage, "getSeenFeatureIds").resolves(["feature1"]);
				const oSeenFeatures = await FeaturesAPI.getSeenFeatureIds({layer: Layer.CUSTOMER});
				assert.deepEqual(oSeenFeatures, bValueToBeSet ? ["feature1"] : [], "then the correct seen features are returned");
				if (bValueToBeSet) {
					assert.strictEqual(oStorageStub.getCall(0).args[0].layer, Layer.CUSTOMER, "the correct layer is passed");
				}
			});

			QUnit.test(`when setSeenFeatureIds is called with the feature ${bValueToBeSet ? "enabled" : "disabled"}`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isSeenFeaturesAvailable() {
						return bValueToBeSet;
					}
				});
				const oStorageStub = sandbox.stub(Storage, "setSeenFeatureIds").resolves(["feature1"]);
				let oResult;
				try {
					oResult = await FeaturesAPI.setSeenFeatureIds({
						layer: Layer.CUSTOMER,
						seenFeatureIds: ["feature1"]
					});
				} catch (oError) {
					oResult = oError;
				}
				assert.deepEqual(oResult,
					bValueToBeSet ? ["feature1"] : "The backend does not support saving seen features.",
					"then the correct seen features are returned"
				);
				if (bValueToBeSet) {
					assert.strictEqual(oStorageStub.getCall(0).args[0].layer, Layer.CUSTOMER, "the correct layer is passed");
					assert.deepEqual(oStorageStub.getCall(0).args[0].seenFeatureIds, ["feature1"], "the correct list is passed");
				}
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});