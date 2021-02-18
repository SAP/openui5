/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	CompVariantState,
	FlexState,
	Storage,
	Settings,
	Change,
	Utils,
	Layer,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	var sComponentId = "the.app.component";
	new UIComponent(sComponentId);

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
			assert.equal(CompVariantState.add(), undefined, "then undefined is returned");
		});

		[{
			testName: "Given a change is added",
			propertyBag: {
				changeSpecificData: {
					type: "addFavorite",
					isUserDependent: true,
					content: {}
				},
				reference: sComponentId
			},
			targetCategory: "changes",
			publicLayerAvailable: true,
			expectedLayer: Layer.USER
		}, {
			testName: "Given a non-user dependent variant is added and a public layer is available",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
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
					isVariant: true,
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
					isVariant: true,
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
					isVariant: true,
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
					isVariant: true,
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
					isVariant: true,
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
					isVariant: true,
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

				var oAddedObject = CompVariantState.add(mPropertyBag);
				var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
				var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory].length, 1, "then one entity was stored");
				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0], oAddedObject, "which is the returned entity");
				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0].getLayer(), oTestData.expectedLayer, "which is in the correct layer");
			});
		});

		QUnit.test("also stores the default executeOnSelection and favorite and contexts", function (assert) {
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
				content: {
					executeOnSelection: false,
					favorite: false
				},
				contexts: {},
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

			var oAddedObject = CompVariantState.add(mPropertyBag);
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
				content: {
					executeOnSelection: true,
					favorite: true
				},
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

			var oAddedObject = CompVariantState.add(mPropertyBag);
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

			assert.equal(mCompVariantsMapForPersistencyKey.variants.length, 1, "then one entity was stored");

			assert.ok(oAddedObject._oDefinition.support.sapui5Version, "the version was filled in the support");
			delete oAddedObject._oDefinition.support.sapui5Version; // avoid broken tests with version changes
			assert.deepEqual(oAddedObject._oDefinition, oExpectedVariant, "and the added object is created correct");
			assert.equal(mCompVariantsMapForPersistencyKey.variants[0], oAddedObject, "which is the returned entity");
		});
	});

	QUnit.module("updateState", {
		before: function () {
			FlexState.clearState(sComponentId);
		},
		beforeEach: function() {
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
		QUnit.test("Given updateState is called with a new variant", function(assert) {
			var oChange = new Change({
				reference: sComponentId,
				fileName: "id_123_pageVariant",
				fileType: "variant"
			});
			var oFlexObjectsFromStorageResponse = {
				changes: []
			};
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(oFlexObjectsFromStorageResponse);

			CompVariantState.updateState({
				reference: sComponentId,
				changeToBeAddedOrDeleted: oChange
			});
			assert.equal(oFlexObjectsFromStorageResponse.changes.length, 1, "then one change is in the changes response");
			assert.equal(oFlexObjectsFromStorageResponse.changes[0], oChange.getDefinition(), "which is the 'NEW' variant");
		});

		QUnit.test("Given updateState is called with a deleted variant", function(assert) {
			var oChange1 = new Change({
				reference: sComponentId,
				fileName: "id_123_pageVariant1",
				fileType: "variant"
			});
			var oChange2 = new Change({
				reference: sComponentId,
				fileName: "id_123_pageVariant2",
				fileType: "variant"
			});
			oChange2.setState(Change.states.DELETED);
			var oChange3 = new Change({
				reference: sComponentId,
				fileName: "id_123_pageVariant3",
				fileType: "variant"
			});

			// mock of back end response
			var oFlexObjectsFromStorageResponse = {
				changes: [oChange1.getDefinition(), oChange2.getDefinition(), oChange3.getDefinition()]
			};
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(oFlexObjectsFromStorageResponse);

			CompVariantState.updateState({
				reference: sComponentId,
				changeToBeAddedOrDeleted: oChange2
			});
			assert.equal(oFlexObjectsFromStorageResponse.changes.length, 2, "then two changes are in the changes response");
			assert.equal(oFlexObjectsFromStorageResponse.changes[0], oChange1.getDefinition(), "which is the first variant");
			assert.equal(oFlexObjectsFromStorageResponse.changes[1], oChange3.getDefinition(), "which is the third variant");
		});


		QUnit.test("Given updateState is called with a new change", function(assert) {
			var oChange = new Change({
				reference: sComponentId,
				fileName: "id_123_addFavorite",
				fileType: "change"
			});
			var oFlexObjectsFromStorageResponse = {
				changes: []
			};
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(oFlexObjectsFromStorageResponse);

			CompVariantState.updateState({
				reference: sComponentId,
				changeToBeAddedOrDeleted: oChange
			});
			assert.equal(oFlexObjectsFromStorageResponse.changes.length, 1, "then one change is in the changes response");
			assert.equal(oFlexObjectsFromStorageResponse.changes[0], oChange.getDefinition(), "which is the 'NEW' change");
		});

		QUnit.test("Given updateState is called with a deleted change", function(assert) {
			var oChange1 = new Change({
				reference: sComponentId,
				fileName: "id_123_addFavorite1",
				fileType: "variant"
			});
			var oChange2 = new Change({
				reference: sComponentId,
				fileName: "id_123_addFavorite2",
				fileType: "variant"
			});
			oChange2.setState(Change.states.DELETED);
			var oChange3 = new Change({
				reference: sComponentId,
				fileName: "id_123_addFavorite3",
				fileType: "variant"
			});

			// mock of back end response
			var oFlexObjectsFromStorageResponse = {
				changes: [oChange1.getDefinition(), oChange2.getDefinition(), oChange3.getDefinition()]
			};
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(oFlexObjectsFromStorageResponse);

			CompVariantState.updateState({
				reference: sComponentId,
				changeToBeAddedOrDeleted: oChange2
			});
			assert.equal(oFlexObjectsFromStorageResponse.changes.length, 2, "then two changes are in the changes response");
			assert.equal(oFlexObjectsFromStorageResponse.changes[0], oChange1.getDefinition(), "which is the first variant");
			assert.equal(oFlexObjectsFromStorageResponse.changes[1], oChange3.getDefinition(), "which is the third variant");
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
		QUnit.test("Given persist is called with all kind of objects (variants, changes, defaultVariant and standardVariant) are present", function(assert) {
			var sPersistencyKey = "persistency.key";

			CompVariantState.add({
				changeSpecificData: {
					type: "addFavorite",
					content: {}
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.setDefault({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				defaultVariantId: "id_123_pageVariant",
				conntent: {}
			});
			CompVariantState.setExecuteOnSelection({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				executeOnSelection: true
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
				assert.equal(oWriteStub.callCount, 4, "then the write method was called 4 times,");
				assert.equal(oUpdateStub.callCount, 0, "no update was called");
				assert.equal(oRemoveStub.callCount, 0, "and no delete was called");
				assert.equal(oCompVariantStateMapForPersistencyKey.variants[0].getState(), Change.states.PERSISTED, "the variant is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant.getState(), Change.states.PERSISTED, "the set default variant is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant.getNamespace(), "apps/the.app.component/changes/", "the set default variant change has namespace in the content");
				assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant.getState(), Change.states.PERSISTED, "the standard variant is persisted");
			})
			.then(function () {
				oCompVariantStateMapForPersistencyKey.changes[0].setState(Change.states.DIRTY);
				oCompVariantStateMapForPersistencyKey.variants[0].setState(Change.states.DELETED);
				oCompVariantStateMapForPersistencyKey.defaultVariant.setState(Change.states.DELETED);
				oCompVariantStateMapForPersistencyKey.standardVariant.setState(Change.states.DELETED);
			})
			.then(CompVariantState.persist.bind(undefined, {
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}))
			.then(function () {
				assert.equal(oWriteStub.callCount, 4, "AFTER SOME CHANGES; still the write method was called 4 times,");
				assert.equal(oUpdateStub.callCount, 1, "one update was called");
				assert.equal(oRemoveStub.callCount, 3, "and three deletes were called");
				assert.equal(oCompVariantStateMapForPersistencyKey.variants.length, 0, "the variant is cleared");
				assert.equal(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, undefined, "the default variant was cleared");
				assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, undefined, "the standard variant was cleared");
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
			var sPersistencyKey = "persistency.key";
			var sVariantId1 = "variantId1";
			var sVariantId2 = "variantId2";

			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(sPersistencyKey);
			var oCompVariantStateById = FlexState.getCompEntitiesByIdMap(sComponentId);

			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, undefined,
				"no defaultVariant change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 0, "no entities are present");

			var oChange = CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: sVariantId1,
				persistencyKey: sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(oChange.getContent().defaultVariantName, sVariantId1);
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(oChange.getContent().defaultVariantName, sVariantId1, "the change content is correct");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "one entity is present");
			assert.equal(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is set to CUSTOMER");

			CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: sVariantId2,
				persistencyKey: sPersistencyKey,
				layer: Layer.CUSTOMER
			});
			assert.equal(oChange.getContent().defaultVariantName, sVariantId2, "the change content was updated");
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "still only one entity is present");
			assert.equal(oChange.getDefinition().layer, Layer.CUSTOMER, "The default layer is still set to CUSTOMER");
		});
	});

	QUnit.module("setExecuteOnSelection", {
		before: function() {
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
		QUnit.test("Given setExecuteOnSelection is called twice", function(assert) {
			var sPersistencyKey = "persistency.key";

			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(sPersistencyKey);
			var oCompVariantStateById = FlexState.getCompEntitiesByIdMap(sComponentId);

			assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, undefined,
				"no standardVariant change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 0, "no entities are present");

			var oChange = CompVariantState.setExecuteOnSelection({
				reference: sComponentId,
				executeOnSelection: true,
				persistencyKey: sPersistencyKey
			});
			assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(oChange.getContent().executeOnSelect, true, "the change content is correct");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "one entity is present");

			CompVariantState.setExecuteOnSelection({
				reference: sComponentId,
				executeOnSelection: false,
				persistencyKey: sPersistencyKey
			});
			assert.equal(oChange.getContent().executeOnSelect, false, "the change content was updated");
			assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "still only one entity is present");
		});
	});

	QUnit.module("revert", {
		before: function() {
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
		var sPersistencyKey = "persistency.key";
		var oVariantData = {
			changeSpecificData: {
				type: "pageVariant",
				layer: Layer.CUSTOMER,
				isVariant: true,
				texts: {
					variantName: "initialName"
				},
				content: {}
			},
			reference: sComponentId,
			persistencyKey: sPersistencyKey
		};

		QUnit.test("Given a variant was updated and reverted multiple times (update, update, revert, update, revert, revert)", function (assert) {
			sandbox.stub(Storage, "write").resolves();
			var oVariant = CompVariantState.add(oVariantData);
			var sVariantId = oVariant.getId();

			// ensure a persisted state and empty revertData aggregation
			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}).then(function () {
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data is present");
				assert.equal(oVariant.getState(), Change.states.PERSISTED, "the variant has the correct state");

				// (<<UPDATE>>, update, revert, update, revert, revert)
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
					favorite: true,
					executeOnSelection: true
				});
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), Change.states.DIRTY, "the variant has the correct state");
				assert.deepEqual(oVariant.getContent(), {
					executeOnSelection: true,
					favorite: true
				}, "1: after an update... is the content is correct");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				// (update, <<UPDATE>>, revert, update, revert, revert)
				CompVariantState.updateVariant({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey,
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
				assert.equal(oVariant.getState(), Change.states.DIRTY, "the variant has the correct state");
				assert.deepEqual(oVariant.getContent(), {
					executeOnSelection: true,
					favorite: false,
					someKey: "someValue"
				}, "2: after an update... is the content is correct");
				assert.equal(oVariant.getText("variantName"), "myNewName", "and the name is updated");
				assert.equal(oVariant.getContexts().role[0], "someRole", "the variant has the correct contexts");

				// (update, update, <<REVERT>>, update, revert, revert)
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), Change.states.DIRTY, "the variant has the correct state");
				assert.deepEqual(oVariant.getContent(), {
					executeOnSelection: true,
					favorite: true
				}, "3: after a revert... is the content is correct");
				assert.equal(oVariant.getText("variantName"), "initialName", "and the name is also reverted");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");

				// (update, update, revert, <<UPDATE>>, revert, revert)
				CompVariantState.updateVariant({
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
				assert.deepEqual(oVariant.getContent(), {
					executeOnSelection: true,
					favorite: false,
					someKey: "someValue"
				}, "4: after an update... is the content is correct");
				assert.equal(oVariant.getRevertInfo().length, 2, "two revert data entries are present");
				assert.equal(oVariant.getState(), Change.states.DIRTY, "the variant has the correct state");
				assert.equal(oVariant.getContexts().role[0], "someOtherRole", "the variant has the correct contexts");

				// (update, update, revert, update, <<REVERT>>, revert)
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assert.equal(oVariant.getRevertInfo().length, 1, "one revert data entry is present");
				assert.equal(oVariant.getState(), Change.states.DIRTY, "the variant has the correct state");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
				assert.deepEqual(oVariant.getContent(), {
					executeOnSelection: true,
					favorite: true
				}, "5: after a revert... is the content is correct");

				// (update, update, revert, update, revert, <<REVERT>>)
				CompVariantState.revert({
					id: sVariantId,
					reference: sComponentId,
					persistencyKey: sPersistencyKey
				});
				assert.deepEqual(oVariant.getContent(), {
					executeOnSelection: false,
					favorite: false
				}, "6: after a revert... is the content is correct");
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data entries are present");
				assert.equal(oVariant.getState(), Change.states.PERSISTED, "the variant has the correct state");
				assert.equal(Object.keys(oVariant.getContexts()).length, 0, "the variant has the correct contexts");
			});
		});

		QUnit.test("Given a variant was was added and a persist was called", function(assert) {
			var oVariant = CompVariantState.add(oVariantData);
			sandbox.stub(Storage, "write").resolves();

			// adding a change to test, that the remove-function not existent in changes is not called = the test does not die
			CompVariantState.setExecuteOnSelection({
				reference: sComponentId,
				executeOnSelection: true,
				persistencyKey: sPersistencyKey
			});

			return CompVariantState.persist({
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			}).then(function () {
				assert.equal(oVariant.getRevertInfo().length, 0, "no revert data is present");
			});
		});

		QUnit.test("Given a variant was removed", function(assert) {
			var oVariant = CompVariantState.add(oVariantData);

			// simulate an already persisted state
			oVariant.setState(Change.states.PERSISTED);

			CompVariantState.removeVariant({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			assert.equal(oVariant.getState(), Change.states.DELETED, "the variant is flagged for deletion");
			var aRevertData = oVariant.getRevertInfo();
			assert.equal(aRevertData.length, 1, "revertData was stored");
			var oLastRevertData = aRevertData[0];
			assert.equal(oLastRevertData.getType(), CompVariantState.operationType.StateUpdate, "it is stored that the state was updated ...");
			assert.deepEqual(oLastRevertData.getContent(), {previousState: Change.states.PERSISTED}, "... to PERSISTED");

			CompVariantState.revert({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: Layer.CUSTOMER
			});

			aRevertData = oVariant.getRevertInfo();
			assert.equal(aRevertData.length, 0, "after a revert... the revert data is no longer available");
			assert.equal(oVariant.getState(), Change.states.PERSISTED, "and the change is flagged as new");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});