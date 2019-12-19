/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/FakeLrepConnector"
], function(
	ApplyStorage,
	WriteStorage,
	FakeLrepConnector
) {
	"use strict";

	/**
	 * Checks if the FakeLrepConnector has a set function for the given name which should be called instead of the default
	 * functionality in the flow.
	 *
	 * @param sMethodName Name of the function in the FakeLrepConnector.prototype
	 * @returns {boolean} Flag if the method was overwritten
	 * @private
	 */
	function _isMethodOverwritten(sMethodName) {
		return !!FakeLrepConnector.prototype[sMethodName];
	}

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
	 * @param {string} [mPropertyBag.appName] Component name of the current application which may differ in case of an app variant
	 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.siteId] <code>sideId</code> that belongs to actual component
	 * @param {string} [mPropertyBag.cacheKey] Pre-calculated cache key of the component
	 * @returns {Promise} Returns a Promise with the changes response
	 */
	CompatibilityConnector.loadChanges = function(mComponent, mPropertyBag) {
		mPropertyBag = mPropertyBag || {};

		if (_isMethodOverwritten("loadChanges")) {
			return FakeLrepConnector.prototype.loadChanges(mComponent, mPropertyBag);
		}

		return ApplyStorage.loadFlexData({
			reference: mComponent.name,
			appVersion: mComponent.appVersion,
			componentName: mPropertyBag.appName,
			cacheKey: mPropertyBag.cacheKey,
			siteId: mPropertyBag.siteId,
			appDescriptor: mPropertyBag.appDescriptor
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
	CompatibilityConnector.loadSettings = function() {
		if (_isMethodOverwritten("loadSettings")) {
			return FakeLrepConnector.prototype.loadSettings();
		}
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
	CompatibilityConnector.create = function(vFlexObjects, sChangelist, bIsVariant) {
		if (_isMethodOverwritten("create")) {
			return FakeLrepConnector.prototype.create(vFlexObjects, sChangelist, bIsVariant);
		}

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
	CompatibilityConnector.update = function(oFlexObject, sChangeList) {
		if (_isMethodOverwritten("update")) {
			return FakeLrepConnector.prototype.update(oFlexObject, sChangeList);
		}

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
		if (_isMethodOverwritten("deleteChange")) {
			return FakeLrepConnector.prototype.deleteChange(oFlexObject, sChangeList);
		}

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
		if (_isMethodOverwritten("getFlexInfo")) {
			return FakeLrepConnector.prototype.getFlexInfo(mPropertyBag);
		}

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
		if (_isMethodOverwritten("resetChanges")) {
			return FakeLrepConnector.prototype.resetChanges(mParameters);
		}
		return WriteStorage.reset(mParameters);
	};

	return CompatibilityConnector;
}, true);
