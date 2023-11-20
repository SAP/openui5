/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Utils"
], function(
	Log,
	ManifestUtils,
	FlexController,
	Utils
) {
	"use strict";
	/**
	 * Factory to create new instances of {sap.ui.fl.FlexController}
	 * @constructor
	 * @alias sap.ui.fl.FlexControllerFactory
	 * @since 1.27.0
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlexControllerFactory = {};
	FlexControllerFactory._instanceCache = {};

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
	 * Creates or returns an instance of the FlexController for the specified selector.
	 *
	 * @param {sap.ui.fl.Selector} oSelector - Selector object
	 * @returns {sap.ui.fl.FlexController} instance
	 */
	FlexControllerFactory.createForSelector = function(oSelector) {
		var sComponentName = ManifestUtils.getFlexReferenceForSelector(oSelector);
		return FlexControllerFactory.create(sComponentName);
	};

	return FlexControllerFactory;
}, true);