/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/util/Storage",
	"sap/ui/fl/write/_internal/fieldExtensibility/UriParser"
], function(
	Utils,
	Storage,
	UriParser
) {
	"use strict";

	/**
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.ServiceValidation
	 * @experimental Since 1.87.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var ServiceValidation = {};


	/**
	 * Local storage key
	 */
	var _sStorageKey = "sap.ui.fl.fieldExt.Access";

	/**
	 * Services return to a valid state if they are longer invalid than iValidityPeriod.
	 * This prevents storing more and more unused data.
	 */
	var _iValidityPeriod = 1 * 7 * 24 * 60 * 60 * 1000; // 1 Week in ms

	/**
	 * Returns the current timestamp in milliseconds.
	 *
	 * @private
	 * @return {int} Current timestamp in milliseconds
	 */
	 function _getCurrentTime() {
		return Date.now();
	}

	function _getLocalStorage() {
		return ServiceValidation.getLocalStorage();
	}

	/**
	 * Checks if the current browser supportes a local storage
	 *
	 * @private
	 * @return {boolean} true if the current browser supports a local storage
	 */
	function _isLocalStorageAvailable() {
		return _getLocalStorage() && _getLocalStorage().isSupported();
	}

	/**
	 * Reads a map of all outdated services from local storage
	 *
	 * @private
	 * @return {map} Map of all outdated services (possibly empty)
	 */
	function _getDataFromLocalStorage() {
		if (!_isLocalStorageAvailable()) {
			return {}; // If no local storage is available, we simulate an empty one
		}

		var sServiceData = _getLocalStorage().get(_sStorageKey);
		if (!sServiceData) {
			return {}; // No data available => return empty map
		}

		return JSON.parse(sServiceData);
	}

	/**
	 * Returns true if the given serviceItem is outdated
	 *
	 * @private
	 * @param  {map} [mServiceItem] serviceItem
	 * @return {boolean} True if the serviceItem is outdated
	 */
	function _isServiceExpired(mServiceItem) {
		return mServiceItem.expirationDate <= _getCurrentTime();
	}

	/**
	 * Returns a serviceItem from the local storage
	 *
	 * @private
	 * @param  {map} [mServiceItem] serviceItem
	 * @return {map} serviceItem from local storage or null if no serviceItem is available
	 */
	function _getServiceItem(mServiceItem) {
		return _getDataFromLocalStorage()[mServiceItem.serviceKey] || null;
	}

	/**
	 * Create a serviceItem from a given serviceInfo map.
	 *
	 * The serviceInfo map belongs to the public interface of this 'class'.
	 * ServiceItems are used to store outdated services in the local storage.
	 * A service item consists of a unique key per service and an expiration date.
	 *
	 * @private
	 * @param  {string|map} [mServiceInfo] serviceInfo Object or serviceUri
	 * @return {map} serviceItem
	 */
	function _createServiceItem(mServiceInfo) {
		var iExpirationDate = _getCurrentTime() + _iValidityPeriod;
		var mSystemInfo = _getSystemInfo();
		var parsedServiceInfo = _extractServiceInfo(mServiceInfo);

		return {
			serviceKey: mSystemInfo.getName() + mSystemInfo.getClient() + parsedServiceInfo.serviceName + parsedServiceInfo.serviceVersion,
			expirationDate: iExpirationDate
		};
	}

	/**
	 * Returns a map, that contains the service name and the service version.
	 *
	 * @private
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {map} serviceItem
	 */
	function _extractServiceInfo(vServiceInfo) {
		if (typeof vServiceInfo === "string") {
			return UriParser.parseServiceUri(vServiceInfo);
		}

		return vServiceInfo;
	}

	/**
	 * Returns true if information about the current backend system are available
	 *
	 * @private
	 * @return {boolean} true if system info is available
	 */
	function _isSystemInfoAvailable() {
		return _getSystemInfo();
	}

	/**
	 * Returns information about the current backend system
	 *
	 * @private
	 * @return {map}    System information
	 */
	function _getSystemInfo() {
		var oUshellContainer = Utils.getUshellContainer();
		return oUshellContainer && oUshellContainer.getLogonSystem();
	}

	/**
	 * Writes a map of all outdated services to the local storage
	 *
	 * @private
	 * @param  {map}  [mData] Map of all outdated services
	 * @return {void}
	 */
	function _setDataToLocalStorage(mData) {
		if (_isLocalStorageAvailable()) {
			_getLocalStorage().put(_sStorageKey, JSON.stringify(mData));
		}
	}


	 /**
	  * Returns a local storage instance. Allows <code>window.localStorage</code> to be stubbed in tests.
	  *
	  * @public
	  * @return {object} SapUI local storage object
	  */
	ServiceValidation.getLocalStorage = function() {
		return new Storage(Storage.Type.local);
	};

	/**
	 * Checks if a given service is stale
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {boolean}    returns true if the service is stale
	 */
	ServiceValidation.isServiceOutdated = function(vServiceInfo) {
		if (!_isSystemInfoAvailable()) {
			return false; // No system information available => All services are valid.
		}

		var mServiceItem = _getServiceItem(_createServiceItem(vServiceInfo));
		if (mServiceItem) {
			if (_isServiceExpired(mServiceItem)) {
				this.setServiceValid(vServiceInfo);
				return false;
			}
			return true;
		}
		return false;
	};

	/**
	 * Validates a given service. A valid service is not stale.
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {void}
	 */
	ServiceValidation.setServiceValid = function(vServiceInfo) {
		if (_isSystemInfoAvailable()) {
			var mData = _getDataFromLocalStorage();
			delete mData[_createServiceItem(vServiceInfo).serviceKey];
			_setDataToLocalStorage(mData);
		}
	};

	/**
	 * Invalidates a given service.
	 * Once a service has been validated or invalidation period is over the service becomes valid again
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {void}
	 */
	ServiceValidation.setServiceInvalid = function(vServiceInfo) {
		if (_isSystemInfoAvailable()) {
			var mData = _getDataFromLocalStorage();
			var mItem = _createServiceItem(vServiceInfo);
			mData[mItem.serviceKey] = mItem;
			_setDataToLocalStorage(mData);
		}
	};

	return ServiceValidation;
});