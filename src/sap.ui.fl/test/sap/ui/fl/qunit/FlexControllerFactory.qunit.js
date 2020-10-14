sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/base/Log",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	FlexState,
	Applier,
	FlexControllerFactory,
	ChangePersistence,
	Layer,
	Utils,
	VariantModel,
	startKeyUserAdaptation,
	Log,
	StorageUtils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.FlexControllerFactory", {
		beforeEach: function() {
			this.oInitializeStub = sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(StorageUtils.getEmptyFlexDataResponse());
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("shall provide an API to create a FlexController", function(assert) {
			assert.strictEqual(typeof FlexControllerFactory.create, 'function');
		});

		QUnit.test("shall create a new FlexController", function(assert) {
			assert.ok(FlexControllerFactory.create("myComponent"));
		});

		QUnit.test("shall cache and reuse the created FlexController instances", function(assert) {
			var oFlexController1 = FlexControllerFactory.create("myComponent");
			var oFlexController2 = FlexControllerFactory.create("myComponent");

			assert.strictEqual(oFlexController1, oFlexController2);
		});

		QUnit.test("Obtains the componentId from component instance and propagates even if there are no changes for the component", function(assert) {
			sandbox.stub(ChangePersistence.prototype, "loadChangesMapForComponent").resolves({});
			sandbox.stub(Utils, "isApplicationComponent").returns(true);

			var oComponent = {
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "componentId"
						}
					};
				},
				addPropagationListener: function() {},
				setModel: function() {},
				getId: function() {},
				getComponentData: function() {}
			};

			var oAddPropagationListenerStub = sandbox.stub(oComponent, "addPropagationListener");
			sandbox.stub(Utils, "getComponentClassName")
				.callThrough()
				.withArgs(oComponent)
				.returns("mockName");

			return FlexControllerFactory.getChangesAndPropagate(oComponent, {asyncHints: true, id: "differentComponentId"})
				.then(function() {
					assert.equal(oAddPropagationListenerStub.callCount, 1, "propagation was triggered");
					assert.equal(this.oInitializeStub.callCount, 1, "FlexState was initialized");
					assert.ok(this.oInitializeStub.calledWith({
						componentId: oComponent.getId(),
						asyncHints: true
					}), "FlexState was initialized with the correct parameters");
				}.bind(this));
		});

		QUnit.test("does propagate if there are changes for the component", function(assert) {
			assert.expect(0); // assert only the addPropagationListener to be called

			var mDeterminedChanges = {
				someId: [{}]
			};

			var oComponent = {
				getManifestObject: function() {
					return {};
				},
				addPropagationListener: function() {},
				getManifest: function() {},
				setModel: function() {},
				getId: function() {},
				getComponentData: function() {}
			};

			sandbox.stub(ChangePersistence.prototype, "loadChangesMapForComponent").returns(Promise.resolve(function() {
				return mDeterminedChanges;
			}));
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			sandbox.stub(Utils, "getComponentClassName")
				.callThrough()
				.withArgs(oComponent)
				.returns("mockName");

			return FlexControllerFactory.getChangesAndPropagate(oComponent, {});
		});

		QUnit.test("when getChangesForPropagate() is called for an embedded component with a preexisting VariantModel on it's application component", function(assert) {
			assert.expect(3);
			var oExistingModel = {id: "existingVariantModel"};
			var oAppComponent = {
				name: "appComponent",
				getModel: function(sModelName) {
					assert.strictEqual(sModelName, Utils.VARIANT_MODEL_NAME, "then variant model called on the app component");
					return oExistingModel;
				},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called again for an app component");
				},
				getId: function() {},
				getComponentData: function() {}
			};

			var oComponent = {
				name: "embeddedComponent",
				setModel: function(oModelSet, sModelName) {
					assert.strictEqual(sModelName, Utils.VARIANT_MODEL_NAME, "then VariantModel was set on the embedded component with the correct name");
					assert.deepEqual(oModelSet, oExistingModel, "then the correct model was set");
				},
				getManifestObject: function() {},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId: function() {},
				getComponentData: function() {}
			};

			sandbox.stub(Utils, "isEmbeddedComponent").callsFake(function(oComponent) {
				if (oComponent.name === "embeddedComponent") {
					return true;
				}
				return false;
			});
			sandbox.stub(Utils, "isApplicationComponent").callsFake(function(oComponent) {
				if (oComponent.name === "appComponent") {
					return true;
				}
				return false;
			});

			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oComponent).returns(oAppComponent);

			return FlexControllerFactory.getChangesAndPropagate(oComponent, {});
		});

		QUnit.test("when getChangesForPropagate() is called for an embedded component with a preexisting VariantModel on it's application component before it's done initializing", function(assert) {
			assert.expect(5);
			sandbox.stub(FlexControllerFactory, "createForControl").returns({
				_oChangePersistence: {
					loadChangesMapForComponent: sandbox.stub().resolves(),
					getComponentName: function() {return "foo";}
				}
			});
			var oExistingModel;
			var oAppComponent = {
				name: "appComponent",
				setModel: function(oModel, sModelName) {
					assert.strictEqual(sModelName, Utils.VARIANT_MODEL_NAME, "then VariantModel was set on the embedded component with the correct name");
					if (oExistingModel) {
						assert.notOk(true, "should only go here once");
					}
					oExistingModel = oModel;
				},
				getManifestObject: function() {},
				getModel: function(sModelName) {
					assert.strictEqual(sModelName, Utils.VARIANT_MODEL_NAME, "then variant model called on the app component");
					return oExistingModel;
				},
				addPropagationListener: sandbox.stub(),
				getId: function() {return "appComponent";},
				getComponentData: function() {}
			};

			var oComponent = {
				name: "embeddedComponent",
				setModel: function(oModel, sModelName) {
					assert.strictEqual(sModelName, Utils.VARIANT_MODEL_NAME, "then VariantModel was set on the embedded component with the correct name");
					assert.deepEqual(oModel, oExistingModel, "then the correct model was set");
				},
				getManifestObject: function() {},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId: function() {return "embeddedComponent";},
				getComponentData: function() {}
			};

			sandbox.stub(Utils, "isEmbeddedComponent").callsFake(function(oComponent) {
				if (oComponent.name === "embeddedComponent") {
					return true;
				}
				return false;
			});
			sandbox.stub(Utils, "isApplicationComponent").callsFake(function(oComponent) {
				if (oComponent.name === "appComponent") {
					return true;
				}
				return false;
			});
			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oComponent).returns(oAppComponent).withArgs(oAppComponent).returns(oAppComponent);

			return Promise.all([
				FlexControllerFactory.getChangesAndPropagate(oAppComponent, {}),
				FlexControllerFactory.getChangesAndPropagate(oComponent, {})
			]).then(function() {
				assert.equal(oAppComponent.addPropagationListener.callCount, 1, "should only be called once");
			});
		});

		QUnit.test("when getChangesForPropagate() is called for an embedded component with no preexisting VariantModel on it's application component", function(assert) {
			assert.expect(4);
			var oAppComponent = new Component();
			sandbox.stub(Utils, "isApplication").returns(true);
			sandbox.stub(Utils, "getComponentClassName")
				.callThrough()
				.withArgs(oAppComponent)
				.returns("mockName");
			sandbox.spy(oAppComponent, "setModel");
			sandbox.spy(oAppComponent, "addPropagationListener");
			sandbox.stub(Utils, "isEmbeddedComponent").returns(true);
			sandbox.stub(ChangePersistence.prototype, "loadChangesMapForComponent").resolves(function() {
			});
			sandbox.stub(Applier, "applyAllChangesForControl");

			var oComponent = {
				setModel: function(oModelSet, sModelName) {
					assert.ok(oAppComponent.setModel.calledWith(sinon.match.instanceOf(VariantModel), Utils.VARIANT_MODEL_NAME), "then app component's VariantModel was set");
					assert.ok(oAppComponent.addPropagationListener.calledOnce, "then addPropagationListener was called for the app component");
					assert.strictEqual(sModelName, Utils.VARIANT_MODEL_NAME, "then VariantModel was set on the embedded component with the correct name");
				},
				getManifestObject: function() {},
				addPropagationListener: function() {
					assert.notOk(true, "addPropagationListener shouldn't be called for an embedded component");
				},
				getId: function() {},
				getComponentData: function() {}
			};
			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oComponent).returns(oAppComponent);

			assert.notOk(oAppComponent.getModel(Utils.VARIANT_MODEL_NAME), "then initially no variant model exists for the app component");

			return FlexControllerFactory.getChangesAndPropagate(oComponent, {})
				.then(function() {
					oAppComponent.destroy();
				});
		});

		QUnit.test("when getChangesForPropagate() is called for an embedded component with a component not of type application", function(assert) {
			var oAppComponent = new Component();
			sandbox.stub(Utils, "getComponentClassName")
				.callThrough()
				.withArgs(oAppComponent)
				.returns("mockName");
			sandbox.stub(Utils, "isApplicationComponent").returns(false);

			var oComponent = {
				setModel: sandbox.stub(),
				getManifestObject: sandbox.stub(),
				addPropagationListener: sandbox.stub(),
				getId: sandbox.stub(),
				getComponentData: sandbox.stub()
			};
			sandbox.stub(Utils, "isEmbeddedComponent")
				.callThrough()
				.withArgs(oComponent)
				.returns(true);

			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oComponent).returns(oAppComponent);

			return FlexControllerFactory.getChangesAndPropagate(oComponent, {}).then(function() {
				assert.equal(oComponent.setModel.callCount, 0, "setModel was not called");
				oAppComponent.destroy();
			});
		});

		QUnit.test("when createForControl() is called for a non application type component", function(assert) {
			var oMockManifest = {
				id: "MockManifestId"
			};
			var oMockControl = {
				id: "MockControlId"
			};
			var oAppComponent = {
				getManifest: function() {
					return oMockManifest;
				}
			};
			var sMockComponentName = "MockCompName";

			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oMockControl).returns(oAppComponent);
			sandbox.stub(Utils, "getComponentClassName")
				.withArgs(oAppComponent)
				.returns(sMockComponentName);


			sandbox.stub(FlexControllerFactory, "create");

			FlexControllerFactory.createForControl(oMockControl);

			assert.ok(FlexControllerFactory.create.calledWith(sMockComponentName), "then FlexController created with the correct component name");
		});
	});

	QUnit.module("Given a FlexControllerFactory", {
		beforeEach: function() {
			var sMockComponentName = "MockCompName";
			var oMockManifest = {
				id: sMockComponentName
			};
			this.oAppComponent = {
				getId: function() {
					return sMockComponentName;
				},
				getManifestEntry: function() {
					return {
						id: sMockComponentName
					};
				},
				getManifest: function() {
					return oMockManifest;
				},
				getManifestObject: function() {
					return {};
				},
				addPropagationListener: function() {},
				setModel: function() {}
			};

			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(Utils, "isApplicationComponent").returns(true);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Utils, "getComponentClassName")
				.returns(sMockComponentName);
			FlexControllerFactory._instanceCache[sMockComponentName] = {
				_oChangePersistence: {
					loadChangesMapForComponent: function () {
						return Promise.resolve();
					},
					getComponentName: function () {
						return sMockComponentName;
					}
				}
			};

			this.oLoadLibStub = sandbox.stub(sap.ui.getCore(), "loadLibrary").resolves();
		},
		afterEach: function() {
			window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no restart from rta should be triggered and no draft is requested", function(assert) {
			return FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 0, "then no rta functionality is requested");
				}.bind(this));
		});

		QUnit.test("when no ushell was found", function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns(false);
			return FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 0, "then no rta functionality is requested");
				}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the VENDOR layer", function(assert) {
			// since the startKeyUserAdaptation is used, other layers should not use this API
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.VENDOR);
			window.sessionStorage.setItem("sap.ui.rta.restart.VENDOR", "MockCompName");
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						toExternal: function() {
							return true;
						},
						registerNavigationFilter: function() {
							return true;
						}
					};
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			return FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 0, "rta functionality is not requested");
					assert.equal(window.sessionStorage.getItem("sap.ui.rta.restart.VENDOR"), "MockCompName", "and the restart parameter was NOT removed from the sessionStorage");
				}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", "MockCompName");
			var fnStartRtaSpy = sandbox.spy(startKeyUserAdaptation);
			var oRequireStub = sandbox.stub(sap.ui, "require").callsFake(function(aModules, fnCallback) {
				fnCallback(fnStartRtaSpy);
			});
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			return FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 1, "rta library is requested");
					assert.equal(oRequireStub.withArgs(["sap/ui/rta/api/startKeyUserAdaptation"]).callCount, 1, "rta functionality is requested");
					assert.equal(fnStartRtaSpy.callCount, 1, "and rta is started");
					assert.equal(fnStartRtaSpy.getCall(0).args[0].rootControl, this.oAppComponent, "for the application component");
					assert.equal(window.sessionStorage.getItem("sap.ui.rta.restart.CUSTOMER"), undefined, "and the restart parameter was removed from the sessionStorage");
				}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer in a ushell scenario", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			var fnStartRtaSpy = sandbox.spy(startKeyUserAdaptation);
			var oRequireStub = sandbox.stub(sap.ui, "require").callsFake(function(aModules, fnCallback) {
				fnCallback(fnStartRtaSpy);
			});
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						toExternal: function() {
							return true;
						},
						registerNavigationFilter: function() {
							return true;
						}
					};
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			return FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 0, "rta library is not requested");
					assert.equal(oRequireStub.withArgs(["sap/ui/rta/api/startKeyUserAdaptation"]).callCount, 0, "rta functionality is not requested");
					assert.equal(fnStartRtaSpy.callCount, 0, "and rta is not started");
				}.bind(this));
		});

		QUnit.test("when a rta restart was triggered for the CUSTOMER layer via a boolean flag", function(assert) {
			sandbox.stub(Utils, "getUrlParameter").returns(Layer.CUSTOMER);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);
			var fnStartRtaSpy = sandbox.spy(startKeyUserAdaptation);
			var oRequireStub = sandbox.stub(sap.ui, "require").callsFake(function(aModules, fnCallback) {
				fnCallback(fnStartRtaSpy);
			});
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			return FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 1, "rta library is requested");
					assert.equal(oRequireStub.withArgs(["sap/ui/rta/api/startKeyUserAdaptation"]).callCount, 1, "rta functionality is requested");
					assert.equal(fnStartRtaSpy.callCount, 1, "and rta is started");
					assert.equal(fnStartRtaSpy.getCall(0).args[0].rootControl, this.oAppComponent, "for the application component");
					assert.equal(window.sessionStorage.getItem("sap.ui.rta.restart.CUSTOMER"), undefined, "and the restart parameter was removed from the sessionStorage");
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
			FlexControllerFactory.getChangesAndPropagate(this.oAppComponent, {})
				.then(function() {
					assert.equal(this.oLoadLibStub.callCount, 0, "rta library is requested");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});

/*global QUnit*/
