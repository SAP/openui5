/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	CompVariantState,
	FlexState,
	Storage,
	Change,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	var sComponentId = "the.app.component";

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});

	QUnit.module("add", {
		before: function () {
			this.appComponent = new UIComponent(sComponentId);
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			});
		},
		beforeEach: function() {},
		afterEach: function() {
			sandbox.restore();
		},
		after: function () {
			FlexState.clearState(sComponentId);
			this.appComponent.destroy();
		}
	}, function() {
		QUnit.test("Given no propertyBag is provided", function(assert) {
			assert.equal(CompVariantState.add(), undefined, "then undefined is returned");
		});

		[{
			testName: "Given a change is added",
			propertyBag: {
				changeSpecificData: {
					type: "addFavorite"
				},
				reference: sComponentId
			},
			targetCategory: "changes"
		}, {
			testName: "Given a variant is added",
			propertyBag: {
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true
				},
				reference: sComponentId
			},
			targetCategory: "variants"
		}].forEach(function (oTestData) {
			QUnit.test(oTestData.testName, function(assert) {
				var sPersistencyKey = "persistency.key";
				var mPropertyBag = Object.assign({
					persistencyKey: sPersistencyKey
				}, oTestData.propertyBag);

				var sAddedObjectId = CompVariantState.add(mPropertyBag);
				var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
				var mCompVariantsMapForPersistencyKey = mCompVariantsMap[mPropertyBag.persistencyKey];

				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory].length, 1, "then one entity was stored");
				assert.equal(mCompVariantsMapForPersistencyKey[oTestData.targetCategory][0].getId(), sAddedObjectId, "which is the returned entity");
			});
		});
	});

	QUnit.module("updateState", {
		before: function () {
			this.appComponent = new UIComponent(sComponentId);
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
		},
		after: function () {
			this.appComponent.destroy();
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
		before: function () {
			this.appComponent = new UIComponent(sComponentId);
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
		},
		after: function () {
			this.appComponent.destroy();
		}
	}, function() {
		QUnit.test("Given persist is called with all kind of objects (variants, changes, defaultVariant and standardVariant) are present", function(assert) {
			var sPersistencyKey = "persistency.key";

			CompVariantState.add({
				changeSpecificData: {
					type: "addFavorite"
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true
				},
				reference: sComponentId,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.setDefault({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				defaultVariantId: "id_123_pageVariant"
			});
			CompVariantState.setExecuteOnSelect({
				reference: sComponentId,
				persistencyKey: sPersistencyKey,
				executeOnSelect: true
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
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant.getState(), Change.states.PERSISTED, "the default variant is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant.getState(), Change.states.PERSISTED, "the standard variant is persisted");
			})
			.then(function () {
				oCompVariantStateMapForPersistencyKey.changes[0].setState(Change.states.DIRTY);
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
				assert.equal(oRemoveStub.callCount, 2, "and two deletes were called");
				assert.equal(oCompVariantStateMapForPersistencyKey.variants[0].getState(), Change.states.PERSISTED, "the variant is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.changes[0].getState(), Change.states.PERSISTED, "the addFavorite change is persisted");
				assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, undefined, "the default variant was cleared");
				assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, undefined, "the standard variant was cleared");
			});
		});
	});

	QUnit.module("setDefault", {
		before: function() {
			this.appComponent = new UIComponent(sComponentId);
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			});
		},
		afterEach: function() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		},
		after:function () {
			this.appComponent.destroy();
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
				persistencyKey: sPersistencyKey
			});
			assert.equal(oChange.getContent().defaultVariantName, sVariantId1);
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(oChange.getContent().defaultVariantName, sVariantId1, "the change content is correct");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "one entity is present");

			CompVariantState.setDefault({
				reference: sComponentId,
				defaultVariantId: sVariantId2,
				persistencyKey: sPersistencyKey
			});
			assert.equal(oChange.getContent().defaultVariantName, sVariantId2, "the change content was updated");
			assert.equal(oCompVariantStateMapForPersistencyKey.defaultVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "still only one entity is present");
		});
	});

	QUnit.module("setExecuteOnSelect", {
		before: function() {
			this.appComponent = new UIComponent(sComponentId);
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sComponentId
			});
		},
		afterEach: function() {
			FlexState.clearState(sComponentId);
			sandbox.restore();
		},
		after:function () {
			this.appComponent.destroy();
		}
	}, function() {
		QUnit.test("Given setExecuteOnSelect is called twice", function(assert) {
			var sPersistencyKey = "persistency.key";

			var oCompVariantStateMapForPersistencyKey = FlexState.getCompVariantsMap(sComponentId)._getOrCreate(sPersistencyKey);
			var oCompVariantStateById = FlexState.getCompEntitiesByIdMap(sComponentId);

			assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, undefined,
				"no standardVariant change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 0, "no entities are present");

			var oChange = CompVariantState.setExecuteOnSelect({
				reference: sComponentId,
				executeOnSelect: true,
				persistencyKey: sPersistencyKey
			});
			assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(oChange.getContent().executeOnSelect, true, "the change content is correct");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "one entity is present");

			CompVariantState.setExecuteOnSelect({
				reference: sComponentId,
				executeOnSelect: false,
				persistencyKey: sPersistencyKey
			});
			assert.equal(oChange.getContent().executeOnSelect, false, "the change content was updated");
			assert.equal(oCompVariantStateMapForPersistencyKey.standardVariant, oChange,
				"the change is set under the persistencyKey");
			assert.equal(Object.keys(oCompVariantStateById).length, 1, "still only one entity is present");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});