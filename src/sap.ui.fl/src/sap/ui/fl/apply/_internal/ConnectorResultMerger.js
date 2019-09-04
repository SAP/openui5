/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge"
], function(
	merge
) {
	"use strict";

	/**
	 * Merging results from different connectors or layers.
	 *
	 * @namespace sap.ui.fl.apply._internal.ConnectorResultMerger
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl._internal.apply.Connector
	 */

	function findVariantSection(aResponses) {
		var oVariantSection = {};
		aResponses.some(function (oResponse) {
			if (oResponse.variantSection && Object.keys(oResponse.variantSection).length > 0) {
				oVariantSection = oResponse.variantSection;
				return true;
			}
		});

		return oVariantSection;
	}

	function createVariantManagementSection() {
		return {
			variantManagementChanges : {},
			variants : []
		};
	}

	function findOrCreateAndAddVariantById(oVariantsMap, sVariantId) {
		var oReferencedVariant = oVariantsMap[sVariantId];

		if (!oReferencedVariant) {
			oReferencedVariant = oConnectorResultMerger._createStandardVariant(sVariantId);
			oVariantsMap[sVariantId] = oReferencedVariant;
		}

		return oReferencedVariant;
	}

	function getReferencedControlChange(oReferencedVariant) {
		if (!oReferencedVariant) {
			return [];
		}

		return oReferencedVariant.controlChanges.map(function (oChange) {
			return oChange;
		});
	}

	function getReferencedVariantChanges(oReferencedVariant) {
		if (!oReferencedVariant) {
			return {};
		}

		var oVariantChanges = {};
		Object.keys(oReferencedVariant.variantChanges).forEach(function(sChangeType) {
			oVariantChanges[sChangeType] = oReferencedVariant.variantChanges[sChangeType].map(function (oChange) {
				return oChange;
			});
		});

		return oVariantChanges;
	}

	/**
	 * Adds a list of variants to the variantsMap and add all (control & variant) changes already present in the referenced variant.
	 *
	 * @param {object} oVariantsMap Map of variants with their IDs as keys
	 * @param {object[]} aVariants List of variants to be added
	 * @returns {object} Copy of the variantsMap with the added variants from the list
	 */
	function addVariantsAndResolveReferences(oVariantsMap, aVariants) {
		var oVariantsMapCopy = merge({}, oVariantsMap);
		aVariants.forEach(function (oVariant) {
			var sVariantReference = oVariant.variantReference;
			var oReferencedVariant;
			if (sVariantReference) {
				oReferencedVariant = findOrCreateAndAddVariantById(oVariantsMapCopy, sVariantReference);
			}

			oVariantsMapCopy[oVariant.fileName] = {
				content: oVariant,
				controlChanges: getReferencedControlChange(oReferencedVariant),
				variantChanges: getReferencedVariantChanges(oReferencedVariant)
			};
		});

		return oVariantsMapCopy;
	}

	function addVariantDependentControlChanges(oVariantsMap, aVariantDependentChanges) {
		var oVariantsMapCopy = merge({}, oVariantsMap);
		aVariantDependentChanges.forEach(function (oChange) {
			oVariantsMapCopy[oChange.variantReference].controlChanges.push(oChange);
		});
		return oVariantsMapCopy;
	}

	function addVariantChanges(oVariantsMap, aVariantChanges) {
		var oVariantsMapCopy = merge({}, oVariantsMap);
		aVariantChanges.forEach(function (oChange) {
			var aVariantChangesOfTheChangeType = oVariantsMapCopy[oChange.selector.id].variantChanges[oChange.changeType] || [];
			aVariantChangesOfTheChangeType.push(oChange);
			oVariantsMapCopy[oChange.selector.id].variantChanges[oChange.changeType] = aVariantChangesOfTheChangeType;
		});
		return oVariantsMapCopy;
	}

	function addVariantsToResult(oResult, oVariantsMap) {
		var oResultCopy = merge({}, oResult);
		Object.keys(oVariantsMap).forEach(function (sVariantId) {
			var oVariant = oVariantsMap[sVariantId];
			var sVariantManagementId = oVariant.content.variantManagementReference;
			if (!oResultCopy.variantSection[sVariantManagementId]) {
				oResultCopy.variantSection[sVariantManagementId] = createVariantManagementSection();
			}
			oResultCopy.variantSection[sVariantManagementId].variants.push(oVariant);
		});

		return oResultCopy;
	}

	function addVariantManagementChangesToResult(oResult, aVariantManagementChanges) {
		var oResultCopy = merge({}, oResult);
		aVariantManagementChanges.forEach(function (oChange) {
			var sVariantManagementId = oChange.selector.id;
			if (!oResultCopy.variantSection[sVariantManagementId]) {
				oResultCopy.variantSection[sVariantManagementId] = createVariantManagementSection();
			}
			var sChangeType = oChange.changeType;
			if (!oResultCopy.variantSection[sVariantManagementId].variantManagementChanges[sChangeType]) {
				oResultCopy.variantSection[sVariantManagementId].variantManagementChanges[sChangeType] = [];
			}
			oResultCopy.variantSection[sVariantManagementId].variantManagementChanges[sChangeType].push(oChange);
		});

		return oResultCopy;
	}

	/**
	 * Adds in the variantSection all standard variants which are missing.
	 *
	 * @param {object} oResult Flex data result with variantSection filled, but with potential missing standard variants
	 * @returns {object} Result with all standard variants added in the variantSection
	 */
	function addMissingStandardVariants(oResult) {
		var oResultCopy = merge({}, oResult);
		Object.keys(oResultCopy.variantSection).forEach(function (sVariantManagementId) {
			var oVariantManagementSection = oResultCopy.variantSection[sVariantManagementId];
			var iStandardVariantIndex = oVariantManagementSection.variants.findIndex(function (oVariant) {
				return oVariant.content.variantReference === sVariantManagementId;
			});

			var oStandardVariant;

			if (iStandardVariantIndex === -1) {
				oStandardVariant = oConnectorResultMerger._createStandardVariant(sVariantManagementId);
			} else {
				oStandardVariant = oVariantManagementSection.variants[iStandardVariantIndex];
				oVariantManagementSection.variants.splice(iStandardVariantIndex, 1);
			}

			oVariantManagementSection.variants.unshift(oStandardVariant);
		});

		return oResultCopy;
	}

	function getVariantManagementChanges(aResponses) {
		var aVariantManagementChanges = [];

		aResponses.forEach(function (oResponse) {
			aVariantManagementChanges = aVariantManagementChanges.concat(oResponse.variantManagementChanges);
		});

		return aVariantManagementChanges;
	}

	function getVariantsMap(aResponses) {
		var oVariantsMap = {};

		aResponses.forEach(function (oResponse) {
			oVariantsMap = addVariantsAndResolveReferences(oVariantsMap, oResponse.variants);
			oVariantsMap = addVariantDependentControlChanges(oVariantsMap, oResponse.variantDependentControlChanges);
			oVariantsMap = addVariantChanges(oVariantsMap, oResponse.variantChanges);
		});

		return oVariantsMap;
	}

	function assembleResult(oResult, oVariantsMap, aVariantManagementChanges) {
		oResult = addVariantsToResult(oResult, oVariantsMap);
		oResult = addVariantManagementChangesToResult(oResult, aVariantManagementChanges);
		oResult = addMissingStandardVariants(oResult);
		return oResult;
	}


	var oConnectorResultMerger = {};

	/**
	 * Concatenates all changes from a list of flex data request responses into a passed result object and removed duplicates.
	 *
	 * @param {object[]} aResponses List of responses containing a changes property to be concatenated
	 * @param {object[]} aResponses.changes List of the change definitions
	 * @returns {object[]} Merged array of changes
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.ConnectorResultMerger, sap.ui.fl.Cache
	 */
	oConnectorResultMerger._concatChanges = function(aResponses) {
		var aChanges = [];

		aResponses.forEach(function (oResponse) {
			aChanges = aChanges.concat(oResponse.changes);
		});

		var aChangeIds = [];
		aChanges = aChanges.filter(function (oChange) {
			var sFileName = oChange.fileName;
			var bChangeAlreadyAdded = aChangeIds.indexOf(sFileName) !== -1;
			if (bChangeAlreadyAdded) {
				return false;
			}

			aChangeIds.push(sFileName);
			return true;
		});

		return aChanges;
	};

	/**
	 * Merges the results from all involved connectors.
	 *
	 * @param {object} mPropertyBag Further properties
	 * @param {object[]} mPropertyBag.responses All responses provided by the different connectors
	 * @param {boolean} mPropertyBag.variantSectionSufficient Flag if a provided variant section can be used directly
	 * @returns {object} Merged result
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl._internal.Connector
	 */
	oConnectorResultMerger.merge = function(mPropertyBag) {
		var oResult = {
			changes: oConnectorResultMerger._concatChanges(mPropertyBag.responses),
			variantSection: {}
		};

		if (mPropertyBag.variantSectionSufficient) {
			oResult.variantSection = findVariantSection(mPropertyBag.responses);
		} else {
			var oVariantsMap = getVariantsMap(mPropertyBag.responses);
			var aVariantManagementChanges = getVariantManagementChanges(mPropertyBag.responses);
			oResult = assembleResult(oResult, oVariantsMap, aVariantManagementChanges);
		}
		return oResult;
	};

	oConnectorResultMerger._createStandardVariant = function (sVariantId) {
		return {
			content: {
				fileName: sVariantId,
				variantManagementReference: sVariantId,
				title: "STANDARD_VARIANT_TITLE",
				originalTitle: "STANDARD_VARIANT_ORIGINAL_TITLE",
				favorite: true,
				originalFavorite: true,
				visible: true
			},
			variantChanges: {},
			controlChanges: []
		};
	};

	return oConnectorResultMerger;
});