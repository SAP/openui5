/*
 * ! ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils"], function(
	Utils
) {
	"use strict";

	var ChangeModifier = {};

	/** Modifier function to loop over all entities passed and adjust UI changes.
	 *
	 * @param {string} sNewReference New reference for which the changes should be valid
	 * @param {string} sNewVersion New version in which the changes should be valid
	 * @param {sap.ui.fl.Scenario} sScenario Scenario in which the changes must be adjusted
	 * @param {map[]} mFiles
	 * @param {String} mFiles.fileName Complete file name with name space, file name and file type
	 * @param {string} mFiles.content File content as string
	 * @returns {map[]} adjusted mFiles map
	 */
	ChangeModifier.modify = function (sNewReference, sNewVersion, sScenario, mFiles) {
		return mFiles.map(function (oFile) {
			if (ChangeModifier._isTargetedUiChange(oFile.fileName)) {
				oFile.content = ChangeModifier._modifyChangeFile(oFile.content, sNewReference, sNewVersion, sScenario);
			}

			return oFile;
		});
	};

	var _rChangeFolderPattern = new RegExp( "(apps/[^/]*/).*/", "g" );

	/** Check that the file name matches the UI changes file name pattern: "/changes/<changeFileName>.change".
	 *
	 * @param {string} sFileName Complete file name with namespace, file name and file type
	 * @returns {boolean} True if the file name pattern matches the convention
	 * @private
	 */
	ChangeModifier._isTargetedUiChange = function (sFileName) {
		var sChangesPrefix = "/changes/";
		var sChangeFileType = ".change";
		if (sFileName.startsWith(sChangesPrefix) && sFileName.endsWith(sChangeFileType)) {
			// removal the start of the namespace "/changes/"
			sFileName = sFileName.replace(new RegExp("^" + sChangesPrefix), "");
			// removal the ending of the namespace ".change"
			sFileName = sFileName.replace(new RegExp(sChangeFileType + "$"), "");
			// no sub-folder is in the namespace mentioned
			return sFileName.indexOf("/") === -1;
		}

		return false;
	};

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
	 * @param sNamespace Filename which should be adjusted
	 * @returns {string} Adjusted file name
	 * @private
	 */
	ChangeModifier._adjustFileName = function (sNamespace, sNewReference) {

		return sNamespace.replace(_rChangeFolderPattern, "$1appVariants/" + sNewReference + "/changes/");
	};

	return ChangeModifier;
}, /* bExport= */false);
