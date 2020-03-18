/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory"
], function(
	FlexState,
	ChangesController,
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

	return FlexTestAPI;
});