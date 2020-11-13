/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	FlexState,
	ManifestUtils,
	ChangesController,
	CompVariantState,
	FlexObjectState,
	SessionStorageConnector,
	ChangePersistenceFactory,
	Change,
	Layer,
	LayerUtils,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	var sReference = "test.selector.id";
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

	QUnit.module("getFlexObjects", {
		beforeEach: function() {
			sandbox.stub(ChangesController, "getAppComponentForSelector").returns(oComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			this.appComponent = new UIComponent(sReference);
			return FlexState.initialize({
				componentId: sReference,
				reference: sReference
			});
		},
		afterEach: function() {
			SessionStorageConnector.reset({
				reference: sReference,
				layer: Layer.USER
			});
			this.appComponent.destroy();
			ChangePersistenceFactory._instanceCache = {};
			FlexState.clearState(sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no flex objects are present", function(assert) {
			return FlexObjectState.getFlexObjects({
				selector: this.appComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 0, "an empty array is returned");
			});
		});

		QUnit.test("Given flex objects are present in the CompVariantState", function(assert) {
			var sPersistencyKey = "persistency.key";

			CompVariantState.add({
				changeSpecificData: {
					type: "addFavorite"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.appComponent
			})
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 2, "an array with two entries is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "addFavorite", "the change from the compVariantState is present");
				assert.equal(aFlexObjects[1].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
			});
		});

		QUnit.test("Given flex objects of different layers are present in the CompVariantState and currentLayer set", function(assert) {
			var sPersistencyKey = "persistency.key";

			CompVariantState.add({
				changeSpecificData: {
					type: "addFavorite"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					isVariant: true
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			sandbox.stub(LayerUtils, "getCurrentLayer").returns("VENDOR");
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.appComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 1, "an array with one entry is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "addFavorite", "the change from the compVariantState is present");
			});
		});

		QUnit.test("Given flex objects of different layers are present in the CompVariantState and currentLayer not set", function(assert) {
			var sPersistencyKey = "persistency.key";

			CompVariantState.add({
				changeSpecificData: {
					type: "addFavorite"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isUserDependent: true,
					isVariant: true
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			sandbox.stub(LayerUtils, "getCurrentLayer").returns("VENDOR");
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.appComponent
			})
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 3, "an array with one entry is returned");
			});
		});

		QUnit.test("Given flex objects are present in the ChangePersistence", function(assert) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);

			var oChangeInPersistence1 = new Change({
				selector: {},
				changeType: "renameField",
				layer: Layer.USER
			});
			var oChangeInPersistence2 = new Change({
				selector: {},
				changeType: "addGroup",
				layer: Layer.USER
			});
			sandbox.stub(oChangePersistence, "getChangesForComponent").resolves([oChangeInPersistence1, oChangeInPersistence2]);

			return oChangePersistence.saveDirtyChanges(oComponent)
			.then(FlexObjectState.getFlexObjects.bind(undefined, {
				selector: this.appComponent
			}))
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 2, "an array with two entries is returned");
				assert.equal(aFlexObjects[0].getChangeType(), "renameField", "the first change from the persistence is present");
				assert.equal(aFlexObjects[1].getChangeType(), "addGroup", "the second change from the persistence is present");
			});
		});
		QUnit.test("Given flex objects are present in the ChangePersistence and in the CompVariantState", function(assert) {
			var sPersistencyKey = "persistency.key";

			CompVariantState.add({
				changeSpecificData: {
					type: "addFavorite"
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);

			var oChangeInPersistence1 = new Change({
				selector: {},
				changeType: "renameField",
				layer: Layer.USER
			});
			var oChangeInPersistence2 = new Change({
				selector: {},
				changeType: "addGroup",
				layer: Layer.USER
			});
			sandbox.stub(oChangePersistence, "getChangesForComponent").resolves([oChangeInPersistence1, oChangeInPersistence2]);

			return oChangePersistence.saveDirtyChanges(oComponent)
				.then(FlexObjectState.getFlexObjects.bind(undefined, {
					selector: this.appComponent
				}))
				.then(function (aFlexObjects) {
					assert.equal(aFlexObjects.length, 4, "an array with four entries is returned");
					assert.equal(aFlexObjects[0].getChangeType(), "addFavorite", "the change from the compVariantState is present");
					assert.equal(aFlexObjects[1].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
					assert.equal(aFlexObjects[2].getChangeType(), "renameField", "the first change from the persistence is present");
					assert.equal(aFlexObjects[3].getChangeType(), "addGroup", "the second change from the persistence is present");
				});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});