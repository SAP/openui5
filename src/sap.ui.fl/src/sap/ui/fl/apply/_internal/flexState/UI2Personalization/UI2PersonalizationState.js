/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/LrepConnector"
], function(
	FlexState,
	LrepConnector
) {
	"use strict";

	/**
	 * Handler class to UI2 Personalization
	 *
	 * @namespace sap.ui.fl.apply.api.apply._internal.flexState.UI2Personalization.UI2PersonalizationState
	 * @experimental Since 1.75
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

		return oUI2Personalization[sContainerKey].filter(function (oEntry) {
			return oEntry.itemName === sItemName;
		})[0];
	};

	/**
	 * Stores a personalization object for an application under a given key pair.
	 *
	 * @param {object} oPersonalization - Object with information about the personalization
	 * @param {string} oPersonalization.reference - Reference of the application for which the personalization should be stored
	 * @param {string} oPersonalization.containerKey - Key of the container in which the personalization should stored
	 * @param {string} oPersonalization.itemName - Name under which the personalization should be stored
	 * @param {string} oPersonalization.content - Personalization content to be stored
	 * @returns {Promise} Promise resolving with the object stored under the passed container key and item name,
	 * or undefined in case no entry was stored for these
	 */
	UI2PersonalizationState.setPersonalization = function(oPersonalization) {
		if (
			!oPersonalization
			|| !oPersonalization.reference
			|| !oPersonalization.containerKey
			|| !oPersonalization.itemName
			|| !oPersonalization.content
		) {
			return Promise.reject("not all mandatory properties were provided for the storage of the personalization");
		}

		return LrepConnector.createConnector().send("/sap/bc/lrep/ui2personalization/", "PUT", oPersonalization, {}).then(function(oPersonalization) {
			var oPersonalizationSubsection = FlexState.getUI2Personalization(oPersonalization.reference);
			oPersonalizationSubsection[oPersonalization.containerKey] = oPersonalizationSubsection[oPersonalization.containerKey] || [];
			oPersonalizationSubsection[oPersonalization.containerKey].push(oPersonalization);
		});
	};

	/**
	 * Deletes the personalization for a given reference
	 *
	 * @param {string} sReference - Reference of the application for which the personalization should be deleted
	 * @param {string} sContainerKey - Key of the container for which the personalization should be deleted
	 * @param {string} sItemName - Name under which the personalization should be deleted
	 * @returns {Promise} Promise resolving in case the deletion request was successful
	 */
	UI2PersonalizationState.deletePersonalization = function(sReference, sContainerKey, sItemName) {
		if (
			!sReference
			|| !sContainerKey
			|| !sItemName
		) {
			return Promise.reject("not all mandatory properties were provided for the storage of the personalization");
		}

		var sUrl = "/sap/bc/lrep/ui2personalization/?reference=" + sReference + "&containerkey=" + sContainerKey + "&itemname=" + sItemName;

		return LrepConnector.createConnector().send(sUrl, "DELETE", {}).then(function() {
			var aItems = UI2PersonalizationState.getPersonalization(sReference, sContainerKey);
			var oToBeDeletedItem = UI2PersonalizationState.getPersonalization(sReference, sContainerKey, sItemName);
			var nIndexOfItem = aItems.indexOf(oToBeDeletedItem);
			aItems.splice(nIndexOfItem, 1);
		});
	};

	return UI2PersonalizationState;
});