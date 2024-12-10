/* global QUnit */

sap.ui.define([
	"rta/qunit/RtaQunitUtils",
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/ComponentLifecycleHooks",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Log,
	Lib,
	AppDescriptorApplier,
	ApplyStrategyFactory,
	FlexObjectFactory,
	FlexState,
	ManifestUtils,
	ComponentLifecycleHooks,
	ControlVariantApplyAPI,
	ChangeAnnotation,
	ChangeHandlerRegistration,
	FlexControllerFactory,
	Layer,
	Utils,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("componentLoadedHook", {
		beforeEach() {
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
				getEntry(key) {
					return this[key];
				}
			};
			this.oInitializeStub = sandbox.stub(FlexState, "initialize");
			this.oGetStrategyStub = sandbox.stub(ApplyStrategyFactory, "getRuntimeStrategy").returns("foobar");
			this.oApplyManifestChangesStub = sandbox.stub(AppDescriptorApplier, "applyChangesIncludedInManifest");
		},
		afterEach() {
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
				getEntry(key) {
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
				getEntry(key) {
					return this[key];
				}
			}
		},
		{
			text: "component ID is not passed",
			config: {},
			manifest: this.oManifest
		}].forEach(function(oTestInput) {
			var sName = `componentLoadedHook does nothing if ${oTestInput.text}`;
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
		beforeEach() {
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
		afterEach() {
			ComponentLifecycleHooks._componentInstantiationPromises.delete(this.oAppComponent);
			this.oAppComponent._restoreGetAppComponentStub();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Obtains the componentId from component instance and propagates even if there are no changes for the component", function(assert) {
			return ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {asyncHints: true, id: "differentComponentId"})
			.then(function() {
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
				setModel(oModelSet, sModelName) {
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the embedded component with the correct name");
					assert.deepEqual(oModelSet, oExistingModel, "then the correct model was set");
				},
				getManifestObject() {},
				addPropagationListener() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId() {},
				getComponentData() {}
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
			var sName = `when an outer and an inner component are initialized at the same time, ${sFirstComponent} component being first`;
			QUnit.test(sName, function(assert) {
				assert.expect(5);
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl");
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
					setModel(oModel, sModelName) {
						assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the embedded component with the correct name");
						assert.deepEqual(oModel, oExistingModel, "then the correct model was set");
					},
					getManifestObject() {},
					addPropagationListener() {
						assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
					},
					getId() {return "embeddedComponent";},
					getComponentData() {}
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

			var oComponent = {
				setModel: function(oModelSet, sModelName) {
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then variant model called on the app component");
					assert.ok(this.oAddPropagationListenerStub.calledOnce, "then addPropagationListener was called for the app component");
					assert.strictEqual(sModelName, ControlVariantApplyAPI.getVariantModelName(), "then VariantModel was set on the embedded component with the correct name");
				}.bind(this),
				getManifestObject() {},
				addPropagationListener() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId() {},
				getComponentData() {}
			};

			var oComponent2SetModelStub = sandbox.stub();
			var oComponent2 = {
				setModel: oComponent2SetModelStub,
				getManifestObject() {},
				addPropagationListener() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId() {},
				getComponentData() {}
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
		beforeEach() {
			var sMockComponentName = "MockCompName";
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sMockComponentName);
			sandbox.stub(this.oAppComponent, "addPropagationListener");
			sandbox.stub(this.oAppComponent, "setModel");
			sandbox.stub(FlexState, "initialize").resolves();
			this.oCreateVariantModelStub = sandbox.stub(ComponentLifecycleHooks, "_createVariantModel").returns({
				initialize: sandbox.stub()
			});

			this.oLoadLibStub = sandbox.stub(Lib, "load").resolves();
		},
		afterEach() {
			window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			this.oAppComponent.destroy();
			FlexControllerFactory._instanceCache = {};
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
				getServiceAsync(sServiceName) {
					if (sServiceName === "ShellNavigationInternal") {
						return Promise.resolve({
							navigate() {
								return true;
							},
							registerNavigationFilter() {
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
				getServiceAsync(sServiceName) {
					if (sServiceName === "ShellNavigationInternal") {
						return Promise.resolve({
							navigate() {
								return true;
							},
							registerNavigationFilter() {
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

	QUnit.module("instanceCreatedHook: i18nVendorModel", {
		beforeEach() {
			const sMockComponentName = "MockCompName";
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sMockComponentName);
			sandbox.stub(FlexState, "initialize").resolves();
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with messagebundle and a vendor change", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").returns({
				changes: {
					changes: [
						{
							layer: Layer.VENDOR
						}
					]
				},
				messagebundle: {i_123: "translatedKey"}
			});

			await ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {});
			assert.ok(this.oAppComponent.getModel("i18nFlexVendor"), "the model is available");
		});

		QUnit.test("with messagebundle and no vendor change", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").returns({
				changes: {
					changes: [
						{
							layer: Layer.CUSTOMER
						}
					]
				},
				messagebundle: {i_123: "translatedKey"}
			});

			await ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {});
			assert.notOk(this.oAppComponent.getModel("i18nFlexVendor"), "the model is not available");
		});

		QUnit.test("with no messagebundle and a vendor change", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").returns({
				changes: {
					changes: [
						{
							layer: Layer.VENDOR
						}
					]
				}
			});

			await ComponentLifecycleHooks.instanceCreatedHook(this.oAppComponent, {});
			assert.notOk(this.oAppComponent.getModel("i18nFlexVendor"), "the model is not available");
		});
	});

	QUnit.module("modelCreatedHook", {
		beforeEach() {
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, "componentId");
			sandbox.stub(this.oAppComponent, "getComponentData").returns({foo: "bar"});
			ChangeHandlerRegistration.registerAnnotationChangeHandler({
				isDefaultChangeHandler: true,
				changeHandler: ChangeAnnotation
			});
			this.oAnnotationChanges = [
				FlexObjectFactory.createAnnotationChange({
					serviceUrl: "url1",
					content: { annotationPath: "somePath", value: "someValue" }
				}),
				FlexObjectFactory.createAnnotationChange({
					serviceUrl: "url2",
					content: { annotationPath: "somePath2", value: "someValue2" }
				}),
				FlexObjectFactory.createAnnotationChange({
					serviceUrl: "url2",
					content: { annotationPath: "anotherPath", value: "someOtherValue2" }
				})
			];
			this.oFlexStateInitStub = sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(FlexState, "getAnnotationChanges").returns(this.oAnnotationChanges);
			this.oSetAnnotationChangeStub1 = sandbox.stub();
			this.oSetAnnotationChangeStub2 = sandbox.stub();
			this.oSetAnnotationChangeStub3 = sandbox.stub();
			this.oFakeModel1 = {
				setAnnotationChangePromise: this.oSetAnnotationChangeStub1,
				getServiceUrl() {
					return "url1";
				}
			};
			this.oFakeModel2 = {
				setAnnotationChangePromise: this.oSetAnnotationChangeStub2,
				getServiceUrl() {
					return "url2";
				}
			};
			this.oFakeModel3 = {
				setAnnotationChangePromise: this.oSetAnnotationChangeStub3,
				getServiceUrl() {
					return "url3";
				}
			};
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("hook gets called with two annotation changes available", async function(assert) {
			const oAsyncHints = {foobar: "baz"};
			ComponentLifecycleHooks.modelCreatedHook({
				model: this.oFakeModel1,
				modelId: "someModelId",
				factoryConfig: {id: this.oAppComponent.getId(), asyncHints: oAsyncHints, componentData: {foo: "bar"}},
				ownerId: undefined,
				manifest: this.oAppComponent.getManifest()
			});
			ComponentLifecycleHooks.modelCreatedHook({
				model: this.oFakeModel2,
				modelId: "someModelId",
				factoryConfig: {id: this.oAppComponent.getId(), asyncHints: oAsyncHints, settings: {componentData: {foo: "bar"}}},
				ownerId: undefined,
				manifest: this.oAppComponent.getManifest()
			});
			ComponentLifecycleHooks.modelCreatedHook({
				model: this.oFakeModel3,
				modelId: "someModelId",
				factoryConfig: {id: this.oAppComponent.getId(), asyncHints: oAsyncHints, settings: {componentData: {foo: "bar"}}},
				ownerId: undefined,
				manifest: this.oAppComponent.getManifest()
			});

			assert.strictEqual(this.oFlexStateInitStub.callCount, 3, "FlexState was initialized 3 times");
			assert.deepEqual(this.oFlexStateInitStub.getCall(0).args[0], {
				componentData: {foo: "bar"},
				asyncHints: oAsyncHints,
				componentId: this.oAppComponent.getId(),
				reference: this.oAppComponent.getId()
			}, "FlexState was initialized with the correct parameters");
			assert.deepEqual(this.oFlexStateInitStub.getCall(0).args[0], this.oFlexStateInitStub.getCall(1).args[0]);
			assert.deepEqual(this.oFlexStateInitStub.getCall(1).args[0], this.oFlexStateInitStub.getCall(2).args[0]);

			assert.ok(this.oSetAnnotationChangeStub1.calledOnce, "the promise was set on the first model");
			assert.ok(this.oSetAnnotationChangeStub2.calledOnce, "the promise was set on the second model");
			assert.ok(this.oSetAnnotationChangeStub3.calledOnce, "the promise was set on the third model");
			const aAnnoChangesModel1 = await this.oSetAnnotationChangeStub1.getCall(0).args[0];
			assert.strictEqual(aAnnoChangesModel1.length, 1, "the first model was set with the correct annotation change");
			assert.deepEqual(
				aAnnoChangesModel1[0],
				{ path: this.oAnnotationChanges[0].getContent().annotationPath, value: this.oAnnotationChanges[0].getContent().value },
				"the first model was set with the correct annotation change"
			);

			const aAnnoChangesModel2 = await this.oSetAnnotationChangeStub2.getCall(0).args[0];
			assert.strictEqual(aAnnoChangesModel2.length, 2, "the second model was set with the correct annotation changes");
			assert.deepEqual(
				aAnnoChangesModel2[0],
				{ path: this.oAnnotationChanges[1].getContent().annotationPath, value: this.oAnnotationChanges[1].getContent().value },
				"the second model was set with the correct annotation change"
			);
			assert.deepEqual(
				aAnnoChangesModel2[1],
				{ path: this.oAnnotationChanges[2].getContent().annotationPath, value: this.oAnnotationChanges[2].getContent().value },
				"the second model was set with the correct annotation change"
			);

			const aAnnoChangesModel3 = await this.oSetAnnotationChangeStub3.getCall(0).args[0];
			assert.strictEqual(aAnnoChangesModel3.length, 0, "the third model was set with no annotation change");
		});

		QUnit.test("hook gets called with a model on an embedded component", async function(assert) {
			const oAsyncHints = {foobar: "baz"};
			ComponentLifecycleHooks.modelCreatedHook({
				model: this.oFakeModel1,
				modelId: "someModelId",
				factoryConfig: {id: "embeddedId"},
				owner: {
					id: this.oAppComponent.getId(),
					config: {asyncHints: oAsyncHints}
				},
				manifest: {foo: "bar"}
			});

			assert.strictEqual(this.oFlexStateInitStub.callCount, 1, "FlexState was initialized once");
			assert.deepEqual(this.oFlexStateInitStub.getCall(0).args[0], {
				componentData: {foo: "bar"},
				asyncHints: oAsyncHints,
				componentId: this.oAppComponent.getId(),
				reference: this.oAppComponent.getId()
			}, "FlexState was initialized with the correct parameters");

			assert.ok(this.oSetAnnotationChangeStub1.calledOnce, "the promise was set on the first model");
			const aAnnoChangesModel1 = await this.oSetAnnotationChangeStub1.getCall(0).args[0];
			assert.strictEqual(aAnnoChangesModel1.length, 1, "the first model was set with the correct annotation change");
			assert.deepEqual(
				aAnnoChangesModel1[0],
				{ path: this.oAnnotationChanges[0].getContent().annotationPath, value: this.oAnnotationChanges[0].getContent().value },
				"the first model was set with the correct annotation change"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});