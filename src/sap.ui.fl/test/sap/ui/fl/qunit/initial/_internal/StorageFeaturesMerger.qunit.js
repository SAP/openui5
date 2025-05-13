/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/initial/_internal/StorageFeaturesMerger",
	"sap/base/Log"
], function(
	sinon,
	Layer,
	StorageFeaturesMerger,
	Log
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Basic functions", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("mergeResults with empty aResponse", function(assert) {
			var DEFAULT_FEATURES = {
				isKeyUser: false,
				isKeyUserTranslationEnabled: false,
				isVariantSharingEnabled: false,
				isContextSharingEnabled: true,
				isPublicFlVariantEnabled: false,
				isVariantPersonalizationEnabled: true,
				isAtoAvailable: false,
				isAtoEnabled: false,
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isLocalResetEnabled: false,
				versioning: {},
				isZeroDowntimeUpgradeRunning: false,
				isVariantAuthorNameAvailable: false,
				system: "",
				client: ""
			};
			var aResponse = [];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.deepEqual(oResult, DEFAULT_FEATURES, "get default values");
		});

		QUnit.test("mergeResults with different responses", function(assert) {
			var oResponse1 = {
				layers: [],
				features: {isProductiveSystem: false, isVariantAuthorNameAvailable: true}
			};
			var oResponse2 = {
				layers: [Layer.CUSTOMER],
				features: {isAtoAvailable: true, isKeyUser: true, isKeyUserTranslationEnabled: true},
				isContextSharingEnabled: true
			};
			var oResponse3 = {
				layers: [],
				features: {newKey: true}
			};
			var aResponse = [oResponse1, oResponse2, oResponse3];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.equal(oResult.newKey, true, "get new key");
			assert.equal(oResult.isKeyUser, true, "last isKeyuser is true");
			assert.equal(oResult.isAtoAvailable, true, "isAtoAvailable to true");
			assert.equal(oResult.isProductiveSystem, false, "isProductiveSystem is false");
			assert.equal(oResult.isKeyUserTranslationEnabled, true, "isKeyUserTranslationEnabled is true");
			assert.equal(oResult.isContextSharingEnabled, true, "isContextSharingEnabled is true");
			assert.equal(oResult.isVariantAuthorNameAvailable, true, "isVariantAuthorNameAvailable is true");
		});

		QUnit.test("mergeResults handles the versioning flags", function(assert) {
			var oResponse1 = {
				layers: [Layer.VENDOR, Layer.CUSTOMER_BASE],
				features: {isVersioningEnabled: false}
			};
			var oResponse2 = {
				layers: [Layer.CUSTOMER],
				features: {isVersioningEnabled: true}
			};
			var oResponse3 = {
				layers: [Layer.USER],
				features: {isVersioningEnabled: false}
			};
			var aResponse = [oResponse1, oResponse2, oResponse3];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse);

			assert.equal(oResult.versioning.VENDOR, undefined);
			assert.equal(oResult.versioning.CUSTOMER_BASE, undefined);
			assert.equal(oResult.versioning.PARTNER, undefined);
			assert.equal(oResult.versioning.CUSTOMER, true);
			assert.equal(oResult.versioning.USER, undefined);
		});
	});

	QUnit.module("Layer specific handling if isKeyUser", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		[{
			description: "no layer are configured and ",
			expectedLogs: 0,
			connectors: [{
				layers: [],
				isKeyUser: undefined
			}],
			expectedValue: false
		}, {
			description: "no CUSTOMER layer",
			expectedLogs: 0,
			connectors: [{
				layers: [],
				isKeyUser: undefined
			}],
			expectedValue: false
		}, {
			description: "the CUSTOMER layer configured",
			expectedLogs: 0,
			connectors: [{
				layers: [Layer.CUSTOMER_BASE, Layer.CUSTOMER, Layer.PUBLIC, Layer.USER],
				isKeyUser: undefined
			}],
			expectedValue: false
		}, {
			description: "with layers configured to ALL",
			expectedLogs: 0,
			connectors: [{
				layers: ["ALL"],
				isKeyUser: undefined
			}],
			expectedValue: false
		}, {
			description: "no layer are configured and the key user flag is set to false",
			expectedLogs: 1,
			connectors: [{
				layers: [],
				isKeyUser: false
			}],
			expectedValue: false
		}, {
			description: "no CUSTOMER layer and the key user flag is set to false",
			expectedLogs: 1,
			connectors: [{
				layers: [Layer.CUSTOMER_BASE],
				isKeyUser: false
			}],
			expectedValue: false
		}, {
			description: "the CUSTOMER layer configured and the key user flag is set to false",
			expectedLogs: 0,
			connectors: [{
				layers: [Layer.CUSTOMER],
				isKeyUser: false
			}],
			expectedValue: false
		}, {
			description: "with layers configured to ALL and the key user flag is set to false",
			expectedLogs: 0,
			connectors: [{
				layers: ["ALL"],
				isKeyUser: false
			}],
			expectedValue: false
		}, {
			description: "no layer are configured and the key user flag is set to true",
			expectedLogs: 1,
			connectors: [{
				layers: [],
				isKeyUser: true
			}],
			expectedValue: false
		}, {
			description: "no CUSTOMER layer and the key user flag is set to true",
			expectedLogs: 1,
			connectors: [{
				layers: [Layer.CUSTOMER_BASE],
				isKeyUser: true
			}],
			expectedValue: false
		}, {
			description: "the CUSTOMER layer configured and the key user flag is set to true",
			expectedLogs: 0,
			connectors: [{
				layers: [Layer.CUSTOMER],
				isKeyUser: true
			}],
			expectedValue: true
		}, {
			description: "with layers configured to ALL and the key user flag is set to true",
			expectedLogs: 0,
			connectors: [{
				layers: ["ALL"],
				isKeyUser: true
			}],
			expectedValue: true
		}].forEach(function(oTestSetup) {
			QUnit.test(`merge handles the layer specific key user flag: ${oTestSetup.description}`, (assert) => {
				const oLogMock = sandbox.stub(Log, "warning");

				const aConnectors = oTestSetup.connectors.map((oConnector) => {
					const oFeatures = {};

					if (oConnector.isKeyUser !== undefined) {
						oFeatures.isKeyUser = oConnector.isKeyUser;
					}

					return {
						layers: oConnector.layers,
						features: oFeatures
					};
				});

				const oResult = StorageFeaturesMerger.mergeResults(aConnectors);

				assert.equal(oResult.isKeyUser, oTestSetup.expectedValue);
				assert.equal(oLogMock.callCount, oTestSetup.expectedLogs);
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
