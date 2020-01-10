/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/designtime/appVariant/ChangeModifier",
	"sap/ui/fl/designtime/appVariant/AppVariantModifier",
	"sap/ui/fl/designtime/appVariant/ModuleModifier"
], function(
	ChangeModifier,
	AppVariantModifier,
	ModuleModifier
) {
	"use strict";

	var AppVariantUtils = {};

	/** Adjusts the content for the creation of an app variant.
	 *
	 * @param {map[]} aFiles Files provided for the app variant creation
	 * @param {string} aFiles.fileName Name of the file including the namespace and file type
	 * @param {string} aFiles.content Content of the file
	 * @param {Object} oNewAppVariantManifest App variant in creation
	 * @param {string} sNewReference ID of the new app variant
	 * @param {string} sNewVersion Version of the new app variant
	 * @param {string} [sScenario=sap.ui.fl.Scenario.VersionedAppVariant] Scenario in which the app variant is created
	 *
	 * @returns {Promise} Promise resolving with an array of all files that are necessary to create a new app variant
	 */
	AppVariantUtils.prepareContent = function (aFiles, oNewAppVariantManifest, sNewReference, sNewVersion, sScenario) {
		sScenario = sScenario || sap.ui.fl.Scenario.VersionedAppVariant;

		return new Promise(function (resolve, reject) {
			if (!aFiles || !oNewAppVariantManifest || !sNewReference || !sNewVersion) {
				reject("Not all parameters were passed!");
			}

			resolve(aFiles);
		})
		.then(ModuleModifier.modify.bind(ModuleModifier, sNewReference))
		.then(ChangeModifier.modify.bind(ChangeModifier, sNewReference, sNewVersion, sScenario))
		.then(AppVariantModifier.modify.bind(AppVariantModifier, oNewAppVariantManifest));
	};

	return AppVariantUtils;
});