/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/LayerUtils",
	"sap/base/Log",
	"sap/base/util/deepClone",
	"sap/ui/thirdparty/sinon-4"
], function (
	UIComponent,
	Utils,
	FlexState,
	Loader,
	CompatibilityConnector,
	Storage,
	LayerUtils,
	Log,
	deepClone,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReference = "sap.ui.fl.reference";
	var sComponentId = "componentId";
	var mResponse = {
		changes: {
			changes: [],
			variants: [],
			variantChanges: [],
			variantDependentControlChanges: [],
			variantManagementChanges: [],
			notKnownChanges: [],
			randomObject: {}
		}
	};

	function _mockPrepareFunctions(sMapName) {
		var oReturn = {};
		if (sMapName === "appDescriptorMap") {
			oReturn.appDescriptorChanges = sMapName;
		} else if (sMapName === "changesMap") {
			oReturn.changes = sMapName;
		} else if (sMapName === "variantsMap") {
			oReturn.variantsMap = sMapName;
		}
		return oReturn;
	}

	QUnit.module("FlexState with loadFlexData, _callPrepareFunction and filtering stubbed", {
		beforeEach: function () {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(deepClone(mResponse));
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "_callPrepareFunction").callsFake(_mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oFilterStub = sandbox.spy(LayerUtils, "filterChangeDefinitionsByMaxLayer");
		},
		afterEach: function () {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when initialize is called with complete information", function (assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			}).then(function (oReturn) {
				assert.equal(oReturn, undefined, "the function resolves without value");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the FlexState made a call to load the flex data");
				//real solution once the variants are prepared regularly
				//assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "then prepare function was called once");
				assert.ok(this.oCallPrepareFunctionStub.calledWith("variantsMap"), "then variants map was prepared");
				assert.equal(this.oFilterStub.callCount, 0, "nothing got filtered");
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function () {
				assert.deepEqual(FlexState.getVariantsState(sReference), _mockPrepareFunctions("variantsMap"), "then variants map was prepared correctly");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "variant prepare function was not called again");
			}.bind(this));
		});

		QUnit.test("when initialize is called followed by reset of prepared maps", function (assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			}).then(function () {
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "then prepare function was called once");
				FlexState.clearPreparedMaps(sReference);
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function () {
				FlexState.getVariantsState(sReference);
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "then prepare function was called again");
				assert.ok(this.oCallPrepareFunctionStub.secondCall.calledWith("variantsMap"), "then prepare function for variants map was called again");
			}.bind(this));
		});

		QUnit.test("when initialize is followed by clearance of states, with a delayed reset of prepared maps", function (assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			}).then(function () {
				FlexState.clearState();
				assert.equal(FlexState.clearPreparedMaps(sReference), undefined, "then no error was thrown");
			});
		});

		QUnit.test("when initialize is called with a reference ending in '.Component'", function (assert) {
			return FlexState.initialize({
				reference: sReference + ".Component",
				componentId: sComponentId
			}).then(function(oReturn) {
				assert.equal(oReturn, undefined, "the function resolves without value");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the FlexState made a call to load the flex data");
				//real solution once the variants are prepared regularly
				//assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "variant prepare function was called");
				return Promise.all([
					FlexState.getStorageResponse(sReference),
					FlexState.getStorageResponse(sReference + ".Component")
				]);
			}.bind(this)).then(function(mStorageResponses) {
				assert.notEqual(mStorageResponses[0], undefined, "the FlexState without .Component was initialized");
				assert.notEqual(mStorageResponses[1], undefined, "the FlexState with .Component was initialized");
			});
		});

		QUnit.test("when initialize is called without a reference and with a componentID", function(assert) {
			var oMockResponse = {changes: { foo: "FlexResponse"}};
			this.oLoadFlexDataStub.resolves(oMockResponse);

			var oExpectedResponse = Object.assign({}, oMockResponse);
			oExpectedResponse.changes.variantSection = _mockPrepareFunctions("variantsMap");

			return FlexState.initialize({
				componentId: sComponentId
			})
				.then(FlexState.getStorageResponse.bind(null, Utils.getComponentClassName(this.oAppComponent)))
				.then(function (oFlexResponse) {
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
			}).then(function() {
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");
			}.bind(this));
		});

		QUnit.test("when getUIChanges / getAppDescriptorChanges / getVariantsState is called without initialization", function(assert) {
			return FlexState.initialize({
				reference: "sap.ui.fl.other.reference",
				componentId: sComponentId
			})
			.then(function() {
				//real solution once the variants are prepared regularly
				//assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "variant prepare function was called");
				assert.throws(
					function() {FlexState.getUIChanges(sReference);},
					"the getUIChanges function throws an error"
				);
				assert.throws(
					function() {FlexState.getAppDescriptorChanges(sReference);},
					"the getAppDescriptorChanges function throws an error"
				);
				assert.throws(
					function() {FlexState.getVariantsState(sReference);},
					"the getVariantsState function throws an error"
				);
			}.bind(this));
		});

		QUnit.test("when getAppDescriptorChanges / getUIChanges / getVariantsState is called with proper initialization", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(FlexState.getAppDescriptorChanges(sReference), "appDescriptorMap", "the correct map is returned");
				//real solution once the variants are prepared regularly
				// assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was called twice");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "variant prepare function was as well called");
				assert.equal(FlexState.getAppDescriptorChanges(sReference), "appDescriptorMap", "the correct map is returned");
				//real solution once the variants are prepared regularly
				//assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "the prepare function was not called again");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was not called again");

				assert.equal(FlexState.getUIChanges(sReference), "changesMap", "the correct map is returned");
				//real solution once the variants are prepared regularly
				//assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was called once");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 3, "variant prepare function was as well called");
				assert.equal(FlexState.getUIChanges(sReference), "changesMap", "the correct map is returned");
				//assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "the prepare function was not called again");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was not called again");

				assert.deepEqual(FlexState.getVariantsState(sReference), {variantsMap: "variantsMap"}, "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was called once");
				assert.deepEqual(FlexState.getVariantsState(sReference), {variantsMap: "variantsMap"}, "the correct map is returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 3, "the prepare function was not called again");
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
					function() {FlexState.getUIChanges({reference: sReference});},
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
					function() {FlexState.getUIChanges({reference: sReference});},
					"after clearState() there is no state2 anymore"
				);
				assert.throws(
					function() {FlexState.getUIChanges({reference: sReference});},
					"after clearState() there is no state3 anymore"
				);
			});
		});

		QUnit.test("when clearAndInitialize is called for different variant map names for two component references", function(assert) {
			var sReferenceComponent2 = "second.reference.Component";
			var sReference2 = "second.reference";
			sandbox.spy(FlexState, "clearState");
			this.oLoadFlexDataStub.resolves(mResponse);
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				FlexState.getVariantsState(sReference);
				this.oCallPrepareFunctionStub.resetHistory();
			}.bind(this))
			.then(FlexState.clearAndInitialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.ok(FlexState.clearState.calledWith(sReference), "then state was cleared for reference1");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 1, "then pre-existing variants map was prepared implicitly");
				this.oCallPrepareFunctionStub.resetHistory();
				assert.deepEqual(FlexState.getVariantsState(sReference), _mockPrepareFunctions("variantsMap"), "then the correct map result was returned");
				assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "then variants map was only prepared during the clearAndInitialize() call");
			}.bind(this))
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
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "then variants maps was prepared implicitly");
				assert.deepEqual(FlexState.getVariantsState(sReferenceComponent2), _mockPrepareFunctions("variantsMap"), "then the correct map result was returned");
				assert.deepEqual(FlexState.getVariantsState(sReference2), _mockPrepareFunctions("variantsMap"), "then the correct map result was returned");
			}.bind(this));
		});
	});

	QUnit.module("FlexState with loadFlexData and _callPrepareFunction stubbed, filtering active", {
		beforeEach: function () {
			this.oLoadFlexDataStub = sandbox.stub(Loader, "loadFlexData").resolves(deepClone(mResponse));
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "_callPrepareFunction").callsFake(_mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(true);
			this.oFilterStub = sandbox.spy(LayerUtils, "filterChangeDefinitionsByMaxLayer");
		},
		afterEach: function () {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called twice with the same reference", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			}).then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
				assert.equal(this.oFilterStub.callCount, 5, "all filterable types got filtered");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was not made again");
				assert.equal(this.oFilterStub.callCount, 5, "no additional filtering happened");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with clearMaxLayerFiltering in between", function(assert) {
			sandbox.spy(FlexState, "clearPreparedMaps");
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			}).then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
				assert.equal(this.oFilterStub.callCount, 5, "all filterable types got filtered");
				FlexState.clearMaxLayerFiltering(sReference);
			}.bind(this))
			.then(function() {
				assert.ok(FlexState.clearPreparedMaps.calledWith(sReference));
			})
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oCallPrepareFunctionStub.callCount, 2, "then variants map were prepared again");
				assert.ok(this.oCallPrepareFunctionStub.calledWith("variantsMap"), "then variants map were prepared again");
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 2, "the check was made again");
				assert.equal(this.oFilterStub.callCount, 10, "everything was filtered again");
			}.bind(this));
		});
	});

	QUnit.module("FlexState with a ushell container", {
		beforeEach: function () {
			sandbox.stub(Loader, "loadFlexData").resolves(deepClone(mResponse));
			sandbox.stub(FlexState, "_callPrepareFunction").callsFake(_mockPrepareFunctions);
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);

			this.oAppComponent = new UIComponent(sComponentId);

			this.oClearMaxLayerFilteringStub = sandbox.stub(FlexState, "clearMaxLayerFiltering");
			this.oErrorLog = sandbox.stub(Log, "error");
			this.oGetMaxLayerTechnicalParameter = sandbox.stub(LayerUtils, "getMaxLayerTechnicalParameter").callThrough();
			this.oRegistrationHandlerStub = sandbox.stub();
			this.oDeRegistrationHandlerStub = sandbox.stub();

			var oUShellService = {
				getService: function(sService) {
					if (sService === "ShellNavigation") {
						return {
							registerNavigationFilter: this.oRegistrationHandlerStub,
							unregisterNavigationFilter: this.oDeRegistrationHandlerStub,
							NavigationFilterStatus: {
								Continue: "continue"
							}
						};
					}
				}.bind(this)
			};
			sandbox.stub(LayerUtils, "getUshellContainer").returns(oUShellService);
		},
		afterEach: function () {
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
			}).then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler(sNewHash, sOldHash);
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oClearMaxLayerFilteringStub.callCount, 1, "then max layer filtering was cleared");
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
			}).then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler(sNewHash, sOldHash);
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oClearMaxLayerFilteringStub.callCount, 0, "then max layer filtering was not cleared");
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
			}).then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler();
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oClearMaxLayerFilteringStub.callCount, 0, "then max layer filtering was not cleared");
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
			}).then(function() {
				var fnRegistrationHandler = this.oRegistrationHandlerStub.getCall(0).args[0];
				var sStatus = fnRegistrationHandler();
				assert.equal(this.oRegistrationHandlerStub.callCount, 1, "then a handler was registered for max layer changes");
				assert.equal(sStatus, "continue", "then the correct status was returned for shell navigation");
				assert.equal(this.oClearMaxLayerFilteringStub.callCount, 0, "then max layer filtering was not cleared");
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
				.then(function () {
					FlexState.clearState();
					assert.equal(this.oDeRegistrationHandlerStub.callCount, 2, "then the handler was de-registered for all existing references");
					assert.ok(this.oDeRegistrationHandlerStub.alwaysCalledWith(sinon.match.func), "then de-registration always happens with a handler function");
				}.bind(this));
		});
	});

	QUnit.module("FlexState without stubs", {
		beforeEach: function () {
			this.oAppComponent = new UIComponent(sComponentId);

			this.oLoaderSpy = sandbox.spy(Loader, "loadFlexData");
			this.oCompatibilityConnectorSpy = sandbox.spy(CompatibilityConnector, "loadChanges");
			this.oApplyStorageLoadFlexDataSpy = sandbox.spy(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
		},
		afterEach: function () {
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
			}).then(function() {
				assert.equal(this.oLoaderSpy.callCount, 1, "loader is called once");
				assert.equal(this.oCompatibilityConnectorSpy.callCount, 1, "compatibility connector is called once");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is called twice");
				assert.equal(this.oCompatibilityConnectorSpy.callCount, 2, "compatibility connector is called twice");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called for the first time");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is not called again");
				assert.equal(this.oCompatibilityConnectorSpy.callCount, 2, "compatibility connector is not called again");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is not called again");
			}.bind(this));
		});

		QUnit.test("when initialize is called three times with the same reference and first and second call has partialFlexState", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				partialFlexState: true
			}).then(function() {
				assert.equal(this.oLoaderSpy.callCount, 1, "loader is called once");
				assert.equal(this.oCompatibilityConnectorSpy.callCount, 1, "compatibility connector is called once");
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
				assert.equal(this.oCompatibilityConnectorSpy.callCount, 1, "compatibility connector is not called again");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oLoaderSpy.callCount, 2, "loader is not called again");
				assert.equal(this.oCompatibilityConnectorSpy.callCount, 2, "compatibility connector is not called again");
				assert.equal(this.oApplyStorageLoadFlexDataSpy.callCount, 1, "storage loadFlexData is not called again");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called for the first time");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
