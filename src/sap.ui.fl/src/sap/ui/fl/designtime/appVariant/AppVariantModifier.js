/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/base/util/includes"
], function (DescriptorInlineChangeFactory, fnIncludes) {
	"use strict";

	var AppVariantModifier = {};

	var _aCondesableChangeTypes = DescriptorInlineChangeFactory.getCondensableDescriptorChangeTypes();

	var APPVARIANTFILENAME = "/manifest.appdescr_variant";

	function _isCondensable(sChangeType) {
		return fnIncludes(_aCondesableChangeTypes, sChangeType);
	}

	function sortByTimeStamp(oChangeContentA, oChangeContentB) {
		if (oChangeContentA.creation === oChangeContentB.creation) {
			return 0;
		}
		return oChangeContentA.creation > oChangeContentB.creation ? 1 : -1;
	}

	/** Collects all app descriptor changes; orders and condenses them; saves changes in new app variant; all other files remain untouched;
	 * Output order of descriptor changes is important: First the old appdescr_variant changes, second descriptor changes sorted by their creation date, last new app variant changes.
	 * @param {Object} oNewAppVariantManifest App variant in creation
	 * @param {map[]} aFiles Files provided for the app variant creation
	 * @param {string} aFiles.fileName Complete file name with name space, file name and file type
	 * @param {string} aFiles.content File content as string
	 * @returns {map[]} Adjusted array of files; new app variant is always added to this array.
	 */
	AppVariantModifier.modify = function (oNewAppVariantManifest, aFiles) {
		// aFiles could be empty if the basis app has no UI flex, no descriptor changes and if it has no app variant
		if (aFiles.length !== 0) {
			var oSeparatedFiles = AppVariantModifier._separateDescriptorAndManifestChangesFromOtherFiles(aFiles);
			var aRelevantChanges = oSeparatedFiles.manifestChanges
									.concat(oSeparatedFiles.descriptorChanges.sort(sortByTimeStamp))
									.concat(oNewAppVariantManifest.content);
			oNewAppVariantManifest.content = AppVariantModifier._condenseDescriptorChanges(aRelevantChanges);
			aFiles = oSeparatedFiles.noChangeFiles;
		}

		aFiles.push({ fileName: APPVARIANTFILENAME, content: JSON.stringify(oNewAppVariantManifest) });
		return aFiles;
	};

	/**
	 * Separates descriptor from non-descriptor file changes;
	 * @param {map[]} aFiles Files provided for the app variant creation
	 * @returns {Object} Object containing two properties; an array of descriptor changes and an array of filtered files
	 * @private
	 */
	AppVariantModifier._separateDescriptorAndManifestChangesFromOtherFiles = function (aFiles) {
		var aDescriptorChangesContent = [];
		var oManifestChangeContent = [];
		var aOtherFiles = [];

		aFiles.forEach(function (oFile) {

			if (oFile.fileName.startsWith("/descriptorChanges")) {
				var oChangeContent = JSON.parse(oFile.content);
				aDescriptorChangesContent.push(oChangeContent);
			} else if (oFile.fileName === APPVARIANTFILENAME) {
				var oManifestContent = JSON.parse(oFile.content);
				oManifestChangeContent = oManifestContent.content;
			} else {
				aOtherFiles.push(oFile);
			}
		});

		return {
				 descriptorChanges: aDescriptorChangesContent,
				 manifestChanges: oManifestChangeContent,
				 noChangeFiles: aOtherFiles
				};
	};

	/**
	 * Removes duplicates of condensable changes, keeps last change.
	 * @param {map[]} aDescriptorChanges All changes that are descriptor for the new app variant
	 * @returns {map[]} Array of changes where duplicates of condensable changeTypes are removed
	 * @private
	 */
	AppVariantModifier._condenseDescriptorChanges = function (aDescriptorChanges) {
		var aCheckedCondensableChangeTypes = [];
		var aCondensedDescriptorChanges = [];

		aDescriptorChanges.reverse().forEach(function (oChange) {
			var sChangeType = oChange.changeType;
			if (!fnIncludes(aCheckedCondensableChangeTypes, sChangeType)) {
				aCondensedDescriptorChanges.push(oChange);
				if (_isCondensable(sChangeType)) {
					aCheckedCondensableChangeTypes.push(sChangeType);
				}
			}
		});
		return aCondensedDescriptorChanges.reverse();
	};

	return AppVariantModifier;
}, /* bExport= */false);