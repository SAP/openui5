/*global sinon */

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/mvc/ControllerExtension'
], function(Controller, XMLView, ControllerExtension) {
	"use-strict";

	var mAllPublicMethods = {
		"byId":{"public":true, "final":false, "reloadNeeded": false},
		"callbackMethod":{"public":true, "final":false, "reloadNeeded": false},
		"getLifecycleCalls":{"public":true, "final":false, "reloadNeeded": false},
		"getLifecycleCallsFromArray":{"public":true, "final":false, "reloadNeeded": false},
		"getView":{"public":true, "final":false, "reloadNeeded": false},
		"publicMethod":{"public":true, "final":false, "reloadNeeded": false},
		"publicWithCallbackMethod":{"public":true, "final":false, "reloadNeeded": false},
		"extension1.byId":{"public":true,"final":true,"reloadNeeded":true},
		"extension1.callingPublicAndPrivateMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension1.finalMethod":{"public":true,"final":true,"reloadNeeded":true},
		"extension1.checkInterface":{"public":true,"final":false,"reloadNeeded":true},
		"extension1.getBase":{"public":true,"final":false,"reloadNeeded":true},
		"extension1.getLifecycleCalls":{"public":true,"final":false,"reloadNeeded":true},
		"extension1.getLifecycleCallsFromArray":{"public":true,"final":false,"reloadNeeded":true},
		"extension1.getView":{"public":true,"final":true,"reloadNeeded":true},
		"extension1.publicMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension1.publicMethodToOverride":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.byId":{"public":true,"final":true,"reloadNeeded":true},
		"extension2.callingPublicAndPrivateMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.finalMethod":{"public":true,"final":true,"reloadNeeded":true},
		"extension2.checkInterface":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.getBase":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.getLifecycleCalls":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.getLifecycleCallsFromArray":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.getView":{"public":true,"final":true,"reloadNeeded":true},
		"extension2.publicMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension2.publicMethodToOverride":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.byId":{"public":true,"final":true,"reloadNeeded":true},
		"extension.example.ProviderExt1.callingPublicAndPrivateMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.finalMethod":{"public":true,"final":true,"reloadNeeded":true},
		"extension.example.ProviderExt1.checkInterface":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.getBase":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.getLifecycleCalls":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.getLifecycleCallsFromArray":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.getView":{"public":true,"final":true,"reloadNeeded":true},
		"extension.example.ProviderExt1.publicMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt1.publicMethodToOverride":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.byId":{"public":true,"final":true,"reloadNeeded":true},
		"extension.example.ProviderExt2.callingPublicAndPrivateMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.finalMethod":{"public":true,"final":true,"reloadNeeded":true},
		"extension.example.ProviderExt2.checkInterface":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.getBase":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.getLifecycleCalls":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.getLifecycleCallsFromArray":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.getView":{"public":true,"final":true,"reloadNeeded":true},
		"extension.example.ProviderExt2.publicMethod":{"public":true,"final":false,"reloadNeeded":true},
		"extension.example.ProviderExt2.publicMethodToOverride":{"public":true,"final":false,"reloadNeeded":true}
	};

	//all methods available
	var aPublicExpected = [
		"getLifecycleCalls",
		"getLifecycleCallsFromArray",
		"publicMethod",
		"publicMethodToOverride",
		"finalMethod",
		"checkInterface",
		"callingPublicAndPrivateMethod",
		"byId",
		"getView",
		"getBase"
	];

	//controller extension
	var ControllerExt1 = ControllerExtension.extend("example.ControllerExt1", {
		metadata: {
			methods: {
				"finalMethod" : {"public": true, "final" : true}
			}
		},
		mLifecycle: {init:0, exit: 0, beforeRendering: 0, afterRendering: 0},
		aLifecycle: [0,0,0,0],
		_increaseLifecycleCall: function(sName) {
			this.mLifecycle[sName]++;
			this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)]++;
		},
		onInit: function() {
			this._increaseLifecycleCall("init");
		},
		onExit: function() {
			this._increaseLifecycleCall("exit");
		},
		onBeforeRendering: function() {
			this._increaseLifecycleCall("beforeRendering");
		},
		onAfterRendering: function() {
			this._increaseLifecycleCall("afterRendering");
		},
		getLifecycleCalls: function(sName) {
			return this.mLifecycle[sName];
		},
		getLifecycleCallsFromArray: function(sName) {
			return this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)];
		},
		publicMethod: function() {
			return "publicMethodOnExtension";
		},
		publicMethodToOverride: function() {
			return "To override";
		},
		_privateMethod: function() {
			return "privateMethodOnExtension";
		},
		callingPublicAndPrivateMethod: function() {
			return this.publicMethod() + this._privateMethod();
		},
		getBase: function() {
			return this.base;
		},
		finalMethod: function() {
			return "I am final";
		},
		checkInterface: function() {
			return this;
		},
		override: {
			callbackMethod: function() {
				return "callbackOfControllerExt1";
			}
		}
	});

	//base controller
	var BaseController = Controller.extend("example.BaseController", {
		mLifecycle: {init:0, exit: 0, beforeRendering: 0, afterRendering: 0},
		aLifecycle: [0,0,0,0],
		_increaseLifecycleCall: function(sName) {
			this.mLifecycle[sName]++;
			this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)]++;
		},
		onInit: function() {
			this._increaseLifecycleCall("init");
		},
		onExit: function() {
			this._increaseLifecycleCall("exit");
		},
		onBeforeRendering: function() {
			this._increaseLifecycleCall("beforeRendering");
		},
		onAfterRendering: function() {
			this._increaseLifecycleCall("afterRendering");
		},
		getLifecycleCalls: function(sName) {
			return this.mLifecycle[sName];
		},
		getLifecycleCallsFromArray: function(sName) {
			return this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)];
		},
		publicMethod: function() {
			return "publicMethodOnBase";
		},
		_privateMethod: function() {
			return "privateMethodOnBase";
		},
		publicWithCallbackMethod: function() {
			return this.callbackMethod();
		},
		callbackMethod: function() {
			return "callbackOfBase";
		},
		extension1: ControllerExt1,
		extension2: ControllerExt1.override({
			finalMethod: function() {
				return "overridden by myExtension2";
			}
		})
	});
	//Provider extensions
	sap.ui.define("example/ProviderExt1",
		["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) {

		return ControllerExtension.extend("example.ProviderExt1", {
			metadata: {
				methods: {
					finalMethod: {"public": true, "final": true}
				}
			},
			mLifecycle: {init:0, exit: 0, beforeRendering: 0, afterRendering: 0},
			aLifecycle: [0,0,0,0],
			_increaseLifecycleCall: function(sName) {
				this.mLifecycle[sName]++;
				this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)]++;
			},
			onInit: function() {
				this._increaseLifecycleCall("init");
			},
			onExit: function() {
				this._increaseLifecycleCall("exit");
			},
			onBeforeRendering: function() {
				this._increaseLifecycleCall("beforeRendering");
			},
			onAfterRendering: function() {
				this._increaseLifecycleCall("afterRendering");
			},
			getLifecycleCalls: function(sName) {
				return this.mLifecycle[sName];
			},
			getLifecycleCallsFromArray: function(sName) {
				return this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)];
			},
			publicMethod: function() {
				return "publicMethodOnExtension";
			},
			_privateMethod: function() {
				return "privateMethodOnExtension";
			},
			callingPublicAndPrivateMethod: function() {
				return this.publicMethod() + this._privateMethod();
			},
			getBase: function() {
				return this.base;
			},
			publicMethodToOverride: function() {
				return "If you see this text the method is not overidden correctly";
			},
			finalMethod: function() {
				return "I am final";
			},
			checkInterface: function() {
				return this;
			},
			override: {
				callbackMethod: function() {
					return "callbackOfProviderExt1";
				},
				"extension1": {
					publicMethodToOverride: function() {
						assert.strictEqual(this.getMetadata().getName(), "example.ProviderExt1", "Context of override function set to ProviderExt1 extension");
						return "overridden by ProviderExt1";
					}
				}
			}
		});
	});
	sap.ui.define("example/ProviderExt2",
		["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) {

		return ControllerExtension.extend("example.ProviderExt2", {
			metadata: {
				methods: {
					finalMethod: {"public": true, "final": true}
				}
			},
			mLifecycle: {init:0, exit: 0, beforeRendering: 0, afterRendering: 0},
			aLifecycle: [0,0,0,0],
			_increaseLifecycleCall: function(sName) {
				this.mLifecycle[sName]++;
				this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)]++;
			},
			onInit: function() {
				this._increaseLifecycleCall("init");
			},
			onExit: function() {
				this._increaseLifecycleCall("exit");
			},
			onBeforeRendering: function() {
				this._increaseLifecycleCall("beforeRendering");
			},
			onAfterRendering: function() {
				this._increaseLifecycleCall("afterRendering");
			},
			getLifecycleCalls: function(sName) {
				return this.mLifecycle[sName];
			},
			getLifecycleCallsFromArray: function(sName) {
				return this.aLifecycle[Object.keys(this.mLifecycle).indexOf(sName)];
			},
			publicMethod: function() {
				return "publicMethodOnExtension";
			},
			_privateMethod: function() {
				return "privateMethodOnExtension";
			},
			callingPublicAndPrivateMethod: function() {
				return this.publicMethod() + this._privateMethod();
			},
			getBase: function() {
				return this.base;
			},
			publicMethodToOverride: function() {
				return "for the public method check";
			},
			finalMethod: function() {
				return "I am final";
			},
			checkInterface: function() {
				return this;
			},
			override: {
				extension: {
					"example.ProviderExt1": {
						publicMethodToOverride: function() {
							assert.strictEqual(this.getMetadata().getName(), "example.ProviderExt2", "Context of override function set to ProviderExt2 extension");
							return "overridden by ProviderExt2";
						},
						finalMethod: function() {
							assert.ok(false, "Original method flagged final. Never should happen");
						}
					}
				},
				callbackMethod: function() {
					return "callbackOfProviderExt2";
				}
			}
		});
	});
	//create an ExtensionProvider
	sap.ui.define("example/ExtensionProvider",
		["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) {

		//this is just an example, normally they would be a lookup in the component settings and flex changes for the component
		//ideally the code of the controller would be outsourced to
		var ExtensionProvider = function() {};
		ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
			if (sControllerName == "example.BaseController") {
				if (bAsync) {
					return new Promise(function(fnResolve, fnReject) {
						sap.ui.require(["example/ProviderExt1", "example/ProviderExt2"], function(Ext1, Ext2) {
							fnResolve([
								Ext1,
								Ext2
							]);
						});
					});
				} else {
					var Ext1 = sap.ui.requireSync(["example/ProviderExt1"]);
					var Ext2 = sap.ui.requireSync(["example/ProviderExt2"]);
					return [Ext1, Ext2];
				}
			}
		};
		return ExtensionProvider;
	}, true);

	/* ------------------------------------------------------------------------------------------------- */
	QUnit.module("Direct Member Extension", {
		beforeEach: function() {
			var oXMLContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
				'  <Button id="btn1"></Button>',
				'  <Button id="example.btn2"></Button>',
				'</mvc:View>'
			].join('');

			this.view = sap.ui.xmlview({
				viewContent: oXMLContent,
				controller: new BaseController()
			});

		},
		afterEach: function() {
			this.view.destroy();
			this.view = null;
		}
	});

	QUnit.test("Public private checks", function(assert) {
		var oController = this.view.getController(),
			oExtension = oController.extension1;

		//check publicMethod is available and accessible
		assert.strictEqual(typeof oExtension.publicMethod, "function", "extension1.publicMethod is a function");
		assert.strictEqual(oExtension.publicMethod(), "publicMethodOnExtension", "extension1.publicMethod can be called without error");

		//base not in public scope
		assert.strictEqual(oExtension.base, undefined, "extension1.base is not in public scope");

		//check calling private and public method from a public method
		assert.strictEqual(typeof oExtension.callingPublicAndPrivateMethod, "function", "extension1.callingPublicAndPrivateMethod is a function");
		assert.strictEqual(oExtension.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "extension.callingPublicAndPrivateMethod can be called");

		//check calling base object within a public method
		assert.strictEqual(typeof oExtension.getBase, "function", "extension1.getBase is a function");
		assert.strictEqual(oExtension.getBase().onInit, undefined, "extension.getBase returns the public interface of the controller, lifecycle init not available");
		assert.strictEqual(oExtension.getBase().onExit, undefined, "extension.getBase returns the public interface of the controller, lifecycle exit not available");
		assert.strictEqual(oExtension.getBase().onBeforeRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle beforerendering not available");
		assert.strictEqual(oExtension.getBase().onAfterRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle afterrendering not available");

		//private methods not exposed
		assert.ok(!oExtension.getBase()._increaseLifecycleCall, "extension1.getBase()._increaseLifecycleCall cannot be accessed");

		aPublicExpected.filter(
			function(sName) {
				assert.strictEqual(typeof oExtension[sName], "function", "extension: function " + sName + " available");
			}
		);
		assert.strictEqual(aPublicExpected.length, Object.keys(oExtension).length, "extension: has the right amount of public functions");
		//check method returning this: Should be the interface
		assert.ok(jQuery.sap.equal(Object.keys(oExtension), Object.keys(oExtension.checkInterface())), "If method returns 'this' we should also return the interface");


		//methods with _ throw private error if called
		assert.ok(!oExtension._privateMethod, "extension1._privateMethod cannot be accessed");
		assert.ok(!oExtension._increaseLifecycleCall, "extension1._increaseLifecycleCall cannot be accessed");

	});

	QUnit.test("Extension byId check", function(assert) {
		var oController = this.view.getController(),
			oExtension = oController.extension1;
		assert.ok(oExtension.byId("btn2"), "button defined by extension returned");
		assert.ok(!oExtension.byId("btn1"), "button defined by view not returned");
	});

	QUnit.test("Override checks", function(assert) {
		var oController = this.view.getController(),
			oExtension = oController.extension1;
		assert.strictEqual(oController.publicWithCallbackMethod(), "callbackOfControllerExt1", "controller.publicWithCallbackMethod returns 'callbackOfControllerExt1'");
		assert.strictEqual(oExtension.getBase().publicWithCallbackMethod(), "callbackOfControllerExt1", "extension.getBase().publicWithCallbackMethod returns 'callbackOfControllerExt1'");
		assert.strictEqual(oExtension.finalMethod(), "I am final", "Shouldn't be overridden by extension2");
	});

	/* ------------------------------------------------------------------------------------------------- */
	QUnit.module("Direct Member Extension + 2 Provider Extension", {
		beforeEach: function() {
			Controller.registerExtensionProvider("example.ExtensionProvider");

			var oXMLContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
				'  <Button id="btn1"></Button>',
				'</mvc:View>'
			].join('');

			this.view = sap.ui.xmlview({
				viewContent: oXMLContent,
				controller: new BaseController()
			});

		},
		afterEach: function() {
			//jQuery.sap.setObject("sample.ExtensionProvider", null);
			Controller._sExtensionProvider = null;
			this.view.destroy();
			this.view = null;
		}
	});
	QUnit.test("Public private checks", function(assert) {
		var oController = this.view.getController(),
			oExtension = oController.extension1,
			oProviderExt1 = oController.extension.example.ProviderExt1,
			oProviderExt2 = oController.extension.example.ProviderExt2;


		//check publicMethod is available and accessible
		assert.strictEqual(typeof oExtension.publicMethod, "function", "extension1.publicMethod is a function");
		assert.strictEqual(typeof oProviderExt1.publicMethod, "function", "ext.example.ProviderExt1.publicMethod is a function");
		assert.strictEqual(typeof oProviderExt2.publicMethod, "function", "ext.example.ProviderExt2.publicMethod is a function");
		assert.strictEqual(oExtension.publicMethod(), "publicMethodOnExtension", "extension1.publicMethod can be called without error");
		assert.strictEqual(oProviderExt1.publicMethod(), "publicMethodOnExtension", "ext.example.ProviderExt1.publicMethod can be called without error");
		assert.strictEqual(oProviderExt2.publicMethod(), "publicMethodOnExtension", "ext.example.ProviderExt2.publicMethod can be called without error");

		//base not in public scope
		assert.strictEqual(oExtension.base, undefined, "extension1.base is not in public scope");
		assert.strictEqual(oProviderExt1.base, undefined, "ext.example.ProviderExt1.base is not in public scope");
		assert.strictEqual(oProviderExt2.base, undefined, "ext.example.ProviderExt2.base is not in public scope");

		//check calling private and public method from a public method
		assert.strictEqual(typeof oExtension.callingPublicAndPrivateMethod, "function", "extension1.callingPublicAndPrivateMethod is a function");
		assert.strictEqual(typeof oProviderExt1.callingPublicAndPrivateMethod, "function", "ext.example.ProviderExt1.callingPublicAndPrivateMethod is a function");
		assert.strictEqual(typeof oProviderExt2.callingPublicAndPrivateMethod, "function", "ext.example.ProviderExt2.callingPublicAndPrivateMethod is a function");
		assert.strictEqual(oExtension.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "extension.callingPublicAndPrivateMethod can be called");
		assert.strictEqual(oProviderExt1.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "ext.example.ProviderExt1.callingPublicAndPrivateMethod can be called");
		assert.strictEqual(oProviderExt2.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "ext.example.ProviderExt2.callingPublicAndPrivateMethod can be called");

		//check calling base object within a public method
		assert.strictEqual(typeof oExtension.getBase, "function", "extension1.getBase is a function");
		assert.strictEqual(typeof oProviderExt1.getBase, "function", "ext.example.ProviderExt1.getBase is a function");
		assert.strictEqual(typeof oProviderExt2.getBase, "function", "ext.example.ProviderExt2.getBase is a function");
		//lifecycle
		assert.strictEqual(oExtension.getBase().onInit, undefined, "extension.getBase returns the public interface of the controller, lifecycle init not available");
		assert.strictEqual(oExtension.getBase().onExit, undefined, "extension.getBase returns the public interface of the controller, lifecycle exit not available");
		assert.strictEqual(oExtension.getBase().onBeforeRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle beforerendering not available");
		assert.strictEqual(oExtension.getBase().onAfterRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle afterrendering not available");
		assert.strictEqual(oProviderExt1.getBase().onInit, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle init not available");
		assert.strictEqual(oProviderExt1.getBase().onExit, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle exit not available");
		assert.strictEqual(oProviderExt1.getBase().onBeforeRendering, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle beforerendering not available");
		assert.strictEqual(oProviderExt1.getBase().onAfterRendering, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle afterrendering not available");
		assert.strictEqual(oProviderExt2.getBase().onInit, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle init not available");
		assert.strictEqual(oProviderExt2.getBase().onExit, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle exit not available");
		assert.strictEqual(oProviderExt2.getBase().onBeforeRendering, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle beforerendering not available");
		assert.strictEqual(oProviderExt2.getBase().onAfterRendering, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle afterrendering not available");
		//private
		assert.ok(!oExtension.getBase()._increaseLifecycleCall, "extension1.getBase()._increaseLifecycleCall cannot be accessed");
		assert.ok(!oProviderExt1.getBase()._increaseLifecycleCall, "ext.example.ProviderExt1.getBase()._increaseLifecycleCall cannot be accessed");
		assert.ok(!oProviderExt2.getBase()._increaseLifecycleCall, "ext.example.ProviderExt2.getBase()._increaseLifecycleCall cannot be accessed");

		aPublicExpected.filter(
			function(sName) {
				assert.strictEqual(typeof oExtension[sName], "function", "extension: function " + sName + " available");
				assert.strictEqual(typeof oProviderExt1[sName], "function", "ext.example.ProviderExt1: function " + sName + " available");
				assert.strictEqual(typeof oProviderExt2[sName], "function", "ext.example.ProviderExt2: function " + sName + " available");
			}
		);

		assert.strictEqual(aPublicExpected.length, Object.keys(oExtension).length, "extension: has the right amount of public functions");
		assert.strictEqual(aPublicExpected.length, Object.keys(oProviderExt1).length, "ext.example.ProviderExt1: has the right amount of public functions");
		assert.strictEqual(aPublicExpected.length, Object.keys(oProviderExt2).length, "ext.example.ProviderExt2: has the right amount of public functions");


		//methods with _ throw private error if called
		assert.ok(!oExtension._privateMethod, "extension1._privateMethod cannot be accessed");
		assert.ok(!oExtension._increaseLifecycleCall, "extension1._increaseLifecycleCall cannot be accessed");
		//oProviderExt1
		assert.ok(!oProviderExt1._privateMethod, "ext.example.ProviderExt1._privateMethod cannot be accessed");
		assert.ok(!oProviderExt1._increaseLifecycleCall, "ext.example.ProviderExt1._increaseLifecycleCall cannot be accessed");
		//oProviderExt2
		assert.ok(!oProviderExt2._privateMethod, "ext.example.ProviderExt2._privateMethod cannot be accessed");
		assert.ok(!oProviderExt2._increaseLifecycleCall, "ext.example.ProviderExt2._increaseLifecycleCall cannot be accessed");
	});

	QUnit.test("Override checks", function(assert) {
		var oController = this.view.getController(),
			oExtension = oController.extension1,
			oProviderExt1 = oController.extension.example.ProviderExt1;

		assert.strictEqual(oController.publicWithCallbackMethod(), "callbackOfProviderExt2", "controller.publicWithCallbackMethod returns 'callbackOfProviderExt2'");
		assert.strictEqual(oExtension.getBase().publicWithCallbackMethod(), "callbackOfProviderExt2", "extension.getBase().publicWithCallbackMethod returns 'callbackOfProviderExt2'");
		assert.strictEqual(oProviderExt1.publicMethodToOverride(), "overridden by ProviderExt2", "ProviderExt1.publicMethodToOverride overidden by ProviderExt2");
		assert.strictEqual(oExtension.publicMethodToOverride(), "overridden by ProviderExt1", "extension1.publicMethodToOverride overidden by ProviderExt1");
	});

	QUnit.test("public methods checks", function(assert) {
		var oController = this.view.getController();
		assert.ok(jQuery.sap.equal(oController.getPublicMethods(true), mAllPublicMethods), "Public Methods exposed correctly");
	});

	/* ------------------------------------------------------------------------------------------------- */
	QUnit.module("Direct Member Extension: async", {
		beforeEach: function() {
			var oXMLContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" controllerName="example.BaseController" xmlns="sap.m">',
				'  <Button id="btn1"></Button>',
				'</mvc:View>'
			].join('');

			this.view = sap.ui.view({
				type: "XML",
				viewContent: oXMLContent,
				async: true
			});

		},
		afterEach: function() {
			this.view.destroy();
			this.view = null;
		}
	});

	QUnit.test("Public private checks", function(assert) {
		var done = assert.async();
		this.view.loaded()
			.then(function(oView) {
				this.view = oView;
				var oController = this.view.getController(),
					oExtension = oController.extension1;

				//check publicMethod is available and accessible
				assert.strictEqual(typeof oExtension.publicMethod, "function", "extension1.publicMethod is a function");
				assert.strictEqual(oExtension.publicMethod(), "publicMethodOnExtension", "extension1.publicMethod can be called without error");

				//base not in public scope
				assert.strictEqual(oExtension.base, undefined, "extension1.base is not in public scope");

				//check calling private and public method from a public method
				assert.strictEqual(typeof oExtension.callingPublicAndPrivateMethod, "function", "extension1.callingPublicAndPrivateMethod is a function");
				assert.strictEqual(oExtension.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "extension.callingPublicAndPrivateMethod can be called");

				//check calling base object within a public method
				assert.strictEqual(typeof oExtension.getBase, "function", "extension1.getBase is a function");
				assert.strictEqual(oExtension.getBase().onInit, undefined, "extension.getBase returns the public interface of the controller, lifecycle init not available");
				assert.strictEqual(oExtension.getBase().onExit, undefined, "extension.getBase returns the public interface of the controller, lifecycle exit not available");
				assert.strictEqual(oExtension.getBase().onBeforeRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle beforerendering not available");
				assert.strictEqual(oExtension.getBase().onAfterRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle afterrendering not available");

				//private methods not exposed
				assert.ok(!oExtension.getBase()._increaseLifecycleCall, "extension1.getBase()._increaseLifecycleCall cannot be accessed");

				aPublicExpected.filter(
					function(sName) {
						assert.strictEqual(typeof oExtension[sName], "function", "extension: function " + sName + " available");
					}
				);
				assert.strictEqual(aPublicExpected.length, Object.keys(oExtension).length, "extension: has the right amount of public functions");


				//methods with _ throw private error if called
				assert.ok(!oExtension._privateMethod, "extension1._privateMethod cannot be accessed");
				assert.ok(!oExtension._increaseLifecycleCall, "extension1._increaseLifecycleCall cannot be accessed");
				done();
			}.bind(this));
	});
	QUnit.test("Override checks", function(assert) {
		var done = assert.async();
		this.view.loaded()
			.then(function(oView) {
				this.oview = oView;
				var oController = this.view.getController(),
					oExtension = oController.extension1;
				assert.strictEqual(oController.publicWithCallbackMethod(), "callbackOfControllerExt1", "controller.publicWithCallbackMethod returns 'callbackOfControllerExt1'");
				assert.strictEqual(oExtension.getBase().publicWithCallbackMethod(), "callbackOfControllerExt1", "extension.getBase().publicWithCallbackMethod returns 'callbackOfControllerExt1'");
				done();
			}.bind(this));
	});

	/* ------------------------------------------------------------------------------------------------- */
	QUnit.module("Direct Member Extension + 2 Provider Extension: async", {
		beforeEach: function() {
			Controller.registerExtensionProvider("example.ExtensionProvider");

			var oXMLContent = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" controllerName="example.BaseController" xmlns="sap.m">',
				'  <Button id="btn1"></Button>',
				'</mvc:View>'
			].join('');

			this.view = sap.ui.xmlview({
				viewContent: oXMLContent,
				async: true
			});

		},
		afterEach: function() {
			//jQuery.sap.setObject("sample.ExtensionProvider", null);
			Controller._sExtensionProvider = null;
			this.view.destroy();
			this.view = null;
		}
	});
	QUnit.test("Public private checks", function(assert) {
		var done = assert.async();
		this.view.loaded()
			.then(function(oView) {
				this.oview = oView;
				var oController = this.view.getController(),
					oExtension = oController.extension1,
					oProviderExt1 = oController.extension.example.ProviderExt1,
					oProviderExt2 = oController.extension.example.ProviderExt2;


				//check publicMethod is available and accessible
				assert.strictEqual(typeof oExtension.publicMethod, "function", "extension1.publicMethod is a function");
				assert.strictEqual(typeof oProviderExt1.publicMethod, "function", "ext.example.ProviderExt1.publicMethod is a function");
				assert.strictEqual(typeof oProviderExt2.publicMethod, "function", "ext.example.ProviderExt2.publicMethod is a function");
				assert.strictEqual(oExtension.publicMethod(), "publicMethodOnExtension", "extension1.publicMethod can be called without error");
				assert.strictEqual(oProviderExt1.publicMethod(), "publicMethodOnExtension", "ext.example.ProviderExt1.publicMethod can be called without error");
				assert.strictEqual(oProviderExt2.publicMethod(), "publicMethodOnExtension", "ext.example.ProviderExt2.publicMethod can be called without error");

				//base not in public scope
				assert.strictEqual(oExtension.base, undefined, "extension1.base is not in public scope");
				assert.strictEqual(oProviderExt1.base, undefined, "ext.example.ProviderExt1.base is not in public scope");
				assert.strictEqual(oProviderExt2.base, undefined, "ext.example.ProviderExt2.base is not in public scope");

				//check calling private and public method from a public method
				assert.strictEqual(typeof oExtension.callingPublicAndPrivateMethod, "function", "extension1.callingPublicAndPrivateMethod is a function");
				assert.strictEqual(typeof oProviderExt1.callingPublicAndPrivateMethod, "function", "ext.example.ProviderExt1.callingPublicAndPrivateMethod is a function");
				assert.strictEqual(typeof oProviderExt2.callingPublicAndPrivateMethod, "function", "ext.example.ProviderExt2.callingPublicAndPrivateMethod is a function");
				assert.strictEqual(oExtension.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "extension.callingPublicAndPrivateMethod can be called");
				assert.strictEqual(oProviderExt1.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "ext.example.ProviderExt1.callingPublicAndPrivateMethod can be called");
				assert.strictEqual(oProviderExt2.callingPublicAndPrivateMethod(),"publicMethodOnExtensionprivateMethodOnExtension", "ext.example.ProviderExt2.callingPublicAndPrivateMethod can be called");

				//check calling base object within a public method
				assert.strictEqual(typeof oExtension.getBase, "function", "extension1.getBase is a function");
				assert.strictEqual(typeof oProviderExt1.getBase, "function", "ext.example.ProviderExt1.getBase is a function");
				assert.strictEqual(typeof oProviderExt2.getBase, "function", "ext.example.ProviderExt2.getBase is a function");
				//lifecycle
				assert.strictEqual(oExtension.getBase().onInit, undefined, "extension.getBase returns the public interface of the controller, lifecycle init not available");
				assert.strictEqual(oExtension.getBase().onExit, undefined, "extension.getBase returns the public interface of the controller, lifecycle exit not available");
				assert.strictEqual(oExtension.getBase().onBeforeRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle beforerendering not available");
				assert.strictEqual(oExtension.getBase().onAfterRendering, undefined, "extension.getBase returns the public interface of the controller, lifecycle afterrendering not available");
				assert.strictEqual(oProviderExt1.getBase().onInit, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle init not available");
				assert.strictEqual(oProviderExt1.getBase().onExit, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle exit not available");
				assert.strictEqual(oProviderExt1.getBase().onBeforeRendering, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle beforerendering not available");
				assert.strictEqual(oProviderExt1.getBase().onAfterRendering, undefined, "ext.example.ProviderExt1.getBase returns the public interface of the controller, lifecycle afterrendering not available");
				assert.strictEqual(oProviderExt2.getBase().onInit, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle init not available");
				assert.strictEqual(oProviderExt2.getBase().onExit, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle exit not available");
				assert.strictEqual(oProviderExt2.getBase().onBeforeRendering, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle beforerendering not available");
				assert.strictEqual(oProviderExt2.getBase().onAfterRendering, undefined, "ext.example.ProviderExt2.getBase returns the public interface of the controller, lifecycle afterrendering not available");
				//private
				assert.ok(!oExtension.getBase()._increaseLifecycleCall, "extension1.getBase()._increaseLifecycleCall cannot be accessed");
				assert.ok(!oProviderExt1.getBase()._increaseLifecycleCall, "ext.example.ProviderExt1.getBase()._increaseLifecycleCall cannot be accessed");
				assert.ok(!oProviderExt2.getBase()._increaseLifecycleCall, "ext.example.ProviderExt2.getBase()._increaseLifecycleCall cannot be accessed");

				aPublicExpected.filter(
					function(sName) {
						assert.strictEqual(typeof oExtension[sName], "function", "extension: function " + sName + " available");
						assert.strictEqual(typeof oProviderExt1[sName], "function", "ext.example.ProviderExt1: function " + sName + " available");
						assert.strictEqual(typeof oProviderExt2[sName], "function", "ext.example.ProviderExt2: function " + sName + " available");
					}
				);

				assert.strictEqual(aPublicExpected.length, Object.keys(oExtension).length, "extension: has the right amount of public functions");
				assert.strictEqual(aPublicExpected.length, Object.keys(oProviderExt1).length, "ext.example.ProviderExt1: has the right amount of public functions");
				assert.strictEqual(aPublicExpected.length, Object.keys(oProviderExt2).length, "ext.example.ProviderExt2: has the right amount of public functions");


				//methods with _ throw private error if called
				assert.ok(!oExtension._privateMethod, "extension1._privateMethod cannot be accessed");
				assert.ok(!oExtension._increaseLifecycleCall, "extension1._increaseLifecycleCall cannot be accessed");
				//oProviderExt1
				assert.ok(!oProviderExt1._privateMethod, "ext.example.ProviderExt1._privateMethod cannot be accessed");
				assert.ok(!oProviderExt1._increaseLifecycleCall, "ext.example.ProviderExt1._increaseLifecycleCall cannot be accessed");
				//oProviderExt2
				assert.ok(!oProviderExt2._privateMethod, "ext.example.ProviderExt2._privateMethod cannot be accessed");
				assert.ok(!oProviderExt2._increaseLifecycleCall, "ext.example.ProviderExt2._increaseLifecycleCall cannot be accessed");
				done();
			}.bind(this));
		});

	QUnit.test("Override checks", function(assert) {
		var done = assert.async();
		this.view.loaded()
			.then(function(oView) {
				this.oview = oView;
				var oController = this.view.getController(),
					oExtension = oController.extension1;
				assert.strictEqual(oController.publicWithCallbackMethod(), "callbackOfProviderExt2", "controller.publicWithCallbackMethod returns 'callbackOfProviderExt2'");
				assert.strictEqual(oExtension.getBase().publicWithCallbackMethod(), "callbackOfProviderExt2", "extension.getBase().publicWithCallbackMethod returns 'callbackOfProviderExt2'");
				done();
			}.bind(this));
	});

	//TODO: Test to bind event and formatter from view to public methods of extension
	//TODO: Test to bind event and formatter from view to private methods of extension (do we allow this?)

});