/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	var ModifierUtils = {};

	/** Checks that the file name matches the given pattern: e.g.
	 * "/changes/<changeFileName>.change"
	 * "/changes/coding/<codeExtName>.js"
	 * "/changes/fragments/<fragmentName>.xml"
	 *
	 * @param {string} sFileName Complete file name with namespace, file name and file type
	 * @param {map} mPattern
	 * @param {string} mPattern.NAMESPACE The namespace which gets validated
	 * @param {string} mPattern.FILETYPE The file type which gets validated
	 * @returns {boolean} True if the file name pattern matches the convention
	 */
	ModifierUtils.fileNameMatchesPattern = function (sFileName, mPattern) {
		if (sFileName.startsWith(mPattern.NAMESPACE) && sFileName.endsWith(mPattern.FILETYPE)) {
			// removing the start of the namespace: e.g. "/changes/coding/"
			sFileName = sFileName.replace(new RegExp("^" + mPattern.NAMESPACE), "");
			// removing the ending of the namespace: e.g. ".js"
			sFileName = sFileName.replace(new RegExp(mPattern.FILETYPE + "$"), "");
			// no sub-folder is mentioned in the namespace
			return sFileName.indexOf("/") === -1;
		}
		return false;
	};
	return ModifierUtils;
});