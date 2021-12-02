/*!
 * ${copyright}
 */

/**
 * Contains functionality that may be used trough the whole Support Assistant
 */
sap.ui.define(["sap/ui/thirdparty/jquery"],
	function(jQuery) {
		"use strict";
		var sInternalPingFilePath = sap.ui.require.toUrl("sap/ui/support").replace(/(^|\/)resources\//, "$1test-resources/") + "/internal/.ping";

		var Utils = {
			bCanLoadInternalRules: null,

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
				var that = this;

				if (that.bCanLoadInternalRules !== null) {
					return that.bCanLoadInternalRules;
				}

				jQuery.ajax({
					type: "HEAD",
					async: false,
					url: sInternalPingFilePath,
					success: function () {
						that.bCanLoadInternalRules = true;
					},
					error: function() {
						that.bCanLoadInternalRules = false;
					}
				});

				return that.bCanLoadInternalRules;
			},

			/**
			 * Checks if there are internal rules files that has to be loaded
			 * @returns {Promise} The returned promise resolves with an argument showing
			 * whether internal rules can be loaded or not
			 */
			canLoadInternalRulesAsync: function () {
				var that = this;

				var oInternalRulesPromise = new Promise(function (resolve) {

					if (that.bCanLoadInternalRules !== null) {
						resolve(that.bCanLoadInternalRules);

						return;
					}


					jQuery.ajax({
						type: "HEAD",
						url: sInternalPingFilePath,
						success: function () {
							that.bCanLoadInternalRules = true;
							resolve(that.bCanLoadInternalRules);
						},
						error: function() {
							that.bCanLoadInternalRules = false;
							resolve(that.bCanLoadInternalRules);
						}
					});
				});

				return oInternalRulesPromise;
			},

			/**
			 * Generates v4 uuid (based on random numbers).
			 * @return {string} The generated v4 uuid
			 */
			generateUuidV4: function () {
				var sUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (sPosition) {
					var iRandom = Math.random() * 16 | 0;

					if (sPosition === 'y') {
						iRandom = iRandom & 0x3 | 0x8;
					}

					return iRandom.toString(16);
				});

				return sUuid;
			}
		};

		return Utils;
	});