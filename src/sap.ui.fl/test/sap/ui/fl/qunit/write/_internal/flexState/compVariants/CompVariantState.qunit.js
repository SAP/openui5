/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	SmartVariantManagementApplyAPI,
	CompVariantMerger,
	FlexState,
	CompVariant,
	States,
	FlexObjectFactory,
	CompVariantUtils,
	ManifestUtils,
	Settings,
	CompVariantState,
	Storage,
	Versions,
	Version,
	Change,
	Utils,
	Layer,
	JSONModel,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	var sComponentId = "the.app.component";
	var oComponent = new UIComponent(sComponentId);

	QUnit.module("add", {
		beforeEach: function () {
			return Settings.getInstance()
			.then(function () {
				return FlexState.initialize({
					componentId: sComponentId,
					reference: sComponentId
				});
			});
		},
		afterEach: function() {
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
				reference: sComponentId
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
				reference: sComponentId
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
		}].forEach(function (oTestData) {
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

		function updateSapui5VersionTo1(oFlexObject) {
			oFlexObject.update({
				support: {
					sapui5Version: "1"
				}
			});
		}

		QUnit.test("does not store the default executeOnSelection and favorite and contexts", function (assert) {
			var sPersistencyKey = "persistency.key";
			sandbox.stub(Utils, "createDefaultFileName").returns("someFileName");
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
					value: "newVariant",
					type: "XFLD"
				},
				layer: Layer.CUSTOMER
			};

			var oExpectedVariant = {
				changeType: "filterVariant",
				content: {},
				contexts: {},
				executeOnSelection: false,
				favorite: false,
				fileType: "variant",
				fileName: "someFileName",
				layer: "CUSTOMER",
				namespace: "apps/the.app.component/changes/",
				originalLanguage: "EN",
				persistencyKey: "persistency.key",
				projectId: "the.app.component",
				reference: "the.app.component",
				standardVariant: false,
				support: {
					generator: "FlexObjectFactory.createCompVariant",
					sapui5Version: "1",
					service: null
				},
				texts: {
					value: "newVariant",
					type: "XFLD"
				},
				variantId: "someFileName"
			};

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.ok(oAddedObject.getSupportInformation().sapui5Version, "the version was filled in the support");
			updateSapui5VersionTo1(oAddedObject); // avoid broken tests with version changes
			assert.deepEqual(oAddedObject.convertToFileContent(), oExpectedVariant, "and the added object is created correct");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
		});

		QUnit.test("also stores passed executeOnSelection and favorite and contexts", function (assert) {
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
				layer: Layer.CUSTOMER
			};

			var oExpectedVariant = {
				changeType: "filterVariant",
				content: {},
				contexts: {
					role: [
						"someValue"
					]
				},
				executeOnSelection: true,
				favorite: true,
				fileType: "variant",
				fileName: "someFileName",
				layer: "CUSTOMER",
				namespace: "apps/the.app.component/changes/",
				originalLanguage: "EN",
				persistencyKey: "persistency.key",
				projectId: "the.app.component",
				reference: "the.app.component",
				standardVariant: false,
				support: {
					generator: "FlexObjectFactory.createCompVariant",
					sapui5Version: "1",
					service: null
				},
				texts: {},
				variantId: "someFileName"
			};

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.ok(oAddedObject.getSupportInformation().sapui5Version, "the version was filled in the support");
			updateSapui5VersionTo1(oAddedObject); // avoid broken tests with version changes
			assert.deepEqual(oAddedObject.convertToFileContent(), oExpectedVariant, "and the added object is created correct");
			assert.strictEqual(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
		});
	});

	QUnit.module("persist", {
		beforeEach: function() {
			FlexState.clearState(sComponentId);

			return Promise.all([
				FlexState.initialize({
					componentId: sComponentId,
					reference: sComponentId
				}),
				Settings.getInstance()
			]);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given persist is called with all kind of objects (variants, changes, defaultVariant) are present", function(assert) {
			var sPersistencyKey = "persistency.key";

			var oVariant = CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.updateVariant({
				id: oVariant.getVariantId(),
				isUserDependent: true,
				favorite: true,
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.setDefault({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				defaultVariantId: "id_123_pageVariant",
				conntent: {}
			});

			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(sPersistencyKey);

			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			var oUpdateStub = sandbox.stub(Storage, "update").resolves();
			var oRemoveStub = sandbox.stub(Storage, "remove").resolves();
			// Preparation ends

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			})
			.then(function () {
				assert.strictEqual(oWriteStub.callCount, 3, "then the write method was called 3 times,");
				assert.strictEqual(oUpdateStub.callCount, 0, "no update was called");
				assert.strictEqual(oRemoveStub.callCount, 0, "and no delete was called");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.variants[0].getState(), States.PERSISTED, "the variant is persisted");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[0].getState(), Change.states.PERSISTED, "the set default variant is persisted");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[0].getNamespace(), "apps/the.app.component/changes/", "the set default variant change has namespace in the content");
			})
			.then(function () {
				oCompVariantStateMapForPersistencyKey.variants[0].setState(States.DELETED);
				oCompVariantStateMapForPersistencyKey.changes[0].setState(Change.states.DIRTY);
				oCompVariantStateMapForPersistencyKey.defaultVariants[0].setState(Change.states.DELETED);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}))
			.then(function () {
				assert.strictEqual(oWriteStub.callCount, 3, "AFTER SOME CHANGES; still the write method was called 3 times,");
				assert.strictEqual(oUpdateStub.callCount, 1, "one update was called");
				assert.strictEqual(oRemoveStub.callCount, 2, "and two deletes were called");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.variants.length, 0, "the variant is cleared");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants.length, 0, "the default variant was cleared");
				assert.strictEqual(oCompVariantStateMapForPersistencyKey.standardVariantChange, undefined, "the standard variant was cleared");
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
				persistencyKey: sPersistencyKey
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
			.then(function () {
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
				persistencyKey: sPersistencyKey
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
			.then(function () {
				assert.equal(oWriteStub.callCount, 0, "no write was called");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
			});
		});

		QUnit.test("persistAll", function(assert) {
			var oPersistStub = sandbox.stub(CompVariantState, "persist");
			sandbox.stub(FlexState, "getCompVariantsMap").returns({
				persistencyKey1: {},
				persistencyKey2: {},
				persistencyKey3: {}
			});
			return CompVariantState.persistAll(sComponentId).then(function() {
				assert.strictEqual(oPersistStub.callCount, 3, "persist was called three times");
				assert.strictEqual(oPersistStub.getCall(0).args[0].reference, sComponentId);
				assert.strictEqual(oPersistStub.getCall(0).args[0].persistencyKey, "persistencyKey1");
				assert.strictEqual(oPersistStub.getCall(1).args[0].reference, sComponentId);
				assert.strictEqual(oPersistStub.getCall(1).args[0].persistencyKey, "persistencyKey2");
				assert.strictEqual(oPersistStub.getCall(2).args[0].reference, sComponentId);
				assert.strictEqual(oPersistStub.getCall(2).args[0].persistencyKey, "persistencyKey3");
			});
		});
	});

	QUnit.module("setDefault", {
		before: function() {
			this.sPersistencyKey = "persistency.key";
			this.sVariantId1 = "variantId1";
			this.sVariantId2 = "variantId2";
		},
		beforeEach: function () {
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			});
		},
		afterEach: function() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given setDefault is called twice", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVersioningEnabled: function() {
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
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[0], oChange, "the change is set under the persistencyKey");
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId1, "the change content is correct");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "one entity for persistencyKeys is present");
			assert.strictEqual(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oChange.getContent().defaultVariantName, this.sVariantId2, "the change content was updated");
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[0], oChange2, "the change is set under the persistencyKey");
			assert.strictEqual(oChange, oChange2, "it is still the same change object");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "still one entity for persistencyKeys is present");
			assert.strictEqual(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is still set to CUSTOMER");
		});

		QUnit.test("Given setDefault is called once for USER layer and once for CUSTOMER layer", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "one entity for persistencyKeys is present");
			assert.strictEqual(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 2, "still one entity for persistencyKeys is present");
			assert.strictEqual(oChange2.getDefinition().layer, Layer.USER, "The default layer is still set to USER");
		});

		QUnit.test("Given setDefault is called once for USER layer and twice for CUSTOMER layer and then reverted three times", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sComponentId);
			sandbox.stub(CompVariantUtils, "getPersistencyKey").returns(this.sPersistencyKey);

			var aDefaultVariants = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).defaultVariants;
			CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});

			CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});

			CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});

			CompVariantState.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultVariants.length, 2, "still 2 changes are present");
			assert.strictEqual(SmartVariantManagementApplyAPI.getDefaultVariantId({}), this.sVariantId2, "the default variant ID can be determined correct");

			CompVariantState.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultVariants.length, 1, "1 change is remaining");
			assert.strictEqual(SmartVariantManagementApplyAPI.getDefaultVariantId({}), this.sVariantId1, "the default variant ID can be determined correct");

			CompVariantState.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(aDefaultVariants.length, 0, "the last change was removed");
			assert.strictEqual(SmartVariantManagementApplyAPI.getDefaultVariantId({}), "", "the default variant ID can be determined correct");
		});

		QUnit.test("Given setDefault is called with a already transported Change", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			oChange.getDefinition().packageName = "TRANSPORTED";
			assert.strictEqual(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 2, "still one entity for persistencyKeys is present");
			assert.strictEqual(oChange2.getDefinition().layer, Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});

		QUnit.test("Given I have a USER Layer setDefault and create a CUSTOMER setDefault", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "one entity for persistencyKeys is present");
			assert.strictEqual(oChange.getDefinition().layer, Layer.USER, "The default layer is set to USER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.strictEqual(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 2, "still one entity for persistencyKeys is present");
			assert.strictEqual(oChange2.getDefinition().layer, Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});
	});

	QUnit.module("updateVariant", {
		beforeEach: function() {
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
				persistencyKey: this.sPersistencyKey
			};

			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			}).then(function () {
				this.oVariant = CompVariantState.addVariant(this.oVariantData);
			}.bind(this));
		},
		afterEach: function() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given updateVariant is called on an updatable variant", function(assert) {
			//Set favorite to false
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.VENDOR
			});

			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite was set to false for the variant");
			assert.strictEqual(this.oVariant.getChanges().length, 0, "no change was written");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant (different layer)", function(assert) {
			var oApplyChangesOnVariantSpy = sandbox.spy(CompVariantMerger, "applyChangeOnVariant");
			//Set favorite to false
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER
			});
			assert.strictEqual(this.oVariant.getChanges().length, 1, "then one variant change was created");
			assert.ok(oApplyChangesOnVariantSpy.called, "then the change is applied on the variant");
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite was changed in the variant by the applied change");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant (different layer) and an updatable change", function(assert) {
			var oUpdatedContent = {test: "wee"};
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER
			});
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite is first set to false by the applied change");
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
			assert.strictEqual(this.oVariant.getChanges()[0].getContent().variantContent, oUpdatedContent, "the variant content is set correctly");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant and a non-updatable change", function(assert) {
			// the non-updatable change
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getVariantId(),
				favorite: false,
				layer: Layer.CUSTOMER
			});
			assert.strictEqual(this.oVariant.getFavorite(), false, "the favorite is first set to false by the non-updatable change");
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
	});

	QUnit.module("revert", {
		beforeEach: function () {
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
				persistencyKey: this.sPersistencyKey
			};
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			}).then(Settings.getInstance);
		},
		afterEach: function() {
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
			assert.strictEqual(oVariant.getChanges()[0].getDefinition().content.executeOnSelection, true, "the original change sets executeOnSelection to true");
			assert.strictEqual(oVariant.getChanges()[0].getDefinition().content.favorite, undefined, "the original change does not change favorite");
			assert.strictEqual(oVariant.getFavorite(), true, "favorite is originally true");

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				favorite: false,
				layer: Layer.USER
			});
			assert.strictEqual(oVariant.getChanges().length, 1, "before the revert one updated change is present");
			assert.strictEqual(oVariant.getChanges()[0].getDefinition().content.executeOnSelection, true, "the updated change sets executeOnSelection to true");
			assert.strictEqual(oVariant.getChanges()[0].getDefinition().content.favorite, false, "the updated change sets favorite to false");
			assert.strictEqual(oVariant.getFavorite(), false, "favorite is set to false");

			CompVariantState.revert({
				id: oVariant.getVariantId(),
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.strictEqual(oVariant.getChanges()[0].getDefinition().content.executeOnSelection, true, "the remaining change sets executeOnSelection to true");
			assert.strictEqual(oVariant.getChanges()[0].getDefinition().content.favorite, undefined, "the remaining change does not change favorite");
			assert.strictEqual(oVariant.getChanges().length, 1, "one change was written - the change update was reverted");
			assert.strictEqual(oVariant.getFavorite(), true, "favorite goes back to true on the variant after the revert");
			assert.strictEqual(oVariant.getExecuteOnSelection(), true, "executeOnSelection remains true on the variant after the revert");
		});

		QUnit.test("Given a variant was updated and reverted multiple times (update, update, revert, update, revert, revert)", function (assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function () {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");

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
				assert.strictEqual(oVariant.getState(), States.DIRTY, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.DIRTY, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.DIRTY, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.strictEqual(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.strictEqual(oVariant.getFavorite(), false, "the favorite flag was set correctly (stays the same as before the change)");
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
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correctly");
			}.bind(this));
		});

		QUnit.test("Given a variant in another layer was updated and reverted multiple times (update, update, revert, update, revert, revert)", function (assert) {
			var oWriteStub = sandbox.stub(Storage, "write").resolves();

			this.oVariantData.changeSpecificData.layer = Layer.CUSTOMER_BASE;
			this.oVariantData.changeSpecificData.favorite = false; // override default of the CUSTOMER_BASE
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			var sVariantId = oVariant.getVariantId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}).then(function () {
				assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");

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
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
				assert.strictEqual(oVariant.getRevertData().length, 1, "one revert data entry is present");
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
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
				assert.strictEqual(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.strictEqual(oVariant.getChanges().length, 0, "the changes list contains no entries");
				assert.strictEqual(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correct");
			}.bind(this)).then(function () {
				CompVariantState.persist({
					reference: sComponentId,
					persistencyKey: this.sPersistencyKey
				});
			}.bind(this)).then(function () {
				assert.strictEqual(oWriteStub.callCount, 1, "only the initial variant was written");
			});
		});

		QUnit.test("Given a variant was was added and a persist was called", function(assert) {
			var oVariant = CompVariantState.addVariant(this.oVariantData);
			sandbox.stub(Storage, "write").resolves();

			return Settings.getInstance()
				.then(function () {
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
				}.bind(this)).then(function () {
					assert.strictEqual(oVariant.getRevertData().length, 0, "no revert data is present");
				});
		});

		QUnit.test("Given a variant was removed", function(assert) {
			var oVariant = CompVariantState.addVariant(this.oVariantData);

			// simulate an already persisted state
			oVariant.setState(States.PERSISTED);

			CompVariantState.removeVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				layer: Layer.CUSTOMER
			});

			assert.strictEqual(oVariant.getState(), States.DELETED, "the variant is flagged for deletion");
			var aRevertData = oVariant.getRevertData();
			assert.strictEqual(aRevertData.length, 1, "revertData was stored");
			var oLastRevertData = aRevertData[0];
			assert.strictEqual(oLastRevertData.getType(), CompVariantState.operationType.StateUpdate, "it is stored that the state was updated ...");
			assert.deepEqual(oLastRevertData.getContent(), {previousState: States.PERSISTED}, "... from PERSISTED");

			CompVariantState.revert({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: oVariant.getVariantId(),
				layer: Layer.CUSTOMER
			});

			aRevertData = oVariant.getRevertData();
			assert.strictEqual(aRevertData.length, 0, "after a revert... the revert data is no longer available");
			assert.strictEqual(oVariant.getState(), States.PERSISTED, "and the variant is flagged as PERSISTED");
		});
	});

	QUnit.module("overrideStandardVariant", {
		before: function() {
			this.sPersistencyKey = "persistency.key";
			FlexState.clearState(sComponentId);
		},
		beforeEach: function () {
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			}).then(Settings.getInstance);
		},
		afterEach: function() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a standard variant, when the standard variant is overridden", function (assert) {
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

		QUnit.test("Given a standard variant with an applied change, when the standard variant is overridden", function (assert) {
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

		QUnit.test("Given a standard variant set by the loadVariants call, when the standard variant is overridden", function (assert) {
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

		QUnit.test("Given a standard variant set by the loadVariants call and an applied change, when the standard variant is overridden", function (assert) {
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

		QUnit.test("Given a standard variant set by a back end variant flagged as standard, when the standard variant is overridden", function (assert) {
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

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied change, when the standard variant is overridden", function (assert) {
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

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied legacy change", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = FlexObjectFactory.createCompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getVariantId()] = oMockedStandardVariant;

			CompVariantMerger.applyChangeOnVariant(oMockedStandardVariant, new Change({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				changeType: "standardVariant",
				id: "fileId_123",
				content: {
					executeOnSelect: true
				}
			}));

			assert.strictEqual(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.strictEqual(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied legacy change, when overrideStandardVariant is called and overrules the legacy change", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = FlexObjectFactory.createCompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getVariantId()] = oMockedStandardVariant;

			CompVariantMerger.applyChangeOnVariant(oMockedStandardVariant, new Change({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				changeType: "standardVariant",
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
		beforeEach: function() {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVersioningEnabled: function() {
					return true;
				},
				isPublicLayerAvailable: function() {
					return true;
				}
			});
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
				persistencyKey: this.sPersistencyKey
			};

			FlexState.clearState(sComponentId);

			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			}).then(function () {
				this.oVariant = CompVariantState.addVariant(oVariantData);
			}.bind(this));
		},
		afterEach: function() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given updateVariant is called without being a draft version", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			sandbox.stub(this.oVariant, "getState").returns(Change.states.DIRTY);
			var oInitialFileContent = {
				changeType: "updateVariant",
				content: {},
				id: this.oVariant.getId(),
				executeOnSelection: true,
				reference: sComponentId,
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: this.sPersistencyKey
				}
			};
			var oChangeCreateInitialFileContent = sandbox.stub(Change, "createInitialFileContent").returns(oInitialFileContent);
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			assert.equal(oChangeCreateInitialFileContent.callCount, 1, "create one new change");
			assert.equal(this.oVariant.getChanges().length, 1, "one change was written");
			assert.equal(this.oVariant.getChanges()[0].getContent().executeOnSelection, true, "the change executeOnSelection is set correct");
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

			assert.equal(this.oVariant.convertToFileContent().executeOnSelection, true, "the executeOnSelection was set within the variant");
		});

		QUnit.test("Given updateVariant is called twice without being a draft version", function(assert) {
			var oUpdatedContent = {};
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			sandbox.stub(this.oVariant, "getState").returns(Change.states.DIRTY);
			var oApplyChangesOnVariantSpy = sandbox.spy(CompVariantMerger, "applyChangeOnVariant");
			var oInitialFileContent = {
				changeType: "updateVariant",
				content: {},
				id: this.oVariant.getId(),
				executeOnSelection: true,
				reference: sComponentId,
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: this.sPersistencyKey
				}
			};
			var oChangeCreateInitialFileContent = sandbox.stub(Change, "createInitialFileContent").returns(oInitialFileContent);
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
			assert.equal(oChangeCreateInitialFileContent.callCount, 1, "create one new change");
			assert.equal(oApplyChangesOnVariantSpy.callCount, 2, "and apply two changes");
			assert.equal(this.oVariant.getChanges().length, 1, "and one change was written");
			assert.equal(this.oVariant.getChanges()[0].getContent().variantContent, oUpdatedContent, "and the variant content is set correct");
			assert.equal(this.oVariant.getChanges()[0].getContent().executeOnSelection, true, "and the change executeOnSelection is set correct");
		});

		QUnit.test("Given persist is called with parentVersion", function(assert) {
			var sParentVersion = "GUIDParentVersion";
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				persistedVersion: sParentVersion,
				draftFilenames: [this.oVariant.getId()]
			}));
			CompVariantState.addVariant({
				changeSpecificData: {
					type: "pageVariant",
					content: {}
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
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
			var oVersionsOnAllChangesSaved = sandbox.stub(Versions, "onAllChangesSaved");

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			})
			.then(function () {
				assert.equal(oWriteStub.callCount, 3, "then the write method was called three times,");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
				assert.equal(oWriteStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct");
				assert.equal(oWriteStub.getCalls()[1].args[0].parentVersion, Version.Number.Draft, "and the second request the parentVersion parmeter is draft a version");
				assert.equal(oVersionsOnAllChangesSaved.callCount, 3, "and versions.onAllChangesSaved is called three time");
			})
			.then(function () {
				oCompVariantStateMapForPersistencyKey.variants[0].setState(Change.states.DIRTY);
				oCompVariantStateMapForPersistencyKey.defaultVariants[0].setState(Change.states.DELETED);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}))
			.then(function () {
				assert.equal(oWriteStub.callCount, 3, "AFTER SOME CHANGES; still the write method was called three times,");
				assert.equal(oUpdateStub.callCount, 1, "one update was called");
				assert.equal(oRemoveStub.callCount, 1, "and one deletes were called");
				assert.equal(oUpdateStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct in update");
				assert.equal(oRemoveStub.getCalls()[0].args[0].parentVersion, Version.Number.Draft, "and parentVersion is set correct in delete");
				assert.equal(oVersionsOnAllChangesSaved.callCount, 4, "and versions.onAllChangesSaved is called a fourth time");
			});
		});
	});

	QUnit.done(function() {
		oComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});