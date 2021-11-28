/* global QUnit*/
sap.ui.define([
	"sap/ui/mdc/p13n/AdaptationProvider",
	"sap/ui/mdc/p13n/UIManager",
	"sap/ui/mdc/Control",
	"sap/ui/core/Core"
], function (AdaptationProvider, UIManager, Control, oCore) {
	"use strict";

	QUnit.module("Basics", {
		beforeEach: function() {
			this.oAdaptationProvider = new AdaptationProvider();
		},
		afterEach: function() {
			this.oAdaptationProvider.destroy();
			this.oAdaptationProvider = null;
		}
	});

	QUnit.test("Use UIManager as Singleton", function(assert){

		UIManager.getInstance(this.oAdaptationProvider);

		assert.throws(
			function() {
				return new UIManager();
			},
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message ===  "UIManager: This class is a singleton and should not be used without an AdaptationProvider. Please use 'sap.ui.mdc.p13n.Engine.getInstance().uimanager' instead"
				);
			},
			"calling the constructor subsequently throws an error."
		);

		UIManager.getInstance().destroy();
	});

	QUnit.test("Use UIManager only with a valid AdaptationProvider", function(assert){

		assert.throws(
			function() {
				return UIManager.getInstance();
			},
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message ===  "The UIManager singleton must not be accessed without an AdaptationProvider interface!"
				);
			},
			"calling then UIManager without a valid interface throws an Error"
		);
	});

	QUnit.module("Check UI popup + P13nWrapper creation", {
		beforeEach: function() {
			this.oAdaptationProvider = new AdaptationProvider();
			this.oAdaptationProvider.initAdaptation = function(){
				return Promise.resolve();
			};
			this.oAdaptationProvider.handleP13n = function(){
				return Promise.resolve();
			};
			this.oAdaptationProvider.reset = function(){
				return Promise.resolve();
			};

			this.oAdaptationProvider.getUISettings = function(){
				return this.oUISettings;
			}.bind(this);

			this.oControl = new Control();
			this.oAdaptationUI = new Control({id: "SomeTestUI"});
		},
		afterEach: function() {
			this.oAdaptationProvider.destroy();
			this.oAdaptationProvider = null;
			UIManager.getInstance().destroy();
			this.oUISettings = null;
			this.oAdaptationUI.destroy();
			this.oAdaptationUI = null;
		}
	});

	QUnit.test("call 'create' - check UI creation (only with a string as key), livemode: false (default)", function(assert) {
		var done = assert.async();
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		UIManager.getInstance().create(this.oControl, "TestKey", []).then(function(oPopup){
			assert.ok(oPopup, "Popup created");
			assert.ok(oPopup.isA("sap.m.Dialog"), "Popup is a modal Dialog");
			assert.equal(oPopup.getTitle(), sTestTitle, "Only one key provided - use the controller UI settings");
			done();
		});
	});

	QUnit.test("call 'create' - check UI creation (only with a string as key), livemode: true (experimental)", function(assert) {
		var done = assert.async();
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";
		UIManager.getInstance().bLiveMode = true;

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		UIManager.getInstance().create(this.oControl, "TestKey", []).then(function(oPopup){
			assert.ok(oPopup, "Popup created");
			assert.ok(oPopup.isA("sap.m.ResponsivePopover"), "Popup is a Popover for livemode");
			assert.equal(oPopup.getTitle(), sTestTitle, "Only one key provided - use the controller UI settings");
			UIManager.getInstance().bLiveMode = false;
			done();
		});
	});

	QUnit.test("call 'create' - check UI creation (only with one key in an array)", function(assert) {
		var done = assert.async();
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		UIManager.getInstance().create(this.oControl, ["TestKey"], []).then(function(oPopup){
			assert.ok(oPopup, "Popup created");
			assert.ok(oPopup.isA("sap.m.Dialog"), "Popup is a modal Dialog");
			assert.equal(oPopup.getTitle(), sTestTitle, "Only one key provided - use the controller UI settings");
			done();
		});
	});

	QUnit.test("call 'create' - check UI creation (with multiple keys in an array)", function(assert) {
		var done = assert.async();
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			},
			TestKey2: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		UIManager.getInstance().create(this.oControl, ["TestKey", "TestKey2"], []).then(function(oPopup){
			assert.ok(oPopup, "Popup created");
			assert.ok(oPopup.isA("sap.m.Dialog"), "Popup is a modal Dialog");
			assert.ok(oPopup.getContent()[0].isA("sap.m.p13n.Container"), "Use an additional wrapper in case multiple keys have been provided");
			assert.ok(oPopup.getContent()[0].oLayout.getEnableScrolling(), "The inner wrapper has scrolling enabled");
			assert.notOk(oPopup.getVerticalScrolling(), "The outer container should not have vertical scrolling enabled, as the Wrapper takes care of it");
			assert.equal(oPopup.getTitle(), oCore.getLibraryResourceBundle("sap.ui.mdc").getText("p13nDialog.VIEW_SETTINGS"), "Multiple keys provided - use the default settings");
			done();
		});
	});

	QUnit.test("call 'show' - popup should open ", function(assert) {
		var done = assert.async();
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		UIManager.getInstance().show(this.oControl, ["TestKey"]).then(function(oPopup){
			assert.ok(oPopup, "Popup created");
			assert.ok(oPopup.isOpen(), "Dialog has been created + opened");
			oPopup.destroy();
			done();
		});
	});

	QUnit.test("call 'show' and check 'ativeP13n' set/has", function(assert) {
		var done = assert.async(2);
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";

		var mParams = {
			control: null,
			keys: null
		};

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		this.oAdaptationProvider.setActiveP13n = function(vControl, aKeys) {
			mParams.control = vControl;
			mParams.keys = aKeys;
		};

		this.oAdaptationProvider.hasActiveP13n = function(vControl) {
			assert.ok(vControl, "'hasActiveP13n' executed");
			done();
		};

		UIManager.getInstance().show(this.oControl, ["TestKey"]).then(function(oPopup){
			assert.ok(mParams.control, "'setActiveP13n' executed");
			assert.equal(mParams.keys[0], "TestKey", "The opened key hs been provided");
			oPopup.destroy();
			done();
		});
	});


	QUnit.test("Check 'validateP13n' execution (if provided)", function(assert) {
		var done = assert.async();
		UIManager.getInstance(this.oAdaptationProvider);
		var sTestTitle = "Some Test UI Title";

		this.oUISettings = {
			TestKey: {
				containerSettings: {
					title: sTestTitle
				},
				adaptationUI: Promise.resolve(this.oAdaptationUI)
			}
		};

		this.oAdaptationProvider.validateP13n = function(vControl, sKey, oAdaptationUI) {
			assert.ok(vControl.isA("sap.ui.mdc.Control"), "Control provided");
			assert.ok(typeof sKey == "string", "Key provided");
			assert.ok(oAdaptationUI.isA("sap.ui.core.Control"), "Adaptation UI provided");
			done();
		};

		UIManager.getInstance().show(this.oControl, ["TestKey"], []).then(function(oPopup){
			oPopup.destroy();
		});
	});

});
