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
	 * @ui5-restricted UI5 controls, OVP, tests
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
		 * You can either pass a single control, multiple controls or an array with objects that may contain additional configuration.
		 * Only use one of the possible parameters.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.element - Control whose changes are being waited for, the control has to exist
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - An array of {@link sap.ui.fl.Selector}s, whose changes are being waited for, the controls have to exist
		 * @param {object[]} mPropertyBag.complexSelectors - An array containing an object with {@link sap.ui.fl.Selector} and further configuration
		 * @param {sap.ui.fl.Selector} mPropertyBag.complexSelectors.selector - A {@link sap.ui.fl.Selector}
		 * @param {string[]} [mPropertyBag.complexSelectors.changeTypes] - An array containing the change types that will be considered. If empty no filtering will be done
		 * @returns {Promise} Resolves when all changes on the control(s) are processed
		 *
		 * @private
		 * @ui5-restricted
		 */
		waitForChanges: function(mPropertyBag) {
			var aComplexSelectors;
			var oFirstElement;
			if (mPropertyBag.element) {
				aComplexSelectors = [{
					selector: mPropertyBag.element
				}];
				oFirstElement = mPropertyBag.element;
			} else if (mPropertyBag.selectors) {
				aComplexSelectors = mPropertyBag.selectors.map(function(oSelector) {
					return {
						selector: oSelector
					};
				});
				oFirstElement = mPropertyBag.selectors[0];
			} else if (mPropertyBag.complexSelectors) {
				aComplexSelectors = mPropertyBag.complexSelectors;
				oFirstElement = mPropertyBag.complexSelectors[0].selector;
			}
			return ChangesController.getFlexControllerInstance(oFirstElement).waitForChangesToBeApplied(aComplexSelectors);
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
});
