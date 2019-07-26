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
	 * Provides an API to handle specific functionality for personalized changes.
	 *
	 * @namespace
	 * @name sap.ui.fl.write.api.ControlPersonalizationWriteAPI
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @public
	 */

	/**
	 * Object containing attributes of a change, along with the control to which this change should be applied.
	 *
	 * @typedef {object} sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange
	 * @since 1.68
	 * @private
	 * @ui5-restricted
	 * @property {sap.ui.core.Element} selectorElement The control object to be used as selector for the change
	 * @property {object} changeSpecificData The map of change-specific data to perform a flex change
	 * @property {string} changeSpecificData.changeType The change type for which a change handler is registered
	 */

	var ControlPersonalizationWriteAPI = {

		/**
		 * Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control.
		 *
		 * @param {object} mPropertyBag - Changes along with other settings that need to be added
		 * @param {sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange[]} mPropertyBag.changes - Array of control changes of type {@link sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange}
		 * @param {boolean} [mPropertyBag.ignoreVariantManagement=false] - If flag is set to true then variant management will be ignored
		 *
		 * @returns {Promise} Returns Promise resolving to an array of successfully applied changes,
		 * after the changes have been written to the map of dirty changes and applied to the control
		 *
		 * @method sap.ui.fl.write.api.ControlPersonalizationWriteAPI.addPersonalizationChanges
		 * @public
		 */
		add: function(mPropertyBag) {
			mPropertyBag.controlChanges.forEach(function(oPersonalizationChange) {
				oPersonalizationChange.selectorControl = oPersonalizationChange.selectorElement;
			});
			return OldControlPersonalizationAPI.addPersonalizationChanges(mPropertyBag);
		},

		/**
		 * Deletes changes recorded for control. Changes to be deleted can be filtered by specification of change type(s).
		 *
		 * @param {sap.ui.fl.Selector[]} aSelectors - an array of selectors
		 * @param {object} [mPropertyBag] - contains optional data for reset
		 * @param {String[]} [mPropertyBag.changeTypes] - Types of changes that shall be deleted
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place and changes are reverted
		 *
		 * @method sap.ui.fl.write.api.ControlPersonalizationWriteAPI.resetChanges
		 * @public
		 */
		reset: function(mPropertyBag) {
			mPropertyBag.selectors = mPropertyBag.selectors || [];
			return OldControlPersonalizationAPI.resetChanges(mPropertyBag.selectors, mPropertyBag.changeTypes);
		},

		/**
		 * Saves unsaved changes added to {@link sap.ui.fl.ChangePersistence}.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - a selector
		 * @param {array} aChanges - Array of changes to be saved
		 *
		 * @returns {Promise} Returns Promise which is resolved when the passed array of changes have been saved
		 *
		 * @method sap.ui.fl.write.api.ControlPersonalizationWriteAPI.saveChanges
		 * @public
		 */
		save: function(mPropertyBag) {
			var oAppComponent = mPropertyBag.selector.appComponent || Utils.getAppComponentForControl(mPropertyBag.selector);
			return OldControlPersonalizationAPI.saveChanges(mPropertyBag.changes, oAppComponent);
		},

		/**
		 * Builds an object of type {@link sap.ui.fl.Selector} with elementId, elementType and appComponent
		 *
		 * @param {sap.ui.core.Element} oElement - Element instance to retrieve the app component
		 * @param {object} mPropertyBag - Contains additional information needed to build the control equivalent
		 * @param {string} mPropertyBag.elementId - Id of the control
		 * @param {string} mPropertyBag.elementType - Type of the control
		 * @returns {object} Returns object of type {@link sap.ui.fl.Selector}
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
