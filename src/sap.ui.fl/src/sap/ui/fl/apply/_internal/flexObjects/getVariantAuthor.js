/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/Layer"
], function(
	Lib,
	Settings,
	Layer
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
	 * @param {string} sUserId - UserId of variant author
	 * @param {sap.ui.fl.Layer} sLayer - Layer in which the variant should be stored
	 * @param {object} mMapIdsNames - Map of user IDs and users' names
	 * @returns {string} The resolved author of variant
	 */
	return (sUserId, sLayer, mMapIdsNames) => {
		const sAuthor = sUserId || "";
		const oSettings = Settings.getInstanceOrUndef();

		if (sLayer === Layer.USER || sAuthor === oSettings?.getUserId()) {
			return Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
		}

		if (![Layer.PUBLIC, Layer.CUSTOMER].includes(sLayer)) {
			return sAuthor;
		}

		return mMapIdsNames?.[sAuthor] || sAuthor;
	};
});