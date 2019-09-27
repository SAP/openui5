/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/write/_internal/Storage"
], function(
	ApplyStorage,
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
	 * @see sap.ui.fl.LrepConnector.prototype.loadChanges
	 * @see sap.ui.fl.apply._internal.Storage.loadFlexData
	 * @param {object} mComponent Contains component data needed for reading changes
	 * @param {string} mComponent.name Name of component
	 * @param {string} [mComponent.appVersion] Current running version of application
	 * @returns {Promise} Returns a Promise with the changes response
	 */
	CompatibilityConnector.prototype.loadChanges = function(mComponent) {
		return ApplyStorage.loadFlexData({
			reference: mComponent.name,
			appVersion: mComponent.appVersion
			//,cacheKey: "" //read from async hints
		}).then(function(mFlexData) {
			return {
				changes: mFlexData,
				loadModules: false
				//TODO check other return values build in LrepConnector.prototype._onChangeResponseReceived
			};
		});
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.loadSettings
	 * @see sap.ui.fl.apply._internal.Storage.loadFlexData
	 * @returns {Promise} Returns a Promise with the settings response
	 */
	CompatibilityConnector.prototype.loadSettings = function() {
		return WriteStorage.loadFeatures();
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.create
	 * @see sap.ui.fl.write._internal.Storage.write
	 *
	 * @param {object} vFlexObjects The content which is send to the server
	 * @param {string} [sChangelist] The transport ID which will be handled internally, so there is no need to be passed
	 * @param {boolean} [bIsVariant] Whether the data has file type .variant or not
	 * @returns {Promise} Resolve if successful, rejects with errors
	 */
	CompatibilityConnector.prototype.create = function(vFlexObjects, sChangelist, bIsVariant) {
		var aFlexObjects = vFlexObjects;
		if (!Array.isArray(aFlexObjects)) {
			aFlexObjects = [vFlexObjects];
		}
		return WriteStorage.write({
			layer : aFlexObjects[0].layer,
			flexObjects: aFlexObjects,
			_transport: sChangelist,
			isLegacyVariant: bIsVariant
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
	CompatibilityConnector.prototype.update = function(oFlexObject, sChangeList) {
		return WriteStorage.update({
			flexObject: oFlexObject,
			layer: oFlexObject.layer,
			_transport: sChangeList
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
	CompatibilityConnector.prototype.deleteChange = function(oFlexObject, sChangeList) {
		return WriteStorage.remove({
			flexObject: oFlexObject,
			layer: oFlexObject.layer,
			_transport: sChangeList
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
	 * @param {string} mPropertyBag.layer Layer on which the request is sent to the the backend
	 * @param {string} [mPropertyBag.appVersion] Version of the application that is currently running
	 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
	 */
	CompatibilityConnector.prototype.getFlexInfo = function(mParameters) {
		return WriteStorage.getFlexInfo(mParameters);
	};

	/**
	 *
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.resetChanges
	 * @see sap.ui.fl.write._internal.Storage.reset
	 *
	 * @param {string} mParameters property bag
	 * @param {string} mParameters.sReference Flex reference
	 * @param {string} mParameters.sAppVersion Version of the application for which the reset takes place
	 * @param {string} [mParameters.sLayer="USER"] Other possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER
	 * @param {string} mParameters.sChangelist The transport ID
	 * @param {string} mParameters.sGenerator Generator with which the changes were created
	 * @param {string} mParameters.aSelectorIds Selector IDs of controls for which the reset should filter
	 * @param {string} mParameters.aChangeTypes Change types of the changes which should be reset
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.prototype.resetChanges = function(mParameters) {
		return WriteStorage.reset({
			reference: mParameters.sReference,
			layer: mParameters.sLayer,
			appVersion: mParameters.sAppVersion,
			generator: mParameters.sGenerator,
			selectorIds: mParameters.aSelectorIds,
			changeTypes: mParameters.aChangeTypes
		});
	};

	return CompatibilityConnector;
}, true);
