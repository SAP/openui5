/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/CustomData",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel",
	"sap/ui/rta/enablement/TestDelegate",
	"sap/ui/thirdparty/sinon-4"
], function(
	DelegateMediator,
	DelegateMediatorAPI,
	JsControlTreeModifier,
	XmlTreeModifier,
	CustomData,
	JSONModel,
	Panel,
	TestDelegate,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given 'registerDefaultDelegate' function is called", {
		beforeEach: function () {
			this.mPropertyBag = {
				modelType: "test_modelType",
				delegate: "test_delegate"
			};
		},
		afterEach: function() {
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("When it is called with invalid delegate property", function (assert) {
			delete this.mPropertyBag.delegate;
			assert.throws(function () {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /'modelType' and 'delegate' properties are required for registration!/, "then an exception is thrown");
		});

		QUnit.test("When it is called with invalid modelType property", function (assert) {
			delete this.mPropertyBag.modelType;
			assert.throws(function () {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /'modelType' and 'delegate' properties are required for registration!/, "then an exception is thrown");
		});

		QUnit.test("When it is called with valid property bag", function (assert) {
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType), "then the delegate is registered successfull with the given modelType");
		});

		QUnit.test("When try to register the same modelType twice", function (assert) {
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.throws(function () {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /is already defined!/, "then an exception is thrown");
		});
	});
	//ensure a default delegate exists for a model not used anywhere else
	var SomeModel = JSONModel.extend("sap.ui.fl.qunit.test.Model");

	QUnit.module("Given 'getDelegateForControl' function is called", {
		beforeEach: function () {
			this.mPropertyBag = {
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate"
			};
			this.oPanel = new Panel("test_panel");
			this.oDelegateCustomData = {
				key: "sap-ui-custom-settings",
				value: {
					"sap.ui.fl": {
						delegate: '{"name": "sap/ui/rta/enablement/TestDelegate"}'
					}
				}
			};
		},
		afterEach: function() {
			DelegateMediator.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		function createPropertyBag(oControl, oModifier, sModelType, bSupportsDefault) {
			return {
				control: oControl,
				modifier: oModifier,
				modelType: sModelType,
				supportsDefault: bSupportsDefault
			};
		}

		QUnit.test("When it is called with undefined control property", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(undefined, JsControlTreeModifier))
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The control parameter is missing", "then an exception is thrown");
				});
		});

		QUnit.test("When it is called with invalid control property", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag({ id: "test_object" }, JsControlTreeModifier))
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The input control should be a managed object", "then an exception is thrown");
				});
		});

		QUnit.test("When it is called with undefined modifier property", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, undefined))
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The modifier parameter is missing", "then an exception is thrown");
				});
		});

		QUnit.test("When it is called without delegate specified", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (vReturnValue) {
					assert.notOk(vReturnValue, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When it is called without delegate specified (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier))
				.then(function (vReturnValue) {
					assert.notOk(vReturnValue, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When it is called with delegate specified as default delegate (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType, true))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.strictEqual(mDelegateInfo.name, this.mPropertyBag.delegate, "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.deepEqual(mDelegateInfo.modelType, this.mPropertyBag.modelType, "then the default delegate info contains the modelType");
				}.bind(this));
		});

		QUnit.test("When it is called with delegate specified as default delegate (JS Case)", function (assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.strictEqual(mDelegateInfo.name, this.mPropertyBag.delegate, "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.deepEqual(mDelegateInfo.modelType, SomeModel.getMetadata().getName(), "then the default delegate info contains the modelType");
				}.bind(this));
		});

		QUnit.test("When default delegate is available, but default delegate should be ignored (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType))
				.then(function (mDelegateInfo) {
					assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When default delegate is available, but default delegate should be ignored (XML Case)", function (assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and without default delegate registration", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the specific delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the specific delegate info contains an empty payload");
					assert.notOk(mDelegateInfo.modelType, "then modelType 'undefined' is returned");
				});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and default delegate registration is available", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "notExistingDelegate/WouldBreakIfDefaultDelegateGetLoaded"
			});
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the specific delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the specific delegate info contains an empty payload");
					assert.notOk(mDelegateInfo.modelType, "then modelType 'undefined' is returned");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
