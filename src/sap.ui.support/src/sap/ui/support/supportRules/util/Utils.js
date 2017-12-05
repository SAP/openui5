/*!
 * ${copyright}
 */

/**
 * Contains functionality that may be used trough the whole Support Assistant
 */
sap.ui.define([],
	function() {
		"use strict";

		var Utils = {

			/**
			 * Contains Applications version information.
			 *
			 * @public
			 * @returns {object} result Returns Applications version information.
			 */
			getApplicationVersionInfo: function() {

				return sap.ui.getVersionInfo();
			},

			/**
			 * Checks the distribution of UI5 that the  Application is using
			 *
			 * @public
			 * @param {object} oVersionInfo information about the UI5 freawork used by the Application
			 * @returns {boolean} result  true if the distribution of application is OPENUI5
			 */
			isDistributionOpenUI5: function (oVersionInfo) {
				var bResult = false,
					sFrameworkInfo = "";

				try {
					sFrameworkInfo = oVersionInfo.gav ? oVersionInfo.gav : oVersionInfo.name;
					bResult = sFrameworkInfo.indexOf('openui5') !== -1 ? true : false;
				} catch (e) {
					 return bResult;
				}

				return bResult;
			},

			/**
			 * Contains all loaded libraries for the application.
			 *
			 * @public
			 * @returns {object} oloadedLibraries Loaded libraries in the current state of the application
			 */
			getLoadedLibraries: function() {
				var oloadedLibraries = sap.ui.getCore().getLoadedLibraries();

				return oloadedLibraries;
			}
		};

		return Utils;
	});