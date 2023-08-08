/* global QUnit */

sap.ui.define([
	"rta/qunit/RtaQunitUtils",
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/ComponentLifecycleHooks",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Log,
	Core,
	AppDescriptorApplier,
	ApplyStrategyFactory,
	FlexState,
	ManifestUtils,
	ComponentLifecycleHooks,
	ControlVariantApplyAPI,
	ChangePersistence,
	FlexControllerFactory,
	Layer,
	Utils,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("componentLoadedHook", {
		beforeEach: function() {
			this.oConfig = {
				id: "componentId",
				componentData: {
					foo: "bar"
				},
				settings: {
					componentData: {
						bar: "baz"
					}
				},
				asyncHints: {
					requests: [
						{
							name: "sap.ui.fl.changes",
							reference: "componentName"
						}
					]
				}
			};
			this.oManifest = {
				"sap.app": {
					type: "application"
				},
				getEntry: function(key) {
					return this[key];
				}
			};
			this.oInitializeStub = sandbox.stub(FlexState, "initialize");
			this.oGetStrategyStub = sandbox.stub(ApplyStrategyFactory, "getRuntimeStrategy").returns("foobar");
			this.oApplyManifestChangesStub = sandbox.stub(AppDescriptorApplier, "applyChangesIncludedInManifest");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		[{
			text: "no manifest was passed",
			config: this.oConfig
		},
		{
			text: "the passed manifest does not contain a type",
			config: this.oConfig,
			manifest: {
				"sap.app": {},
				getEntry: function(key) {
					return this[key];
				}
			}
		},
		{
			text: "the passed manifest is not of the type 'application'",
			config: this.oConfig,
			manifest: {
				"sap.app": {
					type: "notAnApplication"
				},
				getEntry: function(key) {
					return this[key];
				}
			}
		},
		{
			text: "component ID is not passed",
			config: {},
			manifest: this.oManifest
		}].forEach(function(oTestInput) {
			var sName = "componentLoadedHook does nothing if " + oTestInput.text;
			QUnit.test(sName, function(assert) {
				ComponentLifecycleHooks.componentLoadedHook(oTestInput.config, oTestInput.manifest);
				assert.strictEqual(this.oInitializeStub.callCount, 0, "then flex state was not initialized");
				assert.strictEqual(this.oApplyManifestChangesStub.callCount, 0, "then no AppDescriptorChanges were applied");
			});
		});

		QUnit.test("with all necessary information and componentData and settings", function(assert) {
			ComponentLifecycleHooks.componentLoadedHook(this.oConfig, this.oManifest);
			assert.strictEqual(this.oInitializeStub.callCount, 1, "the flexState was initialized");
			assert.deepEqual(this.oInitializeStub.lastCall.args[0], {
				componentData: this.oConfig.componentData,
				asyncHints: this.oConfig.asyncHints,
				manifest: this.oManifest,
				componentId: this.oConfig.id
			}, "the passed object is correct");
			assert.strictEqual(this.oApplyManifestChangesStub.callCount, 1, "the AppDescriptorChanges were applied");
			assert.deepEqual(this.oApplyManifestChangesStub.lastCall.args[0], this.oManifest, "the manifest was passed");
			assert.deepEqual(this.oApplyManifestChangesStub.lastCall.args[1], "foobar", "the strategy was passed");
		});

		QUnit.test("with all necessary information and settings", function(assert) {
			delete this.oConfig.componentData;
			ComponentLifecycleHooks.componentLoadedHook(this.oConfig, this.oManifest);
			assert.strictEqual(this.oInitializeStub.callCount, 1, "the flexState was initialized");
			assert.deepEqual(this.oInitializeStub.lastCall.args[0], {
				componentData: this.oConfig.settings.componentData,
				asyncHints: this.oConfig.asyncHints,
				manifest: this.oManifest,
				componentId: this.oConfig.id
			}, "the passed object is correct");
			assert.strictEqual(this.oApplyManifestChangesStub.callCount, 1, "the AppDescriptorChanges were applied");
			assert.deepEqual(this.oApplyManifestChangesStub.lastCall.args[0], this.oManifest, "the manifest was passed");
			assert.deepEqual(this.oApplyManifestChangesStub.lastCall.args[1], "foobar", "the strategy was passed");
		});
	});

	QUnit.module("instanceCreatedHook", {
		beforeEach: function() {
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, "componentId");
			this.oAddPropagationListenerStub = sandbox.stub(this.oAppComponent, "addPropagationListener");
			this.oVMInitStub = sandbox.stub().resolves();
			this.oCreateVariantModelStub = sandbox.stub(ComponentLifecycleHooks, "_createVariantModel").returns({
				initialize: this.oVMInitStub
			});
			this.oInitializeStub = sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(Utils, "isEmbeddedComponent").callsFake(function(oComponent) {
				return oComponent.getId() !== "componentId";
			});
			sandbox.stub(Utils, "isApplicationComponent").callsFake(function(oComponent) {
				return oComponent.getId() === "componentId";
			});
		},
		afterEach: function() {
			ComponentLifecycleHooks._componentInstantiationPromises.delete(this.oAppComponent);
			this.oAppComponent._restoreGetAppComponentStub();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Obtains the componentId from component instance and propagates even if there are no changes for the component", function(assert) {
			sandbox.stub(ChangePersistence.prototype, "loadChangesMapForComponent").resolves({});
			var oClearStub = sandbox.stub(FlexState, "rebuildFilteredResponse");

			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {asyncHints: true, id: "differentComponentId"})
			.then(function() {
				assert.strictEqual(oClearStub.callCount, 1, "the prepared stuff in FlexState was cleared");
				assert.strictEqual(this.oAddPropagationListenerStub.callCount, 1, "propagation was triggered");
				assert.strictEqual(this.oInitializeStub.callCount, 1, "FlexState was initialized");
				assert.ok(this.oInitializeStub.calledWith({
					componentId: this.oAppComponent.getId(),
					asyncHints: true
				}), "FlexState was initialized with the correct parameters");
				assert.strictEqual(this.oVMInitStub.callCount, 1, "the VModel was initialized");
			}.bind(this));
		});

		QUnit.test("when getChangesAndPropagate() is called for an embedded component with a preexisting VariantModel on its application component", function(assert) {
			assert.expect(3);
			var oExistingModel = {id: "existingVariantModel"};
			var oEmbeddedComponent = {
				name: "embeddedComponent",
				setModel: function(oModelSet, sModelName) {
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the embedded component with the correct name");
					assert.deepEqual(oModelSet, oExistingModel, "then the correct model was set");
				},
				getManifestObject: function() {},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId: function() {},
				getComponentData: function() {}
			};
			sandbox.stub(this.oAppComponent, "getModel").callsFake(function(sModelName) {
				assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then variant model called on the app component");
				return oExistingModel;
			});

			ComponentLifecycleHooks._componentInstantiationPromises.set(this.oAppComponent, Promise.resolve());
			return ComponentLifecycleHooks.instanceCreatedHook(oEmbeddedComponent, {});
		});

		[
			"outer",
			"inner"
		].forEach(function(sFirstComponent) {
			var sName = "when an outer and an inner component are initialized at the same time, " + sFirstComponent + " component being first";
			QUnit.test(sName, function(assert) {
				assert.expect(5);
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl");
				sandbox.stub(FlexControllerFactory, "createForControl").returns({
					_oChangePersistence: {
						loadChangesMapForComponent: sandbox.stub().resolves()
					}
				});
				var oExistingModel;
				sandbox.stub(this.oAppComponent, "setModel").callsFake(function(oModel, sModelName) {
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the AppComponent with the correct name");
					if (oExistingModel) {
						assert.notOk(true, "should only go here once");
					}
					oExistingModel = oModel;
				});
				sandbox.stub(this.oAppComponent, "getModel").callsFake(function(sModelName) {
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then variant model called on the app component");
					return oExistingModel;
				});

				var oComponent = {
					name: "embeddedComponent",
					setModel: function(oModel, sModelName) {
						assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the embedded component with the correct name");
						assert.deepEqual(oModel, oExistingModel, "then the correct model was set");
					},
					getManifestObject: function() {},
					addPropagationListener: function() {
						assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
					},
					getId: function() {return "embeddedComponent";},
					getComponentData: function() {}
				};

				var aPromises = sFirstComponent === "outer" ?
					[
						ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {}),
						ComponentLifecycleHooks.instanceCreatedHook(oComponent, {})
					] :
					[
						ComponentLifecycleHooks.instanceCreatedHook(oComponent, {}),
						ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
					];
				return Promise.all(aPromises).then(function() {
					assert.equal(this.oAddPropagationListenerStub.callCount, 1, "should only be called once");
				}.bind(this));
			});
		});

		QUnit.test("when getChangesAndPropagate() is called for two embedded components in parallel with no preexisting VariantModel on its application component", function(assert) {
			assert.expect(6);
			sandbox.spy(this.oAppComponent, "setModel");
			sandbox.stub(ChangePersistence.prototype, "loadChangesMapForComponent").resolves(function() {});

			var oComponent = {
				setModel: function(oModelSet, sModelName) {
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then variant model called on the app component");
					assert.ok(this.oAddPropagationListenerStub.calledOnce, "then addPropagationListener was called for the app component");
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the embedded component with the correct name");
				}.bind(this),
				getManifestObject: function() {},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId: function() {},
				getComponentData: function() {}
			};

			var oComponent2SetModelStub = sandbox.stub();
			var oComponent2 = {
				setModel: oComponent2SetModelStub,
				getManifestObject: function() {},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId: function() {},
				getComponentData: function() {}
			};

			assert.notOk(this.oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName()), "then initially no variant model exists for the app component");

			return Promise.all([
				ComponentLifecycleHooks.instanceCreatedHook(oComponent, {}),
				ComponentLifecycleHooks.instanceCreatedHook(oComponent2, {}),
				ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			])
			.then(function() {
				assert.strictEqual(this.oAppComponent.setModel.callCount, 1, "then the model is only set on the app component once");
				assert.ok(oComponent2SetModelStub.called, "then the model is also set on the second embedded component");
			}.bind(this));
		});

		QUnit.test("when getChangesAndPropagate() is called for an embedded component with a component not of type application", function(assert) {
			var oComponent = {
				setModel: sandbox.stub(),
				getManifestObject: sandbox.stub(),
				addPropagationListener: sandbox.stub(),
				getId: sandbox.stub(),
				getComponentData: sandbox.stub()
			};
			Utils.isApplicationComponent.restore();
			sandbox.stub(Utils, "isApplicationComponent").returns(false);

			return ComponentLifecycleHooks.instanceCreatedHook(oComponent, {}).then(function() {
				assert.equal(oComponent.setModel.callCount, 0, "setModel was not called");
			});
		});
	});

	QUnit.module("instanceCreatedHook: RTA Restart", {
		beforeEach: function() {
			var sMockComponentName = "MockCompName";
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sMockComponentName);
			sandbox.stub(this.oAppComponent, "addPropagationListener");
			sandbox.stub(this.oAppComponent, "setModel");
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			this.oCreateVariantModelStub = sandbox.stub(ComponentLifecycleHooks, "_createVariantModel").returns({
				initialize: sandbox.stub()
			});
			FlexControllerFactory._instanceCache[sMockComponentName] = {
				_oChangePersistence: {
					loadChangesMapForComponent: function() {
						return Promise.resolve();
					}
				}
			};

			this.oLoadLibStub = sandbox.stub(Core, "loadLibrary").resolves();
		},
		afterEach: function() {
			window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			this.oAppComponent._restoreGetAppComponentStub();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no restart from rta should be triggered and no draft is requested", function(assert) {
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.equal(this.oLoadLibStub.callCount, 0, "then no rta functionality is requested");
			}.bind(this));
		});

		QUnit.test("when no ushell was found", function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns(false);
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.equal(this.oLoadLibStub.callCount, 0, "then no rta functionality is requested");
			}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the VENDOR layer", function(assert) {
			// since the startKeyUserAdaptation is used, other layers should not use this API
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.VENDOR);
			window.sessionStorage.setItem("sap.ui.rta.restart.VENDOR", "MockCompName");
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync: function(sServiceName) {
					if (sServiceName === "ShellNavigation") {
						return Promise.resolve({
							toExternal: function() {
								return true;
							},
							registerNavigationFilter: function() {
								return true;
							}
						});
					}
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.equal(this.oLoadLibStub.callCount, 0, "rta functionality is not requested");
				assert.equal(window.sessionStorage.getItem("sap.ui.rta.restart.VENDOR"), "MockCompName", "and the restart parameter was NOT removed from the sessionStorage");
			}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", "MockCompName");
			var fnStartRtaStub = sandbox.stub();
			RtaQunitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/rta/api/startKeyUserAdaptation"],
					stub: fnStartRtaStub
				}
			]);
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			this.oAppComponent.rootControlLoaded = sandbox.stub().resolves();
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.strictEqual(this.oLoadLibStub.callCount, 1, "rta library is requested");
				assert.strictEqual(fnStartRtaStub.callCount, 1, "and rta is started");
				assert.strictEqual(fnStartRtaStub.getCall(0).args[0].rootControl, this.oAppComponent, "for the application component");
			}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer in a ushell scenario", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			var fnStartRtaStub = sandbox.stub();
			RtaQunitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/rta/api/startKeyUserAdaptation"],
					stub: fnStartRtaStub
				}
			]);
			sandbox.stub(Utils, "getUshellContainer").returns({
				getServiceAsync: function(sServiceName) {
					if (sServiceName === "ShellNavigation") {
						return Promise.resolve({
							toExternal: function() {
								return true;
							},
							registerNavigationFilter: function() {
								return true;
							}
						});
					}
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.equal(this.oLoadLibStub.callCount, 0, "rta library is not requested");
				assert.equal(fnStartRtaStub.callCount, 0, "and rta is not started");
			}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer via a boolean flag", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);
			var fnStartRtaStub = sandbox.stub();
			RtaQunitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/rta/api/startKeyUserAdaptation"],
					stub: fnStartRtaStub
				}
			]);
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			this.oAppComponent.rootControlLoaded = sandbox.stub().resolves();
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.strictEqual(this.oLoadLibStub.callCount, 1, "rta library is requested");
				assert.strictEqual(fnStartRtaStub.callCount, 1, "and rta is started");
				assert.strictEqual(fnStartRtaStub.getCall(0).args[0].rootControl, this.oAppComponent, "for the application component");
			}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer via a boolean flag but Root Control is not loaded", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);
			var fnStartRtaStub = sandbox.stub();
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			var sError = "Root Control didn't load";
			this.oAppComponent.rootControlLoaded = sandbox.stub().rejects(new Error(sError));
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.catch(function(oError) {
				assert.equal(this.oLoadLibStub.callCount, 1, "rta library is requested");
				assert.equal(fnStartRtaStub.callCount, 0, "but rta is not started");
				assert.equal(oError.message, sError, "and the promise is rejected with the right error");
			}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer, but for a different component", function(assert) {
			var done = assert.async();
			assert.expect(1);

			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", "anotherComponent");

			// check for error
			sandbox.stub(Log, "error").callsFake(function(sMessage) {
				if (sMessage.indexOf("anotherComponent") !== -1) {
					done();
				}
			});

			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {})
			.then(function() {
				assert.equal(this.oLoadLibStub.callCount, 0, "rta library is requested");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});