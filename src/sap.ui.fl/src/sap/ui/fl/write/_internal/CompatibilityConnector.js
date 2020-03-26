/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/Storage"
], function(
	WriteStorage
) {
	"use strict";

	/**
	 * Adapts the existing @see sap.ui.fl.LrepConnector API to the new apply/write.Storage API
	 *
	 * @namespace sap.ui.fl.write._internal.CompatibilityConnector
	 * @since 1.71
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */


	var CompatibilityConnector = function() {};


	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.loadSettings
	 * @see sap.ui.fl.apply._internal.Storage.loadFlexData
	 * @returns {Promise} Returns a Promise with the settings response
	 */
	CompatibilityConnector.loadSettings = function() {
		return WriteStorage.loadFeatures();
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.create
	 * @see sap.ui.fl.write._internal.Storage.write
	 *
	 * @param {object} vFlexObjects - The content which is send to the server
	 * @param {string} [sChangelist] - The transport ID which will be handled internally, so there is no need to be passed
	 * @param {boolean} [bIsVariant] - Whether the data has file type .variant or not
	 * @param {boolean} [bDraft=false] - Indicates if changes should be written as a draft
	 * @returns {Promise} Resolve if successful, rejects with errors
	 */
	CompatibilityConnector.create = function(vFlexObjects, sChangelist, bIsVariant, bDraft) {
		var aFlexObjects = vFlexObjects;
		if (!Array.isArray(aFlexObjects)) {
			aFlexObjects = [vFlexObjects];
		}

		return WriteStorage.write({
			layer : aFlexObjects[0].layer,
			flexObjects : aFlexObjects,
			transport : sChangelist,
			isLegacyVariant : bIsVariant,
			draft : bDraft
		});
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.update
	 * @see sap.ui.fl.write._internal.Storage.update
	 *
	 * @param {object} oFlexObject Flex object to be updated
	 * @param {string} [sChangeList] The transport ID which will be handled internally, so there is no need to be passed
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.update = function(oFlexObject, sChangeList) {
		return WriteStorage.update({
			flexObject: oFlexObject,
			layer: oFlexObject.layer,
			transport: sChangeList
		});
	};


	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.deleteChange
	 * @see sap.ui.fl.write._internal.Storage.remove
	 *
	 * @param {object} oFlexObject Flex object to be deleted
	 * @param {string} [sChangeList] The transport ID which will be handled internally, so there is no need to be passed
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.deleteChange = function(oFlexObject, sChangeList) {
		return WriteStorage.remove({
			flexObject: oFlexObject,
			layer: oFlexObject.layer,
			transport: sChangeList
		});
	};

	/**
	 *
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.getFlexInfo
	 * @see sap.ui.fl.apply._internal.Storage.getFlexInfo
	 *
	 * @param {object} mPropertyBag Contains additional data needed for flex/info request
	 * @param {string} mPropertyBag.reference Name of Component
	 * @param {string} mPropertyBag.layer Layer on which the request is sent to the backend
	 * @param {string} [mPropertyBag.appVersion] Version of the application that is currently running
	 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
	 */
	CompatibilityConnector.getFlexInfo = function(mPropertyBag) {
		return WriteStorage.getFlexInfo(mPropertyBag);
	};

	/**
	 *
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.resetChanges
	 * @see sap.ui.fl.write._internal.Storage.reset
	 *
	 * @param {string} mParameters property bag
	 * @param {string} mParameters.reference Flex reference
	 * @param {string} mParameters.appVersion Version of the application for which the reset takes place
	 * @param {string} [mParameters.layer="USER"] Other possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER
	 * @param {string} mParameters.generator Generator with which the changes were created
	 * @param {string} mParameters.selectorIds Selector IDs of controls for which the reset should filter
	 * @param {string} mParameters.changeTypes Change types of the changes which should be reset
	 * @param {sap.ui.fl.Change[]} mParameters.changes Changes of the selected layer and flex reference
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.resetChanges = function(mParameters) {
		return WriteStorage.reset(mParameters);
	};

	return CompatibilityConnector;
}, true);
