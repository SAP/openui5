/*global QUnit,sinon*/

sinon.config.useFakeTimers = false;
jQuery.sap.require("sap.ui.fl.registry.Settings");
jQuery.sap.require("sap.ui.fl.Cache");

(function(Settings, Cache) {
	"use strict";

	var bPresetFlexChangeMode, bFlexibilityAdaptationButtonAllowed;

	QUnit.module("sapbyDefault.ui.fl.registry.Settings", {
		beforeEach: function() {
			bPresetFlexChangeMode = Settings._bFlexChangeMode;
			bFlexibilityAdaptationButtonAllowed = Settings._bFlexibilityAdaptationButtonAllowed;

			var oSettings = {
				"isKeyUser": false,
				"isAtoAvailable": false,
				"isAtoEnabled": false,
				"features": {
					"addField": ["CUSTOMER", "VENDOR"],
					"changeTypeOnlyForUser": ["USER"],
					"completelyDisabledChangeType": []
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
		}
	});

	QUnit.test("init", function(assert) {
		QUnit.ok(this.cut._oSettings);
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

	QUnit.test("get instance from flex settings request when flex data promise is not available", function(assert) {
		var done = assert.async();

		var oSetting = {
			isKeyUser: true,
			isAtoAvailable: true
		};
		var oStubCreateConnector = this.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
			loadSettings : function(){
				return Promise.resolve(oSetting);
			}
		});
		var oStubGetFlexDataPromise = this.stub(Cache, "getFlexDataPromise").returns(undefined);
		Settings.getInstance().then(function(oSettings) {
			assert.equal(oStubGetFlexDataPromise.callCount, 1);
			assert.equal(oStubCreateConnector.callCount, 1);
			assert.equal(oSettings.isKeyUser(), true);
			assert.equal(oSettings.isModelS(), true);
			Settings.getInstance().then(function(oSettings2) {
				assert.equal(oStubCreateConnector.callCount, 1);
				assert.equal(oSettings, oSettings2);
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
		var oStubCreateConnector = sinon.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
			loadSettings : function(){
				return Promise.resolve(oSetting);
			}
		});
		var oStubGetFlexDataPromise = this.stub(Cache, "getFlexDataPromise").returns(Promise.reject());
		Settings.getInstance().then(function(oSettings) {
			assert.equal(oStubGetFlexDataPromise.callCount, 1);
			assert.equal(oStubCreateConnector.callCount, 1);
			assert.equal(oSettings.isKeyUser(), true);
			assert.equal(oSettings.isModelS(), true);
			Settings.getInstance().then(function(oSettings2) {
				assert.equal(oStubCreateConnector.callCount, 1);
				assert.equal(oSettings, oSettings2);
				oStubCreateConnector.restore();
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
		var oStubGetFlexDataPromise = this.stub(Cache, "getFlexDataPromise").returns(Promise.resolve(oFileContent));
		Settings.getInstance().then(function(oSettings) {
			assert.equal(oStubGetFlexDataPromise.callCount, 1);
			assert.equal(oSettings.isKeyUser(), true);
			assert.equal(oSettings.isModelS(), true);
			Settings.getInstance().then(function(oSettings2) {
				assert.equal(oSettings, oSettings2);
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
		var oStubCreateConnector = this.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
			loadSettings : function(){
				return Promise.resolve(oSetting);
			}
		});
		var oSettings0 = Settings.getInstanceOrUndef();
		QUnit.ok(!oSettings0);
		Settings.getInstance().then(function(oSettings1) {
			QUnit.ok(oSettings1);
			assert.equal(oStubCreateConnector.callCount, 1);
			var oSettings2 = Settings.getInstanceOrUndef();
			assert.equal(oSettings1, oSettings2);
			assert.equal(oStubCreateConnector.callCount, 1);
			done();
		});
	});

	QUnit.test("_isFlexChangeModeFromUrl", function(assert) {
		var bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
		assert.equal(bFlexChangeMode, undefined);
		var oUriParams = {
			mParams: {
				"sap-ui-fl-changeMode": ["true"]
			}
		};
		this.stub(jQuery.sap, "getUriParameters").returns(oUriParams);
		bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
		assert.equal(bFlexChangeMode, true);
		oUriParams.mParams["sap-ui-fl-changeMode"] = ["false"];
		bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
		assert.equal(bFlexChangeMode, false);
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

		var oUriParams = {
			mParams: {
				"sap-ui-fl-changeMode": ["false"]
			}
		};
		this.stub(jQuery.sap, "getUriParameters").returns(oUriParams);
		bFlexChangeMode = Settings.isFlexChangeMode();
		assert.equal(bFlexChangeMode, false);
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

}(sap.ui.fl.registry.Settings, sap.ui.fl.Cache));
