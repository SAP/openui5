/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant"
], function(
	FlexState,
	DataSelector,
	CompVariant
) {
	"use strict";

	/**
	 * Handler class provide data of smart control variant changes and its map.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.compVariants.CompVariantManagementState
	 * @since 1.129
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const CompVariantManagementState = {};

	const sUpdatableChangeNameSpace = "sap.ui.fl.apply._internal.flexObjects.UpdatableChange";

	const isSetDefaultChange = (oFlexObject) => {
		return oFlexObject?.isA(sUpdatableChangeNameSpace)
			&& oFlexObject.getFileType() === "change"
			&& oFlexObject.getChangeType() === "defaultVariant";
	};

	const oSetDefaultDataSelector = new DataSelector({
		id: "compSetDefault",
		parameterKey: "persistencyKey",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction(aFlexObjects, mPropertyBag) {
			return aFlexObjects.filter((oFlexObject) =>
				isSetDefaultChange(oFlexObject)
				&& String(oFlexObject.getSelector()?.persistencyKey) === mPropertyBag.persistencyKey
			);
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType && isSetDefaultChange(oUpdateInfo.updatedObject);
		}
	});

	/**
	 * Access to the variant management set default selector.
	 *
	 * @returns {object} The data selector for the variant set default changes
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.qunit
	 */
	CompVariantManagementState.getSetDefaultDataSelector = function() {
		return oSetDefaultDataSelector;
	};

	/**
	 * Returns the default variant ID for a given variant management
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {sap.ui.fl.apply._internal.flexObjects.CompVariant[]} mPropertyBag.variants - Array of variants which exist for the given variant management
	 *
	 * @returns {string | undefined} ID of the default variant
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariantManagementState.getDefaultVariantId = (mPropertyBag) => {
		const aVariants = mPropertyBag.variants;
		const aVariantIds = aVariants.map((oVariant) => oVariant.getVariantId());
		aVariantIds.push(CompVariant.STANDARD_VARIANT_ID);

		mPropertyBag.persistencyKey = String(mPropertyBag.persistencyKey);
		const aDefaultChanges = [...oSetDefaultDataSelector.get(mPropertyBag)].reverse();
		const aDefaultVariantIds = aDefaultChanges.map((oChange) => oChange.getContent().defaultVariantName);

		return aDefaultVariantIds.find((sDefaultVariantId) => aVariantIds.includes(sDefaultVariantId)) || "";
	};

	/**
	 * Returns the 'defaultVariant' changes for a given variant management
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.UpdatableChange[]} 'defaultVariant' changes of the variant management
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariantManagementState.getDefaultChanges = (mPropertyBag) => {
		mPropertyBag.persistencyKey = String(mPropertyBag.persistencyKey);
		return oSetDefaultDataSelector.get(mPropertyBag);
	};

	return CompVariantManagementState;
});