/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/base/util/UriParameters",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	UriParameters,
	FlexState,
	ManifestUtils,
	ChangesController,
	CompVariantState,
	FlexObjectState,
	SessionStorageConnector,
	ChangePersistenceFactory,
	Change,
	Layer,
	Utils,
	Settings,
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
		getId: function() { return "id"; },
		getComponentData: function() {}
	};

	function addChangesToChangePersistence(oChangePersistence) {
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
	}

	function addDirtyChanges(oChangePersistence) {
		var oChangeInPersistence1 = new Change({
			selector: {},
			changeType: "dirtyRenameField",
			layer: Layer.USER
		});
		var oChangeInPersistence2 = new Change({
			selector: {},
			changeType: "dirtyAddGroup",
			layer: Layer.USER
		});
		sandbox.stub(oChangePersistence, "getDirtyChanges").returns([oChangeInPersistence1, oChangeInPersistence2]);
	}

	QUnit.module("getFlexObjects / saveFlexObjects", {
		before: function () {
			return Settings.getInstance();
		},
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
		QUnit.test("Get - Given no flex objects are present", function(assert) {
			return FlexObjectState.getFlexObjects({
				selector: this.appComponent,
				currentLayer: Layer.CUSTOMER
			})
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 0, "an empty array is returned");
			});
		});

		QUnit.test("Get - Given flex objects are present in the CompVariantState", function(assert) {
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
					isVariant: true,
					content: {}
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

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer set", function(assert) {
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
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			sandbox.stub(UriParameters, "fromQuery").returns({
				get: function () {
					return Layer.VENDOR;
				}
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
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

		QUnit.test("Get - Given flex objects of different layers are present in the CompVariantState and currentLayer not set", function(assert) {
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
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			CompVariantState.add({
				changeSpecificData: {
					type: "pageVariant",
					isVariant: true,
					content: {}
				},
				reference: sReference,
				persistencyKey: sPersistencyKey
			});

			return FlexObjectState.getFlexObjects({
				selector: this.appComponent
			})
			.then(function (aFlexObjects) {
				assert.equal(aFlexObjects.length, 3, "an array with three entries is returned");
			});
		});

		[true, false].forEach(function(bIncludeDirtyChanges) {
			var sText = "Get - Given flex objects and dirty changes are present in the ChangePersistence with include dirty changes ";
			sText += bIncludeDirtyChanges ? "set" : "not set";

			QUnit.test(sText, function(assert) {
				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
				addChangesToChangePersistence(oChangePersistence);

				return oChangePersistence.saveDirtyChanges(oComponent)
				.then(function() {
					addDirtyChanges(oChangePersistence);
				})
				.then(FlexObjectState.getFlexObjects.bind(undefined, {
					selector: this.appComponent,
					includeDirtyChanges: bIncludeDirtyChanges
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
					selector: this.appComponent,
					includeDirtyChanges: bIncludeDirtyChanges
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

			sText = "Get - Given flex objects are present in the ChangePersistence and in the CompVariantState with include dirty changes ";
			sText += bIncludeDirtyChanges ? "set" : "not set";
			QUnit.test(sText, function(assert) {
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
						isVariant: true,
						content: {}
					},
					reference: sReference,
					persistencyKey: sPersistencyKey
				});

				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
				addChangesToChangePersistence(oChangePersistence);

				return oChangePersistence.saveDirtyChanges(oComponent)
				.then(function() {
					addDirtyChanges(oChangePersistence);
				})
				.then(FlexObjectState.getFlexObjects.bind(undefined, {
					selector: this.appComponent,
					includeDirtyChanges: bIncludeDirtyChanges
				}))
				.then(function (aFlexObjects) {
					assert.equal(aFlexObjects[0].getChangeType(), "addFavorite", "the change from the compVariantState is present");
					assert.equal(aFlexObjects[1].getChangeType(), "pageVariant", "the variant from the compVariantState is present");
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

		QUnit.test("Save", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			sandbox.stub(Utils, "getAppIdFromManifest").returns("id");
			sandbox.stub(Utils, "getComponentClassName").returns("name");
			var oPersistAllStub = sandbox.stub(CompVariantState, "persistAll");
			var oFlexController = ChangesController.getFlexControllerInstance(oComponent);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oComponent);
			var oSaveAllStub1 = sandbox.stub(oFlexController, "saveAll").resolves();
			var oSaveAllStub2 = sandbox.stub(oDescriptorFlexController, "saveAll").resolves();
			var oGetFlexObjectsStub = sandbox.stub(FlexObjectState, "getFlexObjects").resolves("foo");

			return FlexObjectState.saveFlexObjects({
				selector: oComponent,
				skipUpdateCache: true,
				draft: true,
				layer: Layer.USER
			}).then(function(sReturn) {
				assert.equal(sReturn, "foo", "the function returns whatever getFlexObjects returns");
				assert.equal(oPersistAllStub.callCount, 1, "the CompVariant changes were saved");

				assert.equal(oSaveAllStub1.callCount, 1, "the UI Changes were saved");
				assert.deepEqual(oSaveAllStub1.firstCall.args[0], oComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub1.firstCall.args[2], true, "the draft flag was passed");
				assert.equal(oSaveAllStub2.callCount, 1, "the descriptor Changes were saved");
				assert.deepEqual(oSaveAllStub2.firstCall.args[0], oComponent, "the component was passed");
				assert.deepEqual(oSaveAllStub2.firstCall.args[1], true, "the skipUpdateCache flag was passed");
				assert.deepEqual(oSaveAllStub2.firstCall.args[2], true, "the draft flag was passed");

				assert.equal(oGetFlexObjectsStub.callCount, 1, "the changes were retrieved at the end");
				var oExpectedParameters = {
					componentId: "id",
					selector: oComponent,
					draft: true,
					layer: Layer.USER,
					currentLayer: Layer.USER,
					invalidateCache: true
				};
				assert.deepEqual(oGetFlexObjectsStub.firstCall.args[0], oExpectedParameters, "the parameters for getFlexObjects are correct");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});