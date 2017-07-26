/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/FlexController", "sap/ui/fl/Utils", "sap/ui/fl/ChangePersistenceFactory"
], function(jQuery, FlexController, Utils, ChangePersistenceFactory) {
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
	 * @param {String} sComponentName The name of the component
	 * @returns {sap.ui.fl.FlexController} instance
	 *
	 */
	FlexControllerFactory.create = function(sComponentName) {
		var oFlexController = FlexControllerFactory._instanceCache[sComponentName];

		if (!oFlexController){
			oFlexController = new FlexController(sComponentName);
			FlexControllerFactory._instanceCache[sComponentName] = oFlexController;
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
	 * @returns {sap.ui.fl.FlexController} instance
	 */
	FlexControllerFactory.createForControl = function(oControl) {
		var sComponentName = Utils.getComponentClassName(oControl);
		return FlexControllerFactory.create(sComponentName);
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
						oComponent.addPropagationListener(oFlexController.applyChangesOnControl.bind(oFlexController, fnGetChangesMap, oComponent));
					}
				);
		}
	};

	return FlexControllerFactory;
}, true);
