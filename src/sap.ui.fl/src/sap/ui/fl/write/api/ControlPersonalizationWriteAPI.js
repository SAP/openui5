/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/fl/Utils"
], function(
	OldControlPersonalizationAPI,
	Utils
) {
	"use strict";

	/**
	 * Provides an API for controls to implement personalization.
	 *
	 * @namespace sap.ui.fl.write.api.ControlPersonalizationWriteAPI
	 * @experimental Since 1.69
	 * @since 1.69
	 * @private
	 * @ui5-restricted UI5 controls that allow personalization
	 */

	/**
	 * Object containing attributes of a change, along with the control to which this change should be applied.
	 *
	 * @typedef {object} sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange
	 * @property {sap.ui.core.Element} selectorElement - Control object to be used as the selector for the change
	 * @property {object} changeSpecificData - Map of change-specific data to perform a flex change
	 * @property {string} changeSpecificData.changeType - Change type for which a change handler is registered
	 * @property {object} changeSpecificData.content - Content for the change, see {@link sap.ui.fl.Change#createInitialFileContent}
	 * @since 1.69
	 * @private
	 * @ui5-restricted UI5 controls that allow personalization
	 */

	var ControlPersonalizationWriteAPI = /** @lends sap.ui.fl.write.api.ControlPersonalizationWriteAPI */{

		/**
		 * Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange[]} mPropertyBag.changes - Array of control changes of type {@link sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange}
		 * @param {boolean} [mPropertyBag.ignoreVariantManagement=false] - If flag is set to <code>true</code>, the changes will not belong to any variant, otherwise it will be detected if the changes are done in the context of variant mangement
		 *
		 * @returns {Promise} Promise resolving to an array of successfully applied changes, after the changes have been written to the map of dirty changes and applied to the control
		 * @private
		 * @ui5-restricted
		 */
		add: function(mPropertyBag) {
			mPropertyBag.changes.forEach(function(oPersonalizationChange) {
				oPersonalizationChange.selectorControl = oPersonalizationChange.selectorElement;
			});
			// old API is still using the old name
			mPropertyBag.controlChanges = mPropertyBag.changes;
			return OldControlPersonalizationAPI.addPersonalizationChanges(mPropertyBag);
		},

		/**
		 * Deletes changes recorded for the provided selectors. Changes to be deleted can be filtered by specification of change type(s).
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - Array of selectors, at least one selector is necessary
		 * @param {String[]} [mPropertyBag.changeTypes] - Types of changes to be deleted
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place and changes are reverted
		 *
		 * @private
		 * @ui5-restricted
		 */
		reset: function(mPropertyBag) {
			mPropertyBag.selectors = mPropertyBag.selectors || [];
			return OldControlPersonalizationAPI.resetChanges(mPropertyBag.selectors, mPropertyBag.changeTypes);
		},

		/**
		 * Saves unsaved changes to the backend service.
		 *
	 	 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {String[]} [mPropertyBag.changes] - Array of changes to be saved; if not provided, all unsaved changes will be saved
		 *
		 * @returns {Promise} Promise that is resolved when the changes have been saved
		 *
		 * @private
		 * @ui5-restricted
		 */
		save: function(mPropertyBag) {
			var oAppComponent = mPropertyBag.selector.appComponent || Utils.getAppComponentForControl(mPropertyBag.selector);
			return OldControlPersonalizationAPI.saveChanges(mPropertyBag.changes, oAppComponent);
		},

		/**
		 * Builds the {@link sap.ui.fl.Selector} for an element that is not yet available.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance to retrieve the app component
		 * @param {string} mPropertyBag.elementId - ID of the selector
		 * @param {string} mPropertyBag.elementType - Type of the selector
		 * @returns {sap.ui.fl.ElementSelector} - Object that can be used as a {@link sap.ui.fl.Selector}
		 * @private
		 * @ui5-restricted
		 */
		buildSelectorFromElementIdAndType: function(mPropertyBag) {
			var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.element);
			if (!oAppComponent || !mPropertyBag.elementId || !mPropertyBag.elementType) {
				throw new Error("Not enough information given to build selector.");
			}
			return {
				elementId: mPropertyBag.elementId,
				elementType: mPropertyBag.elementType,
				appComponent: oAppComponent,
				// included for backwards compatibility
				id: mPropertyBag.elementId,
				controlType: mPropertyBag.elementType
			};
		}
	};

	return ControlPersonalizationWriteAPI;
}, true);
