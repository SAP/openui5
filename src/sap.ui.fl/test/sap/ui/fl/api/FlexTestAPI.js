/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory"
], function(
	FlexState,
	ChangesController,
	VariantModel,
	ChangePersistenceFactory,
	FlexControllerFactory
) {
	"use strict";

	/**
	 * Includes functionality for testing purposes. Must not be used in productive coding
	 *
	 * @experimental
	 * @since 1.77
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var FlexTestAPI = {};

	/**
	 * Clears the instance cache of FlexController and ChangePersistence and the FlexState
	 */
	FlexTestAPI.reset = function() {
		ChangePersistenceFactory._instanceCache = {};
		FlexControllerFactory._instanceCache = {};
		FlexState.clearState();
	};

	/**
	 * Returns dirty changes on the flex persistence of the passed selector.
	 *
	 * @param {object} mPropertyBag - Object with additional information
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
	 * @returns {array} Array of dirty changes
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	FlexTestAPI.getDirtyChanges = function(mPropertyBag) {
		return ChangesController.getFlexControllerInstance(mPropertyBag.selector)._oChangePersistence.getDirtyChanges();
	};

	/**
	 * Returns a VariantModel instance for testing for the passed application component and with the passed data set.
	 *
	 * @param {object} mPropertyBag - Object with additional information
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - application component owning the VariantModel
	 * @param {object} mPropertyBag.data - Preset data
	 * @returns {Promise<sap.ui.fl.variants.VariantModel>} Resolving to the initialized variant model
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	FlexTestAPI.createVariantModel = function(mPropertyBag) {
		var oFlexController = FlexControllerFactory.createForControl(mPropertyBag.appComponent);
		var oModel = new VariantModel(mPropertyBag.data, {
			flexController: oFlexController,
			appComponent: mPropertyBag.appComponent
		});
		return oModel.initialize()
			.then(function() {
				return oModel;
			});
	};

	return FlexTestAPI;
});