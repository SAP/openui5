/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	FeaturesAPI,
	Settings,
	FlexConfiguration,
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

				sandbox.stub(Utils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve("DummyService"));

				return FeaturesAPI.isSaveAsAvailable(Layer.CUSTOMER).then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isSaveAsAvailable() is called for ${bValueToBeSet ? "not a" : "a"} steampunk system and standalone app without CrossApplicationNavigation service`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isAppVariantSaveAsEnabled() {
						return bValueToBeSet;
					}
				});

				sandbox.stub(Utils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.reject("DummyService"));

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

			/**
			 * @deprecated Since version 1.108
			 */
			QUnit.test(`given isContextSharingEnabled is called for all existing layer in a${bValueToBeSet ? "n ABAP system" : " non ABAP system"}`, function(assert) {
				sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
					bValueToBeSet ? {connector: "LrepConnector"} : {connector: "NeoLrepConnector"}
				]);
				sandbox.stub(Settings, "getInstance").resolves({
					isContextSharingEnabled() {
						return bValueToBeSet;
					}
				});

				var aSetupForLayers = [];
				for (var layer in Layer) {
					aSetupForLayers.push({
						layer,
						expectedResult: (layer === Layer.CUSTOMER && bValueToBeSet) // only the ABAP Key USer should have the feature
					});
				}

				return Promise.all(aSetupForLayers.map(function(oSetup) {
					return FeaturesAPI.isContextSharingEnabled(oSetup.layer).then(function(bContextSharingEnabled) {
						assert.equal(bContextSharingEnabled, oSetup.expectedResult, `then the returned flag is correct for layer ${oSetup.layer}`);
					});
				}));
			});
		});
	});
});