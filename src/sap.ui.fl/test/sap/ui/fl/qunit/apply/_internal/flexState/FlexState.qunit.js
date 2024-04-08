/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	UIComponent,
	FlexObjectFactory,
	DataSelector,
	FlexState,
	InitialPrepareFunctions,
	Loader,
	ManifestUtils,
	FlexInfoSession,
	Storage,
	StorageUtils,
	Layer,
	LayerUtils,
	Utils,
	ChangePersistenceFactory,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sReference = "sap.ui.fl.reference";
	var sComponentId = "componentId";
	var mEmptyResponse = {
		changes: StorageUtils.getEmptyFlexDataResponse()
	};

	function mockPrepareFunctions(sMapName) {
		var oReturn = {};
		if (sMapName === "appDescriptorChanges") {
			oReturn.appDescriptorChanges = sMapName;
		} else if (sMapName === "changes") {
			oReturn.changes = sMapName;
		} else if (sMapName === "variants") {
			oReturn.variantsMap = sMapName;
		} else if (sMapName === "compVariants") {
			oReturn = sMapName;
		}
		return oReturn;
	}

	QUnit.module("Clear FlexState with Data Selector", {
		beforeEach() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.oClearCachedResultSpy = sandbox.spy(DataSelector.prototype, "clearCachedResult");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the state is cleared with a reference", function(assert) {
			FlexState.clearState(sReference);
			assert.strictEqual(this.oClearCachedResultSpy.callCount, 1, "then the selector is cleared");
		});
		QUnit.test("when the state is cleared without a reference", function(assert) {
			FlexState.clearState();
			assert.strictEqual(this.oClearCachedResultSpy.callCount, 1, "then the selector is cleared");
		});
	});

	QUnit.module("FlexState with Data Selector and FlexObjects", {
		beforeEach() {
			this.oAppComponent = new UIComponent(sComponentId);
			this.oCheckUpdateSelectorStub = sandbox.spy(DataSelector.prototype, "checkUpdate");
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the State is initialized", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.ok(FlexState.getFlexObjectsDataSelector(), "then the data selector is created");
				assert.strictEqual(
					this.oCheckUpdateSelectorStub.callCount,
					1,
					"then the selector is updated during the state initialization"
				);
			}.bind(this));
		});

		QUnit.test("When a FlexObject is added and removed", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var oDummyFlexObject = FlexObjectFactory.createUIChange({id: "dummyChange"});
			this.oCheckUpdateSelectorStub.reset();
			FlexState.addDirtyFlexObject(sReference, oDummyFlexObject);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference})[0],
				oDummyFlexObject,
				"then the flexObject is added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated after adding a flexObject"
			);
			FlexState.removeDirtyFlexObject(sReference, oDummyFlexObject);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				0,
				"then the flexObject is removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is updated after removing a flexObject"
			);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: "wrongReference"}),
				[],
				"then an empty array is returned for invalid references"
			);
		});

		QUnit.test("When a FlexObject over max layer is added and removed", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var oDummyFlexObject = FlexObjectFactory.createUIChange({id: "dummyChange"});
			this.oCheckUpdateSelectorStub.reset();
			FlexState.addDirtyFlexObject(sReference, oDummyFlexObject);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference})[0],
				oDummyFlexObject,
				"then the flexObject is added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated after adding a flexObject"
			);
			FlexState.removeDirtyFlexObject(sReference, oDummyFlexObject);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				0,
				"then the flexObject is removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is updated after removing a flexObject"
			);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: "wrongReference"}),
				[],
				"then an empty array is returned for invalid references"
			);
		});

		QUnit.test("When multiple FlexObjects are added and removed together", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var aDummyFlexObjects = [
				FlexObjectFactory.createUIChange({id: "dummyChange1"}),
				FlexObjectFactory.createUIChange({id: "dummyChange2"})
			];
			this.oCheckUpdateSelectorStub.reset();
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}),
				aDummyFlexObjects,
				"then the flexObjects are added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated only once after initialize"
			);
			FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				0,
				"then the flexObjects are removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is called only once more during the removal"
			);
		});

		QUnit.test("When multiple FlexObjects over max layer are added and removed together", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var aDummyFlexObjects = [
				FlexObjectFactory.createUIChange({id: "dummyChange1", layer: "USER"}),
				FlexObjectFactory.createUIChange({id: "dummyChange2", layer: "USER"})
			];
			this.oCheckUpdateSelectorStub.reset();
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationLayer: Layer.CUSTOMER});
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}),
				[],
				"then the flexObjects are NOT added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is NOT updated after initialize"
			);
			FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				0,
				"then the flexObjects are removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is never updated since nothing was removed"
			);
		});

		QUnit.test("When multiple FlexObjects with just one with over adaptation layer are added and removed together", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var aDummyFlexObjects = [
				FlexObjectFactory.createUIChange({id: "dummyChange1", layer: "CUSTOMER"}),
				FlexObjectFactory.createUIChange({id: "dummyChange2", layer: "VENDOR"})
			];
			this.oCheckUpdateSelectorStub.reset();
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationLayer: Layer.VENDOR});
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}),
				[aDummyFlexObjects[1]],
				"then just one flexObject with valid layer is added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated once after initialize"
			);
			FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				0,
				"then the flexObjects are removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is called only once more during the removal"
			);
		});

		QUnit.test("When trying to remove a non-existing FlexObject", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			FlexState.addDirtyFlexObject(sReference, { test: "someDummyFlexObject" });
			this.oCheckUpdateSelectorStub.reset();

			FlexState.removeDirtyFlexObject(sReference, { test: "someOtherDummyFlexObject" });
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				1,
				"then the other flex object is not removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is not updated since nothing was removed"
			);
		});

		QUnit.test("When trying to remove multiple non-existing FlexObjects", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			const aDummyFlexObjects = [
				{ test: "test" },
				{ test2: "test2" }
			];
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects);
			this.oCheckUpdateSelectorStub.reset();

			FlexState.removeDirtyFlexObjects(sReference, [{ test: "someOtherFlexObject" }]);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
				2,
				"then the other flex objects are not removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is not updated since nothing was removed"
			);
		});

		QUnit.test("When data from the storage response is loaded", function(assert) {
			sandbox.stub(Loader, "loadFlexData").resolves(merge(
				{},
				mEmptyResponse,
				{
					changes: {
						appDescriptorChanges: [{changeType: "moveChange"}],
						comp: {
							variants: [{changeType: "variant1"}]
						}
					}
				}
			));
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.deepEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference}).length,
					2,
					"then the flexObjects are created and added to the selector"
				);
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference})[0].getFlexObjectMetadata().changeType,
					"moveChange",
					"then the data is set correctly"
				);
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference})[1].getFlexObjectMetadata().changeType,
					"variant1",
					"then the data is set correctly"
				);
			});
		});

		QUnit.test("When the storage response includes variants that reference an unavailable parent variant", function(assert) {
			sandbox.stub(Loader, "loadFlexData").resolves(merge(
				{},
				mEmptyResponse,
				{
					changes: {
						variants: [{
							// Same id but belongs to a different vm
							variantReference: "someOtherVmReference",
							variantManagementReference: "someOtherVmReference",
							fileType: "ctrl_variant",
							fileName: "someOtherVariant"
						}, {
							variantReference: "someOtherVariant",
							variantManagementReference: "vmReference",
							fileType: "ctrl_variant",
							fileName: "customVariant"
						}]
					}
				}
			));
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference})[1].getVariantReference(),
					"vmReference",
					"then the variant reference is changed to the standard variant"
				);
			});
		});
	});

	QUnit.module("FlexState with loadFlexData, callPrepareFunction and filtering stubbed", {
		beforeEach() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.oLoadAuthorStub = sandbox.stub(Loader, "loadVariantsAuthors").resolves({});
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oGetFlexInfoSessionStub = sandbox.stub(FlexInfoSession, "getByReference").returns({});
			this.sFlexReference = "flexReference";
		},
		afterEach() {
			FlexInfoSession.removeByReference();
			FlexState.clearState();
			FlexState.resetInitialNonFlCompVariantData(this.sFlexReference);
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called with complete information", function(assert) {
			assert.notOk(FlexState.isInitialized({ reference: sReference }), "FlexState is not initialized at beginning");
			assert.notOk(FlexState.isInitialized({ control: this.oAppComponent }), "FlexState is not initialized at beginning");
			var aInitialPreparationSpies = Object.getOwnPropertyNames(InitialPrepareFunctions).map(function(sName) {
				return sandbox.spy(InitialPrepareFunctions, sName);
			});

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.ok(FlexState.isInitialized({ reference: sReference }), "FlexState has been initialized");
				assert.notOk(FlexState.isInitialized({ control: this.oAppComponent }), "FlexState is not initialized at beginning");
				assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the FlexState made a call to load the flex data");
				assert.strictEqual(this.oLoadAuthorStub.callCount, 1, "the FlexState made a call to load the variant authors");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function() {
				assert.ok(
					aInitialPreparationSpies.every(function(oSpy) {
						return oSpy.calledOnce;
					}),
					"then the initial prepare functions are all called during the state initialization"
				);
			});
		});

		QUnit.test("when initialize is called without a reference and with a componentID", function(assert) {
			var oMockResponse = {changes: merge(StorageUtils.getEmptyFlexDataResponse(), {foo: "FlexResponse"}), authors: {}};
			this.oLoadFlexDataStub.resolves(oMockResponse);

			var oExpectedResponse = Object.assign({}, oMockResponse);

			return FlexState.initialize({
				componentId: sComponentId
			})
			.then(FlexState.getStorageResponse.bind(null, ManifestUtils.getFlexReference({
				manifest: this.oAppComponent.getManifest(),
				componentData: {}
			})))
			.then(function(oFlexResponse) {
				assert.deepEqual(oFlexResponse, oExpectedResponse, "then flex state was initialized correctly");
			});
		});

		QUnit.test("when initialize is called without appComponent", function(assert) {
			this.oAppComponent.destroy();
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");
				assert.equal(this.oLoadAuthorStub.callCount, 1, "the variant author is only requested once");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with the same reference with waiting", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");
				assert.equal(this.oLoadAuthorStub.callCount, 1, "the variant authors is only requested once");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with the same reference without waiting", function(assert) {
			FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");
			}.bind(this));
		});

		QUnit.test("when getAppDescriptorChanges / getVariantsState is called without initialization", function(assert) {
			return FlexState.initialize({
				reference: "sap.ui.fl.other.reference",
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.strictEqual(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the prepare is called");
			}.bind(this));
		});

		QUnit.test("when getAppDescriptorChanges / getUIChanges / getVariantsState / getCompVariantsMap is called with proper initialization", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering is done during initialization");
				assert.strictEqual(this.oGetFlexInfoSessionStub.callCount, 3, "get flex info session during initialization");

				assert.strictEqual(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was called once for AppDescriptors");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
				assert.strictEqual(this.oGetFlexInfoSessionStub.callCount, 3, "get flex info session was not triggered again");
				assert.strictEqual(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was not called again");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
				assert.strictEqual(this.oGetFlexInfoSessionStub.callCount, 3, "get flex info session was not triggered again");

				assert.strictEqual(FlexState.getCompVariantsMap(sReference), "compVariants", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was called once for the CompVariants");
				assert.strictEqual(FlexState.getCompVariantsMap(sReference), "compVariants", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was not called again");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
				assert.strictEqual(this.oGetFlexInfoSessionStub.callCount, 3, "get flex info session was not triggered again");
			}.bind(this));
		});

		QUnit.test("when clearState is called while there are dirty changes", function(assert) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			return FlexState.initialize({
				reference: sReference,
				component: {},
				componentId: sComponentId
			})
			.then(function() {
				oChangePersistence.addDirtyChange({});
				FlexState.clearState(sReference);
				assert.strictEqual(
					oChangePersistence.getDirtyChanges().length,
					0,
					"then dirty changes are removed"
				);
			});
		});

		QUnit.test("when external comp variant data is stored and retrieved", function(assert) {
			var oStoredData = FlexState.getInitialNonFlCompVariantData(this.sFlexReference);
			assert.equal(oStoredData, undefined, "when no external data is stored, retrieve function return undefined");
			var aVariants1 = [{
				id: "variant_1",
				name: "A Variant",
				content: {}
			}];
			var oStandardVariant1 = {
				name: "Standard1"
			};
			var oStoredData1 = {
				variants: aVariants1,
				standardVariant: oStandardVariant1,
				controlId: "controlId1"
			};
			var aVariants2 = [{
				id: "variant_2",
				name: "A Variant",
				content: {}
			}];
			var oStandardVariant2 = {
				name: "Standard2"
			};
			var oStoredData2 = {
				variants: aVariants2,
				standardVariant: oStandardVariant2,
				controlId: "controlId2"
			};
			FlexState.setInitialNonFlCompVariantData(this.sFlexReference, "persistencyKey", oStandardVariant1, aVariants1, "controlId1");
			oStoredData = FlexState.getInitialNonFlCompVariantData(this.sFlexReference);
			assert.deepEqual(oStoredData, {persistencyKey: oStoredData1}, "retrieve function return stored data correctly");
			FlexState.setInitialNonFlCompVariantData(this.sFlexReference, "persistencyKey", oStandardVariant2, aVariants2, "controlId2");
			oStoredData = FlexState.getInitialNonFlCompVariantData(this.sFlexReference);
			assert.deepEqual(oStoredData, {persistencyKey: oStoredData2}, "store the data will overwrite existing stored data");
			FlexState.setInitialNonFlCompVariantData(this.sFlexReference, "persistencyKey2", oStandardVariant1, aVariants1, "controlId1");
			oStoredData = FlexState.getInitialNonFlCompVariantData(this.sFlexReference);
			assert.deepEqual(oStoredData, {persistencyKey: oStoredData2, persistencyKey2: oStoredData1},
				"storing data for a new persistencyKey does not overwrite existing data");
		});
	});

	function getUshellContainerStub(oRegistrationHandlerStub, oDeRegistrationHandlerStub) {
		var oUShellService = {
			getServiceAsync(sService) {
				if (sService === "ShellNavigationInternal") {
					return Promise.resolve({
						registerNavigationFilter: oRegistrationHandlerStub,
						unregisterNavigationFilter: oDeRegistrationHandlerStub,
						NavigationFilterStatus: {
							Continue: "continue"
						}
					});
				}
				return Promise.resolve();
			}
		};
		return sandbox.stub(Utils, "getUshellContainer").returns(oUShellService);
	}

	QUnit.module("FlexState with loadFlexData and callPrepareFunction stubbed, filtering active", {
		beforeEach() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.ogetUShellServiceStub = sandbox.stub(Utils, "getUShellService")
			.withArgs("URLParsing")
			.returns(Promise.resolve("DummyURLParsingService"));
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(true);
			this.oGetFlexInfoSessionStub = sandbox.stub(FlexInfoSession, "getByReference").returns({maxLayer: Layer.CUSTOMER});
			getUshellContainerStub(sandbox.stub(), sandbox.stub());
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called twice with the same reference", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				FlexState.getAppDescriptorChanges(sReference);
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
				assert.equal(this.oGetFlexInfoSessionStub.callCount, 4, "get flex info session");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				FlexState.getAppDescriptorChanges(sReference);
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was not made again");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with rebuildFilteredResponse() in between", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			FlexState.getAppDescriptorChanges(sReference);
			assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
			assert.equal(this.oGetFlexInfoSessionStub.callCount, 4, "get flex info session");

			FlexState.rebuildFilteredResponse(sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});

			FlexState.getAppDescriptorChanges(sReference);
			assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 2, "the check was made again");
			assert.equal(this.oGetFlexInfoSessionStub.callCount, 8, "get flex info session again");
		});
	});

	QUnit.module("FlexState with two changes in different layers", {
		beforeEach() {
			FlexInfoSession.removeByReference(sReference);
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(merge(
				{}, mEmptyResponse, {
					changes: {
						changes: [
							{
								fileName: "uiChangeCustomer",
								layer: Layer.CUSTOMER
							},
							{
								fileName: "uiChangeUser",
								layer: Layer.USER
							}
						]
					}
				}
			));
		},
		afterEach() {
			FlexInfoSession.removeByReference(sReference);
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called with and without max layer set", async function(assert) {
			const oDataSelector = FlexState.getFlexObjectsDataSelector();
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oDataSelector.get({reference: sReference}).length, 2, "without max layer, no changes were filtered");

			FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER}, sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oDataSelector.get({reference: sReference}).length, 1, "adding a max layer, one change was filtered");

			FlexInfoSession.setByReference({}, sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oDataSelector.get({reference: sReference}).length, 2, "removing max layer, all changes are available again");
		});

		QUnit.test("when initialize is called with different versions", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				version: "0"
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");

			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				version: "0"
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the data is not requested again");

			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				version: "1"
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the data is requested again");
		});

		QUnit.test("when initialize is called with different allContextsProvided values", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				allContextsProvided: true
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");

			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				allContextsProvided: undefined
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the data is requested again");

			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				allContextsProvided: true
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 3, "the data is requested again");
		});
	});

	QUnit.module("FlexState without stubs and a ushell container", {
		beforeEach() {
			this.oAppComponent = new UIComponent(sComponentId);
			this.oLoaderSpy = sandbox.spy(Loader, "loadFlexData");
			this.oLoadAuthorSpy = sandbox.spy(Loader, "loadVariantsAuthors");
			this.oApplyStorageLoadFlexDataSpy = sandbox.spy(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called three times with the same reference and first call has partialFlexState", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				partialFlexState: true
			})
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 1, "loader is called once");
				assert.notOk(this.oLoadAuthorSpy.calledOnce, "loadAuthors is not called");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is called twice");
				assert.equal(this.oLoadAuthorSpy.callCount, 1, "loadAuthors is called once");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called for the first time");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is not called again");
				assert.equal(this.oLoadAuthorSpy.callCount, 1, "loadAuthors is not called again");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is not called again");
			}.bind(this));
		});

		QUnit.test("when initialize is called three times with the same reference and first and second call has partialFlexState", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				partialFlexState: true
			})
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 1, "loader is called once");
				assert.notOk(this.oLoadAuthorSpy.calledOnce, "loadAuthors is not called");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId,
				partialFlexState: true
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 1, "loader is called not called again");
				assert.notOk(this.oLoadAuthorSpy.calledOnce, "loadAuthors is not called");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is called again");
				assert.equal(this.oLoadAuthorSpy.callCount, 1, "loadAuthors is called once");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called for the first time");
			}.bind(this));
		});
	});

	QUnit.module("FlexState with Storage stubs", {
		beforeEach() {
			this.oAppComponent = new UIComponent(sComponentId);

			this.oLoaderSpy = sandbox.spy(Loader, "loadFlexData");
			this.oApplyStorageLoadFlexDataStub = sandbox.stub(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called in parallel after partialFlexState is set", function(assert) {
			var mResponse = merge(
				{},
				mEmptyResponse,
				{
					changes: {
						changes: [{
							fileType: "change",
							changeType: "propertyChange",
							layer: LayerUtils.getCurrentLayer()
						}]
					}
				}
			);
			this.oApplyStorageLoadFlexDataStub.resolves(mResponse.changes);
			var oFlexStateSpy = sandbox.spy(FlexState, "initialize");
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				partialFlexState: true
			})
			.then(function() {
				assert.equal(oFlexStateSpy.callCount, 1, "flexstate is called once");
				assert.equal(this.oLoaderSpy.callCount, 1, "loader is called once");
				assert.equal(this.oApplyStorageLoadFlexDataStub.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(function() {
				var oStatePromise1 = FlexState.initialize({
					reference: sReference,
					componentId: sComponentId
				});
				var oStatePromise2 = FlexState.initialize({
					reference: sReference,
					componentId: sComponentId
				});
				return Promise.all([oStatePromise1, oStatePromise2]);
			})
			.then(function() {
				assert.equal(oFlexStateSpy.callCount, 3, "flexstate is called three times");
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is called twice");
				assert.equal(this.oApplyStorageLoadFlexDataStub.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called once");
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function(oUnfilteredStorageResponse) {
				assert.equal(oUnfilteredStorageResponse.changes.changes.length, 1, "there is one changes");
			});
		});

		QUnit.test("when initialize is called with an emptyState already available", async function(assert) {
			var mResponse = merge(
				{},
				mEmptyResponse,
				{
					changes: {
						changes: [{
							fileType: "change",
							changeType: "propertyChange",
							layer: LayerUtils.getCurrentLayer()
						}]
					}
				}
			);
			this.oApplyStorageLoadFlexDataStub.resolves(mResponse.changes);
			// this will create an emptyState
			FlexState.getRuntimeOnlyData(sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.equal(this.oLoaderSpy.callCount, 1, "loader is called once");
			assert.equal(this.oApplyStorageLoadFlexDataStub.callCount, 1, "storage loadFlexData is called once");
			const aFlexObjects = FlexState.getFlexObjectsDataSelector().get({reference: sReference});
			assert.equal(aFlexObjects.length, 1, "there is one change");
		});
	});

	QUnit.module("Fake Standard Variants", {
		beforeEach() {
			sComponentId = "componentId";
			this.sReference = "flexReference";
			this.oVariant = FlexObjectFactory.createFlVariant({
				id: "myStandardVariant",
				reference: this.sReference
			});
			sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.oAppComponent = new UIComponent(sComponentId);
			FlexState.rebuildFilteredResponse(this.sReference);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId
			});
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
			FlexState.rebuildFilteredResponse(this.sReference);
			FlexState.clearRuntimeSteadyObjects(this.sReference, sComponentId);
		}
	}, function() {
		QUnit.test("when a fake standard variant is added", function(assert) {
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: this.sReference}).length,
				0,
				"then initially no variants flex objects are part of the flex state"
			);

			FlexState.addRuntimeSteadyObject(this.sReference, sComponentId, this.oVariant);
			var aFlexObjects = FlexState.getFlexObjectsDataSelector().get({reference: this.sReference});
			assert.strictEqual(
				aFlexObjects.length,
				1,
				"then the standard variant flex object is added"
			);
			assert.strictEqual(
				aFlexObjects[0],
				this.oVariant,
				"then the standard variant is returned by the data selector"
			);
		});

		QUnit.test("when the fake standard variants are reset", function(assert) {
			FlexState.addRuntimeSteadyObject(this.sReference, sComponentId, this.oVariant);
			FlexState.clearRuntimeSteadyObjects(this.sReference, sComponentId);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({reference: this.sReference}).length,
				0,
				"then the variant is removed"
			);
		});

		QUnit.test("adding fake variants for components with the same reference but different IDs", function(assert) {
			var sComponentId2 = "componentId2";
			var oAppComponent2 = new UIComponent(sComponentId2);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId2
			}).then(function() {
				var oVariant2 = FlexObjectFactory.createFlVariant({
					id: "bar",
					reference: this.sReference
				});
				FlexState.addRuntimeSteadyObject(this.sReference, sComponentId, this.oVariant);
				FlexState.addRuntimeSteadyObject(this.sReference, sComponentId2, oVariant2);

				FlexState.rebuildFilteredResponse(this.sReference);
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: this.sReference}).length,
					1,
					"then only one fake variant is available"
				);

				FlexState.clearRuntimeSteadyObjects(this.sReference, sComponentId2);
				oAppComponent2.destroy();
			}.bind(this));
		});
	});

	QUnit.module("FlexState update", {
		beforeEach() {
			this.sComponentId = "componentId";
			this.oAppComponent = new UIComponent(sComponentId);
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.sPersistencyKey = "persistencyKey";
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach((bInitFlexState) => {
			const sName = `new change is updated (e.g. after a save)${bInitFlexState ? " with initialized FlexState" : ""}`;
			QUnit.test(sName, async function(assert) {
				var oDataSelectorUpdateSpy;
				if (bInitFlexState) {
					await FlexState.initialize({
						reference: sReference,
						componentId: this.sComponentId
					});
				}
				// New change created in runtime
				var oNewChange = FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					fileType: "change",
					changeType: "rename",
					layer: LayerUtils.getCurrentLayer()
				});
				oNewChange.setRevertData("revertData");
				FlexState.addDirtyFlexObject(sReference, oNewChange);

				// Change gets additional information from storage response (user)
				this.oLoadFlexDataStub.resolves(merge(
					{},
					mEmptyResponse,
					{
						changes: {
							changes: [{
								fileName: "change1",
								fileType: "change",
								changeType: "rename",
								layer: LayerUtils.getCurrentLayer(),
								support: {
									user: "supportUser"
								}
							}]
						}
					}
				));
				oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
				await FlexState.update({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
				var aChanges = FlexState.getFlexObjectsDataSelector().get({reference: sReference});
				assert.strictEqual(aChanges[0].getRevertData(), "revertData", "then the runtime information is still available");
				assert.strictEqual(
					aChanges[0].getSupportInformation().user,
					"supportUser",
					"then the change is updated with the additional information from the backend"
				);
				assert.strictEqual(oDataSelectorUpdateSpy.callCount, 1, "then the data selector update was called");
			});
		});

		QUnit.test("new comp variant change gets updated", function(assert) {
			var oDataSelectorUpdateSpy;
			return FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			})
			.then(function() {
				var oNewChange = FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					fileType: "change",
					selector: {
						persistencyKey: this.sPersistencyKey
					}
				});
				FlexState.addDirtyFlexObject(sReference, oNewChange);

				// The new change gets additional information from storage response (user)
				this.oLoadFlexDataStub.resolves(merge(
					{},
					mEmptyResponse,
					{
						changes: {
							comp: {
								variants: [],
								changes: [{
									fileName: "change1",
									fileType: "change",
									selector: {
										persistencyKey: this.sPersistencyKey
									},
									support: {
										user: "supportUser"
									}
								}],
								defaultVariants: [],
								standardVariants: []
							}
						}
					}
				));
				oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
				return FlexState.update({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
			}.bind(this))
			.then(function() {
				var aChanges = FlexState.getCompVariantsMap(sReference)[this.sPersistencyKey].changes;
				assert.strictEqual(
					aChanges[0].getSupportInformation().user,
					"supportUser",
					"then the new change is updated with the additional information from the backend"
				);
				assert.strictEqual(oDataSelectorUpdateSpy.callCount, 1, "then the data selector update was called");
			}.bind(this));
		});

		QUnit.test("A flex object is deleted", function(assert) {
			var oDataSelectorUpdateSpy;
			// Get initial comp variant changes
			this.oLoadFlexDataStub.resolves(merge(
				{},
				mEmptyResponse,
				{
					changes: {
						comp: {
							variants: [],
							changes: [{
								fileName: "change1",
								fileType: "change",
								selector: {
									persistencyKey: this.sPersistencyKey
								},
								support: {
									user: "supportUser"
								}
							},
							{
								fileName: "change2",
								fileType: "change",
								selector: {
									persistencyKey: this.sPersistencyKey
								},
								support: {
									user: "supportUser"
								}
							}],
							defaultVariants: [],
							standardVariants: []
						}
					}
				}
			));
			return FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			})
			.then(function() {
				oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
				// Change1 is deleted (no longer in storage response)
				this.oLoadFlexDataStub.resolves(merge(
					{},
					mEmptyResponse,
					{
						changes: {
							comp: {
								variants: [],
								changes: [{
									fileName: "change2",
									fileType: "change",
									selector: {
										persistencyKey: this.sPersistencyKey
									},
									support: {
										user: "supportUser"
									}
								}],
								defaultVariants: [],
								standardVariants: []
							}
						}
					}
				));
				return FlexState.update({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
			}.bind(this))
			.then(function() {
				// Check the runtimePersistence directly? Or check both?
				var aChanges = FlexState.getCompVariantsMap(sReference)[this.sPersistencyKey].changes;
				assert.strictEqual(
					aChanges.length,
					1,
					"then one flex object was deleted"
				);
				assert.strictEqual(oDataSelectorUpdateSpy.callCount, 1, "then the data selector update was called");
			}.bind(this));
		});

		QUnit.test("no update required (nothing changed)", function(assert) {
			var oDataSelectorUpdateSpy;
			// Get initial comp variant changes
			this.oLoadFlexDataStub.resolves(merge(
				{},
				mEmptyResponse,
				{
					changes: {
						comp: {
							variants: [],
							changes: [{
								fileName: "change1",
								fileType: "change",
								selector: {
									persistencyKey: this.sPersistencyKey
								},
								support: {
									user: "supportUser"
								}
							},
							{
								fileName: "change2",
								fileType: "change",
								selector: {
									persistencyKey: this.sPersistencyKey
								},
								support: {
									user: "supportUser"
								}
							}],
							defaultVariants: [],
							standardVariants: []
						}
					}
				}
			));
			return FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			})
			.then(function() {
				oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
				// nothing changes - same data is returned from the storage
				return FlexState.update({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
			}.bind(this))
			.then(function() {
				var aChanges = FlexState.getCompVariantsMap(sReference)[this.sPersistencyKey].changes;
				assert.strictEqual(
					aChanges.length,
					2,
					"then both objects are still in the persistence"
				);
				assert.strictEqual(oDataSelectorUpdateSpy.callCount, 0, "then the data selector update was not called");
			}.bind(this));
		});

		QUnit.test("An unknown object is returned from storage", function(assert) {
			var fnDone = assert.async();
			FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			})
			.then(function() {
				var oNewChange = FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					fileType: "change",
					selector: {
						persistencyKey: this.sPersistencyKey
					}
				});
				FlexState.addDirtyFlexObject(sReference, oNewChange);

				// The new change is returned together with an unknown change
				this.oLoadFlexDataStub.resolves(merge(
					{},
					mEmptyResponse,
					{
						changes: {
							comp: {
								variants: [],
								changes: [{
									fileName: "change1",
									fileType: "change",
									selector: {
										persistencyKey: this.sPersistencyKey
									},
									support: {
										user: "supportUser"
									}
								},
								{
									fileName: "change2",
									fileType: "change",
									selector: {
										persistencyKey: this.sPersistencyKey
									},
									support: {
										user: "supportUser"
									}
								}],
								defaultVariants: [],
								standardVariants: []
							}
						}
					}
				));
				return FlexState.update({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
			}.bind(this))
			.catch(function(oError) {
				assert.ok(oError, "then an error is raised");
				// Use assert.async instead of direct return to make sure that the promise is rejected
				fnDone();
			});
		});
	});

	QUnit.module("FlexState.updateStorageResponse", {
		async beforeEach() {
			sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			await FlexState.initialize({
				reference: sReference
			});
			const oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
			// initial data
			const aInitialChanges = [
				FlexObjectFactory.createUIChange({id: "initialUIChange1"}),
				FlexObjectFactory.createUIChange({id: "initialUIChange2", variantReference: "flVariant12"}),
				FlexObjectFactory.createUIChange({id: "initialUIChange3", fileType: "ctrl_variant_change"}),
				FlexObjectFactory.createUIChange({id: "initialUIChange4", fileType: "ctrl_variant_management_change"}),
				FlexObjectFactory.createFlVariant({id: "initialFlVariant1"}),
				FlexObjectFactory.createCompVariant({id: "initialCompVariant1"}),
				FlexObjectFactory.createUIChange({
					id: "initialUIChange5",
					selector: {
						persistencyKey: "foo"
					}
				})
			];
			aInitialChanges.forEach(function(oFlexObject) {
				oChangePersistence.addDirtyChange(oFlexObject);
			});
			FlexState.updateStorageResponse(sReference, aInitialChanges.map((flexObject) => ({
				type: "add",
				flexObject: flexObject.convertToFileContent()
			})));
			FlexState.rebuildFilteredResponse(sReference);
			this.oUIChange = FlexObjectFactory.createUIChange({
				id: "uiChange1"
			});
			this.oVariantDepUIChange = FlexObjectFactory.createUIChange({
				id: "uiChange2",
				variantReference: "flVariant1"
			});
			this.oVariantChange1 = FlexObjectFactory.createUIChange({
				id: "uiChange3",
				fileType: "ctrl_variant_change"
			});
			this.oVariantChange2 = FlexObjectFactory.createUIChange({
				id: "uiChange4",
				fileType: "ctrl_variant_management_change"
			});
			this.oFlVariant = FlexObjectFactory.createFlVariant({
				id: "flVariant1"
			});
			this.oCompVariant = FlexObjectFactory.createCompVariant({
				id: "compVariant1"
			});
			this.oCompChange = FlexObjectFactory.createUIChange({
				id: "uiChange5",
				selector: {
					persistencyKey: "foo"
				}
			});
		},
		afterEach() {
			sandbox.restore();
			FlexState.clearState(sReference);
		}
	}, function() {
		QUnit.test("with all operations at once", async function(assert) {
			const oFlexObjectsDataSelector = FlexState.getFlexObjectsDataSelector();
			let aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 8, "initially there are 8 flexObjects");
			const aNewChanges = [
				this.oUIChange,
				this.oVariantChange1,
				this.oVariantChange2,
				this.oVariantDepUIChange,
				this.oFlVariant,
				this.oCompVariant,
				this.oCompChange
			];
			aNewChanges.forEach(function(oFlexObject) {
				FlexState.addDirtyFlexObject(sReference, oFlexObject);
			});
			FlexState.updateStorageResponse(sReference, [
				...aNewChanges.map((flexObject) => ({
					type: "add",
					flexObject: flexObject.convertToFileContent()
				})),
				{type: "ui2", newData: "ui2"}
			]);
			const oStorageResponse = await FlexState.getStorageResponse(sReference);
			assert.strictEqual(oStorageResponse.changes.changes.length, 2, "UIChange was added");
			assert.strictEqual(oStorageResponse.changes.variantDependentControlChanges.length, 2, "variant dependent UIChange was added");
			assert.strictEqual(oStorageResponse.changes.comp.changes.length, 2, "comp change was added");
			assert.strictEqual(oStorageResponse.changes.comp.variants.length, 2, "comp variant was added");
			assert.strictEqual(oStorageResponse.changes.variantChanges.length, 2, "variant change was added");
			assert.strictEqual(oStorageResponse.changes.variantManagementChanges.length, 2, "variant management change was added");
			assert.strictEqual(oStorageResponse.changes.variants.length, 2, "fl variant was added");
			assert.strictEqual(oStorageResponse.changes.ui2personalization, "ui2", "ui2 was set");

			aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 15, "all flexObjects are part of the DataSelector");

			this.oFlVariant.setFavorite(true);
			this.oCompVariant.setFavorite(true);
			this.oUIChange.setContent("foo");
			this.oCompChange.setContent("bar");

			const oUpdateSpy = sandbox.spy(oFlexObjectsDataSelector, "checkUpdate");
			const aUpdates = [this.oUIChange, this.oFlVariant, this.oCompVariant, this.oCompChange];
			FlexState.updateStorageResponse(sReference, [
				...aUpdates.map((flexObject) => ({
					type: "update",
					flexObject: flexObject.convertToFileContent()
				})),
				{type: "ui2", newData: "newUi2"}
			]);
			assert.strictEqual(oStorageResponse.changes.ui2personalization, "newUi2", "ui2 was set");
			aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 15, "all flexObjects are part of the DataSelector");
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "uiChange1").getContent(),
				"foo", "the content was updated"
			);
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "flVariant1").getFavorite(),
				true, "the favorite flag was updated"
			);
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "compVariant1").getFavorite(),
				true, "the favorite flag was updated"
			);
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "uiChange5").getContent(),
				"bar", "the content was updated"
			);

			const aDeletes = [this.oVariantDepUIChange, this.oFlVariant, this.oCompVariant, this.oCompChange];
			FlexState.updateStorageResponse(sReference, aDeletes.map((flexObject) => ({
				type: "delete",
				flexObject: flexObject.convertToFileContent()
			})));
			aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 11, "all remaining flexObjects are part of the DataSelector");
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oVariantDepUIChange.getId()),
				"the flexObject was deleted"
			);
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oFlVariant.getId()),
				"the flexObject was deleted"
			);
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oCompVariant.getId()),
				"the flexObject was deleted"
			);
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oCompChange.getId()),
				"the flexObject was deleted"
			);
			assert.ok(
				oUpdateSpy.firstCall.args[1].every((oUpdateInfo, iIdx) => {
					return oUpdateInfo.type === "updateFlexObject" && oUpdateInfo.updatedObject === aUpdates[iIdx];
				}),
				"the data selector was updated with the correct operation"
			);
			assert.ok(
				oUpdateSpy.secondCall.args[1].every((oUpdateInfo, iIdx) => {
					return oUpdateInfo.type === "removeFlexObject" && oUpdateInfo.updatedObject === aDeletes[iIdx];
				}),
				"the data selector was updated with the correct operation"
			);
		});

		QUnit.test("when only ui2personalization is updated", async function(assert) {
			const oUpdateFlexObjectsSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
			await FlexState.updateStorageResponse(sReference, [
				{type: "ui2", newData: "ui2"}
			]);
			assert.strictEqual(oUpdateFlexObjectsSpy.callCount, 0, "then the flex objects data selector is not updated");
		});

		QUnit.test("when adding a flex object that is not part of the runtime pertsistence", function(assert) {
			assert.throws(
				function() {
					FlexState.updateStorageResponse(sReference, [
						{type: "add", flexObject: {id: "unknownObject"}}
					]);
				},
				"then an error is thrown"
			);
		});

		QUnit.test("when updating the storage response", function(assert) {
			FlexState.addDirtyFlexObject(sReference, this.oUIChange);
			FlexState.updateStorageResponse(sReference, [
				{type: "add", flexObject: this.oUIChange.convertToFileContent()}
			]);
			FlexState.updateStorageResponse(sReference, [
				{
					type: "update",
					flexObject: {
						...this.oUIChange.convertToFileContent(),
						...{content: "bar"}
					}
				}
			]);
			assert.strictEqual(
				this.oUIChange.getContent(),
				"bar",
				"then the content of the runtime persistence object is also updated"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
