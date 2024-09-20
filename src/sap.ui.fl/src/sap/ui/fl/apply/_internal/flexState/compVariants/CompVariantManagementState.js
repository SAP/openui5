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

	const sUIChangeNameSpace = "sap.ui.fl.apply._internal.flexObjects.UIChange";

	const isSetDefaultChange = (oFlexObject) => {
		return oFlexObject?.isA(sUIChangeNameSpace)
			&& oFlexObject.getFileType() === "change"
			&& oFlexObject.getChangeType() === "defaultVariant";
	};

	const oSetDefaultDataSelector = new DataSelector({
		id: "compSetDefault",
		parameterKey: "persistencyKey",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction(aFlexObjects, mPropertyBag) {
			return aFlexObjects.filter((oFlexObject) =>
				isSetDefaultChange(oFlexObject) && oFlexObject.getSelector().persistencyKey === mPropertyBag.persistencyKey
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
	 */
	CompVariantManagementState.getVariantManagementSetDefault = function() {
		return oSetDefaultDataSelector;
	};

	CompVariantManagementState.getDefaultVariantId = (mPropertyBag) => {
		const aVariants = mPropertyBag.variants;
		const aVariantIds = aVariants.map((oVariant) => oVariant.getId());
		aVariantIds.push(CompVariant.STANDARD_VARIANT_ID);

		const aDefaultChanges = oSetDefaultDataSelector.get(mPropertyBag).reverse();
		const aDefaultVariantIds = aDefaultChanges.map((oChange) => oChange.getContent().defaultVariantName);

		return aDefaultVariantIds.find((sDefaultVariantId) => aVariantIds.includes(sDefaultVariantId)) || "";
	};

	CompVariantManagementState.getDefaultChanges = (mPropertyBag) => {
		return oSetDefaultDataSelector.get(mPropertyBag);
	};

	return CompVariantManagementState;
});