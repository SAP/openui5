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
	 * Provides an API to handle specific functionality for personalized changes.
	 *
	 * @namespace
	 * @name sap.ui.fl.apply.api.FlexRuntimeInfoAPI
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @public
	 */
	var FlexRuntimeInfoAPI = {

		/**
		 * Checks if personalization changes exists for control.
		 *
		 * @param {sap.ui.core.Element[] | map[]} aSelectors - an array of instances of controls, a map with control IDs including a app component or a mixture for which personalization exists
		 * @param {sap.ui.core.Component} aSelectors.appComponent - Application component of the controls at runtime in case a map has been used
		 * @param {string} aSelectors.id - ID of the control in case a map has been used to specify the control
		 * @param {array} [aChangeTypes] - Types of changes that have existing personalization.
		 *
		 * @returns {Promise<boolean>} Promise resolving to a boolean indicating if personalization changes exist
		 *
		 * @method sap.ui.fl.apply.api.FlexRuntimeInfoAPI.isPersonalized
		 * @public
		 */
		isPersonalized: function(aSelectors, aChangeTypes) {
			return OldControlPersonalizationAPI.isPersonalized(aSelectors, aChangeTypes);
		},

		/**
		 * Resolves with a Promise after all the changes for this control are processed.
		 *
		 * @param {sap.ui.core.Element} oElement The control whose changes are being waited for
		 * @returns {Promise} Returns a promise that resolves when all changes on the control are processed
		 */
		waitForChanges: function(oElement) {
			return ChangesController.getFlexControllerInstance(oElement).waitForChangesToBeApplied(oElement);
		},

		/**
		 * Checks if the flex features are supported for a given control
		 *
		 * @param {sap.ui.core.Element} oElement control to check
		 * @returns {boolean} Returns true if flex features are supported
		 */
		isFlexSupported: function(oElement) {
			return !!Utils.getAppComponentForControl(oElement);
		},

		/**
		 * Determines the availability of an encompassing variant management control.
		 *
		 * @param {sap.ui.core.Element} oElement - The element which should be tested for an encompassing variant management control
		 *
		 * @returns {boolean} Returns true if a variant management control is encompassing the given control, else false
		 *
		 * @method sap.ui.fl.apply.api.FlexRuntimeInfoAPI.hasVariantManagement
		 * @public
		 */
		hasVariantManagement: function(oElement) {
			return OldControlPersonalizationAPI.hasVariantManagement(oElement);
		}

		/**
		 *
		 * @param {sap.ui.base.ManagedObject|Element|string} vControl - Control or ID string for which the selector should be determined
		 * @param {sap.ui.core.Control|sap.ui.core.Component} oAppComponentOrControl - Component or control from which the component can be dertermined
		 * @param {object} [mAdditionalSelectorInformation] - Additional mapped data which is added to the selector
		 * @returns {object} oSelector
		 * @returns {string} oSelector.id - ID used for determination of the flexibility target
		 * @returns {boolean} oSelector.idIsLocal - <code>true</code> if the selector.id has to be concatenated with the application component ID while applying the change
		 * @throws {Error} In case no control could be determined an error is thrown
		 */
		// getChangeSelector: function (vControl, oAppComponentOrControl, mAdditionalSelectorInformation) {
		// 	var oAppComponent = Utils.getAppComponentForControl(oAppComponentOrControl);
		// 	return JsControlTreeModifier.getSelector(vControl, oAppComponent, mAdditionalSelectorInformation);
		// }
		// check if really needed, controls should use .completeChangeContent
	};

	return FlexRuntimeInfoAPI;
}, true);
