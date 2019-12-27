/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/fl/Change",
	"sap/base/util/includes",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/base/util/isEmptyObject",
	"sap/base/util/each",
	"sap/base/util/values",
	"sap/base/util/deepClone",
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/fl/LayerUtils"
], function (
	Utils,
	ObjectPath,
	Log,
	Change,
	includes,
	VariantsApplyUtil,
	isEmptyObject,
	each,
	values,
	deepClone,
	merge,
	Component,
	LayerUtils
) {
	"use strict";

	//----initial map preparation for variants----//

	// ctrl_variant
	function addVariants(oVariantsMap, aVariants) {
		var oVariantsMapClone = deepClone(oVariantsMap);
		aVariants.forEach(function (oVariant) {
			oVariantsMapClone[oVariant.fileName] = {
				content: oVariant,
				controlChanges: [],
				variantChanges: {}
			};
		});
		return oVariantsMapClone;
	}

	// change
	function addVariantDependentControlChanges(oVariantsMap, aVariantDependentChanges) {
		var oVariantsMapClone = deepClone(oVariantsMap);
		aVariantDependentChanges.forEach(function (oChange) {
			oVariantsMapClone[oChange.variantReference] = oVariantsMapClone[oChange.variantReference] || createStandardVariant(oChange.variantReference);
			oVariantsMapClone[oChange.variantReference].controlChanges.push(oChange);
		});
		return oVariantsMapClone;
	}

	// ctrl_variant_change
	function addVariantChanges(oVariantsMap, aVariantChanges) {
		var oVariantsMapClone = deepClone(oVariantsMap);
		aVariantChanges.forEach(function (oChange) {
			oVariantsMapClone[oChange.selector.id] = oVariantsMapClone[oChange.selector.id] || createStandardVariant(oChange.selector.id);
			var aVariantChangesOfTheChangeType = oVariantsMapClone[oChange.selector.id].variantChanges[oChange.changeType] || [];
			aVariantChangesOfTheChangeType.push(oChange);
			oVariantsMapClone[oChange.selector.id].variantChanges[oChange.changeType] = aVariantChangesOfTheChangeType;
		});
		return oVariantsMapClone;
	}

	// resolve references
	function resolveReferences(oVariantsMap) {
		var oVariantsMapClone = deepClone(oVariantsMap);
		values(oVariantsMapClone).forEach(function(oVariant) {
			var sVariantReference = oVariant.content.variantReference;
			var oReferencedVariant;
			if (sVariantReference) {
				oReferencedVariant = findOrCreateAndAddVariantById(oVariantsMapClone, sVariantReference, oVariant.content.variantManagementReference);
			}
			oVariant.controlChanges = getReferencedControlChange(oReferencedVariant, oVariant.content.layer).concat(oVariant.controlChanges);
		});
		return oVariantsMapClone;
	}

	function getReferencedControlChange(oReferencedVariant, sVariantLayer) {
		if (!oReferencedVariant) {
			return [];
		}
		return deepClone(oReferencedVariant.controlChanges).filter(function(oReferencedChange) {
			return LayerUtils.compareAgainstCurrentLayer(oReferencedChange.layer, sVariantLayer) === -1;
		});
	}

	function findOrCreateAndAddVariantById(oVariantsMap, sVariantId, sVMReference) {
		var oReferencedVariant = oVariantsMap[sVariantId];

		if (!oReferencedVariant && sVariantId === sVMReference) {
			oReferencedVariant = createStandardVariant(sVariantId);
			oVariantsMap[sVariantId] = oReferencedVariant;
		}

		return oReferencedVariant;
	}

	// prepares initial map for variants
	function getVariantsMap(oStorageResponse) {
		var oVariantsMap = {};

		oVariantsMap = addVariants(oVariantsMap, oStorageResponse.variants);
		oVariantsMap = addVariantDependentControlChanges(oVariantsMap, oStorageResponse.variantDependentControlChanges);
		oVariantsMap = addVariantChanges(oVariantsMap, oStorageResponse.variantChanges);
		oVariantsMap = resolveReferences(oVariantsMap);

		return oVariantsMap;
	}

	//----preparation of resultant variant section----//

	function createVariantManagementSection() {
		return {
			variantManagementChanges : {},
			variants : []
		};
	}

	// add prepared variants to resultant variant section
	function addVariantsToResult(oResult, oVariantsMap, aTechnicalParameters) {
		var oResultClone = deepClone(oResult);
		values(oVariantsMap).forEach(function (oVariant) {
			var sVariantManagementId = oVariant.content.variantManagementReference;
			if (!oResultClone[sVariantManagementId]) {
				oResultClone[sVariantManagementId] = createVariantManagementSection();
			}
			oVariant = setDefaultProperties(oVariant);
			oVariant = applyChangesOnVariant(oVariant);

			// invisible variant cannot be set as current variant
			if (!oResultClone[sVariantManagementId].currentVariant && oVariant.content.content.visible && includes(aTechnicalParameters, oVariant.content.fileName)) {
				oResultClone[sVariantManagementId].currentVariant = oVariant.content.fileName;
			}

			oResultClone[sVariantManagementId].defaultVariant = sVariantManagementId;

			var iSortedIndex = VariantsApplyUtil.getIndexToSortVariant(oResultClone[sVariantManagementId].variants, oVariant);
			oResultClone[sVariantManagementId].variants.splice(iSortedIndex, 0, oVariant);
		});

		return oResultClone;
	}

	// add variant management changes to resultant variant section
	function addVariantManagementChangesToResult(oResult, aVariantManagementChanges) {
		var oResultClone = deepClone(oResult);
		aVariantManagementChanges.forEach(function (oChange) {
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
	function addStandardVariants(oResult) {
		var oResultClone = deepClone(oResult);
		each(oResultClone, function (sVariantManagementId, oVariantManagement) {
			var iStandardVariantIndex = oVariantManagement.variants.findIndex(function (oVariant) {
				return oVariant.content.fileName === sVariantManagementId;
			});

			var oStandardVariant;

			if (iStandardVariantIndex === -1) {
				oStandardVariant = createStandardVariant(sVariantManagementId);
			} else {
				oStandardVariant = oVariantManagement.variants[iStandardVariantIndex];
				oVariantManagement.variants.splice(iStandardVariantIndex, 1);
			}

			oVariantManagement.variants.unshift(oStandardVariant);
		});

		return oResultClone;
	}

	// prepares resultant variant section
	function assembleResult(oVariantsMap, aVariantManagementChanges, aTechnicalParameters) {
		var oResult = {};

		oResult = addVariantsToResult(oResult, oVariantsMap, aTechnicalParameters);
		oResult = addVariantManagementChangesToResult(oResult, aVariantManagementChanges);
		oResult = addStandardVariants(oResult);

		return oResult;
	}

	function createStandardVariant(sVariantId) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
		return {
			content: {
				fileName: sVariantId,
				variantManagementReference: sVariantId,
				content: {
					title: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
					favorite: true,
					visible: true
				},
				support: {
					user: VariantsApplyUtil.DEFAULT_AUTHOR
				}
			},
			variantChanges: {},
			controlChanges: []
		};
	}

	//----sets properties on the map----//

	// set ctrl_variant_management_change via map properties
	function applyChangesOnVariantManagement(oVariantManagement) {
		var oVariantManagementClone = deepClone(oVariantManagement);
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
	function applyChangesOnVariant(oVariant) {
		var oVariantClone = deepClone(oVariant);
		var mVariantChanges = oVariantClone.variantChanges;
		var oActiveChange;
		each(mVariantChanges, function (sChangeType, aChanges) {
			switch (sChangeType) {
				case "setTitle":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantClone.content.content.title = oActiveChange.getText("title");
					}
					break;
				case "setFavorite":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantClone.content.content.favorite = oActiveChange.getContent().favorite;
					}
					break;
				case "setVisible":
					oActiveChange = getActiveChange(aChanges);
					if (oActiveChange) {
						oVariantClone.content.content.visible = oActiveChange.getContent().visible;
					}
					break;
				default:
					Log.error("No valid changes on variant " + oVariantClone.content.content.title + " available");
			}
		});
		return oVariantClone;
	}

	function getActiveChange(aChanges) {
		if (aChanges.length > 0) {
			return new Change(aChanges[aChanges.length - 1]);
		}
		return false;
	}

	function getText(sTextKey) {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText(sTextKey);
	}

	// set default map properties
	function setDefaultProperties(oVariant) {
		var oVariantClone = deepClone(oVariant);
		if (oVariantClone.content.fileName === oVariantClone.content.variantManagementReference) {
			// standard Variant should always contain the value: "SAP" in "author" / "Created by" field
			// case when standard variant exists in the backend response
			if (!ObjectPath.get("content.support.user", oVariantClone)) {
				var oSupport = {
					support: {
						user: VariantsApplyUtil.DEFAULT_AUTHOR
					}
				};
				merge(oVariantClone.content, oSupport);
			}
		}
		if (!oVariantClone.content.content.favorite) {
			oVariantClone.content.content.favorite = true;
		}
		if (!oVariantClone.content.content.visible) {
			oVariantClone.content.content.visible = true;
		}
		var aTitleKeyMatch = oVariantClone.content.content.title.match(/.i18n>(\w+)./);
		if (aTitleKeyMatch) {
			oVariantClone.content.content.title = getText(aTitleKeyMatch[1]);
		}
		return oVariantClone;
	}

	/**
	 * Prepares the variants map from the flex response for the passed flex state
	 *
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.storageResponse - Flex response
	 * @param {string} mPropertyBag.componentId - Component id
	 *
	 * @returns {object} Prepared variants map
	 *
	 * @experimental since 1.74
	 * @function
	 * @since 1.74
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/fl/apply/_internal/flexState/prepareVariantsMap
	 */
	return function(mPropertyBag) {
		if (isEmptyObject(mPropertyBag) || !ObjectPath.get("storageResponse.changes.variants", mPropertyBag)) {
			return {};
		}

		var aTechnicalParameters = [];
		if (mPropertyBag.componentId) {
			var oComponent = Component.get(mPropertyBag.componentId);
			var oComponentData = oComponent.getComponentData();
			aTechnicalParameters = ObjectPath.get(["technicalParameters", VariantsApplyUtil.VARIANT_TECHNICAL_PARAMETER], oComponentData) || [];
		}

		var oVariantsMap = getVariantsMap(mPropertyBag.storageResponse.changes);
		oVariantsMap = assembleResult(oVariantsMap, mPropertyBag.storageResponse.changes.variantManagementChanges, aTechnicalParameters);
		merge(mPropertyBag.storageResponse.changes, {
			variantSection: oVariantsMap
		});
		return oVariantsMap;
	};
});
