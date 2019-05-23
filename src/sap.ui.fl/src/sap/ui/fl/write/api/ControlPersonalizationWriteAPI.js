/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/ControlPersonalizationAPI"
], function(
	OldControlPersonalizationAPI
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
	 * @since 1.56
	 * @private
	 * @ui5-restricted
	 * @property {sap.ui.core.Element} selectorControl The control object to be used as selector for the change
	 * @property {object} changeSpecificData The map of change-specific data to perform a flex change
	 * @property {string} changeSpecificData.changeType The change type for which a change handler is registered
	 */

	var ControlPersonalizationWriteAPI = {

		/**
		 * Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control.
		 *
		 * @param {object} mPropertyBag - Changes along with other settings that need to be added
		 * @param {array} mPropertyBag.controlChanges - Array of control changes of type {@link sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange}
		 * @param {boolean} [mPropertyBag.ignoreVariantManagement=false] - If flag is set to true then variant management will be ignored
		 *
		 * @returns {Promise} Returns Promise resolving to an array of successfully applied changes,
		 * after the changes have been written to the map of dirty changes and applied to the control
		 *
		 * @method sap.ui.fl.write.api.ControlPersonalizationWriteAPI.addPersonalizationChanges
		 * @public
		 */
		addPersonalizationChanges: function(mPropertyBag) {
			return OldControlPersonalizationAPI.addPersonalizationChanges.apply(OldControlPersonalizationAPI, arguments);
		},

		/**
		 * Deletes changes recorded for control. Changes to be deleted can be filtered by specification of change type(s).
		 *
		 * @param {sap.ui.core.Element[] | map[]} aControls - an array of instances of controls, a map with control IDs including a app component or a mixture for which the reset shall take place
		 * @param {sap.ui.core.Component} aControls.appComponent - Application component of the controls at runtime in case a map has been used
		 * @param {string} aControls.id - ID of the control in case a map has been used to specify the control
		 * @param {String[]} [aChangeTypes] - Types of changes that shall be deleted
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place and changes are reverted
		 *
		 * @method sap.ui.fl.write.api.ControlPersonalizationWriteAPI.resetChanges
		 * @public
		 */
		resetChanges: function(aControls, aChangeTypes) {
			return OldControlPersonalizationAPI.resetChanges.apply(OldControlPersonalizationAPI, arguments);
		},

		/**
		 * Saves unsaved changes added to {@link sap.ui.fl.ChangePersistence}.
		 *
		 * @param {array} aChanges - Array of changes to be saved
		 * @param {sap.ui.base.ManagedObject} oManagedObject - A managed object instance which has an application component responsible, on which changes need to be saved
		 *
		 * @returns {Promise} Returns Promise which is resolved when the passed array of changes have been saved
		 *
		 * @method sap.ui.fl.write.api.ControlPersonalizationWriteAPI.saveChanges
		 * @public
		 */
		saveChanges: function(aChanges, oManagedObject) {
			//TODO really manage object or Element|Component, also control equivalent?
			//TODO make "control" first parameter
			return OldControlPersonalizationAPI.saveChanges.apply(OldControlPersonalizationAPI, arguments);
		}
	};
	return ControlPersonalizationWriteAPI;
}, true);
