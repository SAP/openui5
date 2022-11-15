/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantModel",
	"sap/base/Log",
	"sap/ui/performance/Measurement"
], function(
	FlexController,
	Utils,
	Layer,
	Applier,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	VariantModel,
	Log,
	Measurement
) {
	"use strict";
	/**
	 * Factory to create new instances of {sap.ui.fl.FlexController}
	 * @constructor
	 * @alias sap.ui.fl.FlexControllerFactory
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlexControllerFactory = {};

	FlexControllerFactory._instanceCache = {};

	// in this object a promise is stored for every application component instance
	// if the same instance is initialized twice the promise is replaced
	FlexControllerFactory._componentInstantiationPromises = new WeakMap();

	/**
	 * Creates or returns an instance of the FlexController
	 *
	 * @param {string} sComponentName - Name of the component
	 * @returns {sap.ui.fl.FlexController} instance
	 *
	 */
	FlexControllerFactory.create = function(sComponentName) {
		var oFlexController = FlexControllerFactory._instanceCache[sComponentName];

		if (!oFlexController) {
			oFlexController = new FlexController(sComponentName);
			FlexControllerFactory._instanceCache[sComponentName] = oFlexController;
		}

		return oFlexController;
	};

	/**
	 * Creates or returns an instance of the FlexController for the specified control.
	 * The control needs to be embedded into a View and the view needs to be embedded into a component.
	 * If the component is an embedded component, then the responsible app component is used.
	 * If one of this prerequisites is not fulfilled, no instance of FlexController will be returned.
	 *
	 * @param {sap.ui.core.Control} oControl The control
	 * @returns {sap.ui.fl.FlexController} instance
	 */
	FlexControllerFactory.createForControl = function(oControl) {
		try {
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var sComponentName = ManifestUtils.getFlexReferenceForControl(oAppComponent || oControl);
			return FlexControllerFactory.create(sComponentName);
		} catch (oError) {
			Log.error(oError.message, undefined, "sap.ui.fl.FlexControllerFactory");
		}
	};

	/**
	 * The fl library must ensure a proper rta startup by a lazy loading of the rta library and starting RTA accordingly.
	 * This is needed in the stand alone scenario; ATTENTION: if also the ushell-plugin of rta runs, the first one will
	 * actually trigger the reload and clear the flag for the second.
	 *
	 * @param {object} oResult - The result which will be passed after the rta startup was checked and triggered if needed
	 * @param {object} oComponent - Application component about to be started
	 * @return {Promise} Promise resolving with the initially passed result
	 */
	function checkForRtaStartOnDraftAndReturnResult(oResult, oComponent) {
		// Dont check for RTA start in ushell scenario
		if (Utils.getUshellContainer()) {
			return Promise.resolve(oResult);
		}

		var sRestartingComponent = window.sessionStorage.getItem("sap.ui.rta.restart." + Layer.CUSTOMER);
		if (sRestartingComponent) {
			var sComponentId = ManifestUtils.getFlexReferenceForControl(oComponent);
			if (sRestartingComponent !== sComponentId && sRestartingComponent !== "true") {
				Log.error("an application component was started " +
					"which does not match the component for which the restart was triggered:\n" +
					"Triggering component: " + sRestartingComponent + "\n" +
					"Started component: " + sComponentId);

				return Promise.resolve(oResult);
			}

			return new Promise(function (resolve, reject) {
				Promise.all([
					sap.ui.getCore().loadLibrary("sap.ui.rta", {async: true}),
					oComponent.rootControlLoaded()
				])
				.then(function() {
					sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
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
	 * Gets the changes and in case of existing changes, prepare the applyChanges function already with the changes.
	 *
	 * @param {object} oComponent - Component instance that is currently loading
	 * @param {object} vConfig - Configuration of loaded component
	 * @return {Promise} Promise which resolves when all relevant tasks for changes propagation have been processed
	 */
	FlexControllerFactory.getChangesAndPropagate = function (oComponent, vConfig) {
		// if component's manifest is of type 'application' then only a flex controller and change persistence instances are created.
		// if component's manifest is of type 'component' then no flex controller and change persistence instances are created. The variant model is fetched from the outer app component and applied on this component type.
		if (Utils.isApplicationComponent(oComponent)) {
			var sComponentId = oComponent.getId();
			// TODO: remove this line when the maps and filtered response are always up to data
			// Currently with the variants the maps are out of sync when the app gets loaded again without complete reload
			FlexState.clearFilteredResponse(ManifestUtils.getFlexReferenceForControl(oComponent));
			var oReturnPromise = FlexState.initialize({
				componentId: sComponentId,
				asyncHints: vConfig.asyncHints
			}).then(_propagateChangesForAppComponent.bind(this, oComponent));
			FlexControllerFactory._componentInstantiationPromises.set(oComponent, oReturnPromise);
			return oReturnPromise;
		} else if (Utils.isEmbeddedComponent(oComponent)) {
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			// Some embedded components might not have an app component, e.g. sap.ushell.plugins.rta, sap.ushell.plugins.rta-personalize
			if (oAppComponent && Utils.isApplicationComponent(oAppComponent)) {
				var oInitialPromise = Promise.resolve();
				if (FlexControllerFactory._componentInstantiationPromises.has(oAppComponent)) {
					oInitialPromise = FlexControllerFactory._componentInstantiationPromises.get(oAppComponent);
				}
				return oInitialPromise.then(function() {
					var oExistingVariantModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
					if (!oExistingVariantModel) {
						// If variant model is not present on the app component
						// then a new variant model should be set on it.
						// Setting a variant model will ensure that at least a standard variant will exist
						// for all variant management controls.
						return _propagateChangesForAppComponent(oAppComponent);
					}
					return oExistingVariantModel;
				}).then(function (oVariantModel) {
					// set app component's variant model on the embedded component
					oComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				});
			}
			return Promise.resolve();
		}
	};

	/**
	 * Sets propagation changes and listeners on the passed app component.
	 * Also creates a variant model on this app component.
	 * @see sap.ui.fl.variant.VariantModel
	 *
	 * @param {sap.ui.core.Component} oAppComponent - App component instance
	 * @return {Promise} Promise which resolves to the created variant model,
	 * after all propagation changes and listeners have been set.
	 */
	function _propagateChangesForAppComponent (oAppComponent) {
		// only manifest with type = "application" will fetch changes
		var oManifest = oAppComponent.getManifestObject();
		var oFlexController = FlexControllerFactory.createForControl(oAppComponent, oManifest);
		var oVariantModel;
		return oFlexController._oChangePersistence.loadChangesMapForComponent(oAppComponent)
		.then(function (fnGetChangesMap) {
			var fnPropagationListener = Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, oAppComponent, oFlexController);
			fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
			oAppComponent.addPropagationListener(fnPropagationListener);
			oVariantModel = new VariantModel({}, {
				flexController: oFlexController,
				appComponent: oAppComponent
			});
			return oVariantModel.initialize();
		})
		.then(function() {
			oAppComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
			Measurement.end("flexProcessing");
			return oVariantModel;
		}).then(function (oResult) {
			return checkForRtaStartOnDraftAndReturnResult(oResult, oAppComponent);
		});
	}

	return FlexControllerFactory;
}, true);