/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	UIComponent,
	FlexObjectFactory,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	Version,
	Settings,
	SessionStorageConnector,
	CompVariantState,
	FlexObjectState,
	Versions,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer,
	Utils,
	JSONModel,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sReference = "test.selector.id";
	const sComponentId = "componentId";

	function addChangesToChangePersistence(oChangePersistence) {
		var oChangeInPersistence1 = FlexObjectFactory.createFromFileContent({
			fileName: "change1",
			fileType: "change",
			selector: {},
			changeType: "renameField",
			layer: Layer.USER
		});
		var oChangeInPersistence2 = FlexObjectFactory.createFromFileContent({
			fileType: "change",
			fileName: "change1",
			selector: {},
			changeType: "addGroup",
			layer: Layer.USER
		});
		sandbox.stub(oChangePersistence, "getChangesForComponent").resolves([oChangeInPersistence1, oChangeInPersistence2]);
	}

	function addDirtyChanges(oChangePersistence) {
		var oChangeInPersistence1 = FlexObjectFactory.createFromFileContent({
			selector: {},
			changeType: "dirtyRenameField",
			layer: Layer.USER
		});
		var oChangeInPersistence2 = FlexObjectFactory.createFromFileContent({
			selector: {},
			changeType: "dirtyAddGroup",
			layer: Layer.USER
		});
		sandbox.stub(oChangePersistence, "getDirtyChanges").returns([oChangeInPersistence1, oChangeInPersistence2]);
	}

	QUnit.module("getFlexObjects / saveFlexObjects", {
		before() {
			return Settings.getInstance();
		},
		beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns(sReference);
			const Component = UIComponent.extend(sComponentId, {
				metadata: {
					manifest: {
						"sap.app": {
							id: sReference
						}
					}
				}
			});
			this.oAppComponent = new Component(sComponentId);
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sReference
			});
		},
		afterEach() {
			SessionStorageConnector.reset({
				reference: sReference,
				layer: Layer.USER
			});
			this.oAppComponent.destroy();
			ChangePersistenceFactory._instanceCache = {};
			FlexState.clearState(sReference);
			FlexState.clearRuntimeSteadyObjects(sReference, this.oAppComponent.getId());
			FlexState.resetInitialNonFlCompVariantData(sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Get - Given no flex objects are present", function(assert) {
			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 0, "an empty array is returned");
			});
		});

		QUnit.test("when flex objects are requested and no variant management model exists", function(assert) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			var oVariant = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant",
				selector: {},
				changeType: "FlVariant",
				layer: Layer.USER,
				variantReference: "otherVariantReference"
			});
			var oChangeOnVariant1 = FlexObjectFactory.createFromFileContent({
				selector: {},
				changeType: "renameField",
				layer: Layer.USER,
				variantReference: "variant1"
			});
			sandbox.stub(oChangePersistence, "getChangesForComponent").resolves([oVariant, oChangeOnVariant1]);

			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true,
				onlyCurrentVariants: true
			})
			.then(function(aFlexObjects) {
				assert.deepEqual(aFlexObjects, [oVariant, oChangeOnVariant1], "then all flex objects are returned correctly");
			});
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState", function(assert) {
			var sPersistencyKey = "persistency.key";
			var oControl = new Control();
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {},
					id: "myId"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: "myId",
				layer: Layer.USER,
				control: oControl,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 2, "an array with two entries is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
				assert.equal(aFlexObjects[1].getChangeType(), "updateVariant", "the change from the compVariantState is present");
			});
		});

		QUnit.test("Get - Given no flex objects are present in the CompVariantState + ChangePersistence but only Standard variant and invalidateCache is true", function(assert) {
			var sPersistencyKey = "persistency.key";
			var oControl = new Control();
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			sandbox.stub(oChangePersistence, "getChangesForComponent").resolves([]);
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				});
			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 1, "an array with 1 entries is returned");
				assert.equal(aFlexObjects[0].getVariantId(), "*standard*", "the standard variant is present");
			});
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState + ChangePersistence + invalidateCache is true", function(assert) {
			var sPersistencyKey = "persistency.key";
			var oControl = new Control();
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {},
					id: "myId"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: "myId",
				layer: Layer.USER,
				control: oControl,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			addChangesToChangePersistence(oChangePersistence);
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				},
				[{
					favorite: true,
					id: "#PS1",
					name: "EntityType"
				}]);
			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 6, "an array with 6 entries is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
				assert.equal(aFlexObjects[1].getChangeType(), "updateVariant", "the change from the compVariantState is present");
				assert.equal(aFlexObjects[2].getVariantId(), "#PS1", "the oData variant is present");
				assert.equal(aFlexObjects[3].getVariantId(), "*standard*", "the standard variant is present");
				assert.equal(aFlexObjects[4].getChangeType(), "renameField", "the 1st change in changePersistence is present");
				assert.equal(aFlexObjects[5].getChangeType(), "addGroup", "the 2nd change in changePersistence is present");
			});
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState + ChangePersistence + invalidateCache is true and setVisible change", function(assert) {
			var sPersistencyKey = "persistency.key";
			var oControl = new Control();
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {},
					id: "myId"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: "myId",
				layer: Layer.USER,
				control: oControl,
				reference: sReference,
				persistencyKey: sPersistencyKey,
				visible: false,
				forceCreate: true
			});
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			addChangesToChangePersistence(oChangePersistence);
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				},
				[{
					favorite: true,
					id: "#PS1",
					name: "EntityType"
				}]);
			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 5, "an array with 5 entries is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "updateVariant", "the change from the compVariantState is present");
				assert.equal(aFlexObjects[1].getVariantId(), "#PS1", "the oData variant is present");
				assert.equal(aFlexObjects[2].getVariantId(), "*standard*", "the standard variant is present");
				assert.equal(aFlexObjects[3].getChangeType(), "renameField", "the 1st change in changePersistence is present");
				assert.equal(aFlexObjects[4].getChangeType(), "addGroup", "the 2nd change in changePersistence is present");
			});
		});

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer set", function(assert) {
			var sPersistencyKey = "persistency.key";
			var sVariantId = "variantId1";

			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					isVariant: true,
					layer: Layer.VENDOR,
					content: {},
					id: sVariantId
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: sVariantId,
				layer: Layer.CUSTOMER,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			sandbox.stub(URLSearchParams.prototype, "get").returns(Layer.VENDOR);
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 1, "an array with one entry is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "updateVariant", "the change from the compVariantState is present");
			});
		});

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer not set", function(assert) {
			var sPersistencyKey = "persistency.key";
			var sVariantId = "variantId1";

			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					isVariant: true,
					content: {},
					id: sVariantId
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				favorite: true,
				id: sVariantId,
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent
			})
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 3, "an array with three entries is returned");
			});
		});

		QUnit.test("when flex objects for the current variant are requested", function(assert) {
			var sPersistencyKey = "persistency.key";
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			var oVariant = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant",
				selector: {},
				changeType: "FlVariant",
				layer: Layer.USER,
				variantReference: "otherVariantReference"
			});
			var oChangeOnVariant1 = FlexObjectFactory.createFromFileContent({
				selector: {},
				changeType: "renameField",
				layer: Layer.USER,
				variantReference: "variant1"
			});
			var oChangeOnVariant2 = FlexObjectFactory.createFromFileContent({
				selector: {},
				changeType: "addGroup",
				layer: Layer.USER,
				variantReference: "variant2"
			});
			var oVariantIndependentChange = FlexObjectFactory.createFromFileContent({
				selector: {},
				changeType: "addGroup",
				layer: Layer.USER,
				variantReference: ""
			});
			var oVariantManagementChange = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_management_change",
				selector: {},
				changeType: "setDefault",
				layer: Layer.USER
			});
			var oVariantChange = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				selector: {},
				changeType: "setFavorite",
				layer: Layer.USER
			});
			sandbox.stub(oChangePersistence, "getChangesForComponent").resolves([oVariant, oChangeOnVariant1, oChangeOnVariant2, oVariantIndependentChange, oVariantManagementChange, oVariantChange]);
			FlexState.setInitialNonFlCompVariantData(sReference, sPersistencyKey,
				{
					executeOnSelection: false,
					id: "*standard*",
					name: "Standard"
				},
				[{
					favorite: true,
					id: "#PS1",
					name: "EntityType"
				}]
			);
			sandbox.stub(VariantManagementState, "getVariantManagementReferences").returns(["variantReference1"]);
			sandbox.stub(this.oAppComponent, "getModel").returns({
				getCurrentVariantReference(sVariantManagementReference) {
					if (sVariantManagementReference === "variantReference1") {
						return "variant1";
					}
					if (sVariantManagementReference === "variantReference2") {
						return "variant2";
					}
					return undefined;
				}
			});

			return FlexObjectState.getFlexObjects({
				selector: this.oAppComponent,
				invalidateCache: true,
				onlyCurrentVariants: true
			})
			.then(function(aFlexObjects) {
				assert.notOk(aFlexObjects.includes(oChangeOnVariant2), "then flex objects with different variant references are filtered");
				assert.ok(aFlexObjects.includes(oVariantIndependentChange), "then variant independent flex objects are not filtered");
				assert.strictEqual(aFlexObjects.length, 7, "then the non UI are not filtered");
			});
		});

		[true, false].forEach(function(bIncludeDirtyChanges) {
			var sText = "Get - Given flex objects and dirty changes are present in the ChangePersistence with include dirty changes ";
			sText += bIncludeDirtyChanges ? "set" : "not set";

			QUnit.test(sText, function(assert) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
				addChangesToChangePersistence(oChangePersistence);

				return oChangePersistence.saveDirtyChanges(this.oAppComponent)
				.then(function() {
					addDirtyChanges(oChangePersistence);
				})
				.then(FlexObjectState.getFlexObjects.bind(undefined, {
					selector: this.oAppComponent,
					includeDirtyChanges: bIncludeDirtyChanges,
					currentLayer: Layer.USER
				}))
				.then(function(aFlexObjects) {
					assert.equal(aFlexObjects[0].getChangeType(), "renameField", "the first change from the persistence is present");
					assert.equal(aFlexObjects[1].getChangeType(), "addGroup", "the second change from the persistence is present");
					if (bIncludeDirtyChanges) {
						assert.equal(aFlexObjects.length, 4, "an array with four entries is returned");
						assert.equal(aFlexObjects[2].getChangeType(), "dirtyRenameField", "the third change from the persistence is present");
						assert.equal(aFlexObjects[3].getChangeType(), "dirtyAddGroup", "the fourth change from the persistence is present");
					} else {
						assert.equal(aFlexObjects.length, 2, "an array with two entries is returned");
					}
				});
			});

			sText = "Get - Given only dirty changes are present in the ChangePersistence with include dirty changes ";
			sText += bIncludeDirtyChanges ? "set" : "not set";
			QUnit.test(sText, function(assert) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
				addDirtyChanges(oChangePersistence);

				return FlexObjectState.getFlexObjects({
					selector: this.oAppComponent,
					includeDirtyChanges: bIncludeDirtyChanges,
					currentLayer: Layer.USER
				})
				.then(function(aFlexObjects) {
					if (bIncludeDirtyChanges) {
						assert.equal(aFlexObjects.length, 2, "an array with two entries is returned");
						assert.equal(aFlexObjects[0].getChangeType(), "dirtyRenameField", "the first change from the persistence is present");
						assert.equal(aFlexObjects[1].getChangeType(), "dirtyAddGroup", "the second change from the persistence is present");
					} else {
						assert.equal(aFlexObjects.length, 0, "an empty array is returned");
					}
				});
			});

			sText = "Get - Given only dirty changes from USER Layer are present in the ChangePersistence with include dirty changes ";
			sText += bIncludeDirtyChanges ? "set" : "not set";
			QUnit.test(sText, function(assert) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
				addDirtyChanges(oChangePersistence);

				return FlexObjectState.getFlexObjects({
					selector: this.oAppComponent,
					includeDirtyChanges: bIncludeDirtyChanges,
					currentLayer: Layer.CUSTOMER
				})
				.then(function(aFlexObjects) {
					if (bIncludeDirtyChanges) {
						assert.equal(aFlexObjects.length, 0, "an empty array is returned");
					} else {
						assert.equal(aFlexObjects.length, 0, "an empty array is returned");
					}
				});
			});

			sText = "Get - Given flex objects are present in the ChangePersistence and in the CompVariantState with include dirty changes ";
			sText += bIncludeDirtyChanges ? "set" : "not set";
			QUnit.test(sText, function(assert) {
				var sPersistencyKey = "persistency.key";
				var sVariantId = "variantId1";

				CompVariantState.addVariant({
					changeSpecificData: {
						type: "pageVariant",
						id: sVariantId,
						isVariant: true,
						content: {},
						packageName: "someId" // mark as non-updatable
					},
					reference: sReference,
					persistencyKey: sPersistencyKey
				});
				CompVariantState.updateVariant({
					favorite: true,
					id: sVariantId,
					reference: sReference,
					persistencyKey: sPersistencyKey
				});

				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
				addChangesToChangePersistence(oChangePersistence);

				return oChangePersistence.saveDirtyChanges(this.oAppComponent)
				.then(function() {
					addDirtyChanges(oChangePersistence);
				})
				.then(FlexObjectState.getFlexObjects.bind(undefined, {
					selector: this.oAppComponent,
					includeDirtyChanges: bIncludeDirtyChanges
				}))
				.then(function(aFlexObjects) {
					assert.equal(aFlexObjects[0].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
					assert.equal(aFlexObjects[1].getChangeType(), "updateVariant", "the change from the compVariantState is present");
					assert.equal(aFlexObjects[2].getChangeType(), "renameField", "the first change from the persistence is present");
					assert.equal(aFlexObjects[3].getChangeType(), "addGroup", "the second change from the persistence is present");
					if (bIncludeDirtyChanges) {
						assert.equal(aFlexObjects.length, 6, "an array with four entries is returned");
						assert.equal(aFlexObjects[4].getChangeType(), "dirtyRenameField", "the third change from the persistence is present");
						assert.equal(aFlexObjects[5].getChangeType(), "dirtyAddGroup", "the fourth change from the persistence is present");
					} else {
						assert.equal(aFlexObjects.length, 4, "an array with four entries is returned");
					}
				});
			});
		});

		QUnit.test("GetDirty - Given flex objects and dirty changes are present in the ChangePersistence", function(assert) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);

			addChangesToChangePersistence(oChangePersistence);

			return oChangePersistence.getChangesForComponent()
			.then(oChangePersistence.saveDirtyChanges.bind(oChangePersistence, this.oAppComponent, false))
			.then(function() {
				addDirtyChanges(oChangePersistence);
			})
			.then(FlexObjectState.getDirtyFlexObjects.bind(undefined, {
				selector: this.oAppComponent
			}))
			.then(function(aFlexObjects) {
				assert.equal(aFlexObjects.length, 2, "an array with two entries is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "dirtyRenameField", "the first change from the persistence is present");
				assert.equal(aFlexObjects[1].getChangeType(), "dirtyAddGroup", "the second change from the persistence is present");
			});
		});

		QUnit.test("hasDirtyObjects - Given flex objects and dirty changes are present in the ChangePersistence", function(assert) {
			var oStubGetChangePersistenceForComponent = sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns({
				getDirtyChanges() {
					return ["mockDirty"];
				}
			});
			var oStubCompStateHasDirtyChanges = sandbox.stub(CompVariantState, "hasDirtyChanges").returns(true);
			assert.equal(FlexObjectState.hasDirtyFlexObjects({selector: this.oAppComponent}), true, "hasDirtyFlexObjects return true");
			assert.equal(oStubGetChangePersistenceForComponent.calledOnce, true, "getChangePersistenceForComponent called one");
			assert.equal(oStubCompStateHasDirtyChanges.calledOnce, false, "CompVariantState.hasDirtyChanges is not called");
		});

		QUnit.test("hasDirtyObjects - Given flex objects and dirty changes are present in the CompVariantState", function(assert) {
			var oStubGetChangePersistenceForComponent = sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns({
				getDirtyChanges() {
					return [];
				}
			});
			var oStubCompStateHasDirtyChanges = sandbox.stub(CompVariantState, "hasDirtyChanges").returns(true);
			assert.equal(FlexObjectState.hasDirtyFlexObjects({selector: this.oAppComponent}), true, "hasDirtyFlexObjects return true");
			assert.equal(oStubGetChangePersistenceForComponent.calledOnce, true, "getChangePersistenceForComponent called once");
			assert.equal(oStubCompStateHasDirtyChanges.calledOnce, true, "CompVariantState.hasDirtyChanges is not called");
		});

		QUnit.test("Save", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");

			return FlexObjectState.saveFlexObjects({
				selector: this.oAppComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.USER,
				condenseAnyLayer: true
			}).then((sReturn) => {
				assert.equal(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.equal(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.equal(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[5], true, "the condense flag was passed");

				assert.equal(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				var oExpectedParameters = {
					componentId: sComponentId,
					selector: this.oAppComponent,
					draft: true,
					layer: Layer.USER,
					currentLayer: Layer.USER,
					invalidateCache: true,
					condenseAnyLayer: true,
					reference: sReference
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});

		QUnit.test("Save with update version parameter from version model", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				displayedVersion: Version.Number.Draft
			}));

			return FlexObjectState.saveFlexObjects({
				selector: this.oAppComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.CUSTOMER,
				condenseAnyLayer: true,
				version: 1
			}).then((sReturn) => {
				assert.equal(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.equal(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.equal(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[5], true, "the condense flag was passed");

				assert.equal(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				var oExpectedParameters = {
					componentId: sComponentId,
					selector: this.oAppComponent,
					draft: true,
					layer: Layer.CUSTOMER,
					currentLayer: Layer.CUSTOMER,
					invalidateCache: true,
					condenseAnyLayer: true,
					reference: sReference,
					version: Version.Number.Draft
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});

		QUnit.test("Save with app variant by startup param ", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Utils, "isVariantByStartupParameter").returns("true");
			ManifestUtils.getFlexReferenceForSelector.returns(sReference);
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll").resolves();
			var oFlexController = FlexControllerFactory.createForControl(this.oAppComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");

			return FlexObjectState.saveFlexObjects({
				selector: this.oAppComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.USER,
				condenseAnyLayer: true
			}).then((sReturn) => {
				assert.equal(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.equal(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.equal(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], this.oAppComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[5], true, "the condense flag was passed");

				assert.equal(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				var oExpectedParameters = {
					componentId: sComponentId,
					selector: this.oAppComponent,
					draft: true,
					layer: Layer.USER,
					currentLayer: Layer.USER,
					invalidateCache: true,
					condenseAnyLayer: true,
					reference: sReference
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});