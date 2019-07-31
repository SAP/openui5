/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LrepConnector",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	Settings,
	Cache,
	Utils,
	LrepConnector,
	sinon
) {
	"use strict";

	var bPresetFlexChangeMode;
	var bFlexibilityAdaptationButtonAllowed;
	var sandbox = sinon.sandbox.create();

	QUnit.module("sapbyDefault.ui.fl.registry.Settings", {
		beforeEach: function() {
			bPresetFlexChangeMode = Settings._bFlexChangeMode;
			bFlexibilityAdaptationButtonAllowed = Settings._bFlexibilityAdaptationButtonAllowed;

			var oSettings = {
				isKeyUser: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				features: {
					addField: ["CUSTOMER", "VENDOR"],
					changeTypeOnlyForUser: ["USER"],
					completelyDisabledChangeType: []
				}
			};
			this.cut = new Settings(oSettings);
		},
		afterEach: function() {
			Settings._bFlexChangeMode = bPresetFlexChangeMode;
			Settings._bFlexibilityAdaptationButtonAllowed = bFlexibilityAdaptationButtonAllowed;

			Settings._instance = undefined;

			// detach all events
			jQuery.each(Settings._oEventProvider.mEventRegistry, function (sEventKey, aEvents) {
				jQuery.each(aEvents, function (index, oRegisteredEvent) {
					Settings.detachEvent(sEventKey, oRegisteredEvent.fFunction);
				});
			});

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

		QUnit.test("get instance from flex settings request when flex data promise is not available", function(assert) {
			var done = assert.async();

			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};

			var oStubCreateConnector = sandbox.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
				loadSettings : function() {
					return Promise.resolve(oSetting);
				}
			});
			var oStubGetFlexDataPromise = sandbox.stub(Cache, "getFlexDataPromise").returns(undefined);
			Settings.getInstance().then(function(oSettings) {
				assert.equal(oStubGetFlexDataPromise.callCount, 1);
				assert.equal(oStubCreateConnector.callCount, 1);
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oStubCreateConnector.callCount, 1);
					assert.equal(oSettings, oSettings2);
					oStubCreateConnector.restore();
					oStubGetFlexDataPromise.restore();
					done();
				});
			});
		});

		QUnit.test("get instance from flex settings request when flex data promise is rejected", function(assert) {
			var done = assert.async();

			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};
			var oStubCreateConnector = sandbox.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
				loadSettings : function() {
					return Promise.resolve(oSetting);
				}
			});
			var oStubGetFlexDataPromise = sandbox.stub(Cache, "getFlexDataPromise").rejects();
			Settings.getInstance().then(function(oSettings) {
				assert.equal(oStubGetFlexDataPromise.callCount, 1);
				assert.equal(oStubCreateConnector.callCount, 1);
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oStubCreateConnector.callCount, 1);
					assert.equal(oSettings, oSettings2);
					oStubCreateConnector.restore();
					oStubGetFlexDataPromise.restore();
					done();
				});
			});
		});

		QUnit.test("get instance from cache when flex data promise is resolved", function(assert) {
			var done = assert.async();

			var oFileContent = {
				changes: {
					settings: {
						isKeyUser: true,
						isAtoAvailable: true
					}
				}
			};
			var oStubGetFlexDataPromise = sandbox.stub(Cache, "getFlexDataPromise").resolves(oFileContent);
			Settings.getInstance().then(function(oSettings) {
				assert.equal(oStubGetFlexDataPromise.callCount, 1);
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oSettings, oSettings2);
					oStubGetFlexDataPromise.restore();
					done();
				});
			});
		});

		QUnit.test("getInstanceOrUndef", function(assert) {
			var done = assert.async();

			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};
			var oStubCreateConnector = sandbox.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
				loadSettings : function() {
					return Promise.resolve(oSetting);
				}
			});
			var oSettings0 = Settings.getInstanceOrUndef();
			assert.ok(!oSettings0);
			Settings.getInstance().then(function(oSettings1) {
				assert.ok(oSettings1);
				assert.equal(oStubCreateConnector.callCount, 1);
				var oSettings2 = Settings.getInstanceOrUndef();
				assert.equal(oSettings1, oSettings2);
				assert.equal(oStubCreateConnector.callCount, 1);
				oStubCreateConnector.restore();
				done();
			});
		});

		QUnit.test("_isFlexChangeModeFromUrl", function(assert) {
			var bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
			assert.equal(bFlexChangeMode, undefined);

			var UriParameters = sap.ui.require("sap/base/util/UriParameters");
			assert.ok(UriParameters, "UriParameters must be loaded");

			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-fl-changeMode").returns("true");

			bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
			assert.equal(bFlexChangeMode, true);
			oStub.withArgs("sap-ui-fl-changeMode").returns("false");
			bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
			assert.equal(bFlexChangeMode, false);

			oStub.restore();
		});

		QUnit.test("isFlexChangeMode", function(assert) {
			var bFlexChangeMode = Settings.isFlexChangeMode();
			assert.equal(bFlexChangeMode, true); //default is true

			Settings.leaveFlexChangeMode();
			bFlexChangeMode = Settings.isFlexChangeMode();
			assert.equal(bFlexChangeMode, false);

			Settings.activateFlexChangeMode();
			bFlexChangeMode = Settings.isFlexChangeMode();
			assert.equal(bFlexChangeMode, true);

			var UriParameters = sap.ui.require("sap/base/util/UriParameters");
			assert.ok(UriParameters, "UriParameters must be loaded");

			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-fl-changeMode").returns("false");

			bFlexChangeMode = Settings.isFlexChangeMode();
			assert.equal(bFlexChangeMode, false);

			oStub.restore();
		});

		QUnit.test("leave flexChangeMode eventing", function(assert) {
			var done = assert.async();

			var bFlexChangeMode = Settings.isFlexChangeMode();
			assert.equal(bFlexChangeMode, true); //default is true

			var fOnChangeModeUpdated = function(oEvent) {
				Settings.detachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
				assert.equal(oEvent.getParameter("bFlexChangeMode"), false);
				assert.equal(sap.ui.fl.registry.Settings.isFlexChangeMode(), false);
				done();
			};
			Settings.attachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
			sap.ui.fl.registry.Settings.leaveFlexChangeMode();
		});

		QUnit.test("activate flexChangeMode eventing", function(assert) {
			var done = assert.async();

			var bFlexChangeMode = Settings.isFlexChangeMode();
			assert.equal(bFlexChangeMode, true); //default is true

			var fOnChangeModeUpdated = function(oEvent) {
				Settings.detachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
				assert.equal(oEvent.getParameter("bFlexChangeMode"), true);
				assert.equal(Settings.isFlexChangeMode(), true);
				done();
			};
			Settings.leaveFlexChangeMode();
			Settings.attachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
			Settings.activateFlexChangeMode();
		});

		QUnit.test("returns by default adaptation button disllowed", function (assert) {
			var bFlexibilityAdaptationButtonAllowed = sap.ui.fl.registry.Settings.isFlexibilityAdaptationButtonAllowed();

			assert.equal(bFlexibilityAdaptationButtonAllowed, false);
		});

		QUnit.test("changes adaptation button allowed", function (assert) {
			var bRetrievedAdaptationButtonAllowed;
			var bFlexibilityAdaptationButtonAllowed = true;
			var bFlexibilityAdaptationButtonDisallowed = false;

			Settings.setFlexibilityAdaptationButtonAllowed(bFlexibilityAdaptationButtonDisallowed);
			bRetrievedAdaptationButtonAllowed = Settings.isFlexibilityAdaptationButtonAllowed();
			assert.equal(bRetrievedAdaptationButtonAllowed, bFlexibilityAdaptationButtonDisallowed);

			Settings.setFlexibilityAdaptationButtonAllowed(bFlexibilityAdaptationButtonAllowed);
			bRetrievedAdaptationButtonAllowed = Settings.isFlexibilityAdaptationButtonAllowed();
			assert.equal(bRetrievedAdaptationButtonAllowed, bFlexibilityAdaptationButtonAllowed);
		});

		QUnit.test("fires adaptation mode event on an adaptation button activation and the button is active", function(assert) {
			var done = assert.async();

			var fOnChangeModeUpdated = function(oEvent) {
				Settings.detachEvent(sap.ui.fl.registry.Settings.events.flexibilityAdaptationButtonAllowedChanged, fOnChangeModeUpdated.bind(this));
				assert.equal(oEvent.getParameter("bFlexibilityAdaptationButtonAllowed"), true, "the event was fired with the flag that the adaptation button was allowed");
				assert.equal(sap.ui.fl.registry.Settings.isFlexibilityAdaptationButtonAllowed(), true, "the adaptation button is allowed");
				done();
			};
			Settings.attachEvent(sap.ui.fl.registry.Settings.events.flexibilityAdaptationButtonAllowedChanged, fOnChangeModeUpdated.bind(this));
			Settings.setFlexibilityAdaptationButtonAllowed(true);
		});

		QUnit.test("fires adaptation mode event on an adaptation button deactivation and the button is deactive", function(assert) {
			var done = assert.async();

			var fOnChangeModeUpdated = function(oEvent) {
				Settings.detachEvent(sap.ui.fl.registry.Settings.events.flexibilityAdaptationButtonAllowedChanged, fOnChangeModeUpdated.bind(this));
				assert.equal(oEvent.getParameter("bFlexibilityAdaptationButtonAllowed"), false, "the event was fired with the flag that the adaptation button was disallowed");
				assert.equal(sap.ui.fl.registry.Settings.isFlexibilityAdaptationButtonAllowed(), false, "the adaptation button is disallowed");
				done();
			};
			sap.ui.fl.registry.Settings.setFlexibilityAdaptationButtonAllowed(true);
			Settings.attachEvent(sap.ui.fl.registry.Settings.events.flexibilityAdaptationButtonAllowedChanged, fOnChangeModeUpdated.bind(this));
			sap.ui.fl.registry.Settings.setFlexibilityAdaptationButtonAllowed(false);
		});
	});

	QUnit.module("Given that Settings file is loaded", {
		afterEach: function() {
			delete Settings._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and the system is a trial system", function(assert) {
			assert.notOk(Settings.getInstanceOrUndef(), "initially the instance is undefined");

			// call initialize function again to initialize with trial
			sandbox.stub(Utils, "isTrialSystem").returns(true);
			Settings._initInstance();

			var oSettings = Settings.getInstanceOrUndef();
			assert.ok(oSettings, "the settings instance is available");
			assert.equal(oSettings.isKeyUser(), true);
			assert.equal(oSettings.isAtoAvailable(), false);
			assert.equal(oSettings.isAtoEnabled(), false);
			assert.equal(oSettings.isProductiveSystem(), false);
			assert.equal(oSettings.isVariantSharingEnabled(), false);
		});
	});

	QUnit.module("Given that Settings loading failed", {
		afterEach: function() {
			delete Settings._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("a default response is resolving the request", function(assert) {
			var oLrepConnector = new LrepConnector();
			sandbox.stub(oLrepConnector, "loadSettings").resolves();
			sandbox.stub(LrepConnector, "createConnector").returns(oLrepConnector);

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
