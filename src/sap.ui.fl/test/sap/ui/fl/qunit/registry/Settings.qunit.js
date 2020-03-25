/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	Settings,
	Storage,
	Layer,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.registry.Settings", {
		beforeEach: function() {
			var oSettings = {
				isKeyUser: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				features: {
					addField: [Layer.CUSTOMER, Layer.VENDOR],
					changeTypeOnlyForUser: [Layer.USER],
					completelyDisabledChangeType: []
				}
			};
			this.cut = new Settings(oSettings);
		},
		afterEach: function() {
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

		QUnit.test("variants sharing is enabled by default", function(assert) {
			assert.equal(this.cut._oSettings.isVariantSharingEnabled, true);
			var bIsVariantSharingEnabled = this.cut.isVariantSharingEnabled();
			assert.equal(bIsVariantSharingEnabled, true);
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

		QUnit.test("isVersioningEnabled returns a 'true' flag if it is maintained in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning : {}
			};
			oSettings.versioning[sLayer] = true;

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), true);
		});

		QUnit.test("isVersioningEnabled returns a 'true' flag if it is maintained for 'ALL' layers in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning : {
					ALL : true
				}
			};

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), true);
		});

		QUnit.test("isVersioningEnabled returns a 'false' flag if the layer is NOT maintained in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning : {
					VENDOR : true
				}
			};

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), false);
		});

		QUnit.test("isVersioningEnabled returns a 'false' flag if NO layer is maintained in the settings for the passed layer", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var oSettings = {
				versioning : {}
			};

			this.cut = new Settings(oSettings);
			assert.equal(this.cut.isVersioningEnabled(sLayer), false);
		});

		QUnit.test("get instance from flex settings request when load settings promise is not available", function(assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};

			sandbox.stub(Storage, "loadFeatures").resolves(oSetting);
			Settings._oLoadSettingsPromise = undefined;
			return Settings.getInstance().then(function(oSettings) {
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
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
				assert.equal(oSettings.isModelS(), false);
				assert.equal(oSettings.isVariantSharingEnabled(), false);
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
				isAtoAvailable: true
			};
			Settings._oLoadSettingsPromise = Promise.resolve(new Settings(oSettings));
			return Settings.getInstance().then(function(oSettings) {
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oSettings, oSettings2);
				});
			});
		});

		QUnit.test("getInstanceOrUndef", function(assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
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
		afterEach: function() {
			delete Settings._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("a default response is resolving the request", function(assert) {
			sandbox.stub(Storage, "loadFeatures").resolves();
			return Settings.getInstance().then(function (oSettings) {
				assert.ok(oSettings, "the settings instance is available");
				assert.equal(oSettings.isKeyUser(), false);
				assert.equal(oSettings.isAtoAvailable(), false);
				assert.equal(oSettings.isAtoEnabled(), false);
				assert.equal(oSettings.isProductiveSystem(), true);
				assert.equal(oSettings.isVariantSharingEnabled(), false);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
