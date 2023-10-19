/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement"
], function(
	Log,
	Lib,
	AppDescriptorApplier,
	ApplyStrategyFactory,
	ChangesApplier,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	VariantModel,
	FlexControllerFactory,
	Layer,
	Utils,
	JSONModel,
	Measurement
) {
	"use strict";

	/**
	 * @namespace sap.ui.fl.apply._internal.preprocessors.ComponentLifecycleHooks
	 * @since Since 1.114
	 * @author SAP SE
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var ComponentLifecycleHooks = {};

	// in this object a promise is stored for every application component instance
	// if the same instance is initialized twice the promise is replaced
	ComponentLifecycleHooks._componentInstantiationPromises = new WeakMap();
	var oEmbeddedComponentsPromises = {};

	/**
	 * The fl library must ensure a proper rta startup by a lazy loading of the rta library and starting RTA accordingly.
	 * This is needed in the stand alone scenario; ATTENTION: if also the ushell-plugin of rta runs, the first one will
	 * actually trigger the reload and clear the flag for the second.
	 *
	 * @param {object} oResult - The result which will be passed after the rta startup was checked and triggered if needed
	 * @param {object} oComponent - Application component about to be started
	 * @returns {Promise} Promise resolving with the initially passed result
	 */
	function checkForRtaStartOnDraftAndReturnResult(oResult, oComponent) {
		// if the FLP is available the restart behavior is handled there
		if (Utils.getUshellContainer()) {
			return Promise.resolve(oResult);
		}

		var sRestartingComponent = window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
		if (sRestartingComponent) {
			var sComponentId = ManifestUtils.getFlexReferenceForControl(oComponent);
			if (sRestartingComponent !== sComponentId && sRestartingComponent !== "true") {
				Log.error(`an application component was started which does not match the component for which the restart was triggered:
					Triggering component: ${sRestartingComponent}
					Started component: ${sComponentId}`);

				return Promise.resolve(oResult);
			}

			return new Promise(function(resolve, reject) {
				Promise.all([
					Lib.load({name: "sap.ui.rta"}),
					oComponent.rootControlLoaded()
				])
				.then(function() {
					sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function(startKeyUserAdaptation) {
						startKeyUserAdaptation({
							rootControl: oComponent
						});
						resolve(oResult);
					});
				})
				.catch(function(oError) {
					reject(oError);
				});
			});
		}

		return Promise.resolve(oResult);
	}

	/**
	 * Binds a json model to the component if a vendor change is loaded. This will enable the translation for those changes.
	 * Used on the NEO stack
	 * @param {sap.ui.core.Component} oAppComponent - Component instance
	 */
	function createVendorTranslationModelIfNecessary(oAppComponent) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const oStorageResponse = FlexState.getStorageResponse(sReference);
		if (
			oStorageResponse.messagebundle
			&& !oAppComponent.getModel("i18nFlexVendor")
			&& oStorageResponse.changes?.changes?.some((oChange) => {
				return oChange.layer === Layer.VENDOR;
			})
		) {
			oAppComponent.setModel(new JSONModel(oStorageResponse.messagebundle), "i18nFlexVendor");
		}
	}

	function propagateChangesForAppComponent(oAppComponent) {
		// only manifest with type = "application" will fetch changes
		var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
		var oVariantModel;
		return oFlexController._oChangePersistence.loadChangesMapForComponent(oAppComponent)
		.then(function(fnGetChangesMap) {
			var fnPropagationListener = ChangesApplier.applyAllChangesForControl.bind(
				ChangesApplier,
				fnGetChangesMap,
				oAppComponent,
				oFlexController
			);
			fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
			oAppComponent.addPropagationListener(fnPropagationListener);
			oVariantModel = ComponentLifecycleHooks._createVariantModel(oFlexController, oAppComponent);
			return oVariantModel.initialize();
		})
		.then(function() {
			oAppComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
			Measurement.end("flexProcessing");
			return oVariantModel;
		}).then(function(oResult) {
			return checkForRtaStartOnDraftAndReturnResult(oResult, oAppComponent);
		});
	}

	function getChangesAndPropagate(oComponent, vConfig) {
		// if component's manifest is of type 'application' then only a flex controller and change persistence instances are created.
		// if component's manifest is of type 'component' then no flex controller and change persistence instances are created.
		// The variant model is fetched from the outer app component and applied on this component type.
		if (Utils.isApplicationComponent(oComponent)) {
			var sComponentId = oComponent.getId();
			var oReturnPromise = FlexState.initialize({
				componentId: sComponentId,
				asyncHints: vConfig.asyncHints
			})
			.then(propagateChangesForAppComponent.bind(this, oComponent))
			.then(createVendorTranslationModelIfNecessary.bind(this, oComponent))
			.then(function() {
				// update any potential embedded component waiting for this app component
				if (oEmbeddedComponentsPromises[sComponentId]) {
					oEmbeddedComponentsPromises[sComponentId].forEach(function(oEmbeddedComponent) {
						var oVariantModel = oComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
						oEmbeddedComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
					});
					delete oEmbeddedComponentsPromises[sComponentId];
				}
			});
			ComponentLifecycleHooks._componentInstantiationPromises.set(oComponent, oReturnPromise);

			return oReturnPromise;
		} else if (Utils.isEmbeddedComponent(oComponent)) {
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			// once the VModel is set to the outer component it also has to be set to any embedded component
			if (ComponentLifecycleHooks._componentInstantiationPromises.has(oAppComponent)) {
				return ComponentLifecycleHooks._componentInstantiationPromises.get(oAppComponent).then(function() {
					var oVariantModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
					oComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				});
			}
			oEmbeddedComponentsPromises[oAppComponent.getId()] = oEmbeddedComponentsPromises[oAppComponent.getId()] || [];
			oEmbeddedComponentsPromises[oAppComponent.getId()].push(oComponent);
			return Promise.resolve();
		}
		return Promise.resolve();
	}

	function onLoadComponent(oConfig, oManifest) {
		// stop processing if the component is not of the type application or component ID is missing
		if (!Utils.isApplication(oManifest) || !oConfig.id) {
			return Promise.resolve();
		}

		FlexState.initialize({
			componentData: oConfig.componentData || (oConfig.settings && oConfig.settings.componentData),
			asyncHints: oConfig.asyncHints,
			manifest: oManifest,
			componentId: oConfig.id
		});

		// manifest descriptor changes for ABAP mixed mode can only be applied in this hook,
		// because at this point all libs have been loaded (in contrast to the first Component._fnPreprocessManifest hook),
		// but the manifest is still adaptable
		return AppDescriptorApplier.applyChangesIncludedInManifest(oManifest, ApplyStrategyFactory.getRuntimeStrategy());
	}

	// the current sinon version used in UI5 does not support stubbing the constructor
	ComponentLifecycleHooks._createVariantModel = function(oFlexController, oAppComponent) {
		return new VariantModel({}, {
			flexController: oFlexController,
			appComponent: oAppComponent
		});
	};

	/**
	 * Gets the changes and in case of existing changes, prepare the applyChanges function already with the changes.
	 *
	 * @param {object} oComponent - Component instance that is currently loading
	 * @param {object} vConfig - Configuration of loaded component
	 * @returns {Promise} Promise which resolves when all relevant tasks for changes propagation have been processed
	 */
	ComponentLifecycleHooks.instanceCreatedHook = function(...aArgs) {
		return getChangesAndPropagate(...aArgs);
	};

	/**
	 * Callback which is called within the early state of Component processing.
	 * Already triggers the loading of the flexibility changes if the loaded manifest is an application variant.
	 * The processing is only done for components of the type "application"
	 *
	 * @param {object} oConfig - Copy of the configuration of loaded component
	 * @param {object} oConfig.asyncHints - Async hints passed from the app index to the core Component processing
	 * @param {object} oManifest - Copy of the manifest of loaded component
	 * @returns {Promise} Resolves after all Manifest changes are applied
	 */
	ComponentLifecycleHooks.componentLoadedHook = function(...aArgs) {
		return onLoadComponent(...aArgs);
	};

	return ComponentLifecycleHooks;
});