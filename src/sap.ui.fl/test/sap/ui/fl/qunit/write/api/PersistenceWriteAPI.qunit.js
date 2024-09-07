/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	_omit,
	Log,
	JsControlTreeModifier,
	UIComponent,
	DescriptorChangeTypes,
	FlexCustomData,
	FlexObjectFactory,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	FlexConfiguration,
	FlexInfoSession,
	Settings,
	Condenser,
	KeyUserConnector,
	UIChangeManager,
	FlexObjectManager,
	Storage,
	FeaturesAPI,
	PersistenceWriteAPI,
	ChangePersistence,
	Layer,
	Utils,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	const sandbox = sinon.createSandbox();
	const sReference = "appComponent";

	QUnit.module("Given PersistenceWriteAPI", {
		beforeEach() {
			this.oAppComponent = {
				getId() {return sReference;}
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
				reference: "reference.app",
				packageName: "$TMP",
				content: {},
				selector: {
					id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus"
				},
				layer: Layer.CUSTOMER,
				texts: {},
				namespace: "reference.app",
				creation: "2018-10-16T08:00:02",
				originalLanguage: "EN",
				conditions: {},
				support: {
					generator: "Change.createInitialFileContent",
					service: "",
					user: ""
				}
			};

			this.oUIChange = FlexObjectFactory.createFromFileContent(this.oUIChangeSpecificData);

			window.sessionStorage.removeItem(`sap.ui.fl.info.${this.oAppComponent.getId()}`);
		},
		afterEach() {
			FlexState.clearState();
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
				getLayer() {
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
							getLayer() {
								return Layer.CUSTOMER;
							}
						}
					}
				}
			},
			expectedResult: false
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistence "
				+ "AND CompVariantState have changes present, but none in a higher layer",
			persistencyChanges: [{
				getLayer() {
					return Layer.CUSTOMER;
				}
			}],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer() {
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
				layer: Layer.USER
			}],
			compEntities: {},
			expectedResult: true
		}, {
			testName: "when the ChangePersistency has changes present in a higher layer, and VMS filters them",
			persistencyChanges: [{
				layer: Layer.USER
			}],
			compEntities: {},
			expectedResult: false,
			filterVariants: true
		}, {
			testName: "when hasHigherLayerChanges is called and the CompVariantState has changes present in a higher layer",
			persistencyChanges: [],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer() {
								return Layer.USER;
							}
						}
					}
				}
			},
			expectedResult: true
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistence "
				+ "AND CompVariantState have changes present, one in higher layer",
			persistencyChanges: [{
				layer: Layer.CUSTOMER
			}],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer() {
								return Layer.USER;
							}
						}
					}
				}
			},
			expectedResult: true
		}, {
			testName: "when hasHigherLayerChanges is called and the ChangePersistence "
				+ "AND CompVariantState have changes present, all in higher layer",
			persistencyChanges: [{
				layer: Layer.USER
			}],
			compEntities: {
				persistencyKey: {
					byId: {
						changeId: {
							getLayer() {
								return Layer.USER;
							}
						}
					}
				}
			},
			expectedResult: true
		}].forEach(function(testSetup) {
			QUnit.test(testSetup.testName, async function(assert) {
				var mPropertyBag = {
					selector: this.oAppComponent,
					mockParam: "mockParam"
				};

				sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);

				await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {changes: testSetup.persistencyChanges});
				sandbox.stub(FlexState, "getCompVariantsMap").returns(testSetup.compEntities);
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.oAppComponent.getId());
				const oVMSFilterStub = sandbox.stub(FlexObjectManager, "filterHiddenFlexObjects").callsFake((aFlexObjects) => {
					return testSetup.filterVariants ? [] : aFlexObjects;
				});

				const bHasHigherLayerChanges = await PersistenceWriteAPI.hasHigherLayerChanges(mPropertyBag);
				assert.strictEqual(
					oVMSFilterStub.callCount,
					(testSetup.expectedResult || testSetup.filterVariants) ? 1 : 0,
					"the VMS is only called if necessary"
				);
				assert.strictEqual(bHasHigherLayerChanges, testSetup.expectedResult, `it resolves with ${testSetup.expectedResult}`);
			});
		});

		QUnit.test("when save is called", function(assert) {
			var oFlexObjectManagerSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves();
			var mPropertyBag = { foo: "bar", removeOtherLayerChanges: true };
			PersistenceWriteAPI.save(mPropertyBag);

			assert.equal(oFlexObjectManagerSaveStub.callCount, 1, "the FlexObjectManager save method was called");
			assert.deepEqual(oFlexObjectManagerSaveStub.firstCall.args[0], mPropertyBag,
				"the FlexObjectManager was called with the same arguments");
		});

		QUnit.test("when save dirty change and update flex info session", function(assert) {
			var oExpectedFlexInfo = {
				isResetEnabled: true,
				adaptationId: "adaptation1",
				isEndUserAdaptation: true,
				initialAllContexts: true
			};
			FlexInfoSession.setByReference({
				isResetEnabled: false,
				adaptationId: "adaptation1",
				isEndUserAdaptation: true,
				initialAllContexts: true,
				saveChangeKeepSession: true
			});
			var oFlexObjectManagerSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves([{change: "test"}]);
			var oFlexInfo = {
				isResetEnabled: true
			};
			var oPersistenceWriteGetFlexInfoStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").callsFake(function() {
				return new Promise(function(resolve) {
					// Delay resolution to simulate a slow call
					setTimeout(function() {
						resolve(oFlexInfo);
					}, 0);
				});
			});
			var mPropertyBag = { foo: "bar" };
			return PersistenceWriteAPI.save(mPropertyBag).then(function(oFlexObject) {
				assert.equal(
					oFlexObjectManagerSaveStub.callCount,
					1,
					"the FlexObjectManager save method was called"
				);
				assert.deepEqual(
					oFlexObject,
					[{ change: "test" }],
					"Flex objects returned from saveFlexObjects are returned"
				);
				assert.deepEqual(
					oFlexObjectManagerSaveStub.firstCall.args[0],
					mPropertyBag,
					"the FlexObjectManager was called with the same arguments"
				);
				assert.equal(
					oPersistenceWriteGetFlexInfoStub.callCount,
					1,
					"the PersistenceWriteAPI getResetAndPublishInfo method was called"
				);
				assert.deepEqual(
					oPersistenceWriteGetFlexInfoStub.firstCall.args[0],
					mPropertyBag,
					"the PersistenceWriteAPI was called with the same arguments"
				);
				assert.deepEqual(
					oExpectedFlexInfo,
					FlexInfoSession.getByReference(),
					"session flex info is updated with isResetEnabled but adaptationId "
						+ "and isEndUserAdaptation and initialAllContexts are kept"
				);
				assert.equal(
					FlexInfoSession.getByReference().saveChangeKeepSession,
					undefined,
					"saveChangeKeepSession is delete in flex info session"
				);
			});
		});

		QUnit.test("when reset is called", async function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				generator: "generator",
				selectorIds: [],
				changeTypes: [],
				selector: this.vSelector
			};

			var oAppComponent = {id: sReference};

			sandbox.stub(Utils, "getAppComponentForSelector")
			.withArgs(mPropertyBag.selector)
			.returns(oAppComponent);
			const oResetStub = sandbox.stub(FlexObjectManager, "resetFlexObjects").resolves();

			await PersistenceWriteAPI.reset(mPropertyBag);
			assert.deepEqual(oResetStub.lastCall.args[0], {
				..._omit(mPropertyBag, "selector"),
				appComponent: oAppComponent
			}, "then the resetFlexObjects was called with the correct parameters");
		});

		QUnit.test("when _getUIChanges is called", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				invalidateCache: true
			};
			var aObjects = [];
			var fnGetFlexObjectsStub = sandbox.stub(FlexObjectManager, "getFlexObjects").resolves(aObjects);
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
					getChangeType() { return "flexChange"; }
				},
				selector: this.vSelector
			};
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(UIChangeManager, "addDirtyChanges").returnsArg(1);

			assert.strictEqual(
				PersistenceWriteAPI.add(mPropertyBag),
				mPropertyBag.change,
				"then the manager was called with correct parameters"
			);
		});

		QUnit.test("when add is called with multiple flex objects", function(assert) {
			var mPropertyBag = {
				flexObjects: [
					{getChangeType() { return "flexChange"; }},
					{getChangeType() { return "flexChange"; }}
				],
				selector: this.vSelector
			};
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(UIChangeManager, "addDirtyChanges").returnsArg(1);

			assert.deepEqual(
				PersistenceWriteAPI.add(mPropertyBag),
				mPropertyBag.flexObjects,
				"then the manager was called with correct parameters"
			);
		});

		QUnit.test("when add is called with a descriptor change", function(assert) {
			var done = assert.async();
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

			var oChange = {
				_getMap() {
					return {
						changeType: sDescriptorChangeType
					};
				},
				store() {
					assert.ok(true, "then changes's store() was called");
					done();
				}
			};
			PersistenceWriteAPI.add({change: oChange, selector: this.vSelector});
		});

		QUnit.test("when add is called with multiple descriptor changes", function(assert) {
			var i = 0;
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

			var oChange = {
				_getMap() {
					return {
						changeType: sDescriptorChangeType
					};
				},
				store() {
					return `storeWasCalled${i++}`;
				}
			};
			var aChanges = [oChange, oChange];
			var aAddResult = PersistenceWriteAPI.add({flexObjects: aChanges, selector: this.vSelector});
			assert.strictEqual(aAddResult[0], "storeWasCalled0", "then store was called on the first change");
			assert.strictEqual(aAddResult[1], "storeWasCalled1", "then store was called on the second change");
		});

		QUnit.test("when add is called with descriptor changes and flexObjects", function(assert) {
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				flexObjects: [
					{getChangeType() { return "flexChange"; }},
					{
						_getMap() {
							return {
								changeType: sDescriptorChangeType
							};
						},
						store() {
							return "storeWasCalled";
						}
					}
				],
				selector: this.vSelector
			};
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(UIChangeManager, "addDirtyChanges").returnsArg(1);

			var aAddResult = PersistenceWriteAPI.add(mPropertyBag);
			assert.strictEqual(aAddResult[0], mPropertyBag.flexObjects[0], "then addDirtyChanges was called first");
			assert.strictEqual(aAddResult[1], "storeWasCalled", "then store was called second");
		});

		QUnit.test("when add is called with change and flexObjects parameters", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var mPropertyBag = {
				change: {},
				flexObjects: [],
				selector: this.vSelector
			};

			assert.throws(
				function() {PersistenceWriteAPI.add(mPropertyBag);},
				Error("Using 'flexObjects' and 'change' properties together not supported. Please use the 'flexObjects' property."),
				"then an error with the correct message is thrown"
			);
		});

		QUnit.test("when remove is called for a flex object", function(assert) {
			const mPropertyBag = {
				change: {
					getSelector: function() {
						return this.vSelector;
					}.bind(this),
					getChangeType() {
						return "";
					}
				},
				selector: this.vSelector
			};
			const oElement = { type: "element" };
			const oAppComponent = {id: sReference};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(Utils, "getAppComponentForSelector")
			.withArgs(mPropertyBag.selector)
			.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
			.withArgs(mPropertyBag.change.getSelector(), oAppComponent)
			.returns(oElement);

			const oDestroyAppliedCustomDataStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData");
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oDestroyAppliedCustomDataStub.calledWith(oElement, mPropertyBag.change, JsControlTreeModifier),
					"then DestroyAppliedCustomData was called with correct parameters"
				);
				assert.ok(
					oDeleteFlexObjectsStub.calledWith({
						reference: sReference, flexObjects: [mPropertyBag.change]
					}), "then the flex persistence was called with correct parameters"
				);
			});
		});

		QUnit.test("when remove is called for multiple flex objects", function(assert) {
			const mPropertyBag = {
				flexObjects: [{
					getSelector() {
						return "selector1";
					},
					getChangeType() {
						return "flexChange";
					}
				}, {
					getSelector() {
						return "selector2";
					},
					getChangeType() {
						return "flexChange";
					}
				}],
				selector: this.vSelector
			};
			const oElement = { type: "element" };
			const oAppComponent = {id: sReference};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(Utils, "getAppComponentForSelector")
			.withArgs(mPropertyBag.selector)
			.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
			.withArgs(mPropertyBag.flexObjects[0].getSelector(), oAppComponent).returns(oElement)
			.withArgs(mPropertyBag.flexObjects[1].getSelector(), oAppComponent).returns(oElement);

			const oDestroyAppliedCustomDataStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData");
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oDestroyAppliedCustomDataStub.calledWith(oElement, mPropertyBag.flexObjects[0], JsControlTreeModifier),
					"then DestroyAppliedCustomData was called with correct parameters for first flex object"
				);
				assert.ok(
					oDestroyAppliedCustomDataStub.calledWith(oElement, mPropertyBag.flexObjects[1], JsControlTreeModifier),
					"then DestroyAppliedCustomData was called with correct parameters for second flex object"
				);
				assert.ok(
					oDeleteFlexObjectsStub.calledWith({
						reference: sReference, flexObjects: mPropertyBag.flexObjects
					}), "then the flex persistence was called with correct parameters"
				);
			});
		});

		QUnit.test("when remove is called for a flex object with an invalid selector", function(assert) {
			const mPropertyBag = {
				change: {
					getId() {
						return "changeId";
					}
				}
			};

			const fnRemoveChangeStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData");
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.catch(function(oError) {
				assert.ok(oError instanceof Error, "then an error was thrown");
				assert.ok(
					oError.message.includes("An invalid selector was passed so change could not be removed with id"),
					"then the error text contains the correct message"
				);
				assert.ok(fnRemoveChangeStub.notCalled, "then the flex persistence was not called to delete change from control");
				assert.ok(oDeleteFlexObjectsStub.notCalled, "then the changes are not deleted");
			});
		});

		QUnit.test("when remove is called for a flex object with an invalid app component", function(assert) {
			const mPropertyBag = {
				change: {
					getSelector: function() {
						return this.vSelector;
					}.bind(this),
					getId() {
						return "changeId";
					}
				},
				selector: this.vSelector
			};

			sandbox.stub(Utils, "getAppComponentForSelector");
			const fnRemoveChangeStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData");
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.catch(function(oError) {
				assert.ok(oError instanceof Error, "then an error was thrown");
				assert.ok(
					oError.message.includes("Invalid application component for selector, change could not be removed with id"),
					"then the error text contains the correct message"
				);
				assert.ok(fnRemoveChangeStub.notCalled, "then the flex persistence was not called to remove change from control");
				assert.ok(oDeleteFlexObjectsStub.notCalled, "then the changes are not deleted");
			});
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			const sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			const mPropertyBag = {
				change: {
					_getMap() {
						return {
							changeType: sDescriptorChangeType
						};
					}
				},
				selector: this.vSelector
			};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oDeleteFlexObjectsStub.calledWith({
						reference: sReference, flexObjects: [mPropertyBag.change]
					}), "then the flex persistence was called with correct parameters"
				);
			});
		});

		QUnit.test("when remove is called for multiple descriptor changes", function(assert) {
			const sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			const mPropertyBag = {
				flexObjects: [{
					_getMap() {
						return {
							changeType: sDescriptorChangeType
						};
					}
				}, {
					_getMap() {
						return {
							changeType: sDescriptorChangeType
						};
					}
				}],
				selector: this.vSelector
			};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const oDestroyAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "destroyAppliedCustomData");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oDeleteFlexObjectsStub.calledWith({
						reference: sReference, flexObjects: mPropertyBag.flexObjects
					}), "then the flex persistence was called with correct parameters"
				);
				assert.ok(
					oDestroyAppliedCustomDataSpy.notCalled,
					"then destroyAppliedCustomData was not called"
				);
			});
		});

		QUnit.test("when remove is called for flex objects and descriptor changes together", function(assert) {
			const sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			const mPropertyBag = {
				flexObjects: [{
					getSelector() {
						return "selector1";
					},
					getChangeType() {
						return "flexChange";
					}
				}, {
					_getMap() {
						return {
							changeType: sDescriptorChangeType
						};
					}
				}],
				selector: this.vSelector
			};
			const oElement = { type: "element" };
			const oAppComponent = {id: sReference};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(Utils, "getAppComponentForSelector")
			.withArgs(mPropertyBag.selector)
			.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
			.withArgs(mPropertyBag.flexObjects[0].getSelector(), oAppComponent).returns(oElement);

			const oDestroyAppliedCustomDataStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData");
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			return PersistenceWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oDestroyAppliedCustomDataStub.calledWith(oElement, mPropertyBag.flexObjects[0], JsControlTreeModifier),
					"then DestroyAppliedCustomData was called with correct parameters for first flex object"
				);
				assert.ok(
					oDestroyAppliedCustomDataStub.calledOnce,
					"then DestroyAppliedCustomData was only called for the first flex object"
				);
				assert.ok(
					oDeleteFlexObjectsStub.calledWith({
						reference: sReference, flexObjects: mPropertyBag.flexObjects
					}), "then the flex persistence was called with correct parameters"
				);
			});
		});

		QUnit.test("when remove is called with change and flexObjects parameters", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var mPropertyBag = {
				change: {},
				flexObjects: [],
				selector: this.vSelector
			};

			return PersistenceWriteAPI.remove(mPropertyBag)
			.catch(function(oError) {
				assert.ok(oError instanceof Error, "then an error is thrown");
			});
		});

		QUnit.test("Given KeyUserConnector has implementation of getFlexInfo", function(assert) {
			var sDescriptorChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				change: {
					_getMap() {
						return {
							changeType: sDescriptorChangeType
						};
					}
				},
				selector: this.vSelector,
				layer: Layer.CUSTOMER
			};
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "sap.com"}
			]);

			var oKeyUserConnectorStub = sandbox.stub(KeyUserConnector, "getFlexInfo");
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function() {
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

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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

			var oGetInfoStub = sandbox.stub(Storage, "getFlexInfo")
			.resolves({isResetEnabled: true, isPublishEnabled: true, allContextsProvided: false});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResetAndPublishInfo) {
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
			window.sessionStorage.setItem(`sap.ui.fl.info.${sReference}`, JSON.stringify(oFlexInfoResponse));
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
				selector: {id: "notExisting"},
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

		QUnit.test("when getChangesWarning is called without mixed changes", function(assert) {
			var aChanges = [
				FlexObjectFactory.createFromFileContent({})
			];
			var mPropertyBag = {};

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);

			return PersistenceWriteAPI.getChangesWarning(mPropertyBag)
			.then(function(oMessage) {
				assert.notOk(oMessage.showWarning, "then no Warning should not be shown");
			});
		});

		QUnit.test("when getChangesWarning is called in a P System with no changes", function(assert) {
			var aChanges = [];
			var mPropertyBag = {};
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({isProductiveSystemWithTransports() {return true;}});
			return PersistenceWriteAPI.getChangesWarning(mPropertyBag)
			.then(function(oMessage) {
				assert.ok(oMessage.showWarning, "then the warning is shown");
				assert.strictEqual(oMessage.warningType, "noChangesAndPSystemWarning",
					"then the no changes and p system warning type is returned");
			});
		});

		QUnit.test("when getChangesWarning is called in a not P System with no changes", function(assert) {
			var aChanges = [];
			var mPropertyBag = {};
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({isProductiveSystemWithTransports() {return false;}});
			return PersistenceWriteAPI.getChangesWarning(mPropertyBag)
			.then(function(oMessage) {
				assert.equal(oMessage.showWarning, false);
			});
		});

		QUnit.test("when getChangesWarning is called with changes from other system", function(assert) {
			var aChanges = [
				FlexObjectFactory.createFromFileContent({sourceSystem: "qSystem", sourceClient: "test"}),
				FlexObjectFactory.createFromFileContent({}),
				FlexObjectFactory.createFromFileContent({})
			];
			var mPropertyBag = {};

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aChanges);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isProductiveSystem() {return true;},
				isProductiveSystemWithTransports() {return true;},
				getSystem() {return "pSystem";},
				getClient() {return "bar";}
			});
			return	PersistenceWriteAPI.getChangesWarning(mPropertyBag)
			.then(function(oMessage) {
				assert.ok(oMessage.showWarning, "then the warning is shown");
				assert.strictEqual(oMessage.warningType, "mixedChangesWarning", "then the show mixed change warning type is returned");
			});
		});

		QUnit.test("when hasDirtyChanges is called", function(assert) {
			var oStubFlexObjectManagerHasDirtyObjects = sandbox.stub(FlexObjectManager, "hasDirtyFlexObjects").returns(true);
			assert.equal(PersistenceWriteAPI.hasDirtyChanges({selector: this.appComponent}), true, "hasDirtyChanges return true");
			assert.equal(oStubFlexObjectManagerHasDirtyObjects.calledOnce, true, "FlexObjectManager.hasDirtyFlexObjects called one");
		});

		QUnit.test("When setAdaptationLayer is called", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var oSpySetInfoSession = sandbox.spy(FlexInfoSession, "setByReference");
			PersistenceWriteAPI.setAdaptationLayer("CUSTOMER", {id: "someControl"});
			assert.deepEqual(
				oSpySetInfoSession.args[0],
				[{adaptationLayer: "CUSTOMER"}, sReference],
				"then the flex info session set function is called correctly"
			);
		});
	});
});
