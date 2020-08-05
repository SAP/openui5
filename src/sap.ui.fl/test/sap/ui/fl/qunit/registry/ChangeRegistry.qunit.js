/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/ChangeRegistryItem",
	"sap/ui/fl/registry/SimpleChanges",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/changeHandler/AddXML",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/Layer",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function(
	jQuery,
	JsControlTreeModifier,
	ChangeRegistry,
	ChangeRegistryItem,
	SimpleChanges,
	MoveControlsChangeHandler,
	AddXMLChangeHandler,
	UnhideControlChangeHandler,
	HideControlChangeHandler,
	Layer,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.registry.ChangeRegistry", {
		beforeEach: function () {
			this.oChangeRegistry = new ChangeRegistry();
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getInstance", function (assert) {
			var changeRegistryInstance = ChangeRegistry.getInstance();
			assert.ok(changeRegistryInstance);
		});

		QUnit.test("on load uxap changeHandler are registered", function (assert) {
			var changeRegistryInstance = ChangeRegistry.getInstance();

			assert.ok(changeRegistryInstance._registeredItems, "sap.uxap.ObjectPageLayout");
			assert.ok(changeRegistryInstance._registeredItems, "sap.uxap.ObjectPageSection");
		});

		QUnit.test("constructor", function (assert) {
			assert.ok(this.oChangeRegistry);
			assert.deepEqual(this.oChangeRegistry._registeredItems, {});
		});

		QUnit.test("addRegistryItem", function (assert) {
			var registryItem = {
				getControlType: function () {
					return "sap.ui.fl.DummyControl";
				},
				getChangeTypeName: function () {
					return "myChangeType";
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 1);
			assert.strictEqual(this.oChangeRegistry._registeredItems["sap.ui.fl.DummyControl"]["myChangeType"], registryItem);
		});

		QUnit.test("removeRegistryItem - remove complete item", function (assert) {
			var registryItem = {
				getControlType: function () {
					return "sap.ui.fl.DummyControl";
				},
				getChangeTypeName: function () {
					return "myChangeType";
				}
			};
			this.oChangeRegistry.addRegistryItem(registryItem);

			var mParam = {
				controlType: "sap.ui.fl.DummyControl",
				changeTypeName: "myChangeType"
			};
			this.oChangeRegistry.removeRegistryItem(mParam);

			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 0);
		});

		QUnit.test("removeRegistryItem - remove changetypemetadata only", function (assert) {
			var registryItem1 = {
				getControlType: function () {
					return "sap.ui.fl.DummyControl";
				},
				getChangeTypeName: function () {
					return "myChangeType";
				}
			};
			var registryItem2 = {
				getControlType: function () {
					return "sap.ui.fl.DummyControlGroup";
				},
				getChangeTypeName: function () {
					return "myChangeType";
				}
			};
			this.oChangeRegistry.addRegistryItem(registryItem1);
			this.oChangeRegistry.addRegistryItem(registryItem2);
			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 2);

			var mParam = {
				changeTypeName: "myChangeType"
			};
			this.oChangeRegistry.removeRegistryItem(mParam);

			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 2);
			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems["sap.ui.fl.DummyControl"]).length, 0);
			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems["sap.ui.fl.DummyControlGroup"]).length, 0);
		});

		QUnit.test("removeRegistryItem - remove complete controltype", function (assert) {
			var registryItem1 = {
				getControlType: function () {
					return "sap.ui.fl.DummyControl";
				},
				getChangeTypeName: function () {
					return "myChangeType1";
				}
			};
			var registryItem2 = {
				getControlType: function () {
					return "sap.ui.fl.DummyControlGroup";
				},
				getChangeTypeName: function () {
					return "myChangeType2";
				}
			};
			this.oChangeRegistry.addRegistryItem(registryItem1);
			this.oChangeRegistry.addRegistryItem(registryItem2);
			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 2);

			var mParam = {
				controlType: "sap.ui.fl.DummyControl"
			};
			this.oChangeRegistry.removeRegistryItem(mParam);

			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 1);
			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems["sap.ui.fl.DummyControlGroup"]).length, 1);
			assert.deepEqual(this.oChangeRegistry._registeredItems["sap.ui.fl.DummyControlGroup"]["myChangeType2"], registryItem2);
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

		QUnit.test("registerChangeHandlersForControl understands 'default' as a parameter", function (assert) {
			var someChangeType = "someChange";
			var sSomeChangeModuleName = "some/module/name";
			var sHideControlChangeType = "hideControl";

			var sControlType = "my.control.Implementation";
			var oChangeHandlers = {};
			oChangeHandlers[someChangeType] = sSomeChangeModuleName;
			oChangeHandlers[sHideControlChangeType] = "default";

			var registerControlStub = sandbox.stub(this.oChangeRegistry, "registerControlForSimpleChange");

			return this.oChangeRegistry._registerChangeHandlersForControl(sControlType, oChangeHandlers)
			.then(function() {
				assert.equal(registerControlStub.callCount, 2, "two change handlers were registered for the control");
				assert.equal(registerControlStub.firstCall.args[0], sControlType, "the first registration was for the passed control");
				assert.equal(registerControlStub.firstCall.args[1].changeType, someChangeType, "the some change type was registered");
				assert.equal(registerControlStub.firstCall.args[1].changeHandler, sSomeChangeModuleName, "the 'some/module/name' module was registerd for the 'some change' type");
				assert.equal(registerControlStub.secondCall.args[0], sControlType, "the second registration was for the passed control");
				assert.equal(registerControlStub.secondCall.args[1].changeType, sHideControlChangeType, "the hideControl change type was registered");
				assert.equal(registerControlStub.secondCall.args[1].changeHandler, this.oChangeRegistry._oDefaultChangeHandlers[sHideControlChangeType], "the default change handler was registerd for the 'hideControl' type");
			}.bind(this));
		});

		QUnit.test("registerChangeHandlersForControl understands {changeHandler: 'default'} as a parameter", function (assert) {
			var someChangeType = "someChange";
			var sSomeChangeModuleName = "some/module/name";
			var sHideControlChangeType = "hideControl";

			var sControlType = "my.control.Implementation";
			var oChangeHandlers = {};
			oChangeHandlers[someChangeType] = sSomeChangeModuleName;
			oChangeHandlers[sHideControlChangeType] = {
				changeHandler: "default"
			};

			var registerControlStub = sandbox.stub(this.oChangeRegistry, "registerControlForSimpleChange");

			return this.oChangeRegistry._registerChangeHandlersForControl(sControlType, oChangeHandlers)
			.then(function() {
				assert.equal(registerControlStub.callCount, 2, "two change handlers were registered for the control");
				assert.equal(registerControlStub.firstCall.args[0], sControlType, "the first registration was for the passed control");
				assert.equal(registerControlStub.firstCall.args[1].changeType, someChangeType, "the some change type was registered");
				assert.equal(registerControlStub.firstCall.args[1].changeHandler, sSomeChangeModuleName, "the 'some/module/name' module was registerd for the 'some change' type");
				assert.equal(registerControlStub.secondCall.args[0], sControlType, "the second registration was for the passed control");
				assert.equal(registerControlStub.secondCall.args[1].changeType, sHideControlChangeType, "the hideControl change type was registered");
				assert.equal(registerControlStub.secondCall.args[1].changeHandler, this.oChangeRegistry._oDefaultChangeHandlers[sHideControlChangeType], "the default change handler was registerd for the 'hideControl' type");
			}.bind(this));
		});

		QUnit.test("registerChangeHandlersForControl understands a module path as a parameter", function (assert) {
			var sControlType = "my.control.Implementation";
			var oChangeHandlers = "sap/ui/fl/test/registry/TestChangeHandlers";

			var registerControlStub = sandbox.stub(this.oChangeRegistry, "registerControlForSimpleChange");

			return this.oChangeRegistry._registerChangeHandlersForControl(sControlType, oChangeHandlers)
			.then(function() {
				assert.equal(registerControlStub.callCount, 2, "two change handlers were registered for the control");
				assert.equal(registerControlStub.firstCall.args[0], sControlType, "the first registration was for the passed control");
				assert.equal(registerControlStub.firstCall.args[1].changeType, "doSomething", "the some change type was registered");
				assert.equal(registerControlStub.secondCall.args[0], sControlType, "the second registration was for the passed control");
				assert.equal(registerControlStub.secondCall.args[1].changeType, "doSomethingElse", "the hideControl change type was registered");
			});
		});

		QUnit.test("registerChangeHandlersForControl does not crash if the loading of a module path leads to an error (file not found)", function (assert) {
			assert.expect(3);
			var sControlType = "my.control.Implementation";
			var oChangeHandlers = "sap/ui/fl/test/registry/DefinitelyNotAChangeHandlers";
			var fnRegisterControlStub = sandbox.stub(this.oChangeRegistry, "registerControlForSimpleChange");
			sandbox.stub(Log, "error").callsFake(function (sErrorMessage) {
				if (sErrorMessage.indexOf(sControlType) !== -1) {
					assert.ok(true, "then error was logged");
				}
			});

			return this.oChangeRegistry._registerChangeHandlersForControl(sControlType, oChangeHandlers)
			.then(function() {
				assert.ok(true, "the js processing continues");
				assert.equal(fnRegisterControlStub.callCount, 0, "no registration was done");
			});
		});

		QUnit.test("registerChangeHandlersForControl does not crash if the loading of a module path leads to an error (broken file)", function (assert) {
			var sControlType = "my.control.Implementation";
			var sChangeHandler = "sap/ui/fl/test/registry/TestChangeHandlersBROKEN";
			var registerControlStub = sandbox.stub(this.oChangeRegistry, "registerControlForSimpleChange");
			var errorLoggingStub = sandbox.stub(Log, "error");
			sandbox.stub(sap.ui, "require")
				.callsArgWithAsync(2, {message: "error"});

			return this.oChangeRegistry._registerChangeHandlersForControl(sControlType, sChangeHandler)
			.then(function() {
				assert.ok(true, "the js processing continues");
				assert.equal(registerControlStub.callCount, 0, "no registration was done");
				assert.equal(errorLoggingStub.callCount, 1, "the error was logged");
			});
		});

		QUnit.test("registerControlsForChanges shall add a map of controls and changes to the registry", function (assert) {
			var sLayer = Layer.CUSTOMER;
			return this.oChangeRegistry.registerControlsForChanges({
				controlA: [SimpleChanges.unhideControl, SimpleChanges.hideControl],
				controlB: [SimpleChanges.unhideControl, SimpleChanges.hideControl]
			})
				.then(this.oChangeRegistry.getChangeHandler.bind(this.oChangeRegistry, "unhideControl", "controlA", undefined, JsControlTreeModifier, sLayer))
				.then(function (oChangeHandler) {
					assert.strictEqual(oChangeHandler, UnhideControlChangeHandler, "then the corresponding changehandler is registered in a new registry item.");
				})
				.then(this.oChangeRegistry.getChangeHandler.bind(this.oChangeRegistry, "hideControl", "controlA", undefined, JsControlTreeModifier, sLayer))
				.then(function (oChangeHandler) {
					assert.strictEqual(oChangeHandler, HideControlChangeHandler, "then the corresponding changehandler is registered in a new registry item.");
				})
				.then(this.oChangeRegistry.getChangeHandler.bind(this.oChangeRegistry, "unhideControl", "controlB", undefined, JsControlTreeModifier, sLayer))
				.then(function (oChangeHandler) {
					assert.strictEqual(oChangeHandler, UnhideControlChangeHandler, "then the corresponding changehandler is registered in a new registry item.");
				})
				.then(this.oChangeRegistry.getChangeHandler.bind(this.oChangeRegistry, "hideControl", "controlB", undefined, JsControlTreeModifier, sLayer))
				.then(function (oChangeHandler) {
					assert.strictEqual(oChangeHandler, HideControlChangeHandler, "then the corresponding changehandler is registered in a new registry item.");
				});
		});

		QUnit.test("registerControlsForChanges: when adding a propertyChange or propertyBindingChange without 'default' changeHandler", function (assert) {
			return this.oChangeRegistry.registerControlsForChanges({
				controlA: {
					propertyChange: {
						changeHandler: {}
					}
				}
			})
			.catch(function() {
				assert.ok(true, "then it should reject the promise");
			})
			.then(function() {
				return this.oChangeRegistry.registerControlsForChanges({
					controlA: {
						propertyBindingChange: {
							changeHandler: {}
						}
					}
				});
			}.bind(this))
			.catch(function() {
				assert.ok(true, "then it should reject the promise");
			});
		});

		QUnit.test("registerControlForSimpleChange shall do nothing if mandatory parameters are missing", function (assert) {
			this.oChangeRegistry.registerControlForSimpleChange(null, null);

			assert.strictEqual(Object.keys(this.oChangeRegistry._registeredItems).length, 0, "There shall be no registered items");
		});

		QUnit.test("registerControlForSimpleChange shall add a new registry item", function (assert) {
			var sLayer = Layer.CUSTOMER;
			this.oChangeRegistry.registerControlForSimpleChange("ganttChart", SimpleChanges.unhideControl);

			return this.oChangeRegistry.getChangeHandler("unhideControl", "ganttChart", undefined, JsControlTreeModifier, sLayer)
				.then(function (oChangeHandler) {
					assert.strictEqual(oChangeHandler, UnhideControlChangeHandler, "then the corresponding changehandler is registered in a new registry item.");
				});
		});

		QUnit.test("can determine if a given control has registered change handlers", function (assert) {
			var sControlType = "sap.ui.fl.DummyControl";

			var registryItem = {
				getControlType: function () {
					return sControlType;
				},
				getChangeTypeName: function () {
					return "myChangeType";
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			var bHasRegisteredChangeHandlers = this.oChangeRegistry.hasRegisteredChangeHandlersForControl(sControlType);

			assert.strictEqual(bHasRegisteredChangeHandlers, true, "the registry tells that there is a registered change handler for the given control");
		});

		QUnit.test("can determine if a given control has NO registered change handlers", function (assert) {
			var sControlType = "sap.ui.fl.DummyControl";
			var sSomeOtherControlType = "sap.ui.fl.DummyControlWithNoHandlers";

			var registryItem = {
				getControlType: function () {
					return sControlType;
				},
				getChangeTypeName: function () {
					return "myChangeType";
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			var bHasRegisteredChangeHandlers = this.oChangeRegistry.hasRegisteredChangeHandlersForControl(sSomeOtherControlType);

			assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO a registered change handler for the given control");
		});

		QUnit.test("can determine if a given control has a change handler for a specific type of changes", function (assert) {
			var sControlType = "sap.ui.fl.DummyControl";
			var sChangeType = "myChangeType";

			var registryItem = {
				getControlType: function () {
					return sControlType;
				},
				getChangeTypeName: function () {
					return sChangeType;
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			var bHasRegisteredChangeHandlers = this.oChangeRegistry.hasChangeHandlerForControlAndChange(sControlType, sChangeType);

			assert.strictEqual(bHasRegisteredChangeHandlers, true, "the registry tells that there is a registered change handler for the given control and change");
		});

		QUnit.test("can determine if a given control has NOT a change handler for a specific change type if it has no change handlers at all registered for that control", function (assert) {
			var sControlType = "sap.ui.fl.DummyControl";
			var sChangeType = "myChangeType";
			var sSomeOtherControlType = "sap.ui.fl.DummyControlWithNoHandlers";

			var registryItem = {
				getControlType: function () {
					return sControlType;
				},
				getChangeTypeName: function () {
					return sChangeType;
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			var bHasRegisteredChangeHandlers = this.oChangeRegistry.hasChangeHandlerForControlAndChange(sSomeOtherControlType, sChangeType);

			assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO registered change handler for the given control and change");
		});

		QUnit.test("can determine if a given control has NOT a change handler for a specific change type if it has some change handlers registered for other change types for that control", function (assert) {
			var sControlType = "sap.ui.fl.DummyControl";
			var sChangeType = "myChangeType";
			var sSomeOtherChangeType = "myOtherChangeType";

			var registryItem = {
				getControlType: function () {
					return sControlType;
				},
				getChangeTypeName: function () {
					return sChangeType;
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			var bHasRegisteredChangeHandlers = this.oChangeRegistry.hasChangeHandlerForControlAndChange(sControlType, sSomeOtherChangeType);

			assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO registered change handler for the given control and change");
		});

		QUnit.test("can determine if a given control has NOT a change handler for a specific control if neither the control has registered change handlers nor the change handler is registered anywhere else", function (assert) {
			var sControlType = "sap.ui.fl.DummyControl";
			var sChangeType = "myChangeType";
			var sSomeOtherControlType = "sap.ui.fl.DummyControlWithNoHandlers";
			var sSomeOtherChangeType = "myOtherChangeType";

			var registryItem = {
				getControlType: function () {
					return sControlType;
				},
				getChangeTypeName: function () {
					return sChangeType;
				}
			};

			this.oChangeRegistry.addRegistryItem(registryItem);

			var bHasRegisteredChangeHandlers = this.oChangeRegistry.hasChangeHandlerForControlAndChange(sSomeOtherControlType, sSomeOtherChangeType);

			assert.strictEqual(bHasRegisteredChangeHandlers, false, "the registry tells that there is NO registered change handler for the given control and change");
		});

		QUnit.test("returns the property change handler for a control not having any explicit registered change handlers", function (assert) {
			var sControlType = "aControlType";
			var sPropertyChangeType = "propertyChange";

			var mRegistryItem = this.oChangeRegistry._getRegistryItem(sControlType, sPropertyChangeType);
			assert.equal(mRegistryItem, this.oChangeRegistry._oDefaultActiveChangeHandlers.propertyChange, "the default property change handler was retrieved");
		});

		QUnit.test("returns the property change handler for a control having other registered change handlers", function (assert) {
			var sControlType = "aControlType";
			var sPropertyChangeType = "propertyChange";

			this.oChangeRegistry._registeredItems[sControlType] = {
				someOtherChange: {}
			};

			var mRegistryItem = this.oChangeRegistry._getRegistryItem(sControlType, sPropertyChangeType);
			assert.equal(mRegistryItem, this.oChangeRegistry._oDefaultActiveChangeHandlers.propertyChange, "the default property change handler was retrieved");
		});

		QUnit.test("returns the explicit for a given control type registered change handler for the property changes", function (assert) {
			var sControlType = "aControlType";
			var sPropertyChangeType = "propertyChange";
			var oExplicitRegisteredChangeHandlerStub = {};
			var oSimpleChangeObject = {
				changeType: sPropertyChangeType,
				changeHandler: oExplicitRegisteredChangeHandlerStub
			};

			var oChangeRegistryItem = this.oChangeRegistry._createChangeRegistryItemForSimpleChange(sControlType, oSimpleChangeObject);

			this.oChangeRegistry._registeredItems[sControlType] = {
				someOtherChange: {},
				propertyChange: oChangeRegistryItem
			};

			var mRegistryItem = this.oChangeRegistry._getRegistryItem(sControlType, sPropertyChangeType);
			assert.equal(mRegistryItem, oChangeRegistryItem, "the explicit registered change handler item was retrieved");
		});

		QUnit.test("returns the property binding change handler for a control not having any explicit registered change handlers", function (assert) {
			var sControlType = "aControlType";
			var sPropertyBindingChangeType = "propertyBindingChange";

			var mRegistryItem = this.oChangeRegistry._getRegistryItem(sControlType, sPropertyBindingChangeType);
			assert.equal(mRegistryItem, this.oChangeRegistry._oDefaultActiveChangeHandlers.propertyBindingChange, "the default property binding change handler was retrieved");
		});

		QUnit.test("returns the property change handler for a control having other registered change handlers", function (assert) {
			var sControlType = "aControlType";
			var sPropertyBindingChangeType = "propertyBindingChange";

			this.oChangeRegistry._registeredItems[sControlType] = {
				someOtherChange: {}
			};

			var mRegistryItem = this.oChangeRegistry._getRegistryItem(sControlType, sPropertyBindingChangeType);
			assert.equal(mRegistryItem, this.oChangeRegistry._oDefaultActiveChangeHandlers.propertyBindingChange, "the default property binding change handler was retrieved");
		});

		QUnit.test("returns the explicit for a given control type registered change handler for the property binding changes", function (assert) {
			var sControlType = "aControlType";
			var sPropertyBindingChangeType = "propertyBindingChange";
			var oExplicitRegisteredChangeHandlerStub = {};
			var oSimpleChangeObject = {
				changeType: sPropertyBindingChangeType,
				changeHandler: oExplicitRegisteredChangeHandlerStub
			};

			var oChangeRegistryItem = this.oChangeRegistry._createChangeRegistryItemForSimpleChange(sControlType, oSimpleChangeObject);

			this.oChangeRegistry._registeredItems[sControlType] = {
				someOtherChange: {},
				propertyBindingChange: oChangeRegistryItem
			};

			var mRegistryItem = this.oChangeRegistry._getRegistryItem(sControlType, sPropertyBindingChangeType);
			assert.equal(mRegistryItem, oChangeRegistryItem, "the explicit registered change handler item was retrieved");
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
					// assert.equal(oGetChangeHandlerModuleStub.callCount, 1, "then getChangeHandlerModule function is called");
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

		QUnit.test("when getChangeHandler is called for a control without instance specific changeHandler", function (assert) {
			var oControl = {};
			var sChangeType = "moveControls";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			var oErrorLoggingStub;
			var oGetChangeHandlerModuleStub;
			return this.oChangeRegistry.registerControlsForChanges({
				VerticalLayout : {
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

		QUnit.test("when getChangeHandler is called for a control with instance specific and default changeHandlers", function (assert) {
			var oControl = {};
			var sChangeType = "doSomething";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("VerticalLayout");
			return this.oChangeRegistry.registerControlsForChanges({
				VerticalLayout : {
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

		QUnit.test("when getChangeHandler is called for previously existing changetype and existing instance specific changehandler for another changetype", function (assert) {
			var oControl = {};
			var sChangeType = "moveControls";
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("VerticalLayout");
			return this.oChangeRegistry.registerControlsForChanges({
				VerticalLayout : {
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
			var sControlType = "VerticalLayout";
			var sLayer = Layer.CUSTOMER;
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("VerticalLayout");

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

		QUnit.test("when getChangeHandler is called with invalid layer specified", function (assert) {
			var sControlType = "aControlType";
			var sPropertyBindingChangeType = "propertyBindingChange";
			var oExplicitRegisteredChangeHandlerStub = {};
			var sLayer = "INVALIDLAYER";
			var oSimpleChangeObject = {
				changeType: sPropertyBindingChangeType,
				changeHandler: oExplicitRegisteredChangeHandlerStub
			};
			this.oChangeRegistry.registerControlForSimpleChange(sControlType, oSimpleChangeObject);
			return this.oChangeRegistry.getChangeHandler(sPropertyBindingChangeType, sControlType, undefined, JsControlTreeModifier, sLayer)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "Change type " + sPropertyBindingChangeType + " not enabled for layer " + sLayer, "then an error is thrown");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
