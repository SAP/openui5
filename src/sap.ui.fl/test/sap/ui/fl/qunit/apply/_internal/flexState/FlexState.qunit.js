/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	Log,
	UIComponent,
	FlexObjectFactory,
	DataSelector,
	FlexState,
	InitialPrepareFunctions,
	Loader,
	ManifestUtils,
	Storage,
	StorageUtils,
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
		beforeEach: function() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.oClearCachedResultSpy = sandbox.spy(DataSelector.prototype, "clearCachedResult");
		},
		afterEach: function() {
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
		beforeEach: function() {
			this.oAppComponent = new UIComponent(sComponentId);
			this.oCheckUpdateSelectorStub = sandbox.spy(DataSelector.prototype, "checkUpdate");
		},
		afterEach: function() {
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
				assert.strictEqual(this.oCheckUpdateSelectorStub.callCount, 1, "then the selector is updated during the state initialization");
			}.bind(this));
		});

		QUnit.test("When a FlexObject is added and removed", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				var oDummyFlexObject = { test: "test" };
				FlexState.addDirtyFlexObject(sReference, oDummyFlexObject);
				assert.deepEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference})[0],
					oDummyFlexObject,
					"then the flexObject is added to the selector"
				);
				assert.strictEqual(
					this.oCheckUpdateSelectorStub.callCount,
					2,
					"then the selector is updated after adding a flexObject"
				);
				FlexState.removeDirtyFlexObject(sReference, oDummyFlexObject);
				assert.notOk(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference})[0],
					"then the flexObject is removed from the selector"
				);
				assert.strictEqual(
					this.oCheckUpdateSelectorStub.callCount,
					3,
					"then the selector is updated after removing a flexObject"
				);
				assert.deepEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: "wrongReference"}),
					[],
					"then an empty array is returned for invalid references"
				);
			}.bind(this));
		});

		QUnit.test("When multiple FlexObjects are added and removed together", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				var aDummyFlexObjects = [{ test: "test" }, { test2: "test2" }];
				FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects);
				assert.deepEqual(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference}),
					aDummyFlexObjects,
					"then the flexObjects are added to the selector"
				);
				assert.strictEqual(
					this.oCheckUpdateSelectorStub.callCount,
					2,
					"then the selector is updated only once after initialize"
				);
				FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
				assert.notOk(
					FlexState.getFlexObjectsDataSelector().get({reference: sReference})[0],
					"then the flexObjects are removed from the selector"
				);
				assert.strictEqual(
					this.oCheckUpdateSelectorStub.callCount,
					3,
					"then the selector is called only once more during the removal"
				);
			}.bind(this));
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
		beforeEach: function() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oFilterStub = sandbox.spy(LayerUtils, "filterChangeDefinitionsByMaxLayer");
			this.sFlexReference = "flexReference";
		},
		afterEach: function() {
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
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.strictEqual(this.oFilterStub.callCount, 0, "nothing got filtered");
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
			var oMockResponse = {changes: merge(StorageUtils.getEmptyFlexDataResponse(), {foo: "FlexResponse"})};
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

		QUnit.test("when getUIChanges / getAppDescriptorChanges / getVariantsState is called without initialization", function(assert) {
			return FlexState.initialize({
				reference: "sap.ui.fl.other.reference",
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.throws(
					function() {
						FlexState.getUIChanges(sReference);
					},
					"the getUIChanges function throws an error"
				);
				assert.throws(
					function() {
						FlexState.getAppDescriptorChanges(sReference);
					},
					"the getAppDescriptorChanges function throws an error"
				);
				assert.throws(
					function() {
						FlexState.getVariantsState(sReference);
					},
					"the getVariantsState function throws an error"
				);
			}.bind(this));
		});

		QUnit.test("when getAppDescriptorChanges / getUIChanges / getVariantsState / getCompVariantsMap is called with proper initialization", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering is done during initialization");

				assert.strictEqual(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was called once for the AppDescriptors");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
				assert.strictEqual(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was not called again");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");

				assert.strictEqual(FlexState.getUIChanges(sReference), "changes", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was called once for the UI Changes");
				assert.strictEqual(FlexState.getUIChanges(sReference), "changes", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was not called again");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");

				assert.strictEqual(FlexState.getCompVariantsMap(sReference), "compVariants", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was called once for the CompVariants");
				assert.strictEqual(FlexState.getCompVariantsMap(sReference), "compVariants", "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was not called again");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
			}.bind(this));
		});

		QUnit.test("when clearState is called with and without reference", function(assert) {
			var sReference2 = "second.reference";
			var sReference3 = "third.reference";
			return FlexState.initialize({
				reference: sReference,
				component: {},
				componentId: sComponentId
			})
			.then(FlexState.initialize.bind(null, {
				reference: sReference2,
				componentId: sComponentId
			}))
			.then(function() {
				assert.ok(FlexState.getUIChanges(sReference), "before clearState state1 is available");
				assert.ok(FlexState.getUIChanges(sReference2), "before clearState state2 is available");
				FlexState.clearState(sReference);
				assert.throws(
					function() {
						FlexState.getUIChanges({reference: sReference});
					},
					"after clearState(1) there is no state1 anymore"
				);
				assert.ok(FlexState.getUIChanges(sReference2), "after clearState(1) state2 is still there");
			})
			.then(FlexState.initialize.bind(null, {
				reference: sReference3,
				componentId: sComponentId
			}))
			.then(function() {
				assert.ok(FlexState.getUIChanges(sReference2), "before clearState state2 is available");
				assert.ok(FlexState.getUIChanges(sReference3), "before clearState state3 is available");
				FlexState.clearState();
				assert.throws(
					function() {
						FlexState.getUIChanges({reference: sReference});
					},
					"after clearState() there is no state2 anymore"
				);
				assert.throws(
					function() {
						FlexState.getUIChanges({reference: sReference});
					},
					"after clearState() there is no state3 anymore"
				);
			});
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
			assert.deepEqual(oStoredData, {persistencyKey: oStoredData2, persistencyKey2: oStoredData1}, "storing data for a new persistencyKey does not overwrite existing data");
		});
	});

	function getUshellContainerStub(oRegistrationHandlerStub, oDeRegistrationHandlerStub) {
		var oUShellService = {
			getServiceAsync: function(sService) {
				if (sService === "ShellNavigation") {
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
		beforeEach: function() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.ogetUShellServiceStub = sandbox.stub(Utils, "getUShellService").withArgs("URLParsing").returns(Promise.resolve("DummyURLParsingService"));
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(true);
			this.oFilterStub = sandbox.spy(LayerUtils, "filterChangeDefinitionsByMaxLayer");
			getUshellContainerStub(sandbox.stub(), sandbox.stub());
		},
		afterEach: function() {
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
				assert.ok(this.oFilterStub.calledWith([], "DummyURLParsingService"), "then filtering was called with the right parameters");
				assert.equal(this.oFilterStub.callCount, 9, "all filterable types got filtered");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				FlexState.getAppDescriptorChanges(sReference);
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was not made again");
				assert.equal(this.oFilterStub.callCount, 9, "no additional filtering happened");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with rebuildFilteredResponse() in between", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				FlexState.getAppDescriptorChanges(sReference);
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
				assert.equal(this.oFilterStub.callCount, 9, "all filterable types got filtered");

				FlexState.rebuildFilteredResponse(sReference);
				return FlexState.getFlexObjectsFromStorageResponse(sReference);
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				FlexState.getAppDescriptorChanges(sReference);
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 2, "the check was made again");
				assert.equal(this.oFilterStub.callCount, 18, "everything was filtered again");
			}.bind(this));
		});
	});

	QUnit.module("FlexState with a ushell container", {
		beforeEach: function() {
			sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);

			this.oAppComponent = new UIComponent(sComponentId);

			this.oRebuildFilteredResponseStub = sandbox.stub(FlexState, "rebuildFilteredResponse");
			this.oErrorLog = sandbox.stub(Log, "error");
			this.oGetMaxLayerTechnicalParameter = sandbox.stub(LayerUtils, "getMaxLayerTechnicalParameter").callThrough();
			this.oRegistrationHandlerStub = sandbox.stub();
			this.oDeRegistrationHandlerStub = sandbox.stub();

			getUshellContainerStub(this.oRegistrationHandlerStub, this.oDeRegistrationHandlerStub);
		},
		afterEach: function() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when max layer parameter is changed to a different layer", function(assert) {
			var sNewHash = "sNewLayer";
			var sOldHash = "sOldLayer";

			this.oGetMaxLayerTechnicalParameter
			.withArgs(sNewHash).returns(sNewHash)
			.withArgs(sOldHash).returns(sOldHash);

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler(sNewHash, sOldHash);
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oRebuildFilteredResponseStub.callCount, 1, "then max layer filtering was cleared");
				FlexState.clearState(sReference);
				assert.equal(this.oDeRegistrationHandlerStub.callCount, 1, "then the handler was de-registered for max layer changes");
				assert.ok(this.oDeRegistrationHandlerStub.calledWith(sinon.match.func), 1, "then de-registration happens with a handler function");
			}.bind(this));
		});

		QUnit.test("when max layer parameter value is unchanged", function(assert) {
			var sNewHash = "sLayer";
			var sOldHash = "sLayer";

			this.oGetMaxLayerTechnicalParameter
			.withArgs(sNewHash).returns(sNewHash)
			.withArgs(sOldHash).returns(sOldHash);

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler(sNewHash, sOldHash);
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oRebuildFilteredResponseStub.callCount, 0, "then max layer filtering was not cleared");
				FlexState.clearState(sReference);
				assert.equal(this.oDeRegistrationHandlerStub.callCount, 1, "then the handler was de-registered for max layer changes");
				assert.ok(this.oDeRegistrationHandlerStub.calledWith(sinon.match.func), 1, "then de-registration happens with a handler function");
			}.bind(this));
		});

		QUnit.test("when max layer parameter value is undefined", function(assert) {
			this.oGetMaxLayerTechnicalParameter.returns();

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler();
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oRebuildFilteredResponseStub.callCount, 0, "then max layer filtering was not cleared");
				FlexState.clearState(sReference);
				assert.equal(this.oDeRegistrationHandlerStub.callCount, 1, "then the handler was de-registered for max layer changes");
				assert.ok(this.oDeRegistrationHandlerStub.calledWith(sinon.match.func), "then de-registration happens with a handler function");
			}.bind(this));
		});

		QUnit.test("when an error occurs during max layer parameter change handling", function(assert) {
			this.oGetMaxLayerTechnicalParameter.throws();

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler();
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oRebuildFilteredResponseStub.callCount, 0, "then max layer filtering was not cleared");
				assert.equal(this.oErrorLog.callCount, 1, "then error was logged");
				FlexState.clearState(sReference);
				assert.equal(this.oDeRegistrationHandlerStub.callCount, 1, "then the reference instance is de-registered for max layer changes");
				assert.ok(this.oDeRegistrationHandlerStub.calledWith(sinon.match.func), "then de-registration happens with a handler function");
			}.bind(this));
		});

		QUnit.test("when clearState() is called without a reference", function(assert) {
			var sReference2 = "second.reference";

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(FlexState.initialize.bind(null, {
				reference: sReference2,
				componentId: sComponentId
			}))
			.then(function() {
				FlexState.clearState();
				assert.equal(this.oDeRegistrationHandlerStub.callCount, 2, "then the handler was de-registered for all existing references");
				assert.ok(this.oDeRegistrationHandlerStub.alwaysCalledWith(sinon.match.func), "then de-registration always happens with a handler function");
			}.bind(this));
		});
	});

	QUnit.module("FlexState without stubs and a ushell container", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent(sComponentId);
			this.oLoaderSpy = sandbox.spy(Loader, "loadFlexData");
			this.oApplyStorageLoadFlexDataSpy = sandbox.spy(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
			this.oRegistrationHandlerStub = sandbox.stub();
			this.oDeRegistrationHandlerStub = sandbox.stub();
			getUshellContainerStub(this.oRegistrationHandlerStub, this.oDeRegistrationHandlerStub);
		},
		afterEach: function() {
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
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is called twice");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called for the first time");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.strictEqual(this.oRegistrationHandlerStub.callCount, 1, "the navigation handler was only registered once");
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is not called again");
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
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.strictEqual(this.oRegistrationHandlerStub.callCount, 1, "the navigation handler was only registered once");
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is not called again");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called for the first time");
			}.bind(this));
		});
	});

	QUnit.module("FlexState with Storage stubs", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent(sComponentId);

			this.oLoaderSpy = sandbox.spy(Loader, "loadFlexData");
			this.oApplyStorageLoadFlexDataStub = sandbox.stub(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
		},
		afterEach: function() {
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
	});

	QUnit.module("Fake Standard Variants", {
		beforeEach: function() {
			sComponentId = "componentId";
			this.sReference = "flexReference";
			this.oVariant = FlexObjectFactory.createFlVariant({
				id: "myStandardVariant",
				reference: this.sReference
			});
			sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oAppComponent = new UIComponent(sComponentId);
			FlexState.rebuildFilteredResponse(this.sReference);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId
			});
		},
		afterEach: function() {
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
		beforeEach: function() {
			this.sComponentId = "componentId";
			this.oAppComponent = new UIComponent(sComponentId);
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mEmptyResponse);
			this.sPersistencyKey = "persistencyKey";
		},
		afterEach: function() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("new change is updated (e.g. after a save)", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			})
			.then(function() {
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
				this.oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
				return FlexState.update({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
			}.bind(this))
			.then(function() {
				// TODO: Replace with getUIChanges when map is properly initialized?
				var aChanges = FlexState.getFlexObjectsDataSelector().get({reference: sReference});
				assert.strictEqual(aChanges[0].getRevertData(), "revertData", "then the runtime information is still available");
				assert.strictEqual(
					aChanges[0].getSupportInformation().user,
					"supportUser",
					"then the change is updated with the additional information from the backend"
				);
				assert.ok(this.oDataSelectorUpdateSpy.calledOnce, "then the data selector update was called");
			}.bind(this));
		});

		QUnit.test("new comp variant change gets updated", function(assert) {
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
				this.oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
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
				assert.ok(this.oDataSelectorUpdateSpy.calledOnce, "then the data selector update was called");
			}.bind(this));
		});

		QUnit.test("A flex object is deleted", function(assert) {
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
				this.oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
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
				assert.ok(this.oDataSelectorUpdateSpy.calledOnce, "then the data selector update was called");
			}.bind(this));
		});

		QUnit.test("no update required (nothing changed)", function(assert) {
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
				this.oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
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
				assert.ok(this.oDataSelectorUpdateSpy.notCalled, "then the data selector update was not called");
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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
