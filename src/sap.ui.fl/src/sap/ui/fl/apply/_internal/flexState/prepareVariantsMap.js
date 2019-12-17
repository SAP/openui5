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
	"sap/ui/core/Component"
], function (
	Utils,
	ObjectPath,
	Log,
	Change,
	includes,
	VariantUtil,
	isEmptyObject,
	each,
	values,
	deepClone,
	merge,
	Component
) {
	"use strict";

	function _applyChangesOnVariantManagement(oVariantManagement) {
		var mVariantManagementChanges = oVariantManagement.variantManagementChanges;
		var oActiveChange;
		if (!isEmptyObject(mVariantManagementChanges)) {
			oActiveChange = _getActiveChange(mVariantManagementChanges["setDefault"]);
			if (oActiveChange) {
				oVariantManagement.defaultVariant = oActiveChange.getContent().defaultVariant;
			}
		}
	}

	function _applyChangesOnVariant(oVariant) {
		var mVariantChanges = oVariant.variantChanges;
		var oActiveChange;
		each(mVariantChanges, function (sChangeType, aChanges) {
			switch (sChangeType) {
				case "setTitle":
					oActiveChange = _getActiveChange(aChanges);
					if (oActiveChange) {
						oVariant.content.content.title = oActiveChange.getText("title");
					}
					break;
				case "setFavorite":
					oActiveChange = _getActiveChange(aChanges);
					if (oActiveChange) {
						oVariant.content.content.favorite = oActiveChange.getContent().favorite;
					}
					break;
				case "setVisible":
					oActiveChange = _getActiveChange(aChanges);
					if (oActiveChange) {
						oVariant.content.content.visible = oActiveChange.getContent().visible;
					}
					break;
				default:
					Log.error("No valid changes on variant " + oVariant.content.content.title + " available");
			}
		});
	}

	function _getActiveChange(aChanges) {
		if (aChanges.length > 0) {
			return new Change(aChanges[aChanges.length - 1]);
		}
		return false;
	}

	function _getText(sTextKey) {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText(sTextKey);
	}

	function _getStandardAndSetPropertiesForVariants(oVariantData) {
		var bIsStandardVariant = false;
		if (oVariantData.content.fileName === oVariantData.content.variantManagementReference) {
			bIsStandardVariant = true;
			// standard Variant should always contain the value: "SAP" in "author" / "Created by" field
			// case when standard variant exists in the backend response
			if (!ObjectPath.get("content.support.user", oVariantData)) {
				var oSupport = {
					support: {
						user: VariantUtil.DEFAULT_AUTHOR
					}
				};
				merge(oVariantData.content, oSupport);
			}
		}
		if (!oVariantData.content.content.favorite) {
			oVariantData.content.content.favorite = true;
		}
		if (!oVariantData.content.content.visible) {
			oVariantData.content.content.visible = true;
		}
		var aTitleKeyMatch = oVariantData.content.content.title.match(/.i18n>(\w+)./);
		if (aTitleKeyMatch) {
			oVariantData.content.content.title = _getText(aTitleKeyMatch[1]);
		}
		return bIsStandardVariant;
	}

	function _prepareVariantContent(mPropertyBag) {
		if (!isEmptyObject(mPropertyBag.variantResponse)) {
			var oClonedResponse = deepClone(mPropertyBag.variantResponse);

			each(oClonedResponse, function (sVMReference, oVariantManagement) {
				var aVariants = oVariantManagement.variants;
				var sCurrentVariantFromUrl;
				var iStandardVariantIndex = -1;

				mPropertyBag.variantsMap[sVMReference] = {};

				aVariants.forEach(function (oVariantData, iVariantIndex) {
					if (_getStandardAndSetPropertiesForVariants(oVariantData)) {
						iStandardVariantIndex = iVariantIndex;
					}

					_applyChangesOnVariant(oVariantData);

					// invisible variant cannot be set as current variant
					if (!sCurrentVariantFromUrl && oVariantData.content.content.visible) {
						// Only the first valid reference for that variant management id passed in the parameters is used to load the changes
						sCurrentVariantFromUrl =
							!isEmptyObject(mPropertyBag.technicalParameters) && includes(mPropertyBag.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER], oVariantData.content.fileName) && oVariantData.content.fileName;
					}
				});

				var oStandardVariant = aVariants.splice(iStandardVariantIndex, 1)[0];
				aVariants.sort(VariantUtil.compareVariants);
				aVariants.splice(0, 0, oStandardVariant);

				mPropertyBag.variantsMap[sVMReference].variants = aVariants;
				mPropertyBag.variantsMap[sVMReference].defaultVariant = sVMReference;

				if (sCurrentVariantFromUrl) {
					mPropertyBag.variantsMap[sVMReference].currentVariant = sCurrentVariantFromUrl;
				}

				mPropertyBag.variantsMap[sVMReference].variantManagementChanges = oVariantManagement.variantManagementChanges;

				_applyChangesOnVariantManagement(mPropertyBag.variantsMap[sVMReference]);
			});
		}
	}
	function _containsOnlyStandardVariant(oVariantManagement) {
		return oVariantManagement.variants.length === 1
			&& !oVariantManagement.variants[0].content.layer
			&& oVariantManagement.variants[0].controlChanges.length === 0
			&& isEmptyObject(oVariantManagement.variants[0].variantChanges);
	}

	function _checkAndPrepareVariantsMap(mPropertyBag) {
		// no content in the variant controller
		if (!isEmptyObject(mPropertyBag.variantsMap)) {
			// if there exists only standard variant with no changes
			// then it is valid for new variant content to be set
			var bValidForPrepareMap = values(mPropertyBag.variantsMap).every(_containsOnlyStandardVariant);

			if (!bValidForPrepareMap) {
				return;
			}
		}
		return _prepareVariantContent(mPropertyBag);
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
		if (mPropertyBag.componentId) {
			var oComponent = Component.get(mPropertyBag.componentId);
			var oComponentData = oComponent.getComponentData();
		}
		var oPreparedVariantsMap = {};

		_checkAndPrepareVariantsMap(
			Object.assign(
				{
					variantResponse: ObjectPath.get("storageResponse.changes.variantSection", mPropertyBag),
					variantsMap: oPreparedVariantsMap
				},
				oComponentData && {technicalParameters: oComponentData.technicalParameters}
			)
		);
		return oPreparedVariantsMap || {};
	};
});
