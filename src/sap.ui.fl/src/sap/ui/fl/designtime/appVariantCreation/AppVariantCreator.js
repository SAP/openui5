/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	return {
		/** Called to adjust the content for an app variant creation
		 *
		 * @param {Object[]} aFiles - files provided for the app variant creation
		 * @param {String} aFiles.fileName - name of the file including the namespace and file type
		 * @param {String} aFiles.content - content of the file
		 * @param {Object} oNewAppVariantManifest - app variant in creation
		 * @param {String} sNewReference - ID of the new app variant
		 * @param {String} sNewVersion - version of the new app variant
		 * @param {String} [sScenario=sap.ui.fl.Scenario.VersionedAppVariant] - scenario in which the app variant is created
		 *
		 * @returns {Promise} Promise resolving with an array of files which are relevant for the new app variant
		 */
		create: function (aFiles, oNewAppVariantManifest, sNewReference, sNewVersion, sScenario) {

			sScenario = sScenario || sap.ui.fl.Scenario.VersionedAppVariant;

			return new Promise(function (resolve, reject) {
				if (!aFiles || !oNewAppVariantManifest || !sNewReference || !sNewVersion) {
					reject("Not all parameters were passed!");
				}

				resolve(aFiles);
			});
		}
	};
}, /* bExport= */false);