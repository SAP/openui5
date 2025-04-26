/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/descriptor/InlineApplier",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/performance/Measurement"
], function(
	Log,
	Component,
	Lib,
	ApplyStrategyFactory,
	InlineApplier,
	ChangesApplier,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	ChangeHandlerRegistration,
	VariantModel,
	FlexControllerFactory,
	Layer,
	Utils,
	JSONModel,
	ODataUtils,
	Measurement
) {
	"use strict";

	/**
	 * @namespace sap.ui.fl.apply._internal.preprocessors.ComponentLifecycleHooks
	 * @since 1.114
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
	 * @param {object} oComponent - Application component about to be started
	 * @returns {Promise<undefined>} Resolves with undefined
	 */
	function checkForRtaStartOnDraftAndReturnResult(oComponent) {
		// if the FLP is available the restart behavior is handled there
		if (Utils.getUshellContainer()) {
			return Promise.resolve();
		}

		var sRestartingComponent = window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
		if (sRestartingComponent) {
			var sComponentId = ManifestUtils.getFlexReferenceForControl(oComponent);
			if (sRestartingComponent !== sComponentId && sRestartingComponent !== "true") {
				Log.error(`an application component was started which does not match the component for which the restart was triggered:
					Triggering component: ${sRestartingComponent}
					Started component: ${sComponentId}`);

				return Promise.resolve();
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
						resolve();
					});
				})
				.catch(function(oError) {
					reject(oError);
				});
			});
		}

		return Promise.resolve();
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

	async function propagateChangesForAppComponent(oAppComponent) {
		// only manifest with type = "application" will fetch changes
		var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		var oVariantModel;
		var fnPropagationListener = ChangesApplier.applyAllChangesForControl.bind(
			ChangesApplier,
			oAppComponent,
			sReference
		);
		fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
		oAppComponent.addPropagationListener(fnPropagationListener);
		oVariantModel = ComponentLifecycleHooks._createVariantModel(oFlexController, oAppComponent);
		await oVariantModel.initialize();
		Measurement.end("flexProcessing");
		oAppComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
		await checkForRtaStartOnDraftAndReturnResult(oAppComponent);
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
		// because at this point all libs have been loaded (in contrast to the first Component(s) 'onPreprocessManifest' hook),
		// but the manifest is still adaptable
		return InlineApplier.applyChanges(oManifest, ApplyStrategyFactory.getRuntimeStrategy());
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

	async function fetchModelChanges(oPropertyBag) {
		// if there is the owner property, the model is part of a reuse component.
		// but the changes must still be fetched for the app component
		const oOwnerComponent = oPropertyBag.owner && Component.getComponentById(oPropertyBag.owner.id);

		// the functionality still works without component Id, but the FlexState will be initialized again
		// once the component Id is set. This will happen in the instanceCreated hook.
		// This can only be improved once the generated component instance Id is available in the factory config
		const sAppComponentId = oPropertyBag.owner?.id || oPropertyBag.factoryConfig.id || oPropertyBag.factoryConfig.settings?.id;

		const oComponentData = oOwnerComponent?.getComponentData()
			|| oPropertyBag.factoryConfig.componentData
			|| oPropertyBag.factoryConfig.settings?.componentData;
		const sReference = ManifestUtils.getFlexReference({
			manifest: oOwnerComponent?.getManifest() || oPropertyBag.manifest,
			componentData: oComponentData
		});
		try {
			// partialFlexState has to be true as there is no guarantee that the flex bundle is already available at this point
			await FlexState.initialize({
				componentData: oComponentData,
				asyncHints: oPropertyBag.owner?.config.asyncHints || oPropertyBag.factoryConfig.asyncHints,
				componentId: sAppComponentId,
				reference: sReference,
				partialFlexState: true
			});
			const sServiceUrl = ODataUtils.removeOriginSegmentParameters(oPropertyBag.model.getServiceUrl());
			const aRelevantAnnotationChanges = FlexState.getAnnotationChanges(sReference)
			.filter((oAnnotationChange) => oAnnotationChange.getServiceUrl() === sServiceUrl);

			const aReturn = [];
			for (const oAnnotationChange of aRelevantAnnotationChanges) {
				const oChangeHandler = await ChangeHandlerRegistration.getAnnotationChangeHandler({
					changeType: oAnnotationChange.getChangeType()
				});
				aReturn.push(await oChangeHandler.applyChange(oAnnotationChange));
				oAnnotationChange._appliedOnModel = true;
			}
			return aReturn;
		} catch (oError) {
			Log.error("Annotation changes could not be applied.", oError);
			return [];
		}
	}

	/**
	 * Sets a promise at the model instance which resolves with the necessary information for the model to change annotations.
	 *
	 * @param {object} oPropertyBag - Property bag
	 * @param {object} oPropertyBag.model - Model instance
	 * @param {string} oPropertyBag.modelId - Id of the model instance
	 * @param {object} oPropertyBag.factoryConfig - Configuration of loaded component
	 * @param {object} oPropertyBag.manifest - Manifest of the owner component
	 * @param {object} [oPropertyBag.owner] - Only passed if the model is part of an embedded component
	 * @param {string} [oPropertyBag.owner.id] - Id of the owner component
	 * @param {object} [oPropertyBag.owner.config] - Configuration of the owner component
	 */
	ComponentLifecycleHooks.modelCreatedHook = function(oPropertyBag) {
		oPropertyBag.model.setAnnotationChangePromise(fetchModelChanges(oPropertyBag));
	};

	return ComponentLifecycleHooks;
});
