/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState"
], function(
	FlexState
) {
	"use strict";

	/**
	 * Handler class to UI2 Personalization
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.UI2Personalization.UI2PersonalizationState
	 * @since 1.75
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var UI2PersonalizationState = {};

	/**
	 * Retrieve a personalization object stored for an application under a given container ID and item name;
	 * in case no itemName is given all items for the given container key are returned.
	 *
	 * @param {string} sReference - Reference of the application for which the personalization should be retrieved
	 * @param {string} sContainerKey - Key of the container in which the personalization was stored
	 * @param {string} [sItemName] - Item name under which the personalization was stored
	 * @returns {object[]} Object stored under the passed container key and item name,
	 * or undefined in case no entry was stored for these;
	 * in case no sItemName was passed all entries known for the container key
	 */
	UI2PersonalizationState.getPersonalization = function(sReference, sContainerKey, sItemName) {
		var oUI2Personalization = FlexState.getUI2Personalization(sReference);
		if (!oUI2Personalization || !oUI2Personalization[sContainerKey]) {
			return sItemName ? undefined : [];
		}

		if (!sItemName) {
			return oUI2Personalization[sContainerKey];
		}

		return oUI2Personalization[sContainerKey].filter(function(oEntry) {
			return oEntry.itemName === sItemName;
		})[0];
	};

	return UI2PersonalizationState;
});