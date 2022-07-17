/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/base/util/merge",
	"sap/base/util/isEmptyObject"
],
function(
	StorageUtils,
	merge,
	isEmptyObject
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

	function isInitialCompSection(oCompSection) {
		var bInitial = true;

		if (oCompSection) {
			Object.keys(oCompSection).some(function(sKey) {
				if (oCompSection[sKey].length) {
					bInitial = false;
					return true;
				}
			});
		}
		return bInitial;
	}

	/**
	 * @namespace sap.ui.fl.initial._internal.StorageResultDisassemble
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage
	 * Disassembles a response with a variant section into one or more plain responses.
	 *
	 * @param {object} oResponse Flexibility data response from a <code>sap.ui.connectors.BaseConnector</code> implementation
	 * @param {object} oResponse.variantSection Variant section of the response (mandatory)
	 * @returns {object[]} Disassembled result
	 *
	 */
	return function(oResponse) {
		var aFlexObjects;
		if (!isEmptyObject(oResponse.variantSection)) {
			aFlexObjects = oResponse.changes || [];

			for (var sVariantManagement in oResponse.variantSection) {
				var oVariantManagement = oResponse.variantSection[sVariantManagement];
				for (var sChangeType in oVariantManagement.variantManagementChanges) {
					aFlexObjects = aFlexObjects.concat(oVariantManagement.variantManagementChanges[sChangeType]);
				}
				aFlexObjects = oVariantManagement.variants.reduce(_collectControlVariantFlexObjects, aFlexObjects);
			}

			var mGroupedFlexObjects = StorageUtils.getGroupedFlexObjects(aFlexObjects);
			var aDisassembleResponses = StorageUtils.filterAndSortResponses(mGroupedFlexObjects);
			//Add un-disassembled parts of the original response into the first response of the result array
			delete oResponse.changes;
			delete oResponse.variantSection;
			merge(aDisassembleResponses[0] || {}, oResponse);
			return aDisassembleResponses;
		}

		if (isInitialCompSection(oResponse.comp)) {
			aFlexObjects = oResponse.changes || [];
			oResponse.comp = {
				variants: [],
				changes: [],
				defaultVariants: [],
				standardVariants: []
			};

			// loop over a copy in reverse order to handle deletions accordingly
			aFlexObjects.slice().reverse().forEach(function (oFlexObject, nIndex, aArray) {
				var bMoved = false;
				if (oFlexObject.fileType === "variant") {
					oResponse.comp.variants.unshift(oFlexObject);
					bMoved = true;
				} else {
					switch (oFlexObject.changeType) {
						case "addFavorite":
						case "removeFavorite":
						case "updateVariant":
							oResponse.comp.changes.unshift(oFlexObject);
							bMoved = true;

							break;
						case "defaultVariant":
							oResponse.comp.defaultVariants.unshift(oFlexObject);
							bMoved = true;
							break;
						case "standardVariant":
							oResponse.comp.standardVariants.unshift(oFlexObject);
							bMoved = true;
							break;
						default:
							// normal UI change which should not be part of the comp section
							break;
					}
				}

				// remove in original by reverse the index
				if (bMoved) {
					var nIndexInOriginal = aArray.length - 1 - nIndex;
					oResponse.changes.splice(nIndexInOriginal, 1);
				}
			});
		}

		return [oResponse];
	};
});