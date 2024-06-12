/* global QUnit */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Settings,
	Storage,
	Layer,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.registry.Settings", {
		beforeEach() {
			var oSettings = {
				isKeyUser: false,
				isAtoAvailable: false,
				isKeyUserTranslationEnabled: false,
				isAtoEnabled: false,
				isPublicLayerAvailable: false,
				isVariantPersonalizationEnabled: true,
				isAppVariantSaveAsEnabled: false,
				isContextSharingEnabled: false,
				isContextBasedAdaptationEnabled: false,
				isCondensingEnabled: false,
				isVariantAuthorNameAvailable: false,
				isSeenFeaturesAvailable: false,
				features: {
					addField: [Layer.CUSTOMER, Layer.VENDOR],
					changeTypeOnlyForUser: [Layer.USER],
					completelyDisabledChangeType: []
				}
			};
			this.cut = new Settings(oSettings);
		},
		afterEach() {
			Settings._instance = undefined;
			Settings._oLoadSettingsPromise = undefined;

			sandbox.restore();
		}
	}, function() {
		QUnit.test("init", function(assert) {
			assert.ok(this.cut._oSettings);
		});

		QUnit.test("isKeyUser", function(assert) {
			assert.equal(this.cut._oSettings.isKeyUser, false);
			var bIsKeyUser = this.cut.isKeyUser();
			assert.equal(bIsKeyUser, false);
		});

		QUnit.test("isKeyUserTranslationEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isKeyUserTranslationEnabled, false);
			var bIsKeyUserTranslationEnabled = this.cut.isKeyUserTranslationEnabled();
			assert.equal(bIsKeyUserTranslationEnabled, false);
		});

		QUnit.test("isAppVariantSaveAsEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isAppVariantSaveAsEnabled, false);
			var bIsAppVariantSaveAsEnabled = this.cut.isAppVariantSaveAsEnabled();
			assert.equal(bIsAppVariantSaveAsEnabled, false);
		});

		QUnit.test("isContextSharingEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isContextSharingEnabled, false);
			var bIsContextSharingEnabled = this.cut.isContextSharingEnabled();
			assert.equal(bIsContextSharingEnabled, false);
		});

		QUnit.test("isContextBasedAdaptationEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isContextBasedAdaptationEnabled, false);
			var bIsContextBasedAdaptationEnabled = this.cut.isContextBasedAdaptationEnabled();
			assert.equal(bIsContextBasedAdaptationEnabled, false);
		});

		QUnit.test("isCondensingEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isCondensingEnabled, false);
			var bIsCondensingEnabled = this.cut.isCondensingEnabled();
			assert.equal(bIsCondensingEnabled, false);
		});

		QUnit.test("isVariantAuthorNameAvailable", function(assert) {
			assert.equal(this.cut._oSettings.isVariantAuthorNameAvailable, false);
			var bIsVariantAuthorNameAvailable = this.cut.isVariantAuthorNameAvailable();
			assert.equal(bIsVariantAuthorNameAvailable, false);
		});

		QUnit.test("isModelS", function(assert) {
			assert.equal(this.cut._oSettings.isAtoAvailable, false);
			var bIsModelS = this.cut.isModelS();
			assert.equal(bIsModelS, false);
		});

		QUnit.test("isAtoEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isAtoEnabled, false);
			var bIsAtoEnabled = this.cut.isAtoEnabled();
			assert.equal(bIsAtoEnabled, false);
		});

		QUnit.test("variants sharing is set to false", function(assert) {
			var oSettings = {
				isVariantSharingEnabled: false
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut._oSettings.isVariantSharingEnabled, false);
			var bIsVariantSharingEnabled = this.cut.isVariantSharingEnabled();
			assert.equal(bIsVariantSharingEnabled, false);
		});

		QUnit.test("variants personalization is enabled by default", function(assert) {
			assert.equal(this.cut._oSettings.isVariantPersonalizationEnabled, true);
			var bIsVariantPersonalizationEnabled = this.cut.isVariantPersonalizationEnabled();
			assert.equal(bIsVariantPersonalizationEnabled, true);
		});

		QUnit.test("variants personalization is set to false", function(assert) {
			var oSettings = {
				isVariantPersonalizationEnabled: false
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut._oSettings.isVariantPersonalizationEnabled, false);
			var bIsVariantPersonalizationEnabled = this.cut.isVariantPersonalizationEnabled();
			assert.equal(bIsVariantPersonalizationEnabled, false);
		});

		QUnit.test("fl variants sharing is set to true", function(assert) {
			var oSettings = {
				isPublicFlVariantEnabled: true
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut._oSettings.isPublicFlVariantEnabled, true);
			var bIsPublicFlVariantEnabled = this.cut.isPublicFlVariantEnabled();
			assert.equal(bIsPublicFlVariantEnabled, true);
		});

		QUnit.test("fl variants sharing is set to false", function(assert) {
			var oSettings = {
				isPublicFlVariantEnabled: false
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut._oSettings.isPublicFlVariantEnabled, false);
			var bIsPublicFlVariantEnabled = this.cut.isPublicFlVariantEnabled();
			assert.equal(bIsPublicFlVariantEnabled, false);
		});

		QUnit.test("isPublicLayerAvailable is false by default", function(assert) {
			assert.equal(this.cut._oSettings.isPublicLayerAvailable, false);
			var bIsPublicLayerAvailable = this.cut.isPublicLayerAvailable();
			assert.equal(bIsPublicLayerAvailable, false);
		});

		QUnit.test("isSeenFeaturesAvailable is false by default", function(assert) {
			const bIsSeenFeaturesAvailable = this.cut.isSeenFeaturesAvailable();
			assert.equal(bIsSeenFeaturesAvailable, false);
		});

		QUnit.test("isSeenFeaturesAvailable is true", function(assert) {
			this.cut._oSettings.isSeenFeaturesAvailable = true;
			const bIsSeenFeaturesAvailable = this.cut.isSeenFeaturesAvailable();
			assert.equal(bIsSeenFeaturesAvailable, true);
		});

		QUnit.test("isPublicLayerAvailable is set to true", function(assert) {
			var oSettings = {
				isPublicLayerAvailable: true
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut._oSettings.isPublicLayerAvailable, true);
			var bIsPublicLayerAvailable = this.cut.isPublicLayerAvailable();
			assert.equal(bIsPublicLayerAvailable, true);
		});

		QUnit.test("getSystem returns undefined when no system info is maintained in the settings", function(assert) {
			assert.notOk(this.cut.getSystem());
		});

		QUnit.test("getSystem returns system info when it is maintained in the settings", function(assert) {
			var oSettings = {
				system: "someSystem"
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut.getSystem(), "someSystem");
		});

		QUnit.test("getClient returns undefined when no client info is maintained in the settings", function(assert) {
			assert.notOk(this.cut.getClient());
		});

		QUnit.test("getClient returns client info when it is maintained in the settings", function(assert) {
			var oSettings = {
				client: "someClient"
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut.getClient(), "someClient");
		});

		QUnit.test("isProductiveSystemWithTransports returns false when no system/client info is maintained in the settings", function(assert) {
			assert.equal(this.cut.isProductiveSystemWithTransports(), false);
		});

		QUnit.test("isProductiveSystemWithTransports returns false when system and client info are maintained in the settings but not on productive system", function(assert) {
			var oSettings = {
				client: "someClient",
				system: "someSystem",
				isProductiveSystem: false
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isProductiveSystemWithTransports(), false);
		});

		QUnit.test("isProductiveSystemWithTransports returns true when system and client info are maintained in the settings and on productive system", function(assert) {
			var oSettings = {
				client: "someClient",
				system: "someSystem",
				isProductiveSystem: true
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isProductiveSystemWithTransports(), true);
		});

		QUnit.test("when isSystemWithTransports is called without system/client info being maintained in the settings", function(assert) {
			assert.notOk(this.cut.isSystemWithTransports(), "then it returns false");
		});

		QUnit.test("when isSystemWithTransports is called with system/client info being maintained in the settings", function(assert) {
			var oSettings = {
				client: "someClient",
				system: "someSystem"
			};
			this.cut = new Settings(oSettings);
			assert.ok(this.cut.isSystemWithTransports(), "then it returns true");
		});

		QUnit.test("when isPublishAvailable is called without information info being maintained in the settings", function(assert) {
			assert.notOk(this.cut.isPublishAvailable(), "then it returns false");
		});

		QUnit.test("when isPublishAvailable is called with info being maintained in the settings", function(assert) {
			var oSettings = {
				isPublishAvailable: true
			};
			this.cut = new Settings(oSettings);
			assert.ok(this.cut.isPublishAvailable(), "then it returns true");
		});

		QUnit.test("isVersioningEnabled returns a 'true' flag if it is maintained in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning: {}
			};
			oSettings.versioning[sLayer] = true;

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), true);
		});

		QUnit.test("isVersioningEnabled returns a 'true' flag if it is maintained for 'ALL' layers in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning: {
					ALL: true
				}
			};

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), true);
		});

		QUnit.test("isVersioningEnabled returns a 'false' flag if the layer is NOT maintained in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning: {
					VENDOR: true
				}
			};

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), false);
		});

		QUnit.test("isVersioningEnabled returns a 'false' flag if NO layer is maintained in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning: {}
			};

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), false);
		});

		QUnit.test("when systemType is CUSTOMER", function(assert) {
			var oSettings = new Settings({
				systemType: "CUSTOMER"
			});
			assert.ok(oSettings.isCustomerSystem(), "then isCustomerSystem returns true");
		});

		QUnit.test("when systemType is SAP", function(assert) {
			var oSettings = new Settings({
				systemType: "SAP"
			});
			assert.notOk(oSettings.isCustomerSystem(), "then isCustomerSystem returns false");
		});

		QUnit.test("when systemType is set and hostname includes localhost", function(assert) {
			var oSettings = new Settings({
				systemType: "CUSTOMER"
			});
			sandbox.stub(oSettings, "_getHostname").returns("localhost");
			assert.ok(oSettings.isCustomerSystem(), "then systemType wins over hostname");
		});

		QUnit.test("when systemType is not set and hostname includes localhost", function(assert) {
			var oSettings = new Settings({});
			sandbox.stub(oSettings, "_getHostname").returns("localhost");
			assert.notOk(oSettings.isCustomerSystem(), "then isCustomerSystem returns false");
		});

		QUnit.test("when systemType is not set and hostname is not a SAP system", function(assert) {
			var oSettings = new Settings({});
			sandbox.stub(oSettings, "_getHostname").returns("example.com");
			assert.ok(oSettings.isCustomerSystem(), "then isCustomerSystem returns true");
		});

		QUnit.test("get instance from flex settings request when load settings promise is not available", function(assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isAppVariantSaveAsEnabled: true,
				logonUser: "DemoUser"
			};

			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);
			Settings._oLoadSettingsPromise = undefined;
			return Settings.getInstance().then(function(oSettings) {
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isAppVariantSaveAsEnabled(), true);
				assert.equal(oSettings.isModelS(), true);
				assert.equal(oSettings.isKeyUserTranslationEnabled(), false);
				assert.equal(oSettings.getUserId(), "DemoUser");
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oSettings, oSettings2);
				});
			});
		});

		QUnit.test("get instance return default value when flex data promise failed to obtain settings value", function(assert) {
			sandbox.stub(Storage, "loadFeatures").resolves(undefined);
			Settings._oLoadSettingsPromise = undefined;
			return Settings.getInstance().then(function(oSettings) {
				assert.equal(oSettings.isKeyUser(), false);
				assert.equal(oSettings.isKeyUserTranslationEnabled(), false);
				assert.equal(oSettings.isAppVariantSaveAsEnabled(), false);
				assert.equal(oSettings.isModelS(), false);
				assert.equal(oSettings.isVariantSharingEnabled(), false);
				assert.equal(oSettings.isPublicFlVariantEnabled(), false);
				assert.equal(oSettings.isAtoEnabled(), false);
				assert.equal(oSettings.isProductiveSystem(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oSettings, oSettings2);
				});
			});
		});

		QUnit.test("get instance when _oLoadSettingsPromise is resolved", function(assert) {
			var oSettings = {
				isKeyUser: true,
				isAtoAvailable: true,
				isAppVariantSaveAsEnabled: true
			};
			Settings._oLoadSettingsPromise = Promise.resolve(new Settings(oSettings));
			return Settings.getInstance().then(function(oSettings) {
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isAppVariantSaveAsEnabled(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oSettings, oSettings2);
				});
			});
		});

		QUnit.test("getInstanceOrUndef", function(assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isAppVariantSaveAsEnabled: true
			};
			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);
			var oSettings0 = Settings.getInstanceOrUndef();
			assert.ok(!oSettings0);
			return Settings.getInstance().then(function(oSettings1) {
				assert.ok(oSettings1);
				var oSettings2 = Settings.getInstanceOrUndef();
				assert.equal(oSettings1, oSettings2);
			});
		});
	});

	QUnit.module("Given that Settings loading failed", {
		afterEach() {
			delete Settings._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("a default response is resolving the request", function(assert) {
			sandbox.stub(Storage, "loadFeatures").resolves();
			return Settings.getInstance().then(function(oSettings) {
				assert.ok(oSettings, "the settings instance is available");
				assert.equal(oSettings.isKeyUser(), false);
				assert.equal(oSettings.isAppVariantSaveAsEnabled(), false);
				assert.equal(oSettings.isAtoAvailable(), false);
				assert.equal(oSettings.isAtoEnabled(), false);
				assert.equal(oSettings.isProductiveSystem(), true);
				assert.equal(oSettings.isVariantSharingEnabled(), false);
				assert.equal(oSettings.isPublicFlVariantEnabled(), false);
			});
		});
	});

	QUnit.module("static functions", {}, function() {
		QUnit.test("LayerPermissions", function(assert) {
			var mExpectedDefaultPermissions = {
				VENDOR: true,
				CUSTOMER_BASE: true,
				CUSTOMER: true,
				PUBLIC: false,
				USER: false
			};
			var mExpectedDeveloperPermissions = {
				VENDOR: true,
				CUSTOMER_BASE: true,
				CUSTOMER: false,
				PUBLIC: false,
				USER: false
			};
			assert.deepEqual(Settings.getDefaultLayerPermissions(), mExpectedDefaultPermissions, "the default layer permissions are correct");
			assert.deepEqual(Settings.getDeveloperModeLayerPermissions(), mExpectedDeveloperPermissions, "the developer mode layer permissions are correct");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
