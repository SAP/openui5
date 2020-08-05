/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/ChangesController"
], function(
	OldControlPersonalizationAPI,
	Utils,
	ChangesController
) {
	"use strict";

	/**
	 * Provides an API to get specific information about the <code>sap.ui.fl</code> runtime.
	 *
	 * @namespace sap.ui.fl.apply.api.FlexRuntimeInfoAPI
	 * @experimental Since 1.67
	 * @since 1.67
	 * @private
	 * @ui5-restricted ui5 controls, OVP, tests
	 */
	var FlexRuntimeInfoAPI = /** @lends sap.ui.fl.apply.api.FlexRuntimeInfoAPI */{

		/**
		 * Checks if personalization changes exist for controls.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - An array of {@link sap.ui.fl.Selector}s for which personalization should exist
		 * @param {array} [mPropertyBag.changeTypes] - Additional filter for types of changes that should have existing personalization
		 *
		 * @returns {Promise<boolean>} Promise resolving to a boolean that indicates if personalization changes exist
		 *
		 * @private
		 * @ui5-restricted
		 */
		isPersonalized: function(mPropertyBag) {
			return OldControlPersonalizationAPI.isPersonalized(mPropertyBag.selectors, mPropertyBag.changeTypes);
		},

		/**
		 * Resolves with a promise after all the changes for all controls that are passed have been processed.
		 * You can either pass a single control or multiple, don't mix selectors and element parameters.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.element - Control whose changes are being waited for, the control has to exist
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - An array of {@link sap.ui.fl.Selector}s, whose changes are being waited for, the controls have to exist
		 * @returns {Promise} Promise that resolves when all changes on the control are processed
		 *
		 * @private
		 * @ui5-restricted
		 */
		waitForChanges: function(mPropertyBag) {
			var oFirstElement = mPropertyBag.element || mPropertyBag.selectors[0];
			var vWaitForSelector = mPropertyBag.element || mPropertyBag.selectors;
			return ChangesController.getFlexControllerInstance(oFirstElement).waitForChangesToBeApplied(vWaitForSelector);
		},

		/**
		 * Checks if the flexibility features are supported for a given control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Control to be checked
		 * @returns {boolean} <code>true</code> if flexibility features are supported
		 *
		 * @private
		 * @ui5-restricted
		 */
		isFlexSupported: function(mPropertyBag) {
			return !!Utils.getAppComponentForControl(mPropertyBag.element);
		},

		/**
		 * Determines if an encompassing variant management control is available.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element which should be tested for an encompassing variant management control
		 * @returns {boolean} <code>true</code> if a variant management control encompasses the given control
		 *
		 * @private
		 * @ui5-restricted
		 */
		hasVariantManagement: function(mPropertyBag) {
			return OldControlPersonalizationAPI.hasVariantManagement(mPropertyBag.element);
		}
	};

	return FlexRuntimeInfoAPI;
}, true);
