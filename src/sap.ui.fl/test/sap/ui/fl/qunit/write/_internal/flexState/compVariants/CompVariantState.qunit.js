/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Control,
	Element,
	Lib,
	UIComponent,
	CompVariant,
	FlexObjectFactory,
	States,
	UIChange,
	CompVariantMerger,
	FlexState,
	Version,
	Settings,
	CompVariantState,
	Storage,
	Versions,
	Layer,
	Utils,
	JSONModel,
	sinon,
	FlQUnitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	var sComponentId = "the.app.component";
	var oComponent = new UIComponent(sComponentId);

	QUnit.module("add", {
		beforeEach() {
			return Settings.getInstance();
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no propertyBag is provided", function(assert) {
			assert.strictEqual(CompVariantState.addVariant(), undefined, "then undefined is returned");
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
				var sPersistencyKey = "persistency.key";
				var mPropertyBag = Object.assign({
					persistencyKey: sPersistencyKey
				}, oTestData.propertyBag);

				sandbox.stub(Settings.getInstanceOrUndef(), "isPublicLayerAvailable").returns(oTestData.publicLayerAvailable);

				var oAddedObject = CompVariantState.addVariant(mPropertyBag);
				var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
				var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

				assert.strictEqual(
					mCompVariantsMapForPersistencyKey[oTestData.targetCategory].length,
					1,
					"then one entity was stored"
				);
				assert.strictEqual(
					mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0],
					oAddedObject,
					"which is the returned entity"
				);
				assert.strictEqual(
					mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0].getLayer(),
					oTestData.expectedLayer,
					"which is in the correct layer"
				);

				if (oTestData.propertyBag.changeSpecificData.fileName) {
					assert.strictEqual(
						mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0].getVariantId(),
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

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.strictEqual(oAddedObject.getName(), "newVariant", "the variant name is set correctly");
			assert.equal(oAddedObject.getAuthor(), Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME"), "the variant author is set correctly");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
		});

		QUnit.test("also stores passed executeOnSelection, favorite, contexts and author", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUserId() {return "test user";},
				isPublicLayerAvailable() {return false;}
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

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.equal(oAddedObject.getSupportInformation().user, "test user", "the user name is set correctly");
			assert.strictEqual(oAddedObject.getExecuteOnSelection(), true, "executeOnSelection is set");
			assert.strictEqual(oAddedObject.getFavorite(), true, "favorite is set");
			assert.deepEqual(oAddedObject.getContexts(), {
				role: ["someValue"]
			}, "contexts are set");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
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

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");

			CompVariantState.updateVariant({
				action: CompVariantState.updateActionType.UPDATE,
				id: oAddedObject.getVariantId(),
				layer: Layer.CUSTOMER,
				content: {
					filter: "first update"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				action: CompVariantState.updateActionType.SAVE,
				id: oAddedObject.getVariantId(),
				layer: Layer.CUSTOMER,
				content: {
					filter: "first save"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				action: CompVariantState.updateActionType.UPDATE,
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
			var oAddedObjectSecond = CompVariantState.addVariant(mPropertyBagSecond);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBagSecond.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBagSecond.persistencyKey];

			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants.length, 2, "then one entity was stored");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[1], oAddedObjectSecond, "which is the returned entity");
			assert.deepEqual(mCompVariantsMapForPersistencyKey.variants[1].getContent(), {filter: "second update"}, "content of second variant is correct");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[0].getRevertData().length, 3, "first variant contain correct number of revert data");
			assert.deepEqual(mCompVariantsMapForPersistencyKey.variants[0].getContent(), {filter: "first update"}, "content of first variant is correct");
		});
	});

	QUnit.module("persist", {
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given persist is called with public variant with favorite check", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isPublicLayerAvailable() {
					return true;
				},
				getUserId() {
					return "userA";
				}
			});
			const sPersistencyKey = "persistency.key";
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), false, "hasDirtyChanges is false at beginning");
			const oVariant = CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				layer: Layer.PUBLIC,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), true, "hasDirtyChanges is true after add a new variant");
			CompVariantState.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: true,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				id: oVariant.getVariantId(),
				layer: Layer.PUBLIC,
				content: {
					filter: "abc"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: false,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), true, "hasDirtyChanges is true after update variant");
			const oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(sPersistencyKey);

			const oWriteStub = sandbox.stub(Storage, "write").resolves();
			const oUpdateStub = sandbox.stub(Storage, "update").resolves();
			const oRemoveStub = sandbox.stub(Storage, "remove").resolves();

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			})
			.then(function() {
				assert.equal(
					CompVariantState.hasDirtyChanges(sComponentId),
					false,
					"hasDirtyChanges is false after persisting all changes"
				);
				assert.strictEqual(oWriteStub.callCount, 2, "then the write method was called 2 times,");
				assert.strictEqual(oUpdateStub.callCount, 0, "no update was called");
				assert.strictEqual(oRemoveStub.callCount, 0, "and no delete was called");
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.variants[0].getState(),
					States.LifecycleState.PERSISTED,
					"the variant is persisted"
				);
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.changes[0].getState(),
					States.LifecycleState.PERSISTED,
					"the addFavorite change is persisted"
				);
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.variants[0].getLayer(), Layer.PUBLIC, "it is a public variant");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.variants[0].getFavorite(), false, "with favorite set to false");
				assert.deepEqual(oCompVariantStateMapForPersistencyKey.variants[0].getContent(), {filter: "abc"}, "with correct content");
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.changes[0].getLayer(),
					Layer.USER,
					"the variant has a user layer change"
				);
				assert.deepEqual(
					oCompVariantStateMapForPersistencyKey.changes[0].getContent(),
					{favorite: false},
					"with favorite set to false"
				);
			});
		});

		QUnit.test("Given persist is called with all kind of objects (variants, changes, defaultVariant) present", function(assert) {
			var sPersistencyKey = "persistency.key";
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), false, "hasDirtyChanges is false at beginning");
			var oVariant = CompVariantState.addVariant({
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
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), true, "hasDirtyChanges is true after add a new variant");
			CompVariantState.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: true,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), true, "hasDirtyChanges is true after update variant");
			CompVariantState.setDefault({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				defaultVariantId: "id_123_pageVariant",
				conntent: {}
			});
			assert.equal(CompVariantState.hasDirtyChanges(sComponentId), true, "hasDirtyChanges is true after setDefault variant");
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(sPersistencyKey);

			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			// Preparation ends

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			})
			.then(function() {
				assert.equal(
					CompVariantState.hasDirtyChanges(sComponentId),
					false,
					"hasDirtyChanges is false after persisting all changes"
				);
				assert.strictEqual(oWriteStub.callCount, 3, "then the write method was called 3 times,");
				assert.strictEqual(oUpdateStub.callCount, 0, "no update was called");
				assert.strictEqual(oRemoveStub.callCount, 0, "and no delete was called");
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.variants[0].getState(),
					States.LifecycleState.PERSISTED,
					"the variant is persisted"
				);
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.changes[0].getState(),
					States.LifecycleState.PERSISTED,
					"the addFavorite change is persisted"
				);
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.defaultVariants[0].getState(),
					States.LifecycleState.PERSISTED,
					"the set default variant is persisted"
				);
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.defaultVariants[0].getNamespace(),
					"apps/the.app.component/changes/",
					"the set default variant change has namespace in the content"
				);
			})
			.then(function() {
				oCompVariantStateMapForPersistencyKey.variants[0].setState(States.LifecycleState.DELETED);
				oCompVariantStateMapForPersistencyKey.changes[0].setState(States.LifecycleState.DIRTY);
				oCompVariantStateMapForPersistencyKey.defaultVariants[0].setState(States.LifecycleState.DELETED);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}))
			.then(function() {
				assert.strictEqual(oWriteStub.callCount, 3, "AFTER SOME CHANGES; still the write method was called 3 times,");
				assert.strictEqual(oUpdateStub.callCount, 1, "one update was called");
				assert.strictEqual(oRemoveStub.callCount, 2, "and two deletes were called");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.variants.length, 0, "the variant is cleared");
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.changes[0].getState(),
					States.LifecycleState.PERSISTED,
					"the addFavorite change is persisted"
				);
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants.length, 0, "the default variant was cleared");
				assert.strictEqual(
					oCompVariantStateMapForPersistencyKey.standardVariantChange,
					undefined,
					"the standard variant was cleared"
				);
			});
		});

		QUnit.test("Given persist is called for a variant that was created and removed before persisting", function(assert) {
			var sPersistencyKey = "persistency.key";
			var oVariant = CompVariantState.addVariant({
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
			CompVariantState.removeVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			// Preparation ends

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			})
			.then(function() {
				assert.equal(oWriteStub.callCount, 0, "no write was called");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
			});
		});

		QUnit.test("Given persist is called for a variant that was created, modified and removed before persisting", function(assert) {
			var sPersistencyKey = "persistency.key";

			var oVariant = CompVariantState.addVariant({
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

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				favorite: true,
				layer: Layer.CUSTOMER
			});

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				favorite: false,
				layer: Layer.CUSTOMER
			});

			CompVariantState.removeVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			// Preparation ends

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			})
			.then(function() {
				assert.equal(oWriteStub.callCount, 0, "no write was called");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
			});
		});

		QUnit.test("persistAll", async function(assert) {
			let iSetModifiedFalseCalls = 0;
			const oPersistStub = sandbox.stub(CompVariantState, "persist")
			.callsFake(FlQUnitUtils.resolveWithDelayedCallWhichMustNotBeInParallel(assert));
			sandbox.stub(FlexState, "getCompVariantsMap").returns({
				persistencyKey1: {
					controlId: "SVM1"
				},
				persistencyKey2: {
					controlId: "SVM2"
				},
				persistencyKey3: {
					controlId: "SVM3"
				}
			});

			sandbox.stub(Element, "getElementById").returns({
				setModified(bSet) {
					if (!bSet) {
						iSetModifiedFalseCalls++;
					}
				}
			});

			await CompVariantState.persistAll(sComponentId);
			assert.strictEqual(oPersistStub.callCount, 3, "persist was called three times");
			assert.strictEqual(oPersistStub.getCall(0).args[0].reference, sComponentId);
			assert.strictEqual(oPersistStub.getCall(0).args[0].persistencyKey, "persistencyKey1");
			assert.strictEqual(oPersistStub.getCall(1).args[0].reference, sComponentId);
			assert.strictEqual(oPersistStub.getCall(1).args[0].persistencyKey, "persistencyKey2");
			assert.strictEqual(oPersistStub.getCall(2).args[0].reference, sComponentId);
			assert.strictEqual(oPersistStub.getCall(2).args[0].persistencyKey, "persistencyKey3");
			assert.strictEqual(iSetModifiedFalseCalls, 3, "then all SVM controls modified flags were set to false");
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
		QUnit.test("Given setDefault is called twice and adaptationId is not provided", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVersioningEnabled() {
					return false;
				}
			});

			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariant, undefined,
				"no defaultVariant change is set under the persistencyKey");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 0, "no entities are present");

			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1);
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants.length, 1, "the change was stored into the map");
			assert.strictEqual(
				oCompVariantStateMapForPersistencyKey.defaultVariants[0],
				oChange,
				"the change is set under the persistencyKey"
			);
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1, "the change content is correct");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				1,
				"one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is set to CUSTOMER");
			assert.notOk(oChange.getAdaptationId(), "the change does not contain adaptation id");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId2, "the change content was updated");
			assert.strictEqual(
				oCompVariantStateMapForPersistencyKey.defaultVariants[0],
				oChange2,
				"the change is set under the persistencyKey"
			);
			assert.strictEqual(oChange, oChange2, "it is still the same change object");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				1,
				"still one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is still set to CUSTOMER");
			assert.notOk(oChange.getAdaptationId(), "the change does not contain adaptation id");
		});

		QUnit.test("Given setDefault is called twice with adaptationId", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVersioningEnabled() {
					return false;
				}
			});

			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariant, undefined,
				"no defaultVariant change is set under the persistencyKey");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 0, "no entities are present");

			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				changeSpecificData: {
					adaptationId: "test-AdaptationId2"
				}
			});
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1);
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants.length, 1, "the change was stored into the map");
			assert.strictEqual(
				oCompVariantStateMapForPersistencyKey.defaultVariants[0],
				oChange, "the change is set under the persistencyKey"
			);
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1, "the change content is correct");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				1,
				"one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is set to CUSTOMER");
			assert.strictEqual(oChange.getAdaptationId(), "test-AdaptationId2", "the change contains correct adaptation id");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				changeSpecificData: {
					adaptationId: "test-AdaptationId2"
				}
			});
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId2, "the change content was updated");
			assert.strictEqual(
				oCompVariantStateMapForPersistencyKey.defaultVariants[0],
				oChange2,
				"the change is set under the persistencyKey"
			);
			assert.strictEqual(oChange, oChange2, "it is still the same change object");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				1,
				"still one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is still set to CUSTOMER");
			assert.strictEqual(oChange.getAdaptationId(), "test-AdaptationId2", "the change still contains correct adaptation id");
		});

		QUnit.test("Given setDefault is called once for USER layer and once for CUSTOMER layer", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				1,
				"one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				2,
				"still one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange2.getLayer(), Layer.USER, "The default layer is still set to USER");
		});

		QUnit.test("Given setDefault is called with a already transported Change", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			var oFlexObjectMetadata = oChange.getFlexObjectMetadata();
			oFlexObjectMetadata.packageName = "TRANSPORTED";
			oChange.setFlexObjectMetadata(oFlexObjectMetadata);
			assert.strictEqual(oChange.getLayer(), Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				2,
				"still one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange2.getLayer(), Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});

		QUnit.test("Given I have a USER Layer setDefault and create a CUSTOMER setDefault", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				1,
				"one entity for persistencyKeys is present"
			);
			assert.strictEqual(oChange.getLayer(), Layer.USER, "The default layer is set to USER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(
				Object.keys(oCompVariantStateMapForPersistencyKey.byId).length,
				2,
				"still one entity for persistencyKeys is present"
			);
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

			this.oVariant = CompVariantState.addVariant(this.oVariantData);
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given updateVariant is called on an updatable variant", function(assert) {
			// Set favorite to false
			CompVariantState.updateVariant({
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
			assert.strictEqual(this.oVariant.getChanges().length, 0, "no change was written");
			assert.notOk(this.oVariant.getVisible(), "then visible was set to false");
		});

		QUnit.test("Given updateVariant is called on an updatable variant with forceCreate", function(assert) {
			// Set favorite to false
			CompVariantState.updateVariant({
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
			assert.strictEqual(this.oVariant.getChanges().length, 1, "no change was written");
			assert.strictEqual(
				this.oVariant.getChanges()[0].getAdaptationId(),
				"test-AdaptationId1",
				"then the correct adaptationId was set"
			);
			assert.notOk(this.oVariant.getChanges()[0].getContent().visible, "then visible was set to false");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant (different layer)", function(assert) {
			var oApplyChangesOnVariantSpy = sandbox.spy(CompVariantMerger, "applyChangeOnVariant");
			// Set favorite to false
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER,
				executeOnSelection: true,
				contexts: {foo: "bar"},
				name: "newName"
			});
			assert.strictEqual(this.oVariant.getChanges().length, 1, "then one variant change was created");
			assert.ok(oApplyChangesOnVariantSpy.called, "then the change is applied on the variant");
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite was changed in the variant by the applied change");
			assert.strictEqual(this.oVariant.getName(), "newName", "the variant name is correct");
			assert.deepEqual(this.oVariant.getContexts(), {foo: "bar"}, "the contexts are correct");
			assert.strictEqual(this.oVariant.getExecuteOnSelection(), true, "the executeOnSelection is correct");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant (different layer) and an updatable change", function(assert) {
			var oUpdatedContent = {test: "wee"};
			CompVariantState.updateVariant({
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
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: true,
				content: oUpdatedContent,
				layer: Layer.USER
			});
			assert.strictEqual(this.oVariant.getFavorite(), true, "then the favorite is set to true by the updated change");
			assert.strictEqual(this.oVariant.getChanges().length, 1, "only one change was written - it gets updated");
			assert.strictEqual(
				this.oVariant.getChanges()[0].getContent().variantContent,
				oUpdatedContent,
				"the variant content is set correctly"
			);
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant and a non-updatable change", function(assert) {
			// the non-updatable change
			CompVariantState.updateVariant({
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
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: true,
				layer: Layer.USER
			});
			assert.strictEqual(this.oVariant.getFavorite(), true, "the favorite is set to true by a second change");
			assert.strictEqual(this.oVariant.getChanges().length, 2, "two changes were written");
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
			var oPublicVariant = CompVariantState.addVariant(oPublicVariantData);
			CompVariantState.updateVariant({
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
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<UPDATE>>, update, discard");
				CompVariantState.updateVariant({
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
					action: CompVariantState.updateActionType.UPDATE_METADATA
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<update>>, discard");
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someValue"
					},
					action: CompVariantState.updateActionType.UPDATE
				});

				assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");

				assert.ok(true, "STEP: update, update, <<DISCARD>>");
				CompVariantState.discardVariantContent({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 3, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
			}.bind(this));
		});

		QUnit.test("Given discardVariantContent is called and changes are made on as saved variant", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantState.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<UPDATE>>, save, update, discard");
				CompVariantState.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someValue"
					},
					action: CompVariantState.updateActionType.UPDATE
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "1 revert data is present");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");

				assert.ok(true, "STEP: update, <<SAVE>>, update, discard");
				CompVariantState.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					action: CompVariantState.updateActionType.SAVE
				});
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 2, "2 revert data entry is present");

				assert.ok(true, "STEP: update, save, <<UPDATE>>, discard");
				CompVariantState.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someNewValue"
					},
					action: CompVariantState.updateActionType.UPDATE
				});
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someNewValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 3, "3 revert data entries are present");

				assert.ok(true, "STEP: update, save, update, <<DISCARD>>");
				CompVariantState.discardVariantContent({
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
			var oVariant = CompVariantState.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<DISCARD>>");
				CompVariantState.discardVariantContent({
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
			var oVariant = CompVariantState.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");

				assert.ok(true, "STEP: <<UPDATE>>, save, update, save, discard");
				CompVariantState.updateVariant({
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
				CompVariantState.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					action: CompVariantState.updateActionType.SAVE
				});
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 2, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, save, <<update>>, save, discard");
				CompVariantState.updateVariant({
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
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, save, update, <<save>>, discard");
				CompVariantState.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					action: CompVariantState.updateActionType.SAVE
				});

				assert.ok(true, "STEP: update, save, update, save, <<discard>>");
				CompVariantState.discardVariantContent({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 5, "5 revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
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
			var oVariant = CompVariantState.addVariant(this.newVariantData);
			var sNewVariantId = oVariant.getVariantId();
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.ok(true, "STEP: <<update>>, DISCARD");
				CompVariantState.updateVariant({
					id: sNewVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					name: "myNewName",
					action: CompVariantState.updateActionType.UPDATE
				});

				assert.strictEqual(oVariant.getRevertData().length, 1, "1 revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.deepEqual(oVariant.getName(), "myNewName", "and the name is updated");
				var oCompVariantStateUpdateVariantStub = sandbox.stub(CompVariantState, "updateVariant");
				assert.ok(true, "STEP: update, <<DISCARD>>");
				CompVariantState.discardVariantContent({
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
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				executeOnSelection: true,
				layer: Layer.USER
			});
			assert.strictEqual(
				oVariant.getChanges()[0].getContent().executeOnSelection,
				true,
				"the original change sets executeOnSelection to true"
			);
			assert.strictEqual(oVariant.getChanges()[0].getContent().favorite, undefined, "the original change does not change favorite");
			assert.strictEqual(oVariant.getFavorite(), true, "favorite is originally true");

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER
			});
			assert.strictEqual(oVariant.getChanges().length, 1, "before the revert one updated change is present");
			assert.strictEqual(
				oVariant.getChanges()[0].getContent().executeOnSelection,
				true,
				"the updated change sets executeOnSelection to true"
			);
			assert.strictEqual(oVariant.getChanges()[0].getContent().favorite, false, "the updated change sets favorite to false");
			assert.strictEqual(oVariant.getFavorite(), false, "favorite is set to false");

			CompVariantState.revert({
				id: oVariant.getVariantId(),
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(
				oVariant.getChanges()[0].getContent().executeOnSelection,
				true,
				"the remaining change sets executeOnSelection to true"
			);
			assert.strictEqual(oVariant.getChanges()[0].getContent().favorite, undefined, "the remaining change does not change favorite");
			assert.strictEqual(oVariant.getChanges().length, 1, "one change was written - the change update was reverted");
			assert.strictEqual(oVariant.getFavorite(), true, "favorite goes back to true on the variant after the revert");
			assert.strictEqual(oVariant.getExecuteOnSelection(), true, "executeOnSelection remains true on the variant after the revert");
		});

		QUnit.test("Given a variant was updated and reverted multiple times (update, update, revert, update, revert, revert)", function(assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");

				assert.ok(true, "STEP: <<UPDATE>>, update, revert, update, revert, revert");
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey,
					layer: Layer.CUSTOMER,
					favorite: false,
					executeOnSelection: true
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<UPDATE>>, revert, update, revert, revert");
				CompVariantState.updateVariant({
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
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, <<REVERT>>, update, revert, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelect flag was set correctly");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
				assert.deepEqual(oVariant.getName(), { type: "XFLD", value: "initialName" }, "and the name is also reverted");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, <<UPDATE>>, revert, revert");
				CompVariantState.updateVariant({
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
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.DIRTY, "the variant has the correct state");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.strictEqual(
					oVariant.getFavorite(),
					false,
					"the favorite flag was set correctly (stays the same as before the change)"
				);
				assert.strictEqual(oVariant.getExecuteOnSelection(), true, "the executeOnSelection flag was set correctly");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");

				assert.ok(true, "STEP: update, update, revert, update, revert, <<REVERT>>");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly (original value)");
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correctly");
			}.bind(this));
		});

		QUnit.test("Given a variant in another layer was updated and reverted multiple times (update, update, revert, update, revert, revert)", function(assert) {
			var oWriteStub = sandbox.stub(Storage, "write").resolves();

			this.oVariantData.changeSpecificData.layer = Layer.CUSTOMER_BASE;
			this.oVariantData.changeSpecificData.favorite = false; // override default of the CUSTOMER_BASE
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");

				assert.ok(true, "STEP: <<UPDATE>>, update, revert, update, revert, revert");
				CompVariantState.updateVariant({
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
				assert.strictEqual(oVariant.getChanges().length, 1, "the changes list contains one entry");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<UPDATE>>, revert, update, revert, revert");
				CompVariantState.updateVariant({
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
				assert.strictEqual(oVariant.getChanges().length, 2, "the changes list contains two entries");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getName(), "myNewName", "and the name is updated");
				assert.strictEqual(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, <<REVERT>>, update, revert, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getChanges().length, 1, "the changes list contains one entry");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
				assert.deepEqual(oVariant.getName(), { type: "XFLD", value: "initialName" }, "and the name is also reverted");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, <<UPDATE>>, revert, revert");
				CompVariantState.updateVariant({
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
				assert.strictEqual(oVariant.getChanges().length, 2, "the changes list contains two entries");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.strictEqual(oVariant.getRevertData().length, 2, "two revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.strictEqual(oVariant.getChanges().length, 1, "the changes list contains one entry");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");

				assert.ok(true, "STEP: update, update, revert, update, revert, <<REVERT>>");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getFavorite(), true, "the favorite flag was set correctly");
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data entries are present");
				assert.strictEqual(oVariant.getState(), States.LifecycleState.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getChanges().length, 0, "the changes list contains no entries");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correct");
			}.bind(this)).then(function() {
				CompVariantState.persist({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
			}.bind(this)).then(function() {
				assert.strictEqual(oWriteStub.callCount, 1, "only the initial variant was written");
			});
		});

		QUnit.test("Given a variant was was added and a persist was called", function(assert) {
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			sandbox.stub(Storage, "write").resolves();

			return Settings.getInstance()
			.then(function() {
				// adding a change to test, that the remove-function not existent in changes is not called = the test does not die
				CompVariantState.updateVariant({
					reference: sComponentId,
					executeOnSelection: true,
					persistencyKey: this.sPersistencyKey,
					id: oVariant.getVariantId(),
					favorite: true
				});

				return CompVariantState.persist({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
			}.bind(this)).then(function() {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
			});
		});

		QUnit.test("Given a variant was removed", function(assert) {
			var oVariant = CompVariantState.addVariant(this.oVariantData);

			// simulate an already persisted state
			oVariant.setState(States.LifecycleState.PERSISTED);

			CompVariantState.removeVariant({
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
				CompVariantState.operationType.StateUpdate,
				"it is stored that the state was updated ..."
			);
			assert.deepEqual(oLastRevertData.getContent(), {previousState: States.LifecycleState.PERSISTED}, "... from PERSISTED");

			CompVariantState.revert({
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
		before() {
			this.sPersistencyKey = "persistency.key";
		},
		afterEach() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a standard variant, when the standard variant is overridden", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			CompVariantMerger.merge(this.sPersistencyKey, mCompData._getOrCreate(this.sPersistencyKey), {});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).standardVariant;
			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), false, "then the default executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant with an applied change, when the standard variant is overridden", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			CompVariantMerger.merge(this.sPersistencyKey, mCompData._getOrCreate(this.sPersistencyKey), {});
			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).standardVariant;

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oStandardVariant.getVariantId(),
				executeOnSelection: true
			});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), true, "then the change is reapplied");
			assert.strictEqual(oStandardVariant.getChanges().length, 1, "the change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by the loadVariants call, when the standard variant is overridden", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			CompVariantMerger.merge(this.sPersistencyKey, mCompData._getOrCreate(this.sPersistencyKey), {
				executeOnSelection: true
			});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).standardVariant;
			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), false, "then the executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant set by the loadVariants call and an applied change, when the standard variant is overridden", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			CompVariantMerger.merge(this.sPersistencyKey, mCompData._getOrCreate(this.sPersistencyKey), {
				executeOnSelection: true
			});

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).standardVariant;

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oStandardVariant.getVariantId(),
				executeOnSelection: true
			});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.strictEqual(oStandardVariant.getChanges().length, 1, "the change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard, when the standard variant is overridden", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = new CompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getVariantId()] = oMockedStandardVariant;

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oMockedStandardVariant.getExecuteOnSelection(), false, "then the executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied change, when the standard variant is overridden", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = FlexObjectFactory.createCompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getVariantId()] = oMockedStandardVariant;

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: "fileId_123",
				executeOnSelection: true
			});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.strictEqual(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied legacy change", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = FlexObjectFactory.createCompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getVariantId()] = oMockedStandardVariant;

			CompVariantMerger.applyChangeOnVariant(oMockedStandardVariant, new UIChange({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				flexObjectMetadata: {
					changeType: "standardVariant"
				},
				id: "fileId_123",
				content: {
					executeOnSelect: true
				}
			}));

			assert.strictEqual(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.strictEqual(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied legacy change, when overrideStandardVariant is called and overrules the legacy change", function(assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = FlexObjectFactory.createCompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getVariantId()] = oMockedStandardVariant;

			CompVariantMerger.applyChangeOnVariant(oMockedStandardVariant, new UIChange({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				flexObjectMetadata: {
					changeType: "standardVariant"
				},
				id: "fileId_123",
				content: {
					executeOnSelect: true
				}
			}));

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.strictEqual(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.strictEqual(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
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

			this.oVariant = CompVariantState.addVariant(oVariantData);
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
			sandbox.stub(this.oVariant, "getState").returns(States.LifecycleState.DIRTY);
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			assert.equal(this.oVariant.getChanges().length, 1, "one change was written");
			assert.equal(
				this.oVariant.getChanges()[0].getContent().executeOnSelection,
				true,
				"the change executeOnSelection is set correct"
			);
		});

		QUnit.test("Given updateVariant is called in a draft version", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: [this.oVariant.getId()]
			}));

			CompVariantState.updateVariant({
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
			sandbox.stub(this.oVariant, "getState").returns(States.LifecycleState.DIRTY);
			var oApplyChangesOnVariantSpy = sandbox.spy(CompVariantMerger, "applyChangeOnVariant");
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				content: oUpdatedContent,
				layer: Layer.CUSTOMER
			});
			assert.equal(oApplyChangesOnVariantSpy.callCount, 2, "and apply two changes");
			assert.equal(this.oVariant.getChanges().length, 1, "and one change was written");
			assert.equal(
				this.oVariant.getChanges()[0].getContent().variantContent,
				oUpdatedContent,
				"and the variant content is set correct"
			);
			assert.equal(
				this.oVariant.getChanges()[0].getContent().executeOnSelection,
				true,
				"and the change executeOnSelection is set correct"
			);
		});

		QUnit.test("Given persist is called with parentVersion", function(assert) {
			var sParentVersion = "GUIDParentVersion";
			var oVersionsModel = new JSONModel({
				persistedVersion: sParentVersion,
				draftFilenames: [this.oVariant.getId()],
				versioningEnabled: true
			});
			sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {},
					layer: Layer.CUSTOMER
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				control: {
					getCurrentVariantId() {
						return "";
					}
				}
			});
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			CompVariantState.setDefault({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
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
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);

			var oWriteStub = sandbox.stub(Storage, "write").resolves(oResponse);
			var oUpdateStub = sandbox.stub(Storage, "update").resolves(oResponse);
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			var oLoadVersionStub = sandbox.stub(Storage.versions, "load").resolves([{}]);
			var oVersionsOnAllChangesSaved = sandbox.stub(Versions, "onAllChangesSaved");

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			})
			.then(function() {
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
			})
			.then(function() {
				oCompVariantStateMapForPersistencyKey.variants[0].setState(States.LifecycleState.DIRTY);
				oCompVariantStateMapForPersistencyKey.defaultVariants[0].setState(States.LifecycleState.DELETED);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}))
			.then(function() {
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
		});

		QUnit.test("Given remove variant as last draft file name", function(assert) {
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
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);

			var oWriteStub = sandbox.stub(Storage, "write").resolves(oResponse);
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			var oVersionsOnAllChangesSaved = sandbox.stub(Versions, "onAllChangesSaved");

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			})
			.then(function() {
				assert.equal(oWriteStub.callCount, 1, "then the write method was called one times,");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
				assert.equal(oWriteStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct");
				assert.equal(oVersionsOnAllChangesSaved.callCount, 1, "and versions.onAllChangesSaved is called one time");
			})
			.then(function() {
				oCompVariantStateMapForPersistencyKey.variants[0].setState(States.LifecycleState.DELETED);
				var aReturnedBackendVersions = [{
					version: "1"
				}];
				sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}))
			.then(function() {
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
	});

	QUnit.module("checkSVMControlsForDirty", {
		before() {
			this.oControl1 = new Control("controlId1");
			this.oControl1.getModified = function() {return true;};
			this.oControl2 = new Control("controlId2");
			this.oControl2.getModified = function() {return false;};
		},
		beforeEach() {
			this.oGetMapStub = sandbox.stub(FlexState, "getCompVariantsMap");
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
			this.oGetMapStub.returns({
				foo() {},
				bar: false,
				key1: {
					controlId: "controlId1"
				},
				key2: {
					controlId: "controlId2"
				},
				key3: {
					controlId: "controlId3"
				}
			});
			assert.ok(CompVariantState.checkSVMControlsForDirty(), "the modified control is found");
		});

		QUnit.test("without modified control", function(assert) {
			this.oGetMapStub.returns({
				foo() {},
				bar: false,
				key2: {
					controlId: "controlId2"
				},
				key3: {
					controlId: "controlId3"
				}
			});
			assert.notOk(CompVariantState.checkSVMControlsForDirty(), "no modified control is found");
		});

		QUnit.test("without any control", function(assert) {
			this.oGetMapStub.returns({
				foo() {},
				bar: false
			});
			assert.notOk(CompVariantState.checkSVMControlsForDirty(), "no modified control is found");
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
			sandbox.stub(FlexState, "getCompVariantsMap").returns({
				persistencyKey1: {
					variants: [
						{
							getId: () => "variant1"
						}, {
							getId: () => "variant2"
						}
					]
				},
				_getOrCreate: {},
				_initialize: {}
			});

			const aFlexObjects = [
				FlexObjectFactory.createCompVariant({
					fileName: "variant1",
					variantId: "variant1",
					persisted: true,
					selector: {
						persistencyKey: "persistencyKey1"
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "uichange1",
					layer: Layer.USER,
					changeType: "notUpdateVariant"
				}),
				FlexObjectFactory.createUIChange({
					id: "uichange2",
					layer: Layer.USER,
					changeType: "updateVariant",
					selector: {
						variantId: "variant1"
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "uichange3",
					layer: Layer.USER,
					changeType: "updateVariant",
					selector: {
						variantId: "deletedVariant"
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "uichange4",
					layer: Layer.USER,
					changeType: "defaultVariant",
					content: {
						defaultVariantName: "deletedVariant"
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "uichange5",
					layer: Layer.USER,
					changeType: "defaultVariant",
					content: {
						defaultVariantName: ""
					}
				})
			];
			const aFilteredFlexObjects = CompVariantState.filterHiddenFlexObjects(aFlexObjects, "something");
			assert.strictEqual(aFilteredFlexObjects.length, 4, "updateVariant change of deleted variant is filter out");
		});
	});

	QUnit.done(function() {
		oComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});