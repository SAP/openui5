/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector"
], function(
	_omit,
	Log,
	JsControlTreeModifier,
	UIComponent,
	DescriptorChangeTypes,
	FlexCustomData,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	ChangesController,
	Settings,
	Condenser,
	FlexObjectState,
	Storage,
	FeaturesAPI,
	PersistenceWriteAPI,
	ChangePersistenceFactory,
	ChangePersistence,
	Change,
	Layer,
	Utils,
	sinon,
	Core,
	KeyUserConnector
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();
	var sReturnValue = "returnValue";

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.throws("invalid parameters for flex persistence function")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function mockChangePersistence(oReturn) {
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent("appComponent");
		sandbox.stub(oChangePersistence, "getChangesForComponent").resolves(oReturn);
	}

	function mockDescriptorController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance")
			.throws("invalid parameters for flex persistence function")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function getMethodStub(aArguments, vReturnValue) {
		var fnPersistenceStub = sandbox.stub();
		fnPersistenceStub
			.throws("invalid parameters for flex persistence function")
			.withArgs.apply(fnPersistenceStub, aArguments)
			.returns(vReturnValue);
		return fnPersistenceStub;
	}

	QUnit.module("Given PersistenceWriteAPI", {
		beforeEach: function () {
			this.oAppComponent = {
				getId: function() {return "appComponent";}
			};
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: this.oAppComponent
			};

			this.aObjectsToDestroy = [];

			this.oUIChangeSpecificData = {
				variantReference: "",
				fileName: "id_1445501120486_26",
				fileType: "change",
				changeType: "hideControl",
				reference: "reference.app.Component",
				packageName: "$TMP",
				content: {},
				selector: {
					id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus"
				},
				layer: Layer.CUSTOMER,
				texts: {},
				namespace: "reference.app.Component",
				creation: "2018-10-16T08:00:02",
				originalLanguage: "EN",
				conditions: {},
				support: {
					generator: "Change.createInitialFileContent",
					service: "",
					user: ""
				}
			};

			this.oUIChange = new Change(this.oUIChangeSpecificData);

			window.sessionStorage.removeItem("sap.ui.fl.info." + this.oAppComponent.getId());
		},
		afterEach: function() {
			sandbox.restore();
			delete this.vSelector;
		}
	}, function() {
		[{
			testName: "when hasHigherLayerChanges is called and no changes are present",
			persistencyChanges: [],
			compEntities: {},
			expectedResult: false
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistency has changes present, but not in a higher layer",
			persistencyChanges: [{
				getLayer: function () {
					return Layer.CUSTOMER;
				}
			}],
			compEntities: {},
			expectedResult: false
		}, {
			testName: "when hasHigherLayerChanges is called and the CompVariantState has changes present, but not in a higher layer",
			persistencyChanges: [],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer: function () {
								return Layer.CUSTOMER;
							}
						}
					}
				}
			},
			expectedResult: false
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistence AND CompVariantState have changes present, but none in a higher layer",
			persistencyChanges: [{
				getLayer: function () {
					return Layer.CUSTOMER;
				}
			}],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer: function () {
								return Layer.CUSTOMER_BASE;
							}
						}
					}
				}
			},
			expectedResult: false
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistency has changes present in a higher layer",
			persistencyChanges: [{
				getLayer: function () {
					return Layer.USER;
				}
			}],
			compEntities: {},
			expectedResult: true
		}, {
			testName: "when hasHigherLayerChanges is called and the CompVariantState has changes present in a higher layer",
			persistencyChanges: [],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer: function () {
								return Layer.USER;
							}
						}
					}
				}
			},
			expectedResult: true
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistence AND CompVariantState have changes present, one in higher layer",
			persistencyChanges: [{
				getLayer: function () {
					return Layer.CUSTOMER;
				}
			}],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer: function () {
								return Layer.USER;
							}
						}
					}
				}
			},
			expectedResult: true
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistence AND CompVariantState have changes present, all in higher layer",
			persistencyChanges: [{
				getLayer: function () {
					return Layer.USER;
				}
			}],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer: function () {
								return Layer.USER;
							}
						}
					}
				}
			},
			expectedResult: true
		}].forEach(function (testSetup) {
			QUnit.test(testSetup.testName, function(assert) {
				var mPropertyBag = {
					layer: Layer.CUSTOMER,
					selector: this.oAppComponent,
					mockParam: "mockParam"
				};

				sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);

				mockChangePersistence(testSetup.persistencyChanges);
				sandbox.stub(FlexState, "getCompVariantsMap").returns(testSetup.compEntities);
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.oAppComponent.getId());

				return PersistenceWriteAPI.hasHigherLayerChanges(mPropertyBag)
					.then(function(bHasHigherLayerChanges) {
						assert.strictEqual(bHasHigherLayerChanges, testSetup.expectedResult, "it resolves with " + testSetup.expectedResult);
					});
			});
		});

		QUnit.test("when save is called", function(assert) {
			var oFlexObjectStateSaveStub = sandbox.stub(FlexObjectState, "saveFlexObjects").returns("foo");
			var mPropertyBag = { foo: "bar" };
			var sReturn = PersistenceWriteAPI.save(mPropertyBag);

			assert.equal(oFlexObjectStateSaveStub.callCount, 1, "the FlexObjectState save method was called");
			assert.deepEqual(oFlexObjectStateSaveStub.firstCall.args[0], mPropertyBag, "the FlexObjectState was called with the same arguments");
			assert.equal("foo", sReturn, "the function returns whatever the FlexObjectState returns");
		});

		QUnit.test("when save is called with removeOtherLayerChanges", function(assert) {
			var oComp = new UIComponent("testComponent");
			oComp.name = "testComponent";
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComp);
			var oChangePersistence = new ChangePersistence(oComp);
			oChangePersistence.addDirtyChange(
				new Change({
					selector: "someControl",
					layer: Layer.CUSTOMER
				})
			);
			oChangePersistence.addDirtyChange(
				new Change({
					selector: "someControl",
					layer: Layer.USER
				})
			);

			sandbox.stub(FlexObjectState, "getFlexObjects");
			sandbox.stub(FlexState, "getCompVariantsMap");
			sandbox.stub(oChangePersistence, "saveDirtyChanges").resolves();
			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);

			var mPropertyBag = {
				selector: {
					appComponent: oComp
				},
				layer: Layer.CUSTOMER,
				removeOtherLayerChanges: true
			};
			return PersistenceWriteAPI.save(mPropertyBag).then(function() {
				assert.strictEqual(
					oChangePersistence.getDirtyChanges().length,
					1,
					"then dirty changes on other layers are removed"
				);
			});
		});

		QUnit.test("when reset is called", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				generator: "generator",
				selectorIds: [],
				changeTypes: [],
				selector: this.vSelector
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var aArguments = [mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes];
			var fnPersistenceStub = getMethodStub(aArguments, Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { resetChanges: fnPersistenceStub });

			return PersistenceWriteAPI.reset(mPropertyBag)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when publish is called", function(assert) {
			var mPropertyBag = {
				styleClass: "styleClass",
				layer: Layer.CUSTOMER,
				appVariantDescriptors: [],
				selector: this.vSelector
			};

			var oAppComponent = { id: "appComponent" };

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([
				{},
				mPropertyBag.styleClass,
				mPropertyBag.layer,
				mPropertyBag.appVariantDescriptors
			], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { _oChangePersistence: { transportAllUIChanges: fnPersistenceStub } });

			return PersistenceWriteAPI.publish(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when publish is called without style class", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				appVariantDescriptors: [],
				selector: this.vSelector
			};

			var oAppComponent = { id: "appComponent" };

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([
				{},
				"",
				mPropertyBag.layer,
				mPropertyBag.appVariantDescriptors
			], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { _oChangePersistence: { transportAllUIChanges: fnPersistenceStub } });

			return PersistenceWriteAPI.publish(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when _getUIChanges is called", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				invalidateCache: true
			};
			var aObjects = [];
			var fnGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves(aObjects);
			return PersistenceWriteAPI._getUIChanges(mPropertyBag)
				.then(function(aGetResponse) {
					assert.equal(fnGetFlexObjectsStub.callCount, 1, "the getFlexObjects was called once");
					assert.equal(fnGetFlexObjectsStub.getCall(0).args[0], mPropertyBag, "with the passed propertyBag");
					assert.strictEqual(aGetResponse, aObjects, "and the function resolves with the State response");
				});
		});

		QUnit.test("when add is called with a flex change", function(assert) {
			var mPropertyBag = {
				change: {
					getChangeType: function() { return "flexChange"; }
				},
				selector: this.vSelector
			};
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([mPropertyBag.change, oAppComponent], sReturnValue);

			mockFlexController(oAppComponent, { addPreparedChange: fnPersistenceStub });

			assert.strictEqual(PersistenceWriteAPI.add(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when add is called with a descriptor change", function(assert) {
			var done = assert.async();
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var oChange = {
				_getMap: function() {
					return {
						changeType: sDescriptorChangeType
					};
				},
				store: function() {
					assert.ok(true, "then changes's store() was called");
					done();
				}
			};
			PersistenceWriteAPI.add({change: oChange, selector: this.vSelector});
		});

		QUnit.test("when add is called but an error is thrown", function(assert) {
			var sError = "mock error";
			var mPropertyBag = {
				change: {
					_getMap: function () {
						return {
							changeType: "whatever"
						};
					},
					getVariantReference: function () {
						throw new Error(sError);
					}
				},
				selector: this.vSelector
			};
			assert.throws(
				function() {
					PersistenceWriteAPI.add(mPropertyBag);
				},
				new Error(sError),
				"then an error is caught during the process"
			);
		});

		QUnit.test("when remove is called for a flex change", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return this.selector;
					}.bind(this),
					getChangeType: function () {
						return "";
					}
				},
				selector: this.vSelector
			};
			var oElement = { type: "element" };
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
				.withArgs(mPropertyBag.change.getSelector(), oAppComponent)
				.returns(oElement);

			var fnRemoveChangeStub = sandbox.stub(FlexCustomData.sync, "destroyAppliedCustomData");
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(oAppComponent, { deleteChange: fnDeleteChangeStub });

			return PersistenceWriteAPI.remove(mPropertyBag)
				.then(function () {
					assert.ok(fnRemoveChangeStub.calledWith(oElement, mPropertyBag.change, JsControlTreeModifier), "then the flex persistence was called with correct parameters");
					assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change, oAppComponent), "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when remove is called for a flex change with an invalid selector", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return this.selector;
					}.bind(this)
				},
				selector: this.vSelector
			};

			sandbox.stub(ChangesController, "getAppComponentForSelector");

			var fnRemoveChangeStub = sandbox.stub(FlexCustomData.sync, "destroyAppliedCustomData");
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(undefined, { deleteChange: fnDeleteChangeStub });
			return PersistenceWriteAPI.remove(mPropertyBag)
				.catch(function (oError) {
					assert.ok(oError instanceof Error, "then an error was thrown");
					assert.ok(fnRemoveChangeStub.notCalled, "then the flex persistence was not called to delete change from control");
					assert.ok(fnDeleteChangeStub.notCalled, "then the flex persistence was not called to remove change from persistence");
				});
		});

		QUnit.test("when remove is called for a flex change with an invalid app component", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return this.selector;
					}.bind(this)
				}
			};

			sandbox.stub(ChangesController, "getAppComponentForSelector");

			var fnRemoveChangeStub = sandbox.stub(FlexCustomData.sync, "destroyAppliedCustomData");
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(undefined, { deleteChange: fnDeleteChangeStub });
			return PersistenceWriteAPI.remove(mPropertyBag)
				.catch(function (oError) {
					assert.ok(oError instanceof Error, "then an error was thrown");
					assert.ok(fnRemoveChangeStub.notCalled, "then the flex persistence was not called to remove change from control");
					assert.ok(fnDeleteChangeStub.notCalled, "then the flex persistence was not called to delete change from persistence");
				});
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				change: {
					_getMap: function () {
						return {
							changeType: sDescriptorChangeType
						};
					}
				},
				selector: this.vSelector
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnDeleteChangeStub = sandbox.stub();

			mockDescriptorController(oAppComponent, { deleteChange: fnDeleteChangeStub });

			return PersistenceWriteAPI.remove(mPropertyBag)
				.then(function () {
					assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change, oAppComponent), "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("Given KeyUserConnector has implementation of getFlexInfo", function (assert) {
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				change: {
					_getMap: function () {
						return {
							changeType: sDescriptorChangeType
						};
					}
				},
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};
			sandbox.stub(Core.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "sap.com"}
			]);

			var oKeyUserConnectorStub = sandbox.stub(KeyUserConnector, "getFlexInfo");
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function () {
				assert.equal(oKeyUserConnectorStub.callCount, 1, "KeyUserConnector getFlexInfo should be called");
			});
		});

		QUnit.test("getResetAndPublishInfo when there is change but layer is not transportable", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.USER
			};

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo");
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(oGetInfoStub.callCount, 0, "flex/info never called");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "isPublishEnabled is false");
			});
		});

		QUnit.test("getResetAndPublishInfo when get flex/info route is not available, there is change, layer is transportable but publish is not allowed by system settings", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};
			var oBaseLogStub = sandbox.stub(Log, "error");

			sandbox.stub(Storage, "getFlexInfo").rejects({status: 404, text: ""});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(false);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.ok(oBaseLogStub.calledOnce, "an error was logged");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "isPublishEnabled is false");
				assert.equal(oResetAndPublishInfo.allContextsProvided, true, "allContextsProvided is true by default");
			});
		});

		QUnit.test("getResetAndPublishInfo when get flex/info route is available, there is no change, layer is transportable, publish is allowed by system settings, publish is not enabled by backend", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo").resolves({isResetEnabled: false, isPublishEnabled: false});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(oGetInfoStub.callCount, 1, "flex/info is called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, false, "isResetEnabled is false");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "isPublishEnabled is false");
			});
		});

		QUnit.test("getResetAndPublishInfo when get flex/info route is available, there is no change, layer is transportable, publish is not allowed by system settings, publish is enabled by backend", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo").resolves({isResetEnabled: false, isPublishEnabled: true});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(false);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(oGetInfoStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, false, "isResetEnabled is false");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "isPublishEnabled is false");
				assert.equal(oResetAndPublishInfo.allContextsProvided, true, "allContextProvided is true by default");
			});
		});

		QUnit.test("getResetAndPublishInfo when get flex/info route is available, there is no change, layer is transportable, publish is allowed by system settings, publish is enabled by backend", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo").resolves({isResetEnabled: false, isPublishEnabled: true});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(oGetInfoStub.callCount, 1, "flex/info is called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, false, "isResetEnabled is false");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "isPublishEnabled is true");
			});
		});

		QUnit.test("getResetAndPublishInfo when get flex/info route is available, there is change, layer is transportable, publish is not allowed by system settings", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo").resolves({isResetEnabled: false, isPublishEnabled: true});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(false);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(oGetInfoStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, false, "isResetEnabled is false");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "isPublishEnabled is false");
				assert.equal(oResetAndPublishInfo.allContextsProvided, true, "allContextProvided is true by default");
			});
		});

		QUnit.test("getResetAndPublishInfo when get flex/info route is available, there is change, layer is transportable and publish is allowed by system settings", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo").resolves({isResetEnabled: true, isPublishEnabled: true, allContextsProvided: false});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(oGetInfoStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "isPublishEnabled is true");
				assert.equal(oResetAndPublishInfo.allContextsProvided, false, "allContextProvided is false");
			});
		});

		QUnit.test("getResetAndPublishInfoFromSession is null", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.oAppComponent.getId());
			var oFlexInfo = PersistenceWriteAPI.getResetAndPublishInfoFromSession(this.vSelector);
			assert.equal(oFlexInfo, null, "oFlexInfo is null");
		});

		QUnit.test("getResetAndPublishInfoFromSession with content", function(assert) {
			var sReference = this.oAppComponent.getId();
			var oFlexInfoResponse = {
				isResetEnabled: true,
				isPublishEnabled: false
			};
			window.sessionStorage.setItem("sap.ui.fl.info." + sReference, JSON.stringify(oFlexInfoResponse));
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

			var oFlexInfo = PersistenceWriteAPI.getResetAndPublishInfoFromSession(this.vSelector);
			assert.equal(oFlexInfo.isResetEnabled, true, "oFlexInfo.isResetEnabled is true");
			assert.equal(oFlexInfo.isPublishEnabled, false, "oFlexInfo.isPublishEnabled is false");
			assert.equal(oFlexInfo.allContextsProvided, null, "oFlexInfo.allContextsProvided is null");
		});

		QUnit.test("when _condense is called", function(assert) {
			var oCondenserStub = sandbox.stub(Condenser, "condense").returns("foo");
			var mPropertyBag = {
				selector: this.vSelector,
				changes: ["a", "b", "c"]
			};
			return PersistenceWriteAPI._condense(mPropertyBag).then(function(oReturn) {
				assert.equal(oCondenserStub.callCount, 1, "the condenser was called");
				assert.deepEqual(oCondenserStub.lastCall.args[0], this.oAppComponent, "the passed arguments are correct");
				assert.deepEqual(oCondenserStub.lastCall.args[1], ["a", "b", "c"], "the passed arguments are correct");
				assert.equal(oReturn, "foo", "the function returns what the Condenser returns");
			}.bind(this));
		});

		QUnit.test("when _condense is called  with wrong selector", function(assert) {
			var oCondenserStub = sandbox.stub(Condenser, "condense").returns("foo");
			var mPropertyBag = {
				selector: "notExisting",
				changes: ["a", "b", "c"]
			};
			return PersistenceWriteAPI._condense(mPropertyBag).catch(function(oError) {
				assert.equal(oCondenserStub.callCount, 0, "the condenser was not called");
				assert.equal(oError.message, "Invalid application component for selector");
			});
		});

		QUnit.test("when _condense is called without selector", function(assert) {
			var oCondenserStub = sandbox.stub(Condenser, "condense").returns("foo");
			var mPropertyBag = {
				changes: ["a", "b", "c"]
			};
			return PersistenceWriteAPI._condense(mPropertyBag).catch(function(oError) {
				assert.equal(oCondenserStub.callCount, 0, "the condenser was not called");
				assert.equal(oError.message, "An invalid selector was passed");
			});
		});

		QUnit.test("when _condense is called without proper changes array", function(assert) {
			var oCondenserStub = sandbox.stub(Condenser, "condense").returns("foo");
			var mPropertyBag = {
				selector: this.vSelector,
				changes: "a"
			};
			return PersistenceWriteAPI._condense(mPropertyBag).catch(function(oError) {
				assert.equal(oCondenserStub.callCount, 0, "the condenser was not called");
				assert.equal(oError.message, "Invalid array of changes");
			});
		});

		QUnit.test("when _condense is called without changes array", function(assert) {
			var oCondenserStub = sandbox.stub(Condenser, "condense").returns("foo");
			var mPropertyBag = {
				selector: this.vSelector
			};
			return PersistenceWriteAPI._condense(mPropertyBag).catch(function(oError) {
				assert.equal(oCondenserStub.callCount, 0, "the condenser was not called");
				assert.equal(oError.message, "Invalid array of changes");
			});
		});

		QUnit.test("when getChangesWarning is called without mixed changes", function (assert) {
			var aChanges = [
				new Change({})
			];
			var mPropertyBag = {};

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);

			return PersistenceWriteAPI.getChangesWarning(mPropertyBag)
				.then(function (oMessage) {
					assert.notOk(oMessage.showWarning, "then no Warning should not be shown");
				});
		});

		QUnit.test("when getChangesWarning is called in a P System with no changes", function (assert) {
			var aChanges = [];
			var mPropertyBag = {};
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({isProductiveSystemWithTransports: function() {return true;}});
			return PersistenceWriteAPI.getChangesWarning(mPropertyBag)
				.then(function (oMessage) {
					assert.ok(oMessage.showWarning, "then the warning is shown");
					assert.strictEqual(oMessage.warningType, "noChangesAndPSystemWarning", "then the no changes and p system warning type is returned");
				});
		});

		QUnit.test("when getChangesWarning is called in a not P System with no changes", function (assert) {
			var aChanges = [];
			var mPropertyBag = {};
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({isProductiveSystemWithTransports: function() {return false;}});
			return PersistenceWriteAPI.getChangesWarning(mPropertyBag)
				.then(function (oMessage) {
					assert.equal(oMessage.showWarning, false);
				});
		});

		QUnit.test("when getChangesWarning is called with changes from other system", function (assert) {
			var aChanges = [
				new Change({sourceSystem: "qSystem", sourceClient: "test"}),
				new Change({}),
				new Change({})
			];
			var mPropertyBag = {};

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isProductiveSystem: function() {return true;},
				isProductiveSystemWithTransports: function() {return true;},
				getSystem: function() {return "pSystem";},
				getClient: function() {return "bar";}
			});
			return	PersistenceWriteAPI.getChangesWarning(mPropertyBag)
				.then(function (oMessage) {
					assert.ok(oMessage.showWarning, "then the warning is shown");
					assert.strictEqual(oMessage.warningType, "mixedChangesWarning", "then the show mixed change warning type is returned");
				});
		});
	});
});
