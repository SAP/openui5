sinon.config.useFakeTimers = false;
jQuery.sap.require("sap.ui.fl.registry.Settings");
jQuery.sap.require("sap.ui.fl.Cache");

(function(Settings, Cache) {

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
					"completelyDisabledChangeType": [],
					"propertyChange": ["VENDOR", "CUSTOMER_BASE"]
				}
			};
			this.cut = new Settings(oSettings);
		},
		afterEach: function() {
			Settings._bFlexChangeMode = bPresetFlexChangeMode;
			Settings._bFlexibilityAdaptationButtonAllowed = bFlexibilityAdaptationButtonAllowed;

			delete Settings._instances['testcomponent'];

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
		QUnit.equal(this.cut._oSettings.isKeyUser, false);
		var bIsKeyUser = this.cut.isKeyUser();
		QUnit.equal(bIsKeyUser, false);
	});

	QUnit.test("isModelS", function(assert) {
		QUnit.equal(this.cut._oSettings.isAtoAvailable, false);
		var bIsModelS = this.cut.isModelS();
		QUnit.equal(bIsModelS, false);
	});

	QUnit.test("isAtoEnabled", function(assert) {
		QUnit.equal(this.cut._oSettings.isAtoEnabled, false);
		var bIsAtoEnabled = this.cut.isAtoEnabled();
		QUnit.equal(bIsAtoEnabled, false);
	});

	QUnit.test("load from cache", function(assert) {
		var done = assert.async();

		var oFileContent = {
			changes: {
				settings: {
					isKeyUser: true,
					isAtoAvailable: true
				}
			}
		};
		Cache._entries['testcomponent'] = {
			promise: Promise.resolve(oFileContent)
		};
		Settings.getInstance('testcomponent').then(function(oSettings) {
			QUnit.equal(oSettings.isKeyUser(), true);
			QUnit.equal(oSettings.isModelS(), true);
			Settings.getInstance('testcomponent').then(function(oSettings2) {
				QUnit.equal(oSettings, oSettings2);
				done();
			});
		});
	});

	QUnit.test("getInstanceOrUndef", function(assert) {
		var done = assert.async();

		var oFileContent = {
			changes: {
				settings: {
					isKeyUser: true,
					isAtoAvailable: true
				}
			}
		};
		Cache._entries['testcomponent'] = {
			promise: Promise.resolve(oFileContent)
		};
		var oSettings0 = Settings.getInstanceOrUndef('testcomponent');
		QUnit.ok(!oSettings0);
		Settings.getInstance('testcomponent').then(function(oSettings1) {
			QUnit.ok(oSettings1);
			var oSettings2 = Settings.getInstanceOrUndef('testcomponent');
			QUnit.equal(oSettings1, oSettings2);
			done();
		});
	});

	QUnit.test("_isFlexChangeModeFromUrl", function(assert) {
		var bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
		QUnit.equal(bFlexChangeMode, undefined);
		var oUriParams = {
			mParams: {
				"sap-ui-fl-changeMode": ["true"]
			}
		};
		var getUriParametersStub = this.stub(jQuery.sap, "getUriParameters").returns(oUriParams);
		bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
		QUnit.equal(bFlexChangeMode, true);
		oUriParams.mParams["sap-ui-fl-changeMode"] = ["false"];
		bFlexChangeMode = Settings._isFlexChangeModeFromUrl();
		QUnit.equal(bFlexChangeMode, false);
	});

	QUnit.test("isFlexChangeMode", function(assert) {
		var bFlexChangeMode = Settings.isFlexChangeMode();
		QUnit.equal(bFlexChangeMode, true); //default is true

		Settings.leaveFlexChangeMode();
		var bFlexChangeMode = Settings.isFlexChangeMode();
		QUnit.equal(bFlexChangeMode, false);

		Settings.activateFlexChangeMode();
		var bFlexChangeMode = Settings.isFlexChangeMode();
		QUnit.equal(bFlexChangeMode, true);

		var oUriParams = {
			mParams: {
				"sap-ui-fl-changeMode": ["false"]
			}
		};
		this.stub(jQuery.sap, "getUriParameters").returns(oUriParams);
		bFlexChangeMode = Settings.isFlexChangeMode();
		QUnit.equal(bFlexChangeMode, false);
	});

	QUnit.test("leave flexChangeMode eventing", function(assert) {
		var done = assert.async();

		var bFlexChangeMode = Settings.isFlexChangeMode();
		QUnit.equal(bFlexChangeMode, true); //default is true

		var fOnChangeModeUpdated = function(oEvent) {
			Settings.detachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
			QUnit.equal(oEvent.getParameter("bFlexChangeMode"), false);
			QUnit.equal(sap.ui.fl.registry.Settings.isFlexChangeMode(), false);
			done();
		};
		Settings.attachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
		sap.ui.fl.registry.Settings.leaveFlexChangeMode();
	});

	QUnit.test("activate flexChangeMode eventing", function(assert) {
		var done = assert.async();

		var bFlexChangeMode = Settings.isFlexChangeMode();
		QUnit.equal(bFlexChangeMode, true); //default is true

		var fOnChangeModeUpdated = function(oEvent) {
			Settings.detachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
			QUnit.equal(oEvent.getParameter("bFlexChangeMode"), true);
			QUnit.equal(Settings.isFlexChangeMode(), true);
			done();
		};
		Settings.leaveFlexChangeMode();
		Settings.attachEvent(sap.ui.fl.registry.Settings.events.changeModeUpdated, fOnChangeModeUpdated.bind(this));
		Settings.activateFlexChangeMode();
	});

	QUnit.test("returns by default adaptation button disllowed", function () {
		var bFlexibilityAdaptationButtonAllowed = sap.ui.fl.registry.Settings.isFlexibilityAdaptationButtonAllowed();

		QUnit.equal(bFlexibilityAdaptationButtonAllowed, false);
	});

	QUnit.test("changes adaptation button allowed", function () {
		var bRetrievedAdaptationButtonAllowed;
		var bFlexibilityAdaptationButtonAllowed = true;
		var bFlexibilityAdaptationButtonDisallowed = false;

		Settings.setFlexibilityAdaptationButtonAllowed(bFlexibilityAdaptationButtonDisallowed);
		bRetrievedAdaptationButtonAllowed = Settings.isFlexibilityAdaptationButtonAllowed();
		QUnit.equal(bRetrievedAdaptationButtonAllowed, bFlexibilityAdaptationButtonDisallowed);

		Settings.setFlexibilityAdaptationButtonAllowed(bFlexibilityAdaptationButtonAllowed);
		bRetrievedAdaptationButtonAllowed = Settings.isFlexibilityAdaptationButtonAllowed();
		QUnit.equal(bRetrievedAdaptationButtonAllowed, bFlexibilityAdaptationButtonAllowed);
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

	QUnit.test("isChangeTypeEnabled", function(assert) {
		QUnit.equal(this.cut.isChangeTypeEnabled("addField", "CUSTOMER"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("addField", "VENDOR"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("addField", "USER"), false);
		QUnit.equal(this.cut.isChangeTypeEnabled("unknownChangeType", "CUSTOMER"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("changeTypeOnlyForUser", "USER"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("changeTypeOnlyForUser", "VENDOR"), false);
		QUnit.equal(this.cut.isChangeTypeEnabled("completelyDisabledChangeType", "VENDOR"), false);
		QUnit.equal(this.cut.isChangeTypeEnabled("completelyDisabledChangeType", "CUSTOMER"), false);
		QUnit.equal(this.cut.isChangeTypeEnabled("completelyDisabledChangeType", "USER"), false);
		QUnit.equal(this.cut.isChangeTypeEnabled("changeTypeOnlyForUser"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("propertyChange", "VENDOR"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("propertyChange", "CUSTOMER_BASE"), true);
		QUnit.equal(this.cut.isChangeTypeEnabled("propertyChange", "CUSTOMER"), false);
		QUnit.equal(this.cut.isChangeTypeEnabled("propertyChange", "USER"), false);
	});

}(sap.ui.fl.registry.Settings, sap.ui.fl.Cache));
