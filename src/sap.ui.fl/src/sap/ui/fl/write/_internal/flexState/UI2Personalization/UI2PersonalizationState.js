/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/write/_internal/connectors/LrepConnector"
], function(
	FlexState,
	UI2PersonalizationStateApply,
	LrepConnector
) {
	"use strict";

	/**
	 * Handler class to UI2 Personalization write functions
	 *
	 * @namespace sap.ui.fl.write._internal.flexState.UI2Personalization.UI2PersonalizationState
	 * @since 1.120
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const UI2PersonalizationState = {};

	/**
	 * Stores a personalization object for an application under a given key pair.
	 *
	 * @param {object} oPersonalization - Object with information about the personalization
	 * @param {string} oPersonalization.reference - Reference of the application for which the personalization should be stored
	 * @param {string} oPersonalization.containerKey - Key of the container in which the personalization should stored
	 * @param {string} oPersonalization.itemName - Name under which the personalization should be stored
	 * @param {string} oPersonalization.content - Personalization content to be stored
	 * @returns {Promise} Promise resolving if the object is stored successfully
	 */
	UI2PersonalizationState.setPersonalization = async function(oPersonalization) {
		if (
			!oPersonalization
			|| !oPersonalization.reference
			|| !oPersonalization.containerKey
			|| !oPersonalization.itemName
			|| !oPersonalization.content
		) {
			throw new Error("not all mandatory properties were provided for the storage of the personalization");
		}

		const oPersonalizationResult = await LrepConnector.ui2Personalization.create({
			flexObjects: oPersonalization
		});
		const oPersonalizationSubsection = FlexState.getUI2Personalization(oPersonalizationResult.response.reference);
		oPersonalizationSubsection[oPersonalizationResult.response.containerKey] ||= [];
		oPersonalizationSubsection[oPersonalizationResult.response.containerKey].push(oPersonalizationResult.response);
		FlexState.updateStorageResponse(oPersonalizationResult.response.reference, [{
			type: "ui2",
			newData: oPersonalizationSubsection
		}]);
	};

	/**
	 * Deletes the personalization for a given reference
	 *
	 * @param {string} sReference - Reference of the application for which the personalization should be deleted
	 * @param {string} sContainerKey - Key of the container for which the personalization should be deleted
	 * @param {string} sItemName - Name under which the personalization should be deleted
	 * @returns {Promise} Promise resolving in case the deletion request was successful
	 */
	UI2PersonalizationState.deletePersonalization = async function(sReference, sContainerKey, sItemName) {
		if (
			!sReference
			|| !sContainerKey
			|| !sItemName
		) {
			throw new Error("not all mandatory properties were provided for the storage of the personalization");
		}

		await LrepConnector.ui2Personalization.remove({
			reference: sReference,
			containerKey: sContainerKey,
			itemName: sItemName
		});
		const oUI2Personalization = FlexState.getUI2Personalization(sReference);
		const aItems = oUI2Personalization[sContainerKey];
		const oToBeDeletedItem = UI2PersonalizationStateApply.getPersonalization(sReference, sContainerKey, sItemName);
		const nIndexOfItem = aItems.indexOf(oToBeDeletedItem);
		aItems.splice(nIndexOfItem, 1);
		FlexState.updateStorageResponse(sReference, [{
			type: "ui2",
			newData: oUI2Personalization
		}]);
	};

	return UI2PersonalizationState;
});