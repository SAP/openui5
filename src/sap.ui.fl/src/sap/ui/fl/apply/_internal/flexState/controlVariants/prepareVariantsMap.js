/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/includes",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/util/values",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/Change",
	"sap/ui/fl/LayerUtils"
], function(
	each,
	includes,
	isEmptyObject,
	merge,
	ObjectPath,
	values,
	Log,
	VariantsApplyUtil,
	FlexObjectFactory,
	Change,
	LayerUtils
) {
	"use strict";

	//----initial map preparation for variants----//

	// ctrl_variant
	function addVariants(oVariantsMap, aVariants) {
		var oVariantsMapClone = merge({}, oVariantsMap);
		aVariants.forEach(function(oVariant) {
			oVariantsMapClone[oVariant.fileName] = {
				instance: FlexObjectFactory.createFromFileContent(oVariant),
				controlChanges: [],
				variantChanges: {}
			};
		});
		return oVariantsMapClone;
	}

	// change
	function addVariantDependentControlChanges(oVariantsMap, aVariantDependentChanges, sReference) {
		var oVariantsMapClone = merge({}, oVariantsMap);
		aVariantDependentChanges.forEach(function(oChange) {
			var oChangeInstance = new Change(oChange);
			oChangeInstance.setState(Change.states.PERSISTED);
			var oVariantEntry = oVariantsMapClone[oChange.variantReference];
			oVariantEntry = oVariantEntry || createStandardVariant(oChange.variantReference, sReference);
			oVariantEntry.controlChanges.push(oChangeInstance);
			oVariantsMapClone[oChange.variantReference] = oVariantEntry;
		});
		return oVariantsMapClone;
	}

	// ctrl_variant_change
	function addVariantChanges(oVariantsMap, aVariantChanges, sReference) {
		var oVariantsMapClone = merge({}, oVariantsMap);
		// TODO: create change instances
		aVariantChanges.forEach(function(oChange) {
			var oVariantEntry = oVariantsMapClone[oChange.selector.id];
			oVariantEntry = oVariantEntry || createStandardVariant(oChange.selector.id, sReference);
			var aVariantChangesOfTheChangeType = oVariantEntry.variantChanges[oChange.changeType] || [];
			aVariantChangesOfTheChangeType.push(oChange);
			oVariantEntry.variantChanges[oChange.changeType] = aVariantChangesOfTheChangeType;
			oVariantsMapClone[oChange.selector.id] = oVariantEntry;
		});
		return oVariantsMapClone;
	}

	// filter invisible variants
	function filterInvisibleVariants(oVariantsMap) {
		var oVariantsMapClone = merge({}, oVariantsMap);
		values(oVariantsMap).forEach(function(oVariantEntry) {
			var aSetVisibleChanges = ObjectPath.get("variantChanges.setVisible", oVariantEntry);
			if (aSetVisibleChanges && aSetVisibleChanges.length > 0) {
				var oSetVisibleActiveChange = getActiveChange(aSetVisibleChanges);
				if (!oSetVisibleActiveChange.getContent().visible && oSetVisibleActiveChange.getContent().createdByReset) {
					delete oVariantsMapClone[oVariantEntry.instance.getId()];
				}
			}
		});
		return oVariantsMapClone;
	}

	// resolve references
	function resolveReferences(oVariantsMap, sReference) {
		var oVariantsMapClone = merge({}, oVariantsMap);
		values(oVariantsMapClone).forEach(function(oVariantEntry) {
			var sVariantReference = oVariantEntry.instance.getVariantReference();
			var oReferencedVariant;
			if (sVariantReference) {
				oReferencedVariant = findOrCreateAndAddVariantById(oVariantsMapClone, sVariantReference, oVariantEntry.instance.getVariantManagementReference(), sReference);
			}
			oVariantEntry.controlChanges = getReferencedControlChanges(oReferencedVariant, oVariantEntry.instance.getLayer()).concat(oVariantEntry.controlChanges);
		});
		return oVariantsMapClone;
	}

	function getReferencedControlChanges(oReferencedVariant, sVariantLayer) {
		if (!oReferencedVariant) {
			return [];
		}
		return values(merge({}, oReferencedVariant.controlChanges)).filter(function(oReferencedChange) {
			return LayerUtils.compareAgainstCurrentLayer(oReferencedChange.getLayer(), sVariantLayer) === -1;
		});
	}

	function findOrCreateAndAddVariantById(oVariantsMap, sVariantId, sVMReference, sReference) {
		var oReferencedVariant = oVariantsMap[sVariantId];

		if (!oReferencedVariant && sVariantId === sVMReference) {
			oReferencedVariant = createStandardVariant(sVariantId, sReference);
			oVariantsMap[sVariantId] = oReferencedVariant;
		}

		return oReferencedVariant;
	}

	// prepares initial map for variants
	function getVariantsMap(oStorageResponse, sReference) {
		var oVariantsMap = {};

		oVariantsMap = addVariants(oVariantsMap, oStorageResponse.variants);
		oVariantsMap = addVariantDependentControlChanges(oVariantsMap, oStorageResponse.variantDependentControlChanges, sReference);
		oVariantsMap = addVariantChanges(oVariantsMap, oStorageResponse.variantChanges, sReference);
		oVariantsMap = filterInvisibleVariants(oVariantsMap);
		oVariantsMap = resolveReferences(oVariantsMap, sReference);

		return oVariantsMap;
	}

	//----preparation of resultant variant section----//

	function createVariantManagementSection() {
		return {
			variantManagementChanges: {},
			variants: []
		};
	}

	// add prepared variants to resultant variant section
	function addVariantsToResult(oResult, oVariantsMap, aTechnicalParameters) {
		var oResultClone = merge({}, oResult);
		values(oVariantsMap).forEach(function(oVariantEntry) {
			var sVariantManagementId = oVariantEntry.instance.getVariantManagementReference();
			if (!oResultClone[sVariantManagementId]) {
				oResultClone[sVariantManagementId] = createVariantManagementSection();
			}
			oVariantEntry = applyChangesOnVariant(oVariantEntry);

			// invisible variant cannot be set as current variant
			if (!oResultClone[sVariantManagementId].currentVariant && oVariantEntry.instance.getVisible() && includes(aTechnicalParameters, oVariantEntry.instance.getId())) {
				oResultClone[sVariantManagementId].currentVariant = oVariantEntry.instance.getId();
			}

			oResultClone[sVariantManagementId].defaultVariant = sVariantManagementId;

			var iSortedIndex = VariantsApplyUtil.getIndexToSortVariant(oResultClone[sVariantManagementId].variants, oVariantEntry);
			oResultClone[sVariantManagementId].variants.splice(iSortedIndex, 0, oVariantEntry);
		});

		return oResultClone;
	}

	// add variant management changes to resultant variant section
	function addVariantManagementChangesToResult(oResult, aVariantManagementChanges) {
		var oResultClone = merge({}, oResult);
		aVariantManagementChanges.forEach(function(oChange) {
			var sVariantManagementId = oChange.selector.id;
			if (!oResultClone[sVariantManagementId]) {
				oResultClone[sVariantManagementId] = createVariantManagementSection();
			}
			var sChangeType = oChange.changeType;
			if (!oResultClone[sVariantManagementId].variantManagementChanges[sChangeType]) {
				oResultClone[sVariantManagementId].variantManagementChanges[sChangeType] = [];
			}
			oResultClone[sVariantManagementId].variantManagementChanges[sChangeType].push(oChange);
			oResultClone[sVariantManagementId] = applyChangesOnVariantManagement(oResultClone[sVariantManagementId]);
		});

		return oResultClone;
	}

	// add missing standard variants to resultant variant section
	function addStandardVariants(oResult, sReference) {
		var oResultClone = merge({}, oResult);
		each(oResultClone, function(sVariantManagementId, oVariantManagement) {
			var iStandardVariantIndex = oVariantManagement.variants.findIndex(function(oVariantEntry) {
				return oVariantEntry.instance.getId() === sVariantManagementId;
			});

			var oStandardVariant;

			if (iStandardVariantIndex === -1) {
				oStandardVariant = createStandardVariant(sVariantManagementId, sReference);
			} else {
				oStandardVariant = oVariantManagement.variants[iStandardVariantIndex];
				oVariantManagement.variants.splice(iStandardVariantIndex, 1);
			}

			oVariantManagement.variants.unshift(oStandardVariant);
		});

		return oResultClone;
	}

	// prepares resultant variant section
	function assembleResult(oVariantsMap, aVariantManagementChanges, aTechnicalParameters, sReference) {
		var oResult = {};

		oResult = addVariantsToResult(oResult, oVariantsMap, aTechnicalParameters);
		oResult = addVariantManagementChangesToResult(oResult, aVariantManagementChanges);
		oResult = addStandardVariants(oResult, sReference);

		return oResult;
	}

	function createStandardVariant(sVariantId, sReference) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
		return {
			instance: FlexObjectFactory.createFlVariant({
				id: sVariantId,
				variantManagementReference: sVariantId,
				variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				user: VariantsApplyUtil.DEFAULT_AUTHOR,
				reference: sReference
			}),
			variantChanges: {},
			controlChanges: []
		};
	}

	//----sets properties on the map----//

	// set ctrl_variant_management_change via map properties
	function applyChangesOnVariantManagement(oVariantManagement) {
		var oVariantManagementClone = merge({}, oVariantManagement);
		var mVariantManagementChanges = oVariantManagementClone.variantManagementChanges;
		var oActiveChange;
		if (!isEmptyObject(mVariantManagementChanges)) {
			oActiveChange = getActiveChange(mVariantManagementChanges["setDefault"]);
			if (oActiveChange) {
				oVariantManagementClone.defaultVariant = oActiveChange.getContent().defaultVariant;
			}
		}
		return oVariantManagementClone;
	}

	// set ctrl_variant_change via map properties
	function applyChangesOnVariant(oVariantEntry) {
		var oVariantEntryClone = merge({}, oVariantEntry);
		var mVariantChanges = oVariantEntryClone.variantChanges;
		var oActiveChange;
		each(mVariantChanges, function(sChangeType, aChanges) {
			switch (sChangeType) {
				case "setTitle":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantEntryClone.instance.setName(oActiveChange.getText("title"), true);
					}
					break;
				case "setFavorite":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantEntryClone.instance.setFavorite(oActiveChange.getContent().favorite);
					}
					break;
				case "setExecuteOnSelect":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantEntryClone.instance.setExecuteOnSelection(oActiveChange.getContent().executeOnSelect);
					}
					break;
				case "setVisible":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantEntryClone.instance.setVisible(oActiveChange.getContent().visible);
					}
					break;
				case "setContexts":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantEntryClone.instance.setContexts(oActiveChange.getContent().contexts);
					}
					break;
				default:
					Log.error("No valid changes on variant " + oVariantEntryClone.content.content.title + " available");
			}
		});
		return oVariantEntryClone;
	}

	function getActiveChange(aChanges) {
		if (aChanges.length > 0) {
			return new Change(aChanges[aChanges.length - 1]);
		}
		return false;
	}

	/**
	 * Prepares the variants map from the flex response for the passed flex state
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {object} mPropertyBag.storageResponse - Filtered flex response
	 * @param {object} mPropertyBag.unfilteredStorageResponse - Unfiltered flex response
	 * @param {string} mPropertyBag.componentId - Component id
	 *
	 * @returns {object} Prepared variants map
	 *
	 * @experimental since 1.74
	 * @function
	 * @since 1.74
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/apply/_internal/flexState/controlVariants/prepareVariantsMap
	 */
	return function(mPropertyBag) {
		if (isEmptyObject(mPropertyBag) || !ObjectPath.get("storageResponse.changes.variants", mPropertyBag)) {
			return {};
		}

		var aTechnicalParameters = ObjectPath.get(["technicalParameters", VariantsApplyUtil.VARIANT_TECHNICAL_PARAMETER], mPropertyBag.componentData) || [];

		var oVariantsMap = getVariantsMap(mPropertyBag.storageResponse.changes, mPropertyBag.reference);
		oVariantsMap = assembleResult(oVariantsMap, mPropertyBag.storageResponse.changes.variantManagementChanges, aTechnicalParameters, mPropertyBag.reference);
		return oVariantsMap;
	};
});
