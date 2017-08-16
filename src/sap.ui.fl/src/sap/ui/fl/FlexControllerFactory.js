/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/FlexController", "sap/ui/fl/Utils", "sap/ui/fl/ChangePersistenceFactory", "sap/ui/fl/variants/VariantModel"
], function(jQuery, FlexController, Utils, ChangePersistenceFactory, VariantModel) {
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
	 * If one of this prerequisites is not fulfilled, no instance of FlexController will be returned.
	 *
	 * @public
	 * @param {sap.ui.core.Control} oControl The control
	 * @param {object} [oManifest] - Manifest of the component
	 * @returns {sap.ui.fl.FlexController} instance
	 */
	FlexControllerFactory.createForControl = function(oControl, oManifest) {
		var sComponentName = Utils.getComponentClassName(oControl);
		var oLocalManifest = oManifest || Utils.getAppComponentForControl(oControl).getManifest();
		var sAppVersion = Utils.getAppVersionFromManifest(oLocalManifest);
		return FlexControllerFactory.create(sComponentName, sAppVersion);
	};

	/**
	 * Gets the changes and in case of existing changes, prepare the applyChanges function already with the changes.
	 *
	 * @param {object} oComponent Component instance that is currently loading
	 * @param {object} vConfig configuration of loaded component
	 * @public
	 */
	FlexControllerFactory.getChangesAndPropagate = function (oComponent, vConfig) {
		var oManifest = oComponent.getManifestObject();
		if (Utils.isApplication(oManifest)) {
			var oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
			ChangePersistenceFactory._getChangesForComponentAfterInstantiation(vConfig, oManifest, oComponent)
			.then(function (fnGetChangesMap) {
				oComponent.addPropagationListener(oFlexController.getBoundApplyChangesOnControl(fnGetChangesMap, oComponent));
				var oData = oFlexController.getVariantModelData() || {};
				oComponent.setModel(new VariantModel(oData, oFlexController, oComponent), "$FlexVariants");
			});
		}
	};

	return FlexControllerFactory;
}, true);
