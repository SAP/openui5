/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Settings"
], function(
	FlexInfoSession,
	Settings
) {
	"use strict";

	/**
	 * API module to check for various flexibility features at a very early stage of the application startup.
	 *
	 * @namespace
	 * @alias module:sap/ui/fl/initial/api/InitialFlexAPI
	 * @since 1.132
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var InitialFlexAPI = {};

	/**
	 * Checks if key user rights are available for the current user.
	 * Application developers can use this API to decide if the key user adaptation
	 * feature should be visible to the current user. This only applies if key user adaptation
	 * should be handled standalone without an SAP Fiori launchpad.
	 *
	 * @returns {Promise<boolean>} Resolves to a boolean indicating if the key user role is assigned to the user
	 * @public
	 */
	InitialFlexAPI.isKeyUser = async function() {
		const oSettings = await Settings.getInstance();
		return oSettings.getIsKeyUser();
	};

	/**
	 * Returns the version that is used for Flexibility Services
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Reference of the application
	 * @returns {string} Version of Flexibility Services
	 *
	 * @private
	 * @ui5-restricted sap.ushell
	 */
	InitialFlexAPI.getFlexVersion = function(mPropertyBag) {
		return FlexInfoSession.getByReference(mPropertyBag.reference)?.version;
	};

	return InitialFlexAPI;
});
