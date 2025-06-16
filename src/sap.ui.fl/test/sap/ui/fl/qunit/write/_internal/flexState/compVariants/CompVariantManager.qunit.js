/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UpdatableChange",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantManager",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	Element,
	Lib,
	UIComponent,
	CompVariant,
	FlexObjectFactory,
	States,
	UpdatableChange,
	CompVariantUtils,
	FlexState,
	ManifestUtils,
	Version,
	Settings,
	FlexObjectManager,
	CompVariantManager,
	CompVariantManagementState,
	Storage,
	Versions,
	Layer,
	Utils,
	JSONModel,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	var sComponentId = "the.app.component";
	var oComponent = new UIComponent(sComponentId);

	QUnit.module("add", {
		async beforeEach() {
			await Settings.getInstance();
			await FlexState.initialize({
				reference: sComponentId,
				componentId: sComponentId
			});
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no propertyBag is provided", function(assert) {
			assert.strictEqual(CompVariantManager.addVariant(), undefined, "then undefined is returned");
		});

		[{
			testName: "Given a non-user dependent variant is added and a public layer is available",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: false,
					content: {}
				},
				reference: sComponentId
			},
			targetCategory: "variants",
			publicLayerAvailable: true,
			expectedLayer: Layer.PUBLIC
		}, {
			testName: "Given a non-user dependent variant is added and a public layer is unavailable",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: false,
					content: {}
				},
				reference: sComponentId,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			},
			targetCategory: "variants",
			publicLayerAvailable: false,
			expectedLayer: Layer.CUSTOMER
		}, {
			testName: "Given a user dependent variant is added",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					content: {}
				},
				reference: sComponentId
			},
			targetCategory: "variants",
			publicLayerAvailable: true,
			expectedLayer: Layer.USER
		}, {
			testName: "Given a PUBLIC variant is added and a public layer is available",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: false,
					content: {}
				},
				reference: sComponentId
			},
			targetCategory: "variants",
			publicLayerAvailable: true,
			expectedLayer: Layer.PUBLIC
		}, {
			testName: "Given a non-user dependent variant is added and a public layer is available",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: false,
					content: {}
				},
				reference: sComponentId
			},
			targetCategory: "variants",
			publicLayerAvailable: true,
			expectedLayer: Layer.PUBLIC
		}, {
			testName: "Given a non-user dependent variant is added and a public layer is unavailable",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: false,
					content: {}
				},
				reference: sComponentId,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			},
			targetCategory: "variants",
			publicLayerAvailable: false,
			expectedLayer: Layer.CUSTOMER
		}, {
			testName: "Given a user dependent variant with specified ID is added",
			propertyBag: {
				changeSpecificData: {
					fileName: "myFancyVariantId",
					type: "pageVariant",
					isUserDependent: true,
					content: {}
				},
				reference: sComponentId
			},
			targetCategory: "variants",
			publicLayerAvailable: true,
			expectedLayer: Layer.USER
		}].forEach(function(oTestData) {
			QUnit.test(oTestData.testName, function(assert) {
				const sPersistencyKey = "persistency.key";
				const mPropertyBag = {
					persistencyKey: sPersistencyKey,
					componentId: sComponentId,
					...oTestData.propertyBag
				};

				sandbox.stub(Settings.getInstanceOrUndef(), "getIsPublicLayerAvailable").returns(oTestData.publicLayerAvailable);

				const oAddedObject = CompVariantManager.addVariant(mPropertyBag);
				const aCompVariants = CompVariantManagementState.getCompEntities(mPropertyBag);

				assert.strictEqual(
					aCompVariants.length,
					1,
					"then one entity was stored"
				);
				assert.strictEqual(
					aCompVariants[0],
					oAddedObject,
					"which is the returned entity"
				);
				assert.strictEqual(
					aCompVariants[0].getLayer(),
					oTestData.expectedLayer,
					"which is in the correct layer"
				);

				if (oTestData.propertyBag.changeSpecificData.fileName) {
					assert.strictEqual(
						aCompVariants[0].getVariantId(),
						oTestData.propertyBag.changeSpecificData.fileName,
						"the object has the passed ID"
					);
				}
			});
		});

		QUnit.test("does not store the default executeOnSelection and favorite and contexts", function(assert) {
			var sPersistencyKey = "persistency.key";
			sandbox.stub(Utils, "createDefaultFileName").returns("someFileName");
			sandbox.stub(Settings.getInstanceOrUndef(), "getUserId").returns("currentUser");
			var mPropertyBag = {
				reference: sComponentId,
				componentId: sComponentId,
				persistencyKey: sPersistencyKey,
				changeSpecificData: {
					content: {},
					isVariant: true,
					type: "filterVariant"
				},
				ODataService: null,
				texts: {
					variantName: {
						value: "newVariant",
						type: "XFLD"
					}
				},
				layer: Layer.CUSTOMER,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};

			const oAddedObject = CompVariantManager.addVariant(mPropertyBag);
			const aCompVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);

			assert.strictEqual(aCompVariants.length, 2, "then one entity was stored next to the standard variant");
			assert.strictEqual(oAddedObject.getName(), "newVariant", "the variant name is set correctly");
			assert.equal(oAddedObject.getAuthor(), Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME"), "the variant author is set correctly");
			assert.strictEqual(aCompVariants[0], oAddedObject, "which is the returned entity");
		});

		QUnit.test("also stores passed executeOnSelection, favorite, contexts and author", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() {return "test user";},
				getIsPublicLayerAvailable() {return false;}
			});
			var sPersistencyKey = "persistency.key";
			sandbox.stub(Utils, "createDefaultFileName").returns("someFileName");
			var mPropertyBag = {
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				changeSpecificData: {
					content: {},
					isVariant: true,
					executeOnSelection: true,
					favorite: true,
					contexts: {
						role: ["someValue"]
					},
					type: "filterVariant"
				},
				ODataService: null,
				texts: {},
				layer: Layer.CUSTOMER,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};

			var oAddedObject = CompVariantManager.addVariant(mPropertyBag);
			const aCompVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);

			assert.strictEqual(aCompVariants.length, 2, "then one entity was stored including the standard variant");

			assert.equal(oAddedObject.getSupportInformation().user, "test user", "the user name is set correctly");
			assert.strictEqual(oAddedObject.getExecuteOnSelection(), true, "executeOnSelection is set");
			assert.strictEqual(oAddedObject.getFavorite(), true, "favorite is set");
			assert.deepEqual(oAddedObject.getContexts(), {
				role: ["someValue"]
			}, "contexts are set");
			assert.strictEqual(aCompVariants[0], oAddedObject, "which is the returned entity");
		});

		QUnit.test("two variants as CUSTOMER and first variant don't save content of second but keep his own", function(assert) {
			var sPersistencyKey = "persistency.key";
			sandbox.stub(Settings.getInstanceOrUndef(), "getUserId").returns("currentUser");
			var mPropertyBag = {
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				changeSpecificData: {
					content: {},
					isVariant: true,
					type: "filterVariant"
				},
				layer: Layer.CUSTOMER,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};

			var oAddedObject = CompVariantManager.addVariant(mPropertyBag);
			let aCompVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);
			assert.strictEqual(aCompVariants.length, 2, "then one entity was stored including the standard variant");
			assert.strictEqual(aCompVariants[0], oAddedObject, "which is the returned entity");

			CompVariantManager.updateVariant({
				action: CompVariantManager.updateActionType.UPDATE,
				id: oAddedObject.getVariantId(),
				layer: Layer.CUSTOMER,
				content: {
					filter: "first update"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantManager.updateVariant({
				action: CompVariantManager.updateActionType.SAVE,
				id: oAddedObject.getVariantId(),
				layer: Layer.CUSTOMER,
				content: {
					filter: "first save"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantManager.updateVariant({
				action: CompVariantManager.updateActionType.UPDATE,
				id: oAddedObject.getVariantId(),
				layer: Layer.CUSTOMER,
				content: {
					filter: "second update"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			var mPropertyBagSecond = {
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				changeSpecificData: {
					content: {filter: "second update"},
					isVariant: true,
					type: "filterVariant"
				},
				layer: Layer.CUSTOMER,
				control: {
					getCurrentVariantId() {
						return oAddedObject.getVariantId();
					}
				}
			};
			var oAddedObjectSecond = CompVariantManager.addVariant(mPropertyBagSecond);

			aCompVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);
			assert.strictEqual(aCompVariants.length, 3, "then another entity was stored");
			assert.strictEqual(aCompVariants[1], oAddedObjectSecond, "which is the returned entity");
			assert.deepEqual(aCompVariants[1].getContent(), {filter: "second update"}, "content of second variant is correct");
			assert.strictEqual(aCompVariants[0].getRevertData().length, 3, "first variant contain correct number of revert data");
			assert.deepEqual(aCompVariants[0].getContent(), {filter: "first update"}, "content of first variant is correct");
		});
	});

	QUnit.module("persist", {
		async beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns(sComponentId);

			sandbox.stub(Settings, "getInstance").returns({
				getIsPublicLayerAvailable() {
					return true;
				},
				getUserId() {
					return "userA";
				}
			});

			await FlexState.initialize({
				reference: sComponentId,
				componentId: sComponentId
			});
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given persist is called with public variant with favorite check", async function(assert) {
			const sPersistencyKey = "persistency.key";
			const sVariantId = "added_variant";
			assert.equal(
				FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}),
				false,
				"hasDirtyFlexObjects is false at beginning"
			);
			const oVariant = CompVariantManager.addVariant({
				id: sVariantId,
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				layer: Layer.PUBLIC,
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return sVariantId;
					}
				}
			});
			assert.equal(
				FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}),
				true,
				"hasDirtyFlexObjects is true after add a new variant"
			);
			CompVariantManager.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: true,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantManager.updateVariant({
				id: oVariant.getVariantId(),
				layer: Layer.PUBLIC,
				content: {
					filter: "abc"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantManager.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: false,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			assert.equal(
				FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}),
				true,
				"hasDirtyFlexObjects is true after update variant"
			);
			const aCompEntities = CompVariantManagementState.getCompEntitiesByPersistencyKey({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});

			const oWriteStub = sandbox.stub(Storage, "write").resolves();
			const oUpdateStub = sandbox.stub(Storage, "update").resolves();
			const oRemoveStub = sandbox.stub(Storage, "remove").resolves();

			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});

			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), false, "hasDirtyFlexObjects is false after persisting all changes");
			assert.strictEqual(oWriteStub.callCount, 2, "then the write method was called 2 times,");
			assert.strictEqual(oUpdateStub.callCount, 0, "no update was called");
			assert.strictEqual(oRemoveStub.callCount, 0, "and no delete was called");

			assert.strictEqual(
				aCompEntities[0].getState(),
				States.LifecycleState.PERSISTED,
				"the variant is persisted"
			);
			assert.strictEqual(aCompEntities[0].getLayer(), Layer.PUBLIC, "it is a public variant");
			assert.strictEqual(aCompEntities[0].getFavorite(), false, "with favorite set to false");
			assert.deepEqual(aCompEntities[0].getContent(), {filter: "abc"}, "with correct content");

			assert.strictEqual(
				aCompEntities[1].getState(),
				States.LifecycleState.PERSISTED,
				"the addFavorite change is persisted"
			);
			assert.strictEqual(
				aCompEntities[1].getLayer(),
				Layer.USER,
				"the variant has a user layer change"
			);
			assert.deepEqual(
				aCompEntities[1].getContent(),
				{favorite: false},
				"with favorite set to false"
			);
		});

		QUnit.test("Given persist is called with all kind of objects (variants, changes, defaultVariant) present", async function(assert) {
			var sPersistencyKey = "persistency.key";

			await CompVariantManagementState.assembleVariantList({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});

			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), false, "hasDirtyChanges is false at beginning");
			var oVariant = CompVariantManager.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});

			const mPropertyBag = {
				reference: sComponentId,
				componentId: sComponentId,
				persistencyKey: sPersistencyKey
			};

			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), true, "hasDirtyChanges is true after add a new variant");
			CompVariantManager.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: true,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), true, "hasDirtyChanges is true after update variant");
			CompVariantManager.setDefault({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				defaultVariantId: "id_123_pageVariant",
				conntent: {}
			});
			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), true, "hasDirtyChanges is true after setDefault variant");
			let aCompVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);

			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			// Preparation ends

			await CompVariantManager.persist(mPropertyBag);

			assert.equal(
				FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}),
				false,
				"hasDirtyChanges is false after persisting all changes"
			);
			assert.strictEqual(oWriteStub.callCount, 3, "then the write method was called 3 times,");
			assert.strictEqual(oUpdateStub.callCount, 0, "no update was called");
			assert.strictEqual(oRemoveStub.callCount, 0, "and no delete was called");

			const aVariantChange = CompVariantManagementState.getVariantChanges(oVariant)[0];

			assert.strictEqual(
				oVariant.getState(),
				States.LifecycleState.PERSISTED,
				"the variant is persisted"
			);
			assert.strictEqual(
				aVariantChange.getState(),
				States.LifecycleState.PERSISTED,
				"the addFavorite change is persisted"
			);

			let aSetDefaultChanges = CompVariantManagementState.getDefaultChanges(mPropertyBag);

			assert.strictEqual(
				aSetDefaultChanges[0].getState(),
				States.LifecycleState.PERSISTED,
				"the set default variant is persisted"
			);
			assert.strictEqual(
				aSetDefaultChanges[0].getNamespace(),
				"apps/the.app.component/changes/",
				"the set default variant change has namespace in the content"
			);

			aSetDefaultChanges = CompVariantManagementState.getDefaultChanges(mPropertyBag);

			oVariant.setState(States.LifecycleState.DELETED);
			aVariantChange.setState(States.LifecycleState.UPDATED);
			aSetDefaultChanges[0].setState(States.LifecycleState.DELETED);

			await CompVariantManager.persist(mPropertyBag);

			aCompVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);

			assert.strictEqual(oWriteStub.callCount, 3, "AFTER SOME CHANGES; still the write method was called 3 times,");
			assert.strictEqual(oUpdateStub.callCount, 1, "one update was called");
			assert.strictEqual(oRemoveStub.callCount, 2, "and two deletes were called");
			assert.strictEqual(aCompVariants.length, 1, "the variant is cleared and only the standard variant is left");
			assert.strictEqual(
				aVariantChange.getState(),
				States.LifecycleState.PERSISTED,
				"the addFavorite change is persisted"
			);
			const aDefaultVariants = CompVariantManagementState.getDefaultChanges(mPropertyBag);
			assert.strictEqual(aDefaultVariants.length, 0, "the default variant was cleared");
			assert.strictEqual(
				aCompVariants.standardVariantChange,
				undefined,
				"the standard variant was cleared"
			);
		});

		QUnit.test("Given persist is called for a variant that was created and removed before persisting", async function(assert) {
			var sPersistencyKey = "persistency.key";
			var oVariant = CompVariantManager.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});
			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), true, "hasDirtyChanges is true after add variant");
			CompVariantManager.removeVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});
			assert.equal(FlexObjectManager.hasDirtyFlexObjects({reference: sComponentId}), false, "hasDirtyChanges is false after remove variant");
			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			// Preparation ends

			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});

			assert.equal(oWriteStub.callCount, 0, "no write was called");
			assert.equal(oUpdateStub.callCount, 0, "no update was called");
			assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
		});

		QUnit.test("Given persist is called for a variant that was created, modified and removed before persisting", async function(assert) {
			var sPersistencyKey = "persistency.key";

			var oVariant = CompVariantManager.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				layer: Layer.CUSTOMER,
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});

			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				favorite: true,
				layer: Layer.CUSTOMER
			});

			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				favorite: false,
				layer: Layer.CUSTOMER
			});

			CompVariantManager.removeVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			var oWriteStub = sandbox.stub(Storage, "write");
			var oUpdateStub = sandbox.stub(Storage, "update");
			var oRemoveStub = sandbox.stub(Storage, "remove");
			// Preparation ends

			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});

			assert.equal(oWriteStub.callCount, 0, "no write was called");
			assert.equal(oUpdateStub.callCount, 0, "no update was called");
			assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
		});
	});

	QUnit.module("setDefault", {
		before() {
			this.sPersistencyKey = "persistency.key";
			this.sVariantId1 = "variantId1";
			this.sVariantId2 = "variantId2";
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given setDefault is called twice with adaptationId", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVersioningEnabled() {
					return false;
				}
			});

			const aInitialDefaultChanges = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});
			assert.deepEqual(aInitialDefaultChanges, [], "no defaultVariant change is set under the persistencyKey");

			var oChange = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				changeSpecificData: {
					adaptationId: "test-AdaptationId2"
				}
			});
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1);

			const aDefaultChangesAfterFirstSetDefault = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});
			assert.strictEqual(
				aDefaultChangesAfterFirstSetDefault.length,
				1,
				"the change was stored into the map"
			);
			assert.strictEqual(
				aDefaultChangesAfterFirstSetDefault[0],
				oChange, "the change is set under the persistencyKey"
			);
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1, "the change content is correct");
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is set to CUSTOMER");
			assert.strictEqual(oChange.getAdaptationId(), "test-AdaptationId2", "the change contains correct adaptation id");

			var oChange2 = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				changeSpecificData: {
					adaptationId: "test-AdaptationId2"
				}
			});

			const aDefaultChangesAfterSecondSetDefault = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId2, "the change content was updated");
			assert.strictEqual(
				aDefaultChangesAfterSecondSetDefault.length,
				1,
				"there is still only one change set under the persistencyKey"
			);
			assert.strictEqual(
				aDefaultChangesAfterSecondSetDefault[0],
				oChange2,
				"the change is set under the persistencyKey"
			);
			assert.strictEqual(oChange, oChange2, "it is still the same change object");
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is still set to CUSTOMER");
			assert.strictEqual(oChange.getAdaptationId(), "test-AdaptationId2", "the change still contains correct adaptation id");
		});

		QUnit.test("Given setDefault is called once for USER layer and once for CUSTOMER layer", function(assert) {
			var oChange = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The layer of the setDefaultChange is CUSTOMER");

			var oChange2 = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});

			const aDefaultChanges = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultChanges[1], oChange2, "the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(oChange2.getLayer(), Layer.USER, "The default layer is still set to USER");
		});

		/**
		 * @deprecated Since version 1.86
		 */
		QUnit.test("Given setDefault is called once for USER layer and twice for CUSTOMER layer and then reverted three times", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sComponentId);
			sandbox.stub(CompVariantUtils, "getPersistencyKey").returns(this.sPersistencyKey);

			const aVariants = [{
				getVariantId: () => this.sVariantId1
			}, {
				getVariantId: () => this.sVariantId2
			}];

			CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});

			CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});

			CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});

			CompVariantManager.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			const aDefaultVariants = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultVariants.length, 2, "still 2 changes are present");

			assert.strictEqual(
				CompVariantManagementState.getDefaultVariantId({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					variants: aVariants
				}),
				this.sVariantId2,
				"the default variant ID can be determined correct"
			);

			CompVariantManager.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultVariants.length, 1, "1 change is remaining");
			assert.strictEqual(
				CompVariantManagementState.getDefaultVariantId({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					variants: aVariants
				}),
				this.sVariantId1,
				"the default variant ID can be determined correct"
			);

			CompVariantManager.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultVariants.length, 0, "the last change was removed");
			assert.strictEqual(
				CompVariantManagementState.getDefaultVariantId({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					variants: aVariants
				}),
				"",
				"the default variant ID can be determined correct"
			);
		});

		QUnit.test("Given setDefault is called with a already transported Change", function(assert) {
			var oChange = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			var oFlexObjectMetadata = oChange.getFlexObjectMetadata();
			oFlexObjectMetadata.packageName = "TRANSPORTED";
			oChange.setFlexObjectMetadata(oFlexObjectMetadata);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});

			const aDefaultChanges = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultChanges[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(oChange2.getLayer(), Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});

		QUnit.test("Given I have a USER Layer setDefault and create a CUSTOMER setDefault", function(assert) {
			var oChange = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.strictEqual(oChange.getLayer(), Layer.USER, "The default layer is set to USER");

			var oChange2 = CompVariantManager.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});

			const aDefaultChanges = CompVariantManagementState.getDefaultChanges({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultChanges[1], oChange2, "the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(oChange2.getLayer(), Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});
	});

	QUnit.module("updateVariant", {
		beforeEach() {
			this.sPersistencyKey = "persistency.key";
			this.oVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.VENDOR,
					texts: {
						variantName: "initialName"
					},
					content: {},
					favorite: true
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};

			this.oVariant = CompVariantManager.addVariant(this.oVariantData);
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given updateVariant is called on an updatable variant", function(assert) {
			// Set favorite to false
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.VENDOR,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName",
				visible: false
			});
			assert.strictEqual(this.oVariant.getLayer(), Layer.VENDOR, "the layer of the variant is VENDOR");
			assert.strictEqual(this.oVariant.getSupportInformation().user, "SAP", "the author is SAP");
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite was set to false for the variant");
			assert.strictEqual(CompVariantManagementState.getVariantChanges(this.oVariant).length, 0, "no change was written");
			assert.notOk(this.oVariant.getVisible(), "then visible was set to false");
		});

		QUnit.test("Given updateVariant is called on an updatable variant with forceCreate", function(assert) {
			// Set favorite to false
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.VENDOR,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName",
				visible: false,
				adaptationId: "test-AdaptationId1",
				forceCreate: true
			});
			assert.strictEqual(this.oVariant.getLayer(), Layer.VENDOR, "the layer of the variant is VENDOR");
			assert.strictEqual(this.oVariant.getSupportInformation().user, "SAP", "the author is SAP");
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite was set to false for the variant");
			assert.strictEqual(CompVariantManagementState.getVariantChanges(this.oVariant).length, 1, "no change was written");
			assert.strictEqual(
				CompVariantManagementState.getVariantChanges(this.oVariant)[0].getAdaptationId(),
				"test-AdaptationId1",
				"then the correct adaptationId was set"
			);
			assert.notOk(CompVariantManagementState.getVariantChanges(this.oVariant)[0].getContent().visible, "then visible was set to false");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant (different layer)", function(assert) {
			// Set favorite to false
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName"
			});
			assert.strictEqual(CompVariantManagementState.getVariantChanges(this.oVariant).length, 1, "then one variant change was created");
			assert.equal(this.oVariant.getRevertData().length, 1, "then the change is applied on the variant");
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite was changed in the variant by the applied change");
			assert.strictEqual(this.oVariant.getName(), "newName", "the variant name is correct");
			assert.deepEqual(this.oVariant.getContexts(), {foo: "bar"}, "the contexts are correct");
			assert.strictEqual(this.oVariant.getExecuteOnSelection(), true, "the executeOnSelection is correct");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant (different layer) and an updatable change", function(assert) {
			var oUpdatedContent = {test: "wee"};
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName"
			});
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite is first set to false by the applied change");
			assert.strictEqual(this.oVariant.getName(), "newName", "the variant name is correct");
			assert.deepEqual(this.oVariant.getContexts(), {foo: "bar"}, "the contexts are correct");
			assert.strictEqual(this.oVariant.getExecuteOnSelection(), true, "the executeOnSelection is correct");
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: true,
				content: oUpdatedContent,
				layer: Layer.USER
			});
			assert.strictEqual(this.oVariant.getFavorite(), true, "then the favorite is set to true by the updated change");
			assert.strictEqual(CompVariantManagementState.getVariantChanges(this.oVariant).length, 1, "only one change was written - it gets updated");
			assert.strictEqual(
				CompVariantManagementState.getVariantChanges(this.oVariant)[0].getContent().variantContent,
				oUpdatedContent,
				"the variant content is set correctly"
			);
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant and a non-updatable change", function(assert) {
			// the non-updatable change
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.CUSTOMER,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName"
			});
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite is first set to false by the non-updatable change");
			assert.strictEqual(this.oVariant.getName(), "newName", "the variant name is correct");
			assert.deepEqual(this.oVariant.getContexts(), {foo: "bar"}, "the contexts are correct");
			assert.strictEqual(this.oVariant.getExecuteOnSelection(), true, "the executeOnSelection is correct");
			// because the update is within another layer, the previous change cannot be updated
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: true,
				layer: Layer.USER
			});
			assert.strictEqual(this.oVariant.getFavorite(), true, "the favorite is set to true by a second change");
			assert.strictEqual(CompVariantManagementState.getVariantChanges(this.oVariant).length, 2, "two changes were written");
		});

		QUnit.test("Given updateVariant is called on a PUBLIC variant", function(assert) {
			var oPublicVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.PUBLIC,
					texts: {
						variantName: "initialName"
					},
					content: {},
					favorite: false
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			};
			var oPublicVariant = CompVariantManager.addVariant(oPublicVariantData);
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oPublicVariant.getVariantId(),
				favorite: true,
				layer: Layer.PUBLIC,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName"
			});
			assert.strictEqual(oPublicVariant.getFavorite(), false, "and favorite is always set to false");
			assert.strictEqual(oPublicVariant.getName(), "newName", "and the variant name is correct");
			assert.deepEqual(oPublicVariant.getContexts(), {foo: "bar"}, "and the contexts are correct");
			assert.strictEqual(oPublicVariant.getExecuteOnSelection(), true, "and executeOnSelection is correct");
		});
	});

	QUnit.module("discardVariantContent", {
		beforeEach() {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() {return "test user";},
				isPublicLayerAvailable() {return false;}
			});
			this.sPersistencyKey = "persistency.key";
			this.oVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.CUSTOMER,
					texts: {
						variantName: {
							value: "initialName",
							type: "XFLD"
						}
					},
					content: {},
					favorite: true
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};
			this.newVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.CUSTOMER,
					texts: {
						variantName: "Variant1"
					},
					content: {},
					favorite: true
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given discardVariantContent is called and changes are made on the initial variant", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantManager.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<UPDATE>>, update, discard");
				CompVariantManager.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					favorite: false,
					executeOnSelection: true,
					contexts: {
						role: ["someRole"]
					},
					name: "myNewName",
					action: CompVariantManager.updateActionType.UPDATE_METADATA
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<update>>, discard");
				CompVariantManager.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someValue"
					},
					action: CompVariantManager.updateActionType.UPDATE
				});

				assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");

				assert.ok(true, "STEP: update, update, <<DISCARD>>");
				CompVariantManager.discardVariantContent({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 3, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
			}.bind(this));
		});

		QUnit.test("Given discardVariantContent is called and changes are made on as saved variant", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantManager.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			// ensure a persisted state and empty revertData aggregation
			return CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<UPDATE>>, save, update, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someValue"
					},
					action: CompVariantManager.updateActionType.UPDATE
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "1 revert data is present");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");

				assert.ok(true, "STEP: update, <<SAVE>>, update, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					action: CompVariantManager.updateActionType.SAVE
				});
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 2, "2 revert data entry is present");

				assert.ok(true, "STEP: update, save, <<UPDATE>>, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someNewValue"
					},
					action: CompVariantManager.updateActionType.UPDATE
				});
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someNewValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 3, "3 revert data entries are present");

				assert.ok(true, "STEP: update, save, update, <<DISCARD>>");
				CompVariantManager.discardVariantContent({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 4, "4 revert data entry is present");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
			}.bind(this));
		});

		QUnit.test("Given discardVariantContent is called when no changes were made", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantManager.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			// ensure a persisted state and empty revertData aggregation
			return CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<DISCARD>>");
				CompVariantManager.discardVariantContent({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data entry is present");
				assert.deepEqual(oVariant.getContent(), {}, "still empty");
				assert.deepEqual(oVariant.getName(), "Variant1", "name is still the same");
			}.bind(this));
		});

		QUnit.test("Given discardVariantContent is called and changes are made on a variant with multiple saves before", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantManager.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			// ensure a persisted state and empty revertData aggregation
			return CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<UPDATE>>, save, update, save, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					favorite: false,
					content: {
						someKey: "someValue"
					},
					executeOnSelection: true,
					name: "myNewName"
				});

				assert.ok(true, "STEP: update, <<save>>, update, save, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					action: CompVariantManager.updateActionType.SAVE
				});
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 2, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, save, <<update>>, save, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "newValue"
					},
					favorite: false,
					contexts: {
						role: ["someRole"]
					}
				});

				assert.strictEqual(oVariant.getRevertData().length, 3, "two revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, save, update, <<save>>, discard");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					action: CompVariantManager.updateActionType.SAVE
				});

				assert.ok(true, "STEP: update, save, update, save, <<discard>>");
				CompVariantManager.discardVariantContent({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 5, "5 revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "newValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");
			}.bind(this));
		});

		QUnit.test("Given discardVariantContent is called when variant changes were made", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantManager.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			return CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.ok(true, "STEP: <<update>>, DISCARD");
				CompVariantManager.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					name: "myNewName",
					action: CompVariantManager.updateActionType.UPDATE
				});

				assert.strictEqual(oVariant.getRevertData().length, 1, "1 revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.deepEqual(oVariant.getName(), "myNewName", "and the name is updated");
				var oCompVariantStateUpdateVariantStub = sandbox.stub(CompVariantManager, "updateVariant");
				assert.ok(true, "STEP: update, <<DISCARD>>");
				CompVariantManager.discardVariantContent({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.equal(oCompVariantStateUpdateVariantStub.callCount, 1, "updateVariant is called");
				assert.equal(oCompVariantStateUpdateVariantStub.getCalls()[0].args[0].layer, Layer.CUSTOMER, "layer is set in updateVariant call");
				assert.strictEqual(oVariant.getRevertData().length, 1, "1 revert data entry is present");
			}.bind(this));
		});
	});

	QUnit.module("revert", {
		beforeEach() {
			this.sPersistencyKey = "persistency.key";
			this.oVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.CUSTOMER,
					texts: {
						variantName: {
							value: "initialName",
							type: "XFLD"
						}
					},
					content: {},
					favorite: true
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given updateVariant is called on a non-updatable variant and a updatable change which is then reverted", function(assert) {
			const sVariantId = "added_variant";
			const oVariant = CompVariantManager.addVariant(
				Object.assign({
					id: sVariantId,
					control: {
						getCurrentVariantId() {
							return sVariantId;
						}
					}
				}, this.oVariantData)
			);
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				executeOnSelection: true,
				layer: Layer.USER
			});
			const oChange = CompVariantManagementState.getVariantChanges(oVariant)[0];
			assert.strictEqual(
				oChange.getContent().executeOnSelection,
				true,
				"the original change sets executeOnSelection to true"
			);
			assert.strictEqual(oChange.getContent().favorite, undefined, "the original change does not change favorite");
			assert.strictEqual(oVariant.getFavorite(), true, "favorite is originally true");

			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER
			});
			assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 1, "before the revert one updated change is present");
			assert.strictEqual(
				oChange.getContent().executeOnSelection,
				true,
				"the updated change sets executeOnSelection to true"
			);
			assert.strictEqual(oChange.getContent().favorite, false, "the updated change sets favorite to false");
			assert.strictEqual(oVariant.getFavorite(), false, "favorite is set to false");

			CompVariantManager.revert({
				id: oVariant.getVariantId(),
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(
				oChange.getContent().executeOnSelection,
				true,
				"the remaining change sets executeOnSelection to true"
			);
			assert.strictEqual(oChange.getContent().favorite, undefined, "the remaining change does not change favorite");
			assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 1, "one change was written - the change update was reverted");
			assert.strictEqual(oVariant.getFavorite(), true, "favorite goes back to true on the variant after the revert");
			assert.strictEqual(oVariant.getExecuteOnSelection(), true, "executeOnSelection remains true on the variant after the revert");
		});

		QUnit.test("Given a variant was updated and reverted multiple times (update, update, revert, update, revert, revert)", async function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantManager.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");

			assert.ok(true, "STEP: <<UPDATE>>, update, revert, update, revert, revert");
			CompVariantManager.updateVariant({
				id: sVariantId,
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: true
			});
			assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
			assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
			assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
			assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

			assert.ok(true, "STEP: update, <<UPDATE>>, revert, update, revert, revert");
			CompVariantManager.updateVariant({
				id: sVariantId,
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				favorite: true,
				content: {
					someKey: "someValue"
				},
				contexts: {
					role: ["someRole"]
				},
				name: "myNewName"
			});
			assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
			assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
			assert.deepEqual(oVariant.getContent(), {
				someKey: "someValue"
			}, "the content is correct");
			assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
			assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

			assert.ok(true, "STEP: update, update, <<REVERT>>, update, revert, revert");
			CompVariantManager.revert({
				id: sVariantId,
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});
			assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
			assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
			assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
			assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
			assert.deepEqual(oVariant.getName(), { type: "XFLD", value: "initialName" }, "and the name is also reverted");
			assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

			assert.ok(true, "STEP: update, update, revert, <<UPDATE>>, revert, revert");
			CompVariantManager.updateVariant({
				id: sVariantId,
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				favorite: false,
				layer: Layer.CUSTOMER,
				content: {
					someKey: "someValue"
				},
				contexts: {
					role: ["someOtherRole"]
				}
			});
			assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
			assert.deepEqual(oVariant.getContent(), {
				someKey: "someValue"
			}, "the content is correct");
			assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
			assert.strictEqual(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

			assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
			CompVariantManager.revert({
				id: sVariantId,
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});
			assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.UPDATED, "the variant has the correct state");
			assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
			assert.strictEqual(
				oVariant.getFavorite(),
				false,
				"the favorite flag was set correctly (stays the same as before the change)"
			);
			assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelection flag was set correctly");
			assert.deepEqual(oVariant.getContent(), {}, "the content is correct");

			assert.ok(true, "STEP: update, update, revert, update, revert, <<REVERT>>");
			CompVariantManager.revert({
				id: sVariantId,
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});
			assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly (original value)");
			assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data entries are present");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
			assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
			assert.deepEqual(oVariant.getContent(), {}, "the content was set correctly");
		});

		QUnit.test("Given a variant in another layer was updated and reverted multiple times (update, update, revert, update, revert, revert)", function(assert) {
			var oWriteStub = sandbox.stub(Storage, "write").resolves();

			this.oVariantData.changeSpecificData.layer = Layer.CUSTOMER_BASE;
			this.oVariantData.changeSpecificData.favorite = false; // override default of the CUSTOMER_BASE
			var oVariant = CompVariantManager.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");

				assert.ok(true, "STEP: <<UPDATE>>, update, revert, update, revert, revert");
				CompVariantManager.updateVariant({
					isUserDependent: true,
					id: sVariantId,
					reference: sComponentId,
					layer: Layer.CUSTOMER,
					persistencyKey: this.sPersistencyKey,
					favorite: true,
					executeOnSelection: true
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 1, "the changes list contains one entry");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<UPDATE>>, revert, update, revert, revert");
				CompVariantManager.updateVariant({
					isUserDependent: true,
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.USER,
					favorite: false,
					content: {
						someKey: "someValue"
					},
					contexts: {
						role: ["someRole"]
					},
					name: "myNewName"
				});
				assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 2, "the changes list contains two entries");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, <<REVERT>>, update, revert, revert");
				CompVariantManager.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 1, "the changes list contains one entry");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
				assert.deepEqual(oVariant.getName(), { type: "XFLD", value: "initialName" }, "and the name is also reverted");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, <<UPDATE>>, revert, revert");
				CompVariantManager.updateVariant({
					isUserDependent: true,
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					favorite: false,
					content: {
						someKey: "someValue"
					},
					contexts: {
						role: ["someOtherRole"]
					}
				});
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 2, "the changes list contains two entries");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantManager.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 1, "the changes list contains one entry");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");

				assert.ok(true, "STEP: update, update, revert, update, revert, <<REVERT>>");
				CompVariantManager.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(CompVariantManagementState.getVariantChanges(oVariant).length, 0, "the changes list contains no entries");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correct");
			}.bind(this)).then(function() {
				CompVariantManager.persist({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
			}.bind(this)).then(function() {
				assert.strictEqual(oWriteStub.callCount, 1, "only the initial variant was written");
			});
		});

		QUnit.test("Given a variant was was added and a persist was called", async function(assert) {
			var oVariant = CompVariantManager.addVariant(this.oVariantData);
			sandbox.stub(Storage, "write").resolves();

			await Settings.getInstance();

			// adding a change to test, that the remove-function not existent in changes is not called = the test does not die
			CompVariantManager.updateVariant({
				reference: sComponentId,
				executeOnSelection: true,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				favorite: true
			});

			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
		});

		QUnit.test("Given a variant was removed", function(assert) {
			var oVariant = CompVariantManager.addVariant(this.oVariantData);

			// simulate an already persisted state
			oVariant.setState(States.LifecycleState.PERSISTED);

			CompVariantManager.removeVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(oVariant.getState(), States.LifecycleState.DELETED, "the variant is flagged for deletion");
			var aRevertData = oVariant.getRevertData();
			assert.strictEqual(aRevertData.length, 1, "revertData was stored");
			var oLastRevertData = aRevertData[0];
			assert.strictEqual(
				oLastRevertData.getType(),
				CompVariantManager.operationType.StateUpdate,
				"it is stored that the state was updated ..."
			);
			assert.deepEqual(oLastRevertData.getContent(), {previousState: States.LifecycleState.PERSISTED}, "... from PERSISTED");

			CompVariantManager.revert({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				layer: Layer.CUSTOMER
			});

			aRevertData = oVariant.getRevertData();
			assert.strictEqual(aRevertData.length, 0, "after a revert... the revert data is no longer available");
			assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "and the variant is flagged as PERSISTED");
		});
	});

	QUnit.module("overrideStandardVariant", {
		async beforeEach() {
			this.sPersistencyKey = "persistency.key";
			await FlexState.initialize({
				reference: sComponentId,
				componentId: sComponentId
			});
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		function fnInitAndPrepareStandardVariant(oStandardVariantInputEnhancement) {
			const oStandardVariantInput = Object.assign({
				id: "*standard*",
				name: "Standard"
			}, oStandardVariantInputEnhancement);

			// initialize the standard variant
			CompVariantManagementState.assembleVariantList({
				reference: sComponentId,
				componentId: sComponentId,
				persistencyKey: this.sPersistencyKey,
				standardVariant: oStandardVariantInput || {}
			});

			CompVariantManager.overrideStandardVariant({
				reference: sComponentId,
				componentId: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			const mCompEntities = CompVariantManagementState.getCompEntitiesByPersistencyKey({
				reference: sComponentId,
				componentId: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			return mCompEntities.find((oEntity) => oEntity.getStandardVariant?.());
		}

		function fnMockStandardVariant(bExecuteOnSelect) {
			var oMockedStandardVariant = new FlexObjectFactory.createFromFileContent({
				fileName: "fileId_123",
				fileType: "variant",
				reference: sComponentId,
				selector: {
					persistencyKey: this.sPersistencyKey
				},
				layer: Layer.CUSTOMER,
				content: {
					standardvariant: true,
					executeOnSelect: bExecuteOnSelect
				}
			});
			FlexState.addDirtyFlexObjects(sComponentId, [oMockedStandardVariant]);
			return oMockedStandardVariant;
		}

		QUnit.test("Given a standard variant, when the standard variant is overridden", function(assert) {
			const oStandardVariant = fnInitAndPrepareStandardVariant.call(this);
			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), false, "then the default executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant with an applied change, when the standard variant is overridden", function(assert) {
			const oStandardVariant = fnInitAndPrepareStandardVariant.call(this);

			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oStandardVariant.getVariantId(),
				executeOnSelection: true
			});

			CompVariantManager.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), true, "then the change is reapplied");
		});

		QUnit.test("Given a standard variant set by the loadVariants call, when the standard variant is overridden", function(assert) {
			const oStandardVariant = fnInitAndPrepareStandardVariant.call(this, {
				executeOnSelection: true
			});

			CompVariantManager.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), false, "then the executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant set by the loadVariants call and an applied change, when the standard variant is overridden", function(assert) {
			const oStandardVariant = fnInitAndPrepareStandardVariant.call(this, {
				executeOnSelection: true
			});

			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oStandardVariant.getVariantId(),
				executeOnSelection: true
			});

			CompVariantManager.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard, when the standard variant is overridden", function(assert) {
			var oMockedStandardVariant = fnMockStandardVariant.call(true);
			fnInitAndPrepareStandardVariant.call(this);

			CompVariantManager.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oMockedStandardVariant.getExecuteOnSelection(), false, "then the executeOnSelection is set to false");
		});
	});

	QUnit.module("Versioning is enabled", {
		beforeEach() {
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			this.sPersistencyKey = "persistency.key";
			var oVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.CUSTOMER,
					texts: {
						variantName: "initialName"
					},
					content: {},
					executeOnSelection: false
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			};

			this.oVariant = CompVariantManager.addVariant(oVariantData);
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given updateVariant is called without being a draft version", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			sandbox.stub(this.oVariant, "getState").returns(States.LifecycleState.UPDATED);
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			assert.equal(CompVariantManagementState.getVariantChanges(this.oVariant).length, 1, "one change was written");
			assert.equal(
				CompVariantManagementState.getVariantChanges(this.oVariant)[0].getContent().executeOnSelection,
				true,
				"the change executeOnSelection is set correct"
			);
		});

		QUnit.test("Given updateVariant is called in a draft version", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: [this.oVariant.getId()]
			}));

			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});

			assert.equal(
				this.oVariant.convertToFileContent().executeOnSelection,
				true,
				"the executeOnSelection was set within the variant"
			);
		});

		QUnit.test("Given updateVariant is called twice without being a draft version", function(assert) {
			var oUpdatedContent = {};
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			sandbox.stub(this.oVariant, "getState").returns(States.LifecycleState.UPDATED);
			var oSetContentSpy = sandbox.spy(this.oVariant, "setContent");
			var oSetExecuteOnSelectionSpy = sandbox.spy(this.oVariant, "setExecuteOnSelection");
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				content: oUpdatedContent,
				layer: Layer.CUSTOMER
			});
			assert.equal(oSetContentSpy.called, true, "and the content was stored");
			assert.equal(oSetExecuteOnSelectionSpy.called, true, "and the execute on select");
			assert.equal(
				CompVariantManagementState.getVariantChanges(this.oVariant)[0].getContent().variantContent,
				oUpdatedContent,
				"and the variant content is set correct"
			);
			assert.equal(
				CompVariantManagementState.getVariantChanges(this.oVariant)[0].getContent().executeOnSelection,
				true,
				"and the change executeOnSelection is set correct"
			);
		});

		QUnit.test("Given persist is called with parentVersion", async function(assert) {
			var sParentVersion = "GUIDParentVersion";
			const {sPersistencyKey} = this;
			var oVersionsModel = new JSONModel({
				persistedVersion: sParentVersion,
				draftFilenames: [this.oVariant.getId()],
				versioningEnabled: true
			});
			sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
			const oVariant = CompVariantManager.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {},
					layer: Layer.CUSTOMER
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});
			CompVariantManager.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			CompVariantManager.setDefault({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				defaultVariantId: "id_123_pageVariant",
				conntent: {},
				layer: Layer.CUSTOMER
			});
			var oResponse = {
				response: [{
					reference: sComponentId,
					layer: Layer.CUSTOMER
				}]
			};

			var oWriteStub = sandbox.stub(Storage, "write").resolves(oResponse);
			var oUpdateStub = sandbox.stub(Storage, "update").resolves(oResponse);
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			var oLoadVersionStub = sandbox.stub(Storage.versions, "load").resolves([{}]);
			var oVersionsOnAllChangesSaved = sandbox.stub(Versions, "onAllChangesSaved");

			const mPropertyBag = {
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			};

			await CompVariantManager.persist(mPropertyBag);
			assert.equal(oWriteStub.callCount, 3, "then the write method was called three times,");
			assert.equal(oUpdateStub.callCount, 0, "no update was called");
			assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
			assert.equal(oWriteStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct");
			assert.equal(
				oWriteStub.getCalls()[1].args[0].parentVersion,
				Version.Number.Draft,
				"and the second request the parentVersion parmeter is draft a version"
			);
			assert.equal(oVersionsOnAllChangesSaved.callCount, 3, "and versions.onAllChangesSaved is called three time");
			const aDefaultChanges = CompVariantManagementState.getDefaultChanges(mPropertyBag);

			oVariant.setState(States.LifecycleState.UPDATED);
			aDefaultChanges[0].setState(States.LifecycleState.DELETED);

			await CompVariantManager.persist(mPropertyBag);

			assert.equal(oWriteStub.callCount, 3, "AFTER SOME CHANGES; still the write method was called three times,");
			assert.equal(oUpdateStub.callCount, 1, "one update was called");
			assert.equal(oRemoveStub.callCount, 1, "and one deletes were called");
			assert.equal(oLoadVersionStub.callCount, 1, "and version.load is called");
			assert.equal(oUpdateStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct in update");
			assert.equal(
				oRemoveStub.getCalls()[0].args[0].parentVersion,
				Version.Number.Draft,
				"and parentVersion is set correct in delete"
			);
			assert.equal(oVersionsOnAllChangesSaved.callCount, 4, "and versions.onAllChangesSaved is called a fourth time");
		});

		QUnit.test("Given remove variant as last draft file name", async function(assert) {
			var sParentVersion = "GUIDParentVersion";
			var oVersionsModel = new JSONModel({
				versioningEnabled: true,
				activeVersion: 1,
				persistedVersion: sParentVersion,
				draftFilenames: [this.oVariant.getId()],
				versions: [
					{version: Version.Number.Draft},
					{version: 1}]
			});
			sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
			var oResponse = {
				response: [{
					reference: sComponentId,
					layer: Layer.CUSTOMER
				}]
			};

			var oWriteStub = sandbox.stub(Storage, "write").resolves(oResponse);
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			var oVersionsOnAllChangesSaved = sandbox.stub(Versions, "onAllChangesSaved");

			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.equal(oWriteStub.callCount, 1, "then the write method was called one times,");
			assert.equal(oUpdateStub.callCount, 0, "no update was called");
			assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
			assert.equal(oWriteStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct");
			assert.equal(oVersionsOnAllChangesSaved.callCount, 1, "and versions.onAllChangesSaved is called one time");

			this.oVariant.setState(States.LifecycleState.DELETED);
			var aReturnedBackendVersions = [{
				version: "1"
			}];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);

			await CompVariantManager.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.equal(oWriteStub.callCount, 1, "AFTER SOME CHANGES; still the write method was called one times,");
			assert.equal(oUpdateStub.callCount, 0, "no update was called");
			assert.equal(oRemoveStub.callCount, 1, "and one deletes were called");
			assert.equal(oRemoveStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct in delete");
			var mPropertyBag = {reference: sComponentId, layer: Layer.CUSTOMER};
			var oVersionModel = Versions.getVersionsModel(mPropertyBag);
			assert.equal(oVersionModel.getProperty("/draftFilenames").length, 0, "and no draft filename in version model");
			assert.equal(oVersionModel.getProperty("/versions").length, 1, "and only one version left in version model");
			assert.equal(
				oVersionModel.getProperty("/displayedVersion"),
				1,
				"and displayedVersion is same as activeVersion in version model"
			);
			assert.equal(
				oVersionModel.getProperty("/persistedVersion"),
				1,
				"and persistedVersion is same as activeVersion in version model"
			);
			assert.equal(oVersionsOnAllChangesSaved.callCount, 1, "and versions.onAllChangesSaved is called a one time");
		});
	});

	QUnit.module("checkSVMControlsForDirty", {
		before() {
			this.oControl1 = new Control("controlId1");
			this.oControl1.getModified = function() {return true;};
			this.oControl2 = new Control("controlId2");
			this.oControl2.getModified = function() {return false;};
		},
		beforeEach() {
			this.oGetSVMControlsStub = sandbox.stub(FlexState, "getSVMControls");
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			this.oControl1.destroy();
			this.oControl2.destroy();
		}
	}, function() {
		QUnit.test("with a modified control", function(assert) {
			this.oGetSVMControlsStub.returns([
				{ getModified: () => false },
				undefined, // destroyed control
				{ getModified: () => true }
			]);
			assert.equal(CompVariantManager.checkSVMControlsForDirty(), true, "the modified control is found");
		});

		QUnit.test("without modified control", function(assert) {
			this.oGetSVMControlsStub.returns([
				{ getModified: () => false },
				undefined // destroyed control
			]);
			assert.equal(CompVariantManager.checkSVMControlsForDirty(), false, "no modified control is found");
		});

		QUnit.test("without any control", function(assert) {
			this.oGetSVMControlsStub.returns([]);
			assert.equal(CompVariantManager.checkSVMControlsForDirty(), false, "no modified control is found");
		});
	});

	QUnit.module("filterHiddenFlexObjects", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with hidden variants", function(assert) {
			const aFlexObjects = [
				FlexObjectFactory.createCompVariant({
					fileName: "variant1",
					variantId: "variant1",
					persisted: true,
					selector: {
						persistencyKey: "persistencyKey1"
					}
				}),
				FlexObjectFactory.createFromFileContent({
					id: "uichange1",
					layer: Layer.USER,
					changeType: "notUpdateVariant"
				}),
				FlexObjectFactory.createFromFileContent({
					id: "uichange2",
					layer: Layer.USER,
					changeType: "updateVariant",
					selector: {
						variantId: "variant1"
					}
				}),
				FlexObjectFactory.createFromFileContent({
					id: "uichange3",
					layer: Layer.USER,
					changeType: "updateVariant",
					selector: {
						variantId: "deletedVariant"
					}
				}),
				FlexObjectFactory.createFromFileContent({
					id: "uichange4",
					layer: Layer.USER,
					changeType: "defaultVariant",
					content: {
						defaultVariantName: "deletedVariant"
					}
				}),
				FlexObjectFactory.createFromFileContent({
					id: "uichange5",
					layer: Layer.USER,
					changeType: "defaultVariant",
					content: {
						defaultVariantName: ""
					}
				})
			];
			const aFilteredFlexObjects = CompVariantManager.filterHiddenFlexObjects(aFlexObjects, "something");
			assert.strictEqual(aFilteredFlexObjects.length, 3, "updateVariant change of deleted variant is filter out");
		});
	});

	QUnit.done(function() {
		oComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});