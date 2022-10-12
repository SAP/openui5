/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer"
], function(
	FlexState,
	ChangesController,
	ChangesWriteAPI,
	VariantModel,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer
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

	/**
	 * Creates a FlexObject with the given data and calls the complete change content function
	 *
	 * @param {object} mPropertyBag - Object with additional information
	 * @param {object} mPropertyBag.changeSpecificData - Change Information
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Control instance for which the flex object should be created
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - App component instance
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject>} FlexObject instance
	 */
	FlexTestAPI.createFlexObject = function(mPropertyBag) {
		// TODO: this logs an error when there is no proper app component
		if (mPropertyBag.appComponent) {
			mPropertyBag.selector.appComponent = mPropertyBag.appComponent;
		}
		mPropertyBag.changeSpecificData.layer = mPropertyBag.changeSpecificData.layer || Layer.CUSTOMER;
		return ChangesWriteAPI.create({
			changeSpecificData: mPropertyBag.changeSpecificData,
			selector: mPropertyBag.selector
		});
	};

	return FlexTestAPI;
});