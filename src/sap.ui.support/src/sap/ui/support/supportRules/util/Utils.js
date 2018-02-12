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
			 * Checks if there are internal rules files that has to be loaded
			 * @returns {boolean} whether there could be internal rules to load
			 */
			canLoadInternalRules: function () {
				var sFilePath = jQuery.sap.getModulePath("sap.ui.support").replace("/resources/", "/test-resources/") + "/internal/.ping";
				var bCanLoadInternalRules;

				jQuery.ajax({
					type: "HEAD",
					async: false,
					url: sFilePath,
					success: function () {
						bCanLoadInternalRules =  true;
					},
					error: function() {
						bCanLoadInternalRules =  false;
					}
				});

				return bCanLoadInternalRules;
			}
		};

		return Utils;
	});