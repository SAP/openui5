/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/designtime/appVariant/ChangeModifier",
	"sap/ui/fl/designtime/appVariant/ModifierUtils"
], function(ChangeModifier, ModifierUtils) {
	"use strict";

	var ModuleModifier = {};

	ModuleModifier.CODE_EXT_PATTERN = {
		NAMESPACE: "/changes/coding/",
		FILETYPE: ".js"
	};

	ModuleModifier.FRAGMENT_PATTERN = {
		NAMESPACE: "/changes/fragments/",
		FILETYPE: ".xml"
	};

	/** Modifier function to loop over all entities passed and adjust module files.
	 *
	 * @param {string} sNewReference New reference for which the module should be valid
	 * @param {map[]} aFiles contains mFiles
	 * @param {string} mFile.fileName Complete file name with name space, file name and file type
	 * @param {string} mFile.content File content as string
	 * @returns {map[]} adjusted aFiles
	 */
	ModuleModifier.modify = function (sNewReference, aFiles) {
		var sOldReference = ModuleModifier._extractOldReference(aFiles);

		if (sOldReference) {
			return aFiles.map(function (mFile) {
				if (ModifierUtils.fileNameMatchesPattern(mFile.fileName, ModuleModifier.CODE_EXT_PATTERN) ||
					ModifierUtils.fileNameMatchesPattern(mFile.fileName, ModuleModifier.FRAGMENT_PATTERN)) {
					mFile.content = ModuleModifier._modifyModuleFile(mFile.content, sOldReference, sNewReference);
				}
				return mFile;
			});
		}
		return aFiles;
	};

	/** Extracts the old reference from the first codeExt file.
	 *
	 * @param {map[]} aFiles contains mFiles
	 * @param {string} mFile.fileName Complete file name with name space, file name and file type
	 * @param {string} mFile.content File content as string
	 * @returns {string} Old reference
	 * @private
	 */
	ModuleModifier._extractOldReference = function (aFiles) {
		var sOldReference = null;
		var oChange;
		aFiles.some(function(mFile) {
			if (ModifierUtils.fileNameMatchesPattern(mFile.fileName, ChangeModifier.CHANGE_PATTERN)) {
				if (mFile.content) {
					oChange = JSON.parse(mFile.content);
					sOldReference = oChange.reference;
					if (sOldReference.endsWith(".Component")) {
						sOldReference = sOldReference.replace(".Component", "");
					}
					return true;
				}
			}
		});
		return sOldReference;
	};


	/** Adjusts references within a single module file (codeExt / fragments)
	 *
	 * @param {string} sModuleFileContent File content of the module file
	 * @param {string} sOldReference Old reference which should be replaced
	 * @param {string} sNewReference New reference for which the module should be valid
	 * @returns {string} File content which must be written into the work space
	 * @private
	 */
	ModuleModifier._modifyModuleFile = function (sModuleFileContent, sOldReference, sNewReference) {
		var sOldReferenceWithSlashes = sOldReference.replace(/\./g, '\/');

		var sModifiedModuleFileContent = sModuleFileContent.replace(new RegExp(sOldReference, 'g'), sNewReference);
		sModifiedModuleFileContent = sModifiedModuleFileContent.replace(new RegExp(sOldReferenceWithSlashes, 'g'), sNewReference);

		return sModifiedModuleFileContent;
	};

	return ModuleModifier;
});