/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	FlexState,
	Loader,
	ManifestUtils,
	Storage,
	StorageUtils,
	LayerUtils,
	Utils,
	ChangePersistenceFactory,
	Log,
	merge,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReference = "sap.ui.fl.reference";
	var sComponentId = "componentId";
	var mResponse = {
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

	QUnit.module("FlexState with loadFlexData, callPrepareFunction and filtering stubbed", {
		beforeEach: function() {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(merge(mResponse,
				{
					changes: {}
				}
			));
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oFilterStub = sandbox.spy(LayerUtils, "filterChangeDefinitionsByMaxLayer");
		},
		afterEach: function() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called with complete information", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function(oReturn) {
				assert.equal(oReturn, undefined, "the function resolves without value");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the FlexState made a call to load the flex data");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.equal(this.oFilterStub.callCount, 0, "nothing got filtered");
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function() {
				assert.deepEqual(FlexState.getVariantsState(sReference), mockPrepareFunctions("variants"), "then variants map was prepared correctly");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "variant prepare function was not called again");
			}.bind(this));
		});

		QUnit.test("when initialize is called with a reference ending in '.Component'", function(assert) {
			return FlexState.initialize({
				reference: sReference + ".Component",
				componentId: sComponentId
			})
			.then(function(oReturn) {
				assert.equal(oReturn, undefined, "the function resolves without value");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the FlexState made a call to load the flex data");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				return Promise.all([
					FlexState.getStorageResponse(sReference),
					FlexState.getStorageResponse(sReference + ".Component")
				]);
			}.bind(this))
			.then(function(aStorageResponses) {
				assert.notEqual(aStorageResponses[0], undefined, "the FlexState without .Component was initialized");
				assert.notEqual(aStorageResponses[1], undefined, "the FlexState with .Component was initialized");
			});
		});

		QUnit.test("when initialize is called without a reference and with a componentID", function(assert) {
			var oMockResponse = {changes: {foo: "FlexResponse"}};
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
				assert.equal(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was called twice");
				assert.equal(FlexState.getAppDescriptorChanges(sReference), "appDescriptorChanges", "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was not called again");

				assert.equal(FlexState.getUIChanges(sReference), "changes", "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was called once");
				assert.equal(FlexState.getUIChanges(sReference), "changes", "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was not called again");

				assert.deepEqual(FlexState.getVariantsState(sReference), {variantsMap: "variants"}, "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was called once");
				assert.deepEqual(FlexState.getVariantsState(sReference), {variantsMap: "variants"}, "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was not called again");

				assert.equal(FlexState.getCompVariantsMap(sReference), "compVariants", "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 4, "the prepare function was called once");
				assert.equal(FlexState.getCompVariantsMap(sReference), "compVariants", "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 4, "the prepare function was not called again");
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

		QUnit.test("when clearAndInitialize is called for two component references", function(assert) {
			var sReferenceComponent2 = "second.reference.Component";
			var sReference2 = "second.reference";
			sandbox.spy(FlexState, "clearState");
			this.oLoadFlexDataStub.resolves(mResponse);
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(FlexState.clearAndInitialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.ok(FlexState.clearState.calledWith(sReference), "then state was cleared for reference1");
			})
			.then(FlexState.initialize.bind(null, {
				reference: sReference2,
				componentId: sComponentId
			}))
			.then(FlexState.clearAndInitialize.bind(null, {
				reference: sReferenceComponent2,
				componentId: sComponentId
			}))
			.then(function() {
				assert.ok(FlexState.clearState.calledWith(sReferenceComponent2), "then state was cleared for reference2.Component");
				assert.ok(FlexState.clearState.calledWith(sReference2), "then state was cleared for reference2");
			});
		});

		QUnit.test("when external comp variant data is stored and retrieved", function(assert) {
			var oStoredData = FlexState.getInitialNonFlCompVariantData("reference.Component");
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
				standardVariant: oStandardVariant1
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
				standardVariant: oStandardVariant2
			};
			FlexState.setInitialNonFlCompVariantData("reference.Component", "persistencyKey", oStandardVariant1, aVariants1);
			oStoredData = FlexState.getInitialNonFlCompVariantData("reference.Component");
			assert.deepEqual(oStoredData, {persistencyKey: oStoredData1}, "retrieve function return stored data correctly");
			FlexState.setInitialNonFlCompVariantData("reference.Component", "persistencyKey", oStandardVariant2, aVariants2);
			oStoredData = FlexState.getInitialNonFlCompVariantData("reference.Component");
			assert.deepEqual(oStoredData, {persistencyKey: oStoredData2}, "store the data will overwrite existing stored data");
			FlexState.setInitialNonFlCompVariantData("reference.Component", "persistencyKey2", oStandardVariant1, aVariants1);
			oStoredData = FlexState.getInitialNonFlCompVariantData("reference.Component");
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
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(mResponse);
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
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
				assert.ok(this.oFilterStub.calledWith([], "DummyURLParsingService"), "then filtering was called with the right parameters");
				assert.equal(this.oFilterStub.callCount, 9, "all filterable types got filtered");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was not made again");
				assert.equal(this.oFilterStub.callCount, 9, "no additional filtering happened");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with clearFilteredResponse() in between", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
				assert.equal(this.oFilterStub.callCount, 9, "all filterable types got filtered");

				FlexState.clearFilteredResponse(sReference);
				return FlexState.getFlexObjectsFromStorageResponse(sReference);
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 2, "the check was made again");
				assert.equal(this.oFilterStub.callCount, 18, "everything was filtered again");
			}.bind(this));
		});
	});

	QUnit.module("FlexState with a ushell container", {
		beforeEach: function() {
			sandbox.stub(Loader, "loadFlexData").resolves(mResponse);
			sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);

			this.oAppComponent = new UIComponent(sComponentId);

			this.oClearFilteredResponseStub = sandbox.stub(FlexState, "clearFilteredResponse");
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
				assert.equal(this.oClearFilteredResponseStub.callCount, 1, "then max layer filtering was cleared");
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
				assert.equal(this.oClearFilteredResponseStub.callCount, 0, "then max layer filtering was not cleared");
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
				assert.equal(this.oClearFilteredResponseStub.callCount, 0, "then max layer filtering was not cleared");
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
				assert.equal(this.oClearFilteredResponseStub.callCount, 0, "then max layer filtering was not cleared");
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

	QUnit.module("FlexState without stubs", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent(sComponentId);
			this.oLoaderSpy = sandbox.spy(Loader, "loadFlexData");
			this.oApplyStorageLoadFlexDataSpy = sandbox.spy(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
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
			mResponse.changes.changes = [{
				fileType: "change",
				changeType: "propertyChange",
				layer: LayerUtils.getCurrentLayer()
			}];
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
			this.oVariant = {foo: "bar"};
			sandbox.stub(Loader, "loadFlexData").resolves(mResponse);
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oAppComponent = new UIComponent(sComponentId);
			FlexState.clearFilteredResponse(this.sReference);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId
			});
		},
		afterEach: function() {
			sandbox.restore();
			this.oAppComponent.destroy();
			FlexState.clearFilteredResponse(this.sReference);
		}
	}, function() {
		QUnit.test("adding a fake variant", function(assert) {
			var oExpectedMap = {
				foo: "bar"
			};

			assert.deepEqual(FlexState.getVariantsState(this.sReference), {}, "initially the variants map is empty");
			FlexState.setFakeStandardVariant(this.sReference, sComponentId, this.oVariant);
			assert.deepEqual(FlexState.getVariantsState(this.sReference), oExpectedMap, "the fake standard is also part of the map");
			assert.deepEqual(FlexState.getVariantsState(this.sReference), oExpectedMap, "no difference the second time the content is fetched");

			FlexState.resetFakedStandardVariants(this.sReference, sComponentId);
			assert.deepEqual(FlexState.getVariantsState(this.sReference), oExpectedMap, "the faked variant is still in the map");
		});

		QUnit.test("adding the same variant twice to the same reference", function(assert) {
			var oExpectedMap = {
				foo: "bar"
			};
			assert.deepEqual(FlexState.getVariantsState(this.sReference), {}, "initially the variants map is empty");
			FlexState.setFakeStandardVariant(this.sReference, sComponentId, this.oVariant);
			assert.deepEqual(FlexState.getVariantsState(this.sReference), oExpectedMap, "the fake standard is also part of the map");
			FlexState.setFakeStandardVariant(this.sReference, sComponentId, this.oVariant);
			assert.deepEqual(FlexState.getVariantsState(this.sReference), oExpectedMap, "the map has not changed");
		});

		QUnit.test("adding fake variants with a variant section already available", function(assert) {
			merge(FlexState.getVariantsState(this.sReference), {bar: "already available"});
			var oVariant2 = {
				bar: "foobar"
			};
			FlexState.setFakeStandardVariant(this.sReference, sComponentId, this.oVariant);
			FlexState.setFakeStandardVariant(this.sReference, sComponentId, oVariant2);

			var oExpectedContent = {
				bar: "already available",
				foo: "bar"
			};
			assert.deepEqual(FlexState.getVariantsState(this.sReference), oExpectedContent, "one fake variant was added");
		});

		QUnit.test("adding fake variants for components with the same reference but different IDs", function(assert) {
			var sComponentId2 = "componentId2";
			var oAppComponent2 = new UIComponent(sComponentId2);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId2
			}).then(function() {
				var oVariant2 = {
					bar: "foobar"
				};
				FlexState.setFakeStandardVariant(this.sReference, sComponentId, this.oVariant);
				FlexState.setFakeStandardVariant(this.sReference, sComponentId2, oVariant2);

				FlexState.clearFilteredResponse(this.sReference);
				assert.deepEqual(FlexState.getVariantsState(this.sReference), oVariant2, "only one fake variant is available");

				oAppComponent2.destroy();
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
