/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings"
], function(
	Lib,
	FlexState,
	ManifestUtils,
	Layer,
	LayerUtils,
	Settings
) {
	"use strict";

	function isPublicOrKeyuserVariantAvailable(aVariants) {
		return aVariants.some(function(oVariant) {
			return LayerUtils.isPublicOrCustomerLayer(oVariant.getLayer());
		});
	}

	function exchangeAuthorsNames(oControl, aVariants, mMapIdsNames, sCurrentUserId) {
		const aUpdatedVariantsIds = [];
		const setAuthorAndMarkVariantForUpdate = function(oVariant, sAuthor) {
			oVariant.setAuthor(sAuthor);
			aUpdatedVariantsIds.push(oVariant.getId());
		};
		aVariants.forEach(function(oVariant) {
			if (LayerUtils.isUserOrCustomerDependentLayer(oVariant.getLayer())) {
				const sUserId = oVariant.getOwnerId();
				const sYou = Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
				if (oVariant.getLayer() === Layer.USER || sUserId === sCurrentUserId) {
					setAuthorAndMarkVariantForUpdate(oVariant, sYou);
				} else if (LayerUtils.isPublicOrCustomerLayer(oVariant.getLayer()) && mMapIdsNames?.[sUserId]) {
					setAuthorAndMarkVariantForUpdate(oVariant, mMapIdsNames[sUserId]);
				}
			}
		});
		const oVMControl = (oControl.getVariantManagement?.()) || oControl;
		oVMControl.updateAuthors(aUpdatedVariantsIds);
	}

	/**
	 * Replace owner IDs by full user names for variants' authors.
	 *
	 * @function
	 * @since 1.121
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 * @alias module:sap/ui/fl/apply/_internal/flexState/compVariants/exchangeAuthorsNames
	 *
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
	 * 	sap.ui.comp.smartfilterbar.SmartFilterBar|
	 * 	sap.ui.comp.smarttable.SmartTable|
	 * 	sap.ui.comp.smartchart.SmartChart} oControl - Variant management control to exchange authors' names
	 * @param {sap.ui.fl.apply.flexObjects.CompVariant[]} aVariants - Variant data from other data providers like an OData service
	 *
	 */
	return async (oControl, aVariants) => {
		const oSettings = await Settings.getInstance();
		let mMapIdsNames;
		if (oSettings.isVariantAuthorNameAvailable() && isPublicOrKeyuserVariantAvailable(aVariants)) {
			mMapIdsNames = await FlexState.getVariantsAuthorsNames(ManifestUtils.getFlexReferenceForControl(oControl));
		}
		exchangeAuthorsNames(oControl, aVariants, mMapIdsNames, oSettings.getUserId());
	};
});