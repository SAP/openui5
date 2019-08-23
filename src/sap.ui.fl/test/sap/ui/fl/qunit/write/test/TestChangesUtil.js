/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController"
], function(
	ChangesController
) {
	"use strict";
	/**
	 * This utility exposes some internal functions only for testing purposes.
	 *
	 */
	var TestChangesUtil = {
		/**
		 * Returns dirty changes on the flex persistence of the passed selector.
		 *
		 * @param {mPropertyBag}
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @returns {array} Array of dirty changes
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getDirtyChanges: function(mPropertyBag) {
			return ChangesController.getFlexControllerInstance(mPropertyBag.selector)
				._oChangePersistence.getDirtyChanges();
		}
	};
	return TestChangesUtil;
}, true);
