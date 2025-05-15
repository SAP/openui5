/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager"
], function(
	VariantManagementState,
	Settings,
	FlexObjectManager
) {
	"use strict";

	const ControlVariantWriteUtils = {};

	/**
	 * Deletes a control variant and its associated changes. This is only possible for USER layer variants
	 * and CUSTOMER layer variants which are part of a draft (not activated).
	 *
	 * @param {string} sReference - Flex reference
	 * @param {string} sVMReference - Variant management reference
	 * @param {string} sVariantReference - Variant reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} - Array of flex objects that were deleted
	 */
	ControlVariantWriteUtils.deleteVariant = function(sReference, sVMReference, sVariantReference) {
		// Deletion of variant-related objects is only supported for backends with condensing enabled
		if (!Settings.getInstanceOrUndef()?.getIsCondensingEnabled()) {
			return [];
		}

		const mPropertyBag = {
			reference: sReference,
			vmReference: sVMReference,
			vReference: sVariantReference
		};
		const aVMChanges = VariantManagementState.getVariantManagementChanges(mPropertyBag);
		const aControlChanges = VariantManagementState.getControlChangesForVariant({
			...mPropertyBag,
			includeReferencedChanges: false
		});
		const oVariant = VariantManagementState.getVariant(mPropertyBag).instance;
		const aVariantChanges = VariantManagementState.getVariantChangesForVariant(mPropertyBag);

		const aFlexObjectsToDelete = [oVariant, ...aVMChanges, ...aVariantChanges, ...aControlChanges];

		FlexObjectManager.deleteFlexObjects({
			reference: sReference,
			flexObjects: aFlexObjectsToDelete
		});

		return aFlexObjectsToDelete;
	};

	return ControlVariantWriteUtils;
});