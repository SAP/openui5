/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/designtime/appVariant/ModifierUtils"
], function(
	Utils,
	ModifierUtils
) {
	"use strict";

	var ChangeModifier = {};

	ChangeModifier.CHANGE_PATTERN = {
		NAMESPACE: "/changes/",
		FILETYPE: ".change"
	};

	/** Modifier function to loop over all entities passed and adjust UI changes.
	 *
	 * @param {string} sNewReference New reference for which the changes should be valid
	 * @param {string} sNewVersion New version in which the changes should be valid
	 * @param {sap.ui.fl.Scenario} sScenario Scenario in which the changes must be adjusted
	 * @param {map[]} aFiles contains mFiles
	 * @param {string} mFile.fileName Complete file name with name space, file name and file type
	 * @param {string} mFile.content File content as string
	 * @returns {map[]} adjusted aFiles map
	 */
	ChangeModifier.modify = function (sNewReference, sNewVersion, sScenario, aFiles) {
		return aFiles.map(function (mFile) {
			if (ModifierUtils.fileNameMatchesPattern(mFile.fileName, ChangeModifier.CHANGE_PATTERN)) {
				mFile.content = ChangeModifier._modifyChangeFile(mFile.content, sNewReference, sNewVersion, sScenario);
			}

			return mFile;
		});
	};

	var _rChangeFolderPattern = new RegExp("(apps/[^/]*/).*/", "g");

	/** Adjusts all fields within a single change file.
	 *
	 * @param {string} sChangeFileContent File content of the change file
	 * @param {string} sNewReference New reference for which the changes should be valid
	 * @param {string} sNewVersion New version in which the changes should be valid
	 * @param {sap.ui.fl.Scenario} sScenario Scenario in which the changes must be adjusted
	 * @returns {string} File content which must be written into the work space
	 * @private
	 */
	ChangeModifier._modifyChangeFile = function (sChangeFileContent, sNewReference, sNewVersion, sScenario) {
		var oChange = JSON.parse(sChangeFileContent);

		oChange.reference = sNewReference;
		oChange.validAppVersions = Utils.getValidAppVersions({
			appVersion: sNewVersion,
			developerMode: true,
			scenario: sScenario
		});

		oChange.support.generator = "appVariant.UiChangeModifier";
		oChange.support.user = "";
		oChange.projectId = sNewReference;
		oChange.packageName = "";
		oChange.namespace = ChangeModifier._adjustFileName(oChange.namespace, sNewReference);

		return JSON.stringify(oChange);
	};

	/** Adjusts the file name by replacing the folder structure containing the old reference by the new one;
	 *  The namespace passed as an input parameter needs to follow either of the these patterns:
	 *  - apps/<oldReference>/changes/<fileName>.change (in case the basis was an app descriptor)
	 *  - apps/<base app descriptor>/appVariants/<oldReference>/changes/<fileName>.change (in case the basis was an app variant)
	 *  The result will have the following pattern:
	 *  - apps/<base app descriptor>/appVariants/<newReference>/changes/<fileName>.change
	 *
	 * @param {string} sNamespace Filename which should be adjusted
	 * @param {string} sNewReference New reference for which the changes should be valid
	 * @returns {string} Adjusted file name
	 * @private
	 */
	ChangeModifier._adjustFileName = function (sNamespace, sNewReference) {
		return sNamespace.replace(_rChangeFolderPattern, "$1appVariants/" + sNewReference + "/changes/");
	};

	return ChangeModifier;
});