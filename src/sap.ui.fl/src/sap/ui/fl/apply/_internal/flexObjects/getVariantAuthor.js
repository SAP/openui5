/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings"
], function(
	Lib,
	Layer,
	Settings
) {
	"use strict";

	/**
	 * Retrieves the full username by the ID of a variant author.
	 * In case the user herself is the author, a translated 'You' will be displayed or in case of developers, no exchange takes place.
	 *
	 * @function
	 * @since 1.121
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 * @alias module:sap/ui/fl/apply/_internal/flexState/compVariants/getVariantAuthor
	 *
	 * @param {sap.ui.fl.apply.flexObjects.Variant} oVariant - A variant object for which the Author should be retrieved
	 * @param {object} mMapIdsNames - Map of user IDs and users' names
	 * @returns {string} The resolved author of variant
	 */
	return (oVariant, mMapIdsNames) => {
		const sAuthor = oVariant.getSupportInformation().user || "";
		const oSettings = Settings.getInstanceOrUndef();

		if (oVariant.getLayer() === Layer.USER || sAuthor === oSettings?.getUserId()) {
			return Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
		}

		if (![Layer.PUBLIC, Layer.CUSTOMER].includes(oVariant.getLayer())) {
			return sAuthor;
		}

		return mMapIdsNames?.[sAuthor] || sAuthor;
	};
});