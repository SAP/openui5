/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/variants/VariantModel"
], function(FlexController, Utils, ChangePersistenceFactory, VariantModel) {
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
		var sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;

		if (!FlexControllerFactory._instanceCache[sComponentName]) {
			FlexControllerFactory._instanceCache[sComponentName] = {};
		}
		var oFlexController = FlexControllerFactory._instanceCache[sComponentName][sAppVersion];

		if (!oFlexController){
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
			var sComponentName = Utils.getComponentClassName(oAppComponent ? oAppComponent : oControl);
			var sAppVersion = Utils.getAppVersionFromManifest(oAppComponent ? oAppComponent.getManifest() : oManifest);
			return FlexControllerFactory.create(sComponentName, sAppVersion);
		} catch (oError){
			Utils.log.error(oError.message, undefined, "sap.ui.fl.FlexControllerFactory");
		}
	};

	/**
	 * Gets the changes and in case of existing changes, prepare the applyChanges function already with the changes.
	 *
	 * @param {object} oComponent Component instance that is currently loading
	 * @param {object} vConfig configuration of loaded component
	 * @public
	 */
	FlexControllerFactory.getChangesAndPropagate = function (oComponent, vConfig) {
		// only manifest with type = "application" will fetch changes
		var oManifest = oComponent.getManifestObject();
		var sVariantModelName = "$FlexVariants";
		var oFlexController;

		// if component's manifest is of type 'application' then only a flex controller and change persistence instances are created.
		// if component's manifest is of type 'component' then no flex controller and change persistence instances are created. The variant model is fetched from the outer app component and applied on this component type.
		if (Utils.isApplication(oManifest)) {
			oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
			ChangePersistenceFactory._getChangesForComponentAfterInstantiation(vConfig, oManifest, oComponent)
			.then(function (fnGetChangesMap) {
				oComponent.addPropagationListener(oFlexController.getBoundApplyChangesOnControl(fnGetChangesMap, oComponent));
				var oData = oFlexController.getVariantModelData() || {};
				oComponent.setModel(new VariantModel(oData, oFlexController, oComponent), sVariantModelName);
			});
		} else if (Utils.isEmbeddedComponent(oComponent)) {
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			// Some embedded components might not have an app component, e.g. sap.ushell.plugins.rta, sap.ushell.plugins.rta-personalize
			if (oAppComponent) {
				var oVariantModel = oAppComponent.getModel(sVariantModelName);
				if (oVariantModel) {
					oComponent.setModel(oVariantModel, sVariantModelName);
				}
			}
		}
	};

	return FlexControllerFactory;
}, true);