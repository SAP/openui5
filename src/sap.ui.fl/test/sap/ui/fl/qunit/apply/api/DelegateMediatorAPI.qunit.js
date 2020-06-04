/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/CustomData",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/Panel",
	"sap/ui/rta/enablement/TestDelegate",
	"sap/ui/thirdparty/sinon-4"
], function(
	DelegateMediator,
	DelegateMediatorAPI,
	JsControlTreeModifier,
	XmlTreeModifier,
	CustomData,
	ODataV2Model,
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

	QUnit.module("Given 'getDelegateForControl' function is called", {
		beforeEach: function () {
			this.mPropertyBag = {
				modelType: "sap.ui.model.odata.v2.ODataModel",
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
		function createPropertyBag(oControl, oModifier, sModelType) {
			return {
				control: oControl,
				modifier: oModifier,
				modelType: sModelType
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

		QUnit.test("When it is called with delegate specified as default delegate (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.strictEqual(mDelegateInfo.name, this.mPropertyBag.delegate, "then the default delegate info is returned");
				}.bind(this));
		});

		QUnit.test("When it is called with delegate specified as default delegate (JS Case)", function (assert) {
			this.oPanel.setModel(ODataV2Model);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.strictEqual(mDelegateInfo.name, this.mPropertyBag.delegate, "then the default delegate info is returned");
				}.bind(this));
		});

		QUnit.test("When it is called with delegate specified into the control custom data and without default delegate registration", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the specific delegate info is returned");
				});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and default delegate registration is available", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			this.oPanel.setModel(ODataV2Model);
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: "sap.ui.model.odata.v2.ODataModel",
				delegate: "notExistingDelegate/WouldBreakIfDefaultDelegateGetLoaded"
			});
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the specific delegate info is returned");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});