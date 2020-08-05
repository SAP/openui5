/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/variants/VariantModel",
	"sap/base/Log",
	"sap/ui/performance/Measurement"
], function(
	FlexController,
	Utils,
	Layer,
	Applier,
	FlexState,
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
	 */
	var FlexControllerFactory = {};

	FlexControllerFactory._instanceCache = {};

	// in this object a promise is stored for every application component instance
	// if the same instance is initialized twice the promise is replaced
	FlexControllerFactory._componentInstantiationPromises = {};

	/**
	 * Creates or returns an instance of the FlexController
	 *
	 * @public
	 * @param {String} sComponentName - Name of the component
	 * @param {String} sAppVersion - Current version of the application
	 * @returns {sap.ui.fl.FlexController} instance
	 *
	 */
	FlexControllerFactory.create = function(sComponentName, sAppVersion) {
		sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;

		if (!FlexControllerFactory._instanceCache[sComponentName]) {
			FlexControllerFactory._instanceCache[sComponentName] = {};
		}
		var oFlexController = FlexControllerFactory._instanceCache[sComponentName][sAppVersion];

		if (!oFlexController) {
			oFlexController = new FlexController(sComponentName, sAppVersion);
			FlexControllerFactory._instanceCache[sComponentName][sAppVersion] = oFlexController;
		}

		return oFlexController;
	};

	/**
	 * Creates or returns an instance of the FlexController for the specified control.
	 * The control needs to be embedded into a View and the view needs to be embedded into a component.
	 * If the component is an embedded component, then the responsible app component is used.
	 * If one of this prerequisites is not fulfilled, no instance of FlexController will be returned.
	 *
	 * @public
	 * @param {sap.ui.core.Control} oControl The control
	 * @param {object} [oManifest] - Manifest of the component
	 * @returns {sap.ui.fl.FlexController} instance
	 */
	FlexControllerFactory.createForControl = function(oControl, oManifest) {
		try {
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var sComponentName = Utils.getComponentClassName(oAppComponent || oControl);
			var sAppVersion = Utils.getAppVersionFromManifest(oAppComponent ? oAppComponent.getManifest() : oManifest);
			return FlexControllerFactory.create(sComponentName, sAppVersion);
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
			var sComponentId = Utils.getComponentClassName(oComponent);
			if (sRestartingComponent !== sComponentId && sRestartingComponent !== "true") {
				Log.error("an application component was started " +
					"which does not match the component for which the restart was triggered:\n" +
					"Triggering component: " + sRestartingComponent + "\n" +
					"Started component: " + sComponentId);

				return Promise.resolve(oResult);
			}

			window.sessionStorage.removeItem("sap.ui.rta.restart." + Layer.CUSTOMER);
			return new Promise(function (resolve) {
				sap.ui.getCore().loadLibrary("sap.ui.rta", {async: true})
				.then(function() {
					sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
						startKeyUserAdaptation({
							rootControl: oComponent
						});
						resolve(oResult);
					});
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
	 * @public
	 */
	FlexControllerFactory.getChangesAndPropagate = function (oComponent, vConfig) {
		// if component's manifest is of type 'application' then only a flex controller and change persistence instances are created.
		// if component's manifest is of type 'component' then no flex controller and change persistence instances are created. The variant model is fetched from the outer app component and applied on this component type.
		if (Utils.isApplicationComponent(oComponent)) {
			var sComponentId = oComponent.getId();
			FlexControllerFactory._componentInstantiationPromises[sComponentId] = FlexState.initialize({
				componentId: sComponentId,
				asyncHints: vConfig.asyncHints
			}).then(_propagateChangesForAppComponent.bind(this, oComponent));
			return FlexControllerFactory._componentInstantiationPromises[sComponentId];
		} else if (Utils.isEmbeddedComponent(oComponent)) {
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			// Some embedded components might not have an app component, e.g. sap.ushell.plugins.rta, sap.ushell.plugins.rta-personalize
			if (oAppComponent && Utils.isApplicationComponent(oAppComponent)) {
				var oInitialPromise = Promise.resolve();
				if (FlexControllerFactory._componentInstantiationPromises[oAppComponent.getId()]) {
					oInitialPromise = FlexControllerFactory._componentInstantiationPromises[oAppComponent.getId()];
				}
				return oInitialPromise.then(function() {
					var oExistingVariantModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);
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
					oComponent.setModel(oVariantModel, Utils.VARIANT_MODEL_NAME);
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
	 * @private
	 */
	function _propagateChangesForAppComponent (oAppComponent) {
		// only manifest with type = "application" will fetch changes
		var oManifest = oAppComponent.getManifestObject();
		var oFlexController;
		oFlexController = FlexControllerFactory.createForControl(oAppComponent, oManifest);
		return oFlexController._oChangePersistence.loadChangesMapForComponent(oAppComponent)
		.then(function (fnGetChangesMap) {
			var fnPropagationListener = Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, oAppComponent, oFlexController);
			fnPropagationListener._bIsSapUiFlFlexControllerApplyChangesOnControl = true;
			oAppComponent.addPropagationListener(fnPropagationListener);
			var oVariantModel = new VariantModel({}, oFlexController, oAppComponent);
			oAppComponent.setModel(oVariantModel, Utils.VARIANT_MODEL_NAME);
			Measurement.end("flexProcessing");
			return oVariantModel;
		}).then(function (oResult) {
			return checkForRtaStartOnDraftAndReturnResult(oResult, oAppComponent);
		});
	}

	return FlexControllerFactory;
}, true);