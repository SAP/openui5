/*
 * ! ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	return {
		DEFAULT_AUTHOR: "SAP",

		VARIANT_TECHNICAL_PARAMETER: "sap-ui-fl-control-variant-id",

		compareVariants: function(oVariantData1, oVariantData2) {
			if (oVariantData1.content.content.title.toLowerCase() < oVariantData2.content.content.title.toLowerCase()) {
				return -1;
			} else if (oVariantData1.content.content.title.toLowerCase() > oVariantData2.content.content.title.toLowerCase()) {
				return 1;
			}
			return 0;
		}
	};
}, true);