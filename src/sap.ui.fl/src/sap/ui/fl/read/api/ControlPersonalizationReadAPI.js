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
	 * @name sap.ui.fl.read.api.ControlPersonalizationReadAPI
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @public
	 */
	var ControlPersonalizationReadAPI = {

		/**
		 * Checks if personalization changes exists for control.
		 *
		 * @param {sap.ui.core.Element[] | map[]} aControls - an array of instances of controls, a map with control IDs including a app component or a mixture for which personalization exists
		 * @param {array} [aChangeTypes] - Types of changes that have existing personalization.
		 * @param {sap.ui.core.Component} aControls.appComponent - Application component of the controls at runtime in case a map has been used
		 * @param {string} aControls.id - ID of the control in case a map has been used to specify the control
		 *
		 * @returns {Promise} Promise resolving with true if personalization changes exists, otherwise false.
		 *
		 * @method sap.ui.fl.read.api.ControlPersonalizationReadAPI.isPersonalized
		 * @public
		 */
		isPersonalized: function(aControls, aChangeTypes) {
			return OldControlPersonalizationAPI.isPersonalized.apply(OldControlPersonalizationAPI, arguments);
		}

	};
	return ControlPersonalizationReadAPI;
}, true);
