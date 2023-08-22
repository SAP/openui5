/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	var Utils = {};

	Utils.getPersistencyKey = (oControl) => {
		if (oControl) {
			var oVMControl = oControl.getVariantManagement && oControl.getVariantManagement() || oControl;
			if (oVMControl.getPersonalizableControlPersistencyKey) {
				return oVMControl.getPersonalizableControlPersistencyKey();
			}
			return oVMControl.getPersistencyKey && oVMControl.getPersistencyKey();
		}
		return undefined;
	};

	/**
	* Retrieves the default variant ID for a variant map.
	*
	* @param {object} mCompVariantsMap Prepared map for compVariants
	* @returns {string} ID of the default variant
	*/
	Utils.getDefaultVariantId = (mCompVariantsMap) => {
		const aDefaultVariantChanges = mCompVariantsMap.defaultVariants;
		const oChange = aDefaultVariantChanges[aDefaultVariantChanges.length - 1];
		return oChange?.getContent().defaultVariantName || "";
	};

	return Utils;
});