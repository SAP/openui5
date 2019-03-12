/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory"
], function (DescriptorInlineChangeFactory) {
	"use strict";

	var AppVariantModifier = {};

	var _aCondesableChangeTypes = DescriptorInlineChangeFactory.getCondensableDescriptorChangeTypes();

	var APPVARIANTFILENAME = "/manifest.appdescr_variant";

	function _isCondensable(sChangeType) {
		return _aCondesableChangeTypes.includes(sChangeType);
	}

	function sortByTimeStamp(oChangeContentA, oChangeContentB) {
		if (oChangeContentA.creation === oChangeContentB.creation) {
			return 0;
		}
		return oChangeContentA.creation > oChangeContentB.creation ? 1 : -1;
	}

	/** Filters, orders and condenses app descriptor changes.
	 * @param {Object} oNewAppVariantManifest App variant in creation
	 * @param {map[]} aFiles Files provided for the app variant creation
	 * @param {String} aFiles.fileName Complete file name with name space, file name and file type
	 * @param {string} aFiles.content File content as string
	 * @returns {map[]} Adjusted array of files; new app variant is always added to this array.
	 */
	AppVariantModifier.modify = function (oNewAppVariantManifest, aFiles) {
		// aFiles could be empty if the basis app has no UI flex, no descriptor changes and if it has no app variant
		if (aFiles.length !== 0) {
			var aChanges = AppVariantModifier._filterDescriptorChanges(aFiles);
			var aDescriptorChanges = aChanges.descriptorChanges;
			var aFiles = aChanges.filteredFiles;
			aDescriptorChanges = aDescriptorChanges.concat(oNewAppVariantManifest.content);
			var aDescriptorChangesCondensed = AppVariantModifier._condenseDescriptorChanges(aDescriptorChanges);

			oNewAppVariantManifest.content = aDescriptorChangesCondensed;
		}

		aFiles.push({ fileName: APPVARIANTFILENAME, content: JSON.stringify(oNewAppVariantManifest) });
		return aFiles;
	};

	/**
	 * Filters input for descriptor file changes; Output order is important: First the old appdescr_variant, second descriptor changes sorted by their creation date.
	 * @param {map[]} aFiles Files provided for the app variant creation
	 * @returns {Object} Object containing two properties; an array of descriptor changes and an array of filtered files
	 */
	AppVariantModifier._filterDescriptorChanges = function (aFiles) {
		var aDescriptorChangesContent = [];
		var aFilteredFiles = [];
		aFiles.forEach(function (oFile) {
			if (oFile.fileName.startsWith("/descriptorChanges")) {
				var oChangeContent = JSON.parse(oFile.content);
				aDescriptorChangesContent.push(oChangeContent);
			} else if (oFile.fileName !== APPVARIANTFILENAME) {
				aFilteredFiles.push(oFile);
			}
		});
		aDescriptorChangesContent.sort(sortByTimeStamp);

		aFiles.forEach(function (oFile) {
			if (oFile.fileName === APPVARIANTFILENAME) {
				var oManifestContent = JSON.parse(oFile.content);
				var oManifestChangeContent = oManifestContent.content;
				aDescriptorChangesContent = oManifestChangeContent.concat(aDescriptorChangesContent);
			}
		});
		return { descriptorChanges: aDescriptorChangesContent, filteredFiles: aFilteredFiles };
	};

	/**
	 * Removes duplicates of condensable changes, keeps last change.
	 * @param {map[]} aDescriptorChanges All changes that are descriptor for the new app variant
	 * @returns {map[]} Array of changes where duplicates of condensable changeTypes are removed
	 */
	AppVariantModifier._condenseDescriptorChanges = function (aDescriptorChanges) {
		var aCheckedCondensableChangeTypes = [];
		var aCondensedDescriptorChanges = [];

		aDescriptorChanges.reverse().forEach(function (oChange) {
			var sChangeType = oChange.changeType;
			if (!aCheckedCondensableChangeTypes.includes(sChangeType)) {
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