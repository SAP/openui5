/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	FeaturesAPI,
	Settings,
	Layer,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given FeaturesAPI", {
		afterEach: function () {
			Settings._instance = undefined;
			sandbox.restore();
		}
	}, function () {
		[true, false].forEach(function (bValueToBeSet) {
			QUnit.test("when isPublishAvailable() is called for " + (bValueToBeSet ? "a" : "not a") + " productive system with transports", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem: function () {
						return bValueToBeSet;
					},
					isSystemWithTransports: function() {
						return true;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function (bReturnValue) {
					assert.strictEqual(bReturnValue, !bValueToBeSet, "then " + !bValueToBeSet + " is returned");
				});
			});

			QUnit.test("when isPublishAvailable() is called for " + (bValueToBeSet ? "a" : "not a") + " productive system without transports", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isProductiveSystem: function () {
						return bValueToBeSet;
					},
					isSystemWithTransports: function() {
						return false;
					}
				});

				return FeaturesAPI.isPublishAvailable().then(function (bReturnValue) {
					assert.notOk(bReturnValue, "then false is returned");
				});
			});

			QUnit.test("when isSaveAsAvailable() is called for " + (bValueToBeSet ? "not a" : "a") + " steampunk system", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isAppVariantSaveAsEnabled: function () {
						return bValueToBeSet;
					}
				});

				sap["ushell_abap"] = Object.assign({}, sap.ushell_abap, { /* gravity todo */
					someKey: "someValue"
				});

				return FeaturesAPI.isSaveAsAvailable(Layer.CUSTOMER).then(function (bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, "then " + bValueToBeSet + " is returned");
				});
			});

			QUnit.test("when isKeyUser() is called for " + (bValueToBeSet ? "a" : "not a") + " key user", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isKeyUser: function () {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isKeyUser()
					.then(function (bReturnValue) {
						assert.strictEqual(bReturnValue, bValueToBeSet, "then " + bValueToBeSet + " is returned");
					});
			});

			QUnit.test("when isKeyUserTranslationEnabled() is called for " + (bValueToBeSet ? "a" : "not a") + " admin key user", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isKeyUserTranslationEnabled: function () {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isKeyUserTranslationEnabled(Layer.CUSTOMER)
				.then(function (bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, "then " + bValueToBeSet + " is returned");
				});
			});

			QUnit.test("when isVersioningEnabled(sLayer) is called in a " +
					(bValueToBeSet ? "draft enabled" : "non draft enabled") + " layer", function (assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					isVersioningEnabled: function () {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isVersioningEnabled(Layer.CUSTOMER)
					.then(function (bReturnValue) {
						assert.strictEqual(bReturnValue, bValueToBeSet, "then " + bValueToBeSet + " is returned");
					});
			});

			QUnit.test("given isContextSharingEnabled is called for all existing layer in a" + (bValueToBeSet ? "n ABAP system" : " non ABAP system"), function (assert) {
				sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
					bValueToBeSet ? {connector: "LrepConnector"} : {connector: "NeoLrepConnector"}
				]);

				var aSetupForLayers = [];
				for (var layer in Layer) {
					aSetupForLayers.push({
						layer: layer,
						expectedResult: (layer === Layer.CUSTOMER && bValueToBeSet) // only the ABAP Key USer should have the feature
					});
				}

				return Promise.all(aSetupForLayers.map(function (oSetup) {
					return FeaturesAPI.isContextSharingEnabled(oSetup.layer).then(function (bContextSharingEnabled) {
						assert.equal(bContextSharingEnabled, oSetup.expectedResult, "then the returned flag is correct for layer " + oSetup.layer);
					});
				}));
			});
		});
	});
});