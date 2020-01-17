/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge"
], function(
	merge
) {
	"use strict";

	var oStorageResultMerger = {};

	/**
	 * Concatenates all flex objects from a list of flex data request responses, into a passed result array and removes duplicates.
	 *
	 * @param {object[]} aResponses List of responses containing flex object type properties to be concatenated
	 * @param {string} sType Type of flex object signified by object property
	 * @returns {object[]} Merged array of flex objects
	 * @private
	 * @ui5-restricted sap.ui.fl.Cache, sap.ui.fl.apply._internal.flexState.FlexState
	 */
	function _concatFlexObjects(aResponses, sType) {
		var aFlexObjects = aResponses.reduce(function (aFlexObjects, oResponse) {
			if (oResponse[sType]) {
				return aFlexObjects.concat(oResponse[sType]);
			}
			return aFlexObjects;
		}, []);

		var aChangeIds = [];
		return aFlexObjects.filter(function (oChange) {
			var sFileName = oChange.fileName;
			var bChangeAlreadyAdded = aChangeIds.indexOf(sFileName) !== -1;
			if (bChangeAlreadyAdded) {
				return false;
			}

			aChangeIds.push(sFileName);
			return true;
		});
	}

	/**
	 * Concatenates all ui2personalization from a list of flex data request responses into a passed result object and removed duplicates.
	 *
	 * @param {object[]} aResponses List of responses containing a changes property to be concatenated
	 * @param {object[]} aResponses.ui2personalization List of the change definitions
	 * @returns {object[]} Merged array of ui2personalization
	 * @private
	 * @ui5-restricted sap.ui.fl.Cache
	 */
	function _concatUi2personalization(aResponses) {
		return aResponses.reduce(function (oUi2Section, oResponse) {
			return merge({}, oUi2Section, oResponse.ui2personalization);
		}, {});
	}

	/**
	 * Concatenates all Etag from a list of flex data request responses headers into a passed result string.
	 *
	 * @param {object[]} aResponses List of responses containing Etag header to be concatenated
	 * @param {string} [aResponses.etag] Etag value
	 * @returns {string | null} Concatenated string of all etag values or null if no responses headers carry a etag value
	 * @private
	 * @ui5-restricted sap.ui.fl.Cache
	 */
	function _concatEtag(aResponses) {
		return aResponses.reduce(function (sCacheKey, oResponse) {
			return oResponse.cacheKey ? sCacheKey += oResponse.cacheKey : sCacheKey;
		}, "") || null;
	}

	/**
	 * Merges the results from all involved connectors.
	 *
	 * @param {object} mPropertyBag Further properties
	 * @param {object[]} mPropertyBag.responses All responses provided by the different connectors
	 * @param {boolean} mPropertyBag.variantSectionSufficient Flag if a provided variant section can be used directly
	 * @returns {object} Merged result
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl._internal.Storage
	 */
	oStorageResultMerger.merge = function(mPropertyBag) {
		return {
			appDescriptorChanges: _concatFlexObjects(mPropertyBag.responses, "appDescriptorChanges"),
			changes: _concatFlexObjects(mPropertyBag.responses, "changes"),
			ui2personalization: _concatUi2personalization(mPropertyBag.responses),
			variants: _concatFlexObjects(mPropertyBag.responses, "variants"),
			variantChanges: _concatFlexObjects(mPropertyBag.responses, "variantChanges"),
			variantDependentControlChanges: _concatFlexObjects(mPropertyBag.responses, "variantDependentControlChanges"),
			variantManagementChanges: _concatFlexObjects(mPropertyBag.responses, "variantManagementChanges"),
			cacheKey: _concatEtag(mPropertyBag.responses)
		};
	};

	return oStorageResultMerger;
});