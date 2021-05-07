/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/ChangeRegistryItem",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/changeHandler/AddXML",
	"sap/ui/fl/Layer",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	JsControlTreeModifier,
	ChangeHandlerRegistration,
	ChangeRegistry,
	ChangeRegistryItem,
	MoveControlsChangeHandler,
	AddXMLChangeHandler,
	Layer,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a ChangeRegistry instance...", {
		beforeEach: function () {
			this.oChangeRegistry = ChangeRegistry.getInstance();
			ChangeHandlerRegistration.registerPredefinedChangeHandlers();
		},
		afterEach: function () {
			delete ChangeRegistry._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getInstance", function (assert) {
			var changeRegistryInstance = ChangeRegistry.getInstance();
			assert.ok(changeRegistryInstance);
		});

		QUnit.test("_createChangeRegistryItemForSimpleChange - when we register a change with an unsupported layer in change.layers", function(assert) {
			var simpleDummyControlChange1 = {
				changeType: "myChangeType1",
				changeHandler: {}, // stub
				layers: {
					unsupportedLayer: true
				}
			};
			assert.throws(function() {
				this.oChangeRegistry._createChangeRegistryItemForSimpleChange("sap.ui.fl.DummyControl1", simpleDummyControlChange1);
			}, "then we throw an error");
		});

		QUnit.test("registerPredefinedChangeHandlers", function(assert) {
			this.oChangeRegistry.registerPredefinedChangeHandlers("foo", "bar");
			assert.strictEqual(this.oChangeRegistry._oDefaultChangeHandlers, "foo", "the first property is saved properly");
			assert.strictEqual(this.oChangeRegistry._mDeveloperModeChangeHandlers, "bar", "the first property is saved properly");
		});

		QUnit.test("when _getInstanceSpecificChangeRegistryItem is called without flexibility path defined on given control", function (assert) {
			var oGetChangeHandlerModuleStub = sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns(null);
			var oControl = {};
			var oSimpleChangeObject = {};

			return this.oChangeRegistry._getInstanceSpecificChangeRegistryItem(oSimpleChangeObject, oControl, JsControlTreeModifier)
				.then(function(oChangeRegistryItem) {
					assert.equal(oGetChangeHandlerModuleStub.callCount, 1, "then getChangeHandlerModule function is called");
					assert.equal(oChangeRegistryItem, undefined, "then no registry item is returned");
				});
		});

		QUnit.test("when _getInstanceSpecificChangeRegistryItem is called with invalid flexibility path defined on given control", function (assert) {
			assert.expect(3);
			var oGetChangeHandlerModuleStub = sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("invalid/path/TestChangeHandlers");
			var oControl = {};
			var sControlId = "controlId";
			var sPropertyBindingChangeType = "propertyBindingChange";
			var oExplicitRegisteredChangeHandlerStub = {};
			var oSimpleChangeObject = {
				changeType: sPropertyBindingChangeType,
				changeHandler: oExplicitRegisteredChangeHandlerStub
			};
			sandbox.stub(JsControlTreeModifier, "getId").returns(sControlId);
			sandbox.stub(Log, "error").callsFake(function(sErrorMessage) {
				if (sErrorMessage.indexOf(sControlId) !== -1) {
					assert.ok(true, "then error was logged");
				}
			});

			return this.oChangeRegistry._getInstanceSpecificChangeRegistryItem(oSimpleChangeObject, oControl, JsControlTreeModifier)
				.then(function(oChangeRegistryItem) {
					assert.equal(oGetChangeHandlerModuleStub.callCount, 1, "then getChangeHandlerModule function is called");
					assert.equal(oChangeRegistryItem, undefined, "then no registry item is returned");
				});
		});

		QUnit.test("when _getInstanceSpecificChangeRegistryItem is called and passed parameter is a valid changeType", function (assert) {
			var oErrorLoggingStub = sandbox.stub(Log, "error");
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("controlType");
			var oControl = {};

			var sChangeType = "doSomething";

			return this.oChangeRegistry._getInstanceSpecificChangeRegistryItem(sChangeType, oControl, JsControlTreeModifier)
				.then(function(oChangeRegistryItem) {
					assert.equal(oErrorLoggingStub.callCount, 0, "then no error was logged");
					assert.ok(oChangeRegistryItem instanceof ChangeRegistryItem, "then registry item is returned");
					assert.equal(oChangeRegistryItem.getChangeTypeName(), sChangeType, "then returned registry item has the correct changeType");
				});
		});

		QUnit.test("when _getInstanceSpecificChangeRegistryItem is called and passed parameter is a change with a valid changeType", function (assert) {
			var oErrorLoggingStub = sandbox.stub(Log, "error");
			var oGetChangeHandlerModuleStub = sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("controlType");
			var oControl = {};
			var sChangeType = "doSomethingElse";
			return this.oChangeRegistry._getInstanceSpecificChangeRegistryItem(sChangeType, oControl, JsControlTreeModifier)
				.then(function(oChangeRegistryItem) {
					assert.equal(oGetChangeHandlerModuleStub.callCount, 1, "then getChangeHandlerModule function is called");
					assert.equal(oErrorLoggingStub.callCount, 0, "then no error was logged");
					assert.ok(oChangeRegistryItem instanceof ChangeRegistryItem, "then registry item is returned");
					assert.equal(oChangeRegistryItem.getChangeTypeName(), sChangeType, "then returned registry item has the correct changeType");
				});
		});

		// TODO: re-enable when getChangeHandler function is moved
		QUnit.skip("when getChangeHandler is called for a control without instance specific changeHandler", function (assert) {
			var oControl = {};
			var sChangeType = "moveControls";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			var oErrorLoggingStub;
			var oGetChangeHandlerModuleStub;
			return this.oChangeRegistry.registerControlsForChanges({
				VerticalLayout: {
					moveControls: "default"
				}
			})
				.then(function() {
					oErrorLoggingStub = sandbox.stub(Log, "error");
					oGetChangeHandlerModuleStub = sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
					sandbox.stub(JsControlTreeModifier, "getControlType").returns(sControlType);

					return this.oChangeRegistry.getChangeHandler(sChangeType, sControlType, oControl, JsControlTreeModifier, sLayer);
				}.bind(this))
				.then(function(oChangeHandler) {
					assert.equal(oGetChangeHandlerModuleStub.callCount, 1, "then getChangeHandlerModule function is called");
					assert.equal(oErrorLoggingStub.callCount, 0, "then no error was logged");
					assert.equal(oChangeHandler, MoveControlsChangeHandler, "then correct changehandler is returned");
				});
		});

		// TODO: re-enable when getChangeHandler function is moved
		QUnit.skip("when getChangeHandler is called for a control with instance specific and default changeHandlers", function (assert) {
			var oControl = {};
			var sChangeType = "doSomething";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("VerticalLayout");
			return this.oChangeRegistry.registerControlsForChanges({
				VerticalLayout: {
					doSomething: "default"
				}
			})
				.then(function() {
					return this.oChangeRegistry.getChangeHandler(sChangeType, sControlType, oControl, JsControlTreeModifier, sLayer);
				}.bind(this))
				.then(function(oChangeHandler) {
					assert.equal(oChangeHandler.dummyId, "testChangeHandler-doSomething", "then instance specific changehandler is returned");
				});
		});

		QUnit.test("when getChangeHandler is called for a control with instance specific changeHandler but with the wrong layer", function (assert) {
			var oControl = {};
			var sChangeType = "doSomething";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlersUserLayer.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("VerticalLayout");
			return this.oChangeRegistry.getChangeHandler(sChangeType, sControlType, oControl, JsControlTreeModifier, sLayer)
			.catch(function(oError) {
				assert.equal(oError.message, "Change type " + sChangeType + " not enabled for layer " + sLayer, "then an error is thrown");
			});
		});

		// TODO: re-enable when getChangeHandler function is moved
		QUnit.skip("when getChangeHandler is called for previously existing changetype and existing instance specific changehandler for another changetype", function (assert) {
			var oControl = {};
			var sChangeType = "moveControls";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("VerticalLayout");
			return this.oChangeRegistry.registerControlsForChanges({
				VerticalLayout: {
					moveControls: "default"
				}
			})
				.then(function() {
					return this.oChangeRegistry.getChangeHandler(sChangeType, sControlType, oControl, JsControlTreeModifier, sLayer);
				}.bind(this))
				.then(function(oChangeHandler) {
					assert.equal(oChangeHandler, MoveControlsChangeHandler, "then correct default changehandler is returned");
				});
		});

		QUnit.test("when getChangeHandler is called for without a handler registered for the control", function (assert) {
			var oControl = {};
			var sChangeType = "moveControls";
			var sControlType = "myFancyControl";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("myFancyControl");

			return this.oChangeRegistry.getChangeHandler(sChangeType, sControlType, oControl, JsControlTreeModifier, sLayer)
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				assert.ok(oError, "the function rejects with an error");
				assert.ok(oError.message.indexOf("No Change handler registered for the Control and Change type") > -1, "the error contains the correct message");
			});
		});

		QUnit.test("when getChangeHandler is called without control type specified", function (assert) {
			var oControl = {};
			var sChangeType = "addXML";
			var sControlType;
			var sLayer = Layer.VENDOR;

			return this.oChangeRegistry.getChangeHandler(sChangeType, sControlType, oControl, JsControlTreeModifier, sLayer)
			.then(function(oChangeHandler) {
				assert.strictEqual(oChangeHandler, AddXMLChangeHandler, "then the function should return the change handler specified just by change type");
			})
			.catch(function(oError) {
				assert.notOk(oError, "then the function should not rejects with an error");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
