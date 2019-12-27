/*
 * ! ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	var VariantsApplyUtil = {
		DEFAULT_AUTHOR: "SAP",

		VARIANT_TECHNICAL_PARAMETER: "sap-ui-fl-control-variant-id",

		compareVariants: function(oVariantData1, oVariantData2) {
			if (oVariantData1.content.content.title.toLowerCase() < oVariantData2.content.content.title.toLowerCase()) {
				return -1;
			} else if (oVariantData1.content.content.title.toLowerCase() > oVariantData2.content.content.title.toLowerCase()) {
				return 1;
			}
			return 0;
		},

		getIndexToSortVariant: function (aVariants, oVariantData) {
			var iSortedIndex = aVariants.length;
			aVariants.some(function (oExistingVariantData, index) {
				if (VariantsApplyUtil.compareVariants(oVariantData, oExistingVariantData) < 0) {
					iSortedIndex = index;
					return true;
				}
			});
			return iSortedIndex;
		}
	};
	return VariantsApplyUtil;
});