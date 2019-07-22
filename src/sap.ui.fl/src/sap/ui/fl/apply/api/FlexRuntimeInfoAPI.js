/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/internal/ChangesController"
], function(
	JsControlTreeModifier,
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
	 * @ui5-restricted ui5 controls, tests
	 */
	var FlexRuntimeInfoAPI = /** @lends sap.ui.fl.apply.api.FlexRuntimeInfoAPI */{

		/**
		 * Checks if personalization changes exist for controls.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - an array of {@link sap.ui.fl.Selector}s for which personalization should exist
		 * @param {array} [mPropertyBag.changeTypes] - Additional filter for types of changes that should have existing personalization
		 *
		 * @returns {Promise<boolean>} Promise resolving to a boolean that indicates if personalization changes exist
		 *
		 * @ui5-restricted
		 */
		isPersonalized: function(aSelectors, aChangeTypes) {
			return OldControlPersonalizationAPI.isPersonalized(aSelectors, aChangeTypes);
		},

		/**
		 * Resolves with a promise after all the changes for this control are processed.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Control whose changes are being waited for
		 * @returns {Promise} Promise that resolves when all changes on the control are processed
		 */
		waitForChanges: function(oElement) {
			return ChangesController.getFlexControllerInstance(oElement).waitForChangesToBeApplied(oElement);
		},

		/**
		 * Checks if the flexibility features are supported for a given control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Control to be checked
		 * @returns {boolean} <code>true</code> if flexibility features are supported
		 */
		isFlexSupported: function(oElement) {
			return !!Utils.getAppComponentForControl(oElement);
		},

		/**
		 * Determines if an encompassing variant management control is available.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element which should be tested for an encompassing variant management control
		 * @returns {boolean} <code>true</code> if a variant management control encompasses the given control
		 *
		 * @ui5-restricted
		 */
		hasVariantManagement: function(oElement) {
			return OldControlPersonalizationAPI.hasVariantManagement(oElement);
		}
	};

	return FlexRuntimeInfoAPI;
}, true);
