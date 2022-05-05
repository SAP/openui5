/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/States",
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
			assert.equal(CompVariantState.addVariant(), undefined, "then undefined is returned");
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
					id: "myFancyVariantId",
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

				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory].length, 1, "then one entity was stored");
				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0], oAddedObject, "which is the returned entity");
				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0].getLayer(), oTestData.expectedLayer, "which is in the correct layer");

				if (oTestData.propertyBag.changeSpecificData.id) {
					assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0].getId(), oTestData.propertyBag.changeSpecificData.id, "the object has the passed ID");
				}
			});
		});

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
				texts: {},
				layer: Layer.CUSTOMER
			};

			var oExpectedVariant = {
				fileName: "someFileName",
				changeType: "filterVariant",
				content: {},
				fileType: "variant",
				layer: Layer.CUSTOMER,
				namespace: "apps/the.app.component/changes/",
				packageName: "",
				reference: sComponentId,
				selector: {persistencyKey: sPersistencyKey},
				texts: {},
				support: {
					command: "",
					compositeCommand: "",
					generator: "Change.createInitialFileContent",
					service: "",
					sourceChangeFileName: "",
					user: ""
				}
			};

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.equal(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.ok(oAddedObject._oDefinition.support.sapui5Version, "the version was filled in the support");
			delete oAddedObject._oDefinition.support.sapui5Version; // avoid broken tests with version changes
			assert.deepEqual(oAddedObject._oDefinition, oExpectedVariant, "and the added object is created correct");
			assert.equal(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
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
				fileName: "someFileName",
				changeType: "filterVariant",
				content: {},
				executeOnSelection: true,
				favorite: true,
				contexts: {
					role: ["someValue"]
				},
				fileType: "variant",
				layer: Layer.CUSTOMER,
				namespace: "apps/the.app.component/changes/",
				packageName: "",
				reference: sComponentId,
				selector: {persistencyKey: sPersistencyKey},
				texts: {},
				support: {
					command: "",
					compositeCommand: "",
					generator: "Change.createInitialFileContent",
					service: "",
					sourceChangeFileName: "",
					user: ""
				}
			};

			var oAddedObject = CompVariantState.addVariant(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.equal(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.ok(oAddedObject._oDefinition.support.sapui5Version, "the version was filled in the support");
			delete oAddedObject._oDefinition.support.sapui5Version; // avoid broken tests with version changes
			assert.deepEqual(oAddedObject._oDefinition, oExpectedVariant, "and the added object is created correct");
			assert.equal(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
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
				id: oVariant.getId(),
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
				assert.equal(oWriteStub.callCount, 3, "then the write method was called 3 times,");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
				assert.equal(oCompVariantStateMapForPersistencyKey.variants[0].getState(), States.PERSISTED, "the variant is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[0].getState(), Change.states.PERSISTED, "the set default variant is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[0].getNamespace(), "apps/the.app.component/changes/", "the set default variant change has namespace in the content");
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
				assert.equal(oWriteStub.callCount, 3, "AFTER SOME CHANGES; still the write method was called 3 times,");
				assert.equal(oUpdateStub.callCount, 1, "one update was called");
				assert.equal(oRemoveStub.callCount, 2, "and two deletes were called");
				assert.equal(oCompVariantStateMapForPersistencyKey.variants.length, 0, "the variant is cleared");
				assert.equal(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants.length, 0, "the default variant was cleared");
				assert.equal(oCompVariantStateMapForPersistencyKey.standardVariantChange, undefined, "the standard variant was cleared");
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
				assert.equal(oPersistStub.callCount, 3, "persist was called three times");
				assert.equal(oPersistStub.getCall(0).args[0].reference, sComponentId);
				assert.equal(oPersistStub.getCall(0).args[0].persistencyKey, "persistencyKey1");
				assert.equal(oPersistStub.getCall(1).args[0].reference, sComponentId);
				assert.equal(oPersistStub.getCall(1).args[0].persistencyKey, "persistencyKey2");
				assert.equal(oPersistStub.getCall(2).args[0].reference, sComponentId);
				assert.equal(oPersistStub.getCall(2).args[0].persistencyKey, "persistencyKey3");
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

			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, undefined,
				"no defaultVariant change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 0, "no entities are present");

			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(oChange.getContent().defaultVariantName, this.sVariantId1);
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants.length, 1, "the change was stored into the map");
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[0], oChange, "the change is set under the persistencyKey");
			assert.equal(oChange.getContent().defaultVariantName, this.sVariantId1, "the change content is correct");
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "one entity for persistencyKeys is present");
			assert.equal(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(oChange.getContent().defaultVariantName, this.sVariantId2, "the change content was updated");
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[0], oChange2, "the change is set under the persistencyKey");
			assert.equal(oChange, oChange2, "it is still the same change object");
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "still one entity for persistencyKeys is present");
			assert.equal(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is still set to CUSTOMER");
		});

		QUnit.test("Given setDefault is called once for USER layer and once for CUSTOMER layer", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "one entity for persistencyKeys is present");
			assert.equal(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 2, "still one entity for persistencyKeys is present");
			assert.equal(oChange2.getDefinition().layer, Layer.USER, "The default layer is still set to USER");
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

			assert.equal(aDefaultVariants.length, 2, "still 2 changes are present");
			assert.equal(SmartVariantManagementApplyAPI.getDefaultVariantId({}), this.sVariantId2, "the default variant ID can be determined correct");

			CompVariantState.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.equal(aDefaultVariants.length, 1, "1 change is remaining");
			assert.equal(SmartVariantManagementApplyAPI.getDefaultVariantId({}), this.sVariantId1, "the default variant ID can be determined correct");

			CompVariantState.revertSetDefaultVariantId({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			});

			assert.equal(aDefaultVariants.length, 0, "the last change was removed");
			assert.equal(SmartVariantManagementApplyAPI.getDefaultVariantId({}), "", "the default variant ID can be determined correct");
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
			assert.equal(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 2, "still one entity for persistencyKeys is present");
			assert.equal(oChange2.getDefinition().layer, Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});

		QUnit.test("Given I have a USER Layer setDefault and create a CUSTOMER setDefault", function(assert) {
			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey);
			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId1,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.USER
			});
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 1, "one entity for persistencyKeys is present");
			assert.equal(oChange.getDefinition().layer, Layer.USER, "The default layer is set to USER");

			var oChange2 = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: this.sVariantId2,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariants[1], oChange2,
				"the new CUSTOMER change is now the the defaultVariant");
			assert.equal(Object.keys(oCompVariantStateMapForPersistencyKey.byId).length, 2, "still one entity for persistencyKeys is present");
			assert.equal(oChange2.getDefinition().layer, Layer.CUSTOMER, "The default layer of the new Change is set to CUSTOMER");
		});
	});

	QUnit.module("updateVariant", {
		beforeEach: function() {
			this.sPersistencyKey = "persistency.key";
			var oVariantData = {
				changeSpecificData: {
					type: "pageVariant",
					layer: Layer.VENDOR,
					texts: {
						variantName: "initialName"
					},
					content: {},
					favorte: false
				},
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			};

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
		QUnit.test("Given updateVariant is called on a updatable variant", function(assert) {
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.VENDOR
			});

			assert.equal(this.oVariant.getDefinition().favorite, true, "the favorite was set within the variant");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant", function(assert) {
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.USER
			});
			assert.equal(this.oVariant.getDefinition().favorite, undefined, "the favorite was NOT set within the variant");
			assert.equal(this.oVariant.getChanges().length, 1, "one change was written");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant and a updatable change", function(assert) {
			var oUpdatedContent = {};
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.USER
			});
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				content: oUpdatedContent,
				layer: Layer.USER
			});
			assert.equal(this.oVariant.getDefinition().favorite, undefined, "the favorite was NOT set within the variant");
			assert.equal(this.oVariant.getChanges().length, 1, "one change was written");
			assert.equal(this.oVariant.getChanges()[0].getContent().variantContent, oUpdatedContent, "the variant content is set correct");
		});

		QUnit.test("Given updateVariant is called on a non-updatable variant and a non-updatable change", function(assert) {
			// the non-updatable change
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.CUSTOMER
			});
			// because of an update within another layer
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.USER
			});
			assert.equal(this.oVariant.getDefinition().favorite, undefined, "the favorite was NOT set within the variant");
			assert.equal(this.oVariant.getChanges().length, 2, "two changes were written");
		});
	});

	QUnit.module("revert", {
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
		var sPersistencyKey = "persistency.key";
		var oVariantData = {
			changeSpecificData: {
				type: "pageVariant",
				layer: Layer.CUSTOMER,
				texts: {
					variantName: "initialName"
				},
				content: {}
			},
			reference: sComponentId,
			persistencyKey: sPersistencyKey
		};

		QUnit.test("Given updateVariant is called on a non-updatable variant and a updatable change which is then reverted", function(assert) {
			var oVariant = CompVariantState.addVariant(oVariantData);
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				executeOnSelection: true,
				layer: Layer.USER
			});
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				favorite: true,
				layer: Layer.USER
			});

			CompVariantState.revert({
				id: oVariant.getId(),
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});

			assert.equal(oVariant.getDefinition().favorite, undefined, "the favorite was NOT set within the variant");
			assert.equal(oVariant.getChanges().length, 1, "one change was written");
			assert.equal(oVariant.getChanges()[0].getDefinition().content.favorite, undefined, "the favorite flag was reverted correct");
			assert.equal(oVariant.getChanges()[0].getDefinition().content.executeOnSelection, true, "the executeOnSelection flag is still set");
		});

		QUnit.test("Given a variant was updated and reverted multiple times (update, update, revert, update, revert, revert)", function (assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantState.addVariant(oVariantData);
			var sVariantId = oVariant.getId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}).then(function () {
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data is present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");

				assert.ok(true, "STEP: <<UPDATE>>, update, revert, update, revert, revert");
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
					layer: Layer.CUSTOMER,
					favorite: true,
					executeOnSelection: true
				});
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.equal(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.equal(oVariant._oDefinition.favorite, true, "the favorite flag was set correct in the definition");
				assert.equal(oVariant._oDefinition.executeOnSelection, true, "the executeOnSelect flag was set correct in the definition");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<UPDATE>>, revert, update, revert, revert");
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
					layer: Layer.CUSTOMER,
					favorite: false,
					content: {
						someKey: "someValue"
					},
					contexts: {
						role: ["someRole"]
					},
					name: "myNewName"
				});
				assert.equal(oVariant.getRevertInfo().length, 2, "two revert data entries are present");
				assert.equal(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.equal(oVariant.getFavorite(), false, "the favorite flag was set correct");
				assert.equal(oVariant._oDefinition.favorite, false, "the favorite flag was set correct in the definition");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.equal(oVariant.getText("variantName"), "myNewName", "and the name is updated");
				assert.equal(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, <<REVERT>>, update, revert, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.equal(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.equal(oVariant._oDefinition.favorite, true, "the favorite flag was set correct in the definition");
				assert.equal(oVariant._oDefinition.executeOnSelection, true, "the executeOnSelect flag was set correct in the definition");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
				assert.equal(oVariant.getText("variantName"), "initialName", "and the name is also reverted");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update,update, revert, <<UPDATE>>, revert, revert");
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
					favorite: false,
					layer: Layer.CUSTOMER,
					content: {
						someKey: "someValue"
					},
					contexts: {
						role: ["someOtherRole"]
					}
				});
				assert.equal(oVariant.getFavorite(), false, "the favorite flag was set correct");
				assert.equal(oVariant._oDefinition.favorite, false, "the favorite flag was set correct in the definition");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.equal(oVariant.getRevertInfo().length, 2, "two revert data entries are present");
				assert.equal(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.equal(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), States.DIRTY, "the variant has the correct state");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.equal(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.equal(oVariant._oDefinition.favorite, true, "the favorite flag was set correct in the definition");
				assert.equal(oVariant._oDefinition.executeOnSelection, true, "the executeOnSelect flag was set correct in the definition");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");

				assert.ok(true, "STEP: update, update, revert, update, revert, <<REVERT>>");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assert.equal(oVariant.getFavorite(), false, "the favorite flag was set correct");
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data entries are present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correct");
				assert.deepEqual(oVariant._oDefinition.content, {}, "the content was set correct in the definition");
			});
		});

		QUnit.test("Given a variant in another layer was updated and reverted multiple times (update, update, revert, update, revert, revert)", function (assert) {
			var oWriteStub = sandbox.stub(Storage, "write").resolves();
			function assertTheVariantDefinitionIsTheSame(assert, oVariant, oInitialVariantData) {
				var oDefinition = oVariant.getDefinition();
				assert.equal(oDefinition.reference, oInitialVariantData.reference, "DEFINITION: the reference is untouched");
				assert.equal(oDefinition.selector.persistencyKey, oInitialVariantData.persistencyKey, "DEFINITION: the persistencyKey is untouched");
				assert.equal(oDefinition.changeType, oInitialVariantData.changeSpecificData.type, "DEFINITION: the type is untouched");
				assert.equal(oDefinition.content, oInitialVariantData.changeSpecificData.content, "DEFINITION: the content is untouched");
				assert.equal(oDefinition.layer, oInitialVariantData.changeSpecificData.layer, "DEFINITION: the layer is untouched");
				assert.equal(oDefinition.texts.variantName.value, oInitialVariantData.changeSpecificData.texts.variantName, "DEFINITION: the name is untouched");
			}

			oVariantData.changeSpecificData.layer = Layer.CUSTOMER_BASE;
			oVariantData.changeSpecificData.favorite = false; // override default of the CUSTOMER_BASE
			var oVariant = CompVariantState.addVariant(oVariantData);
			var sVariantId = oVariant.getId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}).then(function () {
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data is present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");

				assert.ok(true, "STEP: <<UPDATE>>, update, revert, update, revert, revert");
				CompVariantState.updateVariant({
					isUserDependent: true,
					id: sVariantId,
					reference: sComponentId,
					layer: Layer.CUSTOMER,
					persistencyKey: sPersistencyKey,
					favorite: true,
					executeOnSelection: true
				});
				assertTheVariantDefinitionIsTheSame(assert, oVariant, oVariantData);
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.equal(oVariant.getChanges().length, 1, "the changes list contains one entry");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, <<UPDATE>>, revert, update, revert, revert");
				CompVariantState.updateVariant({
					isUserDependent: true,
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
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
				assertTheVariantDefinitionIsTheSame(assert, oVariant, oVariantData);
				assert.equal(oVariant.getRevertInfo().length, 2, "two revert data entries are present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(oVariant.getFavorite(), false, "the favorite flag was set correct");
				assert.equal(oVariant.getChanges().length, 2, "the changes list contains two entries");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.equal(oVariant.getName(), "myNewName", "and the name is updated");
				assert.equal(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, <<REVERT>>, update, revert, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assertTheVariantDefinitionIsTheSame(assert, oVariant, oVariantData);
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.equal(oVariant.getChanges().length, 1, "the changes list contains one entry");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");
				assert.equal(oVariant.getName(), "initialName", "and the name is also reverted");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, <<UPDATE>>, revert, revert");
				CompVariantState.updateVariant({
					isUserDependent: true,
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
					favorite: false,
					content: {
						someKey: "someValue"
					},
					contexts: {
						role: ["someOtherRole"]
					}
				});
				assertTheVariantDefinitionIsTheSame(assert, oVariant, oVariantData);
				assert.equal(oVariant.getFavorite(), false, "the favorite flag was set correct");
				assert.equal(oVariant.getChanges().length, 2, "the changes list contains two entries");
				assert.deepEqual(oVariant.getContent(), {
					someKey: "someValue"
				}, "the content is correct");
				assert.equal(oVariant.getRevertInfo().length, 2, "two revert data entries are present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				assert.ok(true, "STEP: update, update, revert, update, <<REVERT>>, revert");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assertTheVariantDefinitionIsTheSame(assert, oVariant, oVariantData);
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.equal(oVariant.getFavorite(), true, "the favorite flag was set correct");
				assert.equal(oVariant.getChanges().length, 1, "the changes list contains one entry");
				assert.deepEqual(oVariant.getContent(), {}, "the content is correct");

				assert.ok(true, "STEP: update, update, revert, update, revert, <<REVERT>>");
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assertTheVariantDefinitionIsTheSame(assert, oVariant, oVariantData);
				assert.equal(oVariant.getFavorite(), false, "the favorite flag was set correct");
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data entries are present");
				assert.equal(oVariant.getState(), States.PERSISTED, "the variant has the correct state");
				assert.equal(oVariant.getChanges().length, 0, "the changes list contains no entries");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {}, "the content was set correct");
			}).then(function () {
				CompVariantState.persist({
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
			}).then(function () {
				assert.equal(oWriteStub.callCount, 1, "only the initial variant was written");
			});
		});

		QUnit.test("Given a variant was was added and a persist was called", function(assert) {
			var oVariant = CompVariantState.addVariant(oVariantData);
			sandbox.stub(Storage, "write").resolves();

			return Settings.getInstance()
				.then(function () {
					// adding a change to test, that the remove-function not existent in changes is not called = the test does not die
					CompVariantState.updateVariant({
						reference: sComponentId,
						executeOnSelection: true,
						persistencyKey: sPersistencyKey,
						id: oVariant.getId(),
						favorite: true
					});

					return CompVariantState.persist({
						reference: sComponentId,
						persistencyKey: sPersistencyKey
					});
				}).then(function () {
					assert.equal(oVariant.getRevertInfo().length, 0, "no revert data is present");
				});
		});

		QUnit.test("Given a variant was removed", function(assert) {
			var oVariant = CompVariantState.addVariant(oVariantData);

			// simulate an already persisted state
			oVariant.setState(States.PERSISTED);

			CompVariantState.removeVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			assert.equal(oVariant.getState(), States.DELETED, "the variant is flagged for deletion");
			var aRevertData = oVariant.getRevertInfo();
			assert.equal(aRevertData.length, 1, "revertData was stored");
			var oLastRevertData = aRevertData[0];
			assert.equal(oLastRevertData.getType(), CompVariantState.operationType.StateUpdate, "it is stored that the state was updated ...");
			assert.deepEqual(oLastRevertData.getContent(), {previousState: States.PERSISTED}, "... to PERSISTED");

			CompVariantState.revert({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			aRevertData = oVariant.getRevertInfo();
			assert.equal(aRevertData.length, 0, "after a revert... the revert data is no longer available");
			assert.equal(oVariant.getState(), States.PERSISTED, "and the change is flagged as new");
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
			});
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

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).byId[CompVariant.STANDARD_VARIANT_ID];
			assert.equal(oStandardVariant.getExecuteOnSelection(), false, "then the default executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant with an applied change, when the standard variant is overridden", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			CompVariantMerger.merge(this.sPersistencyKey, mCompData._getOrCreate(this.sPersistencyKey), {});

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: CompVariant.STANDARD_VARIANT_ID,
				executeOnSelection: true
			});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).byId[CompVariant.STANDARD_VARIANT_ID];
			assert.equal(oStandardVariant.getExecuteOnSelection(), true, "then the change is reapplied");
			assert.equal(oStandardVariant.getChanges().length, 1, "the change is mentioned as applied");
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

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).byId[CompVariant.STANDARD_VARIANT_ID];
			assert.equal(oStandardVariant.getExecuteOnSelection(), false, "then the executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant set by the loadVariants call and an applied change, when the standard variant is overridden", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			CompVariantMerger.merge(this.sPersistencyKey, mCompData._getOrCreate(this.sPersistencyKey), {
				executeOnSelection: true
			});

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: CompVariant.STANDARD_VARIANT_ID,
				executeOnSelection: true
			});

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			var oStandardVariant = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(this.sPersistencyKey).byId[CompVariant.STANDARD_VARIANT_ID];
			assert.equal(oStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.equal(oStandardVariant.getChanges().length, 1, "the change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard, when the standard variant is overridden", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = new CompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getId()] = oMockedStandardVariant;

			CompVariantState.overrideStandardVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				layer: Layer.CUSTOMER,
				executeOnSelection: false
			});

			assert.equal(oMockedStandardVariant.getExecuteOnSelection(), false, "then the executeOnSelection is set to false");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied change, when the standard variant is overridden", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = new CompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getId()] = oMockedStandardVariant;

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

			assert.equal(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.equal(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied legacy change", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = new CompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getId()] = oMockedStandardVariant;

			CompVariantMerger.applyChangeOnVariant(oMockedStandardVariant, new Change({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				changeType: "standardVariant",
				id: "fileId_123",
				content: {
					executeOnSelect: true
				}
			}));

			assert.equal(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.equal(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
		});

		QUnit.test("Given a standard variant set by a back end variant flagged as standard and an applied legacy change, when overrideStandardVariant is called and overrules the legacy change", function (assert) {
			var mCompData = FlexState.getCompVariantsMap(sComponentId);
			var mMapForPersistencyKey = mCompData._getOrCreate(this.sPersistencyKey);
			CompVariantMerger.merge(this.sPersistencyKey, mMapForPersistencyKey, {});
			var oMockedStandardVariant = new CompVariant({
				fileName: "fileId_123"
			});
			mMapForPersistencyKey.standardVariant = oMockedStandardVariant;
			mMapForPersistencyKey.byId[oMockedStandardVariant.getId()] = oMockedStandardVariant;

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

			assert.equal(oMockedStandardVariant.getExecuteOnSelection(), true, "then the executeOnSelection is set to true");
			assert.equal(oMockedStandardVariant.getChanges().length, 1, "one change is mentioned as applied");
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
					executeOnSelection: false,
					favorte: false
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
		QUnit.test("Given updateVariant is called will created new change because it is not in a draft version", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			sandbox.stub(this.oVariant, "getState").returns(Change.states.DIRTY);
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				executeOnSelection: true,
				layer: Layer.CUSTOMER
			});
			assert.equal(this.oVariant.getDefinition().executeOnSelection, false, "the executeOnSelection was NOT set within the variant");
			assert.equal(this.oVariant.getChanges()[0].getContent().executeOnSelection, true, "the change executeOnSelection is set correct");
			assert.equal(this.oVariant.getDefinition().favorite, undefined, "the favorite was NOT set within the variant");
			assert.equal(this.oVariant.getChanges().length, 1, "one change was written");
			assert.equal(this.oVariant.getChanges()[0].getContent().favorite, true, "the change favorite is set correct");
		});

		QUnit.test("Given updateVariant is called will update variant", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: [this.oVariant.getFileName()]
			}));

			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.CUSTOMER
			});

			assert.equal(this.oVariant.getDefinition().favorite, true, "the favorite was set within the variant");
		});

		QUnit.test("Given updateVariant is called will update change", function(assert) {
			var oUpdatedContent = {};
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				draftFilenames: []
			}));
			sandbox.stub(this.oVariant, "getState").returns(Change.states.DIRTY);
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				layer: Layer.CUSTOMER
			});
			CompVariantState.updateVariant({
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey,
				id: this.oVariant.getId(),
				favorite: true,
				content: oUpdatedContent,
				layer: Layer.CUSTOMER
			});
			assert.equal(this.oVariant.getDefinition().favorite, undefined, "the favorite was NOT set within the variant");
			assert.equal(this.oVariant.getChanges().length, 1, "one change was written");
			assert.equal(this.oVariant.getChanges()[0].getContent().variantContent, oUpdatedContent, "the variant content is set correct");
		});

		QUnit.test("Given persist is called with parentVersion", function(assert) {
			var sParentVersion = "GUIDParentVersion";
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				persistedVersion: sParentVersion,
				draftFilenames: [this.oVariant.getFileName()]
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
				assert.equal(oWriteStub.callCount, 2, "then the write method was called two times,");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
				assert.equal(oWriteStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct");
				assert.equal(oWriteStub.getCalls()[1].args[0].parentVersion, Version.Number.Draft, "and the second request the parentVersion parameter is draft a version");
				assert.equal(oVersionsOnAllChangesSaved.callCount, 2, "and versions.onAllChangesSaved is called two times");
			})
			.then(function () {
				oCompVariantStateMapForPersistencyKey.variants[0].setState(Change.states.DIRTY);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: this.sPersistencyKey
			}))
			.then(function () {
				assert.equal(oWriteStub.callCount, 2, "AFTER SOME CHANGES; still the write method was called two times,");
				assert.equal(oUpdateStub.callCount, 1, "one update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no deletes were called");
				assert.equal(oUpdateStub.getCalls()[0].args[0].parentVersion, sParentVersion, "and parentVersion is set correct");
				assert.equal(oVersionsOnAllChangesSaved.callCount, 3, "and versions.onAllChangesSaved is called a third time");
			});
		});
	});

	QUnit.done(function() {
		oComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});