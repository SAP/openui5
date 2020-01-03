/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/StorageUtils"
],
function(
	StorageUtils
) {
	"use strict";

	function _collectControlVariantFlexObjects(aFlexObjects, oControlVariant) {
		// add the control variant only in case it is not a standard variant
		if (oControlVariant.content.fileName !== oControlVariant.content.variantManagementReference) {
			aFlexObjects.push(oControlVariant.content);
		}

		oControlVariant.controlChanges.forEach(function (oControlChange) {
			aFlexObjects.push(oControlChange);
		});

		for (var sChangeType in oControlVariant.variantChanges) {
			aFlexObjects = aFlexObjects.concat(oControlVariant.variantChanges[sChangeType]);
		}

		return aFlexObjects;
	}

	/**
	 * @namespace sap.ui.fl.apply._internal.StorageResultDisassemble
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl._internal.apply.Storage
	 * Disassembles a response with a variant section into one or more plain responses.
	 *
	 * @param {object} oResponse Flexibility data response from a <code>sap.ui.connectors.BaseConnector</code> implementation
	 * @param {object} oResponse.variantSection Variant section of the response (mandatory)
	 * @returns {array} Disassembled result
	 *
	 */
	return function(oResponse) {
		var aFlexObjects = oResponse.changes || [];

		for (var sVariantManagement in oResponse.variantSection) {
			var oVariantManagement = oResponse.variantSection[sVariantManagement];
			for (var sChangeType in oVariantManagement.variantManagementChanges) {
				aFlexObjects = aFlexObjects.concat(oVariantManagement.variantManagementChanges[sChangeType]);
			}
			aFlexObjects = oVariantManagement.variants.reduce(_collectControlVariantFlexObjects, aFlexObjects);
		}

		var mGroupedFlexObjects = StorageUtils.getGroupedFlexObjects(aFlexObjects);
		return StorageUtils.filterAndSortResponses(mGroupedFlexObjects);
	};
});